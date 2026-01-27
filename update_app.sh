#!/bin/bash

# Configuration
LOG_FILE="update_log.txt"
CONTAINER_NAME="pdf2estimate-container"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging Function
log() {
    echo -e "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

info() {
    log "${BLUE}[INFO]${NC} $1"
}

success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    log "${RED}[ERROR]${NC} $1"
}

warn() {
    log "${YELLOW}[WARNING]${NC} $1"
}

# Header
clear
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}     Pdf2Estimate Pro - Smart Update      ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo "Log file: $LOG_FILE"
echo ""

# 1. Pre-flight Checks
info "Starting pre-flight checks..."

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed or not in PATH."
    exit 1
fi

# Check Docker Service
if ! docker info &> /dev/null; then
    error "Docker daemon is not running. Please start Docker."
    exit 1
fi

# Check Permissions
if [ ! -w . ]; then
    warn "Current directory is not writable. Logging might fail."
fi

# Check docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml not found in $(pwd)"
    exit 1
fi

success "System checks passed."
echo ""

# 2. Backup / Diagnostics Pre-Update
info "Capturing state before update..."
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    docker logs --tail 20 $CONTAINER_NAME > "pre_update_logs.txt" 2>&1
    success "Saved pre-update logs to 'pre_update_logs.txt'."
else
    warn "Container '$CONTAINER_NAME' is not currently running (skipping log backup)."
fi
echo ""

# 3. Pull Updates
info "Pulling latest images from GHCR..."
if docker compose pull; then
    success "Images downloaded successfully."
else
    error "Failed to pull images."
    echo "Diagnostic Checklist:"
    echo " - Check internet connection"
    echo " - Verify image name in docker-compose.yml"
    exit 1
fi
echo ""

# 4. Restart Application
info "Applying updates (Restarting container)..."
if docker compose up -d --remove-orphans; then
    success "Container restart command sent."
else
    error "Failed to restart container."
    exit 1
fi

# 5. Health Check
echo -e "${YELLOW}Waiting 10 seconds for container initialization...${NC}"
sleep 10

info "Running health check..."
# Check if container is running
if docker ps -f name=$CONTAINER_NAME -f status=running | grep -q $CONTAINER_NAME; then
    success "Container '$CONTAINER_NAME' is UP and RUNNING."
    
    # Optional: Check logs for errors
    if docker logs --tail 10 $CONTAINER_NAME 2>&1 | grep -iE "error|exception|fail"; then
        warn "Potential issues detected in recent logs:"
        docker logs --tail 10 $CONTAINER_NAME
        echo ""
        echo "Review full logs with: docker logs $CONTAINER_NAME"
    else
        success "No immediate errors found in logs."
    fi
else
    error "Container '$CONTAINER_NAME' failed to start or exited unexpectedly."
    echo "---------------- DEBUG LOGS ----------------"
    docker logs --tail 50 $CONTAINER_NAME
    echo "--------------------------------------------"
    exit 1
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}       UPDATE COMPLETED SUCCESSFULLY      ${NC}"
echo -e "${GREEN}==========================================${NC}"
echo "App URL: http://localhost:6969"
exit 0
