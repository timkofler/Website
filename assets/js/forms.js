// CryptoX – Formulare (Beta-Bewerbung, Newsletter) ohne Neuladen absenden.
// Ohne JavaScript funktionieren die Formulare ganz normal per POST.
(function () {
  var forms = document.querySelectorAll("form[data-cx-form]");
  if (!forms.length || !window.fetch || !window.FormData) return;

  forms.forEach(function (form) {
    var ts = form.querySelector('input[name="ts"]');
    if (ts) ts.value = String(Date.now());
    var status = form.querySelector(".form__status");
    var button = form.querySelector('button[type="submit"]');

    function show(msg, ok) {
      if (!status) return;
      status.hidden = false;
      status.textContent = msg;
      status.className = "form__status " + (ok ? "is-ok" : "is-error");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (button.disabled) return;
      button.disabled = true;
      var label = button.innerHTML;
      button.textContent = "Wird gesendet …";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok && data.next) { window.location.href = data.next; return; }
          show(data.message || "Das hat leider nicht geklappt.", !!data.ok);
          button.disabled = false;
          button.innerHTML = label;
        })
        .catch(function () {
          show("Verbindung fehlgeschlagen. Bitte versuche es noch einmal oder schreib an tk@crypto-x.at.", false);
          button.disabled = false;
          button.innerHTML = label;
        });
    });
  });
})();
