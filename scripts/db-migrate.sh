#!/bin/bash

# Database Migration Script
# This script handles database migrations, backups, and restores

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-there_prod}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Backup directory created: $BACKUP_DIR"
}

# Create database backup
backup_database() {
    local backup_file="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
    log "Creating database backup: $backup_file"

    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --create \
        > "$backup_file"

    log "Database backup completed: $backup_file"
    echo "$backup_file"
}

# Restore database from backup
restore_database() {
    local backup_file=$1

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    log "Restoring database from: $backup_file"

    PGPASSWORD=$DB_PASSWORD psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "DROP DATABASE IF EXISTS $DB_NAME;"

    PGPASSWORD=$DB_PASSWORD psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "CREATE DATABASE $DB_NAME;"

    PGPASSWORD=$DB_PASSWORD psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        < "$backup_file"

    log "Database restore completed"
}

# Run Prisma migrations
run_migrations() {
    log "Running Prisma migrations"

    if [ -f "prisma/schema.prisma" ]; then
        npx prisma migrate deploy
        npx prisma generate
        log "Prisma migrations completed"
    else
        warn "Prisma schema not found, skipping migrations"
    fi
}

# Clean old backups (keep last 10)
clean_old_backups() {
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)

    if [ "$backup_count" -gt 10 ]; then
        log "Cleaning old backups (keeping last 10)"
        ls -1t "$BACKUP_DIR"/*.sql | tail -n +11 | xargs rm -f
        log "Old backups cleaned"
    fi
}

# Main functions
migrate() {
    log "Starting database migration process"

    create_backup_dir

    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_database
    fi

    run_migrations

    if [ "$SKIP_BACKUP_CLEANUP" != "true" ]; then
        clean_old_backups
    fi

    log "Database migration process completed"
}

backup() {
    create_backup_dir
    backup_database
}

restore() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        error "Please provide a backup file path"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi

    restore_database "$backup_file"
}

# Main script
case "${1:-migrate}" in
    migrate)
        migrate
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    *)
        echo "Usage: $0 {migrate|backup|restore <backup_file>}"
        echo ""
        echo "Environment variables:"
        echo "  DB_HOST          Database host (default: localhost)"
        echo "  DB_PORT          Database port (default: 5432)"
        echo "  DB_NAME          Database name (default: there_prod)"
        echo "  DB_USER          Database user (default: postgres)"
        echo "  DB_PASSWORD      Database password (required)"
        echo "  BACKUP_DIR       Backup directory (default: ./backups)"
        echo "  SKIP_BACKUP      Skip backup before migration (default: false)"
        echo "  SKIP_BACKUP_CLEANUP  Skip cleanup of old backups (default: false)"
        exit 1
        ;;
esac