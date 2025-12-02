# Infraestructura de Código OrcSOC

## Arquitectura de Microservicios

OrcSOC está diseñado como un ecosistema de microservicios orquestados por un panel central interactivo. Cada módulo es un contenedor independiente, facilitando escalabilidad, aislamiento y mantenimiento.

### Microservicios Principales

- **ops-center**: Panel central interactivo (Node.js/Express) que orquesta los demás servicios vía APIs.
- **osint-tools**: Herramientas OSINT (Python).
- **web-pentest**: Herramientas de pentesting web (Kali Linux).
- **wireless-lab**: Herramientas wireless (Kali Linux, modo host).
- **ai-offsec**: Herramientas IA ofensivas (Python con PyTorch).
- **ollama**: Servicio de IA gratuita para asistente interactivo (modelos Llama).

### Orquestación

- Usa Docker Compose para definir y gestionar servicios.
- Red privada `socnet` para comunicación interna.
- Panel central expone APIs para ejecutar comandos en contenedores.

### Despliegue

1. Construir y lanzar: `docker-compose up --build`
2. Acceder al panel: http://localhost:3000 (con UI web interactiva)
3. Ejecutar comandos: Usa la interfaz web para enviar comandos a servicios o POST a /exec/{service} con JSON { "command": "tu_comando" }

### Dashboard
- UI web para ejecución de comandos con notificaciones.
- Información de uso integrada (ayuda, descripciones de servicios).
- Logs históricos con filtros, exportación y gestión de usuarios con roles.
- Asistente IA con Ollama para sugerencias en tiempo real, análisis automático de logs y alertas.
- Integración con herramientas externas vía APIs.
- Autenticación básica para seguridad.

### Escalabilidad y Seguridad

- Cada servicio es independiente, permitiendo escalado horizontal.
- Autenticación y logging recomendados para producción.
- Volúmenes para persistencia de datos.