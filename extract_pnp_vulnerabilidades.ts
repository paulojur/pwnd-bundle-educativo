import * as fs from 'fs';
import { FULL_80_VULNERABILITIES } from './src/data/full80DeckData';

// Funções determinísticas exatas do motor físico (PrintAndPlayModal.tsx)
const getSimulatedCVSS = (rarity?: string, id?: string): string => {
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

const getPnPBadgeProps = (vulnClass: string | undefined, cardId: string) => {
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
    case 'Injection': return { vulnClass: 'Injection', label: 'INJ', color: '#E67E22' };
    case 'Broken Access Control': return { vulnClass: 'Broken Access Control', label: 'BAC', color: '#4B0082' };
    case 'Cross-Site Scripting': return { vulnClass: 'Cross-Site Scripting', label: 'XSS', color: '#E91E63' };
    case 'Authentication': return { vulnClass: 'Authentication', label: 'AUTH', color: '#F1C40F' };
    case 'SSRF': return { vulnClass: 'SSRF', label: 'SSRF', color: '#2196F3' };
    case 'Business Logic': return { vulnClass: 'Business Logic', label: 'LOGIC', color: '#008080' };
    case 'Cryptography':
    case 'Cryptographic Failures': return { vulnClass: 'Cryptographic Failures', label: 'CRYPTO', color: '#27AE60' };
    case 'Legendary': return { vulnClass: 'Legendary', label: '⚡ LEGENDARY', color: '#B39DDB' };
    default: return { vulnClass: 'Vulnerability', label: 'VULN', color: '#ccc' };
  }
};

const getRarityBorderColor = (rarity?: string): string => {
  switch (rarity) {
    case 'Common': return '#808080'; // Cinza
    case 'Uncommon': return '#27AE60'; // Verde
    case 'Rare': return '#2196F3'; // Azul
    case 'Epic': return '#9B59B6'; // Roxa
    case 'Legendary': return '#F1C40F'; // Dourada
    default: return '#808080';
  }
};

const getBountyPayout = (rarity: string) => {
  switch (rarity) {
    case 'Common': return { value: 1500, label: '+$1.5k' };
    case 'Uncommon': return { value: 2500, label: '+$2.5k' };
    case 'Rare': return { value: 4000, label: '+$4.0k' };
    case 'Epic': return { value: 5000, label: '+$5.0k' };
    case 'Legendary': return { value: 6000, label: '+$6.0k' };
    default: return { value: 1500, label: '+$1.5k' };
  }
};

// Extrai estritamente o que se refere à engine física
const physicalVulnerabilities = FULL_80_VULNERABILITIES.map(card => {
  const badge = getPnPBadgeProps((card as any).vulnClass, card.id);
  const cvss = getSimulatedCVSS(card.rarity, card.id);
  const rarityBorder = getRarityBorderColor(card.rarity);
  const bounty = getBountyPayout(card.rarity);

  return {
    id: card.id,
    name: card.name,
    technicalReference: card.technicalReference,
    vulnClass: badge.vulnClass,
    badgeLabel: badge.label,
    badgeColor: badge.color,
    rarity: card.rarity,
    rarityBorderColor: rarityBorder,
    cvss: parseFloat(cvss),
    bountyValue: bounty.value,
    bountyLabel: bounty.label,
    description: card.simpleDescription,
    ptDescription: card.ptDescription || card.simpleDescription
  };
});

fs.writeFileSync('vulnerabilidades_pnp_fisico.json', JSON.stringify(physicalVulnerabilities, null, 2), 'utf-8');
console.log(`Extração de ${physicalVulnerabilities.length} cartas de vulnerabilidade concluída! Arquivo: vulnerabilidades_pnp_fisico.json`);
