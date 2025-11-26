# Session Management - Quick Reference Guide

## 🚀 Features Overview

### Automatic Features (No Code Required)
When you use `useAuth()` from AuthProvider, you automatically get:

✅ **Token Refresh** - Every 20 minutes  
✅ **Activity Tracking** - Tracks mouse, keyboard, scroll, touch events  
✅ **Inactivity Timeout** - Logs out after 30 minutes of no activity  
✅ **Session Persistence** - Survives page reloads  
✅ **Automatic Cleanup** - Removes all session data on logout  

### Configuration Values

```typescript
SESSION_TIMEOUT = 30 minutes          // Inactivity before auto-logout
TOKEN_REFRESH_INTERVAL = 20 minutes   // How often to refresh token
INACTIVITY_CHECK_INTERVAL = 1 minute  // How often to check activity
SESSION_DURATION = 7 days             // Absolute session expiration
```

## 📖 Usage Examples

### Basic Login/Logout

```typescript
import { useAuth } from '@/providers/AuthProvider';

function LoginPage() {
  const { loginUser, loginAdmin, user, logout } = useAuth();

  const handleUserLogin = async () => {
    await loginUser('user@there.ai', 'User123!');
    // ✅ Session automatically created
    // ✅ Token refresh timer started
    // ✅ Activity tracking enabled
  };

  const handleLogout = async () => {
    await logout();
    // ✅ All timers cleared
    // ✅ Session storage cleaned
    // ✅ Activity listeners removed
  };

  return (
    <div>
      {user ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={handleUserLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

```typescript
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;

  // ✅ Token automatically refreshed if needed
  // ✅ Activity tracked while user is here
  return children;
}
```

### Manual Token Refresh (Optional)

```typescript
import { useAuth } from '@/providers/AuthProvider';

function MyComponent() {
  const { refreshToken } = useAuth();

  const handleManualRefresh = async () => {
    try {
      await refreshToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
      // User will be logged out automatically
    }
  };

  // Usually not needed - automatic refresh handles this
  return <button onClick={handleManualRefresh}>Refresh Now</button>;
}
```

### Session Validation

```typescript
import { useAuth } from '@/providers/AuthProvider';

function SessionCheck() {
  const { validateSession, user } = useAuth();

  const checkSession = async () => {
    const isValid = await validateSession();
    if (isValid) {
      console.log('Session is valid for:', user?.email);
    } else {
      console.log('Session invalid - logged out');
    }
  };

  return <button onClick={checkSession}>Check Session</button>;
}
```

## 🎯 Session Lifecycle

```
1. LOGIN
   ├─ Token created (7-day expiration)
   ├─ Session saved to secure storage
   ├─ Refresh timer started (20-min interval)
   ├─ Activity tracker started
   └─ Inactivity checker started (1-min interval)

2. ACTIVE SESSION
   ├─ User activity → Update lastActivity timestamp
   ├─ Every 20 min → Proactive token refresh
   ├─ Every 1 min → Check if inactive for 30 min
   └─ On 401 error → Reactive token refresh

3. LOGOUT (Manual or Auto)
   ├─ Call backend logout endpoint
   ├─ Clear secure session storage
   ├─ Remove localStorage data
   ├─ Clear axios authorization header
   ├─ Stop refresh timer
   ├─ Stop inactivity checker
   └─ Remove activity event listeners
```

## 🔧 Troubleshooting

### Session keeps expiring
**Cause**: User inactive for 30 minutes  
**Solution**: Activity is tracked automatically on mouse/keyboard/scroll/touch. If users are just watching content, consider adding `setInterval(() => updateActivity(), 5 * 60 * 1000)` to keep session alive.

### Token refresh failed
**Cause**: Backend /api/auth/refresh endpoint error  
**Solution**: User is automatically logged out. Check backend logs.

### Session lost on page reload
**Cause**: sessionStorage utility not working  
**Solution**: Check browser console for errors. Session should persist using secure storage.

### Multiple token refresh requests
**Cause**: Concurrent API calls hitting 401  
**Solution**: Already handled by queue pattern. First request refreshes, others wait.

## 📊 Monitoring Session Events

Add console logs to track session events:

```typescript
// In AuthProvider.tsx

// Token refresh
console.log('Token refreshed:', new Date().toISOString());

// Activity tracked
console.log('User activity detected:', event.type);

// Inactivity timeout
console.log('Session timed out due to inactivity');

// Logout
console.log('User logged out:', user?.email);
```

## 🔒 Security Best Practices

### Current Implementation (Development)
- ✅ Activity tracking prevents session hijacking
- ✅ Automatic timeout after inactivity
- ✅ Token refresh prevents expired sessions
- ✅ Secure storage with metadata

### Production Recommendations
- 🔐 Use HttpOnly cookies instead of localStorage
- 🔐 Enable HTTPS with secure cookie flag
- 🔐 Implement CSRF token protection
- 🔐 Add rate limiting on auth endpoints
- 🔐 Rotate refresh tokens on each use
- 🔐 Log all auth events for audit trail

## 📱 Testing Session Management

### Manual Testing
1. Login at http://localhost:8080
2. Open DevTools → Console
3. See session logs for activity tracking
4. Wait 20 minutes → Token should auto-refresh
5. Stay idle for 30 minutes → Auto logout

### Automated Testing
```bash
cd /workspaces/There/frontend
npx tsx test-session-management.ts
```

Expected: 8/9 tests pass (88.9%)

## 🎨 UI Integration

### Show Session Timer

```typescript
import { useAuth } from '@/providers/AuthProvider';
import { getTimeUntilInactivity } from '@/utils/sessionStorage';
import { useState, useEffect } from 'react';

function SessionTimer() {
  const { token } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const remaining = getTimeUntilInactivity();
      setTimeLeft(Math.floor(remaining / 1000 / 60)); // Convert to minutes
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  if (!token) return null;

  return (
    <div>
      Session expires in: {timeLeft} minutes
      {timeLeft < 5 && <span>⚠️ Session expiring soon!</span>}
    </div>
  );
}
```

## 📚 API Reference

### sessionStorage.ts Utilities

```typescript
// Save session
saveSession(token: string, role: string | null): void

// Get session
getSession(): SessionData | null

// Update activity timestamp
updateActivity(): void

// Clear all session data
clearSession(): void

// Check if session expired
isSessionExpired(): boolean

// Check if session inactive
isSessionInactive(): boolean

// Get time until expiry (ms)
getTimeUntilExpiry(): number

// Get time until inactivity timeout (ms)
getTimeUntilInactivity(): number
```

### AuthProvider Methods

```typescript
const {
  token,              // Current JWT token
  role,               // User role (null, 'user', or admin role)
  loading,            // Initial session restore loading
  user,               // User object with email, id, etc.
  loginAdmin,         // (email, password) => Promise<void>
  loginUser,          // (email, password) => Promise<void>
  loginUserSocial,    // (provider) => Promise<void>
  registerUser,       // (email, password, displayName?) => Promise<void>
  logout,             // () => Promise<void>
  refreshToken,       // () => Promise<void>
  validateSession,    // () => Promise<boolean>
} = useAuth();
```

## 🎉 Success Indicators

Your session management is working correctly if:

- ✅ Login persists after page reload
- ✅ Token refreshes automatically every 20 minutes
- ✅ User logged out after 30 minutes of inactivity
- ✅ Activity events update session timestamp
- ✅ Logout clears all session data
- ✅ Multiple tabs share the same session
- ✅ 401 errors trigger automatic token refresh
- ✅ No console errors related to session management

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review SESSION-MANAGEMENT-COMPLETE.md
3. Run test suite: `npx tsx test-session-management.ts`
4. Check Docker logs: `docker logs there-backend`
