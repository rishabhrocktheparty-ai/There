"use strict";
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
exports.onboardingRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const onboardingController = __importStar(require("../controllers/onboardingController"));
const router = (0, express_1.Router)();
exports.onboardingRouter = router;
/**
 * Onboarding progress routes
 * All routes require authentication
 */
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/progress', authMiddleware_1.authenticate, onboardingController.getOnboardingProgress);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/complete-step', authMiddleware_1.authenticate, onboardingController.completeOnboardingStep);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/skip-step', authMiddleware_1.authenticate, onboardingController.skipOnboardingStep);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.post('/reset', authMiddleware_1.authenticate, onboardingController.resetOnboarding);
/**
 * Guidance and starter content routes
 */
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/conversation-starters', authMiddleware_1.authenticate, onboardingController.getConversationStarters);
// @ts-ignore - AuthedRequest type mismatch with Express Router
router.get('/role-guidance', authMiddleware_1.authenticate, onboardingController.getRoleGuidance);
