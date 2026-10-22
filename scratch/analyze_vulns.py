import json
import sys
from collections import Counter

# Set stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

classes = Counter(c['badgeLabel'] for c in cards)
rarities = Counter(c['rarity'] for c in cards)
modes = Counter('NOISY' if '[NOISY]' in c['description'] else 'STEALTH' for c in cards)

print("Class distribution:")
for k, v in classes.most_common():
    print(f"  {k}: {v}")

print("\nRarity distribution:")
for k, v in rarities.most_common():
    print(f"  {k}: {v}")

print("\nMode distribution:")
for k, v in modes.most_common():
    print(f"  {k}: {v}")

print("\nCards with special abilities:")
abilities = []
for c in cards:
    desc = c['description']
    # Check if there is an uppercase keyword before colon
    if ':' in desc:
        parts = desc.split(':', 1)
        prefix = parts[0].replace('[NOISY]', '').strip()
        if prefix.isupper() and len(prefix) > 2:
            abilities.append((c['id'], c['name'], c['badgeLabel'], c['rarity'], prefix, parts[1].strip()))

print(f"Total cards with special ability keyword: {len(abilities)}")
for a in abilities:
    print(f"  {a[0]} ({a[2]} | {a[3]}): {a[4]} -> {a[5][:60]}...")
