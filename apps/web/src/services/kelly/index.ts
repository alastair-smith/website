// Makes the Kelly and Potter GIFs in the browser with the same code the API
// uses, so making one doesn't need a round trip. The API is still there for
// share links.
import {
  createKelly,
  encodeText,
  type TemplateName,
} from '@alastair-smith/kelly-core';

export type { TemplateName } from '@alastair-smith/kelly-core';

export const API_PATH = '/api/kelly';

export const getShareUrl = (type: TemplateName, text: string) => {
  const params = new URLSearchParams({ q: encodeText(text) });
  if (type !== 'kelly') params.set('type', type);
  return `${API_PATH}?${params}`;
};

const kelly = createKelly(async (path) => {
  const response = await fetch(`${API_PATH}/assets/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch Kelly asset ${path}`);
  return new Uint8Array(await response.arrayBuffer());
});

// the page is only visited to make a GIF, so start loading straight away
export const preloadGif = (type: TemplateName) => kelly.preload(type);

export const generateGif = async (
  type: TemplateName,
  text: string,
): Promise<Blob> =>
  new Blob(await kelly.render(type, text), { type: 'image/gif' });
