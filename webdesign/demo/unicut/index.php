<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Haarstudio Uni:cut Ruprechtshofen · Haare, Wimpern & Nägel</title>
<meta name="description" content="Haarstudio Uni:cut am Hauptplatz in Ruprechtshofen: Schnitt, Farbe und Styling, Wimpernstyling und Nageldesign. Mit der Staatsmeisterin 2025 im Team.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f4efe8">
<link rel="preload" href="assets/fonts/bodoni.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-800.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=1">
<script src="assets/early.js?v=1"></script>
<script src="assets/app.js?v=1" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "Haarstudio Uni:cut",
  "slogan": "Bei uns ist jede Frisur ein Unikat.",
  "address": {"@type": "PostalAddress", "streetAddress": "Hauptplatz 14", "postalCode": "3244", "addressLocality": "Ruprechtshofen", "addressCountry": "AT"},
  "openingHoursSpecification": [
    {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:00", "closes": "18:00"},
    {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "08:00", "closes": "12:00"}
  ],
  "sameAs": ["https://www.instagram.com/uni.cut_haarstudio/"]
}
</script>
</head>
<body>

<a class="skip" href="#leistungen">Direkt zu den Leistungen</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Haarstudio Uni:cut, nach oben">
    <span class="brand__name">UNI<i>:</i>CUT</span>
    <span class="brand__sub">HAARSTUDIO</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#leistungen">Leistungen</a>
    <a href="#studio">Studio</a>
    <a href="#looks">Looks</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
  <a class="btn btn--dark nav__cta" href="#termin">Termin</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#leistungen">Leistungen</a>
    <a href="#studio">Studio</a>
    <a href="#looks">Looks</a>
    <a href="#kontakt">Kontakt</a>
    <a class="btn btn--light" href="#termin">Termin anfragen</a>
  </nav>
  <p class="menu__tel"><a href="tel:+436640000000" data-demo-tel>0664 / 000 00 00</a></p>
</div>

<main id="top">

  <!-- START -->
  <section class="hero">
    <div class="hero__txt">
      <p class="eyebrow">Haarstudio in Ruprechtshofen</p>
      <h1 class="hero__title">Jede Frisur<br><em>ein Unikat.</em></h1>
      <p class="hero__lead">Schnitt, Farbe und Styling, dazu Wimpern und Nägel. Alles an einem Ort, von einem Team, das sein Handwerk liebt.</p>
      <div class="hero__btns">
        <a class="btn btn--dark" href="#termin">Termin anfragen</a>
        <a class="btn btn--line" href="tel:+436640000000" data-demo-tel>0664 / 000 00 00</a>
      </div>
    </div>
    <div class="hero__media">
      <picture>
        <source media="(max-width: 800px)" srcset="assets/img/hero-800.webp">
        <img src="assets/img/hero.webp" alt="Frau mit langen, gewellten Haaren in Schwarz-Weiß" width="1000" height="1250" fetchpriority="high">
      </picture>
      <div class="seal" aria-label="Staatsmeisterin 2025">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="kreis" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs>
          <text><textPath href="#kreis" textLength="474" lengthAdjust="spacing">STAATSMEISTERIN 2025 · STAATSMEISTERIN 2025 ·</textPath></text>
        </svg>
        <span class="seal__in">2025</span>
      </div>
    </div>
  </section>

  <!-- LAUFBAND -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker__row">
      <span>Haarschnitt</span><b>✦</b><span>Farbe</span><b>✦</b><span>Balayage</span><b>✦</b><span>Hochsteckfrisur</span><b>✦</b><span>Wimpernstyling</span><b>✦</b><span>Nageldesign</span><b>✦</b>
      <span>Haarschnitt</span><b>✦</b><span>Farbe</span><b>✦</b><span>Balayage</span><b>✦</b><span>Hochsteckfrisur</span><b>✦</b><span>Wimpernstyling</span><b>✦</b><span>Nageldesign</span><b>✦</b>
    </div>
  </div>

  <!-- LEISTUNGEN -->
  <section class="sec" id="leistungen">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow">Leistungen</p>
        <h2>Drei Welten.<br><em>Ein Studio.</em></h2>
      </div>

      <div class="svc reveal">
        <div class="svc__tabs" role="tablist" aria-label="Bereich wählen">
          <button type="button" role="tab" id="t-haare" aria-controls="p-haare" aria-selected="true"><span>01</span>Haare</button>
          <button type="button" role="tab" id="t-wimpern" aria-controls="p-wimpern" aria-selected="false" tabindex="-1"><span>02</span>Wimpern</button>
          <button type="button" role="tab" id="t-naegel" aria-controls="p-naegel" aria-selected="false" tabindex="-1"><span>03</span>Nägel</button>
        </div>

        <div class="svc__pane is-on" id="p-haare" role="tabpanel" aria-labelledby="t-haare">
          <div class="svc__img"><img src="assets/img/haare-800.webp" srcset="assets/img/haare-800.webp 800w, assets/img/haare.webp 1000w" sizes="(max-width: 800px) 100vw, 40vw" alt="Haare werden mit Rundbürste und Föhn gestylt" width="800" height="1200" loading="lazy"></div>
          <div class="svc__info">
            <h3>Haare</h3>
            <p>Vom frischen Schnitt bis zur neuen Farbe. Wir nehmen uns Zeit für die Beratung und finden den Look, der zu dir und deinem Alltag passt.</p>
            <ul class="list">
              <li><span>Schnitt &amp; Styling</span><em>Damen, Herren, Kinder</em></li>
              <li><span>Farbe &amp; Strähnen</span><em>Balayage, Blond, Glossing</em></li>
              <li><span>Pflege</span><em>Treatments für gesundes Haar</em></li>
              <li><span>Hochsteckfrisuren</span><em>Hochzeit, Ball, Firmung</em></li>
            </ul>
          </div>
        </div>
        <div class="svc__pane" id="p-wimpern" role="tabpanel" aria-labelledby="t-wimpern" hidden>
          <div class="svc__img"><img src="assets/img/wimpern-detail-800.webp" srcset="assets/img/wimpern-detail-800.webp 800w, assets/img/wimpern-detail.webp 1000w" sizes="(max-width: 800px) 100vw, 40vw" alt="Wimpernverlängerung mit feiner Pinzette" width="800" height="1200" loading="lazy"></div>
          <div class="svc__info">
            <h3>Wimpern</h3>
            <p>Ein offener Blick, ganz ohne Mascara. Natürlich und dezent oder mit mehr Volumen, genau so, wie du es magst.</p>
            <ul class="list">
              <li><span>Wimpernverlängerung</span><em>Klassisch oder Volumen</em></li>
              <li><span>Auffüllen</span><em>Damit es lange schön bleibt</em></li>
              <li><span>Lifting</span><em>Für deine eigenen Wimpern</em></li>
            </ul>
          </div>
        </div>
        <div class="svc__pane" id="p-naegel" role="tabpanel" aria-labelledby="t-naegel" hidden>
          <div class="svc__img"><img src="assets/img/naegel-800.webp" srcset="assets/img/naegel-800.webp 800w, assets/img/naegel.webp 1000w" sizes="(max-width: 800px) 100vw, 40vw" alt="Gepflegte Nägel in Nude mit Goldringen" width="800" height="1067" loading="lazy"></div>
          <div class="svc__info">
            <h3>Nägel</h3>
            <p>Gepflegte Hände sagen viel. Von zeitlosem Nude bis zum Design für den besonderen Anlass.</p>
            <ul class="list">
              <li><span>Gel &amp; Modellage</span><em>Neu oder Auffüllen</em></li>
              <li><span>Nail Art</span><em>Dezent bis auffällig</em></li>
              <li><span>Maniküre</span><em>Pflege für die Hände</em></li>
            </ul>
          </div>
        </div>
      </div>
      <p class="svc__note reveal">Preise und freie Termine gerne telefonisch oder per Nachricht.</p>
    </div>
  </section>

  <!-- STAATSMEISTERIN -->
  <section class="award" aria-labelledby="award-t">
    <div class="award__bg" aria-hidden="true"><img src="assets/img/pampas-hoch-800.webp" alt="" width="800" height="1200" loading="lazy"></div>
    <div class="wrap award__in reveal">
      <p class="eyebrow eyebrow--light">Ausgezeichnet</p>
      <h2 id="award-t">Staats&shy;meisterin <em>2025</em></h2>
      <p class="award__txt">Ein Titel, auf den wir stolz sind. Für dich heißt das: Handwerk auf höchstem Niveau, direkt bei dir am Hauptplatz.</p>
    </div>
  </section>

  <!-- STUDIO -->
  <section class="sec" id="studio">
    <div class="wrap studio">
      <div class="studio__imgs reveal">
        <img class="studio__a" src="assets/img/lounge-800.webp" alt="Warmes Licht, Pampasgras und ein Holzstuhl" width="800" height="1067" loading="lazy">
        <img class="studio__b" src="assets/img/vase-800.webp" alt="Pampasgras in einer Glasvase" width="800" height="533" loading="lazy">
      </div>
      <div class="studio__txt">
        <div class="head head--left reveal">
          <p class="eyebrow">Das Studio</p>
          <h2>Ankommen.<br><em>Durchatmen.</em></h2>
        </div>
        <p class="reveal">Bei uns sitzt du nicht am Fließband. Ein großes Team, viel Erfahrung und ein Raum, in dem man sich gerne Zeit nimmt.</p>
        <ol class="steps">
          <li class="reveal"><b>Beratung</b><span>Wir hören zu, bevor die Schere zum Einsatz kommt.</span></li>
          <li class="reveal"><b>Handwerk</b><span>Präzise Schnitte und Farben, die halten, was sie versprechen.</span></li>
          <li class="reveal"><b>Wohlfühlen</b><span>Ein gutes Gespräch und am Ende ein Blick in den Spiegel, der Freude macht.</span></li>
        </ol>
      </div>
    </div>
  </section>

  <!-- LOOKS -->
  <section class="sec sec--sand" id="looks">
    <div class="wrap">
      <div class="head head--row reveal">
        <div>
          <p class="eyebrow">Looks</p>
          <h2>Jeder Kopf <em>erzählt etwas.</em></h2>
        </div>
        <div class="looks__nav">
          <button type="button" class="arrow" data-dir="-1" aria-label="Zurück">←</button>
          <button type="button" class="arrow" data-dir="1" aria-label="Weiter">→</button>
        </div>
      </div>
    </div>
    <div class="looks" id="looks-row" tabindex="0" aria-label="Looks zum Durchwischen">
      <figure class="look"><img src="assets/img/portrait-800.webp" alt="Lockige Haare, Schwarz-Weiß-Porträt" width="800" height="1200" decoding="async"><figcaption>Natürliche Locken</figcaption></figure>
      <figure class="look"><img src="assets/img/haare-800.webp" alt="Föhnen mit Rundbürste" width="800" height="1200" decoding="async"><figcaption>Blow-Dry</figcaption></figure>
      <figure class="look"><img src="assets/img/wimpern-800.webp" alt="Wimpernverlängerung im Detail" width="800" height="533" decoding="async"><figcaption>Wimpern</figcaption></figure>
      <figure class="look"><img src="assets/img/naegel-800.webp" alt="Nude-Nägel mit Goldringen" width="800" height="1067" decoding="async"><figcaption>Nude Nails</figcaption></figure>
      <figure class="look"><img src="assets/img/hero-800.webp" alt="Lange Wellen, Schwarz-Weiß" width="800" height="1000" decoding="async"><figcaption>Lange Wellen</figcaption></figure>
    </div>
    <div class="wrap">
      <a class="insta reveal" href="https://www.instagram.com/uni.cut_haarstudio/" target="_blank" rel="noopener">Mehr Looks auf Instagram <span>@uni.cut_haarstudio</span></a>
    </div>
  </section>

  <!-- TERMIN -->
  <section class="sec" id="termin">
    <div class="wrap termin">
      <div class="termin__txt">
        <div class="head head--left reveal">
          <p class="eyebrow">Termin</p>
          <h2>Zeit für <em>etwas Neues?</em></h2>
        </div>
        <p class="reveal">Am schnellsten geht es telefonisch. Oder du hinterlässt hier deinen Wunsch und wir rufen dich zurück.</p>
        <a class="bigtel reveal" href="tel:+436640000000" data-demo-tel><small>Anrufen</small>0664 / 000 00 00</a>
      </div>

      <form class="form reveal" id="form" novalidate>
        <fieldset class="chips">
          <legend>Worum geht es?</legend>
          <label><input type="radio" name="art" value="Haare" checked><span>Haare</span></label>
          <label><input type="radio" name="art" value="Wimpern"><span>Wimpern</span></label>
          <label><input type="radio" name="art" value="Nägel"><span>Nägel</span></label>
          <label><input type="radio" name="art" value="Anlass"><span>Hochzeit &amp; Anlass</span></label>
        </fieldset>
        <fieldset class="chips chips--days">
          <legend>Wann passt es dir?</legend>
          <label><input type="radio" name="zeit" value="Vormittag" checked><span>Vormittag</span></label>
          <label><input type="radio" name="zeit" value="Nachmittag"><span>Nachmittag</span></label>
          <label><input type="radio" name="zeit" value="Samstag"><span>Samstag</span></label>
        </fieldset>
        <label class="fld"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
        <label class="fld"><span>Telefon</span><input type="tel" name="tel" autocomplete="tel" inputmode="tel" required></label>
        <button class="btn btn--dark btn--full" type="submit">Rückruf anfragen</button>
        <p class="form__ok" id="form-ok" role="status" hidden>Danke! Das ist nur der Entwurf, deshalb wird noch nichts verschickt. Auf der fertigen Seite landet die Anfrage direkt bei euch.</p>
        <p class="form__err" id="form-err" role="alert" hidden>Bitte Name und Telefon ausfüllen.</p>
      </form>
    </div>
  </section>

  <!-- KONTAKT -->
  <section class="sec sec--dark" id="kontakt">
    <div class="wrap kontakt">
      <div class="reveal">
        <p class="eyebrow eyebrow--light">Kontakt</p>
        <h2>Hauptplatz 14<br><em>3244 Ruprechtshofen</em></h2>
        <div class="kontakt__btns">
          <a class="btn btn--light" href="https://www.google.com/maps/search/?api=1&amp;query=Haarstudio+Uni%3Acut+Hauptplatz+14+3244+Ruprechtshofen" target="_blank" rel="noopener">Route planen</a>
          <a class="btn btn--line-light" href="https://www.instagram.com/uni.cut_haarstudio/" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="hours reveal">
        <h3>Öffnungszeiten</h3>
        <dl id="hours">
          <div data-tag="1"><dt>Montag</dt><dd>8 – 18 Uhr</dd></div>
          <div data-tag="2"><dt>Dienstag</dt><dd>8 – 18 Uhr</dd></div>
          <div data-tag="3"><dt>Mittwoch</dt><dd>8 – 18 Uhr</dd></div>
          <div data-tag="4"><dt>Donnerstag</dt><dd>8 – 18 Uhr</dd></div>
          <div data-tag="5"><dt>Freitag</dt><dd>8 – 18 Uhr</dd></div>
          <div data-tag="6"><dt>Samstag</dt><dd>8 – 12 Uhr</dd></div>
          <div data-tag="0"><dt>Sonntag</dt><dd>geschlossen</dd></div>
        </dl>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <a class="brand brand--light" href="#top" aria-label="Nach oben">
      <span class="brand__name">UNI<i>:</i>CUT</span>
      <span class="brand__sub">HAARSTUDIO</span>
    </a>
    <p class="foot__links"><a href="https://www.instagram.com/uni.cut_haarstudio/" target="_blank" rel="noopener">Instagram</a><a href="tel:+436640000000" data-demo-tel>Telefon</a><span>Impressum</span><span>Datenschutz</span></p>
    <p class="foot__fine">Fotos im Entwurf: Pexels (Angel Rondon, Maximilian Oeverhaus, cottonbro studio, Nataliya Vaitkevich, Ann poan, Moo Lens, Marina Pechnikova, Pavel Morillo, Екатерина Мясоед). Auf der fertigen Seite kommen eure eigenen Bilder hinein.</p>
    <a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
  </div>
</footer>

</body>
</html>
