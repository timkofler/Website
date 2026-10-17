// Betriebs-Dashboard "Haustechnik Kofler": Stundenerfassung, Aufträge, Rechnungen, Lager und Termine.
// Alles läuft im Browser. Musterdaten werden pro Tag neu erzeugt, Änderungen bleiben im localStorage.
(function () {
  var KEY = "tk-dash-kofler-v1", RATE = 68, VAT = 0.2;
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
  function staff(id) { return STAFF.filter(function (s) { return s.id === id; })[0] || STAFF[0]; }

  // ---- Musterdaten ----
  function seed() {
    var r = 7; function rnd() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    var jobs = [
      { id: "A-1041", kunde: "Fam. Huber", titel: "Badsanierung mit Walk-in-Dusche", ort: "Musterdorf", st: "arbeit", std: 160, mat: 6800 },
      { id: "A-1043", kunde: "Bäckerei Kornfeld", titel: "Warmwasserspeicher & Leitungen neu", ort: "Musterdorf", st: "arbeit", std: 56, mat: 1650 },
      { id: "A-1039", kunde: "Fam. Berger", titel: "Rohrbruch Küche beheben", ort: "Oberau", st: "fertig", std: 7, mat: 240 },
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
    var ev = [], tpl = [
      [0, "07:30", "lu", "A-1041", "Fliesen Dusche, Abdichtung"], [0, "07:30", "jo", "A-1041", "mit Lukas"], [0, "08:00", "ma", "A-1043", "Speicher anschließen"], [0, "13:30", "st", "A-1045", "Beratung vor Ort"],
      [1, "07:30", "lu", "A-1041", "Vorwandinstallation"], [1, "08:00", "st", "A-1044", "Wartung Teil 1"], [1, "09:00", "ma", "A-1046", "Enthärter montieren"], [1, "14:00", "jo", "A-1047", "E-Check mit Stefan"],
      [2, "07:30", "lu", "A-1041", "Sanitärkeramik"], [2, "08:00", "st", "A-1044", "Wartung Teil 2"], [2, "10:00", "ma", "A-1043", "Abnahme mit Kunde"],
      [3, "07:30", "lu", "A-1041", "Fertigstellung"], [3, "07:30", "jo", "A-1041", "mit Lukas"], [3, "08:30", "st", "A-1047", "FI-Schalter tauschen"],
      [4, "08:00", "ma", "A-1046", "Einschulung Kunde"], [4, "12:00", "st", "A-1045", "Angebot besprechen"]
    ];
    tpl.forEach(function (t, i) { ev.push({ id: "e" + i, d: plan[t[0]], t: t[1], who: t[2], job: t[3], note: t[4] }); });
    var feed = [
      { t: iso(add(now, -1)), txt: "Zahlung eingegangen: Tischlerei Brandl, 3.912 €" },
      { t: iso(add(now, -1)), txt: "Auftrag A-1039 als fertig markiert" },
      { t: iso(add(now, -2)), txt: "Neue Anfrage über die Webseite: Fam. Leitner" }
    ];
    return { day: today, jobs: jobs, time: time, inv: inv, stock: stock, ev: ev, feed: feed, clock: null, hidden: [] };
  }

  var S;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.day === today) { S = s; return; } } catch (e) {}
    S = seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function log(txt) { S.feed.unshift({ t: today, txt: txt, now: true }); S.feed = S.feed.slice(0, 12); }
  function job(id) { return S.jobs.filter(function (j) { return j.id === id; })[0]; }
  function jobHrs(id) { return S.time.reduce(function (a, t) { return a + (t.job === id ? t.h : 0); }, 0); }
  function gross(i) { return Math.round(i.net * (1 + VAT) * 100) / 100; }
  function isDue(i) { return !i.paid && i.due < today; }
  var toastT;
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("is-on"); }, 2600); }

  // ---- Navigation ----
  var cur = "home";
  function go(v, scroll) {
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
      return '<li><span class="time">' + e.t + '</span><span class="ava" style="--c:' + s.c + '">' + s.short + '</span><span class="grow"><span class="t">' + esc(j.kunde || "") + '</span><span class="s">' + esc(j.titel || "") + (e.note ? " · " + esc(e.note) : "") + "</span></span></li>"; }).join("") : '<li class="empty">Keine Termine eingetragen.</li>';

    var low = S.stock.filter(function (s) { return s.qty < s.min; });
    $("#low-l").innerHTML = low.length ? low.map(function (s) { return '<li><span class="grow"><span class="t">' + esc(s.name) + '</span><span class="s">Mindestbestand ' + s.min + " " + s.unit + '</span></span><span class="pill bad">' + s.qty + " " + s.unit + "</span></li>"; }).join("") : '<li class="empty">Alles auf Lager. 👍</li>';
    $("#feed-l").innerHTML = S.feed.slice(0, 5).map(function (f) { return '<li><span class="grow"><span class="t" style="font-weight:500">' + esc(f.txt) + '</span><span class="s">' + (f.t === today ? (f.now ? "gerade eben" : "heute") : short(f.t)) + "</span></span></li>"; }).join("");
  }

  // ---- Stempeluhr ----
  var tick;
  function fmtDur(ms) { var s = Math.floor(ms / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (n) { return ("0" + n).slice(-2); }).join(":"); }
  function renderClock() {
    var c = S.clock, b = $("#clk-b"), chip = $("#clock-chip");
    clearInterval(tick);
    $("#clk-who").disabled = $("#clk-job").disabled = !!c;
    if (c) {
      var s = staff(c.who), j = job(c.job) || {};
      $("#clk-who").value = c.who; $("#clk-job").value = c.job;
      b.textContent = "Ausstempeln"; b.className = "btn bad";
      $("#clk-s").textContent = s.name + " · " + (j.kunde || "") + " seit " + new Date(c.start).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
      var up = function () { $("#clk-t").textContent = fmtDur(Date.now() - c.start); };
      up(); tick = setInterval(up, 1000);
      chip.className = "chip run"; chip.lastChild.textContent = s.name.split(" ")[0] + " ist eingestempelt";
    } else {
      b.textContent = "Einstempeln"; b.className = "btn ok";
      $("#clk-t").textContent = "00:00:00"; $("#clk-s").textContent = "Wer arbeitet woran?";
      chip.className = "chip"; chip.lastChild.textContent = isWork ? "4 Mitarbeiter im Einsatz" : "Wochenende";
    }
  }
  $("#clk-b").addEventListener("click", function () {
    if (!S.clock) {
      S.clock = { who: $("#clk-who").value, job: $("#clk-job").value, start: Date.now() };
      log(staff(S.clock.who).name + " eingestempelt auf " + S.clock.job);
      toast("Eingestempelt. Die Zeit läuft.");
    } else {
      // Gebucht wird auf die Viertelstunde aufgerundet, mindestens 0,25 h.
      var h = Math.max(.25, Math.ceil((Date.now() - S.clock.start) / 900000) / 4);
      S.time.push({ id: "t" + Date.now(), who: S.clock.who, job: S.clock.job, date: today, h: h, note: "Stempeluhr" });
      log(staff(S.clock.who).name + ": " + hrs(h) + " auf " + S.clock.job + " gebucht");
      toast(hrs(h) + " auf " + S.clock.job + " gebucht");
      S.clock = null;
    }
    save(); render();
  });

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
          '<div class="prog' + (p > 100 ? " over" : "") + '" style="--c:' + c.c + ";--w:" + Math.min(100, p) + '%"><span></span></div><div class="job__m"><span>' + hrs(used) + " von " + hrs(j.std) + "</span>" + (p > 100 ? '<span class="pill bad">über Plan</span>' : p > 85 ? '<span class="pill warn">fast aus</span>' : "") + "</div>" +
          '<div class="job__a">' + (ci > 0 ? '<button class="btn ghost sm mv" type="button" data-mv="' + j.id + '" data-dir="-1" aria-label="Zurück nach ' + COLS[ci - 1].name + '">←</button>' : "") + act + (ci < 3 ? '<button class="btn ghost sm' + (act ? " mv" : "") + '" type="button" data-mv="' + j.id + '" data-dir="1" aria-label="Weiter nach ' + COLS[ci + 1].name + '">' + (ci === 2 ? "Fertig ✓" : COLS[ci + 1].name + " →") + "</button>" : "") + "</div></article>";
      }).join("") + "</div>";
    }).join("");
    S.jobs.forEach(function (j) { delete j.fresh; });
  }
  function move(id, st) {
    var j = job(id); if (!j || j.st === st) return;
    j.st = st; var name = COLS.filter(function (c) { return c.id === st; })[0].name;
    log("Auftrag " + id + " → " + name); save(); render(); toast(j.kunde + ": " + name);
  }
  document.addEventListener("click", function (e) {
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

  // ---- Termine ----
  function renderCal() {
    $("#legend").innerHTML = STAFF.map(function (s) { return '<button type="button" data-hide="' + s.id + '" aria-pressed="' + (S.hidden.indexOf(s.id) < 0) + '"><span class="ava" style="--c:' + s.c + '">' + s.short + "</span>" + s.name.split(" ")[0] + "</button>"; }).join("");
    $("#week").innerHTML = plan.map(function (d) {
      var evs = S.ev.filter(function (e) { return e.d === d && S.hidden.indexOf(e.who) < 0; }).sort(function (a, b) { return a.t < b.t ? -1 : 1; });
      var dt = parse(d);
      return '<div class="day' + (d === today ? " is-today" : "") + '"><h4>' + WDL[dt.getDay()] + "<small>" + dt.getDate() + ". " + MON[dt.getMonth()] + "</small></h4>" + (evs.length ? evs.map(function (e) {
        var s = staff(e.who), j = job(e.job) || { kunde: e.job, titel: "" };
        return '<div class="ev" style="--c:' + s.c + '"><button class="x" type="button" data-del-ev="' + e.id + '" aria-label="Termin löschen"><svg><use href="#i-x"/></svg></button><b>' + e.t + " · " + esc(j.kunde) + "</b><span>" + s.name.split(" ")[0] + " · " + esc(e.note || j.titel) + "</span></div>";
      }).join("") : '<p class="empty">Frei</p>') + "</div>";
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var h = e.target.closest("[data-hide]");
    if (h) { var id = h.getAttribute("data-hide"), i = S.hidden.indexOf(id); if (i < 0) S.hidden.push(id); else S.hidden.splice(i, 1); save(); renderCal(); return; }
    var d = e.target.closest("[data-del-ev]");
    if (d) { S.ev = S.ev.filter(function (x) { return x.id !== d.getAttribute("data-del-ev"); }); save(); render(); toast("Termin gelöscht"); }
  });
  $("#f-ev").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, j = job(f.job.value) || {};
    S.ev.push({ id: "e" + Date.now(), d: f.d.value, t: f.t.value, who: f.who.value, job: f.job.value, note: j.titel });
    var hi = S.hidden.indexOf(f.who.value); if (hi >= 0) S.hidden.splice(hi, 1);
    log("Termin " + short(f.d.value) + " " + f.t.value + ": " + staff(f.who.value).name.split(" ")[0] + " bei " + (j.kunde || ""));
    save(); render(); toast("Termin eingetragen");
  });

  // ---- Zeichnen ----
  function badges() {
    var due = S.inv.filter(isDue).length, fin = S.jobs.filter(function (j) { return j.st === "fertig"; }).length, low = S.stock.filter(function (s) { return s.qty < s.min; }).length;
    $("#b-inv").textContent = due || ""; $("#b-jobs").textContent = fin || ""; $("#b-lager").textContent = low || ""; $("#b-zeit").textContent = S.clock ? "1" : "";
  }
  function render() {
    fillSelects(); renderClock(); badges();
    if (cur === "home") renderHome();
    if (cur === "zeit") renderTime();
    if (cur === "jobs") renderJobs();
    if (cur === "inv") renderInv();
    if (cur === "lager") renderStock();
    if (cur === "cal") renderCal();
  }

  var rw = innerWidth;
  addEventListener("resize", function () { if (cur === "home" && Math.abs(innerWidth - rw) > 40) { rw = innerWidth; renderHome(); } });
  load();
  var h0 = (location.hash || "").slice(1);
  if (["home", "zeit", "jobs", "inv", "lager", "cal"].indexOf(h0) >= 0) go(h0); else render();
})();
