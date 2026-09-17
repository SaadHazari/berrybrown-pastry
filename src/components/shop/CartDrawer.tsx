import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Trash2, Truck } from 'lucide-react';
import { media } from '../../data/media';
import { aed } from '../../lib/format';
import { resolveLine } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { AnimatedAED } from '../ui/AnimatedNumber';
import { Button } from '../ui/Button';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';

export const FREE_DELIVERY_FROM = 500;

export function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const pct = Math.min(1, subtotal / FREE_DELIVERY_FROM);
  const left = FREE_DELIVERY_FROM - subtotal;
  return (
    <div className="rounded-2xl bg-paper p-4 ring-1 ring-cocoa/5">
      <p className="flex items-center gap-2 text-sm">
        <motion.span animate={pct >= 1 ? { x: [0, 6, 0] } : undefined} transition={{ repeat: pct >= 1 ? 2 : 0, duration: 0.5 }}>
          <Truck className="size-4 text-berry" />
        </motion.span>
        {pct >= 1 ? (
          <span>
            <strong>Free delivery</strong> unlocked in most areas 🎉
          </span>
        ) : (
          <span>
            Add <strong>{aed(left)}</strong> for free delivery
          </span>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-oat">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-berry to-[#c9546f]"
          initial={false}
          animate={{ width: `${Math.max(4, pct * 100)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { overlay, close, open } = useUI();
  const { lines, count, subtotal, setQty, remove } = useCart();

  return (
    <Sheet
      open={overlay?.kind === 'cart'}
      onClose={close}
      title={`Your bag${count ? ` (${count})` : ''}`}
      footer={
        lines.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-milk">Subtotal</span>
              <AnimatedAED value={subtotal} className="font-display text-2xl" />
            </div>
            <p className="mt-0.5 text-xs text-milk">Delivery and date are chosen at checkout</p>
            <Button size="lg" className="mt-4 w-full" onClick={() => open({ kind: 'checkout' })}>
              Checkout <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )
      }
    >
      <div className="px-5 pb-6 md:px-6">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <motion.img
              src={media.logo.src}
              alt=""
              className="w-44 mix-blend-multiply"
              style={{ clipPath: 'inset(0 0 40% 0)' }}
              animate={{ rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />
            <p className="-mt-12 font-display text-2xl">Your bag is empty</p>
            <p className="mt-1 font-hand text-xl text-milk">but the oven is warm…</p>
            <Button className="mt-6" onClick={() => open({ kind: 'menu' })}>
              Browse cakes
            </Button>
          </div>
        ) : (
          <>
            <FreeDeliveryMeter subtotal={subtotal} />
            <ul className="mt-4 divide-y divide-cocoa/10">
              <AnimatePresence initial={false}>
                {lines.map((l) => {
                  const { product, size, flavour } = resolveLine(l);
                  return (
                    <motion.li
                      key={l.key}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, x: 60 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-4 py-4">
                        <button type="button" onClick={() => open({ kind: 'product', id: product.id })} className="shrink-0" aria-label={`View ${product.name}`}>
                          <img src={product.image} alt="" className="size-20 rounded-2xl object-cover" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-display text-lg leading-tight">{product.name}</p>
                            <button type="button" onClick={() => remove(l.key)} className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-milk hover:bg-blush hover:text-berry" aria-label={`Remove ${product.name}`}>
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-milk">
                            {size.label} · {flavour.name}
                          </p>
                          {l.message && <p className="mt-0.5 font-hand text-lg leading-tight text-berry">“{l.message}”</p>}
                          <div className="mt-2 flex items-center justify-between">
                            <QtyStepper size="sm" min={0} value={l.qty} onChange={(q) => setQty(l.key, q)} label={`Quantity of ${product.name}`} />
                            <AnimatedAED value={size.price * l.qty} className="font-semibold" />
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
            <button type="button" onClick={() => open({ kind: 'menu' })} className="mt-2 text-sm font-medium text-berry underline-offset-4 hover:underline">
              + Add another treat
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
