export interface EthicalConfigVersion {
  id: string;
  configId: string;
  version: number;
  data: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}

export interface EthicalConfig {
  id: string;
  name: string;
  description?: string;
  latestVersion: number;
}

export type RoleTemplateType = 'father' | 'mother' | 'sibling' | 'mentor';

export interface RoleTemplate {
  id: string;
  type: RoleTemplateType;
  displayName: string;
  description?: string;
  defaultSettings: Record<string, unknown>;
}

export interface CulturalParameter {
  id: string;
  region: string;
  settings: Record<string, unknown>;
}

export interface UserRelationship {
  id: string;
  userId: string;
  counterpartUserId: string;
  roleTemplateId: string;
}

export interface ConversationMessage {
  id: string;
  relationshipId: string;
  senderId: string;
  content: string;
  emotionalTone: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface VoiceProfile {
  id: string;
  userId: string;
  sampleUrl?: string;
  settings: Record<string, unknown>;
}

export interface AvatarProfile {
  id: string;
  userId: string;
  imageUrl?: string;
  settings: Record<string, unknown>;
}

export interface UsageEvent {
  id: string;
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
