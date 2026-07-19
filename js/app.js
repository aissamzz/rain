/* The whole app: one looping rain, a play button, a volume slider.
   Kept deliberately small. */
(function () {
  "use strict";

  var STORE_VOL = "matar.volume";
  var toggle = document.getElementById("toggle");
  var slider = document.getElementById("volume");
  var hint = document.getElementById("hint");

  // One looping <audio> element — friendlier to background / lock-screen
  // playback than the Web Audio API (whose context gets suspended off-screen).
  var audio = new Audio("audio/rain.mp3");
  audio.loop = true;
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");

  // ---- volume ----
  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  var saved = parseFloat(localStorage.getItem(STORE_VOL));
  var vol = isNaN(saved) ? 0.7 : clamp01(saved);

  function applyVolume(v, persist) {
    vol = clamp01(v);
    audio.volume = vol;
    slider.value = Math.round(vol * 100);
    slider.style.setProperty("--fill", Math.round(vol * 100) + "%");
    if (window.__rain) window.__rain.setIntensity(vol);
    if (persist) localStorage.setItem(STORE_VOL, String(vol));
  }
  applyVolume(vol, false);

  slider.addEventListener("input", function () {
    applyVolume(slider.value / 100, true);
  });

  // ---- play / pause ----
  function setPlayingUI(playing) {
    toggle.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "Pause the rain" : "Play the rain");
    if (hint) hint.classList.toggle("is-hidden", playing);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    }
  }

  function play() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { setPlayingUI(false); });
  }
  function pause() { audio.pause(); }

  toggle.addEventListener("click", function () {
    if (audio.paused) play(); else pause();
  });

  audio.addEventListener("play", function () { setPlayingUI(true); });
  audio.addEventListener("pause", function () { setPlayingUI(false); });

  // ---- keyboard: space toggles, arrows nudge volume ----
  document.addEventListener("keydown", function (e) {
    if (e.target === slider) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (audio.paused) play(); else pause();
    } else if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      applyVolume(vol + 0.05, true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      applyVolume(vol - 0.05, true);
    }
  });

  // ---- lock-screen / background media controls ----
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Rain to forget the heat",
        artist: "matar",
        album: "endless drizzle",
        artwork: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      });
    } catch (e) { /* MediaMetadata unsupported — ignore */ }
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("stop", pause);
  }

  // ---- service worker (offline + installable PWA) ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
