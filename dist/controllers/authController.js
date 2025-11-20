"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const config_1 = require("../config");
const logger_1 = require("../services/logger");
const prisma = new client_1.PrismaClient();
class AuthController {
    // Admin login
    static async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            logger_1.logger.info(`Admin login attempt for: ${email}`);
            // Find user with admin profile
            const user = await prisma.user.findUnique({
                where: { email },
                include: { adminProfile: true },
            });
            if (!user || !user.adminProfile) {
                logger_1.logger.warn(`Admin login failed - user not found or not admin: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            if (!user.passwordHash) {
                logger_1.logger.warn(`Admin login failed - no password set: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            // Verify password
            const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isValidPassword) {
                logger_1.logger.warn(`Admin login failed - invalid password: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.adminProfile.role,
                isAdmin: true,
            }, config_1.config.JWT_SECRET, { expiresIn: config_1.config.JWT_EXPIRES_IN });
            logger_1.logger.info(`Admin login successful: ${email} (${user.adminProfile.role})`);
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.adminProfile.role,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // User login (password-based)
    static async userLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            logger_1.logger.info(`User login attempt for: ${email}`);
            // Find user without admin profile
            const user = await prisma.user.findUnique({
                where: { email },
                include: { adminProfile: true },
            });
            if (!user) {
                logger_1.logger.warn(`User login failed - user not found: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            // Don't allow admin users to login via user endpoint
            if (user.adminProfile) {
                logger_1.logger.warn(`User login failed - admin user attempted user login: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            if (!user.passwordHash) {
                logger_1.logger.warn(`User login failed - no password set: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            // Verify password
            const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isValidPassword) {
                logger_1.logger.warn(`User login failed - invalid password: ${email}`);
                throw new errorHandler_1.HttpError(401, 'Invalid credentials');
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                isAdmin: false,
            }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
            logger_1.logger.info(`User login successful: ${email}`);
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // User registration
    static async userRegister(req, res, next) {
        try {
            const { email, password, displayName } = req.body;
            logger_1.logger.info(`User registration attempt for: ${email}`);
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                logger_1.logger.warn(`Registration failed - user already exists: ${email}`);
                throw new errorHandler_1.HttpError(409, 'User already exists');
            }
            // Hash password
            const passwordHash = await bcryptjs_1.default.hash(password, config_1.config.BCRYPT_ROUNDS);
            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    displayName: displayName || email.split('@')[0],
                    authProvider: 'PASSWORD',
                    locale: 'en',
                    timezone: 'UTC',
                },
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                isAdmin: false,
            }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
            logger_1.logger.info(`User registration successful: ${email}`);
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Social login (Google, Apple, GitHub)
    static async socialLogin(req, res, next) {
        try {
            const { provider, accessToken, email, externalId, displayName } = req.body;
            logger_1.logger.info(`Social login attempt: ${provider} - ${email || externalId}`);
            if (!email && !externalId) {
                throw new errorHandler_1.HttpError(400, 'Email or external ID required');
            }
            // In production, verify the accessToken with the provider's API
            // For now, we'll use a simplified version
            let user;
            // Try to find existing user by external ID
            if (externalId) {
                user = await prisma.user.findFirst({
                    where: {
                        authProvider: provider.toUpperCase(),
                        externalId,
                    },
                });
            }
            // Try to find by email if not found by external ID
            if (!user && email) {
                user = await prisma.user.findUnique({
                    where: { email },
                });
                // Update auth provider if user exists with different provider
                if (user && user.authProvider === 'PASSWORD') {
                    logger_1.logger.warn(`Social login - user exists with password auth: ${email}`);
                    throw new errorHandler_1.HttpError(409, 'User exists with password authentication. Please login with password.');
                }
            }
            // Create new user if not found
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: email,
                        authProvider: provider.toUpperCase(),
                        externalId,
                        displayName: displayName || email.split('@')[0],
                        locale: 'en',
                        timezone: 'UTC',
                    },
                });
                logger_1.logger.info(`New social user created: ${email} via ${provider}`);
            }
            else {
                logger_1.logger.info(`Existing social user logged in: ${email || externalId} via ${provider}`);
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                isAdmin: false,
            }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Get current user
    static async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.HttpError(401, 'Unauthorized');
            }
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { adminProfile: true },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    locale: true,
                    timezone: true,
                    preferences: true,
                    adminProfile: {
                        select: {
                            role: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new errorHandler_1.HttpError(404, 'User not found');
            }
            res.json({
                user: {
                    ...user,
                    isAdmin: !!user.adminProfile,
                    role: user.adminProfile?.role,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
