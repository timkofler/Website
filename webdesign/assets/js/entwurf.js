// Tim Kofler – Landingpage „Kostenloser Webseiten-Entwurf“: Live-Skizze und Vorausfüllen aus dem Link.
// Ohne Cookies, ohne Datenübertragung. Abgeschickt wird das Formular von forms.js.
(function () {
  var form = document.querySelector("[data-ew-form]");
  if (!form) return;
  var prev = form.querySelector("[data-ew-prev]");
  var $ = function (sel) { return form.querySelector(sel); };
  var q = new URLSearchParams(location.search);

  // Link aus Brief oder Mail wie /entwurf/?firma=Tischlerei%20Huber&ort=Melk&web=huber.at füllt das Formular vor.
  [["firma", "firma"], ["ort", "ort"], ["branche", "branche"], ["web", "url"]].forEach(function (p) {
    var v = q.get(p[0]), el = form.querySelector('[name="' + p[1] + '"]');
    if (v && el && !el.value) el.value = v.slice(0, Number(el.getAttribute("maxlength")) || 120);
  });
  if (q.get("web")) { var ja = $('input[name="hat_webseite"][value="ja"]'); if (ja) ja.checked = true; }

  // Webseiten-Adresse nur zeigen, wenn es eine Webseite gibt (oder noch nichts gewählt ist).
  var urlBox = $("[data-ew-url]");
  function syncUrl() {
    var nein = $('input[name="hat_webseite"][value="nein"]');
    urlBox.hidden = !!(nein && nein.checked);
  }
  form.querySelectorAll('input[name="hat_webseite"]').forEach(function (r) { r.addEventListener("change", function () { syncUrl(); update(); }); });

  // Lesbare Schriftfarbe auf der gewählten Farbe (Kontrast nach WCAG).
  function lum(hex) {
    var n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  // Weiß wirkt auf satten Farben schöner; nur wenn es zu blass wäre (unter 3:1, große Schrift), dann dunkle Schrift.
  function onColor(hex) {
    return 1.05 / (lum(hex) + 0.05) >= 3 ? "#ffffff" : "#0b0b0b";
  }

  var eigen = $("[data-ew-eigen]"), eigenRadio = $("[data-ew-eigen-radio]"), farbname = $("[data-ew-farbname]");
  function currentColor() {
    var r = $('input[name="farbe"]:checked');
    if (!r) return { hex: "#ff5a1f", name: "" };
    if (r === eigenRadio) return { hex: eigen.value, name: "Eigene Farbe" };
    if (!r.getAttribute("data-hex")) return { hex: "#ff5a1f", name: "Vorschlag von mir" };
    return { hex: r.getAttribute("data-hex"), name: r.parentNode.querySelector(".ew-sw__t").textContent };
  }
  if (eigen) {
    eigen.addEventListener("input", function () { eigenRadio.checked = true; update(); });
    eigen.addEventListener("click", function () { eigenRadio.checked = true; update(); });
  }

  var LABEL = {
    leistungen: "Leistungen", preise: "Preise", oeffnungszeiten: "Öffnungszeiten", speisekarte: "Speisekarte",
    galerie: "Galerie", team: "Über uns", termin: "Termin buchen", kontakt: "Kontakt", anfahrt: "Anfahrt",
    bewertungen: "Bewertungen", gutscheine: "Gutscheine", jobs: "Jobs"
  };
  var CTA = { termin: "Termin buchen", speisekarte: "Zur Speisekarte", gutscheine: "Gutschein kaufen" };

  function slug(s) {
    return s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }
  function text(sel, v) { var el = prev.querySelector(sel); if (el && el.textContent !== v) el.textContent = v; }

  var lastBlocks = "";
  function update() {
    var firma = $('[name="firma"]').value.trim() || "Dein Betrieb";
    var branche = $('[name="branche"]').value.trim(), ort = $('[name="ort"]').value.trim();
    var url = $('[name="url"]').value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    var c = currentColor();

    prev.style.setProperty("--c", c.hex);
    prev.style.setProperty("--on", onColor(c.hex));
    if (farbname) farbname.textContent = c.name ? "· " + c.name : "";

    text("[data-ew-name]", firma);
    text("[data-ew-title]", firma);
    text("[data-ew-initial]", firma.charAt(0).toUpperCase());
    text("[data-ew-domain]", url && !urlBox.hidden ? url : (slug(firma) || "dein-betrieb") + ".at");
    text("[data-ew-kicker]", branche && ort ? branche + " in " + ort : branche || (ort ? "Aus " + ort : "Willkommen"));

    var stil = $('input[name="stil"]:checked');
    prev.setAttribute("data-stil", stil ? stil.value : "modern");

    var keys = [];
    form.querySelectorAll('input[name="inhalt[]"]:checked').forEach(function (i) { keys.push(i.value); });
    var shown = keys.length ? keys : ["leistungen", "team", "kontakt"];
    var sig = shown.join(",");
    if (sig !== lastBlocks) {
      lastBlocks = sig;
      var blocks = prev.querySelector("[data-ew-blocks]"), links = prev.querySelector("[data-ew-links]");
      blocks.textContent = ""; links.textContent = "";
      shown.slice(0, 6).forEach(function (k) { var s = document.createElement("span"); s.textContent = LABEL[k]; blocks.appendChild(s); });
      shown.slice(0, 3).forEach(function (k) { var s = document.createElement("i"); s.textContent = LABEL[k]; links.appendChild(s); });
    }
    var cta = "Jetzt anfragen";
    for (var k in CTA) { if (keys.indexOf(k) !== -1) { cta = CTA[k]; break; } }
    text(".ew-prev__cta", cta);

    // Mindestens ein Inhalt oder eigene Worte (das prüft auch der Server).
    var first = $('input[name="inhalt[]"]');
    first.setCustomValidity(keys.length || $('[name="wuensche"]').value.trim() ? "" : "Bitte kreuze mindestens einen Punkt an oder schreib kurz, was drauf soll.");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  // Ansicht PC / Handy
  form.querySelectorAll("[data-ew-dev]").forEach(function (b) {
    b.addEventListener("click", function () {
      var handy = b.getAttribute("data-ew-dev") === "handy";
      prev.classList.toggle("is-handy", handy);
      form.querySelectorAll("[data-ew-dev]").forEach(function (o) {
        o.classList.toggle("is-on", o === b);
        o.setAttribute("aria-pressed", String(o === b));
      });
    });
  });
  if (window.matchMedia && window.matchMedia("(max-width: 680px)").matches) {
    var hb = $('[data-ew-dev="handy"]'); if (hb) hb.click();
  }

  syncUrl();
  update();

})();
