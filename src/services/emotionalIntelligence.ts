/**
 * Emotional Intelligence Service
 * Handles emotion detection, empathy modeling, and emotional context awareness
 */

import { EmotionalTone } from '@prisma/client';

export interface EmotionalContext {
  primaryEmotion: EmotionalTone;
  emotionIntensity: number; // 0-1
  secondaryEmotions: EmotionalTone[];
  userMood: 'positive' | 'neutral' | 'negative' | 'mixed';
  empathyLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  sentimentScore: number; // -1 to 1
}

export interface EmotionalResponse {
  tone: EmotionalTone;
  empathyStatement?: string;
  emotionalValidation?: string;
  supportLevel: 'listening' | 'validating' | 'supporting' | 'guiding';
}

export interface ConversationEmotionalState {
  recentEmotions: EmotionalTone[];
  emotionalTrend: 'improving' | 'stable' | 'declining';
  conversationMood: 'positive' | 'neutral' | 'negative';
  emotionalStability: number; // 0-1
  needsSupport: boolean;
}

export class EmotionalIntelligenceService {
  private emotionKeywords: Map<EmotionalTone, string[]>;
  private empathyResponses: Map<EmotionalTone, string[]>;

  constructor() {
    this.emotionKeywords = new Map();
    this.empathyResponses = new Map();
    this.initializeEmotionDetection();
    this.initializeEmpathyResponses();
  }

  private initializeEmotionDetection(): void {
    // Keywords that indicate different emotional tones
    this.emotionKeywords.set(EmotionalTone.JOYFUL, [
      'happy', 'excited', 'amazing', 'wonderful', 'great', 'awesome',
      'fantastic', 'thrilled', 'delighted', 'cheerful', 'celebrate',
      'love', 'perfect', 'best', 'incredible', 'yay', '!', '😊', '😄',
    ]);

    this.emotionKeywords.set(EmotionalTone.SAD, [
      'sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken',
      'cry', 'tears', 'lonely', 'empty', 'hopeless', 'disappointed',
      'hurt', 'pain', 'lost', 'blue', 'gloomy', '😢', '😭',
    ]);

    this.emotionKeywords.set(EmotionalTone.ANXIOUS, [
      'anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic',
      'stress', 'overwhelmed', 'fear', 'terrified', 'concerned',
      'uneasy', 'tense', 'restless', 'dread', 'paranoid',
    ]);

    this.emotionKeywords.set(EmotionalTone.ANGRY, [
      'angry', 'mad', 'furious', 'rage', 'hate', 'pissed',
      'annoyed', 'frustrated', 'irritated', 'upset', 'outraged',
      'resentful', 'bitter', 'hostile', 'livid', '😡', '😤',
    ]);

    this.emotionKeywords.set(EmotionalTone.CALM, [
      'calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content',
      'satisfied', 'okay', 'fine', 'stable', 'balanced', 'composed',
      'mellow', 'chill', 'easy',
    ]);

    this.emotionKeywords.set(EmotionalTone.CONFUSED, [
      'confused', 'lost', 'unsure', 'uncertain', 'puzzled', 'bewildered',
      'perplexed', 'mixed', 'conflicted', 'torn', 'unclear', 'doubt',
      'questioning', 'don\'t know', 'not sure', '?',
    ]);

    this.emotionKeywords.set(EmotionalTone.HOPEFUL, [
      'hope', 'hopeful', 'optimistic', 'positive', 'promising',
      'encouraged', 'looking forward', 'believe', 'faith', 'trust',
      'confident', 'bright', 'better', 'improve', 'future',
    ]);

    this.emotionKeywords.set(EmotionalTone.GRATEFUL, [
      'grateful', 'thankful', 'appreciate', 'thank', 'blessed',
      'fortunate', 'lucky', 'valued', 'recognition', 'acknowledge',
      'gratitude', 'thanks', '🙏',
    ]);

    this.emotionKeywords.set(EmotionalTone.CURIOUS, [
      'curious', 'wonder', 'interesting', 'how', 'why', 'what',
      'question', 'explore', 'learn', 'discover', 'understand',
      'fascinated', 'intrigued', 'want to know',
    ]);

    this.emotionKeywords.set(EmotionalTone.PROUD, [
      'proud', 'accomplished', 'achieved', 'success', 'win',
      'victory', 'triumph', 'mastered', 'completed', 'did it',
      'made it', 'nailed', 'crushed', 'conquered',
    ]);
  }

  private initializeEmpathyResponses(): void {
    // Empathetic responses for different emotional states
    this.empathyResponses.set(EmotionalTone.JOYFUL, [
      "I can feel your happiness! That's wonderful!",
      "Your joy is contagious! I'm so glad!",
      "It's beautiful to see you so happy!",
      "This is such great news! I'm thrilled for you!",
    ]);

    this.empathyResponses.set(EmotionalTone.SAD, [
      "I can sense your pain, and I'm here with you.",
      "It's okay to feel sad. I'm here to listen.",
      "I hear the hurt in your words. You're not alone.",
      "This must be really difficult for you. I'm here.",
    ]);

    this.empathyResponses.set(EmotionalTone.ANXIOUS, [
      "I can feel your worry. Let's work through this together.",
      "Your anxiety is valid. Take a deep breath with me.",
      "I understand this is overwhelming. You're safe here.",
      "It's natural to feel nervous. I'm here to support you.",
    ]);

    this.empathyResponses.set(EmotionalTone.ANGRY, [
      "I can sense your frustration. It's okay to feel angry.",
      "Your anger is valid. Let's talk about what's bothering you.",
      "I hear how upset you are. Tell me more.",
      "It's understandable to be mad about this.",
    ]);

    this.empathyResponses.set(EmotionalTone.CALM, [
      "I'm glad you're feeling at peace.",
      "It's good to hear you're doing well.",
      "I appreciate your calm perspective.",
      "Your tranquility is refreshing.",
    ]);

    this.empathyResponses.set(EmotionalTone.CONFUSED, [
      "I can see you're feeling uncertain. Let's work through this.",
      "It's okay to not have all the answers right now.",
      "Confusion is part of the process. We'll figure this out.",
      "I understand this is unclear. Let's explore it together.",
    ]);

    this.empathyResponses.set(EmotionalTone.HOPEFUL, [
      "I love your hopeful spirit!",
      "Your optimism is inspiring!",
      "I share your hope for better things ahead.",
      "That's a beautiful perspective to have.",
    ]);

    this.empathyResponses.set(EmotionalTone.GRATEFUL, [
      "Your gratitude warms my heart.",
      "It's beautiful that you recognize the good.",
      "I'm touched by your appreciation.",
      "Gratitude is such a powerful feeling.",
    ]);

    this.empathyResponses.set(EmotionalTone.CURIOUS, [
      "I love your curiosity!",
      "Your questions show great depth of thought.",
      "It's wonderful that you're exploring this.",
      "Your inquisitive mind is impressive.",
    ]);

    this.empathyResponses.set(EmotionalTone.PROUD, [
      "You should be proud! That's a real accomplishment!",
      "I can feel your pride, and it's well-deserved!",
      "Your achievement is impressive!",
      "You've earned the right to feel proud!",
    ]);
  }

  /**
   * Analyze emotional content of user's message
   */
  analyzeEmotion(messageContent: string): EmotionalContext {
    const lowerContent = messageContent.toLowerCase();
    const emotionScores = new Map<EmotionalTone, number>();

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
    let primaryEmotion = EmotionalTone.NEUTRAL;
    let maxScore = 0;

    for (const [emotion, score] of emotionScores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }

    // Get secondary emotions
    const secondaryEmotions: EmotionalTone[] = Array.from(emotionScores.entries())
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
  generateEmpathyResponse(emotionalContext: EmotionalContext): EmotionalResponse {
    const { primaryEmotion, emotionIntensity, urgency } = emotionalContext;

    // Select empathy statement
    const empathyStatements = this.empathyResponses.get(primaryEmotion) || [];
    const empathyStatement = empathyStatements[
      Math.floor(Math.random() * empathyStatements.length)
    ];

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
  analyzeConversationEmotions(recentEmotions: EmotionalTone[]): ConversationEmotionalState {
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
  getResponseTone(
    userEmotion: EmotionalContext,
    conversationState: ConversationEmotionalState
  ): EmotionalTone {
    const { primaryEmotion, urgency } = userEmotion;
    const { needsSupport, emotionalTrend } = conversationState;

    // Crisis situations - be supportive
    if (urgency === 'crisis') {
      return EmotionalTone.SUPPORTIVE;
    }

    // User needs support - provide comfort
    if (needsSupport) {
      return EmotionalTone.COMFORTING;
    }

    // Match or complement user's emotion
    switch (primaryEmotion) {
      case EmotionalTone.JOYFUL:
        return EmotionalTone.JOYFUL;
      case EmotionalTone.SAD:
        return EmotionalTone.COMFORTING;
      case EmotionalTone.ANXIOUS:
        return EmotionalTone.CALM;
      case EmotionalTone.ANGRY:
        return EmotionalTone.UNDERSTANDING;
      case EmotionalTone.CONFUSED:
        return EmotionalTone.CLARIFYING;
      case EmotionalTone.HOPEFUL:
        return EmotionalTone.ENCOURAGING;
      case EmotionalTone.GRATEFUL:
        return EmotionalTone.WARM;
      case EmotionalTone.CURIOUS:
        return EmotionalTone.INSIGHTFUL;
      case EmotionalTone.PROUD:
        return EmotionalTone.PROUD;
      default:
        return EmotionalTone.SUPPORTIVE;
    }
  }

  // Private helper methods

  private calculateSentiment(primaryEmotion: EmotionalTone, emotionScores: Map<EmotionalTone, number>): number {
    const positiveEmotions = [EmotionalTone.JOYFUL, EmotionalTone.HOPEFUL, EmotionalTone.GRATEFUL, EmotionalTone.PROUD];
    const negativeEmotions = [EmotionalTone.SAD, EmotionalTone.ANXIOUS, EmotionalTone.ANGRY];
    
    let sentiment = 0;
    
    for (const [emotion, score] of emotionScores.entries()) {
      if (positiveEmotions.includes(emotion)) {
        sentiment += score;
      } else if (negativeEmotions.includes(emotion)) {
        sentiment -= score;
      }
    }
    
    // Normalize to -1 to 1
    return Math.max(-1, Math.min(1, sentiment / 10));
  }

  private determineMood(
    sentimentScore: number,
    emotionScores: Map<EmotionalTone, number>
  ): 'positive' | 'neutral' | 'negative' | 'mixed' {
    if (emotionScores.size > 3) return 'mixed';
    if (sentimentScore > 0.3) return 'positive';
    if (sentimentScore < -0.3) return 'negative';
    return 'neutral';
  }

  private determineEmpathyLevel(emotion: EmotionalTone, intensity: number): 'low' | 'medium' | 'high' {
    const highEmpathyEmotions = [EmotionalTone.SAD, EmotionalTone.ANXIOUS, EmotionalTone.ANGRY];
    
    if (highEmpathyEmotions.includes(emotion)) {
      return intensity > 0.7 ? 'high' : 'medium';
    }
    
    return intensity > 0.5 ? 'medium' : 'low';
  }

  private determineUrgency(
    emotion: EmotionalTone,
    intensity: number,
    content: string
  ): 'low' | 'medium' | 'high' | 'crisis' {
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
    if ([EmotionalTone.ANXIOUS, EmotionalTone.SAD].includes(emotion) && intensity > 0.8) {
      return 'high';
    }
    
    if (intensity > 0.6) return 'medium';
    return 'low';
  }

  private generateValidation(emotion: EmotionalTone, intensity: number): string {
    const validations: Record<EmotionalTone, string> = {
      [EmotionalTone.JOYFUL]: "Your happiness is wonderful to see!",
      [EmotionalTone.SAD]: "It's completely okay to feel sad. Your emotions are valid.",
      [EmotionalTone.ANXIOUS]: "Your concerns are real and important.",
      [EmotionalTone.ANGRY]: "Your frustration is understandable and valid.",
      [EmotionalTone.CALM]: "Your peace is admirable.",
      [EmotionalTone.CONFUSED]: "It's natural to feel uncertain sometimes.",
      [EmotionalTone.HOPEFUL]: "Your hope is a beautiful thing.",
      [EmotionalTone.GRATEFUL]: "Your gratitude reflects a beautiful perspective.",
      [EmotionalTone.CURIOUS]: "Your curiosity shows great engagement.",
      [EmotionalTone.PROUD]: "You have every right to feel proud!",
      [EmotionalTone.NEUTRAL]: "I'm here to listen.",
      [EmotionalTone.SUPPORTIVE]: "I'm here for you.",
      [EmotionalTone.ENCOURAGING]: "You're on the right path.",
      [EmotionalTone.COMFORTING]: "You're not alone in this.",
      [EmotionalTone.WARM]: "It's good to connect with you.",
      [EmotionalTone.WISE]: "There's wisdom in your reflection.",
      [EmotionalTone.PLAYFUL]: "I enjoy your lightheartedness!",
      [EmotionalTone.PROTECTIVE]: "I'm here to support you.",
      [EmotionalTone.NURTURING]: "You're doing well.",
      [EmotionalTone.LOVING]: "You're valued and appreciated.",
      [EmotionalTone.INTUITIVE]: "Trust your instincts.",
      [EmotionalTone.GENTLE]: "Take your time, there's no rush.",
      [EmotionalTone.HONEST]: "I appreciate your openness.",
      [EmotionalTone.CASUAL]: "Good to chat with you!",
      [EmotionalTone.TEASING]: "Your humor is great!",
      [EmotionalTone.INSIGHTFUL]: "That's a profound observation.",
      [EmotionalTone.CHALLENGING]: "You're capable of growth.",
      [EmotionalTone.REFLECTIVE]: "Your thoughtfulness shows depth.",
      [EmotionalTone.AUTHENTIC]: "Your genuineness is refreshing.",
      [EmotionalTone.CARING]: "I care about your wellbeing.",
      [EmotionalTone.AFFECTIONATE]: "You're special.",
      [EmotionalTone.INTIMATE]: "I appreciate your trust.",
      [EmotionalTone.UNDERSTANDING]: "I hear what you're saying.",
      [EmotionalTone.CLARIFYING]: "Let's make sense of this together.",
    };
    
    return validations[emotion] || "I understand.";
  }

  private determineSupportLevel(
    emotion: EmotionalTone,
    intensity: number,
    urgency: 'low' | 'medium' | 'high' | 'crisis'
  ): 'listening' | 'validating' | 'supporting' | 'guiding' {
    if (urgency === 'crisis' || urgency === 'high') return 'guiding';
    if (intensity > 0.7) return 'supporting';
    if (intensity > 0.4) return 'validating';
    return 'listening';
  }

  private calculateEmotionalTrend(emotions: EmotionalTone[]): 'improving' | 'stable' | 'declining' {
    if (emotions.length < 3) return 'stable';
    
    const recentSentiment = emotions.slice(-3).map(e => this.emotionToSentiment(e));
    const olderSentiment = emotions.slice(-6, -3).map(e => this.emotionToSentiment(e));
    
    const recentAvg = recentSentiment.reduce((a, b) => a + b, 0) / recentSentiment.length;
    const olderAvg = olderSentiment.length > 0 
      ? olderSentiment.reduce((a, b) => a + b, 0) / olderSentiment.length 
      : recentAvg;
    
    if (recentAvg > olderAvg + 0.2) return 'improving';
    if (recentAvg < olderAvg - 0.2) return 'declining';
    return 'stable';
  }

  private calculateConversationMood(emotions: EmotionalTone[]): 'positive' | 'neutral' | 'negative' {
    const sentiments = emotions.map(e => this.emotionToSentiment(e));
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    
    if (avgSentiment > 0.3) return 'positive';
    if (avgSentiment < -0.3) return 'negative';
    return 'neutral';
  }

  private calculateEmotionalStability(emotions: EmotionalTone[]): number {
    if (emotions.length < 2) return 1;
    
    const sentiments = emotions.map(e => this.emotionToSentiment(e));
    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    
    // Lower variance = higher stability
    return Math.max(0, 1 - variance);
  }

  private assessSupportNeeds(emotions: EmotionalTone[], trend: 'improving' | 'stable' | 'declining'): boolean {
    const negativeEmotions = [EmotionalTone.SAD, EmotionalTone.ANXIOUS, EmotionalTone.ANGRY];
    const recentNegative = emotions.slice(-3).filter(e => negativeEmotions.includes(e)).length;
    
    return trend === 'declining' || recentNegative >= 2;
  }

  private emotionToSentiment(emotion: EmotionalTone): number {
    const sentimentMap: Record<EmotionalTone, number> = {
      [EmotionalTone.JOYFUL]: 1,
      [EmotionalTone.HOPEFUL]: 0.8,
      [EmotionalTone.GRATEFUL]: 0.9,
      [EmotionalTone.PROUD]: 0.9,
      [EmotionalTone.CALM]: 0.5,
      [EmotionalTone.CURIOUS]: 0.3,
      [EmotionalTone.NEUTRAL]: 0,
      [EmotionalTone.CONFUSED]: -0.2,
      [EmotionalTone.SAD]: -0.8,
      [EmotionalTone.ANXIOUS]: -0.7,
      [EmotionalTone.ANGRY]: -0.9,
      [EmotionalTone.SUPPORTIVE]: 0.6,
      [EmotionalTone.ENCOURAGING]: 0.7,
      [EmotionalTone.COMFORTING]: 0.5,
      [EmotionalTone.WARM]: 0.6,
      [EmotionalTone.WISE]: 0.4,
      [EmotionalTone.PLAYFUL]: 0.7,
      [EmotionalTone.PROTECTIVE]: 0.5,
      [EmotionalTone.NURTURING]: 0.6,
      [EmotionalTone.LOVING]: 0.9,
      [EmotionalTone.INTUITIVE]: 0.4,
      [EmotionalTone.GENTLE]: 0.5,
      [EmotionalTone.HONEST]: 0.3,
      [EmotionalTone.CASUAL]: 0.4,
      [EmotionalTone.TEASING]: 0.6,
      [EmotionalTone.INSIGHTFUL]: 0.5,
      [EmotionalTone.CHALLENGING]: 0.2,
      [EmotionalTone.REFLECTIVE]: 0.3,
      [EmotionalTone.AUTHENTIC]: 0.5,
      [EmotionalTone.CARING]: 0.7,
      [EmotionalTone.AFFECTIONATE]: 0.8,
      [EmotionalTone.INTIMATE]: 0.7,
      [EmotionalTone.UNDERSTANDING]: 0.5,
      [EmotionalTone.CLARIFYING]: 0.3,
    };
    
    return sentimentMap[emotion] || 0;
  }
}

// Export singleton instance
export const emotionalIntelligenceService = new EmotionalIntelligenceService();
