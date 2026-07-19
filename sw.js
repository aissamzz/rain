/* Tiny offline cache so the rain is always one tap away, even with no signal. */
"use strict";

var CACHE = "matar-v4";
var ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "css/fonts.css",
  "js/rain.js",
  "js/app.js",
  "audio/thunderstorm.mp3",
  "assets/background.jpg",
  "manifest.webmanifest",
  "favicon.svg",
  "icons/favicon-32.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
  "fonts/cormorant-garamond-latin-400-normal.woff2",
  "fonts/cormorant-garamond-latin-400-italic.woff2",
  "fonts/cormorant-garamond-latin-500-normal.woff2",
  "fonts/cairo-arabic-300-normal.woff2",
  "fonts/cairo-arabic-400-normal.woff2",
  "fonts/cairo-arabic-600-normal.woff2"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  // Range requests (the audio element seeking/streaming). Serve the slice from
  // the cached full file when possible so the 10-minute track plays offline.
  if (req.headers.has("range")) {
    event.respondWith(handleRange(req));
    return;
  }

  // Cache-first: everything we ship is static.
  event.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match("index.html");
      });
    })
  );
});

// Answer a Range request from the cached full response (falling back to network).
function handleRange(req) {
  return caches.match(req).then(function (cached) {
    if (cached) return sliceResponse(cached, req.headers.get("range"));
    return fetch(req).catch(function () {
      return caches.match(req).then(function (c) {
        return c ? sliceResponse(c, req.headers.get("range")) : Response.error();
      });
    });
  });
}

function sliceResponse(response, rangeHeader) {
  return response.arrayBuffer().then(function (buf) {
    var total = buf.byteLength;
    var m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || "");
    var start = m && m[1] ? parseInt(m[1], 10) : 0;
    var end = m && m[2] ? parseInt(m[2], 10) : total - 1;
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;
    if (start > end) { start = 0; end = total - 1; }
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      statusText: "Partial Content",
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes"
      }
    });
  });
}
