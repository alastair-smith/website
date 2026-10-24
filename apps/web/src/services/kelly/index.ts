// Makes the Kelly and Potter GIFs in the browser with the same code the API
// uses, so making one doesn't need a round trip. The API is still there for
// share links.
import {
  assetPaths,
  encodeText,
  loadTemplateAssets,
  normaliseText,
  renderTextFrame,
  type TemplateAssets,
  type TemplateName,
  templates,
} from '@alastair-smith/kelly-core';

export type { TemplateName } from '@alastair-smith/kelly-core';

export const API_PATH = '/api/kelly';

export const getShareUrl = (type: TemplateName, text: string) => {
  const params = new URLSearchParams({ q: encodeText(text) });
  if (type !== 'kelly') params.set('type', type);
  return `${API_PATH}?${params}`;
};

interface LoadedTemplate extends TemplateAssets {
  head: Uint8Array<ArrayBuffer>;
  tail: Uint8Array<ArrayBuffer>;
}

const fetchBytes = async (path: string) => {
  const response = await fetch(`${API_PATH}/assets/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch Kelly asset ${path}`);
  return new Uint8Array(await response.arrayBuffer());
};

const loaded = new Map<TemplateName, Promise<LoadedTemplate>>();

const loadTemplate = (type: TemplateName) => {
  let template = loaded.get(type);
  if (!template) {
    const paths = assetPaths(type);
    template = Promise.all([
      loadTemplateAssets(fetchBytes, type, { compressed: true }),
      fetchBytes(paths.head),
      fetchBytes(paths.tail),
    ]).then(([assets, head, tail]) => ({ ...assets, head, tail }));
    // let the next attempt retry rather than reusing the failure
    template.catch(() => loaded.delete(type));
    loaded.set(type, template);
  }
  return template;
};

export const generateGif = async (
  type: TemplateName,
  text: string,
): Promise<Blob> => {
  const template = await loadTemplate(type);
  const frame = renderTextFrame(templates[type], template, normaliseText(text));
  return new Blob([template.head, frame, template.tail], { type: 'image/gif' });
};
