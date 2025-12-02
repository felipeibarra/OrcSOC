#!/usr/bin/env python3
"""
OSINT Enrichment Orchestrator
Runs multiple OSINT tools in parallel and aggregates results
Usage: python enrich.py --target example.com --type domain
"""
import json
import subprocess
import argparse
import concurrent.futures
from pathlib import Path

def run_tool(tool_func):
    """Execute a tool function and return its result"""
    try:
        return tool_func()
    except Exception as e:
        return {"error": str(e)}

def enrich_domain(domain):
    """Run comprehensive domain reconnaissance"""
    results = {
        "target": domain,
        "type": "domain",
        "tools_executed": []
    }
    
    # Define tools to run
    tools = {
        "subfinder": lambda: subprocess.run(
            ["python", "tools/subfinder_wrapper.py", "--domain", domain],
            capture_output=True, text=True, timeout=180
        ),
        "harvester": lambda: subprocess.run(
            ["python", "tools/harvester_wrapper.py", "--domain", domain, "--sources", "google,bing"],
            capture_output=True, text=True, timeout=300
        ),
        "whois": lambda: subprocess.run(
            ["whois", domain],
            capture_output=True, text=True, timeout=30
        ),
        "nslookup": lambda: subprocess.run(
            ["nslookup", domain],
            capture_output=True, text=True, timeout=30
        )
    }
    
    # Execute tools in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_tool = {executor.submit(tools[name]): name for name in tools}
        
        for future in concurrent.futures.as_completed(future_to_tool):
            tool_name = future_to_tool[future]
            try:
                result = future.result()
                if result.returncode == 0:
                    # Try to parse JSON output
                    try:
                        tool_output = json.loads(result.stdout)
                    except:
                        tool_output = {"raw": result.stdout[:500]}
                    
                    results["tools_executed"].append({
                        "tool": tool_name,
                        "status": "success",
                        "output": tool_output
                    })
                else:
                    results["tools_executed"].append({
                        "tool": tool_name,
                        "status": "error",
                        "error": result.stderr[:200]
                    })
            except Exception as e:
                results["tools_executed"].append({
                    "tool": tool_name,
                    "status": "error",
                    "error": str(e)
                })
    
    # Aggregate findings
    all_subdomains = set()
    all_emails = set()
    all_ips = set()
    
    for tool_result in results["tools_executed"]:
        if tool_result["status"] == "success" and "output" in tool_result:
            output = tool_result["output"]
            if "results" in output:
                if "subdomains" in output["results"]:
                    all_subdomains.update(output["results"]["subdomains"])
                if "emails" in output["results"]:
                    all_emails.update(output["results"]["emails"])
                if "ips" in output["results"]:
                    all_ips.update(output["results"]["ips"])
    
    results["aggregated"] = {
        "subdomains": list(all_subdomains),
        "emails": list(all_emails),
        "ips": list(all_ips),
        "summary": {
            "total_subdomains": len(all_subdomains),
            "total_emails": len(all_emails),
            "total_ips": len(all_ips)
        }
    }
    
    return results

def enrich_ip(ip):
    """Run IP reconnaissance"""
    results = {
        "target": ip,
        "type": "ip",
        "tools_executed": []
    }
    
    # Nmap scan
    try:
        result = subprocess.run(
            ["nmap", "-sV", "-p", "1-1000", ip],
            capture_output=True, text=True, timeout=120
        )
        results["tools_executed"].append({
            "tool": "nmap",
            "status": "success",
            "output": result.stdout[:1000]
        })
    except Exception as e:
        results["tools_executed"].append({
            "tool": "nmap",
            "status": "error",
            "error": str(e)
        })
    
    # Whois
    try:
        result = subprocess.run(
            ["whois", ip],
            capture_output=True, text=True, timeout=30
        )
        results["tools_executed"].append({
            "tool": "whois",
            "status": "success",
            "output": result.stdout[:500]
        })
    except Exception as e:
        results["tools_executed"].append({
            "tool": "whois",
            "status": "error",
            "error": str(e)
        })
    
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OSINT Enrichment Orchestrator")
    parser.add_argument("--target", required=True, help="Target to enrich")
    parser.add_argument("--type", choices=["domain", "ip", "email"], default="domain", help="Target type")
    args = parser.parse_args()
    
    if args.type == "domain":
        result = enrich_domain(args.target)
    elif args.type == "ip":
        result = enrich_ip(args.target)
    else:
        result = {"error": "Email enrichment not yet implemented"}
    
    print(json.dumps(result, indent=2))
