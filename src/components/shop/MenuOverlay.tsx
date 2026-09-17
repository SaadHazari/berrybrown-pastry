import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useState } from 'react';
import { CATEGORIES, PRODUCTS, type Category } from '../../data/products';
import { useUI } from '../../store/ui';
import { Chip } from '../ui/Chip';
import { Sheet } from '../ui/Sheet';
import { ProductCard } from './ProductCard';

export function MenuOverlay() {
  const { overlay, close } = useUI();
  const [cat, setCat] = useState<Category | 'all'>('all');
  const items = cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  return (
    <Sheet open={overlay?.kind === 'menu'} onClose={close} title="The menu" variant="full">
      <div className="px-5 pb-16 md:px-10">
        <p className="-mt-1 font-hand text-xl text-milk">everything is baked fresh, just for you</p>
        <LayoutGroup id="menu-cats">
          <div role="tablist" aria-label="Filter by category" className="no-scrollbar sticky top-0 z-10 -mx-5 mt-4 flex gap-2 overflow-x-auto bg-cream/90 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} role="tab" layoutGroup="menu" selected={cat === c.id} onSelect={() => setCat(c.id)} className="shrink-0">
                {c.label}
              </Chip>
            ))}
          </div>
        </LayoutGroup>

        <motion.ul layout className="mt-6 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} tilt={i % 2 ? 1.5 : -1.5} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </Sheet>
  );
}
