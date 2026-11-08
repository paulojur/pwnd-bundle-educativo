import React, { useState } from 'react';
import { BoardGameProvider, useBoardGame } from '../context/BoardGameContext';
import { CenterMarketMat } from './CenterMarketMat';
import { PlayerMat, PlayerMatData } from './PlayerMat';
import { FullTableView } from './FullTableView';
import { ActionPointsBar } from './ActionPointsBar';
import { DiceRoller } from './DiceRoller';
import { MultiplayerLobbyModal } from './MultiplayerLobbyModal';
import { EventCardModal } from './EventCardModal';
import { PrintAndPlayModal } from './PrintAndPlayModal';
import { PlayerAidModal } from './PlayerAidModal';
import { ARCHETYPES, PROGRAM_CARDS, ProgramCard } from '../data/cardsData';
import { Layers, RefreshCw, Eye, Users, ShieldAlert, Globe, Printer, BookOpen, Trophy, Home, HelpCircle, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/audio';

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
    actionInfiltrar
  } = useBoardGame();

  const [viewMode, setViewMode] = useState<'myMat' | 'centerTable' | 'fullTable'>('myMat');
  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState<boolean>(false);
  const [playerAidModalOpen, setPlayerAidModalOpen] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // Escutar evento de desistência/troca de programa ativo
  const { abandonActiveProgram } = useBoardGame();
  React.useEffect(() => {
    const handleAbandon = () => abandonActiveProgram();
    window.addEventListener('pwnd_abandon_program', handleAbandon);
    return () => window.removeEventListener('pwnd_abandon_program', handleAbandon);
  }, [abandonActiveProgram]);

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
    hasDefuse: playerSafeguardSlot !== null,
    hasCve: playerCveProtection !== null,
    isCurrentTurnPlayer: isMyTurn,
    alertaTokens,
    reputacaoTokens
  };

  const handleStartGameMode = (mode: 'solo' | 'hotseat' | 'lan', code?: string, role?: 'player-1' | 'player-2') => {
    setGameMode(mode);
    if (code) setRoomCode(code);
    if (role) {
      setMyRole(role);
    }
  };

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div style={{ width: '96%', maxWidth: '1540px', margin: '0 auto', padding: '16px 12px' }}>

      {/* COMPACT TABLETOP TOP BAR / MENU */}
      <header
        style={{
          background: '#FAF6EE',
          border: '2px solid #2B2620',
          borderRadius: '10px',
          padding: '8px 16px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* BRAND LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                V1.4
              </span>
              {roomCode && (
                <span style={{ fontSize: '9px', fontWeight: '800', background: '#059669', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                  SALA: {roomCode}
                </span>
              )}
            </div>
            <div style={{ fontSize: '9.5px', color: '#7E7362', fontFamily: 'monospace' }}>
              The Bug Bounty Chaos
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE VISÕES (SEGMENTED TABS) */}
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
              padding: '6px 12px',
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
            <Eye size={13} /> Meu Tapete
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('centerTable'); }}
            style={{
              padding: '6px 12px',
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
            <Layers size={13} /> Mesa Central
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('fullTable'); }}
            style={{
              padding: '6px 12px',
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
            <Users size={13} /> Mesa Completa ({playerCount}P)
          </button>
        </div>

        {/* CONTROLES DE MESA & PERSPECTIVA (PLAYTEST HUB) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* SELETOR DE JOGADORES NA PARTIDA (2 A 6) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
              👥 Mesa:
            </label>
            <select
              value={playerCount}
              onChange={(e) => {
                soundFx.playClick();
                setPlayerCount(Number(e.target.value));
              }}
              title="Configurar quantidade de jogadores ativos na mesa (2 a 6)"
              style={{
                padding: '6px 10px',
                background: '#FFFFFF',
                color: '#2B2620',
                border: '1.5px solid #2B2620',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={2}>2 Jogadores (Duelo)</option>
              <option value={3}>3 Jogadores</option>
              <option value={4}>4 Jogadores</option>
              <option value={5}>5 Jogadores</option>
              <option value={6}>6 Jogadores (Cheia)</option>
            </select>
          </div>

          {/* SELETOR DE PERSPECTIVA DO JOGADOR (OPTION / DROPDOWN) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
              👁️ Jogador:
            </label>
            <select
              value={myRole}
              onChange={(e) => {
                soundFx.playClick();
                setMyRole(e.target.value as any);
              }}
              title="Alterne a perspectiva para jogar ou inspecionar o tapete de cada jogador"
              style={{
                padding: '6px 10px',
                background: '#FFFFFF',
                color: currentPlayer?.color || '#1E1B18',
                border: '1.5px solid #2B2620',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {allPlayers.slice(0, playerCount).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.id === activePlayerRole ? '● (Sua Vez)' : ''} — ${p.score.toLocaleString('pt-BR')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* UTILITIES (PLAYER AID, MANUAL, ONLINE, RESET) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => { soundFx.playClick(); setPlayerAidModalOpen(true); }}
            title="Abrir Player Aid canônico V1.4"
            style={{
              padding: '6px 10px',
              background: '#FAF6EE',
              color: '#B45309',
              border: '1.5px solid #B45309',
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
            <HelpCircle size={13} /> Player Aid
          </button>

          <button
            onClick={() => { soundFx.playClick(); window.open('/pwned-manual-sucesso-v1.html', '_blank'); }}
            title="Abrir manual oficial de regras V1.4"
            style={{
              padding: '6px 10px',
              background: '#FAF6EE',
              color: '#1E1B18',
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
            <BookOpen size={13} /> Manual
          </button>

          <button
            onClick={() => { soundFx.playClick(); setMultiplayerModalOpen(true); }}
            title="Conectar ou criar sala multiplayer online"
            style={{
              padding: '6px 10px',
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
              gap: '4px'
            }}
          >
            <Globe size={13} /> {roomCode ? `Sala ${roomCode}` : 'Online'}
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja reiniciar a mesa com novas cartas?')) {
                soundFx.playClick();
                resetBoardGame();
              }
            }}
            title="Reiniciar Tabuleiro"
            style={{
              padding: '6px 8px',
              background: '#FAF6EE',
              color: '#685F53',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
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
            onSelectProgram={(program) => {
              selectNewProgram(program);
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
          />
        </>
      )}

      {/* EVENT CARD MODAL (DISPARO DE CAOS) */}
      <EventCardModal
        isOpen={activeEventCard !== null}
        eventCard={activeEventCard}
        onClose={closeEventModal}
      />

      {/* PRINT AND PLAY MODAL (GERAÇÃO DE PAPEL A4) */}
      <ErrorBoundary>
        <PrintAndPlayModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
        />
      </ErrorBoundary>

      {/* MODAL MULTIPLAYER LOBBY (2 JOGADORES REAIS) */}
      <MultiplayerLobbyModal
        isOpen={multiplayerModalOpen}
        onClose={() => setMultiplayerModalOpen(false)}
        onStartGame={handleStartGameMode}
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

      {/* Victory Modal Overlay Tabletop Style */}
      {gameWinner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
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
              padding: '32px',
              textAlign: 'center',
              background: '#FAF6EE',
              border: '3px solid #D97706',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              color: '#1E1B18'
            }}
          >
            <div
              style={{
                margin: '0 auto 16px',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #D97706'
              }}
            >
              <Trophy size={40} color="#D97706" />
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#B45309', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '900', marginBottom: '4px' }}>
              HALL OF FAME CHAMPION
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', marginBottom: '8px' }}>
              PWNED! VITÓRIA CONQUISTADA!
            </h2>

            <p style={{ fontSize: '13.5px', color: '#4B4337', marginBottom: '22px' }}>
              Você faturou um total de <strong style={{ color: '#047857' }}>${bountyTotalCash.toLocaleString('pt-BR')}</strong> em recompensas no Bug Bounty!
            </p>

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
          </div>
        </div>
      )}
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
