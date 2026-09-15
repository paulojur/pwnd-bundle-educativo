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

const CARDS_FILE = path.join(__dirname, 'src', 'data', 'cardsData.ts');
const DECK_FILE = path.join(__dirname, 'src', 'data', 'full80DeckData.ts');

let cardsText = fs.readFileSync(CARDS_FILE, 'utf-8');
let deckText = fs.readFileSync(DECK_FILE, 'utf-8');

// B6: "o base de dados" -> "a base de dados" in all ptDescriptions
deckText = deckText.replace(/o base de dados/g, 'a base de dados');
cardsText = cardsText.replace(/o base de dados/g, 'a base de dados');

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
    const brStr = elements.map(e => "'" + e + "'").join(', ');
    const ptStr = ptElements.map(e => "'" + e + "'").join(', ');
    return `specialPowers: [${brStr}],\n    ptSpecialPowers: [${ptStr}]`;
});

fs.writeFileSync(CARDS_FILE, cardsText, 'utf-8');
fs.writeFileSync(DECK_FILE, deckText, 'utf-8');
console.log('Phase B applied to cards and deck!');
