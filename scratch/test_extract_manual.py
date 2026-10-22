import re
import json

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Test Tools extraction
tools = re.findall(r'<strong style="color: #fff; font-size: 1rem;">([^<]+)</strong>\s*<div style="font-size: 0\.8rem; color: #9ca3af;">([^<]+)</div>.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*(.*?)\s*</div>', html, re.DOTALL)
print(f'Total tools matched: {len(tools)}')
for t in tools[:3]:
    print(t[0], '->', t[2][:60])

# 2. Test Events extraction (24 events)
sec7 = re.search(r'<section id="caos">.*?</section>', html, re.DOTALL).group(0)
events = re.findall(r'<strong style="color: #fff; font-size: 1rem;">([^<]+)</strong>\s*<div style="font-size: 0\.8rem; color: #9ca3af;">([^<]+)</div>.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*(.*?)\s*</div>', sec7, re.DOTALL)
print(f'Total events matched in sec 7: {len(events)}')
for e in events[:3]:
    print(e[0], '->', e[2][:60])
