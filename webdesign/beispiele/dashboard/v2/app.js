// Luma Drive – Beispiel-Dashboard 2 für eine Autovermietung.
// Alles läuft im Browser: Musterdaten werden jeden Tag passend zum heutigen Datum erzeugt,
// Änderungen (Reservierungen, Übergaben, Online-Anfragen) bleiben im localStorage.
(function () {
  "use strict";
  var KEY = "tk-luma-v1", IMG = "/beispiele/dashboard/v2/bilder/", DAY = 864e5;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var eur = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €"; };
  var km = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " km"; };
  var ico = function (id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };

  var now = new Date();
  var T0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var addD = function (n) { return iso(new Date(T0.getFullYear(), T0.getMonth(), T0.getDate() + n)); };
  var parse = function (s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); };
  var dt = function (d, t) { var x = parse(d), p = (t || "00:00").split(":"); x.setHours(+p[0], +p[1]); return x; };
  var dayIdx = function (s) { return Math.round((parse(s) - T0) / DAY); };
  var TODAY = iso(T0);
  var WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var fd = function (s) { var d = parse(s); return WT[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "."; };
  var rel = function (s) { var i = dayIdx(s); return i === 0 ? "heute" : i === 1 ? "morgen" : i === -1 ? "gestern" : fd(s); };

  // ---------- Stammdaten ----------
  var CARS = [
    { id: "swift", n: "Suzuki Swift", kl: "Kleinwagen", si: 5, ge: "Schaltung", an: "Benzin", p: 39, km: 41280, lv: 80, kz: "AM-217 LD", sv: 5200, pi: "05/2027", kau: 300 },
    { id: "focus", n: "Ford Focus", kl: "Kompaktklasse", si: 5, ge: "Automatik", an: "Diesel", p: 49, km: 63410, lv: 65, kz: "AM-408 LD", sv: 1800, pi: "11/2026", kau: 400 },
    { id: "tipo", n: "Fiat Tipo", kl: "Limousine", si: 5, ge: "Schaltung", an: "Benzin", p: 45, km: 28950, lv: 90, kz: "AM-552 LD", sv: 9100, pi: "08/2027", kau: 400 },
    { id: "model3", n: "Tesla Model 3", kl: "Elektro", si: 5, ge: "Automatik", an: "Elektro", p: 79, km: 35870, lv: 82, kz: "AM-E71 LD", sv: 12400, pi: "03/2027", kau: 600 },
    { id: "ipace", n: "Jaguar I-Pace", kl: "Elektro-SUV", si: 5, ge: "Automatik", an: "Elektro", p: 109, km: 22140, lv: 58, kz: "AM-E94 LD", sv: 2600, pi: "06/2027", kau: 800 },
    { id: "cherokee", n: "Jeep Grand Cherokee", kl: "SUV 4x4", si: 5, ge: "Automatik", an: "Diesel", p: 99, km: 51730, lv: 70, kz: "AM-631 LD", sv: 7400, pi: "01/2027", kau: 800 },
    { id: "rangerover", n: "Range Rover", kl: "Premium-SUV", si: 5, ge: "Automatik", an: "Diesel", p: 149, km: 88320, lv: 55, kz: "AM-1 LD", sv: 900, pi: "12/2026", kau: 1500 },
    { id: "van", n: "Chrysler Pacifica", kl: "Familien-Van", si: 7, ge: "Automatik", an: "Hybrid", p: 89, km: 47600, lv: 95, kz: "AM-707 LD", sv: 6300, pi: "09/2027", kau: 600 },
    { id: "vklasse", n: "Mercedes V-Klasse", kl: "Kleinbus", si: 8, ge: "Automatik", an: "Diesel", p: 129, km: 72480, lv: 40, kz: "AM-808 LD", sv: 3900, pi: "04/2027", kau: 1000 }
  ];
  var EXTRAS = [
    { id: "vk", n: "Vollkasko ohne Selbstbehalt", d: "Statt 1.000 € Selbstbehalt im Schadenfall", p: 19, tag: true },
    { id: "km", n: "Unbegrenzte Kilometer", d: "Sonst 250 km pro Tag inklusive", p: 12, tag: true },
    { id: "zf", n: "Zusatzfahrer", d: "Eine zweite Person darf fahren", p: 8, tag: true },
    { id: "ks", n: "Kindersitz", d: "Für 9 bis 36 kg, höchstens 42 € pro Miete", p: 6, tag: true, max: 42 },
    { id: "sk", n: "Schneeketten", d: "Für Fahrten in die Berge", p: 25 },
    { id: "al", n: "Auslandsfahrt", d: "Deutschland, Italien, Tschechien, Ungarn und mehr", p: 29 }
  ];
  var ORTE = [{ id: "st", n: "Station Musterort", p: 0 }, { id: "bf", n: "Bahnhof Musterort", p: 15 }, { id: "li", n: "Lieferung nach Hause", p: 39 }];
  var KUNDEN = [
    { n: "Familie Huber", ort: "Musterort", tel: "+43 664 123 45 67", seit: 2019, f: 6, u: 3240, s: 5 },
    { n: "Hofer Bau GmbH", ort: "Musterdorf", tel: "+43 7472 555 10", seit: 2021, f: 14, u: 9870, s: 5 },
    { n: "Elif Yilmaz", ort: "Musterort", tel: "+43 676 222 31 08", seit: 2024, f: 2, u: 410, s: 5 },
    { n: "Markus Leitner", ort: "Neustadt", tel: "+43 660 908 77 12", seit: 2022, f: 4, u: 1290, s: 4 },
    { n: "Sandra Pichler", ort: "Musterort", tel: "+43 699 145 26 30", seit: 2025, f: 1, u: 180, s: 5 },
    { n: "Christina Fuchs", ort: "Waldhausen", tel: "+43 664 381 90 44", seit: 2023, f: 3, u: 1460, s: 5 },
    { n: "Julia Wagner", ort: "Neustadt", tel: "+43 676 552 10 87", seit: 2020, f: 7, u: 2380, s: 5 },
    { n: "Stefan Brandstetter", ort: "Musterdorf", tel: "+43 650 771 23 11", seit: 2024, f: 2, u: 760, s: 4 },
    { n: "Thomas Gruber", ort: "Bergheim", tel: "+43 664 909 34 56", seit: 2018, f: 11, u: 5120, s: 5 },
    { n: "Lukas Eder", ort: "Musterort", tel: "+43 681 103 47 20", seit: 2025, f: 0, u: 0, s: 0 },
    { n: "Mehmet Aydın", ort: "Neustadt", tel: "+43 670 404 18 90", seit: 2023, f: 3, u: 980, s: 5 },
    { n: "Musikverein Musterort", ort: "Musterort", tel: "+43 7472 600 20", seit: 2017, f: 9, u: 4310, s: 5 },
    { n: "Berger & Lang", ort: "Waldhausen", tel: "+43 664 777 12 12", seit: 2026, f: 0, u: 0, s: 0 },
    { n: "Peter Haas", ort: "Bergheim", tel: "+43 676 330 55 41", seit: 2026, f: 0, u: 0, s: 0 },
    { n: "FC Musterort", ort: "Musterort", tel: "+43 7472 610 80", seit: 2022, f: 5, u: 1890, s: 4 }
  ];
  var carById = function (id) { for (var i = 0; i < S.cars.length; i++) if (S.cars[i].id === id) return S.cars[i]; return null; };
  var isEV = function (c) { return c.an === "Elektro"; };

  // ---------- Preis ----------
  function tage(o) { return Math.max(1, Math.ceil((dt(o.bis, o.bisZ) - dt(o.von, o.vonZ)) / DAY - 0.04)); }
  function calc(o) {
    var c = carById(o.car), n = tage(o), r = { tage: n, pos: [], sum: 0, kau: c ? c.kau : 0 };
    if (!c) return r;
    var basis = c.p * n;
    r.pos.push([n + (n === 1 ? " Tag" : " Tage") + " × " + c.p + " €", basis]);
    if (n >= 7) r.pos.push(["Wochenrabatt 15 %", -Math.round(basis * 0.15)]);
    (o.ex || []).forEach(function (id) {
      var e = EXTRAS.filter(function (x) { return x.id === id; })[0]; if (!e) return;
      var b = e.tag ? e.p * n : e.p; if (e.max) b = Math.min(b, e.max);
      r.pos.push([e.n.replace(" ohne Selbstbehalt", ""), b]);
    });
    var ort = ORTE.filter(function (x) { return x.id === o.ort; })[0];
    if (ort && ort.p) r.pos.push([ort.n, ort.p]);
    if (o.jung) r.pos.push(["Jungfahrer-Zuschlag", 12 * n]);
    r.pos.forEach(function (p) { r.sum += p[1]; });
    return r;
  }

  // ---------- Musterdaten ----------
  function seed() {
    var R = [], seq = 2610;
    var r = function (car, k, vo, vz, bo, bz, st, ex, ort) {
      var o = { id: "LD-" + (++seq), car: car, kunde: k, von: addD(vo), vonZ: vz, bis: addD(bo), bisZ: bz, st: st, ex: ex || [], ort: ort || "st" };
      if (st !== "block") o.preis = calc(o).sum;
      if (st === "laufend" || st === "zurueck") { var c = carById(car); o.kmStart = c.km - 90 * Math.max(1, -vo); o.lvStart = Math.min(100, c.lv + 15); }
      R.push(o); return o;
    };
    S = { day: TODAY, cars: JSON.parse(JSON.stringify(CARS)), res: R, kunden: JSON.parse(JSON.stringify(KUNDEN)), dmg: {}, prot: {}, seq: 0 };
    S.cars.forEach(function (c) { c.st = "ok"; });
    r("swift", "Elif Yilmaz", -3, "08:00", 0, "17:00", "laufend", ["vk"]);
    r("swift", "Lukas Eder", 1, "09:00", 4, "18:00", "fix", ["zf"]);
    r("focus", "Hofer Bau GmbH", -6, "07:00", 8, "17:00", "laufend", ["km"]);
    r("tipo", "Sandra Pichler", 0, "10:30", 3, "10:00", "fix", []);
    r("tipo", "Peter Haas", 5, "09:00", 7, "18:00", "anfrage", ["vk"]);
    r("model3", "Markus Leitner", -2, "09:00", 1, "11:00", "laufend", ["km"]);
    r("model3", "Julia Wagner", 2, "08:00", 6, "19:00", "fix", ["vk", "al"], "bf");
    var b = r("ipace", "Werkstatt: Winterreifen und Service", -1, "08:00", 1, "12:00", "block"); b.notiz = "Reifenwechsel auf Winterreifen, kleines Service";
    r("ipace", "Stefan Brandstetter", 3, "10:00", 5, "16:00", "fix", ["vk"]);
    r("cherokee", "Christina Fuchs", 0, "14:00", 2, "12:00", "fix", ["sk"]);
    r("cherokee", "Thomas Gruber", 7, "08:00", 11, "18:00", "fix", ["al", "zf"], "li");
    r("rangerover", "Mehmet Aydın", -4, "10:00", -1, "10:00", "zurueck", ["vk"]);
    r("rangerover", "Berger & Lang", 4, "11:00", 5, "12:00", "fix", ["vk"], "li");
    r("van", "Familie Huber", 0, "09:30", 7, "09:00", "fix", ["ks", "al", "km"]);
    r("vklasse", "Musikverein Musterort", -1, "07:00", 0, "12:00", "laufend", []);
    r("vklasse", "FC Musterort", 9, "06:30", 10, "22:00", "anfrage", []);
    S.seq = seq;
    S.dmg = { focus: [{ x: 120, y: 214, t: "K" }, { x: 430, y: 80, t: "S" }], swift: [{ x: 260, y: 40, t: "D" }], vklasse: [{ x: 70, y: 150, t: "K" }, { x: 330, y: 222, t: "K" }], rangerover: [{ x: 452, y: 168, t: "S" }], cherokee: [{ x: 210, y: 220, t: "K" }] };
  }
  var S;
  try { var st = JSON.parse(localStorage.getItem(KEY)); if (st && st.day === TODAY && st.cars) S = st; } catch (e) {}
  if (!S) seed();
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  save();

  // ---------- Abfragen ----------
  var aktiv = function (r) { return r.st === "fix" || r.st === "laufend" || r.st === "anfrage" || r.st === "block"; };
  function overlap(aV, aB, bV, bB) { return aV < bB && bV < aB; }
  function frei(carId, von, bis, ohne) {
    return !S.res.some(function (r) { return r.car === carId && r.id !== ohne && aktiv(r) && overlap(dt(r.von, r.vonZ), dt(r.bis, r.bisZ), von, bis); });
  }
  function belegtJetzt(carId) {
    var t = new Date();
    return S.res.filter(function (r) { return r.car === carId && (r.st === "laufend" || r.st === "block") && dt(r.von, r.vonZ) <= t && dt(r.bis, r.bisZ) > t; })[0]
      || S.res.filter(function (r) { return r.car === carId && r.st === "laufend"; })[0];
  }
  function naechste(carId) {
    var t = new Date();
    return S.res.filter(function (r) { return r.car === carId && (r.st === "fix" || r.st === "anfrage") && dt(r.von, r.vonZ) >= new Date(t - 3 * 36e5); })
      .sort(function (a, b) { return dt(a.von, a.vonZ) - dt(b.von, b.vonZ); })[0];
  }
  function carStatus(c) {
    var b = belegtJetzt(c.id);
    if (b && b.st === "block") return { k: "block", t: "In der Werkstatt", s: "bis " + rel(b.bis) + " " + b.bisZ };
    if (b) return { k: "lauf", t: "Unterwegs", s: "zurück " + rel(b.bis) + " " + b.bisZ };
    if (c.st === "reinigung") return { k: "anf", t: "Reinigung", s: "danach frei" };
    var n = naechste(c.id);
    return { k: "fix", t: "Frei", s: n ? "nächste Miete " + rel(n.von) + " " + n.vonZ : "keine Reservierung" };
  }
  var anfragen = function () { return S.res.filter(function (r) { return r.st === "anfrage"; }).sort(function (a, b) { return a.von < b.von ? -1 : 1; }); };
  var stTxt = { fix: "Bestätigt", laufend: "Unterwegs", anfrage: "Online-Anfrage", block: "Werkstatt", zurueck: "Zurückgegeben", storno: "Storniert" };
  var stCls = { fix: "st-fix", laufend: "st-lauf", anfrage: "st-anf", block: "st-block", zurueck: "st-zur", storno: "st-zur" };
  function heute() {
    var ev = [];
    S.res.forEach(function (r) {
      if (r.st === "block" || r.st === "storno" || r.st === "anfrage") return;
      if (r.von === TODAY) ev.push({ r: r, k: "ab", z: r.vonZ, done: r.st !== "fix" });
      if (r.bis === TODAY) ev.push({ r: r, k: "ru", z: r.bisZ, done: r.st === "zurueck" });
    });
    return ev.sort(function (a, b) { return a.z < b.z ? -1 : 1; });
  }

  // ---------- Ansicht wechseln ----------
  var VIEWS = ["start", "plan", "flotte", "uebergabe", "kunden", "buchung"];
  var cur = "";
  function show(v, noScroll) {
    if (VIEWS.indexOf(v) < 0) v = "start";
    VIEWS.forEach(function (x) { $("#v-" + x).hidden = x !== v; });
    $$(".rb[data-go]").forEach(function (b) { if (b.getAttribute("data-go") === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (cur !== v) { cur = v; render(v); if (!noScroll) window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" }); }
    if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
  }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (g) { e.preventDefault(); closeKi(); show(g.getAttribute("data-go")); return; }
    if (e.target.closest("[data-neu]")) { openWiz({}); return; }
    if (e.target.closest("[data-ki]")) { toggleKi(); return; }
    var lg = e.target.closest(".rail__logo"); if (lg) { e.preventDefault(); show("start"); }
  });
  addEventListener("hashchange", function () { show(location.hash.slice(1)); });

  function render(v) {
    v = v || cur;
    renderBell();
    if (v === "start") renderStart();
    else if (v === "plan") renderPlan();
    else if (v === "flotte") renderFleet();
    else if (v === "uebergabe") renderUeb();
    else if (v === "kunden") renderKunden();
    else if (v === "buchung") renderWid();
  }

  // ---------- Kopf ----------
  function tickClock() {
    var d = new Date(), h = d.getHours();
    $("#uhr span").textContent = pad(h) + ":" + pad(d.getMinutes());
    $("#gruss").textContent = h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend";
  }
  tickClock(); setInterval(tickClock, 20000);

  function renderBell() {
    var a = anfragen(), n = $("#bellN");
    n.hidden = !a.length; n.textContent = a.length;
    var html = "<h3>Online-Anfragen von der Webseite</h3>";
    if (!a.length) html += '<p class="leer">Keine offenen Anfragen.</p>';
    a.forEach(function (r) { var c = carById(r.car); html += '<button type="button" class="bi" data-res="' + r.id + '"><i class="dot st-anf"></i><span><b>' + esc(r.kunde) + "</b><small>" + esc(c.n) + " · " + fd(r.von) + " bis " + fd(r.bis) + "</small></span></button>"; });
    $("#bellPop").innerHTML = html;
  }
  $("#bellBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    var p = $("#bellPop"), o = p.hidden; p.hidden = !o; this.setAttribute("aria-expanded", String(o));
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".bell")) { $("#bellPop").hidden = true; $("#bellBtn").setAttribute("aria-expanded", "false"); }
    var r = e.target.closest("[data-res]"); if (r) { $("#bellPop").hidden = true; openRes(r.getAttribute("data-res")); }
  });

  // ---------- Start ----------
  function renderStart() {
    var cars = S.cars, t = new Date();
    var unterwegs = cars.filter(function (c) { var b = belegtJetzt(c.id); return b && b.st === "laufend"; }).length;
    var vermietet = cars.filter(function (c) { return S.res.some(function (r) { return r.car === c.id && (r.st === "fix" || r.st === "laufend" || r.st === "zurueck") && r.von <= TODAY && r.bis >= TODAY; }); }).length;
    var ausl = Math.round(vermietet / cars.length * 100);
    $("#heroUnterwegs").textContent = unterwegs; $("#heroAlle").textContent = cars.length;
    // Ring
    requestAnimationFrame(function () {
      $("#ringP").style.strokeDasharray = ausl + " 100";
      var a = (ausl / 100 * 360 - 90) * Math.PI / 180;
      $("#ring").style.setProperty("--gx", (50 + 39 * Math.cos(a)) + "%");
      $("#ring").style.setProperty("--gy", (50 + 39 * Math.sin(a)) + "%");
    });
    countUp($("#ringV"), ausl, "");
    // Nächste Abholung
    var nx = S.res.filter(function (r) { return r.st === "fix" && dt(r.von, r.vonZ) > new Date(t - 2 * 36e5); }).sort(function (a, b) { return dt(a.von, a.vonZ) - dt(b.von, b.vonZ); })[0];
    var hn = $("#heroNext");
    if (nx) {
      var c = carById(nx.car);
      hn.outerHTML = '<button type="button" class="hero__next glass" id="heroNext" data-res="' + nx.id + '"><span><small>Nächste Abholung · ' + rel(nx.von) + " " + nx.vonZ + "</small><b>" + esc(nx.kunde) + " · " + esc(c.n) + '</b></span><i class="ib">' + ico("pfeil") + "</i></button>";
    } else hn.innerHTML = "<span><small>Nächste Abholung</small><b>Keine offen</b></span>";
    // Kacheln
    var ev = heute(), ab = ev.filter(function (x) { return x.k === "ab"; }), ru = ev.filter(function (x) { return x.k === "ru"; });
    countUp($("#tAb"), ab.length, ""); countUp($("#tRu"), ru.length, "");
    $("#tAbS").innerHTML = "<span class=\"tile__d\">" + ab.filter(function (x) { return x.done; }).length + " erledigt</span><em>" + (ab.filter(function (x) { return !x.done; })[0] ? "nächste " + ab.filter(function (x) { return !x.done; })[0].z : "alle erledigt") + "</em>";
    $("#tRuS").innerHTML = "<span class=\"tile__d\">" + ru.filter(function (x) { return x.done; }).length + " erledigt</span><em>" + (ru.filter(function (x) { return !x.done; })[0] ? "nächste " + ru.filter(function (x) { return !x.done; })[0].z : "alle erledigt") + "</em>";
    var mon = T0.getMonth(), um = T0.getDate() * 410;
    S.res.forEach(function (r) { if (r.preis && r.st !== "anfrage" && r.st !== "storno" && parse(r.von).getMonth() === mon) um += r.preis; });
    $("#tMonat").textContent = MON[mon];
    countUp($("#tUm"), um, " €", true);
    var ziel = 24000;
    $("#tUmS").innerHTML = "<span>Ziel " + eur(ziel) + "</span><em>" + Math.round(um / ziel * 100) + " %</em>";
    requestAnimationFrame(function () { $("#umArc").style.strokeDasharray = Math.min(100, um / ziel * 100) + " 100"; });
    var evs = S.cars.filter(isEV), ak = Math.round(evs.reduce(function (s, c) { return s + c.lv; }, 0) / evs.length);
    countUp($("#tAk"), ak, " %");
    requestAnimationFrame(function () { $("#akBar").style.width = ak + "%"; $("#akKnob").style.left = ak + "%"; });
    // Heute
    $("#heuteDatum").textContent = WT[T0.getDay()] + ", " + T0.getDate() + ". " + MON[mon];
    var hl = ev.map(function (x) {
      var c = carById(x.r.car), ab = x.k === "ab";
      var act = x.done ? '<span class="tl__ok">' + ico("haken") + "erledigt</span>"
        : '<button type="button" class="btn ' + (ab ? "btn--lime" : "btn--line") + '" data-ueb="' + x.r.id + '">' + (ab ? "Übergabe" : "Rücknahme") + "</button>";
      return '<li class="' + (ab ? "st-fix" : "st-anf") + (x.done ? " is-done" : "") + '"><span class="tl__t">' + x.z + "<small>" + ico(ab ? "ab" : "auf") + (ab ? "Abholung" : "Rückgabe") + '</small></span><span class="tl__m"><img src="' + IMG + c.id + '.webp" alt="" width="58" height="40" loading="lazy"><span><b>' + esc(x.r.kunde) + "</b><small>" + esc(c.n) + " · " + c.kz + "</small></span></span>" + act + "</li>";
    }).join("");
    $("#heuteListe").innerHTML = hl || '<li class="leer">Heute keine Abholungen oder Rückgaben.</li>';
    // Anfragen
    var a = anfragen();
    $("#anfListe").innerHTML = a.length ? a.map(function (r) {
      var c = carById(r.car);
      return '<li><i class="dot st-anf"></i><span><b>' + esc(r.kunde) + "</b><small>" + esc(c.n) + " · " + fd(r.von) + "–" + fd(r.bis) + " · " + eur(r.preis) + '</small></span><button type="button" class="ib" data-res="' + r.id + '" aria-label="Anfrage ansehen">' + ico("pfeil") + '</button><button type="button" class="ib ib--ok" data-ok="' + r.id + '" aria-label="Anfrage bestätigen">' + ico("haken") + "</button></li>";
    }).join("") : '<li class="leer" style="background:none;border:0;padding:4px 2px">Alles beantwortet. Neue Anfragen kommen über die Online-Buchung.</li>';
    // Flotte jetzt
    var m = { fix: 0, lauf: 0, block: 0, anf: 0 };
    S.cars.forEach(function (c) { m[carStatus(c).k]++; });
    $("#flotteMix").innerHTML = '<div class="st-fix"><b>' + m.fix + '</b><span><i class="dot"></i>Frei</span></div><div class="st-lauf"><b>' + m.lauf + '</b><span><i class="dot"></i>Unterwegs</span></div><div class="st-block"><b>' + m.block + '</b><span><i class="dot"></i>Werkstatt</span></div><div class="st-anf"><b>' + m.anf + '</b><span><i class="dot"></i>Reinigung</span></div>' +
      '<div class="mixbar"><i class="st-fix" style="flex-grow:' + m.fix + '"></i><i class="st-lauf" style="flex-grow:' + m.lauf + '"></i><i class="st-block" style="flex-grow:' + m.block + '"></i><i class="st-anf" style="flex-grow:' + m.anf + '"></i></div>';
  }
  function countUp(el, to, suf, big) {
    var from = +(el.getAttribute("data-v") || 0); el.setAttribute("data-v", to);
    var f = function (v) { return (big ? String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : Math.round(v)) + suf; };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) { el.textContent = f(to); return; }
    var t0 = performance.now(), d = 1100;
    (function step(t) { var k = Math.min(1, (t - t0) / d); k = 1 - Math.pow(1 - k, 3); el.textContent = f(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  document.addEventListener("click", function (e) {
    var u = e.target.closest("[data-ueb]"); if (u) { S.uebId = u.getAttribute("data-ueb"); uebReset(); closeDlg(); show("uebergabe"); render("uebergabe"); return; }
    var ok = e.target.closest("[data-ok]"); if (ok) bestaetigen(ok.getAttribute("data-ok"));
  });
  function bestaetigen(id) {
    var r = S.res.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    r.st = "fix"; save(); toast("Bestätigt. Die Mail an " + r.kunde + " ist unterwegs."); closeDlg(); render();
  }

  // ---------- Belegungsplan ----------
  var planOff = 0, neuId = "";
  function kd(ds) { var d = parse(ds); return d.getDate() + "." + (d.getMonth() + 1) + "."; }
  function renderPlan() {
    var start = -1 + planOff * 7, cars = S.cars, h = '<div class="g" style="height:' + (54 + cars.length * 62) + 'px"><div class="g__corner">Fahrzeug</div>';
    for (var i = 0; i < 14; i++) {
      var d = parse(addD(start + i)), we = d.getDay() === 0 || d.getDay() === 6, hi = start + i === 0;
      h += '<div class="g__hd' + (we ? " is-we" : "") + (hi ? " is-heute" : "") + '">' + WT[d.getDay()] + "<b>" + d.getDate() + "." + (d.getMonth() + 1) + ".</b></div>";
    }
    cars.forEach(function (c) {
      h += '<div class="g__car"><img src="' + IMG + c.id + '.webp" alt="" width="52" height="34" loading="lazy"><span><b>' + esc(c.n) + "</b><small>" + c.kl + " · " + c.p + " €</small></span></div>";
      for (var i = 0; i < 14; i++) {
        var ds = addD(start + i), d = parse(ds), we = d.getDay() === 0 || d.getDay() === 6;
        h += '<button type="button" class="g__c' + (we ? " is-we" : "") + '" data-cell="' + c.id + "|" + ds + '" aria-label="' + esc(c.n) + ", " + fd(ds) + ': neue Reservierung"></button>';
      }
    });
    // Balken
    var t0 = parse(addD(start)), t1 = parse(addD(start + 14));
    cars.forEach(function (c, row) {
      S.res.forEach(function (r) {
        if (r.car !== c.id || r.st === "storno") return;
        var a = dt(r.von, r.vonZ), b = dt(r.bis, r.bisZ);
        if (b <= t0 || a >= t1) return;
        var x0 = Math.max(0, (a - t0) / DAY), x1 = Math.min(14, (b - t0) / DAY), w = x1 - x0;
        if (w < 0.5) return;
        h += '<button type="button" class="bar ' + stCls[r.st] + (r.id === neuId ? " is-neu" : "") + '" data-res="' + r.id + '" style="left:calc(var(--fc) + var(--cw) * ' + x0.toFixed(3) + ' + 3px);width:calc(var(--cw) * ' + w.toFixed(3) + ' - 6px);top:' + (54 + row * 62) + 'px;animation-delay:' + (row * 40) + 'ms" title="' + esc(r.kunde) + '">' + (w > 0.7 ? "<b>" + esc(r.kunde) + "</b>" + (w > 2.6 ? "<small>" + kd(r.von) + " – " + kd(r.bis) + "</small>" : "") : "") + "</button>";
      });
    });
    if (planOff === 0) { var n = new Date(); h += '<span class="g__now" style="left:calc(var(--fc) + var(--cw) * ' + (1 + (n.getHours() + n.getMinutes() / 60) / 24).toFixed(3) + ')"></span>'; }
    h += "</div>";
    var g = $("#gantt"); g.innerHTML = h; planFit();
    neuId = "";
  }
  // Spalten füllen die ganze Breite, am Handy wird waagrecht gewischt
  function planFit() {
    var g = $("#gantt"), wide = innerWidth >= 760, fc = wide ? 200 : 150, base = wide ? 60 : 46;
    g.style.setProperty("--cw", Math.max(base, (g.clientWidth - fc - 2) / 14) + "px");
  }
  addEventListener("resize", function () { if (cur === "plan") planFit(); });
  $$("[data-woche]").forEach(function (b) { b.addEventListener("click", function () { var w = +b.getAttribute("data-woche"); planOff = w === 0 ? 0 : planOff + w; renderPlan(); }); });
  $("#gantt").addEventListener("click", function (e) {
    var c = e.target.closest("[data-cell]"); if (!c) return;
    var p = c.getAttribute("data-cell").split("|");
    openWiz({ car: p[0], von: p[1] });
  });

  // ---------- Reservierung ansehen ----------
  function openRes(id) {
    var r = S.res.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    var c = carById(r.car), k = calc(r), act = "";
    if (r.st === "anfrage") act = '<button type="button" class="btn btn--lime" data-ok="' + r.id + '">' + ico("haken") + 'Bestätigen</button><button type="button" class="btn btn--red" data-storno="' + r.id + '">Ablehnen</button>';
    else if (r.st === "fix") act = '<button type="button" class="btn btn--lime" data-ueb="' + r.id + '">' + ico("schluessel") + 'Übergabe starten</button><button type="button" class="btn btn--line" data-mail="' + r.id + '">' + ico("mail") + 'Erinnerung senden</button><button type="button" class="btn btn--red" data-storno="' + r.id + '">Stornieren</button>';
    else if (r.st === "laufend") act = '<button type="button" class="btn btn--lime" data-ueb="' + r.id + '">' + ico("schluessel") + 'Rückgabe starten</button><button type="button" class="btn btn--line" data-verl="' + r.id + '">' + ico("plus") + "Einen Tag verlängern</button>";
    else if (r.st === "block") act = '<button type="button" class="btn btn--lime" data-storno="' + r.id + '">' + ico("haken") + "Fertig, Auto freigeben</button>";
    else if (r.st === "zurueck" && S.prot[r.id]) act = '<button type="button" class="btn btn--line" data-prot="' + r.id + '">' + ico("dokument") + "Protokoll ansehen</button>";
    var exT = (r.ex || []).map(function (id) { var e = EXTRAS.filter(function (x) { return x.id === id; })[0]; return e ? e.n.replace(" ohne Selbstbehalt", "") : ""; }).join(", ") || "keine";
    var ort = ORTE.filter(function (x) { return x.id === r.ort; })[0];
    var ku = S.kunden.filter(function (x) { return x.n === r.kunde; })[0];
    $("#resIn").innerHTML = '<div class="dlg__head"><div><p class="kick">' + r.id + '</p><h2 id="resH">' + esc(r.kunde) + '</h2></div><button type="button" class="ib glass" data-close aria-label="Schließen">' + ico("x") + "</button></div>" +
      '<img class="rd__img" src="' + IMG + c.id + '.webp" alt="" width="640" height="400">' +
      '<span class="rd__st ' + stCls[r.st] + '"><i class="dot"></i>' + stTxt[r.st] + "</span>" +
      '<dl class="rd__dl"><div><dt>Fahrzeug</dt><dd>' + esc(c.n) + "</dd></div><div><dt>Kennzeichen</dt><dd>" + c.kz + "</dd></div>" +
      "<div><dt>Abholung</dt><dd>" + fd(r.von) + " · " + r.vonZ + "</dd></div><div><dt>Rückgabe</dt><dd>" + fd(r.bis) + " · " + r.bisZ + "</dd></div>" +
      (r.st === "block" ? '<div class="w2"><dt>Notiz</dt><dd>' + esc(r.notiz || "Werkstatt") + "</dd></div>" :
        '<div><dt>Abholort</dt><dd>' + (ort ? ort.n : "Station") + "</dd></div><div><dt>Telefon</dt><dd>" + esc(r.tel || (ku && ku.tel) || "–") + '</dd></div><div class="w2"><dt>Extras</dt><dd>' + esc(exT) + "</dd></div>" +
        "<div><dt>Preis (" + k.tage + (k.tage === 1 ? " Tag" : " Tage") + ")</dt><dd>" + eur(r.preis || k.sum) + "</dd></div><div><dt>Kaution</dt><dd>" + eur(c.kau) + "</dd></div>") +
      '</dl><div class="rd__act">' + act + "</div>";
    openDlg($("#resDlg"));
  }
  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-storno]");
    if (s) {
      var r = S.res.filter(function (x) { return x.id === s.getAttribute("data-storno"); })[0];
      if (r) { var bl = r.st === "block"; r.st = "storno"; save(); closeDlg(); toast(bl ? "Auto ist wieder frei." : "Storniert. Der Kunde bekommt eine Mail."); render(); }
      return;
    }
    var m = e.target.closest("[data-mail]"); if (m) { toast("Erinnerung mit Abholzeit und Adresse gesendet."); return; }
    var v = e.target.closest("[data-verl]");
    if (v) {
      var rr = S.res.filter(function (x) { return x.id === v.getAttribute("data-verl"); })[0]; if (!rr) return;
      var nb = iso(new Date(parse(rr.bis).getTime() + DAY + 36e5));
      if (!frei(rr.car, dt(rr.bis, rr.bisZ), dt(nb, rr.bisZ), rr.id)) { toast("Geht nicht: Das Auto ist danach schon reserviert."); return; }
      rr.bis = nb; rr.preis = calc(rr).sum; save(); closeDlg(); toast("Verlängert bis " + fd(nb) + ". Neuer Preis " + eur(rr.preis) + "."); render(); return;
    }
    var p = e.target.closest("[data-prot]"); if (p) { closeDlg(); showProt(p.getAttribute("data-prot")); }
  });

  // ---------- Dialoge ----------
  function openDlg(d) { if (d.open) return; d.showModal(); document.documentElement.classList.add("dlg-open"); }
  function closeDlg() { $$("dialog[open]").forEach(function (d) { d.close(); }); }
  $$("dialog").forEach(function (d) {
    d.addEventListener("close", function () { if (!$("dialog[open]")) document.documentElement.classList.remove("dlg-open"); });
    d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  });

  // ---------- Neue Reservierung ----------
  var W = {};
  var ZEITEN = []; for (var zh = 7; zh <= 19; zh++) { ZEITEN.push(pad(zh) + ":00"); if (zh < 19) ZEITEN.push(pad(zh) + ":30"); }
  var zOpts = ZEITEN.map(function (z) { return "<option>" + z + "</option>"; }).join("");
  $("#wVonZ").innerHTML = zOpts; $("#wBisZ").innerHTML = zOpts;
  $("#wOrt").innerHTML = ORTE.map(function (o) { return '<button type="button" class="pill" role="radio" data-ort="' + o.id + '" aria-checked="false">' + ico("ort") + o.n + (o.p ? " · " + o.p + " €" : "") + "</button>"; }).join("");
  $("#wExt").innerHTML = EXTRAS.map(function (e) { return '<label><input type="checkbox" value="' + e.id + '"><span class="bx">' + ico("haken") + '</span><span class="t"><b>' + e.n + "</b><small>" + e.d + "</small></span><em>" + e.p + " €" + (e.tag ? " / Tag" : "") + "</em></label>"; }).join("");
  $("#kuList").innerHTML = KUNDEN.map(function (k) { return '<option value="' + esc(k.n) + '">'; }).join("");

  function openWiz(o) {
    var von = o.von && o.von >= TODAY ? o.von : addD(o.car ? 1 : 8);
    W = { step: 0, von: von, vonZ: "09:00", bis: iso(new Date(parse(von).getTime() + 3 * DAY + 36e5)), bisZ: "09:00", ort: "st", car: o.car || "", ex: [], name: "", tel: "", geb: "", fs: "" };
    $("#wVon").value = W.von; $("#wVon").min = TODAY; $("#wBis").value = W.bis; $("#wBis").min = TODAY;
    $("#wVonZ").value = W.vonZ; $("#wBisZ").value = W.bisZ;
    $$("#wExt input").forEach(function (i) { i.checked = false; });
    ["wName", "wTel", "wGeb", "wFs"].forEach(function (id) { $("#" + id).value = ""; });
    closeDlg(); closeKi();
    wizStep(0); openDlg($("#wiz"));
  }
  function wizRead() {
    W.von = $("#wVon").value; W.bis = $("#wBis").value; W.vonZ = $("#wVonZ").value; W.bisZ = $("#wBisZ").value;
    W.ex = $$("#wExt input:checked").map(function (i) { return i.value; });
    W.name = $("#wName").value.trim(); W.tel = $("#wTel").value.trim(); W.geb = +$("#wGeb").value || 0; W.fs = +$("#wFs").value || 0;
    var y = T0.getFullYear();
    W.jung = !!((W.geb && y - W.geb < 25) || (W.fs && y - W.fs < 3));
  }
  function wizOkZeit() { return W.von && W.bis && dt(W.bis, W.bisZ) > dt(W.von, W.vonZ); }
  function wizStep(n) {
    wizRead(); W.step = n;
    $$(".wstep").forEach(function (f) { f.hidden = +f.getAttribute("data-step") !== n; });
    $$("#wizSteps li").forEach(function (l, i) { l.className = i === n ? "is-on" : i < n ? "is-done" : ""; });
    $("#wBack").textContent = n === 0 ? "Abbrechen" : "Zurück";
    $("#wNext").innerHTML = n === 3 ? ico("haken") + "Reservierung anlegen" : "Weiter";
    if (n === 1) wizCars();
    wizUpd();
    var f = $('.wstep[data-step="' + n + '"]'); if (f && n > 0) { var fi = f.querySelector("button:not(:disabled),input"); if (fi && matchMedia("(pointer:fine)").matches) fi.focus({ preventScroll: true }); }
  }
  function wizCars() {
    var a = dt(W.von, W.vonZ), b = dt(W.bis, W.bisZ), n = tage(W);
    if (W.car && !frei(W.car, a, b)) W.car = "";
    $("#wCars").innerHTML = S.cars.map(function (c) {
      var ok = frei(c.id, a, b);
      return '<button type="button" class="wcar" data-car="' + c.id + '"' + (ok ? "" : " disabled") + ' aria-pressed="' + (W.car === c.id) + '"><img src="' + IMG + c.id + '.webp" alt="" width="640" height="400" loading="lazy"><span class="wcar__t"><span class="wcar__r"><b>' + esc(c.n) + "</b><em>" + (ok ? eur(c.p * n) : "belegt") + "</em></span><small>" + c.kl + " · " + c.si + " Sitze · " + c.ge + " · " + c.an + "</small></span></button>";
    }).join("");
  }
  function wizUpd() {
    wizRead();
    $$("#wOrt .pill").forEach(function (p) { p.setAttribute("aria-checked", String(p.getAttribute("data-ort") === W.ort)); });
    var ok = wizOkZeit();
    $("#wTage").className = "wiz__note" + (ok ? "" : " warn");
    $("#wTage").innerHTML = ok ? "Mietdauer: <b>" + tage(W) + (tage(W) === 1 ? " Tag" : " Tage") + "</b>" + (tage(W) >= 7 ? ", mit 15 % Wochenrabatt" : ". Ab 7 Tagen gibt es 15 % Wochenrabatt.") : "Die Rückgabe muss nach der Abholung liegen.";
    $("#wJung").className = "wiz__note" + (W.jung ? " warn" : "");
    $("#wJung").textContent = W.jung ? "Unter 25 Jahren oder kürzer als 3 Jahre Führerschein: Jungfahrer-Zuschlag 12 € pro Tag." : "Führerschein und Ausweis werden bei der Abholung kontrolliert.";
    var c = carById(W.car), k = calc(W), h = "";
    if (c) h += '<img src="' + IMG + c.id + '.webp" alt="" width="640" height="400"><h3>' + esc(c.n) + "</h3>";
    else h += "<h3>Ihre Reservierung</h3>";
    h += '<div class="ws"><span>Abholung</span><span>' + (W.von ? fd(W.von) + " " + W.vonZ : "–") + '</span></div><div class="ws"><span>Rückgabe</span><span>' + (W.bis ? fd(W.bis) + " " + W.bisZ : "–") + "</span></div>";
    if (c) {
      k.pos.forEach(function (p) { h += '<div class="ws"><span>' + esc(p[0]) + "</span><span>" + (p[1] < 0 ? "− " + eur(-p[1]) : eur(p[1])) + "</span></div>"; });
      h += '<div class="ws tot"><span>Gesamt</span><b>' + eur(k.sum) + '</b></div><div class="ws small"><span>inkl. 20 % USt.</span><span>Kaution ' + eur(c.kau) + "</span></div>";
    } else h += '<p class="wiz__note" style="margin-top:10px">Im nächsten Schritt sehen Sie nur Autos, die im Zeitraum frei sind.</p>';
    $("#wSum").innerHTML = h;
    var nx = $("#wNext");
    nx.disabled = (W.step === 0 && !ok) || (W.step === 1 && !W.car) || (W.step === 3 && !W.name);
  }
  $("#wizForm").addEventListener("input", wizUpd);
  $("#wizForm").addEventListener("change", function (e) { if (e.target.id === "wVon" && $("#wBis").value < e.target.value) $("#wBis").value = e.target.value; wizUpd(); });
  $("#wOrt").addEventListener("click", function (e) { var p = e.target.closest("[data-ort]"); if (p) { W.ort = p.getAttribute("data-ort"); wizUpd(); } });
  $("#wCars").addEventListener("click", function (e) {
    var b = e.target.closest("[data-car]"); if (!b || b.disabled) return;
    W.car = b.getAttribute("data-car");
    $$("#wCars .wcar").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    wizUpd();
  });
  $("#wBack").addEventListener("click", function () { if (W.step === 0) $("#wiz").close(); else wizStep(W.step - 1); });
  $("#wNext").addEventListener("click", function () {
    if (this.disabled) return;
    if (W.step < 3) { wizStep(W.step + 1); return; }
    wizRead();
    if (!frei(W.car, dt(W.von, W.vonZ), dt(W.bis, W.bisZ))) { toast("Das Auto ist inzwischen belegt."); wizStep(1); return; }
    var o = { id: "LD-" + (++S.seq), car: W.car, kunde: W.name, tel: W.tel, von: W.von, vonZ: W.vonZ, bis: W.bis, bisZ: W.bisZ, st: "fix", ex: W.ex, ort: W.ort, jung: W.jung };
    o.preis = calc(o).sum;
    S.res.push(o); kundeMerken(W.name, W.tel); save();
    $("#wiz").close(); neuId = o.id;
    planOff = Math.max(0, Math.floor((dayIdx(o.von) + 1) / 7));
    if (cur === "plan") renderPlan(); else show("plan");
    toast("Reservierung " + o.id + " angelegt, Bestätigung an " + o.kunde + " gesendet.");
  });
  function kundeMerken(n, tel) {
    if (!n || S.kunden.some(function (k) { return k.n.toLowerCase() === n.toLowerCase(); })) return;
    S.kunden.unshift({ n: n, ort: "neu", tel: tel || "", seit: T0.getFullYear(), f: 0, u: 0, s: 0, neu: true });
  }

  // ---------- Flotte ----------
  var flF = "alle";
  var FILTER = [["alle", "Alle"], ["fix", "Frei"], ["lauf", "Unterwegs"], ["block", "Werkstatt"], ["ev", "Elektro"]];
  $("#flFilter").innerHTML = FILTER.map(function (f) { return '<button type="button" class="pill" data-f="' + f[0] + '" aria-pressed="' + (f[0] === flF) + '">' + f[1] + "</button>"; }).join("");
  $("#flFilter").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; flF = b.getAttribute("data-f"); $$("#flFilter .pill").forEach(function (p) { p.setAttribute("aria-pressed", String(p === b)); }); renderFleet(); });
  function renderFleet() {
    var list = S.cars.filter(function (c) { var s = carStatus(c).k; return flF === "alle" || (flF === "ev" ? isEV(c) : s === flF); });
    $("#fleet").innerHTML = list.map(function (c, i) {
      var s = carStatus(c), ev = isEV(c), low = c.lv < 30;
      return '<article class="fc" style="animation-delay:' + i * 50 + 'ms"><div class="fc__img"><img src="' + IMG + c.id + '.webp" alt="' + esc(c.n) + '" width="640" height="400" loading="lazy">' +
        '<span class="fc__st st-' + s.k + '"><i class="dot"></i>' + s.t + '</span><span class="fc__pr">' + c.p + " € <small>/ Tag</small></span></div>" +
        '<div class="fc__b"><h3>' + esc(c.n) + '</h3><p class="fc__kl"><span>' + c.kl + " · " + s.s + '</span><span class="fc__kz">' + c.kz + "</span></p>" +
        '<div class="fc__chips"><span class="chip">' + ico("sitz") + c.si + ' Sitze</span><span class="chip">' + ico("gang") + c.ge + '</span><span class="chip">' + ico(ev ? "blitz" : "tropfen") + c.an + "</span></div>" +
        '<div class="lvl">' + ico(ev ? "blitz" : "tank") + '<span class="lvl__b"><i' + (low ? ' class="is-low"' : "") + ' style="width:' + c.lv + '%"></i></span><span>' + c.lv + " %" + (ev ? " · " + Math.round(c.lv * 4.6) + " km" : "") + "</span></div>" +
        '<dl class="fc__dl"><div><dt>Kilometer</dt><dd>' + km(c.km) + "</dd></div><div><dt>Service in</dt><dd" + (c.sv < 2000 ? ' class="warn"' : "") + ">" + km(c.sv) + "</dd></div><div><dt>Pickerl bis</dt><dd>" + c.pi + "</dd></div></dl>" +
        '<div class="fc__act"><button type="button" class="btn btn--lime" data-wcar="' + c.id + '">Reservieren</button>' +
        (c.st === "reinigung" ? '<button type="button" class="btn btn--line" data-sauber="' + c.id + '">' + ico("haken") + "Gereinigt</button>" : '<button type="button" class="btn btn--line" data-go="plan">Im Plan</button>') + "</div></div></article>";
    }).join("") || '<p class="leer">Gerade kein Auto in diesem Filter.</p>';
  }
  document.addEventListener("click", function (e) {
    var w = e.target.closest("[data-wcar]"); if (w) { openWiz({ car: w.getAttribute("data-wcar") }); return; }
    var s = e.target.closest("[data-sauber]"); if (s) { var c = carById(s.getAttribute("data-sauber")); c.st = "ok"; save(); toast(c.n + " ist sauber und wieder frei."); render(); }
  });

  // ---------- Übergabe ----------
  var TYP = { K: "Kratzer", D: "Delle", S: "Steinschlag" }, dTyp = "K", neuDmg = [], sigDone = false;
  $("#dmgTyp").innerHTML = Object.keys(TYP).map(function (k) { return '<button type="button" class="pill" role="radio" data-t="' + k + '" aria-checked="' + (k === dTyp) + '">' + TYP[k] + "</button>"; }).join("");
  $("#dmgTyp").addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (!b) return; dTyp = b.getAttribute("data-t"); $$("#dmgTyp .pill").forEach(function (p) { p.setAttribute("aria-checked", String(p === b)); }); });
  function uebListe() {
    return S.res.filter(function (r) { return r.st === "fix" || r.st === "laufend"; }).sort(function (a, b) {
      var ta = a.st === "fix" ? dt(a.von, a.vonZ) : dt(a.bis, a.bisZ), tb = b.st === "fix" ? dt(b.von, b.vonZ) : dt(b.bis, b.bisZ); return ta - tb;
    });
  }
  function uebReset() { neuDmg = []; sigDone = false; }
  function renderUeb() {
    var L = uebListe();
    if (!L.some(function (r) { return r.id === S.uebId; })) { var h = heute().filter(function (x) { return !x.done; })[0]; S.uebId = h ? h.r.id : (L[0] && L[0].id); uebReset(); }
    $("#uebSel").innerHTML = L.map(function (r) {
      var ab = r.st === "fix", c = carById(r.car);
      return '<option value="' + r.id + '"' + (r.id === S.uebId ? " selected" : "") + ">" + (ab ? "Abholung " + rel(r.von) + " " + r.vonZ : "Rückgabe " + rel(r.bis) + " " + r.bisZ) + " · " + esc(r.kunde) + " · " + esc(c.n) + "</option>";
    }).join("");
    var r = L.filter(function (x) { return x.id === S.uebId; })[0];
    if (!r) { $("#uebCar").innerHTML = '<p class="leer">Keine offenen Übergaben.</p>'; return; }
    var c = carById(r.car), ab = r.st === "fix", ev = isEV(c);
    $("#uebCar").innerHTML = '<img src="' + IMG + c.id + '.webp" alt="" width="96" height="60"><span><b>' + esc(c.n) + "</b><small>" + c.kz + " · " + c.kl + " · Kaution " + eur(c.kau) + "</small></span>";
    $("#uebKind").className = "ueb__kind" + (ab ? "" : " is-ruck");
    $("#uebKind").innerHTML = ico(ab ? "ab" : "auf") + "<span><b>" + (ab ? "Abholung durch " : "Rückgabe von ") + esc(r.kunde) + "</b><small>" + (ab ? fd(r.von) + " " + r.vonZ + " · zurück " + fd(r.bis) + " " + r.bisZ : "Abgeholt " + fd(r.von) + " mit " + km(r.kmStart || c.km) + " und " + (r.lvStart || c.lv) + " % " + (ev ? "Akku" : "Tank")) + "</small></span>";
    $("#uebKm").value = ab ? c.km : (r.kmStart || c.km) + 140 + Math.round((parse(r.bis) - parse(r.von)) / DAY) * 120;
    $("#uebKm").min = ab ? 0 : (r.kmStart || c.km);
    var lv = ab ? c.lv : Math.max(10, (r.lvStart || c.lv) - 25);
    $("#uebTank").value = lv; $("#uebTankL").textContent = ev ? "Akku" : "Tank";
    var CH = ab ? ["Führerschein und Ausweis kontrolliert", "Kaution von " + eur(c.kau) + " auf der Karte geblockt", "Warnweste, Pannendreieck und Verbandskasten an Bord", ev ? "Ladekabel Typ 2 im Kofferraum" : "Autobahn-Vignette gültig", "Fotos rundum gemacht (4 Seiten)"]
      : ["Schlüssel und Fahrzeugpapiere zurück", "Innenraum sauber, nicht geraucht", "Fotos rundum gemacht (4 Seiten)", ev ? "Ladekabel vollständig" : "Tankdeckel und Tankquittung geprüft"];
    $("#uebChk").innerHTML = CH.map(function (t) { return '<li><label><input type="checkbox"><span class="bx">' + ico("haken") + "</span>" + esc(t) + "</label></li>"; }).join("");
    drawCar(); sigClear(); uebSum();
  }
  $("#uebSel").addEventListener("change", function () { S.uebId = this.value; uebReset(); renderUeb(); });
  function rangeFill() { var t = $("#uebTank"); t.style.setProperty("--v", t.value + "%"); $("#uebTankV").textContent = t.value + " %"; }
  $("#uebTank").addEventListener("input", function () { rangeFill(); uebSum(); });
  $("#uebKm").addEventListener("input", uebSum);
  function uebMehr(r, c) {
    var kmN = +$("#uebKm").value || 0, lv = +$("#uebTank").value, n = tage(r), out = [];
    var gef = Math.max(0, kmN - (r.kmStart || c.km)), inkl = (r.ex || []).indexOf("km") >= 0 ? Infinity : 250 * n;
    out.push(["Gefahren", km(gef) + (inkl === Infinity ? " (unbegrenzt)" : " von " + km(inkl))]);
    var sum = 0;
    if (gef > inkl) { var b = (gef - inkl) * 0.29; sum += b; out.push(["Mehrkilometer " + Math.round(gef - inkl) + " × 0,29 €", eur(b)]); }
    var diff = (r.lvStart || c.lv) - lv;
    if (diff > 4) { var t = Math.ceil(diff / 10) * (isEV(c) ? 4 : 9); sum += t; out.push([(isEV(c) ? "Nachladen " : "Nachtanken ") + diff + " %", eur(t)]); }
    if (neuDmg.length) out.push(["Neue Schäden", neuDmg.length + " · über Kaution"]);
    return { pos: out, sum: sum, gef: gef };
  }
  function uebSum() {
    rangeFill();
    var r = S.res.filter(function (x) { return x.id === S.uebId; })[0]; if (!r) { $("#uebSum").innerHTML = ""; return; }
    var c = carById(r.car), h = "";
    if (r.st === "fix") {
      h = "<div><span>Mietpreis</span><b>" + eur(r.preis || calc(r).sum) + "</b></div><div><span>Kaution geblockt</span><b>" + eur(c.kau) + "</b></div><div><span>Inklusive</span><b>" + ((r.ex || []).indexOf("km") >= 0 ? "unbegrenzte km" : km(250 * tage(r))) + "</b></div>";
      if (neuDmg.length) h += "<div><span>Vorschäden neu erfasst</span><b>" + neuDmg.length + "</b></div>";
    } else {
      var m = uebMehr(r, c);
      m.pos.forEach(function (p) { h += "<div><span>" + p[0] + "</span><b>" + p[1] + "</b></div>"; });
      h += '<div class="tot"><span>Nachverrechnung</span><b>' + eur(m.sum) + "</b></div>";
    }
    $("#uebSum").innerHTML = h;
  }
  // Auto von oben: Front zeigt nach rechts, Fahrerseite oben
  function drawCar() {
    var r = S.res.filter(function (x) { return x.id === S.uebId; })[0]; if (!r) return;
    var alt = S.dmg[r.car] || [], mk = "", n = 0;
    alt.forEach(function (d) { n++; mk += '<g class="mk alt"><circle cx="' + d.x + '" cy="' + d.y + '" r="10"/><text x="' + d.x + '" y="' + (d.y + 4) + '">' + d.t + "</text></g>"; });
    neuDmg.forEach(function (d, i) { mk += '<g class="mk neu" data-i="' + i + '"><circle cx="' + d.x + '" cy="' + d.y + '" r="11"/><text x="' + d.x + '" y="' + (d.y + 4) + '">' + d.t + "</text></g>"; });
    $("#dmgSvg").innerHTML = '<svg viewBox="0 0 520 260" role="img" aria-label="Auto von oben. Tippen markiert einen Schaden.">' +
      '<text class="car-lbl" x="260" y="14" text-anchor="middle">FAHRERSEITE</text><text class="car-lbl" x="260" y="256" text-anchor="middle">BEIFAHRERSEITE</text>' +
      '<text class="car-lbl" x="14" y="130" text-anchor="middle" transform="rotate(-90 14 130)">HINTEN</text><text class="car-lbl" x="508" y="130" text-anchor="middle" transform="rotate(90 508 130)">VORNE</text>' +
      '<rect class="car-rad" x="96" y="30" width="58" height="20" rx="7"/><rect class="car-rad" x="96" y="210" width="58" height="20" rx="7"/><rect class="car-rad" x="364" y="30" width="58" height="20" rx="7"/><rect class="car-rad" x="364" y="210" width="58" height="20" rx="7"/>' +
      '<ellipse class="car-body" cx="318" cy="36" rx="14" ry="7"/><ellipse class="car-body" cx="318" cy="224" rx="14" ry="7"/>' +
      '<path class="car-body" d="M110 44C66 44 40 72 38 130c2 58 28 86 72 86h292c50 0 80-30 82-86-2-56-32-86-82-86z"/>' +
      '<path class="car-glass" d="M316 68q42 6 52 62-10 56-52 62 12-62 0-124z"/><path class="car-glass" d="M152 72q-30 6-36 58 6 52 36 58-10-58 0-116z"/>' +
      '<rect class="car-line" x="164" y="72" width="146" height="116" rx="26"/><path class="car-line" d="M384 78q46 12 64 52-18 40-64 52M190 46v26M290 46v26M190 188v26M290 188v26"/>' +
      '<path class="car-line" d="M44 104h10M44 156h10M470 100h8M470 160h8"/>' + mk + "</svg>";
    var t = alt.length ? alt.length + " bekannte Vorschäden (grau)" : "Keine bekannten Vorschäden";
    if (neuDmg.length) t += " · <b>" + neuDmg.length + " neu markiert</b>: " + neuDmg.map(function (d) { return TYP[d.t]; }).join(", ") + ". Nochmal tippen entfernt.";
    else t += ". Tippe aufs Auto, um einen Schaden zu markieren.";
    $("#dmgListe").innerHTML = t;
  }
  $("#dmgSvg").addEventListener("click", function (e) {
    var svg = $("#dmgSvg svg"); if (!svg) return;
    var m = e.target.closest(".mk.neu");
    if (m) { neuDmg.splice(+m.getAttribute("data-i"), 1); drawCar(); uebSum(); return; }
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (p.x < 34 || p.x > 488 || p.y < 26 || p.y > 234) return;
    neuDmg.push({ x: Math.round(p.x), y: Math.round(p.y), t: dTyp }); drawCar(); uebSum();
  });
  // Unterschrift
  var cv = $("#sig"), cx = cv.getContext("2d"), drawing = false, last = null;
  function sigSize() { var r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (!r.width) return; cv.width = r.width * d; cv.height = r.height * d; cx.scale(d, d); cx.lineCap = "round"; cx.lineJoin = "round"; cx.lineWidth = 2.4; cx.strokeStyle = "#e9ffb0"; }
  function sigClear() { sigSize(); cx.clearRect(0, 0, cv.width, cv.height); sigDone = false; }
  var pos = function (e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  cv.addEventListener("pointerdown", function (e) { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", function (e) { if (!drawing) return; var p = pos(e); cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(p.x, p.y); cx.stroke(); last = p; sigDone = true; });
  ["pointerup", "pointercancel"].forEach(function (t) { cv.addEventListener(t, function () { drawing = false; }); });
  $("#sigClear").addEventListener("click", sigClear);
  $("#uebOk").addEventListener("click", function () {
    var r = S.res.filter(function (x) { return x.id === S.uebId; })[0]; if (!r) return;
    var offen = $$("#uebChk input").filter(function (i) { return !i.checked; }).length;
    if (offen) { toast("Noch " + offen + (offen === 1 ? " Punkt" : " Punkte") + " auf der Liste offen."); return; }
    if (!sigDone) { toast("Bitte unterschreiben lassen."); return; }
    var c = carById(r.car), ab = r.st === "fix", kmN = +$("#uebKm").value || c.km, lv = +$("#uebTank").value;
    if (!ab && kmN < (r.kmStart || 0)) { toast("Der Kilometerstand ist kleiner als bei der Abholung."); return; }
    var m = ab ? null : uebMehr(r, c);
    // Unterschrift als helles Bild für das Protokoll
    var tmp = document.createElement("canvas"); tmp.width = cv.width; tmp.height = cv.height;
    var tx = tmp.getContext("2d"); tx.drawImage(cv, 0, 0); tx.globalCompositeOperation = "source-in"; tx.fillStyle = "#121915"; tx.fillRect(0, 0, tmp.width, tmp.height);
    var P = { art: ab ? "Abholung" : "Rückgabe", zeit: new Date().toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }), km: kmN, lv: lv, ev: isEV(c), neu: neuDmg.map(function (d) { return TYP[d.t]; }), sig: tmp.toDataURL("image/png"), mehr: m ? m.sum : 0 };
    (S.dmg[r.car] = S.dmg[r.car] || []).push.apply(S.dmg[r.car], neuDmg.map(function (d) { return { x: d.x, y: d.y, t: d.t }; }));
    if (ab) { r.st = "laufend"; r.kmStart = kmN; r.lvStart = lv; r.von = TODAY < r.von ? TODAY : r.von; }
    else { r.st = "zurueck"; c.st = "reinigung"; }
    c.km = kmN; c.lv = lv;
    S.prot[r.id] = P; S.uebId = ""; save();
    uebReset(); showProt(r.id);
  });
  function showProt(id) {
    var r = S.res.filter(function (x) { return x.id === id; })[0], P = S.prot[id]; if (!r || !P) return;
    var c = carById(r.car);
    $("#protIn").innerHTML = '<div class="prot"><div class="dlg__head"><div><p class="kick">Protokoll gespeichert</p><h2 id="protH">' + P.art + " · " + esc(c.n) + '</h2></div><button type="button" class="ib glass" data-close aria-label="Schließen">' + ico("x") + "</button></div>" +
      '<div class="prot__doc"><h3>Luma Drive · Übergabeprotokoll</h3><small>' + r.id + " · " + P.zeit + "</small><dl><dt>Kunde</dt><dd>" + esc(r.kunde) + "</dd><dt>Fahrzeug</dt><dd>" + esc(c.n) + " · " + c.kz + "</dd><dt>Kilometer</dt><dd>" + km(P.km) + "</dd><dt>" + (P.ev ? "Akku" : "Tank") + "</dt><dd>" + P.lv + " %</dd><dt>Neue Schäden</dt><dd>" + (P.neu.length ? esc(P.neu.join(", ")) : "keine") + "</dd>" + (P.art === "Rückgabe" ? "<dt>Nachverrechnung</dt><dd>" + eur(P.mehr) + "</dd>" : "") + '</dl><small>Unterschrift Kunde</small><img src="' + P.sig + '" alt="Unterschrift"></div>' +
      '<div class="rd__act"><button type="button" class="btn btn--lime" id="protMail">' + ico("mail") + 'PDF an Kunden senden</button><button type="button" class="btn btn--line" data-close>Fertig</button></div></div>';
    openDlg($("#protDlg"));
    $("#protMail").addEventListener("click", function () { toast("PDF-Protokoll an " + r.kunde + " gesendet."); $("#protDlg").close(); });
    $("#protDlg").addEventListener("close", function () { render(); }, { once: true });
  }

  // ---------- Kunden ----------
  $("#kuSuche").addEventListener("input", renderKunden);
  function renderKunden() {
    var q = $("#kuSuche").value.trim().toLowerCase();
    var L = S.kunden.filter(function (k) { return !q || (k.n + " " + k.ort).toLowerCase().indexOf(q) >= 0; });
    $("#kunden").innerHTML = L.map(function (k, i) {
      var rs = S.res.filter(function (r) { return r.kunde === k.n && r.st !== "storno" && r.st !== "block"; });
      var f = k.f + rs.filter(function (r) { return r.st !== "anfrage"; }).length, u = k.u + rs.reduce(function (s, r) { return s + (r.st === "anfrage" ? 0 : r.preis || 0); }, 0);
      var akt = rs.filter(function (r) { return r.st === "fix" || r.st === "laufend" || r.st === "anfrage"; })[0];
      var ini = k.n.replace(/^(Familie|FC) /, "").split(/[\s&]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
      return '<article class="ku glass" style="animation-delay:' + Math.min(i, 10) * 40 + 'ms"><span class="ku__av f' + (i % 4 + 1) + '">' + esc(ini) + '</span><div class="ku__b"><b>' + esc(k.n) + (f >= 5 ? "<em>Stammkunde</em>" : "") + (k.neu ? "<em>Neu</em>" : "") + "</b><small>" + esc(k.ort === "neu" ? "Neu angelegt" : k.ort) + (k.tel ? " · " + esc(k.tel) : "") + "</small>" +
        '<div class="ku__row"><span class="chip">' + f + (f === 1 ? " Miete" : " Mieten") + '</span><span class="chip">' + eur(u) + "</span>" + (k.s ? '<span class="chip ku__st">' + ico("stern") + k.s + ",0</span>" : "") + '<span class="chip ok">' + ico("haken") + "Führerschein geprüft</span></div>" +
        (akt ? '<div class="ku__row"><button type="button" class="chip" data-res="' + akt.id + '" style="cursor:pointer"><i class="dot ' + stCls[akt.st] + '"></i>' + stTxt[akt.st] + " · " + esc(carById(akt.car).n) + " · " + fd(akt.von) + "</button></div>" : "") + "</div></article>";
    }).join("") || '<p class="leer">Niemand gefunden.</p>';
  }

  // ---------- Online-Buchung (Kundenansicht) ----------
  var WD = { von: addD(8), bis: addD(10), car: "", name: "", tel: "", ok: false };
  function renderWid() {
    var el = $("#wid");
    if (WD.ok) {
      el.innerHTML = '<div class="w"><span class="w__isl"></span><div class="w__ok"><span class="big">' + ico("haken") + "</span><h3>Danke, " + esc(WD.name.split(" ")[0]) + "!</h3><p>Ihre Anfrage für den " + esc(carById(WD.car).n) + " ist eingegangen. Sie bekommen in Kürze eine Bestätigung per Mail.</p>" +
        '<div style="display:grid;gap:8px;margin-top:22px"><button type="button" class="btn btn--lime" data-go="start">Im Dashboard ansehen</button><button type="button" class="btn btn--line" id="wNeu">Noch eine Anfrage</button></div></div></div>';
      $("#wNeu").addEventListener("click", function () { WD.ok = false; WD.car = ""; WD.name = ""; WD.tel = ""; renderWid(); });
      return;
    }
    var a = dt(WD.von, "09:00"), b = dt(WD.bis, "09:00"), okZ = b > a, n = okZ ? tage({ von: WD.von, vonZ: "09:00", bis: WD.bis, bisZ: "09:00" }) : 0;
    var cars = S.cars.map(function (c) {
      var ok = okZ && frei(c.id, a, b);
      if (!ok && WD.car === c.id) WD.car = "";
      return '<button type="button" class="w__car" data-wc="' + c.id + '"' + (ok ? "" : " disabled") + ' aria-pressed="' + (WD.car === c.id) + '"><img src="' + IMG + c.id + '.webp" alt="" width="76" height="50" loading="lazy"><span><b>' + esc(c.n) + "</b><small>" + c.kl + " · " + c.si + " Sitze</small></span><em>" + (ok ? c.p + " €/Tag" : "ausgebucht") + "</em></button>";
    }).join("");
    var c = carById(WD.car), k = c ? calc({ car: WD.car, von: WD.von, vonZ: "09:00", bis: WD.bis, bisZ: "09:00", ex: [], ort: "st" }) : null;
    el.innerHTML = '<div class="w"><span class="w__isl"></span><p class="w__brand"><img src="/beispiele/dashboard/v2/logo.svg" alt="" width="30" height="30">LUMA DRIVE</p>' +
      '<h2 class="w__h">Mietwagen in<br>Musterort</h2><p class="w__p">E-Autos, SUVs und Familien-Vans. Online reservieren, vor Ort einsteigen.</p>' +
      '<div class="w__box"><div class="row2"><label class="fld"><span>Abholung</span><input type="date" id="wdVon" value="' + WD.von + '" min="' + TODAY + '"></label><label class="fld"><span>Rückgabe</span><input type="date" id="wdBis" value="' + WD.bis + '" min="' + TODAY + '"></label></div></div>' +
      '<div class="w__cars">' + cars + "</div>" +
      '<div class="w__box" style="margin-top:14px"><label class="fld"><span>Ihr Name</span><input id="wdName" value="' + esc(WD.name) + '" placeholder="Vor- und Nachname" autocomplete="off"></label><label class="fld" style="margin-top:8px"><span>Telefon</span><input id="wdTel" type="tel" value="' + esc(WD.tel) + '" placeholder="+43 …"></label></div>' +
      '<p class="w__tot"><span>' + (k ? n + (n === 1 ? " Tag" : " Tage") + " · inkl. USt." : okZ ? "Auto wählen" : "Datum prüfen") + "</span><b>" + (k ? eur(k.sum) : "–") + "</b></p>" +
      '<button type="button" class="btn btn--lime" id="wdGo"' + (c && WD.name.length > 2 ? "" : " disabled") + ">Unverbindlich reservieren</button></div>";
  }
  $("#wid").addEventListener("change", function (e) {
    if (e.target.id === "wdVon") { WD.von = e.target.value; if (WD.bis <= WD.von) WD.bis = iso(new Date(parse(WD.von).getTime() + 2 * DAY + 36e5)); renderWid(); }
    if (e.target.id === "wdBis") { WD.bis = e.target.value; renderWid(); }
  });
  $("#wid").addEventListener("input", function (e) {
    if (e.target.id === "wdName" || e.target.id === "wdTel") {
      WD.name = $("#wdName").value.trim(); WD.tel = $("#wdTel").value.trim();
      var go = $("#wdGo"); if (go) go.disabled = !(WD.car && WD.name.length > 2);
    }
  });
  $("#wid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wc]");
    if (b && !b.disabled) { WD.car = b.getAttribute("data-wc"); var y = $("#wid").scrollTop; renderWid(); $("#wid").scrollTop = y; return; }
    if (e.target.closest("#wdGo")) {
      if (!frei(WD.car, dt(WD.von, "09:00"), dt(WD.bis, "09:00"))) { renderWid(); return; }
      var o = { id: "LD-" + (++S.seq), car: WD.car, kunde: WD.name, tel: WD.tel, von: WD.von, vonZ: "09:00", bis: WD.bis, bisZ: "09:00", st: "anfrage", ex: [], ort: "st" };
      o.preis = calc(o).sum; S.res.push(o); kundeMerken(WD.name, WD.tel); save();
      WD.ok = true; renderWid(); $("#wid").scrollTop = 0; renderBell();
      var bn = $("#bellBtn"); bn.classList.remove("is-ping"); void bn.offsetWidth; bn.classList.add("is-ping");
      toast("Neue Online-Anfrage von " + o.kunde + ". Sie wartet bei der Glocke.");
    }
  });

  // ---------- Assistent ----------
  var ki = $("#ki"), kiStarted = false;
  var CHIPS = ["Was ist am Wochenende frei?", "Wer bringt heute zurück?", "Welche Autos brauchen bald Service?", "Wie läuft der Umsatz?", "Offene Anfragen?"];
  $("#kiChips").innerHTML = CHIPS.map(function (c) { return '<button type="button">' + c + "</button>"; }).join("");
  function toggleKi() { if (ki.hidden) openKi(); else closeKi(); }
  function openKi() {
    ki.hidden = false; document.documentElement.classList.add("ki-open");
    if (!kiStarted) { kiStarted = true; kiSay("Hallo Lena! Ich kenne alle Reservierungen und die Flotte. Frag mich etwas oder tippe unten eine Frage an.", "bot"); }
    if (matchMedia("(pointer:fine)").matches) $("#kiIn").focus();
  }
  function closeKi() { if (ki.hidden) return; ki.hidden = true; document.documentElement.classList.remove("ki-open"); }
  $("#kiX").addEventListener("click", closeKi);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeKi(); $("#bellPop").hidden = true; } });
  function kiSay(html, who) { var d = document.createElement("div"); d.className = "km km--" + who; d.innerHTML = html; $("#kiLog").appendChild(d); $("#kiLog").scrollTop = 1e6; }
  $("#kiChips").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) ask(b.textContent); });
  $("#kiF").addEventListener("submit", function (e) { e.preventDefault(); var v = $("#kiIn").value.trim(); if (v) { ask(v); $("#kiIn").value = ""; } });
  function ask(q) {
    kiSay(esc(q), "me");
    var dots = document.createElement("div"); dots.className = "km km--bot km--tip"; dots.textContent = "…"; $("#kiLog").appendChild(dots);
    setTimeout(function () { dots.remove(); kiSay(answer(q.toLowerCase()), "bot"); }, 550);
  }
  function li(a) { return "<ul>" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function answer(q) {
    if (/wochenend|samstag|sonntag|frei/.test(q)) {
      var d = T0.getDay(), sa = (6 - d + 7) % 7; if (d === 0) sa = 6;
      var von = dt(addD(sa), "09:00"), bis = dt(addD(sa + 2), "09:00");
      var f = S.cars.filter(function (c) { return frei(c.id, von, bis); });
      return "Von <b>" + fd(addD(sa)) + "</b> bis <b>" + fd(addD(sa + 2)) + "</b> sind " + f.length + " Autos frei:" + li(f.map(function (c) { return esc(c.n) + " · " + c.p + " €/Tag"; })) + (f.length ? "" : "Alles ausgebucht.");
    }
    if (/zurück|rückgabe|bringt/.test(q)) {
      var r = heute().filter(function (x) { return x.k === "ru"; });
      return r.length ? "Heute kommen " + r.length + " Autos zurück:" + li(r.map(function (x) { return x.z + " · " + esc(x.r.kunde) + " · " + esc(carById(x.r.car).n) + (x.done ? " (erledigt)" : ""); })) : "Heute ist keine Rückgabe geplant.";
    }
    if (/abhol|übergabe/.test(q)) {
      var a = heute().filter(function (x) { return x.k === "ab"; });
      return a.length ? "Heute werden " + a.length + " Autos abgeholt:" + li(a.map(function (x) { return x.z + " · " + esc(x.r.kunde) + " · " + esc(carById(x.r.car).n) + (x.done ? " (erledigt)" : ""); })) : "Heute holt niemand ab.";
    }
    if (/service|werkstatt|pickerl|wartung/.test(q)) {
      var s = S.cars.filter(function (c) { return c.sv < 3000; });
      return "Bald fällig sind:" + li(s.map(function (c) { return esc(c.n) + ": Service in " + km(c.sv); })) + "Das Pickerl läuft als Nächstes beim <b>Ford Focus</b> ab (" + carById("focus").pi + ").";
    }
    if (/umsatz|geld|verdien|einnahm/.test(q)) {
      var m = T0.getMonth(), u = T0.getDate() * 410, w = 0;
      S.res.forEach(function (r) { if (!r.preis || r.st === "anfrage" || r.st === "storno") return; if (parse(r.von).getMonth() === m) u += r.preis; var i = dayIdx(r.von); if (i >= 0 && i < 7) w += r.preis; });
      return "Im " + MON[m] + " stehen <b>" + eur(u) + "</b> zu Buche, das sind " + Math.round(u / 240) + " % vom Monatsziel. In den nächsten 7 Tagen starten Mieten über <b>" + eur(w) + "</b>.";
    }
    if (/anfrage|online|offen/.test(q)) {
      var an = anfragen();
      return an.length ? an.length + " Online-Anfragen warten auf dich:" + li(an.map(function (r) { return esc(r.kunde) + " · " + esc(carById(r.car).n) + " · " + fd(r.von); })) + "Bestätigen geht direkt auf der Startseite mit dem Haken." : "Keine offenen Anfragen. Alles erledigt!";
    }
    if (/auslast|wie viel|unterwegs/.test(q)) {
      var tot = 0; for (var i = 0; i < 7; i++) { var dv = dt(addD(i), "12:00"), dz = new Date(dv.getTime() + 1); tot += S.cars.filter(function (c) { return !frei(c.id, dv, dz); }).length; }
      return "Heute sind " + $("#ringV").getAttribute("data-v") + " % der Flotte vermietet. Im Schnitt der nächsten 7 Tage sind es <b>" + Math.round(tot / 7 / S.cars.length * 100) + " %</b>.";
    }
    if (/elektro|akku|lade|strom/.test(q)) {
      return "Die E-Autos:" + li(S.cars.filter(isEV).map(function (c) { return esc(c.n) + ": " + c.lv + " %, etwa " + Math.round(c.lv * 4.6) + " km Reichweite"; }));
    }
    return "Das kann ich in dieser Demo noch nicht beantworten. Probier es mit freien Autos am Wochenende, Rückgaben, Service, Umsatz, Auslastung oder Anfragen.";
  }

  // ---------- Kleinkram ----------
  var tt;
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("is-on"); }, 3400); }
  $("#reset").addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); });
  addEventListener("resize", function () { if (cur === "uebergabe" && !sigDone) sigSize(); });

  show(location.hash.slice(1) || "start", true);
})();
