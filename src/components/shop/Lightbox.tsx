import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GALLERY } from '../../data/content';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { useUI } from '../../store/ui';

export function Lightbox() {
  const { overlay, close, open } = useUI();
  const index = overlay?.kind === 'lightbox' ? overlay.index : null;
  const [dir, setDir] = useState(1);

  const go = (d: 1 | -1) => {
    if (index === null) return;
    setDir(d);
    open({ kind: 'lightbox', index: (index + d + GALLERY.length) % GALLERY.length });
  };

  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

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

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-cocoa/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={item.caption}
          onClick={close}
        >
          <button type="button" onClick={close} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Close" autoFocus>
            <X className="size-5" />
          </button>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.figure
              key={index}
              custom={dir}
              className="flex max-h-[86dvh] max-w-[92vw] flex-col items-center"
              variants={{ enter: (d: number) => ({ opacity: 0, x: d * 80, scale: 0.95 }), center: { opacity: 1, x: 0, scale: 1 }, exit: (d: number) => ({ opacity: 0, x: d * -80, scale: 0.95 }) }}
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
              <img src={item.src} alt={item.alt} className="max-h-[78dvh] w-auto rounded-[20px] object-contain shadow-lift" draggable={false} />
              <figcaption className="mt-3 font-hand text-2xl text-cream">
                {item.caption} <span className="text-cream/50">· {index! + 1}/{GALLERY.length}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 md:grid" aria-label="Previous photo">
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 md:grid" aria-label="Next photo">
            <ChevronRight className="size-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
