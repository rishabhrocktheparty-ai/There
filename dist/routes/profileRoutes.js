"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
const voiceSchema = zod_1.z.object({
    settings: zod_1.z.record(zod_1.z.unknown()),
    sampleUrl: zod_1.z.string().url().optional(),
});
router.post('/voice', authMiddleware_1.authenticate, (0, validator_1.validateBody)(voiceSchema), (req, res) => {
    const existing = inMemoryStore_1.voiceProfiles.find((v) => v.userId === req.user.id);
    const payload = req.body;
    if (existing) {
        existing.settings = payload.settings;
        existing.sampleUrl = payload.sampleUrl;
        return res.json(existing);
    }
    const vp = { id: (0, uuid_1.v4)(), userId: req.user.id, ...payload };
    inMemoryStore_1.voiceProfiles.push(vp);
    res.status(201).json(vp);
});
const avatarSchema = zod_1.z.object({
    settings: zod_1.z.record(zod_1.z.unknown()),
    imageUrl: zod_1.z.string().url().optional(),
});
router.post('/avatar', authMiddleware_1.authenticate, (0, validator_1.validateBody)(avatarSchema), (req, res) => {
    const existing = inMemoryStore_1.avatarProfiles.find((v) => v.userId === req.user.id);
    const payload = req.body;
    if (existing) {
        existing.settings = payload.settings;
        existing.imageUrl = payload.imageUrl;
        return res.json(existing);
    }
    const ap = { id: (0, uuid_1.v4)(), userId: req.user.id, ...payload };
    inMemoryStore_1.avatarProfiles.push(ap);
    res.status(201).json(ap);
});
router.get('/', authMiddleware_1.authenticate, (req, res) => {
    res.json({
        voice: inMemoryStore_1.voiceProfiles.find((v) => v.userId === req.user.id) || null,
        avatar: inMemoryStore_1.avatarProfiles.find((v) => v.userId === req.user.id) || null,
    });
});
exports.profileRouter = router;
