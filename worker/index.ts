import { handleCheckout, type Env } from './checkout';
import { handleEnquiries } from './enquiries';
import { handleInspiration } from './inspiration';
import { handleOrders } from './orders';
import { handleStripeWebhook } from './stripe-webhook';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/checkout') return handleCheckout(request, env, ctx);
    if (pathname === '/api/stripe/webhook') return handleStripeWebhook(request, env);
    if (pathname === '/api/orders') return handleOrders(request, env);
    if (pathname === '/api/enquiries') return handleEnquiries(request, env);
    if (pathname === '/api/inspiration') return handleInspiration(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
