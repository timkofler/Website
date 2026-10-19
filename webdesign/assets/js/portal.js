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

  // Codefelder: Leerzeichen beim Tippen erlaubt, Ziffern werden in Dreiergruppen angezeigt.
  Array.prototype.forEach.call(document.querySelectorAll('input.kp-otp[inputmode=numeric]'), function (el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '').slice(0, 6);
      el.value = d.length > 3 ? d.slice(0, 3) + ' ' + d.slice(3) : d;
    });
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
