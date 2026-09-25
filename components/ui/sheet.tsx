import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetPortal = Dialog.Portal;
export const SheetOverlay = Dialog.Overlay;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

export function SheetContent({
  children,
  side = 'right',
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Content> & {
  side?: 'left' | 'right' | 'top' | 'bottom';
}) {
  return (
    <SheetPortal>
      <SheetOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed z-50 flex flex-col bg-background shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-full max-w-sm border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-full max-w-sm border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
          side === 'top' &&
            'inset-x-0 top-0 w-full border-b border-border data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
          side === 'bottom' &&
            'inset-x-0 bottom-0 w-full border-t border-border data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
          className,
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </Dialog.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 p-4 border-b border-border', className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 p-4 border-t border-border', className)}
      {...props}
    />
  );
}
