<?php require __DIR__ . "/_gate.php";

// Lauftermine 2026/27 vom Vereinsplakat (Instagram, Stand 1.11.2026). Uhrzeiten sind dort nicht angegeben.
$termine = [
    ['2026-11-13', 'Spielberg', 'Steiermark', ''],
    ['2026-11-14', 'Gaal', 'Steiermark', ''],
    ['2026-11-14', 'Blindenmarkt', 'Niederösterreich', ''],
    ['2026-11-21', 'Mank', 'Niederösterreich', ''],
    ['2026-11-28', 'Leiben', 'Niederösterreich', ''],
    ['2026-11-28', 'Hollabrunn', 'Niederösterreich', ''],
    ['2026-12-05', 'Herrieder Straße', 'Showlauf', 'show'],
    ['2026-12-05', 'Hainfeld', 'Niederösterreich', ''],
    ['2026-12-07', 'Michelbach', 'Showlauf', 'show'],
    ['2026-12-12', '9. Melker Au-Nacht', 'Heimlauf · Wachauarena Melk', 'heim'],
    ['2026-12-30', 'Wieselburg', 'Rauhnachtslauf', 'rauh'],
    ['2027-01-05', 'Münichreith', 'Rauhnachtslauf', 'rauh'],
];
$tage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
$monate = ['', 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
$h = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Melker Au-Teufel’n · Krampusverein Melk seit 2008 · 9. Melker Au-Nacht</title>
<meta name="description" content="Melker Au-Teufel’n, Krampusverein Melk seit 2008: 9. Melker Au-Nacht am 12. Dezember 2026 in der Wachauarena Melk mit über 400 Krampussen, alle Lauftermine 2026/27, Showlauf anfragen und Mitglied werden.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0c0806">
<link rel="preload" href="assets/fonts/cinzel-900.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/bigshoulders-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/alegreya-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/feuer-800.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/feuer.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=1">
<script>document.documentElement.classList.add("js");</script>
<script src="assets/app.js?v=1" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "#verein",
      "name": "Melker Au-Teufel’n",
      "alternateName": "Krampusverein Melk",
      "foundingDate": "2008",
      "description": "Brauchtumsverein aus Melk: Krampus- und Nikolausbrauchtum mit Holzmasken, Veranstalter der Melker Au-Nacht.",
      "address": {"@type": "PostalAddress", "addressLocality": "Melk", "addressRegion": "Niederösterreich", "addressCountry": "AT"},
      "sameAs": ["https://www.instagram.com/melker_auteufeln/", "https://www.facebook.com/melker.auteufeln/"]
    },
    {
      "@type": "Event",
      "name": "9. Melker Au-Nacht",
      "description": "Heimlauf der Melker Au-Teufel’n mit über 400 Krampussen, danach Krampus-Disco.",
      "startDate": "2026-12-12T18:00:00+01:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {"@type": "Place", "name": "Wachauarena Melk", "address": {"@type": "PostalAddress", "addressLocality": "Melk", "addressCountry": "AT"}},
      "organizer": {"@id": "#verein"}
    }
  ]
}
</script>
</head>
<body>

<a class="skip" href="#termine">Direkt zu den Laufterminen</a>

<header class="nav" id="nav">
  <a class="marke" href="#top" aria-label="Melker Au-Teufel’n, nach oben">
    <svg class="marke__zeichen" viewBox="0 0 64 64" aria-hidden="true"><use href="#emblem"/></svg>
    <span class="marke__text"><b>Melker Au-Teufel’n</b><small>Krampusverein Melk</small></span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#aunacht">Au-Nacht</a>
    <a href="#termine">Lauftermine</a>
    <a href="#verein">Verein</a>
    <a href="#bilder">Bilder</a>
  </nav>
  <a class="btn btn--feuer nav__cta" href="#mitmachen">Showlauf anfragen</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#aunacht">9. Melker Au-Nacht</a>
    <a href="#termine">Lauftermine 26/27</a>
    <a href="#verein">Verein</a>
    <a href="#bilder">Bilder</a>
    <a href="#mitmachen">Mitmachen</a>
    <a class="btn btn--feuer" href="#mitmachen">Showlauf anfragen</a>
  </nav>
</div>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="emblem" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#120b08" stroke="currentColor" stroke-width="2"/>
      <circle cx="32" cy="32" r="25.5" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 2.6" opacity=".7"/>
      <path d="M21 30c-6-3-9-10-7-18 2 6 6 9 11 10zM43 30c6-3 9-10 7-18-2 6-6 9-11 10z" fill="currentColor"/>
      <path d="M22 27c3-4 17-4 20 0 2 4 1 12-3 17l-4 6h-6l-4-6c-4-5-5-13-3-17z" fill="currentColor"/>
      <path d="M25 33l6 2-1 2-5-1zM39 33l-6 2 1 2 5-1z" fill="#120b08"/>
      <path d="M28 44l2 3 2-2 2 2 2-3" fill="none" stroke="#120b08" stroke-width="1.4" stroke-linejoin="round"/>
    </symbol>
  </defs>
</svg>

<main id="top">

  <!-- Startbild: das Plakat zur Au-Nacht -->
  <section class="hero" aria-labelledby="hero-titel">
    <picture class="hero__bild">
      <source media="(max-width: 800px)" srcset="assets/img/feuer-800.webp">
      <img src="assets/img/feuer.webp" alt="" width="1920" height="1279" fetchpriority="high">
    </picture>
    <canvas class="hero__feuer" id="feuer" aria-hidden="true"></canvas>
    <div class="hero__in">
      <p class="hero__kicker"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#emblem"/></svg>Melker Au-Teufel’n präsentieren</p>
      <h1 id="hero-titel"><span class="hero__nr">9.</span> Melker <span class="hero__gross">Au-Nacht</span></h1>
      <p class="hero__band"><span>Sa · 12. Dezember 2026</span><span>Wachauarena Melk</span></p>
      <ul class="hero__fakten" aria-label="Eckdaten">
        <li><b>400+</b> Krampusse</li>
        <li><b>18:00</b> Beginn</li>
        <li><b>20:30</b> Krampus-Disco</li>
      </ul>
      <div class="uhr" id="uhr" role="timer" aria-label="Countdown bis zur Au-Nacht">
        <div class="uhr__brett"><b id="u-t">41</b><small>Tage</small></div>
        <div class="uhr__brett"><b id="u-s">00</b><small>Std</small></div>
        <div class="uhr__brett"><b id="u-m">00</b><small>Min</small></div>
        <div class="uhr__brett"><b id="u-x">00</b><small>Sek</small></div>
      </div>
      <div class="hero__knoepfe">
        <a class="btn btn--feuer" href="#aunacht">Alles zur Au-Nacht</a>
        <a class="btn btn--holz" href="#termine">Lauftermine 26/27</a>
      </div>
    </div>
    <a class="hero__runter" href="#aunacht" aria-label="Weiter zur Au-Nacht"><span></span></a>
  </section>

  <!-- Die Au-Nacht -->
  <section class="block block--holz" id="aunacht" aria-labelledby="an-titel">
    <div class="wrap an">
      <figure class="rahmen an__bild">
        <img src="assets/img/teufel.webp" alt="Krampus mit roter Holzmaske und langen Hörnern bei einem Krampuslauf" width="900" height="1200" loading="lazy">
        <figcaption>Heimlauf seit 2014</figcaption>
      </figure>
      <div class="an__text">
        <p class="eyebrow">Unser Heimlauf</p>
        <h2 id="an-titel">Die Nacht, in der die <em>Au</em> brennt</h2>
        <p class="lead">Einmal im Jahr holen wir Krampusgruppen aus ganz Österreich nach Melk. Über 400 Krampusse ziehen durch die Wachauarena, mit Fell, Glocken, Feuer und Holzmasken. Danach wird gefeiert.</p>
        <ol class="ablauf" aria-label="Ablauf des Abends">
          <li><time datetime="2026-12-12T18:00">18:00</time><div><b>Krampuslauf</b><span>Gastgruppen aus ganz Österreich und die <span class="nw">Au-Teufel’n</span> in der Wachauarena</span></div></li>
          <li><time datetime="2026-12-12T20:30">20:30</time><div><b>Krampus-Disco</b><span>Musik, Getränke und Ausklang bis in die Nacht</span></div></li>
        </ol>
        <div class="an__knoepfe">
          <button class="btn btn--feuer" type="button" id="kalender">In den Kalender</button>
          <a class="btn btn--rand" href="https://www.google.com/maps/search/?api=1&amp;query=Wachauarena+Melk" target="_blank" rel="noopener">Anfahrt Wachauarena</a>
        </div>
        <p class="rekord"><b>Rekord:</b> über 3.000 Besucher bei einer Au-Nacht mitten in Melk.</p>
      </div>
    </div>
    <div class="wrap tipps">
      <h3>Gut zu wissen für Besucher</h3>
      <ul>
        <li><b>Hinter der Absperrung bleiben.</b> Die Krampusse sehen durch die Holzmasken wenig. Abstand schützt euch und sie.</li>
        <li><b>Warm anziehen.</b> Der Lauf ist draußen und der Dezemberabend in der Au ist lang.</li>
        <li><b>Kinder vorne, aber an der Hand.</b> Wer sich fürchtet, darf jederzeit nach hinten. Das ist ganz normal.</li>
      </ul>
    </div>
  </section>

  <!-- Lauftermine -->
  <section class="block" id="termine" aria-labelledby="t-titel">
    <div class="wrap">
      <div class="kopf">
        <p class="eyebrow">Saison 2026/27</p>
        <h2 id="t-titel">Unsere <em>Lauftermine</em></h2>
        <p class="kopf__sub">Hier seht ihr uns. Die Uhrzeiten geben die Veranstalter bekannt, wir tragen sie nach, sobald sie fix sind.</p>
      </div>
      <div class="filter" role="group" aria-label="Termine filtern">
        <button type="button" class="filter__k" aria-pressed="true" data-f="alle">Alle</button>
        <button type="button" class="filter__k" aria-pressed="false" data-f="show">Showläufe</button>
        <button type="button" class="filter__k" aria-pressed="false" data-f="rauh">Rauhnacht</button>
      </div>
      <ol class="tafel" id="tafel">
<?php foreach ($termine as [$d, $ort, $info, $art]):
    $t = new DateTimeImmutable($d);
    ?>
        <li class="zeile<?= $art ? ' zeile--' . $art : '' ?>" data-d="<?= $d ?>" data-art="<?= $art ?>">
          <time class="zeile__datum" datetime="<?= $d ?>"><span><?= $tage[(int) $t->format('w')] ?></span><b><?= $t->format('j') ?>.</b><span><?= $monate[(int) $t->format('n')] ?><?= $t->format('Y') === '2027' ? ' 27' : '' ?></span></time>
          <div class="zeile__ort"><b><?= $h($ort) ?></b><span><?= $h($info) ?></span></div>
          <span class="zeile__marke" aria-hidden="true"></span>
        </li>
<?php endforeach; ?>
      </ol>
      <p class="tafel__fuss">Ihr wollt uns auch bei euch haben? <a href="#mitmachen">Showlauf anfragen</a></p>
    </div>
  </section>

  <!-- Verein -->
  <section class="block block--holz" id="verein" aria-labelledby="v-titel">
    <div class="wrap">
      <div class="kopf">
        <p class="eyebrow">Aus Tradition, für die Tradition</p>
        <h2 id="v-titel">Krampusverein <em>Melk</em></h2>
        <p class="kopf__sub">Vier junge Melker haben 2008 beschlossen, dass der Krampus in Melk nicht einschlafen darf. Heute sind wir eine gemischte Gruppe mit echten Holzmasken und eigenem Nachwuchs.</p>
      </div>
      <ul class="zahlen">
        <li><b data-zahl="2008">2008</b><span>gegründet</span></li>
        <li><b data-zahl="60">60</b><span>Mitglieder</span></li>
        <li><b data-zahl="40">40</b><span>Holzmasken</span></li>
        <li><b data-zahl="400" data-plus>400+</b><span>Krampusse bei der <span class="nw">Au-Nacht</span></span></li>
      </ul>
      <ol class="chronik">
        <li><span>2008</span><div><b>Gründung</b><p>Hannes Salzer und Dominik Brandstetter gründen mit Freunden den Krampusverein Melk. Die ersten Holzmasken schnitzt Klaus Kupfer aus Windischgarsten.</p></div></li>
        <li><span>2014</span><div><b>1. Melker Au-Nacht</b><p>Der Vorstand rund um Benjamin Steyrer holt den großen Heimlauf nach Melk, mit Gastgruppen aus ganz Österreich.</p></div></li>
        <li><span>2015</span><div><b>Kinderkrampusse</b><p>Unsere Kindergruppe startet und ist bis heute fest im Vereinsleben dabei.</p></div></li>
        <li><span>2023</span><div><b>Neuer Schwung</b><p>Obmann Bernhard Wieser stellt den Vorstand neu auf, viele neue Mitglieder kommen dazu.</p></div></li>
        <li><span>Heute</span><div><b>Melk und weit darüber hinaus</b><p>Showläufe in Niederösterreich und der Steiermark, Faschingsumzug und Melker Advent. Jeder darf Maske und Fell nach eigenem Geschmack wählen, eigene Nachwuchs-Schnitzer haben wir auch.</p></div></li>
      </ol>
    </div>
  </section>

  <!-- Bilder -->
  <section class="block" id="bilder" aria-labelledby="b-titel">
    <div class="wrap">
      <div class="kopf">
        <p class="eyebrow">Masken, Fell und Feuer</p>
        <h2 id="b-titel">Aus der <em>Au</em></h2>
      </div>
      <div class="galerie" id="galerie">
        <button type="button" class="galerie__b galerie__b--hoch" data-i="0"><img src="assets/img/g1.webp" alt="Krampus mit hellem Fell und leuchtend grünen Augen" width="900" height="1350" loading="lazy"></button>
        <button type="button" class="galerie__b" data-i="1"><img src="assets/img/g4.webp" alt="Feuerkorb mit hohen Flammen in der Nacht" width="900" height="600" loading="lazy"></button>
        <button type="button" class="galerie__b galerie__b--hoch" data-i="2"><img src="assets/img/g2.webp" alt="Krampusmaske mit Hörnern und gefletschten Zähnen" width="900" height="1359" loading="lazy"></button>
        <button type="button" class="galerie__b" data-i="3"><img src="assets/img/g7.webp" alt="Funken fliegen aus einem Lagerfeuer" width="900" height="900" loading="lazy"></button>
        <button type="button" class="galerie__b galerie__b--hoch" data-i="4"><img src="assets/img/g3.webp" alt="Krampus mit Hut, Bart und Stab beim Umzug" width="900" height="1125" loading="lazy"></button>
        <button type="button" class="galerie__b galerie__b--hoch" data-i="5"><img src="assets/img/g5.webp" alt="Krampus mit weißer Maske und langem Haar" width="900" height="1350" loading="lazy"></button>
        <button type="button" class="galerie__b galerie__b--hoch" data-i="6"><img src="assets/img/g6.webp" alt="Krampusse mit grauem Fell ziehen durch die Straße" width="900" height="1125" loading="lazy"></button>
      </div>
      <p class="galerie__hinweis">Platzhalter-Fotos (Pexels). Hier kommen eure eigenen Bilder hin.</p>
    </div>
  </section>

  <!-- Mitmachen: Showlauf anfragen oder Mitglied werden -->
  <section class="block block--holz" id="mitmachen" aria-labelledby="m-titel">
    <div class="wrap mit">
      <div class="mit__text">
        <p class="eyebrow">Mitmachen</p>
        <h2 id="m-titel">Holt die <em>Teufel</em> zu euch</h2>
        <p class="lead">Adventmarkt, Gemeindefest oder eigener Krampuslauf: Wir kommen mit einer Gruppe und zeigen eine Show, über die man noch lange redet. Oder ihr wollt selbst Teil der <span class="nw">Au-Teufel’n</span> werden.</p>
        <ul class="kontakt">
          <li><a href="tel:+436640000000"><span>Telefon</span><b>0664 000 00 00</b></a></li>
          <li><a href="https://www.instagram.com/melker_auteufeln/" target="_blank" rel="noopener"><span>Instagram</span><b>@melker_auteufeln</b></a></li>
          <li><a href="https://www.facebook.com/melker.auteufeln/" target="_blank" rel="noopener"><span>Facebook</span><b>Melker Au-Teufel’n</b></a></li>
        </ul>
      </div>
      <div class="formkarte">
        <div class="reiter" role="tablist" aria-label="Anfrage wählen">
          <button type="button" role="tab" id="tab-show" aria-selected="true" aria-controls="form-show">Showlauf anfragen</button>
          <button type="button" role="tab" id="tab-mit" aria-selected="false" aria-controls="form-mit" tabindex="-1">Mitglied werden</button>
        </div>

        <form class="form" id="form-show" role="tabpanel" aria-labelledby="tab-show" novalidate>
          <div class="feld"><label for="s-name">Name</label><input id="s-name" name="name" autocomplete="name" required></div>
          <div class="feld"><label for="s-ort">Ort der Veranstaltung</label><input id="s-ort" name="ort" required></div>
          <div class="feld feld--halb"><label for="s-datum">Wunschdatum</label><input id="s-datum" name="datum" type="date" min="2026-11-01" max="2027-01-10" required></div>
          <div class="feld feld--halb"><label for="s-art">Art</label>
            <select id="s-art" name="art"><option>Showlauf</option><option>Adventmarkt</option><option>Krampuslauf (Gastgruppe)</option><option>Firmen- oder Vereinsfeier</option></select></div>
          <div class="feld">
            <label for="s-anzahl">Wie viele Krampusse? <output id="s-anzahl-out" for="s-anzahl">15</output></label>
            <input id="s-anzahl" name="anzahl" type="range" min="5" max="40" step="5" value="15">
            <div class="regler__skala" aria-hidden="true"><span>5</span><span>kleine Gruppe</span><span>ganze Horde</span><span>40</span></div>
          </div>
          <div class="feld"><label for="s-tel">Telefon oder E-Mail</label><input id="s-tel" name="kontakt" autocomplete="tel" required></div>
          <p class="form__fehler" id="show-fehler" role="alert" hidden></p>
          <button class="btn btn--feuer" type="submit">Anfrage senden</button>
        </form>

        <form class="form" id="form-mit" role="tabpanel" aria-labelledby="tab-mit" novalidate hidden>
          <div class="feld"><label for="m-name">Name</label><input id="m-name" name="name" autocomplete="name" required></div>
          <div class="feld feld--halb"><label for="m-alter">Alter</label><input id="m-alter" name="alter" type="number" min="6" max="99" inputmode="numeric" required></div>
          <div class="feld feld--halb"><label for="m-ort">Wohnort</label><input id="m-ort" name="ort" autocomplete="address-level2"></div>
          <fieldset class="feld wahl">
            <legend>Ich möchte</legend>
            <label><input type="radio" name="rolle" value="Krampus mit eigener Maske" checked><span>mitlaufen, Maske habe ich</span></label>
            <label><input type="radio" name="rolle" value="Krampus ohne Maske"><span>mitlaufen, Maske fehlt noch</span></label>
            <label><input type="radio" name="rolle" value="Kinderkrampus"><span>bei den Kinderkrampussen</span></label>
            <label><input type="radio" name="rolle" value="Helfer"><span>helfen, ohne Maske</span></label>
          </fieldset>
          <div class="feld"><label for="m-tel">Telefon oder E-Mail</label><input id="m-tel" name="kontakt" autocomplete="tel" required></div>
          <p class="form__fehler" id="mit-fehler" role="alert" hidden></p>
          <button class="btn btn--feuer" type="submit">Anfrage senden</button>
        </form>

        <div class="form__ok" id="form-ok" hidden tabindex="-1">
          <svg viewBox="0 0 64 64" aria-hidden="true"><use href="#emblem"/></svg>
          <b>Angekommen!</b>
          <p id="form-ok-text"></p>
          <small>Entwurf: Hier wird noch nichts verschickt.</small>
          <button type="button" class="btn btn--rand" id="form-neu">Neue Anfrage</button>
        </div>
      </div>
    </div>
  </section>

</main>

<footer class="fuss">
  <div class="wrap fuss__in">
    <div class="fuss__marke">
      <svg viewBox="0 0 64 64" aria-hidden="true"><use href="#emblem"/></svg>
      <div><b>Melker Au-Teufel’n</b><span>Krampusverein Melk · seit 2008</span></div>
    </div>
    <nav class="fuss__links" aria-label="Rechtliches">
      <a href="#top">Impressum</a>
      <a href="#top">Datenschutz</a>
      <a href="https://www.instagram.com/melker_auteufeln/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.facebook.com/melker.auteufeln/" target="_blank" rel="noopener">Facebook</a>
    </nav>
    <a class="fuss__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="28" height="14">Webseite von Tim Kofler</a>
  </div>
</footer>

<a class="mobil" id="mobil" href="#aunacht" aria-label="Zur Au-Nacht"><span class="mobil__punkt"></span><span>Au-Nacht · noch <b id="mobil-tage">41</b> Tage</span><span class="mobil__pfeil" aria-hidden="true">›</span></a>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Bild groß">
  <button type="button" class="lb__zu" id="lb-zu" aria-label="Schließen">×</button>
  <button type="button" class="lb__nav lb__nav--l" id="lb-l" aria-label="Vorheriges Bild">‹</button>
  <img id="lb-img" alt="">
  <button type="button" class="lb__nav lb__nav--r" id="lb-r" aria-label="Nächstes Bild">›</button>
</div>

</body>
</html>
