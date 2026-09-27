import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GALLERY } from '../../data/content';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { useUI } from '../../store/ui';
import { Photo } from '../ui/Photo';

/** The kitchen photos, one at a time: arrow keys, swipe, Esc; focus returns to the photo you opened. */
export function Lightbox() {
  const { overlay, close, open } = useUI();
  const index = overlay?.kind === 'lightbox' ? overlay.index : null;
  const [dir, setDir] = useState(1);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    lockScroll();
    const t = window.setTimeout(() => closeBtn.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      unlockScroll();
      prev?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  const go = (d: 1 | -1) => {
    if (index === null) return;
    setDir(d);
    open({ kind: 'lightbox', index: (index + d + GALLERY.length) % GALLERY.length });
  };

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const item = index !== null ? GALLERY[index] : null;
  const w = item?.tall ? 3 : 4;
  const h = item?.tall ? 4 : 3;

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-cocoa/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={item.caption} onClick={close}>
          <button ref={closeBtn} type="button" onClick={close} className="absolute right-md top-md z-10 grid size-[44px] place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20" aria-label="Close">
            <X className="size-[18px]" aria-hidden />
          </button>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.figure
              key={index}
              custom={dir}
              className="flex flex-col items-center"
              variants={{ enter: (d: number) => ({ opacity: 0, x: d * 80 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d * -80 }) }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(1);
                else if (info.offset.x > 80) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: `min(92vw, calc(78dvh * ${w} / ${h}))` }}>
                <Photo media={item.image} ratio={`${w} / ${h}`} sizes="92vw" />
              </div>
              <figcaption className="t-label mt-sm text-butter">
                {item.caption} · {index + 1} / {GALLERY.length}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-sm top-1/2 hidden size-[48px] -translate-y-1/2 place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20 md:grid"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-[20px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-sm top-1/2 hidden size-[48px] -translate-y-1/2 place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20 md:grid"
            aria-label="Next photo"
          >
            <ChevronRight className="size-[20px]" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
