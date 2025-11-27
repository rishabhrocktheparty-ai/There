export interface Relationship {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  roleType: string;
  roleAvatar: string;
  roleDescription: string;
  status: RelationshipStatus;
  customization: RelationshipCustomization;
  stats: RelationshipStats;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionAt?: Date;
  archivedAt?: Date;
}

export type RelationshipStatus = 'active' | 'paused' | 'archived';

export interface RelationshipCustomization {
  nickname?: string;
  personalNotes?: string;
  reminderEnabled: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'monthly';
  notificationsEnabled: boolean;
  theme?: {
    primaryColor?: string;
    avatarStyle?: string;
  };
  preferences?: {
    responseStyle?: 'concise' | 'detailed' | 'balanced';
    emotionalTone?: 'supportive' | 'professional' | 'casual';
    topicFocus?: string[];
  };
}

export interface RelationshipStats {
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  lastMessageDate?: Date;
  streakDays: number;
  favoriteTopics: string[];
  emotionalTrend: string[];
  engagementScore: number;
}

export interface CreateRelationshipRequest {
  roleId: string;
  customization?: Partial<RelationshipCustomization>;
}

export interface UpdateRelationshipRequest {
  status?: RelationshipStatus;
  customization?: Partial<RelationshipCustomization>;
}

export interface RelationshipFilter {
  status?: RelationshipStatus | 'all';
  roleType?: string;
  searchTerm?: string;
  sortBy?: 'recent' | 'oldest' | 'most-active' | 'name';
}
