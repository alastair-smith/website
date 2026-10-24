// LZW (Lempel-Ziv-Welch) is the compression GIF uses for every frame's pixels;
// a GIF can't store raw pixels, so encoding any new frame needs this. We only
// encode one small frame per request (the text), everything else is
// pre-encoded at build time and copied as-is. It lives here rather than in a
// dependency because the JS GIF encoders on npm have all gone unmaintained,
// and the algorithm is fixed by the 1989 GIF spec, so there's nothing to keep
// up with.
//
// How it works: frames are a list of palette indices (0-255). Codes 0-255
// mean "this single index". As we read pixels we grow a table of sequences
// we've already seen, each getting the next free code (258, 259, ...), so a
// repeated run like a long stretch of transparent pixels becomes one code.
// The decoder rebuilds the same table as it reads, so the table itself is
// never stored.
//
// GIF-specific details:
// - two reserved codes: CLEAR (256) restarts the table, END (257) ends the
//   data
// - codes are variable width: they start at 9 bits and grow by one bit each
//   time the table outgrows the current width, up to 12 bits (4096 entries);
//   when the table is full we emit CLEAR and start over
// - codes are packed least-significant-bit first, then split into
//   "sub-blocks" of at most 255 bytes, each prefixed with its length
//
// This follows the classic Unix `compress` encoder that GIF was specified
// against, including its table: every sequence is "an existing code plus one
// more pixel", stored in a fixed-size hash table of typed arrays rather than
// a Map. That keeps it fast even before the JS engine has warmed up, which
// matters because a quiet Worker often serves a request from a fresh start.
// The decoder in lzw.test.ts is written independently from the spec to check
// it.

const MAX_CODE = 4096;
// prime, and comfortably bigger than 4096 entries so probes stay short
const HASH_SIZE = 5003;
const HASH_SHIFT = 4;

// Returns the image data block: minimum code size, then the codes packed
// LSB-first into sub-blocks of up to 255 bytes, then a zero terminator.
export const lzwEncode = (
  index: Uint8Array,
  minCodeSize = 8,
): Uint8Array<ArrayBuffer> => {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  // (prefix code, next pixel) packed into one number, and the code for it
  const keys = new Int32Array(HASH_SIZE).fill(-1);
  const codes = new Int16Array(HASH_SIZE);

  // worst case is one 12-bit code per pixel
  const packed = new Uint8Array(Math.ceil(((index.length + 3) * 12) / 8) + 1);
  let length = 0;
  let bitBuffer = 0;
  let bitCount = 0;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;

  const emit = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      packed[length++] = bitBuffer & 0xff;
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
    if (nextCode > (1 << codeSize) - 1 && codeSize < 12) codeSize++;
  };

  emit(clearCode);
  if (index.length) {
    let prefix = index[0];
    pixels: for (let p = 1; p < index.length; p++) {
      const pixel = index[p];
      const key = (pixel << 12) + prefix;
      let slot = (pixel << HASH_SHIFT) ^ prefix;

      if (keys[slot] === key) {
        prefix = codes[slot];
        continue;
      }
      if (keys[slot] >= 0) {
        // collision: step backwards through the table until we find the key
        // or an empty slot
        const step = slot === 0 ? 1 : HASH_SIZE - slot;
        do {
          slot -= step;
          if (slot < 0) slot += HASH_SIZE;
          if (keys[slot] === key) {
            prefix = codes[slot];
            continue pixels;
          }
        } while (keys[slot] >= 0);
      }

      // a sequence we haven't seen: write out the longest one we had, and
      // remember it with this pixel on the end
      emit(prefix);
      if (nextCode < MAX_CODE) {
        codes[slot] = nextCode++;
        keys[slot] = key;
      } else {
        emit(clearCode);
        keys.fill(-1);
        nextCode = endCode + 1;
        codeSize = minCodeSize + 1;
      }
      prefix = pixel;
    }
    emit(prefix);
  }
  emit(endCode);
  if (bitCount > 0) packed[length++] = bitBuffer & 0xff;

  const out = new Uint8Array(1 + length + Math.ceil(length / 255) + 1);
  out[0] = minCodeSize;
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
