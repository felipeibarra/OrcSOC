# 🚀 OrcSOC - Quick Start Guide

## ⚡ 3 Pasos para Empezar

### 1️⃣ Abrir Dashboard
```
http://localhost:3000
```

### 2️⃣ Ingresar Objetivo
Escribe en el input central:
- `example.com` (dominio)
- `https://example.com` (URL)
- `192.168.1.1` (IP)

### 3️⃣ Click y Analiza
Presiona cualquiera de los 5 botones:

| Botón | Para qué sirve |
|-------|----------------|
| 🔍 **Recon Básico** | Encuentra subdominios rápidamente |
| 🕵️ **OSINT Completo** | Análisis profundo multi-herramienta |
| 🔬 **Escaneo Puertos** | Detecta puertos y servicios abiertos |
| 🛡️ **Vulnerabilidades** | Busca problemas de seguridad web |
| 📧 **Buscar Emails** | Recolecta emails públicos del dominio |

---

## 🎯 Ejemplo Práctico

```
1. Escribe: example.com
2. Click: 🔍 Recon Básico
3. Espera: 30-60 segundos
4. Resultado: Lista de subdominios aparece automáticamente
5. Click: 🤖 Analizar con IA
6. IA explica: Cuáles subdominios son importantes y por qué
```

---

## 🤖 Análisis IA

Después de cada resultado, presiona **"🤖 Analizar con IA"** para obtener:

✅ Resumen ejecutivo claro  
✅ Priorización de hallazgos  
✅ Nivel de severidad (CRÍTICO/ALTO/MEDIO/BAJO)  
✅ Vectores de ataque posibles  
✅ Recomendaciones inmediatas  

---

## 🟢 Estado del Sistema

### Verificar que todo funciona:

✅ Dashboard carga en http://localhost:3000  
✅ 5 servicios aparecen UP (verde) en la parte superior  
✅ Input central acepta texto  
✅ Click en botón muestra "Ejecutando..."  
✅ Resultados aparecen automáticamente  
✅ IA responde en menos de 30 segundos  

---

## 🔧 Comandos Útiles

### Ver estado
```bash
docker-compose ps
```

### Ver logs en vivo
```bash
docker logs -f ops-center
```

### Reiniciar todo
```bash
docker-compose restart
```

### Problema con IA
```bash
docker exec ollama ollama list
docker restart ollama
```

---

## 📱 Interfaz Visual

```
┌─────────────────────────────────────────────────────┐
│  🟢 Services Status (UP/DOWN)                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 Analizar Objetivo                               │
│  ┌───────────────────────────────────────────────┐ │
│  │  example.com                                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  🔍 Recon   🕵️ OSINT   🔬 Escaneo                   │
│  🛡️ Vuln    📧 Emails                               │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  📊 Resultados                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Output] [Análisis IA]                      │   │
│  │                                             │   │
│  │ Resultados aparecen aquí...                 │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🤖 Analizar con IA                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 Casos de Uso Rápidos

### 🔍 Investigar un dominio
```
Input: target.com
Click: 🕵️ OSINT Completo
Tiempo: 2-5 min
Resultado: Subdominios, emails, info WHOIS, DNS
```

### 🛡️ Auditar seguridad web
```
Input: https://site.com
Click: 🛡️ Vulnerabilidades
Tiempo: 2-4 min
Resultado: Problemas de configuración, headers inseguros, vulnerabilidades
```

### 🔬 Analizar servidor
```
Input: 192.168.1.100
Click: 🔬 Escaneo Puertos
Tiempo: 1-3 min
Resultado: Puertos abiertos, servicios, versiones
```

### 📧 Recolectar información pública
```
Input: company.com
Click: 📧 Buscar Emails
Tiempo: 1-2 min
Resultado: Emails, hosts, IPs expuestos públicamente
```

---

## 🚨 Troubleshooting Ultra-Rápido

| Problema | Solución |
|----------|----------|
| Dashboard no carga | `docker-compose restart ops-center` |
| IA no responde | `docker restart ollama` |
| Servicios DOWN | `docker-compose restart` |
| WebSocket desconectado | Refrescar página (F5) |
| Redis error | `docker-compose restart orcsoc-redis` |

---

## 💡 Pro Tips

1. **Espera los resultados**: El WebSocket los trae automáticamente, no recargues la página
2. **Lee el análisis IA**: Está contextualizado según la herramienta que usaste
3. **Revisa los servicios**: Si uno está DOWN (rojo), reinícialo específicamente
4. **Usa tabs**: "Output" muestra resultado crudo, "Análisis IA" muestra interpretación
5. **Notificaciones**: Aparecen arriba a la derecha con estado del job

---

## 📊 Tiempos Esperados

| Acción | Tiempo |
|--------|--------|
| 🔍 Recon | 30-60s |
| 🕵️ OSINT | 2-5 min |
| 🔬 Escaneo | 1-3 min |
| 🛡️ Vuln | 2-4 min |
| 📧 Emails | 1-2 min |
| 🤖 IA | 10-30s |

---

## ✅ Todo Listo Para:

✅ Demostración a clientes  
✅ Auditorías de seguridad básicas  
✅ Investigación OSINT  
✅ Análisis de superficie de ataque  
✅ Reconocimiento ético  
✅ Educación en ciberseguridad  

---

## 🎉 ¡Listo!

Abre **http://localhost:3000** y comienza a analizar.

**Documentación completa:**
- `GUIA_USO_DASHBOARD.md` - Guía detallada
- `STATUS.md` - Estado del sistema
- `TEST_PLAN.md` - Plan de pruebas

---

**OrcSOC Dashboard v2.0 - Security Operations Center con IA**

© 2025 Felipe Ibarra
