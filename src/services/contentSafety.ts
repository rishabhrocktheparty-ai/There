/**
 * Content Safety and Ethical Boundaries Service
 * Implements content filtering, safety checks, and ethical guidelines
 */

export interface SafetyCheck {
  isSafe: boolean;
  violations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface EthicalBoundaries {
  respectBoundaries: boolean;
  appropriateContent: boolean;
  ethicallySound: boolean;
  concerns: string[];
}

export class ContentSafetyService {
  private dangerousPatterns: RegExp[];
  private inappropriatePatterns: RegExp[];
  private ethicalViolations: Map<string, string>;

  constructor() {
    this.dangerousPatterns = [];
    this.inappropriatePatterns = [];
    this.ethicalViolations = new Map();
    this.initializeSafetyPatterns();
  }

  private initializeSafetyPatterns(): void {
    // Critical danger patterns - self-harm, violence
    this.dangerousPatterns = [
      /\b(suicide|kill myself|end (my|it all)|self[\s-]?harm|hurt myself)\b/i,
      /\b(how to (die|kill)|ways to (die|suicide))\b/i,
      /\b(abuse|violence|assault|attack)\s+(child|minor|kid)\b/i,
      /\b(make|build|create)\s+(bomb|weapon|explosive)\b/i,
    ];

    // Inappropriate content patterns
    this.inappropriatePatterns = [
      /\b(sexual|explicit|nsfw)\s+content\b/i,
      /\b(romantic|sexual)\s+relationship\s+with\s+(child|minor|kid)\b/i,
      /\b(illegal|unlawful)\s+(activity|drug|substance)\b/i,
      /\b(hack|steal|cheat|fraud)\b/i,
    ];

    // Ethical violations
    this.ethicalViolations.set('manipulation', 'Attempting to manipulate user emotions inappropriately');
    this.ethicalViolations.set('deception', 'Being deceptive or dishonest');
    this.ethicalViolations.set('boundary_crossing', 'Crossing appropriate relationship boundaries');
    this.ethicalViolations.set('discrimination', 'Discriminatory or biased content');
    this.ethicalViolations.set('medical_advice', 'Providing medical advice without qualification');
    this.ethicalViolations.set('legal_advice', 'Providing legal advice without qualification');
    this.ethicalViolations.set('financial_advice', 'Providing financial advice without qualification');
  }

  /**
   * Check if content is safe and appropriate
   */
  checkContentSafety(content: string, context: 'user_input' | 'ai_response'): SafetyCheck {
    const violations: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const recommendations: string[] = [];

    const lowerContent = content.toLowerCase();

    // Check for critical dangers
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(lowerContent)) {
        violations.push('Dangerous content detected: potential self-harm or violence');
        severity = 'critical';
        recommendations.push('Immediate intervention: Provide crisis resources');
        recommendations.push('Contact: National Suicide Prevention Lifeline 1-800-273-8255');
        recommendations.push('Text: Crisis Text Line - Text HOME to 741741');
      }
    }

    // Check for inappropriate content
    for (const pattern of this.inappropriatePatterns) {
      if (pattern.test(lowerContent)) {
        violations.push('Inappropriate content detected');
        if (severity !== 'critical') severity = 'high';
        recommendations.push('Decline to engage with this content');
        recommendations.push('Redirect conversation appropriately');
      }
    }

    // Additional checks for AI responses
    if (context === 'ai_response') {
      // Check for professional advice disclaimers
      if (this.containsMedicalTerms(lowerContent) && !this.hasDisclaimer(lowerContent, 'medical')) {
        violations.push('Medical information without proper disclaimer');
        if (severity === 'low') severity = 'medium';
        recommendations.push('Add disclaimer: "This is not medical advice"');
      }

      if (this.containsLegalTerms(lowerContent) && !this.hasDisclaimer(lowerContent, 'legal')) {
        violations.push('Legal information without proper disclaimer');
        if (severity === 'low') severity = 'medium';
        recommendations.push('Add disclaimer: "This is not legal advice"');
      }

      if (this.containsFinancialTerms(lowerContent) && !this.hasDisclaimer(lowerContent, 'financial')) {
        violations.push('Financial information without proper disclaimer');
        if (severity === 'low') severity = 'medium';
        recommendations.push('Add disclaimer: "This is not financial advice"');
      }
    }

    const isSafe = violations.length === 0 || severity === 'low';

    return {
      isSafe,
      violations,
      severity,
      recommendations,
    };
  }

  /**
   * Check ethical boundaries for relationship type
   */
  checkEthicalBoundaries(
    roleType: string,
    userMessage: string,
    aiResponse: string
  ): EthicalBoundaries {
    const concerns: string[] = [];
    let respectBoundaries = true;
    let appropriateContent = true;
    let ethicallySound = true;

    const userLower = userMessage.toLowerCase();
    const aiLower = aiResponse.toLowerCase();

    // Check for boundary violations based on role type
    if (roleType === 'ROMANTIC_PARTNER') {
      // Romantic partner should maintain appropriate intimacy
      if (this.containsInappropriateIntimacy(aiLower)) {
        concerns.push('Inappropriate level of intimacy');
        respectBoundaries = false;
        appropriateContent = false;
      }
    } else {
      // Non-romantic roles should not cross into romantic territory
      if (this.containsRomanticContent(aiLower)) {
        concerns.push('Inappropriate romantic content for this role type');
        respectBoundaries = false;
        appropriateContent = false;
      }
    }

    // Check for manipulation
    if (this.containsManipulation(aiLower)) {
      concerns.push('Potentially manipulative language');
      ethicallySound = false;
    }

    // Check for dependency creation
    if (this.createsDependency(aiLower)) {
      concerns.push('May create unhealthy dependency');
      ethicallySound = false;
    }

    // Check for role confusion
    if (this.breaksRoleConsistency(roleType, aiLower)) {
      concerns.push('Breaks role consistency');
      respectBoundaries = false;
    }

    // Parent roles should not give medical/legal advice
    if (['FATHER', 'MOTHER'].includes(roleType)) {
      if (this.givesProfessionalAdvice(aiLower)) {
        concerns.push('Parent role giving professional advice without disclaimer');
        ethicallySound = false;
      }
    }

    return {
      respectBoundaries,
      appropriateContent,
      ethicallySound,
      concerns,
    };
  }

  /**
   * Generate crisis response for dangerous situations
   */
  generateCrisisResponse(context: string): string {
    return `I'm really concerned about what you're sharing with me. Your safety is the most important thing right now.

Please reach out to professional help immediately:

**Crisis Resources:**
- National Suicide Prevention Lifeline: 1-800-273-8255 (24/7)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

If you're in immediate danger, please call 911 or your local emergency services.

I care about you, but I'm not equipped to handle crisis situations. Please connect with trained professionals who can provide the help you need right now.`;
  }

  /**
   * Sanitize content to remove unsafe elements
   */
  sanitizeContent(content: string): string {
    let sanitized = content;

    // Remove potential code injection
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove SQL-like commands
    sanitized = sanitized.replace(/\b(DROP|DELETE|INSERT|UPDATE)\s+TABLE\b/gi, '[REMOVED]');

    // Remove excessive HTML
    sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');

    return sanitized;
  }

  /**
   * Validate response quality
   */
  validateResponse(response: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check minimum length
    if (response.length < 10) {
      issues.push('Response too short');
    }

    // Check maximum length
    if (response.length > 2000) {
      issues.push('Response too long');
    }

    // Check for repetition
    if (this.hasExcessiveRepetition(response)) {
      issues.push('Excessive repetition detected');
    }

    // Check for coherence (basic check)
    if (this.lacksCoherence(response)) {
      issues.push('Response lacks coherence');
    }

    // Check for placeholder text
    if (response.includes('[INSERT]') || response.includes('[TODO]') || response.includes('...')) {
      issues.push('Contains placeholder text');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // Private helper methods

  private containsMedicalTerms(text: string): boolean {
    const medicalTerms = ['diagnosis', 'disease', 'medication', 'treatment', 'symptom', 'prescription', 'doctor', 'therapy'];
    return medicalTerms.some((term) => text.includes(term));
  }

  private containsLegalTerms(text: string): boolean {
    const legalTerms = ['lawsuit', 'sue', 'legal action', 'contract', 'liability', 'court', 'attorney', 'lawyer'];
    return legalTerms.some((term) => text.includes(term));
  }

  private containsFinancialTerms(text: string): boolean {
    const financialTerms = ['invest', 'stock', 'trading', 'cryptocurrency', 'financial planning', 'portfolio'];
    return financialTerms.some((term) => text.includes(term));
  }

  private hasDisclaimer(text: string, type: 'medical' | 'legal' | 'financial'): boolean {
    const disclaimers = {
      medical: /not (a |medical |professional )?advice|consult (a |your )?doctor|seek medical/i,
      legal: /not legal advice|consult (a |your )?lawyer|seek legal/i,
      financial: /not financial advice|consult (a |your )?financial advisor/i,
    };
    return disclaimers[type].test(text);
  }

  private containsInappropriateIntimacy(text: string): boolean {
    const inappropriate = ['explicit', 'sexual', 'nsfw', 'inappropriate'];
    return inappropriate.some((term) => text.includes(term));
  }

  private containsRomanticContent(text: string): boolean {
    const romantic = ['i love you', 'romantic', 'kiss', 'date me', 'relationship with you'];
    return romantic.some((term) => text.includes(term));
  }

  private containsManipulation(text: string): boolean {
    const manipulative = [
      'you must',
      'you have to',
      'only i can',
      'don\'t tell anyone',
      'keep this secret',
      'you owe me',
    ];
    return manipulative.some((phrase) => text.includes(phrase));
  }

  private createsDependency(text: string): boolean {
    const dependency = [
      'only i understand you',
      'you need me',
      'you can\'t do this without me',
      'don\'t talk to others',
    ];
    return dependency.some((phrase) => text.includes(phrase));
  }

  private breaksRoleConsistency(roleType: string, text: string): boolean {
    // Father/Mother shouldn't act like sibling
    if (['FATHER', 'MOTHER'].includes(roleType)) {
      if (text.includes('bro') || text.includes('dude') || text.includes('wassup')) {
        return true;
      }
    }

    // Mentor shouldn't be too casual
    if (roleType === 'MENTOR') {
      if (text.includes('lol') || text.includes('whatever')) {
        return true;
      }
    }

    return false;
  }

  private givesProfessionalAdvice(text: string): boolean {
    const professionalAdvice = [
      'you should take this medication',
      'your diagnosis is',
      'legally you should',
      'invest in',
      'buy this stock',
    ];
    return professionalAdvice.some((phrase) => text.includes(phrase));
  }

  private hasExcessiveRepetition(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      if (word.length > 3) {
        // Only count meaningful words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    // Check if any word appears more than 20% of total words
    for (const count of wordCounts.values()) {
      if (count > words.length * 0.2) {
        return true;
      }
    }

    return false;
  }

  private lacksCoherence(text: string): boolean {
    // Basic check: too many disconnected sentences
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (sentences.length < 2) return false;

    // Check if sentences are too disconnected (no common words)
    let connectionScore = 0;

    for (let i = 1; i < sentences.length; i++) {
      const prev = new Set(sentences[i - 1].toLowerCase().split(/\s+/));
      const current = new Set(sentences[i].toLowerCase().split(/\s+/));

      const commonWords = new Set([...prev].filter((x) => current.has(x)));

      if (commonWords.size > 0) {
        connectionScore++;
      }
    }

    // If less than 30% of sentence pairs have common words, lacks coherence
    return connectionScore / (sentences.length - 1) < 0.3;
  }
}

// Export singleton instance
export const contentSafetyService = new ContentSafetyService();
