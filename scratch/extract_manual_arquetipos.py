import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

idx = manual.find('id="arquetipos"')
if idx == -1:
    idx = manual.find('Arquétipos &amp; Tools')
if idx == -1:
    idx = manual.find('Arquétipos & Tools')

print("=== SEÇÃO DE ARQUÉTIPOS NO MANUAL ===")
print(manual[idx:idx+4500])
