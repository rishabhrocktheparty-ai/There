import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getUserRelationships,
  getRelationshipById,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getRelationshipActivity,
  switchActiveRelationship,
} from '../controllers/relationshipController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all user relationships
router.get('/', getUserRelationships);

// Create new relationship
router.post('/', createRelationship);

// Get single relationship
router.get('/:id', getRelationshipById);

// Update relationship
router.patch('/:id', updateRelationship);

// Delete relationship
router.delete('/:id', deleteRelationship);

// Get relationship activity/stats
router.get('/:id/activity', getRelationshipActivity);

// Switch active relationship
router.post('/:id/switch', switchActiveRelationship);

export const relationshipRouter = router;
