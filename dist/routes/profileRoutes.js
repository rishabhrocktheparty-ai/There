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
exports.profileRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validator_1 = require("../utils/validator");
const inMemoryStore_1 = require("../services/inMemoryStore");
const profileController = __importStar(require("../controllers/profileController"));
const router = (0, express_1.Router)();
// User profile management endpoints
router.get('/user/profile', authMiddleware_1.authenticate, profileController.getProfile);
router.put('/user/profile', authMiddleware_1.authenticate, profileController.updateProfile);
// User preferences endpoints
router.get('/user/preferences', authMiddleware_1.authenticate, profileController.getPreferences);
router.put('/user/preferences', authMiddleware_1.authenticate, profileController.updatePreferences);
// Usage statistics
router.get('/user/usage-stats', authMiddleware_1.authenticate, profileController.getUsageStats);
// Data export and account deletion
router.get('/user/export', authMiddleware_1.authenticate, profileController.exportUserData);
router.delete('/user/account', authMiddleware_1.authenticate, profileController.deleteAccount);
// Notification settings
router.get('/user/notifications', authMiddleware_1.authenticate, profileController.getNotificationSettings);
router.put('/user/notifications', authMiddleware_1.authenticate, profileController.updateNotificationSettings);
// Privacy settings
router.get('/user/privacy', authMiddleware_1.authenticate, profileController.getPrivacySettings);
router.put('/user/privacy', authMiddleware_1.authenticate, profileController.updatePrivacySettings);
// Legacy voice/avatar routes (keeping for backward compatibility)
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
