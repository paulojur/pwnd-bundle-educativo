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
import { ARCHETYPES, PROGRAM_CARDS, ProgramCard } from '../data/cardsData';
import { Layers, RefreshCw, Eye, Users, ShieldAlert, Globe, Printer, BookOpen, Trophy, Home } from 'lucide-react';
import { soundFx } from '../utils/audio';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
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
      return <div style={{padding: '20px', color: 'red', background: 'black', border: '1px solid red'}}>Erro ao renderizar componente. Feche e abra novamente.</div>;
    }
    return this.props.children;
  }
}

const BoardGameContent: React.FC = () => {
  const {
    bountyTotalCash,
    gameWinner,
    playerHand,
    playerActiveTools,
    playerActiveProgram,
    playerArchetype,
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

  const [viewMode, setViewMode] = useState<'myMat' | 'fullTable'>('myMat');
  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState<boolean>(false);
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
    playerName: myRole === 'player-1' ? 'Jogador 1 (Você - Verde)' : 'Jogador 2 (Você - Azul)',
    playerColor: myRole === 'player-1' ? 'var(--player-1-green)' : 'var(--player-2-blue)',
    archetype: playerArchetype,
    currentProgram: currentDisplayProgram,
    bountyTotal: bountyTotalCash,
    hand: playerHand,
    activeTools: playerActiveTools,
    activeExploits: myExploitsCards,
    hasDefuse: playerHand.some(c => c.name === 'Cofre 0-Day'),
    isCurrentTurnPlayer: isMyTurn
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
      <header className="terminal-box" style={{ padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--amber-glow)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-amber)' }}>
            <Layers size={22} color="#000" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber-glow)', letterSpacing: '3px', textTransform: 'uppercase' }}>
              PWND! Board Game Edition {roomCode ? `[SALA: ${roomCode}]` : ''}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: '1' }}>
              PWND! Tabletop
            </h1>
          </div>
        </div>

        {/* View Mode Toggle Buttons, Print & Play & Multiplayer Lobby Button */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { soundFx.playClick(); window.location.href = '/'; }}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '900',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Home size={15} /> Início
          </button>
          <button
            onClick={() => { soundFx.playClick(); window.open('/pwnd-manual.html', '_blank'); }}
            style={{
              padding: '8px 14px',
              background: 'var(--amber-glow)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '900',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(240,136,62,0.4)'
            }}
          >
            <BookOpen size={15} /> 📖 Manual de Regras (HTML)
          </button>

          {isLocalhost && (
            <button
              onClick={() => { soundFx.playClick(); setPrintModalOpen(true); }}
              style={{
                padding: '8px 14px',
                background: 'var(--terminal-green)',
                color: '#000',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--glow-green)'
              }}
            >
              <Printer size={15} /> 🖨️ Print & Play (Papel)
            </button>
          )}

          <button
            onClick={() => { soundFx.playClick(); setMultiplayerModalOpen(true); }}
            style={{
              padding: '8px 14px',
              background: 'var(--cyber-blue)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={15} /> Mesa 2 Jogadores
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('myMat'); }}
            style={{
              padding: '8px 14px',
              background: viewMode === 'myMat' ? 'var(--amber-glow)' : 'rgba(255,255,255,0.06)',
              color: viewMode === 'myMat' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={15} /> Meu Tapete
          </button>

          <button
            onClick={() => { soundFx.playClick(); setViewMode('fullTable'); }}
            style={{
              padding: '8px 14px',
              background: viewMode === 'fullTable' ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.06)',
              color: viewMode === 'fullTable' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={15} /> Visão da Mesa (6 Jogadores)
          </button>



          <button
            onClick={() => { soundFx.playClick(); resetBoardGame(); }}
            title="Reiniciar Tabuleiro"
            style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* RENDER VIEW MODE */}
      {viewMode === 'fullTable' ? (
        <FullTableView
          humanPlayerData={humanPlayerData}
          onFocusMyMat={() => setViewMode('myMat')}
        />
      ) : (
        <>
          {/* Action Points Bar */}
          <ActionPointsBar />

          {/* Center Market Mat (Imagem 3) */}
          <CenterMarketMat
            currentRound={currentTurn}
            totalRounds={8}
            selectedProgramId={playerActiveProgram?.id}
            onSelectProgram={selectNewProgram}
          />

          {/* Individual Player Mat (Imagem 1) */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: myRole === 'player-1' ? 'var(--terminal-green)' : 'var(--cyber-blue)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            — SEU TAPETE INDIVIDUAL ({myRole === 'player-1' ? 'PLAYER MAT 1 - VERDE' : 'PLAYER MAT 2 - AZUL'}) —
          </div>
          
          <PlayerMat
            playerData={humanPlayerData}
            onExploitSelect={(card) => {
              if (card.type === 'exploit') {
                actionInfiltrar(card.id);
              }
            }}
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

      {/* MODAL OBRIGATÓRIO DO DADO D8 DE PATCH SPEED */}
      {isDiceModalOpen && (
        <DiceRoller
          programName={currentDisplayProgram.name}
          patchSpeed={currentDisplayProgram.patchSpeed}
          requiredRollText={
            currentDisplayProgram.patchSpeed.includes('Lenta') ? '8 (12,5% risco)' :
            currentDisplayProgram.patchSpeed.includes('Moderada') ? '7 ou 8 (25% risco)' :
            currentDisplayProgram.patchSpeed.includes('Rápida') ? '6, 7 ou 8 (37,5% risco)' : '5, 6, 7 ou 8 (50% risco)'
          }
          isRound8={currentTurn >= 8}
          stealthMode={diceRollReason === 'endTurn'}
          onRollComplete={handleDiceRollResult}
        />
      )}

      {/* Patch Alert Modal */}
      {patchAlertModal && (
        <div className="modal-overlay animate-glitch">
          <div className="terminal-box" style={{ maxWidth: '480px', width: '90%', padding: '24px', textAlign: 'center', border: '2px solid var(--alert-red)', boxShadow: 'var(--glow-red)', background: 'linear-gradient(180deg, #2b0909 0%, #0d0f1a 100%)' }}>
            <div style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(248, 81, 73, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--alert-red)' }}>
              <ShieldAlert size={32} color="var(--alert-red)" />
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--alert-red)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
              FIREWALL ATIVADO
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              ALERTA MÁXIMO EM {alertServerName?.toUpperCase() || 'PRODUÇÃO'}!
            </h2>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              O sistema acionou a correção de emergência! O firewall foi atualizado e limpará os exploits expostos sem proteção.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => { soundFx.playClick(); defusePatch(); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--terminal-green)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Usar Cofre 0-Day
              </button>

              <button
                onClick={() => { soundFx.playClick(); acceptPatch(); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--alert-red)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Aceitar Reset do Servidor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal Overlay */}
      {gameWinner && (
        <div className="modal-overlay">
          <div className="terminal-box" style={{ maxWidth: '480px', width: '90%', padding: '32px', textAlign: 'center', border: '2px solid var(--terminal-green)', boxShadow: 'var(--glow-green)' }}>
            <div style={{ margin: '0 auto 16px', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(57, 211, 83, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--terminal-green)' }}>
              <Trophy size={40} color="var(--terminal-green)" />
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--terminal-green)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '4px' }}>
              HALL OF FAME CHAMPION
            </div>

            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>
              PWND! VOCÊ VENCEU!
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Você faturou um total de <strong style={{ color: 'var(--terminal-green)' }}>${bountyTotalCash.toLocaleString('pt-BR')}</strong> em recompensas!
            </p>

            <button
              onClick={() => {
                soundFx.playClick();
                resetBoardGame();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--terminal-green)',
                color: '#000',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Jogar Novamente
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
