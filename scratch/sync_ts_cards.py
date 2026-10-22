import json
import re

with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    pnp_cards = json.load(f)

pnp_map = {c['id']: c for c in pnp_cards}

with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

updated_count = 0

for cid, pnp_card in pnp_map.items():
    desc = pnp_card['description']
    pt_desc = pnp_card['ptDescription']
    
    # regex to find card block
    pattern = re.compile(
        rf"(id:\s*['\"]{cid}['\"],.*?"
        rf"simpleDescription:\s*)(?:'[^']*'|\"[^\"]*\")(,\s*"
        rf"ptDescription:\s*)(?:'[^']*'|\"[^\"]*\")",
        re.DOTALL
    )
    
    desc_json = json.dumps(desc, ensure_ascii=False)
    pt_desc_json = json.dumps(pt_desc, ensure_ascii=False)
    
    def make_replacer(d1, d2):
        return lambda m: f"{m.group(1)}{d1}{m.group(2)}{d2}"
    
    new_content, count = pattern.subn(make_replacer(desc_json, pt_desc_json), content, count=1)
    if count > 0:
        content = new_content
        updated_count += 1
    else:
        print(f"Failed to update {cid}")

print(f"Total cards updated in full80DeckData.ts: {updated_count}")

with open('src/data/full80DeckData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
