import React from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { X, DollarSign, Target, Plus, Minus, FileText } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onClose: () => void;
}

export const BountyLedgerModal: React.FC<Props> = ({ onClose }) => {
  const { bountyLedger, playerScore } = useBoardGame();

  // Reverse so newest is at the top
  const sortedLedger = [...bountyLedger].reverse();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="terminal-box"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '85vh',
          background: 'var(--bg-panel)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="var(--terminal-green)" />
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontFamily: 'var(--font-mono)' }}>EXTRATO DE PAYOUTS</h2>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--terminal-green)' }}>
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase' }}>Saldo Atual (Bounty Track)</span>
          <span style={{ color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: '900' }}>
            ${playerScore.toLocaleString('pt-BR')}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
          {sortedLedger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              Nenhuma transação financeira registrada até o momento.
            </div>
          ) : (
            sortedLedger.map((tx) => {
              const isPositive = tx.amount >= 0;
              return (
                <div key={tx.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        Ronda {tx.turn}
                      </span>
                      <span style={{ fontSize: '10px', background: tx.type === 'Penalty' ? 'rgba(248, 81, 73, 0.2)' : tx.type === 'Event' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: tx.type === 'Penalty' ? 'var(--alert-red)' : tx.type === 'Event' ? 'var(--electric-purple-light)' : 'var(--cyber-blue)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {tx.type}
                      </span>
                      <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{tx.description}</strong>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: isPositive ? 'var(--terminal-green)' : 'var(--alert-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isPositive ? <Plus size={14} /> : <Minus size={14} />}
                      ${Math.abs(tx.amount).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Matemática: </span>
                    {tx.mathBreakdown}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
