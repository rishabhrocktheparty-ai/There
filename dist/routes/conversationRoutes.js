"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
const messageSchema = zod_1.z.object({
    relationshipId: zod_1.z.string(),
    content: zod_1.z.string().min(1),
    emotionalTone: zod_1.z.enum(['positive', 'neutral', 'negative']),
});
router.post('/', authMiddleware_1.authenticate, (0, validator_1.validateBody)(messageSchema), (req, res) => {
    const payload = req.body;
    const msg = {
        id: (0, uuid_1.v4)(),
        senderId: req.user.id,
        createdAt: new Date().toISOString(),
        ...payload,
    };
    inMemoryStore_1.conversationMessages.push(msg);
    inMemoryStore_1.usageEvents.push({
        id: (0, uuid_1.v4)(),
        userId: req.user.id,
        eventType: 'conversation_message',
        metadata: { relationshipId: payload.relationshipId, emotionalTone: payload.emotionalTone },
        createdAt: new Date().toISOString(),
    });
    res.status(201).json(msg);
});
router.get('/relationship/:id', authMiddleware_1.authenticate, (req, res) => {
    const msgs = inMemoryStore_1.conversationMessages.filter((m) => m.relationshipId === req.params.id);
    res.json(msgs);
});
router.get('/emotional-patterns/:relationshipId', authMiddleware_1.authenticate, (req, res) => {
    const msgs = inMemoryStore_1.conversationMessages.filter((m) => m.relationshipId === req.params.relationshipId);
    const stats = {
        positive: msgs.filter((m) => m.emotionalTone === 'positive').length,
        neutral: msgs.filter((m) => m.emotionalTone === 'neutral').length,
        negative: msgs.filter((m) => m.emotionalTone === 'negative').length,
    };
    res.json(stats);
});
exports.conversationRouter = router;
