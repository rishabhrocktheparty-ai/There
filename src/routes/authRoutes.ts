import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateBody } from '../utils/validator';
import { HttpError } from '../middleware/errorHandler';
import { AdminRole } from '../types/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'insecure_dev_secret';

// Simple in-memory admin store
const admins: { id: string; email: string; passwordHash: string; role: AdminRole }[] = [];

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'config_manager', 'viewer']),
});

router.post('/admin/register', validateBody(registerSchema), (req, res, next) => {
  try {
    const { email, password, role } = req.body as z.infer<typeof registerSchema>;
    if (admins.find((a) => a.email === email)) {
      throw new HttpError(409, 'Admin already exists');
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const admin = { id: email, email, passwordHash, role };
    admins.push(admin);
    res.status(201).json({ id: admin.id, email: admin.email, role: admin.role });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/admin/login', validateBody(loginSchema), (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const admin = admins.find((a) => a.email === email);
    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Stub social login callback for users (e.g., Google OAuth)
const socialLoginSchema = z.object({
  provider: z.enum(['google']),
  accessToken: z.string(),
});

router.post('/user/social-login', validateBody(socialLoginSchema), (req, res, next) => {
  try {
    const { provider, accessToken } = req.body as z.infer<typeof socialLoginSchema>;
    // In a real implementation, verify accessToken with provider SDK.
    const fakeUserId = `${provider}-${accessToken.slice(0, 8)}`;
    const token = jwt.sign({ id: fakeUserId, email: `${fakeUserId}@example.com`, role: 'viewer' }, JWT_SECRET, {
      expiresIn: '12h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export const authRouter = router;
