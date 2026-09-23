"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Search, UserPlus, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = async (q: string) => {
    setError(null);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        throw new Error("Search failed");
      }
      const data = await res.json();
      setResults(data.users ?? []);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = (q: string) => {
    setQuery(q);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  };

  const handleStartChat = async (target: SearchResult) => {
    setStartingChat(target.id);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: target.username }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (data as { error?: string }).error || "Failed to start chat";
        setError(msg);
        toast.error(msg);
        return;
      }

      setQuery("");
      setResults([]);
      setOpen(false);
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start chat";
      setError(msg);
      toast.error(msg);
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search or start new chat"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setError(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
          {error && (
            <div className="px-3 py-2 bg-destructive/10 border-b border-destructive/20">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          {loading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition-colors"
                >
                  <Avatar src={u.avatarUrl} alt={u.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartChat(u)}
                    disabled={startingChat === u.id}
                    className="shrink-0"
                  >
                    {startingChat === u.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No users found matching &ldquo;{query}&rdquo;
            </div>
          ) : null}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setOpen(false); setResults([]); setQuery(""); setError(null); }}
        />
      )}
    </div>
  );
}