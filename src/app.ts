import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { healthCheck, livenessProbe, readinessProbe, databaseHealth, authHealth } from './controllers/healthController';
import { authRouter } from './routes/authRoutes';
import { socialAuthRouter } from './routes/socialAuthRoutes';
import { adminRouter } from './routes/adminRoutes';
import { configRouter } from './routes/configRoutes';
import { roleTemplateRouter } from './routes/roleTemplateRoutes';
import { culturalRouter } from './routes/culturalRoutes';
import { relationshipRouter } from './routes/relationshipRoutes';
import { conversationRouter } from './routes/conversationRoutes';
import { profileRouter } from './routes/profileRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import aiRouter from './routes/aiRoutes';
import { onboardingRouter } from './routes/onboardingRoutes';

dotenv.config();

export const createApp = () => {
  const app = express();

  // Enable trust proxy for nginx/load balancers
  app.set('trust proxy', 1);

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  app.use(cors({
    origin: [
      clientOrigin, 
      'http://localhost:5173',  // Vite dev server
      'http://localhost:8080',  // Nginx production frontend
      'http://localhost:3000',  // Backend (for testing)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(helmet());
  app.use(compression());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Health check endpoints
  app.get('/health', healthCheck);
  app.get('/api/health', healthCheck);
  app.get('/api/health/db', databaseHealth);
  app.get('/api/health/auth', authHealth);
  
  // Kubernetes-style probes
  app.get('/healthz', livenessProbe);
  app.get('/readyz', readinessProbe);

  // Authentication routes
  app.use('/api/auth', authRouter);
  app.use('/api/auth', socialAuthRouter); // Social OAuth routes
  
  app.use('/api/admin', adminRouter);
  app.use('/api/configs', configRouter);
  app.use('/api/role-templates', roleTemplateRouter);
  app.use('/api/cultural', culturalRouter);
  app.use('/api/relationships', relationshipRouter);
  app.use('/api/conversations', conversationRouter);
  app.use('/api/profiles', profileRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/uploads', uploadRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/onboarding', onboardingRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
