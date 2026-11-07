import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { Search, Send, SkipForward, Award, Dices, UserCheck, Clock, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { BountyLedgerModal } from './BountyLedgerModal';

export const ActionPointsBar: React.FC = () => {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const {
    playerScore,
    isMyTurn,
    activePlayerRole,
    myRole,
    currentPlayer,
    allPlayers,
    actionVarrer,
    actionReportar,
    triggerManualDiceRoll,
    endTurn,
    needsDiscard,
    actionsRemaining,
    deployedExploits,
    playerSafeguardSlot
  } = useBoardGame();

  const myExploitsCount = deployedExploits.filter(e => e.playerId === myRole).length;

  return (
    <div style={{ marginBottom: '22px' }}>
      {/* BARRA DE TURNO E PONTOS DE AÇÃO (3 AP) */}
      <div
        style={{
          background: isMyTurn ? '#FAF6EE' : '#F1E9DC',
          border: '2.5px solid #2B2620',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: isMyTurn ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {/* Identificação de Turno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isMyTurn ? '#16A34A' : '#64748B',
              border: '2px solid #2B2620',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            {isMyTurn ? <UserCheck size={18} /> : <Clock size={18} />}
          </div>
          <div>
            <div style={{ fontSize: '9.5px', color: '#685F53', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }}>
              REGRA OFICIAL V1.4: 3 AÇÕES POR TURNO (REPORT CUSTA 2 AP)
            </div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: isMyTurn ? '#166534' : '#475569', fontFamily: 'monospace' }}>
              {isMyTurn
                ? '🟢 SUA VEZ! Execute suas ações na mesa'
                : `⏳ Aguardando a jogada de ${allPlayers.find(p => p.id === activePlayerRole)?.name || activePlayerRole}...`}
            </div>
          </div>
        </div>

        {/* PIPS DE PONTOS DE AÇÃO (AP TRACKER) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              padding: '6px 12px'
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#1E1B18' }}>
              AÇÕES (AP):
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1, 2, 3].map(ap => {
                const isAvailable = ap <= actionsRemaining;
                return (
                  <div
                    key={ap}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: isAvailable ? '#16A34A' : '#D1D5DB',
                      border: '1.5px solid #2B2620',
                      boxShadow: isAvailable ? '0 1px 3px rgba(22, 163, 74, 0.4)' : 'none'
                    }}
                    title={`Ação ${ap} de 3 ${isAvailable ? '(Disponível)' : '(Gasta)'}`}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'monospace', color: actionsRemaining > 0 ? '#166534' : '#B91C1C' }}>
              {actionsRemaining}/3
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#685F53', fontFamily: 'monospace' }}>
            Papel Local: <strong style={{ color: currentPlayer?.color || '#166534' }}>{currentPlayer?.name || myRole}</strong>
          </div>
        </div>
      </div>

      {/* PAINEL DE BOTÕES DE AÇÃO TABLETOP */}
      <div
        style={{
          background: '#FAF6EE',
          border: '2px solid #2B2620',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* BOUNTY SCORE & EXTRATO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#ECFDF5',
              border: '1.5px solid #059669',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={20} color="#059669" />
            <div>
              <div style={{ fontSize: '9.5px', color: '#065F46', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }}>
                Bounty Acumulado (Meta $40k)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#047857', fontFamily: 'monospace' }}>
                  ${playerScore.toLocaleString('pt-BR')}
                </span>
                <button
                  onClick={() => { soundFx.playClick(); setIsLedgerOpen(true); }}
                  title="Ver extrato contábil de Bounties"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #059669',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    color: '#065F46',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9.5px',
                    fontFamily: 'monospace',
                    fontWeight: '800'
                  }}
                >
                  <FileText size={11} /> Extrato
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#685F53', fontFamily: 'monospace', borderLeft: '1px solid #D6CBB8', paddingLeft: '12px' }}>
            Exploits no Alvo: <strong style={{ color: myExploitsCount > 0 ? '#B45309' : '#685F53' }}>{myExploitsCount} / 3</strong>
            {playerSafeguardSlot && <span style={{ marginLeft: '10px', color: '#047857' }}>🛡️ Bypass Pronto</span>}
          </div>
        </div>

        {/* BOTÕES DAS 4 AÇÕES PRINCIPAIS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {needsDiscard && (
            <div style={{ background: '#FEE2E2', border: '1.5px solid #B91C1C', color: '#991B1B', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', fontFamily: 'monospace' }}>
              ⚠️ LIMITE DE MÃO: Descarte cartas antes de agir!
            </div>
          )}

          {isMyTurn && actionsRemaining === 0 && myExploitsCount > 0 && (
            <div style={{ background: '#FEF3C7', border: '1.5px solid #D97706', color: '#92400E', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', fontFamily: 'monospace' }}>
              🎲 Suas 3 Ações terminaram! Encerre o turno para rolar o Patch Stealth (3D6).
            </div>
          )}

          {isMyTurn && actionsRemaining === 0 && myExploitsCount === 0 && (
            <div style={{ background: '#DCFCE7', border: '1.5px solid #166534', color: '#166534', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', fontFamily: 'monospace' }}>
              🕶️ 3 Ações gastas! Passe o turno no Modo Furtivo para remover 1 Alerta (🐞).
            </div>
          )}

          {/* 1. RECON (1 AP) -> COMPRA 2 CARTAS */}
          <button
            onClick={() => { soundFx.playClick(); actionVarrer(); }}
            disabled={!isMyTurn || needsDiscard || actionsRemaining < 1}
            title="Ação RECON: Compre 2 cartas do Main Deck para sua mão (Custa 1 AP)"
            style={{
              padding: '10px 16px',
              background: isMyTurn && actionsRemaining >= 1 && !needsDiscard ? '#0284C7' : '#E2E8F0',
              color: isMyTurn && actionsRemaining >= 1 && !needsDiscard ? '#FFFFFF' : '#94A3B8',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: isMyTurn && !needsDiscard && actionsRemaining >= 1 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isMyTurn && actionsRemaining >= 1 && !needsDiscard ? '0 2px 5px rgba(2, 132, 199, 0.3)' : 'none'
            }}
          >
            <Search size={15} /> 1. RECON (1 AP)
          </button>

          {/* Dica de Exploit */}
          <div
            style={{
              padding: '8px 12px',
              background: '#F1E9DC',
              border: '1px dashed #A89D8B',
              borderRadius: '6px',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#685F53'
            }}
          >
            2. EXPLOIT (1 AP): Baixe da mão ⬇️
          </div>

          {/* 3. REPORT (2 AP) */}
          <button
            onClick={() => { soundFx.playClick(); actionReportar(); }}
            disabled={!isMyTurn || needsDiscard || actionsRemaining < 2 || myExploitsCount === 0}
            title={myExploitsCount === 0 ? 'Você precisa ter pelo menos 1 Exploit na mesa para reportar!' : 'Submeta o relatório! Custa 2 AP e encerra o turno com Payout.'}
            style={{
              padding: '10px 18px',
              background: isMyTurn && actionsRemaining >= 2 && myExploitsCount > 0 && !needsDiscard ? '#16A34A' : '#E2E8F0',
              color: isMyTurn && actionsRemaining >= 2 && myExploitsCount > 0 && !needsDiscard ? '#FFFFFF' : '#94A3B8',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: isMyTurn && !needsDiscard && actionsRemaining >= 2 && myExploitsCount > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isMyTurn && actionsRemaining >= 2 && myExploitsCount > 0 ? '0 2px 6px rgba(22, 163, 74, 0.4)' : 'none'
            }}
          >
            <Send size={15} /> 3. REPORT (2 AP)
          </button>

          {/* Simulação de Teste D6 */}
          <button
            onClick={() => { soundFx.playClick(); triggerManualDiceRoll(); }}
            title="Simular teste de Patch Speed (D6)"
            style={{
              padding: '10px 14px',
              background: '#FAF6EE',
              color: '#7C3AED',
              border: '1.5px solid #7C3AED',
              borderRadius: '6px',
              fontWeight: '800',
              fontFamily: 'monospace',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Dices size={14} /> Dados D6
          </button>

          {/* Passar Turno */}
          <button
            onClick={() => { soundFx.playClick(); endTurn(); }}
            disabled={!isMyTurn || needsDiscard}
            title={myExploitsCount > 0 ? 'Encerra o turno e dispara o Teste de Patch Stealth (3D6, descarta o maior).' : 'Encerra o turno no Modo Furtivo e remove 1 Token de Alerta.'}
            style={{
              padding: '10px 16px',
              background: isMyTurn && actionsRemaining === 0 ? '#B45309' : '#2B2620',
              color: '#FAF6EE',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: isMyTurn && !needsDiscard ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isMyTurn && actionsRemaining === 0 ? '0 2px 8px rgba(180, 83, 9, 0.4)' : 'none'
            }}
          >
            <SkipForward size={14} />
            {actionsRemaining === 0
              ? (myExploitsCount > 0 ? 'Passar Turno & Rolar Patch 🎲' : 'Passar Turno (Furtivo) 🕶️')
              : 'Passar Turno ⏩'}
          </button>
        </div>
      </div>

      {isLedgerOpen && <BountyLedgerModal onClose={() => setIsLedgerOpen(false)} />}
    </div>
  );
};
