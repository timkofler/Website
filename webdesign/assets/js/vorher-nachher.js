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
    }
  };
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
    // Die andere Branche schon vorladen, damit der Wechsel ohne Flackern geht.
    Object.keys(B).forEach(function (k) {
      if (k !== cur) ["vorher", "nachher"].forEach(function (w) { new Image().src = DIR + k + "-" + w + "-" + dev + ".webp?v=2"; });
    });
  }

  function pick(attr, val) {
    sec.querySelectorAll("[" + attr + "]").forEach(function (b) {
      var on = b.getAttribute(attr) === val;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  sec.querySelectorAll("[data-vn-b]").forEach(function (b) {
    b.addEventListener("click", function () { cur = b.getAttribute("data-vn-b"); pick("data-vn-b", cur); load(); cancelAnimationFrame(anim); set(B[cur].start || 50); });
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
})();
