import { Plus, Users } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { sizeFor, type Product } from '../../data/products';
import { aed } from '../../lib/format';
import { spring } from '../../lib/motion';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Chip } from '../ui/Chip';
import { Photo } from '../ui/Photo';

/**
 * One of the Six: photo, name, one line, and the three sizes with how many each serves. No size is chosen at first;
 * picking one shows a "Serves" tag on the photo. "+" adds the chosen size (or the 6"), and the photo opens the sheet on it.
 */
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { open, notify, overlay } = useUI();
  const reduce = useReducedMotion();
  const [chosen, setChosen] = useState<string | null>(null);
  const size = sizeFor(product, chosen);

  const quickAdd = () => {
    add({ productId: product.id, sizeId: size.id, flavourId: product.flavours[0].id, qty: 1 });
    setChosen(size.id);
    notify(`${product.name} added`);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => open({ kind: 'product', id: product.id, size: chosen ?? undefined, back: overlay?.kind === 'menu' ? 'menu' : undefined })}
          className="relative block w-full overflow-hidden rounded text-left"
          aria-label={`${product.name}: choose size and flavour`}
        >
          <Photo media={product.image} zoom sizes="(min-width: 1024px) 360px, (min-width: 640px) 44vw, 78vw" />
          {index !== undefined && (
            <span className="t-label absolute left-sm top-sm rounded bg-butter/90 px-xs py-2xs text-cocoa">
              {index + 1} of 6
            </span>
          )}
          <AnimatePresence>
            {chosen && (
              <motion.span
                key="serves"
                data-serves
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={spring.snappy}
                className="t-label absolute right-sm top-sm flex items-center gap-2xs rounded bg-butter/90 px-xs py-2xs text-cocoa"
                aria-hidden
              >
                <Users className="size-[12px]" strokeWidth={1.75} aria-hidden />
                Serves {size.serves}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="t-label absolute bottom-sm left-sm hidden translate-y-2 rounded bg-butter px-sm py-xs text-cocoa opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block" aria-hidden>
            Choose size & flavour
          </span>
        </button>
        <button
          type="button"
          onClick={quickAdd}
          className="absolute bottom-sm right-sm grid size-[44px] place-items-center rounded bg-cocoa text-butter transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={`Quick add ${product.name}, ${size.label}, ${aed(size.price)}`}
        >
          <Plus className="size-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <h3 className="t-heading mt-md">{product.name}</h3>
      <p className="t-callout mt-2xs text-cocoa-70">{product.short}</p>
      <div role="radiogroup" aria-label={`Size, ${product.name}`} className="mt-sm grid grid-cols-3 gap-xs">
        {product.sizes.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2xs">
            <Chip selected={chosen === s.id} onSelect={() => setChosen(s.id)} className="w-full whitespace-nowrap px-xs!">
              {s.label} · {s.price}
              <span className="sr-only">, serves {s.serves}</span>
            </Chip>
            <span data-serves-caption className="t-price-sm flex items-center gap-2xs text-cocoa-70" aria-hidden>
              <Users className="size-[12px]" strokeWidth={1.75} />
              {s.serves}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
