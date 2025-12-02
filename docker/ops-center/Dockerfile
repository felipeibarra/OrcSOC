FROM node:18-alpine

# Instalar dependencias del sistema para Puppeteer
RUN apk add --no-cache \
    git \
    docker-cli \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar app
COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]