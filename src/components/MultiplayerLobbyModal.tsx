import React, { useState, useEffect } from 'react';
import { supabaseSync } from '../utils/supabaseSync';
import { PlayerRoleId } from '../context/BoardGameContext';
import { Users, Globe, Bot, Shield, Key, Copy, Check, ArrowRight, X, Database, Settings, LogOut } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (mode: 'solo' | 'hotseat' | 'lan', roomCode?: string, role?: PlayerRoleId, nickname?: string) => void;
  initialRoomCode?: string | null;
  playerCount?: number;
  onSetPlayerCount?: (count: number) => void;
  onLeaveRoom?: () => void;
  currentRole?: PlayerRoleId;
  gameMode?: 'solo' | 'hotseat' | 'lan';
}

const SEATS: { id: PlayerRoleId; label: string; color: string }[] = [
  { id: 'player-1', label: 'Jogador 1 (Host)', color: '#16A34A' },
  { id: 'player-2', label: 'Jogador 2', color: '#2563EB' },
  { id: 'player-3', label: 'Jogador 3', color: '#DC2626' },
  { id: 'player-4', label: 'Jogador 4', color: '#D97706' },
  { id: 'player-5', label: 'Jogador 5', color: '#9333EA' },
  { id: 'player-6', label: 'Jogador 6', color: '#0D9488' }
];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  initialRoomCode,
  playerCount = 2,
  onSetPlayerCount,
  onLeaveRoom,
  currentRole = 'player-1',
  gameMode = 'solo'
}) => {
  const [activeTab, setActiveTab] = useState<'mode' | 'create' | 'join' | 'seats'>('mode');
  const [inputCode, setInputCode] = useState<string>('');
  const [createdCode, setCreatedCode] = useState<string>('');
  const [selectedSeatsCount, setSelectedSeatsCount] = useState<number>(playerCount || 2);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [presenceUsers, setPresenceUsers] = useState<Record<string, any>>({});
  const [playerNickname, setPlayerNickname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pwnd_player_nickname') || '';
    }
    return '';
  });

  const handleNicknameChange = (val: string) => {
    setPlayerNickname(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwnd_player_nickname', val);
    }
  };

  // Reset ou inicialização limpa ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      if (!initialRoomCode && gameMode !== 'lan') {
        // Nenhuma sala ativa ou link pendente: abre limpo
        setCreatedCode('');
        setInputCode('');
        setActiveTab('mode');
      } else if (initialRoomCode && gameMode !== 'lan') {
        // Aberto via link de convite (visitante): conecta ao canal de presença da sala
        const code = initialRoomCode.toUpperCase().trim();
        setInputCode(code);
        const visitorId = `visitor-${Math.random().toString(36).substring(2, 8)}`;
        supabaseSync.joinRoom(code, visitorId, 'Visitante');
        setActiveTab('seats');
      }
    }
  }, [isOpen, initialRoomCode, gameMode]);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = supabaseSync.onPresenceChange((users) => {
      setPresenceUsers(users);
    });
    return () => unsub();
  }, [isOpen]);

  const handleClose = () => {
    soundFx.playClick();
    if (gameMode !== 'lan') {
      supabaseSync.leaveRoom();
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentRoomCode = createdCode || inputCode || initialRoomCode || '';
  // É Host somente se criou a sala neste navegador
  const isHost = createdCode !== '' && createdCode === currentRoomCode;

  const handleCreateRoom = () => {
    soundFx.playClick();
    const code = 'PWND-' + Math.floor(1000 + Math.random() * 9000);
    if (onSetPlayerCount) {
      onSetPlayerCount(selectedSeatsCount);
    }
    const hostDisplay = playerNickname.trim() ? `${playerNickname.trim()} (Host)` : 'Jogador 1 (Host)';
    supabaseSync.joinRoom(code, 'player-1', hostDisplay);
    setCreatedCode(code);
    setActiveTab('create');
  };

  const handleGoToSeats = () => {
    if (!inputCode.trim()) return;
    soundFx.playClick();
    const code = inputCode.trim().toUpperCase();
    setInputCode(code);
    const visitorId = `visitor-${Math.random().toString(36).substring(2, 8)}`;
    supabaseSync.joinRoom(code, visitorId, 'Visitante');
    setActiveTab('seats');
  };

  const handleSelectSeat = (roleId: PlayerRoleId) => {
    // Regra rígida: Visitante NUNCA assume a vaga do Host (player-1)
    if (roleId === 'player-1' && !isHost) {
      alert('O assento de Jogador 1 pertence exclusivamente ao criador da sala.');
      return;
    }
    soundFx.playClick();
    const targetCode = currentRoomCode.toUpperCase().trim();
    const seatInfo = SEATS.find(s => s.id === roleId);
    const nickClean = playerNickname.trim();
    const presenceLabel = nickClean || seatInfo?.label || `Jogador (${roleId})`;
    supabaseSync.joinRoom(targetCode, roleId, presenceLabel);
    onStartGame('lan', targetCode, roleId, nickClean);
    onClose();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(createdCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareableLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${createdCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveAndReset = () => {
    onLeaveRoom?.();
    setCreatedCode('');
    setInputCode('');
    setActiveTab('mode');
    onClose();
  };

  const occupiedKeys = Object.keys(presenceUsers).filter(k => k.startsWith('player-'));

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '620px',
          width: '94%',
          padding: '24px',
          border: '2px solid var(--cyber-blue, #00e5ff)',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
          background: 'linear-gradient(180deg, #101929 0%, #0d0f1a 100%)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="#00e5ff" />
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#00e5ff', letterSpacing: '3px', textTransform: 'uppercase' }}>
                LOBBY DE PLAYTEST ONLINE (V1.4)
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', margin: 0 }}>
                Mesa Remota Multijogador
              </h2>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Status Conectado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', background: 'rgba(0, 255, 102, 0.08)', border: '1px solid rgba(0, 255, 102, 0.3)', padding: '8px 12px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff66', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            <span style={{ fontSize: '14px' }}>🟢</span> Servidor Realtime Ativo & Conectado
          </div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>Supabase Broadcast & Presence</span>
        </div>

        {/* Banner de Mesa Ativa / Opção de Encerrar ou Sair */}
        {gameMode === 'lan' && currentRoomCode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '8px' }}>
            <div>
              <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}>
                MESA ATIVA: {currentRoomCode} ({currentRole === 'player-1' ? '👑 Você é o Host' : `💺 Você está no assento ${currentRole}`})
              </div>
              <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                {currentRole === 'player-1'
                  ? 'Como anfitrião, você pode encerrar a partida para todos os participantes.'
                  : 'Você pode desconectar e sair da mesa a qualquer momento.'}
              </div>
            </div>
            <button
              onClick={() => {
                const isHostRole = currentRole === 'player-1';
                const msg = isHostRole
                  ? 'Deseja realmente encerrar a mesa online para todos os jogadores?'
                  : 'Deseja realmente sair desta mesa online?';
                if (confirm(msg)) {
                  soundFx.playClick();
                  handleLeaveAndReset();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} /> {currentRole === 'player-1' ? 'Encerrar Mesa' : 'Sair da Mesa'}
            </button>
          </div>
        )}

        {/* Tab: Escolha do Modo */}
        {activeTab === 'mode' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Modo Remoto Online */}
            <div
              style={{
                background: 'rgba(0, 229, 255, 0.06)',
                border: '1px solid #00e5ff',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 229, 255, 0.2)', padding: '10px', borderRadius: '8px' }}>
                  <Globe size={24} color="#00e5ff" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#00e5ff', fontFamily: 'monospace', margin: 0 }}>
                    Mesa Remota Online (2 a 6 Jogadores)
                  </h4>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    Envie o link da sala para qualquer pessoa jogar no computador ou celular em tempo real!
                  </div>
                </div>
              </div>

              {/* Campo de Nickname do Jogador */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  👤 Seu Nome / Nick:
                </span>
                <input
                  type="text"
                  placeholder="Ex: Paulo, CyberFox..."
                  value={playerNickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  maxLength={20}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid #00e5ff',
                    borderRadius: '4px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Seletor de vagas para a nova mesa */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Vagas na Mesa:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => { soundFx.playClick(); setSelectedSeatsCount(num); }}
                      style={{
                        padding: '4px 10px',
                        background: selectedSeatsCount === num ? '#00e5ff' : 'rgba(255,255,255,0.08)',
                        color: selectedSeatsCount === num ? '#000' : '#fff',
                        border: selectedSeatsCount === num ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        fontWeight: '900',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        cursor: 'pointer'
                      }}
                    >
                      {num}P
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCreateRoom}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#00e5ff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Criar Sala ({selectedSeatsCount}P)
                </button>

                <button
                  onClick={() => { soundFx.playClick(); setActiveTab('join'); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  🔗 Entrar com Código
                </button>
              </div>
            </div>

            {/* Modo Solo Sandbox */}
            <div
              onClick={() => {
                soundFx.playClick();
                onStartGame('solo');
                onClose();
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '8px' }}>
                <Bot size={22} color="#a855f7" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', margin: 0 }}>
                  Playtest Solo / Sandbox Completo
                </h4>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  Explore a mesa, compre cartas, monte combos e teste a probabilidade do Patch sozinho.
                </div>
              </div>
            </div>

            {/* Modo Hotseat */}
            <div
              onClick={() => {
                soundFx.playClick();
                onStartGame('hotseat');
                onClose();
              }}
              style={{
                background: 'rgba(0, 255, 102, 0.04)',
                border: '1px solid rgba(0, 255, 102, 0.3)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ background: 'rgba(0, 255, 102, 0.15)', padding: '8px', borderRadius: '8px' }}>
                <Users size={22} color="#00ff66" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#00ff66', fontFamily: 'monospace', margin: 0 }}>
                  2 Jogadores na Mesma Tela (Hotseat)
                </h4>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  Dois jogadores no mesmo monitor alternando turnos entre os tabuleiros.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Criar Sala */}
        {activeTab === 'create' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
              Sala Criada para <strong style={{ color: '#00e5ff' }}>{selectedSeatsCount} Jogadores</strong>! Compartilhe o link com seus colegas:
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffb800', fontFamily: 'monospace', letterSpacing: '4px', background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: '8px', border: '1px solid #ffb800' }}>
                {createdCode}
              </div>

              <button
                onClick={copyRoomCode}
                title="Copiar Código"
                style={{
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {copiedCode ? <Check size={18} color="#00ff66" /> : <Copy size={18} />}
              </button>
            </div>

            <button
              onClick={copyShareableLink}
              style={{
                width: '100%',
                padding: '12px',
                background: '#00e5ff',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '800',
                fontFamily: 'monospace',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              {copiedLink ? <Check size={18} /> : <Globe size={18} />}
              {copiedLink ? 'Link Copiado! Envie aos participantes' : 'Copiar Link de Convite da Sala'}
            </button>

            {/* Vagas e Presença em Tempo Real */}
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', marginBottom: '8px', fontWeight: 'bold' }}>
                VAGAS NA MESA ({selectedSeatsCount} JOGADORES):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SEATS.slice(0, selectedSeatsCount).map((seat) => {
                  const isHostSeat = seat.id === 'player-1';
                  const isOccupied = isHostSeat || occupiedKeys.includes(seat.id);
                  const occupantName = presenceUsers[seat.id]?.[0]?.playerName;
                  return (
                    <div
                      key={seat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: isHostSeat ? 'rgba(0, 255, 102, 0.08)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOccupied ? '#00ff66' : '#6b7280' }} />
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{seat.label}</span>
                      </div>
                      <span style={{ color: isHostSeat ? '#00ff66' : isOccupied ? '#00e5ff' : '#9ca3af', fontSize: '10px' }}>
                        {isHostSeat
                          ? `👑 ${playerNickname.trim() || 'Você'} (Host)`
                          : isOccupied
                          ? `🟢 ${occupantName || 'Conectado'}`
                          : 'Aguardando jogador...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (gameMode !== 'lan') supabaseSync.leaveRoom();
                  setActiveTab('mode');
                }}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}
              >
                ← Voltar
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onStartGame('lan', createdCode, 'player-1', playerNickname.trim());
                  onClose();
                }}
                style={{ flex: 2, padding: '10px', background: '#00ff66', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', fontWeight: '800' }}
              >
                Iniciar Partida na Mesa 🚀
              </button>
            </div>
          </div>
        )}

        {/* Tab: Entrar com Código */}
        {activeTab === 'join' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px' }}>
              Digite o Código da Sala recebido do anfitrião:
            </div>

            <input
              type="text"
              placeholder="Ex: PWND-4821"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '20px',
                textAlign: 'center',
                fontFamily: 'monospace',
                letterSpacing: '3px',
                background: 'rgba(0,0,0,0.5)',
                border: '2px solid #00e5ff',
                borderRadius: '8px',
                color: '#fff',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (gameMode !== 'lan') supabaseSync.leaveRoom();
                  setActiveTab('mode');
                }}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}
              >
                ← Cancelar
              </button>
              <button
                onClick={handleGoToSeats}
                disabled={!inputCode.trim()}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: inputCode.trim() ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                  color: inputCode.trim() ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: inputCode.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  fontWeight: '800'
                }}
              >
                Ver Vagas na Mesa →
              </button>
            </div>
          </div>
        )}

        {/* Tab: Escolha de Assento (Seats) */}
        {activeTab === 'seats' && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                SALA ONLINE: <strong style={{ color: '#ffb800', letterSpacing: '2px' }}>{currentRoomCode}</strong>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', margin: '4px 0 2px' }}>
                Escolha seu Assento na Mesa
              </h3>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>
                Informe seu nome/nickname e clique em uma das vagas disponíveis abaixo:
              </p>
            </div>

            {/* Campo de Nickname na seleção de assento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid #00e5ff', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: '#00e5ff', fontFamily: 'monospace', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                👤 Seu Nickname:
              </span>
              <input
                type="text"
                placeholder="Digite seu nome ou apelido..."
                value={playerNickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              {SEATS.map((seat) => {
                const isHostSeat = seat.id === 'player-1';
                const isSelf = currentRole === seat.id && gameMode === 'lan';
                // Regra inviolável: o assento do Host (Jogador 1) é SEMPRE bloqueado para qualquer visitante
                const isOccupied = isHostSeat ? !isHost : (occupiedKeys.includes(seat.id) && !isSelf);
                const isSelectable = !isOccupied && !isSelf;
                const occupantName = presenceUsers[seat.id]?.[0]?.playerName;

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSelectSeat(seat.id)}
                    disabled={!isSelectable}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      background: isSelf
                        ? 'rgba(0, 255, 102, 0.12)'
                        : isOccupied
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0, 229, 255, 0.08)',
                      border: isSelf
                        ? '1.5px solid #00ff66'
                        : isOccupied
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1.5px solid #00e5ff',
                      borderRadius: '8px',
                      cursor: isSelectable ? 'pointer' : 'not-allowed',
                      opacity: isOccupied ? 0.6 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', color: isSelf ? '#00ff66' : isOccupied ? '#9ca3af' : '#fff', fontFamily: 'monospace', fontSize: '13px' }}>
                        {seat.label}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSelf ? '#00ff66' : isHostSeat ? '#eab308' : isOccupied ? '#ef4444' : '#00e5ff',
                          color: '#000',
                          fontWeight: 'bold',
                          fontFamily: 'monospace'
                        }}
                      >
                        {isSelf ? 'Seu Assento' : isHostSeat ? 'Host (Ocupado)' : isOccupied ? 'Ocupado' : 'Disponível'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: isSelf ? '#00ff66' : isOccupied ? '#6b7280' : '#00e5ff', fontFamily: 'monospace' }}>
                      {isSelf
                        ? '🟢 Você já está jogando neste assento'
                        : isHostSeat
                        ? `🔒 Anfitrião (${occupantName || 'Host'})`
                        : isOccupied
                        ? `🔴 Ocupado por: ${occupantName || 'Outro jogador'}`
                        : '👉 Clicar para sentar nesta vaga'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (gameMode !== 'lan') supabaseSync.leaveRoom();
                  setActiveTab('mode');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              >
                ← Voltar ao Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
