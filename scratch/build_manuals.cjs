const fs = require('fs');

// Load vulns
const vulns = JSON.parse(fs.readFileSync('vulnerabilidades_pnp_fisico.json', 'utf8'));

// Apply specific card corrections requested by user:
vulns.forEach(v => {
  // 1. leg-4 O Mestre dos Títeres -> SÓ NOISY!
  if (v.id === 'leg-4') {
    v.description = '[NOISY] O prêmio supremo! Você assume o controle total do computador da empresa como se estivesse sentado na cadeira deles.';
    v.ptDescription = '[NOISY] O prémio supremo! Tu assumes o controlo total do computador da empresa como se estivesses sentado na cadeira deles.';
  }
  // 2. leg-5 O Boneco de Marionete -> SÓ NOISY!
  if (v.id === 'leg-5') {
    v.description = '[NOISY] Mãos etéreas controlando o rack de servidores. Ao ser reportada, força oponentes a descartarem Tools.';
    v.ptDescription = '[NOISY] Mãos etéreas controlando o rack de servidores. Ao ser reportada, força oponentes a descartarem Tools.';
  }
  // 3. ssrf-8 O Mensageiro Cego -> ACESSO INTERNO + SÓ NOISY!
  if (v.id === 'ssrf-8') {
    v.description = '[NOISY] Habilidade: ACESSO INTERNO. Recupere 1 Tool Card do descarte para a sua mão.';
    v.ptDescription = '[NOISY] Habilidade: ACESSO INTERNO. Recupera 1 Tool Card do descarte para a tua mão.';
  }
  // 4. bac-13 A Catraca Livre -> ROTAÇÃO DE MERCADO (ATIVA no report) + SÓ NOISY!
  if (v.id === 'bac-13') {
    v.description = '[NOISY] Habilidade: ROTAÇÃO DE MERCADO. Descarte 1 Program Card do mercado e revele 1 nova do Program Deck.';
    v.ptDescription = '[NOISY] Habilidade: ROTAÇÃO DE MERCADO. Descarta 1 Program Card do mercado e revela 1 nova do Program Deck.';
  }
  // 5. crypto-6 O Padrão Repetido -> ROTAÇÃO DE MERCADO (ATIVA no report) + SÓ NOISY!
  if (v.id === 'crypto-6') {
    v.description = '[NOISY] Habilidade: ROTAÇÃO DE MERCADO. Descarte 1 Program Card do mercado e revele 1 nova do Program Deck.';
    v.ptDescription = '[NOISY] Habilidade: ROTAÇÃO DE MERCADO. Descarta 1 Program Card do mercado e revela 1 nova do Program Deck.';
  }
  // 6. xss-12 O Fio Transparente -> INJEÇÃO HOSTIL + SÓ NOISY!
  if (v.id === 'xss-12') {
    v.description = '[NOISY] Habilidade: INJEÇÃO HOSTIL. Transfira 1 joaninha sua para 1 oponente à escolha (se você não tiver, ele recebe 1 joaninha).';
    v.ptDescription = '[NOISY] Habilidade: INJEÇÃO HOSTIL. Transfere 1 joaninha tua para 1 oponente à escolha (se não tiveres, ele recebe 1 joaninha).';
  }
  // 7. inj-15 O Tubo Estourado -> ESTOURO + SÓ NOISY!
  if (v.id === 'inj-15') {
    v.description = '[NOISY] Habilidade: ESTOURO. Acesso root à instância mestra do banco relacional de dados bancários. Ao reportar com sucesso, compre 2 cartas do Main Deck e force 1 oponente à escolha a descartar 1 carta da mão.';
    v.ptDescription = '[NOISY] Habilidade: ESTOURO. Acesso root à instância mestra da base relacional de dados bancários. Ao reportar com sucesso, compra 2 cartas do Main Deck e força 1 oponente à escolha a descartar 1 carta da mão.';
  }
  // 8. bac-14 A Sala do Trono -> PANÓPTICO
  if (v.id === 'bac-14') {
    v.description = 'Habilidade: PANÓPTICO. Assume o controle total do painel de administração da matriz global. Ao reportar com sucesso (ou ao descer na mesa), olhe as 3 primeiras cartas do Event Deck, descarte 1 se desejar e organize as restantes no topo na ordem que preferir.';
    v.ptDescription = 'Habilidade: PANÓPTICO. Assume o controlo total do painel de administração da matriz global. Ao reportar com sucesso (ou ao descer na mesa), olha as 3 primeiras cartas do Event Deck, descarta 1 se desejares e organiza as restantes no topo na ordem que preferires.';
  }
});

// Load official 24 events
const evtsCode = fs.readFileSync('src/data/full24EventsData.ts', 'utf8');
const evts = [];
const evtBlocks = evtsCode.split(/\{\s*id:\s*'/).slice(1);
for (const b of evtBlocks) {
  const id = b.substring(0, b.indexOf("'"));
  if (id.startsWith('evt-') && !id.includes('parked')) {
    const number = b.match(/number:\s*'([^']+)'/)?.[1] || '';
    const name = b.match(/name:\s*'([^']+)'/)?.[1] || '';
    const tech = b.match(/technicalReference:\s*'([^']+)'/)?.[1] || '';
    const icon = b.match(/icon:\s*'([^']+)'/)?.[1] || '';
    const target = b.match(/targetText:\s*'([^']+)'/)?.[1] || '';
    const desc = b.match(/simpleDescription:\s*['"]([^'"]+)['"]/)?.[1] || '';
    const effectType = b.match(/effectType:\s*'([^']+)'/)?.[1] || '';
    evts.push({ id, number, name, tech, icon, target, desc, effectType });
  }
}

// 12 Tool Types (3 copies each = 36 cards)
const tools = [
  {
    id: 'tool-nmap',
    name: 'Nmap',
    tech: 'Network Scanner',
    type: 'PASSIVA',
    rarity: 'Common',
    icon: '📡',
    desc: 'PASSIVA: +1 carta na ação de Recon (compra 3 em vez de 2). Uma vez por turno.'
  },
  {
    id: 'tool-ffuf',
    name: 'ffuf',
    tech: 'Web Fuzzing',
    type: 'ATIVA',
    rarity: 'Common',
    icon: '🎯',
    desc: 'ATIVA: Enumere rotas ocultas. Olhe as 3 primeiras cartas do Main Deck e devolva-as em qualquer ordem.'
  },
  {
    id: 'tool-burp-suite',
    name: 'Burp Suite Pro',
    tech: 'Interception Proxy',
    type: 'ATIVA',
    rarity: 'Epic',
    icon: '🧰',
    desc: 'ATIVA: INTERCEPTION — Anule um Event Card maléfico direcionado a você (não funciona contra PATCH DEPLOYED!).'
  },
  {
    id: 'tool-burp-swiss',
    name: 'Canivete Suíço Hacker',
    tech: 'Burp Suite Pro Suite',
    type: 'ATIVA',
    rarity: 'Epic',
    icon: '🛠️',
    desc: 'ATIVA: Descarte os programas expostos e reponha; se pelo menos um aceitar a classe LEGENDARY (inclui escopo ALL), +$500; caso contrário, compre 1 carta do Main Deck.'
  },
  {
    id: 'tool-zap',
    name: 'OWASP ZAP',
    tech: 'Automated Vulnerability Scanner',
    type: 'PASSIVA',
    rarity: 'Common',
    icon: '⚡',
    desc: 'PASSIVA: Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.'
  },
  {
    id: 'tool-postman',
    name: 'Postman API Suite',
    tech: 'API Testing Environment',
    type: 'PASSIVA',
    rarity: 'Common',
    icon: '🚀',
    desc: 'PASSIVA: Baixe 1 Vulnerability Card da classe BAC em qualquer programa.'
  },
  {
    id: 'tool-devtools-lupa',
    name: 'Lupa de Varredura',
    tech: 'Browser DevTools Ext',
    type: 'PASSIVA',
    rarity: 'Common',
    icon: '🔍',
    desc: 'PASSIVA: +$500 por carta da classe XSS no Report.'
  },
  {
    id: 'tool-devtools',
    name: 'Browser DevTools',
    tech: 'Browser DevTools Core',
    type: 'PASSIVA',
    rarity: 'Common',
    icon: '🖥️',
    desc: 'PASSIVA: Seu limite de mão aumenta em 1 carta.'
  },
  {
    id: 'tool-sqlmap',
    name: 'SQLMap Automator',
    tech: 'Database Injection Tool',
    type: 'PASSIVA',
    rarity: 'Uncommon',
    icon: '🛢️',
    desc: 'PASSIVA: Baixe 1 Vulnerability Card da classe INJ em qualquer programa.'
  },
  {
    id: 'tool-collaborator',
    name: 'Burp Collaborator',
    tech: 'Out-of-band Auditor',
    type: 'PASSIVA',
    rarity: 'Rare',
    icon: '🛰️',
    desc: 'PASSIVA: Resgate 1 TOOL do descarte toda vez que um oponente reportar SSRF. 1x por turno.'
  },
  {
    id: 'tool-cyberchef',
    name: 'CyberChef',
    tech: 'Cyber Swiss Army Knife',
    type: 'ATIVA',
    rarity: 'Uncommon',
    icon: '🍳',
    desc: 'ATIVA: Decodifique o tráfego — olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.'
  },
  {
    id: 'tool-jwt-tool',
    name: 'JWT Tool',
    tech: 'Token Engineering Harness',
    type: 'PASSIVA',
    rarity: 'Uncommon',
    icon: '🔐',
    desc: 'PASSIVA: +$500 por carta da classe AUTH no Report.'
  }
];

// Archetypes (Exact, without invented bonuses)
const archetypes = [
  {
    name: 'n00b (🌱)',
    sub: 'O Iniciante Dedicado',
    tech: 'Script Kiddie / Aprendiz',
    playstyle: 'Garimpeiro de Ferramentas: A cada Report bem-sucedido, em vez de comprar a Tool do topo, OLHE as 3 primeiras do Tool Deck e ESCOLHA 1.'
  },
  {
    name: 'The Old Guard (🧠)',
    sub: 'O Veterano de C/ASM',
    tech: 'Senior Exploit Developer',
    playstyle: 'Veterano de C/ASM: Limite permanente de mão de 8 cartas. Mestre da Baixa Camada: Recebe +$500 adicionais na Bounty Track para cada carta de raridade Épica ou Lendária incluída no seu Report.'
  },
  {
    name: 'Bug Hunter (⚡)',
    sub: 'O Caçador em Escala',
    tech: 'High-Volume Bounty Hunter',
    playstyle: 'Caçador em Escala: Só pode reportar vulnerabilidades Comum e Incomum. Cada carta além da primeira no mesmo Report soma +$500 ao payout. Eficiência em Volume: Concluir um Report com 3 vulnerabilidades simultâneas concede 1 Abelha.'
  },
  {
    name: 'Social Engineer (🎭)',
    sub: 'O Engenheiro Social',
    tech: 'Human Recon & Phishing Specialist',
    playstyle: 'Caos Redirecionado (1x por rodada): Quando um Event Card maléfico for ativado CONTRA você (ou POR você), escolha outro jogador válido para sofrer o efeito no lugar. Eventos de alvo "Todos os Jogadores" e eventos com imunidade declarada não são redirecionáveis. Phishing (1x por rodada, ação livre): Puxe 1 carta aleatória da mão de um oponente e devolva 1 carta da sua mão para ele.'
  },
  {
    name: 'Red Teamer (⚔️)',
    sub: 'O Operador Ofensivo',
    tech: 'Offensive Adversary Operator',
    playstyle: 'Sem Limites: Ignora completamente as restrições de escopo dos programas e pode explorar qualquer vulnerabilidade em qualquer alvo. Penalidade Comercial: Recebe -25% em todos os payouts na Bounty Track (aplica a Regra de Arredondamento).'
  },
  {
    name: 'The Pentester (🛡️)',
    sub: 'O Auditor Metódico',
    tech: 'Methodical Security Auditor',
    playstyle: 'Auditor Metódico: Imune a Duplicate Report! e a Triage Delay!. Relatório Estruturado: Ganhe +$500 por cada classe técnica diferente no seu Report além da primeira (máximo de +$1.000).'
  }
];

// Programs from cardsData.ts (Authentic, with ShopAll & EduConnect as 'ALL')
const programs = [
  {
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional (3 cópias)',
    allowedClasses: 'ALL (Aceita todas as classes)',
    patchSpeed: 'Moderada (Limiar 9+)',
    bountyBonus: '+$1.000 de Bônus Fixo',
    desc: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.'
  },
  {
    name: 'BankSafe Financial',
    companyType: 'Instituição Financeira Digital (2 cópias)',
    allowedClasses: 'AUTH, CRYPTO, BAC, INJ',
    patchSpeed: 'Rápida (Limiar 8+)',
    bountyBonus: '+$2.500 de Bônus Fixo',
    desc: 'Escopo restrito a APIs, Autenticação e Criptografia. Pagamentos elevados!'
  },
  {
    name: 'GovPortal Legacy',
    companyType: 'Sistema Governamental Legado (2 cópias)',
    allowedClasses: 'BAC (Apenas Broken Access Control)',
    patchSpeed: 'Lenta (Limiar 10+)',
    bountyBonus: '+$0 Bônus Fixo',
    desc: 'Demora para corrigir (patch lento). Ideal para acumular combos longos sem risco de queda rápida.'
  },
  {
    name: 'HealthLock EHR',
    companyType: 'Prontuário Médico Digital (2 cópias)',
    allowedClasses: 'CRYPTO, AUTH, SSRF, BAC',
    patchSpeed: 'Rápida (Limiar 8+)',
    bountyBonus: '+$2.500 de Bônus Fixo',
    desc: 'Focado em sigilo de dados sensíveis e criptografia de registros hospitalares.'
  },
  {
    name: 'CloudNine Cloud Services',
    companyType: 'Provedor de Infraestrutura em Nuvem (1 cópia)',
    allowedClasses: 'SSRF, INJ, LEGENDARY',
    patchSpeed: 'Extrema (Limiar 7+)',
    bountyBonus: '+$4.000 de Bônus Fixo',
    desc: 'Recompensas astronômicas para RCE, SSRF e vulnerabilidades de infraestrutura. Alto risco de Patch!'
  },
  {
    name: 'SocialBee Media',
    companyType: 'Rede Social Global (3 cópias)',
    allowedClasses: 'XSS, LOGIC, BAC',
    patchSpeed: 'Moderada (Limiar 9+)',
    bountyBonus: '+$1.000 de Bônus Fixo',
    desc: 'Focado em vulnerabilidades de privacidade, XSS e lógica de engajamento social.'
  },
  {
    name: 'GameVerse MMO',
    companyType: 'Plataforma Massiva de Jogos (2 cópias)',
    allowedClasses: 'LOGIC, INJ, XSS',
    patchSpeed: 'Moderada (Limiar 9+)',
    bountyBonus: '+$1.000 de Bônus Fixo',
    desc: 'Injeção de itens, manipulação de saldo virtual e exploits em WebSockets.'
  },
  {
    name: 'EduConnect LMS',
    companyType: 'Plataforma Educacional (2 cópias)',
    allowedClasses: 'ALL (Aceita todas as classes)',
    patchSpeed: 'Lenta (Limiar 10+)',
    bountyBonus: '+$0 Bônus Fixo',
    desc: 'Ambiente seguro para iniciantes praticarem. Quase sem risco de Patch instantâneo.'
  },
  {
    name: 'CryptoX Exchange',
    companyType: 'Corretora de Criptomoedas (1 cópia)',
    allowedClasses: 'AUTH, CRYPTO, LOGIC, LEGENDARY',
    patchSpeed: 'Rápida (Limiar 8+)',
    bountyBonus: '+$4.000 de Bônus Fixo',
    desc: 'Corretora de ativos digitais sob alto risco de ataques de autenticação e carteira.'
  },
  {
    name: 'AI Core Systems',
    companyType: 'Infraestrutura de IA Generativa (1 cópia)',
    allowedClasses: 'INJ, SSRF, LEGENDARY',
    patchSpeed: 'Extrema (Limiar 7+)',
    bountyBonus: '+$4.000 de Bônus Fixo',
    desc: 'Clusters de treinamento de LLMs vulneráveis a Prompt Injection e RCE.'
  },
  {
    name: 'PayGateway Prime',
    companyType: 'Processadora de Pagamentos (2 cópias)',
    allowedClasses: 'BAC, AUTH, INJ',
    patchSpeed: 'Rápida (Limiar 8+)',
    bountyBonus: '+$2.500 de Bônus Fixo',
    desc: 'Gateway financeiro global conectando cartões de crédito e pagamentos instantâneos.'
  },
  {
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas (3 cópias)',
    allowedClasses: 'LOGIC, BAC, XSS',
    patchSpeed: 'Moderada (Limiar 9+)',
    bountyBonus: '+$1.000 de Bônus Fixo',
    desc: 'App móvel de delivery em tempo real com regras complexas de cupons e rastreamento.'
  }
];

// Group vulns by class
const classMap = {
  'INJ': 'Injeção (Injection)',
  'BAC': 'Controle de Acesso Quebrado (Broken Access Control)',
  'XSS': 'Cross-Site Scripting (XSS)',
  'AUTH': 'Autenticação & Sessão (Authentication)',
  'SSRF': 'Server-Side Request Forgery (SSRF)',
  'LOGIC': 'Lógica de Negócio (Business Logic)',
  'CRYPTO': 'Falhas Criptográficas (Cryptographic Failures)',
  '⚡ LEGENDARY': 'Exploits Avançados & RCE (Legendary)'
};

const groupedVulns = {};
vulns.forEach(v => {
  const c = v.badgeLabel;
  if (!groupedVulns[c]) groupedVulns[c] = [];
  groupedVulns[c].push(v);
});

function getRarityBadge(rarity) {
  const colors = {
    'Common': '#9ca3af',
    'Uncommon': '#22c55e',
    'Rare': '#3b82f6',
    'Epic': '#a855f7',
    'Legendary': '#f59e0b'
  };
  const color = colors[rarity] || '#9ca3af';
  return `<span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: ${color}22; color: ${color}; border: 1px solid ${color}66;">${rarity}</span>`;
}

function getBadge(label, color) {
  return `<span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: ${color}22; color: ${color}; border: 1px solid ${color}66;">${label}</span>`;
}

// Generate Vulns HTML
let retailVulnsHtml = '';
for (const [badge, vList] of Object.entries(groupedVulns)) {
  const className = classMap[badge] || badge;
  retailVulnsHtml += `
    <div style="margin-top: 2rem; margin-bottom: 1.5rem;">
      <h4 style="font-family: 'Share Tech Mono', monospace; font-size: 1.3rem; color: #00e5ff; border-bottom: 1px solid #222; padding-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
        <span>${className} (${vList.length} cartas)</span>
        <span style="font-size: 0.9rem; color: #ffb800; font-family: 'Fira Code', monospace;">Escopo [${badge}]</span>
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; margin-top: 1rem;">
  `;

  vList.forEach(v => {
    const isNoisy = v.description.includes('[NOISY]');
    const noisyBadge = isNoisy 
      ? '<span class="badge-noisy">[NOISY]</span>' 
      : '<span style="color: #22c55e; font-size: 0.75rem; border: 1px solid #22c55e44; padding: 1px 6px; border-radius: 4px; margin-right: 4px;">[STEALTH]</span>';
    retailVulnsHtml += `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <span style="font-size: 0.8rem; color: #9ca3af; font-family: 'Share Tech Mono', monospace;">#${v.id.toUpperCase()}</span>
              <h5 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: bold;">${v.name}</h5>
              <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">${v.technicalReference}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.1rem; color: #00ff00; font-weight: bold; font-family: 'Share Tech Mono', monospace;">${v.bountyLabel}</span>
              <div style="margin-top: 4px;">${getRarityBadge(v.rarity)}</div>
            </div>
          </div>
          <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
            ${v.description}
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #222; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem;">
          <div>${noisyBadge} ${getBadge(v.badgeLabel, v.badgeColor)}</div>
          <span style="color: #ffb800; font-family: 'Share Tech Mono', monospace;">CVSS ${v.cvss}</span>
        </div>
      </div>
    `;
  });

  retailVulnsHtml += `
      </div>
    </div>
  `;
}

// Generate Tools HTML (12 tools)
let retailToolsHtml = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; margin-top: 1rem;">
`;
tools.forEach(t => {
  const typeBadge = t.type === 'ATIVA'
    ? '<span style="color: #ffb800; border: 1px solid #ffb80044; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">ATIVA</span>'
    : '<span style="color: #00e5ff; border: 1px solid #00e5ff44; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">PASSIVA</span>';
  retailToolsHtml += `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <span style="font-size: 1.4rem; margin-right: 6px;">${t.icon}</span>
            <strong style="color: #fff; font-size: 1rem;">${t.name}</strong>
            <div style="font-size: 0.8rem; color: #9ca3af;">${t.tech} (3 cópias no deck)</div>
          </div>
          <div>${getRarityBadge(t.rarity)}</div>
        </div>
        <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
          ${t.desc}
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #222; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem;">
        <div>${typeBadge}</div>
        <span style="color: #9ca3af;">Instalação: Paga 1 carta da mão</span>
      </div>
    </div>
  `;
});
retailToolsHtml += `</div>`;

// Generate Events HTML (24 events)
let retailEventsHtml = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; margin-top: 1rem;">
`;
evts.forEach(e => {
  const targetColor = e.target.includes('Todos') ? '#ffb800' : (e.target.includes('Autor') ? '#ff3333' : '#00e5ff');
  retailEventsHtml += `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <span style="font-size: 1.3rem; margin-right: 6px;">${e.icon}</span>
            <strong style="color: #fff; font-size: 1rem;">${e.name}</strong>
            <div style="font-size: 0.8rem; color: #9ca3af;">${e.tech} (Evento #${e.number})</div>
          </div>
          <span style="color: ${targetColor}; font-size: 0.75rem; border: 1px solid ${targetColor}44; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
            ${e.target}
          </span>
        </div>
        <div style="margin: 0.5rem 0; font-size: 0.88rem; line-height: 1.45; color: #d1d5db;">
          ${e.desc}
        </div>
      </div>
      <div style="border-top: 1px solid #222; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af; display: flex; justify-content: space-between;">
        <span>Tipo: ${e.effectType.toUpperCase()}</span>
        <span style="color: #00ff00;">Gatilho: Imediato ao sacar</span>
      </div>
    </div>
  `;
});
retailEventsHtml += `</div>`;

// Generate Archetypes HTML (6 archetypes)
let retailArchetypesHtml = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.2rem; margin-top: 1rem;">
`;
archetypes.forEach(a => {
  retailArchetypesHtml += `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #3b82f644; border-radius: 8px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="margin-bottom: 0.8rem; border-bottom: 1px solid #222; padding-bottom: 0.5rem;">
          <h4 style="margin: 0; font-size: 1.2rem; color: #fff;">${a.name}</h4>
          <div style="font-size: 0.85rem; color: #00e5ff;">${a.sub} — <span style="color: #9ca3af;">${a.tech}</span></div>
        </div>
        <div style="font-size: 0.88rem; line-height: 1.5; color: #e5e7eb;">
          <strong>Estilo de Jogo & Habilidades:</strong><br>${a.playstyle}
        </div>
      </div>
    </div>
  `;
});
retailArchetypesHtml += `</div>`;

// Generate Programs HTML (12 unique programs)
let retailProgramsHtml = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; margin-top: 1rem;">
`;
programs.forEach(p => {
  const isAll = p.allowedClasses.includes('ALL');
  const scopeBadgeColor = isAll ? '#00ff66' : '#00e5ff';
  retailProgramsHtml += `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #2a2e39; border-radius: 8px; padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
        <div>
          <strong style="color: #fff; font-size: 1.05rem;">${p.name}</strong>
          <div style="font-size: 0.8rem; color: #9ca3af;">${p.companyType}</div>
        </div>
        <span style="font-size: 0.8rem; color: #ff3333; font-weight: bold; background: rgba(255,51,51,0.1); border: 1px solid rgba(255,51,51,0.3); padding: 2px 6px; border-radius: 4px;">
          ${p.patchSpeed}
        </span>
      </div>
      <div style="font-size: 0.85rem; margin: 0.5rem 0; color: ${scopeBadgeColor};">
        <strong>Classes Aceitas:</strong> ${p.allowedClasses}
      </div>
      <div style="font-size: 0.85rem; color: #ffb800; background: rgba(255,184,0,0.05); padding: 6px 8px; border-radius: 4px; margin-bottom: 0.5rem;">
        <strong>Bônus de Contrato:</strong> ${p.bountyBonus}
      </div>
      <div style="font-size: 0.8rem; color: #9ca3af; font-style: italic;">
        ${p.desc}
      </div>
    </div>
  `;
});
retailProgramsHtml += `</div>`;

// Safeguards HTML
const retailSafeguardsHtml = `
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1rem; margin-top: 1rem;">
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #3b82f666; border-radius: 8px; padding: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <span style="font-size: 1.5rem; margin-right: 6px;">🛡️</span>
          <strong style="color: #fff; font-size: 1.1rem;">Safeguard (Bypass)</strong>
          <div style="font-size: 0.8rem; color: #9ca3af;">Safeguard Suprema (8 cópias no jogo)</div>
        </div>
        ${getRarityBadge('Rare')}
      </div>
      <div style="font-size: 0.88rem; color: #d1d5db; line-height: 1.5; margin: 0.5rem 0;">
        <strong>Efeito Supremo:</strong> Anula o <strong>PATCH DEPLOYED!</strong>. Se jogada durante o <strong>Report</strong> (Noisy): garante o payout completo na Bounty Track sem receber Tool Card, saca o Evento normalmente e renova o programa. Se em <strong>Stealth</strong>: preserva intactos os seus exploits e o programa.
      </div>
      <div style="font-size: 0.8rem; color: #ffb800; border-top: 1px solid #222; padding-top: 0.5rem; margin-top: 0.5rem;">
        <em>Nota Tática:</em> O Bypass salva seu dinheiro e seus exploits, mas você ainda recebe 1 Joaninha e 1 carta de consolação! Descarte após o uso.
      </div>
    </div>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #22c55e66; border-radius: 8px; padding: 1.2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <span style="font-size: 1.5rem; margin-right: 6px;">📜</span>
          <strong style="color: #fff; font-size: 1.1rem;">CVE Assignment Protection</strong>
          <div style="font-size: 0.8rem; color: #9ca3af;">Proteção de Escopo (2 cópias no jogo)</div>
        </div>
        ${getRarityBadge('Uncommon')}
      </div>
      <div style="font-size: 0.88rem; color: #d1d5db; line-height: 1.5; margin: 0.5rem 0;">
        <strong>Efeito de Escudo (Uso único):</strong> Anula os Event Cards <em>Duplicate Report!</em>, <em>Out of Scope!</em> e <em>DNS Hijack!</em> direcionados contra você.
      </div>
      <div style="font-size: 0.8rem; color: #ff3333; border-top: 1px solid #222; padding-top: 0.5rem; margin-top: 0.5rem;">
        <em>Limitação:</em> Não protege contra <strong>PATCH DEPLOYED!</strong>.
      </div>
    </div>
  </div>
`;

// Build HTML page: pwned-manual-sucesso-v1.html
const retailManualContent = `<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PWNED! The Bug Bounty Chaos - Manual de Regras Oficial (V1.4)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&family=Share+Tech+Mono&family=Inter:wght@400;600;800&display=swap"
    rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0d11;
      --card-bg: #131720;
      --text-color: #e5e7eb;
      --text-muted: #9ca3af;
      --accent: #00ff66;
      --accent-glow: rgba(0, 255, 102, 0.35);
      --red: #ff334b;
      --cyan: #00e5ff;
      --yellow: #ffb800;
      --purple: #a855f7;
      --border-color: #242b3a;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
    }

    code,
    pre,
    .mono {
      font-family: 'Fira Code', monospace;
    }

    .doc-layout {
      display: flex;
      max-width: 1360px;
      margin: 0 auto;
      padding: 2rem;
      gap: 3rem;
    }

    /* Sticky Sidebar */
    .toc {
      width: 300px;
      flex-shrink: 0;
      position: sticky;
      top: 1.5rem;
      max-height: calc(100vh - 3rem);
      overflow-y: auto;
      background: rgba(19, 23, 32, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .toc-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }

    .toc-badge {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.75rem;
      background: rgba(0, 255, 102, 0.1);
      color: var(--accent);
      border: 1px solid rgba(0, 255, 102, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .toc-title {
      font-family: 'Share Tech Mono', monospace;
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin: 0.4rem 0 0.1rem 0;
      letter-spacing: -1px;
      text-shadow: 0 0 12px var(--accent-glow);
    }

    .toc-subtitle {
      font-size: 0.95rem;
      color: var(--yellow);
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .toc-tagline {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-style: italic;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.88rem;
    }

    .toc-list li {
      margin-bottom: 0.65rem;
    }

    .toc-link {
      color: var(--text-muted);
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: all 0.15s ease-in-out;
      border-radius: 6px;
      padding: 4px 6px;
    }

    .toc-link:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
      transform: translateX(3px);
    }

    .toc-num {
      color: var(--accent);
      font-family: 'Share Tech Mono', monospace;
      font-weight: bold;
      margin-right: 0.6rem;
      font-size: 0.85rem;
    }

    /* Main Content */
    main {
      flex: 1;
      max-width: 980px;
    }

    section {
      margin-bottom: 4.5rem;
      scroll-margin-top: 2rem;
    }

    h2.sec {
      font-family: 'Share Tech Mono', monospace;
      font-size: 1.9rem;
      color: #fff;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 0.6rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    h2.sec .num {
      color: var(--accent);
      text-shadow: 0 0 10px var(--accent-glow);
    }

    h3 {
      font-family: 'Share Tech Mono', monospace;
      color: var(--cyan);
      font-size: 1.35rem;
      margin-top: 2.2rem;
      margin-bottom: 0.8rem;
    }

    p {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    strong {
      color: #fff;
    }

    ul,
    ol {
      margin-bottom: 1.25rem;
      padding-left: 1.5rem;
    }

    li {
      margin-bottom: 0.4rem;
      color: #d1d5db;
    }

    /* Callouts */
    .callout {
      background: rgba(19, 23, 32, 0.8);
      border-left: 4px solid var(--accent);
      border-top: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1.1rem 1.4rem;
      margin: 1.5rem 0;
      border-radius: 0 8px 8px 0;
    }

    .callout.warn {
      border-left-color: var(--red);
      background: rgba(255, 51, 75, 0.06);
    }

    .callout.cyan {
      border-left-color: var(--cyan);
      background: rgba(0, 229, 255, 0.06);
    }

    .callout.yellow {
      border-left-color: var(--yellow);
      background: rgba(255, 184, 0, 0.06);
    }

    .callout .label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 0.4rem;
      font-weight: bold;
    }

    .callout.warn .label {
      color: var(--red);
    }

    .callout.cyan .label {
      color: var(--cyan);
    }

    .callout.yellow .label {
      color: var(--yellow);
    }

    /* Tables */
    .table-wrap {
      width: 100%;
      overflow-x: auto;
      margin: 1.5rem 0;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }

    th,
    td {
      padding: 0.85rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      font-family: 'Share Tech Mono', monospace;
      color: #fff;
      background: rgba(255, 255, 255, 0.04);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .highlight {
      color: var(--accent);
      font-weight: bold;
    }

    .badge-noisy {
      display: inline-block;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.75rem;
      color: var(--red);
      border: 1px solid rgba(255, 51, 75, 0.5);
      background: rgba(255, 51, 75, 0.1);
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 4px;
    }
  </style>
</head>

<body>
  <div class="doc-layout">
    <!-- Sumário Fixo -->
    <nav class="toc" aria-label="Sumário Geral">
      <div class="toc-header">
        <span class="toc-badge">Tabletop Edition v1.4</span>
        <div class="toc-title">PWNED!</div>
        <div class="toc-subtitle">The Bug Bounty Chaos</div>
        <div class="toc-tagline">Find it. Report it. Get paid.</div>
      </div>
      <ul class="toc-list">
        <li><a href="#intro" class="toc-link"><span class="toc-num">01</span><span>O Jogo & Objetivo</span></a></li>
        <li><a href="#setup" class="toc-link"><span class="toc-num">02</span><span>Setup Rápido & Decks</span></a></li>
        <li><a href="#loop" class="toc-link"><span class="toc-num">03</span><span>O Seu Turno (As 3 Ações)</span></a></li>
        <li><a href="#patch" class="toc-link"><span class="toc-num">04</span><span>Noisy, Stealth & Patch</span></a></li>
        <li><a href="#insetos" class="toc-link"><span class="toc-num">05</span><span>Joaninhas & Abelhas</span></a></li>
        <li><a href="#arsenal" class="toc-link"><span class="toc-num">06</span><span>Arsenal (Arquétipos & Tools)</span></a></li>
        <li><a href="#caos" class="toc-link"><span class="toc-num">07</span><span>Fator Caos (Eventos)</span></a></li>
        <li><a href="#vitoria" class="toc-link"><span class="toc-num">08</span><span>Bounty Track & Vitória</span></a></li>
        <li><a href="#ensino" class="toc-link"><span class="toc-num">09</span><span>Guia de Ensino em 3 Minutos</span></a></li>
        <li><a href="#catalogo" class="toc-link"><span class="toc-num">10</span><span>Compêndio de Cartas (80+)</span></a></li>
      </ul>
    </nav>

    <!-- Conteúdo Principal -->
    <main>
      <!-- ================= 01 INTRO ================= -->
      <section id="intro">
        <h2 class="sec"><span class="num">01</span> O Jogo & Objetivo</h2>
        <p>Vocês são hackers éticos e pesquisadores de segurança cibernética em uma disputa acirrada de bug bounty: encontram brechas no código, submetem relatórios à triagem e recebem recompensas em dinheiro real.</p>

        <div class="callout">
          <span class="label">O Objetivo de Vitória</span>
          <p>O primeiro jogador a alcançar <strong>$40.000</strong> na Bounty Track Global vence a partida <strong>instantaneamente</strong>! Se a 8ª rodada for concluída sem que ninguém atinja os $40k, somam-se as recompensas de prestígio (+ $500 por Abelha) e desconta-se a telemetria residual (- $500 por Joaninha restante na mesa). O maior saldo total leva a vitória definitiva!</p>
        </div>

        <p><strong>Regra Global de Arredondamento:</strong> Todos os bônus, divisões ou cálculos fora da grade arredondam para o múltiplo de $500 mais próximo; em caso de empate exato, arredonda-se para baixo.</p>
      </section>

      <!-- ================= 02 SETUP ================= -->
      <section id="setup">
        <h2 class="sec"><span class="num">02</span> Setup Rápido & Decks</h2>
        <p>Prepare a partida em poucos minutos com a seguinte distribuição:</p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Qtd</th>
                <th>Especificação & Regras</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Main Deck</strong></td>
                <td>84 cartas</td>
                <td>80 Vulnerabilidades + 4 Safeguards (2 Bypass + 2 CVE Assignment Protection). Quando esvaziar, reembaralhe o descarte e refaça.</td>
              </tr>
              <tr>
                <td><strong>Tool Deck</strong></td>
                <td>36 cartas</td>
                <td>12 tipos de ferramentas táticas × 3 cópias de cada, posicionado ao lado do Central Mat. Quando esvaziar, reembaralhe o descarte.</td>
              </tr>
              <tr>
                <td><strong>Event Deck</strong></td>
                <td>24 cartas</td>
                <td>24 cartas de eventos de caos únicas posicionadas no slot do Central Mat. Quando esvaziar, reembaralhe o descarte.</td>
              </tr>
              <tr>
                <td><strong>Tokens de Joaninha</strong></td>
                <td>18 tokens</td>
                <td>Suprimento compartilhado de telemetria e atenção defensiva do Blue Team.</td>
              </tr>
              <tr>
                <td><strong>Tokens de Abelha</strong></td>
                <td>18 tokens</td>
                <td>Suprimento central de excelência técnica, prestígio e reroll.</td>
              </tr>
              <tr>
                <td><strong>Dados D6</strong></td>
                <td>3 dados</td>
                <td>Utilizados nos Patch Speed Checks (o modo Stealth rola os 3 e descarta o maior).</td>
              </tr>
              <tr>
                <td><strong>Tabuleiro Central</strong></td>
                <td>1 tabuleiro</td>
                <td>Hospeda a Bounty Track Global ($0 a $40k), o Round Tracker (rodadas 1 a 8) e o Program Market (com 3 slots revelados).</td>
              </tr>
              <tr>
                <td><strong>Tabuleiros Individuais</strong></td>
                <td>4 tabuleiros</td>
                <td>Área de cada jogador contendo Programa Ativo, Zona de Exploits (máx. 3 cartas) e Slot de Salvaguarda.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Mão Inicial & Preparação dos Jogadores</h3>
        <ol>
          <li>Distribua 1 <strong>Carta de Arquétipo</strong> para cada jogador (sorteada ou escolhida).</li>
          <li>Cada jogador recebe <strong>5 cartas do Main Deck + 1 Safeguard (Bypass) garantido</strong> (posicione o Bypass imediatamente no Slot de Salvaguarda do seu tabuleiro pessoal).</li>
          <li><strong>Limite de Mão:</strong> O limite padrão de cartas na mão é de <strong>6 cartas</strong> para todos os jogadores, exceto <strong>The Old Guard</strong> (que possui limite expandido para 8 cartas).</li>
          <li>Revele <strong>3 Program Cards</strong> no Program Market do Tabuleiro Central. No seu primeiro turno, cada jogador seleciona 1 programa disponível gratuitamente.</li>
        </ol>
      </section>

      <!-- ================= 03 LOOP DO TURNO ================= -->
      <section id="loop">
        <h2 class="sec"><span class="num">03</span> O Seu Turno (As 3 Ações)</h2>
        <p>No seu turno, você possui <strong>3 Ações</strong>. Você pode distribuí-las livremente entre as opções abaixo:</p>

        <div class="callout cyan">
          <span class="label">As 3 Ações Disponíveis</span>
          <ul>
            <li><strong>RECON (Custa 1 ação):</strong> Compre 2 cartas do Main Deck OU troque o seu programa ativo por um dos 3 programas abertos no Program Market (ao trocar de programa voluntariamente, descarte quaisquer vulnerabilidades instaladas na sua Zona de Exploits).</li>
            <li><strong>EXPLOIT (Custa 1 ação):</strong> Baixe 1 carta de vulnerabilidade da sua mão para a sua Zona de Exploits, respeitando o escopo aceito pelo seu programa ativo. <em>Limite estrito de mesa: máximo de 3 vulnerabilidades na sua Zona de Exploits ao mesmo tempo.</em></li>
            <li><strong>REPORT (Custa 2 ações):</strong> Submeta o seu relatório para pagamento! Role 2D6 e some os dados no teste de Patch (Modo Noisy). Se passar, receba o pagamento na Bounty Track, compre 1 Tool e saque 1 Evento. <strong>REGRA DE OURO:</strong> O REPORT é SEMPRE a última ação do turno — nunca pode ser a primeira!</li>
          </ul>
        </div>

        <h3>Ação Livre (Custo Zero de Ação)</h3>
        <p><strong>Instalar Tool Card:</strong> Uma vez por turno, você pode equipar 1 carta de Tool da sua mão na sua mesa pagando o custo de descarte de <strong>1 carta qualquer da sua mão</strong>. Isso pode ser feito em qualquer momento anterior à resolução do Report.</p>

        <h3>Modo Duelo (2 Jogadores) — Rotação de Mercado</h3>
        <p>Em partidas com apenas 2 jogadores, no início do seu turno (antes de gastar as suas 3 ações), você pode descartar <strong>1 programa qualquer</strong> do Program Market e revelar um novo do topo gratuitamente.</p>

        <h3>Sequência Fixa do Report Bem-Sucedido (1 - 2 - 3)</h3>
        <p>Sempre nesta exata ordem:</p>
        <ol>
          <li><strong>Receba o Payout:</strong> Some o valor das vulnerabilidades da sua Zona de Exploits + bônus do programa ativo e avance o seu marcador na Bounty Track Global. Se o Report incluir pelo menos uma vulnerabilidade de raridade <strong>Rara, Épica ou Lendária</strong>, ganhe <strong>1 Abelha</strong> do suprimento central!</li>
          <li><strong>Compre 1 Tool:</strong> Compre 1 Tool Card do Tool Deck e adicione à sua mão.</li>
          <li><strong>Saque e Ative 1 Evento:</strong> Compre a primeira carta do Event Deck e <strong>aplique seu efeito imediatamente na mesa</strong>! Em seguida, limpe sua Zona de Exploits (descarte as vulnerabilidades reportadas) e substitua o programa ativo por um novo do mercado.</li>
        </ol>
      </section>

      <!-- ================= 04 NOISY, STEALTH & PATCH ================= -->
      <section id="patch">
        <h2 class="sec"><span class="num">04</span> Noisy, Stealth & Patch</h2>
        <p>No final do turno (ou durante a ação de Report), você deve testar a velocidade de atualização de segurança corporativa rolando dados D6.</p>

        <h3>Noisy vs Stealth</h3>
        <ul>
          <li><strong>NOISY (Reportou no turno):</strong> Role <strong>2D6 e some os dados</strong> no momento do Report, ANTES de esvaziar a Zona de Exploits e ANTES de receber o payout.</li>
          <li><strong>STEALTH (Só desceu vulnerabilidades na mesa e passou o turno):</strong> No fim do turno, role <strong>3D6, DESCARTE o MAIOR e some os dois restantes</strong>. O risco de patch é drasticamente menor!</li>
          <li><em>Marcador [NOISY]:</em> Se a sua Zona de Exploits incluir qualquer vulnerabilidade com o marcador <span class="badge-noisy">[NOISY]</span> (como cartas de RCE, zero-days e vulnerabilidades que roubam abelhas), o teste de patch do turno é feito <strong>obrigatoriamente em modo Noisy (2D6 somados)</strong>, mesmo que você não tenha reportado!</li>
          <li><em>Mesa Limpa:</em> Se você terminar o turno com a Zona de Exploits completamente vazia, você não rola nenhum dado!</li>
        </ul>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Velocidade do Programa</th>
                <th>Limiar de Patch (Soma D6)</th>
                <th>Risco Noisy (2D6)</th>
                <th>Risco Stealth (Menores 2 de 3D6)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lenta</strong></td>
                <td><span class="highlight">10+</span> (10, 11, 12)</td>
                <td>16,7%</td>
                <td>5,1%</td>
              </tr>
              <tr>
                <td><strong>Moderada</strong></td>
                <td><span class="highlight">9+</span> (9, 10, 11, 12)</td>
                <td>27,8%</td>
                <td>10,6%</td>
              </tr>
              <tr>
                <td><strong>Rápida</strong></td>
                <td><span class="highlight">8+</span> (8, 9, 10, 11, 12)</td>
                <td>41,7%</td>
                <td>19,4%</td>
              </tr>
              <tr>
                <td><strong>Extrema</strong></td>
                <td><span class="highlight">7+</span> (7, 8, 9, 10, 11, 12)</td>
                <td>58,3%</td>
                <td>31,9%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="callout warn">
          <span class="label">PATCH DEPLOYED!</span>
          <p>Se a soma dos dados empatar ou ultrapassar o limiar de velocidade do seu programa, ocorre o <strong>PATCH DEPLOYED!</strong>:</p>
          <ul>
            <li><strong>Perda de Ativos:</strong> Você descarta todas as vulnerabilidades da sua Zona de Exploits e descarta o seu programa ativo.</li>
            <li><strong>Atenção & Consolação:</strong> Receba <strong>1 Joaninha</strong> do suprimento central e compre <strong>1 carta de consolação</strong> do Main Deck.</li>
            <li><strong>A Defesa do Bypass:</strong> A única defesa preventiva contra a perda de ativos em um Patch Deployed é utilizar uma carta de <strong>Bypass</strong> instalada no seu Slot de Salvaguarda. O Bypass anula o descarte e permite concluir o Report normalmente (mas você não recebe Tool Card; o Bypass é descartado após o uso). <em>Atenção:</em> A Joaninha e a carta de consolação são recebidas mesmo utilizando o Bypass!</li>
          </ul>
        </div>
      </section>

      <!-- ================= 05 INSETOS ================= -->
      <section id="insetos">
        <h2 class="sec"><span class="num">05</span> Joaninhas & Abelhas</h2>

        <div class="callout warn">
          <span class="label">🐞 Sistema Joaninha (Telemetria do Blue Team)</span>
          <p>Cada falha em Patch atrai a atenção dos analistas defensivos corporativos.</p>
          <ul>
            <li><strong>Alarme Crítico (2 Joaninhas):</strong> Ao acumular 2 Joaninhas na sua mesa, o Blue Team fecha o cerco: perca <strong>$2.000</strong> na Bounty Track imediatamente (o saldo nunca fica abaixo de zero) e devolva as 2 Joaninhas ao suprimento central.</li>
            <li><strong>Penalidade de Fim de Jogo:</strong> Se você terminar a 8ª rodada com 1 Joaninha restante na mesa, desconte <strong>-$500</strong> do seu saldo final (anula exatamente o bônus de 1 Abelha).</li>
            <li><strong>Turno Calmo (Limpeza de Telemetria):</strong> Ao final do seu turno, se você não realizou a ação de Report, não sofreu Patch Deployed e a sua <strong>Zona de Exploits estiver vazia</strong> (passou o turno sem incidentes e sem brechas ativas), <strong>remova 1 Joaninha da sua mesa</strong> e devolva-a ao suprimento.</li>
          </ul>
        </div>

        <div class="callout yellow">
          <span class="label">🐝 Sistema Abelha (Prestígio & Reroll)</span>
          <ul>
            <li><strong>Ganho de Abelha:</strong> Todo Report bem-sucedido que incluir pelo menos 1 vulnerabilidade de raridade <strong>Rara, Épica ou Lendária</strong> concede <strong>1 Abelha</strong> (limite de 1 por Report, independentemente da quantidade de cartas). Se o suprimento estiver vazio, não há ganho.</li>
            <li><strong>Valor Final:</strong> Cada Abelha mantida na sua mesa vale <strong>+$500</strong> de saldo no cálculo de pontuação e desempate no fim do jogo.</li>
            <li><strong>Reroll de Patch:</strong> Você pode descartar <strong>2 Abelhas</strong> da sua mesa a qualquer momento para rolar novamente <strong>1 dos dados</strong> de Patch Speed Check.</li>
            <li><strong>Roubo de Abelha:</strong> Um Report de alto risco que incluir <strong>2 cartas de raridade Lendária OU 3 cartas de raridade Épica</strong> no mesmo Report rouba 1 Abelha de 1 oponente à escolha que possua abelhas.</li>
          </ul>
        </div>
      </section>

      <!-- ================= 06 ARSENAL ================= -->
      <section id="arsenal">
        <h2 class="sec"><span class="num">06</span> Arsenal (Arquétipos & Tools)</h2>

        <h3>Arquétipos de Pesquisador (6 Especialidades)</h3>
        ${retailArchetypesHtml}

        <h3>Cartas de Salvaguarda (Safeguards)</h3>
        ${retailSafeguardsHtml}

        <h3>Tool Cards (12 Tipos Oficiais — 36 Cartas no Deck)</h3>
        ${retailToolsHtml}

        <h3>Habilidades Canônicas de Vulnerabilidades</h3>
        <p>Algumas vulnerabilidades avançadas possuem habilidades especiais descritas diretamente em seu texto:</p>
        <ul>
          <li><strong>PASSIVA:</strong> O efeito permanece ativo continuamente enquanto a carta estiver na sua Zona de Exploits.</li>
          <li><strong>ATIVA:</strong> Dispara no momento exato em que a vulnerabilidade é reportada com sucesso (ou ao ser baixada na mesa, conforme especificado no texto da carta).</li>
          <li><em>Regra de Conflito:</em> Se o texto de uma carta contradizer este manual, a carta prevalece.</li>
        </ul>
        <div class="callout cyan">
          <span class="label">Relação de Habilidades Canônicas Oficiais</span>
          <p><strong>PROVA OOB · CORINGA DE ESCOPO · BÔNUS CRÍTICO · ROTAÇÃO DE MERCADO · ZERO-DAY · DESVIO DE PAGAMENTO · INJEÇÃO HOSTIL · ACESSO INTERNO · MERCADO EM CAOS · ESTOURO · PANÓPTICO · EFEITO DOMINÓ</strong></p>
        </div>
      </section>

      <!-- ================= 07 EVENTOS DE CAOS ================= -->
      <section id="caos">
        <h2 class="sec"><span class="num">07</span> Fator Caos (Eventos)</h2>
        <p>A cada Report bem-sucedido, o autor compra 1 carta do Event Deck e a ativa imediatamente:</p>
        ${retailEventsHtml}
      </section>

      <!-- ================= 08 VITÓRIA & BOUNTY TRACK ================= -->
      <section id="vitoria">
        <h2 class="sec"><span class="num">08</span> Bounty Track & Vitória</h2>
        <p>O Tabuleiro Central é a própria Bounty Track Global: uma colmeia de 81 hexágonos numerados de START a $40k em degraus de $500. Basta avançar o seu marcador hexagonal conforme acumula recompensas.</p>

        <h3>Vitória Instantânea & Critérios de Desempate</h3>
        <ul>
          <li><strong>Vitória Instantânea:</strong> O primeiro jogador a alcançar <strong>$40.000</strong> vence a partida na mesma hora!</li>
          <li><strong>Encerramento na 8ª Rodada:</strong> Se a 8ª rodada terminar sem vencedor de $40k:
            <ul>
              <li>Some <strong>+$500 por cada Abelha</strong> presente na mesa.</li>
              <li>Subtraia <strong>-$500 por cada Joaninha</strong> restante na mesa.</li>
              <li>O maior saldo total vence a partida!</li>
              <li><em>Desempate:</em> Se houver empate no saldo, vence quem possuir <strong>mais Abelhas</strong>. Se persistir, vence quem tiver <strong>menos Joaninhas restantes</strong>. Se ainda assim empatar, a vitória é compartilhada com honra!</li>
            </ul>
          </li>
        </ul>
      </section>

      <!-- ================= 09 ENSINO EM 3 MINUTOS ================= -->
      <section id="ensino">
        <h2 class="sec"><span class="num">09</span> Guia de Ensino em 3 Minutos</h2>
        <p>Explicando o PWNED! em 3 minutos na mesa:</p>
        <div class="callout">
          <span class="label">Resumo Express</span>
          <ul>
            <li><strong>Objetivo:</strong> Chegar a $40k na Bounty Track ou terminar a 8ª rodada com o maior saldo.</li>
            <li><strong>Seu Turno (3 Ações):</strong>
              <ul>
                <li><em>RECON (1 ação):</em> Compra 2 cartas do Main Deck ou troca de programa.</li>
                <li><em>EXPLOIT (1 ação):</em> Baixa 1 vulnerabilidade no escopo do programa ativo (máximo de 3 na mesa).</li>
                <li><em>REPORT (2 ações):</em> Submete a invasão (sempre a última ação do turno).</li>
              </ul>
            </li>
            <li><strong>Risco & Patch Check (D6):</strong> Reportou = Noisy (role 2D6 somados). Só baixou vulnerabilidades e esperou = Stealth (role 3D6, descarte o maior, some os 2 menores). Se a soma for igual ou maior que a velocidade do programa (Lenta 10+, Moderada 9+, Rápida 8+, Extrema 7+), ocorreu PATCH DEPLOYED!</li>
            <li><strong>Sofreu Patch Deployed?</strong> Perde os exploits da mesa e o programa. Ganha 1 Joaninha e 1 carta de consolação. 2 Joaninhas custam -$2.000 imediatos. Turno calmo (sem report, sem patch e com mesa limpa) remove 1 Joaninha.</li>
            <li><strong>Report Bem-Sucedido?</strong> Recebe o dinheiro na Bounty Track, ganha 1 Tool Card e saca 1 Evento de Caos imediato. Se o Report tiver carta Rara, Épica ou Lendária, ganha 1 Abelha (+$500 no final; gaste 2 abelhas para rerrolar 1 dado de patch).</li>
          </ul>
        </div>
      </section>

      <!-- ================= 10 COMPÊNDIO DE CARTAS ================= -->
      <section id="catalogo">
        <h2 class="sec"><span class="num">10</span> Compêndio Completo de Cartas</h2>
        <p>Registro exato e canônico de todos os 12 Contratos Corporativos e de todas as 80 Vulnerabilidades Oficiais do baralho:</p>

        <h3>Os 12 Alvos Corporativos (Program Cards Oficiais)</h3>
        ${retailProgramsHtml}

        <h3>As 80 Vulnerabilidades Oficiais (Por Classe Técnica)</h3>
        ${retailVulnsHtml}
      </section>
    </main>
  </div>
</body>

</html>
`;

fs.writeFileSync('pwned-manual-sucesso-v1.html', retailManualContent);
fs.writeFileSync('public/pwned-manual-sucesso-v1.html', retailManualContent);
console.log('Successfully re-generated pwned-manual-sucesso-v1.html with all fixes!');
