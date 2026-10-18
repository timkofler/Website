// CryptoX – Formulare (Beta-Bewerbung, Newsletter) ohne Neuladen absenden.
// Ohne JavaScript funktionieren die Formulare ganz normal per POST.
(function () {
  // Links wie "/#anfrage" laden die Startseite ohne "?gclid=…" bzw. "?utm_source=…" neu,
  // dann ginge die Herkunft verloren. Deshalb hängen wir die Adresszeile an diese Links an.
  if (/[?&](gclid|gbraid|wbraid|utm_source|empfohlen)=/.test(location.search)) {
    document.querySelectorAll('a[href^="/#"]').forEach(function (a) {
      a.setAttribute("href", "/" + location.search + a.getAttribute("href").slice(1));
    });
  }

  var forms = document.querySelectorAll("form[data-cx-form]");
  if (!forms.length || !window.fetch || !window.FormData) return;

  // Herkunft merken (z. B. Google-Anzeige), ganz ohne Cookies: nur aus der aktuellen Adresse.
  var q = new URLSearchParams(location.search), src = "";
  if (q.get("gclid") || q.get("gbraid") || q.get("wbraid")) src = "Google-Anzeige" + (q.get("gclid") ? " (gclid " + q.get("gclid").slice(0, 60) + ")" : "");
  else if (q.get("utm_source")) src = q.get("utm_source").slice(0, 40) + (q.get("utm_campaign") ? " / " + q.get("utm_campaign").slice(0, 40) : "");
  else if (document.referrer && document.referrer.indexOf(location.host) === -1) { try { src = new URL(document.referrer).host; } catch (e) {} }

  // Paket-Buttons wählen das passende Paket im Formular vor.
  document.querySelectorAll("[data-paket]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = document.querySelector('select[name="paket"]');
      if (sel) sel.value = a.getAttribute("data-paket");
    });
  });

  // Link wie /?paket=app#anfrage (von der Beispiel-App) wählt die Zusatzleistung vor.
  var PAKET_Q = { app: "Eigene App (Zusatzleistung)" };
  if (PAKET_Q[q.get("paket")]) {
    var ps = document.querySelector('select[name="paket"]');
    if (ps && !ps.value) ps.value = PAKET_Q[q.get("paket")];
  }

  forms.forEach(function (form) {
    var ts = form.querySelector('input[name="ts"]');
    if (ts) ts.value = String(Date.now());
    var qf = form.querySelector('input[name="quelle"]');
    if (qf) qf.value = src || "direkt";
    // Empfehlungslink wie /?empfohlen=Maria%20Muster#anfrage trägt den Namen gleich ein.
    var ef = form.querySelector('input[name="empfohlen"]');
    if (ef && q.get("empfohlen") && !ef.value) ef.value = q.get("empfohlen").slice(0, 120);
    var status = form.querySelector(".form__status");
    var button = form.querySelector('button[type="submit"]');
    var mailLink = form.querySelector('a[href^="mailto:"]');
    var mail = mailLink ? mailLink.textContent : "tk@crypto-x.at";

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
          show("Verbindung fehlgeschlagen. Bitte versuche es noch einmal oder schreib an " + mail + ".", false);
          button.disabled = false;
          button.innerHTML = label;
        });
    });
  });
})();
