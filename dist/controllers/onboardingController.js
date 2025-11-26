"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleGuidance = exports.getConversationStarters = exports.resetOnboarding = exports.skipOnboardingStep = exports.completeOnboardingStep = exports.getOnboardingProgress = void 0;
const prisma_1 = require("../services/prisma");
const logger_1 = require("../services/logger");
const zod_1 = require("zod");
// Define onboarding steps
const ONBOARDING_STEPS = [
    { id: 'welcome', name: 'Welcome Tutorial', order: 1 },
    { id: 'profile_setup', name: 'Complete Profile', order: 2 },
    { id: 'first_relationship', name: 'Create First Relationship', order: 3 },
    { id: 'role_selection', name: 'Select Role Template', order: 4 },
    { id: 'first_message', name: 'Send First Message', order: 5 },
    { id: 'customize_settings', name: 'Customize Settings', order: 6 },
];
// Validation schemas
const completeStepSchema = zod_1.z.object({
    stepId: zod_1.z.string().min(1),
});
const skipStepSchema = zod_1.z.object({
    stepId: zod_1.z.string().min(1),
});
/**
 * Get onboarding progress for current user
 */
const getOnboardingProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user's preferences to check completed onboarding steps
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get relationship and message counts
        const relationshipCount = await prisma_1.prisma.relationship.count({
            where: { userId },
        });
        const messageCount = await prisma_1.prisma.conversationMessage.count({
            where: { senderId: userId },
        });
        // Parse completed steps from user preferences
        const preferences = user.preferences || {};
        const completedSteps = preferences.completedOnboardingSteps || [];
        const skippedSteps = preferences.skippedOnboardingSteps || [];
        // Auto-detect completed steps based on user activity
        if (user.displayName) {
            if (!completedSteps.includes('profile_setup')) {
                completedSteps.push('profile_setup');
            }
        }
        if (relationshipCount > 0) {
            if (!completedSteps.includes('first_relationship')) {
                completedSteps.push('first_relationship');
            }
        }
        if (messageCount > 0) {
            if (!completedSteps.includes('first_message')) {
                completedSteps.push('first_message');
            }
        }
        // Build steps with completion status
        const steps = ONBOARDING_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const completedMeta = preferences.stepCompletionDates?.[step.id];
            return {
                id: step.id,
                name: step.name,
                completed: isCompleted || skippedSteps.includes(step.id),
                completedAt: completedMeta || undefined,
                order: step.order,
            };
        });
        // Calculate progress
        const completedCount = steps.filter((s) => s.completed).length;
        const completionPercentage = Math.round((completedCount / steps.length) * 100);
        const isComplete = completionPercentage === 100;
        // Find current step (first incomplete step)
        const currentStep = steps.find((s) => !s.completed)?.id || null;
        const progress = {
            userId,
            completedSteps,
            currentStep,
            completionPercentage,
            isComplete,
            steps,
        };
        res.json(progress);
    }
    catch (error) {
        logger_1.logger.error('Error getting onboarding progress', { error });
        res.status(500).json({ error: 'Failed to get onboarding progress' });
    }
};
exports.getOnboardingProgress = getOnboardingProgress;
/**
 * Complete an onboarding step
 */
const completeOnboardingStep = async (req, res) => {
    try {
        const data = completeStepSchema.parse(req.body);
        const userId = req.user.id;
        // Validate step exists
        const stepExists = ONBOARDING_STEPS.some((s) => s.id === data.stepId);
        if (!stepExists) {
            return res.status(400).json({ error: 'Invalid step ID' });
        }
        // Get current user preferences
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const preferences = user?.preferences || {};
        const completedSteps = preferences.completedOnboardingSteps || [];
        const stepCompletionDates = preferences.stepCompletionDates || {};
        // Add step if not already completed
        if (!completedSteps.includes(data.stepId)) {
            completedSteps.push(data.stepId);
            stepCompletionDates[data.stepId] = new Date().toISOString();
        }
        // Update user preferences
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    ...preferences,
                    completedOnboardingSteps: completedSteps,
                    stepCompletionDates,
                },
            },
        });
        // Log audit event
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: userId,
                action: 'UPDATE',
                entityType: 'USER',
                entityId: userId,
                metadata: { action: 'complete_onboarding_step', stepId: data.stepId },
            },
        });
        res.json({
            message: 'Onboarding step completed',
            stepId: data.stepId,
            completedSteps,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger_1.logger.error('Error completing onboarding step', { error });
        res.status(500).json({ error: 'Failed to complete onboarding step' });
    }
};
exports.completeOnboardingStep = completeOnboardingStep;
/**
 * Skip an onboarding step
 */
const skipOnboardingStep = async (req, res) => {
    try {
        const data = skipStepSchema.parse(req.body);
        const userId = req.user.id;
        // Validate step exists
        const stepExists = ONBOARDING_STEPS.some((s) => s.id === data.stepId);
        if (!stepExists) {
            return res.status(400).json({ error: 'Invalid step ID' });
        }
        // Get current user preferences
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const preferences = user?.preferences || {};
        const skippedSteps = preferences.skippedOnboardingSteps || [];
        // Add step to skipped if not already there
        if (!skippedSteps.includes(data.stepId)) {
            skippedSteps.push(data.stepId);
        }
        // Update user preferences
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    ...preferences,
                    skippedOnboardingSteps: skippedSteps,
                },
            },
        });
        res.json({
            message: 'Onboarding step skipped',
            stepId: data.stepId,
            skippedSteps,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger_1.logger.error('Error skipping onboarding step', { error });
        res.status(500).json({ error: 'Failed to skip onboarding step' });
    }
};
exports.skipOnboardingStep = skipOnboardingStep;
/**
 * Reset onboarding progress
 */
const resetOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        // Clear onboarding preferences
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        const preferences = user?.preferences || {};
        delete preferences.completedOnboardingSteps;
        delete preferences.skippedOnboardingSteps;
        delete preferences.stepCompletionDates;
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                preferences: preferences,
            },
        });
        res.json({ message: 'Onboarding progress reset' });
    }
    catch (error) {
        logger_1.logger.error('Error resetting onboarding', { error });
        res.status(500).json({ error: 'Failed to reset onboarding' });
    }
};
exports.resetOnboarding = resetOnboarding;
/**
 * Get conversation starters based on role type
 */
const getConversationStarters = async (req, res) => {
    try {
        const { roleType } = req.query;
        // Conversation starters by role
        const startersByRole = {
            FATHER: [
                "What life lesson would you like to share with me today?",
                "I've been thinking about career choices. What's your advice?",
                "Tell me about a challenge you overcame when you were my age.",
                "What values do you think are most important in life?",
                "How do you handle difficult decisions?",
            ],
            MOTHER: [
                "I need someone to talk to about what's on my mind.",
                "Can you help me understand how to handle this situation?",
                "What would you do if you were in my position?",
                "Tell me about a time when you felt proud of yourself.",
                "How do you stay positive during tough times?",
            ],
            SIBLING: [
                "Remember when we used to talk about our dreams?",
                "I need your honest opinion on something.",
                "What's something fun we could plan together?",
                "Can you help me see things from a different perspective?",
                "What's been on your mind lately?",
            ],
            MENTOR: [
                "I'd love to learn from your experience in this area.",
                "What skills do you think I should focus on developing?",
                "How did you navigate similar challenges in your career?",
                "What advice would you give your younger self?",
                "Can you guide me through this professional decision?",
            ],
            FRIEND: [
                "What's something interesting that happened to you recently?",
                "I wanted to catch up and see how you're doing.",
                "Let's talk about our plans for the future.",
                "What's been making you happy lately?",
                "Tell me something that's been on your mind.",
            ],
            CUSTOM: [
                "I'd like to start a meaningful conversation with you.",
                "What would you like to talk about today?",
                "Tell me something important to you.",
                "I value your perspective on things.",
                "Let's have a thoughtful discussion.",
            ],
        };
        const type = roleType?.toUpperCase() || 'CUSTOM';
        const starters = startersByRole[type] || startersByRole.CUSTOM;
        res.json({
            roleType: type,
            starters,
            count: starters.length,
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting conversation starters', { error });
        res.status(500).json({ error: 'Failed to get conversation starters' });
    }
};
exports.getConversationStarters = getConversationStarters;
/**
 * Get role selection guidance
 */
const getRoleGuidance = async (req, res) => {
    try {
        const guidance = [
            {
                roleType: 'FATHER',
                title: 'Father Figure',
                description: 'A paternal presence offering guidance, wisdom, and life advice',
                characteristics: [
                    'Provides practical life advice',
                    'Offers career and decision-making guidance',
                    'Shares wisdom from experience',
                    'Supportive and protective',
                ],
                bestFor: 'Those seeking mentorship, life advice, or a paternal connection',
                icon: '👨',
            },
            {
                roleType: 'MOTHER',
                title: 'Mother Figure',
                description: 'A nurturing presence providing emotional support and care',
                characteristics: [
                    'Empathetic and understanding',
                    'Provides emotional comfort',
                    'Offers unconditional support',
                    'Helps with personal challenges',
                ],
                bestFor: 'Those seeking emotional support, understanding, or maternal warmth',
                icon: '👩',
            },
            {
                roleType: 'SIBLING',
                title: 'Sibling/Peer',
                description: 'A close companion for sharing, fun, and mutual support',
                characteristics: [
                    'Casual and friendly communication',
                    'Mutual sharing and understanding',
                    'Playful and relatable',
                    'Honest and direct',
                ],
                bestFor: 'Those wanting friendship, fun conversations, or peer support',
                icon: '🤝',
            },
            {
                roleType: 'MENTOR',
                title: 'Professional Mentor',
                description: 'An experienced guide for professional and personal growth',
                characteristics: [
                    'Expert guidance and advice',
                    'Skill development focus',
                    'Career-oriented discussions',
                    'Strategic thinking',
                ],
                bestFor: 'Those seeking professional growth, skill development, or career advice',
                icon: '🎓',
            },
            {
                roleType: 'FRIEND',
                title: 'Close Friend',
                description: 'A trusted companion for everyday conversations and support',
                characteristics: [
                    'Casual and comfortable',
                    'Non-judgmental',
                    'Always available to listen',
                    'Balanced support and fun',
                ],
                bestFor: 'Those wanting a trusted friend for daily conversations and support',
                icon: '💙',
            },
            {
                roleType: 'CUSTOM',
                title: 'Custom Role',
                description: 'Create a unique role tailored to your specific needs',
                characteristics: [
                    'Fully customizable personality',
                    'Flexible communication style',
                    'Adaptable to your needs',
                    'Unique relationship dynamic',
                ],
                bestFor: 'Those with specific relationship needs or wanting complete customization',
                icon: '⚙️',
            },
        ];
        res.json({
            guidance,
            total: guidance.length,
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting role guidance', { error });
        res.status(500).json({ error: 'Failed to get role guidance' });
    }
};
exports.getRoleGuidance = getRoleGuidance;
