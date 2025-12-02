# OrcSOC Plugin Development Guide

## Overview

OrcSOC's plugin system allows you to extend the platform's capabilities without modifying the core codebase. Plugins are modular components that can add new scanning tools, analysis capabilities, or integrations.

## Plugin Architecture

### Plugin Structure
```javascript
module.exports = {
  name: 'plugin-name',
  version: '1.0.0',
  description: 'Brief description of what the plugin does',
  capabilities: ['recon', 'analysis', 'reporting'], // Plugin categories
  dependencies: ['tool1', 'tool2'], // Optional: required tools/services
  
  // Main execution method
  async execute(target, options = {}) {
    // Plugin logic here
    return {
      target,
      findings: [],
      risk_score: 0,
      metadata: {}
    };
  },
  
  // Optional: Validate plugin configuration
  async validate() {
    return { valid: true, errors: [] };
  }
};
```

### Plugin Capabilities
- `recon`: Reconnaissance and information gathering
- `analysis`: Data analysis and correlation
- `reporting`: Report generation and formatting
- `integration`: External API integrations
- `visualization`: Data visualization components

## Creating Your First Plugin

### 1. Plugin Directory Structure
```
plugins/
├── my-plugin.js
├── advanced-subdomain-enum.js (example)
└── risk-correlator.js (example)
```

### 2. Basic Plugin Template
```javascript
const axios = require('axios');

module.exports = {
  name: 'dns-enumerator',
  version: '1.0.0',
  description: 'Advanced DNS enumeration with multiple resolvers',
  capabilities: ['recon'],
  dependencies: ['dig', 'nslookup'],
  
  async execute(target, options = {}) {
    try {
      const results = {
        target,
        findings: [],
        risk_score: 0,
        metadata: {
          timestamp: new Date().toISOString(),
          plugin_version: this.version
        }
      };
      
      // DNS enumeration logic
      const records = await this.enumerateDNS(target, options);
      
      results.findings = records.map(record => ({
        type: 'dns_record',
        data: record,
        severity: this.calculateSeverity(record),
        description: `${record.type} record found: ${record.value}`
      }));
      
      results.risk_score = this.calculateRiskScore(results.findings);
      
      return results;
    } catch (error) {
      throw new Error(`DNS enumeration failed: ${error.message}`);
    }
  },
  
  async enumerateDNS(domain, options) {
    // Implementation here
    return [];
  },
  
  calculateSeverity(record) {
    // Risk assessment logic
    return 'info';
  },
  
  calculateRiskScore(findings) {
    // Risk scoring algorithm
    return findings.length > 10 ? 7 : 3;
  }
};
```

## Advanced Plugin Features

### Using External APIs
```javascript
module.exports = {
  name: 'threat-intel-checker',
  version: '1.0.0',
  description: 'Check target against threat intelligence feeds',
  capabilities: ['analysis'],
  
  async execute(target, options = {}) {
    const apiKey = process.env.THREATINTEL_API_KEY;
    if (!apiKey) {
      throw new Error('THREATINTEL_API_KEY environment variable required');
    }
    
    const response = await axios.get(`https://api.threatintel.com/check/${target}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    return {
      target,
      findings: response.data.indicators.map(indicator => ({
        type: 'threat_indicator',
        data: indicator,
        severity: indicator.severity,
        description: `Threat detected: ${indicator.description}`
      })),
      risk_score: response.data.risk_score,
      metadata: {
        source: 'threatintel-api',
        last_updated: response.data.last_updated
      }
    };
  }
};
```

### Integration with Existing Tools
```javascript
const { spawn } = require('child_process');

module.exports = {
  name: 'custom-scanner',
  version: '1.0.0',
  description: 'Custom vulnerability scanner',
  capabilities: ['recon', 'analysis'],
  dependencies: ['nmap', 'nikto'],
  
  async execute(target, options = {}) {
    // Use existing tools via command execution
    const nmapResults = await this.runNmap(target, options);
    const niktoResults = await this.runNikto(target, options);
    
    // Correlate and analyze results
    const correlatedFindings = this.correlateResults(nmapResults, niktoResults);
    
    return {
      target,
      findings: correlatedFindings,
      risk_score: this.calculateRiskScore(correlatedFindings),
      metadata: {
        tools_used: ['nmap', 'nikto'],
        scan_duration: Date.now() - startTime
      }
    };
  },
  
  async runNmap(target, options) {
    return new Promise((resolve, reject) => {
      const nmap = spawn('nmap', ['-sV', '-p-', target]);
      let output = '';
      
      nmap.stdout.on('data', (data) => output += data);
      nmap.stderr.on('data', (data) => output += data);
      
      nmap.on('close', (code) => {
        if (code === 0) {
          resolve(this.parseNmapOutput(output));
        } else {
          reject(new Error(`Nmap failed with code ${code}`));
        }
      });
    });
  },
  
  parseNmapOutput(output) {
    // Parse nmap output and return structured data
    return [];
  }
};
```

### Real-time Progress Updates
```javascript
module.exports = {
  name: 'progress-aware-plugin',
  version: '1.0.0',
  description: 'Plugin with progress reporting',
  capabilities: ['recon'],
  
  async execute(target, options = {}) {
    const progressCallback = options.progressCallback;
    
    // Phase 1: Initial setup
    progressCallback && progressCallback({ phase: 'setup', progress: 10 });
    
    // Phase 2: Data collection
    progressCallback && progressCallback({ phase: 'collection', progress: 30 });
    
    // Phase 3: Analysis
    progressCallback && progressCallback({ phase: 'analysis', progress: 70 });
    
    // Phase 4: Finalization
    progressCallback && progressCallback({ phase: 'finalization', progress: 100 });
    
    return {
      target,
      findings: [],
      risk_score: 5
    };
  }
};
```

## Plugin Validation and Testing

### Plugin Validation
```javascript
module.exports = {
  // ... plugin definition ...
  
  async validate() {
    const errors = [];
    
    // Check required environment variables
    if (!process.env.REQUIRED_API_KEY) {
      errors.push('REQUIRED_API_KEY environment variable is required');
    }
    
    // Check dependencies
    for (const dep of this.dependencies) {
      if (!await this.checkDependency(dep)) {
        errors.push(`Dependency ${dep} is not available`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  async checkDependency(tool) {
    // Check if tool is available in system
    return true; // Implementation here
  }
};
```

### Testing Your Plugin
```javascript
// test-plugin.js
const plugin = require('./my-plugin');

async function testPlugin() {
  try {
    // Validate plugin
    const validation = await plugin.validate();
    if (!validation.valid) {
      console.error('Plugin validation failed:', validation.errors);
      return;
    }
    
    // Test execution
    const result = await plugin.execute('example.com', {
      progressCallback: (progress) => console.log('Progress:', progress)
    });
    
    console.log('Plugin executed successfully:', result);
  } catch (error) {
    console.error('Plugin test failed:', error);
  }
}

testPlugin();
```

## Best Practices

### 1. Error Handling
```javascript
async execute(target, options = {}) {
  try {
    // Plugin logic
  } catch (error) {
    // Log error details
    console.error(`Plugin ${this.name} failed:`, error);
    
    // Return partial results if possible
    return {
      target,
      findings: [],
      risk_score: 0,
      error: error.message,
      metadata: { partial: true }
    };
  }
}
```

### 2. Resource Management
```javascript
async execute(target, options = {}) {
  let resources = [];
  
  try {
    // Allocate resources
    const connection = await this.createConnection();
    resources.push(connection);
    
    // Use resources
    const results = await this.performAnalysis(connection, target);
    
    return results;
  } finally {
    // Clean up resources
    for (const resource of resources) {
      try {
        await resource.close();
      } catch (e) {
        console.warn('Failed to clean up resource:', e);
      }
    }
  }
}
```

### 3. Configuration Management
```javascript
module.exports = {
  // ... plugin definition ...
  
  getConfig() {
    return {
      timeout: process.env.PLUGIN_TIMEOUT || 30000,
      retries: parseInt(process.env.PLUGIN_RETRIES) || 3,
      apiKey: process.env.PLUGIN_API_KEY
    };
  },
  
  async execute(target, options = {}) {
    const config = this.getConfig();
    // Use config in execution
  }
};
```

## Plugin Registry

### Registering Your Plugin
1. Place your plugin file in the `plugins/` directory
2. Ensure it exports a valid plugin object
3. Restart the OrcSOC application to load the plugin
4. The plugin will be automatically discovered and validated

### Plugin Discovery
The PluginManager automatically scans the `plugins/` directory for:
- Files ending in `.js`
- Valid plugin exports with required properties
- Plugins that pass validation

## Example Plugins

### Advanced Subdomain Enumeration
See `plugins/advanced-subdomain-enum.js` for a complete example of:
- Multiple data sources integration
- Progress reporting
- Risk scoring
- Error handling

### Risk Correlation Engine
See `plugins/risk-correlator.js` for an example of:
- Data correlation algorithms
- Machine learning integration
- Advanced risk assessment
- Visualization data preparation

## Contributing Plugins

1. Follow the plugin structure guidelines
2. Include comprehensive documentation
3. Add unit tests for your plugin
4. Submit a pull request with your plugin
5. Include example usage and configuration

## Troubleshooting

### Common Issues
- **Plugin not loading**: Check plugin structure and validation errors
- **Dependencies missing**: Ensure required tools are installed in containers
- **API failures**: Verify environment variables and network connectivity
- **Performance issues**: Implement timeouts and resource limits

### Debug Mode
Enable debug logging to troubleshoot plugin issues:
```bash
DEBUG=orcsoc:plugins npm start
```

This guide provides the foundation for creating powerful, extensible plugins for OrcSOC. Start with the basic template and gradually add advanced features as needed.