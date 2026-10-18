// Tim Kofler – Angebots-Rechner auf der Startseite (#rechner).
// Rechnet aus Seitenanzahl und Extras einen Richtpreis und trägt die Auswahl ins Anfrageformular ein.
// Alle Preise stehen als data-Attribute im HTML (index.html, Block "tk-calc"), hier wird nur gerechnet.
// Läuft ohne externe Dienste und ohne Tracking; ohne JavaScript bleiben die Preise pro Option lesbar.
(function () {
  var root = document.querySelector("[data-tk-calc]");
  if (!root) return;

  var pages = root.querySelector("[data-calc-pages]");
  var pagesOut = root.querySelector("[data-calc-pages-out]");
  var extras = Array.prototype.slice.call(root.querySelectorAll("[data-calc-extra]"));
  var monthly = Array.prototype.slice.call(root.querySelectorAll("[data-calc-monthly]"));
  var ref = root.querySelector("[data-calc-ref]");
  var refWrap = root.querySelector("[data-calc-ref-wrap]");
  var amountEl = root.querySelector("[data-calc-amount]");
  var pkgEl = root.querySelector("[data-calc-paket]");
  var listEl = root.querySelector("[data-calc-list]");
  var monthEl = root.querySelector("[data-calc-month]");
  var goBtn = root.querySelector("[data-calc-go]");
  var resetBtn = root.querySelector("[data-calc-reset]");
  var bar = document.querySelector("[data-calc-bar]");
  var barAmount = bar ? bar.querySelector("[data-calc-bar-amount]") : null;
  var toggleWrap = root.querySelector("[data-calc-toggle-wrap]");
  var toggle = root.querySelector("[data-calc-toggle]");
  var toggleText = root.querySelector("[data-calc-toggle-text]");
  var body = root.querySelector("[data-calc-body]");
  var teaser = root.querySelector("[data-calc-teaser]");
  var isOpen = true;

  // Grundpreise der Pakete (wie auf der Seite) und Aufschlag je weiterer Seite über Business hinaus.
  var P = {
    ref: num(root.getAttribute("data-preis-referenz"), 290),
    start: num(root.getAttribute("data-preis-start"), 590),
    startSeiten: num(root.getAttribute("data-start-seiten"), 3),
    business: num(root.getAttribute("data-preis-business"), 1190),
    businessSeiten: num(root.getAttribute("data-business-seiten"), 8),
    proSeite: num(root.getAttribute("data-preis-weitere-seite"), 120)
  };
  // Anzeige-Modus (data-modus am Block): "genau" = Richtpreis und Einzelpreise, "spanne" = nur gerundete Spanne ohne
  // Einzelpreise der Extras, "ohne" = gar kein Preis. Die genaue Rechnung geht in allen Modi nur im versteckten Feld "rechner" an Tim.
  var MODE = root.getAttribute("data-modus") || "spanne";
  var PAKET_OPTION = { ref: "Referenzkunde (ab 290 €)", start: "Start (ab 590 €)", business: "Business (ab 1.190 €)" };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function text(el, s) { if (el) el.textContent = s; }

  // Berechnet alles aus dem aktuellen Zustand der Eingaben.
  function calc() {
    var n = Math.max(1, Math.round(num(pages.value, 3)));
    var paket, base, note = "";
    var refOk = n === 1;
    if (ref && ref.checked && refOk) { paket = "ref"; base = P.ref; }
    else if (n <= P.startSeiten) { paket = "start"; base = P.start; }
    else if (n <= P.businessSeiten) { paket = "business"; base = P.business; }
    else { paket = "business"; base = P.business + (n - P.businessSeiten) * P.proSeite; note = (n - P.businessSeiten) + " weitere Seiten"; }

    var lines = [], sum = base, monthSum = 0, monthLines = [], monthNames = [];
    var paketName = paket === "ref" ? "Referenzkunde" : paket === "start" ? "Paket Start" : "Paket Business";
    lines.push({ k: paketName + " · " + n + (n === 1 ? " Seite" : " Seiten") + (note ? " (" + note + ")" : ""), v: base });

    extras.forEach(function (cb) {
      var lab = cb.closest("label");
      var inkl = (cb.getAttribute("data-inkl") || "").split(/\s+/).indexOf(paket) > -1;
      var proSeite = cb.hasAttribute("data-pro-seite");
      var preis = num(cb.getAttribute("data-preis"), 0) * (proSeite ? n : 1);
      var priceEl = lab ? lab.querySelector("em") : null;
      if (priceEl) {
        if (inkl) priceEl.textContent = "inklusive";
        else if (MODE !== "genau") priceEl.textContent = cb.hasAttribute("data-ab") ? "nach Aufwand" : "";
        else priceEl.textContent = (cb.hasAttribute("data-ab") ? "ab + " : "+ ") + fmt(preis) + " €";
      }
      if (lab) { lab.classList.toggle("is-inkl", inkl); lab.classList.toggle("is-on", cb.checked); }
      if (!cb.checked) return;
      if (inkl) { lines.push({ k: cb.getAttribute("data-calc-extra"), v: 0, inkl: true }); return; }
      sum += preis;
      lines.push({ k: cb.getAttribute("data-calc-extra") + (cb.hasAttribute("data-ab") ? " (ab)" : ""), v: preis });
    });

    monthly.forEach(function (cb) {
      var ml = cb.closest("label"); if (ml) ml.classList.toggle("is-on", cb.checked);
      if (!cb.checked) return;
      var preis = num(cb.getAttribute("data-preis"), 0);
      monthSum += preis;
      monthNames.push(cb.getAttribute("data-calc-monthly"));
      monthLines.push(cb.getAttribute("data-calc-monthly") + " " + fmt(preis) + " € im Monat");
    });

    // Spanne: unten auf 50 gerundet (nie unter dem Paketpreis), oben rund 20 % Luft für Abstimmung und Sonderwünsche.
    var lo = Math.max(base, Math.floor(sum / 50) * 50), hi = Math.ceil(sum * 1.2 / 50) * 50;
    return { n: n, paket: paket, paketName: paketName, base: base, sum: sum, lo: lo, hi: hi, lines: lines, monthSum: monthSum, monthLines: monthLines, monthNames: monthNames, refOk: refOk };
  }

  var shown = null; // zuletzt angezeigter Betrag für die Zählanimation
  function animateTo(target) {
    if (!amountEl) return;
    if (reduce || shown === null || Math.abs(target - shown) < 1) { shown = target; text(amountEl, fmt(target)); return; }
    var from = shown, start = null, dur = 420;
    shown = target;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - t, 3);
      text(amountEl, fmt(from + (target - from) * e));
      if (t < 1 && shown === target) requestAnimationFrame(step);
      else if (shown === target) text(amountEl, fmt(target));
    }
    requestAnimationFrame(step);
  }

  function render() {
    var r = calc();
    text(pagesOut, r.n + (r.n === 1 ? " Seite" : " Seiten"));
    if (refWrap) {
      refWrap.classList.toggle("is-off", !r.refOk);
      if (ref) ref.disabled = !r.refOk;
      refWrap.classList.toggle("is-on", !!(ref && ref.checked && r.refOk));
    }
    if (MODE === "genau") animateTo(r.sum);
    else if (MODE === "spanne") text(amountEl, fmt(r.lo) + " bis " + fmt(r.hi));
    text(pkgEl, r.paketName + " · " + r.n + (r.n === 1 ? " Seite" : " Seiten"));
    if (listEl) {
      listEl.innerHTML = "";
      r.lines.forEach(function (l) {
        var li = document.createElement("li");
        var k = document.createElement("span"); k.textContent = l.k;
        var v = document.createElement("b"); v.textContent = l.inkl ? "inkl." : MODE === "genau" ? fmt(l.v) + " €" : "";
        li.appendChild(k); li.appendChild(v); listEl.appendChild(li);
      });
    }
    if (monthEl) {
      monthEl.hidden = r.monthSum === 0;
      text(monthEl, r.monthSum ? "+ " + fmt(r.monthSum) + " € im Monat (" + r.monthNames.join(", ") + "), monatlich kündbar" : "");
    }
    if (teaser) text(teaser, MODE === "genau" ? "ca. " + fmt(r.sum) + " €" : MODE === "spanne" ? "ca. " + fmt(r.lo) + " bis " + fmt(r.hi) + " €" : r.paketName);
    if (barAmount) text(barAmount, MODE === "genau" ? "ca. " + fmt(r.sum) + " €" : MODE === "spanne" ? "ca. " + fmt(r.lo) + "–" + fmt(r.hi) + " €" : r.paketName);
    root.setAttribute("data-paket", r.paket);
    return r;
  }

  // Text für das Feld "Was soll die Seite können?" im Anfrageformular (sieht auch der Besucher).
  function summary(r) {
    var s = "Meine Auswahl im Angebots-Rechner:\n";
    r.lines.forEach(function (l) { s += "• " + l.k + (l.inkl ? " (inklusive)" : "") + "\n"; });
    r.monthLines.forEach(function (m) { s += "• " + m + "\n"; });
    if (MODE === "genau") s += "Richtpreis laut Rechner: ca. " + fmt(r.sum) + " € einmalig" + (r.monthSum ? " + " + fmt(r.monthSum) + " € im Monat" : "") + "\n";
    else if (MODE === "spanne") s += "Richtpreis laut Rechner: ca. " + fmt(r.lo) + " bis " + fmt(r.hi) + " € einmalig" + (r.monthSum ? " + " + fmt(r.monthSum) + " € im Monat" : "") + "\n";
    return s;
  }

  // Genaue Rechnung nur für Tim (verstecktes Feld "rechner", steht in der Benachrichtigungs-Mail).
  function detail(r) {
    var parts = r.lines.map(function (l) { return l.k + " " + (l.inkl ? "inkl." : fmt(l.v) + " €"); });
    return parts.join(" | ") + " | Summe " + fmt(r.sum) + " € einmalig" + (r.monthSum ? " + " + fmt(r.monthSum) + " €/Monat" : "") + " (Modus " + MODE + ")";
  }

  var lastInserted = "";
  function sendToForm() {
    var r = render();
    var form = document.querySelector('form[data-cx-form] select[name="paket"]');
    var ta = document.querySelector('form[data-cx-form] textarea[name="nachricht"]');
    if (form) form.value = PAKET_OPTION[r.paket] || "Noch unsicher";
    var hidden = document.querySelector('form[data-cx-form] input[name="rechner"]');
    if (hidden) hidden.value = detail(r).slice(0, 1000);
    if (ta) {
      var own = ta.value;
      // Eine frühere Auswahl aus dem Rechner wird ersetzt, eigener Text bleibt erhalten.
      if (lastInserted && own.indexOf(lastInserted) === 0) own = own.slice(lastInserted.length).replace(/^\n+/, "");
      var block = summary(r);
      ta.value = block + (own ? "\n" + own : "");
      lastInserted = block;
      ta.classList.add("is-filled");
      setTimeout(function () { ta.classList.remove("is-filled"); }, 2200);
    }
    var target = document.getElementById("anfrage");
    if (target) {
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + "#anfrage");
      var first = target.querySelector('input[name="name"]');
      if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, reduce ? 0 : 700);
    }
  }

  function reset() {
    pages.value = pages.getAttribute("value") || 3;
    extras.concat(monthly).forEach(function (cb) { cb.checked = cb.hasAttribute("data-default"); });
    if (ref) ref.checked = false;
    render();
  }

  root.addEventListener("input", render);
  root.addEventListener("change", render);
  if (goBtn) goBtn.addEventListener("click", sendToForm);
  if (resetBtn) resetBtn.addEventListener("click", function (e) { e.preventDefault(); reset(); });

  // Zusammenklappen: Der Rechner ist eingeklappt, damit die Seite kürzer bleibt. Links auf #rechner öffnen ihn.
  // Ohne JavaScript bleibt er offen.
  var barUpdate = function () {};
  var moveTimer;
  function setOpen(open, instant) {
    isOpen = open;
    if (instant) root.classList.add("is-instant");
    else {
      // Während des Auf- und Zuklappens abschneiden, danach wieder Schatten und Fokusrahmen zeigen
      root.classList.add("is-moving");
      clearTimeout(moveTimer);
      moveTimer = setTimeout(function () { root.classList.remove("is-moving"); }, reduce ? 0 : 600);
    }
    root.classList.toggle("is-closed", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("btn--line", open);
    text(toggleText, open ? "Rechner einklappen" : "Rechner öffnen");
    if (open) body.removeAttribute("inert"); else body.setAttribute("inert", "");
    if (instant) { void root.offsetWidth; root.classList.remove("is-instant"); }
    barUpdate();
  }
  if (toggle && body) {
    toggleWrap.hidden = false;
    setOpen(location.hash === "#rechner", true);
    toggle.addEventListener("click", function () {
      setOpen(!isOpen);
      if (!isOpen) {
        // Beim Einklappen nicht ins Leere schauen: den Kopf des Rechners im Bild halten
        var top = root.getBoundingClientRect().top;
        if (top < 0) root.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href$="#rechner"]');
      if (a && !isOpen) setOpen(true);
    });
    window.addEventListener("hashchange", function () { if (location.hash === "#rechner" && !isOpen) setOpen(true); });
  }

  // Kleine Leiste am Handy: zeigt den Richtpreis, solange der Rechner im Bild ist, aber das Ergebnis selbst nicht.
  if (bar && "IntersectionObserver" in window) {
    var barBtn = bar.querySelector("[data-calc-bar-go]");
    if (barBtn) barBtn.addEventListener("click", sendToForm);
    var sumEl = root.querySelector(".tk-calc__sum"), rootIn = false, sumIn = false;
    barUpdate = function () {
      var on = isOpen && rootIn && !sumIn;
      bar.classList.toggle("is-on", on);
      // Ausgeblendet: weder sichtbar noch per Tab erreichbar
      bar.setAttribute("aria-hidden", String(!on));
      if (on) bar.removeAttribute("inert"); else bar.setAttribute("inert", "");
    };
    new IntersectionObserver(function (entries) { rootIn = entries[0].isIntersecting; barUpdate(); }, { threshold: 0 }).observe(root);
    if (sumEl) new IntersectionObserver(function (entries) { sumIn = entries[0].isIntersecting; barUpdate(); }, { threshold: 0.2 }).observe(sumEl);
  }

  render();
})();
