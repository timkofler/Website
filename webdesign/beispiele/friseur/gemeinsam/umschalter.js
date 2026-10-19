// Umschalter für die drei Friseur-Entwürfe: kleine Leiste unten links, Tasten 1 bis 3 wechseln ebenfalls.
(function () {
  var V = [["1", "/beispiele/friseur/", "Haarwerk Studio"], ["2", "/beispiele/friseur/v2/", "Seide"], ["3", "/beispiele/friseur/v3/", "Atelier Nº 9"]];
  var path = location.pathname.replace(/index\.html$/, ""), cur = path.indexOf("/v3/") > 0 ? 2 : path.indexOf("/v2/") > 0 ? 1 : 0;
  var nav = document.createElement("nav");
  nav.className = "tkv"; nav.setAttribute("aria-label", "Entwurf wechseln");
  var html = '<span class="tkv__l">Entwurf</span>';
  V.forEach(function (v, i) {
    html += '<a href="' + v[1] + '" title="Entwurf ' + v[0] + ': ' + v[2] + '"' + (i === cur ? ' aria-current="page"' : "") + '>' + v[0] + '<span class="tkv__n">' + v[2] + '</span></a>';
  });
  nav.innerHTML = html;
  document.body.appendChild(nav);
  addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test((e.target && e.target.tagName) || "") || document.querySelector("dialog[open]")) return;
    var k = +e.key; if (k >= 1 && k <= 3 && k - 1 !== cur) location.href = V[k - 1][1];
  });
})();
