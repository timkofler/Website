// Kundenportal und Admin: zwei Glas-Effekte (eigener Nachbau, Idee nach luminaracraft.de).
// 1. Glasleiste: Die Reiter-Kacheln ([data-kp-tabs]) liegen in einer Glasleiste. Eine Glaslinse gleitet zum gewählten Reiter
//    und bricht dabei das Punkteraster der Leiste wie echtes Glas (Chromium: SVG-Verschiebung, sonst weiches Milchglas).
// 2. Zahlen-Karte als Glas-Dashboard: Kacheln aus Glas über warmem Lichtschein, kippen leicht zur Maus.
// 3. Eis-Anmeldung: Jeder Fehlversuch dieses Anschlusses zeigt einen Sprung mehr im Passwortfeld. Bei der Sperre fällt das
//    Feld heraus, das Formular friert ein und taut nach Ablauf der Wartezeit wieder auf. Die Zahlen kommen vom Server
//    (data-fails, data-max, data-rest), die Sperre selbst prüft weiterhin der Server.
// Ohne JavaScript bleibt alles wie bisher.
(function () {
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------- 1. Glasleiste ----------------
  var lensId = 0;
  function sdf(x, y, w, h, r) {
    // Abstand zum Rand eines abgerundeten Rechtecks (negativ = innen)
    var qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
  }
  // Verschiebungskarte: am Rand der Linse wird der Hintergrund nach innen gezogen (Rot = x, Grün = y, 128 = keine Verschiebung).
  function lensMap(w, h, r) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    var band = Math.min(22, h / 2.2);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var s = sdf(x + .5, y + .5, w, h, r), i = (y * w + x) * 4;
        var t = Math.min(1, Math.max(0, 1 + s / band)); // 0 innen, 1 am Rand
        t = t * t * t;
        var nx = sdf(x + 1.5, y + .5, w, h, r) - sdf(x - .5, y + .5, w, h, r);
        var ny = sdf(x + .5, y + 1.5, w, h, r) - sdf(x + .5, y - .5, w, h, r);
        var l = Math.sqrt(nx * nx + ny * ny) || 1;
        d[i] = 128 + 127 * t * nx / l;
        d[i + 1] = 128 + 127 * t * ny / l;
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }
  // backdrop-filter mit SVG-Filter können nur Chromium-Browser (Chrome, Edge, Samsung, Opera).
  var canLens = /Chrome\//.test(navigator.userAgent) && !/Firefox\//.test(navigator.userAgent) &&
    !!(window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#a)'));

  function glassBar(nav) {
    var tiles = Array.prototype.slice.call(nav.querySelectorAll('[data-kp-tab]'));
    if (tiles.length < 2) return;
    nav.classList.add('kp-glass');
    var lens = document.createElement('span');
    lens.className = 'kp-lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.innerHTML = '<span class="kp-lens__in"></span>';
    var hov = document.createElement('span');
    hov.className = 'kp-hov';
    hov.setAttribute('aria-hidden', 'true');
    nav.insertBefore(hov, nav.firstChild);
    nav.insertBefore(lens, nav.firstChild);
    var inner = lens.firstChild;

    var svg = null, feImg = null, filt = null, id = 'kp-lens-' + (++lensId), size = '';
    if (canLens) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.position = 'absolute';
      filt = document.createElementNS(NS, 'filter');
      filt.setAttribute('id', id);
      filt.setAttribute('filterUnits', 'userSpaceOnUse');
      filt.setAttribute('color-interpolation-filters', 'sRGB');
      feImg = document.createElementNS(NS, 'feImage');
      feImg.setAttribute('result', 'map');
      feImg.setAttribute('preserveAspectRatio', 'none');
      var disp = document.createElementNS(NS, 'feDisplacementMap');
      disp.setAttribute('in', 'SourceGraphic');
      disp.setAttribute('in2', 'map');
      disp.setAttribute('scale', '34');
      disp.setAttribute('xChannelSelector', 'R');
      disp.setAttribute('yChannelSelector', 'G');
      filt.appendChild(feImg); filt.appendChild(disp); svg.appendChild(filt);
      nav.appendChild(svg);
      nav.classList.add('kp-glass--lens');
    }

    var cur = null;
    function box(t) { return { x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight }; }
    function place(t, animate) {
      var b = box(t), key = b.w + 'x' + b.h;
      if (key !== size) {
        size = key;
        lens.style.width = hov.style.width = b.w + 'px';
        lens.style.height = hov.style.height = b.h + 'px';
        if (feImg) {
          var r = parseFloat(getComputedStyle(t).borderTopLeftRadius) || 18;
          ['x', 'y'].forEach(function (k) { filt.setAttribute(k, '0'); feImg.setAttribute(k, '0'); });
          filt.setAttribute('width', b.w); filt.setAttribute('height', b.h);
          feImg.setAttribute('width', b.w); feImg.setAttribute('height', b.h);
          feImg.setAttribute('href', lensMap(b.w, b.h, Math.min(r, b.h / 2)));
          inner.style.backdropFilter = inner.style.webkitBackdropFilter = 'url(#' + id + ') saturate(1.7) brightness(1.12)';
        }
      }
      if (!animate) lens.classList.add('is-instant');
      lens.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,0)';
      if (!animate) { void lens.offsetWidth; lens.classList.remove('is-instant'); }
    }
    function active() {
      for (var i = 0; i < tiles.length; i++) if (tiles[i].classList.contains('is-active')) return tiles[i];
      return null;
    }
    function sync(animate) {
      var t = active();
      lens.classList.toggle('is-off', !t);
      if (!t) return;
      if (animate && cur !== t) nav.classList.remove('is-hov');
      if (animate && cur && cur !== t && !reduce) {
        // Kurz flüssig: beim Losgleiten wird die Linse etwas breiter und flacher, am Ziel federt sie zurück.
        lens.classList.add('is-moving');
        clearTimeout(lens._mv);
        lens._mv = setTimeout(function () { lens.classList.remove('is-moving'); }, 190);
      }
      place(t, animate && !!cur);
      cur = t;
    }
    sync(false);
    nav.classList.add('kp-glass--on');
    new MutationObserver(function () { sync(true); }).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    var resync = function () { size = ''; sync(false); };
    if (window.ResizeObserver) new ResizeObserver(resync).observe(nav); else window.addEventListener('resize', resync);

    // Mit Maus: eine zarte Pille zeigt, wohin man gerade zeigt.
    if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      tiles.forEach(function (t) {
        t.addEventListener('pointerenter', function () {
          if (t === cur) { nav.classList.remove('is-hov'); return; }
          var b = box(t);
          hov.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,0)';
          nav.classList.add('is-hov');
        });
      });
      nav.addEventListener('pointerleave', function () { nav.classList.remove('is-hov'); });
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-kp-tabs]'), glassBar);

  // ---------------- Zahlen-Karte: Glaskacheln kippen leicht zur Maus, ein Lichtfleck folgt dem Zeiger ----------------
  if (!reduce && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.kp-zahlen .kp-zahl'), function (k) {
      var raf = 0, ev = null;
      function upd() {
        raf = 0;
        var r = k.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        k.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        k.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        k.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg');
        k.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg');
      }
      k.addEventListener('pointermove', function (e) { ev = e; k.classList.add('is-lit'); if (!raf) raf = requestAnimationFrame(upd); });
      k.addEventListener('pointerleave', function () {
        k.classList.remove('is-lit');
        k.style.setProperty('--rx', '0deg'); k.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---------------- 2. Eis-Anmeldung ----------------
  var form = document.querySelector('[data-kp-frost]');
  if (!form) return;
  var field = form.querySelector('.kp-pw');
  var pw = field && field.querySelector('input');
  if (!field || !pw) return;
  var fails = +form.getAttribute('data-fails') || 0;
  var max = +form.getAttribute('data-max') || 5;
  var rest = +form.getAttribute('data-rest') || 0;
  var justFailed = !!form.querySelector('.form__status.is-error');
  var btn = form.querySelector('button[type=submit]');

  // Feste Zufallszahlen: derselbe Sprung sieht nach jedem Neuladen gleich aus.
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // Sprünge je Stufe: Strahlen aus einem Einschlagpunkt, mit jeder Stufe mehr und länger, ab Stufe 3 Querrisse.
  function cracks(w, h) {
    seed = 7;
    var ox = w * .7, oy = h * .58, levels = [];
    var rays = [];
    for (var i = 0; i < 11; i++) rays.push({ a: (i / 11) * Math.PI * 2 + (rnd() - .5) * .5, pts: [[ox, oy]] });
    function grow(r, len) {
      var p = r.pts[r.pts.length - 1], steps = 3;
      for (var s = 0; s < steps; s++) {
        var a = r.a + (rnd() - .5) * .7, l = len / steps;
        p = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l * .55];
        r.pts.push(p);
      }
    }
    function path(pts) {
      return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    }
    var plan = [[0, 3, 26], [3, 6, 40], [0, 6, 60], [6, 11, 90], [0, 11, 160]];
    plan.forEach(function (st, lv) {
      var ds = [];
      for (var i = st[0]; i < st[1]; i++) {
        var from = rays[i].pts.length - 1;
        grow(rays[i], st[2] * (.7 + rnd() * .6));
        ds.push(path(rays[i].pts.slice(from)));
      }
      if (lv >= 2) {
        // Querrisse zwischen benachbarten Strahlen, wie Ringe um den Einschlag
        for (var k = 0; k < (lv === 2 ? 3 : 6); k++) {
          var a = rays[Math.floor(rnd() * 6)], b = rays[(rays.indexOf(a) + 1) % rays.length];
          var ia = Math.min(a.pts.length - 1, 1 + Math.floor(rnd() * 3)), ib = Math.min(b.pts.length - 1, 1 + Math.floor(rnd() * 3));
          ds.push(path([a.pts[ia], [(a.pts[ia][0] + b.pts[ib][0]) / 2 + (rnd() - .5) * 8, (a.pts[ia][1] + b.pts[ib][1]) / 2 + (rnd() - .5) * 4], b.pts[ib]]));
        }
      }
      levels.push(ds);
    });
    return levels;
  }

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'kp-crack');
  svg.setAttribute('aria-hidden', 'true');
  field.appendChild(svg);
  function drawCracks(n, animateLast) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var w = field.offsetWidth, h = field.offsetHeight;
    if (!w || !h || n < 1) return;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var lv = cracks(w, h);
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', (w * .7).toFixed(1)); dot.setAttribute('cy', (h * .58).toFixed(1)); dot.setAttribute('r', String(1.2 + n * .5));
    for (var i = 0; i < Math.min(n, lv.length); i++) {
      lv[i].forEach(function (d) {
        ['kp-crack__sh', 'kp-crack__ln'].forEach(function (cls) {
          var p = document.createElementNS(NS, 'path');
          p.setAttribute('d', d);
          p.setAttribute('class', cls);
          svg.appendChild(p);
          if (animateLast && i === n - 1 && !reduce) {
            var len = p.getTotalLength ? p.getTotalLength() : 200;
            p.style.strokeDasharray = len;
            p.style.strokeDashoffset = len;
            p.getBoundingClientRect();
            p.style.transition = 'stroke-dashoffset .32s cubic-bezier(.23,1,.32,1)';
            p.style.strokeDashoffset = '0';
          }
        });
      });
    }
    svg.appendChild(dot);
    field.classList.toggle('is-cracked', n > 0);
  }

  var hint = document.createElement('p');
  hint.className = 'kp-frost__hint';
  hint.setAttribute('aria-live', 'polite');
  field.parentNode.parentNode.insertBefore(hint, field.parentNode.nextSibling);
  function setHint() {
    var left = max - fails;
    hint.textContent = fails > 0 && left > 0 ? (left === 1 ? 'Noch 1 Versuch, dann ist die Anmeldung kurz gesperrt.' : 'Noch ' + left + ' Versuche, dann ist die Anmeldung kurz gesperrt.') : '';
    hint.classList.toggle('is-last', left === 1);
  }

  function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function freeze(fall) {
    var ice = document.createElement('div');
    ice.className = 'kp-frost';
    ice.setAttribute('role', 'status');
    ice.innerHTML = '<span class="kp-frost__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5M3 10.2l3.4.9-.9-3.4M21 13.8l-3.4-.9.9 3.4M3 13.8l3.4-.9-.9 3.4M21 10.2l-3.4.9.9-3.4"/></svg></span>' +
      '<b>Eingefroren</b><span>Zu viele Fehlversuche. Zum Schutz deines Zugangs taut die Anmeldung in <time class="kp-frost__t"></time> wieder auf.</span>';
    form.appendChild(ice);
    var t = ice.querySelector('.kp-frost__t');
    t.textContent = mmss(rest);
    Array.prototype.forEach.call(form.querySelectorAll('input:not([type=hidden]), button'), function (el) { el.disabled = true; });
    form.classList.add('is-frozen');
    hint.textContent = '';
    if (fall && !reduce) {
      field.classList.add('is-falling');
      setTimeout(function () { form.classList.add('is-ice'); }, 420);
    } else {
      field.classList.add('is-gone');
      form.classList.add('is-ice');
    }
    var end = Date.now() + rest * 1000;
    var iv = setInterval(function () {
      var s = Math.max(0, Math.round((end - Date.now()) / 1000));
      t.textContent = mmss(s);
      if (s > 0) return;
      clearInterval(iv);
      thaw(ice);
    }, 1000);
  }
  function thaw(ice) {
    fails = 0;
    drawCracks(0);
    form.classList.remove('is-ice');
    field.classList.remove('is-falling', 'is-gone');
    field.classList.add('is-back');
    Array.prototype.forEach.call(form.querySelectorAll('input:not([type=hidden]), button'), function (el) { el.disabled = false; });
    var err = form.querySelector('.form__status.is-error');
    if (err) err.remove();
    setTimeout(function () { ice.remove(); form.classList.remove('is-frozen'); field.classList.remove('is-back'); }, reduce ? 0 : 700);
    hint.textContent = 'Wieder aufgetaut. Du kannst dich jetzt anmelden.';
  }

  function start() {
    if (rest > 0) {
      drawCracks(max, false);
      freeze(justFailed);
    } else {
      drawCracks(fails, justFailed);
      setHint();
      if (justFailed && fails > 0 && !reduce) {
        field.classList.add('is-hit');
        setTimeout(function () { field.classList.remove('is-hit'); }, 400);
      }
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  if (window.ResizeObserver) {
    var lw = 0;
    new ResizeObserver(function () { var w = field.offsetWidth; if (w && w !== lw && lw) drawCracks(rest > 0 ? max : fails, false); lw = w; }).observe(field);
  }
  // Beim Tippen wird ein Sprung nicht weggezaubert, aber das Feld bleibt gut lesbar (Sprünge liegen hinter dem Text).
  if (btn) form.addEventListener('submit', function () { btn.classList.add('is-busy'); });
})();
