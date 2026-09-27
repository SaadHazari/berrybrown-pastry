import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** A photo on a Butter card with a hairline, like a print. Optional Jost caption, tilt and soft shadow. */
export function Frame({ children, caption, tilt = 0, shadow = true, className }: { children: ReactNode; caption?: string; tilt?: number; shadow?: boolean; className?: string }) {
  return (
    <figure className={cn('frame', shadow && 'shadow-frame', className)} style={tilt ? { rotate: `${tilt}deg` } : undefined}>
      {children}
      {caption && <figcaption className="t-label px-2xs pb-2xs pt-xs text-cocoa-70">{caption}</figcaption>}
    </figure>
  );
}
