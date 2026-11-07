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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px' }}>

      {/* Board Game Header */}
      <header
        style={{
          background: '#FAF6EE',
          border: '2.5px solid #2B2620',
          borderRadius: '10px',
          padding: '12px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#2B2620',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAF6EE'
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#B45309', fontWeight: '800', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              PWNED! TABLETOP EDITION {roomCode ? `[SALA ONLINE: ${roomCode}]` : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1E1B18', letterSpacing: '-0.5px', lineHeight: '1', margin: 0, fontFamily: 'monospace' }}>
                PWNED!
              </h1>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#685F53', fontFamily: 'monospace' }}>
                The Bug Bounty Chaos
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#7E7362', fontStyle: 'italic' }}>
              Find it. Report it. Get paid.
            </div>
          </div>
        </div>

        {/* View Mode Toggle Buttons, Print & Play & Multiplayer Lobby Button */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => { soundFx.playClick(); window.location.href = '/'; }}
            style={{
              padding: '8px 14px',
              background: '#FFFFFF',
              color: '#1E1B18',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '800',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Home size={14} /> Início
          </button>

          <button
            onClick={() => { soundFx.playClick(); window.open('/pwned-manual-sucesso-v1.html', '_blank'); }}
            style={{
              padding: '8px 14px',
              background: '#B45309',
              color: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '800',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(180, 83, 9, 0.3)'
            }}
          >
            <BookOpen size={14} /> 📖 Manual V1.4
          </button>

          {/* Player Aid Modal Trigger */}
          <button
            onClick={() => { soundFx.playClick(); setPlayerAidModalOpen(true); }}
            title="Abrir a carta de auxílio rápido ao jogador (Player Aid)"
            style={{
              padding: '8px 14px',
              background: '#D97706',
              color: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(217, 119, 6, 0.3)'
            }}
          >
            <HelpCircle size={14} /> 📋 Player Aid
          </button>

          <button
            onClick={() => {
              const nextRole = myRole === 'player-1' ? 'player-2' : 'player-1';
              soundFx.playClick();
              setMyRole(nextRole);
            }}
            title="Alterna o jogador ativo no dispositivo local (ideal para testar os 2 lados)"
            style={{
              padding: '8px 12px',
              background: '#FAF6EE',
              color: myRole === 'player-1' ? '#16A34A' : '#2563EB',
              border: `1.5px solid ${myRole === 'player-1' ? '#16A34A' : '#2563EB'}`,
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
            🔄 Ver como {myRole === 'player-1' ? 'Jogador 2 (Azul)' : 'Jogador 1 (Verde)'}
          </button>

          <button
            onClick={() => { soundFx.playClick(); setMultiplayerModalOpen(true); }}
            style={{
              padding: '8px 14px',
              background: '#0284C7',
              color: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '800',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={14} /> 🌐 Sala Online (Supabase)
          </button>

          {/* VIEW SWITCHER TABS */}
          <button
            onClick={() => { soundFx.playClick(); setViewMode('myMat'); }}
            style={{
              padding: '8px 14px',
              background: viewMode === 'myMat' ? '#2B2620' : '#FFFFFF',
              color: viewMode === 'myMat' ? '#FAF6EE' : '#1E1B18',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={14} /> Meu Tapete
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('centerTable'); }}
            style={{
              padding: '8px 14px',
              background: viewMode === 'centerTable' ? '#2B2620' : '#FFFFFF',
              color: viewMode === 'centerTable' ? '#FAF6EE' : '#1E1B18',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} /> Visão da Mesa (Central)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('fullTable'); }}
            style={{
              padding: '8px 14px',
              background: viewMode === 'fullTable' ? '#2B2620' : '#FFFFFF',
              color: viewMode === 'fullTable' ? '#FAF6EE' : '#1E1B18',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} /> Panorama 6 Jogadores
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
              padding: '8px',
              background: '#FFFFFF',
              color: '#1E1B18',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
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
              maxWidth: '1240px',
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
