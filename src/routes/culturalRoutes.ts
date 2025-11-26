import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { culturalParameters } from '../services/inMemoryStore';

const router = Router();

const culturalSchema = z.object({
  region: z.string().min(2),
  settings: z.record(z.unknown()),
});

router.post('/', authenticate, requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']), validateBody(culturalSchema), (
  req: AuthedRequest,
  res
) => {
  const payload = req.body as z.infer<typeof culturalSchema>;
  const param = { id: uuid(), ...payload };
  culturalParameters.push(param);
  res.status(201).json(param);
});

router.get('/', authenticate, (req: AuthedRequest, res) => {
  const region = req.query.region as string | undefined;
  if (region) {
    return res.json(culturalParameters.filter((c) => c.region === region));
  }
  res.json(culturalParameters);
});

export const culturalRouter = router;
