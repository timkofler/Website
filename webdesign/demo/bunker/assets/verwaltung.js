// bunker.kollektiv · Verwaltung (Demo)
// Termine mit Foto eintragen, Live-Vorschau, Anfragen ansehen. Gespeichert wird nur im Browser (localStorage).
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll("svg").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  var KEY_EV = "bunkerDemoEvents", KEY_ANF = "bunkerDemoAnfragen";
  var SERIES = [
    ["misc", "Special", "#a8a5a0"], ["rock", "Rock", "#ff6a3d"], ["gassl", "Gasslfestival", "#b6f23a"], ["punx", "Punx Revival", "#ff3d9a"],
    ["metal", "Metal Night", "#ff3b30"], ["bass", "Bass Music", "#9b6bff"], ["kart", "Mario Kart", "#ffd23f"], ["art", "Collective Art", "#4fe6e1"],
    ["halloween", "Halloween", "#ff8a2b"], ["pop", "Pop", "#7ad3ff"]
  ];
  var WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var MO = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "[]") || []; } catch (e) { return []; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function colorOf(s) { for (var i = 0; i < SERIES.length; i++) if (SERIES[i][0] === s) return SERIES[i][2]; return "#a8a5a0"; }
  function dateText(d, t) {
    if (!d) return "Datum wählen";
    var a = d.split("-"), x = new Date(+a[0], a[1] - 1, +a[2]);
    var txt = WDL[x.getDay()] + ", " + x.getDate() + ". " + MO[x.getMonth()] + " " + x.getFullYear();
    if (t) { var h = t.split(":"); txt += " · " + (+h[0]) + (h[1] !== "00" ? ":" + h[1] : "") + " Uhr"; }
    return txt;
  }

  // ---- Reiter ----------------------------------------------------------
  function showTab(name) {
    document.querySelectorAll("[data-tab]").forEach(function (b) {
      var on = b.getAttribute("data-tab") === name;
      b.setAttribute("aria-selected", on ? "true" : "false");
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
  }
  document.querySelectorAll("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () { var n = b.getAttribute("data-tab"); showTab(n); history.replaceState(null, "", n === "termine" ? location.pathname : "#" + n); });
  });
  if (location.hash === "#anfragen") showTab("anfragen");

  // ---- Formular + Vorschau --------------------------------------------
  var form = $("#ev-form"), photo = "";
  var chips = $("[data-series-chips]");
  chips.innerHTML = SERIES.map(function (s, i) {
    return '<label><input type="radio" name="s" value="' + s[0] + '"' + (i === 0 ? " checked" : "") + '><span style="--c:' + s[2] + '">' + esc(s[1]) + "</span></label>";
  }).join("");

  function preview() {
    var f = form.elements;
    $("[data-pv-title]").textContent = f.title.value.trim() || "Dein Event";
    $("[data-pv-date]").textContent = dateText(f.d.value, f.t.value);
    $("[data-pv-text]").textContent = f.text.value.trim() || f.sub.value.trim() || "Hier steht, was die Leute erwartet.";
    $("[data-pv]").style.setProperty("--c", colorOf(f.s.value));
    var im = $("[data-pv-img]");
    im.hidden = !photo; if (photo) im.src = photo;
  }
  form.addEventListener("input", preview);
  form.addEventListener("change", preview);

  // Foto verkleinern (max. 1400 px breit), damit es schnell lädt
  function setPhoto(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = Math.min(1400, img.naturalWidth), h = Math.round(img.naturalHeight * w / img.naturalWidth);
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        var url = c.toDataURL("image/webp", 0.8);
        if (url.indexOf("data:image/webp") !== 0) url = c.toDataURL("image/jpeg", 0.82);
        photo = url;
        var di = $("[data-drop-img]"); di.src = url; di.hidden = false;
        $(".drop__empty").hidden = true; $(".drop__change").hidden = false;
        $("[data-drop]").classList.add("has-img");
        preview();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  $("[data-file]").addEventListener("change", function (e) { setPhoto(e.target.files[0]); });
  var drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) { if (e.dataTransfer.files[0]) setPhoto(e.dataTransfer.files[0]); });

  // Beispiel ausfüllen (mit einem Foto aus dem Bunker)
  $("[data-sample]").addEventListener("click", function () {
    var f = form.elements, d = new Date(); d.setDate(d.getDate() + 3);
    f.title.value = "Bunker Rock Fest";
    f.d.value = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    f.t.value = "20:00";
    f.sub.value = "Planet Error, Traincorn & Bouncing Pistols";
    f.text.value = "Drei Bands, ein Keller, null Ausreden. Einlass ab 19 Uhr, Eintritt freiwillige Spende.";
    form.querySelector('input[name="s"][value="rock"]').checked = true;
    fetch("../assets/img/buehne.webp").then(function (r) { return r.blob(); }).then(function (b) { setPhoto(new File([b], "buehne.webp", { type: "image/webp" })); });
    preview();
  });

  function toast(html) {
    var t = $("[data-toast]"); t.innerHTML = html; t.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 6000);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements, err = $("[data-err]");
    var miss = !f.title.value.trim() ? "Bitte einen Titel eingeben." : !f.d.value ? "Bitte ein Datum wählen." : "";
    if (miss) { err.textContent = miss; err.hidden = false; (f.title.value.trim() ? f.d : f.title).focus(); return; }
    err.hidden = true;
    var list = load(KEY_EV);
    list.push({ id: Date.now(), title: f.title.value.trim(), d: f.d.value, t: f.t.value, sub: f.sub.value.trim(), text: f.text.value.trim(), s: f.s.value, img: photo });
    try { save(KEY_EV, list); } catch (x) { err.textContent = "Das Foto ist für die Demo zu groß. Bitte ein kleineres nehmen."; err.hidden = false; return; }
    toast("<b>Ist online!</b> Der Termin steht jetzt auf der Webseite. <a href=\"../#termine\">Ansehen →</a>");
    form.reset(); photo = "";
    $("[data-drop-img]").hidden = true; $(".drop__empty").hidden = false; $(".drop__change").hidden = true; $("[data-drop]").classList.remove("has-img");
    preview(); renderList();
    $(".adm__list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---- Eigene Termine --------------------------------------------------
  function renderList() {
    var list = load(KEY_EV).sort(function (a, b) { return (a.d + a.t).localeCompare(b.d + b.t); });
    $("[data-list]").innerHTML = list.map(function (ev) {
      return '<li style="--c:' + colorOf(ev.s) + '">' + (/^data:image\//.test(ev.img || "") ? '<img src="' + esc(ev.img) + '" alt="">' : '<span class="adm__noimg"></span>') +
        "<div><b>" + esc(ev.title) + "</b><small>" + esc(dateText(ev.d, ev.t)) + "</small></div>" +
        '<button type="button" data-del="' + esc(ev.id) + '" aria-label="' + esc(ev.title) + ' löschen">Löschen</button></li>';
    }).join("");
    $("[data-list-empty]").hidden = list.length > 0;
  }
  $("[data-list]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-del]"); if (!b) return;
    save(KEY_EV, load(KEY_EV).filter(function (ev) { return String(ev.id) !== b.getAttribute("data-del"); }));
    renderList();
  });

  // ---- Anfragen --------------------------------------------------------
  var BEISPIELE = [
    { art: "Bunker mieten", at: "2026-10-18T17:42:00", beispiel: true, felder: { Anlass: "Geburtstag", Wunschtermin: "2026-11-21", Personen: "45", Name: "Lisa Gruber", "E-Mail": "lisa@example.at", Nachricht: "30er-Feier, gern mit eigener Playlist über die Anlage." } },
    { art: "Spiel bei uns", at: "2026-10-16T21:05:00", beispiel: true, felder: { Band: "Rostfrei", Genre: "Punkrock", Link: "https://example.at/rostfrei", Zeitraum: "Frühling", Name: "Max", "E-Mail": "band@example.at" } }
  ];
  function renderAnf() {
    var own = load(KEY_ANF), all = own.concat(BEISPIELE);
    var cnt = $("[data-anf-count]"); cnt.textContent = own.length ? own.length : ""; cnt.hidden = !own.length;
    var icon = { "Bunker mieten": ["M", "#4fe6e1"], "Spiel bei uns": ["B", "#ff3d9a"], "Mitglied werden": ["+", "#b6f23a"] };
    $("[data-anf]").innerHTML = all.map(function (a) {
      var d = new Date(a.at), when = d.getDate() + ". " + MO[d.getMonth()] + ", " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " Uhr";
      var rows = Object.keys(a.felder || {}).map(function (k) {
        var v = a.felder[k];
        if (k === "Wunschtermin") v = dateText(v);
        return "<dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd>";
      }).join("");
      var mail = (a.felder || {})["E-Mail"];
      return '<li class="anf__item' + (a.beispiel ? "" : " is-new") + '" style="--c:' + (icon[a.art] || ["", "#a8a5a0"])[1] + '"><header><span class="anf__ic" aria-hidden="true">' + (icon[a.art] || ["?"])[0] + "</span><div><b>" + esc(a.art) + "</b><small>" + esc(when) + (a.beispiel ? " · Beispiel" : " · neu") + "</small></div></header><dl>" + rows + "</dl>" +
        (mail ? '<a class="link" href="mailto:' + esc(mail) + '">Antworten</a>' : "") + "</li>";
    }).join("");
  }

  preview(); renderList(); renderAnf();
})();
