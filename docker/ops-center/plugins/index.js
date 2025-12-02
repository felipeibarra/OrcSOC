const fs = require('fs');
const path = require('path');

/**
 * Plugin Manager for OrcSOC
 * Allows loading and managing security tools as plugins
 */
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.pluginDir = path.join(__dirname, 'plugins');
    this.ensurePluginDirectory();
  }

  ensurePluginDirectory() {
    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
    }
  }

  /**
   * Load all plugins from the plugins directory
   */
  async loadPlugins() {
    const pluginFiles = fs.readdirSync(this.pluginDir).filter(file =>
      file.endsWith('.js') && file !== 'index.js'
    );

    for (const file of pluginFiles) {
      try {
        const pluginPath = path.join(this.pluginDir, file);
        const plugin = require(pluginPath);

        if (this.validatePlugin(plugin)) {
          this.plugins.set(plugin.name, plugin);
          console.log(`Plugin loaded: ${plugin.name} v${plugin.version}`);
        } else {
          console.error(`Invalid plugin: ${file}`);
        }
      } catch (error) {
        console.error(`Error loading plugin ${file}:`, error.message);
      }
    }
  }

  /**
   * Validate plugin structure
   */
  validatePlugin(plugin) {
    return plugin &&
           typeof plugin.name === 'string' &&
           typeof plugin.version === 'string' &&
           typeof plugin.description === 'string' &&
           typeof plugin.execute === 'function' &&
           Array.isArray(plugin.capabilities);
  }

  /**
   * Get plugin by name
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Get all plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capability) {
    return Array.from(this.plugins.values()).filter(plugin =>
      plugin.capabilities.includes(capability)
    );
  }

  /**
   * Execute a plugin
   */
  async executePlugin(pluginName, target, options = {}) {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    try {
      const result = await plugin.execute(target, options);
      return {
        plugin: pluginName,
        version: plugin.version,
        timestamp: new Date().toISOString(),
        target,
        success: true,
        result
      };
    } catch (error) {
      return {
        plugin: pluginName,
        version: plugin.version,
        timestamp: new Date().toISOString(),
        target,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new plugin template
   */
  createPluginTemplate(name, description) {
    const template = `/**
 * ${name} Plugin for OrcSOC
 * ${description}
 */

module.exports = {
  name: '${name.toLowerCase().replace(/\s+/g, '-')}',
  version: '1.0.0',
  description: '${description}',
  author: 'OrcSOC Team',
  capabilities: ['recon', 'scan', 'analysis'], // Add relevant capabilities

  /**
   * Execute the plugin
   * @param {string} target - The target to analyze
   * @param {object} options - Plugin options
   * @returns {Promise<object>} - Plugin results
   */
  async execute(target, options = {}) {
    try {
      // Implement your plugin logic here
      console.log(\`Executing ${this.name} on target: \${target}\`);

      // Example implementation - replace with actual logic
      const result = {
        target,
        timestamp: new Date().toISOString(),
        findings: [],
        metadata: {
          plugin: this.name,
          version: this.version
        }
      };

      // Simulate some processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return result;
    } catch (error) {
      throw new Error(\`Plugin execution failed: \${error.message}\`);
    }
  }
};`;

    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.js`;
    const filepath = path.join(this.pluginDir, filename);

    fs.writeFileSync(filepath, template);
    console.log(`Plugin template created: ${filepath}`);
    return filepath;
  }
};

module.exports = PluginManager;