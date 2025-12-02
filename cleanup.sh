#!/bin/bash

# =============================================================================
# OrcSOC Cleanup Script
# Limpieza profunda de contenedores, volúmenes, imágenes y cache de Docker
# =============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
cat << "EOF"
   ___           ____  ____  ______
  / _ \ _____ __/ __/ / __ \/ ___/
 / // // ___// /\  \/ /_/ / /__  
/____//_/   /___//\____/\___/     
                                  
  Cleanup Script v1.0
EOF
echo -e "${NC}"

# Functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${MAGENTA}ℹ${NC}  $1"
}

confirm() {
    read -p "$(echo -e ${YELLOW}⚠ $1 [y/N]: ${NC})" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Show usage
show_usage() {
    echo -e "${CYAN}Uso:${NC}"
    echo "  ./cleanup.sh [OPCIÓN]"
    echo ""
    echo -e "${CYAN}Opciones:${NC}"
    echo "  --basic      Limpieza básica (detener contenedores OrcSOC)"
    echo "  --full       Limpieza completa (contenedores + volúmenes + imágenes OrcSOC)"
    echo "  --nuclear    Limpieza nuclear (TODO Docker - contenedores, volúmenes, imágenes, cache)"
    echo "  --help       Muestra esta ayuda"
    echo ""
    echo -e "${CYAN}Ejemplos:${NC}"
    echo "  ./cleanup.sh --basic     # Limpieza básica"
    echo "  ./cleanup.sh --full      # Limpieza completa (recomendado)"
    echo "  ./cleanup.sh --nuclear   # Limpieza total de Docker"
    exit 0
}

# Check Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker no está corriendo o no tienes permisos"
        exit 1
    fi
    
    print_success "Docker detectado y funcionando"
}

# Basic cleanup
cleanup_basic() {
    print_header "LIMPIEZA BÁSICA"
    
    print_info "Deteniendo contenedores de OrcSOC..."
    docker-compose down 2>/dev/null || true
    print_success "Contenedores detenidos"
    
    print_info "Espacio liberado: ~0 MB (contenedores solo detenidos)"
}

# Full cleanup
cleanup_full() {
    print_header "LIMPIEZA COMPLETA"
    
    if ! confirm "Esto eliminará TODOS los contenedores, volúmenes e imágenes de OrcSOC. ¿Continuar?"; then
        print_warning "Operación cancelada"
        exit 0
    fi
    
    # Stop and remove containers
    print_info "Deteniendo y eliminando contenedores de OrcSOC..."
    docker-compose down -v 2>/dev/null || true
    
    # Remove specific containers (if orphaned)
    CONTAINERS=(
        "ops-center"
        "osint-tools"
        "web-pentest"
        "wireless-lab"
        "ai-offsec"
        "ollama"
        "orcsoc-redis"
        "nginx-proxy"
    )
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            print_info "Eliminando contenedor: $container"
            docker rm -f "$container" 2>/dev/null || true
            print_success "Eliminado: $container"
        fi
    done
    
    # Remove volumes
    print_info "Eliminando volúmenes de OrcSOC..."
    VOLUMES=(
        "orcsoc_ollama_data"
        "orcsoc_redis_data"
    )
    
    for volume in "${VOLUMES[@]}"; do
        if docker volume ls --format '{{.Name}}' | grep -q "^${volume}$"; then
            print_info "Eliminando volumen: $volume"
            docker volume rm "$volume" 2>/dev/null || true
            print_success "Eliminado: $volume"
        fi
    done
    
    # Remove images
    print_info "Eliminando imágenes de OrcSOC..."
    IMAGES=(
        "orcsoc-ops-center"
        "orcsoc-osint-tools"
        "orcsoc-web-pentest"
        "orcsoc-wireless-lab"
        "orcsoc-ai-offsec"
    )
    
    for image in "${IMAGES[@]}"; do
        if docker images --format '{{.Repository}}' | grep -q "^${image}$"; then
            print_info "Eliminando imagen: $image"
            docker rmi -f "$image" 2>/dev/null || true
            print_success "Eliminada: $image"
        fi
    done
    
    # Calculate space saved
    print_success "Limpieza completa finalizada"
    
    # Show space
    print_info "Espacio liberado estimado: ~5-15 GB"
}

# Nuclear cleanup
cleanup_nuclear() {
    print_header "LIMPIEZA NUCLEAR ☢️"
    
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  ADVERTENCIA: OPERACIÓN DESTRUCTIVA ⚠️            ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║  Esto eliminará:                                      ║${NC}"
    echo -e "${RED}║  • TODOS los contenedores (running y stopped)        ║${NC}"
    echo -e "${RED}║  • TODOS los volúmenes                                ║${NC}"
    echo -e "${RED}║  • TODAS las imágenes                                 ║${NC}"
    echo -e "${RED}║  • TODA la cache de Docker                            ║${NC}"
    echo -e "${RED}║  • TODAS las redes personalizadas                     ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║  ⚠️  ESTO AFECTARÁ TODOS TUS PROYECTOS DOCKER ⚠️      ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! confirm "¿Estás ABSOLUTAMENTE SEGURO de que quieres continuar?"; then
        print_warning "Operación cancelada (decisión sabia 😌)"
        exit 0
    fi
    
    echo ""
    if ! confirm "Segunda confirmación: ¿Realmente quieres BORRAR TODO?"; then
        print_warning "Operación cancelada"
        exit 0
    fi
    
    print_info "Iniciando limpieza nuclear en 3 segundos... (Ctrl+C para cancelar)"
    sleep 1 && echo -e "${YELLOW}3...${NC}"
    sleep 1 && echo -e "${YELLOW}2...${NC}"
    sleep 1 && echo -e "${YELLOW}1...${NC}"
    echo -e "${RED}💣 BOOM!${NC}"
    echo ""
    
    # Stop all containers
    print_info "Deteniendo todos los contenedores..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    print_success "Contenedores detenidos"
    
    # Remove all containers
    print_info "Eliminando todos los contenedores..."
    docker rm -f $(docker ps -aq) 2>/dev/null || true
    print_success "Contenedores eliminados"
    
    # Remove all volumes
    print_info "Eliminando todos los volúmenes..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    print_success "Volúmenes eliminados"
    
    # Remove all images
    print_info "Eliminando todas las imágenes..."
    docker rmi -f $(docker images -aq) 2>/dev/null || true
    print_success "Imágenes eliminadas"
    
    # Remove all networks (except default)
    print_info "Eliminando redes personalizadas..."
    docker network prune -f 2>/dev/null || true
    print_success "Redes eliminadas"
    
    # System prune (remove build cache)
    print_info "Eliminando cache de construcción..."
    docker system prune -a -f --volumes 2>/dev/null || true
    print_success "Cache eliminada"
    
    print_success "Limpieza nuclear completada ☢️"
    
    # Show final space
    print_info "Docker ahora está completamente limpio"
}

# Show Docker disk usage
show_disk_usage() {
    print_header "USO DE DISCO DOCKER"
    docker system df
    echo ""
}

# Main
main() {
    # Check arguments
    if [ $# -eq 0 ]; then
        show_usage
    fi
    
    # Parse arguments
    case "$1" in
        --basic)
            check_docker
            show_disk_usage
            cleanup_basic
            echo ""
            show_disk_usage
            print_success "Limpieza básica completada"
            ;;
        --full)
            check_docker
            show_disk_usage
            cleanup_full
            echo ""
            show_disk_usage
            print_success "Limpieza completa finalizada"
            print_info "Para reinstalar OrcSOC, ejecuta: ./install.sh"
            ;;
        --nuclear)
            check_docker
            show_disk_usage
            cleanup_nuclear
            echo ""
            show_disk_usage
            print_success "Limpieza nuclear finalizada"
            print_info "Docker está completamente limpio. Reinstala lo que necesites."
            ;;
        --help)
            show_usage
            ;;
        *)
            print_error "Opción inválida: $1"
            echo ""
            show_usage
            ;;
    esac
    
    echo ""
    print_header "LIMPIEZA FINALIZADA"
}

# Execute
main "$@"
