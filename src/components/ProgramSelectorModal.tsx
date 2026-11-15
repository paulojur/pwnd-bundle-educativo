import React from 'react';
import { ProgramCard } from '../data/cardsData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedProgram, getLocalizedDynamicText } from '../i18n/cardTranslations';
import { Layers, Shuffle, ArrowRight, ShieldAlert, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ProgramSelectorModalProps {
  isOpen: boolean;
  marketPrograms: ProgramCard[];
  programDeckCount: number;
  isMandatory: boolean;
  reasonLabel?: string;
  duelRotationsRemaining?: number;
  onSelectExposedProgram: (program: ProgramCard) => void;
  onDrawSurpriseFromDeck: () => void;
  onRotateMarketProgram?: (programId: string) => void;
  onClose?: () => void;
}

export const ProgramSelectorModal: React.FC<ProgramSelectorModalProps> = ({
  isOpen,
  marketPrograms,
  programDeckCount,
  isMandatory,
  reasonLabel,
  duelRotationsRemaining = 0,
  onSelectExposedProgram,
  onDrawSurpriseFromDeck,
  onRotateMarketProgram,
  onClose
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const locale = language === 'en' ? 'en-US' : 'pt-BR';
  const defaultReason = language === 'en'
    ? 'Choose 1 of the 3 exposed Corporate Programs or draw 1 surprise target from the top of the Program Deck:'
    : 'Escolha 1 dos 3 Programas Corporativos expostos ou compre 1 alvo surpresa do topo do Program Deck:';
  const localizedReason = reasonLabel ? getLocalizedDynamicText(reasonLabel, language) : defaultReason;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FAF6EE',
          border: '3px solid #2B2620',
          borderRadius: '14px',
          padding: '24px',
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
              background: '#2B2620',
              color: '#FAF6EE',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'monospace',
              fontWeight: '800',
              fontSize: '11px'
            }}
          >
            <X size={14} /> {language === 'en' ? 'Cancel' : 'Cancelar'}
          </button>
        )}

        {/* HEADER */}
        <div style={{ borderBottom: '2px solid #2B2620', paddingBottom: '12px', marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B45309' }}>
            {isMandatory
              ? (language === 'en' ? '⚠️ MANDATORY TARGET SELECTION (OFFICIAL RULE V1.4)' : '⚠️ SELEÇÃO OBRIGATÓRIA DE NOVO ALVO (REGRA OFICIAL V1.4)')
              : (language === 'en' ? '🔄 RECON (1 AP) — SWITCH CORPORATE PROGRAM' : '🔄 RECON (1 AP) — TROCAR PROGRAMA CORPORATIVO')}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'monospace', margin: '4px 0', color: '#1E1B18' }}>
            {localizedReason}
          </h2>
          {duelRotationsRemaining > 0 && (
            <div style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', color: '#0369A1', marginTop: '4px' }}>
              ⚔️ {language === 'en'
                ? `Duel Mode (2 Players): You may rotate up to ${duelRotationsRemaining} exposed market program(s) before choosing!`
                : `Modo Duelo (2 Jogadores): Você pode rotacionar até ${duelRotationsRemaining} programa(s) exposto(s) antes de escolher!`}
            </div>
          )}
        </div>

        {/* 3 EXPOSED MARKET CARDS + 1 SURPRISE DECK CARD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px'
          }}
        >
          {marketPrograms.map((program, idx) => {
            const locProg = getLocalizedProgram(program, language);
            return (
              <div
                key={`${program.id}-${idx}`}
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
                    <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
                      {language === 'en' ? `EXPOSED #${idx + 1}` : `EXPOSTO #${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '900', background: '#FEF3C7', color: '#92400E', border: '1px solid #D97706', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {language === 'en' ? 'Bonus:' : 'Bônus:'} +${(program.flatBountyBonus || 0).toLocaleString(locale)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: '#1E1B18', margin: '4px 0 2px' }}>
                    {locProg.name}
                  </h3>
                  <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700', marginBottom: '8px' }}>
                    {locProg.companyType}
                  </div>

                  {/* ESCOPO */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {program.allowedClasses === 'ALL' || (Array.isArray(program.allowedClasses) && program.allowedClasses.some(c => String(c).includes('ALL'))) ? (
                      <span style={{ fontSize: '9px', fontWeight: '900', background: '#DCFCE7', color: '#166534', border: '1px solid #166534', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        🌐 {language === 'en' ? 'ALL CLASSES (ALL)' : 'TODAS AS CLASSES (ALL)'}
                      </span>
                    ) : (
                      Array.isArray(program.allowedClasses) && program.allowedClasses.map(cat => (
                        <span key={cat} style={{ fontSize: '9px', fontWeight: '900', background: '#E0F2FE', color: '#0369A1', border: '1px solid #0369A1', padding: '2px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                          {cat}
                        </span>
                      ))
                    )}
                  </div>

                  <p style={{ fontSize: '10.5px', color: '#4B4337', lineHeight: '1.35', margin: '0 0 10px 0' }}>
                    {locProg.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '8px', marginBottom: '8px', fontSize: '10px', fontFamily: 'monospace' }}>
                    <span style={{ fontWeight: '800', color: '#B91C1C' }}>
                      Patch: {locProg.patchSpeed}
                    </span>
                    {duelRotationsRemaining > 0 && onRotateMarketProgram && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onRotateMarketProgram(program.id);
                        }}
                        style={{
                          background: '#E0F2FE',
                          border: '1px solid #0284C7',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '9px',
                          fontWeight: '800',
                          color: '#0369A1',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={language === 'en' ? 'Duel Mode: Discard this program and reveal 1 new target from deck' : 'Modo Duelo: Descartar este programa e revelar 1 novo do deck'}
                      >
                        <RefreshCw size={10} /> {language === 'en' ? 'Rotate' : 'Rotacionar'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectExposedProgram(program);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: '1.5px solid #2B2620',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    {language === 'en' ? 'PICK EXPOSED' : 'PEGAR EXPOSTO'} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* OPÇÃO 4: COMPRAR SURPRESA DO TOPO DO PROGRAM DECK */}
          <div
            style={{
              background: 'linear-gradient(145deg, #2B2620 0%, #1E1B18 100%)',
              border: '2px dashed #F59E0B',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#FAF6EE',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '9.5px', fontWeight: '900', color: '#FCD34D', fontFamily: 'monospace' }}>
                  🎲 {language === 'en' ? 'TOP OF DECK (SURPRISE)' : 'TOPO DO DECK (SURPRESA)'}
                </span>
                <span style={{ fontSize: '9.5px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', border: '1px solid #F59E0B', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {programDeckCount} {language === 'en' ? 'in deck' : 'no baralho'}
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: '#FFFFFF', margin: '6px 0' }}>
                {language === 'en' ? 'Draw Closed Card from Program Deck' : 'Puxar Carta Fechada do Program Deck'}
              </h3>

              <p style={{ fontSize: '10.5px', color: '#D6CBB8', lineHeight: '1.4', margin: '8px 0' }}>
                {language === 'en'
                  ? 'Did not like the 3 exposed targets? Draw 1 surprise Corporate Program straight from the top of the Program Deck without altering the market!'
                  : 'Não gostou dos 3 alvos expostos? Puxe 1 Programa Corporativo surpresa diretamente do topo do Program Deck sem alterar os 3 abertos no mercado!'}
              </p>
            </div>

            <div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', marginBottom: '8px', fontSize: '10px', fontFamily: 'monospace', color: '#FCD34D', fontWeight: '800' }}>
                {language === 'en' ? 'Surprise Target • Keeps Market Intact' : 'Alvo Inédito • Mantém o Mercado'}
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onDrawSurpriseFromDeck();
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#F59E0B',
                  color: '#1E1B18',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Shuffle size={13} /> {language === 'en' ? 'DRAW FROM DECK (SURPRISE)' : 'COMPRAR DO DECK (SURPRESA)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
