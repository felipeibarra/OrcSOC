FROM python:3.12-slim

# Instalar dependencias mínimas
RUN pip install --no-cache-dir requests

# Copiar scripts
COPY . /app
WORKDIR /app

CMD ["python", "-c", "print('AI Offsec ready - using Ollama')"]