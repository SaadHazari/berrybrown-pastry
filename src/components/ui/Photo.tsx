import type { Media } from '../../data/media';
import { cn } from '../../lib/cn';
import { Placeholder } from './Placeholder';

/** A photo slot: the Rose placeholder until a real photo lands, then the photo on a Rose mat. */
export function Photo({ media, className, eager = false }: { media: Media; className?: string; eager?: boolean }) {
  if (media.placeholder) return <Placeholder label={media.label} className={className} />;
  return (
    <div className={cn('mat', className)}>
      <img src={media.src} alt={media.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="block w-full rounded object-cover" style={{ aspectRatio: '4 / 5' }} />
    </div>
  );
}
