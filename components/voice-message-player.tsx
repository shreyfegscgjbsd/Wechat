"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import type { ProgressProps } from "./ui/progress";
import { formatDuration } from "@/lib/utils";
import { Play, Pause, Volume2 } from "lucide-react";
import type { VoiceMessage } from "@/lib/types";

interface VoiceMessagePlayerProps {
  voice: VoiceMessage;
  isOutgoing: boolean;
}

export function VoiceMessagePlayer({
  voice,
  isOutgoing,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked or playback failed
      }
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1 flex flex-col gap-1">
        <Progress value={progress} className="h-1" />
        <span className="text-[10px] text-muted-foreground">
          {formatDuration(progress)} / {formatDuration(duration)}
        </span>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}