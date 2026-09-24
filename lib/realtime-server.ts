import { WebSocketServer, type WebSocket } from "ws";
import { prisma } from "./prisma";

interface RealtimeClient {
  ws: WebSocket;
  userId: string;
  conversations: Set<string>;
}

const clients = new Map<WebSocket, RealtimeClient>();

export function startRealtimeServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", async (ws: WebSocket, req: { url?: string }) => {
    const url = new URL(req.url || "", `http://localhost:${port}`);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      ws.close(1008, "Missing userId");
      return;
    }

    const user = await prisma.userProfile
      .findUnique({ where: { id: userId } })
      .catch(() => null);

    if (!user) {
      ws.close(1008, "Invalid user");
      return;
    }

    const client: RealtimeClient = { ws, userId, conversations: new Set() };
    clients.set(ws, client);

    ws.on("message", (data: Buffer | string) => {
      try {
        const event = JSON.parse(typeof data === "string" ? data : data.toString());
        handleClientMessage(client, event);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  wss.on("error", (err: Error) => {
    console.error("Realtime server error:", err);
  });

  console.log(`Realtime server running on ws://localhost:${port}`);
  return wss;
}

function handleClientMessage(
  client: RealtimeClient,
  event: { type: string; payload?: Record<string, unknown> }
): void {
  switch (event.type) {
    case "subscribe":
      if (event.payload?.conversationId) {
        client.conversations.add(event.payload.conversationId as string);
      }
      break;
    case "unsubscribe":
      if (event.payload?.conversationId) {
        client.conversations.delete(event.payload.conversationId as string);
      }
      break;
    case "typing_start":
    case "typing_stop":
      broadcastToConversation(
        event.payload?.conversationId as string,
        client.userId,
        event.type === "typing_start" ? "conversation:typing_started" : "conversation:typing_stopped",
        { userId: client.userId, conversationId: event.payload?.conversationId }
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
  payload: Record<string, unknown>
): void {
  const event = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });

  for (const client of Array.from(clients.values())) {
    if (client.userId === senderUserId) continue;
    if (client.conversations.has(conversationId) && client.ws.readyState === 1) {
      client.ws.send(event);
    }
  }
}

export function broadcast(conversationId: string, eventType: string, payload: Record<string, unknown>): void {
  const event = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });

  for (const client of Array.from(clients.values())) {
    if (client.conversations.has(conversationId) && client.ws.readyState === 1) {
      client.ws.send(event);
    }
  }
}
