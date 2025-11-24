"use strict";
/**
 * AI Response Routes
 * API endpoints for AI response generation and analysis
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const aiController = __importStar(require("../controllers/aiController"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.authenticate);
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
exports.default = router;
