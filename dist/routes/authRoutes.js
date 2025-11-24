"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validator_1 = require("../utils/validator");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Validation schemas
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    displayName: zod_1.z.string().min(2).max(100).optional(),
});
const socialLoginSchema = zod_1.z.object({
    provider: zod_1.z.enum(['google', 'apple', 'github']),
    accessToken: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    externalId: zod_1.z.string().optional(),
    displayName: zod_1.z.string().optional(),
});
// Admin routes
router.post('/admin/login', (0, validator_1.validateBody)(loginSchema), authController_1.AuthController.adminLogin);
// User routes
router.post('/user/login', (0, validator_1.validateBody)(loginSchema), authController_1.AuthController.userLogin);
router.post('/user/register', (0, validator_1.validateBody)(registerSchema), authController_1.AuthController.userRegister);
router.post('/user/social-login', (0, validator_1.validateBody)(socialLoginSchema), authController_1.AuthController.socialLogin);
// Protected routes
router.get('/me', authMiddleware_1.authenticate, authController_1.AuthController.getCurrentUser);
router.post('/logout', authMiddleware_1.authenticate, authController_1.AuthController.logout);
router.post('/refresh', authMiddleware_1.authenticate, authController_1.AuthController.refreshToken);
router.get('/validate', authMiddleware_1.authenticate, authController_1.AuthController.validateSession);
router.post('/change-password', authMiddleware_1.authenticate, authController_1.AuthController.changePassword);
exports.authRouter = router;
