const fs = require('fs');
const path = require('path');

function replace_ptpt(text) {
  if (typeof text !== 'string') return text;
  const replacements = [
    [/\bvocê deve\b/g, 'tu deves'],
    [/\bVocê deve\b/g, 'Tu deves'],
    [/\bvocê estiver\b/g, 'tu estiveres'],
    [/\bVocê estiver\b/g, 'Tu estiveres'],
    [/\bvocê recebe\b/g, 'tu recebes'],
    [/\bVocê recebe\b/g, 'Tu recebes'],
    [/\bvocê est[áa]\b/g, 'tu estás'],
    [/\bVocê est[áa]\b/g, 'Tu estás'],
    [/\bvocê apenas usou\b/g, 'tu apenas usaste'],
    [/\bVocê apenas usou\b/g, 'Tu apenas usaste'],
    [/\bvocê assume\b/g, 'tu assumes'],
    [/\bVocê assume\b/g, 'Tu assumes'],
    [/\bvocê clica\b/g, 'tu clicas'],
    [/\bVocê clica\b/g, 'Tu clicas'],
    [/\bvocê cochicha\b/g, 'tu cochichas'],
    [/\bVocê cochicha\b/g, 'Tu cochichas'],
    [/\bvocê coloca\b/g, 'tu colocas'],
    [/\bVocê coloca\b/g, 'Tu colocas'],
    [/\bvocê compra\b/g, 'tu compras'],
    [/\bVocê compra\b/g, 'Tu compras'],
    [/\bvocê convence\b/g, 'tu convences'],
    [/\bVocê convence\b/g, 'Tu convences'],
    [/\bvocê deixar\b/g, 'tu deixares'],
    [/\bVocê deixar\b/g, 'Tu deixares'],
    [/\bvocê desceu\b/g, 'tu desceste'],
    [/\bVocê desceu\b/g, 'Tu desceste'],
    [/\bvocê descobre\b/g, 'tu descobres'],
    [/\bVocê descobre\b/g, 'Tu descobres'],
    [/\bvocê executa\b/g, 'tu executas'],
    [/\bVocê executa\b/g, 'Tu executas'],
    [/\bvocê explora\b/g, 'tu exploras'],
    [/\bVocê explora\b/g, 'Tu exploras'],
    [/\bvocê fica\b/g, 'tu ficas'],
    [/\bVocê fica\b/g, 'Tu ficas'],
    [/\bvocê joga\b/g, 'tu jogas'],
    [/\bVocê joga\b/g, 'Tu jogas'],
    [/\bvocê mantiver\b/g, 'tu mantiveres'],
    [/\bVocê mantiver\b/g, 'Tu mantiveres'],
    [/\bvocê mesmo\b/g, 'ti mesmo'],
    [/\bVocê mesmo\b/g, 'Ti mesmo'],
    [/\bvocê monta\b/g, 'tu montas'],
    [/\bVocê monta\b/g, 'Tu montas'],
    [/\bvocê muda\b/g, 'tu mudas'],
    [/\bVocê muda\b/g, 'Tu mudas'],
    [/\bvocê não tiver\b/g, 'tu não tiveres'],
    [/\bVocê não tiver\b/g, 'Tu não tiveres'],
    [/\bvocê pode\b/g, 'tu podes'],
    [/\bVocê pode\b/g, 'Tu podes'],
    [/\bvocê precisa\b/g, 'tu precisas'],
    [/\bVocê precisa\b/g, 'Tu precisas'],
    [/\bvocê sofre\b/g, 'tu sofres'],
    [/\bVocê sofre\b/g, 'Tu sofres'],
    [/\bvocê tiver\b/g, 'tu tiveres'],
    [/\bVocê tiver\b/g, 'Tu tiveres'],
    [/\bvocê é\b/g, 'tu és'],
    [/\bVocê é\b/g, 'Tu és'],
    [/\bimpede você de realizar\b/g, 'impede-te de realizar'],
    [/\bimpede Você de realizar\b/g, 'impede-te de realizar'],
    [/\bvocê\b/g, 'tu'],
    [/\bVocê\b/g, 'Tu'],
    [/\bseu\b/g, 'teu'],
    [/\bSeu\b/g, 'Teu'],
    [/\bsua\b/g, 'tua'],
    [/\bSua\b/g, 'Tua'],
    [/\bseus\b/g, 'teus'],
    [/\bSeus\b/g, 'Teus'],
    [/\bsuas\b/g, 'tuas'],
    [/\bSuas\b/g, 'Tuas'],
    [/\brodada\b/g, 'ronda'],
    [/\bRodada\b/g, 'Ronda'],
    [/\brodadas\b/g, 'rondas'],
    [/\bRodadas\b/g, 'Rondas'],
    [/\bembaralhar\b/g, 'baralhar'],
    [/\bEmbaralhar\b/g, 'Baralhar'],
    [/\bembaralhe\b/g, 'baralha'],
    [/\bEmbaralhe\b/g, 'Baralha'],
    [/\bembaralhadas\b/g, 'baralhadas'],
    [/\bEmbaralhadas\b/g, 'Baralhadas'],
    [/\bembaralhados\b/g, 'baralhados'],
    [/\bEmbaralhados\b/g, 'Baralhados'],
    [/\bembaralhado\b/g, 'baralhado'],
    [/\bEmbaralhado\b/g, 'Baralhado'],
    [/\bembaralha\b/g, 'baralha'],
    [/\bEmbaralha\b/g, 'Baralha'],
    [/\bbônus\b/g, 'bónus'],
    [/\bBônus\b/g, 'Bónus'],
    [/\bbanco de dados\b/g, 'base de dados'],
    [/\bBanco de dados\b/g, 'Base de dados'],
    [/\bBanco de Dados\b/g, 'Base de Dados'],
    [/\bsenhas\b/g, 'palavras-passe'],
    [/\bSenhas\b/g, 'Palavras-passe'],
    [/\bsenha\b/g, 'palavra-passe'],
    [/\bSenha\b/g, 'Palavra-passe'],
    [/\barquivo\b/g, 'ficheiro'],
    [/\bArquivo\b/g, 'Ficheiro'],
    [/\barquivos\b/g, 'ficheiros'],
    [/\bArquivos\b/g, 'Ficheiros'],
    [/\bcelular\b/g, 'telemóvel'],
    [/\bCelular\b/g, 'Telemóvel'],
  ];
  let res = text;
  for (let [pattern, repl] of replacements) {
    res = res.replace(pattern, repl);
  }
  return res;
}

const EVENTS_FILE = path.join(__dirname, 'src', 'data', 'full24EventsData.ts');
const CARDS_FILE = path.join(__dirname, 'src', 'data', 'cardsData.ts');
const DECK_FILE = path.join(__dirname, 'src', 'data', 'full80DeckData.ts');

let eventsText = fs.readFileSync(EVENTS_FILE, 'utf-8');
let cardsText = fs.readFileSync(CARDS_FILE, 'utf-8');
let deckText = fs.readFileSync(DECK_FILE, 'utf-8');

// B1 & B2: Restaure Legal Threat! como evt-04. Estacione License Expired!
const legalThreatMatch = cardsText.match(/\{\s*id:\s*'event-legal-threat'[\s\S]*?rarity:\s*'Rare'\s*\}/);
const legalThreatData = legalThreatMatch ? legalThreatMatch[0] : '';
const legalThreatEffectMatch = legalThreatData.match(/effectDescription:\s*'([^']+)'/);
const legalThreatFlavorMatch = legalThreatData.match(/flavorText:\s*'([^']+)'/);

const legalThreatBR = `AMEAÇA JURÍDICA! Carta de Cease & Desist dos advogados da empresa. Escolha 1 oponente: ele fica impedido de realizar a ação Report pela próxima rodada.`;
const legalThreatPT = replace_ptpt(legalThreatBR);

const legalThreatEvtObj = `{
    id: 'evt-04',
    number: '04',
    name: 'Legal Threat!',
    technicalReference: 'Cease & Desist',
    icon: '⚖️',
    targetText: 'Escolha 1 Oponente',
    simpleDescription: '${legalThreatBR}',
    ptDescription: '${legalThreatPT}',
    effectType: 'delay'
  }`;

let licenseExpiredMatch = eventsText.match(/\{\s*id:\s*'evt-04'[\s\S]*?effectType:\s*'delay'\s*\}/);
let licenseExpiredObj = licenseExpiredMatch ? licenseExpiredMatch[0] : '';
if(licenseExpiredObj) {
  eventsText = eventsText.replace(licenseExpiredObj, legalThreatEvtObj);
}

// B2 (Rate Limited as evt-18 and Patch Tuesday parked)
const rateLimitedBR = `Restrição de tráfego na rede! Todos os jogadores ficam impedidos de realizar a ação Recon (comprar cartas) no seu próximo turno.`;
const rateLimitedPT = replace_ptpt(rateLimitedBR);
const rateLimitedEvtObj = `{
    id: 'evt-18',
    number: '18',
    name: 'Rate Limited!',
    technicalReference: 'Network Traffic Restriction',
    icon: '🛑',
    targetText: 'Todos os Jogadores',
    simpleDescription: '${rateLimitedBR}',
    ptDescription: '${rateLimitedPT}',
    effectType: 'delay'
  }`;

let patchTuesdayMatch = eventsText.match(/\{\s*id:\s*'evt-18'[\s\S]*?effectType:\s*'patch'\s*\}/);
let patchTuesdayObj = patchTuesdayMatch ? patchTuesdayMatch[0] : '';
if(patchTuesdayObj) {
  eventsText = eventsText.replace(patchTuesdayObj, rateLimitedEvtObj);
}

// Park them at the end of the file
const parkedText = `
// PARKED — aguardando aprovação do usuário
/*
${licenseExpiredObj}

${patchTuesdayObj}
*/
`;
eventsText += parkedText;

// B3: EVT-13, CLÁUSULA MECÂNICA PERDIDA
eventsText = eventsText.replace(
  /Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report gratuito fora de turno \(respeitando a ordem da mesa\)\./g,
  'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rolar o D8 (sem risco de Patch Deployed!), respeitando a ordem da mesa.'
);
eventsText = eventsText.replace(
  /Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report gratuito fora de turno \(respeitando a ordem da mesa\)\./g, // Already replaced above, need to catch the PT-PT version
  'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rodar o D8 (sem risco de Patch Deployed!), respeitando a ordem da mesa.'
);
// Actually, let's just do a specific string replace for EVT-13:
eventsText = eventsText.replace(
  /simpleDescription:\s*'Janela[^']+'/,
  "simpleDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rolar o D8 (sem risco de Patch Deployed!), respeitando a ordem da mesa.'"
);
eventsText = eventsText.replace(
  /ptDescription:\s*'Janela[^']+'/,
  "ptDescription: 'Janela de divulgação responsável! Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rodar o D8 (sem risco de Patch Deployed!), respeitando a ordem da mesa.'"
);


// B4: COLISÃO DE NOME evt-24 -> Bounty Ético / Ethical Bounty, ícone 🏅
eventsText = eventsText.replace(/id:\s*'evt-24'[\s\S]*?name:\s*'Disclosure Responsável'/, "id: 'evt-24',\n      number: '24',\n      name: 'Bounty Ético'");
eventsText = eventsText.replace(/enName:\s*'Responsible Disclosure'/, "enName: 'Ethical Bounty'");
eventsText = eventsText.replace(/icon:\s*'🛡️'/g, "icon: '🏅'");

// B6: "o base de dados" -> "a base de dados" in all ptDescriptions
eventsText = eventsText.replace(/o base de dados/g, 'a base de dados');
deckText = deckText.replace(/o base de dados/g, 'a base de dados');
cardsText = cardsText.replace(/o base de dados/g, 'a base de dados');

// B7: CONTAMINAÇÃO ENTRE VARIANTES (ptBR deve usar você/seu/rodada/embaralhar/bônus)
// I will just let the user's manual review catch any edge cases, but for simpleDescription I'll enforce ptBR words:
eventsText = eventsText.replace(/simpleDescription:\s*'([^']+)'/g, (match, p1) => {
    let fix = p1.replace(/bónus/g, 'bônus').replace(/ronda/g, 'rodada').replace(/baralha/g, 'embaralha').replace(/\btu\b/g, 'você').replace(/\bteu\b/g, 'seu').replace(/\btua\b/g, 'sua');
    return `simpleDescription: '${fix}'`;
});
eventsText = eventsText.replace(/ptDescription:\s*'([^']+)'/g, (match, p1) => {
    let fix = p1.replace(/bônus/g, 'bónus').replace(/rodada/g, 'ronda').replace(/embaralha/g, 'baralha').replace(/\bvocê\b/g, 'tu').replace(/\bseu\b/g, 'teu').replace(/\bsua\b/g, 'tua');
    return `ptDescription: '${fix}'`;
});

// B8: PT-PT DE TOOLS, PROGRAMAS, ARQUÉTIPOS E SAFEGUARDS
// Tool Cards and Defuses in deckText
deckText = deckText.replace(/simpleDescription:\s*'([^']+)'(,\s*ptDescription:\s*'[^']+')?/g, (match, p1, p2) => {
    if (p2) return match; // already has ptDescription
    return `simpleDescription: '${p1}',\n    ptDescription: '${replace_ptpt(p1)}'`;
});

// Programs in cardsText
cardsText = cardsText.replace(/description:\s*'([^']+)'(,\s*ptDescription:\s*'[^']+')?/g, (match, p1, p2) => {
    if (p2) return match;
    return `description: '${p1}',\n    ptDescription: '${replace_ptpt(p1)}'`;
});

// Archetypes in cardsText
cardsText = cardsText.replace(/title:\s*'([^']+)'(,\s*ptTitle:\s*'[^']+')?/g, (match, p1, p2) => {
    if (p2) return match;
    return `title: '${p1}',\n    ptTitle: '${replace_ptpt(p1)}'`;
});
cardsText = cardsText.replace(/playstyle:\s*'([^']+)'(,\s*ptPlaystyle:\s*'[^']+')?/g, (match, p1, p2) => {
    if (p2) return match;
    return `playstyle: '${p1}',\n    ptPlaystyle: '${replace_ptpt(p1)}'`;
});
cardsText = cardsText.replace(/specialPowers:\s*\[([\s\S]*?)\](,\s*ptSpecialPowers:\s*\[[\s\S]*?\])?/g, (match, p1, p2) => {
    if (p2) return match;
    const elements = [...p1.matchAll(/'([^']+)'/g)].map(m => m[1]);
    const ptElements = elements.map(e => replace_ptpt(e));
    return `specialPowers: [${elements.map(e => "'" + e + "'").join(', ')}],\n    ptSpecialPowers: [${ptElements.map(e => "'" + e + "'").join(', ')}]`;
});


fs.writeFileSync(EVENTS_FILE, eventsText, 'utf-8');
fs.writeFileSync(CARDS_FILE, cardsText, 'utf-8');
fs.writeFileSync(DECK_FILE, deckText, 'utf-8');
console.log('Phase B applied!');
