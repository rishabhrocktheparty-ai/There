/**
 * Secure Session Storage Utility
 * Handles secure storage of authentication tokens and session data
 */

interface SessionData {
  token: string;
  role: string | null;
  expiresAt: number;
  lastActivity: number;
}

const SESSION_KEY = 'auth_session';
const ACTIVITY_KEY = 'last_activity';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Save session to secure storage
 */
export const saveSession = (token: string, role: string | null): void => {
  const now = Date.now();
  const sessionData: SessionData = {
    token,
    role,
    expiresAt: now + SESSION_DURATION,
    lastActivity: now,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(ACTIVITY_KEY, now.toString());
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

/**
 * Get session from storage
 */
export const getSession = (): SessionData | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);
    const now = Date.now();

    // Check if session expired
    if (session.expiresAt < now) {
      clearSession();
      return null;
    }

    // Check inactivity timeout
    const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0');
    if (now - lastActivity > INACTIVITY_TIMEOUT) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

/**
 * Update last activity timestamp
 */
export const updateActivity = (): void => {
  try {
    const now = Date.now();
    localStorage.setItem(ACTIVITY_KEY, now.toString());

    // Also update session lastActivity
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session: SessionData = JSON.parse(stored);
      session.lastActivity = now;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Failed to update activity:', error);
  }
};

/**
 * Clear session from storage
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (): boolean => {
  const session = getSession();
  if (!session) return true;

  const now = Date.now();
  return session.expiresAt < now;
};

/**
 * Check if session is inactive
 */
export const isSessionInactive = (): boolean => {
  const session = getSession();
  if (!session) return true;

  const now = Date.now();
  return now - session.lastActivity > INACTIVITY_TIMEOUT;
};

/**
 * Get time until session expires
 */
export const getTimeUntilExpiry = (): number => {
  const session = getSession();
  if (!session) return 0;

  const now = Date.now();
  return Math.max(0, session.expiresAt - now);
};

/**
 * Get time until inactivity timeout
 */
export const getTimeUntilInactivity = (): number => {
  const session = getSession();
  if (!session) return 0;

  const now = Date.now();
  const inactivityTime = session.lastActivity + INACTIVITY_TIMEOUT;
  return Math.max(0, inactivityTime - now);
};
