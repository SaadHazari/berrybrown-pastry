import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Overlay =
  | null
  | { kind: 'menu' }
  | { kind: 'product'; id: string; back?: 'menu' }
  | { kind: 'cart' }
  | { kind: 'checkout'; notice?: string }
  | { kind: 'success'; ref: string; paid: boolean; whatsappUrl?: string }
  | { kind: 'lightbox'; index: number };

export type Toast = { id: number; title: string; image?: string };

type UIContextValue = {
  overlay: Overlay;
  open(o: Overlay): void;
  close(): void;
  toast: Toast | null;
  notify(title: string, image?: string): void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const open = useCallback((o: Overlay) => setOverlay(o), []);
  const close = useCallback(() => setOverlay(null), []);
  const notify = useCallback((title: string, image?: string) => {
    const id = Date.now();
    setToast({ id, title, image });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  }, []);

  const value = useMemo(() => ({ overlay, open, close, toast, notify }), [overlay, open, close, toast, notify]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
