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

# Configurar DNS local
echo "Configurando DNS local para www.local-orcsoc.cl..."
if ! grep -q "www.local-orcsoc.cl" /etc/hosts; then
    echo "127.0.0.1 www.local-orcsoc.cl" | sudo tee -a /etc/hosts > /dev/null
    echo "DNS local configurado."
else
    echo "DNS local ya configurado."
fi

echo "OrcSOC instalado. Accede a http://www.local-orcsoc.cl o http://localhost:3000"
echo "Usuario: admin, Password: password"