import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { useIsDesktop } from '../../lib/hooks';
import { spring } from '../../lib/motion';
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
 * Accessible overlay. `side` = right drawer on desktop, draggable bottom sheet on mobile.
 */
export function Sheet({ open, onClose, title, hideTitle, variant = 'side', children, footer, className, width = 'md:w-[460px]' }: Props) {
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bottom = variant === 'side' && !isDesktop;
  const drag = useDragControls();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current;
      el?.focus({ preventScroll: true });
    }, 60);

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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : variant === 'center'
      ? { initial: { opacity: 0, scale: 0.94, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 } }
      : variant === 'full'
        ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
        : bottom
          ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
          : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  const position =
    variant === 'center'
      ? 'relative m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-lg rounded-[28px]'
      : variant === 'full'
        ? 'absolute inset-x-0 bottom-0 top-3 rounded-t-[32px] md:top-6 md:inset-x-6 md:rounded-[36px] md:bottom-6'
        : bottom
          ? 'absolute inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[32px]'
          : cn('absolute inset-y-3 right-3 rounded-[32px]', width);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[70] flex', variant === 'center' && 'items-center justify-center')}>
          <motion.div
            className="absolute inset-0 bg-cocoa/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...panelMotion}
            transition={reduce ? { duration: 0.15 } : spring.sheet}
            drag={bottom && !reduce ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragListener={false}
            dragControls={drag}
            onDragEnd={onDragEnd}
            className={cn('flex flex-col overflow-hidden bg-cream shadow-lift outline-none', position, className)}
          >
            {bottom && (
              <div
                className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                onPointerDown={(e) => drag.start(e)}
                aria-hidden
              >
                <span className="h-1.5 w-12 rounded-full bg-cocoa/20" />
              </div>
            )}
            <header className={cn('flex shrink-0 items-center justify-between gap-4 px-6', bottom ? 'pb-2 pt-1' : 'pb-3 pt-6')}>
              <h2 id={titleId} className={cn('font-display text-2xl', hideTitle && 'sr-only')}>
                {title}
              </h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={spring.snappy}
                className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-oat/80 text-cocoa hover:bg-oat"
                aria-label="Close"
              >
                <X className="size-5" />
              </motion.button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
              {children}
            </div>
            {footer && <div className="shrink-0 border-t border-cocoa/10 bg-paper/80 px-6 pt-4 pb-safe backdrop-blur">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
