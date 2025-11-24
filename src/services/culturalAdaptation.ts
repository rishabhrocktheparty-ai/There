/**
 * Cultural and Contextual Adaptation Service
 * Handles cultural sensitivity, language adaptation, and personalization
 */

export interface CulturalContext {
  language: string;
  region: string;
  culturalNorms: string[];
  communicationStyle: 'direct' | 'indirect' | 'mixed';
  formalityPreference: 'formal' | 'casual' | 'context-dependent';
}

export interface UserPreferences {
  language: string;
  communicationStyle: string;
  topicPreferences: string[];
  avoidTopics: string[];
  responseLength: 'brief' | 'moderate' | 'detailed';
  formality: 'casual' | 'professional' | 'balanced';
  humor: boolean;
  emojiUsage: boolean;
}

export interface ContextualAdaptation {
  languageAdjustments: string[];
  culturalConsiderations: string[];
  personalizations: string[];
  restrictions: string[];
}

export class CulturalAdaptationService {
  private culturalProfiles: Map<string, CulturalContext>;
  private sensitiveTopics: Set<string>;

  constructor() {
    this.culturalProfiles = new Map();
    this.sensitiveTopics = new Set();
    this.initializeCulturalProfiles();
    this.initializeSensitiveTopics();
  }

  private initializeCulturalProfiles(): void {
    // Western (US/Canada/UK/Australia)
    this.culturalProfiles.set('western', {
      language: 'en',
      region: 'western',
      culturalNorms: ['individualistic', 'direct_communication', 'informal'],
      communicationStyle: 'direct',
      formalityPreference: 'casual',
    });

    // East Asian
    this.culturalProfiles.set('east_asian', {
      language: 'mixed',
      region: 'east_asia',
      culturalNorms: ['collectivistic', 'indirect_communication', 'respect_hierarchy'],
      communicationStyle: 'indirect',
      formalityPreference: 'formal',
    });

    // Latin American
    this.culturalProfiles.set('latin_american', {
      language: 'es/pt',
      region: 'latin_america',
      culturalNorms: ['family_oriented', 'warm', 'expressive'],
      communicationStyle: 'mixed',
      formalityPreference: 'context-dependent',
    });

    // Middle Eastern
    this.culturalProfiles.set('middle_eastern', {
      language: 'ar',
      region: 'middle_east',
      culturalNorms: ['family_centered', 'hospitality', 'respect_elders'],
      communicationStyle: 'indirect',
      formalityPreference: 'formal',
    });

    // South Asian
    this.culturalProfiles.set('south_asian', {
      language: 'mixed',
      region: 'south_asia',
      culturalNorms: ['collectivistic', 'respect_hierarchy', 'indirect'],
      communicationStyle: 'indirect',
      formalityPreference: 'formal',
    });

    // African
    this.culturalProfiles.set('african', {
      language: 'mixed',
      region: 'africa',
      culturalNorms: ['community_oriented', 'oral_tradition', 'respect_elders'],
      communicationStyle: 'mixed',
      formalityPreference: 'context-dependent',
    });
  }

  private initializeSensitiveTopics(): void {
    this.sensitiveTopics.add('politics');
    this.sensitiveTopics.add('religion');
    this.sensitiveTopics.add('sexual_content');
    this.sensitiveTopics.add('violence');
    this.sensitiveTopics.add('discrimination');
    this.sensitiveTopics.add('self_harm');
    this.sensitiveTopics.add('illegal_activities');
  }

  /**
   * Adapt response based on cultural context
   */
  adaptToCulture(
    culturalProfile: string,
    userPreferences: UserPreferences
  ): ContextualAdaptation {
    const culture = this.culturalProfiles.get(culturalProfile) || this.culturalProfiles.get('western')!;
    
    const languageAdjustments: string[] = [];
    const culturalConsiderations: string[] = [];
    const personalizations: string[] = [];
    const restrictions: string[] = [];

    // Language adaptations
    if (userPreferences.language !== 'en') {
      languageAdjustments.push(`Prefer ${userPreferences.language} expressions when appropriate`);
    }

    if (culture.communicationStyle === 'indirect') {
      languageAdjustments.push('Use indirect communication patterns');
      languageAdjustments.push('Avoid being too blunt or direct');
    }

    // Cultural considerations
    if (culture.culturalNorms.includes('collectivistic')) {
      culturalConsiderations.push('Emphasize family and community values');
      culturalConsiderations.push('Frame advice in terms of group harmony');
    }

    if (culture.culturalNorms.includes('respect_hierarchy')) {
      culturalConsiderations.push('Show appropriate respect for authority');
      culturalConsiderations.push('Acknowledge social structures');
    }

    if (culture.culturalNorms.includes('family_oriented')) {
      culturalConsiderations.push('Recognize importance of family');
      culturalConsiderations.push('Consider family context in advice');
    }

    // Formality preferences
    if (culture.formalityPreference === 'formal' || userPreferences.formality === 'professional') {
      languageAdjustments.push('Maintain formal tone');
      languageAdjustments.push('Use proper titles and respectful language');
    } else if (userPreferences.formality === 'casual') {
      languageAdjustments.push('Use casual, friendly language');
      languageAdjustments.push('Be approachable and relaxed');
    }

    // Personal preferences
    if (userPreferences.responseLength === 'brief') {
      personalizations.push('Keep responses concise and to the point');
    } else if (userPreferences.responseLength === 'detailed') {
      personalizations.push('Provide thorough, detailed responses');
    }

    if (!userPreferences.humor) {
      personalizations.push('Avoid jokes and humor');
    } else {
      personalizations.push('Appropriate humor is welcome');
    }

    if (!userPreferences.emojiUsage) {
      personalizations.push('Avoid using emojis');
    } else {
      personalizations.push('Emojis can enhance emotional expression');
    }

    // Topic restrictions
    userPreferences.avoidTopics.forEach((topic) => {
      restrictions.push(`Avoid discussing: ${topic}`);
    });

    return {
      languageAdjustments,
      culturalConsiderations,
      personalizations,
      restrictions,
    };
  }

  /**
   * Check if topic is culturally sensitive
   */
  isSensitiveTopic(topic: string, culturalProfile: string): boolean {
    const lowerTopic = topic.toLowerCase();

    // Universal sensitive topics
    if (this.sensitiveTopics.has(lowerTopic)) {
      return true;
    }

    // Culture-specific sensitivities
    const culture = this.culturalProfiles.get(culturalProfile);
    if (!culture) return false;

    if (culture.region === 'middle_east' || culture.region === 'south_asia') {
      if (lowerTopic.includes('religion') || lowerTopic.includes('gender roles')) {
        return true;
      }
    }

    if (culture.culturalNorms.includes('respect_hierarchy')) {
      if (lowerTopic.includes('authority') || lowerTopic.includes('rebellion')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Adapt language based on formality
   */
  adaptFormality(message: string, formalityLevel: 'casual' | 'professional' | 'balanced'): string {
    if (formalityLevel === 'casual') {
      // Already casual, no changes needed
      return message;
    }

    if (formalityLevel === 'professional') {
      // Make more formal
      let adapted = message;
      adapted = adapted.replace(/\bhey\b/gi, 'Hello');
      adapted = adapted.replace(/\byeah\b/gi, 'Yes');
      adapted = adapted.replace(/\bnah\b/gi, 'No');
      adapted = adapted.replace(/\bwanna\b/gi, 'want to');
      adapted = adapted.replace(/\bgonna\b/gi, 'going to');
      adapted = adapted.replace(/\bkinda\b/gi, 'kind of');
      return adapted;
    }

    return message;
  }

  /**
   * Generate cultural adaptation guidelines for AI prompt
   */
  generateAdaptationGuidelines(
    culturalProfile: string,
    userPreferences: UserPreferences
  ): string {
    const adaptation = this.adaptToCulture(culturalProfile, userPreferences);

    let guidelines = 'Cultural and Personal Adaptation Guidelines:\n\n';

    if (adaptation.culturalConsiderations.length > 0) {
      guidelines += 'Cultural Considerations:\n';
      adaptation.culturalConsiderations.forEach((consideration) => {
        guidelines += `- ${consideration}\n`;
      });
      guidelines += '\n';
    }

    if (adaptation.languageAdjustments.length > 0) {
      guidelines += 'Language Style:\n';
      adaptation.languageAdjustments.forEach((adjustment) => {
        guidelines += `- ${adjustment}\n`;
      });
      guidelines += '\n';
    }

    if (adaptation.personalizations.length > 0) {
      guidelines += 'Personal Preferences:\n';
      adaptation.personalizations.forEach((pref) => {
        guidelines += `- ${pref}\n`;
      });
      guidelines += '\n';
    }

    if (adaptation.restrictions.length > 0) {
      guidelines += 'Topic Restrictions:\n';
      adaptation.restrictions.forEach((restriction) => {
        guidelines += `- ${restriction}\n`;
      });
      guidelines += '\n';
    }

    return guidelines;
  }

  /**
   * Get default user preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      language: 'en',
      communicationStyle: 'balanced',
      topicPreferences: [],
      avoidTopics: [],
      responseLength: 'moderate',
      formality: 'balanced',
      humor: true,
      emojiUsage: true,
    };
  }

  /**
   * Parse user preferences from metadata
   */
  parseUserPreferences(metadata: any): UserPreferences {
    const defaults = this.getDefaultPreferences();

    if (!metadata || !metadata.preferences) {
      return defaults;
    }

    const prefs = metadata.preferences;

    return {
      language: prefs.language || defaults.language,
      communicationStyle: prefs.communicationStyle || defaults.communicationStyle,
      topicPreferences: prefs.topicPreferences || defaults.topicPreferences,
      avoidTopics: prefs.avoidTopics || defaults.avoidTopics,
      responseLength: prefs.responseLength || defaults.responseLength,
      formality: prefs.formality || defaults.formality,
      humor: prefs.humor !== undefined ? prefs.humor : defaults.humor,
      emojiUsage: prefs.emojiUsage !== undefined ? prefs.emojiUsage : defaults.emojiUsage,
    };
  }

  /**
   * Detect potential cultural profile from user data
   */
  detectCulturalProfile(userLanguage: string, userRegion?: string): string {
    // Map language/region to cultural profile
    if (userRegion) {
      const regionLower = userRegion.toLowerCase();
      if (regionLower.includes('asia') && (regionLower.includes('east') || ['cn', 'jp', 'kr'].includes(userLanguage))) {
        return 'east_asian';
      }
      if (regionLower.includes('latin') || regionLower.includes('south america')) {
        return 'latin_american';
      }
      if (regionLower.includes('middle east') || regionLower.includes('arab')) {
        return 'middle_eastern';
      }
      if (regionLower.includes('south asia') || ['hi', 'ur', 'bn'].includes(userLanguage)) {
        return 'south_asian';
      }
      if (regionLower.includes('africa')) {
        return 'african';
      }
    }

    // Default based on language
    if (['es', 'pt'].includes(userLanguage)) return 'latin_american';
    if (['ar', 'fa', 'he'].includes(userLanguage)) return 'middle_eastern';
    if (['zh', 'ja', 'ko'].includes(userLanguage)) return 'east_asian';
    if (['hi', 'ur', 'bn', 'ta'].includes(userLanguage)) return 'south_asian';

    return 'western'; // Default
  }
}

// Export singleton instance
export const culturalAdaptationService = new CulturalAdaptationService();
