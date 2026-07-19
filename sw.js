/* Tiny offline cache so the rain is always one tap away, even with no signal. */
"use strict";

var CACHE = "matar-v1";
var ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "js/rain.js",
  "js/app.js",
  "audio/rain.mp3",
  "manifest.webmanifest",
  "favicon.svg",
  "icons/favicon-32.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png"
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

  // Range requests (audio seeking) — go to network, fall back to cache.
  if (req.headers.has("range")) {
    event.respondWith(fetch(req).catch(function () { return caches.match("audio/rain.mp3"); }));
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
