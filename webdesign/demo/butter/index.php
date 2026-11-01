<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Frühstückspension Butter · Bed &amp; Breakfast in Scheibbs, Mostviertel</title>
<meta name="description" content="Frühstückspension Butter am Rand der Scheibbser Altstadt: fünf liebevoll eingerichtete Zimmer mit handgebauten Holzbetten, Frühstück inklusive, Gratis-Parkplatz. Freie Tage sehen und direkt anfragen.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#fbf5e6">
<link rel="icon" href="assets/img/stempel.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-hoch.webp" as="image" media="(max-width: 700px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 701px)">
<link rel="stylesheet" href="assets/style.css?v=1">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  "name": "Frühstückspension Butter",
  "slogan": "Bed & Breakfast & Butter",
  "foundingDate": "2013",
  "address": {"@type": "PostalAddress", "streetAddress": "Gamingerstraße 69", "postalCode": "3270", "addressLocality": "Scheibbs", "addressRegion": "Niederösterreich", "addressCountry": "AT"},
  "checkinTime": "13:00",
  "checkoutTime": "11:00",
  "numberOfRooms": 5,
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "Frühstück inklusive", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Gratis Parkplatz im Carport", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "WLAN", "value": true}
  ],
  "sameAs": ["https://www.instagram.com/pension_butter/"]
}
</script>
</head>
<body>

<header class="nav" id="top">
  <div class="wrap">
    <a class="logo" href="#top" aria-label="Frühstückspension Butter, zum Seitenanfang">
      <img src="assets/img/stempel.svg" alt="" width="48" height="48">
      <span><b>Pension <em>Butter</em></b><small>Bed &amp; Breakfast · Scheibbs</small></span>
    </a>
    <nav class="nav__links" aria-label="Hauptmenü">
      <a href="#zimmer">Zimmer</a><a href="#fruehstueck">Frühstück</a><a href="#familie">Über uns</a><a href="#umgebung">Umgebung</a><a href="#fragen">Anreise</a>
    </nav>
    <div class="nav__r">
      <a class="nav__tel" href="tel:+43748200000" data-demo-tel>07482 / 000 00</a>
      <a class="btn btn--f" href="#buchen">Zimmer anfragen</a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="mpanel" aria-label="Menü öffnen"><span></span></button>
    </div>
  </div>
</header>
<div class="mpanel" id="mpanel">
  <a href="#zimmer">Zimmer</a><a href="#fruehstueck">Frühstück</a><a href="#familie">Über uns</a><a href="#umgebung">Umgebung</a><a href="#fragen">Anreise &amp; Fragen</a>
  <a class="btn btn--f" href="#buchen">Zimmer anfragen</a>
</div>

<main>
<section class="hero">
  <div class="hero__v"><picture><source media="(max-width: 700px)" srcset="assets/img/hero-hoch.webp"><source media="(max-width: 1100px)" srcset="assets/img/hero-900.webp"><img src="assets/img/hero.webp" width="1800" height="1125" alt="" fetchpriority="high"></picture></div>
  <div class="spin" aria-hidden="true">
    <svg viewBox="0 0 160 160"><defs><path id="ringPfad" d="M80 80m-62 0a62 62 0 1 1 124 0a62 62 0 1 1-124 0"/></defs>
      <g class="ring"><text textLength="384" lengthAdjust="spacing"><textPath href="#ringPfad" textLength="384" lengthAdjust="spacing">Bed · Breakfast · Butter · Seit 2013 ·</textPath></text></g>
      <circle class="core" cx="80" cy="80" r="36"/>
      <text class="core__b" x="80" y="94" text-anchor="middle">B</text>
    </svg>
  </div>
  <div class="wrap">
    <span class="k">Familie Butter · Scheibbs</span>
    <h1>Gut geschlafen. Gut <em>gefrühstückt.</em></h1>
    <p class="lead">Fünf liebevoll eingerichtete Zimmer am Rand der Scheibbser Altstadt, Betten aus eigener Hand und ein Frühstück, bei dem die Butter nicht fehlen darf. Direkt bei uns anfragen, ohne Buchungsportal.</p>
    <form class="quick" id="quick" aria-label="Freie Zimmer suchen">
      <label><span>Anreise</span><input type="date" id="qIn" required></label>
      <label><span>Abreise</span><input type="date" id="qOut" required></label>
      <label><span>Gäste</span><select id="qG"><option value="1">1 Person</option><option value="2" selected>2 Personen</option><option value="3">3 Personen</option><option value="4">4 Personen</option><option value="5">5 Personen</option></select></label>
      <button class="btn btn--z" type="submit">Freie Zimmer zeigen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
    <div class="hero__facts">
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>4 Zimmer &amp; 1 Apartment</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/></svg>Frühstück inklusive</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/></svg>Altstadt zu Fuß</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14M6 17l1.5-6h9L18 17M8 11l1-3h6l1 3"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg>Gratis parken im Carport</span>
    </div>
  </div>
</section>

<section class="direct" aria-label="Vorteile bei Direktbuchung">
  <div class="wrap">
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12 12 20l-8-8V4h8z"/><circle cx="8" cy="8" r="1.5"/></svg><span><b>Direkt bei uns</b><small>Keine Provision an Portale, du sprichst gleich mit der Familie.</small></span></div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 21V12M17 21V12M4 12c0-5 3.6-9 8-9s8 4 8 9z"/></svg><span><b>Handgebaute Betten</b><small>Aus Eiche, Birne und Esche, in eigener Handarbeit gebaut.</small></span></div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg><span><b>Kaffee &amp; Tee</b><small>Kaffeemaschine und Wasserkocher im Eingang, Tee gratis.</small></span></div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span><b>Persönliche Antwort</b><small>Wir melden uns selbst, so schnell es geht.</small></span></div>
  </div>
</section>

<section class="sec" id="zimmer">
  <div class="wrap">
    <span class="k" data-reveal>Zimmer &amp; Apartment</span>
    <h2 class="h2" data-reveal>Jedes Bett ein <em>Unikat.</em></h2>
    <p class="lead" data-reveal>Alle Zimmer sind liebevoll eingerichtet, die Betten haben wir selbst aus Vollholz gebaut. Jedes Zimmer hat ein modernes Duschbad mit WC, Fernseher und WLAN. Preise pro Person und Nacht, mit Frühstück.</p>
    <div class="rooms" id="rooms">
      <article class="room" data-reveal data-room="eiche">
        <button class="room__img" type="button" data-open="eiche" aria-label="Eichenzimmer: Bild und Details ansehen"><img src="assets/img/zimmer1-640.webp" srcset="assets/img/zimmer1-640.webp 640w, assets/img/zimmer1-1200.webp 1200w" sizes="(max-width:760px) 100vw, 600px" width="640" height="480" alt="Doppelzimmer mit großem Holzbett, weißer Bettwäsche und Schaukelstuhl" loading="lazy"><span class="room__tag">Zimmer 1</span></button>
        <div class="room__b">
          <div class="room__h"><div><h3>Eichenzimmer</h3><div class="room__meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>2–3 Personen</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/></svg>Doppelzimmer</span></div></div><div class="price"><b>51 €<small>p. P.</small></b><small>pro Nacht</small></div></div>
          <p>Doppelbett aus Eichenholz, Platz für ein Zusatzbett und durchs Fenster ein schöner Blick ins Grüne.</p>
          <ul class="chips"><li>Eichenbett</li><li>Zusatzbett möglich</li><li>Duschbad</li><li>WLAN &amp; TV</li></ul>
          <div class="room__f"><button class="btn btn--l" type="button" data-open="eiche">Details</button><a class="btn btn--f" href="#buchen" data-pick="eiche">Freie Tage</a></div>
        </div>
      </article>
      <article class="room" data-reveal style="--d:.08s" data-room="birne">
        <button class="room__img" type="button" data-open="birne" aria-label="Birnenzimmer: Bild und Details ansehen"><img src="assets/img/zimmer2-640.webp" srcset="assets/img/zimmer2-640.webp 640w, assets/img/zimmer2-1200.webp 1200w" sizes="(max-width:760px) 100vw, 600px" width="640" height="480" alt="Holzbett mit karierter Bettwäsche und Holzstuhl" loading="lazy"><span class="room__tag">Zimmer 2</span></button>
        <div class="room__b">
          <div class="room__h"><div><h3>Birnenzimmer</h3><div class="room__meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>1 Person</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/></svg>Einzelzimmer</span></div></div><div class="price"><b>58 €</b><small>pro Nacht</small></div></div>
          <p>Unser Einzelzimmer mit Vollholzbett aus Birne und Ausblick auf Wald, Hügel und Fluss.</p>
          <ul class="chips"><li>Birnenholzbett</li><li>Blick ins Tal</li><li>Duschbad</li><li>WLAN &amp; TV</li></ul>
          <div class="room__f"><button class="btn btn--l" type="button" data-open="birne">Details</button><a class="btn btn--f" href="#buchen" data-pick="birne">Freie Tage</a></div>
        </div>
      </article>
      <article class="room" data-reveal data-room="esche">
        <button class="room__img" type="button" data-open="esche" aria-label="Familienzimmer: Bild und Details ansehen"><img src="assets/img/zimmer3-640.webp" srcset="assets/img/zimmer3-640.webp 640w, assets/img/zimmer3-1200.webp 1200w" sizes="(max-width:760px) 100vw, 600px" width="640" height="480" alt="Gemütliches Zimmer mit Bücherregal, Sitzbank und großen Holzfenstern" loading="lazy"><span class="room__tag">Für Familien</span></button>
        <div class="room__b">
          <div class="room__h"><div><h3>Familienzimmer</h3><div class="room__meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>2–4 Personen</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/></svg>Zimmer 3</span></div></div><div class="price"><b>51 €<small>p. P.</small></b><small>pro Nacht</small></div></div>
          <p>Doppelbett aus Eschenholz und Platz für ein Zusatzbett. Mit dem Zimmer nebenan wird daraus ein Familienzimmer mit mehr Betten.</p>
          <ul class="chips"><li>Eschenbett</li><li>Verbindungstür</li><li>Zusatzbett</li><li>Blick ins Grüne</li></ul>
          <div class="room__f"><button class="btn btn--l" type="button" data-open="esche">Details</button><a class="btn btn--f" href="#buchen" data-pick="esche">Freie Tage</a></div>
        </div>
      </article>
      <article class="room" data-reveal style="--d:.08s" data-room="balkon">
        <button class="room__img" type="button" data-open="balkon" aria-label="Balkonzimmer: Bild und Details ansehen"><img src="assets/img/zimmer4-640.webp" srcset="assets/img/zimmer4-640.webp 640w, assets/img/zimmer4-1200.webp 1200w" sizes="(max-width:760px) 100vw, 600px" width="640" height="480" alt="Helles Zimmer mit Glastür zum Balkon, Tisch und Stühlen und Blick ins Grüne" loading="lazy"><span class="room__tag">Mit Balkon</span></button>
        <div class="room__b">
          <div class="room__h"><div><h3>Balkonzimmer</h3><div class="room__meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>2 Personen</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/></svg>Zimmer 4</span></div></div><div class="price"><b>51 €<small>p. P.</small></b><small>pro Nacht</small></div></div>
          <p>Doppelzimmer mit eigenem Balkon und Blick über Garten, Wald und Wiesen. Den Garten darfst du gern mitbenützen.</p>
          <ul class="chips"><li>Balkon</li><li>Garten</li><li>Eigenes Bad</li><li>WLAN &amp; TV</li></ul>
          <div class="room__f"><button class="btn btn--l" type="button" data-open="balkon">Details</button><a class="btn btn--f" href="#buchen" data-pick="balkon">Freie Tage</a></div>
        </div>
      </article>
      <article class="room" data-reveal data-room="apartment">
        <button class="room__img" type="button" data-open="apartment" aria-label="Apartment: Bild und Details ansehen"><img src="assets/img/zimmer5-640.webp" srcset="assets/img/zimmer5-640.webp 640w, assets/img/zimmer5-1200.webp 1200w" sizes="(max-width:760px) 100vw, 1200px" width="640" height="480" alt="Sonnige Küche mit Holzmöbeln, Esstisch und Fenster" loading="lazy"><span class="room__tag">Bis 5 Personen</span></button>
        <div class="room__b">
          <div class="room__h"><div><h3>Apartment</h3><div class="room__meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>2–5 Personen</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V10l8-6 8 6v11zM9 21v-6h6v6"/></svg>Zimmer 5 · mit Küche</span></div></div><div class="price"><b>51 €<small>p. P.</small></b><small>pro Nacht</small></div></div>
          <p>Schlafzimmer mit Doppelbett und Einzelbett, Wohnzimmer mit ausziehbarer Couch, eigene Küche und Bad mit Badewanne. Der Garten liegt gleich daneben.</p>
          <ul class="chips"><li>Küche</li><li>Badewanne</li><li>Schlafcouch</li><li>Garten</li></ul>
          <div class="room__f"><button class="btn btn--l" type="button" data-open="apartment">Details</button><a class="btn btn--f" href="#buchen" data-pick="apartment">Freie Tage</a></div>
        </div>
      </article>
    </div>
  </div>
</section>

<div class="ticker" aria-hidden="true"><div class="ticker__in">
  <span>Bed <i></i> Breakfast <i></i> Butter <i></i> Scheibbs <i></i> Mostviertel <i></i> Seit 2013 <i></i></span>
  <span>Bed <i></i> Breakfast <i></i> Butter <i></i> Scheibbs <i></i> Mostviertel <i></i> Seit 2013 <i></i></span>
</div></div>

<section class="sec book" id="buchen">
  <div class="wrap">
    <span class="k">Belegung &amp; Anfrage</span>
    <h2 class="h2">Freie Tage <em>sehen</em>, gleich anfragen.</h2>
    <p class="lead">Zimmer wählen, im Kalender Anreise und Abreise antippen. Der Preis rechnet sich sofort, und wir bestätigen dir die Anfrage persönlich.</p>
    <div class="book__grid">
      <div class="panel">
        <div class="rtabs" id="rtabs" role="group" aria-label="Zimmer wählen"></div>
        <div class="cal__top"><div><b id="calTitle">Kalender</b><small class="cal__min" id="calMin"></small></div><div class="cal__nav"><button type="button" id="calPrev" aria-label="Vorheriger Monat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button><button type="button" id="calNext" aria-label="Nächster Monat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button></div></div>
        <div class="cal__months" id="calMonths"></div>
        <div class="legend"><span><i style="background:rgba(76,122,63,.2)"></i>frei</span><span><i style="background:repeating-linear-gradient(135deg,#ece6db 0 3px,#d9d0c1 3px 6px)"></i>belegt</span><span><i class="lg-nope"></i>nicht wählbar</span><span><i style="background:var(--zirbe)"></i>dein Aufenthalt</span></div>
        <p class="cal__hint" id="calHint" aria-live="polite">Tippe auf deinen Anreisetag.</p>
      </div>
      <div class="panel" id="formPanel">
        <h3 class="fh">Deine Daten</h3>
        <form class="form" id="form" novalidate>
          <div class="two"><div class="fld"><label for="fName">Name</label><input id="fName" name="name" autocomplete="name" required></div><div class="fld"><label for="fTel">Telefon <small>(optional)</small></label><input id="fTel" name="tel" type="tel" autocomplete="tel"></div></div>
          <div class="fld"><label for="fMail">E-Mail</label><input id="fMail" name="email" type="email" autocomplete="email" required></div>
          <div class="fld"><label for="fMsg">Wünsche <small>(optional)</small></label><textarea id="fMsg" name="msg" placeholder="z. B. Ankunftszeit, Zusatzbett, Allergien"></textarea></div>
          <label class="chk"><input type="checkbox" id="fOk" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden.</span></label>
          <p class="err" id="fErr" aria-live="polite"></p>
          <button class="btn btn--z" type="submit">Unverbindlich anfragen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </form>
      </div>
      <aside class="panel sum" id="sum" aria-label="Deine Anfrage">
        <div id="sumForm">
          <div class="sum__room"><img id="sImg" src="assets/img/zimmer1-640.webp" alt="" width="84" height="64"><span><b id="sName">Eichenzimmer</b><small id="sMeta">Doppelzimmer · bis 3 Personen</small></span></div>
          <div class="sum__dates"><div><span>Anreise</span><b id="sIn">–</b></div><div><span>Abreise</span><b id="sOut">–</b></div></div>
          <div class="row"><span>Erwachsene</span><div class="step"><button type="button" data-step="ad" data-d="-1" aria-label="Weniger Erwachsene">−</button><output id="oAd">2</output><button type="button" data-step="ad" data-d="1" aria-label="Mehr Erwachsene">+</button></div></div>
          <div class="row"><span>Kinder<small>Preis auf Anfrage</small></span><div class="step"><button type="button" data-step="ki" data-d="-1" aria-label="Weniger Kinder">−</button><output id="oKi">0</output><button type="button" data-step="ki" data-d="1" aria-label="Mehr Kinder">+</button></div></div>
          <div class="calc" id="calc"></div>
          <div class="total"><span>Gesamt</span><b id="total">–</b></div>
          <p class="sum__note">Unverbindliche Anfrage, Frühstück inklusive. Nächtigungstaxe 2,60 € pro Person und Nacht ist eingerechnet.</p>
        </div>
        <div class="done" id="done" hidden tabindex="-1">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="29" opacity=".25"/><path d="m20 33 8 8 16-17"/></svg>
          <h3>Danke, <span id="dName"></span>!</h3>
          <p>Deine Anfrage ist bei Familie Butter. Wir melden uns so schnell wie möglich mit einer Zusage per E-Mail.</p>
          <dl id="dList"></dl>
          <p style="font-size:13px">Entwurf: Es wurde nichts verschickt.</p>
          <button class="btn btn--l" type="button" id="again">Neue Anfrage</button>
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="day-s" id="tag" aria-label="Ein Tag bei Familie Butter">
  <div class="day-s__in">
    <div class="scene">
      <svg id="sky" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop id="s1" offset="0" stop-color="#7fb2df"/><stop id="s2" offset="1" stop-color="#e6f0f2"/></linearGradient>
          <radialGradient id="gSun"><stop offset="0" stop-color="#fff3cf" stop-opacity=".9"/><stop offset=".3" stop-color="#ffd789" stop-opacity=".35"/><stop offset="1" stop-color="#ffd789" stop-opacity="0"/></radialGradient>
          <radialGradient id="gGlow"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".85"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
          <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08101f" stop-opacity="0"/><stop offset=".18" stop-color="#08101f" stop-opacity="1"/></linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#gSky)"/>
        <g id="stars"></g>
        <g id="sunG"><circle r="190" fill="url(#gSun)"/><circle r="44" fill="#fff1c9"/></g>
        <g id="moonG"><circle r="30" fill="#f4efdf"/><circle cx="12" cy="-8" r="26" fill="#0d1428" id="moonCut"/></g>
        <path id="far" d="M0 560 L110 505 L210 532 L330 470 L450 512 L560 455 L700 520 L1180 500 L1290 452 L1400 498 L1500 470 L1600 505 V900 H0Z" fill="#a9b8c4"/>
        <path id="oet" d="M250 660 C380 590 520 450 640 350 C700 300 770 262 822 258 C870 254 920 282 985 330 C1090 405 1230 525 1420 640 L1420 900 L250 900Z" fill="#6f817b"/>
        <path d="M760 286 C795 262 850 250 900 276 C885 292 866 288 850 302 C832 290 812 300 796 296 C786 292 774 294 760 286Z" fill="#f4f1ea" opacity=".85"/>
        <g id="alm" transform="translate(1040 381) scale(1.3) translate(-642 -457)"><rect x="636" y="426" width="12" height="31" fill="#8a6440"/><path d="M630 428 L642 414 L654 428Z" fill="#4a3a30"/><rect x="633" y="434" width="18" height="3" fill="#4a3a30"/></g>
        <path id="hill" d="M0 700 C200 640 380 662 560 690 C760 650 980 606 1200 640 C1380 612 1500 630 1600 620 V900 H0Z" fill="#557553"/>
        <g id="forest" fill="#2f4a35"></g>
        <path id="trail" d="M944 776 C1000 780 1060 776 1080 744 C1098 714 1078 680 1090 640 C1100 600 1078 560 1076 520 C1074 480 1060 430 1046 384" fill="none" stroke="#d9cba3" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" opacity=".9"/>
        <path id="mead" d="M0 772 C300 738 600 760 900 752 C1200 742 1400 762 1600 750 V900 H0Z" fill="#6f9150"/>
        <g id="sauna"><rect x="612" y="722" width="80" height="48" fill="#8a6440"/><path d="M604 726 L652 694 L700 726Z" fill="#4a3a30"/><rect x="628" y="736" width="22" height="16" fill="#2c343a"/><rect x="662" y="734" width="18" height="36" fill="#5b4029"/></g>
        <g id="house">
          <rect x="772" y="604" width="256" height="168" fill="#f6ecd2"/>
          <path d="M750 608 L900 516 L1050 608 L1040 614 L900 528 L760 614Z" fill="#7a3b2a"/>
          <path d="M772 604 L900 528 L1028 604Z" fill="#f6ecd2"/>
          <rect x="976" y="530" width="20" height="44" fill="#6c5a50"/>
          <g class="pane" fill="#33404a"><rect x="886" y="556" width="28" height="30"/><rect x="796" y="616" width="30" height="36"/><rect x="852" y="616" width="30" height="36"/><rect x="918" y="616" width="30" height="36"/><rect x="974" y="616" width="30" height="36"/><rect x="796" y="700" width="30" height="36"/><rect x="852" y="700" width="30" height="36"/><rect x="974" y="700" width="30" height="36"/></g>
          <rect x="904" y="712" width="40" height="60" rx="3" fill="#5b4029"/>
          <rect x="780" y="672" width="240" height="8" fill="#6b4528"/>
          <path d="M786 672v-18M806 672v-18M826 672v-18M846 672v-18M866 672v-18M886 672v-18M906 672v-18M926 672v-18M946 672v-18M966 672v-18M986 672v-18M1006 672v-18" stroke="#6b4528" stroke-width="4"/>
          <path d="M780 654h240" stroke="#6b4528" stroke-width="4"/>
          <text x="900" y="697" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-size="15" letter-spacing="3" fill="#4a3a30">GASTHOF BUTTER</text>
          <g fill="#e9b949"><circle cx="800" cy="650" r="3.5"/><circle cx="820" cy="649" r="3.5"/><circle cx="860" cy="650" r="3.5"/><circle cx="940" cy="650" r="3.5"/><circle cx="980" cy="649" r="3.5"/><circle cx="1000" cy="650" r="3.5"/></g>
        </g>
        <g id="bench"><rect x="1062" y="756" width="46" height="5" fill="#6b4528"/><rect x="1066" y="760" width="4" height="12" fill="#6b4528"/><rect x="1100" y="760" width="4" height="12" fill="#6b4528"/><rect x="1120" y="728" width="4" height="44" fill="#3a2e28"/><rect x="1115" y="720" width="14" height="12" rx="2" fill="#3a2e28"/></g>
        <g id="hikers"><g transform="translate(-9 0)"><circle cy="-15" r="3.6" fill="#f0d0b0"/><rect x="-4" y="-11" width="8" height="11" rx="2" fill="#c8483b"/><path d="M-2 0v6M2 0v6" stroke="#2a2f3a" stroke-width="2.4"/></g><g transform="translate(7 2)"><circle cy="-15" r="3.6" fill="#f0d0b0"/><rect x="-4" y="-11" width="8" height="11" rx="2" fill="#e9b949"/><path d="M-2 0v6M2 0v6" stroke="#2a2f3a" stroke-width="2.4"/></g></g>
        <rect id="night" y="200" width="1600" height="700" fill="url(#gNight)" opacity="0"/>
        <g id="lights">
          <circle id="glowHouse" cx="900" cy="680" r="170" fill="url(#gGlow)" opacity="0"/>
          <g id="winLit" fill="#ffcf7a" opacity="0"><rect x="886" y="556" width="28" height="30"/><rect x="796" y="616" width="30" height="36"/><rect x="852" y="616" width="30" height="36"/><rect x="974" y="616" width="30" height="36"/><rect x="796" y="700" width="30" height="36"/><rect x="852" y="700" width="30" height="36"/><rect x="974" y="700" width="30" height="36"/></g>
          <g id="saunaLit" opacity="0"><circle cx="639" cy="744" r="56" fill="url(#gGlow)"/><rect x="628" y="736" width="22" height="16" fill="#ffb565"/></g>
          <g id="lantern" opacity="0"><circle cx="1122" cy="726" r="46" fill="url(#gGlow)"/><rect x="1117" y="722" width="10" height="8" fill="#ffe0a0"/></g>
        </g>
        <g id="smoke" fill="#fff"><circle cx="986" cy="520" r="7"/><circle cx="992" cy="500" r="9"/><circle cx="1000" cy="478" r="11"/></g>
        <g id="steam" fill="#fff" style="display:none"><circle cx="690" cy="676" r="6"/></g>
      </svg>
    </div>
    <div class="day-s__txt"><div class="wrap"><span class="k">Ein Tag bei uns</span><h2 class="h2">Vom ersten Kaffee bis zum <em>Sternenhimmel.</em></h2></div></div>
    <div class="tl"><div class="wrap"><div class="tl__card" aria-live="polite">
      <div class="tl__time" id="clock">07:00</div>
      <h3 id="tlH">Frühstück</h3>
      <p id="tlP">Frisches Gebäck, Butter natürlich, Honig, Marmelade und Eier nach Wunsch.</p>
      <div class="tl__bar" id="tlBar" role="slider" tabindex="0" aria-label="Uhrzeit wählen" aria-valuemin="6" aria-valuemax="23" aria-valuenow="7" aria-valuetext="07:00"><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i><span class="tl__knob" aria-hidden="true"></span></div>
      <span class="tl__hint" aria-hidden="true">Zum Durchspulen ziehen</span>
    </div></div></div>
  </div>
</section>

<section class="sec" id="fruehstueck">
  <div class="wrap food">
    <div class="food__imgs" data-reveal>
      <img src="assets/img/fruehstueck.webp" width="900" height="1125" alt="Frühstückstisch aus Holz mit Butterschale, Brot und Kaffee" loading="lazy">
      <div><img src="assets/img/butterbrot.webp" width="900" height="1125" alt="Butterbrot mit Messer auf einem weißen Teller" loading="lazy"><img src="assets/img/gebaeck.webp" width="900" height="600" alt="Vollkornbrot wird mit Butter bestrichen" loading="lazy"></div>
    </div>
    <div>
      <span class="k" data-reveal>Frühstück</span>
      <h2 class="h2" data-reveal>Bed &amp; Breakfast <em>&amp; Butter.</em></h2>
      <p class="lead" data-reveal>Bei uns steht das Frühstück im Namen, und die Butter sowieso. Morgens wird aufgetischt, damit du gut gestärkt in den Tag startest.</p>
      <ul class="menu" data-reveal>
        <li><b>Frühstück</b><em>inklusive</em><span>Frisches Gebäck und Brot, Butter, Honig und Marmelade, Käse und Wurst, Müsli und Eier nach Wunsch</span></li>
        <li><b>Kaffee &amp; Tee</b><em>jederzeit</em><span>Kaffeemaschine und Wasserkocher im Eingangsbereich, Tee zur freien Entnahme</span></li>
        <li><b>Getränke</b><em>im Kühlschrank</em><span>Kalte Getränke im Eingang, bezahlt wird ganz einfach bei der Abreise</span></li>
        <li><b>Check-in &amp; Check-out</b><em>13 / 11 Uhr</em><span>Einchecken ab 13 Uhr, auschecken bis 11 Uhr</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="sec" id="familie" style="padding-top:0">
  <div class="wrap fam">
    <div class="fam__img" data-reveal>
      <img src="assets/img/huegel.webp" width="900" height="600" alt="Sanfte grüne Hügel mit Nebel im Morgenlicht" loading="lazy" style="aspect-ratio:4/5">
      <img class="stamp" src="assets/img/stempel.svg" width="150" height="150" alt="Stempel: Frühstückspension Familie Butter, 2013, Scheibbs" loading="lazy">
    </div>
    <div>
      <span class="k" data-reveal>Über uns</span>
      <h2 class="h2" data-reveal>Gastfreundschaft in der <em>3. Generation.</em></h2>
      <p class="lead" data-reveal>Am Rand der schönen, altertümlichen Stadt Scheibbs, im Herzen des Alpenvorlandes, steht unser traditionsbewusster Gasthof. Seit mehr als 70 Jahren in Familienbesitz, heute geführt von Mutter und Tochter.</p>
      <div class="nums" data-reveal>
        <div><b data-count="70" data-suffix="+">70+</b><small>Jahre Gasthof in Familienhand</small></div>
        <div><b data-count="3" data-suffix=".">3.</b><small>Generation</small></div>
        <div><b>2013</b><small>die ersten Pensionsgäste</small></div>
        <div><b data-count="5">5</b><small>Zimmer mit Herz</small></div>
      </div>
      <ul class="tl-line" data-reveal>
        <li><b>2012</b><span>Die Idee: Aus unserem Veranstaltungssaal werden Komfortzimmer.</span></li>
        <li><b>2013</b><span>Im Juli begrüßen wir die ersten Gäste der Frühstückspension.</span></li>
        <li><b>heute</b><span>Fünf Zimmer, Betten aus eigener Hand, und wir freuen uns auf viele weitere Gäste.</span></li>
      </ul>
      <blockquote data-reveal>„Wir sorgen mit Herz und Einsatz für das Wohl unserer Gäste.“<cite>Sigrid Butter &amp; Tochter</cite></blockquote>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <span class="k" data-reveal>Das Haus</span>
    <h2 class="h2" data-reveal>Klein, ruhig, <em>gemütlich.</em></h2>
    <div class="well">
      <article data-reveal><img src="assets/img/tal.webp" width="900" height="600" alt="Bewaldetes Tal mit Wiese und Nebel" loading="lazy"><div><h3>Am Stadtrand, im Grünen</h3><p>Garten, Wald und Wiesen vor dem Fenster, die Altstadt trotzdem zu Fuß erreichbar.</p></div></article>
      <article data-reveal style="--d:.08s"><div class="ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 50V22M56 50V34M8 40h48M8 34h48M14 34v-6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6"/><path d="M40 16c0-3 2-6 6-6s6 3 6 6M46 10v6"/></svg></div><div><h3>Betten aus eigener Hand</h3><p>Jedes Bett ist komplett aus Holz und von uns selbst gebaut: Eiche, Birne, Esche.</p></div></article>
      <article data-reveal style="--d:.16s"><div class="ico"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22 32 8l26 14M10 24v28M54 24v28"/><path d="M18 46h28M20 46l3-10h18l3 10M24 36l2-6h12l2 6"/><circle cx="24" cy="47" r="3.5"/><circle cx="40" cy="47" r="3.5"/></svg></div><div><h3>Gratis Parkplatz</h3><p>Dein Auto steht kostenlos unter unserem Carport auf dem hauseigenen Parkplatz.</p></div></article>
    </div>
  </div>
</section>

<section class="sec area" id="umgebung">
  <div class="wrap">
    <div class="area__top">
      <div><span class="k">Umgebung</span><h2 class="h2">Scheibbs, <em id="seasonWord">im Sommer.</em></h2></div>
      <div class="season" role="group" aria-label="Jahreszeit">
        <button type="button" data-season="sommer" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>Sommer</button>
        <button type="button" data-season="winter" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>Winter</button>
      </div>
    </div>
    <div class="area__grid">
      <div class="area__img"><img id="imgS" src="assets/img/huegel.webp" width="900" height="600" alt="Grüne Hügellandschaft im Morgennebel" loading="lazy"><img id="imgW" class="off" src="assets/img/winter.webp" width="900" height="675" alt="Verschneites Skigebiet mit Pisten zwischen Nadelwald" loading="lazy"></div>
      <div>
        <ul class="trips" id="trips"></ul>
        <p class="card-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5"/></svg><span><b>Tipps und Broschüren</b> zu Ausflügen, Wanderwegen und Veranstaltungen liegen bei uns im Haus bereit. Fahrzeiten ungefähr.</span></p>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="fragen">
  <div class="wrap info">
    <div>
      <span class="k" data-reveal>Gut zu wissen</span>
      <h2 class="h2" data-reveal>Fragen, bevor du <em>packst.</em></h2>
      <div class="faq">
        <details open><summary>Ab wann kann ich einchecken?<i></i></summary><p>Check-in ist ab 13 Uhr, Check-out bis 11 Uhr. Kommst du später, sag uns einfach Bescheid.</p></details>
        <details><summary>Ist die Anfrage schon eine Buchung?<i></i></summary><p>Nein. Wir prüfen deine Anfrage und schicken dir eine Zusage. Ab dann ist das Zimmer fix für dich reserviert.</p></details>
        <details><summary>Was kostet eine einzelne Nacht?<i></i></summary><p>Bleibst du nur eine Nacht, verrechnen wir einen Aufpreis von 5 € pro Person. Ein Doppelzimmer für dich allein kostet 63 € pro Nacht.</p></details>
        <details><summary>Was kostet es für Kinder?<i></i></summary><p>Den Preis für Kinder machen wir gern persönlich aus. Im Eichen- und Familienzimmer ist Platz für ein Zusatzbett, das Familienzimmer lässt sich mit dem Nachbarzimmer verbinden.</p></details>
        <details><summary>Wie kann ich stornieren?<i></i></summary><p>Gib uns bitte so bald wie möglich Bescheid. Sonst kann es sein, dass wir entstandene Unkosten verrechnen müssen.</p></details>
        <details><summary>Gibt es einen Parkplatz?<i></i></summary><p>Ja, kostenlos unter unserem Carport direkt am Haus.</p></details>
      </div>
    </div>
    <div class="arr" data-reveal>
      <svg class="map" viewBox="0 0 600 340" role="img" aria-label="Skizze der Anreise: von der Westautobahn durchs Erlauftal nach Scheibbs">
        <rect width="600" height="340" fill="#efe4c9"/>
        <path d="M120 -10 C140 80 200 140 250 200 S330 300 360 350" fill="none" stroke="#b8cbd6" stroke-width="14" stroke-linecap="round"/>
        <text x="300" y="320" font-family="Inter,sans-serif" font-size="12" font-style="italic" fill="#6b8aa0">Erlauf</text>
        <path d="M-10 46 H610" stroke="#d6c7a6" stroke-width="12"/><path d="M-10 46 H610" stroke="#fff" stroke-width="2" stroke-dasharray="14 12"/>
        <text x="20" y="30" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#6b5f52">A1 Westautobahn · Abfahrt Ybbs</text>
        <path d="M170 46 C200 90 230 110 270 140 S340 200 380 236" fill="none" stroke="#fffdf7" stroke-width="9" stroke-linecap="round"/>
        <path d="M170 46 C200 90 230 110 270 140 S340 200 380 236" fill="none" stroke="#8f5d06" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8"/>
        <circle cx="236" cy="114" r="5" fill="#fffdf7" stroke="#6b5f52" stroke-width="2"/><text x="248" y="112" font-family="Inter,sans-serif" font-size="12" fill="#6b5f52">Wieselburg</text>
        <circle cx="312" cy="172" r="5" fill="#fffdf7" stroke="#6b5f52" stroke-width="2"/><text x="324" y="170" font-family="Inter,sans-serif" font-size="12" fill="#6b5f52">Purgstall</text>
        <path d="M420 340 L470 270 L505 300 L560 220 L620 340Z" fill="#d9caa8"/>
        <g transform="translate(380 236)"><path d="M0 0 C-14 -16 -18 -24 -18 -32 a18 18 0 0 1 36 0 C18 -24 14 -16 0 0Z" fill="#2e241b"/><circle cy="-32" r="7" fill="#f2c14e"/></g>
        <text x="404" y="214" font-family="Fraunces,Georgia,serif" font-size="20" fill="#2e241b">Pension Butter</text>
        <text x="404" y="234" font-family="Inter,sans-serif" font-size="12" fill="#6b5f52">Scheibbs</text>
      </svg>
      <div class="arr__b">
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14M6 17l1.5-6h9L18 17M8 11l1-3h6l1 3"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg><span><b>Mit dem Auto</b>Von der A1 über Wieselburg und Purgstall ins Erlauftal, etwa 25 Minuten. Parken gratis im Carport.</span></div>
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 10h12M9 21l-2 1M15 21l2 1M9 14h.01M15 14h.01"/></svg><span><b>Mit der Bahn</b>Mit der Erlauftalbahn ab Pöchlarn bis Scheibbs.</span></div>
        <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg><span><b>Adresse</b>Gamingerstraße 69, 3270 Scheibbs</span></div>
      </div>
    </div>
  </div>
</section>
</main>

<dialog class="rd" id="rd" aria-labelledby="rdH">
  <button class="rd__x" type="button" id="rdX" aria-label="Schließen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  <div class="rd__in">
    <div class="rd__img"><img id="rdImg" src="assets/img/zimmer1-1200.webp" alt="" width="1200" height="900"></div>
    <div class="rd__b"><span class="k" id="rdK"></span><h3 id="rdH"></h3><p id="rdP"></p><ul class="list" id="rdL"></ul><div class="price" style="text-align:left"><b id="rdPrice"></b><small id="rdPs"></small></div><a class="btn btn--f" href="#buchen" id="rdBook">Freie Tage ansehen</a></div>
  </div>
</dialog>

<footer>
  <div class="wrap">
    <div class="foot">
      <div><a class="logo" href="#top"><img src="assets/img/stempel.svg" alt="" width="48" height="48"><span><b>Pension <em>Butter</em></b><small>Bed &amp; Breakfast · Scheibbs</small></span></a>
        <p style="margin-top:16px;max-width:38ch">Frühstückspension im Gasthof Butter, seit mehr als 70 Jahren in Familienbesitz. Wir freuen uns auf deinen Besuch.</p></div>
      <div><h3>Adresse</h3>Gasthof Butter · Frühstückspension<br>Gamingerstraße 69, 3270 Scheibbs<br><a href="tel:+43748200000" data-demo-tel>07482 / 000 00</a><br><a href="#buchen">Zimmer anfragen</a></div>
      <div><h3>Gut zu wissen</h3>Check-in ab 13:00<br>Check-out bis 11:00<br><a href="https://www.instagram.com/pension_butter/" target="_blank" rel="noopener">Instagram</a></div>
    </div>
    <div class="demo-note"><span>Impressum · Datenschutz</span><a class="foot__tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a></div>
    <p style="margin-top:14px;font-size:12.5px;color:#b3a48f">Fotos im Entwurf: Pexels (Skyler Ewing, Curtis Adams, Anastasia Prideina, Çiğdem Gökçe, Gustavo Galeano Maz, Sami Abdullah, Karola G, Polina Tankilevitch, Nadin Sh, Lucie Liz, Finn Kuhn, Mikhail Nilov). Auf der fertigen Seite kommen Ihre eigenen Bilder hinein. Telefonnummer und Belegung sind Platzhalter.</p>
  </div>
</footer>
<script src="assets/app.js?v=1" defer></script>
</body>
</html>
