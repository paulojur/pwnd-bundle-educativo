import * as fs from 'fs';
import { ALL_ACTION_CARDS } from './src/data/full80DeckData.ts';
import { PROGRAM_CARDS, ARCHETYPES } from './src/data/cardsData.ts';
import { FULL_23_EVENTS } from './src/data/full23EventsData.ts';
import { getClassBadgeInfo } from './src/data/cardsDataV2.ts';

// Logic exactly from PrintAndPlayModal.tsx
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

const getRarityBorderColor = (rarity?: string) => {
  switch (rarity) {
    case 'Common': return '#808080'; // Cinza
    case 'Uncommon': return '#27AE60'; // Verde
    case 'Rare': return '#2196F3'; // Azul
    case 'Epic': return '#9B59B6'; // Roxa
    case 'Legendary': return '#F1C40F'; // Dourada
    default: return '#808080';
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

const mirroredActionCards = ALL_ACTION_CARDS.map(card => {
  const pnpBadge = getPnPBadgeProps((card as any).vulnClass, card.id);
  const pnpLeftBorder = card.type === 'exploit' ? getRarityBorderColor(card.rarity) : 'none';
  const cvss = card.type === 'exploit' ? getSimulatedCVSS(card.rarity, card.id) : null;
  const flatValue = getFlatValueLabel(card);
  
  // Auditing fields
  const expectedClassInfo = getClassBadgeInfo(card.id, card.technicalReference, card.name);

  return {
    ...card,
    pnpRenderedCVSS: cvss,
    pnpRenderedBadgeLabel: pnpBadge.label,
    pnpRenderedBadgeColor: pnpBadge.color,
    pnpRenderedLeftBorder: pnpLeftBorder,
    pnpRenderedFlatValue: flatValue,
    audit_expectedBadgeLabel: expectedClassInfo.label,
    audit_expectedBadgeColor: expectedClassInfo.color
  };
});

const output = {
  actionCards: mirroredActionCards,
  programCards: PROGRAM_CARDS,
  archetypes: ARCHETYPES,
  eventCards: FULL_23_EVENTS
};

fs.writeFileSync('C:/Users/paulo/.gemini/antigravity-ide/brain/8514dabd-0f28-48cd-851a-1618bf6c8898/todas_as_cartas_espelho_pnp.json', JSON.stringify(output, null, 2));
console.log('JSON gerado.');
