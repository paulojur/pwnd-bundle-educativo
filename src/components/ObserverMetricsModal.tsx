import React, { useState } from 'react';
import { useBoardGame, AuditLogEntry, PlayerRoleId } from '../context/BoardGameContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedDynamicText, getLocalizedArchetype, getLocalizedPlayerName, getLocalizedProgram, getLocalizedCardDescription, getLocalizedEvent } from '../i18n/cardTranslations';
import { X, Activity, Filter, ShieldAlert, Wrench, Sparkles, Layers, Award, CheckCircle2, Ban, ArrowUp, ArrowDown, Download, FileText, CloudUpload, Database, Copy } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { supabaseSync } from '../utils/supabaseSync';

export interface MatchHighlightPlayerTitle {
  playerId: string;
  playerName: string;
  color: string;
  badge: string;
  reason: string;
}

export interface MatchHighlightsSummary {
  biggestHit: {
    playerName: string;
    programName: string;
    amount: number;
    round: number;
    combo: string | null;
  } | null;
  worstPatch: {
    playerName: string;
    programName: string;
    round: number;
  } | null;
  cleanRunLeader: {
    playerName: string;
    reportsCompleted: number;
  } | null;
  playerTitles: MatchHighlightPlayerTitle[];
}

export function computeMatchHighlights(
  auditLogs: AuditLogEntry[],
  players: Array<{ id: string; name: string; color?: string; reputacaoTokens?: number; alertaTokens?: number }>,
  metricsByRole: Record<string, any>,
  language: string = 'pt'
): MatchHighlightsSummary {
  const isEn = language === 'en';
  let biggestHit: MatchHighlightsSummary['biggestHit'] = null;
  let worstPatch: MatchHighlightsSummary['worstPatch'] = null;

  const chronoLogs = [...(auditLogs || [])].reverse();
  for (const entry of chronoLogs) {
    if (entry.category === 'REPORT' && entry.title) {
      const m = entry.title.match(/Report Concluído \(\+\$([\d.,]+)\) em \[([^\]]+)\]/);
      if (m) {
        const amount = parseInt(m[1].replace(/[.,]/g, ''), 10) || 0;
        const comboMatch = (entry.details || '').match(/Combo:\s*\[([^\]]+)\]/);
        const combo = comboMatch ? comboMatch[1] : null;
        if (!biggestHit || amount > biggestHit.amount) {
          biggestHit = {
            playerName: entry.playerName || (isEn ? 'Player' : 'Jogador'),
            programName: m[2],
            amount,
            round: entry.round || 1,
            combo
          };
        }
      }
    }
    if (entry.category === 'PATCH' && entry.title && entry.title.includes('Patch Aceito')) {
      const progMatch = (entry.details || '').match(/\[([^\]]+)\]/);
      worstPatch = {
        playerName: entry.playerName || (isEn ? 'Player' : 'Jogador'),
        programName: progMatch ? progMatch[1] : (isEn ? 'Target Program' : 'Programa Alvo'),
        round: entry.round || 1
      };
    }
  }

  let cleanRunLeader: MatchHighlightsSummary['cleanRunLeader'] = null;
  const playerTitles: MatchHighlightPlayerTitle[] = [];

  for (const p of players) {
    const m = metricsByRole?.[p.id] || {};
    const reports = m.reportsCompleted || 0;
    const alerts = m.alertsReceived || 0;
    const bypass = m.bypassUsed || 0;
    const patches = m.patchesSuffered || 0;
    const toolsUsed = (m.toolsInstalled || 0) + (m.toolsActivatedOrTriggered || 0);
    const rep = p.reputacaoTokens || 0;
    const criticalFines = m.criticalAlarmPenalties || 0;

    if (alerts === 0 && reports > 0) {
      if (!cleanRunLeader || reports > cleanRunLeader.reportsCompleted) {
        cleanRunLeader = { playerName: p.name, reportsCompleted: reports };
      }
    }

    let badge = '';
    let reason = '';
    if (bypass > 0 && bypass >= patches) {
      badge = isEn ? 'Bypass Specialist' : 'Mestre do Contorno';
      reason = isEn ? `Dodged ${bypass} security patch(es)` : `Ignorou ${bypass} patch(es) sem perder a mesa`;
    } else if (alerts === 0 && reports >= 1) {
      badge = isEn ? 'Quiet Operator' : 'Rastro Invisível';
      reason = isEn ? `${reports} report(s) with 0 alerts` : `${reports} report(s) com 0 alertas recebidos`;
    } else if (toolsUsed >= 3) {
      badge = isEn ? 'Walking Toolkit' : 'Arsenal Ambulante';
      reason = isEn
        ? `${m.toolsInstalled || 0} tool(s), ${m.toolsActivatedOrTriggered || 0} activation(s)`
        : `${m.toolsInstalled || 0} tool(s) e ${m.toolsActivatedOrTriggered || 0} disparo(s)`;
    } else if (rep >= 2) {
      badge = isEn ? 'Press Favorite' : 'Queridinho da Mídia';
      reason = isEn ? `Finished with ${rep} Reputation token(s)` : `Acumulou ${rep} ficha(s) de Reputação`;
    } else if (patches >= 2) {
      badge = isEn ? 'Patch Magnet' : 'Ímã de Patch';
      reason = isEn ? `Took ${patches} security patch(es) head-on` : `Encarou ${patches} patch(es) da segurança`;
    } else if (criticalFines >= 1) {
      badge = isEn ? 'Walking Siren' : 'Alarme Vivo';
      reason = isEn ? `Hit the 2-bug penalty ${criticalFines}x` : `Estorou o limite de alertas ${criticalFines}x`;
    } else if (reports >= 1) {
      badge = isEn ? 'Steady Hunter' : 'Caçador Preciso';
      reason = isEn ? `${reports} validated report(s)` : `${reports} report(s) entregue(s)`;
    } else {
      badge = isEn ? 'Recon Operator' : 'Em Reconhecimento';
      reason = isEn ? `${m.eventsDrawn || 0} event(s) faced` : `${m.eventsDrawn || 0} evento(s) encarado(s)`;
    }

    playerTitles.push({
      playerId: p.id,
      playerName: p.name,
      color: p.color || '#B45309',
      badge,
      reason
    });
  }

  return { biggestHit, worstPatch, cleanRunLeader, playerTitles };
}

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
  const { language } = useLanguage();
  const {
    auditLogs,
    playerMetrics,
    allPlayers,
    playerCount,
    currentTurn,
    deployedExploits,
    saveMatchLogToDatabase
  } = useBoardGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('ALL');
  const [dbSaveStatus, setDbSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [dbSaveError, setDbSaveError] = useState<string | null>(null);
  const [showCloudHistory, setShowCloudHistory] = useState<boolean>(false);
  const [cloudLogsLoading, setCloudLogsLoading] = useState<boolean>(false);
  const [cloudLogs, setCloudLogs] = useState<any[]>([]);
  const [copiedCloudId, setCopiedCloudId] = useState<string | null>(null);

  const handleToggleCloudHistory = async () => {
    soundFx.playClick();
    if (showCloudHistory) {
      setShowCloudHistory(false);
      return;
    }
    setShowCloudHistory(true);
    setCloudLogsLoading(true);
    const { data, error } = await supabaseSync.getMatchLogs(30);
    setCloudLogsLoading(false);
    if (error) {
      setDbSaveError(typeof error === 'string' ? error : error?.message || 'Erro ao buscar logs do Supabase.');
    } else if (Array.isArray(data)) {
      setCloudLogs(data);
    }
  };

  const buildFullMarkdownFromCloudRow = (row: any): string => {
    const rawLogs: AuditLogEntry[] = Array.isArray(row.audit_logs) ? row.audit_logs : [];
    const existingMd: string = typeof row.markdown_report === 'string' ? row.markdown_report : '';
    const countInMd = (existingMd.match(/^### \d+\./gm) || []).length;

    // Se o markdown_report já contiver todos os eventos de audit_logs, usa-o diretamente;
    // caso contrário, reconstrói integralmente todos os eventos a partir do JSONB audit_logs (sem limite de tamanho).
    if (existingMd && countInMd >= rawLogs.length && rawLogs.length > 0) {
      return existingMd;
    }

    const createdAtStr = row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
    const lines: string[] = [];
    lines.push(`# 📊 PWNED! Relatório Oficial de Playtest & Telemetria`);
    lines.push(`- **Data / Hora**: ${createdAtStr}`);
    lines.push(`- **Sala**: ${row.room_code || 'SOLO_LOCAL'}`);
    lines.push(`- **Rodada**: ${row.round || 1}/10`);
    lines.push(`- **Jogadores na Mesa**: ${row.player_count || 2}`);
    lines.push(`- **Vencedor**: ${row.winner || 'Em andamento'}`);
    lines.push(`- **Total de Eventos Auditados**: ${rawLogs.length}`);
    lines.push(``);

    if (row.metrics && typeof row.metrics === 'object') {
      const cloudEntries = Object.entries(row.metrics).slice(0, row.player_count || 6);
      const cloudPlayers = cloudEntries
        .filter(([, m]: [string, any]) => Boolean(m))
        .map(([roleId, m]: [string, any]) => {
          const logForRole = rawLogs.find(e => e.playerId === roleId && e.playerName);
          return {
            id: roleId,
            name: m.playerName || logForRole?.playerName || roleId,
            reputacaoTokens: m.reputacaoTokens || 0,
            alertaTokens: m.alertsReceived || 0
          };
        });
      const cloudHl = computeMatchHighlights(rawLogs, cloudPlayers, row.metrics, 'pt');
      if (cloudHl.biggestHit || cloudHl.worstPatch || cloudHl.playerTitles.length > 0) {
        lines.push(`## 🏅 Destaques da Partida`);
        if (cloudHl.biggestHit) {
          const comboTxt = cloudHl.biggestHit.combo ? ` | Combo: ${cloudHl.biggestHit.combo}` : '';
          lines.push(`- **Maior Tacada**: **${cloudHl.biggestHit.playerName}** faturou **+$${cloudHl.biggestHit.amount.toLocaleString('pt-BR')}** em **${cloudHl.biggestHit.programName}** (Rodada ${cloudHl.biggestHit.round}${comboTxt})`);
        }
        if (cloudHl.worstPatch) {
          lines.push(`- **Maior Tombo (Patch)**: **${cloudHl.worstPatch.playerName}** teve a mesa fechada em **${cloudHl.worstPatch.programName}** na Rodada ${cloudHl.worstPatch.round}`);
        }
        if (cloudHl.cleanRunLeader) {
          lines.push(`- **Operação Mais Limpa**: **${cloudHl.cleanRunLeader.playerName}** entregou ${cloudHl.cleanRunLeader.reportsCompleted} report(s) sem tomar alertas`);
        }
        cloudHl.playerTitles.forEach(pt => {
          lines.push(`- **${pt.playerName} (${pt.badge})**: ${pt.reason}`);
        });
        lines.push(``);
      }

      lines.push(`## 📈 Telemetria Detalhada por Jogador`);
      lines.push(`| Jogador | Arquétipo | Reports OK | Bounty Bruto | Patches / Bypass | Multas 2🐞 (-$2k) | Tools Inst./Ativ. | Poder Arq. | Progs (Market/Deck) |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
      const metricEntries = cloudEntries;
      metricEntries.forEach(([roleId, m]: [string, any]) => {
        if (!m) return;
        const logForRole = rawLogs.find(e => e.playerId === roleId && e.playerName);
        const pName = m.playerName || logForRole?.playerName || roleId;
        const aName = m.archetypeName || logForRole?.archetypeName || '-';
        lines.push(`| **${pName}** | ${aName} | ${m.reportsCompleted || 0} | $${(m.totalBountyEarned || 0).toLocaleString('pt-BR')} | ${m.patchesSuffered || 0} / ${m.bypassUsed || 0} | ${m.criticalAlarmPenalties || 0}x (${m.alertsReceived || 0}🐞 total) | ${m.toolsInstalled || 0} / ${m.toolsActivatedOrTriggered || 0}x | ${m.archetypeTriggers || 0}x (+$${m.archetypeBountyBonus || 0}) | ${m.programsPickedMarket || 0} / ${m.programsPickedSurpriseDeck || 0} |`);
      });
      lines.push(``);

      const fbEntries = metricEntries.filter(([, m]: [string, any]) => m && m.feedback);
      if (fbEntries.length > 0) {
        lines.push(`## 💬 Avaliação dos Jogadores (Feedback de Playtest)`);
        lines.push(`| Jogador | Arquétipo | Ritmo / Duração | Caos / Punição | Clareza das Regras | Comentário / Observação |`);
        lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
        fbEntries.forEach(([roleId, m]: [string, any]) => {
          const logForRole = rawLogs.find(e => e.playerId === roleId && e.playerName);
          const pName = m.playerName || logForRole?.playerName || roleId;
          const aName = m.archetypeName || logForRole?.archetypeName || '-';
          const fb = m.feedback;
          lines.push(`| **${pName}** | ${aName} | ${fb.pacing} | ${fb.chaosBalance} | ${fb.rulesClarity} | ${fb.comment || '-'} |`);
        });
        lines.push(``);
      }
    }

    lines.push(`## 📜 Log Cronológico de Auditoria (${rawLogs.length} eventos)`);
    lines.push(``);
    [...rawLogs].reverse().forEach((entry, i) => {
      const cat = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.TURN;
      const who = entry.playerName ? `${entry.playerName}${entry.archetypeName ? ` (${entry.archetypeName})` : ''}` : 'Sistema';
      lines.push(`### ${i + 1}. ${cat.icon} [${entry.category}] Rodada ${entry.round} • ${entry.timestamp} - ${entry.title}`);
      lines.push(`- **Autor**: ${who} | **Status**: \`${entry.status}\``);
      lines.push(`- **Detalhes**: ${entry.details}`);
      lines.push(``);
    });

    return lines.join('\n');
  };

  const handleDownloadCloudRowMd = (row: any) => {
    soundFx.playClick();
    const md = buildFullMarkdownFromCloudRow(row);
    const stamp = (row.created_at || new Date().toISOString()).slice(0, 16).replace(/[:T]/g, '-');
    const code = (row.room_code || 'MATCH').replace(/[^a-zA-Z0-9_-]/g, '');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwnd_relatorio_${code}_${stamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCloudRowMd = (row: any) => {
    soundFx.playClick();
    const md = buildFullMarkdownFromCloudRow(row);
    navigator.clipboard.writeText(md);
    setCopiedCloudId(row.id);
    setTimeout(() => setCopiedCloudId(null), 2500);
  };

  const handleSaveToCloud = async () => {
    soundFx.playClick();
    setDbSaveStatus('saving');
    setDbSaveError(null);
    const result = await saveMatchLogToDatabase();
    if (result.success) {
      setDbSaveStatus('success');
      setTimeout(() => setDbSaveStatus('idle'), 4000);
    } else {
      setDbSaveStatus('error');
      const errMsg = typeof result.error === 'string'
        ? result.error
        : result.error?.message || 'Falha ao salvar. Verifique se a tabela match_logs foi criada no Supabase.';
      setDbSaveError(errMsg);
      setTimeout(() => setDbSaveStatus('idle'), 7000);
    }
  };

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

  const matchHighlights = computeMatchHighlights(auditLogs, activePlayers, playerMetrics, language);

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

    if (matchHighlights.biggestHit || matchHighlights.worstPatch || matchHighlights.playerTitles.length > 0) {
      lines.push(`## 🏅 Destaques da Partida`);
      if (matchHighlights.biggestHit) {
        const comboTxt = matchHighlights.biggestHit.combo ? ` | Combo: ${matchHighlights.biggestHit.combo}` : '';
        lines.push(`- **Maior Tacada**: **${matchHighlights.biggestHit.playerName}** faturou **+$${matchHighlights.biggestHit.amount.toLocaleString('pt-BR')}** em **${matchHighlights.biggestHit.programName}** (Rodada ${matchHighlights.biggestHit.round}${comboTxt})`);
      }
      if (matchHighlights.worstPatch) {
        lines.push(`- **Maior Tombo (Patch)**: **${matchHighlights.worstPatch.playerName}** teve a mesa fechada em **${matchHighlights.worstPatch.programName}** na Rodada ${matchHighlights.worstPatch.round}`);
      }
      if (matchHighlights.cleanRunLeader) {
        lines.push(`- **Operação Mais Limpa**: **${matchHighlights.cleanRunLeader.playerName}** entregou ${matchHighlights.cleanRunLeader.reportsCompleted} report(s) sem tomar alertas`);
      }
      matchHighlights.playerTitles.forEach(pt => {
        lines.push(`- **${pt.playerName} (${pt.badge})**: ${pt.reason}`);
      });
      lines.push(``);
    }

    lines.push(`## 📈 Telemetria Detalhada por Jogador`);
    lines.push(`| Jogador | Arquétipo | Reports OK | Bounty Bruto | Patches / Bypass | Multas 2🐞 (-$2k) | Tools Inst./Ativ. | Poder Arq. | Progs (Market/Deck) |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    activePlayers.forEach(p => {
      const m = playerMetrics[p.id];
      lines.push(`| **${p.name}** | ${p.archetype.name} | ${m.reportsCompleted} | $${m.totalBountyEarned.toLocaleString('pt-BR')} | ${m.patchesSuffered} / ${m.bypassUsed} | ${m.criticalAlarmPenalties}x (${m.alertsReceived}🐞 total) | ${m.toolsInstalled} / ${m.toolsActivatedOrTriggered}x | ${m.archetypeTriggers}x (+$${m.archetypeBountyBonus}) | ${m.programsPickedMarket} / ${m.programsPickedSurpriseDeck} |`);
    });
    lines.push(``);

    const playersWithFb = activePlayers.filter(p => playerMetrics[p.id]?.feedback);
    if (playersWithFb.length > 0) {
      lines.push(`## 💬 Avaliação dos Jogadores (Feedback de Playtest)`);
      lines.push(`| Jogador | Arquétipo | Ritmo / Duração | Caos / Punição | Clareza das Regras | Comentário / Observação |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
      playersWithFb.forEach(p => {
        const fb = playerMetrics[p.id].feedback!;
        lines.push(`| **${p.name}** | ${p.archetype.name} | ${fb.pacing} | ${fb.chaosBalance} | ${fb.rulesClarity} | ${fb.comment || '-'} |`);
      });
      lines.push(``);
    }

    lines.push(`## 📜 Log Cronológico de Auditoria (${auditLogs.length} eventos)`);
    lines.push(``);
    [...auditLogs].reverse().forEach((entry, i) => {
      const cat = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.TURN;
      const who = entry.playerName ? `${entry.playerName}${entry.archetypeName ? ` (${entry.archetypeName})` : ''}` : 'Sistema';
      lines.push(`### ${i + 1}. ${cat.icon} [${entry.category}] Rodada ${entry.round} • ${entry.timestamp} - ${entry.title}`);
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

    const highlightsHtmlItems: string[] = [];
    if (matchHighlights.biggestHit) {
      const comboTxt = matchHighlights.biggestHit.combo ? ` | Combo: ${matchHighlights.biggestHit.combo}` : '';
      highlightsHtmlItems.push(`<li><b>Maior Tacada:</b> ${matchHighlights.biggestHit.playerName} faturou +$${matchHighlights.biggestHit.amount.toLocaleString('pt-BR')} em ${matchHighlights.biggestHit.programName} (Rodada ${matchHighlights.biggestHit.round}${comboTxt})</li>`);
    }
    if (matchHighlights.worstPatch) {
      highlightsHtmlItems.push(`<li><b>Maior Tombo (Patch):</b> ${matchHighlights.worstPatch.playerName} teve a mesa fechada em ${matchHighlights.worstPatch.programName} na Rodada ${matchHighlights.worstPatch.round}</li>`);
    }
    if (matchHighlights.cleanRunLeader) {
      highlightsHtmlItems.push(`<li><b>Operação Mais Limpa:</b> ${matchHighlights.cleanRunLeader.playerName} entregou ${matchHighlights.cleanRunLeader.reportsCompleted} report(s) sem tomar alertas</li>`);
    }
    matchHighlights.playerTitles.forEach(pt => {
      highlightsHtmlItems.push(`<li><b>${pt.playerName} (${pt.badge}):</b> ${pt.reason}</li>`);
    });
    const highlightsHtmlBlock = highlightsHtmlItems.length > 0
      ? `<h2 style="font-size:16px;color:#B45309;text-transform:uppercase">🏅 Destaques da Partida</h2>
         <ul style="background:#FFFBEB;border:2px solid #D97706;border-radius:8px;padding:14px 28px;margin-bottom:24px;font-size:13px;line-height:1.6">
           ${highlightsHtmlItems.join('')}
         </ul>`
      : '';

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
        <h1 style="font-size:22px;margin:0 0 4px 0;color:#F59E0B">📊 PWNED! Bug Bounty Chaos - Relatório de Partida</h1>
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

    ${highlightsHtmlBlock}

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
                {language === 'en'
                  ? '📊 OBSERVER METRICS & FULL AUDIT LOG'
                  : '📊 MÉTRICAS DO OBSERVADOR & LOG DE AUDITORIA COMPLETO'}
              </h2>
              <div style={{ fontSize: '10.5px', color: '#D6CBB8', fontFamily: 'monospace' }}>
                {language === 'en'
                  ? `Round ${currentTurn}/10 • ${auditLogs.length} audited events in match • Playtest & Balancing`
                  : `Rodada ${currentTurn}/10 • ${auditLogs.length} eventos auditados na partida • Playtest & Balanceamento`}
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
              title={language === 'en' ? 'Download visual HTML report to open in any browser' : 'Baixar relatório visual organizado em HTML para abrir em qualquer navegador'}
            >
              <Download size={14} /> {language === 'en' ? 'Download Visual Report (.HTML)' : 'Baixar Relatório Visual (.HTML)'}
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
              title={language === 'en' ? 'Download structured Markdown log (.md)' : 'Baixar log estruturado em Markdown (.md)'}
            >
              <FileText size={14} /> {language === 'en' ? 'Download Log (.MD)' : 'Baixar Log (.MD)'}
            </button>

            <button
              onClick={handleSaveToCloud}
              disabled={dbSaveStatus === 'saving'}
              style={{
                background: dbSaveStatus === 'success' ? '#16A34A' : dbSaveStatus === 'error' ? '#DC2626' : '#7C3AED',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '11.5px',
                cursor: dbSaveStatus === 'saving' ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title={language === 'en' ? 'Save this full log directly to Supabase for remote query' : 'Gravar este log completo diretamente no Supabase para consulta remota'}
            >
              <CloudUpload size={14} />
              {dbSaveStatus === 'saving'
                ? (language === 'en' ? 'Saving...' : 'Gravando...')
                : dbSaveStatus === 'success'
                ? (language === 'en' ? 'Saved to Supabase! ✓' : 'Salvo no Supabase! ✓')
                : dbSaveStatus === 'error'
                ? (language === 'en' ? 'Save Error ⚠️' : 'Erro ao Salvar ⚠️')
                : (language === 'en' ? 'Save to DB ☁️' : 'Gravar no Banco ☁️')}
            </button>

            <button
              onClick={handleToggleCloudHistory}
              style={{
                background: showCloudHistory ? '#D97706' : '#334155',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
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
              title={language === 'en' ? 'Fetch and download full match logs stored in Supabase (no 8KB UI truncation)' : 'Consultar e baixar logs completos (100% dos eventos) gravados no Supabase sem o corte visual do Table Editor'}
            >
              <Database size={14} />
              {language === 'en' ? 'Cloud History ☁️' : 'Histórico do Banco ☁️'}
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
              <X size={15} /> {language === 'en' ? 'Close Panel' : 'Fechar Painel'}
            </button>
          </div>
        </div>

        {dbSaveError && (
          <div style={{ background: '#FEE2E2', borderBottom: '1px solid #DC2626', padding: '8px 20px', fontSize: '11px', color: '#991B1B', fontFamily: 'monospace' }}>
            ⚠️ <strong>{language === 'en' ? 'Supabase Notice:' : 'Aviso Supabase:'}</strong> {dbSaveError}
          </div>
        )}

        {/* BODY SCROLLABLE */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* PAINEL DE HISTÓRICO DO SUPABASE (BAIXA 100% DOS EVENTOS SEM O CORTE DE 8KB DO TABLE EDITOR) */}
          {showCloudHistory && (
            <div
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                border: '2px solid #38BDF8',
                borderRadius: '10px',
                padding: '14px 16px',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#38BDF8' }}>
                    {language === 'en'
                      ? '☁️ SAVED MATCHES IN SUPABASE (FULL LOGS VIA API)'
                      : '☁️ PARTIDAS GRAVADAS NO SUPABASE (DOWNLOAD INTEGRAL VIA API)'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                    {language === 'en'
                      ? 'Note: Supabase Table Editor web UI truncates text cells at ~8 KB (~40 events). Downloading here fetches 100% of events from JSONB/API.'
                      : 'Nota: O Table Editor web do Supabase corta células de texto em ~8 KB (~40 eventos). Baixando por aqui você obtém 100% dos eventos gravados.'}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    soundFx.playClick();
                    setCloudLogsLoading(true);
                    const { data } = await supabaseSync.getMatchLogs(30);
                    setCloudLogsLoading(false);
                    if (Array.isArray(data)) setCloudLogs(data);
                  }}
                  style={{
                    background: '#1E293B',
                    color: '#38BDF8',
                    border: '1px solid #38BDF8',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {cloudLogsLoading ? (language === 'en' ? 'Loading...' : 'Atualizando...') : (language === 'en' ? '↻ Refresh List' : '↻ Atualizar Lista')}
                </button>
              </div>

              {cloudLogsLoading ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                  {language === 'en' ? 'Loading match logs from Supabase...' : 'Buscando partidas gravadas no Supabase...'}
                </div>
              ) : cloudLogs.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                  {language === 'en' ? 'No match logs found in match_logs table.' : 'Nenhuma partida encontrada na tabela match_logs.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                  {cloudLogs.map((row: any) => {
                    const eventsCount = Array.isArray(row.audit_logs) ? row.audit_logs.length : 0;
                    const dateFormatted = row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '-';
                    const isFinished = row.winner && row.winner !== 'Em andamento';
                    return (
                      <div
                        key={row.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px',
                          background: '#1E293B',
                          border: `1px solid ${isFinished ? '#16A34A' : '#334155'}`,
                          borderRadius: '6px',
                          padding: '8px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '11.5px' }}>
                          <span style={{ background: '#0F172A', color: '#38BDF8', padding: '2px 7px', borderRadius: '4px', fontWeight: '900', border: '1px solid #0284C7' }}>
                            {row.room_code || 'SOLO_LOCAL'}
                          </span>
                          <span style={{ color: '#CBD5E1' }}>{dateFormatted}</span>
                          <span style={{ color: '#FBBF24', fontWeight: '800' }}>
                            {language === 'en' ? `Round ${row.round}/10` : `Rodada ${row.round}/10`} ({row.player_count}P)
                          </span>
                          <span style={{ color: isFinished ? '#4ADE80' : '#94A3B8', fontWeight: '800' }}>
                            🏆 {row.winner || 'Em andamento'}
                          </span>
                          <span style={{ background: '#312E81', color: '#C7D2FE', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                            📜 {eventsCount} {language === 'en' ? 'events' : 'eventos'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleCopyCloudRowMd(row)}
                            style={{
                              background: copiedCloudId === row.id ? '#16A34A' : '#334155',
                              color: '#fff',
                              border: '1px solid #64748B',
                              borderRadius: '4px',
                              padding: '4px 9px',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Copy size={12} />
                            {copiedCloudId === row.id
                              ? (language === 'en' ? 'Copied!' : 'Copiado!')
                              : (language === 'en' ? 'Copy .MD' : 'Copiar .MD')}
                          </button>
                          <button
                            onClick={() => handleDownloadCloudRowMd(row)}
                            style={{
                              background: '#0284C7',
                              color: '#fff',
                              border: '1px solid #38BDF8',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '10.5px',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Download size={12} />
                            {language === 'en' ? `Download Full .MD (${eventsCount})` : `Baixar .MD Completo (${eventsCount})`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 1. TABELA DE MÉTRICAS POR JOGADOR / ARQUÉTIPO */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '900', fontFamily: 'monospace', color: '#B45309', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
              {language === 'en'
                ? '📈 Performance by Player & Archetype (Balancing Telemetry):'
                : '📈 Desempenho por Jogador & Arquétipo (Telemetria de Balanceamento):'}
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
                const locArch = getLocalizedArchetype(p.archetype, language);

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
                          {getLocalizedPlayerName(p.name, language)}
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: p.color }}>
                          {p.archetype.avatarIcon} {locArch.name} ({locArch.title})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#047857' }}>
                          ${p.score.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#685F53' }}>
                          🐝 {p.reputacaoTokens} | 🐞 {p.alertaTokens}/2
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '9.5px', color: '#3A332A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                      <div>🎯 <strong>{language === 'en' ? 'Target:' : 'Alvo:'}</strong> {p.activeProgram ? getLocalizedProgram(p.activeProgram, language).name : (language === 'en' ? 'None' : 'Nenhum')}</div>
                      <div>🃏 <strong>{language === 'en' ? 'Hand / Table:' : 'Mão / Mesa:'}</strong> {p.hand.length} / {activeExp} vulns</div>
                      <div>💰 <strong>Reports OK:</strong> {m.reportsCompleted}</div>
                      <div>💥 <strong>Patches / Bypass:</strong> {m.patchesSuffered} / {m.bypassUsed}</div>
                      <div>★ <strong>{language === 'en' ? 'Archetype Power:' : 'Poder Arquétipo:'}</strong> {m.archetypeTriggers}x ({m.archetypeBountyBonus >= 0 ? `+$${m.archetypeBountyBonus}` : `-$${Math.abs(m.archetypeBountyBonus)}`})</div>
                      <div>🛠️ <strong>{language === 'en' ? 'Tools Inst./Trig.:' : 'Tools Inst./Disparos:'}</strong> {m.toolsInstalled} / {m.toolsActivatedOrTriggered}x</div>
                      <div>🛒 <strong>{language === 'en' ? 'Progs (Exp./Deck):' : 'Progs (Exp./Deck):'}</strong> {m.programsPickedMarket} / {m.programsPickedSurpriseDeck}</div>
                      <div style={{ color: m.criticalAlarmPenalties > 0 ? '#B91C1C' : '#3A332A' }}>
                        🚨 <strong>{language === 'en' ? '2🐞 Fines (-$2k):' : 'Multas 2🐞 (-$2k):'}</strong> {m.criticalAlarmPenalties}x ({m.alertsReceived} 🐞 total)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1B. DESTAQUES DA PARTIDA */}
          {(matchHighlights.biggestHit || matchHighlights.worstPatch || matchHighlights.playerTitles.length > 0) && (
            <div
              style={{
                background: '#FFFBEB',
                border: '2px solid #D97706',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: '900', color: '#92400E', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} color="#D97706" />
                {language === 'en' ? 'Match Highlights' : 'Destaques da Partida'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '10px', fontSize: '10.5px' }}>
                {matchHighlights.biggestHit && (
                  <div style={{ background: '#FFFFFF', border: '1.5px solid #16A34A', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '900', color: '#166534' }}>💰 {language === 'en' ? 'Biggest Hit' : 'Maior Tacada'}</div>
                    <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                      <strong>{matchHighlights.biggestHit.playerName}</strong>: +${matchHighlights.biggestHit.amount.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')} ({matchHighlights.biggestHit.programName}, R{matchHighlights.biggestHit.round})
                    </div>
                    {matchHighlights.biggestHit.combo && (
                      <div style={{ fontSize: '9.5px', color: '#4B5563', marginTop: '2px' }}>Combo: {matchHighlights.biggestHit.combo}</div>
                    )}
                  </div>
                )}

                {matchHighlights.worstPatch && (
                  <div style={{ background: '#FFFFFF', border: '1.5px solid #DC2626', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '900', color: '#991B1B' }}>💥 {language === 'en' ? 'Hardest Patch' : 'Maior Tombo (Patch)'}</div>
                    <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                      <strong>{matchHighlights.worstPatch.playerName}</strong> {language === 'en' ? 'lost the table on' : 'perdeu a mesa em'} {matchHighlights.worstPatch.programName} (R{matchHighlights.worstPatch.round})
                    </div>
                  </div>
                )}

                {matchHighlights.cleanRunLeader && (
                  <div style={{ background: '#FFFFFF', border: '1.5px solid #0284C7', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '900', color: '#0369A1' }}>👻 {language === 'en' ? 'Cleanest Run' : 'Operação Mais Limpa'}</div>
                    <div style={{ color: '#1E1B18', marginTop: '2px' }}>
                      <strong>{matchHighlights.cleanRunLeader.playerName}</strong>: {matchHighlights.cleanRunLeader.reportsCompleted} {language === 'en' ? 'report(s) with 0 alerts' : 'report(s) sem tomar alertas'}
                    </div>
                  </div>
                )}
              </div>

              {matchHighlights.playerTitles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {matchHighlights.playerTitles.map(pt => (
                    <div
                      key={pt.playerId}
                      style={{
                        background: '#FFFFFF',
                        border: `1.5px solid ${pt.color}`,
                        borderRadius: '6px',
                        padding: '5px 8px',
                        fontSize: '10px',
                        color: '#1E1B18'
                      }}
                    >
                      <strong style={{ color: pt.color }}>{pt.playerName}</strong> ({pt.badge}): {pt.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                {language === 'en' ? 'Category:' : 'Categoria:'}
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
                  {cat === 'ALL' ? (language === 'en' ? 'ALL' : 'TODAS') : cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', fontFamily: 'monospace', color: '#1E1B18' }}>
                {language === 'en' ? 'Player:' : 'Jogador:'}
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
                <option value="ALL">{language === 'en' ? 'All Players' : 'Todos os Jogadores'}</option>
                {activePlayers.map(p => (
                  <option key={p.id} value={p.id}>{getLocalizedPlayerName(p.name, language)} ({getLocalizedArchetype(p.archetype, language).name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. TIMELINE COMPLETA DE EVENTOS AUDITADOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#685F53', fontFamily: 'monospace', fontSize: '12px' }}>
                {language === 'en' ? 'No records found for this filter.' : 'Nenhum registro encontrado para este filtro.'}
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
                          [{language === 'en' ? `Round ${entry.round}` : `Rodada ${entry.round}`} • {entry.timestamp}]
                        </span>
                        {entry.playerName && (
                          <span style={{ fontSize: '10px', fontWeight: '900', color: '#1E1B18', background: 'rgba(255,255,255,0.7)', padding: '1px 6px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.15)' }}>
                            {getLocalizedPlayerName(entry.playerName, language)} {entry.archetypeName ? `(${entry.archetypeName})` : ''}
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
                          {entry.status === 'EXECUTED' ? (language === 'en' ? '✓ EXECUTED' : '✓ EXECUTADO') :
                           entry.status === 'BLOCKED' ? (language === 'en' ? '🛡️ BLOCKED / IMMUNE' : '🛡️ BLOQUEADO / IMUNE') :
                           entry.status === 'PENALTY' ? (language === 'en' ? '🚨 PENALTY' : '🚨 PENALIDADE') :
                           (language === 'en' ? '⚡ PASSIVE TRIGGERED' : '⚡ PASSIVA DISPAROU')}
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
  const { language } = useLanguage();
  const { pendingDeckPeek, resolveDeckPeek } = useBoardGame();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [flipRemainingOrder, setFlipRemainingOrder] = useState<boolean>(false);

  if (!pendingDeckPeek) return null;

  const { mode, title, subtitle, cards } = pendingDeckPeek;
  const remainingIndices = cards.map((_, i) => i).filter(i => i !== selectedIndex);
  const orderedRemaining = flipRemainingOrder ? [...remainingIndices].reverse() : remainingIndices;

  const actionLabel =
    mode === 'hexKitchen' || mode === 'panoptico'
      ? (language === 'en' ? '🗑️ DISCARD THIS CARD' : '🗑️ DESCARTAR ESTA CARTA')
      : (language === 'en' ? '✋ DRAW THIS TO HAND' : '✋ COMPRAR ESTA PARA A MÃO');

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
            {getLocalizedDynamicText(subtitle, language)}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0' }}>
            {getLocalizedDynamicText(title, language)}
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
                      {language === 'en' ? `CARD #${idx + 1}` : `CARTA #${idx + 1}`}
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
                      {isPicked
                        ? (mode === 'hexKitchen' || mode === 'panoptico'
                            ? (language === 'en' ? 'DISCARD' : 'DESCARTAR')
                            : (language === 'en' ? 'YOUR PICK' : 'SUA ESCOLHA'))
                        : (language === 'en' ? `#${topPos} FROM TOP` : `${topPos}ª DO TOPO`)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E1B18', marginBottom: '4px' }}>
                    {(mode === 'hexKitchen' || mode === 'panoptico')
                      ? getLocalizedEvent({ id: item.id, name: item.name, simpleDescription: item.description }, language).name
                      : item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4B4337', lineHeight: '1.35' }}>
                    {(mode === 'hexKitchen' || mode === 'panoptico')
                      ? getLocalizedEvent({ id: item.id, name: item.name, simpleDescription: item.description }, language).description
                      : item.raw
                      ? getLocalizedCardDescription(item.raw, language)
                      : item.description}
                  </div>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #E2D7C5', fontSize: '9px', fontWeight: '800', color: isPicked ? '#92400E' : '#0369A1', textAlign: 'center' }}>
                  {isPicked
                    ? `✓ ${actionLabel}`
                    : (language === 'en' ? `Returns to top (#${topPos} position)` : `Volta para o topo (${topPos}ª posição)`)}
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
              {language === 'en'
                ? `🔄 Swap Order of 2 Remaining Cards on Top (${cards[orderedRemaining[0]]?.name} ➔ ${cards[orderedRemaining[1]]?.name})`
                : `🔄 Inverter Ordem das 2 Cartas Restantes no Topo (${cards[orderedRemaining[0]]?.name} ➔ ${cards[orderedRemaining[1]]?.name})`}
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
          {language === 'en' ? '✅ CONFIRM CHOICE AND TOP ORDER' : '✅ CONFIRMAR ESCOLHA E ORDEM DO TOPO'}
        </button>
      </div>
    </div>
  );
};

