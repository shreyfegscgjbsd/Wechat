'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageBubble } from './message-bubble';
import { formatDateSeparator } from '@/lib/utils';
import type { Message, UserProfile } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  currentUser: UserProfile;
}

export function MessageList({ messages, currentUser }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(messages.length);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      if (isNearBottom || messages.length > prevLength.current) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
    }
    prevLength.current = messages.length;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">No messages yet</p>
          <p className="text-muted-foreground text-xs mt-1">Say hello to start the conversation</p>
        </div>
      </div>
    );
  }

  let lastDate = '';
  const groups: { date: string; messages: Message[] }[] = [];

  for (const msg of messages) {
    const date = formatDateSeparator(msg.createdAt);
    if (date !== lastDate) {
      groups.push({ date, messages: [msg] });
      lastDate = date;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {groups.map((group, gi) => (
        <div key={gi}>
          <div className="sticky top-0 z-10 flex justify-center my-3">
            <span className="bg-card/80 backdrop-blur border border-border text-xs text-muted-foreground px-3 py-1 rounded-full">
              {group.date}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {group.messages.map((msg, mi) => {
              const isOutgoing = msg.senderId === currentUser.id;
              const showSender =
                !isOutgoing && (mi === 0 || group.messages[mi - 1].senderId !== msg.senderId);

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble
                    message={msg}
                    isOutgoing={isOutgoing}
                    showSender={showSender}
                    currentUser={currentUser}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
