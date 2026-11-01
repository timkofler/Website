<?php require __DIR__ . "/_gate.php";
$rezepte = json_decode((string) file_get_contents(__DIR__ . '/rezepte.json'), true) ?: [];
$ld = [
    '@context' => 'https://schema.org',
    '@graph' => [
        ['@type' => 'WebSite', 'name' => 'Backen mit Mrs. West', 'inLanguage' => 'de-AT'],
        ['@type' => 'Person', '@id' => '#conny', 'name' => 'Conny', 'alternateName' => 'Mrs. West', 'description' => 'Backt gute Kuchen und Rezepte, 3-fach Mama aus Niederösterreich.', 'sameAs' => ['https://www.instagram.com/mrswest_is_baking/']],
        ['@type' => 'Book', 'name' => 'Kaum in Torte zu fassen', 'author' => ['@id' => '#conny'], 'inLanguage' => 'de'],
        ['@type' => 'ItemList', 'name' => 'Rezepte', 'itemListElement' => array_map(fn ($r, $i) => [
            '@type' => 'ListItem', 'position' => $i + 1,
            'item' => [
                '@type' => 'Recipe', 'name' => $r['titel'], 'description' => $r['kurz'], 'author' => ['@id' => '#conny'],
                'totalTime' => 'PT' . (int) $r['zeit'] . 'M', 'recipeCategory' => 'Backen',
                'recipeIngredient' => array_map(fn ($z) => trim(($z[0] ? str_replace('.', ',', (string) $z[0]) . ' ' : '') . ($z[1] ? $z[1] . ' ' : '') . $z[2]), $r['zutaten']),
                'recipeInstructions' => array_map(fn ($s) => ['@type' => 'HowToStep', 'text' => $s['t']], $r['schritte']),
            ],
        ], $rezepte, array_keys($rezepte))],
    ],
];
?><!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Backen mit Mrs. West · Gute Kuchen &amp; Rezepte, die gelingen</title>
<meta name="description" content="Connys Rezept-Dose: Kuchen, Torten, Kekse und Frühstück zum Nachbacken. Mit Suche nach Zutaten, Backform-Rechner, Einkaufsliste und Backmodus. Dazu das Backbuch „Kaum in Torte zu fassen“.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fdf3ee">
<link rel="icon" href="assets/img/logo.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/nakedcake-hoch.webp" as="image">
<link rel="stylesheet" href="assets/style.css?v=1">
<script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-uhr" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l2.5 2M10 2h4M19 5l1.5 1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-herz" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.8 4 7.2 4c2 0 3.6 1.2 4.8 3 1.2-1.8 2.8-3 4.8-3 3.4 0 5.5 3.4 4.4 6.7C19.5 15.4 12 20 12 20z" fill="currentColor"/></symbol>
  <symbol id="i-herz-o" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.8 4 7.2 4c2 0 3.6 1.2 4.8 3 1.2-1.8 2.8-3 4.8-3 3.4 0 5.5 3.4 4.4 6.7C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="i-korb" viewBox="0 0 24 24"><path d="M3 9h18l-2 10a2 2 0 0 1-2 1.6H7A2 2 0 0 1 5 19L3 9zM8 9l4-6 4 6M9 13v4M15 13v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></symbol>
  <symbol id="i-lupe" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="i-alle" viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" opacity=".55"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor" opacity=".55"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor"/></symbol>
  <symbol id="i-blitz" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></symbol>
  <symbol id="i-kuchen" viewBox="0 0 24 24"><path d="M3 20h18M4 20v-7l16-5v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 14.5 20 10" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="5" r="2" fill="currentColor"/></symbol>
  <symbol id="i-torte" viewBox="0 0 24 24"><path d="M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 16c2 1.5 4 1.5 5.3 0 1.4 1.5 4 1.5 5.4 0 1.3 1.5 3.3 1.5 5.3 0M12 12V8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 3c1.5 1.5 1.5 3 0 4-1.5-1-1.5-2.5 0-4z" fill="currentColor"/></symbol>
  <symbol id="i-keks" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="10" r="1.4" fill="currentColor"/><circle cx="10" cy="15" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15" r="1" fill="currentColor"/></symbol>
  <symbol id="i-sonne" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-brot" viewBox="0 0 24 24"><path d="M5 20V11a4 4 0 0 1-1-7c2-1.5 4-1 5-1h6c1 0 3-.5 5 1a4 4 0 0 1-1 7v9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 11l2-2M12 14l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="i-teilen" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></symbol>
  <symbol id="i-pfeil" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-insta" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></symbol>
</svg>

<a class="skip" href="#rezepte">Zu den Rezepten</a>

<header class="nav" id="top">
  <div class="wrap nav__in">
    <a class="logo" href="#top" aria-label="Backen mit Mrs. West, zum Seitenanfang">
      <img src="assets/img/logo.svg" alt="" width="44" height="44">
      <span><small>Backen mit</small>Mrs. West</span>
    </a>
    <nav class="nav__links" id="menu" aria-label="Hauptmenü">
      <a href="#rezepte">Rezepte</a>
      <a href="#backbuch">Backbuch</a>
      <a href="#ueber">Über mich</a>
      <a href="#kontakt">Kooperationen</a>
    </nav>
    <div class="nav__tools">
      <button class="iconbtn" type="button" data-merkliste aria-label="Gemerkte Rezepte anzeigen">
        <svg><use href="#i-herz-o"/></svg><span class="badge" data-count-merk hidden>0</span>
      </button>
      <button class="iconbtn" type="button" data-open-liste aria-label="Einkaufsliste öffnen">
        <svg><use href="#i-korb"/></svg><span class="badge" data-count-liste hidden>0</span>
      </button>
      <button class="burger" type="button" aria-controls="menu" aria-expanded="false" aria-label="Menü öffnen"><span></span><span></span></button>
    </div>
  </div>
</header>

<main>
<section class="hero">
  <div class="streusel" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="wrap hero__in">
    <div class="hero__txt">
      <p class="kicker">Hallo, ich bin Conny!</p>
      <h1>Gute Kuchen <span class="amp">&amp;</span> Rezepte, die <em>einfach gelingen.</em></h1>
      <p class="lead">3-fach Mama aus Niederösterreich und Backbuch-Autorin. Hier findest du meine Lieblingsrezepte: sortiert, durchsuchbar und mit Einkaufsliste.</p>
      <form class="suche" role="search" data-hero-suche>
        <label class="sr" for="heroSuche">Rezept suchen</label>
        <svg aria-hidden="true"><use href="#i-lupe"/></svg>
        <input id="heroSuche" type="search" placeholder="Was backst du heute?" autocomplete="off" enterkeyhint="search">
        <button type="submit">Suchen</button>
      </form>
      <div class="schnell" aria-label="Beliebte Suchen">
        <button type="button" data-kat-jump="schnell">Schnell &amp; Einfach</button>
        <button type="button" data-such-jump="Cheesecake">Cheesecake</button>
        <button type="button" data-zutat-jump="Bananen">Mit Bananen</button>
        <button type="button" data-kat-jump="kekse">Kekse</button>
      </div>
    </div>
    <div class="hero__bild">
      <figure class="bogen bogen--gross"><img src="assets/img/nakedcake-hoch.webp" alt="Naked Cake mit frischen Beeren auf einer Tortenplatte" width="560" height="700" fetchpriority="high"></figure>
      <figure class="bogen bogen--klein"><img src="assets/img/cupcakes-hoch.webp" alt="Cupcakes mit Frosting in Pastellfarben" width="560" height="700"></figure>
      <div class="sticker sticker--zahl"><b>40,2 Tsd.</b><span>backen mit</span></div>
      <a class="sticker sticker--buch" href="#backbuch"><span>Mein Backbuch</span><b>Kaum in Torte zu fassen</b></a>
    </div>
  </div>
</section>

<div class="band" aria-hidden="true">
  <div class="band__lauf">
    <span>Schnell &amp; Einfach</span><span>Kuchen</span><span>Torten</span><span>Kekse</span><span>Frühstück</span><span>Brot &amp; Gebäck</span><span>Ohne Zucker</span><span>Für die Jausenbox</span>
    <span>Schnell &amp; Einfach</span><span>Kuchen</span><span>Torten</span><span>Kekse</span><span>Frühstück</span><span>Brot &amp; Gebäck</span><span>Ohne Zucker</span><span>Für die Jausenbox</span>
  </div>
</div>

<section class="dose" id="rezepte">
  <div class="wrap">
    <div class="kopf">
      <p class="kicker">Die Rezept-Dose</p>
      <h2>Finde dein Lieblingsrezept in Sekunden.</h2>
      <p>Tippe, was du suchst, oder was du gerade daheim hast. Jedes Rezept rechnet sich auf deine Backform um.</p>
    </div>

    <div class="kats" role="tablist" aria-label="Kategorien">
      <button type="button" role="tab" class="kat" data-kat="alle" aria-selected="true"><span class="kat__ring k-flieder"><svg><use href="#i-alle"/></svg></span>Alle</button>
      <button type="button" role="tab" class="kat" data-kat="schnell" aria-selected="false"><span class="kat__ring k-himmel"><svg><use href="#i-blitz"/></svg></span>Schnell &amp; Einfach</button>
      <button type="button" role="tab" class="kat" data-kat="kuchen" aria-selected="false"><span class="kat__ring k-rosa"><svg><use href="#i-kuchen"/></svg></span>Kuchen</button>
      <button type="button" role="tab" class="kat" data-kat="torten" aria-selected="false"><span class="kat__ring k-butter"><svg><use href="#i-torte"/></svg></span>Torten</button>
      <button type="button" role="tab" class="kat" data-kat="kekse" aria-selected="false"><span class="kat__ring k-mint"><svg><use href="#i-keks"/></svg></span>Kekse &amp; Kleines</button>
      <button type="button" role="tab" class="kat" data-kat="fruehstueck" aria-selected="false"><span class="kat__ring k-pfirsich"><svg><use href="#i-sonne"/></svg></span>Frühstück</button>
      <button type="button" role="tab" class="kat" data-kat="brot" aria-selected="false"><span class="kat__ring k-himmel"><svg><use href="#i-brot"/></svg></span>Brot &amp; Gebäck</button>
      <button type="button" role="tab" class="kat" data-kat="merk" aria-selected="false"><span class="kat__ring k-rosa"><svg><use href="#i-herz"/></svg></span>Gemerkt</button>
    </div>

    <div class="filter">
      <div class="feld">
        <label for="suche">Suche</label>
        <div class="feld__in">
          <svg aria-hidden="true"><use href="#i-lupe"/></svg>
          <input id="suche" type="search" placeholder="z. B. Zitrone, Brownies, Zimt" autocomplete="off" enterkeyhint="search">
        </div>
      </div>
      <div class="feld">
        <label for="zutat">Was hast du daheim?</label>
        <div class="feld__in feld__in--chips" data-chips>
          <input id="zutat" type="text" placeholder="Zutat eingeben, z. B. Topfen" autocomplete="off" enterkeyhint="done" list="zutatenListe">
        </div>
        <datalist id="zutatenListe"></datalist>
      </div>
    </div>
    <p class="treffer" aria-live="polite" data-treffer></p>

    <div class="grid" data-grid></div>
    <div class="leer" data-leer hidden>
      <p><b>Dafür hab ich noch nichts in der Dose.</b> Probier's mit weniger Zutaten oder einem anderen Wort.</p>
      <button type="button" class="btn btn--hell" data-reset>Alles zurücksetzen</button>
    </div>

    <ul class="vorteile">
      <li><b>Backform-Rechner</b><span>Rezept für 26 cm, du hast 20 cm? Die Mengen passen sich an.</span></li>
      <li><b>Einkaufsliste</b><span>Ein Tipp, und die Zutaten landen gesammelt auf deiner Liste.</span></li>
      <li><b>Backmodus</b><span>Große Schrift, Schritt für Schritt, mit Timer. Der Bildschirm bleibt an.</span></li>
    </ul>
  </div>
</section>

<section class="buch" id="backbuch">
  <div class="wrap buch__in">
    <div class="buch__szene" data-tilt>
      <div class="buch__3d">
        <div class="buch__cover">
          <span class="buch__autor">Mrs. West</span>
          <span class="buch__titel">Kaum <i>in</i> Torte <i>zu</i> fassen</span>
          <span class="buch__torte" aria-hidden="true"></span>
          <span class="buch__sub">Kuchen &amp; Torten zum Verlieben</span>
        </div>
        <div class="buch__ruecken"></div>
        <div class="buch__seiten"></div>
      </div>
      <div class="buch__award"><b>AFBA</b><span>Shortlist 2026</span></div>
    </div>
    <div class="buch__txt">
      <p class="kicker kicker--hell">Mein Backbuch</p>
      <h2>Kaum in Torte zu fassen</h2>
      <p>Meine liebsten Kuchen und Torten, gedruckt für deine Küche. Mit Bildern, Tipps und Rezepten, die auch an stressigen Tagen klappen.</p>
      <p class="buch__shortlist">Auf der Shortlist der AFBA 2026.</p>
      <div class="knoepfe">
        <a class="btn" href="#" data-demo="Hier kommt der Link zu deinem Buch-Shop hin.">Buch bestellen <svg><use href="#i-pfeil"/></svg></a>
        <a class="btn btn--rand" href="#kontakt" data-anfrage="Signiertes Buch">Signiert als Geschenk</a>
      </div>
      <p class="hinweis">Das Cover hier ist nur nachgezeichnet. Auf der fertigen Seite kommt dein echtes Buchcover hin.</p>
    </div>
  </div>
</section>

<section class="ueber" id="ueber">
  <div class="wrap ueber__in">
    <figure class="ueber__bild">
      <img src="assets/img/backtisch-hoch.webp" alt="Backzutaten auf einem Holztisch: Mehl, Eier, Schokolade und Schneebesen" width="560" height="700" loading="lazy">
      <figcaption class="sticker sticker--hallo">Hallo!</figcaption>
    </figure>
    <div class="ueber__txt">
      <p class="kicker">Über mich</p>
      <h2>Ich bin Conny, und ich backe für mein Leben gern.</h2>
      <p>Ich bin Mama von drei Kindern und wohne in Niederösterreich. Bei uns muss Backen oft schnell gehen, darum sind meine Rezepte so geschrieben, dass sie wirklich gelingen.</p>
      <p>Auf Instagram backen über 40.000 Menschen mit mir. Hier findest du alle Rezepte an einem Ort, ohne Suchen im Feed.</p>
      <div class="werte">
        <span class="k-himmel"><svg><use href="#i-blitz"/></svg>Schnell &amp; einfach</span>
        <span class="k-rosa"><svg><use href="#i-herz"/></svg>Mit Liebe gebacken</span>
        <span class="k-mint"><svg><use href="#i-sonne"/></svg>Für die ganze Familie</span>
      </div>
    </div>
  </div>
</section>

<section class="insta">
  <div class="wrap insta__in">
    <div>
      <p class="kicker">Neue Rezepte zuerst auf Instagram</p>
      <h2><span class="zaehler" data-zaehler="40.2">40,2</span> Tsd. backen schon mit.</h2>
    </div>
    <a class="btn btn--insta" href="https://www.instagram.com/mrswest_is_baking/" target="_blank" rel="noopener"><svg><use href="#i-insta"/></svg>@mrswest_is_baking</a>
  </div>
</section>

<section class="kontakt" id="kontakt">
  <div class="wrap kontakt__in">
    <div class="kontakt__txt">
      <p class="kicker">Kooperationen &amp; Anfragen</p>
      <h2>Lass uns gemeinsam was backen.</h2>
      <p>Für Marken, Magazine, Backkurse oder eine Frage zum Buch. Ich melde mich so schnell wie möglich.</p>
      <ul class="wege">
        <li><span>Telefon</span><a href="tel:+436600000000">+43 660 000 00 00</a></li>
        <li><span>E-Mail</span><a href="mailto:hallo@example.com">hallo@deine-domain.at</a></li>
        <li><span>Instagram</span><a href="https://www.instagram.com/mrswest_is_baking/" target="_blank" rel="noopener">@mrswest_is_baking</a></li>
      </ul>
    </div>
    <form class="formular" data-formular novalidate>
      <fieldset>
        <legend>Worum geht's?</legend>
        <div class="pills">
          <label><input type="radio" name="art" value="Kooperation" checked><span>Kooperation</span></label>
          <label><input type="radio" name="art" value="Backbuch"><span>Backbuch</span></label>
          <label><input type="radio" name="art" value="Signiertes Buch"><span>Signiertes Buch</span></label>
          <label><input type="radio" name="art" value="Frage zum Rezept"><span>Frage zum Rezept</span></label>
        </div>
      </fieldset>
      <label for="fName">Name</label>
      <input id="fName" name="name" type="text" autocomplete="name" required>
      <label for="fMail">E-Mail</label>
      <input id="fMail" name="mail" type="email" autocomplete="email" required>
      <label for="fText">Nachricht</label>
      <textarea id="fText" name="text" rows="4" required></textarea>
      <button class="btn" type="submit">Nachricht senden <svg><use href="#i-pfeil"/></svg></button>
      <p class="formular__ok" data-formular-ok hidden>Danke! Im Entwurf wird noch nichts verschickt. Auf der fertigen Seite landet die Nachricht direkt bei dir.</p>
    </form>
  </div>
</section>
</main>

<footer class="fuss">
  <div class="wrap fuss__in">
    <a class="logo logo--fuss" href="#top"><img src="assets/img/logo.svg" alt="" width="40" height="40" loading="lazy"><span><small>Backen mit</small>Mrs. West</span></a>
    <nav aria-label="Fußzeile"><a href="#rezepte">Rezepte</a><a href="#backbuch">Backbuch</a><a href="#ueber">Über mich</a><a href="#kontakt">Kooperationen</a></nav>
    <div class="demo-note">
      <span>Impressum · Datenschutz</span>
      <span class="tempo"><svg><use href="#i-blitz"/></svg><span>Diese Startseite lädt am Handy rund <b>0,4 MB</b>. Die jetzige Seite: 73,7 MB.</span></span>
      <span class="bildnachweis">Fotos: Pexels (freie Lizenz)</span>
      <a class="fuss__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17" loading="lazy">Entwurf von Tim Kofler</a>
    </div>
  </div>
</footer>

<!-- Rezept-Ansicht -->
<dialog class="blatt" data-blatt aria-labelledby="blattTitel">
  <div class="blatt__in">
    <button class="blatt__zu iconbtn" type="button" data-zu aria-label="Rezept schließen"><svg><use href="#i-x"/></svg></button>
    <figure class="blatt__bild"><img alt="" width="1200" height="900" data-b-bild></figure>
    <div class="blatt__inhalt">
      <div class="blatt__meta" data-b-meta></div>
      <h2 id="blattTitel" data-b-titel></h2>
      <p class="blatt__kurz" data-b-kurz></p>
      <div class="blatt__aktionen">
        <button class="btn btn--klein" type="button" data-b-liste><svg><use href="#i-korb"/></svg>Auf die Einkaufsliste</button>
        <button class="btn btn--klein btn--hell" type="button" data-b-merk aria-pressed="false"><svg><use href="#i-herz-o"/></svg><span>Merken</span></button>
        <button class="btn btn--klein btn--hell" type="button" data-b-teilen><svg><use href="#i-teilen"/></svg>Teilen</button>
      </div>
      <div class="rechner" data-b-rechner></div>
      <div class="blatt__spalten">
        <div>
          <h3>Zutaten <small>zum Abhaken</small></h3>
          <ul class="zutaten" data-b-zutaten></ul>
        </div>
        <div>
          <h3>So geht's</h3>
          <ol class="schritte" data-b-schritte></ol>
          <p class="tipp" data-b-tipp></p>
        </div>
      </div>
      <button class="btn btn--gross" type="button" data-b-backmodus><svg><use href="#i-play"/></svg>Backmodus starten</button>
    </div>
  </div>
</dialog>

<!-- Backmodus -->
<div class="modus" data-modus hidden role="dialog" aria-modal="true" aria-labelledby="modusTitel">
  <div class="modus__kopf">
    <p id="modusTitel" data-m-titel></p>
    <button class="iconbtn" type="button" data-m-zu aria-label="Backmodus beenden"><svg><use href="#i-x"/></svg></button>
  </div>
  <div class="modus__fort"><span data-m-fort></span></div>
  <div class="modus__mitte">
    <p class="modus__nr" data-m-nr></p>
    <p class="modus__text" data-m-text aria-live="polite"></p>
    <button class="timer" type="button" data-m-timer hidden></button>
  </div>
  <div class="modus__fuss">
    <button class="btn btn--hell" type="button" data-m-zurueck>Zurück</button>
    <button class="btn" type="button" data-m-weiter>Weiter</button>
  </div>
</div>

<!-- Einkaufsliste -->
<dialog class="liste" data-liste aria-labelledby="listeTitel">
  <div class="liste__kopf">
    <h2 id="listeTitel">Einkaufsliste</h2>
    <button class="iconbtn" type="button" data-liste-zu aria-label="Einkaufsliste schließen"><svg><use href="#i-x"/></svg></button>
  </div>
  <p class="liste__fuer" data-liste-fuer></p>
  <ul class="liste__items" data-liste-items></ul>
  <p class="liste__leer" data-liste-leer>Noch leer. Öffne ein Rezept und tippe auf „Auf die Einkaufsliste“.</p>
  <div class="liste__fuss">
    <a class="btn btn--wa" href="#" data-liste-wa target="_blank" rel="noopener">WhatsApp</a>
    <button class="btn btn--hell" type="button" data-liste-kopie>Kopieren</button>
    <button class="linkbtn" type="button" data-liste-leeren>Liste leeren</button>
  </div>
</dialog>

<div class="toast" data-toast role="status" aria-live="polite"></div>

<script id="rezeptDaten" type="application/json"><?= json_encode($rezepte, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<script src="assets/app.js?v=1" defer></script>
</body>
</html>
