# OrcSOC 🚀
**Security Operations Center - Plataforma Integral con IA Integrada**

[![Status](https://img.shields.io/badge/status-OPERATIVO-green)]()
[![Docker](https://img.shields.io/badge/docker-compose-blue)]()
[![IA](https://img.shields.io/badge/IA-Ollama_llama3.2-purple)]()

**Dashboard:** http://localhost:3000  
**Versión:** 2.0 - Dashboard Moderno

---

## ⚡ Quick Start

1. **Abrir dashboard:** http://localhost:3000
2. **Ingresar objetivo:** Dominio, URL o IP en el input central
3. **Seleccionar acción:** Click en cualquiera de los 5 botones
4. **Ver resultados:** Aparecen automáticamente en tiempo real
5. **Analizar con IA:** Interpretación contextual inteligente

**📖 Documentación rápida:** `QUICK_START.md` | **📋 Guía completa:** `GUIA_USO_DASHBOARD.md`

---

## 🎯 Características Principales

### ✅ Dashboard Moderno
- **Input centralizado** para URL/Dominio/IP
- **5 plantillas inteligentes** de comandos pre-configurados
- **Resultados en tiempo real** con WebSocket
- **Análisis IA contextual** especializado por herramienta
- **Monitoreo de servicios** en vivo (estado UP/DOWN)
- **Notificaciones visuales** de estado de jobs

### 🤖 Integración IA Avanzada
- **Ollama llama3.2** (2GB) integrado
- **Prompts especializados** según herramienta usada:
  - Nmap (escaneo de puertos)
  - Subfinder/Amass (subdominios)
  - theHarvester (emails)
  - SQLmap (inyecciones SQL)
- **Sistema de reintentos** (3 intentos con delay)
- **Timeouts configurados** (60s chat, 90s análisis)
- **Análisis contextual** con niveles de severidad y recomendaciones

### 🔐 Seguridad y Validación
- **Whitelist de comandos** por servicio
- **Bloqueo de caracteres peligrosos** (`;`, `|`, `&`, `$()`, backticks, etc.)
- **Validación antes de ejecución**
- **Contenedores aislados**

### ⚙️ Job Queue Asíncrono
- **Bull + Redis** para ejecución no bloqueante
- **WebSocket** para notificaciones en tiempo real
- **Persistencia** de resultados
- **Jobs concurrentes ilimitados**

---

## 🛠️ Plantillas Disponibles

| Icono | Plantilla | Herramienta | Tiempo | Descripción |
|-------|-----------|-------------|--------|-------------|
| 🔍 | **Recon Básico** | Subfinder | 30-60s | Enumeración rápida de subdominios |
| 🕵️ | **OSINT Completo** | Enrich.py | 2-5 min | Análisis profundo multi-herramienta |
| 🔬 | **Escaneo Puertos** | Nmap | 1-3 min | Escaneo de puertos web comunes |
| 🛡️ | **Vulnerabilidades** | Nikto | 2-4 min | Detección de vulnerabilidades web |
| 📧 | **Buscar Emails** | theHarvester | 1-2 min | Recolección de emails públicos |

---

## 🏗️ Arquitectura

### 8 Contenedores Docker

```
┌─────────────────────────────────────────────────────┐
│                   ops-center                        │
│           Backend + Dashboard + Job Queue           │
│                    (Port 3000)                      │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┼────────────┬─────────────┐
      │            │            │             │
┌─────▼────┐ ┌────▼────┐ ┌─────▼────┐ ┌─────▼────┐
│  OSINT   │ │  Web    │ │ Wireless │ │   AI     │
│  Tools   │ │ Pentest │ │   Lab    │ │ Offsec   │
└──────────┘ └─────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌─────────┐ ┌──────────┐
│  Redis   │ │ Ollama  │ │  Nginx   │
│ (Queue)  │ │  (IA)   │ │ (Proxy)  │
└──────────┘ └─────────┘ └──────────┘
```

### Servicios

| Servicio | Puerto | Función |
|----------|--------|---------|
| ops-center | 3000 | Backend Node.js + Dashboard + Job Queue |
| osint-tools | 5000 | Subfinder, theHarvester, Amass, Enrich |
| web-pentest | 5001 | Nmap, Nikto, SQLmap, WPScan, Gobuster |
| wireless-lab | 5002 | Herramientas wireless (host network) |
| ai-offsec | 5003 | IA ofensiva y análisis |
| ollama | 11435 | Motor IA (llama3.2) |
| redis | 6379 | Job Queue + Persistencia |
| nginx | 8081 | Reverse proxy |

---

## 🚀 Instalación

### Prerrequisitos
- Docker 20+
- Docker Compose v2+
- 8GB RAM mínimo
- 20GB espacio en disco

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/felipeibarra/OrcSOC.git
cd OrcSOC

# 2. Levantar servicios
docker-compose up -d

# 3. Verificar estado
docker-compose ps

# 4. Verificar logs
docker logs ops-center --tail 50

# 5. Acceder al dashboard
open http://localhost:3000
```

### Verificación

```bash
# Todos los servicios deben estar UP
docker-compose ps

# Verificar Ollama tiene el modelo
docker exec ollama ollama list
# Debe mostrar: llama3.2:latest

# Verificar Redis
docker exec orcsoc-redis redis-cli ping
# Debe responder: PONG

# Test health
curl http://localhost:3000/services/status
```

---

## 📖 Documentación

| Archivo | Descripción |
|---------|-------------|
| `QUICK_START.md` | Guía visual rápida (3 pasos para empezar) |
| `GUIA_USO_DASHBOARD.md` | Guía completa de uso del dashboard (530 líneas) |
| `STATUS.md` | Estado actual del sistema y troubleshooting |
| `TEST_PLAN.md` | Plan de pruebas completo (12 secciones) |
| `IMPROVEMENTS_SUMMARY.md` | Resumen de todas las mejoras implementadas |
| `PHASE1_IMPLEMENTATION.md` | Documentación de implementación Fase 1 |

---

## 🎓 Casos de Uso

### 1. Auditoría de Seguridad
```
Input: company.com
Acción: 🕵️ OSINT Completo
Resultado: Subdominios, emails, WHOIS, DNS
IA: Priorización de vectores de ataque
```

### 2. Análisis de Vulnerabilidades Web
```
Input: https://target.com
Acción: 🛡️ Vulnerabilidades
Resultado: Configuraciones inseguras, versiones obsoletas
IA: Clasificación por severidad y remediación
```

### 3. Reconocimiento Rápido
```
Input: example.com
Acción: 🔍 Recon Básico
Resultado: Lista de subdominios
IA: Subdominios de alto interés
```

### 4. Investigación OSINT
```
Input: target-org.com
Acción: 📧 Buscar Emails
Resultado: Emails públicos expuestos
IA: Evaluación riesgo ingeniería social
```

---

## 🔧 Comandos Útiles

### Operación

```bash
# Ver estado general
docker-compose ps

# Logs en vivo
docker logs -f ops-center
docker logs -f ollama
docker-compose logs -f

# Reiniciar servicios
docker-compose restart
docker-compose restart ops-center
docker restart ollama

# Parar todo
docker-compose down

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Troubleshooting

```bash
# Dashboard no carga
docker logs ops-center --tail 50
docker-compose restart ops-center

# IA no funciona
docker exec ollama ollama list
docker restart ollama

# Redis error
docker exec orcsoc-redis redis-cli ping
docker-compose restart orcsoc-redis

# WebSocket desconectado
docker exec ops-center head -10 /app/app.js
# Debe mostrar: const socketIo = require('socket.io');
```

### Mantenimiento

```bash
# Backup de logs
docker cp ops-center:/app/logs.json ./backup-logs-$(date +%Y%m%d).json

# Backup de Redis
docker exec orcsoc-redis redis-cli SAVE
docker cp orcsoc-redis:/data/dump.rdb ./backup-redis-$(date +%Y%m%d).rdb

# Limpiar contenedores antiguos
docker system prune -a
```

---

## 🛡️ Herramientas Integradas

### OSINT Tools (osint-tools)
- **Subfinder** - Enumeración de subdominios
- **theHarvester** - Recolección de emails, hosts, IPs
- **Amass** - Reconocimiento DNS avanzado
- **Enrich.py** - Orquestador multi-herramienta
- **Whois** - Información de dominio
- **NSLookup** - Consultas DNS

### Web Pentesting (web-pentest)
- **Nmap** - Escaneo de puertos y servicios
- **Nikto** - Scanner de vulnerabilidades web
- **SQLmap** - Detección y explotación SQL injection
- **WPScan** - Análisis de WordPress
- **Gobuster** - Enumeración de directorios
- **Feroxbuster** - Web fuzzing rápido

### IA Integration (ollama)
- **llama3.2** - Modelo 2GB optimizado
- **Prompts especializados** por herramienta
- **Análisis contextual** de resultados
- **Sistema de reintentos** automático

---

## 📊 Métricas y Rendimiento

### Capacidad
- **Jobs concurrentes:** Ilimitados (limitado por recursos)
- **Usuarios simultáneos:** Múltiples (soportado por Redis)
- **Actualización servicios:** Cada 30s
- **Persistencia:** Redis con appendonly=yes

### Tiempos de Respuesta
- Dashboard: < 100ms
- WebSocket: Instantáneo
- IA análisis: 10-30s
- Comandos: Variable según herramienta

---

## 🔒 Seguridad

### Validación de Comandos ✅
- Whitelist de comandos permitidos por servicio
- Bloqueo de caracteres peligrosos: `;` `|` `&` `$()` `` ` `` `{}` `[]` `<>` `\\`
- Solo endpoints autorizados

### Aislamiento ✅
- Cada servicio en contenedor separado
- Red interna aislada (socnet)
- Sin privilegios elevados (excepto wireless con NET_ADMIN)

### Credenciales
```
Usuario: admin
Password: password
```
*Cambiar en producción*

---

## 🚧 Roadmap - Fase 2

- [ ] Historial persistente de ejecuciones (últimas 10)
- [ ] Búsqueda de logs con IA
- [ ] Progreso paso a paso en playbooks
- [ ] Integración APIs externas (Shodan, VirusTotal)
- [ ] Exportar reportes PDF
- [ ] Dashboard multi-usuario con autenticación real
- [ ] Alertas de seguridad automatizadas
- [ ] Integración con Slack/Discord

---

## 📈 Estado del Proyecto

### ✅ Completado (Fase 1)
- Dashboard moderno con input centralizado
- 5 plantillas inteligentes
- Análisis IA contextual
- Job Queue asíncrono con Redis
- WebSocket para tiempo real
- Validación de seguridad
- Monitoreo de servicios
- Notificaciones visuales
- 10+ herramientas integradas

### 🟢 Estado Actual
**PRODUCCIÓN READY**

El sistema está completamente operativo y listo para:
- Demostraciones a clientes
- Auditorías de seguridad
- Investigación OSINT
- Análisis de superficie de ataque
- Reconocimiento ético
- Educación en ciberseguridad

---

## 🤝 Soporte y Contribución

### Reportar Issues
```bash
# Incluir siempre:
1. Versión de Docker: docker --version
2. Logs relevantes: docker logs <servicio>
3. Estado de servicios: docker-compose ps
4. Descripción del problema
```

### Contribuir
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "Agregar nueva funcionalidad"`
4. Push a rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

---

## 📞 Contacto

**Dashboard:** http://localhost:3000  
**Documentación:** Ver archivos `*.md` en raíz del proyecto  
**GitHub:** https://github.com/felipeibarra/OrcSOC  

---

## ⚖️ Licencia y Uso Ético

**IMPORTANTE:** OrcSOC es una herramienta para uso **legal y ético** únicamente.

### ✅ Uso Permitido
- Auditorías de seguridad autorizadas
- Pentesting con consentimiento explícito
- Investigación OSINT de información pública
- Educación y capacitación
- Red Team ejercicios internos

### ❌ Uso Prohibido
- Acceso no autorizado a sistemas
- Recolección de datos sin consentimiento
- Actividades ilegales de cualquier tipo
- Violación de términos de servicio
- Dañar o perjudicar a terceros

**El usuario es el único responsable del uso de esta herramienta.**

---

## 🎉 Resumen

OrcSOC es una plataforma completa de Security Operations Center que:

✅ Centraliza herramientas OSINT y pentesting  
✅ Proporciona análisis IA contextual inteligente  
✅ Ejecuta jobs asíncronos con resultados en tiempo real  
✅ Valida y asegura comandos antes de ejecución  
✅ Ofrece interfaz moderna y profesional  
✅ Escala según necesidades del usuario  

**Estado:** 🟢 OPERATIVO - Listo para producción

---

**OrcSOC Dashboard v2.0 - Security Operations Center con IA**

© 2025 Felipe Ibarra - Para uso legal y ético únicamente
