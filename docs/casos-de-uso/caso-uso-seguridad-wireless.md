# Caso de Uso: Análisis de Seguridad Wireless

## Descripción
Este caso de uso permite analizar la seguridad de redes WiFi, incluyendo detección de redes, análisis de protocolos de seguridad, y pruebas de penetración en redes wireless.

## Actores
- **Usuario Principal**: Especialistas en wireless, pentesters
- **Sistema**: OrcSOC con servicio wireless-lab

## Precondiciones
- Hardware WiFi compatible disponible
- Sistema OrcSOC desplegado
- Modo monitor disponible en la interfaz wireless
- Usuario con privilegios adecuados

## Flujo Principal
1. Usuario inicia sesión en el sistema
2. Selecciona módulo de análisis wireless
3. Sistema configura interfaz en modo monitor
4. Ejecuta escaneo de redes disponibles:
   - Detección de SSID y BSSID
   - Análisis de protocolos de seguridad (WPA2, WPA3, WEP)
   - Medición de intensidad de señal
5. Usuario selecciona red objetivo para análisis profundo
6. Ejecuta captura de handshake (si aplica)
7. Pruebas de penetración según protocolo
8. Genera reporte de hallazgos

## Flujo Alternativo
- Para redes empresariales: análisis de RADIUS y certificados
- Para IoT: detección de dispositivos vulnerables
- Para análisis pasivo: solo monitoreo sin interacción

## Poscondiciones
- Mapa completo de redes wireless detectadas
- Análisis de vulnerabilidades por red
- Recomendaciones de hardening
- Capturas de evidencia almacenadas

## Servicios Utilizados
- **wireless-lab**: Contenedor Kali con herramientas wireless
- **ops-center**: Interfaz de control y visualización
- **ai-offsec**: Análisis de patrones y recomendaciones

## Requisitos No Funcionales
- Cobertura de protocolos: WPA, WPA2, WPA3, WEP
- Precisión de detección: > 98%
- Tiempo de escaneo: < 5 minutos para redes visibles
- Seguridad: Operaciones aisladas del host

## Notas para Mejoras Futuras
- Integración con drones para análisis geográfico
- Soporte para WiFi 6/6E
- Análisis de BLE y IoT wireless
- Dashboard de monitoreo continuo</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/casos-de-uso/caso-uso-seguridad-wireless.md