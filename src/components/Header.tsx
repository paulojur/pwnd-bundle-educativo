import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RulebookHelpModal } from './RulebookHelpModal';
import { ShieldAlert, Terminal, RefreshCw, Layers, DollarSign, Award, BookOpen } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  toggleTerminal: () => void;
  terminalOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleTerminal, terminalOpen }) => {
  const { archetype, playerBountyTotal, deck, turnNumber, currentProgram, resetGame } = useGame();
  const [rulebookOpen, setRulebookOpen] = useState<boolean>(false);

  return (
    <>
      <header className="terminal-box" style={{ padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--electric-purple)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-purple)' }}>
            <ShieldAlert size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--cyber-blue)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
              The Bug Bounty Chaos
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', lineHeight: '1', margin: '0 0 3px 0' }}>
              PWNED!
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Find it. Report it. Get paid.
            </div>
          </div>
        </div>

        {/* Archetype & Target Program Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {archetype && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '18px' }}>{archetype.avatarIcon}</span>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pesquisador</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: archetype.color, fontFamily: 'var(--font-mono)' }}>
                  {archetype.name}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(240, 136, 62, 0.08)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(240, 136, 62, 0.3)' }}>
            <Layers size={16} color="var(--amber-glow)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Alvo Corporativo</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)' }}>
                {currentProgram.name}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Total ($) & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Bounty Total */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, rgba(57, 211, 83, 0.15), rgba(57, 211, 83, 0.05))', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--terminal-green)', boxShadow: 'var(--glow-green)' }}>
            <DollarSign size={20} color="var(--terminal-green)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Bounty Acumulado
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)' }}>
                ${playerBountyTotal.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Turn & Deck count */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} color="var(--electric-purple-light)" />
              <span>Rodada: <strong style={{ color: '#fff' }}>{turnNumber} / 10</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} color="var(--cyber-blue)" />
              <span>Deck: <strong style={{ color: '#fff' }}>{deck.length}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { soundFx.playClick(); setRulebookOpen(true); }}
              style={{
                background: 'var(--cyber-blue)',
                color: '#000',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <BookOpen size={15} />
              Manual v1.0
            </button>

            <button
              onClick={() => { soundFx.playClick(); toggleTerminal(); }}
              style={{
                background: terminalOpen ? 'var(--electric-purple)' : 'rgba(255, 255, 255, 0.06)',
                color: '#fff',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Terminal size={15} />
              Logs
            </button>

            <button
              onClick={() => { soundFx.playClick(); resetGame(); }}
              title="Reiniciar Partida"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Manual Modal */}
      <RulebookHelpModal isOpen={rulebookOpen} onClose={() => setRulebookOpen(false)} />
    </>
  );
};
