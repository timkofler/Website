// Black Edition: edlere, ruhigere Variante der Seite (echtes Schwarz, Glas, Orange nur als Akzent).
// Wird im <head> ohne defer geladen, damit die Seite gleich in der gewählten Variante erscheint und nichts aufblitzt.
// Die Wahl bleibt nur im Browser (localStorage "tk-black"), es wird nichts an den Server geschickt.
// Vorschau per Link: ?black=1 schaltet ein, ?black=0 aus.
(function () {
  var KEY = "tk-black", root = document.documentElement;
  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/></svg>';

  function saved() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function store(on) { try { if (on) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) {} }

  var m = /[?&]black=([01])/.exec(location.search);
  if (m) store(m[1] === "1");
  var on = saved();
  root.classList.toggle("tk-black", on);

  function apply(next) {
    on = next;
    store(on);
    root.classList.add("tk-black-swap");
    root.classList.toggle("tk-black", on);
    setTimeout(function () { root.classList.remove("tk-black-swap"); }, 650);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", on ? "#0b0b0c" : "#0b0b0b");
    sync();
  }
  function sync() {
    var all = document.querySelectorAll(".tkb-switch");
    for (var i = 0; i < all.length; i++) {
      all[i].setAttribute("aria-pressed", on ? "true" : "false");
      all[i].title = on ? "Black Edition ausschalten" : "Black Edition einschalten";
    }
  }
  function button(cls, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tkb-switch " + cls;
    b.setAttribute("aria-label", "Black Edition");
    b.innerHTML = '<span class="tkb-switch__ic">' + icon + '</span><span class="tkb-switch__t">' + label + '</span><span class="tkb-switch__track" aria-hidden="true"><i></i></span>';
    b.addEventListener("click", function () { apply(!on); });
    return b;
  }


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
      if (es[0].isIntersecting) { w.classList.add("is-drawn"); io.disconnect(); setTimeout(function () { w.classList.add("is-done"); }, 3000); }
    }, { threshold: .9 });
    io.observe(w);
  }

  function mount() {
    var end = document.querySelector(".header__end") || document.querySelector(".header .ew-head");
    if (end && !end.querySelector(".tkb-switch")) end.insertBefore(button("tkb-switch--head", "Black"), end.firstChild);
    var legal = document.querySelector(".footer__legal") || document.querySelector(".footer__bottom.ew-foot");
    if (legal && !legal.querySelector(".tkb-switch")) legal.appendChild(button("tkb-switch--foot", "Black Edition"));
    var portal = document.querySelector(".tkp-black-slot");
    if (portal && !portal.querySelector(".tkb-switch")) portal.appendChild(button("tkb-switch--portal", "Black Edition"));
    sync();
    footLogo();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
