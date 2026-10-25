// Just enough of the GIF format to splice pre-encoded frames together, which
// is what kelly-v2 shelled out to `gifsicle --merge` for.
import { lzwEncode } from './lzw.ts';

export interface GifFrame {
  gce: Uint8Array | null;
  descriptor: Uint8Array;
  table: Uint8Array;
  bits: number;
  data: Uint8Array;
}

export interface Gif {
  width: number;
  height: number;
  frames: GifFrame[];
}

export const parseGif = (b: Uint8Array): Gif => {
  const u16 = (i: number) => b[i] | (b[i + 1] << 8);
  const flags = b[10];
  const gctSize = flags & 0x80 ? 3 * 2 ** ((flags & 7) + 1) : 0;
  const gct = b.subarray(13, 13 + gctSize);
  const frames: GifFrame[] = [];
  let i = 13 + gctSize;
  let gce: Uint8Array | null = null;

  const skipSubBlocks = () => {
    while (b[i]) i += b[i] + 1;
    i++;
  };

  while (i < b.length && b[i] !== 0x3b) {
    if (b[i] === 0x21) {
      const start = i;
      const label = b[i + 1];
      i += 2;
      skipSubBlocks();
      if (label === 0xf9) gce = b.slice(start, i);
    } else if (b[i] === 0x2c) {
      const descriptor = b.slice(i, i + 10);
      const localFlags = b[i + 9];
      i += 10;
      let table = gct;
      let bits = flags & 7;
      if (localFlags & 0x80) {
        bits = localFlags & 7;
        table = b.subarray(i, i + 3 * 2 ** (bits + 1));
        i += table.length;
      }
      const dataStart = i;
      i++; // LZW minimum code size
      skipSubBlocks();
      frames.push({
        gce,
        descriptor,
        table,
        bits,
        data: b.subarray(dataStart, i),
      });
      gce = null;
    } else {
      throw new Error(`Unexpected GIF block 0x${b[i].toString(16)} at ${i}`);
    }
  }

  return { width: u16(6), height: u16(8), frames };
};

export const concatBytes = (parts: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const setU16 = (bytes: Uint8Array, at: number, value: number) => {
  bytes[at] = value & 0xff;
  bytes[at + 1] = value >> 8;
};

export const DISPOSAL_KEEP = 1;

// Every frame gets its own colour table, so frames from GIFs with different
// palettes can share a file.
export const writeFrame = (
  frame: GifFrame,
  opts: { delay: number; disposal?: number; left?: number; top?: number },
): Uint8Array<ArrayBuffer> => {
  const gce = frame.gce?.slice() ?? Uint8Array.of(0x21, 0xf9, 4, 0, 0, 0, 0, 0);
  setU16(gce, 4, opts.delay);
  if (opts.disposal !== undefined) {
    gce[3] = (gce[3] & ~0x1c) | (opts.disposal << 2);
  }

  const descriptor = frame.descriptor.slice();
  if (opts.left !== undefined) setU16(descriptor, 1, opts.left);
  if (opts.top !== undefined) setU16(descriptor, 3, opts.top);
  descriptor[9] = (descriptor[9] & 0x40) | 0x80 | frame.bits;

  return concatBytes([gce, descriptor, frame.table, frame.data]);
};

// Header with no global colour table, looping forever
export const gifHeader = (
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> => {
  const header = new Uint8Array(13);
  header.set(new TextEncoder().encode('GIF89a'));
  setU16(header, 6, width);
  setU16(header, 8, height);
  header[10] = 0x70;
  const loop = Uint8Array.of(
    0x21,
    0xff,
    11,
    ...new TextEncoder().encode('NETSCAPE2.0'),
    3,
    1,
    0,
    0,
    0,
  );
  return concatBytes([header, loop]);
};

export const GIF_TRAILER = Uint8Array.of(0x3b);

// `palette` is 256 RGB triples
export const encodeIndexedFrame = (
  index: Uint8Array,
  width: number,
  height: number,
  palette: Uint8Array,
  transparentIndex?: number,
): GifFrame => {
  const gce = Uint8Array.of(0x21, 0xf9, 4, 0, 0, 0, transparentIndex ?? 0, 0);
  if (transparentIndex !== undefined) gce[3] |= 1;
  const descriptor = new Uint8Array(10);
  descriptor[0] = 0x2c;
  setU16(descriptor, 5, width);
  setU16(descriptor, 7, height);
  return { gce, descriptor, table: palette, bits: 7, data: lzwEncode(index) };
};
