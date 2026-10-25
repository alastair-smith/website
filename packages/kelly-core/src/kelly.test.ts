import { describe, expect, it } from 'vitest';
import { blankFrame, blendTable, endFrames, startFrames } from './bake.ts';
import {
  concatBytes,
  encodeIndexedFrame,
  GIF_TRAILER,
  gifHeader,
  parseGif,
  writeFrame,
} from './gif/format.ts';
import { lzwDecode } from './gif/lzwDecode.testing.ts';
import { assetPaths, createKelly, drawText } from './kelly.ts';
import { templates } from './templates.ts';
import { testAtlas, testAtlasBytes } from './text/atlas.testing.ts';

const template = templates.kelly;

// colour 0 is the whole background, colour 1 is the text colour
const palette = new Uint8Array(256 * 3);
palette.set([10, 20, 30], 0);
palette.set(template.color, 3);
const background = new Uint8Array(template.width * template.height);

// a 2-frame GIF standing in for the start and end clips, with a different
// delay that baking should even out
const clipFrame = writeFrame(
  encodeIndexedFrame(Uint8Array.of(0), 1, 1, palette),
  { delay: 10 },
);
const clip = concatBytes([
  gifHeader(template.width, template.height),
  clipFrame,
  clipFrame,
  GIF_TRAILER,
]);

const assets = {
  start: startFrames(template, clip),
  end: endFrames(clip),
  blankFrame: blankFrame(template, palette, background),
  blend: blendTable(palette, template),
  atlas: testAtlas,
};

const delayOf = (gce: Uint8Array | null) => (gce ? gce[4] | (gce[5] << 8) : 0);

const pixelsOf = (frame: Uint8Array) =>
  lzwDecode(
    parseGif(concatBytes([gifHeader(480, 360), frame, GIF_TRAILER])).frames[0]
      .data,
  );

describe('drawText', () => {
  it('blends solid text to the text colour', () => {
    expect(assets.blend[(0 << 8) | 255]).toBe(1);
  });

  it('draws the text into a copy of the blank frame', () => {
    const pixels = pixelsOf(drawText('kelly', assets, 'HI'));
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

    // and leaves the blank frame alone
    expect(pixelsOf(assets.blankFrame)).toEqual(background);
  });
});

describe('createKelly', () => {
  const paths = assetPaths('kelly');
  const files: Record<string, Uint8Array<ArrayBuffer>> = {
    [paths.start]: assets.start,
    [paths.end]: assets.end,
    [paths.blankFrame]: assets.blankFrame,
    [paths.blend]: assets.blend,
    [paths.atlas]: testAtlasBytes,
  };
  let fetches = 0;
  const kelly = createKelly(async (path) => {
    fetches++;
    return files[path];
  });

  it('stitches the start, the text frame and the end into one GIF', async () => {
    const gif = parseGif(concatBytes(await kelly.render('kelly', 'HI')));
    // 2 start frames, the text held for 25 frames and 2 end frames
    expect(gif.frames).toHaveLength(29);
    // apps that turn GIFs into video give every frame the same duration, so
    // every frame needs the same delay
    expect(new Set(gif.frames.map(({ gce }) => delayOf(gce)))).toEqual(
      new Set([15]),
    );
  });

  it('only fetches each file once', async () => {
    await kelly.render('kelly', 'AGAIN');
    expect(fetches).toBe(Object.keys(assetPaths('kelly')).length);
  });

  it('renders from the files a preload fetched', async () => {
    let preloadFetches = 0;
    const preloaded = createKelly(async (path) => {
      preloadFetches++;
      return files[path];
    });
    preloaded.preload('kelly');
    expect(preloadFetches).toBe(Object.keys(paths).length);

    await preloaded.render('kelly', 'HI');
    expect(preloadFetches).toBe(Object.keys(paths).length);
  });

  it('rejects text that is empty once cleaned', async () => {
    await expect(kelly.render('kelly', '\n')).rejects.toThrow();
  });
});
