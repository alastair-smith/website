// Text travels in the `q` query param as base64.
//
// Older links came from `btoa(text)` without URL encoding, so they may be
// Latin-1 rather than UTF-8 and any `+` arrives as a space.

export const MAX_TEXT_LENGTH = 280;

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
    text = binary;
  }

  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point
  text = text.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
  if (!text) throw new Error('No text to render');

  return [...text].slice(0, MAX_TEXT_LENGTH).join('');
};

// what the API will draw for this text, so a GIF made in the browser matches
// the one its share link renders
export const normaliseText = (text: string) => decodeText(encodeText(text));
