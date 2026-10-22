import json
import csv
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

out_dir = 'photoshop_data'
os.makedirs(out_dir, exist_ok=True)

def export_dataset(filename_base, fieldnames, rows):
    csv_path = os.path.join(out_dir, f"{filename_base}.csv")
    tsv_path = os.path.join(out_dir, f"{filename_base}.txt")
    
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
        
    with open(tsv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Exportado: {csv_path} e {tsv_path} ({len(rows)} linhas)")

# 1. VULNERABILIDADES (80)
with open('vulnerabilidades_pnp_fisico.json', 'r', encoding='utf-8') as f:
    vulns_json = json.load(f)

vuln_rows = []
for c in vulns_json:
    desc = c.get('description', '')
    mode = 'NOISY' if '[NOISY]' in desc else ''
    clean_desc = desc.replace('[NOISY]', '').strip()
    habilidade = ''
    if ':' in clean_desc:
        parts = clean_desc.split(':', 1)
        prefix = parts[0].strip()
        if prefix.isupper() and len(prefix) > 2:
            habilidade = prefix
            
    cvss_val = str(c.get('cvss', ''))
    cvss_formatted = f"CVSS {cvss_val}" if cvss_val else ""

    vuln_rows.append({
        'ID': c.get('id', '').upper(),
        'Nome': c.get('name', ''),
        'Subtitulo': c.get('technicalReference', ''),
        'Classe': c.get('vulnClass', ''),
        'ClasseSigla': c.get('badgeLabel', ''),
        'Raridade': c.get('rarity', ''),
        'CVSS': cvss_formatted,
        'CVSS_Num': cvss_val,
        'Bounty': c.get('bountyLabel', ''),
        'BountyValor': str(c.get('bountyValue', '')),
        'Modo': mode,
        'DeckTipo': 'VULNERABILIDADE',
        'HabilidadeNome': habilidade,
        'TextoRegra': clean_desc,
        'TextoCompleto': desc
    })

vuln_fields = ['ID', 'Nome', 'Subtitulo', 'Classe', 'ClasseSigla', 'Raridade', 'CVSS', 'CVSS_Num', 'Bounty', 'BountyValor', 'Modo', 'DeckTipo', 'HabilidadeNome', 'TextoRegra', 'TextoCompleto']
export_dataset('01_vulnerabilidades_80', vuln_fields, vuln_rows)

# 2. FERRAMENTAS / TOOLS (48)
with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    full_ts = f.read()

tools_match = re.search(r'export const FULL_12_TOOLS: CardV2\[\] = \[(.*?)\];\s*// --- 10 DEFUSE', full_ts, re.DOTALL)
tools_raw = tools_match.group(1) if tools_match else ''
tool_blocks = re.findall(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"].*?name:\s*[\'"]([^\'"]+)[\'"].*?technicalReference:\s*[\'"]([^\'"]+)[\'"].*?rarity:\s*[\'"]([^\'"]+)[\'"].*?icon:\s*[\'"]([^\'"]+)[\'"].*?simpleDescription:\s*[\'"]([^\'"]+)[\'"].*?\}', tools_raw, re.DOTALL)

tool_rows = []
for copy_num in range(1, 5):
    for tid, tname, tech_ref, rarity, icon, sdesc in tool_blocks:
        tipo = 'PASSIVA' if 'PASSIVA' in sdesc else 'ATIVA'
        tool_rows.append({
            'CardID': f"{tid}-c{copy_num}",
            'Nome': tname,
            'Subtitulo': tech_ref,
            'Categoria': 'TOOL',
            'TipoUso': tipo,
            'Raridade': rarity,
            'Icone': icon,
            'TextoRegra': sdesc,
            'NumeroCopia': f"Cópia {copy_num} de 4"
        })

tool_fields = ['CardID', 'Nome', 'Subtitulo', 'Categoria', 'TipoUso', 'Raridade', 'Icone', 'TextoRegra', 'NumeroCopia']
export_dataset('02_ferramentas_48', tool_fields, tool_rows)

# 3. PROGRAMAS (36) - WITH TAXCORE FEDERAL
with open('src/data/cardsData.ts', 'r', encoding='utf-8') as f:
    cards_ts = f.read()

prog_match = re.search(r"export const PROGRAM_CARDS: ProgramCard\[\] = \[(.*?)\];\s*// ----------------------------------------------------", cards_ts, re.DOTALL)
prog_raw = prog_match.group(1) if prog_match else ''
prog_blocks = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?companyType:\s*['\"]([^'\"]+)['\"].*?allowedClasses:\s*(\[[^\]]+\]|['\"].*?['\"]).*?patchSpeed:\s*['\"]([^'\"]+)['\"].*?flatBountyBonus:\s*(\d+).*?description:\s*['\"]([^'\"]+)['\"].*?\}", prog_raw, re.DOTALL)

threshold_map = {
    'Lenta': '10+ (10, 11, 12)',
    'Moderada': '9+ (9, 10, 11, 12)',
    'Rápida': '8+ (8, 9, 10, 11, 12)',
    'Extrema': '7+ (7, 8, 9, 10, 11, 12)'
}

program_rows = []
for pid, pname, ctype, aclasses, pspeed, fbonus, pdesc in prog_blocks:
    clean_classes = aclasses.replace('[', '').replace(']', '').replace("'", "").replace('"', '').strip()
    if clean_classes == 'ALL':
        clean_classes = 'TODAS AS CLASSES (ALL)'
    else:
        clean_classes = clean_classes.replace('Cryptographic Failures', 'CRYPTO')
        clean_classes = clean_classes.replace('Broken Access Control', 'BAC')
        clean_classes = clean_classes.replace('Cross-Site Scripting', 'XSS')
        clean_classes = clean_classes.replace('Authentication', 'AUTH')
        clean_classes = clean_classes.replace('Business Logic', 'LOGIC')
        clean_classes = clean_classes.replace('Injection', 'INJ')
        
    limiar = threshold_map.get(pspeed, pspeed)
    bonus_str = f"+${int(fbonus):,} Fixo".replace(',', '.') if int(fbonus) > 0 else "+$0"
    
    program_rows.append({
        'CardID': pid,
        'Nome': pname,
        'TipoEmpresa': ctype,
        'EscopoClasses': clean_classes,
        'VelocidadePatch': pspeed,
        'LimiarPatch': limiar,
        'BonusFixo': bonus_str,
        'ValorBonus': fbonus,
        'Descricao': pdesc
    })

program_fields = ['CardID', 'Nome', 'TipoEmpresa', 'EscopoClasses', 'VelocidadePatch', 'LimiarPatch', 'BonusFixo', 'ValorBonus', 'Descricao']
export_dataset('03_programas_36', program_fields, program_rows)

# 4. EVENTOS (24)
with open('src/data/full24EventsData.ts', 'r', encoding='utf-8') as f:
    events_ts = f.read()

events_blocks = re.findall(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"].*?number:\s*[\'"]([^\'"]+)[\'"].*?name:\s*[\'"]([^\'"]+)[\'"].*?technicalReference:\s*[\'"]([^\'"]+)[\'"].*?icon:\s*[\'"]([^\'"]+)[\'"].*?targetText:\s*[\'"]([^\'"]+)[\'"].*?simpleDescription:\s*[\'"]([^\'"]+)[\'"].*?effectType:\s*[\'"]([^\'"]+)[\'"].*?\}', events_ts, re.DOTALL)

event_rows = []
for eid, enum, ename, etech, eicon, etarget, edesc, etype in events_blocks[:24]:
    event_rows.append({
        'CardID': eid,
        'Numero': f"#{enum}",
        'Nome': ename,
        'Subtitulo': etech,
        'Categoria': 'EVENT',
        'Alvo': etarget,
        'Icone': eicon,
        'Gatilho': 'Imediato ao sacar',
        'TipoEfeito': etype.upper(),
        'TextoEvento': edesc
    })

event_fields = ['CardID', 'Numero', 'Nome', 'Subtitulo', 'Categoria', 'Alvo', 'Icone', 'Gatilho', 'TipoEfeito', 'TextoEvento']
export_dataset('04_eventos_24', event_fields, event_rows)

# 5. SAFEGUARDS (10)
safeguard_rows = []
for i in range(1, 9):
    safeguard_rows.append({
        'CardID': f"safeguard-bypass-{i}",
        'Nome': 'Bypass',
        'Subtitulo': 'Safeguard Suprema',
        'Categoria': 'SAFEGUARD',
        'Raridade': 'Rare',
        'Icone': '🛡️',
        'Uso': 'Reativo ao Patch Deployed',
        'TextoRegra': 'Anula o PATCH DEPLOYED!. No Report: garante o Payout na Bounty Track sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Alerta (🐞) e descarta esta carta. Não compra consolação nem Tool.',
        'LocalizacaoDeck': 'Setup Inicial (1 por jogador)' if i <= 6 else 'Main Deck (Embaralhada)'
    })

for j in range(1, 3):
    safeguard_rows.append({
        'CardID': f"safeguard-cve-{j}",
        'Nome': 'CVE Assignment Protection',
        'Subtitulo': 'Proteção de Escopo',
        'Categoria': 'SAFEGUARD',
        'Raridade': 'Uncommon',
        'Icone': '📜',
        'Uso': 'Reação instantânea da mão ou do slot',
        'TextoRegra': 'Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Descarte após o uso. Não protege contra PATCH DEPLOYED!.',
        'LocalizacaoDeck': 'Main Deck (Embaralhada)'
    })

sg_fields = ['CardID', 'Nome', 'Subtitulo', 'Categoria', 'Raridade', 'Icone', 'Uso', 'TextoRegra', 'LocalizacaoDeck']
export_dataset('05_safeguards_10', sg_fields, safeguard_rows)

# 6. PLAYER AIDS (6)
aid_rows = []
for p in range(1, 7):
    aid_rows.append({
        'CardID': f"player-aid-{p}",
        'Titulo_Frente': 'O SEU TURNO (3 AÇÕES)',
        'Acao_1_Recon': 'RECON (1 Ação): Compre 2 cartas do Main Deck OU troque o seu programa ativo por outro aberto do mercado.',
        'Acao_2_Exploit': 'EXPLOIT (1 Ação): Baixe 1 Vulnerabilidade na Zona de Exploits (escopo aceito, máx. 3).',
        'Acao_3_Report': 'REPORT (2 Ações): SEMPRE ÚLTIMA AÇÃO DO TURNO! Teste de Patch (Noisy 2D6) -> Payout -> Compre 1 Tool -> Saque 1 Evento -> Novo Programa. Encerra o turno.',
        'AcaoLivre_Instalar': 'INSTALAR TOOL (Ação Livre): Descarte 1 carta da mão para equipar 1 Tool (máx. 3 instaladas).',
        'AcaoLivre_Ativar': 'ATIVAR TOOL (Ação Livre): Ative o efeito da Tool e descarte-a (precisa estar no slot).',
        'AcaoLivre_Furtivo': 'MODO FURTIVO: Termine o turno sem Report, sem Patch e com mesa vazia para remover 1 Alerta (🐞).',
        'Titulo_Verso': 'PATCH & TABELAS DE MESA',
        'Patch_Dados': 'Stealth: Rola 3D6 e soma os 2 menores | Noisy: Rola 2D6 somados.',
        'Patch_Limiares': 'Lenta = 10+ | Moderada = 9+ | Rápida = 8+ | Extrema = 7+. (Se empatar ou superar = PATCH DEPLOYED!).',
        'Patch_Defesa': 'Bypass anula descarte e garante payout (recebe 1 Alerta; sem Tool nem consolação).',
        'Payout_Tabela': 'Comum +$1.5k | Incomum +$2.5k | Rara +$4.0k | Épica +$5.0k | Lendária +$6.0k.',
        'Tokens_Regra': '🐝 Reputação (2 tokens = 1 reroll; +$500 endgame) | 🐞 Alerta (2 tokens = -$2.000 multa; -$500 endgame).',
        'Casas_Especiais': 'Ao Parar: $4.5k (🐝+) | $9k (🐞+) | $13.5k (🐝+ 🛒) | $19k (🐞+ 🗂️−) | $24.5k (🛠️⚡) | $29k (🐝+ 🐞−) | $33.5k (💸 -$1.5k) | $38k (🐞+).',
        'Vitoria_Regra': '$40.000 instantâneo na Bounty Track, ou maior saldo total após a 8ª rodada.'
    })

aid_fields = list(aid_rows[0].keys())
export_dataset('06_player_aids_6', aid_fields, aid_rows)

# 7. ARQUÉTIPOS (6)
idx_arch = cards_ts.find('export const ARCHETYPES')
idx_prog = cards_ts.find('export const PROGRAM_CARDS')
arch_raw = cards_ts[idx_arch:idx_prog] if idx_arch != -1 and idx_prog != -1 else ''

arch_blocks = []
for aid in ['n00b', 'old-guard', 'bug-hunter', 'social-engineer', 'red-teamer', 'pentester']:
    m_name = re.search(rf"id:\s*['\"]{aid}['\"].*?name:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    m_title = re.search(rf"id:\s*['\"]{aid}['\"].*?title:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    m_pres = re.search(rf"id:\s*['\"]{aid}['\"].*?presentation:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    m_play = re.search(rf"id:\s*['\"]{aid}['\"].*?playstyle:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    m_icon = re.search(rf"id:\s*['\"]{aid}['\"].*?avatarIcon:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    m_col = re.search(rf"id:\s*['\"]{aid}['\"].*?color:\s*['\"]([^'\"]+)['\"]", arch_raw, re.DOTALL)
    
    if m_name and m_title:
        arch_blocks.append((
            aid,
            m_name.group(1),
            m_title.group(1),
            m_pres.group(1) if m_pres else '',
            m_play.group(1) if m_play else '',
            m_icon.group(1) if m_icon else '',
            m_col.group(1) if m_col else ''
        ))

arch_rows = []
for aid, aname, atitle, apresentation, aplaystyle, aicon, acolor in arch_blocks:
    clean_playstyle = aplaystyle.replace('\\n', ' | ')
    clean_pres = apresentation.replace('\\n', ' ')
    arch_rows.append({
        'CardID': aid,
        'Nome': aname,
        'Titulo': atitle,
        'Icone': aicon,
        'CorHex': acolor,
        'FraseApresentacao': clean_pres,
        'EstiloDeJogo': clean_playstyle
    })

arch_fields = ['CardID', 'Nome', 'Titulo', 'Icone', 'CorHex', 'FraseApresentacao', 'EstiloDeJogo']
export_dataset('07_arquetipos_6', arch_fields, arch_rows)

# 8. JOKERS, VARIANTES & CRÉDITOS (6 CARTAS - FECHANDO AS 216 CARTAS!)
joker_rows = [
    {
        'CardID': 'joker-vuln-custom',
        'Nome': 'Zero-Day Custom (Joker)',
        'Subtitulo': 'Laboratório da Comunidade',
        'Categoria': 'CORINGA',
        'Icone': '🃏',
        'TextoPrincipal': 'CRIE SUA VULNERABILIDADE! Use caneta permanente ou de quadro branco para inventar sua própria falha técnica, raridade e efeito especial em workshops ou partidas personalizadas.',
        'NotaRodape': 'PWND! Tabletop Retail v1.4 • Carta Oficial de Customização'
    },
    {
        'CardID': 'joker-tool-custom',
        'Nome': 'Custom Exploit Tool (Joker)',
        'Subtitulo': 'Oficina Ofensiva',
        'Categoria': 'CORINGA',
        'Icone': '🛠️',
        'TextoPrincipal': 'CRIE SUA FERRAMENTA! Desenhe o ícone e escreva uma regra Ativa ou Passiva exclusiva criada pelo seu grupo de jogo ou equipe de segurança.',
        'NotaRodape': 'PWND! Tabletop Retail v1.4 • Carta Oficial de Customização'
    },
    {
        'CardID': 'variant-hackathon',
        'Nome': 'Modo Hackathon Blitz',
        'Subtitulo': 'Variante de Jogo Rápido',
        'Categoria': 'VARIANTE',
        'Icone': '⏱️',
        'TextoPrincipal': 'A partida dura exatamente 5 RODADAS. A meta de vitória instantânea cai para $25.000. No início de cada rodada, todos os jogadores realizam 1 Recon gratuito adicional.',
        'NotaRodape': 'Tempo médio de partida: 25 a 35 minutos'
    },
    {
        'CardID': 'variant-nightmare',
        'Nome': 'Modo Nightmare Ops',
        'Subtitulo': 'Variante Hardcore',
        'Categoria': 'VARIANTE',
        'Icone': '💀',
        'TextoPrincipal': 'O Blue Team opera com IA preditiva: em todos os Patch Checks em modo [NOISY], some +1 ao resultado final dos dados. Tokens de Alerta geram multa de -$3.000 a cada par.',
        'NotaRodape': 'Recomendado apenas para pesquisadores veteranos!'
    },
    {
        'CardID': 'credits-official',
        'Nome': 'Créditos Oficiais & Autoria',
        'Subtitulo': 'PWND! The Bug Bounty Chaos',
        'Categoria': 'CRÉDITOS',
        'Icone': '🏆',
        'TextoPrincipal': 'Game Design & Arquitetura de Regras: Paulo Silva | Concepção Temática: Universo Bug Bounty & Cibersegurança Ofensiva | Edição: Tabletop Retail v1.4.',
        'NotaRodape': 'Todos os direitos reservados • Produzido para a comunidade hacker'
    },
    {
        'CardID': 'joker-program-custom',
        'Nome': 'Custom Target Program (Joker)',
        'Subtitulo': 'Contrato Corporativo Aberto',
        'Categoria': 'CORINGA',
        'Icone': '🏢',
        'TextoPrincipal': 'CRIE SEU ALVO CORPORATIVO! Dê nome à sua organização ou cliente, defina até 3 classes técnicas de escopo aceito, a Velocidade de Patch (Lenta 10+, Moderada 9+, Rápida 8+ ou Extrema 7+) e o bônus de pagamento para torneios ou treinamentos corporativos.',
        'NotaRodape': 'PWND! Tabletop Retail v1.4 • Carta Oficial de Customização'
    }
]

joker_fields = ['CardID', 'Nome', 'Subtitulo', 'Categoria', 'Icone', 'TextoPrincipal', 'NotaRodape']
export_dataset('08_jokers_e_creditos_6', joker_fields, joker_rows)

print("\n>>> TODOS OS 8 DATASETS EXPORTADOS COM SUCESSO! TOTAL EXATO: 216 CARTAS! <<<")
