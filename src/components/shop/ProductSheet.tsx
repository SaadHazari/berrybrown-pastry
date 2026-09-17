import { AnimatePresence, motion } from 'motion/react';
import { Clock, Leaf, ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import { defaultSize, getProduct, type Product } from '../../data/products';
import { cn } from '../../lib/cn';
import { flyToCart } from '../../lib/fly';
import { aed } from '../../lib/format';
import { spring } from '../../lib/motion';
import { MESSAGE_MAX } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { AnimatedAED } from '../ui/AnimatedNumber';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Img } from '../ui/Img';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';

function Details({ product, onAdded }: { product: Product; onAdded(): void }) {
  const { add } = useCart();
  const { notify } = useUI();
  const [sizeId, setSizeId] = useState(defaultSize(product).id);
  const [flavourId, setFlavourId] = useState(product.flavours[0].id);
  const [message, setMessage] = useState('');
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const size = product.sizes.find((s) => s.id === sizeId)!;

  const submit = () => {
    add({ productId: product.id, sizeId, flavourId, qty, message: message.trim() || undefined });
    flyToCart(product.image, btnRef.current);
    notify(`${product.name} added`, product.image);
    onAdded();
  };

  return (
    <>
      <div className="px-5 md:px-6">
        <div className="relative overflow-hidden rounded-[24px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={photo} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Img src={product.gallery[photo]} alt={product.name} wrapperClassName="aspect-[4/3]" loading="eager" />
            </motion.div>
          </AnimatePresence>
          {product.gallery.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-cocoa/30 p-1.5 backdrop-blur">
              {product.gallery.map((_, i) => (
                <button key={i} type="button" onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} className={cn('h-2 rounded-full bg-cream transition-all', photo === i ? 'w-6' : 'w-2 opacity-60')} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-cocoa">
                <Leaf className="size-3 text-sage" /> {t}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-oat px-2.5 py-1 text-xs font-medium">
              <Clock className="size-3" /> {product.leadTimeHours}h notice
            </span>
          </div>
          <h3 className="mt-3 font-display text-3xl leading-tight" data-autofocus tabIndex={-1}>
            {product.name}
          </h3>
          <p className="mt-2 text-milk">{product.short}</p>
        </div>

        <fieldset className="mt-7">
          <legend className="mb-3 text-sm font-semibold">Size</legend>
          <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {product.sizes.map((s) => {
              const active = s.id === sizeId;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSizeId(s.id)}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative flex items-center justify-between rounded-2xl p-3.5 text-left ring-1 ring-inset transition-colors sm:flex-col sm:items-start sm:gap-1',
                    active ? 'bg-cocoa text-cream ring-cocoa' : 'bg-paper ring-cocoa/10 hover:ring-cocoa/30',
                  )}
                >
                  {s.popular && <span className={cn('absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', active ? 'bg-berry text-cream' : 'bg-blush text-berry-deep')}>Most loved</span>}
                  <span>
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className={cn('block text-xs', active ? 'text-cream/70' : 'text-milk')}>serves {s.serves}</span>
                  </span>
                  <span className="text-sm font-semibold">{aed(s.price)}</span>
                </motion.button>
              );
            })}
          </div>
        </fieldset>

        {product.flavours.length > 1 && (
          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold">Flavour</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {product.flavours.map((f) => (
                <Chip key={f.id} selected={f.id === flavourId} onSelect={() => setFlavourId(f.id)} layoutGroup={`flavour-${product.id}`}>
                  {f.name}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-6 block">
          <span className="mb-2 flex items-baseline justify-between text-sm font-semibold">
            <span>
              Message on a chocolate plaque <span className="font-normal text-milk">(free)</span>
            </span>
            <span className={cn('text-xs font-normal tabular-nums', message.length >= MESSAGE_MAX ? 'text-berry' : 'text-milk')}>
              {message.length}/{MESSAGE_MAX}
            </span>
          </span>
          <input
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Happy birthday, Layla!"
            className="h-12 w-full rounded-2xl bg-paper px-4 font-hand text-xl ring-1 ring-cocoa/10 outline-none placeholder:text-milk/50 focus:ring-2 focus:ring-berry"
          />
        </label>

        <p className="mt-5 pb-6 text-xs text-milk">Contains: {product.allergens.join(', ')}. Made in a kitchen that handles nuts.</p>
      </div>

      <div className="sticky bottom-0 border-t border-cocoa/10 bg-paper/90 px-5 pt-4 pb-safe backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <QtyStepper value={qty} onChange={setQty} />
          <Button ref={btnRef} size="lg" onClick={submit} className="flex-1">
            <ShoppingBag className="size-5" />
            Add · <AnimatedAED value={size.price * qty} />
          </Button>
        </div>
      </div>
    </>
  );
}

export function ProductSheet() {
  const { overlay, close, open } = useUI();
  const back = overlay?.kind === 'product' ? overlay.back : undefined;
  const onClose = () => (back ? open({ kind: back }) : close());
  const [lastId, setLastId] = useState<string | null>(null);
  const id = overlay?.kind === 'product' ? overlay.id : null;
  if (id && id !== lastId) setLastId(id);
  const product = lastId ? getProduct(lastId) : undefined;

  return (
    <Sheet open={!!id && !!product} onClose={onClose} title={product?.name ?? 'Cake'} hideTitle width="md:w-[520px]">
      {product && (
        <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring.soft}>
          <Details product={product} onAdded={onClose} />
        </motion.div>
      )}
    </Sheet>
  );
}
