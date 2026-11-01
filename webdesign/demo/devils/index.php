<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Devils Kremsmünster · Krampus- und Perchtenverein in Oberösterreich</title>
<meta name="description" content="The Devils Kremsmünster: Krampus- und Perchtenverein aus Oberösterreich mit 35 Mitgliedern. Alle Termine der Devils Tour 2026/27 und Hausbesuche im Gebiet Kremsmünster anfragen.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0b0908">
<link rel="preload" href="assets/fonts/fraktur.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/oswald.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/barlow-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-800.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=1">
<script>document.documentElement.classList.add("js");</script>
<script src="assets/app.js?v=1" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Devils Kremsmünster",
  "description": "Krampus- und Perchtenverein aus Kremsmünster in Oberösterreich.",
  "numberOfEmployees": {"@type": "QuantitativeValue", "value": 35},
  "address": {"@type": "PostalAddress", "addressLocality": "Kremsmünster", "addressRegion": "Oberösterreich", "addressCountry": "AT"},
  "areaServed": {"@type": "AdministrativeArea", "name": "Oberösterreich"},
  "sameAs": ["https://www.instagram.com/the.devils.at/", "https://www.tiktok.com/@the.devils.at"]
}
</script>
</head>
<body>

<a class="skip" href="#tour">Direkt zu den Terminen</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="The Devils Kremsmünster, nach oben">
    <span class="brand__name">The Devils</span>
    <span class="brand__sub">Kremsmünster</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#tour">Tour</a>
    <a href="#hausbesuche">Hausbesuche</a>
    <a href="#verein">Verein</a>
    <a href="#galerie">Galerie</a>
  </nav>
  <a class="btn btn--glut nav__cta" href="#anfrage">Hausbesuch anfragen</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#tour">Devils Tour 26/27</a>
    <a href="#hausbesuche">Hausbesuche</a>
    <a href="#verein">Verein</a>
    <a href="#galerie">Galerie</a>
    <a class="btn btn--glut" href="#anfrage">Hausbesuch anfragen</a>
  </nav>
</div>

<main id="top">

  <section class="hero" aria-labelledby="hero-titel">
    <picture class="hero__bild">
      <source media="(max-width: 800px)" srcset="assets/img/hero-800.webp">
      <img src="assets/img/hero.webp" alt="Krampus vor rotem Feuerschein bei einem Krampuslauf" width="1800" height="1809" fetchpriority="high">
    </picture>
    <canvas class="hero__glut" id="glut" aria-hidden="true"></canvas>
    <div class="hero__in">
      <p class="hero__kicker"><span></span>Krampus- &amp; Perchtenverein<span class="nur-gross">&nbsp;· Oberösterreich</span></p>
      <h1 id="hero-titel"><span class="hero__name">The Devils</span><span class="hero__ort">Kremsmünster</span></h1>
      <p class="hero__text">35 Mitglieder, Hörner, Fell und Glocken. Wir halten das Brauchtum lebendig, beim Lauf, am Punschstand und bei euch zu Hause.</p>
      <div class="hero__knoepfe">
        <a class="btn btn--glut" href="#anfrage">Hausbesuch anfragen</a>
        <a class="btn btn--rand" href="#tour">Devils Tour 26/27</a>
      </div>
    </div>
    <div class="hero__count" id="count" aria-live="off">
      <p class="hero__count-titel">Nächster Auftritt: <strong id="count-was">Rottenmann</strong></p>
      <div class="hero__uhr">
        <span><b id="c-t">00</b>Tage</span>
        <span><b id="c-s">00</b>Std</span>
        <span><b id="c-m">00</b>Min</span>
        <span><b id="c-x">00</b>Sek</span>
      </div>
    </div>
  </section>

  <div class="band" aria-hidden="true">
    <div class="band__track">
      <span>Krampuslauf</span><i>✦</i><span>Hausbesuche</span><i>✦</i><span>Devils Tour 26/27</span><i>✦</i><span>Kremsmünster</span><i>✦</i><span>Punschstand</span><i>✦</i><span>Oberösterreich</span><i>✦</i>
      <span>Krampuslauf</span><i>✦</i><span>Hausbesuche</span><i>✦</i><span>Devils Tour 26/27</span><i>✦</i><span>Kremsmünster</span><i>✦</i><span>Punschstand</span><i>✦</i><span>Oberösterreich</span><i>✦</i>
    </div>
  </div>

  <section class="tour" id="tour" aria-labelledby="tour-titel">
    <div class="wrap">
      <header class="kopf reveal">
        <p class="eyebrow">Wo ihr uns trefft</p>
        <h2 id="tour-titel">Devils Tour <em>2026/27</em></h2>
        <p class="kopf__sub">Von Rottenmann bis Schlierbach: Hier laufen wir diese Saison. Vergangene Termine werden automatisch grau.</p>
      </header>
      <div class="filter reveal" role="group" aria-label="Termine filtern">
        <button type="button" class="is-on" data-filter="alle" aria-pressed="true">Alle</button>
        <button type="button" data-filter="kms" aria-pressed="false">In Kremsmünster</button>
        <button type="button" data-filter="weg" aria-pressed="false">Unterwegs</button>
        <button type="button" data-filter="punsch" aria-pressed="false">Punschstand</button>
      </div>
      <ol class="termine" id="termine">
        <li class="termin" data-d="2026-11-07" data-tags="weg"><time class="termin__datum" datetime="2026-11-07"><b>7</b>Nov</time><div><h3>Rottenmann</h3><p>Steiermark</p></div><span class="termin__tag">STMK</span></li>
        <li class="termin" data-d="2026-11-14" data-tags="weg"><time class="termin__datum" datetime="2026-11-14"><b>14</b>Nov</time><div><h3>Kirchdorf an der Krems</h3><p>Oberösterreich</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-11-21" data-tags="weg"><time class="termin__datum" datetime="2026-11-21"><b>21</b>Nov</time><div><h3>Freistadt Großlauf</h3><p>Oberösterreich</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-11-27" data-tags="kms punsch"><time class="termin__datum" datetime="2026-11-27"><b>27</b>Nov</time><div><h3>Punschstand Kremsmünster</h3><p>Heimspiel mit Punsch</p></div><span class="termin__tag termin__tag--punsch">Punsch</span></li>
        <li class="termin" data-d="2026-11-27" data-tags="weg"><time class="termin__datum" datetime="2026-11-27"><b>27</b>Nov</time><div><h3>Neukirchen am Walde</h3><p>Oberösterreich</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-11-28" data-tags="kms"><time class="termin__datum" datetime="2026-11-28"><b>28</b>Nov</time><div><h3>Adventmarkt Kremsmünster</h3><p>Heimspiel</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-11-28" data-tags="weg punsch"><time class="termin__datum" datetime="2026-11-28"><b>28</b>Nov</time><div><h3>Punschstand</h3><p>Oberösterreich</p></div><span class="termin__tag termin__tag--punsch">Punsch</span></li>
        <li class="termin" data-d="2026-12-05" data-tags="weg punsch"><time class="termin__datum" datetime="2026-12-05"><b>5</b>Dez</time><div><h3>Hofkirchen im Traunkreis</h3><p>mit Punschstand</p></div><span class="termin__tag termin__tag--punsch">Punsch</span></li>
        <li class="termin" data-d="2026-12-05" data-t="21:30" data-tags="weg"><time class="termin__datum" datetime="2026-12-05T21:30"><b>5</b>Dez</time><div><h3>Maturaball Steyr</h3><p>21:30 bis 22:00 Uhr</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-12-06" data-t="15:00" data-tags="kms"><time class="termin__datum" datetime="2026-12-06T15:00"><b>6</b>Dez</time><div><h3>Hausbesuche</h3><p>Nachmittag ab 15:00 Uhr · <a href="#anfrage">jetzt anfragen</a></p></div><span class="termin__tag termin__tag--haus">Haus</span></li>
        <li class="termin" data-d="2026-12-06" data-tags="kms"><time class="termin__datum" datetime="2026-12-06"><b>6</b>Dez</time><div><h3>Kremsmünster McDaniels</h3><p>Heimspiel</p></div><span class="termin__tag">OÖ</span></li>
        <li class="termin" data-d="2026-12-07" data-tags="weg"><time class="termin__datum" datetime="2026-12-07"><b>7</b>Dez</time><div><h3>Schlierbach</h3><p>Oberösterreich</p></div><span class="termin__tag">OÖ</span></li>
      </ol>
      <p class="tour__mehr reveal">Weitere Termine bis zum Saisonende folgen. Im Entwurf übernommen vom Tour-Plakat auf Instagram.</p>
    </div>
  </section>

  <section class="feuer" aria-label="Zwischenbild">
    <picture>
      <source media="(max-width: 800px)" srcset="assets/img/feuer-800.webp">
      <img src="assets/img/feuer.webp" alt="Feuerkreis bei Nacht während eines Krampuslaufs" width="1600" height="1066" loading="lazy">
    </picture>
    <p class="feuer__satz reveal">Man hört uns,<br><em>bevor man uns sieht.</em></p>
  </section>

  <section class="haus" id="hausbesuche" aria-labelledby="haus-titel">
    <div class="wrap haus__in">
      <div class="haus__text">
        <p class="eyebrow reveal">Hausbesuche im Gebiet Kremsmünster</p>
        <h2 id="haus-titel" class="reveal">Der Krampus<br><em>kommt zu euch.</em></h2>
        <p class="reveal">Am Nikolaustag ab 15 Uhr sind wir in Kremsmünster und Umgebung unterwegs und besuchen Familien zu Hause. Ihr sagt uns vorher, was wir über die Kinder wissen sollen, und wie wild es werden darf.</p>
        <ul class="haus__liste reveal">
          <li><b>1</b>Anfrage schicken, mit Wunschzeit und Adresse</li>
          <li><b>2</b>Wir melden uns und bestätigen die Uhrzeit</li>
          <li><b>3</b>Am 6. Dezember läuten bei euch die Glocken</li>
        </ul>
      </div>
      <figure class="haus__bild reveal">
        <img src="assets/img/maske.webp" alt="Rote Krampusmaske mit Hörnern in Nahaufnahme" width="1200" height="1274" loading="lazy">
        <span class="haus__augen" aria-hidden="true"></span>
      </figure>
    </div>

    <div class="wrap" id="anfrage">
      <form class="anfrage reveal" id="anfrage-form" novalidate>
        <h3 class="anfrage__titel">Hausbesuch anfragen</h3>
        <div class="anfrage__schritt">
          <p class="anfrage__label"><span>1</span> Wunschzeit am 6. Dezember</p>
          <div class="chips" id="zeiten" role="radiogroup" aria-label="Wunschzeit">
            <button type="button" role="radio" aria-checked="false" data-zeit="15:00">15:00</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="15:30">15:30</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="16:00">16:00</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="16:30">16:30</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="17:00">17:00</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="17:30">17:30</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="18:00">18:00</button>
            <button type="button" role="radio" aria-checked="false" data-zeit="egal">Egal</button>
          </div>
        </div>
        <div class="anfrage__schritt">
          <p class="anfrage__label"><span>2</span> Wie viele Kinder?</p>
          <div class="zaehler">
            <button type="button" id="k-minus" aria-label="Ein Kind weniger">−</button>
            <output id="kinder" aria-live="polite">2</output>
            <button type="button" id="k-plus" aria-label="Ein Kind mehr">+</button>
          </div>
        </div>
        <div class="anfrage__schritt">
          <p class="anfrage__label"><span>3</span> Wie wild darf es sein?</p>
          <div class="wild">
            <input type="range" id="wild" min="1" max="3" step="1" value="2" aria-describedby="wild-text">
            <div class="wild__skala" aria-hidden="true"><span>Sanft</span><span>Mittel</span><span>Wild</span></div>
            <p class="wild__text" id="wild-text">Mittel: Glocken, Brummen und ein ernstes Wort. Danach gibt's ein Sackerl.</p>
          </div>
        </div>
        <div class="anfrage__schritt">
          <p class="anfrage__label"><span>4</span> Eure Daten</p>
          <div class="felder">
            <label><span>Name</span><input name="name" autocomplete="name" required></label>
            <label><span>Telefon</span><input name="tel" type="tel" autocomplete="tel" required></label>
            <label class="felder__breit"><span>Adresse</span><input name="adresse" autocomplete="street-address" placeholder="Straße, Hausnummer, Ort" required></label>
            <label class="felder__breit"><span>Was soll der Krampus wissen? <small>(optional)</small></span><textarea name="info" rows="3" placeholder="Namen der Kinder, Alter, kleine Sünden und große Erfolge"></textarea></label>
          </div>
        </div>
        <p class="anfrage__fehler" id="anfrage-fehler" role="alert" hidden></p>
        <button class="btn btn--glut anfrage__senden" type="submit">Anfrage schicken</button>
        <div class="anfrage__ok" id="anfrage-ok" hidden>
          <p class="anfrage__ok-titel">Anfrage ist da</p>
          <p id="anfrage-ok-text"></p>
          <p class="anfrage__ok-klein">Im Entwurf wird nichts verschickt. Auf der fertigen Seite landet die Anfrage direkt bei euch.</p>
        </div>
      </form>
    </div>
  </section>

  <section class="verein" id="verein" aria-labelledby="verein-titel">
    <div class="wrap">
      <header class="kopf reveal">
        <p class="eyebrow">Hauptsitz Kremsmünster</p>
        <h2 id="verein-titel">Wir sind <em>die Devils</em></h2>
        <p class="kopf__sub">Ein lokaler Verein aus Oberösterreich. Im Winter laufen wir, unterm Jahr halten wir zusammen.</p>
      </header>
      <div class="zahlen reveal">
        <div><b data-zahl="35">35</b><span>Mitglieder</span></div>
        <div><b data-zahl="12">12</b><span>Tour-Termine</span></div>
        <div><b data-zahl="12">12</b><span>Teams beim Kleinfeldturnier</span></div>
      </div>
      <div class="karten">
        <article class="karte reveal">
          <img src="assets/img/lauf-800.webp" alt="Krampusse in einem Umzug auf einer Straße" width="800" height="1000" loading="lazy">
          <div class="karte__in"><p class="karte__nr">Winter</p><h3>Läufe &amp; Tour</h3><p>Von November bis Dezember quer durch Oberösterreich und darüber hinaus.</p></div>
        </article>
        <article class="karte reveal">
          <img src="assets/img/g5.webp" alt="Krampusmaske aus Fell und Holz in Nahaufnahme" width="900" height="1197" loading="lazy">
          <div class="karte__in"><p class="karte__nr">Ausstellung 2025</p><h3>Masken zum Anschauen</h3><p>Unsere Masken und Gewänder aus der Nähe, ganz ohne Gänsehaut. Fast.</p></div>
        </article>
        <article class="karte reveal">
          <img src="assets/img/g6.webp" alt="Krampus mit leuchtenden Augen vor Publikum" width="900" height="600" loading="lazy">
          <div class="karte__in"><p class="karte__nr">Unterm Jahr</p><h3>Kleinfeldturnier</h3><p>Im Juni 2026 das erste Turnier auf der Hofwiese, mit 12 Teams und vielen Zuschauern.</p></div>
        </article>
      </div>
      <div class="mitmachen reveal">
        <div>
          <h3>Selbst mitlaufen?</h3>
          <p>Wir freuen uns über neue Gesichter, und über neue Masken.</p>
        </div>
        <a class="btn btn--rand" href="https://www.instagram.com/the.devils.at/" target="_blank" rel="noopener">Schreibt uns auf Instagram</a>
      </div>
    </div>
  </section>

  <section class="galerie" id="galerie" aria-labelledby="galerie-titel">
    <div class="wrap">
      <header class="kopf reveal">
        <p class="eyebrow">Galerie</p>
        <h2 id="galerie-titel">Nimm die <em>Laterne</em></h2>
        <p class="kopf__sub galerie__tipp"><span class="nur-maus">Fahr mit der Maus durchs Dunkel.</span><span class="nur-touch">Scroll langsam durchs Dunkel.</span> Tippen öffnet das Bild.</p>
      </header>
    </div>
    <div class="laterne" id="laterne">
      <div class="laterne__grid">
        <button type="button" class="laterne__bild" data-gross="assets/img/g1.webp"><img src="assets/img/g1.webp" alt="Rote Krampusmaske mit gebogenen Hörnern" width="900" height="1125" loading="lazy"></button>
        <button type="button" class="laterne__bild" data-gross="assets/img/g2.webp"><img src="assets/img/g2.webp" alt="Krampus mit langen Hörnern im Fellgewand" width="900" height="1125" loading="lazy"></button>
        <button type="button" class="laterne__bild" data-gross="assets/img/g3.webp"><img src="assets/img/g3.webp" alt="Krampus mit gefletschten Zähnen im Umzug" width="900" height="1125" loading="lazy"></button>
        <button type="button" class="laterne__bild" data-gross="assets/img/g4.webp"><img src="assets/img/g4.webp" alt="Krampus mit schwarzem Fell und hellen Hörnern" width="900" height="1350" loading="lazy"></button>
        <button type="button" class="laterne__bild" data-gross="assets/img/g7.webp"><img src="assets/img/g7.webp" alt="Krampus mit Geweih und Bart in der Menge" width="900" height="1125" loading="lazy"></button>
        <button type="button" class="laterne__bild" data-gross="assets/img/g8.webp"><img src="assets/img/g8.webp" alt="Viele Krampusse gemeinsam auf der Straße" width="900" height="1125" loading="lazy"></button>
      </div>
      <div class="laterne__dunkel" aria-hidden="true"></div>
    </div>
    <p class="wrap galerie__hinweis">Beispielbilder im Entwurf. Hier kommen eure eigenen Fotos hinein.</p>
  </section>

  <section class="social" aria-labelledby="social-titel">
    <div class="wrap social__in reveal">
      <h2 id="social-titel">Folgt den <em>Devils</em></h2>
      <p>Videos von den Läufen, Termine und alles aus der Saison.</p>
      <div class="social__knoepfe">
        <a class="btn btn--glut" href="https://www.instagram.com/the.devils.at/" target="_blank" rel="noopener">Instagram</a>
        <a class="btn btn--rand" href="https://www.tiktok.com/@the.devils.at" target="_blank" rel="noopener">TikTok</a>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <div>
      <a class="brand" href="#top" aria-label="Nach oben">
        <span class="brand__name">The Devils</span>
        <span class="brand__sub">Kremsmünster</span>
      </a>
      <p class="foot__ort">Krampus- &amp; Perchtenverein · Kremsmünster · Oberösterreich</p>
    </div>
    <p class="foot__links">
      <a href="https://www.instagram.com/the.devils.at/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.tiktok.com/@the.devils.at" target="_blank" rel="noopener">TikTok</a>
      <a href="tel:+436640000000" data-demo-tel>0664 000 00 00</a>
      <span>Impressum</span><span>Datenschutz</span>
    </p>
    <p class="foot__fine">Fotos im Entwurf: Pexels (Erdal Erdal, Bastian Riccardi, Eddson Lens, Marija Piliskic). Auf der fertigen Seite kommen eure eigenen Bilder hinein.</p>
    <a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
  </div>
</footer>

<a class="mobil-cta" id="mobil-cta" href="#anfrage">Hausbesuch anfragen</a>

<div class="licht" id="licht" hidden>
  <button type="button" class="licht__zu" id="licht-zu" aria-label="Bild schließen">×</button>
  <img id="licht-bild" src="" alt="">
</div>

</body>
</html>
