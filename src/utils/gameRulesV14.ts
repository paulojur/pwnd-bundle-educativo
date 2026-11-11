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
  { value: 13500, label: '$13.5k', icon: '🐝🛒', effectDescription: 'Ganhe 1 Token de Reputação (🐝) e compre 1 carta do Main Deck' },
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

export interface ScopeCheckOptions {
  scopeExpansion?: boolean;
  wafBlocked?: boolean;
  twoFaBlocked?: boolean;
  exploitBlocked?: boolean;
}

/**
 * Validação Canônica de Escopo (Manual V1.4 Seção 03 & 06)
 * - Identifica 'ALL' e 'TODAS AS CLASSES (ALL)'
 * - Aplica regra 'Volume Puro' do Bug Hunter (apenas Comum e Incomum)
 * - Aplica 'Escopo Livre' do Red Teamer
 * - Aplica Tools Passivas: Endpoint Lab (T-04 -> BAC) e Injection Lab (T-08 -> INJ)
 * - Aplica Habilidade Especial: CORINGA DE ESCOPO (#INJ-12, #BAC-11)
 * - Aplica Eventos de Rodada/Turno: Out of Scope!, Scope Expansion!, WAF Deployed! (INJ), 2FA Enforced! (AUTH)
 */
export const checkCardScopeV14 = (
  card: CardV2,
  program: ProgramCard | null,
  archetype?: Archetype,
  activeTools: CardV2[] = [],
  options: ScopeCheckOptions = {}
): ScopeCheckResult => {
  if (card.type !== 'exploit') {
    return {
      inScope: true,
      badgeLabel: card.type === 'tool' ? `🧰 TOOL (${card.toolType || 'TÁTICA'})` : '🛡️ SAFEGUARD',
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

  if (options.exploitBlocked) {
    return {
      inScope: false,
      badgeLabel: '⛔ OUT OF SCOPE! (EVENTO)',
      badgeColor: '#B91C1C',
      rejectionReason: 'Evento Out of Scope! ativo: você está impedido de realizar a ação Exploit neste turno.'
    };
  }

  const cardRarity = (card.rarity || '').toLowerCase();
  const cardClass = (card.vulnClass || '').toUpperCase();
  const baseId = (card.canonicalId || card.id || '').toUpperCase();

  // Bloqueios globais de Eventos de Rodada (WAF Deployed! e 2FA Enforced!)
  if (options.wafBlocked && cardClass === 'INJ') {
    return {
      inScope: false,
      badgeLabel: '🛡️ WAF DEPLOYED! [INJ BLOQUEADO]',
      badgeColor: '#B91C1C',
      rejectionReason: 'Evento WAF Deployed! ativo na rodada: vulnerabilidades da classe INJ não podem ser baixadas!'
    };
  }
  if (options.twoFaBlocked && cardClass === 'AUTH') {
    return {
      inScope: false,
      badgeLabel: '🔐 2FA ENFORCED! [AUTH BLOQUEADO]',
      badgeColor: '#B91C1C',
      rejectionReason: 'Evento 2FA Enforced! ativo na rodada: vulnerabilidades da classe AUTH não podem ser baixadas!'
    };
  }

  // 1. Regra de Arquétipo: Bug Hunter (Volume Puro - manual V1.4 linhas 716-726)
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

  const allowed = program.allowedClasses;

  // 2. Checagem Nativa do Programa: Escopo Amplo / Todas as Classes (ex: ShopAll Global, EduConnect)
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

  // 3. Checagem Nativa do Programa: Classes Específicas (comparação estrita por vulnClass)
  const isClassMatch = Boolean(
    cardClass &&
    Array.isArray(allowed) &&
    allowed.some(cat => String(cat).trim().toUpperCase() === cardClass)
  );

  if (isClassMatch) {
    return {
      inScope: true,
      badgeLabel: `🎯 NO ESCOPO [${cardClass}]`,
      badgeColor: '#166534'
    };
  }

  // 4. Habilidade Especial da Vulnerabilidade: CORINGA DE ESCOPO (#INJ-12, #BAC-11)
  const descUpper = ((card.simpleDescription || '') + ' ' + (card.ptDescription || '')).toUpperCase();
  if (baseId === 'INJ-12' || baseId === 'BAC-11' || descUpper.includes('CORINGA DE ESCOPO') || descUpper.includes('IGNORA O ESCOPO')) {
    return {
      inScope: true,
      badgeLabel: `🃏 CORINGA DE ESCOPO [${cardClass}]`,
      badgeColor: '#059669'
    };
  }

  // 5. Tools Passivas Fura-Escopo: Endpoint Lab (T-04 -> BAC) e Injection Lab (T-08 -> INJ)
  const hasEndpointLab = activeTools.some(t => (t.toolId || t.id).startsWith('T-04') || t.name.includes('Endpoint Lab'));
  if (hasEndpointLab && cardClass === 'BAC') {
    return {
      inScope: true,
      badgeLabel: `🚀 ENDPOINT LAB [BAC LIBERADO]`,
      badgeColor: '#0284C7'
    };
  }

  const hasInjectionLab = activeTools.some(t => (t.toolId || t.id).startsWith('T-08') || t.name.includes('Injection Lab'));
  if (hasInjectionLab && cardClass === 'INJ') {
    return {
      inScope: true,
      badgeLabel: `🛢️ INJECTION LAB [INJ LIBERADO]`,
      badgeColor: '#0284C7'
    };
  }

  // 6. Evento Scope Expansion! (evt-08)
  if (options.scopeExpansion) {
    return {
      inScope: true,
      badgeLabel: `🌐 SCOPE EXPANSION [${cardClass || 'OK'}]`,
      badgeColor: '#0284C7'
    };
  }

  // 7. Regra de Arquétipo: Red Teamer (Sem Limites)
  if (archetype?.id === 'red-teamer') {
    return {
      inScope: true,
      badgeLabel: `🎯 RED TEAM [${cardClass || 'OK'}]`,
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


