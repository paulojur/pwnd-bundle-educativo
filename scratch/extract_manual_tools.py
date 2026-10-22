import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

# Find the tools section
tools_matches = re.findall(r'<strong style="color: #fff; font-size: 1rem;">(.*?)</strong>\s*<div style="font-size: 0.8rem; color: #9ca3af;">(.*?)</div>.*?<div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">\s*(.*?)\s*</div>', manual, re.DOTALL)

print(f"Total ferramentas catalogadas no Manual do Sucesso: {len(tools_matches)}")
for i, (name, subtitle, effect) in enumerate(tools_matches):
    effect_clean = re.sub(r'\s+', ' ', effect).strip()
    print(f"\n[{i+1}] {name} ({subtitle})")
    print(f"     Efeito: {effect_clean}")
