#!/usr/bin/env python3
"""
Subfinder Wrapper - Returns structured JSON output
Usage: python subfinder_wrapper.py --domain example.com
"""
import json
import subprocess
import argparse

def run_subfinder(domain):
    """Execute Subfinder and return subdomains"""
    try:
        cmd = ["subfinder", "-d", domain, "-silent", "-json"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        
        subdomains = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    if 'host' in data:
                        subdomains.append(data['host'])
                except:
                    # Fallback to plain text parsing
                    subdomains.append(line.strip())
        
        return {
            "tool": "Subfinder",
            "target": domain,
            "status": "success",
            "results": {
                "subdomains": list(set(subdomains)),
                "count": len(set(subdomains))
            }
        }
    except subprocess.TimeoutExpired:
        return {"tool": "Subfinder", "status": "error", "error": "Timeout"}
    except Exception as e:
        return {"tool": "Subfinder", "status": "error", "error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Subfinder wrapper")
    parser.add_argument("--domain", required=True, help="Target domain")
    args = parser.parse_args()
    
    result = run_subfinder(args.domain)
    print(json.dumps(result, indent=2))
