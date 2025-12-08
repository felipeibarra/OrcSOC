# Casos de Uso Consolidados - OrcSOC

Este documento consolida todos los casos de uso del proyecto OrcSOC, listando para cada uno los servicios backend involucrados, actores, y referencias a archivos de documentación detallada.

## Resumen Ejecutivo

OrcSOC es una plataforma de orquestación de herramientas de ciberseguridad que integra OSINT, pentesting web, análisis wireless y capacidades de IA. Los casos de uso están diseñados para cubrir el ciclo completo de operaciones de seguridad ofensiva.

## Matriz de Casos de Uso y Servicios

| Caso de Uso | Archivo Detallado | Servicios Utilizados | Actores Principales | Complejidad |
|-------------|-------------------|---------------------|-------------------|-------------|
| Reconocimiento Básico | `caso-uso-reconocimiento-basico.md` | ops-center, osint-tools, ai-offsec | Pentesters, Analistas OSINT | Baja |
| Análisis Vulnerabilidades Web | `caso-uso-analisis-vulnerabilidades-web.md` | ops-center, web-pentest, ai-offsec, osint-tools | Pentesters Web, Auditores | Media |
| Seguridad Wireless | `caso-uso-seguridad-wireless.md` | wireless-lab, ops-center, ai-offsec | Especialistas Wireless | Alta |
| Análisis con IA | `caso-uso-analisis-ia.md` | ai-offsec, ops-center, [todos] | Analistas Avanzados | Media |
| Orquestación Operaciones | `caso-uso-orquestacion-operaciones.md` | [todos los servicios] | Red Team Leaders | Alta |

## Detalle por Caso de Uso

### 1. Reconocimiento Básico y OSINT
**Descripción**: Fase inicial de recopilación de información pública sobre objetivos.

**Servicios Utilizados**:
- **ops-center**: Interfaz de usuario y orquestación
- **osint-tools**: Ejecución de herramientas OSINT (Subfinder, Amass, WHOIS)
- **ai-offsec**: Análisis contextual de resultados (opcional)

**Actores**: Pentesters, investigadores OSINT, analistas de seguridad.

**Referencia**: `caso-uso-reconocimiento-basico.md`

### 2. Análisis de Vulnerabilidades Web
**Descripción**: Detección automatizada de vulnerabilidades en aplicaciones web.

**Servicios Utilizados**:
- **ops-center**: Control y visualización de resultados
- **web-pentest**: Herramientas de pentesting (Nmap, Nikto, SQLMap, WPScan)
- **ai-offsec**: Análisis inteligente y recomendaciones de explotación
- **osint-tools**: Información complementaria del objetivo

**Actores**: Pentesters web, auditores de seguridad, equipos red team.

**Referencia**: `caso-uso-analisis-vulnerabilidades-web.md`

### 3. Seguridad Wireless
**Descripción**: Análisis de seguridad en redes WiFi y dispositivos wireless.

**Servicios Utilizados**:
- **wireless-lab**: Contenedor con herramientas wireless (Kismet, Aircrack-ng)
- **ops-center**: Interfaz de control y resultados
- **ai-offsec**: Análisis de vulnerabilidades y recomendaciones

**Actores**: Especialistas en wireless, pentesters especializados.

**Referencia**: `caso-uso-seguridad-wireless.md`

### 4. Análisis Inteligente con IA
**Descripción**: Procesamiento inteligente de resultados con modelos de IA.

**Servicios Utilizados**:
- **ai-offsec**: Motor principal de IA (PyTorch, transformers, llama3.2)
- **ops-center**: Interfaz para consultas y visualización
- **[Todos los servicios]**: Proporcionan datos de entrada para análisis

**Actores**: Analistas avanzados, investigadores de seguridad.

**Referencia**: `caso-uso-analisis-ia.md`

### 5. Orquestación de Operaciones
**Descripción**: Coordinación de múltiples herramientas en workflows complejos.

**Servicios Utilizados**:
- **ops-center**: Control central y coordinación
- **osint-tools**: Fase de reconocimiento
- **web-pentest**: Análisis de vulnerabilidades
- **wireless-lab**: Seguridad wireless
- **ai-offsec**: Análisis inteligente y correlación

**Actores**: Líderes de red team, analistas SOC, coordinadores de operaciones.

**Referencia**: `caso-uso-orquestacion-operaciones.md`

## Arquitectura de Servicios

### Servicios Core
- **ops-center**: Node.js/Express, puerto 3000, API REST para orquestación
- **osint-tools**: Python 3.12, herramientas OSINT, ejecución CLI
- **web-pentest**: Kali Linux, herramientas de pentesting web
- **wireless-lab**: Kali Linux, herramientas wireless, modo host
- **ai-offsec**: Python con PyTorch, modelos de IA para análisis

### Servicios de Soporte
- **nginx**: Proxy reverso para acceso web
- **cti-stack**: (En desarrollo) Stack de inteligencia de amenazas

## Tecnologías Utilizadas

### Lenguajes de Programación
- **JavaScript/Node.js**: API y lógica de negocio (ops-center)
- **Python**: Servicios de IA y herramientas especializadas
- **Bash**: Scripts de automatización y configuración

### Frameworks y Librerías
- **Express.js**: Framework web para APIs
- **PyTorch**: Framework de machine learning
- **Transformers**: Librería para modelos de lenguaje
- **Docker Compose**: Orquestación de contenedores

### Herramientas de Seguridad
- **Nmap**: Escaneo de puertos y servicios
- **Nikto**: Scanner de vulnerabilidades web
- **SQLMap**: Testing de inyección SQL
- **WPScan**: Scanner de WordPress
- **Kismet/Aircrack-ng**: Herramientas wireless
- **Subfinder/Amass**: Enumeración de subdominios

## Métricas de Uso

### Por Servicio
- **ops-center**: Punto central, usado en 100% de operaciones
- **osint-tools**: 80% de casos (reconocimiento inicial)
- **web-pentest**: 60% de casos (aplicaciones web)
- **wireless-lab**: 30% de casos (entornos con WiFi)
- **ai-offsec**: 70% de casos (análisis inteligente)

### Por Tipo de Operación
- **Reconocimiento**: 85% OSINT + 15% IA
- **Pentesting Web**: 70% herramientas + 30% IA
- **Wireless**: 90% herramientas especializadas + 10% IA
- **Orquestación**: 100% todos los servicios integrados

## Consideraciones para Desarrollo

### Escalabilidad
- Servicios independientes permiten escalado horizontal
- Docker Compose facilita despliegue en múltiples hosts
- Volúmenes persistentes para datos críticos

### Seguridad
- Contenedores aislados reducen superficie de ataque
- Variables de entorno para credenciales sensibles
- Modo host solo donde es estrictamente necesario

### Mantenibilidad
- Arquitectura modular facilita actualizaciones
- Documentación detallada por componente
- Casos de uso bien definidos permiten testing

## Próximas Mejoras

### Funcionalidades
- [ ] Dashboard web completo con visualizaciones
- [ ] API REST completa para integraciones
- [ ] Workflows gráficos personalizables
- [ ] Integración con SIEM externos

### Servicios
- [ ] cti-stack: Inteligencia de amenazas
- [ ] forensics-lab: Análisis forense
- [ ] cloud-pentest: Testing en entornos cloud

### IA y Automatización
- [ ] Modelos más avanzados (GPT-4, Claude)
- [ ] Aprendizaje continuo de patrones
- [ ] Automatización de reportes ejecutivos</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/casos-de-uso/consolidado-casos-uso-servicios.md