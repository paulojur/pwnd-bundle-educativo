import re

new_table_and_box = '''        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Qtd na Mesa</th>
                <th>Especificação & Regras de Setup</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Main Deck</strong></td>
                <td>84 cartas</td>
                <td>80 Vulnerabilidades + 4 Safeguards (2 Bypass + 2 CVE Assignment Protection). Quando esvaziar, reembaralhe a pilha de descarte para formar um novo baralho.</td>
              </tr>
              <tr>
                <td><strong>Tool Deck</strong></td>
                <td>48 cartas</td>
                <td>12 tipos de ferramentas táticas × 4 cópias de cada, posicionado ao lado do tabuleiro central. Quando esvaziar, reembaralhe a pilha de descarte.</td>
              </tr>
              <tr>
                <td><strong>Program Deck & Mercado</strong></td>
                <td>36 cartas</td>
                <td>18 contratos corporativos × 2 cópias. Revele 3 cartas abertas no Program Market e mantenha o baralho de compras ao lado.</td>
              </tr>
              <tr>
                <td><strong>Event Deck</strong></td>
                <td>24 cartas</td>
                <td>24 cartas de eventos de caos únicas posicionadas no tabuleiro central. Quando esvaziar, reembaralhe a pilha de descarte.</td>
              </tr>
              <tr>
                <td><strong>Cartas de Arquétipo</strong></td>
                <td>6 cartas</td>
                <td>Os 6 personagens com habilidades assimétricas exclusivas (1 sorteada para cada jogador ativo).</td>
              </tr>
              <tr>
                <td><strong>Safeguards Iniciais (Bypass)</strong></td>
                <td>até 6 cartas</td>
                <td>1 carta Bypass entregue a cada jogador ativo no início (instalada no slot SAFEGUARD do seu tabuleiro individual).</td>
              </tr>
              <tr>
                <td><strong>Cartas de Ajuda (Player Aids)</strong></td>
                <td>6 cartas</td>
                <td>Cartas de referência rápida frente e verso entregues aos jogadores com resumo de ações, patch e tabelas.</td>
              </tr>
              <tr>
                <td><strong>Tokens de Alerta (🐞)</strong></td>
                <td>18 tokens</td>
                <td>Suprimento central de alertas e atenção defensiva do Blue Team.</td>
              </tr>
              <tr>
                <td><strong>Tokens de Reputação (🐝)</strong></td>
                <td>18 tokens</td>
                <td>Suprimento central de excelência técnica, prestígio e reroll.</td>
              </tr>
              <tr>
                <td><strong>Dados D6</strong></td>
                <td>3 dados</td>
                <td>Utilizados nos Patch Speed Checks (o modo Stealth rola 3D6 e descarta o maior).</td>
              </tr>
              <tr>
                <td><strong>Tabuleiro Central</strong></td>
                <td>1 tabuleiro</td>
                <td>Hospeda a Bounty Track ($0 a $40k), o Round Tracker (rodadas 1 a 8) e o Program Market (com 3 slots de programas revelados).</td>
              </tr>
              <tr>
                <td><strong>Tabuleiros Individuais</strong></td>
                <td>2 a 6 tabuleiros</td>
                <td>Área de cada jogador contendo PROGRAM, EXPLOITS (máx. 3), SAFEGUARD, TOOLS (1 a 3) e EVENTS (1 e 2).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="callout cyan" style="margin-top: 1rem; margin-bottom: 1.5rem;">
          <span class="label">ℹ️ Cartas Especiais na Caixa (6 cartas — Uso Opcional)</span>
          <p style="margin-bottom: 0.5rem; color: #d1d5db;">
            A caixa inclui 6 cartas sobressalentes que <strong>permanecem na caixa durante o jogo padrão</strong>. Não as embaralhe em nenhum dos baralhos ativos da mesa:
          </p>
          <ul style="margin-bottom: 0; font-size: 0.88rem; line-height: 1.5;">
            <li><strong>3 Coringas de Customização (Jokers):</strong> 1x Vulnerabilidade Zero-Day, 1x Ferramenta (Tool) e 1x Contrato Corporativo (Program). Cartas com campos em branco para criar regras exclusivas em workshops ou partidas personalizadas.</li>
            <li><strong>2 Variantes Oficiais de Jogo:</strong> <em>Modo Hackathon Blitz</em> (partidas rápidas de 5 rodadas com meta de $25k) e <em>Modo Nightmare Ops</em> (partidas hardcore para veteranos).</li>
            <li><strong>1 Carta de Créditos Oficiais & Autoria:</strong> Registro de concepção, game design e autoria do jogo.</li>
          </ul>
        </div>'''

for filepath in ['public/pwned-manual-sucesso-v1.html', 'pwned-manual-sucesso-v1.html']:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    pattern = r'<div class="table-wrap">.*?</table>\s*</div>'
    text, count = re.subn(pattern, new_table_and_box, text, count=1, flags=re.DOTALL)
    print(f'File {filepath}: updated {count} table match')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

print('Done updating setup tables and special cards boxes.')
