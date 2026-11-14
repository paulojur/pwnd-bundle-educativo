import React, { useState, useEffect } from 'react';
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
    recycledThisTurn,
    pendingToolInstall,
    cancelToolInstall,
    confirmToolInstall,
    dynamicMaxHandSize,
    freeExploitDeploysRemaining,
    currentScopeOptions,
    actionSocialPhishing,
    allPlayers,
    myRole
  } = useBoardGame();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [lastActionText, setLastActionText] = useState<string | null>(null);
  const [phishingModalCardId, setPhishingModalCardId] = useState<string | null>(null);

  // Sanitiza seleção de cartas: se alguma carta selecionada não estiver mais na mão, remove-a
  useEffect(() => {
    setSelectedCardIds(prev => prev.filter(id => playerHand.some(c => c.id === id)));
  }, [playerHand]);

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
    if (selectedCardIds.length !== 2 || recycledThisTurn) return;
    const [id1, id2] = selectedCardIds;
    const hasCard1 = playerHand.some(c => c.id === id1);
    const hasCard2 = playerHand.some(c => c.id === id2);
    if (!hasCard1 || !hasCard2 || id1 === id2) {
      setSelectedCardIds([]);
      return;
    }
    recycleHandCards(id1, id2);
    setSelectedCardIds([]);
    setLastActionText('♻️ Reciclagem 2:1 realizada (1/1 neste turno)! 2 cartas descartadas e +1 nova comprada.');
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
          <div style={{ fontSize: '11px', color: '#0369A1', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px', background: '#E0F2FE', border: '1.5px solid #0369A1', padding: '6px 12px', borderRadius: '6px', fontWeight: '800' }}>
            <span>🔧 {language === 'en' ? `INSTALLING [${pendingToolInstall.name}]: Click button on another card to sacrifice as payment.` : `INSTALANDO [${pendingToolInstall.name}]: Clique no botão de outra carta para sacrificar como pagamento.`}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                cancelToolInstall();
              }}
              style={{
                padding: '3px 8px',
                background: '#B91C1C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Cancelar Instalação
            </button>
          </div>
        )}

        {lastActionText && !needsDiscard && !pendingToolInstall && (
          <div style={{ fontSize: '10.5px', color: '#166534', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', border: '1px solid #166534', padding: '3px 8px', borderRadius: '4px' }}>
            <CheckCircle2 size={13} /> {lastActionText}
          </div>
        )}

        {/* RECICLAGEM 2 POR 1 (0 AP - 1x POR TURNO) */}
        {recycledThisTurn ? (
          <div
            style={{
              fontSize: '11px',
              color: '#685F53',
              background: '#EFECE6',
              border: '1px solid #C8BFB0',
              padding: '5px 10px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} color="#685F53" />
            {language === 'en' ? '♻️ Recycle 2:1 (0 AP): Already used this turn (1x/turn)' : '♻️ Reciclagem 2:1 (0 AP): Já utilizada neste turno (1x/turno)'}
          </div>
        ) : selectedCardIds.length === 2 ? (
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
            <RefreshCw size={14} /> ♻️ {language === 'en' ? 'Recycle 2:1 (0 AP, 1x/turn) — Confirm Swap!' : 'Reciclar 2:1 (0 AP, 1x/turno) — Confirmar Troca!'}
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
              ? (language === 'en' ? 'Recycle 2:1 (0 AP, 1x/turn): 1/2 selected — click 1 more card to swap!' : 'Reciclar 2:1 (0 AP, 1x/turno): 1/2 selecionada — clique em mais 1 carta para trocar!')
              : (language === 'en' ? 'Recycle 2:1 (0 AP, 1x/turn): Click any 2 cards in hand to swap for 1 new card' : 'Reciclar 2:1 (0 AP, 1x/turno): Clique em 2 cartas da mão para trocar por 1 nova')}
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
                  opacity: 1,
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
                      fontWeight: '900',
                      color: scopeStatus.inScope ? '#166534' : '#991B1B',
                      fontFamily: 'monospace',
                      background: scopeStatus.inScope ? '#DCFCE7' : '#FEE2E2',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: `1.5px solid ${scopeStatus.inScope ? '#166534' : '#DC2626'}`,
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
                        background: classInfo.bg,
                        border: `1.5px solid ${classInfo.color}`,
                        borderRadius: '4px',
                        padding: '3px 5px',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}
                    >
                      <span style={{ color: classInfo.color, fontWeight: '900' }}>{classInfo.label}</span> • <span style={{ color: card.isNoisy ? '#991B1B' : '#166534', fontWeight: '900' }}>{card.isNoisy ? '[NOISY]' : '[STEALTH]'}</span>
                    </div>
                  )}
                </div>

                {/* CABEÇALHO TÉCNICO E PONTOS (SEM EMOJIS INFANTIS) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      color: card.type === 'tool' ? '#0369A1' : card.type === 'defuse' ? '#166534' : classInfo.color,
                      background: card.type === 'tool' ? '#E0F2FE' : card.type === 'defuse' ? '#DCFCE7' : classInfo.bg,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1.5px solid ${card.type === 'tool' ? '#0369A1' : card.type === 'defuse' ? '#166534' : classInfo.color}`
                    }}
                  >
                    {card.type === 'tool'
                      ? `TOOL • ${card.toolType || 'PASSIVA'}`
                      : card.type === 'defuse'
                        ? (card.name.includes('CVE') ? 'SAFEGUARD • CVE' : 'SAFEGUARD • BYPASS')
                        : `${card.vulnClass || 'EXPLOIT'} • ${(card.rarity || 'Common').toUpperCase()}`}
                  </span>
                  {card.points > 0 ? (
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#166534', fontFamily: 'monospace' }}>
                      +${card.points.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#685F53', fontFamily: 'monospace' }}>
                      {card.type === 'tool' ? (card.toolMoment || 'SUPORTE') : 'DEFESA'}
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
                      PODER ATIVO NO REPORT:
                    </div>
                  )}
                  {getLocalizedCardDescription(card, language)}
                </div>

                {/* BOTÕES DE AÇÃO NA CARTA */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {pendingToolInstall ? (
                    card.id === pendingToolInstall.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          cancelToolInstall();
                        }}
                        style={{ flex: 1, padding: '7px 5px', background: '#FEE2E2', color: '#B91C1C', border: '1.5px solid #B91C1C', borderRadius: '4px', fontSize: '9px', fontWeight: '900', fontFamily: 'monospace', cursor: 'pointer' }}
                      >
                        ✕ CANCELAR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmToolInstall(card.id);
                        }}
                        style={{ flex: 1, padding: '7px 5px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '9px', fontWeight: '900', fontFamily: 'monospace', cursor: 'pointer' }}
                      >
                        ✓ PAGAR COM ESTA
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
                            padding: '6px 4px',
                            background: freeExploitDeploysRemaining > 0 ? '#16A34A' : '#B45309',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '900',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {freeExploitDeploysRemaining > 0 ? 'EXPLOIT (0 AP)' : 'EXPLOIT (1 AP)'}
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
                            padding: '6px 4px',
                            background: '#0369A1',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '900',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          INSTALAR TOOL
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
                            padding: '6px 4px',
                            background: '#15803D',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '900',
                            fontFamily: 'monospace',
                            cursor: isMyTurn ? 'pointer' : 'not-allowed'
                          }}
                        >
                          ALOCAR SAFEGUARD
                        </button>
                      )}

                      {playerArchetype?.id === 'social-engineer' && isMyTurn && actionSocialPhishing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            const availableOpponents = allPlayers.filter(p => p.id !== myRole && p.hand.length > 0);
                            if (availableOpponents.length === 0) {
                              alert('Nenhum oponente possui cartas na mão para o Phishing!');
                              return;
                            }
                            if (availableOpponents.length === 1) {
                              actionSocialPhishing(card.id, availableOpponents[0].id);
                            } else {
                              setPhishingModalCardId(card.id);
                            }
                          }}
                          style={{
                            padding: '6px 6px',
                            background: '#BE185D',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '8.5px',
                            fontWeight: '900',
                            fontFamily: 'monospace',
                            cursor: 'pointer'
                          }}
                          title="Usa Phishing (1 AP): entrega esta carta e puxa 1 carta aleatória do oponente à sua escolha!"
                        >
                          PHISHING
                        </button>
                      )}

                      {!pendingToolInstall && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            discardCardFromHand(card.id);
                          }}
                          title="Descartar esta carta"
                          style={{
                            padding: '6px 8px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            border: '1px solid #B91C1C',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={12} />
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

      {/* MODAL DE ESCOLHA DE ALVO DO PHISHING (TRANSPARÊNCIA TOTAL EM 2+ JOGADORES) */}
      {phishingModalCardId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '90%',
              padding: '24px',
              background: '#FAF6EE',
              border: '2.5px solid #BE185D',
              borderRadius: '12px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              color: '#1E1B18',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎭</span>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#BE185D', margin: 0 }}>
                PHISHING: ESCOLHA A VÍTIMA
              </h3>
            </div>
            <p style={{ fontSize: '11.5px', color: '#4B4337', marginBottom: '16px', lineHeight: '1.4' }}>
              Você está oferecendo a carta <strong>[{playerHand.find(c => c.id === phishingModalCardId)?.name}]</strong>. Selecione qual oponente terá sua rede infiltrada para puxar 1 carta aleatória da mão dele:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {allPlayers
                .filter(p => p.id !== myRole && p.hand.length > 0)
                .map(opp => (
                  <button
                    key={opp.id}
                    onClick={() => {
                      soundFx.playClick();
                      if (actionSocialPhishing) {
                        actionSocialPhishing(phishingModalCardId, opp.id);
                      }
                      setPhishingModalCardId(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      border: `2px solid ${opp.color || '#2B2620'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '12px', color: opp.color || '#1E1B18' }}>
                        {opp.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#685F53' }}>
                        {opp.archetype?.name || 'Hacker'} • Alvo: [{opp.activeProgram?.name || 'Sem alvo'}]
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '900', background: '#F3EFE6', padding: '4px 8px', borderRadius: '4px', border: '1px solid #D6CEBE' }}>
                      🃏 {opp.hand.length} carta(s)
                    </div>
                  </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPhishingModalCardId(null)}
                style={{
                  padding: '8px 14px',
                  background: '#F3EFE6',
                  color: '#4B4337',
                  border: '1.5px solid #2B2620',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
