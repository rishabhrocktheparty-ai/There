"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const relationshipController_1 = require("../controllers/relationshipController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.authenticate);
// Get all user relationships
router.get('/', relationshipController_1.getUserRelationships);
// Create new relationship
router.post('/', relationshipController_1.createRelationship);
// Get single relationship
router.get('/:id', relationshipController_1.getRelationshipById);
// Update relationship
router.patch('/:id', relationshipController_1.updateRelationship);
// Delete relationship
router.delete('/:id', relationshipController_1.deleteRelationship);
// Get relationship activity/stats
router.get('/:id/activity', relationshipController_1.getRelationshipActivity);
// Switch active relationship
router.post('/:id/switch', relationshipController_1.switchActiveRelationship);
exports.relationshipRouter = router;
