// LZW decoder for tests, written from the GIF89a spec rather than from the
// encoder so it can check it. Handles compressed data too, not just what
// lzwEncode writes.
export const lzwDecode = (data: Uint8Array): Uint8Array => {
  const minCodeSize = data[0];
  const bytes: number[] = [];
  let i = 1;
  while (data[i]) {
    bytes.push(...data.subarray(i + 1, i + 1 + data[i]));
    i += data[i] + 1;
  }
  if (i !== data.length - 1) throw new Error('Data after the terminator');

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
    if (code === endCode) return Uint8Array.from(out);

    let entry: number[];
    if (code < dictionary.length) {
      entry = dictionary[code];
      if (previous) dictionary.push([...previous, entry[0]]);
    } else {
      if (!previous) throw new Error(`Code ${code} before any entry`);
      const prev: number[] = previous;
      entry = [...prev, prev[0]];
      dictionary.push(entry);
    }
    out.push(...entry);
    previous = entry;
    if (dictionary.length === 1 << codeSize && codeSize < 12) codeSize++;
  }

  throw new Error('No END code');
};
