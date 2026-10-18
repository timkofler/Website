// Danke-Seite nach dem Gratis-Entwurf: Hinweis auf die Newsletter-Bestätigung nur, wenn das Häkchen gesetzt war.
(function () {
  var box = document.querySelector("[data-ew-nl]");
  if (box && /[?&]nl=1\b/.test(location.search)) box.hidden = false;
})();
