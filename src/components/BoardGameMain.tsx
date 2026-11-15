import React, { useState, useEffect } from 'react';
import { BoardGameProvider, useBoardGame, PlayerRoleId, formatPlayerName } from '../context/BoardGameContext';
import { CenterMarketMat } from './CenterMarketMat';
import { PlayerMat, PlayerMatData } from './PlayerMat';
import { FullTableView } from './FullTableView';
import { ActionPointsBar } from './ActionPointsBar';
import { DiceRoller } from './DiceRoller';
import { MultiplayerLobbyModal } from './MultiplayerLobbyModal';
import { EventCardModal } from './EventCardModal';
import { PrintAndPlayModal } from './PrintAndPlayModal';
import { PlayerAidModal } from './PlayerAidModal';
import { ProgramSelectorModal } from './ProgramSelectorModal';
import { ObserverMetricsModal, DeckPeekModal, computeMatchHighlights } from './ObserverMetricsModal';
import { ARCHETYPES, PROGRAM_CARDS, ProgramCard } from '../data/cardsData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedPlayerName, getLocalizedArchetype, getLocalizedProgram } from '../i18n/cardTranslations';
import { Layers, RefreshCw, Eye, Users, ShieldAlert, Globe, Printer, BookOpen, Trophy, Home, HelpCircle, ArrowLeft, Activity, LogOut } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { supabaseSync } from '../utils/supabaseSync';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '20px', color: 'red', background: 'black', border: '1px solid red' }}>Erro ao renderizar componente. Feche e abra novamente.</div>;
    }
    return this.props.children;
  }
}

const BoardGameContent: React.FC = () => {
  const {
    currentPlayer,
    allPlayers,
    playerCount,
    setPlayerCount,
    activePlayerRole,
    bountyTotalCash,
    gameWinner,
    playerHand,
    playerActiveTools,
    playerActiveProgram,
    playerArchetype,
    playerSafeguardSlot,
    playerCveProtection,
    deployedExploits,
    currentTurn,
    myRole,
    isMyTurn,
    gameMode,
    activeEventCard,
    patchAlertModal,
    alertServerName,
    isDiceModalOpen,
    diceRollReason,
    isStealthMode,
    alertaTokens,
    reputacaoTokens,
    useReputacaoReroll,
    setMyRole,
    setGameMode,
    closeEventModal,
    handleDiceRollResult,
    selectNewProgram,
    defusePatch,
    acceptPatch,
    resetBoardGame,
    leaveLanRoom,
    startLanMatch,
    setPlayerNickname,
    actionInfiltrar,
    awaitingProgramPick,
    programPickReason,
    duelRotationsRemaining,
    programMarket,
    programDeckCount,
    drawSurpriseProgramFromDeck,
    rotateMarketProgram,
    activateInstalledTool,
    playerActiveEventsList,
    lastEventResolutionSummary,
    pendingTargetedEvent,
    resolveTargetedEvent,
    auditLogs,
    playerMetrics,
    roomCode,
    setRoomCode,
    incomingAlertNotification,
    dismissIncomingAlert,
    submitMatchFeedback
  } = useBoardGame();

  const [viewMode, setViewMode] = useState<'myMat' | 'centerTable' | 'fullTable'>('myMat');
  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState<boolean>(false);
  const [playerAidModalOpen, setPlayerAidModalOpen] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [observerModalOpen, setObserverModalOpen] = useState<boolean>(false);
  const [voluntaryProgramModalOpen, setVoluntaryProgramModalOpen] = useState<boolean>(false);

  // Estados da enquete rápida de fim de partida (Playtest Feedback)
  const [fbPacing, setFbPacing] = useState<string>('No tempo certo');
  const [fbChaos, setFbChaos] = useState<string>('Equilibrado');
  const [fbClarity, setFbClarity] = useState<string>('Tudo claro');
  const [fbComment, setFbComment] = useState<string>('');
  const [fbStatus, setFbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!gameWinner) {
      setFbPacing('No tempo certo');
      setFbChaos('Equilibrado');
      setFbClarity('Tudo claro');
      setFbComment('');
      setFbStatus('idle');
    }
  }, [gameWinner]);

  // Escutar evento de desistência/troca de programa ativo
  const { abandonActiveProgram } = useBoardGame();
  React.useEffect(() => {
    const handleAbandon = () => abandonActiveProgram();
    window.addEventListener('pwnd_abandon_program', handleAbandon);
    return () => window.removeEventListener('pwnd_abandon_program', handleAbandon);
  }, [abandonActiveProgram]);

  const { language, setLanguage, t } = useLanguage();

  // Program Card Fallback se estiver aguardando escolha no Program Market do Tabuleiro Central
  const currentDisplayProgram: ProgramCard = (playerActiveProgram as ProgramCard) || {
    id: 'pending',
    name: '[ PENDENTE: CLIQUE NO PROGRAM MARKET! ]',
    companyType: 'Selecione no Tabuleiro Central',
    bountyRange: '$0',
    baseBountyMultiplier: 1,
    allowedClasses: 'ALL',
    patchSpeed: 'Moderada',
    description: 'Clique diretamente em uma das 3 cartas do Program Market no Tabuleiro Central acima para alocá-la ao seu tapete!'
  };

  // Exploits armados pelo jogador local
  const myExploitsCards = deployedExploits
    .filter(e => e.playerId === myRole)
    .map(e => e.card);

  // Dados do Jogador Humano no Dispositivo Local
  const humanPlayerData: PlayerMatData = {
    playerId: myRole,
    playerName: `${getLocalizedPlayerName(currentPlayer?.name || myRole, language)} (${language === 'en' ? 'You' : 'Você'})`,
    playerColor: currentPlayer?.color || 'var(--player-1-green)',
    archetype: playerArchetype,
    currentProgram: currentDisplayProgram,
    bountyTotal: bountyTotalCash,
    hand: playerHand,
    activeTools: playerActiveTools,
    activeExploits: myExploitsCards,
    activeEvents: playerActiveEventsList,
    hasDefuse: playerSafeguardSlot !== null,
    hasCve: playerCveProtection !== null,
    isCurrentTurnPlayer: isMyTurn,
    alertaTokens,
    reputacaoTokens
  };

  const handleStartGameMode = (mode: 'solo' | 'hotseat' | 'lan', code?: string, role?: PlayerRoleId, nickname?: string) => {
    setGameMode(mode);
    if (code) setRoomCode(code);
    if (role) {
      setMyRole(role);
      if (nickname !== undefined) {
        setPlayerNickname(role, nickname);
      }
    }
    if (mode === 'lan' && code) {
      if (role === 'player-1') {
        startLanMatch(code, playerCount, nickname);
      } else if (role) {
        const formattedName = formatPlayerName(role, nickname);
        setTimeout(() => {
          supabaseSync.broadcast('REQUEST_STATE', { from: role, playerName: formattedName });
        }, 300);
        setTimeout(() => {
          supabaseSync.broadcast('UPDATE_PLAYER_NAME', { role, name: formattedName });
        }, 650);
      }
    }
  };

  const handleLeaveRoom = () => {
    leaveLanRoom();
    setRoomCode(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam) {
      const code = roomParam.toUpperCase().trim();
      setRoomCode(code);
      let savedSeatForRoom: PlayerRoleId | null = null;
      try {
        savedSeatForRoom = sessionStorage.getItem(`pwnd_seat_${code}`) as PlayerRoleId | null;
      } catch {}

      if (!savedSeatForRoom) {
        // Link de convite recebido por convidado ainda sem assento: abre modal direto na escolha de assento
        setMultiplayerModalOpen(true);
      }
    }
  }, []);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Cálculo de Payout em Risco para o modal de Patch
  const myExploitsInRisk = deployedExploits.filter(e => e.playerId === myRole);
  const vulnValueInRisk = myExploitsInRisk.reduce((sum, e) => sum + (e.card.points > 0 ? e.card.points : 1500), 0);
  const progBonusInRisk = playerActiveProgram?.flatBountyBonus || 0;
  const totalBountyInRisk = vulnValueInRisk + progBonusInRisk;

  return (
    <div style={{ width: '96%', maxWidth: '1540px', margin: '0 auto', padding: '16px 12px' }}>
      {/* TOAST / BANNER DE NOTIFICAÇÃO DE EVENTO RECEBIDO EM TEMPO REAL */}
      {incomingAlertNotification && (
        <div
          style={{
            position: 'fixed',
            top: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            minWidth: '340px',
            maxWidth: '560px',
            background: incomingAlertNotification.type === 'positive' ? '#F0FDF4' : '#FEF2F2',
            border: `2px solid ${incomingAlertNotification.type === 'positive' ? '#16A34A' : '#DC2626'}`,
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            fontFamily: 'monospace'
          }}
        >
          <div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: incomingAlertNotification.type === 'positive' ? '#166534' : '#991B1B' }}>
              {incomingAlertNotification.title}
            </div>
            <div style={{ fontSize: '11px', color: '#1F2937', marginTop: '3px', lineHeight: '1.4' }}>
              {incomingAlertNotification.message}
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              dismissIncomingAlert();
            }}
            style={{
              padding: '6px 12px',
              background: incomingAlertNotification.type === 'positive' ? '#16A34A' : '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '900',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      )}

      {/* COMPACT TABLETOP TOP BAR / MENU */}
      <header
        style={{
          background: '#FAF6EE',
          border: '2px solid #2B2620',
          borderRadius: '10px',
          marginBottom: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        {/* ROW 1: BRAND LOGO + VIEW TABS + UTILITIES (ONLINE / LANG / RESET) */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* BRAND LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
            <div
              style={{
                background: '#2B2620',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF6EE'
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
                  PWNED!
                </span>
                <span style={{ fontSize: '9px', fontWeight: '800', background: '#B45309', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                  {t('app.version')}
                </span>
                {roomCode && (
                  <span style={{ fontSize: '9px', fontWeight: '800', background: '#059669', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                    {t('app.room')}: {roomCode}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '9.5px', color: '#7E7362', fontFamily: 'monospace' }}>
                {t('app.subtitle')}
              </div>
            </div>
          </div>

          {/* NAVEGAÇÃO DE VISÕES (SEGMENTED TABS NO CENTRO) */}
          <div
            style={{
              display: 'flex',
              background: '#EDE4D4',
              padding: '3px',
              borderRadius: '8px',
              border: '1.5px solid #2B2620',
              gap: '3px'
            }}
          >
            <button
              onClick={() => { soundFx.playClick(); setViewMode('myMat'); }}
              style={{
                padding: '6px 14px',
                background: viewMode === 'myMat' ? '#2B2620' : 'transparent',
                color: viewMode === 'myMat' ? '#FAF6EE' : '#2B2620',
                border: 'none',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Eye size={13} /> {t('nav.myMat')}
            </button>

            <button
              onClick={() => { soundFx.playClick(); setViewMode('centerTable'); }}
              style={{
                padding: '6px 14px',
                background: viewMode === 'centerTable' ? '#2B2620' : 'transparent',
                color: viewMode === 'centerTable' ? '#FAF6EE' : '#2B2620',
                border: 'none',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Layers size={13} /> {t('nav.centerBoard')}
            </button>

            <button
              onClick={() => { soundFx.playClick(); setViewMode('fullTable'); }}
              style={{
                padding: '6px 14px',
                background: viewMode === 'fullTable' ? '#2B2620' : 'transparent',
                color: viewMode === 'fullTable' ? '#FAF6EE' : '#2B2620',
                border: 'none',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Users size={13} /> {t('nav.fullTable')} ({playerCount}P)
            </button>
          </div>

          {/* UTILITIES DIREITA (IDIOMA, SALA ONLINE, RESET) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* SELETOR DE IDIOMA (PT / EN) */}
            <div
              style={{
                display: 'flex',
                background: '#EDE4D4',
                padding: '2px',
                borderRadius: '6px',
                border: '1.5px solid #2B2620',
                gap: '2px'
              }}
            >
              <button
                onClick={() => { soundFx.playClick(); setLanguage('pt'); }}
                title="Português do Brasil"
                style={{
                  padding: '4px 8px',
                  background: language === 'pt' ? '#2B2620' : 'transparent',
                  color: language === 'pt' ? '#FAF6EE' : '#2B2620',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                🇧🇷 PT
              </button>
              <button
                onClick={() => { soundFx.playClick(); setLanguage('en'); }}
                title="English"
                style={{
                  padding: '4px 8px',
                  background: language === 'en' ? '#2B2620' : 'transparent',
                  color: language === 'en' ? '#FAF6EE' : '#2B2620',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                🇺🇸 EN
              </button>
            </div>

            <button
              onClick={() => { soundFx.playClick(); setMultiplayerModalOpen(true); }}
              title={t('nav.onlineRoom')}
              style={{
                padding: '6px 12px',
                background: roomCode ? '#059669' : '#0284C7',
                color: '#FFFFFF',
                border: '1.5px solid #2B2620',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Globe size={13} /> {roomCode ? `${t('app.room')} ${roomCode}` : t('nav.onlineRoom')}
            </button>

            {gameMode === 'lan' && (
              <button
                onClick={() => {
                  const isHost = myRole === 'player-1';
                  const msg = isHost
                    ? (language === 'en' ? 'Do you really want to end the online table for all players?' : 'Deseja realmente encerrar a mesa online para todos os jogadores?')
                    : (language === 'en' ? 'Do you really want to leave this online table?' : 'Deseja realmente sair desta mesa online?');
                  if (confirm(msg)) {
                    soundFx.playClick();
                    handleLeaveRoom();
                  }
                }}
                title={myRole === 'player-1'
                  ? (language === 'en' ? 'End online table for everyone' : 'Encerrar mesa online para todos')
                  : (language === 'en' ? 'Leave this online table' : 'Sair desta mesa online')}
                style={{
                  padding: '6px 10px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: '1.5px solid #2B2620',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogOut size={13} /> {myRole === 'player-1'
                  ? (language === 'en' ? 'End Table' : 'Encerrar Mesa')
                  : (language === 'en' ? 'Leave Table' : 'Sair da Mesa')}
              </button>
            )}

            <button
              onClick={() => {
                if (gameMode === 'lan' && myRole !== 'player-1') {
                  alert(language === 'en' ? 'In online matches, only the host (Player 1) can reset the game.' : 'Em partidas online, apenas o anfitrião (Jogador 1) pode reiniciar o jogo.');
                  return;
                }
                if (confirm(t('nav.resetConfirm'))) {
                  soundFx.playClick();
                  resetBoardGame();
                }
              }}
              disabled={gameMode === 'lan' && myRole !== 'player-1'}
              title={gameMode === 'lan' && myRole !== 'player-1'
                ? (language === 'en' ? 'Reset match (Only Host can reset)' : 'Reiniciar partida (Apenas o Host pode reiniciar)')
                : t('nav.resetGame')}
              style={{
                padding: '6px 8px',
                background: gameMode === 'lan' && myRole !== 'player-1' ? '#E5E7EB' : '#FAF6EE',
                color: gameMode === 'lan' && myRole !== 'player-1' ? '#9CA3AF' : '#685F53',
                border: '1.5px solid #2B2620',
                borderRadius: '6px',
                cursor: gameMode === 'lan' && myRole !== 'player-1' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: gameMode === 'lan' && myRole !== 'player-1' ? 0.6 : 1
              }}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* ROW 2: CONTROLES DA PARTIDA (SIMULATION HUB) + AJUDA / MANUAL */}
        <div
          style={{
            background: 'rgba(43,38,32,0.04)',
            borderTop: '1px solid rgba(43,38,32,0.12)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* ESQUERDA: SELETORES DE MESA E PERSPECTIVA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
                👥 {t('nav.tableCount')}
              </label>
              <select
                value={playerCount}
                onChange={(e) => {
                  soundFx.playClick();
                  setPlayerCount(Number(e.target.value));
                }}
                title={t('nav.playersCountLabel')}
                style={{
                  padding: '4px 8px',
                  background: '#FFFFFF',
                  color: '#2B2620',
                  border: '1.5px solid #2B2620',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={2}>2 {language === 'en' ? 'Players (Duel)' : 'Jogadores (Duelo)'}</option>
                <option value={3}>3 {language === 'en' ? 'Players' : 'Jogadores'}</option>
                <option value={4}>4 {language === 'en' ? 'Players' : 'Jogadores'}</option>
                <option value={5}>5 {language === 'en' ? 'Players' : 'Jogadores'}</option>
                <option value={6}>6 {language === 'en' ? 'Players (Full)' : 'Jogadores (Cheia)'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
                {gameMode === 'lan' || Boolean(roomCode) ? '🔒' : '👁️'} {t('nav.playerView')}
              </label>
              <select
                value={myRole}
                disabled={gameMode === 'lan' || Boolean(roomCode)}
                onChange={(e) => {
                  soundFx.playClick();
                  setMyRole(e.target.value as any);
                }}
                title={gameMode === 'lan' || Boolean(roomCode)
                  ? (language === 'en' ? 'Your seat is locked in this online room' : 'Seu assento é fixo nesta sala online')
                  : (language === 'en' ? 'Switch perspective to play or inspect each player mat' : 'Alterne a perspectiva para jogar ou inspecionar o tapete de cada jogador')}
                style={{
                  padding: '4px 8px',
                  background: gameMode === 'lan' || Boolean(roomCode) ? '#F3F4F6' : '#FFFFFF',
                  color: currentPlayer?.color || '#1E1B18',
                  border: '1.5px solid #2B2620',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: gameMode === 'lan' || Boolean(roomCode) ? 'not-allowed' : 'pointer',
                  opacity: gameMode === 'lan' || Boolean(roomCode) ? 0.85 : 1,
                  outline: 'none'
                }}
              >
                {allPlayers.slice(0, playerCount).map(p => (
                  <option key={p.id} value={p.id}>
                    {getLocalizedPlayerName(p.name, language)} {p.id === activePlayerRole ? `● (${language === 'en' ? 'Your Turn' : 'Sua Vez'})` : ''} - ${p.score.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DIREITA: OBSERVADOR / AJUDA / MANUAL / PRINT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { soundFx.playClick(); setObserverModalOpen(true); }}
              title={language === 'en' ? 'Observer Metrics & Full Telemetry Log' : 'Métricas do Observador & Log Completo de Telemetria'}
              style={{
                padding: '5px 10px',
                background: '#0F172A',
                color: '#38BDF8',
                border: '1.5px solid #0284C7',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Activity size={13} /> {language === 'en' ? `🔭 Observer (${auditLogs.length})` : `🔭 Observador (${auditLogs.length})`}
            </button>

            <button
              onClick={() => { soundFx.playClick(); setPlayerAidModalOpen(true); }}
              title={t('playerAid.title')}
              style={{
                padding: '5px 10px',
                background: '#FAF6EE',
                color: '#B45309',
                border: '1.5px solid #B45309',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <HelpCircle size={13} /> {t('nav.playerAid')}
            </button>

            <button
              onClick={() => { soundFx.playClick(); window.open('/pwned-manual-sucesso-v1.html', '_blank'); }}
              title={t('nav.manual')}
              style={{
                padding: '5px 10px',
                background: '#FAF6EE',
                color: '#1E1B18',
                border: '1.5px solid #2B2620',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <BookOpen size={13} /> {t('nav.manual')}
            </button>
          </div>
        </div>

        {/* LIVE OBSERVER TICKER BAR */}
        {auditLogs.length > 0 && (
          <div
            onClick={() => setObserverModalOpen(true)}
            style={{
              background: '#0F172A',
              color: '#E2E8F0',
              padding: '5px 16px',
              fontSize: '10.5px',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderTop: '1px solid #1E293B'
            }}
            title={language === 'en' ? 'Click to open the full Observer Metrics panel' : 'Clique para abrir o painel completo de Métricas do Observador'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ color: '#38BDF8', fontWeight: 900 }}>[LOG R{auditLogs[0].round}]</span>
              <span style={{ color: '#FACC15', fontWeight: 800 }}>{getLocalizedPlayerName(auditLogs[0].playerName || '', language)} {auditLogs[0].archetypeName ? `(${auditLogs[0].archetypeName}):` : ':'}</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{auditLogs[0].title}</span>
              <span style={{ color: '#94A3B8' }}>- {auditLogs[0].details}</span>
            </div>
            <span style={{ color: '#38BDF8', fontWeight: 800, flexShrink: 0, marginLeft: '10px' }}>
              {language === 'en' ? 'View Full History →' : 'Ver Histórico Completo →'}
            </span>
          </div>
        )}
      </header>

      {/* RENDER VIEW MODE */}
      {viewMode === 'fullTable' ? (
        <FullTableView
          humanPlayerData={humanPlayerData}
          onFocusMyMat={() => setViewMode('myMat')}
        />
      ) : viewMode === 'centerTable' ? (
        <>
          {/* Barra de retorno ao tapete individual */}
          <div
            style={{
              width: '100%',
              maxWidth: '1540px',
              margin: '0 auto 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAF6EE',
              border: '2px solid #2B2620',
              borderRadius: '8px',
              padding: '10px 18px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: '#1E1B18' }}>
              <span>{language === 'en' ? '🏛️ CENTRAL BOARD & CORPORATE MARKET' : '🏛️ TABULEIRO CENTRAL & MERCADO CORPORATIVO'}</span>
              <span style={{ fontSize: '10.5px', color: '#685F53', fontWeight: 'normal' }}>
                {language === 'en' ? '(Pick a program to allocate to your mat)' : '(Escolha um programa para alocar ao seu tapete)'}
              </span>
            </div>
            <button
              onClick={() => { soundFx.playClick(); setViewMode('myMat'); }}
              style={{
                padding: '8px 18px',
                background: '#2B2620',
                color: '#FAF6EE',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '900',
                fontFamily: 'monospace',
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} /> {t('centerBoard.returnToMyMat')}
            </button>
          </div>

          <CenterMarketMat
            totalRounds={10}
            selectedProgramId={playerActiveProgram?.id}
            onSelectProgram={() => {
              setViewMode('myMat');
            }}
          />
        </>
      ) : (
        <>
          {/* Action Points Bar */}
          <ActionPointsBar />

          {/* Individual Player Mat (Visão Padrão Inicial Limpa) */}
          <PlayerMat
            playerData={humanPlayerData}
            onExploitSelect={(card) => {
              if (card.type === 'exploit') {
                actionInfiltrar(card.id);
              }
            }}
            onOpenCenterTable={() => setViewMode('centerTable')}
            onOpenProgramSelector={() => setVoluntaryProgramModalOpen(true)}
            onActivateTool={(toolId) => activateInstalledTool(toolId)}
          />
        </>
      )}

      {/* MODAL DE SELEÇÃO DE PROGRAMA (OBRIGATÓRIO APÓS REPORT/PATCH OU TROCA 1 AP) */}
      <ProgramSelectorModal
        isOpen={awaitingProgramPick || voluntaryProgramModalOpen}
        marketPrograms={programMarket}
        programDeckCount={programDeckCount}
        isMandatory={awaitingProgramPick}
        reasonLabel={programPickReason || undefined}
        duelRotationsRemaining={duelRotationsRemaining}
        onRotateMarketProgram={rotateMarketProgram}
        onSelectExposedProgram={(prog: ProgramCard) => {
          selectNewProgram(prog);
          setVoluntaryProgramModalOpen(false);
        }}
        onDrawSurpriseFromDeck={() => {
          drawSurpriseProgramFromDeck();
          setVoluntaryProgramModalOpen(false);
        }}
        onClose={() => {
          if (!awaitingProgramPick) setVoluntaryProgramModalOpen(false);
        }}
      />

      {/* MODAL DE MÉTRICAS DO OBSERVADOR & LOG COMPLETO */}
      <ObserverMetricsModal
        isOpen={observerModalOpen}
        onClose={() => setObserverModalOpen(false)}
      />

      {/* MODAL DE INSPEÇÃO DE TOPO DE BARALHO (FUZZSTORM / HEX KITCHEN / PANÓPTICO / N00B) */}
      <DeckPeekModal />

      {/* EVENT CARD MODAL (DISPARO DE CAOS) */}
      <EventCardModal
        isOpen={activeEventCard !== null}
        eventCard={activeEventCard}
        onClose={closeEventModal}
        resolutionSummary={lastEventResolutionSummary}
        targetOptions={pendingTargetedEvent ? pendingTargetedEvent.targets : undefined}
        onSelectTarget={(targetId) => resolveTargetedEvent(targetId)}
      />

      {/* PRINT AND PLAY MODAL (GERAÇÃO DE PAPEL A4) */}
      <ErrorBoundary>
        <PrintAndPlayModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
        />
      </ErrorBoundary>

      {/* MODAL MULTIPLAYER LOBBY */}
      <MultiplayerLobbyModal
        isOpen={multiplayerModalOpen}
        onClose={() => setMultiplayerModalOpen(false)}
        onStartGame={handleStartGameMode}
        initialRoomCode={roomCode}
        playerCount={playerCount}
        onSetPlayerCount={setPlayerCount}
        onLeaveRoom={handleLeaveRoom}
        currentRole={myRole}
        gameMode={gameMode}
      />

      {/* MODAL PLAYER AID (GUIA RÁPIDO DO JOGADOR V1.4) */}
      <PlayerAidModal
        isOpen={playerAidModalOpen}
        onClose={() => setPlayerAidModalOpen(false)}
      />

      {/* MODAL OBRIGATÓRIO DO DADO D6 DE PATCH SPEED */}
      {isDiceModalOpen && (
        <DiceRoller
          programName={getLocalizedProgram(currentDisplayProgram, language).name}
          patchSpeed={currentDisplayProgram.patchSpeed}
          isNoisy={diceRollReason === 'report' || !isStealthMode}
          diceRollReason={diceRollReason}
          playerReputationTokens={reputacaoTokens}
          hasBypass={playerSafeguardSlot !== null}
          exploitsAtRisk={myExploitsInRisk.map(e => ({
            name: e.card.name,
            vulnClass: e.card.vulnClass,
            points: e.card.points || 1500
          }))}
          programBonusAtRisk={progBonusInRisk}
          onUseReputationReroll={useReputacaoReroll}
          onDefusePatch={defusePatch}
          onAcceptPatch={acceptPatch}
          onRollComplete={handleDiceRollResult}
        />
      )}

      {/* Patch Alert Modal Tabletop Style */}
      {patchAlertModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '90%',
              padding: '28px',
              textAlign: 'center',
              background: '#FAF6EE',
              border: '3px solid #B91C1C',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              color: '#1E1B18'
            }}
          >
            <div
              style={{
                margin: '0 auto 14px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #B91C1C'
              }}
            >
              <ShieldAlert size={32} color="#B91C1C" />
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#B91C1C', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '900', marginBottom: '4px' }}>
              PATCH DEPLOYED!
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', marginBottom: '8px' }}>
              {language === 'en'
                ? `ALERT ON ${alertServerName?.toUpperCase() || 'PRODUCTION'}!`
                : `ALERTA EM ${alertServerName?.toUpperCase() || 'PRODUÇÃO'}!`}
            </h2>

            <p style={{ fontSize: '12px', color: '#4B4337', marginBottom: '16px', lineHeight: '1.4' }}>
              {language === 'en'
                ? 'The Patch Speed dice sum reached the corporate defense threshold! The flaw was patched by the company.'
                : 'A soma dos dados de Patch Speed atingiu o limiar de defesa corporativa! A falha foi mitigada pela empresa.'}
            </p>

            {/* QUADRO DE TELEMETRIA: VALOR DO REPORT EM RISCO */}
            {myExploitsInRisk.length > 0 && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #F87171',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: 'monospace'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#991B1B', marginBottom: '6px' }}>
                  {language === 'en'
                    ? '💰 REPORT VALUE AT RISK (IF YOU ACCEPT PATCH):'
                    : '💰 VALOR DO REPORT EM RISCO (SE ACEITAR O PATCH):'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#374151' }}>
                  {myExploitsInRisk.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {e.card.name} ({e.card.vulnClass || 'EXPLOIT'})</span>
                      <span style={{ fontWeight: '800', color: '#166534' }}>+${(e.card.points || 1500).toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}</span>
                    </div>
                  ))}
                  {progBonusInRisk > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {language === 'en' ? 'Contract Bonus' : 'Bônus Contrato'} [{playerActiveProgram?.name}]</span>
                      <span style={{ fontWeight: '800', color: '#166534' }}>+${progBonusInRisk.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1.5px dashed #FECACA', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '13px', color: '#166534' }}>
                    <span>{language === 'en' ? 'TOTAL TO RECEIVE IF USING BYPASS:' : 'TOTAL A RECEBER SE USAR BYPASS:'}</span>
                    <span>+${totalBountyInRisk.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {playerSafeguardSlot && (
                <button
                  onClick={() => { soundFx.playClick(); defusePatch(); }}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '12px',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: '1.5px solid #2B2620',
                    borderRadius: '6px',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
                  }}
                  title={language === 'en' ? 'Cancels discard, guarantees Payout and gains 1 Alert (discards Bypass)' : 'Anula o descarte, garante o Payout e recebe 1 Alerta (descarta o Bypass)'}
                >
                  {language === 'en' ? '🛡️ Activate Bypass (Safeguard)' : '🛡️ Ativar Bypass (Safeguard)'}
                </button>
              )}

              <button
                onClick={() => { soundFx.playClick(); acceptPatch(); }}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '12px',
                  background: '#B91C1C',
                  color: '#FFFFFF',
                  border: '1.5px solid #2B2620',
                  borderRadius: '6px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(185, 28, 28, 0.4)'
                }}
                title={language === 'en' ? 'Discards Exploits and Program, gains 1 Alert and draws 1 consolation card' : 'Descarta Exploits e Programa, recebe 1 Alerta e compra 1 consolação'}
              >
                {language === 'en' ? '💥 Accept Patch (+1 Alert 🐞)' : '💥 Aceitar Patch (+1 Alerta 🐞)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal Overlay Tabletop Style (Pódio & Classificação Final) */}
      {gameWinner && (() => {
        const activeStandings = allPlayers
          .slice(0, playerCount)
          .map(p => {
            const repBonus = (p.reputacaoTokens || 0) * 500;
            const alertPenalty = (p.alertaTokens || 0) * 500;
            const finalTotal = p.score + repBonus - alertPenalty;
            return { p, repBonus, alertPenalty, finalTotal };
          })
          .sort((a, b) =>
            (b.finalTotal - a.finalTotal) ||
            (b.p.reputacaoTokens - a.p.reputacaoTokens) ||
            (a.p.alertaTokens - b.p.alertaTokens)
          );
        const topWinner = activeStandings[0];
        const didLocalWin = topWinner?.p.id === myRole || gameWinner.includes(currentPlayer?.name || '');
        const canRestart = gameMode !== 'lan' || myRole === 'player-1';

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9000,
              padding: '16px'
            }}
          >
            <div
              style={{
                maxWidth: '640px',
                width: '96%',
                padding: '28px 24px',
                textAlign: 'center',
                background: '#FAF6EE',
                border: '3px solid #D97706',
                borderRadius: '14px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                color: '#1E1B18',
                maxHeight: '92vh',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  margin: '0 auto 12px',
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #D97706'
                }}
              >
                <Trophy size={38} color="#D97706" />
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#B45309', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '900', marginBottom: '4px' }}>
                {language === 'en' ? 'HALL OF FAME - FINAL PODIUM' : 'HALL OF FAME - PÓDIO FINAL'}
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', marginBottom: '6px' }}>
                🏆 {language === 'en' ? 'WINNER:' : 'VENCEDOR:'} {getLocalizedPlayerName(gameWinner, language)}
              </h2>

              <p style={{ fontSize: '13px', color: didLocalWin ? '#166534' : '#4B4337', fontWeight: didLocalWin ? '800' : '600', marginBottom: '18px', fontFamily: 'monospace' }}>
                {didLocalWin
                  ? (language === 'en' ? '🎉 CONGRATULATIONS! You took 1st place on the Bug Bounty Track!' : '🎉 PARABÉNS! Você conquistou o 1º lugar na trilha de Bug Bounty!')
                  : (language === 'en' ? 'Match ended! Check the official tally of Bounty, Reputation (🐝 +$500) and Alerts (🐞 -$500):' : 'Partida encerrada! Confira a contabilização oficial de Bounty, Reputação (🐝 +$500) e Alertas (🐞 -$500):')}
              </p>

              {/* TABELA DO PÓDIO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
                {activeStandings.map((item, idx) => {
                  const isFirst = idx === 0;
                  const isMe = item.p.id === myRole;
                  const medal = idx === 0
                    ? (language === 'en' ? '🥇 1st' : '🥇 1º')
                    : idx === 1
                    ? (language === 'en' ? '🥈 2nd' : '🥈 2º')
                    : idx === 2
                    ? (language === 'en' ? '🥉 3rd' : '🥉 3º')
                    : (language === 'en' ? `${idx + 1}th` : `${idx + 1}º`);
                  const locArch = getLocalizedArchetype(item.p.archetype, language);

                  return (
                    <div
                      key={item.p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isFirst ? '#FEF3C7' : isMe ? '#F0FDF4' : '#FFFFFF',
                        border: isFirst ? '2px solid #D97706' : isMe ? '1.5px solid #16A34A' : '1px solid #D6CBB8'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '900', color: '#1E1B18' }}>
                          <span>{medal}</span>
                          <span style={{ color: item.p.color }}>{getLocalizedPlayerName(item.p.name, language)}</span>
                          {isMe && (
                            <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '4px' }}>
                              {language === 'en' ? 'YOU' : 'VOCÊ'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#685F53', fontFamily: 'monospace', marginTop: '2px' }}>
                          {item.p.archetype?.avatarIcon} {locArch.name} • Bounty: ${item.p.score.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')} | 🐝 {item.p.reputacaoTokens} (+${item.repBonus}) | 🐞 {item.p.alertaTokens} (-${item.alertPenalty})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: isFirst ? '#B45309' : '#047857' }}>
                          ${item.finalTotal.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#685F53', fontWeight: '700' }}>
                          {language === 'en' ? 'FINAL TOTAL' : 'TOTAL FINAL'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESTAQUES DA PARTIDA */}
              {(() => {
                const victoryHighlights = computeMatchHighlights(
                  auditLogs,
                  activeStandings.map(s => s.p),
                  playerMetrics,
                  language
                );
                if (!victoryHighlights.biggestHit && !victoryHighlights.worstPatch && victoryHighlights.playerTitles.length === 0) {
                  return null;
                }
                return (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '2px solid #334155',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '18px',
                      textAlign: 'left',
                      fontFamily: 'monospace'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏅</span>
                      <span>{language === 'en' ? 'MATCH HIGHLIGHTS' : 'DESTAQUES DA PARTIDA'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '10px', fontSize: '10.5px' }}>
                      {victoryHighlights.biggestHit && (
                        <div style={{ background: '#FFFFFF', border: '1.5px solid #16A34A', borderRadius: '6px', padding: '7px 9px' }}>
                          <div style={{ fontWeight: '900', color: '#166534' }}>💰 {language === 'en' ? 'Biggest Hit' : 'Maior Tacada'}</div>
                          <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                            <strong>{getLocalizedPlayerName(victoryHighlights.biggestHit.playerName, language)}</strong>: +${victoryHighlights.biggestHit.amount.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')} ({victoryHighlights.biggestHit.programName}, R{victoryHighlights.biggestHit.round})
                          </div>
                          {victoryHighlights.biggestHit.combo && (
                            <div style={{ fontSize: '9.5px', color: '#475569', marginTop: '2px' }}>Combo: {victoryHighlights.biggestHit.combo}</div>
                          )}
                        </div>
                      )}

                      {victoryHighlights.worstPatch && (
                        <div style={{ background: '#FFFFFF', border: '1.5px solid #DC2626', borderRadius: '6px', padding: '7px 9px' }}>
                          <div style={{ fontWeight: '900', color: '#991B1B' }}>💥 {language === 'en' ? 'Hardest Patch' : 'Maior Tombo (Patch)'}</div>
                          <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                            <strong>{getLocalizedPlayerName(victoryHighlights.worstPatch.playerName, language)}</strong> {language === 'en' ? 'lost the table on' : 'perdeu a mesa em'} {victoryHighlights.worstPatch.programName} (R{victoryHighlights.worstPatch.round})
                          </div>
                        </div>
                      )}

                      {victoryHighlights.cleanRunLeader && (
                        <div style={{ background: '#FFFFFF', border: '1.5px solid #0284C7', borderRadius: '6px', padding: '7px 9px' }}>
                          <div style={{ fontWeight: '900', color: '#0369A1' }}>👻 {language === 'en' ? 'Cleanest Run' : 'Operação Mais Limpa'}</div>
                          <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                            <strong>{getLocalizedPlayerName(victoryHighlights.cleanRunLeader.playerName, language)}</strong>: {victoryHighlights.cleanRunLeader.reportsCompleted} {language === 'en' ? 'report(s) with 0 alerts' : 'report(s) sem alertas'}
                          </div>
                        </div>
                      )}
                    </div>

                    {victoryHighlights.playerTitles.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {victoryHighlights.playerTitles.map(pt => (
                          <div
                            key={pt.playerId}
                            style={{
                              background: '#FFFFFF',
                              border: `1.5px solid ${pt.color}`,
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              color: '#1E1B18'
                            }}
                          >
                            <strong style={{ color: pt.color }}>{getLocalizedPlayerName(pt.playerName, language)}</strong> ({pt.badge}): {pt.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ENQUETE RÁPIDA DE PLAYTEST & AVALIAÇÃO PARA O JOGO FÍSICO */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2px solid #D97706',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                  textAlign: 'left',
                  fontFamily: 'monospace'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400E', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📦</span>
                  <span>
                    {language === 'en'
                      ? 'PLAYTEST EVALUATION (10s) - HELP BUILD THE PHYSICAL EDITION!'
                      : 'AVALIAÇÃO DO PLAYTEST (10s) - AJUDE A VIABILIZAR O JOGO FÍSICO!'}
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#78350F', lineHeight: '1.4', marginBottom: '12px' }}>
                  {language === 'en'
                    ? 'Your feedback is crucial to calibrate card balancing and prepare the official physical tabletop edition of PWNED!. Please click below and save to our database:'
                    : 'Sua resposta é fundamental para calibrarmos o balanceamento final das cartas e viabilizarmos a futura produção e disponibilização do jogo físico! Leva só 10 segundos:'}
                </div>

                {fbStatus === 'saved' || Boolean(playerMetrics?.[myRole]?.feedback) ? (
                  <div
                    style={{
                      background: '#DCFCE7',
                      border: '1.5px solid #16A34A',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#166534',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      textAlign: 'center'
                    }}
                  >
                    {language === 'en'
                      ? '✓ Evaluation sent & saved to Supabase! Thank you for helping shape the physical edition of PWNED!'
                      : '✓ Avaliação enviada e gravada no banco com sucesso! Muito obrigado por ajudar a construir a edição física do PWNED!'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Pergunta 1: Ritmo / Duração */}
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#1E1B18', marginBottom: '4px' }}>
                        {language === 'en' ? '1. Match Pacing / Duration:' : '1. Ritmo e duração da partida:'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { val: 'Curta demais', labelPt: '⚡ Curta demais', labelEn: '⚡ Too short' },
                          { val: 'No tempo certo', labelPt: '🎯 No tempo certo', labelEn: '🎯 Just right' },
                          { val: 'Arrastada', labelPt: '🐢 Arrastada / Longa', labelEn: '🐢 Too long' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => { soundFx.playClick(); setFbPacing(opt.val); }}
                            style={{
                              flex: 1,
                              minWidth: '110px',
                              padding: '6px 8px',
                              fontSize: '10.5px',
                              fontFamily: 'monospace',
                              fontWeight: '800',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: fbPacing === opt.val ? '#2B2620' : '#FFFFFF',
                              color: fbPacing === opt.val ? '#FBBF24' : '#374151',
                              border: fbPacing === opt.val ? '1.5px solid #D97706' : '1px solid #D6CBB8'
                            }}
                          >
                            {language === 'en' ? opt.labelEn : opt.labelPt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pergunta 2: Nível de Caos / Punição */}
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#1E1B18', marginBottom: '4px' }}>
                        {language === 'en' ? '2. Chaos & Punishment Level (Patches & Events):' : '2. Nível de caos e punição (Patches & Eventos):'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { val: 'Fraco / Sem tensão', labelPt: '😴 Fraco / Sem tensão', labelEn: '😴 Too weak' },
                          { val: 'Equilibrado', labelPt: '⚖️ Equilibrado / Divertido', labelEn: '⚖️ Balanced & Fun' },
                          { val: 'Frustrante / Injusto', labelPt: '🔥 Frustrante / Punitivo', labelEn: '🔥 Too punishing' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => { soundFx.playClick(); setFbChaos(opt.val); }}
                            style={{
                              flex: 1,
                              minWidth: '110px',
                              padding: '6px 8px',
                              fontSize: '10.5px',
                              fontFamily: 'monospace',
                              fontWeight: '800',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: fbChaos === opt.val ? '#2B2620' : '#FFFFFF',
                              color: fbChaos === opt.val ? '#FBBF24' : '#374151',
                              border: fbChaos === opt.val ? '1.5px solid #D97706' : '1px solid #D6CBB8'
                            }}
                          >
                            {language === 'en' ? opt.labelEn : opt.labelPt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pergunta 3: Clareza das Regras / UI */}
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#1E1B18', marginBottom: '4px' }}>
                        {language === 'en' ? '3. Did any mechanic feel confusing?' : '3. Alguma mecânica gerou dúvida durante o jogo?'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { val: 'Tudo claro', labelPt: '✓ Tudo claro', labelEn: '✓ All clear' },
                          { val: 'Escopo / Report', labelPt: '🎯 Escopo / Report', labelEn: '🎯 Scope / Report' },
                          { val: 'Stealth vs Noisy', labelPt: '🎲 Stealth vs Noisy', labelEn: '🎲 Stealth vs Noisy' },
                          { val: 'Tools / Poderes', labelPt: '🛠️ Tools / Poderes', labelEn: '🛠️ Tools / Powers' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => { soundFx.playClick(); setFbClarity(opt.val); }}
                            style={{
                              flex: 1,
                              minWidth: '95px',
                              padding: '6px 6px',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              fontWeight: '800',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: fbClarity === opt.val ? '#2B2620' : '#FFFFFF',
                              color: fbClarity === opt.val ? '#FBBF24' : '#374151',
                              border: fbClarity === opt.val ? '1.5px solid #D97706' : '1px solid #D6CBB8'
                            }}
                          >
                            {language === 'en' ? opt.labelEn : opt.labelPt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comentário opcional */}
                    <div>
                      <input
                        type="text"
                        value={fbComment}
                        onChange={e => setFbComment(e.target.value)}
                        placeholder={
                          language === 'en'
                            ? 'Optional: Any card/archetype felt OP, stuck, or fun? Tell us...'
                            : 'Opcional: Algum arquétipo/carta pareceu apelão, travado ou muito bom? Conte aqui...'
                        }
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '8px 10px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          borderRadius: '6px',
                          border: '1px solid #D6CBB8',
                          background: '#FFFFFF',
                          color: '#1E1B18'
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={fbStatus === 'saving'}
                      onClick={async () => {
                        soundFx.playClick();
                        setFbStatus('saving');
                        const res = await submitMatchFeedback({
                          pacing: fbPacing,
                          chaosBalance: fbChaos,
                          rulesClarity: fbClarity,
                          comment: fbComment
                        });
                        setFbStatus(res.success ? 'saved' : 'error');
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#7C3AED',
                        color: '#FFFFFF',
                        border: '2px solid #4C1D95',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontWeight: '900',
                        fontSize: '12px',
                        cursor: fbStatus === 'saving' ? 'wait' : 'pointer',
                        boxShadow: '0 3px 8px rgba(124, 58, 237, 0.35)'
                      }}
                    >
                      {fbStatus === 'saving'
                        ? (language === 'en' ? '⏳ Saving Evaluation & Match Log...' : '⏳ Enviando Avaliação & Salvando no Banco...')
                        : fbStatus === 'error'
                        ? (language === 'en' ? '⚠️ Retry Sending Evaluation & Save to DB' : '⚠️ Tentar Novamente: Enviar Avaliação & Salvar')
                        : (language === 'en' ? '✨ Submit Evaluation & Save to Database ☁️' : '✨ Enviar Avaliação & Salvar no Banco ☁️')}
                    </button>
                  </div>
                )}
              </div>

              {/* AÇÕES FINAIS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setObserverModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1E293B',
                    color: '#F8FAFC',
                    border: '2px solid #0F172A',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Activity size={16} color="#38BDF8" /> {language === 'en' ? '📊 View Telemetry & Download Match Log' : '📊 Ver Telemetria & Baixar Log da Partida'}
                </button>

                {canRestart ? (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      resetBoardGame();
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: '2px solid #2B2620',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 10px rgba(22, 163, 74, 0.4)'
                    }}
                  >
                    <RefreshCw size={16} /> {language === 'en' ? 'Play New Match' : 'Jogar Nova Partida'}
                  </button>
                ) : (
                  <div style={{ padding: '10px', background: '#F3EFE6', border: '1px dashed #A89D8B', borderRadius: '8px', fontSize: '11.5px', fontFamily: 'monospace', color: '#5A5245', fontWeight: '700' }}>
                    {language === 'en'
                      ? '⏳ Waiting for the Host to start a new match...'
                      : '⏳ Aguardando o anfitrião (Host) iniciar uma nova partida...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export const BoardGameMain: React.FC = () => {
  return (
    <BoardGameProvider>
      <BoardGameContent />
    </BoardGameProvider>
  );
};
