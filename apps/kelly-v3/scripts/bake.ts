// Prepares everything in kelly-core's assetPaths, so drawing a GIF at request
// time is cheap enough for the Worker's 10ms CPU limit: re-times the start
// and end GIFs, picks a palette, encodes the blank frame, and pre-draws every
// character for the glyph atlas.
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  type AtlasGlyph,
  type AtlasSource,
  assetPaths,
  blankFrame,
  blendTable,
  encodeAtlas,
  endFrames,
  type GlyphMask,
  startFrames,
  type Template,
  templates,
} from '@alastair-smith/kelly-core';
import * as fontkit from 'fontkit';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'dist/assets');

// sub-pixel positions per axis each character is pre-drawn at, so spacing
// stays even
const PHASES = 2;

const font = fontkit.create(
  await fs.readFile(
    require.resolve(
      '@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff',
    ),
  ),
) as fontkit.Font;

const toRgba = async (image: ReturnType<typeof sharp>) =>
  new Uint8Array(await image.ensureAlpha().raw().toBuffer());

// A 256-colour palette covering the background and the text's anti-aliased
// edges over it, and the background as indices into that palette
const buildPalette = async (template: Template, background: Uint8Array) => {
  const { width, height } = template;

  // the text colour blended over a spread of background pixels
  const edges: number[] = [];
  for (let i = 0; i < background.length; i += 4 * 97) {
    for (let step = 1; step <= 8; step++) {
      const a = step / 8;
      for (let c = 0; c < 3; c++) {
        edges.push(
          Math.round(template.color[c] * a + background[i + c] * (1 - a)),
        );
      }
      edges.push(255);
    }
  }
  // sharp wants a rectangle, so pad the edge samples out to whole rows
  const edgeRows = Math.ceil(edges.length / 4 / width);
  const image = new Uint8Array((height + edgeRows) * width * 4);
  image.set(background);
  image.set(edges, background.length);

  const png = await sharp(image, {
    raw: { width, height: height + edgeRows, channels: 4 },
  })
    .png({ palette: true, colours: 256, effort: 10 })
    .toBuffer();
  const quantised = await toRgba(sharp(png));

  const palette = new Uint8Array(256 * 3);
  const lookup = new Map<number, number>();
  const indexOf = (i: number) => {
    const [r, g, b] = quantised.subarray(i * 4, i * 4 + 3);
    const key = (r << 16) | (g << 8) | b;
    let n = lookup.get(key);
    if (n === undefined) {
      n = lookup.size;
      lookup.set(key, n);
      palette.set([r, g, b], n * 3);
    }
    return n;
  };
  const indices = Uint8Array.from({ length: width * height }, (_, i) =>
    indexOf(i),
  );
  // the edge colours belong in the palette even where the background
  // doesn't use them
  for (let i = width * height; i < quantised.length / 4; i++) indexOf(i);

  return { palette, background: indices };
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

const write = async (file: string, bytes: Uint8Array) => {
  const target = path.join(outDir, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  return `${Math.round(bytes.length / 1024)}KiB`;
};

for (const template of Object.values(templates)) {
  const started = performance.now();
  const paths = assetPaths(template.name);
  const source = (file: string) =>
    fs.readFile(path.join(root, 'assets', template.name, file));

  // stretched to the frame, like kelly-v2's drawImage
  const rgba = await toRgba(
    sharp(await source('background.jpg')).resize(
      template.width,
      template.height,
      { fit: 'fill' },
    ),
  );
  const { palette, background } = await buildPalette(template, rgba);

  const sizes = {
    start: await write(
      paths.start,
      startFrames(template, await source('start.gif')),
    ),
    end: await write(paths.end, endFrames(await source('end.gif'))),
    blankFrame: await write(
      paths.blankFrame,
      blankFrame(template, palette, background),
    ),
    blend: await write(paths.blend, blendTable(palette, template)),
    atlas: await write(paths.atlas, encodeAtlas(await buildAtlas(template))),
  };

  console.log(
    `${template.name}: baked in ${Math.round(performance.now() - started)}ms`,
    sizes,
  );
}
