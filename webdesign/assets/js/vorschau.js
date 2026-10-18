// Tim Kofler – „Vorschau in 60 Sekunden“: Formular ohne Neuladen absenden, Wartezeit anzeigen, Link kopieren.
// Ohne JavaScript funktioniert das Formular ganz normal per POST.
(function () {
  var form = document.querySelector("form[data-vs-form]");
  if (form) {
    var ts = form.querySelector('input[name="ts"]');
    if (ts) ts.value = String(Date.now());

    // „Sonstiges“ blendet ein Feld zum freien Eintippen der Branche ein.
    var sel = form.querySelector("[data-vs-branche]");
    var frei = form.querySelector("[data-vs-frei]");
    if (sel && frei) {
      var toggle = function () {
        var on = sel.value === "Sonstiges";
        frei.hidden = !on;
        var inp = frei.querySelector("input");
        if (inp) { inp.required = on; if (on) inp.focus(); }
      };
      sel.addEventListener("change", toggle);
      toggle();
    }

    var status = form.querySelector(".form__status");
    var button = form.querySelector('button[type="submit"]');
    var timer = null;

    function show(msg, ok) {
      if (!status) return;
      status.hidden = false;
      status.textContent = msg;
      status.className = "form__status " + (ok ? "is-ok" : "is-error");
    }

    // Im Admin-Bereich geht das Formular ganz normal per POST; dort nur den Knopf sperren.
    var ajax = /\/api\/vorschau\.php$/.test(form.action);
    if (!ajax) {
      form.addEventListener("submit", function () { button.disabled = true; button.textContent = "Wird erzeugt, bitte warten …"; });
    } else if (window.fetch && window.FormData) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (button.disabled) return;
        button.disabled = true;
        var label = button.innerHTML;
        var start = Date.now();
        var steps = ["Branche wird eingeordnet …", "Texte werden geschrieben …", "Farbe wird gewählt …", "Seite wird zusammengebaut …"];
        show(steps[0] + " Das dauert meist 15 bis 40 Sekunden.", true);
        button.textContent = "Wird erzeugt …";
        timer = setInterval(function () {
          var s = Math.floor((Date.now() - start) / 1000);
          show(steps[Math.min(steps.length - 1, Math.floor(s / 8))] + " (" + s + " s)", true);
        }, 1000);
        fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" }, credentials: "same-origin" })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            clearInterval(timer);
            if (data.ok && data.next) { show("Fertig! Deine Vorschau wird geladen …", true); window.location.href = data.next; return; }
            show(data.message || "Das hat leider nicht geklappt.", false);
            button.disabled = false;
            button.innerHTML = label;
          })
          .catch(function () {
            clearInterval(timer);
            show("Verbindung fehlgeschlagen. Bitte versuche es noch einmal oder schreib an office@tim-kofler.at.", false);
            button.disabled = false;
            button.innerHTML = label;
          });
      });
    }
  }

  // Link zur Vorschau kopieren.
  var copy = document.querySelector("[data-vs-copy]");
  var link = document.querySelector("[data-vs-link]");
  if (copy && link) {
    copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "Kopiert ✓"; setTimeout(function () { copy.textContent = "Kopieren"; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link.value).then(done, function () { link.select(); });
      else { link.select(); try { document.execCommand("copy"); done(); } catch (e) {} }
    });
  }
})();
