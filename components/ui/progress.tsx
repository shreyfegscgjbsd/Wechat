import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valumin={0}
      aria-valuMax={100}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all duration-200"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </div>
  );
}