FROM python:3.12-slim

# Instalar dependencias para IA
RUN pip install --no-cache-dir torch transformers

# Copiar modelos o scripts
COPY . /app
WORKDIR /app

CMD ["python", "main.py"]