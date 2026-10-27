// Tim Kofler – Lesefortschritt, Verwaltungs-Vorschau und schwebender Hinweis auf die Beispielseiten.
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
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    // Abschneiden statt Stauchen: so bleibt die Linie samt Leuchten immer gleich dünn (scaleX machte den Schein am Anfang zu einem hohen Fleck)
    bar.style.clipPath = "inset(0 " + ((1 - p) * 100).toFixed(2) + "% -14px 0)";
    // Beim Footer-Logo blenden Linie und Kopfzeile aus, damit nicht zwei Logos übereinander stehen
    if (footLogo) document.documentElement.classList.toggle("tk-at-foot", footLogo.getBoundingClientRect().top < window.innerHeight * .75);
  }
  var footLogo = document.querySelector(".tk-logo--foot");
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  // Verwaltungs-Vorschau: wechselt zwischen unseren Beispiel-Apps (Reiter), Zahlen zählen, Balken wachsen,
  // ein Schalter springt um und „Speichern“ zeigt kurz die Bestätigung. Läuft nur, solange sie zu sehen ist.
  var apps = document.querySelector(".tk-apps"), wrap = document.querySelector("[data-tkd]");
  if (apps && wrap && "IntersectionObserver" in window) (function () {
    var D = [
      { url: "gasthaus-muster.at/verwaltung", hi: "Guten Morgen, Maria", k: [["Reservierungen heute", 18, "", "+4 seit gestern"], ["Neue Anfragen", 5, "", "2 unbeantwortet"], ["Besucher diese Woche", 1240, "", "+12 %"]],
        ct: "Gäste pro Tag", h: [42, 58, 51, 73, 66, 92, 80], pk: 5, tip: "92 Gäste", lt: "Mittagsmenü", ls: "Woche 43",
        r: ["Mo · Rindsuppe, Wiener Schnitzel", "Di · Gemüsestrudel mit Salat", "Mi · Schweinsbraten, Knödel"], sv: "Speichern · erscheint sofort auf der Webseite", go: "Gasthaus-App", href: "/beispiele/betriebs-app/#gastro" },
      { url: "friseur-muster.at/verwaltung", hi: "Hallo, Sandra", k: [["Termine heute", 14, "", "3 online gebucht"], ["Freie Plätze", 4, "", "ab 14:30 Uhr"], ["Gutscheine verkauft", 9, "", "+2 diese Woche"]],
        ct: "Termine pro Tag", h: [8, 62, 55, 70, 84, 95, 6], pk: 5, tip: "19 Termine", lt: "Online buchbar", ls: "Leistungen",
        r: ["Damenschnitt & Föhnen", "Balayage & Pflege", "Herrenschnitt"], sv: "Speichern · sofort online buchbar", go: "Friseur-App", href: "/beispiele/betriebs-app/#beauty" },
      { url: "haustechnik-muster.at/buero", hi: "Servus, Thomas", k: [["Offene Aufträge", 23, "", "5 neu heute"], ["Angebote offen", 7, "", "2 heute fällig"], ["Stunden diese Woche", 164, " h", "+8 %"]],
        ct: "Arbeitsstunden pro Tag", h: [78, 86, 74, 92, 64, 14, 4], pk: 3, tip: "37 Stunden", lt: "Einsätze morgen", ls: "3 Monteure",
        r: ["07:30 · Therme tauschen, Purgstall", "10:00 · Badsanierung, Scheibbs", "14:00 · Wartung Wärmepumpe"], sv: "Speichern · Monteure sehen es am Handy", go: "Büro-App", href: "/beispiele/dashboard/" },
      { url: "autoverleih-muster.at/flotte", hi: "Hallo, Lena", k: [["Autos unterwegs", 12, "", "von 16"], ["Abholungen heute", 5, "", "nächste um 10:30"], ["Umsatz diese Woche", 4380, " €", "+14 %"]],
        ct: "Buchungen pro Tag", h: [48, 52, 57, 64, 88, 96, 72], pk: 5, tip: "24 Buchungen", lt: "Flotte", ls: "heute buchbar",
        r: ["Kombi Elektro · W-LD 214", "SUV Elektro · W-LD 377", "Kleinbus 9 Sitze · W-LD 509"], sv: "Speichern · sofort online buchbar", go: "Autovermietung", href: "/beispiele/dashboard/v2/" },
      { url: "verein-muster.at/verwaltung", hi: "Hallo, Peter", k: [["Mitglieder", 248, "", "+6 dieses Jahr"], ["Beiträge bezahlt", 212, "", "36 noch offen"], ["Helfer fürs Fest", 31, "", "9 werden gesucht"]],
        ct: "Anmeldungen Sommerfest", h: [30, 44, 38, 52, 61, 90, 72], pk: 5, tip: "54 Anmeldungen", lt: "Helfer Sommerfest", ls: "3 Schichten",
        r: ["Schank · 14 bis 18 Uhr", "Grill · 16 bis 20 Uhr", "Kassa · 18 bis 22 Uhr"], sv: "Speichern · Mitglieder sehen es sofort", go: "Vereins-App", href: "/beispiele/verein-app/" },
      { url: "pension-muster.at/verwaltung", hi: "Guten Morgen, Anna", k: [["Belegung heute", 85, " %", "11 von 13 Zimmern"], ["Anreisen heute", 4, "", "2 vor 15 Uhr"], ["Neue Anfragen", 6, "", "+3 seit gestern"]],
        ct: "Belegung pro Tag", h: [62, 58, 66, 74, 92, 100, 70], pk: 5, tip: "100 % belegt", lt: "Online buchbar", ls: "Zimmer",
        r: ["Doppelzimmer Zirbe", "Familienzimmer mit Balkon", "Einzelzimmer"], sv: "Speichern · Zimmer sofort buchbar", go: "Pension mit Buchung", href: "/beispiele/pension/#buchen" }
    ];
    var dash = wrap.querySelector(".tk-dash"), body = dash.querySelector(".tk-dash__body"), go = wrap.querySelector(".tk-dash__go");
    var tabs = dash.querySelectorAll(".tk-dash__tabs button"), nums = dash.querySelectorAll(".tk-dash__kpis strong");
    var bars = dash.querySelectorAll(".tk-dash__chart span"), chart = dash.querySelector(".tk-dash__chart");
    var rows = dash.querySelectorAll(".tk-dash__menu p"), sw = dash.querySelectorAll(".tk-dash__menu p > i"), save = dash.querySelector(".tk-dash__save");
    var K = {}; dash.querySelectorAll("[data-k]").forEach(function (el) { K[el.getAttribute("data-k")] = el; });
    K.go = go.querySelector("[data-k]");
    var cur = 0, shown = [18, 5, 1240], timers = [], seen = false, inView = false, hold = false, DUR = 8000;
    var fmt = function (v, suf) { return v.toLocaleString("de-AT") + (suf ? "<span>" + suf + "</span>" : ""); };
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clear() { timers.forEach(clearTimeout); timers = []; save.removeAttribute("data-s"); rows[2].classList.remove("is-flash"); }
    function count(i, end, suf) {
      var from = shown[i]; shown[i] = end;
      if (reduce || from === end) { nums[i].innerHTML = fmt(end, suf); return; }
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 900), v = Math.round(from + (end - from) * (1 - Math.pow(1 - p, 3)));
        nums[i].innerHTML = fmt(v, suf);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
    function show(n) {
      var d = D[n]; cur = n;
      tabs.forEach(function (b, i) { b.classList.toggle("is-on", i === n); });
      var tb = tabs[n]; tb.parentNode.scrollTo && tb.parentNode.scrollTo({ left: tb.offsetLeft - 40, behavior: reduce ? "auto" : "smooth" });
      body.classList.add("is-out");
      setTimeout(function () {
        K.url.textContent = d.url; K.hi.textContent = d.hi; K.ct.textContent = d.ct; K.tip.textContent = d.tip;
        K.lt.textContent = d.lt; K.ls.textContent = d.ls; K.sv.textContent = d.sv; K.go.textContent = d.go + " live ansehen"; go.href = d.href;
        d.k.forEach(function (k, i) { K["k" + i].textContent = k[0]; K["d" + i].textContent = k[3]; count(i, k[1], k[2]); });
        d.r.forEach(function (t, i) { K["r" + i].textContent = t; });
        sw.forEach(function (s, i) { s.classList.toggle("is-on", i < 2); });
        bars.forEach(function (b, i) { b.style.setProperty("--h", d.h[i] + "%"); b.classList.toggle("is-pk", i === d.pk); });
        chart.style.setProperty("--px", d.pk); chart.style.setProperty("--py", d.h[d.pk]);
        body.classList.remove("is-out");
      }, reduce ? 0 : 200);
    }
    // Ablauf pro Beispiel: Schalter springt um, Speichern bestätigt, dann das nächste Beispiel
    function play() {
      clear();
      dash.classList.remove("is-auto"); void dash.offsetWidth; setAuto();
      if (reduce || !inView) return;
      later(function () { sw[2].classList.add("is-on"); rows[2].classList.add("is-flash"); later(function () { rows[2].classList.remove("is-flash"); }, 500); }, 2400);
      later(function () { save.setAttribute("data-s", "1"); }, 3400);
      later(function () { save.setAttribute("data-s", "2"); }, 4300);
      later(function () { save.removeAttribute("data-s"); }, 6200);
      if (!hold) later(function () { show((cur + 1) % D.length); play(); }, DUR);
    }
    dash.style.setProperty("--tkd-dur", DUR + "ms");
    function setAuto() { dash.classList.toggle("is-auto", !hold && !reduce && inView); }
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { hold = true; setAuto(); if (i !== cur) show(i); play(); });
    });
    var io = new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && !seen) { seen = true; apps.classList.add("is-visible"); if (!reduce) [0, 1, 2].forEach(function (i) { shown[i] = 0; count(i, D[0].k[i][1], D[0].k[i][2]); }); }
      setAuto();
      if (inView) play(); else clear();
    }, { threshold: 0.2 });
    io.observe(wrap);
    document.addEventListener("visibilitychange", function () { if (document.hidden) clear(); else if (inView) play(); });
  })();

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

  // Buchstaben-Ring um das Logo ([data-tk-ring]): Buchstaben fliegen verstreut herein und ordnen sich zum Kreis
  // (Idee aus moxen.cl, eigener Code). Nur beim ersten Besuch pro Sitzung, danach steht der Ring sofort.
  var ring = document.querySelector("[data-tk-ring]");
  if (ring) {
    var txt = ring.getAttribute("data-tk-ring"), seen = false;
    try { seen = sessionStorage.getItem("tk-ring") === "1"; sessionStorage.setItem("tk-ring", "1"); } catch (e) {}
    var wild = !reduce && !seen, letters = [];
    for (var ci = 0; ci < txt.length; ci++) {
      var li = document.createElement("i"); li.textContent = txt.charAt(ci); ring.appendChild(li); letters.push(li);
    }
    var place = function () {
      var r = ring.clientWidth / 2 - 8;
      letters.forEach(function (l, k) {
        var a = k / letters.length * 360;
        l.style.transform = "rotate(" + a + "deg) translateY(" + (-r) + "px)";
      });
    };
    if (wild) {
      ring.classList.add("is-wild");
      letters.forEach(function (l) {
        l.style.transform = "translate(" + (Math.random() * 600 - 300) + "px," + (Math.random() * 500 - 250) + "px) rotate(" + (Math.random() * 360) + "deg)";
      });
      void ring.offsetWidth;
      setTimeout(function () {
        ring.classList.remove("is-wild");
        letters.forEach(function (l, k) { l.style.transitionDelay = (k * 18) + "ms"; });
        place();
        setTimeout(function () { letters.forEach(function (l) { l.style.transitionDelay = ""; }); }, 2600);
      }, 500);
    } else place();
    window.addEventListener("resize", place);
  }

  // Schwebender Hinweis auf die Beispielseiten (nicht auf den Beispielseiten selbst)
  if (/^\/beispiele\//.test(location.pathname)) return;
  try { if (sessionStorage.getItem("tk-float-zu") === "1") return; } catch (e) {}
  // Alle Beispiele der Übersicht (Webseiten + Web-Apps). Nicht von Hand pflegen: .github/scripts/beispiele-zaehler.py
  // zählt die Links in /beispiele/ und setzt die Zahl beim Deploy automatisch.
  var ANZAHL = 25;
  // Runde Ausschnitte aus den Videos/Fotos der Beispielseiten (Lizenzen siehe /bildnachweis/)
  var pics = ["dachdecker", "gasthaus", "pension", "friseur", "werkstatt", "baeckerei", "cafe-2", "fleischerei", "tischlerei", "maler", "massage", "nagelstudio", "bodenleger"];
  var a = document.createElement("a");
  a.className = "tk-float";
  a.href = "/beispiele/";
  a.innerHTML = '<span class="tk-float__pics">' + pics.map(function (p, i) {
    return '<img src="/assets/img/float/' + p + '.webp" alt="" width="46" height="46" loading="lazy"' + (i === 0 ? ' class="is-on"' : "") + ">";
  }).join("") + '</span><span class="tk-float__txt"><b><i class="tk-float__l">' + ANZAHL + ' Beispiele</i><i class="tk-float__s">Beispiele</i> ansehen</b><span>Webseiten und Web-Apps live testen</span></span>'
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
