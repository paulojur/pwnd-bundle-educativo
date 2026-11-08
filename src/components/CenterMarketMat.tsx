import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { ProgramCard } from '../data/cardsData';
import { Layers, ShieldAlert, ArrowRight, Wrench, AlertTriangle, Trophy, Eye, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { BOUNTY_MILESTONES, BountyMilestone } from '../utils/gameRulesV14';

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
  const {
    programMarket,
    playerActiveProgram,
    selectNewProgram,
    drawEventCard,
    mainDeckCount,
    toolDeckCount,
    eventDeckCount,
    currentTurn,
    playerScore,
    myRole,
    activePlayerRole,
    allPlayers,
    playerCount
  } = useBoardGame();

  const [activeMilestoneModal, setActiveMilestoneModal] = useState<BountyMilestone | null>(null);
  const currentRound = currentTurn || 1;
  const isPendingProgram = playerActiveProgram === null;
  const currentCash = playerScore || 0;

  // Trilha de 0 a 40.000 em passos de 500
  const trackPercentage = Math.min(100, (currentCash / 40000) * 100);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1540px',
        margin: '0 auto 28px'
      }}
    >
      {/* TABULEIRO CENTRAL - RÉPLICA DO PLAYTEST FÍSICO */}
      <div
        className="tabletop-board"
        style={{
          background: '#F5EFEB',
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(200, 185, 160, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(210, 195, 170, 0.25) 0%, transparent 50%),
            linear-gradient(to bottom, #FAF5ED 0%, #EFE8DA 100%)
          `,
          border: '3px solid #2B2620',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          padding: '22px 26px',
          color: '#1E1B18',
          position: 'relative'
        }}
      >
        {/* CABEÇALHO DO TABULEIRO CENTRAL */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #2B2620',
            paddingBottom: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53' }}>
              TABULEIRO CENTRAL OFICIAL (V1.4)
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '-0.5px', margin: '2px 0 0 0', color: '#1E1B18' }}>
              BOUNTY TRACK & PROGRAM MARKET
            </h2>
          </div>

          {/* STATUS DA TRILHA DE RECOMPENSA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: '#FAF6EE',
                border: '1.5px solid #2B2620',
                borderRadius: '8px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'monospace', color: '#685F53' }}>
                Bounty Acumulado:
              </span>
              <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', color: '#047857' }}>
                ${currentCash.toLocaleString('pt-BR')}
              </span>
              <span style={{ fontSize: '11px', color: '#7E7362', fontFamily: 'monospace' }}>
                / $40.000
              </span>
            </div>

            {/* Marcador da Rodada (1 a 8) */}
            <div
              style={{
                background: '#FAF6EE',
                border: '1.5px solid #2B2620',
                borderRadius: '8px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'monospace', color: '#685F53' }}>
                RODADA:
              </span>
              <span style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'monospace', color: '#B45309' }}>
                {currentRound} / {totalRounds}
              </span>
            </div>
          </div>
        </div>

        {/* 1. SEÇÃO DA TRILHA DE BOUNTY HONEYCOMB (IMAGE 1) */}
        <div
          style={{
            background: '#FAF6EE',
            border: '2px solid #2B2620',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '24px',
            position: 'relative'
          }}
        >
          {/* Título da Trilha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🐝</span>
              <span style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase', color: '#1E1B18' }}>
                TRILHA HONEYCOMB DE RECOMPENSAS ($0 A $40.000)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontFamily: 'monospace', color: '#685F53' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#EFF2B5', border: '1px solid #2B241D', display: 'inline-block' }} /> Zona 1 ($0 - $15.5k)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#FBD2AF', border: '1px solid #2B241D', display: 'inline-block' }} /> Zona 2 ($16k - $29.5k)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: '#F29672', border: '1px solid #2B241D', display: 'inline-block' }} /> Zona 3 ($30k - $40k)
              </span>
            </div>
          </div>

          {/* FOTO AUTÊNTICA DO TABULEIRO CENTRAL FÍSICO COM OVERLAY E MARCADOR */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1.5px solid #2B2620',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src="/images/bounty_track_central.jpg"
              alt="Tabuleiro Central Honeycomb PWNED! V1.4"
              style={{
                width: '100%',
                maxHeight: '420px',
                objectFit: 'contain',
                display: 'block',
                background: '#EFE7D8'
              }}
            />

            {/* MARCADORES DOS JOGADORES NA TRILHA */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(250, 246, 238, 0.95)',
                border: '1.5px solid #2B2620',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                maxWidth: '480px'
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                🏁 Posições na Trilha Honeycomb:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {allPlayers.slice(0, playerCount).map(p => {
                  const isTurn = p.id === activePlayerRole;
                  const isCurrent = p.id === myRole;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isCurrent ? '#FEF3C7' : '#FFFFFF',
                        border: isTurn ? '1.5px solid #16A34A' : '1px solid #D6CBB8',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        fontSize: '10px',
                        fontFamily: 'monospace'
                      }}
                      title={`${p.name}: $${p.score.toLocaleString('pt-BR')}`}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: p.color,
                          border: '1px solid #2B2620',
                          boxShadow: isTurn ? '0 0 5px ' + p.color : 'none'
                        }}
                      />
                      <span style={{ fontWeight: isCurrent ? '900' : '700', color: '#1E1B18' }}>
                        {p.name.split(' ')[0]} {p.name.split(' ')[1]}:
                      </span>
                      <strong style={{ color: '#047857' }}>${p.score.toLocaleString('pt-BR')}</strong>
                      {isTurn && <span style={{ color: '#16A34A', fontSize: '9px' }}>●</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MARCOS ESPECIAIS (MILESTONES) CLICÁVEIS */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'monospace', color: '#685F53', marginBottom: '6px', textTransform: 'uppercase' }}>
              MARCOS ESPECIAIS DA TRILHA (CLIQUE PARA VER OS EFEITOS):
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '8px'
              }}
            >
              {BOUNTY_MILESTONES.map(m => {
                const isReached = currentCash >= m.value;
                return (
                  <div
                    key={m.value}
                    onClick={() => { soundFx.playClick(); setActiveMilestoneModal(m); }}
                    style={{
                      background: isReached ? '#DCFCE7' : '#FAF6EE',
                      border: isReached ? '1.5px solid #166534' : '1px solid #D6CBB8',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isReached ? '0 1px 4px rgba(22, 101, 52, 0.2)' : 'none'
                    }}
                    title={m.effectDescription}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '800', color: isReached ? '#166534' : '#1E1B18' }}>
                      {m.label} {m.icon}
                    </div>
                    <div style={{ fontSize: '8px', color: '#685F53', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isReached ? '✓ Atingido' : 'Pendente'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. PROGRAM MARKET (3 CARTAS ABERTAS NO TABULEIRO CENTRAL) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B45309' }}>
                {isPendingProgram ? '👉 SELEÇÃO DE ALVO OBRIGATÓRIA:' : 'MERCADO CORPORATIVO CENTRAL:'}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', margin: '2px 0 0 0', color: '#1E1B18' }}>
                PROGRAM MARKET (3 ALVOS DISPONÍVEIS NA MESA)
              </h3>
            </div>

            {isPendingProgram && (
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#FEF3C7', color: '#92400E', border: '1px solid #D97706', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                ⚠️ Clique em uma das cartas abaixo para pegar para seu tapete!
              </span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}
          >
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
                    background: isSelected ? '#ECFDF5' : '#FAF6EE',
                    border: isSelected ? '2px solid #059669' : isPendingProgram ? '2px dashed #D97706' : '1.5px solid #2B2620',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.2)' : '0 2px 5px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Linha Superior: Tipo de Empresa e Bônus */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#685F53', fontFamily: 'monospace' }}>
                        {program.companyType}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '900', background: '#FEF3C7', color: '#92400E', border: '1px solid #D97706', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {program.bountyRange || '+$0'}
                      </span>
                    </div>

                    {/* Nome do Programa */}
                    <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', margin: '4px 0 8px 0' }}>
                      {program.name}
                    </h4>

                    {/* Classes Permitidas no Escopo */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {program.allowedClasses === 'ALL' ? (
                        <span style={{ fontSize: '8.5px', fontWeight: '800', background: '#DCFCE7', color: '#166534', border: '1px solid #166534', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                          🌐 ESCOPO AMPLO (TODAS AS CLASSES)
                        </span>
                      ) : (
                        Array.isArray(program.allowedClasses) && program.allowedClasses.map(cat => (
                          <span key={cat} style={{ fontSize: '8px', fontWeight: '800', background: '#E0F2FE', color: '#0369A1', border: '1px solid #0369A1', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                            {cat}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Descrição */}
                    <p style={{ fontSize: '11px', color: '#4B4337', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                      {program.description}
                    </p>
                  </div>

                  {/* Rodapé da Carta: Velocidade de Patch e Ação */}
                  <div style={{ borderTop: '1px solid #E2D7C5', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#B91C1C', fontFamily: 'monospace' }}>
                      Patch: {program.patchSpeed}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        selectNewProgram(program);
                        if (onSelectProgram) onSelectProgram(program);
                      }}
                      style={{
                        padding: '4px 10px',
                        background: isSelected ? '#059669' : '#1E1B18',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isSelected ? '✓ SEU ALVO ATIVO' : 'PEGAR PROGRAMA'} <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. DECKS COMUNS DA MESA (MAIN, TOOLS, EVENTS) & ROUND TRACK */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          {/* BARALHOS DA MESA */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>

            {/* MAIN DECK (84 CARTAS) */}
            <div
              style={{
                width: '100px',
                height: '125px',
                background: '#FAF6EE',
                border: '2px solid #2B2620',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                boxShadow: '2px 3px 0 #2B2620'
              }}
            >
              <div style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53' }}>
                MAIN DECK
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', color: '#166534', margin: 'auto 0' }}>
                {mainDeckCount}
              </div>
              <div style={{ fontSize: '8px', color: '#7E7362', fontFamily: 'monospace' }}>
                84 cartas totais
              </div>
            </div>

            {/* TOOL DECK (48 CARTAS) */}
            <div
              style={{
                width: '100px',
                height: '125px',
                background: '#FAF6EE',
                border: '2px solid #2B2620',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                boxShadow: '2px 3px 0 #2B2620'
              }}
            >
              <div style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#0369A1' }}>
                TOOL DECK
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', color: '#0369A1', margin: 'auto 0' }}>
                {toolDeckCount}
              </div>
              <div style={{ fontSize: '8px', color: '#7E7362', fontFamily: 'monospace' }}>
                48 cartas totais
              </div>
            </div>

            {/* EVENT DECK (24 CARTAS) */}
            <div
              onClick={() => { soundFx.playClick(); drawEventCard(); }}
              title="Clique para sacar 1 Carta de Evento!"
              style={{
                width: '105px',
                height: '125px',
                background: '#FEF2F2',
                border: '2px solid #B91C1C',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '2px 3px 0 #B91C1C',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ fontSize: '8.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B91C1C' }}>
                🚨 EVENT DECK
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', color: '#B91C1C', margin: 'auto 0' }}>
                {eventDeckCount}
              </div>
              <div style={{ fontSize: '8px', fontWeight: '800', color: '#B91C1C', fontFamily: 'monospace' }}>
                Puxar Evento
              </div>
            </div>

          </div>

          {/* TRILHA DE RODADAS (ROUND TRACK: 1 A 8) */}
          <div
            style={{
              background: '#FAF6EE',
              border: '2px solid #2B2620',
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53', marginBottom: '10px' }}>
              ROUND TRACK (8 RODADAS OFICIAIS)
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
                const isCurrent = round === currentRound;
                const isPast = round < currentRound;

                return (
                  <div
                    key={round}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: isCurrent ? '#B45309' : isPast ? '#E2D7C5' : '#FFFFFF',
                      color: isCurrent ? '#FFFFFF' : isPast ? '#7E7362' : '#1E1B18',
                      border: isCurrent ? '2px solid #2B2620' : '1.5px solid #2B2620',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxShadow: isCurrent ? '0 2px 6px rgba(180, 83, 9, 0.4)' : 'none'
                    }}
                    title={`Rodada ${round}`}
                  >
                    {round}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL SIMPLES DE DETALHES DO MARCO */}
      {activeMilestoneModal && (
        <div
          onClick={() => setActiveMilestoneModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FAF6EE',
              border: '3px solid #2B2620',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {activeMilestoneModal.icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#1E1B18', marginBottom: '8px' }}>
              Marco Especial: {activeMilestoneModal.label}
            </h3>
            <p style={{ fontSize: '13px', color: '#4B4337', lineHeight: '1.5', marginBottom: '18px' }}>
              {activeMilestoneModal.effectDescription}
            </p>
            <button
              onClick={() => setActiveMilestoneModal(null)}
              style={{
                padding: '8px 20px',
                background: '#1E1B18',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '800',
                fontFamily: 'monospace',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
