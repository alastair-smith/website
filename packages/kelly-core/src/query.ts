// Text travels in the `q` query param as base64.
//
// Older links came from `btoa(text)` without URL encoding, so they may be
// Latin-1 rather than UTF-8 and any `+` arrives as a space.

export const MAX_TEXT_LENGTH = 280;

// what gets drawn: no control characters, and capped in length
export const normaliseText = (text: string): string => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point
  const cleaned = text.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
  if (!cleaned) throw new Error('No text to render');
  return [...cleaned].slice(0, MAX_TEXT_LENGTH).join('');
};

export const encodeText = (text: string): string => {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeText = (q: string): string => {
  const base64 = q
    .replace(/ /g, '+')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/=+$/, '');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(
      bytes,
    );
  } catch {
    // not UTF-8, so an old Latin-1 link
    text = binary;
  }
  return normaliseText(text);
};
