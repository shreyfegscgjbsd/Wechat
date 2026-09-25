'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { realtimeClient, REALTIME_EVENTS } from '@/lib/realtime';
import type { Conversation, Message, UserProfile } from '@/lib/types';

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
  const prevConversationIdRef = useRef(conversation.id);

  // Reset messages when conversation changes (not on every render)
  useEffect(() => {
    if (prevConversationIdRef.current !== conversation.id) {
      prevConversationIdRef.current = conversation.id;
      setMessages(initialMessages);
      messagesRef.current = initialMessages;
    }
  }, [conversation.id, initialMessages]);

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
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onMessageDeleted = (event: { payload: unknown }) => {
      const payload = event.payload as { messageId: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId ? { ...m, deletedAt: new Date().toISOString() } : m,
        ),
      );
    };

    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_CREATED, onMessageCreated);
    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    realtimeClient.subscribe(REALTIME_EVENTS.MESSAGE_DELETED, onMessageDeleted);

    // Send subscribe event to the server
    realtimeClient.send({
      type: 'subscribe',
      payload: { conversationId: conversation.id },
    });

    return () => {
      realtimeClient.send({
        type: 'unsubscribe',
        payload: { conversationId: conversation.id },
      });
    };
  }, [conversation.id]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader conversation={conversation} currentUser={currentUser} otherUser={otherUser} />
      <MessageList messages={messages} currentUser={currentUser} />
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
