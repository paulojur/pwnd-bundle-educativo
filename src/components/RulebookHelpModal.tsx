import React, { useState } from 'react';
import { BookOpen, X, ShieldAlert, CheckCircle, HelpCircle, ExternalLink, Dices, Award, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface RulebookHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulebookHelpModal: React.FC<RulebookHelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'turn' | 'patch' | 'tokens' | 'bounty' | 'manual'>('turn');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '780px',
          width: '92%',
          maxHeight: '88vh',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--cyber-blue, #00e5ff)',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
          background: '#0d111a'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="#00e5ff" />
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#00e5ff', letterSpacing: '3px', textTransform: 'uppercase' }}>
                PLAYER AID & MANUAL OFICIAL V1.4
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', margin: 0 }}>
                PWND! — Guia Rápido de Regras
              </h2>
            </div>
          </div>
          <button onClick={() => { soundFx.playClick(); onClose(); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'turn', label: '1. O Turno (3 Ações)' },
            { id: 'patch', label: '2. Patch Speed (D6)' },
            { id: 'tokens', label: '3. Alerta 🐞 & Reputação 🐝' },
            { id: 'bounty', label: '4. Tabela de Payout' },
            { id: 'manual', label: '📖 Manual Completo HTML' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { soundFx.playClick(); setActiveTab(tab.id as any); }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: activeTab === tab.id ? '#00e5ff' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000' : '#9ca3af',
                fontWeight: '700',
                fontSize: '11px',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1' }}>
          {activeTab === 'turn' && (
            <div>
              <h3 style={{ color: '#00e5ff', fontSize: '14px', fontFamily: 'monospace', marginBottom: '8px' }}>
                Cada jogador tem direito a 3 Ações por turno:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #00e5ff' }}>
                  <strong style={{ color: '#fff' }}>RECON (Custa 1 Ação):</strong>
                  <div>Compre 2 cartas do Main Deck OU troque o seu programa por outro do mercado (ao trocar voluntariamente, descarte seus exploits ativos).</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #00ff66' }}>
                  <strong style={{ color: '#fff' }}>EXPLOIT (Custa 1 Ação):</strong>
                  <div>Baixe 1 carta de vulnerabilidade da sua mão para a sua Zona de Exploits, respeitando as classes aceitas pelo seu programa. <em>Limite máximo de 3 exploits simultâneos.</em></div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #ff334b' }}>
                  <strong style={{ color: '#fff' }}>REPORT (Custa 2 Ações — SEMPRE A ÚLTIMA AÇÃO DO TURNO):</strong>
                  <div>
                    Submeta seu relatório! Rola 2D6 somados no teste de Patch (Modo Noisy). Se passar:
                    <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      <li><strong>Receba o Payout:</strong> Some o valor das vulnerabilidades + bônus do programa na Bounty Track. Se houver carta Épica/Lendária, ganhe <strong>1 Token de Reputação (🐝)</strong>.</li>
                      <li><strong>Compre 1 Tool:</strong> Saque 1 carta do Tool Deck.</li>
                      <li><strong>Saque e Ative 1 Evento:</strong> Saque 1 Event Card e aplique na mesa! Descarte os exploits e pegue um novo programa. Encerra o turno.</li>
                    </ol>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 184, 0, 0.08)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #ffb800' }}>
                  <strong style={{ color: '#ffb800' }}>Ações Livres (não gastam pontos de ação):</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    <li><strong>Reciclagem 2:1 (0 AP — 1x/turno):</strong> Uma vez por turno, descarte 2 cartas quaisquer da mão para comprar 1 carta nova do Main Deck.</li>
                    <li><strong>Instalar Tool:</strong> 1x por turno, descarte 1 carta qualquer da mão para equipar 1 Tool no seu rack (máx 3).</li>
                    <li><strong>Ativar Tool:</strong> Aplique o poder e descarte a carta.</li>
                    <li><strong>Modo Furtivo:</strong> Termine o turno sem Report, sem Patch e com Exploits vazio para remover 1 Token de Alerta.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patch' && (
            <div>
              <h3 style={{ color: '#ffb800', fontSize: '14px', fontFamily: 'monospace', marginBottom: '8px' }}>
                Patch Speed Check (Mecânica D6 V1.4)
              </h3>
              <p style={{ marginBottom: '10px' }}>
                A segurança corporativa monitora suas atividades. Se os dados igualarem ou superarem o limiar da empresa, ocorre o <strong>PATCH DEPLOYED!</strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255, 51, 75, 0.08)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 51, 75, 0.2)' }}>
                  <strong style={{ color: '#ff334b' }}>MODO NOISY (2D6 somados)</strong>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    Aplicado ao realizar <strong>REPORT</strong> ou se houver qualquer vulnerabilidade com a tag <strong>[NOISY]</strong> na sua mesa.
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 229, 255, 0.08)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                  <strong style={{ color: '#00e5ff' }}>MODO STEALTH (3D6, descarta o maior)</strong>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    Rola 3D6 no fim do turno caso só tenha baixado cartas silenciosas e passado o turno sem reportar.
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#00e5ff' }}>
                    <th style={{ padding: '8px' }}>Velocidade do Programa</th>
                    <th style={{ padding: '8px' }}>Limiar de Patch (Soma D6)</th>
                    <th style={{ padding: '8px' }}>Risco Noisy (2D6)</th>
                    <th style={{ padding: '8px' }}>Risco Stealth (3D6 drop max)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}><strong>Lenta</strong></td>
                    <td style={{ padding: '8px', color: '#ff334b', fontWeight: 'bold' }}>10+ (10, 11, 12)</td>
                    <td style={{ padding: '8px' }}>16,7%</td>
                    <td style={{ padding: '8px' }}>5,1%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}><strong>Moderada</strong></td>
                    <td style={{ padding: '8px', color: '#ff334b', fontWeight: 'bold' }}>9+ (9, 10, 11, 12)</td>
                    <td style={{ padding: '8px' }}>27,8%</td>
                    <td style={{ padding: '8px' }}>10,6%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}><strong>Rápida</strong></td>
                    <td style={{ padding: '8px', color: '#ff334b', fontWeight: 'bold' }}>8+ (8, 9, 10, 11, 12)</td>
                    <td style={{ padding: '8px' }}>41,7%</td>
                    <td style={{ padding: '8px' }}>19,4%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}><strong>Extrema</strong></td>
                    <td style={{ padding: '8px', color: '#ff334b', fontWeight: 'bold' }}>7+ (7, 8, 9, 10, 11, 12)</td>
                    <td style={{ padding: '8px' }}>58,3%</td>
                    <td style={{ padding: '8px' }}>31,9%</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '12px', background: 'rgba(255,51,75,0.08)', padding: '10px', borderRadius: '6px', border: '1px solid #ff334b' }}>
                <strong style={{ color: '#ff334b' }}>Consequência do Patch Deployed:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                  Descarta todos os exploits e o programa ativo. Receba <strong>+1 Token de Alerta (🐞)</strong> apenas se estiver com 0🐞 (estaciona em 1/2🐞 sem multa) e compre <strong>1 carta de consolação</strong> do Main Deck.
                  <br />
                  <em>Defesa do Bypass:</em> Se tiver carta de Bypass no Safeguard, anule a perda e garanta o payout (soma +1🐞 mesmo se já tiver 1🐞, disparando multa de -$2.000 ao atingir 2/2🐞; descarta o Bypass, sem Tool nem consolação).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div>
              <h3 style={{ color: '#00ff66', fontSize: '14px', fontFamily: 'monospace', marginBottom: '8px' }}>
                Economia dos Tokens (18 Alertas 🐞 / 18 Reputações 🐝)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(255,51,75,0.06)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ff334b' }}>
                  <h4 style={{ color: '#ff334b', margin: '0 0 6px 0', fontSize: '13px' }}>🐞 Tokens de Alerta (Atenção do Blue Team)</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                    <li><strong>Alarme Crítico (2 Tokens de Alerta):</strong> Ao acumular 2 Alertas (via Bypass ou cartas/eventos), perca <strong>$2.000</strong> na Bounty Track imediatamente e devolva os 2 tokens ao banco central. <em>Nota:</em> Aceitar um Patch normal sem Bypass estaciona no máximo em 1/2🐞 e não dispara a multa.</li>
                    <li><strong>Penalidade de Fim de Jogo:</strong> Se terminar a 10ª rodada com 1 Alerta restante, desconte <strong>-$500</strong> do seu total.</li>
                    <li><strong>Limpeza Furtiva:</strong> Fim de turno sem report, sem patch e mesa vazia devolve 1 Alerta ao suprimento.</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,184,0,0.06)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ffb800' }}>
                  <h4 style={{ color: '#ffb800', margin: '0 0 6px 0', fontSize: '13px' }}>🐝 Tokens de Reputação (Bounty Bees)</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                    <li><strong>Como Ganhar:</strong> Todo Report com sucesso que incluir pelo menos 1 carta Épica ou Lendária concede <strong>1 Token de Reputação</strong> (limite de 1 por report).</li>
                    <li><strong>Reroll de Patch:</strong> Gaste <strong>2 Tokens de Reputação</strong> para rolar novamente 1 dos dados no teste de Patch!</li>
                    <li><strong>Valor Final:</strong> Cada token de reputação mantido vale <strong>+$500</strong> no fim do jogo.</li>
                    <li><strong>Roubo de Reputação:</strong> Um report de risco extremo (2 Lendárias OU 3 Épicas no mesmo report) rouba 1 Reputação de um oponente.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bounty' && (
            <div>
              <h3 style={{ color: '#00e5ff', fontSize: '14px', fontFamily: 'monospace', marginBottom: '8px' }}>
                Tabela de Payout Base & Casas Especiais
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>COMUM</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>+$1.500</div>
                </div>
                <div style={{ background: 'rgba(57,211,83,0.1)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#00ff66' }}>INCOMUM</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff66' }}>+$2.500</div>
                </div>
                <div style={{ background: 'rgba(0,229,255,0.1)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#00e5ff' }}>RARA</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00e5ff' }}>+$4.000</div>
                </div>
                <div style={{ background: 'rgba(168,85,247,0.1)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#c084fc' }}>ÉPICA</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc' }}>+$5.000</div>
                </div>
                <div style={{ background: 'rgba(255,184,0,0.1)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#ffb800' }}>LENDÁRIA</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb800' }}>+$6.000</div>
                </div>
              </div>

              <h4 style={{ color: '#fff', fontSize: '12px', margin: '10px 0 6px 0' }}>Milestones Especiais na Bounty Track (0 a $40k):</h4>
              <div style={{ fontSize: '11px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $4.5k: 🐝 Ganhe 1 Reputação</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $9.0k: 🐞 Receba 1 Alerta</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $13.5k: 🐝🛒 Reputação + Compre 1 Tool</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $19.0k: 🐞🗂️− Alerta + Descarte 1 carta</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $24.5k: 🛠️⚡ Instale 1 Tool grátis</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $29.0k: 🐝🐞− Reputação + Remova 1 Alerta</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $33.5k: 💸 Penalidade (-$1.500)</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>• $38.0k: 🐞 Receba 1 Alerta</div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <BookOpen size={48} color="#00e5ff" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', marginBottom: '8px' }}>
                Manual Completo de Regras Oficiais (V1.4)
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', maxWidth: '480px', margin: '0 auto 16px' }}>
                Você pode abrir o manual oficial com diagrama de componentes, compêndio das 80 vulnerabilidades, 48 ferramentas, 24 eventos e cenários avançados em uma nova aba do navegador:
              </p>
              <a
                href="/pwned-manual-sucesso-v1.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#00e5ff',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: '800',
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}
              >
                Abrir Manual Completo V1.4 <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
