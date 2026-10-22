import re

with open('public/pwned-manual-sucesso-v1.html', 'r', encoding='utf-8') as f:
    html = f.read()

sec10 = re.search(r'<section id="catalogo">.*?</section>', html, re.DOTALL).group(0)

# Vulnerability pattern:
vulns = re.findall(
    r'<span style="font-size: 0\.8rem; color: #9ca3af; font-family: \'Share Tech Mono\', monospace;">#([A-Z0-9\-]+)</span>\s*'
    r'<h5 style="margin: 0; font-size: 1\.05rem; color: #fff; font-weight: bold;">([^<]+)</h5>\s*'
    r'<div style="font-size: 0\.8rem; color: #9ca3af; font-style: italic;">([^<]+)</div>.*?'
    r'<span style="font-size: 1\.1rem; color: #00ff00; font-weight: bold; font-family: \'Share Tech Mono\', monospace;">([^<]+)</span>.*?'
    r'<div style="margin-top: 4px;"><span[^>]*>([^<]+)</span></div>.*?'
    r'<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*(.*?)\s*</div>.*?'
    r'<span style="color: #ffb800; font-family: \'Share Tech Mono\', monospace;">CVSS ([0-9\.]+)</span>',
    sec10, re.DOTALL
)

print(f'Total vulns matched in sec 10: {len(vulns)}')
for v in vulns[:5]:
    print(v[0], v[1], v[3], v[4], 'CVSS:', v[6], '->', v[5][:40])
