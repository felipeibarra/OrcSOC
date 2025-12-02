# 🛡️ OrcSOC - Orchestrated Security Operations Center

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos-lightgrey.svg)

**Una plataforma moderna de orquestación de herramientas OSINT y pentesting con análisis de IA**

[Características](#-características-principales) •
[Quick Start](#-quick-start) •
[Arquitectura](#-arquitectura) •
[Uso](#-uso) •
[Documentación](#-documentación)

</div>

---

## 📋 Descripción

**OrcSOC** es un Security Operations Center completo que orquesta múltiples herramientas de seguridad ofensiva (OSINT, pentesting web, análisis wireless) y las integra con capacidades de **Inteligencia Artificial** para análisis automático de resultados.

### 🎯 ¿Para quién es?

- 🔒 **Pentesters** que necesitan centralizar herramientas y automatizar workflows
- 🕵️ **Analistas OSINT** que requieren correlación inteligente de datos
- 🚨 **Red Teams** que buscan orquestación de operaciones
- 🎓 **Estudiantes de ciberseguridad** aprendiendo metodologías profesionales
- 🏢 **Empresas** que necesitan auditorías de seguridad automatizadas

---

## ✨ Características Principales

### 🔍 **5 Categorías de Herramientas**

| Categoría | Herramientas | Casos de Uso |
|-----------|--------------|--------------|
| **🔎 Recon Básico** | Subfinder, Amass | Enumeración de subdominios (pasivo/activo) |
| **🕵️ OSINT Completo** | theHarvester, WHOIS, DNS | Inteligencia de fuentes abiertas |
| **🔬 Escaneo Puertos** | Nmap (TCP/UDP) | Análisis de servicios y versiones |
| **🛡️ Vulnerabilidades** | Nikto, SQLmap, WPScan | Detección de vulnerabilidades web |
| **📧 Buscar Emails** | theHarvester | Recolección de emails expuestos |

### 🤖 **IA Integrada**

- **Ollama** con modelo `llama3.2` para análisis contextual de resultados
- Análisis automático post-ejecución con recomendaciones de seguridad
- Chat IA para consultas sobre resultados

### 🎨 **Dashboard Moderno**

- Interfaz web responsive con diseño glassmorphism
- **19 opciones de comandos** con explicaciones detalladas
- Modales informativos con niveles (Básico/Intermedio/Avanzado)
- WebSockets en tiempo real para streaming de resultados
- Sistema de tabs para múltiples targets simultáneos

### 🔧 **Arquitectura Microservicios**

```
┌─────────────────┐
│   Dashboard     │  ← Frontend (HTML5 + Vanilla JS)
│  localhost:3000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ops-Center    │  ← Orquestador + API + Cola de Jobs
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬───────────┐
    ▼         ▼          ▼          ▼           ▼
┌─────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
│ OSINT   │ │  Web   │ │Wireless │ │ AI     │ │ Redis  │
│ Tools   │ │Pentest │ │  Lab    │ │OffSec  │ │ Queue  │
└─────────┘ └────────┘ └─────────┘ └────────┘ └────────┘
                                        │
                                        ▼
                                   ┌────────┐
                                   │ Ollama │
                                   └────────┘
```

---

## 🚀 Quick Start

### Prerequisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- 8GB RAM mínimo (recomendado 16GB para Ollama)
- 10GB espacio en disco

### Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/OrcSOC.git
cd OrcSOC

# 2. Ejecutar instalación
chmod +x install.sh
./install.sh

# 3. Descargar modelo de IA (primera vez)
docker exec ollama ollama pull llama3.2
```

### Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Dashboard** | http://localhost:3000 | - |
| **Nginx Proxy** | http://localhost:8081 | - |
| **Ollama API** | http://localhost:11435 | - |
| **Redis** | localhost:6379 | - |

---

## 💻 Uso

### 1️⃣ **Dashboard Web**

Abre http://localhost:3000 y selecciona:

1. **Categoría de herramienta** (Recon, OSINT, Escaneo, etc.)
2. **Opción específica** (modal con detalles)
3. **Target** (dominio, IP o URL)
4. Click **Ejecutar**

Los resultados aparecen en tiempo real con análisis de IA automático.

### 2️⃣ **API REST**

#### Ejecutar comando manualmente

```bash
curl -X POST http://localhost:3000/exec/template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "recon-basico",
    "optionId": "subfinder-rapido",
    "target": "example.com"
  }'
```

#### Analizar con IA

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "output": "resultados del comando",
    "tool": "nmap"
  }'
```

### 3️⃣ **Playbooks (Workflows Automáticos)**

```bash
# Ejecutar reconocimiento completo automatizado
curl -X POST http://localhost:3000/playbook/run \
  -H "Content-Type: application/json" \
  -d '{
    "playbookId": "recon-completo",
    "target": "example.com"
  }'
```

---

## 🏗️ Arquitectura

### Contenedores

| Container | Imagen/Build | Puerto | Descripción |
|-----------|--------------|--------|-------------|
| `ops-center` | `./docker/ops-center` | 3000 | Orquestador principal + API |
| `osint-tools` | `./docker/osint-tools` | - | Subfinder, Amass, theHarvester |
| `web-pentest` | `./docker/web-pentest` | - | Nmap, Nikto, SQLmap, WPScan |
| `wireless-lab` | `./docker/wireless-lab` | - | Aircrack-ng, Reaver (host mode) |
| `ai-offsec` | `./docker/ai-offsec` | - | Scripts de análisis con IA |
| `ollama` | `ollama/ollama:latest` | 11435 | Servidor IA local |
| `redis` | `redis:7-alpine` | 6379 | Cola de jobs |
| `nginx` | `nginx:alpine` | 8081 | Reverse proxy |

### Tecnologías

- **Backend:** Node.js + Express + Socket.IO
- **Frontend:** HTML5 + CSS3 (Glassmorphism) + Vanilla JavaScript
- **Queue:** BullMQ + Redis
- **IA:** Ollama (llama3.2)
- **Orquestación:** Docker Compose
- **Herramientas:** Subfinder, Amass, Nmap, Nikto, SQLmap, WPScan, theHarvester

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [ENDPOINTS.md](ENDPOINTS.md) | Lista completa de endpoints API y credenciales |
| [OPCIONES_COMANDOS.md](OPCIONES_COMANDOS.md) | Detalle de las 19 opciones de comandos |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Solución a problemas comunes |
| [FIXES_HARVESTER.md](FIXES_HARVESTER.md) | Implementación de theHarvester |

---

## 🔧 Administración

### Reiniciar servicios

```bash
# Reiniciar todos
docker-compose restart

# Reiniciar uno específico
docker restart ops-center
```

### Ver logs

```bash
# Logs en tiempo real
docker-compose logs -f ops-center

# Logs de todos los servicios
docker-compose logs -f
```

### Limpiar todo

```bash
# Limpieza profunda (contenedores + volúmenes + imágenes)
chmod +x cleanup.sh
./cleanup.sh --full
```

### Actualizar herramientas

```bash
# Reconstruir contenedores
docker-compose up --build -d

# Actualizar solo OSINT tools
docker-compose up --build -d osint-tools
```

---

## 🛠️ Desarrollo

### Estructura del proyecto

```
OrcSOC/
├── docker/
│   ├── ops-center/       # Backend Node.js + Dashboard
│   │   ├── app.js        # API principal
│   │   └── public/       # Frontend
│   ├── osint-tools/      # Herramientas OSINT
│   ├── web-pentest/      # Herramientas web
│   ├── wireless-lab/     # Herramientas wireless
│   └── ai-offsec/        # Scripts IA
├── docker-compose.yml    # Orquestación
├── install.sh            # Instalador
├── cleanup.sh            # Limpiador
└── README.md             # Este archivo
```

### Agregar nueva herramienta

1. Editar Dockerfile del servicio correspondiente
2. Crear wrapper en `tools/`
3. Agregar opción a `COMMAND_TEMPLATES` en `app.js`
4. Documentar en `OPCIONES_COMANDOS.md`

### Testing

```bash
# Verificar estado de servicios
curl http://localhost:3000/services/status

# Test de comando
curl -X POST http://localhost:3000/exec/osint-tools \
  -H "Content-Type: application/json" \
  -d '{"command": "python tools/subfinder_wrapper.py --domain example.com"}'
```

---

## ⚠️ Advertencias

- ⚖️ **Uso Legal:** Solo usa estas herramientas en sistemas autorizados
- 🔒 **Producción:** Cambia credenciales por defecto (`admin/password`)
- 🌐 **Firewall:** No expongas los puertos a Internet sin protección
- 💾 **Recursos:** Ollama requiere ~4GB RAM para el modelo llama3.2
- 🔐 **Secretos:** No commitees credenciales en el repositorio

---

## 🗺️ Roadmap

- [ ] Autenticación JWT con roles (admin/analyst/viewer)
- [ ] Persistencia de resultados en MongoDB
- [ ] Exportación de reportes (PDF/HTML)
- [ ] Integración con Telegram para notificaciones
- [ ] Dashboard de métricas con Grafana
- [ ] Módulo de exploits automatizados (Metasploit)
- [ ] API Gateway con rate limiting
- [ ] Multi-tenancy para equipos

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Felipe Ibarra**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [tu-perfil](https://linkedin.com/in/tu-perfil)

---

## 🙏 Agradecimientos

- [ProjectDiscovery](https://projectdiscovery.io) por Subfinder
- [OWASP](https://owasp.org) por sus herramientas de seguridad
- [Ollama](https://ollama.ai) por IA local
- Comunidad de ciberseguridad open source

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

</div>
