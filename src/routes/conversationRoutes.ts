import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { conversationMessages, usageEvents } from '../services/inMemoryStore';

const router = Router();

const messageSchema = z.object({
  relationshipId: z.string(),
  content: z.string().min(1),
  emotionalTone: z.enum(['positive', 'neutral', 'negative']),
});

router.post('/', authenticate, validateBody(messageSchema), (req: AuthedRequest, res) => {
  const payload = req.body as z.infer<typeof messageSchema>;
  const msg = {
    id: uuid(),
    senderId: req.user!.id,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  conversationMessages.push(msg);
  usageEvents.push({
    id: uuid(),
    userId: req.user!.id,
    eventType: 'conversation_message',
    metadata: { relationshipId: payload.relationshipId, emotionalTone: payload.emotionalTone },
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(msg);
});

router.get('/relationship/:id', authenticate, (req: AuthedRequest, res) => {
  const msgs = conversationMessages.filter((m) => m.relationshipId === req.params.id);
  res.json(msgs);
});

router.get('/emotional-patterns/:relationshipId', authenticate, (req: AuthedRequest, res) => {
  const msgs = conversationMessages.filter((m) => m.relationshipId === req.params.relationshipId);
  const stats = {
    positive: msgs.filter((m) => m.emotionalTone === 'positive').length,
    neutral: msgs.filter((m) => m.emotionalTone === 'neutral').length,
    negative: msgs.filter((m) => m.emotionalTone === 'negative').length,
  };
  res.json(stats);
});

export const conversationRouter = router;
