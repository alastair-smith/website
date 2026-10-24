import { describe, expect, it } from 'vitest';
import { decodeText, encodeText, MAX_TEXT_LENGTH } from './query.ts';

// what the old pages sent: btoa of the raw text, not URL encoded
const oldLink = (text: string) => btoa(text);

describe('query', () => {
  it('round trips unicode text', () => {
    const text = 'WHERE YOU AT? 🎉 café ’quotes’';
    expect(decodeText(encodeText(text))).toBe(text);
  });

  it('produces URL-safe output', () => {
    expect(encodeText('>>>???')).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('reads old Latin-1 links', () => {
    expect(decodeText(oldLink('café'))).toBe('café');
  });

  it("reads old links where a '+' arrived as a space", () => {
    const q = oldLink('ok >>> fine');
    expect(q).toContain('+');
    expect(decodeText(q.replace(/\+/g, ' '))).toBe('ok >>> fine');
  });

  it('strips control characters', () => {
    expect(decodeText(encodeText('a\nb\u0007c'))).toBe('abc');
  });

  it('caps the length by character, not code unit', () => {
    const text = '🎉'.repeat(MAX_TEXT_LENGTH + 10);
    expect([...decodeText(encodeText(text))]).toHaveLength(MAX_TEXT_LENGTH);
  });

  it('rejects empty and invalid input', () => {
    expect(() => decodeText('')).toThrow();
    expect(() => decodeText(encodeText('\n'))).toThrow();
    expect(() => decodeText('%%%')).toThrow();
  });
});
