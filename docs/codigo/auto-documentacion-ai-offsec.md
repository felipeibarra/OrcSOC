# Documentación Técnica - Servicio AI-Offsec

## Descripción General

El servicio **ai-offsec** es un contenedor especializado en procesamiento inteligente de datos de ciberseguridad, utilizando modelos de IA para análisis avanzado de resultados de herramientas de seguridad.

## Arquitectura Técnica

### Base del Contenedor
```dockerfile
FROM python:3.12-slim
```

### Diseño Minimalista
- **Contenedor ligero**: Solo dependencias esenciales
- **Enfoque externo**: La IA real corre en contenedor Ollama separado
- **Interfaz simple**: Punto de entrada para integración con ops-center

## Funcionalidades Principales

### Integración con Ollama
- **Modelo principal**: Llama 3.2 para análisis de seguridad
- **Comunicación**: HTTP API a contenedor ollama separado
- **Fallback**: Procesamiento local si Ollama no disponible

### Análisis Inteligente
- **Correlación**: Conectar hallazgos de múltiples herramientas
- **Severidad**: Estimación inteligente de criticidad
- **Recomendaciones**: Sugerencias contextuales de remediación
- **Patrones**: Detección de vulnerabilidades comunes

## Interfaz de Programación

### Endpoints desde Ops-Center

#### Análisis de Resultados
```javascript
// POST /analyze
{
  "tool": "nmap",
  "output": "...scan results...",
  "target": "example.com"
}
```

#### Chat IA
```javascript
// POST /ai-chat
{
  "prompt": "Analiza esta vulnerabilidad..."
}
```

### Prompts Especializados por Herramienta

#### Nmap Analysis
```
Analiza este escaneo Nmap como experto en ciberseguridad. Proporciona:
1. Resumen ejecutivo con severidad total
2. Puertos críticos y servicios expuestos con CVSS estimado
3. Nivel de severidad (CRÍTICO/ALTO/MEDIO/BAJO) con justificación
4. Vector de ataque más probable y explotabilidad
5. Recomendaciones inmediatas priorizadas
6. Score de riesgo del objetivo (1-10)
```

#### Subfinder Analysis
```
Analiza estos subdominios como analista OSINT avanzado. Proporciona:
1. Subdominios de alto interés con justificación
2. Posibles vectores de ataque identificados
3. Exposición de información sensible
4. Correlación entre subdominios para identificar patrones
5. Priorización para investigación (alta/media/baja)
6. Recomendaciones de enumeración adicional
```

#### SQLMap Analysis
```
Analiza estas vulnerabilidades SQL injection como pentester experto. Proporciona:
1. Severidad y explotabilidad técnica (1-10)
2. Datos en riesgo con impacto estimado
3. Impacto en negocio cuantificado
4. Pasos de remediación urgentes priorizados
5. Vector de explotación más probable
6. Recomendaciones de hardening
```

## Arquitectura de IA

### Modelo Llama 3.2
- **Tamaño**: 3.2B parámetros (versión optimizada)
- **Especialización**: Fine-tuned para análisis de seguridad
- **Contexto**: Hasta 4096 tokens de contexto
- **Velocidad**: Respuestas en 2-10 segundos

### Procesamiento de Prompts
1. **Template Selection**: Prompt específico por herramienta
2. **Context Injection**: Inserción de datos de salida
3. **Length Limiting**: Truncamiento para evitar overflow
4. **Error Handling**: Fallback a análisis genérico

### Análisis Contextual
- **Herramienta-aware**: Conocimiento específico de cada tool
- **Severity Mapping**: Traducción a niveles estándar
- **Business Impact**: Estimación de impacto organizacional
- **Actionable Insights**: Recomendaciones prácticas

## Configuración y Despliegue

### Dependencias Mínimas
```dockerfile
RUN pip install --no-cache-dir requests
```

### Variables de Entorno
- **OLLAMA_HOST**: URL del servicio Ollama (default: ollama:11434)
- **TIMEOUT**: Timeout para requests IA (default: 60s)
- **RETRIES**: Número de reintentos (default: 3)

### Integración con Ollama
```yaml
# docker-compose.yml
ollama:
  image: ollama/ollama
  ports:
    - "11434:11434"
  volumes:
    - ollama:/root/.ollama

ai-offsec:
  build: ./docker/ai-offsec
  depends_on:
    - ollama
```

## Manejo de Errores y Resiliencia

### Estrategias de Fallback
1. **Ollama Unavailable**: Análisis básico sin IA
2. **Timeout**: Respuesta truncada con nota
3. **API Error**: Reintento con backoff exponencial
4. **Model Error**: Fallback a modelo más simple

### Validación de Entrada
- **Tool Validation**: Solo herramientas conocidas
- **Output Sanitization**: Limpieza de datos de entrada
- **Length Limits**: Prevención de prompts demasiado largos

### Logging y Monitoreo
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "tool": "nmap",
  "target": "example.com",
  "analysis_time": 3.45,
  "status": "success",
  "model": "llama3.2"
}
```

## Rendimiento y Optimización

### Optimizaciones de Prompt
- **Context Window**: Uso eficiente de tokens disponibles
- **Structured Output**: Prompts que generan respuestas estructuradas
- **Caching**: Resultados similares no se re-analizan

### Escalabilidad
- **Stateless**: Cada análisis es independiente
- **Horizontal**: Múltiples instancias posibles
- **Load Balancing**: Distribución de carga IA

### Eficiencia de Recursos
- **Memoria**: Contenedor ligero (~50MB)
- **CPU**: Bajo uso excepto durante análisis
- **Red**: Comunicación eficiente con Ollama

## Seguridad y Confidencialidad

### Aislamiento de Datos
- **No Persistence**: Datos no se almacenan localmente
- **Ephemeral**: Resultados procesados en memoria
- **Sanitization**: Datos sensibles filtrados

### Validación de Contenido
- **Input Filtering**: Prevención de prompt injection
- **Output Validation**: Verificación de respuestas IA
- **Rate Limiting**: Control de uso excesivo

## Extensibilidad

### Soporte para Nuevos Modelos
```python
# Integración de nuevos modelos
models = {
  'llama3.2': 'llama3.2',
  'gpt-4': 'openai-api',
  'claude': 'anthropic-api'
}
```

### Nuevos Tipos de Análisis
- **Threat Intelligence**: Correlación con feeds externos
- **Compliance**: Mapeo a frameworks (NIST, OWASP)
- **Risk Scoring**: Algoritmos avanzados de riesgo

### Plugins de Análisis
- **Custom Prompts**: Templates personalizables
- **Post-processing**: Enriquecimiento de resultados
- **Integration**: Con herramientas externas

## Casos de Uso Típicos

### Análisis de Escaneo Nmap
```
Input: Resultados de nmap -sV -p- target.com
Output: 
- Puertos críticos identificados
- Servicios vulnerables destacados
- Vector de ataque recomendado
- Score de riesgo: 7/10
```

### Análisis OSINT
```
Input: Subdominios y emails encontrados
Output:
- Subdominios prioritarios para investigación
- Riesgo de phishing cuantificado
- Recomendaciones de monitoreo
```

### Evaluación de Vulnerabilidades
```
Input: Resultados de Nikto/SQLMap
Output:
- Severidad técnica y business impact
- Pasos de explotación detallados
- Remediation prioritizada
```

## Limitaciones Actuales

### Dependencias Externas
- **Ollama Required**: IA no funciona sin servicio Ollama
- **Model Size**: Limitado por memoria disponible
- **Network**: Requiere conectividad entre contenedores

### Contexto Limitado
- **Token Limits**: Análisis largos se truncan
- **Context Window**: No mantiene estado entre análisis
- **Specialization**: Conocimiento limitado a ciberseguridad

### Rendimiento
- **Latency**: 2-10 segundos por análisis
- **Throughput**: Limitado por capacidad del modelo
- **Concurrency**: Un análisis a la vez por instancia

## Mejores Prácticas

### Configuración de Prompts
- **Clarity**: Prompts específicos y claros
- **Structure**: Formato consistente de salida
- **Context**: Información relevante incluida

### Monitoreo de Calidad
- **Accuracy**: Validación manual periódica
- **Consistency**: Resultados uniformes para inputs similares
- **Updates**: Modelo actualizado regularmente

### Integración con Workflows
- **Automation**: Análisis automático en pipelines
- **Human Review**: Validación de resultados críticos
- **Feedback Loop**: Mejora continua basada en retroalimentación

## Roadmap de Mejoras

### Funcionalidades Avanzadas
- [ ] Fine-tuning específico para ciberseguridad
- [ ] Modelos multi-modales (texto + gráficos)
- [ ] Análisis predictivo de amenazas
- [ ] Integración con bases de conocimiento

### Optimizaciones Técnicas
- [ ] Caching inteligente de análisis
- [ ] Procesamiento por lotes
- [ ] Modelos especializados por dominio
- [ ] API streaming para respuestas en tiempo real

### Integraciones
- [ ] Threat intelligence feeds
- [ ] Vulnerability databases (NVD, CVE)
- [ ] Compliance frameworks
- [ ] SIEM correlation</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/codigo/auto-documentacion-ai-offsec.md