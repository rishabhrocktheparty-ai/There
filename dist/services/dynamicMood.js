"use strict";
/**
 * Dynamic Mood and Tone Service
 * Manages mood states, tone variations, and temporal context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicMoodService = exports.DynamicMoodService = void 0;
const client_1 = require("@prisma/client");
class DynamicMoodService {
    /**
     * Calculate current mood state based on context
     */
    calculateMoodState(basePersonality, conversationHistory, temporal, userEmotion) {
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
    modulateTone(baseTone, moodState, temporal, userEmotion, relationshipType) {
        const reasons = [];
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
        }
        else if (temporal.timeOfDay === 'night') {
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
    getTemporalContext(relationshipCreatedAt, lastInteractionAt, currentMessageCount = 0) {
        const now = new Date();
        const hour = now.getHours();
        // Determine time of day
        let timeOfDay;
        if (hour >= 5 && hour < 12)
            timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17)
            timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 22)
            timeOfDay = 'evening';
        else
            timeOfDay = 'night';
        // Determine day of week
        const dayOfWeek = now.getDay() === 0 || now.getDay() === 6 ? 'weekend' : 'weekday';
        // Calculate relationship age in days
        const relationshipAge = Math.floor((now.getTime() - relationshipCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
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
    generateMoodDescription(moodState, toneModulation) {
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
    getBaseMood(traits) {
        // Determine base mood from personality traits
        if (traits.warmth > 0.7 && traits.empathy > 0.7) {
            return client_1.EmotionalTone.WARM;
        }
        if (traits.playfulness > 0.7) {
            return client_1.EmotionalTone.PLAYFUL;
        }
        if (traits.wisdom > 0.7) {
            return client_1.EmotionalTone.WISE;
        }
        if (traits.nurturing > 0.7) {
            return client_1.EmotionalTone.NURTURING;
        }
        return client_1.EmotionalTone.SUPPORTIVE;
    }
    applyTemporalAdjustment(mood, temporal) {
        // Night time - calmer moods
        if (temporal.timeOfDay === 'night') {
            if (mood === client_1.EmotionalTone.PLAYFUL)
                return client_1.EmotionalTone.GENTLE;
            if (mood === client_1.EmotionalTone.JOYFUL)
                return client_1.EmotionalTone.CALM;
        }
        // Morning - more energetic
        if (temporal.timeOfDay === 'morning') {
            if (mood === client_1.EmotionalTone.CALM)
                return client_1.EmotionalTone.ENCOURAGING;
        }
        return mood;
    }
    calculateEnergy(temporal, history) {
        let energy = 0.7; // Base energy
        // Time of day impact
        if (temporal.timeOfDay === 'morning')
            energy += 0.2;
        else if (temporal.timeOfDay === 'night')
            energy -= 0.3;
        // Conversation length impact (fatigue)
        const fatigueFactor = Math.min(temporal.conversationLength / 20, 0.3);
        energy -= fatigueFactor;
        // Weekend boost
        if (temporal.dayOfWeek === 'weekend')
            energy += 0.1;
        return Math.max(0, Math.min(1, energy));
    }
    calculateEngagement(temporal, historyLength) {
        let engagement = 0.7; // Base engagement
        // Engagement increases with conversation
        engagement += Math.min(historyLength / 10, 0.2);
        // Decreases after long absence
        if (temporal.timeSinceLastInteraction > 168) {
            engagement -= 0.2; // Takes time to re-engage
        }
        // Weekend might mean more relaxed engagement
        if (temporal.dayOfWeek === 'weekend')
            engagement += 0.1;
        return Math.max(0, Math.min(1, engagement));
    }
    calculateConsistency(history, traits) {
        if (history.length < 3)
            return 1;
        // Check how consistent recent emotions are
        const recentEmotions = history.slice(-5);
        const uniqueEmotions = new Set(recentEmotions).size;
        // More personality-consistent roles should have higher consistency
        const personalityConsistency = (traits.authority + traits.wisdom) / 2;
        // Lower unique emotions = higher consistency
        const emotionConsistency = 1 - uniqueEmotions / recentEmotions.length;
        return (personalityConsistency + emotionConsistency) / 2;
    }
    calculateVolatility(history) {
        if (history.length < 2)
            return 0;
        // Count emotion changes in recent history
        let changes = 0;
        for (let i = 1; i < Math.min(history.length, 10); i++) {
            if (history[i] !== history[i - 1])
                changes++;
        }
        return Math.min(changes / 9, 1);
    }
    softenTone(tone) {
        const softenMap = {
            [client_1.EmotionalTone.JOYFUL]: client_1.EmotionalTone.WARM,
            [client_1.EmotionalTone.PLAYFUL]: client_1.EmotionalTone.GENTLE,
            [client_1.EmotionalTone.ENCOURAGING]: client_1.EmotionalTone.SUPPORTIVE,
            [client_1.EmotionalTone.CHALLENGING]: client_1.EmotionalTone.REFLECTIVE,
        };
        return softenMap[tone] || tone;
    }
    getComfortingTone(tone) {
        const comfortMap = {
            [client_1.EmotionalTone.PLAYFUL]: client_1.EmotionalTone.GENTLE,
            [client_1.EmotionalTone.JOYFUL]: client_1.EmotionalTone.COMFORTING,
            [client_1.EmotionalTone.CASUAL]: client_1.EmotionalTone.SUPPORTIVE,
            [client_1.EmotionalTone.CHALLENGING]: client_1.EmotionalTone.UNDERSTANDING,
        };
        return comfortMap[tone] || client_1.EmotionalTone.COMFORTING;
    }
    energizeTone(tone) {
        const energizeMap = {
            [client_1.EmotionalTone.CALM]: client_1.EmotionalTone.ENCOURAGING,
            [client_1.EmotionalTone.GENTLE]: client_1.EmotionalTone.WARM,
            [client_1.EmotionalTone.SUPPORTIVE]: client_1.EmotionalTone.ENCOURAGING,
        };
        return energizeMap[tone] || tone;
    }
    calmTone(tone) {
        const calmMap = {
            [client_1.EmotionalTone.JOYFUL]: client_1.EmotionalTone.CALM,
            [client_1.EmotionalTone.PLAYFUL]: client_1.EmotionalTone.GENTLE,
            [client_1.EmotionalTone.ENCOURAGING]: client_1.EmotionalTone.SUPPORTIVE,
        };
        return calmMap[tone] || tone;
    }
    warmTone(tone) {
        const warmMap = {
            [client_1.EmotionalTone.NEUTRAL]: client_1.EmotionalTone.WARM,
            [client_1.EmotionalTone.CALM]: client_1.EmotionalTone.WARM,
            [client_1.EmotionalTone.SUPPORTIVE]: client_1.EmotionalTone.CARING,
        };
        return warmMap[tone] || client_1.EmotionalTone.WARM;
    }
    isNegativeEmotion(emotion) {
        return [client_1.EmotionalTone.SAD, client_1.EmotionalTone.ANXIOUS, client_1.EmotionalTone.ANGRY].includes(emotion);
    }
    canBeEnergetic(roleType) {
        // Some roles are naturally more energetic in mornings
        return [client_1.RoleType.SIBLING, client_1.RoleType.FRIEND, client_1.RoleType.ROMANTIC_PARTNER].includes(roleType);
    }
    describeLevel(level) {
        if (level < 0.3)
            return 'Low';
        if (level < 0.6)
            return 'Moderate';
        if (level < 0.8)
            return 'High';
        return 'Very High';
    }
}
exports.DynamicMoodService = DynamicMoodService;
// Export singleton instance
exports.dynamicMoodService = new DynamicMoodService();
