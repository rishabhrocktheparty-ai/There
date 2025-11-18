import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { userRelationships } from '../services/inMemoryStore';

const router = Router();

const relationshipSchema = z.object({
  counterpartUserId: z.string(),
  roleTemplateId: z.string(),
});

router.post('/', authenticate, validateBody(relationshipSchema), (req: AuthedRequest, res) => {
  const payload = req.body as z.infer<typeof relationshipSchema>;
  const rel = {
    id: uuid(),
    userId: req.user!.id,
    ...payload,
  };
  userRelationships.push(rel);
  res.status(201).json(rel);
});

router.get('/', authenticate, (req: AuthedRequest, res) => {
  const mine = userRelationships.filter((r) => r.userId === req.user!.id);
  res.json(mine);
});

export const relationshipRouter = router;
