import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as onboardingController from '../controllers/onboardingController';

const router = Router();

/**
 * Onboarding progress routes
 * All routes require authentication
 */
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/progress', authenticate, onboardingController.getOnboardingProgress);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/complete-step', authenticate, onboardingController.completeOnboardingStep);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/skip-step', authenticate, onboardingController.skipOnboardingStep);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/reset', authenticate, onboardingController.resetOnboarding);

/**
 * Guidance and starter content routes
 */
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/conversation-starters', authenticate, onboardingController.getConversationStarters);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/role-guidance', authenticate, onboardingController.getRoleGuidance);

export { router as onboardingRouter };
