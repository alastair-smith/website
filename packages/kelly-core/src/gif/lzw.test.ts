import { describe, expect, it } from 'vitest';
import { getEncodedPixel, lzwEncode, setEncodedPixel } from './lzw.ts';
import { lzwDecode } from './lzwDecode.testing.ts';

const roundTrip = (pixels: Uint8Array) =>
  expect(lzwDecode(lzwEncode(pixels))).toEqual(pixels);

describe('lzwEncode', () => {
  it('round trips a single pixel', () => {
    roundTrip(Uint8Array.of(42));
  });

  it('round trips a long run of one colour', () => {
    roundTrip(new Uint8Array(10_000).fill(7));
  });

  it('round trips a full frame of noise, through many table resets', () => {
    let seed = 1;
    const pixels = Uint8Array.from({ length: 480 * 360 }, () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed >> 16;
    });
    roundTrip(pixels);
  });

  it('round trips lengths either side of a table reset', () => {
    for (const length of [249, 250, 251, 500, 501]) {
      roundTrip(Uint8Array.from({ length }, (_, i) => i % 256));
    }
  });

  it('changes single pixels in place, across sub-block boundaries', () => {
    const pixels = Uint8Array.from({ length: 480 * 360 }, (_, i) => i % 239);
    // offset to check it respects where the data starts
    const data = lzwEncode(pixels);
    const encoded = new Uint8Array(3 + data.length).fill(9);
    encoded.set(data, 3);
    const expected = pixels.slice();
    let seed = 7;
    for (let n = 0; n < 5000; n++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const pixel = seed % pixels.length;
      const value = (seed >> 8) & 0xff;
      expected[pixel] = value;
      setEncodedPixel(encoded, 3, pixel, value);
    }
    expect(lzwDecode(encoded.subarray(3))).toEqual(expected);

    // then every pixel, so every reset and sub-block boundary is crossed
    for (let pixel = 0; pixel < pixels.length; pixel++) {
      expected[pixel] = 255 - expected[pixel];
      setEncodedPixel(encoded, 3, pixel, expected[pixel]);
    }
    expect(encoded.subarray(0, 3)).toEqual(Uint8Array.of(9, 9, 9));
    expect(lzwDecode(encoded.subarray(3))).toEqual(expected);
  });

  it('reads single pixels back', () => {
    const pixels = Uint8Array.from({ length: 480 * 360 }, (_, i) => i % 256);
    const encoded = lzwEncode(pixels);
    for (let pixel = 0; pixel < pixels.length; pixel++) {
      expect(getEncodedPixel(encoded, 0, pixel)).toBe(pixels[pixel]);
    }
  });

  it('splits data into sub-blocks of at most 255 bytes', () => {
    const data = lzwEncode(
      Uint8Array.from({ length: 5000 }, (_, i) => i % 251),
    );
    let i = 1;
    while (data[i]) {
      expect(data[i]).toBeLessThanOrEqual(255);
      i += data[i] + 1;
    }
  });
});
