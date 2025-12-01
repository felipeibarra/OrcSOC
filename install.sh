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

# Clonar si no existe
if [ ! -d "OrcSOC" ]; then
    git clone https://github.com/felipeibarra/OrcSOC.git
    cd OrcSOC
else
    cd OrcSOC
    git pull
fi

# Construir y lanzar
echo "Construyendo y lanzando servicios..."
docker-compose up --build -d

echo "OrcSOC instalado. Accede a http://localhost:3000"
echo "Usuario: admin, Password: password"