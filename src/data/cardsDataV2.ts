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

  if (code === 'INJ') return { code: 'INJ', label: 'INJECTION', color: '#f0883e', bg: 'rgba(240, 136, 62, 0.2)' };
  if (code === 'BAC') return { code: 'BAC', label: 'ACCESS CTRL', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.2)' };
  if (code === 'XSS') return { code: 'XSS', label: 'XSS', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.2)' };
  if (code === 'AUTH') return { code: 'AUTH', label: 'AUTHENTICATION', color: '#eab308', bg: 'rgba(234, 179, 8, 0.2)' };
  if (code === 'SSRF') return { code: 'SSRF', label: 'SSRF / CSRF', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' };
  if (code === 'LOGIC') return { code: 'LOGIC', label: 'BIZ LOGIC', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' };
  if (code === 'CRYPTO') return { code: 'CRYPTO', label: 'CRYPTOGRAPHY', color: '#39d353', bg: 'rgba(57, 211, 83, 0.2)' };
  
  return { code: 'LEGENDARY', label: 'LEGENDARY RCE', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' };
};

// EXPORTAÇÃO DO BARALHO OFICIAL COMPLETO DE 95 CARTAS DE AÇÃO (80 VULNERABILIDADES + 12 TOOLS + 3 DEFUSES)
export const CARDS_V2: CardV2[] = ALL_ACTION_CARDS;
