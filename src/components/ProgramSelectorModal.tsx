import React from 'react';
import { ProgramCard } from '../data/cardsData';
import { Layers, ArrowRight, Shuffle, Sparkles, RefreshCw, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ProgramSelectorModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  reasonLabel?: string;
  marketPrograms: ProgramCard[];
  programDeckCount: number;
  duelRotationsRemaining?: number;
  onSelectExposedProgram: (program: ProgramCard) => void;
  onDrawSurpriseFromDeck: () => void;
  onRotateMarketProgram?: (programId: string) => void;
  onClose?: () => void;
}

export const ProgramSelectorModal: React.FC<ProgramSelectorModalProps> = ({
  isOpen,
  isMandatory = true,
  reasonLabel,
  marketPrograms,
  programDeckCount,
  duelRotationsRemaining = 0,
  onSelectExposedProgram,
  onDrawSurpriseFromDeck,
  onRotateMarketProgram,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        padding: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '940px',
          width: '96%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          background: '#FAF6EE',
          border: '3px solid #2B2620',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          color: '#1E1B18',
          position: 'relative'
        }}
      >
        {!isMandatory && onClose && (
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#FEE2E2',
              border: '1.5px solid #B91C1C',
              color: '#B91C1C',
              borderRadius: '6px',
              padding: '4px 10px',
              fontFamily: 'monospace',
              fontWeight: '900',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={14} /> Cancelar
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#B45309', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '900' }}>
            {reasonLabel || (isMandatory ? '🎯 SELEÇÃO OBRIGATÓRIA DE NOVO PROGRAMA (GRÁTIS)' : '🔄 RECON: TROCAR PROGRAMA ATIVO (CUSTA 1 AP)')}
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', margin: '4px 0 6px' }}>
            Escolha 1 dos 3 Programas Expostos OU Compre 1 Surpresa do Deck
          </h3>
          <p style={{ fontSize: '12px', color: '#5A5245', margin: 0, fontFamily: 'monospace' }}>
            {isMandatory
              ? 'Nenhum jogador fica sem alvo ativo: escolha um programa abaixo para assumir no seu tapete e concluir a ação.'
              : 'Trocar voluntariamente de programa custa 1 Ação (RECON) e descarta as vulnerabilidades da sua Zona de Exploits.'}
          </p>

          {duelRotationsRemaining > 0 && (
            <div style={{ marginTop: '10px', display: 'inline-block', background: '#FEF3C7', border: '1.5px solid #D97706', color: '#92400E', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', fontWeight: '800' }}>
              ⚔️ Modo Duelo (2 Jogadores): Você pode descartar e rotacionar até {duelRotationsRemaining} programa(s) exposto(s) antes de escolher!
            </div>
          )}
        </div>

        {/* 3 PROGRAMAS EXPOSTOS NO MERCADO + 1 CARTA FECHADA DO TOPO DO DECK */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))',
            gap: '14px'
          }}
        >
          {marketPrograms.map((prog, idx) => (
            <div
              key={`${prog.id}-${idx}`}
              style={{
                background: '#FFFFFF',
                border: '2px solid #2B2620',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
                    EXPOSTO #{idx + 1}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '900', background: '#FEF3C7', color: '#92400E', border: '1px solid #D97706', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    Bônus: {prog.bountyRange || '+$0'}
                  </span>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', margin: '4px 0 2px' }}>
                  {prog.name}
                </h4>
                <div style={{ fontSize: '9.5px', color: '#685F53', marginBottom: '8px', fontFamily: 'monospace' }}>
                  {prog.companyType}
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {prog.allowedClasses === 'ALL' || (Array.isArray(prog.allowedClasses) && prog.allowedClasses.some(c => String(c).includes('ALL'))) ? (
                    <span style={{ fontSize: '8.5px', fontWeight: '800', background: '#DCFCE7', color: '#166534', border: '1px solid #166534', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                      🌐 TODAS AS CLASSES (ALL)
                    </span>
                  ) : (
                    Array.isArray(prog.allowedClasses) && prog.allowedClasses.map(cat => (
                      <span key={cat} style={{ fontSize: '8px', fontWeight: '800', background: '#E0F2FE', color: '#0369A1', border: '1px solid #0369A1', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                        {cat}
                      </span>
                    ))
                  )}
                </div>

                <p style={{ fontSize: '10.5px', color: '#4B4337', lineHeight: '1.35', margin: '0 0 10px 0' }}>
                  {prog.description}
                </p>
              </div>

              <div>
                <div style={{ borderTop: '1px solid #E2D7C5', paddingTop: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#B91C1C', fontFamily: 'monospace' }}>
                    Patch: {prog.patchSpeed}
                  </span>
                  {duelRotationsRemaining > 0 && onRotateMarketProgram && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onRotateMarketProgram(prog.id);
                      }}
                      style={{
                        padding: '3px 7px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #D97706',
                        borderRadius: '4px',
                        fontSize: '8.5px',
                        fontWeight: '800',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Modo Duelo: Descartar este programa exposto e revelar outro do deck"
                    >
                      <RefreshCw size={10} /> Rotacionar
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectExposedProgram(prog);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: '1.5px solid #2B2620',
                    borderRadius: '6px',
                    fontSize: '10.5px',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  PEGAR EXPOSTO <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* CARD DE COMPRA SURPRESA DO TOPO DO PROGRAM DECK */}
          <div
            style={{
              background: 'linear-gradient(145deg, #1E1B18 0%, #3A3228 100%)',
              border: '2.5px dashed #F59E0B',
              borderRadius: '10px',
              padding: '14px',
              color: '#FAF6EE',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#FCD34D', fontFamily: 'monospace' }}>
                  PROGRAM DECK
                </span>
                <span style={{ fontSize: '10px', fontWeight: '900', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', border: '1px solid #F59E0B', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {programDeckCount} no baralho
                </span>
              </div>

              <div style={{ textAlign: 'center', margin: '18px 0 12px' }}>
                <div style={{ fontSize: '34px', marginBottom: '6px' }}>🎲</div>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'monospace', margin: '0 0 6px' }}>
                  TOPO DO DECK (SURPRESA)
                </h4>
                <p style={{ fontSize: '10.5px', color: '#D6CBB8', lineHeight: '1.4', margin: 0 }}>
                  Não gostou dos 3 alvos expostos na mesa? Tente a sorte puxando a carta fechada do topo do Program Deck!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onDrawSurpriseFromDeck();
              }}
              style={{
                width: '100%',
                padding: '9px 10px',
                background: '#F59E0B',
                color: '#1E1B18',
                border: '1.5px solid #FFFFFF',
                borderRadius: '6px',
                fontSize: '10.5px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Shuffle size={12} /> COMPRAR DO DECK (SURPRESA)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
