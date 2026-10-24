// Pre-rendered glyphs for one template (font, size and transform baked in),
// so drawing text at request time is just copying alpha masks around.
// Each glyph is rendered at PHASES x PHASES sub-pixel offsets to keep spacing
// smooth without rasterising anything at runtime.
//
// The atlas is a flat binary file read in place, because parsing anything on
// load would eat into the Worker's 10ms CPU budget:
//
//   u32 glyph count (N), u32 phases (P), f32 line height
//   N x u32  code points
//   N x f32  advances, in source pixels
//   N*N x i16  kerning between each pair, in 1/256ths of a source pixel
//   N*P*P x [i16 width, i16 height, i16 offsetX, i16 offsetY, u32 offset]
//   alpha masks, one byte per pixel

export interface GlyphMask {
  width: number;
  height: number;
  // where the mask's top-left sits relative to the rounded pen position
  offsetX: number;
  offsetY: number;
  alpha: Uint8Array;
}

export interface AtlasGlyph {
  char: string;
  // in source pixels, before the template transform
  advance: number;
  masks: GlyphMask[];
}

export interface AtlasSource {
  phases: number;
  lineHeight: number;
  glyphs: AtlasGlyph[];
  // by index into `glyphs`
  kerning: (left: number, right: number) => number;
}

export interface Atlas {
  phases: number;
  lineHeight: number;
  // index of the glyph to draw for a character, falling back to "?"
  glyph(char: string): number;
  advance(glyph: number): number;
  kerning(left: number, right: number): number;
  mask(glyph: number, phase: number): GlyphMask;
}

const KERNING_SCALE = 256;
const MASK_RECORD = 12;

export const encodeAtlas = ({
  phases,
  lineHeight,
  glyphs,
  kerning,
}: AtlasSource): Uint8Array<ArrayBuffer> => {
  const count = glyphs.length;
  const masks = glyphs.flatMap((g) => g.masks);
  const kerningStart = 12 + count * 8;
  const recordsStart = kerningStart + count * count * 2;
  const dataStart = recordsStart + masks.length * MASK_RECORD;
  const out = new Uint8Array(
    dataStart + masks.reduce((n, m) => n + m.alpha.length, 0),
  );
  const view = new DataView(out.buffer);

  view.setUint32(0, count, true);
  view.setUint32(4, phases, true);
  view.setFloat32(8, lineHeight, true);
  glyphs.forEach((glyph, i) => {
    view.setUint32(12 + i * 4, glyph.char.codePointAt(0) as number, true);
    view.setFloat32(12 + count * 4 + i * 4, glyph.advance, true);
    for (let j = 0; j < count; j++) {
      view.setInt16(
        kerningStart + (i * count + j) * 2,
        Math.round(kerning(i, j) * KERNING_SCALE),
        true,
      );
    }
  });

  let offset = 0;
  masks.forEach((mask, i) => {
    const record = recordsStart + i * MASK_RECORD;
    view.setInt16(record, mask.width, true);
    view.setInt16(record + 2, mask.height, true);
    view.setInt16(record + 4, mask.offsetX, true);
    view.setInt16(record + 6, mask.offsetY, true);
    view.setUint32(record + 8, offset, true);
    out.set(mask.alpha, dataStart + offset);
    offset += mask.alpha.length;
  });

  return out;
};

const FALLBACK = '?';

export const decodeAtlas = (bytes: Uint8Array): Atlas => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(0, true);
  const phases = view.getUint32(4, true);
  const kerningStart = 12 + count * 8;
  const recordsStart = kerningStart + count * count * 2;
  const dataStart = recordsStart + count * phases * phases * MASK_RECORD;

  const index = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    index.set(String.fromCodePoint(view.getUint32(12 + i * 4, true)), i);
  }
  const fallback = index.get(FALLBACK) ?? 0;

  return {
    phases,
    lineHeight: view.getFloat32(8, true),
    glyph: (char) => index.get(char) ?? fallback,
    advance: (glyph) => view.getFloat32(12 + count * 4 + glyph * 4, true),
    kerning: (left, right) =>
      view.getInt16(kerningStart + (left * count + right) * 2, true) /
      KERNING_SCALE,
    mask: (glyph, phase) => {
      const record =
        recordsStart + (glyph * phases * phases + phase) * MASK_RECORD;
      const width = view.getInt16(record, true);
      const height = view.getInt16(record + 2, true);
      const offset = dataStart + view.getUint32(record + 8, true);
      return {
        width,
        height,
        offsetX: view.getInt16(record + 4, true),
        offsetY: view.getInt16(record + 6, true),
        alpha: bytes.subarray(offset, offset + width * height),
      };
    },
  };
};

export const measure = (atlas: Atlas, text: string): number => {
  let width = 0;
  let previous = -1;
  for (const char of text) {
    const glyph = atlas.glyph(char);
    if (previous >= 0) width += atlas.kerning(previous, glyph);
    width += atlas.advance(glyph);
    previous = glyph;
  }
  return width;
};

// x' = a*x + c*y + e, y' = b*x + d*y + f, same order as canvas setTransform
export type Matrix = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
];

export interface Line {
  text: string;
  x: number;
  y: number;
}

export interface Coverage {
  left: number;
  top: number;
  width: number;
  height: number;
  alpha: Uint8Array;
}

interface Placement {
  mask: GlyphMask;
  x: number;
  y: number;
}

export const rasterise = (
  atlas: Atlas,
  matrix: Matrix,
  lines: Line[],
  bounds: { width: number; height: number },
): Coverage | null => {
  const [a, b, c, d, e, f] = matrix;
  const phases = atlas.phases;
  const placements: Placement[] = [];
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const line of lines) {
    let penX = line.x;
    let previous = -1;
    for (const char of line.text) {
      const glyph = atlas.glyph(char);
      if (previous >= 0) penX += atlas.kerning(previous, glyph);
      previous = glyph;

      // snap the pen to the nearest sub-pixel phase we have a mask for
      const qx = Math.round((a * penX + c * line.y + e) * phases);
      const qy = Math.round((b * penX + d * line.y + f) * phases);
      const px = Math.floor(qx / phases);
      const py = Math.floor(qy / phases);
      const mask = atlas.mask(
        glyph,
        (qy - py * phases) * phases + (qx - px * phases),
      );
      penX += atlas.advance(glyph);
      if (!mask.width || !mask.height) continue;

      const x = px + mask.offsetX;
      const y = py + mask.offsetY;
      placements.push({ mask, x, y });
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + mask.width);
      bottom = Math.max(bottom, y + mask.height);
    }
  }

  left = Math.max(0, left);
  top = Math.max(0, top);
  right = Math.min(bounds.width, right);
  bottom = Math.min(bounds.height, bottom);
  if (right <= left || bottom <= top) return null;

  const width = right - left;
  const height = bottom - top;
  const alpha = new Uint8Array(width * height);

  for (const { mask, x, y } of placements) {
    for (let my = 0; my < mask.height; my++) {
      const row = y + my - top;
      if (row < 0 || row >= height) continue;
      for (let mx = 0; mx < mask.width; mx++) {
        const col = x + mx - left;
        const value = mask.alpha[my * mask.width + mx];
        if (!value || col < 0 || col >= width) continue;
        const i = row * width + col;
        // overlapping glyph edges combine like stacked layers
        alpha[i] = alpha[i] + value - (((alpha[i] * value + 127) / 255) | 0);
      }
    }
  }

  return { left, top, width, height, alpha };
};
