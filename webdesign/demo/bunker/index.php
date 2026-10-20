<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>bunker.kollektiv · Kultur im Purgstaller Untergrund</title>
<meta name="description" content="bunker.kollektiv – Verein zur Förderung kollektiver Kunst in Purgstall an der Erlauf. Konzerte, Gasslfestival, Metal Night, Bass Music Culture, Mario Kart Turnier und offene Ateliers.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0a0a0c">
<link rel="icon" href="assets/img/logo.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/bigshoulders.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css?v=5">
<script src="assets/early.js"></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MusicVenue",
  "name": "bunker.kollektiv",
  "alternateName": "Bunker – Verein zur Förderung kollektiver Kunst",
  "address": {"@type": "PostalAddress", "streetAddress": "Schulgasse 3", "postalCode": "3251", "addressLocality": "Purgstall an der Erlauf", "addressCountry": "AT"},
  "email": "office@bunkerkollektiv.at",
  "sameAs": ["https://www.instagram.com/bunker.kollektiv", "https://www.facebook.com/bunker.kollektiv.purgstall"]
}
</script>
</head>
<body>

<a class="skip" href="#termine">Direkt zu den Terminen</a>

<header class="nav" id="nav">
  <a class="nav__brand" href="#top" aria-label="bunker.kollektiv, nach oben">
    <svg class="nav__logo" viewBox="8 8 1004 990" aria-hidden="true"><use href="#logo"/></svg>
    <span>bunker<b>.</b>kollektiv</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#termine">Termine</a>
    <a href="#reihen">Reihen</a>
    <a href="#bunker">Der Bunker</a>
    <a href="#mitmachen">Mitmachen</a>
    <a href="#anfahrt">Anfahrt</a>
  </nav>
  <a class="nav__cta" href="#termine"><span class="dot"></span><span data-next-short>Nächstes Event</span></a>
  <button class="nav__burger" aria-label="Menü öffnen" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
</header>

<div class="drawer" id="drawer" hidden>
  <a href="#termine">Termine</a>
  <a href="#reihen">Reihen</a>
  <a href="#bunker">Der Bunker</a>
  <a href="#mitmachen">Mitmachen</a>
  <a href="#anfahrt">Anfahrt</a>
  <div class="drawer__social">
    <a href="https://www.instagram.com/bunker.kollektiv" target="_blank" rel="noopener">Instagram</a>
    <a href="https://www.facebook.com/bunker.kollektiv.purgstall" target="_blank" rel="noopener">Facebook</a>
  </div>
</div>

<main id="top">

  <!-- Abstieg in den Bunker -->
  <section class="descent" id="descent" aria-label="Abstieg in den Bunker">
    <div class="descent__stage">
      <canvas class="descent__canvas" aria-hidden="true"></canvas>
      <div class="descent__vignette" aria-hidden="true"></div>

      <div class="beat beat--1" data-from="0" data-to=".16">
        <p class="kicker">Schulgasse 3 · Purgstall an der Erlauf</p>
        <p class="beat__big">Unter der Schulgasse<br>liegt ein Bunker.</p>
        <p class="scrollhint"><span>Runter</span><i></i></p>
      </div>
      <div class="beat beat--2" data-from=".2" data-to=".38">
        <p class="beat__big">Seit 2020 wird da unten<br>nicht mehr Schutz gesucht,</p>
      </div>
      <div class="beat beat--3" data-from=".42" data-to=".58">
        <p class="beat__big">sondern Musik, Kunst<br>und gute Leute.</p>
      </div>

      <div class="hero" data-from=".88" data-to="1.5">
        <div class="hero__img" aria-hidden="true"></div>
        <div class="hero__inner">
          <p class="kicker">Verein zur Förderung kollektiver Kunst</p>
          <h1 class="hero__title">Kultur im<br><span class="neon">Untergrund.</span></h1>
          <p class="hero__lead">Konzerte, Festivals, Ateliers und Mario Kart. Organisiert von Leuten aus Purgstall, für alle, die gerne runtergehen.</p>
          <div class="hero__next" data-next-card>
            <span class="pill">Nächstes Event</span>
            <strong data-next-title>Halloween Special</strong>
            <span data-next-date>Sa, 31. Oktober · 19 Uhr</span>
          </div>
          <div class="hero__btns">
            <a class="btn btn--neon" href="#termine">Alle Termine</a>
            <a class="btn btn--ghost" href="#mitmachen">Mitmachen</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Nächstes Event -->
  <section class="next" id="termine" aria-labelledby="next-title">
    <div class="wrap">
      <div class="next__card reveal" data-accent>
        <div class="next__media"><img src="assets/img/halloween.webp" alt="Der Bunker als Tatort dekoriert, mit Absperrband" loading="lazy" width="1400" height="788"></div>
        <div class="next__body">
          <p class="kicker">Als Nächstes im Bunker</p>
          <h2 id="next-title" class="next__title" data-next-title>Halloween Special</h2>
          <p class="next__meta" data-next-date>Samstag, 31. Oktober 2026 · 19 Uhr</p>
          <p class="next__text" data-next-text></p>
          <div class="countdown" aria-label="Countdown bis zum nächsten Event">
            <div><b data-cd="d">00</b><span>Tage</span></div>
            <div><b data-cd="h">00</b><span>Std</span></div>
            <div><b data-cd="m">00</b><span>Min</span></div>
            <div><b data-cd="s">00</b><span>Sek</span></div>
          </div>
          <div class="next__btns">
            <button class="btn btn--neon" data-ics="next">In meinen Kalender</button>
            <a class="btn btn--ghost" href="#anfahrt">Wie komm ich hin?</a>
          </div>
        </div>
      </div>

      <div class="upcoming">
        <div class="sechead reveal">
          <h2>Kommende Termine</h2>
          <p>Vergangene Events rutschen automatisch ins Archiv. Der Verein trägt neue Termine selbst ein, mit Foto, in einer Minute.</p>
          <a class="admin-hint" href="verwaltung/"><span>Für den Verein</span>So einfach trägst du einen Termin ein →</a>
        </div>
        <ol class="events" data-upcoming></ol>
        <details class="archive reveal">
          <summary><span>Archiv: alles, was schon war</span><b data-archive-count></b></summary>
          <div class="archive__years" data-archive></div>
        </details>
      </div>
    </div>
  </section>

  <!-- Zahlen -->
  <section class="stats" aria-label="Der Verein in Zahlen">
    <div class="wrap stats__row">
      <div class="stat reveal"><b data-count="2020" data-plain>2020</b><span>gegründet, als Tonstudio-Idee</span></div>
      <div class="stat reveal"><b data-count-past>0</b><span>Veranstaltungen seit 2023</span></div>
      <div class="stat reveal"><b data-count="5">5</b><span>Mal Gasslfestival</span></div>
      <div class="stat reveal"><b data-count="1">1</b><span>Bunker unter der Schulgasse</span></div>
    </div>
  </section>

  <!-- Reihen -->
  <section class="series" id="reihen" aria-labelledby="reihen-title">
    <div class="wrap">
      <div class="sechead reveal">
        <p class="kicker">Unsere Reihen</p>
        <h2 id="reihen-title">Jedes Jahr wieder. Nur lauter.</h2>
      </div>
      <div class="series__grid" data-series></div>
    </div>
  </section>

  <!-- Galerie -->
  <section class="gallery" aria-labelledby="galerie-title">
    <div class="wrap"><div class="sechead reveal">
      <p class="kicker">Gasslfestival V · Mai 2026</p>
      <h2 id="galerie-title">So schaut's aus, wenn's laut wird.</h2>
    </div></div>
    <div class="gallery__track" tabindex="0" aria-label="Fotogalerie, seitlich wischen">
      <figure><img src="assets/img/gassl-2.webp" alt="Band auf der Bunkerbühne mit Gitarre und Bass" loading="lazy" width="1100" height="734"></figure>
      <figure class="tall"><img src="assets/img/gassl-1.webp" alt="Sängerin vor Lichterkette" loading="lazy" width="733" height="1100"></figure>
      <figure><img src="assets/img/gassl-10.webp" alt="Gäste auf Bierbänken unter Zelten in der Gasse" loading="lazy" width="1100" height="700"></figure>
      <figure class="tall"><img src="assets/img/gassl-13.webp" alt="Gitarrist mit langen Haaren" loading="lazy" width="733" height="1100"></figure>
      <figure><img src="assets/img/gassl-12-1.webp" alt="DJ-Pult mit Publikum im Bunker" loading="lazy" width="1100" height="734"></figure>
      <figure class="tall"><img src="assets/img/gassl-15.webp" alt="Sängerin in Lederjacke, lachend" loading="lazy" width="733" height="1100"></figure>
      <figure class="tall"><img src="assets/img/gassl-7.webp" alt="Mann mit Kappe und Schürze am Grill" loading="lazy" width="733" height="1100"></figure>
    </div>
    <p class="wrap gallery__credit">Fotos Gasslfestival: musil-arts</p>
  </section>

  <!-- Videos -->
  <section class="videos" id="videos" aria-labelledby="videos-title">
    <div class="wrap">
      <div class="sechead reveal">
        <p class="kicker">Bunker in Bewegung</p>
        <h2 id="videos-title">Lieber anschauen als drüber lesen.</h2>
      </div>
      <div class="videos__grid">
        <button class="vid vid--big reveal" type="button" data-yt="tf18VnU6aDg" aria-label="Video abspielen: Highlights der Saison 22/23">
          <img src="assets/img/yt-tf18VnU6aDg.webp" alt="" loading="lazy" width="1280" height="720">
          <span class="vid__play" aria-hidden="true"></span>
          <span class="vid__cap"><small>Rückblick Saison 22/23</small>Highlights</span>
        </button>
        <button class="vid reveal" type="button" data-yt="4z8qdgHWXZA" aria-label="Video abspielen: Das erste Gasslfest, Juni 2022">
          <img src="assets/img/yt-4z8qdgHWXZA.webp" alt="" loading="lazy" width="1280" height="720">
          <span class="vid__play" aria-hidden="true"></span>
          <span class="vid__cap"><small>Juni 2022</small>Das erste Gasslfest</span>
        </button>
        <button class="vid reveal" type="button" data-yt="GkPOwMejBxo" aria-label="Video abspielen: SBÄM Fest 4">
          <img src="assets/img/yt-GkPOwMejBxo.webp" alt="" loading="lazy" width="1280" height="720">
          <span class="vid__play" aria-hidden="true"></span>
          <span class="vid__cap"><small>2022</small>SBÄM Fest 4</span>
        </button>
      </div>
      <p class="videos__note">Die Videos kommen von YouTube und werden erst geladen, wenn du auf Abspielen tippst. <a href="https://www.youtube.com/@bunker.kollektiv1936" target="_blank" rel="noopener">Zum YouTube-Kanal</a></p>
    </div>
  </section>

  <!-- Über uns -->
  <section class="about" id="bunker" aria-labelledby="about-title">
    <div class="wrap about__grid">
      <div class="about__text reveal">
        <p class="kicker">Der Bunker</p>
        <h2 id="about-title">Aus einem Tonstudio wurde ein Wohnzimmer für die Szene.</h2>
        <p>Gegründet haben das bunker.kollektiv Klaus Zoufal, Daniel Glösl und Philipp Hesselberger im Frühjahr 2020. Eigentlich sollte im Purgstaller Untergrund ein Tonstudio entstehen. Ein paar Jahre und viele Erfahrungen später steht da unten eine außergewöhnliche Eventlocation.</p>
        <p>Seit dem ersten Gasselfest spielen heimische und internationale Künstler:innen im Herzen Purgstalls. Unser Ziel: gemeinsam die Liebe zu Musik, Kultur und Menschen feiern, groß träumen und so manch Unmögliches möglich machen.</p>
        <p class="about__sign">Schaut vorbei! Euer bunker.kollektiv</p>
      </div>
      <figure class="about__img reveal">
        <img src="assets/img/team.webp" alt="Das Team des bunker.kollektiv in der Sonne vor dem Bunker" loading="lazy" width="1400" height="823">
        <figcaption>Das Kollektiv</figcaption>
      </figure>
    </div>
  </section>

  <!-- Mitmachen -->
  <section class="join" id="mitmachen" aria-labelledby="join-title">
    <div class="wrap">
      <div class="sechead reveal">
        <p class="kicker">Mitmachen</p>
        <h2 id="join-title">Der Bunker gehört allen, die was draus machen.</h2>
      </div>
      <div class="join__grid">
        <article class="join__card reveal">
          <span class="join__no">01</span>
          <h3>Bunker mieten</h3>
          <p>Bandprobe, Lesung, Release-Party oder runder Geburtstag. Bühne, Licht und Technik sind schon da.</p>
          <button class="link" type="button" data-open="mieten">Anfrage schicken</button>
        </article>
        <article class="join__card reveal">
          <span class="join__no">02</span>
          <h3>Spiel bei uns</h3>
          <p>Ihr habt eine Band, ein Set oder eine Idee für einen Abend? Schickt uns einen Link zu eurer Musik.</p>
          <button class="link" type="button" data-open="spielen">Band vorstellen</button>
        </article>
        <article class="join__card reveal">
          <span class="join__no">03</span>
          <h3>Mitglied werden</h3>
          <p>Aufbauen, Bar, Licht, Fotos oder einfach dabei sein. Jede Hand hilft, jeder Beitrag hält den Bunker offen.</p>
          <button class="link" type="button" data-open="mitglied">Ich bin dabei</button>
        </article>
      </div>
    </div>
  </section>

  <!-- Partner / Werbeplatz -->
  <section class="partners" aria-labelledby="partner-title">
    <div class="wrap">
      <div class="sechead reveal">
        <p class="kicker">Partner &amp; Unterstützer</p>
        <h2 id="partner-title">Ohne sie wär's still im Bunker.</h2>
      </div>
      <a class="sponsor reveal" href="https://tim-kofler.at/?utm_source=bunkerkollektiv" target="_blank" rel="noopener">
        <span class="tk sponsor__logo"><img src="assets/img/tk-logo.svg" alt="" width="70" height="36"></span>
        <span class="sponsor__text">
          <small>Diese Webseite wurde dem Verein geschenkt von</small>
          <strong>Tim Kofler · Webdesign aus dem Mostviertel</strong>
          <em>Webseiten, Web-Apps und Dashboards für Betriebe und Vereine</em>
        </span>
        <span class="sponsor__go" aria-hidden="true">tim-kofler.at ↗</span>
      </a>
      <div class="partner__row reveal">
        <span>Kulturvernetzung NÖ</span>
        <span>MOST/4 Festival</span>
        <span>Musikschule Purgstall</span>
        <a href="mailto:office@bunkerkollektiv.at?subject=Partner%20werden" class="partner__you">Dein Logo hier? Partner werden</a>
      </div>
    </div>
  </section>

  <!-- Anfahrt -->
  <section class="visit" id="anfahrt" aria-labelledby="anfahrt-title">
    <div class="wrap visit__grid">
      <div class="reveal">
        <p class="kicker">Anfahrt</p>
        <h2 id="anfahrt-title">Schulgasse 3,<br>Purgstall</h2>
        <p class="visit__text">3251 Purgstall an der Erlauf, mitten im Ort. Einfach die Stufen runter, dem Bass nach.</p>
        <div class="hero__btns">
          <a class="btn btn--neon" href="https://www.google.com/maps/dir/?api=1&amp;destination=Schulgasse+3,+3251+Purgstall+an+der+Erlauf" target="_blank" rel="noopener">Route planen</a>
          <a class="btn btn--ghost" href="mailto:office@bunkerkollektiv.at">office@bunkerkollektiv.at</a>
        </div>
      </div>
      <div class="visit__map reveal" aria-hidden="true">
        <svg viewBox="0 0 400 300">
          <defs><radialGradient id="pulse"><stop offset="0" stop-color="var(--cyan)" stop-opacity=".55"/><stop offset="1" stop-color="var(--cyan)" stop-opacity="0"/></radialGradient></defs>
          <path class="road road--main" d="M-10 210 C80 190 150 170 210 150 S330 95 410 70"/>
          <path class="road" d="M120 -10 C140 80 170 120 210 150 C240 175 250 230 260 310"/>
          <path class="road" d="M-10 90 C70 100 140 115 210 150"/>
          <path class="river" d="M-10 268 C90 250 180 262 260 240 S360 205 410 215"/>
          <text x="20" y="250" class="map__label">Erlauf</text>
          <circle cx="210" cy="150" r="60" fill="url(#pulse)" class="map__pulse"/>
          <circle cx="210" cy="150" r="7" class="map__pin"/>
          <text x="226" y="140" class="map__label map__label--pin">bunker.kollektiv</text>
        </svg>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand">
      <svg class="foot__logo" viewBox="8 8 1004 990" aria-hidden="true"><use href="#logo"/></svg>
      <p>bunker.kollektiv<br><span>Verein zur Förderung kollektiver Kunst<br>ZVR 1001996773</span></p>
    </div>
    <nav class="foot__nav" aria-label="Fußzeile">
      <a href="https://www.instagram.com/bunker.kollektiv" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.facebook.com/bunker.kollektiv.purgstall" target="_blank" rel="noopener">Facebook</a>
      <a href="#impressum">Impressum</a>
      <a href="#datenschutz">Datenschutz</a>
      <a href="verwaltung/">Vereins-Login</a>
    </nav>
    <p class="foot__credit">Webdesign: <a href="https://tim-kofler.at/?utm_source=bunkerkollektiv" target="_blank" rel="noopener">Tim Kofler</a></p>
  </div>
</footer>

<a class="draft" href="https://tim-kofler.at" target="_blank" rel="noopener"><span class="tk"><img src="assets/img/tk-logo.svg" alt="" width="28" height="14"></span> Entwurf von Tim Kofler</a>

<!-- Anfrage-Formulare (Beispiel, wird nicht verschickt) -->
<dialog class="modal" id="form-mieten" aria-labelledby="fm-t">
  <form class="modal__form" method="dialog" data-anfrage="Bunker mieten">
    <button class="modal__x" type="button" data-close aria-label="Schließen">×</button>
    <p class="kicker">Bunker mieten</p>
    <h2 id="fm-t">Dein Abend im Bunker</h2>
    <p class="modal__lead">Erzähl uns kurz, was du vorhast. Wir melden uns innerhalb von ein paar Tagen.</p>
    <fieldset class="chips"><legend>Was ist geplant?</legend>
      <label><input type="radio" name="Anlass" value="Bandprobe" checked><span>Bandprobe</span></label>
      <label><input type="radio" name="Anlass" value="Geburtstag"><span>Geburtstag</span></label>
      <label><input type="radio" name="Anlass" value="Release-Party"><span>Release-Party</span></label>
      <label><input type="radio" name="Anlass" value="Lesung"><span>Lesung</span></label>
      <label><input type="radio" name="Anlass" value="Etwas anderes"><span>Etwas anderes</span></label>
    </fieldset>
    <div class="row2">
      <label class="fld"><span>Wunschtermin</span><input type="date" name="Wunschtermin" required></label>
      <label class="fld"><span>Wie viele Leute?</span><input type="number" name="Personen" min="1" max="150" inputmode="numeric" placeholder="z. B. 40"></label>
    </div>
    <div class="row2">
      <label class="fld"><span>Dein Name</span><input name="Name" autocomplete="name" required></label>
      <label class="fld"><span>Telefon <i>(optional)</i></span><input type="tel" name="Telefon" autocomplete="tel"></label>
    </div>
    <label class="fld"><span>E-Mail</span><input type="email" name="E-Mail" autocomplete="email" required></label>
    <label class="fld"><span>Noch was, das wir wissen sollten?</span><textarea name="Nachricht" rows="3" placeholder="Technik, Bar, Uhrzeit …"></textarea></label>
    <button class="btn btn--neon modal__send" type="submit">Anfrage schicken</button>
    <p class="modal__demo">Beispiel: Im Entwurf wird nichts verschickt.</p>
  </form>
</dialog>

<dialog class="modal" id="form-spielen" aria-labelledby="fs-t">
  <form class="modal__form" method="dialog" data-anfrage="Spiel bei uns">
    <button class="modal__x" type="button" data-close aria-label="Schließen">×</button>
    <p class="kicker">Spiel bei uns</p>
    <h2 id="fs-t">Stell uns deine Band vor</h2>
    <p class="modal__lead">Ein Link zu eurer Musik reicht. Wir hören rein und melden uns.</p>
    <div class="row2">
      <label class="fld"><span>Band oder Künstler</span><input name="Band" required></label>
      <label class="fld"><span>Genre</span><input name="Genre" placeholder="Punk, Metal, Techno …"></label>
    </div>
    <label class="fld"><span>Link zur Musik</span><input type="url" name="Link" inputmode="url" placeholder="https://" required></label>
    <fieldset class="chips"><legend>Wann würde es passen?</legend>
      <label><input type="checkbox" name="Zeitraum" value="Frühling"><span>Frühling</span></label>
      <label><input type="checkbox" name="Zeitraum" value="Sommer"><span>Sommer</span></label>
      <label><input type="checkbox" name="Zeitraum" value="Herbst"><span>Herbst</span></label>
      <label><input type="checkbox" name="Zeitraum" value="Winter"><span>Winter</span></label>
    </fieldset>
    <div class="row2">
      <label class="fld"><span>Ansprechperson</span><input name="Name" autocomplete="name" required></label>
      <label class="fld"><span>E-Mail</span><input type="email" name="E-Mail" autocomplete="email" required></label>
    </div>
    <label class="fld"><span>Ein paar Worte zu euch</span><textarea name="Nachricht" rows="3"></textarea></label>
    <button class="btn btn--neon modal__send" type="submit">Band vorstellen</button>
    <p class="modal__demo">Beispiel: Im Entwurf wird nichts verschickt.</p>
  </form>
</dialog>

<dialog class="modal" id="form-mitglied" aria-labelledby="fg-t">
  <form class="modal__form" method="dialog" data-anfrage="Mitglied werden">
    <button class="modal__x" type="button" data-close aria-label="Schließen">×</button>
    <p class="kicker">Mitglied werden</p>
    <h2 id="fg-t">Schön, dass du dabei bist</h2>
    <p class="modal__lead">Sag uns, wo du gern mithilfst. Du musst nichts können, nur Lust haben.</p>
    <fieldset class="chips"><legend>Da helf ich gern</legend>
      <label><input type="checkbox" name="Hilfe" value="Aufbau"><span>Aufbau</span></label>
      <label><input type="checkbox" name="Hilfe" value="Bar"><span>Bar</span></label>
      <label><input type="checkbox" name="Hilfe" value="Licht &amp; Ton"><span>Licht &amp; Ton</span></label>
      <label><input type="checkbox" name="Hilfe" value="Fotos"><span>Fotos</span></label>
      <label><input type="checkbox" name="Hilfe" value="Social Media"><span>Social Media</span></label>
      <label><input type="checkbox" name="Hilfe" value="Einfach dabei sein"><span>Einfach dabei sein</span></label>
    </fieldset>
    <div class="row2">
      <label class="fld"><span>Dein Name</span><input name="Name" autocomplete="name" required></label>
      <label class="fld"><span>E-Mail</span><input type="email" name="E-Mail" autocomplete="email" required></label>
    </div>
    <label class="fld"><span>Noch was?</span><textarea name="Nachricht" rows="3"></textarea></label>
    <button class="btn btn--neon modal__send" type="submit">Ich bin dabei</button>
    <p class="modal__demo">Beispiel: Im Entwurf wird nichts verschickt.</p>
  </form>
</dialog>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="logo" viewBox="8 8 1004 990" fill="none" stroke="currentColor">
    <g stroke-width="42"><path d="M197 38H42V968H975"/><path d="M352 38H880C945 38 975 75 975 125V420C975 480 905 505 820 505"/><path d="M197 38V850C197 930 235 968 276 968C317 968 355 930 355 850V38"/></g>
    <g stroke-width="30"><path d="M100 38C160 45 192 80 192 125"/><path d="M192 420C180 470 120 505 42 505C120 505 180 540 192 590"/><path d="M192 870C180 930 120 968 60 968"/><path d="M360 45L505 965M508 38V968"/><path d="M658 38L510 505L658 965M660 38V968"/><path d="M660 505H815M815 38V968M815 515L970 965"/></g>
  </symbol>
</svg>

<script src="assets/app.js?v=4" defer></script>
<script type="module" src="assets/bunker3d.js?v=5"></script>
</body>
</html>
