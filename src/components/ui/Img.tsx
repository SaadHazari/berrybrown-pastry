import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Lazy image that fades/unblurs in when loaded, over a warm skeleton. */
export function Img({ className, wrapperClassName, onLoad, loading = 'lazy', ...rest }: ImgHTMLAttributes<HTMLImageElement> & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={cn('block overflow-hidden bg-oat', wrapperClassName)}>
      <img
        loading={loading}
        decoding="async"
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        ref={(el) => {
          if (el?.complete && el.naturalWidth) setLoaded(true);
        }}
        className={cn('h-full w-full object-cover transition-[opacity,filter,transform] duration-700 ease-out', loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md', className)}
        {...rest}
      />
    </span>
  );
}
