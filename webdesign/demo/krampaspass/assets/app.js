/* Krampaspass · Entwurf */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Kopfzeile fest beim Scrollen, Handy-Knopf einblenden */
  var nav = $("#nav"), cta = $("#mobil-cta"), kontakt = $("#kontakt"), spektakel = $("#spektakel");
  function beimScrollen() {
    var y = window.scrollY;
    nav.classList.toggle("is-fest", y > 40);
    if (cta) {
      var unten = kontakt.getBoundingClientRect().top < window.innerHeight * .8;
      var sp = spektakel.getBoundingClientRect();
      var imSpektakel = sp.top < window.innerHeight * .6 && sp.bottom > window.innerHeight * .3;
      cta.classList.toggle("is-da", y > window.innerHeight * .7 && !unten && !imSpektakel);
    }
  }
  window.addEventListener("scroll", beimScrollen, { passive: true });
  beimScrollen();

  /* Menü */
  var burger = $("#burger"), menu = $("#menu");
  function menuZu() {
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    document.body.classList.remove("menu-offen");
  }
  burger.addEventListener("click", function () {
    var auf = menu.hidden;
    menu.hidden = !auf;
    burger.setAttribute("aria-expanded", String(auf));
    burger.setAttribute("aria-label", auf ? "Menü schließen" : "Menü öffnen");
    document.body.classList.toggle("menu-offen", auf);
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", menuZu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (!menu.hidden) menuZu(); lichtZu(); }
  });

  /* Countdown bis zum Spektakel */
  var START = new Date("2026-11-21T16:00:00+01:00").getTime();
  var ENDE = new Date("2026-11-22T04:00:00+01:00").getTime();
  var felder = { t: $("#c-t"), s: $("#c-s"), m: $("#c-m"), x: $("#c-x") };
  var titel = $("#uhr-titel"), rest = $("#mobil-rest");
  function zwei(n) { return n < 10 ? "0" + n : String(n); }
  function setze(el, wert) {
    if (el.textContent !== wert) {
      el.textContent = wert;
      if (!ruhig) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    }
  }
  function uhr() {
    var jetzt = Date.now(), d = Math.max(0, START - jetzt);
    var t = Math.floor(d / 864e5), s = Math.floor(d / 36e5) % 24, m = Math.floor(d / 6e4) % 60, x = Math.floor(d / 1e3) % 60;
    setze(felder.t, zwei(t)); setze(felder.s, zwei(s)); setze(felder.m, zwei(m)); setze(felder.x, zwei(x));
    if (jetzt >= ENDE) {
      titel.textContent = "Danke, Gresten! Wir sehen uns auf der Tour.";
      if (rest) rest.textContent = "Tour 2026";
    } else if (jetzt >= START) {
      titel.textContent = "Heute! Das Spektakel läuft, kommt vorbei.";
      if (rest) rest.textContent = "Heute ab 16 Uhr";
    } else if (rest) {
      rest.textContent = t > 0 ? "noch " + t + (t === 1 ? " Tag" : " Tage") : "Heute ab 16 Uhr";
    }
  }
  uhr();
  setInterval(uhr, 1000);

  /* Einblenden beim Scrollen */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-da"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-da"); });
  }

  /* Zündschnur im Ablauf: brennt beim Scrollen mit */
  var zuend = $("#zuend"), punkte = $$(".zuend__punkt");
  if (zuend) {
    var funke = document.createElement("span");
    funke.className = "zuend__funke";
    funke.setAttribute("aria-hidden", "true");
    zuend.appendChild(funke);
  }
  function schnur() {
    if (!zuend) return;
    var r = zuend.getBoundingClientRect(), mitte = window.innerHeight * .6;
    var p = Math.min(1, Math.max(0, (mitte - r.top) / r.height));
    zuend.style.setProperty("--p", p.toFixed(3));
    punkte.forEach(function (pt) { pt.classList.toggle("is-an", pt.getBoundingClientRect().top + 14 < mitte); });
  }

  /* Rauch-Bild leicht verschieben */
  var rauchBild = $(".rauch img");
  function parallax() {
    if (!rauchBild || ruhig) return;
    var r = rauchBild.parentNode.parentNode.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    rauchBild.style.transform = "scale(1.12) translateY(" + (p * -40).toFixed(1) + "px)";
  }
  var geplant = false;
  window.addEventListener("scroll", function () {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () { schnur(); parallax(); geplant = false; });
  }, { passive: true });
  window.addEventListener("resize", schnur);
  schnur(); parallax();

  /* Tour: vergangene Termine durchstreichen, nächsten einkreisen, Rolle aufrollen */
  var heute = new Date(); heute.setHours(0, 0, 0, 0);
  var naechster = null;
  $$("#termine li").forEach(function (li) {
    var d = new Date(li.getAttribute("data-d") + "T23:59:00");
    if (d < heute) li.classList.add("is-vorbei");
    else if (!naechster) naechster = li;
  });
  if (naechster) {
    naechster.classList.add("is-naechster");
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "kreis");
    svg.setAttribute("viewBox", "0 0 260 64");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    var pfad = document.createElementNS(ns, "path");
    pfad.setAttribute("d", "M40 10 C110 -2 230 2 252 26 C266 46 200 60 120 60 C40 60 2 50 6 32 C10 14 60 6 150 8 C190 9 220 14 236 20");
    svg.appendChild(pfad);
    naechster.appendChild(svg);
  }
  var rolle = $("#rolle");
  if (rolle && "IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { rolle.classList.add("is-offen"); ro.disconnect(); }
    }, { threshold: .15 });
    ro.observe(rolle);
  } else if (rolle) { rolle.classList.add("is-offen"); }

  /* Masken: Lichtschein folgt Maus oder Finger */
  var maske = $(".masken__bild");
  if (maske) {
    var folgen = function (x, y) {
      var r = maske.getBoundingClientRect();
      maske.style.setProperty("--mx", ((x - r.left) / r.width * 100).toFixed(1) + "%");
      maske.style.setProperty("--my", ((y - r.top) / r.height * 100).toFixed(1) + "%");
    };
    maske.addEventListener("pointermove", function (e) { folgen(e.clientX, e.clientY); });
  }

  /* Galerie: Bilder in der Mitte bekommen Farbe */
  var streifen = $("#streifen"), fotos = $$(".foto");
  function farbe() {
    if (!streifen) return;
    var r = streifen.getBoundingClientRect(), mitte = r.left + r.width / 2, best = null, bestAbst = 1e9;
    fotos.forEach(function (f) {
      var fr = f.getBoundingClientRect(), abst = Math.abs(fr.left + fr.width / 2 - mitte);
      if (abst < bestAbst) { bestAbst = abst; best = f; }
    });
    var sichtbar = r.top < window.innerHeight * .85 && r.bottom > window.innerHeight * .15;
    fotos.forEach(function (f) { f.classList.toggle("is-farbe", sichtbar && f === best); });
  }
  if (streifen) {
    streifen.addEventListener("scroll", function () { requestAnimationFrame(farbe); }, { passive: true });
    window.addEventListener("scroll", function () { requestAnimationFrame(farbe); }, { passive: true });
    window.addEventListener("resize", farbe);
    farbe();
    var schritt = function (richtung) {
      var b = fotos[0].getBoundingClientRect().width + 18;
      streifen.scrollBy({ left: richtung * b, behavior: ruhig ? "auto" : "smooth" });
    };
    $("#s-zurueck").addEventListener("click", function () { schritt(-1); });
    $("#s-weiter").addEventListener("click", function () { schritt(1); });
    /* Mit der Maus ziehen (am Handy wischt man ohnehin) */
    var zieht = false, startX = 0, startL = 0, bewegt = false;
    streifen.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      zieht = true; bewegt = false; startX = e.clientX; startL = streifen.scrollLeft;
      streifen.style.scrollSnapType = "none";
    });
    window.addEventListener("pointermove", function (e) {
      if (!zieht) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) bewegt = true;
      streifen.scrollLeft = startL - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!zieht) return;
      zieht = false; streifen.style.scrollSnapType = "";
    });
    streifen.addEventListener("click", function (e) {
      if (bewegt) { e.preventDefault(); e.stopPropagation(); bewegt = false; }
    }, true);
  }

  /* Lichtbox */
  var licht = $("#licht"), lichtBild = $("#licht-bild"), zuletzt = null;
  function lichtZu() {
    if (!licht || licht.hidden) return;
    licht.hidden = true; lichtBild.src = "";
    document.body.classList.remove("menu-offen");
    if (zuletzt) zuletzt.focus();
  }
  fotos.forEach(function (f) {
    f.addEventListener("click", function () {
      zuletzt = f;
      var img = $("img", f);
      lichtBild.src = f.getAttribute("data-gross");
      lichtBild.alt = img.alt;
      licht.hidden = false;
      document.body.classList.add("menu-offen");
      $("#licht-zu").focus();
    });
  });
  if (licht) {
    $("#licht-zu").addEventListener("click", lichtZu);
    licht.addEventListener("click", function (e) { if (e.target === licht) lichtZu(); });
  }

  /* Kontakt-Brief (im Entwurf ohne Versand) */
  var brief = $("#brief");
  if (brief) {
    var anliegen = "Auftritt";
    var platzhalter = {
      Auftritt: "Wann und wo ist euer Lauf, und wie viele Gruppen kommen?",
      Shop: "Welches Stück, welche Größe, wie viele?",
      Mitmachen: "Erzählt kurz von euch. Habt ihr schon eine Maske?",
      Sonstiges: "Was liegt euch am Herzen?"
    };
    var chips = $$("#anliegen button");
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (o) { o.classList.remove("is-on"); o.setAttribute("aria-checked", "false"); });
        c.classList.add("is-on"); c.setAttribute("aria-checked", "true");
        anliegen = c.getAttribute("data-a");
        $("#nachricht").placeholder = platzhalter[anliegen];
      });
    });
    $("#nachricht").placeholder = platzhalter.Auftritt;
    brief.addEventListener("submit", function (e) {
      e.preventDefault();
      var fehler = $("#brief-fehler");
      var name = brief.elements.name.value.trim(), kontaktWeg = brief.elements.kontakt.value.trim();
      if (!name || !kontaktWeg) {
        fehler.textContent = "Bitte Name und E-Mail oder Telefon eintragen, damit wir zurückschreiben können.";
        fehler.hidden = false;
        (name ? brief.elements.kontakt : brief.elements.name).focus();
        return;
      }
      fehler.hidden = true;
      brief.classList.add("is-weg");
      $("#brief-ok").hidden = false;
    });
  }

  /* Platzhalter-Telefonnummer: im Entwurf nicht wählen */
  $$("[data-demo-tel]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      a.textContent = "Platzhalter, eure Nummer kommt hier hin";
    });
  });
})();
