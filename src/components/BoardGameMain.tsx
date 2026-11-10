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
import { ObserverMetricsModal, DeckPeekModal } from './ObserverMetricsModal';
import { ARCHETYPES, PROGRAM_CARDS, ProgramCard } from '../data/cardsData';
import { useLanguage } from '../i18n/LanguageContext';
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
    roomCode,
    setRoomCode
  } = useBoardGame();

  const [viewMode, setViewMode] = useState<'myMat' | 'centerTable' | 'fullTable'>('myMat');
  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState<boolean>(false);
  const [playerAidModalOpen, setPlayerAidModalOpen] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [observerModalOpen, setObserverModalOpen] = useState<boolean>(false);
  const [voluntaryProgramModalOpen, setVoluntaryProgramModalOpen] = useState<boolean>(false);

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
    playerName: `${currentPlayer?.name || myRole} (Você)`,
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
    const roleParam = params.get('role') as PlayerRoleId | null;

    if (roomParam) {
      const code = roomParam.toUpperCase().trim();
      setRoomCode(code);
      if (roleParam) {
        handleStartGameMode('lan', code, roleParam);
      } else {
        // Link neutro recebido: abre modal direto para escolha de assento
        setMultiplayerModalOpen(true);
      }
    }
  }, []);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div style={{ width: '96%', maxWidth: '1540px', margin: '0 auto', padding: '16px 12px' }}>

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
                    ? 'Deseja realmente encerrar a mesa online para todos os jogadores?'
                    : 'Deseja realmente sair desta mesa online?';
                  if (confirm(msg)) {
                    soundFx.playClick();
                    handleLeaveRoom();
                  }
                }}
                title={myRole === 'player-1' ? 'Encerrar mesa online para todos' : 'Sair desta mesa online'}
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
                <LogOut size={13} /> {myRole === 'player-1' ? 'Encerrar Mesa' : 'Sair da Mesa'}
              </button>
            )}

            <button
              onClick={() => {
                if (gameMode === 'lan' && myRole !== 'player-1') {
                  alert('Em partidas online, apenas o anfitrião (Jogador 1) pode reiniciar o jogo.');
                  return;
                }
                if (confirm(t('nav.resetConfirm'))) {
                  soundFx.playClick();
                  resetBoardGame();
                }
              }}
              disabled={gameMode === 'lan' && myRole !== 'player-1'}
              title={gameMode === 'lan' && myRole !== 'player-1' ? 'Reiniciar partida (Apenas o Host pode reiniciar)' : t('nav.resetGame')}
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
                👁️ {t('nav.playerView')}
              </label>
              <select
                value={myRole}
                onChange={(e) => {
                  soundFx.playClick();
                  setMyRole(e.target.value as any);
                }}
                title="Alterne a perspectiva para jogar ou inspecionar o tapete de cada jogador"
                style={{
                  padding: '4px 8px',
                  background: '#FFFFFF',
                  color: currentPlayer?.color || '#1E1B18',
                  border: '1.5px solid #2B2620',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {allPlayers.slice(0, playerCount).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === activePlayerRole ? `● (${language === 'en' ? 'Your Turn' : 'Sua Vez'})` : ''} — ${p.score.toLocaleString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DIREITA: OBSERVADOR / AJUDA / MANUAL / PRINT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { soundFx.playClick(); setObserverModalOpen(true); }}
              title="Métricas do Observador & Log Completo de Telemetria"
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
              <Activity size={13} /> 🔭 Observador ({auditLogs.length})
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
            title="Clique para abrir o painel completo de Métricas do Observador"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ color: '#38BDF8', fontWeight: 900 }}>[LOG R{auditLogs[0].round}]</span>
              <span style={{ color: '#FACC15', fontWeight: 800 }}>{auditLogs[0].playerName} {auditLogs[0].archetypeName ? `(${auditLogs[0].archetypeName}):` : ':'}</span>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{auditLogs[0].title}</span>
              <span style={{ color: '#94A3B8' }}>— {auditLogs[0].details}</span>
            </div>
            <span style={{ color: '#38BDF8', fontWeight: 800, flexShrink: 0, marginLeft: '10px' }}>
              Ver Histórico Completo →
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
              <span>🏛️ TABULEIRO CENTRAL & MERCADO CORPORATIVO</span>
              <span style={{ fontSize: '10.5px', color: '#685F53', fontWeight: 'normal' }}>
                (Escolha um programa para alocar ao seu tapete)
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
              <ArrowLeft size={14} /> Voltar ao Meu Tapete
            </button>
          </div>

          <CenterMarketMat
            totalRounds={8}
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
          programName={currentDisplayProgram.name}
          patchSpeed={currentDisplayProgram.patchSpeed}
          isNoisy={diceRollReason === 'report' || !isStealthMode}
          diceRollReason={diceRollReason}
          playerReputationTokens={reputacaoTokens}
          hasBypass={playerSafeguardSlot !== null}
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
              ALERTA EM {alertServerName?.toUpperCase() || 'PRODUÇÃO'}!
            </h2>

            <p style={{ fontSize: '12px', color: '#4B4337', marginBottom: '22px', lineHeight: '1.4' }}>
              A soma dos dados de Patch Speed atingiu o limiar de defesa corporativa! A falha foi mitigada pela empresa.
            </p>

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
                  title="Anula o descarte, garante o Payout e recebe 1 Alerta (descarta o Bypass)"
                >
                  🛡️ Ativar Bypass (Safeguard)
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
                title="Descarta Exploits e Programa, recebe 1 Alerta e compra 1 consolação"
              >
                💥 Aceitar Patch (+1 Alerta 🐞)
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
                HALL OF FAME — PÓDIO FINAL
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', marginBottom: '6px' }}>
                🏆 VENCEDOR: {gameWinner}
              </h2>

              <p style={{ fontSize: '13px', color: didLocalWin ? '#166534' : '#4B4337', fontWeight: didLocalWin ? '800' : '600', marginBottom: '18px', fontFamily: 'monospace' }}>
                {didLocalWin
                  ? '🎉 PARABÉNS! Você conquistou o 1º lugar na trilha de Bug Bounty!'
                  : `Partida encerrada! Confira a contabilização oficial de Bounty, Reputação (🐝 +$500) e Alertas (🐞 -$500):`}
              </p>

              {/* TABELA DO PÓDIO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
                {activeStandings.map((item, idx) => {
                  const isFirst = idx === 0;
                  const isMe = item.p.id === myRole;
                  const medal = idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;

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
                          <span style={{ color: item.p.color }}>{item.p.name}</span>
                          {isMe && <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '4px' }}>VOCÊ</span>}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#685F53', fontFamily: 'monospace', marginTop: '2px' }}>
                          {item.p.archetype?.avatarIcon} {item.p.archetype?.name} • Bounty: ${item.p.score.toLocaleString('pt-BR')} | 🐝 {item.p.reputacaoTokens} (+${item.repBonus}) | 🐞 {item.p.alertaTokens} (-${item.alertPenalty})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: isFirst ? '#B45309' : '#047857' }}>
                          ${item.finalTotal.toLocaleString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#685F53', fontWeight: '700' }}>
                          TOTAL FINAL
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <Activity size={16} color="#38BDF8" /> 📊 Ver Telemetria & Baixar Log da Partida
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
                    <RefreshCw size={16} /> Jogar Nova Partida
                  </button>
                ) : (
                  <div style={{ padding: '10px', background: '#F3EFE6', border: '1px dashed #A89D8B', borderRadius: '8px', fontSize: '11.5px', fontFamily: 'monospace', color: '#5A5245', fontWeight: '700' }}>
                    ⏳ Aguardando o anfitrião (Host) iniciar uma nova partida...
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
