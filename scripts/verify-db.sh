#!/bin/bash

# Database Verification Script
# Quick check for database health and Docker container status

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Database Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker container is running
echo "📦 Checking Docker Container..."
if docker ps | grep -q aura-postgres; then
    echo "✅ PostgreSQL container 'aura-postgres' is running"
    
    # Get container info
    container_id=$(docker ps | grep aura-postgres | awk '{print $1}')
    uptime=$(docker ps | grep aura-postgres | awk '{print $10, $11}')
    echo "   Container ID: $container_id"
    echo "   Uptime: $uptime"
else
    echo "❌ PostgreSQL container 'aura-postgres' is not running"
    echo "   Start with: docker start aura-postgres"
    echo "   Or create new: docker run -d --name aura-postgres -p 5432:5432 -e POSTGRES_DB=auraai -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -v aura-postgres-data:/var/lib/postgresql/data --restart unless-stopped postgres:15"
    exit 1
fi

echo ""
echo "🔌 Checking Port..."
if lsof -i :5432 > /dev/null 2>&1; then
    echo "✅ Port 5432 is listening"
else
    echo "⚠️  Port 5432 is not listening"
fi

echo ""
echo "📊 Checking Database Connection..."
if npx ts-node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => {console.log('✅ Prisma connection successful'); p.\$disconnect(); process.exit(0);}).catch(e => {console.log('❌ Prisma connection failed:', e.message); process.exit(1);});" 2>/dev/null; then
    :
else
    echo "⚠️  Connection test failed"
fi

echo ""
echo "📈 Quick Stats..."

# Get user count
user_count=$(docker exec $container_id psql -U postgres -d auraai -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tr -d ' ')
if [ ! -z "$user_count" ]; then
    echo "   Users: $user_count"
fi

# Get admin count
admin_count=$(docker exec $container_id psql -U postgres -d auraai -t -c "SELECT COUNT(*) FROM \"AdminUser\";" 2>/dev/null | tr -d ' ')
if [ ! -z "$admin_count" ]; then
    echo "   Admins: $admin_count"
fi

# Get table count
table_count=$(docker exec $container_id psql -U postgres -d auraai -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')
if [ ! -z "$table_count" ]; then
    echo "   Tables: $table_count"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Database verification complete!"
echo ""
echo "💡 Commands:"
echo "   Full test: npm run db:test"
echo "   Seed data: npm run db:seed"
echo "   Migrations: npm run prisma:migrate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
