"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const healthController_1 = require("./controllers/healthController");
const authRoutes_1 = require("./routes/authRoutes");
const socialAuthRoutes_1 = require("./routes/socialAuthRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const configRoutes_1 = require("./routes/configRoutes");
const roleTemplateRoutes_1 = require("./routes/roleTemplateRoutes");
const culturalRoutes_1 = require("./routes/culturalRoutes");
const relationshipRoutes_1 = require("./routes/relationshipRoutes");
const conversationRoutes_1 = require("./routes/conversationRoutes");
const profileRoutes_1 = require("./routes/profileRoutes");
const analyticsRoutes_1 = require("./routes/analyticsRoutes");
const uploadRoutes_1 = require("./routes/uploadRoutes");
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
dotenv_1.default.config();
const createApp = () => {
    const app = (0, express_1.default)();
    // Enable trust proxy for nginx/load balancers
    app.set('trust proxy', 1);
    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    app.use((0, cors_1.default)({
        origin: [
            clientOrigin,
            'http://localhost:5173', // Vite dev server
            'http://localhost:8080', // Nginx production frontend
            'http://localhost:3000', // Backend (for testing)
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', limiter);
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
    // Health check endpoints
    app.get('/health', healthController_1.healthCheck);
    app.get('/api/health', healthController_1.healthCheck);
    app.get('/api/health/db', healthController_1.databaseHealth);
    app.get('/api/health/auth', healthController_1.authHealth);
    // Kubernetes-style probes
    app.get('/healthz', healthController_1.livenessProbe);
    app.get('/readyz', healthController_1.readinessProbe);
    // Authentication routes
    app.use('/api/auth', authRoutes_1.authRouter);
    app.use('/api/auth', socialAuthRoutes_1.socialAuthRouter); // Social OAuth routes
    app.use('/api/admin', adminRoutes_1.adminRouter);
    app.use('/api/configs', configRoutes_1.configRouter);
    app.use('/api/role-templates', roleTemplateRoutes_1.roleTemplateRouter);
    app.use('/api/cultural', culturalRoutes_1.culturalRouter);
    app.use('/api/relationships', relationshipRoutes_1.relationshipRouter);
    app.use('/api/conversations', conversationRoutes_1.conversationRouter);
    app.use('/api/profiles', profileRoutes_1.profileRouter);
    app.use('/api/analytics', analyticsRoutes_1.analyticsRouter);
    app.use('/api/uploads', uploadRoutes_1.uploadRouter);
    app.use('/api/ai', aiRoutes_1.default);
    app.use(notFoundHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
