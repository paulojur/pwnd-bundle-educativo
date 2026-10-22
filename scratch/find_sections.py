import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    manual = f.read()

secs = re.findall(r'<section[^>]*id=["\']([^"\']+)["\']', manual)
print('Sections:', secs)

m = re.search(r'<section[^>]*id=["\']arsenal["\'][^>]*>(.*?)(?=<section|<footer>|$)', manual, re.DOTALL)
if m:
    content = m.group(1)
    # find all h3s
    h3s = re.findall(r'<h3[^>]*>(.*?)</h3>', content)
    print("H3s in section 'arsenal':")
    for h in h3s:
        print("  -", re.sub(r'<[^>]+>', '', h).strip())
    
arch_div = content[content.find('Arquétipos de Pesquisador'):content.find('Tool Cards')]
print("=== ARQUÉTIPOS E SAFEGUARDS NO MANUAL ===")
print(arch_div)


