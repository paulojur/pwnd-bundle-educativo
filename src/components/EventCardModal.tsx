import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { EventCardData } from '../data/full24EventsData';

// Re-export EventCardData so existing imports of EventCardData from this file keep working
export type { EventCardData };

// Legacy list kept for any old code that imported EVENT_CARDS_LIST — now unused by engine
export const EVENT_CARDS_LIST: EventCardData[] = [];

interface EventTargetOption {
  id: string;
  name: string;
  archetypeName: string;
  score: number;
  handCount: number;
  exploitsCount: number;
}

interface EventCardModalProps {
  isOpen: boolean;
  eventCard: EventCardData | null;
  onClose: () => void;
  resolutionSummary?: string | null;
  targetOptions?: EventTargetOption[];
  onSelectTarget?: (targetPlayerId: string) => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({
  isOpen,
  eventCard,
  onClose,
  resolutionSummary,
  targetOptions,
  onSelectTarget
}) => {
  if (!isOpen || !eventCard) return null;

  const needsTargetChoice = targetOptions && targetOptions.length > 0 && !resolutionSummary;

  return (
    <div className="modal-overlay animate-glitch">
      <div
        className="terminal-box"
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '24px',
          textAlign: 'center',
          border: '2px solid var(--alert-red)',
          boxShadow: 'var(--glow-red)',
          background: 'linear-gradient(180deg, #2b0909 0%, #0d0f1a 100%)'
        }}
      >
        <div style={{ margin: '0 auto 12px', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(248, 81, 73, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--alert-red)' }}>
          <ShieldAlert size={32} color="var(--alert-red)" />
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--alert-red)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
          EVENT CARD ATIVADA (MANUAL V1.4 SEÇÃO 07) — #{eventCard.number}
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
          {eventCard.icon} {eventCard.name}
        </h3>

        {eventCard.targetText && (
          <div style={{ fontSize: '11px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '8px' }}>
            🎯 ALVO: {eventCard.targetText}
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--alert-red)', margin: '10px 0 14px', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
          {eventCard.simpleDescription}
        </div>

        {needsTargetChoice ? (
          <div style={{ margin: '12px 0 16px', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid var(--amber-glow)' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textAlign: 'center' }}>
              🎯 ESCOLHA O OPONENTE ALVO DESTE EVENTO:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetOptions!.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundFx.playClick();
                    if (onSelectTarget) onSelectTarget(opt.id);
                  }}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(248, 81, 73, 0.18)',
                    border: '1px solid var(--alert-red)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{opt.name} ({opt.archetypeName})</span>
                  <span style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                    💰 ${opt.score.toLocaleString('pt-BR')} | 🃏 {opt.handCount} | 💉 {opt.exploitsCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22c55e',
            borderRadius: '6px',
            padding: '10px 12px',
            margin: '10px 0 16px',
            fontSize: '11.5px',
            color: '#4ade80',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            textAlign: 'left',
            lineHeight: '1.45'
          }}>
            <div style={{ marginBottom: '4px', color: '#86efac', fontSize: '10px', textTransform: 'uppercase' }}>
              ⚡ Resultado Aplicado na Mesa:
            </div>
            <div>{resolutionSummary || 'Efeito processado e gravado no Log do Observador!'}</div>
          </div>
        )}

        {!needsTargetChoice && (
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{
              width: '100%',
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
            CONTINUAR PARTIDA
          </button>
        )}
      </div>
    </div>
  );
};
