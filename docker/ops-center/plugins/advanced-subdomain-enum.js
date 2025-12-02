/**
 * Advanced Subdomain Enumerator Plugin
 * Uses multiple sources for comprehensive subdomain discovery
 */

const { exec } = require('child_process');

module.exports = {
  name: 'advanced-subdomain-enum',
  version: '1.0.0',
  description: 'Advanced subdomain enumeration using multiple techniques',
  author: 'OrcSOC Team',
  capabilities: ['recon', 'osint', 'subdomain'],

  /**
   * Execute the plugin
   * @param {string} target - The target domain
   * @param {object} options - Plugin options
   * @returns {Promise<object>} - Plugin results
   */
  async execute(target, options = {}) {
    try {
      console.log(`Advanced subdomain enumeration for: ${target}`);

      const results = {
        target,
        timestamp: new Date().toISOString(),
        subdomains: new Set(),
        sources: [],
        metadata: {
          plugin: this.name,
          version: this.version,
          stealth_mode: options.stealth || false
        }
      };

      // Certificate transparency logs
      try {
        const certspotterCmd = `curl -s "https://api.certspotter.com/v1/issuances?domain=${target}&include_subdomains=true&expand=dns_names" | jq -r '.[].dns_names[]' 2>/dev/null || echo ""`;
        const certspotterResult = await this.runCommand(certspotterCmd);
        if (certspotterResult) {
          const subdomains = certspotterResult.split('\n').filter(s => s.trim());
          subdomains.forEach(sub => results.subdomains.add(sub));
          results.sources.push({ source: 'certspotter', count: subdomains.length });
        }
      } catch (e) {
        console.log('Certspotter query failed');
      }

      // DNS brute force (limited for stealth)
      if (!options.stealth) {
        try {
          const bruteCmd = `docker exec osint-tools python tools/subfinder_wrapper.py --domain ${target} --brute`;
          const bruteResult = await this.runCommand(bruteCmd);
          if (bruteResult) {
            const subdomains = this.extractSubdomains(bruteResult);
            subdomains.forEach(sub => results.subdomains.add(sub));
            results.sources.push({ source: 'brute_force', count: subdomains.length });
          }
        } catch (e) {
          console.log('Brute force failed');
        }
      }

      // Public records
      try {
        const publicCmd = `docker exec osint-tools python tools/subfinder_wrapper.py --domain ${target}`;
        const publicResult = await this.runCommand(publicCmd);
        if (publicResult) {
          const subdomains = this.extractSubdomains(publicResult);
          subdomains.forEach(sub => results.subdomains.add(sub));
          results.sources.push({ source: 'public_sources', count: subdomains.length });
        }
      } catch (e) {
        console.log('Public sources query failed');
      }

      // Convert Set to Array and sort
      results.subdomains = Array.from(results.subdomains).sort();
      results.total_subdomains = results.subdomains.length;

      // Calculate risk score based on findings
      results.risk_score = this.calculateRiskScore(results);

      return results;
    } catch (error) {
      throw new Error(`Plugin execution failed: ${error.message}`);
    }
  },

  /**
   * Run shell command
   */
  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error && !stdout) {
          resolve('');
        } else {
          resolve(stdout || stderr);
        }
      });
    });
  },

  /**
   * Extract subdomains from output
   */
  extractSubdomains(output) {
    const subdomainRegex = /\b([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b/g;
    const matches = output.match(subdomainRegex) || [];
    return matches.filter(subdomain => subdomain.includes(this.target));
  },

  /**
   * Calculate risk score based on subdomain findings
   */
  calculateRiskScore(results) {
    let score = 1; // Base score

    // More subdomains = higher exposure
    if (results.total_subdomains > 50) score += 2;
    else if (results.total_subdomains > 20) score += 1;

    // Check for sensitive subdomains
    const sensitivePatterns = ['admin', 'api', 'dev', 'test', 'staging', 'internal'];
    const sensitiveCount = results.subdomains.filter(sub =>
      sensitivePatterns.some(pattern => sub.toLowerCase().includes(pattern))
    ).length;

    if (sensitiveCount > 5) score += 2;
    else if (sensitiveCount > 2) score += 1;

    return Math.min(score, 10); // Max score of 10
  }
};