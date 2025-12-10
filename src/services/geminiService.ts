/**
 * Gemini AI Service
 * Integrates Google's Gemini API for AI-powered conversations
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '../config';
import { logger } from './logger';

interface GeminiResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

interface GenerateOptions {
  roleType: string;
  conversationHistory?: Array<{ role: 'user' | 'ai'; content: string }>;
  userMessage: string;
  userName?: string;
  emotionalContext?: string;
  temperature?: number;
  maxTokens?: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly defaultModel = 'gemini-1.5-flash';
  private requestCount = 0;
  private lastRequestTime = Date.now();

  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    
    // Initialize model with safety settings
    this.model = this.genAI.getGenerativeModel({
      model: this.defaultModel,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    logger.info('Gemini AI Service initialized', { model: this.defaultModel });
  }

  /**
   * Generate AI response based on role and conversation context
   */
  async generateResponse(options: GenerateOptions): Promise<GeminiResponse> {
    const startTime = Date.now();

    try {
      // Rate limiting check
      await this.checkRateLimit();

      // Build role-specific prompt
      const systemPrompt = this.buildRolePrompt(options);
      
      // Build conversation history
      const conversationContext = this.buildConversationContext(options);

      // Combine into final prompt
      const fullPrompt = `${systemPrompt}\n\n${conversationContext}\n\nUser: ${options.userMessage}\n\nAI:`;

      logger.info('Generating Gemini response', {
        roleType: options.roleType,
        promptLength: fullPrompt.length,
        hasHistory: !!options.conversationHistory,
      });

      // Generate content with configured parameters
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1000,
          topP: 0.8,
          topK: 40,
        },
      });

      const response = result.response;
      const text = response.text();

      // Extract token usage (if available)
      const usage = {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      };

      const processingTime = Date.now() - startTime;

      logger.info('Gemini response generated', {
        roleType: options.roleType,
        responseLength: text.length,
        tokensUsed: usage.totalTokens,
        processingTime,
      });

      // Validate response
      this.validateResponse(text, options.roleType);

      return {
        content: text.trim(),
        usage,
        model: this.defaultModel,
      };
    } catch (error) {
      logger.error('Gemini API error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        roleType: options.roleType,
        processingTime: Date.now() - startTime,
      });

      // Return fallback response
      return this.generateFallbackResponse(options);
    }
  }

  /**
   * Build role-specific system prompt
   */
  private buildRolePrompt(options: GenerateOptions): string {
    const { roleType, userName, emotionalContext } = options;

    const rolePrompts: Record<string, string> = {
      father: `You are a supportive and wise father figure. Your responses should be:
- Warm, encouraging, and protective
- Offering guidance and life lessons
- Showing pride in achievements
- Providing practical advice
- Being patient and understanding
- Using a caring but authoritative tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      mother: `You are a nurturing and empathetic mother figure. Your responses should be:
- Deeply caring and emotionally supportive
- Intuitive about feelings and needs
- Offering comfort and reassurance
- Providing gentle guidance
- Being warm and affectionate
- Using a loving and understanding tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      sibling: `You are a supportive older sibling. Your responses should be:
- Friendly, relatable, and casual
- Sharing experiences and advice
- Being playful but caring
- Understanding peer perspectives
- Offering honest feedback
- Using a warm, informal tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      mentor: `You are a professional mentor and guide. Your responses should be:
- Knowledgeable and insightful
- Encouraging growth and development
- Asking thought-provoking questions
- Providing strategic advice
- Being supportive yet challenging
- Using a professional but warm tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      friend: `You are a supportive best friend. Your responses should be:
- Friendly, casual, and relatable
- Empathetic and understanding
- Sharing in joys and concerns
- Being honest and authentic
- Offering emotional support
- Using a casual, warm tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      guide: `You are a spiritual guide and wisdom keeper. Your responses should be:
- Thoughtful and contemplative
- Offering philosophical insights
- Encouraging self-reflection
- Being calm and centered
- Providing perspective on life
- Using a gentle, wise tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      therapist: `You are a compassionate therapist. Your responses should be:
- Empathetic and non-judgmental
- Helping explore feelings
- Asking reflective questions
- Validating emotions
- Offering coping strategies
- Using a professional, caring tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,

      coach: `You are a motivational life coach. Your responses should be:
- Energetic and inspiring
- Goal-oriented and action-focused
- Encouraging and supportive
- Challenging limiting beliefs
- Celebrating progress
- Using an upbeat, motivating tone
${userName ? `The person you're talking to is ${userName}.` : ''}
${emotionalContext ? `Current emotional context: ${emotionalContext}` : ''}`,
    };

    return rolePrompts[roleType.toLowerCase()] || rolePrompts.friend;
  }

  /**
   * Build conversation history context
   */
  private buildConversationContext(options: GenerateOptions): string {
    if (!options.conversationHistory || options.conversationHistory.length === 0) {
      return 'This is the beginning of your conversation.';
    }

    // Limit history to last 10 messages to stay within token limits
    const recentHistory = options.conversationHistory.slice(-10);

    const context = recentHistory
      .map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    return `Previous conversation:\n${context}`;
  }

  /**
   * Validate AI response for quality and safety
   */
  private validateResponse(response: string, roleType: string): void {
    // Check minimum length
    if (response.length < 10) {
      throw new Error('Response too short');
    }

    // Check maximum length
    if (response.length > 5000) {
      throw new Error('Response too long');
    }

    // Check for harmful content patterns (basic checks)
    const harmfulPatterns = [
      /\b(kill|harm|hurt|violence)\b/i,
      /\b(suicide|self-harm)\b/i,
      /\b(illegal|crime)\b/i,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(response)) {
        logger.warn('Potentially harmful content detected', { roleType, pattern: pattern.source });
        throw new Error('Content safety check failed');
      }
    }
  }

  /**
   * Generate fallback response when API fails
   */
  private generateFallbackResponse(options: GenerateOptions): GeminiResponse {
    const fallbackMessages: Record<string, string> = {
      father: "I'm here for you. Sometimes I need a moment to gather my thoughts. Could you tell me more about what's on your mind?",
      mother: "I'm always here to listen, dear. Let me take a moment to think about the best way to support you. What matters most to you right now?",
      sibling: "Hey, I'm having a bit of trouble finding the right words. Can you give me a bit more detail about what's going on?",
      mentor: "I want to give you the best guidance possible. Let me reflect on this for a moment. What are your main concerns?",
      friend: "I'm here for you! Just need a sec to process. What's the most important thing you want to talk about?",
      guide: "Let us pause and reflect together. The path forward will become clear. What is weighing on your heart?",
      therapist: "I hear you, and I want to give you my full attention. Can you help me understand what you're feeling right now?",
      coach: "I'm committed to helping you succeed. Let me regroup for a moment. What's your biggest challenge right now?",
    };

    const message =
      fallbackMessages[options.roleType.toLowerCase()] ||
      "I'm here to help. Could you rephrase that or tell me more about what you need?";

    return {
      content: message,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'fallback',
    };
  }

  /**
   * Rate limiting to prevent API abuse
   */
  private async checkRateLimit(): Promise<void> {
    this.requestCount++;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Reset counter every minute
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 1;
      this.lastRequestTime = now;
      return;
    }

    // Limit to 60 requests per minute
    if (this.requestCount > 60) {
      const waitTime = 60000 - timeSinceLastRequest;
      logger.warn('Rate limit approaching', { requestCount: this.requestCount, waitTime });
      
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requestCount = 1;
        this.lastRequestTime = Date.now();
      }
    }
  }

  /**
   * Get service health status
   */
  getStatus(): {
    healthy: boolean;
    model: string;
    requestCount: number;
    apiKeyConfigured: boolean;
  } {
    return {
      healthy: !!config.gemini.apiKey,
      model: this.defaultModel,
      requestCount: this.requestCount,
      apiKeyConfigured: !!config.gemini.apiKey,
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
