<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Krampaspass · Krampusgruppe aus dem Erlauftal im Mostviertel</title>
<meta name="description" content="Krampaspass, Krampusgruppe aus dem Erlauftal im Mostviertel, anno 2019. Mostviertler Krampusspektakel am 21. November in Gresten, Aftershow-Party und alle Termine der Tour 2026.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#140c07">
<link rel="preload" href="assets/fonts/grenze-gotisch.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/alegreya-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-800.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=2">
<script src="assets/js-an.js?v=1"></script>
<script src="assets/app.js?v=1" defer></script>
<script src="assets/glut.js?v=1" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "#krampaspass",
      "name": "Krampaspass",
      "description": "Krampusgruppe aus dem Erlauftal im Mostviertel, gegründet 2019.",
      "foundingDate": "2019",
      "email": "krampas-pass@gmx.at",
      "areaServed": {"@type": "AdministrativeArea", "name": "Mostviertel"},
      "sameAs": ["https://www.instagram.com/krampaspass/"]
    },
    {
      "@type": "Event",
      "name": "Mostviertler Krampusspektakel",
      "startDate": "2026-11-21T16:00:00+01:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {"@type": "Place", "name": "Gresten", "address": {"@type": "PostalAddress", "postalCode": "3264", "addressLocality": "Gresten", "addressRegion": "Niederösterreich", "addressCountry": "AT"}},
      "offers": {"@type": "Offer", "price": "5", "priceCurrency": "EUR", "availability": "https://schema.org/InStock"},
      "performer": {"@id": "#krampaspass"}
    }
  ]
}
</script>
</head>
<body>

<a class="skip" href="#spektakel">Direkt zum Spektakel</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Krampaspass, nach oben">
    <span class="brand__name">Krampaspass</span>
    <span class="brand__sub">anno MMXIX</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#spektakel">Spektakel</a>
    <a href="#tour">Tour 2026</a>
    <a href="#pass">Die Pass</a>
    <a href="#galerie">Galerie</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
  <a class="btn btn--feuer nav__cta" href="#spektakel">21.11. Gresten</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#spektakel">Krampusspektakel 21.11.</a>
    <a href="#party">Aftershow-Party</a>
    <a href="#tour">Tour 2026</a>
    <a href="#pass">Die Pass</a>
    <a href="#galerie">Galerie</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
</div>

<main id="top">

  <section class="hero" aria-labelledby="hero-titel">
    <picture class="hero__bild">
      <source media="(max-width: 800px)" srcset="assets/img/hero-800.webp">
      <img src="assets/img/hero.webp" alt="Krampus mit Hörnern im roten Rauch bei einem Krampuslauf" width="1800" height="1350" fetchpriority="high">
    </picture>
    <div class="hero__rauch" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="hero__in">
      <p class="hero__kicker">Aus dem Erlauftal im Mostviertel</p>
      <h1 id="hero-titel">Krampaspass</h1>
      <p class="hero__anno">anno MMXIX</p>
      <p class="hero__text">Fell, Hörner, Glocken und ein bisserl Rauch. Seit 2019 ziehen wir durchs Mostviertel und weit darüber hinaus.</p>
      <div class="hero__knoepfe">
        <a class="btn btn--feuer" href="#spektakel">Zum Spektakel am 21.11.</a>
        <a class="btn btn--rand" href="#tour">Tour 2026</a>
      </div>
    </div>
    <a class="hero__siegel" href="#spektakel" aria-label="Zum Krampusspektakel am 21. November">
      <span>Sa</span><b>21.11.</b><span>Gresten</span>
    </a>
  </section>

  <section class="spektakel perg" id="spektakel" aria-labelledby="sp-titel">
    <div class="wrap">
      <div class="plakat reveal">
        <p class="plakat__vor">Mostviertler</p>
        <h2 id="sp-titel"><span class="plakat__rot">Krampus</span>spektakel</h2>
        <p class="plakat__wann">Samstag, <b>21. November</b><span class="punkt-weg"> ·</span><br class="nur-handy"> Gresten · ab 16 Uhr</p>
      </div>

      <div class="uhr reveal" id="uhr" aria-live="off">
        <p class="uhr__titel" id="uhr-titel">Noch so lange, bis Gresten bebt</p>
        <div class="uhr__bretter">
          <span><b id="c-t">00</b>Tage</span>
          <span><b id="c-s">00</b>Stunden</span>
          <span><b id="c-m">00</b>Minuten</span>
          <span><b id="c-x">00</b>Sekunden</span>
        </div>
        <div class="uhr__knoepfe">
          <a class="btn btn--tinte" href="assets/krampusspektakel-gresten.ics" download>In den Kalender</a>
          <a class="btn btn--rand-dunkel" href="https://www.google.com/maps/search/?api=1&amp;query=Gresten%203264" target="_blank" rel="noopener">Route nach Gresten</a>
        </div>
      </div>

      <div class="fakten">
        <div class="fakt reveal"><p class="fakt__gross">5 €</p><p>Eintritt<br><small>bis 14 Jahre frei</small></p></div>
        <div class="fakt reveal"><p class="fakt__gross">16 Uhr</p><p>Das Spektakel<br><small>beginnt in Gresten</small></p></div>
        <div class="fakt reveal"><p class="fakt__gross">18 Uhr</p><p>Start<br><small>Krampuslauf</small></p></div>
      </div>

      <div class="ablauf" id="ablauf">
        <h3 class="ablauf__titel reveal">Der Abend im Überblick</h3>
        <ol class="zuend" id="zuend">
          <li class="zuend__punkt"><time datetime="2026-11-21T16:00">16:00</time><div><h4>Gresten füllt sich</h4><p>Das Spektakel beginnt. Zeit für einen Punsch und einen Blick auf die Masken aus der Nähe.</p></div></li>
          <li class="zuend__punkt"><time datetime="2026-11-21T18:00">18:00</time><div><h4>Krampuslauf</h4><p>Glocken, Fackeln, Rauch: Die Gruppen ziehen durch den Ort. Abstand halten lohnt sich, ein bisserl.</p></div></li>
          <li class="zuend__punkt"><time datetime="2026-11-21T21:00">21:00</time><div><h4>Aftershow-Party</h4><p>Danach wird gefeiert, in der Kulturschmiede Gresten.</p><a class="zuend__link" href="#party">Zur Party</a></div></li>
        </ol>
      </div>
    </div>
  </section>

  <section class="rauch" aria-label="Zwischenbild">
    <picture>
      <source media="(max-width: 800px)" srcset="assets/img/rauch-800.webp">
      <img src="assets/img/rauch.webp" alt="Silhouette vor rotem Rauch bei Nacht" width="1600" height="1049" loading="lazy">
    </picture>
    <p class="rauch__satz reveal">Wenn's im Erlauftal raucht,<br><em>sind wir nicht weit.</em></p>
  </section>

  <section class="party" id="party" aria-labelledby="party-titel">
    <div class="wrap party__in">
      <figure class="party__bild reveal">
        <picture>
          <source media="(max-width: 800px)" srcset="assets/img/party-800.webp">
          <img src="assets/img/party.webp" alt="Krampus vor bunten Scheinwerfern auf einer Bühne" width="1400" height="1050" loading="lazy">
        </picture>
      </figure>
      <div class="party__text">
        <p class="eyebrow reveal">Samstag, 21.11. · ab 21 Uhr</p>
        <h2 id="party-titel" class="reveal">Aftershow-<br><em>Party</em></h2>
        <p class="reveal">Nach dem Lauf ist vor der Party. Masken ab, Musik an: Wir feiern den Abend gemeinsam mit allen Gruppen und Gästen.</p>
        <address class="party__ort reveal">
          <b>Kulturschmiede Gresten</b>
          Spörken 1, 3264 Gresten
        </address>
        <a class="btn btn--feuer reveal" href="https://www.google.com/maps/search/?api=1&amp;query=Kulturschmiede%20Gresten%20Sp%C3%B6rken%201%203264%20Gresten" target="_blank" rel="noopener">Route zur Kulturschmiede</a>
      </div>
    </div>
  </section>

  <section class="glut perg" aria-label="Schriftzug Krampaspass">
    <div class="glut__buehne" id="glut">
      <picture class="glut__bild">
        <source media="(max-width: 700px)" srcset="assets/img/glut-handy.webp">
        <img src="assets/img/glut.webp" alt="Schriftzug Krampaspass, die Buchstaben glühen wie Lava" width="1600" height="470" loading="lazy" decoding="async">
      </picture>
    </div>
    <p class="glut__hinweis" id="glut-hinweis" hidden></p>
  </section>

  <section class="tour" id="tour" aria-labelledby="tour-titel">
    <div class="wrap">
      <header class="kopf kopf--hell reveal">
        <p class="eyebrow">Wo ihr uns trefft</p>
        <h2 id="tour-titel">Tour <em>2026</em></h2>
        <p class="kopf__sub">Acht Läufe von Gresten bis Fohnsdorf. Was vorbei ist, streichen wir durch, der nächste Lauf ist eingekreist.</p>
      </header>
      <div class="rolle" id="rolle">
        <div class="rolle__stab" aria-hidden="true"></div>
        <div class="rolle__blatt">
          <p class="rolle__kopf" aria-hidden="true">Krampaspass <span>2026</span></p>
          <ol class="termine" id="termine">
            <li data-d="2026-11-21"><span class="termine__tag">Sa.</span><time datetime="2026-11-21">21.11.</time><span class="termine__ort">Gresten <small>Krampusspektakel</small></span></li>
            <li data-d="2026-11-27"><span class="termine__tag">Fr.</span><time datetime="2026-11-27">27.11.</time><span class="termine__ort">Haus</span></li>
            <li data-d="2026-11-28"><span class="termine__tag">Sa.</span><time datetime="2026-11-28">28.11.</time><span class="termine__ort">Hollabrunn</span></li>
            <li data-d="2026-12-04"><span class="termine__tag">Fr.</span><time datetime="2026-12-04">04.12.</time><span class="termine__ort">Altenmarkt</span></li>
            <li data-d="2026-12-05"><span class="termine__tag">Sa.</span><time datetime="2026-12-05">05.12.</time><span class="termine__ort">Mautern</span></li>
            <li data-d="2026-12-06"><span class="termine__tag">So.</span><time datetime="2026-12-06">06.12.</time><span class="termine__ort">Großraming</span></li>
            <li data-d="2026-12-07"><span class="termine__tag">Mo.</span><time datetime="2026-12-07">07.12.</time><span class="termine__ort">Winklarn</span></li>
            <li data-d="2026-12-12"><span class="termine__tag">Sa.</span><time datetime="2026-12-12">12.12.</time><span class="termine__ort">Fohnsdorf</span></li>
          </ol>
          <p class="rolle__fuss">Im Entwurf vom Tour-Plakat abgeschrieben. Uhrzeiten und Details trägt ihr später selbst ein.</p>
        </div>
        <div class="rolle__stab rolle__stab--unten" aria-hidden="true"></div>
      </div>
    </div>
  </section>

  <section class="pass perg" id="pass" aria-labelledby="pass-titel">
    <div class="wrap">
      <div class="pass__in">
        <div class="pass__text">
          <p class="eyebrow eyebrow--tinte reveal">Freunde &amp; Spaß</p>
          <h2 id="pass-titel" class="reveal">Eine Pass aus<br><em>dem Erlauftal</em></h2>
          <p class="reveal">2019 haben wir angefangen, mit ein paar Freunden, ein paar Masken und viel Freude am alten Brauch. Heute laufen wir quer durchs Mostviertel und darüber hinaus, und im November geht's in Gresten rund.</p>
          <div class="zahlen reveal">
            <div><b>2019</b><span>gegründet</span></div>
            <div><b data-zahl="8">8</b><span>Läufe 2026</span></div>
            <div><b>21.11.</b><span>Spektakel in Gresten</span></div>
          </div>
        </div>
        <figure class="pass__bild reveal">
          <img src="assets/img/brauch.webp" alt="Nikolaus mit Bischofsstab neben einem Krampus mit Hörnern" width="1200" height="900" loading="lazy">
          <figcaption>Nikolaus und Krampus gehören zusammen.</figcaption>
        </figure>
      </div>

      <div class="masken reveal">
        <figure class="masken__bild">
          <img src="assets/img/maske.webp" alt="Krampusmaske mit Hörnern und hellem Fell in Nahaufnahme" width="900" height="1200" loading="lazy">
          <span class="masken__glanz" aria-hidden="true"></span>
        </figure>
        <div class="masken__text">
          <p class="eyebrow eyebrow--tinte">Handarbeit</p>
          <h3>Unsere Masken</h3>
          <p>Jede Maske ist ein Einzelstück. Geschnitzt und bemalt werden sie von <a href="https://www.instagram.com/pazi_schmuck/" target="_blank" rel="noopener">@pazi_schmuck</a>. Hier kann später jede Maske mit Foto und Namen ihren eigenen Platz bekommen.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="galerie" id="galerie" aria-labelledby="galerie-titel">
    <div class="wrap">
      <header class="kopf kopf--hell reveal">
        <p class="eyebrow">Galerie</p>
        <h2 id="galerie-titel">Frisch <em>entwickelt</em></h2>
        <p class="kopf__sub">Wie alte Fotos auf Pergament: Erst in der Mitte bekommen sie Farbe. Wischen oder ziehen, tippen öffnet das Bild.</p>
      </header>
    </div>
    <div class="streifen" id="streifen" tabindex="0" aria-label="Bilder, seitlich scrollen">
      <button type="button" class="foto" data-gross="assets/img/g1.webp"><img src="assets/img/g1.webp" alt="Krampus in grauem Fellgewand mit Hörnern" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g2.webp"><img src="assets/img/g2.webp" alt="Krampus mit Hut und Stock im Umzug" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g3.webp"><img src="assets/img/g3.webp" alt="Krampus mit langen Hörnern auf der Straße" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g4.webp"><img src="assets/img/g4.webp" alt="Krampus mit dunkler Maske vor Publikum" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g5.webp"><img src="assets/img/g5.webp" alt="Krampus beim Lauf zwischen Zuschauern" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g6.webp"><img src="assets/img/g6.webp" alt="Nikolaus und Krampus beim Umzug" width="900" height="1125" loading="lazy"></button>
      <button type="button" class="foto" data-gross="assets/img/g7.webp"><img src="assets/img/g7.webp" alt="Krampus mit Fackel in rotem Licht" width="900" height="1125" loading="lazy"></button>
    </div>
    <div class="wrap streifen__steuer">
      <button type="button" id="s-zurueck" aria-label="Bilder zurück">←</button>
      <button type="button" id="s-weiter" aria-label="Bilder weiter">→</button>
      <p>Beispielbilder im Entwurf. Hier kommen eure eigenen Fotos hinein.</p>
    </div>
  </section>

  <section class="kontakt perg" id="kontakt" aria-labelledby="kontakt-titel">
    <div class="wrap kontakt__in">
      <div class="kontakt__text">
        <p class="eyebrow eyebrow--tinte reveal">Kontakt &amp; KP-Shop</p>
        <h2 id="kontakt-titel" class="reveal">Schreibt <em>der Pass</em></h2>
        <p class="reveal">Ihr wollt uns bei eurem Lauf dabeihaben, etwas aus dem KP-Shop oder selbst mitlaufen? Schreibt uns, wir melden uns.</p>
        <ul class="kontakt__wege reveal">
          <li><a href="mailto:krampas-pass@gmx.at">krampas-pass@gmx.at</a></li>
          <li><a href="tel:+436640000000" data-demo-tel>0664 000 00 00</a></li>
          <li><a href="https://www.instagram.com/krampaspass/" target="_blank" rel="noopener">Instagram @krampaspass</a></li>
        </ul>
      </div>
      <form class="brief reveal" id="brief" novalidate>
        <p class="brief__label">Worum geht's?</p>
        <div class="chips" id="anliegen" role="radiogroup" aria-label="Anliegen">
          <button type="button" role="radio" aria-checked="true" data-a="Auftritt" class="is-on">Lauf oder Auftritt</button>
          <button type="button" role="radio" aria-checked="false" data-a="Shop">KP-Shop</button>
          <button type="button" role="radio" aria-checked="false" data-a="Mitmachen">Mitlaufen</button>
          <button type="button" role="radio" aria-checked="false" data-a="Sonstiges">Sonstiges</button>
        </div>
        <div class="felder">
          <label><span>Name</span><input name="name" autocomplete="name" required></label>
          <label><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" required></label>
          <label class="felder__breit"><span>Nachricht</span><textarea name="nachricht" rows="4" id="nachricht" placeholder="Wann, wo und was ihr vorhabt"></textarea></label>
        </div>
        <p class="brief__fehler" id="brief-fehler" role="alert" hidden></p>
        <button class="btn btn--tinte brief__senden" type="submit">Brief abschicken</button>
        <div class="brief__ok" id="brief-ok" hidden>
          <p class="brief__ok-titel">Danke, der Brief ist angekommen</p>
          <p class="brief__ok-klein">Im Entwurf wird nichts verschickt. Auf der fertigen Seite landet die Nachricht direkt in eurem Postfach.</p>
        </div>
      </form>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <div>
      <a class="brand" href="#top" aria-label="Nach oben">
        <span class="brand__name">Krampaspass</span>
        <span class="brand__sub">anno MMXIX</span>
      </a>
      <p class="foot__ort">Krampusgruppe aus dem Erlauftal · Mostviertel · Niederösterreich</p>
    </div>
    <p class="foot__links">
      <a href="https://www.instagram.com/krampaspass/" target="_blank" rel="noopener">Instagram</a>
      <a href="mailto:krampas-pass@gmx.at">E-Mail</a>
      <a href="tel:+436640000000" data-demo-tel>0664 000 00 00</a>
      <span>Impressum</span><span>Datenschutz</span>
    </p>
    <p class="foot__fine">Fotos im Entwurf: Pexels (Erdal Erdal, Bastian Riccardi, Marija Piliskic). Auf der fertigen Seite kommen eure eigenen Bilder hinein.</p>
    <a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Webseite von Tim Kofler</a>
  </div>
</footer>

<a class="mobil-cta" id="mobil-cta" href="#spektakel"><b>21.11. Gresten</b><span id="mobil-rest">Krampusspektakel</span></a>

<div class="licht" id="licht" hidden>
  <button type="button" class="licht__zu" id="licht-zu" aria-label="Bild schließen">×</button>
  <img id="licht-bild" src="" alt="">
</div>

</body>
</html>
