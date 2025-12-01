const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
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
  // Llamar a Ollama (asumiendo modelo llama2)
  exec(`docker exec ollama ollama run llama2 "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(stderr);
    } else {
      res.send(stdout);
    }
  });
});