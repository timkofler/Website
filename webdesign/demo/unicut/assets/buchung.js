// Online-Terminbuchung für den Uni:cut-Entwurf (nach der Buchung vom Friseur-Beispiel; Demo, es wird nichts verschickt).
// Namen und freie Zeiten sind Beispiele. Preise stehen bewusst nicht drin (die kennt nur der Salon).
// Ablauf: Leistung → Friseurin → Tag und Uhrzeit → Daten → Bestätigung mit Kalendereintrag.
// Freie Zeiten sind erfunden, aber fest: Dieselbe Seite zeigt am selben Tag immer dieselben Lücken.
// Jedes Element mit data-book öffnet das Fenster, data-svc und data-who wählen gleich vor.

export const TEAM = [
  { id: "anna", name: "Anna", short: "Anna", role: "Schnitt & Styling", c: "#e8ddcf" },
  { id: "julia", name: "Julia", short: "Julia", role: "Farbe & Balayage", c: "#d6c3a8" },
  { id: "sarah", name: "Sarah", short: "Sarah", role: "Wimpernstyling", c: "#c9b49a" },
  { id: "lisa", name: "Lisa", short: "Lisa", role: "Nageldesign", c: "#b89b74" }
];
var ALL = ["anna", "julia", "sarah", "lisa"], HAAR = ["anna", "julia"];
export const SERVICES = [
  { id: "d-schnitt", g: "Haare", name: "Waschen, Schneiden, Föhnen", min: 60, who: HAAR },
  { id: "d-foehn", g: "Haare", name: "Föhnen & Styling", min: 45, who: HAAR },
  { id: "d-hoch", g: "Haare", name: "Hochsteckfrisur", min: 60, who: HAAR },
  { id: "h-schnitt", g: "Haare", name: "Herrenschnitt", min: 30, who: HAAR },
  { id: "k-schnitt", g: "Haare", name: "Kinderhaarschnitt", min: 30, who: HAAR },
  { id: "f-farbe", g: "Farbe", name: "Farbe inkl. Föhnen", min: 90, who: HAAR },
  { id: "f-balayage", g: "Farbe", name: "Balayage inkl. Schnitt", min: 180, who: ["julia"] },
  { id: "f-gloss", g: "Farbe", name: "Glossing für mehr Glanz", min: 30, who: HAAR },
  { id: "w-neu", g: "Wimpern", name: "Wimpernverlängerung Neuset", min: 120, who: ["sarah"] },
  { id: "w-auff", g: "Wimpern", name: "Wimpern auffüllen", min: 60, who: ["sarah"] },
  { id: "w-lift", g: "Wimpern", name: "Wimpernlifting", min: 45, who: ["sarah"] },
  { id: "n-neu", g: "Nägel", name: "Gelnägel Neuset", min: 90, who: ["lisa"] },
  { id: "n-auff", g: "Nägel", name: "Gelnägel auffüllen", min: 75, who: ["lisa"] },
  { id: "n-mani", g: "Nägel", name: "Maniküre", min: 45, who: ["lisa"] }
];
// Öffnungszeiten je Wochentag (0 = Sonntag) in Minuten ab Mitternacht: Mo–Fr 8–18, Sa 8–12.
export const HOURS = [null, [480, 1080], [480, 1080], [480, 1080], [480, 1080], [480, 1080], [480, 720]];
var DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], DAYL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var MON = ["Jän.", "Feb.", "März", "April", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
var STEP = 30;

export function euro(v, from) { return (from ? "ab " : "") + "€ " + String(v).replace(".", ","); }
export function hm(m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }
function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function dayNo(d) { return Math.round(dayStart(d).getTime() / 864e5); }
function svcById(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }
function teamById(id) { for (var i = 0; i < TEAM.length; i++) if (TEAM[i].id === id) return TEAM[i]; return null; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

// Belegt oder frei: fester Pseudozufall aus Tag, Person und Uhrzeit. Vormittage sind etwas voller.
function busy(day, who, m) {
  var k = ALL.indexOf(who) + 1, x = Math.sin(day * 12.9898 + k * 78.233 + m * .37719) * 43758.5453;
  return x - Math.floor(x) < (m < 720 ? .34 : .26);
}
// Freie Startzeiten für eine Leistung an einem Tag, je Startzeit die freien Personen.
export function slots(date, svcId, whoId, now) {
  var h = HOURS[date.getDay()], s = svcById(svcId); if (!h || !s) return [];
  var day = dayNo(date), need = Math.ceil(s.min / STEP), out = [];
  var people = whoId && whoId !== "egal" ? [whoId] : s.who;
  now = now || new Date();
  var earliest = dayNo(now) === day ? now.getHours() * 60 + now.getMinutes() + 45 : -1;
  if (day < dayNo(now)) return [];
  for (var m = h[0]; m + s.min <= h[1]; m += STEP) {
    if (m < earliest) continue;
    var free = people.filter(function (p) {
      if (s.who.indexOf(p) < 0) return false;
      for (var k = 0; k < need; k++) if (busy(day, p, m + k * STEP)) return false;
      return true;
    });
    if (free.length) out.push({ m: m, who: free });
  }
  return out;
}
// Nächster freier Termin einer Person (für die Team-Karten): "heute 15:30", "morgen 9:00", "Do 10:30".
export function nextFree(whoId, svcId, now) {
  now = now || new Date();
  var svc = svcId || (whoId === "sarah" ? "w-auff" : whoId === "lisa" ? "n-auff" : "d-schnitt");
  for (var i = 0; i < 21; i++) {
    var d = addDays(dayStart(now), i), s = slots(d, svc, whoId, now);
    if (s.length) return (i === 0 ? "heute" : i === 1 ? "morgen" : DAYS[d.getDay()] + " " + d.getDate() + ". " + MON[d.getMonth()]) + " um " + hm(s[0].m);
  }
  return "in drei Wochen";
}
// Öffnungsstatus für Kopf und Kontakt: offen bis, schließt bald, oder wann es wieder aufsperrt.
export function status(now) {
  now = now || new Date();
  var m = now.getHours() * 60 + now.getMinutes(), h = HOURS[now.getDay()];
  if (h && m >= h[0] && m < h[1]) return { open: true, soon: h[1] - m <= 45, text: (h[1] - m <= 45 ? "Schließt bald · " : "Jetzt geöffnet · ") + "bis " + hm(h[1]) + " Uhr" };
  for (var i = 0; i < 8; i++) {
    var d = addDays(dayStart(now), i), hh = HOURS[d.getDay()];
    if (!hh || (i === 0 && m >= hh[0])) continue;
    return { open: false, text: "Geschlossen · " + (i === 0 ? "heute" : i === 1 ? "morgen" : DAYL[d.getDay()]) + " ab " + hm(hh[0]) + " Uhr" };
  }
  return { open: false, text: "Geschlossen" };
}

// ---------- Fenster ----------
var st = { step: 0, svc: null, who: "egal", day: null, m: null, pick: null }, dlg, els = {};
var TITLES = ["Was dürfen wir machen?", "Bei wem?", "Wann passt es dir?", "Fast fertig", "Termin eingetragen"];

function build() {
  if (dlg) return;
  dlg = document.createElement("dialog");
  dlg.className = "bk"; dlg.setAttribute("aria-labelledby", "bkH");
  dlg.innerHTML =
    '<form class="bk__in" method="dialog" novalidate>' +
      '<header class="bk__head"><div><p class="bk__kick">Termin buchen</p><h2 id="bkH">' + TITLES[0] + '</h2></div>' +
        '<button class="bk__x" type="button" data-bk-close aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<ol class="bk__steps" aria-hidden="true"><li></li><li></li><li></li><li></li></ol></header>' +
      '<div class="bk__body">' +
        '<section class="bk__pane" data-pane="0"></section>' +
        '<section class="bk__pane" data-pane="1" hidden></section>' +
        '<section class="bk__pane" data-pane="2" hidden><div class="bk__days" role="listbox" aria-label="Tag wählen"></div><div class="bk__slots" aria-live="polite"></div></section>' +
        '<section class="bk__pane" data-pane="3" hidden>' +
          '<label class="bk__f"><span>Vor- und Nachname</span><input name="name" autocomplete="name" placeholder="z. B. Anna Huber" required></label>' +
          '<label class="bk__f"><span>Telefon für Rückfragen</span><input name="tel" type="tel" autocomplete="tel" placeholder="0664 123 45 67" required></label>' +
          '<label class="bk__f"><span>E-Mail für die Bestätigung</span><input name="mail" type="email" autocomplete="email" placeholder="anna@example.at" required></label>' +
          '<label class="bk__f"><span>Wünsche oder Fragen <i>(freiwillig)</i></span><textarea name="note" rows="2" placeholder="z. B. Foto vom Wunschlook mitbringen"></textarea></label>' +
          '<label class="bk__chk"><input type="checkbox" name="sms" checked><span>Am Vortag per SMS erinnern</span></label>' +
        '</section>' +
        '<section class="bk__pane bk__done" data-pane="4" hidden>' +
          '<svg class="bk__ok" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36"/><path d="M24 41l11 11 21-24"/></svg>' +
          '<h3 class="bk__doneH"></h3><p class="bk__doneT"></p>' +
          '<div class="bk__doneBtns"><button class="bk__btn" type="button" data-bk-ics>In den Kalender</button><button class="bk__btn bk__btn--line" type="button" data-bk-close>Schließen</button></div>' +
        '</section>' +
      '</div>' +
      '<aside class="bk__sum" aria-label="Deine Auswahl"><dl>' +
        '<div><dt>Leistung</dt><dd data-sum="svc">noch offen</dd></div>' +
        '<div><dt>Bei</dt><dd data-sum="who">wer frei ist</dd></div>' +
        '<div><dt>Wann</dt><dd data-sum="when">noch offen</dd></div>' +
        '</dl></aside>' +
      '<footer class="bk__foot"><button class="bk__back" type="button" data-bk-back>Zurück</button>' +
        '<p class="bk__msg" aria-live="polite"></p>' +
        '<button class="bk__btn bk__next" type="button" data-bk-next>Weiter</button>' +
        '<p class="bk__demo">Entwurf: Es wird nichts verschickt oder gespeichert.</p></footer>' +
    '</form>';
  document.body.appendChild(dlg);
  els.h = dlg.querySelector("#bkH");
  els.panes = dlg.querySelectorAll(".bk__pane");
  els.steps = dlg.querySelectorAll(".bk__steps li");
  els.next = dlg.querySelector("[data-bk-next]"); els.back = dlg.querySelector("[data-bk-back]");
  els.msg = dlg.querySelector(".bk__msg"); els.days = dlg.querySelector(".bk__days"); els.slots = dlg.querySelector(".bk__slots");
  els.form = dlg.querySelector("form");
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) { close(); return; }
    var t = e.target.closest("button"); if (!t) return;
    if (t.hasAttribute("data-bk-close")) close();
    else if (t.hasAttribute("data-bk-next")) next();
    else if (t.hasAttribute("data-bk-back")) go(st.step - 1);
    else if (t.hasAttribute("data-bk-ics")) ics();
    else if (t.dataset.day) { st.day = +t.dataset.day; st.m = null; renderDays(); renderSlots(); sum(); }
    else if (t.dataset.m) { st.m = +t.dataset.m; st.pick = t.dataset.who; renderSlots(); sum(); }
    else if (t.dataset.jump) { st.day = +t.dataset.jump; st.m = null; renderDays(); renderSlots(); sum(); scrollDay(); }
  });
  dlg.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "svc") { st.svc = t.value; if (st.who !== "egal" && svcById(st.svc).who.indexOf(st.who) < 0) st.who = "egal"; st.m = null; sum(); }
    if (t.name === "who") { st.who = t.value; st.m = null; sum(); }
  });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  els.form.addEventListener("submit", function (e) { e.preventDefault(); next(); });
}

function renderSvc() {
  var g = "", html = "";
  SERVICES.forEach(function (s) {
    if (s.g !== g) { if (g) html += "</div>"; g = s.g; html += '<p class="bk__g">' + g + '</p><div class="bk__list" role="radiogroup" aria-label="' + g + '">'; }
    html += '<label class="bk__opt"><input type="radio" name="svc" value="' + s.id + '"' + (st.svc === s.id ? " checked" : "") + '><span class="bk__optN">' + esc(s.name) + '</span><span class="bk__optM">' + s.min + ' Min.</span></label>';
  });
  els.panes[0].innerHTML = html + "</div>";
}
function renderWho() {
  var s = svcById(st.svc), now = new Date(), html = '<div class="bk__list bk__list--who" role="radiogroup" aria-label="Wer soll es machen?">';
  html += '<label class="bk__opt bk__opt--who"><input type="radio" name="who" value="egal"' + (st.who === "egal" ? " checked" : "") + '><span class="bk__av bk__av--any" aria-hidden="true">✦</span><span class="bk__optN">Egal, wer frei ist<small>Die meisten freien Zeiten</small></span></label>';
  TEAM.forEach(function (p) {
    if (s.who.indexOf(p.id) < 0) return;
    html += '<label class="bk__opt bk__opt--who"><input type="radio" name="who" value="' + p.id + '"' + (st.who === p.id ? " checked" : "") + '><span class="bk__av" style="--c:' + p.c + '" aria-hidden="true">' + p.short[0] + '</span><span class="bk__optN">' + p.name + '<small>' + p.role + ' · frei ' + nextFree(p.id, st.svc, now) + '</small></span></label>';
  });
  els.panes[1].innerHTML = html + '</div><p class="bk__hint">Die Namen im Entwurf sind Beispiele. Auf der fertigen Seite steht euer echtes Team.</p>';
}
function renderDays() {
  var now = new Date(), html = "";
  for (var i = 0; i < 21; i++) {
    var d = addDays(dayStart(now), i), n = dayNo(d), h = HOURS[d.getDay()], free = h ? slots(d, st.svc, st.who, now).length : 0;
    html += '<button type="button" role="option" class="bk__day' + (st.day === n ? " is-on" : "") + '" data-day="' + n + '"' + (free ? "" : " disabled") + ' aria-selected="' + (st.day === n) + '">' +
      '<small>' + (i === 0 ? "Heute" : i === 1 ? "Morgen" : DAYS[d.getDay()]) + '</small><b>' + d.getDate() + '</b><small>' + (h ? (free ? MON[d.getMonth()] : "voll") : "zu") + '</small></button>';
  }
  els.days.innerHTML = html;
}
function scrollDay() { var on = els.days.querySelector(".is-on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
function firstFreeDay() {
  var now = new Date();
  for (var i = 0; i < 21; i++) { var d = addDays(dayStart(now), i); if (slots(d, st.svc, st.who, now).length) return dayNo(d); }
  return null;
}
function renderSlots() {
  if (st.day == null) { els.slots.innerHTML = ""; return; }
  var d = new Date(st.day * 864e5), now = new Date();
  d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  var list = slots(d, st.svc, st.who, now), parts = [["Vormittag", 0, 720], ["Nachmittag", 720, 1020], ["Abend", 1020, 1440]], html = "";
  if (!list.length) { var f = firstFreeDay(); els.slots.innerHTML = '<p class="bk__none">An diesem Tag ist nichts mehr frei.' + (f ? ' <button type="button" class="bk__link" data-jump="' + f + '">Nächsten freien Tag zeigen</button>' : "") + '</p>'; return; }
  parts.forEach(function (p) {
    var row = list.filter(function (x) { return x.m >= p[1] && x.m < p[2]; }); if (!row.length) return;
    html += '<p class="bk__g">' + p[0] + '</p><div class="bk__grid">';
    row.forEach(function (x) { html += '<button type="button" class="bk__slot' + (st.m === x.m ? " is-on" : "") + '" data-m="' + x.m + '" data-who="' + x.who[0] + '" aria-pressed="' + (st.m === x.m) + '">' + hm(x.m) + '</button>'; });
    html += "</div>";
  });
  els.slots.innerHTML = html;
}
function whenText() {
  if (st.day == null || st.m == null) return null;
  var d = new Date(st.day * 864e5); d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return DAYL[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()] + " · " + hm(st.m) + " Uhr";
}
function sum() {
  var s = svcById(st.svc), who = st.who === "egal" ? (st.m != null ? teamById(st.pick) : null) : teamById(st.who);
  dlg.querySelector('[data-sum="svc"]').textContent = s ? s.name + " · " + s.min + " Min." : "noch offen";
  dlg.querySelector('[data-sum="who"]').textContent = who ? who.name : "wer frei ist";
  dlg.querySelector('[data-sum="when"]').textContent = whenText() || "noch offen";
}
function go(n) {
  n = Math.max(0, Math.min(4, n)); st.step = n; els.msg.textContent = "";
  if (n === 0) renderSvc();
  if (n === 1) renderWho();
  if (n === 2) { if (st.day == null || !slots(dayDate(st.day), st.svc, st.who).length) st.day = firstFreeDay(); renderDays(); renderSlots(); setTimeout(scrollDay, 60); }
  els.panes.forEach(function (p, i) { p.hidden = i !== n; });
  els.steps.forEach(function (l, i) { l.className = i < n ? "is-done" : i === n ? "is-on" : ""; });
  els.h.textContent = TITLES[n];
  dlg.classList.toggle("is-done", n === 4);
  els.back.style.visibility = n > 0 && n < 4 ? "visible" : "hidden";
  els.next.textContent = n === 3 ? "Verbindlich buchen" : "Weiter";
  dlg.querySelector(".bk__body").scrollTop = 0;
  sum();
}
function dayDate(n) { var d = new Date(n * 864e5); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
function next() {
  if (st.step === 0 && !st.svc) { els.msg.textContent = "Bitte wähle zuerst eine Leistung."; return; }
  if (st.step === 2 && st.m == null) { els.msg.textContent = "Bitte wähle eine Uhrzeit."; return; }
  if (st.step === 3) {
    var f = els.form, bad = ["name", "tel", "mail"].filter(function (k) { return !f.elements[k].checkValidity() || !f.elements[k].value.trim(); });
    if (bad.length) { els.msg.textContent = "Bitte fülle Name, Telefon und E-Mail aus."; f.elements[bad[0]].focus(); return; }
    var name = f.elements.name.value.trim().split(" ")[0], who = teamById(st.who === "egal" ? st.pick : st.who);
    dlg.querySelector(".bk__doneH").textContent = "Danke, " + name + "!";
    dlg.querySelector(".bk__doneT").textContent = "Dein Termin am " + whenText() + " bei " + who.short + " ist eingetragen. Die Bestätigung geht an " + f.elements.mail.value.trim() + ".";
  }
  go(st.step + 1);
}
function ics() {
  var s = svcById(st.svc), d = dayDate(st.day), who = teamById(st.who === "egal" ? st.pick : st.who);
  function stamp(m) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m); return x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00"; }
  var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//tim-kofler.at//Uni:cut Entwurf//DE", "BEGIN:VEVENT", "UID:" + Date.now() + "@unicut-entwurf", "DTSTAMP:" + stamp(0),
    "DTSTART:" + stamp(st.m), "DTEND:" + stamp(st.m + s.min), "SUMMARY:Uni:cut: " + s.name + " bei " + who.short, "LOCATION:Haarstudio Uni:cut\\, Hauptplatz 14\\, 3244 Ruprechtshofen", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = "unicut-termin.ics";
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
var lastFocus = null;
export function openBooking(o) {
  build(); o = o || {};
  if (st.step === 4) { st = { step: 0, svc: null, who: "egal", day: null, m: null, pick: null }; els.form.reset(); }
  if (o.svc && svcById(o.svc)) st.svc = o.svc;
  if (o.who && teamById(o.who)) { st.who = o.who; if (st.svc && svcById(st.svc).who.indexOf(o.who) < 0) st.svc = null; }
  lastFocus = document.activeElement;
  go(o.svc && svcById(o.svc) ? (o.who ? 2 : 1) : 0);
  dlg.showModal(); document.documentElement.classList.add("bk-open");
  dispatchEvent(new CustomEvent("bk-open"));
}
function close() {
  dlg.classList.add("is-closing");
  setTimeout(function () { dlg.classList.remove("is-closing"); dlg.close(); document.documentElement.classList.remove("bk-open"); dispatchEvent(new CustomEvent("bk-close")); if (lastFocus && lastFocus.focus) lastFocus.focus(); }, 180);
}
export function isOpen() { return !!(dlg && dlg.open); }

document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest("[data-book]"); if (!b) return;
  e.preventDefault(); openBooking({ svc: b.dataset.svc, who: b.dataset.who });
});
// Live-Angaben auf der Seite: data-status (Öffnungsstatus) und data-next="anna" (nächster freier Termin).
export function fillLive(root) {
  root = root || document;
  var s = status();
  root.querySelectorAll("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); el.classList.toggle("is-soon", !!s.soon); });
  root.querySelectorAll("[data-next]").forEach(function (el) { el.textContent = "Frei " + nextFree(el.dataset.next); });
  var d = new Date().getDay();
  root.querySelectorAll("[data-dow]").forEach(function (el) { el.classList.toggle("is-today", +el.dataset.dow === d); });
}
