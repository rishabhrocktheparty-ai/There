"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.authenticate, (req, res) => {
    res.json(req.user);
});
router.get('/audit-logs', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin']), (_req, res) => {
    res.json(inMemoryStore_1.auditLogs);
});
exports.adminRouter = router;
