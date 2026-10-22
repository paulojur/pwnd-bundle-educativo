import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'Tool Cards \(12 Tipos Oficiais.*?</h3>', text)
print('Section 06 title match:', matches)

matches_copies = re.findall(r'3 cópias no deck', text)
print(f'Occurrences of "3 cópias no deck": {len(matches_copies)}')

# Check FazendaGov
matches_fazenda = re.findall(r'FazendaGov', text)
print(f'Occurrences of FazendaGov: {len(matches_fazenda)}')
