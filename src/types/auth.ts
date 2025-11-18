export type AdminRole = 'super_admin' | 'config_manager' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: AdminRole;
}
