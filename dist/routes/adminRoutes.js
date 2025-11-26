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
exports.adminRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const inMemoryStore_1 = require("../services/inMemoryStore");
const adminController = __importStar(require("../controllers/adminController"));
const router = (0, express_1.Router)();
// Legacy routes
router.get('/me', authMiddleware_1.authenticate, (req, res) => {
    res.json(req.user);
});
router.get('/audit-logs', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin']), (_req, res) => {
    res.json(inMemoryStore_1.auditLogs);
});
// New admin dashboard routes
// All routes require admin authentication
router.use(authMiddleware_1.authenticate);
// System Analytics
router.get('/analytics/system', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.getSystemAnalytics);
// User Metrics
router.get('/users/metrics', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.getUserMetrics);
// Role Management
router.get('/roles/templates', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.getRoleTemplates);
router.post('/roles/templates', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.upsertRoleTemplate);
router.delete('/roles/templates/:id', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN']), adminController.deleteRoleTemplate);
// Emotional Intelligence
router.get('/emotional/config', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.getEmotionalConfig);
// User Feedback & Moderation
router.get('/feedback', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), adminController.getUserFeedback);
// System Health
router.get('/health', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER', 'VIEWER']), adminController.getSystemHealth);
// Admin User Management
router.put('/users/admin-role', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN']), adminController.updateAdminRole);
router.delete('/users/admin-role/:userId', (0, authMiddleware_1.requireRole)(['SUPER_ADMIN']), adminController.removeAdmin);
exports.adminRouter = router;
