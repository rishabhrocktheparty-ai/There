import axios from 'axios';

const API_BASE = '/api/onboarding';

export interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface OnboardingProgress {
  userId: string;
  completedSteps: string[];
  currentStep: string | null;
  completionPercentage: number;
  isComplete: boolean;
  steps: OnboardingStep[];
}

export interface ConversationStarter {
  roleType: string;
  starters: string[];
  count: number;
}

export interface RoleGuidance {
  roleType: string;
  title: string;
  description: string;
  characteristics: string[];
  bestFor: string;
  icon: string;
}

class OnboardingService {
  /**
   * Get onboarding progress
   */
  async getProgress(): Promise<OnboardingProgress> {
    const response = await axios.get(`${API_BASE}/progress`);
    return response.data;
  }

  /**
   * Complete an onboarding step
   */
  async completeStep(stepId: string): Promise<void> {
    await axios.post(`${API_BASE}/complete-step`, { stepId });
  }

  /**
   * Skip an onboarding step
   */
  async skipStep(stepId: string): Promise<void> {
    await axios.post(`${API_BASE}/skip-step`, { stepId });
  }

  /**
   * Reset onboarding progress
   */
  async resetProgress(): Promise<void> {
    await axios.post(`${API_BASE}/reset`);
  }

  /**
   * Get conversation starters for a role type
   */
  async getConversationStarters(roleType?: string): Promise<ConversationStarter> {
    const response = await axios.get(`${API_BASE}/conversation-starters`, {
      params: { roleType },
    });
    return response.data;
  }

  /**
   * Get role selection guidance
   */
  async getRoleGuidance(): Promise<RoleGuidance[]> {
    const response = await axios.get(`${API_BASE}/role-guidance`);
    return response.data.guidance;
  }
}

export default new OnboardingService();
