import { Router } from 'express';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { auditLogs } from '../services/inMemoryStore';
import * as adminController from '../controllers/adminController';

const router = Router();

// Legacy routes
router.get('/me', authenticate, (req: AuthedRequest, res) => {
  res.json(req.user);
});

router.get('/audit-logs', authenticate, requireRole(['SUPER_ADMIN']), (_req: AuthedRequest, res) => {
  res.json(auditLogs);
});

// New admin dashboard routes
// All routes require admin authentication
router.use(authenticate);

// System Analytics
router.get(
  '/analytics/system',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.getSystemAnalytics
);

// User Metrics
router.get(
  '/users/metrics',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.getUserMetrics
);

// Role Management
router.get(
  '/roles/templates',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.getRoleTemplates
);

router.post(
  '/roles/templates',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.upsertRoleTemplate
);

router.delete(
  '/roles/templates/:id',
  requireRole(['SUPER_ADMIN']),
  adminController.deleteRoleTemplate
);

// Emotional Intelligence
router.get(
  '/emotional/config',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.getEmotionalConfig
);

// User Feedback & Moderation
router.get(
  '/feedback',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']),
  adminController.getUserFeedback
);

// System Health
router.get(
  '/health',
  requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER', 'VIEWER']),
  adminController.getSystemHealth
);

// Admin User Management
router.put(
  '/users/admin-role',
  requireRole(['SUPER_ADMIN']),
  adminController.updateAdminRole
);

router.delete(
  '/users/admin-role/:userId',
  requireRole(['SUPER_ADMIN']),
  adminController.removeAdmin
);

export const adminRouter = router;
