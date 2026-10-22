import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { Search, Send, SkipForward, Award, Dices, UserCheck, Clock, FileText } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { BountyLedgerModal } from './BountyLedgerModal';

export const ActionPointsBar: React.FC = () => {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const {
    playerScore,
    isMyTurn,
    activePlayerRole,
    myRole,
    actionVarrer,
    actionReportar,
    triggerManualDiceRoll,
    endTurn,
    needsDiscard
  } = useBoardGame();

  return (
    <div style={{ marginBottom: '20px' }}>

      {/* TURN STATUS BANNER (Sua Vez vs Aguardando Oponente) */}
      <div
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isMyTurn ? 'linear-gradient(90deg, rgba(57, 211, 83, 0.15) 0%, rgba(57, 211, 83, 0.05) 100%)' : 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%)',
          border: isMyTurn ? '1px solid var(--terminal-green)' : '1px solid var(--cyber-blue)',
          boxShadow: isMyTurn ? 'var(--glow-green)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isMyTurn ? (
            <UserCheck size={22} color="var(--terminal-green)" />
          ) : (
            <Clock size={22} color="var(--cyber-blue)" className="animate-spin-slow" />
          )}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              REGRA OFICIAL (MANUAL V1.0): 1 AÇÃO POR TURNO
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: isMyTurn ? 'var(--terminal-green)' : 'var(--cyber-blue)', fontFamily: 'var(--font-mono)' }}>
              {isMyTurn ? '🟢 SUA VEZ! (Escolha 1 Ação e o Turno Passará Automático)' : `⏳ AGUARDANDO A JOGADA DO ${activePlayerRole === 'player-1' ? 'JOGADOR 1 (VERDE)' : 'JOGADOR 2 (AZUL)'}...`}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Você é: <strong style={{ color: myRole === 'player-1' ? 'var(--terminal-green)' : 'var(--cyber-blue)' }}>{myRole === 'player-1' ? 'Jogador 1 (Verde)' : 'Jogador 2 (Azul)'}</strong>
        </div>
      </div>

      {/* Main Controls Box */}
      <div className="terminal-box" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', opacity: isMyTurn ? 1 : 0.65 }}>

        {/* Total Score & Rule Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(57, 211, 83, 0.1)', border: '1px solid var(--terminal-green)', borderRadius: 'var(--radius-md)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="var(--terminal-green)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Pontuação Total
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)' }}>
                  {playerScore} pts
                </div>
                <button
                  onClick={() => { soundFx.playClick(); setIsLedgerOpen(true); }}
                  title="Ver Extrato de Payouts"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    color: 'var(--terminal-green)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold'
                  }}
                >
                  <FileText size={12} /> EXTRATO
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
            Ações no Turno: <strong style={{ color: 'var(--amber-glow)' }}>[ RECON ]</strong> ou <strong style={{ color: 'var(--amber-glow)' }}>[ EXPLOIT ]</strong> ou <strong style={{ color: 'var(--amber-glow)' }}>[ REPORT ]</strong>
          </div>
        </div>

        {/* Action Buttons (1 Ação Única Por Turno) */}
        <div className="action-bar-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', opacity: needsDiscard ? 0.3 : 1, pointerEvents: needsDiscard ? 'none' : 'auto' }}>
          {needsDiscard && (
            <div style={{ position: 'absolute', background: 'rgba(248, 81, 73, 0.9)', color: '#fff', padding: '10px 20px', borderRadius: '8px', zIndex: 10, left: '50%', transform: 'translateX(-50%)', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              ⚠️ LIMITE DE MÃO EXCEDIDO: Descarte cartas primeiro!
            </div>
          )}
          {/* Varrer / Recon (1 Ação) */}
          <button
            onClick={() => { soundFx.playClick(); actionVarrer(); }}
            disabled={!isMyTurn || needsDiscard}
            style={{
              padding: '10px 18px',
              background: isMyTurn ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.06)',
              color: isMyTurn ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: isMyTurn && !needsDiscard ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={16} /> Varrer / Recon (1 Ação)
          </button>

          {/* Reportar vulnerabilidades (1 Ação) */}
          <button
            onClick={() => { soundFx.playClick(); actionReportar(); }}
            disabled={!isMyTurn || needsDiscard}
            style={{
              padding: '10px 18px',
              background: isMyTurn ? 'var(--terminal-green)' : 'rgba(255,255,255,0.06)',
              color: isMyTurn ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: isMyTurn && !needsDiscard ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} /> Reportar vulnerabilidades (1 Ação)
          </button>

          {/* Botão de Teste do Dado D6 3D */}
          <button
            onClick={() => { soundFx.playClick(); triggerManualDiceRoll(); }}
            disabled={needsDiscard}
            style={{
              padding: '10px 18px',
              background: 'var(--electric-purple)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: needsDiscard ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--glow-purple)'
            }}
          >
            <Dices size={16} /> Testar Dado D8
          </button>

          {/* Passar Turno (Manual) */}
          <button
            onClick={() => { soundFx.playClick(); endTurn(); }}
            disabled={!isMyTurn || needsDiscard}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: isMyTurn ? '#fff' : 'var(--text-muted)',
              border: isMyTurn ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: isMyTurn && !needsDiscard ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SkipForward size={16} /> Passar Turno
          </button>
        </div>
      </div>
      {isLedgerOpen && <BountyLedgerModal onClose={() => setIsLedgerOpen(false)} />}
    </div>
  );
};
