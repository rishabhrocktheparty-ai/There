import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authRouter } from './routes/authRoutes';
import { adminRouter } from './routes/adminRoutes';
import { configRouter } from './routes/configRoutes';
import { roleTemplateRouter } from './routes/roleTemplateRoutes';
import { culturalRouter } from './routes/culturalRoutes';
import { relationshipRouter } from './routes/relationshipRoutes';
import { conversationRouter } from './routes/conversationRoutes';
import { profileRouter } from './routes/profileRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
import { uploadRouter } from './routes/uploadRoutes';

dotenv.config();

export const createApp = () => {
  const app = express();

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

  app.use(cors({
    origin: clientOrigin,
    credentials: true,
  }));

  app.use(helmet());
  app.use(compression());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use('/api', limiter);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/configs', configRouter);
  app.use('/api/role-templates', roleTemplateRouter);
  app.use('/api/cultural', culturalRouter);
  app.use('/api/relationships', relationshipRouter);
  app.use('/api/conversations', conversationRouter);
  app.use('/api/profiles', profileRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/uploads', uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
