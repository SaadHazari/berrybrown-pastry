import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { media } from '../../data/media';
import { ease } from '../../lib/motion';
import { lockScroll, unlockScroll } from '../../lib/scroll';

const SEEN_KEY = 'bb-seen';

function hasSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/** Logo sketch fades up, motto writes in, then the curtain lifts. Short for returning visitors. */
export function Preloader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [short] = useState(hasSeen);

  useEffect(() => {
    lockScroll();
    const ms = reduce ? 300 : short ? 1100 : 2500;
    const t = window.setTimeout(() => setVisible(false), ms);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    return () => window.clearTimeout(t);
  }, [reduce, short]);

  return (
    <AnimatePresence onExitComplete={() => { unlockScroll(); window.dispatchEvent(new Event('bb:ready')); }}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-cream"
          onClick={() => setVisible(false)}
          exit={reduce ? { opacity: 0 } : { y: '-100%', borderBottomLeftRadius: '50% 18%', borderBottomRightRadius: '50% 18%' }}
          transition={{ duration: 0.9, ease: ease.dramatic }}
          aria-label="Loading Berry Brown"
          role="status"
        >
          <motion.img
            src={media.logo.src}
            alt=""
            className="w-[min(58vw,260px)] mix-blend-multiply"
            style={{ clipPath: 'inset(0 0 22% 0)' }}
            initial={{ opacity: 0, y: 24, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: short ? 0.5 : 1, ease: ease.out }}
          />
          <motion.p
            className="mt-2 font-hand text-2xl text-milk md:text-3xl"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: short ? 0.5 : 1.1, delay: short ? 0.2 : 0.8, ease: ease.smooth }}
          >
            “Made with heart, not haste”
          </motion.p>
          <motion.span
            className="absolute bottom-8 text-xs tracking-widest text-milk/50 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Tap to skip
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
