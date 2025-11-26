// Import AdminRole from Prisma to ensure type consistency
import { AdminRole as PrismaAdminRole } from '@prisma/client';

export type AdminRole = PrismaAdminRole;

// For regular users (non-admin), we don't require a role
export interface AuthUser {
  id: string;
  email: string;
  role?: AdminRole;  // Optional for regular users, required for admins
  isAdmin?: boolean;
}

// Extend Express Request type to include user with proper AdminRole typing
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: AdminRole;
      };
    }
  }
}
