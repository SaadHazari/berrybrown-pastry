import { CONTACT } from '../../data/content';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/hooks';
import { whatsappLink } from '../../lib/order';
import { HeartIcon } from '../ui/Icons';

export function Footer() {
  // The heart glow: one 2 s ease from 0.6 to 1.0 when the footer comes into view. No colour change.
  const [heartRef, seen] = useInView<HTMLSpanElement>('0px');
  return (
    <footer className="section-more bg-cocoa text-butter">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <img src="/brand/berrybrown-logo-on-dark.svg" alt="Berry Brown" width={396} height={329} className="w-[180px]" />
          <p className="t-title3 mt-lg inline-flex items-center gap-sm">
            Made with heart, not haste.
            <span ref={heartRef} className={cn('text-rose transition-opacity duration-[2000ms] ease-out', seen ? 'opacity-100' : 'opacity-60')} aria-hidden>
              <HeartIcon className="size-[0.8em]" />
            </span>
          </p>
        </div>

        <div className="mt-2xl grid gap-xl border-t border-butter/15 pt-xl md:grid-cols-3">
          <div>
            <p className="t-label text-butter-60">Order</p>
            <ul className="mt-sm space-y-xs">
              <li>
                <a href={whatsappLink('Hi Safa, I have a question about a cake.')} target="_blank" rel="noopener noreferrer" className="link">
                  WhatsApp {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="link">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
          {CONTACT.instagram && (
            <div>
              <p className="t-label text-butter-60">Follow</p>
              <ul className="mt-sm">
                <li>
                  <a href={`https://instagram.com/${CONTACT.instagram}`} target="_blank" rel="noopener noreferrer" className="link">
                    Instagram @{CONTACT.instagram}
                  </a>
                </li>
              </ul>
            </div>
          )}
          <div>
            <p className="t-label text-butter-60">Studio</p>
            <ul className="mt-sm space-y-xs">
              <li>{CONTACT.location}</li>
              <li>{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        <p className="t-caption mt-xl text-butter-60">{CONTACT.legal}</p>
      </div>
    </footer>
  );
}
