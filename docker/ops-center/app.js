const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const Queue = require('bull');
const Joi = require('joi');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { createClient } = require('redis');

const { runPlaybook, getPlaybooks } = require('./playbook-engine');
const PluginManager = require('./plugins');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize plugin manager
const pluginManager = new PluginManager();

// Redis client for history
const redisClient = createClient({
  host: 'orcsoc-redis',
  port: 6379
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Job Queue con Redis
const jobQueue = new Queue('orcsoc-jobs', {
  redis: {
    host: 'orcsoc-redis',
    port: 6379
  }
});

// Archivo para logs
const logsFile = path.join(__dirname, 'logs.json');

// Funciones de logs
const readLogs = () => {
  if (fs.existsSync(logsFile)) {
    return JSON.parse(fs.readFileSync(logsFile, 'utf8'));
  }
  return [];
};

const writeLogs = (logs) => {
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
};

// Usuarios
const users = { 
  admin: { password: 'password', role: 'admin' }, 
  user: { password: 'pass', role: 'user' } 
};

// Middleware de autenticación
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="OrcSOC"');
    return res.status(401).send('Autenticación requerida');
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  if (!users[username] || users[username].password !== password) {
    return res.status(401).send('Credenciales inválidas');
  }
  req.user = username;
  req.role = users[username].role;
  next();
};

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// WHITELIST DE COMANDOS - Seguridad
const COMMAND_WHITELIST = {
  'osint-tools': [
    /^python tools\/\w+_wrapper\.py/,
    /^python tools\/enrich\.py/,
    /^whois [a-zA-Z0-9\.-]+$/,
    /^nslookup [a-zA-Z0-9\.-]+$/,
    /^dig [a-zA-Z0-9\.-]+$/
  ],
  'web-pentest': [
    // Nmap - permite múltiples flags y variaciones
    /^nmap\s+(-[a-zA-Z]+\s+)*(-p\s+[\d,-]+\s+)?(-[a-zA-Z]+\s+)*[a-zA-Z0-9\.-]+$/,
    /^nmap\s+.+[a-zA-Z0-9\.-]+$/,  // Catch-all más permisivo para nmap
    // Nikto
    /^nikto -h https?:\/\/[a-zA-Z0-9\.-]+(:\d+)?$/,
    /^nikto\s+-h\s+https?:\/\/.+$/,  // Más permisivo para nikto
    // SQLmap
    /^sqlmap -u https?:\/\/.+--batch.*/,
    /^sqlmap\s+-u\s+https?:\/\/.+$/,  // Más permisivo para sqlmap
    // WPScan
    /^wpscan --url https?:\/\/[a-zA-Z0-9\.-]+$/,
    /^wpscan\s+--url\s+https?:\/\/.+$/,  // Más permisivo para wpscan
    // Gobuster
    /^gobuster dir -u https?:\/\/.+ -w .+$/,
    /^gobuster\s+.+$/  // Más permisivo para gobuster
  ],
  'wireless-lab': [
    /^kismet/,
    /^aircrack-ng/
  ],
  'ai-offsec': [
    /^python .+\.py/
  ]
};

// Validación de comandos
const validateCommand = (service, command) => {
  // Caracteres peligrosos prohibidos
  const dangerousChars = /[;|&$(){}[\]<>\\`]/;
  
  if (dangerousChars.test(command)) {
    return { valid: false, error: 'Comando contiene caracteres peligrosos' };
  }
  
  // Validar contra whitelist
  const patterns = COMMAND_WHITELIST[service];
  if (!patterns) {
    return { valid: false, error: 'Servicio no válido' };
  }
  
  const isValid = patterns.some(pattern => pattern.test(command));
  if (!isValid) {
    return { valid: false, error: 'Comando no permitido para este servicio' };
  }
  
  return { valid: true };
};

// PLANTILLAS DE COMANDOS PREDEFINIDAS CON CATEGORÍAS
const COMMAND_TEMPLATES = {
  'recon': {
    name: 'Recon Básico',
    icon: '🔍',
    description: 'Reconocimiento y enumeración de subdominios',
    options: [
      {
        id: 'subfinder-rapido',
        name: 'Subfinder Rápido',
        service: 'osint-tools',
        command: 'python tools/subfinder_wrapper.py --domain {{target}}',
        description: 'Enumeración rápida de subdominios usando múltiples fuentes pasivas',
        tiempo: '30-60s',
        nivel: 'Básico'
      },
      {
        id: 'subfinder-completo',
        name: 'Subfinder Completo',
        service: 'osint-tools',
        command: 'python tools/subfinder_wrapper.py --domain {{target}} --all',
        description: 'Enumeración exhaustiva con todas las fuentes disponibles',
        tiempo: '2-3 min',
        nivel: 'Avanzado'
      },
      {
        id: 'amass-pasivo',
        name: 'Amass Pasivo',
        service: 'osint-tools',
        command: 'python tools/amass_wrapper.py --domain {{target}} --passive',
        description: 'Reconocimiento DNS pasivo sin tocar el objetivo',
        tiempo: '1-2 min',
        nivel: 'Básico'
      },
      {
        id: 'amass-activo',
        name: 'Amass Activo',
        service: 'osint-tools',
        command: 'python tools/amass_wrapper.py --domain {{target}} --active',
        description: 'Reconocimiento activo con brute force de subdominios',
        tiempo: '5-10 min',
        nivel: 'Avanzado'
      }
    ]
  },
  'osint': {
    name: 'OSINT Completo',
    icon: '🕵️',
    description: 'Inteligencia de fuentes abiertas',
    options: [
      {
        id: 'enrich-basico',
        name: 'OSINT Básico',
        service: 'osint-tools',
        command: 'python tools/enrich.py --target {{target}} --type domain --level basic',
        description: 'Análisis OSINT básico: subdominios + WHOIS + DNS',
        tiempo: '1-2 min',
        nivel: 'Básico'
      },
      {
        id: 'enrich-completo',
        name: 'OSINT Completo',
        service: 'osint-tools',
        command: 'python tools/enrich.py --target {{target}} --type domain',
        description: 'Análisis completo: subdominios, emails, WHOIS, DNS, IPs',
        tiempo: '3-5 min',
        nivel: 'Intermedio'
      },
      {
        id: 'whois-lookup',
        name: 'WHOIS Lookup',
        service: 'osint-tools',
        command: 'whois {{target}}',
        description: 'Información de registro del dominio (registrador, fechas, contactos)',
        tiempo: '5-10s',
        nivel: 'Básico'
      },
      {
        id: 'dns-lookup',
        name: 'DNS Lookup',
        service: 'osint-tools',
        command: 'nslookup {{target}}',
        description: 'Resolución DNS básica (registros A, MX, NS)',
        tiempo: '5-10s',
        nivel: 'Básico'
      }
    ]
  },
  'escaneo': {
    name: 'Escaneo Puertos',
    icon: '🔬',
    description: 'Análisis de puertos y servicios',
    options: [
      {
        id: 'nmap-rapido-stealth',
        name: 'Nmap Sigiloso (Top 100)',
        service: 'web-pentest',
        command: 'nmap -sS -T2 --max-rate 50 -F {{target}}',
        description: 'Escaneo sigiloso SYN scan limitado a 50 paquetes/seg',
        tiempo: '1-2 min',
        nivel: 'Básico',
        stealth: true
      },
      {
        id: 'nmap-web',
        name: 'Nmap Puertos Web',
        service: 'web-pentest',
        command: 'nmap -sV -p 80,443,8080,8443 {{target}}',
        description: 'Escaneo enfocado en puertos HTTP/HTTPS comunes',
        tiempo: '15-30s',
        nivel: 'Básico'
      },
      {
        id: 'nmap-completo',
        name: 'Nmap Completo',
        service: 'web-pentest',
        command: 'nmap -sC -sV -p- {{target}}',
        description: 'Escaneo exhaustivo de todos los puertos con scripts NSE',
        tiempo: '10-30 min',
        nivel: 'Avanzado'
      },
      {
        id: 'nmap-udp',
        name: 'Nmap UDP',
        service: 'web-pentest',
        command: 'nmap -sU -p 53,161,162 {{target}}',
        description: 'Escaneo de puertos UDP comunes (DNS, SNMP)',
        tiempo: '2-5 min',
        nivel: 'Intermedio'
      }
    ]
  },
  'vulnerabilidades': {
    name: 'Vulnerabilidades',
    icon: '🛡️',
    description: 'Detección de vulnerabilidades web',
    options: [
      {
        id: 'nikto-basico',
        name: 'Nikto Básico',
        service: 'web-pentest',
        command: 'nikto -h http://{{target}}',
        description: 'Escaneo básico de vulnerabilidades web (configuración, headers, archivos)',
        tiempo: '2-4 min',
        nivel: 'Básico'
      },
      {
        id: 'nikto-completo',
        name: 'Nikto Completo',
        service: 'web-pentest',
        command: 'nikto -h http://{{target}} -Tuning 9',
        description: 'Escaneo exhaustivo con todos los plugins activos',
        tiempo: '5-10 min',
        nivel: 'Avanzado'
      },
      {
        id: 'sqlmap-basico',
        name: 'SQLmap Básico',
        service: 'web-pentest',
        command: 'sqlmap -u http://{{target}} --batch --level=1',
        description: 'Detección básica de SQL injection en URL',
        tiempo: '1-3 min',
        nivel: 'Intermedio'
      },
      {
        id: 'wpscan',
        name: 'WPScan',
        service: 'web-pentest',
        command: 'wpscan --url http://{{target}}',
        description: 'Análisis de seguridad específico para WordPress',
        tiempo: '2-5 min',
        nivel: 'Intermedio'
      }
    ]
  },
  'emails': {
    name: 'Buscar Emails',
    icon: '📧',
    description: 'Recolección de información de contacto',
    options: [
      {
        id: 'harvester-google',
        name: 'theHarvester (Google)',
        service: 'osint-tools',
        command: 'python tools/harvester_wrapper.py --domain {{target}} --sources google',
        description: 'Búsqueda de emails solo en Google',
        tiempo: '30-60s',
        nivel: 'Básico'
      },
      {
        id: 'harvester-completo',
        name: 'theHarvester Completo',
        service: 'osint-tools',
        command: 'python tools/harvester_wrapper.py --domain {{target}} --sources google,bing,yahoo',
        description: 'Búsqueda exhaustiva en múltiples motores de búsqueda',
        tiempo: '2-3 min',
        nivel: 'Intermedio'
      },
      {
        id: 'harvester-profundo',
        name: 'theHarvester Profundo',
        service: 'osint-tools',
        command: 'python tools/harvester_wrapper.py --domain {{target}} --sources all',
        description: 'Búsqueda en todas las fuentes disponibles (emails, hosts, IPs)',
        tiempo: '5-10 min',
        nivel: 'Avanzado'
      },
      {
        id: 'harvester-pasivo',
        name: 'theHarvester Pasivo',
        service: 'osint-tools',
        command: 'python tools/harvester_wrapper.py --domain {{target}} --sources google,bing --limit 100',
        description: 'Recolección pasiva limitada para minimizar huella',
        tiempo: '1-2 min',
        nivel: 'Básico'
      }
    ]
  }
};

// Endpoint para obtener plantillas
app.get('/templates', (req, res) => {
  res.json(COMMAND_TEMPLATES);
});

// Endpoint para ejecutar plantilla por ID
app.post('/exec/template', async (req, res) => {
  const { templateId, optionId, target } = req.body;
  
  if (!templateId || !optionId || !target) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  
  const template = COMMAND_TEMPLATES[templateId];
  if (!template) {
    return res.status(404).json({ error: 'Template no encontrado' });
  }
  
  const option = template.options.find(opt => opt.id === optionId);
  if (!option) {
    return res.status(404).json({ error: 'Opción no encontrada' });
  }
  
  // Reemplazar {{target}} en el comando
  const command = option.command.replace(/{{target}}/g, target);
  
  // Validar comando
  const validation = validateCommand(option.service, command);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  // Crear job
  const job = await jobQueue.add({
    service: option.service,
    command,
    user: req.user || 'anonymous',
    jobId: Date.now().toString()
  });
  
  res.json({ 
    jobId: job.data.jobId,
    message: 'Job enqueued',
    status: 'pending',
    templateName: option.name,
    service: option.service
  });
});

// Procesar job de la cola
jobQueue.process(async (job) => {
  const { service, command, user, jobId } = job.data;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Emitir inicio de ejecución
    io.emit('job:start', { jobId, service, command });
    
    exec(`docker exec ${service} ${command}`, 
      { maxBuffer: 1024 * 1024 * 10 }, 
      (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        const result = error ? stderr : stdout;
        
        // Guardar log
        const logs = readLogs();
        logs.push({ 
          timestamp: new Date().toISOString(), 
          user, 
          service, 
          command, 
          result: result.substring(0, 5000),
          duration,
          jobId
        });
        writeLogs(logs);
        
        // Guardar en historial Redis
        const historyEntry = {
          id: jobId,
          timestamp: new Date().toISOString(),
          user,
          service,
          command,
          result: result.substring(0, 10000),
          duration,
          success: !error,
          target: extractTarget(command)
        };
        
        redisClient.lPush('investigation_history', JSON.stringify(historyEntry));
        redisClient.lTrim('investigation_history', 0, 99); // Mantener solo últimas 100
        
        if (error) {
          io.emit('job:error', { jobId, error: stderr });
          reject(new Error(stderr));
        } else {
          io.emit('job:complete', { jobId, result, duration });
          resolve({ result, duration });
        }
      }
    );
  });
});

// Función para extraer target del comando
function extractTarget(command) {
  const patterns = [
    /--domain\s+(\S+)/,
    /-h\s+(\S+)/,
    /nmap\s+.*?\s+(\S+)/,
    /sqlmap\s+-u\s+(\S+)/
  ];
  
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match) return match[1];
  }
  return 'unknown';
}

// Endpoint mejorado para ejecutar comando con cola
app.post('/exec/:service', auth, async (req, res) => {
  const service = req.params.service;
  const command = req.body.command;
  
  // Validar comando
  const validation = validateCommand(service, command);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  try {
    const job = await jobQueue.add({
      service,
      command,
      user: req.user,
      jobId: Date.now().toString()
    });
    
    res.json({ 
      jobId: job.id, 
      status: 'queued',
      message: 'Comando agregado a la cola de ejecución'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para estado de microservicios
app.get('/services/status', auth, async (req, res) => {
  const services = ['osint-tools', 'web-pentest', 'wireless-lab', 'ai-offsec', 'ollama'];
  
  const statuses = await Promise.all(services.map(async (service) => {
    return new Promise((resolve) => {
      exec(`docker inspect ${service} --format '{{json .State}}'`, (error, stdout) => {
        if (error) {
          resolve({ service, status: 'down', error: error.message });
        } else {
          try {
            const state = JSON.parse(stdout);
            resolve({
              service,
              status: state.Running ? 'up' : 'down',
              uptime: state.StartedAt,
              health: state.Health ? state.Health.Status : 'unknown'
            });
          } catch (e) {
            resolve({ service, status: 'unknown' });
          }
        }
      });
    });
  }));
  
  res.json(statuses);
});

// Endpoint de logs mejorado
app.get('/logs', auth, (req, res) => {
  let logs = readLogs();
  const { user, service, date } = req.query;

  if (req.role !== 'admin') {
    logs = logs.filter(log => log.user === req.user);
  }

  if (user) logs = logs.filter(log => log.user === user);
  if (service) logs = logs.filter(log => log.service === service);
  if (date) logs = logs.filter(log => log.timestamp.startsWith(date));

  res.json(logs);
});

// Endpoint de chat IA mejorado con reintentos
app.post('/ai-chat', auth, async (req, res) => {
  const prompt = req.body.prompt;
  
  if (!prompt || prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt inválido o muy largo' });
  }
  
  let retries = 3;
  
  while (retries > 0) {
    try {
      const result = await new Promise((resolve, reject) => {
        exec(`docker exec ollama ollama run llama3.2 "${prompt}"`, 
          { timeout: 60000, maxBuffer: 1024 * 1024 * 10 },
          (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout);
          }
        );
      });
      
      return res.send(result);
    } catch (error) {
      retries--;
      if (retries === 0) {
        return res.status(500).json({ 
          error: 'Error en IA después de 3 intentos',
          details: error.message 
        });
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
});

// Helper para llamar a Ollama API HTTP (sin ANSI codes)
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
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Endpoint de análisis IA mejorado
app.post('/analyze', async (req, res) => {
  const { tool, output, target } = req.body;
  
  if (!tool || !output) {
    return res.status(400).json({ error: 'tool and output required' });
  }
  
  const prompts = {
    nmap: `Analiza este escaneo Nmap como experto en ciberseguridad. Proporciona:
1. Resumen ejecutivo con severidad total
2. Puertos críticos y servicios expuestos con CVSS estimado
3. Nivel de severidad (CRÍTICO/ALTO/MEDIO/BAJO) con justificación
4. Vector de ataque más probable y exploitabilidad
5. Recomendaciones inmediatas priorizadas
6. Score de riesgo del objetivo (1-10)

Nmap Output:
${output.substring(0, 2000)}`,
    
    subfinder: `Analiza estos subdominios como analista OSINT avanzado. Proporciona:
1. Subdominios de alto interés con justificación
2. Posibles vectores de ataque identificados
3. Exposición de información sensible (admin panels, dev sites, etc.)
4. Correlación entre subdominios para identificar patrones
5. Priorización para investigación (alta/media/baja)
6. Recomendaciones de enumeración adicional

Subdominios encontrados:
${output.substring(0, 2000)}`,
    
    harvester: `Analiza esta información OSINT como investigador de amenazas. Proporciona:
1. Nivel de exposición de información (alto/medio/bajo)
2. Datos sensibles encontrados con severidad
3. Riesgo de ingeniería social cuantificado
4. Posibles campañas de phishing identificadas
5. Recomendaciones de protección específicas
6. Indicadores de compromiso (IoCs) detectados

Resultados OSINT:
${output.substring(0, 2000)}`,
    
    sqlmap: `Analiza estas vulnerabilidades SQL injection como pentester experto. Proporciona:
1. Severidad y explotabilidad técnica (1-10)
2. Datos en riesgo con impacto estimado
3. Impacto en negocio cuantificado
4. Pasos de remediación urgentes priorizados
5. Vector de explotación más probable
6. Recomendaciones de hardening

SQLmap Results:
${output.substring(0, 2000)}`,
    
    nikto: `Analiza este escaneo web como auditor de seguridad. Proporciona:
1. Vulnerabilidades críticas identificadas
2. Configuraciones inseguras detectadas
3. Exposición de información sensible
4. Cumplimiento con OWASP Top 10
5. Recomendaciones de mitigación priorizadas

Nikto Scan Results:
${output.substring(0, 2000)}`,
    
    default: `Análisis de seguridad avanzado:
1. Hallazgos críticos que requieren atención inmediata
2. Nivel de riesgo general con justificación
3. Vector de ataque más probable
4. Recomendaciones priorizadas por impacto
5. Score de riesgo (1-10) del objetivo

Resultados:
${output.substring(0, 2000)}`
  };
  
  const prompt = prompts[tool.toLowerCase()] || prompts.default;
  
  try {
    const analysis = await callOllamaAPI(prompt);
    
    const logs = readLogs();
    logs.push({ 
      timestamp: new Date().toISOString(), 
      user: req.user || 'anonymous', 
      service: 'AI-Analysis', 
      command: `analyze:${tool}`, 
      result: `Target: ${target || 'N/A'}\n${analysis}` 
    });
    writeLogs(logs);
    
    res.json({
      tool,
      target: target || 'N/A',
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al analizar con IA: ' + error.message });
  }
});

// Endpoints de playbooks
app.get('/playbooks', auth, (req, res) => {
  try {
    const playbooks = getPlaybooks();
    res.json(playbooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/playbook/run', auth, async (req, res) => {
  const { playbook_id, target } = req.body;
  
  if (!playbook_id || !target) {
    return res.status(400).json({ error: 'playbook_id and target required' });
  }
  
  try {
    const result = await runPlaybook(playbook_id, target, req.user);
    
    const logs = readLogs();
    logs.push({
      timestamp: new Date().toISOString(),
      user: req.user,
      service: 'Playbook',
      command: `playbook:${playbook_id}:${target}`,
      result: JSON.stringify(result)
    });
    writeLogs(logs);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener historial de investigaciones
app.get('/history', auth, async (req, res) => {
  try {
    const history = await redisClient.lRange('investigation_history', 0, 49); // Últimas 50
    const parsedHistory = history.map(entry => JSON.parse(entry));
    
    // Filtrar por usuario si no es admin
    const filteredHistory = req.role !== 'admin' 
      ? parsedHistory.filter(entry => entry.user === req.user)
      : parsedHistory;
    
    res.json(filteredHistory);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial: ' + error.message });
  }
});

// Endpoint para re-ejecutar investigación del historial
app.post('/history/replay/:id', auth, async (req, res) => {
  try {
    const history = await redisClient.lRange('investigation_history', 0, 99);
    const entry = history.map(e => JSON.parse(e)).find(e => e.id === req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }
    
    if (req.role !== 'admin' && entry.user !== req.user) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Re-ejecutar el comando
    const job = await jobQueue.add({
      service: entry.service,
      command: entry.command,
      user: req.user,
      jobId: Date.now().toString()
    });
    
    res.json({ 
      jobId: job.data.jobId,
      message: 'Re-ejecución iniciada',
      originalTarget: entry.target
    });
  } catch (error) {
    res.status(500).json({ error: 'Error re-ejecutando: ' + error.message });
  }
});

// Endpoint para generar reporte PDF
app.post('/report/pdf', auth, async (req, res) => {
  const { target, results, analysis } = req.body;
  
  if (!target || !results) {
    return res.status(400).json({ error: 'target y results requeridos' });
  }
  
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reporte de Seguridad - ${target}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 30px 0; }
            .critical { color: red; }
            .high { color: orange; }
            .medium { color: yellow; }
            .low { color: green; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>OrcSOC - Reporte de Seguridad</h1>
            <h2>Objetivo: ${target}</h2>
            <p>Fecha: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
            <h3>Resultados de Escaneo</h3>
            <pre>${results}</pre>
        </div>
        
        ${analysis ? `
        <div class="section">
            <h3>Análisis de Inteligencia Artificial</h3>
            <pre>${analysis}</pre>
        </div>
        ` : ''}
        
        <div class="section">
            <h3>Recomendaciones Generales</h3>
            <ul>
                <li>Revisar configuraciones de seguridad</li>
                <li>Actualizar software vulnerable</li>
                <li>Implementar monitoreo continuo</li>
                <li>Realizar pruebas de penetración regulares</li>
            </ul>
        </div>
    </body>
    </html>`;
    
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${target}-${Date.now()}.pdf`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: 'Error generando PDF: ' + error.message });
  }
});

// Endpoint para consultar APIs externas
app.get('/api/external/:service/:target', auth, async (req, res) => {
  const { service, target } = req.params;
  const apiKeys = {
    shodan: process.env.SHODAN_API_KEY,
    censys: process.env.CENSYS_API_KEY,
    haveibeenpwned: process.env.HIBP_API_KEY,
    virustotal: process.env.VIRUSTOTAL_API_KEY
  };
  
  try {
    let result = {};
    
    switch (service) {
      case 'shodan':
        if (!apiKeys.shodan) return res.status(400).json({ error: 'Shodan API key no configurada' });
        const shodanResponse = await axios.get(`https://api.shodan.io/shodan/host/${target}?key=${apiKeys.shodan}`);
        result = shodanResponse.data;
        break;
        
      case 'censys':
        if (!apiKeys.censys) return res.status(400).json({ error: 'Censys API keys no configuradas' });
        const censysResponse = await axios.get(`https://search.censys.io/api/v2/hosts/${target}`, {
          auth: {
            username: apiKeys.censys.split(':')[0],
            password: apiKeys.censys.split(':')[1]
          }
        });
        result = censysResponse.data;
        break;
        
      case 'haveibeenpwned':
        if (!apiKeys.haveibeenpwned) return res.status(400).json({ error: 'HIBP API key no configurada' });
        const hibpResponse = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${target}`, {
          headers: { 'hibp-api-key': apiKeys.haveibeenpwned }
        });
        result = hibpResponse.data;
        break;
        
      case 'virustotal':
        if (!apiKeys.virustotal) return res.status(400).json({ error: 'VirusTotal API key no configurada' });
        const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/domains/${target}`, {
          headers: { 'x-apikey': apiKeys.virustotal }
        });
        result = vtResponse.data;
        break;
        
      default:
        return res.status(400).json({ error: 'Servicio no soportado' });
    }
    
    // Guardar en logs
    const logs = readLogs();
    logs.push({
      timestamp: new Date().toISOString(),
      user: req.user,
      service: 'External-API',
      command: `${service}:${target}`,
      result: JSON.stringify(result).substring(0, 2000)
    });
    writeLogs(logs);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando API externa: ' + error.message });
  }
});

// Endpoint para obtener métricas de dashboard
app.get('/dashboard/metrics', auth, async (req, res) => {
  try {
    const history = await redisClient.lRange('investigation_history', 0, 999);
    const investigations = history.map(entry => JSON.parse(entry));
    
    // Filtrar por usuario si no es admin
    const userInvestigations = req.role !== 'admin' 
      ? investigations.filter(entry => entry.user === req.user)
      : investigations;
    
    // Calcular métricas
    const metrics = {
      total_investigations: userInvestigations.length,
      successful_scans: userInvestigations.filter(i => i.success).length,
      failed_scans: userInvestigations.filter(i => !i.success).length,
      avg_duration: userInvestigations.reduce((sum, i) => sum + i.duration, 0) / userInvestigations.length || 0,
      targets_scanned: [...new Set(userInvestigations.map(i => i.target))].length,
      recent_activity: userInvestigations.slice(0, 10),
      severity_distribution: {
        critical: userInvestigations.filter(i => i.result.toLowerCase().includes('critical')).length,
        high: userInvestigations.filter(i => i.result.toLowerCase().includes('high')).length,
        medium: userInvestigations.filter(i => i.result.toLowerCase().includes('medium')).length,
        low: userInvestigations.filter(i => i.result.toLowerCase().includes('low')).length
      },
      service_usage: userInvestigations.reduce((acc, i) => {
        acc[i.service] = (acc[i.service] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas: ' + error.message });
  }
});

// Endpoints de plugins
app.get('/plugins', auth, (req, res) => {
  try {
    const plugins = pluginManager.getAllPlugins();
    res.json(plugins.map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
      capabilities: p.capabilities
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/plugins/execute', auth, async (req, res) => {
  const { plugin_name, target, options } = req.body;
  
  if (!plugin_name || !target) {
    return res.status(400).json({ error: 'plugin_name y target requeridos' });
  }
  
  try {
    const result = await pluginManager.executePlugin(plugin_name, target, options);
    
    // Guardar en logs
    const logs = readLogs();
    logs.push({
      timestamp: new Date().toISOString(),
      user: req.user,
      service: 'Plugin',
      command: `plugin:${plugin_name}:${target}`,
      result: JSON.stringify(result).substring(0, 2000)
    });
    writeLogs(logs);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error ejecutando plugin: ' + error.message });
  }
});

app.post('/plugins/create', auth, (req, res) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'name y description requeridos' });
  }
  
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden crear plugins' });
  }
  
  try {
    const filepath = pluginManager.createPluginTemplate(name, description);
    res.json({ message: 'Plugin template creado', filepath });
  } catch (error) {
    res.status(500).json({ error: 'Error creando plugin: ' + error.message });
  }
});

// WebSocket para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('subscribe:jobs', () => {
    console.log('Cliente suscrito a jobs');
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`OrcSOC Ops Center (Enterprise) running on port ${PORT}`);
  console.log(`WebSocket enabled for real-time updates`);
  console.log(`Job Queue connected to Redis`);
  
  // Load plugins
  await pluginManager.loadPlugins();
  console.log(`Loaded ${pluginManager.getAllPlugins().length} plugins`);
});
