import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { authenticate, requireRole, AuthedRequest } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validator';
import { ethicalConfigs, ethicalConfigVersions, createAuditLog } from '../services/inMemoryStore';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

const createConfigSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  data: z.record(z.unknown()),
});

router.post('/', authenticate, requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']), validateBody(createConfigSchema), (
  req: AuthedRequest,
  res,
  next
) => {
  try {
    const { name, description, data } = req.body as z.infer<typeof createConfigSchema>;
    const id = uuid();
    const config = { id, name, description, latestVersion: 1 };
    ethicalConfigs.push(config);
    ethicalConfigVersions.push({
      id: uuid(),
      configId: id,
      version: 1,
      data,
      createdAt: new Date().toISOString(),
      createdBy: req.user!.id,
    });
    createAuditLog({
      actorId: req.user!.id,
      action: 'create_config',
      entityType: 'EthicalConfig',
      entityId: id,
      metadata: { name },
    });
    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, (req: AuthedRequest, res) => {
  res.json(ethicalConfigs);
});

router.get('/:id/versions', authenticate, (req: AuthedRequest, res) => {
  const versions = ethicalConfigVersions.filter((v) => v.configId === req.params.id);
  res.json(versions);
});

const updateConfigSchema = z.object({
  data: z.record(z.unknown()),
});

router.post('/:id/versions', authenticate, requireRole(['SUPER_ADMIN', 'CONFIG_MANAGER']), validateBody(updateConfigSchema), (
  req: AuthedRequest,
  res,
  next
) => {
  try {
    const config = ethicalConfigs.find((c) => c.id === req.params.id);
    if (!config) {
      throw new HttpError(404, 'Config not found');
    }
    const nextVersion = config.latestVersion + 1;
    config.latestVersion = nextVersion;
    ethicalConfigVersions.push({
      id: uuid(),
      configId: config.id,
      version: nextVersion,
      data: (req.body as z.infer<typeof updateConfigSchema>).data,
      createdAt: new Date().toISOString(),
      createdBy: req.user!.id,
    });
    createAuditLog({
      actorId: req.user!.id,
      action: 'update_config_version',
      entityType: 'EthicalConfig',
      entityId: config.id,
      metadata: { version: nextVersion },
    });
    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
});

export const configRouter = router;
