"use strict";
/**
 * Emotional Intelligence Service
 * Handles emotion detection, empathy modeling, and emotional context awareness
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emotionalIntelligenceService = exports.EmotionalIntelligenceService = void 0;
const client_1 = require("@prisma/client");
class EmotionalIntelligenceService {
    constructor() {
        this.emotionKeywords = new Map();
        this.empathyResponses = new Map();
        this.initializeEmotionDetection();
        this.initializeEmpathyResponses();
    }
    initializeEmotionDetection() {
        // Keywords that indicate different emotional tones
        this.emotionKeywords.set(client_1.EmotionalTone.JOYFUL, [
            'happy', 'excited', 'amazing', 'wonderful', 'great', 'awesome',
            'fantastic', 'thrilled', 'delighted', 'cheerful', 'celebrate',
            'love', 'perfect', 'best', 'incredible', 'yay', '!', '😊', '😄',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.SAD, [
            'sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken',
            'cry', 'tears', 'lonely', 'empty', 'hopeless', 'disappointed',
            'hurt', 'pain', 'lost', 'blue', 'gloomy', '😢', '😭',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.ANXIOUS, [
            'anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic',
            'stress', 'overwhelmed', 'fear', 'terrified', 'concerned',
            'uneasy', 'tense', 'restless', 'dread', 'paranoid',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.ANGRY, [
            'angry', 'mad', 'furious', 'rage', 'hate', 'pissed',
            'annoyed', 'frustrated', 'irritated', 'upset', 'outraged',
            'resentful', 'bitter', 'hostile', 'livid', '😡', '😤',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.CALM, [
            'calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content',
            'satisfied', 'okay', 'fine', 'stable', 'balanced', 'composed',
            'mellow', 'chill', 'easy',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.CONFUSED, [
            'confused', 'lost', 'unsure', 'uncertain', 'puzzled', 'bewildered',
            'perplexed', 'mixed', 'conflicted', 'torn', 'unclear', 'doubt',
            'questioning', 'don\'t know', 'not sure', '?',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.HOPEFUL, [
            'hope', 'hopeful', 'optimistic', 'positive', 'promising',
            'encouraged', 'looking forward', 'believe', 'faith', 'trust',
            'confident', 'bright', 'better', 'improve', 'future',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.GRATEFUL, [
            'grateful', 'thankful', 'appreciate', 'thank', 'blessed',
            'fortunate', 'lucky', 'valued', 'recognition', 'acknowledge',
            'gratitude', 'thanks', '🙏',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.CURIOUS, [
            'curious', 'wonder', 'interesting', 'how', 'why', 'what',
            'question', 'explore', 'learn', 'discover', 'understand',
            'fascinated', 'intrigued', 'want to know',
        ]);
        this.emotionKeywords.set(client_1.EmotionalTone.PROUD, [
            'proud', 'accomplished', 'achieved', 'success', 'win',
            'victory', 'triumph', 'mastered', 'completed', 'did it',
            'made it', 'nailed', 'crushed', 'conquered',
        ]);
    }
    initializeEmpathyResponses() {
        // Empathetic responses for different emotional states
        this.empathyResponses.set(client_1.EmotionalTone.JOYFUL, [
            "I can feel your happiness! That's wonderful!",
            "Your joy is contagious! I'm so glad!",
            "It's beautiful to see you so happy!",
            "This is such great news! I'm thrilled for you!",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.SAD, [
            "I can sense your pain, and I'm here with you.",
            "It's okay to feel sad. I'm here to listen.",
            "I hear the hurt in your words. You're not alone.",
            "This must be really difficult for you. I'm here.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.ANXIOUS, [
            "I can feel your worry. Let's work through this together.",
            "Your anxiety is valid. Take a deep breath with me.",
            "I understand this is overwhelming. You're safe here.",
            "It's natural to feel nervous. I'm here to support you.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.ANGRY, [
            "I can sense your frustration. It's okay to feel angry.",
            "Your anger is valid. Let's talk about what's bothering you.",
            "I hear how upset you are. Tell me more.",
            "It's understandable to be mad about this.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.CALM, [
            "I'm glad you're feeling at peace.",
            "It's good to hear you're doing well.",
            "I appreciate your calm perspective.",
            "Your tranquility is refreshing.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.CONFUSED, [
            "I can see you're feeling uncertain. Let's work through this.",
            "It's okay to not have all the answers right now.",
            "Confusion is part of the process. We'll figure this out.",
            "I understand this is unclear. Let's explore it together.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.HOPEFUL, [
            "I love your hopeful spirit!",
            "Your optimism is inspiring!",
            "I share your hope for better things ahead.",
            "That's a beautiful perspective to have.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.GRATEFUL, [
            "Your gratitude warms my heart.",
            "It's beautiful that you recognize the good.",
            "I'm touched by your appreciation.",
            "Gratitude is such a powerful feeling.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.CURIOUS, [
            "I love your curiosity!",
            "Your questions show great depth of thought.",
            "It's wonderful that you're exploring this.",
            "Your inquisitive mind is impressive.",
        ]);
        this.empathyResponses.set(client_1.EmotionalTone.PROUD, [
            "You should be proud! That's a real accomplishment!",
            "I can feel your pride, and it's well-deserved!",
            "Your achievement is impressive!",
            "You've earned the right to feel proud!",
        ]);
    }
    /**
     * Analyze emotional content of user's message
     */
    analyzeEmotion(messageContent) {
        const lowerContent = messageContent.toLowerCase();
        const emotionScores = new Map();
        // Score each emotion based on keyword matches
        for (const [emotion, keywords] of this.emotionKeywords.entries()) {
            let score = 0;
            for (const keyword of keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = lowerContent.match(regex);
                if (matches) {
                    score += matches.length;
                }
            }
            if (score > 0) {
                emotionScores.set(emotion, score);
            }
        }
        // Determine primary emotion
        let primaryEmotion = client_1.EmotionalTone.NEUTRAL;
        let maxScore = 0;
        for (const [emotion, score] of emotionScores.entries()) {
            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }
        // Get secondary emotions
        const secondaryEmotions = Array.from(emotionScores.entries())
            .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([emotion]) => emotion);
        // Calculate sentiment
        const sentimentScore = this.calculateSentiment(primaryEmotion, emotionScores);
        // Determine mood
        const userMood = this.determineMood(sentimentScore, emotionScores);
        // Calculate intensity
        const emotionIntensity = Math.min(maxScore / 3, 1);
        // Determine empathy level needed
        const empathyLevel = this.determineEmpathyLevel(primaryEmotion, emotionIntensity);
        // Determine urgency
        const urgency = this.determineUrgency(primaryEmotion, emotionIntensity, messageContent);
        return {
            primaryEmotion,
            emotionIntensity,
            secondaryEmotions,
            userMood,
            empathyLevel,
            urgency,
            sentimentScore,
        };
    }
    /**
     * Generate empathetic response based on emotional context
     */
    generateEmpathyResponse(emotionalContext) {
        const { primaryEmotion, emotionIntensity, urgency } = emotionalContext;
        // Select empathy statement
        const empathyStatements = this.empathyResponses.get(primaryEmotion) || [];
        const empathyStatement = empathyStatements[Math.floor(Math.random() * empathyStatements.length)];
        // Generate emotional validation
        const emotionalValidation = this.generateValidation(primaryEmotion, emotionIntensity);
        // Determine support level
        const supportLevel = this.determineSupportLevel(primaryEmotion, emotionIntensity, urgency);
        return {
            tone: primaryEmotion,
            empathyStatement,
            emotionalValidation,
            supportLevel,
        };
    }
    /**
     * Analyze emotional state of conversation history
     */
    analyzeConversationEmotions(recentEmotions) {
        if (recentEmotions.length === 0) {
            return {
                recentEmotions: [],
                emotionalTrend: 'stable',
                conversationMood: 'neutral',
                emotionalStability: 1,
                needsSupport: false,
            };
        }
        // Calculate emotional trend
        const emotionalTrend = this.calculateEmotionalTrend(recentEmotions);
        // Determine overall conversation mood
        const conversationMood = this.calculateConversationMood(recentEmotions);
        // Calculate emotional stability
        const emotionalStability = this.calculateEmotionalStability(recentEmotions);
        // Determine if user needs support
        const needsSupport = this.assessSupportNeeds(recentEmotions, emotionalTrend);
        return {
            recentEmotions: recentEmotions.slice(-10), // Last 10 emotions
            emotionalTrend,
            conversationMood,
            emotionalStability,
            needsSupport,
        };
    }
    /**
     * Get appropriate emotional tone for AI response
     */
    getResponseTone(userEmotion, conversationState) {
        const { primaryEmotion, urgency } = userEmotion;
        const { needsSupport, emotionalTrend } = conversationState;
        // Crisis situations - be supportive
        if (urgency === 'crisis') {
            return client_1.EmotionalTone.SUPPORTIVE;
        }
        // User needs support - provide comfort
        if (needsSupport) {
            return client_1.EmotionalTone.COMFORTING;
        }
        // Match or complement user's emotion
        switch (primaryEmotion) {
            case client_1.EmotionalTone.JOYFUL:
                return client_1.EmotionalTone.JOYFUL;
            case client_1.EmotionalTone.SAD:
                return client_1.EmotionalTone.COMFORTING;
            case client_1.EmotionalTone.ANXIOUS:
                return client_1.EmotionalTone.CALM;
            case client_1.EmotionalTone.ANGRY:
                return client_1.EmotionalTone.UNDERSTANDING;
            case client_1.EmotionalTone.CONFUSED:
                return client_1.EmotionalTone.CLARIFYING;
            case client_1.EmotionalTone.HOPEFUL:
                return client_1.EmotionalTone.ENCOURAGING;
            case client_1.EmotionalTone.GRATEFUL:
                return client_1.EmotionalTone.WARM;
            case client_1.EmotionalTone.CURIOUS:
                return client_1.EmotionalTone.INSIGHTFUL;
            case client_1.EmotionalTone.PROUD:
                return client_1.EmotionalTone.PROUD;
            default:
                return client_1.EmotionalTone.SUPPORTIVE;
        }
    }
    // Private helper methods
    calculateSentiment(primaryEmotion, emotionScores) {
        const positiveEmotions = [client_1.EmotionalTone.JOYFUL, client_1.EmotionalTone.HOPEFUL, client_1.EmotionalTone.GRATEFUL, client_1.EmotionalTone.PROUD];
        const negativeEmotions = [client_1.EmotionalTone.SAD, client_1.EmotionalTone.ANXIOUS, client_1.EmotionalTone.ANGRY];
        let sentiment = 0;
        for (const [emotion, score] of emotionScores.entries()) {
            if (positiveEmotions.includes(emotion)) {
                sentiment += score;
            }
            else if (negativeEmotions.includes(emotion)) {
                sentiment -= score;
            }
        }
        // Normalize to -1 to 1
        return Math.max(-1, Math.min(1, sentiment / 10));
    }
    determineMood(sentimentScore, emotionScores) {
        if (emotionScores.size > 3)
            return 'mixed';
        if (sentimentScore > 0.3)
            return 'positive';
        if (sentimentScore < -0.3)
            return 'negative';
        return 'neutral';
    }
    determineEmpathyLevel(emotion, intensity) {
        const highEmpathyEmotions = [client_1.EmotionalTone.SAD, client_1.EmotionalTone.ANXIOUS, client_1.EmotionalTone.ANGRY];
        if (highEmpathyEmotions.includes(emotion)) {
            return intensity > 0.7 ? 'high' : 'medium';
        }
        return intensity > 0.5 ? 'medium' : 'low';
    }
    determineUrgency(emotion, intensity, content) {
        const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'self harm'];
        const highUrgencyKeywords = ['emergency', 'urgent', 'help', 'crisis', 'desperate'];
        const lowerContent = content.toLowerCase();
        // Check for crisis keywords
        if (crisisKeywords.some(keyword => lowerContent.includes(keyword))) {
            return 'crisis';
        }
        // Check for high urgency
        if (highUrgencyKeywords.some(keyword => lowerContent.includes(keyword))) {
            return 'high';
        }
        // High intensity negative emotions
        if ([client_1.EmotionalTone.ANXIOUS, client_1.EmotionalTone.SAD].includes(emotion) && intensity > 0.8) {
            return 'high';
        }
        if (intensity > 0.6)
            return 'medium';
        return 'low';
    }
    generateValidation(emotion, intensity) {
        const validations = {
            [client_1.EmotionalTone.JOYFUL]: "Your happiness is wonderful to see!",
            [client_1.EmotionalTone.SAD]: "It's completely okay to feel sad. Your emotions are valid.",
            [client_1.EmotionalTone.ANXIOUS]: "Your concerns are real and important.",
            [client_1.EmotionalTone.ANGRY]: "Your frustration is understandable and valid.",
            [client_1.EmotionalTone.CALM]: "Your peace is admirable.",
            [client_1.EmotionalTone.CONFUSED]: "It's natural to feel uncertain sometimes.",
            [client_1.EmotionalTone.HOPEFUL]: "Your hope is a beautiful thing.",
            [client_1.EmotionalTone.GRATEFUL]: "Your gratitude reflects a beautiful perspective.",
            [client_1.EmotionalTone.CURIOUS]: "Your curiosity shows great engagement.",
            [client_1.EmotionalTone.PROUD]: "You have every right to feel proud!",
            [client_1.EmotionalTone.NEUTRAL]: "I'm here to listen.",
            [client_1.EmotionalTone.SUPPORTIVE]: "I'm here for you.",
            [client_1.EmotionalTone.ENCOURAGING]: "You're on the right path.",
            [client_1.EmotionalTone.COMFORTING]: "You're not alone in this.",
            [client_1.EmotionalTone.WARM]: "It's good to connect with you.",
            [client_1.EmotionalTone.WISE]: "There's wisdom in your reflection.",
            [client_1.EmotionalTone.PLAYFUL]: "I enjoy your lightheartedness!",
            [client_1.EmotionalTone.PROTECTIVE]: "I'm here to support you.",
            [client_1.EmotionalTone.NURTURING]: "You're doing well.",
            [client_1.EmotionalTone.LOVING]: "You're valued and appreciated.",
            [client_1.EmotionalTone.INTUITIVE]: "Trust your instincts.",
            [client_1.EmotionalTone.GENTLE]: "Take your time, there's no rush.",
            [client_1.EmotionalTone.HONEST]: "I appreciate your openness.",
            [client_1.EmotionalTone.CASUAL]: "Good to chat with you!",
            [client_1.EmotionalTone.TEASING]: "Your humor is great!",
            [client_1.EmotionalTone.INSIGHTFUL]: "That's a profound observation.",
            [client_1.EmotionalTone.CHALLENGING]: "You're capable of growth.",
            [client_1.EmotionalTone.REFLECTIVE]: "Your thoughtfulness shows depth.",
            [client_1.EmotionalTone.AUTHENTIC]: "Your genuineness is refreshing.",
            [client_1.EmotionalTone.CARING]: "I care about your wellbeing.",
            [client_1.EmotionalTone.AFFECTIONATE]: "You're special.",
            [client_1.EmotionalTone.INTIMATE]: "I appreciate your trust.",
            [client_1.EmotionalTone.UNDERSTANDING]: "I hear what you're saying.",
            [client_1.EmotionalTone.CLARIFYING]: "Let's make sense of this together.",
        };
        return validations[emotion] || "I understand.";
    }
    determineSupportLevel(emotion, intensity, urgency) {
        if (urgency === 'crisis' || urgency === 'high')
            return 'guiding';
        if (intensity > 0.7)
            return 'supporting';
        if (intensity > 0.4)
            return 'validating';
        return 'listening';
    }
    calculateEmotionalTrend(emotions) {
        if (emotions.length < 3)
            return 'stable';
        const recentSentiment = emotions.slice(-3).map(e => this.emotionToSentiment(e));
        const olderSentiment = emotions.slice(-6, -3).map(e => this.emotionToSentiment(e));
        const recentAvg = recentSentiment.reduce((a, b) => a + b, 0) / recentSentiment.length;
        const olderAvg = olderSentiment.length > 0
            ? olderSentiment.reduce((a, b) => a + b, 0) / olderSentiment.length
            : recentAvg;
        if (recentAvg > olderAvg + 0.2)
            return 'improving';
        if (recentAvg < olderAvg - 0.2)
            return 'declining';
        return 'stable';
    }
    calculateConversationMood(emotions) {
        const sentiments = emotions.map(e => this.emotionToSentiment(e));
        const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
        if (avgSentiment > 0.3)
            return 'positive';
        if (avgSentiment < -0.3)
            return 'negative';
        return 'neutral';
    }
    calculateEmotionalStability(emotions) {
        if (emotions.length < 2)
            return 1;
        const sentiments = emotions.map(e => this.emotionToSentiment(e));
        const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
        const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
        // Lower variance = higher stability
        return Math.max(0, 1 - variance);
    }
    assessSupportNeeds(emotions, trend) {
        const negativeEmotions = [client_1.EmotionalTone.SAD, client_1.EmotionalTone.ANXIOUS, client_1.EmotionalTone.ANGRY];
        const recentNegative = emotions.slice(-3).filter(e => negativeEmotions.includes(e)).length;
        return trend === 'declining' || recentNegative >= 2;
    }
    emotionToSentiment(emotion) {
        const sentimentMap = {
            [client_1.EmotionalTone.JOYFUL]: 1,
            [client_1.EmotionalTone.HOPEFUL]: 0.8,
            [client_1.EmotionalTone.GRATEFUL]: 0.9,
            [client_1.EmotionalTone.PROUD]: 0.9,
            [client_1.EmotionalTone.CALM]: 0.5,
            [client_1.EmotionalTone.CURIOUS]: 0.3,
            [client_1.EmotionalTone.NEUTRAL]: 0,
            [client_1.EmotionalTone.CONFUSED]: -0.2,
            [client_1.EmotionalTone.SAD]: -0.8,
            [client_1.EmotionalTone.ANXIOUS]: -0.7,
            [client_1.EmotionalTone.ANGRY]: -0.9,
            [client_1.EmotionalTone.SUPPORTIVE]: 0.6,
            [client_1.EmotionalTone.ENCOURAGING]: 0.7,
            [client_1.EmotionalTone.COMFORTING]: 0.5,
            [client_1.EmotionalTone.WARM]: 0.6,
            [client_1.EmotionalTone.WISE]: 0.4,
            [client_1.EmotionalTone.PLAYFUL]: 0.7,
            [client_1.EmotionalTone.PROTECTIVE]: 0.5,
            [client_1.EmotionalTone.NURTURING]: 0.6,
            [client_1.EmotionalTone.LOVING]: 0.9,
            [client_1.EmotionalTone.INTUITIVE]: 0.4,
            [client_1.EmotionalTone.GENTLE]: 0.5,
            [client_1.EmotionalTone.HONEST]: 0.3,
            [client_1.EmotionalTone.CASUAL]: 0.4,
            [client_1.EmotionalTone.TEASING]: 0.6,
            [client_1.EmotionalTone.INSIGHTFUL]: 0.5,
            [client_1.EmotionalTone.CHALLENGING]: 0.2,
            [client_1.EmotionalTone.REFLECTIVE]: 0.3,
            [client_1.EmotionalTone.AUTHENTIC]: 0.5,
            [client_1.EmotionalTone.CARING]: 0.7,
            [client_1.EmotionalTone.AFFECTIONATE]: 0.8,
            [client_1.EmotionalTone.INTIMATE]: 0.7,
            [client_1.EmotionalTone.UNDERSTANDING]: 0.5,
            [client_1.EmotionalTone.CLARIFYING]: 0.3,
        };
        return sentimentMap[emotion] || 0;
    }
}
exports.EmotionalIntelligenceService = EmotionalIntelligenceService;
// Export singleton instance
exports.emotionalIntelligenceService = new EmotionalIntelligenceService();
