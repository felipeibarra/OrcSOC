FROM kalilinux/kali-rolling

# Instalar herramientas wireless
RUN apt-get update && apt-get install -y kismet aircrack-ng && rm -rf /var/lib/apt/lists/*

# Copiar scripts
COPY . /app
WORKDIR /app

CMD ["bash"]