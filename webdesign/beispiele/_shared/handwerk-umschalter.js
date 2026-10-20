// Umschalter für die vier Handwerks-Entwürfe: kleine Leiste unten links, Tasten 1 bis 4 wechseln ebenfalls.
(function () {
  var V = [["1", "/beispiele/dachdecker/", "First & Falz Dachdecker"], ["2", "/beispiele/tischlerei/", "Holzwerk Brandl Tischlerei"], ["3", "/beispiele/maler/", "Malerei Lindner"], ["4", "/beispiele/bodenleger/", "Grund & Holz Bodenleger"]];
  var path = location.pathname;
  var cur = 0;
  V.forEach(function (v, i) { if (path.indexOf(v[1]) === 0) cur = i; });
  var nav = document.createElement("nav");
  nav.className = "tkv"; nav.setAttribute("aria-label", "Entwurf wechseln");
  var html = '<span class="tkv__l">Handwerk</span>';
  V.forEach(function (v, i) {
    html += '<a href="' + v[1] + '" title="Entwurf ' + v[0] + ': ' + v[2] + '"' + (i === cur ? ' aria-current="page"' : "") + '>' + v[0] + '<span class="tkv__n">' + v[2].replace("&", "&amp;") + '</span></a>';
  });
  nav.innerHTML = html;
  document.body.appendChild(nav);
  addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test((e.target && e.target.tagName) || "") || document.querySelector("dialog[open]")) return;
    var k = +e.key; if (k >= 1 && k <= V.length && k - 1 !== cur) location.href = V[k - 1][1];
  });
})();
