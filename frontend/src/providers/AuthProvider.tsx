import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { 
  saveSession, 
  getSession, 
  clearSession, 
  updateActivity,
  isSessionInactive,
  getTimeUntilInactivity 
} from '../utils/sessionStorage';

// Configure axios defaults
axios.defaults.baseURL = ''; // Empty string means use same origin (works with nginx proxy)
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const INACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

// Add response interceptor for global error handling
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const stored = localStorage.getItem('auth');
        if (stored) {
          const authData = JSON.parse(stored);
          if (authData.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
            const response = await axios.post('/api/auth/refresh');
            const newToken = response.data.token;
            
            // Update stored token
            authData.token = newToken;
            localStorage.setItem('auth', JSON.stringify(authData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            isRefreshing = false;
            processQueue(null, newToken);
            
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Token refresh failed, clear auth
        localStorage.removeItem('auth');
        localStorage.removeItem('lastActivity');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Logout function (defined early to avoid dependency issues)
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear all session data
      clearSession();
      setState({ token: null, role: null, loading: false });
      setUser(null);
      localStorage.removeItem('auth');
      
      // Clear axios auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear timers
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
  }, []);

  // Token refresh function (defined early to avoid dependency issues)
  const refreshToken = useCallback(async () => {
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
      
      // Use secure session storage
      saveSession(token, role);
      localStorage.setItem('auth', JSON.stringify(newState)); // Keep for backward compatibility
      
      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  }, [logout]);

  // Proactive token refresh
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(() => {
      if (state.token) {
        console.log('Proactively refreshing token...');
        refreshToken().catch(err => {
          console.error('Scheduled token refresh failed:', err);
        });
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [state.token, refreshToken]);

  // Activity tracking handler
  const handleActivity = useCallback(() => {
    if (state.token) {
      updateActivity();
    }
  }, [state.token]);

  // Check for inactivity timeout
  const checkInactivity = useCallback(async () => {
    if (state.token && isSessionInactive()) {
      console.log('Session timed out due to inactivity');
      await logout();
    }
  }, [state.token, logout]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      // Try new secure session storage first
      const secureSession = getSession();
      if (secureSession && !isSessionInactive()) {
        setState({ token: secureSession.token, role: secureSession.role as Role | null, loading: true });
        axios.defaults.headers.common['Authorization'] = `Bearer ${secureSession.token}`;
        
        try {
          const res = await axios.get('/api/auth/validate');
          setUser(res.data.user);
          setState(prev => ({ ...prev, loading: false }));
          return; // Success, exit early
        } catch (error) {
          console.error('Secure session validation failed:', error);
          clearSession();
        }
      }
      
      // Fallback to old localStorage method
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const authData = JSON.parse(stored);
          setState({ ...authData, loading: true });
          
          // Set axios header before validating
          if (authData.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
          }
          
          // Validate session and fetch user data
          try {
            const res = await axios.get('/api/auth/validate');
            setUser(res.data.user);
            setState(prev => ({ ...prev, loading: false }));
            
            // Migrate to secure storage
            if (authData.token && authData.role) {
              saveSession(authData.token, authData.role);
            }
          } catch (error) {
            // Session invalid, clear auth
            console.error('Session validation failed:', error);
            localStorage.removeItem('auth');
            delete axios.defaults.headers.common['Authorization'];
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

  // Setup axios authorization header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Setup activity tracking and timers
  useEffect(() => {
    if (state.token) {
      // Add activity listeners
      ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      // Start proactive token refresh
      scheduleTokenRefresh();

      // Start inactivity checker
      inactivityTimerRef.current = setInterval(checkInactivity, INACTIVITY_CHECK_INTERVAL);

      return () => {
        // Cleanup listeners and timers
        ACTIVITY_EVENTS.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });

        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }

        if (inactivityTimerRef.current) {
          clearInterval(inactivityTimerRef.current);
        }
      };
    }
  }, [state.token, handleActivity, scheduleTokenRefresh, checkInactivity]);

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
      
      // Use secure session storage
      saveSession(token, payload.role);
      localStorage.setItem('auth', JSON.stringify(newState)); // Keep for backward compatibility
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
      
      // Use secure session storage
      saveSession(token, 'user');
      localStorage.setItem('auth', JSON.stringify(newState)); // Keep for backward compatibility
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
      
      // Use secure session storage
      saveSession(token, 'user');
      localStorage.setItem('auth', JSON.stringify(newState)); // Keep for backward compatibility
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
      
      // Use secure session storage
      saveSession(token, 'user');
      localStorage.setItem('auth', JSON.stringify(newState)); // Keep for backward compatibility
      
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
