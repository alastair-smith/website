import { describe, expect, it } from 'vitest';
import {
  concatBytes,
  encodeIndexedFrame,
  GIF_TRAILER,
  gifHeader,
  parseGif,
  writeFrame,
} from './gif.ts';

const palette = Uint8Array.from({ length: 768 }, (_, i) => i % 256);

const twoFrameGif = () =>
  concatBytes([
    gifHeader(4, 3),
    writeFrame(encodeIndexedFrame(new Uint8Array(12).fill(1), 4, 3, palette), {
      delay: 15,
      disposal: 1,
    }),
    writeFrame(encodeIndexedFrame(Uint8Array.of(2, 255), 2, 1, palette, 255), {
      delay: 373,
      disposal: 1,
      left: 1,
      top: 2,
    }),
    GIF_TRAILER,
  ]);

describe('gif', () => {
  it('writes a looping GIF89a with no global colour table', () => {
    const gif = twoFrameGif();
    expect(new TextDecoder().decode(gif.subarray(0, 6))).toBe('GIF89a');
    expect(gif[10] & 0x80).toBe(0);
    expect(new TextDecoder().decode(gif.subarray(16, 27))).toBe('NETSCAPE2.0');
    expect(gif.at(-1)).toBe(0x3b);
  });

  it('round trips frames through parseGif', () => {
    const { width, height, frames } = parseGif(twoFrameGif());
    expect([width, height]).toEqual([4, 3]);
    expect(frames).toHaveLength(2);

    const [, text] = frames;
    const gce = text.gce as Uint8Array;
    // delay
    expect(gce[4] | (gce[5] << 8)).toBe(373);
    // disposal "keep" and the transparency flag
    expect((gce[3] >> 2) & 7).toBe(1);
    expect(gce[3] & 1).toBe(1);
    expect(gce[6]).toBe(255);
    // position and size
    const d = text.descriptor;
    expect([d[1] | (d[2] << 8), d[3] | (d[4] << 8)]).toEqual([1, 2]);
    expect([d[5] | (d[6] << 8), d[7] | (d[8] << 8)]).toEqual([2, 1]);
    // local colour table of 256 entries
    expect(d[9] & 0x87).toBe(0x87);
    expect(text.table).toEqual(palette);
  });

  it('retimes frames without touching their pixels', () => {
    const [frame] = parseGif(twoFrameGif()).frames;
    const [retimed] = parseGif(
      concatBytes([
        gifHeader(4, 3),
        writeFrame(frame, { delay: 99 }),
        GIF_TRAILER,
      ]),
    ).frames;
    const gce = retimed.gce as Uint8Array;
    expect(gce[4] | (gce[5] << 8)).toBe(99);
    expect(retimed.data).toEqual(frame.data);
  });

  it('moves a global colour table onto each frame', () => {
    // hand-built GIF with a 2-colour global table and one 1x1 frame
    const signature = new TextEncoder().encode('GIF89a');
    const screen = [1, 0, 1, 0, 0x80, 0, 0];
    const globalTable = [10, 20, 30, 40, 50, 60];
    const descriptor = [0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0];
    const data = [2, 2, 0x44, 0x01, 0];
    const gif = Uint8Array.of(
      ...signature,
      ...screen,
      ...globalTable,
      ...descriptor,
      ...data,
      0x3b,
    );
    const [frame] = parseGif(gif).frames;
    expect(frame.table).toEqual(Uint8Array.of(10, 20, 30, 40, 50, 60));
    const written = writeFrame(frame, { delay: 15 });
    // GCE (8) then descriptor flags at byte 9 of the descriptor
    expect(written[8 + 9]).toBe(0x80);
  });
});
