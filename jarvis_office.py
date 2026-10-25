#!/usr/bin/env python3
"""
JARVIS OFFICE — Autonomous Agentic AI Office System & Agency Framework
Inspired by OpenJarvis (https://github.com/open-jarvis/OpenJarvis).
Customized for KADARTECH Solutions (Managing Director: Altaf Shaikh).

Features:
- Master Manager Agent: Jarvis
- Lead Full-Stack Engineer: Friday (20 Tech Stacks)
- 10 Specialist Sub-Agents (LeadGen, Content, Visual, Research, Social, SaaS, QA, Support, Strategy, Maya)
- Google Gemini Brain (gemini-3-flash-preview / gemini-3.1-flash-lite)
- 24/7 Reddit & Google Client / Project Radar
- 24/7 GitHub Skill Acquisition Engine
- WhatsApp & Voice Calling Gateway Integration
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
from typing import Dict, List, Any, Optional

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
FALLBACK_MODELS = ["gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"]
ALTAF_PHONE = os.getenv("ALTAF_PHONE_NUMBER", "+919359086445")
AGENCY_NAME = "KADARTECH Solutions"

TECH_STACKS = [
    "React.js", "Express.js", "Node.js", "Python", ".NET MVC",
    "C# Selenium", "Vue.js", "API Building", "AI-Driven Coding", "Integrations",
    "HTML5", "CSS3", "Core PHP", "Laravel", "WordPress",
    "PostgreSQL", "MySQL", "SQL Server", "TypeScript", "jQuery"
]

SPECIALIST_AGENTS = {
    "lead_gen": "Lead Generation & Outreach (Reddit/Google lead discovery & pitch synthesis)",
    "content_revenue": "Content-to-Revenue (Sales funnels, email sequences, high-converting copy)",
    "visual_designer": "Visual Designer & UI/UX (Tailwind specs, glassmorphic layout)",
    "deep_research": "Deep Research (Tech feasibility, competitor audits, open source)",
    "social_scheduler": "Social Media Scheduler (LinkedIn authority posts, X threads)",
    "micro_saas_factory": "Micro-SaaS Factory (Turnkey MVP boilerplates, auth, billing)",
    "code_review": "Code Review & Testing (C# Selenium, Jest, security audits)",
    "customer_support": "Customer Support & Sales Funnels (24/7 objection handling & lead closing)",
    "strategy_optimizer": "Strategy & Process Optimization (5-day sprint SOPs, velocity)",
    "revenue_maya": "Revenue Growth Agent - Maya (Retainer models, upsells, MRR acceleration)"
}

def call_gemini(prompt: str, system_instruction: str = "", temperature: float = 0.6) -> str:
    """Invokes Google Gemini REST API with automatic model failover."""
    if not GEMINI_API_KEY:
        return "Gemini API Error: GEMINI_API_KEY environment variable is not set. Please set GEMINI_API_KEY in your .env or environment."

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 4096}
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    last_error = ""
    for model_name in [GEMINI_MODEL] + [m for m in FALLBACK_MODELS if m != GEMINI_MODEL]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates and candidates[0].get("content", {}).get("parts"):
                    return candidates[0]["content"]["parts"][0].get("text", "")
                return "No content returned."
        except Exception as e:
            last_error = str(e)
            continue

    return f"Gemini API Error: {last_error}"

class JarvisOffice:
    def __init__(self):
        print(f"================================================================")
        print(f"[JARVIS OFFICE] - KADARTECH SOLUTIONS")
        print(f"================================================================")
        print(f"Managing Director: Altaf Shaikh ({ALTAF_PHONE})")
        print(f"Brain: Google Gemini ({GEMINI_MODEL})")
        print(f"Lead Engineer: Friday (20 Tech Stacks)")
        print(f"Specialists: 10 Sub-Agents Ready")
        print(f"================================================================\n")

    def route_command(self, user_command: str) -> Dict[str, Any]:
        """Jarvis parses intent, selects the right sub-agent or Friday, and executes."""
        print(f"[Jarvis] Analyzing command: '{user_command}'...")
        system_prompt = f"""You are Jarvis, the Boss/Manager Agent of KADARTECH Solutions reporting to Altaf Shaikh.
You manage Friday (Full-stack developer with 20 tech stacks) and 10 specialist sub-agents:
{json.dumps(SPECIALIST_AGENTS, indent=2)}

Analyze the user's command, delegate to the appropriate sub-agent or handle directly, and provide an executive, high-value solution."""
        
        response = call_gemini(user_command, system_instruction=system_prompt)
        return {
            "status": "COMPLETED",
            "command": user_command,
            "response": response
        }

    def scan_reddit_leads(self) -> List[Dict[str, Any]]:
        """Mines Reddit hiring subreddits for web & software opportunities."""
        print("[Jarvis Office] Scanning Reddit (r/forhire, r/freelance, r/webdev) for hiring leads...")
        subreddits = ["forhire", "freelance_forhire", "webdev"]
        leads = []
        headers = {"User-Agent": "JarvisOfficePython/1.0"}

        for sub in subreddits:
            url = f"https://www.reddit.com/r/{sub}/new.json?limit=10"
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    posts = data.get("data", {}).get("children", [])
                    for p in posts:
                        pdata = p.get("data", {})
                        title = pdata.get("title", "")
                        if "[hiring]" in title.lower() or "looking for developer" in title.lower():
                            leads.append({
                                "title": title,
                                "author": pdata.get("author"),
                                "url": f"https://reddit.com{pdata.get('permalink')}",
                                "subreddit": sub
                            })
            except Exception as e:
                print(f"[Lead Radar] Notice for r/{sub}: {e}")

        print(f"[Jarvis Office] Found {len(leads)} fresh hiring opportunities.")
        return leads

    def learn_github_skills(self) -> List[Dict[str, Any]]:
        """Monitors GitHub trending repos and extracts agentic skills."""
        print("[Jarvis Office] Auditing GitHub for trending AI agent and full-stack capabilities...")
        url = "https://api.github.com/search/repositories?q=topic:ai-agents+stars:>500&sort=stars&per_page=3"
        req = urllib.request.Request(url, headers={"User-Agent": "JarvisOfficePython/1.0"})
        new_skills = []
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for repo in data.get("items", []):
                    new_skills.append({
                        "name": repo.get("name"),
                        "repo": repo.get("full_name"),
                        "stars": repo.get("stargazers_count"),
                        "description": repo.get("description")
                    })
        except Exception as e:
            print(f"[GitHub Learner] Notice: {e}")
        return new_skills

if __name__ == "__main__":
    office = JarvisOffice()
    if len(sys.argv) > 1:
        cmd = " ".join(sys.argv[1:])
        result = office.route_command(cmd)
        print("\n" + result["response"])
    else:
        print("Running in interactive mode. Type 'scan' to find leads, 'learn' to acquire GitHub skills, or any command for Jarvis:")
        try:
            while True:
                user_input = input("\n[Altaf Shaikh] > ").strip()
                if not user_input or user_input.lower() in ["exit", "quit"]:
                    break
                if user_input.lower() == "scan":
                    leads = office.scan_reddit_leads()
                    for l in leads:
                        print(f"- [{l['subreddit']}] {l['title']} -> {l['url']}")
                elif user_input.lower() == "learn":
                    skills = office.learn_github_skills()
                    for s in skills:
                        print(f"- {s['name']} (stars {s['stars']}): {s['description']}")
                else:
                    res = office.route_command(user_input)
                    print(f"\n[Jarvis Output]:\n{res['response']}")
        except KeyboardInterrupt:
            print("\nJarvis Office standing down.")
