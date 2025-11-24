"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrivacySettings = exports.getPrivacySettings = exports.updateNotificationSettings = exports.getNotificationSettings = exports.deleteAccount = exports.exportUserData = exports.getUsageStats = exports.updatePreferences = exports.getPreferences = exports.updateProfile = exports.getProfile = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../services/prisma"));
const logger_1 = require("../services/logger");
// Validation schemas
const updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1).max(100).optional(),
    locale: zod_1.z.string().max(10).optional(),
    timezone: zod_1.z.string().max(50).optional(),
});
const updatePreferencesSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
    language: zod_1.z.string().optional(),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean().optional(),
        push: zod_1.z.boolean().optional(),
        inApp: zod_1.z.boolean().optional(),
        messageAlerts: zod_1.z.boolean().optional(),
        relationshipUpdates: zod_1.z.boolean().optional(),
        weeklyDigest: zod_1.z.boolean().optional(),
    }).optional(),
    privacy: zod_1.z.object({
        profileVisibility: zod_1.z.enum(['public', 'private', 'friends']).optional(),
        showOnlineStatus: zod_1.z.boolean().optional(),
        allowDataCollection: zod_1.z.boolean().optional(),
        allowAnalytics: zod_1.z.boolean().optional(),
    }).optional(),
    relationship: zod_1.z.object({
        defaultRole: zod_1.z.string().optional(),
        autoSaveMessages: zod_1.z.boolean().optional(),
        messageRetentionDays: zod_1.z.number().min(7).max(365).optional(),
        culturalPreferences: zod_1.z.object({
            region: zod_1.z.string().optional(),
            formalityLevel: zod_1.z.enum(['casual', 'balanced', 'formal']).optional(),
            communicationStyle: zod_1.z.enum(['direct', 'indirect', 'balanced']).optional(),
        }).optional(),
    }).optional(),
    accessibility: zod_1.z.object({
        fontSize: zod_1.z.enum(['small', 'medium', 'large']).optional(),
        highContrast: zod_1.z.boolean().optional(),
        reduceMotion: zod_1.z.boolean().optional(),
        screenReaderOptimized: zod_1.z.boolean().optional(),
    }).optional(),
});
const updateNotificationSettingsSchema = zod_1.z.object({
    email: zod_1.z.boolean().optional(),
    push: zod_1.z.boolean().optional(),
    inApp: zod_1.z.boolean().optional(),
    messageAlerts: zod_1.z.boolean().optional(),
    relationshipUpdates: zod_1.z.boolean().optional(),
    weeklyDigest: zod_1.z.boolean().optional(),
    dailyReminders: zod_1.z.boolean().optional(),
    achievementNotifications: zod_1.z.boolean().optional(),
});
const updatePrivacySettingsSchema = zod_1.z.object({
    profileVisibility: zod_1.z.enum(['public', 'private', 'friends']).optional(),
    showOnlineStatus: zod_1.z.boolean().optional(),
    allowDataCollection: zod_1.z.boolean().optional(),
    allowAnalytics: zod_1.z.boolean().optional(),
    shareUsageData: zod_1.z.boolean().optional(),
    allowPersonalization: zod_1.z.boolean().optional(),
});
/**
 * Get user profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                locale: true,
                timezone: true,
                preferences: true,
                authProvider: true,
                createdAt: true,
                updatedAt: true,
                voiceProfile: {
                    select: {
                        id: true,
                        imageUrl: true,
                        settings: true,
                    },
                },
                avatarProfile: {
                    select: {
                        id: true,
                        imageUrl: true,
                        settings: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        logger_1.logger.error('Error fetching profile', { error });
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const { displayName, locale, timezone } = validation.data;
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                displayName,
                locale,
                timezone,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                locale: true,
                timezone: true,
                updatedAt: true,
            },
        });
        // Log audit event
        await prisma_1.default.auditLog.create({
            data: {
                actorId: userId,
                action: 'UPDATE',
                entityType: 'USER',
                entityId: userId,
                metadata: { changes: validation.data },
            },
        });
        res.json(user);
    }
    catch (error) {
        logger_1.logger.error('Error updating profile', { error });
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
/**
 * Get user preferences
 */
const getPreferences = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                preferences: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Return default preferences if none exist
        const defaultPreferences = {
            theme: 'auto',
            language: 'en',
            notifications: {
                email: true,
                push: true,
                inApp: true,
                messageAlerts: true,
                relationshipUpdates: true,
                weeklyDigest: false,
            },
            privacy: {
                profileVisibility: 'private',
                showOnlineStatus: true,
                allowDataCollection: true,
                allowAnalytics: true,
            },
            relationship: {
                autoSaveMessages: true,
                messageRetentionDays: 90,
                culturalPreferences: {
                    formalityLevel: 'balanced',
                    communicationStyle: 'balanced',
                },
            },
            accessibility: {
                fontSize: 'medium',
                highContrast: false,
                reduceMotion: false,
                screenReaderOptimized: false,
            },
        };
        const preferences = user.preferences || defaultPreferences;
        res.json(preferences);
    }
    catch (error) {
        logger_1.logger.error('Error fetching preferences', { error });
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};
exports.getPreferences = getPreferences;
/**
 * Update user preferences
 */
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const validation = updatePreferencesSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        // Get current preferences
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        // Merge with new preferences
        const currentPreferences = currentUser?.preferences || {};
        const updatedPreferences = {
            ...currentPreferences,
            ...validation.data,
            notifications: {
                ...(currentPreferences.notifications || {}),
                ...(validation.data.notifications || {}),
            },
            privacy: {
                ...(currentPreferences.privacy || {}),
                ...(validation.data.privacy || {}),
            },
            relationship: {
                ...(currentPreferences.relationship || {}),
                ...(validation.data.relationship || {}),
            },
            accessibility: {
                ...(currentPreferences.accessibility || {}),
                ...(validation.data.accessibility || {}),
            },
        };
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                preferences: updatedPreferences,
                updatedAt: new Date(),
            },
            select: {
                preferences: true,
            },
        });
        // Log usage event
        await prisma_1.default.usageEvent.create({
            data: {
                userId,
                type: 'PROFILE_UPDATE',
                metadata: { section: 'preferences' },
            },
        });
        res.json(user.preferences);
    }
    catch (error) {
        logger_1.logger.error('Error updating preferences', { error });
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};
exports.updatePreferences = updatePreferences;
/**
 * Get usage statistics
 */
const getUsageStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { timeRange = '30' } = req.query;
        const days = parseInt(timeRange, 10);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Get various statistics
        const [totalMessages, totalRelationships, activeRelationships, usageEvents, messagesByTone, recentActivity, relationshipGrowth,] = await Promise.all([
            // Total messages sent
            prisma_1.default.conversationMessage.count({
                where: {
                    senderId: userId,
                    createdAt: { gte: startDate },
                },
            }),
            // Total relationships
            prisma_1.default.relationship.count({
                where: { userId },
            }),
            // Active relationships (with recent messages)
            prisma_1.default.relationship.count({
                where: {
                    userId,
                    messages: {
                        some: {
                            createdAt: { gte: startDate },
                        },
                    },
                },
            }),
            // Usage events
            prisma_1.default.usageEvent.groupBy({
                by: ['type'],
                where: {
                    userId,
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            // Messages by emotional tone
            prisma_1.default.conversationMessage.groupBy({
                by: ['emotionalTone'],
                where: {
                    senderId: userId,
                    createdAt: { gte: startDate },
                },
                _count: true,
            }),
            // Recent activity
            prisma_1.default.usageEvent.findMany({
                where: {
                    userId,
                    createdAt: { gte: startDate },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    type: true,
                    metadata: true,
                    createdAt: true,
                },
            }),
            // Relationship growth metrics
            prisma_1.default.growthMetric.findMany({
                where: {
                    relationship: {
                        userId,
                    },
                    bucketDate: { gte: startDate },
                },
                orderBy: { bucketDate: 'asc' },
                select: {
                    bucketDate: true,
                    messagesCount: true,
                    positiveCount: true,
                    neutralCount: true,
                    negativeCount: true,
                },
            }),
        ]);
        // Calculate daily averages
        const daysActive = Math.max(1, days);
        const avgMessagesPerDay = totalMessages / daysActive;
        const avgRelationshipsActive = activeRelationships;
        // Format emotional tone distribution
        const emotionalDistribution = messagesByTone.map((item) => ({
            tone: item.emotionalTone,
            count: item._count,
            percentage: totalMessages > 0 ? (item._count / totalMessages) * 100 : 0,
        }));
        // Format usage events
        const eventDistribution = usageEvents.map((item) => ({
            type: item.type,
            count: item._count,
        }));
        // Calculate streaks
        const messagesPerDay = relationshipGrowth.map((metric) => ({
            date: metric.bucketDate,
            count: metric.messagesCount,
        }));
        res.json({
            summary: {
                totalMessages,
                totalRelationships,
                activeRelationships,
                avgMessagesPerDay: Math.round(avgMessagesPerDay * 10) / 10,
                timeRange: days,
            },
            emotionalDistribution,
            eventDistribution,
            recentActivity,
            messagesPerDay,
            relationshipGrowth,
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching usage stats', { error });
        res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
};
exports.getUsageStats = getUsageStats;
/**
 * Export user data (GDPR compliance)
 */
const exportUserData = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Fetch all user data
        const userData = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                relationships: {
                    include: {
                        messages: true,
                        roleTemplate: true,
                    },
                },
                voiceProfile: {
                    include: {
                        samples: true,
                    },
                },
                avatarProfile: {
                    include: {
                        assets: true,
                    },
                },
                uploads: true,
                usageEvents: true,
                auditLogs: true,
            },
        });
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Log export event
        await prisma_1.default.auditLog.create({
            data: {
                actorId: userId,
                action: 'EXPORT',
                entityType: 'USER',
                entityId: userId,
                metadata: { exportDate: new Date() },
            },
        });
        // Return data as JSON
        res.json({
            exportDate: new Date(),
            userData,
        });
    }
    catch (error) {
        logger_1.logger.error('Error exporting user data', { error });
        res.status(500).json({ error: 'Failed to export user data' });
    }
};
exports.exportUserData = exportUserData;
/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { confirmEmail } = req.body;
        // Verify email confirmation
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (!user || user.email !== confirmEmail) {
            return res.status(400).json({ error: 'Email confirmation does not match' });
        }
        // Log deletion before deleting
        await prisma_1.default.auditLog.create({
            data: {
                actorId: userId,
                action: 'DELETE',
                entityType: 'USER',
                entityId: userId,
                metadata: { deletionDate: new Date() },
            },
        });
        // Delete user and all related data (cascading)
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        res.json({ message: 'Account successfully deleted' });
    }
    catch (error) {
        logger_1.logger.error('Error deleting account', { error });
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
exports.deleteAccount = deleteAccount;
/**
 * Get notification settings
 */
const getNotificationSettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const preferences = user?.preferences || {};
        const notifications = preferences.notifications || {
            email: true,
            push: true,
            inApp: true,
            messageAlerts: true,
            relationshipUpdates: true,
            weeklyDigest: false,
        };
        res.json(notifications);
    }
    catch (error) {
        logger_1.logger.error('Error fetching notification settings', { error });
        res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
};
exports.getNotificationSettings = getNotificationSettings;
/**
 * Update notification settings
 */
const updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const validation = updateNotificationSettingsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const currentPreferences = currentUser?.preferences || {};
        const updatedPreferences = {
            ...currentPreferences,
            notifications: {
                ...(currentPreferences.notifications || {}),
                ...validation.data,
            },
        };
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { preferences: updatedPreferences },
        });
        res.json(updatedPreferences.notifications);
    }
    catch (error) {
        logger_1.logger.error('Error updating notification settings', { error });
        res.status(500).json({ error: 'Failed to update notification settings' });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
/**
 * Get privacy settings
 */
const getPrivacySettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const preferences = user?.preferences || {};
        const privacy = preferences.privacy || {
            profileVisibility: 'private',
            showOnlineStatus: true,
            allowDataCollection: true,
            allowAnalytics: true,
        };
        res.json(privacy);
    }
    catch (error) {
        logger_1.logger.error('Error fetching privacy settings', { error });
        res.status(500).json({ error: 'Failed to fetch privacy settings' });
    }
};
exports.getPrivacySettings = getPrivacySettings;
/**
 * Update privacy settings
 */
const updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const validation = updatePrivacySettingsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const currentPreferences = currentUser?.preferences || {};
        const updatedPreferences = {
            ...currentPreferences,
            privacy: {
                ...(currentPreferences.privacy || {}),
                ...validation.data,
            },
        };
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { preferences: updatedPreferences },
        });
        res.json(updatedPreferences.privacy);
    }
    catch (error) {
        logger_1.logger.error('Error updating privacy settings', { error });
        res.status(500).json({ error: 'Failed to update privacy settings' });
    }
};
exports.updatePrivacySettings = updatePrivacySettings;
