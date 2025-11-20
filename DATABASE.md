# Database Setup & Verification Guide

## 🚀 Quick Start

### 1. Start PostgreSQL Container

```bash
docker run -d \
  --name aura-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=auraai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -v aura-postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15
```

### 2. Run Migrations

```bash
npm run prisma:migrate
```

### 3. Seed Database

```bash
npm run db:seed
```

### 4. Verify Connection

```bash
npm run db:test
```

## 📋 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Migration** | `npm run prisma:migrate` | Run database migrations |
| **Generate Client** | `npm run prisma:generate` | Generate Prisma client |
| **Seed Data** | `npm run db:seed` | Populate database with test data |
| **Test Connection** | `npm run db:test` | Run comprehensive database tests |
| **Quick Verify** | `./scripts/verify-db.sh` | Quick database health check |

## 🔍 Database Connection Tests

The comprehensive test suite (`npm run db:test`) checks:

1. ✅ **Environment Variables** - Verifies `DATABASE_URL` is set correctly
2. ✅ **PostgreSQL Port** - Checks if port 5432 is open
3. ✅ **Prisma Connection** - Tests Prisma client connectivity
4. ✅ **Query Execution** - Runs a test query
5. ✅ **Tables Exist** - Verifies all required tables are present
6. ✅ **Migration Status** - Checks applied migrations
7. ✅ **User Data** - Verifies seed data exists
8. ✅ **Write Operations** - Tests CRUD operations

## 🔑 Test Credentials (After Seeding)

### Admin Users
- **Super Admin**: `admin@there.ai` / `Admin123!`
- **Config Manager**: `config@there.ai` / `Admin123!`
- **Viewer**: `viewer@there.ai` / `Admin123!`

### Regular Users
- **User 1**: `user@there.ai` / `User123!`
- **User 2**: `john@example.com` / `User123!`

### Social Login User
- **Google**: `social@gmail.com` (no password, OAuth only)

## 🗄️ Database Schema

### Core Tables
- `User` - User accounts (both admin and regular)
- `AdminUser` - Admin profile extension
- `EthicalConfig` - AI ethical boundaries configuration
- `RoleTemplate` - Relationship role templates
- `CulturalParameter` - Culture-specific settings
- `Relationship` - User relationships
- `ConversationMessage` - Chat messages
- `VoiceProfile` - Voice synthesis settings
- `AvatarProfile` - Avatar customization

### Supporting Tables
- `Upload` - File uploads
- `UsageEvent` - Usage analytics
- `AuditLog` - Audit trail
- `GrowthMetric` - Relationship growth tracking
- `BackupSnapshot` - Backup records

## 🛠️ Troubleshooting

### Container Not Running
```bash
# Check container status
docker ps -a | grep aura-postgres

# Start existing container
docker start aura-postgres

# View logs
docker logs aura-postgres

# Connect to container
docker exec -it aura-postgres bash
```

### Connection Issues

**Problem**: Can't connect to database
```bash
# Check if port is in use
lsof -i :5432

# Check Docker network
docker network ls
docker network inspect bridge

# Verify DATABASE_URL
echo $DATABASE_URL
cat .env | grep DATABASE_URL
```

**Problem**: Authentication failed
- Verify password in `.env` matches container settings
- Default: `postgresql://postgres:password@localhost:5432/auraai`

### Migration Issues

**Problem**: Migrations out of sync
```bash
# Reset migrations (DANGER: destroys data)
npx prisma migrate reset

# Or manually drop and recreate
docker exec aura-postgres psql -U postgres -c "DROP DATABASE auraai;"
docker exec aura-postgres psql -U postgres -c "CREATE DATABASE auraai;"
npm run prisma:migrate
npm run db:seed
```

**Problem**: Prisma client out of date
```bash
npm run prisma:generate
```

## 🔄 Database Maintenance

### Backup Database
```bash
docker exec aura-postgres pg_dump -U postgres auraai > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker exec -i aura-postgres psql -U postgres auraai < backup_20251120.sql
```

### Reset Database (Clean Slate)
```bash
# Stop application
pkill -f "ts-node-dev"

# Reset and reseed
npx prisma migrate reset --force
npm run db:seed

# Restart application
npm run dev
```

## 📊 Direct Database Access

### Using Prisma Studio
```bash
npx prisma studio
```
Opens GUI at `http://localhost:5555`

### Using psql
```bash
# Via Docker
docker exec -it aura-postgres psql -U postgres -d auraai

# Via local psql (if installed)
psql -h localhost -U postgres -d auraai
```

### Common SQL Queries
```sql
-- Count users by type
SELECT 
  CASE WHEN "adminProfile" IS NOT NULL THEN 'Admin' ELSE 'User' END as type,
  COUNT(*) 
FROM "User" u
LEFT JOIN "AdminUser" a ON u.id = a."userId"
GROUP BY type;

-- List all admins
SELECT u.email, u."displayName", a.role
FROM "User" u
JOIN "AdminUser" a ON u.id = a."userId";

-- Check migration status
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC;
```

## 🎯 Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/auraai"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET="your-super-secret-jwt-key-for-development-only"
JWT_EXPIRES_IN=24h
```

## 🐳 Docker Commands Reference

```bash
# Start container
docker start aura-postgres

# Stop container
docker stop aura-postgres

# Restart container
docker restart aura-postgres

# Remove container (keeps volume)
docker rm -f aura-postgres

# Remove volume (DANGER: destroys data)
docker volume rm aura-postgres-data

# View resource usage
docker stats aura-postgres

# Inspect container
docker inspect aura-postgres
```

## 📈 Monitoring

### Check Database Size
```bash
docker exec aura-postgres psql -U postgres -d auraai -c "
SELECT 
  pg_size_pretty(pg_database_size('auraai')) as db_size,
  (SELECT count(*) FROM \"User\") as users,
  (SELECT count(*) FROM \"ConversationMessage\") as messages;
"
```

### Active Connections
```bash
docker exec aura-postgres psql -U postgres -d auraai -c "
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'auraai';
"
```

## 🔐 Security Notes

- **Development credentials are intentionally simple**
- Change default passwords for production
- Use strong JWT secrets (32+ characters)
- Enable SSL for production databases
- Restrict database access by IP
- Regular backup schedule
- Monitor for unusual activity

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)

---

**Last Updated**: November 20, 2025
