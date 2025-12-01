FROM python:3.12-slim

# Instalar dependencias mínimas para IA
RUN pip install --no-cache-dir transformers torch --index-url https://download.pytorch.org/whl/cpu

# Copiar scripts
COPY . /app
WORKDIR /app

CMD ["python", "-c", "print('AI Offsec ready')"]