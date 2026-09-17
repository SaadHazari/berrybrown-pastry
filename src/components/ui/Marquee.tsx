import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Marquee({ children, duration = 30, reverse = false, paused = false, className }: { children: ReactNode; duration?: number; reverse?: boolean; paused?: boolean; className?: string }) {
  return (
    <div className={cn('group relative flex overflow-hidden motion-reduce:overflow-x-auto', className)} style={{ ['--marquee-duration' as string]: `${duration}s` }}>
      <div
        className="flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDirection: reverse ? 'reverse' : 'normal', animationPlayState: paused ? 'paused' : undefined }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
