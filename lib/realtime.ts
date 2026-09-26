import Pusher from 'pusher';

type RealtimeCallback = (event: { type: string; payload: unknown }) => void;
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

class RealtimeClient {
  private pusher: Pusher | null = null;
  private callbacks: Map<string, Set<RealtimeCallback>> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private channelName: string | null = null;
  private userId: string | null = null;

  private setState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.stateListeners.forEach((listener) => {
        try {
          listener(state);
        } catch (e) {
          // Ignore listener errors
        }
      });
    }
  }

  public onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public getState(): ConnectionState {
    return this.connectionState;
  }

  connect(userId: string): void {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    // Check for Pusher credentials
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

    if (!key) {
      console.warn('[Realtime] No Pusher key configured. Real-time features disabled.');
      this.setState('failed');
      return;
    }

    this.userId = userId;
    this.channelName = `private-user-${userId}`;
    this.setState('connecting');

    try {
      this.pusher = new Pusher(key, {
        cluster,
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      });

      this.pusher.connection.bind('connected', () => {
        this.setState('connected');
        console.log('[Realtime] Pusher connected');
      });

      this.pusher.connection.bind('disconnected', () => {
        this.setState('disconnected');
      });

      this.pusher.connection.bind('error', (err: any) => {
        console.error('[Realtime] Pusher connection error:', err);
        this.setState('failed');
      });

      // Subscribe to user's private channel
      const channel = this.pusher.subscribe(this.channelName);
      
      channel.bind('pusher:subscription_succeeded', () => {
        this.setState('connected');
        console.log('[Realtime] Subscribed to user channel:', this.channelName);
      });

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('[Realtime] Subscription error:', err);
        this.setState('failed');
      });

      // Bind to realtime events
      Object.values(REALTIME_EVENTS).forEach((eventName) => {
        channel.bind(eventName, (data: any) => {
          const callbacks = this.callbacks.get(eventName) || [];
          const allCallbacks = this.callbacks.get('*') || [];
          callbacks.forEach((cb) => cb(data));
          this.callbacks.get('*')?.forEach((cb) => cb(data));
        });
      });

    } catch (error) {
      console.error('[Realtime] Failed to initialize Pusher:', error);
      this.setState('failed');
    }
  }

  subscribe(eventType: string, callback: RealtimeCallback): () => void {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, new Set());
    }
    this.callbacks.get(eventType)?.add(callback);

    return () => {
      this.callbacks.get(eventType)?.delete(callback);
    };
  }

  send(event: { type: string; payload: unknown }): void {
    // For Pusher, we send via API endpoint
    fetch('/api/pusher/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error);
  }

  disconnect(): void {
    if (this.pusher) {
      if (this.channelName) {
        this.pusher.unsubscribe(this.channelName);
        this.channelName = null;
      }
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.setState('disconnected');
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

export const realtimeClient = new RealtimeClient();

export function useRealtime() {
  return realtimeClient;
}

export const REALTIME_EVENTS = {
  MESSAGE_CREATED: 'conversation:message_created',
  MESSAGE_UPDATED: 'conversation:message_updated',
  MESSAGE_DELETED: 'conversation:message_deleted',
  TYPING_STARTED: 'conversation:typing_started',
  TYPING_STOPPED: 'conversation:typing_stopped',
  PRESENCE_UPDATED: 'presence:updated',
  MESSAGE_READ: 'message:read',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECTED: 'call:rejected',
  CALL_ENDED: 'call:ended',
  CALL_SIGNALING: 'call:signaling',
} as const;