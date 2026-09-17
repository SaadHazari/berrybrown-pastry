import { motion } from 'motion/react';
import { CONTACT } from '../../data/content';
import { useIsDesktop } from '../../lib/hooks';
import { whatsappLink } from '../../lib/order';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.1 5.5.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.1-3.5-8.2z" />
    </svg>
  );
}

export function WhatsAppFab() {
  const { count } = useCart();
  const { overlay } = useUI();
  const isDesktop = useIsDesktop();
  if (overlay) return null;
  return (
    <motion.a
      href={whatsappLink("Hi Safa! I found Berry Brown online and I'd love to ask about a cake 🍰")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with Safa on WhatsApp (${CONTACT.phoneDisplay})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: count > 0 && !isDesktop ? -72 : 0 }}
      whileHover={{ scale: 1.08, rotate: -6 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
      className="group fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift md:bottom-6 md:right-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/25 [animation-duration:3s] [animation-iteration-count:3] motion-reduce:hidden" aria-hidden />
      <WhatsAppIcon className="relative size-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-cocoa px-3 py-1.5 text-sm text-cream opacity-0 transition-opacity group-hover:opacity-100 md:block">
        Chat with Safa
      </span>
    </motion.a>
  );
}
