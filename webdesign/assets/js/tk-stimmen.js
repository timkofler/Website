// Tim Kofler – freigegebene Kundenbewertungen auf der Startseite (#referenz). Solange es keine gibt, bleibt alles unsichtbar.
(function () {
  var box = document.querySelector("[data-tk-stimmen]");
  if (!box || !window.fetch) return;
  fetch("/api/bewertungen.php", { credentials: "omit" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    var list = d && d.bewertungen ? d.bewertungen.slice(0, 6) : [];
    if (!list.length) return;
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/assets/css/stimmen.css?v=1";
    document.head.appendChild(css);
    var h = document.createElement("h3");
    h.className = "tk-stimmen__h";
    h.textContent = "Das sagen meine Kunden";
    box.appendChild(h);
    var ul = document.createElement("ul");
    ul.className = "tk-stimmen__liste";
    list.forEach(function (b) {
      var li = document.createElement("li");
      li.className = "tk-stimme";
      var s = document.createElement("span");
      s.className = "tk-stimme__sterne";
      s.setAttribute("aria-label", b.sterne + " von 5 Sternen");
      s.textContent = "★★★★★".slice(0, b.sterne) + "☆☆☆☆☆".slice(0, 5 - b.sterne);
      var q = document.createElement("blockquote");
      q.textContent = "„" + b.text + "“";
      var n = document.createElement("cite");
      n.textContent = b.name;
      li.appendChild(s);
      li.appendChild(q);
      li.appendChild(n);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    box.hidden = false;
  }).catch(function () {});
})();
