import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cartTargetRect, onFly } from '../../lib/fly';

type Flight = { id: number; src: string; from: DOMRect; to: DOMRect };

/** Renders thumbnails arcing into the cart button. */
export function FlyLayer() {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(
    () =>
      onFly(({ src, from }) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const to = cartTargetRect();
        if (!to) return;
        const id = performance.now();
        setFlights((f) => [...f, { id, src, from, to }]);
        window.setTimeout(() => setFlights((f) => f.filter((x) => x.id !== id)), 900);
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>
      <AnimatePresence>
        {flights.map(({ id, src, from, to }) => {
          const size = 56;
          const sx = from.left + from.width / 2 - size / 2;
          const sy = from.top + from.height / 2 - size / 2;
          const ex = to.left + to.width / 2 - size / 2;
          const ey = to.top + to.height / 2 - size / 2;
          return (
            <motion.img
              key={id}
              src={src}
              className="absolute left-0 top-0 rounded-full object-cover shadow-lift ring-2 ring-cream"
              style={{ width: size, height: size }}
              initial={{ x: sx, y: sy, scale: 0.4, opacity: 0 }}
              animate={{
                x: [sx, (sx + ex) / 2, ex],
                y: [sy, Math.min(sy, ey) - 120, ey],
                scale: [0.6, 1.1, 0.25],
                opacity: [0, 1, 0.9],
                rotate: [0, -20, 10],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.5, 0, 0.3, 1], times: [0, 0.45, 1] }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
