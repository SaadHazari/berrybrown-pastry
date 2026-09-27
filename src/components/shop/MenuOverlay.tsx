import { PRODUCTS } from '../../data/products';
import { useUI } from '../../store/ui';
import { Sheet } from '../ui/Sheet';
import { ProductCard } from './ProductCard';

/** The menu: the Six and nothing else. */
export function MenuOverlay() {
  const { overlay, close } = useUI();
  return (
    <Sheet open={overlay?.kind === 'menu'} onClose={close} title="The Six" variant="full">
      <div className="px-md pb-2xl pt-md md:px-lg">
        <p className="t-oneliner text-cocoa-70">Six signature cakes. Three sizes. Made to order.</p>
        <ul className="mt-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3" role="list">
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
