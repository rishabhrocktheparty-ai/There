"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = exports.auditLogs = exports.usageEvents = exports.avatarProfiles = exports.voiceProfiles = exports.conversationMessages = exports.userRelationships = exports.culturalParameters = exports.roleTemplates = exports.ethicalConfigVersions = exports.ethicalConfigs = void 0;
const uuid_1 = require("uuid");
exports.ethicalConfigs = [];
exports.ethicalConfigVersions = [];
exports.roleTemplates = [];
exports.culturalParameters = [];
exports.userRelationships = [];
exports.conversationMessages = [];
exports.voiceProfiles = [];
exports.avatarProfiles = [];
exports.usageEvents = [];
exports.auditLogs = [];
const createAuditLog = (entry) => {
    const log = {
        id: (0, uuid_1.v4)(),
        createdAt: new Date().toISOString(),
        ...entry,
    };
    exports.auditLogs.push(log);
    return log;
};
exports.createAuditLog = createAuditLog;
