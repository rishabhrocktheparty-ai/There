"use strict";
// Environment Configuration Management
// Centralized configuration for different environments
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiConfig = exports.socialAuthConfig = exports.cdnConfig = exports.monitoringConfig = exports.backupConfig = exports.rateLimitConfig = exports.uploadConfig = exports.corsConfig = exports.jwtConfig = exports.cacheConfig = exports.redisConfig = exports.dbConfig = exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const zod_1 = require("zod");
// Environment schema validation
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000').transform(Number),
    // Database
    DATABASE_URL: zod_1.z.string(),
    // Redis
    REDIS_URL: zod_1.z.string().optional(),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379').transform(Number),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('*'),
    // External APIs
    OPENAI_API_KEY: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    // Monitoring
    SENTRY_DSN: zod_1.z.string().optional(),
    PROMETHEUS_PORT: zod_1.z.string().default('9090').transform(Number),
    // Email
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional().transform((val) => val ? Number(val) : undefined),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    // File Upload
    UPLOAD_PATH: zod_1.z.string().default('./uploads'),
    MAX_FILE_SIZE: zod_1.z.string().default('10485760').transform(Number), // 10MB
    // Security
    BCRYPT_ROUNDS: zod_1.z.string().default('12').transform(Number),
    RATE_LIMIT_WINDOW: zod_1.z.string().default('900000').transform(Number), // 15 minutes
    RATE_LIMIT_MAX: zod_1.z.string().default('100').transform(Number),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE: zod_1.z.string().optional(),
    // Backup
    BACKUP_RETENTION_DAYS: zod_1.z.string().default('30').transform(Number),
    BACKUP_SCHEDULE: zod_1.z.string().default('0 2 * * *'), // Daily at 2 AM
    // CDN
    CDN_URL: zod_1.z.string().optional(),
    CDN_BUCKET: zod_1.z.string().optional(),
    // Social Auth
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    FACEBOOK_APP_ID: zod_1.z.string().optional(),
    FACEBOOK_APP_SECRET: zod_1.z.string().optional(),
});
// Load and validate environment variables
const loadConfig = () => {
    const config = envSchema.parse(process.env);
    return config;
};
// Configuration instance
exports.config = loadConfig();
// Environment-specific configurations
exports.isDevelopment = exports.config.NODE_ENV === 'development';
exports.isProduction = exports.config.NODE_ENV === 'production';
exports.isTest = exports.config.NODE_ENV === 'test';
// Database configuration
exports.dbConfig = {
    url: exports.config.DATABASE_URL,
    ssl: exports.isProduction,
    maxConnections: exports.isProduction ? 20 : 5,
};
// Redis configuration
exports.redisConfig = {
    url: exports.config.REDIS_URL,
    host: exports.config.REDIS_HOST,
    port: exports.config.REDIS_PORT,
    password: exports.config.REDIS_PASSWORD,
    tls: exports.isProduction,
};
// Cache configuration
exports.cacheConfig = {
    host: exports.config.REDIS_HOST,
    port: exports.config.REDIS_PORT,
    password: exports.config.REDIS_PASSWORD,
    db: 0,
    ttl: 3600, // 1 hour
};
// JWT configuration
exports.jwtConfig = {
    secret: exports.config.JWT_SECRET,
    expiresIn: exports.config.JWT_EXPIRES_IN,
};
// CORS configuration
exports.corsConfig = {
    origin: exports.isProduction ? exports.config.CORS_ORIGIN.split(',') : true,
    credentials: true,
};
// Upload configuration
exports.uploadConfig = {
    dest: exports.config.UPLOAD_PATH,
    limits: {
        fileSize: exports.config.MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('Invalid file type'), false);
        }
    },
};
// Rate limiting configuration
exports.rateLimitConfig = {
    windowMs: exports.config.RATE_LIMIT_WINDOW,
    max: exports.config.RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
};
// Backup configuration
exports.backupConfig = {
    retentionDays: exports.config.BACKUP_RETENTION_DAYS,
    schedule: exports.config.BACKUP_SCHEDULE,
    directory: './backups',
};
// Monitoring configuration
exports.monitoringConfig = {
    sentry: {
        dsn: exports.config.SENTRY_DSN,
        environment: exports.config.NODE_ENV,
    },
    prometheus: {
        port: exports.config.PROMETHEUS_PORT,
    },
};
// CDN configuration
exports.cdnConfig = {
    url: exports.config.CDN_URL,
    bucket: exports.config.CDN_BUCKET,
};
// Social auth configuration
exports.socialAuthConfig = {
    google: {
        clientId: exports.config.GOOGLE_CLIENT_ID,
        clientSecret: exports.config.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
        appId: exports.config.FACEBOOK_APP_ID,
        appSecret: exports.config.FACEBOOK_APP_SECRET,
    },
};
// AI configuration
exports.aiConfig = {
    gemini: {
        apiKey: exports.config.GEMINI_API_KEY,
        model: 'gemini-1.5-flash',
    },
    openai: {
        apiKey: exports.config.OPENAI_API_KEY,
    },
    anthropic: {
        apiKey: exports.config.ANTHROPIC_API_KEY,
    },
};
