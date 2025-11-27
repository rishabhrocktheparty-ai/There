"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const createConfigSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.unknown()),
});
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), (0, validator_1.validateBody)(createConfigSchema), (req, res, next) => {
    try {
        const { name, description, data } = req.body;
        const id = (0, uuid_1.v4)();
        const config = { id, name, description, latestVersion: 1 };
        inMemoryStore_1.ethicalConfigs.push(config);
        inMemoryStore_1.ethicalConfigVersions.push({
            id: (0, uuid_1.v4)(),
            configId: id,
            version: 1,
            data,
            createdAt: new Date().toISOString(),
            createdBy: req.user.id,
        });
        (0, inMemoryStore_1.createAuditLog)({
            actorId: req.user.id,
            action: 'create_config',
            entityType: 'EthicalConfig',
            entityId: id,
            metadata: { name },
        });
        res.status(201).json(config);
    }
    catch (err) {
        next(err);
    }
});
router.get('/', authMiddleware_1.authenticate, (req, res) => {
    res.json(inMemoryStore_1.ethicalConfigs);
});
router.get('/:id/versions', authMiddleware_1.authenticate, (req, res) => {
    const versions = inMemoryStore_1.ethicalConfigVersions.filter((v) => v.configId === req.params.id);
    res.json(versions);
});
const updateConfigSchema = zod_1.z.object({
    data: zod_1.z.record(zod_1.z.unknown()),
});
router.post('/:id/versions', authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)(['SUPER_ADMIN', 'CONFIG_MANAGER']), (0, validator_1.validateBody)(updateConfigSchema), (req, res, next) => {
    try {
        const config = inMemoryStore_1.ethicalConfigs.find((c) => c.id === req.params.id);
        if (!config) {
            throw new errorHandler_1.HttpError(404, 'Config not found');
        }
        const nextVersion = config.latestVersion + 1;
        config.latestVersion = nextVersion;
        inMemoryStore_1.ethicalConfigVersions.push({
            id: (0, uuid_1.v4)(),
            configId: config.id,
            version: nextVersion,
            data: req.body.data,
            createdAt: new Date().toISOString(),
            createdBy: req.user.id,
        });
        (0, inMemoryStore_1.createAuditLog)({
            actorId: req.user.id,
            action: 'update_config_version',
            entityType: 'EthicalConfig',
            entityId: config.id,
            metadata: { version: nextVersion },
        });
        res.status(201).json(config);
    }
    catch (err) {
        next(err);
    }
});
exports.configRouter = router;
