import {
  createKelly,
  decodeText,
  isTemplateName,
  type Kelly,
} from '@alastair-smith/kelly-core';

interface Env {
  ASSETS: Fetcher;
}

const ASSET_PREFIX = '/assets/';

// the same text always renders the same GIF, but a week lets rendering
// changes reach links that have already been shared
const CACHE_CONTROL = 'public, max-age=604800';

// created on the first request, then kept for the life of the isolate so the
// assets are only loaded once
let kelly: Kelly | undefined;

const badRequest = () => new Response('Bad Request', { status: 400 });

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(ASSET_PREFIX)) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname !== '/') {
      return new Response('Not Found', { status: 404 });
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { allow: 'GET' },
      });
    }

    const type = url.searchParams.get('type') ?? 'kelly';
    if (!isTemplateName(type)) return badRequest();

    let text: string;
    try {
      text = decodeText(url.searchParams.get('q') ?? '');
    } catch {
      return badRequest();
    }

    kelly ??= createKelly(async (path) => {
      const res = await env.ASSETS.fetch(
        `https://assets.local${ASSET_PREFIX}${path}`,
      );
      if (!res.ok) throw new Error(`Missing asset ${path}: ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    });

    return new Response(new Blob(await kelly.render(type, text)), {
      headers: {
        'content-type': 'image/gif',
        'cache-control': CACHE_CONTROL,
      },
    });
  },
} satisfies ExportedHandler<Env>;
