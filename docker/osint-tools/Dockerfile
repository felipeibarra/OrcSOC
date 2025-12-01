FROM python:3.12-slim

# Instalar dependencias básicas
RUN apt-get update && apt-get install -y git curl wget && rm -rf /var/lib/apt/lists/*

# Instalar herramientas OSINT (ejemplos)
RUN pip install --no-cache-dir requests beautifulsoup4

# Copiar scripts o herramientas
COPY . /app
WORKDIR /app

# Comando por defecto
CMD ["bash"]