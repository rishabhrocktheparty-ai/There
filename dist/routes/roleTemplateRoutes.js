"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleTemplateRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
const templateSchema = zod_1.z.object({
    type: zod_1.z.enum(['father', 'mother', 'sibling', 'mentor', 'friend', 'coach', 'therapist', 'teacher', 'partner', 'grandparent']),
    displayName: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    defaultSettings: zod_1.z.record(zod_1.z.unknown()),
});
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), (0, validator_1.validateBody)(templateSchema), (req, res) => {
    const payload = req.body;
    const tpl = { id: (0, uuid_1.v4)(), ...payload };
    inMemoryStore_1.roleTemplates.push(tpl);
    res.status(201).json(tpl);
});
router.get('/', authMiddleware_1.authenticate, (_req, res) => {
    res.json(inMemoryStore_1.roleTemplates);
});
exports.roleTemplateRouter = router;
