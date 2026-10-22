import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/full80DeckData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

tools_and_defuses_code = """// --- 12 TOOL CARDS (SEÇÃO 06 E 10 DO MANUAL DO SUCESSO - 36 CARTAS NO TOOL DECK) ---
export const FULL_12_TOOLS: CardV2[] = [
  {
    id: 'tool-portsweep',
    name: 'PortSweep',
    technicalReference: 'Network Scanner',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '📡',
    simpleDescription: 'PASSIVA: Ao realizar a ação de Recon, compre 3 cartas do Main Deck em vez de 2.',
    ptDescription: 'PASSIVA: Ao realizar a ação de Recon, compra 3 cartas do Main Deck em vez de 2.'
  },
  {
    id: 'tool-fuzzstorm',
    name: 'FuzzStorm',
    technicalReference: 'Web Fuzzer',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '🎯',
    simpleDescription: 'ATIVA: Olhe as 3 primeiras cartas do Main Deck: compre 1 para a sua mão e organize as outras 2 no topo como desejar.',
    ptDescription: 'ATIVA: Olha as 3 primeiras cartas do Main Deck: compra 1 para a tua mão e organiza as outras 2 no topo como desejares.'
  },
  {
    id: 'tool-interceptor-pro',
    name: 'Interceptor Pro',
    technicalReference: 'Interception Proxy',
    type: 'tool',
    points: 0,
    rarity: 'Epic',
    icon: '🧰',
    simpleDescription: 'ATIVA: INTERCEPTION - Ao ser alvo de um Event Card negativo, anule o efeito do Evento contra você (não protege contra PATCH DEPLOYED!).',
    ptDescription: 'ATIVA: INTERCEPTION - Ao ser alvo de um Event Card negativo, anula o efeito do Evento contra ti (não protege contra PATCH DEPLOYED!).'
  },
  {
    id: 'tool-exploit-forge',
    name: 'Exploit Forge',
    technicalReference: 'Exploit Automation Suite',
    type: 'tool',
    points: 0,
    rarity: 'Rare',
    icon: '⚙️',
    simpleDescription: 'ATIVA: Descarte os 3 Programas do mercado e revele 3 novos. Se algum deles aceitar a classe LEGENDARY (ou escopo ALL), receba +$500 na Bounty Track; caso contrário, compre 1 carta do Main Deck.',
    ptDescription: 'ATIVA: Descarta os 3 Programas do mercado e revela 3 novos. Se algum deles aceitar a classe LEGENDARY (ou escopo ALL), recebe +$500 na Bounty Track; caso contrário, compra 1 carta do Main Deck.'
  },
  {
    id: 'tool-spiderscan',
    name: 'SpiderScan',
    technicalReference: 'Automated Web Scanner',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '⚡',
    simpleDescription: 'PASSIVA: Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.',
    ptDescription: 'PASSIVA: Na tua primeira ação de Exploit do turno, desce 2 vulnerabilidades em vez de 1.'
  },
  {
    id: 'tool-endpoint-lab',
    name: 'Endpoint Lab',
    technicalReference: 'API Testing Environment',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '🚀',
    simpleDescription: 'PASSIVA: Baixe 1 Vulnerability Card da classe BAC em qualquer programa.',
    ptDescription: 'PASSIVA: Baixa 1 Vulnerability Card da classe BAC em qualquer programa.'
  },
  {
    id: 'tool-dom-inspector',
    name: 'DOM Inspector',
    technicalReference: 'Client-Side Analysis Tool',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '🔍',
    simpleDescription: 'PASSIVA: +$500 por carta da classe XSS no Report.',
    ptDescription: 'PASSIVA: +$500 por carta da classe XSS no Report.'
  },
  {
    id: 'tool-browser-devtools',
    name: 'Browser DevTools',
    technicalReference: 'Browser Console & Storage',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '💻',
    simpleDescription: 'PASSIVA: Seu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.',
    ptDescription: 'PASSIVA: Teu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.'
  },
  {
    id: 'tool-injection-lab',
    name: 'Injection Lab',
    technicalReference: 'Database Injection Tool',
    type: 'tool',
    points: 0,
    rarity: 'Uncommon',
    icon: '🛢️',
    simpleDescription: 'PASSIVA: Baixe 1 Vulnerability Card da classe INJ em qualquer programa.',
    ptDescription: 'PASSIVA: Baixa 1 Vulnerability Card da classe INJ em qualquer programa.'
  },
  {
    id: 'tool-echo-beacon',
    name: 'Echo Beacon',
    technicalReference: 'Out-of-band Listener',
    type: 'tool',
    points: 0,
    rarity: 'Rare',
    icon: '📡',
    simpleDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade [NOISY], compre 1 carta do Main Deck.',
    ptDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade [NOISY], compra 1 carta do Main Deck.'
  },
  {
    id: 'tool-hex-kitchen',
    name: 'Hex Kitchen',
    technicalReference: 'Data Decoding Toolkit',
    type: 'tool',
    points: 0,
    rarity: 'Rare',
    icon: '🍳',
    simpleDescription: 'ATIVA: Decodifique o tráfego - olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.',
    ptDescription: 'ATIVA: Decodifica o tráfego - olha as 3 primeiras cartas do Event Deck, descarta 1 delas e devolve as demais em qualquer ordem.'
  },
  {
    id: 'tool-token-cracker',
    name: 'Token Cracker',
    technicalReference: 'Token Engineering Harness',
    type: 'tool',
    points: 0,
    rarity: 'Common',
    icon: '🔐',
    simpleDescription: 'PASSIVA: +$500 por carta da classe AUTH no Report.',
    ptDescription: 'PASSIVA: +$500 por carta da classe AUTH no Report.'
  }
];

// --- 10 DEFUSE / SAFEGUARD CARDS (8 Bypasses + 2 CVE Protections) ---
export const FULL_3_DEFUSES: CardV2[] = [
  {
    id: 'defuse-deck-1',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-2',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-3',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-4',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-5',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-6',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-7',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-8',
    name: 'Safeguard (Bypass)',
    technicalReference: 'Bypass Card',
    type: 'defuse',
    points: 0,
    rarity: 'Rare',
    icon: '🛡️',
    simpleDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva seus exploits. Recebe 1 Alerta. Descarte após o uso.',
    ptDescription: 'Safeguard SUPREMA: Anula o PATCH DEPLOYED!. No Report: garante o payout na Bounty Track sem receber Tool. Em Stealth: preserva teus exploits. Recebe 1 Alerta. Descarte após o uso.'
  },
  {
    id: 'defuse-deck-9',
    name: 'CVE Assignment Protection',
    technicalReference: 'CVE Assignment (Safeguard)',
    type: 'defuse',
    points: 0,
    rarity: 'Uncommon',
    icon: '📜',
    simpleDescription: 'PROTEÇÃO DE ESCOPO (Uso único): Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Descarte após o uso. Não protege contra PATCH DEPLOYED!.',
    ptDescription: 'PROTEÇÃO DE ESCOPO (Uso único): Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra ti. Descarte após o uso. Não protege contra PATCH DEPLOYED!.'
  },
  {
    id: 'defuse-deck-10',
    name: 'CVE Assignment Protection',
    technicalReference: 'CVE Assignment (Safeguard)',
    type: 'defuse',
    points: 0,
    rarity: 'Uncommon',
    icon: '📜',
    simpleDescription: 'PROTEÇÃO DE ESCOPO (Uso único): Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Descarte após o uso. Não protege contra PATCH DEPLOYED!.',
    ptDescription: 'PROTEÇÃO DE ESCOPO (Uso único): Pode ser mantida no slot SAFEGUARD (empilhada) ou na mão. Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra ti. Descarte após o uso. Não protege contra PATCH DEPLOYED!.'
  }
];

// COMBINAÇÃO TOTAL DO BARALHO DE AÇÃO (80 VULNS + 36 TOOLS + 10 SAFEGUARDS = 126 CARTAS TOTAIS NA CAIXA / 120 NO DECK)
export const ALL_ACTION_CARDS: CardV2[] = [
  ...FULL_80_VULNERABILITIES,
  ...FULL_12_TOOLS,
  ...FULL_12_TOOLS.map(t => ({ ...t, id: t.id + '-c2' })),
  ...FULL_12_TOOLS.map(t => ({ ...t, id: t.id + '-c3' })),
  ...FULL_3_DEFUSES
];
"""

split_marker = '// --- 12 TOOL CARDS'
idx = content.find(split_marker)
if idx != -1:
    content = content[:idx] + tools_and_defuses_code
    with open('src/data/full80DeckData.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("full80DeckData.ts atualizado com sucesso!")
else:
    print("ERRO: split_marker não encontrado!")
