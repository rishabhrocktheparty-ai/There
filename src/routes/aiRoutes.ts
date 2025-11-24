/**
 * AI Response Routes
 * API endpoints for AI response generation and analysis
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as aiController from '../controllers/aiController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Generate AI response
 * POST /api/ai/generate
 * Body: { relationshipId: string, message: string }
 */
router.post('/generate', aiController.generateResponse);

/**
 * Get AI personality for relationship
 * GET /api/ai/personality/:relationshipId
 */
router.get('/personality/:relationshipId', aiController.getPersonality);

/**
 * Get emotional analysis of conversation
 * GET /api/ai/emotions/:relationshipId
 */
router.get('/emotions/:relationshipId', aiController.getEmotionalAnalysis);

/**
 * Get conversation memory summary
 * GET /api/ai/memory/:relationshipId
 */
router.get('/memory/:relationshipId', aiController.getMemorySummary);

/**
 * Mark message as important
 * POST /api/ai/mark-important/:messageId
 */
router.post('/mark-important/:messageId', aiController.markMessageImportant);

/**
 * Search conversation history
 * GET /api/ai/search/:relationshipId?q=query&limit=10
 */
router.get('/search/:relationshipId', aiController.searchConversation);

/**
 * Test safety filters (admin only - add admin middleware as needed)
 * POST /api/ai/test-safety
 * Body: { content: string, context: 'user_input' | 'ai_response' }
 */
router.post('/test-safety', aiController.testSafety);

export default router;
