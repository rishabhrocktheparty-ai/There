import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { voiceProfiles, avatarProfiles } from '../services/inMemoryStore';

const router = Router();

const voiceSchema = z.object({
  settings: z.record(z.unknown()),
  sampleUrl: z.string().url().optional(),
});

router.post('/voice', authenticate, validateBody(voiceSchema), (req: AuthedRequest, res) => {
  const existing = voiceProfiles.find((v) => v.userId === req.user!.id);
  const payload = req.body as z.infer<typeof voiceSchema>;
  if (existing) {
    existing.settings = payload.settings;
    existing.sampleUrl = payload.sampleUrl;
    return res.json(existing);
  }
  const vp = { id: uuid(), userId: req.user!.id, ...payload };
  voiceProfiles.push(vp);
  res.status(201).json(vp);
});

const avatarSchema = z.object({
  settings: z.record(z.unknown()),
  imageUrl: z.string().url().optional(),
});

router.post('/avatar', authenticate, validateBody(avatarSchema), (req: AuthedRequest, res) => {
  const existing = avatarProfiles.find((v) => v.userId === req.user!.id);
  const payload = req.body as z.infer<typeof avatarSchema>;
  if (existing) {
    existing.settings = payload.settings;
    existing.imageUrl = payload.imageUrl;
    return res.json(existing);
  }
  const ap = { id: uuid(), userId: req.user!.id, ...payload };
  avatarProfiles.push(ap);
  res.status(201).json(ap);
});

router.get('/', authenticate, (req: AuthedRequest, res) => {
  res.json({
    voice: voiceProfiles.find((v) => v.userId === req.user!.id) || null,
    avatar: avatarProfiles.find((v) => v.userId === req.user!.id) || null,
  });
});

export const profileRouter = router;
