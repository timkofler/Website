// röstklang: digitale Stempelkarte. "Karte holen" lässt dicke Milch von oben über die Karte laufen;
// sobald sie ganz bedeckt ist, liegt darunter das helle Formular. Zurück läuft die Milch nach unten ab.
// Die Milch wird auf eine Leinwand gezeichnet: Front als weiche Kurve, ein paar dicke Tropfen, die unten abreißen.
// Beispiel ohne Server: nichts wird gespeichert oder gesendet.
(function () {
  var sk = document.getElementById("sk"); if (!sk) return;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var face = sk.querySelector(".sk__face"), cv = sk.querySelector(".sk__milk"), ctx = cv.getContext && cv.getContext("2d");
  var live = document.getElementById("sk-live");
  var V = { login: document.getElementById("sk-login"), reg: document.getElementById("sk-reg"), ok: document.getElementById("sk-ok") };
  var cur = "login", busy = false, last = null;
  var MILK = "#f3eee5", RAD = 6, BELOW = 130;
  if (!ctx) reduce = true;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sm(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function inOut(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function out3(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }

  // ---------- Ansichten ----------
  function setView(name) {
    cur = name;
    Object.keys(V).forEach(function (k) {
      var on = k === name, v = V[k];
      v.classList.toggle("is-on", on); v.inert = !on;
      if (on) v.removeAttribute("aria-hidden"); else v.setAttribute("aria-hidden", "true");
      v.classList.remove("is-rise");
    });
    sk.classList.toggle("is-milk", name !== "login");
  }
  function rise(name) { var v = V[name]; v.classList.remove("is-rise"); void v.offsetWidth; v.classList.add("is-rise"); }
  function say(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }
  function focusFirst(name) {
    var el = name === "ok" ? V.ok : V[name].querySelector("input");
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  var LABEL = { login: "Anmelden", reg: "Registrierung: neue Stempelkarte holen", ok: "" };
  function go(name, label) {
    if (busy || name === cur) return;
    var lightNow = cur !== "login", lightNext = name !== "login";
    var msg = label || LABEL[name];
    // Zwischen zwei hellen Ansichten (Registrierung -> Karte) braucht es keine Milch, nur ein Überblenden.
    if (reduce || lightNow === lightNext) {
      setView(name); if (!reduce) rise(name); focusFirst(name); say(msg); return;
    }
    busy = true; face.inert = true;
    pour(lightNext ? "in" : "out", function () { sk.classList.add("is-pouring"); setView(name); }, function () {
      if (lightNext) rise(name);
    }, function () {
      sk.classList.remove("is-pouring"); face.inert = false; busy = false; focusFirst(name); say(msg);
    });
  }

  // ---------- Milch ----------
  // dir "in": Milch läuft von oben über die Karte. dir "out": sie läuft nach unten ab.
  // onSwap: Karte ganz bedeckt, Formular tauschen. onReveal: Milch wird durchsichtig. onDone: fertig.
  function pour(dir, onSwap, onReveal, onDone) {
    var W = sk.offsetWidth, H = sk.offsetHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round((H + BELOW) * dpr); cv.style.height = (H + BELOW) + "px";
    var IN = dir === "in", T = IN ? 1100 : 860;
    // Wenige dicke Tropfen, gleichmäßig verteilt mit etwas Zufall, weg von den Ecken.
    var n = W < 360 ? 3 : 4, D = [], drops = [], seg = (W - 70) / n;
    for (var i = 0; i < n; i++) {
      var w = 11 + Math.random() * 7;
      D.push({ x: 35 + seg * (i + .5) + (Math.random() - .5) * seg * .4, w: w, L: 30 + Math.random() * 46 + w,
        g0: (IN ? .08 : .16) + Math.random() * .16, gd: .3 + Math.random() * .12,
        cut: (IN ? .7 : .56) + Math.random() * .16, len: 0, cutLen: 0, gone: false });
    }
    var swapped = false, revealed = false, t0 = performance.now();
    var ph1 = Math.random() * 6, ph2 = Math.random() * 6;

    function wob(x, s) { return 6 * Math.sin(x * .017 + ph1 + s * 3.2) + 3.5 * Math.sin(x * .043 + ph2 - s * 5.1); }
    // Tropfenform: dicker Finger mit weicher Schulter an der Front (Super-Gauß), unten ein runder Kopf.
    function tongue(x) {
      var y = 0;
      for (var i = 0; i < D.length; i++) { var d = D[i]; if (d.len < .5) continue; var u = (x - d.x) / d.w; if (u > -2 && u < 2) { var u2 = u * u; y += d.len * Math.exp(-u2 * u2); } }
      return y;
    }
    function head(d) { return d.w * .95 * clamp(d.len / (d.w * 2.2), 0, 1); }
    // Zwei Durchgänge: die Fläche auf der Karte (blendet am Ende aus) und die Tropfen unter der Karte (bleiben deckend).
    function clipPart(below) {
      ctx.beginPath();
      if (below) { ctx.rect(RAD, H, W - 2 * RAD, BELOW); ctx.clip(); return; }
      ctx.moveTo(RAD, 0); ctx.lineTo(W - RAD, 0); ctx.arcTo(W, 0, W, RAD, RAD); ctx.lineTo(W, H - RAD); ctx.arcTo(W, H, W - RAD, H, RAD);
      ctx.lineTo(RAD, H); ctx.arcTo(0, H, 0, H - RAD, RAD); ctx.lineTo(0, RAD); ctx.arcTo(0, 0, RAD, 0, RAD); ctx.closePath();
      ctx.clip();
    }
    function frame(now) {
      var s = clamp((now - t0) / T, 0, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H + BELOW);

      // Lage der Milch: Oberkante (top) und Front (base) als Funktion von x.
      var b, tp, alpha;
      if (IN) {
        b = -40 + inOut(s / .68) * (H + 70);
        tp = null;
        alpha = 1 - out3((s - .74) / .2);
        if (!swapped && b - 14 >= H) { swapped = true; onSwap(); }
        if (!revealed && s >= .74) { revealed = true; onReveal(); }
      } else {
        b = H;
        tp = -24 + inOut((s - .14) / .64) * (H + 50);
        alpha = out3(s / .14);
        if (!swapped && s >= .14) { swapped = true; onSwap(); }
      }
      // Tropfen wachsen, reißen ab und ziehen sich zurück.
      for (var i = 0; i < D.length; i++) {
        var d = D[i];
        if (s < d.cut) d.len = d.L * sm(d.g0, d.g0 + d.gd, s);
        else {
          if (!d.gone) {
            d.gone = true; d.cutLen = d.len;
            var r0 = head(d), bx = IN ? Math.min(b + wob(d.x, s), H) : H;
            if (r0 > 3) drops.push({ x: d.x, y: bx + d.len - r0 * .7, r: r0 * .92, vy: 140 + Math.random() * 80 });
          }
          d.len = d.cutLen * (1 - out3((s - d.cut) / .1)) * .9;
        }
      }

      var hang = false;
      for (i = 0; i < D.length; i++) if (D[i].len > .5) hang = true;
      for (var pass = 0; pass < 2; pass++) {
        var a = pass ? 1 : alpha;
        if (pass ? !hang : a <= .004) continue;
        ctx.save(); clipPart(pass === 1);
        ctx.globalAlpha = a;
        // Fläche: Oberkante links -> rechts, dann die Front rechts -> links (gleiche Drehrichtung wie die Tropfenköpfe).
        var STEP = 3, x, y, pts = [];
        for (x = W; x >= -STEP; x -= STEP) {
          var xx = Math.max(0, x), base = IN ? Math.min(b + wob(xx, s), H) : H;
          pts.push(xx, base + tongue(xx));
        }
        ctx.beginPath();
        if (IN) { ctx.moveTo(0, -20); ctx.lineTo(W, -20); }
        else { for (x = 0; x <= W + STEP; x += STEP) { var x2 = Math.min(W, x); y = Math.min(H, tp + 14 * Math.sin(Math.PI * x2 / W) + wob(x2, s) * .7); if (x === 0) ctx.moveTo(x2, y); else ctx.lineTo(x2, y); } }
        for (i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.closePath();
        // Köpfe der Tropfen (gleiche Pfad-Richtung, damit sie mit der Fläche verschmelzen).
        for (i = 0; i < D.length; i++) {
          var dd = D[i], rr = head(dd);
          if (rr < 1.5) continue;
          var bb = IN ? Math.min(b + wob(dd.x, s), H) : H, ty = bb + dd.len - rr * .8;
          ctx.moveTo(dd.x + rr, ty); ctx.arc(dd.x, ty, rr, 0, Math.PI * 2);
        }
        var gr;
        if (IN) {
          gr = ctx.createLinearGradient(0, b - 90, 0, b + 80);
          gr.addColorStop(0, MILK); gr.addColorStop(.38, "#fdfbf7"); gr.addColorStop(.52, MILK); gr.addColorStop(1, "#e7ddcd");
        } else {
          gr = ctx.createLinearGradient(0, tp - 10, 0, tp + 90);
          gr.addColorStop(0, "#fffdf9"); gr.addColorStop(.35, MILK); gr.addColorStop(1, MILK);
        }
        ctx.fillStyle = gr;
        ctx.shadowColor = "rgba(10,5,2,.35)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = IN ? 6 : -4;
        ctx.fill("nonzero");
        ctx.shadowColor = "transparent";
        // Weiches Glanzlicht knapp hinter der Kante.
        ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "rgba(255,255,255," + (.7 * a).toFixed(3) + ")"; ctx.globalAlpha = 1;
        ctx.beginPath();
        for (x = 8; x <= W - 8; x += 4) {
          y = IN ? Math.min(b + wob(x, s), H) - 9 : Math.min(H, tp + 14 * Math.sin(Math.PI * x / W) + wob(x, s) * .7) + 7;
          if (x === 8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        if (IN ? b < H + 4 : tp < H - 10) ctx.stroke();
        // Glanzpunkt auf jedem Tropfenkopf.
        ctx.fillStyle = "rgba(255,255,255," + (.75 * a).toFixed(3) + ")";
        for (i = 0; i < D.length; i++) {
          var de = D[i], r2 = head(de); if (r2 < 4) continue;
          var b2 = IN ? Math.min(b + wob(de.x, s), H) : H, y2 = b2 + de.len - r2 * .8;
          ctx.beginPath(); ctx.ellipse(de.x - r2 * .34, y2 - r2 * .3, r2 * .26, r2 * .17, -.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      // Abgerissene Tropfen fallen und werden unten ausgeblendet.
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      for (i = drops.length - 1; i >= 0; i--) {
        var p = drops[i]; p.vy += 2600 * dt; p.y += p.vy * dt;
        var fa = clamp((H + BELOW - 10 - p.y) / 60, 0, 1);
        if (fa <= 0) { drops.splice(i, 1); continue; }
        var st = 1 + Math.min(.55, p.vy / 2200);
        ctx.globalAlpha = fa; ctx.fillStyle = MILK;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r / Math.sqrt(st), p.r * st, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.beginPath(); ctx.ellipse(p.x - p.r * .3, p.y - p.r * .35 * st, p.r * .22, p.r * .16 * st, -.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (s < 1 || drops.length) requestAnimationFrame(frame);
      else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); last = null; onDone(); }
    }
    last = null; requestAnimationFrame(frame);
  }

  // ---------- Formulare ----------
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function bad(form, input, text) {
    var f = input.closest(".sk-field"); f.classList.remove("is-bad"); void f.offsetWidth; f.classList.add("is-bad");
    input.setAttribute("aria-invalid", "true");
    form.querySelector(".sk-err").textContent = text; input.focus();
  }
  function clearErr(form) {
    form.querySelector(".sk-err").textContent = "";
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (i) { i.removeAttribute("aria-invalid"); });
    Array.prototype.forEach.call(form.querySelectorAll(".is-bad"), function (f) { f.classList.remove("is-bad"); });
  }
  [V.login, V.reg].forEach(function (f) { f.addEventListener("input", function (e) { if (e.target.hasAttribute("aria-invalid")) clearErr(f); }); });

  // Stempelfelder: 10 Felder, die ersten "count" gestempelt, der letzte davon wird frisch aufgedrückt.
  var STAMP = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#c2410c"/><circle cx="24" cy="24" r="17.5" fill="none" stroke="#f3eee5" stroke-width="1.2" stroke-dasharray="2 2.4" opacity=".7"/><ellipse cx="24" cy="24" rx="7.2" ry="10" fill="#f3eee5" transform="rotate(-24 24 24)"/><path d="M21.2 15.8c3.8 3 4.6 6.4 2.6 9.8s-1.6 5.6 1 8.4" fill="none" stroke="#c2410c" stroke-width="1.6" stroke-linecap="round" transform="rotate(-24 24 24)"/></svg>';
  var dots = document.getElementById("sk-dots");
  function card(count) {
    dots.innerHTML = "";
    for (var i = 0; i < 10; i++) {
      var li = document.createElement("li"), on = i < count;
      li.className = "sk-dot" + (i === 9 ? " sk-dot--free" : "") + (on ? " is-on" : "") + (on && i === count - 1 ? " is-new" : "");
      li.style.setProperty("--r", ((i * 37) % 19 - 12) + "deg");
      li.innerHTML = STAMP + "<span>" + (i === 9 ? "Gratis" : i + 1) + "</span>";
      li.setAttribute("aria-label", (i + 1) + (i === 9 ? ", Gratis-Kaffee" : "") + (on ? ", gestempelt" : ", frei"));
      dots.appendChild(li);
    }
  }
  var mine = null;
  V.reg.addEventListener("submit", function (e) {
    e.preventDefault(); if (busy) return; clearErr(V.reg);
    var name = V.reg.name.value.trim(), mail = V.reg.email.value.trim(), fav = V.reg.fav.value;
    if (!name) return bad(V.reg, V.reg.name, "Wie dürfen wir dich nennen?");
    if (!EMAIL.test(mail)) return bad(V.reg, V.reg.email, "Die E-Mail-Adresse stimmt noch nicht ganz.");
    var code = String(1000 + Math.floor(Math.random() * 9000));
    mine = { mail: mail.toLowerCase(), code: code, name: name, count: 1 };
    document.getElementById("sk-ok-k").textContent = "// Deine Karte";
    document.getElementById("sk-ok-h").textContent = "Willkommen, " + name + "!";
    document.getElementById("sk-ok-t").textContent = "Der erste Stempel geht aufs Haus. Noch 9 bis zum Gratis-Kaffee" + (fav ? ". Wir merken uns: " + fav + "." : ".");
    document.getElementById("sk-code").textContent = code;
    card(1);
    // Anmeldung gleich vorausfüllen, falls man zurückgeht.
    V.login.email.value = mail; V.login.code.value = code;
    go("ok", "Karte angelegt. Willkommen, " + name + ". Erster Stempel gesetzt, Kartencode " + code.split("").join(" ") + ".");
  });
  V.login.addEventListener("submit", function (e) {
    e.preventDefault(); if (busy) return; clearErr(V.login);
    var mail = V.login.email.value.trim(), code = V.login.code.value.trim();
    if (!EMAIL.test(mail)) return bad(V.login, V.login.email, "Die E-Mail-Adresse stimmt noch nicht ganz.");
    if (!/^\d{4}$/.test(code)) return bad(V.login, V.login.code, "Der Kartencode hat vier Ziffern.");
    // Ohne Server: eigene Demo-Karte erkennen, sonst eine Beispielkarte aus dem Code ableiten.
    var n = mine && mine.mail === mail.toLowerCase() && mine.code === code ? mine.count : 2 + (+code[0] + +code[1] + +code[2] + +code[3]) % 7;
    document.getElementById("sk-ok-k").textContent = "// Willkommen zurück";
    document.getElementById("sk-ok-h").textContent = mine && n === mine.count ? "Hallo, " + mine.name + "!" : "Schön, dich zu sehen!";
    document.getElementById("sk-ok-t").textContent = n + " von 10 Stempeln. Noch " + (10 - n) + " bis zum Gratis-Kaffee.";
    document.getElementById("sk-code").textContent = code;
    card(n);
    go("ok", "Angemeldet. " + n + " von 10 Stempeln.");
  });
  sk.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-sk]"); if (!b) return;
    clearErr(V.login); clearErr(V.reg); go(b.getAttribute("data-sk"));
  });
  setView("login");
})();
