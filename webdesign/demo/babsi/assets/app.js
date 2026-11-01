// Babsis Hoarstüberl (Entwurf): Menü, Geöffnet-Anzeige, Vorher/Nachher-Regler, Einblenden, Anruf-Leiste.
(function () {
  "use strict";
  var d = document;
  d.documentElement.classList.add("js");

  // Kopf bekommt beim Scrollen einen Hintergrund
  var nav = d.getElementById("nav");
  var callbar = d.getElementById("callbar");
  function scrollen() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 30);
    if (callbar) callbar.classList.toggle("is-on", y > window.innerHeight * 0.6);
  }
  scrollen();
  window.addEventListener("scroll", scrollen, { passive: true });

  // Handy-Menü: geschlossen ist es hidden (display:none) und fängt keine Klicks ab
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    menu.classList.remove("is-open");
    d.body.style.overflow = "";
    setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 200);
  }
  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") return menuZu();
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menü schließen");
    d.body.style.overflow = "hidden";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) menuZu(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 800 && !menu.hidden) menuZu(); });

  // Geöffnet jetzt? Di–Fr 8–18 Uhr, Zeit in Österreich
  var TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  function wien() {
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vienna", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { tag: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), min: +p.hour * 60 + +p.minute };
    } catch (e) { var n = new Date(); return { tag: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function offenTag(t) { return t >= 2 && t <= 5; }
  function naechsterOffen(t) { for (var i = 1; i <= 7; i++) { var x = (t + i) % 7; if (offenTag(x)) return i === 1 ? "morgen" : TAGE[x]; } }
  function status() {
    var w = wien(), offen = offenTag(w.tag) && w.min >= 480 && w.min < 1080, txt;
    if (offen) txt = "Jetzt geöffnet · bis 18:00 Uhr";
    else if (offenTag(w.tag) && w.min < 480) txt = "Heute ab 8:00 Uhr geöffnet";
    else txt = "Geschlossen · " + naechsterOffen(w.tag) + " ab 8:00 Uhr";
    d.querySelectorAll("[data-status]").forEach(function (el) {
      el.classList.toggle("is-offen", offen);
      el.querySelector("[data-status-text]").textContent = txt;
    });
    if (callbar) callbar.classList.toggle("is-offen", offen);
    var heute = d.querySelector('#hours [data-tag="' + w.tag + '"]');
    d.querySelectorAll("#hours .is-heute").forEach(function (el) { el.classList.remove("is-heute"); });
    if (heute) heute.classList.add("is-heute");
  }
  status();
  setInterval(status, 60000);

  // Im Entwurf steht eine Platzhalter-Nummer: Tippen ruft nicht an, sondern zeigt einen Hinweis
  var tip = null;
  d.addEventListener("click", function (e) {
    var a = e.target.closest("[data-demo-tel]");
    if (!a) return;
    e.preventDefault();
    if (!tip) {
      tip = d.createElement("p");
      tip.className = "demo-tip";
      tip.setAttribute("role", "status");
      tip.textContent = "Im Entwurf steht eine Platzhalter-Nummer. Auf der fertigen Seite ruft dieser Knopf direkt bei Ihnen an.";
      d.body.appendChild(tip);
    }
    tip.classList.add("is-on");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.classList.remove("is-on"); }, 3200);
  });

  // Online-Termin (Entwurf): freie Zeiten sind fest erfunden, es wird nichts verschickt
  var bk = d.getElementById("bk");
  if (bk) {
    var KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MON = ["Jän.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
    var dayBox = d.getElementById("bk-days"), timeBox = d.getElementById("bk-times");
    var err = d.getElementById("bk-err"), ok = d.getElementById("bk-ok");
    var hm = function (m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); };
    var belegt = function (tag, m) { var x = Math.sin(tag * 12.9898 + m * 0.37719) * 43758.5453; return x - Math.floor(x) < (m < 720 ? 0.4 : 0.3); };
    var tage = [], heute = new Date(), w0 = wien();
    for (var i = 0; tage.length < 12 && i < 30; i++) {
      var dt = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + i);
      if (offenTag(dt.getDay()) && !(i === 0 && w0.min > 1020)) tage.push(dt);
    }
    dayBox.innerHTML = tage.map(function (dt, n) {
      return '<label><input type="radio" name="tag" value="' + n + '"' + (n === 0 ? " checked" : "") + '><span><small>' + KURZ[dt.getDay()] + '</small><b>' + dt.getDate() + '</b><em>' + MON[dt.getMonth()] + '</em></span></label>';
    }).join("");
    var dauer = function () { return +bk.querySelector('input[name="svc"]:checked').getAttribute("data-min"); };
    var zeiten = function () {
      var n = +bk.querySelector('input[name="tag"]:checked').value, dt = tage[n], key = Math.round(dt.getTime() / 864e5);
      var need = Math.ceil(dauer() / 30), out = [], frueh = n === 0 && dt.getDate() === heute.getDate() ? w0.min + 60 : 0;
      for (var m = 480; m + dauer() <= 1080; m += 30) {
        if (m < frueh) continue;
        var frei = true;
        for (var k = 0; k < need; k++) if (belegt(key, m + k * 30)) { frei = false; break; }
        if (frei) out.push(m);
      }
      timeBox.innerHTML = out.length ? out.map(function (m) {
        return '<label><input type="radio" name="zeit" value="' + m + '"><span>' + hm(m) + '</span></label>';
      }).join("") : "<p>An diesem Tag ist leider schon alles voll. Bitte einen anderen Tag wählen.</p>";
    };
    zeiten();
    bk.addEventListener("change", function (e) { if (e.target.name === "svc" || e.target.name === "tag") zeiten(); err.hidden = true; });
    bk.addEventListener("submit", function (e) {
      e.preventDefault();
      var z = bk.querySelector('input[name="zeit"]:checked'), name = bk.elements.name.value.trim(), tel = bk.elements.tel.value.trim();
      var fehlt = !z ? "Bitte eine Uhrzeit wählen." : !name ? "Bitte Ihren Namen eingeben." : tel.replace(/\D/g, "").length < 6 ? "Bitte eine Telefonnummer eingeben." : "";
      if (fehlt) { err.textContent = fehlt; err.hidden = false; return; }
      var dt = tage[+bk.querySelector('input[name="tag"]:checked').value];
      d.getElementById("bk-ok-name").textContent = name.split(" ")[0];
      d.getElementById("bk-ok-was").textContent = bk.querySelector('input[name="svc"]:checked').value + " · " + TAGE[dt.getDay()] + ", " + dt.getDate() + ". " + MON[dt.getMonth()] + " um " + hm(+z.value) + " Uhr";
      ok.hidden = false;
      bk.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    d.getElementById("bk-neu").addEventListener("click", function () { ok.hidden = true; bk.reset(); zeiten(); });
  }

  // Anruf-Leiste ausblenden, solange das Termin-Formular selbst zu sehen ist
  var termin = d.getElementById("termin");
  if (callbar && termin && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { callbar.classList.toggle("is-weg", es[0].isIntersecting); }, { threshold: 0.15 }).observe(termin);
  }

  // Vorher/Nachher-Regler
  var ba = d.getElementById("ba");
  if (ba) {
    var r = ba.querySelector(".ba__range");
    var setzen = function () { ba.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", setzen);
    setzen();
    // Ziehen mit Finger oder Maus; senkrechtes Wischen scrollt weiter die Seite (touch-action: pan-y)
    var zieht = false;
    var aufPunkt = function (e) {
      var b = ba.getBoundingClientRect();
      r.value = Math.max(0, Math.min(100, Math.round((e.clientX - b.left) / b.width * 100)));
      setzen();
    };
    ba.addEventListener("dragstart", function (e) { e.preventDefault(); });
    ba.addEventListener("pointerdown", function (e) { zieht = true; ba.setPointerCapture(e.pointerId); aufPunkt(e); });
    ba.addEventListener("pointermove", function (e) { if (zieht) aufPunkt(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { ba.addEventListener(t, function () { zieht = false; }); });
  }

  // Einblenden beim Scrollen
  var els = d.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
