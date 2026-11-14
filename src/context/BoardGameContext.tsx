import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { CardV2 } from '../data/cardsDataV2';
import {
  V14_VULNERABILITIES,
  V14_TOOLS,
  V14_PROGRAMS,
  V14_EVENTS,
  V14_SAFEGUARDS,
  V14_ARCHETYPES,
  buildCanonicalV14MainDeck,
  buildCanonicalV14ToolDeck,
  CanonicalVulnCard,
  CanonicalToolCard,
  CanonicalSafeguardCard
} from '../data/canonicalV14Data';
import { ServerRegion, SERVERS_DATA } from '../data/boardData';
import { ProgramCard, Archetype } from '../data/cardsData';
import { EventCardData } from '../data/full24EventsData';
import { mpSync } from '../utils/multiplayerSync';
import { supabaseSync, RoomMessage } from '../utils/supabaseSync';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { BOUNTY_MILESTONES, checkCardScopeV14, ScopeCheckOptions } from '../utils/gameRulesV14';

// ─────────────────────────────────────────────────────────────────────────────
// CARD MAPPERS (Canônico V1.4 -> CardV2)
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_ICONS: Record<string, string> = {
  'T-01': '🖥️',
  'T-02': '🔍',
  'T-03': '🛰️',
  'T-04': '🚀',
  'T-05': '🛠️',
  'T-06': '🎯',
  'T-07': '🍳',
  'T-08': '🛢️',
  'T-09': '🧰',
  'T-10': '📡',
  'T-11': '⚡',
  'T-12': '🔐'
};

export const mapCanonicalToCardV2 = (card: any, idx?: number): CardV2 => {
  if (card.category === 'VULNERABILITY') {
    const v = card as CanonicalVulnCard;
    const icon = v.vulnClass === 'INJ' ? '💉' : v.vulnClass === 'BAC' ? '🚪' : v.vulnClass === 'XSS' ? '🪞' : v.vulnClass === 'AUTH' ? '🔑' : v.vulnClass === 'SSRF' ? '🕵️' : v.vulnClass === 'LOGIC' ? '⏰' : v.vulnClass === 'CRYPTO' ? '🔒' : '💎';
    const cvssNum = parseFloat((v.cvss || '').replace(/[^0-9.]/g, '')) || 5.0;

    return {
      id: v.id,
      canonicalId: v.id,
      name: v.name,
      enName: v.name,
      technicalReference: `${v.technicalReference || v.name} (${v.cvss || 'CVSS'})`,
      type: 'exploit',
      points: v.bountyValue > 0 ? v.bountyValue : 1500,
      rarity: (v.rarity.charAt(0).toUpperCase() + v.rarity.slice(1).toLowerCase()) as any,
      icon,
      simpleDescription: v.description,
      ptDescription: v.description,
      shortFlavor: v.shortDesc,
      cvssValue: cvssNum,
      isNoisy: v.isNoisy,
      vulnClass: v.vulnClass
    };
  } else if (card.category === 'TOOL') {
    const t = card as CanonicalToolCard;
    const uniqueSuffix = idx !== undefined ? `copy-${idx}` : Math.random().toString(36).slice(2, 7);
    const fullRuleText = `[${t.toolType}] ${t.description}`;
    return {
      id: `${t.id}-${uniqueSuffix}`,
      canonicalId: t.id,
      toolId: t.id,
      toolType: (t.toolType === 'ATIVA' ? 'ATIVA' : 'PASSIVA'),
      toolMoment: t.moment,
      name: t.name,
      enName: t.name,
      technicalReference: `${t.technicalReference || t.name} • ${t.toolType}`,
      type: 'tool',
      points: 0,
      rarity: 'Common',
      icon: TOOL_ICONS[t.id] || '🛠️',
      simpleDescription: fullRuleText,
      ptDescription: fullRuleText,
      shortFlavor: t.shortDesc
    };
  } else {
    const s = card as CanonicalSafeguardCard;
    return {
      id: idx !== undefined ? `${s.id}-${idx}` : s.id,
      canonicalId: s.id,
      name: s.name,
      enName: s.name,
      technicalReference: s.technicalReference || s.name,
      type: 'defuse',
      points: 0,
      rarity: 'Rare',
      icon: s.name.includes('CVE') ? '📜' : '🛡️',
      simpleDescription: s.description,
      ptDescription: s.description
    };
  }
};

export const CANONICAL_PROGRAMS: ProgramCard[] = V14_PROGRAMS.map(p => ({
  id: p.id,
  name: p.name,
  companyType: p.companyType,
  allowedClasses: p.allowedClasses as any,
  patchSpeed: p.patchSpeed as any,
  bountyRange: p.bonusBounty,
  flatBountyBonus: p.bonusBountyValue,
  description: p.description,
  ptDescription: p.description
}));

export const CANONICAL_ARCHETYPES: Archetype[] = V14_ARCHETYPES.map(a => ({
  id: a.id,
  name: a.name,
  title: a.title,
  ptTitle: a.title,
  presentation: a.description,
  ptPresentation: a.description,
  playstyle: a.description,
  ptPlaystyle: a.description,
  maxHandSize: a.name.includes('Old Guard') ? 8 : 6,
  reportsPerTurn: 1,
  bountyModifier: a.name.includes('Red Teamer') ? 0.7 : 1.0,
  specialPowers: [a.abilityName],
  ptSpecialPowers: [a.abilityName],
  avatarIcon: a.name.includes('n00b') ? '🌱' : a.name.includes('Old Guard') ? '🧠' : a.name.includes('Bug Hunter') ? '🎯' : a.name.includes('Social Engineer') ? '🎭' : a.name.includes('Red Teamer') ? '⚔️' : '🛡️',
  color: a.name.includes('n00b') ? '#39d353' : a.name.includes('Old Guard') ? '#a855f7' : a.name.includes('Bug Hunter') ? '#f59e0b' : a.name.includes('Social Engineer') ? '#ec4899' : a.name.includes('Red Teamer') ? '#ef4444' : '#06b6d4'
}));

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS E MODELO DE JOGADOR MULTIPLAYER & AUDITORIA DO OBSERVADOR
// ─────────────────────────────────────────────────────────────────────────────
export type PlayerRoleId = 'player-1' | 'player-2' | 'player-3' | 'player-4' | 'player-5' | 'player-6';

export interface PlayerTurnStatus {
  noExploitNextTurn?: boolean;      // evt-03: Out of Scope!
  noReportNextTurn?: boolean;       // evt-04: Legal Threat!
  noToolsNextTurn?: boolean;        // evt-05: Triage Delay!
  scopeExpansionNextTurn?: boolean; // evt-08: Scope Expansion!
  noReconNextTurn?: boolean;        // evt-18: Rate Limited!
  hallOfFameBonus?: number;         // evt-17: Hall of Fame Update! (+$1.500 no próximo Report)
  redirectUsedThisRound?: boolean;  // Social Engineer: Caos Redirecionado (1x/rodada)
}

export interface PlayerState {
  id: PlayerRoleId;
  name: string;
  color: string;
  archetype: Archetype;
  hand: CardV2[];
  activeTools: CardV2[];
  activeProgram: ProgramCard | null;
  safeguardSlot: CardV2 | null;
  cveProtection: CardV2 | null;
  alertaTokens: number;
  reputacaoTokens: number;
  score: number;
  actionsRemaining: number;
  statusEffects?: PlayerTurnStatus;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  round: number;
  playerId?: PlayerRoleId;
  playerName?: string;
  archetypeName?: string;
  category: 'SETUP' | 'PROGRAM' | 'RECON' | 'EXPLOIT' | 'REPORT' | 'PATCH' | 'TOOL' | 'EVENT' | 'ALERT' | 'ARCHETYPE' | 'TURN';
  title: string;
  details: string;
  status?: 'EXECUTED' | 'BLOCKED' | 'PASSIVE' | 'PENALTY';
}

export interface PlayerMetrics {
  reportsCompleted: number;
  totalBountyEarned: number;
  patchesSuffered: number;
  bypassUsed: number;
  alertsReceived: number;
  criticalAlarmPenalties: number;
  toolsInstalled: number;
  toolsActivatedOrTriggered: number;
  archetypeTriggers: number;
  archetypeBountyBonus: number;
  programsPickedMarket: number;
  programsPickedSurpriseDeck: number;
  eventsDrawn: number;
}

export interface RoundActiveEvent {
  id: string;
  name: string;
  simpleDescription: string;
  startedByRole: PlayerRoleId;
  startedAtRound: number;
}

export interface DeckPeekState {
  mode: 'fuzzStorm' | 'hexKitchen' | 'noobTool' | 'panoptico';
  title: string;
  subtitle: string;
  cards: { id: string; name: string; description: string; raw: any }[];
}

export interface PendingTargetedEvent {
  eventCard: EventCardData;
  targets: { id: PlayerRoleId; name: string; archetypeName: string; score: number; handCount: number; exploitsCount: number }[];
}

const createEmptyMetrics = (): Record<PlayerRoleId, PlayerMetrics> => ({
  'player-1': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 },
  'player-2': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 },
  'player-3': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 },
  'player-4': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 },
  'player-5': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 },
  'player-6': { reportsCompleted: 0, totalBountyEarned: 0, patchesSuffered: 0, bypassUsed: 0, alertsReceived: 0, criticalAlarmPenalties: 0, toolsInstalled: 0, toolsActivatedOrTriggered: 0, archetypeTriggers: 0, archetypeBountyBonus: 0, programsPickedMarket: 0, programsPickedSurpriseDeck: 0, eventsDrawn: 0 }
});

let auditSeqCounter = 1;

const mergeAuditLogs = (existing: AuditLogEntry[], incoming: AuditLogEntry[]): AuditLogEntry[] => {
  const map = new Map<string, AuditLogEntry>();
  let setupEntry: AuditLogEntry | null = null;

  for (const item of [...incoming, ...existing]) {
    if (!item || !item.id) continue;
    const isSetup = item.category === 'SETUP' || item.id.startsWith('0000000000000') || item.id.startsWith('init-');
    if (isSetup) {
      if (!setupEntry) {
        setupEntry = { ...item, id: '0000000000000-init-setup' };
      }
      continue;
    }
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  if (setupEntry) {
    map.set(setupEntry.id, setupEntry);
  }

  return Array.from(map.values()).sort((a, b) => {
    const isInitA = a.id.startsWith('0000000000000') || a.id.startsWith('init-');
    const isInitB = b.id.startsWith('0000000000000') || b.id.startsWith('init-');
    if (isInitA && !isInitB) return 1;
    if (!isInitA && isInitB) return -1;
    return b.id.localeCompare(a.id);
  });
};

const mergePlayerMetrics = (
  local: Record<PlayerRoleId, PlayerMetrics>,
  remote: Record<PlayerRoleId, PlayerMetrics>
): Record<PlayerRoleId, PlayerMetrics> => {
  const roles: PlayerRoleId[] = ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'];
  const empty = createEmptyMetrics();
  const result = { ...empty };
  for (const r of roles) {
    const a = local?.[r] || empty[r];
    const b = remote?.[r] || empty[r];
    result[r] = {
      reportsCompleted: Math.max(a.reportsCompleted, b.reportsCompleted),
      totalBountyEarned: Math.max(a.totalBountyEarned, b.totalBountyEarned),
      patchesSuffered: Math.max(a.patchesSuffered, b.patchesSuffered),
      bypassUsed: Math.max(a.bypassUsed, b.bypassUsed),
      alertsReceived: Math.max(a.alertsReceived, b.alertsReceived),
      criticalAlarmPenalties: Math.max(a.criticalAlarmPenalties, b.criticalAlarmPenalties),
      toolsInstalled: Math.max(a.toolsInstalled, b.toolsInstalled),
      toolsActivatedOrTriggered: Math.max(a.toolsActivatedOrTriggered, b.toolsActivatedOrTriggered),
      archetypeTriggers: Math.max(a.archetypeTriggers, b.archetypeTriggers),
      archetypeBountyBonus: Math.abs(b.archetypeBountyBonus) >= Math.abs(a.archetypeBountyBonus) ? b.archetypeBountyBonus : a.archetypeBountyBonus,
      programsPickedMarket: Math.max(a.programsPickedMarket, b.programsPickedMarket),
      programsPickedSurpriseDeck: Math.max(a.programsPickedSurpriseDeck, b.programsPickedSurpriseDeck),
      eventsDrawn: Math.max(a.eventsDrawn, b.eventsDrawn)
    };
  }
  return result;
};

export const SEAT_COLOR_LABELS: Record<PlayerRoleId, { defaultName: string; colorLabel: string }> = {
  'player-1': { defaultName: 'Jogador 1 (Verde)', colorLabel: 'Verde' },
  'player-2': { defaultName: 'Jogador 2 (Azul)', colorLabel: 'Azul' },
  'player-3': { defaultName: 'Jogador 3 (Roxo)', colorLabel: 'Roxo' },
  'player-4': { defaultName: 'Jogador 4 (Rosa)', colorLabel: 'Rosa' },
  'player-5': { defaultName: 'Jogador 5 (Laranja)', colorLabel: 'Laranja' },
  'player-6': { defaultName: 'Jogador 6 (Ciano)', colorLabel: 'Ciano' }
};

export const formatPlayerName = (role: PlayerRoleId, customNick?: string): string => {
  const info = SEAT_COLOR_LABELS[role];
  const clean = (customNick || '').trim();
  if (!clean) return info.defaultName;
  if (clean.includes(`(${info.colorLabel})`)) return clean;
  return `${clean} (${info.colorLabel})`;
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL GAME FACTORY (Arquétipos e Programas sorteados randomicamente)
// ─────────────────────────────────────────────────────────────────────────────
const createInitialGameState = (count: number = 2, customNames?: Partial<Record<PlayerRoleId, string>>) => {
  const canonical84 = buildCanonicalV14MainDeck().map((c, i) => mapCanonicalToCardV2(c, i));
  const shuffledMain = shuffleArray(canonical84);

  const bypassTemplate = mapCanonicalToCardV2(
    V14_SAFEGUARDS.find(s => s.name.includes('Bypass')) || V14_SAFEGUARDS[0]
  );

  // Tool Deck: 48 cartas com IDs únicos por cópia
  const shuffledTools = shuffleArray(buildCanonicalV14ToolDeck().map((c, i) => mapCanonicalToCardV2(c, i)));

  // Event Deck: 24 cartas
  const eventCardsFormatted: EventCardData[] = V14_EVENTS.map((e, idx) => ({
    id: e.id,
    number: String(idx + 1).padStart(2, '0'),
    name: e.title,
    enName: e.title,
    technicalReference: e.subtitle || e.title,
    icon: '🚨',
    targetText: e.moment || 'Mesa',
    simpleDescription: e.description,
    ptDescription: e.description,
    effectType: 'patch'
  }));
  const shuffledEvents = shuffleArray(eventCardsFormatted);

  // Arquétipos: sorteio aleatório a cada partida/reinício (Manual §02)
  const shuffledArchetypes = shuffleArray([...CANONICAL_ARCHETYPES]);

  // Program Deck (36 cartas = 18 empresas x 2 cópias):
  // - 1 carta entregue inicialmente para cada jogador ativo (0..count-1)
  // - 3 cartas reveladas no Program Market
  // - Restante forma o Program Deck fechado para compras surpresa ou reposição
  const shuffledPrograms = shuffleArray([...CANONICAL_PROGRAMS]);
  const playerInitialPrograms = shuffledPrograms.slice(0, count);
  const market = shuffledPrograms.slice(count, count + 3);
  const programDeck = shuffledPrograms.slice(count + 3);

  const seatDefs: { id: PlayerRoleId; name: string; color: string }[] = [
    { id: 'player-1', name: 'Jogador 1 (Verde)', color: '#16A34A' },
    { id: 'player-2', name: 'Jogador 2 (Azul)', color: '#2563EB' },
    { id: 'player-3', name: 'Jogador 3 (Roxo)', color: '#9333EA' },
    { id: 'player-4', name: 'Jogador 4 (Rosa)', color: '#DB2777' },
    { id: 'player-5', name: 'Jogador 5 (Laranja)', color: '#D97706' },
    { id: 'player-6', name: 'Jogador 6 (Ciano)', color: '#0891B2' }
  ];

  const playersInitial = {} as Record<PlayerRoleId, PlayerState>;
  seatDefs.forEach((seat, idx) => {
    const isSeatActive = idx < count;
    playersInitial[seat.id] = {
      id: seat.id,
      name: customNames?.[seat.id] || seat.name,
      color: seat.color,
      archetype: shuffledArchetypes[idx] || CANONICAL_ARCHETYPES[idx],
      hand: isSeatActive ? shuffledMain.slice(idx * 5, (idx + 1) * 5) : [],
      activeTools: [],
      activeProgram: isSeatActive ? (playerInitialPrograms[idx] || null) : null,
      safeguardSlot: { ...bypassTemplate, id: `bypass-p${idx + 1}` },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3,
      statusEffects: {}
    };
  });

  const remainingMain = shuffledMain.slice(5 * count);

  const setupSummary = seatDefs
    .slice(0, count)
    .map(s => `${playersInitial[s.id].name}: [${playersInitial[s.id].archetype.name}] c/ alvo [${playersInitial[s.id].activeProgram?.name}]`)
    .join(' | ');

  const initialAuditLog: AuditLogEntry = {
    id: '0000000000000-init-setup',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
    round: 1,
    category: 'SETUP',
    title: `Partida Iniciada (${count} Jogadores) — Arquétipos e Programas Sorteados`,
    details: `${setupSummary}. Mercado exposto: [${market.map(m => m.name).join(', ')}] (${programDeck.length} no Program Deck).`,
    status: 'EXECUTED'
  };

  return {
    playersInitial,
    remainingMain,
    shuffledTools,
    shuffledEvents,
    market,
    programDeck,
    initialAuditLog
  };
};

export interface DeployedExploit {
  id: string;
  nodeId: string;
  card: CardV2;
  playerId: string;
}

export interface BountyTransaction {
  id: string;
  turn: number;
  type: 'Report' | 'Event' | 'Penalty';
  description: string;
  amount: number;
  mathBreakdown: string;
}

interface BoardGameContextType {
  playerNodeId: string;
  playerHand: CardV2[];
  playerActiveTools: CardV2[];
  playerActiveProgram: ProgramCard | null;
  playerArchetype: Archetype;
  playerSafeguardSlot: CardV2 | null;
  playerCveProtection: CardV2 | null;
  mainDeckCount: number;
  toolDeckCount: number;
  eventDeckCount: number;
  programDeckCount: number;
  programMarket: ProgramCard[];
  playerScore: number;
  bountyTotalCash: number;
  gameWinner: string | null;
  awaitingProgramPick: boolean;
  programPickReason: string | null;
  duelRotationsRemaining: number;
  freeExploitDeploysRemaining: number;
  dynamicMaxHandSize: number;
  currentScopeOptions: ScopeCheckOptions;
  activeRoundEvents: RoundActiveEvent[];
  playerActiveEventsList: { id: string; name: string; simpleDescription: string }[];
  servers: ServerRegion[];
  deployedExploits: DeployedExploit[];
  bots: any[];
  currentTurn: number;
  bountyLedger: BountyTransaction[];
  needsDiscard: boolean;
  recycledThisTurn: boolean;
  pendingToolInstall: CardV2 | null;
  actionsRemaining: number;

  alertaTokens: number;
  reputacaoTokens: number;
  useReputacaoReroll: () => boolean;
  addAlertaToken: (count?: number) => void;
  removeAlertaToken: (count?: number) => void;
  addReputacaoToken: (count?: number) => void;

  activePlayerRole: PlayerRoleId;
  myRole: PlayerRoleId;
  isMyTurn: boolean;
  gameMode: 'solo' | 'hotseat' | 'lan';
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  playerCount: number;
  setPlayerCount: (count: number) => void;

  allPlayers: PlayerState[];
  currentPlayer: PlayerState;

  isSetupWizardOpen: boolean;
  activeEventCard: EventCardData | null;
  lastEventResolutionSummary: string | null;
  pendingTargetedEvent: PendingTargetedEvent | null;
  resolveTargetedEvent: (targetPlayerId: string) => void;

  pendingDeckPeek: DeckPeekState | null;
  resolveDeckPeek: (selectedIndex: number, remainingOrder: number[]) => void;

  incomingAlertNotification: {
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'info' | 'positive';
  } | null;
  dismissIncomingAlert: () => void;
  triggerEventAlert: (title: string, message: string, targetRole?: PlayerRoleId | 'all', type?: 'alert' | 'info' | 'positive') => void;

  patchAlertModal: boolean;
  alertServerName: string | null;
  isDiceModalOpen: boolean;
  diceRollReason: 'report' | 'endTurn' | 'manualTest';
  isStealthMode: boolean;
  logs: string[];
  auditLogs: AuditLogEntry[];
  playerMetrics: Record<PlayerRoleId, PlayerMetrics>;

  // Actions
  leaveLanRoom: () => void;
  startLanMatch: (code: string, count?: number, hostNickname?: string) => void;
  setPlayerNickname: (role: PlayerRoleId, nickname: string) => void;
  setMyRole: (role: PlayerRoleId) => void;
  setGameMode: (mode: 'solo' | 'hotseat' | 'lan') => void;
  completeSetup: (archetype: Archetype, program: ProgramCard) => void;
  drawEventCard: () => void;
  closeEventModal: () => void;
  setGameWinner: (winner: string | null) => void;
  movePawn: (targetNodeId: string) => void;
  actionVarrer: () => void;
  actionInfiltrar: (cardId: string) => void;
  discardCardFromHand: (cardId: string) => void;
  recycleHandCards: (cardId1: string, cardId2: string) => void;
  abandonActiveProgram: () => void;
  moveCardToToolsRack: (cardId: string) => void;
  cancelToolInstall: () => void;
  confirmToolInstall: (discardCardId: string) => void;
  activateInstalledTool: (toolInstanceId: string) => void;
  moveCardToDefuseSlot: (cardId: string) => void;
  activateCveProtection: () => void;
  actionReportar: () => void;
  triggerManualDiceRoll: () => void;
  selectNewProgram: (program: ProgramCard) => void;
  drawSurpriseProgramFromDeck: () => void;
  rotateMarketProgram: (programId: string) => void;
  handleDiceRollResult: (result: any) => void;
  defusePatch: () => void;
  acceptPatch: () => void;
  endTurn: () => void;
  resetBoardGame: () => void;
  actionSocialPhishing?: (chosenCardIdToGive?: string, chosenTargetId?: PlayerRoleId) => void;
  saveMatchLogToDatabase: (winnerOverride?: string) => Promise<{ success: boolean; error?: any; data?: any }>;
}

const BoardGameContext = createContext<BoardGameContextType | undefined>(undefined);

export const BoardGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initData] = useState(() => createInitialGameState(2));

  const [players, setPlayers] = useState<Record<PlayerRoleId, PlayerState>>(() => initData.playersInitial);
  const [playerCount, setPlayerCountRaw] = useState<number>(2);
  const [activePlayerRole, setActivePlayerRole] = useState<PlayerRoleId>('player-1');
  const [myRole, setMyRoleState] = useState<PlayerRoleId>('player-1');
  const [gameMode, setGameModeState] = useState<'solo' | 'hotseat' | 'lan'>('hotseat');
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('room')?.toUpperCase().trim() || null;
    }
    return null;
  });

  // Decks centrais compartilhados
  const [playerNodeId, setPlayerNodeId] = useState<string>('node-bank-login');
  const [mainDeck, setMainDeck] = useState<CardV2[]>(() => initData.remainingMain);
  const [discardPile, setDiscardPile] = useState<CardV2[]>([]);
  const [toolDeck, setToolDeck] = useState<CardV2[]>(() => initData.shuffledTools);
  const [toolDiscard, setToolDiscard] = useState<CardV2[]>([]);
  const [eventDeck, setEventDeck] = useState<EventCardData[]>(() => initData.shuffledEvents);
  const [eventDiscard, setEventDiscard] = useState<EventCardData[]>([]);
  const [programMarket, setProgramMarket] = useState<ProgramCard[]>(() => initData.market);
  const [programDeck, setProgramDeck] = useState<ProgramCard[]>(() => initData.programDeck);
  const [programDiscard, setProgramDiscard] = useState<ProgramCard[]>([]);

  const [pendingToolInstall, setPendingToolInstall] = useState<CardV2 | null>(null);
  const [toolInstalledThisTurn, setToolInstalledThisTurn] = useState<boolean>(false);
  const [freeToolInstallAvailable, setFreeToolInstallAvailable] = useState<boolean>(false);
  const [exploitsPlayedThisTurn, setExploitsPlayedThisTurn] = useState<number>(0);
  const [freeExploitDeploysRemaining, setFreeExploitDeploysRemaining] = useState<number>(0);
  const [phishingUsedThisTurn, setPhishingUsedThisTurn] = useState<boolean>(false);
  const [recycledThisTurn, setRecycledThisTurn] = useState<boolean>(false);

  const [servers] = useState<ServerRegion[]>(SERVERS_DATA);
  const [deployedExploits, setDeployedExploits] = useState<DeployedExploit[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [bountyLedger, setBountyLedger] = useState<BountyTransaction[]>([]);
  const [activeRoundEvents, setActiveRoundEvents] = useState<RoundActiveEvent[]>([]);

  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(false);
  const [activeEventCard, setActiveEventCard] = useState<EventCardData | null>(null);
  const [lastEventResolutionSummary, setLastEventResolutionSummary] = useState<string | null>(null);
  const [pendingTargetedEvent, setPendingTargetedEvent] = useState<PendingTargetedEvent | null>(null);
  const [pendingDeckPeek, setPendingDeckPeek] = useState<DeckPeekState | null>(null);

  const [patchAlertModal, setPatchAlertModal] = useState<boolean>(false);
  const [alertServerName, setAlertServerName] = useState<string | null>(null);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState<boolean>(false);
  const [diceRollReason, setDiceRollReason] = useState<'report' | 'endTurn' | 'manualTest'>('report');
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);

  const [logs, setLogs] = useState<string[]>([
    `[SETUP] ${initData.initialAuditLog.details}`
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([initData.initialAuditLog]);
  const [playerMetrics, setPlayerMetrics] = useState<Record<PlayerRoleId, PlayerMetrics>>(() => createEmptyMetrics());

  const auditLogsRef = useRef<AuditLogEntry[]>([initData.initialAuditLog]);
  const playerMetricsRef = useRef<Record<PlayerRoleId, PlayerMetrics>>(createEmptyMetrics());

  const [bots] = useState<any[]>([]);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [targetHitRound, setTargetHitRound] = useState<number | null>(null);
  const [awaitingProgramPick, setAwaitingProgramPick] = useState<boolean>(false);
  const [programPickReason, setProgramPickReason] = useState<string | null>(null);
  const [duelRotationsRemaining, setDuelRotationsRemaining] = useState<number>(0);
  const [pendingTurnAdvance, setPendingTurnAdvance] = useState<boolean>(false);
  const [incomingAlertNotification, setIncomingAlertNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'info' | 'positive';
  } | null>(null);

  const dismissIncomingAlert = useCallback(() => {
    setIncomingAlertNotification(null);
  }, []);

  const triggerEventAlert = useCallback((
    title: string,
    message: string,
    targetRole?: PlayerRoleId | 'all',
    type?: 'alert' | 'info' | 'positive'
  ) => {
    const alertData = {
      id: String(Date.now()),
      title,
      message,
      type: type || 'alert'
    };
    if (!targetRole || targetRole === myRole || targetRole === 'all') {
      soundFx.playPatchDeployedAlarm();
      setIncomingAlertNotification(alertData);
    }
    supabaseSync.broadcast('EVENT_ALERT', {
      title,
      message,
      targetRole: targetRole || 'all',
      type: type || 'alert'
    });
  }, [myRole]);

  const currentPlayer = players[myRole] || players['player-1'];
  const isMyTurn = myRole === activePlayerRole;

  // Helpers para Tools e Limite Dinâmico de Mão
  const countPlayerTool = (p: PlayerState, toolCode: string) =>
    p.activeTools.filter(t => (t.toolId || t.canonicalId || t.id).startsWith(toolCode)).length;

  const getPlayerMaxHandSize = (p: PlayerState) =>
    (p.archetype?.maxHandSize || 6) + countPlayerTool(p, 'T-01');

  const dynamicMaxHandSize = getPlayerMaxHandSize(currentPlayer);
  const needsDiscard = currentPlayer.hand.length > dynamicMaxHandSize;

  const isProvaOob = (card: CardV2) => {
    const id = (card.canonicalId || card.id || '').toUpperCase();
    const desc = ((card.simpleDescription || '') + ' ' + (card.ptDescription || '')).toUpperCase();
    return id === 'AUTH-9' || id === 'SSRF-7' || id === 'XSS-11' || desc.includes('PROVA OOB');
  };

  // Opções de escopo ativas para o jogador atual
  const currentScopeOptions: ScopeCheckOptions = {
    scopeExpansion: Boolean(currentPlayer.statusEffects?.scopeExpansionNextTurn),
    exploitBlocked: Boolean(currentPlayer.statusEffects?.noExploitNextTurn),
    wafBlocked: activeRoundEvents.some(e => e.id === 'evt-11'),
    twoFaBlocked: activeRoundEvents.some(e => e.id === 'evt-19')
  };

  // Lista de eventos persistentes visíveis nos slots EVENT 1 / EVENT 2 do PlayerMat
  const playerActiveEventsList: { id: string; name: string; simpleDescription: string }[] = [
    ...activeRoundEvents.map(e => ({ id: e.id, name: e.name, simpleDescription: e.simpleDescription })),
    ...(currentPlayer.statusEffects?.noExploitNextTurn ? [{ id: 'evt-03', name: 'Out of Scope!', simpleDescription: 'Impedido de realizar Exploit neste turno.' }] : []),
    ...(currentPlayer.statusEffects?.noReportNextTurn ? [{ id: 'evt-04', name: 'Legal Threat!', simpleDescription: 'Impedido de realizar Report neste turno.' }] : []),
    ...(currentPlayer.statusEffects?.noToolsNextTurn ? [{ id: 'evt-05', name: 'Triage Delay!', simpleDescription: 'Impedido de instalar ou ativar Tools neste turno.' }] : []),
    ...(currentPlayer.statusEffects?.scopeExpansionNextTurn ? [{ id: 'evt-08', name: 'Scope Expansion!', simpleDescription: 'Suas vulnerabilidades ignoram escopo neste turno!' }] : []),
    ...(currentPlayer.statusEffects?.noReconNextTurn ? [{ id: 'evt-18', name: 'Rate Limited!', simpleDescription: 'Impedido de comprar cartas no Recon neste turno.' }] : []),
    ...(currentPlayer.statusEffects?.hallOfFameBonus ? [{ id: 'evt-17', name: 'Hall of Fame (+1.5k)', simpleDescription: '+$1.500 de bônus no próximo Report bem-sucedido!' }] : [])
  ];

  const updateCurrentPlayer = useCallback((updater: (prev: PlayerState) => PlayerState) => {
    setPlayers(prev => {
      const updated = {
        ...prev,
        [myRole]: updater(prev[myRole] || prev['player-1'])
      };
      if (gameMode === 'lan' || Boolean(roomCode)) {
        supabaseSync.broadcast('STATE_SYNC', { players: updated });
      }
      return updated;
    });
  }, [myRole, gameMode, roomCode]);

  const recordAudit = useCallback((
    category: AuditLogEntry['category'],
    title: string,
    details: string,
    player?: PlayerState,
    status: AuditLogEntry['status'] = 'EXECUTED',
    roundOverride?: number
  ) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const seq = ++auditSeqCounter;
    const entry: AuditLogEntry = {
      id: category === 'SETUP' ? '0000000000000-init-setup' : `${Date.now()}-${String(seq).padStart(6, '0')}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: time,
      round: roundOverride ?? currentTurn,
      playerId: player?.id,
      playerName: player?.name,
      archetypeName: player?.archetype?.name,
      category,
      title,
      details,
      status
    };
    const filteredPrev = auditLogsRef.current.filter(e =>
      category === 'SETUP' ? e.category !== 'SETUP' && !e.id.startsWith('0000000000000') : e.id !== entry.id
    );
    const nextAudit = category === 'SETUP' ? [...filteredPrev, entry] : [entry, ...filteredPrev];
    auditLogsRef.current = nextAudit;
    setAuditLogs(nextAudit);
    setLogs(prev => [`[${time}] [${category}] ${title}: ${details}`, ...prev.slice(0, 120)]);
    supabaseSync.broadcast('AUDIT_LOG', { entry });
  }, [currentTurn]);

  const bumpMetric = useCallback((roleId: PlayerRoleId, updater: (m: PlayerMetrics) => Partial<PlayerMetrics>) => {
    const curr = playerMetricsRef.current[roleId] || createEmptyMetrics()[roleId];
    const updatedRole = { ...curr, ...updater(curr) };
    const nextAll = {
      ...playerMetricsRef.current,
      [roleId]: updatedRole
    };
    playerMetricsRef.current = nextAll;
    setPlayerMetrics(nextAll);
    supabaseSync.broadcast('METRIC_UPDATE', { roleId, metrics: updatedRole });
  }, []);

  // Helper de reposição de programas do Program Deck (com reembaralhamento do descarte)
  const popProgramsFromDeck = (
    count: number,
    deck: ProgramCard[],
    discard: ProgramCard[],
    avoidProgramName?: string
  ): { drawn: ProgramCard[]; nextDeck: ProgramCard[]; nextDiscard: ProgramCard[] } => {
    let availDeck = [...deck];
    let availDiscard = [...discard];
    if (availDeck.length < count && availDiscard.length > 0) {
      availDeck = [...availDeck, ...shuffleArray(availDiscard)];
      availDiscard = [];
    }

    // Se solicitado evitar um programa com mesmo nome (ex.: substituir slot no mercado sem repetir imediatamente o mesmo alvo)
    if (avoidProgramName && availDeck.length > 1 && availDeck[0].name === avoidProgramName) {
      const altIdx = availDeck.findIndex(p => p.name !== avoidProgramName);
      if (altIdx !== -1) {
        const [chosen] = availDeck.splice(altIdx, 1);
        availDeck.unshift(chosen);
      }
    }

    const drawn = availDeck.slice(0, count);
    const nextDeck = availDeck.slice(count);
    return { drawn, nextDeck, nextDiscard: availDiscard };
  };

  // ── Tokens Management V1.4 ──────────────────────────────────────────────────
  const addAlertaToken = (count: number = 1) => {
    const p = currentPlayer;
    const next = p.alertaTokens + count;
    bumpMetric(p.id, m => ({
      alertsReceived: m.alertsReceived + count,
      criticalAlarmPenalties: next >= 2 ? m.criticalAlarmPenalties + 1 : m.criticalAlarmPenalties
    }));
    if (next >= 2) {
      soundFx.playPatchDeployedAlarm();
      updateCurrentPlayer(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 2000),
        alertaTokens: 0
      }));
      setBountyLedger(prev => [
        ...prev,
        {
          id: 'pen-' + Date.now(),
          turn: currentTurn,
          type: 'Penalty',
          description: `Alarme Crítico (2🐞) — ${p.name}`,
          amount: -2000,
          mathBreakdown: `Acumulou 2 Tokens de Alerta (-$2.000 e alertas zerados)`
        }
      ]);
      recordAudit('ALERT', 'Alarme Crítico (2🐞): -$2.000', `${p.name} atingiu 2 Tokens de Alerta! Perdeu -$2.000 na Bounty Track e devolveu os 2 tokens.`, p, 'PENALTY');
    } else {
      updateCurrentPlayer(prev => ({ ...prev, alertaTokens: next }));
      recordAudit('ALERT', `+${count} Token de Alerta (${next}/2)`, `${p.name} recebeu +${count} Token de Alerta.`, p, 'PENALTY');
    }
  };

  const removeAlertaToken = (count: number = 1) => {
    if (currentPlayer.alertaTokens <= 0) return;
    const next = Math.max(0, currentPlayer.alertaTokens - count);
    const updated = {
      ...players,
      [myRole]: { ...currentPlayer, alertaTokens: next }
    };
    setPlayers(updated);
    if (gameMode === 'lan' || Boolean(roomCode)) {
      supabaseSync.broadcast('STATE_SYNC', { players: updated });
    }
    recordAudit('ALERT', `Modo Furtivo: -${count} Token de Alerta`, `${currentPlayer.name} limpou ${count} Token de Alerta (${next}/2 restantes).`, updated[myRole], 'EXECUTED');
  };

  const addReputacaoToken = (count: number = 1) => {
    const next = currentPlayer.reputacaoTokens + count;
    updateCurrentPlayer(p => ({ ...p, reputacaoTokens: next }));
    recordAudit('REPORT', `+${count} Token de Reputação (🐝)`, `${currentPlayer.name} agora possui ${next} Token(s) de Reputação.`, currentPlayer, 'EXECUTED');
  };

  const useReputacaoReroll = (): boolean => {
    if (currentPlayer.reputacaoTokens < 2) return false;
    updateCurrentPlayer(p => ({ ...p, reputacaoTokens: p.reputacaoTokens - 2 }));
    recordAudit('PATCH', 'Reroll de Dado (2🐝 gastos)', `${currentPlayer.name} gastou 2 Tokens de Reputação para rolar novamente 1 dado no teste de Patch.`, currentPlayer, 'EXECUTED');
    return true;
  };

  // Manual §02: ao mudar a quantidade de jogadores, ajusta mãos e programas iniciais
  const setPlayerCount = (count: number) => {
    const old = playerCount;
    if (count === old) return;
    const ids: PlayerRoleId[] = ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'];
    let deck = [...mainDeck];
    let pDeck = [...programDeck];
    let pDiscard = [...programDiscard];
    const nextPlayers = { ...players };

    if (count < old) {
      ids.slice(count, old).forEach(id => {
        deck = shuffleArray([...deck, ...nextPlayers[id].hand]);
        if (nextPlayers[id].activeProgram) {
          pDeck = shuffleArray([...pDeck, nextPlayers[id].activeProgram!]);
        }
        nextPlayers[id] = { ...nextPlayers[id], hand: [], activeProgram: null };
      });
    } else {
      ids.slice(old, count).forEach(id => {
        const handCards = deck.slice(0, 5);
        deck = deck.slice(5);
        let assignedProg = nextPlayers[id].activeProgram;
        if (!assignedProg) {
          const popped = popProgramsFromDeck(1, pDeck, pDiscard);
          assignedProg = popped.drawn[0] || null;
          pDeck = popped.nextDeck;
          pDiscard = popped.nextDiscard;
        }
        nextPlayers[id] = { ...nextPlayers[id], hand: handCards, activeProgram: assignedProg };
      });
    }
    setMainDeck(deck);
    setProgramDeck(pDeck);
    setProgramDiscard(pDiscard);
    setPlayers(nextPlayers);
    setPlayerCountRaw(count);
    recordAudit('SETUP', `Mesa alterada para ${count} Jogadores`, `Ativos: ${ids.slice(0, count).map(id => `${nextPlayers[id].name} (${nextPlayers[id].archetype.name} / ${nextPlayers[id].activeProgram?.name || 'Sem Prog'})`).join(' | ')}`);
  };

  // ── Compra Segura do Main Deck ─────────────────────────────────────────────
  const popCardsFromMainDeck = (
    count: number,
    currMain: CardV2[],
    currDiscard: CardV2[]
  ): { drawn: CardV2[]; nextMain: CardV2[]; nextDiscard: CardV2[] } => {
    let availableDeck = [...currMain];
    let availableDiscards = [...currDiscard];

    if (availableDeck.length < count && availableDiscards.length > 0) {
      availableDeck = [...availableDeck, ...shuffleArray(availableDiscards)];
      availableDiscards = [];
    }
    if (availableDeck.length < count) {
      availableDeck = [...availableDeck, ...shuffleArray(buildCanonicalV14MainDeck().map((c, i) => mapCanonicalToCardV2(c, i + 500)))];
    }

    const drawn = availableDeck.slice(0, count);
    const nextMain = availableDeck.slice(count);
    return { drawn, nextMain, nextDiscard: availableDiscards };
  };

  const popCardsFromToolDeck = (
    count: number,
    currToolDeck: CardV2[],
    currToolDiscard: CardV2[]
  ): { drawn: CardV2[]; nextToolDeck: CardV2[]; nextToolDiscard: CardV2[] } => {
    let availDeck = [...currToolDeck];
    let availDiscard = [...currToolDiscard];
    if (availDeck.length < count && availDiscard.length > 0) {
      availDeck = [...availDeck, ...shuffleArray(availDiscard)];
      availDiscard = [];
    }
    const drawn = availDeck.slice(0, count);
    const nextToolDeck = availDeck.slice(count);
    return { drawn, nextToolDeck, nextToolDiscard: availDiscard };
  };

  // ── Setup & Reset ──────────────────────────────────────────────────────────
  const customNicknamesRef = useRef<Partial<Record<PlayerRoleId, string>>>((() => {
    const init: Partial<Record<PlayerRoleId, string>> = {};
    if (typeof window !== 'undefined') {
      try {
        (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).forEach(r => {
          const stored = localStorage.getItem(`pwnd_nick_${r}`);
          if (stored) init[r] = stored;
        });
      } catch {}
    }
    return init;
  })());

  const setMyRole = (role: PlayerRoleId) => {
    if (gameMode === 'lan' || Boolean(roomCode)) {
      console.warn('[PWND LAN] Troca de assento bloqueada durante partida online.');
      return;
    }
    setMyRoleState(role);
  };

  const setPlayerNickname = (role: PlayerRoleId, nickname: string) => {
    const formatted = formatPlayerName(role, nickname);
    customNicknamesRef.current[role] = formatted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`pwnd_nick_${role}`, formatted);
        if (role === myRole) {
          localStorage.setItem('pwnd_player_nickname', nickname.trim());
        }
      } catch {}
    }
    setPlayers(prev => {
      const updated = {
        ...prev,
        [role]: { ...prev[role], name: formatted }
      };
      // Atualiza também o log de SETUP #1 para refletir o nome real dos jogadores
      setAuditLogs(currLogs => {
        return currLogs.map(log => {
          if (log.category === 'SETUP') {
            const activeList = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[])
              .slice(0, playerCount);
            const setupSummary = activeList
              .map(id => `${updated[id]?.name || id}: [${updated[id]?.archetype?.name || 'Arquétipo'}] c/ alvo [${updated[id]?.activeProgram?.name || 'Sem Alvo'}]`)
              .join(' | ');
            return {
              ...log,
              details: `${setupSummary}. Mercado exposto: [${programMarket.map(m => m.name).join(', ')}] (${programDeck.length} no Program Deck).`
            };
          }
          return log;
        });
      });
      return updated;
    });
    supabaseSync.broadcast('UPDATE_PLAYER_NAME', { role, name: formatted });
  };

  const setGameMode = (mode: 'solo' | 'hotseat' | 'lan') => {
    setGameModeState(mode);
  };

  const completeSetup = (archetype: Archetype, program: ProgramCard) => {
    updateCurrentPlayer(p => ({ ...p, archetype, activeProgram: program }));
    setIsSetupWizardOpen(false);
  };

  const resetBoardGame = () => {
    // Em modo online (LAN), somente o Host (player-1) tem permissão para reiniciar a mesa
    if (gameMode === 'lan' && myRole !== 'player-1') {
      alert('Apenas o anfitrião (Jogador 1) pode reiniciar a partida online.');
      return;
    }

    // Salva o log da partida anterior no banco se houver eventos jogados
    if (auditLogsRef.current.length > 3) {
      saveMatchLogToDatabase('Partida reiniciada pelo Host').catch(() => {});
    }

    // Preserva com rigor todos os apelidos dos jogadores (do state atual, do ref e do localStorage)
    const preservedNames: Partial<Record<PlayerRoleId, string>> = { ...customNicknamesRef.current };
    (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).forEach(r => {
      if (players[r]?.name && !players[r].name.startsWith('Jogador ')) {
        preservedNames[r] = players[r].name;
      }
      if (!preservedNames[r] && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`pwnd_nick_${r}`);
          if (stored) preservedNames[r] = stored;
        } catch {}
      }
    });
    customNicknamesRef.current = preservedNames;

    const fresh = createInitialGameState(playerCount, preservedNames);
    setPlayers(fresh.playersInitial);
    setMainDeck(fresh.remainingMain);
    setDiscardPile([]);
    setToolDeck(fresh.shuffledTools);
    setToolDiscard([]);
    setEventDeck(fresh.shuffledEvents);
    setEventDiscard([]);
    setProgramMarket(fresh.market);
    setProgramDeck(fresh.programDeck);
    setProgramDiscard([]);
    setDeployedExploits([]);
    setBountyLedger([]);
    setActiveRoundEvents([]);
    setCurrentTurn(1);
    setActivePlayerRole('player-1');
    // Em LAN o Host continua sendo player-1 e os convidados não têm seu papel sobrescrito
    if (gameMode !== 'lan') {
      setMyRoleState('player-1');
    }
    setPatchAlertModal(false);
    setIsDiceModalOpen(false);
    setGameWinner(null);
    setAwaitingProgramPick(false);
    setProgramPickReason(null);
    setDuelRotationsRemaining(0);
    setPendingTurnAdvance(false);
    setPendingToolInstall(null);
    setToolInstalledThisTurn(false);
    setFreeToolInstallAvailable(false);
    setExploitsPlayedThisTurn(0);
    setFreeExploitDeploysRemaining(0);
    setPhishingUsedThisTurn(false);
    setRecycledThisTurn(false);
    setActiveEventCard(null);
    setLastEventResolutionSummary(null);
    setPendingTargetedEvent(null);
    setPendingDeckPeek(null);
    const emptyM = createEmptyMetrics();
    playerMetricsRef.current = emptyM;
    auditLogsRef.current = [fresh.initialAuditLog];
    setPlayerMetrics(emptyM);
    setAuditLogs([fresh.initialAuditLog]);
    setLogs([`[SETUP] ${fresh.initialAuditLog.details}`]);

    // Se for o Host em LAN, sincroniza o reset com todos na mesa
    if (gameMode === 'lan' && myRole === 'player-1') {
      supabaseSync.broadcast('RESET_GAME', {
        players: fresh.playersInitial,
        programMarket: fresh.market,
        mainDeck: fresh.remainingMain,
        toolDeck: fresh.shuffledTools,
        eventDeck: fresh.shuffledEvents,
        programDeck: fresh.programDeck,
        initialAuditLog: fresh.initialAuditLog,
        playerCount
      });
    }
  };

  const leaveLanRoom = async () => {
    if (gameMode === 'lan' && myRole === 'player-1') {
      try {
        await supabaseSync.broadcastAsync('ROOM_CLOSED', {});
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {}
    }
    supabaseSync.leaveRoom();
    setRoomCode(null);
    setGameModeState('solo');
    setMyRoleState('player-1');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      url.searchParams.delete('role');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  const startLanMatch = (code: string, count?: number, hostNickname?: string) => {
    const preservedNames: Partial<Record<PlayerRoleId, string>> = { ...customNicknamesRef.current };
    if (hostNickname !== undefined && hostNickname.trim()) {
      preservedNames['player-1'] = formatPlayerName('player-1', hostNickname);
      try {
        localStorage.setItem('pwnd_nick_player-1', preservedNames['player-1']);
        localStorage.setItem('pwnd_player_nickname', hostNickname.trim());
      } catch {}
    }
    (['player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).forEach(r => {
      if (players[r]?.name && !players[r].name.startsWith('Jogador ')) {
        preservedNames[r] = players[r].name;
      }
      if (!preservedNames[r] && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`pwnd_nick_${r}`);
          if (stored) preservedNames[r] = stored;
        } catch {}
      }
    });
    customNicknamesRef.current = preservedNames;
    const targetCount = count || playerCount;
    const fresh = createInitialGameState(targetCount, preservedNames);
    setPlayers(fresh.playersInitial);
    setMainDeck(fresh.remainingMain);
    setDiscardPile([]);
    setToolDeck(fresh.shuffledTools);
    setToolDiscard([]);
    setEventDeck(fresh.shuffledEvents);
    setEventDiscard([]);
    setProgramMarket(fresh.market);
    setProgramDeck(fresh.programDeck);
    setProgramDiscard([]);
    setDeployedExploits([]);
    setBountyLedger([]);
    setActiveRoundEvents([]);
    setCurrentTurn(1);
    setActivePlayerRole('player-1');
    setMyRoleState('player-1');
    setGameModeState('lan');
    setRoomCode(code);
    if (typeof count === 'number') {
      setPlayerCountRaw(count);
    }
    setPatchAlertModal(false);
    setIsDiceModalOpen(false);
    setGameWinner(null);
    setAwaitingProgramPick(false);
    setProgramPickReason(null);
    setDuelRotationsRemaining(0);
    setPendingTurnAdvance(false);
    setPendingToolInstall(null);
    setToolInstalledThisTurn(false);
    setFreeToolInstallAvailable(false);
    setExploitsPlayedThisTurn(0);
    setFreeExploitDeploysRemaining(0);
    setPhishingUsedThisTurn(false);
    setRecycledThisTurn(false);
    setActiveEventCard(null);
    setLastEventResolutionSummary(null);
    setPendingTargetedEvent(null);
    setPendingDeckPeek(null);
    const emptyM = createEmptyMetrics();
    playerMetricsRef.current = emptyM;
    auditLogsRef.current = [fresh.initialAuditLog];
    setPlayerMetrics(emptyM);
    setAuditLogs([fresh.initialAuditLog]);
    setLogs([`[SETUP] ${fresh.initialAuditLog.details}`]);

    // Broadcasts the fresh state to any connected guests
    supabaseSync.broadcast('STATE_SYNC', {
      players: fresh.playersInitial,
      deployedExploits: [],
      programMarket: fresh.market,
      mainDeck: fresh.remainingMain,
      discardPile: [],
      toolDeck: fresh.shuffledTools,
      toolDiscard: [],
      eventDeck: fresh.shuffledEvents,
      eventDiscard: [],
      programDeck: fresh.programDeck,
      programDiscard: [],
      activeRoundEvents: [],
      auditLogs: [fresh.initialAuditLog],
      playerMetrics: emptyM,
      activePlayerRole: 'player-1',
      currentTurn: 1,
      playerCount: targetCount
    });
  };

  // ── Supabase State Ref & Realtime Listener ────────────────────────────────
  const latestStateRef = useRef({
    players,
    deployedExploits,
    programMarket,
    mainDeck,
    discardPile,
    toolDeck,
    toolDiscard,
    eventDeck,
    eventDiscard,
    programDeck,
    programDiscard,
    activeRoundEvents,
    auditLogs,
    playerMetrics,
    activePlayerRole,
    currentTurn,
    playerCount,
    myRole
  });

  useEffect(() => {
    latestStateRef.current = {
      players,
      deployedExploits,
      programMarket,
      mainDeck,
      discardPile,
      toolDeck,
      toolDiscard,
      eventDeck,
      eventDiscard,
      programDeck,
      programDiscard,
      activeRoundEvents,
      auditLogs,
      playerMetrics,
      activePlayerRole,
      currentTurn,
      playerCount,
      myRole
    };
  }, [
    players,
    deployedExploits,
    programMarket,
    mainDeck,
    discardPile,
    toolDeck,
    toolDiscard,
    eventDeck,
    eventDiscard,
    programDeck,
    programDiscard,
    activeRoundEvents,
    auditLogs,
    playerMetrics,
    activePlayerRole,
    currentTurn,
    playerCount,
    myRole
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    let roleParam = params.get('role') as PlayerRoleId | null;

    if (roomParam) {
      const code = roomParam.toUpperCase().trim();
      setRoomCode(code);
      setGameModeState('lan');

      if (!roleParam) {
        try {
          const savedRole = localStorage.getItem('pwnd_active_role') as PlayerRoleId | null;
          if (savedRole) roleParam = savedRole;
        } catch {}
      }

      if (roleParam) {
        setMyRoleState(roleParam);
        let nick = '';
        try {
          nick = localStorage.getItem(`pwnd_nick_${roleParam}`) || localStorage.getItem('pwnd_player_nickname') || '';
        } catch {}
        const finalName = nick ? formatPlayerName(roleParam, nick) : `Jogador (${roleParam})`;
        customNicknamesRef.current[roleParam] = finalName;

        supabaseSync.joinRoom(code, roleParam, finalName);
        if (roleParam !== 'player-1') {
          setTimeout(() => {
            supabaseSync.broadcast('REQUEST_STATE', { from: roleParam, playerName: finalName });
          }, 350);
          setTimeout(() => {
            supabaseSync.broadcast('UPDATE_PLAYER_NAME', { role: roleParam, name: finalName });
          }, 700);
        }
      }
    }

    const applyRemoteDecksAndLogs = (payload: any) => {
      if (!payload) return;
      if (Array.isArray(payload.mainDeck)) setMainDeck(payload.mainDeck);
      if (Array.isArray(payload.discardPile)) setDiscardPile(payload.discardPile);
      if (Array.isArray(payload.toolDeck)) setToolDeck(payload.toolDeck);
      if (Array.isArray(payload.toolDiscard)) setToolDiscard(payload.toolDiscard);
      if (Array.isArray(payload.eventDeck)) setEventDeck(payload.eventDeck);
      if (Array.isArray(payload.eventDiscard)) setEventDiscard(payload.eventDiscard);
      if (Array.isArray(payload.programDeck)) setProgramDeck(payload.programDeck);
      if (Array.isArray(payload.programDiscard)) setProgramDiscard(payload.programDiscard);
      if (Array.isArray(payload.activeRoundEvents)) setActiveRoundEvents(payload.activeRoundEvents);
      if (Array.isArray(payload.auditLogs)) {
        const merged = mergeAuditLogs(auditLogsRef.current, payload.auditLogs);
        auditLogsRef.current = merged;
        setAuditLogs(merged);
      }
      if (payload.playerMetrics) {
        const mergedM = mergePlayerMetrics(playerMetricsRef.current, payload.playerMetrics);
        playerMetricsRef.current = mergedM;
        setPlayerMetrics(mergedM);
      }
    };

    const unsubscribe = supabaseSync.subscribe((msg: RoomMessage) => {
      if (msg.actionType === 'AUDIT_LOG') {
        const entry = msg.payload?.entry as AuditLogEntry | undefined;
        if (entry && entry.id) {
          if (!auditLogsRef.current.some(e => e.id === entry.id)) {
            const merged = mergeAuditLogs(auditLogsRef.current, [entry]);
            auditLogsRef.current = merged;
            setAuditLogs(merged);
            setLogs(prev => [`[${entry.timestamp}] [${entry.category}] ${entry.title}: ${entry.details}`, ...prev.slice(0, 120)]);
          }
        }
      } else if (msg.actionType === 'METRIC_UPDATE') {
        const { roleId, metrics } = (msg.payload || {}) as { roleId?: PlayerRoleId; metrics?: PlayerMetrics };
        if (roleId && metrics) {
          const mergedM = mergePlayerMetrics(playerMetricsRef.current, {
            ...playerMetricsRef.current,
            [roleId]: metrics
          });
          playerMetricsRef.current = mergedM;
          setPlayerMetrics(mergedM);
        }
      } else if (msg.actionType === 'END_TURN') {
        if (msg.payload.activePlayerRole) setActivePlayerRole(msg.payload.activePlayerRole);
        if (msg.payload.currentTurn) setCurrentTurn(msg.payload.currentTurn);
        if (msg.payload.players) setPlayers(msg.payload.players);
        if (msg.payload.deployedExploits) setDeployedExploits(msg.payload.deployedExploits);
        if (msg.payload.programMarket) setProgramMarket(msg.payload.programMarket);
        if (typeof msg.payload.playerCount === 'number') setPlayerCountRaw(msg.payload.playerCount);
        applyRemoteDecksAndLogs(msg.payload);
        setToolInstalledThisTurn(false);
        setFreeToolInstallAvailable(false);
        setExploitsPlayedThisTurn(0);
        setFreeExploitDeploysRemaining(0);
        setPhishingUsedThisTurn(false);
        setRecycledThisTurn(false);
      } else if (msg.actionType === 'STATE_SYNC') {
        if (msg.payload.deployedExploits) setDeployedExploits(msg.payload.deployedExploits);
        if (msg.payload.programMarket) setProgramMarket(msg.payload.programMarket);
        if (msg.payload.players) setPlayers(msg.payload.players);
        if (msg.payload.activePlayerRole) setActivePlayerRole(msg.payload.activePlayerRole);
        if (msg.payload.currentTurn) setCurrentTurn(msg.payload.currentTurn);
        if (typeof msg.payload.playerCount === 'number') setPlayerCountRaw(msg.payload.playerCount);
        applyRemoteDecksAndLogs(msg.payload);
      } else if (msg.actionType === 'UPDATE_PLAYER_NAME') {
        const { role, name } = msg.payload as { role: PlayerRoleId; name: string };
        if (role && name) {
          customNicknamesRef.current[role] = name;
          setPlayers(prev => {
            const updated = {
              ...prev,
              [role]: { ...prev[role], name }
            };
            setAuditLogs(currLogs =>
              currLogs.map(log => {
                if (log.category === 'SETUP') {
                  const activeList = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[])
                    .slice(0, latestStateRef.current.playerCount);
                  const setupSummary = activeList
                    .map(id => `${updated[id]?.name || id}: [${updated[id]?.archetype?.name || 'Arquétipo'}] c/ alvo [${updated[id]?.activeProgram?.name || 'Sem Alvo'}]`)
                    .join(' | ');
                  return {
                    ...log,
                    details: `${setupSummary}. Mercado exposto: [${latestStateRef.current.programMarket.map(m => m.name).join(', ')}] (${latestStateRef.current.programDeck.length} no Program Deck).`
                  };
                }
                return log;
              })
            );
            return updated;
          });
        }
      } else if (msg.actionType === 'EVENT_ALERT') {
        const { title, message, targetRole, type } = (msg.payload || {}) as { title?: string; message?: string; targetRole?: string; type?: 'alert' | 'info' | 'positive' };
        const myCurrentRole = latestStateRef.current.myRole;
        if (!targetRole || targetRole === myCurrentRole || targetRole === 'all') {
          soundFx.playPatchDeployedAlarm();
          setIncomingAlertNotification({
            id: String(Date.now()),
            title: title || 'Alerta de Evento',
            message: message || '',
            type: type || 'alert'
          });
        }
      } else if (msg.actionType === 'GAME_OVER') {
        if (msg.payload.players) setPlayers(msg.payload.players);
        if (msg.payload.deployedExploits) setDeployedExploits(msg.payload.deployedExploits);
        if (msg.payload.programMarket) setProgramMarket(msg.payload.programMarket);
        if (msg.payload.currentTurn) setCurrentTurn(msg.payload.currentTurn);
        if (msg.payload.winner) setGameWinner(msg.payload.winner);
        applyRemoteDecksAndLogs(msg.payload);
        if (msg.payload.auditEntry) {
          const merged = mergeAuditLogs(auditLogsRef.current, [msg.payload.auditEntry]);
          auditLogsRef.current = merged;
          setAuditLogs(merged);
        }
        if (latestStateRef.current.myRole === 'player-1') {
          saveMatchLogToDatabase(msg.payload.winner).catch(() => {});
        }
      } else if (msg.actionType === 'REQUEST_STATE') {
        const currentRef = latestStateRef.current;
        if (currentRef.myRole === 'player-1') {
          let playersToSend = currentRef.players;
          const guestRole = msg.payload?.from as PlayerRoleId | undefined;
          const guestName = msg.payload?.playerName as string | undefined;
          if (guestRole && guestName && playersToSend[guestRole]) {
            customNicknamesRef.current[guestRole] = guestName;
            playersToSend = {
              ...playersToSend,
              [guestRole]: { ...playersToSend[guestRole], name: guestName }
            };
            setPlayers(playersToSend);
          }
          supabaseSync.broadcast('STATE_SYNC', {
            players: playersToSend,
            deployedExploits: currentRef.deployedExploits,
            programMarket: currentRef.programMarket,
            mainDeck: currentRef.mainDeck,
            discardPile: currentRef.discardPile,
            toolDeck: currentRef.toolDeck,
            toolDiscard: currentRef.toolDiscard,
            eventDeck: currentRef.eventDeck,
            eventDiscard: currentRef.eventDiscard,
            programDeck: currentRef.programDeck,
            programDiscard: currentRef.programDiscard,
            activeRoundEvents: currentRef.activeRoundEvents,
            auditLogs: auditLogsRef.current,
            playerMetrics: playerMetricsRef.current,
            activePlayerRole: currentRef.activePlayerRole,
            currentTurn: currentRef.currentTurn,
            playerCount: currentRef.playerCount
          });
        }
      } else if (msg.actionType === 'RESET_GAME') {
        const count = typeof msg.payload.playerCount === 'number' ? msg.payload.playerCount : latestStateRef.current.playerCount;
        
        // Reidrata apelido local do convidado
        const myCurrRole = latestStateRef.current.myRole;
        let myStoredNick = customNicknamesRef.current[myCurrRole];
        if (!myStoredNick && typeof window !== 'undefined') {
          try {
            myStoredNick = localStorage.getItem(`pwnd_nick_${myCurrRole}`) || localStorage.getItem('pwnd_player_nickname') || undefined;
          } catch {}
        }
        if (myStoredNick) {
          customNicknamesRef.current[myCurrRole] = formatPlayerName(myCurrRole, myStoredNick);
        }

        const fresh = createInitialGameState(count, customNicknamesRef.current);
        const incomingPlayers = msg.payload.players || fresh.playersInitial;
        
        // Garante que o próprio jogador nunca regrida para 'Jogador X'
        if (myStoredNick && incomingPlayers[myCurrRole]) {
          incomingPlayers[myCurrRole].name = formatPlayerName(myCurrRole, myStoredNick);
        }

        setPlayers(incomingPlayers);
        
        if (myStoredNick && myCurrRole !== 'player-1') {
          setTimeout(() => {
            supabaseSync.broadcast('UPDATE_PLAYER_NAME', { role: myCurrRole, name: formatPlayerName(myCurrRole, myStoredNick!) });
          }, 400);
        }
        setMainDeck(msg.payload.mainDeck || fresh.remainingMain);
        setDiscardPile([]);
        setToolDeck(msg.payload.toolDeck || fresh.shuffledTools);
        setToolDiscard([]);
        setEventDeck(msg.payload.eventDeck || fresh.shuffledEvents);
        setEventDiscard([]);
        setProgramMarket(msg.payload.programMarket || fresh.market);
        setProgramDeck(msg.payload.programDeck || fresh.programDeck);
        setProgramDiscard([]);
        setDeployedExploits([]);
        setBountyLedger([]);
        setActiveRoundEvents([]);
        setCurrentTurn(1);
        setActivePlayerRole('player-1');
        // Mantém myRole inalterado para os convidados
        if (typeof msg.payload.playerCount === 'number') {
          setPlayerCountRaw(msg.payload.playerCount);
        }
        setPatchAlertModal(false);
        setIsDiceModalOpen(false);
        setGameWinner(null);
        setAwaitingProgramPick(false);
        setProgramPickReason(null);
        setDuelRotationsRemaining(0);
        setPendingTurnAdvance(false);
        setPendingToolInstall(null);
        setToolInstalledThisTurn(false);
        setFreeToolInstallAvailable(false);
        setExploitsPlayedThisTurn(0);
        setFreeExploitDeploysRemaining(0);
        setPhishingUsedThisTurn(false);
        setRecycledThisTurn(false);
        setActiveEventCard(null);
        setLastEventResolutionSummary(null);
        setPendingTargetedEvent(null);
        setPendingDeckPeek(null);
        const emptyM = createEmptyMetrics();
        const initLog = msg.payload.initialAuditLog || fresh.initialAuditLog;
        playerMetricsRef.current = emptyM;
        auditLogsRef.current = [initLog];
        setPlayerMetrics(emptyM);
        setAuditLogs([initLog]);
        setLogs([`[SETUP] ${initLog.details}`]);
      } else if (msg.actionType === 'ROOM_CLOSED') {
        supabaseSync.leaveRoom();
        setRoomCode(null);
        setGameModeState('solo');
        setMyRoleState('player-1');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('room');
          url.searchParams.delete('role');
          window.history.replaceState({}, '', url.pathname);
        }
        alert('A mesa online foi encerrada pelo anfitrião.');
      }
    });

    const handleBeforeUnload = () => {
      if (auditLogsRef.current.length > 5 && latestStateRef.current.myRole === 'player-1') {
        saveMatchLogToDatabase('Aba fechada').catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unsubscribe();
    };
  }, []);

  const getVulnFlatValue = (card: CardV2) => {
    switch (card.rarity) {
      case 'Common': return 1500;
      case 'Uncommon': return 2500;
      case 'Rare': return 4000;
      case 'Epic': return 5000;
      case 'Legendary': return 6000;
      default: return 1500;
    }
  };

  const getCardCvssScore = (card: CardV2) => {
    if (typeof card.cvssValue === 'number') return card.cvssValue;
    return getVulnFlatValue(card) / 1000;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MOTOR DE RESOLUÇÃO DOS 24 EVENTOS CANÔNICOS (V1.4 SEÇÃO 07)
  // ─────────────────────────────────────────────────────────────────────────────
  const executeEventCardOnState = (
    eventCard: EventCardData,
    basePlayers: Record<PlayerRoleId, PlayerState>,
    baseExploits: DeployedExploit[],
    authorRole: PlayerRoleId,
    explicitTargetId?: PlayerRoleId,
    overrideDecks?: {
      tools?: CardV2[];
      toolDiscard?: CardV2[];
      mainDeck?: CardV2[];
      discardPile?: CardV2[];
      market?: ProgramCard[];
      programDeck?: ProgramCard[];
      programDiscard?: ProgramCard[];
    }
  ) => {
    const eId = eventCard.id;
    const activeIds: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
    let nextPlayers: Record<PlayerRoleId, PlayerState> = { ...basePlayers };
    let nextExploits: DeployedExploit[] = [...baseExploits];
    let nextMain = overrideDecks?.mainDeck ? [...overrideDecks.mainDeck] : [...mainDeck];
    let nextDiscard = overrideDecks?.discardPile ? [...overrideDecks.discardPile] : [...discardPile];
    let nextTools = overrideDecks?.tools ? [...overrideDecks.tools] : [...toolDeck];
    let nextToolDiscard = overrideDecks?.toolDiscard ? [...overrideDecks.toolDiscard] : [...toolDiscard];
    let nextMarket = overrideDecks?.market ? [...overrideDecks.market] : [...programMarket];
    let nextProgDeck = overrideDecks?.programDeck ? [...overrideDecks.programDeck] : [...programDeck];
    let nextProgDiscard = overrideDecks?.programDiscard ? [...overrideDecks.programDiscard] : [...programDiscard];
    let nextRoundEvents = [...activeRoundEvents];
    const authorPlayer = nextPlayers[authorRole];
    const safeguardsBlocked = nextRoundEvents.some(re => re.id === 'evt-15');

    // Helper para checar se um jogador alvo tem Interceptor Pro (T-09) ou CVE Protection
    const checkNegativeEventDefense = (
      targetId: PlayerRoleId,
      canUseCve: boolean,
      canPentesterBlock: boolean
    ): { blocked: boolean; reason?: string; redirectedTo?: PlayerRoleId } => {
      const target = nextPlayers[targetId];
      if (!target) return { blocked: false };

      // 1. Pentester: Imune a Duplicate Report! (evt-02) e Triage Delay! (evt-05)
      if (canPentesterBlock && target.archetype.id === 'the-pentester') {
        bumpMetric(targetId, m => ({ archetypeTriggers: m.archetypeTriggers + 1 }));
        const reason = `🛡️ Pentester (${target.name} - Contrato Blindado) é imune a [${eventCard.name}]!`;
        triggerEventAlert('🛡️ Imunidade Ativa (Pentester)', reason, targetId, 'positive');
        return { blocked: true, reason };
      }

      // 2. Social Engineer: Caos Redirecionado (1x por rodada em eventos individuais negativos)
      if (
        target.archetype.id === 'social-engineer' &&
        !target.statusEffects?.redirectUsedThisRound &&
        activeIds.length > 1
      ) {
        const otherOpponents = activeIds.filter(id => id !== targetId);
        if (otherOpponents.length > 0) {
          // Em 2 jogadores, redireciona de volta para o autor! Em 3+, prioriza um oponente diferente do autor ou o próprio autor
          const redirected = otherOpponents.find(id => id !== authorRole) || otherOpponents[0];
          nextPlayers[targetId] = {
            ...target,
            statusEffects: { ...target.statusEffects, redirectUsedThisRound: true }
          };
          bumpMetric(targetId, m => ({ archetypeTriggers: m.archetypeTriggers + 1 }));
          const reason = `🎭 Caos Redirecionado! ${target.name} redirecionou o evento [${eventCard.name}] para ${nextPlayers[redirected].name}!`;
          recordAudit('ARCHETYPE', 'Caos Redirecionado (Social Engineer)', reason, target, 'EXECUTED');
          triggerEventAlert('🎭 Caos Redirecionado!', reason, 'all', 'alert');
          return { blocked: false, redirectedTo: redirected };
        }
      }

      // 3. CVE Assignment Protection (empilhada no Safeguard ou na mão): anula evt-02, evt-03 e evt-12
      if (canUseCve && !safeguardsBlocked) {
        if (target.cveProtection) {
          const cveCard = target.cveProtection;
          nextPlayers[targetId] = { ...target, cveProtection: null };
          nextDiscard.push(cveCard);
          const reason = `📜 CVE Assignment Protection de ${target.name} ativada e descartada: anulou [${eventCard.name}]!`;
          triggerEventAlert('📜 CVE Protection Ativada!', reason, targetId, 'positive');
          return { blocked: true, reason };
        }
        const handCve = target.hand.find(c => (c.canonicalId || c.id).includes('cve') || c.name.includes('CVE'));
        if (handCve) {
          nextPlayers[targetId] = { ...target, hand: target.hand.filter(c => c.id !== handCve.id) };
          nextDiscard.push(handCve);
          const reason = `📜 CVE Assignment Protection da mão de ${target.name} ativada: anulou [${eventCard.name}]!`;
          triggerEventAlert('📜 CVE Protection Ativada!', reason, targetId, 'positive');
          return { blocked: true, reason };
        }
      }

      // 4. Tool Ativa Reativa: Interceptor Pro (T-09) instalada no rack
      const interceptorIdx = target.activeTools.findIndex(t => (t.toolId || t.id).startsWith('T-09') || t.name.includes('Interceptor Pro'));
      if (interceptorIdx !== -1) {
        const interceptorCard = target.activeTools[interceptorIdx];
        const remainingTools = target.activeTools.filter((_, i) => i !== interceptorIdx);
        nextPlayers[targetId] = { ...target, activeTools: remainingTools };
        nextToolDiscard.push(interceptorCard);
        bumpMetric(targetId, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
        const reason = `🧰 Tool Ativa Reativa [Interceptor Pro] de ${target.name} interceptou e anulou [${eventCard.name}] (descartada)!`;
        triggerEventAlert('🧰 Interceptor Pro Disparado!', reason, 'all', 'positive');
        return { blocked: true, reason };
      }

      return { blocked: false };
    };

    // Verifica eventos que exigem escolha de 1 oponente (evt-02, evt-04, evt-14)
    if (!explicitTargetId && (eId === 'evt-02' || eId === 'evt-04' || eId === 'evt-14')) {
      let candidateIds = activeIds.filter(id => {
        if (id === authorRole) return false;
        if (eId === 'evt-02') return nextExploits.some(e => e.playerId === id);
        if (eId === 'evt-14') return nextPlayers[id].hand.length > 0;
        return true;
      });
      // Fallback evt-02 (Duplicate Report!): se nenhum oponente tiver vuln na mesa, qualquer oponente com cartas na mão é elegível (descarta 1 carta da mão)
      if (eId === 'evt-02' && candidateIds.length === 0) {
        candidateIds = activeIds.filter(id => id !== authorRole && nextPlayers[id].hand.length > 0);
      }

      if (candidateIds.length > 1) {
        setPendingTargetedEvent({
          eventCard,
          targets: candidateIds.map(id => ({
            id,
            name: nextPlayers[id].name,
            archetypeName: nextPlayers[id].archetype.name,
            score: nextPlayers[id].score,
            handCount: nextPlayers[id].hand.length,
            exploitsCount: nextExploits.filter(e => e.playerId === id).length
          }))
        });
        setPlayers(nextPlayers);
        setDeployedExploits(nextExploits);
        return;
      }
      explicitTargetId = candidateIds[0];
    }

    let summary = '';
    let status: AuditLogEntry['status'] = 'EXECUTED';

    switch (eId) {
      // evt-01: Blue Team Hunt! (Todos descartam a vuln de maior CVSS na mesa; se ninguém tiver vuln na mesa, oponentes descartam 1 carta da mão)
      case 'evt-01': {
        const logsParts: string[] = [];
        const keptExploits: DeployedExploit[] = [];
        const anyTableExploits = nextExploits.length > 0;
        if (anyTableExploits) {
          activeIds.forEach(rId => {
            const pExp = nextExploits.filter(e => e.playerId === rId);
            if (pExp.length === 0) return;
            const def = checkNegativeEventDefense(rId, false, false);
            if (def.blocked) {
              keptExploits.push(...pExp);
              logsParts.push(def.reason!);
              return;
            }
            const vulnerableExp = pExp.filter(e => !isProvaOob(e.card));
            const immuneExp = pExp.filter(e => isProvaOob(e.card));
            if (vulnerableExp.length === 0) {
              keptExploits.push(...pExp);
              logsParts.push(`${nextPlayers[rId].name}: exploits protegidos por PROVA OOB!`);
              return;
            }
            const sorted = [...vulnerableExp].sort((a, b) => getCardCvssScore(b.card) - getCardCvssScore(a.card));
            const removed = sorted[0];
            nextDiscard.push(removed.card);
            keptExploits.push(...sorted.slice(1), ...immuneExp);
            logsParts.push(`${nextPlayers[rId].name} perdeu [${removed.card.name}] da mesa`);
            if (rId !== authorRole) {
              triggerEventAlert('🚨 Blue Team Hunt!', `${authorPlayer.name} disparou Blue Team Hunt!: você perdeu [${removed.card.name}] da mesa!`, rId, 'alert');
            }
          });
          nextExploits = keptExploits;
        } else {
          activeIds.filter(rId => rId !== authorRole).forEach(rId => {
            const tPlayer = nextPlayers[rId];
            if (!tPlayer || tPlayer.hand.length === 0) return;
            const def = checkNegativeEventDefense(rId, false, false);
            if (def.blocked) {
              logsParts.push(def.reason!);
              return;
            }
            const randIdx = Math.floor(Math.random() * tPlayer.hand.length);
            const dropped = tPlayer.hand[randIdx];
            nextPlayers[rId] = { ...tPlayer, hand: tPlayer.hand.filter((_, i) => i !== randIdx) };
            nextDiscard.push(dropped);
            logsParts.push(`${tPlayer.name} (sem vuln na mesa) descartou [${dropped.name}] da mão`);
            triggerEventAlert('🚨 Blue Team Hunt!', `${authorPlayer.name} disparou Blue Team Hunt!: você descartou [${dropped.name}] da sua mão!`, rId, 'alert');
          });
        }
        summary = logsParts.length > 0 ? logsParts.join(' | ') : 'Nenhum oponente possuía cartas para descarte.';
        break;
      }

      // evt-02: Duplicate Report! (Escolha 1 oponente: descarta a vuln de maior CVSS na mesa; se mesa vazia, whiff/sem efeito)
      case 'evt-02': {
        let targetId =
          explicitTargetId ||
          activeIds.find(id => id !== authorRole && nextExploits.some(e => e.playerId === id));
        if (!targetId) {
          summary = 'Nenhum oponente possuía vulnerabilidades expostas na mesa (Whiff seguro: nenhum exploit descartado).';
          status = 'BLOCKED';
          break;
        }
        const def = checkNegativeEventDefense(targetId, true, true);
        if (def.redirectedTo) targetId = def.redirectedTo;
        if (def.blocked) {
          summary = def.reason!;
          status = 'BLOCKED';
          break;
        }
        const tExp = nextExploits.filter(e => e.playerId === targetId && !isProvaOob(e.card));
        if (tExp.length > 0) {
          const sorted = [...tExp].sort((a, b) => getCardCvssScore(b.card) - getCardCvssScore(a.card));
          const toRemove = sorted[0];
          nextExploits = nextExploits.filter(e => e.id !== toRemove.id);
          nextDiscard.push(toRemove.card);
          summary = `${nextPlayers[targetId].name} descartou a vulnerabilidade de maior CVSS [${toRemove.card.name}] da mesa!`;
          triggerEventAlert('📋 Duplicate Report!', `${authorPlayer.name} direcionou Duplicate Report! contra você: sua vulnerabilidade [${toRemove.card.name}] na mesa foi descartada!`, targetId, 'alert');
        } else {
          summary = `${nextPlayers[targetId].name} não possuía vulnerabilidades vulneráveis na mesa (Whiff: nenhum descarte).`;
          status = 'BLOCKED';
        }
        break;
      }

      // evt-03: Out of Scope! (Autor fica impedido de realizar Exploit no próximo turno)
      case 'evt-03': {
        let targetId = authorRole;
        const def = checkNegativeEventDefense(targetId, true, false);
        if (def.redirectedTo) targetId = def.redirectedTo;
        if (def.blocked) {
          summary = def.reason!;
          status = 'BLOCKED';
          break;
        }
        const tPlayer = nextPlayers[targetId];
        nextPlayers[targetId] = {
          ...tPlayer,
          statusEffects: { ...tPlayer.statusEffects, noExploitNextTurn: true }
        };
        summary = `${tPlayer.name} está impedido de realizar a ação EXPLOIT no seu próximo turno!`;
        if (targetId !== authorRole) {
          triggerEventAlert('⛔ Out of Scope!', `${authorPlayer.name} redirecionou Out of Scope!: você está impedido de realizar EXPLOIT no próximo turno!`, targetId, 'alert');
        }
        break;
      }

      // evt-04: Legal Threat! (Oponente paga $1.500 ou fica sem Report no próximo turno)
      case 'evt-04': {
        let targetId = explicitTargetId || activeIds.find(id => id !== authorRole) || authorRole;
        const def = checkNegativeEventDefense(targetId, false, false);
        if (def.redirectedTo) targetId = def.redirectedTo;
        if (def.blocked) {
          summary = def.reason!;
          status = 'BLOCKED';
          break;
        }
        const tPlayer = nextPlayers[targetId];
        if (tPlayer.score >= 1500) {
          nextPlayers[targetId] = { ...tPlayer, score: tPlayer.score - 1500 };
          summary = `⚖️ ${tPlayer.name} pagou -$1.500 de honorários advocatícios (saldo: $${(tPlayer.score - 1500).toLocaleString('pt-BR')}) para não perder o Report!`;
          triggerEventAlert('⚖️ Legal Threat!', `${authorPlayer.name} acionou Legal Threat!: você pagou -$1.500 de honorários!`, targetId, 'alert');
        } else {
          nextPlayers[targetId] = {
            ...tPlayer,
            statusEffects: { ...tPlayer.statusEffects, noReportNextTurn: true }
          };
          summary = `⚖️ ${tPlayer.name} não tinha $1.500 e ficou impedido de realizar REPORT no próximo turno!`;
          triggerEventAlert('⚖️ Legal Threat!', `${authorPlayer.name} acionou Legal Threat!: você está impedido de realizar REPORT no próximo turno!`, targetId, 'alert');
        }
        break;
      }

      // evt-05: Triage Delay! (Autor fica impedido de instalar ou ativar Tools no próximo turno)
      case 'evt-05': {
        let targetId = authorRole;
        const def = checkNegativeEventDefense(targetId, false, true);
        if (def.redirectedTo) targetId = def.redirectedTo;
        if (def.blocked) {
          summary = def.reason!;
          status = 'BLOCKED';
          break;
        }
        const tPlayer = nextPlayers[targetId];
        nextPlayers[targetId] = {
          ...tPlayer,
          statusEffects: { ...tPlayer.statusEffects, noToolsNextTurn: true }
        };
        summary = `⏳ ${tPlayer.name} está impedido de instalar ou ativar Tools no próximo turno!`;
        break;
      }

      // evt-06: Bug Bounty Mediation (Todos os jogadores ativos recebem +$1.500)
      case 'evt-06': {
        activeIds.forEach(rId => {
          nextPlayers[rId] = { ...nextPlayers[rId], score: nextPlayers[rId].score + 1500 };
        });
        summary = `Todos os ${activeIds.length} jogadores ativos receberam +$1.500 na Bounty Track!`;
        break;
      }

      // evt-07: Zero Day Disclosure (Jogador com menor saldo resgata 1 Tool da pilha de descarte)
      case 'evt-07': {
        const lowest = [...activeIds].map(id => nextPlayers[id]).sort((a, b) => a.score - b.score)[0];
        if (lowest) {
          if (nextToolDiscard.length > 0) {
            const rescued = nextToolDiscard[nextToolDiscard.length - 1];
            nextToolDiscard = nextToolDiscard.slice(0, -1);
            nextPlayers[lowest.id] = { ...lowest, hand: [...lowest.hand, rescued] };
            summary = `${lowest.name} (menor saldo) resgatou a Tool [${rescued.name}] da pilha de descarte para a mão!`;
          } else if (nextTools.length > 0) {
            const fallbackTool = nextTools[0];
            nextTools = nextTools.slice(1);
            nextPlayers[lowest.id] = { ...lowest, hand: [...lowest.hand, fallbackTool] };
            summary = `Pilha de descarte vazia: ${lowest.name} (menor saldo) recebeu [${fallbackTool.name}] do Tool Deck!`;
          } else {
            summary = `${lowest.name} tinha o menor saldo, mas não havia Tools disponíveis para resgate.`;
          }
        }
        break;
      }

      // evt-08: Scope Expansion! (Autor ignora restrições de escopo no próximo turno)
      case 'evt-08': {
        const p = nextPlayers[authorRole];
        nextPlayers[authorRole] = {
          ...p,
          statusEffects: { ...p.statusEffects, scopeExpansionNextTurn: true }
        };
        summary = `🌐 ${p.name} poderá baixar qualquer vulnerabilidade ignorando o escopo do programa no próximo turno!`;
        break;
      }

      // evt-09: Public Disclosure! (Todos descartam vulns na mesa e recebem indenização por raridade; se mesa vazia, whiff/sem efeito)
      case 'evt-09': {
        const parts: string[] = [];
        if (nextExploits.length > 0) {
          activeIds.forEach(rId => {
            const p = nextPlayers[rId];
            const pExp = nextExploits.filter(e => e.playerId === rId);
            if (pExp.length > 0) {
              const comp = pExp.reduce((sum, e) => {
                const r = e.card.rarity;
                if (r === 'Common' || r === 'Uncommon') return sum + 1000;
                if (r === 'Rare') return sum + 2000;
                if (r === 'Epic') return sum + 2500;
                if (r === 'Legendary') return sum + 3000;
                return sum + 1000;
              }, 0);
              nextPlayers[rId] = { ...p, score: p.score + comp };
              nextDiscard.push(...pExp.map(e => e.card));
              parts.push(`${p.name}: +$${comp.toLocaleString('pt-BR')} (${pExp.length} vuln)`);
            }
          });
          nextExploits = [];
          summary = `Indenizações pagas: ${parts.join(' | ')}`;
        } else {
          summary = 'Nenhum jogador possuía vulnerabilidades expostas na mesa (Whiff seguro: nenhum descarte).';
          status = 'BLOCKED';
        }
        break;
      }

      // evt-10: Bounty Increase! (Ativo por 1 rodada: qualquer Report bem-sucedido ganha +$1.500)
      case 'evt-10': {
        nextRoundEvents = [
          ...nextRoundEvents.filter(e => e.id !== 'evt-10'),
          {
            id: 'evt-10',
            name: 'Bounty Increase! (+$1.5k)',
            simpleDescription: 'Qualquer Report bem-sucedido nesta rodada recebe +$1.500 de bônus!',
            startedByRole: authorRole,
            startedAtRound: currentTurn
          }
        ];
        summary = `Ativo na mesa por 1 volta completa: todo Report bem-sucedido ganha +$1.500 extras!`;
        break;
      }

      // evt-11: WAF Deployed! (Classe INJ bloqueada por 1 rodada completa)
      case 'evt-11': {
        nextRoundEvents = [
          ...nextRoundEvents.filter(e => e.id !== 'evt-11'),
          {
            id: 'evt-11',
            name: 'WAF Deployed! (Sem INJ)',
            simpleDescription: 'Vulnerabilidades da classe INJ não podem ser baixadas por 1 rodada completa.',
            startedByRole: authorRole,
            startedAtRound: currentTurn
          }
        ];
        summary = `Filtro WAF ativo por 1 volta completa: vulnerabilidades da classe INJ estão bloqueadas!`;
        break;
      }

      // evt-12: DNS Hijack! (Líder descarta programa, pega próximo do deck e descarta vulns fora de escopo)
      case 'evt-12': {
        const leader = [...activeIds].map(id => nextPlayers[id]).sort((a, b) => b.score - a.score)[0];
        if (leader) {
          let targetId = leader.id;
          const def = checkNegativeEventDefense(targetId, true, false);
          if (def.redirectedTo) targetId = def.redirectedTo;
          if (def.blocked) {
            summary = def.reason!;
            status = 'BLOCKED';
            break;
          }
          const tPlayer = nextPlayers[targetId];
          const popped = popProgramsFromDeck(1, nextProgDeck, nextProgDiscard);
          const newProg = popped.drawn[0];
          nextProgDeck = popped.nextDeck;
          nextProgDiscard = popped.nextDiscard;
          if (tPlayer.activeProgram) nextProgDiscard.push(tPlayer.activeProgram);

          if (newProg) {
            nextPlayers[targetId] = { ...tPlayer, activeProgram: newProg };
            const tExp = nextExploits.filter(e => e.playerId === targetId);
            const removedNames: string[] = [];
            const keptForLeader: DeployedExploit[] = [];
            tExp.forEach(exp => {
              if (isProvaOob(exp.card)) {
                keptForLeader.push(exp);
                return;
              }
              const sc = checkCardScopeV14(exp.card, newProg, tPlayer.archetype, tPlayer.activeTools);
              if (sc.inScope) {
                keptForLeader.push(exp);
              } else {
                nextDiscard.push(exp.card);
                removedNames.push(exp.card.name);
              }
            });
            nextExploits = [...nextExploits.filter(e => e.playerId !== targetId), ...keptForLeader];
            summary = `${tPlayer.name} (Líder) teve o alvo trocado para [${newProg.name}]! ${removedNames.length > 0 ? `Exploits fora de escopo descartados: ${removedNames.join(', ')}.` : 'Seus exploits continuaram no escopo.'}`;
          }
        }
        break;
      }

      // evt-13: Responsible Disclosure! (Todos c/ vulns na mesa fazem 1 Report imediato sem dados)
      case 'evt-13': {
        const parts: string[] = [];
        activeIds.forEach(rId => {
          const p = nextPlayers[rId];
          const pExp = nextExploits.filter(e => e.playerId === rId);
          if (pExp.length > 0) {
            const vulnSum = pExp.reduce((s, e) => s + getVulnFlatValue(e.card), 0);
            const progBonus = p.activeProgram?.flatBountyBonus || 0;
            const total = vulnSum + progBonus;
            nextDiscard.push(...pExp.map(e => e.card));

            // Repõe imediatamente o programa do jogador a partir do deck para não deixá-lo sem programa
            let replacementProg = p.activeProgram;
            if (rId !== authorRole) {
              const popped = popProgramsFromDeck(1, nextProgDeck, nextProgDiscard);
              if (popped.drawn[0]) {
                if (p.activeProgram) nextProgDiscard.push(p.activeProgram);
                replacementProg = popped.drawn[0];
                nextProgDeck = popped.nextDeck;
                nextProgDiscard = popped.nextDiscard;
              }
            }
            nextPlayers[rId] = { ...p, score: p.score + total, activeProgram: replacementProg };
            parts.push(`${p.name} reportou ${pExp.length} vuln(s) (+$${total.toLocaleString('pt-BR')})`);
          }
        });
        nextExploits = [];
        summary = parts.length > 0 ? parts.join(' | ') : 'Nenhum outro jogador possuía vulnerabilidades na mesa.';
        break;
      }

      // evt-14: Honeypot Triggered! (Escolha 1 oponente: descarta 2 cartas aleatórias da mão; 1 em duelo)
      case 'evt-14': {
        let targetId = explicitTargetId || activeIds.find(id => id !== authorRole && nextPlayers[id].hand.length > 0);
        if (!targetId) {
          summary = 'Nenhum oponente possuía cartas na mão para o Honeypot Triggered.';
          status = 'BLOCKED';
          break;
        }
        const def = checkNegativeEventDefense(targetId, false, false);
        if (def.redirectedTo) targetId = def.redirectedTo;
        if (def.blocked) {
          summary = def.reason!;
          status = 'BLOCKED';
          break;
        }
        const tPlayer = nextPlayers[targetId];
        const discardQty = playerCount <= 2 ? 1 : 2;
        const shuffledHand = shuffleArray([...tPlayer.hand]);
        const toDrop = shuffledHand.slice(0, discardQty);
        const dropIds = new Set(toDrop.map(c => c.id));
        nextPlayers[targetId] = {
          ...tPlayer,
          hand: tPlayer.hand.filter(c => !dropIds.has(c.id))
        };
        nextDiscard.push(...toDrop);
        summary = `🍯 ${tPlayer.name} caiu no Honeypot e descartou ${toDrop.length} carta(s) aleatória(s) da mão: [${toDrop.map(c => c.name).join(', ')}]!`;
        triggerEventAlert('🍯 Honeypot Triggered!', `${authorPlayer.name} acionou Honeypot!: você descartou [${toDrop.map(c => c.name).join(', ')}] da sua mão!`, targetId, 'alert');
        break;
      }

      // evt-15: CVE Assignment Delayed! (Safeguards bloqueados por 1 rodada completa)
      case 'evt-15': {
        nextRoundEvents = [
          ...nextRoundEvents.filter(e => e.id !== 'evt-15'),
          {
            id: 'evt-15',
            name: 'CVE Assignment Delayed!',
            simpleDescription: 'Cartas Safeguard (Bypass e CVE Protection) estão bloqueadas por 1 rodada completa.',
            startedByRole: authorRole,
            startedAtRound: currentTurn
          }
        ];
        summary = `Cartas de Defesa (Safeguard: Bypass e CVE Protection) estão bloqueadas por 1 rodada completa!`;
        break;
      }

      // evt-16: Bug Collision! (Todos descartam a vulnerabilidade de menor CVSS exposta na mesa; se mesa vazia, oponentes descartam 1 carta da mão)
      case 'evt-16': {
        const parts: string[] = [];
        const kept: DeployedExploit[] = [];
        if (nextExploits.length > 0) {
          activeIds.forEach(rId => {
            const pExp = nextExploits.filter(e => e.playerId === rId);
            if (pExp.length === 0) return;
            const def = checkNegativeEventDefense(rId, false, false);
            if (def.blocked) {
              kept.push(...pExp);
              parts.push(def.reason!);
              return;
            }
            const vulnerableExp = pExp.filter(e => !isProvaOob(e.card));
            const immuneExp = pExp.filter(e => isProvaOob(e.card));
            if (vulnerableExp.length === 0) {
              kept.push(...pExp);
              return;
            }
            const sorted = [...vulnerableExp].sort((a, b) => getCardCvssScore(a.card) - getCardCvssScore(b.card));
            const lowestExp = sorted[0];
            nextDiscard.push(lowestExp.card);
            kept.push(...sorted.slice(1), ...immuneExp);
            parts.push(`${nextPlayers[rId].name} perdeu [${lowestExp.card.name}] da mesa`);
          });
          nextExploits = kept;
          summary = parts.length > 0 ? parts.join(' | ') : 'Nenhuma vulnerabilidade foi afetada.';
        } else {
          summary = 'Nenhum jogador possuía vulnerabilidades expostas na mesa (Whiff seguro: nenhum descarte).';
          status = 'BLOCKED';
        }
        break;
      }

      // evt-17: Hall of Fame Update! (Jogador em último lugar recebe +$1.500 no próximo Report)
      case 'evt-17': {
        const lowest = [...activeIds].map(id => nextPlayers[id]).sort((a, b) => a.score - b.score)[0];
        if (lowest) {
          nextPlayers[lowest.id] = {
            ...lowest,
            statusEffects: { ...lowest.statusEffects, hallOfFameBonus: (lowest.statusEffects?.hallOfFameBonus || 0) + 1500 }
          };
          summary = `🏆 ${lowest.name} (menor saldo) receberá +$1.500 de bônus no seu próximo Report bem-sucedido!`;
        }
        break;
      }

      // evt-18: Rate Limited! (Todos ficam impedidos de comprar cartas no Recon no próximo turno)
      case 'evt-18': {
        const parts: string[] = [];
        activeIds.forEach(rId => {
          const def = checkNegativeEventDefense(rId, false, false);
          if (def.blocked) {
            parts.push(def.reason!);
            return;
          }
          nextPlayers[rId] = {
            ...nextPlayers[rId],
            statusEffects: { ...nextPlayers[rId].statusEffects, noReconNextTurn: true }
          };
          parts.push(`${nextPlayers[rId].name} sem Recon`);
        });
        summary = `🛑 Rate Limited aplicado: ${parts.join(' | ')}`;
        break;
      }

      // evt-19: 2FA Enforced! (Classe AUTH bloqueada por 1 rodada completa)
      case 'evt-19': {
        nextRoundEvents = [
          ...nextRoundEvents.filter(e => e.id !== 'evt-19'),
          {
            id: 'evt-19',
            name: '2FA Enforced! (Sem AUTH)',
            simpleDescription: 'Vulnerabilidades da classe AUTH não podem ser baixadas na mesa por 1 rodada.',
            startedByRole: authorRole,
            startedAtRound: currentTurn
          }
        ];
        summary = `🔐 2FA Enforced ativo por 1 volta completa: vulnerabilidades da classe AUTH estão bloqueadas!`;
        break;
      }

      // evt-20: Bug Bounty Conference! (Todos os jogadores ativos compram 2 cartas do Main Deck)
      case 'evt-20': {
        activeIds.forEach(rId => {
          const popped = popCardsFromMainDeck(2, nextMain, nextDiscard);
          nextMain = popped.nextMain;
          nextDiscard = popped.nextDiscard;
          nextPlayers[rId] = { ...nextPlayers[rId], hand: [...nextPlayers[rId].hand, ...popped.drawn] };
        });
        summary = `🎪 Todos os ${activeIds.length} jogadores ativos compraram +2 cartas do Main Deck!`;
        break;
      }

      // evt-21: Acquisition! (Descarta e repõe os 3 programas do mercado; se algum tiver ALL, todos ganham +$500)
      case 'evt-21': {
        nextProgDiscard.push(...nextMarket);
        const popped = popProgramsFromDeck(3, nextProgDeck, nextProgDiscard);
        nextMarket = popped.drawn;
        nextProgDeck = popped.nextDeck;
        nextProgDiscard = popped.nextDiscard;
        const hasAllScope = nextMarket.some(m =>
          m.allowedClasses === 'ALL' ||
          (Array.isArray(m.allowedClasses) && m.allowedClasses.some(c => String(c).toUpperCase().includes('ALL')))
        );
        if (hasAllScope) {
          activeIds.forEach(rId => {
            nextPlayers[rId] = { ...nextPlayers[rId], score: nextPlayers[rId].score + 500 };
          });
        }
        summary = `Mercado renovado para [${nextMarket.map(m => m.name).join(', ')}]. ${hasAllScope ? 'Há programa com escopo ALL: todos ganharam +$500!' : 'Nenhum programa com escopo ALL.'}`;
        break;
      }

      // evt-22: Security Audit! (Todos revelam a mão e descartam a carta de maior CVSS)
      case 'evt-22': {
        const parts: string[] = [];
        activeIds.forEach(rId => {
          const p = nextPlayers[rId];
          if (p.hand.length === 0) return;
          const def = checkNegativeEventDefense(rId, false, false);
          if (def.blocked) {
            parts.push(def.reason!);
            return;
          }
          const sortedHand = [...p.hand].sort((a, b) => getCardCvssScore(b) - getCardCvssScore(a));
          const highestCard = sortedHand[0];
          nextPlayers[rId] = { ...p, hand: p.hand.filter(c => c.id !== highestCard.id) };
          nextDiscard.push(highestCard);
          parts.push(`${p.name} descartou [${highestCard.name}]`);
          if (rId !== authorRole) {
            triggerEventAlert('📅 Auditoria de Segurança (evt-22)!', `${authorPlayer.name} disparou Security Audit!: você revelou sua mão e descartou [${highestCard.name}] (CVSS ${getCardCvssScore(highestCard)})!`, rId, 'alert');
          }
        });
        summary = parts.length > 0 ? `📅 Auditoria concluída: ${parts.join(' | ')}` : 'Ninguém possuía cartas na mão.';
        break;
      }

      // evt-23: Swag Drop! (Cada jogador ativo compra 1 Tool Card do Tool Deck)
      case 'evt-23': {
        const parts: string[] = [];
        activeIds.forEach(rId => {
          const popped = popCardsFromToolDeck(1, nextTools, nextToolDiscard);
          nextTools = popped.nextToolDeck;
          nextToolDiscard = popped.nextToolDiscard;
          if (popped.drawn[0]) {
            nextPlayers[rId] = { ...nextPlayers[rId], hand: [...nextPlayers[rId].hand, popped.drawn[0]] };
            parts.push(`${nextPlayers[rId].name} recebeu [${popped.drawn[0].name}]`);
          }
        });
        summary = `🎁 Swag Drop: ${parts.join(' | ')}`;
        break;
      }

      // evt-24: Bounty Ético (Jogadores ativos com 0 Alertas recebem +$1.500)
      case 'evt-24': {
        const rewarded: string[] = [];
        activeIds.forEach(rId => {
          if (nextPlayers[rId].alertaTokens === 0) {
            nextPlayers[rId] = { ...nextPlayers[rId], score: nextPlayers[rId].score + 1500 };
            rewarded.push(nextPlayers[rId].name);
          }
        });
        summary = rewarded.length > 0
          ? `🌟 Conduta Ética (0 Alertas): ${rewarded.join(', ')} recebeu +$1.500 na Bounty Track!`
          : 'Nenhum jogador estava com 0 Tokens de Alerta.';
        break;
      }

      default:
        summary = `Evento [${eventCard.name}] processado.`;
    }

    setPlayers(nextPlayers);
    setDeployedExploits(nextExploits);
    setMainDeck(nextMain);
    setDiscardPile(nextDiscard);
    setToolDeck(nextTools);
    setToolDiscard(nextToolDiscard);
    setProgramMarket(nextMarket);
    setProgramDeck(nextProgDeck);
    setProgramDiscard(nextProgDiscard);
    setActiveRoundEvents(nextRoundEvents);
    setLastEventResolutionSummary(summary);
    setPendingTargetedEvent(null);

    recordAudit('EVENT', `Evento #${eventCard.number}: ${eventCard.name}`, summary, authorPlayer, status);
    supabaseSync.broadcast('STATE_SYNC', {
      players: nextPlayers,
      deployedExploits: nextExploits,
      programMarket: nextMarket,
      mainDeck: nextMain,
      discardPile: nextDiscard,
      toolDeck: nextTools,
      toolDiscard: nextToolDiscard,
      programDeck: nextProgDeck,
      programDiscard: nextProgDiscard,
      activeRoundEvents: nextRoundEvents,
      auditLogs: auditLogsRef.current,
      playerMetrics: playerMetricsRef.current
    });
  };

  const resolveTargetedEvent = (targetPlayerId: string) => {
    if (!pendingTargetedEvent) return;
    executeEventCardOnState(
      pendingTargetedEvent.eventCard,
      players,
      deployedExploits,
      activePlayerRole,
      targetPlayerId as PlayerRoleId
    );
  };

  const drawEventCard = () => {
    let availEvents = [...eventDeck];
    let availEventDisc = [...eventDiscard];
    if (availEvents.length === 0 && availEventDisc.length > 0) {
      availEvents = shuffleArray(availEventDisc);
      availEventDisc = [];
    }
    if (availEvents.length === 0) return;
    const [top, ...rest] = availEvents;
    setEventDeck(rest);
    setEventDiscard([...availEventDisc, top]);
    setActiveEventCard(top);
    setLastEventResolutionSummary(null);
    bumpMetric(myRole, m => ({ eventsDrawn: m.eventsDrawn + 1 }));
    executeEventCardOnState(top, players, deployedExploits, myRole);
  };

  const closeEventModal = () => {
    setActiveEventCard(null);
    setLastEventResolutionSummary(null);
    setPendingTargetedEvent(null);
  };

  const movePawn = (targetNodeId: string) => setPlayerNodeId(targetNodeId);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. RECON (Custa 1 AP) -> Compra 2 cartas do Main Deck (3 c/ PortSweep; x2 c/ XSS-10 + DevTools)
  // ─────────────────────────────────────────────────────────────────────────────
  const actionVarrer = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.actionsRemaining < 1) { alert('Sem ações restantes!'); return; }
    if (currentPlayer.statusEffects?.noReconNextTurn) {
      alert('🛑 Evento Rate Limited! ativo: você está impedido de realizar a ação Recon (comprar cartas) neste turno!');
      return;
    }

    soundFx.playScan();
    const portSweepCount = countPlayerTool(currentPlayer, 'T-10');
    const devToolsCount = countPlayerTool(currentPlayer, 'T-01');
    const hasNarcissistMirror = deployedExploits.some(
      e => e.playerId === myRole && (e.card.canonicalId || e.card.id) === 'XSS-10'
    );

    let drawQty = 2 + portSweepCount;
    if (devToolsCount > 0 && hasNarcissistMirror) {
      drawQty *= 2;
    }

    const popped = popCardsFromMainDeck(drawQty, mainDeck, discardPile);
    setMainDeck(popped.nextMain);
    setDiscardPile(popped.nextDiscard);

    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        hand: [...currentPlayer.hand, ...popped.drawn],
        actionsRemaining: currentPlayer.actionsRemaining - 1
      }
    };
    setPlayers(updatedPlayers);

    if (portSweepCount > 0) {
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', 'PortSweep (Passiva no Recon)', `${currentPlayer.name} comprou +${portSweepCount} carta(s) extra no Recon graças à Tool PortSweep!`, currentPlayer, 'PASSIVE');
    }
    recordAudit('RECON', `Compra de +${popped.drawn.length} Cartas (1 AP)`, `Cartas compradas: [${popped.drawn.map(c => c.name).join(', ')}]. APs restantes: ${currentPlayer.actionsRemaining - 1}/3.`, currentPlayer, 'EXECUTED');
    supabaseSync.broadcast('STATE_SYNC', {
      players: updatedPlayers,
      mainDeck: popped.nextMain,
      discardPile: popped.nextDiscard
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. EXPLOIT (Custa 1 AP; ou 0 AP se bônus SpiderScan / Efeito Dominó ativo)
  // ─────────────────────────────────────────────────────────────────────────────
  const actionInfiltrar = (cardId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    const isFreeBonusDeploy = freeExploitDeploysRemaining > 0;
    if (!isFreeBonusDeploy && currentPlayer.actionsRemaining < 1) {
      alert('Sem ações restantes!');
      return;
    }

    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card || card.type !== 'exploit') return;

    if (!currentPlayer.activeProgram) {
      alert('Selecione primeiro um Programa Corporativo!');
      return;
    }

    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    if (myExploits.length >= 3) {
      alert('Limite máximo de 3 vulnerabilidades na Zona de Exploits atingido!');
      return;
    }

    const scopeCheck = checkCardScopeV14(
      card,
      currentPlayer.activeProgram,
      currentPlayer.archetype,
      currentPlayer.activeTools,
      currentScopeOptions
    );
    if (!scopeCheck.inScope) {
      soundFx.playPatchDeployedAlarm();
      alert(`❌ JOGADA INVÁLIDA!\n${scopeCheck.rejectionReason || 'Vulnerabilidade fora de escopo.'}`);
      return;
    }

    soundFx.playClick();
    const newExploit: DeployedExploit = { id: Math.random().toString(), nodeId: playerNodeId, card, playerId: myRole };
    const nextExploits = [...deployedExploits, newExploit];
    setDeployedExploits(nextExploits);

    const apCost = isFreeBonusDeploy ? 0 : 1;
    let nextFreeDeploys = Math.max(0, freeExploitDeploysRemaining - (isFreeBonusDeploy ? 1 : 0));

    // Tool Passiva T-11 (SpiderScan): Na 1ª ação de Exploit do turno, desce 2 vulnerabilidades em vez de 1
    const hasSpiderScan = countPlayerTool(currentPlayer, 'T-11') > 0;
    if (exploitsPlayedThisTurn === 0 && hasSpiderScan && nextExploits.filter(e => e.playerId === myRole).length < 3) {
      nextFreeDeploys += 1;
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', 'SpiderScan (Passiva no Exploit)', `${currentPlayer.name} ganhou +1 descida de vulnerabilidade GRÁTIS (0 AP) neste turno!`, currentPlayer, 'PASSIVE');
    }

    // Habilidade Especial: EFEITO DOMINÓ (#APT-1) -> Ao descer, baixa +1 vulnerabilidade adicional da mão
    const baseId = (card.canonicalId || card.id).toUpperCase();
    if (baseId === 'APT-1' && nextExploits.filter(e => e.playerId === myRole).length < 3) {
      nextFreeDeploys += 1;
      recordAudit('EXPLOIT', 'Habilidade Especial: EFEITO DOMINÓ (#APT-1)', `${currentPlayer.name} pode baixar +1 vulnerabilidade adicional da mão por 0 AP!`, currentPlayer, 'PASSIVE');
    }

    // Habilidade Especial: ROTAÇÃO DE MERCADO (#BAC-13 e #CRYPTO-6) -> Ao descer, rotaciona 1 programa do mercado
    if ((baseId === 'BAC-13' || baseId === 'CRYPTO-6') && programMarket.length > 0) {
      const popped = popProgramsFromDeck(1, programDeck, programDiscard);
      if (popped.drawn[0]) {
        const replaced = programMarket[0];
        setProgramDiscard([...popped.nextDiscard, replaced]);
        setProgramDeck(popped.nextDeck);
        setProgramMarket([popped.drawn[0], ...programMarket.slice(1)]);
        recordAudit('PROGRAM', `Rotação de Mercado (${card.name})`, `Descartou [${replaced.name}] do mercado e revelou [${popped.drawn[0].name}]!`, currentPlayer, 'EXECUTED');
      }
    }

    // Registra uso de fura-escopo (Red Teamer / Endpoint Lab / Injection Lab)
    if (scopeCheck.badgeLabel.includes('ENDPOINT LAB') || scopeCheck.badgeLabel.includes('INJECTION LAB')) {
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', `Fura-Escopo Passivo (${scopeCheck.badgeLabel})`, `${currentPlayer.name} baixou [${card.name}] fora do escopo original de [${currentPlayer.activeProgram.name}].`, currentPlayer, 'PASSIVE');
    }

    setExploitsPlayedThisTurn(prev => prev + 1);
    setFreeExploitDeploysRemaining(nextFreeDeploys);

    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => c.id !== cardId),
        actionsRemaining: currentPlayer.actionsRemaining - apCost
      }
    };
    setPlayers(updatedPlayers);

    recordAudit(
      'EXPLOIT',
      `Vulnerabilidade Baixada (${apCost} AP): ${card.name}`,
      `Classe: ${card.vulnClass} | Raridade: ${card.rarity} (+$${card.points}) | Escopo: ${scopeCheck.badgeLabel}.`,
      updatedPlayers[myRole],
      'EXECUTED'
    );

    supabaseSync.broadcast('STATE_SYNC', {
      players: updatedPlayers,
      deployedExploits: nextExploits
    });
  };

  const discardCardFromHand = (cardId: string) => {
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;
    soundFx.playClick();
    const updatedHand = currentPlayer.hand.filter(c => c.id !== cardId);
    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: { ...currentPlayer, hand: updatedHand }
    };
    const nextDisc = [...discardPile, card];
    setPlayers(updatedPlayers);
    setDiscardPile(nextDisc);
    recordAudit('TURN', `Descarte da Mão: ${card.name}`, `${currentPlayer.name} descartou [${card.name}] (${updatedHand.length}/${dynamicMaxHandSize} na mão).`, updatedPlayers[myRole], 'EXECUTED');

    supabaseSync.broadcast('STATE_SYNC', {
      players: updatedPlayers,
      discardPile: nextDisc
    });

    if (pendingTurnAdvance && updatedHand.length <= dynamicMaxHandSize) {
      setPendingTurnAdvance(false);
      finalizeTurnAdvance(updatedPlayers);
    }
  };

  const recycleHandCards = (cardId1: string, cardId2: string) => {
    if (!isMyTurn) {
      alert('Aguarde a sua vez para reciclar cartas!');
      return;
    }
    if (recycledThisTurn) {
      alert('Regra de Ação Livre: A Reciclagem 2:1 (0 AP) só pode ser utilizada 1 vez por turno!');
      return;
    }
    if (!cardId1 || !cardId2 || cardId1 === cardId2) {
      alert('Selecione exatamente 2 cartas distintas da sua mão para reciclar!');
      return;
    }
    const c1 = currentPlayer.hand.find(c => c.id === cardId1);
    const c2 = currentPlayer.hand.find(c => c.id === cardId2);
    if (!c1 || !c2) {
      alert('Erro na seleção de cartas: uma das cartas não foi encontrada na mão!');
      return;
    }
    soundFx.playScan();
    let nextDisc = [...discardPile, c1, c2];
    const popped = popCardsFromMainDeck(1, mainDeck, nextDisc);
    setMainDeck(popped.nextMain);
    setDiscardPile(popped.nextDiscard);
    setRecycledThisTurn(true);
    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        hand: [...currentPlayer.hand.filter(c => c.id !== cardId1 && c.id !== cardId2), ...popped.drawn]
      }
    };
    setPlayers(updatedPlayers);
    supabaseSync.broadcast('STATE_SYNC', {
      players: updatedPlayers,
      mainDeck: popped.nextMain,
      discardPile: popped.nextDiscard
    });
    recordAudit('RECON', 'Reciclagem 2:1 (0 AP)', `${currentPlayer.name} descartou [${c1.name}, ${c2.name}] e comprou [${popped.drawn[0]?.name || 'carta'}] (saldo de mão: -1 carta).`, updatedPlayers[myRole], 'EXECUTED');
  };

  const abandonActiveProgram = () => {
    // Mantido por compatibilidade; a troca agora acontece direto no seletor sem deixar o jogador sem programa
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOLS: INSTALAÇÃO (1x/turno pagando 1 carta da mão) & ATIVAÇÃO
  // ─────────────────────────────────────────────────────────────────────────────
  const moveCardToToolsRack = (cardId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.statusEffects?.noToolsNextTurn) {
      alert('⏳ Evento Triage Delay! ativo: você está impedido de instalar ou ativar Tools neste turno!');
      return;
    }
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;
    if (currentPlayer.activeTools.length >= 3) {
      alert('Tools Rack cheio! Limite de 3 ferramentas instaladas simultaneamente.');
      return;
    }
    if (toolInstalledThisTurn && !freeToolInstallAvailable) {
      alert('Regra de Ação Livre (Manual §03): Você só pode instalar 1 Tool Card por turno!');
      return;
    }

    // Se atingiu a Casa Especial de $24.500 (🛠️⚡), instala de graça sem descartar carta da mão!
    if (freeToolInstallAvailable) {
      soundFx.playClick();
      setFreeToolInstallAvailable(false);
      const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
        ...players,
        [myRole]: {
          ...currentPlayer,
          hand: currentPlayer.hand.filter(c => c.id !== card.id),
          activeTools: [...currentPlayer.activeTools, card]
        }
      };
      setPlayers(updatedPlayersState);
      bumpMetric(myRole, m => ({ toolsInstalled: m.toolsInstalled + 1 }));
      recordAudit('TOOL', `Tool Instalada Grátis ($24.5k): ${card.name}`, `${currentPlayer.name} instalou [${card.name}] sem custo de descarte! Efeito: ${card.simpleDescription}`, updatedPlayersState[myRole], 'EXECUTED');
      supabaseSync.broadcast('STATE_SYNC', { players: updatedPlayersState });
      return;
    }

    if (currentPlayer.hand.length < 2) {
      alert('Instalar uma Tool exige descartar 1 outra carta da sua mão como custo!');
      return;
    }
    setPendingToolInstall(card);
  };

  const cancelToolInstall = () => setPendingToolInstall(null);

  const confirmToolInstall = (discardCardId: string) => {
    if (!pendingToolInstall) return;
    soundFx.playClick();
    const discardCard = currentPlayer.hand.find(c => c.id === discardCardId);
    let nextDiscard = [...discardPile];
    if (discardCard) {
      nextDiscard.push(discardCard);
      setDiscardPile(nextDiscard);
    }
    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => c.id !== pendingToolInstall.id && c.id !== discardCardId),
        activeTools: [...currentPlayer.activeTools, pendingToolInstall]
      }
    };
    setPlayers(updatedPlayersState);
    setToolInstalledThisTurn(true);
    bumpMetric(myRole, m => ({ toolsInstalled: m.toolsInstalled + 1 }));
    recordAudit(
      'TOOL',
      `Tool Instalada: ${pendingToolInstall.name}`,
      `${currentPlayer.name} sacrificou "${discardCard?.name || 'carta'}" da mão para instalar [${pendingToolInstall.name}]. Regra: ${pendingToolInstall.simpleDescription}`,
      updatedPlayersState[myRole],
      'EXECUTED'
    );
    supabaseSync.broadcast('STATE_SYNC', {
      players: updatedPlayersState,
      discardPile: nextDiscard
    });
    setPendingToolInstall(null);
  };

  // Ativação manual das Tools ATIVAS instaladas no tapete (T-05 Exploit Forge, T-06 FuzzStorm, T-07 Hex Kitchen)
  const activateInstalledTool = (toolInstanceId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez para ativar Tools!'); return; }
    if (currentPlayer.statusEffects?.noToolsNextTurn) {
      alert('⏳ Evento Triage Delay! ativo: você está impedido de instalar ou ativar Tools neste turno!');
      return;
    }
    const tool = currentPlayer.activeTools.find(t => t.id === toolInstanceId);
    if (!tool) return;

    const code = (tool.toolId || tool.canonicalId || tool.id).toUpperCase();

    if (code.startsWith('T-09')) {
      alert('🧰 Interceptor Pro é uma Tool ATIVA REATIVA: ela dispara automaticamente quando você for alvo de um Event Card negativo!');
      return;
    }

    if (tool.toolType !== 'ATIVA') {
      alert(`🟢 [${tool.name}] é uma Tool PASSIVA: seu efeito já está ativo continuamente enquanto permanecer instalada no seu tapete!`);
      return;
    }

    soundFx.playScan();
    // Remove do slot e envia para a pilha de descarte de Tools
    const remainingTools = currentPlayer.activeTools.filter(t => t.id !== toolInstanceId);
    setToolDiscard(prev => [...prev, tool]);
    bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));

    // T-05: Exploit Forge -> Renove os 3 Programas expostos. Se algum aceitar APT ou ALL, +$500; senão compra 1 carta do Main Deck.
    if (code.startsWith('T-05')) {
      const oldMarketNames = programMarket.map(m => m.name).join(', ');
      const popped = popProgramsFromDeck(3, programDeck, [...programDiscard, ...programMarket]);
      const newMarket = popped.drawn;
      setProgramMarket(newMarket);
      setProgramDeck(popped.nextDeck);
      setProgramDiscard(popped.nextDiscard);

      const hasAptOrAll = newMarket.some(m =>
        m.allowedClasses === 'ALL' ||
        (Array.isArray(m.allowedClasses) && m.allowedClasses.some(c => {
          const u = String(c).toUpperCase();
          return u === 'APT' || u === 'ALL' || u.includes('ALL');
        }))
      );

      if (hasAptOrAll) {
        updateCurrentPlayer(p => ({ ...p, activeTools: remainingTools, score: p.score + 500 }));
        recordAudit('TOOL', 'Tool Ativada: Exploit Forge (+$500)', `${currentPlayer.name} descartou [${oldMarketNames}], revelou [${newMarket.map(m => m.name).join(', ')}] e ganhou +$500 (escopo APT/ALL encontrado)!`, currentPlayer, 'EXECUTED');
      } else {
        const drawnMain = popCardsFromMainDeck(1, mainDeck, discardPile);
        setMainDeck(drawnMain.nextMain);
        setDiscardPile(drawnMain.nextDiscard);
        updateCurrentPlayer(p => ({
          ...p,
          activeTools: remainingTools,
          hand: [...p.hand, ...drawnMain.drawn]
        }));
        recordAudit('TOOL', 'Tool Ativada: Exploit Forge (+1 Carta)', `${currentPlayer.name} renovou o mercado para [${newMarket.map(m => m.name).join(', ')}] e comprou [${drawnMain.drawn[0]?.name}] do Main Deck!`, currentPlayer, 'EXECUTED');
      }
      return;
    }

    // T-06: FuzzStorm -> Olhe as 3 primeiras cartas do Main Deck: compre 1 para a mão e organize as outras 2 no topo.
    if (code.startsWith('T-06')) {
      updateCurrentPlayer(p => ({ ...p, activeTools: remainingTools }));
      const popped = popCardsFromMainDeck(3, mainDeck, discardPile);
      setMainDeck(popped.nextMain);
      setDiscardPile(popped.nextDiscard);
      setPendingDeckPeek({
        mode: 'fuzzStorm',
        title: '🎯 FuzzStorm Ativada: Inspecione o Topo do Main Deck',
        subtitle: 'Escolha 1 carta para comprar para a sua mão e defina a ordem das outras 2 no topo',
        cards: popped.drawn.map(c => ({
          id: c.id,
          name: `${c.icon} ${c.name} (${c.vulnClass || c.type})`,
          description: c.simpleDescription,
          raw: c
        }))
      });
      return;
    }

    // T-07: Hex Kitchen -> Olhe as 3 primeiras cartas do Event Deck, descarte 1 delas e devolva as demais em qualquer ordem.
    if (code.startsWith('T-07')) {
      updateCurrentPlayer(p => ({ ...p, activeTools: remainingTools }));
      let availEvents = [...eventDeck];
      let availDisc = [...eventDiscard];
      if (availEvents.length < 3 && availDisc.length > 0) {
        availEvents = [...availEvents, ...shuffleArray(availDisc)];
        availDisc = [];
      }
      const top3 = availEvents.slice(0, 3);
      const restEvents = availEvents.slice(3);
      setEventDeck(restEvents);
      setEventDiscard(availDisc);
      setPendingDeckPeek({
        mode: 'hexKitchen',
        title: '🍳 Hex Kitchen Ativada: Decodifique o Event Deck',
        subtitle: 'Escolha 1 Evento para descartar e defina a ordem dos outros 2 no topo do Event Deck',
        cards: top3.map(e => ({
          id: e.id,
          name: `🚨 ${e.name}`,
          description: e.simpleDescription,
          raw: e
        }))
      });
      return;
    }
  };

  // Resolução do Modal Interativo de Inspeção de Topo de Baralho (FuzzStorm, Hex Kitchen, Panóptico, n00b)
  const resolveDeckPeek = (selectedIndex: number, remainingOrder: number[]) => {
    if (!pendingDeckPeek) return;
    const { mode, cards } = pendingDeckPeek;
    const chosen = cards[selectedIndex]?.raw;
    const orderedTop = remainingOrder.map(i => cards[i]?.raw).filter(Boolean);

    if (mode === 'fuzzStorm') {
      if (chosen) {
        updateCurrentPlayer(p => ({ ...p, hand: [...p.hand, chosen] }));
      }
      setMainDeck(prev => [...orderedTop, ...prev]);
      recordAudit('TOOL', 'FuzzStorm Concluída', `${currentPlayer.name} comprou [${chosen?.name}] e organizou no topo do Main Deck: [${orderedTop.map((c: any) => c.name).join(' ➔ ')}].`, currentPlayer, 'EXECUTED');
    } else if (mode === 'hexKitchen' || mode === 'panoptico') {
      if (chosen) {
        setEventDiscard(prev => [...prev, chosen]);
      }
      setEventDeck(prev => [...orderedTop, ...prev]);
      recordAudit(
        mode === 'hexKitchen' ? 'TOOL' : 'EXPLOIT',
        mode === 'hexKitchen' ? 'Hex Kitchen Concluída' : 'Panóptico (#BAC-14) Concluído',
        `${currentPlayer.name} descartou o evento [${chosen?.name}] e organizou no topo do Event Deck: [${orderedTop.map((e: any) => e.name).join(' ➔ ')}].`,
        currentPlayer,
        'EXECUTED'
      );
    } else if (mode === 'noobTool') {
      if (chosen) {
        updateCurrentPlayer(p => ({ ...p, hand: [...p.hand, chosen] }));
      }
      // As tools não escolhidas são devolvidas ao FUNDO do Tool Deck (evitando repetição contínua no topo)
      setToolDeck(prev => [...prev, ...orderedTop]);
      bumpMetric(myRole, m => ({ archetypeTriggers: m.archetypeTriggers + 1 }));
      recordAudit('ARCHETYPE', 'n00b (Garimpeiro de Ferramentas)', `${currentPlayer.name} inspecionou 3 Tools, escolheu [${chosen?.name}] para a mão e colocou as outras no fundo do Tool Deck.`, currentPlayer, 'EXECUTED');
    }

    setPendingDeckPeek(null);
  };

  const moveCardToDefuseSlot = (cardId: string) => {
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card || card.type !== 'defuse') return;

    const isCve = card.name.includes('CVE') || (card.technicalReference || '').includes('CVE');
    if (isCve) {
      if (currentPlayer.cveProtection) {
        alert('Você já possui uma CVE Assignment Protection instalada no Safeguard!');
        return;
      }
      soundFx.playClick();
      const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
        ...players,
        [myRole]: {
          ...currentPlayer,
          hand: currentPlayer.hand.filter(c => c.id !== cardId),
          cveProtection: card
        }
      };
      setPlayers(updatedPlayersState);
      recordAudit('TURN', 'CVE Protection Equipada', `${currentPlayer.name} alocou [CVE Assignment Protection] no Slot Safeguard.`, updatedPlayersState[myRole], 'EXECUTED');
      supabaseSync.broadcast('STATE_SYNC', { players: updatedPlayersState });
    } else {
      if (currentPlayer.safeguardSlot) {
        alert('Você já possui um Bypass instalado no Slot Safeguard!');
        return;
      }
      soundFx.playClick();
      const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
        ...players,
        [myRole]: {
          ...currentPlayer,
          hand: currentPlayer.hand.filter(c => c.id !== cardId),
          safeguardSlot: card
        }
      };
      setPlayers(updatedPlayersState);
      recordAudit('TURN', 'Bypass Equipado', `${currentPlayer.name} alocou [Bypass] no Slot Safeguard.`, updatedPlayersState[myRole], 'EXECUTED');
      supabaseSync.broadcast('STATE_SYNC', { players: updatedPlayersState });
    }
  };

  const activateCveProtection = () => {
    const cveCard = currentPlayer.hand.find(c => c.name.includes('CVE') || c.technicalReference.includes('CVE'));
    if (!cveCard) return;
    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => c.id !== cveCard.id),
        cveProtection: cveCard
      }
    };
    setPlayers(updatedPlayersState);
    supabaseSync.broadcast('STATE_SYNC', { players: updatedPlayersState });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. REPORT (Custa 2 AP — Sempre a última ação do turno)
  // ─────────────────────────────────────────────────────────────────────────────
  const actionReportar = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.statusEffects?.noReportNextTurn) {
      alert('⚖️ Evento Legal Threat! ativo: você está impedido de realizar a ação Report neste turno!');
      return;
    }
    if (currentPlayer.actionsRemaining < 2) {
      alert(`Report custa 2 Ações! Você tem ${currentPlayer.actionsRemaining} AP restante.`);
      return;
    }
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    if (myExploits.length === 0) {
      alert('Você precisa ter pelo menos 1 Exploit na mesa para reportar!');
      return;
    }
    if (!currentPlayer.activeProgram) {
      alert('Sem programa ativo selecionado!');
      return;
    }

    setDiceRollReason('report');
    setIsStealthMode(false);
    setIsDiceModalOpen(true);
    recordAudit('REPORT', `Report Iniciado em [${currentPlayer.activeProgram.name}]`, `${currentPlayer.name} submeteu ${myExploits.length} vuln(s): [${myExploits.map(e => e.card.name).join(', ')}]. Rolando Patch Check (Noisy 2D6)...`, currentPlayer, 'EXECUTED');
  };

  const processSuccessfulReport = (
    eligibleExploits: DeployedExploit[],
    bypassMode = false,
    overridePlayers?: Record<PlayerRoleId, PlayerState>
  ) => {
    const basePlayers = overridePlayers || players;
    const activeCurrentPlayer = basePlayers[myRole] || currentPlayer;
    const program = activeCurrentPlayer.activeProgram;
    if (!program) return;

    let nextMain = [...mainDeck];
    let nextDiscard = [...discardPile];
    let nextTools = [...toolDeck];
    let nextToolDiscard = [...toolDiscard];
    let nextMarket = [...programMarket];
    let nextProgDeck = [...programDeck];
    let nextProgDiscard = [...programDiscard, program];

    const vulnTotal = eligibleExploits.reduce((sum, e) => sum + getVulnFlatValue(e.card), 0);
    const programBonus = program.flatBountyBonus || 0;
    let earnedCash = vulnTotal + programBonus;
    let archetypeDelta = 0;
    let toolBonusCash = 0;
    const breakdownParts: string[] = [`Vulns: $${vulnTotal}`, `Prog: +$${programBonus}`];

    // 1. Bônus de Arquétipo: Pentester (+500 c/ 2 classes, +1000 c/ 3 classes)
    if (activeCurrentPlayer.archetype.id === 'the-pentester') {
      const distinctClasses = new Set(eligibleExploits.map(e => e.card.vulnClass || e.card.rarity)).size;
      if (distinctClasses >= 3) {
        archetypeDelta += 1000;
        breakdownParts.push('Pentester (3 classes): +$1000');
      } else if (distinctClasses === 2) {
        archetypeDelta += 500;
        breakdownParts.push('Pentester (2 classes): +$500');
      }
    }

    // 2. Bônus de Arquétipo: Bug Hunter (+$500 por cada vuln além da 1ª)
    if (activeCurrentPlayer.archetype.id === 'bug-hunter' && eligibleExploits.length > 1) {
      const extra = (eligibleExploits.length - 1) * 500;
      archetypeDelta += extra;
      breakdownParts.push(`Bug Hunter (${eligibleExploits.length} vulns): +$${extra}`);
    }

    // 3. Bônus de Arquétipo: The Old Guard (+$500 por cada vuln Epic/Legendary)
    if (activeCurrentPlayer.archetype.id === 'the-old-guard') {
      const epicLegCount = eligibleExploits.filter(e => e.card.rarity === 'Epic' || e.card.rarity === 'Legendary').length;
      if (epicLegCount > 0) {
        const extra = epicLegCount * 500;
        archetypeDelta += extra;
        breakdownParts.push(`Old Guard (${epicLegCount} Épica/Lend.): +$${extra}`);
      }
    }

    // 4. Penalidade de Arquétipo: Red Teamer (-$1.000 custo operacional por Report)
    if (activeCurrentPlayer.archetype.id === 'red-teamer') {
      archetypeDelta -= 1000;
      breakdownParts.push('Red Teamer (Custo Op.): -$1000');
    }

    earnedCash = Math.max(0, earnedCash + archetypeDelta);

    // 5. Bônus de Tools Passivas no Report: DOM Inspector (T-02 -> +$500/XSS) e Token Cracker (T-12 -> +$500/AUTH)
    const domInspectorCount = countPlayerTool(activeCurrentPlayer, 'T-02');
    const xssCount = eligibleExploits.filter(e => e.card.vulnClass === 'XSS').length;
    if (domInspectorCount > 0 && xssCount > 0) {
      const bonus = domInspectorCount * xssCount * 500;
      toolBonusCash += bonus;
      earnedCash += bonus;
      breakdownParts.push(`DOM Inspector (${xssCount} XSS): +$${bonus}`);
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', `DOM Inspector Passiva (+$${bonus})`, `${activeCurrentPlayer.name} ganhou +$${bonus} por ${xssCount} vulnerabilidade(s) XSS no Report!`, activeCurrentPlayer, 'PASSIVE');
    }

    const tokenCrackerCount = countPlayerTool(activeCurrentPlayer, 'T-12');
    const authCount = eligibleExploits.filter(e => e.card.vulnClass === 'AUTH').length;
    if (tokenCrackerCount > 0 && authCount > 0) {
      const bonus = tokenCrackerCount * authCount * 500;
      toolBonusCash += bonus;
      earnedCash += bonus;
      breakdownParts.push(`Token Cracker (${authCount} AUTH): +$${bonus}`);
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', `Token Cracker Passiva (+$${bonus})`, `${activeCurrentPlayer.name} ganhou +$${bonus} por ${authCount} vulnerabilidade(s) AUTH no Report!`, activeCurrentPlayer, 'PASSIVE');
    }

    // 6. Habilidades Especiais de Vulnerabilidades no Report:
    // - BÔNUS CRÍTICO (#INJ-13 Broken Belt, #BL-8 Double Bill): +$1.000
    const criticalBonusCards = eligibleExploits.filter(e => {
      const id = (e.card.canonicalId || e.card.id).toUpperCase();
      return id === 'INJ-13' || id === 'BL-8';
    });
    if (criticalBonusCards.length > 0) {
      const bonus = criticalBonusCards.length * 1000;
      earnedCash += bonus;
      breakdownParts.push(`Bônus Crítico (${criticalBonusCards.map(c => c.card.name).join(', ')}): +$${bonus}`);
    }

    // 7. Eventos de Bônus no Report: Bounty Increase! (evt-10) e Hall of Fame Update! (evt-17)
    if (activeRoundEvents.some(e => e.id === 'evt-10')) {
      earnedCash += 1500;
      breakdownParts.push('Bounty Increase! (Evento): +$1500');
    }
    if (activeCurrentPlayer.statusEffects?.hallOfFameBonus) {
      const hofBonus = activeCurrentPlayer.statusEffects.hallOfFameBonus;
      earnedCash += hofBonus;
      breakdownParts.push(`Hall of Fame Update!: +$${hofBonus}`);
    }

    // Ganho de Reputação (🐝)
    const hasEpicOrLegendary = eligibleExploits.some(e => e.card.rarity === 'Epic' || e.card.rarity === 'Legendary');
    let repGain = 0;
    if (hasEpicOrLegendary) {
      repGain += 1;
      breakdownParts.push('Reputação (Épica/Lendária): +1🐝');
    }
    if (activeCurrentPlayer.archetype.id === 'bug-hunter' && eligibleExploits.length === 3) {
      repGain += 1;
      breakdownParts.push('Reputação Bug Hunter (3 vulns): +1🐝');
      archetypeDelta += 0;
    }

    let updatedHand = [...activeCurrentPlayer.hand];
    let specialAlertGain = 0;
    let newScore = activeCurrentPlayer.score + earnedCash;

    // 8. CASAS ESPECIAIS DA BOUNTY TRACK (Manual §08: apenas ao parar exatamente sobre ela no Payout do Report)
    const hitMilestone = BOUNTY_MILESTONES.find(m => m.value === newScore);
    if (hitMilestone) {
      soundFx.playScan();
      if (hitMilestone.value === 4500) {
        repGain += 1;
        breakdownParts.push('Casa Especial ($4.500): +1🐝');
      } else if (hitMilestone.value === 9000) {
        specialAlertGain += 1;
        breakdownParts.push('Casa Especial ($9.000): +1🐞');
      } else if (hitMilestone.value === 13500) {
        repGain += 1;
        breakdownParts.push('Casa Especial ($13.500): +1🐝 e +1 Carta');
        const popped = popCardsFromMainDeck(1, nextMain, nextDiscard);
        nextMain = popped.nextMain;
        nextDiscard = popped.nextDiscard;
        updatedHand.push(...popped.drawn);
      } else if (hitMilestone.value === 19000) {
        specialAlertGain += 1;
        breakdownParts.push('Casa Especial ($19.000): +1🐞 e Descarte 1 Carta');
        if (updatedHand.length > 0) {
          const disc = updatedHand.pop()!;
          nextDiscard.push(disc);
        }
      } else if (hitMilestone.value === 24500) {
        setFreeToolInstallAvailable(true);
        breakdownParts.push('Casa Especial ($24.500): Instalação Grátis de Tool');
      } else if (hitMilestone.value === 29000) {
        repGain += 1;
        specialAlertGain -= 1;
        breakdownParts.push('Casa Especial ($29.000): +1🐝 e -1🐞');
      } else if (hitMilestone.value === 33500) {
        newScore = 32000;
        breakdownParts.push('Casa Especial ($33.500): Recuo para $32.000');
      } else if (hitMilestone.value === 38000) {
        specialAlertGain += 1;
        breakdownParts.push('Casa Especial ($38.000): +1🐞');
      }
      recordAudit('REPORT', `Casa Especial Atingida: ${hitMilestone.label} ${hitMilestone.icon}`, `${activeCurrentPlayer.name} parou em $${hitMilestone.value.toLocaleString('pt-BR')}: ${hitMilestone.effectDescription}!`, activeCurrentPlayer, 'EXECUTED');
    }

    // 9. Tool Passiva T-03 (Echo Beacon): Ao reportar SSRF ou [NOISY], compra +1 carta do Main Deck
    const echoBeaconCount = countPlayerTool(activeCurrentPlayer, 'T-03');
    const hasSsrfOrNoisy = eligibleExploits.some(e => e.card.vulnClass === 'SSRF' || e.card.isNoisy);
    if (echoBeaconCount > 0 && hasSsrfOrNoisy) {
      const popped = popCardsFromMainDeck(echoBeaconCount, nextMain, nextDiscard);
      nextMain = popped.nextMain;
      nextDiscard = popped.nextDiscard;
      updatedHand.push(...popped.drawn);
      bumpMetric(myRole, m => ({ toolsActivatedOrTriggered: m.toolsActivatedOrTriggered + 1 }));
      recordAudit('TOOL', 'Echo Beacon Passiva (+Carta)', `${activeCurrentPlayer.name} reportou SSRF/[NOISY] e comprou [${popped.drawn.map(c => c.name).join(', ')}] do Main Deck!`, activeCurrentPlayer, 'PASSIVE');
    }

    // Habilidades de compra e efeitos especiais no Report:
    const activeIds: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
    eligibleExploits.forEach(e => {
      const id = (e.card.canonicalId || e.card.id).toUpperCase();
      if (id === 'INJ-2') {
        const popped = popCardsFromMainDeck(2, nextMain, nextDiscard);
        nextMain = popped.nextMain;
        nextDiscard = popped.nextDiscard;
        updatedHand.push(...popped.drawn);
        recordAudit('EXPLOIT', 'Habilidade #INJ-2 (Granny Inject)', `${activeCurrentPlayer.name} comprou +2 cartas do Main Deck!`, activeCurrentPlayer, 'PASSIVE');
      } else if (id === 'INJ-14') {
        const popped = popCardsFromMainDeck(2, nextMain, nextDiscard);
        nextMain = popped.nextMain;
        nextDiscard = popped.nextDiscard;
        updatedHand.push(...popped.drawn);
        recordAudit('EXPLOIT', 'Habilidade #INJ-14 (Zombie Worker)', `${activeCurrentPlayer.name} comprou +2 cartas do Main Deck!`, activeCurrentPlayer, 'PASSIVE');
      } else if (id === 'XSS-12') {
        // Clear Wire: transfere 1 Alerta seu para o jogador à sua direita (se não tiver alerta, o oponente recebe 1)
        const myIndex = activeIds.indexOf(myRole);
        const rightIndex = (myIndex + 1) % activeIds.length;
        const rightPlayerId = activeIds[rightIndex];
        if (rightPlayerId && basePlayers[rightPlayerId]) {
          const target = basePlayers[rightPlayerId];
          if (activeCurrentPlayer.alertaTokens > 0) {
            activeCurrentPlayer.alertaTokens = Math.max(0, activeCurrentPlayer.alertaTokens - 1);
            basePlayers[rightPlayerId] = { ...target, alertaTokens: target.alertaTokens + 1 };
            recordAudit('EXPLOIT', 'Clear Wire (#XSS-12): Transferência de Alerta', `${activeCurrentPlayer.name} transferiu 1 Token de Alerta para ${target.name}!`, activeCurrentPlayer, 'EXECUTED');
            triggerEventAlert('⚡ Clear Wire!', `${activeCurrentPlayer.name} transferiu 1 Token de Alerta para você!`, rightPlayerId, 'alert');
          } else {
            basePlayers[rightPlayerId] = { ...target, alertaTokens: target.alertaTokens + 1 };
            recordAudit('EXPLOIT', 'Clear Wire (#XSS-12): Alerta Forçado', `${activeCurrentPlayer.name} aplicou +1 Token de Alerta em ${target.name}!`, activeCurrentPlayer, 'EXECUTED');
            triggerEventAlert('⚡ Clear Wire!', `${activeCurrentPlayer.name} entregou +1 Token de Alerta para você!`, rightPlayerId, 'alert');
          }
        }
      } else if (id === 'APT-3') {
        // Spring Doom: Descarta até 3 programas do mercado e renova antes de repor o seu
        const popped = popProgramsFromDeck(nextMarket.length, nextProgDeck, [...nextProgDiscard, ...nextMarket]);
        nextProgDeck = popped.nextDeck;
        nextProgDiscard = popped.nextDiscard;
        nextMarket = popped.drawn;
        recordAudit('EXPLOIT', 'Spring Doom (#APT-3): Renovação Total do Mercado', `${activeCurrentPlayer.name} renovou os programas do mercado antes da triagem! Novos: [${nextMarket.map(m => m.name).join(', ')}].`, activeCurrentPlayer, 'EXECUTED');
      } else if (id === 'INJ-15') {
        // Burst Pipe: compra 1 carta e força oponente a descartar 1 carta da mão
        const popped = popCardsFromMainDeck(1, nextMain, nextDiscard);
        nextMain = popped.nextMain;
        nextDiscard = popped.nextDiscard;
        updatedHand.push(...popped.drawn);
        const victimId = activeIds.find(oId => oId !== myRole && (basePlayers[oId]?.hand.length || 0) > 0);
        if (victimId && basePlayers[victimId]) {
          const victim = basePlayers[victimId];
          const randIdx = Math.floor(Math.random() * victim.hand.length);
          const droppedCard = victim.hand[randIdx];
          basePlayers[victimId] = {
            ...victim,
            hand: victim.hand.filter((_, idx) => idx !== randIdx)
          };
          nextDiscard.push(droppedCard);
          recordAudit('EXPLOIT', `Burst Pipe (#INJ-15): Injeção Crítica!`, `${activeCurrentPlayer.name} comprou +1 carta e forçou ${victim.name} a descartar [${droppedCard.name}] da mão!`, activeCurrentPlayer, 'EXECUTED');
          triggerEventAlert('⚡ Burst Pipe: Injeção Crítica!', `${activeCurrentPlayer.name} reportou Burst Pipe e forçou você a descartar [${droppedCard.name}] da mão!`, victimId, 'alert');
        }
      } else if (id === 'APT-4') {
        // Puppet Master: rouba 1 Tool instalada de 1 oponente
        const victimId = activeIds.find(oId => oId !== myRole && (basePlayers[oId]?.activeTools.length || 0) > 0);
        if (victimId && basePlayers[victimId]) {
          const victim = basePlayers[victimId];
          const stolenTool = victim.activeTools[0];
          basePlayers[victimId] = {
            ...victim,
            activeTools: victim.activeTools.slice(1)
          };
          if (activeCurrentPlayer.activeTools.length < 3) {
            activeCurrentPlayer.activeTools = [...activeCurrentPlayer.activeTools, stolenTool];
            recordAudit('EXPLOIT', `Puppet Master (#APT-4): Roubo de Tool!`, `${activeCurrentPlayer.name} roubou a Tool [${stolenTool.name}] da bancada de ${victim.name} e instalou em seu rack!`, activeCurrentPlayer, 'EXECUTED');
          } else {
            nextToolDiscard.push(stolenTool);
            recordAudit('EXPLOIT', `Puppet Master (#APT-4): Roubo de Tool!`, `${activeCurrentPlayer.name} roubou [${stolenTool.name}] de ${victim.name} e descartou (rack cheio)!`, activeCurrentPlayer, 'EXECUTED');
          }
          triggerEventAlert('⚡ Puppet Master: Ataque Supply Chain!', `${activeCurrentPlayer.name} reportou Puppet Master e roubou sua Tool instalada [${stolenTool.name}]!`, victimId, 'alert');
        }
      } else if (id === 'APT-5') {
        // Marionette: descarta 1 Tool instalada do oponente ou 1 carta da mão
        const victimId = activeIds.find(oId => oId !== myRole);
        if (victimId && basePlayers[victimId]) {
          const victim = basePlayers[victimId];
          if (victim.activeTools.length > 0) {
            const droppedTool = victim.activeTools[0];
            basePlayers[victimId] = {
              ...victim,
              activeTools: victim.activeTools.slice(1)
            };
            nextToolDiscard.push(droppedTool);
            recordAudit('EXPLOIT', `Marionette (#APT-5): Sabotagem de Tool!`, `${activeCurrentPlayer.name} forçou ${victim.name} a descartar a Tool instalada [${droppedTool.name}]!`, activeCurrentPlayer, 'EXECUTED');
            triggerEventAlert('⚡ Marionette: Sabotagem!', `${activeCurrentPlayer.name} forçou você a descartar sua Tool instalada [${droppedTool.name}]!`, victimId, 'alert');
          } else if (victim.hand.length > 0) {
            const randIdx = Math.floor(Math.random() * victim.hand.length);
            const droppedCard = victim.hand[randIdx];
            basePlayers[victimId] = {
              ...victim,
              hand: victim.hand.filter((_, idx) => idx !== randIdx)
            };
            nextDiscard.push(droppedCard);
            recordAudit('EXPLOIT', `Marionette (#APT-5): Descarte Forçado!`, `${activeCurrentPlayer.name} forçou ${victim.name} (sem Tools) a descartar [${droppedCard.name}] da mão!`, activeCurrentPlayer, 'EXECUTED');
            triggerEventAlert('⚡ Marionette: Descarte Forçado!', `${activeCurrentPlayer.name} forçou você a descartar [${droppedCard.name}] da mão!`, victimId, 'alert');
          }
        }
      } else if (id === 'AUTH-10') {
        // VIP Double: transfere $1.000 do jogador com maior saldo
        const otherPlayers = activeIds.filter(oId => oId !== myRole);
        const richest = otherPlayers.map(oId => basePlayers[oId]).filter(Boolean).sort((a, b) => b.score - a.score)[0];
        if (richest && richest.score > 0) {
          const stealAmount = Math.min(1000, richest.score);
          basePlayers[richest.id] = { ...richest, score: richest.score - stealAmount };
          newScore += stealAmount;
          earnedCash += stealAmount;
          breakdownParts.push(`VIP Double (+$${stealAmount} de ${richest.name})`);
          recordAudit('EXPLOIT', `VIP Double (#AUTH-10): Transferência de Saldo`, `${activeCurrentPlayer.name} transferiu $${stealAmount} da Bounty Track de ${richest.name} para a sua!`, activeCurrentPlayer, 'EXECUTED');
          triggerEventAlert('⚡ VIP Double!', `${activeCurrentPlayer.name} reportou VIP Double e transferiu $${stealAmount} da sua pontuação!`, richest.id, 'alert');
        }
      } else if (id === 'BAC-14') {
        // Throne Room: Inspeciona as 3 primeiras cartas do Event Deck
        let availEvents = [...eventDeck];
        let availDisc = [...eventDiscard];
        if (availEvents.length < 3 && availDisc.length > 0) {
          availEvents = [...availEvents, ...shuffleArray(availDisc)];
          availDisc = [];
        }
        const top3 = availEvents.slice(0, 3);
        const restEvents = availEvents.slice(3);
        setEventDeck(restEvents);
        setEventDiscard(availDisc);
        setPendingDeckPeek({
          mode: 'panoptico',
          title: '👑 Throne Room (#BAC-14): Inspeção do Event Deck',
          subtitle: 'Escolha até 1 Evento para descartar e ordene os demais no topo do Event Deck',
          cards: top3.map(ev => ({
            id: ev.id,
            name: `🚨 ${ev.name}`,
            description: ev.simpleDescription,
            raw: ev
          }))
        });
        recordAudit('EXPLOIT', `Throne Room (#BAC-14): Inspecionando Event Deck`, `${activeCurrentPlayer.name} inspecionou as 3 próximas cartas de Evento.`, activeCurrentPlayer, 'EXECUTED');
      } else if ((id === 'SSRF-8' || id === 'BL-6') && nextToolDiscard.length > 0) {
        const rescued = nextToolDiscard[nextToolDiscard.length - 1];
        nextToolDiscard = nextToolDiscard.slice(0, -1);
        updatedHand.push(rescued);
        recordAudit('EXPLOIT', `Habilidade Acesso Interno (${e.card.name})`, `${activeCurrentPlayer.name} resgatou a Tool [${rescued.name}] do descarte para a mão!`, activeCurrentPlayer, 'PASSIVE');
      }
    });

    if (earnedCash >= 10000) confetti({ particleCount: 80, spread: 60 });

    // 10. COMPRA DE 1 TOOL APÓS REPORT BEM-SUCEDIDO (exceto quando usou Bypass)
    let needsNoobPeek = false;
    if (!bypassMode) {
      if (activeCurrentPlayer.archetype.id === 'noob') {
        const popped = popCardsFromToolDeck(3, nextTools, nextToolDiscard);
        nextTools = popped.nextToolDeck;
        nextToolDiscard = popped.nextToolDiscard;
        if (popped.drawn.length > 1) {
          needsNoobPeek = true;
          setPendingDeckPeek({
            mode: 'noobTool',
            title: '🌱 n00b (Garimpeiro de Ferramentas): Escolha sua Tool!',
            subtitle: 'Olhe as 3 primeiras cartas do Tool Deck, escolha 1 para a mão e ordene as outras 2 no topo',
            cards: popped.drawn.map(t => ({
              id: t.id,
              name: `${t.icon} ${t.name}`,
              description: t.simpleDescription,
              raw: t
            }))
          });
        } else if (popped.drawn[0]) {
          updatedHand.push(popped.drawn[0]);
        }
      } else {
        const popped = popCardsFromToolDeck(1, nextTools, nextToolDiscard);
        nextTools = popped.nextToolDeck;
        nextToolDiscard = popped.nextToolDiscard;
        if (popped.drawn[0]) {
          updatedHand.push(popped.drawn[0]);
          recordAudit('TOOL', `Tool Comprada no Report: ${popped.drawn[0].name}`, `${activeCurrentPlayer.name} comprou [${popped.drawn[0].name}] (${popped.drawn[0].simpleDescription}).`, activeCurrentPlayer, 'EXECUTED');
        }
      }
    }

    // Calcula balanço final de tokens de alerta
    let finalAlerts = Math.max(0, activeCurrentPlayer.alertaTokens + specialAlertGain);
    let penaltyAlertCash = 0;
    if (finalAlerts >= 2) {
      penaltyAlertCash = 2000;
      finalAlerts = 0;
      soundFx.playPatchDeployedAlarm();
      recordAudit('ALERT', 'Alarme Crítico no Report (2🐞): -$2.000', `${activeCurrentPlayer.name} acumulou 2 Tokens de Alerta e sofreu multa imediata de -$2.000!`, activeCurrentPlayer, 'PENALTY');
    }
    newScore = Math.max(0, newScore - penaltyAlertCash);

    // Descarte das vulnerabilidades reportadas
    nextDiscard.push(...eligibleExploits.map(e => e.card));
    const nextExploits = deployedExploits.filter(e => e.playerId !== myRole);

    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...basePlayers,
      [myRole]: {
        ...activeCurrentPlayer,
        score: newScore,
        reputacaoTokens: activeCurrentPlayer.reputacaoTokens + repGain,
        alertaTokens: finalAlerts,
        activeProgram: null,
        hand: updatedHand,
        statusEffects: { ...activeCurrentPlayer.statusEffects, hallOfFameBonus: undefined }
      }
    };

    // Roubo de Reputação (Manual §05: 2 Lendárias ou 3 Épicas no mesmo Report rouba 1 🐝 de oponente)
    const legCount = eligibleExploits.filter(e => e.card.rarity === 'Legendary').length;
    const epicCount = eligibleExploits.filter(e => e.card.rarity === 'Epic').length;
    if (legCount >= 2 || epicCount >= 3) {
      const activeIds: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
      const victimId = activeIds.find(id => id !== myRole && updatedPlayersState[id].reputacaoTokens > 0);
      if (victimId) {
        updatedPlayersState[victimId] = {
          ...updatedPlayersState[victimId],
          reputacaoTokens: updatedPlayersState[victimId].reputacaoTokens - 1
        };
        updatedPlayersState[myRole] = {
          ...updatedPlayersState[myRole],
          reputacaoTokens: updatedPlayersState[myRole].reputacaoTokens + 1
        };
        recordAudit('REPORT', 'Roubo de Reputação (🐝)', `${activeCurrentPlayer.name} reportou ${legCount >= 2 ? '2+ Lendárias' : '3 Épicas'} e roubou 1 Token de Reputação de ${updatedPlayersState[victimId].name}!`, activeCurrentPlayer, 'EXECUTED');
      }
    }

    setMainDeck(nextMain);
    setDiscardPile(nextDiscard);
    setToolDeck(nextTools);
    setToolDiscard(nextToolDiscard);
    setProgramMarket(nextMarket);
    setProgramDeck(nextProgDeck);
    setProgramDiscard(nextProgDiscard);
    setDeployedExploits(nextExploits);
    setPlayers(updatedPlayersState);

    bumpMetric(myRole, m => ({
      reportsCompleted: m.reportsCompleted + 1,
      totalBountyEarned: m.totalBountyEarned + earnedCash,
      archetypeTriggers: archetypeDelta !== 0 ? m.archetypeTriggers + 1 : m.archetypeTriggers,
      archetypeBountyBonus: m.archetypeBountyBonus + archetypeDelta,
      alertsReceived: specialAlertGain > 0 ? m.alertsReceived + specialAlertGain : m.alertsReceived,
      criticalAlarmPenalties: penaltyAlertCash > 0 ? m.criticalAlarmPenalties + 1 : m.criticalAlarmPenalties
    }));

    setBountyLedger(prev => [
      ...prev,
      {
        id: 'rep-' + Date.now(),
        turn: currentTurn,
        type: 'Report',
        description: `Report de ${activeCurrentPlayer.name} em ${program.name}`,
        amount: earnedCash - penaltyAlertCash,
        mathBreakdown: breakdownParts.join(' | ') + (penaltyAlertCash > 0 ? ' | Multa 2🐞: -$2000' : '')
      }
    ]);

    recordAudit(
      'REPORT',
      `Report Concluído (+$${earnedCash.toLocaleString('pt-BR')}) em [${program.name}]`,
      `Detalhamento: ${breakdownParts.join(' | ')}. Novo Saldo: $${newScore.toLocaleString('pt-BR')}.`,
      updatedPlayersState[myRole],
      'EXECUTED'
    );

    // Meta de $40.000: Ativa a rodada final (EQUAL TURNS)
    // A rodada atual continuará até que todos os jogadores completem seus turnos!
    if (newScore >= 40000 && targetHitRound === null) {
      setTargetHitRound(currentTurn);
      recordAudit(
        'REPORT',
        `🎯 META DE $40.000 ATINGIDA POR ${activeCurrentPlayer.name}!`,
        `${activeCurrentPlayer.name} atingiu $${newScore.toLocaleString('pt-BR')}! Regra de Equal Turns ativada: a Rodada ${currentTurn} será jogada até o fim para igualdade de turnos.`,
        updatedPlayersState[myRole],
        'EXECUTED'
      );
      triggerEventAlert(
        '🎯 Meta de $40.000 Atingida!',
        `${activeCurrentPlayer.name} atingiu $${newScore.toLocaleString('pt-BR')}! A Rodada ${currentTurn} é a RODADA FINAL: jogue até o fim para definir o grande campeão!`,
        'all',
        'alert'
      );
    }

    // Saque e Ativação Imediata de 1 Evento (a menos que tenha reportado ZERO-DAY #APT-6 ou usado Bypass)
    const hasZeroDay = eligibleExploits.some(e => (e.card.canonicalId || e.card.id).toUpperCase() === 'APT-6');
    if (!bypassMode && !hasZeroDay) {
      let availEvents = [...eventDeck];
      let availEventDisc = [...eventDiscard];
      if (availEvents.length === 0 && availEventDisc.length > 0) {
        availEvents = shuffleArray(availEventDisc);
        availEventDisc = [];
      }
      if (availEvents.length > 0) {
        const [topEvent, ...restEvents] = availEvents;
        setEventDeck(restEvents);
        setEventDiscard([...availEventDisc, topEvent]);
        setActiveEventCard(topEvent);
        setLastEventResolutionSummary(null);
        bumpMetric(myRole, m => ({ eventsDrawn: m.eventsDrawn + 1 }));
        // Executa o evento sobre o estado JÁ ATUALIZADO do Report com os baralhos atualizados!
        executeEventCardOnState(topEvent, updatedPlayersState, nextExploits, myRole, undefined, {
          tools: nextTools,
          toolDiscard: nextToolDiscard,
          mainDeck: nextMain,
          discardPile: nextDiscard,
          market: nextMarket,
          programDeck: nextProgDeck,
          programDiscard: nextProgDiscard
        });
      }
    } else if (hasZeroDay) {
      soundFx.playScan();
      recordAudit('EXPLOIT', 'Habilidade ZERO-DAY (#APT-6: Pandora Box)', `${activeCurrentPlayer.name} ignorou o saque de Event Card neste Report!`, updatedPlayersState[myRole], 'PASSIVE');
      triggerEventAlert('💎 Pandora Box Ativa!', `${activeCurrentPlayer.name} reportou Pandora Box e ignorou o saque de Event Card!`, 'all', 'positive');
    }

    // Obriga a escolha imediata do novo Programa (dos 3 expostos ou surpresa do deck) antes de encerrar o turno
    setAwaitingProgramPick(true);
    setProgramPickReason('🎯 REPORT CONCLUÍDO! Escolha seu novo Programa (1 dos 3 expostos OU Surpresa do Deck):');
    if (playerCount === 2) {
      setDuelRotationsRemaining(2);
    }
    if (needsNoobPeek) {
      // O modal do n00b aparece sobreposto e logo em seguida o modal de programa continua aberto
    }
  };

  const triggerManualDiceRoll = () => {
    setDiceRollReason('manualTest');
    setIsDiceModalOpen(true);
  };

  const handleDiceRollResult = (result: any) => {
    setIsDiceModalOpen(false);
    const passed = result.passed;

    if (diceRollReason === 'report') {
      if (passed) {
        const myExploits = deployedExploits.filter(e => e.playerId === myRole);
        processSuccessfulReport(myExploits, false);
      } else {
        setPatchAlertModal(true);
        setAlertServerName(currentPlayer.activeProgram?.name || null);
        soundFx.playPatchDeployedAlarm();
        recordAudit('PATCH', `PATCH DEPLOYED no Report (${result.evaluatedSum} >= ${result.threshold})`, `Empresa [${currentPlayer.activeProgram?.name}] corrigiu a falha durante o Report de ${currentPlayer.name}!`, currentPlayer, 'PENALTY');
      }
    } else if (diceRollReason === 'endTurn') {
      if (passed) {
        recordAudit('TURN', `Stealth Check Seguro (${result.evaluatedSum} < ${result.threshold})`, `${currentPlayer.name} manteve seus exploits ocultos e encerrou o turno.`, currentPlayer, 'EXECUTED');
        finalizeTurnAdvance();
      } else {
        setPatchAlertModal(true);
        setAlertServerName(currentPlayer.activeProgram?.name || null);
        soundFx.playPatchDeployedAlarm();
        recordAudit('PATCH', `PATCH DEPLOYED no Fim do Turno (${result.evaluatedSum} >= ${result.threshold})`, `Sistemas de [${currentPlayer.activeProgram?.name}] detectaram os exploits de ${currentPlayer.name}!`, currentPlayer, 'PENALTY');
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPRA / TROCA DE PROGRAMA:
  // 1) selectNewProgram(chosenProgram) -> Pega 1 dos 3 expostos do Market e repõe do Deck
  // 2) drawSurpriseProgramFromDeck()   -> Pega 1 fechado do topo do Program Deck (surpresa)
  // ─────────────────────────────────────────────────────────────────────────────
  const selectNewProgram = (chosenProgram: ProgramCard) => {
    const prevProgram = currentPlayer.activeProgram;
    if (prevProgram && prevProgram.id === chosenProgram.id) return;

    const isVoluntaryReconSwap = Boolean(prevProgram && !awaitingProgramPick);
    if (isVoluntaryReconSwap) {
      if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
      if (currentPlayer.actionsRemaining < 1) { alert('Trocar de programa (RECON) custa 1 Ação!'); return; }
    }

    let nextDiscard = [...discardPile];
    let nextExploits = [...deployedExploits];
    if (isVoluntaryReconSwap) {
      const myExploits = nextExploits.filter(e => e.playerId === myRole);
      nextDiscard.push(...myExploits.map(e => e.card));
      nextExploits = nextExploits.filter(e => e.playerId !== myRole);
      setDiscardPile(nextDiscard);
      setDeployedExploits(nextExploits);
    }

    // Repõe o slot escolhido no Program Market puxando 1 carta do Program Deck
    let nextProgDiscard = [...programDiscard];
    if (prevProgram) nextProgDiscard.push(prevProgram);

    const popped = popProgramsFromDeck(1, programDeck, nextProgDiscard, chosenProgram.name);
    const replacementProg = popped.drawn[0];
    const nextMarket = programMarket.map(slot =>
      slot.id === chosenProgram.id ? (replacementProg || slot) : slot
    ).filter((slot, idx, arr) => replacementProg ? true : slot.id !== chosenProgram.id || arr.indexOf(slot) === idx);

    setProgramMarket(nextMarket);
    setProgramDeck(popped.nextDeck);
    setProgramDiscard(popped.nextDiscard);

    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        activeProgram: chosenProgram,
        actionsRemaining: isVoluntaryReconSwap ? currentPlayer.actionsRemaining - 1 : currentPlayer.actionsRemaining
      }
    };
    setPlayers(updatedPlayers);
    bumpMetric(myRole, m => ({ programsPickedMarket: m.programsPickedMarket + 1 }));

    recordAudit(
      'PROGRAM',
      `Programa Escolhido (Exposto no Market): ${chosenProgram.name}`,
      `${currentPlayer.name} assumiu [${chosenProgram.name}] (${isVoluntaryReconSwap ? 'RECON -1 AP, descartou exploits anteriores' : 'Reposição Obrigatória Grátis'}). ${replacementProg ? `Novo programa revelado no Market: [${replacementProg.name}].` : ''}`,
      updatedPlayers[myRole],
      'EXECUTED'
    );

    soundFx.playClick();
    if (awaitingProgramPick) {
      setAwaitingProgramPick(false);
      setProgramPickReason(null);
      setDuelRotationsRemaining(0);
      setPendingTurnAdvance(false);
      finalizeTurnAdvance(updatedPlayers, nextExploits, nextMarket, {
        programDeck: popped.nextDeck,
        programDiscard: popped.nextDiscard
      });
    } else {
      supabaseSync.broadcast('STATE_SYNC', {
        players: updatedPlayers,
        deployedExploits: nextExploits,
        programMarket: nextMarket,
        programDeck: popped.nextDeck,
        programDiscard: popped.nextDiscard,
        discardPile: nextDiscard
      });
    }
  };

  const drawSurpriseProgramFromDeck = () => {
    const prevProgram = currentPlayer.activeProgram;
    const isVoluntaryReconSwap = Boolean(prevProgram && !awaitingProgramPick);
    if (isVoluntaryReconSwap) {
      if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
      if (currentPlayer.actionsRemaining < 1) { alert('Trocar de programa (RECON) custa 1 Ação!'); return; }
    }

    let nextProgDiscard = [...programDiscard];
    if (prevProgram) nextProgDiscard.push(prevProgram);

    const popped = popProgramsFromDeck(1, programDeck, nextProgDiscard);
    const surpriseProgram = popped.drawn[0];
    if (!surpriseProgram) {
      alert('O Program Deck não possui mais cartas para compra surpresa — escolha um dos programas expostos!');
      return;
    }

    let nextDiscard = [...discardPile];
    let nextExploits = [...deployedExploits];
    if (isVoluntaryReconSwap) {
      const myExploits = nextExploits.filter(e => e.playerId === myRole);
      nextDiscard.push(...myExploits.map(e => e.card));
      nextExploits = nextExploits.filter(e => e.playerId !== myRole);
      setDiscardPile(nextDiscard);
      setDeployedExploits(nextExploits);
    }

    setProgramDeck(popped.nextDeck);
    setProgramDiscard(popped.nextDiscard);

    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        activeProgram: surpriseProgram,
        actionsRemaining: isVoluntaryReconSwap ? currentPlayer.actionsRemaining - 1 : currentPlayer.actionsRemaining
      }
    };
    setPlayers(updatedPlayers);
    bumpMetric(myRole, m => ({ programsPickedSurpriseDeck: m.programsPickedSurpriseDeck + 1 }));

    recordAudit(
      'PROGRAM',
      `Programa Comprado do Topo do Deck (Surpresa): ${surpriseProgram.name}`,
      `${currentPlayer.name} puxou no escuro do Program Deck e recebeu [${surpriseProgram.name}] (Escopo: ${Array.isArray(surpriseProgram.allowedClasses) ? surpriseProgram.allowedClasses.join(', ') : surpriseProgram.allowedClasses} | Patch: ${surpriseProgram.patchSpeed} | Bônus: ${surpriseProgram.bountyRange}). Os 3 expostos do Market permaneceram intactos.`,
      updatedPlayers[myRole],
      'EXECUTED'
    );

    soundFx.playClick();
    if (awaitingProgramPick) {
      setAwaitingProgramPick(false);
      setProgramPickReason(null);
      setDuelRotationsRemaining(0);
      setPendingTurnAdvance(false);
      finalizeTurnAdvance(updatedPlayers, nextExploits, programMarket, {
        programDeck: popped.nextDeck,
        programDiscard: popped.nextDiscard
      });
    } else {
      supabaseSync.broadcast('STATE_SYNC', {
        players: updatedPlayers,
        deployedExploits: nextExploits,
        programDeck: popped.nextDeck,
        programDiscard: popped.nextDiscard,
        discardPile: nextDiscard
      });
    }
  };

  // Rotação opcional do Modo Duelo (2 jogadores) após Report bem-sucedido (até 2 programas)
  const rotateMarketProgram = (programId: string) => {
    if (duelRotationsRemaining <= 0) return;
    const targetProg = programMarket.find(p => p.id === programId);
    if (!targetProg) return;
    const popped = popProgramsFromDeck(1, programDeck, [...programDiscard, targetProg]);
    const replacement = popped.drawn[0];
    if (!replacement) return;
    const nextMarket = programMarket.map(p => (p.id === programId ? replacement : p));
    setProgramMarket(nextMarket);
    setProgramDeck(popped.nextDeck);
    setProgramDiscard(popped.nextDiscard);
    setDuelRotationsRemaining(prev => prev - 1);
    recordAudit('PROGRAM', `Rotação de Duelo no Mercado`, `${currentPlayer.name} descartou [${targetProg.name}] e revelou [${replacement.name}] no Program Market.`, currentPlayer, 'EXECUTED');
  };

  // PASSAR TURNO
  const endTurn = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (awaitingProgramPick || !currentPlayer.activeProgram) {
      alert('Escolha primeiro o seu novo Programa (1 dos 3 expostos ou Surpresa do Deck)!');
      return;
    }
    if (needsDiscard) {
      alert(`Limite de mão excedido: descarte ${currentPlayer.hand.length - dynamicMaxHandSize} carta(s) para encerrar o turno.`);
      return;
    }
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    const hasNoisyExploit = myExploits.some(e => e.card.isNoisy);

    if (myExploits.length > 0) {
      setIsStealthMode(!hasNoisyExploit);
      setDiceRollReason('endTurn');
      setIsDiceModalOpen(true);
      recordAudit('TURN', `Teste de Patch de Fim de Turno (${hasNoisyExploit ? 'Noisy 2D6' : 'Stealth 3D6'})`, `${currentPlayer.name} encerrou as ações com ${myExploits.length} vuln(s) na mesa.`, currentPlayer, 'EXECUTED');
    } else {
      let updatedPlayersState = { ...players };
      if (currentPlayer.alertaTokens > 0) {
        const nextAlert = Math.max(0, currentPlayer.alertaTokens - 1);
        const updatedMe = {
          ...currentPlayer,
          alertaTokens: nextAlert
        };
        updatedPlayersState = {
          ...updatedPlayersState,
          [myRole]: updatedMe
        };
        recordAudit('ALERT', `Modo Furtivo: -1 Token de Alerta`, `${currentPlayer.name} limpou 1 Token de Alerta (${nextAlert}/2 restantes).`, updatedMe, 'EXECUTED');
      }
      finalizeTurnAdvance(updatedPlayersState);
    }
  };

  const defusePatch = () => {
    if (activeRoundEvents.some(e => e.id === 'evt-15')) {
      alert('⏳ Evento CVE Assignment Delayed! ativo nesta rodada: Cartas Safeguard (Bypass) estão bloqueadas!');
      return;
    }
    setIsDiceModalOpen(false);
    setPatchAlertModal(false);

    const nextAlert = currentPlayer.alertaTokens + 1;
    let penaltyCash = 0;
    let finalAlert = nextAlert;
    if (nextAlert >= 2) {
      penaltyCash = 2000;
      finalAlert = 0;
      soundFx.playPatchDeployedAlarm();
      setBountyLedger(prev => [
        ...prev,
        {
          id: 'pen-' + Date.now(),
          turn: currentTurn,
          type: 'Penalty',
          description: `Alarme Crítico (2🐞 no Bypass) — ${currentPlayer.name}`,
          amount: -2000,
          mathBreakdown: `2 Tokens de Alerta acumulados (-$2.000)`
        }
      ]);
    }

    if (currentPlayer.safeguardSlot) {
      setDiscardPile(prev => [...prev, currentPlayer.safeguardSlot!]);
    }

    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        score: Math.max(0, currentPlayer.score - penaltyCash),
        safeguardSlot: null,
        alertaTokens: finalAlert
      }
    };
    setPlayers(updatedPlayersState);
    bumpMetric(myRole, m => ({
      bypassUsed: m.bypassUsed + 1,
      alertsReceived: m.alertsReceived + 1,
      criticalAlarmPenalties: penaltyCash > 0 ? m.criticalAlarmPenalties + 1 : m.criticalAlarmPenalties
    }));

    recordAudit(
      'PATCH',
      `🛡️ Bypass Ativado por ${currentPlayer.name}`,
      `Anulou o Patch Deployed! Recebeu +1 Token de Alerta (${penaltyCash > 0 ? 'atingiu 2🐞 e pagou -$2.000' : `${finalAlert}/2`}).`,
      updatedPlayersState[myRole],
      'EXECUTED'
    );
    if (penaltyCash > 0) {
      recordAudit(
        'ALERT',
        `🚨 Multa Crítica de Alerta (2🐞): -$2.000`,
        `${currentPlayer.name} atingiu 2 Tokens de Alerta no Bypass! Perdeu -$2.000 na trilha (Novo saldo: $${updatedPlayersState[myRole].score.toLocaleString('pt-BR')}) e devolveu os 2 tokens.`,
        updatedPlayersState[myRole],
        'PENALTY'
      );
    }

    if (diceRollReason === 'report') {
      const myExploits = deployedExploits.filter(e => e.playerId === myRole);
      processSuccessfulReport(myExploits, true, updatedPlayersState);
    } else {
      finalizeTurnAdvance(updatedPlayersState);
    }
  };

  const acceptPatch = () => {
    setIsDiceModalOpen(false);
    setPatchAlertModal(false);
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    const nextExploits = deployedExploits.filter(e => e.playerId !== myRole);
    setDeployedExploits(nextExploits);

    // Regra de Balanceamento: Sofrer Patch (sem Bypass) adiciona +1🐞 apenas se o jogador tiver 0🐞;
    // se já tiver 1🐞, permanece em 1🐞 (não acumula o 2º alerta nem cobra multa de -$2.000 no Patch Aceito)
    const addedAlert = currentPlayer.alertaTokens === 0 ? 1 : 0;
    const finalAlert = Math.min(1, currentPlayer.alertaTokens + addedAlert);

    const popped = popCardsFromMainDeck(1, mainDeck, [...discardPile, ...myExploits.map(e => e.card)]);
    setMainDeck(popped.nextMain);
    setDiscardPile(popped.nextDiscard);

    if (currentPlayer.activeProgram) {
      setProgramDiscard(prev => [...prev, currentPlayer.activeProgram!]);
    }

    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        activeProgram: null,
        alertaTokens: finalAlert,
        hand: [...currentPlayer.hand, ...popped.drawn]
      }
    };
    setPlayers(updatedPlayersState);
    bumpMetric(myRole, m => ({
      patchesSuffered: m.patchesSuffered + 1,
      alertsReceived: m.alertsReceived + addedAlert
    }));

    recordAudit(
      'PATCH',
      `💥 Patch Aceito por ${currentPlayer.name}`,
      `Exploits e programa [${currentPlayer.activeProgram?.name}] descartados. ${addedAlert > 0 ? `Recebeu +1 Alerta (${finalAlert}/2)` : `Manteve ${finalAlert}/2 Alerta (sem multa extra no Patch Aceito)`} e comprou 1 carta de consolação [${popped.drawn[0]?.name}].`,
      updatedPlayersState[myRole],
      'PENALTY'
    );

    // Regra: Nenhum jogador fica sem programa ativo -> escolhe imediatamente o novo programa antes de passar a vez!
    setAwaitingProgramPick(true);
    setProgramPickReason('💥 PATCH SOFRIDO! Escolha imediatamente seu novo Programa (1 dos 3 expostos OU Surpresa do Deck) antes de passar o turno:');
  };

  // Habilidade Social Engineer: Phishing (1x por turno - 1 AP)
  const actionSocialPhishing = (chosenCardIdToGive?: string, chosenTargetId?: PlayerRoleId) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (phishingUsedThisTurn) {
      alert('🎭 A habilidade Phishing do Social Engineer só pode ser usada 1 vez por turno!');
      return;
    }
    if (currentPlayer.actionsRemaining < 1) { alert('Sem ações restantes (1 AP necessário)!'); return; }
    if (currentPlayer.hand.length === 0) { alert('Você precisa ter pelo menos 1 carta na mão para entregar!'); return; }

    const activeIds: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
    const opponents = activeIds.map(id => players[id]).filter(p => p.id !== myRole && p.hand.length > 0);
    if (opponents.length === 0) {
      alert('Nenhum oponente possui cartas na mão para o Phishing!');
      return;
    }

    const target = (chosenTargetId ? players[chosenTargetId] : opponents[0]) || opponents[0];
    const deliveredCard = (chosenCardIdToGive ? currentPlayer.hand.find(c => c.id === chosenCardIdToGive) : currentPlayer.hand[0]) || currentPlayer.hand[0];

    soundFx.playScan();
    const randIdx = Math.floor(Math.random() * target.hand.length);
    const pulledCard = target.hand[randIdx];

    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [target.id]: {
        ...target,
        hand: [...target.hand.filter(c => c.id !== pulledCard.id), deliveredCard]
      },
      [myRole]: {
        ...currentPlayer,
        hand: [...currentPlayer.hand.filter(c => c.id !== deliveredCard.id), pulledCard],
        actionsRemaining: currentPlayer.actionsRemaining - 1
      }
    };
    setPlayers(updatedPlayers);
    setPhishingUsedThisTurn(true);
    bumpMetric(myRole, m => ({ archetypeTriggers: m.archetypeTriggers + 1 }));
    recordAudit(
      'ARCHETYPE',
      `Phishing (Social Engineer) contra ${target.name}`,
      `${currentPlayer.name} infiltrou a rede de ${target.name}: puxou [${pulledCard.name}] e entregou [${deliveredCard.name}]!`,
      updatedPlayers[myRole],
      'EXECUTED'
    );
    
    // Notificação visual em tempo real para o próprio Social Engineer (feedback imediato na tela)
    triggerEventAlert(
      '🎭 Phishing Realizado com Sucesso!',
      `Você infiltrou a rede de ${target.name}: puxou [${pulledCard.name}] para a sua mão e entregou [${deliveredCard.name}]!`,
      myRole,
      'positive'
    );

    // Notificação em tempo real para a vítima!
    triggerEventAlert(
      '🎭 Phishing Infiltrado!',
      `${currentPlayer.name} (Social Engineer) infiltrou sua rede: puxou [${pulledCard.name}] da sua mão e lhe entregou [${deliveredCard.name}]!`,
      target.id,
      'alert'
    );

    supabaseSync.broadcast('STATE_SYNC', { players: updatedPlayers });
  };

  const finalizeTurnAdvance = (
    overridePlayers?: Record<PlayerRoleId, PlayerState>,
    overrideExploits?: DeployedExploit[],
    overrideMarket?: ProgramCard[],
    overrideProgDecks?: {
      programDeck?: ProgramCard[];
      programDiscard?: ProgramCard[];
    }
  ) => {
    const currentPlayersState = overridePlayers || players;
    const endingPlayer = currentPlayersState[activePlayerRole];
    const endingLimit = endingPlayer ? getPlayerMaxHandSize(endingPlayer) : 6;

    if (endingPlayer && endingPlayer.hand.length > endingLimit) {
      setPendingTurnAdvance(true);
      recordAudit('TURN', `Limite de Mão Excedido (${endingPlayer.hand.length}/${endingLimit})`, `${endingPlayer.name} precisa descartar ${endingPlayer.hand.length - endingLimit} carta(s) antes de passar a vez.`, endingPlayer, 'PENALTY');
      return;
    }

    const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
    const currentIndex = activeList.indexOf(activePlayerRole);
    const nextIndex = (currentIndex + 1) % activeList.length;
    const nextRole = activeList[nextIndex];
    const isNewRound = nextIndex === 0;
    const nextRound = isNewRound ? Math.min(10, currentTurn + 1) : currentTurn;

    // Condição de Fim de Partida:
    // 1. A rodada onde alguém bateu $40k completou sua volta inteira (isNewRound === true)
    // 2. Ou completou a 10ª Rodada (currentTurn >= 10 e isNewRound)
    const isGameEnding = (isNewRound && targetHitRound !== null) || (isNewRound && currentTurn >= 10);

    if (isGameEnding) {
      const ranked = activeList.map(pId => {
        const p = currentPlayersState[pId];
        const repBonus = (p.reputacaoTokens || 0) * 500;
        const alertPenalty = (p.alertaTokens || 0) * 500;
        return { p, repBonus, alertPenalty, total: p.score + repBonus - alertPenalty };
      });
      const cmp = (a: typeof ranked[0], b: typeof ranked[0]) =>
        (b.total - a.total) || (b.p.reputacaoTokens - a.p.reputacaoTokens) || (a.p.alertaTokens - b.p.alertaTokens);
      ranked.sort(cmp);
      const winners = ranked.filter(r => cmp(r, ranked[0]) === 0);
      const winnerNames = winners.map(w => w.p.name).join(' & ');
      const breakdownStr = ranked
        .map((r, idx) => `${idx + 1}º ${r.p.name}: $${r.total.toLocaleString('pt-BR')} (Bounty $${r.p.score.toLocaleString('pt-BR')} + ${r.p.reputacaoTokens}🐝 [+$${r.repBonus}] - ${r.p.alertaTokens}🐞 [-$${r.alertPenalty}])`)
        .join(' | ');
      const endTitle = `🏁 Fim de Partida (Rodada ${currentTurn})! Vencedor: ${winnerNames}`;
      const endDetails = `Contabilização Final com Equal Turns (Bounty + Reputação - Alertas): ${breakdownStr}`;
      recordAudit('TURN', endTitle, endDetails, winners[0].p, 'EXECUTED', currentTurn);
      setGameWinner(winnerNames);
      supabaseSync.broadcast('GAME_OVER', {
        winner: winnerNames,
        players: currentPlayersState,
        deployedExploits: overrideExploits || deployedExploits,
        programMarket: overrideMarket || programMarket,
        currentTurn,
        auditLogs: auditLogsRef.current,
        playerMetrics: playerMetricsRef.current
      });
      saveMatchLogToDatabase(winnerNames).catch(() => {});
      return;
    }

    // Expira eventos de 1 volta completa cujo autor vai iniciar o seu novo turno
    const nextRoundEvents = activeRoundEvents.filter(ev => !(ev.startedByRole === nextRole && nextRound > ev.startedAtRound));
    setActiveRoundEvents(nextRoundEvents);

    // Limpa os status de turno do jogador que acabou de encerrar o turno e reseta as 3 ações do próximo
    const prevEnding = currentPlayersState[activePlayerRole];
    const prevNext = currentPlayersState[nextRole];
    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...currentPlayersState,
      [activePlayerRole]: {
        ...prevEnding,
        actionsRemaining: 0,
        statusEffects: {
          ...prevEnding?.statusEffects,
          noExploitNextTurn: false,
          noReportNextTurn: false,
          noToolsNextTurn: false,
          scopeExpansionNextTurn: false,
          noReconNextTurn: false,
          redirectUsedThisRound: isNewRound ? false : prevEnding?.statusEffects?.redirectUsedThisRound
        }
      },
      [nextRole]: {
        ...prevNext,
        actionsRemaining: 3,
        statusEffects: isNewRound
          ? { ...prevNext?.statusEffects, redirectUsedThisRound: false }
          : prevNext?.statusEffects
      }
    };

    setPlayers(updatedPlayersState);

    setToolInstalledThisTurn(false);
    setFreeToolInstallAvailable(false);
    setExploitsPlayedThisTurn(0);
    setFreeExploitDeploysRemaining(0);
    setPhishingUsedThisTurn(false);
    setRecycledThisTurn(false);

    setActivePlayerRole(nextRole);
    if (isNewRound) {
      setCurrentTurn(nextRound);
      // Gravação incremental dos logs a cada rodada concluída
      saveMatchLogToDatabase().catch(() => {});
    }

    if (gameMode === 'hotseat') {
      setMyRoleState(nextRole);
    }

    recordAudit('TURN', `Vez de ${updatedPlayersState[nextRole]?.name}`, `Iniciando turno na Rodada ${nextRound}/10 com 3 APs. Alvo ativo: [${updatedPlayersState[nextRole]?.activeProgram?.name || 'Nenhum'}].`, updatedPlayersState[nextRole], 'EXECUTED', nextRound);

    const syncPayload = {
      activePlayerRole: nextRole,
      currentTurn: nextRound,
      players: updatedPlayersState,
      deployedExploits: overrideExploits || deployedExploits,
      programMarket: overrideMarket || programMarket,
      mainDeck,
      discardPile,
      toolDeck,
      toolDiscard,
      eventDeck,
      eventDiscard,
      programDeck: overrideProgDecks?.programDeck || programDeck,
      programDiscard: overrideProgDecks?.programDiscard || programDiscard,
      activeRoundEvents: nextRoundEvents,
      auditLogs: auditLogsRef.current,
      playerMetrics: playerMetricsRef.current,
      playerCount
    };
    mpSync.sendAction('END_TURN', syncPayload);
    supabaseSync.broadcast('END_TURN', syncPayload);
  };

  const generateAuditMarkdownReport = (winnerOverride?: string): string => {
    const nowStr = new Date().toLocaleString('pt-BR');
    const winnerDisplay = winnerOverride || gameWinner || 'Partida em Andamento';
    const activeList = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[])
      .slice(0, playerCount)
      .map(id => players[id]);

    const lines: string[] = [];
    lines.push(`# 📊 PWNED! Relatório Oficial de Playtest & Telemetria`);
    lines.push(`- **Data / Hora**: ${nowStr}`);
    lines.push(`- **Sala**: ${roomCode || 'SOLO / LOCAL'}`);
    lines.push(`- **Modo**: ${gameMode.toUpperCase()}`);
    lines.push(`- **Rodada**: ${currentTurn}/10`);
    lines.push(`- **Jogadores**: ${playerCount}`);
    lines.push(`- **Vencedor**: ${winnerDisplay}`);
    lines.push(`- **Eventos Auditados**: ${auditLogsRef.current.length}`);
    lines.push(``);
    lines.push(`## 📈 Desempenho dos Jogadores`);
    lines.push(`| Jogador | Arquétipo | Score | Reputação | Alertas | Reports OK | Patches / Bypass | Multas 2🐞 |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    activeList.forEach(p => {
      const m = playerMetricsRef.current[p.id] || { reportsCompleted: 0, patchesSuffered: 0, bypassUsed: 0, criticalAlarmPenalties: 0, alertsReceived: 0 };
      lines.push(`| **${p.name}** | ${p.archetype.name} | $${p.score.toLocaleString('pt-BR')} | ${p.reputacaoTokens}🐝 | ${p.alertaTokens}🐞 | ${m.reportsCompleted} | ${m.patchesSuffered} / ${m.bypassUsed} | ${m.criticalAlarmPenalties}x |`);
    });
    lines.push(``);
    lines.push(`## 📜 Log Cronológico de Auditoria (${auditLogsRef.current.length} eventos)`);
    lines.push(``);
    [...auditLogsRef.current].reverse().forEach((entry, i) => {
      lines.push(`### ${i + 1}. [${entry.category}] Rodada ${entry.round} • ${entry.timestamp} — ${entry.title}`);
      lines.push(`- **Autor**: ${entry.playerName || 'Sistema'} | **Status**: \`${entry.status}\``);
      lines.push(`- **Detalhes**: ${entry.details}`);
      lines.push(``);
    });

    return lines.join('\n');
  };

  const saveMatchLogToDatabase = async (winnerOverride?: string) => {
    const md = generateAuditMarkdownReport(winnerOverride);
    return await supabaseSync.saveMatchLog({
      roomCode: roomCode || 'SOLO_LOCAL',
      gameMode,
      playerCount,
      round: currentTurn,
      winner: winnerOverride || gameWinner || 'Em andamento',
      metrics: playerMetricsRef.current,
      auditLogs: auditLogsRef.current,
      markdownReport: md
    });
  };

  return (
    <BoardGameContext.Provider
      value={{
        playerNodeId,
        playerHand: currentPlayer.hand,
        playerActiveTools: currentPlayer.activeTools,
        playerActiveProgram: currentPlayer.activeProgram,
        playerArchetype: currentPlayer.archetype,
        playerSafeguardSlot: currentPlayer.safeguardSlot,
        playerCveProtection: currentPlayer.cveProtection,
        mainDeckCount: mainDeck.length,
        toolDeckCount: toolDeck.length,
        eventDeckCount: eventDeck.length,
        programDeckCount: programDeck.length,
        programMarket,
        playerScore: currentPlayer.score,
        bountyTotalCash: currentPlayer.score,
        gameWinner,
        awaitingProgramPick,
        programPickReason,
        duelRotationsRemaining,
        freeExploitDeploysRemaining,
        dynamicMaxHandSize,
        currentScopeOptions,
        activeRoundEvents,
        playerActiveEventsList,
        servers,
        deployedExploits,
        bots,
        currentTurn,
        bountyLedger,
        needsDiscard,
        recycledThisTurn,
        pendingToolInstall,
        actionsRemaining: currentPlayer.actionsRemaining,

        alertaTokens: currentPlayer.alertaTokens,
        reputacaoTokens: currentPlayer.reputacaoTokens,
        useReputacaoReroll,
        addAlertaToken,
        removeAlertaToken,
        addReputacaoToken,

        activePlayerRole,
        myRole,
        isMyTurn,
        gameMode,
        roomCode,
        setRoomCode,
        playerCount,
        setPlayerCount,

        allPlayers: Object.values(players),
        currentPlayer,

        isSetupWizardOpen,
        activeEventCard,
        lastEventResolutionSummary,
        pendingTargetedEvent,
        resolveTargetedEvent,

        pendingDeckPeek,
        resolveDeckPeek,

        incomingAlertNotification,
        dismissIncomingAlert,
        triggerEventAlert,

        patchAlertModal,
        alertServerName,
        isDiceModalOpen,
        diceRollReason,
        isStealthMode,
        logs,
        auditLogs,
        playerMetrics,

        leaveLanRoom,
        startLanMatch,
        setPlayerNickname,
        setMyRole,
        setGameMode,
        completeSetup,
        drawEventCard,
        closeEventModal,
        setGameWinner,
        movePawn,
        actionVarrer,
        actionInfiltrar,
        discardCardFromHand,
        recycleHandCards,
        abandonActiveProgram,
        moveCardToToolsRack,
        cancelToolInstall,
        confirmToolInstall,
        activateInstalledTool,
        moveCardToDefuseSlot,
        activateCveProtection,
        actionReportar,
        triggerManualDiceRoll,
        selectNewProgram,
        drawSurpriseProgramFromDeck,
        rotateMarketProgram,
        handleDiceRollResult,
        defusePatch,
        acceptPatch,
        endTurn,
        resetBoardGame,
        actionSocialPhishing,
        saveMatchLogToDatabase
      }}
    >
      {children}
    </BoardGameContext.Provider>
  );
};

export const useBoardGame = () => {
  const context = useContext(BoardGameContext);
  if (!context) {
    throw new Error('useBoardGame must be used within a BoardGameProvider');
  }
  return context;
};
