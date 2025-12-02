# OrcSOC - Endpoints y Credenciales
**Última actualización:** 2 de Diciembre, 2025

---

## 🔐 CREDENCIALES GENERALES

### Dashboard Principal
```
URL: http://localhost:3000
Usuario: admin
Password: password
Autenticación: Básica HTTP (no implementada en frontend actual)
```

---

## 🌐 ENDPOINTS PRINCIPALES

### 1. Dashboard Web
```
URL: http://localhost:3000
Método: GET
Autenticación: No requerida (frontend público)
Descripción: Dashboard moderno con input centralizado
Uso: Acceso principal a la plataforma
```

---

## 📡 API ENDPOINTS - OPS-CENTER (Backend)

Base URL: `http://localhost:3000`

### 1. Obtener Plantillas de Comandos
```
Endpoint: GET /templates
URL Completa: http://localhost:3000/templates
Autenticación: No
Headers: -
Parámetros: -
Respuesta: JSON con 5 plantillas pre-configuradas

Ejemplo de respuesta:
{
  "recon-basico": {
    "name": "Reconocimiento Básico",
    "service": "osint-tools",
    "command": "python tools/subfinder_wrapper.py --domain {{target}}",
    "description": "Enumeración rápida de subdominios"
  },
  ...
}

Uso: Frontend carga plantillas al iniciar
```

### 2. Ejecutar Comando en Servicio
```
Endpoint: POST /exec/:service
URL Completa: http://localhost:3000/exec/osint-tools
Autenticación: No
Headers: Content-Type: application/json
Parámetros URL: :service (osint-tools|web-pentest|wireless-lab|ai-offsec)

Body (JSON):
{
  "command": "python tools/subfinder_wrapper.py --domain example.com"
}

Respuesta éxito:
{
  "jobId": "12345",
  "message": "Job enqueued",
  "status": "pending"
}

Respuesta error:
{
  "error": "Comando contiene caracteres peligrosos"
}

Uso: Ejecutar comandos en microservicios
Validación: Whitelist + caracteres peligrosos
Notificación: WebSocket (job:start, job:complete, job:error)
```

### 3. Análisis IA de Resultados
```
Endpoint: POST /analyze
URL Completa: http://localhost:3000/analyze
Autenticación: No
Headers: Content-Type: application/json

Body (JSON):
{
  "output": "resultado del comando a analizar",
  "tool": "nmap|subfinder|harvester|sqlmap|general"
}

Respuesta éxito:
{
  "analysis": "Análisis IA contextual del resultado..."
}

Respuesta error:
{
  "error": "Error al analizar con IA"
}

Uso: Analizar resultados con IA después de ejecución
Timeout: 90 segundos
Reintentos: 3 intentos con delay de 2s
Límite: 5000 caracteres de input
```

### 4. Estado de Microservicios
```
Endpoint: GET /services/status
URL Completa: http://localhost:3000/services/status
Autenticación: No
Headers: -
Parámetros: -

Respuesta:
{
  "osint-tools": true,
  "web-pentest": true,
  "wireless-lab": false,
  "ai-offsec": true,
  "ollama": true
}

Uso: Monitoreo de servicios en tiempo real
Actualización: Frontend consulta cada 30s
```

### 5. Chat IA General
```
Endpoint: POST /chat
URL Completa: http://localhost:3000/chat
Autenticación: No
Headers: Content-Type: application/json

Body (JSON):
{
  "message": "pregunta para la IA"
}

Respuesta éxito:
{
  "reply": "respuesta de la IA"
}

Respuesta error:
{
  "error": "Error al obtener respuesta de IA"
}

Uso: Chat general con IA
Timeout: 60 segundos
Reintentos: 3 intentos
```

### 6. Obtener Playbooks
```
Endpoint: GET /playbooks
URL Completa: http://localhost:3000/playbooks
Autenticación: No
Headers: -
Parámetros: -

Respuesta: JSON con playbooks disponibles
[
  {
    "id": "recon-completo",
    "name": "Reconocimiento Completo",
    "description": "OSINT + escaneo + análisis",
    "steps": [...]
  },
  ...
]

Uso: Listar workflows automatizados
```

### 7. Ejecutar Playbook
```
Endpoint: POST /playbook/run
URL Completa: http://localhost:3000/playbook/run
Autenticación: No
Headers: Content-Type: application/json

Body (JSON):
{
  "playbookId": "recon-completo",
  "target": "example.com"
}

Respuesta:
{
  "jobId": "pb-12345",
  "message": "Playbook started"
}

Uso: Ejecutar workflow automatizado
Notificación: WebSocket con progreso paso a paso
```

---

## 🔌 WEBSOCKET ENDPOINTS

### 1. Conexión WebSocket
```
URL: ws://localhost:3000
Librería: Socket.IO
Autenticación: No

Eventos Cliente → Servidor: (ninguno actualmente)

Eventos Servidor → Cliente:
- job:start { jobId, service, command }
- job:complete { jobId, output, duration }
- job:error { jobId, error }

Ejemplo uso JavaScript:
const socket = io('http://localhost:3000');
socket.on('job:complete', (data) => {
  console.log('Job completado:', data);
});

Uso: Notificaciones en tiempo real de jobs
Reconexión: Automática
```

---

## 🐳 ENDPOINTS INTERNOS (Docker)

### 1. OSINT Tools Service
```
URL Interna: http://osint-tools:5000
Acceso: Solo red Docker (socnet)
Autenticación: No
Comandos disponibles:
- python tools/subfinder_wrapper.py --domain [domain]
- python tools/harvester_wrapper.py --domain [domain]
- python tools/amass_wrapper.py --domain [domain]
- python tools/enrich.py --target [target] --type domain
- whois [domain]
- nslookup [domain]

Uso: Ejecutado vía ops-center endpoint /exec/osint-tools
```

### 2. Web Pentest Service
```
URL Interna: http://web-pentest:5001
Acceso: Solo red Docker (socnet)
Autenticación: No
Comandos disponibles:
- nmap -sV -p [ports] [target]
- nikto -h http://[target]
- sqlmap -u [url] --batch
- wpscan --url [url]
- gobuster dir -u [url] -w [wordlist]

Uso: Ejecutado vía ops-center endpoint /exec/web-pentest
```

### 3. Wireless Lab Service
```
URL Interna: http://wireless-lab:5002
Acceso: Solo red Docker (host network mode)
Autenticación: No
Capabilities: NET_ADMIN, NET_RAW
Comandos: Herramientas wireless (kismet, aircrack-ng, etc.)

Uso: Ejecutado vía ops-center endpoint /exec/wireless-lab
```

### 4. AI Offsec Service
```
URL Interna: http://ai-offsec:5003
Acceso: Solo red Docker (socnet)
Autenticación: No
Comandos: IA ofensiva, generación de payloads

Uso: Ejecutado vía ops-center endpoint /exec/ai-offsec
```

### 5. Ollama API
```
URL Externa: http://localhost:11435
URL Interna: http://ollama:11434
Autenticación: No
Modelo: llama3.2:latest (2GB)

Endpoints Ollama:
POST /api/generate
{
  "model": "llama3.2",
  "prompt": "texto",
  "stream": false
}

POST /api/chat
{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "mensaje"}],
  "stream": false
}

GET /api/tags
Lista modelos instalados

Uso: Ops-center se conecta vía http://ollama:11434
```

### 6. Redis Queue
```
URL: localhost:6379
Acceso Interno: redis://orcsoc-redis:6379
Autenticación: No (por defecto)
Base de datos: 0
Persistencia: appendonly.aof + dump.rdb

Comandos útiles:
redis-cli PING
redis-cli INFO
redis-cli KEYS bull:*
redis-cli BGSAVE

Uso: Job Queue con Bull
```

### 7. Nginx Proxy
```
URL Externa: http://localhost:8081
Configuración: /etc/nginx/nginx.conf
Autenticación: No
Uso: Reverse proxy (actualmente no utilizado activamente)
```

---

## 📋 COMANDOS VALIDADOS POR SERVICIO

### OSINT Tools - Whitelist
```
✅ python tools/subfinder_wrapper.py --domain [domain]
✅ python tools/harvester_wrapper.py --domain [domain]
✅ python tools/amass_wrapper.py --domain [domain]
✅ python tools/enrich.py --target [target] --type domain
✅ whois [domain]
✅ nslookup [domain]
✅ dig [domain]
```

### Web Pentest - Whitelist
```
✅ nmap -sV -p [ports] [target]
✅ nmap -sC -sV [target]
✅ nikto -h http://[target]
✅ nikto -h https://[target]
✅ sqlmap -u [url] --batch
✅ wpscan --url [url]
✅ gobuster dir -u [url] -w [wordlist]
```

### Caracteres Bloqueados (Todos los servicios)
```
❌ ; (punto y coma)
❌ | (pipe)
❌ & (ampersand)
❌ && (doble ampersand)
❌ || (doble pipe)
❌ $() (command substitution)
❌ ` (backtick)
❌ $(
❌ ${
❌ <>
❌ {}
❌ []
❌ \ (backslash)
```

---

## 🔑 CREDENCIALES POR SERVICIO

### Dashboard Web (Frontend)
```
URL: http://localhost:3000
Usuario: No requerido (público)
Password: No requerido
Notas: Sin autenticación implementada en frontend actual
```

### Ops-Center API (Backend)
```
URL: http://localhost:3000
Usuario: No requerido
Password: No requerido
Notas: Endpoints públicos, validación por whitelist
Recomendación: Implementar autenticación en producción
```

### Ollama
```
URL: http://localhost:11435
API Key: No requerido
Token: No requerido
Notas: Ollama no requiere autenticación por defecto
```

### Redis
```
Host: localhost:6379
Password: No configurado
Database: 0
Notas: Sin password por defecto
Recomendación: Configurar requirepass en producción
```

### Microservicios OSINT/Pentest
```
Acceso: Solo vía ops-center
Autenticación: No (red Docker interna)
Notas: No expuestos públicamente
```

---

## 🧪 EJEMPLOS DE USO

### 1. Ejecutar Recon Básico con cURL
```bash
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -d '{
    "command": "python tools/subfinder_wrapper.py --domain example.com"
  }'

# Respuesta:
# {"jobId":"1","message":"Job enqueued","status":"pending"}
```

### 2. Analizar Resultado con IA
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "output": "subdomain1.example.com\nsubdomain2.example.com",
    "tool": "subfinder"
  }'

# Respuesta:
# {"analysis":"Análisis de subdominios encontrados..."}
```

### 3. Verificar Estado de Servicios
```bash
curl http://localhost:3000/services/status

# Respuesta:
# {
#   "osint-tools": true,
#   "web-pentest": true,
#   "wireless-lab": false,
#   "ai-offsec": true,
#   "ollama": true
# }
```

### 4. Obtener Plantillas
```bash
curl http://localhost:3000/templates

# Respuesta: JSON con 5 plantillas
```

### 5. Chat con IA
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Qué es un escaneo de puertos?"
  }'

# Respuesta:
# {"reply":"Un escaneo de puertos es..."}
```

### 6. Ejecutar Playbook
```bash
curl -X POST http://localhost:3000/playbook/run \
  -H "Content-Type: application/json" \
  -d '{
    "playbookId": "recon-completo",
    "target": "example.com"
  }'

# Respuesta:
# {"jobId":"pb-1","message":"Playbook started"}
```

### 7. Consultar Redis Queue
```bash
docker exec orcsoc-redis redis-cli KEYS 'bull:*'
docker exec orcsoc-redis redis-cli LLEN bull:commandQueue:waiting
```

### 8. Verificar Ollama
```bash
curl http://localhost:11435/api/tags

# Respuesta:
# {"models":[{"name":"llama3.2:latest","size":2031923200,...}]}
```

---

## 🔒 SEGURIDAD

### Recomendaciones para Producción

1. **Implementar Autenticación**
```javascript
// Agregar JWT o session-based auth
app.use('/exec', requireAuth);
app.use('/analyze', requireAuth);
```

2. **HTTPS**
```bash
# Configurar certificados SSL
# Usar nginx como reverse proxy con SSL
```

3. **Rate Limiting**
```javascript
// Limitar requests por IP
const rateLimit = require('express-rate-limit');
app.use(rateLimit({windowMs: 15*60*1000, max: 100}));
```

4. **Redis Password**
```yaml
# docker-compose.yml
redis:
  command: redis-server --requirepass your_password
```

5. **CORS**
```javascript
// Configurar CORS apropiadamente
app.use(cors({origin: 'https://tu-dominio.com'}));
```

6. **Input Validation**
```
✅ Ya implementado: Whitelist + caracteres peligrosos
✅ Validación de longitud
✅ Sanitización de inputs
```

---

## 📊 MONITOREO

### Health Checks
```bash
# Dashboard
curl -I http://localhost:3000
# Debe retornar: 200 OK

# Ollama
curl http://localhost:11435/api/tags
# Debe retornar: JSON con modelos

# Redis
docker exec orcsoc-redis redis-cli ping
# Debe retornar: PONG

# Servicios
curl http://localhost:3000/services/status
# Debe retornar: JSON con estados
```

### Logs
```bash
# Backend
docker logs -f ops-center

# Ollama
docker logs -f ollama

# Redis
docker logs -f orcsoc-redis

# Todos
docker-compose logs -f
```

---

## 📞 RESUMEN RÁPIDO

| Servicio | URL | Puerto | Auth | Uso |
|----------|-----|--------|------|-----|
| Dashboard | http://localhost:3000 | 3000 | No | Frontend web |
| API Backend | http://localhost:3000 | 3000 | No | REST API |
| WebSocket | ws://localhost:3000 | 3000 | No | Notificaciones real-time |
| Ollama | http://localhost:11435 | 11435 | No | Motor IA |
| Redis | localhost:6379 | 6379 | No | Job Queue |
| Nginx | http://localhost:8081 | 8081 | No | Reverse proxy |
| OSINT Tools | (interno) | 5000 | No | Herramientas OSINT |
| Web Pentest | (interno) | 5001 | No | Herramientas pentest |
| Wireless Lab | (interno) | 5002 | No | Herramientas wireless |
| AI Offsec | (interno) | 5003 | No | IA ofensiva |

**Credenciales predeterminadas:**
- Usuario: `admin`
- Password: `password`

**⚠️ IMPORTANTE:** Cambiar credenciales antes de usar en producción.

---

© 2025 Felipe Ibarra - OrcSOC Platform
