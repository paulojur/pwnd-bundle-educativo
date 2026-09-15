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
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'O time de defesa entra em ação proativa! Todos os jogadores ativos devem descartar a vulnerabilidade de maior CVSS que possuírem exposta na mesa.',
    ptDescription: 'O time de defesa entra em ação proativa! Todos os jogadores ativos devem descartar a vulnerabilidade de maior CVSS que possuírem exposta na mesa.',
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
    targetText: 'Tu (Autor do Report)',
    simpleDescription: 'Seu reporte gerou alerta no comitê de escopo! Você fica impedido de realizar a ação Exploit (baixar vulnerabilidades) no seu próximo turno.',
    ptDescription: 'Teu reporte gerou alerta no comitê de escopo! Tu ficas impedido de realizar a ação Exploit (baixar vulnerabilidades) no teu próximo turno.',
    effectType: 'scope'
  },
  {
    id: 'evt-04',
    number: '04',
    name: 'License Expired!',
    technicalReference: 'Software License Expiration',
    icon: '🔑',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Licença de software expirada! Escolha 1 oponente: ele deve remover 1 carga de uma Tool do seu Rack (ou descartá-la).',
    ptDescription: 'Licença de software expirada! Escolha 1 oponente: ele deve remover 1 carga de uma Tool do teu Rack (ou descartá-la).',
    effectType: 'meta'
  },
  {
    id: 'evt-05',
    number: '05',
    name: 'Triage Delay!',
    technicalReference: 'Corporate Backlog Delay',
    icon: '⏳',
    targetText: 'Tu (Autor do Report)',
    simpleDescription: 'Equipe corporativa em backlog! As cartas da sua mão devem jogar expostas (reveladas para a mesa) até o seu próximo turno.',
    ptDescription: 'Equipe corporativa em backlog! As cartas da tua mão devem jogar expostas (reveladas para a mesa) até o teu próximo turno.',
    effectType: 'delay'
  },
  {
    id: 'evt-06',
    number: '06',
    name: 'Bug Bounty Mediation',
    technicalReference: 'Consensus Bounty Settlement',
    icon: '🤝',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Acordo de mediação global! Todos os jogadores ativos recebem $1.500 imediatamente na Bounty Track.',
    ptDescription: 'Acordo de mediação global! Todos os jogadores ativos recebem $1.500 imediatamente na Bounty Track.',
    effectType: 'bounty'
  },
  {
    id: 'evt-07',
    number: '07',
    name: 'Zero Day Disclosure',
    technicalReference: 'Discard Pile Rescue',
    icon: '🔓',
    targetText: 'Jogador em Último Lugar',
    simpleDescription: 'Vazamento oportuno! O jogador com o menor saldo na Bounty Track resgata 1 carta de vulnerabilidade da pilha de descarte para a mão.',
    ptDescription: 'Vazamento oportuno! O jogador com o menor saldo na Bounty Track resgata 1 carta de vulnerabilidade da pilha de descarte para a mão.',
    effectType: 'meta'
  },
  {
    id: 'evt-08',
    number: '08',
    name: 'Scope Expansion!',
    technicalReference: 'Corporate Scope Window Expansion',
    icon: '🌐',
    targetText: 'Tu (Autor do Report)',
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
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Vazamento público! Todos os jogadores descartam suas vulnerabilidades expostas na mesa, mas recebem $1.000 de compensação imediata.',
    ptDescription: 'Vazamento público! Todos os jogadores descartam tuas vulnerabilidades expostas na mesa, mas recebem $1.000 de compensação imediata.',
    effectType: 'bounty'
  },
  {
    id: 'evt-10',
    number: '10',
    name: 'Bounty Increase!',
    technicalReference: 'Double Bounty Multiplier',
    icon: '💰',
    targetText: 'Tu (Autor do Report)',
    simpleDescription: 'Verba de emergência liberada! O seu próximo Report aprovado terá um bônus financeiro adicional de +50%.',
    ptDescription: 'Verba de emergência liberada! O teu próximo Report aprovado terá um bónus financeiro adicional de +50%.',
    effectType: 'bounty'
  },
  {
    id: 'evt-11',
    number: '11',
    name: 'WAF Deployed!',
    technicalReference: 'Web Application Firewall Block',
    icon: '🛡️',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
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
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Sequestro de tráfego! Escolha 1 oponente: o programa ativo dele é descartado e substituído por uma carta do topo do mercado.',
    ptDescription: 'Sequestro de tráfego! Escolha 1 oponente: o programa ativo dele é descartado e substituído por uma carta do topo do mercado.',
    effectType: 'meta'
  },
  {
    id: 'evt-13',
    number: '13',
    name: 'Responsible Disclosure!',
    technicalReference: 'Instant Free Submission Window',
    icon: '📄',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report gratuito fora de turno (respeitando a ordem da mesa).',
    ptDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report gratuito fora de turno (respeitando a ordem da mesa).',
    effectType: 'bounty'
  },
  {
    id: 'evt-14',
    number: '14',
    name: 'Honeypot Triggered!',
    technicalReference: 'Decoy Server Trap',
    icon: '🍯',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão.',
    ptDescription: 'Armadilha de servidor honeypot! Escolha 1 oponente: ele é forçado a descartar 2 cartas aleatórias da própria mão.',
    effectType: 'delay'
  },
  {
    id: 'evt-15',
    number: '15',
    name: 'CVE Assignment Delayed!',
    technicalReference: 'Defuse Blockade Window',
    icon: '⏳',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Burocracia na atribuição de CVE! Cartas de Defesa (Bypass) ficam bloqueadas por 1 rodada completa (efeito imediato, vale contra patches do mesmo turno).',
    ptDescription: 'Burocracia na atribuição de CVE! Cartas de Defesa (Bypass) ficam bloqueadas por 1 ronda completa (efeito imediato, vale contra patches do mesmo turno).',
    effectType: 'delay'
  },
  {
    id: 'evt-16',
    number: '16',
    name: 'Bug Collision!',
    technicalReference: 'Lowest CVSS Discard Event',
    icon: '💥',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
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
    simpleDescription: 'Reconhecimento na comunidade! O jogador em último lugar na Bounty Track compra 2 Tool Cards do Main Deck.',
    ptDescription: 'Reconhecimento na comunidade! O jogador em último lugar na Bounty Track compra 2 Tool Cards do Main Deck.',
    effectType: 'meta'
  },
  {
    id: 'evt-18',
    number: '18',
    name: 'Patch Tuesday!',
    technicalReference: 'Global Security Patch Cycle',
    icon: '📅',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em seus Racks.',
    ptDescription: 'Dia mundial de correções corporativas! Todos os jogadores removem 1 carga de todas as Tools instaladas em teus Racks.',
    effectType: 'patch'
  },
  {
    id: 'evt-19',
    number: '19',
    name: '2FA Enforced!',
    technicalReference: 'Auth Class Lockdown',
    icon: '🔐',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
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
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Confraternização da comunidade! Todos os jogadores compram 2 cartas do Main Deck imediatamente.',
    ptDescription: 'Confraternização da comunidade! Todos os jogadores compram 2 cartas do Main Deck imediatamente.',
    effectType: 'meta'
  },
  {
    id: 'evt-21',
    number: '21',
    name: 'Data Breach!',
    technicalReference: 'Hand Inspection & Discard',
    icon: '🔓',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Auditoria de dados! Todos revelam a mão. Quem tiver mais vulnerabilidades de severidade Critical descarta metade delas.',
    ptDescription: 'Auditoria de dados! Todos revelam a mão. Quem tiver mais vulnerabilidades de severidade Critical descarta metade delas.',
    effectType: 'duplicate'
  },
  {
    id: 'evt-22',
    number: '22',
    name: 'Security Audit!',
    technicalReference: 'Compliance Audit Cycle',
    icon: '📅',
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
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
    targetText: 'Todos os Jogadores (Imune ao Social Engineer)',
    simpleDescription: 'Brindes e mimos do patrocinador! Cada jogador compra 1 carta de ferramenta (Tool Card) do Main Deck.',
    ptDescription: 'Brindes e mimos do patrocinador! Cada jogador compra 1 carta de ferramenta (Tool Card) do Main Deck.',
    effectType: 'meta'
  },
  {
    id: 'evt-24',
    number: '24',
    name: 'Disclosure Responsável',
    enName: 'Responsible Disclosure',
    technicalReference: 'Coordinated Vulnerability Disclosure',
    icon: '🛡️',
    targetText: 'Todos os Pesquisadores',
    simpleDescription: 'Cada pesquisador que reportou vulnerabilidades dentro do escopo autorizado nesta ronda recebe +$2k de bónus de credibilidade ética. (A ética compensa. A tua reputação é a tua ferramenta mais valiosa.)',
    ptDescription: 'Cada pesquisador que reportou vulnerabilidades dentro do escopo autorizado nesta ronda recebe +$2k de bónus de credibilidade ética. (A ética compensa. A tua reputação é a tua ferramenta mais valiosa.)',
    effectType: 'bounty'
  }
];
