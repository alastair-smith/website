// Runs the Worker against the baked assets in dist/, so `pnpm run bake` first
import fs from 'node:fs/promises';
import path from 'node:path';
import { encodeText, parseGif } from '@alastair-smith/kelly-core';
import { describe, expect, it } from 'vitest';
import worker from './index.ts';

const dist = path.resolve(import.meta.dirname, '../dist');

const env = {
  ASSETS: {
    fetch: async (input: RequestInfo | URL) => {
      const { pathname } = new URL(
        input instanceof Request ? input.url : input,
      );
      try {
        return new Response(await fs.readFile(path.join(dist, pathname)));
      } catch {
        return new Response('Not Found', { status: 404 });
      }
    },
  },
} as unknown as Parameters<typeof worker.fetch>[1];

const get = (query: string) =>
  worker.fetch(
    new Request(`https://kelly.test/${query}`) as Parameters<
      typeof worker.fetch
    >[0],
    env,
    {} as ExecutionContext,
  );

const gifFrom = async (res: Response) =>
  parseGif(new Uint8Array(await res.arrayBuffer()));

describe('kelly worker', () => {
  it('renders a kelly gif', async () => {
    const res = await get(`?q=${encodeText('WHERE YOU AT?')}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/gif');
    const gif = await gifFrom(res);
    expect([gif.width, gif.height]).toEqual([480, 360]);
    // 9 start frames, the text held for 25 frames and 15 end frames
    expect(gif.frames).toHaveLength(49);
    // apps that turn GIFs into video give every frame the same duration, so
    // any frame with a different delay plays wrong there
    const delays = new Set(
      gif.frames.map(({ gce }) => (gce ? gce[4] | (gce[5] << 8) : 0)),
    );
    expect([...delays]).toEqual([15]);
  });

  it('renders a potter gif', async () => {
    const res = await get(`?type=potter&q=${encodeText('Nice earmuffs')}`);
    const gif = await gifFrom(res);
    expect([gif.width, gif.height]).toEqual([480, 270]);
  });

  it('accepts links from the old pages', async () => {
    const res = await get(`?q=${btoa('ok >>> café')}`);
    expect(res.status).toBe(200);
  });

  it('rejects bad input', async () => {
    for (const query of [
      '',
      '?q=',
      '?q=%%%',
      `?type=bort&q=${encodeText('hi')}`,
    ]) {
      expect((await get(query)).status).toBe(400);
    }
  });

  it('only renders on GET', async () => {
    const res = await worker.fetch(
      new Request('https://kelly.test/?q=aGk', {
        method: 'POST',
      }) as Parameters<typeof worker.fetch>[0],
      env,
      {} as ExecutionContext,
    );
    expect(res.status).toBe(405);
  });
});
