/*
 * Renders the site's icons and social cards from the SVGs in assets/ into
 * public/, with `node scripts/generate-images.mjs`. The outputs are committed,
 * so this only needs running when one of the sources changes.
 *
 * Playwright's Chromium does the rendering, so the SVGs can use the same
 * Mulish webfont the site does. Install it once with
 * `pnpm exec playwright install chromium`.
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');
const publicDir = path.join(root, 'public');

const fontFile = (weight) =>
  path.join(
    root,
    'node_modules/@fontsource/mulish/files',
    `mulish-latin-${weight}-normal.woff2`,
  );

// inlined so the page can stay an about:blank document, which is not allowed
// to fetch file:// subresources
const fontFace = async (weight) => {
  const woff2 = await readFile(fontFile(weight));

  return `@font-face {
    font-family: 'Mulish';
    font-weight: ${weight};
    src: url(data:font/woff2;base64,${woff2.toString('base64')}) format('woff2');
  }`;
};

const page = (svg, css, width, height) => `<!doctype html>
<meta charset="utf-8" />
<style>
  ${css}
  html, body { margin: 0; padding: 0; }
  svg { display: block; width: ${width}px; height: ${height}px; }
</style>
${svg}`;

const render = async (
  browser,
  css,
  source,
  output,
  width,
  height,
  outputDir = publicDir,
) => {
  const svg = await readFile(path.join(assets, source), 'utf8');
  const tab = await browser.newPage({ viewport: { width, height } });

  try {
    await tab.setContent(page(svg, css, width, height));
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: path.join(outputDir, output) });
  } finally {
    await tab.close();
  }

  console.log(`${output} (${width}x${height})`);
};

// an .ico is a directory of images, and PNG payloads are accepted as-is
const ico = (frames) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(frames.length, 4);

  let offset = header.length + frames.length * 16;

  const directory = frames.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);

    offset += png.length;

    return entry;
  });

  return Buffer.concat([header, ...directory, ...frames.map(({ png }) => png)]);
};

const css = await fontFace(400);
const browser = await chromium.launch();

await mkdir(publicDir, { recursive: true });

try {
  // the SVG favicon is what modern browsers actually use, so it ships as-is
  await writeFile(
    path.join(publicDir, 'favicon.svg'),
    await readFile(path.join(assets, 'icon.svg')),
  );
  console.log('favicon.svg');

  const icoSizes = [16, 32, 48];

  for (const size of icoSizes) {
    await render(browser, css, 'icon.svg', `ico-${size}.png`, size, size);
  }

  await writeFile(
    path.join(publicDir, 'favicon.ico'),
    ico(
      await Promise.all(
        icoSizes.map(async (size) => ({
          size,
          png: await readFile(path.join(publicDir, `ico-${size}.png`)),
        })),
      ),
    ),
  );
  console.log('favicon.ico (16, 32, 48)');

  for (const size of icoSizes) {
    await rm(path.join(publicDir, `ico-${size}.png`));
  }

  await render(browser, css, 'icon.svg', 'apple-touch-icon.png', 180, 180);
  await render(browser, css, 'icon.svg', 'icon-192.png', 192, 192);
  await render(browser, css, 'icon.svg', 'icon-512.png', 512, 512);
  await render(
    browser,
    css,
    'icon-maskable.svg',
    'icon-maskable-512.png',
    512,
    512,
  );

  await render(browser, css, 'og.svg', 'og.png', 1200, 630);

  // the banner is not part of the site, so it stays next to its source
  await render(
    browser,
    css,
    'linkedin-banner.svg',
    'linkedin-banner.png',
    1584,
    396,
    assets,
  );
} finally {
  await browser.close();
}
