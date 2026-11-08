/**
 * PWNED! Bug Bounty Chaos — Canonical Game Rules Engine (Manual V1.4)
 */
import { CardV2 } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';

export interface PatchSpeedResult {
  mode: 'NOISY' | 'STEALTH';
  dice: number[]; // 2 dice for noisy, 3 dice for stealth
  discardedDie?: number; // Highest die dropped in stealth mode
  evaluatedSum: number;
  threshold: number; // 10, 9, 8, 7
  patchSpeed: 'Lenta' | 'Moderada' | 'Rápida' | 'Extrema';
  patchDeployed: boolean;
}

export const PATCH_THRESHOLDS: Record<'Lenta' | 'Moderada' | 'Rápida' | 'Extrema', number> = {
  Lenta: 10,
  Moderada: 9,
  Rápida: 8,
  Extrema: 7,
};

export const getPatchThreshold = (speed: string): number => {
  if (speed.includes('Lenta')) return 10;
  if (speed.includes('Moderada')) return 9;
  if (speed.includes('Rápida')) return 8;
  if (speed.includes('Extrema')) return 7;
  return 9; // default fallback
};

/**
 * Executes a Patch Speed Check in accordance with Section 04:
 * - NOISY: 2D6 rolled and summed.
 * - STEALTH: 3D6 rolled, highest discarded, lowest 2 summed.
 */
export const rollPatchSpeedCheck = (
  patchSpeed: 'Lenta' | 'Moderada' | 'Rápida' | 'Extrema',
  isNoisy: boolean,
  fixedDice?: number[]
): PatchSpeedResult => {
  const threshold = PATCH_THRESHOLDS[patchSpeed] || 9;

  if (isNoisy) {
    const d1 = fixedDice && fixedDice.length >= 2 ? fixedDice[0] : Math.floor(Math.random() * 6) + 1;
    const d2 = fixedDice && fixedDice.length >= 2 ? fixedDice[1] : Math.floor(Math.random() * 6) + 1;
    const evaluatedSum = d1 + d2;
    return {
      mode: 'NOISY',
      dice: [d1, d2],
      evaluatedSum,
      threshold,
      patchSpeed,
      patchDeployed: evaluatedSum >= threshold
    };
  } else {
    // Stealth: 3D6, drop highest
    const d1 = fixedDice && fixedDice.length >= 3 ? fixedDice[0] : Math.floor(Math.random() * 6) + 1;
    const d2 = fixedDice && fixedDice.length >= 3 ? fixedDice[1] : Math.floor(Math.random() * 6) + 1;
    const d3 = fixedDice && fixedDice.length >= 3 ? fixedDice[2] : Math.floor(Math.random() * 6) + 1;

    const dice = [d1, d2, d3];
    // Find highest die to discard
    let maxIdx = 0;
    if (dice[1] > dice[maxIdx]) maxIdx = 1;
    if (dice[2] > dice[maxIdx]) maxIdx = 2;

    const discardedDie = dice[maxIdx];
    const keptDice = dice.filter((_, idx) => idx !== maxIdx);
    // If duplicates existed, ensure we only kept exactly 2 dice
    const actualKept = keptDice.length === 2 ? keptDice : [dice[(maxIdx + 1) % 3], dice[(maxIdx + 2) % 3]];
    const evaluatedSum = actualKept[0] + actualKept[1];

    return {
      mode: 'STEALTH',
      dice: [d1, d2, d3],
      discardedDie,
      evaluatedSum,
      threshold,
      patchSpeed,
      patchDeployed: evaluatedSum >= threshold
    };
  }
};

/**
 * Milestone positions on the 0-40k Bounty Track
 */
export interface BountyMilestone {
  value: number;
  label: string;
  icon: string;
  effectDescription: string;
}

export const BOUNTY_MILESTONES: BountyMilestone[] = [
  { value: 4500, label: '$4.5k', icon: '🐝', effectDescription: 'Ganhe 1 Token de Reputação (🐝)' },
  { value: 9000, label: '$9.0k', icon: '🐞', effectDescription: 'Receba 1 Token de Alerta (🐞)' },
  { value: 13500, label: '$13.5k', icon: '🐝🛒', effectDescription: 'Ganhe 1 Token de Reputação (🐝) e compre 1 Tool' },
  { value: 19000, label: '$19.0k', icon: '🐞🗂️−', effectDescription: 'Receba 1 Token de Alerta (🐞) e descarte 1 carta da mão' },
  { value: 24500, label: '$24.5k', icon: '🛠️⚡', effectDescription: 'Instale 1 Tool imediatamente sem custo de descarte' },
  { value: 29000, label: '$29.0k', icon: '🐝🐞−', effectDescription: 'Ganhe 1 Token de Reputação (🐝) e remova 1 Token de Alerta' },
  { value: 33500, label: '$33.5k', icon: '💸', effectDescription: 'Penalidade: perca $1.500 na Bounty Track' },
  { value: 38000, label: '$38.0k', icon: '🐞', effectDescription: 'Receba 1 Token de Alerta (🐞)' },
  { value: 40000, label: '$40.0k', icon: '🏆', effectDescription: 'Meta de Vitória Atingida!' }
];

export const TOTAL_SUPPLY_TOKENS = {
  ALERTA: 18,
  REPUTACAO: 18,
  MAX_ROUNDS: 8,
  WINNING_BOUNTY: 40000
};

export const roundTo500 = (val: number): number => Math.floor(val / 500) * 500;

export interface ScopeCheckResult {
  inScope: boolean;
  badgeLabel: string;
  badgeColor: string;
  rejectionReason?: string;
}

/**
 * Validação Canônica de Escopo (Manual V1.4 Seção 03 & 06)
 * - Identifica 'ALL' e 'TODAS AS CLASSES (ALL)'
 * - Aplica regra 'Volume Puro' do Bug Hunter (apenas Comum e Incomum)
 * - Aplica 'Escopo Livre' do Red Teamer
 * - Checa siglas canônicas: INJ, BAC, XSS, AUTH, SSRF, LOGIC, CRYPTO, APT
 */
export const checkCardScopeV14 = (
  card: CardV2,
  program: ProgramCard | null,
  archetype?: Archetype
): ScopeCheckResult => {
  if (card.type !== 'exploit') {
    return {
      inScope: true,
      badgeLabel: card.type === 'tool' ? '🧰 FERRAMENTA' : '🛡️ Safeguard',
      badgeColor: card.type === 'tool' ? '#0369A1' : '#166534'
    };
  }

  if (!program) {
    return {
      inScope: false,
      badgeLabel: '⚠️ SEM PROGRAMA',
      badgeColor: '#B45309',
      rejectionReason: 'Nenhum Programa Corporativo ativo selecionado!'
    };
  }

  const cardRarity = (card.rarity || '').toLowerCase();
  const cardClass = (card.vulnClass || '').toUpperCase();

  // 1. Regra de Arquétipo: Bug Hunter (Volume Puro - manual V1.4 linhas 716-726)
  // "Volume Puro: Você ganha na força bruta, mas o prêmio é menor: só tem permissão pra reportar cartas Comuns e Incomuns."
  if (archetype?.id === 'bug-hunter') {
    if (cardRarity === 'rare' || cardRarity === 'epic' || cardRarity === 'legendary') {
      return {
        inScope: false,
        badgeLabel: '⛔ BUG HUNTER (SÓ COMUM/INCOMUM)',
        badgeColor: '#7C3AED',
        rejectionReason: 'O Bug Hunter (Volume Puro) só tem permissão para explorar cartas Comuns e Incomuns!'
      };
    }
  }

  // 2. Regra de Arquétipo: Red Teamer
  // "Escopo Livre: Pode explorar qualquer classe de vulnerabilidade em qualquer programa"
  if (archetype?.id === 'red-teamer') {
    return {
      inScope: true,
      badgeLabel: `🎯 RED TEAM [${cardClass || 'OK'}]`,
      badgeColor: '#166534'
    };
  }

  const allowed = program.allowedClasses;

  // 3. Checagem de Escopo Amplo / Todas as Classes (ex: ShopAll Global, MegaCorp)
  const isAllClasses = allowed === 'ALL' ||
    (Array.isArray(allowed) && allowed.some(c => {
      const u = String(c).toUpperCase();
      return u === 'ALL' || u.includes('TODAS') || u.includes('ALL');
    }));

  if (isAllClasses) {
    return {
      inScope: true,
      badgeLabel: `🎯 NO ESCOPO [${cardClass || 'ALL'}]`,
      badgeColor: '#166534'
    };
  }

  // 4. Checagem de Classes Específicas
  const cardRef = (card.technicalReference || card.name).toLowerCase();
  const isClassMatch = Array.isArray(allowed) && allowed.some(cat => {
    const catUpper = String(cat).toUpperCase();
    if (cardClass && catUpper === cardClass) return true;
    const catLower = String(cat).toLowerCase();
    return cardRef.includes(catLower) || catLower.includes(cardRef);
  });

  if (isClassMatch) {
    return {
      inScope: true,
      badgeLabel: `🎯 NO ESCOPO [${cardClass || 'OK'}]`,
      badgeColor: '#166534'
    };
  }

  return {
    inScope: false,
    badgeLabel: `❌ FORA DE ESCOPO [${cardClass || 'N/A'}]`,
    badgeColor: '#B91C1C',
    rejectionReason: `A vulnerabilidade "${card.name}" [${cardClass || 'OUTRA'}] não é aceita por [${program.name}].\nEscopo aceito: ${Array.isArray(allowed) ? allowed.join(', ') : allowed}`
  };
};


