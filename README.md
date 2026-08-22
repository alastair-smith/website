# Website

Code for my personal website [alsmith.dev](https://alsmith.dev).

## Running locally

1. Install the following dependenices

   ```bash
   sudo apt install curl git gifsicle
   snap install aws-cli --classic
   ```

1. Install asdf

   ```bash
   git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
   # using ohmyzsh plugin
   sed -i 's/^plugins=(\(.*\))/plugins=(\1 asdf)/' ~/.zshrc
   ```

1. Install asdf plugins

   ```bash
   asdf plugin-add nodejs
   asdf plugin-add pnpm
   ```

1. Install tools

   ```bash
   asdf install
   ```

1. Install packages

   ```bash
   pnpm install
   ```

## Deployment

`apps/web` deploys to Cloudflare Workers with static assets. `vite build`
emits the client bundle to `dist/client` and the Worker to
`dist/website_frontend`; `wrangler deploy` then uploads both.

Pull requests upload a new Worker version aliased to the branch name, which
gets its own preview URL without shifting production traffic. Merges to
`main` build and deploy to production.

## Icons and social cards

The favicon, the web app manifest icons, the Open Graph card and the LinkedIn
banner are all drawn from the SVGs in `apps/web/assets`, and are the homepage's
two ribbons: rose coming down on the left, amber coming up on the right,
offwhite either side and down the middle.

Change one of those SVGs and re-render with:

```bash
pnpm run --dir "./apps/web" generate:images
```

Rendering is done by Playwright's Chromium so the cards can use the same Mulish
webfont the site does. Install the browser once with
`pnpm exec playwright install chromium`. Everything the site serves lands in
`apps/web/public`; the LinkedIn banner isn't part of the site, so it renders
next to its source in `apps/web/assets`. The outputs are committed, so this
isn't part of the build.

`icon-maskable.svg` is the same design with the ribbons pulled in, so an
Android launcher cropping it to a circle doesn't take a bite out of them.

## Site furniture

`apps/web/public` also holds `robots.txt`, `sitemap.xml`, `humans.txt`,
`site.webmanifest` and `.well-known/security.txt`. Two of those need a hand
when things change:

- `sitemap.xml` lists routes by hand, so it needs an entry whenever
  `apps/web/src/App.tsx` gains one — as does the page metadata in
  `apps/web/src/pages.ts`, which is what sets the tab title and description
  per route.
- `security.txt` carries an `Expires` date. Once it lapses the file counts as
  no file at all, so it wants bumping each year.

## Architecture

![architecture diagram](./docs/assets/architecture.drawio.svg)
