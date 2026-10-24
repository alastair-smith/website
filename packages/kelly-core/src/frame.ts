// The only per-request work: one full frame of the background with the text
// on it. The GIF is [head: start frames][text frame][tail: hold frames + end
// frames].
//
// Every frame lasts the same 15cs, and the text is held by repeating frames
// rather than one long delay. WhatsApp (and likely other apps that turn GIFs
// into video) gives every frame the same duration, so a long delay plays as
// a single frame. kelly-v2 held the text with 25 identical frames for the
// same reason.
import { type Atlas, rasterise } from './atlas.ts';
import { DISPOSAL_KEEP, encodeIndexedFrame, writeFrame } from './gif.ts';
import { setEncodedPixel } from './lzw.ts';
import type { Template } from './templates.ts';

export const FRAME_DELAY = 15;
// frames after the text frame that keep it on screen, 25 frames in total
export const HOLD_FRAMES = 24;

// palette slot left free so frames can be transparent; the background uses
// 0-254
export const TRANSPARENT_INDEX = 255;

export interface TemplateAssets {
  atlas: Atlas;
  // background as palette indices, one byte per pixel
  background: Uint8Array;
  // from buildBlendTable
  blend: Uint8Array;
  // from backgroundFrame
  frame: Uint8Array;
}

// where writeFrame puts the pixel data: after the graphic control extension,
// image descriptor and 256-colour table
const FRAME_DATA_OFFSET = 8 + 10 + 256 * 3;

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

// Built at bake time: the background as a finished GIF frame, ready for
// renderTextFrame to copy and draw the text into
export const backgroundFrame = (
  template: Template,
  palette: Uint8Array,
  background: Uint8Array,
): Uint8Array<ArrayBuffer> =>
  writeFrame(
    encodeIndexedFrame(background, template.width, template.height, palette),
    { delay: FRAME_DELAY, disposal: DISPOSAL_KEEP },
  );

export const renderTextFrame = (
  template: Template,
  { atlas, background, blend, frame }: TemplateAssets,
  text: string,
): Uint8Array<ArrayBuffer> => {
  const out = frame.slice();
  const coverage = rasterise(
    atlas,
    template.matrix,
    template.layout(text, atlas),
    template,
  );
  if (!coverage) return out;

  const { left, top, width, height, alpha } = coverage;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = alpha[y * width + x];
      if (!a) continue;
      const i = (y + top) * template.width + x + left;
      setEncodedPixel(
        out,
        FRAME_DATA_OFFSET,
        i,
        blend[(background[i] << 8) | a],
      );
    }
  }
  return out;
};

// A 1x1 transparent frame: shows the previous frame for another FRAME_DELAY
// without repeating its pixels. Built at bake time.
export const holdFrame = (): Uint8Array<ArrayBuffer> => {
  const frame = encodeIndexedFrame(
    Uint8Array.of(TRANSPARENT_INDEX),
    1,
    1,
    new Uint8Array(768),
    TRANSPARENT_INDEX,
  );
  return writeFrame(frame, { delay: FRAME_DELAY, disposal: DISPOSAL_KEEP });
};
