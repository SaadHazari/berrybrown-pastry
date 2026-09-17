import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useRef } from 'react';
import { defaultSize, fromPrice, type Product } from '../../data/products';
import { cn } from '../../lib/cn';
import { flyToCart } from '../../lib/fly';
import { aed } from '../../lib/format';
import { spring } from '../../lib/motion';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Img } from '../ui/Img';

export function ProductCard({ product, className, tilt = 0 }: { product: Product; className?: string; tilt?: number }) {
  const { add } = useCart();
  const { open, notify, overlay } = useUI();
  const addRef = useRef<HTMLButtonElement>(null);
  const size = defaultSize(product);

  const quickAdd = () => {
    add({ productId: product.id, sizeId: size.id, flavourId: product.flavours[0].id, qty: 1 });
    flyToCart(product.image, addRef.current);
    notify(`${product.name} added`, product.image);
  };

  return (
    <motion.article
      className={cn('group relative flex flex-col', className)}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => open({ kind: 'product', id: product.id, back: overlay?.kind === 'menu' ? 'menu' : undefined })}
          className="relative block w-full overflow-hidden rounded-[28px] text-left"
          aria-label={`View ${product.name}`}
        >
          <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <Img src={product.image} alt={product.name} wrapperClassName="aspect-[4/5]" draggable={false} />
          </motion.div>
          <span className="absolute inset-0 bg-gradient-to-t from-cocoa/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold text-cocoa backdrop-blur">
              {product.badge}
            </span>
          )}
          <motion.span
            className="absolute bottom-4 left-4 hidden rounded-full bg-cream px-4 py-2 text-sm font-medium text-cocoa shadow-soft md:block"
            variants={{ rest: { opacity: 0, y: 10 }, hover: { opacity: 1, y: 0 } }}
            transition={spring.soft}
            aria-hidden
          >
            Choose size & flavour
          </motion.span>
        </button>

        <motion.button
          ref={addRef}
          type="button"
          onClick={quickAdd}
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          transition={spring.snappy}
          className="absolute bottom-3 right-3 grid size-12 place-items-center rounded-full bg-berry text-cream shadow-[0_8px_20px_-6px_rgb(158_42_75/0.8)]"
          aria-label={`Quick add ${product.name}, ${size.label}, ${aed(size.price)}`}
        >
          <Plus className="size-5" strokeWidth={2.4} />
        </motion.button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <h3 className="font-display text-xl leading-tight md:text-[1.4rem]">{product.name}</h3>
          <p className="mt-1 font-hand text-lg leading-none text-milk" style={{ transform: `rotate(${tilt}deg)` }}>
            {product.note}
          </p>
        </div>
        <p className="shrink-0 pt-1 text-sm text-milk">
          from <span className="font-semibold text-cocoa">{aed(fromPrice(product))}</span>
        </p>
      </div>
    </motion.article>
  );
}
