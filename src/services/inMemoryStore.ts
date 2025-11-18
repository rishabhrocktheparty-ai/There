import { v4 as uuid } from 'uuid';
import {
  EthicalConfig,
  EthicalConfigVersion,
  RoleTemplate,
  CulturalParameter,
  UserRelationship,
  ConversationMessage,
  VoiceProfile,
  AvatarProfile,
  UsageEvent,
  AuditLogEntry,
} from '../models/domain';

export const ethicalConfigs: EthicalConfig[] = [];
export const ethicalConfigVersions: EthicalConfigVersion[] = [];
export const roleTemplates: RoleTemplate[] = [];
export const culturalParameters: CulturalParameter[] = [];
export const userRelationships: UserRelationship[] = [];
export const conversationMessages: ConversationMessage[] = [];
export const voiceProfiles: VoiceProfile[] = [];
export const avatarProfiles: AvatarProfile[] = [];
export const usageEvents: UsageEvent[] = [];
export const auditLogs: AuditLogEntry[] = [];

export const createAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'createdAt'>) => {
  const log: AuditLogEntry = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  auditLogs.push(log);
  return log;
};
