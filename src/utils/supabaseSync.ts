/**
 * PWND! Bug Bounty Chaos — Supabase Realtime Multiplayer Sync
 * Sincronização em tempo real via Supabase Realtime Broadcast & Presence.
 * Fallback transparente para BroadcastChannel quando credenciais não estiverem definidas.
 */
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface RoomMessage {
  roomCode: string;
  senderId: string;
  senderName?: string;
  actionType: string;
  payload: any;
  timestamp: number;
}

export type RoomCallback = (msg: RoomMessage) => void;

class SupabaseSyncManager {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private fallbackChannel: BroadcastChannel | null = null;
  private roomCode: string | null = null;
  private playerId: string = 'player-1';
  private playerName: string = 'Jogador 1';
  private listeners: RoomCallback[] = [];
  private presenceUsers: Record<string, any> = {};

  constructor() {
    this.initClient();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.fallbackChannel = new BroadcastChannel('pwnd_v14_multiplayer_sync');
      this.fallbackChannel.onmessage = (e) => {
        if (!this.client && e.data) {
          this.handleIncoming(e.data);
        }
      };
    }
  }

  public initClient(customUrl?: string, customKey?: string) {
    const metaEnv = (import.meta as any).env || {};
    const defaultUrl = 'https://cpaayfbkpwotqniwkzsl.supabase.co';
    const defaultKey = 'sb_publishable_KnmKMS90UzS8MTMcx3uERQ_TjmFq_q_';

    const url = customUrl || metaEnv.VITE_SUPABASE_URL || localStorage.getItem('pwnd_supabase_url') || defaultUrl;
    const key = customKey || metaEnv.VITE_SUPABASE_ANON_KEY || localStorage.getItem('pwnd_supabase_anon_key') || defaultKey;

    if (url && key) {
      try {
        this.client = createClient(url, key, {
          realtime: {
            params: {
              eventsPerSecond: 20
            }
          }
        });
        console.log('[PWND Supabase] Cliente inicializado com sucesso.');
      } catch (err) {
        console.error('[PWND Supabase] Erro ao instanciar cliente:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public setCustomCredentials(url: string, key: string): boolean {
    if (!url || !key) return false;
    try {
      localStorage.setItem('pwnd_supabase_url', url.trim());
      localStorage.setItem('pwnd_supabase_anon_key', key.trim());
      this.initClient(url.trim(), key.trim());
      if (this.roomCode) {
        this.joinRoom(this.roomCode, this.playerId, this.playerName);
      }
      return true;
    } catch (err) {
      console.error('[PWND Supabase] Erro ao salvar credenciais:', err);
      return false;
    }
  }

  public clearCredentials() {
    localStorage.removeItem('pwnd_supabase_url');
    localStorage.removeItem('pwnd_supabase_anon_key');
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.client = null;
  }

  public isSupabaseConfigured(): boolean {
    return !!this.client;
  }

  public getRoomCode(): string | null {
    return this.roomCode;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getPresenceUsers(): string[] {
    return Object.keys(this.presenceUsers);
  }

  public joinRoom(roomCode: string, playerId: string, playerName: string = 'Hacker') {
    this.roomCode = roomCode.toUpperCase().trim();
    this.playerId = playerId;
    this.playerName = playerName;

    // Se houver canal antigo, desconecta
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    if (this.client) {
      const channelName = `pwnd_room_${this.roomCode}`;
      this.channel = this.client.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: this.playerId }
        }
      });

      this.channel
        .on('broadcast', { event: 'game_action' }, (response) => {
          if (response && response.payload) {
            this.handleIncoming(response.payload as RoomMessage);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const state = this.channel?.presenceState() || {};
          this.presenceUsers = state;
        })
        .subscribe((status) => {
          console.log(`[PWND Supabase] Status da sala ${this.roomCode}:`, status);
          if (status === 'SUBSCRIBED' && this.channel) {
            this.channel.track({
              playerId: this.playerId,
              playerName: this.playerName,
              onlineAt: new Date().toISOString()
            });
          }
        });
    } else {
      console.log(`[PWND Fallback] Conectado à sala ${this.roomCode} via BroadcastChannel local.`);
    }
  }

  public leaveRoom() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.roomCode = null;
    this.presenceUsers = {};
  }

  public broadcast(actionType: string, payload: any) {
    if (!this.roomCode) return;

    const message: RoomMessage = {
      roomCode: this.roomCode,
      senderId: this.playerId,
      senderName: this.playerName,
      actionType,
      payload,
      timestamp: Date.now()
    };

    if (this.channel && this.client) {
      this.channel.send({
        type: 'broadcast',
        event: 'game_action',
        payload: message
      });
    }

    // Sempre envia também no fallback para suportar abas locais mesmo se Supabase falhar
    if (this.fallbackChannel) {
      this.fallbackChannel.postMessage(message);
    }
  }

  public subscribe(callback: RoomCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private handleIncoming(msg: RoomMessage) {
    if (!this.roomCode || msg.roomCode !== this.roomCode) return;
    if (msg.senderId === this.playerId) return; // ignora mensagens enviadas por si mesmo
    this.listeners.forEach(cb => {
      try {
        cb(msg);
      } catch (err) {
        console.error('[PWND Room] Erro no listener de mensagem:', err);
      }
    });
  }
}

export const supabaseSync = new SupabaseSyncManager();
