'use client';

import * as React from 'react';
import { useState } from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Settings, LogOut, Mail, Phone, Globe, ChevronUp, ChevronDown } from 'lucide-react';

export function CustomUserMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const phone = user.phoneNumbers[0]?.phoneNumber ?? '';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-colors"
      >
        <Avatar src={user.imageUrl ?? null} alt={user.fullName ?? 'User'} size="md" />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium truncate">{user.fullName ?? 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">@{user.username ?? 'user'}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute right-0 bottom-full mb-2 w-72 rounded-xl border border-border bg-card shadow-lg py-2 z-50',
              'animate-in fade-in-0 zoom-in-95',
            )}
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar src={user.imageUrl ?? null} alt={user.fullName ?? 'User'} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.fullName ?? 'User'}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username ?? 'user'}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </div>

            <Separator />

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{email || 'No email'}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {user.externalAccounts.length > 0 ? user.externalAccounts[0].provider : 'Email'}
                </span>
              </div>
            </div>

            <Separator />

            <div className="p-2">
              <SignOutButton>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SimpleUserButton() {
  const { user } = useUser();
  if (!user) return null;

  return <Avatar src={user.imageUrl ?? null} alt={user.fullName ?? 'User'} size="md" />;
}
