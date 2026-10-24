// Files baked by apps/kelly-v3 at build time, one folder per template.
//
// The atlas, background and blend table come in two forms: raw for the
// Worker, which reads them locally and can't spare the CPU to decompress, and
// gzipped for browsers, which have to download them.
import { decodeAtlas } from './atlas.ts';
import type { TemplateAssets } from './frame.ts';
import type { TemplateName } from './templates.ts';

export const assetPaths = (name: TemplateName) => ({
  // GIF header, start frames and the background frame
  head: `${name}/head.bin`,
  // end frames and the GIF trailer
  tail: `${name}/tail.bin`,
  palette: `${name}/palette.bin`,
  background: `${name}/background.bin`,
  blend: `${name}/blend.bin`,
  atlas: `${name}/atlas.bin`,
});

export const GZIP_SUFFIX = '.gz';

export type FetchBytes = (path: string) => Promise<Uint8Array<ArrayBuffer>>;

const gunzip = async (bytes: Uint8Array<ArrayBuffer>) =>
  new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer(),
  );

export const loadTemplateAssets = async (
  fetchBytes: FetchBytes,
  name: TemplateName,
  { compressed = false } = {},
): Promise<TemplateAssets> => {
  const paths = assetPaths(name);
  const fetchMaybeCompressed = async (path: string) =>
    compressed
      ? gunzip(await fetchBytes(path + GZIP_SUFFIX))
      : fetchBytes(path);
  const [palette, background, blend, atlas] = await Promise.all([
    fetchBytes(paths.palette),
    fetchMaybeCompressed(paths.background),
    fetchMaybeCompressed(paths.blend),
    fetchMaybeCompressed(paths.atlas),
  ]);
  return { palette, background, blend, atlas: decodeAtlas(atlas) };
};
