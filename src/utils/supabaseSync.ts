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
  private presenceListeners: ((presence: Record<string, any>) => void)[] = [];
  private isSubscribed: boolean = false;

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

  public onPresenceChange(cb: (presence: Record<string, any>) => void) {
    this.presenceListeners.push(cb);
    cb(this.presenceUsers);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(l => l !== cb);
    };
  }

  public joinRoom(roomCode: string, playerId: string, playerName: string = 'Hacker') {
    const formattedCode = roomCode.toUpperCase().trim();

    // Se já estiver no mesmo canal e mesmo player, não desconecta nem recria
    if (this.channel && this.roomCode === formattedCode && this.playerId === playerId) {
      console.log(`[PWND Supabase] Mantendo canal existente na sala ${formattedCode} como ${playerId}.`);
      return;
    }

    this.roomCode = formattedCode;
    this.playerId = playerId;
    this.playerName = playerName;

    // Se houver canal antigo com outra sala ou role, desconecta
    if (this.channel) {
      this.isSubscribed = false;
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
          this.presenceListeners.forEach(cb => {
            try { cb(state); } catch (err) { console.error('[PWND Supabase] Erro listener presença:', err); }
          });
        })
        .subscribe((status) => {
          console.log(`[PWND Supabase] Status da sala ${this.roomCode}:`, status);
          if (status === 'SUBSCRIBED') {
            this.isSubscribed = true;
            if (this.channel) {
              this.channel.track({
                playerId: this.playerId,
                playerName: this.playerName,
                onlineAt: new Date().toISOString()
              });
            }
          } else {
            this.isSubscribed = false;
          }
        });
    } else {
      console.log(`[PWND Fallback] Conectado à sala ${this.roomCode} via BroadcastChannel local.`);
    }
  }

  public leaveRoom() {
    this.isSubscribed = false;
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.roomCode = null;
    this.presenceUsers = {};
    this.presenceListeners.forEach(cb => {
      try { cb({}); } catch (e) {}
    });
  }

  public async broadcastAsync(actionType: string, payload: any): Promise<void> {
    if (!this.roomCode) return;

    const message: RoomMessage = {
      roomCode: this.roomCode,
      senderId: this.playerId,
      senderName: this.playerName,
      actionType,
      payload,
      timestamp: Date.now()
    };

    // Sempre envia também no fallback para suportar abas locais mesmo se Supabase falhar
    if (this.fallbackChannel) {
      try {
        this.fallbackChannel.postMessage(message);
      } catch (err) {}
    }

    if (this.channel && this.client && this.isSubscribed) {
      try {
        await this.channel.send({
          type: 'broadcast',
          event: 'game_action',
          payload: message
        });
      } catch (err) {
        console.warn('[PWND Supabase] Falha ao enviar broadcast:', err);
      }
    }
  }

  public broadcast(actionType: string, payload: any) {
    this.broadcastAsync(actionType, payload).catch(() => {});
  }

  public subscribe(callback: RoomCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public async saveMatchLog(payload: {
    roomCode?: string | null;
    gameMode?: string;
    playerCount: number;
    round: number;
    winner?: string | null;
    metrics?: any;
    auditLogs: any[];
    markdownReport?: string;
  }): Promise<{ success: boolean; error?: any; data?: any }> {
    if (!this.client) {
      console.warn('[PWND Supabase] Cliente Supabase não configurado para salvar log.');
      return { success: false, error: 'Cliente Supabase não configurado.' };
    }

    try {
      const row = {
        room_code: payload.roomCode || 'SOLO_LOCAL',
        player_count: payload.playerCount,
        round: payload.round,
        winner: payload.winner || 'Em andamento',
        metrics: payload.metrics || {},
        audit_logs: payload.auditLogs || [],
        markdown_report: payload.markdownReport || '',
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('match_logs')
        .insert([row]);

      if (error) {
        console.warn('[PWND Supabase] Falha ao persistir na tabela match_logs:', error);
        return { success: false, error };
      }

      console.log('[PWND Supabase] Log da partida persistido com sucesso no banco!');
      return { success: true, data };
    } catch (err: any) {
      console.warn('[PWND Supabase] Exceção ao gravar log da partida:', err);
      return { success: false, error: err };
    }
  }

  public async getMatchLogs(limit: number = 25): Promise<{ data: any[] | null; error: any }> {
    if (!this.client) return { data: null, error: 'Cliente Supabase não configurado.' };
    try {
      const { data, error } = await this.client
        .from('match_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
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
