import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { CONTACT, PHOTO_NOTE } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { HeartIcon, InstagramIcon, WhatsAppIcon } from '../ui/Icons';
import { Photo } from '../ui/Photo';

const LINE1 = ['Made', 'with', 'heart,'];
const LINE2 = ['not', 'haste.'];
const TILES = [media.kitchen.layers, media.six[0], media.kitchen.crumb, media.six[2], media.kitchen.flowers, media.six[4]];

/** True while the footer is no taller than the window — only then can it sit under the page and be uncovered. */
function useFits(ref: RefObject<HTMLElement | null>) {
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setFits(el.offsetHeight <= window.innerHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [ref]);
  return fits;
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="t-label text-butter-60">{title}</p>
      <div className="mt-sm flex flex-col gap-xs">{children}</div>
    </div>
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const fits = useFits(ref);
  const reduce = useReducedMotion();
  const ig = CONTACT.instagram;

  return (
    <footer ref={ref} className={cn('relative z-0 bg-cocoa pt-2xl text-butter', fits && 'md:sticky md:bottom-0')}>
      <div className="container-x pb-[max(var(--spacing-xl),env(safe-area-inset-bottom))]">
        <h2 className="t-giant">
          <span className="block">
            {LINE1.map((w, i) => (
              <motion.span key={w} className="mr-[0.22em] inline-block" initial={reduce ? false : { y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: '-5%' }} transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.08 }}>
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block italic text-rose">
            {LINE2.map((w, i) => (
              <motion.span key={w} className="mr-[0.22em] inline-block" initial={reduce ? false : { opacity: 0, filter: 'blur(10px)' }} whileInView={{ opacity: 1, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-5%' }} transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease: ease.out }}>
                {w}
              </motion.span>
            ))}
            <motion.span className="inline-block" initial={reduce ? false : { opacity: 0.6 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeOut' }} aria-hidden>
              <HeartIcon className="size-[0.5em] -translate-y-[0.1em]" />
            </motion.span>
          </span>
        </h2>

        <div className="mt-2xl grid gap-2xl lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <div>
            {ig ? (
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="t-label link inline-flex items-center gap-xs text-butter-60 hover:text-butter">
                <InstagramIcon className="size-[16px]" /> @{ig} →
              </a>
            ) : (
              <p className="t-label text-butter-60">From the studio</p>
            )}
            <div className="mt-md grid grid-cols-3 gap-xs sm:grid-cols-6">
              {TILES.map((m, i) =>
                ig ? (
                  <a key={m.src} href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded" aria-label={`Instagram post ${i + 1}`}>
                    <Photo media={m} ratio="1 / 1" zoom sizes="120px" />
                  </a>
                ) : (
                  <div key={m.src} className="overflow-hidden rounded" aria-hidden>
                    <Photo media={m} ratio="1 / 1" zoom sizes="120px" />
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-xl sm:grid-cols-[1.5fr_1fr_1fr]">
            <Column title="Say hello">
              <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="t-callout link inline-flex items-center gap-xs" aria-label={`WhatsApp ${CONTACT.phoneDisplay}`}>
                <WhatsAppIcon className="size-[15px] shrink-0" /> {CONTACT.phoneDisplay}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="t-callout link">
                {CONTACT.email}
              </a>
            </Column>
            <Column title="Find us">
              <span className="t-callout">{CONTACT.location}</span>
              <span className="t-callout">{CONTACT.hours}</span>
            </Column>
            <Column title="For companies">
              <a href="#gift-boxes" className="t-callout link">
                Gift boxes
              </a>
              <a href="#workshops" className="t-callout link">
                Workshops
              </a>
              <a href="#events" className="t-callout link">
                Company events
              </a>
            </Column>
          </div>
        </div>

        <div className="mt-2xl flex flex-col gap-lg border-t border-butter/15 pt-lg md:flex-row md:items-end md:justify-between">
          <div className="space-y-xs">
            <p className="t-caption text-butter-60">
              © {new Date().getFullYear()} · {CONTACT.legal}
            </p>
            <p className="t-caption text-butter-60">{PHOTO_NOTE}</p>
          </div>
          <img src="/brand/berrybrown-logo-on-dark.svg" alt="Berry Brown" width={396} height={329} className="w-[150px] shrink-0" />
        </div>
      </div>
    </footer>
  );
}
