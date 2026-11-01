<?php require __DIR__ . "/_gate.php"; ?>
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Mary's Tattoo Studio Gresten · Dotwork, Pepper Shading, Colour, Black &amp; Grey</title>
<meta name="description" content="Mary's Tattoo Studio in Gresten: Tattoos von Mary Wochner seit 2012. Dotwork, Pepper Shading, Colour und Black &amp; Grey, Tiermotive mit Herz. Beratung jeden ersten Donnerstag im Monat ohne Termin.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0f0e0d">
<link rel="preload" href="assets/fonts/syne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/img/hero-640.webp" as="image" media="(max-width: 800px)">
<link rel="preload" href="assets/img/hero.webp" as="image" media="(min-width: 801px)">
<link rel="stylesheet" href="assets/style.css?v=2">
<script>document.documentElement.classList.add("js");</script>
<script src="assets/app.js?v=2" defer></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  "name": "Mary's Tattoo Studio",
  "description": "Tattoostudio in Gresten: Dotwork, Pepper Shading, Colour und Black & Grey. Tätowiert wird nach Termin, Beratung jeden ersten Donnerstag im Monat.",
  "founder": {"@type": "Person", "name": "Mary Wochner", "jobTitle": "Tattoo-Künstlerin"},
  "foundingDate": "2012",
  "address": {"@type": "PostalAddress", "streetAddress": "Schönauergasse 3a", "postalCode": "3264", "addressLocality": "Gresten", "addressRegion": "Niederösterreich", "addressCountry": "AT"},
  "areaServed": ["Gresten", "Bezirk Scheibbs", "Mostviertel"],
  "sameAs": ["https://www.instagram.com/tattoo.mary.gresten/", "https://www.facebook.com/tattoobindestrichgresten/", "https://www.threads.net/@tattoo.mary.gresten"]
}
</script>
</head>
<body>

<a class="skip" href="#stile">Direkt zu den Stilen</a>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Mary's Tattoo Studio, nach oben">
    <span class="brand__sig">Mary's</span>
    <span class="brand__sub">Tattoo Studio · Gresten</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#stile">Stile</a>
    <a href="#labor">Stil-Labor</a>
    <a href="#mary">Über Mary</a>
    <a href="#beratung">Beratung</a>
    <a href="#ablauf">Ablauf</a>
  </nav>
  <a class="btn btn--teal nav__cta" href="#anfrage">Termin anfragen</a>
  <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>

<div class="menu" id="menu" hidden>
  <nav aria-label="Menü">
    <a href="#stile">Stile</a>
    <a href="#labor">Stil-Labor</a>
    <a href="#mary">Über Mary</a>
    <a href="#beratung">Beratungsabend</a>
    <a href="#specials">Specials</a>
    <a href="#ablauf">So läuft's ab</a>
    <a href="#fragen">Fragen</a>
    <a class="btn btn--teal" href="#anfrage">Termin anfragen</a>
  </nav>
</div>

<main id="top">

  <!-- Startbild -->
  <section class="hero">
    <canvas class="hero__dots" id="mandala" aria-hidden="true"></canvas>
    <div class="wrap hero__in">
      <div class="hero__text">
        <p class="eyebrow reveal">Tattoos seit 2012 · Gresten</p>
        <h1 class="reveal">Tattoos mit <span class="nw"><span class="ink">Gefühl</span>,</span> gestochen für <em>dich</em>.</h1>
        <p class="lead reveal">Dotwork, Pepper Shading, Colour und Black &amp; Grey. Einzelstücke, die zu deiner Persönlichkeit passen, von zarten Linien bis zum Porträt deines Lieblingstiers.</p>
        <div class="hero__cta reveal">
          <a class="btn btn--teal" href="#anfrage">Termin anfragen</a>
          <a class="btn btn--line" href="#labor">Dein Tier im Stil-Labor</a>
        </div>
        <a class="hero__next reveal" href="#beratung">
          <span class="pulse" aria-hidden="true"></span>
          <span>Nächster Beratungsabend: <strong data-next-beratung>erster Donnerstag im Monat</strong></span>
        </a>
      </div>
      <figure class="hero__pic reveal">
        <div class="arch">
          <picture>
            <source media="(max-width: 800px)" srcset="assets/img/hero-640.webp">
            <img src="assets/img/hero.webp" alt="Tätowiererin mit Handschuhen arbeitet mit der Maschine an einem Arm" width="1100" height="1650" fetchpriority="high">
          </picture>
        </div>
        <figcaption class="hero__sig" aria-hidden="true">Mary</figcaption>
      </figure>
    </div>
  </section>

  <!-- Laufband -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker__track">
      <span>Dotwork</span><i></i><span>Pepper Shading</span><i></i><span>Colour</span><i></i><span>Black &amp; Grey</span><i></i><span>Tiere &amp; Pferde</span><i></i><span>Einzelstücke</span><i></i>
      <span>Dotwork</span><i></i><span>Pepper Shading</span><i></i><span>Colour</span><i></i><span>Black &amp; Grey</span><i></i><span>Tiere &amp; Pferde</span><i></i><span>Einzelstücke</span><i></i>
    </div>
  </div>

  <!-- Stile -->
  <section class="paper sec" id="stile">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow eyebrow--dark">Vier Stile, eine Handschrift</p>
        <h2>Was Mary am liebsten sticht</h2>
        <p class="head__lead">Jeder Stil hat seine eigene Wirkung. In der Beratung findet ihr gemeinsam heraus, was zu deinem Motiv passt.</p>
      </div>
      <div class="styles">
        <article class="style reveal" data-tilt>
          <div class="style__icon"><svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><circle cx="32" cy="32" r="4"/><circle cx="32" cy="18" r="3"/><circle cx="32" cy="46" r="3"/><circle cx="18" cy="32" r="3"/><circle cx="46" cy="32" r="3"/><circle cx="22" cy="22" r="2.2"/><circle cx="42" cy="22" r="2.2"/><circle cx="22" cy="42" r="2.2"/><circle cx="42" cy="42" r="2.2"/><circle cx="32" cy="8" r="1.6"/><circle cx="32" cy="56" r="1.6"/><circle cx="8" cy="32" r="1.6"/><circle cx="56" cy="32" r="1.6"/><circle cx="15" cy="15" r="1.2"/><circle cx="49" cy="15" r="1.2"/><circle cx="15" cy="49" r="1.2"/><circle cx="49" cy="49" r="1.2"/></g></svg></div>
          <h3>Dotwork</h3>
          <p>Motive aus tausenden einzelnen Punkten. Mandalas, Ornamente und geometrische Formen mit feiner Tiefe.</p>
          <button class="style__try" type="button" data-try="dotwork">Im Stil-Labor ansehen</button>
        </article>
        <article class="style reveal" data-tilt>
          <div class="style__icon"><svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor" id="pepper-ico"></g></svg></div>
          <h3>Pepper Shading</h3>
          <p>Schattierung wie fein gestreuter Pfeffer. Weiche Übergänge, die lebendig wirken und schön altern.</p>
          <button class="style__try" type="button" data-try="pepper">Im Stil-Labor ansehen</button>
        </article>
        <article class="style style--colour reveal" data-tilt>
          <div class="style__icon"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="26" r="14" fill="#e0607e" opacity=".9"/><circle cx="40" cy="26" r="14" fill="#3cc4b4" opacity=".85"/><circle cx="32" cy="40" r="14" fill="#f2b33d" opacity=".85"/></svg></div>
          <h3>Colour</h3>
          <p>Kräftige Farben, die leuchten. Mary liebt farbenfrohe Designs, von Blumen bis zu Fantasie-Motiven.</p>
          <button class="style__try" type="button" data-try="colour">Im Stil-Labor ansehen</button>
        </article>
        <article class="style reveal" data-tilt>
          <div class="style__icon"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="bg-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity=".1"/></linearGradient></defs><circle cx="32" cy="32" r="22" fill="url(#bg-g)"/><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>
          <h3>Black &amp; Grey</h3>
          <p>Schwarz und feine Grautöne für Porträts, Realismus und Motive mit viel Ausdruck.</p>
          <button class="style__try" type="button" data-try="bw">Im Stil-Labor ansehen</button>
        </article>
      </div>
    </div>
  </section>

  <!-- Stil-Labor -->
  <section class="sec labor" id="labor">
    <div class="wrap labor__in">
      <div class="labor__text reveal">
        <p class="eyebrow">Stil-Labor</p>
        <h2>Wie sähe dein Tier als Tattoo aus?</h2>
        <p>Pferde und Tiere sind Marys Herzensthema. Wähle ein Tier oder ein eigenes Foto, dann einen Stil, und zieh den Regler. So bekommst du ein erstes Gefühl, bevor ihr euch in der Beratung das echte Motiv überlegt.</p>

        <fieldset class="chips" aria-label="Tier wählen">
          <legend>1 · Motiv</legend>
          <button type="button" class="chip is-on" data-animal="pferd" aria-pressed="true">Pferd</button>
          <button type="button" class="chip" data-animal="hund" aria-pressed="false">Hund</button>
          <button type="button" class="chip" data-animal="katze" aria-pressed="false">Katze</button>
          <label class="chip chip--file">Eigenes Foto<input type="file" id="ownPhoto" accept="image/jpeg,image/png,image/webp,image/*"></label>
        </fieldset>
        <fieldset class="chips" aria-label="Stil wählen">
          <legend>2 · Stil</legend>
          <button type="button" class="chip is-on" data-style="dotwork" aria-pressed="true">Dotwork</button>
          <button type="button" class="chip" data-style="pepper" aria-pressed="false">Pepper Shading</button>
          <button type="button" class="chip" data-style="colour" aria-pressed="false">Colour</button>
          <button type="button" class="chip" data-style="bw" aria-pressed="false">Black &amp; Grey</button>
        </fieldset>
        <p class="labor__note">Dein Foto bleibt auf deinem Gerät, es wird nirgends hochgeladen. Die Vorschau ist nur eine Spielerei, das echte Motiv zeichnet Mary von Hand.</p>
      </div>

      <div class="compare reveal" id="compare" style="--pos:55%">
        <img id="labImg" src="assets/img/pferd.webp" alt="Foto: braunes Pferd vor schwarzem Hintergrund" width="720" height="900">
        <canvas id="labCanvas" width="720" height="900" aria-hidden="true"></canvas>
        <span class="compare__tag compare__tag--l" id="labStyleName">Dotwork</span>
        <span class="compare__tag compare__tag--r">Foto</span>
        <span class="compare__line" aria-hidden="true"><span class="compare__knob"></span></span>
        <input class="compare__range" id="labRange" type="range" min="0" max="100" value="55" aria-label="Vergleich Tattoo-Stil und Foto verschieben">
      </div>
    </div>
  </section>

  <!-- Über Mary -->
  <section class="paper sec" id="mary">
    <div class="wrap about">
      <figure class="about__pic reveal">
        <img src="assets/img/studio.webp" alt="Tattoostudio mit dunklen Wänden, Hirschgeweih und Arbeitsplätzen" width="900" height="1350" loading="lazy">
        <span class="about__stamp" aria-hidden="true">seit<br><b>2012</b></span>
      </figure>
      <div class="about__text reveal">
        <p class="eyebrow eyebrow--dark">Über Mary</p>
        <h2>Keine Tattoos von der Stange.</h2>
        <p>Ich bin Mary Wochner und tätowiere seit 2012 in meinem Studio in Gresten. Ich arbeite in vielen Stilen, von bunten Farbtattoos bis zu Black &amp; Grey, und am liebsten mit kräftigen Farben.</p>
        <p>Mein Ziel ist ein Einzelstück, das zu dir passt. Ob Erinnerung an einen Menschen, an ein Tier oder einfach ein kleines Symbol, das dir am Herzen liegt: Wir nehmen uns Zeit, bis das Motiv stimmt.</p>
        <div class="facts">
          <div><b data-count="2012">2012</b><span>tätowiere ich in Gresten</span></div>
          <div><b>4</b><span>Stile, eine Handschrift</span></div>
          <div><b>1×</b><span>im Monat offener Beratungsabend</span></div>
        </div>
        <p class="about__sig" aria-hidden="true">Mary</p>
      </div>
    </div>
  </section>

  <!-- Beratungsabend -->
  <section class="sec beratung" id="beratung">
    <div class="wrap beratung__in">
      <div class="reveal">
        <p class="eyebrow">Ohne Termin vorbeikommen</p>
        <h2>Beratungs&shy;abend, jeden ersten Donnerstag im Monat</h2>
        <p>Einfach vorbeikommen und unverbindlich beraten lassen. Bring deine Idee, Fotos oder Skizzen mit. Tätowiert wird danach nur mit Termin.</p>
        <div class="beratung__cta">
          <button class="btn btn--teal" type="button" id="icsBtn">In meinen Kalender</button>
          <a class="btn btn--line" href="https://www.google.com/maps/search/?api=1&amp;query=Sch%C3%B6nauergasse+3a%2C+3264+Gresten" target="_blank" rel="noopener">Route planen</a>
        </div>
      </div>
      <div class="cal reveal" aria-live="polite">
        <div class="cal__top">
          <span class="cal__month" data-cal-month>November</span>
          <span class="cal__time">16:30 – 19:30</span>
        </div>
        <div class="cal__day"><b data-cal-day>5</b><span data-cal-wd>Donnerstag</span></div>
        <p class="cal__in" data-cal-in>&nbsp;</p>
        <ul class="cal__list" data-cal-list></ul>
        <p class="cal__addr">Schönauergasse 3a · 3264 Gresten</p>
      </div>
    </div>
  </section>

  <!-- Specials -->
  <section class="paper sec" id="specials">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow eyebrow--dark">Specials</p>
        <h2>Aktionen mit festen Terminen</h2>
        <p class="head__lead">Ein paarmal im Jahr gibt es Specials mit kleinen Motiven und fixen Zeiten. Hier siehst du sie zuerst.</p>
      </div>
      <div class="flash">
        <article class="flash__card flash__card--past reveal">
          <span class="flash__stamp">Danke!</span>
          <p class="flash__kicker">Halloween Special</p>
          <h3>Kleine Tattoos, gro<span class="sz">ß</span>e Bedeutung</h3>
          <p>Ob als Erinnerung an einen geliebten Menschen, ein Tier oder einfach als kleines Symbol: Am 31. Oktober hat jeder sein persönliches Lieblingsmotiv gefunden.</p>
          <ul>
            <li>Samstag, 31. Oktober, ab 15 Uhr</li>
            <li>3 feste Termine pro Stunde</li>
            <li>Nur mit Voranmeldung</li>
          </ul>
        </article>
        <article class="flash__card flash__card--next reveal">
          <p class="flash__kicker">Nächstes Special</p>
          <h3>Kommt bald.</h3>
          <p>Das nächste Special steht hier und auf Instagram, sobald die Termine fix sind. Die Plätze sind begrenzt, also früh dran sein lohnt sich.</p>
          <a class="btn btn--dark" href="https://www.instagram.com/tattoo.mary.gresten/" target="_blank" rel="noopener">Auf Instagram folgen</a>
        </article>
      </div>
    </div>
  </section>

  <!-- Ablauf -->
  <section class="sec ablauf" id="ablauf">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow">So läuft's ab</p>
        <h2>Von der Idee zur Haut</h2>
      </div>
      <div class="steps-wrap" id="steps">
      <svg class="steps__line" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 10 100"><path d="M5 0 V100" pathLength="1"/></svg>
      <ol class="steps">
        <li class="step reveal">
          <span class="step__no">01</span>
          <div><h3>Idee schicken</h3><p>Schreib eine Nachricht oder nutz das Formular unten. Fotos und Skizzen helfen.</p></div>
        </li>
        <li class="step reveal">
          <span class="step__no">02</span>
          <div><h3>Beraten lassen</h3><p>Am Beratungsabend oder per Nachricht klärt ihr Stil, Größe und Körperstelle.</p></div>
          <img src="assets/img/skizze.webp" alt="Hände zeichnen ein Motiv in ein Skizzenbuch" width="1000" height="666" loading="lazy">
        </li>
        <li class="step reveal">
          <span class="step__no">03</span>
          <div><h3>Entwurf</h3><p>Mary zeichnet dein Motiv. Passt etwas noch nicht, wird es angepasst.</p></div>
          <img src="assets/img/entwurf.webp" alt="Zeichnerin entwirft ein Motiv auf einem Grafiktablett" width="800" height="1200" loading="lazy">
        </li>
        <li class="step reveal">
          <span class="step__no">04</span>
          <div><h3>Tattoo-Termin &amp; Pflege</h3><p>Am Termin wird gestochen. Danach bekommst du die Pflegeanleitung mit, damit dein Tattoo schön verheilt.</p></div>
          <img src="assets/img/arbeit.webp" alt="Tätowierer mit blauen Handschuhen sticht ein Motiv auf ein Bein" width="1000" height="668" loading="lazy">
        </li>
      </ol>
      </div>
    </div>
  </section>

  <!-- Galerie -->
  <section class="paper sec" id="galerie">
    <div class="wrap">
      <div class="head reveal">
        <p class="eyebrow eyebrow--dark">Galerie</p>
        <h2>Frisch gestochen</h2>
        <p class="head__lead">Hier kommen Marys eigene Arbeiten hinein, auf Wunsch automatisch aus Instagram. Im Entwurf stehen Platzhalterbilder.</p>
      </div>
      <div class="gallery">
        <figure class="reveal"><img src="assets/img/g1.webp" alt="Platzhalter: Tätowierer arbeitet an einem großen Rückenmotiv" width="800" height="1200" loading="lazy"><figcaption>Platzhalter</figcaption></figure>
        <figure class="reveal"><img src="assets/img/dotwork.webp" alt="Platzhalter: geometrisches Dotwork-Motiv wird gestochen" width="900" height="1277" loading="lazy"><figcaption>Platzhalter</figcaption></figure>
        <figure class="reveal"><img src="assets/img/g2.webp" alt="Platzhalter: feine Linie wird an einer Schulter gestochen" width="800" height="1200" loading="lazy"><figcaption>Platzhalter</figcaption></figure>
      </div>
      <p class="gallery__more reveal"><a class="btn btn--dark" href="https://www.instagram.com/tattoo.mary.gresten/" target="_blank" rel="noopener">Über 500 Beiträge auf Instagram</a></p>
    </div>
  </section>

  <!-- Fragen -->
  <section class="sec fragen" id="fragen">
    <div class="wrap fragen__in">
      <div class="head reveal">
        <p class="eyebrow">Gut zu wissen</p>
        <h2>Häufige Fragen</h2>
      </div>
      <div class="faq">
        <details class="reveal">
          <summary>Wie bekomme ich einen Termin?</summary>
          <p>Schreib eine Nachricht über das Formular, auf Instagram oder Facebook, oder komm zum Beratungsabend am ersten Donnerstag im Monat. Tätowiert wird nur nach Termin.</p>
        </details>
        <details class="reveal">
          <summary>Kann ich mein Haustier tätowieren lassen?</summary>
          <p>Sehr gerne, Tiere und Pferde sind Marys Herzensthema. Bring ein paar scharfe Fotos mit, am besten mit gutem Licht auf Augen und Fell.</p>
        </details>
        <details class="reveal">
          <summary>Was kostet ein Tattoo?</summary>
          <p>Das hängt von Größe, Stil und Körperstelle ab. Nach der Beratung weißt du genau, womit du rechnen kannst.</p>
        </details>
        <details class="reveal">
          <summary>Wie pflege ich mein frisches Tattoo?</summary>
          <p>Nach dem Termin bekommst du Marys Pflegeanleitung mit. Hier kann sie zusätzlich zum Nachlesen und Herunterladen stehen.</p>
        </details>
      </div>
    </div>
  </section>

  <!-- Anfrage -->
  <section class="paper sec" id="anfrage">
    <div class="wrap anfrage">
      <div class="anfrage__text reveal">
        <p class="eyebrow eyebrow--dark">Termin anfragen</p>
        <h2>Erzähl mir von deiner Idee.</h2>
        <p>Je mehr ich weiß, desto besser kann ich dich beraten. Ich melde mich so bald wie möglich bei dir.</p>
        <ul class="contact">
          <li><span>Studio</span><a href="https://www.google.com/maps/search/?api=1&amp;query=Sch%C3%B6nauergasse+3a%2C+3264+Gresten" target="_blank" rel="noopener">Schönauergasse 3a, 3264 Gresten</a></li>
          <li><span>Telefon</span><a href="tel:+436640000000">0664 000 00 00</a></li>
          <li><span>Instagram</span><a href="https://www.instagram.com/tattoo.mary.gresten/" target="_blank" rel="noopener">@tattoo.mary.gresten</a></li>
          <li><span>Facebook</span><a href="https://www.facebook.com/tattoobindestrichgresten/" target="_blank" rel="noopener">Mary's Tattoo Studio</a></li>
        </ul>
      </div>
      <form class="form reveal" id="form" novalidate>
        <fieldset class="chips chips--dark">
          <legend>Stil</legend>
          <label class="chip"><input type="radio" name="stil" value="Dotwork">Dotwork</label>
          <label class="chip"><input type="radio" name="stil" value="Pepper Shading">Pepper Shading</label>
          <label class="chip"><input type="radio" name="stil" value="Colour">Colour</label>
          <label class="chip"><input type="radio" name="stil" value="Black & Grey">Black &amp; Grey</label>
          <label class="chip"><input type="radio" name="stil" value="Weiß noch nicht">Weiß noch nicht</label>
        </fieldset>
        <fieldset class="chips chips--dark">
          <legend>Größe</legend>
          <label class="chip"><input type="radio" name="groesse" value="klein">Klein (bis 5 cm)</label>
          <label class="chip"><input type="radio" name="groesse" value="mittel">Mittel (Handfläche)</label>
          <label class="chip"><input type="radio" name="groesse" value="gross">Groß (Unterarm und mehr)</label>
        </fieldset>
        <div class="row">
          <label class="field"><span>Körperstelle</span>
            <select name="stelle">
              <option value="">Bitte wählen</option>
              <option>Unterarm</option><option>Oberarm / Schulter</option><option>Handgelenk</option><option>Bein / Wade</option><option>Rücken</option><option>Brust / Dekolleté</option><option>Andere Stelle</option>
            </select>
          </label>
          <label class="field"><span>Name *</span><input name="name" type="text" autocomplete="name" required></label>
        </div>
        <label class="field"><span>Telefon oder E-Mail *</span><input name="kontakt" type="text" autocomplete="email" required></label>
        <label class="field"><span>Deine Idee</span><textarea name="idee" rows="4" placeholder="z. B. Porträt meines Pferdes in Pepper Shading am Unterarm"></textarea></label>
        <label class="file"><input type="file" name="fotos" accept="image/*" multiple><span>Fotos oder Skizzen anhängen</span><small id="fileInfo">optional</small></label>
        <button class="btn btn--dark btn--wide" type="submit">Anfrage senden</button>
        <p class="form__ok" id="formOk" hidden role="status">Danke! Im fertigen Auftritt landet deine Anfrage direkt bei Mary. Im Entwurf wird nichts verschickt.</p>
        <p class="form__err" id="formErr" hidden role="alert">Bitte Name und Telefon oder E-Mail angeben.</p>
      </form>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <div>
      <p class="foot__sig">Mary's</p>
      <p class="foot__sub">Tattoo Studio · Gresten</p>
    </div>
    <div>
      <p><b>Studio</b><br>Schönauergasse 3a<br>3264 Gresten</p>
    </div>
    <div>
      <p><b>Beratung</b><br>Jeden ersten Donnerstag im Monat<br>16:30 – 19:30, ohne Termin</p>
    </div>
    <div class="foot__social">
      <a href="https://www.instagram.com/tattoo.mary.gresten/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.facebook.com/tattoobindestrichgresten/" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.threads.net/@tattoo.mary.gresten" target="_blank" rel="noopener">Threads</a>
    </div>
  </div>
  <div class="wrap foot__bottom">
    <span>© 2012–2026 Mary Wochner</span>
    <span><button type="button" class="linkish" data-toast="Impressum und Datenschutz kommen in den fertigen Auftritt.">Impressum</button> · <button type="button" class="linkish" data-toast="Impressum und Datenschutz kommen in den fertigen Auftritt.">Datenschutz</button></span>
  </div>
</footer>

<a class="tk" href="https://tim-kofler.at" target="_blank" rel="noopener"><img src="assets/img/tk-logo.svg" alt="" width="34" height="17">Entwurf von Tim Kofler</a>
<div class="toast" id="toast" role="status" hidden></div>

</body>
</html>
