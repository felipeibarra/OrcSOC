#!/bin/bash

# OrcSOC Enterprise - Complete Installation Script
# This script sets up the entire OrcSOC platform with all dependencies

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_system() {
    log_info "Checking system requirements..."

    # Check OS
    if [[ "$OSTYPE" != "linux-gnu"* && "$OSTYPE" != "darwin"* ]]; then
        log_error "Unsupported OS: $OSTYPE"
        exit 1
    fi

    # Check available memory
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        MEM_GB=$(free -g | awk 'NR==2{printf "%.0f", $2}')
    else
        MEM_GB=$(echo "$(sysctl -n hw.memsize) / 1024 / 1024 / 1024" | bc)
    fi

    if [ "$MEM_GB" -lt 8 ]; then
        log_warning "System has ${MEM_GB}GB RAM. Recommended: 8GB+ for optimal performance"
    else
        log_success "System memory: ${MEM_GB}GB"
    fi

    # Check available disk space
    DISK_GB=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$DISK_GB" -lt 20 ]; then
        log_error "Insufficient disk space: ${DISK_GB}GB available. Need at least 20GB"
        exit 1
    fi
    log_success "Disk space: ${DISK_GB}GB available"
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y curl wget git docker.io docker-compose jq build-essential python3 python3-pip
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum update -y
            sudo yum install -y curl wget git docker docker-compose jq gcc python3 python3-pip
        else
            log_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            log_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install docker docker-compose jq python3 git
    fi

    log_success "System dependencies installed"
}

# Setup Docker
setup_docker() {
    log_info "Setting up Docker..."

    # Start Docker service
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER
    fi

    # Test Docker
    if ! docker run hello-world &> /dev/null; then
        log_error "Docker is not working properly"
        exit 1
    fi

    log_success "Docker setup complete"
}

# Create environment configuration
create_env_config() {
    log_info "Creating environment configuration..."

    cat > .env << EOF
# OrcSOC Enterprise Configuration

# External API Keys (Optional - configure for enhanced functionality)
SHODAN_API_KEY=${SHODAN_API_KEY:-}
CENSYS_API_ID=${CENSYS_API_ID:-}
CENSYS_API_SECRET=${CENSYS_API_SECRET:-}
HIBP_API_KEY=${HIBP_API_KEY:-}
VIRUSTOTAL_API_KEY=${VIRUSTOTAL_API_KEY:-}

# AI Configuration
OLLAMA_MODEL=llama3.2

# Redis Configuration
REDIS_URL=redis://orcsoc-redis:6379

# Security Configuration
STEALTH_MODE=true
STEALTH_DELAY=5000

# Application Configuration
NODE_ENV=production
PORT=3000

# Logging
LOG_LEVEL=info
EOF

    log_success "Environment configuration created (.env)"
}

# Build and start services
build_and_start() {
    log_info "Building and starting OrcSOC services..."

    # Pull required images
    docker-compose pull

    # Build custom images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to start..."
    sleep 30

    # Check service health
    if docker-compose ps | grep -q "Up"; then
        log_success "OrcSOC services started successfully"
    else
        log_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Setup development environment
setup_dev_env() {
    log_info "Setting up development environment..."

    # Install Node.js dependencies for development
    if [ -d "docker/ops-center" ]; then
        cd docker/ops-center
        npm install
        cd ../..
    fi

    log_success "Development environment ready"
}

# Create helper scripts
create_helper_scripts() {
    log_info "Creating helper scripts..."

    # Start script
    cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting OrcSOC..."
docker-compose up -d
echo "OrcSOC started. Access at http://localhost:3000"
echo "Username: admin"
echo "Password: password"
EOF

    # Stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "Stopping OrcSOC..."
docker-compose down
echo "OrcSOC stopped"
EOF

    # Restart script
    cat > restart.sh << 'EOF'
#!/bin/bash
echo "Restarting OrcSOC..."
docker-compose restart
echo "OrcSOC restarted"
EOF

    # Logs script
    cat > logs.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: $0 <service-name>"
    echo "Available services: ops-center, osint-tools, web-pentest, wireless-lab, ai-offsec, redis"
    exit 1
fi
docker-compose logs -f $1
EOF

    # Update script
    cat > update.sh << 'EOF'
#!/bin/bash
echo "Updating OrcSOC..."
git pull origin main
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
echo "OrcSOC updated successfully"
EOF

    chmod +x *.sh
    log_success "Helper scripts created"
}

# Display completion message
show_completion() {
    echo
    log_success "🎉 OrcSOC Enterprise installation completed!"
    echo
    echo "📋 Next steps:"
    echo "1. Access the dashboard: http://localhost:3000"
    echo "   Username: admin"
    echo "   Password: password"
    echo
    echo "2. Configure API keys in .env file for enhanced functionality:"
    echo "   - SHODAN_API_KEY"
    echo "   - VIRUSTOTAL_API_KEY"
    echo "   - CENSYS_API_ID & CENSYS_API_SECRET"
    echo
    echo "3. Useful commands:"
    echo "   ./start.sh    - Start OrcSOC"
    echo "   ./stop.sh     - Stop OrcSOC"
    echo "   ./restart.sh  - Restart OrcSOC"
    echo "   ./logs.sh <service> - View service logs"
    echo "   ./update.sh   - Update OrcSOC"
    echo
    echo "📚 Documentation: ./docs/"
    echo "🧹 Cleanup: ./cleanup.sh"
    echo
    echo "Happy hacking! 🔒"
}

# Main installation flow
main() {
    echo "🐳 OrcSOC Enterprise - Complete Installation"
    echo "=========================================="
    echo

    check_root
    check_system
    install_system_deps
    setup_docker
    create_env_config
    build_and_start
    setup_dev_env
    create_helper_scripts
    show_completion
}

# Run main function
main "$@"
