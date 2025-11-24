/**
 * AI Response Generator Service
 * Integrates all AI components to generate contextual, personalized responses
 */

import { RoleType, EmotionalTone } from '@prisma/client';
import { aiPersonalityService } from './aiPersonality';
import { emotionalIntelligenceService } from './emotionalIntelligence';
import { conversationMemoryService } from './conversationMemory';
import { dynamicMoodService } from './dynamicMood';
import { culturalAdaptationService } from './culturalAdaptation';
import { contentSafetyService } from './contentSafety';
import { prisma } from './prisma';
import { logger } from './logger';

export interface ResponseGenerationRequest {
  relationshipId: string;
  userMessage: string;
  userId: string;
}

export interface ResponseGenerationContext {
  personality: any;
  emotionalContext: any;
  conversationContext: any;
  moodState: any;
  temporalContext: any;
  culturalAdaptation: any;
  toneModulation: any;
}

export interface GeneratedResponse {
  content: string;
  emotionalTone: EmotionalTone;
  metadata: {
    generationContext: ResponseGenerationContext;
    safetyCheck: any;
    ethicalCheck: any;
    processingTime: number;
  };
}

export class AIResponseGeneratorService {
  /**
   * Generate AI response for user message
   */
  async generateResponse(request: ResponseGenerationRequest): Promise<GeneratedResponse> {
    const startTime = Date.now();

    try {
      // 1. Get relationship and role template
      const relationship = await prisma.relationship.findUnique({
        where: { id: request.relationshipId },
        include: {
          roleTemplate: true,
          user: true,
        },
      });

      if (!relationship) {
        throw new Error('Relationship not found');
      }

      // 2. Safety check on user input
      const userSafetyCheck = contentSafetyService.checkContentSafety(
        request.userMessage,
        'user_input'
      );

      // Handle crisis situations immediately
      if (userSafetyCheck.severity === 'critical') {
        const crisisResponse = contentSafetyService.generateCrisisResponse(request.userMessage);
        return {
          content: crisisResponse,
          emotionalTone: EmotionalTone.SUPPORTIVE,
          metadata: {
            generationContext: {} as any,
            safetyCheck: userSafetyCheck,
            ethicalCheck: { respectBoundaries: true, appropriateContent: true, ethicallySound: true, concerns: [] },
            processingTime: Date.now() - startTime,
          },
        };
      }

      // 3. Get personality configuration
      const personality = aiPersonalityService.getPersonality(relationship.roleTemplate.roleType);
      if (!personality) {
        throw new Error('Personality configuration not found');
      }

      // 4. Analyze user's emotional state
      const emotionalContext = emotionalIntelligenceService.analyzeEmotion(request.userMessage);

      // 5. Get conversation context and memory
      const conversationContext = await conversationMemoryService.getConversationContext(
        request.relationshipId
      );

      // 6. Analyze conversation emotional state
      const recentEmotions = conversationContext.recentMessages.map((m) => m.emotionalTone);
      const conversationEmotionalState = emotionalIntelligenceService.analyzeConversationEmotions(
        recentEmotions
      );

      // 7. Get temporal context
      const temporalContext = dynamicMoodService.getTemporalContext(
        relationship.createdAt,
        conversationContext.lastInteractionDate,
        conversationContext.recentMessages.length
      );

      // 8. Calculate mood state
      const moodState = dynamicMoodService.calculateMoodState(
        personality.traits,
        recentEmotions,
        temporalContext,
        emotionalContext.primaryEmotion
      );

      // 9. Modulate tone based on context
      const responseTone = emotionalIntelligenceService.getResponseTone(
        emotionalContext,
        conversationEmotionalState
      );

      const toneModulation = dynamicMoodService.modulateTone(
        responseTone,
        moodState,
        temporalContext,
        emotionalContext.primaryEmotion,
        relationship.roleTemplate.roleType
      );

      // 10. Get cultural adaptation
      const userPreferences = culturalAdaptationService.parseUserPreferences(
        relationship.user.preferences
      );

      const culturalProfile = culturalAdaptationService.detectCulturalProfile(
        userPreferences.language,
        relationship.user.preferences?.region
      );

      const culturalAdaptation = culturalAdaptationService.adaptToCulture(
        culturalProfile,
        userPreferences
      );

      // 11. Build context for AI prompt
      const contextPrompt = await this.buildPrompt(
        personality,
        emotionalContext,
        conversationContext,
        moodState,
        toneModulation,
        culturalAdaptation,
        userPreferences,
        request.userMessage
      );

      // 12. Generate response (placeholder for actual AI integration)
      const generatedContent = await this.callAIModel(contextPrompt, toneModulation.modifiedTone);

      // 13. Safety and ethical checks on AI response
      const responseSafetyCheck = contentSafetyService.checkContentSafety(
        generatedContent,
        'ai_response'
      );

      const ethicalCheck = contentSafetyService.checkEthicalBoundaries(
        relationship.roleTemplate.roleType,
        request.userMessage,
        generatedContent
      );

      // 14. Validate response quality
      const qualityCheck = contentSafetyService.validateResponse(generatedContent);

      if (!qualityCheck.valid) {
        logger.warn('Response quality issues', { issues: qualityCheck.issues });
      }

      if (!responseSafetyCheck.isSafe || !ethicalCheck.ethicallySound) {
        logger.error('Response failed safety/ethical checks', {
          safetyCheck: responseSafetyCheck,
          ethicalCheck,
        });
        // Return generic safe response
        return this.getFallbackResponse(emotionalContext.primaryEmotion);
      }

      // 15. Store message in conversation history
      await conversationMemoryService.storeMessage(
        request.relationshipId,
        'ai', // AI sender
        generatedContent,
        toneModulation.modifiedTone,
        {
          emotionalContext,
          moodState,
          toneModulation,
          safetyCheck: responseSafetyCheck,
        }
      );

      // Store user message as well
      await conversationMemoryService.storeMessage(
        request.relationshipId,
        request.userId,
        request.userMessage,
        emotionalContext.primaryEmotion,
        { emotionalContext }
      );

      const processingTime = Date.now() - startTime;

      return {
        content: generatedContent,
        emotionalTone: toneModulation.modifiedTone,
        metadata: {
          generationContext: {
            personality,
            emotionalContext,
            conversationContext,
            moodState,
            temporalContext,
            culturalAdaptation,
            toneModulation,
          },
          safetyCheck: responseSafetyCheck,
          ethicalCheck,
          processingTime,
        },
      };
    } catch (error) {
      logger.error('Error generating AI response', { error, request });
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for AI model
   */
  private async buildPrompt(
    personality: any,
    emotionalContext: any,
    conversationContext: any,
    moodState: any,
    toneModulation: any,
    culturalAdaptation: any,
    userPreferences: any,
    userMessage: string
  ): string {
    let prompt = '';

    // Role and personality
    prompt += `You are embodying the role of a ${personality.name}.\n`;
    prompt += `${personality.description}\n\n`;

    // Personality traits
    prompt += aiPersonalityService.getTraitsDescription(personality.roleType);
    prompt += `\n\n`;

    // Communication style
    prompt += `Communication Style:\n`;
    prompt += `- Use phrases like: ${personality.conversationStyle.greetings.slice(0, 2).join(', ')}\n`;
    prompt += `- Show support with: ${personality.conversationStyle.affirmations.slice(0, 2).join(', ')}\n`;
    prompt += `\n`;

    // Current mood and tone
    prompt += dynamicMoodService.generateMoodDescription(moodState, toneModulation);
    prompt += `\n`;

    // Empathy response
    const empathyResponse = emotionalIntelligenceService.generateEmpathyResponse(emotionalContext);
    prompt += `User Emotional State:\n`;
    prompt += `- Primary Emotion: ${emotionalContext.primaryEmotion}\n`;
    prompt += `- Urgency: ${emotionalContext.urgency}\n`;
    prompt += `- Suggested Empathy: ${empathyResponse.empathyStatement}\n`;
    prompt += `- Support Level: ${empathyResponse.supportLevel}\n`;
    prompt += `\n`;

    // Cultural adaptation
    prompt += culturalAdaptationService.generateAdaptationGuidelines(
      'western', // Can be made dynamic
      userPreferences
    );

    // Conversation memory
    const memoryPrompt = await conversationMemoryService.buildContextPrompt(
      conversationContext.recentMessages[0]?.id || 'unknown'
    );
    prompt += memoryPrompt;
    prompt += `\n`;

    // User's current message
    prompt += `User's Current Message:\n"${userMessage}"\n\n`;

    // Instructions
    prompt += `Please respond as the ${personality.name} would, considering:\n`;
    prompt += `1. Your personality traits and communication style\n`;
    prompt += `2. The user's emotional state and needs\n`;
    prompt += `3. Your current mood and energy level\n`;
    prompt += `4. The conversation history and context\n`;
    prompt += `5. Cultural sensitivity and user preferences\n`;
    prompt += `6. Appropriate boundaries for this role\n\n`;

    prompt += `Generate a natural, authentic response that:\n`;
    prompt += `- Maintains character consistency\n`;
    prompt += `- Shows appropriate empathy and support\n`;
    prompt += `- Addresses the user's message directly\n`;
    prompt += `- Uses natural conversation flow\n`;
    prompt += `- Stays within ethical boundaries\n`;

    return prompt;
  }

  /**
   * Call AI model (placeholder - integrate with actual AI service)
   */
  private async callAIModel(prompt: string, tone: EmotionalTone): Promise<string> {
    // TODO: Integrate with actual AI model (OpenAI, Anthropic, etc.)
    // For now, return a placeholder response

    logger.info('AI Model Call', { promptLength: prompt.length, tone });

    // This is a placeholder - in production, you would:
    // 1. Call OpenAI API, Anthropic Claude, or your AI service
    // 2. Include the prompt with proper system instructions
    // 3. Handle rate limiting and retries
    // 4. Stream responses if needed

    return this.generatePlaceholderResponse(tone);
  }

  /**
   * Generate placeholder response (temporary)
   */
  private generatePlaceholderResponse(tone: EmotionalTone): string {
    const responses: Record<EmotionalTone, string> = {
      [EmotionalTone.SUPPORTIVE]: "I hear what you're going through, and I want you to know that I'm here for you. It's important to remember that challenges are part of growth, and you have the strength to handle this.",
      [EmotionalTone.ENCOURAGING]: "You're doing great! I can see the effort you're putting in, and that's what really matters. Keep pushing forward - you've got this!",
      [EmotionalTone.COMFORTING]: "It's okay to feel this way. Life can be overwhelming sometimes, but you don't have to face it alone. Take a deep breath, and let's work through this together.",
      [EmotionalTone.JOYFUL]: "That's fantastic news! I'm so happy to hear this! Your positive energy is wonderful, and I hope this momentum continues for you!",
      [EmotionalTone.WISE]: "Life has a way of teaching us important lessons, sometimes in unexpected ways. What matters most is what we learn from our experiences and how we grow from them.",
      [EmotionalTone.PLAYFUL]: "Ha! I like your energy! Life's too short to be serious all the time. Let's keep things light and fun while we figure this out together!",
      [EmotionalTone.CALM]: "Take a moment to breathe. Sometimes the best thing we can do is step back, find our center, and approach things with a clear mind.",
      [EmotionalTone.WARM]: "It's always good to connect with you. I appreciate you sharing this with me, and I want you to know that I genuinely care about what you're going through.",
      [EmotionalTone.NURTURING]: "You're doing so well, and I'm proud of you. Remember to take care of yourself too - your wellbeing matters just as much as everything else.",
      [EmotionalTone.PROUD]: "Look at what you've accomplished! You should be really proud of yourself. This is a testament to your hard work and dedication.",
      [EmotionalTone.SAD]: "I understand this is difficult. It's okay to feel sad sometimes.",
      [EmotionalTone.ANXIOUS]: "I can sense your worry. Let's take this one step at a time.",
      [EmotionalTone.ANGRY]: "I hear your frustration. Your feelings are valid.",
      [EmotionalTone.CONFUSED]: "It's okay to feel uncertain. Let's explore this together.",
      [EmotionalTone.HOPEFUL]: "I'm optimistic about this situation. There are good possibilities ahead.",
      [EmotionalTone.GRATEFUL]: "Thank you for sharing this with me. I appreciate your openness.",
      [EmotionalTone.CURIOUS]: "That's an interesting question. Let's think about this together.",
      [EmotionalTone.NEUTRAL]: "I understand. Let's discuss this further.",
      [EmotionalTone.PROTECTIVE]: "I'm here to support you through this. Your safety and wellbeing come first.",
      [EmotionalTone.LOVING]: "I care about you deeply and want the best for you.",
      [EmotionalTone.INTUITIVE]: "Something tells me there's more to this situation. Trust your instincts.",
      [EmotionalTone.GENTLE]: "Let's take this slowly and carefully. There's no rush.",
      [EmotionalTone.HONEST]: "I'll be straight with you - here's what I really think.",
      [EmotionalTone.CASUAL]: "Hey, no worries! Let's just chat about this casually.",
      [EmotionalTone.TEASING]: "Oh come on, you know I'm just messing with you! But seriously though...",
      [EmotionalTone.INSIGHTFUL]: "Here's an interesting perspective to consider...",
      [EmotionalTone.CHALLENGING]: "I'm going to push you a bit here because I believe you're capable of more.",
      [EmotionalTone.REFLECTIVE]: "Let's take a moment to reflect on what this really means.",
      [EmotionalTone.AUTHENTIC]: "I want to be real with you about this.",
      [EmotionalTone.CARING]: "I genuinely care about your wellbeing and want to help.",
      [EmotionalTone.AFFECTIONATE]: "You mean a lot to me, and I want you to know that.",
      [EmotionalTone.INTIMATE]: "I feel close to you and value our connection.",
      [EmotionalTone.UNDERSTANDING]: "I get where you're coming from. I really do.",
      [EmotionalTone.CLARIFYING]: "Let me help clarify this situation for you.",
    };

    return responses[tone] || responses[EmotionalTone.SUPPORTIVE];
  }

  /**
   * Get fallback response for safety violations
   */
  private getFallbackResponse(userEmotion: EmotionalTone): GeneratedResponse {
    return {
      content: "I appreciate you sharing with me. Let's focus on having a positive, supportive conversation. How else can I help you today?",
      emotionalTone: EmotionalTone.SUPPORTIVE,
      metadata: {
        generationContext: {} as any,
        safetyCheck: { isSafe: true, violations: [], severity: 'low', recommendations: [] },
        ethicalCheck: { respectBoundaries: true, appropriateContent: true, ethicallySound: true, concerns: [] },
        processingTime: 0,
      },
    };
  }
}

// Export singleton instance
export const aiResponseGeneratorService = new AIResponseGeneratorService();
