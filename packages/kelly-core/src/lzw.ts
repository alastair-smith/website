// GIF stores every frame's pixels as LZW (Lempel-Ziv-Welch) compressed data,
// so writing any new frame needs an LZW encoder. We only write one new frame
// per request, everything else is pre-encoded at build time and copied as-is.
// It lives here rather than in a dependency because the JS GIF encoders on
// npm have all gone unmaintained, and the format is fixed by the 1989 GIF
// spec, so there's nothing to keep up with.
//
// How LZW normally works: frames are a list of palette indices (0-255). Codes
// 0-255 mean "this single index". As the encoder reads pixels it grows a table
// of sequences it has already seen, each getting the next free code (258,
// 259, ...), so a repeated run becomes one code. The decoder rebuilds the
// same table as it reads, so the table itself is never stored.
//
// We deliberately don't compress. Building that table for a whole 480x360
// frame takes ~11ms on a cold Worker, over the free plan's 10ms CPU limit.
// Instead we only ever write single-pixel codes, and send CLEAR (which resets
// the table) before the decoder's table would grow enough to widen the codes
// past 9 bits. Every decoder reads this as normal LZW. The cost is size: ~9
// bits a pixel, so ~190KB for a Kelly frame rather than ~80KB compressed, in
// a GIF of over 2MB.
//
// The payoff is that every pixel's code sits at a fixed position. So the
// background frame is encoded once at build time, and a request copies it and
// overwrites just the pixels under the text with setEncodedPixel.
//
// GIF-specific details:
// - two reserved codes: CLEAR (256) restarts the table, END (257) ends the
//   data
// - after CLEAR codes are 9 bits, and the decoder widens them once its table
//   reaches 512 entries; it adds an entry for every code after the first, so
//   we CLEAR well before that
// - codes are packed least-significant-bit first, then split into
//   "sub-blocks" of at most 255 bytes, each prefixed with its length
//
// The decoder in lzw.test.ts is written independently from the spec to check
// this.

const MIN_CODE_SIZE = 8;
const CODE_SIZE = MIN_CODE_SIZE + 1;
const CLEAR_CODE = 1 << MIN_CODE_SIZE;
const END_CODE = CLEAR_CODE + 1;
// the table starts at 258 entries and widens at 512, so 254 codes is the
// real limit; leave room for decoders that widen one entry early
const CODES_PER_CLEAR = 250;

// Returns the image data block: minimum code size, then the codes packed into
// sub-blocks of up to 255 bytes, then a zero terminator.
export const lzwEncode = (index: Uint8Array): Uint8Array<ArrayBuffer> => {
  const codeCount =
    index.length + Math.ceil(index.length / CODES_PER_CLEAR) + 2;
  const packed = new Uint8Array(Math.ceil((codeCount * CODE_SIZE) / 8));
  let length = 0;
  let bitBuffer = 0;
  let bitCount = 0;

  const emit = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += CODE_SIZE;
    while (bitCount >= 8) {
      packed[length++] = bitBuffer & 0xff;
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };

  for (let i = 0; i < index.length; i++) {
    if (i % CODES_PER_CLEAR === 0) emit(CLEAR_CODE);
    emit(index[i]);
  }
  if (!index.length) emit(CLEAR_CODE);
  emit(END_CODE);
  if (bitCount > 0) packed[length++] = bitBuffer & 0xff;

  const out = new Uint8Array(1 + length + Math.ceil(length / 255) + 1);
  out[0] = MIN_CODE_SIZE;
  let offset = 1;
  for (let i = 0; i < length; i += 255) {
    const block = packed.subarray(i, Math.min(i + 255, length));
    out[offset++] = block.length;
    out.set(block, offset);
    offset += block.length;
  }
  out[offset] = 0;
  return out;
};

// Changes one pixel in data written by lzwEncode, in place. `offset` is where
// the data block starts in `bytes`.
export const setEncodedPixel = (
  bytes: Uint8Array,
  offset: number,
  pixel: number,
  value: number,
) => {
  // one CLEAR before every CODES_PER_CLEAR pixels, starting with the first
  const code = pixel + Math.floor(pixel / CODES_PER_CLEAR) + 1;
  let bit = code * CODE_SIZE;
  let written = 0;
  // a code spans two or three bytes, which may sit either side of a
  // sub-block's length byte
  while (written < CODE_SIZE) {
    const packedByte = bit >> 3;
    const at = offset + 2 + packedByte + Math.floor(packedByte / 255);
    const shift = bit & 7;
    const count = Math.min(8 - shift, CODE_SIZE - written);
    const mask = ((1 << count) - 1) << shift;
    bytes[at] = (bytes[at] & ~mask) | (((value >> written) << shift) & mask);
    bit += count;
    written += count;
  }
};
