/* Jakob Mistelbauer · Heilmasseur · Entwurf · kleine Helfer ohne Bibliotheken */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Kopfzeile, Menü, Handy-Leiste ---------- */
  var nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), dock = $("#dock"), tk = $(".tk"), foot = $(".foot");
  var footVisible = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 30);
    dock.classList.toggle("is-on", y > window.innerHeight * 0.6 && !footVisible && menu.hidden);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    onScroll();
  }
  burger.addEventListener("click", function () { setMenu(menu.hidden); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- Einblenden ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
    new IntersectionObserver(function (entries) {
      footVisible = entries[0].isIntersecting;
      tk.classList.toggle("is-on", footVisible);
      onScroll();
    }).observe(foot);
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    tk.classList.add("is-on");
  }
  onScroll();

  /* ---------- Toast ---------- */
  var toast = $("#toast"), toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  $$("[data-toast]").forEach(function (b) { b.addEventListener("click", function () { showToast(b.getAttribute("data-toast")); }); });

  /* ---------- Behandlungen: Wirkung aufklappen ---------- */
  $$(".card__more").forEach(function (b) {
    var list = b.nextElementSibling;
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open ? "true" : "false");
      list.hidden = !open;
      list.classList.toggle("is-open", open);
    });
  });

  /* ---------- Wo zwickt's? ---------- */
  var ZONEN = {
    nacken: { label: "Nacken und Schultern", title: "Verspannter Nacken", txt: "Oft vom Sitzen am Bildschirm oder vom Tragen. Gezielte Griffe lösen die harte Muskulatur, danach fühlt sich der Kopf freier an.", tags: ["Heilmassage", "Bindegewebsmassage", "Tapen"] },
    ruecken: { label: "Oberer Rücken", title: "Zwischen den Schulterblättern", txt: "Hier sammelt sich viel Spannung. Die Heilmassage lockert die Muskeln, die Segmentmassage wirkt zusätzlich über die Wirbelsäule.", tags: ["Heilmassage", "Segmentmassage"] },
    kreuz: { label: "Kreuz und unterer Rücken", title: "Es zieht im Kreuz", txt: "Ruhige, tiefe Griffe entlasten den unteren Rücken. Bei länger dauernden Beschwerden helfen Bindegewebs- und Segmentmassage.", tags: ["Heilmassage", "Bindegewebsmassage", "Segmentmassage"] },
    sport: { label: "Nach dem Sport", title: "Harte Muskeln nach dem Training", txt: "Als diplomierter Sportmasseur unterstütze ich Regeneration und beuge Verletzungen vor. Tape entlastet beim nächsten Training.", tags: ["Sportmassage", "Kinesio-Tapen"] },
    beine: { label: "Schwere Beine", title: "Schwer oder geschwollen", txt: "Die manuelle Lymphdrainage fördert den Abfluss von Lymphflüssigkeit und verringert Schwellungen. Sanft und sehr entspannend.", tags: ["Manuelle Lymphdrainage"] },
    fuesse: { label: "Füße", title: "Müde Füße, unruhiger Kopf", txt: "Über die Reflexzonen an den Füßen wird der ganze Körper angesprochen. Ideal, wenn Sie tief abschalten möchten.", tags: ["Reflexzonenmassage", "Entspannungsmassage"] }
  };
  var zoneCard = $("#zone");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function zeigeZone(key, scroll) {
    var z = ZONEN[key]; if (!z) return;
    $$("[data-zone]").forEach(function (el) {
      var on = el.getAttribute("data-zone") === key;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    zoneCard.classList.remove("is-new"); void zoneCard.offsetWidth; zoneCard.classList.add("is-new");
    zoneCard.innerHTML = '<p class="zone__label">' + esc(z.label) + '</p><h3 class="zone__title">' + esc(z.title) + '</h3><p class="zone__txt">' + esc(z.txt) +
      '</p><ul class="zone__tags">' + z.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
      '</ul><a class="btn btn--gold" href="#termin">Dafür Termin anfragen</a>';
    var sel = $("#form select");
    if (sel) {
      var want = z.tags[0] === "Sportmassage" ? "Heilmassage" : z.tags[0];
      $$("option", sel).forEach(function (o) { if (o.textContent.indexOf(want) === 0) sel.value = o.value; });
    }
    if (scroll && window.innerWidth < 1021) {
      var r = zoneCard.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom > window.innerHeight) window.scrollBy({ top: r.top - 90, behavior: reduce ? "auto" : "smooth" });
    }
  }
  $$(".spot").forEach(function (b) { b.addEventListener("click", function () { zeigeZone(b.getAttribute("data-zone"), true); }); });
  $$(".chip").forEach(function (b) { b.addEventListener("click", function () { zeigeZone(b.getAttribute("data-zone"), false); }); });

  /* ---------- Atemkreis ---------- */
  var wort = $("#atemWort");
  if (wort && !reduce) {
    var phase = 0;
    setInterval(function () {
      phase = (phase + 1) % 10;
      wort.textContent = phase < 4 ? "Einatmen" : "Ausatmen";
    }, 1000);
  } else if (wort) { wort.textContent = "Ruhig atmen"; }

  /* ---------- Werdegang: Linie wächst beim Scrollen ---------- */
  var weg = $("#weg");
  if (weg) {
    var wegTick = false;
    var malen = function () {
      wegTick = false;
      var r = weg.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      weg.style.setProperty("--weg", reduce ? 1 : p.toFixed(3));
    };
    window.addEventListener("scroll", function () { if (!wegTick) { wegTick = true; requestAnimationFrame(malen); } }, { passive: true });
    malen();
  }

  /* ---------- Formular (Entwurf: nichts wird verschickt) ---------- */
  var form = $("#form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "tel"].forEach(function (n) {
        var inp = form.elements[n], bad = !inp.value.trim();
        inp.closest(".field").classList.toggle("is-err", bad);
        if (bad && ok) { inp.focus(); ok = false; }
      });
      if (!ok) { showToast("Bitte Name und Telefonnummer ausfüllen."); return; }
      $("#formOk").hidden = false;
      $(".form__send").textContent = "Anfrage gesendet ✓";
    });
  }
})();
