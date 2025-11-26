/**
 * Conversation Memory Service
 * Manages conversation history, context retrieval, and important moments
 */

import { prisma } from './prisma';
import { EmotionalTone } from '@prisma/client';

export interface ConversationMessage {
  id: string;
  content: string;
  senderId: string;
  isAI: boolean;
  emotionalTone: EmotionalTone;
  createdAt: Date;
  metadata?: any;
}

export interface ConversationContext {
  recentMessages: ConversationMessage[];
  importantMoments: ConversationMessage[];
  relationshipDuration: number; // days
  totalMessages: number;
  conversationThemes: string[];
  userPreferences: Record<string, any>;
  lastInteractionDate?: Date;
}

export interface MemorySummary {
  keyTopics: string[];
  emotionalPatterns: EmotionalTone[];
  significantEvents: string[];
  userTraits: string[];
  relationshipMilestones: string[];
}

export class ConversationMemoryService {
  /**
   * Retrieve conversation context for relationship
   */
  async getConversationContext(
    relationshipId: string,
    maxRecentMessages: number = 20
  ): Promise<ConversationContext> {
    // Get relationship info
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: maxRecentMessages,
          include: {
            sender: {
              select: { id: true, email: true },
            },
          },
        },
        user: {
          select: { preferences: true },
        },
      },
    });

    if (!relationship) {
      throw new Error('Relationship not found');
    }

    // Calculate relationship duration
    const relationshipDuration = Math.floor(
      (Date.now() - relationship.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get total message count
    const totalMessages = await prisma.conversationMessage.count({
      where: { relationshipId },
    });

    // Format recent messages
    const recentMessages: ConversationMessage[] = relationship.messages
      .reverse()
      .map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        isAI: msg.senderId !== relationship.userId,
        emotionalTone: msg.emotionalTone,
        createdAt: msg.createdAt,
        metadata: msg.metadata,
      }));

    // Get important moments
    const importantMoments = await this.getImportantMoments(relationshipId);

    // Extract conversation themes
    const conversationThemes = await this.extractThemes(relationshipId);

    // Get user preferences
    const userPreferences = (relationship.user.preferences as Record<string, any>) || {};

    // Get last interaction date
    const lastMessage = relationship.messages[0];
    const lastInteractionDate = lastMessage?.createdAt;

    return {
      recentMessages,
      importantMoments,
      relationshipDuration,
      totalMessages,
      conversationThemes,
      userPreferences,
      lastInteractionDate,
    };
  }

  /**
   * Get important moments from conversation history
   */
  async getImportantMoments(
    relationshipId: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    // Get messages with strong emotional content or marked as important
    const messages = await prisma.conversationMessage.findMany({
      where: {
        relationshipId,
        OR: [
          { emotionalTone: EmotionalTone.POSITIVE },
          { emotionalTone: EmotionalTone.POSITIVE },
          { emotionalTone: EmotionalTone.POSITIVE },
          { emotionalTone: EmotionalTone.GRATEFUL },
          // Can add metadata filter for manually marked important messages
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true },
        },
      },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      isAI: msg.senderId !== relationshipId, // Simplified check
      emotionalTone: msg.emotionalTone,
      createdAt: msg.createdAt,
      metadata: msg.metadata,
    }));
  }

  /**
   * Extract common themes from conversation history
   */
  async extractThemes(relationshipId: string): Promise<string[]> {
    // Get recent messages
    const messages = await prisma.conversationMessage.findMany({
      where: { relationshipId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { content: true, metadata: true },
    });

    // Extract themes from metadata if available, or use basic keyword extraction
    const themes = new Set<string>();

    for (const message of messages) {
      const metadata = message.metadata as any;
      if (metadata?.themes) {
        (metadata.themes as string[]).forEach((theme) => themes.add(theme));
      }

      // Basic keyword extraction (can be enhanced with NLP)
      const content = message.content.toLowerCase();
      if (content.includes('work') || content.includes('job') || content.includes('career')) {
        themes.add('career');
      }
      if (content.includes('family') || content.includes('parent') || content.includes('sibling')) {
        themes.add('family');
      }
      if (content.includes('relationship') || content.includes('partner') || content.includes('dating')) {
        themes.add('relationships');
      }
      if (content.includes('health') || content.includes('exercise') || content.includes('wellness')) {
        themes.add('health');
      }
      if (content.includes('goal') || content.includes('dream') || content.includes('future')) {
        themes.add('goals');
      }
      if (content.includes('stress') || content.includes('anxiety') || content.includes('worry')) {
        themes.add('mental_health');
      }
    }

    return Array.from(themes).slice(0, 10);
  }

  /**
   * Generate memory summary for AI context
   */
  async generateMemorySummary(relationshipId: string): Promise<MemorySummary> {
    const context = await this.getConversationContext(relationshipId, 50);

    // Extract key topics
    const keyTopics = context.conversationThemes;

    // Analyze emotional patterns
    const emotionalPatterns = this.analyzeEmotionalPatterns(context.recentMessages);

    // Extract significant events (messages with high emotional intensity)
    const significantEvents = context.importantMoments
      .map((msg) => this.summarizeMessage(msg.content))
      .slice(0, 5);

    // Infer user traits from conversation patterns
    const userTraits = this.inferUserTraits(context);

    // Identify relationship milestones
    const relationshipMilestones = await this.identifyMilestones(relationshipId, context);

    return {
      keyTopics,
      emotionalPatterns,
      significantEvents,
      userTraits,
      relationshipMilestones,
    };
  }

  /**
   * Build context string for AI prompt
   */
  async buildContextPrompt(relationshipId: string): Promise<string> {
    const context = await this.getConversationContext(relationshipId);
    const summary = await this.generateMemorySummary(relationshipId);

    let prompt = `Conversation Context:\n\n`;

    // Relationship overview
    prompt += `Relationship Duration: ${context.relationshipDuration} days\n`;
    prompt += `Total Messages Exchanged: ${context.totalMessages}\n`;
    if (context.lastInteractionDate) {
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - context.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      prompt += `Days Since Last Interaction: ${daysSinceLastInteraction}\n`;
    }
    prompt += `\n`;

    // Conversation themes
    if (summary.keyTopics.length > 0) {
      prompt += `Common Topics: ${summary.keyTopics.join(', ')}\n\n`;
    }

    // User traits
    if (summary.userTraits.length > 0) {
      prompt += `User Characteristics: ${summary.userTraits.join(', ')}\n\n`;
    }

    // Recent emotional patterns
    if (summary.emotionalPatterns.length > 0) {
      prompt += `Recent Emotional Tone: ${summary.emotionalPatterns.slice(0, 5).join(', ')}\n\n`;
    }

    // Significant events
    if (summary.significantEvents.length > 0) {
      prompt += `Important Moments:\n`;
      summary.significantEvents.forEach((event, i) => {
        prompt += `${i + 1}. ${event}\n`;
      });
      prompt += `\n`;
    }

    // Relationship milestones
    if (summary.relationshipMilestones.length > 0) {
      prompt += `Relationship Milestones:\n`;
      summary.relationshipMilestones.forEach((milestone, i) => {
        prompt += `${i + 1}. ${milestone}\n`;
      });
      prompt += `\n`;
    }

    // Recent conversation history
    if (context.recentMessages.length > 0) {
      prompt += `Recent Conversation (last ${Math.min(5, context.recentMessages.length)} messages):\n`;
      context.recentMessages.slice(-5).forEach((msg) => {
        const sender = msg.isAI ? 'AI' : 'User';
        prompt += `${sender}: ${msg.content}\n`;
      });
    }

    return prompt;
  }

  /**
   * Store a new message in conversation history
   */
  async storeMessage(
    relationshipId: string,
    senderId: string,
    content: string,
    emotionalTone: EmotionalTone,
    metadata?: any
  ): Promise<ConversationMessage> {
    const message = await prisma.conversationMessage.create({
      data: {
        relationshipId,
        senderId,
        content,
        emotionalTone,
        metadata,
      },
    });

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      isAI: false, // Will be determined by caller
      emotionalTone: message.emotionalTone,
      createdAt: message.createdAt,
      metadata: message.metadata,
    };
  }

  /**
   * Mark a message as important
   */
  async markAsImportant(messageId: string): Promise<void> {
    await prisma.conversationMessage.update({
      where: { id: messageId },
      data: {
        metadata: {
          important: true,
          markedAt: new Date(),
        },
      },
    });
  }

  /**
   * Search conversation history
   */
  async searchMessages(
    relationshipId: string,
    query: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    const messages = await prisma.conversationMessage.findMany({
      where: {
        relationshipId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      isAI: false,
      emotionalTone: msg.emotionalTone,
      createdAt: msg.createdAt,
      metadata: msg.metadata,
    }));
  }

  // Private helper methods

  private analyzeEmotionalPatterns(messages: ConversationMessage[]): EmotionalTone[] {
    return messages.map((msg) => msg.emotionalTone).slice(0, 10);
  }

  private summarizeMessage(content: string): string {
    // Simple truncation (can be enhanced with actual summarization)
    return content.length > 100 ? content.substring(0, 97) + '...' : content;
  }

  private inferUserTraits(context: ConversationContext): string[] {
    const traits: string[] = [];

    // Infer from conversation patterns
    if (context.totalMessages > 100) {
      traits.push('engaged communicator');
    }

    if (context.conversationThemes.includes('goals')) {
      traits.push('goal-oriented');
    }

    if (context.conversationThemes.includes('family')) {
      traits.push('family-focused');
    }

    if (context.conversationThemes.includes('career')) {
      traits.push('career-minded');
    }

    // Analyze emotional patterns
    const recentEmotions = context.recentMessages.map((m) => m.emotionalTone);
    const positiveCount = recentEmotions.filter((e) =>
      [EmotionalTone.POSITIVE, EmotionalTone.HOPEFUL, EmotionalTone.GRATEFUL].includes(e)
    ).length;

    if (positiveCount > recentEmotions.length * 0.6) {
      traits.push('optimistic');
    }

    return traits.slice(0, 5);
  }

  private async identifyMilestones(
    relationshipId: string,
    context: ConversationContext
  ): Promise<string[]> {
    const milestones: string[] = [];

    // First message milestone
    if (context.totalMessages === 1) {
      milestones.push('First conversation');
    }

    // Message count milestones
    if (context.totalMessages === 10) {
      milestones.push('10 messages exchanged');
    } else if (context.totalMessages === 50) {
      milestones.push('50 messages exchanged');
    } else if (context.totalMessages === 100) {
      milestones.push('100 messages exchanged');
    }

    // Time milestones
    if (context.relationshipDuration === 7) {
      milestones.push('One week together');
    } else if (context.relationshipDuration === 30) {
      milestones.push('One month together');
    } else if (context.relationshipDuration === 90) {
      milestones.push('Three months together');
    } else if (context.relationshipDuration === 365) {
      milestones.push('One year together');
    }

    return milestones;
  }
}

// Export singleton instance
export const conversationMemoryService = new ConversationMemoryService();
