# OrcSOC - Troubleshooting Guide
**Fecha:** 2 de Diciembre, 2025

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### 1. Error de Análisis IA con Códigos ANSI

**Síntoma:**
```
Error: Command failed: docker exec ollama ollama run llama3.2 "..."
[?2026h[?25l[1G⠙ [K[?25h[?2026l... (muchos caracteres de control)
```

**Causa:** Ollama CLI retorna códigos ANSI del spinner de carga que no se pueden procesar correctamente.

**Solución Aplicada:** ✅
- Cambiamos de usar `ollama run` (CLI) a usar la API HTTP de Ollama
- Endpoint usado: `http://ollama:11434/api/generate`
- Ventajas:
  - Sin códigos ANSI
  - Respuesta JSON limpia
  - Más eficiente
  - Sin timeout por spinner

**Código implementado:**
```javascript
async function callOllamaAPI(prompt, retries = 3) {
  const axios = require('axios');
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post('http://ollama:11434/api/generate', {
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      }, {
        timeout: 90000
      });
      
      return response.data.response;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

---

### 2. Dashboard No Carga

**Síntomas:**
- Página en blanco en http://localhost:3000
- Error de conexión

**Diagnóstico:**
```bash
# 1. Verificar contenedor corriendo
docker ps | grep ops-center

# 2. Verificar logs
docker logs ops-center --tail 50

# 3. Verificar puerto
curl -I http://localhost:3000
```

**Soluciones:**

**A. Si el contenedor no está corriendo:**
```bash
docker-compose start ops-center
```

**B. Si hay errores en logs:**
```bash
# Ver error específico
docker logs ops-center | grep -i error

# Reiniciar contenedor
docker-compose restart ops-center
```

**C. Si puerto 3000 está ocupado:**
```bash
# Ver qué usa el puerto
lsof -i :3000

# Matar proceso si es necesario
kill -9 <PID>

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usar 3001 en lugar de 3000
```

---

### 3. WebSocket No Conecta

**Síntomas:**
- Resultados no aparecen automáticamente
- Status badge no se actualiza
- No hay notificaciones en tiempo real

**Diagnóstico:**
```bash
# Verificar logs de WebSocket
docker logs ops-center | grep -i "cliente conectado"
# Debe mostrar: "Cliente conectado: <socket-id>"

# Verificar en navegador (F12 > Console)
# Debe mostrar: "WebSocket conectado"
```

**Soluciones:**

**A. Verificar Socket.IO cargado:**
```bash
curl http://localhost:3000/socket.io/socket.io.js
# Debe retornar el script de Socket.IO
```

**B. Verificar backend correcto:**
```bash
docker exec ops-center head -10 /app/app.js | grep "socketIo"
# Debe mostrar: const socketIo = require('socket.io');
```

**C. Refrescar página:**
```bash
# En navegador presionar:
Ctrl + Shift + R  (Linux/Windows)
Cmd + Shift + R   (Mac)
```

---

### 4. Redis No Responde

**Síntomas:**
- Jobs no se ejecutan
- Error: "ECONNREFUSED redis"
- Cola de trabajos no funciona

**Diagnóstico:**
```bash
# Verificar Redis corriendo
docker ps | grep redis

# Test ping
docker exec orcsoc-redis redis-cli ping
# Debe responder: PONG
```

**Soluciones:**

**A. Reiniciar Redis:**
```bash
docker-compose restart orcsoc-redis
```

**B. Verificar conectividad:**
```bash
# Desde ops-center
docker exec ops-center ping -c 2 orcsoc-redis
```

**C. Verificar datos persistidos:**
```bash
# Ver dump
docker exec orcsoc-redis ls -lh /data/
# Debe mostrar: dump.rdb y appendonly.aof

# Backup si es necesario
docker exec orcsoc-redis redis-cli SAVE
```

---

### 5. Ollama No Responde

**Síntomas:**
- "Error al analizar con IA"
- Timeout en análisis
- "Cannot connect to Ollama"

**Diagnóstico:**
```bash
# Verificar Ollama corriendo
docker ps | grep ollama

# Verificar modelo instalado
docker exec ollama ollama list
# Debe mostrar: llama3.2:latest

# Test API HTTP
curl http://localhost:11435/api/tags
# Debe retornar JSON con modelos
```

**Soluciones:**

**A. Verificar modelo:**
```bash
# Si no está el modelo, descargarlo
docker exec ollama ollama pull llama3.2
```

**B. Reiniciar Ollama:**
```bash
docker restart ollama

# Esperar 10-20 segundos para que inicie
sleep 20

# Verificar
docker logs ollama --tail 20
```

**C. Verificar memoria:**
```bash
# llama3.2 requiere al menos 2-3GB RAM
docker stats ollama --no-stream
```

---

### 6. Comando No Ejecuta

**Síntomas:**
- "Comando contiene caracteres peligrosos"
- "Comando no permitido para este servicio"
- Job se encola pero no ejecuta

**Diagnóstico:**
```bash
# Ver logs del job
docker logs ops-center | grep "job:error"

# Ver comandos en whitelist
docker exec ops-center grep -A 5 "COMMAND_WHITELIST" /app/app.js
```

**Soluciones:**

**A. Caracteres peligrosos:**
Bloqueados: `;` `|` `&` `$()` `` ` `` `{}` `[]` `<>` `\\`

Usar plantillas pre-configuradas en lugar de comandos manuales.

**B. Servicio inválido:**
Servicios válidos:
- `osint-tools`
- `web-pentest`
- `wireless-lab`
- `ai-offsec`

**C. Verificar whitelist:**
Si necesitas agregar un comando nuevo, editar `COMMAND_WHITELIST` en app.js

---

### 7. Herramientas OSINT No Funcionan

**Síntomas:**
- "python: can't open file"
- "No such file or directory"
- Output vacío

**Diagnóstico:**
```bash
# Verificar wrappers existen
docker exec osint-tools ls -lh /tools/

# Test manual
docker exec osint-tools python tools/subfinder_wrapper.py --domain google.com
```

**Soluciones:**

**A. Verificar herramientas instaladas:**
```bash
docker exec osint-tools which subfinder
docker exec osint-tools which theHarvester
docker exec osint-tools which amass
```

**B. Rebuild contenedor:**
```bash
docker-compose build --no-cache osint-tools
docker-compose up -d osint-tools
```

**C. Verificar permisos:**
```bash
docker exec osint-tools chmod +x /tools/*.py
```

---

### 8. Nmap No Funciona

**Síntomas:**
- "nmap: not found"
- "Failed to resolve"
- Timeout en escaneos

**Diagnóstico:**
```bash
# Verificar Nmap instalado
docker exec web-pentest which nmap
docker exec web-pentest nmap --version
```

**Soluciones:**

**A. Test manual:**
```bash
docker exec web-pentest nmap -sV -p 80,443 scanme.nmap.org
```

**B. Verificar conectividad:**
```bash
# Desde contenedor
docker exec web-pentest ping -c 2 google.com
```

**C. Aumentar timeout:**
Si escaneos grandes fallan, editar timeout en app.js:
```javascript
exec(`docker exec ${service} ${command}`, 
  { maxBuffer: 1024 * 1024 * 10, timeout: 300000 }, // 5 minutos
  ...
```

---

### 9. Modal de Opciones No Abre

**Síntomas:**
- Click en botón no hace nada
- Modal no se muestra
- Console error en navegador

**Diagnóstico:**
```bash
# Abrir DevTools (F12)
# Ver Console para errores JavaScript
```

**Soluciones:**

**A. Verificar templates cargados:**
```bash
# En console del navegador:
console.log(templates);
# Debe mostrar objeto con 5 categorías
```

**B. Verificar target ingresado:**
Modal no abre si el input está vacío.

**C. Limpiar caché:**
```bash
# En navegador:
Ctrl + Shift + Delete (Clear cache)
# Luego refrescar página
```

---

### 10. Resultados Vacíos

**Síntomas:**
- Job completa pero output está vacío
- "No se encontraron subdominios"
- Status success pero sin datos

**Causas posibles:**

**A. Objetivo no tiene subdominios públicos:**
Algunos dominios simplemente no tienen subdominios listados públicamente.

**B. Rate limiting:**
Si ejecutas muchas búsquedas rápido, algunas fuentes pueden bloquear temporalmente.

**C. Servicios externos caídos:**
APIs de terceros (crt.sh, VirusTotal, etc.) pueden estar temporalmente inaccesibles.

**Soluciones:**

**A. Probar con dominio conocido:**
```bash
# Test con dominios grandes
google.com
facebook.com
github.com
```

**B. Esperar y reintentar:**
```bash
# Esperar 5-10 minutos
# Reintentar búsqueda
```

**C. Usar herramienta alternativa:**
Si Subfinder no encuentra nada, probar con Amass.

---

## 🔧 COMANDOS DE DIAGNÓSTICO RÁPIDO

### Health Check Completo
```bash
#!/bin/bash
echo "=== OrcSOC Health Check ==="

echo "\n1. Contenedores:"
docker-compose ps

echo "\n2. Dashboard:"
curl -I http://localhost:3000 | head -1

echo "\n3. Ollama:"
curl -s http://localhost:11435/api/tags | jq -r '.models[].name'

echo "\n4. Redis:"
docker exec orcsoc-redis redis-cli ping

echo "\n5. WebSocket:"
docker logs ops-center --tail 5 | grep "Cliente conectado"

echo "\n6. Últimos errores:"
docker logs ops-center --tail 50 | grep -i "error"
```

### Reset Completo
```bash
#!/bin/bash
echo "=== Reiniciando OrcSOC ==="

# Parar todo
docker-compose down

# Limpiar volúmenes Redis
docker volume rm orcsoc_redis-data 2>/dev/null

# Levantar
docker-compose up -d

# Esperar inicio
sleep 10

# Verificar
docker-compose ps
curl -I http://localhost:3000
```

---

## 📊 LOGS ÚTILES

### Ver todos los logs
```bash
docker-compose logs -f
```

### Logs por servicio
```bash
docker logs -f ops-center
docker logs -f ollama
docker logs -f orcsoc-redis
docker logs -f osint-tools
docker logs -f web-pentest
```

### Buscar errores específicos
```bash
# Errores de IA
docker logs ops-center | grep -i "ollama"

# Errores de validación
docker logs ops-center | grep -i "comando"

# Errores de WebSocket
docker logs ops-center | grep -i "socket"

# Errores de Redis
docker logs ops-center | grep -i "redis"
```

---

## 🆘 SOPORTE

### Información para reportar issues

Incluir siempre:
```bash
1. Versión de Docker:
docker --version

2. Estado de contenedores:
docker-compose ps

3. Logs relevantes:
docker logs ops-center --tail 100

4. Descripción del problema

5. Pasos para reproducir
```

### Contacto
- GitHub Issues: https://github.com/felipeibarra/OrcSOC/issues
- Dashboard: http://localhost:3000

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de reportar un problema, verificar:

- [ ] Todos los contenedores están UP
- [ ] Dashboard accesible en http://localhost:3000
- [ ] Ollama tiene modelo llama3.2 instalado
- [ ] Redis responde a PING
- [ ] WebSocket conecta (ver console navegador)
- [ ] Input objetivo tiene valor antes de ejecutar
- [ ] Esperaste suficiente tiempo para resultados
- [ ] No hay errores en logs de ops-center

---

**Si el problema persiste después de estos pasos, revisar logs detallados y reportar issue con toda la información.**

© 2025 Felipe Ibarra - OrcSOC Platform
