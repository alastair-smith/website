interface Env {
  KELLY: Fetcher;
}

const KELLY_PATH = '/api/kelly';

// share links render the same GIF every time, so keep them at the edge
// rather than spending the Kelly Worker's CPU on repeats
const fetchKelly = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL,
) => {
  const cache = await caches.open('kelly');
  const cached = await cache.match(request);
  if (cached) return cached;

  const kellyUrl = new URL(url);
  kellyUrl.pathname = url.pathname.slice(KELLY_PATH.length) || '/';
  const res = await env.KELLY.fetch(new Request(kellyUrl, request));

  if (res.ok) ctx.waitUntil(cache.put(request, res.clone()));
  return res;
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (
      url.pathname === KELLY_PATH ||
      url.pathname.startsWith(`${KELLY_PATH}/`)
    ) {
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { allow: 'GET' },
        });
      }

      const res = await fetchKelly(request, env, ctx, url);

      // a bad share link goes back to the page it came from
      if (url.pathname === KELLY_PATH && !res.ok) {
        const page =
          url.searchParams.get('type') === 'potter' ? '/potter' : '/kelly';
        return Response.redirect(new URL(page, request.url).toString(), 302);
      }

      return res;
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
