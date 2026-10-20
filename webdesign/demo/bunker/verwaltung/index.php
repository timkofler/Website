<?php require __DIR__ . "/../_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Verwaltung · bunker.kollektiv</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0a0a0c">
<link rel="icon" href="../assets/img/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="../assets/style.css?v=10">
<link rel="stylesheet" href="../assets/verwaltung.css?v=1">
</head>
<body class="adm">

<header class="adm__bar">
  <a class="adm__brand" href="../" aria-label="Zur Webseite">
    <svg class="nav__logo" viewBox="-30 -30 1060 1060" aria-hidden="true"><use href="#logo"/><g class="spark"><path d="M164 0L164 90C164 40 125 5 70 0C125 5 164 40 164 90L164 420L164 595C150 540 90 506 0 506C90 506 150 475 164 420L164 595L164 905C164 960 110 1000 40 1000C110 1000 164 960 164 905L164 908A85 85 0 0 0 334 908L334 0L500 0L500 500L664 1000L664 500L830 500L1000 1000L830 1000L830 500L830 0L900 0C960 0 1000 30 1000 85L1000 380C1000 460 950 500 880 500L830 500L664 500L664 0L500 500L500 1000L334 0L500 0L664 0L830 0L900 0L1000 0L1000 85L1000 380L1000 1000L830 1000L664 1000L500 1000L40 1000L0 1000L0 506L0 0L70 0L164 0"/></g></svg>
    <span>Verwaltung</span>
  </a>
  <span class="adm__demo">Demo</span>
  <a class="adm__site" href="../#termine">Zur Webseite →</a>
</header>

<main class="adm__main">
  <section class="adm__hello">
    <p class="kicker">Hallo, bunker.kollektiv</p>
    <h1>Neuer Termin in einer Minute.</h1>
    <p>Foto rein, Titel und Datum dazu, fertig. Der Termin steht sofort auf der Webseite, mit Countdown und Kalender-Knopf. Vergangene Events wandern von selbst ins Archiv.</p>
  </section>

  <div class="adm__tabs" role="tablist">
    <button role="tab" id="tab-termine" aria-controls="p-termine" aria-selected="true" data-tab="termine">Termine</button>
    <button role="tab" id="tab-anfragen" aria-controls="p-anfragen" aria-selected="false" data-tab="anfragen">Anfragen <b data-anf-count></b></button>
  </div>

  <!-- Termine -->
  <section class="adm__panel" id="p-termine" role="tabpanel" aria-labelledby="tab-termine">
    <div class="adm__grid">
      <form class="adm__form" id="ev-form" novalidate>
        <label class="drop" data-drop>
          <input type="file" accept="image/*" name="foto" data-file>
          <span class="drop__empty">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg>
            <b>Foto auswählen</b>
            <small>oder hierher ziehen. Am Handy direkt aus der Galerie.</small>
          </span>
          <img class="drop__img" alt="" hidden data-drop-img>
          <span class="drop__change" hidden>Foto ändern</span>
        </label>

        <label class="fld"><span>Titel</span><input name="title" maxlength="60" required placeholder="z. B. Bunker Rock Fest"></label>
        <div class="row2">
          <label class="fld"><span>Datum</span><input type="date" name="d" required></label>
          <label class="fld"><span>Beginn</span><input type="time" name="t" value="19:00"></label>
        </div>
        <label class="fld"><span>Bands oder Untertitel <i>(optional)</i></span><input name="sub" maxlength="90" placeholder="z. B. mit Planet Error und Traincorn"></label>
        <fieldset class="chips chips--series"><legend>Reihe</legend><div data-series-chips></div></fieldset>
        <label class="fld"><span>Ein paar Sätze dazu <i>(optional)</i></span><textarea name="text" rows="3" maxlength="320" placeholder="Was erwartet die Leute?"></textarea></label>
        <p class="adm__err" role="alert" data-err hidden></p>
        <div class="adm__btns">
          <button class="btn btn--neon" type="submit">Veröffentlichen</button>
          <button class="btn btn--ghost" type="button" data-sample>Beispiel ausfüllen</button>
        </div>
      </form>

      <div class="adm__preview">
        <p class="adm__label">So sieht's auf der Webseite aus</p>
        <article class="pv" data-pv>
          <div class="pv__media"><img alt="" data-pv-img hidden><span class="pv__ph">Dein Foto</span></div>
          <div class="pv__body">
            <p class="kicker">Als Nächstes im Bunker</p>
            <h2 class="pv__title" data-pv-title>Dein Event</h2>
            <p class="pv__meta" data-pv-date>Datum wählen</p>
            <p class="pv__text" data-pv-text>Hier steht, was die Leute erwartet.</p>
            <div class="pv__btns"><span class="btn btn--neon">In meinen Kalender</span></div>
          </div>
        </article>
      </div>
    </div>

    <div class="adm__list">
      <h2>Deine eingetragenen Termine</h2>
      <ul data-list></ul>
      <p class="adm__empty" data-list-empty>Noch nichts eingetragen. Probier's oben aus, der Termin erscheint dann auf der Webseite.</p>
      <p class="adm__note">Demo: Die Termine werden nur in diesem Browser gespeichert. Im echten Betrieb meldet sich der Verein mit eigenem Passwort an und die Termine sind für alle sichtbar.</p>
    </div>
  </section>

  <!-- Anfragen -->
  <section class="adm__panel" id="p-anfragen" role="tabpanel" aria-labelledby="tab-anfragen" hidden>
    <p class="adm__intro">Alles, was über die Formulare auf der Webseite reinkommt: Mietanfragen, Bands und neue Mitglieder. Zusätzlich kommt jede Anfrage per E-Mail.</p>
    <ul class="anf" data-anf></ul>
    <p class="adm__note">Tipp: Schick auf der Webseite unter „Mitmachen“ eine Test-Anfrage ab, sie taucht dann hier auf.</p>
  </section>
</main>

<div class="toast" role="status" aria-live="polite" data-toast hidden></div>

<a class="draft" href="https://tim-kofler.at" target="_blank" rel="noopener"><span class="tk"><img src="../assets/img/tk-logo.svg" alt="" width="28" height="14"></span> Entwurf von Tim Kofler</a>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="logo" viewBox="-30 -30 1060 1060" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <g stroke-width="36"><path d="M164 0H0V1000H1000V0H334"/><path d="M164 0V908A85 85 0 0 0 334 908V0"/><path d="M70 0C125 5 164 40 164 90"/><path d="M164 420C150 475 90 506 0 506C90 506 150 540 164 595"/><path d="M164 905C164 960 110 1000 40 1000"/><path d="M334 0L500 1000"/><path d="M500 0V1000"/><path d="M664 0L500 500L664 1000"/><path d="M664 0V1000"/><path d="M664 500H880"/><path d="M880 500C950 500 1000 460 1000 380"/><path d="M900 0C960 0 1000 30 1000 85"/><path d="M830 0V1000"/><path d="M830 500L1000 1000"/></g>
  </symbol>
</svg>

<script src="../assets/verwaltung.js?v=3" defer></script>
</body>
</html>
