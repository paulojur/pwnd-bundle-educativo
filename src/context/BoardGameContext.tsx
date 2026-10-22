import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CardV2, CARDS_V2 } from '../data/cardsDataV2';
import { FULL_80_VULNERABILITIES, FULL_12_TOOLS, FULL_3_DEFUSES } from '../data/full80DeckData';
import { ServerRegion, SERVERS_DATA, ALL_BOARD_NODES } from '../data/boardData';
import { getZoneByBalance } from '../utils/gameRules';
import { ProgramCard, PROGRAM_CARDS, Archetype, ARCHETYPES } from '../data/cardsData';
import { FULL_24_EVENTS, EventCardData } from '../data/full24EventsData';
import { mpSync } from '../utils/multiplayerSync';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

// ─────────────────────────────────────────────────────────────────────────────
// DECK BUILDER V1.2 — Seção 04 do Manual V1.2
// Main Deck: 80 vulns + 4 Safeguards (2 Bypass + 2 CVE) = 84 cartas
// Tool Deck SEPARADO: 12 tools × 3 cópias = 36 cartas
// ─────────────────────────────────────────────────────────────────────────────
const buildCanonical84Deck = (): CardV2[] => {
  // 4 Safeguards (2 Bypass + 2 CVE)
  const bypassCards = FULL_3_DEFUSES.filter(d =>
    d.technicalReference === 'Bypass Card' || d.name.includes('Bypass')
  ).slice(0, 2);

  const cveCards = FULL_3_DEFUSES.filter(d =>
    d.technicalReference.includes('CVE') || d.name.includes('CVE')
  ).slice(0, 2);

  const safeguards = [...bypassCards, ...cveCards]; // 4 total
  const deck = [...FULL_80_VULNERABILITIES, ...safeguards]; // 84 total
  if (deck.length !== 84) {
    console.warn(`[PWND] Main Deck incorreto: ${deck.length} cartas (esperado 84)`);
  }
  return deck;
};

const buildToolDeck36 = (): CardV2[] => {
  // 12 tools × 3 cópias = 36
  const deck = [
    ...FULL_12_TOOLS,
    ...FULL_12_TOOLS.map(t => ({ ...t, id: `${t.id}-c2` })),
    ...FULL_12_TOOLS.map(t => ({ ...t, id: `${t.id}-c3` })),
  ];
  if (deck.length !== 36) {
    console.warn(`[PWND] Tool Deck incorreto: ${deck.length} cartas (esperado 36)`);
  }
  return deck;
};


const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Red Teamer V1.2: arredonda para o múltiplo de $500 mais próximo (inferior ou igual)
const roundTo500 = (value: number): number => Math.floor(value / 500) * 500;

// ─────────────────────────────────────────────────────────────────────────────
// PATCH SPEED HELPERS — Seções 07-08, 15
// ─────────────────────────────────────────────────────────────────────────────
// Returns the threshold (inclusive) at or above which the patch fires
const getPatchThreshold = (patchSpeed: string): number => {
  switch (patchSpeed) {
    case 'Lenta':    return 8;
    case 'Moderada': return 7;
    case 'Rápida':   return 6;
    case 'Rǭpida':   return 6;
    case 'Extrema':  return 5;
    default:         return 8; // Muito Lenta / unknown → only 8
  }
};

// Seção 15: R8 Stealth Mode lowers threshold by 1
const getPatchThresholdStealth = (patchSpeed: string): number =>
  Math.max(1, getPatchThreshold(patchSpeed) - 1);

// Red Teamer & Pentester take patch only on natural 8
const isArchetypePatchOnly8 = (archetypeId: string) =>
  archetypeId === 'red-teamer' || archetypeId === 'pentester';

// V1.2: Stealth rola 2D8 e usa o MENOR valor (vantagem para o jogador)
// Noisy Report: rola 1D8 normal
const didPatchFire = (
  diceValue: number,
  diceValue2: number | undefined,
  patchSpeed: string,
  archetypeId: string,
  isStealthMode: boolean,
  _currentRound: number // mantido para compatibilidade de assinatura
): boolean => {
  const specialOnly8 = isArchetypePatchOnly8(archetypeId);
  if (specialOnly8) return diceValue >= 8;

  const threshold = isStealthMode
    ? getPatchThresholdStealth(patchSpeed)
    : getPatchThreshold(patchSpeed);

  if (!isStealthMode || diceValue2 === undefined) {
    return diceValue >= threshold;
  }

  // Stealth: rola 2D8 e fica com o MENOR (vantagem)
  const best = Math.min(diceValue, diceValue2);
  return best >= threshold;
};


// ─────────────────────────────────────────────────────────────────────────────
// ARCHETYPE POWER HELPERS — Seção 10
// ─────────────────────────────────────────────────────────────────────────────
// Bug Hunter: only Common and Uncommon count as valid exploits
const isBugHunterEligible = (card: CardV2): boolean =>
  card.rarity === 'Common' || card.rarity === 'Uncommon';

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM TIER HELPERS — Seção 06 (mínimo de escopo)
// ─────────────────────────────────────────────────────────────────────────────
const getProgramTier = (program: ProgramCard): 'Low' | 'Medium' | 'High' | 'Critical' => {
  const bonus = program.flatBountyBonus;
  if (bonus >= 4000) return 'Critical';
  if (bonus >= 2500) return 'High';
  if (bonus >= 1000) return 'Medium';
  return 'Low';
};

const getMinVulnsRequired = (program: ProgramCard): number => {
  const tier = getProgramTier(program);
  if (tier === 'High' || tier === 'Critical') return 2;
  return 1; // Low or Medium
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface DeployedExploit {
  id: string;
  nodeId: string;
  card: CardV2;
  playerId: string;
}

export interface BoardGameBot {
  id: string;
  name: string;
  icon: string;
  currentNodeId: string;
  score: number;
}

// Track which vuln technicalReferences were reported per program
export type ReportHistory = Record<string, Set<string>>; // programId → Set<technicalReference>

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
  playerSafeguardSlot: CardV2 | null; // Bypass no Slot Safeguard (Seção 04)
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
  bots: BoardGameBot[];
  currentTurn: number;
  bountyLedger: BountyTransaction[];
  needsDiscard: boolean;
  pendingToolInstall: CardV2 | null;
  actionsRemaining: number; // AP: 3 por turno (Report custa 2, Recon/Exploit custam 1)

  activePlayerRole: 'player-1' | 'player-2';
  myRole: 'player-1' | 'player-2';
  isMyTurn: boolean;
  gameMode: 'solo' | 'hotseat' | 'lan';

  isSetupWizardOpen: boolean;
  activeEventCard: EventCardData | null;

  patchAlertModal: boolean;
  alertServerName: string | null;
  isDiceModalOpen: boolean;
  diceRollReason: 'report' | 'endTurn' | 'manualTest';
  isStealthMode: boolean;
  logs: string[];

  // Actions
  setMyRole: (role: 'player-1' | 'player-2') => void;
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
  handleDiceRollResult: (result: { diceValue: number; diceValue2?: number; passed: boolean }) => void;
  defusePatch: () => void;
  acceptPatch: () => void;
  endTurn: () => void;
  resetBoardGame: () => void;
}


const BoardGameContext = createContext<BoardGameContextType | undefined>(undefined);

export const BoardGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [playerNodeId, setPlayerNodeId] = useState<string>('node-bank-login');
  const [playerHand, setPlayerHand] = useState<CardV2[]>([]);
  const [playerActiveTools, setPlayerActiveTools] = useState<CardV2[]>([]);
  const [playerActiveProgram, setPlayerActiveProgram] = useState<ProgramCard | null>(null);
  const [playerArchetype, setPlayerArchetype] = useState<Archetype>(ARCHETYPES[0]);

  // Seção 04: Bypass posicionado no Slot Safeguard (NÃO conta como carta de mão)
  const [playerSafeguardSlot, setPlayerSafeguardSlot] = useState<CardV2 | null>(null);
  // CVE Assignment Protection ativa (uso único)
  const [playerCveProtection, setPlayerCveProtection] = useState<CardV2 | null>(null);
  const [pendingToolInstall, setPendingToolInstall] = useState<CardV2 | null>(null);

  const [programMarket, setProgramMarket] = useState<ProgramCard[]>(() => shuffleArray([...PROGRAM_CARDS]).slice(0, 3));
  const [programDeck, setProgramDeck] = useState<ProgramCard[]>(() => shuffleArray([...PROGRAM_CARDS]).slice(3));
  const [mainDeck, setMainDeck] = useState<CardV2[]>([]);
  const [toolDeck, setToolDeck] = useState<CardV2[]>([]); // Tool Deck separado V1.2
  const [eventDeck, setEventDeck] = useState<EventCardData[]>([]);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [servers, setServers] = useState<ServerRegion[]>(SERVERS_DATA);
  const [deployedExploits, setDeployedExploits] = useState<DeployedExploit[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [bountyLedger, setBountyLedger] = useState<BountyTransaction[]>([]);

  // AP System V1.2: 3 ações por turno (Recon=1, Exploit=1, Report=2 e sempre última)
  const [actionsRemaining, setActionsRemaining] = useState<number>(3);

  // Track reports per round (Old Guard: 1 per round)
  const [reportsThisRound, setReportsThisRound] = useState<number>(0);

  // Social Engineer: pode redirecionar 1× por rodada
  const [socialEngineerUsedThisRound, setSocialEngineerUsedThisRound] = useState<boolean>(false);

  const [gameMode, setGameModeState] = useState<'solo' | 'hotseat' | 'lan'>('solo');
  const [activePlayerRole, setActivePlayerRole] = useState<'player-1' | 'player-2'>('player-1');
  const [myRole, setMyRoleState] = useState<'player-1' | 'player-2'>('player-1');

  const isMyTurn = myRole === activePlayerRole;

  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(true);
  const [activeEventCard, setActiveEventCard] = useState<EventCardData | null>(null);

  const [patchAlertModal, setPatchAlertModal] = useState<boolean>(false);
  const [alertServerName, setAlertServerName] = useState<string | null>(null);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState<boolean>(false);
  const [diceRollReason, setDiceRollReason] = useState<'report' | 'endTurn' | 'manualTest'>('report');
  const [isStealthMode, setIsStealthMode] = useState<boolean>(false);

  const [logs, setLogs] = useState<string[]>(['PWND! Board Game — Inicie a Fase de Preparação da Mesa.']);

  const [bots, setBots] = useState<BoardGameBot[]>([
    { id: 'bot-1', name: 'Ninja_Cyber', icon: '🤖', currentNodeId: 'node-ecom-catalog', score: 0 },
    { id: 'bot-2', name: 'Ghost_Hacker', icon: '👾', currentNodeId: 'node-social-feed', score: 0 }
  ]);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  const bountyTotalCash = playerScore;

  // ── Logging ──────────────────────────────────────────────────────────────────
  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 30)]);
  };

  // ── Hand size enforcer — Seção 10 ─────────────────────────────────────────
  const enforceHandLimit = useCallback((hand: CardV2[], archetype: Archetype): CardV2[] => {
    // Agora o limite é forçado via needsDiscard e não interceptando a compra
    return hand;
  }, []);

  // Detect tools in rack
  const hasNmapInRack = () =>
    playerActiveTools.some(t => t.technicalReference === 'Network & Fuzzing Scanner');

  const hasBrowserDevToolsInRack = () =>
    playerActiveTools.some(t =>
      t.technicalReference === 'Browser DevTools' && t.id.includes('devtools-2')
    );

  // Dynamic max hand size (Browser DevTools c2: +1)
  const dynamicMaxHandSize = playerArchetype.maxHandSize + (hasBrowserDevToolsInRack() ? 1 : 0);

  const needsDiscard = playerHand.length > dynamicMaxHandSize;

  // ── Draw from any deck ──────────────────────────────────────────────────
  const drawFromDeck = (count: number, currentDeck: CardV2[]): [CardV2[], CardV2[]] => {
    const drawn: CardV2[] = [];
    const remaining = [...currentDeck];
    for (let i = 0; i < count; i++) {
      if (remaining.length === 0) break;
      drawn.push(remaining.shift()!);
    }
    return [drawn, remaining];
  };


  // ── Setup — Seção 04 ──────────────────────────────────────────────────────
  const setMyRole = (role: 'player-1' | 'player-2') => {
    setMyRoleState(role);
    addLog(`Papel fixado no dispositivo: ${role === 'player-1' ? 'Jogador 1 (Verde)' : 'Jogador 2 (Azul)'}`);
  };

  const setGameMode = (mode: 'solo' | 'hotseat' | 'lan') => {
    setGameModeState(mode);
    addLog(`Modo de Jogo alterado para: ${mode.toUpperCase()}`);
  };

  const completeSetup = (archetype: Archetype, program: ProgramCard) => {
    setPlayerArchetype(archetype);
    setPlayerActiveProgram(program);
    setReportsThisRound(0);
    setSocialEngineerUsedThisRound(false);
    setActionsRemaining(3);

    // Build V1.2 canonical 84-card main deck
    const canonical84 = buildCanonical84Deck();

    // Extract 1 Bypass for Safeguard Slot (Seção 04)
    const bypassIndex = canonical84.findIndex(c =>
      c.technicalReference === 'Bypass Card' || c.name === 'Safeguard (Bypass)'
    );
    let bypassForSlot: CardV2 | null = null;
    let deckWithout: CardV2[] = canonical84;
    if (bypassIndex !== -1) {
      bypassForSlot = canonical84[bypassIndex];
      deckWithout = canonical84.filter((_, i) => i !== bypassIndex);
    }

    const shuffledDeck = shuffleArray(deckWithout); // 83 cards in main deck
    setMainDeck(shuffledDeck);
    setPlayerSafeguardSlot(bypassForSlot);

    // Tool Deck separado V1.2: 36 cartas, baralhação independente
    const shuffledTools = shuffleArray(buildToolDeck36());
    setToolDeck(shuffledTools);

    // Event deck: 24 cards
    const shuffledEvents = shuffleArray([...FULL_24_EVENTS]);
    setEventDeck(shuffledEvents);

    // Program market
    const shuffledPrograms = shuffleArray([...PROGRAM_CARDS]);
    setProgramMarket(shuffledPrograms.slice(0, 3));
    setProgramDeck(shuffledPrograms.slice(3));

    // Initial hand: 5 cards from main deck
    const [initialHand, remaining] = drawFromDeck(5, shuffledDeck);
    setMainDeck(remaining);
    setPlayerHand(initialHand);
    setPlayerActiveTools([]);
    setDeployedExploits([]);
    setPlayerScore(0);
    setBountyLedger([]);
    setCurrentTurn(1);
    setActionsRemaining(3);

    setIsSetupWizardOpen(false);
    addLog(
      `✅ PREPARAÇÃO CONCLUÍDA! Arquétipo [${archetype.name}]. ` +
      `Main Deck: 83 cartas. Tool Deck: 36 cartas. Event Deck: 24 cartas. ` +
      `5 cartas compradas. 1 Bypass no Slot Safeguard.`
    );
  };

  // Auto-start
  useEffect(() => {
    const randArchetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const shuffledPrograms = shuffleArray([...PROGRAM_CARDS]);
    const randProgram = shuffledPrograms[0];
    setTimeout(() => {
      completeSetup(randArchetype, randProgram);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LAN sync
  useEffect(() => {
    const unsubscribe = mpSync.subscribe((msg) => {
      if (msg.actionType === 'END_TURN') {
        const nextRole = msg.payload.activePlayerRole;
        const nextTurn = msg.payload.currentTurn;
        setActivePlayerRole(nextRole);
        if (nextTurn) setCurrentTurn(nextTurn);
        soundFx.playClick();
        if (nextRole === myRole) {
          addLog(`🟢 O oponente passou a vez! É A SUA VEZ DE JOGAR!`);
        } else {
          addLog(`⏳ Turno passado. Aguardando o ${nextRole === 'player-1' ? 'Jogador 1' : 'Jogador 2'}...`);
        }
      }
    });
    return () => unsubscribe();
  }, [myRole]);

  // ── Event Draw V1.2 ─────────────────────────────────────────────────────────────────────
  const drawEventCard = useCallback(() => {
    soundFx.playPatchDeployedAlarm();

    setEventDeck(prev => {
      if (prev.length === 0) {
        // Recicla o Event Deck (Seção 09)
        addLog('📠 Event Deck esgotado — rebaralhando.');
        return shuffleArray([...FULL_24_EVENTS]);
      }
      const [top, ...rest] = prev;
      setActiveEventCard(top);
      addLog(`🚨 EVENT CARD: [${top.name}] — ${top.simpleDescription}`);

      // evt-23: Swag Drop — cada jogador compra 1 Tool Card DO TOOL DECK
      if (top.id === 'evt-23') {
        setToolDeck(deck => {
          if (deck.length === 0) { addLog('🎁 Swag Drop: Tool Deck vazio.'); return deck; }
          const tool = deck[0];
          setPlayerHand(hand => enforceHandLimit([...hand, tool], playerArchetype));
          addLog(`🎁 Swag Drop: Tool "${tool.name}" adicionada à mão!`);
          return deck.slice(1);
        });
      }

      // evt-17: Hall of Fame Update — jogador em último lugar compra 2 Tools DO TOOL DECK
      if (top.id === 'evt-17') {
        setToolDeck(deck => {
          const toolCards = deck.slice(0, 2);
          if (toolCards.length > 0) {
            setPlayerHand(hand => enforceHandLimit([...hand, ...toolCards], playerArchetype));
            addLog(`🏆 Hall of Fame: +${toolCards.length} Tool Cards do Tool Deck!`);
            return deck.slice(toolCards.length);
          }
          return deck;
        });
      }

      // evt-20: Bug Bounty Conference — Todos compram 2 cartas do Main Deck
      if (top.id === 'evt-20') {
        setMainDeck(deck => {
          const [drawn, remaining] = drawFromDeck(2, deck);
          setPlayerHand(hand => enforceHandLimit([...hand, ...drawn], playerArchetype));
          addLog(`🎫 Bug Bounty Conference: +${drawn.length} cartas do Main Deck!`);
          return remaining;
        });
      }

      // evt-24: Bounty Ético
      if (top.id === 'evt-24') {
        if (reportsThisRound > 0) {
          const gain = 2000;
          setPlayerScore(s => s + gain);
          addLog(`🏅 Bounty Ético: +$${gain.toLocaleString('pt-BR')}!`);
          setBountyLedger(prev => [...prev, {
            id: `evt-24-${Date.now()}`,
            turn: currentTurn,
            type: 'Event',
            description: 'Bounty Ético (evt-24)',
            amount: gain,
            mathBreakdown: 'Bónus fixo por report na mesma ronda'
          }]);
        } else {
          addLog(`🏅 Bounty Ético: Nenhum report esta ronda — sem bónus.`);
        }
      }

      // evt-13: Responsible Disclosure
      if (top.id === 'evt-13') {
        addLog(`📄 Responsible Disclosure: Realize 1 Report IMEDIATO sem rolar D8!`);
      }

      return rest;
    });
  }, [playerArchetype, reportsThisRound, enforceHandLimit, currentTurn]);

  const closeEventModal = () => setActiveEventCard(null);

  // ── Movement ──────────────────────────────────────────────────────────────────────────
  const movePawn = (targetNodeId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    const currentNode = ALL_BOARD_NODES.find(n => n.id === playerNodeId);
    if (currentNode && currentNode.connectedNodeIds.includes(targetNodeId)) {
      soundFx.playClick();
      setPlayerNodeId(targetNodeId);
      const targetNode = ALL_BOARD_NODES.find(n => n.id === targetNodeId);
      addLog(`Peão movido para: [${targetNode?.name}]`);
    } else {
      addLog('Rota inválida!');
    }
  };

  // ── Recon (Varrer) V1.2 — 1 AP; Nmap no rack: 3 cartas em vez de 2 ──────────────────
  const actionVarrer = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (actionsRemaining < 1) { alert('Sem ações restantes neste turno! Encerre o turno.'); return; }
    soundFx.playScan();
    const drawCount = hasNmapInRack() ? 3 : 2; // Nmap passiva V1.2
    setMainDeck(deck => {
      const [drawn, remaining] = drawFromDeck(drawCount, deck);
      setPlayerHand(hand => [...hand, ...drawn]);
      addLog(`RECON: +${drawn.length} cartas (${remaining.length} restantes). APs: ${actionsRemaining - 1}/3.`);
      return remaining;
    });
    setActionsRemaining(ap => ap - 1);
  };

  // ── Exploit (Infiltrar) V1.2 — 1 AP ──────────────────────────────────────────────
  const actionInfiltrar = (cardId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    if (actionsRemaining < 1) { alert('Sem ações restantes neste turno! Encerre o turno.'); return; }

    const card = playerHand.find(c => c.id === cardId);
    if (!card || card.type !== 'exploit') return;

    if (!playerActiveProgram) {
      alert('Selecione um Active Program no Program Market!');
      return;
    }

    const allowed = playerActiveProgram.allowedClasses;
    const isRedTeamer = playerArchetype.id === 'red-teamer';

    // Scope check (Red Teamer ignora restrições de escopo)
    if (allowed !== 'ALL' && !isRedTeamer) {
      const cardRef = card.technicalReference || card.name;
      const isAllowed = Array.isArray(allowed) && allowed.some(cat =>
        cardRef.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(cardRef.toLowerCase())
      );
      if (!isAllowed) {
        soundFx.playPatchDeployedAlarm();
        alert(`❌ FORA DE ESCOPO!\n"${card.name}" não é aceita por [${playerActiveProgram.name}].`);
        addLog(`❌ Carta "${card.name}" fora de escopo em ${playerActiveProgram.name}.`);
        return;
      }
    }

    // Bug Hunter: só Comum e Incomum
    if (playerArchetype.id === 'bug-hunter' && !isBugHunterEligible(card)) {
      alert(`❌ Bug Hunter só pode explorar vulnerabilidades Comum e Incomum!\n"${card.name}" é ${card.rarity}.`);
      addLog(`❌ Bug Hunter: "${card.name}" (${card.rarity}) não é permitida.`);
      return;
    }

    soundFx.playClick();
    const currentNode = ALL_BOARD_NODES.find(n => n.id === playerNodeId);
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setDeployedExploits(prev => [...prev, { id: Math.random().toString(), nodeId: playerNodeId, card, playerId: myRole }]);
    addLog(`EXPLOIT: "${card.name}" armada em ${currentNode?.name || playerNodeId}! APs: ${actionsRemaining - 1}/3.`);
    setActionsRemaining(ap => ap - 1);
  };


  // ── Discard / Recycle ────────────────────────────────────────────────────
  const discardCardFromHand = (cardId: string) => {
    const card = playerHand.find(c => c.id === cardId);
    if (!card) return;
    soundFx.playClick();
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    addLog(`Descartada: "${card.name}".`);
  };

  const recycleHandCards = (cardId1: string, cardId2: string) => {
    soundFx.playScan();
    setMainDeck(deck => {
      const [drawn, remaining] = drawFromDeck(1, deck);
      setPlayerHand(prev => {
        const filtered = prev.filter(c => c.id !== cardId1 && c.id !== cardId2);
        return enforceHandLimit([...filtered, ...drawn], playerArchetype);
      });
      addLog(`♻️ Reciclagem 2:1: ${drawn.length > 0 ? `"${drawn[0].name}"` : 'sem carta disponível'}.`);
      return remaining;
    });
  };

  const abandonActiveProgram = () => {
    if (!playerActiveProgram) return;
    soundFx.playClick();
    addLog(`ALVO DESCARTADO: Você desistiu de [${playerActiveProgram.name}].`);
    setPlayerActiveProgram(null);
  };

  // ── Tools Rack — Seção 11 ────────────────────────────────────────────────
  const moveCardToToolsRack = (cardId: string) => {
    if (activePlayerRole !== myRole) return;
    
    // Ferramentas ativas não vão para o rack, elas são descartadas no uso e resolvem efeito.
    // Mas a mecânica base é colocá-las no rack (passivas).
    const card = playerHand.find(c => c.id === cardId);
    if (!card) return;

    if (playerActiveTools.length >= 3) {
      alert('Tools Rack cheio! Máximo 3 ferramentas.');
      return;
    }

    if (playerHand.length < 2) {
      alert('Você precisa descartar 1 carta da mão para pagar pela instalação da ferramenta!');
      return;
    }

    setPendingToolInstall(card);
  };

  const cancelToolInstall = () => {
    setPendingToolInstall(null);
  };

  const confirmToolInstall = (discardCardId: string) => {
    if (!pendingToolInstall) return;

    soundFx.playClick();
    
    // Remove both the tool and the discarded card from hand
    setPlayerHand(prev => prev.filter(c => c.id !== pendingToolInstall.id && c.id !== discardCardId));
    
    // Add tool to rack
    setPlayerActiveTools(prev => [...prev, pendingToolInstall]);
    
    setPendingToolInstall(null);
  };

  // -- Safeguard Slot
  const moveCardToDefuseSlot = (cardId: string) => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    const card = playerHand.find(c => c.id === cardId);
    if (!card || card.type !== 'defuse') return;
    if (card.technicalReference !== 'Bypass Card' && !card.name.includes('Bypass')) {
      if (card.name.includes('CVE') || card.technicalReference.includes('CVE')) {
        setPlayerHand(prev => prev.filter(c => c.id !== cardId));
        setPlayerCveProtection(card);
        addLog('CVE Assignment Protection ativada no slot de protecao.');
        return;
      }
    }
    if (playerSafeguardSlot) { alert('Slot Safeguard ja ocupado por um Bypass!'); return; }
    soundFx.playClick();
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setPlayerSafeguardSlot(card);
    addLog('Bypass alocado no Slot Safeguard.');
  };

  const activateCveProtection = () => {
    const cveCard = playerHand.find(c => c.name.includes('CVE') || c.technicalReference.includes('CVE'));
    if (!cveCard) { alert('Nenhuma CVE Assignment Protection na mao!'); return; }
    setPlayerHand(prev => prev.filter(c => c.id !== cveCard.id));
    setPlayerCveProtection(cveCard);
    addLog('CVE Assignment Protection ativada.');
  };

  // -- Report V1.2: custa 2 AP, deve ser sempre a ultima acao do turno
  const actionReportar = (skipDice = false) => {
    if (!isMyTurn && !skipDice) { alert('Aguarde a sua vez!'); return; }
    if (!skipDice && actionsRemaining !== 2) {
      if (actionsRemaining === 3) {
        alert('Report so pode ser feito apos pelo menos 1 acao no turno (Recon ou Exploit).');
      } else {
        alert('Sem APs suficientes para Report (custa 2 AP, voce tem ' + actionsRemaining + ').');
      }
      return;
    }
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    const eligibleExploits = playerArchetype.id === 'bug-hunter'
      ? myExploits.filter(e => isBugHunterEligible(e.card))
      : myExploits;
    if (eligibleExploits.length === 0) { alert('Nenhuma vulnerabilidade elegivel na mesa para reportar!'); return; }
    if (!playerActiveProgram) { alert('Sem Active Program! Selecione um programa no mercado.'); return; }
    if (playerArchetype.id === 'old-guard' && reportsThisRound >= 1) { alert('Old Guard: apenas 1 Report por rodada!'); return; }
    const minRequired = getMinVulnsRequired(playerActiveProgram);
    if (eligibleExploits.length < minRequired) {
      alert('MINIMO DE ESCOPO: ' + playerActiveProgram.name + ' exige ' + minRequired + ' vulnerabilidade(s) valida(s).');
      addLog('Report bloqueado: necessario ' + minRequired + ' carta(s) valida(s).');
      return;
    }
    if (skipDice) {
      processSuccessfulReport(eligibleExploits, myExploits, true);
    } else {
      setDiceRollReason('report');
      setIsStealthMode(false);
      setIsDiceModalOpen(true);
      addLog('REPORT INICIADO: Rolando D8 (Noisy Report)...');
    }
  };

  // -- Core Report Payout V1.2
  const processSuccessfulReport = (
    eligibleExploits: DeployedExploit[],
    allMyExploits: DeployedExploit[],
    freeDice = false
  ) => {
    const program = playerActiveProgram;
    if (!program) return;
    let vulnTotal = eligibleExploits.reduce((sum, e) => sum + getVulnFlatValue(e.card), 0);
    const programBonus = program.flatBountyBonus;
    const toolTotalBonus = playerActiveTools.reduce((sum, t) => sum + getToolFlatBonus(t), 0);
    let earnedCash = vulnTotal + programBonus + toolTotalBonus;
    let bugHunterBonus = 0;
    if (playerArchetype.id === 'bug-hunter' && eligibleExploits.length > 1) {
      bugHunterBonus = (eligibleExploits.length - 1) * 500;
      earnedCash += bugHunterBonus;
      addLog('Bug Hunter: +$' + bugHunterBonus.toLocaleString('pt-BR') + ' (' + (eligibleExploits.length - 1) + ' carta(s) extra).');
    }
    let oldGuardBonus = 0;
    if (playerArchetype.id === 'old-guard') {
      const epicLegCount = eligibleExploits.filter(e => e.card.rarity === 'Epic' || e.card.rarity === 'Legendary').length;
      oldGuardBonus = epicLegCount * 500;
      if (oldGuardBonus > 0) {
        earnedCash += oldGuardBonus;
        addLog('Old Guard: +$' + oldGuardBonus.toLocaleString('pt-BR') + ' (' + epicLegCount + ' carta(s) Epica/Lendaria).');
      }
    }
    let redTeamerReduction = 0;
    if (playerArchetype.id === 'red-teamer') {
      const afterDiscount = roundTo500(earnedCash * 0.7);
      redTeamerReduction = earnedCash - afterDiscount;
      earnedCash = afterDiscount;
      addLog('Red Teamer: -30% + arredondamento (-$' + redTeamerReduction.toLocaleString('pt-BR') + ').');
    }
    if (earnedCash >= 10000) confetti({ particleCount: 80, spread: 60 });
    setReportsThisRound(r => r + 1);
    setActionsRemaining(0);
    if (playerArchetype.id === 'n00b') {
      setToolDeck(deck => {
        const top3 = deck.slice(0, 3);
        const toolsInTop3 = top3.filter(c => c.type === 'tool');
        if (toolsInTop3.length > 0) {
          const chosenTool = toolsInTop3[0];
          const newDeck = deck.filter(c => c.id !== chosenTool.id);
          if (playerActiveTools.length < 3) {
            setPlayerActiveTools(prev => [...prev, { ...chosenTool, charges: chosenTool.maxCharges || 2 }]);
            addLog('n00b Garimpeiro: "' + chosenTool.name + '" do Tool Deck instalada!');
          } else {
            setPlayerActiveTools(prev => { const [, ...rest] = prev; addLog('n00b Garimpeiro: Rack cheio.'); return [...rest, { ...chosenTool, charges: chosenTool.maxCharges || 2 }]; });
          }
          return newDeck;
        } else {
          addLog('n00b Garimpeiro: Nenhuma Tool no top 3 do Tool Deck. Rebaralha.');
          return shuffleArray([...top3, ...deck.slice(3)]);
        }
      });
    }
    const newScore = playerScore + earnedCash;
    setPlayerScore(newScore);
    let mathStr = 'Vulns: $' + vulnTotal;
    if (programBonus > 0) mathStr += ' + Program: $' + programBonus;
    if (toolTotalBonus > 0) mathStr += ' + Tools: $' + toolTotalBonus;
    if (bugHunterBonus > 0) mathStr += ' + Bug Hunter: $' + bugHunterBonus;
    if (oldGuardBonus > 0) mathStr += ' + Old Guard: $' + oldGuardBonus;
    if (redTeamerReduction > 0) mathStr += ' - Red Teamer: $' + redTeamerReduction;
    setBountyLedger(prev => [...prev, { id: 'rep-' + Date.now(), turn: currentTurn, type: 'Report', description: 'Report em ' + program.name, amount: earnedCash, mathBreakdown: mathStr }]);
    setDeployedExploits(prev => prev.filter(e => e.playerId !== myRole));
    if (program) {
      setProgramMarket(prevMarket => prevMarket.map(slot => {
        if (slot.id === program.id && programDeck.length > 0) {
          const nextProg = programDeck[0]; setProgramDeck(prev => prev.slice(1));
          addLog('Mercado reposto: [' + nextProg.name + '] entrou.');
          return nextProg;
        }
        return slot;
      }));
    }
    setPlayerActiveProgram(null);
    if (newScore >= 40000) { setGameWinner(myRole); soundFx.playVictory(); addLog('VITORIA INSTANTANEA! $' + newScore.toLocaleString('pt-BR') + ' atingidos!'); return; }
    soundFx.playBountyPayout();
    addLog('REPORT APROVADO! +$' + earnedCash.toLocaleString('pt-BR') + ' | Saldo: $' + newScore.toLocaleString('pt-BR'));
    addLog('CUSTO DO SUCESSO: Sacando Event Card obrigatoria...');
    drawEventCard();
    finalizeTurnAdvance();
  };

  const triggerManualDiceRoll = () => {
    setDiceRollReason('manualTest');
    setIsDiceModalOpen(true);
    addLog('🎲 Teste manual de Dado D8...');
  };

  // ── Payout value helpers ──────────────────────────────────────────────────
  const getVulnFlatValue = (card: CardV2) => {
    switch (card.rarity) {
      case 'Common':    return 1500;
      case 'Uncommon':  return 2500;
      case 'Rare':      return 4000;
      case 'Epic':      return 5000;
      case 'Legendary': return 6000;
      default:          return 1500;
    }
  };

  const getToolFlatBonus = (tool: CardV2) => {
    const ch = tool.charges ?? 2;
    if (tool.rarity === 'Epic')   return 2000;
    if (tool.rarity === 'Rare')   return 1500;
    return ch >= 2 ? 1000 : 500;
  };

  // ── Dice Roll Result Handler ───────────────────────────────────────────────
  const handleDiceRollResult = (result: { diceValue: number; diceValue2?: number; passed: boolean }) => {
    setIsDiceModalOpen(false);

    if (diceRollReason === 'report') {
      const myExploits = deployedExploits.filter(e => e.playerId === myRole);
      const eligibleExploits = playerArchetype.id === 'bug-hunter'
        ? myExploits.filter(e => isBugHunterEligible(e.card))
        : myExploits;

      // Evaluate patch using canonical rules (Seções 07-08, 15)
      const patchFired = playerActiveProgram ? didPatchFire(
        result.diceValue,
        result.diceValue2,
        playerActiveProgram.patchSpeed,
        playerArchetype.id,
        false, // report is always Noisy (not Stealth)
        currentTurn
      ) : !result.passed;

      if (!patchFired) {
        processSuccessfulReport(eligibleExploits, myExploits, false);
      } else {
        setPatchAlertModal(true);
        setAlertServerName(playerActiveProgram?.name || null);
        soundFx.playPatchDeployedAlarm();
        addLog(`🚨 PATCH DEPLOYED! D8 tirou ${result.diceValue}${result.diceValue2 !== undefined ? `/${result.diceValue2}` : ''} — Report falhou!`);
      }

    } else if (diceRollReason === 'endTurn') {
      // Patch Speed Check no fim do turno — Seção 07
      const patchFired = playerActiveProgram ? didPatchFire(
        result.diceValue,
        result.diceValue2,
        playerActiveProgram.patchSpeed,
        playerArchetype.id,
        isStealthMode,
        currentTurn
      ) : !result.passed;

      if (!patchFired) {
        addLog(`✓ D8: ${result.diceValue}. Sistema permaneceu vulnerável.`);
        finalizeTurnAdvance();
      } else {
        setPatchAlertModal(true);
        setAlertServerName(playerActiveProgram?.name || null);
        soundFx.playPatchDeployedAlarm();
        addLog(`🚨 PATCH DEPLOYED! D8 tirou ${result.diceValue}${result.diceValue2 !== undefined ? `/${result.diceValue2}` : ''}.`);
      }
    } else {
      addLog(`🎲 Teste concluído. D8: ${result.diceValue}.`);
    }
  };

  const selectNewProgram = (chosenProgram: ProgramCard) => {
    setPlayerActiveProgram(chosenProgram);
    soundFx.playClick();
    addLog(`🎯 Programa selecionado: [${chosenProgram.name}].`);
  };

  // ── End Turn — Seção 07 ─────────────────────────────────────────────────
  const endTurn = () => {
    if (!isMyTurn) { alert('Aguarde a sua vez!'); return; }
    const myExploits = deployedExploits.filter(e => e.playerId === myRole);
    if (myExploits.length > 0) {
      // Stealth Mode: turno encerra silenciosamente → vantagem no dado (Seção 07)
      setIsStealthMode(true);
      setDiceRollReason('endTurn');
      setIsDiceModalOpen(true);
      addLog(`🎲 Passando turno com vulns na mesa... Patch Speed Check (D8)!`);
    } else {
      finalizeTurnAdvance();
    }
  };

  // ── Safeguard: Defuse or Accept Patch ─────────────────────────────────────
  const defusePatch = () => {
    // Bypass anula 100% — Seção 02/07
    setPatchAlertModal(false);
    setPlayerSafeguardSlot(null); // Bypass é descartado ao ser usado
    addLog('🛡️ BYPASS ATIVADO: Todas as penalidades do Patch Deployed! anuladas. Bypass descartado.');
    finalizeTurnAdvance();
  };

  const acceptPatch = () => {
    // V1.2: SEM penalidade financeira — perde apenas os exploits e o programa
    setPatchAlertModal(false);
    setDeployedExploits(prev => prev.filter(e => e.playerId !== myRole));
    setPlayerActiveProgram(null);
    addLog('PATCH DEPLOYED! Exploits perdidos. Programa encerrado. Saldo INTACTO (V1.2).');
    finalizeTurnAdvance();
  };


  // ── Turn Advance + Round Logic ─────────────────────────────────────────────
  const finalizeTurnAdvance = () => {
    const nextRole: 'player-1' | 'player-2' = activePlayerRole === 'player-1' ? 'player-2' : 'player-1';
    const nextRound = nextRole === 'player-1' ? Math.min(8, currentTurn + 1) : currentTurn;

    // Reset round-scoped state when round increments
    if (nextRound > currentTurn) {
      setReportsThisRound(0);
      setSocialEngineerUsedThisRound(false);

      // R8: fim do jogo
      if (nextRound > 8) {
        addLog(`🏁 JOGO ENCERRADO após a Ronda 8! Vencedor: jogador com maior saldo.`);
        setGameWinner(myRole);
        return;
      }
    }

    // Reset APs para o próximo turno
    setActionsRemaining(3);

    setActivePlayerRole(nextRole);
    if (nextRole === 'player-1') setCurrentTurn(nextRound);

    mpSync.sendAction('END_TURN', { activePlayerRole: nextRole, currentTurn: nextRound });
    addLog(`⏩ Vez de: ${nextRole === 'player-1' ? 'Jogador 1' : 'Jogador 2'} (Ronda ${nextRound}/8)`);

    // Solo bot logic
    if (gameMode === 'solo' && nextRole === 'player-2') {
      setTimeout(() => {
        setBots(prevBots => prevBots.map(bot => ({ ...bot, score: bot.score + Math.floor(Math.random() * 25) + 10 })));
        addLog(`🤖 IA: Ninja_Cyber jogou.`);
        setTimeout(() => {
          setActivePlayerRole('player-1');
          setCurrentTurn(prev => Math.min(8, prev + 1));
          mpSync.sendAction('END_TURN', { activePlayerRole: 'player-1', currentTurn: currentTurn + 1 });
          addLog(`🟢 Sua vez! Ronda ${Math.min(8, currentTurn + 1)}/8.`);
        }, 1000);
      }, 1500);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetBoardGame = () => {
    setPlayerNodeId('node-bank-login');
    setPlayerHand([]);
    setPlayerActiveTools([]);
    setPlayerActiveProgram(null);
    setPlayerSafeguardSlot(null);
    setPlayerCveProtection(null);
    setPlayerScore(0);
    setServers(SERVERS_DATA);
    setDeployedExploits([]);
    setCurrentTurn(1);
    setActivePlayerRole('player-1');
    setPatchAlertModal(false);
    setIsDiceModalOpen(false);
    setActionsRemaining(3);
    setReportsThisRound(0);
    setSocialEngineerUsedThisRound(false);
    setToolDeck([]);
    setMainDeck([]);
    setEventDeck([]);
    setLogs(['Board Game reiniciado!']);
    const randArchetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const shuffledPrograms = shuffleArray([...PROGRAM_CARDS]);
    const randProgram = shuffledPrograms[0];
    setTimeout(() => completeSetup(randArchetype, randProgram), 100);
  };


  // ─────────────────────────────────────────────────────────────────────────
  return (
    <BoardGameContext.Provider
      value={{
        playerNodeId,
        playerHand,
        playerActiveTools,
        playerActiveProgram,
        playerArchetype,
        playerSafeguardSlot,
        playerCveProtection,
        mainDeckCount: mainDeck.length,
        toolDeckCount: toolDeck.length,
        eventDeckCount: eventDeck.length,
        programDeckCount: programDeck.length,
        programMarket,
        playerScore,
        bountyTotalCash,
        gameWinner,
        servers,
        deployedExploits,
        bots,
        currentTurn,
        bountyLedger,
        needsDiscard,
        pendingToolInstall,
        actionsRemaining,

        activePlayerRole,
        myRole,
        isMyTurn,
        gameMode,

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
        resetBoardGame
      }}
    >
      {children}
    </BoardGameContext.Provider>
  );
};


export const useBoardGame = () => {
  const context = useContext(BoardGameContext);
  if (!context) throw new Error('useBoardGame deve ser usado dentro de um BoardGameProvider');
  return context;
};
