import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

six_programs_html = """
          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">BioGen Genomics</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Biotecnologia & Pesquisa Clínica (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Rápida (Limiar 8+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> CRYPTO, BAC, SSRF
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$2.500 de Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.
            </div>
          </div>

          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">Veloce AutoTech</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Firmware Automotivo & IoT (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Extrema (Limiar 7+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> INJ, LOGIC, AUTH
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$4.000 de Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.
            </div>
          </div>

          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">Voltz PowerGrid</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Infraestrutura Crítica & SCADA (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Lenta (Limiar 10+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> INJ, BAC
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$0 Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.
            </div>
          </div>

          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">PulseStream Media</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Mídia Digital & Distribuição DRM (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Moderada (Limiar 9+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> XSS, LOGIC, CRYPTO
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$1.000 de Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.
            </div>
          </div>

          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">AeroOrbit Avionics</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Tecnologia Aeroespacial & Satélites (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Extrema (Limiar 7+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> SSRF, AUTH, CRYPTO
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$4.000 de Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.
            </div>
          </div>

          <div
            style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">FazendaGov Digital</strong>
                <div style="font-size: 0.8rem; color: #9ca3af;">Administração Tributária Pública (2 cópias)</div>
              </div>
              <span
                style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
                Moderada (Limiar 9+)
              </span>
            </div>
            <div style="font-size: 0.85rem; margin: 0.5rem 0; color: #00e5ff;">
              <strong>Classes Aceitas:</strong> LOGIC, BAC, AUTH
            </div>
            <div
              style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
              <strong>Bônus de Contrato:</strong> +$1.000 de Bônus Fixo
            </div>
            <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
              Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.
            </div>
          </div>
"""

player_aid_section_html = """
        <h3>Cartas de Ajuda Rápida (Player Aids — 6 Cartas na Caixa)</h3>
        <p>Cada jogador recebe 1 carta de consulta rápida em formato Pôquer (63×88mm), mantida ao lado do seu tabuleiro individual para consulta imediata durante as partidas:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid #00e5ff44; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #00e5ff; margin-top: 0; font-size: 1.05rem; border-bottom: 1px solid #222; padding-bottom: 0.4rem;">Lado A: O Seu Turno (3 Ações)</h4>
            <ul style="font-size: 0.85rem; line-height: 1.5; color: #d1d5db; padding-left: 1.2rem; margin-bottom: 0;">
              <li><strong>RECON (1 ação):</strong> Compre 2 cartas do Main Deck (ou descarte 1 e compre 2 novas).</li>
              <li><strong>EXPLOIT (1 ação):</strong> Baixe 1 Vulnerabilidade na mesa (escopo permitido, máx. 3).</li>
              <li><strong>REPORT (2 ações):</strong> Teste de Patch + Payout + compra Tool (Stealth) ou Evento (Noisy) + novo programa. <em>Sempre encerra o turno imediatamente!</em></li>
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
              <li><strong>TOKENS:</strong> 🐝 Reputação (2 tokens = 1 reroll; +$500 endgame) | 🐞 Alerta (2 tokens = -$2.000 multa; -$500 endgame).</li>
              <li><strong>VITÓRIA:</strong> $40.000 instantâneo ou maior saldo após 8 rodadas.</li>
            </ul>
          </div>
        </div>
"""

def update_manual(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update title of programs section
    content = content.replace(
        '<h3>Os 12 Alvos Corporativos (Program Cards Oficiais)</h3>',
        '<h3>Os 18 Alvos Corporativos (Program Cards Oficiais — 36 Cartas no Deck)</h3>'
    )

    # 2. Add the 6 programs right before <h3>As 80 Vulnerabilidades Oficiais
    split_target = '        <h3>As 80 Vulnerabilidades Oficiais (Por Classe Técnica)</h3>'
    if split_target in content and 'BioGen Genomics' not in content:
        # Find the </div> that closes the programs grid right before <h3>As 80 Vulnerabilidades
        idx = content.find(split_target)
        # find the last </div> before idx
        last_div_idx = content.rfind('</div>', 0, idx)
        content = content[:last_div_idx] + six_programs_html + '\n        </div>\n\n' + content[idx:]
        print(f"[{fpath}] 6 novos programas inseridos no catálogo do manual!")

    # 3. Insert Player Aid section in Section 06 right before Section 07 (Fator Caos)
    sec_caos_target = '<!-- ================= 07 EVENTOS DE CAOS ================= -->'
    if sec_caos_target in content and 'Cartas de Ajuda Rápida' not in content:
        idx_caos = content.find(sec_caos_target)
        content = content[:idx_caos] + player_aid_section_html + '\n      </section>\n\n      ' + content[idx_caos:]
        print(f"[{fpath}] Seção de Player Aids inserida com sucesso!")

    # 4. Update Setup table
    content = content.replace(
        '<td>36 cartas</td>\n                <td>12 tipos de ferramentas táticas × 3 cópias de cada',
        '<td>48 cartas</td>\n                <td>12 tipos de ferramentas táticas × 4 cópias de cada'
    )
    content = content.replace(
        '<td>36 cartas</td>\n                <td>12 tipos de ferramentas táticas &times; 3 cópias de cada',
        '<td>48 cartas</td>\n                <td>12 tipos de ferramentas táticas &times; 4 cópias de cada'
    )
    # Check program deck row in table
    # Let's see if Program Deck row exists in setup
    if 'Program Deck' not in content and 'Cartas de Programa' in content:
        content = re.sub(r'(\d+)\s*Cartas de Programa', r'36 Cartas de Programa (18 alvos corporativos × 2 cópias)', content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

update_manual('public/pwned-manual-sucesso-v1.html')
update_manual('pwned-manual-sucesso-v1.html')
