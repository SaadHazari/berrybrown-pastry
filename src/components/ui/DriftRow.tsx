import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = { children: ReactNode; duration?: number; reverse?: boolean; paused?: boolean; className?: string };

/**
 * The review rows: the content twice, sliding left forever. Pauses on hover, on keyboard focus and with `paused`.
 * With reduced motion it stops and becomes a normal horizontal scroller without the copy.
 */
export function DriftRow({ children, duration = 60, reverse = false, paused = false, className }: Props) {
  const style = { '--drift-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal', animationPlayState: paused ? 'paused' : undefined } as CSSProperties;
  return (
    <div className={cn('group/drift flex overflow-hidden motion-reduce:no-scrollbar motion-reduce:overflow-x-auto', className)}>
      <div className="flex w-max shrink-0 animate-drift group-hover/drift:[animation-play-state:paused] group-focus-within/drift:[animation-play-state:paused] motion-reduce:animate-none" style={style}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0 motion-reduce:hidden" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
