#!/bin/bash

# Automated Backup Script
# This script creates regular database backups and uploads to cloud storage

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-there_prod}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${RETENTION_DAYS:-30}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Cloud storage configuration (example for AWS S3)
S3_BUCKET=${S3_BUCKET:-your-backup-bucket}
AWS_REGION=${AWS_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Create backup
create_backup() {
    local backup_file="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
    local temp_file="$BACKUP_DIR/temp_${DB_NAME}_${TIMESTAMP}.sql"

    log "Creating compressed database backup: $backup_file"

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Create uncompressed backup first
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
        > "$temp_file"

    # Compress the backup
    gzip "$temp_file"
    mv "${temp_file}.gz" "$backup_file"

    log "Database backup completed: $backup_file"
    echo "$backup_file"
}

# Upload to cloud storage
upload_to_cloud() {
    local backup_file=$1

    if [ -z "$S3_BUCKET" ] || [ "$S3_BUCKET" = "your-backup-bucket" ]; then
        warn "S3_BUCKET not configured, skipping cloud upload"
        return 0
    fi

    log "Uploading backup to S3: s3://$S3_BUCKET/"

    if command -v aws &> /dev/null; then
        aws s3 cp "$backup_file" "s3://$S3_BUCKET/" --region "$AWS_REGION"
        log "Backup uploaded to S3 successfully"
    else
        warn "AWS CLI not found, skipping cloud upload"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning backups older than $RETENTION_DAYS days"

    # Clean local backups
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

    # Clean cloud backups (if AWS CLI is available)
    if command -v aws &> /dev/null && [ "$S3_BUCKET" != "your-backup-bucket" ]; then
        aws s3 ls "s3://$S3_BUCKET/" --region "$AWS_REGION" | while read -r line; do
            file_date=$(echo "$line" | awk '{print $1}')
            file_name=$(echo "$line" | awk '{print $4}')

            # Convert date to seconds since epoch
            file_epoch=$(date -d "$file_date" +%s)
            cutoff_epoch=$(date -d "$RETENTION_DAYS days ago" +%s)

            if [ "$file_epoch" -lt "$cutoff_epoch" ]; then
                aws s3 rm "s3://$S3_BUCKET/$file_name" --region "$AWS_REGION"
                log "Deleted old cloud backup: $file_name"
            fi
        done
    fi

    log "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1

    log "Verifying backup integrity: $backup_file"

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    # Check if file is valid gzip
    if ! gzip -t "$backup_file"; then
        error "Backup file is corrupted (invalid gzip)"
        return 1
    fi

    # Check if SQL content is valid (basic check)
    if ! gzip -dc "$backup_file" | head -n 10 | grep -q "PostgreSQL database dump"; then
        error "Backup file does not contain valid PostgreSQL dump"
        return 1
    fi

    log "Backup integrity verified successfully"
    return 0
}

# Send notification (placeholder for monitoring integration)
send_notification() {
    local message=$1
    local status=${2:-info}

    # This could integrate with Slack, email, or monitoring systems
    log "Notification: $message"

    # Example: Send to Slack webhook
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Database Backup [$status]: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Main backup function
perform_backup() {
    log "Starting automated database backup"

    local backup_file
    backup_file=$(create_backup)

    if verify_backup "$backup_file"; then
        upload_to_cloud "$backup_file"
        cleanup_old_backups
        send_notification "Backup completed successfully: $(basename "$backup_file")" "success"
        log "Automated backup completed successfully"
    else
        send_notification "Backup verification failed: $(basename "$backup_file")" "error"
        error "Backup verification failed"
        exit 1
    fi
}

# Main script
case "${1:-backup}" in
    backup)
        perform_backup
        ;;
    verify)
        verify_backup "$2"
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|verify <file>|cleanup}"
        echo ""
        echo "Environment variables:"
        echo "  DB_HOST          Database host (default: localhost)"
        echo "  DB_PORT          Database port (default: 5432)"
        echo "  DB_NAME          Database name (default: there_prod)"
        echo "  DB_USER          Database user (default: postgres)"
        echo "  DB_PASSWORD      Database password (required)"
        echo "  BACKUP_DIR       Backup directory (default: ./backups)"
        echo "  RETENTION_DAYS   Days to keep backups (default: 30)"
        echo "  S3_BUCKET        S3 bucket for cloud storage"
        echo "  AWS_REGION       AWS region (default: us-east-1)"
        echo "  SLACK_WEBHOOK_URL Slack webhook for notifications"
        exit 1
        ;;
esac