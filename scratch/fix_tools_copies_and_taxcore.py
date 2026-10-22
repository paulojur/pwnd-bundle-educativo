import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update manuals
def update_manual_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Tool section header
    content = content.replace(
        'Tool Cards (12 Tipos Oficiais - 36 Cartas no Deck)',
        'Tool Cards (12 Tipos Oficiais — 48 Cartas no Deck)'
    )

    # Replace (3 cópias no deck) with (4 cópias no deck)
    content = content.replace('(3 cópias no deck)', '(4 cópias no deck)')

    # Replace FazendaGov with TaxCore Federal
    content = content.replace('FazendaGov Digital', 'TaxCore Federal')
    content = content.replace('fazendagov-1', 'taxcore-1')
    content = content.replace('fazendagov-2', 'taxcore-2')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[{fpath}] Manual atualizado com 4 cópias de Tools e TaxCore Federal!")

update_manual_file('public/pwned-manual-sucesso-v1.html')
update_manual_file('pwned-manual-sucesso-v1.html')

# 2. Update cardsData.ts
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cards_code = f.read()

cards_code = cards_code.replace('FazendaGov Digital', 'TaxCore Federal')
cards_code = cards_code.replace("'fazendagov-1'", "'taxcore-1'")
cards_code = cards_code.replace("'fazendagov-2'", "'taxcore-2'")

with open('src/data/cardsData.ts', 'w', encoding='utf-8') as f:
    cards_code = f.write(cards_code)
print("[src/data/cardsData.ts] TaxCore Federal atualizado!")

