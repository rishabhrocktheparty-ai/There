# Health Check System Documentation

## Overview

Comprehensive health monitoring system with detailed service status information and frontend visualization.

## Backend Endpoints

### 1. Overall System Health
**Endpoint**: `/api/health`  
**Method**: GET  
**Description**: Complete system health status with all services

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "uptime": 486,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "details": {
        "userCount": 9,
        "provider": "postgresql",
        "connectionTime": "3ms"
      },
      "responseTime": 3
    },
    "authentication": {
      "status": "healthy",
      "message": "Authentication service operational",
      "details": {
        "userCount": 9,
        "adminCount": 3,
        "jwtConfigured": true,
        "queryTime": "2ms"
      },
      "responseTime": 2
    },
    "api": {
      "status": "healthy",
      "message": "API routes registered",
      "details": {
        "criticalRoutes": [...],
        "totalRoutes": 4,
        "cors": true,
        "rateLimit": true
      },
      "responseTime": 0
    },
    "cache": {
      "status": "healthy",
      "message": "Cache connection successful",
      "details": {
        "connected": true,
        "dbSize": 0,
        "responseTime": "5ms"
      },
      "responseTime": 5
    }
  },
  "system": {
    "memory": {
      "total": 50331648,
      "used": 45298284,
      "free": 5033364,
      "percentage": 90
    },
    "cpu": {
      "usage": 1.234
    }
  }
}
```

**Status Codes**:
- `200`: System healthy or degraded
- `503`: System unhealthy

---

### 2. Database Health
**Endpoint**: `/api/health/db`  
**Method**: GET  
**Description**: Database-specific health check

**Response**:
```json
{
  "service": "database",
  "status": "healthy",
  "message": "Database connection successful",
  "details": {
    "userCount": 9,
    "provider": "postgresql",
    "connectionTime": "3ms"
  },
  "responseTime": 3,
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

**Checks**:
- Database connectivity (`SELECT 1`)
- Table access (user count)
- Connection response time

---

### 3. Authentication Service Health
**Endpoint**: `/api/health/auth`  
**Method**: GET  
**Description**: Authentication service health check

**Response**:
```json
{
  "service": "authentication",
  "status": "healthy",
  "message": "Authentication service operational",
  "details": {
    "userCount": 9,
    "adminCount": 3,
    "jwtConfigured": true,
    "queryTime": "2ms"
  },
  "responseTime": 2,
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

**Checks**:
- User table access
- Admin user table access
- JWT secret configuration
- Query response time

---

### 4. Liveness Probe (Kubernetes)
**Endpoint**: `/healthz`  
**Method**: GET  
**Description**: Simple liveness check for container orchestration

**Response**:
```json
{
  "status": "alive",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

---

### 5. Readiness Probe (Kubernetes)
**Endpoint**: `/readyz`  
**Method**: GET  
**Description**: Readiness check to verify app can serve traffic

**Response**:
```json
{
  "status": "ready",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

**Status Codes**:
- `200`: Ready to serve traffic
- `503`: Not ready

---

## Status Values

### Service Status
- **healthy**: Service is fully operational
- **degraded**: Service is operational but with issues (e.g., JWT not configured)
- **unhealthy**: Service is down or not responding

### Overall Status Logic
- If any service is `unhealthy` → Overall: `unhealthy`
- If any service is `degraded` → Overall: `degraded`
- All services `healthy` → Overall: `healthy`

---

## Frontend Components

### 1. HealthStatus Component
**Location**: `/frontend/src/components/HealthStatus.tsx`  
**Usage**: Embedded status widget

```tsx
import { HealthStatus } from './components/HealthStatus';

<HealthStatus />
```

**Features**:
- Compact status overview
- Auto-refresh every 30 seconds
- Expandable detailed view
- Manual refresh button
- Color-coded status indicators

---

### 2. HealthCheckPage
**Location**: `/frontend/src/pages/HealthCheckPage.tsx`  
**Route**: `/health`  
**URL**: http://localhost:8080/health

**Features**:
- Full-page health monitoring dashboard
- Overall system status card
- Individual service cards with detailed information
- System resource metrics
- Auto-refresh functionality
- Color-coded visual feedback

---

## Usage Examples

### Backend Testing

```bash
# Overall health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/db

# Auth service health
curl http://localhost:3000/api/health/auth

# Liveness probe
curl http://localhost:3000/healthz

# Readiness probe
curl http://localhost:3000/readyz
```

### Frontend Access

```bash
# Through Nginx proxy (production)
curl http://localhost:8080/api/health
curl http://localhost:8080/api/health/db
curl http://localhost:8080/api/health/auth

# Direct page access
open http://localhost:8080/health
```

### React Integration

```tsx
import axios from 'axios';

// Fetch overall health
const health = await axios.get('/api/health');
console.log(health.data.status); // 'healthy'

// Fetch specific service health
const dbHealth = await axios.get('/api/health/db');
console.log(dbHealth.data.status); // 'healthy'
console.log(dbHealth.data.details.userCount); // 9

const authHealth = await axios.get('/api/health/auth');
console.log(authHealth.data.details.adminCount); // 3
```

---

## Monitoring Integration

### Prometheus Metrics
Health endpoints can be scraped by Prometheus:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'app-health'
    metrics_path: '/api/health'
    scrape_interval: 30s
    static_configs:
      - targets: ['backend:3000']
```

### Kubernetes Probes
Configure liveness and readiness probes:

```yaml
# k8s/backend.yml
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Response Time Metrics

All service checks include response time metrics:
- Database queries: Typically 2-5ms
- Authentication checks: Typically 1-3ms
- API checks: Typically <1ms
- Cache checks: Typically 3-8ms

---

## Error Handling

### Backend Error Response
```json
{
  "service": "database",
  "status": "unhealthy",
  "message": "Database connection failed",
  "error": "Connection timeout",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

### Frontend Error Handling
The frontend components handle errors gracefully:
- Display error alerts
- Show last known good status
- Retry mechanisms
- Manual refresh option

---

## Auto-Refresh Configuration

### Frontend Components
- Default interval: 30 seconds
- Can be disabled/enabled
- Configurable per component

### Monitoring Tools
- Prometheus: 30s scrape interval
- Grafana: 1m refresh rate
- Kubernetes: 10s probe interval

---

## Performance Considerations

1. **Parallel Checks**: All service checks run in parallel
2. **Connection Pooling**: Reuses database connections
3. **Minimal Overhead**: Each check is optimized (2-5ms avg)
4. **Caching**: System metrics cached briefly
5. **Optional Services**: Cache failures don't affect overall status

---

## Security

- No authentication required for health checks
- No sensitive data exposed in responses
- Rate limiting applied to all endpoints
- CORS configured for frontend access

---

## Best Practices

1. **Use `/healthz` for liveness**: Simple, fast check
2. **Use `/readyz` for readiness**: Verifies database connectivity
3. **Monitor `/api/health` regularly**: Complete system overview
4. **Check specific endpoints**: When debugging individual services
5. **Set up alerts**: On status changes from healthy to degraded/unhealthy

---

## Testing Checklist

- [ ] All endpoints return 200 OK when healthy
- [ ] Database health check reports user count
- [ ] Auth health check reports admin count
- [ ] Overall health aggregates all services correctly
- [ ] Frontend can access health endpoints through proxy
- [ ] Health page renders correctly at /health
- [ ] Auto-refresh works in frontend components
- [ ] Error states display properly
- [ ] Response times are reasonable (<10ms)
- [ ] Status transitions work (healthy → degraded → unhealthy)

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL environment variable
- Verify PostgreSQL is running
- Test direct connection: `psql $DATABASE_URL`

### "JWT_SECRET not configured"
- Set JWT_SECRET in .env file
- Restart backend service
- Check degraded status should become healthy

### "Cache connection failed"
- Verify Redis is running
- Check REDIS_URL or REDIS_HOST configuration
- Cache is optional - won't fail overall health

### Frontend shows "Failed to fetch"
- Check backend is running: `docker-compose ps`
- Verify Nginx proxy configuration
- Check CORS settings in backend

---

## Future Enhancements

- [ ] Add WebSocket connection health check
- [ ] Include external API dependency checks
- [ ] Add historical health data storage
- [ ] Implement alert notifications
- [ ] Add performance degradation detection
- [ ] Include more detailed system metrics
- [ ] Add health check dashboard export
- [ ] Implement SLA tracking
