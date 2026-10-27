// Beispiel Vereins-App: Mitglieder-App (Handy) und Vorstand (Bildschirm) teilen sich einen Zustand.
// Alles läuft nur im Browser mit erfundenen Musterdaten, nichts wird gesendet oder gespeichert.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  // Tausenderpunkt wie auf tim-kofler.at (de-AT liefert sonst ein schmales Leerzeichen)
  var eur = function (n, dec) {
    var p = Math.abs(n).toFixed(dec ? 2 : 0).split(".");
    return (n < 0 ? "−" : "") + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (p[1] ? "," + p[1] : "") + " €";
  };
  var MON = ["JÄN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
  var WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var YEAR = today.getFullYear();
  var addDays = function (d) { var x = new Date(today); x.setDate(x.getDate() + d); return x; };
  var dshort = function (d) { return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "."; };
  var bnr = function (c) { return YEAR + "-" + ("00" + c.bn).slice(-3); };
  var iso = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };

  // ---------- Vorher/Nachher-Regler ----------
  var vn = $("[data-vn]"), rng = $("[data-vn-range]");
  if (vn && rng) {
    var setX = function (v) { vn.style.setProperty("--x", v + "%"); };
    rng.addEventListener("input", function () { stop = true; setX(rng.value); });
    // Einmal kurz hin und her, damit man sieht, dass man ziehen kann.
    var stop = false, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      var t0 = null, wig = function (t) {
        if (stop) return;
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 2600), v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
        setX(v.toFixed(2)); rng.value = Math.round(v);
        if (p < 1) requestAnimationFrame(wig);
      };
      setTimeout(function () { requestAnimationFrame(wig); }, 900);
    }
  }

  // ---------- Abo-Rechner ----------
  // Preise pro Jahr wie bei bekannten Vereinsprogrammen (kleines, mittleres, großes Paket)
  var cm = $("[data-calc-m]"), cy = $("[data-calc-y]"), cpre = $("[data-calc-pre]");
  if (cm && cy) {
    var calc = function () {
      var m = +cm.value, y = +cy.value;
      $("[data-calc-mo]").textContent = eur(m);
      $("[data-calc-yo]").textContent = y + (y === 1 ? " Jahr" : " Jahre");
      $("[data-calc-sum]").textContent = eur(m * y);
      $$("[data-p]", cpre).forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-p") === m); });
    };
    cm.addEventListener("input", calc); cy.addEventListener("input", calc);
    cpre.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (!b) return; cm.value = b.getAttribute("data-p"); calc(); });
    calc();
  }

  // ---------- Musterdaten ----------
  var VK = {
    musik: {
      name: "Musikverein Lindenau", logo: "MV", url: "mv-lindenau.at/vorstand", total: 126, glbl: "Register",
      groups: ["Flöte", "Klarinette", "Saxophon", "Trompete", "Flügelhorn", "Tenorhorn", "Posaune", "Tuba", "Schlagwerk"],
      arts: [{ k: "aktiv", l: "Aktiv", b: 40 }, { k: "jugend", l: "Jugend", b: 15 }, { k: "unter", l: "Unterstützend", b: 25 }],
      board: [["Obfrau", "Maria Leitner"], ["Kapellmeister", "Stefan Pichler"], ["Kassier", "Josef Brandstetter"], ["Schriftführerin", "Eva Hofer"]],
      events: [["Gesamtprobe", "Musikheim", "19:30", 2, 38, 4], ["Registerprobe Klarinette", "Musikheim", "18:30", 6, 9, 1, "Klarinette"], ["Herbstkonzert", "Festsaal", "19:00", 16, 41, 3], ["Cäcilienmesse", "Pfarrkirche", "09:30", 30, 29, 6], ["Registerprobe Tuba", "Musikheim", "18:30", 9, 5, 1, "Tuba"]],
      myGrp: "Klarinette", xf: "Trachtgröße",
      probe: ["Registerprobe Holz", "18:30", "Probenbesuch", "Proben"],
      fest: { ev: 2, shifts: [["Aufbau", "15–18 Uhr", 4], ["Kassa", "18–21 Uhr", 2], ["Schank", "18–20:30 Uhr", 3], ["Schank", "20:30–23 Uhr", 3], ["Abbau", "23–24 Uhr", 4]] },
      start: 5230, color: "#2f8f4e", logoT: "symbol", sym: "i-note", shape: "wappen", claim: "Blasmusik für Jung und Alt, Proben jeden Freitag.", hero: "Musik verbindet.",
      poll: ["Wohin geht der Vereinsausflug im Frühjahr?", [["Wachau mit dem Schiff", 34], ["Ötscher-Tropfsteinhöhle", 21], ["Heuriger in Retz", 17]]],
      msgs: [["Tracht fürs Herbstkonzert", "Bitte bis Freitag die Tracht kontrollieren. Wer eine neue Bluse braucht, meldet sich bei Eva.", "Schriftführerin", 2], ["Neue Noten sind da", "Die Mappe für die Cäcilienmesse liegt im Musikheim. Bitte zur nächsten Probe mitnehmen.", "Kapellmeister", 6]],
      docs: [["Probenplan Herbst", "PDF · 1 Seite"], ["Statuten", "PDF · 6 Seiten"], ["Protokoll Generalversammlung", "PDF · 4 Seiten"], ["Datenschutzinfo", "PDF · 2 Seiten"]],
      cash: [["Förderung Gemeinde", "Förderungen", 1500], ["Frühschoppen", "Feste", 4380], ["Getränke Frühschoppen", "Feste", -1645.4], ["Noten Frühlingskonzert", "Noten & Instrumente", -386], ["Reparatur Tuba", "Noten & Instrumente", -540], ["Spende Raiffeisen-Fest", "Spenden", 300], ["Trachtenblusen (4 Stück)", "Tracht", -712], ["Versicherung Instrumente", "Verwaltung", -268.5], ["Konzertkarten Frühlingskonzert", "Feste", 2140], ["Webspace und Domain", "Verwaltung", -96]]
    },
    sport: {
      name: "USV Rotbach", logo: "SV", url: "usv-rotbach.at/vorstand", total: 214, glbl: "Sektion",
      groups: ["Fußball", "Tennis", "Turnen", "Laufen", "Stocksport"],
      arts: [{ k: "aktiv", l: "Erwachsene", b: 60 }, { k: "jugend", l: "Jugend", b: 25 }, { k: "unter", l: "Unterstützend", b: 30 }],
      board: [["Obmann", "Thomas Ecker"], ["Sportliche Leitung", "Sabine Wurm"], ["Kassier", "Markus Lehner"], ["Schriftführer", "Peter Riegler"]],
      events: [["Training Kampfmannschaft", "Sportplatz", "18:00", 1, 19, 3, "Fußball"], ["Heimspiel gegen SC Talheim", "Sportplatz", "15:00", 3, 22, 1], ["Saisonabschluss", "Kantine", "19:00", 22, 64, 8], ["Generalversammlung", "Gasthaus Post", "19:30", 35, 41, 5], ["Tennis-Clubmeisterschaft", "Tennisplatz", "09:00", 13, 18, 2, "Tennis"]],
      myGrp: "Fußball", xf: "Trikotnummer",
      probe: ["Training Nachwuchs", "17:00", "Trainingsbesuch", "Trainings"],
      fest: { ev: 2, shifts: [["Aufbau", "14–17 Uhr", 4], ["Grill", "17–20 Uhr", 2], ["Schank", "17–20 Uhr", 3], ["Schank", "20–23 Uhr", 3], ["Abbau", "23–24 Uhr", 4]] },
      start: 7810, color: "#ff5a1f", logoT: "kuerzel", sym: "i-ball", shape: "rund", claim: "Fußball, Tennis und Turnen für die ganze Gemeinde.", hero: "Gemeinsam am Ball.",
      poll: ["Was gibt es beim Saisonabschluss?", [["Grillen wie immer", 52], ["Spanferkel", 38], ["Pizza vom Wirt", 19]]],
      msgs: [["Training Mittwoch in der Halle", "Wegen der Rasenpflege findet das Training am Mittwoch in der Turnhalle statt. Hallenschuhe mitnehmen!", "Sportliche Leitung", 1], ["Buffet Saisonabschluss", "Wer etwas fürs Buffet mitbringt, trägt sich bitte bis Monatsende in der App ein.", "Obmann", 5]],
      docs: [["Trainingsplan Herbst", "PDF · 1 Seite"], ["Statuten", "PDF · 8 Seiten"], ["Protokoll Generalversammlung", "PDF · 5 Seiten"], ["Datenschutzinfo", "PDF · 2 Seiten"]],
      cash: [["Förderung Sportland", "Förderungen", 2400], ["Kantine September", "Kantine", 3125.6], ["Einkauf Kantine", "Kantine", -1380.2], ["Dressen Nachwuchs", "Dressen & Bälle", -1190], ["Bälle und Hütchen", "Dressen & Bälle", -312], ["Sponsor Bandenwerbung", "Sponsoren", 1800], ["Rasenpflege", "Sportplatz", -860], ["Schiedsrichtergebühren", "Spielbetrieb", -540], ["Eintritt Heimspiele", "Spielbetrieb", 1460], ["Webspace und Domain", "Verwaltung", -96]]
    },
    kultur: {
      name: "Kulturkreis Schlossmühle", logo: "KS", url: "kulturkreis-schlossmuehle.at/vorstand", total: 87, glbl: "Bereich",
      groups: ["Theater", "Lesungen", "Kino", "Ausstellungen", "Technik"],
      arts: [{ k: "aktiv", l: "Mitglied", b: 30 }, { k: "jugend", l: "Ermäßigt", b: 15 }, { k: "unter", l: "Förderer", b: 60 }],
      board: [["Obfrau", "Claudia Fuchsberger"], ["Stellvertreter", "Andreas Wieser"], ["Kassierin", "Renate Kogler"], ["Schriftführer", "Martin Bauer"]],
      events: [["Probe Theatergruppe", "Mühlenstadl", "19:00", 3, 12, 1, "Theater"], ["Lesung: Mostviertler Geschichten", "Bibliothek", "19:30", 9, 18, 2], ["Filmabend im Hof", "Mühlenstadl", "20:00", 17, 26, 4], ["Vorstandssitzung", "Mühlenstadl", "18:30", 24, 7, 0], ["Aufbau Ausstellung", "Mühlenstadl", "17:00", 13, 6, 0, "Ausstellungen"]],
      myGrp: "Theater", xf: "Fahrdienst",
      probe: ["Leseprobe", "19:00", "Probenbesuch", "Proben"],
      fest: { ev: 2, shifts: [["Aufbau und Leinwand", "17–19:30 Uhr", 3], ["Kassa", "19–20:30 Uhr", 2], ["Buffet", "19–21 Uhr", 2], ["Technik", "19:30–22:30 Uhr", 1], ["Abbau", "22:30–24 Uhr", 3]] },
      start: 3120, color: "#7d1f3a", logoT: "symbol", sym: "i-mask", shape: "eckig", claim: "Theater, Lesungen und Kino in der alten Mühle.", hero: "Kultur im Ort.",
      poll: ["Welcher Film läuft beim nächsten Filmabend?", [["Indien", 14], ["Die Siebtelbauern", 19], ["Hinterholz 8", 11]]],
      msgs: [["Requisiten gesucht", "Für das Wintertheater suchen wir einen alten Koffer und zwei Laternen. Wer hat etwas daheim?", "Obfrau", 3], ["Programmheft ist fertig", "Das Programm fürs Halbjahr liegt im Mühlenstadl auf und ist unten bei den Dokumenten.", "Schriftführer", 8]],
      docs: [["Programm Herbst und Winter", "PDF · 4 Seiten"], ["Statuten", "PDF · 5 Seiten"], ["Protokoll Generalversammlung", "PDF · 3 Seiten"], ["Datenschutzinfo", "PDF · 2 Seiten"]],
      cash: [["Förderung Land (Kultur)", "Förderungen", 1200], ["Eintritt Sommertheater", "Veranstaltungen", 3860], ["Bühnenbild und Kostüme", "Veranstaltungen", -1240], ["Filmrechte Filmabend", "Veranstaltungen", -180], ["Spenden Lesung", "Spenden", 245], ["Tontechnik Miete", "Technik", -420], ["Plakate und Flyer", "Werbung", -315.8], ["Versicherung", "Verwaltung", -189], ["Buffet Sommertheater", "Veranstaltungen", 960], ["Webspace und Domain", "Verwaltung", -96]]
    }
  };
  var FIRST = ["Anna", "Lukas", "Lena", "Florian", "Sophie", "Michael", "Julia", "David", "Katharina", "Stefan", "Laura", "Daniel", "Hannah", "Thomas", "Sarah", "Christoph", "Lisa", "Matthias", "Theresa", "Andreas", "Magdalena", "Johannes", "Elena", "Simon", "Verena", "Patrick", "Marlene", "Tobias", "Johanna", "Georg", "Elisabeth", "Philipp", "Clara", "Martin", "Anja", "Florentina", "Leopold", "Sabine", "Raphael", "Paula"];
  var LAST = ["Huber", "Gruber", "Wagner", "Mayr", "Brunner", "Wimmer", "Hofer", "Leitner", "Pichler", "Steiner", "Moser", "Fuchs", "Eder", "Schwarz", "Berger", "Haas", "Winkler", "Lechner", "Aigner", "Schmid", "Reiter", "Kern", "Weiß", "Höller", "Ecker", "Hager", "Strasser", "Zauner", "Kogler", "Fischer", "Haider", "Riegler", "Lindner", "Schober", "Teufl", "Ofner"];

  var S; // aktueller Zustand
  // Eigenes Feld je Verein (Trachtgröße, Trikotnummer, Fahrdienst), für die Musterdaten aus der Nummer abgeleitet
  function xval(m, P) {
    P = P || S.P;
    if (P.xf === "Trachtgröße") return ["36", "38", "40", "42", "44", "M", "L"][m.nr % 7];
    if (P.xf === "Trikotnummer") return String(m.nr % 30 + 1);
    return m.nr % 3 ? "nein" : "ja, mit Auto";
  }
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function build(k) {
    var P = VK[k], r = rnd(k.length * 7919 + 11), mem = [], used = { "Anna Huber": 1 };
    P.board.forEach(function (b) { used[b[1]] = 1; });
    for (var i = 0; i < P.total; i++) {
      var f, l, n;
      do { f = FIRST[Math.floor(r() * FIRST.length)]; l = LAST[Math.floor(r() * LAST.length)]; n = f + " " + l; } while (used[n]);
      used[n] = 1;
      var x = r(), art = x < 0.17 ? 1 : x < 0.32 ? 2 : 0;
      mem.push({ nr: i + 1, name: n, grp: P.groups[Math.floor(r() * P.groups.length)], seit: YEAR - Math.floor(art === 1 ? r() * 8 : Math.pow(r(), 1.6) * 38), art: art, role: "", st: r() < 0.86 ? "ok" : "bad" });
    }
    // Vorstand und das angemeldete Mitglied
    P.board.forEach(function (b, j) { var m = mem[j * 7 + 3]; m.name = b[1]; m.role = b[0]; m.art = 0; m.st = "ok"; m.seit = YEAR - 9 - j * 4; });
    var me = mem[41]; me.name = "Anna Huber"; me.st = "bad"; me.art = 0; me.role = ""; me.seit = YEAR - 6; me.grp = P.myGrp;
    me.adr = { str: "Lindenweg 4", ort: "3250 Wieselburg", tel: "+43 660 000 0042", mail: "anna.huber@example.at", x: xval(me, P) };
    var paid = mem.filter(function (m) { return m.st === "ok"; }).reduce(function (s, m) { return s + P.arts[m.art].b; }, 0);
    // Kassabuch: Sammelbuchung der schon bezahlten Beiträge plus Musterbuchungen übers Jahr verteilt
    var cash = [], span = Math.max(30, Math.round((today - new Date(YEAR, 0, 10)) / 864e5));
    // Ausgaben haben einen Musterbeleg, bei der dritten fehlt er (damit man sieht, wie das auffällt)
    var nOut = 0;
    P.cash.forEach(function (c, j) {
      var b = c[2] < 0 ? (nOut++ === 2 ? "" : "muster") : "";
      cash.push({ d: addDays(-span + Math.round(span * (j + 0.5) / (P.cash.length + 1))), t: c[0], c: c[1], a: c[2], beleg: b, nr: j + 1 });
    });
    cash.push({ d: addDays(-Math.min(span - 5, 200)), t: "Mitgliedsbeiträge " + YEAR + " (Sammelbuchung)", c: "Mitgliedsbeiträge", a: paid });
    // Eine doppelt erfasste Ausgabe ist schon storniert: sie bleibt mit Nummer sichtbar, zählt aber nicht
    var dup = cash.filter(function (c) { return c.a < 0 && c.beleg; })[0], dupD = new Date(dup.d); dupD.setDate(dupD.getDate() + 1);
    cash.push({ d: dupD, t: dup.t, c: dup.c, a: dup.a, beleg: "", sto: true });
    cash.sort(function (a, b) { return b.d - a.d; });
    // Fortlaufende Belegnummern in der Reihenfolge der Buchungen
    cash.slice().reverse().forEach(function (c, j) { c.bn = j + 1; });
    var kas = P.board[2][1], dupC = cash.filter(function (c) { return c.sto; })[0];
    S = {
      k: k, P: P, mem: mem, me: me, cash: cash, bn: cash.length, ro: false,
      log: [{ w: kas, t: "Nr. " + bnr(dupC) + " storniert: „" + dupC.t + "“ war doppelt gebucht", s: dshort(dupC.d) + YEAR }, { w: kas, t: "Anfangsbestand 1. Jänner eingetragen: " + eur(P.start, true), s: "02.01." + YEAR }], filter: "alle", q: "", io: "out", newMem: {},
      ev: P.events.map(function (e, j) { return { id: "e" + j, t: e[0], o: e[1], h: e[2], d: addDays(e[3]), yes: e[4], no: e[5], mine: "", cm: [], g: e[6] || "" }; }),
      feed: [], rem: 0,
      msgs: P.msgs.map(function (m, j) { return { id: "m" + j, t: m[0], x: m[1], from: m[2], d: addDays(-m[3]), to: "alle", toMe: true, n: 0, read: 0, mail: true, unread: j === 0, cm: [] }; })
    };
    // Umfrage vom Vorstand, ganz oben auf der Pinnwand
    S.msgs.unshift({ id: "p0", t: P.poll[0], x: "", from: P.board[0][0], d: addDays(-1), to: "alle", toMe: true, n: 0, read: 0, mail: false, unread: true, cm: [],
      poll: { o: P.poll[1].map(function (o) { return { t: o[0], n: o[1] }; }), mine: -1, anon: true } });
    // Kommentare: Rückfragen bleiben beim Termin, statt in der WhatsApp-Gruppe unterzugehen
    var nm = function (j) { return mem[(j * 17 + 9) % mem.length].name; };
    S.ev[0].cm.push({ w: nm(1), x: "Komme 10 Minuten später, fangt ruhig schon an.", s: "vor 3 Std." });
    S.ev[P.fest.ev].cm.push({ w: nm(2), x: "Ich kann zwei Kuchen mitbringen 🍰", s: "gestern" }, { w: P.board[0][1], r: P.board[0][0], x: "Super, danke! Kaffee organisieren wir.", s: "gestern" });
    S.msgs[1].cm.push({ w: nm(3), x: "Danke für die Info!", s: "vor 5 Std." });
    S.msgs.forEach(function (m) { m.n = mem.length; m.read = Math.round(mem.length * (0.62 + r() * 0.25)); });
    // Anwesenheit: 24 aktive Mitglieder, Probenbesuch bisher im Jahr (seit Jänner etwa jede Woche eine Probe)
    var act = mem.filter(function (m) { return m.art !== 2 && !m.role && m !== me; }).slice(0, 23).concat([me]);
    act.sort(function (a, b) { return a.name.localeCompare(b.name, "de"); });
    var held = Math.max(4, Math.round((today - new Date(YEAR, 0, 8)) / 864e5 / 7) - 3);
    S.att = { list: act, here: {}, held: held, saved: false, seen: {} };
    act.forEach(function (m) { S.att.seen[m.nr] = Math.round(held * (0.45 + Math.pow(r(), 0.55) * 0.55)); });
    S.att.seen[me.nr] = held - 2;
    // Helfer fürs Fest: ein Teil ist schon eingeteilt, die anderen haben Zeit
    var pool = mem.filter(function (m) { return m.art !== 1 && m !== me; }).slice(30, 52);
    S.help = { ev: S.ev[P.fest.ev], pool: [], sel: null, asked: false, shifts: P.fest.shifts.map(function (h, j) { return { id: "s" + j, t: h[0], h: h[1], need: h[2], who: [] }; }) };
    var pi = 0;
    S.help.shifts.forEach(function (sh, j) { var n = [2, 1, 1, 1, 2][j] || 0; for (var q = 0; q < n && q < sh.need; q++) sh.who.push(pool[pi++]); });
    S.help.pool = pool.slice(pi, pi + 9);
    S.ev.sort(function (a, b) { return a.d - b.d; });
    var who = function (j) { return mem[(j * 13 + 5) % mem.length].name; };
    S.feed = [
      { c: "ok", ic: "i-check", t: who(1) + " hat für „" + S.ev[0].t + "“ zugesagt", s: "vor 12 Minuten" },
      { c: "pop", ic: "i-euro", t: who(2) + " hat den Beitrag überwiesen", s: "vor 1 Stunde" },
      { c: "", ic: "i-users", t: who(3) + " hat die Adresse geändert", s: "gestern" }
    ];
  }

  // ---------- Toast ----------
  var toastEl = $("[data-toast]"), toastT;
  function toast(t, s) {
    if (!toastEl) return;
    $("[data-toast-t]").textContent = t; $("[data-toast-s]").textContent = s ? " · " + s : "";
    toastEl.classList.add("on"); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 3200);
  }
  function feed(c, ic, t) {
    S.feed.unshift({ c: c, ic: ic, t: t, s: "gerade eben", fresh: true });
    S.feed = S.feed.slice(0, 6);
    renderFeed();
  }
  var ini = function (n) { var p = n.split(" "); return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase(); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Knopf, der sich beim Senden füllt und zum Häkchen wird
  function fillSend(btn, label, done) {
    var t = btn.querySelector(".fill__t");
    btn.classList.add("is-busy"); btn.setAttribute("aria-busy", "true");
    t.textContent = "Wird gesendet …";
    setTimeout(function () {
      btn.classList.remove("is-busy"); btn.classList.add("is-done"); btn.removeAttribute("aria-busy");
      t.innerHTML = '<svg class="fill__ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' + esc(label);
      setTimeout(done, 750);
    }, reduce ? 150 : 1200);
  }
  function fillReset(btn, label) {
    btn.classList.remove("is-busy", "is-done"); btn.removeAttribute("aria-busy");
    btn.querySelector(".fill__t").textContent = label;
  }

  function flash(sel) { var el = $(sel); if (!el) return; el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1200); }

  // ---------- Handy: Termine ----------
  function myEv() { return S.ev.filter(function (e) { return !e.g || e.g === S.me.grp; }); }
  function renderPhoneEvents() {
    $("[data-m-evs]").innerHTML = myEv().map(function (e) {
      return '<div class="ev" data-ev="' + e.id + '"><div class="ev__top"><span class="ev__d"><b>' + ("0" + e.d.getDate()).slice(-2) + "</b>" + MON[e.d.getMonth()] + '</span><span class="ev__t"><b>' + esc(e.t) + (e.fresh ? '<span class="ev__new">Neu</span>' : "") + "</b>" + (e.g ? '<span class="ev__g">' + esc(e.g) + "</span>" : "") + "<small>" + WT[e.d.getDay()] + " · " + esc(e.h) + " Uhr · " + esc(e.o) + "</small></span></div>" +
        '<div class="ev__btn"><button type="button" class="yes" data-ans="yes" aria-pressed="' + (e.mine === "yes") + '"><svg><use href="#i-check"/></svg>Ich komme</button><button type="button" class="no" data-ans="no" aria-pressed="' + (e.mine === "no") + '"><svg><use href="#i-x"/></svg>Leider nicht</button></div>' +
        '<div class="ev__ft"><p class="ev__cnt">' + e.yes + " Zusagen · " + e.no + " Absagen</p>" + cmtTg(e, "e:" + e.id) + "</div>" + cmtBox(e, "e:" + e.id) + "</div>";
    }).join("");
  }

  // ---------- Kommentare unter Terminen und Neuigkeiten ----------
  function cmtTg(o, key) {
    var n = o.cm.length;
    return '<button type="button" class="cmt__tg" data-cmt-tg="' + key + '" aria-expanded="' + !!o.open + '"><svg><use href="#i-chat"/></svg>' + (n ? n + (n === 1 ? " Kommentar" : " Kommentare") : "Kommentieren") + "</button>";
  }
  function cmtBox(o, key) {
    if (!o.open) return "";
    return '<div class="cmt"><ul>' + o.cm.map(function (c) {
      var h = "<li" + (c.fresh ? ' class="is-new"' : "") + "><i>" + ini(c.w) + "</i><span><b>" + esc(c.w) + (c.r ? "<em>" + esc(c.r) + "</em>" : "") + "</b>" + esc(c.x) + "<small>" + esc(c.s) + "</small></span></li>";
      c.fresh = false; return h;
    }).join("") + '</ul><form class="cmt__f" data-cmt-f="' + key + '"><input maxlength="140" placeholder="Schreib etwas …" aria-label="Kommentar schreiben" autocomplete="off" enterkeyhint="send"><button type="submit" aria-label="Kommentar senden"><svg><use href="#i-send"/></svg></button></form></div>';
  }
  function cmtItem(key) {
    var l = key[0] === "e" ? S.ev : S.msgs, id = key.slice(2);
    return l.filter(function (x) { return x.id === id; })[0];
  }
  function cmtRender(key, focus) {
    if (key[0] === "e") { renderPhoneEvents(); renderDeskEvents(); } else { renderPins(); renderSent(); }
    var f = focus && $('[data-cmt-f="' + key + '"] input');
    if (f) f.focus({ preventScroll: true });
  }
  var appBody = $(".app__body");
  appBody.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-cmt-tg]"); if (!b) return;
    var key = b.getAttribute("data-cmt-tg"), o = cmtItem(key); if (!o) return;
    o.open = !o.open; cmtRender(key, o.open);
  });
  appBody.addEventListener("submit", function (ev) {
    var f = ev.target.closest("[data-cmt-f]"); if (!f) return;
    ev.preventDefault();
    var key = f.getAttribute("data-cmt-f"), o = cmtItem(key), inp = f.querySelector("input"), x = inp.value.replace(/\s+/g, " ").trim().slice(0, 140);
    if (!o || !x) return;
    o.cm.push({ w: S.me.name, x: x, s: "gerade eben", fresh: true });
    cmtRender(key, true);
    feed("", "i-chat", S.me.name + " zu „" + o.t + "“: " + (x.length > 48 ? x.slice(0, 46) + " …" : x));
    toast("Kommentar ist da", "alle sehen ihn direkt " + (key[0] === "e" ? "beim Termin" : "bei der Nachricht"));
  });

  // ---------- Kalender: alle Termine als Datei (im echten Verein ein Abo-Link) ----------
  var two = function (n) { return ("0" + n).slice(-2); };
  function icsEsc(t) { return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function icsT(d, h, plus) {
    var p = h.split(":"), x = new Date(d); x.setHours(+p[0] + (plus || 0), +p[1] || 0, 0, 0);
    return x.getFullYear() + two(x.getMonth() + 1) + two(x.getDate()) + "T" + two(x.getHours()) + two(x.getMinutes()) + "00";
  }
  $("[data-m-ics]").addEventListener("click", function () {
    var name = S.brand ? S.brand.name : S.P.name, stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tim Kofler Webdesign//Vereins-App Beispiel//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + icsEsc(name), "X-WR-TIMEZONE:Europe/Vienna"];
    myEv().forEach(function (e) {
      L.push("BEGIN:VEVENT", "UID:" + e.id + "-" + S.k + "@tim-kofler.at", "DTSTAMP:" + stamp, "DTSTART:" + icsT(e.d, e.h), "DTEND:" + icsT(e.d, e.h, 2),
        "SUMMARY:" + icsEsc(e.t), "LOCATION:" + icsEsc(e.o), "DESCRIPTION:" + icsEsc("Musterdaten aus der Beispiel-App von tim-kofler.at"), "END:VEVENT");
    });
    L.push("END:VCALENDAR");
    dl("termine-" + slug(name) + ".ics", L.join("\r\n") + "\r\n", "text/calendar;charset=utf-8");
    toast("Kalender-Datei geladen", "im echten Verein ein Abo-Link: neue Termine kommen von selbst");
  });
  $("[data-m-evs]").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-ans]"); if (!b) return;
    var e = S.ev.filter(function (x) { return x.id === b.closest("[data-ev]").getAttribute("data-ev"); })[0];
    var a = b.getAttribute("data-ans");
    if (e.mine) e[e.mine]--;
    if (e.mine === a) { e.mine = ""; } else { e.mine = a; e[a]++; }
    renderPhoneEvents(); renderDeskEvents(); renderKpis();
    if (e.mine === "yes") { feed("ok", "i-check", S.me.name + " hat für „" + e.t + "“ zugesagt"); toast("Zusage im Vorstand angekommen", e.t + ": jetzt " + e.yes); }
    else if (e.mine === "no") { feed("bad", "i-x", S.me.name + " hat für „" + e.t + "“ abgesagt"); toast("Absage im Vorstand angekommen", e.t); }
    if (e === S.ev[0]) flash("[data-k-next]");
  });

  // ---------- Handy: Beitrag mit EPC-QR-Code (Muster-IBAN) ----------
  function renderDue() {
    var P = S.P, me = S.me, amt = P.arts[me.art].b, ref = "Beitrag " + YEAR + " · M-" + ("000" + me.nr).slice(-4);
    $("[data-m-amt]").textContent = eur(amt, true);
    $("[data-m-rcv]").textContent = S.brand ? S.brand.name : P.name;
    $("[data-m-ref]").textContent = ref;
    var st = $("[data-m-st]");
    st.className = "pill " + me.st; st.textContent = me.st === "ok" ? "bezahlt" : me.st === "wait" ? "gemeldet" : "offen";
    $("[data-m-paid]").hidden = me.st !== "bad";
    $("[data-m-dot]").className = me.st === "bad" ? "" : "off";
    $("[data-m-thx]").hidden = me.st === "bad";
    $("[data-m-due]").hidden = me.st !== "bad";
    qrTxt = ["BCD", "002", "1", "SCT", "", (S.brand ? S.brand.name : P.name).slice(0, 70), "AT000000000000000000", "EUR" + amt.toFixed(2), "", "", ref.replace(" · ", " ")].join("\n");
    drawQR();
  }
  // QR-Zahlschein im Stil von tim-kofler.at (tk-qr.js): runde Punkte, oranger Kern, Vereinslogo in der Mitte
  var qrTxt = "", qrImg = null;
  function drawQR() {
    var cv = $("[data-m-qr]"), B = S.brand;
    if (!cv || !B || !qrTxt || !window.qrcode || !window.tkQR) return;
    var logo;
    if (B && B.type === "bild" && B.img) {
      if (!qrImg || qrImg.getAttribute("src") !== B.img) { qrImg = new Image(); qrImg.onload = drawQR; qrImg.src = B.img; }
      logo = { img: qrImg };
    } else logo = { text: B.short || ini(B.name), bg: B.color, fg: lum(B.color) > 0.36 ? "#111827" : "#fff" };
    var cx = cv.getContext("2d");
    cx.clearRect(0, 0, cv.width, cv.height);
    tkQR.draw(cx, qrTxt, 0, 0, cv.width, { ecl: "Q", logo: logo });
  }
  $("[data-m-paid]").addEventListener("click", function () {
    var due = $("[data-m-due]"), btn = this;
    if (due.classList.contains("is-stamped")) return;
    // Erst der Stempel auf dem Zahlschein, dann das Danke
    due.classList.add("is-stamped"); btn.disabled = true;
    setTimeout(function () {
      due.classList.remove("is-stamped"); btn.disabled = false;
      paidDone();
    }, reduce ? 300 : 1250);
  });
  function paidDone() {
    S.me.st = "wait"; renderDue(); renderMembers(); renderOpen();
    feed("pop", "i-euro", S.me.name + " meldet: Beitrag überwiesen");
    toast("Der Kassier sieht die Meldung", "Bestätigen in der Mitgliederliste");
  }

  // ---------- Handy: Erinnerungen erst mit eigener Karte erfragen ----------
  $("[data-perm-ja]").addEventListener("click", function () {
    $("[data-perm-q]").hidden = true; $("[data-perm-ok]").hidden = false;
    toast("Erinnerungen an", "einen Tag vor jedem Termin");
  });
  $("[data-perm-nein]").addEventListener("click", function () {
    var p = $("[data-perm]"); p.classList.add("is-out");
    setTimeout(function () { p.hidden = true; }, reduce ? 0 : 320);
  });

  // ---------- Handy: Beitreten ----------
  var jn = $("[data-j-name]"), jok = $("[data-j-ok]"), jgo = $("[data-j-go]"), jGrp = "", jArt = 0;
  function renderJoin() {
    $("[data-j-glbl]").textContent = S.P.glbl;
    fillReset(jgo, "Beitritt senden");
    jGrp = ""; jArt = 0;
    $("[data-j-grp]").innerHTML = S.P.groups.map(function (g) { return '<button type="button" aria-pressed="false" data-g="' + esc(g) + '">' + esc(g) + "</button>"; }).join("");
    $("[data-j-art]").innerHTML = S.P.arts.map(function (a, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-a="' + i + '">' + esc(a.l) + " · " + a.b + " €</button>"; }).join("");
    checkJoin();
  }
  function checkJoin() { jgo.disabled = !(jn.value.trim().length > 2 && jGrp && jok.checked); }
  $("[data-j-grp]").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); jGrp = b.getAttribute("data-g"); checkJoin();
  });
  $("[data-j-art]").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); jArt = +b.getAttribute("data-a"); checkJoin();
  });
  jn.addEventListener("input", checkJoin); jok.addEventListener("change", checkJoin);
  jgo.addEventListener("click", function () {
    if (jgo.classList.contains("is-busy") || jgo.classList.contains("is-done")) return;
    var name = jn.value.trim().replace(/\s+/g, " ").slice(0, 40);
    fillSend(jgo, "Gesendet", function () { joined(name); });
  });
  function joined(name) {
    var m = { nr: S.mem.length + 1, name: name, grp: jGrp, seit: YEAR, art: jArt, role: "", st: "bad" };
    S.mem.push(m); S.newMem[m.nr] = 1;
    $("[data-j-form]").hidden = true; $("[data-j-done]").hidden = false;
    $("[data-j-msg]").textContent = "Der Vorstand bestätigt deinen Beitritt. Den Zahlschein über " + S.P.arts[jArt].b + " € bekommst du per E-Mail.";
    $("[data-d-newbadge]").hidden = false;
    renderMembers(); renderKpis(); renderOpen(); flash("[data-k-mem]");
    feed("pop", "i-plus", name + " ist dem Verein beigetreten (" + jGrp + ")");
    toast("Neues Mitglied: " + name, "steht schon in der Mitgliederliste");
  }
  $("[data-j-again]").addEventListener("click", function () {
    jn.value = ""; jok.checked = false; renderJoin();
    $("[data-j-form]").hidden = false; $("[data-j-done]").hidden = true;
  });

  // Reiter am Handy
  $("[data-m-tabs]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    $$("[data-tab]", this).forEach(function (x) { x.setAttribute("aria-selected", x === b); });
    $$(".v").forEach(function (v) { v.classList.toggle("on", v.getAttribute("data-v") === b.getAttribute("data-tab")); });
    $(".app__body").scrollTop = 0;
    if (b.getAttribute("data-tab") === "neues") setTimeout(function () { S.msgs.forEach(function (m) { m.unread = false; }); renderPins(); }, 1600);
  });

  // Meine Daten: Mitglied ändert Adresse, Kontakt und das eigene Feld selbst
  var meForm = $("[data-me-form]"), meSave = $("[data-me-save]"), meFrom = "termine";
  function openProf() {
    var a = S.me.adr, cur = $("[data-m-tabs] [aria-selected=true]");
    meFrom = cur ? cur.getAttribute("data-tab") : "termine";
    $$("[data-me-f]").forEach(function (f) { f.value = a[f.getAttribute("data-me-f")]; });
    $("[data-me-xl]").textContent = S.P.xf;
    fillReset(meSave, "Speichern");
    $$(".v").forEach(function (v) { v.classList.toggle("on", v.getAttribute("data-v") === "profil"); });
    $(".app__body").scrollTop = 0;
  }
  function closeProf() {
    var v = $('.v[data-v="profil"]'); if (!v || !v.classList.contains("on")) return;
    $$(".v").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === meFrom); });
    $(".app__body").scrollTop = 0;
  }
  $("[data-me-open]").addEventListener("click", openProf);
  $("[data-me-back]").addEventListener("click", closeProf);
  meForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (meSave.classList.contains("is-busy") || meSave.classList.contains("is-done")) return;
    var a = S.me.adr, chg = [];
    $$("[data-me-f]").forEach(function (f) {
      var k = f.getAttribute("data-me-f"), v = f.value.trim();
      if (v && v !== a[k]) { a[k] = v; chg.push(k); }
    });
    if (!chg.length) { toast("Nichts geändert", "deine Daten sind aktuell"); return; }
    var lbl = { str: "Adresse", ort: "Adresse", tel: "Telefon", mail: "E-Mail", x: S.P.xf }, txt = [];
    chg.forEach(function (k) { if (txt.indexOf(lbl[k]) < 0) txt.push(lbl[k]); });
    fillSend(meSave, "Gespeichert", function () {
      S.me.chg = true;
      feed("", "i-users", S.me.name + " hat " + txt.join(", ") + " selbst geändert");
      toast("Beim Vorstand angekommen", txt.join(", ") + " in der Kartei aktualisiert");
      if (!mcard.hidden && +mcard.getAttribute("data-nr") === S.me.nr) openCard(S.me.nr);
      closeProf();
    });
  });

  // ---------- Vorstand ----------
  $("[data-d-tabs]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-dt]"); if (!b) return;
    var t = b.getAttribute("data-dt");
    $$("[data-dt]", this).forEach(function (x) { x.setAttribute("aria-selected", x === b); });
    $$(".dp").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-dp") === t); });
    if (t === "mitglieder") $("[data-d-newbadge]").hidden = true;
    if (t === "helfer") $("[data-d-helpbadge]").hidden = true;
    mcard.hidden = true; bview.hidden = true; bankv.hidden = true; impv.hidden = true;
  });

  // Vorstand im Vollbild: so sieht die App wirklich am PC aus (Esc oder Knopf beendet es)
  var desk = $(".desk"), fullB = $("[data-full]");
  function setFull(on) {
    desk.classList.toggle("is-full", on);
    // Hinweise müssen im Vollbild-Element liegen, sonst zeigt der Browser sie nicht
    (on ? desk : document.body).appendChild($("[data-toast]"));
    document.documentElement.classList.toggle("va-full", on);
    fullB.setAttribute("aria-pressed", on);
    $("[data-full-t]").textContent = on ? "Vollbild beenden" : "Vollbild";
  }
  fullB.addEventListener("click", function () {
    var on = !desk.classList.contains("is-full");
    if (on && desk.requestFullscreen) desk.requestFullscreen().catch(function () {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(function () {});
    setFull(on);
  });
  document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && desk.classList.contains("is-full")) setFull(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && desk.classList.contains("is-full") && !document.fullscreenElement) setFull(false); });

  // Seitenleiste am PC über den Knopf am Rand einklappen (nur Symbole)
  var deskIn = $(".desk__in"), sideTog = $("[data-side-tog]");
  $$("[data-dt]").forEach(function (b) { var l = b.querySelector("span"); if (l) b.title = l.textContent; });
  sideTog.addEventListener("click", function () {
    var rail = deskIn.classList.toggle("is-rail");
    sideTog.setAttribute("aria-expanded", !rail);
    sideTog.setAttribute("aria-label", rail ? "Seitenleiste ausklappen" : "Seitenleiste einklappen");
  });

  // ---------- Anmeldung mit Code (Demo: jeder Code passt) ----------
  var lgn = $("[data-login]"), otp = $("[data-otp]"), oIn = $$("input", otp), oBusy = false;
  function lgnClose(now) {
    lgn.classList.add("out");
    setTimeout(function () { lgn.hidden = true; }, now ? 0 : 450);
  }
  $("[data-lgn-1]").addEventListener("submit", function (e) {
    e.preventDefault();
    this.hidden = true; $("[data-lgn-2]").hidden = false;
    oIn[0].focus({ preventScroll: true });
  });
  // Wie beim Vorbild-Video: eine Linie läuft prüfend um jedes Kästchen, dann kippen alle sechs langsam in die Mitte
  // und werden zu einem einzigen, das grün wird und ein Häkchen zeichnet (bei falschem Code rot mit Kreuz).
  var lCard = $(".lgn__card", lgn), lT = $(".lgn__t", lgn), lS = $(".lgn__s", lgn), oSt = $(".otp__st", lgn);
  var oCell = $$(".otp__c", otp), oAnim = [], lTxt = [lT.innerHTML, lS.textContent];
  function oSwap(t, sub) {
    [lT, lS].forEach(function (el) { el.classList.add("swap"); });
    setTimeout(function () {
      lT.innerHTML = t; lS.textContent = sub;
      [lT, lS].forEach(function (el) { el.classList.remove("swap"); });
    }, reduce ? 0 : 300);
  }
  function oAt(ms, fn) { setTimeout(fn, reduce ? 0 : ms); }
  function oRun(good, then) {
    oIn.forEach(function (inp) { inp.blur(); inp.readOnly = true; });
    lCard.classList.add("is-busy"); otp.classList.add("chk");
    oAt(760, function () {
      var r = otp.getBoundingClientRect(), mid = r.left + r.width / 2;
      otp.classList.add("merge");
      oAnim = oCell.map(function (c, k) {
        var b = c.getBoundingClientRect(), dx = mid - b.left - b.width / 2, rot = (k - 2.5) * 5;
        return c.animate([
          { transform: "none" },
          { transform: "translateX(" + dx * 0.9 + "px) rotate(" + rot * 1.5 + "deg)", offset: 0.72 },
          { transform: "translateX(" + dx + "px) rotate(" + rot * 0.6 + "deg)" }
        ], { duration: reduce ? 0 : 720, easing: "cubic-bezier(.6,0,.25,1)", fill: "forwards" });
      });
    });
    oAt(1400, function () { otp.classList.add("one"); });
    oAt(1520, function () {
      otp.classList.add(good ? "done" : "bad");
      lCard.classList.add(good ? "is-ok" : "is-bad");
      oSt.textContent = good ? "Code bestätigt" : "Code falsch";
    });
    oAt(1700, then);
  }
  function oReset() {
    otp.classList.remove("one", "done", "bad"); lCard.classList.remove("is-bad");
    oIn.forEach(function (inp) { inp.value = ""; });
    oSwap(lTxt[0], lTxt[1]); oSt.textContent = "";
    var left = oAnim.length;
    function fin() {
      oAnim.forEach(function (a) { a.cancel(); }); oAnim = [];
      otp.classList.remove("merge", "chk"); lCard.classList.remove("is-busy");
      oIn.forEach(function (inp) { inp.readOnly = false; });
      oBusy = false; oIn[0].focus({ preventScroll: true });
    }
    if (reduce || !left) return fin();
    oAnim.forEach(function (a) { a.onfinish = function () { if (!--left) fin(); }; a.reverse(); });
  }
  function oCheck() {
    if (oBusy || !oIn.every(function (i) { return /^\d$/.test(i.value); })) return;
    oBusy = true;
    var good = oIn.map(function (i) { return i.value; }).join("") !== "000000";
    oRun(good, function () {
      if (good) {
        oSwap('<svg aria-hidden="true"><use href="#i-check"/></svg>Angemeldet', "Willkommen zurück im Vorstand.");
        $("[data-lgn-skip]").hidden = true;
        oAt(1700, function () { lgnClose(false); });
      } else {
        oSwap('<svg aria-hidden="true"><use href="#i-x"/></svg>Der Code passt nicht', "Bitte noch einmal eingeben. Nach fünf Fehlversuchen wird kurz gesperrt.");
        oAt(1300, oReset);
      }
    });
  }
  oIn.forEach(function (inp, k) {
    inp.addEventListener("input", function () {
      var v = inp.value.replace(/\D/g, "");
      if (v.length > 1) { v.split("").slice(0, 6 - k).forEach(function (c, j) { oIn[k + j].value = c; }); (oIn[Math.min(5, k + v.length)]).focus(); }
      else { inp.value = v; if (v && k < 5) oIn[k + 1].focus(); }
      oCheck();
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !inp.value && k > 0) { oIn[k - 1].value = ""; oIn[k - 1].focus(); e.preventDefault(); }
    });
  });
  $("[data-otp-fill]").addEventListener("click", function () {
    var code = "482915";
    oIn.forEach(function (i) { i.value = ""; });
    code.split("").forEach(function (c, j) {
      setTimeout(function () { oIn[j].value = c; oIn[j].focus({ preventScroll: true }); if (j === 5) oCheck(); }, reduce ? 0 : 110 * (j + 1));
    });
  });
  $("[data-lgn-skip]").addEventListener("click", function () { lgnClose(true); });

  function cashSums() {
    var inn = 0, out = 0;
    S.cash.forEach(function (c) { if (c.sto) return; if (c.a >= 0) inn += c.a; else out -= c.a; });
    return { inn: inn, out: out, sum: S.P.start + inn - out };
  }
  function renderKpis() {
    var mem = S.mem, paid = mem.filter(function (m) { return m.st === "ok"; }).length, pct = Math.round(paid / mem.length * 100);
    $("[data-k-mem]").textContent = mem.length;
    $("[data-k-memsub]").textContent = "davon " + mem.filter(function (m) { return m.art === 1; }).length + " " + S.P.arts[1].l;
    $("[data-k-year]").textContent = YEAR;
    $("[data-k-paid]").textContent = pct + " %";
    $("[data-k-paidbar]").style.width = pct + "%";
    $("[data-k-paidsub]").textContent = paid + " von " + mem.length + " bezahlt";
    $("[data-k-cash]").textContent = eur(Math.round(cashSums().sum));
    var e = S.ev[0];
    $("[data-k-next]").textContent = e.yes;
    $("[data-k-nextsub]").textContent = "Zusagen · " + e.t + ", " + dshort(e.d);
    if (S.help) renderSparks();
  }
  function renderFeed() {
    $("[data-feed]").innerHTML = S.feed.map(function (f) {
      var h = '<li class="' + f.c + (f.fresh ? " is-new" : "") + '"><i><svg><use href="#' + f.ic + '"/></svg></i><span>' + esc(f.t) + "<small>" + esc(f.s) + "</small></span></li>";
      f.fresh = false; return h;
    }).join("");
  }
  function renderOpen() {
    var open = S.mem.filter(function (m) { return m.st !== "ok"; });
    open.sort(function (a, b) { return (b.st === "wait") - (a.st === "wait") || b.nr - a.nr; });
    var h = open.slice(0, 5).map(function (m) {
      return "<li><span>" + esc(m.name) + (m.rem && m.st === "bad" ? "<em>" + m.rem + ". Erinnerung</em>" : "") + "</span><span>" + (m.st === "wait" ? "gemeldet" : S.P.arts[m.art].b + " €") + "</span></li>";
    }).join("");
    if (open.length > 5) h += '<li class="more">und ' + (open.length - 5) + " weitere</li>";
    if (!open.length) h = '<li class="more">Alle Beiträge sind bezahlt. 🎉</li>';
    $("[data-open]").innerHTML = h;
    $("[data-remind]").hidden = !open.some(function (m) { return m.st === "bad"; });
    $("[data-remind-t]").textContent = S.rem ? "Freundliche Erinnerung schicken (" + (S.rem + 1) + ".)" : "Allen Offenen einen Zahlschein schicken";
  }
  var ST = { ok: "bezahlt", bad: "offen", wait: "gemeldet" };
  function renderMembers() {
    var q = S.q.toLowerCase(), f = S.filter;
    var list = S.mem.filter(function (m) {
      if (f === "offen" && m.st === "ok") return false;
      if (f === "jugend" && m.art !== 1) return false;
      if (f === "vorstand" && !m.role) return false;
      return !q || (m.name + " " + m.grp).toLowerCase().indexOf(q) > -1;
    }).slice().sort(function (a, b) { return (S.newMem[b.nr] ? 1 : 0) - (S.newMem[a.nr] ? 1 : 0) || a.nr - b.nr; });
    $("[data-th-grp]").textContent = S.P.glbl;
    $("[data-m-q]").placeholder = "Name oder " + S.P.glbl + " suchen";
    $("[data-m-rows]").innerHTML = list.map(function (m) {
      return "<tr" + (S.newMem[m.nr] ? ' class="is-new"' : "") + "><td>M-" + ("000" + m.nr).slice(-4) + "</td><td>" + '<button type="button" class="nm" data-card="' + m.nr + '">' + esc(m.name) + "</button>" + (m.role ? '<span class="role">' + esc(m.role) + "</span>" : "") +
        "</td><td>" + esc(m.grp) + "</td><td>" + m.seit + '</td><td><button type="button" class="st ' + m.st + '" data-pay="' + m.nr + '" title="' + (m.st === "ok" ? "Als offen markieren" : "Als bezahlt abhaken") + '">' + ST[m.st] + "</button></td></tr>";
    }).join("") || '<tr><td colspan="5">Niemand gefunden.</td></tr>';
    $("[data-m-count]").textContent = list.length + " von " + S.mem.length + " Mitgliedern · Status antippen zum Abhaken";
  }
  $("[data-m-q]").addEventListener("input", function () { S.q = this.value.trim(); renderMembers(); });
  $("[data-m-flt]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    $$("[data-f]", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    S.filter = b.getAttribute("data-f"); renderMembers();
  });
  $("[data-m-rows]").addEventListener("click", function (e) {
    var c = e.target.closest("[data-card]"); if (c) { openCard(+c.getAttribute("data-card")); return; }
    var b = e.target.closest("[data-pay]"); if (!b) return;
    var m = S.mem[+b.getAttribute("data-pay") - 1], amt = S.P.arts[m.art].b;
    if (m.st === "ok") {
      m.st = "bad";
      S.cash.forEach(function (c) { if (c.m === m.nr && !c.sto) { c.sto = true; logC("Nr. " + bnr(c) + " storniert: „" + c.t + "“ (Beitrag wieder offen)"); } });
    } else {
      payMem(m);
      feed("ok", "i-check", "Beitrag von " + m.name + " abgehakt (" + amt + " €), im Kassabuch gebucht");
      toast("Beitrag abgehakt", m.name + " · " + amt + " € im Kassabuch");
    }
    renderMembers(); renderKpis(); renderOpen(); renderCash(); flash("[data-k-cash]");
    if (m === S.me) renderDue();
    if (!mcard.hidden && +mcard.getAttribute("data-nr") === m.nr) openCard(m.nr);
  });
  function payMem(m, src) {
    m.st = "ok";
    S.cash.unshift({ d: new Date(today), t: "Beitrag " + YEAR + " " + m.name + (src ? " (" + src + ")" : ""), c: "Mitgliedsbeiträge", a: S.P.arts[m.art].b, m: m.nr, fresh: true, bn: ++S.bn });
  }
  function mnr(m) { return "M-" + ("000" + m.nr).slice(-4); }

  // Kontoauszug einlesen: Zahlungen mit Mitgliedsnummer im Verwendungszweck werden automatisch abgehakt
  var bankv = $("[data-bankv]"), bankLeft = null;
  function bankRow(ok, who, why, amt, extra) {
    return '<li class="' + (ok ? "ok" : "q") + '"><i><svg><use href="#' + (ok ? "i-check" : "i-search") + '"/></svg></i><span><b>' + esc(who) + "</b><small>" + esc(why) + "</small>" + (extra || "") + "</span><em>+ " + eur(amt, true) + "</em></li>";
  }
  function openBank() {
    var open = S.mem.filter(function (m) { return m.st === "bad" && m !== S.me; });
    if (!open.length) { toast("Alles bezahlt", "keine offenen Beiträge zum Abgleichen"); return; }
    var hit = open.slice(0, 5), rest = open.slice(5), sum = 0, rows = "";
    hit.forEach(function (m) {
      var a = S.P.arts[m.art].b; sum += a; payMem(m, "Kontoauszug");
      rows += bankRow(true, m.name, "„Mitgliedsbeitrag " + YEAR + " " + mnr(m) + "“ · abgehakt", a);
    });
    bankLeft = rest.length ? rest[0] : null;
    if (bankLeft) {
      var fam = "Fam. " + bankLeft.name.split(" ").slice(-1)[0], a2 = S.P.arts[bankLeft.art].b;
      rows += bankRow(false, fam, "„Beitrag " + YEAR + "“ · ohne Mitgliedsnummer", a2,
        '<button class="dbtn sm" type="button" data-bank-as>Zu ' + esc(bankLeft.name) + " zuordnen</button>");
    }
    rows += '<li class="x"><i><svg><use href="#i-x"/></svg></i><span><b>Raiffeisen Bankomat</b><small>Abhebung · kein Mitgliedsbeitrag, bleibt im Auszug</small></span><em>− 200,00 €</em></li>';
    bankv.innerHTML = '<div class="mcard__hd"><i><svg><use href="#i-sheet"/></svg></i><span><b>Kontoauszug</b><small>' + hit.length + " von " + (hit.length + (bankLeft ? 1 : 0)) + " Beiträgen erkannt · " + eur(sum, true) + '</small></span><button type="button" class="mcard__x" data-bank-x aria-label="Kontoauszug schließen"><svg><use href="#i-x"/></svg></button></div>' +
      '<ul class="bank__l">' + rows + "</ul>" +
      '<p class="bank__n">Im echten Verein lädst du die CSV- oder CAMT-Datei aus George, ELBA oder deinem Online-Banking hoch. Die App erkennt die Mitgliedsnummer im Verwendungszweck, der Rest bleibt zum Zuordnen.</p>' +
      '<div class="mcard__ft"><button class="dbtn sm ghost" type="button" data-bank-x>Fertig</button></div>';
    mcard.hidden = true; bview.hidden = true; impv.hidden = true; bankv.hidden = false;
    bankv.querySelector(".mcard__x").focus({ preventScroll: true });
    feed("ok", "i-sheet", "Kontoauszug eingelesen: " + hit.length + " Beiträge automatisch abgehakt (" + eur(sum, true) + ")");
    toast(hit.length + " Beiträge abgehakt", "aus dem Kontoauszug, im Kassabuch gebucht");
    renderMembers(); renderKpis(); renderOpen(); renderCash(); flash("[data-k-cash]");
  }
  $("[data-bank]").addEventListener("click", openBank);
  bankv.addEventListener("click", function (e) {
    if (e.target.closest("[data-bank-x]")) { bankv.hidden = true; return; }
    var b = e.target.closest("[data-bank-as]"); if (!b || !bankLeft) return;
    var m = bankLeft; bankLeft = null; payMem(m, "Kontoauszug");
    var li = b.closest("li"); li.className = "ok"; li.querySelector("i").innerHTML = '<svg><use href="#i-check"/></svg>';
    li.querySelector("small").textContent = "zugeordnet zu " + m.name + " · abgehakt"; b.remove();
    feed("ok", "i-check", "Zahlung „Fam. " + m.name.split(" ").slice(-1)[0] + "“ " + m.name + " zugeordnet und abgehakt");
    toast("Zugeordnet", m.name + " · " + S.P.arts[m.art].b + " € im Kassabuch");
    renderMembers(); renderKpis(); renderOpen(); renderCash(); flash("[data-k-cash]");
  });

  // ---------- Mitglieder importieren: Excel oder CSV, Spalten erkennen, prüfen, übernehmen ----------
  // Alles passiert im Browser, die Datei verlässt das Gerät nicht.
  var impv = $("[data-impv]"), IMP = null;
  var IF = [["vn", "Vorname"], ["nn", "Nachname"], ["name", "Name (ganz)"], ["grp", ""], ["seit", "Mitglied seit"], ["art", "Mitgliedschaft"], ["mail", "E-Mail"], ["tel", "Telefon"], ["st", "Beitrag bezahlt"], ["", "Nicht übernehmen"]];
  var IRX = [["mail", /mail/], ["tel", /tel|handy|mobil|phone/], ["vn", /vorname|first/], ["nn", /nachname|familienname|zuname|last/], ["seit", /seit|eintritt|beitritt|datum|ab\b/],
    ["st", /beitrag|bezahlt|zahlung|status/], ["art", /art\b|mitgliedsart|mitgliedschaft|kategorie|typ/], ["grp", /register|sektion|bereich|gruppe|instrument|abteilung|team/], ["name", /name|mitglied/]];
  function ifl(k) { return k === "grp" ? S.P.glbl : IF.filter(function (f) { return f[0] === k; })[0][1]; }
  function impHd(sub) {
    return '<div class="mcard__hd"><i><svg><use href="#i-sheet"/></svg></i><span><b>Mitglieder importieren</b><small>' + esc(sub) + '</small></span><button type="button" class="mcard__x" data-imp-x aria-label="Import schließen"><svg><use href="#i-x"/></svg></button></div>';
  }
  function impSteps(n) {
    return '<ol class="imp__steps">' + ["Datei", "Spalten", "Prüfen"].map(function (t, i) { return '<li class="' + (i < n ? "is-done" : i === n ? "is-on" : "") + '"><i>' + (i < n ? '<svg><use href="#i-check"/></svg>' : i + 1) + "</i>" + t + "</li>"; }).join("") + "</ol>";
  }
  function impShow(html) {
    mcard.hidden = true; bview.hidden = true; bankv.hidden = true;
    impv.innerHTML = html; impv.hidden = false; impv.scrollTop = 0;
    impv.querySelector(".mcard__x").focus({ preventScroll: true });
  }
  function openImp() {
    IMP = null;
    impShow(impHd("Excel oder CSV · Schritt 1 von 3") + impSteps(0) +
      '<div class="imp__b"><label class="imp__drop" data-imp-drop><svg><use href="#i-send"/></svg><b>Excel- oder CSV-Datei hierher ziehen</b><small>oder <u>am Gerät auswählen</u> · .xlsx, .csv</small><input type="file" accept=".xlsx,.csv,.txt,text/csv" data-imp-file></label>' +
      '<div class="imp__or"><span>oder gleich ausprobieren</span></div>' +
      '<button class="dbtn sm" type="button" data-imp-demo><svg><use href="#i-users"/></svg>Musterliste mit 12 Mitgliedern laden</button>' +
      '<p class="bank__n">Die Spalten dürfen heißen, wie sie wollen, die App erkennt sie selbst. In dieser Vorführung bleibt eure Datei im Browser und wird nirgends hochgeladen.</p></div>' +
      '<div class="mcard__ft"><button class="dbtn sm ghost" type="button" data-imp-tpl><svg><use href="#i-dl"/></svg>Musterliste als Datei</button></div>');
  }
  // Musterliste: neue Namen plus absichtlich ein Doppelter, fehlende E-Mails und ein unklares Datum
  function impSample() {
    var P = S.P, used = {}, rows = [], r = rnd(S.mem.length * 31 + 7);
    S.mem.forEach(function (m) { used[m.name] = 1; });
    var mk = function () { var n, f, l; do { f = FIRST[Math.floor(r() * FIRST.length)]; l = LAST[Math.floor(r() * LAST.length)]; n = f + " " + l; } while (used[n]); used[n] = 1; return [f, l]; };
    for (var i = 0; i < 12; i++) {
      var fl = mk(), a = i % 5 === 3 ? 1 : i % 7 === 5 ? 2 : 0, y = YEAR - 1 - Math.floor(r() * 25);
      rows.push([fl[0], fl[1], P.groups[Math.floor(r() * P.groups.length)], "1." + (1 + Math.floor(r() * 12)) + "." + y, P.arts[a].l,
        (fl[0] + "." + fl[1]).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss") + "@example.at", "+43 660 " + (1000000 + Math.floor(r() * 8999999)), r() < 0.7 ? "ja" : "nein"]);
    }
    var d = S.mem[17].name.split(" ");
    rows[4] = [d[0], d.slice(1).join(" "), S.mem[17].grp, "1.3." + S.mem[17].seit, P.arts[S.mem[17].art].l, "", "", "ja"];
    rows[2][5] = ""; rows[9][5] = "";
    rows[7][3] = "Frühjahr ?";
    return [["Vorname", "Familienname", P.glbl, "Eintritt", "Mitgliedsart", "Mail", "Handy", "Beitrag " + YEAR + " bezahlt"]].concat(rows);
  }
  function impLoad(name, rows) {
    rows = rows.filter(function (r) { return r.some(function (v) { return String(v).trim(); }); });
    if (rows.length < 2) { toast("Keine Mitglieder gefunden", "die Datei braucht eine Kopfzeile und mindestens eine Zeile"); return; }
    var head = rows[0].map(function (h) { return String(h).trim(); }), map = [], taken = {};
    head.forEach(function (h, i) {
      var l = h.toLowerCase(), k = "";
      IRX.some(function (x) { if (!taken[x[0]] && x[1].test(l)) { k = x[0]; return true; } return false; });
      if (k) taken[k] = 1;
      map[i] = k;
    });
    IMP = { name: name, head: head, rows: rows.slice(1, 5001), map: map, auto: map.slice() };
    impMap();
  }
  function impMap() {
    var I = IMP, ex = I.rows[0];
    impShow(impHd(I.rows.length + " Zeilen in „" + I.name + "“ · Schritt 2 von 3") + impSteps(1) +
      '<div class="imp__b"><p class="imp__lead">So habe ich eure Spalten verstanden. Passt etwas nicht, einfach umstellen.</p><ul class="imp__map">' +
      I.head.map(function (h, i) {
        return '<li class="' + (I.map[i] ? "ok" : "") + '"><span><b>' + esc(h || "Spalte " + (i + 1)) + "</b><small>z. B. " + esc(String(ex[i] == null || ex[i] === "" ? "leer" : ex[i]).slice(0, 28)) + '</small></span><svg class="imp__ar"><use href="#i-arrow"/></svg><select data-imp-col="' + i + '" aria-label="Spalte ' + esc(h) + ' zuordnen">' +
          IF.map(function (f) { return '<option value="' + f[0] + '"' + (I.map[i] === f[0] ? " selected" : "") + ">" + esc(ifl(f[0])) + "</option>"; }).join("") + "</select></li>";
      }).join("") + "</ul><p class=\"bank__n\" data-imp-need hidden>Bitte eine Spalte als Name, Vorname oder Nachname zuordnen.</p></div>" +
      '<div class="mcard__ft"><button class="dbtn sm ghost" type="button" data-imp-back="0">Andere Datei</button><button class="dbtn sm" type="button" data-imp-chk>Weiter zur Prüfung<svg><use href="#i-arrow"/></svg></button></div>');
  }
  function impYear(v) {
    v = String(v == null ? "" : v).trim(); if (!v) return 0;
    if (/^\d+(\.\d+)?$/.test(v) && +v > 20000 && +v < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.round(+v) * 864e5).getUTCFullYear();
    var m = v.match(/(19|20)\d\d/); if (m && +m[0] <= YEAR) return +m[0];
    var s = v.match(/\b(\d\d)$/); if (s && /[./-]/.test(v)) { var y = 2000 + +s[1]; return y > YEAR ? y - 100 : y; }
    return -1;
  }
  function impCheck() {
    var I = IMP, col = {}, seen = {}, out = [];
    I.map.forEach(function (k, i) { if (k && col[k] == null) col[k] = i; });
    if (col.name == null && col.vn == null && col.nn == null) { $("[data-imp-need]", impv).hidden = false; return; }
    S.mem.forEach(function (m) { seen[m.name.toLowerCase()] = m; });
    var G = {}; S.P.groups.forEach(function (g) { G[g.toLowerCase()] = g; });
    var gv = function (r, k) { return col[k] == null ? "" : String(r[col[k]] == null ? "" : r[col[k]]).trim(); };
    I.rows.forEach(function (r) {
      var name = (gv(r, "vn") + " " + gv(r, "nn")).trim() || gv(r, "name"), why = [], st = "ok";
      name = name.replace(/\s+/g, " ").slice(0, 40);
      if (!name) return;
      var d = seen[name.toLowerCase()];
      if (d) { out.push({ s: "x", name: name, why: d.nr ? "schon Mitglied (" + mnr(d) + "), wird nicht doppelt angelegt" : "kommt in der Datei zweimal vor" }); return; }
      seen[name.toLowerCase()] = { name: name };
      var gr = gv(r, "grp"), g = G[gr.toLowerCase()];
      if (!g) { g = gr || "–"; if (gr) why.push(S.P.glbl + " „" + gr + "“ wird neu angelegt"); }
      var y = impYear(gv(r, "seit"));
      if (y < 0) { why.push("Eintritt „" + gv(r, "seit") + "“ unklar, bitte nachtragen"); y = YEAR; st = "q"; } else if (!y) y = YEAR;
      var av = gv(r, "art").toLowerCase(), a = 0;
      S.P.arts.forEach(function (x, j) { if (av && (av === x.l.toLowerCase() || av === x.k)) a = j; });
      if (/jugend|kind|schüler|ermäßigt/.test(av)) a = 1; else if (/unterst|förder|passiv/.test(av)) a = 2;
      var mail = gv(r, "mail");
      if (col.mail != null && !mail) { why.push("ohne E-Mail, Zahlschein kommt per Post"); st = "q"; }
      else if (mail && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(mail)) { why.push("E-Mail „" + mail + "“ sieht falsch aus"); st = "q"; }
      var pv = gv(r, "st").toLowerCase();
      out.push({ s: st, name: name, why: why.join(" · "), m: { name: name, grp: g, seit: y, art: a, role: "", st: /^(ja|j|x|1|bezahlt|ok|yes|✓)$/.test(pv) ? "ok" : "bad", mail: mail, tel: gv(r, "tel") } });
    });
    I.out = out;
    var n = { ok: 0, q: 0, x: 0 }; out.forEach(function (o) { n[o.s]++; });
    var take = n.ok + n.q, ord = { x: 0, q: 1, ok: 2 }, list = out.slice().sort(function (a, b) { return ord[a.s] - ord[b.s]; }), shown = list.slice(0, 60);
    impShow(impHd(take + " von " + out.length + " werden übernommen · Schritt 3 von 3") + impSteps(2) +
      '<div class="imp__b"><div class="imp__sum"><span class="ok"><b>' + n.ok + '</b>passen</span><span class="q"><b>' + n.q + '</b>mit Hinweis</span><span class="x"><b>' + n.x + "</b>doppelt</span></div>" +
      '<ul class="bank__l imp__l">' + shown.map(function (o) {
        var ic = o.s === "ok" ? "i-check" : o.s === "q" ? "i-search" : "i-x", m = o.m;
        return '<li class="' + o.s + '"><i><svg><use href="#' + ic + '"/></svg></i><span><b>' + esc(o.name) + "</b><small>" + esc(o.why || (m.grp + " · seit " + m.seit + " · " + S.P.arts[m.art].l + " · Beitrag " + ST[m.st])) + "</small></span><em>" + (o.s === "x" ? "übersprungen" : o.s === "q" ? "prüfen" : "neu") + "</em></li>";
      }).join("") + "</ul>" + (list.length > shown.length ? '<p class="imp__more">… und ' + (list.length - shown.length) + " weitere ohne Auffälligkeiten</p>" : "") + "</div>" +
      '<div class="mcard__ft"><button class="dbtn sm ghost" type="button" data-imp-back="1">Spalten ändern</button><button class="dbtn sm" type="button" data-imp-go' + (take ? "" : " disabled") + "><svg><use href=\"#i-check\"/></svg>" + (take === 1 ? "1 Mitglied" : take + " Mitglieder") + " übernehmen</button></div>");
  }
  function impGo() {
    var add = IMP.out.filter(function (o) { return o.m; }), q = 0;
    add.forEach(function (o) { var m = o.m; m.nr = S.mem.length + 1; S.mem.push(m); S.newMem[m.nr] = 1; if (o.s === "q") q++; });
    S.filter = "alle"; S.q = ""; $("[data-m-q]").value = "";
    $$("[data-f]", $("[data-m-flt]")).forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-f") === "alle"); });
    renderMembers(); renderKpis(); renderOpen(); flash("[data-k-mem]");
    feed("pop", "i-sheet", add.length + " Mitglieder aus „" + IMP.name + "“ importiert");
    toast(add.length + " Mitglieder importiert", "ganz oben in der Liste");
    impShow(impHd("Fertig") + '<div class="imp__done"><i><svg><use href="#i-check"/></svg></i><b>' + add.length + " Mitglieder übernommen</b><p>Sie stehen ganz oben in der Liste, mit " + esc(S.P.glbl) + ", Eintritt und Beitrag." + (q ? " " + q + (q === 1 ? " hat" : " haben") + " einen Hinweis, das könnt ihr in Ruhe nachtragen." : "") + " Wer eine E-Mail hat, kann gleich einen Zugang zur App bekommen.</p></div>" +
      '<div class="mcard__ft"><button class="dbtn sm" type="button" data-imp-x>Liste ansehen</button></div>');
    IMP = null;
  }
  // CSV: Trennzeichen ; , oder Tab, Anführungszeichen nach Excel-Art
  function parseCsv(t) {
    t = t.replace(/^﻿/, "");
    var l1 = t.split(/\r?\n/)[0], dl = [";", "\t", ","].sort(function (a, b) { return l1.split(b).length - l1.split(a).length; })[0];
    var rows = [], row = [], v = "", q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { v += '"'; i++; } else q = false; } else v += c; }
      else if (c === '"') q = true;
      else if (c === dl) { row.push(v); v = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(v); rows.push(row); row = []; v = ""; }
      else v += c;
    }
    if (v || row.length) { row.push(v); rows.push(row); }
    return rows;
  }
  // Excel (.xlsx) ohne Zusatzbibliothek: ZIP öffnen, erstes Tabellenblatt lesen
  function unzip(buf) {
    var dv = new DataView(buf), u8 = new Uint8Array(buf), e = buf.byteLength - 22, files = {};
    while (e > 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e <= 0) return Promise.reject(new Error("zip"));
    var p = dv.getUint32(e + 16, true), n = dv.getUint16(e + 10, true), td = new TextDecoder();
    for (var i = 0; i < n; i++) {
      var meth = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      var nm = td.decode(u8.subarray(p + 46, p + 46 + nl)), st = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
      files[nm] = { m: meth, d: u8.subarray(st, st + cs) };
      p += 46 + nl + xl + cl;
    }
    return Promise.resolve(function (name) {
      var f = files[name]; if (!f) return Promise.resolve("");
      if (f.m === 0) return Promise.resolve(td.decode(f.d));
      return new Response(new Blob([f.d]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
    });
  }
  function parseXlsx(buf) {
    return unzip(buf).then(function (get) {
      return Promise.all([get("xl/sharedStrings.xml"), get("xl/worksheets/sheet1.xml")]);
    }).then(function (x) {
      var dp = new DOMParser(), ss = [], rows = [];
      if (x[0]) Array.prototype.forEach.call(dp.parseFromString(x[0], "application/xml").getElementsByTagName("si"), function (si) {
        ss.push(Array.prototype.map.call(si.getElementsByTagName("t"), function (t) { return t.textContent; }).join(""));
      });
      var sh = dp.parseFromString(x[1], "application/xml");
      Array.prototype.forEach.call(sh.getElementsByTagName("row"), function (rw) {
        var row = [];
        Array.prototype.forEach.call(rw.getElementsByTagName("c"), function (c) {
          var ref = (c.getAttribute("r") || "").replace(/\d+/g, ""), ci = 0;
          for (var j = 0; j < ref.length; j++) ci = ci * 26 + ref.charCodeAt(j) - 64;
          ci = ref ? ci - 1 : row.length;
          var t = c.getAttribute("t"), v = c.getElementsByTagName("v")[0], val = v ? v.textContent : "";
          if (t === "s") val = ss[+val] || "";
          else if (t === "inlineStr") val = Array.prototype.map.call(c.getElementsByTagName("t"), function (n) { return n.textContent; }).join("");
          while (row.length < ci) row.push("");
          row[ci] = val;
        });
        rows.push(row);
      });
      var w = rows.reduce(function (a, r) { return Math.max(a, r.length); }, 0);
      return rows.map(function (r) { while (r.length < w) r.push(""); return r; });
    });
  }
  function impFile(f) {
    if (!f) return;
    if (f.size > 8e6) { toast("Datei zu groß", "bitte höchstens 8 MB"); return; }
    if (/\.xls$/i.test(f.name)) { toast("Altes Excel-Format", "bitte in Excel als .xlsx oder CSV speichern"); return; }
    var x = /\.xlsx$/i.test(f.name);
    if (x && !window.DecompressionStream) { toast("Excel hier nicht lesbar", "bitte als CSV speichern oder anderen Browser nehmen"); return; }
    (x ? f.arrayBuffer().then(parseXlsx) : f.text().then(parseCsv)).then(function (rows) { impLoad(f.name, rows); }, function () {
      toast("Datei nicht lesbar", "bitte als .xlsx oder CSV speichern");
    });
  }
  $("[data-imp]").addEventListener("click", openImp);
  impv.addEventListener("click", function (e) {
    if (e.target.closest("[data-imp-x]")) { impv.hidden = true; $("[data-imp]").focus({ preventScroll: true }); return; }
    if (e.target.closest("[data-imp-demo]")) { impLoad("Mitglieder_alt.xlsx", impSample()); return; }
    if (e.target.closest("[data-imp-tpl]")) { csv("mitglieder-zum-importieren.csv", impSample()); toast("Musterliste heruntergeladen", "öffnen, ändern und wieder hochladen"); return; }
    var b = e.target.closest("[data-imp-back]");
    if (b) { if (b.getAttribute("data-imp-back") === "0") openImp(); else impMap(); return; }
    if (e.target.closest("[data-imp-chk]")) { impCheck(); return; }
    if (e.target.closest("[data-imp-go]")) impGo();
  });
  impv.addEventListener("change", function (e) {
    if (e.target.matches("[data-imp-file]")) { impFile(e.target.files[0]); return; }
    var s = e.target.closest("[data-imp-col]"); if (!s || !IMP) return;
    var i = +s.getAttribute("data-imp-col"), k = s.value;
    if (k) IMP.map.forEach(function (v, j) { if (v === k && j !== i) { IMP.map[j] = ""; var o = $('[data-imp-col="' + j + '"]', impv); o.value = ""; o.closest("li").className = ""; } });
    IMP.map[i] = k; s.closest("li").className = k ? "ok" : "";
    $("[data-imp-need]", impv).hidden = true;
  });
  ["dragover", "dragleave", "drop"].forEach(function (t) {
    impv.addEventListener(t, function (e) {
      var d = e.target.closest && e.target.closest("[data-imp-drop]"); if (!d) return;
      e.preventDefault(); d.classList.toggle("is-over", t === "dragover");
      if (t === "drop" && e.dataTransfer.files[0]) impFile(e.dataTransfer.files[0]);
    });
  });

  $("[data-remind]").addEventListener("click", function () {
    var l = S.mem.filter(function (m) { return m.st === "bad"; }), n = l.length;
    l.forEach(function (m) { m.rem = (m.rem || 0) + 1; });
    S.rem++;
    flyEnvelope(this);
    if (S.rem === 1) {
      feed("", "i-mail", "Zahlschein mit QR-Code an " + n + " Mitglieder geschickt");
      toast(n + " E-Mails mit Zahlschein", "jeder mit eigenem Betrag und QR-Code");
    } else {
      feed("", "i-mail", S.rem + ". Erinnerung an " + n + " Mitglieder geschickt, freundlich formuliert");
      toast(S.rem + ". Erinnerung verschickt", n + " Mitglieder · wer zahlt, fällt automatisch raus");
    }
    renderOpen();
  });

  function flyEnvelope(btn) {
    if (reduce) return;
    var box = btn.closest(".box"), r = btn.getBoundingClientRect(), b = box.getBoundingClientRect(), z = box.offsetWidth ? b.width / box.offsetWidth : 1;
    var e = document.createElement("span");
    e.className = "env"; e.setAttribute("aria-hidden", "true");
    e.innerHTML = '<i class="env__brief"><b></b><b></b><b></b></i><i class="env__kuv"></i><i class="env__lasche"></i>';
    e.style.left = ((r.left - b.left + r.width / 2) / z - 39) + "px"; e.style.top = ((r.top - b.top) / z - 66) + "px";
    box.appendChild(e);
    setTimeout(function () { e.remove(); }, 1900);
  }

  // Termine im Vorstand
  function renderDeskEvents() {
    $("[data-d-evs]").innerHTML = S.ev.map(function (e) {
      var all = Math.max(1, e.yes + e.no);
      return '<div class="dev' + (e.fresh ? " is-new" : "") + '" data-evi="' + S.ev.indexOf(e) + '"><span class="dev__d"><b>' + ("0" + e.d.getDate()).slice(-2) + "</b>" + MON[e.d.getMonth()] + '</span><span class="dev__t"><b>' + esc(e.t) + (e.g ? '<em class="dev__g">nur ' + esc(e.g) + "</em>" : "") + "</b><small>" + WT[e.d.getDay()] + " · " + esc(e.h) + " Uhr · " + esc(e.o) + '</small><span class="dev__bar"><i style="width:' + (e.yes / all * 100) + '%"></i><i style="width:' + (e.no / all * 100) + '%"></i></span></span><span class="dev__n"><b>' + e.yes + "</b>" + e.no + " Absagen" + (e.cm.length ? '<span class="dev__c"><svg><use href="#i-chat"/></svg>' + e.cm.length + "</span>" : "") + "</span></div>";
    }).join("");
  }
  var evD = $("[data-ev-d]");
  $("[data-ev-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = $("[data-ev-t]").value.trim().slice(0, 40), d = evD.value ? new Date(evD.value + "T00:00:00") : null, h = $("[data-ev-h]").value || "19:30";
    if (!t || !d || isNaN(d)) return;
    var g = $("[data-ev-g]").value;
    var ev = { id: "n" + Date.now(), t: t, o: "Vereinsheim", h: h, d: d, yes: 0, no: 0, mine: "", fresh: true, cm: [], g: g };
    S.ev.push(ev); S.ev.sort(function (a, b) { return a.d - b.d; });
    $("[data-ev-t]").value = "";
    renderDeskEvents(); renderPhoneEvents(); renderKpis(); renderWeek();
    feed("", "i-cal", "Termin „" + t + "“ am " + dshort(d) + " angelegt");
    if (g) toast("Termin ist in der App", "nur bei " + S.P.glbl + " " + g + (g === S.me.grp ? ", also auch bei " + S.me.name.split(" ")[0] : ", " + S.me.name.split(" ")[0] + " sieht ihn nicht"));
    else toast("Termin ist in der App", "alle Mitglieder können zu- oder absagen");
  });

  // Kassabuch
  var STO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';
  function logC(t) {
    var n = new Date();
    S.log.unshift({ w: S.P.board[2][1], t: t, s: "heute " + ("0" + n.getHours()).slice(-2) + ":" + ("0" + n.getMinutes()).slice(-2) });
    if (S.ro) renderLog();
  }
  function renderCash() {
    var s = cashSums(), cats = {};
    $("[data-c-sum]").textContent = eur(s.sum, true);
    $("[data-c-in]").textContent = eur(s.inn, true);
    $("[data-c-out]").textContent = eur(s.out, true);
    S.cash.forEach(function (c) { if (!c.sto) cats[c.c] = (cats[c.c] || 0) + c.a; });
    var keys = Object.keys(cats).sort(function (a, b) { return Math.abs(cats[b]) - Math.abs(cats[a]); }).slice(0, 6);
    var max = Math.max.apply(null, keys.map(function (k) { return Math.abs(cats[k]); }).concat([1]));
    $("[data-c-cats]").innerHTML = keys.map(function (k) {
      var v = cats[k];
      return '<div class="cat"><span>' + esc(k) + '</span><span class="b"><i class="' + (v >= 0 ? "in" : "out") + '" style="width:' + (Math.abs(v) / max * 100) + '%"></i></span><span>' + (v >= 0 ? "+" : "−") + eur(Math.abs(Math.round(v))) + "</span></div>";
    }).join("");
    $("[data-c-rows]").innerHTML = S.cash.map(function (c, i) {
      var bel = c.sto ? '<em class="sto-t">storniert</em>' : c.beleg ? '<button type="button" class="bel" data-bel="' + i + '" title="Beleg ansehen" aria-label="Beleg zu ' + esc(c.t) + ' ansehen"><svg><use href="#i-file"/></svg></button>'
        : c.a < 0 && !c.m ? '<button type="button" class="bel no" data-bel-add="' + i + '" title="Foto vom Beleg nachreichen">Beleg fehlt</button>' : "";
      var sto = c.sto || c.m ? "" : '<button type="button" class="sto" data-sto="' + i + '" title="Stornieren" aria-label="' + esc(c.t) + ' stornieren">' + STO + "</button>";
      var amt = (c.a >= 0 ? "+ " : "− ") + eur(Math.abs(c.a), true);
      return "<tr" + (c.fresh ? ' class="is-new"' : c.sto ? ' class="is-sto"' : "") + "><td>" + dshort(c.d) + '<small class="bn">Nr. ' + ("00" + c.bn).slice(-3) + '</small></td><td><span class="bt"><span>' + esc(c.t) + "</span>" + bel + sto + "</span></td><td>" + esc(c.c) + '</td><td class="r ' + (c.a >= 0 ? "in" : "out") + '">' + (c.sto ? "<s>" + amt + "</s>" : amt) + "</td></tr>";
    }).join("");
    if (S.ro) renderLog();
  }
  $(".addc__io").addEventListener("click", function (e) {
    var b = e.target.closest("[data-io]"); if (!b) return;
    $$("[data-io]", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); S.io = b.getAttribute("data-io");
  });
  $("[data-c-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = $("[data-c-t]").value.trim().slice(0, 40), a = parseFloat(($("[data-c-a]").value || "").replace(/\./g, "").replace(",", "."));
    if (!t || !(a > 0) || a > 100000) { toast("Bitte Text und Betrag eingeben", "z. B. 86,50"); return; }
    a = Math.round(a * 100) / 100;
    S.cash.forEach(function (c) { c.fresh = false; });
    S.cash.unshift({ d: new Date(today), t: t, c: S.io === "in" ? "Sonstige Einnahmen" : "Sonstige Ausgaben", a: S.io === "in" ? a : -a, fresh: true, beleg: cBel, bn: ++S.bn });
    logC("Nr. " + bnr(S.cash[0]) + " gebucht: „" + t + "“ " + (S.io === "in" ? "+ " : "− ") + eur(a, true) + (cBel ? " mit Beleg" : ""));
    $("[data-c-t]").value = ""; $("[data-c-a]").value = "";
    feed(S.io === "in" ? "ok" : "bad", "i-book", "Gebucht: " + t + " (" + (S.io === "in" ? "+" : "−") + eur(a, true) + ")" + (cBel ? " mit Beleg" : ""));
    setBel("");
    renderCash(); renderKpis();
  });

  // ---------- Belege per Foto ----------
  // Fotos bleiben nur im Browser; verkleinert, damit auch große Handyfotos flott gehen
  var cBel = "", belFor = null, bview = $("[data-bview]");
  function readPhoto(f, done) {
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast("Bitte ein Foto wählen", "JPG, PNG oder HEIC vom Handy"); return; }
    if (f.size > 25 * 1024 * 1024) { toast("Das Foto ist zu groß", "bitte höchstens 25 MB"); return; }
    var url = URL.createObjectURL(f), im = new Image();
    im.onload = function () {
      var k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement("canvas");
      cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      done(cv.toDataURL("image/jpeg", 0.85));
    };
    im.onerror = function () { URL.revokeObjectURL(url); toast("Das Foto lässt sich nicht öffnen", "bitte ein anderes probieren"); };
    im.src = url;
  }
  function setBel(src) {
    cBel = src;
    var l = $("[data-c-bl]"), old = l.querySelector("img");
    if (old) old.remove();
    l.classList.toggle("has", !!src);
    $("[data-c-bt]").textContent = src ? "Beleg ✓" : "Beleg";
    if (src) { var im = document.createElement("img"); im.src = src; im.alt = ""; l.insertBefore(im, l.querySelector("svg")); }
  }
  $("[data-c-file]").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = "";
    readPhoto(f, function (src) { setBel(src); toast("Beleg ist dabei", "wird mit der nächsten Buchung gespeichert"); });
  });
  $("[data-c-later]").addEventListener("change", function () {
    var f = this.files && this.files[0], c = belFor; this.value = "";
    if (!c) return;
    readPhoto(f, function (src) {
      c.beleg = src; c.fresh = true; logC("Beleg zu Nr. " + bnr(c) + " nachgereicht"); renderCash();
      feed("ok", "i-file", "Beleg nachgereicht: " + c.t);
      toast("Beleg gespeichert", c.t + " · die Rechnungsprüfer sehen ihn");
    });
  });
  function bon(c) {
    var n = YEAR + "-" + ("00" + (c.nr || 1) * 7).slice(-3), b = eur(-c.a, true);
    return '<div class="bon"><b>Musterfirma GmbH</b><small>Musterstraße 1</small><small>Rechnung ' + n + " · " + dshort(c.d) + c.d.getFullYear() + "</small><hr>" +
      '<div class="bon__r"><span>' + esc(c.t) + "</span><span>" + b + '</span></div><hr><div class="bon__r sum"><span>Summe</span><span>' + b + "</span></div><small>Betrag dankend erhalten</small><em>Musterbeleg</em></div>";
  }
  function openBel(c) {
    mcard.hidden = true;
    bview.innerHTML = '<div class="mcard__hd"><i><svg><use href="#i-file"/></svg></i><span><b>' + esc(c.t) + "</b><small>" + dshort(c.d) + c.d.getFullYear() + " · " + esc(c.c) + " · " + (c.a < 0 ? "− " : "+ ") + eur(Math.abs(c.a), true) + '</small></span><button type="button" class="mcard__x" data-bv-x aria-label="Beleg schließen"><svg><use href="#i-x"/></svg></button></div>' +
      '<div class="bview__in">' + (c.beleg === "muster" ? bon(c) : '<img src="' + esc(c.beleg) + '" alt="Foto des Belegs">') + "</div>" +
      '<div class="mcard__ft"><button class="dbtn sm ghost" type="button" data-bv-x>Schließen</button></div>';
    bview.hidden = false; impv.hidden = true;
    bview.querySelector(".mcard__x").focus({ preventScroll: true });
  }
  bview.addEventListener("click", function (e) { if (e.target.closest("[data-bv-x]")) bview.hidden = true; });
  $("[data-c-rows]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-bel]");
    if (b) { openBel(S.cash[+b.getAttribute("data-bel")]); return; }
    var a = e.target.closest("[data-bel-add]");
    if (a) { if (S.ro) return; belFor = S.cash[+a.getAttribute("data-bel-add")]; $("[data-c-later]").click(); return; }
    var x = e.target.closest("[data-sto]");
    if (x && !S.ro) {
      var c = S.cash[+x.getAttribute("data-sto")];
      S.cash.forEach(function (q) { q.fresh = false; });
      c.sto = true;
      logC("Nr. " + bnr(c) + " storniert: „" + c.t + "“");
      feed("", "i-book", "Storniert: " + c.t + " (Nr. " + bnr(c) + ")");
      toast("Storniert", "Nr. " + bnr(c) + " bleibt sichtbar, zählt aber nicht mehr");
      renderCash(); renderKpis(); flash("[data-k-cash]");
    }
  });
  // Rechnungsprüfer: eigener Zugang nur zum Lesen, mit Änderungsprotokoll
  function renderLog() {
    $("[data-c-log]").innerHTML = S.log.slice(0, 8).map(function (l) {
      return "<li><span>" + esc(l.t) + "</span><small>" + esc(l.w) + " · " + esc(l.s) + "</small></li>";
    }).join("");
  }
  function setRo(on) {
    S.ro = on;
    var k = $(".kasse");
    k.classList.toggle("is-ro", on);
    $("[data-c-ro]").hidden = !on; $("[data-c-logbox]").hidden = !on;
    $("[data-ro-url]").textContent = S.P.url.split("/")[0] + "/pruefung";
    $("[data-pruef]").setAttribute("aria-pressed", on);
    if (on) { renderLog(); toast("Ansicht der Rechnungsprüfer", "nur lesen, Buchungen ändern geht nicht"); }
  }
  $("[data-pruef]").addEventListener("click", function () { setRo(!S.ro); });
  $("[data-ro-x]").addEventListener("click", function () { setRo(false); });

  // Kassabericht und Übergabeprotokoll als druckfertige Seiten (im Druckfenster „Als PDF speichern“)
  function docOpen(title, body) {
    var w = window.open("", "_blank");
    if (!w) { toast("Fenster wurde blockiert", "bitte Pop-ups für diese Seite erlauben"); return; }
    var vc = S.brand.color, B = S.brand;
    var lg = B.type === "bild" && B.img ? '<img src="' + esc(B.img) + '" alt="">' : esc(B.short || ini(B.name));
    w.document.open();
    w.document.write('<!doctype html><html lang="de-AT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + "</title><style>" +
      ":root{--vc:" + vc + ";--ink:#14171f;--mu:#5b6270;--ln:#dfe2e8}*{box-sizing:border-box;margin:0}" +
      "body{font:14px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink);background:#e9ebef;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".bar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:12px 16px;background:#14171f;color:#fff;font-size:13px}" +
      ".bar button{font:700 14px/1 inherit;padding:11px 18px;border:0;border-radius:999px;background:var(--vc);color:#fff;cursor:pointer}.bar span{opacity:.75}" +
      ".pg{width:210mm;max-width:100%;min-height:297mm;margin:18px auto;padding:18mm 17mm 16mm;background:#fff;box-shadow:0 10px 40px -18px rgba(0,0,0,.35);position:relative;display:flex;flex-direction:column}" +
      ".pg>footer{margin-top:auto;padding-top:14px;border-top:1px solid var(--ln);display:flex;justify-content:space-between;gap:10px;font-size:10.5px;color:var(--mu)}" +
      "h1{font-size:34px;line-height:1.1;letter-spacing:-.02em}h2{font-size:21px;margin-bottom:4px;letter-spacing:-.01em}h3{font-size:14px;margin:18px 0 6px}.sub{color:var(--mu);margin-bottom:14px}" +
      ".cv{justify-content:flex-start}.cv__band{position:absolute;left:0;right:0;top:0;height:9mm;background:var(--vc)}.cv__lg{width:30mm;height:30mm;border-radius:50%;background:var(--vc);color:#fff;display:grid;place-items:center;font-weight:800;font-size:30px;margin:26mm 0 12mm;overflow:hidden}.cv__lg img{width:100%;height:100%;object-fit:cover}" +
      ".cv h1{font-size:44px}.cv .v{font-size:20px;font-weight:700;margin-top:6px}.cv dl{display:grid;grid-template-columns:auto 1fr;gap:6px 18px;margin:14mm 0 10mm;font-size:14px}.cv dt{color:var(--mu)}" +
      ".toc{list-style:none;padding:0;border-top:2px solid var(--ink)}.toc li{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--ln)}" +
      ".tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.tile{border:1px solid var(--ln);border-radius:10px;padding:14px}.tile small{display:block;color:var(--mu);font-size:12px}.tile b{font-size:26px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.tile.hl{background:var(--vc);border-color:var(--vc);color:#fff}.tile.hl small{color:rgba(255,255,255,.8)}" +
      "table{width:100%;border-collapse:collapse;font-size:12.5px}th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--mu);padding:6px 6px;border-bottom:2px solid var(--ink)}td{padding:6px 6px;border-bottom:1px solid var(--ln);vertical-align:top}" +
      ".r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}tr.s td{font-weight:800;border-top:2px solid var(--ink);border-bottom:0}tr.h td{font-weight:700;background:#f4f5f7}tr.x td{color:#9aa0aa;text-decoration:line-through}tr.x td.st{text-decoration:none;font-style:italic}" +
      ".miss{color:#c0392b;font-weight:700}.note{font-size:12px;color:var(--mu);margin-top:8px}.box{border:1px solid var(--ln);border-radius:10px;padding:12px 14px;margin-top:12px}" +
      ".two{display:grid;grid-template-columns:1fr 1fr;gap:18px}.chk{list-style:none;padding:0}.chk li{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--ln)}.chk li:before{content:'';flex:none;width:14px;height:14px;border:1.5px solid var(--ink);border-radius:3px;margin-top:3px}" +
      ".sig{display:grid;grid-template-columns:1fr 1fr;gap:16mm 14mm;margin-top:18mm}.sig div{border-top:1.5px solid var(--ink);padding-top:6px;font-size:12px}.sig small{display:block;color:var(--mu)}" +
      ".mu{color:var(--mu)}.big{font-size:15px}" +
      "@media(max-width:820px){.pg{min-height:0;padding:22px 18px;margin:10px auto}.cv__lg{margin:30px 0 20px}.two,.tiles{grid-template-columns:1fr}h1,.cv h1{font-size:30px}.sig{gap:34px 18px}}" +
      "@page{size:A4;margin:0}@media print{body{background:#fff}.bar{display:none}.pg{margin:0;box-shadow:none;width:auto;min-height:297mm;page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto;break-after:auto}tr{break-inside:avoid}}" +
      '</style></head><body><div class="bar"><button type="button">Als PDF speichern oder drucken</button><span>Im Druckfenster „Als PDF speichern“ wählen · Musterdaten</span></div>' +
      body.replace(/\{LG\}/g, lg) + "</body></html>");
    w.document.close();
    w.document.querySelector(".bar button").addEventListener("click", function () { w.print(); });
    w.focus();
  }
  function foot(n, of) {
    return '<footer><span>' + esc(S.brand.name) + " · Musterdaten · erstellt mit der Vereins-App</span><span>App von Tim Kofler – Webdesign" + (n ? " · Seite " + n + " von " + of : "") + "</span></footer>";
  }
  function byCat(sign) {
    var o = {};
    S.cash.forEach(function (c) { if (!c.sto && (c.a >= 0) === sign) o[c.c] = (o[c.c] || 0) + Math.abs(c.a); });
    return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).map(function (k) { return [k, o[k]]; });
  }
  function kassabericht() {
    var s = cashSums(), b = S.P.board, inC = byCat(true), outC = byCat(false), res = s.inn - s.out;
    var stand = dshort(today) + YEAR, list = S.cash.slice().sort(function (x, y) { return x.bn - y.bn; });
    var outs = S.cash.filter(function (c) { return !c.sto && c.a < 0 && !c.m; }), miss = outs.filter(function (c) { return !c.beleg; });
    var nSto = S.cash.filter(function (c) { return c.sto; }).length;
    var top = function (a) { return a.slice(0, 3).map(function (x) { return "<tr><td>" + esc(x[0]) + '</td><td class="r">' + eur(x[1], true) + "</td></tr>"; }).join(""); };
    var cat = function (a) { return a.map(function (x) { return "<tr><td>" + esc(x[0]) + '</td><td class="r">' + eur(x[1], true) + "</td></tr>"; }).join(""); };
    var P = 5, h = "";
    // 1 Deckblatt
    h += '<section class="pg cv"><div class="cv__band"></div><div class="cv__lg">{LG}</div><h1>Kassabericht ' + YEAR + '</h1><p class="v">' + esc(S.brand.name) + "</p>" +
      "<dl><dt>Rechnungsjahr</dt><dd>01.01. bis 31.12." + YEAR + "</dd><dt>Stand</dt><dd>" + stand + "</dd><dt>" + esc(b[2][0]) + "</dt><dd>" + esc(b[2][1]) + "</dd><dt>" + esc(b[0][0]) + "</dt><dd>" + esc(b[0][1]) + "</dd></dl>" +
      '<ol class="toc"><li><span>1 · Kurzfassung für die Hauptversammlung</span><span>2</span></li><li><span>2 · Einnahmen-Ausgaben-Rechnung mit Vermögensübersicht</span><span>3</span></li><li><span>3 · Alle Buchungen mit Belegnummer</span><span>4</span></li><li><span>4 · Prüfvermerk und Unterschriften</span><span>5</span></li></ol>' + foot(1, P) + "</section>";
    // 2 Kurzfassung
    h += '<section class="pg"><h2>Kurzfassung für die Hauptversammlung</h2><p class="sub">Die wichtigsten Zahlen auf einer Seite, zum Vorlesen oder Herzeigen.</p>' +
      '<div class="tiles"><div class="tile"><small>Anfangsbestand 1. Jänner</small><b>' + eur(S.P.start, true) + '</b></div><div class="tile hl"><small>Kassastand ' + stand + "</small><b>" + eur(s.sum, true) + '</b></div><div class="tile"><small>Einnahmen</small><b>' + eur(s.inn, true) + '</b></div><div class="tile"><small>Ausgaben</small><b>' + eur(s.out, true) + "</b></div></div>" +
      '<p class="big">Ergebnis des Jahres bisher: <b>' + (res >= 0 ? "+ " : "− ") + eur(Math.abs(res), true) + "</b>" + (res >= 0 ? ", der Verein hat mehr eingenommen als ausgegeben." : ", der Verein hat mehr ausgegeben als eingenommen.") + "</p>" +
      '<div class="two"><div><h3>Größte Einnahmen</h3><table>' + top(inC) + "</table></div><div><h3>Größte Ausgaben</h3><table>" + top(outC) + "</table></div></div>" +
      '<div class="box">' + (outs.length - miss.length) + " von " + outs.length + " Ausgaben haben einen Beleg" + (miss.length ? '. <span class="miss">Es fehlt: ' + miss.map(function (c) { return esc(c.t) + " (Nr. " + bnr(c) + ")"; }).join(", ") + ".</span>" : ", alles vollständig.") + "</div>" + foot(2, P) + "</section>";
    // 3 Einnahmen-Ausgaben-Rechnung
    h += '<section class="pg"><h2>Einnahmen-Ausgaben-Rechnung ' + YEAR + '</h2><p class="sub">Mit Vermögensübersicht, nach Bereichen. Stornierte Buchungen zählen nicht.</p>' +
      '<table><thead><tr><th>Bereich</th><th class="r">Betrag</th></tr></thead><tbody><tr class="h"><td>Einnahmen</td><td class="r">' + eur(s.inn, true) + "</td></tr>" + cat(inC) +
      '<tr class="h"><td>Ausgaben</td><td class="r">' + eur(s.out, true) + "</td></tr>" + cat(outC) + "</tbody></table>" +
      '<h3>Vermögensübersicht</h3><table><tr><td>Anfangsbestand 1. Jänner</td><td class="r">' + eur(S.P.start, true) + '</td></tr><tr><td>Ergebnis (Einnahmen minus Ausgaben)</td><td class="r">' + (res >= 0 ? "+ " : "− ") + eur(Math.abs(res), true) + '</td></tr><tr class="s"><td>Kassa und Bank am ' + stand + '</td><td class="r">' + eur(s.sum, true) + "</td></tr></table>" +
      '<p class="note">Nach § 21 Vereinsgesetz erstellt der Vorstand binnen fünf Monaten nach Ende des Rechnungsjahres eine Einnahmen- und Ausgabenrechnung samt Vermögensübersicht. Große Vereine mit doppelter Buchhaltung brauchen zusätzlich ihren Steuerberater.</p>' + foot(3, P) + "</section>";
    // 4 Buchungen
    h += '<section class="pg"><h2>Alle Buchungen mit Belegnummer</h2><p class="sub">' + list.length + " Buchungen, Nummern fortlaufend" + (nSto ? ", davon " + nSto + " storniert" : "") + ".</p>" +
      '<table><thead><tr><th>Nr.</th><th>Datum</th><th>Buchung</th><th>Bereich</th><th class="r">Betrag</th><th>Beleg</th></tr></thead><tbody>' +
      list.map(function (c) {
        return "<tr" + (c.sto ? ' class="x"' : "") + "><td>" + bnr(c) + "</td><td>" + dshort(c.d) + "</td><td>" + esc(c.t) + "</td><td>" + esc(c.c) + '</td><td class="r">' + (c.a >= 0 ? "+ " : "− ") + eur(Math.abs(c.a), true) + "</td>" +
          (c.sto ? '<td class="st">storniert</td>' : "<td" + (c.a < 0 && !c.m && !c.beleg ? ' class="miss">fehlt' : ">" + (c.beleg ? "ja" : "")) + "</td>") + "</tr>";
      }).join("") + "</tbody></table>" +
      '<p class="note">Ein Fehler wird storniert statt gelöscht: Die Buchung bleibt mit ihrer Nummer sichtbar, zählt aber nicht mehr. So bleibt die Nummernfolge lückenlos, und jede Änderung steht im Protokoll.</p>' + foot(4, P) + "</section>";
    // 5 Prüfvermerk
    h += '<section class="pg"><h2>Prüfvermerk und Unterschriften</h2><p class="sub">Für die Rechnungsprüfer und die Hauptversammlung.</p>' +
      '<div class="box">Die Rechnungsprüfer haben Kassabuch, Belege und Kontoauszüge für das Rechnungsjahr ' + YEAR + " am ______________ geprüft.</div>" +
      '<ul class="chk" style="margin-top:12px"><li>Ohne Beanstandung. Wir empfehlen der Hauptversammlung die Entlastung des Vorstands.</li><li>Mit Anmerkungen: __________________________________________</li></ul>' +
      '<div class="sig"><div>' + esc(b[2][1]) + "<small>" + esc(b[2][0]) + "</small></div><div>" + esc(b[0][1]) + "<small>" + esc(b[0][0]) + '</small></div><div>&nbsp;<small>Rechnungsprüfer/in 1</small></div><div>&nbsp;<small>Rechnungsprüfer/in 2</small></div></div>' +
      '<p class="note" style="margin-top:14mm">Ort, Datum: ______________________</p>' + foot(5, P) + "</section>";
    docOpen("Kassabericht " + YEAR + " – " + S.brand.name, h);
    feed("", "i-file", "Kassabericht " + YEAR + " als PDF erstellt");
  }
  function uebergabe() {
    var s = cashSums(), b = S.P.board, stand = dshort(today) + YEAR;
    var open = S.mem.filter(function (m) { return m.st === "bad"; }), openSum = open.reduce(function (t, m) { return t + S.P.arts[m.art].b; }, 0);
    var miss = S.cash.filter(function (c) { return !c.sto && c.a < 0 && !c.m && !c.beleg; });
    var last = S.cash.reduce(function (m, c) { return Math.max(m, c.bn); }, 0);
    var h = '<section class="pg"><div class="cv__band"></div><div style="display:flex;gap:16px;align-items:center;margin-top:6mm"><div class="cv__lg" style="width:18mm;height:18mm;font-size:18px;margin:0">{LG}</div><div><h1 style="font-size:28px">Übergabeprotokoll Kassa</h1><p class="mu">' + esc(S.brand.name) + " · Stichtag " + stand + "</p></div></div>" +
      '<p style="margin-top:14px">Die Kassa gehört dem Verein. Mit diesem Protokoll übergibt ' + esc(b[2][1]) + " (bisher " + esc(b[2][0]) + ") alle Unterlagen an die Nachfolge.</p>" +
      '<h3>Bestände zum Stichtag</h3><table><tr><td>Kassa und Bank laut Kassabuch</td><td class="r"><b>' + eur(s.sum, true) + '</b></td></tr><tr><td>Barkassa gemeinsam gezählt</td><td class="r">__________ €</td></tr><tr><td>Buchungen ' + YEAR + '</td><td class="r">' + S.cash.length + ", letzte Nr. " + YEAR + "-" + ("00" + last).slice(-3) + "</td></tr></table>" +
      '<h3>Was noch offen ist</h3><table><tr><td>Offene Mitgliedsbeiträge</td><td class="r">' + open.length + " Mitglieder · " + eur(openSum, true) + '</td></tr><tr><td>Fehlende Belege</td><td class="r' + (miss.length ? ' miss">' + miss.map(function (c) { return "Nr. " + bnr(c); }).join(", ") : '">keine') + "</td></tr></table>" +
      '<h3>Checkliste</h3><ul class="chk"><li>Barkassa gemeinsam gezählt und übergeben</li><li>Kontoauszüge und Belegordner übergeben</li><li>Zeichnungsberechtigung bei der Bank geändert</li><li>Zugang zur Vereins-App für die Nachfolge angelegt</li><li>Bisheriger Zugang ausgetragen (die Daten bleiben beim Verein)</li><li>Kassabericht ' + YEAR + " als PDF übergeben</li></ul>" +
      '<div class="sig" style="margin-top:14mm"><div>' + esc(b[2][1]) + "<small>bisher " + esc(b[2][0]) + '</small></div><div>&nbsp;<small>neu ' + esc(b[2][0]) + "</small></div><div>" + esc(b[0][1]) + "<small>" + esc(b[0][0]) + '</small></div><div>&nbsp;<small>Ort, Datum</small></div></div>' + foot(0, 0) + "</section>";
    docOpen("Übergabeprotokoll Kassa – " + S.brand.name, h);
    feed("", "i-key", "Übergabeprotokoll für die Kassa erstellt");
  }
  $("[data-report]").addEventListener("click", kassabericht);
  $("[data-handover]").addEventListener("click", uebergabe);

  // CSV (Strichpunkt und BOM, damit Excel in Österreich Umlaute und Spalten richtig liest; = + - @ am Anfang
  // bekommen ein Hochkomma, damit Excel eingetippte Texte nicht als Formel ausführt)
  function csv(name, rows) {
    var txt = "﻿" + rows.map(function (r) { return r.map(function (v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";"); }).join("\r\n");
    dl(name, txt, "text/csv;charset=utf-8");
  }
  function dl(name, txt, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  $("[data-csv-m]").addEventListener("click", function () {
    csv("mitglieder-muster.csv", [["Nr", "Name", S.P.glbl, "Mitgliedschaft", "Funktion", "Mitglied seit", "Beitrag " + YEAR, "Status"]].concat(S.mem.map(function (m) {
      return ["M-" + ("000" + m.nr).slice(-4), m.name, m.grp, S.P.arts[m.art].l, m.role, m.seit, S.P.arts[m.art].b.toFixed(2).replace(".", ","), ST[m.st]];
    })));
    toast("Liste heruntergeladen", "öffnet sich direkt in Excel");
  });
  $("[data-csv-c]").addEventListener("click", function () {
    csv("kassabuch-muster.csv", [["Nr", "Datum", "Buchung", "Bereich", "Betrag", "Beleg", "Status"]].concat(S.cash.slice().sort(function (x, y) { return x.bn - y.bn; }).map(function (c) {
      return [bnr(c), dshort(c.d) + c.d.getFullYear(), c.t, c.c, c.a.toFixed(2).replace(".", ","), c.beleg ? "ja" : c.a < 0 && !c.m ? "fehlt" : "", c.sto ? "storniert" : ""];
    })));
    toast("Kassabuch heruntergeladen", "für Rechnungsprüfer oder Steuerberater");
  });

  // ---------- Flüssige Tab-Leiste: ein Tropfen fließt zum angetippten Reiter ----------
  function liquidTabs(nav, sel) {
    var blob = nav.querySelector(".tabs__blob"), cur = null;
    if (!blob) return function () {};
    function x(b) { return b.offsetLeft + b.offsetWidth / 2 - blob.offsetWidth / 2; }
    function place(b, anim) {
      var x1 = x(b);
      if (anim && cur !== null && !reduce && blob.animate) {
        var d = x1 - cur, mid = cur + d * 0.5, st = 1 + Math.min(1.6, Math.abs(d) / blob.offsetWidth * 0.55);
        blob.animate([
          { transform: "translateX(" + cur + "px) scale(1,1)" },
          { transform: "translateX(" + (cur + d * 0.18) + "px) scale(" + (st * 0.8) + ",.82)", offset: 0.25 },
          { transform: "translateX(" + mid + "px) scale(" + st + ",.7)", offset: 0.5 },
          { transform: "translateX(" + (x1 - d * 0.04) + "px) scale(.86,1.12)", offset: 0.82 },
          { transform: "translateX(" + x1 + "px) scale(1,1)" }
        ], { duration: 520, easing: "cubic-bezier(.45,.05,.25,1)" });
      }
      blob.style.transform = "translateX(" + x1 + "px)";
      blob.classList.add("on"); cur = x1;
    }
    var on = nav.querySelector(sel + '[aria-selected="true"]');
    if (on) requestAnimationFrame(function () { place(on, false); });
    window.addEventListener("resize", function () { var b = nav.querySelector(sel + '[aria-selected="true"]'); if (b) place(b, false); });
    return place;
  }
  var mTabs = $("[data-m-tabs]"), mBlob = liquidTabs(mTabs, "[data-tab]");
  mTabs.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) mBlob(b, true); });

  // ---------- Hell/Dunkel-Schalter (gilt für die ganze Seite) ----------
  var root = document.documentElement, sw = $("[data-theme-sw]");
  var isLight = function () { var t = root.getAttribute("data-theme"); return t ? t === "light" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches); };
  function syncSw() { var l = isLight(); sw.setAttribute("aria-checked", l); sw.setAttribute("aria-label", l ? "Dunkle Ansicht" : "Helle Ansicht"); }
  try { var saved = localStorage.getItem("va-theme"); if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved); } catch (e) {}
  syncSw();
  sw.addEventListener("click", function () {
    var t = isLight() ? "dark" : "light";
    root.setAttribute("data-theme", t); syncSw();
    try { localStorage.setItem("va-theme", t); } catch (e) {}
  });
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: light)"); if (mq.addEventListener) mq.addEventListener("change", syncSw); }

  // ---------- Verlaufslinien in den Kacheln ----------
  function spark(el, vals, draw) {
    var w = 120, h = 34, mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = mx - mn || 1;
    var pts = vals.map(function (v, i) { return [i / (vals.length - 1) * w, 4 + (1 - (v - mn) / rg) * (h - 8)]; });
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
    var last = pts[pts.length - 1];
    el.innerHTML = '<path class="a" d="' + d + "L" + w + " " + h + "L0 " + h + 'Z"/><path class="l" d="' + d + '"/><circle cx="' + last[0] + '" cy="' + last[1].toFixed(1) + '" r="3"/>';
    var l = el.querySelector(".l");
    if (draw && !reduce && l.getTotalLength) {
      var len = Math.ceil(l.getTotalLength()); l.style.strokeDasharray = len; l.style.setProperty("--len", len); l.classList.add("draw");
    }
  }
  var sparkDrawn = {};
  function renderSparks() {
    // Mitglieder: Stand am Ende der letzten 12 Monate (wer schon dabei war, plus leichte Austritte)
    var n = S.mem.length, mv = [];
    for (var i = 11; i >= 0; i--) mv.push(n - Math.round(i * 0.9 + (i % 3 === 1 ? 1 : 0)));
    mv[11] = n;
    // Kassastand: echte Buchungen dieses Jahres, Monat für Monat aufsummiert
    var cv = [], run = S.P.start, months = today.getMonth() + 1, byM = {};
    S.cash.forEach(function (c) { if (!c.sto && c.d.getFullYear() === YEAR) byM[c.d.getMonth()] = (byM[c.d.getMonth()] || 0) + c.a; });
    for (var m = 0; m < months; m++) { run += byM[m] || 0; cv.push(run); }
    if (cv.length < 2) cv.unshift(S.P.start);
    spark($('[data-spark="mem"]'), mv, !sparkDrawn[S.k]);
    spark($('[data-spark="cash"]'), cv, !sparkDrawn[S.k]);
    sparkDrawn[S.k] = 1;
  }

  // ---------- Wochenleiste mit Jetzt-Linie ----------
  // Woche immer Montag bis Sonntag; mit den Pfeilen vor und zurück (wk = 0 ist diese Woche)
  var wk = 0;
  function renderWeek() {
    var days = [], h = "", mo = (today.getDay() + 6) % 7, ti = -1;
    for (var i = 0; i < 7; i++) days.push(addDays(wk * 7 - mo + i));
    $("[data-week-t]").textContent = wk === 0 ? "Diese Woche" : wk === 1 ? "Nächste Woche" : wk === -1 ? "Letzte Woche" : "Woche " + kw(days[0]);
    $("[data-week-range]").textContent = dshort(days[0]) + " bis " + dshort(days[6]);
    $("[data-week-heute]").hidden = wk === 0;
    days.forEach(function (d, i) {
      var isT = d - today === 0;
      if (isT) ti = i;
      var evs = S.ev.filter(function (e) { return e.d - d === 0; }).map(function (e) { var f = e === S.help.ev; return '<button type="button" class="wev' + (f ? " fest" : "") + '" data-wgo="' + (f ? "helfer" : "termine") + '" data-evi="' + S.ev.indexOf(e) + '" title="' + (f ? "Zur Helfer-Einteilung" : "Zum Termin") + '"><b>' + esc(e.t) + "</b><span>" + esc(e.h) + "</span></button>"; });
      if (isT) evs.unshift('<button type="button" class="wev att" data-wgo="anwesenheit" title="Zur Anwesenheit"><b>' + esc(S.P.probe[0]) + "</b><span>" + esc(S.P.probe[1]) + "</span></button>");
      h += '<div class="wd' + (isT ? " is-today" : d < today ? " is-past" : "") + '"><small>' + (isT ? "Heute" : WT[d.getDay()]) + "<b>" + d.getDate() + ".</b>" + "</small>" + evs.join("") + "</div>";
    });
    if (ti > -1) {
      var now = new Date(), f = (now.getHours() + now.getMinutes() / 60) / 24;
      h += '<i class="now" style="left:' + ((ti + f) / 7 * 100).toFixed(2) + '%"><span>' + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + "</span></i>";
    }
    var g = $("[data-week]");
    g.innerHTML = h;
    if (renderWeek.dir && !reduce) { g.classList.remove("w-l", "w-r"); void g.offsetWidth; g.classList.add(renderWeek.dir > 0 ? "w-r" : "w-l"); }
    renderWeek.dir = 0;
  }
  // Termin in der Wochenleiste antippen: gleich dorthin, wo man ihn bearbeitet
  $("[data-week]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wgo]"); if (!b) return;
    var go = b.getAttribute("data-wgo"), tab = $('[data-d-tabs] [data-dt="' + go + '"]');
    if (tab) tab.click();
    var tgt = go === "termine" ? $('[data-d-evs] [data-evi="' + b.getAttribute("data-evi") + '"]') : $('[data-dp="' + go + '"]');
    if (!tgt) return;
    tgt.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    if (go === "termine") { tgt.classList.remove("is-hl"); void tgt.offsetWidth; tgt.classList.add("is-hl"); }
  });
  function kw(d) {
    var t = new Date(d); t.setDate(t.getDate() + 3 - (t.getDay() + 6) % 7);
    var j = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round(((t - j) / 864e5 - 3 + (j.getDay() + 6) % 7) / 7);
  }
  $("[data-week-go='-1']").closest(".week__nav").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var go = b.hasAttribute("data-week-heute") ? -wk : +b.getAttribute("data-week-go");
    if (!go) return;
    wk += go; renderWeek.dir = go; renderWeek();
  });
  setInterval(function () { if (S) renderWeek(); }, 60000);

  // ---------- Anwesenheit ----------
  var attList = $("[data-a-list]");
  function renderAtt() {
    var A = S.att, n = 0;
    $("[data-a-when]").textContent = "Heute, " + WT[today.getDay()] + " " + dshort(today) + " · " + S.P.probe[1] + " Uhr";
    $("[data-a-title]").textContent = S.P.probe[0];
    attList.innerHTML = A.list.map(function (m) {
      var on = !!A.here[m.nr]; if (on) n++;
      return '<button type="button" aria-pressed="' + on + '" data-a="' + m.nr + '"><i>' + ini(m.name) + '<svg><use href="#i-check"/></svg></i><span>' + esc(m.name) + "</span></button>";
    }).join("");
    $("[data-a-n]").textContent = n;
    $("[data-a-of]").textContent = "von " + A.list.length + " da";
    renderAttStat();
  }
  function renderAttStat() {
    var A = S.att, held = A.held + (A.saved ? 1 : 0);
    var rows = A.list.map(function (m) { var s = A.seen[m.nr] + (A.saved && A.here[m.nr] ? 1 : 0); return { m: m, s: s, p: s / held }; });
    rows.sort(function (a, b) { return b.p - a.p || a.m.name.localeCompare(b.m.name, "de"); });
    var top = rows.filter(function (r) { return r.p >= 0.9; });
    $("[data-a-stat-t]").textContent = S.P.probe[2] + " " + YEAR + " · " + held + " " + S.P.probe[3];
    $("[data-a-stat]").innerHTML = rows.slice(0, 8).map(function (r) {
      return '<li class="' + (r.p >= 0.9 ? "top" : "") + '"><span>' + esc(r.m.name) + '</span><span class="b"><i style="width:' + Math.round(r.p * 100) + '%"></i></span><span>' + r.s + " · " + Math.round(r.p * 100) + " %</span></li>";
    }).join("");
    $("[data-a-ehrung]").textContent = top.length ? top.length + (top.length === 1 ? " Mitglied war" : " Mitglieder waren") + " bei mindestens 90 % dabei. Die Liste für die Ehrungen bei der Generalversammlung ist damit schon fertig." : "";
  }
  attList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-a]"); if (!b) return;
    var nr = +b.getAttribute("data-a"), A = S.att;
    if (A.saved) { A.saved = false; }
    A.here[nr] = !A.here[nr];
    b.setAttribute("aria-pressed", !!A.here[nr]);
    var n = A.list.filter(function (m) { return A.here[m.nr]; }).length;
    $("[data-a-n]").textContent = n; renderAttStat();
  });
  $("[data-a-all]").addEventListener("click", function () {
    S.att.list.forEach(function (m) { S.att.here[m.nr] = true; }); S.att.saved = false; renderAtt();
  });
  $("[data-a-save]").addEventListener("click", function () {
    var A = S.att, n = A.list.filter(function (m) { return A.here[m.nr]; }).length;
    if (!n) { toast("Noch niemand angetippt", "wer da ist, einfach antippen"); return; }
    A.saved = true; renderAttStat();
    feed("ok", "i-hand", S.P.probe[0] + ": " + n + " von " + A.list.length + " da, Anwesenheit gespeichert");
    toast("Anwesenheit gespeichert", n + " von " + A.list.length + " · Statistik ist aktuell");
  });

  // ---------- Helfer-Einteilung ----------
  var shBox = $("[data-h-shifts]"), poolBox = $("[data-h-pool]");
  function hChip(m, inShift) {
    if (inShift) return '<span class="hc" data-in="' + m.nr + '"><i>' + ini(m.name) + '</i><span class="hc__n">' + esc(m.name) + '</span><button type="button" class="hc__x" data-rm="' + m.nr + '" aria-label="' + esc(m.name) + ' aus der Schicht nehmen"><span>Entfernen?</span><svg aria-hidden="true"><use href="#i-x"/></svg></button></span>';
    return '<span class="hc' + (m === S.me ? " is-me" : "") + (S.help.sel === m.nr ? " sel" : "") + '" data-hc="' + m.nr + '" role="button" tabindex="0"><i>' + ini(m.name) + "</i>" + esc(m.name) + "</span>";
  }
  function helpFree() { return S.help.shifts.reduce(function (s, sh) { return s + sh.need - sh.who.length; }, 0); }
  function renderHelp() {
    var H = S.help, tot = 0, got = 0;
    $("[data-h-when]").textContent = "Fest · " + WT[H.ev.d.getDay()] + " " + dshort(H.ev.d) + " · " + H.ev.o;
    $("[data-h-title]").textContent = H.ev.t;
    poolBox.innerHTML = H.pool.map(function (m) { return hChip(m, false); }).join("") || '<span class="hint2">Alle sind eingeteilt.</span>';
    $("[data-h-poolc]").textContent = "(" + H.pool.length + ")";
    shBox.innerHTML = H.shifts.map(function (sh) {
      tot += sh.need; got += sh.who.length;
      var free = sh.need - sh.who.length, slots = "";
      for (var i = 0; i < free; i++) slots += '<span class="slot">frei</span>';
      return '<div class="sh' + (free ? "" : " full") + '" data-shift="' + sh.id + '"><div class="sh__hd"><b>' + esc(sh.t) + "</b><small>" + (free ? esc(sh.h) : "voll") + '</small></div><div class="sh__list">' + sh.who.map(function (m) { return hChip(m, true); }).join("") + slots + "</div></div>";
    }).join("");
    shBox.classList.toggle("pick", !!H.sel);
    $("[data-h-n]").textContent = got;
    $("[data-h-of]").textContent = "von " + tot + " Plätzen besetzt";
    renderAsk();
  }
  function findMem(nr) { return S.mem[nr - 1]; }
  function assign(nr, sid) {
    var H = S.help, m = findMem(nr), sh = H.shifts.filter(function (x) { return x.id === sid; })[0];
    if (!m || !sh) return false;
    if (sh.who.indexOf(m) > -1) return false;
    if (sh.who.length >= sh.need) { toast(sh.t + " ist schon voll", "eine andere Schicht wählen"); return false; }
    H.shifts.forEach(function (x) { var k = x.who.indexOf(m); if (k > -1) x.who.splice(k, 1); });
    H.pool = H.pool.filter(function (x) { return x !== m; });
    sh.who.push(m); H.sel = null;
    renderHelp();
    var el = shBox.querySelector('[data-shift="' + sid + '"]'); if (el) el.classList.add("pulse");
    if (sh.who.length === sh.need) toast(sh.t + " (" + sh.h + ") ist voll", "alle Plätze besetzt");
    return true;
  }
  function unassign(nr) {
    var H = S.help, m = findMem(nr);
    H.shifts.forEach(function (x) { var k = x.who.indexOf(m); if (k > -1) x.who.splice(k, 1); });
    if (H.pool.indexOf(m) < 0) H.pool.unshift(m);
    renderHelp();
  }
  // Ziehen mit Maus oder Finger; ohne Bewegung wirkt es wie Antippen (erst Name, dann Schicht)
  var drag = null;
  document.addEventListener("pointerdown", function (e) {
    var c = e.target.closest(".pool [data-hc]"); if (!c || e.button > 0) return;
    if (drag) endDrag(e, true);
    drag = { c: c, nr: +c.getAttribute("data-hc"), x: e.clientX, y: e.clientY, ghost: null, over: null };
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (!drag.ghost) {
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 6) return;
      var r = drag.c.getBoundingClientRect();
      drag.dx = drag.x - r.left; drag.dy = drag.y - r.top;
      drag.ghost = drag.c.cloneNode(true); drag.ghost.classList.add("drag"); drag.ghost.classList.remove("sel");
      // Im Vollbild zeigt der Browser nur das Vollbild-Element, der Name muss also dort hinein
      (document.fullscreenElement || document.body).appendChild(drag.ghost); drag.c.classList.add("ghost");
    }
    drag.ghost.style.left = (e.clientX - drag.dx) + "px"; drag.ghost.style.top = (e.clientY - drag.dy) + "px";
    var t = document.elementFromPoint(e.clientX, e.clientY), sh = t && t.closest("[data-shift]");
    if (drag.over && drag.over !== sh) drag.over.classList.remove("over");
    if (drag.no && drag.no !== sh) drag.no.classList.remove("no");
    drag.no = sh && sh.classList.contains("full") ? sh : null; if (drag.no) drag.no.classList.add("no");
    if (sh && !drag.no) { sh.classList.add("over"); drag.over = sh; } else drag.over = null;
  });
  function endDrag(e, cancel) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.ghost) {
      if (cancel) return;
      S.help.sel = S.help.sel === d.nr ? null : d.nr; renderHelp(); return;
    }
    d.ghost.remove(); d.c.classList.remove("ghost");
    if (d.no) { d.no.classList.remove("no"); if (!cancel) toast(d.no.querySelector("b").textContent + " ist schon voll", "eine Schicht mit freiem Platz wählen"); }
    if (d.over) { d.over.classList.remove("over"); if (!cancel && assign(d.nr, d.over.getAttribute("data-shift"))) feed("pop", "i-heart", findMem(d.nr).name + " hilft beim " + S.help.ev.t + " (" + S.help.shifts.filter(function (x) { return x.id === d.over.getAttribute("data-shift"); })[0].t + ")"); }
  }
  document.addEventListener("pointerup", function (e) { endDrag(e, false); });
  document.addEventListener("pointercancel", function (e) { endDrag(e, true); });
  shBox.addEventListener("click", function (e) {
    // Entfernen nur über das ×, und erst nach einer Rückfrage (zweites Antippen), damit niemand aus Versehen rausfliegt
    var x = e.target.closest("[data-rm]");
    if (x) {
      var chip = x.closest(".hc");
      if (chip.classList.contains("ask")) { clearTimeout(askT); unassign(+x.getAttribute("data-rm")); return; }
      resetAsk(); chip.classList.add("ask"); x.setAttribute("aria-label", "Wirklich entfernen? Nochmal antippen");
      askT = setTimeout(resetAsk, 3500); return;
    }
    if (e.target.closest("[data-in]")) return;
    var sh = e.target.closest("[data-shift]");
    if (sh && S.help.sel) { var nr = S.help.sel; if (assign(nr, sh.getAttribute("data-shift"))) feed("pop", "i-heart", findMem(nr).name + " hilft beim " + S.help.ev.t); }
  });
  var askT;
  function resetAsk() { clearTimeout(askT); $$(".hc.ask", shBox).forEach(function (c) { c.classList.remove("ask"); }); }
  document.addEventListener("click", function (e) { if (!e.target.closest("[data-rm]")) resetAsk(); }, true);
  // Tastatur: Enter/Leertaste wählt einen Namen, Schichten sind dann per Klick wählbar
  $("[data-dp=helfer]").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var c = e.target.closest(".pool [data-hc]"); if (!c) return;
    e.preventDefault();
    S.help.sel = +c.getAttribute("data-hc"); renderHelp(); var f = shBox.querySelector(".sh:not(.full)"); if (f) { f.tabIndex = 0; f.focus(); }
  });
  shBox.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-shift]") && S.help.sel) { e.preventDefault(); assign(S.help.sel, e.target.getAttribute("data-shift")); }
  });
  $("[data-h-send]").addEventListener("click", function () {
    var n = S.help.shifts.reduce(function (s, sh) { return s + sh.who.length; }, 0), f = helpFree();
    feed("", "i-mail", "Dienstplan " + S.help.ev.t + " an " + n + " Helfer geschickt");
    toast("Dienstplan verschickt", n + " Helfer bekommen ihre Schicht" + (f ? " · " + f + " Plätze noch frei" : ""));
  });
  $("[data-h-ask]").addEventListener("click", function () {
    var f = helpFree();
    if (!f) { toast("Alle Schichten sind voll", "nichts mehr zu fragen"); return; }
    S.help.asked = true; renderAsk();
    var a = $(".ask__c"); if (a) { a.classList.remove("flash"); void a.offsetWidth; a.classList.add("flash"); }
    feed("", "i-bell", "Helfer-Aufruf in der App: " + f + " Plätze frei");
    toast("Aufruf ist in der App", "alle sehen die freien Plätze und tippen „Ich helfe“");
  });

  // Handy: Karte „Helfer gesucht“
  function renderAsk() {
    var H = S.help, box = $("[data-m-help]"), mine = null;
    H.shifts.forEach(function (sh) { if (sh.who.indexOf(S.me) > -1) mine = sh; });
    var open = H.shifts.filter(function (sh) { return sh.who.length < sh.need; });
    if (mine) {
      box.innerHTML = '<div class="ask__c ok"><small><i></i>Du hilfst mit</small><b>' + esc(H.ev.t) + ": " + esc(mine.t) + "</b><p>" + WT[H.ev.d.getDay()] + " " + dshort(H.ev.d) + ", " + esc(mine.h) + ". Danke!</p></div>";
    } else if (open.length) {
      var sh = open.sort(function (a, b) { return (b.need - b.who.length) - (a.need - a.who.length); })[0], f = sh.need - sh.who.length;
      box.innerHTML = '<div class="ask__c"><small><i></i>Helfer gesucht</small><b>' + esc(H.ev.t) + ": " + esc(sh.t) + "</b><p>" + WT[H.ev.d.getDay()] + " " + dshort(H.ev.d) + ", " + esc(sh.h) + " · noch " + f + (f === 1 ? " Platz" : " Plätze") + ' frei</p><button class="abtn" type="button" data-help-me="' + sh.id + '"><svg><use href="#i-heart"/></svg>Ich helfe</button></div>';
    } else box.innerHTML = "";
  }
  $("[data-m-help]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-help-me]"); if (!b) return;
    var sid = b.getAttribute("data-help-me"), sh = S.help.shifts.filter(function (x) { return x.id === sid; })[0];
    if (assign(S.me.nr, sid)) {
      $("[data-d-helpbadge]").hidden = false;
      feed("pop", "i-heart", S.me.name + " hilft beim " + S.help.ev.t + " (" + sh.t + ")");
      toast("Im Dienstplan eingetragen", S.me.name + " · " + sh.t + ", " + sh.h);
    }
  });

  // ---------- Vereinsfarbe und Logo ----------
  // Aus einer Farbe werden alle Töne der App abgeleitet: hell und dunkel, Text darauf lesbar.
  var hex2rgb = function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  function rgb2hsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return [h, s * 100, l * 100];
  }
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, "0"); };
    return "#" + f(0) + f(8) + f(4);
  }
  function lum(h) { return hex2rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function applyColor(hex) {
    var c = rgb2hsl(hex2rgb(hex)), h = c[0], s = c[1], l = c[2], st = document.body.style;
    var light = lum(hex) > 0.36, tx = light ? hsl(h, s, clamp(l, 22, 32)) : hex;
    st.setProperty("--vc", hex);
    st.setProperty("--vc2", hsl(h, s, clamp(l + 11, 0, light ? l + 4 : 62)));
    st.setProperty("--vcl", hsl(h, Math.min(s, 75), 94));
    st.setProperty("--vc-on", light ? "#111827" : "#ffffff");
    st.setProperty("--vc-tx", tx);
    st.setProperty("--acc-d", hsl(h, Math.max(s, 52), clamp(l, 58, 68)));
    st.setProperty("--acc-l", hsl(h, s, clamp(l, 26, 36)));
    S.brand.color = hex;
    drawQR();
  }
  var SYMS = ["i-note", "i-ball", "i-mask", "i-heart", "i-star", "i-leaf", "i-peak", "i-cup"];
  // Dieselbe Farbskala wie beim Gratis-Entwurf auf tim-kofler.at
  var SWS = [["#ff5a1f", "Orange"], ["#d62f2f", "Rot"], ["#7d1f3a", "Bordeaux"], ["#c99a2e", "Gold"], ["#2f8f4e", "Grün"], ["#7f9f86", "Salbei"], ["#11707a", "Petrol"], ["#2459d6", "Blau"], ["#6b3fc4", "Lila"], ["#262626", "Schwarz-Weiß"]];
  var pk = $("[data-b-picker]"), eigBtn = $("[data-b-eigen]"), hR = $("[data-b-h]"), sR = $("[data-b-s]"), lR = $("[data-b-l]");
  var isSw = function (hex) { return SWS.some(function (s) { return s[0] === hex; }); };
  function paintPicker(hex) {
    var c = rgb2hsl(hex2rgb(hex)), h = Math.round(c[0]), s = Math.round(c[1]);
    pk.style.setProperty("--eigen", hex); eigBtn.style.setProperty("--eigen", hex);
    sR.style.setProperty("--track", "linear-gradient(90deg, hsl(" + h + ",0%," + Math.round(c[2]) + "%), hsl(" + h + ",100%," + Math.round(c[2]) + "%))");
    lR.style.setProperty("--track", "linear-gradient(90deg, #000, hsl(" + h + "," + s + "%,50%), #fff)");
  }
  function syncPicker(hex) {
    var c = rgb2hsl(hex2rgb(hex)); hR.value = Math.round(c[0]); sR.value = Math.round(c[1]); lR.value = Math.round(c[2]);
    paintPicker(hex);
  }
  function paintLogo() {
    var B = S.brand;
    $$("[data-v-logo]").forEach(function (el) {
      el.classList.remove("lg--rund", "lg--wappen", "has-img"); el.textContent = "";
      if (B.shape !== "eckig" && !(B.type === "bild" && B.img)) el.classList.add("lg--" + B.shape);
      if (B.type === "bild" && B.img) {
        var im = document.createElement("img"); im.src = B.img; im.alt = ""; el.appendChild(im); el.classList.add("has-img");
      } else if (B.type === "symbol") {
        el.innerHTML = '<svg aria-hidden="true"><use href="#' + B.sym + '"/></svg>';
      } else el.textContent = B.short || ini(B.name);
    });
    drawQR();
  }
  var slug = function (n) { return n.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "verein"; };
  function paintName() {
    var B = S.brand;
    $$("[data-v-name]").forEach(function (el) { el.textContent = B.name; });
    var dom = B.name === S.P.name ? S.P.url.split("/")[0] : slug(B.name) + ".at";
    $("[data-v-url]").textContent = dom + "/vorstand";
    $("[data-b-url]").textContent = dom;
    $("[data-m-rcv]").textContent = B.name;
  }
  function renderBrand() {
    var B = S.brand;
    $("[data-b-name]").value = B.name; $("[data-b-short]").value = B.short;
    $("[data-b-sws]").innerHTML = SWS.map(function (c) { return '<button type="button" class="' + (c[0] === "#262626" ? "bw" : "") + '" style="--c:' + c[0] + '" data-c="' + c[0] + '" aria-pressed="' + (c[0] === B.color) + '"><span></span>' + c[1] + "</button>"; }).join("");
    $("[data-b-hex]").value = B.color; syncPicker(B.color);
    eigBtn.setAttribute("aria-pressed", !isSw(B.color));
    $$("[data-t]", $("[data-b-type]")).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-t") === B.type); });
    $$("[data-s]", $("[data-b-shape]")).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-s") === B.shape); });
    $("[data-b-syms]").hidden = B.type !== "symbol"; $("[data-b-up]").hidden = B.type !== "bild"; $("[data-b-formg]").hidden = B.type === "bild";
    $("[data-b-syms]").innerHTML = SYMS.map(function (s) { return '<button type="button" data-sym="' + s + '" aria-pressed="' + (s === B.sym) + '" aria-label="Symbol ' + s.slice(2) + '"><svg><use href="#' + s + '"/></svg></button>'; }).join("");
    $("[data-b-claim]").textContent = S.P.claim;
    $(".site__hero h5").textContent = S.P.hero;
  }
  function setColor(hex, from) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    hex = hex.toLowerCase(); applyColor(hex);
    $$("[data-c]", $("[data-b-sws]")).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-c") === hex); });
    eigBtn.setAttribute("aria-pressed", from === "picker" || from === "hex" || !isSw(hex));
    if (from !== "hex") $("[data-b-hex]").value = hex;
    if (from === "picker") paintPicker(hex); else syncPicker(hex);
    renderDue();
  }
  $("[data-b-sws]").addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (b) { setColor(b.getAttribute("data-c")); openPicker(false); } });
  // Eigene Farbe: eigene Regler statt des System-Farbwählers (der ist am Handy winzig), wie beim Gratis-Entwurf
  function openPicker(on) { pk.hidden = !on; eigBtn.setAttribute("aria-expanded", on); }
  eigBtn.addEventListener("click", function () { var on = pk.hidden; openPicker(on); if (on) { eigBtn.setAttribute("aria-pressed", "true"); setColor(S.brand.color, "picker"); } });
  [hR, sR, lR].forEach(function (rg) { rg.addEventListener("input", function () { setColor(hsl(+hR.value, +sR.value, +lR.value), "picker"); }); });
  $("[data-b-pick-ok]").addEventListener("click", function () { openPicker(false); eigBtn.focus({ preventScroll: true }); });
  $("[data-b-hex]").addEventListener("input", function () { var v = this.value.trim(); if (v[0] !== "#") v = "#" + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; setColor(v, "hex"); });
  $("[data-b-name]").addEventListener("input", function () {
    S.brand.name = this.value.replace(/\s+/g, " ").trim() || S.P.name; paintName(); if (S.brand.type === "kuerzel" && !S.brand.short) paintLogo();
  });
  $("[data-b-short]").addEventListener("input", function () { S.brand.short = this.value.trim().toUpperCase().slice(0, 3); paintLogo(); });
  $("[data-b-type]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-t]"); if (!b) return;
    S.brand.type = b.getAttribute("data-t"); renderBrand(); paintLogo();
    if (S.brand.type === "bild" && !S.brand.img) $("[data-b-file]").click();
  });
  $("[data-b-syms]").addEventListener("click", function (e) { var b = e.target.closest("[data-sym]"); if (!b) return; S.brand.sym = b.getAttribute("data-sym"); renderBrand(); paintLogo(); });
  $("[data-b-shape]").addEventListener("click", function (e) { var b = e.target.closest("[data-s]"); if (!b) return; S.brand.shape = b.getAttribute("data-s"); renderBrand(); paintLogo(); });
  $("[data-b-file]").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = "";
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) { toast("Dieses Format geht nicht", "bitte PNG, JPG, WebP oder SVG"); return; }
    if (f.size > 1.5 * 1024 * 1024) { toast("Die Datei ist zu groß", "bitte höchstens 1,5 MB"); return; }
    var fr = new FileReader();
    fr.onload = function () { S.brand.img = String(fr.result); S.brand.type = "bild"; renderBrand(); paintLogo(); toast("Logo übernommen", "nur in deinem Browser, nichts wird hochgeladen"); };
    fr.readAsDataURL(f);
  });
  $("[data-b-reset]").addEventListener("click", function () { initBrand(); toast("Zurückgesetzt", "Farbe und Logo vom Beispielverein"); });
  function initBrand() {
    var P = S.P;
    S.brand = { name: P.name, short: P.logo, color: P.color, type: P.logoT, sym: P.sym, shape: P.shape, img: (S.brand && S.brand.img) || "" };
    applyColor(P.color); openPicker(false); renderBrand(); paintLogo(); paintName(); renderDue();
  }

  // ---------- Nachrichten an Gruppen und Pinnwand am Handy ----------
  var nTo = $("[data-n-to]");
  function targets() {
    var o = [["alle", "Alle Mitglieder"], ["vorstand", "Nur Vorstand"], ["offen", "Mitglieder mit offenem Beitrag"], ["jugend", S.P.arts[1].l]];
    return o.concat(S.P.groups.map(function (g) { return ["g:" + g, S.P.glbl + " " + g]; }));
  }
  function who(to) {
    return S.mem.filter(function (m) {
      if (to === "alle") return true;
      if (to === "vorstand") return !!m.role;
      if (to === "offen") return m.st !== "ok";
      if (to === "jugend") return m.art === 1;
      return to.slice(2) === m.grp;
    });
  }
  function renderNCount() { var l = who(nTo.value); $("[data-n-cnt]").innerHTML = "Geht an <b>" + l.length + "</b> " + (l.length === 1 ? "Mitglied" : "Mitglieder") + (l.indexOf(S.me) > -1 ? ", auch an " + esc(S.me.name) + " am Handy" : ""); }
  nTo.addEventListener("change", renderNCount);
  function votes(m) { return m.poll.o.reduce(function (s, o) { return s + o.n; }, 0); }
  function renderSent() {
    $("[data-n-sent]").innerHTML = S.msgs.map(function (m) {
      var lbl = targets().filter(function (x) { return x[0] === m.to; })[0], tot = m.poll ? votes(m) : 0;
      var body = m.poll ? '<ul class="pres">' + m.poll.o.map(function (o) {
        var p = Math.round(o.n / Math.max(1, tot) * 100);
        return '<li><span>' + esc(o.t) + '</span><span class="b"><i style="width:' + p + '%"></i></span><span>' + p + " %</span></li>";
      }).join("") + "</ul>" : "<p>" + esc(m.x) + "</p>";
      var bar = m.poll ? '<span class="rd"><i style="--r:' + Math.round(tot / Math.max(1, m.n) * 100) + '%"></i>' + tot + " haben abgestimmt" + (m.poll.anon ? " · anonym" : "") + "</span>"
        : '<span class="rd"><i style="--r:' + Math.round(m.read / Math.max(1, m.n) * 100) + '%"></i>' + m.read + " gelesen</span>";
      return '<li' + (m.fresh ? ' class="is-new"' : "") + "><b>" + (m.poll ? '<em class="tag"><svg><use href="#i-poll"/></svg>Umfrage</em>' : "") + esc(m.t) + "</b>" + body + "<small><span>" + dshort(m.d) + " · " + esc(m.from) + "</span><span>An: " + esc(lbl ? lbl[1] : m.to) + " (" + m.n + ")</span>" + (m.mail ? "<span>+ E-Mail</span>" : "") + (m.cm.length ? "<span>" + m.cm.length + (m.cm.length === 1 ? " Kommentar" : " Kommentare") + "</span>" : "") + "</small>" + bar + "</li>";
    }).join("");
  }
  // Umfrage am Handy: erst antippen, dann sieht man das Ergebnis; Antwort lässt sich ändern
  function pollHtml(m) {
    var P = m.poll, tot = votes(m), on = P.mine > -1;
    return '<div class="poll' + (on ? " is-voted" : "") + '" role="group" aria-label="' + esc(m.t) + '">' + P.o.map(function (o, i) {
      var p = Math.round(o.n / Math.max(1, tot) * 100);
      return '<button type="button" data-vote="' + i + '" aria-pressed="' + (P.mine === i) + '" style="--w:' + (on ? p : 0) + '%"><span>' + (P.mine === i ? '<svg aria-hidden="true"><use href="#i-check"/></svg>' : "") + esc(o.t) + "</span>" + (on ? "<em>" + p + " %</em>" : "") + "</button>";
    }).join("") + '<p class="poll__n">' + (on ? tot + " Stimmen" : "Antippen zum Abstimmen") + (P.anon ? " · anonym" : "") + "</p></div>";
  }
  function renderPins() {
    var mine = S.msgs.filter(function (m) { return m.toMe; }), un = mine.some(function (m) { return m.unread; });
    $("[data-m-pins]").innerHTML = mine.map(function (m) {
      return '<div class="pin' + (m.poll ? " is-poll" : "") + (m.unread ? " unread" : "") + (m.fresh ? " is-new" : "") + '" data-pid="' + m.id + '"><small><span>' + (m.poll ? '<svg aria-hidden="true"><use href="#i-poll"/></svg>Umfrage · ' : "") + esc(m.from) + " · " + dshort(m.d) + "</span>" + (m.unread ? "<em>Neu</em>" : "") + "</small><b>" + esc(m.t) + "</b>" +
        (m.poll ? pollHtml(m) : "<p>" + esc(m.x) + '</p><div class="pin__ft">' + cmtTg(m, "m:" + m.id) + "</div>" + cmtBox(m, "m:" + m.id)) + "</div>";
    }).join("") || '<p class="note">Gerade nichts Neues.</p>';
    $("[data-m-docs]").innerHTML = S.P.docs.map(function (d, i) {
      return '<button type="button" data-doc="' + i + '"><i><svg><use href="#i-file"/></svg></i><span>' + esc(d[0]) + "<small>" + esc(d[1]) + '</small></span><svg><use href="#i-dl"/></svg></button>';
    }).join("");
    $("[data-m-ndot]").className = un ? "" : "off";
  }
  $("[data-m-pins]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-vote]"); if (!b) return;
    var id = b.closest("[data-pid]").getAttribute("data-pid"), m = S.msgs.filter(function (x) { return x.id === id; })[0], i = +b.getAttribute("data-vote"), P = m.poll;
    if (P.mine === i) return;
    var first = P.mine < 0;
    if (!first) P.o[P.mine].n--;
    P.mine = i; P.o[i].n++; m.unread = false;
    renderPins(); renderSent();
    feed("pop", "i-poll", (P.anon ? "Neue Stimme" : S.me.name + " stimmt") + " bei „" + m.t + "“" + (P.anon ? " (anonym)" : ": " + P.o[i].t));
    if (first) toast("Stimme abgegeben", "der Vorstand sieht das Ergebnis sofort");
  });
  $("[data-m-docs]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-doc]"); if (!b) return;
    toast("Muster-Dokument", S.P.docs[+b.getAttribute("data-doc")][0] + " · im echten Verein öffnet sich die PDF");
  });
  var nKind = "msg", nX = $("[data-n-x]"), nOpts = $$("[data-n-o]");
  function setKind(k) {
    nKind = k; var poll = k === "poll";
    $$("[data-k]", $("[data-n-kind]")).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-k") === k); });
    $("[data-n-h]").textContent = poll ? "Neue Umfrage" : "Neue Nachricht";
    $("[data-n-tl]").textContent = poll ? "Frage" : "Betreff";
    $("[data-n-t]").placeholder = poll ? "z. B. Welcher Termin passt für die Weihnachtsfeier?" : "z. B. Einladung zur Generalversammlung";
    $("[data-n-xl]").hidden = poll; nX.required = !poll;
    $("[data-n-poll]").hidden = !poll;
    fillReset($("[data-n-go]"), poll ? "Umfrage starten" : "Nachricht senden");
  }
  $("[data-n-kind]").addEventListener("click", function (e) { var b = e.target.closest("[data-k]"); if (b) setKind(b.getAttribute("data-k")); });
  $("[data-n-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var go = $("[data-n-go]"); if (go.classList.contains("is-busy") || go.classList.contains("is-done")) return;
    var poll = nKind === "poll", t = $("[data-n-t]").value.trim().slice(0, 60), x = poll ? "" : nX.value.trim().slice(0, 400);
    var opts = nOpts.map(function (i) { return i.value.replace(/\s+/g, " ").trim().slice(0, 40); }).filter(Boolean);
    if (!t || (!poll && !x)) return;
    if (poll && opts.length < 2) { toast("Mindestens zwei Antworten", "zum Beispiel zwei Termine"); (nOpts[opts.length] || nOpts[0]).focus(); return; }
    var to = nTo.value, l = who(to), me = l.indexOf(S.me) > -1, mail = $("[data-n-mail]").checked, anon = $("[data-n-anon]").checked;
    fillSend(go, poll ? "Gestartet" : "Gesendet", function () {
      S.msgs.forEach(function (m) { m.fresh = false; });
      var m = { id: "n" + Date.now(), t: t, x: x, from: S.P.board[3][0], d: new Date(today), to: to, toMe: me, n: l.length, read: 0, mail: mail, unread: me, fresh: true, cm: [] };
      if (poll) m.poll = { o: opts.map(function (o) { return { t: o, n: 0 }; }), mine: -1, anon: anon };
      S.msgs.unshift(m);
      $("[data-n-t]").value = ""; nX.value = ""; nOpts.forEach(function (i) { i.value = ""; });
      fillReset(go, poll ? "Umfrage starten" : "Nachricht senden");
      renderSent(); renderPins();
      feed("", poll ? "i-poll" : "i-mail", (poll ? "Umfrage „" : "Nachricht „") + t + "“ an " + l.length + " Mitglieder");
      toast(poll ? "Umfrage ist in der App" : "Nachricht ist in der App", me ? "schau aufs Handy, Reiter „Neues“" : l.length + " Mitglieder bekommen sie");
      // Die ersten lesen und stimmen gleich ab
      var step = function (k) {
        m.read = Math.max(1, Math.round(l.length * k));
        if (m.poll) m.poll.o.forEach(function (o, i) { o.n += Math.max(i ? 0 : 1, Math.round(l.length * k * 0.5 * [0.5, 0.32, 0.18][i])); });
        renderSent(); if (m.poll && m.poll.mine > -1 && !$("[data-m-pins]").contains(document.activeElement)) renderPins();
      };
      setTimeout(function () { step(0.18); }, 1800);
      setTimeout(function () { step(0.23); }, 5200);
    });
  });
  function renderNForm() { setKind(nKind); nTo.innerHTML = targets().map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>"; }).join(""); renderNCount(); }

  // ---------- Jubiläen und Ehrungen ----------
  var JUB = [10, 25, 40, 50, 60];
  function jubList() {
    return S.mem.filter(function (m) { return JUB.indexOf(YEAR - m.seit) > -1; }).sort(function (a, b) { return a.seit - b.seit || a.name.localeCompare(b.name, "de"); });
  }
  function renderJub() {
    var l = jubList();
    $("[data-jub-t]").textContent = "Jubiläen und Ehrungen " + YEAR + " · " + l.length + " Mitglieder";
    $("[data-jub]").innerHTML = l.slice(0, 8).map(function (m) {
      return '<li><i>' + (YEAR - m.seit) + "</i><span>" + esc(m.name) + "<small>Mitglied seit " + m.seit + "</small></span></li>";
    }).join("") + (l.length > 8 ? '<li><span><small>und ' + (l.length - 8) + " weitere in der Liste</small></span></li>" : "");
  }
  $("[data-jub-csv]").addEventListener("click", function () {
    csv("ehrungen-muster.csv", [["Nr", "Name", "Mitglied seit", "Jahre", S.P.glbl]].concat(jubList().map(function (m) { return ["M-" + ("000" + m.nr).slice(-4), m.name, m.seit, YEAR - m.seit, m.grp]; })));
    toast("Ehrungsliste heruntergeladen", "für die Generalversammlung");
  });
  $("[data-jub-send]").addEventListener("click", function () {
    var n = jubList().length;
    feed("pop", "i-heart", "Glückwunsch zum Vereinsjubiläum an " + n + " Mitglieder geschickt");
    toast("Glückwünsche verschickt", n + " Jubilare bekommen eine Nachricht in der App");
  });

  // ---------- Karteikarte eines Mitglieds ----------
  var mcard = $("[data-mcard]");
  function openCard(nr) {
    var m = S.mem[nr - 1]; if (!m) return;
    var A = S.att, inAtt = A.list.indexOf(m) > -1, sh = null;
    S.help.shifts.forEach(function (x) { if (x.who.indexOf(m) > -1) sh = x; });
    var y = YEAR - m.seit;
    mcard.innerHTML = '<div class="mcard__hd"><i>' + ini(m.name) + "</i><span><b>" + esc(m.name) + "</b><small>M-" + ("000" + m.nr).slice(-4) + (m.role ? " · " + esc(m.role) : "") + '</small></span><button type="button" class="mcard__x" data-mc-x aria-label="Karteikarte schließen"><svg><use href="#i-x"/></svg></button></div>' +
      "<dl><dt>" + esc(S.P.glbl) + "</dt><dd>" + esc(m.grp) + "</dd><dt>Mitgliedschaft</dt><dd>" + esc(S.P.arts[m.art].l) + " · " + S.P.arts[m.art].b + " € im Jahr</dd>" +
      "<dt>Mitglied seit</dt><dd>" + m.seit + (y ? " · " + y + (y === 1 ? " Jahr" : " Jahre") : " · neu") + (JUB.indexOf(y) > -1 ? " 🎉" : "") + "</dd>" +
      "<dt>Beitrag " + YEAR + '</dt><dd><span class="st ' + m.st + '">' + ST[m.st] + "</span></dd>" +
      (m.st !== "ok" ? "<dt>Erinnerungen</dt><dd>" + (m.rem ? m.rem + " geschickt" : "noch keine") + "</dd>" : "") +
      (inAtt ? "<dt>" + esc(S.P.probe[2]) + "</dt><dd>" + (A.seen[m.nr] + (A.saved && A.here[m.nr] ? 1 : 0)) + " von " + (A.held + (A.saved ? 1 : 0)) + " " + esc(S.P.probe[3]) + "</dd>" : "") +
      "<dt>Helferdienst</dt><dd>" + (sh ? esc(S.help.ev.t) + ": " + esc(sh.t) + ", " + esc(sh.h) : "nicht eingeteilt") + "</dd>" +
      "<dt>" + esc(S.P.xf) + "</dt><dd>" + esc(m === S.me ? m.adr.x : xval(m)) + "</dd>" +
      "<dt>Kontakt</dt><dd>" + (m === S.me ? esc(m.adr.str) + "<br>" + esc(m.adr.ort) + "<br>" + esc(m.adr.tel) + "<br>" + esc(m.adr.mail) + (m.chg ? '<em class="chg">heute selbst geändert</em>' : "") : "Adresse, Telefon, E-Mail · nur für den Vorstand sichtbar") + "</dd></dl>" +
      '<div class="mcard__ft">' + (m.st === "bad" ? '<button class="dbtn sm" type="button" data-mc-rem><svg><use href="#i-mail"/></svg>Zahlschein schicken</button>' : "") + '<button class="dbtn sm ghost" type="button" data-mc-x>Schließen</button></div>';
    mcard.hidden = false; impv.hidden = true; mcard.setAttribute("data-nr", nr);
    var x = mcard.querySelector(".mcard__x"); if (x) x.focus({ preventScroll: true });
  }
  function closeCard() { if (mcard.hidden) return; var nr = mcard.getAttribute("data-nr"); mcard.hidden = true; var b = $('[data-card="' + nr + '"]'); if (b) b.focus({ preventScroll: true }); }
  mcard.addEventListener("click", function (e) {
    if (e.target.closest("[data-mc-x]")) { closeCard(); return; }
    if (e.target.closest("[data-mc-rem]")) {
      var m = S.mem[+mcard.getAttribute("data-nr") - 1]; m.rem = (m.rem || 0) + 1;
      feed("", "i-mail", "Zahlschein mit QR-Code an " + m.name + " geschickt");
      toast("Zahlschein verschickt", m.name + " · " + S.P.arts[m.art].b + " €");
      renderOpen(); openCard(m.nr);
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCard(); bview.hidden = true; bankv.hidden = true; impv.hidden = true; } });

  // ---------- Vereinsart wechseln ----------
  function load(k) {
    wk = 0;
    $("[data-lgn-mail]").value = (k === "musik" ? "obfrau@" : "obmann@") + VK[k].url.split("/")[0];
    build(k);
    document.body.setAttribute("data-vk", k);
    mcard.hidden = true; bview.hidden = true; bankv.hidden = true; impv.hidden = true; setBel("");
    $("[data-m-year]").textContent = YEAR;
    $("[data-me-first]").textContent = S.me.name.split(" ")[0];
    $("[data-d-newbadge]").hidden = true;
    setRo(false);
    jn.value = ""; jok.checked = false;
    $("[data-j-form]").hidden = false; $("[data-j-done]").hidden = true;
    evD.min = iso(today); evD.value = iso(addDays(12));
    $("[data-ev-g]").innerHTML = '<option value="">Alle Mitglieder</option>' + S.P.groups.map(function (g) { return '<option value="' + esc(g) + '">' + esc(S.P.glbl + " " + g) + "</option>"; }).join("");
    $("[data-me-ini]").textContent = ini(S.me.name); closeProf();
    initBrand();
    renderPhoneEvents(); renderJoin(); renderPins(); renderNForm(); renderSent(); renderJub();
    $("[data-d-helpbadge]").hidden = true;
    renderKpis(); renderFeed(); renderOpen(); renderMembers(); renderDeskEvents(); renderCash();
    renderWeek(); renderAtt(); renderHelp();
  }
  $("[data-switch]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-vk]"); if (!b || b.getAttribute("aria-pressed") === "true") return;
    $$("[data-vk]", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    load(b.getAttribute("data-vk"));
  });
  // qrcode.js wird ebenfalls mit defer geladen und ist hier schon da; zur Sicherheit erst nach "load" zeichnen.
  load("sport");
  if (!window.qrcode || !window.tkQR) window.addEventListener("load", renderDue);
})();
