# OrcSOC - Opciones de Comandos Detalladas
**Fecha:** 2 de Diciembre, 2025

Este documento describe todas las opciones disponibles en cada botón del dashboard, con explicaciones detalladas de cada herramienta.

---

## 🔍 RECON BÁSICO
**Descripción:** Reconocimiento y enumeración de subdominios

### 1. Subfinder Rápido ⭐
- **Servicio:** OSINT Tools
- **Comando:** `python tools/subfinder_wrapper.py --domain {{target}}`
- **Tiempo:** 30-60 segundos
- **Nivel:** Básico
- **Descripción:** Enumeración rápida de subdominios usando múltiples fuentes pasivas (crt.sh, DNSdumpster, VirusTotal, etc.)
- **Casos de uso:** Primera exploración rápida de un dominio
- **Qué hace:** Consulta fuentes públicas para encontrar subdominios sin tocar directamente el objetivo
- **Output esperado:** Lista de subdominios encontrados

### 2. Subfinder Completo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/subfinder_wrapper.py --domain {{target}} --all`
- **Tiempo:** 2-3 minutos
- **Nivel:** Avanzado
- **Descripción:** Enumeración exhaustiva con todas las fuentes disponibles, incluyendo APIs pagas si están configuradas
- **Casos de uso:** Auditorías completas donde se necesita máxima cobertura
- **Qué hace:** Consulta TODAS las fuentes disponibles, incluyendo las más lentas
- **Output esperado:** Lista extensa de subdominios con mayor cobertura

### 3. Amass Pasivo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/amass_wrapper.py --domain {{target}} --passive`
- **Tiempo:** 1-2 minutos
- **Nivel:** Básico
- **Descripción:** Reconocimiento DNS pasivo sin tocar el objetivo, ideal para engagements sigilosos
- **Casos de uso:** Red Team operations donde el sigilo es crítico
- **Qué hace:** Usa inteligencia pasiva (búsquedas DNS reversas, certificados SSL, scrapers web)
- **Output esperado:** Subdominios, IPs asociadas, información de DNS

### 4. Amass Activo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/amass_wrapper.py --domain {{target}} --active`
- **Tiempo:** 5-10 minutos
- **Nivel:** Avanzado
- **Descripción:** Reconocimiento activo con brute force de subdominios y enumeración DNS
- **Casos de uso:** Pentesting autorizado donde se puede generar tráfico
- **Qué hace:** Brute force de subdominios + transferencias de zona + enumeración DNS agresiva
- **Output esperado:** Lista completa con subdominios encontrados activa y pasivamente

---

## 🕵️ OSINT COMPLETO
**Descripción:** Inteligencia de fuentes abiertas (Open Source Intelligence)

### 1. OSINT Básico ⭐
- **Servicio:** OSINT Tools
- **Comando:** `python tools/enrich.py --target {{target}} --type domain --level basic`
- **Tiempo:** 1-2 minutos
- **Nivel:** Básico
- **Descripción:** Análisis OSINT básico que combina: subdominios + WHOIS + DNS
- **Casos de uso:** Reconocimiento inicial para conocer la infraestructura básica
- **Qué hace:** 
  - Busca subdominios con Subfinder
  - Consulta WHOIS para información de registro
  - Obtiene registros DNS (A, MX, NS, TXT)
- **Output esperado:** JSON con subdominios, datos de WHOIS y configuración DNS

### 2. OSINT Completo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/enrich.py --target {{target}} --type domain`
- **Tiempo:** 3-5 minutos
- **Nivel:** Intermedio
- **Descripción:** Análisis completo: subdominios, emails, WHOIS, DNS, IPs, geolocalización
- **Casos de uso:** Auditorías de seguridad completas, investigaciones de empresas
- **Qué hace:**
  - Todo lo del OSINT Básico +
  - Busca emails expuestos con theHarvester
  - Resuelve IPs de subdominios
  - Geolocaliza IPs encontradas
  - Busca información en redes sociales
- **Output esperado:** Informe completo con toda la información recopilada

### 3. WHOIS Lookup
- **Servicio:** OSINT Tools
- **Comando:** `whois {{target}}`
- **Tiempo:** 5-10 segundos
- **Nivel:** Básico
- **Descripción:** Información de registro del dominio (registrador, fechas de creación/expiración, contactos)
- **Casos de uso:** Verificar propiedad del dominio, fechas importantes, datos de contacto
- **Qué hace:** Consulta la base de datos WHOIS del dominio
- **Output esperado:** 
  - Registrador del dominio
  - Fechas de registro, actualización y expiración
  - Servidores de nombres (nameservers)
  - Estado del dominio
  - Contactos técnicos y administrativos (si no están protegidos)

### 4. DNS Lookup
- **Servicio:** OSINT Tools
- **Comando:** `nslookup {{target}}`
- **Tiempo:** 5-10 segundos
- **Nivel:** Básico
- **Descripción:** Resolución DNS básica (registros A, MX, NS)
- **Casos de uso:** Verificar configuración DNS, encontrar servidores de email
- **Qué hace:** Consulta registros DNS del dominio
- **Output esperado:**
  - Registros A (IPv4)
  - Registros AAAA (IPv6)
  - Registros MX (servidores de correo)
  - Registros NS (servidores de nombres)

---

## 🔬 ESCANEO PUERTOS
**Descripción:** Análisis de puertos y servicios con Nmap

### 1. Nmap Rápido (Top 100) ⭐
- **Servicio:** Web Pentest
- **Comando:** `nmap -sV -F {{target}}`
- **Tiempo:** 30-60 segundos
- **Nivel:** Básico
- **Descripción:** Escaneo de los 100 puertos más comunes con detección de versiones
- **Casos de uso:** Reconocimiento inicial rápido para encontrar servicios expuestos
- **Qué hace:** 
  - `-sV`: Detección de versión de servicios
  - `-F`: Fast scan (top 100 puertos)
- **Output esperado:** Lista de puertos abiertos con nombre y versión del servicio

### 2. Nmap Puertos Web
- **Servicio:** Web Pentest
- **Comando:** `nmap -sV -p 80,443,8080,8443 {{target}}`
- **Tiempo:** 15-30 segundos
- **Nivel:** Básico
- **Descripción:** Escaneo enfocado en puertos HTTP/HTTPS comunes
- **Casos de uso:** Auditorías web, análisis de servicios HTTP
- **Qué hace:** Escanea específicamente puertos 80 (HTTP), 443 (HTTPS), 8080 (HTTP-alt), 8443 (HTTPS-alt)
- **Output esperado:** Estado de puertos web y versiones de servidores HTTP

### 3. Nmap Completo
- **Servicio:** Web Pentest
- **Comando:** `nmap -sC -sV -p- {{target}}`
- **Tiempo:** 10-30 minutos
- **Nivel:** Avanzado
- **Descripción:** Escaneo exhaustivo de TODOS los puertos (65535) con scripts NSE
- **Casos de uso:** Pentesting completo, auditorías exhaustivas
- **Qué hace:**
  - `-sC`: Scripts por defecto de NSE
  - `-sV`: Detección de versiones
  - `-p-`: Todos los puertos (1-65535)
- **Output esperado:** Lista completa de puertos abiertos con vulnerabilidades detectadas por scripts

### 4. Nmap UDP
- **Servicio:** Web Pentest
- **Comando:** `nmap -sU -p 53,161,162 {{target}}`
- **Tiempo:** 2-5 minutos
- **Nivel:** Intermedio
- **Descripción:** Escaneo de puertos UDP comunes (DNS, SNMP)
- **Casos de uso:** Auditorías de infraestructura, análisis de servicios de red
- **Qué hace:** Escanea puerto 53 (DNS), 161/162 (SNMP) por UDP
- **Output esperado:** Servicios UDP abiertos y versiones

---

## 🛡️ VULNERABILIDADES
**Descripción:** Detección de vulnerabilidades web y de aplicaciones

### 1. Nikto Básico ⭐
- **Servicio:** Web Pentest
- **Comando:** `nikto -h http://{{target}}`
- **Tiempo:** 2-4 minutos
- **Nivel:** Básico
- **Descripción:** Escaneo básico de vulnerabilidades web (configuración, headers, archivos)
- **Casos de uso:** Auditoría inicial de servidor web
- **Qué hace:**
  - Busca archivos y directorios peligrosos
  - Analiza headers de seguridad
  - Detecta versiones vulnerables
  - Busca configuraciones inseguras
- **Output esperado:** Lista de vulnerabilidades encontradas con severidad

### 2. Nikto Completo
- **Servicio:** Web Pentest
- **Comando:** `nikto -h http://{{target}} -Tuning 9`
- **Tiempo:** 5-10 minutos
- **Nivel:** Avanzado
- **Descripción:** Escaneo exhaustivo con todos los plugins activos
- **Casos de uso:** Auditorías completas de aplicaciones web
- **Qué hace:** Todo lo de Nikto Básico + plugins avanzados para inyecciones, XSS, SQLi
- **Output esperado:** Informe detallado con todas las vulnerabilidades encontradas

### 3. SQLmap Básico
- **Servicio:** Web Pentest
- **Comando:** `sqlmap -u http://{{target}} --batch --level=1`
- **Tiempo:** 1-3 minutos
- **Nivel:** Intermedio
- **Descripción:** Detección básica de SQL injection en URL
- **Casos de uso:** Testing de parámetros GET para SQLi
- **Qué hace:**
  - Prueba inyecciones SQL en parámetros
  - Detección automática de DBMS
  - `--batch`: No interactivo
  - `--level=1`: Tests básicos
- **Output esperado:** Vulnerabilidades SQLi encontradas con tipo y DBMS detectado

### 4. WPScan
- **Servicio:** Web Pentest
- **Comando:** `wpscan --url http://{{target}}`
- **Tiempo:** 2-5 minutos
- **Nivel:** Intermedio
- **Descripción:** Análisis de seguridad específico para WordPress
- **Casos de uso:** Auditorías de sitios WordPress
- **Qué hace:**
  - Detecta versión de WordPress
  - Enumera plugins y temas instalados
  - Busca vulnerabilidades conocidas
  - Detecta usuarios
  - Busca archivos sensibles
- **Output esperado:** Versión de WP, plugins vulnerables, usuarios enumerados

---

## 📧 BUSCAR EMAILS
**Descripción:** Recolección de información de contacto pública

### 1. theHarvester (Google) ⭐
- **Servicio:** OSINT Tools
- **Comando:** `python tools/harvester_wrapper.py --domain {{target}} --sources google`
- **Tiempo:** 30-60 segundos
- **Nivel:** Básico
- **Descripción:** Búsqueda de emails solo en Google
- **Casos de uso:** Reconocimiento rápido de contactos de una organización
- **Qué hace:** Scraping de resultados de Google para encontrar emails del dominio
- **Output esperado:** Lista de emails encontrados en resultados de Google

### 2. theHarvester Completo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/harvester_wrapper.py --domain {{target}} --sources google,bing,yahoo`
- **Tiempo:** 2-3 minutos
- **Nivel:** Intermedio
- **Descripción:** Búsqueda exhaustiva en múltiples motores de búsqueda
- **Casos de uso:** Investigaciones OSINT, phishing awareness training
- **Qué hace:** Busca en Google, Bing y Yahoo simultáneamente
- **Output esperado:** Lista agregada de emails, hosts e IPs de todas las fuentes

### 3. theHarvester Profundo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/harvester_wrapper.py --domain {{target}} --sources all`
- **Tiempo:** 5-10 minutos
- **Nivel:** Avanzado
- **Descripción:** Búsqueda en todas las fuentes disponibles (emails, hosts, IPs)
- **Casos de uso:** Investigaciones exhaustivas, footprinting completo
- **Qué hace:** Consulta TODAS las fuentes: Google, Bing, Yahoo, LinkedIn, Twitter, PGP, etc.
- **Output esperado:** 
  - Emails encontrados
  - Hosts y subdominios
  - IPs asociadas
  - Perfiles de redes sociales

### 4. theHarvester Pasivo
- **Servicio:** OSINT Tools
- **Comando:** `python tools/harvester_wrapper.py --domain {{target}} --sources google,bing --limit 100`
- **Tiempo:** 1-2 minutos
- **Nivel:** Básico
- **Descripción:** Recolección pasiva limitada para minimizar huella
- **Casos de uso:** Red Team sigiloso, reconocimiento sin generar alertas
- **Qué hace:** Búsqueda limitada a 100 resultados por fuente para ser menos ruidoso
- **Output esperado:** Lista limitada de emails con mínima exposición

---

## 📊 RESUMEN DE OPCIONES

### Por Nivel de Complejidad

**Nivel Básico (9 opciones):**
- Subfinder Rápido ⭐
- Amass Pasivo
- OSINT Básico ⭐
- WHOIS Lookup
- DNS Lookup
- Nmap Rápido ⭐
- Nmap Puertos Web
- Nikto Básico ⭐
- theHarvester Google ⭐
- theHarvester Pasivo

**Nivel Intermedio (6 opciones):**
- OSINT Completo
- Nmap UDP
- SQLmap Básico
- WPScan
- theHarvester Completo

**Nivel Avanzado (4 opciones):**
- Subfinder Completo
- Amass Activo
- Nmap Completo
- Nikto Completo
- theHarvester Profundo

### Por Tiempo de Ejecución

**Rápido (<1 minuto):**
- WHOIS Lookup (5-10s)
- DNS Lookup (5-10s)
- Nmap Puertos Web (15-30s)
- theHarvester Google (30-60s)
- Subfinder Rápido (30-60s)
- Nmap Rápido (30-60s)

**Medio (1-5 minutos):**
- Amass Pasivo (1-2 min)
- OSINT Básico (1-2 min)
- theHarvester Pasivo (1-2 min)
- SQLmap Básico (1-3 min)
- Subfinder Completo (2-3 min)
- theHarvester Completo (2-3 min)
- Nikto Básico (2-4 min)
- Nmap UDP (2-5 min)
- WPScan (2-5 min)
- OSINT Completo (3-5 min)

**Lento (>5 minutos):**
- Amass Activo (5-10 min)
- theHarvester Profundo (5-10 min)
- Nikto Completo (5-10 min)
- Nmap Completo (10-30 min)

---

## 💡 RECOMENDACIONES DE USO

### Workflow Básico (Reconocimiento Inicial)
1. **DNS Lookup** (10s) - Verificar que el dominio existe
2. **WHOIS Lookup** (10s) - Información del propietario
3. **Subfinder Rápido** (1min) - Encontrar subdominios
4. **Nmap Rápido** (1min) - Detectar servicios principales
5. **Análisis IA** - Interpretar resultados

**Tiempo total:** ~3 minutos

### Workflow Intermedio (Auditoría Web)
1. **OSINT Básico** (2min) - Reconocimiento inicial
2. **Nmap Puertos Web** (30s) - Verificar servicios HTTP
3. **Nikto Básico** (3min) - Buscar vulnerabilidades
4. **theHarvester Google** (1min) - Buscar emails
5. **Análisis IA** - Priorizar hallazgos

**Tiempo total:** ~7 minutos

### Workflow Avanzado (Pentesting Completo)
1. **OSINT Completo** (5min) - Footprinting exhaustivo
2. **Amass Activo** (10min) - Enumeración agresiva
3. **Nmap Completo** (20min) - Escaneo de todos los puertos
4. **Nikto Completo** (10min) - Vulnerabilidades exhaustivas
5. **theHarvester Profundo** (10min) - Recolección completa
6. **Análisis IA** - Generar informe ejecutivo

**Tiempo total:** ~55 minutos

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

### Herramientas Pasivas (Sin Contacto Directo)
- Subfinder Rápido/Completo
- Amass Pasivo
- WHOIS Lookup
- theHarvester (todas las variantes)
- OSINT Básico/Completo (componentes pasivos)

**Ventaja:** No generan logs en el objetivo  
**Ideal para:** Red Team, reconocimiento sigiloso

### Herramientas Activas (Generan Tráfico)
- Amass Activo
- Nmap (todas las variantes)
- Nikto
- SQLmap
- WPScan
- DNS Lookup (genera queries DNS)

**Advertencia:** Generan logs y pueden activar IDS/IPS  
**Requiere:** Autorización explícita del propietario

---

## 📈 NIVELES DE RUIDO

**Bajo Ruido:**
- WHOIS Lookup
- DNS Lookup
- Subfinder
- theHarvester Pasivo

**Ruido Medio:**
- Amass Pasivo
- Nmap Rápido/Web
- Nikto Básico

**Alto Ruido:**
- Amass Activo
- Nmap Completo
- Nikto Completo
- SQLmap

---

## 🎯 CASOS DE USO POR INDUSTRIA

### Auditoría de E-commerce
1. OSINT Básico
2. Nmap Puertos Web
3. Nikto Básico
4. SQLmap Básico

### Auditoría Corporativa
1. OSINT Completo
2. theHarvester Completo
3. Amass Pasivo
4. Nmap Rápido

### Pentesting Bancario
1. OSINT Completo
2. Nmap Completo
3. Nikto Completo
4. Análisis manual exhaustivo

### Red Team Operation
1. theHarvester Pasivo
2. Subfinder Rápido
3. Amass Pasivo
4. OSINT Básico (sin componentes activos)

---

**Todas las herramientas están listas y accesibles desde el dashboard en http://localhost:3000**

© 2025 Felipe Ibarra - OrcSOC Platform
