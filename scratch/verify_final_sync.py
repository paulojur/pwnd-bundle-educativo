import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== VERIFICAÇÃO FINAL DE SINCRONIA PRÉ-IMPRESSÃO ===")

with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    json_cards = json.load(f)

json_map = {c['id']: c for c in json_cards}

# Check specific cards
test_ids = ['inj-14', 'xss-11', 'leg-1', 'leg-4', 'leg-5']
for tid in test_ids:
    card = json_map[tid]
    print(f"[{tid}] {card['name']}: {card['description'][:80]}...")

# Check full80DeckData.ts
with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    ts_code = f.read()

for tid in test_ids:
    has_card = json_map[tid]['description'] in ts_code
    print(f"[{tid}] Em full80DeckData.ts: {has_card}")

# Check Tools
with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

print(f"\nManual has PROCESSO ZUMBI: {'PROCESSO ZUMBI' in manual}")
print(f"Manual has Legal Threat pago ($1.500): {'advogados de defesa' in manual}")
print(f"Manual has Safeguard empilhada: {'empilhada' in manual}")
print(f"full80DeckData has PortSweep: {'tool-portsweep' in ts_code}")
print(f"full80DeckData has Token Cracker: {'tool-token-cracker' in ts_code}")
print(f"full80DeckData has zero Burp Suite Pro: {'Burp Suite Pro' not in ts_code}")
print(f"full80DeckData has zero OWASP ZAP: {'OWASP ZAP' not in ts_code}")

