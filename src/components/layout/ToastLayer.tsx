import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { spring } from '../../lib/motion';
import { useUI } from '../../store/ui';

export function ToastLayer() {
  const { toast, open } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(80px,calc(env(safe-area-inset-top)+72px))] z-[85] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.button
            type="button"
            key={toast.id}
            onClick={() => open({ kind: 'cart' })}
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={spring.soft}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-cocoa py-1.5 pl-1.5 pr-5 text-sm text-cream shadow-lift"
          >
            {toast.image ? (
              <img src={toast.image} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-berry">
                <Check className="size-4" />
              </span>
            )}
            <span className="font-medium">{toast.title}</span>
            <span className="text-cream/60 underline underline-offset-4">View bag</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
