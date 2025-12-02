#!/usr/bin/env python3
"""
Amass Wrapper - Returns structured JSON output
Usage: python amass_wrapper.py --domain example.com
"""
import json
import subprocess
import argparse

def run_amass(domain):
    """Execute Amass enum and return results"""
    try:
        cmd = ["amass", "enum", "-passive", "-d", domain, "-json", "/tmp/amass_out.json"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        subdomains = []
        ips = []
        
        # Parse JSON output
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    if 'name' in data:
                        subdomains.append(data['name'])
                    if 'addresses' in data:
                        for addr in data['addresses']:
                            if 'ip' in addr:
                                ips.append(addr['ip'])
                except:
                    pass
        
        return {
            "tool": "Amass",
            "target": domain,
            "status": "success",
            "results": {
                "subdomains": list(set(subdomains)),
                "ips": list(set(ips)),
                "count": len(set(subdomains))
            }
        }
    except subprocess.TimeoutExpired:
        return {"tool": "Amass", "status": "error", "error": "Timeout"}
    except Exception as e:
        return {"tool": "Amass", "status": "error", "error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Amass wrapper")
    parser.add_argument("--domain", required=True, help="Target domain")
    args = parser.parse_args()
    
    result = run_amass(args.domain)
    print(json.dumps(result, indent=2))
