#!/bin/bash

# Script de Instalación Simplificada para OrcSOC

echo "Instalando OrcSOC..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado. Instálalo primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose no está instalado. Instálalo primero."
    exit 1
fi

# Actualizar repositorio si ya estamos dentro
if [ -d ".git" ]; then
    echo "Actualizando repositorio..."
    git pull
else
    echo "Error: No se encuentra el repositorio. Ejecuta este script desde el directorio OrcSOC."
    exit 1
fi

# Limpiar contenedores y liberar puertos
echo "Limpiando contenedores existentes y liberando puertos..."
docker-compose down 2>/dev/null || true

# Construir y lanzar
echo "Construyendo y lanzando servicios..."
docker-compose up --build -d

# Configurar DNS local (opcional - requiere permisos)
if grep -q "www.local-orcsoc.cl" /etc/hosts 2>/dev/null; then
    echo "DNS local ya configurado."
else
    echo "Nota: Para usar www.local-orcsoc.cl, agrega manualmente a /etc/hosts:"
    echo "127.0.0.1 www.local-orcsoc.cl"
fi

echo "OrcSOC instalado. Accede a:"
echo "  - http://localhost:3000 (ops-center directo)"
echo "  - http://localhost:8081 (nginx proxy)"
echo "  - Ollama API: http://localhost:11435"
echo "Usuario: admin, Password: password"
