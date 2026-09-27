import { X } from 'lucide-react';
import { aed } from '../../lib/format';
import { resolveLine } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';

export function CartDrawer() {
  const { overlay, close, open, notify } = useUI();
  const { lines, count, subtotal, setQty, remove, add } = useCart();

  const removeWithUndo = (l: (typeof lines)[number], name: string) => {
    remove(l.key);
    notify(`${name} removed`, undefined, { label: 'Undo', run: () => add({ productId: l.productId, sizeId: l.sizeId, flavourId: l.flavourId, qty: l.qty, message: l.message }) });
  };

  return (
    <Sheet
      open={overlay?.kind === 'cart'}
      onClose={close}
      title={`Your bag${count ? ` (${count})` : ''}`}
      footer={
        lines.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="t-label text-cocoa-70">Subtotal</span>
              <span className="t-price">{aed(subtotal)}</span>
            </div>
            <p className="t-caption mt-2xs text-cocoa-70">Delivery and date are chosen at checkout.</p>
            <Button variant="claret" className="mt-md w-full" onClick={() => open({ kind: 'checkout' })}>
              Checkout
            </Button>
          </div>
        )
      }
    >
      <div className="px-md py-md md:px-lg">
        {lines.length === 0 ? (
          <div className="py-xl text-center">
            <p className="t-heading">Your bag is empty.</p>
            <Button variant="cocoa" className="mt-lg" onClick={() => open({ kind: 'menu' })}>
              See the Six
            </Button>
          </div>
        ) : (
          <>
            <ul className="border-t border-cocoa-15" role="list">
              {lines.map((l) => {
                const { product, size, flavour } = resolveLine(l);
                return (
                  <li key={l.key} className="border-b border-cocoa-15 py-md">
                    <div className="flex items-start justify-between gap-md">
                      <div className="min-w-0">
                        <p className="t-heading">{product.name}</p>
                        <p className="t-caption mt-2xs text-cocoa-70">
                          {size.label} · {flavour.name}
                        </p>
                        {l.message && <p className="t-caption mt-2xs text-cocoa-70">“{l.message}”</p>}
                      </div>
                      <button type="button" onClick={() => removeWithUndo(l, product.name)} className="grid size-[36px] shrink-0 place-items-center rounded text-cocoa-70 transition-colors hover:bg-cocoa/6 hover:text-cocoa" aria-label={`Remove ${product.name}`}>
                        <X className="size-[16px]" strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="mt-sm flex items-center justify-between">
                      <QtyStepper min={0} value={l.qty} onChange={(q) => (q === 0 ? removeWithUndo(l, product.name) : setQty(l.key, q))} label={`Quantity of ${product.name}`} />
                      <span className="t-price">{aed(size.price * l.qty)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => open({ kind: 'menu' })} className="t-label link mt-md">
              Add another cake
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
