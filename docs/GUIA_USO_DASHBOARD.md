# Guía de Uso - Dashboard OrcSOC Mejorado
## Versión: Dashboard Moderno con IA Integrada

**Fecha:** 2 de Diciembre, 2025  
**URL de Acceso:** http://localhost:3000

---

## 🎯 NUEVO DASHBOARD - Características Principales

### ✅ Mejoras Implementadas

#### 1. Input Centralizado para URLs/Dominios/IPs ✅
- **Ubicación:** Centro del dashboard, bajo "🎯 Analizar Objetivo"
- **Acepta:** Dominios (example.com), URLs (https://example.com), IPs (192.168.1.1)
- **Validación:** Automática antes de ejecutar

#### 2. Plantillas Inteligentes (Botones Rápidos) ✅
5 plantillas pre-configuradas listas para usar:

| Icono | Acción | Herramienta | Descripción |
|-------|--------|-------------|-------------|
| 🔍 | Recon Básico | Subfinder | Enumeración rápida de subdominios |
| 🕵️ | OSINT Completo | Enrich.py | Análisis profundo multi-herramienta |
| 🔬 | Escaneo Puertos | Nmap | Escaneo de puertos web comunes |
| 🛡️ | Vulnerabilidades | Nikto | Detección de vulnerabilidades web |
| 📧 | Buscar Emails | theHarvester | Recolección de emails públicos |

**Uso:**
1. Ingresa el objetivo en el input central
2. Click en cualquier botón
3. El comando se auto-genera y ejecuta

#### 3. Resultados en Tiempo Real ✅
- **WebSocket:** Actualización instantánea sin recargar página
- **Estado visible:** "Ejecutando..." → "Completado (XXms)" o "Error"
- **Tabs:** Resultado crudo + Análisis IA separados

#### 4. Análisis IA Contextual ✅
**Botón "🤖 Analizar con IA"** - Análisis especializado según herramienta:

**Nmap:**
- Resumen ejecutivo de hallazgos
- Puertos críticos y servicios expuestos
- Nivel de severidad (CRÍTICO/ALTO/MEDIO/BAJO)
- Vector de ataque más probable
- Recomendaciones inmediatas

**Subfinder/Amass:**
- Subdominios de alto interés
- Posibles vectores de ataque
- Exposición de información sensible
- Priorización para investigación

**theHarvester:**
- Nivel de exposición de información
- Datos sensibles encontrados
- Riesgo de ingeniería social
- Recomendaciones de protección

**SQLmap:**
- Severidad y explotabilidad
- Datos en riesgo
- Impacto en negocio
- Pasos de remediación urgentes

#### 5. Estado de Microservicios en Tiempo Real ✅
**Ubicación:** Parte superior del dashboard

**Servicios Monitoreados:**
- OSINT Tools
- Web Pentest
- Wireless Lab
- AI-Offsec
- Ollama

**Información Mostrada:**
- Estado: UP (verde) / DOWN (rojo)
- Actualización: Cada 30 segundos automáticamente

#### 6. Notificaciones en Tiempo Real ✅
**Tipos de Notificación:**
- ✅ Verde: Éxito ("Análisis iniciado", "Completado")
- ❌ Rojo: Error ("Comando inválido", "Error en IA")

**Comportamiento:**
- Aparecen esquina superior derecha
- Duración: 3 segundos
- Animación de entrada/salida

---

## 📖 GUÍA DE USO PASO A PASO

### Caso 1: Reconocimiento Rápido de Dominio

```
1. Abrir http://localhost:3000
2. En el input central escribir: example.com
3. Click en "🔍 Recon Básico"
4. Esperar resultados (aparecen automáticamente)
5. Click en "🤖 Analizar con IA"
6. Revisar tab "Análisis IA" con interpretación inteligente
```

**Tiempo estimado:** 1-2 minutos

### Caso 2: Análisis OSINT Completo

```
1. Ingresar dominio objetivo
2. Click en "🕵️ OSINT Completo"
3. El sistema ejecuta en paralelo:
   - Subfinder
   - theHarvester
   - Whois
   - NSLookup
4. Resultados agregados aparecen automáticamente
5. IA analiza y correlaciona todos los hallazgos
```

**Tiempo estimado:** 3-5 minutos

### Caso 3: Escaneo de Vulnerabilidades Web

```
1. Ingresar URL completa: https://example.com
2. Click en "🛡️ Vulnerabilidades"
3. Nikto analiza el servidor web
4. Resultados muestran:
   - Vulnerabilidades encontradas
   - Configuraciones inseguras
   - Versiones obsoletas
5. IA clasifica por severidad y recomienda acciones
```

**Tiempo estimado:** 2-4 minutos

### Caso 4: Investigación de Emails

```
1. Ingresar dominio: company.com
2. Click en "📧 Buscar Emails"
3. theHarvester busca en:
   - Google
   - Bing
   - Fuentes públicas
4. Resultados muestran emails expuestos
5. IA evalúa riesgo de ingeniería social
```

**Tiempo estimado:** 1-2 minutos

---

## 🔐 VALIDACIÓN Y SEGURIDAD

### Validación de Comandos Implementada ✅

**Caracteres Bloqueados:**
- `;` (punto y coma)
- `|` (pipe)
- `&` (ampersand)
- `$()` (command substitution)
- `` ` `` (backticks)
- `{}` `[]` (brackets)
- `<>` (redirection)
- `\\` (backslash)

**Whitelist por Servicio:**

**OSINT Tools Permitidos:**
- `python tools/subfinder_wrapper.py --domain [domain]`
- `python tools/harvester_wrapper.py --domain [domain]`
- `python tools/amass_wrapper.py --domain [domain]`
- `python tools/enrich.py --target [target] --type domain`
- `whois [domain]`
- `nslookup [domain]`

**Web Pentest Permitidos:**
- `nmap -sV -p [ports] [target]`
- `nikto -h http://[target]`
- `sqlmap -u [url] --batch`
- `wpscan --url [url]`
- `gobuster dir -u [url] -w [wordlist]`

**Mensajes de Error:**
- "Comando contiene caracteres peligrosos"
- "Comando no permitido para este servicio"
- "Servicio no válido"

---

## 🎨 INTERFAZ Y DISEÑO

### Colores y Estados

**Status Badges:**
- 🟡 Amarillo: "Ejecutando..."
- 🟢 Verde: "Completado (XXms)"
- 🔴 Rojo: "Error"

**Service Status:**
- 🟢 Verde (UP): Servicio operativo
- 🔴 Rojo (DOWN): Servicio caído

**Diseño:**
- Gradiente morado/azul de fondo
- Cards blancos con sombras
- Botones con hover effects
- Responsive para desktop y tablet

---

## 🚀 FUNCIONALIDADES AVANZADAS

### WebSocket en Tiempo Real ✅

**Eventos Soportados:**
```javascript
socket.on('job:start')     // Job comenzó a ejecutarse
socket.on('job:complete')  // Job completado con éxito
socket.on('job:error')     // Job falló
```

**Ventajas:**
- No hay polling
- Updates instantáneos
- Múltiples usuarios simultáneos
- No bloquea la UI

### Job Queue con Redis ✅

**Características:**
- Ejecución asíncrona
- Jobs concurrentes ilimitados
- Persistencia de resultados
- Reintentos automáticos (IA)
- Timeouts configurados

**Flujo:**
1. Usuario ejecuta comando
2. Sistema retorna jobId inmediatamente
3. Job se encola en Redis
4. Worker procesa job en background
5. WebSocket notifica al cliente en tiempo real

---

## 📊 ANÁLISIS IA - Prompts Especializados

### Sistema de Reintentos ✅
- **Intentos:** 3 máximo
- **Delay:** 2 segundos entre intentos
- **Timeout:** 60s (chat), 90s (análisis)
- **Validación:** Max 5000 caracteres de input

### Formato de Respuesta IA

**Para Nmap:**
```
1. Resumen ejecutivo
2. Puertos críticos y servicios
3. Nivel de severidad
4. Vector de ataque
5. Recomendaciones
```

**Para OSINT:**
```
1. Subdominios/datos de interés
2. Posibles vectores de ataque
3. Exposición de información
4. Priorización
5. Recomendaciones
```

**Para Vulnerabilidades:**
```
1. Severidad y explotabilidad
2. Datos/sistemas en riesgo
3. Impacto en negocio
4. Pasos de remediación
```

---

## 🐛 TROUBLESHOOTING

### Problema: "No hay resultados para analizar"
**Solución:** 
- Espera a que el job complete
- Verifica que el comando ejecutó correctamente
- Revisa tab "Output" primero

### Problema: "Error en análisis IA"
**Causas Posibles:**
1. Ollama no está respondiendo
2. Output muy grande (>5000 chars)
3. Timeout excedido

**Solución:**
```bash
# Verificar Ollama
docker exec ollama ollama list

# Verificar logs
docker logs ollama --tail 20

# Reiniciar si es necesario
docker restart ollama
```

### Problema: Servicios aparecen DOWN
**Solución:**
```bash
# Verificar estado real
docker-compose ps

# Reiniciar servicio específico
docker-compose restart osint-tools

# Reiniciar todos
docker-compose restart
```

### Problema: WebSocket no conecta
**Indicador:** Resultados no aparecen automáticamente

**Solución:**
```bash
# Verificar logs de ops-center
docker logs ops-center --tail 50

# Buscar: "WebSocket enabled"
# Si no aparece, el backend antiguo está corriendo

# Verificar que app.js correcto está activo
docker exec ops-center head -5 /app/app.js
# Debe mostrar: const socketIo = require('socket.io');
```

---

## 📈 MÉTRICAS Y RENDIMIENTO

### Tiempos de Respuesta Esperados

| Acción | Tiempo |
|--------|--------|
| Recon Básico (Subfinder) | 30-60s |
| OSINT Completo | 2-5 min |
| Escaneo Nmap | 1-3 min |
| Nikto Scan | 2-4 min |
| theHarvester | 1-2 min |
| Análisis IA | 10-30s |

### Capacidad del Sistema

**Jobs Concurrentes:** Ilimitados (limitado por recursos)  
**Usuarios Simultáneos:** Múltiples (con Redis)  
**Actualización de Servicios:** Cada 30s  
**Persistencia:** Redis con appendonly=yes  

---

## 🎓 CASOS DE USO PRÁCTICOS

### 1. Auditoría de Seguridad Empresarial

**Escenario:** Analizar dominio corporativo
```
1. Input: company.com
2. OSINT Completo
3. Recon Básico en subdominios encontrados
4. Escaneo Puertos en IPs identificadas
5. IA analiza y prioriza hallazgos
6. Generar reporte consolidado
```

### 2. Investigación OSINT

**Escenario:** Investigar organización
```
1. Input: target-org.com
2. Buscar Emails
3. OSINT Completo
4. IA correlaciona información expuesta
5. Identificar riesgo de ingeniería social
```

### 3. Pentesting Ético

**Escenario:** Evaluación de seguridad web
```
1. Input: https://client-site.com
2. Escaneo Puertos
3. Vulnerabilidades (Nikto)
4. IA clasifica por severidad
5. Priorizar remediación
```

### 4. Análisis de Subdominio Específico

**Escenario:** Investigar subdominio sospechoso
```
1. Input: suspicious.company.com
2. Escaneo Puertos
3. Vulnerabilidades
4. IA evalúa riesgo específico
```

---

## 🔄 ACTUALIZACIONES Y MANTENIMIENTO

### Actualizar Dashboard

```bash
cd /Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC

# Pull latest changes
git pull

# Rebuild ops-center
docker-compose build --no-cache ops-center

# Restart
docker-compose restart ops-center
```

### Ver Logs en Tiempo Real

```bash
# Logs de ops-center
docker logs -f ops-center

# Logs de Redis
docker logs -f orcsoc-redis

# Logs de Ollama
docker logs -f ollama

# Todos los servicios
docker-compose logs -f
```

### Backup de Datos

```bash
# Backup de logs
docker cp ops-center:/app/logs.json ./backup-logs-$(date +%Y%m%d).json

# Backup de Redis
docker exec orcsoc-redis redis-cli SAVE
docker cp orcsoc-redis:/data/dump.rdb ./backup-redis-$(date +%Y%m%d).rdb
```

---

## 📞 SOPORTE Y RECURSOS

**Dashboard:** http://localhost:3000  
**Ollama API:** http://localhost:11435  
**Redis:** localhost:6379  

**Documentación Adicional:**
- `TEST_PLAN.md` - Plan de pruebas completo
- `IMPROVEMENTS_SUMMARY.md` - Resumen de mejoras
- `PHASE1_IMPLEMENTATION.md` - Implementación Fase 1

**Credenciales:**
- Usuario: `admin`
- Password: `password`

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de usar el dashboard, verifica:

- [ ] http://localhost:3000 accesible
- [ ] 5 services visibles en status grid
- [ ] Input central acepta texto
- [ ] 5 botones de acción visibles
- [ ] Click en botón genera jobId
- [ ] Resultados aparecen automáticamente
- [ ] Botón "Analizar con IA" funciona
- [ ] Tab "Análisis IA" muestra respuesta
- [ ] Notificaciones aparecen en esquina
- [ ] Services status se actualiza

---

## 🎉 RESUMEN DE CAPACIDADES

### ✅ Implementado y Funcional

1. **Input Centralizado** - URL/Dominio/IP único
2. **5 Plantillas Inteligentes** - Botones pre-configurados
3. **Análisis IA Contextual** - Prompts especializados por herramienta
4. **Validación de Seguridad** - Whitelist + caracteres peligrosos bloqueados
5. **Estado de Servicios** - Monitoreo en tiempo real
6. **WebSocket Real-time** - Updates instantáneos
7. **Job Queue** - Ejecución asíncrona con Redis
8. **Notificaciones** - Feedback visual inmediato
9. **Reintentos Automáticos** - IA robusta con 3 intentos
10. **Interfaz Moderna** - Diseño profesional responsive

### 🎯 Valor Agregado

**Antes:**
- Comandos manuales complicados
- Sin validación
- Resultados bloqueantes
- IA básica sin contexto
- Sin feedback visual

**Después:**
- Click y analiza
- Validación estricta
- Resultados en tiempo real
- IA especializada con storytelling
- UX profesional

---

**OrcSOC Dashboard está listo para uso en producción y demostración a clientes.**

© 2025 Felipe Ibarra - OrcSOC Dashboard Moderno
