import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { CardV2, getClassBadgeInfo } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { Zap, Wrench, ShieldCheck, Sparkles, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const BoardHand: React.FC = () => {
  const { playerHand, playerActiveProgram, playerArchetype, isMyTurn, actionInfiltrar, discardCardFromHand, recycleHandCards, moveCardToToolsRack, moveCardToDefuseSlot, needsDiscard, pendingToolInstall, cancelToolInstall, confirmToolInstall } = useBoardGame();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [lastActionText, setLastActionText] = useState<string | null>(null);

  // HELPER PARA VALIDAR ESCOPO VISUAL INSTANTÂNEO DE CADA CARTA
  const checkScopeStatus = (card: CardV2): { inScope: boolean; badgeLabel: string; badgeColor: string } => {
    if (card.type !== 'exploit') {
      return {
        inScope: true,
        badgeLabel: card.type === 'tool' ? '🧰 FERRAMENTA' : '🛡️ Safeguard',
        badgeColor: card.type === 'tool' ? 'var(--cyber-blue)' : 'var(--terminal-green)'
      };
    }

    if (!playerActiveProgram) {
      return { inScope: false, badgeLabel: '⚠️ SEM ALVO', badgeColor: 'var(--amber-glow)' };
    }

    if (playerArchetype.id === 'red-teamer') {
      return { inScope: true, badgeLabel: '🎯 PERMITIDO (RED TEAM)', badgeColor: 'var(--terminal-green)' };
    }

    const allowed = playerActiveProgram.allowedClasses;
    if (allowed === 'ALL') {
      return { inScope: true, badgeLabel: '🎯 PERMITIDO NO ESCOPO', badgeColor: 'var(--terminal-green)' };
    }

    const cardCategory = card.technicalReference || card.name;
    const isAllowed = Array.isArray(allowed) && allowed.some(cat =>
      cardCategory.toLowerCase().includes(cat.toLowerCase()) ||
      cat.toLowerCase().includes(cardCategory.toLowerCase())
    );

    if (isAllowed) {
      return { inScope: true, badgeLabel: '🎯 PERMITIDO NO ESCOPO', badgeColor: 'var(--terminal-green)' };
    } else {
      return { inScope: false, badgeLabel: '❌ FORA DE ESCOPO', badgeColor: 'var(--alert-red)' };
    }
  };

  const handleCardClick = (cardId: string) => {
    soundFx.playClick();
    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      if (prev.length >= 2) {
        return [prev[1], cardId];
      }
      return [...prev, cardId];
    });
  };

  const handleRecycleTwoForOne = () => {
    if (selectedCardIds.length !== 2) return;
    recycleHandCards(selectedCardIds[0], selectedCardIds[1]);
    setSelectedCardIds([]);
    setLastActionText('♻️ Reciclagem 2:1 realizada! 2 cartas descartadas e +1 nova comprada.');
  };

  const handlePlayCard = (card: CardV2) => {
    if (!isMyTurn) {
      alert('Aguarde a sua vez para jogar cartas da mão!');
      return;
    }

    if (card.type === 'exploit') {
      actionInfiltrar(card.id);
      setLastActionText(`Ação EXPLOIT: Carta "${card.name}" armada no nó! Turno passado.`);
    } else if (card.type === 'tool') {
      moveCardToToolsRack(card.id);
      setLastActionText(`Ferramenta "${card.name}" enviada para o Tools Rack!`);
    } else if (card.type === 'defuse') {
      moveCardToDefuseSlot(card.id);
      setLastActionText(`Safeguard "${card.name}" alocada no Slot de Defuse!`);
    }
    setSelectedCardIds([]);
  };

  return (
    <div className="terminal-box" style={{ padding: '16px', background: 'rgba(13, 15, 26, 0.95)' }}>

      {/* Hand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--electric-purple-light)" />
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
            Sua Mão de Cartas ({playerHand.length} cartas)
          </h3>
        </div>

        {/* Action Confirmation Banner */}
        {needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(248, 81, 73, 0.9)', padding: '6px 14px', borderRadius: '4px', fontWeight: '800' }}>
            ⚠️ LIMITE DE MÃO EXCEDIDO! Descarte {playerHand.length - playerArchetype.maxHandSize} carta(s).
          </div>
        )}

        {pendingToolInstall && (
          <div style={{ fontSize: '12px', color: '#000', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--cyber-blue)', padding: '6px 14px', borderRadius: '4px', fontWeight: '800' }}>
            🔧 INSTALANDO [{pendingToolInstall.name}]: Clique no botão verde de outra carta para sacrificar como pagamento.
          </div>
        )}

        {lastActionText && !needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '11px', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(57, 211, 83, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>
            <CheckCircle2 size={14} /> {lastActionText}
          </div>
        )}

        {/* RECYCLE 2 FOR 1 BUTTON */}
        {selectedCardIds.length === 2 ? (
          <button
            onClick={handleRecycleTwoForOne}
            style={{
              padding: '6px 14px',
              background: 'var(--terminal-green)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '900',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--glow-green)'
            }}
          >
            <RefreshCw size={15} /> ♻️ RECICLAR 2 CARTAS SELECIONADAS POR 1 NOVA DO DECK
          </button>
        ) : selectedCardIds.length === 1 && (
          <div style={{ fontSize: '11px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)' }}>
            💡 Selecione mais 1 carta para ativar a <strong>Reciclagem 2 por 1</strong>!
          </div>
        )}
      </div>

      {/* Cards List Horizontal Container */}
      {playerHand.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          Sua mão está vazia. Clique em <strong>[VARRER / RECON]</strong> no painel de ações para comprar novas cartas no seu turno!
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '10px' }}>
          {playerHand.map(card => {
            const isSelected = selectedCardIds.includes(card.id);
            const scopeStatus = checkScopeStatus(card);
            const classInfo = getClassBadgeInfo(card.id, card.technicalReference, card.name);

            // Borda temática por tipo de baralho
            const deckBorderColor =
              card.type === 'tool' ? 'var(--cyber-blue)' :
                card.type === 'defuse' ? 'var(--terminal-green)' : 'var(--amber-glow)';

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="game-card"
                style={{
                  width: '165px',
                  minWidth: '165px',
                  height: '248px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isSelected ? '2px solid var(--amber-glow)' : scopeStatus.inScope ? `1px solid ${deckBorderColor}` : '1px solid rgba(248, 81, 73, 0.3)',
                  boxShadow: isSelected ? 'var(--glow-amber)' : scopeStatus.inScope && card.type === 'exploit' ? '0 0 10px rgba(240, 136, 62, 0.2)' : 'none',
                  background: card.type === 'exploit' ? 'linear-gradient(165deg, #131726 0%, #1f1430 100%)' : card.type === 'tool' ? 'linear-gradient(165deg, #131726 0%, #0c2033 100%)' : 'linear-gradient(165deg, #131726 0%, #0a2618 100%)',
                  opacity: scopeStatus.inScope ? (isMyTurn ? 1 : 0.8) : 0.55,
                  position: 'relative'
                }}
              >
                {/* CLASS BADGE & SCOPE BADGE */}
                <div>
                  <div
                    style={{
                      fontSize: '8.5px',
                      fontWeight: '800',
                      color: scopeStatus.badgeColor,
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0,0,0,0.85)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${scopeStatus.badgeColor}`,
                      textAlign: 'center',
                      marginBottom: '3px'
                    }}
                  >
                    {scopeStatus.badgeLabel}
                  </div>

                  {card.type === 'exploit' && (
                    <div
                      style={{
                        fontSize: '8px',
                        fontWeight: '800',
                        color: classInfo.color,
                        background: classInfo.bg,
                        border: `1px solid ${classInfo.color}`,
                        borderRadius: '3px',
                        padding: '1px 4px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {classInfo.label}
                    </div>
                  )}
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{card.icon}</span>
                  {card.points > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)' }}>
                      +{card.points} pts
                    </span>
                  )}
                </div>

                {/* Title & Technical Ref Tag */}
                <div>
                  <h4 style={{ fontSize: '11.5px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: '1.2' }}>
                    {card.name}
                  </h4>
                  <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    ({card.technicalReference})
                  </div>
                </div>

                {/* Simple Layman Explanation */}
                <div style={{ fontSize: '9px', color: 'var(--text-primary)', lineHeight: '1.25', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '4px' }}>
                  {card.simpleDescription}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {pendingToolInstall ? (
                    card.id === pendingToolInstall.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          cancelToolInstall();
                        }}
                        style={{ flex: 1, padding: '5px', background: 'rgba(248, 81, 73, 0.2)', color: 'var(--alert-red)', border: '1px solid rgba(248, 81, 73, 0.5)', borderRadius: '3px', fontSize: '9px', fontWeight: '800', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        ❌ CANCELAR INSTALAÇÃO
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmToolInstall(card.id);
                        }}
                        style={{ flex: 1, padding: '5px', background: 'var(--terminal-green)', color: '#000', border: 'none', borderRadius: '3px', fontSize: '9px', fontWeight: '800', fontFamily: 'var(--font-mono)', cursor: 'pointer', boxShadow: 'var(--glow-green)' }}
                      >
                        ✅ PAGAR COM ESTA CARTA
                      </button>
                    )
                  ) : (
                    <>
                      {!needsDiscard && card.type === 'exploit' && scopeStatus.inScope && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        handlePlayCard(card);
                      }}
                      disabled={!isMyTurn}
                      style={{
                        flex: 2,
                        padding: '5px',
                        background: 'var(--amber-glow)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '800',
                        fontFamily: 'var(--font-mono)',
                        cursor: isMyTurn ? 'pointer' : 'not-allowed'
                      }}
                    >
                      AÇÃO EXPLOIT
                    </button>
                  )}

                  {!needsDiscard && card.type === 'tool' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        handlePlayCard(card);
                      }}
                      disabled={!isMyTurn}
                      style={{
                        flex: 2,
                        padding: '5px',
                        background: 'var(--cyber-blue)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '800',
                        fontFamily: 'var(--font-mono)',
                        cursor: isMyTurn ? 'pointer' : 'not-allowed'
                      }}
                    >
                      MOVER P/ TOOLS
                    </button>
                  )}

                  {!needsDiscard && card.type === 'defuse' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        handlePlayCard(card);
                      }}
                      disabled={!isMyTurn}
                      style={{
                        flex: 2,
                        padding: '5px',
                        background: 'var(--terminal-green)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '800',
                        fontFamily: 'var(--font-mono)',
                        cursor: isMyTurn ? 'pointer' : 'not-allowed'
                      }}
                    >
                      ENVIAR SAFEGUARD
                    </button>
                  )}

                  {/* Botão de Descarte */}
                  {!pendingToolInstall && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        discardCardFromHand(card.id);
                      }}
                      title="Descartar esta carta da mão para liberar espaço"
                      style={{
                        flex: 1,
                        padding: '5px',
                        background: needsDiscard ? 'rgba(248, 81, 73, 0.2)' : 'rgba(248, 81, 73, 0.15)',
                        color: 'var(--alert-red)',
                        border: needsDiscard ? '1px solid var(--alert-red)' : '1px solid rgba(248, 81, 73, 0.4)',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '800',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: needsDiscard ? '0 0 8px rgba(248, 81, 73, 0.4)' : 'none'
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
