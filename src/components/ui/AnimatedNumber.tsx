import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { aed } from '../../lib/format';

/** AED amount that rolls smoothly to its new value. */
export function AnimatedAED({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const c = animate(from.current, value, { duration: 0.5, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) });
    from.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <span className={`tabular-nums ${className ?? ''}`}>{aed(shown)}</span>;
}
