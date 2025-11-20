"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
const relationshipSchema = zod_1.z.object({
    counterpartUserId: zod_1.z.string(),
    roleTemplateId: zod_1.z.string(),
});
router.post('/', authMiddleware_1.authenticate, (0, validator_1.validateBody)(relationshipSchema), (req, res) => {
    const payload = req.body;
    const rel = {
        id: (0, uuid_1.v4)(),
        userId: req.user.id,
        ...payload,
    };
    inMemoryStore_1.userRelationships.push(rel);
    res.status(201).json(rel);
});
router.get('/', authMiddleware_1.authenticate, (req, res) => {
    const mine = inMemoryStore_1.userRelationships.filter((r) => r.userId === req.user.id);
    res.json(mine);
});
exports.relationshipRouter = router;
