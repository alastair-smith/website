import { describe, expect, it } from 'vitest';
import { testAtlas as atlas } from './atlas.testing.ts';
import { type Matrix, measure, rasterise } from './atlas.ts';

const identity: Matrix = [1, 0, 0, 1, 0, 0];
const bounds = { width: 100, height: 100 };

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
      bounds,
    );
    expect(coverage).toMatchObject({ left: 10, top: 18, width: 17, height: 2 });
  });

  it('clips to the frame and gives up on text that misses it', () => {
    expect(
      rasterise(atlas, identity, [{ text: 'C', x: -1, y: 5 }], bounds),
    ).toMatchObject({ left: 0, width: 1 });
    expect(
      rasterise(atlas, identity, [{ text: 'C', x: 500, y: 5 }], bounds),
    ).toBeNull();
    expect(
      rasterise(atlas, identity, [{ text: '   ', x: 5, y: 5 }], bounds),
    ).toBeNull();
  });
});
