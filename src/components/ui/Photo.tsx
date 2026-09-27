import type { Media } from '../../data/media';
import { cn } from '../../lib/cn';
import { Placeholder } from './Placeholder';

type Props = {
  media: Media;
  className?: string;
  imgClassName?: string;
  /** CSS aspect-ratio such as "4 / 5". Defaults to the photo's own ratio. */
  ratio?: string;
  sizes?: string;
  eager?: boolean;
  /** Zoom 5% while the pointer is over the photo. */
  zoom?: boolean;
};

/** A photo slot: the image when its file exists, the Rose placeholder until then. */
export function Photo({ media, className, imgClassName, ratio, sizes = '(min-width: 1024px) 33vw, 90vw', eager = false, zoom = false }: Props) {
  const aspect = ratio ?? (media.width && media.height ? `${media.width} / ${media.height}` : '4 / 5');
  if (media.placeholder) return <Placeholder label={media.label} ratio={aspect} className={className} />;
  return (
    <div className={cn('group/photo relative overflow-hidden rounded bg-rose', className)} style={{ aspectRatio: aspect }}>
      <img
        src={media.src}
        srcSet={media.srcSet}
        sizes={media.srcSet ? sizes : undefined}
        width={media.width}
        height={media.height}
        alt={media.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        draggable={false}
        className={cn('absolute inset-0 size-full object-cover', zoom && 'transition-transform duration-700 ease-out group-hover/photo:scale-105', imgClassName)}
      />
    </div>
  );
}
