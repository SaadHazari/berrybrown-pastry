import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, Pause, Play, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { OVEN_NOTES, RATING } from '../../data/content';
import { media } from '../../data/media';
import { ease } from '../../lib/motion';
import { scrollToId } from '../../lib/scroll';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Magnetic } from '../ui/Magnetic';
import { SplitWords } from '../ui/SplitWords';
import { TiltCard } from '../ui/TiltCard';

function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const on = () => setReady(true);
    window.addEventListener('bb:ready', on);
    const fallback = window.setTimeout(on, 3200);
    return () => {
      window.removeEventListener('bb:ready', on);
      window.clearTimeout(fallback);
    };
  }, []);
  return ready;
}

export function Hero() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const ready = useReady();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [note] = useState(() => OVEN_NOTES[Math.floor(Math.random() * OVEN_NOTES.length)]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pause the video when it's off-screen to save battery.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && playing) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce, playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => undefined);
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const d = 0.15; // base delay after preloader

  return (
    <section id="top" ref={sectionRef} className="relative p-2 md:p-3" aria-label="Welcome">
      <div className="relative h-[calc(100svh-16px)] min-h-[600px] overflow-hidden rounded-[32px] bg-cocoa md:h-[calc(100svh-24px)] md:rounded-[44px]">
        <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: videoScale }}>
          {reduce ? (
            <img src={media.hero.poster.src} alt="" className="size-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              className="size-full object-cover"
              src={media.hero.video.src}
              poster={media.hero.poster.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          )}
        </motion.div>

        {/* warm scrims for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/25 to-cocoa/30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa/55 via-transparent to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-[#6b3a1e]/15 mix-blend-multiply" aria-hidden />

        <motion.div
          className="relative z-10 flex h-full flex-col justify-end px-5 pb-8 pt-28 text-cream md:px-14 md:pb-14"
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        >
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              {!ready && <h1 className="sr-only">Cakes made with heart, not haste.</h1>}
              {ready && (
                <>
                  <motion.p
                    className="mb-3 font-hand text-2xl text-blush md:text-3xl"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: d, duration: 0.8, ease: ease.out }}
                  >
                    from Safa's kitchen in Dubai
                  </motion.p>
                  <h1 className="text-shadow-soft text-[clamp(2.9rem,9vw,6.6rem)] font-light leading-[0.95]">
                    <SplitWords text="Cakes made with heart," delay={d + 0.1} />
                    <br />
                    <SplitWords text="not haste." delay={d + 0.45} accent={['haste.']} className="[&_.text-berry]:text-blush" />
                  </h1>
                  <motion.p
                    className="mt-5 max-w-md text-base text-cream/85 md:text-lg"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: d + 0.8, duration: 0.8, ease: ease.out }}
                  >
                    Small batches, baked to order and delivered chilled across Dubai.
                  </motion.p>

                  <motion.div
                    className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: d + 1, duration: 0.8, ease: ease.out }}
                  >
                    <Magnetic className="block sm:inline-block">
                      <Button size="lg" onClick={() => open({ kind: 'menu' })} className="w-full sm:w-auto">
                        Order a cake
                        <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Magnetic>
                    <Button size="lg" variant="ghost" onClick={() => scrollToId('custom')} className="text-cream backdrop-blur-sm">
                      Design a custom cake
                    </Button>
                  </motion.div>

                  <motion.div
                    className="mt-6 flex items-center gap-3 text-sm text-cream/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: d + 1.3 }}
                  >
                    <span className="flex -space-x-2">
                      {[media.gallery.berrySlice, media.products.mangoTart, media.products.pistachioKunafa].map((m) => (
                        <img key={m.src} src={m.src} alt="" className="size-8 rounded-full object-cover ring-2 ring-cocoa" />
                      ))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-4 fill-blush text-blush" />
                      <strong className="font-semibold text-cream">{RATING.score}</strong>
                    </span>
                    <span>from {RATING.count}+ Dubai families</span>
                  </motion.div>
                </>
              )}
            </div>

            {/* Rotating "oven note" polaroid: a small surprise on each visit */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  className="hidden lg:block"
                  initial={{ opacity: 0, y: 40, rotate: 10 }}
                  animate={{ opacity: 1, y: 0, rotate: 4 }}
                  transition={{ delay: d + 1.2, type: 'spring', stiffness: 90, damping: 14 }}
                >
                  <TiltCard className="polaroid w-64 text-cocoa">
                    <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-4deg] bg-blush/80" aria-hidden />
                    <img src={media.gallery.berrySlice.src} alt={media.gallery.berrySlice.alt} className="aspect-square w-full rounded-[3px] object-cover" />
                    <p className="mt-3 px-1 font-hand text-xl leading-tight">{note}</p>
                  </TiltCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {!reduce && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute right-4 top-24 z-10 grid size-10 place-items-center rounded-full bg-cocoa/30 text-cream/80 backdrop-blur hover:bg-cocoa/50 md:right-8 md:top-28"
            aria-label={playing ? 'Pause background video' : 'Play background video'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        )}

        <motion.button
          type="button"
          onClick={() => scrollToId('favourites')}
          className="absolute bottom-6 right-6 z-10 hidden size-14 place-items-center rounded-full border border-cream/30 text-cream md:grid"
          aria-label="Scroll to our cakes"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1, y: [0, 6, 0] } : undefined}
          transition={{ y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }, opacity: { delay: 1.8 } }}
        >
          <ArrowDown className="size-5" />
        </motion.button>
      </div>
    </section>
  );
}
