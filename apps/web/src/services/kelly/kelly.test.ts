import { decodeText } from '@alastair-smith/kelly-core';
import { describe, expect, test } from 'vitest';
import { getShareUrl } from '@/services/kelly';

const textFrom = (url: string) =>
  decodeText(new URL(url, 'https://alsmith.dev').searchParams.get('q') ?? '');

describe('services kelly', () => {
  describe('getShareUrl', () => {
    test('points kelly links at the API without a type', () => {
      const url = getShareUrl('kelly', 'WHERE YOU AT?');
      expect(url).toMatch(/^\/api\/kelly\?q=/);
      expect(url).not.toContain('type=');
      expect(textFrom(url)).toBe('WHERE YOU AT?');
    });

    test('adds the type for potter', () => {
      expect(getShareUrl('potter', 'hi')).toContain('type=potter');
    });

    test('carries text the old btoa links could not', () => {
      const text = 'it’s 🎉';
      expect(textFrom(getShareUrl('kelly', text))).toBe(text);
    });
  });
});
