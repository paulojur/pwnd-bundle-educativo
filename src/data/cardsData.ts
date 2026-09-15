export type CardType = 'vulnerability' | 'tool' | 'event' | 'defuse';

export type VulnerabilityClass =
  | 'Injection'
  | 'Broken Access Control'
  | 'Cross-Site Scripting'
  | 'Authentication'
  | 'SSRF'
  | 'Business Logic'
  | 'Cryptographic Failures'
  | 'Legendary';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  vulnClass?: VulnerabilityClass;
  cvss?: number;
  severity?: SeverityLevel;
  toolRequirements?: string[]; // E.g., ['Burp Suite', 'SQLMap']
  bountyBonusMultiplier?: number;
  effectDescription: string;
  flavorText?: string;
  artConcept?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
}

export interface ProgramCard {
  id: string;
  name: string;
  companyType: string;
  allowedClasses: VulnerabilityClass[] | 'ALL';
  patchSpeed: 'Muito Lenta' | 'Lenta' | 'Moderada' | 'Rápida' | 'Extrema';
  bountyRange: string;
  flatBountyBonus: number;
  description: string;
  ptDescription?: string;
}

export interface Archetype {
  id: string;
  name: string;
  title: string;
  ptTitle?: string;
  playstyle: string;
  ptPlaystyle?: string;
  maxHandSize: number;
  reportsPerTurn: number;
  bountyModifier: number; // E.g., 0.7 for Red Teamer (-30%)
  specialPowers: string[];
  ptSpecialPowers?: string[];
  avatarIcon: string;
  color: string;
}

// ----------------------------------------------------
// ARCHETYPES (6 Arquétipos do GDD)
// ----------------------------------------------------
export const ARCHETYPES: Archetype[] = [
  {
    id: 'n00b',
    name: 'n00b',
    title: 'O Iniciante Dedicado',
    playstyle: 'Engine Builder: Ganha +1 habilidade passiva constante a cada report enviado com sucesso.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Inicia simples', 'Escalabilidade contínua de recursos', '+1 compra de carta por report'],
    avatarIcon: '🌱',
    color: '#39d353'
  },
  {
    id: 'old-guard',
    name: 'The Old Guard',
    title: 'O Veterano de C/ASM',
    playstyle: 'Mão Expandida: Pode segurar até 9 cartas, perfeito para montar combos devastadores de alta severidade.',
    maxHandSize: 9,
    reportsPerTurn: 1,
    bountyModifier: 1.2,
    specialPowers: ['Limite de mão: 9 cartas', 'Bónus de +20% em vulnerabilidades Críticas', 'Submissão única por ronda'],
    avatarIcon: '🧠',
    color: '#c084fc'
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    title: 'O Caçador em Escala',
    playstyle: 'Submissão em Dois Lotes: Ao realizar Report, divide a Zona de Exploits em 2 lotes independentes no mesmo Active Program.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['2 Lotes em 1 Report', '+50% de bónus se submeter 5+ vulnerabilidades no total', 'Restrito a CVSS ≤ 6.0'],
    avatarIcon: '⚡',
    color: '#f0883e'
  },
  {
    id: 'social-engineer',
    name: 'Social Engineer',
    title: 'O Manipulador Social',
    playstyle: 'Caos Redirecionado: Pode escolher nominalmente qual adversário sofrerá o impacto de cartas de Evento jogadas.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Redireciona cartas de evento', 'Força descartes de oponentes', 'Alta interação PvP'],
    avatarIcon: '🎭',
    color: '#58a6ff'
  },
  {
    id: 'red-teamer',
    name: 'Red Teamer',
    title: 'O Operador Ofensivo',
    playstyle: 'Sem Limites: Ignora todas as restrições de escopo dos programas (paga -30% nos bounties obtidos).',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 0.7,
    specialPowers: ['Ignora escopo de programas', 'Explora qualquer vulnerabilidade em qualquer alvo', 'Flexibilidade total'],
    avatarIcon: '⚔️',
    color: '#f85149'
  },
  {
    id: 'pentester',
    name: 'The Pentester',
    title: 'O Auditor Metódico',
    playstyle: 'Imunidade Profissional: Imune a cartas de disrupção como Duplicate Report! e Triage Delay!.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Imunidade a Duplicate Report!', 'Imunidade a Triage Delay!', 'Fluxo estável de caixa'],
    avatarIcon: '🛡️',
    color: '#38bdf8'
  }
];

// ----------------------------------------------------
// PROGRAM CARDS (24 Alvos Corporativos, Distribuição Ponderada)
// ----------------------------------------------------
export const PROGRAM_CARDS: ProgramCard[] = [
  // --- 1. ShopAll Global (3 cópias) ---
  {
    id: 'shopall-1',
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.'
  },
  {
    id: 'shopall-2',
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Escopo amplo. Permitido disputar Duplicate Report em tempo real!'
  },
  {
    id: 'shopall-3',
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Plataforma gigante com alta rotatividade de pesquisadores.'
  },

  // --- 2. BankSafe Financial (2 cópias) ---
  {
    id: 'banksafe-1',
    name: 'BankSafe Financial',
    companyType: 'Instituição Financeira Digital',
    allowedClasses: ['Authentication', 'Cryptographic Failures', 'Broken Access Control', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Escopo restrito a APIs, Autenticação e Criptografia. Pagamentos elevados!'
  },
  {
    id: 'banksafe-2',
    name: 'BankSafe Financial',
    companyType: 'Instituição Financeira Digital',
    allowedClasses: ['Authentication', 'Cryptographic Failures', 'Broken Access Control', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Escopo restrito a APIs e Autenticação bancária de alta liquidez.'
  },

  // --- 3. GovPortal Legacy (2 cópias) ---
  {
    id: 'govportal-1',
    name: 'GovPortal Legacy',
    companyType: 'Sistema Governamental Legado',
    allowedClasses: ['Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Demora para corrigir (patch lento). Ideal para acumular combos longos!'
  },
  {
    id: 'govportal-2',
    name: 'GovPortal Legacy',
    companyType: 'Sistema Governamental Legado',
    allowedClasses: ['Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Sistema legado em servidores locais antigos com ritmo de patch lento.'
  },

  // --- 4. HealthLock EHR (2 cópias) ---
  {
    id: 'healthlock-1',
    name: 'HealthLock EHR',
    companyType: 'Prontuário Médico Digital',
    allowedClasses: ['Cryptographic Failures', 'Authentication', 'SSRF', 'Broken Access Control'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Focado em sigilo de dados sensíveis e criptografia de registros hospitalares.'
  },
  {
    id: 'healthlock-2',
    name: 'HealthLock EHR',
    companyType: 'Prontuário Médico Digital',
    allowedClasses: ['Cryptographic Failures', 'Authentication', 'SSRF', 'Broken Access Control'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Sistema hospitalar privado sob constante auditoria de conformidade.'
  },

  // --- 5. CloudNine Cloud Services (1 cópia) ---
  {
    id: 'cloudnine-1',
    name: 'CloudNine Cloud Services',
    companyType: 'Provedor de Infraestrutura em Nuvem',
    allowedClasses: ['SSRF', 'Injection', 'Legendary'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bónus Fixos',
    flatBountyBonus: 4000,
    description: 'Recompensas astronômicas para RCE, SSRF e vulnerabilidades de infraestrutura. Alto risco de Patch!'
  },

  // --- 6. SocialBee Media (3 cópias) ---
  {
    id: 'socialbee-1',
    name: 'SocialBee Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Focado em vulnerabilidades de privacidade, XSS e lógica de engajamento social.'
  },
  {
    id: 'socialbee-2',
    name: 'SocialBee Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Plataforma social de alto tráfego com foco em permissões de perfil.'
  },
  {
    id: 'socialbee-3',
    name: 'SocialBee Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Inúmeras sub-plataformas integradas suscetíveis a roubo de cookies e manipulação.'
  },

  // --- 7. GameVerse MMO (2 cópias) ---
  {
    id: 'gameverse-1',
    name: 'GameVerse MMO',
    companyType: 'Plataforma Massiva de Jogos',
    allowedClasses: ['Business Logic', 'Injection', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Injeção de itens, manipulação de saldo virtual e exploits em WebSockets.'
  },
  {
    id: 'gameverse-2',
    name: 'GameVerse MMO',
    companyType: 'Plataforma Massiva de Jogos',
    allowedClasses: ['Business Logic', 'Injection', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Servidores de jogos síncronos expostos a exploração de lógica de mercado.'
  },

  // --- 8. EduConnect LMS (2 cópias) ---
  {
    id: 'educonnect-1',
    name: 'EduConnect LMS',
    companyType: 'Plataforma Educacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Ambiente seguro para iniciantes praticarem. Quase sem risco de Patch instantâneo.'
  },
  {
    id: 'educonnect-2',
    name: 'EduConnect LMS',
    companyType: 'Plataforma Educacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Sistema acadêmico comunitário com tolerância prolongada de patches.'
  },

  // --- 9. CryptoX Exchange (1 cópia) ---
  {
    id: 'cryptox-1',
    name: 'CryptoX Exchange',
    companyType: 'Corretora de Criptomoedas',
    allowedClasses: ['Authentication', 'Cryptographic Failures', 'Business Logic', 'Legendary'],
    patchSpeed: 'Rápida',
    bountyRange: '+$4.0k Bónus Fixos',
    flatBountyBonus: 4000,
    description: 'Corretora de ativos digitais sob alto risco de ataques de autenticação e carteira.'
  },

  // --- 10. AI Core Systems (1 cópia) ---
  {
    id: 'aicore-1',
    name: 'AI Core Systems',
    companyType: 'Infraestrutura de IA Generativa',
    allowedClasses: ['Injection', 'SSRF', 'Legendary'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bónus Fixos',
    flatBountyBonus: 4000,
    description: 'Clusters de treinamento de modelos de linguagem vulneráveis a Prompt Injection e RCE.'
  },

  // --- 11. PayGateway Prime (2 cópias) ---
  {
    id: 'paygateway-1',
    name: 'PayGateway Prime',
    companyType: 'Processadora de Pagamentos',
    allowedClasses: ['Broken Access Control', 'Authentication', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Gateway financeiro global conectando cartões de crédito e Pix.'
  },
  {
    id: 'paygateway-2',
    name: 'PayGateway Prime',
    companyType: 'Processadora de Pagamentos',
    allowedClasses: ['Broken Access Control', 'Authentication', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Processador financeiro com rigorosos controles de auditoria de cartões.'
  },

  // --- 12. DeliveryDash App (3 cópias) ---
  {
    id: 'deliverydash-1',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Aplicativo de entregas urbanas com vulnerabilidades de cupom e IDOR de pedidos.'
  },
  {
    id: 'deliverydash-2',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Rede logística de entregas rápidas suscetível a manipulação de pedidos.'
  },
  {
    id: 'deliverydash-3',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Frequentes vulnerabilidades de lógica em promoções e cupons da plataforma.'
  }
];

// ----------------------------------------------------
// VULNERABILITY, TOOL, EVENT & DEFUSE CARDS (Acervo de Cartas)
// ----------------------------------------------------
export const MASTER_DECK: Card[] = [
  // --- VULNERABILITIES ---
  {
    id: 'vuln-1',
    name: 'O Espelho Narcisista',
    type: 'vulnerability',
    vulnClass: 'Cross-Site Scripting',
    cvss: 7.4,
    severity: 'High',
    toolRequirements: ['Browser DevTools'],
    effectDescription: 'Payload em input não sanitizado. Se jogado com a ferramenta Browser ativa, duplica a compra de cartas na ação Recon do próximo turno.',
    flavorText: '"<script>alert(document.cookie)</script> — O espelho que reflete teus segredos."',
    artConcept: 'Navegador com espelhos infinitos emitindo luz roxa.',
    rarity: 'Uncommon'
  },
  {
    id: 'vuln-2',
    name: 'A Injeção da Vovó',
    type: 'vulnerability',
    vulnClass: 'Injection',
    cvss: 9.1,
    severity: 'Critical',
    toolRequirements: ['Burp Suite', 'SQLMap'],
    effectDescription: 'Ao reportar com sucesso, examine as 3 cartas do topo do deck e adicione 1 à mão.',
    flavorText: "' OR '1'='1 — Entrando como se fosse da família.",
    artConcept: 'Biblioteca gótica vazando linhas de código reluzentes por trincas.',
    rarity: 'Rare'
  },
  {
    id: 'vuln-3',
    name: 'O Espião da Janela',
    type: 'vulnerability',
    vulnClass: 'SSRF',
    cvss: 8.6,
    severity: 'High',
    toolRequirements: ['Burp Suite', 'Burp Collaborator'],
    effectDescription: 'Permite visualizar a mão completa de um oponente por 1 ronda inteira.',
    flavorText: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    artConcept: 'Silhueta de sobretudo observando um rack de servidores.',
    rarity: 'Rare'
  },
  {
    id: 'vuln-4',
    name: 'Boneco de Marionete',
    type: 'vulnerability',
    vulnClass: 'Legendary',
    cvss: 10.0,
    severity: 'Critical',
    toolRequirements: ['Burp Suite', 'Nmap + ffuf', 'Commix'],
    effectDescription: 'Ao ser reportada, força todos os oponentes a descartarem imediatamente 1 Tool Card de maior valor.',
    flavorText: 'Remote Code Execution como root. O servidor é meu novo fantoche.',
    artConcept: 'Mãos etéreas segurando fios de fibra óptica conectados a um rack.',
    rarity: 'Legendary'
  },
  {
    id: 'vuln-5',
    name: 'O Plebeu Privilegiado',
    type: 'vulnerability',
    vulnClass: 'Broken Access Control',
    cvss: 6.5,
    severity: 'Medium',
    toolRequirements: ['Postman'],
    effectDescription: 'Replica o valor de recompensa base da última vulnerabilidade reportada nesta ronda por qualquer jogador.',
    flavorText: 'Mudar o id=1024 para id=1 e virar o CEO.',
    artConcept: 'Estagiário sentado na cadeira presidencial com iluminação de néon.',
    rarity: 'Common'
  },
  {
    id: 'vuln-6',
    name: 'O Labirinto de Espelhos',
    type: 'vulnerability',
    vulnClass: 'Cross-Site Scripting',
    cvss: 6.1,
    severity: 'Medium',
    toolRequirements: ['Browser DevTools'],
    effectDescription: 'O programa ativo torna-se imune a cartas de evento "Out of Scope!" enquanto esta carta permanecer no programa.',
    flavorText: 'DOM-based XSS encadeado em rotas dinâmicas do Single Page App.',
    artConcept: 'Galeria de espelhos refletindo scripts em loop infinito.',
    rarity: 'Common'
  },
  {
    id: 'vuln-7',
    name: 'A Porta dos Fundos',
    type: 'vulnerability',
    vulnClass: 'Authentication',
    cvss: 8.2,
    severity: 'High',
    toolRequirements: ['JWT Tool'],
    effectDescription: 'Permite transferir todas as vulnerabilidades acumuladas para um novo programa corporativo sem penalidade de reporte.',
    flavorText: 'alg: "none" no cabeçalho JWT. Quem precisa de palavra-passe?',
    artConcept: 'Entrada de serviço iluminada em verde neon em um edifício blindado.',
    rarity: 'Rare'
  },
  {
    id: 'vuln-8',
    name: 'Criptografia de Pão Duro',
    type: 'vulnerability',
    vulnClass: 'Cryptographic Failures',
    cvss: 5.9,
    severity: 'Medium',
    toolRequirements: ['CyberChef'],
    effectDescription: 'Reduz o valor de severidade CVSS de uma carta de um oponente em 2.0 pontos (mínimo 1.0).',
    flavorText: 'MD5 sem salt para palavras-passe bancárias em 2026.',
    artConcept: 'Cadeado plástico de brinquedo trancando o cofre de um banco.',
    rarity: 'Common'
  },
  {
    id: 'vuln-9',
    name: 'O Relógio Quebrado',
    type: 'vulnerability',
    vulnClass: 'Business Logic',
    cvss: 7.7,
    severity: 'High',
    toolRequirements: ['Burp Suite'],
    effectDescription: 'Race Condition! Concede o direito de executar duas ações de Exploit no mesmo turno.',
    flavorText: '50 requisições simultâneas de saque antes do saldo atualizar.',
    artConcept: 'Cronômetro antigo com ponteiros desincronizados girando em sentidos opostos.',
    rarity: 'Uncommon'
  },
  {
    id: 'vuln-10',
    name: 'Fantasma na Máquina',
    type: 'vulnerability',
    vulnClass: 'SSRF',
    cvss: 8.9,
    severity: 'High',
    toolRequirements: ['Burp Collaborator', 'Postman'],
    effectDescription: 'SSRF via Webhook. Força um oponente a descartar uma carta aleatória da mão e adiciona essa carta à tua mão.',
    flavorText: 'O webhook de notificação enviou a chave de API de volta para mim.',
    artConcept: 'Entidade espectral de luz emanando de um conector de fibra óptica.',
    rarity: 'Epic'
  },
  {
    id: 'vuln-11',
    name: 'BOLA no Ângulo',
    type: 'vulnerability',
    vulnClass: 'Broken Access Control',
    cvss: 8.4,
    severity: 'High',
    toolRequirements: ['Postman', 'Burp Suite'],
    effectDescription: 'Permite alterar a rota da API para extrair relatórios confidenciais de outros pesquisadores.',
    flavorText: 'GET /api/v1/users/admin/export_all.json',
    artConcept: 'Bola de futebol digital rasgando uma rede de firewall.',
    rarity: 'Uncommon'
  },
  {
    id: 'vuln-12',
    name: 'Deserialização Macabra',
    type: 'vulnerability',
    vulnClass: 'Legendary',
    cvss: 9.8,
    severity: 'Critical',
    toolRequirements: ['Burp Suite', 'CyberChef', 'Commix'],
    effectDescription: 'Ganha bónus de 3x em programas Java/Enterprise. Se o programa for CloudNine, dobra a recompensa final.',
    flavorText: 'Log4Shell ressurgindo das cinzas do datacenter.',
    artConcept: 'Chamas verdes consumindo servidores em formato de dragão de código.',
    rarity: 'Legendary'
  },

  // --- TOOL CARDS ---
  {
    id: 'tool-burp-pro',
    name: 'Burp Suite Pro',
    type: 'tool',
    effectDescription: '🔴 Ativa: Ferramenta Universal. Substitui qualquer ferramenta específica exigida ao baixar vulnerabilidades.',
    flavorText: 'A arma definitiva do pesquisador ofensivo.',
    artConcept: 'Terminal alaranjado com abas Repeater, Intruder e Decoder.',
    rarity: 'Epic'
  },
  {
    id: 'tool-nmap-ffuf',
    name: 'Nmap + ffuf',
    type: 'tool',
    effectDescription: '🟢 Passiva: Bónus de Recon. Concede a compra de 3 cartas na ação Recon em vez de 2.',
    flavorText: 'Fuzzing de diretórios a 10.000 req/sec.',
    artConcept: 'Radar circular varrendo blocos de IP em terminal verde.',
    rarity: 'Common'
  },
  {
    id: 'tool-owasp-zap',
    name: 'OWASP ZAP',
    type: 'tool',
    effectDescription: '🔴 Ativa: Automação de varredura. Permite baixar uma vulnerabilidade de severidade Low/Medium com custo de ferramentas zerado.',
    flavorText: 'Scanner open-source gratuito para a comunidade.',
    artConcept: 'Raio elétrico azul sobreposto ao escudo OWASP.',
    rarity: 'Common'
  },
  {
    id: 'tool-postman',
    name: 'Postman API Suite',
    type: 'tool',
    effectDescription: '🔴 Ativa: Testes de API. Reduz em 1 o custo de ativação de vulnerabilidades de Broken Access Control.',
    flavorText: 'Collections preparadas para auditores de API.',
    artConcept: 'Astronauta laranja navegando por payloads JSON.',
    rarity: 'Common'
  },
  {
    id: 'tool-browser-devtools',
    name: 'Browser DevTools',
    type: 'tool',
    effectDescription: '🟢 Passiva: Amplificador Client-Side. Vulnerabilidades de classe XSS e DOM agregam +50% de valor no momento do Report.',
    flavorText: 'F12 é tudo o que tu precisas.',
    artConcept: 'Console JavaScript com mensagens em destaque amarelo e verde.',
    rarity: 'Common'
  },
  {
    id: 'tool-sqlmap',
    name: 'SQLMap Automator',
    type: 'tool',
    effectDescription: '🔴 Ativa: Automação SQL. Anula os requisitos de ferramentas secundárias para vulnerabilidades de Injection (incluindo Command Injection).',
    flavorText: 'python sqlmap.py -u "target" --dbs --dump',
    artConcept: 'Bomba de petróleo digital perfurando tabelas SQL.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-burp-collaborator',
    name: 'Burp Collaborator',
    type: 'tool',
    effectDescription: '🟢 Passiva: Monitoramento OOB. Concede 1 carta de ferramenta do descarte toda vez que um oponente reportar um SSRF.',
    flavorText: 'Pingback recebido de servidor interno.',
    artConcept: 'Antena parabólica captando sinais de rádio no ciberespaço.',
    rarity: 'Rare'
  },
  {
    id: 'tool-cyberchef',
    name: 'CyberChef',
    type: 'tool',
    effectDescription: '🔴 Ativa: Canivete Suíço. Permite converter 2 cartas de ferramentas descartadas em 1 ferramenta de tua escolha do baralho.',
    flavorText: 'The Cyber Swiss Army Knife.',
    artConcept: 'Livro de receitas de hacker com símbolos Hex e Base64.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-jwt-tool',
    name: 'JWT Tool',
    type: 'tool',
    effectDescription: '🟢 Passiva: Engenharia de Tokens. Vulnerabilidades da categoria Authentication concedem +50% de pontuação extra no Report.',
    flavorText: 'Decodificando tokens HS256 / RS256.',
    artConcept: 'Chave dourada reluzente com gravação binária.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-commix',
    name: 'Commix',
    type: 'tool',
    effectDescription: '🟢 Passiva: Command Injection Harness. Vulnerabilidades de Command Injection ou RCE recebem +30% de bónus adicional de bounty.',
    flavorText: 'Automated OS Command Injection.',
    artConcept: 'Prompt de comando executando whoami.',
    rarity: 'Rare'
  },

  // --- BYPASS CARDS (Safeguards) ---
  {
    id: 'defuse-0day-reserve',
    name: 'Bypass',
    type: 'defuse',
    effectDescription: 'Safeguard SUPREMA: Anula o efeito destrutivo imediato do PATCH DEPLOYED! e permite reembaralhar o Patch de volta ao deck na posição desejada.',
    flavorText: 'Mecanismo de escape implementado no sistema.',
    artConcept: 'Cofre cibernético verde pulsante impedindo o alarme.',
    rarity: 'Rare'
  },
  {
    id: 'defuse-0day-reserve-2',
    name: 'Bypass',
    type: 'defuse',
    effectDescription: 'Safeguard SUPREMA: Anula o efeito destrutivo imediato do PATCH DEPLOYED! e permite reembaralhar o Patch de volta ao deck.',
    flavorText: 'Sempre mantenha um exploit na manche dos teus ficheiros.',
    artConcept: 'Cofre cibernético verde pulsante.',
    rarity: 'Rare'
  },
  {
    id: 'defuse-cve-assignment',
    name: 'CVE Assignment',
    type: 'defuse',
    effectDescription: 'Proteção de Escopo: Protege teu programa ativo contra qualquer evento adverso (Duplicate, Out of Scope) durante a ronda corrente.',
    flavorText: 'CVE-2026-9999 reservado no MITRE.',
    artConcept: 'Selo oficial de autenticidade em cibersegurança.',
    rarity: 'Uncommon'
  },

  // --- CHAOS EVENT CARDS (Exploding Kittens do PWND!) ---
  {
    id: 'event-patch-deployed-1',
    name: 'PATCH DEPLOYED!',
    type: 'event',
    effectDescription: 'CRÍTICO! A equipe da corporação lançou um patch de emergência! Descarta TODAS as vulnerabilidades não reportadas no programa ativo, a menos que o jogador use uma Safeguard (Bypass).',
    flavorText: 'Emergency Hotfix v2.4.1 implantado em produção!',
    artConcept: 'Alerta vermelho piscante de Datacenter e sirene CRT.',
    rarity: 'Legendary'
  },
  {
    id: 'event-patch-deployed-2',
    name: 'PATCH DEPLOYED!',
    type: 'event',
    effectDescription: 'CRÍTICO! A equipe da corporação lançou um patch de emergência! Descarta TODAS as vulnerabilidades não reportadas no programa ativo.',
    flavorText: 'Commit direto na master por causa de vazamento!',
    artConcept: 'Alerta vermelho piscante de Datacenter.',
    rarity: 'Legendary'
  },
  {
    id: 'event-duplicate-report',
    name: 'Duplicate Report!',
    type: 'event',
    effectDescription: 'DUPLICADO! Outro pesquisador submeteu a vulnerabilidade minutos antes. Perde a vulnerabilidade de maior pontuação no programa ativo.',
    flavorText: 'Status: Closed as Duplicate. Sem recompensa.',
    artConcept: 'Carimbo vermelho "DUPLICATE" sobre relatório em código.',
    rarity: 'Uncommon'
  },
  {
    id: 'event-out-of-scope',
    name: 'Out of Scope!',
    type: 'event',
    effectDescription: 'FORA DE ESCOPO! A vulnerabilidade ativada não pertence ao escopo formal do programa. O relatório é anulado.',
    flavorText: 'Subdomínio *.dev não faz parte da política de recompensa.',
    artConcept: 'Placa de "Proibido Ultrapassar" no ciberespaço.',
    rarity: 'Common'
  },
  {
    id: 'event-legal-threat',
    name: 'Legal Threat!',
    type: 'event',
    effectDescription: 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Impede tu de realizar a ação REPORT por 2 rondas.',
    flavorText: 'Notificação extrajudicial por teste não autorizado.',
    artConcept: 'Martelo de juiz com cabos de rede quebrados.',
    rarity: 'Rare'
  },
  {
    id: 'event-bounty-increase',
    name: 'Bounty Increase!',
    type: 'event',
    effectDescription: 'BÔNUS GLOBAL! A corporação aumentou o valor de todas as recompensas no programa ativo em 2x nas próximas 2 rondas.',
    flavorText: 'Double Bounty Week no HackerOne!',
    artConcept: 'Moedas de ouro digitais chovendo sobre servidores.',
    rarity: 'Uncommon'
  },
  {
    id: 'event-swag-drop',
    name: 'Swag Drop!',
    type: 'event',
    effectDescription: 'RECOMPENSA DE CONSOLAÇÃO! Todos os jogadores compram 1 carta de ferramenta aleatória do deck.',
    flavorText: 'Camisetas, adesivos e canecas de hacker para todos!',
    artConcept: 'Caixa de presentes cibernética com adesivos OWASP.',
    rarity: 'Common'
  }
];
