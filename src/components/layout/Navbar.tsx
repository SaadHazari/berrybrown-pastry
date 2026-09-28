import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../../data/content';
import { cn } from '../../lib/cn';
import { useScrollSpy, useTopBar } from '../../lib/hooks';
import { useIntroPhase } from '../../lib/intro';
import { ease, spring } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';
import { Sheet } from '../ui/Sheet';
import { Sprig } from '../ui/Sprig';

type NavId = 'the-six' | 'custom' | 'companies' | 'studio' | 'faq';

const LINKS: { id: NavId; label: string; href: string }[] = [
  { id: 'the-six', label: 'The Six', href: '#the-six' },
  { id: 'custom', label: 'Custom cakes', href: '#custom' },
  { id: 'companies', label: 'For companies', href: '#gift-boxes' },
  { id: 'studio', label: 'Our studio', href: '#studio' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export const COMPANY_LINKS = [
  { href: '#gift-boxes', label: 'Gift boxes', price: 'From AED 65 a box', icon: '/brand/berrybrown-circle-cocoa.svg' },
  { href: '#workshops', label: 'Workshops', price: 'From AED 150 a seat', icon: '/brand/berrybrown-circle-rose.svg' },
  { href: '#events', label: 'Company events', price: 'From AED 35 a guest', icon: '/brand/berrybrown-circle-claret.svg' },
];

const MOBILE_LINKS = [
  { href: '#the-six', label: 'The Six' },
  { href: '#custom', label: 'Custom cakes' },
  { href: '#gift-boxes', label: 'Gift boxes' },
  { href: '#workshops', label: 'Workshops' },
  { href: '#events', label: 'Company events' },
  { href: '#studio', label: 'Our studio' },
  { href: '#faq', label: 'FAQ' },
];

/** Every section, so the dot clears when a section without a link (hero, how it works, reviews…) is in view. */
const SPY = ['top', 'the-six', 'custom', 'how', 'gift-boxes', 'workshops', 'events', 'studio', 'kitchen', 'reviews', 'faq', 'log'];

function navFor(section: string | null): NavId | null {
  if (section === 'the-six' || section === 'custom' || section === 'studio' || section === 'faq') return section;
  if (section === 'gift-boxes' || section === 'workshops' || section === 'events') return 'companies';
  return null;
}

/** The one Claret thing in the bar: a dot under the section in view. It slides between links. */
function ActiveDot() {
  return <motion.span layoutId="nav-dot" className="absolute -bottom-2xs left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-claret" transition={spring.soft} aria-hidden />;
}

function BagButton({ count, onClick, className }: { count: number; onClick(): void; className?: string }) {
  const [bump, setBump] = useState(0);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) setBump((b) => b + 1);
    prev.current = count;
  }, [count]);
  return (
    <button type="button" onClick={onClick} className={cn('flex h-[44px] items-center rounded px-xs transition-colors hover:bg-cocoa/6', className)} aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
      <motion.span key={bump} initial={{ scale: bump ? 1.3 : 1 }} animate={{ scale: 1 }} transition={spring.snappy} className="flex items-center gap-2xs">
        <ShoppingBag className="size-[18px]" strokeWidth={1.6} aria-hidden />
        <span className="t-price">{count}</span>
      </motion.span>
    </button>
  );
}

function CompaniesMenu({ active, open, setOpen }: { active: boolean; open: boolean; setOpen(v: boolean): void }) {
  const wrap = useRef<HTMLLIElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);
  return (
    <li ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="nav-companies"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault();
          setOpen(true);
          window.setTimeout(() => first.current?.focus(), 30);
        }}
        className="t-label relative flex items-center gap-2xs py-xs"
      >
        For companies
        <ChevronDown className={cn('size-[12px] transition-transform duration-300', open && 'rotate-180')} strokeWidth={1.75} aria-hidden />
        {active && <ActiveDot />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-companies"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ease.out }}
            className="absolute left-1/2 top-full mt-md w-[360px] -translate-x-1/2 rounded border border-cocoa-15 bg-butter p-xs shadow-sheet"
          >
            <ul>
              {COMPANY_LINKS.map((l, i) => (
                <li key={l.href}>
                  <a ref={i === 0 ? first : undefined} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-md rounded p-sm transition-colors hover:bg-cocoa/6">
                    <img src={l.icon} alt="" width={200} height={200} className="size-[40px]" />
                    <span>
                      <span className="t-heading block">{l.label}</span>
                      <span className="t-price-sm text-cocoa-70">{l.price}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Navbar() {
  const { count } = useCart();
  const { open, overlay } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { condensed, hidden } = useTopBar(menuOpen || dropOpen || overlay !== null);
  const active = navFor(useScrollSpy(SPY));
  const intro = useIntroPhase();
  const introLogo = intro === 'hold' || intro === 'fly';

  const goFromMenu = (href: string) => {
    setMenuOpen(false);
    // Let the sheet release the scroll lock first, then jump natively (scroll-padding keeps the heading clear).
    window.setTimeout(() => {
      window.location.hash = href;
    }, 80);
  };

  return (
    <>
      <header className={cn('sticky top-0 z-50 border-b border-cocoa-15 bg-butter/92 backdrop-blur-[8px] transition-transform duration-500 ease-out', hidden && '-translate-y-full')}>
        <nav aria-label="Main" className={cn('container-x flex items-center gap-md transition-[height] duration-300', condensed ? 'h-[60px]' : 'h-[64px] lg:h-[76px]')}>
          <a href="#top" className="flex shrink-0 items-center" aria-label="Berry Brown, back to top">
            {/* Hidden while the hero's intro logo glides here; it shows the moment that logo lands on it. */}
            <img id="bar-logo" src="/brand/berrybrown-logo-horizontal.svg" alt="" width={437} height={137} className={cn('w-auto transition-[height] duration-300', condensed ? 'h-[42px]' : 'h-[44px] lg:h-[56px]', introLogo && 'opacity-0')} />
          </a>

          <ul className="mx-auto hidden items-center gap-lg lg:flex">
            {LINKS.map((l) =>
              l.id === 'companies' ? (
                <CompaniesMenu key={l.id} active={active === 'companies'} open={dropOpen} setOpen={setDropOpen} />
              ) : (
                <li key={l.id}>
                  <a href={l.href} className="t-label link relative block py-xs" aria-current={active === l.id ? 'location' : undefined}>
                    {l.label}
                    {active === l.id && <ActiveDot />}
                  </a>
                </li>
              ),
            )}
          </ul>

          <div className="ml-auto flex items-center gap-xs lg:ml-0">
            <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hidden size-[44px] place-items-center rounded text-cocoa transition-colors hover:bg-cocoa/6 lg:grid" aria-label={`WhatsApp us, ${CONTACT.phoneDisplay}`}>
              <WhatsAppIcon className="size-[18px]" />
            </a>
            <BagButton count={count} onClick={() => open({ kind: 'cart' })} className={count === 0 ? 'hidden lg:flex' : undefined} />
            <Button variant="cocoa" onClick={() => open({ kind: 'menu' })} className="min-h-[40px]! px-md!">
              Order
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-[44px] flex-col items-center justify-center gap-xs rounded transition-colors hover:bg-cocoa/6 lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span className="block h-px w-[20px] bg-cocoa" />
              <span className="block h-px w-[20px] bg-cocoa" />
            </button>
          </div>
        </nav>
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" hideTitle variant="full">
        <nav aria-label="Site" className="flex min-h-full flex-col px-md py-lg md:px-lg">
          <ol>
            {MOBILE_LINKS.map((l, i) => (
              <motion.li key={l.href} className="border-b border-cocoa-15" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: ease.out }}>
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goFromMenu(l.href);
                  }}
                  className="flex items-baseline justify-between gap-md py-md"
                >
                  <span className="t-title2">{l.label}</span>
                  <span className="t-price text-cocoa-70">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </motion.li>
            ))}
          </ol>
          <div className="mt-xl space-y-xs">
            <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="t-body link block">
              WhatsApp {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="t-body link block">
              {CONTACT.email}
            </a>
          </div>
          <Button
            variant="cocoa"
            className="mt-xl w-full"
            onClick={() => {
              setMenuOpen(false);
              open({ kind: 'menu' });
            }}
          >
            Order a cake
          </Button>
          <Sprig className="mx-auto mt-auto w-[64px] pt-xl text-cocoa-15" />
        </nav>
      </Sheet>
    </>
  );
}
