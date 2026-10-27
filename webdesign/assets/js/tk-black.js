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

  function mount() {
    var end = document.querySelector(".header__end") || document.querySelector(".header .ew-head");
    if (end && !end.querySelector(".tkb-switch")) end.insertBefore(button("tkb-switch--head", "Black"), end.firstChild);
    var legal = document.querySelector(".footer__legal") || document.querySelector(".footer__bottom.ew-foot");
    if (legal && !legal.querySelector(".tkb-switch")) legal.appendChild(button("tkb-switch--foot", "Black Edition"));
    var portal = document.querySelector(".tkp-black-slot");
    if (portal && !portal.querySelector(".tkb-switch")) portal.appendChild(button("tkb-switch--portal", "Black Edition"));
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
