import axios from 'axios';

const API_BASE = '/api/profile';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  locale?: string;
  timezone?: string;
  preferences?: any;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
  voiceProfile?: {
    id: string;
    sampleUrl?: string;
    settings?: any;
  };
  avatarProfile?: {
    id: string;
    imageUrl?: string;
    settings?: any;
  };
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
  relationship?: RelationshipPreferences;
  accessibility?: AccessibilitySettings;
}

export interface NotificationSettings {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
  messageAlerts?: boolean;
  relationshipUpdates?: boolean;
  weeklyDigest?: boolean;
  dailyReminders?: boolean;
  achievementNotifications?: boolean;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'friends';
  showOnlineStatus?: boolean;
  allowDataCollection?: boolean;
  allowAnalytics?: boolean;
  shareUsageData?: boolean;
  allowPersonalization?: boolean;
}

export interface RelationshipPreferences {
  defaultRole?: string;
  autoSaveMessages?: boolean;
  messageRetentionDays?: number;
  culturalPreferences?: {
    region?: string;
    formalityLevel?: 'casual' | 'balanced' | 'formal';
    communicationStyle?: 'direct' | 'indirect' | 'balanced';
  };
}

export interface AccessibilitySettings {
  fontSize?: 'small' | 'medium' | 'large';
  highContrast?: boolean;
  reduceMotion?: boolean;
  screenReaderOptimized?: boolean;
}

export interface UsageStats {
  summary: {
    totalMessages: number;
    totalRelationships: number;
    activeRelationships: number;
    avgMessagesPerDay: number;
    timeRange: number;
  };
  emotionalDistribution: Array<{
    tone: string;
    count: number;
    percentage: number;
  }>;
  eventDistribution: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    metadata?: any;
    createdAt: string;
  }>;
  messagesPerDay: Array<{
    date: string;
    count: number;
  }>;
  relationshipGrowth: Array<{
    bucketDate: string;
    messagesCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
  }>;
}

class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await axios.get(`${API_BASE}/user/profile`);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    displayName?: string;
    locale?: string;
    timezone?: string;
  }): Promise<UserProfile> {
    const response = await axios.put(`${API_BASE}/user/profile`, data);
    return response.data;
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await axios.get(`${API_BASE}/user/preferences`);
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await axios.put(`${API_BASE}/user/preferences`, preferences);
    return response.data;
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await axios.get(`${API_BASE}/user/notifications`);
    return response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await axios.put(`${API_BASE}/user/notifications`, settings);
    return response.data;
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await axios.get(`${API_BASE}/user/privacy`);
    return response.data;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await axios.put(`${API_BASE}/user/privacy`, settings);
    return response.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(timeRange: number = 30): Promise<UsageStats> {
    const response = await axios.get(`${API_BASE}/user/usage-stats`, {
      params: { timeRange },
    });
    return response.data;
  }

  /**
   * Export user data
   */
  async exportUserData(): Promise<Blob> {
    const response = await axios.get(`${API_BASE}/user/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Delete account
   */
  async deleteAccount(confirmEmail: string): Promise<void> {
    await axios.delete(`${API_BASE}/user/account`, {
      data: { confirmEmail },
    });
  }
}

export const profileService = new ProfileService();
