import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'full80DeckData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const mappings: Record<string, { name: string, enName: string }> = {
  // INJ
  'inj-1': { name: 'Injeção de Boato', enName: 'Rumor Injection' },
  'inj-2': { name: 'A Injeção da Vovó', enName: "Grandma's Injection" },
  'inj-3': { name: 'Sopa de Comandos', enName: 'Command Soup' },
  'inj-4': { name: 'A Entidade Fantasma', enName: 'The Ghost Entity' },
  'inj-5': { name: 'O Molde Quebrado', enName: 'The Broken Mold' },
  'inj-6': { name: 'O Cabeçalho Falso', enName: 'The Fake Header' },
  'inj-7': { name: 'O Operador Vazado', enName: 'The Leaked Operator' },
  'inj-8': { name: 'O Mapa Invertido', enName: 'The Inverted Map' },
  'inj-9': { name: 'O Atalho Cego', enName: 'The Blind Shortcut' },
  'inj-10': { name: 'O Filtro Furado', enName: 'The Pierced Filter' },
  'inj-11': { name: 'A Bomba-Relógio', enName: 'The Time Bomb' },
  'inj-12': { name: 'O Veneno Lento', enName: 'The Slow Poison' },
  'inj-13': { name: 'A Esteira Quebrada', enName: 'The Broken Conveyor' },
  'inj-14': { name: 'O Operário Zumbi', enName: 'The Zombie Worker' },
  'inj-15': { name: 'O Tubo Estourado', enName: 'The Burst Pipe' },
  'inj-16': { name: 'O Enxerto Tóxico', enName: 'The Toxic Graft' },
  // BAC
  'bac-1': { name: 'Porta Escancarada', enName: 'Wide Open Door' },
  'bac-2': { name: 'O Plebeu Privilegiado', enName: 'The Privileged Commoner' },
  'bac-3': { name: 'O Corredor Secreto', enName: 'The Secret Corridor' },
  'bac-4': { name: 'A Fronteira Aberta', enName: 'The Open Border' },
  'bac-5': { name: 'A Maçaneta Quebrada', enName: 'The Broken Doorknob' },
  'bac-6': { name: 'O Quarto do Vizinho', enName: "The Neighbor's Room" },
  'bac-7': { name: 'O Elevador de Serviço', enName: 'The Service Elevator' },
  'bac-8': { name: 'A Parede de Papel', enName: 'The Paper Wall' },
  'bac-9': { name: 'A Passagem Secreta', enName: 'The Secret Passage' },
  'bac-10': { name: 'O Degrau Oculto', enName: 'The Hidden Step' },
  'bac-11': { name: 'O Molho de Chaves', enName: 'The Keyring' },
  'bac-12': { name: 'O Arquivo Destrancado', enName: 'The Unlocked File' },
  'bac-13': { name: 'A Catraca Livre', enName: 'The Free Turnstile' },
  'bac-14': { name: 'A Sala do Trono', enName: 'The Throne Room' },
  // XSS
  'xss-1': { name: 'Espelho Falso', enName: 'Fake Mirror' },
  'xss-2': { name: 'O Labirinto de Espelhos', enName: 'The Mirror Maze' },
  'xss-3': { name: 'O Eco Mortal', enName: 'The Deadly Echo' },
  'xss-4': { name: 'A Sombra Enganosa', enName: 'The Deceitful Shadow' },
  'xss-5': { name: 'A Ilusão de Ótica', enName: 'The Optical Illusion' },
  'xss-6': { name: 'O Reflexo Congelado', enName: 'The Frozen Reflection' },
  'xss-7': { name: 'O Quadro Amaldiçoado', enName: 'The Cursed Painting' },
  'xss-8': { name: 'A Máscara Rachada', enName: 'The Cracked Mask' },
  'xss-9': { name: 'A Tinta Invisível', enName: 'The Invisible Ink' },
  'xss-10': { name: 'O Espelho Narcisista', enName: 'The Narcissistic Mirror' },
  'xss-11': { name: 'O Reflexo Cego', enName: 'The Blind Reflection' },
  'xss-12': { name: 'O Fio Transparente', enName: 'The Transparent Thread' },
  // AUTH
  'auth-1': { name: 'Chave Mestra', enName: 'Master Key' },
  'auth-2': { name: 'Cookie Unsigned', enName: 'Unsigned Cookie' },
  'auth-3': { name: 'A Senha do Caderno', enName: 'The Notebook Password' },
  'auth-4': { name: 'O Porteiro Esquecido', enName: 'The Forgetful Bouncer' },
  'auth-5': { name: 'O Distintivo Falso', enName: 'The Fake Badge' },
  'auth-6': { name: 'O Clone de Identidade', enName: 'The Identity Clone' },
  'auth-7': { name: 'O Gêmeo Maligno', enName: 'The Evil Twin' },
  'auth-8': { name: 'O Guarda Distraído', enName: 'The Distracted Guard' },
  'auth-9': { name: 'O Selo Violado', enName: 'The Broken Seal' },
  'auth-10': { name: 'O Sósia do Executivo', enName: "The Executive's Doppelganger" },
  // SSRF
  'ssrf-1': { name: 'O Espião Interno', enName: 'The Inside Spy' },
  'ssrf-2': { name: 'A Carta Forjada', enName: 'The Forged Letter' },
  'ssrf-3': { name: 'O Radar Subterrâneo', enName: 'The Underground Radar' },
  'ssrf-4': { name: 'O Fantasma na Máquina', enName: 'The Ghost in the Machine' },
  'ssrf-5': { name: 'O Segredo do Servidor', enName: "The Server's Secret" },
  'ssrf-6': { name: 'O Endereço Traiçoeiro', enName: 'The Deceptive Address' },
  'ssrf-7': { name: 'O Pombo Correio', enName: 'The Carrier Pigeon' },
  'ssrf-8': { name: 'O Mensageiro Cego', enName: 'The Blind Messenger' },
  // LOGIC
  'bl-1': { name: 'O Relógio Quebrado', enName: 'The Broken Clock' },
  'bl-2': { name: 'O Troco Infinito', enName: 'The Infinite Change' },
  'bl-3': { name: 'A Pilha de Cupons', enName: 'The Coupon Stack' },
  'bl-4': { name: 'A Entrega Fantasma', enName: 'The Ghost Delivery' },
  'bl-5': { name: 'O Centavo de Ouro', enName: 'The Golden Penny' },
  'bl-6': { name: 'A Amostra Grátis Eterna', enName: 'The Eternal Free Sample' },
  'bl-7': { name: 'O Carrinho Sem Fundo', enName: 'The Bottomless Cart' },
  'bl-8': { name: 'A Nota Duplicada', enName: 'The Duplicated Bill' },
  // CRYPTO
  'crypto-1': { name: 'Cadeado de Papel', enName: 'Paper Padlock' },
  'crypto-2': { name: 'O Cofre de Plástico', enName: 'The Plastic Safe' },
  'crypto-3': { name: 'A Chave debaixo do Tapete', enName: 'The Key Under the Mat' },
  'crypto-4': { name: 'O Diário Aberto', enName: 'The Open Diary' },
  'crypto-5': { name: 'O Oráculo Fofoqueiro', enName: 'The Gossiping Oracle' },
  'crypto-6': { name: 'O Padrão Repetido', enName: 'The Repeating Pattern' },
  // LEGENDARY
  'leg-1': { name: 'O Efeito Dominó', enName: 'The Domino Effect' },
  'leg-2': { name: 'A Tempestade Perfeita', enName: 'The Perfect Storm' },
  'leg-3': { name: 'O Apocalipse Primaveril', enName: 'The Spring Apocalypse' },
  'leg-4': { name: 'O Mestre dos Títeres', enName: 'The Puppet Master' },
  'leg-5': { name: 'O Boneco de Marionete', enName: 'The Marionette' },
  'leg-6': { name: 'A Caixa de Pandora', enName: "Pandora's Box" }
};

let matchCount = 0;
for (const [id, rename] of Object.entries(mappings)) {
  const regex = new RegExp(`(id:\\s*'${id}',\\s*\\n\\s*name:\\s*')(?:[^']+)('|")`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1${rename.name}$2,\n    enName: '${rename.enName.replace(/'/g, "\\'")}'`);
    matchCount++;
  } else {
    console.error(`ID ${id} not found or regex failed!`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated ${matchCount} cards successfully.`);
