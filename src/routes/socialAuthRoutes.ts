import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../services/logger';
import { prisma } from '../services/prisma';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

/**
 * Development-only OAuth stub system
 * Simulates OAuth flows for Google, Apple, and GitHub
 */

// In-memory session store for OAuth state verification
const oauthSessions = new Map<string, {
  provider: string;
  state: string;
  createdAt: number;
  redirectUri: string;
}>();

// Cleanup old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of oauthSessions.entries()) {
    if (now - session.createdAt > 600000) { // 10 minutes
      oauthSessions.delete(key);
    }
  }
}, 300000);

// Mock user profiles for different providers
const MOCK_PROFILES = {
  google: [
    {
      id: 'google_123456',
      email: 'testuser@gmail.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
      locale: 'en',
      verified_email: true,
    },
    {
      id: 'google_789012',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://lh3.googleusercontent.com/a/john-doe',
      locale: 'en',
      verified_email: true,
    },
    {
      id: 'google_345678',
      email: 'jane.smith@gmail.com',
      name: 'Jane Smith',
      given_name: 'Jane',
      family_name: 'Smith',
      picture: 'https://lh3.googleusercontent.com/a/jane-smith',
      locale: 'en',
      verified_email: true,
    },
  ],
  github: [
    {
      id: 'github_111111',
      login: 'testdev',
      name: 'Test Developer',
      email: 'testdev@github.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      bio: 'Software Developer',
    },
    {
      id: 'github_222222',
      login: 'johndoe',
      name: 'John Doe',
      email: 'john.doe@github.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/2',
      bio: 'Full Stack Engineer',
    },
  ],
  apple: [
    {
      id: 'apple_aaa111',
      email: 'testuser@privaterelay.appleid.com',
      name: { firstName: 'Test', lastName: 'User' },
      email_verified: true,
    },
    {
      id: 'apple_bbb222',
      email: 'john.doe@privaterelay.appleid.com',
      name: { firstName: 'John', lastName: 'Doe' },
      email_verified: true,
    },
  ],
};

/**
 * Generate mock OAuth authorization URL
 * Simulates redirect to provider's OAuth consent screen
 */
function generateAuthUrl(provider: string, state: string, redirectUri: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, redirect to our mock consent page
    const baseUrl = process.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/api/auth/${provider}/mock-consent?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  // Production URLs (to be implemented with real OAuth)
  switch (provider) {
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}`;
    case 'github':
      return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;
    case 'apple':
      return `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20name&state=${state}`;
    default:
      throw new Error('Unsupported provider');
  }
}

/**
 * Generate JWT token for authenticated user
 */
function generateToken(userId: string, email: string, isAdmin: boolean = false): string {
  return jwt.sign(
    { id: userId, email, isAdmin },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Step 1: Initiate OAuth flow
 * GET /api/auth/:provider/authorize
 */
router.get('/:provider/authorize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params;
    const { redirect_uri } = req.query;

    if (!['google', 'apple', 'github'].includes(provider)) {
      throw new HttpError(400, 'Unsupported provider');
    }

    if (!redirect_uri || typeof redirect_uri !== 'string') {
      throw new HttpError(400, 'redirect_uri is required');
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Store session
    oauthSessions.set(state, {
      provider,
      state,
      createdAt: Date.now(),
      redirectUri: redirect_uri,
    });

    logger.info(`OAuth flow initiated: ${provider} - state: ${state}`);

    // Generate authorization URL
    const authUrl = generateAuthUrl(provider, state, redirect_uri);

    res.json({
      authUrl,
      state,
      provider,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Step 2: Mock OAuth consent page (development only)
 * GET /api/auth/:provider/mock-consent
 */
router.get('/:provider/mock-consent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params;
    const { state, redirect_uri } = req.query;

    if (process.env.NODE_ENV !== 'development') {
      throw new HttpError(404, 'Not found');
    }

    if (!state || typeof state !== 'string') {
      throw new HttpError(400, 'Invalid state');
    }

    // Verify state exists
    const session = oauthSessions.get(state);
    if (!session) {
      throw new HttpError(400, 'Invalid or expired state');
    }

    // Get mock profiles for this provider
    const profiles = MOCK_PROFILES[provider as keyof typeof MOCK_PROFILES] || [];

    // Generate HTML consent page
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth - Development</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        h1 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 0.5rem;
        }
        .dev-badge {
            display: inline-block;
            background: #ffc107;
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 4px;
        }
        .info p {
            color: #1976d2;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .profiles {
            margin-bottom: 1.5rem;
        }
        .profile-label {
            font-weight: 600;
            color: #666;
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
        }
        .profile-option {
            background: #f5f5f5;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .profile-option:hover {
            background: #fff;
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .profile-option.selected {
            background: #fff;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .profile-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
        }
        .profile-email {
            font-size: 0.875rem;
            color: #666;
        }
        .profile-id {
            font-size: 0.75rem;
            color: #999;
            font-family: monospace;
            margin-top: 0.25rem;
        }
        .actions {
            display: flex;
            gap: 1rem;
        }
        .btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover:not(:disabled) {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .btn-secondary {
            background: #e0e0e0;
            color: #333;
        }
        .btn-secondary:hover {
            background: #d0d0d0;
        }
        .footer {
            margin-top: 1.5rem;
            text-align: center;
            font-size: 0.75rem;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${provider === 'google' ? '🔵' : provider === 'github' ? '🐙' : '🍎'}</div>
            <h1>Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth</h1>
            <span class="dev-badge">Development Mode</span>
        </div>

        <div class="info">
            <p><strong>⚠️ Development Only:</strong> This is a mock OAuth consent page for testing. In production, users will be redirected to the actual ${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth flow.</p>
        </div>

        <div class="profiles">
            <div class="profile-label">Select a test user:</div>
            ${profiles.map((profile, index) => {
              const name = provider === 'apple' 
                ? (typeof profile.name === 'object' && profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : profile.email.split('@')[0])
                : profile.name || (profile as any).login;
              const email = profile.email;
              const id = profile.id;
              
              return `
                <div class="profile-option" data-profile-index="${index}" onclick="selectProfile(${index})">
                    <div class="profile-name">${name}</div>
                    <div class="profile-email">${email}</div>
                    <div class="profile-id">ID: ${id}</div>
                </div>
              `;
            }).join('')}
        </div>

        <div class="actions">
            <button class="btn btn-secondary" onclick="cancelAuth()">Cancel</button>
            <button class="btn btn-primary" id="continueBtn" disabled onclick="continueAuth()">Continue</button>
        </div>

        <div class="footer">
            State: ${state}<br>
            Provider: ${provider}
        </div>
    </div>

    <script>
        let selectedProfileIndex = null;
        const profiles = ${JSON.stringify(profiles)};
        const provider = '${provider}';
        const state = '${state}';
        const redirectUri = '${session.redirectUri}';

        function selectProfile(index) {
            selectedProfileIndex = index;
            
            // Update UI
            document.querySelectorAll('.profile-option').forEach((el, i) => {
                if (i === index) {
                    el.classList.add('selected');
                } else {
                    el.classList.remove('selected');
                }
            });
            
            // Enable continue button
            document.getElementById('continueBtn').disabled = false;
        }

        function cancelAuth() {
            window.location.href = redirectUri + '?error=access_denied&state=' + state;
        }

        async function continueAuth() {
            if (selectedProfileIndex === null) return;
            
            const profile = profiles[selectedProfileIndex];
            
            // Generate mock authorization code
            const code = 'mock_code_' + Math.random().toString(36).substr(2, 9);
            
            // Store profile data for callback (would normally be on OAuth server)
            sessionStorage.setItem('mock_oauth_' + code, JSON.stringify({
                profile,
                provider,
                code
            }));
            
            // Redirect to callback with code
            const callbackUrl = '/api/auth/' + provider + '/callback?code=' + code + '&state=' + state;
            window.location.href = callbackUrl;
        }
    </script>
</body>
</html>
    `;

    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * Step 3: OAuth callback handler
 * GET /api/auth/:provider/callback
 */
router.get('/:provider/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      logger.warn(`OAuth error: ${provider} - ${error}`);
      return res.redirect(`${process.env.CORS_ORIGIN}?error=${error}`);
    }

    if (!code || typeof code !== 'string') {
      throw new HttpError(400, 'Authorization code required');
    }

    if (!state || typeof state !== 'string') {
      throw new HttpError(400, 'State required');
    }

    // Verify state
    const session = oauthSessions.get(state);
    if (!session) {
      throw new HttpError(400, 'Invalid or expired state');
    }

    // Verify provider matches
    if (session.provider !== provider) {
      throw new HttpError(400, 'Provider mismatch');
    }

    // Remove used session
    oauthSessions.delete(state);

    let profileData;

    if (process.env.NODE_ENV === 'development' && code.startsWith('mock_code_')) {
      // Development: Use mock profile data
      // In real app, this would be stored server-side or in encrypted session
      const mockData = (req as any).sessionStorage?.getItem(`mock_oauth_${code}`);
      if (mockData) {
        profileData = JSON.parse(mockData);
      } else {
        // Fallback to first profile if session data not available
        const profiles = MOCK_PROFILES[provider as keyof typeof MOCK_PROFILES];
        profileData = { profile: profiles[0], provider, code };
      }
    } else {
      // Production: Exchange code for access token and fetch user profile
      // This would call the actual OAuth provider APIs
      profileData = await exchangeCodeForProfile(provider, code);
    }

    const { profile } = profileData;

    // Extract user info based on provider
    let email: string;
    let externalId: string;
    let displayName: string;

    switch (provider) {
      case 'google':
        email = profile.email;
        externalId = profile.id;
        displayName = profile.name;
        break;
      case 'github':
        email = profile.email;
        externalId = profile.id.toString();
        displayName = profile.name || profile.login;
        break;
      case 'apple':
        email = profile.email;
        externalId = profile.id;
        displayName = profile.name && typeof profile.name === 'object' ? `${profile.name.firstName} ${profile.name.lastName}` : email.split('@')[0];
        break;
      default:
        throw new HttpError(400, 'Unsupported provider');
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { externalId, authProvider: provider.toUpperCase() as any },
          { email },
        ],
      },
      include: { adminProfile: true },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          externalId,
          displayName,
          authProvider: provider.toUpperCase() as any,
          locale: 'en',
          timezone: 'UTC',
        },
        include: { adminProfile: true },
      });

      logger.info(`New user created via ${provider}: ${email}`);
    } else {
      // Update existing user if needed
      if (user.authProvider !== provider.toUpperCase() || user.externalId !== externalId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: provider.toUpperCase() as any,
            externalId,
          },
          include: { adminProfile: true },
        });
      }

      logger.info(`Existing user logged in via ${provider}: ${email}`);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, !!user.adminProfile);

    // Redirect to frontend with token
    const redirectUrl = new URL(session.redirectUri);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('userId', user.id);
    redirectUrl.searchParams.set('email', user.email);

    res.redirect(redirectUrl.toString());
  } catch (err) {
    next(err);
  }
});

/**
 * Exchange authorization code for user profile (production)
 * This would make actual API calls to OAuth providers
 */
async function exchangeCodeForProfile(provider: string, code: string): Promise<any> {
  // TODO: Implement actual OAuth token exchange
  // This is where you'd call:
  // - Google: POST https://oauth2.googleapis.com/token
  // - GitHub: POST https://github.com/login/oauth/access_token
  // - Apple: POST https://appleid.apple.com/auth/token
  
  throw new Error('Production OAuth not yet implemented. Use development mode for testing.');
}

/**
 * Direct social login endpoint (for mobile apps or testing)
 * POST /api/auth/:provider/token
 */
router.post('/:provider/token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params;
    const { accessToken, idToken } = req.body;

    if (!accessToken && !idToken) {
      throw new HttpError(400, 'Access token or ID token required');
    }

    // In development, accept mock tokens
    let profileData;
    
    if (process.env.NODE_ENV === 'development' && (accessToken?.startsWith('mock_') || idToken?.startsWith('mock_'))) {
      // Use first profile as default for mock tokens
      const profiles = MOCK_PROFILES[provider as keyof typeof MOCK_PROFILES];
      profileData = profiles[0];
    } else {
      // Production: Verify token with provider and fetch profile
      profileData = await verifyTokenAndFetchProfile(provider, accessToken || idToken);
    }

    // Extract user info
    let email: string;
    let externalId: string;
    let displayName: string;

    switch (provider) {
      case 'google':
        email = profileData.email;
        externalId = profileData.id;
        displayName = profileData.name;
        break;
      case 'github':
        email = profileData.email;
        externalId = profileData.id.toString();
        displayName = profileData.name || profileData.login;
        break;
      case 'apple':
        email = profileData.email;
        externalId = profileData.id;
        displayName = profileData.name && typeof profileData.name === 'object' ? `${profileData.name.firstName} ${profileData.name.lastName}` : email.split('@')[0];
        break;
      default:
        throw new HttpError(400, 'Unsupported provider');
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { externalId, authProvider: provider.toUpperCase() as any },
          { email },
        ],
      },
      include: { adminProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          externalId,
          displayName,
          authProvider: provider.toUpperCase() as any,
          locale: 'en',
          timezone: 'UTC',
        },
        include: { adminProfile: true },
      });

      logger.info(`New user created via ${provider} token: ${email}`);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, !!user.adminProfile);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.authProvider,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Simplified social login endpoint for frontend
 * POST /api/auth/user/social-login
 */
router.post('/user/social-login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, accessToken } = req.body;

    if (!provider || !accessToken) {
      throw new HttpError(400, 'Provider and accessToken required');
    }

    // In development, accept mock tokens
    let profileData;
    
    if (process.env.NODE_ENV === 'development' && accessToken.startsWith('fake-')) {
      // Use first profile as default for mock tokens
      const profiles = MOCK_PROFILES[provider as keyof typeof MOCK_PROFILES];
      if (!profiles || profiles.length === 0) {
        throw new HttpError(400, `Unsupported provider: ${provider}`);
      }
      profileData = profiles[0];
    } else {
      // Production: Verify token with provider and fetch profile
      profileData = await verifyTokenAndFetchProfile(provider, accessToken);
    }

    // Extract user info
    let email: string;
    let externalId: string;
    let displayName: string;

    switch (provider) {
      case 'google':
        email = profileData.email;
        externalId = profileData.id;
        displayName = profileData.name;
        break;
      case 'github':
        email = profileData.email;
        externalId = profileData.id.toString();
        displayName = profileData.name || profileData.login;
        break;
      case 'apple':
        email = profileData.email;
        externalId = profileData.id;
        displayName = profileData.name && typeof profileData.name === 'object' ? `${profileData.name.firstName} ${profileData.name.lastName}` : email.split('@')[0];
        break;
      default:
        throw new HttpError(400, 'Unsupported provider');
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { externalId, authProvider: provider.toUpperCase() as any },
          { email },
        ],
      },
      include: { adminProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          externalId,
          displayName,
          authProvider: provider.toUpperCase() as any,
          locale: 'en',
          timezone: 'UTC',
        },
        include: { adminProfile: true },
      });

      logger.info(`New user created via ${provider} (simplified endpoint): ${email}`);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, !!user.adminProfile);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.authProvider,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Verify OAuth token with provider (production)
 */
async function verifyTokenAndFetchProfile(provider: string, token: string): Promise<any> {
  // TODO: Implement actual token verification
  // This would call provider-specific APIs to verify the token
  
  throw new Error('Production OAuth token verification not yet implemented');
}

export const socialAuthRouter = router;
