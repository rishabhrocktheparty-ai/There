"use strict";
/**
 * AI Response Controller
 * Handles API endpoints for AI response generation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSafety = exports.searchConversation = exports.markMessageImportant = exports.getMemorySummary = exports.getEmotionalAnalysis = exports.getPersonality = exports.generateResponse = void 0;
const zod_1 = require("zod");
const aiResponseGenerator_1 = require("../services/aiResponseGenerator");
const logger_1 = require("../services/logger");
const logger_2 = require("../services/logger");
// Validation schemas
const generateResponseSchema = zod_1.z.object({
    relationshipId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1).max(2000),
});
const streamResponseSchema = zod_1.z.object({
    relationshipId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1).max(2000),
});
/**
 * Generate AI response for user message
 * POST /api/ai/generate
 */
const generateResponse = async (req, res) => {
    try {
        const userId = req.user.id;
        // Validate request
        const validation = generateResponseSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.issues,
            });
        }
        const { relationshipId, message } = validation.data;
        // Log request
        logger_1.logger.info('Generating AI response', {
            userId,
            relationshipId,
            messageLength: message.length,
        });
        // Generate response
        const response = await aiResponseGenerator_1.aiResponseGeneratorService.generateResponse({
            relationshipId,
            userMessage: message,
            userId,
        });
        // Log audit event
        await (0, logger_2.logAuditEvent)({
            userId,
            action: 'AI_RESPONSE_GENERATED',
            resourceType: 'AI_MESSAGE',
            resourceId: relationshipId,
            details: {
                emotionalTone: response.emotionalTone,
                processingTime: response.metadata.processingTime,
                safetyCheckPassed: response.metadata.safetyCheck.isSafe,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.json({
            success: true,
            data: {
                content: response.content,
                emotionalTone: response.emotionalTone,
                metadata: {
                    processingTime: response.metadata.processingTime,
                    safetyVerified: response.metadata.safetyCheck.isSafe,
                    ethicallySound: response.metadata.ethicalCheck.ethicallySound,
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating AI response', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to generate response',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.generateResponse = generateResponse;
/**
 * Get AI personality configuration for relationship
 * GET /api/ai/personality/:relationshipId
 */
const getPersonality = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const userId = req.user.id;
        // TODO: Verify user owns this relationship
        // Get personality info
        const { aiPersonalityService } = await Promise.resolve().then(() => __importStar(require('../services/aiPersonality')));
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../services/prisma')));
        const relationship = await prisma.relationship.findUnique({
            where: { id: relationshipId },
            include: { roleTemplate: true },
        });
        if (!relationship) {
            return res.status(404).json({ error: 'Relationship not found' });
        }
        const personality = aiPersonalityService.getPersonality(relationship.roleTemplate.roleType);
        res.json({
            success: true,
            data: {
                roleType: relationship.roleTemplate.roleType,
                personality: {
                    name: personality?.name,
                    description: personality?.description,
                    traits: personality?.traits,
                    preferredTopics: personality?.preferredTopics,
                    communicationNotes: personality?.communicationNotes,
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting personality', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to get personality',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getPersonality = getPersonality;
/**
 * Get conversation emotional analysis
 * GET /api/ai/emotions/:relationshipId
 */
const getEmotionalAnalysis = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const userId = req.user.id;
        const { conversationMemoryService } = await Promise.resolve().then(() => __importStar(require('../services/conversationMemory')));
        const { emotionalIntelligenceService } = await Promise.resolve().then(() => __importStar(require('../services/emotionalIntelligence')));
        // Get conversation context
        const context = await conversationMemoryService.getConversationContext(relationshipId);
        // Analyze emotions
        const recentEmotions = context.recentMessages.map((m) => m.emotionalTone);
        const emotionalState = emotionalIntelligenceService.analyzeConversationEmotions(recentEmotions);
        res.json({
            success: true,
            data: {
                emotionalTrend: emotionalState.emotionalTrend,
                conversationMood: emotionalState.conversationMood,
                emotionalStability: emotionalState.emotionalStability,
                needsSupport: emotionalState.needsSupport,
                recentEmotions: emotionalState.recentEmotions,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error analyzing emotions', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to analyze emotions',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getEmotionalAnalysis = getEmotionalAnalysis;
/**
 * Get conversation memory summary
 * GET /api/ai/memory/:relationshipId
 */
const getMemorySummary = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const userId = req.user.id;
        const { conversationMemoryService } = await Promise.resolve().then(() => __importStar(require('../services/conversationMemory')));
        // Get memory summary
        const summary = await conversationMemoryService.generateMemorySummary(relationshipId);
        res.json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting memory summary', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to get memory summary',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getMemorySummary = getMemorySummary;
/**
 * Mark a message as important
 * POST /api/ai/mark-important/:messageId
 */
const markMessageImportant = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        const { conversationMemoryService } = await Promise.resolve().then(() => __importStar(require('../services/conversationMemory')));
        // Mark message as important
        await conversationMemoryService.markAsImportant(messageId);
        await (0, logger_2.logAuditEvent)({
            userId,
            action: 'MESSAGE_MARKED_IMPORTANT',
            resourceType: 'MESSAGE',
            resourceId: messageId,
            details: {},
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.json({
            success: true,
            message: 'Message marked as important',
        });
    }
    catch (error) {
        logger_1.logger.error('Error marking message important', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to mark message',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.markMessageImportant = markMessageImportant;
/**
 * Search conversation history
 * GET /api/ai/search/:relationshipId?q=query
 */
const searchConversation = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const { q: query, limit } = req.query;
        const userId = req.user.id;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query parameter required' });
        }
        const { conversationMemoryService } = await Promise.resolve().then(() => __importStar(require('../services/conversationMemory')));
        // Search messages
        const messages = await conversationMemoryService.searchMessages(relationshipId, query, limit ? parseInt(limit) : 10);
        res.json({
            success: true,
            data: {
                query,
                results: messages,
                count: messages.length,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error searching conversation', { error, userId: req.user?.id });
        res.status(500).json({
            error: 'Failed to search conversation',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.searchConversation = searchConversation;
/**
 * Test AI safety filters
 * POST /api/ai/test-safety (admin only)
 */
const testSafety = async (req, res) => {
    try {
        const { content, context } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content required' });
        }
        const { contentSafetyService } = await Promise.resolve().then(() => __importStar(require('../services/contentSafety')));
        const safetyCheck = contentSafetyService.checkContentSafety(content, context || 'user_input');
        res.json({
            success: true,
            data: safetyCheck,
        });
    }
    catch (error) {
        logger_1.logger.error('Error testing safety', { error });
        res.status(500).json({
            error: 'Failed to test safety',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.testSafety = testSafety;
