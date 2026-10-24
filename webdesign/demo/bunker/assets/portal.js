// bunker.kollektiv · Version 2: Umschalter V1/V2 und Vereinsportal (Demo)
// Das Portal speichert nur in diesem Browser (localStorage). Neue Termine landen in "bunkerDemoEvents" und erscheinen dadurch auf der Seite.
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function isV2() { return root.classList.contains("v2"); }

  // ---------- Umschalter V1 / V2 ----------
  var sw = $("[data-vsw]");
  function syncSw() { $$("[data-ver]", sw).forEach(function (b) { b.setAttribute("aria-pressed", String((b.getAttribute("data-ver") === "2") === isV2())); }); }
  function setVer(v) {
    root.classList.toggle("v2", v === "2");
    try { localStorage.setItem("bunkerVersion", v); } catch (e) {}
    var u = new URL(location.href); u.searchParams.set("v", v); history.replaceState(null, "", u.pathname + u.search + u.hash);
    syncSw();
    if (v === "2") requestAnimationFrame(function () { placeBlob(cur, false); });
    window.dispatchEvent(new Event("resize"));
  }
  $$("[data-ver]", sw).forEach(function (b) { b.addEventListener("click", function () { setVer(b.getAttribute("data-ver")); }); });
  syncSw();

  // ---------- Meldung ----------
  var toastEl = $("[data-ptoast]");
  function toast(html) {
    toastEl.innerHTML = html; toastEl.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(function () { toastEl.hidden = true; }, 5200);
  }

  // ---------- Musterdaten ----------
  var PAL = ["#4fe6e1", "#ff3d9a", "#ffb547", "#9b6bff", "#ff8a2b", "#7ad3ff"];
  var KEY = "bunkerPortal", KEY_EV = "bunkerDemoEvents", KEY_ANF = "bunkerDemoAnfragen";
  var SEED = {
    mem: [
      ["Lena Aigner", "Vorstand, Kassa", 1], ["Jakob Berger", "Technik", 1], ["Mira Haslinger", "Bar", 0], ["Tobias Riegler", "Licht", 1],
      ["Sophie Kern", "Fotos", 1], ["Elias Wurzer", "Aufbau", 0], ["Hannah Pöchhacker", "Bar", 1], ["Felix Gruber", "Booking", 1],
      ["Anna Fuchs", "Einlass, Kassa", 0], ["Lukas Stadler", "Ton", 1], ["Nina Hofer", "Social Media", 1], ["David Prinz", "Aufbau", 1]
    ].map(function (m, i) { return { nr: i + 1, name: m[0], role: m[1], paid: !!m[2] }; }),
    help: [
      { id: "auf", t: "Aufbau & Deko", w: "14:00 bis 18:00", need: 3, who: [2, 6] },
      { id: "tech", t: "Licht & Ton", w: "ab 17:30", need: 1, who: [4] },
      { id: "ein", t: "Einlass & Kassa", w: "18:30 bis 23:00", need: 2, who: [9] },
      { id: "bar1", t: "Bar früh", w: "19:00 bis 22:30", need: 2, who: [3, 7] },
      { id: "bar2", t: "Bar spät", w: "22:30 bis 2:00", need: 2, who: [] },
      { id: "ab", t: "Abbau", w: "am Tag danach, 11:00", need: 3, who: [12] }
    ],
    cash: [
      { d: "2026-10-01", t: "Übertrag September", a: 2410, u: 1 },
      { d: "2026-10-03", t: "Mitgliedsbeiträge (9 × 25 €)", a: 225 },
      { d: "2026-10-09", t: "Getränke-Einkauf Großhandel", a: -312.4 },
      { d: "2026-10-17", t: "Spenden Collective Art", a: 186.5 },
      { d: "2026-10-18", t: "Material offene Ateliers", a: -64.8 },
      { d: "2026-10-20", t: "Strom Bunker, 3. Quartal", a: -186.2 },
      { d: "2026-10-22", t: "Halloween-Deko", a: -78.9 }
    ],
    feed: [
      { i: "MH", c: "#ffb547", t: "Mira H. hat sich für „Bar früh“ eingetragen", w: "vor 2 Std." },
      { i: "JB", c: "#ff3d9a", t: "Jakob B. hat das Kassabuch ergänzt: Halloween-Deko", w: "22. Okt." },
      { i: "M", c: "#4fe6e1", t: "Neue Mietanfrage: 30er-Feier im November", w: "18. Okt." },
      { i: "SK", c: "#ff8a2b", t: "Sophie K. hat 24 Fotos vom Collective Art hochgeladen", w: "18. Okt." }
    ]
  };
  var S = load(KEY, null);
  if (!S || !S.mem || !S.help || !S.cash || !S.feed) S = JSON.parse(JSON.stringify(SEED));
  function persist() { save(KEY, S); }
  function ini(name) { var p = name.trim().split(/\s+/); return ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase(); }
  function short(name) { var p = name.trim().split(/\s+/); return p[0] + (p.length > 1 ? " " + p[p.length - 1][0] + "." : ""); }
  function colOf(nr) { return PAL[(nr - 1) % PAL.length]; }
  function mem(nr) { for (var i = 0; i < S.mem.length; i++) if (S.mem[i].nr === nr) return S.mem[i]; return null; }
  function av(nr) { var m = mem(nr); return '<span class="av" style="--c:' + colOf(nr) + '">' + esc(ini(m ? m.name : "?")) + "</span>"; }
  function dots(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function euro(n) { var a = Math.abs(n).toFixed(2).split("."); return (n < 0 ? "−" : "") + dots(a[0]) + "," + a[1] + " €"; }
  function euro0(n) { return (n < 0 ? "−" : "") + dots(Math.abs(Math.round(n))) + " €"; }
  function addFeed(i, c, t) { S.feed.unshift({ i: i, c: c, t: t, ts: Date.now(), n: 1 }); S.feed = S.feed.slice(0, 6); }
  var MO = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  function ago(ts) {
    var m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "gerade eben"; if (m < 60) return "vor " + m + " Min."; if (m < 24 * 60) return "vor " + Math.round(m / 60) + " Std.";
    var d = new Date(ts); return d.getDate() + ". " + MO[d.getMonth()].slice(0, 3) + ".";
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dShort(iso) { var a = iso.split("-"); return +a[2] + "." + +a[1] + "."; }

  // ---------- Reiter mit fließender Markierung ----------
  var tabs = $("[data-pt-tabs]"), blob = $(".pt__blob", tabs), cur = $('[data-pt-tab][aria-selected="true"]', tabs), last = null;
  function rectOf(b) { return { l: b.offsetLeft, t: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight }; }
  function css(r) { return { left: r.l + "px", top: r.t + "px", width: r.w + "px", height: r.h + "px" }; }
  function placeBlob(b, anim) {
    if (!b || !b.offsetWidth) return;
    var r = rectOf(b);
    if (anim && last && !reduce && blob.animate) {
      var u = { l: Math.min(last.l, r.l), t: Math.min(last.t, r.t) };
      u.w = Math.max(last.l + last.w, r.l + r.w) - u.l; u.h = Math.max(last.t + last.h, r.t + r.h) - u.t;
      // Tropfen: erst in die Länge ziehen, dann am Ziel zusammenziehen
      var mid = { l: u.l + (r.l - u.l) * 0.35, t: u.t + (r.t - u.t) * 0.35, w: u.w - (u.w - r.w) * 0.35, h: u.h - (u.h - r.h) * 0.35 };
      blob.animate([css(last), css(mid), css(r)], { duration: 520, easing: "cubic-bezier(.5,0,.2,1)" });
    }
    var c = css(r); for (var k in c) blob.style[k] = c[k];
    blob.classList.add("on"); last = r;
  }
  function showTab(name, focus) {
    var b = $('[data-pt-tab="' + name + '"]', tabs); if (!b) return;
    $$("[data-pt-tab]", tabs).forEach(function (x) {
      var on = x === b;
      x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    placeBlob(b, true); cur = b;
    if (tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    if (focus) b.focus({ preventScroll: true });
    render(name);
  }
  tabs.addEventListener("click", function (e) { var b = e.target.closest("[data-pt-tab]"); if (b) showTab(b.getAttribute("data-pt-tab")); });
  tabs.addEventListener("keydown", function (e) {
    var list = $$("[data-pt-tab]", tabs), i = list.indexOf(document.activeElement); if (i < 0) return;
    var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!n) return;
    e.preventDefault(); var b = list[(i + n + list.length) % list.length]; showTab(b.getAttribute("data-pt-tab"), true);
  });
  window.addEventListener("resize", function () { last = null; placeBlob(cur, false); });
  $("[data-pt]").addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (!g) return;
    if (g.hasAttribute("data-filter")) setFilter(g.getAttribute("data-filter"));
    showTab(g.getAttribute("data-go"));
    var top = $("[data-pt]").getBoundingClientRect().top;
    if (top < 0) $("[data-pt]").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  // ---------- Übersicht ----------
  function nextEvent() {
    var t = $(".next__title"), m = $(".next__meta"), d = $('[data-cd="d"]');
    return { title: t ? t.textContent.trim() : "Nächstes Event", meta: m ? m.textContent.trim() : "", days: d ? +d.textContent : null };
  }
  function helpFree() { return S.help.reduce(function (s, h) { return s + Math.max(0, h.need - h.who.length); }, 0); }
  function cashSums() {
    var inn = 0, out = 0, tot = 0;
    S.cash.forEach(function (c) { tot += c.a; if (c.u) return; if (c.a >= 0) inn += c.a; else out -= c.a; });
    return { inn: inn, out: out, tot: tot };
  }
  function ownAnf() { return load(KEY_ANF, []); }
  function badges() {
    var f = helpFree(), a = ownAnf().length;
    $('[data-pt-cnt="helfer"]').textContent = f || "";
    $('[data-pt-cnt="anfragen"]').textContent = a || "";
  }
  function renderHome() {
    var ev = nextEvent(), f = helpFree(), paid = S.mem.filter(function (m) { return m.paid; }).length, cs = cashSums();
    $("[data-pt-next]").textContent = ev.title;
    $("[data-pt-next-d]").textContent = ev.days == null ? ev.meta : ev.days === 0 ? "heute!" : ev.days === 1 ? "morgen" : "in " + ev.days + " Tagen";
    $("[data-pt-free]").textContent = f;
    $("[data-pt-free-s]").textContent = f ? (f === 1 ? "Schicht" : "Schichten") + " fürs nächste Event noch frei" : "Alle Schichten sind besetzt";
    $("[data-pt-mem]").textContent = S.mem.length;
    $("[data-pt-mem-s]").textContent = (S.mem.length - paid) ? (S.mem.length - paid) + (S.mem.length - paid === 1 ? " Beitrag" : " Beiträge") + " noch offen" : "Alle Beiträge bezahlt";
    $("[data-pt-cash]").textContent = euro0(cs.tot);
    $("[data-pt-feed]").innerHTML = S.feed.map(function (x) {
      return '<li' + (x.n ? ' class="flash"' : "") + '><span class="av" style="--c:' + x.c + '">' + esc(x.i) + "</span><span>" + esc(x.t) + "</span><small>" + esc(x.ts ? ago(x.ts) : x.w) + "</small></li>";
    }).join("");
    S.feed.forEach(function (x) { delete x.n; });
  }

  // ---------- Termine ----------
  var SERIES = [["misc", "Special", "#a8a5a0"], ["rock", "Rock", "#ff6a3d"], ["gassl", "Gasslfestival", "#b6f23a"], ["punx", "Punx Revival", "#ff3d9a"], ["metal", "Metal Night", "#ff3b30"],
    ["bass", "Bass Music", "#9b6bff"], ["kart", "Mario Kart", "#ffd23f"], ["art", "Collective Art", "#4fe6e1"], ["halloween", "Halloween", "#ff8a2b"]];
  function sCol(s) { for (var i = 0; i < SERIES.length; i++) if (SERIES[i][0] === s) return SERIES[i][2]; return "#a8a5a0"; }
  function dateText(d, t) {
    if (!d) return "Datum wählen";
    var a = d.split("-"), x = new Date(+a[0], a[1] - 1, +a[2]);
    var s = WDL[x.getDay()] + ", " + x.getDate() + ". " + MO[x.getMonth()] + " " + x.getFullYear();
    if (t) { var h = t.split(":"); s += " · " + (+h[0]) + (h[1] !== "00" ? ":" + h[1] : "") + " Uhr"; }
    return s;
  }
  var form = $("[data-pt-form]"), photo = "";
  $("[data-pt-chips]").innerHTML = SERIES.map(function (s, i) {
    return '<label><input type="radio" name="s" value="' + s[0] + '"' + (i === 0 ? " checked" : "") + '><span style="--c:' + s[2] + '">' + esc(s[1]) + "</span></label>";
  }).join("");
  function preview() {
    var f = form.elements;
    $("[data-pt-pv-t]").textContent = f.title.value.trim() || "Dein Event";
    $("[data-pt-pv-d]").textContent = dateText(f.d.value, f.t.value);
    $("[data-pt-pv]").style.setProperty("--c", sCol(f.s.value));
    var im = $("[data-pt-pv-img]"); im.hidden = !photo; if (photo) im.src = photo;
    var di = $("[data-pt-img]"); di.hidden = !photo; if (photo) di.src = photo;
    $(".pf__empty", form).hidden = !!photo;
  }
  form.addEventListener("input", preview);
  form.addEventListener("change", preview);
  function setPhoto(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = Math.min(1200, img.width), h = Math.round(img.height * w / img.width), c = document.createElement("canvas");
        c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h);
        photo = c.toDataURL("image/jpeg", 0.8); preview();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  var drop = $("[data-pt-drop]");
  $("[data-pt-file]").addEventListener("change", function (e) { setPhoto(e.target.files[0]); });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) { if (e.dataTransfer.files[0]) setPhoto(e.dataTransfer.files[0]); });
  $("[data-pt-sample]").addEventListener("click", function () {
    var f = form.elements, d = new Date(); d.setDate(d.getDate() + 21); while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    f.title.value = "Bunker Rock Fest III"; f.d.value = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    f.t.value = "19:30"; f.sub.value = "mit drei Bands aus dem Mostviertel"; f.s.value = "rock";
    fetch("assets/img/buehne.webp").then(function (r) { return r.blob(); }).then(function (b) { setPhoto(new File([b], "buehne.webp", { type: "image/webp" })); });
    preview();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements, err = $("[data-pt-err]");
    var miss = !f.title.value.trim() ? "Bitte einen Titel eingeben." : !f.d.value ? "Bitte ein Datum wählen." : "";
    if (miss) { err.textContent = miss; err.hidden = false; (f.title.value.trim() ? f.d : f.title).focus(); return; }
    err.hidden = true;
    var list = load(KEY_EV, []);
    list.push({ id: Date.now(), title: f.title.value.trim(), d: f.d.value, t: f.t.value, sub: f.sub.value.trim(), text: "", s: f.s.value, img: photo });
    if (!save(KEY_EV, list)) { err.textContent = "Das Foto ist für die Demo zu groß. Bitte ein kleineres nehmen."; err.hidden = false; return; }
    addFeed("LA", "#4fe6e1", "Lena A. hat „" + f.title.value.trim() + "“ veröffentlicht"); persist();
    form.reset(); photo = ""; preview(); renderMine(); refreshPage();
    toast('<svg aria-hidden="true"><use href="#pi-check"/></svg><span><b>Ist online!</b> Der Termin steht jetzt auf der Webseite.</span><button type="button" data-pt-view>Ansehen</button>');
  });
  toastEl.addEventListener("click", function (e) {
    if (!e.target.closest("[data-pt-view]")) return;
    toastEl.hidden = true;
    var t = document.getElementById("termine");
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? "auto" : "smooth" });
  });
  // Terminliste, Countdown und "Nächstes Event" auf der Seite sofort nachziehen
  function refreshPage() { if (window.bunkerEvents) window.bunkerEvents.refresh(); renderHome(); }
  function renderMine() {
    var list = load(KEY_EV, []).sort(function (a, b) { return (a.d + a.t).localeCompare(b.d + b.t); });
    $("[data-pt-mine]").innerHTML = list.map(function (ev) {
      return '<li style="--c:' + sCol(ev.s) + '">' + (/^data:image\//.test(ev.img || "") ? '<img src="' + esc(ev.img) + '" alt="">' : '<span class="noimg"></span>') +
        "<div><b>" + esc(ev.title) + "</b><small>" + esc(dateText(ev.d, ev.t)) + "</small></div>" +
        '<button class="xbtn" type="button" data-del="' + esc(ev.id) + '" aria-label="' + esc(ev.title) + ' löschen"><svg aria-hidden="true"><use href="#pi-x"/></svg></button></li>';
    }).join("");
    $("[data-pt-mine-empty]").hidden = list.length > 0;
  }
  $("[data-pt-mine]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-del]"); if (!b) return;
    save(KEY_EV, load(KEY_EV, []).filter(function (ev) { return String(ev.id) !== b.getAttribute("data-del"); }));
    renderMine(); refreshPage();
  });

  // ---------- Helfer ----------
  function shiftOf(nr) { for (var i = 0; i < S.help.length; i++) if (S.help[i].who.indexOf(nr) > -1) return S.help[i]; return null; }
  function renderHelp() {
    $("[data-pt-ev]").textContent = nextEvent().title;
    $("[data-pt-shifts]").innerHTML = S.help.map(function (h) {
      var full = h.who.length >= h.need, pct = Math.min(100, h.who.length / h.need * 100);
      var cand = S.mem.filter(function (m) { return h.who.indexOf(m.nr) < 0; });
      function opt(m) {
        var o = shiftOf(m.nr);
        return '<li role="option" tabindex="-1" aria-selected="false" data-nr="' + m.nr + '"' + (o ? ' class="is-busy"' : "") + ">" + av(m.nr) +
          "<span><b>" + esc(m.name) + "</b><small>" + (o ? "schon bei " + esc(o.t) : esc(m.role)) + "</small></span></li>";
      }
      var free = cand.filter(function (m) { return !shiftOf(m.nr); }), busy = cand.filter(function (m) { return shiftOf(m.nr); });
      var opts = (free.length ? '<li class="dd__grp" role="presentation">Noch frei</li>' + free.map(opt).join("") : "") +
        (busy.length ? '<li class="dd__grp" role="presentation">Schon eingeteilt</li>' + busy.map(opt).join("") : "");
      return '<article class="sh' + (full ? " is-full" : "") + '" data-sh="' + h.id + '">' +
        '<div class="sh__hd"><div><b>' + esc(h.t) + "</b><small>" + esc(h.w) + '</small></div><span class="sh__n">' + (full ? "voll" : h.who.length + " von " + h.need) + "</span></div>" +
        '<div class="sh__bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="sh__who">' + h.who.map(function (nr) {
          var m = mem(nr); if (!m) return "";
          return '<span class="hc">' + av(nr) + esc(short(m.name)) + '<button type="button" data-un="' + nr + '" aria-label="' + esc(m.name) + ' austragen"><svg aria-hidden="true"><use href="#pi-x"/></svg></button></span>';
        }).join("") + "</div>" +
        (full ? "" : '<div class="dd" data-dd><button type="button" class="dd__btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="dd-' + h.id + '" aria-label="Jemand für ' + esc(h.t) + ' eintragen"><span>Jemand eintragen</span><svg aria-hidden="true"><use href="#pi-plus"/></svg></button>' +
          '<ul class="dd__list" id="dd-' + h.id + '" role="listbox" aria-label="Mitglied für ' + esc(h.t) + ' wählen" hidden>' + opts + "</ul></div>") +
        "</article>";
    }).join("");
    badges();
  }
  // Eigene Auswahlliste im Glas-Stil statt der grauen Systemliste
  var ddOpen = null;
  function ddClose(focusBtn) {
    if (!ddOpen) return;
    var d = ddOpen; ddOpen = null;
    d.classList.remove("is-open"); d.closest(".sh").classList.remove("is-dd");
    $(".dd__btn", d).setAttribute("aria-expanded", "false"); $(".dd__list", d).hidden = true;
    if (focusBtn) $(".dd__btn", d).focus({ preventScroll: true });
  }
  function ddShow(d) {
    ddClose(false); ddOpen = d;
    var list = $(".dd__list", d);
    d.classList.add("is-open"); d.closest(".sh").classList.add("is-dd");
    $(".dd__btn", d).setAttribute("aria-expanded", "true"); list.hidden = false;
    // Das Portal-Fenster schneidet ab: unten zu wenig Platz → Liste klappt nach oben auf
    var box = $("[data-pt]").getBoundingClientRect(), r = $(".dd__btn", d).getBoundingClientRect();
    list.style.maxHeight = "";
    var want = Math.min(288, list.scrollHeight), below = box.bottom - r.bottom - 22, above = r.top - box.top - 22;
    var up = below < want && above > below;
    d.classList.toggle("up", up);
    list.style.maxHeight = Math.max(140, Math.min(288, up ? above : below)) + "px";
    var first = $('[role="option"]', list); if (first) first.focus({ preventScroll: true });
    // Liste ganz sichtbar machen, falls sie aus dem Bild ragt
    var lr = list.getBoundingClientRect(), room = window.innerHeight - 80;
    if (lr.bottom > room) window.scrollBy({ top: lr.bottom - room, behavior: reduce ? "auto" : "smooth" });
    else if (lr.top < 80) window.scrollBy({ top: lr.top - 80, behavior: reduce ? "auto" : "smooth" });
  }
  function ddPick(li) {
    var h = S.help.filter(function (x) { return x.id === li.closest("[data-sh]").getAttribute("data-sh"); })[0], nr = +li.getAttribute("data-nr"), m = mem(nr);
    ddOpen = null;
    h.who.push(nr); addFeed(ini(m.name), colOf(nr), short(m.name) + " ist bei „" + h.t + "“ eingeteilt"); persist(); renderHelp();
    toast('<svg aria-hidden="true"><use href="#pi-hand"/></svg><span>' + esc(short(m.name)) + " bekommt am Vortag eine Erinnerung.</span>");
    var btn = $('[data-sh="' + h.id + '"] .dd__btn'); if (btn) btn.focus({ preventScroll: true });
  }
  $("[data-pt-shifts]").addEventListener("keydown", function (e) {
    var d = e.target.closest("[data-dd]"); if (!d) return;
    if (e.target.classList.contains("dd__btn") && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); ddShow(d); return; }
    if (!ddOpen) return;
    var items = $$('[role="option"]', d), i = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); ddClose(true); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var n = items[Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))]; if (n) n.focus({ preventScroll: false }); }
    else if ((e.key === "Enter" || e.key === " ") && i > -1) { e.preventDefault(); ddPick(items[i]); }
    else if (e.key === "Tab") ddClose(false);
  });
  $("[data-pt-shifts]").addEventListener("focusin", function (e) {
    var li = e.target.closest('[role="option"]'); if (!li) return;
    $$('[role="option"]', li.parentNode).forEach(function (x) { x.setAttribute("aria-selected", String(x === li)); });
  });
  document.addEventListener("click", function (e) { if (ddOpen && !ddOpen.contains(e.target)) ddClose(false); });
  $("[data-pt-shifts]").addEventListener("click", function (e) {
    var bt = e.target.closest(".dd__btn");
    if (bt) { var d = bt.closest("[data-dd]"); if (ddOpen === d) ddClose(false); else ddShow(d); return; }
    var li = e.target.closest('[role="option"]'); if (li) { ddPick(li); return; }
    var b = e.target.closest("[data-un]"); if (!b) return;
    var h = S.help.filter(function (x) { return x.id === b.closest("[data-sh]").getAttribute("data-sh"); })[0];
    h.who = h.who.filter(function (n) { return n !== +b.getAttribute("data-un"); }); persist(); renderHelp();
  });

  // ---------- Mitglieder ----------
  var filter = "alle", q = $("[data-pt-q]");
  function setFilter(f) { filter = f; $$("[data-f]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-f") === f)); }); renderMem(); }
  $("[data-pt-mf]").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (b) setFilter(b.getAttribute("data-f")); });
  q.addEventListener("input", renderMem);
  function renderMem() {
    var s = q.value.trim().toLowerCase();
    var list = S.mem.filter(function (m) { return (filter === "alle" || !m.paid) && (!s || (m.name + " " + m.role).toLowerCase().indexOf(s) > -1); });
    $("[data-pt-mem-list]").innerHTML = list.length ? list.map(function (m) {
      return "<li>" + av(m.nr) + "<div><b>" + esc(m.name) + "</b><small>" + esc(m.role) + "</small></div>" +
        (m.paid ? '<span class="badge badge--ok">bezahlt</span><span></span>' :
          '<span class="badge badge--due">25 € offen</span><span class="mem__act"><button class="mbtn" type="button" data-rem="' + m.nr + '"' + (m.rem ? " disabled" : "") + ">" + (m.rem ? "Erinnert" : "Erinnern") + '</button><button class="mbtn" type="button" data-paid="' + m.nr + '">Bezahlt</button></span>') +
        "</li>";
    }).join("") : '<li class="mem__none">' + (filter === "offen" && !s ? "Alle Beiträge sind bezahlt. Sauber!" : "Niemand gefunden.") + "</li>";
  }
  $("[data-pt-mem-list]").addEventListener("click", function (e) {
    var r = e.target.closest("[data-rem]"), p = e.target.closest("[data-paid]");
    if (r) {
      var m = mem(+r.getAttribute("data-rem")); m.rem = true; persist(); renderMem();
      toast('<svg aria-hidden="true"><use href="#pi-mail"/></svg><span>Erinnerung mit Zahlschein an ' + esc(short(m.name)) + " geschickt.</span>");
    }
    if (p) {
      var n = mem(+p.getAttribute("data-paid")); n.paid = true; delete n.rem;
      S.cash.push({ d: today(), t: "Mitgliedsbeitrag " + short(n.name), a: 25, n: 1 });
      addFeed(ini(n.name), colOf(n.nr), short(n.name) + " hat den Beitrag bezahlt (25 €)"); persist(); renderMem();
      toast('<svg aria-hidden="true"><use href="#pi-check"/></svg><span>Bezahlt. 25 € stehen schon im Kassabuch.</span>');
    }
  });

  // ---------- Kassa ----------
  function renderCash() {
    var cs = cashSums();
    $("[data-pt-in]").textContent = euro0(cs.inn); $("[data-pt-ausg]").textContent = euro0(cs.out); $("[data-pt-total]").textContent = euro(cs.tot);
    var list = S.cash.map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) { return b.c.d.localeCompare(a.c.d) || b.i - a.i; });
    $("[data-pt-book]").innerHTML = list.map(function (x) {
      var c = x.c; return '<li class="' + (c.a >= 0 ? "in" : "out") + (c.n ? " flash" : "") + '"><time datetime="' + c.d + '">' + dShort(c.d) + "</time><span>" + esc(c.t) + "</span><b>" + (c.a >= 0 ? "+" : "") + euro(c.a) + "</b></li>";
    }).join("");
    S.cash.forEach(function (c) { delete c.n; });
  }
  $("[data-pt-cash-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, a = parseFloat(String(f.amt.value).replace(/\./g, "").replace(",", "."));
    if (!f.txt.value.trim()) { f.txt.focus(); return; }
    if (!(a > 0)) { f.amt.focus(); f.amt.select(); return; }
    if (f.dir.value === "out") a = -a;
    S.cash.push({ d: today(), t: f.txt.value.trim(), a: Math.round(a * 100) / 100, n: 1 });
    addFeed("LA", "#4fe6e1", "Lena A. hat das Kassabuch ergänzt: " + f.txt.value.trim()); persist();
    e.target.reset(); renderCash();
  });
  $("[data-pt-csv]").addEventListener("click", function () {
    var rows = [["Datum", "Text", "Betrag"]].concat(S.cash.slice().sort(function (a, b) { return a.d.localeCompare(b.d); }).map(function (c) {
      return [c.d.split("-").reverse().join("."), c.t, c.a.toFixed(2).replace(".", ",")];
    }));
    var txt = "﻿" + rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";"); }).join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" })); a.download = "kassabuch-bunker-kollektiv.csv";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('<svg aria-hidden="true"><use href="#pi-down"/></svg><span>Kassabuch heruntergeladen, für Rechnungsprüfer oder Steuerberatung.</span>');
  });

  // ---------- Anfragen ----------
  var BEISPIELE = [
    { art: "Bunker mieten", at: "2026-10-18T17:42:00", beispiel: true, felder: { Anlass: "Geburtstag", Wunschtermin: "2026-11-21", Personen: "45", Name: "Lisa Gruber", "E-Mail": "lisa@example.at", Nachricht: "30er-Feier, gern mit eigener Playlist über die Anlage." } },
    { art: "Spiel bei uns", at: "2026-10-16T21:05:00", beispiel: true, felder: { Band: "Rostfrei", Genre: "Punkrock", Zeitraum: "Frühling", Name: "Max", "E-Mail": "band@example.at" } },
    { art: "Mitglied werden", at: "2026-10-12T10:20:00", beispiel: true, felder: { Hilfe: "Bar, Aufbau", Name: "Paul Brandstetter", "E-Mail": "paul@example.at" } }
  ];
  var ANF_C = { "Bunker mieten": ["M", "#4fe6e1"], "Spiel bei uns": ["B", "#ff3d9a"], "Mitglied werden": ["+", "#ffb547"] };
  function renderAnf() {
    var own = ownAnf(), all = own.concat(BEISPIELE), names = S.mem.map(function (m) { return m.name; });
    $("[data-pt-anf]").innerHTML = all.map(function (a, k) {
      var d = new Date(a.at), when = d.getDate() + ". " + MO[d.getMonth()] + ", " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " Uhr", ic = ANF_C[a.art] || ["?", "#a8a5a0"];
      var fe = a.felder || {}, rows = Object.keys(fe).map(function (key) { return "<dt>" + esc(key) + "</dt><dd>" + esc(key === "Wunschtermin" ? dateText(fe[key]) : fe[key]) + "</dd>"; }).join("");
      var btns = (fe["E-Mail"] ? '<a class="mbtn" href="mailto:' + esc(fe["E-Mail"]) + '">Antworten</a>' : "") +
        (a.art === "Mitglied werden" && fe.Name ? (names.indexOf(fe.Name) > -1 ? '<button class="mbtn" type="button" disabled>Aufgenommen</button>' : '<button class="mbtn" type="button" data-join="' + k + '">Als Mitglied aufnehmen</button>') : "");
      return '<li class="' + (a.beispiel ? "" : "is-new") + '" style="--c:' + ic[1] + '"><header><span class="av">' + ic[0] + "</span><div><b>" + esc(a.art) + "</b><small>" + esc(when) + (a.beispiel ? " · Beispiel" : " · neu") + "</small></div></header><dl>" + rows + '</dl><div class="anf2__btns">' + btns + "</div></li>";
    }).join("");
    badges();
  }
  $("[data-pt-anf]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-join]"); if (!b) return;
    var a = ownAnf().concat(BEISPIELE)[+b.getAttribute("data-join")], nr = S.mem.reduce(function (x, m) { return Math.max(x, m.nr); }, 0) + 1;
    S.mem.push({ nr: nr, name: a.felder.Name, role: a.felder.Hilfe || "Neu dabei", paid: false });
    addFeed(ini(a.felder.Name), colOf(nr), short(a.felder.Name) + " ist jetzt Mitglied"); persist(); renderAnf();
    toast('<svg aria-hidden="true"><use href="#pi-users"/></svg><span>' + esc(short(a.felder.Name)) + ' ist aufgenommen, mit Willkommensmail und Zahlschein.</span><button type="button" data-go-mem>Ansehen</button>');
  });
  toastEl.addEventListener("click", function (e) { if (e.target.closest("[data-go-mem]")) { toastEl.hidden = true; setFilter("alle"); showTab("mitglieder"); } });

  function render(name) {
    if (name === "home") renderHome();
    else if (name === "termine") { renderMine(); preview(); }
    else if (name === "helfer") renderHelp();
    else if (name === "mitglieder") renderMem();
    else if (name === "kassa") renderCash();
    else if (name === "anfragen") renderAnf();
    badges();
  }

  // ---------- Anmeldung mit Code (Demo: jeder Code passt außer 000000) ----------
  var lgn = $("[data-pt-login]"), card = $(".pl__card", lgn), otp = $("[data-otp]", lgn), oIn = $$("input", otp), oCell = $$(".otp__c", otp), oAnim = [], oBusy = false;
  var lT = $(".pl__t", lgn), lS = $(".pl__s", lgn), oSt = $(".otp__st", lgn), lTxt = [lT.innerHTML, lS.textContent];
  function signedIn(on) {
    $("[data-pt-who]").hidden = !on; $("[data-pt-out]").hidden = !on;
    try { if (on) sessionStorage.setItem("bunkerPortalIn", "1"); else sessionStorage.removeItem("bunkerPortalIn"); } catch (e) {}
  }
  function lgnClose(now) {
    lgn.classList.add("out");
    setTimeout(function () { lgn.hidden = true; }, now || reduce ? 0 : 450);
    requestAnimationFrame(function () { placeBlob(cur, false); });
  }
  function lgnOpen() {
    lgn.hidden = false; lgn.classList.remove("out"); card.classList.remove("is-ok", "is-bad", "is-busy");
    $("[data-pl-1]").hidden = false; $("[data-pl-2]").hidden = true; $("[data-pl-skip]").hidden = false;
    otp.classList.remove("chk", "merge", "one", "done", "bad"); oAnim.forEach(function (a) { a.cancel(); }); oAnim = [];
    oIn.forEach(function (i) { i.value = ""; i.readOnly = false; }); lT.innerHTML = lTxt[0]; lS.textContent = lTxt[1]; oBusy = false;
  }
  $("[data-pl-1]").addEventListener("submit", function (e) { e.preventDefault(); this.hidden = true; $("[data-pl-2]").hidden = false; oIn[0].focus({ preventScroll: true }); });
  function swapTxt(t, sub) {
    [lT, lS].forEach(function (el) { el.classList.add("swap"); });
    setTimeout(function () { lT.innerHTML = t; lS.textContent = sub; [lT, lS].forEach(function (el) { el.classList.remove("swap"); }); }, reduce ? 0 : 300);
  }
  function at(ms, fn) { setTimeout(fn, reduce ? 0 : ms); }
  function oRun(good, then) {
    oIn.forEach(function (i) { i.blur(); i.readOnly = true; });
    card.classList.add("is-busy"); otp.classList.add("chk");
    at(760, function () {
      var r = otp.getBoundingClientRect(), mid = r.left + r.width / 2;
      otp.classList.add("merge");
      oAnim = oCell.map(function (c, k) {
        var b = c.getBoundingClientRect(), dx = mid - b.left - b.width / 2, rot = (k - 2.5) * 5;
        return c.animate([{ transform: "none" }, { transform: "translateX(" + dx * 0.9 + "px) rotate(" + rot * 1.5 + "deg)", offset: 0.72 }, { transform: "translateX(" + dx + "px) rotate(" + rot * 0.6 + "deg)" }],
          { duration: reduce ? 0 : 720, easing: "cubic-bezier(.6,0,.25,1)", fill: "forwards" });
      });
    });
    at(1400, function () { otp.classList.add("one"); });
    at(1520, function () { otp.classList.add(good ? "done" : "bad"); card.classList.add(good ? "is-ok" : "is-bad"); oSt.textContent = good ? "Code bestätigt" : "Code falsch"; });
    at(1700, then);
  }
  function oReset() {
    otp.classList.remove("one", "done", "bad"); card.classList.remove("is-bad");
    oIn.forEach(function (i) { i.value = ""; }); swapTxt(lTxt[0], lTxt[1]); oSt.textContent = "";
    var left = oAnim.length;
    function fin() {
      oAnim.forEach(function (a) { a.cancel(); }); oAnim = [];
      otp.classList.remove("merge", "chk"); card.classList.remove("is-busy");
      oIn.forEach(function (i) { i.readOnly = false; }); oBusy = false; oIn[0].focus({ preventScroll: true });
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
        swapTxt('<svg aria-hidden="true"><use href="#pi-check"/></svg><span>Angemeldet</span>', "Servus Lena, schön dass du da bist.");
        $("[data-pl-skip]").hidden = true; signedIn(true);
        at(1500, function () { lgnClose(false); });
      } else {
        swapTxt('<svg aria-hidden="true"><use href="#pi-x"/></svg><span>Der Code passt nicht</span>', "Bitte noch einmal eingeben. Nach fünf Fehlversuchen wird kurz gesperrt.");
        at(1300, oReset);
      }
    });
  }
  oIn.forEach(function (inp, k) {
    inp.addEventListener("input", function () {
      var v = inp.value.replace(/\D/g, "");
      if (v.length > 1) { v.split("").slice(0, 6 - k).forEach(function (c, j) { oIn[k + j].value = c; }); oIn[Math.min(5, k + v.length)].focus(); }
      else { inp.value = v; if (v && k < 5) oIn[k + 1].focus(); }
      oCheck();
    });
    inp.addEventListener("keydown", function (e) { if (e.key === "Backspace" && !inp.value && k > 0) { oIn[k - 1].value = ""; oIn[k - 1].focus(); e.preventDefault(); } });
  });
  $("[data-otp-fill]").addEventListener("click", function () {
    oIn.forEach(function (i) { i.value = ""; });
    "482915".split("").forEach(function (c, j) { setTimeout(function () { oIn[j].value = c; oIn[j].focus({ preventScroll: true }); if (j === 5) oCheck(); }, reduce ? 0 : 110 * (j + 1)); });
  });
  $("[data-pl-skip]").addEventListener("click", function () { signedIn(true); lgnClose(true); });
  $("[data-pt-out]").addEventListener("click", function () { signedIn(false); lgnOpen(); });
  var wasIn = false; try { wasIn = sessionStorage.getItem("bunkerPortalIn") === "1"; } catch (e) {}
  if (wasIn) { lgn.hidden = true; signedIn(true); }

  // ---------- Links zur alten Verwaltung führen in V2 ins Portal ----------
  function openPortal(tab) {
    var dlg = document.querySelector("dialog[open]"); if (dlg) dlg.close();
    showTab(tab || "home");
    var el = document.getElementById("portal");
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  document.addEventListener("click", function (e) {
    if (!isV2()) return;
    var a = e.target.closest('a[href^="verwaltung/"]'); if (!a) return;
    e.preventDefault();
    openPortal(/#anfragen/.test(a.getAttribute("href")) ? "anfragen" : a.closest(".foot") ? "home" : "termine");
  });
  window.addEventListener("storage", function (e) { if (e.key === KEY_ANF) badges(); });
  document.addEventListener("submit", function (e) { if (e.target.closest("dialog")) setTimeout(function () { badges(); }, 0); });

  // Nach "Ansehen" eines neuen Termins zur Terminliste springen
  var jump = null; try { jump = sessionStorage.getItem("bunkerJump"); sessionStorage.removeItem("bunkerJump"); } catch (e) {}
  if (jump) setTimeout(function () { var t = document.getElementById(jump); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: "instant" }); }, 300);

  showTab("home");
  last = null; requestAnimationFrame(function () { placeBlob(cur, false); });
})();
