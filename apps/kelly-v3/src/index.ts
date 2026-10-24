import {
  assetPaths,
  decodeText,
  isTemplateName,
  loadTemplateAssets,
  renderTextFrame,
  type TemplateAssets,
  type TemplateName,
  templates,
} from '@alastair-smith/kelly-core';

interface Env {
  ASSETS: Fetcher;
}

interface LoadedTemplate extends TemplateAssets {
  head: ArrayBuffer;
  tail: ArrayBuffer;
}

const ASSET_PREFIX = '/assets/';

// the same text always renders the same GIF, but a week lets rendering
// changes reach links that have already been shared
const CACHE_CONTROL = 'public, max-age=604800';

// assets are decoded once per isolate and reused across requests
const loaded = new Map<TemplateName, Promise<LoadedTemplate>>();

const loadTemplate = (env: Env, name: TemplateName) => {
  let template = loaded.get(name);
  if (!template) {
    const fetchBuffer = async (path: string) => {
      const res = await env.ASSETS.fetch(
        `https://assets.local${ASSET_PREFIX}${path}`,
      );
      if (!res.ok) throw new Error(`Missing asset ${path}: ${res.status}`);
      return res.arrayBuffer();
    };
    const fetchBytes = async (path: string) =>
      new Uint8Array(await fetchBuffer(path));
    const paths = assetPaths(name);

    template = Promise.all([
      loadTemplateAssets(fetchBytes, name),
      fetchBuffer(paths.head),
      fetchBuffer(paths.tail),
    ]).then(([assets, head, tail]) => ({ ...assets, head, tail }));
    template.catch(() => loaded.delete(name));
    loaded.set(name, template);
  }
  return template;
};

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

    const template = await loadTemplate(env, type);
    const frame = renderTextFrame(templates[type], template, text);

    return new Response(new Blob([template.head, frame, template.tail]), {
      headers: {
        'content-type': 'image/gif',
        'cache-control': CACHE_CONTROL,
      },
    });
  },
} satisfies ExportedHandler<Env>;
