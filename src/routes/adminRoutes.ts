import { Router } from 'express';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { auditLogs } from '../services/inMemoryStore';

const router = Router();

router.get('/me', authenticate, (req: AuthedRequest, res) => {
  res.json(req.user);
});

router.get('/audit-logs', authenticate, requireRole(['super_admin']), (_req: AuthedRequest, res) => {
  res.json(auditLogs);
});

export const adminRouter = router;
