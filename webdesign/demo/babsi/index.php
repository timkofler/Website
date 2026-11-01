<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Babsis Hoarstüberl · Friseursalon in Aspang-Markt</title>
<meta name="description" content="Babsis Hoarstüberl in Aspang-Markt: Schneiden, Färben, Strähnen, Balayage und Hochsteckfrisuren für Damen und Herren. Dienstag bis Freitag 8 bis 18 Uhr.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f4efe4">
<link rel="preload" href="assets/fonts/cormorant-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/wellen-700.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/wellen.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=4">
<script src="assets/app.js?v=3" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "Babsis Hoarstüberl",
  "address": {"@type": "PostalAddress", "streetAddress": "Andreas-Hofer-Straße 30", "postalCode": "2870", "addressLocality": "Aspang-Markt", "addressCountry": "AT"},
  "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:00", "closes": "18:00"}],
  "sameAs": ["https://www.instagram.com/babsis_hoarstueberl/"]
}
</script>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="zweig" viewBox="0 0 64 64"><g fill="currentColor"><path d="M31 62c1-14 0-27-4-40l2-.6c4 13 5.4 26.6 4.4 40.6z"/><path d="M27.6 22C22 18 19 11 20 3c6 4 9.4 11 7.6 19z"/><path d="M29 30c3-7 9-11.6 17-12-2.6 7-8.6 11.4-17 12z"/><path d="M28 37c-6-3-13.6-2.6-19 2 6.6 3 13 3 19-2z"/><path d="M31 44c4-6 10.6-8.6 18-7.6-4 6-10.6 8.6-18 7.6z"/><path d="M27.4 14c-1.4-5 0-9.6 3.6-13 1.4 5-.4 9.6-3.6 13z" opacity=".75"/></g></symbol>
  <symbol id="blatt" viewBox="0 0 20 40"><path fill="currentColor" d="M10 0C2 10 2 30 10 40 18 30 18 10 10 0z"/></symbol>
</svg>

<a class="skip" href="#leistungen">Direkt zu den Leistungen</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Babsis Hoarstüberl, nach oben">
    <svg class="brand__mark" aria-hidden="true"><use href="#zweig"/></svg>
    <span class="brand__txt"><em>Babsis</em><span>Hoarstüberl</span></span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#leistungen">Leistungen</a>
    <a href="#vorher-nachher">Vorher &amp; Nachher</a>
    <a href="#termin">Termin</a>
    <a href="#zeiten">Öffnungszeiten</a>
  </nav>
  <a class="btn btn--dark nav__cta" href="#termin">Termin buchen</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#leistungen">Leistungen</a>
    <a href="#vorher-nachher">Vorher &amp; Nachher</a>
    <a href="#salon">Salon</a>
    <a href="#zeiten">Öffnungszeiten</a>
    <a class="btn btn--dark" href="#termin">Termin buchen</a>
  </nav>
</div>

<main id="top">

  <!-- START -->
  <section class="hero">
    <div class="hero__leaves" aria-hidden="true">
      <svg><use href="#blatt"/></svg><svg><use href="#blatt"/></svg><svg><use href="#blatt"/></svg><svg><use href="#blatt"/></svg><svg><use href="#blatt"/></svg>
    </div>
    <div class="wrap hero__in">
      <div class="hero__txt">
        <p class="status" data-status><span class="status__dot"></span><span data-status-text>Dienstag bis Freitag geöffnet</span></p>
        <h1 class="hero__title">Schöne Haare,<br><em>mit Zeit und Gefühl.</em></h1>
        <p class="hero__lead">Ihr Friseursalon in Aspang-Markt. Schneiden, Farbe, Balayage und Hochsteckfrisuren für Damen und Herren.</p>
        <div class="hero__btns">
          <a class="btn btn--dark" href="#termin">Online-Termin buchen</a>
          <a class="btn btn--line" href="#leistungen">Leistungen ansehen</a>
        </div>
      </div>
      <figure class="hero__pic">
        <div class="arch">
          <picture>
            <source media="(max-width: 800px)" srcset="assets/img/wellen-700.webp">
            <img src="assets/img/wellen.webp" alt="Lange, weich gewellte Haare mit hellen Spitzen" width="1100" height="1574" fetchpriority="high">
          </picture>
        </div>
        <figcaption class="hero__badge"><svg aria-hidden="true"><use href="#zweig"/></svg><span>Andreas-Hofer-Straße 30<br>2870 Aspang-Markt</span></figcaption>
      </figure>
    </div>
  </section>

  <!-- LAUFBAND -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker__row">
      <span>Schneiden</span><i></i><span>Färben</span><i></i><span>Strähnen</span><i></i><span>Balayage</span><i></i><span>Hochsteckfrisuren</span><i></i><span>Pflege</span><i></i><span>Herrenschnitt</span><i></i>
      <span>Schneiden</span><i></i><span>Färben</span><i></i><span>Strähnen</span><i></i><span>Balayage</span><i></i><span>Hochsteckfrisuren</span><i></i><span>Pflege</span><i></i><span>Herrenschnitt</span><i></i>
    </div>
  </div>

  <!-- LEISTUNGEN -->
  <section class="sec sec--dark" id="leistungen">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow">Leistungen</p>
        <h2>Was wir für <em>Ihr Haar</em> tun</h2>
        <p class="head__lead">Jeder Termin beginnt mit einem kurzen Gespräch. Erst dann wird geschnitten, gefärbt oder gesteckt.</p>
      </div>
      <div class="svc">
        <article class="svc__card reveal">
          <div class="svc__img"><img src="assets/img/schnitt-700.webp" alt="Haarschnitt mit Schere und Kamm" width="700" height="1048" loading="lazy"></div>
          <p class="svc__no">01</p>
          <h3>Schneiden &amp; Föhnen</h3>
          <p>Für Damen und Herren. Ein Schnitt, der zu Ihnen und Ihrem Alltag passt.</p>
        </article>
        <article class="svc__card reveal">
          <div class="svc__img"><img src="assets/img/farbe-700.webp" alt="Haarfarbe wird mit dem Pinsel aufgetragen" width="700" height="1050" loading="lazy"></div>
          <p class="svc__no">02</p>
          <h3>Farbe &amp; Strähnen</h3>
          <p>Klassisch gefärbt, mit Strähnen aufgehellt oder graue Haare sanft abgedeckt.</p>
        </article>
        <article class="svc__card reveal">
          <div class="svc__img"><img src="assets/img/styling-700.webp" alt="Haare werden mit der Rundbürste geföhnt" width="700" height="1050" loading="lazy"></div>
          <p class="svc__no">03</p>
          <h3>Balayage</h3>
          <p>Weiche Übergänge wie von der Sonne gemalt, die schön herauswachsen.</p>
        </article>
        <article class="svc__card reveal">
          <div class="svc__img"><img src="assets/img/hochsteck-700.webp" alt="Hochsteckfrisur mit glitzerndem Haarschmuck" width="700" height="467" loading="lazy"></div>
          <p class="svc__no">04</p>
          <h3>Hochsteck &amp; Festfrisur</h3>
          <p>Für Hochzeit, Ball oder Firmung. Eine Frisur, die den ganzen Tag hält.</p>
        </article>
      </div>
      <p class="note reveal"><span>Entwurf</span> Hier kann auch Ihre Preisliste stehen, übersichtlich und jederzeit änderbar.</p>
    </div>
  </section>

  <!-- VORHER NACHHER -->
  <section class="sec" id="vorher-nachher">
    <div class="wrap ba">
      <div class="head reveal">
        <p class="eyebrow">Vorher &amp; Nachher</p>
        <h2>Der Unterschied <em>auf einen Blick</em></h2>
        <p class="head__lead">Ziehen Sie den Regler zur Seite und sehen Sie, was ein Termin im Hoarstüberl ausmacht.</p>
        <p class="note"><span>Entwurf</span> Im Entwurf mit einem Beispielfoto. Auf Ihrer Seite stehen hier Ihre eigenen Vorher-Nachher-Bilder.</p>
      </div>
      <div class="ba__box reveal" id="ba" style="--pos:50%">
        <img class="ba__after" src="assets/img/vorher-nachher-700.webp" srcset="assets/img/vorher-nachher-700.webp 700w, assets/img/vorher-nachher.webp 1100w" sizes="(max-width: 800px) 92vw, 480px" alt="Nachher: lange Haare mit weichen Wellen und hellen Spitzen" width="700" height="1006" loading="lazy">
        <div class="ba__before" aria-hidden="true"><img src="assets/img/vorher-nachher-700.webp" srcset="assets/img/vorher-nachher-700.webp 700w, assets/img/vorher-nachher.webp 1100w" sizes="(max-width: 800px) 92vw, 480px" alt="" width="700" height="1006" loading="lazy"></div>
        <span class="ba__tag ba__tag--l">Vorher</span><span class="ba__tag ba__tag--r">Nachher</span>
        <span class="ba__line" aria-hidden="true"><b></b></span>
        <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Vorher und Nachher vergleichen">
      </div>
    </div>
  </section>

  <!-- SALON -->
  <section class="sec sec--sage" id="salon">
    <div class="wrap salon">
      <svg class="salon__mark reveal" aria-hidden="true"><use href="#zweig"/></svg>
      <blockquote class="salon__quote reveal">„Ein kleiner Salon, in dem man sich Zeit nimmt: für ein gutes Gespräch, den passenden Schnitt und eine Farbe, die zu Ihnen passt.“</blockquote>
      <p class="salon__sig reveal">Barbara Mayrhofer</p>
      <ul class="salon__pts">
        <li class="reveal"><b>Damen &amp; Herren</b><span>Vom schnellen Herrenschnitt bis zur Festfrisur</span></li>
        <li class="reveal"><b>Termin nach Vereinbarung</b><span>Kurz anrufen, gemeinsam einen Termin finden</span></li>
        <li class="reveal"><b>In Aspang-Markt</b><span>Andreas-Hofer-Straße 30</span></li>
      </ul>
    </div>
  </section>

  <!-- TERMIN -->
  <section class="sec" id="termin">
    <div class="wrap book">
      <div class="head reveal">
        <p class="eyebrow">Online-Termin</p>
        <h2>Ihr Termin <em>in einer Minute</em></h2>
        <p class="head__lead">Leistung wählen, Tag und Uhrzeit antippen, Name dazu. Sie bekommen eine Bestätigung, sobald der Termin fix ist.</p>
        <p class="note"><span>Entwurf</span> Die freien Zeiten sind Beispiele. Auf Ihrer Seite landet jede Anfrage sofort auf Ihrem Handy und Sie bestätigen mit einem Tipp.</p>
      </div>
      <form class="bk reveal" id="bk" novalidate>
        <fieldset class="bk__step">
          <legend><b>1</b> Was dürfen wir machen?</legend>
          <div class="bk__chips" id="bk-svc">
            <label><input type="radio" name="svc" value="Schneiden &amp; Föhnen" data-min="60" checked><span>Schneiden &amp; Föhnen</span></label>
            <label><input type="radio" name="svc" value="Herrenschnitt" data-min="30"><span>Herrenschnitt</span></label>
            <label><input type="radio" name="svc" value="Farbe" data-min="90"><span>Farbe</span></label>
            <label><input type="radio" name="svc" value="Strähnen" data-min="120"><span>Strähnen</span></label>
            <label><input type="radio" name="svc" value="Balayage" data-min="150"><span>Balayage</span></label>
            <label><input type="radio" name="svc" value="Hochsteckfrisur" data-min="60"><span>Hochsteckfrisur</span></label>
          </div>
        </fieldset>
        <fieldset class="bk__step">
          <legend><b>2</b> Wann passt es Ihnen?</legend>
          <div class="bk__days" id="bk-days" role="radiogroup" aria-label="Tag wählen"></div>
          <div class="bk__times" id="bk-times" role="radiogroup" aria-label="Uhrzeit wählen"></div>
        </fieldset>
        <fieldset class="bk__step">
          <legend><b>3</b> Wer kommt?</legend>
          <div class="bk__row">
            <label class="fld"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
            <label class="fld"><span>Telefon</span><input type="tel" name="tel" autocomplete="tel" inputmode="tel" required></label>
          </div>
        </fieldset>
        <p class="bk__err" id="bk-err" role="alert" hidden></p>
        <button class="btn btn--dark bk__go" type="submit" id="bk-go">Termin anfragen</button>
        <div class="bk__ok" id="bk-ok" role="status" hidden>
          <svg aria-hidden="true"><use href="#zweig"/></svg>
          <p class="bk__ok-t">Danke, <span id="bk-ok-name"></span>!</p>
          <p class="bk__ok-w" id="bk-ok-was"></p>
          <p class="bk__ok-n">Das ist nur der Entwurf, deshalb wird noch nichts verschickt. Auf der fertigen Seite bekommt Babsi Ihre Anfrage sofort aufs Handy.</p>
          <button class="btn btn--line" type="button" id="bk-neu">Noch einen Termin</button>
        </div>
      </form>
    </div>
  </section>

  <!-- ZEITEN UND KONTAKT -->
  <section class="sec sec--dark" id="zeiten">
    <div class="wrap visit">
      <div class="visit__txt reveal">
        <p class="eyebrow">Besuchen Sie uns</p>
        <h2>Wir freuen uns<br><em>auf Sie.</em></h2>
        <p class="status status--dark" data-status><span class="status__dot"></span><span data-status-text>Dienstag bis Freitag geöffnet</span></p>
        <a class="phone" href="tel:+436640000000" data-demo-tel><small>Termin unter</small>0664 000 00 00</a>
        <div class="visit__btns">
          <a class="btn btn--light" href="https://www.google.com/maps/search/?api=1&amp;query=Andreas-Hofer-Stra%C3%9Fe+30+2870+Aspang-Markt" target="_blank" rel="noopener">Route planen</a>
          <a class="btn btn--ghost" href="https://www.instagram.com/babsis_hoarstueberl/" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <dl class="hours reveal" id="hours">
        <div data-tag="1"><dt>Montag</dt><dd>geschlossen</dd></div>
        <div data-tag="2"><dt>Dienstag</dt><dd>8:00 – 18:00</dd></div>
        <div data-tag="3"><dt>Mittwoch</dt><dd>8:00 – 18:00</dd></div>
        <div data-tag="4"><dt>Donnerstag</dt><dd>8:00 – 18:00</dd></div>
        <div data-tag="5"><dt>Freitag</dt><dd>8:00 – 18:00</dd></div>
        <div data-tag="6"><dt>Samstag</dt><dd>geschlossen</dd></div>
        <div data-tag="0"><dt>Sonntag</dt><dd>geschlossen</dd></div>
      </dl>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <a class="brand brand--foot" href="#top" aria-label="Nach oben">
      <svg class="brand__mark" aria-hidden="true"><use href="#zweig"/></svg>
      <span class="brand__txt"><em>Babsis</em><span>Hoarstüberl</span></span>
    </a>
    <p class="foot__addr">Andreas-Hofer-Straße 30, 2870 Aspang-Markt · <a href="tel:+436640000000" data-demo-tel>0664 000 00 00</a></p>
    <p class="foot__links"><span>Impressum</span><span>Datenschutz</span></p>
    <p class="foot__fine">Fotos im Entwurf: Pexels (Adrianna CA, Kampus Production, Nataliya Vaitkevich, Daniil Kondrashin, Engin Akyurt). Auf der fertigen Seite kommen Ihre eigenen Bilder und Ihr Logo hinein.</p>
    <a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
  </div>
</footer>

<a class="callbar" id="callbar" href="#termin"><span class="status__dot"></span><span>Termin buchen</span><b>online</b></a>

</body>
</html>
