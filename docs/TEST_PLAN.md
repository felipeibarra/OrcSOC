# Plan de Pruebas Completo - OrcSOC
## Versión: Fase 1 MVP + Mejoras Críticas

**Fecha:** 2 de Diciembre, 2025  
**Responsable:** QA Team / Felipe Ibarra  
**Objetivo:** Validar todas las funcionalidades implementadas en OrcSOC

---

## 1. PRUEBAS DE INFRAESTRUCTURA

### 1.1 Contenedores Docker
**Objetivo:** Verificar que todos los contenedores arrancan correctamente

| ID | Prueba | Comando | Resultado Esperado | Prioridad |
|----|--------|---------|-------------------|-----------|
| INF-001 | Listar contenedores | `docker-compose ps` | 8 contenedores UP | CRÍTICA |
| INF-002 | Verificar red | `docker network inspect orcsoc_socnet` | Red activa, 8 contenedores | ALTA |
| INF-003 | Verificar volúmenes | `docker volume ls \| grep orcsoc` | ollama_data, redis_data | MEDIA |
| INF-004 | Socket Docker montado | `docker exec ops-center ls -la /var/run/docker.sock` | Archivo existe | CRÍTICA |
| INF-005 | Redis funcionando | `docker exec orcsoc-redis redis-cli ping` | Responde "PONG" | CRÍTICA |

**Procedimiento de Prueba:**
```bash
# 1. Levantar stack completo
docker-compose up -d

# 2. Verificar todos los contenedores
docker-compose ps

# 3. Verificar logs sin errores
docker-compose logs ops-center --tail 20
docker-compose logs ollama --tail 20
docker-compose logs orcsoc-redis --tail 10
```

**Criterios de Aceptación:**
- ✅ Todos los contenedores en estado "Up"
- ✅ No hay errores críticos en logs
- ✅ Redis responde a ping
- ✅ Ollama tiene modelo llama3.2 cargado

---

## 2. PRUEBAS DE HERRAMIENTAS OSINT

### 2.1 Wrappers Python
**Objetivo:** Validar que los scripts wrapper funcionan correctamente

| ID | Herramienta | Comando Test | Resultado Esperado | Prioridad |
|----|-------------|--------------|-------------------|-----------|
| OSINT-001 | Subfinder | `docker exec osint-tools python tools/subfinder_wrapper.py --domain example.com` | JSON con subdominios | CRÍTICA |
| OSINT-002 | theHarvester | `docker exec osint-tools python tools/harvester_wrapper.py --domain example.com --sources google` | JSON con emails/hosts | ALTA |
| OSINT-003 | Amass | `docker exec osint-tools python tools/amass_wrapper.py --domain example.com` | JSON con subdominios | ALTA |
| OSINT-004 | Whois | `docker exec osint-tools whois example.com` | Info de dominio | MEDIA |
| OSINT-005 | Enriquecimiento | `docker exec osint-tools python tools/enrich.py --target example.com --type domain` | JSON agregado | CRÍTICA |

**Procedimiento de Prueba:**
```bash
# Test Subfinder
docker exec osint-tools python tools/subfinder_wrapper.py --domain google.com

# Verificar estructura JSON
docker exec osint-tools python -c "
import json
result = json.loads(open('/tmp/test.json').read())
assert 'tool' in result
assert 'results' in result
print('✅ Subfinder wrapper OK')
"

# Test Enriquecimiento completo
docker exec osint-tools python tools/enrich.py --target google.com --type domain
```

**Criterios de Aceptación:**
- ✅ Todos los wrappers retornan JSON válido
- ✅ Estructura de JSON incluye: tool, status, results
- ✅ Enriquecimiento ejecuta 4+ herramientas en paralelo
- ✅ No hay errores de timeout (< 5 min)

---

## 3. PRUEBAS DE HERRAMIENTAS PENTEST

### 3.1 Herramientas Web
**Objetivo:** Verificar instalación y funcionalidad de herramientas pentest

| ID | Herramienta | Comando Test | Resultado Esperado | Prioridad |
|----|-------------|--------------|-------------------|-----------|
| PEN-001 | Nmap | `docker exec web-pentest nmap -sV -p 80,443 scanme.nmap.org` | Escaneo exitoso | CRÍTICA |
| PEN-002 | Nikto | `docker exec web-pentest nikto -h http://testphp.vulnweb.com` | Reporte vulnerabilidades | ALTA |
| PEN-003 | WPScan | `docker exec web-pentest wpscan --url https://wordpress.org --enumerate` | Enumeración WP | MEDIA |
| PEN-004 | Gobuster | `docker exec web-pentest gobuster dir -u http://testphp.vulnweb.com -w /usr/share/wordlists/dirb/common.txt` | Directorios encontrados | MEDIA |
| PEN-005 | SQLmap | `docker exec web-pentest sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch --level=1` | Detección SQL | ALTA |

**Criterios de Aceptación:**
- ✅ Todas las herramientas están instaladas
- ✅ Nmap detecta servicios correctamente
- ✅ Nikto genera reporte sin errores
- ✅ SQLmap detecta vulnerabilidades en sitios de prueba

---

## 4. PRUEBAS DE INTEGRACIÓN IA

### 4.1 Ollama + Llama3.2
**Objetivo:** Validar funcionalidad de IA para análisis

| ID | Función | Endpoint/Comando | Resultado Esperado | Prioridad |
|----|---------|------------------|-------------------|-----------|
| IA-001 | Modelo instalado | `docker exec ollama ollama list` | llama3.2:latest presente | CRÍTICA |
| IA-002 | Chat básico | POST /ai-chat con prompt simple | Respuesta coherente | ALTA |
| IA-003 | Análisis Nmap | POST /analyze con output Nmap | Análisis estructurado | CRÍTICA |
| IA-004 | Análisis OSINT | POST /analyze con output Subfinder | Evaluación de subdominios | ALTA |
| IA-005 | Reintentos automáticos | POST /ai-chat con Ollama apagado | 3 intentos, error descriptivo | MEDIA |

**Procedimiento de Prueba:**
```bash
# Test directo con Ollama
docker exec ollama ollama run llama3.2 "Hola, ¿funciona?"

# Test via API
curl -X POST http://localhost:3000/ai-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"prompt":"Analiza esta vulnerabilidad: puerto 22 abierto con SSH"}'

# Test análisis automático
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{
    "tool":"nmap",
    "output":"PORT STATE SERVICE\n22/tcp open ssh\n80/tcp open http",
    "target":"test.com"
  }'
```

**Criterios de Aceptación:**
- ✅ Ollama responde en < 30 segundos
- ✅ Análisis incluye: severidad, recomendaciones, storytelling
- ✅ Reintentos funcionan (max 3 intentos con delay 2s)
- ✅ Validación de input rechaza prompts > 5000 chars

---

## 5. PRUEBAS DE SISTEMA DE COLA (Job Queue)

### 5.1 Redis + Bull
**Objetivo:** Validar ejecución asíncrona con cola

| ID | Función | Prueba | Resultado Esperado | Prioridad |
|----|---------|--------|-------------------|-----------|
| QUEUE-001 | Conexión Redis | Redis ping | PONG | CRÍTICA |
| QUEUE-002 | Crear job | POST /exec/:service | jobId retornado, status="queued" | CRÍTICA |
| QUEUE-003 | Procesar job | Wait + verificar logs | Job ejecutado, resultado guardado | CRÍTICA |
| QUEUE-004 | Jobs concurrentes | 5 POST simultáneos | Todos se ejecutan sin bloqueos | ALTA |
| QUEUE-005 | WebSocket updates | Conectar WS, enviar job | Eventos: job:start, job:complete | ALTA |

**Procedimiento de Prueba:**
```bash
# 1. Verificar Redis
docker exec orcsoc-redis redis-cli ping

# 2. Test job simple
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"command":"whois google.com"}'

# Respuesta esperada:
# {"jobId":"123456","status":"queued","message":"Comando agregado a la cola de ejecución"}

# 3. Verificar ejecución en logs
curl http://localhost:3000/logs \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" | jq '.[-1]'

# 4. Test WebSocket (Node.js script)
node <<EOF
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ WebSocket conectado');
  socket.emit('subscribe:jobs');
});

socket.on('job:start', (data) => {
  console.log('🟡 Job iniciado:', data.jobId);
});

socket.on('job:complete', (data) => {
  console.log('✅ Job completado:', data.jobId, 'en', data.duration, 'ms');
  process.exit(0);
});

socket.on('job:error', (data) => {
  console.log('❌ Job error:', data.jobId);
  process.exit(1);
});
EOF
```

**Criterios de Aceptación:**
- ✅ Redis acepta conexiones desde ops-center
- ✅ Jobs se encolan y procesan correctamente
- ✅ WebSockets emiten eventos en tiempo real
- ✅ 5+ jobs concurrentes sin bloqueos
- ✅ Logs incluyen jobId, duration, timestamp

---

## 6. PRUEBAS DE SEGURIDAD (Validación de Comandos)

### 6.1 Whitelist
**Objetivo:** Verificar que solo comandos seguros se ejecutan

| ID | Tipo Prueba | Comando Test | Resultado Esperado | Prioridad |
|----|-------------|--------------|-------------------|-----------|
| SEC-001 | Comando válido | `whois google.com` | Ejecuta correctamente | CRÍTICA |
| SEC-002 | Inyección shell | `whois google.com; rm -rf /` | RECHAZADO: caracteres peligrosos | CRÍTICA |
| SEC-003 | Pipe attack | `whois google.com \| cat /etc/passwd` | RECHAZADO: pipe prohibido | CRÍTICA |
| SEC-004 | Command substitution | `whois $(whoami).com` | RECHAZADO: $() prohibido | CRÍTICA |
| SEC-005 | Comando no permitido | `curl malicious.com` | RECHAZADO: no en whitelist | ALTA |

**Procedimiento de Prueba:**
```bash
# Test 1: Comando válido
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"command":"whois google.com"}'
# Esperado: {"jobId":"...","status":"queued"}

# Test 2: Inyección shell
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"command":"whois google.com; rm -rf /"}'
# Esperado: {"error":"Comando contiene caracteres peligrosos"}

# Test 3: Comando no en whitelist
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{"command":"curl http://evil.com"}'
# Esperado: {"error":"Comando no permitido para este servicio"}
```

**Criterios de Aceptación:**
- ✅ Todos los ataques de inyección son rechazados
- ✅ Caracteres peligrosos: `;`, `|`, `&`, `$()`, `` ` ``, `{}`, `[]`, `<>`, `\\`
- ✅ Solo comandos en whitelist se ejecutan
- ✅ Error messages descriptivos

---

## 7. PRUEBAS DE PLAYBOOKS

### 7.1 Flujos Automatizados
**Objetivo:** Validar ejecución de playbooks completos

| ID | Playbook | Target Test | Resultado Esperado | Prioridad |
|----|----------|-------------|-------------------|-----------|
| PLAY-001 | Domain Recon | example.com | 3 pasos ejecutados, análisis IA | CRÍTICA |
| PLAY-002 | Email Investigation | example.com | 2 pasos ejecutados, emails encontrados | ALTA |
| PLAY-003 | Web Vuln Scan | scanme.nmap.org | 3 pasos ejecutados, vulns detectadas | ALTA |
| PLAY-004 | Full OSINT | example.com | 1 paso (enriquecimiento completo) | CRÍTICA |

**Procedimiento de Prueba:**
```bash
# 1. Listar playbooks disponibles
curl http://localhost:3000/playbooks \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" | jq

# 2. Ejecutar Domain Reconnaissance
curl -X POST http://localhost:3000/playbook/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
  -d '{
    "playbook_id":"domain-recon",
    "target":"example.com"
  }'

# 3. Verificar respuesta incluye:
# - playbook (nombre)
# - target
# - timestamp
# - steps[] (array con resultados de cada paso)
# - ai_analysis (análisis consolidado)
```

**Criterios de Aceptación:**
- ✅ 4 playbooks disponibles
- ✅ Pasos se ejecutan secuencialmente
- ✅ Cada paso incluye: duration_ms, success, output
- ✅ AI analysis se genera al final
- ✅ Resultados se guardan en logs

---

## 8. PRUEBAS DE PLANTILLAS DE COMANDOS

### 8.1 Templates Predefinidos
**Objetivo:** Validar botones de comandos rápidos

| ID | Template | Parámetros | Resultado Esperado | Prioridad |
|----|----------|------------|-------------------|-----------|
| TMPL-001 | Recon Básico | target=google.com | Subfinder ejecutado | ALTA |
| TMPL-002 | OSINT Completo | target=example.com | Enriquecimiento ejecutado | ALTA |
| TMPL-003 | Escaneo Nmap | target=scanme.nmap.org | Nmap -sV ejecutado | MEDIA |
| TMPL-004 | Vuln Web | target=testphp.vulnweb.com | Nikto ejecutado | MEDIA |
| TMPL-005 | Harvester Emails | target=example.com | theHarvester ejecutado | MEDIA |

**Procedimiento de Prueba:**
```bash
# 1. Obtener templates disponibles
curl http://localhost:3000/templates \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" | jq

# 2. Usar template (UI auto-completa comando)
# Desde UI: click en "🔍 Reconocimiento Básico"
# Input target: google.com
# Resultado: comando auto-completado "python tools/subfinder_wrapper.py --domain google.com"

# 3. Ejecutar
# Click "Ejecutar" → job encolado → resultado en tiempo real
```

**Criterios de Aceptación:**
- ✅ 5 templates disponibles
- ✅ Templates incluyen: name, service, command, description, icon
- ✅ Variable {{target}} se reemplaza correctamente
- ✅ Comandos generados pasan validación de whitelist

---

## 9. PRUEBAS DE DASHBOARD INTERACTIVO

### 9.1 UI en Tiempo Real
**Objetivo:** Validar interfaz de usuario moderna

| ID | Componente | Acción | Resultado Esperado | Prioridad |
|----|------------|--------|-------------------|-----------|
| UI-001 | Login | Ingresar admin/password | Acceso al dashboard | CRÍTICA |
| UI-002 | Estado servicios | Ver sección "Services Status" | 5 servicios con estado UP/DOWN | ALTA |
| UI-003 | Templates | Click en template | Comando auto-completado | ALTA |
| UI-004 | Ejecutar comando | Submit formulario | jobId mostrado, loading | CRÍTICA |
| UI-005 | Resultado tiempo real | Esperar job | Output aparece automáticamente | CRÍTICA |
| UI-006 | Botón "Analizar IA" | Click tras resultado | Análisis IA generado | ALTA |
| UI-007 | Playbooks | Seleccionar + target | Playbook ejecutado, pasos visibles | ALTA |
| UI-008 | Logs | Ver sección logs | Historial con filtros | MEDIA |

**Procedimiento de Prueba:**
```
1. Abrir http://localhost:3000
2. Login: admin / password
3. Verificar secciones visibles:
   - Estado de Servicios
   - Templates Rápidos
   - Ejecutar Comando
   - Playbooks Automatizados
   - Logs
4. Test flujo completo:
   - Click "Recon Básico"
   - Ingresar target: google.com
   - Click "Ejecutar"
   - Verificar: jobId aparece
   - Esperar: resultado aparece en <10s
   - Click "Analizar con IA"
   - Verificar: análisis generado en <30s
```

**Criterios de Aceptación:**
- ✅ Login funcional con autenticación básica
- ✅ Dashboard responsive (desktop + tablet)
- ✅ WebSocket actualiza resultados en tiempo real
- ✅ Notificaciones de éxito/error visibles
- ✅ Estado de servicios se actualiza cada 10s
- ✅ Playbooks muestran progreso paso a paso

---

## 10. PRUEBAS DE INTEGRACIÓN END-TO-END

### 10.1 Flujo Completo
**Objetivo:** Simular caso de uso real completo

**Escenario:** Analista SOC investiga dominio sospechoso

```
PASO 1: Login al sistema
→ http://localhost:3000
→ Usuario: admin, Password: password
→ ✅ Acceso concedido

PASO 2: Reconocimiento Inicial
→ Seleccionar template "🔍 Recon Básico"
→ Target: suspicious-domain.com
→ Click "Ejecutar"
→ ✅ Subfinder retorna 15 subdominios en 45s

PASO 3: Análisis IA del Recon
→ Click "Analizar con IA"
→ ✅ IA identifica:
  - 3 subdominios de alto interés
  - Nivel de riesgo: MEDIO
  - Recomienda: escaneo de puertos

PASO 4: Escaneo de Puertos
→ Servicio: web-pentest
→ Comando: nmap -sV -p 1-1000 suspicious-domain.com
→ ✅ Nmap encuentra puerto 22, 80, 443 abiertos

PASO 5: Análisis IA del Escaneo
→ Click "Analizar con IA"
→ ✅ IA clasifica:
  - Severidad: ALTA (SSH expuesto)
  - Recomienda: auditoría de configuración SSH

PASO 6: Ejecutar Playbook Completo
→ Seleccionar "Full OSINT Enrichment"
→ Target: suspicious-domain.com
→ ✅ Ejecuta 4 herramientas en paralelo
→ ✅ Genera reporte consolidado con IA
→ ✅ Duración total: 3 minutos

PASO 7: Revisar Logs
→ Ir a sección "Logs"
→ Filtrar por usuario: admin
→ ✅ 6 entradas de logs visibles
→ Exportar logs en JSON
→ ✅ Archivo descargado

RESULTADO: Analista tiene visibilidad completa en < 5 minutos
```

**Criterios de Aceptación:**
- ✅ Flujo completo sin errores
- ✅ Tiempo total < 5 minutos
- ✅ Todos los resultados guardados en logs
- ✅ Análisis IA coherente y útil
- ✅ Export de logs funcional

---

## 11. PRUEBAS DE RENDIMIENTO

### 11.1 Carga y Escalabilidad
**Objetivo:** Validar comportamiento bajo carga

| ID | Prueba | Condiciones | Resultado Esperado | Prioridad |
|----|--------|-------------|-------------------|-----------|
| PERF-001 | Jobs concurrentes | 10 jobs simultáneos | Todos completan en < 2 min | ALTA |
| PERF-002 | Análisis IA pesado | Output de 5000 chars | Responde en < 60s | MEDIA |
| PERF-003 | Playbook largo | 5 pasos secuenciales | Completa en < 5 min | ALTA |
| PERF-004 | Múltiples usuarios | 3 usuarios simultáneos | Sin degradación | MEDIA |
| PERF-005 | Redis bajo carga | 50 jobs encolados | Procesa todos sin pérdida | ALTA |

**Procedimiento de Prueba:**
```bash
# Test 10 jobs concurrentes
for i in {1..10}; do
  curl -X POST http://localhost:3000/exec/osint-tools \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" \
    -d "{\"command\":\"whois example$i.com\"}" &
done
wait

# Verificar todos completaron
curl http://localhost:3000/logs \
  -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" | jq 'length'
# Esperado: >= 10 logs
```

**Criterios de Aceptación:**
- ✅ 10 jobs concurrentes completan en < 2 min
- ✅ No hay timeouts ni errores de memoria
- ✅ Redis maneja 50+ jobs sin pérdida
- ✅ WebSocket mantiene 10+ conexiones simultáneas

---

## 12. PRUEBAS DE RECUPERACIÓN

### 12.1 Tolerancia a Fallos
**Objetivo:** Validar recuperación ante errores

| ID | Escenario | Acción | Resultado Esperado | Prioridad |
|----|-----------|--------|-------------------|-----------|
| REC-001 | Redis caído | `docker stop orcsoc-redis` | Error descriptivo, no crash | ALTA |
| REC-002 | Ollama caído | `docker stop ollama` | Reintentos, error tras 3 intentos | MEDIA |
| REC-003 | Contenedor OSINT caído | `docker stop osint-tools` | Error "servicio no disponible" | ALTA |
| REC-004 | Comando inválido | Enviar comando con typo | Error claro, no crash | MEDIA |
| REC-005 | Timeout largo | Comando que tarda > 5 min | Timeout, job marcado como fallido | MEDIA |

**Criterios de Aceptación:**
- ✅ Sistema no crashea ante errores
- ✅ Mensajes de error descriptivos
- ✅ Logs registran errores correctamente
- ✅ Servicios se recuperan al reiniciar contenedor

---

## RESUMEN DE PRIORIDADES

### Pruebas CRÍTICAS (Bloquean release):
- INF-001, INF-004, INF-005
- OSINT-001, OSINT-005
- PEN-001
- IA-001, IA-003
- QUEUE-001, QUEUE-002, QUEUE-003
- SEC-001, SEC-002, SEC-003, SEC-004
- PLAY-001, PLAY-004
- UI-001, UI-004, UI-005

### Pruebas ALTAS (Importantes):
- Resto de OSINT, PEN, IA, QUEUE, PLAY, UI

### Pruebas MEDIAS (Nice to have):
- PERF, REC, algunas UI

---

## EJECUCIÓN DEL PLAN

### Orden Recomendado:
1. **Infraestructura** (30 min)
2. **Herramientas OSINT + Pentest** (1 hora)
3. **IA + Job Queue** (1 hora)
4. **Seguridad** (30 min)
5. **Playbooks + Templates** (45 min)
6. **Dashboard UI** (45 min)
7. **End-to-End** (30 min)
8. **Rendimiento + Recuperación** (1 hora)

**Tiempo Total Estimado:** 6 horas

---

## REPORTE DE RESULTADOS

### Template de Reporte:
```
PRUEBA: [ID]
FECHA: [YYYY-MM-DD]
TESTER: [Nombre]
RESULTADO: ✅ PASS / ❌ FAIL / ⚠️ PARCIAL
TIEMPO: [minutos]
OBSERVACIONES: [Detalles]
EVIDENCIA: [Screenshots/logs]
```

### Criterio de Aprobación:
- ✅ 100% pruebas CRÍTICAS PASS
- ✅ 90%+ pruebas ALTAS PASS
- ✅ 70%+ pruebas MEDIAS PASS

---

© 2025 OrcSOC - Plan de Pruebas Completo
