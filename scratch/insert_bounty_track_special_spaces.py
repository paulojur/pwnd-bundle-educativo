import re
import os

# 1. Update public/pwned-manual-sucesso-v1.html and pwned-manual-sucesso-v1.html
casas_section_html = '''
        <h3>Casas Especiais da Bounty Track</h3>
        <p>A Bounty Track possui 8 Casas Especiais marcadas no tabuleiro. Ao concluir um Report e avançar o marcador, <strong>se o seu token PARAR exatamente sobre uma Casa Especial</strong>, aplique o seu efeito imediatamente. Passar por cima de uma casa não ativa o efeito. Recuos de pontuação nunca disparam casas especiais. Ganhos indiretos de dinheiro provenientes de cartas de Evento ou habilidades movem o marcador, mas <strong>não</strong> ativam casas especiais (apenas o avanço do Payout oficial da ação Report ativa casas especiais):</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem; margin-top: 1rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #22c55e44; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #22c55e; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$4.500</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #22c55e;">🐝+</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Reputação (🐝)</strong> do suprimento central.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #ef444444; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #ef4444; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$9.000</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #ef4444;">🐞+</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Alerta (🐞)</strong> do suprimento central.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #22c55e44; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #22c55e; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$13.500</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #22c55e;">🐝+ 🛒</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Reputação (🐝)</strong> e compre <strong>1 carta do Main Deck</strong>.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #ef444444; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #ef4444; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$19.000</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #ef4444;">🐞+ 🗂️−</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Alerta (🐞)</strong> e descarte <strong>1 carta da sua mão</strong> à sua escolha.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #00e5ff44; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #00e5ff; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$24.500</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #00e5ff;">🛠️⚡</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;"><strong>Instalação Imediata:</strong> você pode equipar 1 Tool da sua mão em um slot livre <strong>sem pagar o custo de descarte</strong>.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #22c55e44; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #22c55e; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$29.000</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #22c55e;">🐝+ 🐞−</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Reputação (🐝)</strong> e <strong>remova 1 Token de Alerta (🐞)</strong> da sua mesa.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #ef444444; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #ef4444; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$33.500</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #ef4444;">💸</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Perca <strong>$1.500</strong> na Bounty Track (o marcador recua para $32.000, sem re-disparo).</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid #ef444444; border-radius: 6px; padding: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <strong style="color: #ef4444; font-size: 1.1rem; font-family: 'Share Tech Mono', monospace;">$38.000</strong>
              <span style="font-size: 0.8rem; font-weight: bold; color: #ef4444;">🐞+</span>
            </div>
            <div style="font-size: 0.85rem; color: #d1d5db;">Ganhe <strong>1 Token de Alerta (🐞)</strong> do suprimento central.</div>
          </div>
        </div>
'''

for filepath in ['public/pwned-manual-sucesso-v1.html', 'pwned-manual-sucesso-v1.html']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Insert into Section 08 before </section>
    pattern_sec8 = r'(<!-- ================= 08 VITÓRIA & BOUNTY TRACK ================= -->.*?)(</section>)'
    
    def repl_sec8(m):
        sec_body = m.group(1)
        if 'Casas Especiais da Bounty Track' not in sec_body:
            return sec_body + casas_section_html + '\n      ' + m.group(2)
        return m.group(0)

    content = re.sub(pattern_sec8, repl_sec8, content, flags=re.DOTALL)

    # Also update Player Aid Lado B if present
    old_aid_lado_b = r'(<li><strong>VITÓRIA:</strong> \$40\.000 instantâneo ou maior saldo após 8 rodadas\.</li>)'
    new_aid_lado_b = r'<li><strong>CASAS ESPECIAIS (ao parar):</strong> $4.5k (🐝+) | $9k (🐞+) | $13.5k (🐝+ 🛒) | $19k (🐞+ 🗂️−) | $24.5k (🛠️⚡) | $29k (🐝+ 🐞−) | $33.5k (💸 -$1.5k) | $38k (🐞+).</li>\n              \1'
    if 'CASAS ESPECIAIS (ao parar)' not in content:
        content = re.sub(old_aid_lado_b, new_aid_lado_b, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {filepath}')

# 2. Update public/pwnd-quickrules-booklet.html
with open('public/pwnd-quickrules-booklet.html', 'r', encoding='utf-8') as f:
    bk_content = f.read()

quickrules_box = '''
          <div class="section-title">
            <span class="badge">★</span> CASAS ESPECIAIS NA BOUNTY TRACK (AO PARAR)
          </div>
          <div class="card-box" style="padding: 3px 5px; font-size: 8px; line-height: 1.35;">
            <p>Se o marcador <strong>PARAR</strong> exatamente sobre: <strong>$4.5k</strong> (🐝+) · <strong>$9k</strong> (🐞+) · <strong>$13.5k</strong> (🐝+ 🛒) · <strong>$19k</strong> (🐞+ 🗂️−) · <strong>$24.5k</strong> (🛠️⚡ instala Tool grátis) · <strong>$29k</strong> (🐝+ 🐞−) · <strong>$33.5k</strong> (💸 perca $1.5k) · <strong>$38k</strong> (🐞+). <em>Passar por cima ou recuar não ativa.</em></p>
          </div>
'''

if 'CASAS ESPECIAIS NA BOUNTY TRACK' not in bk_content:
    target_bk = r'(<div class="section-title">\s*<span class="badge">2P</span> MODO DUELO \(2 JOGADORES\))'
    bk_content = re.sub(target_bk, quickrules_box + r'\n          \1', bk_content)
    with open('public/pwnd-quickrules-booklet.html', 'w', encoding='utf-8') as f:
        f.write(bk_content)
    print('Updated public/pwnd-quickrules-booklet.html')

print('All manual & booklet files updated.')
