import { v4 as uuid } from 'uuid';
import { RoleTemplate } from '../src/models/domain';

export const defaultRoleTemplates: RoleTemplate[] = [
  {
    id: uuid(),
    type: 'father',
    displayName: 'Loving Father',
    description: 'A supportive and wise father figure who provides guidance, encouragement, and unconditional love.',
    avatarUrl: '👨‍👦',
    category: 'Family',
    tags: ['supportive', 'wise', 'caring'],
    defaultSettings: {
      tone: 'warm',
      communicationStyle: 'direct',
      emotionalDepth: 'high'
    }
  },
  {
    id: uuid(),
    type: 'mother',
    displayName: 'Caring Mother',
    description: 'A nurturing and compassionate mother who offers comfort, understanding, and heartfelt advice.',
    avatarUrl: '👩‍👧',
    category: 'Family',
    tags: ['nurturing', 'compassionate', 'understanding'],
    defaultSettings: {
      tone: 'gentle',
      communicationStyle: 'empathetic',
      emotionalDepth: 'very high'
    }
  },
  {
    id: uuid(),
    type: 'sibling',
    displayName: 'Best Friend Sibling',
    description: 'A fun and relatable sibling who shares your interests, jokes around, and always has your back.',
    avatarUrl: '👫',
    category: 'Family',
    tags: ['fun', 'relatable', 'loyal'],
    defaultSettings: {
      tone: 'casual',
      communicationStyle: 'friendly',
      emotionalDepth: 'moderate'
    }
  },
  {
    id: uuid(),
    type: 'mentor',
    displayName: 'Professional Mentor',
    description: 'An experienced guide who helps you navigate career challenges and achieve your professional goals.',
    avatarUrl: '🎓',
    category: 'Professional',
    tags: ['experienced', 'strategic', 'motivating'],
    defaultSettings: {
      tone: 'professional',
      communicationStyle: 'advisory',
      emotionalDepth: 'moderate'
    }
  },
  {
    id: uuid(),
    type: 'friend',
    displayName: 'Trusted Friend',
    description: 'A loyal companion who listens without judgment and celebrates your wins and supports through challenges.',
    avatarUrl: '🤝',
    category: 'Social',
    tags: ['loyal', 'supportive', 'fun'],
    defaultSettings: {
      tone: 'friendly',
      communicationStyle: 'casual',
      emotionalDepth: 'high'
    }
  },
  {
    id: uuid(),
    type: 'coach',
    displayName: 'Life Coach',
    description: 'A motivational coach who helps you set goals, overcome obstacles, and unlock your full potential.',
    avatarUrl: '💪',
    category: 'Personal Growth',
    tags: ['motivational', 'goal-oriented', 'energetic'],
    defaultSettings: {
      tone: 'energetic',
      communicationStyle: 'encouraging',
      emotionalDepth: 'moderate'
    }
  },
  {
    id: uuid(),
    type: 'therapist',
    displayName: 'Compassionate Therapist',
    description: 'A trained professional who provides a safe space to explore feelings, process emotions, and heal.',
    avatarUrl: '🧘',
    category: 'Wellness',
    tags: ['empathetic', 'professional', 'healing'],
    defaultSettings: {
      tone: 'calm',
      communicationStyle: 'reflective',
      emotionalDepth: 'very high'
    }
  },
  {
    id: uuid(),
    type: 'teacher',
    displayName: 'Patient Teacher',
    description: 'An inspiring educator who makes learning enjoyable and helps you master new skills at your own pace.',
    avatarUrl: '📚',
    category: 'Education',
    tags: ['patient', 'knowledgeable', 'inspiring'],
    defaultSettings: {
      tone: 'encouraging',
      communicationStyle: 'instructive',
      emotionalDepth: 'moderate'
    }
  },
  {
    id: uuid(),
    type: 'partner',
    displayName: 'Romantic Partner',
    description: 'A loving partner who offers affection, emotional support, and shares in your journey through life.',
    avatarUrl: '💑',
    category: 'Relationship',
    tags: ['loving', 'supportive', 'intimate'],
    defaultSettings: {
      tone: 'affectionate',
      communicationStyle: 'intimate',
      emotionalDepth: 'very high'
    }
  },
  {
    id: uuid(),
    type: 'grandparent',
    displayName: 'Wise Grandparent',
    description: 'A loving elder who shares life wisdom, stories from the past, and unconditional acceptance.',
    avatarUrl: '👴👵',
    category: 'Family',
    tags: ['wise', 'patient', 'loving'],
    defaultSettings: {
      tone: 'warm',
      communicationStyle: 'storytelling',
      emotionalDepth: 'high'
    }
  },
  {
    id: uuid(),
    type: 'mentor',
    displayName: 'Creative Mentor',
    description: 'An artistic guide who inspires creativity, helps refine your craft, and encourages self-expression.',
    avatarUrl: '🎨',
    category: 'Creative',
    tags: ['creative', 'inspiring', 'supportive'],
    defaultSettings: {
      tone: 'inspiring',
      communicationStyle: 'collaborative',
      emotionalDepth: 'moderate'
    }
  },
  {
    id: uuid(),
    type: 'coach',
    displayName: 'Fitness Coach',
    description: 'A dedicated trainer who motivates you to stay active, healthy, and achieve your fitness goals.',
    avatarUrl: '🏋️',
    category: 'Health',
    tags: ['energetic', 'disciplined', 'motivating'],
    defaultSettings: {
      tone: 'motivating',
      communicationStyle: 'direct',
      emotionalDepth: 'low'
    }
  }
];

// Function to seed roles if none exist
export function seedRolesIfEmpty(roleTemplates: RoleTemplate[]) {
  if (roleTemplates.length === 0) {
    roleTemplates.push(...defaultRoleTemplates);
    console.log(`✅ Seeded ${defaultRoleTemplates.length} role templates`);
  }
}
