// Proibito · Steinofen-Pizzeria – Bestellen wie bei einem Lieferdienst, nur edler.
// Karte mit Kategorien und Suche, Gerichte anpassen, Warenkorb mit Lieferzonen und Mindestbestellwert,
// Kasse und Live-Verfolgung. Alles bleibt im Browser, es wird nichts verschickt.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desk = window.matchMedia("(min-width:1000px)");
  var IMG = "/beispiele/pizzeria/bilder/";
  var eur = function (c) { return (c / 100).toFixed(2).replace(".", ",") + " €"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  var CATS = [
    { id: "antipasti", n: "Antipasti", p: "Zum Teilen, bevor der Ofen ruft." },
    { id: "pizza", n: "Pizze", p: "Ø 30 cm aus dem Steinofen, als Famiglia mit Ø 40 cm." },
    { id: "pasta", n: "Pasta", p: "Jeden Morgen frisch gemacht, in der eigenen Werkstatt." },
    { id: "dolci", n: "Dolci", p: "Für den süßen Abschluss." },
    { id: "bevande", n: "Bevande", p: "Wein aus Italien und die Klassiker dazu." }
  ];
  var ROM = ["I", "II", "III", "IV", "V"];
  var MENU = [
    { id: "burrata", cat: "antipasti", n: "Burrata Pugliese", d: "Cremige Burrata aus Apulien, Kirschtomaten, Basilikumöl, geröstetes Brot aus dem Ofen.", p: 1290, img: "v-burrata", tags: ["veg"] },
    { id: "focaccia", cat: "antipasti", n: "Focaccia dal Forno", d: "Direkt aus dem Steinofen, mit Rosmarin, Meersalz und kaltgepresstem Olivenöl.", p: 650, tags: ["veg"] },
    { id: "tonnato", cat: "antipasti", n: "Vitello Tonnato", d: "Zartes Kalbfleisch, Thunfisch-Kapern-Sauce, Rucola.", p: 1450 },
    { id: "proibita", cat: "pizza", n: "Pizza Proibita", d: "Die Pizza, die auf keiner Karte steht: schwarzer Trüffel, Fior di Latte, Akazienhonig, Pecorino.", p: 2290, img: "p-proibita", tags: ["secret"], opt: "pizza", secret: true },
    { id: "margherita", cat: "pizza", n: "Margherita", d: "San-Marzano-Tomaten, Fior di Latte, frisches Basilikum, Olivenöl. Die Königin.", p: 1090, img: "p-margherita", tags: ["veg", "top"], opt: "pizza" },
    { id: "bufala", cat: "pizza", n: "Bufala", d: "Büffelmozzarella DOP, San Marzano, Basilikum. Der Rand ist ein Gedicht.", p: 1390, img: "p-bufala", tags: ["veg"], opt: "pizza" },
    { id: "diavola", cat: "pizza", n: "Diavola", d: "Scharfe Salami Spianata, Fior di Latte, Chili, Basilikum.", p: 1350, img: "p-diavola", tags: ["chili"], opt: "pizza" },
    { id: "contrabbando", cat: "pizza", n: "Il Contrabbandiere", d: "Salame Napoli, Nduja aus Kalabrien, Fior di Latte, ein Hauch Chili-Honig.", p: 1550, img: "p-rustica", tags: ["chili", "top"], opt: "pizza" },
    { id: "capricciosa", cat: "pizza", n: "Capricciosa", d: "Kochschinken, Champignons, Artischocken, Oliven, Fior di Latte.", p: 1450, img: "p-capricciosa", opt: "pizza" },
    { id: "stagioni", cat: "pizza", n: "Quattro Stagioni", d: "Vier Jahreszeiten, vier Viertel: Salami, Pilze, Schinken und vier Käse.", p: 1490, img: "p-quattro", opt: "pizza" },
    { id: "crudo", cat: "pizza", n: "Crudo e Rucola", d: "Prosciutto di Parma 24 Monate, Rucola, gehobelter Grana, nach dem Backen belegt.", p: 1590, img: "p-rucola-2", opt: "pizza" },
    { id: "carbonara", cat: "pasta", n: "Spaghetti Carbonara", d: "Guanciale, Eigelb, Pecorino Romano, schwarzer Pfeffer. Ohne Sahne, Ehrensache.", p: 1450, img: "a-carbonara", tags: ["top"], opt: "pasta" },
    { id: "tartufo", cat: "pasta", n: "Tagliatelle al Tartufo", d: "Hausgemachte Tagliatelle, Butter, Parmigiano und frisch gehobelter Trüffel.", p: 2190, img: "a-tartufo", tags: ["veg"], opt: "pasta" },
    { id: "lasagne", cat: "pasta", n: "Lasagne della Nonna", d: "Sechs Stunden geschmortes Ragù, Béchamel, im Steinofen gratiniert.", p: 1490, img: "a-lasagne", opt: "pasta" },
    { id: "pomodoro", cat: "pasta", n: "Spaghetti al Pomodoro", d: "San-Marzano-Tomaten, Knoblauch, Basilikum, bestes Olivenöl.", p: 1190, img: "a-pomodoro", tags: ["veg"], opt: "pasta" },
    { id: "bolognese", cat: "pasta", n: "Spaghetti alla Bolognese", d: "Ragù vom Rind und Schwein, langsam gekocht, mit Parmigiano.", p: 1350, img: "a-bolognese", opt: "pasta" },
    { id: "arrabbiata", cat: "pasta", n: "Penne all’Arrabbiata", d: "Tomaten, Knoblauch und eine ordentliche Portion Peperoncino.", p: 1150, img: "a-arrabbiata", tags: ["veg", "chili"], opt: "pasta" },
    { id: "aglio", cat: "pasta", n: "Aglio, Olio e Peperoncino", d: "Spaghetti mit Knoblauch, Olivenöl, Chili und Petersilie. Einfach, ehrlich.", p: 1090, img: "a-aglio", tags: ["veg", "chili"], opt: "pasta" },
    { id: "tiramisu", cat: "dolci", n: "Tiramisù", d: "Mascarpone, Savoiardi, Espresso, Kakao. Nach Rezept der Nonna.", p: 750, img: "d-tiramisu", tags: ["veg"] },
    { id: "cannoli", cat: "dolci", n: "Cannoli Siciliani", d: "Knusprige Röllchen mit Ricotta, Pistazie und kandierter Orange.", p: 690, tags: ["veg"] },
    { id: "affogato", cat: "dolci", n: "Affogato al Caffè", d: "Vanilleeis, mit heißem Espresso übergossen.", p: 590, tags: ["veg"] },
    { id: "chianti", cat: "bevande", n: "Chianti Classico DOCG", d: "Toskana, 0,75 l. Kirsche, Veilchen, feine Würze.", p: 2900, img: "g-wein" },
    { id: "primitivo", cat: "bevande", n: "Primitivo di Manduria", d: "Apulien, 0,75 l. Dunkle Beeren, samtig und kräftig.", p: 3200 },
    { id: "pellegrino", cat: "bevande", n: "San Pellegrino", d: "Mineralwasser mit Kohlensäure, 0,75 l.", p: 490 },
    { id: "chinotto", cat: "bevande", n: "Chinotto", d: "Bittersüße Limonade aus Bitterorangen, 0,33 l.", p: 390 },
    { id: "moretti", cat: "bevande", n: "Birra Moretti", d: "Italienisches Lagerbier, 0,33 l.", p: 390 }
  ];
  var BY = {}; MENU.forEach(function (m) { BY[m.id] = m; });
  var SIZES = [["classico", "Classico", "Ø 30 cm", 0], ["famiglia", "Famiglia", "Ø 40 cm, reicht für zwei", 700]];
  var EXTRAS = {
    pizza: [["bufala", "Büffelmozzarella DOP", 250], ["nduja", "Nduja aus Kalabrien", 200], ["crudo", "Prosciutto di Parma", 350], ["tartufo", "Trüffelöl", 290], ["rucola", "Rucola", 100], ["basilico", "Extra Basilikum", 0]],
    pasta: [["parm", "Extra Parmigiano, 24 Monate", 150], ["gf", "Glutenfreie Pasta", 200], ["peperoncino", "Extra Peperoncino", 0]]
  };
  var EXN = {}; Object.keys(EXTRAS).forEach(function (k) { EXTRAS[k].forEach(function (e) { EXN[e[0]] = e; }); });
  var TAGS = {
    veg: '<span class="tag tag--veg"><svg><use href="#i-blatt"/></svg>Veggie</span>',
    chili: '<span class="tag tag--chili"><svg><use href="#i-chili"/></svg>Scharf</span>',
    top: '<span class="tag tag--top"><svg><use href="#i-krone"/></svg>Empfehlung</span>',
    secret: '<span class="tag tag--secret"><svg><use href="#i-schloss"/></svg>Nur für Freunde</span>'
  };

  var ZONES = [
    { n: 1, km: "bis 3 km", orte: ["Musterort Zentrum", "Am Anger", "Lindenau"], min: 1500, fee: 190, t: [25, 35] },
    { n: 2, km: "bis 7 km", orte: ["Hinterberg", "Seebach", "Mühlbach"], min: 2000, fee: 290, t: [35, 45] },
    { n: 3, km: "bis 12 km", orte: ["Kirchdorf", "Steinfeld", "Rothwald"], min: 3000, fee: 390, t: [45, 60] }
  ];
  var FREE = 5000;
  var ORTE = []; ZONES.forEach(function (z) { z.orte.forEach(function (o) { ORTE.push({ n: o, z: z }); }); });
  // Lage der Orte auf der Karte: Abstand vom Lokal (Mitte) und Winkel
  var DOTS = [[40, 215], [44, 320], [42, 115], [95, 20], [100, 160], [92, 250], [152, 300], [150, 130], [155, 235]];

  // Öffnungszeiten (0 = Sonntag), Küche nimmt bis eine halbe Stunde vor Schluss Bestellungen an
  var HOURS = { 0: [[11.5, 14], [17, 23]], 2: [[11.5, 14], [17, 23]], 3: [[11.5, 14], [17, 23]], 4: [[11.5, 14], [17, 23]], 5: [[11.5, 14], [17, 23.5]], 6: [[11.5, 14], [17, 23.5]] };
  var DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var DS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var hm = function (h) { return Math.floor(h) + ":" + pad(Math.round((h % 1) * 60)); };

  // Zustand, pro Sitzung gemerkt
  var st = { mode: "liefern", ort: -1, items: [], unlocked: false };
  try { var saved = JSON.parse(sessionStorage.getItem("proibito") || "null"); if (saved && saved.items) st = saved; } catch (e) {}
  st.items = (st.items || []).filter(function (it) { return BY[it.id]; });
  function save() { try { sessionStorage.setItem("proibito", JSON.stringify(st)); } catch (e) {} }

  var zone = function () { return st.ort >= 0 ? ORTE[st.ort].z : null; };
  function unit(it) {
    var m = BY[it.id], p = m.p;
    if (it.size === "famiglia") p += SIZES[1][3];
    (it.ex || []).forEach(function (x) { p += EXN[x] ? EXN[x][2] : 0; });
    return p;
  }
  function totals() {
    var sub = 0, n = 0;
    st.items.forEach(function (it) { sub += unit(it) * it.q; n += it.q; });
    var z = zone() || ZONES[0], liefern = st.mode === "liefern";
    var disc = liefern ? 0 : Math.round(sub * 0.1);
    var fee = liefern && n && sub < FREE ? z.fee : 0;
    var min = liefern ? z.min : 0;
    return { sub: sub, n: n, disc: disc, fee: fee, min: min, tot: sub - disc + fee, ok: n > 0 && sub >= min && (!liefern || st.ort >= 0) };
  }

  /* ---------- Karte ---------- */
  var menuEl = $("#menu"), catsEl = $("#cats"), qEl = $("#q");
  function dishHTML(m) {
    var tags = (m.tags || []).map(function (t) { return TAGS[t]; }).join("");
    var media = m.img
      ? '<span class="dish-i__m"><img src="' + IMG + m.img + '.webp" alt="" width="480" height="480" loading="lazy"><span class="dish-i__add" aria-hidden="true"><svg><use href="#i-plus"/></svg></span><span class="dish-i__q" data-q></span></span>'
      : '<span class="dish-i__m dish-i__m--none"><span class="dish-i__add" aria-hidden="true"><svg><use href="#i-plus"/></svg></span><span class="dish-i__q" data-q></span></span>';
    var from = m.opt === "pizza" ? "<small>Famiglia " + eur(m.p + SIZES[1][3]) + "</small>" : "";
    return '<li id="d-' + m.id + '"><button type="button" class="dish-i' + (m.secret ? " dish-i--secret" : "") + '" data-id="' + m.id + '" aria-label="' + esc(m.n) + ", " + eur(m.p) + (m.opt ? ", anpassen und hinzufügen" : ", hinzufügen") + '">' +
      '<span class="dish-i__t"><span class="dish-i__n">' + esc(m.n) + (tags ? '<span class="tags">' + tags + "</span>" : "") + '</span><span class="dish-i__d">' + esc(m.d) + '</span><span class="dish-i__p">' + eur(m.p) + from + "</span></span>" +
      media + "</button></li>";
  }
  function renderMenu() {
    var q = (qEl.value || "").trim().toLowerCase(), any = false, html = "";
    CATS.forEach(function (c, i) {
      var list = MENU.filter(function (m) {
        return m.cat === c.id && (!m.secret || st.unlocked) && (!q || (m.n + " " + m.d).toLowerCase().indexOf(q) > -1);
      });
      if (!list.length) return;
      any = true;
      html += '<section class="cat" id="cat-' + c.id + '" aria-labelledby="ch-' + c.id + '"><h3 class="cat__h" id="ch-' + c.id + '"><span>' + ROM[i] + "</span>" + c.n + "</h3>" +
        (c.p ? '<p class="cat__p">' + c.p + "</p>" : "") + '<ul class="dishes">' + list.map(dishHTML).join("") + "</ul></section>";
    });
    menuEl.innerHTML = html;
    $("#menuNone").hidden = any;
    catsEl.innerHTML = CATS.filter(function (c) { return $("#cat-" + c.id); }).map(function (c) {
      return '<a href="#cat-' + c.id + '" data-cat="' + c.id + '">' + c.n + "</a>";
    }).join("");
    markCounts();
    spy();
  }
  function markCounts() {
    var cnt = {};
    st.items.forEach(function (it) { cnt[it.id] = (cnt[it.id] || 0) + it.q; });
    $$(".dish-i", menuEl).forEach(function (b) {
      var c = cnt[b.getAttribute("data-id")] || 0;
      b.classList.toggle("is-in", c > 0);
      $("[data-q]", b).textContent = c ? c + "×" : "";
    });
  }
  menuEl.addEventListener("click", function (e) {
    var b = e.target.closest(".dish-i"); if (!b) return;
    var m = BY[b.getAttribute("data-id")];
    if (m.opt) openDish(m);
    else { add({ id: m.id, size: "", ex: [], note: "", q: 1 }); }
  });
  qEl.addEventListener("input", renderMenu);

  // Aktive Kategorie in der Leiste mitführen
  var spyIO = null;
  function spy() {
    if (spyIO) spyIO.disconnect();
    if (!("IntersectionObserver" in window)) return;
    var vis = {};
    spyIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting ? e.boundingClientRect.top : null; });
      var best = null;
      $$(".cat", menuEl).forEach(function (s) { if (vis[s.id] != null && best == null) best = s.id; });
      if (best) setCat(best.slice(4));
    }, { rootMargin: "-200px 0px -55% 0px" });
    $$(".cat", menuEl).forEach(function (s) { spyIO.observe(s); });
    var first = $(".cat", menuEl); if (first) setCat(first.id.slice(4));
  }
  function setCat(id) {
    $$("a", catsEl).forEach(function (a) {
      var on = a.getAttribute("data-cat") === id;
      if (on && a.getAttribute("aria-current") !== "true") {
        catsEl.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
      }
      a.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  /* ---------- Gericht anpassen ---------- */
  var dDlg = $("#dishDlg"), dForm = $("#dishForm"), cur = null, dq = 1;
  function openDish(m) {
    cur = m; dq = 1;
    var im = $("#dishImg"), box = im.parentNode;
    if (m.img) { im.src = IMG + m.img + ".webp"; im.alt = m.n; box.classList.remove("is-none"); }
    else { im.removeAttribute("src"); im.alt = ""; box.classList.add("is-none"); }
    $("#dishTag").innerHTML = (m.tags || []).map(function (t) { return TAGS[t]; }).join("");
    $("#dishH").textContent = m.n;
    $("#dishD").textContent = m.d;
    $("#dishSize").hidden = m.opt !== "pizza";
    $("#dishSizes").innerHTML = SIZES.map(function (s, i) {
      return '<label class="oc"><input type="radio" name="size" value="' + s[0] + '"' + (i ? "" : " checked") + '><i></i><span>' + s[1] + "<small>" + s[2] + "</small></span><b>" + (s[3] ? "+ " + eur(s[3]) : "") + "</b></label>";
    }).join("");
    $("#dishExtraList").innerHTML = (EXTRAS[m.opt] || []).map(function (x) {
      return '<label class="oc"><input type="checkbox" name="ex" value="' + x[0] + '"><i></i><span>' + x[1] + "</span><b>" + (x[2] ? "+ " + eur(x[2]) : "gratis") + "</b></label>";
    }).join("");
    $("#dishNote").value = "";
    dPrice();
    dDlg.showModal();
    var body = $(".dlg__in", dDlg); body.scrollTop = 0;
  }
  function dItem() {
    var sz = $("input[name=size]:checked", dForm);
    return {
      id: cur.id, size: cur.opt === "pizza" && sz ? sz.value : "",
      ex: $$("input[name=ex]:checked", dForm).map(function (i) { return i.value; }).sort(),
      note: $("#dishNote").value.trim(), q: dq
    };
  }
  function dPrice() { $("#dQ").textContent = dq; $("#dishP").textContent = eur(unit(dItem()) * dq); $("#dQm").disabled = dq <= 1; }
  dForm.addEventListener("change", dPrice);
  $("#dQm").addEventListener("click", function () { if (dq > 1) { dq--; dPrice(); } });
  $("#dQp").addEventListener("click", function () { if (dq < 20) { dq++; dPrice(); } });
  dForm.addEventListener("submit", function (e) { e.preventDefault(); add(dItem()); dDlg.close(); });

  /* ---------- Warenkorb ---------- */
  var keyOf = function (it) { return [it.id, it.size, (it.ex || []).join("+"), it.note].join("|"); };
  function add(it) {
    var k = keyOf(it), hit = null;
    st.items.forEach(function (x) { if (keyOf(x) === k) hit = x; });
    if (hit) hit.q = Math.min(30, hit.q + it.q); else st.items.push(it);
    save(); renderCart(); markCounts();
    var b = $("#cartBtn"); b.classList.remove("is-bump"); void b.offsetWidth; b.classList.add("is-bump");
    toast((it.q > 1 ? it.q + " × " : "") + BY[it.id].n + " im Warenkorb");
  }
  var cartEl = $("#cart"), listEl = $("#cartList");
  function whereHTML() {
    if (st.mode === "abholen") return "Abholung am Musterplatz 12 · fertig in ca. <b>20 Min.</b>";
    var opts = '<option value="-1">Ort wählen</option>' + ORTE.map(function (o, i) { return '<option value="' + i + '"' + (i === st.ort ? " selected" : "") + ">" + o.n + "</option>"; }).join("");
    var z = zone();
    return '<label class="sr" for="cartOrt">Lieferort</label>Lieferung nach <select id="cartOrt" class="where-sel">' + opts + "</select>" + (z ? " <b>· " + z.t[0] + "–" + z.t[1] + " Min.</b>" : "");
  }
  function renderCart() {
    var t = totals();
    $("#cartWhere").innerHTML = whereHTML();
    $("#cartEmpty").hidden = t.n > 0;
    listEl.innerHTML = st.items.map(function (it, i) {
      var m = BY[it.id], o = [];
      if (it.size === "famiglia") o.push("Famiglia Ø 40 cm");
      (it.ex || []).forEach(function (x) { if (EXN[x]) o.push("+ " + EXN[x][1]); });
      if (it.note) o.push("„" + esc(it.note) + "“");
      return '<li class="ci"><p class="ci__n">' + esc(m.n) + '</p><p class="ci__p">' + eur(unit(it) * it.q) + "</p>" + (o.length ? '<p class="ci__o">' + o.join(" · ") + "</p>" : "") +
        '<div class="ci__q"><button type="button" class="ibtn" data-i="' + i + '" data-d="-1" aria-label="' + esc(m.n) + ' eins weniger"><svg><use href="#i-minus"/></svg></button><output>' + it.q + '</output><button type="button" class="ibtn" data-i="' + i + '" data-d="1" aria-label="' + esc(m.n) + ' eins mehr"><svg><use href="#i-plus"/></svg></button></div></li>';
    }).join("");
    var minBox = $("#cartMin"), bar = $("#cartMinBar"), txt = $("#cartMinTxt");
    minBox.hidden = !(t.n > 0 && st.mode === "liefern");
    if (st.mode === "liefern" && t.n > 0) {
      if (st.ort < 0) { bar.style.width = "0%"; txt.innerHTML = "Wählen Sie Ihren Ort, dann sehen Sie Lieferzeit und Gebühr."; }
      else if (t.sub < t.min) { bar.style.width = (t.sub / t.min * 100) + "%"; txt.innerHTML = "Noch <b>" + eur(t.min - t.sub) + "</b> bis zum Mindestbestellwert von " + eur(t.min) + "."; }
      else if (t.sub < FREE) { bar.style.width = (t.sub / FREE * 100) + "%"; txt.innerHTML = "Noch <b>" + eur(FREE - t.sub) + "</b>, dann liefern wir ohne Gebühr."; }
      else { bar.style.width = "100%"; txt.innerHTML = "<b>Die Lieferung geht aufs Haus.</b>"; }
    }
    $("#cartSum").hidden = !t.n;
    $("#sSub").textContent = eur(t.sub);
    $("#sDiscRow").hidden = !t.disc; $("#sDisc").textContent = "− " + eur(t.disc);
    $("#sFeeRow").hidden = st.mode !== "liefern";
    $("#sFee").textContent = t.fee ? eur(t.fee) : "gratis";
    $("#sTot").textContent = eur(t.tot);
    var go = $("#toCheckout");
    go.disabled = !t.ok;
    go.textContent = t.ok ? "Zur Kasse · " + eur(t.tot) : (t.n ? (st.mode === "liefern" && st.ort < 0 ? "Erst Ort wählen" : "Mindestbestellwert fehlt") : "Zur Kasse");
    $("#cartN").hidden = !t.n; $("#cartN").textContent = t.n;
    $("#cartBtnSum").textContent = eur(t.tot);
    $("#cartBtn").setAttribute("aria-label", t.n ? "Warenkorb öffnen, " + t.n + " Artikel, " + eur(t.tot) : "Warenkorb öffnen, leer");
    $("#cartBar").hidden = !t.n || cartEl.classList.contains("is-open");
    $("#cartBarN").textContent = t.n; $("#cartBarSum").textContent = eur(t.tot);
    document.body.classList.toggle("has-bar", t.n > 0);
    // Liefergebiet hervorheben
    var zn = zone() ? zone().n : 0;
    $$(".zrow").forEach(function (r) { r.classList.toggle("is-on", +r.getAttribute("data-z") === zn); });
    $$(".zr").forEach(function (r, i) { r.classList.toggle("is-on", 3 - i === zn); });
    $$(".zdots [data-o]").forEach(function (c) { c.classList.toggle("is-on", +c.getAttribute("data-o") === st.ort); });
  }
  listEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-i]"); if (!b) return;
    var i = +b.getAttribute("data-i"), it = st.items[i];
    it.q += +b.getAttribute("data-d");
    if (it.q <= 0) st.items.splice(i, 1);
    save(); renderCart(); markCounts();
    var again = listEl.querySelector('[data-i="' + Math.min(i, st.items.length - 1) + '"][data-d="' + b.getAttribute("data-d") + '"]');
    if (again) again.focus(); else cartEl.focus();
  });
  cartEl.addEventListener("change", function (e) { if (e.target.id === "cartOrt") setOrt(+e.target.value); });

  function setOrt(i) {
    st.ort = i; save();
    $("#addrZone").value = i >= 0 ? String(i) : "";
    renderCart();
  }
  function setMode(m) {
    st.mode = m; save();
    $$(".mode button").forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-mode") === m ? "true" : "false"); });
    renderCart();
  }
  $(".mode").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setMode(b.getAttribute("data-mode")); });
  $(".mode").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var m = st.mode === "liefern" ? "abholen" : "liefern"; setMode(m);
    $('.mode [data-mode="' + m + '"]').focus(); e.preventDefault();
  });

  // Warenkorb am Handy öffnen und schließen
  var scrim = $("#scrim"), lastFocus = null;
  function openCart() {
    if (desk.matches) {
      $("#karte").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { cartEl.focus({ preventScroll: true }); }, reduce ? 0 : 500);
      return;
    }
    lastFocus = document.activeElement;
    cartEl.classList.add("is-open"); scrim.hidden = false; document.body.classList.add("is-locked");
    $("#cartBar").hidden = true;
    setTimeout(function () { $("#cartClose").focus(); }, 60);
  }
  function closeCart() {
    if (!cartEl.classList.contains("is-open")) return;
    cartEl.classList.remove("is-open"); scrim.hidden = true; document.body.classList.remove("is-locked");
    renderCart();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("#cartBtn").addEventListener("click", openCart);
  $("#cartBarBtn").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });
  desk.addEventListener && desk.addEventListener("change", function () { closeCart(); });

  /* ---------- Startbild: Lieferort ---------- */
  var addrSel = $("#addrZone");
  ZONES.forEach(function (z) {
    var g = document.createElement("optgroup"); g.label = "Zone " + z.n + " · " + z.km;
    z.orte.forEach(function (o) { var op = document.createElement("option"); op.value = ORTE.map(function (x) { return x.n; }).indexOf(o); op.textContent = o; g.appendChild(op); });
    addrSel.appendChild(g);
  });
  if (st.ort >= 0) addrSel.value = String(st.ort);
  function addrMsg() {
    var z = zone();
    $("#addrOut").textContent = z ? "Lieferung nach " + ORTE[st.ort].n + " in " + z.t[0] + " bis " + z.t[1] + " Minuten, ab " + eur(z.min) + " Bestellwert." : "";
  }
  addrSel.addEventListener("change", function () { setOrt(addrSel.value === "" ? -1 : +addrSel.value); setMode("liefern"); addrMsg(); });
  $("#addrForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (addrSel.value === "") { $("#addrOut").textContent = "Wählen Sie Ihren Ort, oder holen Sie einfach selbst ab."; addrSel.focus(); return; }
    setOrt(+addrSel.value); setMode("liefern"); addrMsg();
    setTimeout(function () { $("#karte").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, reduce ? 0 : 450);
  });

  /* ---------- Liefergebiet ---------- */
  $("#zTable").innerHTML = ZONES.map(function (z) {
    return '<div class="zrow" role="listitem" data-z="' + z.n + '"><span class="zrow__n"><span>' + z.n + '</span></span><span class="zrow__t"><b>' + z.orte.join(", ") + "</b><span>Zone " + z.n + " · " + z.km + " · " + z.t[0] + "–" + z.t[1] + ' Min.</span></span><span class="zrow__f">ab <b>' + eur(z.min) + "</b><br>Lieferung " + eur(z.fee) + "</span></div>";
  }).join("");
  var dots = $(".zdots"), dh = "";
  ORTE.forEach(function (o, i) {
    var d = DOTS[i], a = d[1] * Math.PI / 180, x = 200 + Math.cos(a) * d[0], y = 200 + Math.sin(a) * d[0];
    var right = Math.cos(a) >= -0.2;
    dh += '<circle data-o="' + i + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5"/><text data-o="' + i + '" x="' + (x + (right ? 10 : -10)).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="' + (right ? "start" : "end") + '">' + o.n + "</text>";
  });
  dots.innerHTML = dh;

  /* ---------- Kennwort ---------- */
  var sec = $("#secret");
  function unlockedUI() {
    sec.classList.add("is-open");
    $("#pw").value = "Salami"; $("#pw").disabled = true;
    $("button", sec).disabled = true; $("button", sec).textContent = "Willkommen";
    $("#pwHint").innerHTML = 'Willkommen in der Familie. Die Pizza Proibita steht jetzt auf Ihrer Karte. <a href="#d-proibita">Ansehen</a>';
  }
  sec.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("#pw").value.trim().toLowerCase().replace(/[^a-zäöü]/g, "");
    if (v === "salami" || v === "salame") {
      sec.classList.remove("is-wrong"); st.unlocked = true; save(); renderMenu(); unlockedUI();
      toast("Die Tür geht auf. Pizza Proibita freigeschaltet.");
    } else {
      sec.classList.remove("is-wrong"); void sec.offsetWidth; sec.classList.add("is-wrong");
      $("#pwHint").textContent = v ? "Leider falsch. Kleiner Tipp: Was liegt auf jeder Salamipizza?" : "Ohne Kennwort bleibt die Tür zu.";
    }
  });
  if (st.unlocked) unlockedUI();

  /* ---------- Öffnungszeiten ---------- */
  function slotsOf(day) { return HOURS[day] || null; }
  function nowH(d) { return d.getHours() + d.getMinutes() / 60; }
  function isOpen(d) { var s = slotsOf(d.getDay()), h = nowH(d); return !!(s && s.some(function (r) { return h >= r[0] && h < r[1]; })); }
  function nextOpen(d) {
    for (var i = 0; i < 8; i++) {
      var day = (d.getDay() + i) % 7, s = slotsOf(day);
      if (!s) continue;
      for (var j = 0; j < s.length; j++) if (i > 0 || s[j][0] > nowH(d)) return { i: i, day: day, h: s[j][0] };
    }
    return null;
  }
  function hoursUI() {
    var d = new Date(), open = isOpen(d), s = slotsOf(d.getDay()), el = $("#status");
    el.classList.toggle("is-open", open);
    var nx = nextOpen(d), when = nx ? (nx.i === 0 ? "heute" : nx.i === 1 ? "morgen" : "am " + DAYS[nx.day]) + " um " + hm(nx.h) + " Uhr" : "";
    var close = null; if (open) s.forEach(function (r) { if (nowH(d) >= r[0] && nowH(d) < r[1]) close = r[1]; });
    $("span", el).textContent = open ? "Jetzt geöffnet · bis " + hm(close) + " Uhr" : "Geschlossen · öffnet " + when;
    $("#heroOpen").textContent = open ? "Jetzt geöffnet, bis " + hm(close) + " Uhr" : "Vorbestellen, wir öffnen " + when;
    var order = [2, 3, 4, 5, 6, 0, 1];
    $("#hours").innerHTML = order.map(function (k) {
      var t = slotsOf(k);
      return '<div' + (k === d.getDay() ? ' class="is-today"' : "") + "><dt>" + DAYS[k] + "</dt><dd>" + (t ? t.map(function (r) { return hm(r[0]) + "–" + hm(r[1]); }).join(" · ") : "Ruhetag") + "</dd></div>";
    }).join("");
  }
  hoursUI();

  /* ---------- Kasse ---------- */
  var coDlg = $("#coDlg"), coForm = $("#coForm"), whenSel = null, tip = 0;
  function whenSlots() {
    var d = new Date(), out = [], open = isOpen(d), base;
    var step = 15 * 60000, t0 = Math.ceil((d.getTime() + 45 * 60000) / step) * step;
    if (open) out.push({ v: "asap", l: "So schnell wie möglich" });
    for (var k = 0; out.length < 7 && k < 400; k++) {
      base = new Date(t0 + k * step);
      if (base.getDate() !== d.getDate() && out.length > 1) break;
      if (isOpen(base) && isOpen(new Date(base.getTime() - 30 * 60000))) out.push({ v: base.getTime(), l: (base.getDate() !== d.getDate() ? DS[base.getDay()] + " " : "") + base.getHours() + ":" + pad(base.getMinutes()) + " Uhr" });
    }
    return out;
  }
  function chipUI(box, items, curV, cb) {
    box.innerHTML = items.map(function (it) { return '<button type="button" data-v="' + it.v + '" aria-pressed="' + (String(it.v) === String(curV)) + '">' + it.l + "</button>"; }).join("");
    box.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", box).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cb(b.getAttribute("data-v"));
    };
  }
  function coSum() {
    var t = totals(), tp = st.mode === "liefern" ? tip : 0;
    $("#coSum").innerHTML = "<div><dt>" + t.n + (t.n === 1 ? " Artikel" : " Artikel") + "</dt><dd>" + eur(t.sub) + "</dd></div>" +
      (t.disc ? "<div><dt>Abholrabatt 10 %</dt><dd>− " + eur(t.disc) + "</dd></div>" : "") +
      (st.mode === "liefern" ? "<div><dt>Liefergebühr</dt><dd>" + (t.fee ? eur(t.fee) : "gratis") + "</dd></div>" : "") +
      (tp ? "<div><dt>Trinkgeld</dt><dd>" + eur(tp) + "</dd></div>" : "") +
      '<div class="cart__tot"><dt>Gesamt</dt><dd>' + eur(t.tot + tp) + "</dd></div>";
    $("#coGo").textContent = "Bestellen · " + eur(t.tot + tp);
  }
  function openCheckout() {
    var t = totals(); if (!t.ok) return;
    closeCart();
    coForm.hidden = false; $("#track").hidden = true; $("#coErr").textContent = "";
    var liefern = st.mode === "liefern", z = zone();
    $("#coSub").innerHTML = liefern ? "Lieferung nach <b>" + ORTE[st.ort].n + "</b>, in etwa " + z.t[0] + " bis " + z.t[1] + " Minuten." : "Abholung am Musterplatz 12. Wir sagen Bescheid, wenn alles fertig ist.";
    $("#coDeliv").hidden = !liefern; $("#tipSet").hidden = !liefern;
    $("#cZone").innerHTML = ORTE.map(function (o, i) { return '<option value="' + i + '"' + (i === st.ort ? " selected" : "") + ">" + o.n + "</option>"; }).join("");
    var sl = whenSlots(); whenSel = sl.length ? String(sl[0].v) : null;
    chipUI($("#cWhen"), sl, whenSel, function (v) { whenSel = v; });
    tip = 0;
    chipUI($("#cTip"), [{ v: 0, l: "Kein" }, { v: 100, l: "1 €" }, { v: 200, l: "2 €" }, { v: 300, l: "3 €" }], 0, function (v) { tip = +v; coSum(); });
    coSum();
    coDlg.showModal();
    $(".dlg__in", coDlg).scrollTop = 0;
  }
  $("#toCheckout").addEventListener("click", openCheckout);
  $("#cZone").addEventListener("change", function () { setOrt(+this.value); var z = zone(); $("#coSub").innerHTML = "Lieferung nach <b>" + ORTE[st.ort].n + "</b>, in etwa " + z.t[0] + " bis " + z.t[1] + " Minuten."; coSum(); });
  coForm.addEventListener("input", function (e) { e.target.classList.remove("is-bad"); $("#coErr").textContent = ""; });
  coForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [], need = ["#cName", "#cTel"].concat(st.mode === "liefern" ? ["#cStr"] : []);
    need.forEach(function (s) { var el = $(s), v = el.value.trim(), ok = s === "#cTel" ? v.replace(/\D/g, "").length >= 6 : v.length >= 2; el.classList.toggle("is-bad", !ok); if (!ok) bad.push(el); });
    var t = totals();
    if (bad.length) { $("#coErr").textContent = "Bitte die markierten Felder ausfüllen."; bad[0].focus(); return; }
    if (!t.ok) { $("#coErr").textContent = "Der Mindestbestellwert für diesen Ort ist noch nicht erreicht."; return; }
    if (!whenSel) { $("#coErr").textContent = "Bitte eine Zeit wählen."; return; }
    startTrack(t);
  });

  /* ---------- Live-Verfolgung ---------- */
  var timers = [], raf = 0;
  function clearTrack() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); }
  function startTrack(t) {
    clearTrack();
    var liefern = st.mode === "liefern", z = zone() || ZONES[0], d = new Date(), eta;
    if (whenSel === "asap") eta = new Date(d.getTime() + (liefern ? z.t[1] : 20) * 60000);
    else eta = new Date(+whenSel);
    $("#tNo").textContent = "Bestellung Nr. " + (1929 + Math.floor(Math.random() * 7000));
    $("#tH").textContent = "Grazie mille, " + ($("#cName").value.trim().split(" ")[0] || "") + "!";
    $("#tEtaL").textContent = liefern ? "Ihre Pizza ist da um ca." : "Abholbereit um ca.";
    $("#tEta").textContent = eta.getHours() + ":" + pad(eta.getMinutes()) + " Uhr";
    $("#tS3").textContent = liefern ? "Unterwegs zu Ihnen" : "Fertig zum Abholen";
    $("#tS3s").textContent = liefern ? "In der Thermobox, auf direktem Weg." : "Musterplatz 12, gleich an der Bar.";
    $("#tS4").textContent = liefern ? "Zugestellt" : "Abgeholt";
    $("#tS4s").textContent = "Buon appetito!";
    $(".track__map").style.display = liefern ? "" : "none";
    coForm.hidden = true; $("#track").hidden = false;
    $(".dlg__in", coDlg).scrollTop = 0;
    st.items = []; save(); renderCart(); markCounts();
    var steps = $$("#tSteps li"), path = $("#tPath"), sc = $("#tScoot"), L = path.getTotalLength();
    path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
    var p0 = path.getPointAtLength(0); sc.setAttribute("transform", "translate(" + p0.x + " " + p0.y + ")");
    function stepTo(n) { steps.forEach(function (li, i) { li.classList.toggle("is-done", i < n || n === 4); li.classList.toggle("is-now", i === n && n < 4); }); if (n === 3) steps[3].classList.add("is-done"); }
    stepTo(0);
    var T = reduce ? [0, 800, 1600, 2400] : [0, 2600, 6000, 13000];
    timers.push(setTimeout(function () { stepTo(1); }, T[1]));
    timers.push(setTimeout(function () {
      stepTo(2);
      if (!liefern) return;
      var t0 = performance.now(), dur = T[3] - T[2];
      (function fr(now) {
        var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, pt = path.getPointAtLength(e * L);
        path.style.strokeDashoffset = L * (1 - e);
        sc.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
        if (k < 1) raf = requestAnimationFrame(fr);
      })(t0);
    }, T[2]));
    timers.push(setTimeout(function () { stepTo(4); }, T[3]));
  }

  // Fenster schließen
  $$("dialog").forEach(function (dl) {
    dl.addEventListener("click", function (e) {
      if (e.target === dl || e.target.closest("[data-close]")) { dl.close(); }
    });
    dl.addEventListener("close", function () { if (dl === coDlg) clearTrack(); });
  });

  /* ---------- Reservierung ---------- */
  (function () {
    var dSel = $("#resDay"), tSel = $("#resTime"), d = new Date(), html = "";
    for (var i = 0, n = 0; n < 14 && i < 30; i++) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (!slotsOf(x.getDay())) continue; n++;
      var lab = i === 0 ? "Heute" : i === 1 ? "Morgen" : DS[x.getDay()] + ", " + x.getDate() + "." + (x.getMonth() + 1) + ".";
      html += '<option value="' + i + '">' + lab + "</option>";
    }
    dSel.innerHTML = html;
    function times() {
      var off = +dSel.value, x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + off), s = slotsOf(x.getDay()) || [], out = "";
      s.forEach(function (r) { for (var h = r[0]; h <= r[1] - 1.5; h += 0.5) { if (off === 0 && h <= nowH(d) + 0.5) continue; out += "<option>" + hm(h) + "</option>"; } });
      tSel.innerHTML = out || "<option value=\"\">Heute nichts mehr frei</option>";
      if (/19:00/.test(out)) tSel.value = "19:00";
    }
    dSel.addEventListener("change", times); times();
    if (!tSel.value && dSel.options.length > 1) { dSel.selectedIndex = 1; times(); }
    var f = $("#resForm");
    f.addEventListener("input", function (e) { e.target.classList.remove("is-bad"); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [];
      [["#resName", 2], ["#resTel", 6]].forEach(function (p) { var el = $(p[0]), v = p[0] === "#resTel" ? el.value.replace(/\D/g, "") : el.value.trim(); var ok = v.length >= p[1]; el.classList.toggle("is-bad", !ok); if (!ok) bad.push(el); });
      if (!tSel.value) { tSel.classList.add("is-bad"); bad.push(tSel); }
      if (bad.length) { $("#resErr").textContent = "Bitte die markierten Felder ausfüllen."; bad[0].focus(); return; }
      $("#resErr").textContent = "";
      var p = +$("#resP").value;
      $("#resOkTxt").textContent = dSel.options[dSel.selectedIndex].text + " um " + tSel.value + " Uhr, " + p + (p === 1 ? " Person" : " Personen") + ". Wir rufen kurz zurück und bestätigen.";
      $("#resOk").hidden = false;
    });
  })();

  /* ---------- Kleinigkeiten ---------- */
  var tEl = $("#toast"), tT = 0;
  function toast(s) { tEl.textContent = s; tEl.classList.add("is-on"); clearTimeout(tT); tT = setTimeout(function () { tEl.classList.remove("is-on"); }, 2200); }
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  setMode(st.mode);
  renderMenu();
  renderCart();
  addrMsg();
})();
