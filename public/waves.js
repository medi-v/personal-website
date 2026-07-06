// Animations for the /waves page.
// Lives in public/ as a plain external file — the site's Content-Security-
// Policy allows only external same-origin scripts, no inline ones
// (same pattern as blog-filter.js).
//
// Everything here is decoration: the page is fully readable without it.
(function () {
  'use strict';

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- thread geometry: build the S-curve paths ------------- */
  var rails = Array.prototype.slice.call(document.querySelectorAll('.rail'));
  if (rails.length === 0) return; // not on the waves page

  function buildPaths() {
    rails.forEach(function (rail) {
      var svgEl = rail.querySelector('.flow');
      var h = rail.offsetHeight;
      var w = 120, mid = w / 2, amp = 34, step = 240;
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

  if (reduceMotion) {
    rails.forEach(function (rail) { rail._drawn.style.strokeDashoffset = '0'; });
    addEventListener('scroll', function () {
      wavenav.classList.toggle('show', scrollY > innerHeight * 0.8);
    }, { passive: true });
  } else {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }, { passive: true });
    onScroll();
  }

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
  reveal('.item, .interlude', { threshold: 0.15 });
  reveal('.wave-head', { rootMargin: '0px 0px -18% 0px' });

  /* ---------------- the water --------------------------------------------
     One shared animation loop drives the hero sea and the faint ambient
     water behind each wave heading. Canvases only draw while on screen. */
  var seaCanvas = document.getElementById('sea');
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

  function sizeCanvas(c) {
    c.width = c.clientWidth * devicePixelRatio;
    c.height = c.clientHeight * devicePixelRatio;
    c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  function sizeAll() { [seaCanvas].concat(headSeas).forEach(sizeCanvas); }
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

  function frame(t) {
    if (visible.has(seaCanvas)) drawWater(seaCanvas, t, true);
    headSeas.forEach(function (c) { if (visible.has(c)) drawWater(c, t, false); });
    requestAnimationFrame(frame);
  }
  if (reduceMotion) {
    // One still frame so the composition is there, without motion.
    drawWater(seaCanvas, 40000, true);
    headSeas.forEach(function (c) { drawWater(c, 40000, false); });
  } else {
    requestAnimationFrame(frame);
  }
})();
