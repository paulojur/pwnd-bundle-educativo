const fs = require('fs');

// 1. Vulns
const vulns = JSON.parse(fs.readFileSync('vulnerabilidades_pnp_fisico.json', 'utf8'));

// 2. Events
const evtsCode = fs.readFileSync('src/data/full24EventsData.ts', 'utf8');
const evts = [];
const evtBlocks = evtsCode.split(/\{\s*id:\s*'/).slice(1);
for (const b of evtBlocks) {
  const id = b.substring(0, b.indexOf("'"));
  const number = b.match(/number:\s*'([^']+)'/)?.[1] || '';
  const name = b.match(/name:\s*'([^']+)'/)?.[1] || '';
  const tech = b.match(/technicalReference:\s*'([^']+)'/)?.[1] || '';
  const icon = b.match(/icon:\s*'([^']+)'/)?.[1] || '';
  const target = b.match(/targetText:\s*'([^']+)'/)?.[1] || '';
  const desc = b.match(/simpleDescription:\s*['"]([^'"]+)['"]/)?.[1] || '';
  const effectType = b.match(/effectType:\s*'([^']+)'/)?.[1] || '';
  evts.push({ id, number, name, tech, icon, target, desc, effectType });
}

// 3. Tools
const code80 = fs.readFileSync('src/data/full80DeckData.ts', 'utf8');
const toolMatch = code80.substring(code80.indexOf('export const FULL_12_TOOLS: CardV2[] = ['), code80.indexOf('export const FULL_3_DEFUSES: CardV2[] = ['));
const tools = [];
const toolBlocks = toolMatch.split(/\{\s*id:\s*'/).slice(1);
for (const b of toolBlocks) {
  const id = b.substring(0, b.indexOf("'"));
  const name = b.match(/name:\s*'([^']+)'/)?.[1] || '';
  const tech = b.match(/technicalReference:\s*'([^']+)'/)?.[1] || '';
  const rarity = b.match(/rarity:\s*'([^']+)'/)?.[1] || '';
  const icon = b.match(/icon:\s*'([^']+)'/)?.[1] || '';
  const descMatch = b.match(/simpleDescription:\s*[`'"]([\s\S]*?)[`'"],/);
  const desc = descMatch ? descMatch[1].trim() : '';
  tools.push({ id, name, tech, rarity, icon, desc });
}

// 4. Archetypes
const archetypes = [
  {
    name: 'n00b (🌱)',
    sub: 'O Iniciante Dedicado',
    tech: 'Script Kiddie / Aprendiz',
    bonus: 'Começa com +1 carta na mão (total 6 cartas) e visão aguçada de ferramentas.',
    ability: 'Garimpeiro de Ferramentas: A cada Report/Golpe bem-sucedido, em vez de comprar a Tool do topo, OLHE as 3 primeiras do Tool Deck e ESCOLHA 1.'
  },
  {
    name: 'The Old Guard (🧠)',
    sub: 'O Veterano de C/ASM',
    tech: 'Senior Exploit Developer',
    bonus: 'Capacidade de Mão Expandida: Limite permanente de 8 cartas na mão.',
    ability: 'Mestre da Baixa Camada: Recebe +$500 adicionais na Bounty Track para cada carta de raridade Épica ou Lendária incluída no seu Report/Golpe.'
  },
  {
    name: 'Bug Hunter (⚡)',
    sub: 'O Caçador em Escala',
    tech: 'High-Volume Bounty Hunter',
    bonus: 'Alta rotação de brechas comuns e incomuns.',
    ability: 'Caçador em Escala: Só pode reportar vulnerabilidades Comum e Incomum. Cada carta além da primeira no mesmo Report/Golpe soma +$500 ao payout. Eficiência em Volume: Concluir um Report/Golpe com 3 vulnerabilidades simultâneas concede 1 Abelha.'
  },
  {
    name: 'Social Engineer (🎭)',
    sub: 'O Manipulador Humano',
    tech: 'Human Recon & Phishing Specialist',
    bonus: 'Imunidade a ataques direcionados e manipulação de alvos.',
    ability: 'Caos Redirecionado (1x por rodada): Quando um Event Card maléfico for ativado CONTRA você (ou POR você), escolha outro jogador válido para sofrer o efeito no lugar. Phishing (1x por rodada, ação livre): Puxe 1 carta aleatória da mão de um oponente e devolva 1 carta da sua mão para ele.'
  },
  {
    name: 'Red Teamer (⚔️)',
    sub: 'O Invasor Furtivo',
    tech: 'Offensive Adversary Operator',
    bonus: 'Invasão irrestrita sem limites de escopo.',
    ability: 'Sem Limites: Ignora completamente as restrições de escopo de qualquer programa (pode baixar qualquer classe de vulnerabilidade). Penalidade Comercial: Recebe -25% em todos os payouts na Bounty Track (aplica regra de arredondamento).'
  },
  {
    name: 'The Pentester (🛡️)',
    sub: 'O Auditor Metódico',
    tech: 'Methodical Security Auditor',
    bonus: 'Imunidade natural contra Duplicate Report! e Triage Delay! / Sistema Travado!.',
    ability: 'Relatório Estruturado: Ganhe +$500 por cada classe técnica diferente incluída no seu Report/Golpe além da primeira (máximo de +$1.000 de bônus por entrega).'
  }
];

// 5. Programs
const programs = [
  { name: 'ShopAll Global', type: 'E-Commerce', speed: 'Rápida (8+)', scopes: 'INJ, XSS, BAC, LOGIC', bonus: '+$500 se o Report tiver 2+ classes diferentes' },
  { name: 'BankSafe Financial', type: 'Fintech / Banking', speed: 'Extrema (7+)', scopes: 'AUTH, CRYPTO, BAC, SSRF', bonus: '+$1.000 se o Report contiver CRYPTO ou AUTH' },
  { name: 'GovPortal Legacy', type: 'Setor Público', speed: 'Lenta (10+)', scopes: 'INJ, BAC, LOGIC, LEGENDARY', bonus: 'Permite classe LEGENDARY sem restrições adicionais' },
  { name: 'HealthLock EHR', type: 'Saúde / Hospitalar', speed: 'Moderada (9+)', scopes: 'BAC, AUTH, SSRF, INJ', bonus: '+$500 se incluir BAC' },
  { name: 'CloudNine Cloud Services', type: 'Infraestrutura Cloud', speed: 'Extrema (7+)', scopes: 'SSRF, BAC, CRYPTO, LEGENDARY', bonus: 'Multiplicador de 1.5x em vulnerabilidades SSRF' },
  { name: 'SocialBee Media', type: 'Rede Social', speed: 'Rápida (8+)', scopes: 'XSS, AUTH, BAC, LOGIC', bonus: '+$500 por cada carta XSS reportada' },
  { name: 'GameVerse MMO', type: 'Jogos / Entretenimento', speed: 'Moderada (9+)', scopes: 'LOGIC, INJ, XSS, AUTH', bonus: 'Permite reroll gratuito de 1 dado de Patch 1x por turno' },
  { name: 'EduConnect LMS', type: 'Plataforma Educacional', speed: 'Lenta (10+)', scopes: 'INJ, XSS, BAC, AUTH', bonus: 'Ao concluir Report, compre 1 carta adicional do Main Deck' },
  { name: 'CryptoX Exchange', type: 'Corretora Cripto', speed: 'Extrema (7+)', scopes: 'CRYPTO, LOGIC, AUTH, SSRF', bonus: 'Paga +$1.500 adicionais para qualquer carta CRYPTO Épica' },
  { name: 'AI Core Systems', type: 'Inteligência Artificial', speed: 'Rápida (8+)', scopes: 'INJ, SSRF, LOGIC, LEGENDARY', bonus: 'Aceita Prompt Injections e SSRFs com +$500 de bônus' },
  { name: 'PayGateway Prime', type: 'Gateway de Pagamentos', speed: 'Rápida (8+)', scopes: 'AUTH, BAC, CRYPTO, LOGIC', bonus: '+$1.000 de bônus para relatórios com 3 vulnerabilidades' },
  { name: 'DeliveryDash App', type: 'Logística & Delivery', speed: 'Moderada (9+)', scopes: 'BAC, LOGIC, XSS, INJ', bonus: 'Ao concluir Report, pegue 1 Abelha extra do suprimento' }
];

fs.writeFileSync('scratch/all_extracted_cards.json', JSON.stringify({ vulns, evts, tools, archetypes, programs }, null, 2));
console.log('Extraction completed successfully!');
console.log('Vulns:', vulns.length, 'Events:', evts.length, 'Tools:', tools.length);
