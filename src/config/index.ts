// Environment Configuration Management
// Centralized configuration for different environments

import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // External APIs
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  PROMETHEUS_PORT: z.string().default('9090').transform(Number),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((val) => val ? Number(val) : undefined),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // File Upload
  UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number), // 10MB

  // Security
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
  RATE_LIMIT_WINDOW: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().optional(),

  // Backup
  BACKUP_RETENTION_DAYS: z.string().default('30').transform(Number),
  BACKUP_SCHEDULE: z.string().default('0 2 * * *'), // Daily at 2 AM

  // CDN
  CDN_URL: z.string().optional(),
  CDN_BUCKET: z.string().optional(),

  // Social Auth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Load and validate environment variables
const loadConfig = (): EnvConfig => {
  const config = envSchema.parse(process.env);
  return config;
};

// Configuration instance
export const config = loadConfig();

// Environment-specific configurations
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
  url: config.DATABASE_URL,
  ssl: isProduction,
  maxConnections: isProduction ? 20 : 5,
};

// Redis configuration
export const redisConfig = {
  url: config.REDIS_URL,
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  tls: isProduction,
};

// Cache configuration
export const cacheConfig = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: 0,
  ttl: 3600, // 1 hour
};

// JWT configuration
export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
};

// CORS configuration
export const corsConfig = {
  origin: isProduction ? config.CORS_ORIGIN.split(',') : true,
  credentials: true,
};

// Upload configuration
export const uploadConfig = {
  dest: config.UPLOAD_PATH,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow images and audio files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Backup configuration
export const backupConfig = {
  retentionDays: config.BACKUP_RETENTION_DAYS,
  schedule: config.BACKUP_SCHEDULE,
  directory: './backups',
};

// Monitoring configuration
export const monitoringConfig = {
  sentry: {
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
  },
  prometheus: {
    port: config.PROMETHEUS_PORT,
  },
};

// CDN configuration
export const cdnConfig = {
  url: config.CDN_URL,
  bucket: config.CDN_BUCKET,
};

// Social auth configuration
export const socialAuthConfig = {
  google: {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    appId: config.FACEBOOK_APP_ID,
    appSecret: config.FACEBOOK_APP_SECRET,
  },
};