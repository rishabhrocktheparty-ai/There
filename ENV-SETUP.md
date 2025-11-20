# Environment Variables Setup Guide

## Overview

This project uses environment variables for configuration. This guide will help you set up all required environment variables for both backend and frontend.

## Quick Start

```bash
# Backend - already exists
cp .env.example .env
# Edit .env and fill in your values

# Frontend - already exists
cp frontend/.env.example frontend/.env
# Edit frontend/.env and fill in your values
```

## Backend Environment Variables (.env)

### Required Variables

#### Database Configuration
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/auraai"
```
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Development**: Uses local PostgreSQL container (see DATABASE.md)
- **Production**: Use managed database service (AWS RDS, Google Cloud SQL, etc.)

#### JWT Authentication
```bash
JWT_SECRET="your-secure-random-string-min-32-characters"
JWT_EXPIRES_IN=24h
```
- **Generate secure JWT_SECRET**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Security**: Never commit real JWT_SECRET to git
- **Length**: Minimum 32 characters, recommended 64+ for production
- **Rotation**: Change JWT_SECRET periodically in production

#### CORS Configuration
```bash
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```
- **Development**: Includes frontend dev server (5173) and backend (3000)
- **Production**: Replace with actual frontend domain (https://your-app.com)
- **Multiple Origins**: Comma-separated list

### OAuth Credentials (Social Login)

#### Google OAuth Setup

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials
   - Create or select a project

2. **Create OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: "There - Development" (or your app name)

3. **Configure Authorized Redirect URIs**
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`

4. **Copy Credentials**
   ```bash
   GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
   ```

5. **Add Client ID to Frontend**
   - Edit `frontend/.env`
   - Add: `VITE_GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"`

#### Apple OAuth Setup

1. **Go to Apple Developer Account**
   - URL: https://developer.apple.com/account/resources/identifiers
   - Sign in with Apple Developer account (requires paid membership)

2. **Create Service ID**
   - Register a Services ID
   - Enable "Sign In with Apple"
   - Configure return URLs: `http://localhost:3000/api/auth/apple/callback`

3. **Create Private Key**
   - Keys → Register new Key
   - Enable "Sign In with Apple"
   - Download private key (.p8 file)
   - **Important**: You can only download the key once!

4. **Copy Credentials**
   ```bash
   APPLE_CLIENT_ID="com.your-company.your-app"
   APPLE_TEAM_ID="ABC123XYZ"
   APPLE_KEY_ID="KEY123ABC"
   APPLE_PRIVATE_KEY="/path/to/AuthKey_KEY123ABC.p8"
   ```

5. **Add Client ID to Frontend**
   - Edit `frontend/.env`
   - Add: `VITE_APPLE_CLIENT_ID="com.your-company.your-app"`

#### GitHub OAuth Setup

1. **Go to GitHub Settings**
   - URL: https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Register Application**
   - Application name: "There - Development"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

3. **Generate Client Secret**
   - After creating the app, click "Generate a new client secret"
   - **Important**: Copy the secret immediately, it won't be shown again!

4. **Copy Credentials**
   ```bash
   GITHUB_CLIENT_ID="Iv1.abc123def456"
   GITHUB_CLIENT_SECRET="ghp_abcdefghijklmnopqrstuvwxyz123456789"
   ```

5. **Add Client ID to Frontend**
   - Edit `frontend/.env`
   - Add: `VITE_GITHUB_CLIENT_ID="Iv1.abc123def456"`

### Optional Variables

#### Redis (Caching)
```bash
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # If authentication enabled
```
- **Setup**: See docker-compose.yml for Redis container
- **Optional**: Application works without Redis (uses in-memory cache)

#### AI APIs (Future Enhancement)
```bash
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

#### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Monitoring
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Frontend Environment Variables (frontend/.env)

### Required Variables

All frontend environment variables **must** be prefixed with `VITE_` to be exposed to the client.

```bash
# Environment
VITE_NODE_ENV=development

# Backend API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=/api
VITE_WS_URL=ws://localhost:3000

# OAuth Client IDs (public, safe to expose)
VITE_GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
VITE_APPLE_CLIENT_ID="com.your-company.your-app"
VITE_GITHUB_CLIENT_ID="Iv1.abc123def456"

# Feature Flags
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# App Configuration
VITE_APP_NAME="There"
VITE_APP_VERSION="1.0.0"
```

### Production Configuration

For production, update URLs to use HTTPS:

```bash
VITE_NODE_ENV=production
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
VITE_ENABLE_DEBUG=false
```

### Security Warning ⚠️

**Never put secrets in frontend/.env!** All `VITE_` variables are exposed in the client-side JavaScript bundle. Only put public information like:
- ✅ OAuth Client IDs (public by design)
- ✅ API URLs
- ✅ Feature flags
- ❌ API keys
- ❌ OAuth Client Secrets
- ❌ Database credentials
- ❌ JWT secrets

## Environment-Specific Configuration

### Development (.env)
```bash
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/auraai"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
LOG_LEVEL=debug
```

### Production (.env.production)
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:secure-password@prod-db.region.rds.amazonaws.com:5432/auraai"
CORS_ORIGIN="https://your-app.com"
LOG_LEVEL=info
# Use managed services for Redis, database backups, etc.
```

## Verification

### Test Backend Environment
```bash
# Check if backend can load environment variables
npm run db:test

# Start backend server
npm run dev
```

### Test Frontend Environment
```bash
# Check if frontend can access VITE_ variables
cd frontend
npm run dev
```

### Test OAuth Configuration
```bash
# Test authentication endpoints
curl -X POST http://localhost:3000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@there.ai","password":"User123!"}'

# Test social login (requires OAuth configured)
curl -X POST http://localhost:3000/api/auth/user/social-login \
  -H "Content-Type: application/json" \
  -d '{"provider":"GOOGLE","accessToken":"test-token","email":"test@gmail.com"}'
```

## Security Best Practices

### 1. JWT Secret Generation
```bash
# Generate 64-byte random hex string (128 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Environment File Protection
```bash
# Ensure .env files are in .gitignore
echo ".env" >> .gitignore
echo "frontend/.env" >> .gitignore

# Set proper file permissions (Linux/Mac)
chmod 600 .env
chmod 600 frontend/.env
```

### 3. Production Checklist
- [ ] Strong JWT_SECRET (64+ random characters)
- [ ] Production database with SSL enabled
- [ ] CORS_ORIGIN restricted to actual domain
- [ ] LOG_LEVEL set to `info` or `warn`
- [ ] OAuth redirect URIs use HTTPS
- [ ] Redis password enabled if using Redis
- [ ] Environment variables set in deployment platform (not in git)
- [ ] Regular secret rotation schedule
- [ ] Backup environment variables securely

### 4. Secret Management

For production, use secret management services instead of .env files:
- **AWS**: AWS Secrets Manager
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Kubernetes**: Kubernetes Secrets
- **Docker**: Docker Secrets

## Troubleshooting

### OAuth Errors

**"Invalid client_id"**
- Check that Client ID matches exactly (no spaces)
- Verify Client ID is added to both backend and frontend .env
- Ensure OAuth app is enabled in provider console

**"Redirect URI mismatch"**
- Check authorized redirect URIs in OAuth provider console
- Ensure URL matches exactly (http vs https, trailing slash)
- For development: Use `http://localhost:3000/api/auth/{provider}/callback`

**"Invalid client_secret"**
- Client secret is only for backend, never frontend
- Regenerate secret if lost (can't retrieve original)
- Check for extra spaces or newlines in .env file

### Database Connection Errors

**"Connection refused"**
- Verify PostgreSQL container is running: `docker ps`
- Check DATABASE_URL format and credentials
- Test connection: `npm run db:test`

### Frontend API Errors

**"Network Error" or "CORS Error"**
- Verify CORS_ORIGIN includes frontend URL
- Check VITE_API_URL matches backend URL
- Ensure backend server is running

## Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

For issues or questions:
1. Check this documentation
2. Review DATABASE.md for database issues
3. Review PROXY-CONFIG.md for API connection issues
4. Check logs: Backend console output and browser console
