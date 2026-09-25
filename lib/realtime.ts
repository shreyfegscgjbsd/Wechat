type RealtimeCallback = (event: { type: string; payload: unknown }) => void;
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

class RealtimeClient {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<RealtimeCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private url: string | null = null;
  private userId: string | null = null;
  private isConnecting = false;
  private connectionState: ConnectionState = 'disconnected';
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hasIntentionalDisconnect = false;

  constructor() {
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

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

  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.hasIntentionalDisconnect = false;
    this.setState('connected');
  }

  private handleClose(): void {
    this.isConnecting = false;
    this.ws = null;
    
    if (this.hasIntentionalDisconnect) {
      this.setState('disconnected');
      return;
    }
    
    this.setState('disconnected');
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.setState('failed');
      console.warn('[Realtime] Max reconnect attempts reached. Real-time features unavailable.');
    }
  }

  private handleError(): void {
    // Error will trigger onclose
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const callbacks = this.callbacks.get(data.type) || [];
      const allCallbacks = this.callbacks.get('*') || [];
      callbacks.forEach((cb) => cb(data));
      allCallbacks.forEach((cb) => cb(data));
    } catch (e) {
      // Ignore parse errors
    }
  }

  connect(url: string, userId: string): void {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    if (!url || (!url.startsWith('ws://') && !url.startsWith('wss://'))) {
      console.error('[Realtime] Invalid WebSocket URL:', url);
      this.setState('failed');
      return;
    }

    this.url = url;
    this.userId = userId;
    this.isConnecting = true;
    this.hasIntentionalDisconnect = false;
    this.setState('connecting');

    const fullUrl = `${url}?userId=${encodeURIComponent(userId)}`;
    
    try {
      this.ws = new WebSocket(fullUrl);
      this.ws.onopen = this.handleOpen;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
      this.ws.onmessage = this.handleMessage;
    } catch (error) {
      console.error('[Realtime] Failed to create WebSocket:', error);
      this.setState('failed');
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('failed');
      console.warn('[Realtime] Max reconnect attempts reached. Real-time features unavailable.');
      return;
    }
    
    if (this.hasIntentionalDisconnect) return;
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeoutId = setTimeout(() => {
      if (this.hasIntentionalDisconnect) return;
      if (!this.url || !this.userId) return;
      if (this.connectionState === 'connected' || this.connectionState === 'connecting') return;
      
      this.connect(this.url, this.userId);
    }, delay);
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
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  disconnect(): void {
    this.hasIntentionalDisconnect = true;
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    
    this.setState('disconnected');
    this.reconnectAttempts = 0;
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