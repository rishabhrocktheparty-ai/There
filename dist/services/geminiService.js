"use strict";
/**
 * Gemini AI Service
 * Integrates with Google's Generative AI (Gemini) for generating AI responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
const logger_1 = require("./logger");
class GeminiService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.isInitialized = false;
    }
    /**
     * Initialize the Gemini client
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }
        const apiKey = config_1.aiConfig.gemini.apiKey;
        if (!apiKey) {
            logger_1.logger.warn('GEMINI_API_KEY not configured. Gemini integration will not be available.');
            return;
        }
        try {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: config_1.aiConfig.gemini.model,
                safetySettings: [
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                ],
            });
            this.isInitialized = true;
            logger_1.logger.info('Gemini service initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Gemini service', { error });
            throw error;
        }
    }
    /**
     * Check if Gemini is available
     */
    isAvailable() {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.model !== null;
    }
    /**
     * Generate content using Gemini API
     */
    async generateContent(request) {
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
            logger_1.logger.info('Gemini content generated successfully', {
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
        }
        catch (error) {
            logger_1.logger.error('Error generating content with Gemini', { error, promptLength: request.prompt.length });
            throw error;
        }
    }
    /**
     * Generate chat response using Gemini API with conversation history
     */
    async generateChatResponse(systemInstruction, conversationHistory, userMessage) {
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
            logger_1.logger.info('Gemini chat response generated successfully', {
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
        }
        catch (error) {
            logger_1.logger.error('Error generating chat response with Gemini', { error });
            throw error;
        }
    }
}
// Export singleton instance
exports.geminiService = new GeminiService();
