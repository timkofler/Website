// Beispiel Fotografin & Coach „Johanna Wallner“: Menü, Einblenden, Kamera-Startbild, Wort-für-Wort-Satz, Ablauf-Linie,
// Ausstrahlungs-Check, Filmstreifen, Terminbuchung (Vorschau), Platzhalter-Nummer.
(function () {
  "use strict";
  var d = document, w = window;
  var ruhig = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Kopf bekommt beim Scrollen Hintergrund
  var nav = d.getElementById("nav");
  function kopf() { nav.classList.toggle("is-solid", w.scrollY > 30); }
  kopf();
  w.addEventListener("scroll", kopf, { passive: true });

  // Handy-Menü: geschlossen mit hidden (display:none), damit es nichts verdeckt
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menu.classList.remove("is-open");
    d.body.classList.remove("menu-open");
    d.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 200);
  }
  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") return menuZu();
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    d.body.classList.add("menu-open");
    d.body.style.overflow = "hidden";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) menuZu(); });
  w.addEventListener("resize", function () { if (w.innerWidth > 1040 && !menu.hidden) menuZu(); });

  // Einblenden beim Scrollen, gestaffelt
  var gruppen = new Map();
  d.querySelectorAll(".reveal").forEach(function (el) {
    var n = (gruppen.get(el.parentElement) || 0) + 1;
    gruppen.set(el.parentElement, n);
    el.style.setProperty("--d", Math.min(n - 1, 5) * 80 + "ms");
  });
  if ("IntersectionObserver" in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    d.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    d.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Startbild wie durch den Sucher: erst unscharf, dann scharfstellen und Auslöser-Blitz
  var sucher = d.getElementById("sucher");
  if (sucher) {
    var img = sucher.querySelector("img");
    var los = function () {
      setTimeout(function () { sucher.classList.add("is-scharf"); }, 250);
      setTimeout(function () { sucher.classList.add("is-klick"); }, 1300);
    };
    if (img.complete) los(); else { img.addEventListener("load", los); img.addEventListener("error", los); }
  }

  // Großer Satz: Wörter leuchten beim Scrollen nacheinander auf
  var satz = d.getElementById("satz");
  var woerter = [];
  if (satz) {
    (function teilen(knoten) {
      Array.prototype.slice.call(knoten.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          var frag = d.createDocumentFragment();
          k.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(t)); return; }
            var s = d.createElement("span"); s.className = "w"; s.textContent = t; frag.appendChild(s); woerter.push(s);
          });
          k.parentNode.replaceChild(frag, k);
        } else if (k.nodeType === 1) teilen(k);
      });
    })(satz);
  }

  // Ablauf: goldene Linie wächst mit
  var schritte = d.getElementById("schritte");

  // Handy: Knopf unten erst nach dem Startbild, nicht über der Buchung
  var mcta = d.getElementById("mobil-cta"), buchen = d.getElementById("kennenlernen"), hero = d.querySelector(".hero");

  var tick = false;
  function aufScroll() {
    tick = false;
    var vh = w.innerHeight;
    if (woerter.length) {
      var r = satz.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, p)) * woerter.length);
      woerter.forEach(function (s, i) { s.classList.toggle("an", i < n); });
    }
    if (schritte) {
      var rs = schritte.getBoundingClientRect();
      var f = (vh * 0.6 - rs.top) / rs.height;
      schritte.style.setProperty("--fort", Math.max(0, Math.min(1, f)).toFixed(3));
    }
    if (mcta) {
      var nachHero = hero.getBoundingClientRect().bottom < 80;
      var rb = buchen.getBoundingClientRect();
      var beiBuchung = rb.top < vh && rb.bottom > 0;
      mcta.classList.toggle("is-on", nachHero && !beiBuchung && menu.hidden);
    }
  }
  function sched() { if (!tick) { tick = true; requestAnimationFrame(aufScroll); } }
  w.addEventListener("scroll", sched, { passive: true });
  w.addEventListener("resize", sched);
  aufScroll();

  // Ausstrahlungs-Check
  var quiz = d.getElementById("quiz");
  if (quiz) {
    var fragen = quiz.querySelectorAll(".quiz__frage"), bar = d.getElementById("quiz-bar");
    var erg = d.getElementById("quiz-ergebnis"), punkte = { s: 0, k: 0, e: 0 }, schritt = 0;
    var texte = {
      s: ["Personal Branding Shooting", "Du weißt, wer du bist. Jetzt geht es darum, dass man es auch sieht: Bilder, die dein Business tragen und sich nach dir anfühlen.", "Personal Branding Shooting"],
      k: ["Coaching & Shooting", "Da will etwas raus, aber noch bremst dich etwas. In der Kombi schaffen wir zuerst Klarheit und halten dann fest, wie du wirkst, wenn du ganz bei dir bist.", "Coaching und Shooting"],
      e: ["Sichtbarkeits-Coaching", "Gerade geht es um dich und deinen Auftritt, nicht um Fotos. Im Coaching findest du heraus, was du zeigen willst und wie du es ohne Verstellen tust.", "Sichtbarkeits-Coaching"]
    };
    var zeigen = function (i) {
      fragen.forEach(function (f, j) { f.hidden = j !== i; });
      bar.style.width = (i / fragen.length) * 100 + "%";
    };
    quiz.addEventListener("click", function (e) {
      var b = e.target.closest(".quiz__antw button");
      if (!b) return;
      punkte[b.getAttribute("data-w")]++;
      schritt++;
      if (schritt < fragen.length) { zeigen(schritt); return; }
      fragen.forEach(function (f) { f.hidden = true; });
      bar.style.width = "100%";
      var best = "k";
      if (punkte.s > punkte.k && punkte.s >= punkte.e) best = "s";
      else if (punkte.e > punkte.k && punkte.e > punkte.s) best = "e";
      d.getElementById("quiz-titel").textContent = texte[best][0];
      d.getElementById("quiz-text").textContent = texte[best][1];
      d.getElementById("quiz-cta").setAttribute("data-thema", texte[best][2]);
      erg.hidden = false;
      erg.setAttribute("tabindex", "-1");
      erg.focus({ preventScroll: true });
    });
    d.getElementById("quiz-neu").addEventListener("click", function () {
      punkte = { s: 0, k: 0, e: 0 }; schritt = 0; erg.hidden = true; zeigen(0);
    });
  }

  // Filmstreifen: läuft langsam, lässt sich ziehen; Antippen zeigt das Bild in Farbe
  var film = d.getElementById("film"), track = d.getElementById("film-track");
  if (film && track) {
    Array.prototype.slice.call(track.children).forEach(function (f) {
      var c = f.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelector("img").alt = ""; track.appendChild(c);
    });
    var x = 0, halb = 0, ziehen = false, startX = 0, startPos = 0, bewegt = 0, sichtbar = true, pause = false;
    var mass = function () { halb = track.scrollWidth / 2; };
    mass(); w.addEventListener("resize", mass);
    w.addEventListener("load", mass);
    if ("IntersectionObserver" in w) new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; }).observe(film);
    var setzen = function () {
      if (halb) { while (x <= -halb) x += halb; while (x > 0) x -= halb; }
      track.style.transform = "translate3d(" + x + "px,0,0)";
    };
    var lauf = function () {
      if (!ziehen && sichtbar && !pause && !ruhig) { x -= 0.4; setzen(); }
      requestAnimationFrame(lauf);
    };
    requestAnimationFrame(lauf);
    film.addEventListener("mouseenter", function () { pause = true; });
    film.addEventListener("mouseleave", function () { pause = false; });
    film.addEventListener("pointerdown", function (e) {
      ziehen = true; bewegt = 0; startX = e.clientX; startPos = x;
      film.classList.add("is-ziehen");
    });
    w.addEventListener("pointermove", function (e) {
      if (!ziehen) return;
      var dx = e.clientX - startX; bewegt = Math.max(bewegt, Math.abs(dx));
      x = startPos + dx; setzen();
    });
    var ende = function (e) {
      if (!ziehen) return;
      ziehen = false; film.classList.remove("is-ziehen");
      if (bewegt < 6 && e && e.target && e.target.closest) {
        var fig = e.target.closest("figure");
        if (fig) {
          var war = fig.classList.contains("is-farbe");
          track.querySelectorAll(".is-farbe").forEach(function (f) { f.classList.remove("is-farbe"); });
          if (!war) fig.classList.add("is-farbe");
        }
      }
    };
    w.addEventListener("pointerup", ende);
    w.addEventListener("pointercancel", function () { ziehen = false; film.classList.remove("is-ziehen"); });
  }

  // Terminbuchung (im Beispiel wird nichts verschickt)
  var form = d.getElementById("buchung");
  if (form) {
    var themen = d.getElementById("themen"), tageBox = d.getElementById("tage"), zeitenBox = d.getElementById("zeiten");
    var wahl = { thema: "", tag: null, zeit: "" };
    var WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    var MON = ["Jän.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
    var ZEITEN = ["09:00", "10:30", "13:00", "15:00", "17:30", "19:00"];

    var radio = function (box, btn) {
      box.querySelectorAll("[role=radio]").forEach(function (b) { b.setAttribute("aria-checked", b === btn ? "true" : "false"); });
    };
    var anzeige = function () {
      var t = d.getElementById("buchung-wahl");
      if (wahl.tag && wahl.zeit) {
        t.innerHTML = "";
        var b = d.createElement("b");
        b.textContent = WT[wahl.tag.getDay()] + ", " + wahl.tag.getDate() + ". " + MON[wahl.tag.getMonth()] + " um " + wahl.zeit + " Uhr";
        t.appendChild(b);
      } else t.textContent = wahl.tag ? "Noch keine Uhrzeit gewählt" : "Noch kein Termin gewählt";
    };
    var themaSetzen = function (name) {
      var btn = themen.querySelector('[data-thema="' + name + '"]');
      if (!btn) return;
      wahl.thema = name; radio(themen, btn);
    };

    // Nächste 12 Werktage, ab morgen
    var tag = new Date(); tag.setHours(12, 0, 0, 0);
    var tage = [];
    while (tage.length < 12) { tag = new Date(tag.getTime() + 864e5); if (tag.getDay() !== 0 && tag.getDay() !== 6) tage.push(new Date(tag)); }
    tage.forEach(function (t) {
      var b = d.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
      b.innerHTML = "<small>" + WT[t.getDay()] + "</small><b>" + t.getDate() + "</b><em>" + MON[t.getMonth()] + "</em>";
      b.setAttribute("aria-label", WT[t.getDay()] + ", " + t.getDate() + ". " + MON[t.getMonth()]);
      b.addEventListener("click", function () {
        wahl.tag = t; wahl.zeit = ""; radio(tageBox, b);
        zeitenBox.innerHTML = "";
        var seed = t.getDate() * 7 + t.getMonth();
        ZEITEN.forEach(function (z, i) {
          if ((seed + i * 3) % 5 === 0) return; // ein paar Zeiten sind schon vergeben
          var zb = d.createElement("button");
          zb.type = "button"; zb.setAttribute("role", "radio"); zb.setAttribute("aria-checked", "false"); zb.textContent = z;
          zb.addEventListener("click", function () { wahl.zeit = z; radio(zeitenBox, zb); anzeige(); });
          zeitenBox.appendChild(zb);
        });
        anzeige();
      });
      tageBox.appendChild(b);
    });

    themen.addEventListener("click", function (e) {
      var b = e.target.closest("[data-thema]"); if (b) themaSetzen(b.getAttribute("data-thema"));
    });
    // Links aus Angeboten und Check wählen das Thema gleich vor
    d.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-thema]"); if (a) themaSetzen(a.getAttribute("data-thema"));
    });

    var fehler = d.getElementById("buchung-fehler");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fehlt = [];
      if (!wahl.thema) fehlt.push("ein Thema");
      if (!wahl.tag || !wahl.zeit) fehlt.push("einen Termin");
      var erstes = null;
      ["name", "email"].forEach(function (n) {
        var el = form.elements[n];
        var ok = n === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : !!el.value.trim();
        el.classList.toggle("is-bad", !ok);
        if (!ok) { fehlt.push(n === "name" ? "deinen Namen" : "deine E-Mail-Adresse"); erstes = erstes || el; }
      });
      if (fehlt.length) {
        fehler.textContent = "Bitte wähle oder ergänze noch " + fehlt.join(", ").replace(/, ([^,]*)$/, " und $1") + ".";
        fehler.hidden = false;
        if (erstes) erstes.focus();
        return;
      }
      fehler.hidden = true;
      var vorname = form.elements.name.value.trim().split(/\s+/)[0];
      d.getElementById("buchung-ok-text").textContent = "Danke, " + vorname + ". Dein Kennenlernen (" + wahl.thema + ") ist für " + WT[wahl.tag.getDay()] + ", " + wahl.tag.getDate() + ". " + MON[wahl.tag.getMonth()] + " um " + wahl.zeit + " Uhr angefragt. Johanna meldet sich mit der Bestätigung.";
      d.getElementById("buchung-ok").hidden = false;
    });
    form.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("is-bad"); });
  }

  // Im Beispiel steht eine Platzhalter-Nummer: Tippen ruft nicht an, sondern zeigt einen Hinweis
  var tip = null;
  d.addEventListener("click", function (e) {
    var a = e.target.closest("[data-demo-tel]");
    if (!a) return;
    e.preventDefault();
    if (!tip) {
      tip = d.createElement("p");
      tip.className = "demo-tip";
      tip.setAttribute("role", "status");
      tip.textContent = "Das ist eine Platzhalter-Nummer. Auf einer echten Seite ruft dieser Knopf direkt an.";
      d.body.appendChild(tip);
    }
    tip.classList.add("is-on");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.classList.remove("is-on"); }, 3200);
  });
})();
