import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { logger } from '../services/logger';
import { AuthedRequest } from '../middleware/authMiddleware';

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
    messageAlerts: z.boolean().optional(),
    relationshipUpdates: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showOnlineStatus: z.boolean().optional(),
    allowDataCollection: z.boolean().optional(),
    allowAnalytics: z.boolean().optional(),
  }).optional(),
  relationship: z.object({
    defaultRole: z.string().optional(),
    autoSaveMessages: z.boolean().optional(),
    messageRetentionDays: z.number().min(7).max(365).optional(),
    culturalPreferences: z.object({
      region: z.string().optional(),
      formalityLevel: z.enum(['casual', 'balanced', 'formal']).optional(),
      communicationStyle: z.enum(['direct', 'indirect', 'balanced']).optional(),
    }).optional(),
  }).optional(),
  accessibility: z.object({
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    highContrast: z.boolean().optional(),
    reduceMotion: z.boolean().optional(),
    screenReaderOptimized: z.boolean().optional(),
  }).optional(),
});

const updateNotificationSettingsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
  messageAlerts: z.boolean().optional(),
  relationshipUpdates: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  dailyReminders: z.boolean().optional(),
  achievementNotifications: z.boolean().optional(),
});

const updatePrivacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
  showOnlineStatus: z.boolean().optional(),
  allowDataCollection: z.boolean().optional(),
  allowAnalytics: z.boolean().optional(),
  shareUsageData: z.boolean().optional(),
  allowPersonalization: z.boolean().optional(),
});

/**
 * Get user profile
 */
export const getProfile = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
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
            sampleUrl: true,
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
  } catch (error) {
    logger.error('Error fetching profile', { error });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthedRequest, res: Response) => {
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

    const user = await prisma.user.update({
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
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: userId,
        metadata: { changes: validation.data },
      },
    });

    res.json(user);
  } catch (error) {
    logger.error('Error updating profile', { error });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get user preferences
 */
export const getPreferences = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    logger.error('Error fetching preferences', { error });
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

/**
 * Update user preferences
 */
export const updatePreferences = async (req: AuthedRequest, res: Response) => {
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
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    // Merge with new preferences
    const currentPreferences = (currentUser?.preferences as any) || {};
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

    const user = await prisma.user.update({
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
    await prisma.usageEvent.create({
      data: {
        userId,
        type: 'PROFILE_UPDATE',
        metadata: { section: 'preferences' },
      },
    });

    res.json(user.preferences);
  } catch (error) {
    logger.error('Error updating preferences', { error });
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

/**
 * Get usage statistics
 */
export const getUsageStats = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { timeRange = '30' } = req.query;
    const days = parseInt(timeRange as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get various statistics
    const [
      totalMessages,
      totalRelationships,
      activeRelationships,
      usageEvents,
      messagesByTone,
      recentActivity,
      relationshipGrowth,
    ] = await Promise.all([
      // Total messages sent
      prisma.conversationMessage.count({
        where: {
          senderId: userId,
          createdAt: { gte: startDate },
        },
      }),

      // Total relationships
      prisma.relationship.count({
        where: { userId },
      }),

      // Active relationships (with recent messages)
      prisma.relationship.count({
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
      prisma.usageEvent.groupBy({
        by: ['type'],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Messages by emotional tone
      prisma.conversationMessage.groupBy({
        by: ['emotionalTone'],
        where: {
          senderId: userId,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Recent activity
      prisma.usageEvent.findMany({
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
      prisma.growthMetric.findMany({
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
    const emotionalDistribution = messagesByTone.map((item: any) => ({
      tone: item.emotionalTone,
      count: item._count,
      percentage: totalMessages > 0 ? (item._count / totalMessages) * 100 : 0,
    }));

    // Format usage events
    const eventDistribution = usageEvents.map((item: any) => ({
      type: item.type,
      count: item._count,
    }));

    // Calculate streaks
    const messagesPerDay = relationshipGrowth.map((metric: any) => ({
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
  } catch (error) {
    logger.error('Error fetching usage stats', { error });
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
};

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch all user data
    const userData = await prisma.user.findUnique({
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
    await prisma.auditLog.create({
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
  } catch (error) {
    logger.error('Error exporting user data', { error });
    res.status(500).json({ error: 'Failed to export user data' });
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { confirmEmail } = req.body;

    // Verify email confirmation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || user.email !== confirmEmail) {
      return res.status(400).json({ error: 'Email confirmation does not match' });
    }

    // Log deletion before deleting
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'DELETE',
        entityType: 'USER',
        entityId: userId,
        metadata: { deletionDate: new Date() },
      },
    });

    // Delete user and all related data (cascading)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Account successfully deleted' });
  } catch (error) {
    logger.error('Error deleting account', { error });
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferences = (user?.preferences as any) || {};
    const notifications = preferences.notifications || {
      email: true,
      push: true,
      inApp: true,
      messageAlerts: true,
      relationshipUpdates: true,
      weeklyDigest: false,
    };

    res.json(notifications);
  } catch (error) {
    logger.error('Error fetching notification settings', { error });
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = updateNotificationSettingsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const currentPreferences = (currentUser?.preferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...(currentPreferences.notifications || {}),
        ...validation.data,
      },
    };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
    });

    res.json(updatedPreferences.notifications);
  } catch (error) {
    logger.error('Error updating notification settings', { error });
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
};

/**
 * Get privacy settings
 */
export const getPrivacySettings = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferences = (user?.preferences as any) || {};
    const privacy = preferences.privacy || {
      profileVisibility: 'private',
      showOnlineStatus: true,
      allowDataCollection: true,
      allowAnalytics: true,
    };

    res.json(privacy);
  } catch (error) {
    logger.error('Error fetching privacy settings', { error });
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = updatePrivacySettingsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const currentPreferences = (currentUser?.preferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      privacy: {
        ...(currentPreferences.privacy || {}),
        ...validation.data,
      },
    };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
    });

    res.json(updatedPreferences.privacy);
  } catch (error) {
    logger.error('Error updating privacy settings', { error });
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
};
