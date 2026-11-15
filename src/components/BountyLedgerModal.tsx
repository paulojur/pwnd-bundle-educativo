import React from 'react';
import { BountyTransaction } from '../context/BoardGameContext';
import { useLanguage } from '../i18n/LanguageContext';
import { DollarSign, Award, X, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BountyLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: BountyTransaction[];
  totalCash: number;
}

export const BountyLedgerModal: React.FC<BountyLedgerModalProps> = ({
  isOpen,
  onClose,
  ledger,
  totalCash
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const locale = language === 'en' ? 'en-US' : 'pt-BR';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '580px',
          width: '94%',
          padding: '24px',
          border: '2px solid var(--accent, #00ff66)',
          boxShadow: '0 0 30px rgba(0, 255, 102, 0.2)',
          background: '#0d0f1a'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} color="#00ff66" />
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#00ff66', letterSpacing: '3px', textTransform: 'uppercase' }}>
                {language === 'en' ? 'PAYOUT STATEMENT & BOUNTY TRACK' : 'EXTRATO DE PAYOUTS & BOUNTY TRACK'}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', margin: 0 }}>
                Bounty Ledger
              </h2>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Card */}
        <div
          style={{
            background: 'rgba(0, 255, 102, 0.08)',
            border: '1px solid #00ff66',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              {language === 'en' ? 'Current Balance (Bounty Track)' : 'Saldo Atual (Bounty Track)'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#00ff66', fontFamily: 'monospace' }}>
              ${totalCash.toLocaleString(locale)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#ffb800', fontFamily: 'monospace', fontWeight: 'bold' }}>
              <Award size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {language === 'en' ? 'Victory Goal: $40,000' : 'Meta de Vitória: $40.000'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', fontFamily: 'monospace' }}>
              {Math.min(100, Math.round((totalCash / 40000) * 100))}% {language === 'en' ? 'of track completed' : 'da trilha concluída'}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '4px'
          }}
        >
          {ledger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              {language === 'en'
                ? 'No financial transactions recorded yet. Execute "Report (2 AP)" on a target with armed vulnerabilities to receive your first Payout!'
                : 'Nenhuma transação financeira registrada ainda. Execute "Reportar (2 AP)" em um alvo com vulnerabilidades armadas para receber seu primeiro Payout!'}
            </div>
          ) : (
            ledger.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '3px solid #00ff66',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color={tx.amount >= 0 ? '#00ff66' : '#ef4444'} />
                    <strong style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}>
                      {tx.description}
                    </strong>
                    <span style={{ fontSize: '10px', color: '#9ca3af', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {language === 'en' ? 'Round' : 'Rodada'} #{tx.turn}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#00e5ff', fontFamily: 'monospace', marginTop: '4px' }}>
                    {tx.type}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>
                    {language === 'en' ? 'Breakdown:' : 'Matemática:'} {tx.mathBreakdown}
                  </div>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '900', color: tx.amount >= 0 ? '#00ff66' : '#ef4444', fontFamily: 'monospace' }}>
                  {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(locale)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
