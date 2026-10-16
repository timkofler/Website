// Tim Kofler – Karussell mit den Beispiel-Designs und Antwort-Assistent.
// Ohne Bibliotheken, ohne Cookies, ohne Datenübertragung.
(function () {
  function boot() {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- Karussell ----------------
  var root = document.querySelector("[data-car]");
  if (root) {
    var track = root.querySelector(".tk-car__track");
    var items = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(document.querySelectorAll(".tk-car__dot"));
    var n = items.length, step = 344, x = 0, idx = 1, target = null, raf = 0;
    var dragging = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;

    var measure = function () { step = n > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1; };
    var clampIdx = function (i) { return Math.max(0, Math.min(n - 1, i)); };

    var apply = function () {
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      var c = -x / step;
      for (var i = 0; i < n; i++) {
        var d = i - c, ad = Math.min(Math.abs(d), 2.5);
        items[i].style.transform = "rotateY(" + (-d * 22).toFixed(2) + "deg) scale(" + (1 - ad * 0.1).toFixed(3) + ") translateZ(" + (-ad * 70).toFixed(1) + "px)";
        items[i].style.opacity = (1 - Math.max(0, ad - 1.2) * 0.6).toFixed(2);
        items[i].classList.toggle("is-center", Math.abs(d) < 0.5);
      }
      var ni = clampIdx(Math.round(c));
      if (ni !== idx) idx = ni;
      dots.forEach(function (dot, i) { dot.classList.toggle("is-on", i === idx); dot.setAttribute("aria-current", i === idx ? "true" : "false"); });
    };

    var animate = function () {
      raf = 0;
      if (dragging || target === null) return;
      x += (target - x) * (reduce ? 1 : 0.14);
      if (Math.abs(target - x) < 0.4) { x = target; target = null; apply(); return; }
      apply();
      raf = window.requestAnimationFrame(animate);
    };
    var go = function (i) {
      idx = clampIdx(i);
      target = -idx * step;
      if (!raf) raf = window.requestAnimationFrame(animate);
    };

    root.addEventListener("pointerdown", function (e) {
      moved = false;   // sonst blockiert ein früheres Ziehen den nächsten Tipp auf einen Link
      if (e.button !== 0 || e.target.closest("a, button")) return;
      dragging = true;
      startX = lastX = e.clientX; startPos = x; lastT = performance.now(); vel = 0;
      target = null;
      root.classList.add("is-drag");
      if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      var nx = startPos + dx, min = -(n - 1) * step;
      if (nx > 0) nx = nx * 0.35;                       // weicher Widerstand an den Enden
      if (nx < min) nx = min + (nx - min) * 0.35;
      x = nx;
      var now = performance.now(), dt = Math.max(1, now - lastT);
      vel = 0.8 * vel + 0.2 * ((e.clientX - lastX) / dt);
      lastX = e.clientX; lastT = now;
      apply();
    });
    var release = function () {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-drag");
      // Schwung mitnehmen, dann auf die nächste Karte einrasten
      go(Math.round(-(x + vel * 260) / step));
    };
    root.addEventListener("pointerup", release);
    root.addEventListener("pointercancel", release);
    root.addEventListener("lostpointercapture", release);
    // Klick auf eine seitliche Karte holt sie in die Mitte
    items.forEach(function (it, i) {
      it.addEventListener("click", function (e) {
        if (moved) { e.preventDefault(); return; }
        if (e.target.closest("a")) return;
        if (i !== idx) go(i);
        else if (it.getAttribute("data-href")) window.location.href = it.getAttribute("data-href");
      });
    });
    // Waagrechtes Scrollen am Trackpad
    var wheelTimer;
    root.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target = null;
      x = Math.max(-(n - 1) * step - 80, Math.min(80, x - e.deltaX));
      apply();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { go(Math.round(-x / step)); }, 120);
    }, { passive: false });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    });
    document.querySelectorAll(".tk-car__btn").forEach(function (b) {
      b.addEventListener("click", function () { go(idx + Number(b.getAttribute("data-dir"))); });
    });
    dots.forEach(function (dot, i) { dot.addEventListener("click", function () { go(i); }); });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { measure(); x = -idx * step; apply(); }, 120);
    });
    // Seiten in den Handys scrollen nur, solange das Karussell sichtbar ist
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { root.classList.toggle("is-visible", es[0].isIntersecting); }, { rootMargin: "100px" }).observe(root);
    } else {
      root.classList.add("is-visible");
    }
    measure(); x = -idx * step; apply();
  }

  // ---------------- Vorschau-Videos (Beispielseiten) ----------------
  // Spielen stumm in Schleife, solange sie sichtbar sind; bei "weniger Bewegung" bleibt das Standbild.
  var pv = document.querySelectorAll("video[data-tkplay]");
  if (pv.length && !reduce && "IntersectionObserver" in window && !(navigator.connection && navigator.connection.saveData)) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var vd = e.target;
        if (e.isIntersecting) { vd.muted = true; if (vd.preload === "none") vd.preload = "auto"; vd.play().catch(function () {}); }
        else vd.pause();
      });
    }, { threshold: 0.35 });
    pv.forEach(function (vd) { po.observe(vd); });
  }

  // ---------------- Antwort-Assistent ----------------
  var LINKS = {
    pakete: ["Zu den Paketen", "/#pakete"], anfrage: ["Anfrage stellen", "/#anfrage"], ablauf: ["Zum Ablauf", "/#ablauf"],
    email: ["Landingpages & E-Mail", "/#email"], beispiele: ["Beispielseiten ansehen", "/beispiele/"],
    mail: ["E-Mail schreiben", "mailto:office@tim-kofler.at"], allinkl: ["ALL-INKL ansehen (Partnerlink)", "https://all-inkl.com/PA56CC1CF457650"], webspace: ["Meine Empfehlung", "/#webspace"], tel: ["Anrufen", "tel:+4367761773118"]
  };
  var ANSWERS = {
    preis: { q: "Was kostet eine Webseite?", a: "Die Pakete im Überblick:\n• Referenzkunde ab 290 € (einfache Seite, nur wenige Plätze)\n• Start ab 590 € (bis zu 3 Unterseiten)\n• Business ab 1.190 € (bis zu 8 Unterseiten)\n• Betreuung ab 29 € im Monat\nAlle Preise sind Endpreise, als Kleinunternehmer ohne Umsatzsteuer.", links: ["pakete", "anfrage"] },
    dauer: { q: "Wie lange dauert es?", a: "Das hängt vom Umfang ab und davon, wie schnell Texte, Fotos und Logo da sind. Einen realistischen Zeitplan bekommst du gleich mit dem Angebot.", links: ["ablauf", "anfrage"] },
    referenz: { q: "Was ist ein Referenzkunde?", a: "Für eine begrenzte Zahl von Kunden baue ich eine einfache Seite ab 290 €. Im Gegenzug darf ich sie als Referenz zeigen, du gibst eine ehrliche Google-Bewertung und im Footer steht ein kleiner Hinweis auf meine Arbeit.", links: ["pakete", "anfrage"] },
    email: { q: "Landingpage & Newsletter?", a: "Ja, mache ich: Landingpages für Aktionen oder Anzeigen, Newsletter-Anmeldung mit Double-Opt-in und automatische E-Mails wie eine Willkommensserie. Der Versand läuft über Brevo, einen E-Mail-Dienst aus der EU.", links: ["email", "anfrage"] },
    ablauf: { q: "Wie läuft es ab?", a: "In vier Schritten:\n1. Gespräch: Was soll die Seite können?\n2. Entwurf im Stil deines Unternehmens\n3. Umsetzung mit deinen Texten und Bildern\n4. Online-Schaltung und Anmeldung bei Google", links: ["ablauf", "anfrage"] },
    hosting: { q: "Domain & Hosting?", a: "Domain und Webspace laufen auf deinen Namen, die Seite gehört dir. Ich empfehle ALL-INKL.COM, dort laufen auch meine eigenen Seiten: ab 4,95 € im Monat, mit eigener .at-Domain und eigenen E-Mail-Adressen wie office@deinbetrieb.at, erster Monat kostenlos, monatlich kündbar. Mein Tipp ist Privat+ um 7,95 € mit SSL und 24-Stunden-Hotline. Auf Wunsch richte ich alles für dich ein.\n(Partnerlink: Für dich ändert sich am Preis nichts, ich bekomme eine kleine Provision.)", links: ["webspace", "allinkl", "anfrage"] },
    google: { q: "Werde ich bei Google gefunden?", a: "Jede Seite bekommt saubere Grundlagen: schnelle Ladezeit, gute Titel und Beschreibungen, Sitemap, strukturierte Daten und die Anmeldung bei Google. Einen bestimmten Platz kann niemand seriös versprechen, aber die Basis stimmt.", links: ["pakete"] },
    baukasten: { q: "Warum kein Baukasten?", a: "Eine programmierte Seite lädt nur, was sie braucht. Sie ist schneller, sicherer, braucht keine Plugin-Updates und das Design gibt es so nur einmal.", links: ["beispiele"] },
    beispiele: { q: "Gibt es Beispiele?", a: "Ja, sieben komplette Beispielseiten: Friseur, Café, Autowerkstatt, Gasthaus, Bäckerei, Tischlerei und Heilmasseurin. Alle mit Videos, eigenen Animationen und Funktionen wie Online-Buchung, live im Browser zum Ausprobieren.", links: ["beispiele", "anfrage"] },
    kontakt: { q: "Persönlich anfragen", a: "Gerne! Am schnellsten über das Anfrageformular. Oder direkt per E-Mail an office@tim-kofler.at bzw. unter +43 677 61773118.", links: ["anfrage", "mail", "tel"] }
  };
  var CHIPS = ["preis", "beispiele", "dauer", "referenz", "email", "ablauf", "kontakt"];
  var KEYWORDS = [
    ["preis", /(preis|kost|euro|€|teuer|günstig|guenstig|budget|angebot)/],
    ["dauer", /(dauer|lange|wann|zeit|schnell fertig|bis wann)/],
    ["referenz", /(referenz|290)/],
    ["beispiele", /(beispiel|muster|vorlage|zeig|portfolio|arbeiten)/],
    ["email", /(landing|newsletter|mail|brevo|marketing|automati)/],
    ["ablauf", /(ablauf|prozess|schritt|vorgehen|wie läuft|wie laeuft)/],
    ["hosting", /(domain|hosting|webspace|server|all-?inkl)/],
    ["google", /(google|seo|gefunden|ranking|suchmaschine)/],
    ["baukasten", /(baukasten|wix|wordpress|jimdo|template)/],
    ["kontakt", /(kontakt|anruf|telefon|termin|gespräch|gespraech|treffen|erreich)/]
  ];

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tk-chat-btn";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "tk-chat");
  btn.innerHTML = '<img src="/assets/img/tk-badge.svg" alt=""><i aria-hidden="true"></i><span>Fragen?</span>';

  var box = document.createElement("div");
  box.className = "tk-chat";
  box.id = "tk-chat";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Antwort-Assistent");
  box.innerHTML =
    '<div class="tk-chat__head"><img src="/assets/img/tk-badge.svg" alt=""><div><b>Fragen zur Webseite?</b><small>Antworten auf die häufigsten Fragen</small></div>' +
    '<button type="button" class="tk-chat__x" aria-label="Schließen">✕</button></div>' +
    '<div class="tk-chat__log" aria-live="polite"></div>' +
    '<div class="tk-chat__chips"></div>' +
    '<form class="tk-chat__form"><label class="sr-only" for="tk-chat-in">Deine Frage</label><input id="tk-chat-in" type="text" maxlength="200" autocomplete="off" placeholder="Frage eintippen …"><button type="submit" aria-label="Senden">→</button></form>' +
    '<p class="tk-chat__note">Automatische Antworten, keine KI. Es wird nichts gespeichert oder gesendet.</p>';
  document.body.appendChild(btn);
  document.body.appendChild(box);

  var log = box.querySelector(".tk-chat__log");
  var chips = box.querySelector(".tk-chat__chips");
  var input = box.querySelector("input");
  var started = false;

  function bubble(text, who, links) {
    var m = document.createElement("div");
    m.className = "tk-msg tk-msg--" + who;
    m.textContent = text;   // Eingaben nur als Text, nie als HTML
    if (links && links.length) {
      var row = document.createElement("div");
      row.className = "tk-msg__links";
      links.forEach(function (k) {
        var a = document.createElement("a");
        a.href = LINKS[k][1];
        a.textContent = LINKS[k][0];
        if (/^https?:/.test(LINKS[k][1])) { a.target = "_blank"; a.rel = "sponsored noopener"; }
        if (LINKS[k][1].charAt(0) === "/") a.addEventListener("click", function () { close(); });
        row.appendChild(a);
      });
      m.appendChild(row);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function botSay(text, links) {
    var t = document.createElement("div");
    t.className = "tk-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); bubble(text, "bot", links); }, reduce ? 0 : 550);
  }
  function answer(key, asked) {
    var item = ANSWERS[key];
    bubble(asked || item.q, "me");
    botSay(item.a, item.links);
  }
  function renderChips() {
    chips.textContent = "";
    CHIPS.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = ANSWERS[k].q;
      b.addEventListener("click", function () { answer(k); });
      chips.appendChild(b);
    });
  }
  function open() {
    box.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      renderChips();
      botSay("Hallo! Ich beantworte die häufigsten Fragen zu Webseiten von Tim Kofler. Wähle ein Thema oder tipp deine Frage ein.");
    }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    box.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  btn.addEventListener("click", open);
  box.querySelector(".tk-chat__x").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
  box.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    var low = text.toLowerCase();
    for (var i = 0; i < KEYWORDS.length; i++) {
      if (KEYWORDS[i][1].test(low)) { answer(KEYWORDS[i][0], text); return; }
    }
    bubble(text, "me");
    botSay("Das beantwortet Tim dir am besten persönlich. Schreib ihm kurz, er meldet sich innerhalb von zwei Werktagen.", ["anfrage", "mail"]);
  });
  }
  // Erst nach dem Laden der Seite einrichten, damit der Seitenaufbau nicht gebremst wird
  if (document.readyState === "complete") setTimeout(boot, 300);
  else window.addEventListener("load", function () { setTimeout(boot, 300); });
})();
