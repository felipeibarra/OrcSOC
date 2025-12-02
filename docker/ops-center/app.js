const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const Queue = require('bull');
const Joi = require('joi');
const { runPlaybook, getPlaybooks } = require('./playbook-engine');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
    /^nmap -[a-zA-Z]+ (?:-p [\d,-]+ )?[a-zA-Z0-9\.-]+$/,
    /^nikto -h https?:\/\/[a-zA-Z0-9\.-]+(:\d+)?$/,
    /^sqlmap -u https?:\/\/.+ --batch$/,
    /^wpscan --url https?:\/\/[a-zA-Z0-9\.-]+$/,
    /^gobuster dir -u https?:\/\/.+ -w .+$/
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
        id: 'nmap-rapido',
        name: 'Nmap Rápido (Top 100)',
        service: 'web-pentest',
        command: 'nmap -sV -F {{target}}',
        description: 'Escaneo de los 100 puertos más comunes con detección de versiones',
        tiempo: '30-60s',
        nivel: 'Básico'
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

// Endpoint de análisis IA mejorado
app.post('/analyze', auth, async (req, res) => {
  const { tool, output, target } = req.body;
  
  if (!tool || !output) {
    return res.status(400).json({ error: 'tool and output required' });
  }
  
  const prompts = {
    nmap: `Analiza este escaneo Nmap como experto en ciberseguridad:
1. Resumen ejecutivo
2. Puertos críticos y servicios expuestos  
3. Nivel de severidad (CRÍTICO/ALTO/MEDIO/BAJO)
4. Vector de ataque más probable
5. Recomendaciones inmediatas

Nmap Output:
${output.substring(0, 2000)}`,
    
    subfinder: `Analiza estos subdominios como analista OSINT:
1. Subdominios de alto interés
2. Posibles vectores de ataque
3. Exposición de información sensible
4. Priorización para investigación
5. Recomendaciones

Subdominios:
${output.substring(0, 2000)}`,
    
    harvester: `Analiza esta información OSINT:
1. Nivel de exposición de información
2. Datos sensibles encontrados
3. Riesgo de ingeniería social
4. Recomendaciones de protección

Resultados:
${output.substring(0, 2000)}`,
    
    sqlmap: `Analiza estas vulnerabilidades SQL:
1. Severidad y explotabilidad
2. Datos en riesgo
3. Impacto en negocio
4. Pasos de remediación urgentes

SQLmap:
${output.substring(0, 2000)}`,
    
    default: `Análisis de seguridad:
1. Hallazgos clave
2. Nivel de riesgo
3. Recomendaciones

Resultados:
${output.substring(0, 2000)}`
  };
  
  const prompt = prompts[tool.toLowerCase()] || prompts.default;
  
  try {
    const analysis = await new Promise((resolve, reject) => {
      exec(`docker exec ollama ollama run llama3.2 "${prompt.replace(/"/g, '\\"')}"`, 
        { maxBuffer: 1024 * 1024 * 10, timeout: 90000 }, 
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout.trim());
        }
      );
    });
    
    const logs = readLogs();
    logs.push({ 
      timestamp: new Date().toISOString(), 
      user: req.user, 
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
    res.status(500).json({ error: error.message });
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`OrcSOC Ops Center (Enhanced) running on port ${PORT}`);
  console.log(`WebSocket enabled for real-time updates`);
  console.log(`Job Queue connected to Redis`);
});
