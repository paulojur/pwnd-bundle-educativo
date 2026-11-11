import React, { useState } from 'react';
import { useBoardGame, AuditLogEntry, PlayerRoleId } from '../context/BoardGameContext';
import { X, Activity, Filter, ShieldAlert, Wrench, Sparkles, Layers, Award, CheckCircle2, Ban, ArrowUp, ArrowDown, Download, FileText } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ObserverMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  SETUP: { bg: '#F1F5F9', border: '#64748B', text: '#334155', icon: '🎲' },
  PROGRAM: { bg: '#FEF3C7', border: '#D97706', text: '#92400E', icon: '🎯' },
  RECON: { bg: '#E0F2FE', border: '#0284C7', text: '#0369A1', icon: '🔍' },
  EXPLOIT: { bg: '#FFEDD5', border: '#EA580C', text: '#9A3412', icon: '💉' },
  REPORT: { bg: '#DCFCE7', border: '#16A34A', text: '#166534', icon: '💰' },
  PATCH: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: '💥' },
  TOOL: { bg: '#E0E7FF', border: '#4F46E5', text: '#3730A3', icon: '🛠️' },
  EVENT: { bg: '#FAE8FF', border: '#C026D3', text: '#86198F', icon: '🚨' },
  ALERT: { bg: '#FFE4E6', border: '#E11D48', text: '#9F1239', icon: '🐞' },
  ARCHETYPE: { bg: '#F3E8FF', border: '#9333EA', text: '#6B21A8', icon: '★' },
  TURN: { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151', icon: '⏩' }
};

export const ObserverMetricsModal: React.FC<ObserverMetricsModalProps> = ({ isOpen, onClose }) => {
  const {
    auditLogs,
    playerMetrics,
    allPlayers,
    playerCount,
    currentTurn,
    deployedExploits
  } = useBoardGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('ALL');

  if (!isOpen) return null;

  const activePlayers = allPlayers.slice(0, playerCount);

  const filteredLogs = auditLogs.filter(entry => {
    if (selectedCategory !== 'ALL' && entry.category !== selectedCategory) return false;
    if (selectedPlayer !== 'ALL' && entry.playerId !== selectedPlayer) return false;
    return true;
  });

  const sortedStandings = [...activePlayers]
    .map(p => {
      const repBonus = (p.reputacaoTokens || 0) * 500;
      const alertPenalty = (p.alertaTokens || 0) * 500;
      return { p, repBonus, alertPenalty, finalTotal: p.score + repBonus - alertPenalty };
    })
    .sort((a, b) => (b.finalTotal - a.finalTotal) || (b.p.reputacaoTokens - a.p.reputacaoTokens) || (a.p.alertaTokens - b.p.alertaTokens));

  const handleExportMarkdown = () => {
    soundFx.playClick();
    const nowStr = new Date().toLocaleString('pt-BR');
    const fileStamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

    const lines: string[] = [];
    lines.push(`# 📊 PWNED! Relatório Oficial de Playtest & Telemetria`);
    lines.push(`- **Data / Hora**: ${nowStr}`);
    lines.push(`- **Rodada**: ${currentTurn}/10`);
    lines.push(`- **Jogadores na Mesa**: ${playerCount}`);
    lines.push(`- **Total de Eventos Auditados**: ${auditLogs.length}`);
    lines.push(``);
    lines.push(`## 🏆 Classificação & Contabilização Final`);
    lines.push(`| Pos | Jogador | Arquétipo | Bounty Base | Reputação (🐝 +$500) | Alertas (🐞 -$500) | Total Final |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    sortedStandings.forEach((s, idx) => {
      const medal = idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;
      lines.push(`| ${medal} | **${s.p.name}** | ${s.p.archetype.name} | $${s.p.score.toLocaleString('pt-BR')} | ${s.p.reputacaoTokens} (+$${s.repBonus}) | ${s.p.alertaTokens} (-$${s.alertPenalty}) | **$${s.finalTotal.toLocaleString('pt-BR')}** |`);
    });
    lines.push(``);
    lines.push(`## 📈 Telemetria Detalhada por Jogador`);
    lines.push(`| Jogador | Arquétipo | Reports OK | Bounty Bruto | Patches / Bypass | Multas 2🐞 (-$2k) | Tools Inst./Ativ. | Poder Arq. | Progs (Market/Deck) |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    activePlayers.forEach(p => {
      const m = playerMetrics[p.id];
      lines.push(`| **${p.name}** | ${p.archetype.name} | ${m.reportsCompleted} | $${m.totalBountyEarned.toLocaleString('pt-BR')} | ${m.patchesSuffered} / ${m.bypassUsed} | ${m.criticalAlarmPenalties}x (${m.alertsReceived}🐞 total) | ${m.toolsInstalled} / ${m.toolsActivatedOrTriggered}x | ${m.archetypeTriggers}x (+$${m.archetypeBountyBonus}) | ${m.programsPickedMarket} / ${m.programsPickedSurpriseDeck} |`);
    });
    lines.push(``);
    lines.push(`## 📜 Log Cronológico de Auditoria (${auditLogs.length} eventos)`);
    lines.push(``);
    [...auditLogs].reverse().forEach((entry, i) => {
      const cat = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.TURN;
      const who = entry.playerName ? `${entry.playerName}${entry.archetypeName ? ` (${entry.archetypeName})` : ''}` : 'Sistema';
      lines.push(`### ${i + 1}. ${cat.icon} [${entry.category}] Rodada ${entry.round} • ${entry.timestamp} — ${entry.title}`);
      lines.push(`- **Autor**: ${who} | **Status**: \`${entry.status}\``);
      lines.push(`- **Detalhes**: ${entry.details}`);
      lines.push(``);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwnd_relatorio_${fileStamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    soundFx.playClick();
    const nowStr = new Date().toLocaleString('pt-BR');
    const fileStamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

    const podiumRows = sortedStandings.map((s, idx) => {
      const medal = idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;
      return `<tr style="background:${idx === 0 ? '#FEF3C7' : '#FFFFFF'};font-weight:${idx === 0 ? 'bold' : 'normal'}">
        <td>${medal}</td>
        <td style="color:${s.p.color};font-weight:800">${s.p.name}</td>
        <td>${s.p.archetype.avatarIcon} ${s.p.archetype.name}</td>
        <td>$${s.p.score.toLocaleString('pt-BR')}</td>
        <td style="color:#B45309">🐝 ${s.p.reputacaoTokens} (+$${s.repBonus})</td>
        <td style="color:#B91C1C">🐞 ${s.p.alertaTokens} (-$${s.alertPenalty})</td>
        <td style="font-size:15px;font-weight:900;color:#047857">$${s.finalTotal.toLocaleString('pt-BR')}</td>
      </tr>`;
    }).join('');

    const telemetryCards = activePlayers.map(p => {
      const m = playerMetrics[p.id];
      const pVulns = deployedExploits.filter(e => e.playerId === p.id);
      return `<div style="border:2px solid ${p.color};border-radius:10px;padding:14px;background:#fff;min-width:260px;flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:8px">
          <div>
            <div style="font-size:15px;font-weight:900;color:#1E1B18">${p.name}</div>
            <div style="font-size:12px;color:${p.color};font-weight:700">${p.archetype.avatarIcon} ${p.archetype.name}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:900;color:#047857">$${p.score.toLocaleString('pt-BR')}</div>
            <div style="font-size:11px;color:#555">🐝 ${p.reputacaoTokens} | 🐞 ${p.alertaTokens}/2</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
          <div>🎯 <b>Alvo:</b> ${p.activeProgram?.name || 'Nenhum'}</div>
          <div>🃏 <b>Mão/Mesa:</b> ${p.hand.length} / ${pVulns.length} vulns</div>
          <div>💰 <b>Reports OK:</b> ${m.reportsCompleted} ($${m.totalBountyEarned.toLocaleString('pt-BR')})</div>
          <div>💥 <b>Patches/Bypass:</b> ${m.patchesSuffered} / ${m.bypassUsed}</div>
          <div>★ <b>Poder Arq.:</b> ${m.archetypeTriggers}x (+$${m.archetypeBountyBonus})</div>
          <div>🛠️ <b>Tools Inst./Disp.:</b> ${m.toolsInstalled} / ${m.toolsActivatedOrTriggered}x</div>
          <div>🛒 <b>Progs (Mkt/Deck):</b> ${m.programsPickedMarket} / ${m.programsPickedSurpriseDeck}</div>
          <div style="color:${m.criticalAlarmPenalties > 0 ? '#B91C1C' : '#333'};font-weight:${m.criticalAlarmPenalties > 0 ? '800' : '400'}">🚨 <b>Multas 2🐞 (-$2k):</b> ${m.criticalAlarmPenalties}x (${m.alertsReceived}🐞 total)</div>
        </div>
      </div>`;
    }).join('');

    const logItems = [...auditLogs].reverse().map((entry, idx) => {
      const cat = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.TURN;
      return `<div style="border-left:5px solid ${cat.border};background:#fff;border:1px solid #E2D7C5;border-left-width:5px;border-left-color:${cat.border};border-radius:6px;padding:10px 14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="background:${cat.bg};color:${cat.text};border:1px solid ${cat.border};padding:2px 6px;border-radius:4px;font-size:11px;font-weight:800">#${idx + 1} ${cat.icon} ${entry.category}</span>
            <span style="font-size:11px;color:#685F53;font-weight:700">[Rodada ${entry.round} • ${entry.timestamp}]</span>
            ${entry.playerName ? `<span style="font-size:12px;font-weight:800;color:#1E1B18">${entry.playerName} ${entry.archetypeName ? `<span style="color:#685F53;font-weight:normal">(${entry.archetypeName})</span>` : ''}</span>` : ''}
          </div>
          <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;background:#F1F5F9;color:#334155">${entry.status}</span>
        </div>
        <div style="font-size:13px;font-weight:800;color:#1E1B18;margin-bottom:2px">${entry.title}</div>
        <div style="font-size:12px;color:#4B4337;line-height:1.4">${entry.details}</div>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>PWNED! Relatório de Partida & Telemetria (${fileStamp})</title>
  <style>
    body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #FAF6EE; color: #1E1B18; margin: 0; padding: 24px; }
    .container { max-width: 1180px; margin: 0 auto; }
    h1, h2 { margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #fff; border: 2px solid #2B2620; border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #E2D7C5; text-align: left; font-size: 13px; }
    th { background: #2B2620; color: #FAF6EE; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="background:#2B2620;color:#FAF6EE;padding:20px 24px;border-radius:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <h1 style="font-size:22px;margin:0 0 4px 0;color:#F59E0B">📊 PWNED! Bug Bounty Chaos — Relatório de Partida</h1>
        <div style="font-size:12px;color:#D6CBB8">Exportado em ${nowStr} • Rodada ${currentTurn}/10 • ${playerCount} Jogadores • ${auditLogs.length} Eventos Auditados</div>
      </div>
    </div>

    <h2 style="font-size:16px;color:#B45309;text-transform:uppercase">🏆 Pódio & Contabilização Oficial (Bounty + Reputação - Alertas)</h2>
    <table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Jogador</th>
          <th>Arquétipo</th>
          <th>Bounty Base</th>
          <th>Reputação (+$500)</th>
          <th>Alertas (-$500)</th>
          <th>Total Final</th>
        </tr>
      </thead>
      <tbody>
        ${podiumRows}
      </tbody>
    </table>

    <h2 style="font-size:16px;color:#B45309;text-transform:uppercase">📈 Telemetria de Balanceamento por Jogador</h2>
    <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:28px">
      ${telemetryCards}
    </div>

    <h2 style="font-size:16px;color:#B45309;text-transform:uppercase">📜 Histórico Cronológico da Partida (Do Início ao Fim)</h2>
    <div>
      ${logItems}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwnd_relatorio_${fileStamp}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '96%',
          maxWidth: '1280px',
          maxHeight: '92vh',
          background: '#FAF6EE',
          border: '3px solid #2B2620',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          color: '#1E1B18',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '16px 22px',
            background: '#2B2620',
            color: '#FAF6EE',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="#F59E0B" />
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontFamily: 'monospace', fontWeight: '900' }}>
                📊 MÉTRICAS DO OBSERVADOR & LOG DE AUDITORIA COMPLETO
              </h2>
              <div style={{ fontSize: '10.5px', color: '#D6CBB8', fontFamily: 'monospace' }}>
                Rodada {currentTurn}/10 • {auditLogs.length} eventos auditados na partida • Playtest & Balanceamento
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportHtml}
              style={{
                background: '#16A34A',
                color: '#fff',
                border: '1px solid #4ADE80',
                borderRadius: '6px',
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Baixar relatório visual organizado em HTML para abrir em qualquer navegador"
            >
              <Download size={14} /> Baixar Relatório Visual (.HTML)
            </button>

            <button
              onClick={handleExportMarkdown}
              style={{
                background: '#0284C7',
                color: '#fff',
                border: '1px solid #38BDF8',
                borderRadius: '6px',
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Baixar log estruturado em Markdown (.md)"
            >
              <FileText size={14} /> Baixar Log (.MD)
            </button>

            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              style={{
                background: '#B91C1C',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <X size={15} /> Fechar Painel
            </button>
          </div>
        </div>

        {/* BODY SCROLLABLE */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* 1. TABELA DE MÉTRICAS POR JOGADOR / ARQUÉTIPO */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '900', fontFamily: 'monospace', color: '#B45309', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
              📈 Desempenho por Jogador & Arquétipo (Telemetria de Balanceamento):
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {activePlayers.map(p => {
                const m = playerMetrics[p.id] || {
                  reportsCompleted: 0,
                  totalBountyEarned: 0,
                  patchesSuffered: 0,
                  bypassUsed: 0,
                  alertsReceived: 0,
                  criticalAlarmPenalties: 0,
                  toolsInstalled: 0,
                  toolsActivatedOrTriggered: 0,
                  archetypeTriggers: 0,
                  archetypeBountyBonus: 0,
                  programsPickedMarket: 0,
                  programsPickedSurpriseDeck: 0,
                  eventsDrawn: 0
                };
                const activeExp = deployedExploits.filter(e => e.playerId === p.id).length;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#FFFFFF',
                      border: `2px solid ${p.color}`,
                      borderRadius: '10px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2D7C5', paddingBottom: '8px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E1B18' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: p.color }}>
                          {p.archetype.avatarIcon} {p.archetype.name} ({p.archetype.specialPowers?.[0]})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#047857' }}>
                          ${p.score.toLocaleString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#685F53' }}>
                          🐝 {p.reputacaoTokens} | 🐞 {p.alertaTokens}/2
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '9.5px', color: '#3A332A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                      <div>🎯 <strong>Alvo:</strong> {p.activeProgram?.name || 'Nenhum'}</div>
                      <div>🃏 <strong>Mão / Mesa:</strong> {p.hand.length} / {activeExp} vulns</div>
                      <div>💰 <strong>Reports OK:</strong> {m.reportsCompleted}</div>
                      <div>💥 <strong>Patches / Bypass:</strong> {m.patchesSuffered} / {m.bypassUsed}</div>
                      <div>★ <strong>Poder Arquétipo:</strong> {m.archetypeTriggers}x ({m.archetypeBountyBonus >= 0 ? `+$${m.archetypeBountyBonus}` : `-$${Math.abs(m.archetypeBountyBonus)}`})</div>
                      <div>🛠️ <strong>Tools Inst./Disparos:</strong> {m.toolsInstalled} / {m.toolsActivatedOrTriggered}x</div>
                      <div>🛒 <strong>Progs (Exp./Deck):</strong> {m.programsPickedMarket} / {m.programsPickedSurpriseDeck}</div>
                      <div style={{ color: m.criticalAlarmPenalties > 0 ? '#B91C1C' : '#3A332A' }}>
                        🚨 <strong>Multas 2🐞 (-$2k):</strong> {m.criticalAlarmPenalties}x ({m.alertsReceived} 🐞 total)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. FILTROS DO LOG */}
          <div
            style={{
              background: '#F1E9DC',
              border: '1.5px solid #2B2620',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Filter size={14} color="#685F53" />
              <span style={{ fontSize: '10.5px', fontWeight: '800', fontFamily: 'monospace', color: '#1E1B18' }}>
                Categoria:
              </span>
              {['ALL', 'PROGRAM', 'EVENT', 'TOOL', 'ARCHETYPE', 'REPORT', 'PATCH', 'ALERT', 'EXPLOIT', 'RECON', 'SETUP'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { soundFx.playClick(); setSelectedCategory(cat); }}
                  style={{
                    padding: '4px 8px',
                    background: selectedCategory === cat ? '#2B2620' : '#FFFFFF',
                    color: selectedCategory === cat ? '#FAF6EE' : '#2B2620',
                    border: '1px solid #2B2620',
                    borderRadius: '4px',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  {cat === 'ALL' ? 'TODAS' : cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', fontFamily: 'monospace', color: '#1E1B18' }}>
                Jogador:
              </span>
              <select
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                style={{
                  padding: '4px 8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #2B2620',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  fontFamily: 'monospace'
                }}
              >
                <option value="ALL">Todos os Jogadores</option>
                {activePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.archetype.name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. TIMELINE COMPLETA DE EVENTOS AUDITADOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#685F53', fontFamily: 'monospace', fontSize: '12px' }}>
                Nenhum registro encontrado para este filtro.
              </div>
            ) : (
              filteredLogs.map(entry => {
                const styleInfo = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.TURN;
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: styleInfo.bg,
                      border: `1.5px solid ${styleInfo.border}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontFamily: 'monospace',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px' }}>{styleInfo.icon}</span>
                        <span style={{ fontSize: '9.5px', fontWeight: '900', background: styleInfo.border, color: '#fff', padding: '1px 6px', borderRadius: '3px' }}>
                          {entry.category}
                        </span>
                        <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#685F53' }}>
                          [Rodada {entry.round} • {entry.timestamp}]
                        </span>
                        {entry.playerName && (
                          <span style={{ fontSize: '10px', fontWeight: '900', color: '#1E1B18', background: 'rgba(255,255,255,0.7)', padding: '1px 6px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.15)' }}>
                            {entry.playerName} {entry.archetypeName ? `(${entry.archetypeName})` : ''}
                          </span>
                        )}
                        <strong style={{ fontSize: '11.5px', color: styleInfo.text }}>
                          {entry.title}
                        </strong>
                      </div>

                      {entry.status && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: '900',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background:
                              entry.status === 'EXECUTED' ? '#16A34A' :
                              entry.status === 'BLOCKED' ? '#DC2626' :
                              entry.status === 'PENALTY' ? '#991B1B' : '#0284C7',
                            color: '#FFFFFF'
                          }}
                        >
                          {entry.status === 'EXECUTED' ? '✓ EXECUTADO' :
                           entry.status === 'BLOCKED' ? '🛡️ BLOQUEADO / IMUNE' :
                           entry.status === 'PENALTY' ? '🚨 PENALIDADE' : '⚡ PASSIVA DISPAROU'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#1E1B18', lineHeight: '1.4', paddingLeft: '22px' }}>
                      {entry.details}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL INTERATIVO PARA FUZZSTORM (T-06), HEX KITCHEN (T-07), PANÓPTICO & n00b
// ─────────────────────────────────────────────────────────────────────────────
export const DeckPeekModal: React.FC = () => {
  const { pendingDeckPeek, resolveDeckPeek } = useBoardGame();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [flipRemainingOrder, setFlipRemainingOrder] = useState<boolean>(false);

  if (!pendingDeckPeek) return null;

  const { mode, title, subtitle, cards } = pendingDeckPeek;
  const remainingIndices = cards.map((_, i) => i).filter(i => i !== selectedIndex);
  const orderedRemaining = flipRemainingOrder ? [...remainingIndices].reverse() : remainingIndices;

  const actionLabel =
    mode === 'hexKitchen' || mode === 'panoptico'
      ? '🗑️ DESCARTAR ESTA CARTA'
      : '✋ COMPRAR ESTA PARA A MÃO';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          width: '95%',
          background: '#FAF6EE',
          border: '3px solid #2B2620',
          borderRadius: '14px',
          padding: '22px',
          color: '#1E1B18',
          fontFamily: 'monospace',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: '900', color: '#B45309', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {subtitle}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0' }}>
            {title}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {cards.map((item, idx) => {
            const isPicked = idx === selectedIndex;
            const topPos = orderedRemaining.indexOf(idx) + 1;

            return (
              <div
                key={idx}
                onClick={() => { soundFx.playClick(); setSelectedIndex(idx); }}
                style={{
                  background: isPicked ? '#FEF3C7' : '#FFFFFF',
                  border: isPicked ? '2.5px solid #D97706' : '1.5px solid #2B2620',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: '#685F53' }}>
                      CARTA #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '8.5px',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: isPicked ? '#D97706' : '#0284C7',
                        color: '#fff'
                      }}
                    >
                      {isPicked ? (mode === 'hexKitchen' || mode === 'panoptico' ? 'DESCARTAR' : 'SUA ESCOLHA') : `${topPos}ª DO TOPO`}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E1B18', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4B4337', lineHeight: '1.35' }}>
                    {item.description}
                  </div>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #E2D7C5', fontSize: '9px', fontWeight: '800', color: isPicked ? '#92400E' : '#0369A1', textAlign: 'center' }}>
                  {isPicked ? `✓ ${actionLabel}` : `Volta para o topo (${topPos}ª posição)`}
                </div>
              </div>
            );
          })}
        </div>

        {orderedRemaining.length === 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <button
              onClick={() => { soundFx.playClick(); setFlipRemainingOrder(prev => !prev); }}
              style={{
                padding: '6px 14px',
                background: '#E0F2FE',
                color: '#0369A1',
                border: '1.5px solid #0284C7',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '900',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              🔄 Inverter Ordem das 2 Cartas Restantes no Topo ({cards[orderedRemaining[0]]?.name} ➔ {cards[orderedRemaining[1]]?.name})
            </button>
          </div>
        )}

        <button
          onClick={() => {
            soundFx.playClick();
            resolveDeckPeek(selectedIndex, orderedRemaining);
            setSelectedIndex(0);
            setFlipRemainingOrder(false);
          }}
          style={{
            width: '100%',
            padding: '11px',
            background: '#16A34A',
            color: '#FFFFFF',
            border: '2px solid #2B2620',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '900',
            fontFamily: 'monospace',
            cursor: 'pointer'
          }}
        >
          ✅ CONFIRMAR ESCOLHA E ORDEM DO TOPO
        </button>
      </div>
    </div>
  );
};

