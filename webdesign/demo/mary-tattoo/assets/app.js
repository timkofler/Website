/* Mary's Tattoo Studio · Entwurf · kleine Helfer ohne Bibliotheken */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Kopfzeile + Menü ---------- */
  var nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }
  burger.addEventListener("click", function () { setMenu(menu.hidden); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- Einblenden ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.documentElement.classList.add("no-io");
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Toast ---------- */
  var toast = $("#toast"), toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  $$("[data-toast]").forEach(function (b) { b.addEventListener("click", function () { showToast(b.getAttribute("data-toast")); }); });

  /* ---------- Dotwork-Mandala im Startbild ---------- */
  var mc = $("#mandala");
  if (mc && mc.getContext) {
    var mx = mc.getContext("2d"), dots = [], mw = 0, mh = 0, dpr = 1, start = performance.now(), visible = true;
    function buildMandala() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      mw = mc.clientWidth; mh = mc.clientHeight;
      mc.width = mw * dpr; mc.height = mh * dpr;
      dots = [];
      var R = Math.min(Math.max(mw, mh) * 0.5, 620);
      var rings = 40;
      for (var i = 1; i <= rings; i++) {
        var r = (i / rings) * R;
        var n = Math.max(6, Math.round(r / 7));
        var petals = 12;
        for (var k = 0; k < n; k++) {
          var a = (k / n) * Math.PI * 2;
          var wave = 0.5 + 0.5 * Math.cos(a * petals + (i % 2) * Math.PI / petals * 6);
          var size = 2.6 * Math.pow(wave, 2) * (1 - i / rings * 0.25);
          if (size < 0.6) continue;
          dots.push({ r: r, a: a, s: size, d: i / rings, ring: i });
        }
      }
    }
    function drawMandala(t) {
      var e = (t - start) / 1000;
      var cx = mw > 860 ? mw * 0.73 : mw * 0.5, cy = mw > 860 ? mh * 0.52 : mh * 0.78;
      mx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mx.clearRect(0, 0, mw, mh);
      var grow = reduce ? 1 : Math.min(1, e / 2.6);
      for (var j = 0; j < dots.length; j++) {
        var p = dots[j];
        if (p.d > grow) continue;
        var rot = reduce ? 0 : e * 0.03 * (p.ring % 2 ? 1 : -1);
        var x = cx + Math.cos(p.a + rot) * p.r, y = cy + Math.sin(p.a + rot) * p.r;
        if (x < -4 || y < -4 || x > mw + 4 || y > mh + 4) continue;
        var alpha = 0.3 + 0.3 * (1 - p.d);
        mx.fillStyle = p.ring % 7 === 0 ? "rgba(60,196,180," + (alpha + 0.15) + ")" : "rgba(241,235,225," + alpha + ")";
        mx.beginPath(); mx.arc(x, y, p.s, 0, 6.283); mx.fill();
      }
      if (!reduce && visible) requestAnimationFrame(drawMandala);
    }
    buildMandala();
    requestAnimationFrame(drawMandala);
    var rT;
    window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { buildMandala(); if (reduce) drawMandala(performance.now()); }, 150); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var was = visible; visible = en[0].isIntersecting;
        if (visible && !was && !reduce) requestAnimationFrame(drawMandala);
      }).observe(mc);
    }
  }

  /* ---------- Parallax Startbild ---------- */
  var arch = $(".arch");
  if (arch && !reduce) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) arch.style.setProperty("--py", (y * 0.08).toFixed(1) + "px");
    }, { passive: true });
  }

  /* ---------- Karten: Mauslicht und leichte Neigung ---------- */
  if (window.matchMedia("(hover: hover)").matches && !reduce) {
    $$("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var b = c.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        c.style.setProperty("--mx", (px * 100) + "%"); c.style.setProperty("--my", (py * 100) + "%");
        c.style.setProperty("--ry", ((px - 0.5) * 6) + "deg"); c.style.setProperty("--rx", ((0.5 - py) * 6) + "deg");
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ---------- Pepper-Shading-Symbol (Zufallspunkte, fest) ---------- */
  var pep = $("#pepper-ico");
  if (pep) {
    var seed = 7, html = "";
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var q = 0; q < 260; q++) {
      var px2 = rnd() * 64, py2 = rnd() * 64, dx = px2 - 22, dy = py2 - 22, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 40) continue;
      if (rnd() > 1 - dist / 46) continue;
      html += '<circle cx="' + px2.toFixed(1) + '" cy="' + py2.toFixed(1) + '" r="' + (0.6 + rnd() * 0.7).toFixed(2) + '"/>';
    }
    pep.innerHTML = html;
  }

  /* ---------- Stil-Labor ---------- */
  var labImg = $("#labImg"), canvas = $("#labCanvas"), range = $("#labRange"), compare = $("#compare"), styleName = $("#labStyleName");
  var current = { animal: "pferd", style: "dotwork", src: "assets/img/pferd.webp" };
  var NAMES = { dotwork: "Dotwork", pepper: "Pepper Shading", colour: "Colour", bw: "Black & Grey" };
  var ALTS = { pferd: "Foto: braunes Pferd vor schwarzem Hintergrund", hund: "Foto: Golden Retriever vor schwarzem Hintergrund", katze: "Foto: rote Katze vor schwarzem Hintergrund" };
  var W = 720, H = 900;

  function lum(d, i) { return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; }

  function render() {
    if (!canvas || !labImg.complete || !labImg.naturalWidth) return;
    var ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    // Bild wie object-fit: cover einpassen
    var iw = labImg.naturalWidth, ih = labImg.naturalHeight, sc = Math.max(W / iw, H / ih);
    var dw = iw * sc, dh = ih * sc, ox = (W - dw) / 2, oy = (H - dh) / 2;
    var off = document.createElement("canvas"); off.width = W; off.height = H;
    var o = off.getContext("2d");
    o.fillStyle = "#000"; o.fillRect(0, 0, W, H);
    o.drawImage(labImg, ox, oy, dw, dh);
    var src = o.getImageData(0, 0, W, H), d = src.data;
    // Helligkeit angleichen: dunkle Fotos (Tier vor Schwarz) werden aufgehellt
    var hist = new Uint32Array(256), t;
    for (t = 0; t < d.length; t += 16) hist[Math.min(255, Math.round(0.299 * d[t] + 0.587 * d[t + 1] + 0.114 * d[t + 2]))]++;
    var total = d.length / 16, acc = 0, hi = 255;
    for (t = 255; t > 0; t--) { acc += hist[t]; if (acc > total * 0.015) { hi = t; break; } }
    var lo = 22, gain = Math.min(3, 245 / Math.max(40, hi - lo));
    var lv = function (v) { v = (v - lo) * gain / 255; return v <= 0 ? 0 : Math.min(255, 255 * Math.pow(v, 0.85)); };
    for (t = 0; t < d.length; t += 4) { d[t] = lv(d[t]); d[t + 1] = lv(d[t + 1]); d[t + 2] = lv(d[t + 2]); }
    var st = current.style, x, y, i, l;

    if (st === "dotwork") {
      ctx.fillStyle = "#0f0e0d"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f1ebe1";
      var g = 9;
      for (y = 0; y < H; y += g) {
        for (x = (y / g) % 2 ? g / 2 : 0; x < W; x += g) {
          i = ((Math.min(H - 1, y | 0)) * W + Math.min(W - 1, x | 0)) * 4;
          l = lum(d, i) / 255;
          l = Math.pow(l, 0.9);
          var r = l * g * 0.56;
          if (r < 0.35) continue;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        }
      }
    } else if (st === "pepper") {
      ctx.fillStyle = "#0f0e0d"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f1ebe1";
      var s = 12345, n = 260000;
      var rr = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (var k = 0; k < n; k++) {
        x = rr() * W; y = rr() * H;
        i = ((y | 0) * W + (x | 0)) * 4;
        l = lum(d, i) / 255;
        if (rr() < Math.pow(l, 1.5)) ctx.fillRect(x, y, 1.4, 1.4);
      }
    } else if (st === "bw") {
      var out = ctx.createImageData(W, H), od = out.data;
      for (i = 0; i < d.length; i += 4) {
        l = lum(d, i) / 255;
        l = l < 0.5 ? 2 * l * l : 1 - 2 * (1 - l) * (1 - l); // mehr Kontrast
        l = Math.round(Math.pow(l, 1.05) * 235 + 8);
        od[i] = l; od[i + 1] = l * 0.985; od[i + 2] = l * 0.96; od[i + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
    } else { // colour: Farben verstärken, in Stufen setzen, dunkle Konturen
      var out2 = ctx.createImageData(W, H), o2 = out2.data, L = new Float32Array(W * H);
      for (i = 0, k = 0; i < d.length; i += 4, k++) L[k] = lum(d, i);
      for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
          k = y * W + x; i = k * 4;
          var rC = d[i], gC = d[i + 1], bC = d[i + 2], m = (rC + gC + bC) / 3;
          rC = m + (rC - m) * 1.9; gC = m + (gC - m) * 1.9; bC = m + (bC - m) * 1.9;
          var step = 48;
          rC = Math.round(rC / step) * step; gC = Math.round(gC / step) * step; bC = Math.round(bC / step) * step;
          var gx = 0, gy = 0;
          if (x > 0 && y > 0 && x < W - 1 && y < H - 1) {
            gx = -L[k - W - 1] - 2 * L[k - 1] - L[k + W - 1] + L[k - W + 1] + 2 * L[k + 1] + L[k + W + 1];
            gy = -L[k - W - 1] - 2 * L[k - W] - L[k - W + 1] + L[k + W - 1] + 2 * L[k + W] + L[k + W + 1];
          }
          var edge = Math.sqrt(gx * gx + gy * gy) > 120 ? 0.15 : 1;
          o2[i] = Math.max(0, Math.min(255, rC)) * edge;
          o2[i + 1] = Math.max(0, Math.min(255, gC)) * edge;
          o2[i + 2] = Math.max(0, Math.min(255, bC)) * edge;
          o2[i + 3] = 255;
        }
      }
      ctx.putImageData(out2, 0, 0);
    }
    compare.classList.remove("is-busy");
  }

  function scheduleRender() {
    compare.classList.add("is-busy");
    // erst den Zustand zeigen, dann rechnen
    setTimeout(function () {
      if (labImg.complete && labImg.naturalWidth) render();
      else labImg.addEventListener("load", render, { once: true });
    }, 30);
  }

  function setPressed(group, el) {
    $$(group).forEach(function (b) { var on = b === el; b.classList.toggle("is-on", on); if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", on ? "true" : "false"); });
  }

  $$("[data-animal]").forEach(function (b) {
    b.addEventListener("click", function () {
      current.animal = b.getAttribute("data-animal");
      setPressed("[data-animal], .chip--file", b);
      labImg.src = "assets/img/" + current.animal + ".webp";
      labImg.alt = ALTS[current.animal];
      scheduleRender();
    });
  });
  function setStyle(st) {
    current.style = st;
    setPressed("[data-style]", $('[data-style="' + st + '"]'));
    styleName.textContent = NAMES[st];
    scheduleRender();
  }
  $$("[data-style]").forEach(function (b) { b.addEventListener("click", function () { setStyle(b.getAttribute("data-style")); }); });
  $$("[data-try]").forEach(function (b) {
    b.addEventListener("click", function () {
      setStyle(b.getAttribute("data-try"));
      $("#labor").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  var own = $("#ownPhoto");
  if (own) {
    own.addEventListener("change", function () {
      var f = own.files && own.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      var url = URL.createObjectURL(f);
      setPressed("[data-animal], .chip--file", own.parentNode);
      labImg.onload = function () { URL.revokeObjectURL(url); labImg.onload = null; };
      labImg.src = url; labImg.alt = "Dein eigenes Foto";
      scheduleRender();
    });
  }

  if (range) {
    var setPos = function () { compare.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", setPos);
    setPos();
    // Ziehen mit Finger oder Maus direkt auf dem Bild (iPhone kann versteckte Regler nur am Griff bewegen)
    var dragging = false, sx = 0, sy = 0, decided = false;
    var moveTo = function (clientX) {
      var b = compare.getBoundingClientRect();
      var v = Math.max(0, Math.min(100, (clientX - b.left) / b.width * 100));
      range.value = v; compare.style.setProperty("--pos", v + "%");
    };
    compare.addEventListener("pointerdown", function (e) {
      dragging = true; decided = e.pointerType === "mouse"; sx = e.clientX; sy = e.clientY;
      if (decided) { moveTo(e.clientX); compare.setPointerCapture(e.pointerId); }
    });
    compare.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; } // senkrecht: Seite scrollt normal
        decided = true; try { compare.setPointerCapture(e.pointerId); } catch (err) {}
      }
      moveTo(e.clientX);
    });
    var stop = function (e) {
      if (dragging && !decided && e.type === "pointerup") moveTo(e.clientX); // kurzer Tipp springt dorthin
      dragging = false;
    };
    compare.addEventListener("pointerup", stop);
    compare.addEventListener("pointercancel", stop);
  }
  if (labImg) {
    // Erst rechnen, wenn das Labor in die Nähe kommt
    if ("IntersectionObserver" in window) {
      var lio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { lio.disconnect(); scheduleRender(); hintSwipe(); }
      }, { rootMargin: "300px 0px" });
      lio.observe(compare);
    } else scheduleRender();
  }
  // kleiner Hinweis: Regler bewegt sich einmal kurz von selbst
  function hintSwipe() {
    if (reduce || !range) return;
    var t0 = null;
    function f(t) {
      if (!t0) t0 = t;
      var p = (t - t0) / 1600;
      if (p > 1) { range.value = 55; compare.style.setProperty("--pos", "55%"); return; }
      var v = 55 + Math.sin(p * Math.PI * 2) * 22;
      range.value = v; compare.style.setProperty("--pos", v + "%");
      requestAnimationFrame(f);
    }
    setTimeout(function () { requestAnimationFrame(f); }, 900);
  }

  /* ---------- Beratungsabend: nächster erster Donnerstag ---------- */
  var MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function firstThursday(y, m) { var d = new Date(y, m, 1); var off = (4 - d.getDay() + 7) % 7; return new Date(y, m, 1 + off, 16, 30); }
  function upcoming(count) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), list = [];
    while (list.length < count) {
      var ft = firstThursday(y, m), end = new Date(ft.getTime()); end.setHours(19, 30);
      if (end > now) list.push(ft);
      m++; if (m > 11) { m = 0; y++; }
    }
    return list;
  }
  var next = upcoming(4), n0 = next[0];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var dDay = Math.round((new Date(n0.getFullYear(), n0.getMonth(), n0.getDate()) - today) / 86400000);
  var inTxt = dDay === 0 ? "Heute, ohne Termin vorbeikommen!" : dDay === 1 ? "Schon morgen" : "In " + dDay + " Tagen";
  var short = "Do, " + n0.getDate() + ". " + MON[n0.getMonth()];
  $$("[data-next-beratung]").forEach(function (el) { el.textContent = short + ", 16:30"; });
  var cm = $("[data-cal-month]"); if (cm) cm.textContent = MON[n0.getMonth()] + " " + n0.getFullYear();
  var cd = $("[data-cal-day]"); if (cd) cd.textContent = n0.getDate();
  var cw = $("[data-cal-wd]"); if (cw) cw.textContent = "Donnerstag";
  var ci = $("[data-cal-in]"); if (ci) ci.textContent = inTxt;
  var cl = $("[data-cal-list]");
  if (cl) cl.innerHTML = next.slice(1).map(function (d) { return "<li>Danach: Do, " + d.getDate() + ". " + MON[d.getMonth()] + " " + d.getFullYear() + "</li>"; }).join("");

  var ics = $("#icsBtn");
  if (ics) {
    ics.addEventListener("click", function () {
      var pad = function (v) { return (v < 10 ? "0" : "") + v; };
      var ds = n0.getFullYear() + pad(n0.getMonth() + 1) + pad(n0.getDate());
      var txt = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Marys Tattoo Studio//Entwurf//DE",
        "BEGIN:VEVENT", "UID:beratung-" + ds + "@marys-tattoo-entwurf",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
        "DTSTART;TZID=Europe/Vienna:" + ds + "T163000", "DTEND;TZID=Europe/Vienna:" + ds + "T193000",
        "RRULE:FREQ=MONTHLY;BYDAY=1TH",
        "SUMMARY:Beratungsabend Mary's Tattoo Studio",
        "LOCATION:Schönauergasse 3a\\, 3264 Gresten",
        "DESCRIPTION:Ohne Termin vorbeikommen und unverbindlich beraten lassen.",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      var blob = new Blob([txt], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "beratungsabend-marys-tattoo.ics";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      showToast("Termin gespeichert, jeden ersten Donnerstag im Monat.");
    });
  }

  /* ---------- Ablauf: Linie zeichnet sich beim Scrollen ---------- */
  var steps = $("#steps");
  if (steps) {
    var drawLine = function () {
      var b = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.75 - b.top) / b.height;
      steps.style.setProperty("--draw", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    if (reduce) steps.style.setProperty("--draw", "1");
    else { window.addEventListener("scroll", drawLine, { passive: true }); drawLine(); }
  }

  /* ---------- Galerie: am Handy färbt sich das Bild in der Mitte ein ---------- */
  if (!window.matchMedia("(hover: hover)").matches && "IntersectionObserver" in window) {
    var gio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle("is-lit", e.isIntersecting); });
    }, { rootMargin: "-35% 0px -35% 0px" });
    $$(".gallery figure").forEach(function (f) { gio.observe(f); });
  }

  /* ---------- Anfrage (Entwurf: nichts wird verschickt) ---------- */
  var form = $("#form");
  if (form) {
    var fileIn = form.querySelector('input[type="file"]'), info = $("#fileInfo");
    fileIn.addEventListener("change", function () {
      var c = fileIn.files.length;
      info.textContent = c ? c + (c === 1 ? " Datei gewählt" : " Dateien gewählt") : "optional";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.elements.name.value.trim() && form.elements.kontakt.value.trim();
      $("#formErr").hidden = !!ok;
      $("#formOk").hidden = !ok;
      if (ok) $("#formOk").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }
})();
