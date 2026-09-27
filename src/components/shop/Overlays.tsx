import { useEffect } from 'react';
import { loadPending, savePending } from '../../lib/checkoutState';
import { normalisePhone } from '../../lib/checkoutState';
import { whatsappLink, whatsappOrderText } from '../../lib/order';
import { PICKUP_ZONE_ID } from '../../data/zones';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { CartDrawer } from './CartDrawer';
import { Lightbox } from './Lightbox';
import { Checkout } from './Checkout';
import { MenuOverlay } from './MenuOverlay';
import { ProductSheet } from './ProductSheet';
import { QuoteSheet, useQuoteFromUrl } from './QuoteSheet';
import { SuccessOverlay } from './SuccessOverlay';

/** Handles returning from Stripe: ?order=success&ref=… or ?order=cancelled */
function useStripeReturn() {
  const { open } = useUI();
  const { clear } = useCart();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('order');
    if (!status) return;
    const pending = loadPending();
    const ref = params.get('ref') ?? pending?.ref ?? '';
    history.replaceState(null, '', window.location.pathname + window.location.hash);

    const t = window.setTimeout(() => {
      if (status === 'success') {
        let whatsappUrl: string | undefined;
        if (pending && pending.ref === ref) {
          const f = pending.form;
          whatsappUrl = whatsappLink(
            whatsappOrderText({
              ref,
              lines: pending.lines,
              zoneId: f.fulfilment === 'pickup' ? PICKUP_ZONE_ID : f.zoneId,
              date: f.date,
              slotId: f.slotId,
              customer: { ...f.customer, phone: normalisePhone(f.customer.phone) },
              paid: true,
            }),
          );
        }
        clear();
        savePending(null);
        open({ kind: 'success', ref, paid: true, whatsappUrl });
      } else if (status === 'cancelled') {
        open({ kind: 'checkout', notice: 'Payment was cancelled. Nothing was charged, and your bag is still here.' });
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [open, clear]);
}

export default function Overlays() {
  useStripeReturn();
  useQuoteFromUrl();
  return (
    <>
      <MenuOverlay />
      <ProductSheet />
      <CartDrawer />
      <Checkout />
      <SuccessOverlay />
      <QuoteSheet />
      <Lightbox />
    </>
  );
}
