import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = Tooltip.Provider;
export const TooltipRoot = Tooltip.Root;
export const TooltipTrigger = Tooltip.Trigger;
export const TooltipContent = Tooltip.Content;

export function TooltipComponent({
  children,
  content,
  side = 'top',
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(
          'z-50 overflow-hidden rounded-lg bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border border-border',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=right]:slide-in-from-left-1 data-[side=left]:slide-in-from-right-1',
        )}
      >
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}
