import React, { useState, useEffect } from 'react';
import { supabaseSync } from '../utils/supabaseSync';
import { Users, Globe, Bot, Shield, Key, Copy, Check, ArrowRight, X, Database, Settings } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (mode: 'solo' | 'hotseat' | 'lan', roomCode?: string, role?: 'player-1' | 'player-2') => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({ isOpen, onClose, onStartGame }) => {
  const [activeTab, setActiveTab] = useState<'mode' | 'create' | 'join'>('mode');
  const [inputCode, setInputCode] = useState<string>('');
  const [createdCode, setCreatedCode] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    soundFx.playClick();
    const code = 'PWND-' + Math.floor(1000 + Math.random() * 9000);
    supabaseSync.joinRoom(code, 'player-1', 'Jogador 1 (Host)');
    setCreatedCode(code);
    setActiveTab('create');
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    soundFx.playClick();
    const code = inputCode.trim().toUpperCase();
    supabaseSync.joinRoom(code, 'player-2', 'Jogador 2 (Editor)');
    onStartGame('lan', code, 'player-2');
    onClose();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(createdCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareableLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${createdCode}&role=player-2`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="terminal-box"
        style={{
          maxWidth: '600px',
          width: '92%',
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
                Mesa Remota para Editores & Playtesters
              </h2>
            </div>
          </div>
          <button onClick={() => { soundFx.playClick(); onClose(); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Status Conectado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'rgba(0, 255, 102, 0.08)', border: '1px solid rgba(0, 255, 102, 0.3)', padding: '8px 12px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff66', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            <span style={{ fontSize: '14px' }}>🟢</span> Servidor Realtime Ativo & Conectado
          </div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>Pronto para sincronizar</span>
        </div>

        {/* Tab: Escolha do Modo */}
        {activeTab === 'mode' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Modo Remoto Online (Recomendado para Editores) */}
            <div
              style={{
                background: 'rgba(0, 229, 255, 0.06)',
                border: '1px solid #00e5ff',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 229, 255, 0.2)', padding: '10px', borderRadius: '8px' }}>
                  <Globe size={24} color="#00e5ff" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#00e5ff', fontFamily: 'monospace', margin: 0 }}>
                    Mesa Remota Online (2 PCs / Celular / Internet)
                  </h4>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    Envie um link direto para o editor ou colega de testes jogar com você em tempo real via Supabase Realtime!
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
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
                  ➕ Criar Sala Online
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
              Sala Criada! Compartilhe o link direto com o editor:
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
              {copiedLink ? 'Link Copiado para a Área de Transferência!' : 'Copiar Link Completo de Playtest'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('mode')}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}
              >
                ← Voltar
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onStartGame('lan', createdCode, 'player-1');
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
                onClick={() => setActiveTab('mode')}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}
              >
                ← Cancelar
              </button>
              <button
                onClick={handleJoinRoom}
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
                Conectar à Sala 🎲
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
