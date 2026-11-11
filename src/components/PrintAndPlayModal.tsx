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
    if (speed === 'Extrema') return '(7+)';
    if (speed === 'Rápida') return '(8+)';
    if (speed === 'Moderada') return '(9+)';
    if (speed === 'Lenta') return '(10+)';
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
      else if (cardId.startsWith('leg-') || cardId.startsWith('apt-')) key = 'APT';
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
      case 'APT':
      case 'Legendary': return { color: '#B39DDB', label: 'APT' };
      default: return { color: '#ccc', label: 'VULN' };
    }
  };

  const [activeCategory, setActiveCategory] = useState<'cards' | 'events' | 'archetypes_programs' | 'center_mat' | 'player_mat' | 'tokens' | 'v12_update' | 'deluxe_sample'>('deluxe_sample');
  const [deluxePrintMode, setDeluxePrintMode] = useState<'both' | 'front' | 'back'>('both');
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

  const V13_UPDATED_BASE_TOOL_IDS = [
    'tool-burp-1', 'tool-burp-2', 'tool-nmap-1', 'tool-nmap-2', 'tool-zap',
    'tool-postman', 'tool-devtools-1', 'tool-devtools-2', 'tool-sqlmap',
    'tool-collaborator', 'tool-cyberchef', 'tool-jwt-tool'
  ];
  
  const V13_UPDATED_VULN_IDS = [
    'inj-13', 'inj-14', 'bac-11', 'bac-13', 'xss-12',
    'auth-9', 'auth-10', 'ssrf-7', 'ssrf-8', 'bl-8', 'crypto-6',
    'leg-1', 'leg-3', 'leg-6'
  ];

  const v12MixedCards = [
    // Vulnerabilidades [NOISY] e habilidades atualizadas no V1.3 (14 cartas)
    ...CARDS_V2.filter(c => c.type === 'exploit' && V13_UPDATED_VULN_IDS.includes(c.id))
      .map(c => ({ itemType: 'action' as const, data: c })),
    // Ferramentas com descrições canônicas V1.3 (12 cartas base)
    ...CARDS_V2.filter(c => c.type === 'tool' && V13_UPDATED_BASE_TOOL_IDS.some(id => c.id === id))
      .map(c => ({ itemType: 'action' as const, data: c })),
    // Safeguards atualizadas (Bypass unificado e CVE Assignment)
    ...CARDS_V2.filter(c => c.id === 'defuse-deck-1' || c.id === 'defuse-deck-9')
      .map(c => ({ itemType: 'action' as const, data: c })),
    // Eventos atualizados no V1.3 com impacto substantivo (9 cartas)
    ...FULL_24_EVENTS.filter(e => ['evt-05', 'evt-07', 'evt-09', 'evt-10', 'evt-12', 'evt-13', 'evt-17', 'evt-21', 'evt-24'].includes(e.id))
      .map(e => ({ itemType: 'event' as const, data: e })),
    // 6 Arquétipos com regras V1.3 reformuladas
    ...ARCHETYPES.map(a => ({ itemType: 'archetype' as const, data: a }))
  ];
  
  const v12MixedPages = chunkArray(v12MixedCards, 9);

  // HIGH-CONTRAST CARD RENDERERS FOR CRYSTAL-CLEAR PRINTING (POKER SIZE 63x88mm)
  const renderHighContrastActionCard = (card: CardV2, key: string) => {
    const badgeInfo = getPnPBadgeProps((card as any).vulnClass, card.id);
    const cvss = getSimulatedCVSS(card.rarity, card.id);
    
    let headerColor = '#0F172A';
    let typeLabel = 'TOOL';
    let valueLabel = 'FERRAMENTA';
    
    if (card.type === 'exploit') {
      headerColor = badgeInfo.color;
      typeLabel = `${badgeInfo.label} · ${(card.rarity || 'COMUM').toUpperCase()}`;
      valueLabel = getFlatValueLabel(card);
    } else if (card.type === 'defuse') {
      headerColor = '#059669';
      typeLabel = `SAFEGUARD · ${(card.rarity || 'RARA').toUpperCase()}`;
      valueLabel = 'DEFESA';
    } else {
      headerColor = '#0F172A';
      typeLabel = `TOOL · ${(card.rarity || 'COMUM').toUpperCase()}`;
      valueLabel = 'FERRAMENTA';
    }

    const desc = card.simpleDescription || '';
    const isNoisy = desc.includes('[NOISY]');
    const isPassive = desc.startsWith('PASSIVA:');
    const isActive = desc.startsWith('ATIVA:');
    
    let cleanDesc = desc;
    if (isNoisy) cleanDesc = cleanDesc.replace('[NOISY]', '').trim();
    if (isPassive) cleanDesc = cleanDesc.replace('PASSIVA:', '').trim();
    if (isActive) cleanDesc = cleanDesc.replace('ATIVA:', '').trim();

    return (
      <div
        key={key}
        className="printable-card-item"
        style={{
          width: '63mm',
          height: '88mm',
          background: '#FAF7F0',
          border: '1.5px solid #111827',
          borderTop: `4mm solid ${headerColor}`,
          borderRadius: '5px',
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{
              background: headerColor,
              color: '#FFFFFF',
              fontSize: '7pt',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              textTransform: 'uppercase'
            }}>
              {typeLabel}
            </span>
            <span style={{
              background: '#111827',
              color: '#FFFFFF',
              fontSize: '7.5pt',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              {valueLabel}
            </span>
          </div>

          <div style={{ fontSize: '9.8pt', fontWeight: 800, color: '#0F172A', lineHeight: '1.15', marginTop: '2px' }}>
            {card.name}
          </div>
          <div style={{ fontSize: '6.8pt', color: '#1E293B', fontWeight: 700, fontFamily: 'monospace', marginTop: '1px' }}>
            [{card.technicalReference}]
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '19mm',
          border: '1.2px solid #1E293B',
          borderRadius: '3px',
          overflow: 'hidden',
          background: '#FFFFFF',
          margin: '2px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px'
        }}>
          <span>{card.icon}</span>
        </div>

        {/* PURE WHITE HIGH-CONTRAST RULES BOX */}
        <div style={{
          background: '#FFFFFF',
          border: '1.2px solid #111827',
          borderRadius: '3px',
          padding: '5px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '7.4pt', lineHeight: '1.32', color: '#0F172A', fontWeight: 600 }}>
            {isNoisy && (
              <span style={{
                background: '#DC2626',
                color: '#FFFFFF',
                fontSize: '6.5pt',
                fontWeight: 900,
                padding: '0 4px',
                borderRadius: '2px',
                marginRight: '4px',
                display: 'inline-block'
              }}>
                [NOISY]
              </span>
            )}
            {isPassive && (
              <span style={{
                background: '#1D4ED8',
                color: '#FFFFFF',
                fontSize: '6.5pt',
                fontWeight: 900,
                padding: '0 4px',
                borderRadius: '2px',
                marginRight: '4px',
                display: 'inline-block'
              }}>
                PASSIVA
              </span>
            )}
            {isActive && (
              <span style={{
                background: '#7C3AED',
                color: '#FFFFFF',
                fontSize: '6.5pt',
                fontWeight: 900,
                padding: '0 4px',
                borderRadius: '2px',
                marginRight: '4px',
                display: 'inline-block'
              }}>
                ATIVA
              </span>
            )}
            {cleanDesc}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '6.2pt',
          fontWeight: 800,
          color: '#1E293B',
          borderTop: '1px solid #CBD5E1',
          paddingTop: '2px',
          marginTop: '2px',
          fontFamily: 'monospace'
        }}>
          <span>{card.type === 'exploit' ? `CVSS ${cvss} · ${(card.rarity || 'COMUM').toUpperCase()}` : card.type === 'defuse' ? 'SAFEGUARD DEFESA' : 'FERRAMENTA DE PESQUISA'}</span>
          <span>#{card.id}</span>
        </div>
      </div>
    );
  };

  const renderHighContrastEventCard = (evt: EventCardData, key: string) => {
    return (
      <div
        key={key}
        className="printable-card-item"
        style={{
          width: '63mm',
          height: '88mm',
          background: '#FAF7F0',
          border: '1.5px solid #111827',
          borderTop: '4mm solid #DC2626',
          borderRadius: '5px',
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '7pt',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              EVENT #{evt.number}
            </span>
            <span style={{
              background: '#111827',
              color: '#FFFFFF',
              fontSize: '6.5pt',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              maxWidth: '32mm',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {evt.targetText}
            </span>
          </div>

          <div style={{ fontSize: '10pt', fontWeight: 800, color: '#991B1B', lineHeight: '1.15', marginTop: '2px' }}>
            {evt.name}
          </div>
          <div style={{ fontSize: '6.8pt', color: '#1E293B', fontWeight: 700, fontFamily: 'monospace', marginTop: '1px' }}>
            [{evt.technicalReference}]
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '19mm',
          border: '1.2px solid #1E293B',
          borderRadius: '3px',
          overflow: 'hidden',
          background: '#FEF2F2',
          margin: '2px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          <span>{evt.icon}</span>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1.2px solid #111827',
          borderRadius: '3px',
          padding: '5px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '7.4pt', lineHeight: '1.34', color: '#0F172A', fontWeight: 600 }}>
            {evt.simpleDescription}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '6.2pt',
          fontWeight: 800,
          color: '#991B1B',
          borderTop: '1px solid #CBD5E1',
          paddingTop: '2px',
          marginTop: '2px',
          fontFamily: 'monospace'
        }}>
          <span>🚨 BARALHO DE EVENTOS DA MESA</span>
          <span style={{ color: '#0F172A' }}>#{evt.number}/024</span>
        </div>
      </div>
    );
  };

  const renderHighContrastArchetypeCard = (arch: typeof ARCHETYPES[0], key: string) => {
    return (
      <div
        key={key}
        className="printable-card-item"
        style={{
          width: '63mm',
          height: '88mm',
          background: '#FAF7F0',
          border: '1.5px solid #111827',
          borderTop: '4mm solid #2563EB',
          borderRadius: '5px',
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{
              background: '#2563EB',
              color: '#FFFFFF',
              fontSize: '7pt',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              RESEARCHER
            </span>
            <span style={{
              background: '#111827',
              color: '#FFFFFF',
              fontSize: '6.8pt',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              MÃO MÁX: {arch.maxHandSize}
            </span>
          </div>

          <div style={{ fontSize: '10.5pt', fontWeight: 900, color: '#0F172A', lineHeight: '1.15', marginTop: '2px' }}>
            {arch.name}
          </div>
          <div style={{ fontSize: '6.8pt', color: '#1E293B', fontWeight: 700, marginTop: '1px' }}>
            {arch.title}
          </div>
        </div>

        {arch.presentation && (
          <div style={{ fontSize: '6.2pt', fontStyle: 'italic', color: '#475569', lineHeight: '1.2', borderLeft: '2px solid #2563EB', paddingLeft: '4px', margin: '2px 0' }}>
            {arch.presentation}
          </div>
        )}

        <div style={{
          background: '#FFFFFF',
          border: '1.2px solid #111827',
          borderRadius: '3px',
          padding: '5px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '6.8pt', fontWeight: 900, color: '#2563EB', borderBottom: '1px solid #CBD5E1', paddingBottom: '2px', marginBottom: '3px', textTransform: 'uppercase' }}>
            ⚡ Habilidades Especiais (V1.3):
          </div>
          <div style={{ fontSize: '6.8pt', lineHeight: '1.3', color: '#0F172A', fontWeight: 600, whiteSpace: 'pre-line' }}>
            {arch.playstyle}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '6.2pt',
          fontWeight: 800,
          color: '#1E293B',
          borderTop: '1px solid #CBD5E1',
          paddingTop: '2px',
          marginTop: '2px',
          fontFamily: 'monospace'
        }}>
          <span>SLOT RESEARCHER DO TAPETE</span>
          <span>#{arch.id}</span>
        </div>
      </div>
    );
  };

  const renderHighContrastProgramCard = (prog: typeof PROGRAM_CARDS[0], key: string) => {
    return (
      <div
        key={key}
        className="printable-card-item"
        style={{
          width: '63mm',
          height: '88mm',
          background: '#FAF7F0',
          border: '1.5px solid #111827',
          borderTop: '4mm solid #D97706',
          borderRadius: '5px',
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{
              background: '#D97706',
              color: '#FFFFFF',
              fontSize: '7pt',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              PROGRAMA
            </span>
            <span style={{
              background: '#111827',
              color: '#FFFFFF',
              fontSize: '7pt',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              {prog.bountyRange}
            </span>
          </div>

          <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A', lineHeight: '1.15', marginTop: '2px' }}>
            {prog.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px' }}>
            <span style={{ fontSize: '6.8pt', color: '#1E293B', fontWeight: 700 }}>
              {prog.companyType}
            </span>
            <span style={{ fontSize: '7pt', color: '#C2410C', fontWeight: 900 }}>
              Patch: {prog.patchSpeed} {getPatchNumbers(prog.patchSpeed)}
            </span>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1.2px solid #111827',
          borderRadius: '3px',
          padding: '5px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          margin: '3px 0'
        }}>
          <div style={{ fontSize: '7.2pt', lineHeight: '1.3', color: '#0F172A', fontWeight: 600 }}>
            {prog.description}
          </div>
          <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '3px', marginTop: '3px' }}>
            <div style={{ fontSize: '6pt', fontWeight: 800, color: '#475569', marginBottom: '2px', textTransform: 'uppercase' }}>
              Escopo Autorizado:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
              {prog.allowedClasses === 'ALL' ? (
                <span style={{ background: '#111827', color: '#FFFFFF', padding: '1px 4px', borderRadius: '2px', fontSize: '6.5pt', fontWeight: 900 }}>
                  ✓ TODAS AS CLASSES
                </span>
              ) : (
                (prog.allowedClasses as string[]).map(cls => {
                  const b = getPnPBadgeProps(cls);
                  return (
                    <span key={cls} style={{ background: b.color, color: '#FFFFFF', padding: '1px 4px', borderRadius: '2px', fontSize: '6.2pt', fontWeight: 900 }}>
                      {b.label}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '6.2pt',
          fontWeight: 800,
          color: '#1E293B',
          borderTop: '1px solid #CBD5E1',
          paddingTop: '2px',
          marginTop: '2px',
          fontFamily: 'monospace'
        }}>
          <span>MERCADO DE PROGRAMAS</span>
          <span>#{prog.id}</span>
        </div>
      </div>
    );
  };

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
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .printable-sheet {
            padding: 0 !important;
            background: transparent !important;
          }
          
          .printable-page-a4 {
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            border-bottom: none !important;
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

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('v12_update'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'v12_update' ? '#9333ea' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'v12_update' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              boxShadow: activeCategory === 'v12_update' ? '0 0 10px rgba(147, 51, 234, 0.4)' : 'none'
            }}
          >
            ✨ Atualização V1.3 (Só Cartas Modificadas)
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveCategory('deluxe_sample'); }}
            style={{
              padding: '8px 14px',
              background: activeCategory === 'deluxe_sample' ? '#10b981' : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'deluxe_sample' ? '#064e3b' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              boxShadow: activeCategory === 'deluxe_sample' ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            🎨 Amostra Deluxe (Frente/Verso Duplex)
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

          {/* ABA DEDICADA: ATUALIZAÇÃO V1.3 (SÓ CARTAS MODIFICADAS) */}
          {activeCategory === 'v12_update' && (
            <div>
              {v12MixedPages.map((pageCards, pageIdx) => (
                <div
                  key={`v12-page-${pageIdx}`}
                  className="printable-page-a4"
                  style={{
                    marginBottom: '32px',
                    paddingBottom: '16px',
                    borderBottom: '2px dashed #999'
                  }}
                >
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #a855f7', color: '#a855f7', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! V1.3 — CARTAS RELEVANTEMENTE MODIFICADAS ({v12MixedCards.length} CARTAS)</span>
                    <span>FOLHA A4 ({pageIdx + 1} DE {v12MixedPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    {pageCards.map((mixedItem, idx) => {
                      if (mixedItem.itemType === 'action') {
                        return renderHighContrastActionCard(mixedItem.data, `v12-card-${mixedItem.data.id}-${idx}`);
                      }
                      if (mixedItem.itemType === 'event') {
                        return renderHighContrastEventCard(mixedItem.data, `v12-evt-${mixedItem.data.id}-${idx}`);
                      }
                      if (mixedItem.itemType === 'archetype') {
                        return renderHighContrastArchetypeCard(mixedItem.data, `v12-arch-${mixedItem.data.id}-${idx}`);
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                    <span>PWND! — BARALHO DE CARTAS DE AÇÃO (80 VULNS + 36 TOOLS + 10 SAFEGUARDS)</span>
                    <span>FOLHA A4 ({pageIdx + 1} DE {cardPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    {pageCards.map((card, idx) => renderHighContrastActionCard(card, `${card.id}-${idx}`))}
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    {pageEvents.map((evt) => renderHighContrastEventCard(evt, evt.id))}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                  {ARCHETYPES.map(arch => renderHighContrastArchetypeCard(arch, arch.id))}
                </div>
              </div>

              {/* 2. PROGRAMAS CORPORATIVOS EM CARTAS VERTICAIS PADRÃO (3x3 A4) */}
              {programPages.map((pageProgs, pIdx) => (
                <div key={`prog-page-${pIdx}`} className="printable-page-a4" style={{ marginBottom: '32px' }}>
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! — CARTAS DE PROGRAMAS CORPORATIVOS (PROGRAM MARKET)</span>
                    <span>FOLHA A4 ({pIdx + 1} DE {programPages.length} — 9 CARTAS 3×3 63x88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    {pageProgs.map(prog => renderHighContrastProgramCard(prog, prog.id))}
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

                  {/* Round Tracker (1 a 10) */}
                  <div style={{ border: '2px solid #000', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#fff' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>ROUND TRACK (RODADAS 1 A 10)</div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                        <div key={r} style={{ width: '28px', height: '28px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
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
                    1. Marcadores de Pontuação (Bounty Track):
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {['Verde (P1)', 'Azul (P2)', 'Roxo (P3)', 'Rosa (P4)', 'Laranja (P5)', 'Ciano (P6)', 'Bot 1', 'Bot 2'].map(token => (
                      <div key={token} style={{ border: '2px solid #000', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8.5px', fontWeight: 'bold', textAlign: 'center', background: '#d97706', color: '#fff' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} style={{ border: '2px solid #000', borderRadius: '4px', height: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', background: '#ef4444', color: '#fff' }}>
                        <span style={{ fontSize: '14px' }}>🔒</span>
                        LOCKED
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Tokens de Alerta (Blue Team) */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#fff1f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#9f1239' }}>
                      3. 🐞 18 Tokens de Alerta (Blue Team):
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', background: '#f43f5e', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                      -$500 / 2x = -$2k
                    </span>
                  </div>
                  <p style={{ fontSize: '9.5px', color: '#666', marginBottom: '10px' }}>
                    Receba ao falhar no Patch Check. A cada 2 Alertas perde -$2.000. Cada Alerta restante desconta -$500 no fim.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div key={`alert-${idx}`} style={{ border: '2px solid #9f1239', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 'bold', textAlign: 'center', background: '#ffe4e6', color: '#9f1239' }}>
                        <span style={{ fontSize: '16px' }}>🐞</span>
                        -$500
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Tokens de Reputação (Bounty Bees) */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#fefce8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#854d0e' }}>
                      4. 🐝 18 Tokens de Reputação (Bounty Bees):
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', background: '#eab308', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>
                      +$500 ou 2x Reroll
                    </span>
                  </div>
                  <p style={{ fontSize: '9.5px', color: '#666', marginBottom: '10px' }}>
                    Ganhe em Reports Épica/Lendária. Descarte 2 Tokens para Reroll de 1 dado de Patch ou guarde para +$500 no final.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div key={`rep-${idx}`} style={{ border: '2px solid #854d0e', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 'bold', textAlign: 'center', background: '#fef9c3', color: '#854d0e' }}>
                        <span style={{ fontSize: '16px' }}>🐝</span>
                        +$500
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. 3 Dados D6 & Tabela de Patch Deployed V1.3 */}
                <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '16px', background: '#f0fdf4', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>
                      5. 🎲 Sistema de 3x Dados D6 & Régua de Patch Deployed (V1.3):
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                      3× D6 (Soma 3 a 18)
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', marginTop: '10px' }}>
                    <div style={{ border: '1.5px solid #dc2626', borderRadius: '6px', padding: '8px', background: '#fff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>Extrema</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '4px 0' }}>7+</div>
                      <div style={{ fontSize: '8.5px', color: '#666' }}>Risco de Patch: ~72%</div>
                    </div>
                    <div style={{ border: '1.5px solid #ea580c', borderRadius: '6px', padding: '8px', background: '#fff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ea580c' }}>Rápida</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '4px 0' }}>8+</div>
                      <div style={{ fontSize: '8.5px', color: '#666' }}>Risco de Patch: ~62%</div>
                    </div>
                    <div style={{ border: '1.5px solid #d97706', borderRadius: '6px', padding: '8px', background: '#fff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d97706' }}>Moderada</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '4px 0' }}>9+</div>
                      <div style={{ fontSize: '8.5px', color: '#666' }}>Risco de Patch: ~51%</div>
                    </div>
                    <div style={{ border: '1.5px solid #16a34a', borderRadius: '6px', padding: '8px', background: '#fff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>Lenta</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '4px 0' }}>10+</div>
                      <div style={{ fontSize: '8.5px', color: '#666' }}>Risco de Patch: ~41%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 6: AMOSTRA GRÁFICA DELUXE (FRENTE E VERSO DUPLEX) */}
          {activeCategory === 'deluxe_sample' && (
            <div>
              {/* Seletor de visualização Deluxe */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    Modo Duplex:
                  </span>
                  <button
                    onClick={() => setDeluxePrintMode('both')}
                    style={{ padding: '6px 12px', background: deluxePrintMode === 'both' ? '#10b981' : 'rgba(255,255,255,0.08)', color: deluxePrintMode === 'both' ? '#064e3b' : '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    📄 Ambos (Frente & Verso)
                  </button>
                  <button
                    onClick={() => setDeluxePrintMode('front')}
                    style={{ padding: '6px 12px', background: deluxePrintMode === 'front' ? '#3b82f6' : 'rgba(255,255,255,0.08)', color: deluxePrintMode === 'front' ? '#fff' : '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🃏 Apenas Frentes (Folha 1)
                  </button>
                  <button
                    onClick={() => setDeluxePrintMode('back')}
                    style={{ padding: '6px 12px', background: deluxePrintMode === 'back' ? '#f59e0b' : 'rgba(255,255,255,0.08)', color: deluxePrintMode === 'back' ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🔄 Apenas Versos (Folha 2 Espelhada)
                  </button>
                </div>

                <a
                  href="/pwnd-pnp-deluxe-sample.html"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', padding: '6px 14px', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🌐 Abrir em Aba Independente
                </a>
              </div>

              {/* FOLHA 1: FRENTES (ALTO CONTRASTE + ARTE PROFISSIONAL) */}
              {(deluxePrintMode === 'both' || deluxePrintMode === 'front') && (
                <div className="printable-page-a4" style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '2px dashed #999' }}>
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #10b981', color: '#10b981', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! V1.3 — AMOSTRA DELUXE (FOLHA 1: FRENTES COM ALTO CONTRASTE)</span>
                    <span>FOLHA A4 (3×3 — POKER 63×88mm)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    
                    {/* C1: inj-13 (A Esteira Quebrada) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #EA580C', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#EA580C', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>INJ · ÉPICA</span>
                          <span style={{ background: '#111', color: '#fff', fontSize: '8pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>+$5.0k</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>A Esteira Quebrada</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Automated SQL Injection]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-inj-13.png" alt="A Esteira Quebrada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#DC2626', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>[NOISY]</span>
                          <strong>BÔNUS CRÍTICO:</strong> Receba <strong>+$1.000</strong> adicionais no payout deste Report.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          Payload na rotina de conversão de PDFs.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>CVSS 8.3 · CRÍTICO</span>
                        <span>#013/080</span>
                      </div>
                    </div>

                    {/* C2: tool-burp-1 (Canivete Suíço Hacker) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #0F172A', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#0F172A', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>TOOL · ÉPICA</span>
                          <span style={{ background: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>FERRAMENTA</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>Canivete Suíço Hacker</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Burp Suite Pro · Intercept]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-tool-burp.png" alt="Canivete Suíço Hacker" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#D97706', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>ATIVA</span>
                          Descarte os programas e reponha; se algum aceitar <strong>LEGENDARY</strong> (ou ALL), <strong>+$500</strong>; senão, compre 1 carta.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          O canivete de auditoria essencial.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>DESCARTE AO USAR</span>
                        <span>#081/126</span>
                      </div>
                    </div>

                    {/* C3: old-guard (The Old Guard) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #2563EB', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#2563EB', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>RESEARCHER</span>
                          <span style={{ background: '#1D4ED8', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>MÃO: 9</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>The Old Guard</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[O Veterano de C/ASM]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-arch-oldguard.png" alt="The Old Guard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#2563EB', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>PODER</span>
                          <strong>ESPECIALISTA SÊNIOR:</strong> Cada carta Épica ou Lendária no Report vale <strong>+$500 extras</strong>.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          "Mão grande, paciência de quem escreveu memcpy com o pé."
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>TAPETE RESEARCHER</span>
                        <span>ARCH #02/06</span>
                      </div>
                    </div>

                    {/* C4: evt-01 (Blue Team Hunt!) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #DC2626', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#DC2626', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>EVENT #01</span>
                          <span style={{ background: '#991B1B', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>CAOS</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>Blue Team Hunt!</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Proactive Threat Hunting]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-evt-blueteam.png" alt="Blue Team Hunt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <div style={{ fontSize: '6pt', fontWeight: 800, color: '#DC2626' }}>ALVO: TODOS OS JOGADORES</div>
                          Todos os jogadores devem <strong>descartar a vulnerabilidade de maior CVSS</strong> na mesa.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          A auditoria interna acordou.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>EVENT DECK</span>
                        <span>#01/24</span>
                      </div>
                    </div>

                    {/* C5: shopall-1 (ShopAll Global) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #D97706', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#D97706', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>PROGRAM</span>
                          <span style={{ background: '#B45309', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>+$1.0k BÔNUS</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>ShopAll Global</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[E-Commerce Multinacional]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-prog-shopall.png" alt="ShopAll Global" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EA580C', fontWeight: 800, fontSize: '6.5pt' }}>
                            <span>PATCH: MODERADA (9+)</span>
                            <span style={{ color: '#16A34A' }}>ESCOPO: [ALL]</span>
                          </div>
                          Escopo amplo. Aceita todas as classes com triagem padrão.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          Milhões de requisições por minuto.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>PROGRAM MARKET</span>
                        <span>PROG #01/24</span>
                      </div>
                    </div>

                    {/* C6: defuse-deck-1 (Safeguard Bypass) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #4F46E5', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#4F46E5', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>SAFEGUARD</span>
                          <span style={{ background: '#312E81', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>DEFESA</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>Safeguard (Bypass)</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Bypass Card · Dual Mode]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#E2E8F0', margin: '2px 0' }}>
                        <img src="/card-art/art-defuse-bypass.png" alt="Bypass Safeguard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '6.8pt', lineHeight: '1.25', color: '#0F172A' }}>
                          <span style={{ background: '#4F46E5', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>SUPREMA</span>
                          <strong>Anula o Patch!</strong> Se no Report: payout garantido sem tool, saca evento e renova. Se em Stealth: mantém vulns e programa.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          Sempre há uma rota alternativa.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>DESCARTE AO USAR</span>
                        <span>#117/126</span>
                      </div>
                    </div>

                    {/* C7: auth-10 (O Sósia do Executivo) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #CA8A04', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#CA8A04', color: '#000', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>AUTH · ÉPICA</span>
                          <span style={{ background: '#111', color: '#fff', fontSize: '8pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>+$5.0k</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>O Sósia do Executivo</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[SAML Response Tampering]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#FEF08A', margin: '2px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        <span>🎭</span>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#DC2626', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>[NOISY]</span>
                          <strong>DESVIO DE PAGAMENTO:</strong> Transfira <strong>$1.000</strong> do jogador com o maior saldo para a sua Bounty Track.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          Um token forjado altera a tesouraria corporativa.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>CVSS 8.8 · CRÍTICO</span>
                        <span>#040/080</span>
                      </div>
                    </div>

                    {/* C8: tool-zap (OWASP ZAP) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #0F172A', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#0F172A', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>TOOL · COMUM</span>
                          <span style={{ background: '#334155', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>FERRAMENTA</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>OWASP ZAP</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Automated Vulnerability Scanner]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#DBEAFE', margin: '2px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        <span>⚡</span>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#2563EB', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>PASSIVA</span>
                          Na sua primeira ação de <strong>Exploit</strong> do turno, desça <strong>2 vulnerabilidades</strong> em vez de 1.
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          Dispare requisições concorrentes em alta velocidade.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>FERRAMENTA PERMANENTE</span>
                        <span>#085/126</span>
                      </div>
                    </div>

                    {/* C9: leg-1 (O Efeito Dominó) */}
                    <div style={{ width: '63mm', height: '88mm', background: '#FAF7F0', border: '1.5px solid #111', borderTop: '4mm solid #7C3AED', borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0F172A', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ background: '#7C3AED', color: '#fff', fontSize: '7.5pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>⚡ LEGENDARY</span>
                          <span style={{ background: '#111', color: '#fff', fontSize: '8pt', fontWeight: 900, padding: '1px 5px', borderRadius: '3px' }}>+$2.5k</span>
                        </div>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#0F172A' }}>O Efeito Dominó</div>
                        <div style={{ fontSize: '6.5pt', color: '#475569', fontWeight: 700 }}>[Multi-Stage Chained Exploit]</div>
                      </div>
                      <div style={{ width: '100%', height: '26mm', border: '1px solid #1E293B', borderRadius: '4px', overflow: 'hidden', background: '#EDE9FE', margin: '2px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        <span>🔗</span>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #111', borderRadius: '4px', padding: '5px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '7pt', lineHeight: '1.3', color: '#0F172A' }}>
                          <span style={{ background: '#DC2626', color: '#fff', fontSize: '6pt', fontWeight: 900, padding: '0 3px', borderRadius: '2px', marginRight: '3px' }}>[NOISY]</span>
                          <strong>EFEITO DOMINÓ:</strong> Ao descer esta carta, baixe imediatamente <strong>+1 vulnerabilidade</strong> da mão na mesa (respeita o limite de 3 e escopo).
                        </div>
                        <div style={{ fontSize: '6pt', fontStyle: 'italic', color: '#64748B', borderTop: '0.5px solid #E2E8F0', paddingTop: '2px' }}>
                          A primeira peça cai imperceptível. A última derruba o datacenter.
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6pt', fontWeight: 800, color: '#334155', borderTop: '1px solid #ccc', paddingTop: '2px', marginTop: '2px' }}>
                        <span>CVSS 6.3 · INCOMUM</span>
                        <span>#075/080</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* FOLHA 2: VERSOS ESPELHADOS HORIZONTALMENTE PARA IMPRESSÃO DUPLEX PERFEITA */}
              {(deluxePrintMode === 'both' || deluxePrintMode === 'back') && (
                <div className="printable-page-a4" style={{ marginBottom: '32px', paddingBottom: '16px' }}>
                  <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', borderBottom: '2px solid #f59e0b', color: '#f59e0b', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PWND! V1.3 — AMOSTRA DELUXE (FOLHA 2: VERSOS DAS CARTAS · ESPELHAMENTO DUPLEX)</span>
                    <span>VIRAR NA BORDA LONGA (FLIP ON LONG EDGE)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63mm)', justifyContent: 'center', gap: '4mm' }}>
                    
                    {/* Linha 1 Versos: Verso C3, Verso C2, Verso C1 */}
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-archetype.jpg" alt="Verso Archetype" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-tool.jpg" alt="Verso Tool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-vuln.jpg" alt="Verso Vulnerabilidade" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Linha 2 Versos: Verso C6, Verso C5, Verso C4 */}
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-tool.jpg" alt="Verso Safeguard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-program.jpg" alt="Verso Programa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-event.jpg" alt="Verso Evento" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Linha 3 Versos: Verso C9, Verso C8, Verso C7 */}
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-vuln.jpg" alt="Verso Vulnerabilidade" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-tool.jpg" alt="Verso Tool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ width: '63mm', height: '88mm', border: '1px solid #111', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src="/card-backs/back-vuln.jpg" alt="Verso Vulnerabilidade" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
