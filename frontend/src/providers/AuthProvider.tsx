import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

// Configure axios defaults
axios.defaults.baseURL = ''; // Empty string means use same origin (works with nginx proxy)
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type Role = 'super_admin' | 'config_manager' | 'viewer' | 'user';

interface AuthState {
  token: string | null;
  role: Role | null;
  loading: boolean;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role?: Role;
  isAdmin?: boolean;
}

interface AuthContextValue extends AuthState {
  user: User | null;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  loginUserSocial: (provider: 'google' | 'github' | 'apple') => Promise<void>;
  registerUser: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ token: null, role: null, loading: true });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const authData = JSON.parse(stored);
          setState({ ...authData, loading: true });
          
          // Validate session and fetch user data
          try {
            const res = await axios.get('/api/auth/validate');
            setUser(res.data.user);
            setState(prev => ({ ...prev, loading: false }));
          } catch (error) {
            // Session invalid, clear auth
            console.error('Session validation failed:', error);
            localStorage.removeItem('auth');
            setState({ token: null, role: null, loading: false });
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to parse stored auth:', error);
          localStorage.removeItem('auth');
          setState({ token: null, role: null, loading: false });
          setUser(null);
        }
      } else {
        setState({ token: null, role: null, loading: false });
      }
    };
    
    restoreSession();
  }, []);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const loginAdmin = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/admin/login', { email, password });
      const token = res.data.token as string;
      const userData = res.data.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const payload = JSON.parse(atob(token.split('.')[1])) as { role: Role };
      const newState: AuthState = { token, role: payload.role, loading: false };
      setState(newState);
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(newState));
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/user/login', { email, password });
      const token = res.data.token as string;
      const userData = res.data.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const newState: AuthState = { token, role: 'user', loading: false };
      setState(newState);
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(newState));
    } catch (error) {
      console.error('User login failed:', error);
      throw error;
    }
  };

  const registerUser = async (email: string, password: string, displayName?: string) => {
    try {
      const res = await axios.post('/api/auth/user/register', { 
        email, 
        password, 
        displayName 
      });
      const token = res.data.token as string;
      const userData = res.data.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const newState: AuthState = { token, role: 'user', loading: false };
      setState(newState);
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(newState));
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  };

  const loginUserSocial = async (provider: 'google' | 'github' | 'apple') => {
    try {
      // Simulated social login with mock token
      const fakeAccessToken = `fake-${provider}-token-${Date.now()}`;
      console.log('Attempting social login:', { provider, fakeAccessToken });
      
      const res = await axios.post('/api/auth/user/social-login', { 
        provider, 
        accessToken: fakeAccessToken 
      });
      
      console.log('Social login response:', res.data);
      
      const token = res.data.token as string;
      const userData = res.data.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const newState: AuthState = { token, role: 'user', loading: false };
      setState(newState);
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(newState));
      
      console.log('Social login successful, user:', userData);
    } catch (error) {
      console.error('Social login failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear state regardless of backend response
      setState({ token: null, role: null, loading: false });
      setUser(null);
      localStorage.removeItem('auth');
    }
  };

  const refreshToken = async () => {
    try {
      const res = await axios.post('/api/auth/refresh');
      const token = res.data.token as string;
      const userData = res.data.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const payload = JSON.parse(atob(token.split('.')[1])) as { role?: Role; isAdmin?: boolean };
      const role = payload.role || (payload.isAdmin ? 'super_admin' : 'user');
      
      const newState: AuthState = { token, role, loading: false };
      setState(newState);
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(newState));
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const res = await axios.get('/api/auth/validate');
      setUser(res.data.user);
      return res.data.valid;
    } catch (error) {
      console.error('Session validation failed:', error);
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        user,
        loginAdmin, 
        loginUser,
        loginUserSocial, 
        registerUser,
        logout,
        refreshToken,
        validateSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
