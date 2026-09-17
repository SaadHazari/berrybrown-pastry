import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease, spring } from '../../lib/motion';
import { scrollToId } from '../../lib/scroll';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';

const LINKS = [
  { id: 'favourites', label: 'Cakes' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'story', label: 'Our story' },
  { id: 'custom', label: 'Custom cakes' },
  { id: 'faq', label: 'FAQ' },
];

export function Navbar() {
  const { count, pulse } = useCart();
  const { open } = useUI();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (menuOpen) return;
    setHidden(y > 480 && y > prev + 4 ? true : y < prev - 4 ? false : hidden);
  });

  // Scroll-spy
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(12px,env(safe-area-inset-top))]"
      animate={{ y: hidden ? -110 : 0 }}
      transition={{ duration: 0.45, ease: ease.out }}
    >
      <motion.nav
        aria-label="Main"
        layout
        transition={spring.sheet}
        className={cn(
          'w-full max-w-5xl overflow-hidden border border-white/40 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-500',
          scrolled || menuOpen ? 'bg-paper/85 shadow-soft' : 'bg-paper/65',
        )}
        style={{ borderRadius: 30 }}
      >
        <div className="flex h-14 items-center gap-2 pl-2 pr-2 md:h-16 md:pl-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go('top');
            }}
            className="group flex items-center gap-2 rounded-full pr-2"
            aria-label="Berry Brown, back to top"
          >
            <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-cocoa/10 md:size-11">
              <img src={media.logo.src} alt="" className="size-[150%] max-w-none object-cover object-[50%_18%] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
            </span>
            <span className="font-display text-[1.35rem] italic leading-none tracking-tight">Berry Brown</span>
          </a>

          <ul className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(l.id);
                  }}
                  className={cn('relative block rounded-full px-4 py-2 text-sm font-medium transition-colors', active === l.id ? 'text-cocoa' : 'text-cocoa/65 hover:text-cocoa')}
                >
                  {active === l.id && <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-oat" transition={spring.soft} />}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <motion.button
              type="button"
              onClick={() => open({ kind: 'menu' })}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden h-11 items-center rounded-full bg-cocoa px-5 text-sm font-medium text-cream transition-colors hover:bg-berry md:flex"
            >
              Order now
            </motion.button>

            <motion.button
              key={pulse}
              type="button"
              data-cart-target
              onClick={() => open({ kind: 'cart' })}
              animate={pulse ? { scale: [1, 1.25, 0.92, 1.05, 1], rotate: [0, -10, 8, 0] } : undefined}
              transition={{ duration: 0.6, ease: ease.out }}
              whileTap={{ scale: 0.9 }}
              className="relative grid size-11 place-items-center rounded-full bg-oat/80 text-cocoa hover:bg-oat"
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="size-5" strokeWidth={1.8} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring.bouncy}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-berry px-1 text-[11px] font-semibold text-cream ring-2 ring-paper"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="relative grid size-11 place-items-center rounded-full hover:bg-oat/70 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="relative block h-3 w-5">
                <motion.span className="absolute left-0 top-0 h-[2px] w-5 rounded bg-cocoa" animate={menuOpen ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} />
                <motion.span className="absolute bottom-0 left-0 h-[2px] w-5 rounded bg-cocoa" animate={menuOpen ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: ease.out }}
              className="lg:hidden"
            >
              <ul className="px-3 pb-2 pt-1">
                {LINKS.map((l, i) => (
                  <motion.li key={l.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                    <a
                      href={`#${l.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(l.id);
                      }}
                      className="flex items-center justify-between rounded-2xl px-3 py-3 font-display text-2xl hover:bg-oat/60"
                    >
                      {l.label}
                      <span className="font-hand text-lg text-milk/60">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    open({ kind: 'menu' });
                  }}
                  className="h-12 w-full rounded-full bg-berry font-medium text-cream"
                >
                  See the full menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}
