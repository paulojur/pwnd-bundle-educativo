import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=================================================================")
print("           PWND! TABLETOP RETAIL v1.4 - AUDITORIA DE BARALHOS   ")
print("=================================================================")

# 1. 80 VULNERABILIDADES
with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    vulns = json.load(f)

print(f"\n>>> 1. VULNERABILIDADES ({len(vulns)} cartas)")
noisy_cards = [c for c in vulns if '[NOISY]' in c.get('description', '')]
print(f"Total NOISY: {len(noisy_cards)}")
for c in noisy_cards:
    has_ability = ':' in c['description'] and c['description'].split(':', 1)[0].replace('[NOISY]', '').strip().isupper()
    ab_name = c['description'].split(':', 1)[0].replace('[NOISY]', '').strip() if has_ability else 'NENHUMA'
    print(f"  [{c['id']}] {c['name']} | {c['badgeLabel']} | {c['rarity']} | {c['bountyLabel']} | Hab: {ab_name}")
    print(f"       Texto: {c['description']}")

# 2. FERRAMENTAS (TOOLS)
print(f"\n>>> 2. FERRAMENTAS (TOOLS)")
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cards_data_content = f.read()

# Let's inspect tools in cardsData.ts
import re
tool_matches = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?type:\s*['\"]tool['\"].*?\}", cards_data_content, re.DOTALL)
print(f"Tools encontradas em cardsData.ts: {len(tool_matches)}")
for tid, tname in tool_matches:
    print(f"  Tool: {tid} - {tname}")

# Let's check events
with open('src/data/full24EventsData.ts', 'r', encoding='utf-8') as f:
    events_content = f.read()

event_matches = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?\}", events_content, re.DOTALL)
print(f"\n>>> 3. EVENTOS ({len(event_matches)} eventos encontrados em full24EventsData.ts)")
for eid, ename in event_matches[:10]:
    print(f"  Evento: {eid} - {ename}")

# Check safeguards
print(f"\n>>> 4. SAFEGUARDS")
sg_matches = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?type:\s*['\"]safeguard['\"].*?\}", cards_data_content, re.DOTALL)
print(f"Safeguards encontradas em cardsData.ts: {len(sg_matches)}")
for sid, sname in sg_matches:
    print(f"  Safeguard: {sid} - {sname}")


