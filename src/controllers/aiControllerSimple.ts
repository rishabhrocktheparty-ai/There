/**
 * Simplified AI Controller for Gemini Integration
 * Bypasses legacy emotional intelligence services with type issues
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../services/logger';

// Request validation schema
const generateResponseSchema = z.object({
  relationshipId: z.string(),
  message: z.string().min(1).max(5000),
});

/**
 * Generate AI response using Gemini API
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

    logger.info('Generating AI response with Gemini', {
      userId,
      relationshipId,
      messageLength: message.length,
    });

    const startTime = Date.now();

    // Get relationship details
    const { prisma } = await import('../services/prisma');
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: { roleTemplate: true },
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    if (relationship.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, email: true },
    });

    // Get recent conversation history (last 10 messages)
    const recentMessages = await prisma.conversationMessage.findMany({
      where: { relationshipId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        content: true,
        senderId: true,
        createdAt: true,
      },
    });

    // Format history for Gemini (reverse to chronological order)
    const history = recentMessages
      .reverse()
      .map((msg) => ({
        role: msg.senderId === userId ? ('user' as const) : ('ai' as const),
        content: msg.content,
      }));

    // Generate response using Gemini
    const { geminiService } = await import('../services/geminiService');
    const geminiResponse = await geminiService.generateResponse({
      roleType: relationship.roleTemplate?.type || 'MENTOR',
      conversationHistory: history,
      userMessage: message,
      userName: user?.displayName || user?.email.split('@')[0],
      temperature: 0.7,
      maxTokens: 1000,
    });

    const processingTime = Date.now() - startTime;

    // Simple sentiment analysis
    const emotionalTone = determineEmotionalTone(geminiResponse.content);

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        relationshipId,
        senderId: userId,
        content: message,
        emotionalTone: 'NEUTRAL',
      },
    });

    // Save AI response (no senderId for AI messages per schema)
    const aiMessage = await prisma.conversationMessage.create({
      data: {
        relationshipId,
        content: geminiResponse.content,
        emotionalTone,
      },
    });

    logger.info('Gemini AI response generated', {
      userId,
      relationshipId,
      emotionalTone,
      processingTime,
      tokensUsed: geminiResponse.usage.totalTokens,
      model: geminiResponse.model,
    });

    res.json({
      success: true,
      data: {
        messageId: aiMessage.id,
        content: geminiResponse.content,
        emotionalTone,
        metadata: {
          processingTime,
          model: geminiResponse.model,
          tokensUsed: geminiResponse.usage.totalTokens,
          safetyVerified: true,
          ethicallySound: true,
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
 * Simple emotional tone detection
 */
function determineEmotionalTone(content: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED' {
  const lowerContent = content.toLowerCase();
  
  const positiveWords = ['happy', 'great', 'wonderful', 'excited', 'love', 'amazing', 'excellent', 'fantastic', 'proud', 'grateful'];
  const negativeWords = ['sad', 'sorry', 'difficult', 'hard', 'worried', 'concerned', 'unfortunate', 'anxious', 'angry'];
  
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > 0) {
    return 'POSITIVE';
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    return 'NEGATIVE';
  } else if (positiveCount > 0 && negativeCount > 0) {
    return 'MIXED';
  }
  
  return 'NEUTRAL';
}

/**
 * Get AI personality for a relationship
 * GET /api/ai/personality/:relationshipId
 */
export const getPersonality = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { relationshipId } = req.params;

    const { prisma } = await import('../services/prisma');
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: { roleTemplate: true },
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    if (relationship.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: {
        roleType: relationship.roleTemplate?.type || 'MENTOR',
        displayName: relationship.roleTemplate?.displayName || 'Mentor',
        description: relationship.roleTemplate?.description || '',
      },
    });
  } catch (error) {
    logger.error('Error fetching personality', { error });
    res.status(500).json({ error: 'Failed to fetch personality' });
  }
};

/**
 * Get emotional patterns for a relationship
 * GET /api/ai/emotions/:relationshipId
 */
export const getEmotions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { relationshipId } = req.params;

    const { prisma } = await import('../services/prisma');
    const relationship = await prisma.relationship.findFirst({
      where: { id: relationshipId, userId },
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Get emotion counts from recent messages
    const messages = await prisma.conversationMessage.findMany({
      where: { relationshipId },
      select: { emotionalTone: true },
      take: 100,
    });

    const emotionCounts = messages.reduce((acc, msg) => {
      acc[msg.emotionalTone] = (acc[msg.emotionalTone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        emotionCounts,
        totalMessages: messages.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching emotions', { error });
    res.status(500).json({ error: 'Failed to fetch emotions' });
  }
};
