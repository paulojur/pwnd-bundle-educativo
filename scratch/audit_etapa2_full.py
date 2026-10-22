import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Tools
print("=== AS 12 TOOLS ===")
tools = re.findall(r'<strong style="color: #fff; font-size: 1rem;">(.*?)</strong>\s*<div style="font-size: 0.8rem; color: #9ca3af;">(.*?)</div>.*?<div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">\s*(.*?)\s*</div>', text, re.DOTALL)
for i, (name, sub, eff) in enumerate(tools[:12]):
    clean = re.sub(r'\s+', ' ', eff).strip()
    print(f"[{i+1}] {name} ({sub}) -> {clean}")

# 2. Eventos
print("\n=== OS 24 EVENTOS ===")
for i, (name, sub, eff) in enumerate(tools[12:36]):
    clean = re.sub(r'\s+', ' ', eff).strip()
    print(f"[{i+1}] {name} ({sub}) -> {clean}")
