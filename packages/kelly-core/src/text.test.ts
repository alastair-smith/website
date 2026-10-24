import { describe, expect, it } from 'vitest';
import {
  type AtlasGlyph,
  decodeAtlas,
  encodeAtlas,
  type Matrix,
  measure,
  rasterise,
} from './atlas.ts';
import {
  backgroundFrame,
  buildBlendTable,
  FRAME_DELAY,
  holdFrame,
  renderTextFrame,
  TRANSPARENT_INDEX,
} from './frame.ts';
import { concatBytes, GIF_TRAILER, gifHeader, parseGif } from './gif.ts';
import { templates, wrapPotterText } from './templates.ts';
import { lzwDecode } from './testing/lzwDecode.ts';

// every glyph is a solid 2x2 block, 10px wide, with one sub-pixel phase
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

const atlas = decodeAtlas(
  encodeAtlas({
    phases: 1,
    lineHeight: 12,
    glyphs: [...' ?ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(glyph),
    kerning: (left, right) => (left === 2 && right === 3 ? -1.5 : 0),
  }),
);

const identity: Matrix = [1, 0, 0, 1, 0, 0];

describe('atlas', () => {
  it('round trips through the binary format', () => {
    expect(atlas.lineHeight).toBe(12);
    expect(atlas.advance(atlas.glyph('A'))).toBe(10);
    expect(atlas.kerning(atlas.glyph('A'), atlas.glyph('B'))).toBe(-1.5);
    expect(atlas.mask(atlas.glyph('A'), 0).alpha).toEqual(
      new Uint8Array(4).fill(255),
    );
  });

  it('falls back to "?" for characters it lacks', () => {
    expect(atlas.glyph('🎉')).toBe(atlas.glyph('?'));
  });

  it('measures with kerning', () => {
    expect(measure(atlas, 'AB')).toBe(18.5);
    expect(measure(atlas, 'BA')).toBe(20);
  });

  it('rasterises only the area the text covers', () => {
    const coverage = rasterise(
      atlas,
      identity,
      [{ text: 'C C', x: 10, y: 20 }],
      {
        width: 100,
        height: 100,
      },
    );
    expect(coverage).toMatchObject({ left: 10, top: 18, width: 17, height: 2 });
  });

  it('clips to the frame and gives up on text that misses it', () => {
    const bounds = { width: 100, height: 100 };
    expect(
      rasterise(atlas, identity, [{ text: 'C', x: -1, y: 5 }], bounds),
    ).toMatchObject({
      left: 0,
      width: 1,
    });
    expect(
      rasterise(atlas, identity, [{ text: 'C', x: 500, y: 5 }], bounds),
    ).toBeNull();
    expect(
      rasterise(atlas, identity, [{ text: '   ', x: 5, y: 5 }], bounds),
    ).toBeNull();
  });
});

describe('templates', () => {
  it('crops kelly text to the spreadsheet cell', () => {
    const [line] = templates.kelly.layout('A'.repeat(100), atlas);
    expect(line.text).toBe('A'.repeat(58));
  });

  it("wraps potter text like kelly-v2's insertNewlines", () => {
    expect(
      wrapPotterText('Nice earmuffs potter, did your mum make them for you?'),
    ).toEqual({
      result: 'Nice earmuffs\npotter, did your mum\nmake them for you?',
      lineCount: 2,
    });
    expect(wrapPotterText('a'.repeat(25)).result).toBe(
      `${'a'.repeat(19)}-\n${'a'.repeat(6)}`,
    );
  });

  it('stops potter text at nine lines', () => {
    const { lineCount } = wrapPotterText('word '.repeat(200));
    expect(lineCount).toBe(9);
  });
});

describe('renderTextFrame', () => {
  const palette = new Uint8Array(768);
  palette.set([10, 20, 30], 0);
  palette.set([0x00, 0x49, 0xaf], 3);
  const background = new Uint8Array(480 * 360);
  const assets = {
    atlas,
    background,
    blend: buildBlendTable(palette, templates.kelly.color),
    frame: backgroundFrame(templates.kelly, palette, background),
  };

  it('blends solid text to the text colour', () => {
    expect(assets.blend[(0 << 8) | 255]).toBe(1);
  });

  const frameFrom = (bytes: Uint8Array) =>
    parseGif(concatBytes([gifHeader(480, 360), bytes, GIF_TRAILER])).frames[0];

  it('encodes a full, opaque frame with the text on the background', () => {
    const frame = frameFrom(renderTextFrame(templates.kelly, assets, 'HI'));
    const gce = frame.gce as Uint8Array;
    expect(gce[4] | (gce[5] << 8)).toBe(FRAME_DELAY);
    expect(gce[3] & 1).toBe(0);
    const d = frame.descriptor;
    expect([d[5] | (d[6] << 8), d[7] | (d[8] << 8)]).toEqual([480, 360]);

    const pixels = lzwDecode(frame.data);
    expect(pixels).toHaveLength(480 * 360);
    const text = [...pixels.keys()].filter((i) => pixels[i] === 1);
    // two 2x2 glyphs, squashed and rotated like the kelly still
    expect(text.length).toBeGreaterThan(0);
    expect(text.length).toBeLessThanOrEqual(8);
    // kelly text starts left of centre and near the top of the frame
    const [x, y] = [text[0] % 480, Math.floor(text[0] / 480)];
    expect(x).toBeGreaterThan(100);
    expect(x).toBeLessThan(240);
    expect(y).toBeLessThan(100);
    expect(pixels.filter((p) => p !== 0 && p !== 1)).toHaveLength(0);
  });

  it('holds the previous frame with a transparent pixel', () => {
    const frame = frameFrom(holdFrame());
    const gce = frame.gce as Uint8Array;
    expect(gce[4] | (gce[5] << 8)).toBe(FRAME_DELAY);
    expect(gce[3] & 1).toBe(1);
    expect(lzwDecode(frame.data)).toEqual(Uint8Array.of(TRANSPARENT_INDEX));
  });
});
