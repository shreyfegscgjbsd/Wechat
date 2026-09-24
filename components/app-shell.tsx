"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { CustomUserMenu } from "./custom-user-menu";
import { UserSearch } from "./user-search";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Search, MessageSquare, Settings, LogOut, Users, Phone, Video } from "lucide-react";
import { realtimeClient, REALTIME_EVENTS } from "@/lib/realtime";
import type { UserProfile as UserProfileType } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  user: UserProfileType;
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  // Connect to WebSocket when signed in
  useEffect(() => {
    if (!isSignedIn || !user?.id || typeof window === "undefined") return;

    const url = process.env.NEXT_PUBLIC_REALTIME_URL || "ws://localhost:3001";
    realtimeClient.connect(url, user.id);

    return () => {
      realtimeClient.disconnect();
    };
  }, [isSignedIn, user?.id]);

  const navItems = [
    { href: "/dashboard", label: "Chats", icon: MessageSquare },
    { href: "/calls", label: "Calls", icon: Phone },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      <aside className="w-64 border-r border-border flex flex-col bg-card/50">
        <div className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-semibold text-lg">PulseChat</span>
        </div>

        <div className="px-4 pb-2">
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <Avatar src={user.avatarUrl} alt={user.displayName} size="md" status="online" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="px-4 pb-2">
          <UserSearch />
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <CustomUserMenu />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}