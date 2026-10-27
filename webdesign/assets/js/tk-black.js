// Black Edition: das Design der Seite (echtes Schwarz, Glas, Orange nur als Akzent).
// Seit 27.10.2026 fix für alle, ohne Umschalter (Tims Wunsch). Wird im <head> ohne defer geladen,
// damit die Klasse sofort sitzt und nichts aufblitzt. Es wird nichts gespeichert.
(function () {
  var root = document.documentElement;
  root.classList.add("tk-black");
  // Alte Wahl aus der Zeit mit Umschalter aufräumen
  try { localStorage.removeItem("tk-black"); } catch (e) {}

  // Footer-Logo zeichnet sich selbst, sobald es ins Bild kommt (Hilfslinien, Ankerpunkte, Umrisse, dann Füllung),
  // wie bei der Logo-Animation. Ohne JavaScript oder bei "Bewegung reduzieren" bleibt das normale Bild stehen.
  function footLogo() {
    var img = document.querySelector(".tk-logo--foot img");
    if (!img || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var T = "M0,.5 L502,.5 L389,87.5 L286,87.5 L286,281.5 L187.5,354.5 L187.5,87.5 L104,87.5 Z",
        K = "M540,0 L702,0 L470,180.5 L701,358.5 L540,358.5 L307,181.5 Z",
        pts = [[0,.5],[502,.5],[389,87.5],[286,87.5],[286,281.5],[187.5,354.5],[187.5,87.5],[104,87.5],[540,0],[702,0],[470,180.5],[701,358.5],[540,358.5],[307,181.5]];
    var a = "";
    for (var i = 0; i < pts.length; i++) a += '<rect class="tkd-a" style="--i:' + i + '" x="' + (pts[i][0] - 16) + '" y="' + (pts[i][1] - 16) + '" width="32" height="32"/>';
    var w = document.createElement("span");
    w.className = "tkd";
    w.innerHTML = '<svg viewBox="0 0 702 358.5" role="img" aria-label="' + (img.getAttribute("alt") || "") + '">' +
      '<g class="tkd-g"><rect x="0" y="0" width="702" height="358.5" pathLength="100"/><line x1="-60" y1="87.5" x2="762" y2="87.5" pathLength="100"/><line x1="-60" y1="181" x2="762" y2="181" pathLength="100"/>' +
      '<line x1="187.5" y1="-50" x2="187.5" y2="410" pathLength="100"/><line x1="286" y1="-50" x2="286" y2="410" pathLength="100"/><circle cx="470" cy="180.5" r="150" pathLength="100"/></g>' +
      '<path class="tkd-o tkd-t" d="' + T + '" pathLength="100"/><path class="tkd-o tkd-k" d="' + K + '" pathLength="100"/>' + a + '</svg>';
    img.parentNode.replaceChild(w, img);
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { w.classList.add("is-drawn"); io.disconnect(); setTimeout(function () { w.classList.add("is-done"); loop(); }, 3000); }
    }, { threshold: .9 });
    io.observe(w);
    // Dauerschleife (Tim 27.10.): fertig stehen lassen, rückwärts wieder auflösen, kurz leer, neu zeichnen
    var CYCLE = 3000, HOLD = 3500, GAP = 700;
    function loop() {
      if (!w.getAnimations) return;
      var anims = w.getAnimations({ subtree: true });
      setTimeout(function () {
        w.classList.remove("is-done");
        anims.forEach(function (a) { a.playbackRate = -1; a.play(); a.currentTime = CYCLE; });
        setTimeout(function () {
          anims.forEach(function (a) { a.pause(); a.currentTime = 0; a.playbackRate = 1; });
          setTimeout(function () {
            anims.forEach(function (a) { a.play(); });
            setTimeout(function () { w.classList.add("is-done"); loop(); }, CYCLE);
          }, GAP);
        }, CYCLE);
      }, HOLD);
    }
  }

  function mount() { footLogo(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
