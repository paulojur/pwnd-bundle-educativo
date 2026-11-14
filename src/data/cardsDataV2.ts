import { ALL_ACTION_CARDS } from './full80DeckData';

export interface CardV2 {
  id: string;
  canonicalId?: string;
  name: string;
  enName?: string;
  technicalReference: string;
  type: 'exploit' | 'tool' | 'defuse';
  points: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
  simpleDescription: string;
  ptDescription?: string;
  shortFlavor?: string;
  toolId?: string;
  toolType?: 'PASSIVA' | 'ATIVA';
  toolMoment?: string;
  cvssValue?: number;
  maxCharges?: number;
  charges?: number;
  isNoisy?: boolean;
  vulnClass?: string;
}

export const getClassBadgeInfo = (id: string = '', techRef: string = '', name: string = '', explicitClass?: string) => {
  const prefix = id.split('-')[0].toLowerCase();
  
  const getByKeyword = () => {
    if (explicitClass) return explicitClass.toUpperCase();
    const ref = (techRef + ' ' + name).toLowerCase();
    if (ref.includes('injection') || ref.includes('sqli') || ref.includes('xxe') || ref.includes('ssti') || ref.includes('command')) return 'INJ';
    if (ref.includes('access') || ref.includes('idor') || ref.includes('bola') || ref.includes('traversal') || ref.includes('cors') || ref.includes('bfla') || ref.includes('privesc')) return 'BAC';
    if (ref.includes('scripting') || ref.includes('xss') || ref.includes('dom')) return 'XSS';
    if (ref.includes('auth') || ref.includes('jwt') || ref.includes('stuffing') || ref.includes('session') || ref.includes('oauth') || ref.includes('mfa')) return 'AUTH';
    if (ref.includes('ssrf') || ref.includes('csrf') || ref.includes('gopher') || ref.includes('metadata')) return 'SSRF';
    if (ref.includes('logic') || ref.includes('race') || ref.includes('coupon') || ref.includes('price') || ref.includes('rounding') || ref.includes('overflow')) return 'LOGIC';
    if (ref.includes('crypt') || ref.includes('hash') || ref.includes('md5') || ref.includes('cipher') || ref.includes('oracle') || ref.includes('ecb')) return 'CRYPTO';
    return 'SPECIAL';
  };

  let code = explicitClass ? explicitClass.toUpperCase() : '';
  
  if (!code) {
    if (prefix === 'inj') code = 'INJ';
    else if (prefix === 'bac') code = 'BAC';
    else if (prefix === 'xss') code = 'XSS';
    else if (prefix === 'auth') code = 'AUTH';
    else if (prefix === 'ssrf') code = 'SSRF';
    else if (prefix === 'logic') code = 'LOGIC';
    else if (prefix === 'crypto') code = 'CRYPTO';
    else code = getByKeyword();
  }
  else if (prefix === 'bl') code = 'LOGIC';
  else if (prefix === 'crypto') code = 'CRYPTO';
  else if (prefix === 'leg') code = 'LEGENDARY';
  else code = getByKeyword(); // Fallback for unknown prefixes

  const keywordCode = getByKeyword();
  if (code !== keywordCode && ['inj', 'bac', 'xss', 'auth', 'ssrf', 'bl', 'crypto', 'leg'].includes(prefix)) {
    console.warn(`[PWND] Carta ${id}: Classe determinística é ${code}, mas heurística detectou ${keywordCode}.`);
  }

  if (code === 'INJ') return { code: 'INJ', label: 'INJECTION', color: '#C2410C', bg: '#FFEDD5' };
  if (code === 'BAC') return { code: 'BAC', label: 'ACCESS CTRL', color: '#6B21A8', bg: '#F3E8FF' };
  if (code === 'XSS') return { code: 'XSS', label: 'XSS', color: '#9D174D', bg: '#FCE7F3' };
  if (code === 'AUTH') return { code: 'AUTH', label: 'AUTHENTICATION', color: '#92400E', bg: '#FEF3C7' };
  if (code === 'SSRF') return { code: 'SSRF', label: 'SSRF / CSRF', color: '#0369A1', bg: '#E0F2FE' };
  if (code === 'LOGIC') return { code: 'LOGIC', label: 'BIZ LOGIC', color: '#0F766E', bg: '#CCFBF1' };
  if (code === 'CRYPTO') return { code: 'CRYPTO', label: 'CRYPTOGRAPHY', color: '#15803D', bg: '#DCFCE7' };
  
  return { code: 'LEGENDARY', label: 'LEGENDARY RCE', color: '#3730A3', bg: '#E0E7FF' };
};

// EXPORTAÇÃO DO BARALHO OFICIAL COMPLETO DE 95 CARTAS DE AÇÃO (80 VULNERABILIDADES + 12 TOOLS + 3 DEFUSES)
export const CARDS_V2: CardV2[] = ALL_ACTION_CARDS;
