import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { media } from '../../data/media';
import { spring } from '../../lib/motion';
import { useUI } from '../../store/ui';
import { Button, ButtonLink } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { WhatsAppIcon } from '../layout/WhatsAppFab';

const COLORS = ['#9E2A4B', '#F2D6D9', '#EADFCC', '#8A9A7B', '#6B4A3A'];

export function SuccessOverlay() {
  const { overlay, close } = useUI();
  const reduce = useReducedMotion();
  const data = overlay?.kind === 'success' ? overlay : null;

  useEffect(() => {
    if (!data || reduce) return;
    const t = window.setTimeout(() => {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 }, colors: COLORS, zIndex: 95, scalar: 1.1 });
      window.setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS, zIndex: 95 }), 250);
      window.setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS, zIndex: 95 }), 400);
    }, 350);
    return () => window.clearTimeout(t);
  }, [data, reduce]);

  return (
    <Sheet open={!!data} onClose={close} title={data?.paid ? 'Payment received' : 'Order sent'} hideTitle variant="center">
      {data && (
        <div className="px-6 pb-8 text-center">
          <div className="relative mx-auto grid size-24 place-items-center">
            <motion.span className="absolute inset-0 rounded-full bg-blush" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy} />
            <svg viewBox="0 0 52 52" className="relative size-12 text-berry" aria-hidden>
              <motion.path
                d="M14 27 l8 8 l16 -18"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
          </div>
          <p className="mt-5 font-hand text-2xl text-berry">thank you, truly</p>
          <h3 className="mt-1 font-display text-3xl">{data.paid ? "You're all set!" : 'Almost there!'}</h3>
          <p className="mx-auto mt-3 max-w-xs text-milk">
            {data.paid
              ? "Your payment went through. Safa will message you to confirm the details."
              : 'Your order is ready in WhatsApp. Just press send, and Safa will confirm and share payment details.'}
          </p>
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-oat px-4 py-2 text-sm">
            <Check className="size-4 text-sage" /> Order ref <strong className="font-mono">{data.ref}</strong>
          </p>

          <div className="mt-7 flex flex-col gap-2">
            {data.whatsappUrl && (
              <ButtonLink href={data.whatsappUrl} target="_blank" rel="noopener noreferrer" size="lg" className="w-full bg-[#25D366] hover:bg-[#1ebe5b]">
                <WhatsAppIcon className="size-5" />
                {data.paid ? 'Send order details to Safa' : 'Open WhatsApp again'}
              </ButtonLink>
            )}
            <Button variant="soft" size="lg" onClick={close}>
              Back to the kitchen
            </Button>
          </div>
          <img src={media.logo.src} alt="" className="mx-auto mt-6 w-24 opacity-70 mix-blend-multiply" style={{ clipPath: 'inset(0 0 22% 0)' }} />
        </div>
      )}
    </Sheet>
  );
}
