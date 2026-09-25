'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { TooltipComponent } from './ui/tooltip';
import { VoiceMessagePlayer } from './voice-message-player';
import { formatTime, cn } from '@/lib/utils';
import { Edit2, Trash2, Reply, Smile, CheckCheck } from 'lucide-react';
import type { Message, UserProfile } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  showSender: boolean;
  currentUser: UserProfile;
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  isOutgoing,
  showSender,
  currentUser,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  if (message.deletedAt) {
    return (
      <div className={cn('flex py-0.5', isOutgoing ? 'justify-end' : 'justify-start')}>
        <div className="text-xs text-muted-foreground italic">
          {isOutgoing ? 'You deleted this message' : 'Message deleted'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex py-0.5 group', isOutgoing ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('flex gap-2 max-w-[75%]', isOutgoing && 'flex-row-reverse')}>
        {!isOutgoing && (
          <div className="mt-auto">
            <Avatar
              src={message.sender.avatarUrl ?? null}
              alt={message.sender.displayName}
              size="sm"
            />
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          {showSender && (
            <span className="text-xs text-muted-foreground px-1">{message.sender.displayName}</span>
          )}

          <div
            className={cn(
              'relative px-3 py-2 rounded-2xl text-sm break-words',
              isOutgoing
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-card border border-border rounded-bl-md',
            )}
          >
            {message.replyTo && (
              <div
                className={cn(
                  'text-xs pb-1 mb-1 border-l-2 pl-2 opacity-70',
                  isOutgoing ? 'border-primary-foreground/50' : 'border-muted-foreground',
                )}
              >
                <span className="font-medium">
                  {message.replyTo.senderId === currentUser.id
                    ? 'You'
                    : message.replyTo.sender.displayName}
                </span>
                {message.replyTo.body && <span className="ml-1">{message.replyTo.body}</span>}
              </div>
            )}

            {message.type === 'VOICE' && message.voice ? (
              <VoiceMessagePlayer durationMs={message.voice.mediaAsset?.durationMs ?? 0} />
            ) : (
              <span className="whitespace-pre-wrap break-words">
                {message.body}
                {message.editedAt && <span className="ml-1 text-xs opacity-60">(edited)</span>}
              </span>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              <span
                className={cn(
                  'text-[10px]',
                  isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground',
                )}
              >
                {formatTime(message.createdAt)}
              </span>
              {isOutgoing && (
                <span className="text-[10px]">
                  <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                </span>
              )}
            </div>
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <div
              className={cn('flex flex-wrap gap-1', isOutgoing ? 'justify-end' : 'justify-start')}
            >
              {message.reactions.map((r) => (
                <button
                  key={r.emoji}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/50 border border-border text-xs hover:bg-accent"
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {/* collapse reactions: show emoji + count per unique emoji */}
                    {r.emoji} {r.count ?? 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity',
            showActions ? 'opacity-100' : '',
          )}
        >
          <div className="flex items-center gap-0.5">
            <TooltipComponent content="Reply" side="top">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Reply className="h-3.5 w-3.5" />
              </Button>
            </TooltipComponent>
            <TooltipComponent content="React" side="top">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </TooltipComponent>
            {isOutgoing && (
              <>
                <TooltipComponent content="Edit" side="top">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipComponent>
                <TooltipComponent content="Delete" side="top">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipComponent>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
