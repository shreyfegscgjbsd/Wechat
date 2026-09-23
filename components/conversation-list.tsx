"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatTime, getRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <MessageSquareIcon />
        </div>
        <p className="text-sm text-muted-foreground mb-1">No conversations yet</p>
        <p className="text-xs text-muted-foreground">
          Search for a friend to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const otherMember = conv.members.find((m) => m.userId !== currentUserId);
        const isActive = pathname === `/dashboard/${conv.id}`;
        const lastMsg = conv.lastMessage;

        return (
          <Link key={conv.id} href={`/dashboard/${conv.id}`}>
            <div
              className={cn(
                "flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer",
                isActive && "bg-accent/50"
              )}
            >
              <Avatar
                src={otherMember?.user.avatarUrl ?? null}
                alt={otherMember?.user.displayName ?? "Unknown"}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {otherMember?.user.displayName ?? "Unknown"}
                  </p>
                  {lastMsg && (
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatTime(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMsg ? (
                      lastMsg.deletedAt ? (
                        <span className="italic">Message deleted</span>
                      ) : (
                        lastMsg.body ?? "Voice message"
                      )
                    ) : (
                      "No messages yet"
                    )}
                  </p>
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    0
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}