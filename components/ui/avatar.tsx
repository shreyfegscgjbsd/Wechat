import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'idle';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt, size = 'md', className, status }: AvatarProps) {
  const initials = getInitials(alt);
  const colorClass = getAvatarColor(alt);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold text-white overflow-hidden',
        sizes[size],
        colorClass,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100px, 150px"
        />
      ) : (
        initials
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
            status === 'online' && 'bg-green-500',
            status === 'offline' && 'bg-gray-400',
            status === 'idle' && 'bg-yellow-500',
          )}
        />
      )}
    </div>
  );
}
