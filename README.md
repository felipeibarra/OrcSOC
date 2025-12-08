# 🛡️ OrcSOC - La Plataforma que Revoluciona las Operaciones de Ciberseguridad

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos-lightgrey.svg)

**🚀 La primera plataforma que combina OSINT, pentesting y IA en una sola interfaz unificada**

[Ver Demo](#-demo-rápida) •
[Instalación](#-instalación) •
[¿Qué Resuelve?](#-qué-problema-resuelve) •
[Arquitectura](#-arquitectura)

</div>

---

## 🔥 ¿Qué Problema Resuelve OrcSOC?

### ❌ **El Problema Actual en Ciberseguridad**

Los profesionales de ciberseguridad enfrentan diariamente estos desafíos:

- **🔄 Herramientas Desconectadas**: Cada herramienta funciona de forma aislada, sin correlación entre resultados
- **⏰ Pérdida de Tiempo**: Configurar entornos, instalar dependencias, parsear outputs manualmente
- **🤖 Sin Inteligencia**: Resultados crudos sin análisis contextual o recomendaciones accionables
- **📊 Falta de Visibilidad**: No hay dashboard unificado para monitorear operaciones
- **🔒 Complejidad Técnica**: Requiere expertise avanzado para orquestar múltiples herramientas
- **📝 Reportes Manuales**: Análisis y documentación tediosa y propensa a errores

### ✅ **La Solución de OrcSOC**

**OrcSOC transforma el caos en claridad** - Una plataforma inteligente que:

- **🎯 Unifica Todo**: OSINT + Pentesting + Wireless + IA en una sola interfaz
- **⚡ Automatiza Workflows**: Playbooks predefinidos para operaciones completas
- **🧠 Analiza con IA**: Cada resultado se analiza automáticamente con recomendaciones
- **📊 Dashboard Moderno**: Visualización en tiempo real con WebSockets
- **🔧 Zero Config**: Docker hace que "funcione" sea literal
- **📈 Escalabilidad**: Desde estudiantes hasta red teams enterprise

---

## 🎯 Casos de Uso Reales

### 1️⃣ **Auditoría Web Completa en 5 Minutos**
```bash
# En lugar de ejecutar manualmente:
nmap -sV -p 80,443 target.com
nikto -h http://target.com
sqlmap -u "http://target.com/page?id=1" --batch

# Con OrcSOC: Un click en "Web Vulnerability Scan"
# Resultado: Análisis completo + IA + recomendaciones
```

### 2️⃣ **Reconocimiento OSINT Inteligente**
```bash
# Información correlacionada automáticamente:
# - Subdominios (Subfinder + Amass)
# - Emails expuestos (theHarvester)
# - Información WHOIS + DNS
# - Análisis IA de exposición
```

### 3️⃣ **Operaciones Red Team Orquestadas**
- **Fase 1**: Reconocimiento pasivo (OSINT)
- **Fase 2**: Enumeración activa (Nmap)
- **Fase 3**: Análisis de vulnerabilidades (Nikto, SQLMap)
- **Fase 4**: Wireless assessment (Kismet, Aircrack-ng)
- **Todo coordinado** con análisis IA en cada paso

### 4️⃣ **Aprendizaje Interactivo para Estudiantes**
- **19 comandos preconfigurados** con explicaciones
- **Niveles de dificultad** (Básico → Avanzado)
- **Análisis IA** que enseña conceptos de seguridad
- **Playbooks guiados** para metodologías completas

---

## 🚀 Demo Rápida

### Instalación en 3 Comandos

```bash
git clone https://github.com/felipeibarra-m2/OrcSOC.git
cd OrcSOC
./install.sh
```

### Uso Inmediato

1. **Abre** http://localhost:3000
2. **Selecciona** "Recon Básico" → "Subfinder Rápido"
3. **Ingresa** "example.com" como target
4. **Click "Ejecutar"**
5. **Resultado**: Subdominios encontrados + análisis IA automático

**¡De 0 a resultados en menos de 5 minutos!**

---

## 🏗️ Arquitectura Inteligente

```
┌─────────────────────────────────────────────────────────────┐
│                    🖥️  DASHBOARD WEB                        │
│              (Interface Unificada - localhost:3000)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 🎯  OPS-CENTER (Node.js)                    │
│  • API REST completa    • WebSockets tiempo real            │
│  • Cola de jobs Redis   • Autenticación segura              │
│  • Playbooks workflow   • Análisis IA integrado             │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┼───────────┬───────────┬───────────┐
          │           │           │           │           │
          ▼           ▼           ▼           ▼           ▼
┌─────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐ ┌─────────┐
│  🕵️ OSINT   │ │  🕷️ WEB    │ │  📡 WIRELESS│ │  🤖 AI  │ │  📊 REDIS│
│   Tools     │ │  Pentest   │ │    Lab     │ │ OffSec  │ │  Queue  │
│             │ │            │ │            │ │         │ │         │
│ • Subfinder │ │ • Nmap     │ │ • Kismet   │ │ • Llama │ │ • Jobs   │
│ • Amass     │ │ • Nikto    │ │ • Aircrack │ │   3.2   │ │ • History│
│ • theHarv.  │ │ • SQLMap   │ │            │ │         │ │         │
└─────────────┘ └────────────┘ └────────────┘ └─────────┘ └─────────┘
                                                                │
                                                                ▼
                                                       ┌─────────┐
                                                       │  🧠 AI  │
                                                       │ Ollama  │
                                                       └─────────┘
```

### Servicios Especializados

| Servicio | Propósito | Tecnologías |
|----------|-----------|-------------|
| **ops-center** | Orquestación y API | Node.js, Express, Socket.IO |
| **osint-tools** | Reconocimiento pasivo | Python, Subfinder, Amass |
| **web-pentest** | Análisis de vulnerabilidades | Kali Linux, Nmap, SQLMap |
| **wireless-lab** | Seguridad WiFi | Kali Linux, Aircrack-ng |
| **ai-offsec** | Análisis inteligente | Python, Ollama API |
| **ollama** | Motor de IA | Llama 3.2, 4GB RAM |

---

## ✨ Características que Marcan la Diferencia

### 🎨 **Dashboard Revolucionario**
- **Glassmorphism Design**: Interfaz moderna y profesional
- **19 Herramientas Preconfiguradas**: Desde básico hasta avanzado
- **Tiempo Real**: Resultados streaming con WebSockets
- **Multi-Target**: Múltiples análisis simultáneos en tabs
- **Responsive**: Funciona en desktop, tablet y móvil

### 🤖 **IA que Entiende Seguridad**
```javascript
// Análisis automático post-ejecución
{
  "tool": "nmap",
  "severity": "HIGH",
  "recommendations": [
    "Puerto 3389 expuesto - considerar firewall",
    "Servicio SMB vulnerable - actualizar inmediatamente",
    "Vector de ataque probable: EternalBlue"
  ],
  "cvss_score": 8.5
}
```

### ⚡ **Playbooks para Automatización**
- **Domain Recon**: OSINT completo + Nmap
- **Web Vuln Scan**: Nikto + SQLMap + WPScan
- **Full Pipeline**: Recon → Scan → Vuln → Report
- **Stealth Mode**: Delays entre pasos para evadir detección

### 🔒 **Seguridad de Empresa**
- **Whitelist Commands**: Solo comandos autorizados
- **Authentication**: HTTP Basic Auth con roles
- **Audit Logging**: Todo se registra con usuario y timestamp
- **Container Isolation**: Cada herramienta en su propio contenedor

---

## 📊 Comparación con la Competencia

| Característica | OrcSOC | Otras Herramientas | Beneficio |
|----------------|--------|-------------------|-----------|
| **Unificación** | ✅ Todo en uno | ❌ Múltiples GUIs | Una interfaz |
| **IA Integrada** | ✅ Llama 3.2 | ❌ Manual analysis | Análisis inteligente |
| **Tiempo Real** | ✅ WebSockets | ❌ Polling | Experiencia fluida |
| **Playbooks** | ✅ Workflows | ❌ Scripts manuales | Automatización |
| **Setup** | ✅ 3 comandos | ❌ Horas de config | Productividad |
| **Escalabilidad** | ✅ Microservicios | ❌ Monolito | Performance |

---

## 🎓 ¿Para Quién Está Diseñado?

### 👨‍💻 **Pentesters Profesionales**
- Centraliza tu toolkit completo
- Acelera engagements con playbooks
- Reportes automáticos con IA

### 🏢 **Equipos Red Team**
- Orquestación de operaciones complejas
- Colaboración en tiempo real
- Escalabilidad para múltiples targets

### 🎓 **Estudiantes de Ciberseguridad**
- Aprendizaje interactivo con explicaciones
- Progreso de básico a avanzado
- Entorno seguro para practicar

### 🏭 **Empresas de Seguridad**
- Automatización de auditorías
- Consistencia en metodologías
- Reducción de tiempo y costos

---

## 🚀 Instalación

### Requisitos
- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **RAM**: 8GB mínimo (16GB recomendado)
- **Disco**: 10GB espacio libre
- **OS**: Linux o macOS

### Instalación Automática

```bash
# 1. Clonar
git clone https://github.com/felipeibarra-m2/OrcSOC.git
cd OrcSOC

# 2. Instalar
chmod +x install.sh
./install.sh

# 3. Primera ejecución (descarga modelo IA)
docker exec ollama ollama pull llama3.2
```

### Verificación

```bash
# Verificar servicios
curl http://localhost:3000/services/status

# Acceder al dashboard
open http://localhost:3000
```

---

## 💡 Primeros Pasos

### 1. Dashboard Principal
- Abre http://localhost:3000
- No requiere login (desarrollo)
- Interfaz intuitiva con categorías

### 2. Ejecutar Primer Comando
1. Click en "Recon Básico"
2. Selecciona "Subfinder Rápido"
3. Ingresa dominio (ej: example.com)
4. Click "Ejecutar"
5. Ve resultados en tiempo real

### 3. Explorar IA
- Todo resultado incluye análisis automático
- Pregunta a la IA sobre vulnerabilidades
- Obtén recomendaciones específicas

### 4. Usar Playbooks
- Workflows predefinidos para operaciones completas
- Desde reconocimiento hasta reporting
- Análisis IA integrado

---

## 📚 Documentación Completa

| Documento | Contenido |
|-----------|-----------|
| [📋 Casos de Uso](docs/casos-de-uso/) | 5 casos detallados con servicios |
| [🔧 Auto-Documentación](docs/codigo/) | Código documentado de cada servicio |
| [🎓 Glosario](docs/academico/glosario-academico.md) | Términos técnicos y conceptos |
| [📚 Áreas Conocimiento](docs/academico/areas-conocimiento.md) | Mapa curricular completo |
| [🔗 API Endpoints](ENDPOINTS.md) | Referencia completa de API |
| [🛠️ Troubleshooting](TROUBLESHOOTING.md) | Solución de problemas |

---

## 🔧 Administración

### Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f ops-center

# Reiniciar todo
docker-compose restart

# Limpiar completamente
./cleanup.sh --full
```

### Actualizaciones

```bash
# Actualizar herramientas
docker-compose pull && docker-compose up -d

# Actualizar modelo IA
docker exec ollama ollama pull llama3.2:latest
```

---

## 🛣️ Roadmap

### ✅ **Versión Actual (1.0)**
- 5 categorías de herramientas
- Dashboard moderno con IA
- Playbooks básicos
- Arquitectura microservicios

### 🚧 **Próximas Versiones**

#### **v1.1 - Enterprise Features**
- [ ] Autenticación JWT con roles
- [ ] Persistencia en PostgreSQL
- [ ] Exportación de reportes PDF
- [ ] API para integraciones

#### **v1.2 - Advanced Automation**
- [ ] Módulo Metasploit integrado
- [ ] Análisis de malware automático
- [ ] Integración con SIEM
- [ ] Dashboard de métricas Grafana

#### **v2.0 - AI Revolution**
- [ ] Modelos GPT-4/Claude integration
- [ ] Análisis predictivo de amenazas
- [ ] Automatización completa de red team
- [ ] Multi-tenancy para equipos

---

## ⚠️ Consideraciones Importantes

### 🔒 **Seguridad**
- **Uso Autorizado**: Solo en sistemas propios o con permiso explícito
- **Credenciales**: Cambia defaults en producción (`admin/password`)
- **Firewall**: No expongas puertos sin protección adicional

### 💾 **Recursos**
- **RAM**: Ollama requiere ~4GB para Llama 3.2
- **Disco**: Modelos IA ocupan ~2GB
- **CPU**: Operaciones intensivas durante análisis

### ⚖️ **Legal**
- **Compliance**: Cumple con leyes locales de ciberseguridad
- **Ética**: Uso responsable y profesional
- **Autorización**: Documenta siempre permisos de testing

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Formas de Contribuir
- 🐛 **Reportar Bugs**: Issues detallados con pasos para reproducir
- 💡 **Feature Requests**: Ideas para nuevas funcionalidades
- 🔧 **Code**: Pull requests con mejoras
- 📚 **Documentación**: Mejoras en docs y tutoriales

### Proceso
1. Fork el proyecto
2. Crea branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

---

## 📄 Licencia

**MIT License** - Software libre para la comunidad de ciberseguridad.

---

## 🙏 Agradecimientos

### Comunidad Open Source
- **ProjectDiscovery**: Subfinder y herramientas excepcionales
- **OWASP**: Metodologías y conciencia de seguridad
- **Ollama**: IA accesible para todos
- **Docker**: Revolución en desarrollo de software

### Colaboradores
- Comunidad de ciberseguridad que inspira innovación diaria
- Beta testers que mejoraron la plataforma
- Educadores que comparten conocimiento libremente

---

## 📞 Contacto

**Felipe Ibarra** - Creador de OrcSOC

- **GitHub**: [@felipeibarra-m2](https://github.com/felipeibarra-m2)
- **LinkedIn**: [Conectar profesionalmente](https://linkedin.com/in/felipeibarra)
- **Email**: felipe.ibarra.m2@gmail.com

---

<div align="center">

## 🎉 **¿Listo para revolucionar tus operaciones de ciberseguridad?**

**⭐ Star este repo si OrcSOC te ayuda en tu trabajo diario ⭐**

[🚀 Instalar Ahora](#-instalación) •
[📖 Leer Documentación](#-documentación-completa) •
[🐛 Reportar Issues](https://github.com/felipeibarra-m2/OrcSOC/issues)

---

**OrcSOC - Donde la ciberseguridad se encuentra con la inteligencia artificial**

</div>