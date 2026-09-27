import { lazy, Suspense } from 'react';
import { Footer } from './components/layout/Footer';
import { MobileBagBar } from './components/layout/MobileBagBar';
import { Navbar } from './components/layout/Navbar';
import { ToastLayer } from './components/layout/ToastLayer';
import { Closing } from './components/sections/Closing';
import { Companies } from './components/sections/Companies';
import { CustomCake } from './components/sections/CustomCake';
import { Faq } from './components/sections/Faq';
import { Hero } from './components/sections/Hero';
import { Reviews } from './components/sections/Reviews';
import { Safa } from './components/sections/Safa';
import { TheLog } from './components/sections/TheLog';
import { TheSix } from './components/sections/TheSix';
import { SprigDefs } from './components/ui/Sprig';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';

const Overlays = lazy(() => import('./components/shop/Overlays'));

export default function App() {
  return (
    <UIProvider>
      <CartProvider>
        <SprigDefs />
        <a href="#main" className="btn btn-cocoa sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-[90]">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="pt-[56px] lg:pt-[64px]">
          <Hero />
          <CustomCake />
          <TheSix />
          <Companies />
          <Safa />
          <TheLog />
          <Reviews />
          <Faq />
          <Closing />
        </main>
        <Footer />
        <MobileBagBar />
        <ToastLayer />
        <Suspense fallback={null}>
          <Overlays />
        </Suspense>
      </CartProvider>
      </UIProvider>
  );
}
