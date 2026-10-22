import React, { useState } from 'react';
import { BookOpen, X, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface RulebookHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulebookHelpModal: React.FC<RulebookHelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'turn' | 'patch' | 'programs' | 'archetypes'>('turn');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="terminal-box"
        style={{
          maxWidth: '720px',
          width: '92%',
          maxHeight: '85vh',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--cyber-blue)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--cyber-blue)" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyber-blue)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                GUIA OFICIAL DE REGRAS V1.0
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                PWND! — Bug Bounty Chaos Manual
              </h2>
            </div>
          </div>
          <button onClick={() => { soundFx.playClick(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          {[
            { id: 'turn', label: '1. Ações do Turno' },
            { id: 'patch', label: '2. Patch Speed (D6)' },
            { id: 'programs', label: '3. Escopo & Bounties' },
            { id: 'archetypes', label: '4. Arquétipos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { soundFx.playClick(); setActiveTab(tab.id as unknown as 'turn'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '6px', fontSize: '12px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {activeTab === 'turn' && (
            <div>
              <h3 style={{ color: 'var(--cyber-blue)', fontSize: '14px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                Estutura do Turno (Escolha EXATAMENTE 1 ação):
              </h3>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>1. RECON:</strong> Compre 2 cartas do baralho principal (+1 carta se tiver <em>PortSweep</em>). Limite de mão: 6 cartas (9 para Old Guard).</li>
                <li><strong>2. EXPLOIT:</strong> Jogue 1 carta de vulnerabilidade para sua mesa. Exige respeitar o <em>Scope</em> do programa ativo e pagar os custos de ferramentas (com suporte de Injection Lab, Endpoint Lab, SpiderScan, Interceptor Pro).</li>
                <li><strong>3. REPORT:</strong> Submete todas as vulnerabilidades da sua mesa. Soma o valor de CVSS, multiplica pelo fator da empresa (x1 a x10) e avança seu token no <strong>Bounty Track</strong> ($1.000 por casa).</li>
              </ul>
            </div>
          )}

          {activeTab === 'patch' && (
            <div>
              <h3 style={{ color: 'var(--amber-glow)', fontSize: '14px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                Patch Speed Check (Rolagem de Dado D6):
              </h3>
              <p style={{ marginBottom: '10px' }}>
                No final de cada rodada, se você mantiver vulnerabilidades expostas na mesa, rola 1 dado D6 contra a velocidade da empresa:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '10px' }}>
                <div>• <strong>Lenta:</strong> Patch dispara no resultado <strong>6</strong> (16,6% de risco)</div>
                <div>• <strong>Moderada:</strong> Patch dispara nos resultados <strong>5 ou 6</strong> (33,3% de risco)</div>
                <div>• <strong>Rápida:</strong> Patch dispara nos resultados <strong>4, 5 ou 6</strong> (50% de risco)</div>
                <div>• <strong>Extrema:</strong> Patch dispara nos resultados <strong>3, 4, 5 ou 6</strong> (66,6% de risco)</div>
              </div>
              <p style={{ color: 'var(--alert-red)' }}>
                <strong>Penalidade de PATCH DEPLOYED!:</strong> Descarta todas as vulnerabilidades da mesa, recua 3 casas na Bounty Track (mínimo $0) e fecha o programa ativo!
                <br />
                <em>Defesa: Use a carta 0-Day Reserve no slot de Defuse para anular o prejuízo!</em>
              </p>
            </div>
          )}

          {activeTab === 'programs' && (
            <div>
              <h3 style={{ color: 'var(--terminal-green)', fontSize: '14px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                Faixas de Recompensa & Multiplicadores:
              </h3>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>🟢 <strong>Low Tier (x1):</strong> GovPortal, EduConnect (Patch Lento)</li>
                <li>🟡 <strong>Medium Tier (x2):</strong> ShopAll, SocialHive, GameVerse (Patch Moderado)</li>
                <li>🟠 <strong>High Tier (x5):</strong> BankSafe, HealthLock (Patch Rápido)</li>
                <li>🔴 <strong>Critical Tier (x10):</strong> CloudNine (Patch Extremo - Recompensa Máxima!)</li>
              </ul>
            </div>
          )}

          {activeTab === 'archetypes' && (
            <div>
              <h3 style={{ color: 'var(--electric-purple-light)', fontSize: '14px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                Poderes dos Arquétipos:
              </h3>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>🌱 <strong>n00b:</strong> Ganha +1 habilidade passiva permanente a cada Report concluído.</li>
                <li>🧠 <strong>The Old Guard:</strong> Mão expandida de 9 cartas, limite de 1 Report por rodada.</li>
                <li>⚡ <strong>Bug Hunter:</strong> 2 Reports por turno (limitado a vulnerabilidades de severidade Low/Medium).</li>
                <li>🎭 <strong>Social Engineer:</strong> Escolha quem sofre o efeito de cartas de Evento de Caos.</li>
                <li>⚔️ <strong>Red Teamer:</strong> Ignora todas as restrições de escopo (-30% de taxa no pagamento).</li>
                <li>🛡️ <strong>The Pentester:</strong> Imune a Duplicate Report! e Patch dispara apenas no número 6.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
