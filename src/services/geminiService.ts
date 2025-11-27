/**
 * Gemini AI Service
 * Integrates with Google's Generative AI (Gemini) for generating AI responses
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel } from '@google/generative-ai';
import { aiConfig } from '../config';
import { logger } from './logger';

export interface GeminiGenerationRequest {
  prompt: string;
  systemInstruction?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiGenerationResponse {
  content: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private isInitialized = false;

  /**
   * Initialize the Gemini client
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    const apiKey = aiConfig.gemini.apiKey;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not configured. Gemini integration will not be available.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: aiConfig.gemini.model,
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
      this.isInitialized = true;
      logger.info('Gemini service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gemini service', { error });
      throw error;
    }
  }

  /**
   * Check if Gemini is available
   */
  isAvailable(): boolean {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.model !== null;
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(request: GeminiGenerationRequest): Promise<GeminiGenerationResponse> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.model) {
      throw new Error('Gemini service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const generationConfig = {
        maxOutputTokens: request.maxTokens || 1024,
        temperature: request.temperature || 0.7,
      };

      let prompt = request.prompt;
      if (request.systemInstruction) {
        prompt = `${request.systemInstruction}\n\n${request.prompt}`;
      }

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      logger.info('Gemini content generated successfully', {
        promptLength: request.prompt.length,
        responseLength: text.length,
        usageMetadata: response.usageMetadata,
      });

      return {
        content: text,
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
          totalTokenCount: response.usageMetadata.totalTokenCount,
        } : undefined,
      };
    } catch (error) {
      logger.error('Error generating content with Gemini', { error, promptLength: request.prompt.length });
      throw error;
    }
  }

  /**
   * Generate chat response using Gemini API with conversation history
   */
  async generateChatResponse(
    systemInstruction: string,
    conversationHistory: Array<{ role: 'user' | 'model'; content: string }>,
    userMessage: string
  ): Promise<GeminiGenerationResponse> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.model) {
      throw new Error('Gemini service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const chat = this.model.startChat({
        history: conversationHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      // Include system instruction in the user message context
      const fullPrompt = systemInstruction
        ? `[System Instructions: ${systemInstruction}]\n\nUser: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(fullPrompt);
      const response = result.response;
      const text = response.text();

      logger.info('Gemini chat response generated successfully', {
        historyLength: conversationHistory.length,
        responseLength: text.length,
      });

      return {
        content: text,
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
          totalTokenCount: response.usageMetadata.totalTokenCount,
        } : undefined,
      };
    } catch (error) {
      logger.error('Error generating chat response with Gemini', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
