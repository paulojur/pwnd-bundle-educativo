import React, { useState } from 'react';
import { CARDS_V2, CardV2 } from '../data/cardsDataV2';
import { ARCHETYPES, PROGRAM_CARDS } from '../data/cardsData';
import { FULL_80_VULNERABILITIES, FULL_12_TOOLS, FULL_3_DEFUSES } from '../data/full80DeckData';
import { FULL_24_EVENTS, EventCardData } from '../data/full24EventsData';
import { Printer, X, Filter, FileText } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { getCardStyle, getSlotStyle } from '../utils/pnp-dimensions';

interface PrintAndPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const PrintAndPlayModal: React.FC<PrintAndPlayModalProps> = ({ isOpen, onClose }) => {
  const getFlatValueLabel = (card: CardV2) => {
    if (card.type === 'tool') return 'FERRAMENTA';
    if (card.type === 'defuse') return 'SAFEGUARD';
    if ((card as any).type === 'event') return 'EVENTO';

    switch (card.rarity) {
      case 'Common': return '+$1.5k';
      case 'Uncommon': return '+$2.5k';
      case 'Rare': return '+$4.0k';
      case 'Epic': return '+$5.0k';
      case 'Legendary': return '+$6.0k';
      default: return '+$1.5k';
    }
  };

  const getRarityBorderColor = (rarity?: string) => {
    switch (rarity) {
      case 'Common': return '#808080'; // Cinza
      case 'Uncommon': return '#27AE60'; // Verde
      case 'Rare': return '#2196F3'; // Azul
      case 'Epic': return '#9B59B6'; // Roxa
      case 'Legendary': return '#F1C40F'; // Dourada
      default: return '#808080';
    }
  };

  const getPatchNumbers = (speed: string) => {
    if (speed === 'Extrema') return '(5 a 8)';
    if (speed === 'Rápida') return '(6 a 8)';
    if (speed === 'Moderada') return '(7 e 8)';
    if (speed === 'Lenta') return '(apenas 8)';
    return '';
  };

  const getSimulatedCVSS = (rarity?: string, id?: string) => {
    let seed = 0;
    if (id) {
      for (let i = 0; i < id.length; i++) {
        seed += id.charCodeAt(i);
      }
    }
    
    let min = 4.0;
    let max = 5.9;
    
    switch (rarity) {
      case 'Common': min = 4.0; max = 5.9; break;
      case 'Uncommon': min = 6.0; max = 6.9; break;
      case 'Rare': min = 7.0; max = 7.9; break;
      case 'Epic': min = 8.0; max = 8.9; break;
      case 'Legendary': min = 9.0; max = 10.0; break;
    }
    
    const value = min + ((seed % 20) / 19) * (max - min);
    return value.toFixed(1);
  };

  const getPnPBadgeProps = (vulnClass: string | undefined, cardId?: string) => {
    let key = vulnClass;
    if (!key && cardId) {
      if (cardId.startsWith('inj-')) key = 'Injection';
      else if (cardId.startsWith('bac-')) key = 'Broken Access Control';
      else if (cardId.startsWith('xss-')) key = 'Cross-Site Scripting';
      else if (cardId.startsWith('auth-')) key = 'Authentication';
      else if (cardId.startsWith('ssrf-')) key = 'SSRF';
      else if (cardId.startsWith('bl-')) key = 'Business Logic';
      else if (cardId.startsWith('crypto-')) key = 'Cryptography';
      else if (cardId.startsWith('leg-')) key = 'Legendary';
    }

    switch (key) {
      case 'Injection': return { color: '#E67E22', label: 'INJ' };
      case 'Broken Access Control': return { color: '#4B0082', label: 'BAC' };
      case 'Cross-Site Scripting': return { color: '#E91E63', label: 'XSS' };
      case 'Authentication': return { color: '#F1C40F', label: 'AUTH' };
      case 'SSRF': return { color: '#2196F3', label: 'SSRF' };
      case 'Business Logic': return { color: '#008080', label: 'LOGIC' };
      case 'Cryptography':
      case 'Cryptographic Failures': return { color: '#27AE60', label: 'CRYPTO' };
      case 'Legendary': return { color: '#B39DDB', label: '⚡ LEGENDARY' };
      default: return { color: '#ccc', label: 'VULN' };
    }
  };

  const [activeCategory, setActiveCategory] = useState<'cards' | 'events' | 'archetypes_programs' | 'center_mat' | 'player_mat' | 'tokens'>('cards');
  const [cardFilter, setCardFilter] = useState<'all' | 'exploits' | 'tools' | 'defuse'>('all');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');

  if (!isOpen) return null;

  const isLandscape = activeCategory === 'center_mat' || activeCategory === 'player_mat';
  const pageFormatCSS = isLandscape
    ? (paperSize === 'A3' ? 'A3 landscape' : 'A4 landscape')
    : 'A4 portrait';

  const displayedCards: CardV2[] =
    cardFilter === 'exploits' ? CARDS_V2.filter(c => c.type === 'exploit') :
      cardFilter === 'tools' ? CARDS_V2.filter(c => c.type === 'tool') :
        cardFilter === 'defuse' ? CARDS_V2.filter(c => c.type === 'defuse') : CARDS_V2;

  // CHUNKING EM GRUPOS DE EXATAMENTE 9 CARTAS POR FOLHA A4 (3 COLUNAS x 3 LINHAS - RETRATO 63x88mm)
  const cardPages = chunkArray(displayedCards, 9);
  const eventPages = chunkArray(FULL_24_EVENTS, 9);
  const archetypePages = chunkArray(ARCHETYPES, 9);
  const programPages = chunkArray(PROGRAM_CARDS, 9);

  const handleTriggerPrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="modal-overlay">
      <style>{`
        @media print {
          @page {
            margin: 8mm !important;
          }
          
          .terminal-box {
            max-width: 100% !important;
            max-height: none !important;
            width: 100% !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="terminal-box"
        style={{
          maxWidth: '1040px',
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          border: '2px solid var(--terminal-green)',
          boxShadow: 'var(--glow-green)',
          background: '#0d111a'
        }}
      >
        {/* Header */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={26} color="var(--terminal-green)" />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--terminal-green)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                KIT OFICIAL PRINT & PLAY — CARTAS PADRONIZADAS (63mm × 88mm)
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                PWND! — BUG BOUNTY CHAOS (O JOGO INTEIRO EM PAPEL)
              </h2>
            </div>
          </div>
          <button onClick={() => { soundFx.playClick(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('cards'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'cards' ? 'var(--terminal-green)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'cards' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            🃏 Cartas de Ação ({displayedCards.length} Cartas / {cardPages.length} Folhas)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('events'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'events' ? 'var(--alert-red)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'events' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              boxShadow: activeCategory === 'events' ? '0 0 10px rgba(248, 81, 73, 0.4)' : 'none'
            }}
          >
            🚨 Baralho de Eventos de Caos (24 Cartas / 3 Folhas)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('archetypes_programs'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'archetypes_programs' ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'archetypes_programs' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            👤 Arquétipos & 🏢 Programas (Cartas Verticais 63×88mm)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('center_mat'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'center_mat' ? 'var(--amber-glow)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'center_mat' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            🗺️ Tabuleiro Central (Horizontal)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('player_mat'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'player_mat' ? 'var(--electric-purple-light)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'player_mat' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            ♟️ Tapetes de Jogador (Horizontal)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('tokens'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'tokens' ? 'var(--amber-glow)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'tokens' ? '#000' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            🎲 Marcadores, Tokens de Carga & Dados
          </button>
        </div>

        {/* Action Bar with Card Category Sub-filters */}
        {activeCategory === 'cards' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> Filtro de Impressão:
            </span>
            <button
              onClick={() => setCardFilter('all')}
              style={{ padding: '4px 10px', background: cardFilter === 'all' ? 'var(--amber-glow)' : 'rgba(255,255,255,0.08)', color: cardFilter === 'all' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Todas as Cartas ({CARDS_V2.length})
            </button>
            <button
              onClick={() => setCardFilter('exploits')}
              style={{ padding: '4px 10px', background: cardFilter === 'exploits' ? 'var(--terminal-green)' : 'rgba(255,255,255,0.08)', color: cardFilter === 'exploits' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💥 Vulnerabilidades ({FULL_80_VULNERABILITIES.length})
            </button>
            <button
              onClick={() => setCardFilter('tools')}
              style={{ padding: '4px 10px', background: cardFilter === 'tools' ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.08)', color: cardFilter === 'tools' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🧰 Ferramentas ({36})
            </button>
            <button
              onClick={() => setCardFilter('defuse')}
              style={{ padding: '4px 10px', background: cardFilter === 'defuse' ? 'var(--electric-purple-light)' : 'rgba(255,255,255,0.08)', color: cardFilter === 'defuse' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🛡️ Safeguards ({10})
            </button>
          </div>
        )}

        {/* Paper Size Selector Bar for Mat Tabs */}
        {isLandscape && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyber-blue)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Seleção de Formato do Papel do Tabuleiro:
            </span>
            <button
              onClick={() => setPaperSize('A4')}
              style={{ padding: '4px 12px', background: paperSize === 'A4' ? 'var(--cyber-blue)' : 'rgba(255,255,255,0.08)', color: paperSize === 'A4' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📄 A4 Landscape (Layout Compacto em Cascata)
            </button>
            <button
              onClick={() => setPaperSize('A3')}
              style={{ padding: '4px 12px', background: paperSize === 'A3' ? 'var(--amber-glow)' : 'rgba(255,255,255,0.08)', color: paperSize === 'A3' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📜 A3 Landscape (Mesa Gigante Espalmada)
            </button>
          </div>
        )}

        {/* Action Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            📄 Formato Selecionado: <strong>{pageFormatCSS.toUpperCase()}</strong> — Todas as cartas padronizadas no tamanho Poker 63mm × 88mm.
          </div>

          <button
            onClick={handleTriggerPrint}
            style={{
              padding: '10px 18px',
              background: activeCategory === 'events' ? 'var(--alert-red)' : 'var(--terminal-green)',
              color: activeCategory === 'events' ? '#fff' : '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '900',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeCategory === 'events' ? '0 0 10px rgba(248,81,73,0.5)' : 'var(--glow-green)'
            }}
          >
            <Printer size={16} /> IMPRIMIR EM {paperSize} ({isLandscape ? 'HORIZONTAL' : 'VERTICAL'})
          </button>
        </div>

        {/* PRINTABLE CONTENT DISPLAY */}
        <div className="printable-sheet" style={{ background: '#fff', color: '#000', padding: '24px', borderRadius: '8px', fontFamily: 'sans-serif' }}>

          {/* ABA 1: CARTAS DE AÇÃO (PAGINADAS RIGIDAMENTE EM GRUPOS DE 9 POR FOLHA A4) */}
          {activeCategory === 'cards' && (
            <div>
              {cardPages.map((pageCards, pageIdx) => (
                <div
                  key={`page-${pageIdx}`}
                  className="printable-page-a4"
                  style={{
                    marginBottom: '32px',
                    paddingBottom: '16px',
                    borderBottom: pageIdx < cardPages.length - 1 ? '2px dashed #999' : 'none'
                  }}
                >
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! — BARALHO DE CARTAS DE AÇÃO</span>
                    <span>FOLHA A4 ({pageIdx + 1} DE {cardPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', justifyContent: 'center', gap: '16px' }}>
                    {pageCards.map((card, idx) => (
                      <div
                        key={`${card.id}-${idx}`}
                        className="printable-card-item"
                        style={{
                          ...getCardStyle(),
                          border: '2px dashed #000',
                          boxShadow: card.type === 'exploit' ? `inset 10px 0 0 ${getRarityBorderColor(card.rarity)}` : 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          background: card.type === 'exploit' ? '#fffaf5' : card.type === 'tool' ? '#f0f9ff' : '#f0fdf4',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {card.type === 'exploit' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ 
                                background: getPnPBadgeProps((card as any).vulnClass, card.id).color, 
                                color: '#fff', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textShadow: '0 0 2px rgba(0,0,0,0.8)'
                              }}>
                                {getPnPBadgeProps((card as any).vulnClass, card.id).label}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#111', fontFamily: 'monospace' }}>
                                CVSS {getSimulatedCVSS(card.rarity, card.id)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '18px' }}>{card.icon}</span>
                          )}
                          <span style={{ fontSize: '8.5px', fontWeight: 'bold', border: '1px solid #000', padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase' }}>
                            {card.type === 'defuse' ? 'SAFEGUARD' : card.type}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>{card.name}</div>
                          <div style={{ fontSize: '8.5px', fontStyle: 'italic', color: '#555' }}>({card.technicalReference})</div>
                        </div>

                        <div style={{ fontSize: '9px', lineHeight: '1.2', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                          {card.simpleDescription}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '3px' }}>
                          <span>Raridade: {card.rarity}</span>
                          <span>{getFlatValueLabel(card)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA DEDICADA: BARALHO DE EVENTOS DE CAOS (24 Cartas EM 3 FOLHAS A4) */}
          {activeCategory === 'events' && (
            <div>
              {eventPages.map((pageEvents, pageIdx) => (
                <div
                  key={`evt-page-${pageIdx}`}
                  className="printable-page-a4"
                  style={{
                    marginBottom: '32px',
                    paddingBottom: '16px',
                    borderBottom: pageIdx < eventPages.length - 1 ? '2px dashed #999' : 'none'
                  }}
                >
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #dc2626', color: '#dc2626', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🚨 PWND! — BARALHO DE EVENTOS DE CAOS (EVENT DECK)</span>
                    <span>FOLHA A4 ({pageIdx + 1} DE {eventPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', justifyContent: 'center', gap: '16px' }}>
                    {pageEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="printable-card-item"
                        style={{
                          ...getCardStyle(),
                          border: '2px dashed #dc2626',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          background: evt.id === 'evt-01' ? '#fef2f2' : '#fff5f5',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '20px' }}>{evt.icon}</span>
                          <span style={{ fontSize: '8.5px', fontWeight: 'bold', background: '#dc2626', color: '#fff', padding: '1px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>
                            EVENT #{evt.number}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#991b1b', marginTop: '2px' }}>{evt.name}</div>
                          <div style={{ fontSize: '8.5px', fontStyle: 'italic', color: '#7f1d1d' }}>({evt.technicalReference})</div>
                        </div>

                        <div style={{ fontSize: '9px', lineHeight: '1.25', borderTop: '1px solid #fca5a5', paddingTop: '4px', color: '#450a0a' }}>
                          {evt.simpleDescription}
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '8px', fontWeight: 'bold', color: '#dc2626', borderTop: '1px solid #dc2626', paddingTop: '3px', textTransform: 'uppercase' }}>
                          🚨 BARALHO DE EVENTOS DA MESA
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA 2: ARQUÉTIPOS & PROGRAMAS CORPORATIVOS (REFORMATADOS EM CARTAS VERTICAIS PADRÃO 63x88mm 3x3) */}
          {activeCategory === 'archetypes_programs' && (
            <div>
              {/* 1. ARQUÉTIPOS EM CARTAS VERTICAIS PADRÃO (3x3 A4) */}
              <div className="printable-page-a4" style={{ marginBottom: '32px' }}>
                <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>PWND! — CARTAS DE ARQUÉTIPOS DE PESQUISADOR (6 CARTAS)</span>
                  <span>FOLHA A4 (3×3 — RETRATO 63x88mm)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', justifyContent: 'center', gap: '16px' }}>
                  {ARCHETYPES.map(arch => (
                    <div
                      key={arch.id}
                      className="printable-card-item"
                      style={{
                        ...getCardStyle(),
                        border: '2px dashed #000',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: '#fafafa',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{arch.avatarIcon}</span>
                        <span style={{ fontSize: '8px', fontWeight: 'bold', border: '1px solid #000', padding: '1px 4px', borderRadius: '3px' }}>
                          RESEARCHER
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2px' }}>{arch.name}</div>
                        <div style={{ fontSize: '8.5px', color: '#555' }}>{arch.title}</div>
                        <div style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#000', marginTop: '2px' }}>Mão Máxima: {arch.maxHandSize} cartas</div>
                      </div>

                      <div style={{ fontSize: '8.5px', lineHeight: '1.25', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                        <strong>Poder Especial:</strong> {arch.playstyle}
                      </div>

                      <div style={{ textAlign: 'center', fontSize: '7.5px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '2px', textTransform: 'uppercase' }}>
                        SLOT RESEARCHER DO TAPETE
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. PROGRAMAS CORPORATIVOS EM CARTAS VERTICAIS PADRÃO (3x3 A4) */}
              {programPages.map((pageProgs, pIdx) => (
                <div key={`prog-page-${pIdx}`} className="printable-page-a4" style={{ marginBottom: '32px' }}>
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! — CARTAS DE PROGRAMAS CORPORATIVOS (PROGRAM MARKET)</span>
                    <span>FOLHA A4 ({pIdx + 1} DE {programPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', justifyContent: 'center', gap: '16px' }}>
                    {pageProgs.map(prog => (
                      <div
                        key={prog.id}
                        className="printable-card-item"
                        style={{
                          ...getCardStyle(),
                          border: '2px dashed #000',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#444' }}>{prog.companyType}</span>
                          <span style={{ fontSize: '8.5px', fontWeight: 'bold', border: '1px solid #000', padding: '1px 5px', background: '#fff' }}>
                            {prog.bountyRange}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>{prog.name}</div>
                          <div style={{ fontSize: '8.5px', color: '#c2410c', fontWeight: 'bold', marginTop: '2px' }}>
                            Patch: {prog.patchSpeed} <span style={{ color: '#000', marginLeft: '2px' }}>{getPatchNumbers(prog.patchSpeed)}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: '8.5px', lineHeight: '1.25', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                          {prog.description}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '6px' }}>
                            {prog.allowedClasses === 'ALL' ? (
                              <span style={{ background: '#333', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontSize: '7px', fontWeight: 'bold' }}>
                                ✓ [Todas as classes]
                              </span>
                            ) : (
                              (prog.allowedClasses as string[]).map(cls => {
                                const badge = getPnPBadgeProps(cls);
                                return (
                                  <span key={cls} style={{ background: badge.color, color: '#fff', padding: '2px 4px', borderRadius: '3px', fontSize: '7px', fontWeight: 'bold', textShadow: '0 0 1px rgba(0,0,0,0.8)' }}>
                                    {badge.label}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '7.5px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '2px', textTransform: 'uppercase' }}>
                          ACTIVE PROGRAM / MARKET SLOT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA 3: TABULEIRO CENTRAL (CENTER MARKET MAT - HORIZONTAL / LANDSCAPE) */}
          {activeCategory === 'center_mat' && (
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '16px', textAlign: 'center' }}>
                PWND! — TABULEIRO CENTRAL FÍSICO (CENTER MARKET PLAYMAT - IMPRESSÃO HORIZONTAL {paperSize})
              </div>

              <div style={{ border: '3px solid #000', borderRadius: '12px', padding: '24px', background: '#f8fafc', textTransform: 'uppercase', minHeight: paperSize === 'A3' ? '650px' : '480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                {/* Program Market Slots Verticais 63x88mm */}
                <div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>
                    — PROGRAM MARKET (SLOTS PARA 3 CARTAS DE PROGRAMA 63×88mm) —
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                    {[1, 2, 3].map(slot => (
                      <div key={slot} style={{ ...getSlotStyle(), border: '2px dashed #000', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#444', background: '#fff' }}>
                        <span>SLOT PROGRAMA #{slot}</span>
                        <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#666', marginTop: '4px' }}>(Retrato 63×88mm)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Deck, Round Track e Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Event Deck Slot */}
                  <div style={{ ...getSlotStyle(), border: '2px solid #000', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                    <span style={{ fontSize: '28px' }}>🚨</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>SLOT EVENT DECK</span>
                    <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#666', marginTop: '2px' }}>(Retrato 63×88mm)</span>
                  </div>

                  {/* Round Tracker (1 a 8) */}
                  <div style={{ border: '2px solid #000', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#fff' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>ROUND TRACK (RODADAS 1 A 8)</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(r => (
                        <div key={r} style={{ width: '32px', height: '32px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabela de Bounties */}
                  <div style={{ border: '2px solid #000', padding: '12px', borderRadius: '8px', fontSize: '10px', background: '#fff' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>TABELA DE RECOMPENSAS (BASE):</div>
                    <div>⚪ Comum: +$1.500</div>
                    <div>🟢 Incomum: +$2.500</div>
                    <div>🔵 Rara: +$4.000</div>
                    <div>🟣 Épica: +$5.000</div>
                    <div>🟡 Lendária: +$6.000</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ABA 4: TAPETE INDIVIDUAL DO JOGADOR (PLAYER MAT - HORIZONTAL / LANDSCAPE A4 CASCATA E A3 ESPALMADO) */}
          {activeCategory === 'player_mat' && (
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '16px', textAlign: 'center' }}>
                PWND! — TAPETE INDIVIDUAL DO PESQUISADOR (PLAYER MAT - IMPRESSÃO HORIZONTAL {paperSize})
              </div>

              <div style={{ border: '3px solid #000', borderRadius: '12px', padding: '20px', background: '#fff', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '20px', minHeight: 'calc(100vh - 40px)', zoom: paperSize === 'A4' ? 0.72 : 1 }}>
                {/* Bounty Track Vertical (28 Degraus Monotônicos $0 a $40.000) */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '8px', textAlign: 'center', fontSize: '8.5px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f8fafc' }}>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: '4px', fontSize: '9px' }}>BOUNTY TRACK</div>
                  {[
                    '$40.000', '$39.000', '$38.000', '$37.000', '$36.000', '$35.000', '$34.000',
                    '$33.000', '$32.000', '$30.000', '$28.000', '$26.000', '$24.000', '$22.000',
                    '$20.000', '$18.000', '$16.000', '$14.000', '$12.000',
                    '$11.000', '$10.500', '$9.000', '$7.500', '$6.000', '$4.500', '$3.000', '$1.500', '$0'
                  ].map((val, idx) => {
                    const isGreen = idx >= 19;
                    const isYellow = idx >= 14 && idx < 19;
                    const isOrange = idx >= 7 && idx < 14;
                    const color = isGreen ? '#15803d' : isYellow ? '#a16207' : isOrange ? '#c2410c' : '#b91c1c';
                    return (
                      <div key={val} style={{ border: '1px solid #ccc', padding: '1px', background: '#fff', color: color, fontSize: '11px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {val}
                      </div>
                    );
                  })}
                </div>

                {/* Módulos do Tapete com Slots Verticais Proporcionais 63mm x 88mm */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                    <div style={{ ...getSlotStyle(), border: '2px dashed #000', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', background: '#fafafa' }}>
                      <span>SLOT RESEARCHER</span>
                    </div>
                    <div style={{ ...getSlotStyle(), border: '2px dashed #000', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', background: '#fafafa' }}>
                      <span>ACTIVE PROGRAM</span>
                    </div>
                    <div style={{ ...getSlotStyle(), border: '2px dashed #000', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', background: '#fafafa' }}>
                      <span>SLOT SAFEGUARD</span>
                    </div>
                  </div>

                  {/* Tools Rack & Eventos Guardados */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '16px', justifyContent: 'center' }}>
                    <div style={{ border: '2px solid #000', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>TOOLS RACK (MÁX. 3)</div>
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        {[1, 2, 3].map(t => (
                          <div key={t} style={{ ...getSlotStyle(), border: '1.5px dashed #000', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', background: '#f8fafc' }}>
                            <span>SLOT TOOL #{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ border: '2px solid #000', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>EVENTOS GUARDADOS (LIMITE 2)</div>
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        {[1, 2].map(e => (
                          <div key={e} style={{ ...getSlotStyle(), border: '1.5px dashed #000', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', background: '#fcf8fa' }}>
                            <span>EVENTO #{e}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Zona de Exploits (ÁREA LIMPA E ESPAÇOSA PARA ALOCAR VULNERABILIDADES ARMADAS) */}
                  <div style={{ border: '2px solid #000', minHeight: '160px', flex: 1, borderRadius: '8px', padding: '16px', fontSize: '13px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fafafa' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '6px', color: '#000' }}>
                      ZONA DE EXPLOITS (VULNERABILIDADES ARMADAS)
                    </div>
                    <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#666', margin: 'auto', textAlign: 'center' }}>
                      [ Espaço para posicionar as cartas de Vulnerabilidades armadas durante a ação de Exploit ]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: MARCADORES DE MADEIRA & TOKENS */}
          {activeCategory === 'tokens' && (
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '16px' }}>
                PWND! — MARCADORES DE MADEIRA & TOKENS DE CARGA CORTÁVEIS
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* 1. Marcadores de Madeira Cortáveis (Wood Tokens) */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#fdf8f4' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
                    1. Marcadores Hexagonais (Bounty Tokens):
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {['Verde (P1)', 'Azul (P2)', 'Roxo (P3)', 'Rosa (P4)', 'Laranja (P5)', 'Ciano (P6)', 'Bot 1', 'Bot 2'].map(token => (
                      <div key={token} style={{ border: '2px solid #000', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', background: '#d97706', color: '#fff' }}>
                        {token}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Tokens de Status Temporário (LOCKED) */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#fee2e2', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
                    2. Marcadores de Status Temporário (LOCKED 🔒):
                  </h4>
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '12px' }}>
                    Coloque sobre a carta alvo para indicar bloqueio. Remova no início do seu próximo turno.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} style={{ border: '2px solid #000', borderRadius: '4px', height: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', background: '#ef4444', color: '#fff' }}>
                        <span style={{ fontSize: '14px' }}>🔒</span>
                        LOCKED
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
