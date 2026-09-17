import { useReducedMotion } from 'motion/react';
import type { Media } from '../../data/media';

/** Decorative muted loop; shows the still poster when reduced motion is requested. */
export function LoopVideo({ video, poster, className }: { video: Media; poster: Media; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <img src={poster.src} alt="" loading="lazy" className={className} />;
  return <video src={video.src} poster={poster.src} autoPlay muted loop playsInline preload="none" className={className} aria-hidden />;
}
