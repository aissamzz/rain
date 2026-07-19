# matar · rain to forget the heat

A minimalist rain-sound web app. A stripped-down, rebuilt take on
[rainy-mood](https://github.com/a-merezhanyi/rainy-mood): one endless rain,
a play button, a volume slider, and a few words for a long Algerian summer.
No pictures baked in, no menu, no build step.

## What it is

- **One sound.** A single looping rain track. Press play, forget the heat.
- **Minimal UI.** Poem, play button in the middle, volume beneath it. That is all.
- **Custom typography.** Cormorant Garamond for English, Cairo for Arabic, both
  self-hosted (no Google Fonts request, so the app stays fully offline).
- **Your own backdrop.** Drop a painting into `assets/background.jpg`.
- **Installable PWA.** Add it to your home screen; it works offline.
- **Background & lock-screen playback.** A plain `<audio>` loop plus the Media
  Session API keeps it playing when the screen locks or the app is backgrounded.

## Add the background image

The site looks for `assets/background.jpg`. Until it exists, a dark blue
gradient shows instead (nothing breaks). Add your painting:

```bash
cp /path/to/your-painting.jpg assets/background.jpg
```

Aim for ~1600px on the long edge, optimized to roughly 200-500 KB.

## Run locally

Just static files, no dependencies:

```bash
python3 -m http.server 8099
# open http://localhost:8099
```

A service worker and installability need `https://` (or `localhost`).

## Deploy on a VPS with Docker

The included `Dockerfile` builds a tiny nginx image that serves the site with
sensible cache headers and the correct MIME types.

```bash
# build and run
docker build -t matar .
docker run -d --name matar --restart unless-stopped -p 8080:80 matar
```

Or with Compose:

```bash
docker compose up -d --build
```

Then point your reverse proxy (Caddy, Traefik, nginx) at port `8080` and add
TLS. Example Caddy one-liner on the host:

```
rain.example.com {
    reverse_proxy localhost:8080
}
```

HTTPS matters here: the PWA service worker and "install to home screen" only
work over a secure origin.

## Deploy without Docker

It is plain static files, so **GitHub Pages**, Netlify, Cloudflare Pages, or
any web root works too. Just serve the directory.

## Structure

```
index.html              markup + poem
css/fonts.css           self-hosted @font-face (Cormorant Garamond + Cairo)
css/style.css           the whole look, background image + scrim
js/rain.js              decorative canvas drizzle (pauses when hidden)
js/app.js               audio, controls, media session, SW registration
audio/thunderstorm.mp3  the audio (a 10-minute thunderstorm recording)
assets/background.jpg   your background painting (add it yourself)
fonts/                  woff2 files
manifest.webmanifest    PWA manifest
sw.js                   offline cache
Dockerfile, nginx.conf, docker-compose.yml   deployment
icons/                  generated app icons
```

## About "keep playing after the browser is closed"

Honest limitation: **no web page can keep playing audio once the browser is
fully quit.** The OS stops the process and there is no web API around it. What
this app does do is the maximum the platform allows: as an installed PWA it
keeps playing when **backgrounded or screen-locked**, with lock-screen
controls. For audio that survives a full quit you would need a native app.

## Credits

Rain audio and the original concept from
[a-merezhanyi/rainy-mood](https://github.com/a-merezhanyi/rainy-mood) (MIT).
Rebuilt from scratch as a minimalist PWA.
