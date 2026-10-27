// Studio Mila – Beispielseite Nagelstudio. Navigation, Galerie mit Filter und Lightbox,
// Nagel-Konfigurator, Auffüll-Erinnerung mit Kalenderdatei, Gutschein-Vorschau und Terminanfrage (Attrappe).
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  var DEMO_MSG = "Das ist ein Beispiel – auf der echten Seite käme deine Anfrage jetzt direkt im Studio an.";
  var TAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var TAGE_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MONATE = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  /* ---------- Navigation ---------- */
  var bar = $(".tk-demo-bar"), nav = $("#nav"), burger = $("#burger"), panel = $("#panel");
  function setBar() { document.documentElement.style.setProperty("--bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar(); window.addEventListener("resize", setBar);
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { menu(false); burger.focus(); } });

  /* ---------- Freie Termine (erfundene, aber stabile Belegung) ---------- */
  // Offen Di–Sa; welche Zeiten belegt sind, hängt nur vom Datum ab, damit die Seite bei jedem Besuch gleich aussieht.
  function slotsFor(d) {
    var wd = d.getDay(); if (wd === 0 || wd === 1) return [];
    var all = wd === 6 ? ["08:00", "09:30", "11:00"] : ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
    var seed = d.getDate() * 7 + d.getMonth() * 13;
    return all.map(function (t, i) { return { t: t, frei: ((seed + i * 5) % 7) > 2 }; });
  }
  function nextDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < n) { d.setDate(d.getDate() + 1); if (slotsFor(d).length) out.push(new Date(d)); }
    return out;
  }
  var days = nextDays(7);
  (function () {
    var now = new Date();
    for (var i = 0; i < days.length; i++) {
      var s = slotsFor(days[i]).filter(function (x) { return x.frei; })[0];
      if (s) {
        var diff = Math.round((days[i] - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
        $("#next-slot").textContent = (diff === 1 ? "Morgen" : TAGE_LANG[days[i].getDay()]) + ", " + s.t.replace(/^0/, "") + " Uhr";
        break;
      }
    }
  })();

  /* ---------- Galerie: Filter + Lightbox ---------- */
  var works = $$(".work"), fbtn = $$(".filters button");
  fbtn.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-f");
      fbtn.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      works.forEach(function (w) {
        var on = f === "alle" || (" " + w.getAttribute("data-tags") + " ").indexOf(" " + f + " ") > -1;
        w.classList.toggle("is-off", !on);
        if (on) w.classList.add("is-in");
      });
      stagger();
    });
  });
  // Versetzte Spalten wie in einem Magazin: mittlere Spalte (PC) bzw. zweite Spalte (Handy) rutscht nach unten.
  function stagger() {
    visible().forEach(function (w, i) { w.classList.toggle("is-mid", i % 3 === 1); w.classList.toggle("is-odd", i % 2 === 1); });
  }
  var lb = $("#lb"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), cur = 0, lastFocus = null;
  function visible() { return works.filter(function (w) { return !w.classList.contains("is-off"); }); }
  stagger();
  function show(i) {
    var v = visible(); cur = (i + v.length) % v.length;
    var img = $("img", v[cur]);
    lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = $("figcaption", v[cur]).textContent;
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  works.forEach(function (w) {
    $("button", w).addEventListener("click", function (e) {
      lastFocus = e.currentTarget; show(visible().indexOf(w)); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lb-x").focus();
    });
  });
  $("#lb-x").addEventListener("click", closeLb);
  $("#lb-p").addEventListener("click", function () { show(cur - 1); });
  $("#lb-n").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });

  /* ---------- Nagel-Konfigurator ---------- */
  var FORMEN = [["rund", "Rund"], ["oval", "Oval"], ["mandel", "Mandel"], ["eckig", "Eckig"], ["ballerina", "Ballerina"]];
  var FARBEN = [["Nude", "#e3bfb2"], ["Rosé", "#e0a3aa"], ["Milchweiß", "#f3ede8"], ["Kirschrot", "#a8162c"], ["Bordeaux", "#5e1a28"],
    ["Salbei", "#8ea28a"], ["Lavendel", "#b3a3d4"], ["Mitternacht", "#1e2340"], ["Espresso", "#4d3027"]];
  var LEN = { kurz: 0.7, mittel: 1, lang: 1.45 };

  // Nagelumriss mit Nagelhaut bei y=0; r = halbe Breite, B = Länge des Nagelbetts, T = freier Rand.
  function nailPath(shape, r, B, T) {
    var k = r * 0.28, p = "M" + (-r) + "," + (-k) + " Q0," + (k * 1.2) + " " + r + "," + (-k) + " L" + r + "," + (-B) + " ";
    var top = -B - T;
    if (shape === "rund") p += "C" + r + "," + (top + T * 0.05) + " " + (-r) + "," + (top + T * 0.05) + " " + (-r) + "," + (-B);
    else if (shape === "oval") p += "C" + (r * 1.02) + "," + (top - T * 0.25) + " " + (-r * 1.02) + "," + (top - T * 0.25) + " " + (-r) + "," + (-B);
    else if (shape === "mandel") p += "C" + r + "," + (-B - T * 0.55) + " " + (r * 0.28) + "," + top + " 0," + top + " C" + (-r * 0.28) + "," + top + " " + (-r) + "," + (-B - T * 0.55) + " " + (-r) + "," + (-B);
    else if (shape === "eckig") { var c = r * 0.22; p += "L" + r + "," + (top + c) + " Q" + r + "," + top + " " + (r - c) + "," + top + " L" + (-r + c) + "," + top + " Q" + (-r) + "," + top + " " + (-r) + "," + (top + c); }
    else { var w = r * 0.58, c2 = r * 0.16; p += "L" + w + "," + (top + c2) + " Q" + w + "," + top + " " + (w - c2) + "," + top + " L" + (-w + c2) + "," + top + " Q" + (-w) + "," + top + " " + (-w) + "," + (top + c2); }
    return p + " Z";
  }
  var TIP = { rund: 0.55, oval: 1.0, mandel: 1.5, eckig: 0.95, ballerina: 1.45 };

  function el(name, attrs, parent) {
    var e = document.createElementNS(SVGNS, name);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // Vier Finger als weiche Formen, leicht gefächert; Nägel werden bei jeder Änderung neu gezeichnet.
  var FINGER = [{ x: 108, y: 128, w: 52, rot: -9 }, { x: 170, y: 96, w: 56, rot: -3 }, { x: 234, y: 104, w: 54, rot: 3 }, { x: 292, y: 146, w: 46, rot: 9 }];
  var hand = $("#hand"), nails = [];
  (function build() {
    var defs = el("defs", {}, hand);
    var sk = el("linearGradient", { id: "skin", x1: "0", x2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#d9ae9c" }, sk); el("stop", { offset: ".45", "stop-color": "#f0d2c4" }, sk); el("stop", { offset: "1", "stop-color": "#cf9f8d" }, sk);
    var fade = el("linearGradient", { id: "fade", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: ".55", "stop-color": "#fff" }, fade); el("stop", { offset: ".95", "stop-color": "#fff", "stop-opacity": "0" }, fade);
    var mask = el("mask", { id: "m-fade" }, defs); el("rect", { x: 0, y: 0, width: 400, height: 400, fill: "url(#fade)" }, mask);
    var chrome = el("linearGradient", { id: "chrome", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".85" }, chrome); el("stop", { offset: ".35", "stop-color": "#fff", "stop-opacity": "0" }, chrome);
    el("stop", { offset: ".6", "stop-color": "#fff", "stop-opacity": ".5" }, chrome); el("stop", { offset: "1", "stop-color": "#000", "stop-opacity": ".25" }, chrome);
    var g = el("g", { mask: "url(#m-fade)" }, hand);
    FINGER.forEach(function (f, i) {
      var fg = el("g", { transform: "translate(" + f.x + "," + f.y + ") rotate(" + f.rot + ")" }, g);
      var h = 360 - f.y, r = f.w / 2;
      el("path", { d: "M" + (-r) + "," + h + " L" + (-r) + "," + r + " A" + r + "," + r + " 0 0 1 " + r + "," + r + " L" + r + "," + h + " Z", fill: "url(#skin)" }, fg);
      el("path", { d: "M" + (-r * 0.5) + "," + (f.w * 1.7) + " q" + (r * 0.5) + "," + (r * 0.22) + " " + r + ",0", stroke: "#c4907e", "stroke-width": "1.4", fill: "none", opacity: ".55" }, fg);
      var ng = el("g", { class: "nail", transform: "translate(0," + (f.w * 1.12) + ")" }, fg);
      nails.push({ g: ng, w: f.w });
    });
  })();

  var cfg = $("#cfg"), formBox = $("#o-form"), farbBox = $("#o-farbe");
  FORMEN.forEach(function (f, i) {
    formBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="form" value="' + f[0] + '"' + (f[0] === "mandel" ? " checked" : "") + '><span><svg viewBox="-12 -34 24 36" aria-hidden="true"><path fill="currentColor" d="' + nailPath(f[0], 8, 14, 14 * TIP[f[0]]) + '"/></svg>' + f[1] + "</span></label>");
  });
  FARBEN.forEach(function (c, i) {
    farbBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="farbe" value="' + i + '"' + (i === 1 ? " checked" : "") + ' aria-label="' + c[0] + '"><span style="--c:' + c[1] + '" title="' + c[0] + '"></span></label>');
  });
  function val(n) { var x = cfg.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : ""; }
  var look = null;
  function draw() {
    var shape = val("form"), len = val("len"), fin = val("fin"), fc = FARBEN[+val("farbe")];
    nails.forEach(function (n) {
      var r = n.w * 0.34, B = n.w * 0.78, T = r * TIP[shape] * LEN[len] * 1.6, d = nailPath(shape, r, B, T);
      while (n.g.firstChild) n.g.removeChild(n.g.firstChild);
      var id = "c" + Math.random().toString(36).slice(2, 8);
      var cp = el("clipPath", { id: id }, n.g); el("path", { d: d }, cp);
      var base = fin === "french" ? "#f3d6d0" : fc[1];
      el("path", { d: d, fill: base, opacity: fin === "french" ? ".92" : "1" }, n.g);
      var inner = el("g", { "clip-path": "url(#" + id + ")" }, n.g);
      if (fin === "french") el("path", { d: "M" + (-r * 1.4) + "," + (-B - T * 0.15) + " Q0," + (-B - T * 0.15 - r * 0.9) + " " + (r * 1.4) + "," + (-B - T * 0.15) + " L" + (r * 1.4) + "," + (-B - T - r) + " L" + (-r * 1.4) + "," + (-B - T - r) + " Z", fill: fc[0] === "Rosé" || fc[0] === "Nude" ? "#f7f3ef" : fc[1] }, inner);
      if (fin === "chrom") el("rect", { x: -r, y: -B - T - 4, width: r * 2, height: B + T + 8, fill: "url(#chrome)" }, inner);
      if (fin === "glanz" || fin === "chrom" || fin === "french") el("path", { d: "M" + (-r * 0.45) + "," + (-B * 0.25) + " C" + (-r * 0.55) + "," + (-B * 0.8) + " " + (-r * 0.4) + "," + (-B - T * 0.4) + " " + (-r * 0.12) + "," + (-B - T * 0.55), stroke: "#fff", "stroke-width": r * 0.22, "stroke-linecap": "round", fill: "none", opacity: fin === "chrom" ? ".7" : ".45" }, inner);
      if (fin === "matt") el("rect", { x: -r, y: -B - T - 4, width: r * 2, height: B + T + 8, fill: "#fff", opacity: ".08" }, inner);
      el("path", { d: d, fill: "none", stroke: "rgba(0,0,0,.18)", "stroke-width": "1" }, n.g);
      n.g.classList.remove("pop"); void n.g.getBoundingClientRect(); n.g.classList.add("pop");
    });
    var fN = FORMEN.filter(function (f) { return f[0] === shape; })[0][1];
    var finN = { glanz: "Glanz", matt: "Matt", chrom: "Chrom", french: "French" }[fin];
    $("#look-tag").textContent = fN + " · " + (fin === "french" ? "French " + fc[0] : fc[0] + " · " + finN);
    // Preis: lange Formen brauchen eine Modellage, kurze runde Nägel gehen als Verstärkung.
    var svc = (len === "kurz" && (shape === "rund" || shape === "oval" || shape === "eckig")) ? ["Naturnagelverstärkung", 49, 75] : ["Gel-Modellage Neu", 59, 90];
    var extra = (fin === "chrom" ? 8 : 0) + (fin === "french" ? 6 : 0) + (len === "lang" ? 5 : 0);
    $("#cfg-price").textContent = "ca. " + (svc[1] + extra) + " €";
    $("#cfg-time").textContent = svc[0] + " · ca. " + (svc[2] + (fin === "french" ? 15 : 0)) + " Min.";
    look = { txt: $("#look-tag").textContent + " · " + { kurz: "kurz", mittel: "mittellang", lang: "lang" }[len], color: fc[1], svc: svc[0] };
  }
  cfg.addEventListener("change", draw);
  draw();

  /* ---------- Terminanfrage ---------- */
  var dayBox = $("#b-days"), timeBox = $("#b-times"), lookChip = $("#look-chip");
  days.forEach(function (d, i) {
    dayBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="tag" value="' + i + '"' + (i === 0 ? " checked" : "") + '><span><small>' + TAGE[d.getDay()] + "</small>" + d.getDate() + "." + (d.getMonth() + 1) + ".</span></label>");
  });
  function renderTimes() {
    var d = days[+($('input[name="tag"]:checked', dayBox) || { value: 0 }).value], first = true;
    timeBox.innerHTML = "";
    slotsFor(d).forEach(function (s) {
      timeBox.insertAdjacentHTML("beforeend", '<label><input type="radio" name="zeit" value="' + s.t + '"' + (s.frei ? (first ? " checked" : "") : " disabled") + "><span>" + s.t + "</span></label>");
      if (s.frei) first = false;
    });
  }
  dayBox.addEventListener("change", renderTimes);
  renderTimes();
  function pickDay(date) {
    var best = 0, bd = Infinity;
    days.forEach(function (d, i) { var x = Math.abs(d - date); if (x < bd) { bd = x; best = i; } });
    var inp = $('input[value="' + best + '"]', dayBox); inp.checked = true; renderTimes();
  }
  $("#cfg-take").addEventListener("click", function () {
    $("#look-txt").textContent = "Dein Look: " + look.txt;
    $("i", lookChip).style.setProperty("--c", look.color);
    lookChip.classList.add("on");
    $("#b-svc").value = look.svc;
  });
  $("#look-x").addEventListener("click", function () { lookChip.classList.remove("on"); });
  $("#book").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#b-name"), tel = $("#b-tel"), msg = $("#b-msg");
    if (!name.value.trim() || !tel.value.trim()) { msg.textContent = "Bitte Name und Telefonnummer angeben."; (name.value.trim() ? tel : name).focus(); return; }
    var d = days[+$('input[name="tag"]:checked', dayBox).value], t = $('input[name="zeit"]:checked', timeBox);
    msg.textContent = "Danke, " + name.value.trim().split(" ")[0] + "! Anfrage für " + TAGE_LANG[d.getDay()] + ", " + d.getDate() + ". " + MONATE[d.getMonth()] + (t ? " um " + t.value + " Uhr" : "") + ". " + DEMO_MSG;
  });

  /* ---------- Auffüll-Erinnerung ---------- */
  var rDate = $("#r-date"), rType = $("#r-type"), due = null;
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  (function () { var d = new Date(); d.setDate(d.getDate() - 16); rDate.value = iso(d); rDate.max = iso(new Date()); })();
  function refill() {
    if (!rDate.value) return;
    var p = rDate.value.split("-"), last = new Date(+p[0], +p[1] - 1, +p[2]);
    var span = rType.value.split("-"), a = new Date(last), b = new Date(last);
    a.setDate(a.getDate() + +span[0]); b.setDate(b.getDate() + +span[1]); due = a;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var since = Math.max(0, Math.round((today - last) / 864e5)), mm = since / 10;
    var fmt = function (d, y) { return d.getDate() + ". " + MONATE[d.getMonth()] + (y ? " " + d.getFullYear() : ""); };
    var out = $("#r-out");
    if (today > b) out.textContent = "Höchste Zeit! Am besten diese Woche.";
    else if (today >= a) out.textContent = "Jetzt ist der richtige Moment, bis " + fmt(b) + ".";
    else out.textContent = "Am besten zwischen " + fmt(a) + " und " + fmt(b) + ".";
    $("#r-sub").textContent = since === 0 ? "Frisch gemacht, da wächst noch nichts raus." :
      "Seit dem letzten Termin ist dein Nagel etwa " + mm.toFixed(1).replace(".", ",") + " mm nachgewachsen" + (mm >= 2.5 ? ", die Lücke an der Nagelhaut wird sichtbar." : ".");
    var share = Math.min(1, since / +span[1]);
    $("#r-meter").style.width = (share * 100) + "%";
    var gap = Math.min(26, mm * 6), yb = 126 - gap;
    $("#g-pol").setAttribute("d", "M37 " + yb + "V40c0-15 46-15 46 0v" + (yb - 40) + "c-8 8-38 8-46 0Z");
  }
  rDate.addEventListener("change", refill); rType.addEventListener("change", refill);
  refill();
  $("#r-ics").addEventListener("click", function () {
    if (!due) return;
    var n = rType.options[rType.selectedIndex].getAttribute("data-n");
    var d = new Date(due); d.setDate(d.getDate() - 3);
    var st = iso(d).replace(/-/g, ""), en = new Date(d); en.setDate(en.getDate() + 1);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Studio Mila//Beispiel//DE", "BEGIN:VEVENT",
      "UID:" + st + "-mila@beispiel", "DTSTAMP:" + iso(new Date()).replace(/-/g, "") + "T000000Z",
      "DTSTART;VALUE=DATE:" + st, "DTEND;VALUE=DATE:" + iso(en).replace(/-/g, ""),
      "SUMMARY:Nägel: " + n + " bei Studio Mila buchen", "DESCRIPTION:Erinnerung von der Beispielseite Studio Mila (tim-kofler.at).",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "naegel-erinnerung.ics"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $("#r-book").addEventListener("click", function () {
    if (due) pickDay(due);
    $("#b-svc").value = rType.options[rType.selectedIndex].getAttribute("data-n");
  });

  /* ---------- Gutschein ---------- */
  var gift = $("#gift");
  function giftUpd() {
    var v = $('input[name="val"]:checked', gift).value, isSvc = !/€/.test(v);
    $("#v-val").textContent = v;
    $("#v-what").textContent = isSvc ? "gültig für" : "für eine Auszeit";
    $("#v-to").textContent = $("#v-to-in").value.trim() || "dich";
    $("#v-from").textContent = $("#v-from-in").value.trim() || "mir";
  }
  gift.addEventListener("input", giftUpd); gift.addEventListener("change", giftUpd);
  gift.addEventListener("submit", function (e) { e.preventDefault(); $(".msg", gift).textContent = DEMO_MSG; });
})();
