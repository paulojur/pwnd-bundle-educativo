import React, { useState } from 'react';
import { useBoardGame } from '../context/BoardGameContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCardDescription, getLocalizedScopeBadge } from '../i18n/cardTranslations';
import { CardV2, getClassBadgeInfo } from '../data/cardsDataV2';
import { ProgramCard, Archetype } from '../data/cardsData';
import { Zap, Wrench, ShieldCheck, Sparkles, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { checkCardScopeV14 } from '../utils/gameRulesV14';

export const BoardHand: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    playerHand,
    playerActiveTools,
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
    confirmToolInstall,
    dynamicMaxHandSize,
    freeExploitDeploysRemaining,
    currentScopeOptions
  } = useBoardGame();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [lastActionText, setLastActionText] = useState<string | null>(null);

  // VALIDAÇÃO CANÔNICA DE ESCOPO V1.4 (com Tools Passivas e Eventos de Rodada)
  const checkScopeStatus = (card: CardV2) =>
    checkCardScopeV14(card, playerActiveProgram, playerArchetype, playerActiveTools, currentScopeOptions);

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
            {t('playerMat.handTitle')} ({playerHand.length} {t('playerMat.cardsCount')})
          </h3>
          <span style={{ fontSize: '10px', color: '#685F53', fontFamily: 'monospace' }}>
            ({t('playerMat.limit')} {dynamicMaxHandSize} {t('playerMat.cardsCount')})
          </span>
        </div>

        {freeExploitDeploysRemaining > 0 && (
          <div style={{ fontSize: '11px', color: '#166534', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', border: '1.5px solid #166534', padding: '4px 10px', borderRadius: '4px', fontWeight: '900' }}>
            ⚡ BÔNUS ATIVO (SpiderScan / Efeito Dominó): Você pode descer +{freeExploitDeploysRemaining} vulnerabilidade(s) na mesa por 0 AP!
          </div>
        )}

        {/* Notificações de ação */}
        {needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '11px', color: '#991B1B', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', border: '1px solid #B91C1C', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
            ⚠️ {language === 'en' ? `HAND LIMIT EXCEEDED: Discard ${playerHand.length - dynamicMaxHandSize} card(s).` : `LIMITE EXCEDIDO: Descarte ${playerHand.length - dynamicMaxHandSize} carta(s).`}
          </div>
        )}

        {pendingToolInstall && (
          <div style={{ fontSize: '11px', color: '#0369A1', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #0369A1', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
            🔧 {language === 'en' ? `INSTALLING [${pendingToolInstall.name}]: Click button on another card to sacrifice as payment.` : `INSTALANDO [${pendingToolInstall.name}]: Clique no botão de outra carta para sacrificar como pagamento.`}
          </div>
        )}

        {lastActionText && !needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '10.5px', color: '#166534', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', border: '1px solid #166534', padding: '3px 8px', borderRadius: '4px' }}>
            <CheckCircle2 size={13} /> {lastActionText}
          </div>
        )}

        {/* RECICLAGEM 2 POR 1 (0 AP - SEMPRE VISÍVEL PARA ORIENTAR O JOGADOR) */}
        {selectedCardIds.length === 2 ? (
          <button
            onClick={handleRecycleTwoForOne}
            disabled={!isMyTurn}
            style={{
              padding: '6px 14px',
              background: isMyTurn ? '#16A34A' : '#9CA3AF',
              color: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: isMyTurn ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)'
            }}
          >
            <RefreshCw size={14} /> ♻️ {language === 'en' ? 'Recycle 2:1 (0 AP) — Confirm Swap!' : 'Reciclar 2:1 (0 AP) — Confirmar Troca!'}
          </button>
        ) : (
          <div
            style={{
              fontSize: '11px',
              color: selectedCardIds.length === 1 ? '#B45309' : '#4B4337',
              background: selectedCardIds.length === 1 ? '#FEF3C7' : '#F3EFE6',
              border: selectedCardIds.length === 1 ? '1.5px solid #D97706' : '1px dashed #A89D8B',
              padding: '5px 10px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontWeight: selectedCardIds.length === 1 ? '800' : '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} color={selectedCardIds.length === 1 ? '#D97706' : '#685F53'} />
            {selectedCardIds.length === 1
              ? (language === 'en' ? 'Recycle 2:1 (0 AP): 1/2 selected — click 1 more card to swap for free!' : 'Reciclar 2:1 (0 AP): 1/2 selecionada — clique em mais 1 carta para trocar grátis!')
              : (language === 'en' ? 'Recycle 2:1 (0 AP): Click any 2 cards in hand to swap for 1 new card (0 AP)' : 'Reciclar 2:1 (0 AP): Clique em 2 cartas da mão para trocar por 1 nova sem gastar AP')}
          </div>
        )}
      </div>

      {/* CONTAINER HORIZONTAL DE CARTAS */}
      {playerHand.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#685F53', fontSize: '12px', fontFamily: 'monospace', background: '#FAF6EE', border: '1.5px dashed #A89D8B', borderRadius: '8px' }}>
          {t('playerMat.emptyHand')}
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
                  width: '230px',
                  minWidth: '230px',
                  minHeight: '340px',
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isSelected ? '2.5px solid #D97706' : `1.5px solid ${cardBorderColor}`,
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  boxShadow: isSelected ? '0 6px 16px rgba(217, 119, 6, 0.35)' : '0 2px 8px rgba(0,0,0,0.08)',
                  opacity: scopeStatus.inScope ? 1 : 0.65,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* TOPO DA CARTA: STATUS DE ESCOPO E CLASSE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: scopeStatus.badgeColor,
                      fontFamily: 'monospace',
                      background: '#FAF6EE',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: `1.5px solid ${scopeStatus.badgeColor}`,
                      textAlign: 'center'
                    }}
                  >
                    {getLocalizedScopeBadge(scopeStatus.badgeLabel, scopeStatus.inScope, language)}
                  </div>

                  {card.type === 'exploit' && (
                    <div
                      style={{
                        fontSize: '9.5px',
                        fontWeight: '800',
                        color: classInfo.color,
                        background: '#FAF6EE',
                        border: `1px solid ${classInfo.color}`,
                        borderRadius: '4px',
                        padding: '3px 5px',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}
                    >
                      {classInfo.label} {card.isNoisy ? '⚡ NOISY' : '🕶️ STEALTH'}
                    </div>
                  )}
                </div>

                {/* ÍCONE E PONTOS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0' }}>
                  <span style={{ fontSize: '28px' }}>{card.icon}</span>
                  {card.points > 0 && (
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#166534', fontFamily: 'monospace' }}>
                      +${card.points.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                    </span>
                  )}
                </div>

                {/* NOME DA CARTA E REFERÊNCIA TÉCNICA */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#1E1B18', fontFamily: 'monospace', lineHeight: '1.25', margin: 0 }}>
                    {card.name}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#5A5245', fontFamily: 'monospace', marginTop: '3px' }}>
                    {card.technicalReference}
                  </div>
                </div>

                {/* DESCRIÇÃO DA CARTA LOCALIZADA (COM DESTAQUE PARA PODERES NOISY) */}
                <div
                  style={{
                    fontSize: '11px',
                    color: card.isNoisy ? '#991B1B' : '#2B2620',
                    lineHeight: '1.4',
                    background: card.isNoisy ? '#FEF2F2' : '#FAF6EE',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: card.isNoisy ? '1.5px solid #F87171' : '1px solid #E2D7C5',
                    fontFamily: 'monospace'
                  }}
                >
                  {card.isNoisy && (
                    <div style={{ fontWeight: '900', color: '#B91C1C', marginBottom: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚡ PODER ATIVO:
                    </div>
                  )}
                  {getLocalizedCardDescription(card, language)}
                </div>

                {/* BOTÕES DE AÇÃO NA CARTA */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
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
                      {card.type === 'exploit' && scopeStatus.inScope && (
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
                            background: freeExploitDeploysRemaining > 0 ? '#16A34A' : '#B45309',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '8.5px',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {freeExploitDeploysRemaining > 0 ? '⚡ EXPLOIT (0 AP)' : 'EXPLOIT (1 AP)'}
                        </button>
                      )}

                      {card.type === 'tool' && (
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

                      {card.type === 'defuse' && (
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
