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
  var cm = $("[data-calc-m]"), cy = $("[data-calc-y]");
  if (cm && cy) {
    var calc = function () {
      var m = +cm.value, y = +cy.value;
      $("[data-calc-mo]").textContent = m + " €";
      $("[data-calc-yo]").textContent = y + (y === 1 ? " Jahr" : " Jahre");
      $("[data-calc-sum]").textContent = eur(m * 12 * y);
    };
    cm.addEventListener("input", calc); cy.addEventListener("input", calc); calc();
  }

  // ---------- Musterdaten ----------
  var VK = {
    musik: {
      name: "Musikverein Lindenau", logo: "MV", url: "mv-lindenau.at/vorstand", total: 126, glbl: "Register",
      groups: ["Flöte", "Klarinette", "Saxophon", "Trompete", "Flügelhorn", "Tenorhorn", "Posaune", "Tuba", "Schlagwerk"],
      arts: [{ k: "aktiv", l: "Aktiv", b: 40 }, { k: "jugend", l: "Jugend", b: 15 }, { k: "unter", l: "Unterstützend", b: 25 }],
      board: [["Obfrau", "Maria Leitner"], ["Kapellmeister", "Stefan Pichler"], ["Kassier", "Josef Brandstetter"], ["Schriftführerin", "Eva Hofer"]],
      events: [["Gesamtprobe", "Musikheim", "19:30", 2, 38, 4], ["Registerprobe Blech", "Musikheim", "18:30", 6, 14, 2], ["Herbstkonzert", "Festsaal", "19:00", 16, 41, 3], ["Cäcilienmesse", "Pfarrkirche", "09:30", 30, 29, 6]],
      probe: ["Registerprobe Holz", "18:30", "Probenbesuch", "Proben"],
      fest: { ev: 2, shifts: [["Aufbau", "15–18 Uhr", 4], ["Kassa", "18–21 Uhr", 2], ["Schank", "18–20:30 Uhr", 3], ["Schank", "20:30–23 Uhr", 3], ["Abbau", "23–24 Uhr", 4]] },
      start: 5230,
      cash: [["Förderung Gemeinde", "Förderungen", 1500], ["Frühschoppen", "Feste", 4380], ["Getränke Frühschoppen", "Feste", -1645.4], ["Noten Frühlingskonzert", "Noten & Instrumente", -386], ["Reparatur Tuba", "Noten & Instrumente", -540], ["Spende Raiffeisen-Fest", "Spenden", 300], ["Trachtenblusen (4 Stück)", "Tracht", -712], ["Versicherung Instrumente", "Verwaltung", -268.5], ["Konzertkarten Frühlingskonzert", "Feste", 2140], ["Webspace und Domain", "Verwaltung", -96]]
    },
    sport: {
      name: "USV Rotbach", logo: "SV", url: "usv-rotbach.at/vorstand", total: 214, glbl: "Sektion",
      groups: ["Fußball", "Tennis", "Turnen", "Laufen", "Stocksport"],
      arts: [{ k: "aktiv", l: "Erwachsene", b: 60 }, { k: "jugend", l: "Jugend", b: 25 }, { k: "unter", l: "Unterstützend", b: 30 }],
      board: [["Obmann", "Thomas Ecker"], ["Sportliche Leitung", "Sabine Wurm"], ["Kassier", "Markus Lehner"], ["Schriftführer", "Peter Riegler"]],
      events: [["Training Kampfmannschaft", "Sportplatz", "18:00", 1, 19, 3], ["Heimspiel gegen SC Talheim", "Sportplatz", "15:00", 3, 22, 1], ["Saisonabschluss", "Kantine", "19:00", 22, 64, 8], ["Generalversammlung", "Gasthaus Post", "19:30", 35, 41, 5]],
      probe: ["Training Nachwuchs", "17:00", "Trainingsbesuch", "Trainings"],
      fest: { ev: 2, shifts: [["Aufbau", "14–17 Uhr", 4], ["Grill", "17–20 Uhr", 2], ["Schank", "17–20 Uhr", 3], ["Schank", "20–23 Uhr", 3], ["Abbau", "23–24 Uhr", 4]] },
      start: 7810,
      cash: [["Förderung Sportland", "Förderungen", 2400], ["Kantine September", "Kantine", 3125.6], ["Einkauf Kantine", "Kantine", -1380.2], ["Dressen Nachwuchs", "Dressen & Bälle", -1190], ["Bälle und Hütchen", "Dressen & Bälle", -312], ["Sponsor Bandenwerbung", "Sponsoren", 1800], ["Rasenpflege", "Sportplatz", -860], ["Schiedsrichtergebühren", "Spielbetrieb", -540], ["Eintritt Heimspiele", "Spielbetrieb", 1460], ["Webspace und Domain", "Verwaltung", -96]]
    },
    kultur: {
      name: "Kulturkreis Schlossmühle", logo: "KS", url: "kulturkreis-schlossmuehle.at/vorstand", total: 87, glbl: "Bereich",
      groups: ["Theater", "Lesungen", "Kino", "Ausstellungen", "Technik"],
      arts: [{ k: "aktiv", l: "Mitglied", b: 30 }, { k: "jugend", l: "Ermäßigt", b: 15 }, { k: "unter", l: "Förderer", b: 60 }],
      board: [["Obfrau", "Claudia Fuchsberger"], ["Stellvertreter", "Andreas Wieser"], ["Kassierin", "Renate Kogler"], ["Schriftführer", "Martin Bauer"]],
      events: [["Probe Theatergruppe", "Mühlenstadl", "19:00", 3, 12, 1], ["Lesung: Mostviertler Geschichten", "Bibliothek", "19:30", 9, 18, 2], ["Filmabend im Hof", "Mühlenstadl", "20:00", 17, 26, 4], ["Vorstandssitzung", "Mühlenstadl", "18:30", 24, 7, 0]],
      probe: ["Leseprobe", "19:00", "Probenbesuch", "Proben"],
      fest: { ev: 2, shifts: [["Aufbau und Leinwand", "17–19:30 Uhr", 3], ["Kassa", "19–20:30 Uhr", 2], ["Buffet", "19–21 Uhr", 2], ["Technik", "19:30–22:30 Uhr", 1], ["Abbau", "22:30–24 Uhr", 3]] },
      start: 3120,
      cash: [["Förderung Land (Kultur)", "Förderungen", 1200], ["Eintritt Sommertheater", "Veranstaltungen", 3860], ["Bühnenbild und Kostüme", "Veranstaltungen", -1240], ["Filmrechte Filmabend", "Veranstaltungen", -180], ["Spenden Lesung", "Spenden", 245], ["Tontechnik Miete", "Technik", -420], ["Plakate und Flyer", "Werbung", -315.8], ["Versicherung", "Verwaltung", -189], ["Buffet Sommertheater", "Veranstaltungen", 960], ["Webspace und Domain", "Verwaltung", -96]]
    }
  };
  var FIRST = ["Anna", "Lukas", "Lena", "Florian", "Sophie", "Michael", "Julia", "David", "Katharina", "Stefan", "Laura", "Daniel", "Hannah", "Thomas", "Sarah", "Christoph", "Lisa", "Matthias", "Theresa", "Andreas", "Magdalena", "Johannes", "Elena", "Simon", "Verena", "Patrick", "Marlene", "Tobias", "Johanna", "Georg", "Elisabeth", "Philipp", "Clara", "Martin", "Anja", "Florentina", "Leopold", "Sabine", "Raphael", "Paula"];
  var LAST = ["Huber", "Gruber", "Wagner", "Mayr", "Brunner", "Wimmer", "Hofer", "Leitner", "Pichler", "Steiner", "Moser", "Fuchs", "Eder", "Schwarz", "Berger", "Haas", "Winkler", "Lechner", "Aigner", "Schmid", "Reiter", "Kern", "Weiß", "Höller", "Ecker", "Hager", "Strasser", "Zauner", "Kogler", "Fischer", "Haider", "Riegler", "Lindner", "Schober", "Teufl", "Ofner"];

  var S; // aktueller Zustand
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
    var me = mem[41]; me.name = "Anna Huber"; me.st = "bad"; me.art = 0; me.role = ""; me.seit = YEAR - 6;
    var paid = mem.filter(function (m) { return m.st === "ok"; }).reduce(function (s, m) { return s + P.arts[m.art].b; }, 0);
    // Kassabuch: Sammelbuchung der schon bezahlten Beiträge plus Musterbuchungen übers Jahr verteilt
    var cash = [], span = Math.max(30, Math.round((today - new Date(YEAR, 0, 10)) / 864e5));
    P.cash.forEach(function (c, j) { cash.push({ d: addDays(-span + Math.round(span * (j + 0.5) / (P.cash.length + 1))), t: c[0], c: c[1], a: c[2] }); });
    cash.push({ d: addDays(-Math.min(span - 5, 200)), t: "Mitgliedsbeiträge " + YEAR + " (Sammelbuchung)", c: "Mitgliedsbeiträge", a: paid });
    cash.sort(function (a, b) { return b.d - a.d; });
    S = {
      k: k, P: P, mem: mem, me: me, cash: cash, filter: "alle", q: "", io: "out", newMem: {},
      ev: P.events.map(function (e, j) { return { id: "e" + j, t: e[0], o: e[1], h: e[2], d: addDays(e[3]), yes: e[4], no: e[5], mine: "" }; }),
      feed: []
    };
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
  function renderPhoneEvents() {
    $("[data-m-evs]").innerHTML = S.ev.map(function (e) {
      return '<div class="ev" data-ev="' + e.id + '"><div class="ev__top"><span class="ev__d"><b>' + ("0" + e.d.getDate()).slice(-2) + "</b>" + MON[e.d.getMonth()] + '</span><span class="ev__t"><b>' + esc(e.t) + (e.fresh ? '<span class="ev__new">Neu</span>' : "") + "</b><small>" + WT[e.d.getDay()] + " · " + esc(e.h) + " Uhr · " + esc(e.o) + "</small></span></div>" +
        '<div class="ev__btn"><button type="button" class="yes" data-ans="yes" aria-pressed="' + (e.mine === "yes") + '"><svg><use href="#i-check"/></svg>Ich komme</button><button type="button" class="no" data-ans="no" aria-pressed="' + (e.mine === "no") + '"><svg><use href="#i-x"/></svg>Leider nicht</button></div>' +
        '<p class="ev__cnt">' + e.yes + " Zusagen · " + e.no + " Absagen</p></div>";
    }).join("");
  }
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
    $("[data-m-rcv]").textContent = P.name;
    $("[data-m-ref]").textContent = ref;
    var st = $("[data-m-st]");
    st.className = "pill " + me.st; st.textContent = me.st === "ok" ? "bezahlt" : me.st === "wait" ? "gemeldet" : "offen";
    $("[data-m-paid]").hidden = me.st !== "bad";
    $("[data-m-dot]").className = me.st === "bad" ? "" : "off";
    $("[data-m-thx]").hidden = me.st === "bad";
    $("[data-m-due]").hidden = me.st !== "bad";
    var cv = $("[data-m-qr]");
    if (cv && window.qrcode) {
      var q = qrcode(0, "M");
      q.addData(["BCD", "002", "1", "SCT", "", P.name, "AT000000000000000000", "EUR" + amt.toFixed(2), "", "", ref.replace(" · ", " ")].join("\n"));
      q.make();
      var n = q.getModuleCount(), px = Math.floor(164 / (n + 4)), off = Math.floor((164 - px * n) / 2), cx = cv.getContext("2d");
      cx.fillStyle = "#fff"; cx.fillRect(0, 0, 164, 164); cx.fillStyle = "#0f172a";
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (q.isDark(y, x)) cx.fillRect(off + x * px, off + y * px, px, px);
    }
  }
  $("[data-m-paid]").addEventListener("click", function () {
    S.me.st = "wait"; renderDue(); renderMembers(); renderOpen();
    feed("pop", "i-euro", S.me.name + " meldet: Beitrag überwiesen");
    toast("Der Kassier sieht die Meldung", "Bestätigen in der Mitgliederliste");
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
  });

  // ---------- Vorstand ----------
  $("[data-d-tabs]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-dt]"); if (!b) return;
    var t = b.getAttribute("data-dt");
    $$("[data-dt]", this).forEach(function (x) { x.setAttribute("aria-selected", x === b); });
    $$(".dp").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-dp") === t); });
    if (t === "mitglieder") $("[data-d-newbadge]").hidden = true;
    if (t === "helfer") $("[data-d-helpbadge]").hidden = true;
  });

  function cashSums() {
    var inn = 0, out = 0;
    S.cash.forEach(function (c) { if (c.a >= 0) inn += c.a; else out -= c.a; });
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
      return "<li><span>" + esc(m.name) + "</span><span>" + (m.st === "wait" ? "gemeldet" : S.P.arts[m.art].b + " €") + "</span></li>";
    }).join("");
    if (open.length > 5) h += '<li class="more">und ' + (open.length - 5) + " weitere</li>";
    if (!open.length) h = '<li class="more">Alle Beiträge sind bezahlt. 🎉</li>';
    $("[data-open]").innerHTML = h;
    $("[data-remind]").hidden = !open.some(function (m) { return m.st === "bad"; });
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
      return "<tr" + (S.newMem[m.nr] ? ' class="is-new"' : "") + "><td>M-" + ("000" + m.nr).slice(-4) + "</td><td>" + esc(m.name) + (m.role ? '<span class="role">' + esc(m.role) + "</span>" : "") +
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
    var b = e.target.closest("[data-pay]"); if (!b) return;
    var m = S.mem[+b.getAttribute("data-pay") - 1], amt = S.P.arts[m.art].b;
    if (m.st === "ok") {
      m.st = "bad";
      S.cash = S.cash.filter(function (c) { return c.m !== m.nr; });
    } else {
      m.st = "ok";
      S.cash.unshift({ d: new Date(today), t: "Beitrag " + YEAR + " " + m.name, c: "Mitgliedsbeiträge", a: amt, m: m.nr, fresh: true });
      feed("ok", "i-check", "Beitrag von " + m.name + " abgehakt (" + amt + " €), im Kassabuch gebucht");
      toast("Beitrag abgehakt", m.name + " · " + amt + " € im Kassabuch");
    }
    renderMembers(); renderKpis(); renderOpen(); renderCash(); flash("[data-k-cash]");
    if (m === S.me) renderDue();
  });
  $("[data-remind]").addEventListener("click", function () {
    var n = S.mem.filter(function (m) { return m.st === "bad"; }).length;
    feed("", "i-mail", "Zahlschein mit QR-Code an " + n + " Mitglieder geschickt");
    toast(n + " E-Mails mit Zahlschein", "jeder mit eigenem Betrag und QR-Code");
  });

  // Termine im Vorstand
  function renderDeskEvents() {
    $("[data-d-evs]").innerHTML = S.ev.map(function (e) {
      var all = Math.max(1, e.yes + e.no);
      return '<div class="dev' + (e.fresh ? " is-new" : "") + '"><span class="dev__d"><b>' + ("0" + e.d.getDate()).slice(-2) + "</b>" + MON[e.d.getMonth()] + '</span><span class="dev__t"><b>' + esc(e.t) + "</b><small>" + WT[e.d.getDay()] + " · " + esc(e.h) + " Uhr · " + esc(e.o) + '</small><span class="dev__bar"><i style="width:' + (e.yes / all * 100) + '%"></i><i style="width:' + (e.no / all * 100) + '%"></i></span></span><span class="dev__n"><b>' + e.yes + "</b>" + e.no + " Absagen</span></div>";
    }).join("");
  }
  var evD = $("[data-ev-d]");
  $("[data-ev-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = $("[data-ev-t]").value.trim().slice(0, 40), d = evD.value ? new Date(evD.value + "T00:00:00") : null, h = $("[data-ev-h]").value || "19:30";
    if (!t || !d || isNaN(d)) return;
    var ev = { id: "n" + Date.now(), t: t, o: "Vereinsheim", h: h, d: d, yes: 0, no: 0, mine: "", fresh: true };
    S.ev.push(ev); S.ev.sort(function (a, b) { return a.d - b.d; });
    $("[data-ev-t]").value = "";
    renderDeskEvents(); renderPhoneEvents(); renderKpis(); renderWeek();
    feed("", "i-cal", "Termin „" + t + "“ am " + dshort(d) + " angelegt");
    toast("Termin ist in der App", "alle Mitglieder können zu- oder absagen");
  });

  // Kassabuch
  function renderCash() {
    var s = cashSums(), cats = {};
    $("[data-c-sum]").textContent = eur(s.sum, true);
    $("[data-c-in]").textContent = eur(s.inn, true);
    $("[data-c-out]").textContent = eur(s.out, true);
    S.cash.forEach(function (c) { cats[c.c] = (cats[c.c] || 0) + c.a; });
    var keys = Object.keys(cats).sort(function (a, b) { return Math.abs(cats[b]) - Math.abs(cats[a]); }).slice(0, 6);
    var max = Math.max.apply(null, keys.map(function (k) { return Math.abs(cats[k]); }).concat([1]));
    $("[data-c-cats]").innerHTML = keys.map(function (k) {
      var v = cats[k];
      return '<div class="cat"><span>' + esc(k) + '</span><span class="b"><i class="' + (v >= 0 ? "in" : "out") + '" style="width:' + (Math.abs(v) / max * 100) + '%"></i></span><span>' + (v >= 0 ? "+" : "−") + eur(Math.abs(Math.round(v))) + "</span></div>";
    }).join("");
    $("[data-c-rows]").innerHTML = S.cash.map(function (c) {
      var h = "<tr" + (c.fresh ? ' class="is-new"' : "") + "><td>" + dshort(c.d) + "</td><td>" + esc(c.t) + "</td><td>" + esc(c.c) + '</td><td class="r ' + (c.a >= 0 ? "in" : "out") + '">' + (c.a >= 0 ? "+ " : "− ") + eur(Math.abs(c.a), true) + "</td></tr>";
      return h;
    }).join("");
    var rb = $("[data-report-box]"); if (!rb.hidden) renderReport();
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
    S.cash.unshift({ d: new Date(today), t: t, c: S.io === "in" ? "Sonstige Einnahmen" : "Sonstige Ausgaben", a: S.io === "in" ? a : -a, fresh: true });
    $("[data-c-t]").value = ""; $("[data-c-a]").value = "";
    renderCash(); renderKpis();
    feed(S.io === "in" ? "ok" : "bad", "i-book", "Gebucht: " + t + " (" + (S.io === "in" ? "+" : "−") + eur(a, true) + ")");
  });
  function renderReport() {
    var s = cashSums(), inC = {}, outC = {};
    S.cash.forEach(function (c) { var o = c.a >= 0 ? inC : outC; o[c.c] = (o[c.c] || 0) + Math.abs(c.a); });
    var rows = function (o) { return Object.keys(o).sort().map(function (k) { return "<tr><td>" + esc(k) + "</td><td>" + eur(o[k], true) + "</td></tr>"; }).join(""); };
    var b = S.P.board;
    $("[data-report-box]").innerHTML = "<h4>Einnahmen-Ausgaben-Rechnung " + YEAR + "</h4><p>" + esc(S.P.name) + " · Stand " + dshort(today) + YEAR + " · Musterdaten</p>" +
      "<table><tr><td>Anfangsbestand 1. Jänner</td><td>" + eur(S.P.start, true) + '</td></tr><tr class="sum"><td>Einnahmen</td><td>' + eur(s.inn, true) + "</td></tr>" + rows(inC) +
      '<tr class="sum"><td>Ausgaben</td><td>' + eur(s.out, true) + "</td></tr>" + rows(outC) +
      '<tr class="sum"><td>Kassastand heute</td><td>' + eur(s.sum, true) + "</td></tr></table>" +
      '<div class="sig"><span>' + esc(b[2][0]) + ": " + esc(b[2][1]) + "</span><span>Rechnungsprüfer 1 und 2</span></div>";
  }
  $("[data-report]").addEventListener("click", function () {
    var rb = $("[data-report-box]"); rb.hidden = !rb.hidden;
    if (!rb.hidden) { renderReport(); rb.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  });

  // CSV (Strichpunkt und BOM, damit Excel in Österreich Umlaute und Spalten richtig liest; = + - @ am Anfang
  // bekommen ein Hochkomma, damit Excel eingetippte Texte nicht als Formel ausführt)
  function csv(name, rows) {
    var txt = "﻿" + rows.map(function (r) { return r.map(function (v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";"); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
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
    csv("kassabuch-muster.csv", [["Datum", "Buchung", "Bereich", "Betrag"]].concat(S.cash.map(function (c) {
      return [dshort(c.d) + c.d.getFullYear(), c.t, c.c, c.a.toFixed(2).replace(".", ",")];
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
    S.cash.forEach(function (c) { if (c.d.getFullYear() === YEAR) byM[c.d.getMonth()] = (byM[c.d.getMonth()] || 0) + c.a; });
    for (var m = 0; m < months; m++) { run += byM[m] || 0; cv.push(run); }
    if (cv.length < 2) cv.unshift(S.P.start);
    spark($('[data-spark="mem"]'), mv, !sparkDrawn[S.k]);
    spark($('[data-spark="cash"]'), cv, !sparkDrawn[S.k]);
    sparkDrawn[S.k] = 1;
  }

  // ---------- Wochenleiste mit Jetzt-Linie ----------
  function renderWeek() {
    var days = [], h = "";
    for (var i = -1; i < 7; i++) days.push(addDays(i));
    $("[data-week-range]").textContent = dshort(days[0]) + " bis " + dshort(days[7]);
    days.forEach(function (d, i) {
      var evs = S.ev.filter(function (e) { return e.d - d === 0; }).map(function (e) { return '<span class="wev' + (e === S.help.ev ? " fest" : "") + '"><b>' + esc(e.t) + "</b><span>" + esc(e.h) + "</span></span>"; });
      if (i === 1) evs.unshift('<span class="wev att"><b>' + esc(S.P.probe[0]) + "</b><span>" + esc(S.P.probe[1]) + "</span></span>");
      h += '<div class="wd' + (i === 1 ? " is-today" : i === 0 ? " is-past" : "") + '"><small>' + (i === 1 ? "Heute" : WT[d.getDay()]) + "<b>" + d.getDate() + ".</b></small>" + evs.join("") + "</div>";
    });
    var now = new Date(), f = (now.getHours() + now.getMinutes() / 60) / 24;
    h += '<i class="now" style="left:' + ((1 + f) / 8 * 100).toFixed(2) + '%"><span>' + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + "</span></i>";
    $("[data-week]").innerHTML = h;
  }
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
    if (inShift) return '<span class="hc" data-in="' + m.nr + '"><i>' + ini(m.name) + "</i>" + esc(m.name) + '<button type="button" class="hc__x" data-rm="' + m.nr + '" aria-label="' + esc(m.name) + ' aus der Schicht nehmen"><span>Entfernen?</span>×</button></span>';
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
    drag = { c: c, nr: +c.getAttribute("data-hc"), x: e.clientX, y: e.clientY, ghost: null, over: null };
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (!drag.ghost) {
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 6) return;
      var r = drag.c.getBoundingClientRect();
      drag.dx = drag.x - r.left; drag.dy = drag.y - r.top;
      drag.ghost = drag.c.cloneNode(true); drag.ghost.classList.add("drag"); drag.ghost.classList.remove("sel");
      document.body.appendChild(drag.ghost); drag.c.classList.add("ghost");
    }
    drag.ghost.style.left = (e.clientX - drag.dx) + "px"; drag.ghost.style.top = (e.clientY - drag.dy) + "px";
    var t = document.elementFromPoint(e.clientX, e.clientY), sh = t && t.closest("[data-shift]");
    if (drag.over && drag.over !== sh) drag.over.classList.remove("over");
    if (sh && !sh.classList.contains("full")) { sh.classList.add("over"); drag.over = sh; } else drag.over = null;
  });
  function endDrag(e, cancel) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.ghost) {
      if (cancel) return;
      S.help.sel = S.help.sel === d.nr ? null : d.nr; renderHelp(); return;
    }
    d.ghost.remove(); d.c.classList.remove("ghost");
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

  // ---------- Vereinsart wechseln ----------
  function load(k) {
    build(k);
    document.body.setAttribute("data-vk", k);
    $$("[data-v-name]").forEach(function (el) { el.textContent = S.P.name; });
    $$("[data-v-logo]").forEach(function (el) { el.textContent = S.P.logo; });
    $("[data-v-url]").textContent = S.P.url;
    $("[data-m-year]").textContent = YEAR;
    $("[data-me-first]").textContent = S.me.name.split(" ")[0];
    $("[data-d-newbadge]").hidden = true;
    $("[data-report-box]").hidden = true;
    jn.value = ""; jok.checked = false;
    $("[data-j-form]").hidden = false; $("[data-j-done]").hidden = true;
    evD.min = iso(today); evD.value = iso(addDays(12));
    renderPhoneEvents(); renderDue(); renderJoin();
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
  load("musik");
  if (!window.qrcode) window.addEventListener("load", renderDue);
})();
