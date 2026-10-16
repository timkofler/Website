// Kundenportal: Fortschrittsanzeige beim Hochladen und Kopieren der Zugangsdaten.
// Ohne JavaScript funktioniert alles genauso, nur ohne Fortschrittsbalken.
(function () {
  function size(b) { return b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.ceil(b / 1024) + ' KB'; }

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
    input.addEventListener('change', function () { check(); input.reportValidity(); });

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
