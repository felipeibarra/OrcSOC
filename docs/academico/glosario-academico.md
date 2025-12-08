# Glosario Académico - OrcSOC

## Términos Técnicos y Conceptos

### A
**Aircrack-ng**: Suite de herramientas para auditoría de redes WiFi, incluyendo cracking de claves WEP/WPA, inyección de paquetes y análisis de redes wireless.

**AIS (Artificial Intelligence Systems)**: Sistemas de inteligencia artificial utilizados en OrcSOC para análisis inteligente de resultados de herramientas de seguridad.

**Amass**: Herramienta de enumeración de subdominios que utiliza múltiples fuentes OSINT para descubrir activos digitales de una organización.

**API (Application Programming Interface)**: Interfaz de programación de aplicaciones que permite la comunicación entre diferentes componentes de software.

**Autenticación**: Proceso de verificación de identidad de usuarios o sistemas, implementado en OrcSOC mediante HTTP Basic Auth.

### B
**Black-box Testing**: Metodología de testing donde el evaluador no tiene conocimiento interno del sistema bajo prueba.

**Brute Force**: Técnica de ataque que intenta todas las posibles combinaciones de credenciales o claves.

**Buffer Overflow**: Vulnerabilidad que ocurre cuando un programa escribe más datos en un buffer de los que puede contener.

### C
**CIA Triad**: Principios fundamentales de seguridad de la información: Confidencialidad, Integridad y Disponibilidad.

**Container Orchestration**: Gestión automatizada del despliegue, escalado y operación de contenedores, implementado con Docker Compose.

**Cross-Site Scripting (XSS)**: Vulnerabilidad web que permite inyectar scripts maliciosos en páginas web vistas por otros usuarios.

**CVSS (Common Vulnerability Scoring System)**: Sistema estándar para puntuar la severidad de vulnerabilidades de seguridad.

### D
**Directory Traversal**: Ataque que permite acceder a archivos y directorios fuera del directorio web raíz.

**Docker**: Plataforma de contenedorización utilizada para empaquetar y ejecutar aplicaciones en entornos aislados.

**DoS (Denial of Service)**: Ataque que busca hacer un servicio o recurso no disponible para sus usuarios legítimos.

### E
**Encryption**: Proceso de convertir información en un formato codificado para proteger su confidencialidad.

**Enumeration**: Proceso de recopilar información sobre usuarios, grupos, shares y servicios en un sistema objetivo.

**Exploit**: Código o técnica que toma ventaja de una vulnerabilidad para lograr un resultado no intencionado.

### F
**Firewall**: Sistema de seguridad de red que controla el tráfico entrante y saliente basado en reglas predefinidas.

**Footprinting**: Proceso inicial de recopilación de información sobre un objetivo, también conocido como reconnaissance.

**Full OSINT Enrichment**: Proceso completo de inteligencia de fuentes abiertas que combina múltiples herramientas para obtener información comprehensiva.

### G
**Gobuster**: Herramienta para fuerza bruta de directorios y subdominios web.

### H
**Hash Function**: Función matemática que convierte datos de tamaño variable en una cadena de tamaño fijo.

**Host-based IDS**: Sistema de detección de intrusiones que monitorea actividad en un host individual.

**HTTP Basic Authentication**: Método simple de autenticación HTTP que transmite credenciales en base64.

### I
**IDS (Intrusion Detection System)**: Sistema que monitorea actividad de red o sistema en busca de signos de intrusiones.

**Information Gathering**: Fase inicial de una evaluación de seguridad que involucra recopilar información sobre el objetivo.

**Injection Attack**: Tipo de ataque donde código malicioso es inyectado en una aplicación para ser ejecutado.

### J
**JSON (JavaScript Object Notation)**: Formato ligero de intercambio de datos, utilizado en OrcSOC para estructurar salidas de herramientas.

### K
**Kismet**: Herramienta para wardriving y análisis de redes wireless, capaz de detectar redes ocultas y dispositivos.

### L
**Llama 3.2**: Modelo de lenguaje de IA utilizado en OrcSOC para análisis inteligente de resultados de seguridad.

**Log Analysis**: Proceso de examinar logs del sistema en busca de indicadores de compromiso o actividad sospechosa.

### M
**Man-in-the-Middle (MitM)**: Ataque donde un atacante intercepta comunicaciones entre dos partes.

**Microservices Architecture**: Enfoque arquitectónico donde una aplicación se construye como colección de servicios pequeños e independientes.

**Modo Monitor**: Modo especial de interfaces wireless que permite capturar todos los paquetes sin estar asociado a una red.

### N
**Network Mapping**: Proceso de identificar y mapear la topología de red de una organización.

**Nikto**: Scanner web de código abierto que realiza pruebas comprehensivas contra servidores web.

**Nmap**: Herramienta de escaneo de puertos y discovery de servicios de red.

### O
**Offensive Security**: Disciplina de ciberseguridad enfocada en identificar y explotar vulnerabilidades desde la perspectiva del atacante.

**Open Source Intelligence (OSINT)**: Recopilación y análisis de información disponible públicamente.

**OWASP Top 10**: Lista de los 10 riesgos de seguridad de aplicaciones web más críticos según OWASP.

### P
**Packet Injection**: Técnica que permite enviar paquetes modificados o falsos en una red wireless.

**Penetration Testing**: Evaluación de seguridad simulando ataques reales contra sistemas, redes o aplicaciones.

**Playbook**: Conjunto predefinido de pasos automatizados para ejecutar tareas de seguridad específicas.

**Port Scanning**: Técnica para identificar puertos abiertos y servicios corriendo en un sistema objetivo.

**Privilege Escalation**: Proceso de obtener niveles más altos de acceso en un sistema comprometido.

### Q
**Queue System**: Sistema de colas utilizado en OrcSOC (Bull Queue con Redis) para manejar ejecución asincrónica de comandos.

### R
**Reconnaissance**: Fase de recopilación de información sobre un objetivo antes de un ataque.

**Red Team**: Equipo que simula ataques reales contra una organización para probar sus defensas.

**Redis**: Base de datos en memoria utilizada en OrcSOC para colas de jobs y almacenamiento temporal de historial.

### S
**Session Hijacking**: Ataque donde un atacante toma control de una sesión legítima de usuario.

**Shodan**: Motor de búsqueda para dispositivos conectados a internet, utilizado para reconnaissance.

**SIEM (Security Information and Event Management)**: Sistema que proporciona análisis en tiempo real de eventos de seguridad.

**Social Engineering**: Técnica de manipulación psicológica para obtener información confidencial.

**Socket.IO**: Librería para comunicación bidireccional en tiempo real, utilizada en OrcSOC para WebSocket.

**SQL Injection**: Ataque que permite ejecutar comandos SQL maliciosos en una base de datos a través de una aplicación web.

**SQLMap**: Herramienta automatizada para detectar y explotar vulnerabilidades SQL injection.

**Stealth Mode**: Modo de operación sigiloso que introduce delays entre acciones para evitar detección.

**Subdomain Enumeration**: Proceso de identificar subdominios válidos de un dominio principal.

**Subfinder**: Herramienta rápida para enumeración de subdominios utilizando múltiples fuentes.

### T
**TCP SYN Scan**: Tipo de escaneo de puertos que envía paquetes SYN para determinar si un puerto está abierto.

**TheHarvester**: Herramienta OSINT para recopilar emails, nombres de dominio y direcciones IP de diferentes fuentes públicas.

**Threat Intelligence**: Información sobre amenazas actuales y potenciales que ayuda a organizaciones a prepararse.

**Tokenization**: Proceso de reemplazar datos sensibles con tokens no sensibles.

### U
**UDP Scan**: Técnica de escaneo para identificar servicios UDP abiertos en un sistema.

### V
**Vulnerability Assessment**: Proceso sistemático de identificar, cuantificar y priorizar vulnerabilidades en un sistema.

**Vulnerability Scanner**: Herramienta automatizada que escanea sistemas en busca de vulnerabilidades conocidas.

### W
**Wardriving**: Práctica de buscar redes WiFi mientras se conduce, utilizando herramientas como Kismet.

**Web Application Firewall (WAF)**: Firewall especializado en proteger aplicaciones web contra ataques comunes.

**Web Content Discovery**: Proceso de identificar directorios, archivos y recursos ocultos en aplicaciones web.

**WebSocket**: Protocolo de comunicación bidireccional sobre TCP, utilizado en OrcSOC para actualizaciones en tiempo real.

**Whitelist**: Lista de comandos, IPs o acciones permitidas, utilizado en OrcSOC para validación de seguridad.

**Wireless Security**: Disciplina que se enfoca en proteger redes WiFi contra ataques como cracking de claves, rogue access points, etc.

**WordPress Scan**: Análisis especializado de instalaciones WordPress en busca de vulnerabilidades en plugins, temas y configuración.

**WPScan**: Herramienta especializada en escaneo de seguridad de WordPress.

### X
**XSS (Cross-Site Scripting)**: Vulnerabilidad que permite inyectar scripts en páginas web.

### Z
**Zero Day**: Vulnerabilidad desconocida para la que no existe un parche oficial.

## Áreas de Conocimiento

### 1. Ciberseguridad Ofensiva
- **Penetration Testing**: Metodologías y técnicas para testing de penetración
- **Vulnerability Assessment**: Evaluación sistemática de vulnerabilidades
- **Exploit Development**: Desarrollo de exploits para vulnerabilidades conocidas
- **Post-Exploitation**: Técnicas para mantener acceso y escalar privilegios

### 2. Inteligencia de Fuentes Abiertas (OSINT)
- **Passive Reconnaissance**: Recopilación de información sin interactuar con el objetivo
- **Social Media Intelligence**: Análisis de información en redes sociales
- **Technical Footprinting**: Mapeo técnico de infraestructura digital
- **Data Correlation**: Conexión de información de múltiples fuentes

### 3. Seguridad de Redes
- **Network Scanning**: Técnicas para mapear y analizar redes
- **Wireless Security**: Protección y ataque a redes WiFi
- **Firewall Analysis**: Evasión y bypass de controles de red
- **Traffic Analysis**: Inspección y manipulación de tráfico de red

### 4. Seguridad Web
- **Web Application Security**: Vulnerabilidades en aplicaciones web
- **API Security**: Protección de interfaces de programación
- **Database Security**: Protección contra ataques a bases de datos
- **Authentication Bypass**: Técnicas para evadir controles de acceso

### 5. Inteligencia Artificial en Seguridad
- **Threat Detection**: Uso de IA para identificar amenazas
- **Behavioral Analysis**: Análisis de comportamiento para detectar anomalías
- **Automated Analysis**: Procesamiento inteligente de resultados de seguridad
- **Risk Assessment**: Evaluación automática de riesgos

### 6. Arquitectura de Software Seguro
- **Secure Coding**: Prácticas para escribir código seguro
- **Container Security**: Seguridad en entornos contenerizados
- **Microservices Security**: Protección de arquitecturas distribuidas
- **API Security**: Diseño seguro de interfaces de programación

### 7. Gestión de Seguridad
- **Risk Management**: Identificación y mitigación de riesgos
- **Compliance Frameworks**: Cumplimiento con estándares de seguridad
- **Incident Response**: Respuesta a incidentes de seguridad
- **Security Operations**: Operaciones diarias de seguridad

### 8. Herramientas y Automatización
- **Security Tools**: Uso efectivo de herramientas de seguridad
- **Automation**: Automatización de tareas de seguridad
- **Scripting**: Desarrollo de scripts para tareas de seguridad
- **Integration**: Integración de múltiples herramientas

### 9. Aspectos Legales y Éticos
- **Legal Frameworks**: Marco legal de ciberseguridad
- **Ethical Hacking**: Principios éticos en hacking
- **Authorization**: Importancia de autorizaciones para testing
- **Responsible Disclosure**: Divulgación responsable de vulnerabilidades

### 10. Tendencias Emergentes
- **Cloud Security**: Seguridad en entornos cloud
- **IoT Security**: Seguridad de dispositivos IoT
- **AI/ML Security**: Seguridad de sistemas de IA
- **Quantum Computing Threats**: Amenazas de computación cuántica

## Referencias Académicas

### Estándares y Frameworks
- **NIST Cybersecurity Framework**: Framework comprehensivo para gestión de ciberseguridad
- **ISO 27001**: Estándar internacional para sistemas de gestión de seguridad de la información
- **OWASP Testing Guide**: Guía completa para testing de seguridad de aplicaciones web
- **PTES (Penetration Testing Execution Standard)**: Estándar para ejecución de penetration testing

### Certificaciones Recomendadas
- **CEH (Certified Ethical Hacker)**: Certificación en hacking ético
- **OSCP (Offensive Security Certified Professional)**: Certificación práctica en penetration testing
- **CISSP (Certified Information Systems Security Professional)**: Certificación en seguridad de sistemas de información
- **CompTIA Security+**: Certificación básica en ciberseguridad

### Recursos Educativos
- **OWASP WebGoat**: Aplicación vulnerable para aprendizaje práctico
- **HackTheBox**: Plataforma para práctica de penetration testing
- **TryHackMe**: Rooms interactivos para aprender ciberseguridad
- **SANS Institute**: Recursos avanzados en ciberseguridad</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/academico/glosario-academico.md