import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== DEEP AUDIT OF ALL COMPONENTS ===")

# 1. Check Events in full24EventsData.ts
with open('src/data/full24EventsData.ts', 'r', encoding='utf-8') as f:
    events_code = f.read()

event_ids = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", events_code)
event_names = re.findall(r"name:\s*['\"]([^'\"]+)['\"]", events_code)
print(f"\n1. Eventos em full24EventsData.ts: {len(event_ids)}")
for i, (eid, ename) in enumerate(zip(event_ids, event_names)):
    print(f"  [{i+1}] {eid}: {ename}")

# 2. Check Tools in cardsData.ts and Manual
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cards_code = f.read()

# Check archetypes
archetype_matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?archetype", cards_code, re.DOTALL | re.IGNORECASE)
print(f"\n2. Arquétipos em cardsData.ts:")
# Let's search archetype section
arch_section = re.findall(r"export const ARCHETYPES.*?;", cards_code, re.DOTALL)
if arch_section:
    arch_ids = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", arch_section[0])
    print(f"  Arquétipos encontrados: {arch_ids}")
else:
    print("  Nenhuma constante ARCHETYPES encontrada diretamente.")

# 3. Check Tools in manual
with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

# Find tools in manual
print("\n3. Ferramentas no Manual:")
tool_items = re.findall(r"<li><strong>([A-Za-z0-9\s\-]+)</strong>\s*[:\-]\s*(.*?)</li>", manual)
print(f"  Total itens <li><strong> encontrados: {len(tool_items)}")
for name, desc in tool_items:
    if any(t in name.lower() for t in ['port', 'scan', 'lab', 'dev', 'beacon', 'hex', 'token', 'harness', 'burp', 'zap', 'nmap', 'curl', 'wireshark', 'hashcat', 'ghidra', 'fuzz', 'proxy']):
        print(f"  - {name}: {desc[:100]}...")

# 4. Check Safeguards in manual
print("\n4. Safeguards no Manual:")
for line in manual.splitlines():
    if 'Bypass' in line or 'CVE' in line:
        if '<h3>' in line or '<h4>' in line or '<strong>' in line:
            print(f"  {line.strip()[:120]}")

