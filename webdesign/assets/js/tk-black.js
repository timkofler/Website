// Black Edition: das Design der Seite (echtes Schwarz, Glas, Orange nur als Akzent).
// Black ist Standard. Seit 27.10.2026 gibt es dazu die helle „White Edition“ (Klasse tk-white zusätzlich zu tk-black),
// umschaltbar im Kopf; die Wahl bleibt im Browser (localStorage „tk-edition“), sonst wird nichts gespeichert.
// Wird im <head> ohne defer geladen, damit die Klasse sofort sitzt und nichts aufblitzt.
(function () {
  var root = document.documentElement;
  root.classList.add("tk-black");
  try { localStorage.removeItem("tk-black"); } catch (e) {}
  var KEY = "tk-edition";
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  var q = /[?&]edition=(white|black)\b/.exec(location.search);
  // white.css wird nur geladen, wenn White gewählt ist (Black-Besucher sparen die Datei).
  // Die Adresse steht im <meta name="tk-white-css"> vor diesem Skript.
  var wm = document.querySelector('meta[name="tk-white-css"]'), WCSS = wm && wm.getAttribute("content");
  function whiteLink() { return document.querySelector('link[href*="/white.css"]'); }
  function loadWhite(cb) {
    var l = whiteLink();
    if (!l) {
      l = document.createElement("link"); l.rel = "stylesheet"; l.href = WCSS;
      l.addEventListener("load", function () { l.setAttribute("data-ok", ""); });
      document.head.appendChild(l);
    }
    if (!cb) return;
    if (l.hasAttribute("data-ok") || l.sheet) { cb(); return; }
    var done = false, go = function () { if (!done) { done = true; cb(); } };
    l.addEventListener("load", go); l.addEventListener("error", go); setTimeout(go, 2500);
  }
  function apply(ed) {
    root.classList.toggle("tk-white", ed === "white");
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", ed === "white" ? "#f6f3ee" : "#0b0b0c");
  }
  // Nur auf Seiten mit white.css (nicht im Kundenportal)
  var hasWhite = !!WCSS;
  var first = hasWhite ? (q ? q[1] : saved()) : "black";
  // Beim Seitenaufbau per document.write, damit die Datei wie ein normales <link> den ersten Anblick abwartet (kein Aufblitzen)
  if (first === "white" && document.readyState === "loading") document.write('<link rel="stylesheet" href="' + WCSS + '">');
  else if (first === "white") loadWhite();
  apply(first);

  // Umschalter im Kopf: zwei Felder „Black | White“, am Handy ein runder Knopf mit Sonne/Mond
  function switcher() {
    var head = document.querySelector(".header__inner");
    if (!head || head.querySelector(".tk-ed") || !hasWhite) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "tk-ed";
    b.innerHTML = '<span class="tk-ed__o tk-ed__b"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg><em>Black</em></span>' +
      '<span class="tk-ed__o tk-ed__w"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><em>White</em></span>';
    function label() {
      var w = root.classList.contains("tk-white");
      b.setAttribute("aria-pressed", w ? "true" : "false");
      b.setAttribute("aria-label", w ? "Zur Black Edition wechseln" : "Zur White Edition wechseln");
      b.title = w ? "Black Edition" : "White Edition";
    }
    // Schon beim Zeigen/Antippen vorladen, damit der Wechsel sofort sitzt
    ["pointerenter", "touchstart", "focus"].forEach(function (ev) { b.addEventListener(ev, function () { loadWhite(); }, { passive: true, once: true }); });
    b.addEventListener("click", function () {
      var ed = root.classList.contains("tk-white") ? "black" : "white";
      if (ed === "white") loadWhite(function () { swap(ed); }); else swap(ed);
    });
    function swap(ed) {
      root.classList.add("tk-ed-anim");
      apply(ed); label();
      try { localStorage.setItem(KEY, ed); ["va-theme2", "ba-theme2", "tk-dash-theme2"].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}  // App-Beispiele folgen danach wieder der Edition
      setTimeout(function () { root.classList.remove("tk-ed-anim"); }, 450);
    }
    label();
    var free = head.querySelector(".header__free"), end = head.querySelector(".header__end, .ew-head");
    if (free) free.parentNode.insertBefore(b, free);
    else if (end) end.insertBefore(b, end.firstChild);
    else head.appendChild(b);
  }

  // Footer-Logo zeichnet sich selbst, sobald es ins Bild kommt (Hilfslinien, Ankerpunkte, Umrisse, dann Füllung),
  // wie bei der Logo-Animation. Ohne JavaScript oder bei "Bewegung reduzieren" bleibt das normale Bild stehen.
  function footLogo() {
    var img = document.querySelector(".tk-logo--foot img");
    if (!img || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var T = "M0,.5 L502,.5 L389,87.5 L286,87.5 L286,281.5 L187.5,354.5 L187.5,87.5 L104,87.5 Z",
        K = "M540,0 L702,0 L470,180.5 L701,358.5 L540,358.5 L307,181.5 Z",
        pts = [[0,.5],[502,.5],[389,87.5],[286,87.5],[286,281.5],[187.5,354.5],[187.5,87.5],[104,87.5],[540,0],[702,0],[470,180.5],[701,358.5],[540,358.5],[307,181.5]];
    var a = "";
    for (var i = 0; i < pts.length; i++) a += '<rect class="tkd-a" style="--i:' + i + '" x="' + (pts[i][0] - 16) + '" y="' + (pts[i][1] - 16) + '" width="32" height="32"/>';
    var w = document.createElement("span");
    w.className = "tkd";
    w.innerHTML = '<svg viewBox="0 0 702 358.5" role="img" aria-label="' + (img.getAttribute("alt") || "") + '">' +
      '<g class="tkd-g"><rect x="0" y="0" width="702" height="358.5" pathLength="100"/><line x1="-60" y1="87.5" x2="762" y2="87.5" pathLength="100"/><line x1="-60" y1="181" x2="762" y2="181" pathLength="100"/>' +
      '<line x1="187.5" y1="-50" x2="187.5" y2="410" pathLength="100"/><line x1="286" y1="-50" x2="286" y2="410" pathLength="100"/><circle cx="470" cy="180.5" r="150" pathLength="100"/></g>' +
      '<path class="tkd-o tkd-t" d="' + T + '" pathLength="100"/><path class="tkd-o tkd-k" d="' + K + '" pathLength="100"/>' + a + '</svg>';
    img.parentNode.replaceChild(w, img);
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { w.classList.add("is-drawn"); io.disconnect(); setTimeout(function () { w.classList.add("is-done"); loop(); }, 3000); }
    }, { threshold: .9 });
    io.observe(w);
    // Dauerschleife (Tim 27.10.): fertig stehen lassen, rückwärts wieder auflösen, kurz leer, neu zeichnen
    var CYCLE = 3000, HOLD = 3500, GAP = 700;
    function loop() {
      if (!w.getAnimations) return;
      var anims = w.getAnimations({ subtree: true });
      setTimeout(function () {
        w.classList.remove("is-done");
        anims.forEach(function (a) { a.playbackRate = -1; a.play(); a.currentTime = CYCLE; });
        setTimeout(function () {
          anims.forEach(function (a) { a.pause(); a.currentTime = 0; a.playbackRate = 1; });
          setTimeout(function () {
            anims.forEach(function (a) { a.play(); });
            setTimeout(function () { w.classList.add("is-done"); loop(); }, CYCLE);
          }, GAP);
        }, CYCLE);
      }, HOLD);
    }
  }

  // "Nach oben"-Knopf: erscheint nach einem Bildschirm Scrollen, sitzt über WhatsApp/Fragen? unten rechts
  function topBtn() {
    if (document.querySelector(".tk-top")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "tk-top";
    b.setAttribute("aria-label", "Nach oben"); b.title = "Nach oben";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    b.addEventListener("click", function () {
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    });
    document.body.appendChild(b);
    var on = false, tick = false;
    function check() {
      tick = false;
      var v = window.scrollY > window.innerHeight * 0.9;
      if (v !== on) { on = v; b.classList.toggle("is-on", v); }
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(check); } }, { passive: true });
    check();
    // Ganz unten blendet der schwebende Knopf aus (tk-at-end), damit „Tim Kofler" frei steht; dafür steht der Knopf dort ruhig unter dem Schriftzug
    var sign = document.querySelector(".tk-sign");
    if (sign && !document.querySelector(".tk-top-end")) {
      var e = document.createElement("button");
      e.type = "button"; e.className = "tk-top-end";
      e.innerHTML = b.innerHTML + "<span>Nach oben</span>";
      e.addEventListener("click", function () { b.click(); });
      sign.insertAdjacentElement("afterend", e);
    }
  }

  // Startseite: schon hier entscheiden, ob die 3D-Plakette läuft. Ohne Grafikchip (Software-WebGL), bei "Bewegung reduzieren",
  // Datensparmodus oder wenig Speicher sitzt die Klasse tk-3d-still sofort und das Standbild lädt gleich mit der Seite.
  // Das Ergebnis liest tk-hero3d.js aus window.tkHero3d (keine zweite Prüfung).
  if (document.querySelector('meta[name="tk-hero-3d"]')) {
    var ok3d = false;
    try {
      var c = navigator.connection || {};
      var low = c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || "") || (navigator.deviceMemory && navigator.deviceMemory < 4);
      var red = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!low && !red) {
        var cv = document.createElement("canvas"), gl = window.WebGLRenderingContext && (cv.getContext("webgl2") || cv.getContext("webgl"));
        if (gl) {
          var ext = gl.getExtension("WEBGL_debug_renderer_info"), rn = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
          ok3d = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(rn || ""));
          var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
        }
      }
    } catch (e) { ok3d = false; }
    window.tkHero3d = ok3d;
    if (!ok3d) root.classList.add("tk-3d-still");
  }

  function mount() { switcher(); footLogo(); topBtn(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
