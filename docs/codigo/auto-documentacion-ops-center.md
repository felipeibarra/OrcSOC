# Documentación Técnica - Servicio Ops-Center

## Descripción General

El servicio **ops-center** es el núcleo central de orquestación de OrcSOC, implementado como una aplicación Node.js/Express que proporciona una interfaz web unificada para la gestión y ejecución de herramientas de ciberseguridad. Actúa como el punto de control principal para coordinar múltiples servicios especializados.

## Arquitectura Técnica

### Tecnologías Principales
- **Framework**: Express.js con middleware avanzado
- **Tiempo Real**: Socket.IO para actualizaciones en vivo
- **Colas**: Bull Queue con Redis para procesamiento asíncrono
- **Autenticación**: HTTP Basic Auth con roles (admin/user)
- **Persistencia**: Redis para historial, archivos JSON para logs
- **Plugins**: Sistema extensible de plugins personalizables

### Componentes Arquitectónicos

#### 1. Servidor HTTP Principal (`app.js`)
```javascript
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
```

#### 2. Sistema de Colas con Redis
```javascript
const jobQueue = new Queue('orcsoc-jobs', {
  redis: {
    host: 'orcsoc-redis',
    port: 6379
  }
});
```

#### 3. Gestión de Plugins
```javascript
const pluginManager = new PluginManager();
```

## API Endpoints Principales

### Gestión de Comandos y Ejecución

#### POST `/exec/:service`
Ejecuta comandos validados en servicios específicos con sistema de colas.

**Parámetros**:
- `service`: Nombre del servicio contenedor
- `command`: Comando a ejecutar (validado por whitelist)

**Flujo de Ejecución**:
1. Validación de autenticación
2. Validación de comando contra whitelist
3. Encolamiento del job en Redis
4. Ejecución asíncrona con `docker exec`
5. Streaming de resultados via WebSocket
6. Persistencia de logs y historial

#### POST `/exec/template`
Ejecuta comandos predefinidos desde plantillas categorizadas.

**Plantillas Disponibles**:
- **Recon**: Enumeración de subdominios (Subfinder, Amass)
- **OSINT**: Inteligencia de fuentes abiertas
- **Escaneo**: Análisis de puertos con Nmap
- **Vulnerabilidades**: Detección con Nikto, SQLMap, WPScan
- **Emails**: Recolección con theHarvester

### Sistema de Playbooks

#### GET `/playbooks`
Retorna lista de playbooks disponibles con metadatos.

#### POST `/playbook/run`
Ejecuta workflows complejos de múltiples pasos.

**Características**:
- Ejecución secuencial de pasos
- Modo stealth con delays configurables
- Análisis IA automático opcional
- Agregación de resultados

### Inteligencia Artificial

#### POST `/ai-chat`
Interfaz de chat directo con modelos de IA (Llama 3.2).

#### POST `/analyze`
Análisis inteligente de resultados de herramientas.

**Prompts Especializados por Herramienta**:
- **Nmap**: Análisis de puertos con CVSS estimado
- **Subfinder**: Evaluación de subdominios críticos
- **Harvester**: Riesgo de ingeniería social
- **SQLMap**: Impacto de vulnerabilidades SQLi
- **Nikto**: Cumplimiento OWASP Top 10

### APIs Externas

#### GET `/api/external/:service/:target`
Integración con servicios externos de inteligencia.

**Servicios Soportados**:
- **Shodan**: Información de dispositivos conectados
- **Censys**: Datos de certificados y hosts
- **HaveIBeenPwned**: Verificación de brechas
- **VirusTotal**: Análisis de dominios/malware

### Dashboard y Métricas

#### GET `/dashboard/metrics`
Métricas agregadas para visualización en dashboard.

**Métricas Calculadas**:
- Total de investigaciones realizadas
- Tasa de éxito de escaneos
- Duración promedio de operaciones
- Distribución de severidad de hallazgos
- Uso por servicio y usuario

### Gestión de Logs y Historial

#### GET `/logs`
Consulta de logs con filtros avanzados.

**Filtros Disponibles**:
- Por usuario (auto-filtrado para no-admin)
- Por servicio específico
- Por fecha de ejecución

#### GET `/history`
Historial de investigaciones desde Redis.

#### POST `/history/replay/:id`
Re-ejecución de investigaciones previas.

### Sistema de Plugins

#### GET `/plugins`
Lista de plugins cargados dinámicamente.

#### POST `/plugins/execute`
Ejecución de plugins personalizados.

#### POST `/plugins/create`
Creación de templates de plugins (solo admin).

## Sistema de Seguridad

### Validación de Comandos
```javascript
const COMMAND_WHITELIST = {
  'osint-tools': [
    /^python tools\/\w+_wrapper\.py/,
    /^python tools\/enrich\.py/,
    /^whois [a-zA-Z0-9\.-]+$/,
    /^nslookup [a-zA-Z0-9\.-]+$/,
    /^dig [a-zA-Z0-9\.-]+$/
  ],
  // ... más servicios
};
```

### Caracteres Prohibidos
- Pipes (`|`) y redirecciones
- Punto y coma (`;`) para command injection
- Backticks y expansión de comandos
- Paréntesis y llaves para code injection

### Autenticación y Autorización
- **Basic Auth** con credenciales hardcodeadas
- **Roles**: `admin` (acceso completo), `user` (filtrado)
- **Filtrado automático** de datos sensibles por rol

## WebSocket y Tiempo Real

### Eventos Emitidos
```javascript
io.emit('job:start', { jobId, service, command });
io.emit('job:complete', { jobId, result, duration });
io.emit('job:error', { jobId, error: stderr });
```

### Suscripciones del Cliente
```javascript
socket.on('subscribe:jobs', () => {
  // Cliente suscrito a actualizaciones de jobs
});
```

## Persistencia de Datos

### Redis (Temporal)
- Historial de investigaciones (últimas 100)
- Estado de colas de jobs
- Caché de resultados recientes

### Sistema de Archivos
- `logs.json`: Logs estructurados con metadata
- `playbooks.json`: Definiciones de workflows
- Archivos de plugins en `/plugins/`

## Gestión de Recursos

### Límites de Buffer
- **Comandos**: 10MB de output máximo
- **Logs**: 5KB por entrada en historial
- **Análisis IA**: 60 segundos timeout

### Control de Concurrencia
- Jobs procesados secuencialmente por cola
- Límite de conexiones simultáneas
- Rate limiting implícito por diseño de colas

## Manejo de Errores

### Estrategias de Reintento
- **IA Chat**: 3 reintentos con backoff exponencial
- **Ejecución de Comandos**: Sin reintento (operaciones críticas)
- **APIs Externas**: Reintento con timeout progresivo

### Logging de Errores
```javascript
logs.push({
  timestamp: new Date().toISOString(),
  user,
  service,
  command,
  result: error.message,
  duration,
  jobId
});
```

## Escalabilidad y Rendimiento

### Optimizaciones Implementadas
- **Ejecución Asíncrona**: Jobs en background con Redis
- **Streaming**: Resultados en tiempo real via WebSocket
- **Caché**: Resultados recientes en Redis
- **Compresión**: Outputs truncados para eficiencia

### Limitaciones Conocidas
- **Memoria**: Buffer limitado a 10MB por comando
- **Concurrencia**: Procesamiento secuencial por servicio
- **Timeout**: 60 segundos máximo para operaciones IA

## Extensibilidad

### Sistema de Plugins
```javascript
class PluginManager {
  async loadPlugins() {
    // Carga dinámica desde directorio
  }
  
  async executePlugin(name, target, options) {
    // Ejecución sandboxed
  }
}
```

### Playbooks Configurables
- Definiciones JSON para workflows
- Variables template (`{{target}}`)
- Análisis IA opcional por playbook

## Monitoreo y Observabilidad

### Métricas de Salud
- Estado de servicios Docker
- Uptime y health checks
- Uso de recursos por contenedor

### Logs Estructurados
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "user": "admin",
  "service": "web-pentest",
  "command": "nmap -sV -F example.com",
  "result": "...",
  "duration": 15000,
  "jobId": "1640995200000"
}
```

## Consideraciones de Producción

### Configuración de Entorno
```bash
PORT=3000
REDIS_HOST=orcsoc-redis
SHODAN_API_KEY=...
CENSYS_API_KEY=...
```

### Seguridad en Producción
- Cambiar credenciales por defecto
- Implementar HTTPS/TLS
- Configurar firewall restrictivo
- Monitoreo de logs de seguridad

### Backup y Recuperación
- Persistencia de Redis en volúmenes
- Backup regular de logs.json
- Estrategia de recuperación de estado

## Roadmap de Mejoras

### Funcionalidades Planeadas
- [ ] Dashboard web completo con gráficos
- [ ] Autenticación OAuth/JWT
- [ ] API REST completa con documentación OpenAPI
- [ ] Workflows gráficos drag-and-drop
- [ ] Integración con SIEM/EDR externos

### Optimizaciones Técnicas
- [ ] Base de datos relacional para logs
- [ ] Caché distribuido (Redis Cluster)
- [ ] Load balancing horizontal
- [ ] Contenedores optimizados para performance</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/codigo/auto-documentacion-ops-center.md