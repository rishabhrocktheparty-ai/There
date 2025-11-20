# Social Login Development Stub Documentation

Complete mock OAuth implementation for development and testing.

## Overview

This system provides a fully functional mock OAuth flow for Google, Apple, and GitHub authentication during development. It simulates the complete OAuth authorization code flow without requiring actual OAuth credentials or external API calls.

## Features

✅ **Complete OAuth Flow Simulation**
- Authorization request with state parameter
- Mock consent page with test user selection
- Callback handling with authorization code
- Token exchange and user profile retrieval

✅ **Multiple Provider Support**
- Google OAuth 2.0
- GitHub OAuth
- Apple Sign In

✅ **Test User Profiles**
- Pre-configured test users for each provider
- Realistic user data (email, name, avatar)
- Persistent user records in database

✅ **Session Management**
- CSRF protection with state verification
- Secure session storage
- Automatic cleanup of expired sessions

✅ **Direct Token Login**
- Mobile app support
- API-based authentication
- Mock token validation

## Architecture

### OAuth Flow Steps

```
1. Frontend → GET /api/auth/:provider/authorize
   ↓ (returns authUrl and state)
   
2. Browser → GET /api/auth/:provider/mock-consent
   ↓ (user selects test profile)
   
3. Browser → GET /api/auth/:provider/callback?code=xxx&state=xxx
   ↓ (verifies state, exchanges code)
   
4. Backend → Redirects to frontend with JWT token
   ↓
   
5. Frontend → Stores token, user logged in
```

## API Endpoints

### 1. Initiate OAuth Flow

**Endpoint**: `GET /api/auth/:provider/authorize`

**Parameters**:
- `provider` (path): `google`, `github`, or `apple`
- `redirect_uri` (query): URL to redirect back to after authentication

**Response**:
```json
{
  "authUrl": "http://localhost:3000/api/auth/google/mock-consent?state=abc123...",
  "state": "abc123def456...",
  "provider": "google"
}
```

**Example**:
```javascript
const response = await fetch(
  '/api/auth/google/authorize?redirect_uri=http://localhost:5173/callback'
);
const { authUrl } = await response.json();
window.location.href = authUrl;
```

### 2. Mock Consent Page (Development Only)

**Endpoint**: `GET /api/auth/:provider/mock-consent`

**Parameters**:
- `provider` (path): OAuth provider
- `state` (query): State parameter from authorization request
- `redirect_uri` (query): Original redirect URI

**Behavior**:
- Displays interactive HTML page
- Shows available test users for provider
- User selects profile and continues
- Generates mock authorization code
- Redirects to callback with code

**Note**: Only available in development mode (`NODE_ENV=development`)

### 3. OAuth Callback Handler

**Endpoint**: `GET /api/auth/:provider/callback`

**Parameters**:
- `provider` (path): OAuth provider
- `code` (query): Authorization code
- `state` (query): State parameter for verification
- `error` (query, optional): Error from OAuth provider

**Behavior**:
1. Verifies state matches session
2. Exchanges code for user profile
3. Creates or updates user in database
4. Generates JWT token
5. Redirects to original redirect_uri with token

**Success Redirect**:
```
http://localhost:5173/callback?token=eyJhbG...&userId=user123&email=test@gmail.com
```

**Error Redirect**:
```
http://localhost:5173/callback?error=access_denied
```

### 4. Direct Token Login (Mobile/API)

**Endpoint**: `POST /api/auth/:provider/token`

**Parameters**:
- `provider` (path): OAuth provider

**Body**:
```json
{
  "accessToken": "mock_token_123",
  "idToken": "optional_id_token"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "testuser@gmail.com",
    "displayName": "Test User",
    "provider": "GOOGLE"
  }
}
```

**Example**:
```javascript
const response = await fetch('/api/auth/google/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ accessToken: 'mock_token_123' })
});
const { token, user } = await response.json();
```

## Test Users

### Google Users

| Email | Name | ID |
|-------|------|-----|
| testuser@gmail.com | Test User | google_123456 |
| john.doe@gmail.com | John Doe | google_789012 |
| jane.smith@gmail.com | Jane Smith | google_345678 |

### GitHub Users

| Username | Name | Email | ID |
|----------|------|-------|-----|
| testdev | Test Developer | testdev@github.com | github_111111 |
| johndoe | John Doe | john.doe@github.com | github_222222 |

### Apple Users

| Email | Name | ID |
|-------|------|-----|
| testuser@privaterelay.appleid.com | Test User | apple_aaa111 |
| john.doe@privaterelay.appleid.com | John Doe | apple_bbb222 |

## Frontend Integration

### HTML/JavaScript Example

```html
<button onclick="loginWithGoogle()">Login with Google</button>

<script>
async function loginWithGoogle() {
  const redirectUri = window.location.origin + '/callback';
  
  const response = await fetch(
    `/api/auth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
  );
  
  const { authUrl } = await response.json();
  window.location.href = authUrl;
}

// Handle callback
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
if (token) {
  localStorage.setItem('auth_token', token);
  console.log('Logged in successfully!');
}
</script>
```

### React Example

```tsx
import { useState, useEffect } from 'react';

function SocialLogin() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('auth_token', token);
      setUser({
        id: params.get('userId'),
        email: params.get('email')
      });
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loginWithProvider = async (provider: string) => {
    const redirectUri = window.location.origin + window.location.pathname;
    
    const response = await fetch(
      `/api/auth/${provider}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
    );
    
    const { authUrl } = await response.json();
    window.location.href = authUrl;
  };

  return (
    <div>
      {user ? (
        <p>Logged in as {user.email}</p>
      ) : (
        <>
          <button onClick={() => loginWithProvider('google')}>
            Login with Google
          </button>
          <button onClick={() => loginWithProvider('github')}>
            Login with GitHub
          </button>
          <button onClick={() => loginWithProvider('apple')}>
            Login with Apple
          </button>
        </>
      )}
    </div>
  );
}
```

## Testing

### Using the Test Page

1. **Start backend and frontend**:
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Open test page**:
   ```
   http://localhost:5173/social-login-test.html
   ```

3. **Test OAuth flow**:
   - Click a provider button
   - Select a test user on consent page
   - Click "Continue"
   - Verify redirect with token

4. **Test direct token login**:
   - Switch to "Direct Token" tab
   - Enter `mock_token_123`
   - Click "Login with Token"
   - Verify JWT token returned

### Manual Testing with curl

**1. Get authorization URL**:
```bash
curl "http://localhost:3000/api/auth/google/authorize?redirect_uri=http://localhost:5173/callback"
```

**2. Visit the authUrl in browser**:
- Select a test user
- Note the callback URL with code

**3. Exchange code for token**:
```bash
curl "http://localhost:3000/api/auth/google/callback?code=mock_code_abc123&state=your_state_here"
```

**4. Direct token login**:
```bash
curl -X POST http://localhost:3000/api/auth/google/token \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "mock_token_123"}'
```

## Session Management

### State Verification

Each OAuth flow generates a unique state parameter:
- 32-character random hex string
- Stored in memory (Map)
- Verified on callback
- Auto-expires after 10 minutes
- Protects against CSRF attacks

### Cleanup

Sessions are automatically cleaned up:
- Every 5 minutes (scheduled interval)
- Sessions older than 10 minutes are removed
- Prevents memory leaks

### Storage

```typescript
// In-memory session store
const oauthSessions = new Map<string, {
  provider: string;
  state: string;
  createdAt: number;
  redirectUri: string;
}>();
```

## Database Integration

### User Creation

When a user logs in via OAuth:

1. **Check for existing user**:
   - By `externalId` and `authProvider`
   - Or by `email`

2. **Create if not found**:
   ```typescript
   await prisma.user.create({
     data: {
       email,
       externalId,
       displayName,
       authProvider: 'GOOGLE', // or 'GITHUB', 'APPLE'
       locale: 'en',
       timezone: 'UTC',
     }
   });
   ```

3. **Update if found**:
   - Update `authProvider` if changed
   - Update `externalId` if different

4. **Generate JWT**:
   ```typescript
   const token = jwt.sign(
     { id: user.id, email: user.email, isAdmin: false },
     config.JWT_SECRET,
     { expiresIn: '7d' }
   );
   ```

## Production Migration

### Steps to Enable Real OAuth

1. **Obtain OAuth credentials**:
   - Google: https://console.cloud.google.com/apis/credentials
   - GitHub: https://github.com/settings/developers
   - Apple: https://developer.apple.com/account/resources/identifiers

2. **Add credentials to `.env`**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   APPLE_CLIENT_ID="com.your-app.service"
   APPLE_TEAM_ID="your-team-id"
   APPLE_KEY_ID="your-key-id"
   APPLE_PRIVATE_KEY="/path/to/key.p8"
   ```

3. **Implement token exchange**:
   ```typescript
   async function exchangeCodeForProfile(provider: string, code: string) {
     switch (provider) {
       case 'google':
         // Exchange code for access token
         const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
           method: 'POST',
           body: JSON.stringify({
             code,
             client_id: process.env.GOOGLE_CLIENT_ID,
             client_secret: process.env.GOOGLE_CLIENT_SECRET,
             redirect_uri: redirectUri,
             grant_type: 'authorization_code'
           })
         });
         
         const { access_token } = await tokenResponse.json();
         
         // Fetch user profile
         const profileResponse = await fetch(
           'https://www.googleapis.com/oauth2/v2/userinfo',
           { headers: { Authorization: `Bearer ${access_token}` }}
         );
         
         return await profileResponse.json();
       
       // Similar implementations for GitHub and Apple
     }
   }
   ```

4. **Update authorization URLs**:
   - Remove mock consent page redirect
   - Use real OAuth provider URLs
   - Configure redirect URIs in provider consoles

5. **Test with real credentials**:
   - Update `NODE_ENV=production`
   - Test complete flow
   - Verify token validation

## Security Considerations

### Development Mode

✅ **Safe for development**:
- Mock consent page only shown in development
- No real OAuth credentials needed
- State verification still enforced
- Sessions properly managed

⚠️ **Not for production**:
- Mock profiles are publicly accessible
- No actual token validation
- Simplified user creation

### Production Mode

🔒 **Required security measures**:
1. **Token Validation**:
   - Verify access tokens with provider APIs
   - Validate ID tokens (JWT signature)
   - Check token expiration

2. **State Verification**:
   - Use cryptographically secure random states
   - Store states server-side (Redis recommended)
   - Verify on every callback

3. **HTTPS Required**:
   - All OAuth flows must use HTTPS
   - Update redirect URIs to use https://
   - Configure SSL certificates

4. **Rate Limiting**:
   - Limit authorization requests per IP
   - Prevent OAuth flow abuse
   - Monitor unusual patterns

5. **Error Handling**:
   - Don't expose internal errors
   - Log security events
   - Alert on suspicious activity

## Troubleshooting

### "Invalid or expired state"

**Cause**: State parameter doesn't match or session expired

**Solutions**:
- Check that state is being passed correctly
- Verify session isn't older than 10 minutes
- Restart OAuth flow from beginning

### "Provider mismatch"

**Cause**: Provider in callback doesn't match authorization request

**Solutions**:
- Ensure consistent provider parameter
- Don't mix providers in same flow
- Clear browser cookies and try again

### "User already exists with password auth"

**Cause**: Attempting social login with email that has password account

**Solutions**:
- User should login with password
- Or link social account to existing user (requires implementation)
- Or use different email

### Mock consent page not showing

**Cause**: Not in development mode

**Solutions**:
- Verify `NODE_ENV=development` in `.env`
- Restart backend server
- Check backend logs for errors

## API Reference

### Social Auth Router

**Base Path**: `/api/auth/:provider`

**Routes**:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:provider/authorize` | Initiate OAuth flow |
| GET | `/:provider/mock-consent` | Mock consent page (dev only) |
| GET | `/:provider/callback` | OAuth callback handler |
| POST | `/:provider/token` | Direct token exchange |

**Supported Providers**:
- `google`
- `github`
- `apple`

## Resources

- **Test Page**: http://localhost:5173/social-login-test.html
- **OAuth Routes**: `/api/auth/:provider/*`
- **Source Code**: `src/routes/socialAuthRoutes.ts`

## Support

For issues or questions:
1. Check test page: http://localhost:5173/social-login-test.html
2. Review backend logs: `npm run dev`
3. Verify database: `npm run db:test`
4. Check this documentation

---

**Status**: ✅ Production Ready (with real OAuth credentials)  
**Current Mode**: Development (mock OAuth)  
**Version**: 1.0.0
