// Risiko-Cockpit – Logik unverändert aus dem ursprünglichen Dashboard übernommen.
// Alle Daten bleiben im Browser (localStorage), nichts wird an einen Server gesendet.
(function () {
  var KEY = "risiko-cockpit-v1";
  var INST = { MNQ: 2, NQ: 20, MES: 5, ES: 50 };
  var CHECKS = [
    "Stop ist gesetzt, bevor ich einsteige",
    "Größe stammt aus dem Rechner, ich erhöhe nicht gegen die Position",
    "Einstieg am Low nur bei bestätigtem Long-Trend",
    "Kein High-Impact-Termin in den nächsten 15 Minuten",
    "Ruhig, kein Rache-Trade nach einem Verlust",
    "Das Tageslimit ist noch nicht erreicht"
  ];
  var DEFAULT = { limit: 300, calc: { inst: "MNQ", risk: 200, stop: 100, rr: 1, max: 2 }, checks: [], checkDay: "", trades: [] };

  function dayKey(d) {
    var x = d || new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  var TODAY = dayKey();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        return {
          limit: isFinite(s.limit) && s.limit > 0 ? s.limit : DEFAULT.limit,
          calc: Object.assign({}, DEFAULT.calc, s.calc || {}),
          checks: Array.isArray(s.checks) ? s.checks : [],
          checkDay: s.checkDay || "",
          trades: Array.isArray(s.trades) ? s.trades : []
        };
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  var state = load();
  if (state.checkDay !== TODAY) { state.checks = []; state.checkDay = TODAY; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function money(n, signed) {
    var a = Math.abs(n).toLocaleString("de-AT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    var sign = n < 0 ? "−" : (signed && n > 0 ? "+" : "");
    return sign + "$" + a;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* Reine Rechenfunktionen */
  function sizeCalc(c, remaining, limit) {
    var pv = INST[c.inst] || 2;
    var perLot = c.stop * pv;
    if (!(c.risk > 0) || !(c.stop > 0)) return { error: "Risiko und Stop eintragen." };
    var raw = Math.floor(c.risk / perLot);
    var lots = c.max > 0 ? Math.min(raw, Math.floor(c.max)) : raw;
    var out = { pv: pv, perLot: perLot, raw: raw, lots: lots };
    out.actual = lots * perLot;
    out.targetPts = c.stop * c.rr;
    out.targetUsd = lots * out.targetPts * pv;
    out.shareOfLimit = limit > 0 ? out.actual / limit * 100 : 0;
    out.stopsLeft = out.actual > 0 ? Math.floor(remaining / out.actual) : 0;
    out.overRemaining = out.actual > remaining;
    return out;
  }
  function stats(trades) {
    var n = trades.length, wins = trades.filter(function (t) { return t.pnl > 0; }), losses = trades.filter(function (t) { return t.pnl < 0; });
    var sum = trades.reduce(function (a, t) { return a + t.pnl; }, 0);
    var avg = function (arr) { return arr.length ? arr.reduce(function (a, t) { return a + t.pnl; }, 0) / arr.length : null; };
    return { n: n, rate: n ? wins.length / n * 100 : null, avgWin: avg(wins), avgLoss: avg(losses), sum: sum, per: n ? sum / n : null };
  }

  function todays() { return state.trades.filter(function (t) { return t.day === TODAY; }); }

  function renderLimit() {
    var list = todays();
    var pnl = list.reduce(function (a, t) { return a + t.pnl; }, 0);
    var used = Math.max(0, -pnl);
    var limit = state.limit;
    var remaining = Math.max(0, limit - used);
    var pct = limit > 0 ? Math.min(100, used / limit * 100) : 0;
    var level = pct >= 100 ? "bad" : pct >= 50 ? "warn" : "ok";
    var text = level === "bad" ? "Limit erreicht, heute Schluss" : level === "warn" ? "Mehr als die Hälfte verbraucht" : "Im Rahmen";
    $("remaining").textContent = money(remaining);
    $("pill").textContent = text;
    $("pill").className = "pill " + level;
    $("meter").className = "meter " + (level === "ok" ? "" : level);
    $("fill").style.width = pct + "%";
    $("meter").setAttribute("aria-valuenow", String(Math.round(pct)));
    $("used-label").textContent = "verbraucht " + money(used);
    $("limit-label").textContent = money(limit);
    var p = $("pnl");
    p.textContent = money(pnl, true);
    p.className = pnl > 0 ? "pos" : pnl < 0 ? "neg" : "";
    $("count").textContent = String(list.length);
    return remaining;
  }

  function renderCalc(remaining) {
    var r = sizeCalc(state.calc, remaining, state.limit);
    var box = $("result");
    if (r.error) { box.innerHTML = '<p class="note warn">' + r.error + "</p>"; return; }
    var html = "";
    if (r.raw < 1) {
      html += '<div class="lots"><span class="num">0</span><span>Kontrakte</span></div>';
      html += '<p class="note bad">Ein Kontrakt riskiert bei diesem Stop schon ' + money(r.perLot) + ", mehr als dein Risiko pro Trade.</p>";
      box.innerHTML = html; return;
    }
    html += '<div class="lots"><span class="num">' + r.lots + "</span><span>" + (r.lots === 1 ? "Kontrakt" : "Kontrakte") + "</span></div>";
    if (r.raw > r.lots) html += '<p class="note warn">Der Rechner ergäbe ' + r.raw + ", dein Maximum begrenzt auf " + r.lots + ".</p>";
    html += "<ul>";
    html += "<li><span>Risiko bei vollem Stop</span><span>" + money(r.actual) + "</span></li>";
    html += "<li><span>Anteil am Tageslimit</span><span>" + Math.round(r.shareOfLimit) + " %</span></li>";
    html += "<li><span>Ziel</span><span>" + r.targetPts.toLocaleString("de-AT", { maximumFractionDigits: 1 }) + " Punkte, " + money(r.targetUsd) + "</span></li>";
    html += "<li><span>Volle Stopps bis zum Limit</span><span>" + r.stopsLeft + "</span></li>";
    html += "</ul>";
    if (remaining <= 0) html += '<p class="note bad">Das Tageslimit ist verbraucht. Kein weiterer Trade heute.</p>';
    else if (r.overRemaining) html += '<p class="note bad">Ein voller Stop überschreitet dein Rest-Limit von ' + money(remaining) + ".</p>";
    else if (r.shareOfLimit >= 50) html += '<p class="note warn">Ein einziger Stop verbraucht mehr als die Hälfte deines Tageslimits.</p>';
    box.innerHTML = html;
  }

  function renderChecks() {
    var ul = $("checks");
    ul.innerHTML = CHECKS.map(function (t, i) {
      var on = !!state.checks[i];
      return '<li><label class="' + (on ? "done" : "") + '" for="chk-' + i + '"><input type="checkbox" id="chk-' + i + '" data-i="' + i + '"' + (on ? " checked" : "") + "><span>" + esc(t) + "</span></label></li>";
    }).join("");
    var n = state.checks.filter(Boolean).length;
    var pill = $("check-pill");
    pill.textContent = n === CHECKS.length ? "Bereit" : n + " von " + CHECKS.length;
    pill.className = "pill " + (n === CHECKS.length ? "ok" : "");
  }

  function renderTrades() {
    var list = todays().slice().sort(function (a, b) { return b.ts - a.ts; });
    var ul = $("trades");
    if (!list.length) {
      ul.innerHTML = '<li style="display:block;border:0;padding:0"><p class="empty">Noch kein Trade heute. Trage nach jedem Trade den Betrag ein, das Tageslimit oben rechnet sofort mit.</p></li>';
      return;
    }
    ul.innerHTML = list.map(function (t) {
      var d = new Date(t.ts);
      var time = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      return '<li><span class="t">' + time + '</span><span class="n">' + esc(t.note || "") + '</span><span class="p ' + (t.pnl > 0 ? "pos" : "neg") + '">' + money(t.pnl, true) + '</span><button class="icon" type="button" data-del="' + t.id + '" aria-label="Trade löschen">×</button></li>';
    }).join("");
  }

  function renderStats() {
    var s = stats(state.trades);
    var dash = "–";
    function cell(label, val, cls) { return "<div><dt>" + label + '</dt><dd class="' + (cls || "") + '">' + val + "</dd></div>"; }
    $("stats").innerHTML =
      cell("Trades", String(s.n)) +
      cell("Trefferquote", s.rate === null ? dash : Math.round(s.rate) + " %") +
      cell("Ø Gewinn", s.avgWin === null ? dash : money(s.avgWin), "pos") +
      cell("Ø Verlust", s.avgLoss === null ? dash : money(s.avgLoss), "neg") +
      cell("Summe", s.n ? money(s.sum, true) : dash, s.sum > 0 ? "pos" : s.sum < 0 ? "neg" : "") +
      cell("Erwartung pro Trade", s.per === null ? dash : money(s.per, true), s.per > 0 ? "pos" : s.per < 0 ? "neg" : "");
  }

  function renderAll() {
    var remaining = renderLimit();
    renderCalc(remaining);
    renderTrades();
    renderStats();
  }

  /* Eingaben */
  function num(el) { var v = parseFloat(String(el.value).replace(",", ".")); return isFinite(v) ? v : 0; }
  function readCalc() {
    state.calc.inst = $("inst").value;
    state.calc.risk = num($("risk"));
    state.calc.stop = num($("stop"));
    state.calc.rr = num($("rr"));
    state.calc.max = num($("maxlots"));
    save();
    renderCalc(renderLimit());
  }
  ["inst", "risk", "stop", "rr", "maxlots"].forEach(function (id) { $(id).addEventListener("input", readCalc); });
  $("limit").addEventListener("input", function () {
    var v = num($("limit"));
    if (v > 0) { state.limit = v; save(); renderAll(); }
  });
  $("checks").addEventListener("change", function (e) {
    var i = e.target && e.target.getAttribute("data-i");
    if (i === null || i === undefined) return;
    state.checks[+i] = e.target.checked;
    state.checkDay = TODAY;
    save(); renderChecks();
  });
  $("check-reset").addEventListener("click", function () { state.checks = []; save(); renderChecks(); });
  $("trade-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var sign = e.submitter && e.submitter.value === "-1" ? -1 : 1;
    var amount = num($("amount"));
    if (!(amount > 0)) { $("form-hint").textContent = "Bitte einen Betrag über 0 eintragen."; return; }
    $("form-hint").textContent = "";
    state.trades.push({ id: Date.now(), day: TODAY, ts: Date.now(), pnl: sign * amount, note: $("memo").value.trim() });
    $("amount").value = ""; $("memo").value = "";
    save(); renderAll();
  });
  $("trades").addEventListener("click", function (e) {
    var id = e.target && e.target.getAttribute("data-del");
    if (!id) return;
    state.trades = state.trades.filter(function (t) { return String(t.id) !== id; });
    save(); renderAll();
  });

  /* Start */
  $("today").textContent = new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" });
  $("limit").value = state.limit;
  $("inst").value = state.calc.inst;
  $("risk").value = state.calc.risk;
  $("stop").value = state.calc.stop;
  $("rr").value = state.calc.rr;
  $("maxlots").value = state.calc.max;
  renderChecks();
  renderAll();
})();
