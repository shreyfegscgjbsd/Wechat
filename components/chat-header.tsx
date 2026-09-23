"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { TooltipComponent } from "./ui/tooltip";
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Users,
} from "lucide-react";
import type { Conversation, UserProfile } from "@/lib/types";

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: UserProfile;
  otherUser: UserProfile | null;
}

export function ChatHeader({
  conversation,
  currentUser,
  otherUser,
}: ChatHeaderProps) {
  return (
    <header className="h-16 border-b border-border flex items-center px-4 gap-3 bg-card/50 backdrop-blur">
      <Avatar
        src={otherUser?.avatarUrl ?? null}
        alt={otherUser?.displayName ?? "Unknown"}
        size="md"
        status="online"
      />
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate">
          {otherUser?.displayName ?? "Unknown"}
        </h2>
        <p className="text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1" />
          Online
        </p>
      </div>

      <div className="flex items-center gap-1">
        <TooltipComponent content="Audio call" side="bottom">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
        </TooltipComponent>
        <TooltipComponent content="Video call" side="bottom">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-4 w-4" />
          </Button>
        </TooltipComponent>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <TooltipComponent content="Search" side="bottom">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        </TooltipComponent>
        <TooltipComponent content="More" side="bottom">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TooltipComponent>
      </div>
    </header>
  );
}