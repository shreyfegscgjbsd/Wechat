'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { formatDuration } from '@/lib/utils';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  durationMs: number;
}

export function VoiceMessagePlayer({ durationMs }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
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
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={togglePlay}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 flex flex-col gap-1">
        <Progress value={0} className="h-1" />
        <span className="text-[10px] text-muted-foreground">
          {formatDuration(0)} / {formatDuration(durationMs)}
        </span>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
