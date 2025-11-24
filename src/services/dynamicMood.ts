/**
 * Dynamic Mood and Tone Service
 * Manages mood states, tone variations, and temporal context
 */

import { EmotionalTone, RoleType } from '@prisma/client';
import { PersonalityTraits } from './aiPersonality';

export interface MoodState {
  currentMood: EmotionalTone;
  energy: number; // 0-1: tired to energetic
  engagement: number; // 0-1: distant to engaged
  consistency: number; // 0-1: how consistent with personality
  volatility: number; // 0-1: stable to volatile
}

export interface TemporalContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  relationshipAge: number; // days
  timeSinceLastInteraction: number; // hours
  conversationLength: number; // messages in current session
}

export interface ToneModulation {
  baseTone: EmotionalTone;
  modifiedTone: EmotionalTone;
  intensity: number; // 0-1
  reasons: string[];
}

export class DynamicMoodService {
  /**
   * Calculate current mood state based on context
   */
  calculateMoodState(
    basePersonality: PersonalityTraits,
    conversationHistory: EmotionalTone[],
    temporal: TemporalContext,
    userEmotion: EmotionalTone
  ): MoodState {
    // Base mood from personality
    let currentMood = this.getBaseMood(basePersonality);

    // Adjust for time of day
    currentMood = this.applyTemporalAdjustment(currentMood, temporal);

    // Calculate energy level
    const energy = this.calculateEnergy(temporal, conversationHistory);

    // Calculate engagement
    const engagement = this.calculateEngagement(temporal, conversationHistory.length);

    // Calculate consistency with personality
    const consistency = this.calculateConsistency(conversationHistory, basePersonality);

    // Calculate emotional volatility
    const volatility = this.calculateVolatility(conversationHistory);

    return {
      currentMood,
      energy,
      engagement,
      consistency,
      volatility,
    };
  }

  /**
   * Modulate tone based on context
   */
  modulateTone(
    baseTone: EmotionalTone,
    moodState: MoodState,
    temporal: TemporalContext,
    userEmotion: EmotionalTone,
    relationshipType: RoleType
  ): ToneModulation {
    const reasons: string[] = [];
    let modifiedTone = baseTone;
    let intensity = 0.7; // Default intensity

    // Adjust for low energy (late night, long conversation)
    if (moodState.energy < 0.3) {
      modifiedTone = this.softenTone(modifiedTone);
      intensity *= 0.7;
      reasons.push('Low energy - softer tone');
    }

    // Adjust for high engagement
    if (moodState.engagement > 0.8) {
      intensity = Math.min(1, intensity * 1.2);
      reasons.push('High engagement - increased intensity');
    }

    // Match user's emotional state (empathy)
    if (this.isNegativeEmotion(userEmotion)) {
      modifiedTone = this.getComfortingTone(modifiedTone);
      reasons.push('Responding to user distress');
    }

    // Time of day adjustments
    if (temporal.timeOfDay === 'morning') {
      if (this.canBeEnergetic(relationshipType)) {
        modifiedTone = this.energizeTone(modifiedTone);
        reasons.push('Morning energy boost');
      }
    } else if (temporal.timeOfDay === 'night') {
      modifiedTone = this.calmTone(modifiedTone);
      intensity *= 0.8;
      reasons.push('Evening calm');
    }

    // Long time since last interaction
    if (temporal.timeSinceLastInteraction > 168) {
      // 1 week
      modifiedTone = this.warmTone(modifiedTone);
      reasons.push('Warm reconnection after time apart');
    }

    // New relationship - more formal/careful
    if (temporal.relationshipAge < 7) {
      intensity *= 0.8;
      reasons.push('Early relationship - measured tone');
    }

    // Long conversation - maintain consistency
    if (temporal.conversationLength > 10) {
      // Use consistency to stabilize tone
      const stabilizationFactor = moodState.consistency;
      intensity = intensity * (0.5 + stabilizationFactor * 0.5);
      reasons.push('Long conversation - maintaining consistency');
    }

    return {
      baseTone,
      modifiedTone,
      intensity,
      reasons,
    };
  }

  /**
   * Get temporal context from current time and relationship data
   */
  getTemporalContext(
    relationshipCreatedAt: Date,
    lastInteractionAt?: Date,
    currentMessageCount: number = 0
  ): TemporalContext {
    const now = new Date();
    const hour = now.getHours();

    // Determine time of day
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Determine day of week
    const dayOfWeek = now.getDay() === 0 || now.getDay() === 6 ? 'weekend' : 'weekday';

    // Calculate relationship age in days
    const relationshipAge = Math.floor(
      (now.getTime() - relationshipCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate time since last interaction in hours
    const timeSinceLastInteraction = lastInteractionAt
      ? (now.getTime() - lastInteractionAt.getTime()) / (1000 * 60 * 60)
      : 0;

    return {
      timeOfDay,
      dayOfWeek,
      relationshipAge,
      timeSinceLastInteraction,
      conversationLength: currentMessageCount,
    };
  }

  /**
   * Generate mood variation description for AI prompt
   */
  generateMoodDescription(moodState: MoodState, toneModulation: ToneModulation): string {
    let description = `Current Mood: ${moodState.currentMood}\n`;
    description += `Energy Level: ${this.describeLevel(moodState.energy)}\n`;
    description += `Engagement: ${this.describeLevel(moodState.engagement)}\n`;
    description += `Emotional Tone: ${toneModulation.modifiedTone} (intensity: ${Math.round(toneModulation.intensity * 100)}%)\n`;

    if (toneModulation.reasons.length > 0) {
      description += `\nTone Adjustments:\n`;
      toneModulation.reasons.forEach((reason) => {
        description += `- ${reason}\n`;
      });
    }

    return description;
  }

  // Private helper methods

  private getBaseMood(traits: PersonalityTraits): EmotionalTone {
    // Determine base mood from personality traits
    if (traits.warmth > 0.7 && traits.empathy > 0.7) {
      return EmotionalTone.WARM;
    }
    if (traits.playfulness > 0.7) {
      return EmotionalTone.PLAYFUL;
    }
    if (traits.wisdom > 0.7) {
      return EmotionalTone.WISE;
    }
    if (traits.nurturing > 0.7) {
      return EmotionalTone.NURTURING;
    }
    return EmotionalTone.SUPPORTIVE;
  }

  private applyTemporalAdjustment(
    mood: EmotionalTone,
    temporal: TemporalContext
  ): EmotionalTone {
    // Night time - calmer moods
    if (temporal.timeOfDay === 'night') {
      if (mood === EmotionalTone.PLAYFUL) return EmotionalTone.GENTLE;
      if (mood === EmotionalTone.JOYFUL) return EmotionalTone.CALM;
    }

    // Morning - more energetic
    if (temporal.timeOfDay === 'morning') {
      if (mood === EmotionalTone.CALM) return EmotionalTone.ENCOURAGING;
    }

    return mood;
  }

  private calculateEnergy(temporal: TemporalContext, history: EmotionalTone[]): number {
    let energy = 0.7; // Base energy

    // Time of day impact
    if (temporal.timeOfDay === 'morning') energy += 0.2;
    else if (temporal.timeOfDay === 'night') energy -= 0.3;

    // Conversation length impact (fatigue)
    const fatigueFactor = Math.min(temporal.conversationLength / 20, 0.3);
    energy -= fatigueFactor;

    // Weekend boost
    if (temporal.dayOfWeek === 'weekend') energy += 0.1;

    return Math.max(0, Math.min(1, energy));
  }

  private calculateEngagement(temporal: TemporalContext, historyLength: number): number {
    let engagement = 0.7; // Base engagement

    // Engagement increases with conversation
    engagement += Math.min(historyLength / 10, 0.2);

    // Decreases after long absence
    if (temporal.timeSinceLastInteraction > 168) {
      engagement -= 0.2; // Takes time to re-engage
    }

    // Weekend might mean more relaxed engagement
    if (temporal.dayOfWeek === 'weekend') engagement += 0.1;

    return Math.max(0, Math.min(1, engagement));
  }

  private calculateConsistency(history: EmotionalTone[], traits: PersonalityTraits): number {
    if (history.length < 3) return 1;

    // Check how consistent recent emotions are
    const recentEmotions = history.slice(-5);
    const uniqueEmotions = new Set(recentEmotions).size;

    // More personality-consistent roles should have higher consistency
    const personalityConsistency = (traits.authority + traits.wisdom) / 2;

    // Lower unique emotions = higher consistency
    const emotionConsistency = 1 - uniqueEmotions / recentEmotions.length;

    return (personalityConsistency + emotionConsistency) / 2;
  }

  private calculateVolatility(history: EmotionalTone[]): number {
    if (history.length < 2) return 0;

    // Count emotion changes in recent history
    let changes = 0;
    for (let i = 1; i < Math.min(history.length, 10); i++) {
      if (history[i] !== history[i - 1]) changes++;
    }

    return Math.min(changes / 9, 1);
  }

  private softenTone(tone: EmotionalTone): EmotionalTone {
    const softenMap: Partial<Record<EmotionalTone, EmotionalTone>> = {
      [EmotionalTone.JOYFUL]: EmotionalTone.WARM,
      [EmotionalTone.PLAYFUL]: EmotionalTone.GENTLE,
      [EmotionalTone.ENCOURAGING]: EmotionalTone.SUPPORTIVE,
      [EmotionalTone.CHALLENGING]: EmotionalTone.REFLECTIVE,
    };
    return softenMap[tone] || tone;
  }

  private getComfortingTone(tone: EmotionalTone): EmotionalTone {
    const comfortMap: Partial<Record<EmotionalTone, EmotionalTone>> = {
      [EmotionalTone.PLAYFUL]: EmotionalTone.GENTLE,
      [EmotionalTone.JOYFUL]: EmotionalTone.COMFORTING,
      [EmotionalTone.CASUAL]: EmotionalTone.SUPPORTIVE,
      [EmotionalTone.CHALLENGING]: EmotionalTone.UNDERSTANDING,
    };
    return comfortMap[tone] || EmotionalTone.COMFORTING;
  }

  private energizeTone(tone: EmotionalTone): EmotionalTone {
    const energizeMap: Partial<Record<EmotionalTone, EmotionalTone>> = {
      [EmotionalTone.CALM]: EmotionalTone.ENCOURAGING,
      [EmotionalTone.GENTLE]: EmotionalTone.WARM,
      [EmotionalTone.SUPPORTIVE]: EmotionalTone.ENCOURAGING,
    };
    return energizeMap[tone] || tone;
  }

  private calmTone(tone: EmotionalTone): EmotionalTone {
    const calmMap: Partial<Record<EmotionalTone, EmotionalTone>> = {
      [EmotionalTone.JOYFUL]: EmotionalTone.CALM,
      [EmotionalTone.PLAYFUL]: EmotionalTone.GENTLE,
      [EmotionalTone.ENCOURAGING]: EmotionalTone.SUPPORTIVE,
    };
    return calmMap[tone] || tone;
  }

  private warmTone(tone: EmotionalTone): EmotionalTone {
    const warmMap: Partial<Record<EmotionalTone, EmotionalTone>> = {
      [EmotionalTone.NEUTRAL]: EmotionalTone.WARM,
      [EmotionalTone.CALM]: EmotionalTone.WARM,
      [EmotionalTone.SUPPORTIVE]: EmotionalTone.CARING,
    };
    return warmMap[tone] || EmotionalTone.WARM;
  }

  private isNegativeEmotion(emotion: EmotionalTone): boolean {
    return [EmotionalTone.SAD, EmotionalTone.ANXIOUS, EmotionalTone.ANGRY].includes(emotion);
  }

  private canBeEnergetic(roleType: RoleType): boolean {
    // Some roles are naturally more energetic in mornings
    return [RoleType.SIBLING, RoleType.FRIEND, RoleType.ROMANTIC_PARTNER].includes(roleType);
  }

  private describeLevel(level: number): string {
    if (level < 0.3) return 'Low';
    if (level < 0.6) return 'Moderate';
    if (level < 0.8) return 'High';
    return 'Very High';
  }
}

// Export singleton instance
export const dynamicMoodService = new DynamicMoodService();
