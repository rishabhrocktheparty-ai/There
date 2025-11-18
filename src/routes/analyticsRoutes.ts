import { Router } from 'express';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { usageEvents, auditLogs } from '../services/inMemoryStore';

const router = Router();

router.get('/usage', authenticate, requireRole(['super_admin', 'config_manager']), (_req: AuthedRequest, res) => {
  res.json({
    totalEvents: usageEvents.length,
  });
});

router.get('/usage/by-user', authenticate, requireRole(['super_admin', 'config_manager']), (_req: AuthedRequest, res) => {
  const map: Record<string, number> = {};
  for (const ev of usageEvents) {
    map[ev.userId] = (map[ev.userId] || 0) + 1;
  }
  res.json(map);
});

router.get('/audit', authenticate, requireRole(['super_admin']), (_req: AuthedRequest, res) => {
  res.json(auditLogs);
});

export const analyticsRouter = router;
