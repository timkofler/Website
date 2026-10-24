// Tim Kofler – Karussell mit den Beispiel-Designs und Antwort-Assistent.
// Ohne Bibliotheken, ohne Cookies, ohne Datenübertragung.
(function () {
  function boot() {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- Karussell ----------------
  var root = document.querySelector("[data-car]");
  if (root) {
    var track = root.querySelector(".tk-car__track");
    var items = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(document.querySelectorAll(".tk-car__dot"));
    var n = items.length, step = 344, x = 0, idx = 1, target = null, raf = 0;
    var dragging = false, moved = false, mouse = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;

    var measure = function () { step = n > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1; };
    var clampIdx = function (i) { return Math.max(0, Math.min(n - 1, i)); };

    var apply = function () {
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      var c = -x / step;
      for (var i = 0; i < n; i++) {
        var d = i - c, ad = Math.min(Math.abs(d), 2.5);
        items[i].style.transform = "rotateY(" + (-d * 22).toFixed(2) + "deg) scale(" + (1 - ad * 0.1).toFixed(3) + ") translateZ(" + (-ad * 70).toFixed(1) + "px)";
        items[i].style.opacity = (1 - Math.max(0, ad - 1.2) * 0.6).toFixed(2);
        items[i].classList.toggle("is-center", Math.abs(d) < 0.5);
      }
      var ni = clampIdx(Math.round(c));
      if (ni !== idx) idx = ni;
      dots.forEach(function (dot, i) { dot.classList.toggle("is-on", i === idx); dot.setAttribute("aria-current", i === idx ? "true" : "false"); });
      updatePlay();
    };

    // Die Seite im Handy scrollt erst, wenn es in der Mitte eingerastet ist; vorher bleibt der Seitenanfang stehen.
    // Wird ein Handy weggezogen, gleitet seine Seite wieder nach oben, beim nächsten Mal beginnt sie von vorn.
    var playing = -1;
    // Ein Video im Handy (z. B. Birnstoff) läuft nur in der Mitte und nur, solange das Karussell zu sehen ist
    var playVideo = function () {
      if (playing < 0) return;
      var vd = items[playing].querySelector(".tk-phone__screen > video");
      if (!vd) return;
      if (reduce || !root.classList.contains("is-visible") || (navigator.connection && navigator.connection.saveData)) { vd.pause(); return; }
      vd.muted = true; if (vd.preload === "none") vd.preload = "auto";
      vd.play().catch(function () {});
    };
    var updatePlay = function () {
      // Kleines Zucken beim senkrechten Scrollen über dem Karussell setzt die Seite nicht zurück, erst echtes Wegziehen
      var p = Math.abs(x + idx * step) < step * 0.2 ? idx : -1;
      if (p === playing) return;
      if (playing >= 0) {
        var vo = items[playing].querySelector(".tk-phone__screen > video");
        if (vo) { vo.pause(); try { vo.currentTime = 0; } catch (e) {} }
        var img = items[playing].querySelector(".tk-phone__screen > img");
        if (img) img.style.transform = window.getComputedStyle(img).transform;
        items[playing].classList.remove("is-play");
        if (img) { void img.offsetWidth; img.style.transform = "translateY(0)"; }
      }
      playing = p;
      if (p >= 0) {
        var pi = items[p].querySelector(".tk-phone__screen > img");
        if (pi) pi.style.transform = "";
        items[p].classList.add("is-play");
        playVideo();
      }
    };

    // Friseur: statt zu scrollen wechseln die drei Entwürfe, solange das Handy in der Mitte steht.
    // Ein Tipp öffnet den Entwurf, der gerade zu sehen ist; weggezogen beginnt es wieder bei Entwurf 1.
    // Eckband "Neu" für neue Beispiele (data-neu am Handy)
    items.forEach(function (it) {
      var ph = it.querySelector(".tk-phone");
      if (it.hasAttribute("data-neu") && ph) ph.insertAdjacentHTML("beforeend", '<span class="tk-neu" aria-hidden="true"><b>Neu</b></span>');
    });
    items.forEach(function (it) {
      if (!it.hasAttribute("data-vers")) return;
      var imgs = Array.prototype.slice.call(it.querySelectorAll(".tk-vers > img"));
      var marks = it.querySelectorAll(".tk-vers__tag i"), name = it.querySelector(".tk-vers__tag em"), live = it.querySelector(".tk-car__live");
      var cur = 0, timer = 0, prevT = 0;
      var show = function (k) {
        if (k === cur) return;
        clearTimeout(prevT);
        imgs.forEach(function (im) { im.classList.remove("is-prev"); });
        imgs[cur].classList.remove("is-on"); imgs[cur].classList.add("is-prev");
        imgs[k].classList.add("is-on");
        var old = imgs[cur];
        prevT = setTimeout(function () { old.classList.remove("is-prev"); }, 1100);
        cur = k;
        for (var m = 0; m < marks.length; m++) marks[m].classList.toggle("is-on", m === k);
        if (name) name.textContent = (k + 1) + " · " + imgs[k].getAttribute("data-name");
        var h = imgs[k].getAttribute("data-href");
        it.setAttribute("data-href", h);
        if (live) live.setAttribute("href", h);
      };
      // Erst wechseln, wenn das nächste Bild geladen und dekodiert ist, sonst springt es beim ersten Mal ohne Überblendung um
      var ready = function (im, cb) {
        var go = function () { if (im.decode) im.decode().then(cb, cb); else cb(); };
        if (im.complete && im.naturalWidth) go(); else im.addEventListener("load", go, { once: true });
      };
      var tick = function () {
        timer = setTimeout(function () {
          var k = (cur + 1) % imgs.length;
          ready(imgs[k], function () {
            if (timer && it.classList.contains("is-play") && root.classList.contains("is-visible") && !document.hidden) show(k);
            if (timer) tick();
          });
        }, 2800);
      };
      new MutationObserver(function () {
        var on = it.classList.contains("is-play");
        if (on) imgs.forEach(function (im) { im.loading = "eager"; });
        if (on && !timer) tick();
        if (!on && timer) { clearTimeout(timer); timer = 0; show(0); }
      }).observe(it, { attributes: true, attributeFilter: ["class"] });
    });

    var animate = function () {
      raf = 0;
      if (dragging || target === null) return;
      x += (target - x) * (reduce ? 1 : 0.14);
      if (Math.abs(target - x) < 0.4) { x = target; target = null; apply(); return; }
      apply();
      raf = window.requestAnimationFrame(animate);
    };
    var go = function (i) {
      idx = clampIdx(i);
      target = -idx * step;
      if (!raf) raf = window.requestAnimationFrame(animate);
    };

    root.addEventListener("pointerdown", function (e) {
      moved = false;   // sonst blockiert ein früheres Ziehen den nächsten Tipp auf einen Link
      mouse = e.pointerType === "mouse";
      if (e.button !== 0 || e.target.closest("a, button")) return;
      dragging = true;
      startX = lastX = e.clientX; startPos = x; lastT = performance.now(); vel = 0;
      target = null;
      root.classList.add("is-drag");
      if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      var nx = startPos + dx, min = -(n - 1) * step;
      if (nx > 0) nx = nx * 0.35;                       // weicher Widerstand an den Enden
      if (nx < min) nx = min + (nx - min) * 0.35;
      x = nx;
      var now = performance.now(), dt = Math.max(1, now - lastT);
      vel = 0.8 * vel + 0.2 * ((e.clientX - lastX) / dt);
      lastX = e.clientX; lastT = now;
      apply();
    });
    var release = function () {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-drag");
      // Schwung mitnehmen, dann auf die nächste Karte einrasten
      go(Math.round(-(x + vel * 260) / step));
    };
    root.addEventListener("pointerup", release);
    root.addEventListener("pointercancel", release);
    root.addEventListener("lostpointercapture", release);
    // Mit der Maus öffnet ein Klick jedes Handy direkt; am Handy holt ein Tipp eine seitliche Karte erst in die Mitte.
    // Der Klick landet wegen der 3D-Tiefe und der Zeigererfassung am Karussell selbst, darum zählt die Position.
    root.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); return; }
      if (e.target.closest("a, button")) return;
      var c = -x / step, i = -1;
      for (var k = 0; k < n; k++) {
        var r = items[k].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && (i < 0 || Math.abs(k - c) < Math.abs(i - c))) i = k;
      }
      if (i < 0) return;
      var href = items[i].getAttribute("data-href");
      if (href && (i === idx || mouse)) window.location.href = href;
      else if (i !== idx) go(i);
    });
    // Waagrechtes Scrollen am Trackpad
    var wheelTimer;
    root.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target = null;
      x = Math.max(-(n - 1) * step - 80, Math.min(80, x - e.deltaX));
      apply();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { go(Math.round(-x / step)); }, 120);
    }, { passive: false });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    });
    document.querySelectorAll(".tk-car__btn").forEach(function (b) {
      b.addEventListener("click", function () { go(idx + Number(b.getAttribute("data-dir"))); });
    });
    dots.forEach(function (dot, i) { dot.addEventListener("click", function () { go(i); }); });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { measure(); x = -idx * step; apply(); }, 120);
    });
    // Seiten in den Handys scrollen nur, solange das Karussell sichtbar ist
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { root.classList.toggle("is-visible", es[0].isIntersecting); playVideo(); }, { rootMargin: "0px 0px -15% 0px" }).observe(root);
    } else {
      root.classList.add("is-visible");
    }
    measure(); x = -idx * step; apply();
  }

  // ---------------- Vorschau-Videos (Beispielseiten) ----------------
  // Spielen stumm in Schleife, solange sie sichtbar sind; bei "weniger Bewegung" bleibt das Standbild.
  var pv = document.querySelectorAll("video[data-tkplay]");
  if (pv.length && !reduce && "IntersectionObserver" in window && !(navigator.connection && navigator.connection.saveData)) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var vd = e.target;
        if (e.isIntersecting) { vd.muted = true; if (vd.preload === "none") vd.preload = "auto"; vd.play().catch(function () {}); }
        else vd.pause();
      });
    }, { threshold: 0.35 });
    pv.forEach(function (vd) { po.observe(vd); });
  }

  // ---------------- Gruppen in der Beispiel-Übersicht ----------------
  // Mehrere Entwürfe einer Branche teilen sich einen Eintrag. Das Vorschaubild blendet von selbst weiter;
  // Adresszeile, Bild-Link und "Live ansehen" zeigen immer auf den Entwurf, der gerade zu sehen ist.
  var noVid = reduce || !!(navigator.connection && navigator.connection.saveData);
  Array.prototype.forEach.call(document.querySelectorAll("[data-tkg]"), function (ex) {
    var media = ex.querySelector(".tk-ex__media"), bar = media.querySelector(".tk-ex__bar > span"), live = ex.querySelector(".btn-row .btn");
    var vids = Array.prototype.slice.call(media.querySelectorAll("video"));
    var picks = Array.prototype.slice.call(ex.querySelectorAll(".tk-vpick__a"));
    var segs = Array.prototype.slice.call(media.querySelectorAll(".tk-exg__seg i"));
    var DUR = 6500, cur = -1, timer = 0, vis = false, hold = false, swapT = 0;
    ex.style.setProperty("--tkg-dur", DUR / 1000 + "s");
    if (reduce) ex.classList.add("is-still");
    function play(vd) { if (noVid || !vis) return; vd.muted = true; if (vd.preload === "none") vd.preload = "auto"; vd.play().catch(function () {}); }
    function restart(el) { el.classList.remove("is-on"); void el.offsetWidth; el.classList.add("is-on"); }
    function show(n) {
      if (n !== cur) {
        var old = vids[cur];
        if (cur < 0) vids.forEach(function (vd, i) { if (i !== n) vd.classList.remove("is-on"); });
        if (old) { old.classList.remove("is-on"); setTimeout(function () { if (!old.classList.contains("is-on")) old.pause(); }, 950); }
        cur = n;
        var vd = vids[n], pk = picks[n], href = pk.getAttribute("href");
        try { vd.currentTime = 0; } catch (e) {}
        vd.classList.add("is-on"); play(vd);
        media.href = href; live.href = href;
        media.setAttribute("aria-label", pk.dataset.name + " live ansehen");
        clearTimeout(swapT); bar.classList.add("is-swap");
        swapT = setTimeout(function () { bar.textContent = pk.dataset.url; bar.classList.remove("is-swap"); }, reduce ? 0 : 300);
        picks.forEach(function (p, i) { p.classList.toggle("is-on", i === n); });
        segs.forEach(function (s, i) { s.classList.toggle("is-on", i === n); });
        var nx = vids[(n + 1) % vids.length]; if (vis && !noVid && nx.preload === "none") nx.preload = "auto";
      }
      restart(picks[n]); if (segs[n]) restart(segs[n]);
      plan();
    }
    function plan() {
      clearTimeout(timer);
      ex.classList.toggle("is-hold", hold || !vis);
      if (!reduce && vis && !hold) timer = setTimeout(function () { show((cur + 1) % vids.length); }, DUR);
    }
    function holdOn() { hold = true; plan(); }
    function holdOff() { hold = false; show(cur); }
    picks.forEach(function (p, i) {
      p.addEventListener("mouseenter", function () { hold = true; show(i); });
      p.addEventListener("focus", function () { hold = true; show(i); });
      p.addEventListener("mouseleave", holdOff);
      p.addEventListener("blur", holdOff);
    });
    media.addEventListener("mouseenter", holdOn);
    media.addEventListener("mouseleave", holdOff);
    // Direktlink auf einen Entwurf (z. B. /beispiele/#kaffeebar) zeigt ihn gleich zuerst
    var start = 0;
    picks.forEach(function (p, i) { if (p.id && location.hash === "#" + p.id) start = i; });
    show(start);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (vis) play(vids[cur]); else vids.forEach(function (vd) { vd.pause(); });
        show(cur);
      }, { threshold: 0.35 }).observe(media);
    }
  });

  // ---------------- Rechner-Karte auf der Startseite ----------------
  // Zeigt der Reihe nach die Rechner mehrerer Branchen; Bild, Adresszeile, Titel, Text und Link wechseln gemeinsam.
  Array.prototype.forEach.call(document.querySelectorAll("[data-tkr]"), function (card) {
    var imgs = Array.prototype.slice.call(card.querySelectorAll(".tk-try__shot img"));
    var segs = Array.prototype.slice.call(card.querySelectorAll(".tk-tryr__seg i"));
    var bar = card.querySelector(".tk-ex__bar > span"), tt = card.querySelector(".tk-try__body > b"), tp = card.querySelector(".tk-try__p");
    var DUR = 4500, cur = 0, timer = 0, swapT = 0, vis = false, hold = false;
    if (reduce || imgs.length < 2) return;
    card.style.setProperty("--tkr-dur", DUR / 1000 + "s");
    function restart(el) { el.classList.remove("is-on"); void el.offsetWidth; el.classList.add("is-on"); }
    function show(n) {
      var d = imgs[n].dataset, txt = [bar, tt, tp];
      imgs[cur].classList.remove("is-on"); imgs[n].classList.add("is-on");
      cur = n;
      card.href = d.href;
      card.setAttribute("aria-label", d.t + " ausprobieren");
      clearTimeout(swapT);
      txt.forEach(function (el) { el.classList.add("is-swap"); });
      swapT = setTimeout(function () {
        bar.textContent = d.url; tt.textContent = d.t; tp.textContent = d.p;
        txt.forEach(function (el) { el.classList.remove("is-swap"); });
      }, 300);
      segs.forEach(function (s, i) { s.classList.toggle("is-on", i === n); });
      if (segs[n]) restart(segs[n]);
      var nx = imgs[(n + 1) % imgs.length]; if (nx.loading === "lazy") nx.loading = "eager";
      plan();
    }
    function plan() {
      clearTimeout(timer);
      card.classList.toggle("is-hold", hold || !vis);
      if (vis && !hold) timer = setTimeout(function () { show((cur + 1) % imgs.length); }, DUR);
    }
    card.addEventListener("mouseenter", function () { hold = true; plan(); });
    card.addEventListener("mouseleave", function () { hold = false; plan(); if (segs[cur]) restart(segs[cur]); });
    card.addEventListener("focus", function () { hold = true; plan(); });
    card.addEventListener("blur", function () { hold = false; plan(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (vis && segs[cur]) restart(segs[cur]);
        plan();
      }, { threshold: 0.5 }).observe(card);
    }
  });

  // ---------------- Antwort-Assistent ----------------
  var WA = "https://wa.me/4367761773118?text=Hallo%20Tim%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Webseite.";
  var LINKS = {
    pakete: ["Zu den Paketen", "/#pakete"], rechner: ["Richtpreis berechnen", "/#rechner"], anfrage: ["Anfrage stellen", "/#anfrage"], ablauf: ["So läuft ein Projekt", "/ablauf/"],
    kosten: ["Preise & laufende Kosten", "/ablauf/#kosten"], gratis: ["Gratis-Entwurf holen", "/entwurf/"], gruender: ["Start-Paket für Gründer", "/gruender/"],
    app: ["Beispiel-App ausprobieren", "/beispiele/betriebs-app/"], eigeneapp: ["Mehr zur eigenen App", "/#eigene-app"], extras: ["Web-Apps & Dashboards", "/#extras"],
    dash1: ["Dashboard Handwerk", "/beispiele/dashboard/"], dash2: ["Dashboard Autovermietung", "/beispiele/dashboard/v2/"], portal: ["Kundenportal im Video", "/ablauf/#portal"],
    email: ["Landingpages & E-Mail", "/#email"], checkliste: ["Checkliste holen", "/newsletter/"], empfehlen: ["Zum Empfehlungsbonus", "/#empfehlen"],
    beispiele: ["Beispielseiten ansehen", "/beispiele/"], referenz: ["Referenz crypto-x.at", "/#referenz"], ueber: ["Über Tim", "/#ueber"], fragen: ["Häufige Fragen", "/#fragen"],
    datenschutz: ["Datenschutz", "/datenschutz/"], bildnachweis: ["Bildnachweis", "/bildnachweis/"], verein: ["Gratis-Seite für Vereine", "/verein/"], vereinsapp: ["Vereins-App ausprobieren", "/beispiele/verein-app/"],
    mail: ["E-Mail schreiben", "mailto:office@tim-kofler.at"], allinkl: ["ALL-INKL ansehen (Partnerlink)", "https://all-inkl.com/PA56CC1CF457650"], webspace: ["Meine Empfehlung", "/#webspace"], whatsapp: ["Auf WhatsApp schreiben", WA], telegram: ["Auf Telegram schreiben", "https://t.me/TimKofler"]
  };
  var ANSWERS = {
    preis: { q: "Was kostet eine Webseite?", a: "Die Pakete im Überblick:\n• Referenzkunde ab 290 € (eine einfache Seite, nur wenige Plätze)\n• Start ab 590 € (eine Seite oder bis zu 3 Unterseiten)\n• Business ab 1.190 € (bis zu 8 Unterseiten, Kontaktformular, Google-Profil)\n• Gründer-Paket fix 590 € (für Neugründungen)\n• Betreuung freiwillig ab 29 € im Monat\nEinmal zahlen, kein Abo. Alle Preise sind Endpreise, als Kleinunternehmer ohne Umsatzsteuer. Einen Richtpreis für deine Wünsche zeigt dir der Angebots-Rechner.", links: ["rechner", "pakete", "gratis"] },
    laufend: { q: "Was kostet es laufend?", a: "Bei mir nichts, außer du willst die freiwillige Betreuung ab 29 € im Monat (monatlich kündbar). Webspace mit Domain und E-Mail zahlst du direkt beim Anbieter, etwa 5 bis 10 € im Monat. Lizenzgebühren oder ein Abo gibt es nicht.", links: ["kosten", "webspace"] },
    gratis: { q: "Gratis-Entwurf?", a: "Ja! Du trägst Firmenname, Wunschfarbe und die gewünschten Inhalte ein, und ich gestalte persönlich einen Entwurf für Handy und PC. Den bekommst du in der Regel innerhalb einer Woche per E-Mail. Gratis und unverbindlich: Gefällt er dir nicht, kostet es dich nichts. Der Kurzlink dafür ist tim-kofler.at/gratis.", links: ["gratis", "ablauf"] },
    gruender: { q: "Gerade gegründet?", a: "Für Betriebe, die in den letzten 12 Monaten gegründet haben oder gerade gründen, gibt es das Start-Paket fix um 590 €: Webseite mit bis zu 3 Unterseiten, Kontaktformular, Google-Unternehmensprofil, Logo-Feinschliff, Grundgerüst für Impressum und Datenschutz und Hilfe bei Domain und E-Mail. Egal ob Einzelunternehmen, OG, KG oder GmbH. Einmal zahlen, kein Abo.", links: ["gruender", "anfrage"] },
    dauer: { q: "Wie lange dauert es?", a: "Als Richtwert: Den Entwurf und einen fixen Preis bekommst du meist innerhalb einer Woche. Ab deiner Zusage ist eine Seite im Paket Start meist in 2 bis 4 Wochen online, eine größere im Paket Business in 3 bis 6 Wochen. Am meisten hängt davon ab, wie schnell Texte und Fotos da sind.", links: ["ablauf", "anfrage"] },
    ablauf: { q: "Wie läuft es ab?", a: "In fünf Schritten:\n1. Anfrage oder Gratis-Entwurf\n2. Entwurf und fixer Preis, meist innerhalb einer Woche\n3. Zusage und dein eigener Zugang zum Kundenportal\n4. Umsetzung und Feinschliff, meist 1 bis 3 Wochen\n5. Online-Schaltung und Anmeldung bei Google\nDu lieferst Logo, Fotos, Stichworte und Feedback, um Technik, Webspace, Domain und Google kümmere ich mich.", links: ["ablauf", "gratis", "anfrage"] },
    referenz: { q: "Was ist ein Referenzkunde?", a: "Ich baue gerade meine Referenzen auf. Für eine begrenzte Zahl von Kunden erstelle ich eine einfache Seite ab 290 €. Im Gegenzug darf ich sie als Referenz zeigen, du gibst eine ehrliche Google-Bewertung und im Footer steht ein kleiner Hinweis auf meine Arbeit.", links: ["pakete", "anfrage"] },
    beispiele: { q: "Gibt es Beispiele?", a: "Ja, achtzehn komplette Beispielseiten zum Durchklicken, zum Beispiel Friseur (drei Entwürfe), Café und Kaffeehaus mit Rösterei, Gasthaus Hollerhof, Glut Feuerküche, Pizzeria Proibito mit Online-Bestellung, Pension Zirbenhof mit Belegungskalender, Dachdecker First & Falz mit Dachrechner, Bodenleger Grund & Holz mit Bodenplaner, Tischlerei, Maler, Bäckerei, Fleischerei, Birnstoff Cider, Autowerkstatt und Heilmasseurin. Dazu vier Web-Apps: Betriebs-App, Vereins-App und zwei Dashboards. Alles erfundene Betriebe, live im Browser zum Ausprobieren. Tipp: Schreib mir deine Branche, dann zeige ich dir das passende Beispiel.", links: ["beispiele", "gratis"] },
    app: { q: "Eine App statt Abos?", a: "Viele Betriebe zahlen für Terminbuchung, Gutscheine, Stempelkarte und Angebote jeden Monat eigene Programme, schnell 188 € im Monat (Richtwert für sieben Einstiegstarife). Ich baue das als eine eigene App mit deinem Namen: Online-Termine, Gutscheine mit QR-Code, digitale Stempelkarte, Angebote am Handy unterschreiben und eine Büro-Ansicht. Einmal zahlen, kein Abo, sie gehört dir. Die App gibt es als Erweiterung zu jeder Webseite zum Sonderpreis. Kurzlink: tim-kofler.at/app", links: ["app", "eigeneapp", "anfrage"] },
    webapp: { q: "Web-Apps & Dashboards?", a: "Ja, neben Webseiten programmiere ich auch Werkzeuge für den Betrieb: Login-Bereiche und Kundenportale, Speisekarte oder Angebote selbst ändern, Dashboards mit deinen eigenen Zahlen, Rechner und Konfiguratoren, Reservierung, Buchung und Automatisierungen. Das läuft auf normalem Webspace. Zum Ausprobieren gibt es ein Dashboard für einen Handwerksbetrieb (Stunden, Aufträge, Rechnungen, Lager) und eines für die Autovermietung Luma Drive (Reservierungen, Belegungsplan, Übergabeprotokoll). Für Vereine gibt es eine Vereins-App mit Mitgliedern, Beiträgen und Kassabuch. Preis nach Aufwand.", links: ["dash1", "dash2", "vereinsapp"] },
    portal: { q: "Was ist das Kundenportal?", a: "Nach deiner Zusage bekommst du einen eigenen Zugang zu meinem Kundenportal. Dort siehst du den Projektstand vom Start bis Online, lädst Logo, Fotos und Texte hoch und schreibst mir Wünsche, Fragen oder was dir gefällt. So bleibt alles an einem Ort, statt in vielen E-Mails. Den Zugang bekommst du per Willkommensmail, dein Passwort legst du selbst fest. Auf Wunsch schützt ein Code am Handy (2FA) dein Konto zusätzlich.", links: ["portal", "ablauf"] },
    verein: { q: "Seite für einen Verein?", a: "Für Vereine im Mostviertel baue ich die Vereinsseite gratis: Termine, Mitglied werden, Kontakt und Anfahrt. Keine Rechnung und kein Abo bei mir, dafür steht unten ein kleiner Hinweis auf mich. Domain und Webspace zahlt der Verein, etwa 5 bis 10 € im Monat. Alles läuft online über das Kundenportal. Als Zusatz gibt es eine Vereins-App für Mitglieder, Beiträge und Kassabuch, einmal bezahlt.", links: ["verein", "vereinsapp"] },
    email: { q: "Landingpage & Newsletter?", a: "Ja, mache ich: Landingpages für Aktionen oder Anzeigen, Newsletter-Anmeldung mit Double-Opt-in und automatische E-Mails wie eine Willkommensserie. Der Versand läuft über Brevo, einen E-Mail-Dienst aus der EU. Den Preis bekommst du je nach Umfang als Angebot.", links: ["email", "anfrage"] },
    checkliste: { q: "Gratis-Checkliste?", a: "Die Checkliste „10 Punkte für mehr Anfragen“ zeigt dir, was Webseite und Google-Profil brauchen, damit Kunden anrufen. Du bekommst sie gratis per E-Mail, dazu gelegentlich Tipps (Double-Opt-in, Abmeldung jederzeit mit einem Klick). Kurzlink: tim-kofler.at/checkliste", links: ["checkliste"] },
    empfehlung: { q: "Empfehlungsbonus?", a: "Ja! Für jeden neuen Kunden, den du mir vermittelst, bekommst du 50 € als Dankeschön, auch wenn du selbst kein Kunde bist. Dein Kontakt nennt bei der Anfrage deinen Namen im Feld „Empfohlen von“. Ausgezahlt wird, sobald die erste Rechnung bezahlt ist. Der Bonus gilt für Aufträge ab 290 €.", links: ["empfehlen", "anfrage"] },
    eigentum: { q: "Gehört mir die Seite?", a: "Ja. Die Seite liegt auf deinem eigenen Webspace, Domain und Webspace laufen auf deinen Namen. Du zahlst einmal und bekommst alle Zugänge. Es gibt kein Abo und keine Bindung an mich.", links: ["ablauf"] },
    hosting: { q: "Domain & Hosting?", a: "Domain und Webspace laufen auf deinen Namen, die Seite gehört dir. Ich empfehle ALL-INKL.COM, dort laufen auch meine eigenen Seiten: ab 4,95 € im Monat, mit eigener .at-Domain und eigenen E-Mail-Adressen wie office@deinbetrieb.at, erster Monat kostenlos, monatlich kündbar. Mein Tipp ist Privat+ um 7,95 € mit SSL und 24-Stunden-Hotline. Auf Wunsch richte ich alles für dich ein.\n(Partnerlink: Für dich ändert sich am Preis nichts, ich bekomme eine kleine Provision.)", links: ["webspace", "allinkl", "anfrage"] },
    bestehend: { q: "Ich habe schon eine Seite", a: "Kein Problem. Die neue Seite entsteht unter einer eigenen Vorschau-Adresse, deine bisherige bleibt online, bis die neue fertig ist und wir gemeinsam umschalten. Deine E-Mail-Adressen laufen dabei ganz normal weiter. Wie deine Seite neu aussehen könnte, zeigt dir der Gratis-Entwurf.", links: ["gratis", "anfrage"] },
    aendern: { q: "Kann ich selbst etwas ändern?", a: "Kleine Änderungen an Texten und Bildern übernehme ich mit der Betreuung (ab 29 € im Monat) oder einzeln nach Aufwand. Willst du Speisekarte, Angebote oder Preise selbst ändern, baue ich dir dafür eine einfache Eingabe als Extra. Neue Unterseiten oder Funktionen lassen sich jederzeit ergänzen.", links: ["rechner", "anfrage"] },
    technik: { q: "Muss ich mich auskennen?", a: "Nein. Du lieferst Infos, Fotos und dein Feedback. Um Webspace, Domain, Sicherheit und die Anmeldung bei Google kümmere ich mich und erkläre dir alles in normalen Worten.", links: ["ablauf"] },
    texte: { q: "Wer schreibt die Texte?", a: "Fotos und Infos lieferst du. Wenn du nicht gern schreibst, formuliere ich die Texte nach deinen Stichworten gegen Aufpreis. Impressum und Datenschutz bekommst du als Grundgerüst, abgestimmt auf deine Seite (eine Rechtsberatung ist das nicht).", links: ["rechner", "anfrage"] },
    shop: { q: "Bestellen & Buchen?", a: "Ja, das geht: zum Beispiel Online-Bestellung mit Abholung oder Lieferung wie bei der Pizzeria Proibito, Zimmer-Anfragen mit Belegungskalender wie bei der Pension Zirbenhof oder Terminbuchung in der eigenen App. Was genau du brauchst, besprechen wir, der Preis richtet sich nach dem Aufwand.", links: ["beispiele", "app", "anfrage"] },
    sprache: { q: "Zweite Sprache?", a: "Ja, zum Beispiel Englisch für Gäste oder Kunden aus dem Ausland. Die Übersetzung lieferst du, oder wir besprechen sie. Im Angebots-Rechner kannst du die zweite Sprache dazunehmen.", links: ["rechner", "anfrage"] },
    google: { q: "Werde ich bei Google gefunden?", a: "Jede Seite bekommt saubere Grundlagen: schnelle Ladezeit, gute Titel und Beschreibungen, Sitemap, strukturierte Daten und die Anmeldung bei Google. Im Paket Business und im Gründer-Paket richte ich auch dein Google-Unternehmensprofil ein. Einen bestimmten Platz kann niemand seriös versprechen, aber die Basis stimmt.", links: ["pakete", "checkliste"] },
    tracking: { q: "Datenschutz & Tracking?", a: "Deine Seite bekommt keine Analyse- oder Werbedienste, wenn du das nicht ausdrücklich willst. Schriften und Bilder liegen auf deinem eigenen Webspace, ohne Umweg über fremde Server. Auch dieser Assistent speichert und sendet nichts.", links: ["datenschutz"] },
    baukasten: { q: "Warum kein Baukasten?", a: "Eine programmierte Seite lädt nur, was sie braucht. Sie ist schneller, sicherer, braucht keine Plugin-Updates und das Design gibt es so nur einmal. Meine eigene Seite crypto-x.at bekommt von Google Lighthouse 100 von 100 Punkten am Computer.", links: ["beispiele", "referenz"] },
    region: { q: "Nur in Niederösterreich?", a: "Ich arbeite für Kunden in ganz Österreich, nicht nur in Niederösterreich. Mein Büro ist in Oberndorf an der Melk. Besprochen wird per WhatsApp oder Telegram, Fotos und Texte lädst du im Kundenportal hoch. Ein Termin vor Ort ist nicht nötig.", links: ["anfrage", "whatsapp"] },
    ueber: { q: "Wer ist Tim?", a: "Ich bin Tim Kofler, Softwareentwickler aus Oberndorf an der Melk in Niederösterreich, und Perfektionist: Jede Seite programmiere ich selbst und prüfe sie am Handy, bevor sie online geht. Mein eigenes Projekt ist das CryptoX Dashboard auf crypto-x.at.", links: ["ueber", "referenz"] },
    bilder: { q: "Woher kommen die Fotos?", a: "Am besten sind deine eigenen Fotos vom Betrieb. Wo das nicht geht, nutze ich nur Bilder und Videos mit belegter freier Lizenz und notiere Quelle und Lizenz, damit du keinen Ärger bekommst. Für meine Beispielseiten steht alles im Bildnachweis.", links: ["bildnachweis"] },
    hallo: { q: "Hallo", a: "Hallo, schön, dass du da bist! Frag mich zum Beispiel nach Preisen, dem Gratis-Entwurf, dem Ablauf oder Beispielen für deine Branche. Oder schreib Tim direkt per WhatsApp.", links: ["gratis", "whatsapp"] },
    whatsapp: { q: "Per WhatsApp schreiben", a: "Klar! Schreib Tim direkt auf WhatsApp. Ein Klick öffnet den Chat mit einer kurzen Begrüßung, die du noch ändern kannst. Lieber Telegram? Dort findest du mich als @TimKofler. Tim meldet sich so bald wie möglich persönlich.", links: ["whatsapp", "telegram", "anfrage"] },
    kontakt: { q: "Persönlich anfragen", a: "Gerne! Am schnellsten über das Anfrageformular. Oder direkt per E-Mail an office@tim-kofler.at, gerne auch per WhatsApp oder Telegram (@TimKofler).", links: ["anfrage", "whatsapp", "telegram", "mail"] }
  };
  var CHIPS = ["preis", "gratis", "beispiele", "whatsapp", "gruender", "verein", "dauer", "app", "webapp", "laufend", "ablauf", "empfehlung", "kontakt"];
  // Eingetippte Fragen: Text wird vereinfacht (klein, ä→ae …), dann zählt das Thema mit den meisten Treffern;
  // bei Gleichstand gewinnt das weiter oben stehende. Die Wörter sind daher schon ohne Umlaute geschrieben.
  var KEYWORDS = [
    ["whatsapp", /(whats ?app|\bwa\b|chatten|telegram)/g],
    ["gruender", /(gruend|gegruendet|neugruend|startup|selbststaendig gemacht|neu eroeffn|eroeffnung)/g],
    ["gratis", /(gratis|kostenlos|umsonst|entwurf|unverbindlich|vorschau|probe)/g],
    ["verein", /(verein|obmann|obfrau|mitglieder|feuerwehr|musikverein|sportverein|kassier|ehrenamt)/g],
    ["checkliste", /(checkliste|10 punkte|tipps)/g],
    ["empfehlung", /(empfehl|weiterempf|bonus|provision|vermittel|50 ?(€|euro))/g],
    ["app", /(\bapp\b|abo|stempelkarte|gutschein|treuekarte|termin ?buch|online-?termin|unterschr)/g],
    ["webapp", /(web-?app|dashboard|software|programm(?!ier)|tool|konfigurator|lager|stundenerfass|automatis|luma|autovermiet|verwaltung)/g],
    ["portal", /(kundenportal|portal|hochlad|upload|projektstand|login|passwort|2fa|zwei-?faktor)/g],
    ["shop", /(shop|bestell|liefer|reservier|buchung|buchen|zimmer)/g],
    ["laufend", /(laufend|monatlich|pro monat|im monat|folgekosten|fixkosten|nebenkosten|betreuung|wartung|vertrag|bindung|kuendig)/g],
    ["referenz", /(referenz|290)/g],
    ["preis", /(preis|kost|euro|€|teuer|guenstig|budget|angebot|zahlen|bezahl|paket|business|590|1\.?190)/g],
    ["dauer", /(dauer|wie lange|wann|zeit|schnell fertig|bis wann|wochen)/g],
    ["ablauf", /(ablauf|prozess|schritt|vorgehen|wie laeuft|wie geht|start)/g],
    ["beispiele", /(beispiel|muster|vorlage|zeig|portfolio|arbeiten|referenzen)/g],
    ["hosting", /(domain|hosting|webspace|server|all-?inkl|e-?mail-?adresse|postfach)/g],
    ["email", /(landing|newsletter|mail|brevo|marketing)/g],
    ["eigentum", /(gehoert|eigentum|besitz|zugaenge|zugangsdaten)/g],
    ["bestehend", /(schon eine|bestehend|alte seite|alte webseite|relaunch|ueberarbeit|erneuer|modernisier|umbau)/g],
    ["aendern", /(selbst aender|selber aender|aendern|bearbeiten|aktualis|erweiter|cms)/g],
    ["technik", /(technik|auskennen|keine ahnung|kompliziert|laie)/g],
    ["texte", /(text|schreib|formulier|impressum|datenschutzerklaer|agb|recht)/g],
    ["sprache", /(sprache|englisch|mehrsprach|uebersetz|international)/g],
    ["google", /(google|seo|gefunden|ranking|suchmaschine|maps|bewertung)/g],
    ["tracking", /(tracking|cookie|dsgvo|datenschutz|analytics|privat)/g],
    ["baukasten", /(baukasten|wix|wordpress|jimdo|template|homepage-?baukasten|lighthouse|programmiert|selbst gebaut|handgemacht)/g],
    ["region", /(niederoesterreich|oesterreich|wien|linz|graz|salzburg|st\.? ?poelten|amstetten|melk|scheibbs|vor ort|besuch|kommst du|region|umgebung|wo bist|wo sitzt)/g],
    ["ueber", /(wer bist|ueber dich|ueber tim|wer ist tim|erfahrung|ausbildung)/g],
    ["bilder", /(foto|bild|video|lizenz|fotograf)/g],
    ["hallo", /^(hallo|hi|hey|servus|gruess|guten (tag|morgen|abend)|moin)\b/g],
    ["kontakt", /(kontakt|anruf|telefon|termin|gespraech|treffen|erreich|nummer|sprechen)/g]
  ];
  // Branche erkannt: passendes Beispiel als Extra-Link, bzw. als eigene Antwort
  var BRANCHEN = [
    [/(friseur|frisoer|haar|salon|barber)/, "Friseur", "Haarwerk Studio, Mähne und Seide", "/beispiele/friseur/"],
    [/(pizz|italien)/, "Pizzeria", "Proibito Steinofen-Pizzeria mit Online-Bestellung", "/beispiele/pizzeria/"],
    [/(pension|hotel|zimmer|gaestehaus|ferienwohn|urlaub|unterkunft|gasthof)/, "Pension", "Gasthof & Pension Zirbenhof mit Belegungskalender", "/beispiele/pension/"],
    [/(gasthaus|wirt|restaurant|beisl|heuriger|kueche|grill|lokal|gastro)/, "Gasthaus", "Landgasthof Hollerhof und Glut Feuerküche", "/beispiele/gasthaus/"],
    [/(kaffeehaus|roester|roestzeit|kaffeebar)/, "Kaffeehaus", "röstzeit Kaffeehaus", "/beispiele/kaffeebar/"],
    [/(cafe|kaffee|konditor)/, "Café", "Café Mühlbach", "/beispiele/cafe/"],
    [/(dachdeck|spengler|\bdach)/, "Dachdecker", "Dachdeckerei First & Falz mit Dachrechner", "/beispiele/dachdecker/"],
    [/(bodenleger|boden|parkett|fliese)/, "Bodenleger", "Grund & Holz mit Bodenplaner", "/beispiele/bodenleger/"],
    [/(tischler|schreiner|moebel|kueche nach mass)/, "Tischlerei", "Tischlerei Holzwerk Brandl", "/beispiele/tischlerei/"],
    [/(maler|anstreich|fassade)/, "Malerbetrieb", "Malerei Lindner", "/beispiele/maler/"],
    [/(installateur|haustechnik|elektrik|elektriker|heizung|sanitaer|handwerk)/, "Handwerk", "Dashboard Haustechnik Kofler", "/beispiele/dashboard/"],
    [/(werkstatt|kfz|mechanik|reifen)/, "Autowerkstatt", "KFZ Steiner", "/beispiele/werkstatt/"],
    [/(autovermiet|mietwagen|verleih)/, "Vermietung", "Luma Drive Autovermietung", "/beispiele/dashboard/v2/"],
    [/(baecker|brot|semmel)/, "Bäckerei", "Bäckerei Kornfeld", "/beispiele/baeckerei/"],
    [/(fleisch|metzger|partyservice|catering)/, "Fleischerei", "Fleischerei Haselberger mit Partyservice", "/beispiele/fleischerei/"],
    [/(massage|physio|therap|praxis|kosmetik|wellness)/, "Praxis", "Praxis Sonnfeld", "/beispiele/massage/"],
    [/(getraenk|cider|most|saft|brennerei|winzer|wein)/, "Getränke", "Birnstoff Cider", "/beispiele/cider/"]
  ];
  function simpel(t) {
    return t.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/é/g, "e");
  }

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tk-chat-btn";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "tk-chat");
  btn.setAttribute("aria-label", "Fragen? Antwort-Assistent und WhatsApp");
  // Symbol und Text wechseln langsam zwischen TK und WhatsApp (nur CSS, kein Skript von WhatsApp)
  btn.innerHTML = '<span class="tk-chat-btn__ic" aria-hidden="true"><img src="/assets/img/tk-badge-2.svg" alt=""><img class="tk-chat-btn__wa" src="/assets/img/wa-badge.svg?v=c266c6f8" alt=""></span><i aria-hidden="true"></i><span class="tk-chat-btn__t" aria-hidden="true"><span>Fragen?</span><span class="tk-chat-btn__wa">WhatsApp</span></span>';

  var box = document.createElement("div");
  box.className = "tk-chat";
  box.id = "tk-chat";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Antwort-Assistent");
  box.innerHTML =
    '<div class="tk-chat__head"><img src="/assets/img/tk-badge-2.svg" alt=""><div><b>Fragen zur Webseite?</b><small>Antworten auf die häufigsten Fragen</small></div>' +
    '<button type="button" class="tk-chat__x" aria-label="Schließen">✕</button></div>' +
    '<div class="tk-chat__log" aria-live="polite"></div>' +
    '<div class="tk-chat__cw"><button type="button" class="tk-chat__arr tk-chat__arr--l" aria-label="Vorherige Themen" tabindex="-1">‹</button><div class="tk-chat__chips"></div><button type="button" class="tk-chat__arr tk-chat__arr--r" aria-label="Weitere Themen" tabindex="-1">›</button></div>' +
    '<a class="tk-chat__wabar" href="https://wa.me/4367761773118?text=Hallo%20Tim%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Webseite." target="_blank" rel="noopener"><img src="/assets/img/wa-badge.svg?v=c266c6f8" alt=""><span><b>Lieber direkt mit Tim schreiben?</b> Per WhatsApp</span><em aria-hidden="true">→</em></a>' +
    '<form class="tk-chat__form"><label class="sr-only" for="tk-chat-in">Deine Frage</label><input id="tk-chat-in" type="text" maxlength="200" autocomplete="off" placeholder="Frage eintippen …"><button type="submit" aria-label="Senden">→</button></form>' +
    '<p class="tk-chat__note">Automatische Antworten, keine KI. Es wird nichts gespeichert oder gesendet.</p>';
  document.body.appendChild(btn);
  document.body.appendChild(box);

  var log = box.querySelector(".tk-chat__log");
  var chips = box.querySelector(".tk-chat__chips");
  var input = box.querySelector("input");
  var started = false;

  function bubble(text, who, links) {
    var m = document.createElement("div");
    m.className = "tk-msg tk-msg--" + who;
    m.textContent = text;   // Eingaben nur als Text, nie als HTML
    if (links && links.length) {
      var row = document.createElement("div");
      row.className = "tk-msg__links";
      links.forEach(function (k) {
        var l = typeof k === "string" ? LINKS[k] : k;   // Schlüssel aus LINKS oder direkt [Text, Adresse]
        var a = document.createElement("a");
        a.href = l[1];
        a.textContent = l[0];
        if (/^https?:/.test(l[1])) { a.target = "_blank"; a.rel = k === "allinkl" ? "sponsored noopener" : "noopener"; }
        if (l[1].charAt(0) === "/") a.addEventListener("click", function () { close(); });
        row.appendChild(a);
      });
      m.appendChild(row);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function botSay(text, links) {
    var t = document.createElement("div");
    t.className = "tk-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); bubble(text, "bot", links); }, reduce ? 0 : 550);
  }
  function answer(key, asked) {
    var item = ANSWERS[key];
    bubble(asked || item.q, "me");
    botSay(item.a, item.links);
  }
  function renderChips() {
    chips.textContent = "";
    CHIPS.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = ANSWERS[k].q;
      b.addEventListener("click", function () { answer(k); });
      chips.appendChild(b);
    });
    chipEdges();
  }
  // Themen-Leiste auch mit der Maus bedienbar: Pfeile, Mausrad und Ziehen
  var cw = box.querySelector(".tk-chat__cw");
  function chipEdges() {
    var max = chips.scrollWidth - chips.clientWidth;
    cw.classList.toggle("is-start", chips.scrollLeft > 2);
    cw.classList.toggle("is-end", chips.scrollLeft < max - 2);
  }
  chips.addEventListener("scroll", chipEdges, { passive: true });
  window.addEventListener("resize", chipEdges);
  cw.querySelectorAll(".tk-chat__arr").forEach(function (a) {
    a.addEventListener("click", function () {
      var dir = a.classList.contains("tk-chat__arr--l") ? -1 : 1;
      chips.scrollBy({ left: dir * chips.clientWidth * 0.7, behavior: "smooth" });
    });
  });
  chips.addEventListener("wheel", function (e) {
    if (chips.scrollWidth <= chips.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    chips.scrollLeft += e.deltaY;
  }, { passive: false });
  var drag = null;
  chips.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: chips.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) { drag.moved = true; cw.classList.add("is-drag"); }
    if (drag.moved) chips.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    var moved = drag.moved;
    drag = null;
    cw.classList.remove("is-drag");
    // Nach dem Ziehen keinen Klick auf ein Thema auslösen
    if (!moved) return;
    var stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
    chips.addEventListener("click", stop, true);
    setTimeout(function () { chips.removeEventListener("click", stop, true); }, 0);
  });
  function open() {
    box.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      renderChips();
      botSay("Hallo! Ich beantworte die häufigsten Fragen zu Webseiten von Tim Kofler. Wähle ein Thema oder tipp deine Frage ein.");
    }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    box.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  btn.addEventListener("click", open);
  box.querySelector(".tk-chat__x").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
  box.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    var low = simpel(text), best = null, top = 0;
    for (var i = 0; i < KEYWORDS.length; i++) {
      var n = (low.match(KEYWORDS[i][1]) || []).length;
      if (n > top) { top = n; best = KEYWORDS[i][0]; }
    }
    var br = null;
    for (var j = 0; j < BRANCHEN.length; j++) if (BRANCHEN[j][0].test(low)) { br = BRANCHEN[j]; break; }
    var brLink = br && ["Beispiel " + br[1] + " ansehen", br[3]];
    if (best) {
      var links = ANSWERS[best].links;
      if (br) links = [brLink].concat(links.filter(function (k) { return k !== "beispiele"; })).slice(0, 4);
      bubble(text, "me");
      botSay(ANSWERS[best].a, links);
      return;
    }
    bubble(text, "me");
    if (br) {
      botSay("Passend zu deiner Branche gibt es ein fertiges Beispiel zum Durchklicken: " + br[2] + ". Es ist ein erfundener Betrieb, deine Seite bekommt natürlich ein eigenes Design. Wie sie aussehen könnte, zeigt dir der Gratis-Entwurf.", [brLink, "gratis", "beispiele"]);
      return;
    }
    botSay("Das beantwortet Tim dir am besten persönlich. Schreib ihm kurz, am schnellsten per WhatsApp oder Telegram oder über das Formular.", ["whatsapp", "telegram", "anfrage", "mail"]);
  });
  }
  // Erst nach dem Laden der Seite einrichten, damit der Seitenaufbau nicht gebremst wird
  if (document.readyState === "complete") setTimeout(boot, 300);
  else window.addEventListener("load", function () { setTimeout(boot, 300); });
})();

// Unten beim Schriftzug „Tim Kofler" die schwebenden Knöpfe ausblenden (Klasse tk-at-end, Rest macht CSS)
(function () {
  var sign = document.querySelector(".tk-sign");
  if (!sign || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (e) {
    document.documentElement.classList.toggle("tk-at-end", e[0].isIntersecting);
  }, { rootMargin: "0px 0px -15% 0px" }).observe(sign);
})();

// Im Anfrage-Bereich sind alle Kontaktwege schon da: schwebende Knöpfe ausblenden, damit sie keine Felder verdecken (Klasse tk-in-anf)
(function () {
  var anf = document.querySelector("[data-anf]");
  if (!anf || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (e) {
    document.documentElement.classList.toggle("tk-in-anf", e[0].isIntersecting);
  }, { rootMargin: "0px 0px -25% 0px" }).observe(anf);
})();

// Anfrage [10]: Reiter "Anfrage schreiben" / "Rückruf". Ohne JS stehen beide Formulare untereinander.
(function () {
  var box = document.querySelector("[data-anf]");
  if (!box) return;
  var list = box.querySelector(".anf__tabs");
  var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
  if (!list || !tabs.length) return;
  var panel = function (t) { return document.getElementById(t.getAttribute("aria-controls")); };
  var select = function (t, focus) {
    tabs.forEach(function (o) {
      var on = o === t, p = panel(o);
      o.setAttribute("aria-selected", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
      if (p) { p.hidden = !on; p.classList.toggle("is-in", on); }
    });
    if (focus) t.focus();
  };
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  document.documentElement.classList.add("anf-js");
  list.hidden = false;
  select(tabs[0]);
  box.querySelectorAll(".anf__panel").forEach(function (p) { p.classList.remove("is-in"); });
})();

/* Startseite am Handy: aufklappbare Karten (data-mf-open), klappen auch wieder zu. Anker-Links auf eingeklappte Inhalte klappen sie automatisch auf. */
(function () {
  var openers = document.querySelectorAll("[data-mf-open]");
  if (!openers.length) return;
  function set(key, on) {
    var sec = document.querySelector('[data-mf-sec="' + key + '"]');
    if (sec) sec.classList.toggle("mf-open", on);
    document.querySelectorAll('[data-mf="' + key + '"]').forEach(function (el) { el.classList.toggle("mf-open", on); });
    document.querySelectorAll('[data-mf-open="' + key + '"]').forEach(function (b) {
      b.setAttribute("aria-expanded", on ? "true" : "false");
      var l = b.querySelector("[data-less]");
      if (l) { if (!l.hasAttribute("data-more")) l.setAttribute("data-more", l.textContent); l.textContent = l.getAttribute(on ? "data-less" : "data-more"); }
    });
  }
  function open(key) { set(key, true); }
  // Teile, die im Quelltext vor ihrem Knopf stehen (Web-Apps: Funktionsliste, Fragen 7 bis 13), wandern hinter den Knopf,
  // damit alles unter dem Knopf aufgeht und nichts darüber die Seite verschiebt. Karten (.mf-slot) gibt es nur am Handy,
  // ihre Teile kommen am PC wieder an den alten Platz; Knöpfe wie „Alle Fragen anzeigen“ gelten überall.
  var mq = window.matchMedia("(max-width: 680px)"), moved = [];
  openers.forEach(function (b) {
    var anchor = b.closest(".mf-slot") || b, after = anchor;
    document.querySelectorAll('[data-mf="' + b.getAttribute("data-mf-open") + '"]').forEach(function (el) {
      if (!(el.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING)) return;
      var mark = document.createComment("mf"); el.parentNode.insertBefore(mark, el);
      moved.push({ el: el, mark: mark, after: after, mobile: anchor !== b }); after = el;
    });
  });
  function place() {
    moved.forEach(function (m) {
      var ref = !m.mobile || mq.matches ? m.after : m.mark;
      ref.parentNode.insertBefore(m.el, ref.nextSibling);
    });
  }
  if (moved.length) { place(); if (mq.addEventListener) mq.addEventListener("change", place); }
  openers.forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-mf-open"), on = b.getAttribute("aria-expanded") !== "true";
      var top = b.getBoundingClientRect().top;
      set(key, on);
      // Der Knopf bleibt an derselben Stelle im Bild, statt dass die Seite springt
      var d = b.getBoundingClientRect().top - top;
      if (d) window.scrollBy({ top: d, behavior: "instant" });
    });
  });
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (!el) return;
    var hidden = el.closest("[data-mf]:not(.mf-open), .mf-sec:not(.mf-open)");
    if (!hidden) return;
    open(hidden.getAttribute("data-mf") || hidden.getAttribute("data-mf-sec"));
    requestAnimationFrame(function () { el.scrollIntoView({ behavior: "auto", block: "start" }); });
  }
  fromHash();
  if (document.readyState !== "complete") window.addEventListener("load", function () {
    var el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el && el.closest("[data-mf], .mf-sec")) el.scrollIntoView({ behavior: "auto", block: "start" });
  });
  window.addEventListener("hashchange", fromHash);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (a && a.pathname === location.pathname && a.hash === location.hash) fromHash();
  });
})();
