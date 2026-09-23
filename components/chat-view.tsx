"use client";

import * as React from "react";
import { useEffect, useCallback, useRef } from "react";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
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
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshMessages = useCallback(
    async (retryOn401 = true) => {
      try {
        const res = await fetch(
          `/api/conversations/${conversation.id}/messages?limit=50`
        );
        if (res.status === 401) {
          // Session refresh in progress, retry after delay
          if (retryOn401) {
            retryRef.current = setTimeout(() => refreshMessages(false), 2000);
          }
          return;
        }
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

  // Poll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMessages();
    }, 3000);
    return () => {
      clearInterval(interval);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [refreshMessages]);

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