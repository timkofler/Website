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
