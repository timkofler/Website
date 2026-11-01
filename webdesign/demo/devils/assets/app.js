/* The Devils Kremsmünster · Entwurf von Tim Kofler */
(function () {
  "use strict";
  var d = document, w = window;
  var ruhig = w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Navigation bekommt beim Scrollen einen Hintergrund
  var nav = d.getElementById("nav");
  function navCheck() { nav.classList.toggle("is-fest", w.scrollY > 40); }
  navCheck();
  w.addEventListener("scroll", navCheck, { passive: true });

  // Menü am Handy
  var burger = d.getElementById("burger"), menu = d.getElementById("menu");
  function menuZu() { menu.hidden = true; burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Menü öffnen"); d.body.style.overflow = ""; }
  burger.addEventListener("click", function () {
    var auf = menu.hidden;
    menu.hidden = !auf;
    burger.setAttribute("aria-expanded", String(auf));
    burger.setAttribute("aria-label", auf ? "Menü schließen" : "Menü öffnen");
    d.body.style.overflow = auf ? "hidden" : "";
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuZu(); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) menuZu(); });

  // Einblenden beim Scrollen, Geschwister leicht versetzt
  var gruppen = new Map();
  var io = "IntersectionObserver" in w ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-sichtbar"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  d.querySelectorAll(".reveal").forEach(function (el) {
    var n = gruppen.get(el.parentElement) || 0;
    gruppen.set(el.parentElement, n + 1);
    el.style.setProperty("--d", Math.min(n, 4) * 0.08 + "s");
    if (io) io.observe(el); else el.classList.add("is-sichtbar");
  });

  // Glut-Funken im Startbild
  var cv = d.getElementById("glut");
  if (cv && !ruhig) {
    var ctx = cv.getContext("2d"), funken = [], cw = 0, ch = 0, dpr = Math.min(w.devicePixelRatio || 1, 2), laeuft = true;
    function groesse() { cw = cv.offsetWidth; ch = cv.offsetHeight; cv.width = cw * dpr; cv.height = ch * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function neu(start) {
      return { x: Math.random() * cw, y: start ? Math.random() * ch : ch + 10, r: Math.random() * 1.8 + 0.6, vy: Math.random() * 0.9 + 0.35, vx: (Math.random() - 0.5) * 0.4, p: Math.random() * 6.28, a: Math.random() * 0.6 + 0.4 };
    }
    groesse();
    var anzahl = cw < 700 ? 45 : 90;
    for (var i = 0; i < anzahl; i++) funken.push(neu(true));
    w.addEventListener("resize", groesse);
    if ("IntersectionObserver" in w) new IntersectionObserver(function (es) { laeuft = es[0].isIntersecting; if (laeuft) requestAnimationFrame(male); }).observe(cv);
    function male() {
      if (!laeuft) return;
      ctx.clearRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "lighter";
      funken.forEach(function (f, i) {
        f.y -= f.vy; f.p += 0.03; f.x += f.vx + Math.sin(f.p) * 0.35;
        var hoehe = f.y / ch, alpha = f.a * Math.max(0, Math.min(1, hoehe * 1.4));
        if (f.y < -10 || alpha <= 0.01) { funken[i] = neu(false); return; }
        var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4);
        g.addColorStop(0, "rgba(255,200,120," + alpha + ")");
        g.addColorStop(0.35, "rgba(255,110,30," + alpha * 0.7 + ")");
        g.addColorStop(1, "rgba(255,60,10,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 4, 0, 6.29); ctx.fill();
      });
      requestAnimationFrame(male);
    }
    requestAnimationFrame(male);
  }

  // Tour: Wochentag, vergangene Termine grau, nächster Termin hervorgehoben
  var WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var termine = [].slice.call(d.querySelectorAll(".termin"));
  var jetzt = new Date(), naechster = null;
  termine.forEach(function (li) {
    var t = li.getAttribute("data-d").split("-"), zeit = (li.getAttribute("data-t") || "18:00").split(":");
    var ende = new Date(+t[0], +t[1] - 1, +t[2], 23, 59);
    li._start = new Date(+t[0], +t[1] - 1, +t[2], +zeit[0], +zeit[1]);
    var p = li.querySelector("p");
    var wt = d.createElement("span"); wt.className = "termin__wt"; wt.textContent = WT[li._start.getDay()] + " · ";
    p.insertBefore(wt, p.firstChild);
    if (ende < jetzt) li.classList.add("is-vorbei");
    else if (!naechster) naechster = li;
    li.addEventListener("pointermove", function (e) { var r = li.getBoundingClientRect(); li.style.setProperty("--mx", (e.clientX - r.left) + "px"); });
    li.addEventListener("pointerleave", function () { li.style.setProperty("--mx", "-300px"); });
  });
  if (naechster) {
    naechster.classList.add("is-naechster");
    var b = d.createElement("span"); b.className = "termin__badge"; b.textContent = "Als Nächstes";
    naechster.querySelector("h3").appendChild(b);
  }

  // Countdown zum nächsten Auftritt
  var countBox = d.getElementById("count");
  if (naechster) {
    d.getElementById("count-was").textContent = naechster.querySelector("h3").firstChild.textContent.trim();
    var ziel = naechster._start.getTime();
    var el = { t: d.getElementById("c-t"), s: d.getElementById("c-s"), m: d.getElementById("c-m"), x: d.getElementById("c-x") };
    var zwei = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var rest = Math.max(0, Math.floor((ziel - Date.now()) / 1000));
      el.t.textContent = zwei(Math.floor(rest / 86400));
      el.s.textContent = zwei(Math.floor(rest % 86400 / 3600));
      el.m.textContent = zwei(Math.floor(rest % 3600 / 60));
      el.x.textContent = zwei(rest % 60);
    };
    tick(); setInterval(tick, 1000);
  } else if (countBox) {
    countBox.hidden = true;
  }

  // Filter der Termine
  var filterBox = d.querySelector(".filter");
  if (filterBox) filterBox.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;
    var f = btn.getAttribute("data-filter");
    filterBox.querySelectorAll("button").forEach(function (x) { var on = x === btn; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
    termine.forEach(function (li) { li.hidden = f !== "alle" && (" " + li.getAttribute("data-tags") + " ").indexOf(" " + f + " ") < 0; });
  });

  // Feuer-Zwischenbild bewegt sich leicht beim Scrollen
  var feuer = d.querySelector(".feuer img");
  if (feuer && !ruhig) {
    var parallax = function () {
      var r = feuer.parentElement.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > w.innerHeight) return;
      var p = (r.top + r.height / 2 - w.innerHeight / 2) / w.innerHeight;
      feuer.style.setProperty("--par", (p * -60).toFixed(1) + "px");
    };
    w.addEventListener("scroll", parallax, { passive: true }); parallax();
  }

  // Zahlen zählen hoch
  var zahlen = d.querySelectorAll("[data-zahl]");
  if (io && !ruhig) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        zio.unobserve(e.target);
        var ziel = +e.target.getAttribute("data-zahl"), t0 = null;
        var lauf = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1200); e.target.textContent = Math.round(ziel * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(lauf); };
        e.target.textContent = "0"; requestAnimationFrame(lauf);
      });
    }, { threshold: 0.6 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  // Handy-Knopf unten: nach dem Startbild zeigen, beim Formular ausblenden
  var mcta = d.getElementById("mobil-cta"), anfrage = d.getElementById("anfrage"), hero = d.querySelector(".hero");
  if (mcta && io) {
    var heroWeg = false, formDa = false;
    var setzen = function () { mcta.classList.toggle("is-on", heroWeg && !formDa); };
    new IntersectionObserver(function (es) { heroWeg = !es[0].isIntersecting; setzen(); }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
    new IntersectionObserver(function (es) { formDa = es[0].isIntersecting; setzen(); }).observe(anfrage);
  }

  // Hausbesuch-Anfrage
  var form = d.getElementById("anfrage-form");
  if (form) {
    var wahlZeit = "", kinder = 2;
    var zeiten = d.getElementById("zeiten");
    zeiten.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-zeit]"); if (!btn) return;
      wahlZeit = btn.getAttribute("data-zeit");
      zeiten.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", String(x === btn)); });
    });
    var out = d.getElementById("kinder");
    d.getElementById("k-minus").addEventListener("click", function () { kinder = Math.max(1, kinder - 1); out.textContent = kinder; });
    d.getElementById("k-plus").addEventListener("click", function () { kinder = Math.min(12, kinder + 1); out.textContent = kinder; });
    var WILD = {
      1: ["Sanft", "Sanft: Für die ganz Kleinen. Der Krampus bleibt im Hintergrund, die Glocken leise."],
      2: ["Mittel", "Mittel: Glocken, Brummen und ein ernstes Wort. Danach gibt's ein Sackerl."],
      3: ["Wild", "Wild: Volle Lautstärke, Rute und Gänsehaut. Nur für mutige Große."]
    };
    var wild = d.getElementById("wild"), wildText = d.getElementById("wild-text");
    var wildSetzen = function () { wildText.textContent = WILD[wild.value][1]; wild.setAttribute("aria-valuetext", WILD[wild.value][0]); };
    wild.addEventListener("input", wildSetzen); wildSetzen();

    var fehler = d.getElementById("anfrage-fehler");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fehlt = [], erstes = null;
      if (!wahlZeit) fehlt.push("eine Wunschzeit");
      [["name", "euren Namen"], ["tel", "eine Telefonnummer"], ["adresse", "die Adresse"]].forEach(function (f) {
        var el = form.elements[f[0]], ok = f[0] === "tel" ? el.value.replace(/\D/g, "").length >= 6 : !!el.value.trim();
        el.classList.toggle("is-bad", !ok);
        if (!ok) { fehlt.push(f[1]); erstes = erstes || el; }
      });
      if (fehlt.length) {
        fehler.textContent = "Bitte noch " + fehlt.join(", ").replace(/, ([^,]*)$/, " und $1") + " angeben.";
        fehler.hidden = false;
        if (erstes) erstes.focus();
        return;
      }
      fehler.hidden = true;
      var vorname = form.elements.name.value.trim().split(/\s+/)[0];
      var zeitText = wahlZeit === "egal" ? "am Nachmittag" : "um " + wahlZeit + " Uhr";
      d.getElementById("anfrage-ok-text").textContent = "Danke, " + vorname + ". Ihr habt einen Hausbesuch am 6. Dezember " + zeitText + " für " + kinder + (kinder === 1 ? " Kind" : " Kinder") + " angefragt, Stufe „" + WILD[wild.value][0] + "“. Wir melden uns mit der Bestätigung.";
      d.getElementById("anfrage-ok").hidden = false;
      form.classList.add("is-fertig");
      form.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "center" });
    });
    form.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("is-bad"); });
  }

  // Galerie: Laterne folgt Maus oder Finger, sonst wandert sie langsam
  var lat = d.getElementById("laterne");
  if (lat) {
    var dunkel = lat.querySelector(".laterne__dunkel"), aktiv = 0, phase = 0;
    var setz = function (x, y) { dunkel.style.setProperty("--lx", x + "px"); dunkel.style.setProperty("--ly", y + "px"); };
    var radius = function () { dunkel.style.setProperty("--r", Math.max(170, Math.min(300, lat.offsetWidth * 0.26)) + "px"); };
    radius(); w.addEventListener("resize", radius);
    var bewegt = function (e) { var r = lat.getBoundingClientRect(); setz(e.clientX - r.left, e.clientY - r.top); aktiv = Date.now(); };
    lat.addEventListener("pointermove", bewegt);
    lat.addEventListener("pointerdown", bewegt);
    var sichtbar = false;
    if (io) new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; if (sichtbar) requestAnimationFrame(wandern); }).observe(lat);
    // Am Handy ohne Maus wandert die Laterne beim Scrollen mit nach unten
    var touch = w.matchMedia("(hover: none), (pointer: coarse)").matches;
    var wandern = function () {
      if (!sichtbar) return;
      if (touch && Date.now() - aktiv > 1200) {
        var r = lat.getBoundingClientRect();
        var y = Math.max(0, Math.min(r.height, w.innerHeight * 0.5 - r.top));
        phase += ruhig ? 0 : 0.01;
        setz(r.width * (0.5 + Math.sin(phase + y / 260) * 0.3), y);
      } else if (!touch && Date.now() - aktiv > 2500) {
        phase += ruhig ? 0 : 0.006;
        setz(lat.offsetWidth * (0.5 + Math.sin(phase) * 0.36), lat.offsetHeight * (0.5 + Math.sin(phase * 1.7) * 0.34));
      }
      requestAnimationFrame(wandern);
    };
    setz(lat.offsetWidth / 2, lat.offsetHeight / 2);

    // Großansicht
    var licht = d.getElementById("licht"), lichtBild = d.getElementById("licht-bild"), vorher = null;
    var zu = function () { licht.hidden = true; d.body.style.overflow = ""; if (vorher) vorher.focus(); };
    lat.addEventListener("click", function (e) {
      var btn = e.target.closest(".laterne__bild"); if (!btn) return;
      vorher = btn;
      lichtBild.src = btn.getAttribute("data-gross");
      lichtBild.alt = btn.querySelector("img").alt;
      licht.hidden = false; d.body.style.overflow = "hidden";
      d.getElementById("licht-zu").focus();
    });
    licht.addEventListener("click", function (e) { if (e.target !== lichtBild) zu(); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !licht.hidden) zu(); });
  }

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
      tip.textContent = "Im Entwurf steht eine Platzhalter-Nummer. Auf der fertigen Seite ruft dieser Knopf direkt bei euch an.";
      d.body.appendChild(tip);
    }
    tip.classList.add("is-on");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.classList.remove("is-on"); }, 3200);
  });
})();
