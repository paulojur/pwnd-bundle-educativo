import json
import re

with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    pnp_cards = json.load(f)

pnp_dict = {c['id']: c for c in pnp_cards}

# Read full80DeckData.ts
with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract card objects from ts_content
# Each card has id: '...', name: '...', etc.
card_pattern = re.compile(
    r"id:\s*['\"]([^'\"]+)['\"].*?"
    r"name:\s*['\"]([^'\"]+)['\"].*?"
    r"simpleDescription:\s*(['\"].*?['\"]),",
    re.DOTALL
)

ts_matches = card_pattern.findall(ts_content)
print(f"Total cards matched in full80DeckData.ts: {len(ts_matches)}")

ts_dict = {}
for m in ts_matches:
    cid = m[0]
    cname = m[1]
    cdesc = m[2].strip()
    if cdesc.startswith("'") and cdesc.endswith("'"):
        cdesc = cdesc[1:-1]
    elif cdesc.startswith('"') and cdesc.endswith('"'):
        cdesc = cdesc[1:-1]
    ts_dict[cid] = {'id': cid, 'name': cname, 'desc': cdesc}

diffs = []
for cid, p in pnp_dict.items():
    if cid not in ts_dict:
        print(f"Card {cid} in PNP but missing in full80DeckData.ts!")
        continue
    t = ts_dict[cid]
    
    p_desc = " ".join(p['description'].split())
    t_desc = " ".join(t['desc'].split())
    
    # check differences
    if p['name'] != t['name'] or p_desc != t_desc:
        diffs.append({
            'id': cid,
            'name_diff': (p['name'], t['name']) if p['name'] != t['name'] else None,
            'pnp_desc': p_desc,
            'ts_desc': t_desc
        })

print(f"\nTotal differences between PNP JSON and full80DeckData.ts: {len(diffs)}")
for d in diffs:
    print(f"\n--- {d['id']} ---")
    if d['name_diff']:
        print(f"  Name diff: PNP '{d['name_diff'][0]}' vs TS '{d['name_diff'][1]}'")
    print(f"  PNP (Manual): {d['pnp_desc']}")
    print(f"  TS Code:      {d['ts_desc']}")
