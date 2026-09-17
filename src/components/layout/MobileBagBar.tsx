import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { spring } from '../../lib/motion';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { AnimatedAED } from '../ui/AnimatedNumber';

/** Sticky bottom bar on phones once the bag has something in it. */
export function MobileBagBar() {
  const { count, subtotal, pulse } = useCart();
  const { overlay, open } = useUI();
  const show = count > 0 && !overlay;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe md:hidden"
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={spring.sheet}
        >
          <motion.button
            type="button"
            onClick={() => open({ kind: 'cart' })}
            whileTap={{ scale: 0.97 }}
            className="flex h-14 w-full items-center gap-3 rounded-full bg-berry pl-2 pr-5 text-cream shadow-[0_16px_40px_-12px_rgb(122_31_57/0.7)]"
          >
            <motion.span
              key={pulse}
              data-cart-target
              animate={{ scale: [1, 1.25, 1], rotate: [0, -12, 0] }}
              transition={{ duration: 0.5 }}
              className="relative grid size-10 place-items-center rounded-full bg-cream/15"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cream text-[11px] font-bold text-berry">{count}</span>
            </motion.span>
            <span className="font-medium">View bag</span>
            <span className="ml-auto flex items-center gap-2 font-semibold">
              <AnimatedAED value={subtotal} />
              <ArrowRight className="size-4" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
