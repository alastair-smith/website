// Does the expensive work once at build time so the Worker stays within the
// free plan's CPU limit: decodes the backgrounds, picks palettes, pre-encodes
// every frame that never changes and renders a glyph atlas per template.
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import zlib from 'node:zlib';
import {
  type AtlasGlyph,
  type AtlasSource,
  assetPaths,
  backgroundFrame,
  buildBlendTable,
  concatBytes,
  encodeAtlas,
  FRAME_DELAY,
  GIF_TRAILER,
  type GlyphMask,
  GZIP_SUFFIX,
  gifHeader,
  HOLD_FRAMES,
  holdFrame,
  parseGif,
  type Template,
  templates,
  writeFrame,
} from '@alastair-smith/kelly-core';
import * as fontkit from 'fontkit';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'dist/assets');

// sub-pixel positions per axis each glyph is pre-rendered at
const PHASES = 4;
const BACKGROUND_COLOURS = 239;
const TEXT_COLOURS = 16;

const font = fontkit.create(
  await fs.readFile(
    require.resolve(
      '@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff',
    ),
  ),
) as fontkit.Font;

const toRgba = async (image: ReturnType<typeof sharp>) =>
  new Uint8Array(await image.ensureAlpha().raw().toBuffer());

interface Colour {
  rgb: [number, number, number];
  pixels: number;
}

const distance = (a: Colour, b: Colour) =>
  (a.rgb[0] - b.rgb[0]) ** 2 +
  (a.rgb[1] - b.rgb[1]) ** 2 +
  (a.rgb[2] - b.rgb[2]) ** 2;

// Reduces an image to at most `colours` colours, returning them alongside
// each pixel's index into them
const quantise = async (
  rgba: Uint8Array,
  width: number,
  height: number,
  colours: number,
  dither: number,
) => {
  const png = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ palette: true, colours, dither, effort: 10 })
    .toBuffer();
  const reduced = await toRgba(sharp(png));

  const palette: Colour[] = [];
  const lookup = new Map<number, number>();
  const index = new Uint16Array(width * height);
  for (let i = 0; i < index.length; i++) {
    const [r, g, b] = reduced.subarray(i * 4, i * 4 + 3);
    const key = (r << 16) | (g << 8) | b;
    let n = lookup.get(key);
    if (n === undefined) {
      n = palette.length;
      lookup.set(key, n);
      palette.push({ rgb: [r, g, b], pixels: 0 });
    }
    palette[n].pixels++;
    index[i] = n;
  }

  // libvips rounds the colour limit up to a power of two (239 becomes 256),
  // so merge the closest pair of colours until it fits
  const mergedInto = palette.map((_, i) => i);
  const live = palette.map((_, i) => i);
  while (live.length > colours) {
    let best = [0, 1];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const d = distance(palette[live[i]], palette[live[j]]);
        if (d < bestDistance) {
          bestDistance = d;
          best = [i, j];
        }
      }
    }
    const keep = palette[live[best[0]]];
    const drop = palette[live[best[1]]];
    const total = keep.pixels + drop.pixels;
    keep.rgb = keep.rgb.map((c, k) =>
      Math.round((c * keep.pixels + drop.rgb[k] * drop.pixels) / total),
    ) as Colour['rgb'];
    keep.pixels = total;
    mergedInto[live[best[1]]] = live[best[0]];
    live.splice(best[1], 1);
  }

  const resolve = (n: number): number =>
    mergedInto[n] === n ? n : resolve(mergedInto[n]);
  const finalIndex = new Map(live.map((n, i) => [n, i]));
  return {
    palette: live.flatMap((n) => palette[n].rgb),
    index: Uint8Array.from(index, (n) => finalIndex.get(resolve(n)) as number),
  };
};

const padTo = (palette: number[], colours: number) =>
  [...palette, ...new Array(colours * 3).fill(0)].slice(0, colours * 3);

// The background's own colours, plus colours for the text anti-aliased over
// it. The last slot is left for transparency.
const buildPalette = async (template: Template, rgba: Uint8Array) => {
  const { width, height } = template;
  const background = await quantise(rgba, width, height, BACKGROUND_COLOURS, 1);

  const samples: number[] = [];
  for (let i = 0; i < rgba.length; i += 4 * 97) {
    for (let step = 1; step <= 8; step++) {
      const a = step / 8;
      for (let c = 0; c < 3; c++) {
        samples.push(Math.round(template.color[c] * a + rgba[i + c] * (1 - a)));
      }
      samples.push(255);
    }
  }
  const text = await quantise(
    Uint8Array.from(samples),
    samples.length / 4,
    1,
    TEXT_COLOURS,
    0,
  );

  return {
    palette: Uint8Array.from([
      ...padTo(background.palette, BACKGROUND_COLOURS),
      ...padTo(text.palette, TEXT_COLOURS),
      0,
      0,
      0,
    ]),
    background: background.index,
  };
};

const glyphMask = async (
  template: Template,
  glyph: fontkit.Glyph,
  phaseX: number,
  phaseY: number,
): Promise<GlyphMask> => {
  // font units are y-up, the canvas maths kelly-v2 used is y-down
  const scale = template.fontSize / font.unitsPerEm;
  const [a, b, c, d] = template.matrix;
  const m = [a * scale, b * scale, -c * scale, -d * scale];
  const originX = phaseX / PHASES;
  const originY = phaseY / PHASES;

  const points = glyph.path.commands.flatMap(({ args }) =>
    Array.from({ length: args.length / 2 }, (_, i) => [
      m[0] * args[i * 2] + m[2] * args[i * 2 + 1] + originX,
      m[1] * args[i * 2] + m[3] * args[i * 2 + 1] + originY,
    ]),
  );
  if (!points.length) {
    return {
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      alpha: new Uint8Array(),
    };
  }

  const offsetX = Math.floor(Math.min(...points.map((p) => p[0]))) - 1;
  const offsetY = Math.floor(Math.min(...points.map((p) => p[1]))) - 1;
  const width = Math.ceil(Math.max(...points.map((p) => p[0]))) + 1 - offsetX;
  const height = Math.ceil(Math.max(...points.map((p) => p[1]))) + 1 - offsetY;
  const rgba = await toRgba(
    sharp(
      Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path transform="matrix(${m.join(' ')} ${originX - offsetX} ${originY - offsetY})" d="${glyph.path.toSVG()}"/></svg>`,
      ),
    ),
  );
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
  return { width, height, offsetX, offsetY, alpha };
};

const buildAtlas = async (template: Template): Promise<AtlasSource> => {
  const scale = template.fontSize / font.unitsPerEm;
  const chars = font.characterSet
    .filter((code) => code >= 0x20 && !(code >= 0x7f && code <= 0x9f))
    .map((code) => String.fromCodePoint(code));

  const glyphs: AtlasGlyph[] = [];
  for (const char of chars) {
    const glyph = font.glyphForCodePoint(char.codePointAt(0) as number);
    const phases = Array.from({ length: PHASES * PHASES }, (_, i) =>
      glyphMask(template, glyph, i % PHASES, Math.floor(i / PHASES)),
    );
    glyphs.push({
      char,
      advance: glyph.advanceWidth * scale,
      masks: await Promise.all(phases),
    });
  }

  const kerning = (left: number, right: number) => {
    const run = font.layout(glyphs[left].char + glyphs[right].char);
    // ligatures like "fi" come back as one glyph, and we draw every
    // character on its own anyway
    if (run.glyphs.length !== 2) return 0;
    return run.positions[0].xAdvance * scale - glyphs[left].advance;
  };

  return {
    phases: PHASES,
    lineHeight:
      ((font.ascent - font.descent) / font.unitsPerEm) * template.fontSize,
    glyphs,
    kerning,
  };
};

const retime = (gif: Uint8Array) =>
  parseGif(gif).frames.map((frame) =>
    writeFrame(frame, { delay: FRAME_DELAY }),
  );

const kib = (bytes: Uint8Array) => `${Math.round(bytes.length / 1024)}KiB`;

const write = async (file: string, bytes: Uint8Array) => {
  const target = path.join(outDir, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  return kib(bytes);
};

// raw for the Worker, gzipped for browsers
const writeBoth = async (file: string, bytes: Uint8Array) => {
  const gzipped = zlib.gzipSync(bytes, { level: 9 });
  await write(file, bytes);
  await write(file + GZIP_SUFFIX, gzipped);
  return `${kib(bytes)} (${kib(gzipped)} gzipped)`;
};

for (const template of Object.values(templates)) {
  const started = performance.now();
  const paths = assetPaths(template.name);
  const source = async (file: string) =>
    new Uint8Array(
      await fs.readFile(path.join(root, 'assets', template.name, file)),
    );

  // stretched to the frame, like kelly-v2's drawImage
  const rgba = await toRgba(
    sharp(await source('background.jpg')).resize(
      template.width,
      template.height,
      {
        fit: 'fill',
      },
    ),
  );
  const { palette, background } = await buildPalette(template, rgba);

  const sizes = {
    head: await write(
      paths.head,
      concatBytes([
        gifHeader(template.width, template.height),
        ...retime(await source('start.gif')),
      ]),
    ),
    tail: await write(
      paths.tail,
      concatBytes([
        ...new Array(HOLD_FRAMES).fill(holdFrame()),
        ...retime(await source('end.gif')),
        GIF_TRAILER,
      ]),
    ),
    background: await writeBoth(paths.background, background),
    blend: await writeBoth(
      paths.blend,
      buildBlendTable(palette, template.color),
    ),
    frame: await writeBoth(
      paths.frame,
      backgroundFrame(template, palette, background),
    ),
    atlas: await writeBoth(
      paths.atlas,
      encodeAtlas(await buildAtlas(template)),
    ),
  };

  console.log(
    `${template.name}: baked in ${Math.round(performance.now() - started)}ms`,
    sizes,
  );
}
