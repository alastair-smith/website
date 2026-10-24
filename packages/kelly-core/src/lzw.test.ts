import { describe, expect, it } from 'vitest';
import { lzwEncode } from './lzw.ts';

// independent decoder, written from the GIF89a spec rather than the encoder
const lzwDecode = (data: Uint8Array, pixelCount: number): Uint8Array => {
  const minCodeSize = data[0];
  const bytes: number[] = [];
  let i = 1;
  while (data[i]) {
    bytes.push(...data.subarray(i + 1, i + 1 + data[i]));
    i += data[i] + 1;
  }
  expect(i).toBe(data.length - 1);

  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const out: number[] = [];
  let codeSize = minCodeSize + 1;
  let dictionary: number[][] = [];
  let previous: number[] | null = null;
  let bit = 0;

  const reset = () => {
    dictionary = Array.from({ length: clearCode }, (_, n) => [n]);
    dictionary.push([], []);
    codeSize = minCodeSize + 1;
    previous = null;
  };
  reset();

  while (bit + codeSize <= bytes.length * 8) {
    let code = 0;
    for (let b = 0; b < codeSize; b++, bit++) {
      code |= ((bytes[bit >> 3] >> (bit & 7)) & 1) << b;
    }
    if (code === clearCode) {
      reset();
      continue;
    }
    if (code === endCode) break;

    let entry: number[];
    if (code < dictionary.length) {
      entry = dictionary[code];
      if (previous) dictionary.push([...previous, entry[0]]);
    } else {
      if (!previous) throw new Error(`code ${code} before any entry`);
      const prev: number[] = previous;
      entry = [...prev, prev[0]];
      dictionary.push(entry);
    }
    out.push(...entry);
    previous = entry;
    if (dictionary.length === 1 << codeSize && codeSize < 12) codeSize++;
  }

  expect(out.length).toBe(pixelCount);
  return Uint8Array.from(out);
};

const roundTrip = (pixels: Uint8Array) =>
  expect(lzwDecode(lzwEncode(pixels), pixels.length)).toEqual(pixels);

describe('lzwEncode', () => {
  it('round trips a single pixel', () => {
    roundTrip(Uint8Array.of(42));
  });

  it('round trips a long run, which exercises the KwKwK case', () => {
    roundTrip(new Uint8Array(10_000).fill(7));
  });

  it('round trips noise, which fills the table and forces clears', () => {
    let seed = 1;
    const pixels = Uint8Array.from({ length: 200_000 }, () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed >> 16;
    });
    roundTrip(pixels);
  });

  it('round trips mostly transparent pixels with a few colours', () => {
    const pixels = new Uint8Array(241 * 182).fill(255);
    for (let i = 0; i < pixels.length; i += 13) pixels[i] = i % 40;
    roundTrip(pixels);
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
