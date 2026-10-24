interface Env {
  KELLY: Fetcher;
}

const KELLY_PATH = '/api/kelly';

export default {
  async fetch(request, env): Promise<Response> {
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

      const kellyUrl = new URL(url);
      kellyUrl.pathname = url.pathname.slice(KELLY_PATH.length) || '/';
      const res = await env.KELLY.fetch(new Request(kellyUrl, request));

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
