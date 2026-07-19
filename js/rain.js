/* Minimal decorative rain — a quiet drizzle behind the words.
   Pauses when the tab is hidden, and steps aside for reduced-motion users. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var canvas = document.getElementById("rain-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0;
  var drops = [];
  var wind = 0.6;
  var intensity = 1;      // scaled a little by volume, set from app.js
  var raf = null;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.round((w * h) / 9000);
    while (drops.length < target) drops.push(newDrop(true));
    if (drops.length > target) drops.length = target;
  }

  function newDrop(spawnAnywhere) {
    var z = Math.random() * 0.6 + 0.4; // depth 0.4..1
    return {
      x: Math.random() * (w + 120) - 60,
      y: spawnAnywhere ? Math.random() * h : Math.random() * -h,
      z: z,
      len: 8 + 16 * z,
      speed: (3.2 + 5.5 * z)
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.y += d.speed * intensity;
      d.x += wind * d.z * intensity;
      if (d.y - d.len > h || d.x > w + 60) {
        var nd = newDrop(false);
        drops[i] = nd;
        continue;
      }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - wind * d.z * 2.2, d.y - d.len);
    }
    ctx.strokeStyle = "rgba(191, 219, 254, 0.22)";
    ctx.stroke();
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  window.addEventListener("resize", resize);

  // let app.js nudge the rain a touch with the volume slider
  window.__rain = {
    setIntensity: function (v) { intensity = 0.7 + v * 0.8; }
  };

  resize();
  start();
})();
