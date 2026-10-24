import { describe, expect, it } from 'vitest';
import { templates, wrapPotterText } from './templates.ts';
import { testAtlas } from './text/atlas.testing.ts';

describe('templates', () => {
  it('crops kelly text to the spreadsheet cell', () => {
    const [line] = templates.kelly.layout('A'.repeat(100), testAtlas);
    expect(line.text).toBe('A'.repeat(58));
  });

  it("wraps potter text like kelly-v2's insertNewlines", () => {
    expect(
      wrapPotterText('Nice earmuffs potter, did your mum make them for you?'),
    ).toEqual({
      result: 'Nice earmuffs\npotter, did your mum\nmake them for you?',
      lineCount: 2,
    });
    expect(wrapPotterText('a'.repeat(25)).result).toBe(
      `${'a'.repeat(19)}-\n${'a'.repeat(6)}`,
    );
  });

  it('stops potter text at nine lines', () => {
    const { lineCount } = wrapPotterText('word '.repeat(200));
    expect(lineCount).toBe(9);
  });
});
