const KELLY_API = 'https://csdmeeplo0.execute-api.eu-west-1.amazonaws.com';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/kelly') {
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { allow: 'GET' },
        });
      }

      const res = await fetch(`${KELLY_API}/${url.search}`);

      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.startsWith('image/')) return res;

      return Response.redirect(new URL('/kelly', request.url).toString(), 302);
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler;
