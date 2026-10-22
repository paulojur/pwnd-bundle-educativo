import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def update_manual(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. inj-14
    old_inj14 = '<div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">\n                  [NOISY] Injeta comandos no processador assíncrono de conversão de PDFs corporativos.\n                </div>'
    new_inj14 = '<div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">\n                  [NOISY] PROCESSO ZUMBI: Ao reportar com sucesso, compre 1 carta do Main Deck imediatamente.\n                </div>'
    if old_inj14 in content:
        content = content.replace(old_inj14, new_inj14)
        print(f"[{file_path}] inj-14 atualizado!")
    else:
        # try regex
        p = re.compile(r'(#INJ-14.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*)\[NOISY\] Injeta comandos no processador assíncrono de conversão de PDFs corporativos\.', re.DOTALL)
        content, count = p.subn(r'\1[NOISY] PROCESSO ZUMBI: Ao reportar com sucesso, compre 1 carta do Main Deck imediatamente.', content)
        if count > 0:
            print(f"[{file_path}] inj-14 atualizado via regex!")
        else:
            print(f"[{file_path}] AVISO: inj-14 não encontrado!")

    # 2. xss-11
    p_xss11 = re.compile(r'(#XSS-11.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*)PROVA OOB: Esta vulnerabilidade é imune a Event Cards: não pode ser descartada ou afetada enquanto estiver na sua Zona de Exploits\. Executa silenciosamente em navegadores headless de sistemas de auditoria interna\.', re.DOTALL)
    content, count = p_xss11.subn(r'\1PROVA OOB: Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).', content)
    if count > 0:
        print(f"[{file_path}] xss-11 atualizado!")
    else:
        print(f"[{file_path}] AVISO: xss-11 não encontrado!")

    # 3. leg-1
    p_leg1 = re.compile(r'(#LEG-1.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*)\[NOISY\] EFEITO DOMINÓ: Ao descer esta vulnerabilidade na mesa, você pode baixar imediatamente 1 vulnerabilidade adicional da sua mão na Zona de Exploits \(respeitando o limite de 3 cartas e o escopo do programa\)\.', re.DOTALL)
    content, count = p_leg1.subn(r'\1[NOISY] EFEITO DOMINÓ: Ao descer esta vulnerabilidade, você pode baixar imediatamente 1 vulnerabilidade adicional da mão na Zona de Exploits (respeitando escopo e limite de 3 cartas).', content)
    if count > 0:
        print(f"[{file_path}] leg-1 atualizado!")
    else:
        print(f"[{file_path}] AVISO: leg-1 não encontrado!")

    # 4. leg-4
    p_leg4 = re.compile(r'(#LEG-4.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*)\[NOISY\] TÍTERE: Ao reportar com sucesso esta vulnerabilidade, você assume os controles: ative imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse sua \(o oponente mantém a carta\)\.', re.DOTALL)
    content, count = p_leg4.subn(r'\1[NOISY] TÍTERE: Ao reportar com sucesso, ative imediatamente o efeito de 1 Tool Card de qualquer oponente na mesa como se fosse sua (o oponente mantém a carta).', content)
    if count > 0:
        print(f"[{file_path}] leg-4 atualizado!")
    else:
        print(f"[{file_path}] AVISO: leg-4 não encontrado!")

    # 5. leg-5
    p_leg5 = re.compile(r'(#LEG-5.*?<div style="margin: 0\.5rem 0; font-size: 0\.88rem; line-height: 1\.45; color: #d1d5db;">\s*)\[NOISY\] MARIONETE: Ao reportar com sucesso esta vulnerabilidade, force 1 oponente à sua escolha a descartar 1 Tool Card ativa \(se ele não tiver nenhuma Tool ativa, escolha 1 carta da mão dele às cegas para ser descartada\)\.', re.DOTALL)
    content, count = p_leg5.subn(r'\1[NOISY] MARIONETE: Ao reportar com sucesso, force 1 oponente a descartar 1 Tool ativa à sua escolha. Se ele não tiver Tools ativas, descarte 1 carta aleatória da mão dele.', content)
    if count > 0:
        print(f"[{file_path}] leg-5 atualizado!")
    else:
        print(f"[{file_path}] AVISO: leg-5 não encontrado!")

    # 6. Evento #04 Legal Threat!
    p_evt4 = re.compile(r'(AMEAÇA JURÍDICA! Carta de Cease &amp; Desist dos advogados da empresa\. Escolha 1 oponente:)(.*?)(</p>|</div>)', re.DOTALL)
    # Let's find exact text for Legal Threat in manual
    old_legal = 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele fica impedido de realizar a ação Report pela próxima rodada.'
    new_legal = 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.'
    if old_legal in content:
        content = content.replace(old_legal, new_legal)
        print(f"[{file_path}] Evento #04 Legal Threat atualizado!")
    else:
        # Check without Cease & Desist exact match
        p_l = re.compile(r'AMEAÇA JURÍDICA!.*?Escolha 1 oponente: ele fica impedido de realizar a ação Report pela próxima rodada\.')
        content, count = p_l.subn('AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.', content)
        if count > 0:
            print(f"[{file_path}] Evento #04 Legal Threat atualizado via regex!")
        else:
            print(f"[{file_path}] AVISO: Evento #04 Legal Threat não encontrado!")

    # 7. Regra de empilhamento de Safeguards
    # Look for Safeguard slot description in setup / boards
    old_sg_text = 'Área de cada jogador contendo PROGRAM, EXPLOITS (máx. 3), SAFEGUARD, TOOLS (1 a 3) e EVENTS (1 e 2).'
    new_sg_text = 'Área de cada jogador contendo PROGRAM, EXPLOITS (máx. 3), SAFEGUARD (onde cartas Safeguard podem ser empilhadas), TOOLS (1 a 3) e EVENTS (1 e 2).'
    if old_sg_text in content:
        content = content.replace(old_sg_text, new_sg_text)
        print(f"[{file_path}] Regra de empilhamento de Safeguard atualizada no Setup!")

    # In Safeguards section:
    old_sg_sec = '<strong>Efeito de Escudo (Uso único):</strong> Anula os Event Cards <em>Duplicate Report!</em>, <em>Out of\n                Scope!</em> e <em>DNS Hijack!</em> direcionados contra você.'
    new_sg_sec = '<strong>Efeito de Escudo (Uso único):</strong> Reação instantânea. Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards <em>Duplicate Report!</em>, <em>Out of Scope!</em> e <em>DNS Hijack!</em> direcionados contra você. Descarte após o uso.'
    if old_sg_sec in content:
        content = content.replace(old_sg_sec, new_sg_sec)
        print(f"[{file_path}] Safeguards section CVE atualizada!")
    else:
        # regex
        p_sg = re.compile(r'<strong>Efeito de Escudo \(Uso único\):</strong>.*?direcionados contra você\.', re.DOTALL)
        content, count = p_sg.subn('<strong>Efeito de Escudo (Uso único):</strong> Reação instantânea. Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards <em>Duplicate Report!</em>, <em>Out of Scope!</em> e <em>DNS Hijack!</em> direcionados contra você. Descarte após o uso.', content)
        if count > 0:
            print(f"[{file_path}] Safeguards section CVE atualizada via regex!")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

update_manual('public/pwned-manual-sucesso-v1.html')
update_manual('pwned-manual-sucesso-v1.html')
