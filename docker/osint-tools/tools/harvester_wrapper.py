#!/usr/bin/env python3
"""
theHarvester Wrapper - Returns structured JSON output
Usage: python harvester_wrapper.py --domain example.com --sources google,bing
"""
import json
import subprocess
import argparse
import sys

def run_harvester(domain, sources="google,bing,duckduckgo"):
    """Execute theHarvester and parse output"""
    try:
        cmd = ["theHarvester", "-d", domain, "-b", sources, "-f", f"/tmp/{domain}_harvest"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        # Parse output for emails, hosts, IPs
        output = result.stdout
        
        emails = []
        hosts = []
        ips = []
        
        for line in output.split('\n'):
            if '@' in line and not line.startswith('['):
                emails.append(line.strip())
            elif line.strip() and '.' in line and not line.startswith('['):
                if any(c.isdigit() for c in line.split('.')[0]):
                    ips.append(line.strip())
                else:
                    hosts.append(line.strip())
        
        return {
            "tool": "theHarvester",
            "target": domain,
            "sources": sources,
            "status": "success",
            "results": {
                "emails": list(set(emails)),
                "hosts": list(set(hosts)),
                "ips": list(set(ips))
            },
            "raw_output": output[:1000]  # Limit raw output
        }
    except subprocess.TimeoutExpired:
        return {"tool": "theHarvester", "status": "error", "error": "Timeout"}
    except Exception as e:
        return {"tool": "theHarvester", "status": "error", "error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="theHarvester wrapper")
    parser.add_argument("--domain", required=True, help="Target domain")
    parser.add_argument("--sources", default="google,bing", help="Sources to use")
    args = parser.parse_args()
    
    result = run_harvester(args.domain, args.sources)
    print(json.dumps(result, indent=2))
