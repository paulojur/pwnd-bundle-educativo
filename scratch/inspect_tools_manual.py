import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

idx = manual.find('PortSweep')
print("=== TRECHO DO MANUAL COM FERRAMENTAS ===")
print(manual[max(0, idx-100):idx+2500])

print("\n=== FERRAMENTAS EM cardsData.ts ===")
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cards = f.read()

# find TOOLS array or where tools are declared
tool_idx = cards.find('tool-portsweep')
print(cards[max(0, tool_idx-100):tool_idx+2500])
