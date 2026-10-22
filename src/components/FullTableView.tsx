import React from 'react';
import { CenterMarketMat } from './CenterMarketMat';
import { PlayerMat, PlayerMatData } from './PlayerMat';
import { ARCHETYPES, PROGRAM_CARDS } from '../data/cardsData';
import { CARDS_V2 } from '../data/cardsDataV2';
import { Users, Eye, Play } from 'lucide-react';

interface FullTableViewProps {
  humanPlayerData: PlayerMatData;
  onFocusMyMat: () => void;
}

export const FullTableView: React.FC<FullTableViewProps> = ({
  humanPlayerData,
  onFocusMyMat
}) => {
  // Lista dos 6 Jogadores da Mesa (Estilo Imagem 2)
  const all6Players: PlayerMatData[] = [
    humanPlayerData, // Player 1 (Você - Verde)
    {
      playerId: 'bot-2',
      playerName: 'Ninja_Cyber',
      playerColor: 'var(--player-2-blue)',
      archetype: ARCHETYPES[2], // Bug Hunter
      currentProgram: PROGRAM_CARDS[1],
      bountyTotal: 15000,
      hand: CARDS_V2.slice(0, 4),
      activeTools: [CARDS_V2[8]],
      activeExploits: [CARDS_V2[0], CARDS_V2[1]],
      hasDefuse: false
    },
    {
      playerId: 'bot-3',
      playerName: 'Ghost_Hacker',
      playerColor: 'var(--player-3-purple)',
      archetype: ARCHETYPES[4], // Red Teamer
      currentProgram: PROGRAM_CARDS[4],
      bountyTotal: 27000,
      hand: CARDS_V2.slice(0, 5),
      activeTools: [CARDS_V2[9]],
      activeExploits: [CARDS_V2[4]],
      hasDefuse: true
    },
    {
      playerId: 'bot-4',
      playerName: 'Pink_Payload',
      playerColor: 'var(--player-4-magenta)',
      archetype: ARCHETYPES[1], // Old Guard
      currentProgram: PROGRAM_CARDS[0],
      bountyTotal: 5000,
      hand: CARDS_V2.slice(0, 6),
      activeTools: [],
      activeExploits: [CARDS_V2[2]],
      hasDefuse: false
    },
    {
      playerId: 'bot-5',
      playerName: 'Amber_Script',
      playerColor: 'var(--player-5-orange)',
      archetype: ARCHETYPES[3], // Social Engineer
      currentProgram: PROGRAM_CARDS[2],
      bountyTotal: 12000,
      hand: CARDS_V2.slice(0, 4),
      activeTools: [CARDS_V2[10]],
      activeExploits: [],
      hasDefuse: false
    },
    {
      playerId: 'bot-6',
      playerName: 'Cyan_Zero',
      playerColor: 'var(--player-6-cyan)',
      archetype: ARCHETYPES[5], // Pentester
      currentProgram: PROGRAM_CARDS[3],
      bountyTotal: 32000,
      hand: CARDS_V2.slice(0, 5),
      activeTools: [CARDS_V2[8], CARDS_V2[9]],
      activeExploits: [CARDS_V2[6]],
      hasDefuse: true
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Overview Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'rgba(0,0,0,0.5)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={22} color="var(--amber-glow)" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              VISÃO DA MESA DE MADEIRA (6 JOGADORES)
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Mesa completa com o Tabuleiro Central (Center Market) e os 6 Tapetes Individuais ao redor.
            </div>
          </div>
        </div>

        <button
          onClick={onFocusMyMat}
          style={{
            padding: '10px 16px',
            background: 'var(--terminal-green)',
            color: '#000',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Eye size={16} /> Focar no Meu Tapete
        </button>
      </div>

      {/* CENTER MARKET MAT IN THE MIDDLE */}
      <CenterMarketMat totalRounds={8} />

      {/* 6 PLAYMATS GRID LAYOUT (Estilo Imagem 2) */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--amber-glow)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
        — TAPETES INDIVIDUAIS DOS 6 JOGADORES DA MESA —
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'center' }}>
        {all6Players.map(pData => (
          <div key={pData.playerId} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PlayerMat playerData={pData} />
          </div>
        ))}
      </div>
    </div>
  );
};
