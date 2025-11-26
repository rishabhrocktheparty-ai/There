/**
 * AI Response Controller
 * Handles API endpoints for AI response generation
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { aiResponseGeneratorService } from '../services/aiResponseGenerator';
import { logger } from '../services/logger';

// Validation schemas
const generateResponseSchema = z.object({
  relationshipId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

const streamResponseSchema = z.object({
  relationshipId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

/**
 * Generate AI response for user message
 * POST /api/ai/generate
 */
export const generateResponse = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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
    logger.info('Generating AI response', {
      userId,
      relationshipId,
      messageLength: message.length,
    });

    // Generate response
    const response = await aiResponseGeneratorService.generateResponse({
      relationshipId,
      userMessage: message,
      userId,
    });

    // Log AI response generation for audit trail
    logger.info('AI response generated', {
      userId,
      relationshipId,
      emotionalTone: response.emotionalTone,
      processingTime: response.metadata.processingTime,
      safetyCheckPassed: response.metadata.safetyCheck.isSafe,
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
  } catch (error) {
    logger.error('Error generating AI response', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get AI personality configuration for relationship
 * GET /api/ai/personality/:relationshipId
 */
export const getPersonality = async (req: Request, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user!.id;

    // TODO: Verify user owns this relationship

    // Get personality info
    const { aiPersonalityService } = await import('../services/aiPersonality');
    const { prisma } = await import('../services/prisma');

    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: { roleTemplate: true },
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    if (!relationship.roleTemplate) {
      return res.status(404).json({ error: 'Role template not found' });
    }

    const personality = aiPersonalityService.getPersonality(relationship.roleTemplate.type);

    res.json({
      success: true,
      data: {
        roleType: relationship.roleTemplate.type,
        personality: {
          name: personality?.name,
          description: personality?.description,
          traits: personality?.traits,
          preferredTopics: personality?.preferredTopics,
          communicationNotes: personality?.communicationNotes,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting personality', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to get personality',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get conversation emotional analysis
 * GET /api/ai/emotions/:relationshipId
 */
export const getEmotionalAnalysis = async (req: Request, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user!.id;

    const { conversationMemoryService } = await import('../services/conversationMemory');
    const { emotionalIntelligenceService } = await import('../services/emotionalIntelligence');

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
  } catch (error) {
    logger.error('Error analyzing emotions', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to analyze emotions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get conversation memory summary
 * GET /api/ai/memory/:relationshipId
 */
export const getMemorySummary = async (req: Request, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user!.id;

    const { conversationMemoryService } = await import('../services/conversationMemory');

    // Get memory summary
    const summary = await conversationMemoryService.generateMemorySummary(relationshipId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Error getting memory summary', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to get memory summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Mark a message as important
 * POST /api/ai/mark-important/:messageId
 */
export const markMessageImportant = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    const { conversationMemoryService } = await import('../services/conversationMemory');

    // Mark message as important
    await conversationMemoryService.markAsImportant(messageId);

    // Log message marking for audit trail
    logger.info('Message marked as important', {
      userId,
      messageId,
    });

    res.json({
      success: true,
      message: 'Message marked as important',
    });
  } catch (error) {
    logger.error('Error marking message important', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to mark message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Search conversation history
 * GET /api/ai/search/:relationshipId?q=query
 */
export const searchConversation = async (req: Request, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const { q: query, limit } = req.query;
    const userId = req.user!.id;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const { conversationMemoryService } = await import('../services/conversationMemory');

    // Search messages
    const messages = await conversationMemoryService.searchMessages(
      relationshipId,
      query,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: {
        query,
        results: messages,
        count: messages.length,
      },
    });
  } catch (error) {
    logger.error('Error searching conversation', { error, userId: req.user?.id });
    res.status(500).json({
      error: 'Failed to search conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Test AI safety filters
 * POST /api/ai/test-safety (admin only)
 */
export const testSafety = async (req: Request, res: Response) => {
  try {
    const { content, context } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    const { contentSafetyService } = await import('../services/contentSafety');

    const safetyCheck = contentSafetyService.checkContentSafety(
      content,
      context || 'user_input'
    );

    res.json({
      success: true,
      data: safetyCheck,
    });
  } catch (error) {
    logger.error('Error testing safety', { error });
    res.status(500).json({
      error: 'Failed to test safety',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
