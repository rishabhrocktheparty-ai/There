"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
router.get('/usage', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin', 'config_manager']), (_req, res) => {
    res.json({
        totalEvents: inMemoryStore_1.usageEvents.length,
    });
});
router.get('/usage/by-user', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin', 'config_manager']), (_req, res) => {
    const map = {};
    for (const ev of inMemoryStore_1.usageEvents) {
        map[ev.userId] = (map[ev.userId] || 0) + 1;
    }
    res.json(map);
});
router.get('/audit', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin']), (_req, res) => {
    res.json(inMemoryStore_1.auditLogs);
});
exports.analyticsRouter = router;
