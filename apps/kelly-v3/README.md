# Kelly v3

The API behind the [Kelly](https://alsmith.dev/kelly) and [Potter](https://alsmith.dev/potter) GIF generators, as a Cloudflare Worker. It replaces kelly-v2's Lambda, which needed `canvas`, `gifsicle` and a hand-built Lambda layer.

```
GET /?q=<base64 text>&type=kelly|potter   -> image/gif
GET /assets/<template>/<file>              -> baked assets, for the browser
```

The website reaches it through a service binding at `/api/kelly`, and the pages make the same GIFs in the browser with the same code from [`@alastair-smith/kelly-core`](../../packages/kelly-core). The API is there for share links.

## How it works

Like kelly-v2, a GIF is the start of the clip, one frame with the text on it, then the end of the clip. [`kelly.ts`](../../packages/kelly-core/src/kelly.ts) does that in a few lines.

The free Workers plan allows 10ms of CPU per request, so [`scripts/bake.ts`](scripts/bake.ts) prepares everything that doesn't depend on the text at build time, one folder per template in `dist/assets`:

| File | What it is |
| --- | --- |
| `start.bin` | GIF header and the frames before the text |
| `end.bin` | frames holding the text on screen, then the frames after it |
| `blank-frame.bin` | the background as a finished GIF frame, waiting for the text |
| `blend.bin` | which palette colour to use for text at each alpha over each background colour |
| `atlas.bin` | every character pre-drawn in the right size and angle, with kerning |

A request copies the blank frame and draws the text into it from the atlas. The blank frame is stored uncompressed, so each pixel sits at a fixed position and can be changed in place, see [`lzw.ts`](../../packages/kelly-core/src/gif/lzw.ts).

Every frame lasts 15cs, and the text is held on screen by 24 tiny transparent frames at the start of `end.bin`. WhatsApp turns GIFs into videos and gives every frame the same duration, so a single long frame only flashes up there.

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
