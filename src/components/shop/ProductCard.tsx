import { Plus } from 'lucide-react';
import { defaultSize, ladderLine, type Product } from '../../data/products';
import { aed } from '../../lib/format';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Photo } from '../ui/Photo';

/** One of the Six: photo, name, one line, the price ladder. The photo opens the sheet; "+" adds the 6" straight to the bag. */
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { open, notify, overlay } = useUI();
  const size = defaultSize(product);

  const quickAdd = () => {
    add({ productId: product.id, sizeId: size.id, flavourId: product.flavours[0].id, qty: 1 });
    notify(`${product.name} added`);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => open({ kind: 'product', id: product.id, back: overlay?.kind === 'menu' ? 'menu' : undefined })}
          className="relative block w-full overflow-hidden rounded text-left"
          aria-label={`${product.name}: choose size and flavour`}
        >
          <Photo media={product.image} zoom sizes="(min-width: 1024px) 360px, (min-width: 640px) 44vw, 78vw" />
          {index !== undefined && (
            <span className="t-label absolute left-sm top-sm rounded bg-butter/90 px-xs py-2xs text-cocoa">
              {index + 1} of 6
            </span>
          )}
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
      <p className="t-price mt-sm">{ladderLine(product)}</p>
    </article>
  );
}
