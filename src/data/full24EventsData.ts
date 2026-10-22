export interface EventCardData {
  id: string;
  number: string;
  name: string;
  enName?: string;
  technicalReference: string;
  icon: string;
  targetText: string;
  simpleDescription: string;
  ptDescription?: string;
  effectType: 'patch' | 'duplicate' | 'scope' | 'legal' | 'delay' | 'bounty' | 'meta';
}

export const FULL_24_EVENTS: EventCardData[] = [
  {
    id: 'evt-01',
    number: '01',
    name: 'Blue Team Hunt!',
    technicalReference: 'Proactive Threat Hunting',
    icon: '🕵️',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'O time de defesa entra em ação proativa! Todos os jogadores devem descartar a vulnerabilidade de maior CVSS que possuírem exposta na mesa.',
    ptDescription: 'O time de defesa entra em ação proativa! Todos os jogadores devem descartar a vulnerabilidade de maior CVSS que possuírem exposta na mesa.',
    effectType: 'patch'
  },
  {
    id: 'evt-02',
    number: '02',
    name: 'Duplicate Report!',
    technicalReference: 'Duplicated Vulnerability Submission',
    icon: '📝',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Alguém reportou a vulnerabilidade minutos antes! Escolha 1 oponente com vulnerabilidades na mesa: ele descarta a vulnerabilidade de maior CVSS exposta.',
    ptDescription: 'Alguém reportou a vulnerabilidade minutos antes! Escolha 1 oponente com vulnerabilidades na mesa: ele descarta a vulnerabilidade de maior CVSS exposta.',
    effectType: 'duplicate'
  },
  {
    id: 'evt-03',
    number: '03',
    name: 'Out of Scope!',
    technicalReference: 'Out of Scope Boundary Rejection',
    icon: '❌',
    targetText: 'O Autor do Report',
    simpleDescription: 'Seu reporte gerou alerta no comitê de escopo! Você fica impedido de realizar a ação Exploit (baixar vulnerabilidades) no seu próximo turno.',
    ptDescription: 'Seu reporte gerou alerta no comitê de escopo! Você fica impedido de realizar a ação Exploit (baixar vulnerabilidades) no seu próximo turno.',
    effectType: 'scope'
  },
  {
    id: 'evt-04',
    number: '04',
    name: 'Legal Threat!',
    technicalReference: 'Cease & Desist',
    icon: '⚖️',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.',
    ptDescription: 'AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele deve pagar $1.500 da sua Bounty Track para advogados de defesa, ou fica impedido de realizar a ação Report no seu próximo turno.',
    effectType: 'delay'
  },
  {
    id: 'evt-05',
    number: '05',
    name: 'Triage Delay!',
    technicalReference: 'Corporate Backlog Delay',
    icon: '⏳',
    targetText: 'O Autor do Report',
    simpleDescription: 'Equipe corporativa em backlog! Você fica impedido de instalar ou ativar Tools no seu próximo turno.',
    ptDescription: 'Equipe corporativa em backlog! Você fica impedido de instalar ou ativar Tools no seu próximo turno.',
    effectType: 'delay'
  },
  {
    id: 'evt-06',
    number: '06',
    name: 'Bug Bounty Mediation',
    technicalReference: 'Consensus Bounty Settlement',
    icon: '🤝',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Acordo de mediação global! Todos os jogadores recebem $1.500 imediatamente na Bounty Track.',
    ptDescription: 'Acordo de mediação global! Todos os jogadores recebem $1.500 imediatamente na Bounty Track.',
    effectType: 'bounty'
  },
  {
    id: 'evt-07',
    number: '07',
    name: 'Zero Day Disclosure',
    technicalReference: 'Discard Pile Rescue',
    icon: '🔓',
    targetText: 'Jogador em Último Lugar',
    simpleDescription: 'Vazamento oportuno! O jogador com o menor saldo na Bounty Track resgata 1 Tool Card da pilha de descarte para a mão (se houver).',
    ptDescription: 'Vazamento oportuno! O jogador com o menor saldo na Bounty Track resgata 1 Tool Card da pilha de descarte para a mão (se houver).',
    effectType: 'meta'
  },
  {
    id: 'evt-08',
    number: '08',
    name: 'Scope Expansion!',
    technicalReference: 'Corporate Scope Window Expansion',
    icon: '🌐',
    targetText: 'O Autor do Report',
    simpleDescription: 'A empresa expandiu o programa! No seu próximo turno, você pode jogar qualquer vulnerabilidade na mesa ignorando as restrições de escopo.',
    ptDescription: 'A empresa expandiu o programa! No teu próximo turno, tu podes jogar qualquer vulnerabilidade na mesa ignorando as restrições de escopo.',
    effectType: 'scope'
  },
  {
    id: 'evt-09',
    number: '09',
    name: 'Public Disclosure!',
    technicalReference: 'Public Zero-Day Exfiltration',
    icon: '📢',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Vazamento público! Todos os jogadores descartam suas vulnerabilidades expostas na mesa, mas recebem indenização na Bounty Track conforme a raridade: +$1.000 (Comum/Incomum), +$2.000 (Rara), +$2.500 (Épica) e +$3.000 (Lendária).',
    ptDescription: 'Vazamento público! Todos os jogadores descartam suas vulnerabilidades expostas na mesa, mas recebem indenização na Bounty Track conforme a raridade: +$1.000 (Comum/Incomum), +$2.000 (Rara), +$2.500 (Épica) e +$3.000 (Lendária).',
    effectType: 'bounty'
  },
  {
    id: 'evt-10',
    number: '10',
    name: 'Bounty Increase!',
    technicalReference: 'Double Bounty Multiplier',
    icon: '💰',
    targetText: 'O Autor do Report / Mesa',
    simpleDescription: 'Verba de emergência liberada! Posicione este evento no centro da mesa: ele permanece ativo por 1 volta completa (descarte-o no início do seu próximo turno). Qualquer jogador que realizar um Report bem-sucedido enquanto este evento estiver ativo recebe +$1.500 de bônus na Bounty Track.',
    ptDescription: 'Verba de emergência liberada! Posicione este evento no centro da mesa: ele permanece ativo por 1 volta completa (descarte-o no início do seu próximo turno). Qualquer jogador que realizar um Report bem-sucedido enquanto este evento estiver ativo recebe +$1.500 de bônus na Bounty Track.',
    effectType: 'bounty'
  },
  {
    id: 'evt-11',
    number: '11',
    name: 'WAF Deployed!',
    technicalReference: 'Web Application Firewall Block',
    icon: '🛡️',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Filtro de WAF ativado! Vulnerabilidades da classe Injection não podem ser baixadas na mesa por 1 rodada completa.',
    ptDescription: 'Filtro de WAF ativado! Vulnerabilidades da classe Injection não podem ser baixadas na mesa por 1 ronda completa.',
    effectType: 'meta'
  },
  {
    id: 'evt-12',
    number: '12',
    name: 'DNS Hijack!',
    technicalReference: 'Compulsory Target Switch',
    icon: '🌐',
    targetText: 'Jogador com Maior Saldo (Líder)',
    simpleDescription: 'Sequestro de tráfego! O jogador com o MAIOR saldo na Bounty Track descarta o seu programa, pega o próximo do deck e descarta as vulnerabilidades na mesa que ficarem fora de escopo.',
    ptDescription: 'Sequestro de tráfego! O jogador com o MAIOR saldo na Bounty Track descarta o seu programa, pega o próximo do deck e descarta as vulnerabilidades na mesa que ficarem fora de escopo.',
    effectType: 'meta'
  },
  {
    id: 'evt-13',
    number: '13',
    name: 'Responsible Disclosure!',
    technicalReference: 'Instant Free Submission Window',
    icon: '📄',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rolar os dados (não compra tool nem evento), respeitando a ordem da mesa.',
    ptDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rolar os dados (não compra tool nem evento), respeitando a ordem da mesa.',
    effectType: 'bounty'
  },
  {
    id: 'evt-14',
    number: '14',
    name: 'Honeypot Triggered!',
    technicalReference: 'Decoy Server Trap',
    icon: '🍯',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão (em partidas de 2 jogadores, descarta apenas 1 carta).',
    ptDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão (em partidas de 2 jogadores, descarta apenas 1 carta).',
    effectType: 'delay'
  },
  {
    id: 'evt-15',
    number: '15',
    name: 'CVE Assignment Delayed!',
    technicalReference: 'Defuse Blockade Window',
    icon: '⏳',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Burocracia na atribuição de CVE! Cartas de Defesa (Safeguard) ficam bloqueadas por 1 rodada completa (efeito imediato, vale contra patches do mesmo turno).',
    ptDescription: 'Burocracia na atribuição de CVE! Cartas de Defesa (Safeguard) ficam bloqueadas por 1 ronda completa (efeito imediato, vale contra patches do mesmo turno).',
    effectType: 'delay'
  },
  {
    id: 'evt-16',
    number: '16',
    name: 'Bug Collision!',
    technicalReference: 'Lowest CVSS Discard Event',
    icon: '💥',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Colisão de relatórios no mercado! Todos os jogadores descartam a vulnerabilidade de menor CVSS exposta em suas mesas.',
    ptDescription: 'Colisão de relatórios no mercado! Todos os jogadores descartam a vulnerabilidade de menor CVSS exposta em tuas mesas.',
    effectType: 'duplicate'
  },
  {
    id: 'evt-17',
    number: '17',
    name: 'Hall of Fame Update!',
    technicalReference: 'Underdog Catch-Up Boost',
    icon: '🏆',
    targetText: 'Jogador em Último Lugar',
    simpleDescription: 'Reconhecimento na comunidade! O jogador em último lugar na Bounty Track recebe +$1.500 de bônus no seu próximo Report bem-sucedido.',
    ptDescription: 'Reconhecimento na comunidade! O jogador em último lugar na Bounty Track recebe +$1.500 de bónus no seu próximo Report bem-sucedido.',
    effectType: 'meta'
  },
  {
    id: 'evt-18',
    number: '18',
    name: 'Rate Limited!',
    technicalReference: 'Network Traffic Restriction',
    icon: '🛑',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Restrição de tráfego na rede! Todos os jogadores ficam impedidos de realizar a ação Recon (comprar cartas) no seu próximo turno.',
    ptDescription: 'Restrição de tráfego na rede! Todos os jogadores ficam impedidos de realizar a ação Recon (comprar cartas) no seu próximo turno.',
    effectType: 'delay'
  },
  {
    id: 'evt-19',
    number: '19',
    name: '2FA Enforced!',
    technicalReference: 'Auth Class Lockdown',
    icon: '🔐',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Autenticação em dois fatores ativada! Vulnerabilidades da classe Authentication ficam bloqueadas de serem baixadas por 1 rodada.',
    ptDescription: 'Autenticação em dois fatores ativada! Vulnerabilidades da classe Authentication ficam bloqueadas de serem baixadas por 1 ronda.',
    effectType: 'meta'
  },
  {
    id: 'evt-20',
    number: '20',
    name: 'Bug Bounty Conference!',
    technicalReference: 'Global Networking Event',
    icon: '🎪',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Confraternização da comunidade! Todos os jogadores compram 2 cartas do Main Deck imediatamente.',
    ptDescription: 'Confraternização da comunidade! Todos os jogadores compram 2 cartas do Main Deck imediatamente.',
    effectType: 'meta'
  },
  {
    id: 'evt-21',
    number: '21',
    name: 'Acquisition!',
    technicalReference: 'Corporate Acquisition & Scope Flush',
    icon: '🤝',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Fusão corporativa! Descarte os programas expostos do mercado e reponha-os. Se pelo menos um permitir todas as classes de escopo (ALL), todos os jogadores avançam +$500 na Bounty Track.',
    ptDescription: 'Fusão corporativa! Descarte os programas expostos do mercado e reponha-os. Se pelo menos um permitir todas as classes de escopo (ALL), todos os jogadores avançam +$500 na Bounty Track.',
    effectType: 'duplicate'
  },
  {
    id: 'evt-22',
    number: '22',
    name: 'Security Audit!',
    technicalReference: 'Compliance Audit Cycle',
    icon: '📅',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Varredura geral de conformidade! Todos os jogadores revelam a mão e descartam a carta de maior CVSS.',
    ptDescription: 'Varredura geral de conformidade! Todos os jogadores revelam a mão e descartam a carta de maior CVSS.',
    effectType: 'meta'
  },
  {
    id: 'evt-23',
    number: '23',
    name: 'Swag Drop!',
    technicalReference: 'Consolation Gear Reward',
    icon: '🎁',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Brindes e mimos do patrocinador! Cada jogador compra 1 carta de ferramenta (Tool Card) do Tool Deck.',
    ptDescription: 'Brindes e mimos do patrocinador! Cada jogador compra 1 carta de ferramenta (Tool Card) do Tool Deck.',
    effectType: 'meta'
  },
  {
    id: 'evt-24',
    number: '24',
    name: 'Bounty Ético',
    enName: 'Ethical Bounty',
    technicalReference: 'Coordinated Vulnerability Disclosure',
    icon: '🏅',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Auditoria de conformidade corporativa! Cada jogador que possuir zero Tokens de Alerta na mesa recebe imediatamente +$1.500 de bônus de conduta ética na Bounty Track.',
    ptDescription: 'Auditoria de conformidade corporativa! Cada jogador que possuir zero Tokens de Alerta na mesa recebe imediatamente +$1.500 de bônus de conduta ética na Bounty Track.',
    effectType: 'bounty'
  }
];

// PARKED — aguardando aprovação do usuário
/*
{
    id: 'evt-parked-01',
    number: '04',
    name: 'License Expired!',
    technicalReference: 'Software License Expiration',
    icon: '🔑',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Licença de software expirada! Escolha 1 oponente: ele deve remover 1 carga de uma Tool do seu Rack (ou descartá-la).',
    ptDescription: 'Licença de software expirada! Escolha 1 oponente: ele deve remover 1 carga de uma Tool do teu Rack (ou descartá-la).',
    effectType: 'meta'
  }
,
{
    id: 'evt-parked-02',
    number: '18',
    name: 'Patch Tuesday!',
    technicalReference: 'Global Security Patch Cycle',
    icon: '📅',
    targetText: 'Todos os Jogadores',
    simpleDescription: 'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em seus Racks.',
    ptDescription: 'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em seus Racks.',
    effectType: 'patch'
  }
*/
