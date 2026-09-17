import { motion } from 'motion/react';
import { Clock, Mail, MapPin } from 'lucide-react';
import { CONTACT } from '../../data/content';
import { media } from '../../data/media';
import { ease } from '../../lib/motion';
import { whatsappLink } from '../../lib/order';
import { Heart } from '../ui/Squiggle';
import { WhatsAppIcon } from './WhatsAppFab';

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const IG_TILES = [media.gallery.berrySlice, media.products.chocolateDrip, media.gallery.coffee, media.products.mangoTart, media.gallery.pistachioSlice, media.gallery.rusticCake];

const LINE = ['Made', 'with', 'heart,'];
const LINE2 = ['not', 'haste.'];

/** Sits under the main content and is uncovered as the page scrolls away. */
export function Footer() {
  return (
    <footer className="relative z-0 md:sticky md:bottom-0 -mt-16 bg-cocoa pt-28 text-cream md:-mt-20 md:pt-36">
      <div className="container-x pb-[max(32px,env(safe-area-inset-bottom))]">
        <h2 className="font-display text-[clamp(3rem,11vw,9.5rem)] font-light leading-[0.9]">
          <span className="block">
            {LINE.map((w, i) => (
              <motion.span
                key={w}
                className="mr-[0.22em] inline-block"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.08 }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block italic text-blush">
            {LINE2.map((w, i) => (
              <motion.span
                key={w}
                className="mr-[0.22em] inline-block"
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease: ease.out }}
              >
                {w}
              </motion.span>
            ))}
            <Heart className="inline-block size-[0.5em] -translate-y-[0.1em] text-berry motion-safe:animate-pulse" />
          </span>
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-[1.2fr_1fr]">
          <div>
            <a href={`https://instagram.com/${CONTACT.instagram}`} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm text-cream/70 hover:text-cream">
              <Instagram className="size-4" /> @{CONTACT.instagram}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {IG_TILES.map((m, i) => (
                <a
                  key={m.src}
                  href={`https://instagram.com/${CONTACT.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                  aria-label={`Instagram post ${i + 1}`}
                >
                  <img src={m.src} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                  <span className="absolute inset-0 grid place-items-center bg-berry/0 opacity-0 transition group-hover:bg-berry/50 group-hover:opacity-100">
                    <Heart className="size-6 text-cream" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <p className="eyebrow text-cream/45">Say hello</p>
              <a href={whatsappLink('Hi Safa! 🍰')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blush">
                <WhatsAppIcon className="size-4" /> {CONTACT.phoneDisplay}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-blush">
                <Mail className="size-4" /> {CONTACT.email}
              </a>
            </div>
            <div className="space-y-3">
              <p className="eyebrow text-cream/45">Find us</p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> {CONTACT.location}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4" /> {CONTACT.hours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} <span translate="no">Berry Brown</span> · Baked with love in Dubai
          </p>
          <p className="flex items-center gap-2">
            <img src={media.logoMark.src} alt="" className="size-8 rounded-full object-cover" />
            <span className="font-hand text-lg text-cream/60">Safa x</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
