# Documentación Técnica - Servicio Wireless-Lab

## Descripción General

El servicio **wireless-lab** es un contenedor especializado en análisis de seguridad wireless, basado en Kali Linux con herramientas especializadas para evaluación de redes WiFi y dispositivos wireless.

## Arquitectura Técnica

### Base del Contenedor
```dockerfile
FROM kalilinux/kali-rolling
```

### Configuración Especial
- **Privileged Mode**: Requiere `--privileged` para acceso a hardware wireless
- **Host Network**: Modo host para acceso directo a interfaces wireless
- **Hardware Access**: Necesita adaptadores WiFi compatibles

## Herramientas Instaladas

### Suite Wireless de Kali
```bash
apt-get install -y kismet aircrack-ng
```

### Kismet
- **Propósito**: Wardriving y análisis de redes wireless
- **Características**:
  - Detección pasiva de redes WiFi
  - Captura de paquetes wireless
  - Análisis de dispositivos conectados
  - GPS integration para wardriving
- **Modos**:
  - **Monitor**: Detección pasiva de redes
  - **Drone**: Distribución de sensores
  - **Server**: Modo servidor para múltiples clientes

### Aircrack-ng Suite
- **Propósito**: Auditoría de seguridad WiFi
- **Herramientas principales**:
  - **airodump-ng**: Sniffing y monitoring de redes
  - **aireplay-ng**: Inyección de paquetes
  - **aircrack-ng**: Cracking de claves WEP/WPA
  - **airomon-ng**: Gestión de modo monitor
  - **airdecap-ng**: Descifrado de capturas

## Configuración del Entorno

### Requisitos de Hardware
```yaml
# docker-compose.yml
wireless-lab:
  privileged: true
  network_mode: host
  devices:
    - /dev/ttyUSB0:/dev/ttyUSB0  # GPS si aplica
  volumes:
    - /dev:/dev
    - ./captures:/captures
```

### Interfaces Wireless
- **Adaptadores compatibles**: Chipsets con modo monitor (Atheros, Ralink, etc.)
- **Modo monitor**: Interfaz dedicada para captura pasiva
- **Inyección**: Soporte para packet injection

## Patrones de Uso en OrcSOC

### Reconocimiento Wireless Básico
```bash
# Listar interfaces disponibles
iwconfig

# Poner interfaz en modo monitor
airmon-ng start wlan0

# Escanear redes disponibles
airodump-ng mon0
```

### Wardriving con Kismet
```bash
# Iniciar servidor Kismet
kismet -c mon0 --no-ncurses

# Con GPS (si disponible)
kismet -c mon0,gps:serial:/dev/ttyUSB0:4800
```

### Análisis de Seguridad WPA
```bash
# Capturar handshake
airodump-ng -c 6 --bssid XX:XX:XX:XX:XX:XX -w capture mon0

# Deauth para forzar reconexión
aireplay-ng -0 1 -a XX:XX:XX:XX:XX:XX -c YY:YY:YY:YY:YY:YY mon0

# Crack con diccionario
aircrack-ng -w wordlist.txt capture-01.cap
```

### WEP Cracking
```bash
# Capturar datos WEP
airodump-ng -c 6 --bssid XX:XX:XX:XX:XX:XX -w wep_capture mon0

# ARP replay attack
aireplay-ng -3 -b XX:XX:XX:XX:XX:XX -h ZZ:ZZ:ZZ:ZZ:ZZ:ZZ mon0

# Crack WEP
aircrack-ng -z wep_capture-01.cap
```

## Configuración Avanzada

### Kismet Configuration
```bash
# kismet.conf
source=mon0:type=linuxwifi
gps=serial:/dev/ttyUSB0:4800
```

### Aircrack-ng Optimization
```bash
# Modo agresivo para inyección
aireplay-ng -9 -e "ESSID" -a XX:XX:XX:XX:XX:XX mon0

# Test de inyección
aireplay-ng -9 XX:XX:XX:XX:XX:XX mon0
```

## Seguridad y Consideraciones Legales

### Modo Privileged
- **Riesgos**: Acceso completo al hardware del host
- **Alcance**: Limitado a interfaces wireless únicamente
- **Aislamiento**: Contenedor dedicado sin acceso a otros recursos

### Consideraciones Legales
- **Autorización**: Solo en redes propias o con permiso explícito
- **Jurisdicción**: Cumplir con leyes locales de telecomunicaciones
- **Éticas**: No interferir con comunicaciones ajenas

### Validación de Comandos
- **Whitelist restrictiva**: Solo comandos `kismet` y `aircrack-ng`
- **Parámetros sanitizados**: Validación de interfaces y BSSID
- **Timeouts**: Prevención de operaciones infinitas

## Manejo de Errores

### Problemas Comunes

#### Hardware
- **Adaptador incompatible**: No soporta modo monitor
- **Drivers faltantes**: Kernel modules no cargados
- **Interferencias**: Otros procesos usando la interfaz

#### Configuración
- **Modo monitor**: Fallo al crear interfaz virtual
- **Permisos**: Acceso denegado a `/dev/rfkill`
- **Conflicto**: Múltiples herramientas usando misma interfaz

#### Red
- **Señal débil**: Captura insuficiente para cracking
- **Encriptación**: WPA3 no vulnerable a ataques conocidos
- **Protecciones**: 802.11w (PMF) previene deauth

### Estrategias de Recuperación
- **Restart**: Reinicio del contenedor para limpiar estado
- **Interface reset**: `airmon-ng stop mon0; airmon-ng start wlan0`
- **Hardware check**: Verificar estado con `iwconfig`

## Rendimiento y Optimización

### Captura Eficiente
```bash
# Filtro por canal para reducir ruido
airodump-ng -c 6 mon0

# Captura específica de red
airodump-ng -c 6 --bssid XX:XX:XX:XX:XX:XX mon0
```

### Procesamiento Paralelo
- **Múltiples interfaces**: Diferentes canales simultáneamente
- **Distribución**: Kismet server con múltiples drones
- **GPU acceleration**: Para cracking de hashes (external)

### Almacenamiento
- **Capturas**: Volúmenes persistentes para análisis posterior
- **Logs**: Rotación automática de archivos de log
- **Base de datos**: Kismet almacena en SQLite

## Monitoreo y Diagnóstico

### Estado de Interfaces
```bash
# Ver interfaces wireless
iwconfig

# Estado de modo monitor
airmon-ng

# Procesos usando interfaces
lsof /dev/wlan0
```

### Logs de Kismet
```bash
# Logs en /var/log/kismet/
tail -f /var/log/kismet/kismet.log

# Base de datos de capturas
sqlite3 /var/log/kismet/Kismet-*.kismet
```

### Métricas de Captura
- **Redes detectadas**: Cantidad por canal/frecuencia
- **Dispositivos**: Clients por red
- **Señal**: RSSI y calidad de captura
- **Tasa de paquetes**: PPS (packets per second)

## Extensibilidad

### Adición de Herramientas
```dockerfile
RUN apt-get install -y \
    reaver \
    pixiewps \
    bully \
    wifite \
    fluxion
```

### Integración con GPS
- **Serial GPS**: Para wardriving geolocalizado
- **GPSd**: Daemon para compartir datos GPS
- **Kismet GPS**: Integración nativa con mapas

### Automatización
- **Scripts**: Workflows automatizados para testing
- **Plugins**: Extensibilidad de Kismet
- **APIs**: Integración con herramientas externas

## Casos de Uso Típicos

### Auditoría de Red Corporativa
```bash
# Reconocimiento completo
kismet -c mon0 -t corporate_audit

# Análisis de seguridad
airodump-ng -c 6,11 mon0  # Canales comunes
```

### Wardriving Urbano
```bash
# Con GPS para mapeo
kismet -c mon0,gps:serial:/dev/ttyUSB0:4800 -t city_wardrive

# Export a KML para Google Earth
kismetdb_to_kml --in Kismet-*.kismet --out wardrive.kml
```

### Testing de Seguridad WPA
```bash
# Captura de handshake
airodump-ng -c 6 --bssid TARGET_BSSID -w handshake mon0 &
aireplay-ng -0 5 -a TARGET_BSSID -c CLIENT_MAC mon0

# Cracking offline
aircrack-ng -w rockyou.txt handshake-01.cap
```

## Limitaciones Técnicas

### Hardware Dependiente
- **Compatibilidad**: No todos los adaptadores WiFi funcionan
- **Rendimiento**: Velocidad de inyección varía por chipset
- **Alcance**: Limitado por antena y potencia

### Protocolos Modernos
- **WPA3**: No vulnerable a ataques actuales
- **802.11w**: Protege contra deauth attacks
- **SAE**: Autenticación más segura

### Entorno Controlado
- **Interferencias**: Ruido electromagnético afecta calidad
- **Distancia**: Señal debe ser suficiente para captura
- **Movilidad**: Wardriving requiere movimiento físico

## Mejores Prácticas

### Metodología de Testing
1. **Reconocimiento**: Kismet para mapa de redes
2. **Análisis**: Airodump para detalles específicos
3. **Vulnerabilidades**: Test de protocolos de seguridad
4. **Explotación**: Solo con autorización (WEP/WPA2 vulnerable)
5. **Reportes**: Documentación completa de hallazgos

### Configuración Segura
- **Interfaces dedicadas**: No usar para conectividad normal
- **Segmentación**: VLANs para aislamiento
- **Monitoreo**: Logs de todas las operaciones

### Ética y Legalidad
- **Permisos**: Siempre obtener autorización escrita
- **Transparencia**: Informar sobre actividades de testing
- **Minimal Impact**: Usar modos pasivos cuando posible

## Roadmap de Mejoras

### Funcionalidades Planeadas
- [ ] Soporte para WiFi 6/6E
- [ ] Integración con SDR (Software Defined Radio)
- [ ] Análisis de IoT wireless
- [ ] Machine learning para detección de anomalías

### Optimizaciones Técnicas
- [ ] Contenedores especializados por función
- [ ] GPU acceleration para cracking
- [ ] Distribución de sensores wireless
- [ ] Dashboard web para visualización en tiempo real</content>
<parameter name="filePath">/Users/felipeibarra_m2_max/GITHUB-FELIPE/OrcSOC/docs/codigo/auto-documentacion-wireless-lab.md