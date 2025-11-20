import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { HttpError } from '../middleware/errorHandler';
import { config } from '../config';
import { logger } from '../services/logger';

const prisma = new PrismaClient();

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  displayName?: string;
}

interface SocialLoginBody {
  provider: 'google' | 'apple' | 'github';
  accessToken: string;
  email?: string;
  externalId?: string;
  displayName?: string;
}

export class AuthController {
  // Admin login
  static async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginBody;

      logger.info(`Admin login attempt for: ${email}`);

      // Find user with admin profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: { adminProfile: true },
      });

      if (!user || !user.adminProfile) {
        logger.warn(`Admin login failed - user not found or not admin: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      if (!user.passwordHash) {
        logger.warn(`Admin login failed - no password set: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        logger.warn(`Admin login failed - invalid password: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.adminProfile.role,
          isAdmin: true,
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      logger.info(`Admin login successful: ${email} (${user.adminProfile.role})`);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.adminProfile.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // User login (password-based)
  static async userLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginBody;

      logger.info(`User login attempt for: ${email}`);

      // Find user without admin profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: { adminProfile: true },
      });

      if (!user) {
        logger.warn(`User login failed - user not found: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      // Don't allow admin users to login via user endpoint
      if (user.adminProfile) {
        logger.warn(`User login failed - admin user attempted user login: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      if (!user.passwordHash) {
        logger.warn(`User login failed - no password set: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        logger.warn(`User login failed - invalid password: ${email}`);
        throw new HttpError(401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          isAdmin: false,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`User login successful: ${email}`);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // User registration
  static async userRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body as RegisterBody;

      logger.info(`User registration attempt for: ${email}`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        logger.warn(`Registration failed - user already exists: ${email}`);
        throw new HttpError(409, 'User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

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
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          isAdmin: false,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`User registration successful: ${email}`);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Social login (Google, Apple, GitHub)
  static async socialLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, accessToken, email, externalId, displayName } = req.body as SocialLoginBody;

      logger.info(`Social login attempt: ${provider} - ${email || externalId}`);

      if (!email && !externalId) {
        throw new HttpError(400, 'Email or external ID required');
      }

      // In production, verify the accessToken with the provider's API
      // For now, we'll use a simplified version

      let user;

      // Try to find existing user by external ID
      if (externalId) {
        user = await prisma.user.findFirst({
          where: {
            authProvider: provider.toUpperCase() as any,
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
          logger.warn(`Social login - user exists with password auth: ${email}`);
          throw new HttpError(409, 'User exists with password authentication. Please login with password.');
        }
      }

      // Create new user if not found
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email!,
            authProvider: provider.toUpperCase() as any,
            externalId,
            displayName: displayName || email!.split('@')[0],
            locale: 'en',
            timezone: 'UTC',
          },
        });
        logger.info(`New social user created: ${email} via ${provider}`);
      } else {
        logger.info(`Existing social user logged in: ${email || externalId} via ${provider}`);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          isAdmin: false,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpError(401, 'Unauthorized');
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
        throw new HttpError(404, 'User not found');
      }

      res.json({
        user: {
          ...user,
          isAdmin: !!user.adminProfile,
          role: user.adminProfile?.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
