#!/bin/bash

# OrcSOC Enterprise - Complete Cleanup Script
# This script completely removes OrcSOC and all associated data

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirmation prompt
confirm_cleanup() {
    echo
    log_warning "⚠️  WARNING: This will completely remove OrcSOC and all data!"
    echo
    echo "This action will:"
    echo "  - Stop and remove all Docker containers"
    echo "  - Remove all Docker images and volumes"
    echo "  - Delete all persistent data (Redis, logs, etc.)"
    echo "  - Remove generated configuration files"
    echo "  - Clean up Docker networks"
    echo
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
        log_info "Cleanup cancelled"
        exit 0
    fi
}

# Stop all services
stop_services() {
    log_info "Stopping OrcSOC services..."

    if [ -f "docker-compose.yml" ]; then
        docker-compose down --remove-orphans 2>/dev/null || true
    fi

    log_success "Services stopped"
}

# Remove containers
remove_containers() {
    log_info "Removing Docker containers..."

    # Remove OrcSOC containers
    docker rm -f $(docker ps -aq --filter "name=orcsoc") 2>/dev/null || true

    log_success "Containers removed"
}

# Remove images
remove_images() {
    log_info "Removing Docker images..."

    # Remove OrcSOC images
    docker rmi -f $(docker images "orcsoc*" -q) 2>/dev/null || true
    docker rmi -f orcsoc/ops-center orcsoc/osint-tools orcsoc/web-pentest orcsoc/wireless-lab orcsoc/ai-offsec 2>/dev/null || true

    # Remove other related images
    docker rmi -f ollama/ollama redis:alpine nginx:alpine 2>/dev/null || true

    log_success "Images removed"
}

# Remove volumes
remove_volumes() {
    log_info "Removing Docker volumes..."

    # Remove OrcSOC volumes
    docker volume rm $(docker volume ls -q --filter "name=orcsoc") 2>/dev/null || true

    # Remove named volumes
    docker volume rm orcsoc_redis_data orcsoc_ollama_data 2>/dev/null || true

    log_success "Volumes removed"
}

# Remove networks
remove_networks() {
    log_info "Removing Docker networks..."

    # Remove OrcSOC networks
    docker network rm $(docker network ls -q --filter "name=orcsoc") 2>/dev/null || true

    log_success "Networks removed"
}

# Clean up system
system_cleanup() {
    log_info "Performing system cleanup..."

    # Remove dangling images, containers, and volumes
    docker system prune -f

    # Remove unused images
    docker image prune -f

    # Remove unused volumes
    docker volume prune -f

    # Remove unused networks
    docker network prune -f

    log_success "System cleanup completed"
}

# Remove generated files
remove_generated_files() {
    log_info "Removing generated files..."

    # Remove environment files
    rm -f .env

    # Remove helper scripts (but keep install.sh and cleanup.sh)
    rm -f start.sh stop.sh restart.sh logs.sh update.sh

    # Remove log files
    rm -rf logs/

    # Remove temporary files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -delete 2>/dev/null || true

    log_success "Generated files removed"
}

# Deep cleanup (optional)
deep_cleanup() {
    log_info "Performing deep cleanup..."

    # Remove all Docker data (use with caution!)
    read -p "Remove ALL Docker data? This will affect other projects (y/N): " deep_confirm
    if [[ "$deep_confirm" =~ ^[Yy]$ ]]; then
        docker system prune -a --volumes -f
        log_warning "All Docker data removed"
    fi
}

# Show completion message
show_completion() {
    echo
    log_success "🧹 OrcSOC cleanup completed!"
    echo
    echo "All OrcSOC components have been removed:"
    echo "  ✅ Services stopped"
    echo "  ✅ Containers removed"
    echo "  ✅ Images removed"
    echo "  ✅ Volumes removed"
    echo "  ✅ Networks removed"
    echo "  ✅ Generated files removed"
    echo "  ✅ System cleaned up"
    echo
    echo "To reinstall OrcSOC, run: ./install.sh"
    echo
    echo "Note: This action cannot be undone. Make sure to backup any important data before cleanup."
}

# Main cleanup flow
main() {
    echo "🧹 OrcSOC Enterprise - Complete Cleanup"
    echo "======================================"
    echo

    confirm_cleanup
    stop_services
    remove_containers
    remove_images
    remove_volumes
    remove_networks
    system_cleanup
    remove_generated_files
    deep_cleanup
    show_completion
}

# Run main function
main "$@"