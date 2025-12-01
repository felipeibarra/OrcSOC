FROM python:3.12-slim

# Instalar dependencias básicas
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

# Instalar herramientas OSINT ligeras
RUN pip install --no-cache-dir requests beautifulsoup4

# Copiar scripts
COPY . /app
WORKDIR /app

CMD ["python", "-c", "print('OSINT Tools ready')"]