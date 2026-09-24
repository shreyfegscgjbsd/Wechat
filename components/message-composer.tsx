"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { TooltipComponent } from "./ui/tooltip";
import { toast } from "sonner";
import {
  Send,
  Mic,
  Smile,
  Image,
  X,
  Reply,
  Loader2,
} from "lucide-react";
import type {
    Message,
    UserProfile,
    UploadUrlResponse,
    CompleteUploadRequest,
  } from "@/lib/types";

interface MessageComposerProps {
  conversationId: string;
  currentUser: UserProfile;
  onMessageSent?: (message: Message) => void;
}

export function MessageComposer({
  conversationId,
  currentUser,
  onMessageSent,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    body: string | null;
    sender: { displayName: string };
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingVoiceBlobRef = useRef<Blob | null>(null);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const bodyText = trimmed;
    setText("");

    // Optimistic: show message immediately
    const optimisticMsg: Message = {
      id: "optimistic-" + Date.now(),
      conversationId,
      senderId: currentUser.id,
      type: "TEXT",
      body: bodyText,
      replyToMessageId: replyingTo?.id ?? null,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: currentUser,
      replyTo: null,
      reactions: [],
      voice: null,
    };

    onMessageSent?.(optimisticMsg);

    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            body: bodyText,
            replyToMessageId: replyingTo?.id,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to send message");
      }

      const newMsg = await res.json();
      onMessageSent?.(newMsg);
      setReplyingTo(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
      setText(bodyText); // restore on error
    } finally {
      setSending(false);
    }
  }, [text, conversationId, replyingTo, sending, currentUser, onMessageSent]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        pendingVoiceBlobRef.current = blob;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      const start = Date.now();
      const interval = setInterval(() => {
        setRecordingDuration(Date.now() - start);
        if (Date.now() - start > 5 * 60 * 1000) {
          clearInterval(interval);
          handleStopRecording();
        }
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const handleStopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
    setRecordingDuration(0);

    // Wait a tick for onstop to populate pendingVoiceBlobRef
    await new Promise((r) => setTimeout(r, 50));
    const blob = pendingVoiceBlobRef.current;
    pendingVoiceBlobRef.current = null;
    if (!blob) return;

    try {
      setSending(true);
      // Get upload URL
      const uploadRes = await fetch("/api/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `voice-${Date.now()}.webm`,
          contentType: "audio/webm",
          size: blob.size,
        }),
      });
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, mediaId, storageKey, headers } =
        (await uploadRes.json()) as UploadUrlResponse;

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: headers ?? { "Content-Type": "audio/webm" },
      });

      // Complete upload (extract duration + waveform)
      const completeRes = await fetch("/api/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, durationMs: blob.size > 0 ? Math.round(blob.size / 16000) * 1000 : 0 } as CompleteUploadRequest),
      });
      if (!completeRes.ok) throw new Error("Failed to complete upload");

      // Send voice message
      const msgRes = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            body: null,
            type: "VOICE",
            mediaId,
          }),
        }
      );
      if (!msgRes.ok) {
        const err = await msgRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to send voice message");
      }
      const newMsg = await msgRes.json();
      onMessageSent?.(newMsg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send voice message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-border p-3 bg-card/50 backdrop-blur">
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 px-2 text-sm">
          <Reply className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Replying to{" "}
            <span className="font-medium">
              {replyingTo.sender.displayName}
            </span>
          </span>
          {replyingTo.body && (
            <span className="text-muted-foreground truncate">
              {replyingTo.body}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={() => setReplyingTo(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-3 px-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Recording... {Math.floor(recordingDuration / 1000)}s
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsRecording(false);
              setRecordingDuration(0);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="ml-auto"
            onClick={handleStopRecording}
          >
            Send
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <TooltipComponent content="Attach" side="top">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Image className="h-4 w-4" />
            </Button>
          </TooltipComponent>

          <div className="flex-1 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="pr-20 resize-none"
              disabled={sending}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <TooltipComponent content="Emoji" side="top">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipComponent>
              <TooltipComponent content="Voice message" side="top">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseDown={handleStartRecording}
                  onMouseUp={handleStopRecording}
                  onMouseLeave={handleStopRecording}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipComponent>
            </div>
          </div>

          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}