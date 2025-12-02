const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load playbook definitions
const playbooksFile = path.join(__dirname, 'playbooks.json');
const playbooks = JSON.parse(fs.readFileSync(playbooksFile, 'utf8')).playbooks;

/**
 * Execute a single playbook step
 */
function executeStep(service, command) {
  return new Promise((resolve, reject) => {
    const cmd = `docker exec ${service} ${command}`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: stderr || error.message, output: '' });
      } else {
        resolve({ success: true, output: stdout, error: '' });
      }
    });
  });
}

/**
 * Run a complete playbook
 */
async function runPlaybook(playbookId, target, user, options = {}) {
  const playbook = playbooks.find(p => p.id === playbookId);
  
  if (!playbook) {
    return { error: `Playbook ${playbookId} not found` };
  }

  const results = {
    playbook: playbook.name,
    target,
    timestamp: new Date().toISOString(),
    steps: [],
    aggregated_output: ''
  };

  // Execute steps sequentially with optional delays for stealth mode
  for (const step of playbook.steps) {
    const command = step.command.replace(/{{target}}/g, target);
    
    console.log(`Executing: ${step.description}`);
    
    const stepStart = Date.now();
    const result = await executeStep(step.service, command);
    const duration = Date.now() - stepStart;
    
    results.steps.push({
      description: step.description,
      service: step.service,
      command: command,
      duration_ms: duration,
      success: result.success,
      output: result.output.substring(0, 2000), // Limit output
      error: result.error
    });

    // Aggregate outputs for AI analysis
    results.aggregated_output += `\n=== ${step.description} ===\n${result.output.substring(0, 1000)}\n`;
    
    // Add delay between steps if stealth mode is enabled
    if (options.stealth && step !== playbook.steps[playbook.steps.length - 1]) {
      const delay = options.delay || 5000; // Default 5 seconds
      console.log(`Stealth mode: waiting ${delay}ms before next step`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // AI Analysis if enabled
  if (playbook.ai_analysis) {
    const aiPrompt = `Analiza estos resultados de playbook de seguridad y proporciona:
1. Resumen ejecutivo de hallazgos
2. Hallazgos críticos que requieren atención inmediata
3. Nivel de riesgo general
4. Recomendaciones priorizadas

Playbook: ${playbook.name}
Target: ${target}

Resultados:
${results.aggregated_output.substring(0, 3000)}`;

    try {
      const aiResult = await new Promise((resolve, reject) => {
        exec(
          `docker exec ollama ollama run llama3.2 "${aiPrompt.replace(/"/g, '\\"')}"`,
          { maxBuffer: 1024 * 1024 * 10 },
          (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout.trim());
          }
        );
      });
      
      results.ai_analysis = aiResult;
    } catch (e) {
      results.ai_analysis_error = e.message;
    }
  }

  return results;
}

/**
 * Get list of available playbooks
 */
function getPlaybooks() {
  return playbooks.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    steps_count: p.steps.length,
    ai_analysis: p.ai_analysis
  }));
}

module.exports = {
  runPlaybook,
  getPlaybooks
};
