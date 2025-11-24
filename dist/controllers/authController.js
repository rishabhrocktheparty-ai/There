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
            const jwtPayload = {
                id: user.id,
                email: user.email,
                role: user.adminProfile.role,
                isAdmin: true,
            };
            const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.config.JWT_SECRET, { expiresIn: '24h' });
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
            let { provider, accessToken, email, externalId, displayName } = req.body;
            logger_1.logger.info(`Social login attempt: ${provider} - ${email || externalId || 'token-based'}`);
            // If only provider and accessToken are provided (development mode)
            if (provider && accessToken && !email && !externalId) {
                // Mock profile data for development
                const mockProfiles = {
                    google: {
                        email: 'mockuser@gmail.com',
                        id: 'mock-google-id-123',
                        name: 'Mock Google User',
                    },
                    github: {
                        email: 'mockuser@github.com',
                        id: 'mock-github-id-456',
                        login: 'mockuser',
                        name: 'Mock GitHub User',
                    },
                    apple: {
                        email: 'mockuser@icloud.com',
                        id: 'mock-apple-id-789',
                        name: { firstName: 'Mock', lastName: 'Apple User' },
                    },
                };
                const profile = mockProfiles[provider];
                if (profile) {
                    email = profile.email;
                    externalId = profile.id;
                    displayName = profile.name && typeof profile.name === 'object'
                        ? `${profile.name.firstName} ${profile.name.lastName}`
                        : profile.name || profile.login || profile.email.split('@')[0];
                }
            }
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
            });
            if (!user) {
                throw new errorHandler_1.HttpError(404, 'User not found');
            }
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    isAdmin: !!user.adminProfile,
                    role: user.adminProfile?.role,
                    authProvider: user.authProvider,
                    createdAt: user.createdAt,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Logout (token invalidation)
    static async logout(req, res, next) {
        try {
            const userId = req.user?.id;
            if (userId) {
                logger_1.logger.info(`User logged out: ${userId}`);
            }
            // In production, you might want to:
            // 1. Add token to blacklist/Redis
            // 2. Clear any server-side session
            // 3. Update user's lastLogout timestamp
            res.json({
                message: 'Logged out successfully',
                success: true
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Refresh token
    static async refreshToken(req, res, next) {
        try {
            const userId = req.user?.id;
            const isAdmin = req.user?.isAdmin;
            if (!userId) {
                throw new errorHandler_1.HttpError(401, 'Unauthorized');
            }
            // Fetch fresh user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { adminProfile: true },
            });
            if (!user) {
                throw new errorHandler_1.HttpError(404, 'User not found');
            }
            // Generate new JWT token
            let token;
            if (isAdmin && user.adminProfile) {
                const jwtPayload = {
                    id: user.id,
                    email: user.email,
                    role: user.adminProfile.role,
                    isAdmin: true,
                };
                token = jsonwebtoken_1.default.sign(jwtPayload, config_1.config.JWT_SECRET, { expiresIn: '24h' });
            }
            else {
                token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    isAdmin: false,
                }, config_1.config.JWT_SECRET, { expiresIn: '7d' });
            }
            logger_1.logger.info(`Token refreshed for user: ${user.email}`);
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.adminProfile?.role,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Validate session/token
    static async validateSession(req, res, next) {
        try {
            const userId = req.user?.id;
            const isAdmin = req.user?.isAdmin;
            if (!userId) {
                throw new errorHandler_1.HttpError(401, 'Unauthorized');
            }
            // Verify user still exists and is active
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { adminProfile: true },
            });
            if (!user) {
                throw new errorHandler_1.HttpError(401, 'User no longer exists');
            }
            // Check if admin status matches
            if (isAdmin && !user.adminProfile) {
                throw new errorHandler_1.HttpError(401, 'Admin privileges revoked');
            }
            res.json({
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    isAdmin: !!user.adminProfile,
                    role: user.adminProfile?.role,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Change password
    static async changePassword(req, res, next) {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            if (!userId) {
                throw new errorHandler_1.HttpError(401, 'Unauthorized');
            }
            if (!currentPassword || !newPassword) {
                throw new errorHandler_1.HttpError(400, 'Current and new password required');
            }
            if (newPassword.length < 8) {
                throw new errorHandler_1.HttpError(400, 'New password must be at least 8 characters');
            }
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user || !user.passwordHash) {
                throw new errorHandler_1.HttpError(400, 'Cannot change password for social login accounts');
            }
            // Verify current password
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!isValidPassword) {
                throw new errorHandler_1.HttpError(401, 'Current password is incorrect');
            }
            // Hash new password
            const newPasswordHash = await bcryptjs_1.default.hash(newPassword, config_1.config.BCRYPT_ROUNDS);
            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });
            logger_1.logger.info(`Password changed for user: ${user.email}`);
            res.json({
                message: 'Password changed successfully',
                success: true,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
