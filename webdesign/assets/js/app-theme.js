// App-Beispiele (Vereins-App, Betriebs-App, Dashboard): Hell/Dunkel sofort im <head> setzen, damit nichts aufblitzt.
// Eigene Wahl in der App (data-key) gewinnt; sonst folgt die App der Edition der Hauptseite (White = hell, Black = dunkel).
// Wer oben auf der Hauptseite die Edition wechselt, setzt die eigene App-Wahl zurück (tk-black.js).
(function () {
  var s = document.currentScript, root = document.documentElement;
  var key = s && s.getAttribute("data-key");
  try {
    var t = key && localStorage.getItem(key);
    if (t !== "light" && t !== "dark") {
      var ed = (/[?&]edition=(white|black)\b/.exec(location.search) || [])[1] || localStorage.getItem("tk-edition");
      t = ed === "white" ? "light" : ed === "black" ? "dark" : null;
    }
    if (t) root.setAttribute("data-theme", t);
  } catch (e) {}
})();

// Black/White-Schalter in der Leiste oben (wie im Kopf der Hauptseite): wechselt die App zwischen dunkel und hell
// und merkt sich das als Edition für die ganze Seite. Der Schalter in der App bleibt und zeigt immer denselben Stand.
(function () {
  var s = document.currentScript, root = document.documentElement;
  var key = s && s.getAttribute("data-key");
  function isLight() {
    var t = root.getAttribute("data-theme");
    return t ? t === "light" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches);
  }
  function init() {
    var bar = document.querySelector(".tk-demo-bar");
    if (!bar || bar.querySelector(".tk-ed")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "tk-ed";
    b.innerHTML = '<span class="tk-ed__o tk-ed__b"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></span>' +
      '<span class="tk-ed__o tk-ed__w"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg></span>';
    function label() {
      var w = isLight();
      b.setAttribute("aria-pressed", w ? "true" : "false");
      b.setAttribute("aria-label", w ? "Zur Black Edition wechseln" : "Zur White Edition wechseln");
      b.title = w ? "Black Edition" : "White Edition";
      var sw = document.querySelector("[data-theme-sw]");
      if (sw) { sw.setAttribute("aria-checked", w ? "true" : "false"); sw.setAttribute("aria-label", w ? "Dunkle Ansicht" : "Helle Ansicht"); }
    }
    b.addEventListener("click", function () {
      var light = !isLight();
      root.setAttribute("data-theme", light ? "light" : "dark");
      try { localStorage.setItem("tk-edition", light ? "white" : "black"); if (key) localStorage.removeItem(key); } catch (e) {}
    });
    // Auch der Schalter in der App setzt data-theme: dann zieht der obere Knopf mit
    new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    label();
    var cta = bar.querySelector(".tk-demo-bar__cta");
    if (cta) bar.insertBefore(b, cta); else bar.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
