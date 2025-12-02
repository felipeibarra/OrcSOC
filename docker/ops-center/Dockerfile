FROM node:18-alpine

# Instalar dependencias
RUN apk add --no-cache git docker-cli

# Copiar app
COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]