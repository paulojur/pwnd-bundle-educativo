import { ALL_ACTION_CARDS } from './src/data/full80DeckData';
import { getClassBadgeInfo } from './src/data/cardsDataV2';
import * as fs from 'fs';

const EXPECTED_COLORS: Record<string, string> = {
  'INJ': 'rgb(230,126,34)',
  'BAC': 'rgb(75,0,130)',
  'XSS': 'TBD',
  'AUTH': 'TBD',
  'SSRF': 'TBD',
  'LOGIC': 'TBD',
  'CRYPTO': 'TBD',
  'LEGENDARY': 'TBD'
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})` : hex;
}

let report = '# Auditoria do Chip de Classe (80 Vulnerabilities)\n\n';

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}\u{2B50}\u{2B55}\u{1F004}-\u{1F0CF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

// 1. Cobertura
report += '## 1. Cobertura e Fallbacks\n\n';
report += '| ID | Nome | Tech Ref | Classe Detectada | Status (OK/FALLBACK) | Erro/Keyword | Emoji? |\n';
report += '|---|---|---|---|---|---|---|\n';

let gaps = [];
let totalCards = 0;
let fallbackCount = 0;

for (const card of ALL_ACTION_CARDS) {
  if (card.type !== 'exploit') continue; // only vulnerabilities
  totalCards++;
  
  const badge = getClassBadgeInfo(card.id, card.technicalReference, card.name);
  const isFallback = badge.code === 'LEGENDARY'; // Since this is the default return
  
  // Try to determine expected class vs fallback based on some basic terms to find false legendaries
  let status = 'OK';
  let keyword = '';
  
  if (isFallback) {
    const text = (card.technicalReference + ' ' + card.name).toLowerCase();
    if (text.includes('rce') || text.includes('remote code execution') || text.includes('command') || text.includes('deserialization')) {
      status = 'OK (Real Legendary)';
    } else {
      status = 'FALLBACK';
      fallbackCount++;
      // guess keyword based on text
      if (text.includes('prototype')) keyword = 'sugestão: prototype/pollution -> LOGIC/XSS?';
      else if (text.includes('smuggling')) keyword = 'sugestão: smuggling -> INJ?';
      else if (text.includes('xxe')) keyword = 'sugestão: xxe -> INJ';
      else if (text.includes('cors')) keyword = 'sugestão: cors -> BAC';
      else if (text.includes('deserialization')) keyword = 'sugestão: deserialization -> LEGENDARY';
      else keyword = 'Sem match';
      
      gaps.push({ id: card.id, name: card.name, keyword });
    }
  }

  const hasEmoji = emojiRegex.test(badge.label);

  report += `| ${card.id} | ${card.name} | ${card.technicalReference} | ${badge.code} | ${status} | ${keyword} | ${hasEmoji ? '❌ Sim' : '✅ Não'} |\n`;
}

report += `\n**Total VULN Cards:** ${totalCards}\n`;
report += `**Fallbacks Críticos Encontrados:** ${fallbackCount}\n\n`;

// 2. Consistência de Paleta
report += '## 2. Consistência de Paleta (Carta vs Manual Seção 12/16)\n\n';
report += '| Classe | Hex (Código) | RGB Convertido | RGB Esperado (Prompt) | Match? |\n';
report += '|---|---|---|---|---|\n';

const classes = ['INJ', 'BAC', 'XSS', 'AUTH', 'SSRF', 'LOGIC', 'CRYPTO', 'LEGENDARY'];
const dummyCalls = [
  'inj-1', 'bac-1', 'xss-1', 'auth-1', 'ssrf-1', 'bl-1', 'crypto-1', 'leg-1'
];

for (let i = 0; i < classes.length; i++) {
  const badge = getClassBadgeInfo(dummyCalls[i], '', '');
  const rgb = hexToRgb(badge.color);
  const expected = EXPECTED_COLORS[badge.code] || 'Não fornecido explicitamente, verificar manual';
  const match = rgb === expected ? '✅' : '❌ Diferente';
  report += `| ${badge.code} | ${badge.color} | ${rgb} | ${expected} | ${match} |\n`;
}

// 3. Zero Emojis
report += '\n## 3. Zero Emojis\n\n';
const anyEmoji = classes.some((_, i) => emojiRegex.test(getClassBadgeInfo(dummyCalls[i], '', '').label));
report += `Tem emojis nos labels? **${anyEmoji ? 'SIM (FALHOU)' : 'NÃO (OK)'}**\n\n`;

// 4. Sincronia com o manual
report += '## 4. Sincronia com o Manual\n\n';
report += 'O manual na Seção 16 documenta molduras e selos, mas NÃO documenta o layout real do cabeçalho da carta com [CHIP DE CLASSE] [CVSS] [EXPLOIT]. É recomendável adicionar uma linha no manual sobre este layout (NÃO ALTERADO NESTA SESSÃO).\n\n';

fs.writeFileSync('audit_report.md', report);
console.log('Audit complete. Check audit_report.md');
