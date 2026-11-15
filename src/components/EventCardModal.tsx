import React from 'react';
import { EventCardData } from '../data/full24EventsData';
import { PlayerRoleId } from '../context/BoardGameContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedEvent, getLocalizedPlayerName } from '../i18n/cardTranslations';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface EventCardModalProps {
  isOpen: boolean;
  eventCard: EventCardData | null;
  onClose: () => void;
  resolutionSummary?: string | null;
  targetOptions?: { id: PlayerRoleId; name: string }[];
  onSelectTarget?: (targetId: PlayerRoleId) => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({
  isOpen,
  eventCard,
  onClose,
  resolutionSummary,
  targetOptions,
  onSelectTarget
}) => {
  const { language } = useLanguage();
  if (!isOpen || !eventCard) return null;

  const isPositive = eventCard.effectType === 'bounty' || eventCard.id === 'evt-08' || eventCard.id === 'evt-20' || eventCard.id === 'evt-23';
  const locEvent = getLocalizedEvent(eventCard, language);

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '480px',
          width: '92%',
          padding: '28px',
          textAlign: 'center',
          border: `2px solid ${isPositive ? '#00ff66' : '#ff334b'}`,
          boxShadow: `0 0 35px ${isPositive ? 'rgba(0, 255, 102, 0.35)' : 'rgba(255, 51, 75, 0.4)'}`,
          background: 'linear-gradient(180deg, #16101c 0%, #0d0f1a 100%)',
          position: 'relative'
        }}
      >
        <div
          style={{
            margin: '0 auto 12px',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isPositive ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 51, 75, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${isPositive ? '#00ff66' : '#ff334b'}`,
            fontSize: '34px'
          }}
        >
          {eventCard.icon || '🚨'}
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: isPositive ? '#00ff66' : '#ff5566',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            marginBottom: '6px'
          }}
        >
          🚨 {language === 'en' ? 'EVENT CARD ACTIVATED' : 'EVENT CARD ATIVADA'} • #{eventCard.number}
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#fff',
            fontFamily: 'monospace',
            margin: '0 0 4px 0'
          }}
        >
          {locEvent.name}
        </h2>

        <div
          style={{
            fontSize: '12px',
            color: '#00e5ff',
            fontFamily: 'monospace',
            marginBottom: '16px'
          }}
        >
          {eventCard.technicalReference}
        </div>

        {/* Target Badge */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255, 184, 0, 0.15)',
            border: '1px solid #ffb800',
            borderRadius: '20px',
            color: '#ffb800',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginBottom: '16px'
          }}
        >
          🎯 {language === 'en' ? 'TARGET:' : 'ALVO:'} {locEvent.targetText.toUpperCase()}
        </div>

        {/* Description Box */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '13.5px',
            lineHeight: '1.6',
            color: '#e5e7eb',
            marginBottom: '16px',
            textAlign: 'left'
          }}
        >
          {locEvent.description}
        </div>

        {/* Seletor Interativo de Alvo (quando o evento exige escolher 1 oponente) */}
        {targetOptions && targetOptions.length > 0 && onSelectTarget ? (
          <div
            style={{
              background: 'rgba(255, 184, 0, 0.12)',
              border: '1.5px solid #ffb800',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
              textAlign: 'left',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '900', color: '#ffb800', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} /> {language === 'en' ? 'CHOOSE TARGET OPPONENT ON TABLE:' : 'ESCOLHA O OPONENTE ALVO NA MESA:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetOptions.map(target => (
                <button
                  key={target.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTarget(target.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#1f2937',
                    color: '#fff',
                    border: '1.5px solid #ffb800',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: '900',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>🎯 {getLocalizedPlayerName(target.name, language)}</span>
                  <span style={{ color: '#ffb800', fontSize: '10.5px' }}>
                    {language === 'en' ? 'Apply Effect ➔' : 'Aplicar Efeito ➔'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {resolutionSummary && (
              <div
                style={{
                  background: isPositive ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 184, 0, 0.12)',
                  border: `1px solid ${isPositive ? '#00ff66' : '#ffb800'}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  lineHeight: '1.45',
                  color: isPositive ? '#86efac' : '#fde047',
                  fontFamily: 'monospace',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', marginBottom: '3px', letterSpacing: '1px' }}>
                  ⚡ {language === 'en' ? 'Effect Applied on Table:' : 'Resultado Aplicado na Mesa:'}
                </div>
                {resolutionSummary}
              </div>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: isPositive ? '#00ff66' : '#ff334b',
                color: isPositive ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '800',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={18} /> {language === 'en' ? 'CONTINUE MATCH' : 'CONTINUAR PARTIDA'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
