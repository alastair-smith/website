// Build-time helpers for apps/kelly-v3/scripts/bake.ts, which prepares
// everything in kelly.ts's assetPaths.
//
// Every frame lasts the same 15cs, and the text is held by repeating frames
// rather than one long delay. WhatsApp (and likely other apps that turn GIFs
// into video) gives every frame the same duration, so a long delay plays as
// a single frame. kelly-v2 held the text with 25 identical frames for the
// same reason.
import {
  concatBytes,
  DISPOSAL_KEEP,
  encodeIndexedFrame,
  GIF_TRAILER,
  gifHeader,
  parseGif,
  writeFrame,
} from './gif/format.ts';
import type { Template } from './templates.ts';

const FRAME_DELAY = 15;
// frames after the text frame that keep it on screen, 25 frames in total
const HOLD_FRAMES = 24;

const retime = (gif: Uint8Array) =>
  parseGif(gif).frames.map((frame) =>
    writeFrame(frame, { delay: FRAME_DELAY }),
  );

// A 1x1 transparent frame, so the text frame stays on screen for another
// FRAME_DELAY without repeating its pixels
const holdFrame = () =>
  writeFrame(
    encodeIndexedFrame(Uint8Array.of(0), 1, 1, new Uint8Array(256 * 3), 0),
    { delay: FRAME_DELAY, disposal: DISPOSAL_KEEP },
  );

export const startFrames = (template: Template, startGif: Uint8Array) =>
  concatBytes([
    gifHeader(template.width, template.height),
    ...retime(startGif),
  ]);

export const endFrames = (endGif: Uint8Array) =>
  concatBytes([
    ...new Array(HOLD_FRAMES).fill(holdFrame()),
    ...retime(endGif),
    GIF_TRAILER,
  ]);

// `palette` is 256 RGB triples and `background` one palette index per pixel
export const blankFrame = (
  template: Template,
  palette: Uint8Array,
  background: Uint8Array,
) =>
  writeFrame(
    encodeIndexedFrame(background, template.width, template.height, palette),
    { delay: FRAME_DELAY, disposal: DISPOSAL_KEEP },
  );

const nearest = (palette: Uint8Array, r: number, g: number, b: number) => {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < palette.length / 3; i++) {
    const distance =
      (palette[i * 3] - r) ** 2 +
      (palette[i * 3 + 1] - g) ** 2 +
      (palette[i * 3 + 2] - b) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
};

// The palette colour closest to the text drawn at each alpha over each
// background colour, so drawing text is a lookup rather than a search
export const blendTable = (palette: Uint8Array, template: Template) => {
  const [tr, tg, tb] = template.color;
  const table = new Uint8Array(256 * 256);
  for (let bg = 0; bg < 256; bg++) {
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
