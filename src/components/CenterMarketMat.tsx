import React from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { ProgramCard } from '../data/cardsData';
import { Layers, ShieldAlert, AlertTriangle, ArrowRight, Dices } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CenterMarketMatProps {
  totalRounds?: number;
  selectedProgramId?: string;
  onSelectProgram?: (program: ProgramCard) => void;
}

export const CenterMarketMat: React.FC<CenterMarketMatProps> = ({
  totalRounds = 8,
  selectedProgramId,
  onSelectProgram
}) => {
  const { programMarket, playerActiveProgram, selectNewProgram, drawEventCard, mainDeckCount, eventDeckCount, programDeckCount, currentTurn } = useBoardGame();
  
  const currentRound = currentTurn || 1;

  const isPendingProgram = playerActiveProgram === null;

  return (
    <div className="playmat-container playmat-center" style={{ padding: '24px', width: '100%', marginBottom: '24px' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyber-blue)', letterSpacing: '4px', textTransform: 'uppercase' }}>
          CENTER MARKET PLAYMAT
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
          PROGRAM MARKET & EVENT HUB
        </h2>
      </div>

      {/* 1. PROGRAM MARKET SLOTS (3 Programas Ativos no Mercado Dinâmico) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', fontSize: '11px', color: isPendingProgram ? 'var(--terminal-green)' : 'var(--amber-glow)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          {isPendingProgram ? '👉 CLIQUE EM UMA DAS CARTAS ABAIXO PARA PEGAR PARA SEU TAPETE! 👈' : '— PROGRAM MARKET (3 ALVOS ABERTOS NO TABULEIRO CENTRAL) —'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {programMarket.map(program => {
            const isSelected = playerActiveProgram && program.id === playerActiveProgram.id;

            return (
              <div
                key={program.id}
                onClick={() => {
                  soundFx.playClick();
                  selectNewProgram(program);
                  if (onSelectProgram) onSelectProgram(program);
                }}
                style={{
                  background: isPendingProgram ? 'linear-gradient(145deg, #0f3020 0%, #15273b 100%)' : 'linear-gradient(145deg, #0d1e2e 0%, #15273b 100%)',
                  border: isSelected ? '2px solid var(--amber-glow)' : isPendingProgram ? '2px solid var(--terminal-green)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? 'var(--glow-amber)' : isPendingProgram ? 'var(--glow-green)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {program.companyType}
                    </span>
                    <span style={{ fontSize: '9px', background: 'rgba(240,136,62,0.2)', color: 'var(--amber-glow)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {program.bountyRange}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                    {program.name}
                  </h3>

                  {/* SCOPE MATCH BADGES */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {program.allowedClasses === 'ALL' ? (
                      <span style={{ fontSize: '8px', fontWeight: '800', background: 'rgba(57,211,83,0.2)', color: 'var(--terminal-green)', border: '1px solid var(--terminal-green)', padding: '1px 5px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                        🌐 ESCOPO AMPLO (TODAS AS CARTAS)
                      </span>
                    ) : (
                      Array.isArray(program.allowedClasses) && program.allowedClasses.map(cat => {
                        const isInj = cat.toLowerCase().includes('inj');
                        const isBac = cat.toLowerCase().includes('access');
                        const isAuth = cat.toLowerCase().includes('auth');
                        const isCrypto = cat.toLowerCase().includes('crypto');
                        const isSsrf = cat.toLowerCase().includes('ssrf');
                        const isLogic = cat.toLowerCase().includes('logic');
                        const isXss = cat.toLowerCase().includes('scripting') || cat.toLowerCase().includes('xss');

                        const badgeColor = isInj ? '#f0883e' : isBac ? '#c084fc' : isAuth ? '#eab308' : isCrypto ? '#39d353' : isSsrf ? '#38bdf8' : isXss ? '#f472b6' : '#2dd4bf';
                        const badgeLabel = isInj ? '💉 INJ' : isBac ? '🚪 BAC' : isAuth ? '🔑 AUTH' : isCrypto ? '🔒 CRYPTO' : isSsrf ? '🕵️ SSRF' : isXss ? '🪞 XSS' : '⏰ LOGIC';

                        return (
                          <span key={cat} style={{ fontSize: '8px', fontWeight: '800', background: `${badgeColor}25`, color: badgeColor, border: `1px solid ${badgeColor}`, padding: '1px 4px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                            {badgeLabel}
                          </span>
                        );
                      })
                    )}
                  </div>

                  <p style={{ fontSize: '9.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    {program.description}
                  </p>
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)' }}>
                    Patch: {program.patchSpeed}
                  </span>
                  <span style={{ fontSize: '10px', color: isPendingProgram ? 'var(--terminal-green)' : 'var(--cyber-blue)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isSelected ? '✓ ATIVO' : 'CLIQUE P/ PEGAR'} <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LOWER SECTION: EVENT DECK, ROUND TRACK & SEVERITY LEGEND */}
      <div className="responsive-col-3-to-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
        
        {/* EVENT DECK (INTERATIVO - CLIQUE PARA PUXAR EVENT CARD) */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {/* Deck Pile */}
          <div
            onClick={drawEventCard}
            title="Clique para puxar uma Event Card do Baralho de Caos!"
            className="playmat-slot"
            style={{
              width: '105px',
              height: '110px',
              border: '2px solid var(--alert-red)',
              boxShadow: '0 0 15px rgba(248, 81, 73, 0.4)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              background: 'linear-gradient(180deg, #300a0a 0%, #150505 100%)'
            }}
          >
            <span style={{ fontSize: '22px', marginBottom: '2px' }}>🚨</span>
            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--alert-red)', fontFamily: 'var(--font-mono)' }}>
              EVENT DECK
            </span>
            <span style={{ fontSize: '11px', color: '#fff', background: 'rgba(248,81,73,0.35)', padding: '1px 5px', borderRadius: '3px', marginTop: '2px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              {eventDeckCount} cartas
            </span>
          </div>

          {/* Discard Pile — Main Deck count */}
          <div className="playmat-slot" style={{ width: '90px', height: '110px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              MAIN DECK
            </span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: mainDeckCount > 20 ? 'var(--terminal-green)' : mainDeckCount > 5 ? 'var(--amber-glow)' : 'var(--alert-red)', fontFamily: 'var(--font-mono)' }}>
              {mainDeckCount}
            </span>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>cartas</span>
          </div>
        </div>

        {/* ROUND TRACKER (1 a 8) */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--terminal-green)', fontWeight: '700', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            ROUND TRACK
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
              const isCurrent = round === currentRound;
              return (
                <div
                  key={round}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isCurrent ? 'var(--terminal-green)' : 'rgba(255,255,255,0.05)',
                    color: isCurrent ? '#000' : 'var(--text-secondary)',
                    border: isCurrent ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: isCurrent ? 'var(--glow-green)' : 'none'
                  }}
                >
                  {round}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEVERITY & BOUNTY LEGEND TABLE */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '9px', textTransform: 'uppercase', marginBottom: '6px' }}>
            TABELA DE RECOMPENSAS (BASE):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>⚪ Comum</span> <span>+$1.500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--terminal-green)' }}>
              <span>🟢 Incomum</span> <span>+$2.500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyber-blue)' }}>
              <span>🔵 Rara</span> <span>+$4.000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--electric-purple-light)' }}>
              <span>🟣 Épica</span> <span>+$5.000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--amber-glow)' }}>
              <span>🟡 Lendária</span> <span>+$6.000</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
