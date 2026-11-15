import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BookOpen, X, ShieldAlert, Dices, Award, Zap, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PlayerAidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerAidModal: React.FC<PlayerAidModalProps> = ({ isOpen, onClose }) => {
  const [activeSide, setActiveSide] = useState<'frente' | 'verso'>('frente');
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FAF6EE',
          border: '3px solid #2B2620',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          color: '#1E1B18',
          position: 'relative'
        }}
      >
        {/* CABEÇALHO DA CARTA DE AJUDA */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '2px solid #2B2620',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#F5EFEB',
            borderRadius: '9px 9px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>📋</span>
            <div>
              <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B45309' }}>
                {language === 'en' ? 'PWND! BUG BOUNTY CHAOS - PLAYER GUIDE' : 'PWND! BUG BOUNTY CHAOS - GUIA DO JOGADOR'}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1E1B18', margin: 0, fontFamily: 'monospace' }}>
                {t('playerAid.title')}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #2B2620',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ABAS FRENTE (O SEU TURNO) / VERSO (PATCH & TABELAS) */}
        <div style={{ display: 'flex', borderBottom: '2px solid #2B2620', background: '#EFE7D8' }}>
          <button
            onClick={() => { soundFx.playClick(); setActiveSide('frente'); }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeSide === 'frente' ? '#FAF6EE' : 'transparent',
              border: 'none',
              borderRight: '1px solid #2B2620',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: activeSide === 'frente' ? '#1E1B18' : '#786F62',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>👉 {t('playerAid.frontTab')}</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveSide('verso'); }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeSide === 'verso' ? '#FAF6EE' : 'transparent',
              border: 'none',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: activeSide === 'verso' ? '#1E1B18' : '#786F62',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>🎲 {t('playerAid.backTab')}</span>
          </button>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeSide === 'frente' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* BLOCO 1: AS 3 AÇÕES PRINCIPAIS */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #2B2620', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#166534', marginBottom: '8px' }}>
                  {language === 'en' ? 'THE 3 MAIN TURN ACTIONS (3 AP)' : 'AS 3 AÇÕES PRINCIPAIS DO TURNO (3 AP)'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ borderLeft: '3px solid #0284C7', paddingLeft: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: '#0284C7' }}>
                      {language === 'en' ? '1. RECON (Costs 1 Action)' : '1. RECON (Custa 1 Ação)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4B4337', marginTop: '2px' }}>
                      {language === 'en' ? (
                        <>Draw <strong>2 cards</strong> from the Main Deck into your hand <em>OR</em> switch your active corporate program for another exposed one in the central market.</>
                      ) : (
                        <>Compre <strong>2 cartas</strong> do Main Deck para a mão <em>OU</em> troque o seu programa corporativo ativo por outro aberto no mercado central.</>
                      )}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid #D97706', paddingLeft: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: '#D97706' }}>
                      {language === 'en' ? '2. EXPLOIT (Costs 1 Action)' : '2. EXPLOIT (Custa 1 Ação)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4B4337', marginTop: '2px' }}>
                      {language === 'en' ? (
                        <>Deploy <strong>1 Vulnerability card</strong> from your hand into your Exploits Zone (max 3 deployed). The vulnerability must match the allowed classes in the program scope (or your archetype).</>
                      ) : (
                        <>Baixe <strong>1 carta de Vulnerabilidade</strong> da mão para a sua Zona de Exploits (máximo de 3 alocadas). A vulnerabilidade deve respeitar as classes permitidas no escopo do programa (ou seu arquétipo).</>
                      )}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid #16A34A', paddingLeft: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: '#16A34A' }}>
                      {language === 'en' ? '3. REPORT (Costs 2 Actions - ALWAYS THE FINAL ACTION OF THE TURN!)' : '3. REPORT (Custa 2 Ações - SEMPRE A ÚLTIMA AÇÃO DO TURNO!)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4B4337', marginTop: '2px' }}>
                      {language === 'en' ? (
                        <>
                          Submit the report! Executes the mandatory sequence:
                          <br />
                          <strong>Patch Check (Noisy 2D6)</strong> ➔ <strong>Bounty Payout</strong> (sum of vulnerabilities + bonus) ➔ <strong>Draw 1 Tool</strong> from Tool Deck ➔ <strong>Draw 1 Event</strong> ➔ <strong>Pick a new Program</strong>. Ends your turn immediately.
                        </>
                      ) : (
                        <>
                          Submeta o relatório! Executa a sequência obrigatória:
                          <br />
                          <strong>Teste de Patch (Noisy 2D6)</strong> ➔ <strong>Payout do Bounty</strong> (soma das vulnerabilidades + bônus) ➔ <strong>Compre 1 Tool</strong> do Tool Deck ➔ <strong>Saque 1 Evento</strong> ➔ <strong>Escolha um novo Programa</strong>. Encerra o seu turno imediatamente.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: AÇÕES LIVRES & MODO FURTIVO */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #2B2620', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#7C3AED', marginBottom: '8px' }}>
                  {language === 'en' ? 'FREE ACTIONS & STEALTH MODE' : 'AÇÕES LIVRES & MODO FURTIVO (STEALTH)'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#4B4337' }}>
                  <div>
                    <strong style={{ color: '#1E1B18' }}>
                      {language === 'en' ? '♻️ Recycle 2:1 (0 AP, 1x/turn):' : '♻️ Reciclagem 2:1 (0 AP, 1x/turno):'}
                    </strong>{' '}
                    {language === 'en'
                      ? 'Once per turn, discard any 2 cards from your hand to draw 1 new card from the Main Deck without spending AP.'
                      : 'Uma vez por turno, descarte 2 cartas quaisquer da sua mão para comprar 1 carta nova do Main Deck sem gastar ação.'}
                  </div>
                  <div>
                    <strong style={{ color: '#1E1B18' }}>
                      {language === 'en' ? '🔧 Install Tool:' : '🔧 Instalar Tool:'}
                    </strong>{' '}
                    {language === 'en'
                      ? 'Discard any 1 card from your hand to equip 1 Tool in your Tools Rack (max 3 installed tools).'
                      : 'Descarte 1 carta qualquer da mão para equipar 1 Ferramenta no Tools Rack (máximo de 3 ferramentas instaladas).'}
                  </div>
                  <div>
                    <strong style={{ color: '#1E1B18' }}>
                      {language === 'en' ? '⚡ Activate Tool:' : '⚡ Ativar Tool:'}
                    </strong>{' '}
                    {language === 'en'
                      ? 'Trigger the tactical effect of the Tool and discard it afterwards (it must already be installed in a slot).'
                      : 'Ative o efeito tático da Ferramenta e descarte-a em seguida (ela já precisa estar no slot).'}
                  </div>
                  <div style={{ background: '#ECFDF5', border: '1px solid #059669', padding: '8px 10px', borderRadius: '6px' }}>
                    {language === 'en' ? (
                      <>
                        <strong style={{ color: '#065F46' }}>🕶️ Stealth Mode (Pass Turn without Report):</strong> End your turn without submitting a report and with no vulnerabilities on the table to <strong>remove 1 Alert Token (🐞)</strong>! If you pass your turn with vulnerabilities on the table, roll the Stealth check (3D6, discard the highest die).
                      </>
                    ) : (
                      <>
                        <strong style={{ color: '#065F46' }}>🕶️ Modo Furtivo (Passar Turno sem Report):</strong> Termine o turno sem submeter relatório e com a mesa limpa de vulnerabilidades para <strong>remover 1 Token de Alerta (🐞)</strong>! Se passar o turno com vulnerabilidades na mesa, rola-se o teste Stealth (3D6, descarta o maior).
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* BLOCO 1: DADOS & LIMIARES DE PATCH */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #2B2620', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B91C1C', marginBottom: '8px' }}>
                  {language === 'en' ? 'PATCH SPEED CHECK (D6)' : 'TESTE DE PATCH SPEED (D6)'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ background: '#FAF6EE', border: '1px solid #D6CBB8', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '12px', color: '#1E1B18', fontFamily: 'monospace' }}>
                      {language === 'en' ? '⚡ NOISY (After Report)' : '⚡ NOISY (Após Report)'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B4337', marginTop: '2px' }}>
                      {language === 'en' ? <>Rolls <strong>2D6</strong> summed directly.</> : <>Rola <strong>2D6</strong> somados diretamente.</>}
                    </div>
                  </div>
                  <div style={{ background: '#FAF6EE', border: '1px solid #D6CBB8', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '12px', color: '#1E1B18', fontFamily: 'monospace' }}>
                      {language === 'en' ? '🕶️ STEALTH (End of Turn)' : '🕶️ STEALTH (Fim de Turno)'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B4337', marginTop: '2px' }}>
                      {language === 'en' ? <>Rolls <strong>3D6</strong>, discards the highest die and sums the 2 lowest.</> : <>Rola <strong>3D6</strong>, descarta o maior e soma os 2 menores.</>}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#4B4337', lineHeight: '1.4' }}>
                  <strong>{language === 'en' ? 'Corporate Defense Thresholds:' : 'Limiares Corporativos de Defesa:'}</strong>
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    <li><strong>{language === 'en' ? 'Slow:' : 'Lenta:'}</strong> {language === 'en' ? '10+ on dice' : '10+ nos dados'}</li>
                    <li><strong>{language === 'en' ? 'Moderate:' : 'Moderada:'}</strong> {language === 'en' ? '9+ on dice' : '9+ nos dados'}</li>
                    <li><strong>{language === 'en' ? 'Fast:' : 'Rápida:'}</strong> {language === 'en' ? '8+ on dice' : '8+ nos dados'}</li>
                    <li><strong>{language === 'en' ? 'Extreme:' : 'Extrema:'}</strong> {language === 'en' ? '7+ on dice' : '7+ nos dados'}</li>
                  </ul>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#B91C1C', fontWeight: '800' }}>
                    {language === 'en'
                      ? '⚠️ If the sum equals or exceeds the threshold = PATCH DEPLOYED!'
                      : '⚠️ Se a soma igualar ou superar o limiar = PATCH DEPLOYED!'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                    {language === 'en' ? (
                      <>🛡️ <strong>Bypass:</strong> Cancels discard and guarantees the Payout (+1 Alert Token; no Tool or consolation).</>
                    ) : (
                      <>🛡️ <strong>Bypass:</strong> Anula o descarte e garante o Payout (+1 Token de Alerta; sem Tool nem consolação).</>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCO 2: TABELA DE PAYOUTS POR RARIDADE */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #2B2620', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#166534', marginBottom: '8px' }}>
                  {language === 'en' ? 'BASE PAYOUT TABLE (PER CARD)' : 'TABELA DE VALORES BASE (PAYOUT POR CARTA)'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', textAlign: 'center' }}>
                  <div style={{ border: '1px solid #D6CBB8', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700' }}>{language === 'en' ? 'COMMON' : 'COMUM'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#166534' }}>{language === 'en' ? '+$1,500' : '+$1.500'}</div>
                  </div>
                  <div style={{ border: '1px solid #D6CBB8', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700' }}>{language === 'en' ? 'UNCOMMON' : 'INCOMUM'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#166534' }}>{language === 'en' ? '+$2,500' : '+$2.500'}</div>
                  </div>
                  <div style={{ border: '1px solid #D6CBB8', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700' }}>{language === 'en' ? 'RARE' : 'RARA'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#166534' }}>{language === 'en' ? '+$4,000' : '+$4.000'}</div>
                  </div>
                  <div style={{ border: '1px solid #D6CBB8', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700' }}>{language === 'en' ? 'EPIC' : 'ÉPICA'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#166534' }}>{language === 'en' ? '+$5,000' : '+$5.000'}</div>
                  </div>
                  <div style={{ border: '1px solid #D6CBB8', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#685F53', fontWeight: '700' }}>{language === 'en' ? 'LEGENDARY' : 'LENDÁRIA'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#166534' }}>{language === 'en' ? '+$6,000' : '+$6.000'}</div>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: TOKENS & MARCOS ESPECIAIS */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #2B2620', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#B45309', marginBottom: '8px' }}>
                  {language === 'en' ? 'TOKENS, MILESTONES & VICTORY CONDITION' : 'TOKENS, MARCOS & CONDIÇÃO DE VITÓRIA'}
                </div>

                <div style={{ fontSize: '12px', color: '#4B4337', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    {language === 'en' ? (
                      <><strong>🐝 Reputation:</strong> 2 tokens = 1 Reroll on Patch Check | +$500 each at final scoring.</>
                    ) : (
                      <><strong>🐝 Reputação:</strong> 2 tokens = 1 Reroll no Patch Check | +$500 cada na pontuação final.</>
                    )}
                  </div>
                  <div>
                    {language === 'en' ? (
                      <><strong>🐞 Alert:</strong> 2 active tokens = ⚠️ <strong>Immediate -$2,000 fine</strong> (accepting a Patch caps at 1🐞 without fine; using Bypass with 1🐞 adds the 2nd and charges -$2,000) | -$500 each at final scoring.</>
                    ) : (
                      <><strong>🐞 Alerta:</strong> 2 tokens ativos = ⚠️ <strong>Multa imediata de -$2.000</strong> (sofrer Patch aceito estaciona em 1🐞 sem multa; usar Bypass com 1🐞 soma o 2º e cobra -$2.000) | -$500 cada na pontuação final.</>
                    )}
                  </div>
                  <div>
                    {language === 'en' ? (
                      <>
                        <strong>📍 Board Milestones (on exact stop):</strong>{' '}
                        $4.5k First Headline (🐝+) | $9k On Security Radar (🐞+) | $13.5k VIP Invite (🐝+ 🛒) | $19k Trail Exposed (🐞+ 🗂️-) | $24.5k Elite Sponsorship (🛠️⚡) | $29k Keynote Star (🐝+ 🐞-) | $33.5k Tax Bite (💸 -$1.5k) | $38k Public Enemy #1 (🐞+).
                      </>
                    ) : (
                      <>
                        <strong>📍 Marcos da Trilha (ao parar exatamente):</strong>{' '}
                        $4.5k Primeira Manchete (🐝+) | $9k Na Mira da Segurança (🐞+) | $13.5k Convite VIP (🐝+ 🛒) | $19k Rastro Descoberto (🐞+ 🗂️-) | $24.5k Patrocínio de Elite (🛠️⚡) | $29k Estrela da Conferência (🐝+ 🐞-) | $33.5k Mordida do Leão (💸 -$1.5k) | $38k Inimigo Público nº 1 dos Bugs (🐞+).
                      </>
                    )}
                  </div>
                  <div>
                    {language === 'en' ? (
                      <><strong>🏆 Victory Condition:</strong> Reaching <strong>$40,000</strong> on the Honeycomb Track triggers the final round so all players complete equal turns, or the match ends after the 10th round. Highest total balance wins!</>
                    ) : (
                      <><strong>🏆 Condição de Vitória:</strong> Ao atingir <strong>$40.000</strong> na Trilha Honeycomb, a rodada atual vira a rodada final para todos jogarem o mesmo número de turnos; senão, encerra após a 10ª rodada. Maior saldo total vence!</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div style={{ padding: '12px 20px', borderTop: '2px solid #2B2620', background: '#F5EFEB', display: 'flex', justifyContent: 'flex-end', borderRadius: '0 0 9px 9px' }}>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{
              padding: '8px 20px',
              background: '#2B2620',
              color: '#FAF6EE',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {language === 'en' ? 'Got it' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
};

