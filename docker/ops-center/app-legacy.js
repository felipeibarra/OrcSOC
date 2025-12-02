const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { runPlaybook, getPlaybooks } = require('./playbook-engine');
const app = express();

// Archivo para logs
const logsFile = path.join(__dirname, 'logs.json');

// Función para leer logs
const readLogs = () => {
  if (fs.existsSync(logsFile)) {
    return JSON.parse(fs.readFileSync(logsFile, 'utf8'));
  }
  return [];
};

// Función para escribir logs
const writeLogs = (logs) => {
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
};

// Usuarios con roles (simple, en producción usar DB)
const users = { 
  admin: { password: 'password', role: 'admin' }, 
  user: { password: 'pass', role: 'user' } 
};

// Middleware de autenticación básica con roles
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
app.use(express.static('public')); // Servir archivos estáticos

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint para ejecutar comando (protegido)
app.post('/exec/:service', auth, (req, res) => {
  const service = req.params.service;
  const command = req.body.command;
  const timestamp = new Date().toISOString();
  exec(`docker exec ${service} ${command}`, (error, stdout, stderr) => {
    const result = error ? stderr : stdout;
    // Guardar log
    const logs = readLogs();
    logs.push({ timestamp, user: req.user, service, command, result });
    writeLogs(logs);
    if (error) {
      res.status(500).send(result);
    } else {
      res.send(result);
    }
  });
});

// Endpoint para ver logs (protegido, con filtros y roles)
app.get('/logs', auth, (req, res) => {
  let logs = readLogs();
  const { user, service, date } = req.query;

  // Filtrar por usuario si no es admin
  if (req.role !== 'admin') {
    logs = logs.filter(log => log.user === req.user);
  }

  // Filtros adicionales
  if (user) logs = logs.filter(log => log.user === user);
  if (service) logs = logs.filter(log => log.service === service);
  if (date) logs = logs.filter(log => log.timestamp.startsWith(date)); // YYYY-MM-DD

  res.json(logs);
});

// Endpoint para chat con IA (Ollama)
app.post('/ai-chat', auth, (req, res) => {
  const prompt = req.body.prompt;
  // Llamar a Ollama con modelo llama3.2
  exec(`docker exec ollama ollama run llama3.2 "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(stderr);
    } else {
      res.send(stdout);
    }
  });
});

// Endpoint para análisis automático con IA
app.post('/analyze', auth, (req, res) => {
  const { tool, output, target } = req.body;
  
  if (!tool || !output) {
    return res.status(400).json({ error: 'tool and output are required' });
  }
  
  // Prompts estructurados según tipo de herramienta
  const prompts = {
    nmap: `Analiza este escaneo Nmap y proporciona:
1. Resumen ejecutivo de hallazgos
2. Puertos críticos abiertos y servicios
3. Nivel de severidad (Alta/Media/Baja)
4. Recomendaciones de siguiente paso
5. Storytelling de ataque potencial

Output Nmap:
${output.substring(0, 2000)}`,
    
    subfinder: `Analiza estos subdominios encontrados y proporciona:
1. Resumen de subdominios interesantes
2. Posibles vectores de ataque
3. Subdominios que merecen investigación adicional
4. Recomendaciones

Subdominios:
${output.substring(0, 2000)}`,
    
    harvester: `Analiza esta información OSINT y proporciona:
1. Resumen de emails y hosts encontrados
2. Posible exposición de información sensible
3. Nivel de riesgo
4. Recomendaciones de protección

Resultados:
${output.substring(0, 2000)}`,
    
    sqlmap: `Analiza estos resultados de SQLmap y proporciona:
1. Resumen de vulnerabilidades SQL encontradas
2. Severidad y explotabilidad
3. Impacto potencial
4. Recomendaciones de remediación

Resultados SQLmap:
${output.substring(0, 2000)}`,
    
    default: `Analiza estos resultados de herramienta de seguridad y proporciona:
1. Resumen ejecutivo
2. Hallazgos clave
3. Nivel de riesgo
4. Recomendaciones

Resultados:
${output.substring(0, 2000)}`
  };
  
  const prompt = prompts[tool.toLowerCase()] || prompts.default;
  
  exec(`docker exec ollama ollama run llama3.2 "${prompt.replace(/"/g, '\\"')}"`, 
    { maxBuffer: 1024 * 1024 * 10 }, 
    (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ error: stderr || error.message });
      } else {
        const analysis = stdout.trim();
        
        // Guardar análisis en logs
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
      }
    }
  );
});

// Endpoint para listar playbooks
app.get('/playbooks', auth, (req, res) => {
  try {
    const playbooks = getPlaybooks();
    res.json(playbooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para ejecutar playbook
app.post('/playbook/run', auth, async (req, res) => {
  const { playbook_id, target } = req.body;
  
  if (!playbook_id || !target) {
    return res.status(400).json({ error: 'playbook_id and target are required' });
  }
  
  try {
    const result = await runPlaybook(playbook_id, target, req.user);
    
    // Guardar en logs
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OrcSOC Ops Center running on port ${PORT}`);
});
