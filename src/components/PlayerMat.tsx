import React from 'react';
import { CardV2 } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { BoardHand } from './BoardHand';
import { ShieldCheck, Wrench, Zap, DollarSign } from 'lucide-react';
import { getZoneByBalance } from '../utils/gameRules';
import { soundFx } from '../utils/audio';

export interface PlayerMatData {
  playerId: string;
  playerName: string;
  playerColor: string;
  archetype: Archetype;
  currentProgram: ProgramCard;
  bountyTotal: number; // Ex: 13000
  hand: CardV2[];
  activeTools: CardV2[];
  activeExploits: CardV2[];
  hasDefuse: boolean;
  isCurrentTurnPlayer?: boolean;
}

interface PlayerMatProps {
  playerData: PlayerMatData;
  onExploitSelect?: (card: CardV2) => void;
  onActionReport?: () => void;
  onActionRecon?: () => void;
}

const BOUNTY_STEPS = [
  0, 1500, 3000, 4500, 6000, 7500, 9000, 10500, 11000,
  12000, 14000, 16000, 18000, 20000,
  22000, 24000, 26000, 28000, 30000, 32000, 33000,
  34000, 35000, 36000, 37000, 38000, 39000, 40000
];

export const PlayerMat: React.FC<PlayerMatProps> = ({
  playerData,
  onExploitSelect,
  onActionReport,
  onActionRecon
}) => {
  const {
    playerName,
    playerColor,
    archetype,
    currentProgram,
    bountyTotal,
    hand,
    activeTools,
    activeExploits,
    hasDefuse,
    isCurrentTurnPlayer
  } = playerData;

  // Encontrar qual nível da trilha o jogador está (assenta no degrau imediatamente abaixo ou igual)
  let activeStepIndex = BOUNTY_STEPS.reduce((lastIdx, step, idx) => step <= bountyTotal ? idx : lastIdx, 0);

  // Zona, Cor e Penalidade são SEMPRE baseadas no Saldo Bruto (bountyTotal), nunca no degrau
  const currentZone = getZoneByBalance(bountyTotal);

  return (
    <div
      className="playmat-container responsive-playmat-grid"
      style={{
        padding: '20px',
        borderColor: currentZone.cssColor,
        boxShadow: isCurrentTurnPlayer ? `0 0 25px ${playerColor}40` : `0 0 15px ${currentZone.cssColor}40`,
        display: 'grid',
        gridTemplateColumns: '130px 1fr',
        gap: '20px',
        width: '100%',
        maxWidth: '1180px',
        margin: '0 auto 24px'
      }}
    >
      {/* 1. BOUNTY TRACK VERTICAL (28 DEG RAUS MONOTÔNICOS) */}
      <div className="bounty-track-vertical" style={{ maxHeight: '520px', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: '800', color: currentZone.cssColor, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '4px' }}>
          BOUNTY TRACK ({currentZone.name.toUpperCase()})
        </div>

        {BOUNTY_STEPS.map((val, idx) => {
          const isActive = idx === activeStepIndex;
          const isGreen = val <= 11000;
          const isYellow = val > 11000 && val <= 20000;
          const isOrange = val > 20000 && val <= 33000;
          const isRed = val > 33000;

          const color = isGreen ? 'var(--terminal-green)' : isYellow ? 'var(--amber-glow)' : isOrange ? '#f97316' : 'var(--alert-red)';

          return (
            <div
              key={val}
              className={`bounty-step ${isActive ? 'active' : ''}`}
              style={{ color: isActive ? '#000' : color, borderLeft: `3px solid ${color}` }}
            >
              <span>${val.toLocaleString('pt-BR')}</span>
              {isActive && <div className="wooden-token" title="Seu Marcador de Madeira" />}
            </div>
          );
        })}
      </div>

      {/* 2. ÁREA PRINCIPAL DO TAPETE (Slots Verticais Proporcionais de 63mm x 88mm) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>

        {/* TOP ROW: RESEARCHER, ACTIVE PROGRAM & DEFUSE (RETÂNGULOS VERTICAIS PROPORCIONAIS) */}
        <div className="responsive-col-3-to-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

          {/* RESEARCHER SLOT */}
          <div className="playmat-slot" style={{ padding: '12px', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="playmat-slot-label">RESEARCHER</span>
            <div style={{ fontSize: '28px', margin: '4px 0' }}>{archetype.avatarIcon}</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: playerColor, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              {archetype.name}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{playerName}</div>
          </div>

          {/* ACTIVE PROGRAM SLOT */}
          <div className="playmat-slot" style={{ padding: '12px', height: '160px', border: '1px solid var(--amber-glow)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="playmat-slot-label" style={{ color: 'var(--amber-glow)' }}>ACTIVE PROGRAM</span>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              {currentProgram.name}
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)' }}>
              Range: {currentProgram.bountyRange}
            </div>
            {currentProgram.id !== 'pending' && (
              <button
                onClick={() => {
                  if (confirm('Deseja desistir deste programa e escolher um novo alvo no Program Market do Tabuleiro Central?')) {
                    soundFx.playClick();
                    if (onActionRecon) onActionRecon();
                    const event = new CustomEvent('pwnd_abandon_program');
                    window.dispatchEvent(event);
                  }
                }}
                style={{
                  marginTop: '4px',
                  padding: '3px 8px',
                  background: 'rgba(240, 136, 62, 0.2)',
                  color: 'var(--amber-glow)',
                  border: '1px solid var(--amber-glow)',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                🔄 Desistir / Trocar Alvo
              </button>
            )}
          </div>

          {/* Safeguard SLOT */}
          <div className="playmat-slot" style={{ padding: '12px', height: '160px', borderColor: hasDefuse ? 'var(--terminal-green)' : 'rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="playmat-slot-label" style={{ color: hasDefuse ? 'var(--terminal-green)' : 'var(--text-muted)' }}>Safeguard</span>
            <ShieldCheck size={32} color={hasDefuse ? 'var(--terminal-green)' : 'rgba(255,255,255,0.2)'} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: hasDefuse ? 'var(--terminal-green)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {hasDefuse ? 'Bypass' : 'Vazio'}
            </span>
          </div>

        </div>

        {/* MIDDLE ROW: TOOLS RACK (3 SLOTS VERTICAIS PROPORCIONAIS DE 120px DE ALTURA) */}
        <div>
          <div className="responsive-col-2-to-1" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px' }}>
            {/* TOOLS RACK (3 SLOTS) */}
            <div>
              <div className="playmat-slot-label" style={{ marginBottom: '6px' }}>TOOLS RACK</div>
              <div className="responsive-col-3-to-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[0, 1, 2].map(slotIdx => {
                  const tool = activeTools[slotIdx];

                  return (
                    <div
                      key={slotIdx}
                      className="playmat-slot"
                      style={{ height: '160px', padding: '10px', background: tool ? 'rgba(56, 189, 248, 0.1)' : 'rgba(0,0,0,0.3)', border: tool ? '1px solid var(--cyber-blue)' : '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      {tool ? (
                        <>
                          <span style={{ fontSize: '20px' }}>{tool.icon}</span>
                          <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--cyber-blue)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                            {tool.name}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: 'auto' }}>[Slot Vazio]</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EVENTOS GUARDADOS (2 SLOTS) */}
            <div>
              <div className="playmat-slot-label" style={{ marginBottom: '6px', color: 'var(--alert-red)' }}>EVENTOS GUARDADOS (LIMITE 2)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[1, 2].map(i => (
                  <div key={`event-${i}`} className="playmat-slot" style={{ height: '160px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(248, 81, 73, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--alert-red)', fontFamily: 'var(--font-mono)', opacity: 0.6, textAlign: 'center' }}>[Opcional / Janela de Caos]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOWER ROW: EXPLOITS AREA (AMPLIADA COM LEQUE PARA 4 VULNERABILIDADES DE 160px DE ALTURA) */}
        <div>
          <div className="playmat-slot-label" style={{ marginBottom: '6px' }}>EXPLOITS (VULNERABILIDADES ALOCADAS)</div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', minHeight: '160px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
            {activeExploits.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: 'auto', textAlign: 'center' }}>
                Nenhuma vulnerabilidade implantada neste programa ainda.
              </div>
            ) : (
              activeExploits.map((exploit, idx) => (
                <div
                  key={`${exploit.id}-${idx}`}
                  style={{
                    background: 'linear-gradient(145deg, #1e1329 0%, #100a17 100%)',
                    border: '1px solid var(--electric-purple-light)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    minWidth: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px' }}>{exploit.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)' }}>
                      +{exploit.points} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {exploit.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM ROW: HAND OFICIAL COM SELOS E ACTIONS */}
        <div>
          <BoardHand />
        </div>

      </div>
    </div>
  );
};
