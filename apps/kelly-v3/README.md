# Kelly v3

The API behind the [Kelly](https://alsmith.dev/kelly) and [Potter](https://alsmith.dev/potter) GIF generators, as a Cloudflare Worker. It replaces kelly-v2's Lambda, which needed `canvas`, `gifsicle` and a hand-built Lambda layer.

```
GET /?q=<base64 text>&type=kelly|potter   -> image/gif
GET /assets/<template>/<file>              -> baked assets, for the browser
```

The website reaches it through a service binding at `/api/kelly`, and the pages make the same GIFs in the browser with the same code from [`@alastair-smith/kelly-core`](../../packages/kelly-core). The API is there for share links.

## How it fits in 10ms

The free Workers plan allows 10ms of CPU per request, so everything that doesn't depend on the text happens at build time in [`scripts/bake.ts`](scripts/bake.ts):

- the start and end GIFs are re-timed and spliced into a ready-made `head.bin` and `tail.bin`
- the background is decoded and given a palette
- every glyph is pre-rendered at 16 sub-pixel positions into an atlas, with kerning
- a table maps "text at this alpha over this background colour" to a palette colour

A request then copies glyphs onto the background, looks colours up in that table and writes the frame as uncompressed GIF data, which is just bit-packing (see [`lzw.ts`](../../packages/kelly-core/src/lzw.ts)). The response is `head + text frame + tail`.

Every frame lasts 15cs, and the text stays on screen through 24 tiny transparent frames baked into `tail.bin`. WhatsApp turns GIFs into videos and gives every frame the same duration, so a single long frame only flashes up there.

## Development

```sh
pnpm run dev        # bake, then wrangler dev
pnpm run test       # needs `pnpm run bake` first
pnpm run build      # bake and typecheck
```

To use it from the website locally, run this alongside the website's dev server. Wrangler connects the service binding between the two local sessions.

The source GIFs and stills live in [`assets/`](assets). Change them, then rebake.

## Deploying

CI deploys it on merge to `main`, before the website. Pull requests get a preview version, like the website does.

The website's service binding needs a Worker called `kelly` to exist, so the first deploy has to be done by hand before CI can upload previews:

```sh
pnpm run build && pnpm run deploy
```
