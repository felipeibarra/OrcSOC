# Documentación Técnica - Servicio OSINT-Tools

## Descripción General

El servicio **osint-tools** es un contenedor especializado en herramientas de Inteligencia de Fuentes Abiertas (OSINT), implementado en Python 3.12 con integración de múltiples herramientas especializadas para reconnaissance y enumeración.

## Arquitectura Técnica

### Base del Contenedor
```dockerfile
FROM python:3.12-slim
```

### Herramientas Instaladas

#### Herramientas de Sistema
- **dnsutils**: `nslookup`, `dig` para resolución DNS
- **whois**: Consultas de registro de dominios
- **nmap**: Escaneo de puertos y servicios
- **golang-go**: Para compilación de herramientas Go

#### Herramientas OSINT Especializadas

##### Subfinder
```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```
- **Propósito**: Enumeración rápida de subdominios
- **Fuentes**: Múltiples fuentes pasivas (certificados, DNS, etc.)
- **Salida**: JSON estructurado con subdominios únicos

##### Amass
```bash
wget https://github.com/owasp-amass/amass/releases/download/v4.2.0/amass_Linux_amd64.zip
```
- **Propósito**: Enumeración exhaustiva de subdominios
- **Características**: Análisis activo y pasivo, correlación de datos
- **Modos**: Pasivo (sin tocar objetivo), activo (brute force)

##### theHarvester
```bash
git clone https://github.com/laramies/theHarvester.git /opt/theHarvester
```
- **Propósito**: Recolección de emails y información de contacto
- **Fuentes**: Motores de búsqueda (Google, Bing, Yahoo, etc.)
- **Salida**: Emails, hosts, IPs, URLs relacionadas

### Dependencias Python
```python
pip install --no-cache-dir \
    requests \
    beautifulsoup4 \
    dnspython \
    shodan \
    aiodns aiofiles aiohttp aiomultiprocess \
    aiosqlite beautifulsoup4 censys certifi \
    dnspython lxml netaddr plotly pyppeteer \
    python-dateutil pyyaml requests retrying \
    shodan ujson uvloop
```

## Scripts de Integración

### Arquitectura de Wrappers

Cada herramienta tiene un wrapper Python que:
1. **Ejecuta** la herramienta externa
2. **Parsea** la salida (JSON cuando posible)
3. **Estructura** los resultados en formato JSON consistente
4. **Maneja errores** y timeouts apropiadamente

#### Patrón Común de Wrappers
```python
def run_tool(target):
    try:
        cmd = ["tool", "args", target]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=TIMEOUT)
        
        # Parse output
        parsed_data = parse_output(result.stdout)
        
        return {
            "tool": "ToolName",
            "target": target,
            "status": "success",
            "results": parsed_data
        }
    except Exception as e:
        return {
            "tool": "ToolName", 
            "status": "error", 
            "error": str(e)
        }
```

### Orchestrator Principal: `enrich.py`

#### Funcionalidad Core
```python
def enrich_domain(domain, level="full"):
    """Run comprehensive domain reconnaissance"""
```

#### Niveles de Reconocimiento

##### Nivel "basic"
- **whois**: Información de registro del dominio
- **nslookup**: Resolución DNS básica
- **Tiempo estimado**: 30-60 segundos

##### Nivel "full"
- **subfinder**: Enumeración de subdominios
- **harvester**: Recolección de emails
- **whois**: Información de registro
- **nslookup**: Resolución DNS
- **Tiempo estimado**: 3-5 minutos

#### Ejecución Paralela
```python
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    future_to_tool = {executor.submit(tools[name]): name for name in tools}
```

#### Agregación de Resultados
```python
results["aggregated"] = {
    "subdomains": list(all_subdomains),
    "emails": list(all_emails),
    "ips": list(all_ips),
    "summary": {
        "total_subdomains": len(all_subdomains),
        "total_emails": len(all_emails),
        "total_ips": len(all_ips)
    }
}
```

### Wrappers Especializados

#### `subfinder_wrapper.py`
```bash
subfinder -d {domain} -silent -json
```
**Características**:
- Modo silencioso para integración
- Salida JSON nativa
- Detección automática de formato
- Eliminación de duplicados

#### `amass_wrapper.py`
```bash
amass enum -d {domain} -passive
# o
amass enum -d {domain} -active
```
**Modos**:
- **Pasivo**: Sin interacción con objetivo
- **Activo**: Brute force de subdominios

#### `harvester_wrapper.py`
```bash
python /opt/theHarvester/theHarvester.py -d {domain} -l 500 -b google,bing,yahoo
```
**Configuración**:
- Límite de resultados por fuente
- Múltiples motores de búsqueda
- Timeout configurable

## API de Integración

### Interfaz de Comando

#### Dominios
```bash
# Reconocimiento básico
python tools/enrich.py --target example.com --type domain --level basic

# Reconocimiento completo
python tools/enrich.py --target example.com --type domain --level full

# Subdominios específicos
python tools/subfinder_wrapper.py --domain example.com

# Emails específicos
python tools/harvester_wrapper.py --domain example.com --sources google,bing
```

#### IPs
```bash
python tools/enrich.py --target 192.168.1.1 --type ip
```

### Formato de Salida JSON

#### Estructura Estándar
```json
{
  "tool": "Subfinder",
  "target": "example.com",
  "status": "success",
  "results": {
    "subdomains": ["www.example.com", "api.example.com"],
    "count": 2
  }
}
```

#### Estructura de Enrich (Agregada)
```json
{
  "target": "example.com",
  "type": "domain",
  "level": "full",
  "tools_executed": [
    {
      "tool": "subfinder",
      "status": "success",
      "output": { "subdomains": [...], "count": 15 }
    }
  ],
  "aggregated": {
    "subdomains": ["sub1.example.com", "sub2.example.com"],
    "emails": ["admin@example.com"],
    "ips": ["1.2.3.4"],
    "summary": {
      "total_subdomains": 15,
      "total_emails": 3,
      "total_ips": 2
    }
  }
}
```

## Manejo de Errores y Timeouts

### Timeouts por Herramienta
- **Subfinder**: 180 segundos
- **Amass**: 300 segundos (pasivo), 600 segundos (activo)
- **theHarvester**: 300 segundos
- **whois/nslookup**: 30 segundos

### Estrategias de Recuperación
- **Continuación**: Si una herramienta falla, las demás continúan
- **Logging**: Errores registrados pero no bloquean el flujo
- **Fallback**: Parsing alternativo si JSON falla

### Validación de Salida
```python
try:
    tool_output = json.loads(result.stdout)
except:
    tool_output = {"raw": result.stdout[:500]}
```

## Optimizaciones de Performance

### Paralelización
- **ThreadPoolExecutor**: Máximo 4 workers simultáneos
- **Timeouts independientes**: Cada herramienta tiene su límite
- **Recursos limitados**: Evita sobrecarga del sistema

### Eficiencia de Memoria
- **Streams**: Procesamiento de salida en chunks
- **Limits**: Resultados truncados a límites razonables
- **Cleanup**: Eliminación automática de procesos hijos

## Seguridad y Sandboxing

### Validación de Entrada
- **Dominios**: Regex para formato válido
- **Timeouts**: Prevención de procesos colgantes
- **Comandos**: Sanitización de parámetros

### Aislamiento
- **Contenedor**: Ejecución sandboxed
- **Red**: Acceso controlado a internet
- **Filesystem**: Solo acceso a directorios necesarios

## Métricas y Monitoreo

### Indicadores de Salud
- **Disponibilidad**: Herramientas instaladas correctamente
- **Performance**: Tiempo de respuesta por herramienta
- **Éxito**: Tasa de éxito de ejecuciones

### Logs de Ejecución
```json
{
  "tool": "subfinder",
  "target": "example.com",
  "status": "success",
  "timestamp": "2024-01-01T00:00:00Z",
  "duration": 45.2,
  "results_count": 23
}
```

## Extensibilidad

### Adición de Nuevas Herramientas
1. **Instalación**: Agregar al Dockerfile
2. **Wrapper**: Crear script Python con interfaz estándar
3. **Integración**: Agregar al orchestrator `enrich.py`
4. **Testing**: Validar formato de salida y manejo de errores

### Configuración Personalizable
- **Fuentes**: Selección de motores de búsqueda por herramienta
- **Límites**: Configuración de timeouts y límites de resultados
- **Modos**: Niveles de agresividad (pasivo/activo)

## Casos de Uso Típicos

### Reconocimiento Inicial
```bash
python tools/enrich.py --target target.com --level basic
```
**Resultado**: Información básica de dominio en 30 segundos

### Enumeración Exhaustiva
```bash
python tools/enrich.py --target target.com --level full
```
**Resultado**: Subdominios, emails, IPs agregados en 3-5 minutos

### Investigación Específica
```bash
python tools/subfinder_wrapper.py --domain target.com
python tools/harvester_wrapper.py --domain target.com --sources all
```
**Resultado**: Datos especializados por herramienta

## Limitaciones Conocidas

### Dependencias Externas
- **Internet**: Requiere conectividad para consultas DNS y OSINT
- **APIs**: Algunas herramientas requieren API keys (Shodan, etc.)
- **Rate Limits**: Posibles bloqueos por uso intensivo

### Rendimiento
- **Tiempo**: Herramientas completas pueden tomar varios minutos
- **Recursos**: Uso intensivo de CPU durante ejecución paralela
- **Memoria**: Almacenamiento de resultados en memoria

### Cobertura
- **Fuentes**: Limitado a herramientas open source
- **Actualización**: Herramientas requieren actualización manual
- **Idiomas**: Soporte limitado para dominios no-latinos</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/codigo/auto-documentacion-osint-tools.md