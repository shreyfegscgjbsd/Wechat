"use client";

import * as React from "react";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatTime, formatCallDuration } from "@/lib/utils";
import { Phone, Video, Clock, PhoneMissed } from "lucide-react";
import type { CallSession, UserProfile } from "@/lib/types";

interface CallHistoryProps {
  calls: CallSession[];
  currentUserId: string;
}

export function CallHistory({ calls, currentUserId }: CallHistoryProps) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No call history</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {calls.map((call) => {
        const other = call.conversation?.members.find(
          (m) => m.userId !== currentUserId
        );
        const isInitiator = call.initiatedById === currentUserId;
        const Icon = call.type === "VIDEO" ? Video : Phone;
        const missed = call.status === "MISSED";

        return (
          <div key={call.id} className="flex items-center gap-3 p-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10"
            >
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <Avatar
              src={other?.user.avatarUrl ?? null}
              alt={other?.user.displayName ?? "Unknown"}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {other?.user.displayName ?? "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isInitiator ? "Outgoing" : "Incoming"} •{" "}
                {formatTime(call.createdAt)}
                {call.endedAt &&
                  call.startedAt &&
                  ` • ${formatCallDuration(
                    new Date(call.endedAt).getTime() -
                      new Date(call.startedAt).getTime()
                  )}`}
              </p>
            </div>
            <Badge
              variant={
                missed
                  ? "destructive"
                  : call.status === "ENDED"
                  ? "secondary"
                  : "default"
              }
            >
              {call.status.toLowerCase()}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}