// The only per-request work: the text, drawn as a frame covering just the
// text's bounding box and transparent everywhere the text isn't. It sits on
// top of the pre-encoded background frame, so the GIF is
// [head: start frames + background][text frame][tail: end frames].
import { type Atlas, rasterise } from './atlas.ts';
import { encodeIndexedFrame, writeFrame } from './gif.ts';
import type { Template } from './templates.ts';

// kelly-v2 held the text for 25 frames of 15cs
export const FRAME_DELAY = 15;
export const BACKGROUND_DELAY = 2;
export const TEXT_DELAY = 25 * FRAME_DELAY - BACKGROUND_DELAY;

// palette slot reserved for transparency, so the background uses 0-254
export const TRANSPARENT_INDEX = 255;

export interface TemplateAssets {
  atlas: Atlas;
  // 256 RGB triples
  palette: Uint8Array;
  // background as palette indices, one byte per pixel
  background: Uint8Array;
  // from buildBlendTable
  blend: Uint8Array;
}

const nearest = (palette: Uint8Array, r: number, g: number, b: number) => {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < TRANSPARENT_INDEX; i++) {
    const dr = palette[i * 3] - r;
    const dg = palette[i * 3 + 1] - g;
    const db = palette[i * 3 + 2] - b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
};

// Built at bake time: the palette colour closest to the text drawn at each
// alpha over each background colour, indexed by (background index << 8) |
// alpha. Saves searching the palette per pixel at request time.
export const buildBlendTable = (
  palette: Uint8Array,
  [tr, tg, tb]: Template['color'],
): Uint8Array<ArrayBuffer> => {
  const table = new Uint8Array(256 * 256);
  for (let bg = 0; bg < TRANSPARENT_INDEX; bg++) {
    for (let a = 1; a < 256; a++) {
      const inv = 255 - a;
      table[(bg << 8) | a] = nearest(
        palette,
        (tr * a + palette[bg * 3] * inv) / 255,
        (tg * a + palette[bg * 3 + 1] * inv) / 255,
        (tb * a + palette[bg * 3 + 2] * inv) / 255,
      );
    }
  }
  return table;
};

export const renderTextFrame = (
  template: Template,
  { atlas, palette, background, blend }: TemplateAssets,
  text: string,
): Uint8Array<ArrayBuffer> => {
  const coverage = rasterise(
    atlas,
    template.matrix,
    template.layout(text, atlas),
    template,
  );
  const { left, top, width, height, alpha } = coverage ?? {
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    alpha: new Uint8Array(1),
  };

  const index = new Uint8Array(width * height).fill(TRANSPARENT_INDEX);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = alpha[y * width + x];
      if (!a) continue;
      const bg = background[(y + top) * template.width + x + left];
      index[y * width + x] = blend[(bg << 8) | a];
    }
  }

  const frame = encodeIndexedFrame(
    index,
    width,
    height,
    palette,
    TRANSPARENT_INDEX,
  );
  return writeFrame(frame, { delay: TEXT_DELAY, disposal: 1, left, top });
};
