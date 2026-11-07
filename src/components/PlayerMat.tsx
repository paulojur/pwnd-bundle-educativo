import React from 'react';
import { CardV2 } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { BoardHand } from './BoardHand';
import { ShieldCheck, Wrench, Zap, DollarSign, AlertCircle, Sparkles, AlertTriangle, Bug } from 'lucide-react';
import { soundFx } from '../utils/audio';

export interface PlayerMatData {
  playerId: string;
  playerName: string;
  playerColor: string;
  archetype: Archetype;
  currentProgram: ProgramCard;
  bountyTotal: number;
  hand: CardV2[];
  activeTools: CardV2[];
  activeExploits: CardV2[];
  hasDefuse: boolean;
  hasCve?: boolean;
  isCurrentTurnPlayer?: boolean;
  alertaTokens?: number;
  reputacaoTokens?: number;
  activeEvents?: any[];
}

interface PlayerMatProps {
  playerData: PlayerMatData;
  onExploitSelect?: (card: CardV2) => void;
  onActionReport?: () => void;
  onActionRecon?: () => void;
  onOpenCenterTable?: () => void;
}

export const PlayerMat: React.FC<PlayerMatProps> = ({
  playerData,
  onExploitSelect,
  onActionReport,
  onActionRecon,
  onOpenCenterTable
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
    hasCve,
    isCurrentTurnPlayer,
    alertaTokens = 0,
    reputacaoTokens = 0,
    activeEvents = []
  } = playerData;

  const isPendingProgram = !currentProgram || currentProgram.id === 'pending';

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto 28px' }}>
      {/* TABULEIRO DO JOGADOR - RÉPLICA DO PLAYTEST FÍSICO */}
      <div
        className="tabletop-board"
        style={{
          background: '#F5EFEB',
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(200, 185, 160, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(210, 195, 170, 0.2) 0%, transparent 40%),
            linear-gradient(to bottom, #FAF5ED 0%, #EFE8DA 100%)
          `,
          border: '3px solid #2B2620',
          borderRadius: '12px',
          boxShadow: isCurrentTurnPlayer
            ? `0 12px 36px rgba(0,0,0,0.45), 0 0 0 3px ${playerColor}`
            : '0 10px 30px rgba(0,0,0,0.35)',
          padding: '20px 24px',
          color: '#1E1B18',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        {/* BARRA SUPERIOR: IDENTIDADE DO JOGADOR, TOKENS E LOGO PWNED! */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #2B2620',
            paddingBottom: '14px',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* LADO ESQUERDO: MARCADOR DO JOGADOR & TOKENS 🐞 / 🐝 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Peão de Madeira do Jogador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: playerColor,
                  border: '2px solid #2B2620',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}
                title={playerName}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {playerName}
                </div>
                <div style={{ fontSize: '10px', color: '#685F53', fontFamily: 'monospace' }}>
                  {isCurrentTurnPlayer ? '🟢 SUA VEZ DE JOGAR' : 'Aguardando oponente'}
                </div>
              </div>
            </div>

            {/* Separador vertical */}
            <div style={{ width: '1px', height: '30px', background: '#D6CBB8' }} />

            {/* TOKENS DE ALERTA 🐞 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', color: '#B91C1C' }}>
                ALERTA:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2].map(slot => {
                  const hasToken = alertaTokens >= slot;
                  return (
                    <div
                      key={slot}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: hasToken ? '#FEE2E2' : '#EDE4D3',
                        border: hasToken ? '2px solid #B91C1C' : '1.5px dashed #A89D8B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        boxShadow: hasToken ? '0 1px 3px rgba(185, 28, 28, 0.3)' : 'none'
                      }}
                      title={hasToken ? '1 Token de Alerta ativo' : 'Slot de Alerta livre'}
                    >
                      {hasToken ? '🐞' : ''}
                    </div>
                  );
                })}
              </div>
              {alertaTokens >= 2 && (
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#B91C1C', fontFamily: 'monospace' }}>
                  ⚠️ PENALIDADE (-$2.000)
                </span>
              )}
            </div>

            {/* Separador vertical */}
            <div style={{ width: '1px', height: '30px', background: '#D6CBB8' }} />

            {/* TOKENS DE REPUTAÇÃO 🐝 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', color: '#B45309' }}>
                REPUTAÇÃO:
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FEF3C7',
                  border: '1.5px solid #D97706',
                  borderRadius: '6px',
                  padding: '2px 8px'
                }}
              >
                <span style={{ fontSize: '14px' }}>🐝</span>
                <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: '#92400E' }}>
                  {reputacaoTokens}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#685F53', fontFamily: 'monospace' }}>
                (2🐝 = Reroll D6 | +$500 fim)
              </span>
            </div>
          </div>

          {/* LADO DIREITO: LOGO IDÊNTICA AO PLAYTEST FÍSICO */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '-1px', lineHeight: '1', color: '#1E1B18' }}>
              PWNED!
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'monospace', color: '#5A5245' }}>
              The Bug Bounty™ Chaos
            </div>
            <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#7E7362' }}>
              Find it. Report it. Get paid.
            </div>
          </div>
        </div>

        {/* ESTRUTURA PRINCIPAL DO TABULEIRO: 3 COLUNAS CONFORME FOTO 2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '170px 1fr 140px',
            gap: '16px',
            minHeight: '380px'
          }}
          className="responsive-player-mat-grid"
        >
          {/* ─────────────────────────────────────────────────────────────
              COLUNA 1 (ESQUERDA): ARCHETYPE, PROGRAM, SAFEGUARD
          ───────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* SLOT ARCHETYPE */}
            <div
              style={{
                flex: 1,
                border: '1.5px solid #2B2620',
                borderRadius: '8px',
                background: '#FAF6EE',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53' }}>
                ARCHETYPE
              </div>
              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <div style={{ fontSize: '26px', lineHeight: '1' }}>{archetype.avatarIcon || '🌱'}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'monospace', color: '#1E1B18', marginTop: '4px' }}>
                  {archetype.name}
                </div>
                <div style={{ fontSize: '9px', color: '#5A5245', lineHeight: '1.2', marginTop: '2px' }}>
                  {archetype.specialPowers?.[0] || archetype.presentation?.slice(0, 50)}
                </div>
              </div>
              <div style={{ fontSize: '8.5px', fontWeight: '700', color: '#7E7362', fontFamily: 'monospace', textAlign: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '4px' }}>
                Mão Máx: {archetype.maxHandSize || 6}
              </div>
            </div>

            {/* SLOT PROGRAM (ALVO ATUAL) */}
            <div
              style={{
                flex: 1.2,
                border: isPendingProgram ? '2px dashed #B45309' : '1.5px solid #2B2620',
                borderRadius: '8px',
                background: isPendingProgram ? '#FFFBEB' : '#FAF6EE',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: isPendingProgram ? '#B45309' : '#685F53' }}>
                  PROGRAM
                </span>
                {!isPendingProgram && (
                  <span style={{ fontSize: '8px', fontWeight: '800', background: '#D97706', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                    {currentProgram.bountyRange || '+$0'}
                  </span>
                )}
              </div>

              {isPendingProgram ? (
                <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', fontFamily: 'monospace' }}>
                    [ NENHUM PROGRAMA ]
                  </div>
                  <div style={{ fontSize: '9px', color: '#78350F', margin: '4px 0 8px 0' }}>
                    Escolha um alvo no Mercado do Tabuleiro Central.
                  </div>
                  {onOpenCenterTable && (
                    <button
                      onClick={() => { soundFx.playClick(); onOpenCenterTable(); }}
                      style={{
                        padding: '6px 12px',
                        background: '#B45309',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(180, 83, 9, 0.3)'
                      }}
                    >
                      🛒 Ir ao Mercado ➔
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E1B18', fontFamily: 'monospace', margin: '4px 0 2px' }}>
                    {currentProgram.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#5A5245', marginBottom: '4px' }}>
                    {currentProgram.companyType}
                  </div>

                  {/* Escopo de Classes Permitidas */}
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', margin: '4px 0' }}>
                    {currentProgram.allowedClasses === 'ALL' ? (
                      <span style={{ fontSize: '8px', fontWeight: '800', background: '#DCFCE7', color: '#166534', border: '1px solid #166534', padding: '1px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
                        ESCOPO AMPLO
                      </span>
                    ) : (
                      Array.isArray(currentProgram.allowedClasses) && currentProgram.allowedClasses.map(c => (
                        <span key={c} style={{ fontSize: '7.5px', fontWeight: '800', background: '#E0F2FE', color: '#0369A1', border: '1px solid #0369A1', padding: '1px 3px', borderRadius: '2px', fontFamily: 'monospace' }}>
                          {c}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '4px', fontSize: '8.5px', fontFamily: 'monospace' }}>
                <span style={{ color: '#B91C1C', fontWeight: '700' }}>
                  Patch: {currentProgram?.patchSpeed || 'Moderada'}
                </span>
                {!isPendingProgram && (
                  <button
                    onClick={() => {
                      if (confirm('Deseja trocar este programa por outro do mercado? Exploits na mesa serão descartados.')) {
                        soundFx.playClick();
                        const evt = new CustomEvent('pwnd_abandon_program');
                        window.dispatchEvent(evt);
                        if (onOpenCenterTable) onOpenCenterTable();
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#B45309',
                      fontSize: '8px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: '700'
                    }}
                  >
                    Trocar
                  </button>
                )}
              </div>
            </div>

            {/* SLOT SAFEGUARD (EMPILHÁVEL: BYPASS + CVE) */}
            <div
              style={{
                flex: 1.2,
                border: '1.5px solid #2B2620',
                borderRadius: '8px',
                background: (hasDefuse || hasCve) ? '#ECFDF5' : '#FAF6EE',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: (hasDefuse || hasCve) ? '#047857' : '#685F53' }}>
                  SAFEGUARD
                </span>
                <span style={{ fontSize: '8px', color: '#7E7362', fontFamily: 'monospace' }}>
                  (Empilhável)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 'auto 0' }}>
                {/* 1. Bypass */}
                <div
                  style={{
                    background: hasDefuse ? '#FFFFFF' : 'rgba(0,0,0,0.03)',
                    border: hasDefuse ? '1px solid #059669' : '1px dashed #D6CBB8',
                    borderRadius: '5px',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={18} color={hasDefuse ? '#059669' : '#A89D8B'} />
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'monospace', color: hasDefuse ? '#065F46' : '#9CA3AF' }}>
                      {hasDefuse ? '🛡️ Bypass Pronto' : '🛡️ Bypass [Vazio]'}
                    </div>
                    <div style={{ fontSize: '7.5px', color: '#685F53' }}>
                      {hasDefuse ? 'Anula 1 Patch (+1 Alerta)' : 'Descartado'}
                    </div>
                  </div>
                </div>

                {/* 2. CVE Assignment Protection */}
                <div
                  style={{
                    background: hasCve ? '#FFFFFF' : 'rgba(0,0,0,0.03)',
                    border: hasCve ? '1px solid #0284C7' : '1px dashed #D6CBB8',
                    borderRadius: '5px',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>📜</span>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'monospace', color: hasCve ? '#0369A1' : '#9CA3AF' }}>
                      {hasCve ? 'CVE Protection Ativa' : 'CVE Protection [Livre]'}
                    </div>
                    <div style={{ fontSize: '7.5px', color: '#685F53' }}>
                      {hasCve ? 'Anula Eventos adversários' : 'Slot adicional'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '8px', color: '#5A5245', textAlign: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '3px' }}>
                Até 1 Bypass + 1 CVE empilhados
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              COLUNA 2 (CENTRAL): EXPLOITS (TOPO) + TOOLS 1, 2, 3 (BASE)
          ───────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ÁREA SUPERIOR: CAIXA PONTILHADA DE EXPLOITS (MÁX 3 CARTAS) */}
            <div
              style={{
                flex: 1.3,
                border: '2px dashed #4A4237',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.45)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Rótulo superior idêntico ao playtest físico */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#3A332A' }}>
                  EXPLOITS
                </div>
                <div style={{ fontSize: '10px', fontWeight: '700', fontFamily: 'monospace', color: '#685F53' }}>
                  {activeExploits.length} / 3 Vulnerabilidades Ativas
                </div>
              </div>

              {/* Cards alocados na zona de Exploits */}
              <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                {activeExploits.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7E7362',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      padding: '16px'
                    }}
                  >
                    <Bug size={24} color="#A89D8B" style={{ marginBottom: '6px' }} />
                    <span>Nenhum exploit implantado neste programa ainda.</span>
                    <span style={{ fontSize: '9.5px', color: '#047857', marginTop: '2px' }}>
                      Clique em uma vulnerabilidade da sua mão com ação [EXPLOIT] para descer na mesa (Custa 1 AP).
                    </span>
                  </div>
                ) : (
                  activeExploits.map((exploit, idx) => (
                    <div
                      key={`${exploit.id}-${idx}`}
                      style={{
                        flex: 1,
                        background: '#FAF6EE',
                        border: '1.5px solid #2B2620',
                        borderRadius: '6px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px' }}>{exploit.icon || '💉'}</span>
                        <span style={{ fontSize: '9px', fontWeight: '800', background: '#DCFCE7', color: '#166534', border: '1px solid #166534', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                          ${exploit.points?.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#1E1B18', fontFamily: 'monospace', margin: '4px 0' }}>
                        {exploit.name}
                      </div>
                      <div style={{ fontSize: '8.5px', color: '#5A5245', lineHeight: '1.2' }}>
                        {exploit.technicalReference}
                      </div>
                      <div style={{ marginTop: '4px', borderTop: '1px solid #E2D7C5', paddingTop: '3px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: exploit.isNoisy ? '#B91C1C' : '#047857', fontWeight: '700', fontFamily: 'monospace' }}>
                        <span>{exploit.vulnClass || 'VULN'}</span>
                        <span>{exploit.isNoisy ? '⚡ NOISY' : '🕶️ STEALTH'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ÁREA INFERIOR: 3 SLOTS DE TOOLS (TOOL 1, TOOL 2, TOOL 3) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', minHeight: '130px' }}>
              {[0, 1, 2].map(slotIdx => {
                const tool = activeTools[slotIdx];
                const slotLabel = `TOOL ${slotIdx + 1}`;

                return (
                  <div
                    key={slotIdx}
                    style={{
                      border: '1.5px solid #2B2620',
                      borderRadius: '8px',
                      background: tool ? '#F0FDF4' : '#FAF6EE',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: tool ? '#166534' : '#7E7362' }}>
                      {slotLabel}
                    </div>

                    {tool ? (
                      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                        <span style={{ fontSize: '20px' }}>{tool.icon || '🛠️'}</span>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#1E1B18', fontFamily: 'monospace', marginTop: '2px' }}>
                          {tool.name}
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#5A5245', marginTop: '2px' }}>
                          {tool.simpleDescription?.slice(0, 45) || tool.technicalReference}
                        </div>
                      </div>
                    ) : (
                      <div style={{ margin: 'auto', textAlign: 'center', color: '#A89D8B', fontSize: '10px', fontFamily: 'monospace' }}>
                        [ Slot Disponível ]
                      </div>
                    )}

                    <div style={{ fontSize: '8px', color: '#7E7362', textAlign: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '3px', fontFamily: 'monospace' }}>
                      {tool ? 'Ativa na mesa' : 'Vazio'}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              COLUNA 3 (DIREITA): EVENT 1, EVENT 2
          ───────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['EVENT 1', 'EVENT 2'].map((eventSlot, idx) => {
              const activeEvent = activeEvents[idx];

              return (
                <div
                  key={eventSlot}
                  style={{
                    flex: 1,
                    border: '1.5px solid #2B2620',
                    borderRadius: '8px',
                    background: activeEvent ? '#FEF2F2' : '#FAF6EE',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'monospace', color: activeEvent ? '#991B1B' : '#685F53' }}>
                    {eventSlot}
                  </div>

                  {activeEvent ? (
                    <div style={{ margin: 'auto 0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#991B1B', fontFamily: 'monospace' }}>
                        {activeEvent.name}
                      </div>
                      <div style={{ fontSize: '8.5px', color: '#5A5245', marginTop: '3px', lineHeight: '1.2' }}>
                        {activeEvent.simpleDescription?.slice(0, 60)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ margin: 'auto', textAlign: 'center', color: '#A89D8B', fontSize: '9.5px', fontFamily: 'monospace' }}>
                      [ Sem Evento Ativo ]
                    </div>
                  )}

                  <div style={{ fontSize: '8px', color: '#7E7362', textAlign: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '3px', fontFamily: 'monospace' }}>
                    {activeEvent ? 'Efeito Persistente' : 'Slot Livre'}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* MÃO DE CARTAS DO JOGADOR ACOPLADA DIRETAMENTE ABAIXO DA MESA */}
      <div style={{ marginTop: '16px' }}>
        <BoardHand />
      </div>
    </div>
  );
};
