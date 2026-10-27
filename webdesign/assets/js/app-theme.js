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
