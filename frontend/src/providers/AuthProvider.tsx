import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export type Role = 'super_admin' | 'config_manager' | 'viewer' | 'user';

interface AuthState {
  token: string | null;
  role: Role | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginUserSocial: (provider: 'google') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ token: null, role: null, loading: true });

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      setState({ ...JSON.parse(stored), loading: false });
    } else {
      setState({ token: null, role: null, loading: false });
    }
  }, []);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const loginAdmin = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/admin/login', { email, password });
    const token = res.data.token as string;
    const payload = JSON.parse(atob(token.split('.')[1])) as { role: Role };
    const newState: AuthState = { token, role: payload.role, loading: false };
    setState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const loginUserSocial = async (provider: 'google') => {
    // Stub: in real app, integrate with Google OAuth
    const fakeAccessToken = 'fake-google-token';
    const res = await axios.post('/api/auth/user/social-login', { provider, accessToken: fakeAccessToken });
    const token = res.data.token as string;
    const newState: AuthState = { token, role: 'user', loading: false };
    setState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const logout = () => {
    setState({ token: null, role: null, loading: false });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ ...state, loginAdmin, loginUserSocial, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
