import Lenis from 'lenis';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { lazy, Suspense, useEffect } from 'react';
import { Footer } from './components/layout/Footer';
import { FlyLayer } from './components/layout/FlyLayer';
import { MobileBagBar } from './components/layout/MobileBagBar';
import { Navbar } from './components/layout/Navbar';
import { Preloader } from './components/layout/Preloader';
import { ToastLayer } from './components/layout/ToastLayer';
import { WhatsAppFab } from './components/layout/WhatsAppFab';
import { Builder } from './components/sections/Builder';
import { ClosingCta } from './components/sections/ClosingCta';
import { Faq } from './components/sections/Faq';
import { Favourites } from './components/sections/Favourites';
import { Gallery } from './components/sections/Gallery';
import { Hero } from './components/sections/Hero';
import { HowItWorks } from './components/sections/HowItWorks';
import { Reviews } from './components/sections/Reviews';
import { Story } from './components/sections/Story';
import { TrustMarquee } from './components/sections/TrustMarquee';
import { registerLenis } from './lib/scroll';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';

const Overlays = lazy(() => import('./components/shop/Overlays'));

function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -80 } });
    registerLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reduce]);
  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <CartProvider>
          <SmoothScroll />
          <Preloader />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-cream">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="relative z-10 rounded-b-[40px] bg-cream pb-8 shadow-[0_30px_60px_-30px_rgb(43_27_20/0.45)] md:rounded-b-[64px]">
            <Hero />
            <TrustMarquee />
            <Favourites />
            <Gallery />
            <HowItWorks />
            <Story />
            <Builder />
            <Reviews />
            <Faq />
            <ClosingCta />
          </main>
          <Footer />
          <MobileBagBar />
          <WhatsAppFab />
          <FlyLayer />
          <ToastLayer />
          <Suspense fallback={null}>
            <Overlays />
          </Suspense>
          <div className="grain" aria-hidden />
        </CartProvider>
      </UIProvider>
    </MotionConfig>
  );
}
