"use strict";
/**
 * AI Response Generator Service
 * Integrates all AI components to generate contextual, personalized responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiResponseGeneratorService = exports.AIResponseGeneratorService = void 0;
const client_1 = require("@prisma/client");
const aiPersonality_1 = require("./aiPersonality");
const emotionalIntelligence_1 = require("./emotionalIntelligence");
const conversationMemory_1 = require("./conversationMemory");
const dynamicMood_1 = require("./dynamicMood");
const culturalAdaptation_1 = require("./culturalAdaptation");
const contentSafety_1 = require("./contentSafety");
const geminiService_1 = require("./geminiService");
const prisma_1 = require("./prisma");
const logger_1 = require("./logger");
class AIResponseGeneratorService {
    /**
     * Generate AI response for user message
     */
    async generateResponse(request) {
        const startTime = Date.now();
        try {
            // 1. Get relationship and role template
            const relationship = await prisma_1.prisma.relationship.findUnique({
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
            const userSafetyCheck = contentSafety_1.contentSafetyService.checkContentSafety(request.userMessage, 'user_input');
            // Handle crisis situations immediately
            if (userSafetyCheck.severity === 'critical') {
                const crisisResponse = contentSafety_1.contentSafetyService.generateCrisisResponse(request.userMessage);
                return {
                    content: crisisResponse,
                    emotionalTone: client_1.EmotionalTone.POSITIVE,
                    metadata: {
                        generationContext: {},
                        safetyCheck: userSafetyCheck,
                        ethicalCheck: { respectBoundaries: true, appropriateContent: true, ethicallySound: true, concerns: [] },
                        processingTime: Date.now() - startTime,
                    },
                };
            }
            // 3. Get personality configuration
            if (!relationship.roleTemplate) {
                throw new Error('Role template not found');
            }
            const personality = aiPersonality_1.aiPersonalityService.getPersonality(relationship.roleTemplate.type);
            if (!personality) {
                throw new Error('Personality configuration not found');
            }
            // 4. Analyze user's emotional state
            const emotionalContext = emotionalIntelligence_1.emotionalIntelligenceService.analyzeEmotion(request.userMessage);
            // 5. Get conversation context and memory
            const conversationContext = await conversationMemory_1.conversationMemoryService.getConversationContext(request.relationshipId);
            // 6. Analyze conversation emotional state
            const recentEmotions = conversationContext.recentMessages.map((m) => m.emotionalTone);
            const conversationEmotionalState = emotionalIntelligence_1.emotionalIntelligenceService.analyzeConversationEmotions(recentEmotions);
            // 7. Get temporal context
            const temporalContext = dynamicMood_1.dynamicMoodService.getTemporalContext(relationship.createdAt, conversationContext.lastInteractionDate, conversationContext.recentMessages.length);
            // 8. Calculate mood state
            const moodState = dynamicMood_1.dynamicMoodService.calculateMoodState(personality.traits, recentEmotions, temporalContext, emotionalContext.primaryEmotion);
            // 9. Modulate tone based on context
            const responseTone = emotionalIntelligence_1.emotionalIntelligenceService.getResponseTone(emotionalContext, conversationEmotionalState);
            const toneModulation = dynamicMood_1.dynamicMoodService.modulateTone(responseTone, moodState, temporalContext, emotionalContext.primaryEmotion, relationship.roleTemplate.type);
            // 10. Get cultural adaptation
            const userPreferences = culturalAdaptation_1.culturalAdaptationService.parseUserPreferences(relationship.user.preferences);
            const userPrefs = relationship.user.preferences;
            const culturalProfile = culturalAdaptation_1.culturalAdaptationService.detectCulturalProfile(userPreferences.language, userPrefs?.region || 'en-US');
            const culturalAdaptation = culturalAdaptation_1.culturalAdaptationService.adaptToCulture(culturalProfile, userPreferences);
            // 11. Build context for AI prompt
            const contextPrompt = await this.buildPrompt(personality, emotionalContext, conversationContext, moodState, toneModulation, culturalAdaptation, userPreferences, request.userMessage);
            // 12. Generate response (placeholder for actual AI integration)
            const generatedContent = await this.callAIModel(contextPrompt, toneModulation.modifiedTone);
            // 13. Safety and ethical checks on AI response
            const responseSafetyCheck = contentSafety_1.contentSafetyService.checkContentSafety(generatedContent, 'ai_response');
            const ethicalCheck = contentSafety_1.contentSafetyService.checkEthicalBoundaries(relationship.roleTemplate.type, request.userMessage, generatedContent);
            // 14. Validate response quality
            const qualityCheck = contentSafety_1.contentSafetyService.validateResponse(generatedContent);
            if (!qualityCheck.valid) {
                logger_1.logger.warn('Response quality issues', { issues: qualityCheck.issues });
            }
            if (!responseSafetyCheck.isSafe || !ethicalCheck.ethicallySound) {
                logger_1.logger.error('Response failed safety/ethical checks', {
                    safetyCheck: responseSafetyCheck,
                    ethicalCheck,
                });
                // Return generic safe response
                return this.getFallbackResponse(emotionalContext.primaryEmotion);
            }
            // 15. Store message in conversation history
            await conversationMemory_1.conversationMemoryService.storeMessage(request.relationshipId, 'ai', // AI sender
            generatedContent, toneModulation.modifiedTone, {
                emotionalContext,
                moodState,
                toneModulation,
                safetyCheck: responseSafetyCheck,
            });
            // Store user message as well
            await conversationMemory_1.conversationMemoryService.storeMessage(request.relationshipId, request.userId, request.userMessage, emotionalContext.primaryEmotion, { emotionalContext });
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
        }
        catch (error) {
            logger_1.logger.error('Error generating AI response', { error, request });
            throw error;
        }
    }
    /**
     * Build comprehensive prompt for AI model
     */
    async buildPrompt(personality, emotionalContext, conversationContext, moodState, toneModulation, culturalAdaptation, userPreferences, userMessage) {
        let prompt = '';
        // Role and personality
        prompt += `You are embodying the role of a ${personality.name}.\n`;
        prompt += `${personality.description}\n\n`;
        // Personality traits
        prompt += aiPersonality_1.aiPersonalityService.getTraitsDescription(personality.type);
        prompt += `\n\n`;
        // Communication style
        prompt += `Communication Style:\n`;
        prompt += `- Use phrases like: ${personality.conversationStyle.greetings.slice(0, 2).join(', ')}\n`;
        prompt += `- Show support with: ${personality.conversationStyle.affirmations.slice(0, 2).join(', ')}\n`;
        prompt += `\n`;
        // Current mood and tone
        prompt += dynamicMood_1.dynamicMoodService.generateMoodDescription(moodState, toneModulation);
        prompt += `\n`;
        // Empathy response
        const empathyResponse = emotionalIntelligence_1.emotionalIntelligenceService.generateEmpathyResponse(emotionalContext);
        prompt += `User Emotional State:\n`;
        prompt += `- Primary Emotion: ${emotionalContext.primaryEmotion}\n`;
        prompt += `- Urgency: ${emotionalContext.urgency}\n`;
        prompt += `- Suggested Empathy: ${empathyResponse.empathyStatement}\n`;
        prompt += `- Support Level: ${empathyResponse.supportLevel}\n`;
        prompt += `\n`;
        // Cultural adaptation
        prompt += culturalAdaptation_1.culturalAdaptationService.generateAdaptationGuidelines('western', // Can be made dynamic
        userPreferences);
        // Conversation memory
        const memoryPrompt = await conversationMemory_1.conversationMemoryService.buildContextPrompt(conversationContext.recentMessages[0]?.id || 'unknown');
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
     * Call AI model using Gemini API
     */
    async callAIModel(prompt, tone) {
        logger_1.logger.info('AI Model Call', { promptLength: prompt.length, tone });
        // Check if Gemini is available
        if (geminiService_1.geminiService.isAvailable()) {
            try {
                const response = await geminiService_1.geminiService.generateContent({
                    prompt,
                    temperature: 0.7,
                    maxTokens: 1024,
                });
                logger_1.logger.info('Gemini response received', {
                    responseLength: response.content.length,
                    usageMetadata: response.usageMetadata,
                });
                return response.content;
            }
            catch (error) {
                logger_1.logger.error('Gemini API call failed, falling back to placeholder', { error });
                // Fall back to placeholder response if Gemini fails
                return this.generatePlaceholderResponse(tone);
            }
        }
        // Fall back to placeholder response if Gemini is not available
        logger_1.logger.warn('Gemini not available, using placeholder response');
        return this.generatePlaceholderResponse(tone);
    }
    /**
     * Generate placeholder response (temporary)
     */
    generatePlaceholderResponse(tone) {
        const responses = {
            [client_1.EmotionalTone.POSITIVE]: "You're doing great! I can see the effort you're putting in, and that's what really matters. Keep pushing forward - you've got this!",
            [client_1.EmotionalTone.NEUTRAL]: "I hear what you're saying. Let's think through this together and find the best path forward.",
            [client_1.EmotionalTone.NEGATIVE]: "I understand this is difficult. It's okay to feel this way. I'm here for you, and we'll work through this together.",
            [client_1.EmotionalTone.MIXED]: "Life has a way of teaching us important lessons, sometimes in unexpected ways. What matters most is what we learn from our experiences and how we grow from them.",
        };
        return responses[tone] || responses[client_1.EmotionalTone.POSITIVE];
    }
    /**
     * Get fallback response for safety violations
     */
    getFallbackResponse(userEmotion) {
        return {
            content: "I appreciate you sharing with me. Let's focus on having a positive, supportive conversation. How else can I help you today?",
            emotionalTone: client_1.EmotionalTone.POSITIVE,
            metadata: {
                generationContext: {},
                safetyCheck: { isSafe: true, violations: [], severity: 'low', recommendations: [] },
                ethicalCheck: { respectBoundaries: true, appropriateContent: true, ethicallySound: true, concerns: [] },
                processingTime: 0,
            },
        };
    }
}
exports.AIResponseGeneratorService = AIResponseGeneratorService;
// Export singleton instance
exports.aiResponseGeneratorService = new AIResponseGeneratorService();
