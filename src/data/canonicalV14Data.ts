/**
 * CANONICAL V1.4 DATASET FOR PWNED! BUG BOUNTY CHAOS
 * Automatically extracted from authoritative Screentop spreadsheets:
 * - 01_vulnerabilidades_80.xlsx (80 cards)
 * - 02_ferramentas_48.xlsx (48 cards)
 * - 03_programas_36.xlsx (36 cards)
 * - 04_eventos_24.xlsx (24 cards)
 * - 05_safeguards_10.xlsx (12 cards: 8 Bypass + 4 CVE Protection)
 * - 07_arquetipos_6.xlsx (6 cards)
 */

export interface CanonicalVulnCard {
  id: string;
  name: string;
  technicalReference: string;
  vulnClass: string;
  rarity: string;
  bounty: string;
  bountyValue: number;
  cvss: string;
  isNoisy: boolean;
  description: string;
  shortDesc: string;
  category: 'VULNERABILITY';
}

export interface CanonicalToolCard {
  id: string;
  name: string;
  technicalReference: string;
  toolType: string;
  moment: string;
  description: string;
  shortDesc: string;
  category: 'TOOL';
}

export interface CanonicalProgramCard {
  id: string;
  name: string;
  companyType: string;
  allowedClasses: string[];
  patchSpeed: 'Lenta' | 'Moderada' | 'Rápida' | 'Extrema';
  patchThreshold: number; // 10, 9, 8, 7
  patchSpeedRaw: string;
  bonusBounty: string;
  bonusBountyValue: number;
  description: string;
  category: 'PROGRAM';
}

export interface CanonicalEventCard {
  id: string;
  title: string;
  subtitle: string;
  moment: string;
  type: string;
  description: string;
  category: 'EVENT';
}

export interface CanonicalSafeguardCard {
  id: string;
  name: string;
  technicalReference: string;
  safeguardType: string;
  description: string;
  category: 'SAFEGUARD';
}

export interface CanonicalArchetypeCard {
  id: string;
  name: string;
  title: string;
  abilityName: string;
  description: string;
  category: 'ARCHETYPE';
}

export const V14_VULNERABILITIES: CanonicalVulnCard[] = [
  {
    "id": "AUTH-2",
    "name": "Cookie Unsigned",
    "technicalReference": "Cookie Tampering",
    "vulnClass": "AUTH",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.9",
    "isNoisy": false,
    "description": "Modifica o valor admin=false para admin=true no cookie do navegador sem assinatura.",
    "shortDesc": "Cookie sem assinatura: admin=false vira true",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-3",
    "name": "Notebook Pass",
    "technicalReference": "Weak Reset Token",
    "vulnClass": "AUTH",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.0",
    "isNoisy": false,
    "description": "O token de redefinição de senha usa a hora exata em segundos e é facilmente adivinhado.",
    "shortDesc": "Reset token previsível baseado na hora exata",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-4",
    "name": "Lazy Doorman",
    "technicalReference": "Persistent Session Leak",
    "vulnClass": "AUTH",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.1",
    "isNoisy": false,
    "description": "O token de \"Lembrar de Mim\" nunca expira e permite reuso infinito de sessão.",
    "shortDesc": "Sessão perpétua: lembrar de mim nunca expira",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-1",
    "name": "Open Door",
    "technicalReference": "Insecure Direct Object Reference (IDOR)",
    "vulnClass": "BAC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.8",
    "isNoisy": false,
    "description": "Você muda o número no final do endereço do site (de /usuario/10 para /usuario/1) e entra na conta do diretor.",
    "shortDesc": "IDOR: troque o número na URL e entre na conta alheia",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-2",
    "name": "Peasant King",
    "technicalReference": "Privilege Escalation (PrivEsc)",
    "vulnClass": "BAC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.9",
    "isNoisy": false,
    "description": "Estagiário altera parâmetro de perfil no request e vira administrador do sistema.",
    "shortDesc": "Escalada de privilégio via parâmetro de perfil",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-3",
    "name": "Secret Hall",
    "technicalReference": "Directory Traversal",
    "vulnClass": "BAC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.0",
    "isNoisy": false,
    "description": "Usa ../../../etc/passwd no parâmetro de imagem para baixar arquivos do servidor.",
    "shortDesc": "Directory traversal com ../../../ até o etc/passwd",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-4",
    "name": "Open Border",
    "technicalReference": "Cross-Origin Resource Sharing",
    "vulnClass": "BAC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.1",
    "isNoisy": false,
    "description": "Configuração Access-Control-Allow- Origin: * vazando dados privados de usuários.",
    "shortDesc": "CORS aberto com Access-Control-Allow-Origin: *",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-5",
    "name": "Broken Knob",
    "technicalReference": "Direct Resource Leak",
    "vulnClass": "BAC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.2",
    "isNoisy": false,
    "description": "URLs de download de faturas em PDF expostas publicamente sem chave de checagem.",
    "shortDesc": "URLs de faturas em PDF expostas sem checagem",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-1",
    "name": "Broken Clock",
    "technicalReference": "Business Logic Error",
    "vulnClass": "LOGIC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.0",
    "isNoisy": false,
    "description": "Você descobre que se clicar no botão de confirmação exatamente na virada do minuto, o sistema não cobra o valor.",
    "shortDesc": "Race na virada do minuto que pula a cobrança",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-2",
    "name": "Endless Cash",
    "technicalReference": "Negative Amount Logic Flaw",
    "vulnClass": "LOGIC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.1",
    "isNoisy": false,
    "description": "Adiciona quantidade -5 de um produto no carrinho de compras e faz a loja pagar você.",
    "shortDesc": "Quantidade negativa no carrinho: a loja paga você",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-3",
    "name": "Coupon Stack",
    "technicalReference": "Coupon Reuse Logic",
    "vulnClass": "LOGIC",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.2",
    "isNoisy": false,
    "description": "Aplica o cupom de 10% de desconto 10 vezes seguidas até o produto sair de graça.",
    "shortDesc": "Cupom aplicado 10 vezes até o grátis total",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-1",
    "name": "Paper Lock",
    "technicalReference": "Weak Cryptography (MD5 / Single Hash)",
    "vulnClass": "CRYPTO",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.7",
    "isNoisy": false,
    "description": "A empresa trancou os segredos com uma senha boba tipo \"123456\" que você descobre em 2 segundos.",
    "shortDesc": "Criptografia fraca com senha tipo 123456",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-2",
    "name": "Plastic Safe",
    "technicalReference": "Weak Hash / No Salt",
    "vulnClass": "CRYPTO",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.8",
    "isNoisy": false,
    "description": "Senhas salvas em tabela MD5 sem salt que são encontradas instantaneamente na internet.",
    "shortDesc": "MD5 sem salt rachado em segundos",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-1",
    "name": "Rumor Inject",
    "technicalReference": "SQL Injection (SQLi)",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.5",
    "isNoisy": false,
    "description": "Você cochicha um boato falso no campo de texto e o banco de dados acredita, entregando a lista de senhas.",
    "shortDesc": "SQLi clássica em campos de texto sem sanitização",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-16",
    "name": "Toxic Graft",
    "technicalReference": "DLL Search Order Hijacking",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.9",
    "isNoisy": false,
    "description": "Carrega bibliotecas DLL maliciosas no caminho de execução do software legado.",
    "shortDesc": "DLL hijacking no caminho de execução do legado",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-3",
    "name": "Command Soup",
    "technicalReference": "OS Command Injection",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.7",
    "isNoisy": false,
    "description": "Insere comandos de sistema operacional em campos de formulários desprotegidos.",
    "shortDesc": "Execução de comandos do sistema via formulários",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-4",
    "name": "Ghost Entity",
    "technicalReference": "XXE Injection",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.8",
    "isNoisy": false,
    "description": "O parser XML lê arquivos do servidor local ao processar notas fiscais digitais.",
    "shortDesc": "XXE: parser XML lê arquivos locais do servidor",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-5",
    "name": "Broken Mold",
    "technicalReference": "Server-Side Template Injection",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 5.9",
    "isNoisy": false,
    "description": "Comandos executados através de variáveis no motor de templates de e- mail.",
    "shortDesc": "SSTI: comandos injetados no motor de templates",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-6",
    "name": "Fake Header",
    "technicalReference": "HTTP Header Injection",
    "vulnClass": "INJ",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.0",
    "isNoisy": false,
    "description": "Manipula cabeçalhos HTTP para injetar respostas falsas no navegador do usuário.",
    "shortDesc": "Injeção via cabeçalhos HTTP manipulados",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-1",
    "name": "Inside Spy",
    "technicalReference": "Server-Side Request Forgery (SSRF)",
    "vulnClass": "SSRF",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.0",
    "isNoisy": false,
    "description": "Você convence o servidor da recepção a dar uma voltinha no porão secreto da empresa e trazer fotos dos arquivos.",
    "shortDesc": "SSRF: o servidor visita o porão interno por você",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-2",
    "name": "Forged Mail",
    "technicalReference": "SSRF via URL Parser Confusion",
    "vulnClass": "SSRF",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.1",
    "isNoisy": false,
    "description": "Você forja uma URL com dois endereços: o filtro lê o site externo, o servidor lê o endereço interno. A carta chega no porão.",
    "shortDesc": "SSRF com URL forjada: o parser lê o host que o filtro não viu",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-3",
    "name": "Under Radar",
    "technicalReference": "Network Scanning via SSRF",
    "vulnClass": "SSRF",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.2",
    "isNoisy": false,
    "description": "Usa o campo de upload de avatar para mapear portas abertas na rede interna da empresa.",
    "shortDesc": "Mapeamento de portas internas via upload de avatar",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-1",
    "name": "Fake Mirror",
    "technicalReference": "Cross-Site Scripting (Reflected XSS)",
    "vulnClass": "XSS",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.4",
    "isNoisy": false,
    "description": "Você coloca um espelho na tela do usuário. Quando ele clica, está na verdade enviando o código para você.",
    "shortDesc": "Reflected XSS refletido sem sanitização no clique",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-2",
    "name": "Mirror Maze",
    "technicalReference": "DOM-based XSS",
    "vulnClass": "XSS",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.5",
    "isNoisy": false,
    "description": "DOM-based XSS encadeado em rotas dinâmicas do Single Page App.",
    "shortDesc": "DOM-based XSS em rotas dinâmicas do SPA",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-3",
    "name": "Deadly Echo",
    "technicalReference": "Reflected XSS",
    "vulnClass": "XSS",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.6",
    "isNoisy": false,
    "description": "Injeta script malicioso no campo de busca que é refletido sem sanitização na página.",
    "shortDesc": "Script injetado no campo de busca refletido na página",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-4",
    "name": "False Shadow",
    "technicalReference": "DOM Manipulation XSS",
    "vulnClass": "XSS",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.7",
    "isNoisy": false,
    "description": "Manipula window.location.hash para executar código JavaScript na leitura do elemento.",
    "shortDesc": "Manipulação do window.location.hash",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-5",
    "name": "Eye Trick",
    "technicalReference": "HTML Injection",
    "vulnClass": "XSS",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.8",
    "isNoisy": false,
    "description": "Injeta tags <h1> e <iframe> falsas na tela de login de usuários leigos.",
    "shortDesc": "HTML injection com tags falsas na tela de login",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-1",
    "name": "Master Key",
    "technicalReference": "Authentication Bypass",
    "vulnClass": "AUTH",
    "rarity": "COMMON",
    "bounty": "$1.5k",
    "bountyValue": 1500,
    "cvss": "CVSS 4.8",
    "isNoisy": false,
    "description": "Você descobre uma brecha na catraca e entra direto sem precisar digitar senha ou mostrar documento.",
    "shortDesc": "Bypass de autenticação direto na catraca",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-3",
    "name": "Spring Doom",
    "technicalReference": "Framework RCE",
    "vulnClass": "APT",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.4",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, ANTES de repor o seu programa ativo, descarte até 3 programas do mercado e revele o mesmo número de novos.",
    "shortDesc": "RCE remoto no framework corporativo",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-10",
    "name": "VIP Double",
    "technicalReference": "SAML Response Tampering",
    "vulnClass": "AUTH",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.8",
    "isNoisy": true,
    "description": "Ao reportar com sucesso e ANTES do payout, transfira $1.000 do jogador com o maior saldo para a sua Bounty Track.",
    "shortDesc": "Tampering da resposta SAML do login corporativo",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-13",
    "name": "Free Gate",
    "technicalReference": "Global Authorization Bypass",
    "vulnClass": "BAC",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.9",
    "isNoisy": true,
    "description": "Ao descer na mesa, descarte 1 programa do mercado e revele 1 novo.",
    "shortDesc": "Bypass global de autorização em nível de sistema",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-8",
    "name": "Double Bill",
    "technicalReference": "State Machine Duplication",
    "vulnClass": "LOGIC",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.3",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, receba $1.000 adicionais no payout deste Report.",
    "shortDesc": "Duplicação de estado na máquina de transações",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-6",
    "name": "Echo Pattern",
    "technicalReference": "AES ECB Pattern Leak",
    "vulnClass": "CRYPTO",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.6",
    "isNoisy": true,
    "description": "Ao descer na mesa, descarte 1 programa do mercado e revele 1 novo.",
    "shortDesc": "AES ECB vazando padrões nos blocos repetidos",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-13",
    "name": "Broken Belt",
    "technicalReference": "Automated Injection",
    "vulnClass": "INJ",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.3",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, receba $1.000 adicionais no payout deste Report.",
    "shortDesc": "Automação de injeção em escala industrial",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-14",
    "name": "Zombie Worker",
    "technicalReference": "Async Worker RCE",
    "vulnClass": "INJ",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.3",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, compre 2 cartas do Main Deck.",
    "shortDesc": "RCE assíncrono no processador de documentos corporativo",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-8",
    "name": "Blind Envoy",
    "technicalReference": "Gopher SSRF to Cache RCE",
    "vulnClass": "SSRF",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.3",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, resgate 1 Tool Card da pilha de descarte diretamente para a sua mão.",
    "shortDesc": "Gopher SSRF até RCE no cache interno",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-12",
    "name": "Clear Wire",
    "technicalReference": "WebSocket XSS Hijack",
    "vulnClass": "XSS",
    "rarity": "EPIC",
    "bounty": "$5.0k",
    "bountyValue": 5000,
    "cvss": "CVSS 8.7",
    "isNoisy": true,
    "description": "Transfira 1 Token de Alerta seu para o jogador à sua direita (se você não tiver, ele recebe 1).",
    "shortDesc": "Hijack de tokens de sessão via WebSocket aberto",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-4",
    "name": "Puppet Master",
    "technicalReference": "Supply Chain Compromise",
    "vulnClass": "APT",
    "rarity": "LEGENDARY",
    "bounty": "$6.0k",
    "bountyValue": 6000,
    "cvss": "CVSS 9.5",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, roube 1 Tool Card instalada de 1 oponente à sua escolha e instale-a na sua bancada (se não houver slot livre, descarte-a).",
    "shortDesc": "Veneno na cadeia de suprimentos de software",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-5",
    "name": "Marionette",
    "technicalReference": "Cyberwarfare Rootkit (SCADA)",
    "vulnClass": "APT",
    "rarity": "LEGENDARY",
    "bounty": "$6.0k",
    "bountyValue": 6000,
    "cvss": "CVSS 9.5",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, force 1 oponente a descartar 1 Tool ativa à sua escolha. Se ele não tiver Tools ativas, descarte 1 carta aleatória da mão dele.",
    "shortDesc": "Rootkit SCADA em infraestrutura crítica",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-6",
    "name": "Pandora Box",
    "technicalReference": "Log Library Deserialization",
    "vulnClass": "APT",
    "rarity": "LEGENDARY",
    "bounty": "$6.0k",
    "bountyValue": 6000,
    "cvss": "CVSS 9.6",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, ignore o Custo do Sucesso: não saque nenhum Event Card.",
    "shortDesc": "Deserialização de biblioteca de log em escala global",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-14",
    "name": "Throne Room",
    "technicalReference": "Root Organization Takeover",
    "vulnClass": "BAC",
    "rarity": "LEGENDARY",
    "bounty": "$6.0k",
    "bountyValue": 6000,
    "cvss": "CVSS 9.5",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, olhe as 3 primeiras cartas do Event Deck, descarte até 1 e organize as restantes no topo na ordem que preferir.",
    "shortDesc": "Takeover do painel admin da matriz global",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-15",
    "name": "Burst Pipe",
    "technicalReference": "Critical Database Takeover",
    "vulnClass": "INJ",
    "rarity": "LEGENDARY",
    "bounty": "$6.0k",
    "bountyValue": 6000,
    "cvss": "CVSS 9.4",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, compre 1 carta do Main Deck e escolha 1 oponente para descartar 1 carta da mão.",
    "shortDesc": "Takeover root do banco de dados mestre",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-2",
    "name": "Perfect Storm",
    "technicalReference": "SSRF to Internal Admin Chain",
    "vulnClass": "APT",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.3",
    "isNoisy": false,
    "description": "Encadeia um SSRF local para acessar o console interno de gerenciamento de contêineres.",
    "shortDesc": "SSRF local até o console interno de contêineres",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-8",
    "name": "Slack Guard",
    "technicalReference": "Multi-Factor Auth Bypass",
    "vulnClass": "AUTH",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.7",
    "isNoisy": false,
    "description": "Bypassa a verificação de código SMS de 2 fatores enviando requisições em paralelo.",
    "shortDesc": "MFA bypass com requisições em paralelo",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-9",
    "name": "Broken Seal",
    "technicalReference": "Alg None JWT Attack",
    "vulnClass": "AUTH",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.8",
    "isNoisy": true,
    "description": "Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).",
    "shortDesc": "JWT assinado com algoritmo none, com prova OOB",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-10",
    "name": "Hidden Step",
    "technicalReference": "JWT Role Manipulation",
    "vulnClass": "BAC",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.8",
    "isNoisy": false,
    "description": "Altera o campo \"role\": \"user\" para \"role\": \"superadmin\" no token assinado fracamente.",
    "shortDesc": "Manipulação de role no JWT mal assinado",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-11",
    "name": "Keychain",
    "technicalReference": "Mass Assignment / Auto-Binding",
    "vulnClass": "BAC",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.8",
    "isNoisy": true,
    "description": "Esta vulnerabilidade conta como dentro do escopo do seu programa ativo, mesmo que ele não permita a sua classe.",
    "shortDesc": "Mass assignment: a API aceita campos que não devia",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-12",
    "name": "Unlocked File",
    "technicalReference": "Bulk Export IDOR",
    "vulnClass": "BAC",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.9",
    "isNoisy": false,
    "description": "Baixa a lista de exportação completa de relatórios financeiros de todas as empresas.",
    "shortDesc": "Bulk export IDOR: exportação completa exposta",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-6",
    "name": "Endless Trial",
    "technicalReference": "Subscription Logic Bypass",
    "vulnClass": "LOGIC",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.2",
    "isNoisy": false,
    "description": "Ao reportar com sucesso, resgate 1 Tool Card da pilha de descarte diretamente para a sua mão.",
    "shortDesc": "Trial reativado no último segundo, pra sempre",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-7",
    "name": "Endless Cart",
    "technicalReference": "Integer Overflow in Cart",
    "vulnClass": "LOGIC",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.3",
    "isNoisy": false,
    "description": "Estoura o número inteiro de itens no carrinho fazendo o valor total virar negativo.",
    "shortDesc": "Integer overflow virando o total negativo",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-5",
    "name": "Gossip Oracle",
    "technicalReference": "CBC Padding Oracle",
    "vulnClass": "CRYPTO",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.5",
    "isNoisy": false,
    "description": "Decodifica mensagens cifradas analisando as respostas de erro de padding do servidor.",
    "shortDesc": "Padding oracle decifrando mensagens por erro",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-11",
    "name": "Time Bomb",
    "technicalReference": "Time-Based Blind SQLi",
    "vulnClass": "INJ",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.2",
    "isNoisy": false,
    "description": "Força o banco a pausar por 10 segundos para extrair caracteres de senhas hash.",
    "shortDesc": "Blind SQLi time-based: extrai dados por atraso",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-12",
    "name": "Slow Poison",
    "technicalReference": "Second-Order SQLi",
    "vulnClass": "INJ",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.2",
    "isNoisy": true,
    "description": "Esta vulnerabilidade conta como dentro do escopo do seu programa ativo, mesmo que ele não permita a sua classe.",
    "shortDesc": "Second-order SQLi: o payload dorme e detona depois",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-2",
    "name": "Granny Inject",
    "technicalReference": "SQL Injection (SQLi)",
    "vulnClass": "INJ",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.8",
    "isNoisy": true,
    "description": "Ao reportar com sucesso, compre 2 cartas do Main Deck.",
    "shortDesc": "OR 1=1: o bypass SQLi mais clássico da história",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-6",
    "name": "Tricky Host",
    "technicalReference": "DNS Rebinding Bypass",
    "vulnClass": "SSRF",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.2",
    "isNoisy": false,
    "description": "Altera o IP de resposta do servidor DNS para bypassar a lista negra de IPs locais.",
    "shortDesc": "DNS rebinding burlando a lista negra de IPs",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-7",
    "name": "Pigeon Post",
    "technicalReference": "OOB Interaction SSRF",
    "vulnClass": "SSRF",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.3",
    "isNoisy": true,
    "description": "Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).",
    "shortDesc": "SSRF OOB com interação fora de banda",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-10",
    "name": "Vain Mirror",
    "technicalReference": "Reflected XSS Advanced",
    "vulnClass": "XSS",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.6",
    "isNoisy": false,
    "description": "Enquanto esta vulnerabilidade estiver na sua Zona de Exploits e você tiver a ferramenta Browser DevTools instalada, sua ação de Recon compra 1 carta adicional.",
    "shortDesc": "Reflected XSS avançado encadeado com DevTools",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-11",
    "name": "Blind Mirror",
    "technicalReference": "Blind Stored XSS",
    "vulnClass": "XSS",
    "rarity": "RARE",
    "bounty": "$4.0k",
    "bountyValue": 4000,
    "cvss": "CVSS 7.6",
    "isNoisy": true,
    "description": "Esta vulnerabilidade é imune a Event Cards (não pode ser descartada por Eventos enquanto estiver na Zona de Exploits).",
    "shortDesc": "Blind stored XSS no painel interno de admins",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-5",
    "name": "Fake Badge",
    "technicalReference": "Authentication Bypass (JWT None)",
    "vulnClass": "AUTH",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.6",
    "isNoisy": false,
    "description": "Altera o algoritmo do cabeçalho JWT para \"none\" e entra sem digitar senha.",
    "shortDesc": "JWT alg none: entrada sem senha nenhuma",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-6",
    "name": "ID Clone",
    "technicalReference": "Automated Account Takeover",
    "vulnClass": "AUTH",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.6",
    "isNoisy": false,
    "description": "Testa vazamentos de senhas conhecidas em massa contra a tela de login.",
    "shortDesc": "Credential stuffing em massa na tela de login",
    "category": "VULNERABILITY"
  },
  {
    "id": "AUTH-7",
    "name": "Evil Twin",
    "technicalReference": "OAuth CSRF / State Fixation",
    "vulnClass": "AUTH",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.7",
    "isNoisy": false,
    "description": "Omite o parâmetro state no login via redes sociais para vincular a conta da vítima.",
    "shortDesc": "OAuth sem state: vinculação de conta à força",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-6",
    "name": "Next Door",
    "technicalReference": "Broken Object Level Auth (BOLA)",
    "vulnClass": "BAC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.6",
    "isNoisy": false,
    "description": "Troca o ID do objeto na chamada REST da API mobile para consultar dados de terceiros.",
    "shortDesc": "BOLA: troca o ID do objeto na API REST",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-7",
    "name": "Service Lift",
    "technicalReference": "Broken Function Level Auth",
    "vulnClass": "BAC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.7",
    "isNoisy": false,
    "description": "Acessa o botão /admin/delete_all_users que esqueceu de verificar o token de sessão.",
    "shortDesc": "Rota admin sem verificar o token de sessão",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-8",
    "name": "Paper Wall",
    "technicalReference": "Multi-Tenant Isolation Bypass",
    "vulnClass": "BAC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.7",
    "isNoisy": false,
    "description": "Bypassa isolamento de empresas na nuvem acessando dados de organizações vizinhas.",
    "shortDesc": "Bypass de isolamento multi-tenant na nuvem",
    "category": "VULNERABILITY"
  },
  {
    "id": "BAC-9",
    "name": "Secret Path",
    "technicalReference": "Unprotected Admin Route",
    "vulnClass": "BAC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.8",
    "isNoisy": false,
    "description": "Rota oculta /management/dashboard disponível sem exigência de login.",
    "shortDesc": "Rota de admin oculta sem exigência de login",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-4",
    "name": "Ghost Drop",
    "technicalReference": "Race Condition",
    "vulnClass": "LOGIC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.1",
    "isNoisy": false,
    "description": "Você clica no botão de saque 50 vezes no mesmo segundo antes do banco perceber que o saldo acabou.",
    "shortDesc": "Race condition: 50 saques no mesmo segundo",
    "category": "VULNERABILITY"
  },
  {
    "id": "BL-5",
    "name": "Gold Penny",
    "technicalReference": "Floating Point Currency Flaw",
    "vulnClass": "LOGIC",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.2",
    "isNoisy": false,
    "description": "Arredondamento de frações de centavos acumuladas em transações bancárias.",
    "shortDesc": "Frações de centavo acumuladas nas transações",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-3",
    "name": "Key Under Rug",
    "technicalReference": "Embedded Secret Key",
    "vulnClass": "CRYPTO",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.4",
    "isNoisy": false,
    "description": "A chave privada de produção estava salva dentro do código JavaScript do frontend.",
    "shortDesc": "Chave RSA de produção no JavaScript do frontend",
    "category": "VULNERABILITY"
  },
  {
    "id": "CRYPTO-4",
    "name": "Open Diary",
    "technicalReference": "Insecure Data Transmission",
    "vulnClass": "CRYPTO",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.5",
    "isNoisy": false,
    "description": "Dados de cartão de crédito trafegando sem criptografia TLS via HTTP puro.",
    "shortDesc": "Dados de cartão trafegando em HTTP puro",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-10",
    "name": "Leaky Filter",
    "technicalReference": "LDAP injection no diretório corporativo via wildcard",
    "vulnClass": "INJ",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.1",
    "isNoisy": false,
    "description": "Bypassa a autenticação do diretório corporativo via filtro wildcard.",
    "shortDesc": "LDAP injection no diretório corporativo via wildcard",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-7",
    "name": "Leaked Op",
    "technicalReference": "NoSQLi com operadores $gt e $ne",
    "vulnClass": "INJ",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.0",
    "isNoisy": false,
    "description": "Injeta operadores $gt e $ne no banco NoSQL bypassando a autenticação de usuário.",
    "shortDesc": "NoSQLi com operadores $gt e $ne",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-8",
    "name": "Inverted Map",
    "technicalReference": "ORM Injection",
    "vulnClass": "INJ",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.1",
    "isNoisy": false,
    "description": "Explora vulnerabilidades de abstração em queries ORM para vazamento de colunas privadas.",
    "shortDesc": "Injeção em queries ORM que vaza colunas privadas",
    "category": "VULNERABILITY"
  },
  {
    "id": "INJ-9",
    "name": "Blind Path",
    "technicalReference": "XPath Injection",
    "vulnClass": "INJ",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.1",
    "isNoisy": false,
    "description": "Navega pela árvore XML de dados bancários manipulando parâmetros de pesquisa.",
    "shortDesc": "XPath injection navegando a árvore XML de dados",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-4",
    "name": "Machine Ghost",
    "technicalReference": "SSRF via Webhook",
    "vulnClass": "SSRF",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.1",
    "isNoisy": false,
    "description": "O webhook de notificação enviou a chave de API interna de volta para você.",
    "shortDesc": "Webhook que devolve a chave de API interna",
    "category": "VULNERABILITY"
  },
  {
    "id": "SSRF-5",
    "name": "Server Secret",
    "technicalReference": "Cloud Metadata SSRF",
    "vulnClass": "SSRF",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.2",
    "isNoisy": false,
    "description": "Acessa http://169.254.169.254 e obtém credenciais temporárias do serviço de metadados do CloudNine.",
    "shortDesc": "Metadados de nuvem 169.254.169.254 com credenciais temporárias",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-6",
    "name": "Frozen Mirror",
    "technicalReference": "Stored XSS",
    "vulnClass": "XSS",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.4",
    "isNoisy": false,
    "description": "Salva um script no fórum de suporte que infecta qualquer pessoa que leia o post.",
    "shortDesc": "Stored XSS infectando todo leitor do post",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-7",
    "name": "Cursed Art",
    "technicalReference": "SVG File Upload XSS",
    "vulnClass": "XSS",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.5",
    "isNoisy": false,
    "description": "Sobe uma imagem de perfil em formato SVG contendo código JavaScript embutido.",
    "shortDesc": "SVG malicioso com JavaScript embutido no upload",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-8",
    "name": "Cracked Mask",
    "technicalReference": "Attribute Injection XSS",
    "vulnClass": "XSS",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.5",
    "isNoisy": false,
    "description": "Escapa da aspa do atributo input com \" onfocus=\"alert(1) e dispara a vulnerabilidade.",
    "shortDesc": "Attribute injection escapando a aspa do input",
    "category": "VULNERABILITY"
  },
  {
    "id": "XSS-9",
    "name": "Invisible Ink",
    "technicalReference": "Markdown Parser XSS",
    "vulnClass": "XSS",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.6",
    "isNoisy": false,
    "description": "Explora o interpretador de Markdown na caixa de texto do editor de chamados.",
    "shortDesc": "XSS via parser de Markdown do editor",
    "category": "VULNERABILITY"
  },
  {
    "id": "APT-1",
    "name": "Domino Effect",
    "technicalReference": "Multi-Stage Chained Exploit",
    "vulnClass": "APT",
    "rarity": "UNCOMMON",
    "bounty": "$2.5k",
    "bountyValue": 2500,
    "cvss": "CVSS 6.3",
    "isNoisy": true,
    "description": "Ao descer, você pode baixar imediatamente 1 vulnerabilidade adicional da mão na Zona de Exploits (respeitando escopo e limite de 3 cartas).",
    "shortDesc": "Exploit encadeado em múltiplos estágios",
    "category": "VULNERABILITY"
  }
];

export const V14_TOOLS: CanonicalToolCard[] = [
  {
    "id": "T-01",
    "name": "Browser DevTools",
    "technicalReference": "Browser Console & Storage",
    "toolType": "PASSIVA",
    "moment": "SEMPRE",
    "description": "Seu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.",
    "shortDesc": "Console e storage do navegador: mais espaço para carregar o que importa",
    "category": "TOOL"
  },
  {
    "id": "T-01",
    "name": "Browser DevTools",
    "technicalReference": "Browser Console & Storage",
    "toolType": "PASSIVA",
    "moment": "SEMPRE",
    "description": "Seu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.",
    "shortDesc": "Console e storage do navegador: mais espaço para carregar o que importa",
    "category": "TOOL"
  },
  {
    "id": "T-01",
    "name": "Browser DevTools",
    "technicalReference": "Browser Console & Storage",
    "toolType": "PASSIVA",
    "moment": "SEMPRE",
    "description": "Seu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.",
    "shortDesc": "Console e storage do navegador: mais espaço para carregar o que importa",
    "category": "TOOL"
  },
  {
    "id": "T-01",
    "name": "Browser DevTools",
    "technicalReference": "Browser Console & Storage",
    "toolType": "PASSIVA",
    "moment": "SEMPRE",
    "description": "Seu limite de mão aumenta em +1 carta enquanto esta Tool estiver instalada.",
    "shortDesc": "Console e storage do navegador: mais espaço para carregar o que importa",
    "category": "TOOL"
  },
  {
    "id": "T-02",
    "name": "DOM Inspector",
    "technicalReference": "Client-Side Analysis Tool",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe XSS no Report.",
    "shortDesc": "Inspeção de DOM: encontra os pontos onde o XSS gruda no cliente",
    "category": "TOOL"
  },
  {
    "id": "T-02",
    "name": "DOM Inspector",
    "technicalReference": "Client-Side Analysis Tool",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe XSS no Report.",
    "shortDesc": "Inspeção de DOM: encontra os pontos onde o XSS gruda no cliente",
    "category": "TOOL"
  },
  {
    "id": "T-02",
    "name": "DOM Inspector",
    "technicalReference": "Client-Side Analysis Tool",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe XSS no Report.",
    "shortDesc": "Inspeção de DOM: encontra os pontos onde o XSS gruda no cliente",
    "category": "TOOL"
  },
  {
    "id": "T-02",
    "name": "DOM Inspector",
    "technicalReference": "Client-Side Analysis Tool",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe XSS no Report.",
    "shortDesc": "Inspeção de DOM: encontra os pontos onde o XSS gruda no cliente",
    "category": "TOOL"
  },
  {
    "id": "T-03",
    "name": "Echo Beacon",
    "technicalReference": "Out-of-band Listener",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.",
    "shortDesc": "Listener fora de banda: captura a resposta que o servidor não devia dar",
    "category": "TOOL"
  },
  {
    "id": "T-03",
    "name": "Echo Beacon",
    "technicalReference": "Out-of-band Listener",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.",
    "shortDesc": "Listener fora de banda: captura a resposta que o servidor não devia dar",
    "category": "TOOL"
  },
  {
    "id": "T-03",
    "name": "Echo Beacon",
    "technicalReference": "Out-of-band Listener",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.",
    "shortDesc": "Listener fora de banda: captura a resposta que o servidor não devia dar",
    "category": "TOOL"
  },
  {
    "id": "T-03",
    "name": "Echo Beacon",
    "technicalReference": "Out-of-band Listener",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "Ao reportar qualquer vulnerabilidade da classe SSRF ou com a tag [NOISY], compre 1 carta do Main Deck.",
    "shortDesc": "Listener fora de banda: captura a resposta que o servidor não devia dar",
    "category": "TOOL"
  },
  {
    "id": "T-04",
    "name": "Endpoint Lab",
    "technicalReference": "API Testing Environment",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe BAC, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de API: testa o que o servidor aceita além do contrato",
    "category": "TOOL"
  },
  {
    "id": "T-04",
    "name": "Endpoint Lab",
    "technicalReference": "API Testing Environment",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe BAC, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de API: testa o que o servidor aceita além do contrato",
    "category": "TOOL"
  },
  {
    "id": "T-04",
    "name": "Endpoint Lab",
    "technicalReference": "API Testing Environment",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe BAC, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de API: testa o que o servidor aceita além do contrato",
    "category": "TOOL"
  },
  {
    "id": "T-04",
    "name": "Endpoint Lab",
    "technicalReference": "API Testing Environment",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe BAC, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de API: testa o que o servidor aceita além do contrato",
    "category": "TOOL"
  },
  {
    "id": "T-05",
    "name": "Exploit Forge",
    "technicalReference": "Exploit Automation Suite",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Renove os 3 Programas expostos. Se algum deles aceitar escopos APT ou ALL, receba +$500; caso contrário, compre 1 carta do Main Deck.",
    "shortDesc": "Automação de exploit: transforma um alvo fraco na próxima brecha do mercado",
    "category": "TOOL"
  },
  {
    "id": "T-05",
    "name": "Exploit Forge",
    "technicalReference": "Exploit Automation Suite",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Renove os 3 Programas expostos. Se algum deles aceitar escopos APT ou ALL, receba +$500; caso contrário, compre 1 carta do Main Deck.",
    "shortDesc": "Automação de exploit: transforma um alvo fraco na próxima brecha do mercado",
    "category": "TOOL"
  },
  {
    "id": "T-05",
    "name": "Exploit Forge",
    "technicalReference": "Exploit Automation Suite",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Renove os 3 Programas expostos. Se algum deles aceitar escopos APT ou ALL, receba +$500; caso contrário, compre 1 carta do Main Deck.",
    "shortDesc": "Automação de exploit: transforma um alvo fraco na próxima brecha do mercado",
    "category": "TOOL"
  },
  {
    "id": "T-05",
    "name": "Exploit Forge",
    "technicalReference": "Exploit Automation Suite",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Renove os 3 Programas expostos. Se algum deles aceitar escopos APT ou ALL, receba +$500; caso contrário, compre 1 carta do Main Deck.",
    "shortDesc": "Automação de exploit: transforma um alvo fraco na próxima brecha do mercado",
    "category": "TOOL"
  },
  {
    "id": "T-06",
    "name": "FuzzStorm",
    "technicalReference": "Web Fuzzer",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Main Deck: compre 1 para a sua mão e organize as outras 2 no topo como desejar.",
    "shortDesc": "Fuzzer de endpoints: dispara milhares de requisições até achar a quebra",
    "category": "TOOL"
  },
  {
    "id": "T-06",
    "name": "FuzzStorm",
    "technicalReference": "Web Fuzzer",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Main Deck: compre 1 para a sua mão e organize as outras 2 no topo como desejar.",
    "shortDesc": "Fuzzer de endpoints: dispara milhares de requisições até achar a quebra",
    "category": "TOOL"
  },
  {
    "id": "T-06",
    "name": "FuzzStorm",
    "technicalReference": "Web Fuzzer",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Main Deck: compre 1 para a sua mão e organize as outras 2 no topo como desejar.",
    "shortDesc": "Fuzzer de endpoints: dispara milhares de requisições até achar a quebra",
    "category": "TOOL"
  },
  {
    "id": "T-06",
    "name": "FuzzStorm",
    "technicalReference": "Web Fuzzer",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Main Deck: compre 1 para a sua mão e organize as outras 2 no topo como desejar.",
    "shortDesc": "Fuzzer de endpoints: dispara milhares de requisições até achar a quebra",
    "category": "TOOL"
  },
  {
    "id": "T-07",
    "name": "Hex Kitchen",
    "technicalReference": "Data Decoding Toolkit",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.",
    "shortDesc": "Bancada de decodificação: abre o que estava cifrado antes de chegar em você",
    "category": "TOOL"
  },
  {
    "id": "T-07",
    "name": "Hex Kitchen",
    "technicalReference": "Data Decoding Toolkit",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.",
    "shortDesc": "Bancada de decodificação: abre o que estava cifrado antes de chegar em você",
    "category": "TOOL"
  },
  {
    "id": "T-07",
    "name": "Hex Kitchen",
    "technicalReference": "Data Decoding Toolkit",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.",
    "shortDesc": "Bancada de decodificação: abre o que estava cifrado antes de chegar em você",
    "category": "TOOL"
  },
  {
    "id": "T-07",
    "name": "Hex Kitchen",
    "technicalReference": "Data Decoding Toolkit",
    "toolType": "ATIVA",
    "moment": "TURNO",
    "description": "Olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.",
    "shortDesc": "Bancada de decodificação: abre o que estava cifrado antes de chegar em você",
    "category": "TOOL"
  },
  {
    "id": "T-08",
    "name": "Injection Lab",
    "technicalReference": "Database Injection Tool",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe INJ, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de injeção: testa payloads direto contra o banco",
    "category": "TOOL"
  },
  {
    "id": "T-08",
    "name": "Injection Lab",
    "technicalReference": "Database Injection Tool",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe INJ, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de injeção: testa payloads direto contra o banco",
    "category": "TOOL"
  },
  {
    "id": "T-08",
    "name": "Injection Lab",
    "technicalReference": "Database Injection Tool",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe INJ, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de injeção: testa payloads direto contra o banco",
    "category": "TOOL"
  },
  {
    "id": "T-08",
    "name": "Injection Lab",
    "technicalReference": "Database Injection Tool",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Desça 1 vulnerabilidade da classe INJ, mesmo que o seu programa ativo não permita essa classe.",
    "shortDesc": "Bancada de injeção: testa payloads direto contra o banco",
    "category": "TOOL"
  },
  {
    "id": "T-09",
    "name": "Interceptor Pro",
    "technicalReference": "Interception Proxy",
    "toolType": "ATIVA",
    "moment": "REATIVA",
    "description": "Ao ser alvo de um Event Card negativo, anule o efeito do Evento contra você (não protege contra PATCH DEPLOYED!).",
    "shortDesc": "Proxy interceptador: lê e altera o tráfego antes de ele chegar ao servidor",
    "category": "TOOL"
  },
  {
    "id": "T-09",
    "name": "Interceptor Pro",
    "technicalReference": "Interception Proxy",
    "toolType": "ATIVA",
    "moment": "REATIVA",
    "description": "Ao ser alvo de um Event Card negativo, anule o efeito do Evento contra você (não protege contra PATCH DEPLOYED!).",
    "shortDesc": "Proxy interceptador: lê e altera o tráfego antes de ele chegar ao servidor",
    "category": "TOOL"
  },
  {
    "id": "T-09",
    "name": "Interceptor Pro",
    "technicalReference": "Interception Proxy",
    "toolType": "ATIVA",
    "moment": "REATIVA",
    "description": "Ao ser alvo de um Event Card negativo, anule o efeito do Evento contra você (não protege contra PATCH DEPLOYED!).",
    "shortDesc": "Proxy interceptador: lê e altera o tráfego antes de ele chegar ao servidor",
    "category": "TOOL"
  },
  {
    "id": "T-09",
    "name": "Interceptor Pro",
    "technicalReference": "Interception Proxy",
    "toolType": "ATIVA",
    "moment": "REATIVA",
    "description": "Ao ser alvo de um Event Card negativo, anule o efeito do Evento contra você (não protege contra PATCH DEPLOYED!).",
    "shortDesc": "Proxy interceptador: lê e altera o tráfego antes de ele chegar ao servidor",
    "category": "TOOL"
  },
  {
    "id": "T-10",
    "name": "PortSweep",
    "technicalReference": "Network Scanner",
    "toolType": "PASSIVA",
    "moment": "RECON",
    "description": "Ao realizar a ação de Recon, compre 3 cartas do Main Deck em vez de 2.",
    "shortDesc": "Scanner de portas: descobre serviços abertos antes de qualquer ataque",
    "category": "TOOL"
  },
  {
    "id": "T-10",
    "name": "PortSweep",
    "technicalReference": "Network Scanner",
    "toolType": "PASSIVA",
    "moment": "RECON",
    "description": "Ao realizar a ação de Recon, compre 3 cartas do Main Deck em vez de 2.",
    "shortDesc": "Scanner de portas: descobre serviços abertos antes de qualquer ataque",
    "category": "TOOL"
  },
  {
    "id": "T-10",
    "name": "PortSweep",
    "technicalReference": "Network Scanner",
    "toolType": "PASSIVA",
    "moment": "RECON",
    "description": "Ao realizar a ação de Recon, compre 3 cartas do Main Deck em vez de 2.",
    "shortDesc": "Scanner de portas: descobre serviços abertos antes de qualquer ataque",
    "category": "TOOL"
  },
  {
    "id": "T-10",
    "name": "PortSweep",
    "technicalReference": "Network Scanner",
    "toolType": "PASSIVA",
    "moment": "RECON",
    "description": "Ao realizar a ação de Recon, compre 3 cartas do Main Deck em vez de 2.",
    "shortDesc": "Scanner de portas: descobre serviços abertos antes de qualquer ataque",
    "category": "TOOL"
  },
  {
    "id": "T-11",
    "name": "SpiderScan",
    "technicalReference": "Automated Web Scanner",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.",
    "shortDesc": "Crawler: mapeia a aplicação inteira e entrega tudo de uma vez",
    "category": "TOOL"
  },
  {
    "id": "T-11",
    "name": "SpiderScan",
    "technicalReference": "Automated Web Scanner",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.",
    "shortDesc": "Crawler: mapeia a aplicação inteira e entrega tudo de uma vez",
    "category": "TOOL"
  },
  {
    "id": "T-11",
    "name": "SpiderScan",
    "technicalReference": "Automated Web Scanner",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.",
    "shortDesc": "Crawler: mapeia a aplicação inteira e entrega tudo de uma vez",
    "category": "TOOL"
  },
  {
    "id": "T-11",
    "name": "SpiderScan",
    "technicalReference": "Automated Web Scanner",
    "toolType": "PASSIVA",
    "moment": "EXPLOIT",
    "description": "Na sua primeira ação de Exploit do turno, desça 2 vulnerabilidades em vez de 1.",
    "shortDesc": "Crawler: mapeia a aplicação inteira e entrega tudo de uma vez",
    "category": "TOOL"
  },
  {
    "id": "T-12",
    "name": "Token Cracker",
    "technicalReference": "Token Engineering Harness",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe AUTH no Report.",
    "shortDesc": "Bancada de tokens: forja, quebra e reaproveita credenciais de sessão",
    "category": "TOOL"
  },
  {
    "id": "T-12",
    "name": "Token Cracker",
    "technicalReference": "Token Engineering Harness",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe AUTH no Report.",
    "shortDesc": "Bancada de tokens: forja, quebra e reaproveita credenciais de sessão",
    "category": "TOOL"
  },
  {
    "id": "T-12",
    "name": "Token Cracker",
    "technicalReference": "Token Engineering Harness",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe AUTH no Report.",
    "shortDesc": "Bancada de tokens: forja, quebra e reaproveita credenciais de sessão",
    "category": "TOOL"
  },
  {
    "id": "T-12",
    "name": "Token Cracker",
    "technicalReference": "Token Engineering Harness",
    "toolType": "PASSIVA",
    "moment": "REPORT",
    "description": "+$500 por carta da classe AUTH no Report.",
    "shortDesc": "Bancada de tokens: forja, quebra e reaproveita credenciais de sessão",
    "category": "TOOL"
  }
];

export const V14_PROGRAMS: CanonicalProgramCard[] = [
  {
    "id": "cloudnine-1",
    "name": "CloudNine Cloud Services",
    "companyType": "Provedor de Infraestrutura em Nuvem",
    "allowedClasses": [
      "SSRF",
      "INJ",
      "APT"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Recompensas astronômicas para RCE, SSRF e vulnerabilidades de infraestrutura. Alto risco de Patch!",
    "category": "PROGRAM"
  },
  {
    "id": "cryptox-1",
    "name": "CryptoX Exchange",
    "companyType": "Corretora de Criptomoedas",
    "allowedClasses": [
      "AUTH",
      "CRYPTO",
      "LOGIC",
      "APT"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Corretora de ativos digitais sob alto risco de ataques de autenticação e carteira.",
    "category": "PROGRAM"
  },
  {
    "id": "aicore-1",
    "name": "AI Core Systems",
    "companyType": "Infraestrutura de IA Generativa",
    "allowedClasses": [
      "INJ",
      "SSRF",
      "APT"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Clusters de treinamento de modelos de linguagem vulneráveis a Prompt Injection e RCE.",
    "category": "PROGRAM"
  },
  {
    "id": "veloce-1",
    "name": "Veloce AutoTech",
    "companyType": "Firmware Automotivo & IoT",
    "allowedClasses": [
      "INJ",
      "LOGIC",
      "AUTH"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.",
    "category": "PROGRAM"
  },
  {
    "id": "veloce-2",
    "name": "Veloce AutoTech",
    "companyType": "Firmware Automotivo & IoT",
    "allowedClasses": [
      "INJ",
      "LOGIC",
      "AUTH"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Telemetria veicular e chaves digitais. Alto risco operacional com remuneração de elite.",
    "category": "PROGRAM"
  },
  {
    "id": "aeroorbit-1",
    "name": "AeroOrbit Avionics",
    "companyType": "Tecnologia Aeroespacial & Satélites",
    "allowedClasses": [
      "SSRF",
      "AUTH",
      "CRYPTO"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.",
    "category": "PROGRAM"
  },
  {
    "id": "aeroorbit-2",
    "name": "AeroOrbit Avionics",
    "companyType": "Tecnologia Aeroespacial & Satélites",
    "allowedClasses": [
      "SSRF",
      "AUTH",
      "CRYPTO"
    ],
    "patchSpeed": "Extrema",
    "patchThreshold": 7,
    "patchSpeedRaw": "Extrema (7-12)",
    "bonusBounty": "$4.000",
    "bonusBountyValue": 4000,
    "description": "Uplink de satélites e telemetria de solo. Segurança de missão crítica e recompensas máximas.",
    "category": "PROGRAM"
  },
  {
    "id": "govportal-1",
    "name": "GovPortal Legacy",
    "companyType": "Sistema Governamental Legado",
    "allowedClasses": [
      "BAC"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$1.500",
    "bonusBountyValue": 1500,
    "description": "Especialista em controle de acesso legado (BAC). Patch lento e bônus de +$1.500 no Report!",
    "category": "PROGRAM"
  },
  {
    "id": "govportal-2",
    "name": "GovPortal Legacy",
    "companyType": "Sistema Governamental Legado",
    "allowedClasses": [
      "BAC"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$1.500",
    "bonusBountyValue": 1500,
    "description": "Sistema legado em servidores antigos com escopo exclusivo BAC, ritmo lento e +$1.500 de bônus.",
    "category": "PROGRAM"
  },
  {
    "id": "educonnect-1",
    "name": "EduConnect LMS",
    "companyType": "Plataforma Educacional",
    "allowedClasses": [
      "TODAS AS CLASSES (ALL)"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$0",
    "bonusBountyValue": 0,
    "description": "Ambiente seguro para iniciantes praticarem. Quase sem risco de Patch instantâneo.",
    "category": "PROGRAM"
  },
  {
    "id": "educonnect-2",
    "name": "EduConnect LMS",
    "companyType": "Plataforma Educacional",
    "allowedClasses": [
      "TODAS AS CLASSES (ALL)"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$0",
    "bonusBountyValue": 0,
    "description": "Sistema acadêmico comunitário com tolerância prolongada de patches.",
    "category": "PROGRAM"
  },
  {
    "id": "voltz-1",
    "name": "Voltz PowerGrid",
    "companyType": "Infraestrutura Crítica & SCADA",
    "allowedClasses": [
      "INJ",
      "BAC"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$0",
    "bonusBountyValue": 0,
    "description": "Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.",
    "category": "PROGRAM"
  },
  {
    "id": "voltz-2",
    "name": "Voltz PowerGrid",
    "companyType": "Infraestrutura Crítica & SCADA",
    "allowedClasses": [
      "INJ",
      "BAC"
    ],
    "patchSpeed": "Lenta",
    "patchThreshold": 10,
    "patchSpeedRaw": "Lenta (10-12)",
    "bonusBounty": "$0",
    "bonusBountyValue": 0,
    "description": "Rede elétrica industrial legada. Ciclo de patch ultralento, ideal para encadear combos longos.",
    "category": "PROGRAM"
  },
  {
    "id": "shopall-1",
    "name": "ShopAll Global",
    "companyType": "E-Commerce Multinacional",
    "allowedClasses": [
      "TODAS AS CLASSES (ALL)"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.",
    "category": "PROGRAM"
  },
  {
    "id": "shopall-2",
    "name": "ShopAll Global",
    "companyType": "E-Commerce Multinacional",
    "allowedClasses": [
      "TODAS AS CLASSES (ALL)"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Escopo amplo. Aceita todas as classes de vulnerabilidades com triagem padrão.",
    "category": "PROGRAM"
  },
  {
    "id": "shopall-3",
    "name": "ShopAll Global",
    "companyType": "E-Commerce Multinacional",
    "allowedClasses": [
      "TODAS AS CLASSES (ALL)"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Plataforma gigante com alta rotatividade de pesquisadores.",
    "category": "PROGRAM"
  },
  {
    "id": "socialbee-1",
    "name": "SocialHive Media",
    "companyType": "Rede Social Global",
    "allowedClasses": [
      "XSS",
      "LOGIC",
      "BAC"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Focado em vulnerabilidades de privacidade, XSS e lógica de engajamento social.",
    "category": "PROGRAM"
  },
  {
    "id": "socialbee-2",
    "name": "SocialHive Media",
    "companyType": "Rede Social Global",
    "allowedClasses": [
      "XSS",
      "LOGIC",
      "BAC"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Plataforma social de alto tráfego com foco em permissões de perfil.",
    "category": "PROGRAM"
  },
  {
    "id": "socialbee-3",
    "name": "SocialHive Media",
    "companyType": "Rede Social Global",
    "allowedClasses": [
      "XSS",
      "LOGIC",
      "BAC"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Inúmeras sub-plataformas integradas suscetíveis a roubo de cookies e manipulação.",
    "category": "PROGRAM"
  },
  {
    "id": "gameverse-1",
    "name": "GameVerse MMO",
    "companyType": "Plataforma Massiva de Jogos",
    "allowedClasses": [
      "LOGIC",
      "INJ",
      "XSS"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Injeção de itens, manipulação de saldo virtual e exploits em WebSockets.",
    "category": "PROGRAM"
  },
  {
    "id": "gameverse-2",
    "name": "GameVerse MMO",
    "companyType": "Plataforma Massiva de Jogos",
    "allowedClasses": [
      "LOGIC",
      "INJ",
      "XSS"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Servidores de jogos síncronos expostos a exploração de lógica de mercado.",
    "category": "PROGRAM"
  },
  {
    "id": "deliverydash-1",
    "name": "DeliveryDash App",
    "companyType": "Plataforma Logística e Entregas",
    "allowedClasses": [
      "LOGIC",
      "BAC",
      "SSRF"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Aplicativo de entregas urbanas com vulnerabilidades de cupom, IDOR e SSRF em webhooks.",
    "category": "PROGRAM"
  },
  {
    "id": "deliverydash-2",
    "name": "DeliveryDash App",
    "companyType": "Plataforma Logística e Entregas",
    "allowedClasses": [
      "LOGIC",
      "BAC",
      "SSRF"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Rede logística de entregas rápidas suscetível a manipulação de pedidos e SSRF interno.",
    "category": "PROGRAM"
  },
  {
    "id": "deliverydash-3",
    "name": "DeliveryDash App",
    "companyType": "Plataforma Logística e Entregas",
    "allowedClasses": [
      "LOGIC",
      "BAC",
      "SSRF"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Frequentes vulnerabilidades de lógica em promoções e requisições forjadas de rastreamento.",
    "category": "PROGRAM"
  },
  {
    "id": "pulsestream-1",
    "name": "PulseStream Media",
    "companyType": "Mídia Digital & Distribuição DRM",
    "allowedClasses": [
      "XSS",
      "LOGIC",
      "CRYPTO"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.",
    "category": "PROGRAM"
  },
  {
    "id": "pulsestream-2",
    "name": "PulseStream Media",
    "companyType": "Mídia Digital & Distribuição DRM",
    "allowedClasses": [
      "XSS",
      "LOGIC",
      "CRYPTO"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Distribuição de streaming. Foco em falhas de DRM, portal web e validação de assinaturas.",
    "category": "PROGRAM"
  },
  {
    "id": "taxcore-1",
    "name": "TaxCore Federal",
    "companyType": "Administração Tributária Pública",
    "allowedClasses": [
      "LOGIC",
      "BAC",
      "AUTH"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.",
    "category": "PROGRAM"
  },
  {
    "id": "taxcore-2",
    "name": "TaxCore Federal",
    "companyType": "Administração Tributária Pública",
    "allowedClasses": [
      "LOGIC",
      "BAC",
      "AUTH"
    ],
    "patchSpeed": "Moderada",
    "patchThreshold": 9,
    "patchSpeedRaw": "Moderada (9-12)",
    "bonusBounty": "$1000",
    "bonusBountyValue": 1000,
    "description": "Sistema fiscal e emissão de notas eletrônicas. Auditoria em regras de cálculo e autorizações.",
    "category": "PROGRAM"
  },
  {
    "id": "banksafe-1",
    "name": "BankSafe Financial",
    "companyType": "Instituição Financeira Digital",
    "allowedClasses": [
      "AUTH",
      "CRYPTO",
      "BAC",
      "INJ"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Escopo restrito a APIs, Autenticação e Criptografia. Pagamentos elevados!",
    "category": "PROGRAM"
  },
  {
    "id": "banksafe-2",
    "name": "BankSafe Financial",
    "companyType": "Instituição Financeira Digital",
    "allowedClasses": [
      "AUTH",
      "CRYPTO",
      "BAC",
      "INJ"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Escopo restrito a APIs e Autenticação bancária de alta liquidez.",
    "category": "PROGRAM"
  },
  {
    "id": "healthlock-1",
    "name": "HealthLock EHR",
    "companyType": "Prontuário Médico Digital",
    "allowedClasses": [
      "CRYPTO",
      "AUTH",
      "SSRF",
      "BAC"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Focado em sigilo de dados sensíveis e criptografia de registros hospitalares.",
    "category": "PROGRAM"
  },
  {
    "id": "healthlock-2",
    "name": "HealthLock EHR",
    "companyType": "Prontuário Médico Digital",
    "allowedClasses": [
      "CRYPTO",
      "AUTH",
      "SSRF",
      "BAC"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Sistema hospitalar privado sob constante auditoria de conformidade.",
    "category": "PROGRAM"
  },
  {
    "id": "paygateway-1",
    "name": "PayGateway Prime",
    "companyType": "Processadora de Pagamentos",
    "allowedClasses": [
      "BAC",
      "AUTH",
      "INJ"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Gateway financeiro global conectando cartões de crédito e Pix.",
    "category": "PROGRAM"
  },
  {
    "id": "paygateway-2",
    "name": "PayGateway Prime",
    "companyType": "Processadora de Pagamentos",
    "allowedClasses": [
      "BAC",
      "AUTH",
      "INJ"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Processador financeiro com rigorosos controles de auditoria de cartões.",
    "category": "PROGRAM"
  },
  {
    "id": "biogen-1",
    "name": "BioGen Genomics",
    "companyType": "Biotecnologia & Pesquisa Clínica",
    "allowedClasses": [
      "CRYPTO",
      "BAC",
      "SSRF"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.",
    "category": "PROGRAM"
  },
  {
    "id": "biogen-2",
    "name": "BioGen Genomics",
    "companyType": "Biotecnologia & Pesquisa Clínica",
    "allowedClasses": [
      "CRYPTO",
      "BAC",
      "SSRF"
    ],
    "patchSpeed": "Rápida",
    "patchThreshold": 8,
    "patchSpeedRaw": "Rápida (8-12)",
    "bonusBounty": "$2500",
    "bonusBountyValue": 2500,
    "description": "Pesquisa genômica confidencial. Foco em servidores internos de sequenciamento e controle de prontuários.",
    "category": "PROGRAM"
  }
];

export const V14_EVENTS: CanonicalEventCard[] = [
  {
    "id": "evt-04",
    "title": "Legal Threat!",
    "subtitle": "Cease & Desist",
    "moment": "ALVO",
    "type": "DELAY",
    "description": "Escolha 1 oponente: ele deve pagar $1.5k da sua Bounty Track ou fica impedido de realizar a ação Report no seu próximo turno.",
    "category": "EVENT"
  },
  {
    "id": "evt-14",
    "title": "Honeypot Triggered!",
    "subtitle": "Decoy Server Trap",
    "moment": "ALVO",
    "type": "DELAY",
    "description": "Escolha 1 oponente: ele descarta 2 cartas aleatórias da mão (em 2 jogadores, descarta apenas 1 carta).",
    "category": "EVENT"
  },
  {
    "id": "evt-02",
    "title": "Duplicate Report!",
    "subtitle": "Duplicated Vulnerability Submission",
    "moment": "ALVO",
    "type": "DUPLICATE",
    "description": "Escolha 1 oponente: ele descarta a vulnerabilidade de maior CVSS exposta na mesa (se não tiver nenhuma na mesa, descarta 1 carta aleatória da mão).",
    "category": "EVENT"
  },
  {
    "id": "evt-05",
    "title": "Triage Delay!",
    "subtitle": "Corporate Backlog Delay",
    "moment": "AUTOR",
    "type": "DELAY",
    "description": "Você fica impedido de instalar ou ativar Tools no seu próximo turno.",
    "category": "EVENT"
  },
  {
    "id": "evt-03",
    "title": "Out of Scope!",
    "subtitle": "Out of Scope Boundary Rejection",
    "moment": "AUTOR",
    "type": "SCOPE",
    "description": "Você fica impedido de realizar a ação Exploit (baixar vulnerabilidades) no seu próximo turno.",
    "category": "EVENT"
  },
  {
    "id": "evt-08",
    "title": "Scope Expansion!",
    "subtitle": "Corporate Scope Window Expansion",
    "moment": "AUTOR",
    "type": "SCOPE",
    "description": "No seu próximo turno, você pode jogar qualquer vulnerabilidade na mesa ignorando restrições de escopo.",
    "category": "EVENT"
  },
  {
    "id": "evt-10",
    "title": "Bounty Increase!",
    "subtitle": "Double Bounty Multiplier",
    "moment": "AUTOR / TODOS",
    "type": "BOUNTY",
    "description": "Ativo por 1 rodada (descarte no início do seu próximo turno). Qualquer jogador que fizer um Report bem-sucedido recebe $1.5k de bônus na Bounty Track.",
    "category": "EVENT"
  },
  {
    "id": "evt-12",
    "title": "DNS Hijack!",
    "subtitle": "Compulsory Target Switch",
    "moment": "LÍDER",
    "type": "META",
    "description": "O jogador com maior saldo na Bounty Track descarta seu programa, compra o próximo do deck e descarta vulnerabilidades da mesa fora de escopo.",
    "category": "EVENT"
  },
  {
    "id": "evt-06",
    "title": "Bug Bounty Mediation",
    "subtitle": "Consensus Bounty Settlement",
    "moment": "TODOS",
    "type": "BOUNTY",
    "description": "Todos os jogadores recebem $1.5k imediatamente na Bounty Track.",
    "category": "EVENT"
  },
  {
    "id": "evt-09",
    "title": "Public Disclosure!",
    "subtitle": "Public Zero-Day Exfiltration",
    "moment": "TODOS",
    "type": "BOUNTY",
    "description": "Todos os jogadores descartam suas vulnerabilidades na mesa e recebem indenização por raridade ($1k Comum/Incomum, $2k Rara, $2.5k Épica, $3k Lendária). Oponentes sem mesa descartam 1 carta aleatória da mão.",
    "category": "EVENT"
  },
  {
    "id": "evt-13",
    "title": "Responsible Disclosure!",
    "subtitle": "Instant Free Submission Window",
    "moment": "TODOS",
    "type": "BOUNTY",
    "description": "Jogadores com vulnerabilidades válidas na mesa podem fazer 1 Report imediato sem rolar dados (não compra Tool nem Evento), seguindo a ordem da mesa.",
    "category": "EVENT"
  },
  {
    "id": "evt-24",
    "title": "Bounty Ético",
    "subtitle": "Coordinated Vulnerability Disclosure",
    "moment": "TODOS",
    "type": "BOUNTY",
    "description": "Cada jogador com zero Tokens de Alerta na mesa recebe imediatamente $1.5k de bônus na Bounty Track.",
    "category": "EVENT"
  },
  {
    "id": "evt-15",
    "title": "CVE Assignment Delayed!",
    "subtitle": "Defuse Blockade Window",
    "moment": "TODOS",
    "type": "DELAY",
    "description": "Cartas de Defesa (Safeguard) ficam bloqueadas por 1 rodada (efeito imediato, vale contra patches do mesmo turno).",
    "category": "EVENT"
  },
  {
    "id": "evt-18",
    "title": "Rate Limited!",
    "subtitle": "Network Traffic Restriction",
    "moment": "TODOS",
    "type": "DELAY",
    "description": "Todos os jogadores ficam impedidos de realizar a ação Recon (comprar cartas) no seu próximo turno.",
    "category": "EVENT"
  },
  {
    "id": "evt-16",
    "title": "Bug Collision!",
    "subtitle": "Lowest CVSS Discard Event",
    "moment": "TODOS",
    "type": "DUPLICATE",
    "description": "Todos os jogadores descartam a vulnerabilidade de menor CVSS exposta na mesa (oponentes sem mesa descartam 1 carta aleatória da mão).",
    "category": "EVENT"
  },
  {
    "id": "evt-21",
    "title": "Acquisition!",
    "subtitle": "Corporate Acquisition & Scope Flush",
    "moment": "TODOS",
    "type": "DUPLICATE",
    "description": "Descarte e reponha os programas do mercado. Se ao menos um permitir escopo ALL, todos os jogadores avançam $500 na Bounty Track.",
    "category": "EVENT"
  },
  {
    "id": "evt-11",
    "title": "WAF Deployed!",
    "subtitle": "Web Application Firewall Block",
    "moment": "TODOS",
    "type": "META",
    "description": "Vulnerabilidades da classe INJ não podem ser baixadas na mesa por 1 rodada completa.",
    "category": "EVENT"
  },
  {
    "id": "evt-19",
    "title": "2FA Enforced!",
    "subtitle": "Auth Class Lockdown",
    "moment": "TODOS",
    "type": "META",
    "description": "Vulnerabilidades da classe Authentication não podem ser baixadas na mesa por 1 rodada.",
    "category": "EVENT"
  },
  {
    "id": "evt-20",
    "title": "Bug Bounty Conference!",
    "subtitle": "Global Networking Event",
    "moment": "TODOS",
    "type": "META",
    "description": "Todos os jogadores compram 2 cartas do Main Deck imediatamente.",
    "category": "EVENT"
  },
  {
    "id": "evt-22",
    "title": "Security Audit!",
    "subtitle": "Compliance Audit Cycle",
    "moment": "TODOS",
    "type": "META",
    "description": "Todos os jogadores revelam a mão e descartam a carta de maior CVSS.",
    "category": "EVENT"
  },
  {
    "id": "evt-23",
    "title": "Swag Drop!",
    "subtitle": "Consolation Gear Reward",
    "moment": "TODOS",
    "type": "META",
    "description": "Cada jogador compra 1 Tool Card do Tool Deck.",
    "category": "EVENT"
  },
  {
    "id": "evt-01",
    "title": "Blue Team Hunt!",
    "subtitle": "Proactive Threat Hunting",
    "moment": "TODOS",
    "type": "PATCH",
    "description": "Todos os jogadores descartam a vulnerabilidade de maior CVSS exposta na mesa (oponentes sem mesa descartam 1 carta aleatória da mão).",
    "category": "EVENT"
  },
  {
    "id": "evt-07",
    "title": "Zero Day Disclosure",
    "subtitle": "Discard Pile Rescue",
    "moment": "ÚLTIMO",
    "type": "META",
    "description": "O jogador com menor saldo na Bounty Track resgata 1 Tool Card da pilha de descarte para a mão (se houver).",
    "category": "EVENT"
  },
  {
    "id": "evt-17",
    "title": "Hall of Fame Update!",
    "subtitle": "Underdog Catch-Up Boost",
    "moment": "ÚLTIMO",
    "type": "META",
    "description": "O jogador com menor saldo na Bounty Track recebe $1.5k de bônus no seu próximo Report bem-sucedido.",
    "category": "EVENT"
  }
];

export const V14_SAFEGUARDS: CanonicalSafeguardCard[] = [
  {
    "id": "safeguard-bypass-1",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-2",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-3",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-4",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-5",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-6",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-7",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-bypass-8",
    "name": "Bypass",
    "technicalReference": "Patch Evasion",
    "safeguardType": "Immunity",
    "description": "Anula o PATCH DEPLOYED! No Report: garante o Payout sem receber Tool. Em Stealth: preserva os seus exploits. Você recebe 1 Token de Alerta e descarta esta carta. Não compra Event / Tool. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-cve-1",
    "name": "CVE Assignment Protection",
    "technicalReference": "Triage Defense",
    "safeguardType": "Countermeasure",
    "description": "Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-cve-2",
    "name": "CVE Assignment Protection",
    "technicalReference": "Triage Defense",
    "safeguardType": "Countermeasure",
    "description": "Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-cve-3",
    "name": "CVE Assignment Protection",
    "technicalReference": "Triage Defense",
    "safeguardType": "Countermeasure",
    "description": "Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Uso único.",
    "category": "SAFEGUARD"
  },
  {
    "id": "safeguard-cve-4",
    "name": "CVE Assignment Protection",
    "technicalReference": "Triage Defense",
    "safeguardType": "Countermeasure",
    "description": "Anula os Event Cards Duplicate Report!, Out of Scope! e DNS Hijack! direcionados contra você. Uso único.",
    "category": "SAFEGUARD"
  }
];

export const V14_ARCHETYPES: CanonicalArchetypeCard[] = [
  {
    "id": "noob",
    "name": "n00b",
    "title": "Green Hat Hacker",
    "abilityName": "Garimpeiro de Ferramentas",
    "description": "Posso olhar as 3 primeiras cartas do Tool Deck após cada Report bem sucedido, escolho 1 e devolvo as demais na ordem que eu quiser.",
    "category": "ARCHETYPE"
  },
  {
    "id": "the-old-guard",
    "name": "The Old Guard",
    "title": "Seasoned Veteran",
    "abilityName": "Especialista Sênior",
    "description": "Ganho +$500/cada carta Épica ou Lendária incluída no Report bem sucedido. Ah, meu limite de cartas na mão sobe para 8.",
    "category": "ARCHETYPE"
  },
  {
    "id": "bug-hunter",
    "name": "Bug Hunter",
    "title": "Bounty Chaser",
    "abilityName": "Volume Attack",
    "description": "Ganho +$500/cada carta além da 1ª ao reportar com sucesso. Só posso baixar classes Comum/Incomum. Report bem sucedido com 3 vulnerabilidades, me garante 1 Token de Reputação.",
    "category": "ARCHETYPE"
  },
  {
    "id": "social-engineer",
    "name": "Social Engineer",
    "title": "Master Manipulator",
    "abilityName": "Caos Redirecionado",
    "description": "Ao ser alvo de Event negativo, posso direcioná-lo a outro jogador (1x/rodada). Ainda posso puxar 1 carta aleatória da mão de um oponente, mas entrego 1 carta da minha mão para ele (1x/turno).",
    "category": "ARCHETYPE"
  },
  {
    "id": "red-teamer",
    "name": "Red Teamer",
    "title": "Offensive Breaker",
    "abilityName": "Sem Limites",
    "description": "Ignoro as restrições de escopo dos programas e posso explorar qualquer vulnerabilidade em qualquer alvo, mas por isso, devo subtrair $1.500 do payout total de cada Report.",
    "category": "ARCHETYPE"
  },
  {
    "id": "the-pentester",
    "name": "The Pentester",
    "title": "Methodical Auditor",
    "abilityName": "Auditor Metódico",
    "description": "Sou imune a Duplicate Report! e a Triage Delay! e ainda ganho +$500/cada carta com classe diferente no meu Report além da primeira (máximo de +$1.000).",
    "category": "ARCHETYPE"
  }
];

/**
 * Builds canonical 84-card Main Deck according to Section 02 & 04:
 * 80 Vulnerabilities + 2 Bypass Cards + 2 CVE Assignment Protection Cards = 84 cards
 */
export const buildCanonicalV14MainDeck = (): (CanonicalVulnCard | CanonicalSafeguardCard)[] => {
  const bypassInDeck = V14_SAFEGUARDS.filter(s => s.name.includes('Bypass')).slice(0, 2);
  const cveInDeck = V14_SAFEGUARDS.filter(s => s.name.includes('CVE')).slice(0, 2);
  return [...V14_VULNERABILITIES, ...bypassInDeck, ...cveInDeck];
};

/**
 * Builds canonical 48-card Tool Deck (12 types x 4 copies)
 */
export const buildCanonicalV14ToolDeck = (): CanonicalToolCard[] => {
  return [...V14_TOOLS];
};

/**
 * Builds canonical 36-card Program Deck (18 targets x 2 copies)
 */
export const buildCanonicalV14ProgramDeck = (): CanonicalProgramCard[] => {
  return [...V14_PROGRAMS];
};

/**
 * Builds canonical 24-card Event Deck
 */
export const buildCanonicalV14EventDeck = (): CanonicalEventCard[] => {
  return [...V14_EVENTS];
};
