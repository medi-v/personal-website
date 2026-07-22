// Animations for the /waves page.
// Lives in public/ as a plain external file — the site's Content-Security-
// Policy allows only external same-origin scripts, no inline ones
// (same pattern as blog-filter.js).
//
// Everything here is decoration: without JavaScript the page is fully
// readable (reveal states only activate once the `.anim` class below is
// added). Deliberately ignores the OS `prefers-reduced-motion` flag —
// Windows often sets it via "Animation effects" and froze the page for
// the site owner; the motion here is slow and decorative.
(function () {
  'use strict';

  var bleed = document.querySelector('.bleed');
  var seaCanvas = document.getElementById('sea');
  if (!bleed || !seaCanvas) return; // not on the waves page

  // Arms the CSS reveal states (see waves.astro). Must happen first.
  bleed.classList.add('anim');

  /* ---------------- thread geometry: build the S-curve paths ------------- */
  var rails = Array.prototype.slice.call(document.querySelectorAll('.rail'));

  function buildPaths() {
    rails.forEach(function (rail) {
      var svgEl = rail.querySelector('.flow');
      var h = rail.offsetHeight;
      // amp is kept small so the curve never touches the item dots,
      // which sit 24px from the centre line.
      var w = 120, mid = w / 2, amp = 14, step = 240;
      svgEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var d = 'M ' + mid + ' 0';
      var side = 1;
      for (var y = 0; y < h; y += step) {
        var yEnd = Math.min(y + step, h);
        d += ' C ' + (mid + amp * side) + ' ' + (y + step * 0.33) +
             ', ' + (mid + amp * side) + ' ' + (yEnd - step * 0.33) +
             ', ' + mid + ' ' + yEnd;
        side *= -1;
      }
      svgEl.querySelector('.trace').setAttribute('d', d);
      var drawn = svgEl.querySelector('.drawn-path');
      drawn.setAttribute('d', d);
      rail._drawn = drawn;
      rail._droplet = svgEl.querySelector('.droplet');
      rail._len = drawn.getTotalLength();
    });
  }
  buildPaths();
  addEventListener('resize', buildPaths);

  /* ---------------- scroll choreography ---------------------------------- */
  var wavenav = document.getElementById('wavenav');
  var progress = document.getElementById('progress');
  var navLinks = Array.prototype.slice.call(wavenav.querySelectorAll('a[data-w]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.wave'));

  function onScroll() {
    // The clay line + droplet follow your reading position.
    var anchor = innerHeight * 0.62;
    rails.forEach(function (rail) {
      var r = rail.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (anchor - r.top) / r.height));
      rail._drawn.style.strokeDashoffset = (1 - p).toFixed(4);
      if (p > 0 && p < 1) {
        var pt = rail._drawn.getPointAtLength(p * rail._len);
        rail._droplet.setAttribute('cx', pt.x);
        rail._droplet.setAttribute('cy', pt.y);
        rail._droplet.style.opacity = '1';
      } else {
        rail._droplet.style.opacity = '0';
      }
    });

    // Sticky nav appears once the hero is behind you.
    wavenav.classList.toggle('show', scrollY > innerHeight * 0.8);

    // Reading-progress line.
    var total = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + '%';

    // Underline the wave you are currently in.
    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top < innerHeight * 0.5) current = s.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('here', a.getAttribute('data-w') === current);
    });
  }

  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------------- reveal-on-arrival ------------------------------------
     Wave headings fire a bit later (rootMargin) so the word-by-word
     rise happens where you can actually see it. */
  function reveal(selector, options) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); }
      });
    }, options);
    document.querySelectorAll(selector).forEach(function (el) { io.observe(el); });
  }
  reveal('.item', { threshold: 0.15 });
  reveal('.wave-head', { rootMargin: '0px 0px -18% 0px' });

  /* ---------------- the water --------------------------------------------
     One shared animation loop drives the hero sea, the faint ambient water
     behind each wave heading, and the paper birds. Water canvases only
     draw while they are on screen. */
  var headSeas = Array.prototype.slice.call(document.querySelectorAll('.headsea'));
  var visible = new WeakSet();
  var visIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
    });
  });
  [seaCanvas].concat(headSeas).forEach(function (c) { visIO.observe(c); });

  var mouse = { x: -9999, y: -9999, on: false };
  seaCanvas.parentElement.addEventListener('pointermove', function (e) {
    var r = seaCanvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
  });
  seaCanvas.parentElement.addEventListener('pointerleave', function () { mouse.on = false; });

  var birdCanvas = document.getElementById('birds');

  // Bird mouse-steering — only for pointer:fine devices (mouse/trackpad, not touch).
  // The birds canvas is position:fixed over the full viewport, so clientX/Y map directly.
  var birdMouse = { x: -9999, y: -9999, on: false };
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (hasFinePointer) {
    document.addEventListener('pointermove', function (e) {
      birdMouse.x = e.clientX; birdMouse.y = e.clientY; birdMouse.on = true;
    });
    document.addEventListener('pointerleave', function () { birdMouse.on = false; });
  }

  function sizeCanvas(c) {
    c.width = c.clientWidth * devicePixelRatio;
    c.height = c.clientHeight * devicePixelRatio;
    c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  function sizeAll() { [seaCanvas, birdCanvas].concat(headSeas).forEach(sizeCanvas); }
  sizeAll();
  addEventListener('resize', sizeAll);

  // Draw one field of layered sine lines onto a canvas.
  // "full" = the hero (more lines, mouse swell); headings get a calmer echo.
  function drawWater(c, t, full) {
    var ctx = c.getContext('2d');
    var W = c.clientWidth, H = c.clientHeight;
    ctx.clearRect(0, 0, W, H);
    var time = t * 0.00019;
    var lines = full ? 14 : 5;
    var swellX = W * (0.5 + 0.45 * Math.sin(time * 0.9));
    var sigma2 = 2 * Math.pow(W * 0.10, 2);

    for (var i = 0; i < lines; i++) {
      var frac = lines === 1 ? 0.5 : i / (lines - 1);
      var baseY = full ? H * (0.30 + 0.48 * frac) : H * (0.18 + 0.64 * frac);
      var isClay = full ? i === 9 : i === 2;
      var alpha = full
        ? (isClay ? 0.55 : 0.07 + 0.10 * Math.sin(frac * Math.PI))
        : (isClay ? 0.16 : 0.05 + 0.03 * Math.sin(frac * Math.PI));
      ctx.beginPath();
      for (var x = 0; x <= W; x += 5) {
        var env = Math.sin((x / W) * Math.PI); // calm at the edges
        var y = baseY
          + Math.sin(x * 0.006 + time * 3.4 + i * 0.9) * (full ? 16 : 7) * env
          + Math.sin(x * 0.013 - time * 2.5 + i * 1.7) * (full ? 9 : 4) * env
          + Math.sin(x * 0.003 + time * 1.6 + i * 0.4) * (full ? 22 : 9) * env;
        if (full) {
          // ambient swell drifting across, forever
          var ds = x - swellX;
          y += Math.exp(-(ds * ds) / sigma2) * 14 * env * Math.sin(time * 2.4 + i * 0.6);
          // swell under the cursor
          if (mouse.on) {
            var dx = x - mouse.x;
            var g = Math.exp(-(dx * dx) / 18000);
            var pull = (mouse.y - baseY) * 0.25;
            y += g * pull * Math.exp(-Math.abs(mouse.y - baseY) / 260);
          }
        }
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isClay
        ? 'rgba(193, 95, 60, ' + alpha + ')'
        : 'rgba(26, 25, 23, ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = isClay ? 1.6 : 1;
      ctx.stroke();
    }
  }

  /* ---------------- paper birds -------------------------------------------
     Every so often a small sketched bird flies across the screen. Each
     wing swings through a wide arc (tips well above the body, then below)
     so the flapping actually reads. Drawn twice with a small offset for a
     hand-drawn, paper look. At most three birds at a time. */
  var birds = [];
  var nextBirdAt = 2500; // first bird after ~2.5 seconds

  function spawnBird(now) {
    var goingRight = Math.random() < 0.5;
    var H = birdCanvas.clientHeight, W = birdCanvas.clientWidth;
    birds.push({
      x: goingRight ? -60 : W + 60,
      y: H * (0.07 + Math.random() * 0.42),        // upper part of the screen
      vx: (goingRight ? 1 : -1) * (55 + Math.random() * 45), // px per second
      dir: goingRight ? 1 : -1,
      size: 13 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      flapSpeed: 5.5 + Math.random() * 3.5,        // rad/s — clearly visible
      bob: 5 + Math.random() * 8,                  // gentle vertical drift
      vy: 0,                                        // vertical velocity for mouse steering
      born: now,
    });
  }

  function drawBirds(now, dt) {
    var ctx = birdCanvas.getContext('2d');
    var W = birdCanvas.clientWidth, H = birdCanvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    if (now > nextBirdAt && birds.length < 5) {
      spawnBird(now);
      nextBirdAt = now + 4000 + Math.random() * 7000; // next in 4–11 s
    }

    birds = birds.filter(function (b) { return b.x > -80 && b.x < W + 80; });

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var minY = birdCanvas.clientHeight * 0.04;
    var maxY = birdCanvas.clientHeight * 0.55;
    birds.forEach(function (b) {
      b.x += b.vx * dt;
      // Gentle mouse-steering: when the cursor gets close, the bird curves toward it.
      if (hasFinePointer && birdMouse.on) {
        var dx = birdMouse.x - b.x, dy = birdMouse.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          b.vy += (dy / dist) * (1 - dist / 220) * 70 * dt;
        }
      }
      b.vy *= (1 - 2.5 * dt);
      b.y = Math.max(minY, Math.min(maxY, b.y + b.vy * dt));
      var t = (now - b.born) / 1000;
      var flap = Math.sin(t * b.flapSpeed + b.phase);   // -1 (down) .. 1 (up)
      var y = b.y + Math.sin(t * 0.6 + b.phase) * b.bob;
      var s = b.size;

      // Wingtips swing high above the body on the upstroke and dip below on
      // the downstroke; the mid-wing (elbow) follows more softly.
      var tipY = y - s * 0.8 * flap;
      var elbowY = y - s * 0.3 * flap;
      // A slight forward lean in the travel direction.
      var lean = b.dir * s * 0.12;

      for (var pass = 0; pass < 2; pass++) {
        var j = pass ? 0.9 : 0; // offset for the sketched second stroke
        ctx.strokeStyle = pass ? 'rgba(26, 25, 23, 0.15)' : 'rgba(26, 25, 23, 0.42)';
        ctx.lineWidth = pass ? 1.4 : 1.2;
        ctx.beginPath();
        // left wingtip -> elbow -> body -> elbow -> right wingtip
        ctx.moveTo(b.x - s + j, tipY + j);
        ctx.quadraticCurveTo(b.x - s * 0.45 + j, elbowY + j, b.x + lean + j, y + j);
        ctx.quadraticCurveTo(b.x + s * 0.45 + j, elbowY + j, b.x + s + j, tipY + j);
        ctx.stroke();
      }
    });
  }

  /* ---------------- shared animation loop, with pause control ------------ */
  var rafId = null;
  var lastT = 0;
  function frame(t) {
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016;
    lastT = t;
    if (visible.has(seaCanvas)) drawWater(seaCanvas, t, true);
    headSeas.forEach(function (c) { if (visible.has(c)) drawWater(c, t, false); });
    drawBirds(t, dt);
    rafId = requestAnimationFrame(frame);
  }
  function startLoop() { if (rafId === null) { lastT = 0; rafId = requestAnimationFrame(frame); } }
  function stopLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    var bctx = birdCanvas.getContext('2d');
    bctx.clearRect(0, 0, birdCanvas.clientWidth, birdCanvas.clientHeight);
  }
  function drawStill() {
    // A single frozen frame so the water composition is still there.
    drawWater(seaCanvas, 40000, true);
    headSeas.forEach(function (c) { drawWater(c, 40000, false); });
  }

  // Pause / play button. The preference is remembered across visits.
  var motionBtn = document.getElementById('motiontoggle');
  var paused = localStorage.getItem('waves-motion') === 'off';

  function applyMotion() {
    if (paused) {
      stopLoop();
      drawStill();
      motionBtn.textContent = '► Play motion';
      motionBtn.setAttribute('aria-pressed', 'true');
    } else {
      startLoop();
      motionBtn.textContent = '❚❚ Pause motion';
      motionBtn.setAttribute('aria-pressed', 'false');
    }
  }
  motionBtn.addEventListener('click', function () {
    paused = !paused;
    try { localStorage.setItem('waves-motion', paused ? 'off' : 'on'); } catch (e) {}
    applyMotion();
  });
  applyMotion();
})();
