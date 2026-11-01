<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Haarliebe · Meisterfriseurin Sabrina Scharnreitner in Behamberg</title>
<meta name="description" content="Haarliebe in Behamberg: Meisterfriseurin Sabrina Scharnreitner für Blond, Balayage und Blowouts. Kleiner, feiner Salon zum Wohlfühlen, Termine online buchen.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fbf6f3">
<link rel="preload" href="assets/fonts/gilda.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/quicksand.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/allura.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-700.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=1">
<link rel="stylesheet" href="assets/buchung.css?v=1">
<script src="assets/early.js?v=1"></script>
<script src="assets/app.js?v=1" defer></script>
<script type="module" src="assets/termin.js?v=1"></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "Haarliebe · Meisterfriseurin Sabrina Scharnreitner",
  "slogan": "Wohlfühlen. Verwöhnen lassen. Schön sein.",
  "founder": {"@type": "Person", "name": "Sabrina Scharnreitner", "jobTitle": "Friseurmeisterin"},
  "address": {"@type": "PostalAddress", "streetAddress": "Schachnersiedlung 154", "postalCode": "4441", "addressLocality": "Behamberg", "addressCountry": "AT"},
  "knowsAbout": ["Blond", "Balayage", "Blowouts", "Haarschnitt", "Haarfarbe"],
  "sameAs": ["https://www.instagram.com/haarliebe.sabrina/"]
}
</script>
</head>
<body>

<a class="skip" href="#spezial">Direkt zu den Leistungen</a>

<svg class="defs" aria-hidden="true" focusable="false">
  <defs>
    <filter id="aquarell" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="2.2"/>
    </filter>
    <radialGradient id="rosewash" cx="45%" cy="45%" r="60%">
      <stop offset="0" stop-color="#efc6b9"/>
      <stop offset=".55" stop-color="#f3d7cd" stop-opacity=".9"/>
      <stop offset="1" stop-color="#f7e6df" stop-opacity="0"/>
    </radialGradient>
  </defs>
</svg>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Haarliebe, nach oben">
    <span class="brand__name">Haarliebe</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#spezial">Leistungen</a>
    <a href="#blond">Blond-Finder</a>
    <a href="#ueber">Über mich</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
  <a class="btn btn--acc nav__cta" href="#termin" data-book>Termin buchen</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#spezial">Leistungen</a>
    <a href="#blond">Blond-Finder</a>
    <a href="#ueber">Über mich</a>
    <a href="#termin">Termine</a>
    <a href="#kontakt">Kontakt</a>
  </nav>
  <a class="btn btn--acc" href="#termin" data-book>Termin buchen</a>
  <p class="menu__tel"><a href="tel:+436640000000" data-demo-tel>0664 / 000 00 00</a></p>
</div>

<main id="top">

  <!-- START -->
  <section class="hero">
    <div class="hero__txt">
      <div class="mark" aria-hidden="true">
        <svg class="mark__wash" viewBox="0 0 400 240" preserveAspectRatio="none"><ellipse cx="200" cy="122" rx="168" ry="92" fill="url(#rosewash)" filter="url(#aquarell)"/></svg>
        <span class="mark__name">Haarliebe</span>
        <span class="mark__sub">Meisterfriseurin</span>
        <span class="mark__who">Sabrina Scharnreitner</span>
      </div>
      <h1 class="hero__title">Wohlfühlen. <span>Verwöhnen lassen.</span> <em>Schön sein.</em></h1>
      <p class="hero__lead">Blond, Balayage und Blowouts mit Hingabe und Herzlichkeit. In meinem kleinen, feinen Salon in Behamberg.</p>
      <div class="hero__btns">
        <a class="btn btn--acc" href="#termin" data-book>Termin buchen</a>
        <a class="btn btn--line" href="#spezial">Leistungen ansehen</a>
      </div>
      <p class="hero__next"><span class="dot" aria-hidden="true"></span>Nächster freier Termin: <b data-next="schnitt">wird geladen …</b></p>
    </div>
    <div class="hero__media">
      <div class="arch arch--hero" data-par>
        <picture>
          <source media="(max-width: 800px)" srcset="assets/img/hero-700.webp">
          <img src="assets/img/hero.webp" alt="Lange, blonde Wellen von hinten, eine Hand fährt durchs Haar" width="1100" height="1648" fetchpriority="high">
        </picture>
      </div>
      <p class="hero__badge"><span>Hair</span><i>•</i><span>Beauty</span><i>•</i><span>Good Energy</span></p>
    </div>
  </section>

  <!-- LAUFBAND -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker__row">
      <span>Hair</span><b>✿</b><span>Beauty</span><b>✿</b><span class="sc">good energy</span><b>✿</b><span>Blonde</span><b>✿</b><span>Balayage</span><b>✿</b><span class="sc">Blowouts</span><b>✿</b>
      <span>Hair</span><b>✿</b><span>Beauty</span><b>✿</b><span class="sc">good energy</span><b>✿</b><span>Blonde</span><b>✿</b><span>Balayage</span><b>✿</b><span class="sc">Blowouts</span><b>✿</b>
    </div>
  </div>

  <!-- SPEZIALGEBIETE -->
  <section class="sec" id="spezial">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow">Meine Leidenschaft</p>
        <h2>Blonde. Balayage. <span class="sc">Blowouts.</span></h2>
        <p class="head__lead">Drei Dinge, für die meine Kundinnen nach Behamberg kommen. Und natürlich alles, was sonst zu schönem Haar gehört.</p>
      </div>

      <div class="fans" id="fans">
        <article class="fan is-open reveal" tabindex="0">
          <img src="assets/img/blond-700.webp" srcset="assets/img/blond-700.webp 700w, assets/img/blond.webp 1100w" sizes="(max-width: 800px) 92vw, 46vw" alt="Langes, glattes Blond wird mit einem Holzkamm gekämmt" width="700" height="875" loading="lazy">
          <div class="fan__in">
            <span class="fan__no">01</span>
            <h3>Blonde</h3>
            <p>Von kühlem Champagner bis warmem Honig. Blond, das zu deinem Hautton passt und gesund glänzt, statt strohig zu wirken.</p>
            <button class="btn btn--light" type="button" data-book data-svc="blond">Blond-Termin wählen</button>
          </div>
        </article>
        <article class="fan reveal" tabindex="0">
          <img src="assets/img/balayage-700.webp" srcset="assets/img/balayage-700.webp 700w, assets/img/balayage.webp 1100w" sizes="(max-width: 800px) 92vw, 46vw" alt="Farbe wird mit dem Pinsel auf blonde Strähnen aufgetragen" width="700" height="1050" loading="lazy">
          <div class="fan__in">
            <span class="fan__no">02</span>
            <h3>Balayage</h3>
            <p>Von Hand gemalte Übergänge, die weich herauswachsen. Sieht nach Sonne aus, nicht nach Ansatz, und hält viele Wochen.</p>
            <button class="btn btn--light" type="button" data-book data-svc="balayage">Balayage-Termin wählen</button>
          </div>
        </article>
        <article class="fan reveal" tabindex="0">
          <img src="assets/img/blowout-700.webp" srcset="assets/img/blowout-700.webp 700w, assets/img/blowout.webp 1100w" sizes="(max-width: 800px) 92vw, 46vw" alt="Lange blonde Haare werden geföhnt" width="700" height="1050" loading="lazy">
          <div class="fan__in">
            <span class="fan__no">03</span>
            <h3>Blowouts</h3>
            <p>Volumen, Schwung und Glanz, der den ganzen Tag hält. Für die Hochzeit, den Ball oder einfach, weil du es dir wert bist.</p>
            <button class="btn btn--light" type="button" data-book data-svc="blowout">Blowout-Termin wählen</button>
          </div>
        </article>
      </div>

      <ul class="more reveal" aria-label="Weitere Leistungen">
        <li>Schnitt &amp; Styling</li><li>Farbe &amp; Glossing</li><li>Pflege-Treatments</li><li>Hochsteckfrisuren</li><li>Herrenschnitt</li>
      </ul>
    </div>
  </section>

  <!-- BLOND-FINDER -->
  <section class="sec sec--cream" id="blond">
    <div class="wrap finder">
      <div class="finder__txt">
        <div class="head head--left reveal">
          <p class="eyebrow">Blond-Finder</p>
          <h2>Welches Blond <span class="sc">passt zu dir?</span></h2>
        </div>
        <p class="reveal">Tippe einen Ton an und sieh, wie er im Licht fällt. Beim Termin schauen wir gemeinsam, was zu deinem Hautton und deinem Alltag passt.</p>
        <div class="tones reveal" role="radiogroup" aria-label="Blondton wählen">
          <button type="button" role="radio" aria-checked="true" data-tone="champagner" style="--t1:#f4e6cf;--t2:#d9c19a">Champagner</button>
          <button type="button" role="radio" aria-checked="false" data-tone="perlmutt" style="--t1:#f2ece4;--t2:#c9bfb3">Perlmutt</button>
          <button type="button" role="radio" aria-checked="false" data-tone="honig" style="--t1:#e9c48d;--t2:#b47f3f">Honig</button>
          <button type="button" role="radio" aria-checked="false" data-tone="rosegold" style="--t1:#efc7b5;--t2:#b97c68">Rosé-Gold</button>
          <button type="button" role="radio" aria-checked="false" data-tone="karamell" style="--t1:#d8a66f;--t2:#7d4f2c">Karamell</button>
        </div>
        <div class="tone-info reveal" aria-live="polite">
          <h3 id="tone-name">Champagner</h3>
          <p id="tone-txt">Hell, weich und edel. Ein leicht warmes Blond, das bei fast jedem Hautton frisch wirkt.</p>
          <button class="btn btn--acc" type="button" data-book data-svc="blond">Diesen Ton besprechen</button>
        </div>
      </div>
      <div class="strands reveal" aria-hidden="true">
        <svg viewBox="0 0 420 520" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#5a4235" class="st-root"/>
              <stop offset=".28" class="st-mid" stop-color="#d9c19a"/>
              <stop offset="1" class="st-end" stop-color="#f4e6cf"/>
            </linearGradient>
            <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#fff" stop-opacity="0"/>
              <stop offset=".5" stop-color="#fff" stop-opacity=".55"/>
              <stop offset="1" stop-color="#fff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g class="strands__hair" fill="none" stroke="url(#hair)" stroke-linecap="round">
            <path d="M-20 -20 C -25 120, 60 200, 20 300 S -56 450, -8 560" stroke-width="33" stroke-opacity="0.83"/>
            <path d="M9 -20 C 14 120, 77 200, 43 300 S -6 450, 43 560" stroke-width="28" stroke-opacity="0.75"/>
            <path d="M38 -20 C 42 120, 110 200, 74 300 S 6 450, 72 560" stroke-width="27" stroke-opacity="0.81"/>
            <path d="M66 -20 C 52 120, 129 200, 98 300 S 56 450, 105 560" stroke-width="31" stroke-opacity="0.96"/>
            <path d="M95 -20 C 81 120, 162 200, 128 300 S 61 450, 110 560" stroke-width="26" stroke-opacity="0.96"/>
            <path d="M124 -20 C 117 120, 179 200, 151 300 S 111 450, 153 560" stroke-width="35" stroke-opacity="0.82"/>
            <path d="M152 -20 C 154 120, 218 200, 185 300 S 118 450, 170 560" stroke-width="36" stroke-opacity="0.92"/>
            <path d="M181 -20 C 186 120, 250 200, 216 300 S 141 450, 220 560" stroke-width="41" stroke-opacity="0.82"/>
            <path d="M210 -20 C 199 120, 292 200, 251 300 S 176 450, 233 560" stroke-width="35" stroke-opacity="0.89"/>
            <path d="M239 -20 C 236 120, 317 200, 278 300 S 204 450, 256 560" stroke-width="39" stroke-opacity="0.9"/>
            <path d="M268 -20 C 240 120, 322 200, 295 300 S 228 450, 292 560" stroke-width="35" stroke-opacity="0.81"/>
            <path d="M296 -20 C 296 120, 367 200, 332 300 S 260 450, 327 560" stroke-width="34" stroke-opacity="0.88"/>
            <path d="M325 -20 C 307 120, 415 200, 370 300 S 305 450, 349 560" stroke-width="32" stroke-opacity="0.77"/>
            <path d="M354 -20 C 351 120, 441 200, 397 300 S 324 450, 384 560" stroke-width="34" stroke-opacity="0.8"/>
            <path d="M382 -20 C 372 120, 438 200, 410 300 S 368 450, 394 560" stroke-width="43" stroke-opacity="0.8"/>
            <path d="M411 -20 C 418 120, 500 200, 456 300 S 398 450, 428 560" stroke-width="33" stroke-opacity="0.82"/>
            <path d="M440 -20 C 421 120, 508 200, 474 300 S 414 450, 450 560" stroke-width="29" stroke-opacity="0.83"/>
          </g>
          <rect class="strands__shine" x="-200" y="0" width="160" height="520" fill="url(#shine)"/>
        </svg>
      </div>
    </div>
  </section>

  <!-- ÜBER MICH -->
  <section class="sec" id="ueber">
    <div class="wrap about">
      <div class="about__img reveal">
        <div class="arch" data-par>
          <img src="assets/img/salon-700.webp" srcset="assets/img/salon-700.webp 700w, assets/img/salon.webp 1100w" sizes="(max-width: 800px) 92vw, 40vw" alt="Heller Raum mit beigem Sessel, Vorhang und Tisch" width="700" height="925" loading="lazy">
        </div>
        <svg class="about__wash" viewBox="0 0 400 240" aria-hidden="true"><ellipse cx="200" cy="120" rx="170" ry="90" fill="url(#rosewash)" filter="url(#aquarell)"/></svg>
      </div>
      <div class="about__txt">
        <div class="head head--left reveal">
          <p class="eyebrow">Über mich</p>
          <h2>Zeit, <span class="sc">nur für dich.</span></h2>
        </div>
        <blockquote class="reveal">„Ich freue mich darauf, dich in meinem kleinen und feinen Friseursalon mit Hingabe, Herzlichkeit und in höchster Qualität verschönern zu dürfen.“</blockquote>
        <p class="reveal">Mein Salon soll für dich ein Rückzugsort zum Entschleunigen sein. Jeder Mensch ist einzigartig, genau wie dein Look. Darum nehme ich mir Zeit, dich und deine Wünsche kennenzulernen.</p>
        <ol class="steps">
          <li class="reveal"><b>Zuhören</b><span>Wir besprechen in Ruhe, was du dir wünschst und was zu dir passt.</span></li>
          <li class="reveal"><b>Meisterhandwerk</b><span>Als Friseurmeisterin arbeite ich mit Sorgfalt und hochwertigen Produkten.</span></li>
          <li class="reveal"><b>Durchatmen</b><span>Nur du und ich. Kein Trubel, kein Fließband, einfach Zeit für dich.</span></li>
        </ol>
        <p class="sign reveal" aria-label="Sabrina">Sabrina</p>
      </div>
    </div>
  </section>

  <!-- TERMIN (dunkel) -->
  <section class="sec sec--dark" id="termin">
    <div class="termin__bg" aria-hidden="true"><img src="assets/img/rose-700.webp" alt="" width="700" height="1120" loading="lazy"></div>
    <div class="wrap termin">
      <div class="termin__txt">
        <p class="eyebrow eyebrow--light reveal">Termine</p>
        <h2 class="reveal">Meistens <span class="sc">fully booked.</span></h2>
        <p class="reveal">Mein Kalender ist oft Wochen im Voraus voll. Hier siehst du sofort, wann der nächste Termin frei ist, und buchst ihn mit ein paar Tipps. Wird früher etwas frei, meldet sich die Warteliste bei dir.</p>
        <p class="count reveal"><b data-ahead="balayage">–</b><span>Tage bis zum nächsten freien Balayage-Termin</span></p>
      </div>
      <div class="book reveal">
        <p class="book__kick">Online buchen · rund um die Uhr</p>
        <h3 class="book__t">Nächste freie Termine</h3>
        <ul class="book__rows">
          <li><button type="button" data-book data-svc="blond"><span class="book__n">Blond-Refresh</span><span class="book__f" data-next="blond">…</span><span class="book__go" aria-hidden="true">→</span></button></li>
          <li><button type="button" data-book data-svc="balayage"><span class="book__n">Balayage</span><span class="book__f" data-next="balayage">…</span><span class="book__go" aria-hidden="true">→</span></button></li>
          <li><button type="button" data-book data-svc="blowout"><span class="book__n">Blowout</span><span class="book__f" data-next="blowout">…</span><span class="book__go" aria-hidden="true">→</span></button></li>
          <li><button type="button" data-book data-svc="schnitt"><span class="book__n">Schneiden &amp; Föhnen</span><span class="book__f" data-next="schnitt">…</span><span class="book__go" aria-hidden="true">→</span></button></li>
        </ul>
        <button class="btn btn--acc btn--full" type="button" data-book>Termin buchen</button>
        <p class="book__note">Mit Warteliste, Erinnerung am Vortag und Eintrag im Handy-Kalender.</p>
      </div>
    </div>
  </section>

  <!-- KONTAKT -->
  <section class="sec" id="kontakt">
    <div class="wrap kontakt">
      <div class="reveal">
        <p class="eyebrow">Kontakt</p>
        <h2>Schachnersiedlung 154 <span class="sc">4441 Behamberg</span></h2>
        <p class="kontakt__txt">Termine online oder per Telefon. Ich freue mich auf dich!</p>
        <div class="kontakt__btns">
          <a class="btn btn--acc" href="https://www.google.com/maps/search/?api=1&amp;query=Schachnersiedlung+154+4441+Behamberg" target="_blank" rel="noopener">Route planen</a>
          <a class="btn btn--line" href="tel:+436640000000" data-demo-tel>0664 / 000 00 00</a>
        </div>
      </div>
      <a class="insta reveal" href="https://www.instagram.com/haarliebe.sabrina/" target="_blank" rel="noopener">
        <img src="assets/img/farbe-700.webp" alt="Farbschalen, Pinsel und eine Haarsträhne auf hellem Marmor" width="700" height="1050" loading="lazy">
        <span class="insta__in"><small>Neue Looks auf Instagram</small><b>@haarliebe.sabrina</b></span>
      </a>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <a class="brand brand--foot" href="#top" aria-label="Nach oben"><span class="brand__name">Haarliebe</span></a>
    <p class="foot__sub">Meisterfriseurin Sabrina Scharnreitner · Behamberg</p>
    <p class="foot__links"><a href="https://www.instagram.com/haarliebe.sabrina/" target="_blank" rel="noopener">Instagram</a><a href="tel:+436640000000" data-demo-tel>Telefon</a><span>Impressum</span><span>Datenschutz</span></p>
    <p class="foot__fine">Ohne Cookie-Banner: Diese Seite lädt keine fremden Dienste. Fotos im Entwurf: Pexels (cottonbro studio, Nataliya Vaitkevich, Max Vakhtbovych, Marek Piwnicki). Auf der fertigen Seite kommen Ihre eigenen Bilder hinein.</p>
    <a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo-dunkel.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
  </div>
</footer>

</body>
</html>
