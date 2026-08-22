// Renders the site's icons and social cards from the SVGs in assets/ into
// public/. The outputs are committed, so this only needs running when one of
// the sources changes.
//
//   node scripts/generate-images.mjs
//
// Rendering is done by headless Chrome rather than a native image library, so
// the SVGs can use the same Mulish webfont the site does. Point CHROME at a
// binary if it isn't in one of the usual places.

import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');
const publicDir = path.join(root, 'public');

const fontFile = (weight) =>
  path.join(
    root,
    'node_modules/@fontsource/mulish/files',
    `mulish-latin-${weight}-normal.woff2`,
  );

const chromeCandidates = [
  process.env.CHROME,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  path.join(
    process.env.HOME ?? '',
    '.cache/ms-playwright/chromium-1237/chrome-linux64/chrome',
  ),
].filter((candidate) => candidate !== undefined);

const findChrome = async () => {
  for (const candidate of chromeCandidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {}
  }
  throw new Error(
    `no Chrome binary found, tried:\n  ${chromeCandidates.join('\n  ')}\nset CHROME to one`,
  );
};

// the SVG is dropped into a page sized exactly to the screenshot, so Chrome's
// viewport does the scaling and nothing has to be cropped afterwards
const page = (svg, width, height) => `<!doctype html>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Mulish';
    font-weight: 400;
    src: url('file://${fontFile(400)}') format('woff2');
  }
  html, body { margin: 0; padding: 0; }
  svg { display: block; width: ${width}px; height: ${height}px; }
</style>
${svg}`;

const render = async (
  chrome,
  workDir,
  source,
  output,
  width,
  height,
  outputDir = publicDir,
) => {
  const svg = await readFile(path.join(assets, source), 'utf8');
  const html = path.join(workDir, `${path.parse(output).name}.html`);

  await writeFile(html, page(svg, width, height));

  await run(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    `--screenshot=${path.join(outputDir, output)}`,
    // give the webfont a moment to load before the shot is taken
    '--virtual-time-budget=2000',
    html,
  ]);

  console.log(`${output} (${width}x${height})`);
};

// an .ico is a directory of images bolted together; every browser that still
// asks for one accepts PNG payloads, so the frames go in as-is
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

const chrome = await findChrome();
const workDir = await mkdtemp(path.join(tmpdir(), 'website-images-'));

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
    await render(chrome, workDir, 'icon.svg', `ico-${size}.png`, size, size);
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

  await render(chrome, workDir, 'icon.svg', 'apple-touch-icon.png', 180, 180);
  await render(chrome, workDir, 'icon.svg', 'icon-192.png', 192, 192);
  await render(chrome, workDir, 'icon.svg', 'icon-512.png', 512, 512);
  await render(
    chrome,
    workDir,
    'icon-maskable.svg',
    'icon-maskable-512.png',
    512,
    512,
  );

  await render(chrome, workDir, 'og.svg', 'og.png', 1200, 630);

  // the banner is not part of the site, so it stays next to its source rather
  // than being served
  await render(
    chrome,
    workDir,
    'linkedin-banner.svg',
    'linkedin-banner.png',
    1584,
    396,
    assets,
  );
} finally {
  await rm(workDir, { recursive: true, force: true });
}
