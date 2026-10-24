// bunker.kollektiv · Entwurf
// Termine, Reihen, Countdown, Kalender-Export, Navigation und Scroll-Steuerung für den Abstieg.
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Reihen ----------------------------------------------------------
  var SERIES = {
    gassl: { name: "Gasslfestival", c: "#b6f23a", ed: "V", when: "Mai · Open Air", text: "Das Fest vor der Bunkertür: Bands drinnen, Bierbänke draußen, die ganze Gasse feiert mit. 2025 Teil des MOST/4 Festivals." },
    punx: { name: "Punx Revival", c: "#ff3d9a", ed: "V", when: "Frühjahr", text: "Punkrock, laut und ehrlich. Schon zu Gast: Rantanplan, Heathcliff, Punkberater und viele mehr." },
    metal: { name: "Nikolaus Slaughterhouse", c: "#ff3b30", ed: "IV", when: "Dezember · Metal Night", text: "Die härteste Bescherung im Mostviertel. Schon zu Gast: Ektomorf, Heimdalls Wacht, Ewig Frost." },
    bass: { name: "Bass Music Culture", c: "#9b6bff", ed: "IV", when: "November", text: "Bassmusik bis spät in die Nacht, mit DJs aus der Region und Bässen, die man im Bauch spürt." },
    kart: { name: "Mario Kart Turnier", c: "#ffd23f", ed: "10+", when: "Dezember", text: "Mario Madness: Controller statt Gitarre. Das gemütlichste Turnier des Jahres, mit großer Leinwand." },
    art: { name: "Collective Art", c: "#4fe6e1", ed: "IV", when: "Oktober · Offene Ateliers", text: "Tage der offenen Ateliers mit der Kulturvernetzung: Kunst zum Anschauen, Reden und Mitnehmen." }
  };
  var OTHER = { halloween: "#ff8a2b", rock: "#ff6a3d", pop: "#7ad3ff", misc: "#a8a5a0" };
  function colorOf(s) { return (SERIES[s] && SERIES[s].c) || OTHER[s] || OTHER.misc; }
  function tagOf(s) { return (SERIES[s] && SERIES[s].name) || { halloween: "Halloween", rock: "Rock", pop: "Pop", misc: "Special" }[s] || "Special"; }

  // ---- Termine (der Verein pflegt das später selbst im Login) ----------
  // d = Datum, t = Beginn, e = Enddatum (mehrtägig), s = Reihe
  var EVENTS = [
    { d: "2023-09-30", t: "20:00", title: "25 Jahre Rioters", sub: "Anniversary Party", s: "rock" },
    { d: "2023-10-21", e: "2023-10-22", title: "Tage der offenen Ateliers", s: "art" },
    { d: "2023-10-25", t: "21:00", title: "BassMusic", sub: "mit Mike & Rolo", s: "bass" },
    { d: "2023-12-08", t: "19:00", title: "Metal Night", sub: "Nikolaus Slaughterhouse", s: "metal" },
    { d: "2024-01-06", title: "Mario Madness 8", sub: "Kart Turnier", s: "kart" },
    { d: "2024-03-20", t: "18:00", title: "Pop im Bunker", sub: "Musikschule Purgstall", s: "pop" },
    { d: "2024-03-30", t: "20:00", title: "Bunker Rock Fest", sub: "Planet Error, Traincorn & Bouncing Pistols", s: "rock" },
    { d: "2024-04-28", t: "15:30", title: "Kindertheater: Prinz Wolke", s: "misc" },
    { d: "2024-05-25", t: "14:00", title: "3. Gasslfest", sub: "Eintritt frei", s: "gassl" },
    { d: "2024-06-22", t: "17:00", title: "Lesung „Unter Freunden“", s: "misc" },
    { d: "2024-09-21", t: "18:00", title: "Punx Revival 3", sub: "Rantanplan, Muuske, The Rumperts & Iro Käse", s: "punx" },
    { d: "2024-10-19", e: "2024-10-20", title: "Collective Art 2", sub: "Tage der offenen Ateliers", s: "art" },
    { d: "2024-10-26", t: "20:00", title: "Sharona live im Bunker", s: "misc" },
    { d: "2024-11-23", t: "19:00", title: "Bass Music Culture", s: "bass" },
    { d: "2024-12-07", t: "19:00", title: "Nikolaus Slaughterhouse", sub: "Ektomorf, Ewig Frost & Kendra", s: "metal" },
    { d: "2024-12-22", t: "16:00", title: "Mario Madness Kart Turnier", sub: "Christmas Edition", s: "kart" },
    { d: "2025-03-29", t: "19:00", title: "Punx Revival IV", sub: "Heathcliff, Honest Lie, Spectral Fire, Planet Error", s: "punx" },
    { d: "2025-04-09", t: "18:00", title: "Pop im Bunker", sub: "Musikschule", s: "pop" },
    { d: "2025-05-17", t: "19:00", title: "Metal MAYhem", s: "metal" },
    { d: "2025-06-21", t: "10:00", title: "Gasslfestival", sub: "im Rahmen des MOST/4 Festivals", s: "gassl" },
    { d: "2025-10-18", e: "2025-10-19", title: "Collective Art 3", sub: "Tage der offenen Ateliers", s: "art" },
    { d: "2025-10-31", t: "19:00", title: "Halloween Special", s: "halloween" },
    { d: "2025-11-22", t: "21:00", title: "Bass Music Culture", s: "bass" },
    { d: "2025-12-06", t: "19:00", title: "Nikolaus Slaughterhouse", sub: "Heimdalls Wacht, Richthammer, Steinalt, Weltenbrecher", s: "metal" },
    { d: "2025-12-20", t: "15:30", title: "Mario Madness Kart Turnier", s: "kart" },
    { d: "2026-03-21", t: "19:00", title: "Punx Revival V", sub: "Punkberater, Fat Jester, Scotch", s: "punx" },
    { d: "2026-04-18", t: "19:00", title: "Bunker Rockfest II", sub: "Blinding Lights & Sick'n'Flaw", s: "rock" },
    { d: "2026-05-16", e: "2026-05-17", t: "14:00", title: "Gasslfestival V", sub: "Sa ab 14 Uhr, So ab 10 Uhr", s: "gassl" },
    { d: "2026-10-17", e: "2026-10-18", title: "Collective Art IV", sub: "Tage der offenen Ateliers der Kulturvernetzung", s: "art" },
    { d: "2026-10-31", t: "19:00", title: "Halloween Special", sub: "Der Bunker verkleidet sich. Ihr auch?", s: "halloween" },
    { d: "2026-11-21", t: "19:00", title: "Bass Music Culture", sub: "Bassmusik bis spät in die Nacht", s: "bass" },
    { d: "2026-12-05", t: "19:00", title: "Nikolaus Slaughterhouse", sub: "Metal Night zum Nikolaus", s: "metal" },
    { d: "2026-12-19", t: "19:00", title: "Mario Kart Turnier", sub: "Mario Madness, Controller bereit", s: "kart" }
  ];

  // Demo: Termine aus der Vereins-Verwaltung (nur in diesem Browser gespeichert)
  function store(key) { try { return JSON.parse(localStorage.getItem(key) || "[]") || []; } catch (e) { return []; } }
  store("bunkerDemoEvents").forEach(function (ev) {
    if (ev && /^\d{4}-\d{2}-\d{2}$/.test(ev.d) && ev.title) EVENTS.push({ d: ev.d, t: ev.t || "", title: String(ev.title), sub: ev.sub || "", text: ev.text || "", s: ev.s || "misc", img: /^data:image\//.test(ev.img || "") ? ev.img : "", demo: true });
  });

  var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MO = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function pd(s, t) { var a = s.split("-"), h = (t || "00:00").split(":"); return new Date(+a[0], a[1] - 1, +a[2], +h[0], +h[1]); }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function hhmm(t) { if (!t) return ""; var h = t.split(":"); return (+h[0]) + (h[1] !== "00" ? ":" + h[1] : "") + " Uhr"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var now = new Date();
  EVENTS.forEach(function (ev) { ev.start = pd(ev.d, ev.t); ev.end = pd(ev.e || ev.d, "23:59"); });
  var upcoming = EVENTS.filter(function (ev) { return ev.end >= now; }).sort(function (a, b) { return a.start - b.start; });
  var past = EVENTS.filter(function (ev) { return ev.end < now; }).sort(function (a, b) { return b.start - a.start; });
  var next = upcoming[0];

  // ---- Nächstes Event -------------------------------------------------
  function longDate(ev) {
    var s = ev.start, txt = WDL[s.getDay()] + ", " + s.getDate() + ". " + MO[s.getMonth()] + " " + s.getFullYear();
    if (ev.e) { var e = pd(ev.e); txt = s.getDate() + ".–" + e.getDate() + ". " + MO[e.getMonth()] + " " + e.getFullYear(); }
    return txt + (ev.t ? " · " + hhmm(ev.t) : "");
  }
  function shortDate(ev) { var s = ev.start; return WD[s.getDay()] + ", " + s.getDate() + ". " + MO[s.getMonth()] + (ev.t ? " · " + hhmm(ev.t) : ""); }

  if (next) {
    document.querySelectorAll("[data-next-title]").forEach(function (el) { el.textContent = next.title; });
    document.querySelectorAll("[data-next-date]").forEach(function (el) { el.textContent = el.closest(".hero") ? shortDate(next) : longDate(next); });
    document.querySelectorAll("[data-next-short]").forEach(function (el) { el.textContent = next.start.getDate() + "." + (next.start.getMonth() + 1) + ". " + next.title; });
    var nt = document.querySelector("[data-next-text]");
    if (nt) nt.textContent = next.text || next.sub || (SERIES[next.s] ? SERIES[next.s].text : "");
    var nimg = document.querySelector(".next__media img");
    if (nimg && next.img) { nimg.src = next.img; nimg.alt = next.title; }
    var card = document.querySelector("[data-accent]");
    if (card) card.style.setProperty("--c", colorOf(next.s));
  }

  // Countdown
  var cd = { d: document.querySelector('[data-cd="d"]'), h: document.querySelector('[data-cd="h"]'), m: document.querySelector('[data-cd="m"]'), s: document.querySelector('[data-cd="s"]') };
  function tick() {
    if (!next || !cd.d) return;
    var ms = Math.max(0, next.start - new Date()), s = Math.floor(ms / 1000);
    cd.d.textContent = two(Math.floor(s / 86400)); cd.h.textContent = two(Math.floor(s / 3600) % 24);
    cd.m.textContent = two(Math.floor(s / 60) % 60); cd.s.textContent = two(s % 60);
  }
  tick(); setInterval(tick, 1000);

  // ---- Kommende Termine + Archiv -------------------------------------
  var ul = document.querySelector("[data-upcoming]");
  if (ul) {
    ul.innerHTML = upcoming.slice(1).map(function (ev, i) {
      var s = ev.start;
      return '<li class="ev reveal' + (ev.img ? " ev--img" : "") + '" style="--c:' + colorOf(ev.s) + '">' +
        (ev.img ? '<img class="ev__img" src="' + esc(ev.img) + '" alt="" loading="lazy">' : "") +
        '<div class="ev__date">' + two(s.getDate()) + "." + two(s.getMonth() + 1) + "<small>" + WDL[s.getDay()] + "</small></div>" +
        '<div><h3 class="ev__title">' + esc(ev.title) + (ev.demo ? ' <span class="ev__new">neu eingetragen</span>' : "") + "</h3>" +
        '<p class="ev__meta">' + (tagOf(ev.s) !== ev.title ? '<span class="ev__tag">' + esc(tagOf(ev.s)) + "</span>" : "") + esc(hhmm(ev.t)) + (ev.sub ? " · " + esc(ev.sub) : "") + "</p></div>" +
        '<button class="ev__cal" data-ics="' + EVENTS.indexOf(ev) + '">+ Kalender</button></li>';
    }).join("");
  }
  var arch = document.querySelector("[data-archive]");
  if (arch) {
    var years = {};
    past.forEach(function (ev) { var y = ev.start.getFullYear(); (years[y] = years[y] || []).push(ev); });
    arch.innerHTML = Object.keys(years).sort().reverse().map(function (y) {
      return "<div><h3>" + y + "</h3><ul>" + years[y].map(function (ev) {
        return "<li><b>" + two(ev.start.getDate()) + "." + two(ev.start.getMonth() + 1) + ".</b>" + esc(ev.title) + (ev.sub ? ' <span style="color:var(--muted)">· ' + esc(ev.sub) + "</span>" : "") + "</li>";
      }).join("") + "</ul></div>";
    }).join("");
    var ac = document.querySelector("[data-archive-count]");
    if (ac) ac.textContent = past.length + " Events";
  }
  var cp = document.querySelector("[data-count-past]");
  if (cp) { cp.setAttribute("data-count", past.length); cp.textContent = past.length; }

  // ---- Reihen-Kacheln -------------------------------------------------
  var grid = document.querySelector("[data-series]");
  if (grid) {
    grid.innerHTML = Object.keys(SERIES).map(function (k) {
      var r = SERIES[k];
      return '<article class="sr reveal" style="--c:' + r.c + '"><span class="sr__ed" aria-hidden="true">' + r.ed + '</span>' +
        '<span class="sr__when">' + esc(r.when) + "</span><h3>" + esc(r.name) + "</h3><p>" + esc(r.text) + "</p></article>";
    }).join("");
  }

  // ---- Kalender-Datei (.ics) -----------------------------------------
  function icsStamp(d) { return d.getFullYear() + two(d.getMonth() + 1) + two(d.getDate()) + "T" + two(d.getHours()) + two(d.getMinutes()) + "00"; }
  function downloadIcs(ev) {
    var allDay = !ev.t, lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//bunker.kollektiv//Termine//DE", "BEGIN:VEVENT",
      "UID:" + ev.d + "-" + ev.title.replace(/\W+/g, "") + "@bunkerkollektiv.at", "DTSTAMP:" + icsStamp(new Date()) ];
    if (allDay) {
      var e = pd(ev.e || ev.d); e.setDate(e.getDate() + 1);
      lines.push("DTSTART;VALUE=DATE:" + ev.d.replace(/-/g, ""), "DTEND;VALUE=DATE:" + icsStamp(e).slice(0, 8));
    } else {
      var end = new Date(ev.start.getTime() + 5 * 3600e3);
      lines.push("DTSTART;TZID=Europe/Vienna:" + icsStamp(ev.start), "DTEND;TZID=Europe/Vienna:" + icsStamp(end));
    }
    lines.push("SUMMARY:" + ev.title + " · bunker.kollektiv", "LOCATION:bunker.kollektiv\\, Schulgasse 3\\, 3251 Purgstall an der Erlauf",
      "DESCRIPTION:" + (ev.sub || "") + "\\nhttps://www.bunkerkollektiv.at", "END:VEVENT", "END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "bunker-" + ev.d + ".ics";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ics]"); if (!b) return;
    var v = b.getAttribute("data-ics"), ev = v === "next" ? next : EVENTS[+v];
    if (ev) downloadIcs(ev);
  });

  // ---- Galerie mit der Maus ziehen (am Handy wischt man ohnehin) ----
  document.querySelectorAll(".gallery__track").forEach(function (tr) {
    var x0 = 0, s0 = 0, id = null, moved = false, vx = 0, lx = 0, lt = 0;
    tr.classList.add("can-drag");
    tr.addEventListener("dragstart", function (e) { e.preventDefault(); });
    tr.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      id = e.pointerId; x0 = lx = e.clientX; s0 = tr.scrollLeft; moved = false; vx = 0; lt = performance.now();
    });
    tr.addEventListener("pointermove", function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 4) { moved = true; tr.classList.add("is-drag"); tr.setPointerCapture(id); }
      if (!moved) return;
      var now = performance.now(); vx = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now;
      tr.scrollLeft = s0 - dx;
    });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null; if (!moved) return;
      // etwas Schwung mitnehmen, dann rastet das nächste Bild wieder ein
      var go = tr.scrollLeft - vx * 260;
      tr.classList.remove("is-drag");
      tr.scrollTo({ left: go, behavior: reduce ? "auto" : "smooth" });
    }
    tr.addEventListener("pointerup", end);
    tr.addEventListener("pointercancel", end);
    tr.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  // ---- Videos: YouTube erst nach Klick laden (ohne Cookies) -----------
  document.querySelectorAll("[data-yt]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-yt");
      if (!/^[\w-]{11}$/.test(id)) return;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      f.title = b.getAttribute("aria-label").replace("Video abspielen: ", "");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      // Knopf durch einen Rahmen mit dem Player ersetzen (kein iframe im button)
      var box = document.createElement("div");
      box.className = b.className + " is-on";
      box.appendChild(f); b.replaceWith(box); f.focus();
    });
  });

  // ---- Anfrage-Formulare (Beispiel) ----------------------------------
  function openForm(id) {
    var dlg = document.getElementById("form-" + id);
    if (!dlg || !dlg.showModal) return;
    var f = dlg.querySelector("form");
    f.classList.remove("is-sent"); var ok = f.querySelector(".modal__ok"); if (ok) ok.remove();
    dlg.showModal(); document.documentElement.classList.add("modal-open");
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openForm(o.getAttribute("data-open")); return; }
    var c = e.target.closest("[data-close]");
    if (c) { c.closest("dialog").close(); return; }
    if (e.target.tagName === "DIALOG") e.target.close(); // Klick neben das Fenster
  });
  document.querySelectorAll("dialog.modal").forEach(function (dlg) {
    dlg.addEventListener("close", function () { document.documentElement.classList.remove("modal-open"); });
    var f = dlg.querySelector("form");
    if (!f.hasAttribute("data-anfrage")) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {}, fd = new FormData(f);
      fd.forEach(function (v, k) { v = String(v).trim(); if (!v) return; data[k] = data[k] ? data[k] + ", " + v : v; });
      var list = store("bunkerDemoAnfragen");
      list.unshift({ art: f.getAttribute("data-anfrage"), at: new Date().toISOString(), felder: data });
      try { localStorage.setItem("bunkerDemoAnfragen", JSON.stringify(list.slice(0, 30))); } catch (err) {}
      var name = (data.Name || data.Band || "").split(" ")[0];
      var ok = document.createElement("div"); ok.className = "modal__ok"; ok.setAttribute("role", "status");
      ok.innerHTML = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l7 7 15-16"/></svg>' +
        "<h3>Danke" + (name ? ", " + esc(name) : "") + "!</h3><p>So sieht's aus, wenn eine Anfrage reinkommt. Im echten Betrieb landet sie beim Verein per E-Mail und in der Verwaltung.</p>" +
        '<div class="modal__okbtns"><a class="btn btn--neon" href="verwaltung/#anfragen">In der Verwaltung ansehen</a><button class="btn btn--ghost" type="button" data-close>Schließen</button></div>';
      f.appendChild(ok); f.classList.add("is-sent"); f.reset();
      ok.querySelector("a").focus();
    });
  });

  // ---- Navigation -----------------------------------------------------
  var nav = document.getElementById("nav"), burger = document.querySelector(".nav__burger"), drawer = document.getElementById("drawer");
  function closeDrawer() { drawer.hidden = true; burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Menü öffnen"); document.body.style.overflow = ""; }
  burger.addEventListener("click", function () {
    if (drawer.hidden) { drawer.hidden = false; burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Menü schließen"); document.body.style.overflow = "hidden"; }
    else closeDrawer();
  });
  drawer.addEventListener("click", function (e) { if (e.target.closest("a")) closeDrawer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) closeDrawer(); });

  // ---- Abstieg: Scroll-Fortschritt -----------------------------------
  var descent = document.getElementById("descent");
  var beats = [].slice.call(document.querySelectorAll("[data-from]"));
  var lastP = -1;
  function onScroll() {
    var p = 1;
    if (descent && !document.documentElement.classList.contains("no3d")) {
      var r = descent.getBoundingClientRect(), span = r.height - window.innerHeight;
      p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    }
    if (p !== lastP) {
      lastP = p; window.__descentP = p;
      beats.forEach(function (b) {
        var f = Math.min(1, Math.max(0, (p - b.dataset.from) / 0.035), Math.max(0, (b.dataset.to - p) / 0.035));
        if (+b.dataset.from === 0 && p <= 0.001) f = 1;
        b.classList.toggle("is-on", f > 0);
        b.style.opacity = f;
        if (!b.classList.contains("hero")) b.style.transform = "translateY(" + ((1 - f) * 18) + "px)";
        else { var hi = b.querySelector(".hero__img"); if (hi) hi.style.transform = "scale(" + (1.08 - 0.08 * Math.min(1, Math.max(0, (p - 0.88) / 0.12))) + ")"; }
      });
      window.dispatchEvent(new CustomEvent("descent", { detail: p }));
    }
    var heroBottom = descent ? descent.getBoundingClientRect().bottom : 0;
    nav.classList.toggle("is-solid", p > 0.97 && heroBottom < window.innerHeight * 0.35 || heroBottom < 80);
    document.documentElement.classList.toggle("past-hero", heroBottom < 80); // Entwurf-Hinweis am Handy dann nur als TK-Zeichen
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  document.addEventListener("no3d", onScroll);
  onScroll();

  // ---- Einblenden + Zähler -------------------------------------------
  function countUp(el) {
    var to = +el.getAttribute("data-count"); if (!to || reduce || el.hasAttribute("data-plain")) return;
    var t0 = performance.now(), dur = 1200;
    (function step(t) { var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        var c = en.target.querySelector("[data-count]"); if (c) countUp(c);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }
})();
