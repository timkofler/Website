/* QR-Code-Generator (/tools/qr-code/): alles läuft im Browser, nichts wird gespeichert oder übertragen.
   Zeichnet mit tk-qr.js (runde Punkte, Ecken mit farbigem Kern, Logo in der Mitte) auf Basis von qrcode-generator.
   Bilder nur als data:-URL (FileReader, canvas.toDataURL), nie blob:, wegen der CSP (img-src 'self' data:). */
(function () {
  "use strict";
  var root = document.querySelector("[data-qr]");
  if (!root) return;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
  var K = function (k) { return $('[data-k="' + k + '"]'); };
  var val = function (k) { var el = K(k); return el ? String(el.value || "").trim() : ""; };
  var radio = function (n) { var el = $('input[name="' + n + '"]:checked'); return el ? el.value : ""; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  var out = $("[data-out]"), empty = $("[data-empty]"), what = $("[data-what]"), warn = $("[data-warn]");
  var a6 = $("[data-a6]"), cardPrev = $("[data-card-prev]"), printBtn = $("[data-print]");
  var printArea = document.querySelector("[data-print-area]");
  var logoImg = null;
  var cur = null; // { text, typ, slug } des zuletzt gezeichneten Codes

  /* ---------- Inhalt je Art ---------- */
  var wifiEsc = function (s) { return s.replace(/([\\;,:"])/g, "\\$1"); };
  var vEsc = function (s) { return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1"); };
  var phone = function (s) { s = s.replace(/[^\d+]/g, ""); if (s.indexOf("00") === 0) s = "+" + s.slice(2); return s; };
  var mailOk = function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); };
  function url(s) {
    s = s.replace(/\s+/g, "");
    if (!s) return "";
    var ig = /^@([A-Za-z0-9._]{1,30})$/.exec(s);
    if (ig) return "https://www.instagram.com/" + ig[1] + "/";
    if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = "https://" + s.replace(/^\/+/, "");
    return s;
  }
  var looksUrl = function (s) { return /^https?:\/\/[^\/\s]+\.[^\/\s]{2,}/i.test(s); };
  var slug = function (s) { return String(s).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); };

  function payload(typ) {
    var t = "", w = "", note = "";
    if (typ === "link") {
      t = url(val("url"));
      if (t && !looksUrl(t) && !/^[a-z]+:/i.test(val("url"))) { note = "Bitte prüf die Adresse, sie sieht unvollständig aus."; }
      w = t;
    } else if (typ === "google") {
      var r = val("review").replace(/\s+/g, "");
      if (/^ChIJ[\w-]{10,}$/.test(r)) t = "https://search.google.com/local/writereview?placeid=" + r;
      else t = url(r);
      if (t && !/(^https?:\/\/)?([a-z0-9-]+\.)*(g\.page|google\.[a-z.]+|goo\.gl|g\.co)(\/|$)/i.test(t.replace(/^https?:\/\//, "")))
        note = "Das sieht nicht wie ein Google-Bewertungslink aus. Wie du den richtigen Link findest, steht unter „Wo finde ich diesen Link?“.";
      w = t;
    } else if (typ === "wifi") {
      var ssid = val("ssid"), pass = K("pass").value, enc = val("enc"), hid = K("hidden").checked;
      if (ssid) {
        t = "WIFI:T:" + enc + ";S:" + wifiEsc(ssid) + ";" + (enc !== "nopass" ? "P:" + wifiEsc(pass) + ";" : "") + (hid ? "H:true;" : "") + ";";
        w = "WLAN „" + ssid + "“" + (enc === "nopass" ? ", ohne Passwort" : "");
        if (enc === "WPA" && pass.length > 0 && pass.length < 8) note = "WPA-Passwörter haben mindestens 8 Zeichen. Bitte prüf das Passwort.";
        if (enc !== "nopass" && !pass) { t = ""; w = ""; }
      }
    } else if (typ === "tel") {
      var p = phone(val("tel"));
      if (p.replace(/\D/g, "").length >= 5) { t = "tel:" + p; w = "Anruf: " + p; }
    } else if (typ === "mail") {
      var m = val("mail"), q = [];
      if (mailOk(m)) {
        if (val("subj")) q.push("subject=" + encodeURIComponent(val("subj")));
        if (val("body")) q.push("body=" + encodeURIComponent(val("body")));
        t = "mailto:" + m + (q.length ? "?" + q.join("&") : "");
        w = "E-Mail an " + m;
      }
    } else if (typ === "vcard") {
      var vn = val("vn"), nn = val("nn"), org = val("org"), vt = phone(val("vtel")), vm = val("vmail"), vu = val("vurl") ? url(val("vurl")) : "";
      if (vn || nn || org) {
        var fn = (vn + " " + nn).trim() || org, L = ["BEGIN:VCARD", "VERSION:3.0", "N:" + vEsc(nn) + ";" + vEsc(vn) + ";;;", "FN:" + vEsc(fn)];
        if (org) L.push("ORG:" + vEsc(org));
        if (vt) L.push("TEL;TYPE=CELL:" + vt);
        if (vm) L.push("EMAIL:" + vEsc(vm));
        if (vu) L.push("URL:" + vEsc(vu));
        L.push("END:VCARD");
        t = L.join("\r\n");
        w = "Kontakt: " + fn;
      }
    }
    return { text: t, what: w, note: note };
  }

  /* ---------- Aussehen ---------- */
  function hex2rgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(h) { return hex2rgb(h).map(function (c) { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }).reduce(function (a, c, i) { return a + c * [.2126, .7152, .0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }

  function opts(forText) {
    var lt = radio("qr-logo"), logo = null;
    if (lt === "img" && logoImg) logo = { img: logoImg };
    else if (lt === "text" && val("ltext")) { var lb = K("lbg").value; logo = { text: val("ltext"), bg: lb, fg: lum(lb) > .4 ? "#111111" : "#ffffff" }; }
    var o = { ink: K("ink").value, accent: K("accent").value, bg: radio("qr-bg"), dot: radio("qr-dot"), quiet: +K("quiet").value, logo: logo, utf8: true };
    // Mit Logo Fehlerkorrektur H; bei langen Inhalten Q, sonst wird der Code zu fein. Ohne Logo M.
    if (forText != null) o.ecl = logo ? (utf8len(forText) > 120 ? "Q" : "H") : "M";
    return o;
  }
  function utf8len(s) { try { return unescape(encodeURIComponent(s)).length; } catch (e) { return s.length; } }

  function checks(o, n, note) {
    var msgs = [], bg = o.bg === "transparent" ? "#ffffff" : o.bg;
    var ci = ratio(o.ink, bg), ca = ratio(o.accent, bg);
    if (lum(o.ink) > lum(bg) || ci < 3) msgs.push("<b>Zu wenig Kontrast.</b> Die Punkte brauchen eine deutlich dunklere Farbe als der Hintergrund, sonst können viele Handys den Code nicht lesen.");
    else if (ci < 4.5) msgs.push("<b>Wenig Kontrast.</b> Eine dunklere Punktfarbe macht den Code sicherer lesbar.");
    if (ca < 2.2) msgs.push("<b>Ecken zu hell.</b> Die Kerne der drei Ecken brauchen eine dunkle Farbe, daran erkennt die Kamera den Code.");
    if (o.bg === "transparent") msgs.push("<b>Transparenter Hintergrund:</b> Den Code nur auf einen hellen, ruhigen Untergrund setzen.");
    if (o.quiet === 0 && o.bg !== "transparent") msgs.push("<b>Ohne Rand</b> nur auf heller Fläche verwenden.");
    if (n > 61) msgs.push("<b>Viel Inhalt:</b> Der Code wird sehr fein. Kürzerer Link oder größer drucken (mindestens 4&nbsp;cm).");
    if (note) msgs.unshift("<b>Hinweis:</b> " + esc(note));
    warn.innerHTML = msgs.map(function (m) { return "<span>" + m + "</span>"; }).join("<br>");
    warn.hidden = !msgs.length;
  }

  /* ---------- Zeichnen ---------- */
  var DEMO = "https://tim-kofler.at/tools/qr-code/";
  function typ() { return radio("qr-typ") || "link"; }
  function render() {
    var ty = typ(), p = payload(ty), has = !!p.text, text = has ? p.text : DEMO, o = opts(text), svg = "";
    try { svg = window.tkQR.svg(text, o); } catch (e) {
      // Zu viel Inhalt für einen QR-Code
      has = false; svg = window.tkQR.svg(DEMO, opts(DEMO)); p.note = "Der Inhalt ist zu lang für einen QR-Code. Bitte kürzen.";
    }
    out.innerHTML = svg;
    out.classList.toggle("is-dim", !has);
    out.setAttribute("aria-label", has ? "QR-Code für " + p.what : "Noch kein QR-Code, zuerst die Angaben eingeben");
    empty.hidden = has;
    what.textContent = has ? p.what : "";
    $$("[data-dl]").forEach(function (b) { b.disabled = !has; });
    var n = 0; try { n = window.tkQR.info(text, o).n; } catch (e) {}
    if (has || p.note) checks(o, has ? n : 0, p.note); else { warn.hidden = true; warn.innerHTML = ""; }
    if (!has && !p.note) warn.hidden = true;
    cur = has ? { text: text, typ: ty, slug: slug(p.what.replace(/^(Anruf|E-Mail an|Kontakt|WLAN):?\s*/, "")) } : null;
    // Aufsteller nur für Google-Bewertungen
    a6.hidden = ty !== "google";
    if (ty === "google") { cardPrev.innerHTML = card(has ? text : DEMO); printBtn.disabled = !has; }
  }
  var timer = 0;
  function soon() { clearTimeout(timer); timer = setTimeout(render, 60); }

  /* ---------- A6-Aufsteller ---------- */
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f5b400" d="M12 2.6l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z"/></svg>';
  function card(text) {
    var o = opts(text), name = val("firma");
    if (o.bg === "transparent") o.bg = "#ffffff";
    return '<div class="qr-card"><div class="qr-card__in">' +
      (name ? '<p class="qr-card__name">' + esc(name) + "</p>" : "") +
      '<svg class="qr-card__line" viewBox="0 0 12 1" preserveAspectRatio="none" aria-hidden="true"><rect width="12" height="1" rx=".5" fill="' + esc(o.accent) + '"/></svg>' +
      '<p class="qr-card__h">Wir freuen uns über Ihre Bewertung</p>' +
      '<div class="qr-card__stars">' + STAR + STAR + STAR + STAR + STAR + "</div>" +
      '<div class="qr-card__qr">' + window.tkQR.svg(text, o) + "</div>" +
      '<p class="qr-card__p"><b>Code mit der Handykamera scannen</b><br>und auf Google bewerten. Danke!</p>' +
      "</div></div>";
  }
  var pageStyle = null;
  function endPrint() {
    document.body.classList.remove("qr-printing");
    if (pageStyle) { pageStyle.remove(); pageStyle = null; }
    printArea.innerHTML = "";
  }
  printBtn.addEventListener("click", function () {
    if (!cur || typ() !== "google") return;
    endPrint();
    printArea.innerHTML = card(cur.text);
    pageStyle = document.createElement("style");
    pageStyle.textContent = "@page { size: 105mm 148mm; margin: 0; }";
    document.head.appendChild(pageStyle);
    document.body.classList.add("qr-printing");
    window.addEventListener("afterprint", endPrint, { once: true });
    window.print();
  });

  /* ---------- Herunterladen (data:-URL statt blob:) ---------- */
  function save(href, name) {
    var a = document.createElement("a");
    a.href = href; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); }, 0);
  }
  $$("[data-dl]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!cur) return;
      var o = opts(cur.text), base = "qr-code-" + (cur.slug || cur.typ);
      if (b.getAttribute("data-dl") === "svg") {
        var s = window.tkQR.svg(cur.text, o).replace("<svg ", '<svg width="1024" height="1024" ');
        save("data:image/svg+xml;charset=utf-8," + encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>\n' + s), base + ".svg");
      } else {
        var px = +b.getAttribute("data-px") || 1024, cv = document.createElement("canvas");
        cv.width = cv.height = px;
        var ctx = cv.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        window.tkQR.draw(ctx, cur.text, 0, 0, px, o);
        save(cv.toDataURL("image/png"), base + "-" + px + ".png");
      }
    });
  });

  /* ---------- Logo laden: FileReader -> data:-URL, auf max. 640 px verkleinert ---------- */
  var fileLabel = $("[data-file-label]"), fileLabelHtml = fileLabel.innerHTML;
  K("file").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) { fileLabel.innerHTML = "Bitte ein Bild wählen <em>PNG, JPG, WebP oder SVG</em>"; return; }
    if (f.size > 8 * 1024 * 1024) { fileLabel.innerHTML = "Das Bild ist zu groß <em>höchstens 8 MB</em>"; return; }
    var fr = new FileReader();
    fr.onload = function () {
      var src = new Image();
      src.onload = function () {
        var w = src.naturalWidth || 512, h = src.naturalHeight || 512, s = Math.min(1, 640 / Math.max(w, h)), url = fr.result;
        try {
          var cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(h * s));
          var c = cv.getContext("2d"); c.imageSmoothingQuality = "high"; c.drawImage(src, 0, 0, cv.width, cv.height);
          url = cv.toDataURL("image/png");
        } catch (e) { url = fr.result; }
        var img = new Image();
        img.onload = function () { logoImg = img; fileLabel.innerHTML = esc(f.name) + " <em>Anderes Bild wählen</em>"; render(); };
        img.src = url;
      };
      src.onerror = function () { fileLabel.innerHTML = "Das Bild ließ sich nicht öffnen <em>Anderes Bild wählen</em>"; };
      src.src = fr.result;
    };
    fr.readAsDataURL(f);
  });

  /* ---------- Bedienung ---------- */
  function showTyp() {
    var t = typ();
    $$(".qr-fields").forEach(function (f) { f.hidden = f.getAttribute("data-typ") !== t; });
  }
  function showLogo() {
    var l = radio("qr-logo");
    $$("[data-logo]").forEach(function (el) { el.hidden = el.getAttribute("data-logo") !== l; });
    if (l === "img" && !logoImg) fileLabel.innerHTML = fileLabelHtml;
  }
  function hexes() {
    ["ink", "accent", "lbg"].forEach(function (k) { var b = $('[data-hex="' + k + '"]'); if (b) b.textContent = K(k).value; });
    $("[data-rand]").textContent = K("quiet").value;
    var i = K("ink").value.toLowerCase(), a = K("accent").value.toLowerCase();
    $$(".qr-sw").forEach(function (s) { s.setAttribute("aria-pressed", String(s.getAttribute("data-ink") === i && s.getAttribute("data-accent") === a)); });
  }
  $$(".qr-sw").forEach(function (s) {
    s.addEventListener("click", function () {
      K("ink").value = s.getAttribute("data-ink"); K("accent").value = s.getAttribute("data-accent");
      hexes(); render();
    });
  });
  root.addEventListener("input", function (e) {
    if (e.target.type === "file") return;
    if (e.target.type === "color" || e.target.type === "range") hexes();
    soon();
  });
  root.addEventListener("change", function (e) {
    var n = e.target.name;
    if (n === "qr-typ") showTyp();
    if (n === "qr-logo") showLogo();
    if (e.target.type !== "file") { hexes(); render(); }
  });
  // Bei Seiten-Wiederherstellung (Zurück-Taste) stehen evtl. alte Werte in den Feldern
  window.addEventListener("pageshow", function () { showTyp(); showLogo(); hexes(); render(); });

  function start() {
    if (typeof window.qrcode !== "function" || !window.tkQR) return;
    showTyp(); showLogo(); hexes(); render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
