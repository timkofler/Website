// Gasthof & Pension Zirbenhof – Beispielseite von tim-kofler.at
// Menü, Zimmer-Details, Belegungskalender mit Preisrechnung und Anfrage, Tagesablauf beim Scrollen, Sommer/Winter.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function eur(n) { return n.toLocaleString("de-AT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €"; }

  var bar = $(".tk-demo-bar");
  function setBar() { if (bar) document.documentElement.style.setProperty("--bar", bar.offsetHeight + "px"); }
  setBar(); window.addEventListener("resize", setBar);

  // Mobilmenü
  var burger = $("#burger"), panel = $("#mpanel");
  function menu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("open", open);
  }
  burger.addEventListener("click", function () { menu(burger.getAttribute("aria-expanded") !== "true"); });
  panel.addEventListener("click", function (e) { if (e.target.closest("a")) menu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) { menu(false); burger.focus(); } });

  // Zimmer: Preis gilt für 2 Personen pro Nacht
  var ROOMS = [
    { id: "zirbe", name: "Zirbenzimmer", im: "im Zirbenzimmer", kind: "Doppelzimmer mit Balkon", max: 2, m2: 24, price: 118, min: 2, dog: false, fr: true,
      text: "Doppelzimmer im ersten Stock mit Balkon nach Süden. Bett, Kasten und Nachtkästchen sind aus Zirbe vom Tischler im Ort.",
      list: ["Balkon mit zwei Stühlen, Morgensonne", "Regendusche und Fön", "Zirbenbett 180 × 200 cm", "Schreibtisch, WLAN, kein Fernseher"] },
    { id: "oetscher", name: "Ötscherblick", im: "im Ötscherblick", kind: "Komfortzimmer", max: 3, m2: 32, price: 138, min: 2, dog: false, fr: true,
      text: "Unser größtes Doppelzimmer mit Sitzecke am Fenster, Blick auf den Ötscher und Platz für ein Zustellbett.",
      list: ["Panoramafenster Richtung Ötscher", "Badewanne und getrenntes WC", "Sitzecke mit Leselampe", "Zustellbett für eine dritte Person"] },
    { id: "familie", name: "Familienzimmer Erlauf", im: "im Familienzimmer", kind: "Familienzimmer, 2 Räume", max: 4, m2: 38, price: 158, min: 2, dog: true, fr: true,
      text: "Zwei Räume mit Verbindungstür: Eltern vorne, Kinder hinten. Im Garten warten Sandkiste und Schaukel.",
      list: ["Doppelbett und zwei Einzelbetten", "Kinderbett und Hochstuhl auf Wunsch", "Spielkiste und Bücher", "Kinder bis 6 Jahre gratis, Hund erlaubt"] },
    { id: "dachstube", name: "Ferienwohnung Dachstube", im: "in der Ferienwohnung", kind: "Ferienwohnung unterm Dach", max: 5, m2: 55, price: 135, min: 3, dog: true, fr: false,
      text: "Ganz oben mit eigenem Eingang über die Außenstiege, Küche, Kaminofen und einer Bank vor dem Fenster.",
      list: ["Küche mit Geschirrspüler", "Kaminofen, Holz liegt bereit", "Schlafzimmer plus Schlafcouch", "Frühstück oder Halbpension dazubuchbar"] }
  ];
  var byId = {}; ROOMS.forEach(function (r) { byId[r.id] = r; });
  var EXTRA_AD = 32, EXTRA_KI = 18, HP_AD = 29, HP_KI = 15, FR_AD = 16, FR_KI = 9, DOG = 12, TAX = 2.5;

  // Zimmer-Dialog
  var dlg = $("#rd"), dlgFrom = null;
  function openRoom(id) {
    var r = byId[id]; if (!r) return;
    $("#rdImg").src = "/beispiele/pension/bilder/" + id + "-1200.webp";
    $("#rdImg").alt = r.name;
    $("#rdK").textContent = r.kind;
    $("#rdH").textContent = r.name;
    $("#rdP").textContent = r.text;
    $("#rdL").innerHTML = r.list.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    $("#rdPrice").textContent = r.price + " €";
    $("#rdPs").textContent = (r.fr ? "pro Nacht für 2 Personen, mit Frühstück" : "pro Nacht, ohne Frühstück") + " · " + r.m2 + " m² · bis " + r.max + " Personen · ab\u00a0" + nights(r.min);
    $("#rdBook").dataset.pick = id;
    dlgFrom = document.activeElement;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function closeRoom() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openRoom(b.dataset.open); }); });
  $("#rdX").addEventListener("click", closeRoom);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeRoom(); });
  dlg.addEventListener("close", function () { if (dlgFrom && dlgFrom.focus && !dlg._toBook) dlgFrom.focus(); dlg._toBook = false; });
  $("#rdBook").addEventListener("click", function () { dlg._toBook = true; closeRoom(); });

  // Belegung: gleichbleibend erzeugt pro Zimmer (Beispieldaten), ab heute 8 Monate
  var DAY = 864e5;
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function key(d) { return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function nightsBetween(a, b) { return Math.round((b - a) / DAY); }
  var busy = {};
  ROOMS.forEach(function (r, ri) {
    var s = 7 + ri * 131, rnd = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    var set = {}, d = addDays(today, 0), end = addDays(today, 245), free = true;
    while (d < end) {
      var len = free ? 2 + Math.floor(rnd() * 8) : 1 + Math.floor(rnd() * 5);
      if (!free && d.getDay() === 5) len = Math.max(len, 2);
      for (var i = 0; i < len; i++) { if (!free) set[key(d)] = 1; d = addDays(d, 1); }
      free = !free;
    }
    busy[r.id] = set;
  });
  function rangeFree(id, a, b) { for (var d = new Date(a); d < b; d = addDays(d, 1)) if (busy[id][key(d)]) return false; return true; }
  // Anreise möglich, wenn ab diesem Tag die Mindestnächte frei sind; Abreise möglich, wenn alle Nächte dazwischen frei sind
  function canStart(id, d) { return d >= today && rangeFree(id, d, addDays(d, byId[id].min)); }
  function canEnd(id, a, d) { return d > a && nightsBetween(a, d) >= byId[id].min && rangeFree(id, a, d); }
  function nights(n) { return n === 1 ? "1\u00a0Nacht" : n + "\u00a0Nächten"; }

  var st = { room: "zirbe", a: null, b: null, ad: 2, ki: 0, board: "fr", dog: false, view: new Date(today.getFullYear(), today.getMonth(), 1) };

  var rtabs = $("#rtabs");
  rtabs.innerHTML = ROOMS.map(function (r) { return '<button type="button" data-r="' + r.id + '" aria-pressed="false">' + r.name.replace("Ferienwohnung ", "FeWo ").replace("Familienzimmer ", "Familie ") + "</button>"; }).join("");
  rtabs.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) pickRoom(b.dataset.r, true); });
  $$("[data-pick]").forEach(function (a) { a.addEventListener("click", function () { pickRoom(a.dataset.pick, true); }); });

  function pickRoom(id, keepDates) {
    st.room = id;
    var r = byId[id];
    st.ad = Math.min(st.ad, r.max); st.ki = Math.min(st.ki, r.max - st.ad);
    if (st.a && st.b && !canEnd(id, st.a, st.b)) { st.a = st.b = null; hint("Der Zeitraum ist " + r.im + " leider nicht frei. Wähle neue Tage.", true); }
    else if (st.a && !st.b && !canStart(id, st.a)) { st.a = null; hint("Dieser Anreisetag ist " + r.im + " nicht möglich. Tippe auf einen grünen Tag.", true); }
    else if (!keepDates) st.a = st.b = null;
    else if (st.a && !st.b) hint(pickHint());
    else if (!st.a) hint("Tippe auf deinen Anreisetag. " + r.im.charAt(0).toUpperCase() + r.im.slice(1) + " bleibst du ab " + nights(r.min) + ".");
    if (!r.dog) st.dog = false;
    renderAll();
  }

  var months = $("#calMonths"), hintEl = $("#calHint");
  function hint(t, warn) { hintEl.textContent = t; hintEl.classList.toggle("warn", !!warn); }
  var MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var DOW = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  function monthHTML(y, m) {
    var first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    var h = '<div class="month"><h4>' + MON[m] + " " + y + '</h4><div class="days">' + DOW.map(function (d) { return '<span class="dow">' + d + "</span>"; }).join("");
    for (var i = 0; i < off; i++) h += "<span></span>";
    var picking = st.a && !st.b;
    for (var dd = 1; dd <= days; dd++) {
      var d = new Date(y, m, dd), k = key(d), cls = "day", dis = false, lab = dd + ". " + MON[m], isBusy = !!busy[st.room][k];
      if (d < today) { cls += " past"; dis = true; }
      else if (picking && +d === +st.a) lab += ", Anreise, nochmal tippen hebt sie auf";
      else if (picking && canEnd(st.room, st.a, d)) { cls += " free ok"; lab += ", als Abreise möglich"; }
      else if (isBusy) { cls += " busy"; lab += ", belegt"; }
      else if (picking) { cls += " nope"; lab += ", als Abreise nicht möglich"; }
      else if (canStart(st.room, d)) { cls += " free"; lab += ", frei"; }
      else { cls += " nope"; lab += ", frei, aber kürzer als " + byId[st.room].min + " Nächte"; }
      if (+d === +today) cls += " today";
      if (st.a && +d === +st.a) cls += " start";
      if (st.b && +d === +st.b) cls += " end";
      if (st.a && st.b && d > st.a && d < st.b) cls += " in";
      h += '<button type="button" class="' + cls + '" data-k="' + +d + '" aria-label="' + lab + '"' + (st.a && +d === +st.a || st.b && +d === +st.b ? ' aria-pressed="true"' : "") + (dis ? " disabled" : "") + ">" + dd + "</button>";
    }
    return h + "</div></div>";
  }
  function renderCal() {
    var v = st.view, v2 = new Date(v.getFullYear(), v.getMonth() + 1, 1);
    months.innerHTML = monthHTML(v.getFullYear(), v.getMonth()) + monthHTML(v2.getFullYear(), v2.getMonth());
    $("#calTitle").textContent = byId[st.room].name;
    $("#calMin").textContent = "Mindestaufenthalt " + byId[st.room].min + " Nächte";
    $("#calPrev").disabled = v <= new Date(today.getFullYear(), today.getMonth(), 1);
    $("#calNext").disabled = v >= new Date(today.getFullYear(), today.getMonth() + 6, 1);
  }
  $("#calPrev").addEventListener("click", function () { st.view = new Date(st.view.getFullYear(), st.view.getMonth() - 1, 1); renderCal(); });
  $("#calNext").addEventListener("click", function () { st.view = new Date(st.view.getFullYear(), st.view.getMonth() + 1, 1); renderCal(); });
  function pickHint() {
    var first = addDays(st.a, byId[st.room].min), last = first;
    while (canEnd(st.room, st.a, addDays(last, 1))) last = addDays(last, 1);
    return "Anreise " + fmt(st.a) + " Abreise möglich " + (+first === +last ? "am " + fmt(first) : "von " + fmt(first) + " bis " + fmt(last)) + " (grün). Nochmal auf die Anreise tippen hebt sie auf.";
  }
  function startHere(d) {
    var r = byId[st.room];
    if (busy[st.room][key(d)]) { hint("Dieser Tag ist schon belegt. Wähle einen grünen Tag als Anreise.", true); return false; }
    if (!canStart(st.room, d)) { hint("Ab diesem Tag sind " + r.im + " keine " + r.min + " Nächte am Stück frei. Wähle einen grünen Tag.", true); return false; }
    st.a = d; st.b = null; hint(pickHint());
    return true;
  }
  months.addEventListener("click", function (e) {
    var b = e.target.closest(".day"); if (!b || b.disabled) return;
    var d = new Date(+b.dataset.k);
    if (st.a && +d === +st.a) { st.a = st.b = null; hint("Anreise aufgehoben. Tippe auf einen neuen Anreisetag."); }
    else if (st.a && st.b && +d === +st.b) { st.b = null; hint(pickHint()); }
    else if (st.a && !st.b && canEnd(st.room, st.a, d)) { st.b = d; hint(nightsBetween(st.a, d) + " Nächte ausgewählt. Passt? Dann rechts anfragen."); }
    else if (!startHere(d)) return;
    renderAll();
    // Liegt kein möglicher Abreisetag im sichtbaren Monat (am Handy nur einer), einen Monat weiterblättern
    if (st.a && !st.b && !$$(".day.ok", months).some(function (x) { return x.offsetParent; }) && !$("#calNext").disabled) $("#calNext").click();
  });
  // Vorschau des Zeitraums beim Zeigen auf einen möglichen Abreisetag
  function preview(to) {
    $$(".day", months).forEach(function (x) { var t = +x.dataset.k; x.classList.toggle("pre", !!to && t > +st.a && t < to); });
  }
  months.addEventListener("mouseover", function (e) { var b = e.target.closest(".day.ok"); preview(b ? +b.dataset.k : 0); });
  months.addEventListener("mouseleave", function () { preview(0); });

  function fmt(d) { return d ? d.toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "short" }) : "–"; }
  var boardEl = $("#board");
  boardEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { st.board = b.dataset.b; renderSum(); } });
  $$("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var r = byId[st.room], d = +b.dataset.d;
      if (b.dataset.step === "ad") st.ad = clamp(st.ad + d, 1, r.max - st.ki);
      else st.ki = clamp(st.ki + d, 0, r.max - st.ad);
      renderSum();
    });
  });
  var dog = $("#dog");
  dog.addEventListener("change", function () { st.dog = dog.checked; renderSum(); });

  function calcPrice() {
    var r = byId[st.room]; if (!st.a || !st.b) return null;
    var n = nightsBetween(st.a, st.b), rows = [];
    var extraAd = Math.max(0, st.ad - 2), extraKi = Math.max(0, st.ki - Math.max(0, 2 - st.ad));
    var per = r.price + extraAd * EXTRA_AD + extraKi * EXTRA_KI;
    rows.push([n + " Nächte × " + eur(per), n * per]);
    var free = Math.floor(n / 7);
    if (free) rows.push(["7 Nächte, 6 zahlen", -free * per, 1]);
    if (st.board === "hp") rows.push(["Halbpension", n * (st.ad * HP_AD + st.ki * HP_KI) + (r.fr ? 0 : n * (st.ad * FR_AD + st.ki * FR_KI))]);
    if (st.board === "fr" && !r.fr) rows.push(["Frühstück", n * (st.ad * FR_AD + st.ki * FR_KI)]);
    if (st.dog) rows.push(["Hund", n * DOG]);
    rows.push(["Ortstaxe", n * st.ad * TAX]);
    var tot = rows.reduce(function (s, x) { return s + x[1]; }, 0);
    return { n: n, rows: rows, tot: tot };
  }
  function renderSum() {
    var r = byId[st.room];
    $("#sImg").src = "/beispiele/pension/bilder/" + r.id + "-640.webp";
    $("#sName").textContent = r.name;
    $("#sMeta").textContent = r.kind + " · bis " + r.max + " Personen · ab\u00a0" + nights(r.min);
    $("#sIn").textContent = fmt(st.a); $("#sOut").textContent = fmt(st.b);
    $("#oAd").textContent = st.ad; $("#oKi").textContent = st.ki;
    $$("[data-step]").forEach(function (b) {
      var up = +b.dataset.d > 0, tot = st.ad + st.ki;
      b.disabled = up ? tot >= r.max : (b.dataset.step === "ad" ? st.ad <= 1 : st.ki <= 0);
    });
    var opts = r.fr ? [["fr", "Frühstück"], ["hp", "Halbpension"]] : [["ohne", "Ohne"], ["fr", "Frühstück"], ["hp", "Halbpension"]];
    if (r.fr && st.board === "ohne") st.board = "fr";
    boardEl.innerHTML = opts.map(function (o) { return '<button type="button" data-b="' + o[0] + '" aria-pressed="' + (st.board === o[0]) + '">' + o[1] + "</button>"; }).join("");
    dog.disabled = !r.dog; dog.checked = st.dog;
    dog.closest(".row").style.opacity = r.dog ? 1 : .45;
    var p = calcPrice();
    $("#calc").innerHTML = p ? p.rows.map(function (x) { return "<div" + (x[2] ? ' class="disc"' : "") + "><span>" + x[0] + "</span><span>" + (x[1] < 0 ? "− " + eur(-x[1]) : eur(x[1])) + "</span></div>"; }).join("") : '<div><span>Wähle Anreise und Abreise im Kalender.</span></div>';
    $("#total").textContent = p ? eur(p.tot) : "–";
  }
  function renderTabs() {
    $$("button", rtabs).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.r === st.room ? "true" : "false"); });
  }
  function renderAll() { renderTabs(); renderCal(); renderSum(); }

  // Schnellsuche im Kopfbereich
  var qIn = $("#qIn"), qOut = $("#qOut"), qG = $("#qG");
  function iso(d) { var z = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function parse(v) { var p = v.split("-"); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  (function () {
    // Vorschlag: der nächste Freitag in zwei Wochen, an dem ein Zimmer frei ist
    var d = addDays(today, 14); while (d.getDay() !== 5) d = addDays(d, 1);
    for (var t = 0; t < 12; t++) { var ok = ROOMS.some(function (r) { return rangeFree(r.id, d, addDays(d, 3)); }); if (ok) break; d = addDays(d, 7); }
    qIn.value = iso(d); qOut.value = iso(addDays(d, 3)); qIn.min = iso(today); qOut.min = iso(addDays(today, 1));
  })();
  qIn.addEventListener("change", function () { var a = parse(qIn.value), b = parse(qOut.value); if (a && (!b || b <= a)) qOut.value = iso(addDays(a, 2)); });
  $("#quick").addEventListener("submit", function (e) {
    e.preventDefault();
    var a = parse(qIn.value), b = parse(qOut.value), g = +qG.value;
    if (!a || !b || b <= a || a < today) { hint("Bitte gültige Anreise und Abreise wählen.", true); location.hash = "#buchen"; return; }
    var fits = ROOMS.filter(function (r) { return r.max >= g && rangeFree(r.id, a, b) && nightsBetween(a, b) >= r.min; });
    st.ad = g; st.ki = 0;
    st.view = new Date(a.getFullYear(), a.getMonth(), 1);
    if (fits.length) {
      st.room = fits[0].id; st.a = a; st.b = b;
      renderAll();
      hint("Frei für " + g + (g === 1 ? " Person: " : " Personen: ") + fits.map(function (r) { return r.name; }).join(", ") + ".");
    } else {
      st.room = (ROOMS.filter(function (r) { return r.max >= g; })[0] || ROOMS[3]).id; st.a = st.b = null;
      renderAll();
      hint("In diesem Zeitraum ist leider nichts Passendes frei. Grün sind die freien Tage, vielleicht passt ein anderes Wochenende?", true);
    }
    document.getElementById("buchen").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // Anfrage (Beispiel: nichts wird verschickt)
  var form = $("#form"), err = $("#fErr");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#fName").value.trim(), mail = $("#fMail").value.trim(), p = calcPrice();
    if (!p) { err.textContent = "Bitte zuerst Anreise und Abreise im Kalender wählen."; return; }
    if (!name) { err.textContent = "Bitte deinen Namen eintragen."; $("#fName").focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { err.textContent = "Bitte eine gültige E-Mail-Adresse eintragen."; $("#fMail").focus(); return; }
    if (!$("#fOk").checked) { err.textContent = "Bitte die Zustimmung zur Bearbeitung anhaken."; return; }
    err.textContent = "";
    var r = byId[st.room], nr = "ZH-" + (1000 + Math.floor(Math.random() * 9000));
    $("#dName").textContent = name.split(" ")[0];
    var rows = [["Anfrage", nr], ["Zimmer", r.name], ["Zeitraum", fmt(st.a) + " – " + fmt(st.b) + " (" + p.n + " Nächte)"], ["Gäste", st.ad + " Erw." + (st.ki ? ", " + st.ki + " Kind" + (st.ki > 1 ? "er" : "") : "")], ["Verpflegung", st.board === "hp" ? "Halbpension" : st.board === "fr" ? "Frühstück" : "Ohne"], ["Richtpreis", eur(p.tot)]];
    $("#dList").innerHTML = rows.map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + x[1].replace(/</g, "&lt;") + "</dd>"; }).join("");
    $("#sumForm").hidden = true; $("#formPanel").hidden = true; $("#done").hidden = false; $("#done").focus();
  });
  $("#again").addEventListener("click", function () { $("#done").hidden = true; $("#sumForm").hidden = false; $("#formPanel").hidden = false; form.reset(); st.a = st.b = null; hint("Tippe auf deinen Anreisetag."); renderAll(); });

  renderAll();

  // Ein Tag bei uns: Himmel, Sonne, Mond und Lichter folgen der Uhrzeit beim Scrollen
  var sec = $("#tag"), svg = $("#sky");
  if (sec && svg) {
    var forest = $("#forest");
    var tree = function (x, y, h) { var p = document.createElementNS(NS, "path"); p.setAttribute("d", "M" + x + " " + (y - h) + " L" + (x + h * .32) + " " + y + " L" + (x - h * .32) + " " + y + "Z"); forest.appendChild(p); };
    var s = 11, rnd = function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (var x = -10; x < 560; x += 17 + rnd() * 10) tree(x, 712 - (x / 560) * 18 + rnd() * 30, 46 + rnd() * 40);
    for (x = 1110; x < 1620; x += 17 + rnd() * 10) tree(x, 690 + rnd() * 40, 46 + rnd() * 44);
    var stars = $("#stars");
    for (var i = 0; i < 90; i++) { var c = document.createElementNS(NS, "circle"); c.setAttribute("cx", (rnd() * 1600).toFixed(0)); c.setAttribute("cy", (rnd() * 430).toFixed(0)); c.setAttribute("r", (0.8 + rnd() * 1.6).toFixed(1)); c.setAttribute("fill", "#fff"); c.style.opacity = (0.4 + rnd() * 0.6).toFixed(2); stars.appendChild(c); }

    var SKY = [ // Stunde, Himmel oben, Himmel unten, Berg, Hügel, Wiese
      [6.5, "#5d6f9c", "#f2c4a0", "#7d7f8f", "#4f6650", "#5e7a49"],
      [9, "#6fa8dc", "#d8ebf3", "#6f817b", "#557553", "#6f9150"],
      [13, "#4f97de", "#cfe6f6", "#6b7e78", "#5a7b55", "#76994f"],
      [16.5, "#6b93c9", "#f1d8ad", "#727b72", "#5a7650", "#759049"],
      [19, "#424e7e", "#ec9a6c", "#5b5a66", "#41553f", "#4f6a3b"],
      [20.5, "#1d2647", "#4b5379", "#3a3f52", "#2d3d31", "#34482b"],
      [22.5, "#0a1024", "#1a2342", "#2a3044", "#1f2b23", "#25331f"]
    ];
    var STEPS = [
      [6.5, "Frühstück", "Bauernbrot vom Bäcker im Ort, Honig vom Nachbarn und Eier von unseren Hühnern. Bis 10 Uhr, bei Sonne auf der Terrasse."],
      [9.5, "Losgehen", "Wanderkarte und Jausenpaket gibt es an der Rezeption. Der Weg zur Alm beginnt direkt hinter dem Haus."],
      [12, "Auf der Alm", "Mittagspause auf der Hütte, mit Blick auf den Ötscher. Wer mag, nimmt danach den Sessellift ins Tal."],
      [15.5, "Sauna", "Ab 16 Uhr ist die Sauna warm. Danach im Ruheraum liegen und zuschauen, wie das Licht über das Tal wandert."],
      [18.5, "Abendessen", "Vier Gänge in der Gaststube, alles aus der Gegend. Für Gäste mit Halbpension ist der Tisch schon gedeckt."],
      [21, "Sternenhimmel", "Kaum Licht im Tal, dafür Sterne. Nimm die Decke vom Zimmer mit, die Bank vor dem Haus ist frei."]
    ];
    function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function mix(a, b, t) { a = hex(a); b = hex(b); return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }
    function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
    var el = { s1: $("#s1"), s2: $("#s2"), far: $("#far"), oet: $("#oet"), hill: $("#hill"), mead: $("#mead"), sun: $("#sunG"), moon: $("#moonG"), moonCut: $("#moonCut"),
      stars: stars, night: $("#night"), win: $("#winLit"), glow: $("#glowHouse"), sauna: $("#saunaLit"), lantern: $("#lantern"), hikers: $("#hikers"), trail: $("#trail"), smoke: $("#smoke"), steam: $("#steam"),
      clock: $("#clock"), h: $("#tlH"), p: $("#tlP"), bars: $$("#tlBar b") };
    var trailLen = el.trail.getTotalLength(), sceneBox = $("#tag .day-s__in");
    var lastH = -1, lastStep = -1;
    function render(hour) {
      if (Math.abs(hour - lastH) < .01) return; lastH = hour;
      var i = 0; while (i < SKY.length - 2 && hour > SKY[i + 1][0]) i++;
      var A = SKY[i], B = SKY[i + 1], t = clamp((hour - A[0]) / (B[0] - A[0]), 0, 1);
      el.s1.setAttribute("stop-color", mix(A[1], B[1], t)); el.s2.setAttribute("stop-color", mix(A[2], B[2], t));
      el.oet.setAttribute("fill", mix(A[3], B[3], t)); el.far.setAttribute("fill", mix(A[3], B[3], t * .6 + .2)); el.far.style.opacity = .55;
      el.hill.setAttribute("fill", mix(A[4], B[4], t)); var md = mix(A[5], B[5], t); el.mead.setAttribute("fill", md); sceneBox.style.background = md;
      el.moonCut.setAttribute("fill", mix(A[1], B[1], t));
      // Sonne von 6:30 bis 19:30 im Bogen, Mond ab 20 Uhr
      var sp = (hour - 6.3) / 13.4, sx = 120 + sp * 1360, sy = 640 - Math.sin(clamp(sp, 0, 1) * Math.PI) * 410;
      el.sun.setAttribute("transform", "translate(" + sx.toFixed(1) + " " + sy.toFixed(1) + ")");
      el.sun.style.opacity = 1 - smooth(18.8, 19.8, hour);
      var mp = clamp((hour - 19.8) / 4, 0, 1);
      el.moon.setAttribute("transform", "translate(" + (1320 - mp * 260).toFixed(1) + " " + (520 - mp * 380).toFixed(1) + ")");
      el.moon.style.opacity = smooth(19.8, 20.8, hour);
      el.stars.style.opacity = smooth(19.8, 21.6, hour);
      el.night.setAttribute("opacity", (smooth(18.6, 22.2, hour) * .55).toFixed(3));
      var lit = Math.max(1 - smooth(7.2, 8.6, hour), smooth(18.2, 19.4, hour));
      el.win.setAttribute("opacity", lit.toFixed(2)); el.glow.setAttribute("opacity", (lit * .8).toFixed(2));
      var sau = smooth(15.3, 15.9, hour) * (1 - smooth(19.5, 20.3, hour));
      el.sauna.setAttribute("opacity", sau.toFixed(2)); el.steam.style.opacity = (sau * .55).toFixed(2);
      el.lantern.setAttribute("opacity", smooth(20.6, 21.3, hour).toFixed(2));
      el.smoke.style.opacity = (Math.max(1 - smooth(8, 10, hour), smooth(17.5, 19, hour)) * .45).toFixed(2);
      // Wanderer: hinauf bis Mittag, am Nachmittag zurück
      var up = clamp((hour - 9.6) / 2.6, 0, 1), down = clamp((hour - 14.2) / 1.3, 0, 1), pos = up - down;
      var pt = el.trail.getPointAtLength(trailLen * pos), sc = 1.15 - pos * .5;
      el.hikers.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ") scale(" + sc.toFixed(2) + ")");
      el.hikers.style.opacity = smooth(9.5, 9.8, hour) * (1 - smooth(15.4, 15.7, hour));
      // Uhr und Text
      var hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60 / 5) * 5;
      el.clock.textContent = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
      var si = 0; for (var k = 0; k < STEPS.length; k++) if (hour >= STEPS[k][0]) si = k;
      if (si !== lastStep) { lastStep = si; el.h.textContent = STEPS[si][1]; el.p.textContent = STEPS[si][2]; }
      var kn = 0;
      el.bars.forEach(function (b, k) {
        var a0 = STEPS[k][0], a1 = k < STEPS.length - 1 ? STEPS[k + 1][0] : 22.6, f = clamp((hour - a0) / (a1 - a0), 0, 1);
        b.style.transform = "scaleX(" + f.toFixed(3) + ")";
        kn += f;
      });
      // Regler auf der Leiste: gleiche Abschnitte pro Station, wie die Balken darunter
      tlBar.style.setProperty("--k", (kn / STEPS.length * 100).toFixed(2) + "%");
      tlBar.setAttribute("aria-valuenow", hh); tlBar.setAttribute("aria-valuetext", el.clock.textContent + ", " + STEPS[si][1]);
    }
    var tlBar = $("#tlBar");
    // Ziehen an der Leiste spult den Tag vor und zurück (Idee aus moxen.cl, eigener Code).
    // Die Seite scrollt dabei mit, damit Himmel, Text und Scrollposition zusammenpassen.
    function hourAt(f) {
      f = clamp(f, 0, .9999) * STEPS.length;
      var k = Math.floor(f), a0 = STEPS[k][0], a1 = k < STEPS.length - 1 ? STEPS[k + 1][0] : 22.6;
      return a0 + (f - k) * (a1 - a0);
    }
    function goHour(hour) {
      $("#tag .tl__card").classList.add("is-used");
      if (reduce) { lastH = -1; render(hour); return; }
      var r = sec.getBoundingClientRect(), total = r.height - innerHeight;
      if (total <= 0) { lastH = -1; render(hour); return; }
      var y = scrollY + r.top + (hour - 6.5) / 16.1 * total;
      scrollTo({ top: Math.round(y), behavior: "instant" });
    }
    var dragging = false;
    function dragAt(e) { var b = tlBar.getBoundingClientRect(); goHour(hourAt((e.clientX - b.left) / b.width)); }
    tlBar.addEventListener("pointerdown", function (e) { dragging = true; tlBar.classList.add("is-drag"); tlBar.setPointerCapture(e.pointerId); dragAt(e); });
    tlBar.addEventListener("pointermove", function (e) { if (dragging) dragAt(e); });
    var stop = function () { dragging = false; tlBar.classList.remove("is-drag"); };
    tlBar.addEventListener("pointerup", stop); tlBar.addEventListener("pointercancel", stop);
    tlBar.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" || e.key === "ArrowUp" ? .5 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -.5 : 0;
      if (!d) return; e.preventDefault(); goHour(clamp((lastH < 0 ? 6.5 : lastH) + d, 6.5, 22.6));
    });
    if (reduce) render(19.2);
    else {
      var tick = false;
      var upd = function () {
        tick = false;
        var r = sec.getBoundingClientRect(), total = r.height - innerHeight;
        var p = clamp(-r.top / (total > 0 ? total : 1), 0, 1);
        render(6.5 + p * 16.1);
      };
      addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
      addEventListener("resize", upd);
      upd();
    }
  }

  // Sommer / Winter
  var TRIPS = {
    sommer: [
      ["Ötschergräben", "Schluchtwanderung mit Wasserfällen und Hängebrücken", "ca. 25 min", "M12 3c3.2 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.8-6.4 6-11Z"],
      ["Ötscher, 1.893 m", "Mit dem Sessellift hinauf, zu Fuß über den Rauhen Kamm", "ca. 15 min", "M2 18 9 6l4 6 2.5-3L22 18Z"],
      ["Erlaufsee", "Baden, Tretboot fahren, Radweg rund um den See", "ca. 30 min", "M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"],
      ["Ybbstalradweg", "Auf der alten Bahntrasse durchs Tal, E-Bikes leihen wir dir", "ca. 20 min", "M2 15a4 4 0 1 0 8 0a4 4 0 1 0-8 0M14 15a4 4 0 1 0 8 0a4 4 0 1 0-8 0M6 15l4-8h5l3 8M10 7 9 5H7m8 2 1.5-2H18"],
      ["Mariazellerbahn", "Mit der Himmelstreppe über Viadukte bis Mariazell", "ca. 35 min", "M6 3h12v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3zM6 10h12M8 21l2-3m6 3-2-3"]
    ],
    winter: [
      ["Skigebiet am Ötscher", "Familienskigebiet, der Skibus hält vor dem Haus", "ca. 10 min", "M2 18 9 6l4 6 2.5-3L22 18Z"],
      ["Langlaufloipe", "Klassisch und Skating, Einstieg hinter dem Haus", "ab Haus", "M3 15.5 19 19.5q2 .5 2-1.5M3 11.5l16 4q2 .5 2-1.5M8 3l2 14M15 3l-2 14"],
      ["Rodeln", "Zwei Rodeln pro Zimmer gratis, Bahn mit Flutlicht", "ab Haus", "M2 16h16.5a2.5 2.5 0 0 0 2.5-2.5M6 16v-6M16 16v-6M4 10h14"],
      ["Schneeschuhwandern", "Geführte Tour jeden Mittwoch, Schneeschuhe inklusive", "ab Haus", "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"],
      ["Advent in Mariazell", "Adventmarkt vor der Basilika, im Dezember jeden Freitag", "ca. 35 min", "M12 2.50 L14.35 8.76 L21.04 9.06 L15.80 13.24 L17.58 19.69 L12 16 L6.42 19.69 L8.20 13.24 L2.96 9.06 L9.65 8.76Z"]
    ]
  };
  var tripsEl = $("#trips");
  function season(sn) {
    tripsEl.innerHTML = TRIPS[sn].map(function (t) {
      return '<li><span class="n"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + t[3] + '"/></svg></span><span><b>' + t[0] + "</b><small>" + t[1] + "</small></span><em>" + t[2] + "</em></li>";
    }).join("");
    // Jedes Symbol genau in die Mitte seines Kreises setzen
    $$("svg", tripsEl).forEach(function (sv) {
      var bb = sv.firstChild.getBBox(); if (!bb.width) return;
      sv.setAttribute("viewBox", (bb.x + bb.width / 2 - 12).toFixed(2) + " " + (bb.y + bb.height / 2 - 12).toFixed(2) + " 24 24");
    });
    tripsEl.classList.remove("swap"); void tripsEl.offsetWidth; tripsEl.classList.add("swap");
    $$("[data-season]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.season === sn ? "true" : "false"); });
    $("#imgS").classList.toggle("off", sn !== "sommer"); $("#imgW").classList.toggle("off", sn === "sommer");
    $("#seasonWord").textContent = sn === "sommer" ? "im Sommer." : "im Winter.";
  }
  $$("[data-season]").forEach(function (b) { b.addEventListener("click", function () { season(b.dataset.season); }); });
  var mo = today.getMonth();
  season(mo >= 10 || mo <= 2 ? "winter" : "sommer");
})();
