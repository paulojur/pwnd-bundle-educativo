import React from 'react';
import { useBoardGame, PlayerState, PlayerRoleId } from '../context/BoardGameContext';
import { PlayerMatData } from './PlayerMat';
import { CenterMarketMat } from './CenterMarketMat';
import { Users, Eye, ArrowLeft, ShieldCheck, Bug, Award, Sparkles, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface FullTableViewProps {
  humanPlayerData: PlayerMatData;
  onFocusMyMat: () => void;
}

export const FullTableView: React.FC<FullTableViewProps> = ({
  onFocusMyMat
}) => {
  const {
    allPlayers,
    deployedExploits,
    setMyRole,
    myRole,
    activePlayerRole,
    playerCount,
    setPlayerCount
  } = useBoardGame();

  const handleSelectSeat = (playerId: PlayerRoleId) => {
    soundFx.playClick();
    setMyRole(playerId);
    onFocusMyMat();
  };

  const renderPlayerCardSeat = (player?: PlayerState, positionLabel?: string) => {
    if (!player) return null;

    const isCurrentTurnActive = player.id === activePlayerRole;
    const isSelectedLocalView = player.id === myRole;
    const activeExploits = deployedExploits.filter(e => e.playerId === player.id);
    const playerIndex = (['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'] as PlayerRoleId[]).indexOf(player.id);
    const isInGame = playerIndex < playerCount;

    return (
      <div
        key={player.id}
        onClick={() => handleSelectSeat(player.id)}
        style={{
          background: isSelectedLocalView ? '#FEF3C7' : '#FAF6EE',
          border: isCurrentTurnActive
            ? '3px solid #16A34A'
            : isSelectedLocalView
            ? '2.5px solid #D97706'
            : '1.5px solid #2B2620',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: isCurrentTurnActive
            ? '0 6px 20px rgba(22, 163, 74, 0.4)'
            : isSelectedLocalView
            ? '0 4px 14px rgba(217, 119, 6, 0.25)'
            : '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          opacity: isInGame ? 1 : 0.65,
          position: 'relative'
        }}
      >
        {/* BADGE DE STATUS DE TURNO OU VISÃO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: player.color,
                border: '2px solid #2B2620',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: '900',
                boxShadow: isCurrentTurnActive ? '0 0 8px ' + player.color : 'none'
              }}
            >
              {playerIndex + 1}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'monospace', color: '#1E1B18' }}>
                {player.name}
              </div>
              <div style={{ fontSize: '9px', color: '#685F53', fontFamily: 'monospace', fontWeight: '700' }}>
                {player.archetype.name} {player.archetype.avatarIcon || ''}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '13px',
              fontWeight: '900',
              color: '#047857',
              fontFamily: 'monospace',
              background: '#DCFCE7',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #166534'
            }}
          >
            ${player.score.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* ALVO ATIVO */}
        <div
          style={{
            background: '#F1E9DC',
            border: '1px solid #D6CBB8',
            borderRadius: '5px',
            padding: '4px 8px',
            marginBottom: '8px',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            color: '#1E1B18',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ color: '#685F53' }}>Alvo Corporativo:</span>
          <strong style={{ color: '#0369A1' }}>{player.activeProgram?.name || 'Nenhum'}</strong>
        </div>

        {/* STATUS RÁPIDO DO JOGADOR NA MESA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px', fontSize: '9.5px', fontFamily: 'monospace' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #D6CBB8', borderRadius: '4px', padding: '4px 2px' }}>
            <div style={{ color: '#685F53' }}>Mão</div>
            <div style={{ fontWeight: '800' }}>🃏 {player.hand.length}</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D6CBB8', borderRadius: '4px', padding: '4px 2px' }}>
            <div style={{ color: '#685F53' }}>Exploits</div>
            <div style={{ fontWeight: '800', color: activeExploits.length > 0 ? '#B45309' : '#685F53' }}>
              💉 {activeExploits.length}/3
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D6CBB8', borderRadius: '4px', padding: '4px 2px' }}>
            <div style={{ color: '#685F53' }}>Defesa</div>
            <div style={{ fontWeight: '800', color: player.safeguardSlot ? '#166534' : '#9CA3AF' }}>
              {player.safeguardSlot ? '🛡️ Bypass' : '—'}
            </div>
          </div>
        </div>

        {/* TOKENS E BOTÃO DE ASSUMIR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2D7C5', paddingTop: '8px', fontSize: '9.5px', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#B91C1C', fontWeight: '800' }} title="Tokens de Alerta (Ao atingir 2, perde -$2.000)">
              🐞 {player.alertaTokens}/2
            </span>
            <span style={{ color: '#B45309', fontWeight: '800' }} title="Tokens de Reputação (2 tokens permitem rolar novamente um dado de Patch)">
              🐝 {player.reputacaoTokens}
            </span>
            {isCurrentTurnActive && (
              <span style={{ background: '#16A34A', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: '900', fontSize: '8.5px' }}>
                SUA VEZ
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectSeat(player.id);
            }}
            style={{
              padding: '4px 10px',
              background: isSelectedLocalView ? '#D97706' : '#2B2620',
              color: '#FAF6EE',
              border: 'none',
              borderRadius: '4px',
              fontSize: '9.5px',
              fontWeight: '900',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Eye size={11} /> {isSelectedLocalView ? 'Visualizando' : 'Assumir Mesa'}
          </button>
        </div>
      </div>
    );
  };

  const p1 = allPlayers[0];
  const p2 = allPlayers[1];
  const p3 = allPlayers[2];
  const p4 = allPlayers[3];
  const p5 = allPlayers[4];
  const p6 = allPlayers[5];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* BARRA SUPERIOR DO PANORAMA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          background: '#FAF6EE',
          border: '2.5px solid #2B2620',
          borderRadius: '10px',
          padding: '12px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={22} color="#B45309" />
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#1E1B18', margin: 0, fontFamily: 'monospace' }}>
              MESA COMPLETA DE PLAYTEST ({playerCount} JOGADORES ATIVOS)
            </h2>
            <div style={{ fontSize: '10.5px', color: '#685F53', fontFamily: 'monospace' }}>
              Clique no assento de qualquer jogador para assumir sua visão de mesa e jogar com seu tapete!
            </div>
          </div>
        </div>

        {/* SELETOR DE JOGADORES NA MESA (2 A 6) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10.5px', fontFamily: 'monospace', fontWeight: '800', color: '#685F53' }}>
            Jogadores na Partida:
          </span>
          <div style={{ display: 'flex', gap: '4px', background: '#FFFFFF', padding: '3px', borderRadius: '6px', border: '1.5px solid #2B2620' }}>
            {[2, 3, 4, 5, 6].map(count => (
              <button
                key={count}
                onClick={() => {
                  soundFx.playClick();
                  setPlayerCount(count);
                }}
                style={{
                  padding: '4px 10px',
                  background: playerCount === count ? '#2B2620' : 'transparent',
                  color: playerCount === count ? '#FAF6EE' : '#2B2620',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
                title={count === 2 ? 'Modo Duelo Oficial V1.4 (2 Jogadores)' : `${count} Jogadores ao redor da mesa`}
              >
                {count}{count === 2 ? ' (Duelo)' : ''}
              </button>
            ))}
          </div>

          <button
            onClick={onFocusMyMat}
            style={{
              padding: '8px 18px',
              background: '#2B2620',
              color: '#FAF6EE',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '900',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '8px'
            }}
          >
            <ArrowLeft size={14} /> Voltar ao Meu Tapete
          </button>
        </div>
      </div>

      {/* A MESA REAL COM POSIÇÕES AO REDOR DO TABULEIRO CENTRAL */}
      <div
        style={{
          background: '#EAE1D3',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 80%),
            linear-gradient(to bottom, #ECE4D6 0%, #DBD0BD 100%)
          `,
          border: '4px solid #2B2620',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* LINHA SUPERIOR DA MESA: JOGADOR 1 & JOGADOR 2 */}
        <div>
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53', marginBottom: '8px' }}>
            ▲ CABECEIRA NORTE DA MESA ▲
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderPlayerCardSeat(p1, 'Jogador 1')}
            {renderPlayerCardSeat(p2, 'Jogador 2')}
          </div>
        </div>

        {/* CENTRO DA MESA: TABULEIRO CENTRAL FLANQUEADO POR JOGADORES 6 E 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: '16px', alignItems: 'center' }}>
          {/* LADO OESTE: JOGADOR 6 */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53', marginBottom: '6px', textAlign: 'center' }}>
              ◀ LADO OESTE (JOGADOR 6)
            </div>
            {renderPlayerCardSeat(p6, 'Jogador 6')}
          </div>

          {/* MIOLO: O TABULEIRO CENTRAL OFICIAL */}
          <div>
            <CenterMarketMat totalRounds={8} />
          </div>

          {/* LADO LESTE: JOGADOR 3 */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53', marginBottom: '6px', textAlign: 'center' }}>
              (JOGADOR 3) LADO LESTE ▶
            </div>
            {renderPlayerCardSeat(p3, 'Jogador 3')}
          </div>
        </div>

        {/* LINHA INFERIOR DA MESA: JOGADOR 5 & JOGADOR 4 */}
        <div>
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', color: '#685F53', marginBottom: '8px' }}>
            ▼ CABECEIRA SUL DA MESA ▼
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderPlayerCardSeat(p5, 'Jogador 5')}
            {renderPlayerCardSeat(p4, 'Jogador 4')}
          </div>
        </div>
      </div>
    </div>
  );
};
