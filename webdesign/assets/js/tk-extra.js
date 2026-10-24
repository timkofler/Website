// Tim Kofler – Lesefortschritt, Dashboard-Vorschau und schwebender Hinweis auf die Beispielseiten.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lesefortschritt als dünne Linie am oberen Rand
  var bar = document.createElement("div");
  bar.className = "tk-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function progress() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  // Dashboard-Vorschau: Balken wachsen und Zahlen zählen hoch, sobald der Abschnitt sichtbar ist
  var apps = document.querySelector(".tk-apps");
  if (apps && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      apps.classList.add("is-visible");
      if (reduce) return;
      apps.querySelectorAll("[data-count]").forEach(function (el) {
        var end = +el.getAttribute("data-count"), t0 = performance.now();
        (function tick(t) {
          var p = Math.min(1, (t - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = v.toLocaleString("de-AT");
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
      // Schalter im Menü wechseln ab und zu, damit die Vorschau lebendig wirkt
      var sw = apps.querySelectorAll(".tk-dash__menu i");
      if (sw.length) setInterval(function () { sw[2].classList.toggle("is-on"); }, 2600);
    }, { threshold: 0.25 });
    io.observe(apps);
  }

  // Text hellt sich beim Scrollen Wort für Wort auf ([data-tk-worte], wichtige Wörter in <b class="tk-w-k">).
  // Ohne JavaScript oder mit reduzierter Bewegung steht der Text ganz normal da.
  var worte = document.querySelectorAll("[data-tk-worte]");
  if (worte.length && !reduce) {
    var groups = [];
    worte.forEach(function (box) {
      var list = [], walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (t) {
        var parts = t.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        var key = t.parentNode.closest && t.parentNode.closest(".tk-w-k");
        parts.forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var sp = document.createElement("span");
          sp.className = "tk-w" + (key ? " tk-w--k" : "");
          sp.textContent = w;
          frag.appendChild(sp); list.push(sp);
        });
        t.parentNode.replaceChild(frag, t);
      });
      box.classList.add("is-worte");
      groups.push({ box: box, words: list, lit: -1 });
    });
    var wTick = false;
    function lightWords() {
      wTick = false;
      var vh = window.innerHeight;
      groups.forEach(function (g) {
        var r = g.box.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        var lit = Math.round(p * g.words.length);
        if (lit === g.lit) return;
        g.words.forEach(function (w, i) { w.classList.toggle("is-on", i < lit); });
        g.lit = lit;
      });
    }
    window.addEventListener("scroll", function () { if (!wTick) { wTick = true; requestAnimationFrame(lightWords); } }, { passive: true });
    window.addEventListener("resize", lightWords);
    lightWords();
  }

  // Antipp-Kärtchen im Formular ([data-tk-chips]): Auswahl landet als eigene Zeile am Ende des Nachrichtenfelds.
  document.querySelectorAll("[data-tk-chips]").forEach(function (box) {
    var form = box.closest("form"), ta = form && form.querySelector('textarea[name="' + (box.getAttribute("data-target") || "nachricht") + '"]');
    if (!ta) return;
    var prefix = box.getAttribute("data-prefix") || "Ich interessiere mich für: ";
    var btns = box.querySelectorAll("button");
    box.hidden = false;
    function sync() {
      var picked = [];
      btns.forEach(function (b) { if (b.getAttribute("aria-pressed") === "true") picked.push(b.textContent.trim()); });
      var lines = ta.value.split("\n").filter(function (l) { return l.indexOf(prefix) !== 0; });
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      if (picked.length) lines.push(prefix + picked.join(", "));
      ta.value = lines.join("\n");
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); sync(); });
    });
    // Wird das Formular zurückgesetzt, gehen auch die Kärtchen zurück
    form.addEventListener("reset", function () { btns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); });
  });

  // Schwebender Hinweis auf die Beispielseiten (nicht auf den Beispielseiten selbst)
  if (/^\/beispiele\//.test(location.pathname)) return;
  try { if (sessionStorage.getItem("tk-float-zu") === "1") return; } catch (e) {}
  // Zahl der Branchen-Beispiele: muss zu Startseite, /beispiele/ und llms.txt passen (prüft .github/scripts/beispiele-zaehler.py)
  var ANZAHL = 18;
  // Runde Ausschnitte aus den Videos/Fotos der Beispielseiten (Lizenzen siehe /bildnachweis/)
  var pics = ["dachdecker", "gasthaus", "pension", "friseur", "werkstatt", "baeckerei", "cafe", "fleischerei", "tischlerei", "maler", "massage", "bodenleger"];
  var a = document.createElement("a");
  a.className = "tk-float";
  a.href = "/beispiele/";
  a.innerHTML = '<span class="tk-float__pics">' + pics.map(function (p, i) {
    return '<img src="/assets/img/float/' + p + '.webp" alt="" width="46" height="46" loading="lazy"' + (i === 0 ? ' class="is-on"' : "") + ">";
  }).join("") + '</span><span class="tk-float__txt"><b><i class="tk-float__l">' + ANZAHL + ' Beispielseiten</i><i class="tk-float__s">Beispiele</i> ansehen</b><span>Handwerk, Gasthaus, Pension und mehr</span></span>'
    + '<button class="tk-float__x" type="button" aria-label="Hinweis schließen">✕</button>';
  document.body.appendChild(a);
  a.querySelector(".tk-float__x").addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation();
    a.classList.remove("is-in");
    setTimeout(function () { a.remove(); }, 500);
    try { sessionStorage.setItem("tk-float-zu", "1"); } catch (err) {}
  });
  // Erst zeigen, wenn der Kopfbereich durchgescrollt ist, und nicht, solange das Karussell selbst zu sehen ist
  var ex = document.getElementById("beispiele"), exVisible = false;
  if (ex && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { exVisible = es[0].isIntersecting; show(); }, { threshold: 0.15 }).observe(ex);
  }
  // Auch nicht über Formularen (sonst verdeckt der Hinweis unten links den Absende-Knopf) und nicht über Bereichen mit data-no-float
  var forms = document.querySelectorAll("form[data-cx-form], [data-no-float]"), formsOn = 0;
  if (forms.length && "IntersectionObserver" in window) {
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { formsOn += e.isIntersecting ? 1 : (e.target._tkSeen ? -1 : 0); e.target._tkSeen = e.isIntersecting; });
      show();
    });
    forms.forEach(function (f) { fio.observe(f); });
  }
  function show() { a.classList.toggle("is-in", window.scrollY > 500 && !exVisible && formsOn <= 0); }
  window.addEventListener("scroll", show, { passive: true });
  setTimeout(show, 1200);
  if (!reduce) {
    var imgs = a.querySelectorAll(".tk-float__pics img"), k = 0;
    setInterval(function () {
      if (!a.classList.contains("is-in")) return;
      imgs[k].classList.remove("is-on"); k = (k + 1) % imgs.length; imgs[k].classList.add("is-on");
    }, 2200);
  }
})();
