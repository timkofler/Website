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

  // Schwebender Hinweis auf die Beispielseiten (nicht auf den Beispielseiten selbst)
  if (/^\/beispiele\//.test(location.pathname)) return;
  try { if (sessionStorage.getItem("tk-float-zu") === "1") return; } catch (e) {}
  // Zahl der Branchen-Beispiele: muss zu Startseite, /beispiele/ und llms.txt passen (prüft .github/scripts/beispiele-zaehler.py)
  var ANZAHL = 14;
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
