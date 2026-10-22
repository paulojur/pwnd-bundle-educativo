import re

for filepath in ['public/pwned-manual-sucesso-v1.html', 'pwned-manual-sucesso-v1.html']:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    pattern = r'(<!-- 14\. MARIONETE -->.*?Presente em: O Boneco de Marionete \(#LEG-5\)\..*?</div>\s*</div>).*?(<!-- ================= 07 EVENTOS DE CAOS ================= -->)'

    replacement = r'''\1

            <!-- EFEITOS SINGULARES DE FACE -->
            <div class="callout cyan" style="margin-top: 0.8rem; grid-column: 1 / -1;">
              <span class="label">ℹ️ Efeitos Técnicos Singulares (Impressos na Face)</span>
              <p>Além das 14 habilidades catalogadas acima, 3 cartas do baralho de vulnerabilidades possuem efeitos técnicos próprios descritos diretamente no texto da sua face:</p>
              <ul style="margin-bottom: 0;">
                <li><strong>#INJ-2 (A Injeção da Vovó):</strong> <em>Compra Extra</em> — Quando reportada com sucesso, compre 3 cartas do Main Deck imediatamente.</li>
                <li><strong>#INJ-14 (O Operário Zumbi):</strong> <em>[NOISY] PROCESSO ZUMBI</em> — Ao reportar com sucesso, compre 1 carta do Main Deck imediatamente.</li>
                <li><strong>#XSS-10 (O Espelho Narcisista):</strong> <em>Sinergia DevTools</em> — Se jogada com a ferramenta Browser DevTools instalada e ativa, duplica a compra de cartas na ação Recon.</li>
              </ul>
            </div>

          </div><!-- fecha grid habilidades -->
        </div><!-- fecha callout cyan habilidades -->

        <h3>Cartas de Ajuda Rápida (Player Aids — 6 Cartas na Caixa)</h3>
        <p>Cada jogador recebe 1 carta de consulta rápida em formato Pôquer (63×88mm), mantida ao lado do seu tabuleiro individual para consulta imediata durante as partidas:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #00e5ff44; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #00e5ff; margin-top: 0; font-size: 1.05rem; border-bottom: 1px solid #222; padding-bottom: 0.4rem;">Lado A: O Seu Turno (3 Ações)</h4>
            <ul style="font-size: 0.85rem; line-height: 1.5; color: #d1d5db; padding-left: 1.2rem; margin-bottom: 0;">
              <li><strong>RECON (1 ação):</strong> Compre 2 cartas do Main Deck OU troque o seu programa ativo por outro aberto do mercado.</li>
              <li><strong>EXPLOIT (1 ação):</strong> Baixe 1 Vulnerabilidade na mesa (escopo permitido, máx. 3).</li>
              <li><strong>REPORT (2 ações):</strong> Teste de Patch (Noisy 2D6) + Payout + compre 1 Tool + saque 1 Evento + novo programa. <em>Sempre encerra o turno imediatamente!</em></li>
              <li><strong>INSTALAR TOOL (Ação Livre):</strong> Descarte 1 carta da mão para equipar 1 Tool (máx. 3).</li>
              <li><strong>ATIVAR TOOL (Ação Livre):</strong> Ative o efeito e descarte a carta (precisa estar no slot).</li>
              <li><strong>MODO FURTIVO:</strong> Passe sem Report, sem Patch e com mesa vazia para remover 1 Alerta (🐞).</li>
            </ul>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #ffb80044; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #ffb800; margin-top: 0; font-size: 1.05rem; border-bottom: 1px solid #222; padding-bottom: 0.4rem;">Lado B: Patch & Tabelas de Mesa</h4>
            <ul style="font-size: 0.85rem; line-height: 1.5; color: #d1d5db; padding-left: 1.2rem; margin-bottom: 0;">
              <li><strong>DADOS:</strong> Stealth = 3D6 (some os 2 menores); Noisy = 2D6 somados.</li>
              <li><strong>LIMIAR DE PATCH:</strong> Lenta = 10+ | Moderada = 9+ | Rápida = 8+ | Extrema = 7+.</li>
              <li><strong>PATCH DEPLOYED:</strong> Descarte mesa e programa; recebe 1 🐞 Alerta e compra consolação. <em>Bypass anula o descarte e garante payout!</em></li>
              <li><strong>PAYOUT:</strong> Comum +$1.5k | Incomum +$2.5k | Rara +$4.0k | Épica +$5.0k | Lendária +$6.0k.</li>
              <li><strong>TOKENS:</strong> 🐝 Reputação (2 tokens = 1 reroll de dado; +$500 endgame) | 🐞 Alerta (2 tokens = -$2.000 multa; -$500 endgame).</li>
              <li><strong>VITÓRIA:</strong> $40.000 instantâneo ou maior saldo após 8 rodadas.</li>
            </ul>
          </div>
        </div>

      </section>

      \2'''

    new_text, count = re.subn(pattern, replacement, text, flags=re.DOTALL)
    print(f'File {filepath}: replaced {count} matches')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_text)

print('Done fixing nesting.')
