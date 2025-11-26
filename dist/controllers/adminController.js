"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAdmin = exports.updateAdminRole = exports.getSystemHealth = exports.getUserFeedback = exports.getEmotionalConfig = exports.deleteRoleTemplate = exports.upsertRoleTemplate = exports.getRoleTemplates = exports.getUserMetrics = exports.getSystemAnalytics = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../services/prisma");
const logger_1 = require("../services/logger");
/**
 * Get system analytics and metrics
 */
const getSystemAnalytics = async (req, res) => {
    try {
        const { timeRange = '30' } = req.query;
        const days = parseInt(timeRange, 10);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Get comprehensive system metrics
        const [totalUsers, activeUsers, totalRelationships, totalMessages, totalAdmins, userGrowth, messagesByTone, usageByType, relationshipsByRole, recentAuditLogs,] = await Promise.all([
            // Total users
            prisma_1.prisma.user.count(),
            // Active users (with recent messages)
            prisma_1.prisma.user.count({
                where: {
                    sentMessages: {
                        some: {
                            createdAt: { gte: startDate },
                        },
                    },
                },
            }),
            // Total relationships
            prisma_1.prisma.relationship.count(),
            // Total messages
            prisma_1.prisma.conversationMessage.count({
                where: { createdAt: { gte: startDate } },
            }),
            // Total admins
            prisma_1.prisma.adminUser.count(),
            // User growth over time
            prisma_1.prisma.user.groupBy({
                by: ['createdAt'],
                _count: true,
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Messages by emotional tone
            prisma_1.prisma.conversationMessage.groupBy({
                by: ['emotionalTone'],
                _count: true,
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Usage events by type
            prisma_1.prisma.usageEvent.groupBy({
                by: ['type'],
                _count: true,
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Relationships by role template
            prisma_1.prisma.relationship.groupBy({
                by: ['roleTemplateId'],
                _count: true,
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Recent audit logs
            prisma_1.prisma.auditLog.findMany({
                take: 20,
                orderBy: { createdAt: 'desc' },
                include: {
                    actor: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    },
                },
            }),
        ]);
        // Calculate engagement metrics
        const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
        const avgMessagesPerUser = activeUsers > 0 ? totalMessages / activeUsers : 0;
        res.json({
            summary: {
                totalUsers,
                activeUsers,
                totalRelationships,
                totalMessages,
                totalAdmins,
                engagementRate: Math.round(engagementRate * 10) / 10,
                avgMessagesPerUser: Math.round(avgMessagesPerUser * 10) / 10,
                timeRange: days,
            },
            userGrowth: userGrowth.map((item) => ({
                date: item.createdAt,
                count: item._count,
            })),
            messagesByTone: messagesByTone.map((item) => ({
                tone: item.emotionalTone,
                count: item._count,
            })),
            usageByType: usageByType.map((item) => ({
                type: item.type,
                count: item._count,
            })),
            relationshipsByRole: relationshipsByRole.map((item) => ({
                roleId: item.roleTemplateId,
                count: item._count,
            })),
            recentAuditLogs,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching system analytics', { error });
        res.status(500).json({ error: 'Failed to fetch system analytics' });
    }
};
exports.getSystemAnalytics = getSystemAnalytics;
/**
 * Get user metrics and details
 */
const getUserMetrics = async (req, res) => {
    try {
        const { page = '1', limit = '20', search = '' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { displayName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        // Get users with metrics
        const [users, totalCount] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where: searchFilter,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    adminProfile: true,
                    _count: {
                        select: {
                            relationships: true,
                            sentMessages: true,
                            usageEvents: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.user.count({ where: searchFilter }),
        ]);
        res.json({
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                pages: Math.ceil(totalCount / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user metrics', { error });
        res.status(500).json({ error: 'Failed to fetch user metrics' });
    }
};
exports.getUserMetrics = getUserMetrics;
/**
 * Get role templates and statistics
 */
const getRoleTemplates = async (req, res) => {
    try {
        const templates = await prisma_1.prisma.roleTemplate.findMany({
            include: {
                _count: {
                    select: {
                        relationships: true,
                    },
                },
            },
            orderBy: { type: 'asc' },
        });
        res.json(templates);
    }
    catch (error) {
        logger_1.logger.error('Error fetching role templates', { error });
        res.status(500).json({ error: 'Failed to fetch role templates' });
    }
};
exports.getRoleTemplates = getRoleTemplates;
/**
 * Create or update role template
 */
const upsertRoleTemplate = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            id: zod_1.z.string().optional(),
            type: zod_1.z.enum(['FATHER', 'MOTHER', 'SIBLING', 'MENTOR', 'CUSTOM']),
            key: zod_1.z.string().min(1).max(50),
            displayName: zod_1.z.string().min(1).max(100),
            description: zod_1.z.string().optional(),
            defaultSettings: zod_1.z.record(zod_1.z.unknown()).optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const data = validation.data;
        const userId = req.user.id;
        let template;
        if (data.id) {
            // Update existing
            template = await prisma_1.prisma.roleTemplate.update({
                where: { id: data.id },
                data: {
                    type: data.type,
                    key: data.key,
                    displayName: data.displayName,
                    description: data.description,
                    defaultSettings: (data.defaultSettings || {}),
                },
            });
        }
        else {
            // Create new
            template = await prisma_1.prisma.roleTemplate.create({
                data: {
                    type: data.type,
                    key: data.key,
                    displayName: data.displayName,
                    description: data.description,
                    defaultSettings: (data.defaultSettings || {}),
                },
            });
        }
        // Log audit event
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: data.id ? 'UPDATE' : 'CREATE',
                entityType: 'ROLE_TEMPLATE',
                entityId: template.id,
                metadata: { changes: data },
            },
        });
        res.json(template);
    }
    catch (error) {
        logger_1.logger.error('Error upserting role template', { error });
        res.status(500).json({ error: 'Failed to save role template' });
    }
};
exports.upsertRoleTemplate = upsertRoleTemplate;
/**
 * Delete role template
 */
const deleteRoleTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if template is in use
        const usageCount = await prisma_1.prisma.relationship.count({
            where: { roleTemplateId: id },
        });
        if (usageCount > 0) {
            return res.status(400).json({
                error: `Cannot delete template. It is currently used by ${usageCount} relationship(s).`,
            });
        }
        await prisma_1.prisma.roleTemplate.delete({
            where: { id },
        });
        // Log audit event
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: 'DELETE',
                entityType: 'ROLE_TEMPLATE',
                entityId: id,
            },
        });
        res.json({ message: 'Role template deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error deleting role template', { error });
        res.status(500).json({ error: 'Failed to delete role template' });
    }
};
exports.deleteRoleTemplate = deleteRoleTemplate;
/**
 * Get emotional intelligence configuration
 */
const getEmotionalConfig = async (req, res) => {
    try {
        // Get message statistics by emotional tone
        const toneStats = await prisma_1.prisma.conversationMessage.groupBy({
            by: ['emotionalTone'],
            _count: true,
        });
        // Get growth metrics aggregated
        const growthMetrics = await prisma_1.prisma.growthMetric.findMany({
            take: 100,
            orderBy: { bucketDate: 'desc' },
            select: {
                bucketDate: true,
                messagesCount: true,
                positiveCount: true,
                neutralCount: true,
                negativeCount: true,
            },
        });
        // Calculate emotional trends
        const totalMessages = toneStats.reduce((sum, stat) => sum + stat._count, 0);
        const toneDistribution = toneStats.map((stat) => ({
            tone: stat.emotionalTone,
            count: stat._count,
            percentage: totalMessages > 0 ? (stat._count / totalMessages) * 100 : 0,
        }));
        res.json({
            toneDistribution,
            growthMetrics,
            totalMessages,
            availableTones: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'],
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching emotional config', { error });
        res.status(500).json({ error: 'Failed to fetch emotional configuration' });
    }
};
exports.getEmotionalConfig = getEmotionalConfig;
/**
 * Get user feedback and moderation items
 */
const getUserFeedback = async (req, res) => {
    try {
        const { page = '1', limit = '20', type = 'all' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        // For now, we'll use audit logs as feedback proxy
        // In production, you'd have a dedicated feedback table
        const typeFilter = type !== 'all'
            ? {
                action: type,
            }
            : {};
        const [logs, totalCount] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where: typeFilter,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    actor: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.auditLog.count({ where: typeFilter }),
        ]);
        res.json({
            feedback: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                pages: Math.ceil(totalCount / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user feedback', { error });
        res.status(500).json({ error: 'Failed to fetch user feedback' });
    }
};
exports.getUserFeedback = getUserFeedback;
/**
 * Get system health metrics
 */
const getSystemHealth = async (req, res) => {
    try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        // Check database connectivity
        let dbStatus = 'healthy';
        let dbLatency = 0;
        try {
            const startTime = Date.now();
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            dbLatency = Date.now() - startTime;
            if (dbLatency > 1000)
                dbStatus = 'degraded';
        }
        catch (error) {
            dbStatus = 'unhealthy';
        }
        // Get recent activity metrics
        const [recentMessages, recentUsers, recentErrors, systemMetrics,] = await Promise.all([
            prisma_1.prisma.conversationMessage.count({
                where: { createdAt: { gte: fiveMinutesAgo } },
            }),
            prisma_1.prisma.usageEvent.count({
                where: {
                    type: 'LOGIN',
                    createdAt: { gte: oneHourAgo },
                },
            }),
            prisma_1.prisma.auditLog.count({
                where: {
                    action: 'SYSTEM_EVENT',
                    createdAt: { gte: oneHourAgo },
                },
            }),
            prisma_1.prisma.systemMetric.findMany({
                take: 100,
                orderBy: { capturedAt: 'desc' },
            }),
        ]);
        // Calculate health score
        let healthScore = 100;
        if (dbStatus === 'degraded')
            healthScore -= 20;
        if (dbStatus === 'unhealthy')
            healthScore -= 50;
        if (recentMessages === 0 && recentUsers === 0)
            healthScore -= 10;
        if (recentErrors > 10)
            healthScore -= 20;
        const overallStatus = healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'degraded' : 'unhealthy';
        res.json({
            status: overallStatus,
            healthScore,
            timestamp: now,
            components: {
                database: {
                    status: dbStatus,
                    latency: dbLatency,
                    connected: dbStatus !== 'unhealthy',
                },
                api: {
                    status: 'healthy',
                    recentMessages,
                    recentUsers,
                },
                errors: {
                    count: recentErrors,
                    status: recentErrors > 10 ? 'warning' : 'healthy',
                },
            },
            metrics: systemMetrics,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching system health', { error });
        res.status(500).json({
            status: 'unhealthy',
            healthScore: 0,
            error: 'Failed to fetch system health',
        });
    }
};
exports.getSystemHealth = getSystemHealth;
/**
 * Update admin user role
 */
const updateAdminRole = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            userId: zod_1.z.string(),
            role: zod_1.z.enum(['SUPER_ADMIN', 'CONFIG_MANAGER', 'VIEWER']),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const { userId, role } = validation.data;
        const actorId = req.user.id;
        // Check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { adminProfile: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let adminProfile;
        if (user.adminProfile) {
            // Update existing admin profile
            adminProfile = await prisma_1.prisma.adminUser.update({
                where: { id: user.adminProfile.id },
                data: { role },
            });
        }
        else {
            // Create new admin profile
            adminProfile = await prisma_1.prisma.adminUser.create({
                data: {
                    userId,
                    role,
                },
            });
        }
        // Log audit event
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId,
                action: 'UPDATE',
                entityType: 'ADMIN',
                entityId: adminProfile.id,
                metadata: { newRole: role, userId },
            },
        });
        res.json(adminProfile);
    }
    catch (error) {
        logger_1.logger.error('Error updating admin role', { error });
        res.status(500).json({ error: 'Failed to update admin role' });
    }
};
exports.updateAdminRole = updateAdminRole;
/**
 * Remove admin privileges
 */
const removeAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const actorId = req.user.id;
        // Prevent self-removal
        if (userId === actorId) {
            return res.status(400).json({ error: 'Cannot remove your own admin privileges' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { adminProfile: true },
        });
        if (!user || !user.adminProfile) {
            return res.status(404).json({ error: 'Admin user not found' });
        }
        await prisma_1.prisma.adminUser.delete({
            where: { id: user.adminProfile.id },
        });
        // Log audit event
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId,
                action: 'DELETE',
                entityType: 'ADMIN',
                entityId: user.adminProfile.id,
                metadata: { userId },
            },
        });
        res.json({ message: 'Admin privileges removed successfully' });
    }
    catch (error) {
        logger_1.logger.error('Error removing admin', { error });
        res.status(500).json({ error: 'Failed to remove admin privileges' });
    }
};
exports.removeAdmin = removeAdmin;
