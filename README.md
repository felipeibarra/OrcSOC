
# OrcSOC: Plataforma Integral para Operaciones de Seguridad Ofensiva y OSINT

OrcSOC es una solución modular y escalable para profesionales de ciberseguridad, pentesters y equipos SOC que buscan centralizar, automatizar y potenciar sus operaciones ofensivas y de inteligencia de amenazas (OSINT/CTI) en un entorno seguro y controlado.

## Beneficios Clave
- **Centralización total:** Accede a todas tus herramientas desde un único dashboard web.
- **Automatización y eficiencia:** Orquesta flujos de trabajo ofensivos y de inteligencia con IA y scripts avanzados.
- **Escalabilidad:** Añade o elimina módulos según tus necesidades (OSINT, pentesting, CTI, wireless, IA, etc.).
- **Seguridad y control:** Cada componente corre en contenedores aislados, minimizando riesgos y facilitando auditoría.
- **Listo para laboratorio, consultoría o producto comercial.**

## Casos de Uso
- SOCs y MSSPs que requieren un entorno ofensivo seguro y centralizado.
- Pentesters y Red Teams que buscan automatizar tareas y reportes.
- Investigadores OSINT/CTI que necesitan correlación avanzada y visualización.
- Formación y simulación en ciberseguridad ofensiva.

## Características Principales
- Dashboard web centralizado (ej. Dashy, Homer, panel propio).
- Integración de herramientas OSINT, CTI, pentesting web, wireless, IA ofensiva, etc.
- Orquestación vía Docker Compose: cada grupo de herramientas en su propio contenedor.
- Acceso a terminales web para ejecutar scripts de forma segura.
- Ejemplo de servicios integrables: MISP, OpenCTI, UrlChecker, HBSQLI, Kismet, KawaiiGPT, Drana-Infinity, DeepEye, entre otros.

## Guía Rápida de Uso
1. Clona el repositorio:
   ```bash
   git clone https://github.com/felipeibarra/OrcSOC.git
   cd OrcSOC
   ```
2. Ejecuta el script de instalación:
   ```bash
   ./install.sh
   ```
3. Accede al dashboard web en [http://localhost:3000](http://localhost:3000) (usuario: admin, password: password).
4. Usa la interfaz para orquestar comandos en los microservicios.

## Dashboard y Capacidades
El dashboard central es la interfaz principal para interactuar con OrcSOC. Incluye:
- **Ejecución de Comandos:** Envía comandos a microservicios como osint-tools, web-pentest, wireless-lab y ai-offsec.
- **Resultados en Tiempo Real:** Visualiza salidas de comandos directamente en la web.
- **Logs Históricos con Filtros y Exportación:** Accede a historial con filtros; exporta logs en JSON.
- **Gestión de Usuarios con Roles:** Autenticación básica con roles (admin: acceso total, user: acceso limitado).
- **Notificaciones:** Alertas para éxito/error en ejecuciones.
- **Asistente IA con Ollama:** Chat interactivo y análisis automático de logs para proponer mejoras en procesos en tiempo real.
- **Alertas Automáticas:** Genera alertas basadas en logs usando IA para detectar anomalías.
- **Integración con Herramientas Externas:** Envía datos a APIs externas (ej. webhooks).
- **Información Integrada:** Sección de ayuda con descripciones de servicios y ejemplos de uso.
- **Seguridad:** Autenticación básica; comandos en contenedores aislados.
- **Microservicios:**
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