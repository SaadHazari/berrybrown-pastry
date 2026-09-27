import { createPortal } from 'react-dom';
import { useUI } from '../../store/ui';

export function ToastLayer() {
  const { toast, open, overlay } = useUI();
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-[calc(64px+var(--spacing-md))] z-[90] flex justify-center px-md" aria-live="polite">
      {toast && (
        <button
          type="button"
          key={toast.id}
          onClick={() => (toast.action ? toast.action.run() : overlay?.kind !== 'cart' && open({ kind: 'cart' }))}
          className="pointer-events-auto flex animate-toast items-center gap-md rounded bg-cocoa px-md py-sm text-butter"
        >
          <span className="t-callout">{toast.title}</span>
          <span className="t-label text-butter-60">{toast.action?.label ?? 'View bag'}</span>
        </button>
      )}
    </div>,
    document.body,
  );
}
