# matar · rain to forget the heat

A minimalist rain-sound web app — a stripped-down, rebuilt take on
[rainy-mood](https://github.com/a-merezhanyi/rainy-mood). One endless rain,
a play button, a volume slider, and a few words for a long Algerian summer.
No pictures, no menu, no build step.

## What it is

- **One sound.** A single looping rain track — press play, forget the heat.
- **Minimal UI.** Poem, play button in the middle, volume beneath it. That's all.
- **Installable PWA.** Add it to your home screen; it works fully offline.
- **Background & lock-screen playback.** Uses a plain `<audio>` loop plus the
  Media Session API, so it keeps playing when the screen locks or the app is
  backgrounded, with play/pause on the lock screen.

## Run it

It's just static files — no dependencies, no bundler:

```bash
python3 -m http.server 8099
# then open http://localhost:8099
```

A service worker and installability require `https://` (or `localhost`).

## Deploy

Push to any static host — **GitHub Pages**, Netlify, Cloudflare Pages, Vercel.
For GitHub Pages: Settings → Pages → deploy from branch, root `/`.

## Structure

```
index.html              markup + poem
css/style.css           the whole look
js/rain.js              decorative canvas drizzle (pauses when hidden)
js/app.js               audio, controls, media session, SW registration
audio/rain.mp3          the loop  (audio/rain-soft.mp3 = gentler alt.)
manifest.webmanifest    PWA manifest
sw.js                   offline cache
icons/                  generated app icons
```

## About "keep playing after the browser is closed"

Honest limitation: **no web page can keep playing audio once the browser is
fully quit** — the OS stops the process, and there's no web API around it. What
this app *does* do is the maximum the platform allows: as an installed PWA it
keeps playing when **backgrounded or screen-locked**, with lock-screen
controls. For audio that survives a full quit you'd need a native app.

## Credits

Rain audio and the original concept from
[a-merezhanyi/rainy-mood](https://github.com/a-merezhanyi/rainy-mood) (MIT).
Rebuilt from scratch as a minimalist PWA.
