
# OrcSOC: Enterprise Security Operations Center

OrcSOC es una plataforma integral y modular para operaciones de ciberseguridad ofensiva, OSINT y gestión de amenazas. Diseñada para SOCs, pentesters, equipos de red team y organizaciones de ciberseguridad que requieren automatización avanzada, análisis inteligente y escalabilidad empresarial.

## 🚀 Características Enterprise

### ✅ Mejoras Funcionales Implementadas
- **🔄 Automatización de Flujo Completo**: Pipeline OSINT → Recon → Puertos → Vulns con un clic
- **📚 Historial de Investigaciones**: Guarda objetivos, resultados y permite re-análisis instantáneo
- **📄 Reportes PDF Automáticos**: Generación de informes estructurados con hallazgos y recomendaciones
- **🌐 Integración con APIs Externas**: Shodan, Censys, HaveIBeenPwned, VirusTotal
- **🤖 Motor IA Avanzado**: Correlación de datos, priorización de riesgos y análisis predictivo

### 🎨 Mejoras de UI/UX Implementadas
- **📊 Dashboard SOC**: Vista tipo SOC con severidad total, puertos críticos, score de riesgo
- **📈 Indicadores de Progreso Reales**: Barras de progreso por módulo con estados en tiempo real
- **📊 Visualizaciones Avanzadas**:
  - Gráficos de puertos abiertos
  - Mapas de relaciones OSINT
  - Nubes de emails/dominios
  - Distribuciones de severidad
- **🎯 Navegación por Tabs**: Organización clara de funcionalidades

### 🛡️ Mejoras de Seguridad y OpSec Implementadas
- **👤 Modo Sigiloso**: Control de intensidad de escaneos con throttling y delays
- **📋 Logs Detallados y Exportables**: Registro completo de acciones con auditoría
- **🔒 Contenedores Aislados**: Cada herramienta en su propio entorno seguro

### ⚙️ Mejoras de Arquitectura Implementadas
- **🔄 Ejecuciones en Background**: Sistema de colas con Redis para procesamiento asíncrono
- **🔌 Sistema Modular/Plugin**: Arquitectura extensible para agregar nuevas herramientas
- **📈 Escalabilidad**: Diseño para entornos enterprise con múltiples usuarios

## 🏗️ Arquitectura Modular

```
OrcSOC Enterprise
├── 🎯 Ops Center (Node.js + Express)
│   ├── 🔌 Plugin System
│   ├── 📊 Dashboard & Metrics
│   ├── 📚 Investigation History
│   ├── 📄 PDF Reports
│   └── 🌐 External API Integrations
├── 🤖 AI-OffSec (Ollama + Llama3.2)
├── 🔍 OSINT Tools
├── 🕷️ Web Pentest
├── 📡 Wireless Lab
└── 📦 Redis (Queues & History)
```

## 🚀 Inicio Rápido

1. **Clonar y configurar**:
   ```bash
   git clone https://github.com/felipeibarra/OrcSOC.git
   cd OrcSOC
   ./install.sh
   ```

2. **Configurar APIs externas** (opcional):
   ```bash
   export SHODAN_API_KEY="your_key"
   export VIRUSTOTAL_API_KEY="your_key"
   # ... otros APIs
   ```

3. **Iniciar servicios**:
   ```bash
   docker-compose up -d
   ```

4. **Acceder**: [http://localhost:3000](http://localhost:3000)
   - Usuario: `admin`
   - Password: `password`

## 📊 Dashboard y Capacidades

### 🔍 Escaneo y Análisis
- **Pipeline Completo**: Ejecuta análisis OSINT → Recon → Puertos → Vulns automáticamente
- **Herramientas Integradas**: Subfinder, Amass, Nmap, Nikto, SQLMap, theHarvester
- **Análisis IA**: Correlación inteligente de resultados con recomendaciones
- **Modo Sigiloso**: Throttling y delays para evitar detección

### 📊 Visualizaciones y Métricas
- **Dashboard Ejecutivo**: KPIs de seguridad, tendencias y alertas
- **Gráficos Interactivos**: Chart.js para visualización de datos
- **Mapas de Relaciones**: D3.js para conexiones OSINT
- **Distribuciones de Riesgo**: Severidad y criticidad de hallazgos

### 📚 Gestión de Investigaciones
- **Historial Persistente**: Redis para almacenamiento de resultados
- **Re-ejecución**: Un clic para repetir análisis anteriores
- **Filtros Avanzados**: Por usuario, servicio, fecha y resultado
- **Exportación**: JSON y PDF de resultados históricos

### 🔌 Sistema de Plugins
- **Arquitectura Extensible**: Añade nuevas herramientas sin tocar el core
- **Plugins Incluidos**:
  - `advanced-subdomain-enum`: Enumeración avanzada con múltiples fuentes
  - `risk-correlator`: Correlación y evaluación de riesgos
- **API de Desarrollo**: Crea tus propios plugins fácilmente

### 🌐 Integraciones Externas
- **Shodan**: Búsqueda de dispositivos IoT y servicios expuestos
- **Censys**: Certificados y datos de ciberseguridad
- **HaveIBeenPwned**: Verificación de brechas de datos
- **VirusTotal**: Análisis de malware y URLs

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# APIs Externas
SHODAN_API_KEY=your_shodan_key
CENSYS_API_ID=your_censys_id
CENSYS_API_SECRET=your_censys_secret
HIBP_API_KEY=your_hibp_key
VIRUSTOTAL_API_KEY=your_vt_key

# Configuración de IA
OLLAMA_MODEL=llama3.2

# Configuración de Redis
REDIS_URL=redis://orcsoc-redis:6379

# Modo Sigiloso
STEALTH_MODE=true
STEALTH_DELAY=5000
```

### Desarrollo de Plugins
```javascript
// Ejemplo de plugin personalizado
module.exports = {
  name: 'my-custom-tool',
  version: '1.0.0',
  description: 'Mi herramienta personalizada',
  capabilities: ['recon', 'analysis'],
  
  async execute(target, options = {}) {
    // Lógica del plugin
    return {
      target,
      findings: [],
      risk_score: 5
    };
  }
};
```

## 📈 Métricas y Monitoreo

- **Investigaciones Totales**: Seguimiento de análisis realizados
- **Tasa de Éxito**: Porcentaje de escaneos exitosos
- **Tiempo Promedio**: Duración de ejecuciones
- **Objetivos Analizados**: Cobertura de superficie de ataque
- **Distribución de Severidad**: CRÍTICO/ALTO/MEDIO/BAJO

## 🔒 Seguridad y Cumplimiento

- **Contenedores Aislados**: Cada herramienta en su propio entorno
- **Autenticación**: Control de acceso basado en roles
- **Auditoría Completa**: Logs detallados de todas las acciones
- **Modo Sigiloso**: Técnicas para evitar detección
- **Validación de Comandos**: Whitelist de comandos permitidos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Comunidad de ciberseguridad por las herramientas open source
- Equipo de desarrollo por la arquitectura modular
- Usuarios por el feedback y contribuciones

---

**OrcSOC Enterprise**: Donde la ciberseguridad se encuentra con la automatización inteligente.
  - **osint-tools:** OSINT (ej. scraping, dominios).
  - **web-pentest:** Pentesting web (SQLi, XSS).
  - **wireless-lab:** Wireless (kismet, modo host).
  - **ai-offsec:** IA ofensiva (payloads, análisis).

Para casos de uso detallados, consulta `ARQUITECTURA_CASOS_USO.txt`.

## Estructura Modular (Ejemplo)
```yaml
version: "3.9"
services:
  ops-center:
    image: lissy93/dashy
    container_name: ops-center
    ports:
      - "8080:80"
    depends_on:
      - osint-tools
      - web-pentest
      - cti-misp
      - cti-opencti
    networks:
      - socnet
  osint-tools:
    build: ./docker/osint-tools
    container_name: osint-tools
    networks:
      - socnet
  web-pentest:
    build: ./docker/web-pentest
    container_name: web-pentest
    networks:
      - socnet
  wireless-lab:
    build: ./docker/wireless-lab
    container_name: wireless-lab
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
  cti-misp:
    image: misp/misp:latest
    container_name: misp
    networks:
      - socnet
  cti-opencti:
    image: opencti/platform:latest
    container_name: opencti
    networks:
      - socnet
  ai-offsec-kawaii:
    build: ./docker/kawaiigpt
    container_name: kawaii-gpt
    networks:
      - socnet
  ai-offsec-drana:
    build: ./docker/drana-infinity
    container_name: drana
    networks:
      - socnet
networks:
  socnet:
    driver: bridge
```

## Personalización y Escalabilidad
- Añade tus propias herramientas y scripts en los Dockerfile de cada módulo.
- Integra paneles, terminales web y APIs según tus necesidades.
- Cumple con requisitos legales y de licenciamiento en cada componente.

## Soporte y Comercialización
¿Quieres OrcSOC como producto llave en mano, consultoría, integración personalizada o soporte?

**Contáctanos:**
- Email: [tu-email@dominio.com]
- LinkedIn: [linkedin.com/in/felipeibarra]
- Web: [orcsoc.com] (próximamente)

Solicita una demo, cotización o integración a medida para tu empresa o equipo.

---

© 2025 Felipe Ibarra. Producto en desarrollo. Para uso legal y ético únicamente.