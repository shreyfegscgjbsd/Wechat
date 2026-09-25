type RealtimeCallback = (event: { type: string; payload: unknown }) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<RealtimeCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private url: string | null = null;
  private userId: string | null = null;
  private isConnecting = false;

  connect(url: string, userId: string): void {
    this.url = url;
    this.userId = userId;
    this.isConnecting = true;

    const fullUrl = `${url}?userId=${encodeURIComponent(userId)}`;
    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const callbacks = this.callbacks.get(data.type) || [];
        const allCallbacks = this.callbacks.get('*') || [];
        callbacks.forEach((cb) => cb(data));
        allCallbacks.forEach((cb) => cb(data));
      } catch {
        // Ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // Error will trigger onclose
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => {
      if (this.url && this.userId) {
        this.connect(this.url, this.userId);
      }
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
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
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
