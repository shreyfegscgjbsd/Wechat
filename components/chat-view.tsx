"use client";

import * as React from "react";
import { useEffect, useCallback, useRef } from "react";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { realtimeClient, REALTIME_EVENTS } from "@/lib/realtime";
import type {
  Conversation,
  Message,
  UserProfile,
} from "@/lib/types";

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: UserProfile;
  otherUser: UserProfile | null;
}

export function ChatView({
  conversation,
  messages: initialMessages,
  currentUser,
  otherUser,
}: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const messagesRef = useRef<Message[]>(initialMessages);

  const refreshMessages = useCallback(
    async (retryOn401 = true) => {
      try {
        const res = await fetch(
          `/api/conversations/${conversation.id}/messages?limit=50`
        );
        if (res.status === 401) return;
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
        messagesRef.current = data.messages;
      } catch {
        // network error, ignore
      }
    },
    [conversation.id]
  );

  useEffect(() => {
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
  }, [initialMessages]);

  // Subscribe to realtime events — replaces polling
  useEffect(() => {
    const onMessageCreated = (event: { payload: unknown }) => {
      const msg = event.payload as Message;
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const updated = [...prev, msg];
        messagesRef.current = updated;
        return updated;
      });
    };

    const onMessageUpdated = (event: { payload: unknown }) => {
      const msg = event.payload as Message;
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? msg : m))
      );
    };

    const onMessageDeleted = (event: { payload: unknown }) => {
      const payload = event.payload as { messageId: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? { ...m, deletedAt: new Date().toISOString() }
            : m
        )
      );
    };

    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_CREATED, onMessageCreated);
    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_DELETED, onMessageDeleted);

    // Send subscribe event to the server
    realtimeClient.send({
      type: "subscribe",
      payload: { conversationId: conversation.id },
    });

    return () => {
      realtimeClient.send({
        type: "unsubscribe",
        payload: { conversationId: conversation.id },
      });
    };
  }, [conversation.id]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader
        conversation={conversation}
        currentUser={currentUser}
        otherUser={otherUser}
      />
      <MessageList
        messages={messages}
        currentUser={currentUser}
        conversationId={conversation.id}
      />
      <MessageComposer
        conversationId={conversation.id}
        currentUser={currentUser}
        onMessageSent={(msg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const updated = [...prev, msg];
            messagesRef.current = updated;
            return updated;
          });
        }}
      />
    </div>
  );
}