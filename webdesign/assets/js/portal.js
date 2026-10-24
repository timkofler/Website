// Kundenportal: Reiter, Fortschrittsanzeige beim Hochladen, Nachrichtenfeld, Passwort anzeigen, Kopieren der Zugangsdaten und QR-Code für die Authenticator-App.
// Ohne JavaScript funktioniert alles genauso, nur ohne Fortschrittsbalken.
(function () {
  function size(b) {
    if (b >= 1073741824) return (b / 1073741824).toFixed(1).replace('.0', '').replace('.', ',') + ' GB';
    if (b >= 1048576) return (b / 1048576).toFixed(b >= 10485760 ? 0 : 1).replace('.', ',') + ' MB';
    return Math.ceil(b / 1024) + ' KB';
  }

  var form = document.querySelector('[data-kp-upload]');
  if (form && window.FormData && window.XMLHttpRequest) {
    var input = form.querySelector('input[type=file]');
    var box = form.querySelector('.kp-progress');
    var bar = form.querySelector('.kp-progress__bar');
    var text = form.querySelector('.kp-progress__text');
    var btn = form.querySelector('button[type=submit]');
    var maxFile = +form.dataset.maxFile || 0, maxPost = +form.dataset.maxPost || 0, maxCount = +form.dataset.maxCount || 0;

    function check() {
      var files = Array.prototype.slice.call(input.files || []), total = 0, msg = '';
      files.forEach(function (f) { total += f.size; if (maxFile && f.size > maxFile) msg = '„' + f.name + '“ ist zu groß (höchstens ' + size(maxFile) + ').'; });
      if (!msg && maxCount && files.length > maxCount) msg = 'Bitte höchstens ' + maxCount + ' Dateien auf einmal.';
      if (!msg && maxPost && total > maxPost * 0.98) msg = 'Zusammen sind das ' + size(total) + '. Bitte in kleineren Portionen hochladen (höchstens ' + size(maxPost) + ').';
      input.setCustomValidity(msg);
      return files.length ? files.length + (files.length === 1 ? ' Datei' : ' Dateien') + ', ' + size(total) : '';
    }
    var info = form.querySelector('.kp-pick__info');
    input.addEventListener('change', function () { var t = check(); if (info) info.textContent = t || 'Keine Datei ausgewählt'; input.reportValidity(); });

    form.addEventListener('submit', function (ev) {
      check();
      if (!form.checkValidity()) return;
      ev.preventDefault();
      var xhr = new XMLHttpRequest();
      xhr.open('POST', form.action);
      xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) return;
        var p = Math.round(e.loaded / e.total * 100);
        bar.style.width = p + '%';
        text.textContent = p < 100 ? 'Wird hochgeladen … ' + p + ' %' : 'Wird gespeichert …';
      };
      // Die Antwort ist schon die fertige Seite mit der Meldung (Weiterleitung wurde mitgenommen): direkt anzeigen.
      xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) { document.open(); document.write(xhr.responseText); document.close(); window.scrollTo(0, 0); }
        else window.location.href = form.action;
      };
      xhr.onerror = function () {
        btn.disabled = false; box.hidden = true;
        alert('Die Verbindung wurde unterbrochen. Bitte versuche es noch einmal.');
      };
      btn.disabled = true; box.hidden = false; bar.style.width = '0'; text.textContent = 'Wird hochgeladen …';
      xhr.send(new FormData(form));
    });
  }

  // Nachrichtenverlauf: neueste Nachricht sichtbar (geht erst, wenn der Bereich sichtbar ist).
  function chatDown() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-kp-chat]'), function (c) {
      if (c.offsetParent && !location.hash.match(/^#n-/)) c.scrollTop = c.scrollHeight;
    });
  }

  // Große Kacheln als Reiter: immer nur ein Bereich sichtbar. Die Adresse (#nachrichten, #dateien …) merkt sich den Reiter,
  // damit man nach dem Absenden wieder im selben Bereich landet. Die Bereiche haben dafür bewusst keine id, sonst
  // springt der Browser beim Laden hinunter und die Kacheln sind weg. Ohne JavaScript stehen alle Bereiche untereinander.
  var tabs = document.querySelector('[data-kp-tabs]');
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-kp-panel]'));
  if (tabs && panels.length) {
    document.documentElement.classList.add('kp-tabs-on');
    var show = function (id) {
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-kp-panel') === id); });
      Array.prototype.forEach.call(tabs.querySelectorAll('[data-kp-tab]'), function (t) {
        var on = t.getAttribute('data-kp-tab') === id;
        t.classList.toggle('is-active', on);
        if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      });
      chatDown();
    };
    // Zu welchem Bereich gehört die Adresse? Auch Sprungziele innerhalb eines Bereichs (z. B. eine einzelne Nachricht).
    var fromHash = function () {
      var h = location.hash.slice(1); try { h = decodeURIComponent(h); } catch (e) { h = ""; }
      if (!h) return null;
      if (document.querySelector('[data-kp-panel="' + h.replace(/[^a-z0-9-]/gi, '') + '"]')) return h;
      var el = document.getElementById(h);
      if (el && el.tagName === 'DETAILS') el.open = true;
      var p = el && el.closest('[data-kp-panel]');
      return p ? p.getAttribute('data-kp-panel') : null;
    };
    show(fromHash() || tabs.getAttribute('data-default') || panels[0].getAttribute('data-kp-panel'));
    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('[data-kp-tab]');
      if (!t) return;
      e.preventDefault();
      show(t.getAttribute('data-kp-tab'));
      if (history.replaceState) history.replaceState(null, '', '#' + t.getAttribute('data-kp-tab'));
    });
    window.addEventListener('hashchange', function () {
      var id = fromHash();
      if (id) show(id);
    });
  } else {
    chatDown();
  }
  // Links auf ein zugeklapptes Feld (z. B. „Passwort“ oben) klappen es auf.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    var el = a && a.getAttribute('href').length > 1 ? document.getElementById(a.getAttribute('href').slice(1)) : null;
    if (el && el.tagName === 'DETAILS') el.open = true;
  });

  // QR-Code für die Zwei-Faktor-Einrichtung, direkt im Browser erzeugt (der Schlüssel geht an keinen fremden Dienst).
  var qr = document.querySelector('[data-kp-qr]');
  if (qr && window.qrcode) {
    var q = window.qrcode(0, 'M');
    q.addData(qr.getAttribute('data-kp-qr'));
    q.make();
    qr.innerHTML = q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }

  // Codefelder: sechs Kästchen über dem echten Eingabefeld (Einfügen und Autofill vom Handy gehen weiter).
  // Beim Anmelden läuft eine Linie prüfend um jedes Kästchen, dann kippen alle langsam in die Mitte zu einem einzigen.
  // Das schickt den Code im Hintergrund ab: richtig = grünes Häkchen und weiter, falsch = rotes Kreuz und die Seite
  // des Servers mit seiner Meldung. Prüfen tut wie bisher nur der Server.
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function later(ms, fn) { setTimeout(fn, reduce ? 0 : ms); }
  Array.prototype.forEach.call(document.querySelectorAll('input.kp-otp[inputmode=numeric]'), function (el) {
    var wrap = document.createElement('span'), cells = document.createElement('span'), i;
    wrap.className = 'kp-code';
    cells.className = 'kp-code__cells';
    cells.setAttribute('aria-hidden', 'true');
    for (i = 0; i < 6; i++) cells.appendChild(document.createElement('i'));
    cells.insertAdjacentHTML('beforeend', '<svg class="kp-code__ok" viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l7.5 7.5L37.5 19"/></svg>'
      + '<b class="kp-code__m"><svg class="kp-code__y" viewBox="0 0 24 24"><path d="m5.5 12.5 4.2 4.2L18.5 7.8"/></svg><svg class="kp-code__n" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg></b>');
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el); wrap.appendChild(cells);
    el.removeAttribute('placeholder');
    var m = cells.querySelector('.kp-code__m');
    var form = el.form, fields = form ? Array.prototype.filter.call(form.elements, function (f) { return f.type !== 'hidden' && f.type !== 'submit' && f.tagName !== 'BUTTON'; }) : [];
    // Automatisch abschicken nur beim Anmelden (nicht beim Ein- oder Ausschalten der Zwei-Faktor-Anmeldung)
    var auto = fields.length === 1 && !!form.querySelector('input[name=aktion][value=code]'), sent = false, timer;
    var paint = function () {
      var d = el.value.replace(/\D/g, '').slice(0, 6);
      if (el.value !== d) el.value = d;
      Array.prototype.forEach.call(cells.children, function (c, k) {
        if (c.tagName !== 'I') return;
        c.textContent = d[k] || '';
        c.className = (d[k] ? 'is-set' : '') + (k === Math.min(d.length, 5) ? ' is-cur' : '');
      });
      var full = d.length === 6;
      if (!auto) wrap.classList.toggle('is-full', full);
      clearTimeout(timer);
      if (full && auto && !sent) {
        timer = setTimeout(function () {
          if (el.value.length !== 6 || sent) return;
          sent = true;
          var b = form.querySelector('button[type=submit], button:not([type])');
          if (b) { b.disabled = true; b.textContent = 'Wird geprüft …'; }
          check(b);
        }, 450);
      }
    };
    var anims = [];
    function merge() {
      var r = cells.getBoundingClientRect(), mid = r.left + r.width / 2, box = cells.children[0].getBoundingClientRect();
      wrap.classList.add('is-merge');
      m.style.width = box.width + 'px'; m.style.height = box.height + 'px';
      anims = Array.prototype.slice.call(cells.querySelectorAll('i')).map(function (c, k) {
        var b = c.getBoundingClientRect(), dx = mid - b.left - b.width / 2, rot = (k - 2.5) * 5;
        return c.animate([
          { transform: 'none' },
          { transform: 'translateX(' + dx * 0.9 + 'px) rotate(' + rot * 1.5 + 'deg)', offset: 0.72 },
          { transform: 'translateX(' + dx + 'px) rotate(' + rot * 0.6 + 'deg)' }
        ], { duration: reduce ? 0 : 720, easing: 'cubic-bezier(.6,0,.25,1)', fill: 'forwards' });
      });
    }
    function swapTitle(t) {
      var h = wrap.closest('.kp-narrow'), h1 = h && h.querySelector('h1');
      if (!h1) return;
      h1.classList.add('kp-swap');
      later(300, function () { h1.textContent = t; h1.classList.remove('kp-swap'); });
    }
    // Code im Hintergrund schicken; der Server leitet wie gewohnt weiter. Steht danach wieder das Codeformular
    // (oder die Passwort-Anmeldung) da, war es falsch: dann zeigen wir genau diese Seite mit der Meldung des Servers.
    function check(btn) {
      if (!window.fetch || !window.FormData || !cells.animate) { form.submit(); return; }
      el.blur(); el.readOnly = true;
      wrap.classList.add('is-chk');
      // Alte Fehlermeldung weich zuklappen, die Antwort des Servers bringt bei Bedarf eine neue.
      var fl = form.querySelector('.form__status');
      if (fl && fl.animate && !reduce) {
        fl.style.overflow = 'hidden';
        fl.animate([{ height: fl.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, borderWidth: 0 }],
          { duration: 450, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = function () { fl.remove(); };
      } else if (fl) fl.remove();
      var body = new FormData(form), started = Date.now(), res = null, html = '';
      var req = fetch(form.action, { method: 'POST', body: body, credentials: 'same-origin', headers: { Accept: 'text/html' } })
        .then(function (r) { res = r; return r.text(); }).then(function (t) { html = t; });
      later(760, merge);
      later(1400, function () { wrap.classList.add('is-one'); });
      req.then(function () {
        var wait = reduce ? 0 : Math.max(0, 1500 - (Date.now() - started));
        var ok = res.ok && html.indexOf('name="aktion" value="code"') === -1 && html.indexOf('name="aktion" value="anmelden"') === -1;
        setTimeout(function () {
          wrap.classList.add(ok ? 'is-done' : 'is-bad');
          if (btn) btn.textContent = ok ? 'Angemeldet' : 'Code falsch';
          swapTitle(ok ? 'Angemeldet' : 'Code falsch');
          later(ok ? 1300 : 1500, function () {
            if (ok) { location.replace(res.url || form.action); return; }
            document.open(); document.write(html); document.close();
          });
        }, wait);
      }).catch(function () { form.submit(); });
    }
    el.addEventListener('input', paint);
    el.addEventListener('focus', function () { wrap.classList.add('is-focus'); });
    el.addEventListener('blur', function () { wrap.classList.remove('is-focus'); });
    if (form) form.addEventListener('submit', function () { sent = true; });
    paint();
  });

  // Nachrichtenfeld wächst mit dem Text mit, Strg/Cmd + Enter schickt ab.
  Array.prototype.forEach.call(document.querySelectorAll('textarea[data-kp-grow]'), function (ta) {
    var grow = function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight + 2, 320) + 'px'; };
    ta.addEventListener('input', grow);
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && ta.form) {
        e.preventDefault();
        if (ta.form.reportValidity()) ta.form.submit();
      }
    });
  });

  // Passwort bei der Anmeldung kurz anzeigen (hilft beim Abtippen der Zugangsdaten vom Brief).
  Array.prototype.forEach.call(document.querySelectorAll('input[data-kp-reveal]'), function (pw) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kp-pw__btn';
    b.textContent = 'Zeigen';
    b.setAttribute('aria-label', 'Passwort anzeigen');
    b.addEventListener('click', function () {
      var show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      b.textContent = show ? 'Verbergen' : 'Zeigen';
      b.setAttribute('aria-label', show ? 'Passwort verbergen' : 'Passwort anzeigen');
      pw.focus();
    });
    // Vor dem Absenden wieder verbergen, damit der Browser es nicht als normales Textfeld merkt.
    if (pw.form) pw.form.addEventListener('submit', function () { pw.type = 'password'; });
    pw.parentNode.appendChild(b);
  });

  // Löschen nur nach Rückfrage.
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('form[data-kp-confirm]');
    if (f && !window.confirm(f.getAttribute('data-kp-confirm'))) e.preventDefault();
  });

  var copy = document.querySelector('[data-kp-copy-btn]');
  var src = document.querySelector('[data-kp-copy]');
  if (copy && src && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(src.textContent).then(function () { copy.textContent = 'Kopiert ✓'; });
    });
  } else if (copy) {
    copy.hidden = true;
  }
})();
