import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { roleTemplates } from '../services/inMemoryStore';

const router = Router();

const templateSchema = z.object({
  type: z.enum(['father', 'mother', 'sibling', 'mentor']),
  displayName: z.string().min(2),
  description: z.string().optional(),
  defaultSettings: z.record(z.unknown()),
});

router.post('/', authenticate, requireRole(['super_admin', 'config_manager']), validateBody(templateSchema), (
  req: AuthedRequest,
  res
) => {
  const payload = req.body as z.infer<typeof templateSchema>;
  const tpl = { id: uuid(), ...payload };
  roleTemplates.push(tpl);
  res.status(201).json(tpl);
});

router.get('/', authenticate, (_req: AuthedRequest, res) => {
  res.json(roleTemplates);
});

export const roleTemplateRouter = router;
