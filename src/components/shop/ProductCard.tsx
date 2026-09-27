import { ladderLine, type Product } from '../../data/products';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Photo } from '../ui/Photo';

/** One of the Six. Image 4:5, name, one line, the price ladder in Jost. The whole card opens the sheet. */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { open, overlay } = useUI();
  return (
    <article className={cn('relative flex h-full flex-col rounded border border-cocoa-15 p-xs transition-colors hover:border-cocoa-70 md:p-sm', className)}>
      <Photo media={product.image} />
      <h3 className="t-heading mt-sm md:mt-md">
        <button
          type="button"
          onClick={() => open({ kind: 'product', id: product.id, back: overlay?.kind === 'menu' ? 'menu' : undefined })}
          className="text-left after:absolute after:inset-0 after:content-['']"
          aria-label={`${product.name}: choose size and flavour`}
        >
          {product.name}
        </button>
      </h3>
      <p className="t-callout mt-2xs hidden text-cocoa-70 md:block">{product.short}</p>
      <p className="t-price-sm md:t-price mt-auto pt-sm text-claret">{ladderLine(product)}</p>
    </article>
  );
}
