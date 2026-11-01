<?php require __DIR__ . "/_gate.php"; ?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Neues Rezept eintragen · Backen mit Mrs. West</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fdf3ee">
<link rel="icon" href="assets/img/logo.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css?v=2">
</head>
<body class="ein">
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-uhr" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l2.5 2M10 2h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-zurueck" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-kamera" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-zauber" viewBox="0 0 24 24"><path d="M4 20 16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.7 1.3L21 13l-1.3.7L19 15l-.7-1.3L17 13l1.3-.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
</svg>

<header class="nav">
  <div class="wrap nav__in">
    <a class="logo" href="./" aria-label="Zur Rezept-Dose">
      <img src="assets/img/logo.svg" alt="" width="44" height="44">
      <span><small>Backen mit</small>Mrs. West</span>
    </a>
    <a class="btn btn--klein btn--hell ein__zurueck" href="./#rezepte"><svg><use href="#i-zurueck"/></svg>Rezept-Dose</a>
  </div>
</header>

<main class="ein__main">
  <div class="wrap">
    <div class="ein__kopf">
      <p class="kicker">Dein Bereich</p>
      <h1>Neues Rezept eintragen</h1>
      <p>Direkt vom Handy, in zwei Minuten online. Du kannst auch einfach deinen Instagram-Text einfügen.</p>
    </div>

    <div class="ein__grid">
      <form class="ein__form" data-form novalidate>

        <section class="ein__karte ein__karte--zauber">
          <h2><svg><use href="#i-zauber"/></svg>Aus Instagram übernehmen</h2>
          <p>Kopiere den Text von deinem Beitrag und füge ihn hier ein. Titel, Zutaten und Schritte werden automatisch erkannt.</p>
          <label class="sr" for="insta">Instagram-Text</label>
          <textarea id="insta" rows="5" placeholder="Text von deinem Instagram-Beitrag hier einfügen …"></textarea>
          <div class="ein__reihe">
            <button class="btn btn--klein" type="button" data-aufteilen><svg><use href="#i-zauber"/></svg>Automatisch aufteilen</button>
            <button class="linkbtn" type="button" data-beispiel>Beispiel einfügen</button>
          </div>
          <div class="auto">
            <span class="auto__schalter" aria-hidden="true"></span>
            <p><b>Neue Instagram-Rezepte automatisch übernehmen</b>Die Seite legt aus jedem neuen Rezept-Beitrag einen Entwurf an, du gibst ihn mit einem Tipp frei. Wird mit deinem Instagram-Login eingeschaltet.</p>
          </div>
        </section>

        <section class="ein__karte">
          <h2>Foto</h2>
          <label class="foto" data-foto>
            <input type="file" accept="image/*" data-foto-in>
            <img alt="" hidden data-foto-bild>
            <span class="foto__leer"><svg><use href="#i-kamera"/></svg><b>Foto wählen oder knipsen</b><small>Wird automatisch verkleinert, damit die Seite schnell bleibt.</small></span>
          </label>
          <p class="ein__info" data-foto-info hidden></p>
        </section>

        <section class="ein__karte">
          <h2>Das Wichtigste</h2>
          <label for="titel">Name des Rezepts</label>
          <input id="titel" name="titel" type="text" placeholder="z. B. Apfel-Zimt-Blechkuchen" required>
          <label for="kurz">Ein, zwei Sätze dazu</label>
          <textarea id="kurz" name="kurz" rows="2" placeholder="Was macht das Rezept besonders?"></textarea>
          <p class="ein__lbl">Kategorie</p>
          <div class="pills" data-kats>
            <label><input type="checkbox" value="kuchen"><span>Kuchen</span></label>
            <label><input type="checkbox" value="torten"><span>Torten</span></label>
            <label><input type="checkbox" value="kekse"><span>Kekse &amp; Kleines</span></label>
            <label><input type="checkbox" value="fruehstueck"><span>Frühstück</span></label>
            <label><input type="checkbox" value="brot"><span>Brot &amp; Gebäck</span></label>
            <label><input type="checkbox" value="schnell" data-schnell><span>⚡ Schnell &amp; Einfach</span></label>
          </div>
          <div class="ein__zwei">
            <div>
              <label for="zeit">Zeit gesamt (Min)</label>
              <input id="zeit" name="zeit" type="number" inputmode="numeric" min="5" max="600" step="5" value="45">
            </div>
            <div>
              <p class="ein__lbl">Schwierigkeit</p>
              <div class="pills" data-stufe>
                <label><input type="radio" name="stufe" value="1" checked><span>Einfach</span></label>
                <label><input type="radio" name="stufe" value="2"><span>Mittel</span></label>
                <label><input type="radio" name="stufe" value="3"><span>Geübt</span></label>
              </div>
            </div>
          </div>
          <div class="ein__zwei">
            <div>
              <label for="formtyp">Backform</label>
              <select id="formtyp" name="formtyp">
                <option value="rund">Springform (Ø cm)</option>
                <option value="kasten">Kastenform (Länge cm)</option>
                <option value="eckig">Blech / eckige Form</option>
                <option value="stueck">Stück (Kekse, Muffins …)</option>
                <option value="portion">Portionen</option>
              </select>
            </div>
            <div>
              <label for="formwert" data-formwert-lbl>Größe</label>
              <select id="formwert" name="formwert"></select>
            </div>
          </div>
        </section>

        <section class="ein__karte">
          <h2>Zutaten</h2>
          <label for="zutaten">Eine Zutat pro Zeile</label>
          <textarea id="zutaten" name="zutaten" rows="7" placeholder="250 g Mehl&#10;3 Eier&#10;1 Pkg Backpulver&#10;1 Prise Salz"></textarea>
          <ul class="erkannt" data-erkannt aria-live="polite"></ul>
        </section>

        <section class="ein__karte">
          <h2>So geht's</h2>
          <label for="schritte">Ein Schritt pro Zeile</label>
          <textarea id="schritte" name="schritte" rows="7" placeholder="Backrohr auf 180 °C vorheizen.&#10;Butter und Zucker cremig rühren.&#10;35 Minuten backen."></textarea>
          <p class="ein__info">Steht eine Zeit im Schritt, zum Beispiel „35 Minuten backen“, gibt's im Backmodus automatisch einen Timer.</p>
          <label for="tipp">Dein Tipp (optional)</label>
          <input id="tipp" name="tipp" type="text" placeholder="z. B. Schmeckt am nächsten Tag noch besser.">
        </section>

        <div class="ein__los">
          <button class="btn btn--gross" type="submit"><svg><use href="#i-check"/></svg>Rezept veröffentlichen</button>
          <p class="ein__info">Im Entwurf wird das Rezept nur auf diesem Gerät gespeichert. Auf der fertigen Seite ist es sofort für alle sichtbar.</p>
        </div>
      </form>

      <aside class="ein__vorschau">
        <p class="kicker">Vorschau</p>
        <article class="karte">
          <div class="karte__bild"><img alt="" hidden data-v-bild><span class="karte__zeit"><svg><use href="#i-uhr"/></svg><span data-v-zeit>45 Min · Einfach</span></span></div>
          <div class="karte__txt"><h3 data-v-titel>Dein neues Rezept</h3><p data-v-kurz>Hier erscheint deine Beschreibung.</p><div class="karte__tags" data-v-tags></div></div>
        </article>
        <p class="ein__zahl" data-v-zahl></p>
        <div class="ein__meine" data-meine hidden>
          <p class="kicker">Deine eingetragenen Rezepte</p>
          <ul data-meine-liste></ul>
        </div>
      </aside>
    </div>
  </div>
</main>

<div class="toast" data-toast role="status" aria-live="polite"></div>
<script src="assets/eintragen.js?v=1" defer></script>
</body>
</html>
