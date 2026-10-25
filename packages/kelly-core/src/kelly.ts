// Makes a Kelly or Potter GIF: the start of the clip, one frame with the text
// on it, then the end of the clip. Used by both the API Worker and the
// browser.
//
// Everything that doesn't depend on the text is prepared at build time by
// apps/kelly-v3/scripts/bake.ts (see ./bake.ts), so all that happens here is
// drawing the text into a copy of a ready-made blank frame. That keeps the
// Worker inside the free plan's 10ms of CPU per request.
import { getEncodedPixel, setEncodedPixel } from './gif/lzw.ts';
import { normaliseText } from './query.ts';
import { type TemplateName, templates } from './templates.ts';
import { type Atlas, decodeAtlas, rasterise } from './text/atlas.ts';

// one folder per template
export const assetPaths = (name: TemplateName) => ({
  // GIF header and the frames before the text
  start: `${name}/start.bin`,
  // frames holding the text on screen, the frames after it and the GIF
  // trailer
  end: `${name}/end.bin`,
  // the background as a finished GIF frame, waiting for the text
  blankFrame: `${name}/blank-frame.bin`,
  // which palette colour to use for text at a given alpha over a given
  // background colour, indexed by (background colour << 8) | alpha
  blend: `${name}/blend.bin`,
  // every character pre-drawn, see text/atlas.ts
  atlas: `${name}/atlas.bin`,
});

export interface TemplateAssets {
  start: Uint8Array<ArrayBuffer>;
  end: Uint8Array<ArrayBuffer>;
  blankFrame: Uint8Array<ArrayBuffer>;
  blend: Uint8Array;
  atlas: Atlas;
}

// where a frame's pixel data starts: after the graphic control extension,
// image descriptor and 256-colour table that writeFrame puts first
export const FRAME_DATA_OFFSET = 8 + 10 + 256 * 3;

export const drawText = (
  name: TemplateName,
  { blankFrame, blend, atlas }: TemplateAssets,
  text: string,
): Uint8Array<ArrayBuffer> => {
  const template = templates[name];
  const frame = blankFrame.slice();
  const coverage = rasterise(
    atlas,
    template.matrix,
    template.layout(text, atlas),
    template,
  );
  if (!coverage) return frame;

  const { left, top, width, height, alpha } = coverage;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = alpha[y * width + x];
      if (!a) continue;
      const pixel = (y + top) * template.width + x + left;
      const background = getEncodedPixel(blankFrame, FRAME_DATA_OFFSET, pixel);
      setEncodedPixel(
        frame,
        FRAME_DATA_OFFSET,
        pixel,
        blend[(background << 8) | a],
      );
    }
  }
  return frame;
};

export type FetchBytes = (path: string) => Promise<Uint8Array<ArrayBuffer>>;

export const createKelly = (fetchBytes: FetchBytes) => {
  // each template's files are fetched once and reused
  const loaded = new Map<TemplateName, Promise<TemplateAssets>>();

  const load = (name: TemplateName) => {
    let assets = loaded.get(name);
    if (!assets) {
      const paths = assetPaths(name);
      assets = Promise.all([
        fetchBytes(paths.start),
        fetchBytes(paths.end),
        fetchBytes(paths.blankFrame),
        fetchBytes(paths.blend),
        fetchBytes(paths.atlas),
      ]).then(([start, end, blankFrame, blend, atlas]) => ({
        start,
        end,
        blankFrame,
        blend,
        atlas: decodeAtlas(atlas),
      }));
      // let the next request retry rather than reuse the failure
      assets.catch(() => loaded.delete(name));
      loaded.set(name, assets);
    }
    return assets;
  };

  return {
    // start fetching a template's files before they're needed
    preload(name: TemplateName) {
      // a failure is retried by the next render
      load(name).catch(() => {});
    },
    // the GIF in three parts, to join with `new Blob(parts)`
    async render(name: TemplateName, text: string) {
      const assets = await load(name);
      return [
        assets.start,
        drawText(name, assets, normaliseText(text)),
        assets.end,
      ];
    },
  };
};

export type Kelly = ReturnType<typeof createKelly>;
