import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CONTACT } from '../../data/content';
import { cn } from '../../lib/cn';
import { useIsWide } from '../../lib/hooks';
import { spring } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { WhatsAppIcon } from '../ui/Icons';

/** Cocoa WhatsApp button. Shows once the hero has gone; hides over the footer, over the custom form on small screens and under overlays. */
export function WhatsAppFab() {
  const { overlay } = useUI();
  const { count } = useCart();
  const wide = useIsWide();
  const [pastHero, setPastHero] = useState(false);
  const [overForm, setOverForm] = useState(false);
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setPastHero(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target.id === 'top') setPastHero(!e.isIntersecting);
        if (e.target.id === 'custom') setOverForm(e.isIntersecting);
      }
    });
    ['top', 'custom'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // The footer has its own WhatsApp link, so the button steps aside once the page's lace edge (the end of <main>)
  // is on screen. A scroll listener, not an observer: the footer sits pinned behind the page, and jumps skip thin targets.
  useEffect(() => {
    const end = document.getElementById('page-end');
    if (!end) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setOverFooter(end.getBoundingClientRect().top < window.innerHeight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const visible = pastHero && !overFooter && overlay === null && (wide || !overForm);
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappLink(GENERAL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with our team on WhatsApp, ${CONTACT.phoneDisplay}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={spring.snappy}
          className={cn(
            'group fixed right-md z-40 grid size-[56px] place-items-center rounded-full bg-cocoa text-butter shadow-frame md:bottom-lg md:right-lg',
            count > 0 ? 'bottom-[calc(80px+env(safe-area-inset-bottom))]' : 'bottom-[max(var(--spacing-md),env(safe-area-inset-bottom))]',
          )}
        >
          <WhatsAppIcon className="size-[26px]" />
          <span className="t-label pointer-events-none absolute right-full mr-sm hidden translate-x-2 whitespace-nowrap rounded bg-cocoa px-sm py-xs text-butter opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
            Chat with our team
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
