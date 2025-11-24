import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../utils/validator';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(2).max(100).optional(),
});

const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple', 'github']),
  accessToken: z.string().min(1),
  email: z.string().email().optional(),
  externalId: z.string().optional(),
  displayName: z.string().optional(),
});

// Admin routes
router.post('/admin/login', validateBody(loginSchema), AuthController.adminLogin);

// User routes
router.post('/user/login', validateBody(loginSchema), AuthController.userLogin);
router.post('/user/register', validateBody(registerSchema), AuthController.userRegister);
router.post('/user/social-login', validateBody(socialLoginSchema), AuthController.socialLogin);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', authenticate, AuthController.refreshToken);
router.get('/validate', authenticate, AuthController.validateSession);
router.post('/change-password', authenticate, AuthController.changePassword);

export const authRouter = router;
