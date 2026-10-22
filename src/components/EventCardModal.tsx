import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { EventCardData } from '../data/full24EventsData';

// Re-export EventCardData so existing imports of EventCardData from this file keep working
export type { EventCardData };

// Legacy list kept for any old code that imported EVENT_CARDS_LIST — now unused by engine
export const EVENT_CARDS_LIST: EventCardData[] = [];

interface EventCardModalProps {
  isOpen: boolean;
  eventCard: EventCardData | null;
  onClose: () => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({ isOpen, eventCard, onClose }) => {
  if (!isOpen || !eventCard) return null;

  return (
    <div className="modal-overlay animate-glitch">
      <div
        className="terminal-box"
        style={{
          maxWidth: '480px',
          width: '90%',
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
          EVENT CARD ATIVADA (MANUAL V1.1 SEÇÃO 09) — #{eventCard.number}
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
          {eventCard.icon} {eventCard.name}
        </h3>

        {eventCard.targetText && (
          <div style={{ fontSize: '11px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '8px' }}>
            🎯 ALVO: {eventCard.targetText}
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--alert-red)', margin: '16px 0', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
          {eventCard.simpleDescription}
        </div>

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
          RESOLVER EVENTO E CONTINUAR
        </button>
      </div>
    </div>
  );
};
