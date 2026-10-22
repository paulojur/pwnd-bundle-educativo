import sys

sys.stdout.reconfigure(encoding='utf-8')

replacements = [
    # 1. XSS-11
    (
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  PROVA OOB: Esta vulnerabilidade é imune a Event Cards: não pode ser descartada ou afetada enquanto
                  estiver na sua Zona de Exploits. Executa silenciosamente em navegadores headless de sistemas de
                  auditoria interna.
                </div>''',
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  PROVA OOB: Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).
                </div>'''
    ),
    # 2. LEG-1
    (
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] EFEITO DOMINÓ: Ao descer esta vulnerabilidade na mesa, você pode baixar imediatamente 1
                  vulnerabilidade adicional da sua mão na Zona de Exploits (respeitando o limite de 3 cartas e o escopo
                  do programa).
                </div>''',
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] EFEITO DOMINÓ: Ao descer esta vulnerabilidade, você pode baixar imediatamente 1 vulnerabilidade adicional da mão na Zona de Exploits (respeitando escopo e limite de 3 cartas).
                </div>'''
    ),
    # 3. LEG-4
    (
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] TÍTERE: Ao reportar com sucesso esta vulnerabilidade, você assume os controles: ative
                  imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse sua (o oponente
                  mantém a carta).
                </div>''',
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] TÍTERE: Ao reportar com sucesso, ative imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse sua (o oponente mantém a carta).
                </div>'''
    ),
    # 4. LEG-5
    (
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] MARIONETE: Ao reportar com sucesso esta vulnerabilidade, force 1 oponente à sua escolha a
                  descartar 1 Tool Card ativa (se ele não tiver nenhuma Tool ativa, escolha 1 carta da mão dele às cegas
                  para ser descartada).
                </div>''',
        '''                <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                  [NOISY] MARIONETE: Ao reportar com sucesso, force 1 oponente a descartar 1 Tool ativa à sua escolha. Se ele não tiver Tools ativas, descarte 1 carta aleatória da mão dele.
                </div>'''
    ),
    # 5. Legal Threat
    (
        '''              <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele fica impedido
                de realizar a ação Report pela próxima rodada.
              </div>''',
        '''              <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
                AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.
              </div>'''
    )
]

for fpath in ['public/pwned-manual-sucesso-v1.html', 'pwned-manual-sucesso-v1.html']:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    count_ok = 0
    for target, repl in replacements:
        # normalize newlines for safety
        norm_target = target.replace('\r\n', '\n')
        norm_content = content.replace('\r\n', '\n')
        if norm_target in norm_content:
            norm_content = norm_content.replace(norm_target, repl.replace('\r\n', '\n'), 1)
            content = norm_content
            count_ok += 1
        else:
            print(f"[{fpath}] FALHA ao substituir:\n{target[:60]}...")
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[{fpath}] Sucessos: {count_ok} de {len(replacements)}")

