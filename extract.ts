import * as fs from 'fs';
import { ALL_ACTION_CARDS } from './src/data/full80DeckData';
import { PROGRAM_CARDS, ARCHETYPES } from './src/data/cardsData';
import { FULL_24_EVENTS } from './src/data/full24EventsData';
import { getClassBadgeInfo } from './src/data/cardsDataV2';

const rarityColors: Record<string, string> = {
  Common: '#8b949e (Cinza)',
  Uncommon: '#39d353 (Verde)',
  Rare: '#38bdf8 (Azul)',
  Epic: '#a855f7 (Roxo)',
  Legendary: '#eab308 (Dourado)'
};

let outputTxt = '';

outputTxt += '==================================================\n';
outputTxt += `CARTAS DE AÇÃO (Vulnerabilidades, Tools, Defuses) - TOTAL: ${ALL_ACTION_CARDS.length}\n`;
outputTxt += '==================================================\n\n';

ALL_ACTION_CARDS.forEach(c => {
  const badgeInfo = getClassBadgeInfo(c.id, c.technicalReference, c.name);
  const cvss = c.points > 0 ? (c.points / 10).toFixed(1) : 'N/A';
  
  outputTxt += `[ID: ${c.id}] ${c.name} (${c.enName || ''})\n`;
  outputTxt += `Nome Técnico: ${c.technicalReference}\n`;
  outputTxt += `Tipo: ${c.type} | Raridade: ${c.rarity} | Borda Esquerda (Raridade): ${rarityColors[c.rarity] || c.rarity}\n`;
  outputTxt += `CVSS / Pontos: ${cvss} (Pontos base: ${c.points})\n`;
  if (c.type === 'exploit') {
    outputTxt += `Badge: ${badgeInfo.label} | Cor do Badge: ${badgeInfo.color}\n`;
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
  outputTxt += `Bounty Range: ${c.bountyRange} | Bônus Fixo: ${c.flatBountyBonus}\n`;
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

fs.writeFileSync('analise_textual_cartas_completa.txt', outputTxt, 'utf-8');
console.log('Extração detalhada concluída! Arquivo gerado: analise_textual_cartas_completa.txt');
