"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.culturalRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const router = (0, express_1.Router)();
const culturalSchema = zod_1.z.object({
    region: zod_1.z.string().min(2),
    settings: zod_1.z.record(zod_1.z.unknown()),
});
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['super_admin', 'config_manager']), (0, validator_1.validateBody)(culturalSchema), (req, res) => {
    const payload = req.body;
    const param = { id: (0, uuid_1.v4)(), ...payload };
    inMemoryStore_1.culturalParameters.push(param);
    res.status(201).json(param);
});
router.get('/', authMiddleware_1.authenticate, (req, res) => {
    const region = req.query.region;
    if (region) {
        return res.json(inMemoryStore_1.culturalParameters.filter((c) => c.region === region));
    }
    res.json(inMemoryStore_1.culturalParameters);
});
exports.culturalRouter = router;
