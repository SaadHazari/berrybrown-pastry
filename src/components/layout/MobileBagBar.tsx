import { aed } from '../../lib/format';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';

/** Bottom bar on phones, only when the bag has items: "3 items · AED 450 · VIEW BAG". */
export function MobileBagBar() {
  const { count, subtotal } = useCart();
  const { overlay, open } = useUI();
  if (count === 0 || overlay) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa-15 bg-butter px-md pt-sm pb-safe md:hidden">
      <button type="button" onClick={() => open({ kind: 'cart' })} className="btn btn-cocoa w-full justify-between">
        <span className="t-price normal-case tracking-normal">
          {count} {count === 1 ? 'item' : 'items'} · {aed(subtotal)}
        </span>
        <span>View bag</span>
      </button>
    </div>
  );
}
