import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { useIsDesktop, usePresence } from '../../lib/hooks';
import { lockScroll, unlockScroll } from '../../lib/scroll';

type Variant = 'side' | 'center' | 'full';

type Props = {
  open: boolean;
  onClose(): void;
  title: string;
  /** Visually hide the title (still announced). */
  hideTitle?: boolean;
  variant?: Variant;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  width?: string;
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible overlay: focus trap, Esc closes, focus returns, page goes inert.
 * `side` = right drawer on desktop, bottom sheet on mobile. The only element on the site with a shadow.
 */
export function Sheet({ open, onClose, title, hideTitle, variant = 'side', children, footer, className, width = 'md:w-[460px]' }: Props) {
  const isDesktop = useIsDesktop();
  const { mounted, shown } = usePresence(open, 320);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bottom = variant === 'side' && !isDesktop;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current;
      el?.focus({ preventScroll: true });
    }, 80);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!mounted) return null;

  const enter = variant === 'center' ? 'sheet-from-center' : variant === 'full' || bottom ? 'sheet-from-bottom' : 'sheet-from-right';
  const position =
    variant === 'center'
      ? 'relative m-auto max-h-[90dvh] w-[calc(100%-2*var(--spacing-md))] max-w-[32rem] rounded'
      : variant === 'full'
        ? 'absolute inset-0 md:inset-lg md:rounded'
        : bottom
          ? 'absolute inset-x-0 bottom-0 max-h-[92dvh] rounded-t'
          : cn('absolute inset-y-0 right-0 w-full', width);

  return createPortal(
    <div className={cn('fixed inset-0 z-[70] flex', variant === 'center' && 'items-center justify-center')}>
      <div className={cn('absolute inset-0 bg-cocoa/45 transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('sheet flex flex-col overflow-hidden bg-butter shadow-sheet outline-none', enter, shown && 'sheet-shown', position, className)}
      >
        <header className="flex shrink-0 items-center justify-between gap-md border-b border-cocoa-15 px-md py-sm md:px-lg">
          <h2 id={titleId} className={cn('t-title3', hideTitle && 'sr-only')}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className="ml-auto grid size-[44px] shrink-0 place-items-center rounded border border-cocoa-15 text-cocoa transition-colors hover:bg-cocoa/6" aria-label="Close">
            <X className="size-[18px]" strokeWidth={1.75} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-sheet-scroll>
          {children}
        </div>
        {footer && <div className="shrink-0 border-t border-cocoa-15 bg-butter px-md pt-md pb-safe md:px-lg">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
