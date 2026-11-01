// Online-Terminbuchung für den Haarliebe-Entwurf (Demo, es wird nichts verschickt oder gespeichert).
// Ein-Frau-Salon: Leistung → Tag und Uhrzeit → Daten (mit Warteliste) → Bestätigung mit Kalendereintrag.
// Freie Zeiten und Öffnungszeiten sind Beispiele, aber fest: Am selben Tag zeigt die Seite immer dieselben Lücken.
// Die nächsten Tage sind absichtlich fast voll, weil Sabrina meistens ausgebucht ist.
// Jedes Element mit data-book öffnet das Fenster, data-svc wählt die Leistung gleich vor.

export const SERVICES = [
  { id: "blond", g: "Blond & Farbe", name: "Blond-Refresh (Ansatz & Toner)", min: 120 },
  { id: "balayage", g: "Blond & Farbe", name: "Balayage inkl. Schnitt & Styling", min: 210 },
  { id: "farbe", g: "Blond & Farbe", name: "Farbe inkl. Föhnen", min: 90 },
  { id: "gloss", g: "Blond & Farbe", name: "Glossing für mehr Glanz", min: 45 },
  { id: "schnitt", g: "Schnitt & Styling", name: "Waschen, Schneiden, Föhnen", min: 60 },
  { id: "blowout", g: "Schnitt & Styling", name: "Blowout (Föhnwelle)", min: 45 },
  { id: "herren", g: "Schnitt & Styling", name: "Herrenschnitt", min: 30 },
  { id: "pflege", g: "Pflege & Anlass", name: "Haarpflege-Treatment", min: 30 },
  { id: "hoch", g: "Pflege & Anlass", name: "Hochsteckfrisur", min: 60 },
  { id: "beratung", g: "Pflege & Anlass", name: "Beratung für Neukundinnen", min: 15 }
];
// Beispiel-Öffnungszeiten je Wochentag (0 = Sonntag) in Minuten ab Mitternacht: Di–Fr 8–18, Sa 8–13.
export const HOURS = [null, null, [480, 1080], [480, 1080], [480, 1080], [480, 1080], [480, 780]];
var DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], DAYL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var MON = ["Jän.", "Feb.", "März", "April", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
var STEP = 30, RANGE = 35;

export function hm(m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }
function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function dayNo(d) { return Math.round((dayStart(d).getTime() - dayStart(d).getTimezoneOffset() * 6e4) / 864e5); }
function dayDate(n) { var d = new Date(n * 864e5); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
function svcById(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }

// Belegt oder frei: fester Pseudozufall aus Tag und Uhrzeit. Je näher der Tag, desto voller.
function busy(day, ahead, m) {
  var x = Math.sin(day * 12.9898 + m * .37719) * 43758.5453, r = x - Math.floor(x);
  var full = ahead < 9 ? .93 : ahead < 16 ? .62 : .4;
  return r < full;
}
export function slots(date, svcId, now) {
  var h = HOURS[date.getDay()], s = svcById(svcId); if (!h || !s) return [];
  now = now || new Date();
  var day = dayNo(date), ahead = day - dayNo(now), need = Math.ceil(s.min / STEP), out = [];
  if (ahead < 0) return [];
  var earliest = ahead === 0 ? now.getHours() * 60 + now.getMinutes() + 60 : -1;
  for (var m = h[0]; m + s.min <= h[1]; m += STEP) {
    if (m < earliest) continue;
    var ok = true;
    for (var k = 0; k < need; k++) if (busy(day, ahead, m + k * STEP)) { ok = false; break; }
    if (ok) out.push(m);
  }
  return out;
}
function whenShort(d, m, now) {
  var i = dayNo(d) - dayNo(now);
  return (i === 0 ? "heute" : i === 1 ? "morgen" : DAYS[d.getDay()] + " " + d.getDate() + ". " + MON[d.getMonth()]) + " um " + hm(m);
}
export function nextFree(svcId, now) {
  now = now || new Date();
  for (var i = 0; i < RANGE; i++) {
    var d = addDays(dayStart(now), i), s = slots(d, svcId, now);
    if (s.length) return { text: whenShort(d, s[0], now), days: i };
  }
  return { text: "in ein paar Wochen", days: RANGE };
}

// ---------- Fenster ----------
var st = { step: 0, svc: null, day: null, m: null }, dlg, els = {};
var TITLES = ["Was darf ich für dich tun?", "Wann passt es dir?", "Fast geschafft", "Termin eingetragen"];

function build() {
  if (dlg) return;
  dlg = document.createElement("dialog");
  dlg.className = "bk"; dlg.setAttribute("aria-labelledby", "bkH");
  dlg.innerHTML =
    '<form class="bk__in" method="dialog" novalidate>' +
      '<header class="bk__head"><div><p class="bk__kick">Termin bei Sabrina</p><h2 id="bkH">' + TITLES[0] + '</h2></div>' +
        '<button class="bk__x" type="button" data-bk-close aria-label="Schließen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<ol class="bk__steps" aria-hidden="true"><li></li><li></li><li></li></ol></header>' +
      '<div class="bk__body">' +
        '<section class="bk__pane" data-pane="0"></section>' +
        '<section class="bk__pane" data-pane="1" hidden><div class="bk__days" role="listbox" aria-label="Tag wählen"></div><div class="bk__slots" aria-live="polite"></div></section>' +
        '<section class="bk__pane" data-pane="2" hidden>' +
          '<label class="bk__f"><span>Vor- und Nachname</span><input name="name" autocomplete="name" placeholder="z. B. Anna Huber" required></label>' +
          '<label class="bk__f"><span>Telefon für Rückfragen</span><input name="tel" type="tel" autocomplete="tel" placeholder="0664 123 45 67" required></label>' +
          '<label class="bk__f"><span>E-Mail für die Bestätigung</span><input name="mail" type="email" autocomplete="email" placeholder="anna@example.at" required></label>' +
          '<label class="bk__f"><span>Wunschlook oder Fragen <i>(freiwillig)</i></span><textarea name="note" rows="2" placeholder="z. B. kühles Blond, Foto bringe ich mit"></textarea></label>' +
          '<label class="bk__wait"><input type="checkbox" name="wait" checked><span><b>Auf die Warteliste</b><small>Wird vorher ein Termin frei, bekommst du eine Nachricht und kannst ihn mit einem Tipp übernehmen.</small></span></label>' +
        '</section>' +
        '<section class="bk__pane bk__done" data-pane="3" hidden>' +
          '<svg class="bk__ok" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36"/><path d="M24 41l11 11 21-24"/></svg>' +
          '<h3 class="bk__doneH"></h3><p class="bk__doneT"></p>' +
          '<div class="bk__doneBtns"><button class="bk__btn" type="button" data-bk-ics>In den Kalender</button><button class="bk__btn bk__btn--line" type="button" data-bk-close>Schließen</button></div>' +
        '</section>' +
      '</div>' +
      '<aside class="bk__sum" aria-label="Deine Auswahl"><dl>' +
        '<div><dt>Leistung</dt><dd data-sum="svc">noch offen</dd></div>' +
        '<div><dt>Wann</dt><dd data-sum="when">noch offen</dd></div>' +
        '<div><dt>Wo</dt><dd>Behamberg</dd></div>' +
        '</dl></aside>' +
      '<footer class="bk__foot"><button class="bk__back" type="button" data-bk-back>Zurück</button>' +
        '<p class="bk__msg" aria-live="polite"></p>' +
        '<button class="bk__btn bk__next" type="button" data-bk-next>Weiter</button>' +
        '<p class="bk__demo">Entwurf: Es wird nichts verschickt oder gespeichert. Zeiten sind Beispiele.</p></footer>' +
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
    else if (t.dataset.m) { st.m = +t.dataset.m; renderSlots(); sum(); }
  });
  dlg.addEventListener("change", function (e) {
    if (e.target.name === "svc") { st.svc = e.target.value; st.m = null; sum(); }
  });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  els.form.addEventListener("submit", function (e) { e.preventDefault(); next(); });
}

function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function renderSvc() {
  var g = "", html = "";
  SERVICES.forEach(function (s) {
    if (s.g !== g) { if (g) html += "</div>"; g = s.g; html += '<p class="bk__g">' + esc(g) + '</p><div class="bk__list" role="radiogroup" aria-label="' + esc(g) + '">'; }
    html += '<label class="bk__opt"><input type="radio" name="svc" value="' + s.id + '"' + (st.svc === s.id ? " checked" : "") + '><span class="bk__optN">' + esc(s.name) + '</span><span class="bk__optM">' + (s.min >= 120 ? (s.min / 60).toString().replace(".", ",") + " Std." : s.min + " Min.") + '</span></label>';
  });
  els.panes[0].innerHTML = html + "</div>";
}
function renderDays() {
  var now = new Date(), html = "";
  for (var i = 0; i < RANGE; i++) {
    var d = addDays(dayStart(now), i), n = dayNo(d), h = HOURS[d.getDay()];
    if (!h) continue;
    var free = slots(d, st.svc, now).length;
    html += '<button type="button" role="option" class="bk__day' + (st.day === n ? " is-on" : "") + '" data-day="' + n + '"' + (free ? "" : " disabled") + ' aria-selected="' + (st.day === n) + '">' +
      '<small>' + (i === 0 ? "Heute" : i === 1 ? "Morgen" : DAYS[d.getDay()]) + '</small><b>' + d.getDate() + '</b><small' + (free ? "" : ' class="is-full"') + '>' + (free ? MON[d.getMonth()] : "voll") + '</small></button>';
  }
  els.days.innerHTML = html;
}
function scrollDay() { var on = els.days.querySelector(".is-on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
function firstFreeDay() {
  var now = new Date();
  for (var i = 0; i < RANGE; i++) { var d = addDays(dayStart(now), i); if (slots(d, st.svc, now).length) return dayNo(d); }
  return null;
}
function renderSlots() {
  if (st.day == null) { els.slots.innerHTML = '<p class="bk__none">In den nächsten Wochen ist leider alles voll. Trag dich gerne auf die Warteliste ein.</p>'; return; }
  var list = slots(dayDate(st.day), st.svc, new Date()), parts = [["Vormittag", 0, 720], ["Nachmittag", 720, 1440]], html = "";
  parts.forEach(function (p) {
    var row = list.filter(function (m) { return m >= p[1] && m < p[2]; }); if (!row.length) return;
    html += '<p class="bk__g">' + p[0] + '</p><div class="bk__grid">';
    row.forEach(function (m) { html += '<button type="button" class="bk__slot' + (st.m === m ? " is-on" : "") + '" data-m="' + m + '" aria-pressed="' + (st.m === m) + '">' + hm(m) + '</button>'; });
    html += "</div>";
  });
  var skip = st.day - dayNo(new Date());
  if (skip > 3) html += '<p class="bk__hint">Die Tage davor sind schon ausgebucht. Mit der Warteliste im nächsten Schritt bekommst du Bescheid, sobald früher etwas frei wird.</p>';
  els.slots.innerHTML = html;
}
function whenText() {
  if (st.day == null || st.m == null) return null;
  var d = dayDate(st.day);
  return DAYL[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()] + " · " + hm(st.m) + " Uhr";
}
function sum() {
  var s = svcById(st.svc);
  dlg.querySelector('[data-sum="svc"]').textContent = s ? s.name : "noch offen";
  dlg.querySelector('[data-sum="when"]').textContent = whenText() || "noch offen";
}
function go(n) {
  n = Math.max(0, Math.min(3, n)); st.step = n; els.msg.textContent = "";
  if (n === 0) renderSvc();
  if (n === 1) { if (st.day == null || !slots(dayDate(st.day), st.svc).length) st.day = firstFreeDay(); renderDays(); renderSlots(); setTimeout(scrollDay, 60); }
  els.panes.forEach(function (p, i) { p.hidden = i !== n; });
  els.steps.forEach(function (l, i) { l.className = i < n ? "is-done" : i === n ? "is-on" : ""; });
  els.h.textContent = TITLES[n];
  dlg.classList.toggle("is-done", n === 3);
  els.back.style.visibility = n > 0 && n < 3 ? "visible" : "hidden";
  els.next.textContent = n === 2 ? "Verbindlich buchen" : "Weiter";
  dlg.querySelector(".bk__body").scrollTop = 0;
  sum();
}
function next() {
  if (st.step === 0 && !st.svc) { els.msg.textContent = "Bitte wähle zuerst eine Leistung."; return; }
  if (st.step === 1 && st.m == null) { els.msg.textContent = "Bitte wähle eine Uhrzeit."; return; }
  if (st.step === 2) {
    var f = els.form, bad = ["name", "tel", "mail"].filter(function (k) { return !f.elements[k].checkValidity() || !f.elements[k].value.trim(); });
    if (bad.length) { els.msg.textContent = "Bitte fülle Name, Telefon und E-Mail aus."; f.elements[bad[0]].focus(); return; }
    var name = f.elements.name.value.trim().split(" ")[0];
    dlg.querySelector(".bk__doneH").textContent = "Danke, " + name + "!";
    dlg.querySelector(".bk__doneT").textContent = "Dein Termin am " + whenText() + " ist eingetragen. Die Bestätigung geht an " + f.elements.mail.value.trim() + "." +
      (f.elements.wait.checked ? " Du stehst außerdem auf der Warteliste für einen früheren Termin." : "");
  }
  go(st.step + 1);
}
function ics() {
  var s = svcById(st.svc), d = dayDate(st.day);
  function stamp(m) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m); return x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00"; }
  var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//tim-kofler.at//Haarliebe Entwurf//DE", "BEGIN:VEVENT", "UID:" + Date.now() + "@haarliebe-entwurf", "DTSTAMP:" + stamp(0),
    "DTSTART:" + stamp(st.m), "DTEND:" + stamp(st.m + s.min), "SUMMARY:Haarliebe: " + s.name, "LOCATION:Haarliebe\\, Schachnersiedlung 154\\, 4441 Behamberg", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = "haarliebe-termin.ics";
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
var lastFocus = null;
export function openBooking(o) {
  build(); o = o || {};
  if (st.step === 3) { st = { step: 0, svc: null, day: null, m: null }; els.form.reset(); }
  if (o.svc && svcById(o.svc)) st.svc = o.svc;
  lastFocus = document.activeElement;
  go(o.svc && svcById(o.svc) ? 1 : 0);
  dlg.showModal(); document.documentElement.classList.add("bk-open");
}
function close() {
  dlg.classList.add("is-closing");
  setTimeout(function () { dlg.classList.remove("is-closing"); dlg.close(); document.documentElement.classList.remove("bk-open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }, 180);
}

document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest("[data-book]"); if (!b) return;
  e.preventDefault(); openBooking({ svc: b.dataset.svc });
});
// Live-Angaben: data-next="balayage" zeigt den nächsten freien Termin, data-ahead die Tage bis dahin.
export function fillLive(root) {
  root = root || document;
  root.querySelectorAll("[data-next]").forEach(function (el) { el.textContent = nextFree(el.dataset.next).text; });
  root.querySelectorAll("[data-ahead]").forEach(function (el) { el.textContent = nextFree(el.dataset.ahead).days; });
}
