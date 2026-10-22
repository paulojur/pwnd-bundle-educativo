export type CardType = 'vulnerability' | 'tool' | 'event' | 'defuse';

export type VulnerabilityClass =
  | 'Injection'
  | 'Broken Access Control'
  | 'Cross-Site Scripting'
  | 'Authentication'
  | 'SSRF'
  | 'Business Logic'
  | 'Cryptographic Failures'
  | 'APT'
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
  presentation?: string;
  ptPresentation?: string;
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
    ptTitle: 'O Iniciante Dedicado',
    presentation: '"Alguém novo nessa vida de bug bounty, mas tô vendo oportunidade por toda parte. Toda grande carreira por aí começou rodando o primeiro scan."',
    ptPresentation: '"Alguém novo nessa vida de bug bounty, mas tô vendo oportunidade por toda parte. Toda grande carreira por aí começou rodando o primeiro scan."',
    playstyle: 'Garimpeiro de Ferramentas: após cada Report bem-sucedido, olho as 3 primeiras cartas do Tool Deck e escolho 1.',
    ptPlaystyle: 'Garimpeiro de Ferramentas: após cada Report bem-sucedido, olho as 3 primeiras cartas do Tool Deck e escolho 1.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Inicia simples', 'Escalabilidade contínua de recursos', '+1 compra de carta por report'],
    ptSpecialPowers: ['Inicia simples', 'Escalabilidade contínua de recursos', '+1 compra de carta por report'],
    avatarIcon: '🌱',
    color: '#39d353'
  },
  {
    id: 'old-guard',
    name: 'The Old Guard',
    title: 'Hacker Raiz',
    ptTitle: 'Hacker Raiz',
    presentation: '"Décadas atrás eu quebrava isso decorando pointers. Mão grande, paciência de quem escreveu memcpy com o pé. Não pergunte!"',
    ptPresentation: '"Décadas atrás eu quebrava isso decorando pointers. Mão grande, paciência de quem escreveu memcpy com o pé. Não pergunte!"',
    playstyle: 'Especialista Sênior: cada carta Épica ou Lendária incluída no Report vale +$500 extra no payout. Limite de mão aumentado para 8 cartas.',
    ptPlaystyle: 'Especialista Sênior: cada carta Épica ou Lendária incluída no Report vale +$500 extra no payout. Limite de mão aumentado para 8 cartas.',
    maxHandSize: 8,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Limite de mão: 8 cartas', '+$500 por carta Épica ou Lendária no Report', 'Foco em falhas de alto impacto'],
    ptSpecialPowers: ['Limite de mão: 8 cartas', '+$500 por carta Épica ou Lendária no Report', 'Foco em falhas de alto impacto'],
    avatarIcon: '🧠',
    color: '#c084fc'
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    title: 'O Caçador em Escala',
    ptTitle: 'O Caçador em Escala',
    presentation: '"Não busco o bug perfeito, busco os dez. Volume é qualidade por aqui. Escala é estratégia. Dez reportes ontem, dez amanhã."',
    ptPresentation: '"Não busco o bug perfeito, busco os dez. Volume é qualidade por aqui. Escala é estratégia. Dez reportes ontem, dez amanhã."',
    playstyle: 'Volume Attack: cada carta além da primeira no mesmo Report soma +$500 ao payout.\nRestrito a vulnerabilidades Comum e Incomum.\nEficiência em Volume: concluir um Report com 3 vulnerabilidades simultâneas concede 1 Token de Reputação (🐝).',
    ptPlaystyle: 'Volume Attack: cada carta além da primeira no mesmo Report soma +$500 ao payout.\nRestrito a vulnerabilidades Comum e Incomum.\nEficiência em Volume: concluir um Report com 3 vulnerabilidades simultâneas concede 1 Token de Reputação (🐝).',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['+$500 por carta além da 1ª no Report', 'Report com 3 cartas = 1 Reputação (🐝)', 'Restrito a Comum e Incomum'],
    ptSpecialPowers: ['+$500 por carta além da 1ª no Report', 'Report com 3 cartas = 1 Reputação (🐝)', 'Restrito a Comum e Incomum'],
    avatarIcon: '⚡',
    color: '#f0883e'
  },
  {
    id: 'social-engineer',
    name: 'Social Engineer',
    title: 'O Manipulador Social',
    ptTitle: 'O Manipulador Social',
    presentation: '"Eu não hackeio sistemas, hackeio pessoas. E todo mundo bebe o café que eu sirvo."',
    ptPresentation: '"Eu não hackeio sistemas, hackeio pessoas. E todo mundo bebe o café que eu sirvo."',
    playstyle: 'Caos Redirecionado (uma vez por rodada): ao ser alvo de um Evento individual negativo, transfira o efeito para outro oponente.\nPhishing (uma vez por rodada, ação livre): puxe 1 carta aleatória da mão de um oponente e entregue 1 carta da sua mão para ele.',
    ptPlaystyle: 'Caos Redirecionado (uma vez por ronda): ao ser alvo de um Evento individual negativo, transfere o efeito para outro oponente.\nPhishing (uma vez por ronda, ação livre): puxa 1 carta aleatória da mão de um oponente e entrega 1 carta da tua mão para ele.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Redireciona cartas de evento maléficas', 'Phishing: troca 1 carta com rival', 'Alta interação de mesa'],
    ptSpecialPowers: ['Redireciona cartas de evento maléficas', 'Phishing: troca 1 carta com rival', 'Alta interação de mesa'],
    avatarIcon: '🎭',
    color: '#58a6ff'
  },
  {
    id: 'red-teamer',
    name: 'Red Teamer',
    title: 'O Operador Ofensivo',
    ptTitle: 'O Operador Ofensivo',
    presentation: '"Escopo é sugestão, não contrato. Qualquer alvo, qualquer hora, mas meu preço é o dobro."',
    ptPresentation: '"Escopo é sugestão, não contrato. Qualquer alvo, qualquer hora, mas meu preço é o dobro."',
    playstyle: 'Sem Limites: ignoro as restrições de escopo dos programas e posso explorar qualquer vulnerabilidade em qualquer alvo.\nCusto Operacional: subtraia $1.500 do payout total de cada Report.',
    ptPlaystyle: 'Sem Limites: ignoro as restrições de escopo dos programas e posso explorar qualquer vulnerabilidade em qualquer alvo.\nCusto Operacional: subtrai $1.500 do payout total de cada Report.',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Ignora escopo de programas', 'Explora qualquer vulnerabilidade em qualquer alvo', 'Custo Operacional (-$1.500 por Report)'],
    ptSpecialPowers: ['Ignora escopo de programas', 'Explora qualquer vulnerabilidade em qualquer alvo', 'Custo Operacional (-$1.500 por Report)'],
    avatarIcon: '⚔️',
    color: '#f85149'
  },
  {
    id: 'pentester',
    name: 'The Pentester',
    title: 'O Auditor Metódico',
    ptTitle: 'O Auditor Metódico',
    presentation: '"Faço o que ninguém tem paciência: o mesmo teste, setenta vezes, com planilha. Checklist preenchido, vida tranquila. Sistema auditado."',
    ptPresentation: '"Faço o que ninguém tem paciência: o mesmo teste, setenta vezes, com planilha. Checklist preenchido, vida tranquila. Sistema auditado."',
    playstyle: 'Auditor Metódico: imune a Duplicate Report! e a Triage Delay!.\nRelatório Estruturado: ganhe +$500 por cada classe técnica diferente no seu Report além da primeira (máximo de +$1.000).',
    ptPlaystyle: 'Auditor Metódico: imune a Duplicate Report! e a Triage Delay!.\nRelatório Estruturado: ganha +$500 por cada classe técnica diferente no teu Report além da primeira (máximo de +$1.000).',
    maxHandSize: 6,
    reportsPerTurn: 1,
    bountyModifier: 1.0,
    specialPowers: ['Imunidade a Duplicate Report!', 'Imunidade a Triage Delay!', 'Relatório Estruturado (+$500 por classe diferente)'],
    ptSpecialPowers: ['Imunidade a Duplicate Report!', 'Imunidade a Triage Delay!', 'Relatório Estruturado (+$500 por classe diferente)'],
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
    description: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.',
    ptDescription: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.'
  },
  {
    id: 'shopall-2',
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.',
    ptDescription: 'Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.'
  },
  {
    id: 'shopall-3',
    name: 'ShopAll Global',
    companyType: 'E-Commerce Multinacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Plataforma gigante com alta rotatividade de pesquisadores.',
    ptDescription: 'Plataforma gigante com alta rotatividade de pesquisadores.'
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
    description: 'Escopo restrito a APIs, Autenticação e Criptografia. Pagamentos elevados!',
    ptDescription: 'Escopo restrito a APIs, Autenticação e Criptografia. Pagamentos elevados!'
  },
  {
    id: 'banksafe-2',
    name: 'BankSafe Financial',
    companyType: 'Instituição Financeira Digital',
    allowedClasses: ['Authentication', 'Cryptographic Failures', 'Broken Access Control', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Escopo restrito a APIs e Autenticação bancária de alta liquidez.',
    ptDescription: 'Escopo restrito a APIs e Autenticação bancária de alta liquidez.'
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
    description: 'Demora para corrigir (patch lento). Ideal para acumular combos longos!',
    ptDescription: 'Demora para corrigir (patch lento). Ideal para acumular combos longos!'
  },
  {
    id: 'govportal-2',
    name: 'GovPortal Legacy',
    companyType: 'Sistema Governamental Legado',
    allowedClasses: ['Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Sistema legado em servidores locais antigos com ritmo de patch lento.',
    ptDescription: 'Sistema legado em servidores locais antigos com ritmo de patch lento.'
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
    description: 'Focado em sigilo de dados sensíveis e criptografia de registros hospitalares.',
    ptDescription: 'Focado em sigilo de dados sensíveis e criptografia de registros hospitalares.'
  },
  {
    id: 'healthlock-2',
    name: 'HealthLock EHR',
    companyType: 'Prontuário Médico Digital',
    allowedClasses: ['Cryptographic Failures', 'Authentication', 'SSRF', 'Broken Access Control'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Sistema hospitalar privado sob constante auditoria de conformidade.',
    ptDescription: 'Sistema hospitalar privado sob constante auditoria de conformidade.'
  },

  // --- 5. CloudNine Cloud Services (1 cópia) ---
  {
    id: 'cloudnine-1',
    name: 'CloudNine Cloud Services',
    companyType: 'Provedor de Infraestrutura em Nuvem',
    allowedClasses: ['SSRF', 'Injection', 'APT'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bónus Fixos',
    flatBountyBonus: 4000,
    description: 'Recompensas astronômicas para RCE, SSRF e vulnerabilidades de infraestrutura. Alto risco de Patch!',
    ptDescription: 'Recompensas astronômicas para RCE, SSRF e vulnerabilidades de infraestrutura. Alto risco de Patch!'
  },

  // --- 6. SocialHive Media (3 cópias) ---
  {
    id: 'socialbee-1',
    name: 'SocialHive Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Focado em vulnerabilidades de privacidade, XSS e lógica de engajamento social.',
    ptDescription: 'Focado em vulnerabilidades de privacidade, XSS e lógica de engajamento social.'
  },
  {
    id: 'socialbee-2',
    name: 'SocialHive Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Plataforma social de alto tráfego com foco em permissões de perfil.',
    ptDescription: 'Plataforma social de alto tráfego com foco em permissões de perfil.'
  },
  {
    id: 'socialbee-3',
    name: 'SocialHive Media',
    companyType: 'Rede Social Global',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Broken Access Control'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Inúmeras sub-plataformas integradas suscetíveis a roubo de cookies e manipulação.',
    ptDescription: 'Inúmeras sub-plataformas integradas suscetíveis a roubo de cookies e manipulação.'
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
    description: 'Injeção de itens, manipulação de saldo virtual e exploits em WebSockets.',
    ptDescription: 'Injeção de itens, manipulação de saldo virtual e exploits em WebSockets.'
  },
  {
    id: 'gameverse-2',
    name: 'GameVerse MMO',
    companyType: 'Plataforma Massiva de Jogos',
    allowedClasses: ['Business Logic', 'Injection', 'Cross-Site Scripting'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Servidores de jogos síncronos expostos a exploração de lógica de mercado.',
    ptDescription: 'Servidores de jogos síncronos expostos a exploração de lógica de mercado.'
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
    description: 'Ambiente seguro para iniciantes praticarem. Quase sem risco de Patch instantâneo.',
    ptDescription: 'Ambiente seguro para iniciantes praticarem. Quase sem risco de Patch instantâneo.'
  },
  {
    id: 'educonnect-2',
    name: 'EduConnect LMS',
    companyType: 'Plataforma Educacional',
    allowedClasses: 'ALL',
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bónus Fixos',
    flatBountyBonus: 0,
    description: 'Sistema acadêmico comunitário com tolerância prolongada de patches.',
    ptDescription: 'Sistema acadêmico comunitário com tolerância prolongada de patches.'
  },

  // --- 9. CryptoX Exchange (1 cópia) ---
  {
    id: 'cryptox-1',
    name: 'CryptoX Exchange',
    companyType: 'Corretora de Criptomoedas',
    allowedClasses: ['Authentication', 'Cryptographic Failures', 'Business Logic', 'APT'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Corretora de ativos digitais sob alto risco de ataques de autenticação e carteira.',
    ptDescription: 'Corretora de ativos digitais sob alto risco de ataques de autenticação e carteira.'
  },

  // --- 10. AI Core Systems (1 cópia) ---
  {
    id: 'aicore-1',
    name: 'AI Core Systems',
    companyType: 'Infraestrutura de IA Generativa',
    allowedClasses: ['Injection', 'SSRF', 'APT'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bónus Fixos',
    flatBountyBonus: 4000,
    description: 'Clusters de treinamento de modelos de linguagem vulneráveis a Prompt Injection e RCE.',
    ptDescription: 'Clusters de treinamento de modelos de linguagem vulneráveis a Prompt Injection e RCE.'
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
    description: 'Gateway financeiro global conectando cartões de crédito e Pix.',
    ptDescription: 'Gateway financeiro global conectando cartões de crédito e Pix.'
  },
  {
    id: 'paygateway-2',
    name: 'PayGateway Prime',
    companyType: 'Processadora de Pagamentos',
    allowedClasses: ['Broken Access Control', 'Authentication', 'Injection'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bónus Fixos',
    flatBountyBonus: 2500,
    description: 'Processador financeiro com rigorosos controles de auditoria de cartões.',
    ptDescription: 'Processador financeiro com rigorosos controles de auditoria de cartões.'
  },

  // --- 12. DeliveryDash App (3 cópias) ---
  {
    id: 'deliverydash-1',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Aplicativo de entregas urbanas com vulnerabilidades de cupom, IDOR e SSRF em webhooks.',
    ptDescription: 'Aplicativo de entregas urbanas com vulnerabilidades de cupom, IDOR e SSRF em webhooks.'
  },
  {
    id: 'deliverydash-2',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bónus Fixos',
    flatBountyBonus: 1000,
    description: 'Rede logística de entregas rápidas suscetível a manipulação de pedidos e SSRF interno.',
    ptDescription: 'Rede logística de entregas rápidas suscetível a manipulação de pedidos e SSRF interno.'
  },
  {
    id: 'deliverydash-3',
    name: 'DeliveryDash App',
    companyType: 'Plataforma Logística e Entregas',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Frequentes vulnerabilidades de lógica em promoções e requisições forjadas de rastreamento.',
    ptDescription: 'Frequentes vulnerabilidades de lógica em promoções e requisições forjadas de rastreamento.'
  },
  // --- 13. BioGen Genomics (2 cópias) ---
  {
    id: 'biogen-1',
    name: 'BioGen Genomics',
    companyType: 'Biotecnologia & Pesquisa Clínica',
    allowedClasses: ['Cryptographic Failures', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bônus Fixos',
    flatBountyBonus: 2500,
    description: 'Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.',
    ptDescription: 'Investigação genómica confidencial. Foco em servidores internos e controlo de acesso.'
  },
  {
    id: 'biogen-2',
    name: 'BioGen Genomics',
    companyType: 'Biotecnologia & Pesquisa Clínica',
    allowedClasses: ['Cryptographic Failures', 'Broken Access Control', 'SSRF'],
    patchSpeed: 'Rápida',
    bountyRange: '+$2.5k Bônus Fixos',
    flatBountyBonus: 2500,
    description: 'Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.',
    ptDescription: 'Investigação genómica confidencial. Foco em servidores internos e controlo de acesso.'
  },

  // --- 14. Veloce AutoTech (2 cópias) ---
  {
    id: 'veloce-1',
    name: 'Veloce AutoTech',
    companyType: 'Firmware Automotivo & IoT',
    allowedClasses: ['Injection', 'Business Logic', 'Authentication'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.',
    ptDescription: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de topo.'
  },
  {
    id: 'veloce-2',
    name: 'Veloce AutoTech',
    companyType: 'Firmware Automotivo & IoT',
    allowedClasses: ['Injection', 'Business Logic', 'Authentication'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.',
    ptDescription: 'Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de topo.'
  },

  // --- 15. Voltz PowerGrid (2 cópias) ---
  {
    id: 'voltz-1',
    name: 'Voltz PowerGrid',
    companyType: 'Infraestrutura Crítica & SCADA',
    allowedClasses: ['Injection', 'Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bônus Fixos',
    flatBountyBonus: 0,
    description: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.',
    ptDescription: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.'
  },
  {
    id: 'voltz-2',
    name: 'Voltz PowerGrid',
    companyType: 'Infraestrutura Crítica & SCADA',
    allowedClasses: ['Injection', 'Broken Access Control'],
    patchSpeed: 'Lenta',
    bountyRange: '+$0 Bônus Fixos',
    flatBountyBonus: 0,
    description: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.',
    ptDescription: 'Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.'
  },

  // --- 16. PulseStream Media (2 cópias) ---
  {
    id: 'pulsestream-1',
    name: 'PulseStream Media',
    companyType: 'Mídia Digital & Distribuição DRM',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Cryptographic Failures'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.',
    ptDescription: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de subscrições.'
  },
  {
    id: 'pulsestream-2',
    name: 'PulseStream Media',
    companyType: 'Mídia Digital & Distribuição DRM',
    allowedClasses: ['Cross-Site Scripting', 'Business Logic', 'Cryptographic Failures'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.',
    ptDescription: 'Distribuição de streaming. Foco em falhas de DRM, portal web e validação de subscrições.'
  },

  // --- 17. AeroOrbit Avionics (2 cópias) ---
  {
    id: 'aeroorbit-1',
    name: 'AeroOrbit Avionics',
    companyType: 'Tecnologia Aeroespacial & Satélites',
    allowedClasses: ['SSRF', 'Authentication', 'Cryptographic Failures'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.',
    ptDescription: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.'
  },
  {
    id: 'aeroorbit-2',
    name: 'AeroOrbit Avionics',
    companyType: 'Tecnologia Aeroespacial & Satélites',
    allowedClasses: ['SSRF', 'Authentication', 'Cryptographic Failures'],
    patchSpeed: 'Extrema',
    bountyRange: '+$4.0k Bônus Fixos',
    flatBountyBonus: 4000,
    description: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.',
    ptDescription: 'Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.'
  },

  // --- 18. TaxCore Federal (2 cópias) ---
  {
    id: 'taxcore-1',
    name: 'TaxCore Federal',
    companyType: 'Administração Tributária Pública',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Authentication'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.',
    ptDescription: 'Sistema fiscal e emissão de faturas eletrónicas. Auditoria em regras de cálculo e autorizações.'
  },
  {
    id: 'taxcore-2',
    name: 'TaxCore Federal',
    companyType: 'Administração Tributária Pública',
    allowedClasses: ['Business Logic', 'Broken Access Control', 'Authentication'],
    patchSpeed: 'Moderada',
    bountyRange: '+$1.0k Bônus Fixos',
    flatBountyBonus: 1000,
    description: 'Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.',
    ptDescription: 'Sistema fiscal e emissão de faturas eletrónicas. Auditoria em regras de cálculo e autorizações.'
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
    toolRequirements: ['Interceptor Pro', 'Injection Lab'],
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
    toolRequirements: ['Interceptor Pro', 'Echo Beacon'],
    effectDescription: 'Permite visualizar a mão completa de um oponente por 1 ronda inteira.',
    flavorText: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    artConcept: 'Silhueta de sobretudo observando um rack de servidores.',
    rarity: 'Rare'
  },
  {
    id: 'vuln-4',
    name: 'Boneco de Marionete',
    type: 'vulnerability',
    vulnClass: 'APT',
    cvss: 10.0,
    severity: 'Critical',
    toolRequirements: ['Interceptor Pro', 'PortSweep', 'Command Harness'],
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
    toolRequirements: ['Endpoint Lab'],
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
    toolRequirements: ['Token Cracker'],
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
    toolRequirements: ['Hex Kitchen'],
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
    toolRequirements: ['Interceptor Pro'],
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
    toolRequirements: ['Echo Beacon', 'Endpoint Lab'],
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
    toolRequirements: ['Endpoint Lab', 'Interceptor Pro'],
    effectDescription: 'Permite alterar a rota da API para extrair relatórios confidenciais de outros pesquisadores.',
    flavorText: 'GET /api/v1/users/admin/export_all.json',
    artConcept: 'Bola de futebol digital rasgando uma rede de firewall.',
    rarity: 'Uncommon'
  },
  {
    id: 'vuln-12',
    name: 'Deserialização Macabra',
    type: 'vulnerability',
    vulnClass: 'APT',
    cvss: 9.8,
    severity: 'Critical',
    toolRequirements: ['Interceptor Pro', 'Hex Kitchen', 'Command Harness'],
    effectDescription: 'Ganha bónus de 3x em programas Java/Enterprise. Se o programa for CloudNine, dobra a recompensa final.',
    flavorText: 'Log4Shell ressurgindo das cinzas do datacenter.',
    artConcept: 'Chamas verdes consumindo servidores em formato de dragão de código.',
    rarity: 'Legendary'
  },

  // --- TOOL CARDS ---
  {
    id: 'tool-interceptor-pro',
    name: 'Interceptor Pro',
    type: 'tool',
    effectDescription: '🔴 Ativa: Ferramenta Universal. Substitui qualquer ferramenta específica exigida ao baixar vulnerabilidades.',
    flavorText: 'A arma definitiva do pesquisador ofensivo.',
    artConcept: 'Terminal tático com fluxos de requisição HTTP interceptados e manipulados em tempo real.',
    rarity: 'Epic'
  },
  {
    id: 'tool-portsweep',
    name: 'PortSweep',
    type: 'tool',
    effectDescription: '🟢 Passiva: Bónus de Recon. Concede a compra de 3 cartas na ação Recon em vez de 2.',
    flavorText: 'Varredura completa de portas e serviços a alta velocidade.',
    artConcept: 'Radar circular varrendo blocos de IP em terminal verde.',
    rarity: 'Common'
  },
  {
    id: 'tool-spiderscan',
    name: 'SpiderScan',
    type: 'tool',
    effectDescription: '🔴 Ativa: Automação de varredura. Permite baixar uma vulnerabilidade de severidade Low/Medium com custo de ferramentas zerado.',
    flavorText: 'Scanner automatizado para mapeamento contínuo de vulnerabilidades.',
    artConcept: 'Feixe de laser azul inspecionando uma teia de rotas web.',
    rarity: 'Common'
  },
  {
    id: 'tool-endpoint-lab',
    name: 'Endpoint Lab',
    type: 'tool',
    effectDescription: '🔴 Ativa: Testes de API. Reduz em 1 o custo de ativação de vulnerabilidades de Broken Access Control.',
    flavorText: 'Suíte de testes de rotas e requisições HTTP para auditoria de APIs.',
    artConcept: 'Console moderno com rotas REST e payloads JSON iluminados em ciano.',
    rarity: 'Common'
  },
  {
    id: 'tool-browser-devtools',
    name: 'Browser DevTools',
    type: 'tool',
    effectDescription: '🟢 Passiva: Amplificador Client-Side. Vulnerabilidades de classe XSS e DOM agregam +50% de valor no momento do Report.',
    flavorText: 'F12 é tudo o que você precisa.',
    artConcept: 'Console JavaScript com mensagens em destaque amarelo e verde.',
    rarity: 'Common'
  },
  {
    id: 'tool-injection-lab',
    name: 'Injection Lab',
    type: 'tool',
    effectDescription: '🔴 Ativa: Automação SQL. Anula os requisitos de ferramentas secundárias para vulnerabilidades de Injection (incluindo Command Injection).',
    flavorText: 'Injeção automatizada e extração de esquemas de banco de dados.',
    artConcept: 'Broca digital perfurando estruturas tabulares de banco de dados.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-echo-beacon',
    name: 'Echo Beacon',
    type: 'tool',
    effectDescription: 'PASSIVA: Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.',
    flavorText: 'Sinal de retorno capturado de servidor interno isolado.',
    artConcept: 'Receptor de alta sensibilidade captando sinais no ciberespaço.',
    rarity: 'Rare'
  },
  {
    id: 'tool-hex-kitchen',
    name: 'Hex Kitchen',
    type: 'tool',
    effectDescription: '🔴 Ativa: Canivete Suíço. Permite converter 2 cartas de ferramentas descartadas em 1 ferramenta de tua escolha do baralho.',
    flavorText: 'Laboratório definitivo de conversão, decodificação e análise de dados.',
    artConcept: 'Bancada digital com matrizes de caracteres Hex, Base64 e cifras criptográficas.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-token-cracker',
    name: 'Token Cracker',
    type: 'tool',
    effectDescription: '🟢 Passiva: Engenharia de Tokens. Vulnerabilidades da categoria Authentication concedem +50% de pontuação extra no Report.',
    flavorText: 'Decodificação e assinatura de tokens de autenticação.',
    artConcept: 'Chave dourada reluzente com gravação binária.',
    rarity: 'Uncommon'
  },
  {
    id: 'tool-command-harness',
    name: 'Command Harness',
    type: 'tool',
    effectDescription: '🟢 Passiva: Command Injection Harness. Vulnerabilidades de Command Injection ou RCE recebem +30% de bónus adicional de bounty.',
    flavorText: 'Injeção direta de comandos no interpretador do sistema operacional.',
    artConcept: 'Prompt de comando executando whoami em terminal seguro.',
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
    effectDescription: 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.',
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
