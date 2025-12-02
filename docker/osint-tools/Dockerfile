FROM python:3.12-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    dnsutils \
    whois \
    nmap \
    golang-go \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Instalar librerías Python
RUN pip install --no-cache-dir \
    requests \
    beautifulsoup4 \
    dnspython \
    shodan \
    theHarvester

# Instalar Subfinder
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
ENV PATH="/root/go/bin:${PATH}"

# Instalar Amass
RUN wget https://github.com/owasp-amass/amass/releases/download/v4.2.0/amass_Linux_amd64.zip && \
    unzip amass_Linux_amd64.zip && \
    mv amass_Linux_amd64/amass /usr/local/bin/ && \
    rm -rf amass_Linux_amd64*

# Copiar scripts y herramientas
COPY . /app
WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
