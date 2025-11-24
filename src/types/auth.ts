export type AdminRole = 'super_admin' | 'config_manager' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: AdminRole;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}
