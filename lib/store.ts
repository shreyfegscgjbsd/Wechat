import { create } from 'zustand';
import type { Message } from './types';

interface MessageState {
  messages: Record<string, Message[]>;
  sending: Record<string, boolean>;

  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;
  setSending: (conversationId: string, sending: boolean) => void;
  getMessages: (conversationId: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  sending: {},

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), message],
      },
    })),

  setMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: msgs },
    })),

  prependMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...msgs, ...(state.messages[conversationId] ?? [])],
      },
    })),

  setSending: (conversationId, sending) =>
    set((state) => ({
      sending: { ...state.sending, [conversationId]: sending },
    })),

  getMessages: (conversationId) => get().messages[conversationId] ?? [],
}));
