# Vite Proxy Configuration Guide

## ✅ Configuration Complete

The Vite development server has been configured with a comprehensive proxy setup to forward requests from the frontend (`localhost:5173`) to the backend (`localhost:3000`).

## 🔧 Proxy Routes Configured

### 1. API Routes (`/api/*`)
```typescript
'/api': {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  ws: true, // WebSocket support
}
```
- **Purpose**: Forwards all API requests to backend
- **Example**: `http://localhost:5173/api/health` → `http://localhost:3000/api/health`
- **WebSocket**: Enabled for real-time features

### 2. Upload Routes (`/uploads/*`)
```typescript
'/uploads': {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
}
```
- **Purpose**: Serves uploaded files through backend
- **Example**: `http://localhost:5173/uploads/avatar.jpg` → `http://localhost:3000/uploads/avatar.jpg`

### 3. Socket.IO (`/socket.io/*`)
```typescript
'/socket.io': {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  ws: true,
}
```
- **Purpose**: WebSocket connections for real-time features
- **Example**: Socket.IO client connections will be proxied to backend

## 📊 Additional Configuration

### CORS Handling
```typescript
cors: true
```
- Vite handles CORS for proxied requests
- Backend CORS settings apply to direct backend access

### Network Access
```typescript
host: true
```
- Allows access from network (not just localhost)
- Useful for testing on mobile devices or other machines

### Port Configuration
```typescript
port: 5173,
strictPort: false
```
- Default port is 5173
- Will try next available port if 5173 is busy

### Hot Module Replacement (HMR)
- Configured for optimal development experience
- Shows errors in overlay
- Fast refresh for React components

## 🧪 Testing the Proxy

### Method 1: Browser DevTools
1. Open `http://localhost:5173` in your browser
2. Open DevTools (F12) → Network tab
3. Navigate to a page that makes API calls
4. Check that requests to `/api/*` show status 200 or appropriate responses

### Method 2: Test Pages
We've created test pages to verify proxy functionality:

1. **Proxy Test Page**: `http://localhost:5173/proxy-test.html`
   - Comprehensive proxy testing
   - Tests all routes (/api, /uploads, /socket.io)
   - Performance metrics
   - CORS validation

2. **Auth Test Page**: `http://localhost:5173/auth-test.html`
   - Test authentication endpoints
   - Verify login/register flows
   - Social login testing

3. **Connection Test**: `http://localhost:5173/test-connection.html`
   - Basic connectivity check
   - Backend health status

### Method 3: Console Testing
Open browser console on `http://localhost:5173` and run:

```javascript
// Test health endpoint
fetch('/api/health')
  .then(r => r.json())
  .then(console.log);

// Test login endpoint
fetch('/api/auth/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@there.ai',
    password: 'User123!'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## ⚠️ Important Notes

### Why curl Might Not Work
```bash
# This will timeout (Vite expects browser requests)
curl http://localhost:5173/api/health
```

**Reason**: Vite's dev server is optimized for browser requests with proper headers. Direct curl requests may hang or fail.

**Solution**: Use browser-based testing or test the backend directly:
```bash
# Test backend directly (works perfectly)
curl http://localhost:3000/api/health
```

### Proxy Logs
When proxy is working, you'll see logs in the Vite terminal:
```
[Proxy Request] POST /api/auth/user/login
[Proxy Response] 401 /api/auth/user/login
```

## 🔍 Troubleshooting

### Issue: Proxy Not Working
**Symptoms**: API calls fail with network errors

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check Vite terminal for proxy errors

3. Restart Vite dev server:
   ```bash
   cd frontend && npm run dev
   ```

### Issue: CORS Errors
**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
1. Verify backend CORS configuration in `.env`:
   ```
   CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
   ```

2. Check `src/app.ts` CORS settings:
   ```typescript
   app.use(cors({
     origin: [clientOrigin, 'http://localhost:5173', 'http://localhost:3000'],
     credentials: true,
   }));
   ```

### Issue: WebSocket Connection Fails
**Symptoms**: Socket.IO not connecting

**Solutions**:
1. Verify Socket.IO proxy is configured with `ws: true`
2. Check backend Socket.IO server is running
3. Test WebSocket upgrade in browser DevTools

### Issue: File Uploads Fail
**Symptoms**: Cannot access uploaded files

**Solutions**:
1. Verify `/uploads` directory exists in backend
2. Check file permissions
3. Confirm uploads proxy is configured correctly

## 📁 File Structure

```
frontend/
├── vite.config.ts          # Main Vite configuration
├── proxy-test.html         # Comprehensive proxy tests
├── auth-test.html          # Authentication testing
├── test-connection.html    # Basic connectivity test
└── src/
    └── ...                 # React application
```

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   npm run dev
   ```
   Backend should be running on `http://localhost:3000`

2. **Start Frontend**:
   ```bash
   cd frontend && npm run dev
   ```
   Frontend should be running on `http://localhost:5173`

3. **Verify Proxy**:
   - Open `http://localhost:5173/proxy-test.html`
   - Click "Run All Tests"
   - All tests should pass ✅

## 📈 Performance Optimization

### Build Configuration
```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        mui: ['@mui/material', '@mui/icons-material'],
      },
    },
  },
}
```

- Separate vendor and UI library chunks
- Enables better caching
- Reduces initial bundle size

### Dependency Optimization
```typescript
optimizeDeps: {
  include: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
}
```

- Pre-bundles common dependencies
- Faster cold starts
- Better HMR performance

## 🔐 Security Considerations

1. **Development Only**: This configuration is for development
2. **Production**: Use proper reverse proxy (Nginx/Apache)
3. **HTTPS**: Enable for production environments
4. **API Keys**: Never expose in client-side code
5. **CORS**: Restrict origins in production

## 📚 Additional Resources

- [Vite Proxy Documentation](https://vite.dev/config/server-options.html#server-proxy)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- [Vite Server Options](https://vite.dev/config/server-options)

---

**Status**: ✅ Proxy configuration complete and ready for browser-based testing
**Last Updated**: November 20, 2025
