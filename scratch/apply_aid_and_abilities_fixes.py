import re

for path in ['public/pwned-manual-sucesso-v1.html', 'pwned-manual-sucesso-v1.html']:
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Bug Hunter note
    target_bh = r'(<strong>Eficiência:</strong> Concluir um Report com 3 vulnerabilidades concede 1 Token de Reputação\s*\(🐝\)\.)'
    repl_bh = r'''\1
                <div style="font-size: 0.8rem; color: #ffb800; border-top: 1px solid #222; padding-top: 0.4rem; margin-top: 0.5rem;">
                  <em>Nota de Regra (Bug Hunter & Chained Exploits):</em> A restrição "Volume Puro" aplica-se estritamente à <strong>Raridade</strong> (apenas cartas Comuns e Incomuns). Como a carta <strong>#LEG-1 (O Efeito Dominó)</strong> possui raridade Incomum (+$2.5k), o Bug Hunter tem permissão legal de reportá-la normalmente, desde que o Programa ativo inclua a classe de escopo [⚡ LEGENDARY].
                </div>'''

    text = re.sub(target_bh, repl_bh, text)

    # 2. Singular effects callout after Marionete
    target_marionete = r'(Presente em: O Boneco de Marionete \(#LEG-5\)\..*?</div>\s*</div>)(\s*</div>\s*</div>\s*</section>)'
    repl_sing = r'''\1
            </div>

            <!-- EFEITOS SINGULARES DE FACE -->
            <div class="callout cyan" style="margin-top: 1.5rem; grid-column: 1 / -1;">
              <span class="label">ℹ️ Efeitos Técnicos Singulares (Impressos na Face)</span>
              <p>Além das 14 habilidades catalogadas acima, 3 cartas do baralho de vulnerabilidades possuem efeitos técnicos próprios descritos diretamente no texto da sua face:</p>
              <ul style="margin-bottom: 0;">
                <li><strong>#INJ-2 (A Injeção da Vovó):</strong> <em>Compra Extra</em> — Quando reportada com sucesso, compre 3 cartas do Main Deck imediatamente.</li>
                <li><strong>#INJ-14 (O Operário Zumbi):</strong> <em>[NOISY] PROCESSO ZUMBI</em> — Ao reportar com sucesso, compre 1 carta do Main Deck imediatamente.</li>
                <li><strong>#XSS-10 (O Espelho Narcisista):</strong> <em>Sinergia DevTools</em> — Se jogada com a ferramenta Browser DevTools instalada e ativa, duplica a compra de cartas na ação Recon.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>'''

    text = re.sub(target_marionete, repl_sing, text, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Updated {path}')
