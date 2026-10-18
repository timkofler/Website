// Betriebs-Dashboard "Haustechnik Kofler": Plantafel, Aufträge mit Projektmappe (Fotos, Chat, Nachkalkulation),
// Monteur-App, Stundenerfassung, Rechnungen und Lager.
// Alles läuft im Browser. Musterdaten werden pro Tag neu erzeugt, Änderungen bleiben im localStorage.
(function () {
  var KEY = "tk-dash-kofler-v2", RATE = 68, VAT = 0.2;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var eur = function (n, d) { return n.toLocaleString("de-AT", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }) + " €"; };
  var hrs = function (n) { return n.toLocaleString("de-AT", { maximumFractionDigits: 2 }) + " h"; };
  var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MON = ["Jän.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];

  // ---- Datum ----
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  function add(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function short(s) { var d = parse(s); return WD[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "."; }
  var now = new Date(), today = iso(now), dow = now.getDay(), isWork = dow > 0 && dow < 6;
  // Arbeitswoche mit Stunden: die laufende, am Wochenende die gerade vergangene.
  var monday = add(now, dow === 0 ? -6 : 1 - dow);
  var week = [0, 1, 2, 3, 4].map(function (i) { return iso(add(monday, i)); });
  var lastWork = isWork ? today : week[4];
  // Einsatzplan: die nächsten fünf Arbeitstage ab heute.
  var plan = [], d0 = new Date(now);
  while (plan.length < 5) { if (d0.getDay() > 0 && d0.getDay() < 6) plan.push(iso(d0)); d0 = add(d0, 1); }

  var STAFF = [
    { id: "st", name: "Stefan Kofler", short: "SK", role: "Meister", c: "#2f5bff", soll: 38.5 },
    { id: "lu", name: "Lukas Hofer", short: "LH", role: "Monteur", c: "#12a36b", soll: 38.5 },
    { id: "ma", name: "Martin Eder", short: "ME", role: "Monteur", c: "#e69a00", soll: 38.5 },
    { id: "jo", name: "Jonas Pichler", short: "JP", role: "Lehrling", c: "#e5484d", soll: 38.5 }
  ];
  var COLS = [
    { id: "neu", name: "Neu / Angebot", c: "#8a90a2" },
    { id: "plan", name: "Geplant", c: "#e69a00" },
    { id: "arbeit", name: "In Arbeit", c: "#2f5bff" },
    { id: "fertig", name: "Fertig", c: "#12a36b" }
  ];
  var ANNA = { id: "an", name: "Anna Kofler", short: "AK", role: "Büro", c: "#c026d3" };
  function staff(id) { return STAFF.filter(function (s) { return s.id === id; })[0] || STAFF[0]; }
  function person(id) { return id === "an" ? ANNA : staff(id); }
  var IMG = "/beispiele/dashboard/img/";

  // ---- Musterdaten ----
  function seed() {
    var r = 7; function rnd() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    var jobs = [
      { id: "A-1041", kunde: "Fam. Huber", titel: "Badsanierung mit Walk-in-Dusche", ort: "Musterdorf", st: "arbeit", std: 160, mat: 6800, matIst: 7140 },
      { id: "A-1043", kunde: "Bäckerei Kornfeld", titel: "Warmwasserspeicher & Leitungen neu", ort: "Musterdorf", st: "arbeit", std: 56, mat: 1650, matIst: 1590 },
      { id: "A-1039", kunde: "Fam. Berger", titel: "Rohrbruch Küche beheben", ort: "Oberau", st: "fertig", std: 7, mat: 240, matIst: 262 },
      { id: "A-1044", kunde: "Gemeindeamt Musterdorf", titel: "Heizungswartung, 14 Heizkörper", ort: "Musterdorf", st: "plan", std: 6, mat: 180 },
      { id: "A-1046", kunde: "Café Mühlbach", titel: "Wasserenthärter einbauen", ort: "Mühlbach", st: "plan", std: 5, mat: 1120 },
      { id: "A-1045", kunde: "Fam. Leitner", titel: "Wärmepumpe: Beratung & Angebot", ort: "Kirchberg", st: "neu", std: 3, mat: 0 },
      { id: "A-1047", kunde: "Hr. Wimmer", titel: "E-Check & FI-Schalter tauschen", ort: "Oberau", st: "neu", std: 3, mat: 140 }
    ];
    // Stunden der laufenden Woche bis heute
    var time = [], who = ["st", "lu", "ma", "jo"], on = { st: ["A-1043", "A-1041"], lu: ["A-1041"], ma: ["A-1041", "A-1043"], jo: ["A-1041", "A-1043"] };
    week.forEach(function (day) {
      if (day > lastWork) return;
      var part = day === today ? Math.max(0, Math.min(1, (now.getHours() - 7) / 9)) : 1;
      who.forEach(function (w) {
        var tot = Math.round((7.25 + rnd() * .75) * part * 4) / 4; if (tot < .25) return;
        var j = on[w][Math.floor(rnd() * on[w].length)], a = Math.round(tot * (.5 + rnd() * .3) * 4) / 4;
        time.push({ id: "t" + time.length, who: w, job: j, date: day, h: a, note: "" });
        if (tot - a >= .25) time.push({ id: "t" + time.length, who: w, job: on[w][0], date: day, h: tot - a, note: "" });
      });
    });
    // Stunden aus früheren Wochen, damit Plan und Ist realistisch aussehen
    var target = { "A-1041": 149, "A-1043": 61 };
    jobs.forEach(function (j) {
      var wk = time.reduce(function (a, t) { return a + (t.job === j.id ? t.h : 0); }, 0);
      j.vorher = target[j.id] ? Math.max(0, Math.round((target[j.id] - wk) * 4) / 4) : 0;
      if (j.matIst == null) j.matIst = 0;
    });
    // Fertiger Auftrag hat seine Stunden schon in der Vorwoche
    time.push({ id: "tb1", who: "ma", job: "A-1039", date: iso(add(monday, -3)), h: 4.5, note: "Leitung freigelegt" });
    time.push({ id: "tb2", who: "jo", job: "A-1039", date: iso(add(monday, -3)), h: 3, note: "" });
    var y = now.getFullYear(), inv = [
      { nr: y + "-131", kunde: "Fam. Steiner", txt: "Heizkörper tauschen (3 Stk.)", net: 1840, date: iso(add(now, -9)), due: iso(add(now, 5)), paid: null },
      { nr: y + "-130", kunde: "Gasthof Hollerhof", txt: "Fettabscheider Wartung", net: 620, date: iso(add(now, -12)), due: iso(add(now, 2)), paid: null },
      { nr: y + "-129", kunde: "Fam. Kern", txt: "Neue Mischbatterien Bad & Küche", net: 948, date: iso(add(now, -24)), due: iso(add(now, -10)), paid: null },
      { nr: y + "-128", kunde: "Tischlerei Brandl", txt: "Druckluft-Leitung Werkstatt", net: 3260, date: iso(add(now, -15)), due: iso(add(now, -1)), paid: iso(add(now, -3)) },
      { nr: y + "-127", kunde: "Fam. Gruber", txt: "Thermenservice & Abgasmessung", net: 210, date: iso(add(now, -18)), due: iso(add(now, -4)), paid: iso(add(now, -6)) },
      { nr: y + "-126", kunde: "Malerei Lindner", txt: "WC-Anlage Sozialraum", net: 2480, date: iso(add(now, -26)), due: iso(add(now, -12)), paid: iso(add(now, -11)) }
    ];
    var stock = [
      { id: "s1", name: "Kupferrohr 15 mm", unit: "m", qty: 46, min: 30, max: 100 },
      { id: "s2", name: "Pressfitting Bogen 15 mm", unit: "Stk.", qty: 18, min: 40, max: 120 },
      { id: "s3", name: "Sanitär-Silikon weiß", unit: "Kart.", qty: 6, min: 10, max: 30 },
      { id: "s4", name: "Heizkörperventil ½″", unit: "Stk.", qty: 12, min: 8, max: 30 },
      { id: "s5", name: "Thermostatkopf", unit: "Stk.", qty: 14, min: 6, max: 30 },
      { id: "s6", name: "Flexschlauch ⅜″ 50 cm", unit: "Stk.", qty: 9, min: 12, max: 40 },
      { id: "s7", name: "Siphon 40 mm", unit: "Stk.", qty: 3, min: 5, max: 15 },
      { id: "s8", name: "Kabel NYM-J 3×1,5 mm²", unit: "m", qty: 85, min: 50, max: 200 }
    ];
    // Einsätze: [Tag, Beginn, Mitarbeiter, Auftrag, Notiz, Stunden]
    var ev = [], tpl = [
      [0, "07:30", "lu", "A-1041", "Fliesen Dusche, Abdichtung", 8], [0, "07:30", "jo", "A-1041", "mit Lukas", 8], [0, "08:00", "ma", "A-1043", "Speicher anschließen", 8], [0, "13:30", "st", "A-1045", "Beratung vor Ort", 2],
      [1, "07:30", "lu", "A-1041", "Vorwandinstallation", 8], [1, "08:00", "st", "A-1044", "Wartung Teil 1", 5], [1, "09:00", "ma", "A-1046", "Enthärter montieren", 5], [1, "14:00", "jo", "A-1047", "E-Check mit Stefan", 3],
      [2, "07:30", "lu", "A-1041", "Sanitärkeramik", 8], [2, "08:00", "st", "A-1044", "Wartung Teil 2", 6], [2, "10:00", "ma", "A-1043", "Abnahme mit Kunde", 3],
      [3, "07:30", "lu", "A-1041", "Fertigstellung", 8], [3, "07:30", "jo", "A-1041", "mit Lukas", 8], [3, "08:30", "st", "A-1047", "FI-Schalter tauschen", 3],
      [4, "08:00", "ma", "A-1046", "Einschulung Kunde", 2], [4, "08:00", "jo", "A-1046", "mit Martin", 4], [4, "12:00", "st", "A-1045", "Angebot besprechen", 1.5]
    ];
    tpl.forEach(function (t, i) { ev.push({ id: "e" + i, d: plan[t[0]], t: t[1], who: t[2], job: t[3], note: t[4], dur: t[5] }); });
    var abs = [{ who: "jo", d: plan[2], txt: "Berufsschule" }];
    var y1 = iso(add(now, -1)), y3 = iso(add(now, -3)), y6 = iso(add(now, -6));
    var pics = [
      { id: "p1", job: "A-1041", src: IMG + "fliesen.webp", who: "lu", d: y1, cap: "Boden verfliest, Kleber trocknet" },
      { id: "p2", job: "A-1041", src: IMG + "armatur.webp", who: "lu", d: today, cap: "Thermostat in der Dusche montiert" },
      { id: "p3", job: "A-1041", src: IMG + "bad.webp", who: "an", d: y6, cap: "Wunschbild von Fam. Huber" },
      { id: "p4", job: "A-1043", src: IMG + "leitung.webp", who: "ma", d: y1, cap: "Anschlüsse am Speicher" },
      { id: "p5", job: "A-1044", src: IMG + "heizkoerper.webp", who: "st", d: y3, cap: "Ventil Sitzungssaal tauschen" }
    ];
    var msg = [
      { id: "m1", job: "A-1041", who: "lu", d: y1, t: "16:40", txt: "Abdichtung in der Dusche ist fertig, trocknet über Nacht." },
      { id: "m2", job: "A-1041", who: "an", d: y1, t: "16:52", txt: "Super! Frau Huber fragt, ob die Nische 30 oder 40 cm breit wird." },
      { id: "m3", job: "A-1041", who: "lu", d: today, t: "07:48", txt: "40 cm, wie im Plan. Foto vom Thermostat liegt in der Mappe." },
      { id: "m4", job: "A-1043", who: "ma", d: y1, t: "15:10", txt: "Speicher ist geliefert, es fehlt noch das Sicherheitsventil." },
      { id: "m5", job: "A-1043", who: "an", d: y1, t: "15:22", txt: "Ist bestellt, kommt morgen früh ins Lager." },
      { id: "m6", job: "A-1044", who: "st", d: y3, t: "11:05", txt: "Schlüssel fürs Gemeindeamt holen wir beim Bauhof." }
    ];
    var feed = [
      { t: iso(add(now, -1)), txt: "Zahlung eingegangen: Tischlerei Brandl, 3.912 €" },
      { t: iso(add(now, -1)), txt: "Auftrag A-1039 als fertig markiert" },
      { t: iso(add(now, -2)), txt: "Neue Anfrage über die Webseite: Fam. Leitner" }
    ];
    return { day: today, jobs: jobs, time: time, inv: inv, stock: stock, ev: ev, abs: abs, pics: pics, msg: msg, feed: feed, clocks: {}, me: "lu" };
  }

  var S;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.day === today) { S = s; return; } } catch (e) {}
    S = seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Speicher voll: Demo zurücksetzen oder Fotos löschen"); } }
  function log(txt) { S.feed.unshift({ t: today, txt: txt, now: true }); S.feed = S.feed.slice(0, 12); }
  function job(id) { return S.jobs.filter(function (j) { return j.id === id; })[0]; }
  function jobHrs(id) { var j = job(id); return S.time.reduce(function (a, t) { return a + (t.job === id ? t.h : 0); }, j && j.vorher || 0); }
  function gross(i) { return Math.round(i.net * (1 + VAT) * 100) / 100; }
  function isDue(i) { return !i.paid && i.due < today; }
  var toastT;
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("is-on"); }, 2600); }

  // ---- Navigation ----
  var cur = "home";
  function go(v, scroll) {
    if (v !== cur && MP.job) closeMappe();
    cur = v;
    $$(".view").forEach(function (s) { s.classList.toggle("is-on", s.id === "v-" + v); });
    $$(".nav-b").forEach(function (b) { if (b.getAttribute("data-go") === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    try { history.replaceState(null, "", "#" + v); } catch (e) {}
    render();
    if (scroll) { var a = $("#app").getBoundingClientRect().top; if (a < 0 || a > innerHeight * .4) scrollTo({ top: scrollY + a - 50, behavior: "smooth" }); }
  }
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g) { go(g.getAttribute("data-go"), true); return; }
    if (e.target.closest("[data-reset]")) { try { localStorage.removeItem(KEY); } catch (er) {} S = seed(); render(); toast("Demo-Daten zurückgesetzt"); }
  });

  // ---- Übersicht ----
  function renderHome() {
    var d = now;
    var h = now.getHours();
    $("#h-home").textContent = (h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend") + ", Anna";
    $("#today-l").textContent = WDL[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()] + " " + d.getFullYear() + " · Haustechnik Kofler, Musterdorf";
    var m = today.slice(0, 7);
    var paid = S.inv.filter(function (i) { return i.paid && i.paid.slice(0, 7) === m; }).reduce(function (a, i) { return a + gross(i); }, 0);
    var open = S.inv.filter(function (i) { return !i.paid; }), due = open.filter(isDue);
    $("#k-rev").textContent = eur(paid);
    $("#k-rev-s").innerHTML = "Vormonat " + eur(10900) + " · " + S.inv.filter(function (i) { return i.paid && i.paid.slice(0, 7) === m; }).length + " Zahlungen";
    $("#k-open").textContent = eur(open.reduce(function (a, i) { return a + gross(i); }, 0));
    $("#k-open-s").innerHTML = due.length ? "<b class=neg>" + due.length + " überfällig</b> · " + open.length + " Rechnungen" : open.length + " Rechnungen, keine überfällig";
    var wk = S.time.filter(function (t) { return week.indexOf(t.date) >= 0; }).reduce(function (a, t) { return a + t.h; }, 0);
    var soll = STAFF.reduce(function (a, s) { return a + s.soll; }, 0);
    $("#k-hrs").textContent = hrs(wk);
    $("#k-hrs-b").style.setProperty("--w", Math.min(100, wk / soll * 100) + "%");
    $("#k-hrs-s").textContent = "von " + hrs(soll) + " Soll · 4 Mitarbeiter";
    var act = S.jobs.filter(function (j) { return j.st === "arbeit"; }), fin = S.jobs.filter(function (j) { return j.st === "fertig"; });
    $("#k-jobs").textContent = act.length;
    $("#k-jobs-s").innerHTML = fin.length ? "<b>" + fin.length + " fertig</b>, bereit zum Verrechnen" : S.jobs.filter(function (j) { return j.st === "plan"; }).length + " weitere geplant";

    // Diagramm: 5 Vormonate fix, aktueller Monat aus den Rechnungen
    var vals = [9400, 11800, 8700, 12600, 10900, paid], labs = [];
    for (var i = 5; i >= 0; i--) labs.push(MON[(now.getMonth() - i + 12) % 12]);
    var W = Math.max(280, $("#chart").clientWidth || 600), H = $("#chart").clientHeight || 200, mx = 14000, bw = Math.min(60, (W - 40) / 6 * .62), gap = (W - 40 - bw * 6) / 5, svg = "";
    [0, 5000, 10000].forEach(function (g) { var y = H - 24 - (g / mx) * (H - 44); svg += '<line class="gl" x1="40" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="lb" x="0" y="' + (y + 4) + '">' + (g / 1000) + 'k</text>'; });
    vals.forEach(function (v, i) {
      var x = 40 + i * (bw + gap), bh = Math.max(2, (v / mx) * (H - 44)), y = H - 24 - bh;
      svg += '<rect class="b' + (i === 5 ? " cur" : "") + '" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="7"><title>' + labs[i] + ": " + eur(v) + '</title></rect>';
      svg += '<text class="bv" x="' + (x + bw / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + (v / 1000).toLocaleString("de-AT", { maximumFractionDigits: 1 }) + 'k</text>';
      svg += '<text class="lb" x="' + (x + bw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + labs[i] + '</text>';
    });
    $("#chart").innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Umsatz der letzten sechs Monate">' + svg + "</svg>";

    var nd = plan[0];
    $("#next-h").firstChild.textContent = (nd === today ? "Heute im Einsatz " : "Nächster Arbeitstag ");
    $("#next-d").textContent = short(nd);
    var evs = S.ev.filter(function (e) { return e.d === nd; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; });
    $("#next-l").innerHTML = evs.length ? evs.map(function (e) { var s = staff(e.who), j = job(e.job) || {};
      return '<li data-open="' + e.job + '"><span class="time">' + e.t + '</span><span class="ava" style="--c:' + s.c + '">' + s.short + '</span><span class="grow"><span class="t">' + esc(j.kunde || "") + '</span><span class="s">' + esc(j.titel || "") + (e.note ? " · " + esc(e.note) : "") + "</span></span></li>"; }).join("") : '<li class="empty">Keine Termine eingetragen.</li>';

    var low = S.stock.filter(function (s) { return s.qty < s.min; });
    $("#low-l").innerHTML = low.length ? low.map(function (s) { return '<li><span class="grow"><span class="t">' + esc(s.name) + '</span><span class="s">Mindestbestand ' + s.min + " " + s.unit + '</span></span><span class="pill bad">' + s.qty + " " + s.unit + "</span></li>"; }).join("") : '<li class="empty">Alles auf Lager. 👍</li>';
    $("#feed-l").innerHTML = S.feed.slice(0, 5).map(function (f) { return '<li><span class="grow"><span class="t" style="font-weight:500">' + esc(f.txt) + '</span><span class="s">' + (f.t === today ? (f.now ? "gerade eben" : "heute") : short(f.t)) + "</span></span></li>"; }).join("");
  }

  // ---- Stempeluhr ----
  var tick;
  function fmtDur(ms) { var s = Math.floor(ms / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (n) { return ("0" + n).slice(-2); }).join(":"); }
  // Jeder Mitarbeiter hat seine eigene Stempeluhr (S.clocks[wer]).
  function running() { return Object.keys(S.clocks); }
  function stamp(who, jobId) {
    var c = S.clocks[who];
    if (!c) {
      S.clocks[who] = { job: jobId, start: Date.now() };
      log(staff(who).name + " eingestempelt auf " + jobId);
      toast(staff(who).name.split(" ")[0] + " ist eingestempelt. Die Zeit läuft.");
    } else {
      // Gebucht wird auf die Viertelstunde aufgerundet, mindestens 0,25 h.
      var h = Math.max(.25, Math.ceil((Date.now() - c.start) / 900000) / 4);
      S.time.push({ id: "t" + Date.now(), who: who, job: c.job, date: today, h: h, note: "Stempeluhr" });
      log(staff(who).name + ": " + hrs(h) + " auf " + c.job + " gebucht");
      toast(hrs(h) + " auf " + c.job + " gebucht");
      delete S.clocks[who];
    }
    save(); render();
  }
  function renderClock() {
    var who = $("#clk-who").value, c = S.clocks[who], b = $("#clk-b"), chip = $("#clock-chip"), run = running();
    clearInterval(tick);
    $("#clk-job").disabled = !!c;
    if (c) {
      var j = job(c.job) || {};
      $("#clk-job").value = c.job;
      b.textContent = "Ausstempeln"; b.className = "btn bad";
      $("#clk-s").textContent = staff(who).name + " · " + (j.kunde || "") + " seit " + new Date(c.start).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    } else {
      b.textContent = "Einstempeln"; b.className = "btn ok";
      $("#clk-t").textContent = "00:00:00"; $("#clk-s").textContent = "Wer arbeitet woran?";
    }
    var up = function () {
      if (c) $("#clk-t").textContent = fmtDur(Date.now() - c.start);
      var mc = S.clocks[S.me], mt = $("#m-t"); if (mc && mt) mt.textContent = fmtDur(Date.now() - mc.start);
    };
    up(); if (run.length) tick = setInterval(up, 1000);
    if (run.length) { chip.className = "chip run"; chip.lastChild.textContent = run.length === 1 ? staff(run[0]).name.split(" ")[0] + " ist eingestempelt" : run.length + " Mitarbeiter eingestempelt"; }
    else { chip.className = "chip"; chip.lastChild.textContent = isWork ? "4 Mitarbeiter im Einsatz" : "Wochenende"; }
  }
  $("#clk-b").addEventListener("click", function () { stamp($("#clk-who").value, $("#clk-job").value); });
  $("#clk-who").addEventListener("change", renderClock);

  function opts(sel, items, val) { var v = sel.value; sel.innerHTML = items.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>"; }).join(""); sel.value = val || v || (items[0] && items[0][0]); if (sel.selectedIndex < 0) sel.selectedIndex = 0; }
  function fillSelects() {
    var so = STAFF.map(function (s) { return [s.id, s.name]; });
    var jo = S.jobs.filter(function (j) { return j.st !== "neu"; }).map(function (j) { return [j.id, j.id + " · " + j.kunde]; });
    var ja = S.jobs.map(function (j) { return [j.id, j.id + " · " + j.kunde]; });
    opts($("#clk-who"), so); opts($("#clk-job"), jo);
    opts($("#ft-who"), so); opts($("#ft-job"), jo);
    opts($("#ft-date"), week.filter(function (d) { return d <= lastWork; }).reverse().map(function (d) { return [d, short(d) + (d === today ? " (heute)" : "")]; }));
    opts($("#fe-who"), so); opts($("#fe-job"), ja);
    opts($("#fe-d"), plan.map(function (d) { return [d, short(d) + (d === today ? " (heute)" : "")]; }));
    var ts = []; for (var h = 7; h <= 16; h++) { ts.push([("0" + h).slice(-2) + ":00", ("0" + h).slice(-2) + ":00"]); ts.push([("0" + h).slice(-2) + ":30", ("0" + h).slice(-2) + ":30"]); }
    opts($("#fe-t"), ts, $("#fe-t").value || "08:00");
  }

  function renderTime() {
    $("#wk-l").textContent = short(week[0]) + " bis " + short(week[4]);
    var head = "<thead><tr><th>Mitarbeiter</th>" + week.map(function (d) { return '<th class="r' + (d === today ? " today" : "") + '">' + short(d).split(" ")[0] + "</th>"; }).join("") + '<th class="r">Summe</th><th>Soll ' + hrs(38.5) + "</th></tr></thead>";
    var tot = [0, 0, 0, 0, 0], all = 0;
    var rows = STAFF.map(function (s) {
      var sum = 0, cells = week.map(function (d, i) {
        var v = S.time.reduce(function (a, t) { return a + (t.who === s.id && t.date === d ? t.h : 0); }, 0);
        sum += v; tot[i] += v;
        return '<td class="r num' + (d === today ? " today" : "") + '">' + (v ? v.toLocaleString("de-AT") : d > lastWork ? "" : "–") + "</td>";
      }).join("");
      all += sum;
      return '<tr><td><span class="who"><span class="ava" style="--c:' + s.c + '">' + s.short + "</span><span>" + s.name + '<br><small style="color:var(--mu)">' + s.role + (sum > s.soll ? " · " + hrs(sum - s.soll) + " Überstunden" : "") + '</small></span></span></td>' + cells + '<td class="r num"><b>' + hrs(sum) + '</b></td><td><div class="prog' + (sum > s.soll ? " ot" : "") + '" style="--c:' + s.c + ";--w:" + Math.min(100, sum / s.soll * 100) + '%"><span></span></div></td></tr>';
    }).join("");
    var foot = '<tr><td><b>Gesamt</b></td>' + tot.map(function (v, i) { return '<td class="r num' + (week[i] === today ? " today" : "") + '"><b>' + (v ? v.toLocaleString("de-AT") : "") + "</b></td>"; }).join("") + '<td class="r num"><b>' + hrs(all) + "</b></td><td></td></tr>";
    $("#wk-t").innerHTML = head + "<tbody>" + rows + foot + "</tbody>";
    var en = S.time.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }).slice(0, 8);
    $("#en-t").innerHTML = "<thead><tr><th>Tag</th><th>Mitarbeiter</th><th>Auftrag</th><th class=r>Stunden</th><th></th></tr></thead><tbody>" + en.map(function (t) {
      var s = staff(t.who), j = job(t.job) || {};
      return "<tr><td>" + short(t.date) + '</td><td><span class="who"><span class="ava" style="--c:' + s.c + '">' + s.short + "</span>" + s.name.split(" ")[0] + "</span></td><td>" + esc(t.job) + ' <span style="color:var(--mu)">' + esc(j.kunde || "") + (t.note ? " · " + esc(t.note) : "") + '</span></td><td class="r num"><b>' + t.h.toLocaleString("de-AT") + '</b></td><td class="r"><button class="x" type="button" data-del-time="' + t.id + '" aria-label="Buchung löschen"><svg><use href="#i-x"/></svg></button></td></tr>';
    }).join("") + "</tbody>";
  }
  $("#f-time").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, h = Math.round(parseFloat(String(f.h.value).replace(",", ".")) * 4) / 4;
    if (!(h > 0 && h <= 12)) { toast("Bitte zwischen 0,25 und 12 Stunden eingeben"); return; }
    S.time.push({ id: "t" + Date.now(), who: f.who.value, job: f.job.value, date: f.date.value, h: h, note: f.note.value.trim() });
    log(staff(f.who.value).name + ": " + hrs(h) + " nachgetragen (" + f.job.value + ")");
    f.note.value = ""; save(); render(); toast(hrs(h) + " gebucht");
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-del-time]"); if (!b) return;
    S.time = S.time.filter(function (t) { return t.id !== b.getAttribute("data-del-time"); }); save(); render(); toast("Buchung gelöscht");
  });
  $("#csv").addEventListener("click", function () {
    var rows = [["Datum", "Mitarbeiter", "Auftrag", "Kunde", "Stunden", "Notiz"]];
    S.time.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (t) { var j = job(t.job) || {}; rows.push([t.date, staff(t.who).name, t.job, j.kunde || "", String(t.h).replace(".", ","), t.note]); });
    var csv = "﻿" + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(";"); }).join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "stunden-" + week[0] + ".csv";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast("CSV heruntergeladen, öffnet sich in Excel");
  });

  // ---- Aufträge ----
  function renderJobs() {
    $("#kanban").innerHTML = COLS.map(function (c, ci) {
      var js = S.jobs.filter(function (j) { return j.st === c.id; });
      return '<div class="col" data-col="' + c.id + '" style="--c:' + c.c + '"><h4><i></i>' + c.name + "<span>" + js.length + "</span></h4>" + js.map(function (j) {
        var used = jobHrs(j.id), p = used / j.std * 100;
        var act = c.id === "fertig" ? '<button class="btn ok sm" type="button" data-bill="' + j.id + '">Rechnung erstellen</button>' : "";
        return '<article class="job' + (j.fresh ? " is-new" : "") + '" draggable="true" data-job="' + j.id + '"><div class="job__id"><span>' + j.id + "</span><span>" + esc(j.ort) + "</span></div><b>" + esc(j.kunde) + "</b><p>" + esc(j.titel) + "</p>" +
          '<div class="prog' + (p > 100 ? " over" : "") + '" style="--c:' + c.c + ";--w:" + Math.min(100, p) + '%"><span></span></div><div class="job__m"><span>' + hrs(used) + " von " + hrs(j.std) + "</span>" + (p > 100 ? '<span class="pill bad">über Plan</span>' : p > 85 ? '<span class="pill warn">fast aus</span>' : "") + "</div>" + jobIcons(j.id) +
          '<div class="job__a">' + (ci > 0 ? '<button class="btn ghost sm mv" type="button" data-mv="' + j.id + '" data-dir="-1" aria-label="Zurück nach ' + COLS[ci - 1].name + '">←</button>' : "") + act + (ci < 3 ? '<button class="btn ghost sm' + (act ? " mv" : "") + '" type="button" data-mv="' + j.id + '" data-dir="1" aria-label="Weiter nach ' + COLS[ci + 1].name + '">' + (ci === 2 ? "Fertig ✓" : COLS[ci + 1].name + " →") + "</button>" : "") + "</div></article>";
      }).join("") + "</div>";
    }).join("");
    S.jobs.forEach(function (j) { delete j.fresh; });
    renderNK();
  }
  function jobIcons(id) {
    var np = S.pics.filter(function (x) { return x.job === id; }).length, nm = S.msg.filter(function (x) { return x.job === id; }).length;
    return '<div class="job__ic"><span><svg><use href="#i-cam"/></svg>' + np + '</span><span><svg><use href="#i-chat"/></svg>' + nm + '</span><span style="margin-left:auto;color:var(--pop);font-weight:600">Mappe öffnen</span></div>';
  }
  // ---- Nachkalkulation: geplant (Angebot) gegen tatsächlich (Stunden + Material) ----
  function calc(j) {
    var h = jobHrs(j.id), plan = j.std * RATE + j.mat, ist = h * RATE + (j.matIst || 0);
    return { h: h, plan: plan, ist: ist, dh: j.std ? (h - j.std) / j.std * 100 : 0, dm: j.mat ? ((j.matIst || 0) - j.mat) / j.mat * 100 : 0, dev: plan ? (ist - plan) / plan * 100 : 0, done: j.st === "fertig" };
  }
  // Fertige Aufträge: Ist gegen Angebot. Laufende: liegen die Stunden schon über dem Plan?
  function nkState(j, k) {
    var f = function (d) { var r = Math.round(d); return (r > 0 ? "+" : "") + r.toLocaleString("de-AT") + " %"; };
    if (!(k.h > 0 || j.matIst > 0)) return { cls: "mu", big: "–", txt: "Noch nicht begonnen" };
    if (k.done) return k.dev > 0 ? { cls: k.dev > 5 ? "bad" : "warn", big: f(k.dev), txt: "teurer als geplant" } : { cls: "ok", big: f(k.dev), txt: "günstiger als geplant" };
    if (k.dh > 0) return { cls: "bad", big: f(k.dh), txt: "Stunden über Plan" };
    var u = k.h / j.std * 100;
    return { cls: u > 85 ? "warn" : "ok", big: Math.round(u) + " %", txt: "der Stunden verbraucht" };
  }
  function dual(ist, plan, c) {
    var mx = Math.max(ist, plan) || 1;
    return '<div class="dual" style="--w:' + (ist / mx * 100) + "%;--p:" + (plan / mx * 100) + "%;--c:" + c + '"><span></span><i></i></div>';
  }
  function renderNK() {
    var js = S.jobs.filter(function (j) { return j.st !== "neu"; });
    $("#nk-t").innerHTML = "<thead><tr><th>Auftrag</th><th>Stunden Ist / Plan</th><th>Material Ist / Plan</th><th class=r>Kosten bisher</th><th class=r>Stand</th></tr></thead><tbody>" + js.map(function (j) {
      var k = calc(j), st = nkState(j, k), col = k.dh > 0 ? "var(--bad)" : "var(--pop)";
      return '<tr data-open="' + j.id + '"><td><b>' + j.id + "</b> " + esc(j.kunde) + '<br><small style="color:var(--mu)">' + esc(j.titel) + '</small></td><td><div class="nkbar">' + dual(k.h, j.std, col) + '<span class="num">' + hrs(k.h) + " / " + j.std + '</span></div></td><td><div class="nkbar">' + dual(j.matIst || 0, j.mat, (j.matIst || 0) > j.mat ? "var(--warn)" : "var(--ok)") + '<span class="num">' + eur(j.matIst || 0) + " / " + eur(j.mat) + '</span></div></td><td class="r num">' + eur(k.ist) + '<br><small style="color:var(--mu)">von ' + eur(k.plan) + '</small></td><td class="r">' + '<span class="pill ' + st.cls + '">' + (st.cls === "mu" ? st.txt : st.big + " " + st.txt) + "</span></td></tr>";
    }).join("") + "</tbody>";
  }
  function move(id, st) {
    var j = job(id); if (!j || j.st === st) return;
    j.st = st; var name = COLS.filter(function (c) { return c.id === st; })[0].name;
    log("Auftrag " + id + " → " + name); save(); render(); toast(j.kunde + ": " + name);
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"), c = e.target.closest(".job");
    var bt = e.target.closest("button");
    if (o && (!bt || bt === o)) { openMappe(o.getAttribute("data-open"), null, o.getAttribute("data-ctx")); return; }
    if (c && !e.target.closest("button")) { openMappe(c.getAttribute("data-job")); return; }
    var b = e.target.closest("[data-mv]");
    if (b) { var j = job(b.getAttribute("data-mv")), i = COLS.map(function (c) { return c.id; }).indexOf(j.st) + +b.getAttribute("data-dir"); move(j.id, COLS[i].id); return; }
    var bl = e.target.closest("[data-bill]");
    if (bl) {
      var jb = job(bl.getAttribute("data-bill")), h = jobHrs(jb.id), net = Math.round((h * RATE + jb.mat) * 100) / 100, y = now.getFullYear();
      var n = S.inv.reduce(function (a, i) { return Math.max(a, +i.nr.split("-")[1]); }, 0) + 1;
      S.inv.unshift({ nr: y + "-" + n, kunde: jb.kunde, txt: jb.titel + " (" + hrs(h) + " à " + RATE + " € + Material)", net: net, date: today, due: iso(add(now, 14)), paid: null, fresh: true });
      S.jobs = S.jobs.filter(function (x) { return x !== jb; });
      log("Rechnung " + y + "-" + n + " an " + jb.kunde + " erstellt: " + eur(net * (1 + VAT), 2));
      save(); go("inv", true); toast("Rechnung " + y + "-" + n + " erstellt");
    }
  });
  // Ziehen und Ablegen am Computer
  var drag = null;
  document.addEventListener("dragstart", function (e) { var c = e.target.closest && e.target.closest(".job"); if (!c) return; drag = c.getAttribute("data-job"); c.classList.add("is-drag"); try { e.dataTransfer.setData("text/plain", drag); e.dataTransfer.effectAllowed = "move"; } catch (er) {} });
  document.addEventListener("dragend", function () { drag = null; $$(".is-drag,.is-over").forEach(function (el) { el.classList.remove("is-drag", "is-over"); }); });
  document.addEventListener("dragover", function (e) { var c = drag && e.target.closest(".col"); if (!c) return; e.preventDefault(); $$(".col.is-over").forEach(function (x) { if (x !== c) x.classList.remove("is-over"); }); c.classList.add("is-over"); });
  document.addEventListener("drop", function (e) { var c = drag && e.target.closest(".col"); if (!c) return; e.preventDefault(); var id = drag; drag = null; move(id, c.getAttribute("data-col")); });

  $("#job-new").addEventListener("click", function () { var f = $("#f-job"); f.hidden = !f.hidden; if (!f.hidden) f.kunde.focus(); });
  $("#job-cancel").addEventListener("click", function () { $("#f-job").hidden = true; });
  $("#f-job").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target;
    var n = S.jobs.concat([{ id: "A-1047" }]).reduce(function (a, j) { return Math.max(a, +j.id.split("-")[1]); }, 0) + 1;
    S.jobs.unshift({ id: "A-" + n, kunde: f.kunde.value.trim(), titel: f.titel.value.trim(), ort: f.ort.value.trim() || "Musterdorf", st: "neu", std: Math.max(1, +f.std.value || 1), mat: 0, fresh: true });
    log("Neuer Auftrag A-" + n + ": " + f.kunde.value.trim());
    f.reset(); f.hidden = true; save(); render(); toast("Auftrag A-" + n + " angelegt");
  });

  // ---- Rechnungen ----
  var filt = "alle";
  $("#inv-f").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; filt = b.getAttribute("data-f"); $$("#inv-f .tab").forEach(function (t) { t.setAttribute("aria-pressed", t === b); }); renderInv(); });
  function renderInv() {
    var m = today.slice(0, 7), open = S.inv.filter(function (i) { return !i.paid; });
    $("#i-open").textContent = eur(open.reduce(function (a, i) { return a + gross(i); }, 0));
    $("#i-due").textContent = eur(open.filter(isDue).reduce(function (a, i) { return a + gross(i); }, 0));
    $("#i-paid").textContent = eur(S.inv.filter(function (i) { return i.paid && i.paid.slice(0, 7) === m; }).reduce(function (a, i) { return a + gross(i); }, 0));
    $("#i-todo").textContent = S.jobs.filter(function (j) { return j.st === "fertig"; }).length;
    var list = S.inv.filter(function (i) { return filt === "alle" || (filt === "bezahlt" ? i.paid : filt === "faellig" ? isDue(i) : !i.paid); });
    $("#inv-t").innerHTML = "<thead><tr><th>Nr.</th><th>Kunde</th><th>Datum</th><th>Fällig</th><th class=r>Netto</th><th class=r>Brutto</th><th>Status</th><th></th></tr></thead><tbody>" + (list.length ? list.map(function (i) {
      var st = i.paid ? '<span class="pill ok">bezahlt ' + short(i.paid).split(" ")[1] + "</span>" : isDue(i) ? '<span class="pill bad">überfällig</span>' : '<span class="pill info">offen</span>';
      var act = i.paid ? "" : '<button class="btn ok sm" type="button" data-pay="' + i.nr + '">Bezahlt</button>' + (isDue(i) ? ' <button class="btn ghost sm" type="button" data-remind="' + i.nr + '">Erinnern</button>' : "");
      return '<tr' + (i.fresh ? ' style="background:var(--okl)"' : "") + '><td class="num"><b>' + i.nr + "</b></td><td>" + esc(i.kunde) + '<br><small style="color:var(--mu)">' + esc(i.txt) + "</small></td><td>" + short(i.date) + "</td><td>" + short(i.due) + '</td><td class="r num">' + eur(i.net, 2) + '</td><td class="r num"><b>' + eur(gross(i), 2) + "</b></td><td>" + st + '</td><td class="r">' + act + "</td></tr>";
    }).join("") : '<tr><td colspan="8" class="empty">Keine Rechnungen in dieser Ansicht.</td></tr>') + "</tbody>";
    S.inv.forEach(function (i) { delete i.fresh; });
  }
  document.addEventListener("click", function (e) {
    var p = e.target.closest("[data-pay]");
    if (p) { var i = S.inv.filter(function (x) { return x.nr === p.getAttribute("data-pay"); })[0]; i.paid = today; log("Zahlung eingegangen: " + i.kunde + ", " + eur(gross(i), 2)); save(); render(); toast("Rechnung " + i.nr + " ist bezahlt"); return; }
    var r = e.target.closest("[data-remind]");
    if (r) { var k = S.inv.filter(function (x) { return x.nr === r.getAttribute("data-remind"); })[0]; log("Zahlungserinnerung an " + k.kunde + " gesendet"); save(); render(); toast("Erinnerung an " + k.kunde + " vorbereitet (Demo, nichts wird gesendet)"); }
  });

  // ---- Lager ----
  function orderText() {
    var low = S.stock.filter(function (s) { return s.qty < s.min; });
    return low.length ? "Bestellung Haustechnik Kofler\n" + low.map(function (s) { return "• " + (s.max - s.qty) + " " + s.unit + " " + s.name; }).join("\n") : "Nichts zu bestellen. Alle Artikel über dem Mindestbestand.";
  }
  function renderStock() {
    var low = 0;
    $("#stock").innerHTML = S.stock.map(function (s) {
      var cls = s.qty < s.min ? "low" : s.qty < s.min * 1.4 ? "mid" : ""; if (cls === "low") low++;
      return '<div class="stock ' + cls + '"><span><b>' + esc(s.name) + "</b><small>Mindestens " + s.min + " " + s.unit + (cls === "low" ? ' · <span style="color:var(--bad);font-weight:600">nachbestellen</span>' : "") + '</small></span><div class="lvl" title="' + s.qty + " von " + s.max + '"><span style="--w:' + Math.min(100, s.qty / s.max * 100) + '%"></span></div><div class="step"><button type="button" data-q="' + s.id + '" data-n="-1" aria-label="' + esc(s.name) + ' weniger">−</button><output class="num">' + s.qty + '</output><button type="button" data-q="' + s.id + '" data-n="1" aria-label="' + esc(s.name) + ' mehr">+</button></div></div>';
    }).join("");
    $("#st-sum").textContent = S.stock.length + " Artikel · " + low + " unter Minimum";
    $("#order").textContent = orderText();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]"); if (!b) return;
    var s = S.stock.filter(function (x) { return x.id === b.getAttribute("data-q"); })[0], was = s.qty < s.min;
    s.qty = Math.max(0, s.qty + +b.getAttribute("data-n"));
    if (!was && s.qty < s.min) log(s.name + " unter Mindestbestand");
    save(); render();
  });
  $("#order-copy").addEventListener("click", function () {
    var t = orderText();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast("Bestellliste kopiert"); }, function () { toast("Kopieren nicht möglich"); });
    else toast("Kopieren nicht möglich");
  });
  $("#order-in").addEventListener("click", function () {
    var n = 0; S.stock.forEach(function (s) { if (s.qty < s.min) { s.qty = s.max; n++; } });
    if (n) log("Lieferung eingebucht: " + n + " Artikel aufgefüllt");
    save(); render(); toast(n ? n + " Artikel aufgefüllt" : "Es war nichts bestellt");
  });

  // ---- Plantafel ----
  function absOf(who, d) { return S.abs.filter(function (a) { return a.who === who && a.d === d; })[0]; }
  function dayHrs(who, d) { return S.ev.reduce(function (a, e) { return a + (e.who === who && e.d === d ? e.dur || 0 : 0); }, 0); }
  // Auslastung der nächsten fünf Arbeitstage: verplante Stunden gegen Soll (Berufsschule/Urlaub abgezogen).
  function workload(who) {
    var s = staff(who), cap = s.soll - plan.filter(function (d) { return absOf(who, d); }).length * 8;
    var h = plan.reduce(function (a, d) { return a + dayHrs(who, d); }, 0), p = cap ? h / cap * 100 : 0;
    var st = p > 105 ? ["überbucht", "var(--bad)"] : p > 92 ? ["voll", "var(--warn)"] : p >= 60 ? ["gut ausgelastet", "var(--pop)"] : ["Platz frei", "var(--ok)"];
    return { h: h, cap: cap, p: p, txt: st[0], c: st[1] };
  }
  function loadHTML(who) {
    var l = workload(who);
    return '<div class="load" style="--c:' + l.c + '"><div class="load__b"><span style="--w:' + Math.min(100, l.p) + '%"></span></div><div class="load__t"><span>' + hrs(l.h) + " von " + hrs(l.cap) + "</span><b>" + Math.round(l.p) + " % · " + l.txt + "</b></div></div>";
  }
  var picked = null;
  function renderCal() {
    var html = '<div class="bh corner">Team</div>' + plan.map(function (d) { var dt = parse(d); return '<div class="bh' + (d === today ? " is-today" : "") + '">' + WDL[dt.getDay()] + "<small>" + dt.getDate() + ". " + MON[dt.getMonth()] + (d === today ? " · heute" : "") + "</small></div>"; }).join("");
    STAFF.forEach(function (s) {
      html += '<div class="bp"><span class="who"><span class="ava" style="--c:' + s.c + '">' + s.short + "</span><span>" + s.name.split(" ")[0] + "<small>" + s.role + "</small></span></span>" + loadHTML(s.id) + "</div>";
      plan.forEach(function (d) {
        var ab = absOf(s.id, d);
        if (ab) { html += '<div class="cell abs" data-cell="' + s.id + "|" + d + '">' + esc(ab.txt) + "</div>"; return; }
        var evs = S.ev.filter(function (e) { return e.who === s.id && e.d === d; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; }), sum = dayHrs(s.id, d);
        html += '<div class="cell' + (d === today ? " is-today" : "") + '" data-cell="' + s.id + "|" + d + '">' + evs.map(function (e) {
          var j = job(e.job) || { kunde: e.job, titel: "" };
          return '<div class="ev' + (picked === e.id ? " is-picked" : "") + (e.moved ? " is-moved" : "") + '" style="--c:' + s.c + '" data-ev="' + e.id + '" tabindex="0" role="button" aria-label="' + esc(j.kunde) + " " + e.t + ', zum Verschieben auswählen"><button class="op" type="button" data-open="' + e.job + '" aria-label="Projektmappe öffnen"><svg><use href="#i-folder"/></svg></button><b>' + esc(j.kunde) + "</b><span><em>" + e.t + "</em> · " + (e.dur || 0).toLocaleString("de-AT") + " h</span><span>" + esc(e.note || j.titel) + "</span></div>";
        }).join("") + (sum > 9 ? '<span class="sum">' + sum.toLocaleString("de-AT") + " h!</span>" : "") + "</div>";
      });
    });
    $("#board").innerHTML = html;
    $("#board").classList.toggle("is-picking", !!picked);
    S.ev.forEach(function (e) { delete e.moved; });
    var tot = STAFF.reduce(function (a, s) { var l = workload(s.id); a.h += l.h; a.c += l.cap; return a; }, { h: 0, c: 0 });
    $("#pl-chip").lastChild.textContent = "Team-Auslastung " + Math.round(tot.h / tot.c * 100) + " %";
    var touch = matchMedia("(hover: none)").matches;
    $("#pl-hint").textContent = picked ? "Jetzt auf das Feld tippen, wohin der Einsatz soll. Nochmal auf den Einsatz tippen bricht ab." : touch ? "Einsatz antippen, dann auf das Feld tippen, wohin er soll." : "Einsätze mit der Maus auf einen anderen Tag oder Mitarbeiter ziehen.";
  }
  function moveEv(id, cell) {
    var e = S.ev.filter(function (x) { return x.id === id; })[0]; picked = null;
    if (!e || !cell) { renderCal(); return; }
    var p = cell.getAttribute("data-cell").split("|"), who = p[0], d = p[1];
    if (absOf(who, d)) { renderCal(); toast(staff(who).name.split(" ")[0] + " ist an dem Tag in der " + absOf(who, d).txt); return; }
    if (e.who === who && e.d === d) { renderCal(); return; }
    e.who = who; e.d = d; e.moved = true;
    var j = job(e.job) || {}, h = dayHrs(who, d);
    log("Einsatz " + (j.kunde || e.job) + " → " + staff(who).name.split(" ")[0] + ", " + short(d));
    save(); render();
    toast(h > 9 ? "Achtung: " + staff(who).name.split(" ")[0] + " hat am " + short(d).split(" ")[0] + " jetzt " + hrs(h) : (j.kunde || "") + " → " + staff(who).name.split(" ")[0] + ", " + short(d));
  }
  // Ziehen mit der Maus, Antippen + Ziel antippen mit Finger oder Tastatur
  var pd = null, ghost = null;
  $("#board").addEventListener("pointerdown", function (e) {
    var ev = e.target.closest(".ev"); if (!ev || e.target.closest("button") || e.button > 0) return;
    pd = { id: ev.getAttribute("data-ev"), x: e.clientX, y: e.clientY, el: ev, mouse: e.pointerType === "mouse", drag: false };
  });
  addEventListener("pointermove", function (e) {
    if (!pd || !pd.mouse) return;
    if (!pd.drag && Math.abs(e.clientX - pd.x) + Math.abs(e.clientY - pd.y) > 6) {
      pd.drag = true; ghost = pd.el.cloneNode(true); ghost.classList.add("is-ghost"); ghost.classList.remove("is-picked"); document.body.appendChild(ghost); pd.el.classList.add("is-src");
    }
    if (pd.drag) {
      e.preventDefault(); ghost.style.left = e.clientX - 70 + "px"; ghost.style.top = e.clientY - 20 + "px";
      var c = document.elementFromPoint(e.clientX, e.clientY); c = c && c.closest(".cell");
      $$(".cell.is-over").forEach(function (x) { if (x !== c) x.classList.remove("is-over"); }); if (c && !c.classList.contains("abs")) c.classList.add("is-over");
    }
  });
  addEventListener("pointerup", function (e) {
    if (!pd) return; var d = pd; pd = null;
    if (d.drag) { ghost.remove(); ghost = null; var c = document.elementFromPoint(e.clientX, e.clientY); moveEv(d.id, c && c.closest(".cell")); return; }
    picked = picked === d.id ? null : d.id; renderCal();
  });
  addEventListener("pointercancel", function () { if (pd && pd.drag && ghost) { ghost.remove(); ghost = null; renderCal(); } pd = null; });
  $("#board").addEventListener("click", function (e) {
    if (!picked || e.target.closest(".ev") || e.target.closest("button")) return;
    var c = e.target.closest(".cell"); if (c) moveEv(picked, c);
  });
  $("#board").addEventListener("keydown", function (e) {
    var ev = e.target.closest(".ev"); if (!ev || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault(); picked = picked === ev.getAttribute("data-ev") ? null : ev.getAttribute("data-ev"); renderCal();
  });
  $("#f-ev").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, j = job(f.job.value) || {};
    if (absOf(f.who.value, f.d.value)) { toast(staff(f.who.value).name.split(" ")[0] + " ist an dem Tag in der " + absOf(f.who.value, f.d.value).txt); return; }
    S.ev.push({ id: "e" + Date.now(), d: f.d.value, t: f.t.value, who: f.who.value, job: f.job.value, note: j.titel, dur: +f.dur.value, moved: true });
    log("Einsatz " + short(f.d.value) + " " + f.t.value + ": " + staff(f.who.value).name.split(" ")[0] + " bei " + (j.kunde || ""));
    save(); render(); toast("Einsatz eingeplant");
  });

  // ---- Projektmappe: alles zu einem Auftrag (Überblick mit Nachkalkulation, Fotos, Chat) ----
  var MP = { job: null, tab: "info", ctx: "office", typing: null };
  function openMappe(id, tab, ctx) {
    if (!job(id)) { toast("Der Auftrag ist schon verrechnet"); return; }
    MP.job = id; MP.tab = tab || "info"; MP.ctx = ctx || (cur === "mont" ? "phone" : "office");
    drawMappe(true);
  }
  function closeMappe() {
    var was = MP.job; MP.job = null;
    $("#mappe").hidden = true; $("#scrim").hidden = true; $("#m-sheet").classList.remove("is-on");
    document.documentElement.style.overflow = "";
    var back = was && document.querySelector('.job[data-job="' + was + '"]'); if (back && MP.ctx === "office") back.focus && back.focus();
  }
  function dayLabel(d) { return d === today ? "Heute" : d === iso(add(now, -1)) ? "Gestern" : short(d); }
  function chatHTML(id, me) {
    var ms = S.msg.filter(function (m) { return m.job === id; }), last = "", out = "";
    if (!ms.length) out += '<p class="empty" style="text-align:center">Noch keine Nachrichten. Schreib die erste.</p>';
    ms.forEach(function (m) {
      if (m.d !== last) { out += '<span class="chat-day">' + dayLabel(m.d) + "</span>"; last = m.d; }
      var p = person(m.who);
      out += '<div class="msg' + (m.who === me ? " me" : "") + (m.fresh ? " is-new" : "") + '"><span class="ava" style="--c:' + p.c + '">' + p.short + '</span><div class="bub"><small>' + p.name.split(" ")[0] + " · " + m.t + "</small>" + esc(m.txt) + "</div></div>";
      delete m.fresh;
    });
    if (MP.typing && MP.typing.job === id) { var tp = person(MP.typing.who); out += '<div class="msg typing"><span class="ava" style="--c:' + tp.c + '">' + tp.short + '</span><div class="bub"><i></i><i></i><i></i></div></div>'; }
    return '<div class="chat">' + out + "</div>";
  }
  function picsHTML(id, who) {
    var ps = S.pics.filter(function (x) { return x.job === id; }).slice().reverse();
    return '<div class="pics"><button class="pic add" type="button" data-addpic="' + id + '" data-who="' + who + '"><svg><use href="#i-cam"/></svg>Foto aufnehmen<small style="color:var(--mu);font-weight:500">oder aus der Galerie</small></button>' + ps.map(function (x) {
      var p = person(x.who);
      return '<button class="pic" type="button" data-pic="' + x.id + '"><img src="' + x.src + '" alt="' + esc(x.cap) + '" loading="lazy"><span><b>' + esc(x.cap) + "</b>" + p.name.split(" ")[0] + " · " + dayLabel(x.d) + "</span></button>";
    }).join("") + "</div>";
  }
  function infoHTML(j) {
    var k = calc(j), st = nkState(j, k);
    var team = STAFF.map(function (s) { return [s, S.time.reduce(function (a, t) { return a + (t.job === j.id && t.who === s.id ? t.h : 0); }, 0)]; }).filter(function (x) { return x[1] > 0; });
    var evs = S.ev.filter(function (e) { return e.job === j.id; }).sort(function (a, b) { return (a.d + a.t) < (b.d + b.t) ? -1 : 1; });
    return '<div class="mp-sec"><h4>Nachkalkulation <small>Angebot gegen Ist</small></h4><div class="big-dev ' + st.cls + '"><strong>' + st.big + "</strong><p>" + st.txt + (k.done ? "" : '<br>Ist-Kosten bisher <b style="color:var(--ink)">' + eur(k.ist) + "</b> von " + eur(k.plan)) + "</p></div>" +
      '<div class="nk" style="margin-top:14px"><div class="nk-r"><div class="lab">Arbeitsstunden<small>' + hrs(k.h) + " von " + hrs(j.std) + "</small></div>" + dual(k.h, j.std, k.dh > 0 ? "var(--bad)" : "var(--pop)") + "</div>" +
      '<div class="nk-r"><div class="lab">Material<small>' + eur(j.matIst || 0) + " von " + eur(j.mat) + "</small></div>" + dual(j.matIst || 0, j.mat, (j.matIst || 0) > j.mat ? "var(--warn)" : "var(--ok)") + "</div>" +
      '<div class="nk-r"><div class="lab">Gesamt<small>' + eur(k.ist) + " von " + eur(k.plan) + "</small></div>" + dual(k.ist, k.plan, k.ist > k.plan ? "var(--bad)" : "var(--ink)") + '</div><p class="sub" style="margin:0">Der Strich zeigt den Plan. Stunden kommen aus der Stempeluhr, Material aus dem Lager.</p></div></div>' +
      '<div class="mp-sec"><h4>Wer war dort <small>diese Woche' + (j.vorher ? " · früher " + hrs(j.vorher) : "") + '</small></h4><ul class="list">' + (team.length ? team.map(function (x) { return '<li><span class="ava" style="--c:' + x[0].c + '">' + x[0].short + '</span><span class="grow"><span class="t">' + x[0].name + '</span><span class="s">' + x[0].role + '</span></span><b class="num">' + hrs(x[1]) + "</b></li>"; }).join("") : '<li class="empty">Diese Woche noch keine Stunden.</li>') + "</ul></div>" +
      '<div class="mp-sec"><h4>Eingeplant <small>auf der Plantafel</small></h4><ul class="list">' + (evs.length ? evs.map(function (e) { var s = staff(e.who); return '<li><span class="time">' + short(e.d).split(" ")[0] + '</span><span class="ava" style="--c:' + s.c + '">' + s.short + '</span><span class="grow"><span class="t">' + e.t + " · " + (e.dur || 0).toLocaleString("de-AT") + " h</span><span class=s>" + esc(e.note || "") + "</span></span></li>"; }).join("") : '<li class="empty">Noch nicht eingeplant.</li>') + "</ul></div>";
  }
  function drawMappe(first) {
    var j = job(MP.job); if (!j) { closeMappe(); return; }
    var phone = MP.ctx === "phone", host = phone ? $("#m-sheet") : $("#mappe"), me = phone ? S.me : "an";
    var col = COLS.filter(function (c) { return c.id === j.st; })[0];
    var np = S.pics.filter(function (x) { return x.job === j.id; }).length, nm = S.msg.filter(function (x) { return x.job === j.id; }).length;
    var tabs = [["info", "Überblick", ""], ["pics", "Fotos", np], ["chat", "Chat", nm]];
    var body = MP.tab === "pics" ? picsHTML(j.id, me) : MP.tab === "chat" ? chatHTML(j.id, me) : infoHTML(j);
    host.innerHTML = '<div class="mp-h">' + (phone ? '<div class="grab"></div>' : "") + '<div class="row1"><svg style="width:15px;height:15px"><use href="#i-folder"/></svg><span class="mp-lab">Projektmappe · </span>' + j.id + " · " + esc(j.ort) + ' <span class="pill" style="background:color-mix(in srgb,' + col.c + ' 14%,#fff);color:' + col.c + '">' + col.name + '</span><button class="x" type="button" data-close-mappe aria-label="Mappe schließen"><svg><use href="#i-x"/></svg></button></div><h3>' + esc(j.kunde) + "</h3><p>" + esc(j.titel) + '</p><div class="mp-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" data-mtab="' + t[0] + '" aria-selected="' + (MP.tab === t[0]) + '">' + t[1] + (t[2] !== "" ? "<span>" + t[2] + "</span>" : "") + "</button>"; }).join("") + '</div></div><div class="mp-b">' + body + "</div>" +
      (MP.tab === "chat" ? '<form class="chat-f" data-chat="' + j.id + '"><input name="t" maxlength="200" autocomplete="off" placeholder="Nachricht an ' + (phone ? "das Büro" : "die Baustelle") + '" aria-label="Nachricht"><button type="submit" aria-label="Senden"><svg><use href="#i-send"/></svg></button></form>' : "");
    if (phone) host.classList.add("is-on");
    else { host.hidden = false; $("#scrim").hidden = false; document.documentElement.style.overflow = "hidden"; }
    var b = $(".mp-b", host); if (MP.tab === "chat") b.scrollTop = b.scrollHeight;
    if (first) { var c = $("[data-close-mappe]", host); if (c && !phone) c.focus(); }
  }
  var REPLY_B = ["Passt, mach ich 👍", "Alles klar, ich schau mir das morgen in der Früh an.", "Material ist schon im Bus.", "Ok, ich melde mich wenn es fertig ist."];
  var REPLY_Q = ["Gute Frage, ich kläre das gleich und melde mich.", "Ja, passt so. Ich gebe dir am Nachmittag Bescheid.", "Schau ich mir vor Ort an und schreib dir gleich zurück."];
  var REPLY_O = ["Danke dir, ich gebe es an den Kunden weiter.", "Passt, hab's in der Mappe gesehen 👍", "Super, danke! Rechnung schreib ich dann gleich.", "Alles klar, ich bestell das nach."];
  document.addEventListener("submit", function (e) {
    var f = e.target.closest(".chat-f"); if (!f) return; e.preventDefault();
    var txt = f.t.value.trim(); if (!txt) return;
    var id = f.getAttribute("data-chat"), phone = MP.ctx === "phone", me = phone ? S.me : "an", hm = function () { return new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };
    S.msg.push({ id: "m" + Date.now(), job: id, who: me, d: today, t: hm(), txt: txt, fresh: true });
    save(); drawMappe(); $(".chat-f input", phone ? $("#m-sheet") : $("#mappe")).focus();
    // Demo: die Gegenseite antwortet kurz darauf
    var ev = S.ev.filter(function (x) { return x.job === id && x.who !== "st"; })[0] || S.ev.filter(function (x) { return x.job === id; })[0];
    var who = phone ? "an" : ev ? ev.who : "st", pool = /\?\s*$/.test(txt) ? REPLY_Q : phone ? REPLY_O : REPLY_B;
    setTimeout(function () { MP.typing = { job: id, who: who }; if (MP.job === id && MP.tab === "chat") drawMappe(); }, 650);
    setTimeout(function () {
      MP.typing = null;
      S.msg.push({ id: "m" + Date.now(), job: id, who: who, d: today, t: hm(), txt: pool[S.msg.length % pool.length], fresh: true });
      log("Nachricht von " + person(who).name.split(" ")[0] + " zu " + id); save();
      if (MP.job === id && MP.tab === "chat") { var inp = $(".chat-f input", phone ? $("#m-sheet") : $("#mappe")), v = inp ? inp.value : ""; drawMappe(); var n = $(".chat-f input", phone ? $("#m-sheet") : $("#mappe")); if (n) { n.value = v; n.focus(); } }
      else toast(person(who).name.split(" ")[0] + " hat geantwortet");
      if (cur === "jobs") renderJobs(); if (cur === "mont") renderMont();
    }, 2300);
  });
  // Fotos: verkleinert als JPEG im Browser speichern
  var picFor = null;
  function readPhoto(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () { var k = Math.min(1, 960 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", .72)); };
      im.onerror = function () { toast("Das Bild lässt sich nicht öffnen"); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function askPhoto(id, who) { picFor = { job: id, who: who }; $("#pic-in").value = ""; $("#pic-in").click(); }
  $("#pic-in").addEventListener("change", function () {
    var f = this.files && this.files[0], t = picFor; if (!f || !t) return;
    readPhoto(f, function (src) {
      var own = S.pics.filter(function (x) { return x.src.slice(0, 5) === "data:"; });
      if (own.length >= 8) S.pics.splice(S.pics.indexOf(own[0]), 1);
      S.pics.push({ id: "p" + Date.now(), job: t.job, src: src, who: t.who, d: today, cap: "Neues Foto von der Baustelle" });
      log(person(t.who).name.split(" ")[0] + " hat ein Foto zu " + t.job + " abgelegt");
      save(); toast("Foto bei " + ((job(t.job) || {}).kunde || t.job) + " abgelegt");
      if (MP.job === t.job) { MP.tab = "pics"; drawMappe(); }
      render();
    });
  });
  document.addEventListener("click", function (e) {
    var t;
    if (e.target.closest("[data-close-mappe]") || e.target === $("#scrim")) { closeMappe(); return; }
    if ((t = e.target.closest("[data-mtab]"))) { MP.tab = t.getAttribute("data-mtab"); drawMappe(); return; }
    if ((t = e.target.closest("[data-addpic]"))) { askPhoto(t.getAttribute("data-addpic"), t.getAttribute("data-who")); return; }
    if ((t = e.target.closest("[data-pic]"))) {
      var p = S.pics.filter(function (x) { return x.id === t.getAttribute("data-pic"); })[0], lb = $("#lbox");
      $("img", lb).src = p.src; $("img", lb).alt = p.cap; $("p", lb).textContent = p.cap + " · " + person(p.who).name + " · " + dayLabel(p.d); lb.hidden = false; $(".x", lb).focus(); return;
    }
    if (e.target.closest("[data-lbox-close]") || e.target === $("#lbox")) { $("#lbox").hidden = true; return; }
    if ((t = e.target.closest("[data-me]"))) { S.me = t.getAttribute("data-me"); $("#m-sheet").classList.remove("is-on"); MP.job = null; save(); renderMont(); return; }
    if (e.target.closest("[data-mstamp]")) { stamp(S.me, e.target.closest("[data-mstamp]").getAttribute("data-mstamp")); return; }
    if ((t = e.target.closest("[data-mpic]"))) { askPhoto(t.getAttribute("data-mpic"), S.me); return; }
    if ((t = e.target.closest("[data-mchat]"))) { openMappe(t.getAttribute("data-mchat"), "chat", "phone"); return; }
    if ((t = e.target.closest("[data-mmap]"))) { openMappe(t.getAttribute("data-mmap"), "info", "phone"); }
  });
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!$("#lbox").hidden) { $("#lbox").hidden = true; return; }
    if (MP.job) closeMappe(); else if (picked) { picked = null; renderCal(); }
  });

  // ---- Monteur-App ----
  function renderMont() {
    var me = staff(S.me), c = S.clocks[S.me], d0 = plan[0], hh = now.getHours();
    $("#m-who").innerHTML = STAFF.map(function (s) { return '<button type="button" data-me="' + s.id + '" class="' + (s.id === S.me ? "is-on" : "") + '" aria-pressed="' + (s.id === S.me) + '"><span class="ava" style="--c:' + s.c + '">' + s.short + "</span>" + s.name.split(" ")[0] + "</button>"; }).join("");
    $("#m-clock").textContent = new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    var mine = function (d) { return S.ev.filter(function (e) { return e.who === S.me && e.d === d; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; }); };
    var todays = mine(d0), next = todays[0] || plan.map(mine).filter(function (x) { return x.length; }).map(function (x) { return x[0]; })[0];
    var stampJob = c ? c.job : next ? next.job : (S.jobs.filter(function (j) { return j.st === "arbeit"; })[0] || S.jobs[0]).id, sj = job(stampJob) || {};
    var nm = function (id) { return S.msg.filter(function (m) { return m.job === id; }).length; };
    var wk = S.time.reduce(function (a, t) { return a + (t.who === S.me && week.indexOf(t.date) >= 0 ? t.h : 0); }, 0);
    var out = '<div class="m-hi"><span class="ava" style="--c:' + me.c + '">' + me.short + "</span><div><h4>" + (hh < 11 ? "Guten Morgen" : "Servus") + ", " + me.name.split(" ")[0] + "</h4><small>" + WDL[now.getDay()] + ", " + now.getDate() + ". " + MON[now.getMonth()] + " · " + me.role + "</small></div></div>";
    out += '<div class="m-clk"><div><div class="t" id="m-t">' + (c ? fmtDur(Date.now() - c.start) : "00:00:00") + "</div><small>" + (c ? "auf " + esc(sj.kunde || "") + " seit " + new Date(c.start).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : "Stempeln auf " + esc(sj.kunde || "")) + '</small></div><button type="button" class="' + (c ? "run" : "") + '" data-mstamp="' + stampJob + '">' + (c ? "Aus-<br>stempeln" : "Ein-<br>stempeln") + "</button></div>";
    out += '<div class="m-h">' + (d0 === today ? "Heute" : "Nächster Arbeitstag") + "<small>" + short(d0) + "</small></div>";
    var ab = absOf(S.me, d0);
    if (ab) out += '<div class="m-job"><h5>' + esc(ab.txt) + '</h5><p>Ganzer Tag, keine Einsätze.</p></div>';
    else if (!todays.length) out += '<div class="m-job"><h5>Noch nichts eingeplant</h5><p>Das Büro trägt dich auf der Plantafel ein.</p></div>';
    todays.forEach(function (e, i) {
      var j = job(e.job) || { kunde: e.job, titel: "", ort: "" }, n = nm(e.job);
      out += '<div class="m-job' + (i === 0 ? " is-now" : "") + '"><div class="row1"><span><b>' + e.t + "</b> · " + (e.dur || 0).toLocaleString("de-AT") + " h</span><span>" + e.job + "</span></div><h5>" + esc(j.kunde) + '</h5><p><svg><use href="#i-pin"/></svg>' + esc(j.ort) + " · " + esc(e.note || j.titel) + '</p><div class="m-acts"><button type="button" data-mpic="' + e.job + '"><svg><use href="#i-cam"/></svg>Foto</button><button type="button" data-mchat="' + e.job + '"><svg><use href="#i-chat"/></svg>Chat' + (n ? "<i>" + n + "</i>" : "") + '</button><button type="button" data-mmap="' + e.job + '"><svg><use href="#i-folder"/></svg>Mappe</button></div></div>';
    });
    out += '<div class="m-h">Meine Woche<small>' + hrs(wk) + " gestempelt</small></div>";
    out += '<div class="m-wk"><div class="load" style="--c:var(--pop)"><div class="load__b"><span style="--w:' + Math.min(100, wk / me.soll * 100) + '%"></span></div><div class="load__t"><span>Stunden diese Woche</span><b>' + hrs(wk) + " von " + hrs(me.soll) + "</b></div></div></div>";
    out += '<div class="m-h">Als Nächstes</div>' + plan.slice(1).map(function (d) {
      var es = mine(d), a = absOf(S.me, d), j = es[0] && job(es[0].job);
      return '<div class="m-day"><b>' + short(d).split(" ")[0] + "</b><span>" + (a ? "<em>" + esc(a.txt) + "</em>" : es.length ? "<em>" + esc(j ? j.kunde : es[0].job) + "</em> · " + es[0].t + (es.length > 1 ? " +" + (es.length - 1) + " weitere" : "") : "frei") + "</span></div>";
    }).join("");
    $("#m-body").innerHTML = out;
    var ps = S.pics.filter(function (x) { return x.who !== "an"; }).slice(-3).reverse(), lm = S.msg.filter(function (m) { return m.who !== "an"; }).slice(-1)[0];
    $("#m-feed").innerHTML = '<div class="mfeed">' + ps.map(function (x) { var p = person(x.who), j = job(x.job) || {}; return '<button class="pic" type="button" data-pic="' + x.id + '"><img src="' + x.src + '" alt="' + esc(x.cap) + '" loading="lazy"><span><b>' + esc(j.kunde || x.job) + "</b>" + p.name.split(" ")[0] + " · " + dayLabel(x.d) + "</span></button>"; }).join("") + "</div>" +
      (lm ? '<button type="button" class="mfeed-m" data-ctx="office" data-open="' + lm.job + '"><span class="ava" style="--c:' + person(lm.who).c + '">' + person(lm.who).short + "</span><span><small>" + person(lm.who).name.split(" ")[0] + " an das Büro · " + esc((job(lm.job) || {}).kunde || lm.job) + "</small>" + esc(lm.txt) + "</span></button>" : "");
  }

  // ---- Zeichnen ----
  function badges() {
    var due = S.inv.filter(isDue).length, fin = S.jobs.filter(function (j) { return j.st === "fertig"; }).length, low = S.stock.filter(function (s) { return s.qty < s.min; }).length;
    $("#b-inv").textContent = due || ""; $("#b-jobs").textContent = fin || ""; $("#b-lager").textContent = low || ""; $("#b-zeit").textContent = running().length || "";
  }
  function render() {
    fillSelects(); renderClock(); badges();
    if (cur === "home") renderHome();
    if (cur === "zeit") renderTime();
    if (cur === "jobs") renderJobs();
    if (cur === "inv") renderInv();
    if (cur === "lager") renderStock();
    if (cur === "cal") renderCal();
    if (cur === "mont") renderMont();
  }

  var rw = innerWidth;
  addEventListener("resize", function () { if (cur === "home" && Math.abs(innerWidth - rw) > 40) { rw = innerWidth; renderHome(); } });
  load();
  var h0 = (location.hash || "").slice(1);
  if (["home", "zeit", "jobs", "inv", "lager", "cal", "mont"].indexOf(h0) >= 0) go(h0); else render();
})();
