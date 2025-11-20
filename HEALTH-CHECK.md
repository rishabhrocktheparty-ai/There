# Health Check System Documentation

Comprehensive health monitoring system for the There backend API.

## Overview

The health check system provides real-time monitoring of all critical backend services including database connectivity, authentication services, API routes, and optional Redis cache. It includes multiple endpoints for different monitoring needs and a visual dashboard for easy status verification.

## Architecture

### Components

1. **Health Controller** (`src/controllers/healthController.ts`)
   - Orchestrates health checks across all services
   - Aggregates system metrics
   - Determines overall system health

2. **Health Endpoints** (Registered in `src/app.ts`)
   - `/api/health` - Comprehensive health check with detailed service status
   - `/health` - Same as above, alternative endpoint
   - `/healthz` - Kubernetes-style liveness probe
   - `/readyz` - Kubernetes-style readiness probe

3. **Frontend Dashboard**
   - **HTML**: `frontend/health-check.html` - Standalone dashboard
   - **React Component**: `frontend/src/components/HealthCheckDashboard.tsx` - Integrated component

4. **Test Script** (`scripts/test-health.sh`)
   - Automated testing of all health endpoints
   - Color-coded output for easy verification

## Endpoints

### 1. Comprehensive Health Check

**Endpoint**: `GET /api/health` or `GET /health`

**Purpose**: Provides detailed status of all services and system metrics

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-20T12:34:56.789Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "details": {
        "userCount": 7,
        "provider": "postgresql",
        "connectionTime": "12ms"
      },
      "responseTime": 12
    },
    "authentication": {
      "status": "healthy",
      "message": "Authentication service operational",
      "details": {
        "userCount": 4,
        "adminCount": 3,
        "jwtConfigured": true,
        "queryTime": "8ms"
      },
      "responseTime": 8
    },
    "api": {
      "status": "healthy",
      "message": "API routes registered",
      "details": {
        "criticalRoutes": ["/api/auth", "/api/admin", "/api/configs", "/api/profiles"],
        "totalRoutes": 4,
        "cors": true,
        "rateLimit": true
      },
      "responseTime": 1
    },
    "cache": {
      "status": "degraded",
      "message": "Cache not available (optional)",
      "responseTime": 5
    }
  },
  "system": {
    "memory": {
      "total": 536870912,
      "used": 123456789,
      "free": 413414123,
      "percentage": 23
    },
    "cpu": {
      "usage": 1.234567
    }
  }
}
```

**Status Codes**:
- `200 OK` - System is healthy or degraded
- `503 Service Unavailable` - System is unhealthy

**Status Levels**:
- `healthy` - All services operational
- `degraded` - Some optional services unavailable (e.g., Redis cache)
- `unhealthy` - Critical services failing (database, authentication)

### 2. Liveness Probe

**Endpoint**: `GET /healthz`

**Purpose**: Kubernetes-style liveness check to verify process is running

**Response**:
```json
{
  "status": "alive",
  "timestamp": "2024-11-20T12:34:56.789Z"
}
```

**Status Code**: Always `200 OK` if process is running

**Use Case**: Container orchestration (Kubernetes, Docker Swarm) to check if process should be restarted

### 3. Readiness Probe

**Endpoint**: `GET /readyz`

**Purpose**: Kubernetes-style readiness check to verify service can handle traffic

**Response (Ready)**:
```json
{
  "status": "ready",
  "timestamp": "2024-11-20T12:34:56.789Z"
}
```

**Response (Not Ready)**:
```json
{
  "status": "not_ready",
  "timestamp": "2024-11-20T12:34:56.789Z",
  "error": "Database connection failed"
}
```

**Status Codes**:
- `200 OK` - Service is ready to accept traffic
- `503 Service Unavailable` - Service not ready (don't route traffic)

**Use Case**: Load balancers and container orchestration to determine if instance should receive traffic

## Service Checks

### Database Health Check

**Checks Performed**:
1. Database connection test (`SELECT 1`)
2. User table access and count
3. Connection response time

**Status Criteria**:
- `healthy` - Connection successful, tables accessible
- `unhealthy` - Connection failed or query error

**Details Returned**:
- User count
- Database provider (PostgreSQL)
- Connection time in milliseconds

### Authentication Service Check

**Checks Performed**:
1. User table query and count
2. Admin table query and count
3. JWT_SECRET environment variable verification

**Status Criteria**:
- `healthy` - All checks pass, JWT configured
- `degraded` - Database accessible but JWT_SECRET not configured
- `unhealthy` - Database queries fail

**Details Returned**:
- User count
- Admin count
- JWT configuration status
- Query response time

### API Routes Check

**Checks Performed**:
1. Critical route registration verification
2. CORS configuration check
3. Rate limiting status

**Status Criteria**:
- `healthy` - Routes registered, security configured
- `unhealthy` - Configuration check fails

**Details Returned**:
- List of critical routes
- Total route count
- CORS enabled status
- Rate limiting enabled status

### Cache Service Check (Optional)

**Checks Performed**:
1. Redis connection availability
2. Redis PING command
3. Cache statistics retrieval

**Status Criteria**:
- `healthy` - Redis connected and responding
- `degraded` - Redis not available (optional service)
- `unhealthy` - Redis configured but failing

**Details Returned**:
- Connection status
- Database size
- Response time

**Note**: Cache check only runs if `REDIS_URL` or `REDIS_HOST` is configured

## System Metrics

### Memory Metrics

Tracks Node.js heap memory usage:

- **Total**: Total heap size allocated
- **Used**: Heap memory currently in use
- **Free**: Available heap memory
- **Percentage**: Used memory as percentage of total

**Format**: Bytes (convert to MB for display)

### CPU Metrics

Tracks CPU time usage:

- **Usage**: User CPU time in seconds

**Note**: This is cumulative CPU time, not instantaneous usage percentage

## Usage

### Testing from Command Line

#### Using curl
```bash
# Comprehensive health check
curl http://localhost:3000/api/health | jq '.'

# Liveness probe
curl http://localhost:3000/healthz

# Readiness probe
curl http://localhost:3000/readyz
```

#### Using the test script
```bash
# Run automated tests
npm run health:check

# Or directly
bash scripts/test-health.sh
```

**Test Script Output**:
- ✅ Backend running check
- ✅ Comprehensive health check with parsed results
- ✅ Service-by-service status
- ✅ System metrics display
- ✅ Liveness probe test
- ✅ Readiness probe test

### Frontend Dashboard (HTML)

**URL**: http://localhost:5173/health-check.html

**Features**:
- Real-time health status display
- Service-by-service breakdown with details
- System metrics visualization
- Auto-refresh toggle (10-second interval)
- Manual refresh button
- Color-coded status indicators
- Response time tracking
- Memory usage progress bars

**Usage**:
1. Start backend: `npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: http://localhost:5173/health-check.html
4. Click "Refresh Status" or enable auto-refresh

### React Component Integration

**Component**: `HealthCheckDashboard`

**Import**:
```typescript
import HealthCheckDashboard from '@/components/HealthCheckDashboard';
```

**Usage**:
```tsx
function App() {
  return (
    <div>
      <HealthCheckDashboard />
    </div>
  );
}
```

**Features**:
- Material-UI design
- Expandable service cards
- System metrics with charts
- Auto-refresh option
- Loading states and error handling
- Responsive layout

## Integration with Monitoring Systems

### Kubernetes Deployment

**Liveness Probe Configuration**:
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe Configuration**:
```yaml
readinessProbe:
  httpGet:
    path: /readyz
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

### Docker Compose Health Check

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Load Balancer Configuration

**HAProxy Example**:
```
backend backend_servers
    option httpchk GET /readyz
    http-check expect status 200
    server backend1 localhost:3000 check inter 5s
```

**Nginx Example**:
```nginx
upstream backend {
    server localhost:3000 max_fails=3 fail_timeout=30s;
    check interval=5000 rise=2 fall=3 timeout=1000 type=http;
    check_http_send "GET /readyz HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx;
}
```

## Monitoring and Alerting

### Prometheus Metrics (Future Enhancement)

Consider exposing metrics in Prometheus format:

```
# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 100
http_request_duration_seconds_bucket{le="0.5"} 200

# HELP database_connection_status Database connection status (1=healthy, 0=unhealthy)
# TYPE database_connection_status gauge
database_connection_status 1
```

### Alert Rules

**Recommended Alerts**:

1. **Service Unhealthy**
   - Condition: `status == "unhealthy"`
   - Severity: Critical
   - Action: Page on-call engineer

2. **Service Degraded**
   - Condition: `status == "degraded"` for > 5 minutes
   - Severity: Warning
   - Action: Create ticket

3. **Database Connection Slow**
   - Condition: `database.responseTime > 1000ms`
   - Severity: Warning
   - Action: Investigate performance

4. **Memory Usage High**
   - Condition: `system.memory.percentage > 85%`
   - Severity: Warning
   - Action: Check for memory leaks

## Troubleshooting

### Common Issues

#### 1. All Services Show "Unhealthy"

**Symptoms**:
- All services report unhealthy status
- Error messages in response

**Possible Causes**:
- Backend server not fully initialized
- Database connection not established
- Environment variables not loaded

**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Verify database connection
npm run db:test

# Check backend logs
npm run dev
```

#### 2. Database Service Unhealthy

**Symptoms**:
- Database service shows unhealthy
- Error: "Connection refused" or "Database connection failed"

**Solution**:
```bash
# Check PostgreSQL container
docker ps | grep postgres

# Test database connection
npm run db:test

# Restart database
docker restart aura-postgres
```

#### 3. Authentication Service Degraded

**Symptoms**:
- Authentication shows degraded status
- Message: "JWT_SECRET not configured"

**Solution**:
```bash
# Check JWT_SECRET in .env
grep JWT_SECRET .env

# Generate new secret if missing
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo 'JWT_SECRET="your-generated-secret"' >> .env

# Restart backend
npm run dev
```

#### 4. Cache Service Failing

**Symptoms**:
- Cache service shows unhealthy or degraded
- Redis connection errors

**Solution**:
```bash
# Check if Redis is required
grep REDIS .env

# Start Redis container if needed
docker run -d -p 6379:6379 redis:alpine

# Or disable Redis checks by removing from .env
sed -i '/REDIS/d' .env
```

#### 5. Frontend Can't Connect

**Symptoms**:
- Dashboard shows connection error
- CORS errors in browser console

**Solution**:
```bash
# Check CORS_ORIGIN in .env
grep CORS_ORIGIN .env

# Should include frontend URL
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

# Restart backend after changing
npm run dev
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level to debug
echo 'LOG_LEVEL=debug' >> .env

# Restart backend
npm run dev

# Check logs for health check details
# Look for: "Health check completed in Xms - Status: healthy"
```

## Performance Considerations

### Response Time Targets

- **Comprehensive Health Check**: < 100ms
- **Liveness Probe**: < 10ms
- **Readiness Probe**: < 50ms

### Optimization Tips

1. **Database Checks**
   - Use lightweight queries (`SELECT 1`)
   - Cache results for 5-10 seconds if high traffic
   - Use read replicas for health checks

2. **Parallel Execution**
   - All service checks run in parallel
   - Total time = slowest check, not sum of all

3. **Rate Limiting**
   - Exclude health endpoints from rate limiting
   - Or use separate, higher limits

4. **Caching**
   ```typescript
   // Example: Cache health check results
   let cachedHealth: HealthCheckResponse | null = null;
   let cacheExpiry = 0;
   
   if (Date.now() < cacheExpiry) {
     return res.json(cachedHealth);
   }
   
   // Run checks...
   cachedHealth = result;
   cacheExpiry = Date.now() + 5000; // 5 seconds
   ```

## Security Considerations

### Information Disclosure

**Risk**: Health checks expose internal system details

**Mitigation**:
1. **Production Mode**: Return less detailed information
2. **Authentication**: Require auth token for detailed status
3. **Rate Limiting**: Prevent information gathering

**Example**:
```typescript
if (process.env.NODE_ENV === 'production') {
  // Simplified response
  return {
    status: overallStatus,
    timestamp: new Date().toISOString()
  };
}
// Full details in development
```

### DDoS Protection

**Risk**: Health checks could be used for DDoS

**Mitigation**:
- Implement aggressive rate limiting on health endpoints
- Use CDN or WAF to filter malicious traffic
- Monitor unusual patterns

## Development Workflow

### Adding New Service Checks

1. Create check function in `healthController.ts`:
```typescript
async function checkNewService(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    // Perform check
    return {
      status: 'healthy',
      message: 'Service operational',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Service check failed',
      responseTime: Date.now() - startTime
    };
  }
}
```

2. Add to services object in `healthCheck()`:
```typescript
const newService = await checkNewService();
services.newService = newService;
```

3. Update TypeScript types:
```typescript
export interface HealthCheckResponse {
  services: {
    // ... existing services
    newService: ServiceStatus;
  };
}
```

### Testing Changes

```bash
# Build and test
npm run build
npm run dev

# Run health check tests
npm run health:check

# Check all endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
```

## API Reference

See the comprehensive endpoint documentation above for:
- Request/response formats
- Status codes
- Error handling
- Example responses

## Resources

- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Health Check Response Format for HTTP APIs](https://tools.ietf.org/html/draft-inadarei-api-health-check-06)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Run test script: `npm run health:check`
4. Check backend logs: `npm run dev`
5. Verify all services: `docker ps`

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Status**: Production Ready
