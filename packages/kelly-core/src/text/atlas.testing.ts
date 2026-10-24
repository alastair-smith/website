// A tiny atlas for tests: every character is a solid 2x2 block 10px wide,
// with one sub-pixel position, and "A" kerns into "B"
import { type AtlasGlyph, decodeAtlas, encodeAtlas } from './atlas.ts';

const glyph = (char: string): AtlasGlyph => ({
  char,
  advance: char === ' ' ? 5 : 10,
  masks: [
    char === ' '
      ? { width: 0, height: 0, offsetX: 0, offsetY: 0, alpha: new Uint8Array() }
      : {
          width: 2,
          height: 2,
          offsetX: 0,
          offsetY: -2,
          alpha: new Uint8Array(4).fill(255),
        },
  ],
});

export const testAtlasBytes = encodeAtlas({
  phases: 1,
  lineHeight: 12,
  glyphs: [...' ?ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(glyph),
  kerning: (left, right) => (left === 2 && right === 3 ? -1.5 : 0),
});

export const testAtlas = decodeAtlas(testAtlasBytes);
