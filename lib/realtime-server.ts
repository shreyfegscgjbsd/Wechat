import { WebSocketServer, type WebSocket } from 'ws';
import { prisma } from './prisma';

interface RealtimeClient {
  ws: WebSocket;
  userId: string;
  conversations: Set<string>;
  connectedAt: number;
}

const clients = new Map<WebSocket, RealtimeClient>();

// Rate limit: max 10 connection attempts per minute per "client" (by IP or userId)
const connectionAttempts = new Map<string, number[]>();
const MAX_CONNECTIONS_PER_MINUTE = 10;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = connectionAttempts.get(identifier) ?? [];
  // Remove entries older than 60 seconds
  const recent = attempts.filter((t) => now - t < 60_000);
  connectionAttempts.set(identifier, recent);
  if (recent.length >= MAX_CONNECTIONS_PER_MINUTE) return false;
  recent.push(now);
  return true;
}

// Simple UUID validator — rejects injection attempts like "admin; DROP TABLE"
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function startRealtimeServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', async (ws: WebSocket, req: { url?: string }) => {
    const url = new URL(req.url || '', `http://localhost:${port}`);
    const userId = url.searchParams.get('userId');

    if (!userId || !isValidUUID(userId)) {
      ws.close(1008, 'Invalid or missing userId');
      return;
    }

    // Rate limit connections
    if (!checkRateLimit(userId)) {
      ws.close(1008, 'Too many connection attempts');
      return;
    }

    const user = await prisma.userProfile.findUnique({ where: { id: userId } }).catch(() => null);

    if (!user) {
      ws.close(1008, 'User not found');
      return;
    }

    const client: RealtimeClient = {
      ws,
      userId,
      conversations: new Set(),
      connectedAt: Date.now(),
    };
    clients.set(ws, client);

    ws.on('message', (data: Buffer | string) => {
      try {
        const raw = typeof data === 'string' ? data : data.toString();
        // Validate payload size before parsing
        if (raw.length > 65_536) {
          ws.close(1009, 'Message too large');
          return;
        }
        const event = JSON.parse(raw);
        handleClientMessage(client, event);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  wss.on('error', (err: Error) => {
    console.error('Realtime server error:', err);
  });

  console.log(`Realtime server running on ws://localhost:${port}`);
  return wss;
}

function handleClientMessage(
  client: RealtimeClient,
  event: { type: string; payload?: Record<string, unknown> },
): void {
  // Rate limit messages per client: max 20 per minute
  const now = Date.now();
  const msgs = (client as RealtimeClient & { _msgTimes?: number[] })._msgTimes ?? [];
  const recent = msgs.filter((t) => now - t < 60_000);
  if (recent.length >= 20) return;
  recent.push(now);
  (client as RealtimeClient & { _msgTimes?: number[] })._msgTimes = recent;

  switch (event.type) {
    case 'subscribe':
      if (typeof event.payload?.conversationId === 'string') {
        client.conversations.add(event.payload.conversationId);
      }
      break;
    case 'unsubscribe':
      if (typeof event.payload?.conversationId === 'string') {
        client.conversations.delete(event.payload.conversationId);
      }
      break;
    case 'typing_start':
    case 'typing_stop':
      if (typeof event.payload?.conversationId !== 'string') return;
      broadcastToConversation(
        event.payload.conversationId,
        client.userId,
        event.type === 'typing_start'
          ? 'conversation:typing_started'
          : 'conversation:typing_stopped',
        { userId: client.userId, conversationId: event.payload.conversationId },
      );
      break;
    default:
      break;
  }
}

function broadcastToConversation(
  conversationId: string,
  senderUserId: string,
  eventType: string,
  payload: Record<string, unknown>,
): void {
  const event = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });

  for (const client of Array.from(clients.values())) {
    if (client.userId === senderUserId) continue;
    if (client.conversations.has(conversationId) && client.ws.readyState === 1) {
      client.ws.send(event);
    }
  }
}

export function broadcast(
  conversationId: string,
  eventType: string,
  payload: Record<string, unknown>,
): void {
  const event = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });

  for (const client of Array.from(clients.values())) {
    if (client.conversations.has(conversationId) && client.ws.readyState === 1) {
      client.ws.send(event);
    }
  }
}
