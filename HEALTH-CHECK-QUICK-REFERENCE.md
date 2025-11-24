# Health Check System - Quick Reference

## Quick Test
```bash
# Run automated test suite
./scripts/test-health.sh

# Quick manual test
curl http://localhost:3000/api/health | jq .status
```

## Endpoints

| Endpoint | Purpose | Status Codes |
|----------|---------|--------------|
| `/api/health` | Overall system health | 200, 503 |
| `/api/health/db` | Database connectivity | 200, 503 |
| `/api/health/auth` | Auth service status | 200, 503 |
| `/healthz` | Liveness probe | 200 |
| `/readyz` | Readiness probe | 200, 503 |

## Status Values

- **healthy** ✅ - Service fully operational
- **degraded** ⚠️ - Service working with issues
- **unhealthy** ❌ - Service down/failing

## Frontend Access

- **Dashboard**: http://localhost:8080/health
- **Component**: `import { HealthStatus } from './components/HealthStatus'`

## Common Commands

```bash
# Test all endpoints
./scripts/test-health.sh

# Check overall health
curl http://localhost:3000/api/health

# Check database only
curl http://localhost:3000/api/health/db

# Check auth service only
curl http://localhost:3000/api/health/auth

# Through frontend proxy
curl http://localhost:8080/api/health
```

## React Usage

```tsx
import axios from 'axios';

// Fetch health status
const { data } = await axios.get('/api/health');
console.log(data.status); // 'healthy'
console.log(data.services.database.status);
```

## Docker Health Checks

Add to docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 3000
  periodSeconds: 5
```

## Monitoring with Prometheus

```yaml
scrape_configs:
  - job_name: 'health'
    metrics_path: '/api/health'
    scrape_interval: 30s
    static_configs:
      - targets: ['backend:3000']
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 503 response | Check Docker containers: `docker-compose ps` |
| Database unhealthy | Verify PostgreSQL: `docker logs there-postgres` |
| Auth degraded | Check JWT_SECRET in .env |
| Frontend can't reach | Verify Nginx proxy config |

## Response Time Benchmarks

- Database: < 5ms
- Authentication: < 3ms  
- API: < 1ms
- Overall: < 10ms

## Documentation

- Full API docs: `HEALTH-ENDPOINTS.md`
- Implementation details: See source code comments

---
*Auto-refresh: Frontend components refresh every 30 seconds*
