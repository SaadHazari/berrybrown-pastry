import { MotionConfig } from 'motion/react';
import { lazy, Suspense } from 'react';
import { DeadlineStrip } from './components/layout/DeadlineStrip';
import { Footer } from './components/layout/Footer';
import { MobileBagBar } from './components/layout/MobileBagBar';
import { Navbar } from './components/layout/Navbar';
import { ToastLayer } from './components/layout/ToastLayer';
import { WhatsAppFab } from './components/layout/WhatsAppFab';
import { Closing } from './components/sections/Closing';
import { CompanyEvents } from './components/sections/CompanyEvents';
import { CustomCake } from './components/sections/custom/CustomCake';
import { Faq } from './components/sections/Faq';
import { GiftBoxes } from './components/sections/GiftBoxes';
import { Hero } from './components/sections/Hero';
import { HowItWorks } from './components/sections/HowItWorks';
import { Kitchen } from './components/sections/Kitchen';
import { Reviews } from './components/sections/Reviews';
import { Studio } from './components/sections/Studio';
import { TheLog } from './components/sections/TheLog';
import { TheSix } from './components/sections/TheSix';
import { Udora } from './components/sections/Udora';
import { Workshops } from './components/sections/Workshops';
import { SprigDefs } from './components/ui/Sprig';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';

const Overlays = lazy(() => import('./components/shop/Overlays'));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <CartProvider>
          <SprigDefs />
          <a href="#main" className="btn btn-cocoa sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-[90]">
            Skip to content
          </a>
          <DeadlineStrip />
          <Navbar />
          <main id="main" className="relative z-10 bg-butter shadow-page">
            <Hero />
            <TheSix />
            <CustomCake />
            <HowItWorks />
            <GiftBoxes />
            <Workshops />
            <CompanyEvents />
            <Udora />
            <Studio />
            <Kitchen />
            <TheLog />
            <Reviews />
            <Faq />
            <Closing />
            <div aria-hidden className="lace-edge absolute inset-x-0 top-full" />
          </main>
          <Footer />
          <MobileBagBar />
          <WhatsAppFab />
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
