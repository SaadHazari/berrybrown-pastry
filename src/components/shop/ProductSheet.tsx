import { useState } from 'react';
import { getProduct, sizeFor, type Product } from '../../data/products';
import { cn } from '../../lib/cn';
import { aed } from '../../lib/format';
import { MESSAGE_MAX } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';

function Details({ product, sizeId: chosen, onAdded }: { product: Product; sizeId?: string; onAdded(): void }) {
  const { add } = useCart();
  const { notify } = useUI();
  const [sizeId, setSizeId] = useState(sizeFor(product, chosen).id);
  const [flavourId, setFlavourId] = useState(product.flavours[0].id);
  const [message, setMessage] = useState('');
  const [qty, setQty] = useState(1);
  const size = product.sizes.find((s) => s.id === sizeId)!;

  const submit = () => {
    add({ productId: product.id, sizeId, flavourId, qty, message: message.trim() || undefined });
    notify(`${product.name} added`);
    onAdded();
  };

  return (
    <>
      <div className="px-md py-md md:px-lg">
        <h3 className="t-title3" data-autofocus tabIndex={-1}>
          {product.name}
        </h3>
        <p className="t-callout mt-xs text-cocoa-70">{product.short}</p>

        <fieldset className="mt-lg">
          <legend className="t-label text-cocoa-70">Size</legend>
          <div role="radiogroup" className="mt-sm grid grid-cols-3 gap-xs">
            {product.sizes.map((s) => (
              <Chip key={s.id} selected={s.id === sizeId} onSelect={() => setSizeId(s.id)}>
                {s.label} · {s.price}
              </Chip>
            ))}
          </div>
          <p className="t-caption mt-xs text-cocoa-70">{product.sizes.map((s) => `${s.label} serves ${s.serves}`).join(' · ')}</p>
        </fieldset>

        {product.flavours.length > 1 && (
          <fieldset className="mt-lg">
            <legend className="t-label text-cocoa-70">Flavour</legend>
            <div role="radiogroup" className="mt-sm flex flex-wrap gap-xs">
              {product.flavours.map((f) => (
                <Chip key={f.id} selected={f.id === flavourId} onSelect={() => setFlavourId(f.id)}>
                  {f.name}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-lg block">
          <span className="flex items-baseline justify-between">
            <span className="t-label text-cocoa-70">Message on the cake</span>
            <span className={cn('t-price', message.length >= MESSAGE_MAX ? 'text-cocoa' : 'text-cocoa-70')}>
              {message.length}/{MESSAGE_MAX}
            </span>
          </span>
          <input name="plaque-message" autoComplete="off" value={message} maxLength={MESSAGE_MAX} onChange={(e) => setMessage(e.target.value)} placeholder="Optional" className="field mt-sm" />
        </label>

        <p className="t-caption mt-lg text-cocoa-70">Contains {product.allergens.join(', ').toLowerCase()}. Made in a kitchen that handles nuts. Ready in {product.leadTimeHours} hours.</p>
      </div>

      <div className="sticky bottom-0 border-t border-cocoa-15 bg-butter px-md pt-md pb-safe md:px-lg">
        <div className="flex items-center gap-md">
          <QtyStepper value={qty} onChange={setQty} />
          <Button variant="claret" onClick={submit} className="flex-1">
            Add · {aed(size.price * qty)}
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
  // Kept after closing, so the sheet's content stays put while it slides away.
  const [last, setLast] = useState<{ id: string; size?: string } | null>(null);
  const id = overlay?.kind === 'product' ? overlay.id : null;
  const size = overlay?.kind === 'product' ? overlay.size : undefined;
  if (id && (id !== last?.id || size !== last?.size)) setLast({ id, size });
  const product = last ? getProduct(last.id) : undefined;

  return (
    <Sheet open={!!id && !!product} onClose={onClose} title={product?.name ?? 'Cake'} hideTitle width="md:w-[520px]">
      {product && <Details key={`${product.id}:${last?.size ?? ''}`} product={product} sizeId={last?.size} onAdded={onClose} />}
    </Sheet>
  );
}
