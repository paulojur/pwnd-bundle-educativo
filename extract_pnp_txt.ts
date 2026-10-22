import * as fs from 'fs';
import { ALL_ACTION_CARDS } from './src/data/full80DeckData';
import { PROGRAM_CARDS, ARCHETYPES } from './src/data/cardsData';
import { FULL_24_EVENTS } from './src/data/full24EventsData';

// PnP Logic
const getSimulatedCVSS = (rarity?: string, id?: string) => {
  let seed = 0;
  if (id) {
    for (let i = 0; i < id.length; i++) {
      seed += id.charCodeAt(i);
    }
  }
  let min = 4.0;
  let max = 5.9;
  switch (rarity) {
    case 'Common': min = 4.0; max = 5.9; break;
    case 'Uncommon': min = 6.0; max = 6.9; break;
    case 'Rare': min = 7.0; max = 7.9; break;
    case 'Epic': min = 8.0; max = 8.9; break;
    case 'Legendary': min = 9.0; max = 10.0; break;
  }
  const value = min + ((seed % 20) / 19) * (max - min);
  return value.toFixed(1);
};

const getPnPBadgeProps = (vulnClass: string | undefined, cardId?: string) => {
  let key = vulnClass;
  if (!key && cardId) {
    if (cardId.startsWith('inj-')) key = 'Injection';
    else if (cardId.startsWith('bac-')) key = 'Broken Access Control';
    else if (cardId.startsWith('xss-')) key = 'Cross-Site Scripting';
    else if (cardId.startsWith('auth-')) key = 'Authentication';
    else if (cardId.startsWith('ssrf-')) key = 'SSRF';
    else if (cardId.startsWith('bl-')) key = 'Business Logic';
    else if (cardId.startsWith('crypto-')) key = 'Cryptography';
    else if (cardId.startsWith('leg-')) key = 'Legendary';
  }

  switch (key) {
    case 'Injection': return { color: '#E67E22', label: 'INJ' };
    case 'Broken Access Control': return { color: '#4B0082', label: 'BAC' };
    case 'Cross-Site Scripting': return { color: '#E91E63', label: 'XSS' };
    case 'Authentication': return { color: '#F1C40F', label: 'AUTH' };
    case 'SSRF': return { color: '#2196F3', label: 'SSRF' };
    case 'Business Logic': return { color: '#008080', label: 'LOGIC' };
    case 'Cryptography':
    case 'Cryptographic Failures': return { color: '#27AE60', label: 'CRYPTO' };
    case 'Legendary': return { color: '#B39DDB', label: '⚡ LEGENDARY' };
    default: return { color: '#ccc', label: 'VULN' };
  }
};

const getFlatValueLabel = (card: any) => {
  if (card.type === 'tool') return 'FERRAMENTA';
  if (card.type === 'defuse') return 'SAFEGUARD';
  if (card.type === 'event') return 'EVENTO';
  switch (card.rarity) {
    case 'Common': return '+$1.5k';
    case 'Uncommon': return '+$2.5k';
    case 'Rare': return '+$4.0k';
    case 'Epic': return '+$5.0k';
    case 'Legendary': return '+$6.0k';
    default: return '+$1.5k';
  }
};

let outputTxt = '==================================================\n';
outputTxt += `CARTAS DE AÇÃO (Vulnerabilidades, Tools, Defuses) - TOTAL: ${ALL_ACTION_CARDS.length}\n`;
outputTxt += '==================================================\n\n';

ALL_ACTION_CARDS.forEach(c => {
  const pnpBadge = getPnPBadgeProps((c as any).vulnClass, c.id);
  const cvss = c.type === 'exploit' ? getSimulatedCVSS(c.rarity, c.id) : 'N/A';
  const flatValue = getFlatValueLabel(c);
  
  outputTxt += `[ID: ${c.id}] ${c.name} (${c.enName || ''})\n`;
  outputTxt += `Nome Técnico: ${c.technicalReference}\n`;
  outputTxt += `Tipo: ${c.type} | Raridade: ${c.rarity || 'N/A'} | PnP Value (Bônus na Mesa): ${flatValue}\n`;
  if (c.type === 'exploit') {
    outputTxt += `PnP CVSS (Gerado por ID): ${cvss}\n`;
    outputTxt += `PnP Badge: ${pnpBadge.label} | Cor do Badge: ${pnpBadge.color}\n`;
  }
  outputTxt += `Ícone: ${c.icon}\n`;
  
  if (c.maxCharges) {
    outputTxt += `Cargas (Charges): ${c.maxCharges}\n`;
  }

  outputTxt += `[pt-BR] Descrição: ${c.simpleDescription}\n`;
  if (c.ptDescription) {
    outputTxt += `[pt-PT] Descrição: ${c.ptDescription}\n`;
  }
  outputTxt += '--------------------------------------------------\n';
});

outputTxt += '\n==================================================\n';
outputTxt += `PROGRAMAS - TOTAL: ${PROGRAM_CARDS.length}\n`;
outputTxt += '==================================================\n\n';

PROGRAM_CARDS.forEach(c => {
  outputTxt += `[ID: ${c.id}] ${c.name}\n`;
  outputTxt += `Tipo da Empresa: ${c.companyType}\n`;
  outputTxt += `Velocidade de Patch: ${c.patchSpeed}\n`;
  outputTxt += `Bounty Range: ${c.bountyRange} | Bônus Fixo PnP: ${c.flatBountyBonus}\n`;
  outputTxt += `Classes Permitidas: ${Array.isArray(c.allowedClasses) ? c.allowedClasses.join(', ') : c.allowedClasses}\n`;
  outputTxt += `[pt-BR] Descrição: ${c.description}\n`;
  if (c.ptDescription) {
    outputTxt += `[pt-PT] Descrição: ${c.ptDescription}\n`;
  }
  outputTxt += '--------------------------------------------------\n';
});

outputTxt += '\n==================================================\n';
outputTxt += `ARQUÉTIPOS - TOTAL: ${ARCHETYPES.length}\n`;
outputTxt += '==================================================\n\n';

ARCHETYPES.forEach(c => {
  outputTxt += `[ID: ${c.id}] ${c.name}\n`;
  outputTxt += `Mão Máxima: ${c.maxHandSize} | Reports por Turno: ${c.reportsPerTurn}\n`;
  outputTxt += `Modificador de Bounty: ${c.bountyModifier}\n`;
  outputTxt += `Ícone: ${c.avatarIcon} | Cor (Tema): ${c.color}\n`;
  
  outputTxt += `[pt-BR] Título: ${c.title}\n`;
  if (c.ptTitle) outputTxt += `[pt-PT] Título: ${c.ptTitle}\n`;
  outputTxt += `[pt-BR] Estilo: ${c.playstyle}\n`;
  if (c.ptPlaystyle) outputTxt += `[pt-PT] Estilo: ${c.ptPlaystyle}\n`;
  
  outputTxt += `[pt-BR] Poderes:\n`;
  c.specialPowers.forEach(p => outputTxt += `  - ${p}\n`);
  
  if (c.ptSpecialPowers) {
    outputTxt += `[pt-PT] Poderes:\n`;
    c.ptSpecialPowers.forEach(p => outputTxt += `  - ${p}\n`);
  }
  outputTxt += '--------------------------------------------------\n';
});

outputTxt += '\n==================================================\n';
outputTxt += `EVENTOS - TOTAL: ${FULL_24_EVENTS.length}\n`;
outputTxt += '==================================================\n\n';

FULL_24_EVENTS.forEach(c => {
  outputTxt += `[ID: ${c.id}] ${c.name} (${c.enName || ''})\n`;
  outputTxt += `Nome Técnico: ${c.technicalReference}\n`;
  outputTxt += `Tipo de Efeito: ${c.effectType} | Alvo: ${c.targetText}\n`;
  outputTxt += `Ícone: ${c.icon}\n`;
  outputTxt += `[pt-BR] Descrição: ${c.simpleDescription}\n`;
  if (c.ptDescription) {
    outputTxt += `[pt-PT] Descrição: ${c.ptDescription}\n`;
  }
  outputTxt += '--------------------------------------------------\n';
});

fs.writeFileSync('analise_textual_pnp.txt', outputTxt, 'utf-8');
console.log('Extração PnP concluída! Arquivo gerado: analise_textual_pnp.txt');
