/**
 * AI Response Routes - Gemini Integration
 * API endpoints for AI response generation using Google Gemini
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as aiControllerSimple from '../controllers/aiControllerSimple';
// Legacy controller with type issues commented out
// import * as aiController from '../controllers/aiController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Generate AI response using Gemini
 * POST /api/ai/generate
 * Body: { relationshipId: string, message: string }
 */
router.post('/generate', aiControllerSimple.generateResponse);

/**
 * Get AI personality for relationship
 * GET /api/ai/personality/:relationshipId
 */
router.get('/personality/:relationshipId', aiControllerSimple.getPersonality);

/**
 * Get emotional patterns for relationship
 * GET /api/ai/emotions/:relationshipId
 */
router.get('/emotions/:relationshipId', aiControllerSimple.getEmotions);

// Legacy routes commented out due to type incompatibilities
// router.get('/memory/:relationshipId', aiController.getMemorySummary);
// router.post('/mark-important/:messageId', aiController.markMessageImportant);
// router.get('/search/:relationshipId', aiController.searchConversation);
// router.post('/test-safety', aiController.testSafety);

export default router;
