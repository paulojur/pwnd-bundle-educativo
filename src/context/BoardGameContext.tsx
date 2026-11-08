import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  buildCanonicalV14ProgramDeck,
  buildCanonicalV14EventDeck,
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
import { getPatchThreshold, BOUNTY_MILESTONES, checkCardScopeV14 } from '../utils/gameRulesV14';

// ─────────────────────────────────────────────────────────────────────────────
// CARD MAPPERS (Canônico V1.4 -> CardV2)
// ─────────────────────────────────────────────────────────────────────────────
export const mapCanonicalToCardV2 = (card: any): CardV2 => {
  if (card.category === 'VULNERABILITY') {
    const v = card as CanonicalVulnCard;
    const icon = v.vulnClass === 'INJ' ? '💉' : v.vulnClass === 'BAC' ? '🚪' : v.vulnClass === 'XSS' ? '🪞' : v.vulnClass === 'AUTH' ? '🔑' : v.vulnClass === 'SSRF' ? '🕵️' : v.vulnClass === 'LOGIC' ? '⏰' : v.vulnClass === 'CRYPTO' ? '🔒' : '💎';

    return {
      id: v.id,
      name: v.name,
      enName: v.name,
      technicalReference: v.technicalReference || v.name,
      type: 'exploit',
      points: v.bountyValue > 0 ? v.bountyValue : 1500,
      rarity: (v.rarity.charAt(0).toUpperCase() + v.rarity.slice(1).toLowerCase()) as any,
      icon,
      simpleDescription: v.description,
      ptDescription: v.shortDesc || v.description,
      isNoisy: v.isNoisy,
      vulnClass: v.vulnClass
    };
  } else if (card.category === 'TOOL') {
    const t = card as CanonicalToolCard;
    return {
      id: t.id,
      name: t.name,
      enName: t.name,
      technicalReference: t.technicalReference || t.name,
      type: 'tool',
      points: 0,
      rarity: 'Common',
      icon: '🛠️',
      simpleDescription: t.description,
      ptDescription: t.shortDesc || t.description
    };
  } else {
    const s = card as CanonicalSafeguardCard;
    return {
      id: s.id,
      name: s.name,
      enName: s.name,
      technicalReference: s.technicalReference || s.name,
      type: 'defuse',
      points: 0,
      rarity: 'Rare',
      icon: '🛡️',
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
  avatarIcon: a.name.includes('n00b') ? '🌱' : a.name.includes('Old Guard') ? '🧠' : a.name.includes('Bug Hunter') ? '🎯' : a.name.includes('Social Engineer') ? '🎭' : a.name.includes('Red Teamer') ? '⚔️' : '🔍',
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
// TIPOS E MODELO DE JOGADOR MULTIPLAYER
// ─────────────────────────────────────────────────────────────────────────────
export type PlayerRoleId = 'player-1' | 'player-2' | 'player-3' | 'player-4' | 'player-5' | 'player-6';

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
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL GAME FACTORY (6 Jogadores canônicos preparados deterministicamente)
// ─────────────────────────────────────────────────────────────────────────────
const createInitialGameState = () => {
  const canonical84 = buildCanonicalV14MainDeck().map(mapCanonicalToCardV2);
  const shuffledMain = shuffleArray(canonical84);

  // 1 carta Bypass entregue na preparação para cada jogador
  const bypassTemplate = mapCanonicalToCardV2(
    V14_SAFEGUARDS.find(s => s.name.includes('Bypass')) || V14_SAFEGUARDS[0]
  );

  // Tool Deck: 48 cartas (12 tipos x 4 cópias)
  const shuffledTools = shuffleArray(buildCanonicalV14ToolDeck().map(mapCanonicalToCardV2));

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

  // Program Market: 3 abertos e o restante no deck
  const shuffledPrograms = shuffleArray([...CANONICAL_PROGRAMS]);
  const market = shuffledPrograms.slice(0, 3);
  const programDeck = shuffledPrograms.slice(3);

  // Cada um dos 6 jogadores recebe 5 cartas da pilha central (30 cartas distribuídas)
  const playersInitial: Record<PlayerRoleId, PlayerState> = {
    'player-1': {
      id: 'player-1',
      name: 'Jogador 1 (Verde)',
      color: '#16A34A',
      archetype: CANONICAL_ARCHETYPES[0], // Script Kiddie
      hand: shuffledMain.slice(0, 5),
      activeTools: [],
      activeProgram: market[0] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p1' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    },
    'player-2': {
      id: 'player-2',
      name: 'Jogador 2 (Azul)',
      color: '#2563EB',
      archetype: CANONICAL_ARCHETYPES[2], // Bug Hunter
      hand: shuffledMain.slice(5, 10),
      activeTools: [],
      activeProgram: market[1] || CANONICAL_PROGRAMS[1] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p2' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    },
    'player-3': {
      id: 'player-3',
      name: 'Jogador 3 (Roxo)',
      color: '#9333EA',
      archetype: CANONICAL_ARCHETYPES[4], // Red Teamer
      hand: shuffledMain.slice(10, 15),
      activeTools: [],
      activeProgram: market[2] || CANONICAL_PROGRAMS[2] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p3' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    },
    'player-4': {
      id: 'player-4',
      name: 'Jogador 4 (Rosa)',
      color: '#DB2777',
      archetype: CANONICAL_ARCHETYPES[1], // Old Guard
      hand: shuffledMain.slice(15, 20),
      activeTools: [],
      activeProgram: CANONICAL_PROGRAMS[3] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p4' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    },
    'player-5': {
      id: 'player-5',
      name: 'Jogador 5 (Laranja)',
      color: '#D97706',
      archetype: CANONICAL_ARCHETYPES[3], // Social Engineer
      hand: shuffledMain.slice(20, 25),
      activeTools: [],
      activeProgram: CANONICAL_PROGRAMS[4] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p5' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    },
    'player-6': {
      id: 'player-6',
      name: 'Jogador 6 (Ciano)',
      color: '#0891B2',
      archetype: CANONICAL_ARCHETYPES[5], // Pentester
      hand: shuffledMain.slice(25, 30),
      activeTools: [],
      activeProgram: CANONICAL_PROGRAMS[5] || CANONICAL_PROGRAMS[0],
      safeguardSlot: { ...bypassTemplate, id: 'bypass-p6' },
      cveProtection: null,
      alertaTokens: 0,
      reputacaoTokens: 0,
      score: 0,
      actionsRemaining: 3
    }
  };

  const remainingMain = shuffledMain.slice(30);

  return {
    playersInitial,
    remainingMain,
    shuffledTools,
    shuffledEvents,
    market,
    programDeck
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
  servers: ServerRegion[];
  deployedExploits: DeployedExploit[];
  bots: any[];
  currentTurn: number;
  bountyLedger: BountyTransaction[];
  needsDiscard: boolean;
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
  playerCount: number;
  setPlayerCount: (count: number) => void;

  allPlayers: PlayerState[];
  currentPlayer: PlayerState;

  isSetupWizardOpen: boolean;
  activeEventCard: EventCardData | null;

  patchAlertModal: boolean;
  alertServerName: string | null;
  isDiceModalOpen: boolean;
  diceRollReason: 'report' | 'endTurn' | 'manualTest';
  isStealthMode: boolean;
  logs: string[];

  // Actions
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
  moveCardToDefuseSlot: (cardId: string) => void;
  activateCveProtection: () => void;
  actionReportar: () => void;
  triggerManualDiceRoll: () => void;
  selectNewProgram: (program: ProgramCard) => void;
  handleDiceRollResult: (result: any) => void;
  defusePatch: () => void;
  acceptPatch: () => void;
  endTurn: () => void;
  resetBoardGame: () => void;
  actionSocialPhishing?: () => void;
}

const BoardGameContext = createContext<BoardGameContextType | undefined>(undefined);

export const BoardGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicialização preguiçosa imediata com dados canônicos
  const [initData] = useState(() => createInitialGameState());

  const [players, setPlayers] = useState<Record<PlayerRoleId, PlayerState>>(() => initData.playersInitial);
  const [playerCount, setPlayerCount] = useState<number>(2); // Duelo 2 Jogadores por padrão (Manual V1.4)
  const [activePlayerRole, setActivePlayerRole] = useState<PlayerRoleId>('player-1');
  const [myRole, setMyRoleState] = useState<PlayerRoleId>('player-1');
  const [gameMode, setGameModeState] = useState<'solo' | 'hotseat' | 'lan'>('hotseat');

  // Decks centrais compartilhados
  const [playerNodeId, setPlayerNodeId] = useState<string>('node-bank-login');
  const [mainDeck, setMainDeck] = useState<CardV2[]>(() => initData.remainingMain);
  const [discardPile, setDiscardPile] = useState<CardV2[]>([]);
  const [toolDeck, setToolDeck] = useState<CardV2[]>(() => initData.shuffledTools);
  const [toolDiscard, setToolDiscard] = useState<CardV2[]>([]);
  const [eventDeck, setEventDeck] = useState<EventCardData[]>(() => initData.shuffledEvents);
  const [programMarket, setProgramMarket] = useState<ProgramCard[]>(() => initData.market);
  const [programDeck, setProgramDeck] = useState<ProgramCard[]>(() => initData.programDeck);

  const [pendingToolInstall, setPendingToolInstall] = useState<CardV2 | null>(null);
  const [servers, setServers] = useState<ServerRegion[]>(SERVERS_DATA);
  const [deployedExploits, setDeployedExploits] = useState<DeployedExploit[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [bountyLedger, setBountyLedger] = useState<BountyTransaction[]>([]);

  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(false);
  const [activeEventCard, setActiveEventCard] = useState<EventCardData | null>(null);

  const [patchAlertModal, setPatchAlertModal] = useState<boolean>(false);
  const [alertServerName, setAlertServerName] = useState<string | null>(null);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState<boolean>(false);
  const [diceRollReason, setDiceRollReason] = useState<'report' | 'endTurn' | 'manualTest'>('report');
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);

  const [logs, setLogs] = useState<string[]>([
    'PWND! The Bug Bounty Chaos — Mesa pronta. 5 cartas na mão + 1 Bypass no Safeguard. Escolha um Programa no Mercado.'
  ]);
  const [bots, setBots] = useState<any[]>([]);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // Jogador atual sendo visualizado no dispositivo local
  const currentPlayer = players[myRole] || players['player-1'];
  const isMyTurn = myRole === activePlayerRole;

  // Helper para atualizar o estado do jogador atual
  const updateCurrentPlayer = useCallback((updater: (prev: PlayerState) => PlayerState) => {
    setPlayers(prev => ({
      ...prev,
      [myRole]: updater(prev[myRole] || prev['player-1'])
    }));
  }, [myRole]);

  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 30)]);
  };

  // ── Tokens Management V1.4 ──────────────────────────────────────────────────
  const addAlertaToken = (count: number = 1) => {
    updateCurrentPlayer(p => {
      const next = p.alertaTokens + count;
      if (next >= 2) {
        soundFx.playPatchDeployedAlarm();
        addLog(`🚨 ALARME CRÍTICO (${p.name})! Acumulou 2 Tokens de Alerta (🐞): -$2.000 imediatos na Bounty Track. Alertas limpos.`);
        return {
          ...p,
          score: Math.max(0, p.score - 2000),
          alertaTokens: 0
        };
      }
      addLog(`🐞 ${p.name}: +${count} Token de Alerta (${next}/2).`);
      return { ...p, alertaTokens: next };
    });
  };

  const removeAlertaToken = (count: number = 1) => {
    updateCurrentPlayer(p => {
      const next = Math.max(0, p.alertaTokens - count);
      if (p.alertaTokens > 0) {
        addLog(`🥷 Modo Furtivo (${p.name}): Removeu ${count} Token de Alerta (${next}/2).`);
      }
      return { ...p, alertaTokens: next };
    });
  };

  const addReputacaoToken = (count: number = 1) => {
    updateCurrentPlayer(p => {
      const next = p.reputacaoTokens + count;
      addLog(`🐝 ${p.name}: Ganhou +${count} Token de Reputação! (Total: ${next})`);
      return { ...p, reputacaoTokens: next };
    });
  };

  const useReputacaoReroll = (): boolean => {
    if (currentPlayer.reputacaoTokens < 2) return false;
    updateCurrentPlayer(p => ({ ...p, reputacaoTokens: p.reputacaoTokens - 2 }));
    addLog(`🐝 Reroll de Patch (${currentPlayer.name}): Gastou 2 Tokens de Reputação para rolar novamente um dado!`);
    return true;
  };

  const dynamicMaxHandSize = currentPlayer.archetype.maxHandSize || 6;
  const needsDiscard = currentPlayer.hand.length > dynamicMaxHandSize;

  // ── Compra Segura com Reembaralhamento de Descarte ─────────────────────────
  const drawCardsFromMainDeck = (count: number): CardV2[] => {
    let availableDeck = [...mainDeck];
    let availableDiscards = [...discardPile];

    if (availableDeck.length < count && availableDiscards.length > 0) {
      addLog('🔄 Main Deck vazio! Reembaralhando a pilha de descarte...');
      availableDeck = [...availableDeck, ...shuffleArray(availableDiscards)];
      availableDiscards = [];
      setDiscardPile([]);
    }

    const drawn: CardV2[] = [];
    for (let i = 0; i < count; i++) {
      if (availableDeck.length === 0) break;
      drawn.push(availableDeck.shift()!);
    }

    setMainDeck(availableDeck);
    return drawn;
  };

  // ── Setup & Reset ──────────────────────────────────────────────────────────
  const setMyRole = (role: PlayerRoleId) => {
    setMyRoleState(role);
    const pName = players[role]?.name || role;
    addLog(`Papel fixado: ${pName}`);
  };

  const setGameMode = (mode: 'solo' | 'hotseat' | 'lan') => {
    setGameModeState(mode);
    addLog(`Modo de Jogo: ${mode.toUpperCase()}`);
  };

  const completeSetup = (archetype: Archetype, program: ProgramCard) => {
    updateCurrentPlayer(p => ({
      ...p,
      archetype,
      activeProgram: program
    }));
    setIsSetupWizardOpen(false);
    addLog(`✅ Setup concluído para ${currentPlayer.name}: [${archetype.name}] contra [${program.name}].`);
  };

  const resetBoardGame = () => {
    const fresh = createInitialGameState();
    setPlayers(fresh.playersInitial);
    setMainDeck(fresh.remainingMain);
    setDiscardPile([]);
    setToolDeck(fresh.shuffledTools);
    setToolDiscard([]);
    setEventDeck(fresh.shuffledEvents);
    setProgramMarket(fresh.market);
    setProgramDeck(fresh.programDeck);
    setDeployedExploits([]);
    setBountyLedger([]);
    setCurrentTurn(1);
    setActivePlayerRole('player-1');
    setMyRoleState('player-1');
    setPatchAlertModal(false);
    setIsDiceModalOpen(false);
    setGameWinner(null);
    addLog('🔄 Tabuleiro reiniciado com novas cartas canônicas V1.4!');
  };

  // ── Supabase Auto-Connect & Realtime Listener ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const roleParam = params.get('role') as PlayerRoleId | null;

    if (roomParam) {
      const assignedRole = roleParam || 'player-2';
      supabaseSync.joinRoom(roomParam, assignedRole, players[assignedRole]?.name || 'Jogador');
      setMyRoleState(assignedRole);
      setGameModeState('lan');
      addLog(`🌐 Conectado à Sala [${roomParam}] como ${players[assignedRole]?.name || assignedRole}.`);
      if (assignedRole !== 'player-1') {
        setTimeout(() => {
          supabaseSync.broadcast('REQUEST_STATE', { from: assignedRole });
        }, 600);
      }
    }

    const unsubscribe = supabaseSync.subscribe((msg: RoomMessage) => {
      if (msg.actionType === 'END_TURN') {
        setActivePlayerRole(msg.payload.activePlayerRole);
        if (msg.payload.currentTurn) setCurrentTurn(msg.payload.currentTurn);
        if (msg.payload.players) setPlayers(msg.payload.players);
        if (msg.payload.deployedExploits) setDeployedExploits(msg.payload.deployedExploits);
        if (msg.payload.programMarket) setProgramMarket(msg.payload.programMarket);
        addLog(`[Rede] Vez de ${msg.payload.activePlayerRole}.`);
      } else if (msg.actionType === 'STATE_SYNC') {
        if (msg.payload.deployedExploits) setDeployedExploits(msg.payload.deployedExploits);
        if (msg.payload.programMarket) setProgramMarket(msg.payload.programMarket);
        if (msg.payload.players) setPlayers(msg.payload.players);
        if (msg.payload.activePlayerRole) setActivePlayerRole(msg.payload.activePlayerRole);
        if (msg.payload.currentTurn) setCurrentTurn(msg.payload.currentTurn);
      } else if (msg.actionType === 'REQUEST_STATE') {
        if (myRole === 'player-1') {
          supabaseSync.broadcast('STATE_SYNC', {
            players,
            deployedExploits,
            programMarket,
            activePlayerRole,
            currentTurn
          });
        }
      }
    });

    return () => unsubscribe();
  }, [players]);

  // ── Actions ────────────────────────────────────────────────────────────────
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

  const applyEventCardEffect = (eventCard: EventCardData) => {
    const eId = eventCard.id;

    // evt-13: Responsible Disclosure!
    // "Todos os jogadores que tiverem vulnerabilidades válidas na mesa podem fazer 1 Report imediato SEM rolar os dados (não compra tool nem evento)"
    if (eId === 'evt-13') {
      soundFx.playScan();
      setPlayers(prevPlayers => {
        let updated = { ...prevPlayers };
        const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
        let reportsMade = 0;

        activeList.forEach(roleId => {
          const p = updated[roleId];
          const pExploits = deployedExploits.filter(e => e.playerId === roleId);
          if (pExploits.length > 0) {
            const vulnTotal = pExploits.reduce((sum, e) => sum + getVulnFlatValue(e.card), 0);
            const progBonus = p.activeProgram?.flatBountyBonus || 0;
            const cash = vulnTotal + progBonus;
            reportsMade++;
            updated[roleId] = {
              ...p,
              score: p.score + cash,
              activeProgram: null
            };
            addLog(`📄 Responsible Disclosure: ${p.name} reportou ${pExploits.length} vulns sem dados e faturou +$${cash.toLocaleString('pt-BR')}!`);
          }
        });

        if (reportsMade > 0) {
          setDiscardPile(prev => [...prev, ...deployedExploits.map(e => e.card)]);
          setDeployedExploits([]);
        } else {
          addLog(`📄 Responsible Disclosure: Nenhum jogador possuía vulnerabilidades implantadas na mesa.`);
        }
        return updated;
      });
      return;
    }

    // evt-06: Bug Bounty Mediation
    // "Todos os jogadores recebem +$1.500 na Bounty Track"
    if (eId === 'evt-06') {
      soundFx.playScan();
      setPlayers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const rId = k as PlayerRoleId;
          next[rId] = { ...next[rId], score: next[rId].score + 1500 };
        });
        return next;
      });
      addLog(`🤝 Bug Bounty Mediation: Todos os jogadores receberam +$1.500 na Bounty Track!`);
      return;
    }

    // evt-24: Bounty Ético
    // "Todos os jogadores com 0 Tokens de Alerta recebem +$1.500 de bônus"
    if (eId === 'evt-24') {
      soundFx.playScan();
      setPlayers(prev => {
        const next = { ...prev };
        let awarded = 0;
        Object.keys(next).forEach(k => {
          const rId = k as PlayerRoleId;
          if (next[rId].alertaTokens === 0) {
            next[rId] = { ...next[rId], score: next[rId].score + 1500 };
            awarded++;
            addLog(`🌟 Bounty Ético: ${next[rId].name} (0 Alertas) recebeu +$1.500 na Bounty Track!`);
          }
        });
        if (awarded === 0) {
          addLog(`🌟 Bounty Ético: Nenhum jogador possuía 0 Alertas.`);
        }
        return next;
      });
      return;
    }

    // evt-09: Public Disclosure!
    // "Todos os jogadores descartam vulnerabilidades na mesa e recebem compensação"
    if (eId === 'evt-09') {
      soundFx.playScan();
      setPlayers(prev => {
        let updated = { ...prev };
        const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
        activeList.forEach(roleId => {
          const p = updated[roleId];
          const pExploits = deployedExploits.filter(e => e.playerId === roleId);
          if (pExploits.length > 0) {
            let compensation = pExploits.reduce((sum, e) => {
              const r = e.card.rarity;
              return sum + (r === 'Common' || r === 'Uncommon' ? 1000 : 2000);
            }, 0);
            updated[roleId] = { ...p, score: p.score + compensation };
            addLog(`📢 Public Disclosure: ${p.name} descartou ${pExploits.length} vulns e recebeu +$${compensation.toLocaleString('pt-BR')} de compensação.`);
          }
        });
        return updated;
      });
      setDiscardPile(prev => [...prev, ...deployedExploits.map(e => e.card)]);
      setDeployedExploits([]);
      return;
    }

    // evt-20: Bug Bounty Conference!
    // "Todos os jogadores compram 2 cartas do Main Deck imediatamente"
    if (eId === 'evt-20') {
      soundFx.playScan();
      setPlayers(prev => {
        const next = { ...prev };
        const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
        activeList.forEach(roleId => {
          const drawn = drawCardsFromMainDeck(2);
          next[roleId] = { ...next[roleId], hand: [...next[roleId].hand, ...drawn] };
        });
        return next;
      });
      addLog(`🎟️ Bug Bounty Conference: Todos os jogadores compraram +2 cartas do Main Deck!`);
      return;
    }

    // evt-23: Swag Drop!
    // "Cada jogador compra 1 Tool Card do Tool Deck"
    if (eId === 'evt-23') {
      soundFx.playScan();
      setToolDeck(tDeck => {
        let deck = [...tDeck];
        setPlayers(prev => {
          const next = { ...prev };
          const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
          activeList.forEach(roleId => {
            if (deck.length > 0) {
              const tool = deck.shift()!;
              next[roleId] = { ...next[roleId], hand: [...next[roleId].hand, tool] };
              addLog(`🎁 Swag Drop: ${next[roleId].name} recebeu Tool [${tool.name}]!`);
            }
          });
          return next;
        });
        return deck;
      });
      return;
    }

    // evt-01: Blue Team Hunt!
    // "Todos os jogadores descartam a vulnerabilidade de maior CVSS exposta na mesa"
    if (eId === 'evt-01') {
      soundFx.playScan();
      const toKeep: DeployedExploit[] = [];
      const discarded: CardV2[] = [];
      const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);

      activeList.forEach(roleId => {
        const pExploits = deployedExploits.filter(e => e.playerId === roleId);
        if (pExploits.length === 0) return;
        const sorted = [...pExploits].sort((a, b) => getVulnFlatValue(b.card) - getVulnFlatValue(a.card));
        discarded.push(sorted[0].card);
        toKeep.push(...sorted.slice(1));
        addLog(`🎯 Blue Team Hunt: Descartou "${sorted[0].card.name}" da mesa de ${players[roleId]?.name || roleId}.`);
      });

      setDeployedExploits(toKeep);
      setDiscardPile(prev => [...prev, ...discarded]);
      return;
    }

    // evt-02: Duplicate Report!
    // "Escolha 1 oponente com vulnerabilidades na mesa: ele descarta a de maior CVSS exposta (Pentester imune)"
    if (eId === 'evt-02') {
      soundFx.playScan();
      const opponents = Object.values(players).filter(p => p.id !== myRole && deployedExploits.some(e => e.playerId === p.id));
      if (opponents.length > 0) {
        const target = opponents[0];
        if (target.archetype.id.includes('pentester')) {
          addLog(`🛡️ Pentester (${target.name}): Imune ao evento Duplicate Report! (Contrato Blindado).`);
        } else if (target.cveProtection) {
          addLog(`📜 CVE Protection ativada por ${target.name}! Anulou o Duplicate Report!`);
          updateCurrentPlayer(p => ({ ...p, cveProtection: null }));
        } else {
          const targetExploits = deployedExploits.filter(e => e.playerId === target.id);
          const sorted = [...targetExploits].sort((a, b) => getVulnFlatValue(b.card) - getVulnFlatValue(a.card));
          const toDiscard = sorted[0];
          setDeployedExploits(prev => prev.filter(e => e.id !== toDiscard.id));
          setDiscardPile(prev => [...prev, toDiscard.card]);
          addLog(`⚠️ Duplicate Report: "${toDiscard.card.name}" descartada da mesa de ${target.name}!`);
        }
      } else {
        addLog(`⚠️ Duplicate Report: Nenhum oponente possuía vulnerabilidades na mesa.`);
      }
      return;
    }

    // evt-14: Honeypot Triggered!
    // "Escolha 1 oponente: descarta 1 carta aleatória da mão"
    if (eId === 'evt-14') {
      soundFx.playScan();
      const opponents = Object.values(players).filter(p => p.id !== myRole && p.hand.length > 0);
      if (opponents.length > 0) {
        const target = opponents[0];
        const cardToDiscard = target.hand[0];
        setPlayers(prev => ({
          ...prev,
          [target.id]: {
            ...target,
            hand: target.hand.filter(c => c.id !== cardToDiscard.id)
          }
        }));
        setDiscardPile(prev => [...prev, cardToDiscard]);
        addLog(`🪤 Honeypot Triggered: ${target.name} descartou "${cardToDiscard.name}" da mão.`);
      }
      return;
    }

    // evt-17: Hall of Fame Update!
    // "O jogador com menor saldo na Bounty Track recebe +$1.5k de bônus imediato"
    if (eId === 'evt-17') {
      soundFx.playScan();
      const activeList = Object.values(players).slice(0, playerCount);
      const lowest = [...activeList].sort((a, b) => a.score - b.score)[0];
      if (lowest) {
        setPlayers(prev => ({
          ...prev,
          [lowest.id]: { ...lowest, score: lowest.score + 1500 }
        }));
        addLog(`🏆 Hall of Fame Update: ${lowest.name} (menor saldo) recebeu +$1.500 de incentivo!`);
      }
      return;
    }
  };

  const drawEventCard = () => {
    setEventDeck(deck => {
      if (deck.length === 0) {
        addLog('Event Deck esgotado!');
        return deck;
      }
      const [top, ...rest] = deck;
      setActiveEventCard(top);
      soundFx.playClick();
      addLog(`🚨 EVENTO ATIVADO: [${top.name}] — ${top.simpleDescription}`);
      applyEventCardEffect(top);
      return rest;
    });
  };

  const closeEventModal = () => setActiveEventCard(null);
  const movePawn = (targetNodeId: string) => setPlayerNodeId(targetNodeId);

  // RECON (Custa 1 AP) -> Compra 2 cartas do Main Deck para a mão!
  const actionVarrer = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.actionsRemaining < 1) { alert('Sem ações restantes!'); return; }
    soundFx.playScan();

    let deck = [...mainDeck];
    let discards = [...discardPile];
    if (deck.length < 2 && discards.length > 0) {
      deck = [...deck, ...shuffleArray(discards)];
      setDiscardPile([]);
    }
    if (deck.length === 0) {
      deck = shuffleArray(buildCanonicalV14MainDeck().map(mapCanonicalToCardV2));
    }

    const drawnCards = deck.slice(0, 2);
    const newDeck = deck.slice(2);

    setMainDeck(newDeck);
    updateCurrentPlayer(p => ({
      ...p,
      hand: [...p.hand, ...drawnCards],
      actionsRemaining: p.actionsRemaining - 1
    }));
    addLog(`🔍 RECON (${currentPlayer.name}): Comprou +${drawnCards.length} cartas do Main Deck para a mão. APs restantes: ${currentPlayer.actionsRemaining - 1}/3.`);
  };

  // EXPLOIT (Custa 1 AP) -> Baixa 1 carta de vulnerabilidade na mesa!
  const actionInfiltrar = (cardId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.actionsRemaining < 1) { alert('Sem ações restantes!'); return; }

    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card || card.type !== 'exploit') return;

    if (!currentPlayer.activeProgram) {
      alert('Selecione primeiro um Programa Corporativo no mercado do Tabuleiro Central!');
      return;
    }

    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    if (myExploits.length >= 3) {
      alert('Limite máximo de 3 vulnerabilidades na Zona de Exploits atingido!');
      return;
    }

    const scopeCheck = checkCardScopeV14(card, currentPlayer.activeProgram, currentPlayer.archetype);
    if (!scopeCheck.inScope) {
      soundFx.playPatchDeployedAlarm();
      alert(`❌ JOGADA INVÁLIDA!\n${scopeCheck.rejectionReason || 'Vulnerabilidade não permitida para o programa ou arquétipo atual.'}`);
      return;
    }

    soundFx.playClick();
    const newExploit: DeployedExploit = { id: Math.random().toString(), nodeId: playerNodeId, card, playerId: myRole };
    const nextExploits = [...deployedExploits, newExploit];
    setDeployedExploits(nextExploits);

    updateCurrentPlayer(p => ({
      ...p,
      hand: p.hand.filter(c => c.id !== cardId),
      actionsRemaining: p.actionsRemaining - 1
    }));

    addLog(`⚡ EXPLOIT (${currentPlayer.name}): "${card.name}" baixada na mesa! APs restantes: ${currentPlayer.actionsRemaining - 1}/3.`);

    // Sincroniza em tempo real
    supabaseSync.broadcast('STATE_SYNC', { deployedExploits: nextExploits });
  };

  const discardCardFromHand = (cardId: string) => {
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;
    soundFx.playClick();
    updateCurrentPlayer(p => ({
      ...p,
      hand: p.hand.filter(c => c.id !== cardId)
    }));
    setDiscardPile(prev => [...prev, card]);
    addLog(`Descartou da mão (${currentPlayer.name}): "${card.name}".`);
  };

  const recycleHandCards = (cardId1: string, cardId2: string) => {
    soundFx.playScan();
    const c1 = currentPlayer.hand.find(c => c.id === cardId1);
    const c2 = currentPlayer.hand.find(c => c.id === cardId2);
    if (c1 && c2) {
      setDiscardPile(prev => [...prev, c1, c2]);
    }
    const drawn = drawCardsFromMainDeck(1);
    updateCurrentPlayer(p => ({
      ...p,
      hand: [...p.hand.filter(c => c.id !== cardId1 && c.id !== cardId2), ...drawn]
    }));
    addLog(`♻️ Reciclagem 2:1 (${currentPlayer.name}): Comprou 1 nova carta.`);
  };

  const abandonActiveProgram = () => {
    if (!currentPlayer.activeProgram) return;
    soundFx.playClick();
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    setDiscardPile(prev => [...prev, ...myExploits.map(e => e.card)]);
    setDeployedExploits(prev => prev.filter(e => e.playerId !== myRole));
    updateCurrentPlayer(p => ({ ...p, activeProgram: null }));
    addLog(`Alvo trocado (RECON): Exploits anteriores de ${currentPlayer.name} descartados.`);
  };

  // Instalação de Ferramenta (Ação Livre - Custo: descartar 1 carta da mão)
  const moveCardToToolsRack = (cardId: string) => {
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;
    if (currentPlayer.activeTools.length >= 3) {
      alert('Tools Rack cheio! Limite de 3 ferramentas instaladas.');
      return;
    }
    if (currentPlayer.hand.length < 2) {
      alert('Instalar ferramenta exige descartar 1 outra carta da mão!');
      return;
    }
    setPendingToolInstall(card);
  };

  const cancelToolInstall = () => setPendingToolInstall(null);

  const confirmToolInstall = (discardCardId: string) => {
    if (!pendingToolInstall) return;
    soundFx.playClick();
    const discardCard = currentPlayer.hand.find(c => c.id === discardCardId);
    if (discardCard) {
      setDiscardPile(prev => [...prev, discardCard]);
    }
    updateCurrentPlayer(p => ({
      ...p,
      hand: p.hand.filter(c => c.id !== pendingToolInstall.id && c.id !== discardCardId),
      activeTools: [...p.activeTools, pendingToolInstall]
    }));
    addLog(`🛠️ Tool [${pendingToolInstall.name}] instalada para ${currentPlayer.name} (descartou "${discardCard?.name || 'carta'}").`);
    setPendingToolInstall(null);
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
      updateCurrentPlayer(p => ({
        ...p,
        hand: p.hand.filter(c => c.id !== cardId),
        cveProtection: card
      }));
      addLog(`📜 CVE Assignment Protection empilhada no Slot Safeguard de ${currentPlayer.name}!`);
    } else {
      if (currentPlayer.safeguardSlot) {
        alert('Você já possui um Bypass instalado no Slot Safeguard!');
        return;
      }
      soundFx.playClick();
      updateCurrentPlayer(p => ({
        ...p,
        hand: p.hand.filter(c => c.id !== cardId),
        safeguardSlot: card
      }));
      addLog(`🛡️ Bypass alocado no Slot Safeguard de ${currentPlayer.name}.`);
    }
  };

  const activateCveProtection = () => {
    const cveCard = currentPlayer.hand.find(c => c.name.includes('CVE') || c.technicalReference.includes('CVE'));
    if (!cveCard) return;
    updateCurrentPlayer(p => ({
      ...p,
      hand: p.hand.filter(c => c.id !== cveCard.id),
      cveProtection: cveCard
    }));
    addLog(`CVE Assignment Protection ativada para ${currentPlayer.name}.`);
  };

  // REPORT (Custa 2 AP — sempre a última ação)
  const actionReportar = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
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
    addLog(`REPORT INICIADO (${currentPlayer.name}): Rolando teste de Patch em Modo Noisy (2D6 somados)...`);
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

    let vulnTotal = eligibleExploits.reduce((sum, e) => sum + getVulnFlatValue(e.card), 0);
    const programBonus = program.flatBountyBonus || 0;
    let earnedCash = vulnTotal + programBonus;

    // 1. Bônus do Pentester (Relatório Estruturado: +$500 com 2 classes distintas, +$1.000 com 3 classes distintas)
    if (activeCurrentPlayer.archetype.id.includes('pentester')) {
      const distinctClasses = new Set(eligibleExploits.map(e => (e.card as any).vulnClass || e.card.rarity)).size;
      if (distinctClasses >= 3) {
        earnedCash += 1000;
        addLog(`🛡️ Pentester (Relatório Estruturado): +$1.000 de bônus por 3 classes técnicas distintas!`);
      } else if (distinctClasses === 2) {
        earnedCash += 500;
        addLog(`🛡️ Pentester (Relatório Estruturado): +$500 de bônus por 2 classes técnicas distintas!`);
      }
    }

    // 2. Bônus do Bug Hunter (+$500 por cada vuln além da 1ª)
    if (activeCurrentPlayer.archetype.id.includes('bug-hunter') && eligibleExploits.length > 1) {
      const extra = (eligibleExploits.length - 1) * 500;
      earnedCash += extra;
    }

    // 3. Bônus do Old Guard (+$500 por cada vuln Epic/Legendary)
    if (activeCurrentPlayer.archetype.id.includes('old-guard')) {
      const epicLegCount = eligibleExploits.filter(e => e.card.rarity === 'Epic' || e.card.rarity === 'Legendary').length;
      earnedCash += epicLegCount * 500;
    }

    // 4. Penalidade do Red Teamer (-$1.500 de custo operacional)
    if (activeCurrentPlayer.archetype.id.includes('red-teamer')) {
      earnedCash = Math.max(0, earnedCash - 1500);
      addLog('Red Teamer: -$1.500 de custo operacional.');
    }

    // Ganho de Reputação (🐝)
    const hasEpicOrLegendary = eligibleExploits.some(e => e.card.rarity === 'Epic' || e.card.rarity === 'Legendary');
    let repGain = 0;
    if (hasEpicOrLegendary) repGain += 1;
    if (activeCurrentPlayer.archetype.id.includes('bug-hunter') && eligibleExploits.length === 3) repGain += 1;

    let specialAlertGain = 0;
    let newScore = activeCurrentPlayer.score + earnedCash;

    // 5. CASAS ESPECIAIS (SE E SOMENTE SE O JOGADOR PARAR EM CIMA DELA)
    const hitMilestone = BOUNTY_MILESTONES.find(m => m.value === newScore);
    let updatedHand = [...activeCurrentPlayer.hand];

    if (hitMilestone) {
      soundFx.playScan();
      addLog(`✨ CASA ESPECIAL ATINGIDA ($${hitMilestone.value.toLocaleString('pt-BR')}) por ${activeCurrentPlayer.name}: ${hitMilestone.label} (${hitMilestone.effectDescription})!`);

      if (hitMilestone.value === 4500) {
        repGain += 1; // 🐝+
      } else if (hitMilestone.value === 9000) {
        specialAlertGain += 1; // 🐞+
      } else if (hitMilestone.value === 13500) {
        repGain += 1; // 🐝+ 🛒
        const drawnMain = drawCardsFromMainDeck(1);
        updatedHand.push(...drawnMain);
      } else if (hitMilestone.value === 19000) {
        specialAlertGain += 1; // 🐞+ 🗂️−
        if (updatedHand.length > 0) {
          const disc = updatedHand.pop()!;
          setDiscardPile(prev => [...prev, disc]);
          addLog(`Casa Especial $19k: Descartou "${disc.name}" da mão.`);
        }
      } else if (hitMilestone.value === 24500) {
        addLog(`Casa Especial $24.5k (🛠️⚡): Instalação gratuita de Tool liberada!`);
      } else if (hitMilestone.value === 29000) {
        repGain += 1; // 🐝+ 🐞−
        specialAlertGain -= 1;
      } else if (hitMilestone.value === 33500) {
        // 💸 -$1.5k (recua para $32.000, sem re-disparo)
        newScore = 32000;
        addLog(`💸 Casa Especial $33.5k: Penalidade -$1.500! Recuou para $32.000.`);
      } else if (hitMilestone.value === 38000) {
        specialAlertGain += 1; // 🐞+
      }
    }

    if (earnedCash >= 10000) confetti({ particleCount: 80, spread: 60 });

    // 6. COMPRA DA TOOL APÓS REPORT BEM-SUCEDIDO (se não foi bypass)
    if (!bypassMode) {
      let currentDeck = [...toolDeck];
      let currentDiscard = [...toolDiscard];
      if (currentDeck.length === 0 && currentDiscard.length > 0) {
        currentDeck = shuffleArray(currentDiscard);
        setToolDiscard([]);
      }
      if (currentDeck.length > 0) {
        const topTool = currentDeck.shift()!;
        setToolDeck(currentDeck);
        updatedHand.push(topTool);
        addLog(`🛠️ Tool Adquirida no Report: [${topTool.name}] foi para a mão de ${activeCurrentPlayer.name}!`);
      }
    }

    // Calcula balanço final de tokens de alerta
    let finalAlerts = Math.max(0, activeCurrentPlayer.alertaTokens + specialAlertGain);
    let penaltyAlertCash = 0;
    if (finalAlerts >= 2) {
      penaltyAlertCash = 2000;
      finalAlerts = 0;
      soundFx.playPatchDeployedAlarm();
      addLog(`🚨 ALARME CRÍTICO (${activeCurrentPlayer.name})! Acumulou 2 Tokens de Alerta (🐞): -$2.000 imediatos na Bounty Track.`);
    }
    newScore = Math.max(0, newScore - penaltyAlertCash);

    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...basePlayers,
      [myRole]: {
        ...activeCurrentPlayer,
        score: newScore,
        reputacaoTokens: activeCurrentPlayer.reputacaoTokens + repGain,
        alertaTokens: finalAlerts,
        activeProgram: null,
        hand: updatedHand
      }
    };
    setPlayers(updatedPlayersState);

    setBountyLedger(prev => [
      ...prev,
      {
        id: 'rep-' + Date.now(),
        turn: currentTurn,
        type: 'Report',
        description: `Report de ${activeCurrentPlayer.name} em ${program.name}`,
        amount: earnedCash,
        mathBreakdown: `Vulns: $${vulnTotal} + Bonus: $${programBonus}`
      }
    ]);

    // Descarte das vulnerabilidades reportadas
    const nextExploits = deployedExploits.filter(e => e.playerId !== myRole);
    setDiscardPile(prev => [...prev, ...eligibleExploits.map(e => e.card)]);
    setDeployedExploits(nextExploits);

    // Saque e execução imediata de Evento de Caos
    drawEventCard();

    // Novo programa no mercado
    let nextMarket = programMarket;
    if (programDeck.length > 0) {
      const nextProg = programDeck[0];
      setProgramDeck(prev => prev.slice(1));
      nextMarket = programMarket.map(slot => slot.id === program.id ? nextProg : slot);
      setProgramMarket(nextMarket);
    }

    // Meta $40k
    if (newScore >= 40000) {
      addLog(`🏆 VITORIOSO! ${activeCurrentPlayer.name} atingiu $40.000 na Bounty Track!`);
      setGameWinner(activeCurrentPlayer.name);
      return;
    }

    finalizeTurnAdvance(updatedPlayersState);
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
        addLog(`🚨 PATCH DEPLOYED! Soma dos dados atingiu o limiar.`);
      }
    } else if (diceRollReason === 'endTurn') {
      if (passed) {
        addLog(`✓ Modo Stealth: Sistema vulnerável! Turno de ${currentPlayer.name} encerrado com sucesso.`);
        finalizeTurnAdvance();
      } else {
        setPatchAlertModal(true);
        setAlertServerName(currentPlayer.activeProgram?.name || null);
        soundFx.playPatchDeployedAlarm();
        addLog(`🚨 PATCH DEPLOYED no fim do turno! Sistemas detectaram a intrusão de ${currentPlayer.name}.`);
      }
    } else {
      addLog(`🎲 Teste D6: Soma ${result.evaluatedSum} vs Limiar ${result.threshold}. ${passed ? 'Seguro ✓' : 'Patch Disparou 💥'}`);
    }
  };

  const selectNewProgram = (chosenProgram: ProgramCard) => {
    updateCurrentPlayer(p => ({ ...p, activeProgram: chosenProgram }));
    soundFx.playClick();
    addLog(`🎯 Programa selecionado para ${currentPlayer.name}: [${chosenProgram.name}].`);
  };

  // PASSAR TURNO
  const endTurn = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    const hasNoisyExploit = myExploits.some(e => e.card.isNoisy);

    if (myExploits.length > 0) {
      setIsStealthMode(!hasNoisyExploit);
      setDiceRollReason('endTurn');
      setIsDiceModalOpen(true);
      addLog(`🎲 Passando turno com vulns na mesa... Teste de Patch (${hasNoisyExploit ? 'Noisy 2D6' : 'Stealth 3D6'})!`);
    } else {
      // Mesa limpa: remove 1 Token de Alerta se tiver
      removeAlertaToken(1);
      finalizeTurnAdvance();
    }
  };

  const defusePatch = () => {
    setIsDiceModalOpen(false);
    setPatchAlertModal(false);

    const nextAlert = currentPlayer.alertaTokens + 1;
    let penaltyCash = 0;
    let finalAlert = nextAlert;
    if (nextAlert >= 2) {
      penaltyCash = 2000;
      finalAlert = 0;
      soundFx.playPatchDeployedAlarm();
      addLog(`🚨 ALARME CRÍTICO (${currentPlayer.name})! 2 Tokens de Alerta (🐞): -$2.000 imediatos na Bounty Track.`);
    } else {
      addLog(`🐞 ${currentPlayer.name}: +1 Token de Alerta (${finalAlert}/2).`);
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
    addLog(`🛡️ BYPASS ATIVADO (${currentPlayer.name}): Anulou o Patch! Bypass descartado e recebeu 1 Token de Alerta.`);

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
    setDiscardPile(prev => [...prev, ...myExploits.map(e => e.card)]);
    setDeployedExploits(prev => prev.filter(e => e.playerId !== myRole));

    const nextAlert = currentPlayer.alertaTokens + 1;
    let penaltyCash = 0;
    let finalAlert = nextAlert;
    if (nextAlert >= 2) {
      penaltyCash = 2000;
      finalAlert = 0;
      soundFx.playPatchDeployedAlarm();
      addLog(`🚨 ALARME CRÍTICO (${currentPlayer.name})! Acumulou 2 Tokens de Alerta (🐞): -$2.000 imediatos na Bounty Track.`);
    } else {
      addLog(`🐞 ${currentPlayer.name}: +1 Token de Alerta (${finalAlert}/2).`);
    }

    // Compra 1 carta de consolação do Main Deck
    const consolation = drawCardsFromMainDeck(1);
    const updatedPlayersState: Record<PlayerRoleId, PlayerState> = {
      ...players,
      [myRole]: {
        ...currentPlayer,
        score: Math.max(0, currentPlayer.score - penaltyCash),
        activeProgram: null,
        alertaTokens: finalAlert,
        hand: [...currentPlayer.hand, ...consolation]
      }
    };
    setPlayers(updatedPlayersState);

    addLog(`💥 PATCH DEPLOYED ACEITO (${currentPlayer.name}): Exploits descartados, +1 Token de Alerta e comprou 1 carta de consolação.`);
    finalizeTurnAdvance(updatedPlayersState);
  };

  // Habilidade Social Engineer: Phishing
  const actionSocialPhishing = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (currentPlayer.actionsRemaining < 1) { alert('Sem ações restantes!'); return; }
    if (currentPlayer.hand.length === 0) { alert('Você precisa ter pelo menos 1 carta na mão para entregar!'); return; }

    const opponents = Object.values(players).filter(p => p.id !== myRole && p.hand.length > 0);
    if (opponents.length === 0) {
      alert('Nenhum oponente possui cartas na mão para o Phishing!');
      return;
    }

    soundFx.playScan();
    const target = opponents[0];
    const pulledCard = target.hand[0];
    const deliveredCard = currentPlayer.hand[0];

    setPlayers(prev => ({
      ...prev,
      [target.id]: {
        ...target,
        hand: [...target.hand.filter(c => c.id !== pulledCard.id), deliveredCard]
      },
      [myRole]: {
        ...currentPlayer,
        hand: [...currentPlayer.hand.filter(c => c.id !== deliveredCard.id), pulledCard],
        actionsRemaining: currentPlayer.actionsRemaining - 1
      }
    }));

    addLog(`🎭 PHISHING (${currentPlayer.name}): Puxou "${pulledCard.name}" de ${target.name} e entregou "${deliveredCard.name}"!`);
  };

  const finalizeTurnAdvance = (overridePlayers?: Record<PlayerRoleId, PlayerState>) => {
    const currentPlayersState = overridePlayers || players;
    const activeList: PlayerRoleId[] = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).slice(0, playerCount);
    const currentIndex = activeList.indexOf(activePlayerRole);
    const nextIndex = (currentIndex + 1) % activeList.length;
    const nextRole = activeList[nextIndex];
    const isNewRound = nextIndex === 0;
    const nextRound = isNewRound ? Math.min(8, currentTurn + 1) : currentTurn;

    if (isNewRound && currentTurn >= 8) {
      let bestPlayer = currentPlayersState['player-1'];
      let bestScore = -1;
      activeList.forEach(pId => {
        const p = currentPlayersState[pId];
        const finalScore = p.score + (p.reputacaoTokens * 500) - (p.alertaTokens * 500);
        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestPlayer = p;
        }
      });
      addLog(`🏁 8ª RODADA CONCLUÍDA! Vencedor da Mesa: ${bestPlayer.name} com $${bestScore.toLocaleString('pt-BR')}!`);
      setGameWinner(bestPlayer.name);
      return;
    }

    // Reseta as 3 Ações do próximo jogador
    const updatedPlayers: Record<PlayerRoleId, PlayerState> = {
      ...currentPlayersState,
      [nextRole]: {
        ...currentPlayersState[nextRole],
        actionsRemaining: 3
      }
    };
    setPlayers(updatedPlayers);

    setActivePlayerRole(nextRole);
    if (isNewRound) {
      setCurrentTurn(nextRound);
    }

    // No modo hotseat local, a perspectiva alterna automaticamente para o jogador da vez!
    if (gameMode === 'hotseat') {
      setMyRoleState(nextRole);
    }

    const syncPayload = {
      activePlayerRole: nextRole,
      currentTurn: nextRound,
      players: updatedPlayers,
      deployedExploits,
      programMarket
    };
    mpSync.sendAction('END_TURN', syncPayload);
    supabaseSync.broadcast('END_TURN', syncPayload);
    addLog(`⏩ Vez de: ${updatedPlayers[nextRole]?.name || nextRole} (Rodada ${nextRound}/8)`);

    if (gameMode === 'solo' && nextRole !== 'player-1') {
      setTimeout(() => {
        addLog(`🤖 Oponente virtual (${updatedPlayers[nextRole]?.name}) jogou.`);
        finalizeTurnAdvance(updatedPlayers);
      }, 1200);
    }
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
        servers,
        deployedExploits,
        bots,
        currentTurn,
        bountyLedger,
        needsDiscard,
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
        playerCount,
        setPlayerCount,

        allPlayers: Object.values(players),
        currentPlayer,

        isSetupWizardOpen,
        activeEventCard,

        patchAlertModal,
        alertServerName,
        isDiceModalOpen,
        diceRollReason,
        isStealthMode,
        logs,

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
        moveCardToDefuseSlot,
        activateCveProtection,
        actionReportar,
        triggerManualDiceRoll,
        selectNewProgram,
        handleDiceRollResult,
        defusePatch,
        acceptPatch,
        endTurn,
        resetBoardGame,
        actionSocialPhishing
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
