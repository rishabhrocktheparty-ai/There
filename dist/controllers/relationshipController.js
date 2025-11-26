"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchActiveRelationship = exports.getRelationshipActivity = exports.deleteRelationship = exports.updateRelationship = exports.createRelationship = exports.getRelationshipById = exports.getUserRelationships = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../servi-ces/prisma");
const logger_1 = require("../services/logger");
const createRelationshipSchema = zod_1.z.object({
    roleTemplateId: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
const updateRelationshipSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
/**
 * Get all relationships for authenticated user
 */
const getUserRelationships = async (req, res) => {
    try {
        const userId = req.user.id;
        const relationships = await prisma_1.prisma.relationship.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                roleTemplate: {
                    select: {
                        id: true,
                        key: true,
                        type: true,
                        displayName: true,
                        description: true,
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        // Get last message for each relationship
        const relationshipsWithLastMessage = await Promise.all(relationships.map(async (rel) => {
            const lastMessage = await prisma_1.prisma.conversationMessage.findFirst({
                where: {
                    relationshipId: rel.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    content: true,
                    createdAt: true,
                    emotionalTone: true,
                },
            });
            return {
                ...rel,
                messageCount: rel._count.messages,
                lastMessage,
            };
        }));
        res.json(relationshipsWithLastMessage);
    }
    catch (error) {
        logger_1.logger.error('Error fetching relationships:', error);
        res.status(500).json({ error: 'Failed to fetch relationships' });
    }
};
exports.getUserRelationships = getUserRelationships;
/**
 * Get single relationship by ID
 */
const getRelationshipById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const relationship = await prisma_1.prisma.relationship.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                roleTemplate: true,
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        });
        if (!relationship) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }
        // Get last message
        const lastMessage = await prisma_1.prisma.conversationMessage.findFirst({
            where: {
                relationshipId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Get activity metrics
        const activityMetrics = await prisma_1.prisma.growthMetric.findMany({
            where: {
                relationshipId: id,
            },
            orderBy: {
                bucketDate: 'desc',
            },
            take: 30, // Last 30 days
        });
        res.json({
            ...relationship,
            messageCount: relationship._count.messages,
            lastMessage,
            activityMetrics,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching relationship:', error);
        res.status(500).json({ error: 'Failed to fetch relationship' });
    }
};
exports.getRelationshipById = getRelationshipById;
/**
 * Create new relationship
 */
const createRelationship = async (req, res) => {
    try {
        const userId = req.user.id;
        const validated = createRelationshipSchema.parse(req.body);
        // Verify role template exists
        const roleTemplate = await prisma_1.prisma.roleTemplate.findUnique({
            where: { id: validated.roleTemplateId },
        });
        if (!roleTemplate) {
            res.status(404).json({ error: 'Role template not found' });
            return;
        }
        // Create relationship
        const relationship = await prisma_1.prisma.relationship.create({
            data: {
                userId,
                roleTemplateId: validated.roleTemplateId,
                title: validated.title || roleTemplate.displayName,
                metadata: validated.metadata || {},
                isActive: true,
            },
            include: {
                roleTemplate: true,
            },
        });
        // Log usage event
        await prisma_1.prisma.usageEvent.create({
            data: {
                userId,
                type: 'RELATIONSHIP_CREATED',
                metadata: {
                    relationshipId: relationship.id,
                    roleTemplateId: validated.roleTemplateId,
                },
            },
        });
        // Create audit log
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: 'CREATE',
                entityType: 'RELATIONSHIP',
                entityId: relationship.id,
                metadata: {
                    roleTemplateId: validated.roleTemplateId,
                    title: relationship.title,
                },
            },
        });
        logger_1.logger.info(`Relationship created: ${relationship.id} for user ${userId}`);
        res.status(201).json(relationship);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Invalid input', details: error.errors });
            return;
        }
        logger_1.logger.error('Error creating relationship:', error);
        res.status(500).json({ error: 'Failed to create relationship' });
    }
};
exports.createRelationship = createRelationship;
/**
 * Update relationship
 */
const updateRelationship = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const validated = updateRelationshipSchema.parse(req.body);
        // Verify ownership
        const existing = await prisma_1.prisma.relationship.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existing) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }
        // Update relationship
        const relationship = await prisma_1.prisma.relationship.update({
            where: { id },
            data: {
                ...validated,
                updatedAt: new Date(),
            },
            include: {
                roleTemplate: true,
            },
        });
        // Create audit log
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: 'UPDATE',
                entityType: 'RELATIONSHIP',
                entityId: id,
                metadata: validated,
            },
        });
        logger_1.logger.info(`Relationship updated: ${id} by user ${userId}`);
        res.json(relationship);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Invalid input', details: error.errors });
            return;
        }
        logger_1.logger.error('Error updating relationship:', error);
        res.status(500).json({ error: 'Failed to update relationship' });
    }
};
exports.updateRelationship = updateRelationship;
/**
 * Delete (deactivate) relationship
 */
const deleteRelationship = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Verify ownership
        const existing = await prisma_1.prisma.relationship.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existing) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }
        // Soft delete by setting isActive to false
        await prisma_1.prisma.relationship.update({
            where: { id },
            data: {
                isActive: false,
                updatedAt: new Date(),
            },
        });
        // Create audit log
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: 'DELETE',
                entityType: 'RELATIONSHIP',
                entityId: id,
            },
        });
        logger_1.logger.info(`Relationship deleted: ${id} by user ${userId}`);
        res.json({ message: 'Relationship deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error deleting relationship:', error);
        res.status(500).json({ error: 'Failed to delete relationship' });
    }
};
exports.deleteRelationship = deleteRelationship;
/**
 * Get relationship activity stats
 */
const getRelationshipActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { days = '30' } = req.query;
        // Verify ownership
        const relationship = await prisma_1.prisma.relationship.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!relationship) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }
        const daysCount = parseInt(days, 10);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysCount);
        // Get metrics for the period
        const metrics = await prisma_1.prisma.growthMetric.findMany({
            where: {
                relationshipId: id,
                bucketDate: {
                    gte: startDate,
                },
            },
            orderBy: {
                bucketDate: 'asc',
            },
        });
        // Get total message count
        const totalMessages = await prisma_1.prisma.conversationMessage.count({
            where: {
                relationshipId: id,
            },
        });
        // Get messages in the period
        const recentMessages = await prisma_1.prisma.conversationMessage.count({
            where: {
                relationshipId: id,
                createdAt: {
                    gte: startDate,
                },
            },
        });
        // Calculate emotional tone distribution
        const emotionalDistribution = await prisma_1.prisma.conversationMessage.groupBy({
            by: ['emotionalTone'],
            where: {
                relationshipId: id,
                createdAt: {
                    gte: startDate,
                },
            },
            _count: {
                emotionalTone: true,
            },
        });
        res.json({
            relationshipId: id,
            period: {
                days: daysCount,
                startDate,
            },
            totalMessages,
            recentMessages,
            dailyMetrics: metrics,
            emotionalDistribution,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching relationship activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
};
exports.getRelationshipActivity = getRelationshipActivity;
/**
 * Switch active relationship (mark as recently accessed)
 */
const switchActiveRelationship = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Verify ownership
        const relationship = await prisma_1.prisma.relationship.findFirst({
            where: {
                id,
                userId,
                isActive: true,
            },
            include: {
                roleTemplate: true,
            },
        });
        if (!relationship) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }
        // Update last accessed time
        await prisma_1.prisma.relationship.update({
            where: { id },
            data: {
                updatedAt: new Date(),
            },
        });
        res.json(relationship);
    }
    catch (error) {
        logger_1.logger.error('Error switching relationship:', error);
        res.status(500).json({ error: 'Failed to switch relationship' });
    }
};
exports.switchActiveRelationship = switchActiveRelationship;
