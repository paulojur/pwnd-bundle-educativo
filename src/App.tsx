import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { ArchetypeSelector } from './components/ArchetypeSelector';
import { GameBoard } from './components/GameBoard';
import { Hand } from './components/Hand';
import { PatchModal } from './components/PatchModal';
import { TerminalLog } from './components/TerminalLog';
import { BoardGameMain } from './components/BoardGameMain';
import { LanguageProvider } from './i18n/LanguageContext';
import { Trophy, RefreshCw, Layers } from 'lucide-react';
import { soundFx } from './utils/audio';

const CardGameContent: React.FC<{ onSwitchToBoardGame: () => void }> = ({ onSwitchToBoardGame }) => {
  const { archetype, chooseArchetype, gameWinner, resetGame, playerBountyTotal } = useGame();
  const [terminalOpen, setTerminalOpen] = useState<boolean>(true);

  if (!archetype) {
    return <ArchetypeSelector onSelect={chooseArchetype} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Top Banner to Switch to Board Game Mode */}
      <div className="top-banner-responsive" style={{ background: 'linear-gradient(90deg, rgba(123, 47, 190, 0.2), rgba(240, 136, 62, 0.2))', border: '1px solid var(--amber-glow)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff', fontFamily: 'var(--font-mono)' }}>
          <Layers size={18} color="var(--amber-glow)" />
          <span>Experimente a nova versão: <strong>PWND! Board Game Edition (v2.0)</strong> com tabuleiro e nomes leigos!</span>
        </div>
        <button
          onClick={onSwitchToBoardGame}
          style={{
            padding: '6px 12px',
            background: 'var(--amber-glow)',
            color: '#000',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer'
          }}
        >
          Jogar Board Game v2.0 🎲
        </button>
      </div>

      <Header toggleTerminal={() => setTerminalOpen(!terminalOpen)} terminalOpen={terminalOpen} />
      
      <main>
        <GameBoard />
        <Hand />
      </main>

      <PatchModal />
      <TerminalLog isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />

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
              Você faturou um total de <strong style={{ color: 'var(--terminal-green)' }}>${playerBountyTotal.toLocaleString('pt-BR')}</strong> em recompensas!
            </p>

            <button
              onClick={() => {
                soundFx.playClick();
                resetGame();
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

export function App() {
  return (
    <LanguageProvider>
      <BoardGameMain />
    </LanguageProvider>
  );
}

export default App;
