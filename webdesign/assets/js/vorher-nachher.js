// Tim Kofler – Vorher/Nachher-Regler auf /entwurf/. Ziehen mit Maus oder Finger, Pfeiltasten, Branche und Ansicht umschalten.
(function () {
  var frame = document.querySelector("[data-vn]");
  if (!frame) return;
  var sec = frame.closest("section");
  var stage = frame.querySelector("[data-vn-stage]");
  var handle = frame.querySelector("[data-vn-handle]");
  var imgs = { vorher: frame.querySelector('[data-vn-img="vorher"]'), nachher: frame.querySelector('[data-vn-img="nachher"]') };
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DIR = "/assets/img/vorher-nachher/";
  var B = {
    tischlerei: {
      domain: "Holzwerk Brandl · erfundener Betrieb", name: "Tischlerei",
      vorher: "Laufschrift, Besucherzähler, winzige Fotos. Am Handy nur mit Zoomen lesbar.",
      nachher: "Große Bilder, eine klare Botschaft und der Beratungstermin mit einem Tipp. Am Handy gut lesbar.",
      altV: "Vorher: veraltete Webseite einer Tischlerei mit Laufschrift, Besucherzähler und kleinen Fotos",
      altN: "Nachher: moderne Webseite derselben Tischlerei mit großem Foto, klarer Botschaft und Termin-Knopf"
    },
    gasthaus: {
      domain: "Hollerhof · erfundener Betrieb", name: "Gasthaus",
      vorher: "Speisekarte nur als PDF, Reservieren nur per Telefon, Gästebuch von 2012.",
      nachher: "Stimmungsvolles Video, Tisch reservieren mit einem Tipp und der Ruhetag gleich sichtbar.",
      altV: "Vorher: veraltete Webseite eines Gasthofs mit Laufschrift, PDF-Speisekarte und Gästebuch",
      altN: "Nachher: moderne Webseite desselben Gasthofs mit großem Bild und Knopf zum Tisch reservieren"
    },
    friseur: {
      domain: "Haarwerk · erfundener Betrieb", name: "Friseur", start: 24, // Überschrift steht links, sonst ist rechts nur das dunkle Video
      vorher: "Termine nur per Telefon, Preisliste als PDF, am Handy winzig klein.",
      nachher: "Edler Auftritt, Termin online buchen mit einem Tipp und die Preise gleich auf der Seite.",
      altV: "Vorher: veraltete Webseite eines Friseursalons in Rosa mit Laufschrift, Besucherzähler und kleinen Fotos",
      altN: "Nachher: moderne Webseite desselben Friseurs mit großer Überschrift und Knopf zum Termin buchen"
    },
    baeckerei: {
      domain: "Kornfeld · erfundener Betrieb", name: "Bäckerei",
      vorher: "Bestellen nur per Telefon oder Fax, Sonntagsöffnung nur in der Laufschrift.",
      nachher: "Frisches Brot als großes Bild, Vorbestellen mit einem Tipp und gezeigt, wie eine Semmel entsteht.",
      altV: "Vorher: veraltete Webseite einer Bäckerei in Gelb mit Laufschrift, Besucherzähler und kleinen Fotos",
      altN: "Nachher: moderne Webseite derselben Bäckerei mit großem Brotfoto und Knopf zum Vorbestellen"
    },
    pizzeria: {
      domain: "Proibito · erfundener Betrieb", name: "Pizzeria",
      vorher: "Speisekarte als 4-MB-PDF, Bestellen nur per Telefon, Bezahlen nur bar.",
      nachher: "Stimmungsvoller Auftritt, Lieferort wählen und direkt aus der Speisekarte bestellen.",
      altV: "Vorher: veraltete Webseite einer Pizzeria mit Italien-Streifen, Laufschrift und PDF-Speisekarte",
      altN: "Nachher: moderne Webseite derselben Pizzeria mit dunklem Auftritt und Speisekarte zum Bestellen"
    },
    dachdecker: {
      domain: "First & Falz · erfundener Betrieb", name: "Dachdecker",
      vorher: "Angebot nur mit Plänen per Fax oder Post, der Notdienst versteckt in der Seitenspalte.",
      nachher: "Starke Botschaft, Dachfläche gleich selbst berechnen und Sturmschaden mit einem Tipp melden.",
      altV: "Vorher: veraltete Webseite einer Dachdeckerei mit grauem Kopf, Laufschrift und Besucherzähler",
      altN: "Nachher: moderne Webseite derselben Dachdeckerei mit großer Schrift und Dachflächen-Rechner"
    },
    cafe: {
      domain: "Café Mühlbach · erfundener Betrieb", name: "Café",
      vorher: "Tisch nur telefonisch, Speisekarte und Tortenkatalog als PDF.",
      nachher: "Der Kaffee als Film im Hintergrund, Tisch reservieren mit einem Tipp, Öffnungszeiten auf einen Blick.",
      altV: "Vorher: veraltete Webseite eines Kaffeehauses in Rosa und Braun mit Laufschrift und kleinen Fotos",
      altN: "Nachher: moderne Webseite desselben Cafés mit großem Kaffeebild und Knopf zum Tisch reservieren"
    },
    maler: {
      domain: "Malerei Lindner · erfundener Betrieb", name: "Maler",
      vorher: "Regenbogen-Kopf und Farbkleckse, Preise nur nach Besichtigung.",
      nachher: "Ruhig und klar, Wunschfarbe gleich ausprobieren und Besichtigung mit einem Tipp anfragen.",
      altV: "Vorher: veraltete Webseite eines Malerbetriebs mit Regenbogen-Kopf, bunten Klecksen und Laufschrift",
      altN: "Nachher: moderne Webseite desselben Malerbetriebs mit klarer Botschaft und Knopf zur Besichtigung"
    },
    pension: {
      domain: "Zirbenhof · erfundener Betrieb", name: "Pension",
      vorher: "Zimmeranfrage nur per Telefon oder Fax, Prospekt als 5-MB-PDF.",
      nachher: "Ötscherblick als großes Bild, Reisedaten eingeben und freie Zimmer direkt anfragen.",
      altV: "Vorher: veraltete Webseite einer Pension mit Himmel-und-Wiese-Kopf, Laufschrift und Preistabelle",
      altN: "Nachher: moderne Webseite derselben Pension mit Bergbild und Feldern für An- und Abreise"
    },
    fleischerei: {
      domain: "Haselberger · erfundener Betrieb", name: "Fleischerei",
      vorher: "Rot-weiß kariert, Wochenangebot als PDF, Bestellungen nur telefonisch.",
      nachher: "Appetitliches Bild, Wochenangebote auf der Seite und Vorbestellen zum Abholen.",
      altV: "Vorher: veraltete Webseite einer Fleischerei mit rot-weißem Karomuster, Laufschrift und kleinen Fotos",
      altN: "Nachher: moderne Webseite derselben Fleischerei mit großem Bild und Knopf zum Vorbestellen"
    },
    bodenleger: {
      domain: "Grund & Holz · erfundener Betrieb", name: "Bodenleger",
      vorher: "Preise erst nach Besichtigung, Muster nur im Schauraum nach Termin.",
      nachher: "Der Boden im echten Raum ansehen, Fläche selbst berechnen und Ausmessen anfragen.",
      altV: "Vorher: veraltete Webseite eines Bodenlegers mit grauem Karomuster, Laufschrift und kleinen Fotos",
      altN: "Nachher: moderne Webseite desselben Bodenlegers mit großem Raumfoto und Flächenrechner"
    },
    werkstatt: {
      domain: "KFZ Steiner · erfundener Betrieb", name: "KFZ-Werkstatt",
      vorher: "Flammenschrift auf Zielflagge, Termine nur per Telefon.",
      nachher: "Klare Botschaft, Online-Termin mit einem Tipp und gleich sichtbar, ob offen ist.",
      altV: "Vorher: veraltete Webseite einer Autowerkstatt mit Zielflaggen-Muster, Flammenschrift und Laufschrift",
      altN: "Nachher: moderne Webseite derselben Werkstatt mit großer Schrift und Knopf zum Online-Termin"
    },
    massage: {
      domain: "Praxis Sonnfeld · erfundener Betrieb", name: "Massage",
      vorher: "Lila Verlauf und Sternchen, Termine nur telefonisch über die Mobilbox.",
      nachher: "Ruhige Farben, Behandlungen erklärt und Termin vereinbaren mit einem Tipp.",
      altV: "Vorher: veraltete Webseite einer Massagepraxis in Lila mit Laufschrift und kleinen Fotos",
      altN: "Nachher: moderne Webseite derselben Massagepraxis mit ruhigem Foto und Knopf zum Termin"
    }
  };
  var tabs = sec.querySelector(".vn-tabs");
  var cur = "tischlerei";
  var dev = window.matchMedia("(max-width: 699px)").matches ? "handy" : "pc";
  var pos = 50;

  function set(p) {
    pos = Math.max(0, Math.min(100, p));
    frame.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", Math.round(pos));
    handle.setAttribute("aria-valuetext", Math.round(pos) + " % vorher, " + Math.round(100 - pos) + " % nachher");
    frame.toggleAttribute("data-low", pos < 14);
    frame.toggleAttribute("data-high", pos > 86);
  }

  function load() {
    var d = B[cur];
    ["vorher", "nachher"].forEach(function (w) {
      var img = imgs[w], src = DIR + cur + "-" + w + "-" + dev + ".webp?v=2";
      var source = img.parentNode.querySelector("source");
      if (source) source.remove(); // ab jetzt entscheidet der Knopf PC/Handy, nicht mehr die Bildschirmbreite
      img.width = dev === "pc" ? 1600 : 780;
      img.height = dev === "pc" ? 1000 : 1688;
      if (img.getAttribute("src") !== src) img.src = src;
      img.alt = w === "vorher" ? d.altV : d.altN;
    });
    frame.querySelector("[data-vn-domain]").textContent = d.domain;
    sec.querySelector("[data-vn-vorher]").textContent = d.vorher;
    sec.querySelector("[data-vn-nachher]").textContent = d.nachher;
    var a = sec.querySelector("[data-vn-link]");
    a.href = "/beispiele/" + cur + "/";
    a.textContent = "Ganze " + d.name + "-Seite ansehen";
    frame.classList.toggle("is-handy", dev === "handy");
    // Die nächsten zwei Branchen schon vorladen, damit der Wechsel ohne Flackern geht (alle 13 wären zu viel).
    var keys = Object.keys(B), i = keys.indexOf(cur);
    [1, 2].forEach(function (n) { preload(keys[(i + n) % keys.length]); });
  }
  var done = {};
  function preload(k) {
    if (done[k + dev]) return;
    done[k + dev] = 1;
    ["vorher", "nachher"].forEach(function (w) { new Image().src = DIR + k + "-" + w + "-" + dev + ".webp?v=2"; });
  }

  // Handy: Reiterzeile wischbar, der gewählte Reiter rückt ins Bild, Rand blendet nur dort aus, wo es weitergeht.
  function edges() {
    var max = tabs.scrollWidth - tabs.clientWidth;
    tabs.toggleAttribute("data-mitte", tabs.scrollLeft > 4 && tabs.scrollLeft < max - 4);
    tabs.toggleAttribute("data-ende", max > 4 && tabs.scrollLeft >= max - 4);
  }
  tabs.addEventListener("scroll", edges, { passive: true });
  window.addEventListener("resize", edges);
  function zeigen(b) {
    if (tabs.scrollWidth <= tabs.clientWidth) return;
    var t = tabs.getBoundingClientRect(), r = b.getBoundingClientRect();
    if (r.left < t.left + 40 || r.right > t.right - 40)
      tabs.scrollBy({ left: r.left - t.left - (t.width - r.width) / 2, behavior: still ? "auto" : "smooth" });
  }

  function pick(attr, val) {
    sec.querySelectorAll("[" + attr + "]").forEach(function (b) {
      var on = b.getAttribute(attr) === val;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  sec.querySelectorAll("[data-vn-b]").forEach(function (b) {
    b.addEventListener("click", function () { cur = b.getAttribute("data-vn-b"); pick("data-vn-b", cur); load(); cancelAnimationFrame(anim); set(B[cur].start || 50); zeigen(b); });
    // Beim Darüberfahren oder ersten Antippen schon laden.
    b.addEventListener("pointerenter", function () { preload(b.getAttribute("data-vn-b")); });
    b.addEventListener("focus", function () { preload(b.getAttribute("data-vn-b")); });
  });
  sec.querySelectorAll("[data-vn-dev]").forEach(function (b) {
    b.addEventListener("click", function () { dev = b.getAttribute("data-vn-dev"); pick("data-vn-dev", dev); load(); });
  });

  // Ziehen: waagrecht schiebt den Regler, senkrecht scrollt am Handy weiter die Seite (touch-action: pan-y).
  var drag = false, anim = 0, touched = false;
  function fromX(x) { var r = stage.getBoundingClientRect(); set((x - r.left) / r.width * 100); }
  stage.addEventListener("pointerdown", function (e) {
    if (e.button > 0) return;
    cancelAnimationFrame(anim);
    touched = drag = true;
    frame.classList.add("is-drag");
    frame.classList.remove("is-hint");
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    fromX(e.clientX);
    if (e.pointerType === "mouse") e.preventDefault();
  });
  stage.addEventListener("pointermove", function (e) { if (drag) fromX(e.clientX); });
  function end() { drag = false; frame.classList.remove("is-drag"); }
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("lostpointercapture", end);

  handle.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 5, k = e.key;
    if (k === "ArrowLeft" || k === "ArrowDown") set(pos - step);
    else if (k === "ArrowRight" || k === "ArrowUp") set(pos + step);
    else if (k === "PageDown") set(pos - 25);
    else if (k === "PageUp") set(pos + 25);
    else if (k === "Home") set(0);
    else if (k === "End") set(100);
    else return;
    touched = true;
    cancelAnimationFrame(anim);
    e.preventDefault();
  });

  // Beim ersten Sichtbarwerden einmal kurz hin und her schwenken, damit klar ist: hier kann man ziehen.
  function hint() {
    if (touched) return;
    frame.classList.add("is-hint");
    if (still) return;
    var t0 = performance.now(), D = 1700, mid = B[cur].start || 50;
    (function step(t) {
      var k = Math.min(1, (t - t0) / D);
      set(mid + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
      if (k < 1 && !touched) anim = requestAnimationFrame(step);
    })(t0);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); setTimeout(hint, 350); }
    }, { threshold: 0.4 });
    io.observe(stage);
  }

  pick("data-vn-dev", dev);
  load();
  set(50);
  edges();
})();
