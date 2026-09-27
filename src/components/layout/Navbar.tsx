import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

export const NAV_LINKS = [
  { href: '#the-six', label: 'The Six' },
  { href: '#custom', label: 'Custom' },
  { href: '#companies', label: 'Companies' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const { count } = useCart();
  const { open } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);

  const goFromMenu = (href: string) => {
    setMenuOpen(false);
    // Let the sheet release the scroll lock first, then jump (native, respects scroll-padding).
    window.setTimeout(() => {
      window.location.hash = href;
    }, 80);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cocoa-15 bg-butter/92 backdrop-blur-[8px]">
        <nav aria-label="Main" className="container-x flex h-[56px] items-center gap-md lg:h-[64px]">
          <a href="#top" className="flex shrink-0 items-center" aria-label="Berry Brown, back to top">
            <img src="/brand/berrybrown-logo-horizontal.svg" alt="" width={437} height={137} className="h-[24px] w-auto lg:h-[28px]" />
          </a>

          <ul className="mx-auto hidden items-center gap-lg lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="t-label link block py-xs">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-sm lg:ml-0">
            {count > 0 && (
              <button
                type="button"
                onClick={() => open({ kind: 'cart' })}
                className="flex h-[44px] items-center gap-2xs rounded px-xs transition-colors hover:bg-cocoa/6"
                aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
              >
                <ShoppingBag className="size-[18px]" strokeWidth={1.6} aria-hidden />
                <span className="t-price">{count}</span>
              </button>
            )}
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
        <nav aria-label="Site" className="px-md py-lg md:px-lg">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="border-b border-cocoa-15">
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goFromMenu(l.href);
                  }}
                  className="t-title3 link block py-md"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="cocoa"
            className="mt-xl w-full"
            onClick={() => {
              setMenuOpen(false);
              open({ kind: 'menu' });
            }}
          >
            Order
          </Button>
        </nav>
      </Sheet>
    </>
  );
}
