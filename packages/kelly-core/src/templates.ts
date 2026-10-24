// Layout ported from kelly-v2's node-canvas code. Coordinates are in the
// canvas space kelly-v2 drew in, and `matrix` maps them onto the GIF frame.
import { type Atlas, type Line, type Matrix, measure } from './text/atlas.ts';

export type TemplateName = 'kelly' | 'potter';

export interface Template {
  name: TemplateName;
  width: number;
  height: number;
  fontSize: number;
  color: [r: number, g: number, b: number];
  matrix: Matrix;
  layout(text: string, atlas: Atlas): Line[];
}

const rotation = (radians: number, scaleX = 1, scaleY = 1): Matrix => [
  scaleX * Math.cos(radians),
  scaleY * Math.sin(radians),
  -scaleX * Math.sin(radians),
  scaleY * Math.cos(radians),
  0,
  0,
];

const KELLY_MAX_WIDTH = 580;

const kelly: Template = {
  name: 'kelly',
  width: 480,
  height: 360,
  fontSize: 28,
  color: [0x00, 0x49, 0xaf],
  // drawn rotated on the 968x681 still, then the still is squashed to 480x360
  matrix: rotation(0.6, 480 / 968, 360 / 681),
  layout(text, atlas) {
    let fitted = text;
    while (fitted && measure(atlas, fitted) > KELLY_MAX_WIDTH) {
      // text width is unpredictable but needs to be cropped
      fitted = fitted.slice(0, -1);
    }
    return [{ text: fitted, x: 320, y: -110 }];
  },
};

const POTTER_MAX_LINES = 9;
const POTTER_MAX_LINE_LENGTH = 20;

export const wrapPotterText = (text: string) => {
  let result = '';
  let currentLine = '';
  let lineCount = 0;

  for (const word of text.split(' ')) {
    if (lineCount >= POTTER_MAX_LINES) {
      break;
    }

    if (currentLine.length + word.length + 1 > POTTER_MAX_LINE_LENGTH) {
      if (currentLine.length > 0) {
        result += `${currentLine}\n`;
        lineCount++;
        currentLine = '';
        if (lineCount >= POTTER_MAX_LINES) {
          break;
        }
      }

      if (word.length > POTTER_MAX_LINE_LENGTH) {
        const part = word.slice(0, POTTER_MAX_LINE_LENGTH - 1);
        result += `${part}-\n`;
        lineCount++;
        currentLine = word.slice(POTTER_MAX_LINE_LENGTH - 1);
        if (lineCount >= POTTER_MAX_LINES) {
          break;
        }
      } else {
        currentLine = word;
      }
    } else {
      if (currentLine.length > 0) {
        currentLine += ' ';
      }
      currentLine += word;
    }
  }

  if (lineCount < POTTER_MAX_LINES && currentLine.length > 0) {
    result += currentLine;
  }

  return { result, lineCount };
};

const potter: Template = {
  name: 'potter',
  width: 480,
  height: 270,
  fontSize: 14,
  color: [0x11, 0x0a, 0x05],
  matrix: rotation(0.5),
  layout(text, atlas) {
    const { result, lineCount } = wrapPotterText(text);
    // fewer lines sit lower on the letter
    const y = -50 + (POTTER_MAX_LINES - lineCount) * 7;
    return result
      .split('\n')
      .map((line, i) => ({ text: line, x: 210, y: y + i * atlas.lineHeight }));
  },
};

export const templates: Record<TemplateName, Template> = { kelly, potter };

export const isTemplateName = (name: string): name is TemplateName =>
  Object.hasOwn(templates, name);
