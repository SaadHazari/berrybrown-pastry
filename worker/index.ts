import { handleCheckout, type Env } from './checkout';
import { handleInspiration } from './inspiration';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/checkout') return handleCheckout(request, env);
    if (pathname === '/api/inspiration' || pathname.startsWith('/api/inspiration/')) return handleInspiration(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
