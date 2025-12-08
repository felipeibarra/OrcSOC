#!/bin/bash

# =============================================================================
# 🛡️ OrcSOC - Instalador Automático
# Plataforma de Orquestación de Ciberseguridad con IA Integrada
# =============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    🛡️  OrcSOC Installer                     ║"
echo "║              Orchestrated Security Operations Center         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Docker
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo primero desde https://docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instálalo primero."
    exit 1
fi
echo "✅ Docker y Docker Compose encontrados"

# Verificar RAM
echo "🔍 Verificando recursos del sistema..."
TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_RAM" -lt 8000 ]; then
    echo "⚠️  ADVERTENCIA: Tienes ${TOTAL_RAM}MB RAM. Se recomiendan al menos 8GB para OrcSOC"
    echo "   La IA podría no funcionar correctamente."
else
    echo "✅ RAM suficiente (${TOTAL_RAM}MB)"
fi

# Actualizar repositorio si ya estamos dentro
if [ -d ".git" ]; then
    echo "🔄 Actualizando repositorio OrcSOC..."
    git pull
else
    echo "❌ Error: No se encuentra el repositorio. Ejecuta este script desde el directorio OrcSOC."
    exit 1
fi

# Limpiar contenedores y liberar puertos
echo "🧹 Limpiando contenedores existentes..."
docker-compose down 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Construir y lanzar
echo "🏗️  Construyendo y lanzando servicios OrcSOC..."
echo "   Esto puede tomar varios minutos en la primera ejecución..."
docker-compose up --build -d

# Verificar que los servicios estén corriendo
echo "🔍 Verificando servicios..."
sleep 10

SERVICES_OK=true
if ! docker ps | grep -q "orcsoc-ops-center"; then
    echo "❌ Error: ops-center no está ejecutándose"
    SERVICES_OK=false
fi

if ! docker ps | grep -q "ollama"; then
    echo "⚠️  Advertencia: Ollama no está ejecutándose (requerido para IA)"
fi

if [ "$SERVICES_OK" = true ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║                    🎉 OrcSOC INSTALADO EXITOSAMENTE!            ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 URLs de Acceso:"
    echo "   📊 Dashboard Principal: http://localhost:3000"
    echo "   🔗 Nginx Proxy:         http://localhost:8081"
    echo "   🤖 Ollama API:          http://localhost:11435"
    echo ""
    echo "👤 Credenciales por defecto:"
    echo "   Usuario: admin"
    echo "   Password: password"
    echo ""
    echo "📚 Próximos pasos:"
    echo "   1. Abre http://localhost:3000 en tu navegador"
    echo "   2. Descarga el modelo IA: docker exec ollama ollama pull llama3.2"
    echo "   3. ¡Comienza a explorar las herramientas!"
    echo ""
    echo "📖 Documentación: https://github.com/felipeibarra-m2/OrcSOC"
    echo "🐛 Issues/Soporte: https://github.com/felipeibarra-m2/OrcSOC/issues"
    echo ""
    echo "⭐ Si OrcSOC te ayuda, dale una estrella en GitHub!"
else
    echo ""
    echo "❌ Algunos servicios no pudieron iniciarse correctamente."
    echo "   Revisa los logs con: docker-compose logs"
    echo "   O intenta reinstalar con: ./cleanup.sh --full && ./install.sh"
fi
