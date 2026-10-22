import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, ProgramCard, Archetype, ARCHETYPES, PROGRAM_CARDS, MASTER_DECK } from '../data/cardsData';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { getZoneByBalance } from '../utils/gameRules';

export interface TerminalLog {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'danger' | 'warning';
}

export interface BotPlayer {
  id: string;
  name: string;
  archetype: Archetype;
  handCount: number;
  activeVulns: Card[];
  bountyTotal: number;
  currentProgram: ProgramCard;
}

interface GameContextType {
  archetype: Archetype | null;
  currentProgram: ProgramCard;
  playerHand: Card[];
  playerActiveVulns: Card[];
  playerActiveTools: Card[];
  playerBountyTotal: number;
  legalThreatTurns: number;
  bots: BotPlayer[];
  deck: Card[];
  discardPile: Card[];
  turnNumber: number;
  activeTurnPlayerId: 'player' | string;
  terminalLogs: TerminalLog[];
  patchModalOpen: boolean;
  drawnPatchCard: Card | null;
  gameWinner: string | null;

  // Actions
  chooseArchetype: (archetypeId: string) => void;
  chooseProgram: (programId: string) => void;
  actionRecon: () => void;
  actionExploit: (cardId: string) => void;
  actionReport: () => void;
  playToolCard: (cardId: string) => void;
  defuseWith0Day: () => void;
  acceptPatchDamage: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Embaralhar array (Fisher-Yates)
function shuffleDeck<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [currentProgram, setCurrentProgram] = useState<ProgramCard>(PROGRAM_CARDS[0]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerActiveVulns, setPlayerActiveVulns] = useState<Card[]>([]);
  const [playerActiveTools, setPlayerActiveTools] = useState<Card[]>([]);
  const [playerBountyTotal, setPlayerBountyTotal] = useState<number>(0);
  const [legalThreatTurns, setLegalThreatTurns] = useState<number>(0);

  const [bots, setBots] = useState<BotPlayer[]>([
    {
      id: 'bot-1',
      name: 'ZeroDay_Ninja',
      archetype: ARCHETYPES[2], // Bug Hunter
      handCount: 5,
      activeVulns: [],
      bountyTotal: 0,
      currentProgram: PROGRAM_CARDS[1]
    },
    {
      id: 'bot-2',
      name: 'Cyber_Ghost',
      archetype: ARCHETYPES[4], // Red Teamer
      handCount: 5,
      activeVulns: [],
      bountyTotal: 0,
      currentProgram: PROGRAM_CARDS[4]
    }
  ]);

  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [activeTurnPlayerId, setActiveTurnPlayerId] = useState<'player' | string>('player');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [patchModalOpen, setPatchModalOpen] = useState<boolean>(false);
  const [drawnPatchCard, setDrawnPatchCard] = useState<Card | null>(null);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'danger' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setTerminalLogs(prev => [{ id: Math.random().toString(), time, text, type }, ...prev.slice(0, 49)]);
  };

  // Inicializar o jogo
  const initGame = (selectedArchetype: Archetype) => {
    const shuffled = shuffleDeck(MASTER_DECK);

    // Distribuir 5 cartas iniciais para o jogador
    const hand = shuffled.slice(0, 5);
    const remainingDeck = shuffled.slice(5);

    setArchetype(selectedArchetype);
    setPlayerHand(hand);
    setDeck(remainingDeck);
    setDiscardPile([]);
    setPlayerActiveVulns([]);
    setPlayerActiveTools([]);
    setPlayerBountyTotal(0);
    setLegalThreatTurns(0);
    setTurnNumber(1);
    setActiveTurnPlayerId('player');
    setPatchModalOpen(false);
    setDrawnPatchCard(null);
    setGameWinner(null);

    addLog(`Partida iniciada como ${selectedArchetype.name} (${selectedArchetype.title}).`, 'info');
    addLog(`Alvo ativo selecionado: ${PROGRAM_CARDS[0].name} (${PROGRAM_CARDS[0].companyType}).`, 'info');
  };

  const chooseArchetype = (archetypeId: string) => {
    const found = ARCHETYPES.find(a => a.id === archetypeId) || ARCHETYPES[0];
    initGame(found);
  };

  const chooseProgram = (programId: string) => {
    const found = PROGRAM_CARDS.find(p => p.id === programId);
    if (found) {
      setCurrentProgram(found);
      addLog(`Programa alvo alterado para: ${found.name}.`, 'warning');
    }
  };

  // AÇÃO 1: RECON (Comprar cartas)
  const actionRecon = () => {
    if (activeTurnPlayerId !== 'player') return;
    soundFx.playScan();

    // Checar bônus de ferramentas (ex: Nmap + ffuf)
    const hasNmap = playerActiveTools.some(t => t.id === 'tool-nmap-ffuf');
    const drawCount = hasNmap ? 3 : 2;

    if (deck.length < drawCount) {
      addLog('O deck central esgotou! Reembaralhando o descarte...', 'warning');
      const reshuffled = shuffleDeck([...discardPile]);
      setDeck(reshuffled);
      setDiscardPile([]);
    }

    const drawnCards = deck.slice(0, drawCount);
    const newDeck = deck.slice(drawCount);

    // Verificar se puxou PATCH DEPLOYED!
    const patchCard = drawnCards.find(c => c.name === 'PATCH DEPLOYED!');

    if (patchCard) {
      setDrawnPatchCard(patchCard);
      setPatchModalOpen(true);
      soundFx.playPatchDeployedAlarm();
      addLog('CRÍTICO! Carta PATCH DEPLOYED! foi puxada durante a ação Recon!', 'danger');
      setDeck(newDeck);
      return;
    }

    // Caso contrário, adiciona as cartas à mão do jogador
    const maxHand = archetype ? archetype.maxHandSize : 6;
    const finalHand = [...playerHand, ...drawnCards].slice(0, maxHand);
    setPlayerHand(finalHand);
    setDeck(newDeck);

    addLog(`Recon realizado! +${drawnCards.length} cartas adicionadas à mão.`, 'info');
    advanceTurn();
  };

  // Jogar Tool Card da mão para a mesa
  const playToolCard = (cardId: string) => {
    const card = playerHand.find(c => c.id === cardId);
    if (!card || card.type !== 'tool') return;

    soundFx.playClick();
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setPlayerActiveTools(prev => [...prev, card]);
    addLog(`Ferramenta ativada no rack: ${card.name}. ${card.effectDescription}`, 'info');
  };

  // AÇÃO 2: EXPLOIT (Alocar vulnerabilidade no programa ativo)
  const actionExploit = (cardId: string) => {
    if (activeTurnPlayerId !== 'player') return;

    const card = playerHand.find(c => c.id === cardId);
    if (!card || card.type !== 'vulnerability') return;

    // Checar Restrição de Escopo (Red Teamer ignora)
    const isRedTeamer = archetype?.id === 'red-teamer';
    if (!isRedTeamer && currentProgram.allowedClasses !== 'ALL') {
      const allowed = currentProgram.allowedClasses as string[];
      if (card.vulnClass && !allowed.includes(card.vulnClass)) {
        addLog(`BLOQUEADO: A vulnerabilidade ${card.vulnClass} não está no escopo de ${currentProgram.name}!`, 'danger');
        return;
      }
    }

    // Checar Requisitos de Ferramentas
    const reqs = card.toolRequirements || [];
    const hasBurpPro = playerActiveTools.some(t => t.id === 'tool-burp-pro');

    if (reqs.length > 0 && !hasBurpPro) {
      // Checar se o jogador tem as ferramentas ativas ou na mão
      const activeToolNames = playerActiveTools.map(t => t.name);
      const missingTools = reqs.filter(req => !activeToolNames.includes(req));

      if (missingTools.length > 0) {
        addLog(`Ferramenta ausente para ${card.name}: Requer [${missingTools.join(', ')}]. Ative a ferramenta ou use Burp Suite Pro.`, 'warning');
        return;
      }
    }

    soundFx.playClick();
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setPlayerActiveVulns(prev => [...prev, card]);

    addLog(`EXPLOIT com sucesso! Carta [${card.name}] (CVSS ${card.cvss}) alocada no programa ${currentProgram.name}.`, 'success');
    advanceTurn();
  };

  // AÇÃO 3: REPORT (Submeter relatório acumulado e faturar $)
  const actionReport = () => {
    if (activeTurnPlayerId !== 'player') return;

    if (legalThreatTurns > 0) {
      addLog(`Ação REPORT bloqueada por Ameaça Jurídica (Restam ${legalThreatTurns} turnos).`, 'danger');
      return;
    }

    if (playerActiveVulns.length === 0) {
      addLog('Nenhuma vulnerabilidade alocada no programa para reportar!', 'warning');
      return;
    }

    const getVulnFlatValue = (rarity: string) => {
      switch (rarity) {
        case 'Common': return 1500;
        case 'Uncommon': return 2500;
        case 'Rare': return 4000;
        case 'Epic': return 5000;
        case 'Legendary': return 6000;
        default: return 1500;
      }
    };

    const vulnTotal = playerActiveVulns.reduce((sum, v) => sum + getVulnFlatValue(v.rarity), 0);

    const getProgramFlatBonus = (progName: string = '') => {
      const name = progName.toLowerCase();
      if (name.includes('cloudnine') || name.includes('cryptox') || name.includes('aicore')) return 4000;
      if (name.includes('banksafe') || name.includes('healthlock') || name.includes('paygateway')) return 2500;
      if (name.includes('shopall') || name.includes('socialbee') || name.includes('socialhive') || name.includes('gameverse') || name.includes('deliverydash')) return 1000;
      return 0;
    };

    const programBonus = getProgramFlatBonus(currentProgram.name);
    const toolTotalBonus = playerActiveTools.length * 500; // Aproximação simplificada para V1

    let totalBounty = vulnTotal + programBonus + toolTotalBonus;

    if (archetype?.id === 'red-teamer') {
      totalBounty = Math.round(totalBounty * 0.8);
    }

    soundFx.playBountyPayout();

    if (totalBounty >= 2500) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setPlayerBountyTotal(prev => prev + totalBounty);

    // Mover cartas do programa para o descarte
    setDiscardPile(prev => [...prev, ...playerActiveVulns]);
    setPlayerActiveVulns([]);

    addLog(`REPORT ACEITO! Submetidas ${playerActiveVulns.length} vulnerabilidades em ${currentProgram.name}. Recompensa depositada: +$${totalBounty.toLocaleString('pt-BR')}!`, 'success');

    if (playerBountyTotal + totalBounty >= 40000) {
      setGameWinner('Você (Pesquisador)');
      addLog('VITÓRIA! Você atingiu $40.000 em bounties acumulados e conquistou o topo do Hall of Fame!', 'success');
    } else {
      advanceTurn();
    }
  };

  // Usar 0-Day Reserve no PATCH DEPLOYED!
  const defuseWith0Day = () => {
    const reserveCard = playerHand.find(c => c.name === '0-Day Reserve') || playerActiveTools.find(t => t.name === '0-Day Reserve');

    if (reserveCard) {
      soundFx.playClick();
      setPlayerHand(prev => prev.filter(c => c.id !== reserveCard.id));
      setPlayerActiveTools(prev => prev.filter(t => t.id !== reserveCard.id));

      // Reembaralhar Patch de volta ao deck
      if (drawnPatchCard) {
        setDeck(prev => shuffleDeck([...prev, drawnPatchCard]));
      }

      setPatchModalOpen(false);
      setDrawnPatchCard(null);
      addLog('Safeguard ATIVADA! 0-Day Reserve anulou o PATCH DEPLOYED! O programa está salvo.', 'success');
      advanceTurn();
    }
  };

  // Aceitar destruição do PATCH DEPLOYED!
  const acceptPatchDamage = () => {
    setDiscardPile(prev => [...prev, ...playerActiveVulns]);
    setPlayerActiveVulns([]);
    setPatchModalOpen(false);
    setDrawnPatchCard(null);

    const zone = getZoneByBalance(playerBountyTotal);
    const penalty = zone.patchPenalty;

    setPlayerBountyTotal(prev => Math.max(0, prev - penalty));

    addLog(`COLAPSO! PATCH DEPLOYED! destruiu suas vulnerabilidades não reportadas e deduziu ${penalty} (Zona ${zone.name}) do seu saldo.`, 'danger');
    advanceTurn();
  };

  // Avançar Turno (IA dos Bots)
  const advanceTurn = () => {
    setTurnNumber(prev => prev + 1);

    if (legalThreatTurns > 0) {
      setLegalThreatTurns(prev => prev - 1);
    }

    // Executar turno rápido dos Bots (Simulação de IA)
    setTimeout(() => {
      simulateBotTurns();
    }, 800);
  };

  // Simulação de IA dos Bots
  const simulateBotTurns = () => {
    setBots(prevBots => {
      return prevBots.map(bot => {
        const rand = Math.random();
        let newBounty = bot.bountyTotal;
        let newVulns = [...bot.activeVulns];

        if (rand > 0.6) {
          // Bot faz Report
          const totalRarityValue = bot.activeVulns.reduce((sum, v) => sum + ((v.cvss || 5.0) * 200), 0);
          const reportValue = Math.round(totalRarityValue + bot.currentProgram.flatBountyBonus);
          newBounty += reportValue;
          newVulns = [];
          addLog(`[OPONENTE] ${bot.name} submeteu relatório em ${bot.currentProgram.name} e faturou +$${reportValue}!`, 'warning');
        } else {
          // Bot faz Exploit
          const mockCard: Card = {
            id: `bot-vuln-${Math.random()}`,
            name: 'Exploit Automático',
            type: 'vulnerability',
            cvss: 7.5,
            rarity: 'Common',
            effectDescription: 'Exploit do bot'
          };
          newVulns.push(mockCard);
          addLog(`[OPONENTE] ${bot.name} alocou um Exploit no programa ${bot.currentProgram.name}.`, 'info');
        }

        return {
          ...bot,
          bountyTotal: newBounty,
          activeVulns: newVulns
        };
      });
    });

    setActiveTurnPlayerId('player');
  };

  const resetGame = () => {
    if (archetype) {
      initGame(archetype);
    }
  };

  return (
    <GameContext.Provider
      value={{
        archetype,
        currentProgram,
        playerHand,
        playerActiveVulns,
        playerActiveTools,
        playerBountyTotal,
        legalThreatTurns,
        bots,
        deck,
        discardPile,
        turnNumber,
        activeTurnPlayerId,
        terminalLogs,
        patchModalOpen,
        drawnPatchCard,
        gameWinner,

        chooseArchetype,
        chooseProgram,
        actionRecon,
        actionExploit,
        actionReport,
        playToolCard,
        defuseWith0Day,
        acceptPatchDamage,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser usado dentro de um GameProvider');
  }
  return context;
};
