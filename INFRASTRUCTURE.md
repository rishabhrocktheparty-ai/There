# Infrastructure as Code Setup Guide

This document provides comprehensive instructions for setting up the complete infrastructure for the There application.

## Table of Contents

1. [Containerization](#containerization)
2. [Local Development](#local-development)
3. [Cloud Deployment](#cloud-deployment)
4. [Monitoring & Observability](#monitoring--observability)
5. [Database & Storage](#database--storage)
6. [CI/CD Pipelines](#cicd-pipelines)

## Containerization

### Docker Setup

The application uses multi-stage Docker builds for optimization:

- **Backend**: Node.js 18 Alpine with multi-stage build
- **Frontend**: Node.js 18 Alpine builder + Nginx Alpine runtime

### Building Images

```bash
# Build backend image
docker build -t there-backend:latest .

# Build frontend image
cd frontend && docker build -t there-frontend:latest .
```

### Local Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- PostgreSQL database
- Redis cache
- Backend API
- Frontend application
- Prometheus monitoring
- Grafana dashboard

## Local Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd there
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start database services
   docker-compose up -d postgres redis

   # Run migrations
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # Backend
   npm run dev

   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

## Cloud Deployment

### Kubernetes Deployment

The application is configured for Kubernetes deployment with:

- Horizontal Pod Autoscaling (HPA)
- ConfigMaps and Secrets for configuration
- Ingress for external access
- Persistent Volumes for data storage

### Deployment Steps

1. **Configure Kubernetes cluster**
   ```bash
   # Set kubectl context to your cluster
   kubectl config use-context your-cluster
   ```

2. **Create namespace**
   ```bash
   kubectl apply -f k8s/namespace.yml
   ```

3. **Deploy configurations**
   ```bash
   kubectl apply -f k8s/configmap.yml
   kubectl apply -f k8s/secret.yml
   ```

4. **Deploy database and cache**
   ```bash
   kubectl apply -f k8s/postgres.yml
   kubectl apply -f k8s/redis.yml
   ```

5. **Deploy applications**
   ```bash
   kubectl apply -f k8s/backend.yml
   kubectl apply -f k8s/frontend.yml
   kubectl apply -f k8s/ingress.yml
   kubectl apply -f k8s/hpa.yml
   ```

### Terraform Infrastructure

For AWS infrastructure setup:

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

This sets up:
- S3 bucket for static assets
- CloudFront CDN distribution
- WAF for security
- Lambda@Edge for headers

## Monitoring & Observability

### Prometheus & Grafana

Monitoring stack is included in docker-compose.yml:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboard

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Application Metrics

The backend exposes metrics at `/metrics` endpoint for:
- HTTP request duration
- Database connection count
- Error rates
- Custom business metrics

### Alerting

Configure alerts in Prometheus for:
- High error rates
- Database connection issues
- Memory/CPU usage
- Response time degradation

## Database & Storage

### Database Migrations

```bash
# Run migrations
npm run db:migrate

# Create new migration
npx prisma migrate dev --name your-migration-name

# Reset database
npx prisma migrate reset
```

### Backup & Recovery

Automated backup scripts are provided:

```bash
# Manual backup
./scripts/backup.sh

# Restore from backup
./scripts/backup.sh restore path/to/backup.sql.gz

# Database migration with backup
./scripts/db-migrate.sh
```

### CDN Configuration

Static assets are served through CloudFront:

1. Upload assets to S3 bucket
2. CloudFront distributes globally
3. WAF protects against attacks
4. Custom headers added via Lambda@Edge

## CI/CD Pipelines

### GitHub Actions

Automated pipelines for:
- **Backend**: Testing, building, Docker image push, K8s deployment
- **Frontend**: Testing, building, Docker image push, K8s deployment

### Required Secrets

Set these in GitHub repository secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `KUBE_CONFIG` (base64 encoded)

### Deployment Flow

1. Push to main branch
2. Tests run automatically
3. Docker images built and pushed
4. Kubernetes manifests applied
5. Rolling update performed

## Security Considerations

### Secrets Management

- Use Kubernetes Secrets for sensitive data
- Rotate JWT secrets regularly
- Store API keys securely

### Network Security

- Configure firewall rules
- Use HTTPS everywhere
- Implement rate limiting
- Enable WAF protection

### Monitoring Security

- Secure Prometheus endpoints
- Use authentication for Grafana
- Monitor for security events

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL in environment
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Redis connection issues**
   - Verify REDIS_URL configuration
   - Check Redis service status
   - Confirm authentication settings

3. **Container build failures**
   - Check Docker build logs
   - Verify dependencies are installed
   - Check for syntax errors

4. **Kubernetes deployment issues**
   - Check pod status: `kubectl get pods`
   - View logs: `kubectl logs <pod-name>`
   - Verify ConfigMaps and Secrets

### Logs and Debugging

```bash
# View application logs
kubectl logs -f deployment/there-backend

# Check pod status
kubectl describe pod <pod-name>

# Debug container
kubectl exec -it <pod-name> -- /bin/sh
```

## Performance Optimization

### Caching Strategy

- Redis for session storage
- CDN for static assets
- Database query result caching
- API response caching

### Scaling

- Horizontal Pod Autoscaling based on CPU/memory
- Database read replicas (future)
- CDN edge locations for global distribution

## Backup and Disaster Recovery

### Backup Strategy

- Daily automated backups
- 30-day retention period
- Cloud storage for backups
- Point-in-time recovery capability

### Recovery Procedures

1. Identify failure point
2. Restore from latest backup
3. Verify data integrity
4. Update DNS if needed
5. Monitor system health

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Check monitoring dashboards
4. Create GitHub issue with details