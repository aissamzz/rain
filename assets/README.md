# Background image

Put your background painting here as **`background.jpg`**:

```
assets/background.jpg
```

The site references `assets/background.jpg` in `css/style.css`. Until the file
exists, the page falls back to a dark blue gradient (so nothing breaks).

Recommended: a JPG around 1600px on the long edge, optimized for web
(roughly 200-500 KB) so first load stays fast. The service worker caches it
automatically on first visit for offline use.
