# Caso de Uso: Reconocimiento Básico y OSINT

## Descripción
Este caso de uso cubre la fase inicial de reconocimiento y recopilación de información de fuentes abiertas (OSINT) para un objetivo específico, típicamente un dominio o organización.

## Actores
- **Usuario Principal**: Pentesters, analistas de seguridad, investigadores OSINT
- **Sistema**: OrcSOC con servicios osint-tools y ops-center

## Precondiciones
- Sistema OrcSOC desplegado y funcionando
- Usuario con acceso al panel central (puerto 3000)
- Objetivo definido (dominio, IP, organización)

## Flujo Principal
1. Usuario accede al panel central de OrcSOC
2. Selecciona herramienta de reconocimiento básico
3. Ingresa el objetivo (dominio/IP)
4. Sistema ejecuta herramientas OSINT:
   - Subfinder para enumeración de subdominios
   - Amass para reconocimiento pasivo
   - WHOIS para información de registro
   - DNS enumeration
5. Resultados se muestran en tiempo real
6. Usuario puede exportar o analizar resultados

## Flujo Alternativo
- Si el objetivo es una IP: se ejecutan herramientas de geolocalización
- Si el objetivo es una organización: se incluyen búsquedas en fuentes públicas

## Poscondiciones
- Información de reconocimiento almacenada
- Resultados disponibles para análisis posterior
- Métricas de ejecución registradas

## Servicios Utilizados
- **ops-center**: Orquestación y UI
- **osint-tools**: Ejecución de herramientas OSINT
- **ai-offsec**: Análisis inteligente de resultados (opcional)

## Requisitos No Funcionales
- Tiempo de respuesta: < 30 segundos para consultas básicas
- Precisión: > 90% de cobertura de subdominios públicos
- Escalabilidad: Soporte para múltiples objetivos simultáneos

## Notas para Mejoras Futuras
- Integración con APIs comerciales (Shodan, Censys)
- Análisis automático de correlación entre hallazgos
- Dashboard de visualización de relaciones encontradas</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/casos-de-uso/caso-uso-reconocimiento-basico.md