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
  buildBlendTable,
  renderTextFrame,
  TEXT_DELAY,
  TRANSPARENT_INDEX,
} from './frame.ts';
import { concatBytes, GIF_TRAILER, gifHeader, parseGif } from './gif.ts';
import { templates, wrapPotterText } from './templates.ts';

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
  const assets = {
    atlas,
    palette,
    background: new Uint8Array(480 * 360),
    blend: buildBlendTable(palette, templates.kelly.color),
  };

  it('blends solid text to the text colour', () => {
    expect(assets.blend[(0 << 8) | 255]).toBe(1);
  });

  it('encodes a transparent frame positioned over the text', () => {
    const bytes = renderTextFrame(templates.kelly, assets, 'HI');
    const [frame] = parseGif(
      concatBytes([gifHeader(480, 360), bytes, GIF_TRAILER]),
    ).frames;
    const gce = frame.gce as Uint8Array;
    expect(gce[4] | (gce[5] << 8)).toBe(TEXT_DELAY);
    expect(gce[3] & 1).toBe(1);
    expect(gce[6]).toBe(TRANSPARENT_INDEX);
    const d = frame.descriptor;
    const left = d[1] | (d[2] << 8);
    const top = d[3] | (d[4] << 8);
    // kelly text starts left of centre and near the top of the frame
    expect(left).toBeGreaterThan(100);
    expect(left).toBeLessThan(240);
    expect(top).toBeLessThan(100);
  });
});
