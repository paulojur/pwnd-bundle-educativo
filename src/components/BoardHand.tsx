import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { CardV2, getClassBadgeInfo } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { Zap, Wrench, ShieldCheck, Sparkles, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const BoardHand: React.FC = () => {
  const {
    playerHand,
    playerActiveProgram,
    playerArchetype,
    isMyTurn,
    actionInfiltrar,
    discardCardFromHand,
    recycleHandCards,
    moveCardToToolsRack,
    moveCardToDefuseSlot,
    needsDiscard,
    pendingToolInstall,
    cancelToolInstall,
    confirmToolInstall
  } = useBoardGame();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [lastActionText, setLastActionText] = useState<string | null>(null);

  // HELPER PARA VALIDAR ESCOPO VISUAL INSTANTÂNEO DE CADA CARTA
  const checkScopeStatus = (card: CardV2): { inScope: boolean; badgeLabel: string; badgeColor: string } => {
    if (card.type !== 'exploit') {
      return {
        inScope: true,
        badgeLabel: card.type === 'tool' ? '🧰 FERRAMENTA' : '🛡️ Safeguard',
        badgeColor: card.type === 'tool' ? '#0369A1' : '#166534'
      };
    }

    if (!playerActiveProgram) {
      return { inScope: false, badgeLabel: '⚠️ SEM ALVO ATIVO', badgeColor: '#B45309' };
    }

    if (playerArchetype.id === 'red-teamer') {
      return { inScope: true, badgeLabel: '🎯 ESCOPO LIVRE (RED TEAM)', badgeColor: '#166534' };
    }

    const allowed = playerActiveProgram.allowedClasses;
    if (allowed === 'ALL') {
      return { inScope: true, badgeLabel: '🎯 ESCOPO AMPLO', badgeColor: '#166534' };
    }

    const cardCategory = (card.technicalReference || card.name).toLowerCase();
    const cardClass = (card.vulnClass || '').toUpperCase();
    const isAllowed = Array.isArray(allowed) && (
      (allowed as any[]).includes(cardClass) ||
      allowed.some(cat =>
        cardCategory.includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(cardCategory)
      )
    );

    if (isAllowed) {
      return { inScope: true, badgeLabel: `🎯 NO ESCOPO [${cardClass || 'OK'}]`, badgeColor: '#166534' };
    } else {
      return { inScope: false, badgeLabel: `❌ FORA DE ESCOPO [${cardClass || 'N/A'}]`, badgeColor: '#B91C1C' };
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
      setLastActionText(`Ação EXPLOIT: Carta "${card.name}" baixada na mesa! (1 AP gasto)`);
    } else if (card.type === 'tool') {
      moveCardToToolsRack(card.id);
      setLastActionText(`Ferramenta "${card.name}" alocada no Tools Rack!`);
    } else if (card.type === 'defuse') {
      moveCardToDefuseSlot(card.id);
      setLastActionText(`Safeguard "${card.name}" alocada no Safeguard Slot!`);
    }
    setSelectedCardIds([]);
  };

  return (
    <div
      style={{
        background: '#FAF6EE',
        border: '2px solid #2B2620',
        borderRadius: '10px',
        padding: '16px 20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {/* CABEÇALHO DA MÃO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🃏</span>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace' }}>
            SUA MÃO DE CARTAS ({playerHand.length} cartas)
          </h3>
          <span style={{ fontSize: '10px', color: '#685F53', fontFamily: 'monospace' }}>
            (Limite: {playerArchetype.maxHandSize || 6} cartas)
          </span>
        </div>

        {/* Notificações de ação */}
        {needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '11px', color: '#991B1B', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', border: '1px solid #B91C1C', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
            ⚠️ LIMITE EXCEDIDO: Descarte {playerHand.length - playerArchetype.maxHandSize} carta(s).
          </div>
        )}

        {pendingToolInstall && (
          <div style={{ fontSize: '11px', color: '#0369A1', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #0369A1', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
            🔧 INSTALANDO [{pendingToolInstall.name}]: Clique no botão de outra carta para sacrificar como pagamento.
          </div>
        )}

        {lastActionText && !needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '10.5px', color: '#166534', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', border: '1px solid #166534', padding: '3px 8px', borderRadius: '4px' }}>
            <CheckCircle2 size={13} /> {lastActionText}
          </div>
        )}

        {/* RECICLAGEM 2 POR 1 */}
        {selectedCardIds.length === 2 ? (
          <button
            onClick={handleRecycleTwoForOne}
            style={{
              padding: '6px 14px',
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
              gap: '6px',
              boxShadow: '0 2px 5px rgba(22, 163, 74, 0.4)'
            }}
          >
            <RefreshCw size={14} /> ♻️ RECICLAR 2 CARTAS SELECIONADAS POR 1 NOVA
          </button>
        ) : selectedCardIds.length === 1 && (
          <div style={{ fontSize: '10.5px', color: '#B45309', fontFamily: 'monospace' }}>
            💡 Selecione mais 1 carta para ativar a <strong>Reciclagem 2 por 1</strong>!
          </div>
        )}
      </div>

      {/* CONTAINER HORIZONTAL DE CARTAS */}
      {playerHand.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#685F53', fontSize: '12px', fontFamily: 'monospace', background: '#FAF6EE', border: '1.5px dashed #A89D8B', borderRadius: '8px' }}>
          Sua mão está vazia. Clique em <strong>[1. RECON (1 AP)]</strong> na barra de ações acima para comprar novas cartas no seu turno!
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '10px' }}>
          {playerHand.map(card => {
            const isSelected = selectedCardIds.includes(card.id);
            const scopeStatus = checkScopeStatus(card);
            const classInfo = getClassBadgeInfo(card.id, card.technicalReference, card.name, card.vulnClass);

            const cardBorderColor = isSelected
              ? '#D97706'
              : card.type === 'tool'
                ? '#0369A1'
                : card.type === 'defuse'
                  ? '#166534'
                  : '#2B2620';

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  width: '170px',
                  minWidth: '170px',
                  height: '255px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isSelected ? '2.5px solid #D97706' : `1.5px solid ${cardBorderColor}`,
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  boxShadow: isSelected ? '0 4px 12px rgba(217, 119, 6, 0.35)' : '0 2px 6px rgba(0,0,0,0.08)',
                  opacity: scopeStatus.inScope ? 1 : 0.65,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* TOPO DA CARTA: STATUS DE ESCOPO E CLASSE */}
                <div>
                  <div
                    style={{
                      fontSize: '8px',
                      fontWeight: '800',
                      color: scopeStatus.badgeColor,
                      fontFamily: 'monospace',
                      background: '#FAF6EE',
                      padding: '2px 4px',
                      borderRadius: '3px',
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
                        fontSize: '7.5px',
                        fontWeight: '800',
                        color: classInfo.color,
                        background: '#FAF6EE',
                        border: `1px solid ${classInfo.color}`,
                        borderRadius: '3px',
                        padding: '1px 4px',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}
                    >
                      {classInfo.label} {card.isNoisy ? '⚡ NOISY' : '🕶️ STEALTH'}
                    </div>
                  )}
                </div>

                {/* ÍCONE E PONTOS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px' }}>{card.icon}</span>
                  {card.points > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#166534', fontFamily: 'monospace' }}>
                      +${card.points.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* NOME DA CARTA E REFERÊNCIA TÉCNICA */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', lineHeight: '1.2', margin: 0 }}>
                    {card.name}
                  </h4>
                  <div style={{ fontSize: '8px', color: '#685F53', fontFamily: 'monospace', marginTop: '2px' }}>
                    {card.technicalReference}
                  </div>
                </div>

                {/* DESCRIÇÃO EM PORTUGUÊS LEIGO */}
                <div style={{ fontSize: '8.5px', color: '#4B4337', lineHeight: '1.3', background: '#FAF6EE', padding: '4px', borderRadius: '4px', border: '1px solid #E2D7C5' }}>
                  {card.ptDescription || card.simpleDescription}
                </div>

                {/* BOTÕES DE AÇÃO NA CARTA */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {pendingToolInstall ? (
                    card.id === pendingToolInstall.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          cancelToolInstall();
                        }}
                        style={{ flex: 1, padding: '5px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #B91C1C', borderRadius: '3px', fontSize: '8.5px', fontWeight: '800', fontFamily: 'monospace', cursor: 'pointer' }}
                      >
                        ❌ CANCELAR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmToolInstall(card.id);
                        }}
                        style={{ flex: 1, padding: '5px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '3px', fontSize: '8.5px', fontWeight: '800', fontFamily: 'monospace', cursor: 'pointer' }}
                      >
                        ✅ PAGAR COM ESTA
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
                            background: '#B45309',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '8.5px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          EXPLOIT (1 AP)
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
                            background: '#0369A1',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '8.5px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
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
                            background: '#166534',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '8.5px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          SAFEGUARD
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
                          title="Descartar esta carta"
                          style={{
                            flex: 1,
                            padding: '5px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            border: '1px solid #B91C1C',
                            borderRadius: '3px',
                            fontSize: '8.5px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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
