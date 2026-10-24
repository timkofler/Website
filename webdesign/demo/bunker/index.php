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
<link rel="stylesheet" href="assets/style.css?v=17ee6a2e">
<link rel="stylesheet" href="assets/v2.css?v=2">
<script src="assets/early.js?v=2"></script>
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
    <svg class="nav__logo" viewBox="-30 -30 1060 1060" aria-hidden="true"><use href="#logo"/><g class="spark"><path d="M164 0L164 90C164 40 125 5 70 0C125 5 164 40 164 90L164 420L164 595C150 540 90 506 0 506C90 506 150 475 164 420L164 595L164 905C164 960 110 1000 40 1000C110 1000 164 960 164 905L164 908A85 85 0 0 0 334 908L334 0L500 0L500 500L664 1000L664 500L830 500L1000 1000L830 1000L830 500L830 0L900 0C960 0 1000 30 1000 85L1000 380C1000 460 950 500 880 500L830 500L664 500L664 0L500 500L500 1000L334 0L500 0L664 0L830 0L900 0L1000 0L1000 85L1000 380L1000 1000L830 1000L664 1000L500 1000L40 1000L0 1000L0 506L0 0L70 0L164 0"/></g></svg>
    <span>bunker<b>.</b>kollektiv</span>
  </a>
  <nav class="nav__links" aria-label="Hauptmenü">
    <a href="#termine">Termine</a>
    <a href="#reihen">Reihen</a>
    <a href="#bunker">Der Bunker</a>
    <a href="#mitmachen">Mitmachen</a>
    <a href="#anfahrt">Anfahrt</a>
    <a class="nav__portal v2only" href="#portal">Vereinsportal</a>
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
  <a class="nav__portal v2only" href="#portal">Vereinsportal</a>
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

  <!-- Vereinsportal (nur Version 2) -->
  <section class="portal v2only" id="portal" aria-labelledby="portal-title">
    <div class="wrap">
      <div class="sechead reveal">
        <p class="kicker">Vereinsportal</p>
        <h2 id="portal-title">Der Verein läuft im Bunker. Und hier.</h2>
        <p>Termine, Helfer, Mitglieder, Kassa und Anfragen an einem Ort, direkt auf der eigenen Webseite. Ohne Abo, ohne fünf verschiedene Apps. Probier's aus, die Demo speichert nur in deinem Browser.</p>
      </div>

      <div class="pt reveal" data-pt>
        <div class="pt__bar">
          <span class="pt__brand"><svg class="pt__logo" viewBox="-30 -30 1060 1060" aria-hidden="true"><use href="#logo"/></svg><span>Vereinsportal</span></span>
          <span class="pt__demo">Demo</span>
          <span class="pt__who" data-pt-who hidden><i aria-hidden="true">LA</i><span>Lena A. · Vorstand</span></span>
          <button class="pt__out" type="button" data-pt-out hidden>Abmelden</button>
        </div>

        <div class="pt__body">
          <nav class="pt__tabs" role="tablist" aria-label="Bereiche im Vereinsportal" data-pt-tabs>
            <span class="pt__blob" aria-hidden="true"></span>
            <button role="tab" aria-selected="true" aria-controls="pp-home" id="pt-home" data-pt-tab="home"><svg aria-hidden="true"><use href="#pi-home"/></svg><span>Übersicht</span></button>
            <button role="tab" aria-selected="false" aria-controls="pp-termine" id="pt-termine" data-pt-tab="termine" tabindex="-1"><svg aria-hidden="true"><use href="#pi-cal"/></svg><span>Termine</span></button>
            <button role="tab" aria-selected="false" aria-controls="pp-helfer" id="pt-helfer" data-pt-tab="helfer" tabindex="-1"><svg aria-hidden="true"><use href="#pi-hand"/></svg><span>Helfer</span><b data-pt-cnt="helfer"></b></button>
            <button role="tab" aria-selected="false" aria-controls="pp-mitglieder" id="pt-mitglieder" data-pt-tab="mitglieder" tabindex="-1"><svg aria-hidden="true"><use href="#pi-users"/></svg><span>Mitglieder</span></button>
            <button role="tab" aria-selected="false" aria-controls="pp-kassa" id="pt-kassa" data-pt-tab="kassa" tabindex="-1"><svg aria-hidden="true"><use href="#pi-cash"/></svg><span>Kassa</span></button>
            <button role="tab" aria-selected="false" aria-controls="pp-anfragen" id="pt-anfragen" data-pt-tab="anfragen" tabindex="-1"><svg aria-hidden="true"><use href="#pi-inbox"/></svg><span>Anfragen</span><b data-pt-cnt="anfragen"></b></button>
          </nav>

          <div class="pt__main">
            <!-- Übersicht -->
            <section class="pp" id="pp-home" role="tabpanel" aria-labelledby="pt-home">
              <div class="pp__hd"><h3>Servus, Lena.</h3><p data-pt-hello>Das steht diese Woche an.</p></div>
              <div class="kp">
                <button type="button" class="kp__t kp__t--next" data-go="termine"><small>Nächstes Event</small><b data-pt-next>Halloween Special</b><span data-pt-next-d></span></button>
                <button type="button" class="kp__t" data-go="helfer"><small>Helfer offen</small><b data-pt-free>0</b><span data-pt-free-s>Schichten fürs nächste Event</span></button>
                <button type="button" class="kp__t" data-go="mitglieder"><small>Mitglieder</small><b data-pt-mem>0</b><span data-pt-mem-s></span></button>
                <button type="button" class="kp__t" data-go="kassa"><small>Kassastand</small><b data-pt-cash>0 €</b><span data-pt-cash-s>laut Kassabuch</span></button>
              </div>
              <div class="pp__cols">
                <div class="gl">
                  <h4>Zuletzt passiert</h4>
                  <ul class="feed" data-pt-feed></ul>
                </div>
                <div class="gl">
                  <h4>Schnell erledigt</h4>
                  <div class="quick">
                    <button type="button" data-go="termine"><svg aria-hidden="true"><use href="#pi-plus"/></svg>Termin eintragen</button>
                    <button type="button" data-go="helfer"><svg aria-hidden="true"><use href="#pi-hand"/></svg>Helfer einteilen</button>
                    <button type="button" data-go="kassa"><svg aria-hidden="true"><use href="#pi-cash"/></svg>Kassa-Eintrag</button>
                    <button type="button" data-go="mitglieder" data-filter="offen"><svg aria-hidden="true"><use href="#pi-mail"/></svg>Beitrag erinnern</button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Termine -->
            <section class="pp" id="pp-termine" role="tabpanel" aria-labelledby="pt-termine" hidden>
              <div class="pp__hd"><h3>Neuer Termin in einer Minute.</h3><p>Foto rein, Titel und Datum dazu. Der Termin steht sofort auf der Webseite, mit Countdown und Kalender-Knopf.</p></div>
              <div class="pt__grid">
                <form class="gl pf" data-pt-form novalidate>
                  <label class="pf__drop" data-pt-drop>
                    <input type="file" accept="image/*" data-pt-file>
                    <span class="pf__empty"><svg aria-hidden="true"><use href="#pi-cam"/></svg><b>Foto auswählen</b><small>oder hierher ziehen</small></span>
                    <img alt="" hidden data-pt-img>
                  </label>
                  <label class="pf__f"><span>Titel</span><input name="title" maxlength="60" required placeholder="z. B. Bunker Rock Fest"></label>
                  <div class="pf__row">
                    <label class="pf__f"><span>Datum</span><input type="date" name="d" required></label>
                    <label class="pf__f"><span>Beginn</span><input type="time" name="t" value="19:00"></label>
                  </div>
                  <label class="pf__f"><span>Bands oder Untertitel <i>(optional)</i></span><input name="sub" maxlength="90" placeholder="z. B. mit Planet Error"></label>
                  <fieldset class="pf__chips"><legend>Reihe</legend><div data-pt-chips></div></fieldset>
                  <p class="pf__err" role="alert" data-pt-err hidden></p>
                  <div class="pf__btns">
                    <button class="btn btn--neon" type="submit">Veröffentlichen</button>
                    <button class="btn btn--ghost" type="button" data-pt-sample>Beispiel ausfüllen</button>
                  </div>
                </form>
                <div class="pv2">
                  <p class="pv2__lbl">So sieht's auf der Webseite aus</p>
                  <article class="pv2__card" data-pt-pv>
                    <div class="pv2__media"><img alt="" hidden data-pt-pv-img><span>Dein Foto</span></div>
                    <div class="pv2__body"><small>Als Nächstes im Bunker</small><b data-pt-pv-t>Dein Event</b><span data-pt-pv-d>Datum wählen</span></div>
                  </article>
                  <h4>Eingetragen</h4>
                  <ul class="mine" data-pt-mine></ul>
                  <p class="pt__empty" data-pt-mine-empty>Noch nichts eingetragen. Der erste Termin erscheint sofort oben bei den Terminen.</p>
                </div>
              </div>
            </section>

            <!-- Helfer -->
            <section class="pp" id="pp-helfer" role="tabpanel" aria-labelledby="pt-helfer" hidden>
              <div class="pp__hd"><h3>Wer hilft beim <span data-pt-ev>nächsten Event</span>?</h3><p>Antippen und eintragen. Wer eingeteilt ist, bekommt eine Erinnerung am Vortag.</p></div>
              <div class="shifts" data-pt-shifts></div>
            </section>

            <!-- Mitglieder -->
            <section class="pp" id="pp-mitglieder" role="tabpanel" aria-labelledby="pt-mitglieder" hidden>
              <div class="pp__hd"><h3>Mitglieder</h3><p>Jahresbeitrag 25 €. Offene Beiträge mit einem Tipp erinnern.</p></div>
              <div class="mtools">
                <label class="msearch"><svg aria-hidden="true"><use href="#pi-search"/></svg><input type="search" placeholder="Name oder Aufgabe suchen" aria-label="Mitglieder suchen" data-pt-q></label>
                <div class="mfilter" role="group" aria-label="Filter" data-pt-mf>
                  <button type="button" aria-pressed="true" data-f="alle">Alle</button>
                  <button type="button" aria-pressed="false" data-f="offen">Beitrag offen</button>
                </div>
              </div>
              <ul class="mem" data-pt-mem-list></ul>
            </section>

            <!-- Kassa -->
            <section class="pp" id="pp-kassa" role="tabpanel" aria-labelledby="pt-kassa" hidden>
              <div class="pp__hd"><h3>Kassabuch</h3><p>Ein- und Ausgaben im Blick, für die Rechnungsprüfer als Tabelle zum Herunterladen.</p></div>
              <div class="cash">
                <div class="cash__sum">
                  <div><small>Einnahmen</small><b data-pt-in>0 €</b></div>
                  <div><small>Ausgaben</small><b data-pt-ausg>0 €</b></div>
                  <div class="is-total"><small>Kassastand</small><b data-pt-total>0 €</b></div>
                </div>
                <form class="cash__add gl" data-pt-cash-form>
                  <label class="pf__f"><span>Wofür</span><input name="txt" maxlength="50" placeholder="z. B. Getränke-Einkauf" required></label>
                  <label class="pf__f pf__f--sm"><span>Betrag €</span><input name="amt" inputmode="decimal" placeholder="0,00" required></label>
                  <div class="seg" role="group" aria-label="Art"><label><input type="radio" name="dir" value="in" checked><span>Einnahme</span></label><label><input type="radio" name="dir" value="out"><span>Ausgabe</span></label></div>
                  <button class="btn btn--neon" type="submit">Eintragen</button>
                </form>
                <ul class="book" data-pt-book></ul>
                <button class="btn btn--ghost cash__csv" type="button" data-pt-csv><svg aria-hidden="true"><use href="#pi-down"/></svg>Als Tabelle herunterladen</button>
              </div>
            </section>

            <!-- Anfragen -->
            <section class="pp" id="pp-anfragen" role="tabpanel" aria-labelledby="pt-anfragen" hidden>
              <div class="pp__hd"><h3>Anfragen</h3><p>Alles aus den Formularen unter „Mitmachen“: Mietanfragen, Bands und neue Mitglieder. Jede Anfrage kommt zusätzlich per E-Mail.</p></div>
              <ul class="anf2" data-pt-anf></ul>
            </section>
          </div>
        </div>

        <!-- Anmeldung -->
        <div class="pl" data-pt-login>
          <div class="pl__card">
            <div class="pl__hd"><svg class="pt__logo" viewBox="-30 -30 1060 1060" aria-hidden="true"><use href="#logo"/></svg><span><b>bunker.kollektiv</b><small>Vereinsportal · Anmeldung</small></span></div>
            <form class="pl__step" data-pl-1>
              <label class="pl__f"><svg aria-hidden="true"><use href="#pi-mail"/></svg><input type="email" value="lena@bunkerkollektiv.at" aria-label="E-Mail-Adresse" autocomplete="off" spellcheck="false"></label>
              <label class="pl__f"><svg aria-hidden="true"><use href="#pi-lock"/></svg><input type="password" value="bunker-demo" aria-label="Passwort" autocomplete="off"></label>
              <button class="btn btn--neon pl__btn" type="submit">Anmelden</button>
            </form>
            <div class="pl__step" data-pl-2 hidden>
              <p class="pl__t"><svg aria-hidden="true"><use href="#pi-shield"/></svg><span>Code aus der Authenticator-App</span></p>
              <p class="pl__s">Sechs Ziffern, die Prüfung startet von selbst. In der Demo passt jeder Code außer 000000.</p>
              <div class="otp" role="group" aria-label="Sechsstelliger Code" data-otp><span class="otp__c" style="--i:0"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 1"><i class="otp__r"></i></span><span class="otp__c" style="--i:1"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 2"><i class="otp__r"></i></span><span class="otp__c" style="--i:2"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 3"><i class="otp__r"></i></span><span class="otp__c" style="--i:3"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 4"><i class="otp__r"></i></span><span class="otp__c" style="--i:4"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 5"><i class="otp__r"></i></span><span class="otp__c" style="--i:5"><input inputmode="numeric" maxlength="1" aria-label="Ziffer 6"><i class="otp__r"></i></span><span class="otp__m" aria-hidden="true"><svg class="otp__ok" viewBox="0 0 24 24"><path d="m5.5 12.5 4.2 4.2L18.5 7.8"/></svg><svg class="otp__no" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg></span></div>
              <p class="otp__st" role="status" aria-live="polite"></p>
              <button type="button" class="pl__link" data-otp-fill>Code für die Demo einfügen</button>
            </div>
            <button type="button" class="pl__link pl__skip" data-pl-skip>Ohne Anmeldung ansehen</button>
          </div>
        </div>
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
          <a class="btn btn--neon" href="https://www.google.com/maps/dir/?api=1&amp;destination=Bunker.Kollektiv,+Schulgasse+3,+3251+Purgstall+an+der+Erlauf" target="_blank" rel="noopener">Route planen</a>
          <a class="btn btn--ghost" href="mailto:office@bunkerkollektiv.at">office@bunkerkollektiv.at</a>
        </div>
      </div>
      <a class="visit__map reveal" href="https://maps.google.com/?cid=15639215074559972523" target="_blank" rel="noopener" aria-label="bunker.kollektiv in Google Maps öffnen">
        <svg viewBox="0 0 800 600"><path class="m-green" d="M337 87L383 86L383 85L383 84L382 48L389 27L385 25L381 24L378 22L380 16L377 15L376 17L376 19L374 22L372 24L370 25L367 27L364 28L362 30L361 32L360 35L359 48L331 48L337 87ZM-41 637L-46 646L-52 660L24 664L26 668L74 669L72 700L22 700L21 754L67 757L76 784L77 832L92 833L91 734L95 660L96 647L83 640L-41 637ZM97 506L159 502L178 515L180 561L104 561L97 506ZM346 -48L345 -30L354 -30L355 -48L346 -48ZM371 -114L364 -64L366 -24L418 -27L433 -29L457 -115L422 -115L371 -114ZM464 544L469 616L582 609L566 533L464 544ZM487 645L487 648L490 693L580 686L577 645L570 640L487 645ZM649 638L679 639L685 728L691 745L694 773L700 798L697 801L646 803L645 776L610 778L608 740L653 737L649 638ZM761 538L740 550L787 630L788 632L810 618L761 538ZM334 -114L353 -114L371 -114L364 -64L366 -24L357 -23L328 -20L320 -20L331 -39L334 -114ZM151 -71L147 -49L157 -49L151 -71ZM619 459L619 474L620 478L628 480L634 480L633 490L629 493L623 514L679 503L664 423L641 428L641 434L611 443L619 459ZM29 48L29 56L31 113L71 108L79 41L29 48ZM140 -8L135 13L131 46L125 96L120 113L125 107L131 101L152 79L184 3L153 6L152 -10L140 -8Z"/><path class="m-wa" d="M1229 3367L1230 3318L1238 3312L1218 3176L1188 3086L1168 2995L1160 2963L1156 2939L1147 2874L1130 2804L1099 2743L1055 2695L1010 2645L906 2593L887 2592L849 2594L845 2593L836 2591L766 2568L690 2549L596 2518L558 2488L550 2471L546 2470L547 2467L545 2463L543 2462L544 2455L539 2446L536 2441L532 2435L527 2419L519 2409L520 2406L515 2400L517 2398L516 2389L510 2370L485 2286L486 2267L485 2246L452 2184L428 2130L421 2107L410 2053L410 2035L411 2028L411 2014L406 2003L404 1984L393 1916L378 1868L350 1813L308 1744L303 1728L281 1681L268 1668L261 1668L264 1658L264 1651L266 1647L265 1635L261 1597L263 1578L262 1560L259 1543L261 1511L263 1507L264 1501L267 1498L270 1498L273 1495L274 1492L282 1463L290 1419L299 1360L300 1289L310 1249L313 1215L300 1145L276 1067L272 1043L268 1016L274 1007L276 994L274 938L279 924L282 900L279 881L288 804L289 777L287 762L293 754L294 748L294 743L296 739L296 731L298 726L300 722L301 712L299 705L305 699L314 665L314 662L319 658L321 654L320 650L322 643L325 638L326 629L324 624L325 606L327 596L325 559L328 550L328 526L328 492L325 486L325 480L328 479L327 470L324 469L325 456L322 446L321 432L321 429L321 421L323 408L325 400L326 396L322 388L329 378L328 369L322 355L326 348L325 340L332 316L332 305L326 294L327 286L328 272L326 264L325 261L324 254L327 246L323 237L323 226L320 220L318 212L316 211L314 209L313 203L313 197L315 189L314 180L311 162L308 130L302 99L301 42L299 29L290 9L292 -20L299 -96L293 -118L290 -119L289 -121L289 -124L293 -126L292 -129L294 -140L293 -151L292 -160L289 -165L289 -173L278 -202L274 -223L274 -233L272 -278L273 -311L279 -327L280 -335L277 -341L275 -349L287 -364L289 -373L294 -378L303 -397L309 -407L312 -410L313 -416L324 -416L331 -425L336 -423L351 -434L353 -436L348 -438L361 -444L370 -443L393 -459L401 -459L413 -459L440 -467L468 -475L486 -481L490 -482L496 -486L502 -484L509 -486L509 -490L509 -496L514 -495L524 -499L522 -504L534 -518L539 -522L551 -545L557 -544L559 -563L572 -546L562 -532L556 -530L544 -511L537 -503L528 -493L519 -487L508 -474L489 -465L425 -451L396 -446L389 -435L385 -432L384 -427L380 -424L374 -418L372 -417L365 -415L362 -415L344 -390L339 -376L332 -358L315 -349L296 -321L293 -298L291 -255L295 -229L309 -159L309 -125L315 -79L306 -20L304 -5L305 3L314 22L318 33L319 97L327 142L324 150L328 156L333 172L327 194L330 201L330 206L335 213L335 230L338 244L340 255L341 260L343 267L343 272L346 276L348 277L348 279L344 278L341 278L341 280L343 291L345 293L346 299L346 308L343 315L344 325L346 327L347 328L347 330L346 331L344 335L345 339L341 348L341 355L341 360L344 363L345 366L339 370L339 375L351 392L350 393L348 393L351 408L347 408L343 426L353 429L349 447L347 455L349 455L350 456L346 484L346 499L348 502L347 509L348 512L348 518L346 523L347 532L351 538L352 552L350 563L349 571L350 583L346 592L343 605L343 618L346 632L347 644L341 666L340 672L327 719L325 729L321 738L322 748L317 756L318 767L315 796L304 899L298 923L289 1020L291 1042L295 1046L295 1054L298 1059L298 1071L300 1073L300 1082L302 1086L301 1093L304 1099L304 1104L302 1104L302 1106L304 1107L308 1108L307 1113L309 1120L313 1122L314 1125L314 1128L317 1134L319 1137L330 1162L329 1187L332 1211L335 1215L336 1224L338 1246L343 1247L330 1294L318 1408L305 1500L295 1522L292 1539L293 1556L287 1593L289 1658L304 1683L334 1739L338 1749L354 1776L366 1795L404 1883L411 1910L420 1968L424 2007L423 2032L435 2103L455 2150L494 2231L497 2270L522 2357L524 2371L529 2380L533 2394L530 2401L532 2410L534 2412L534 2417L550 2445L554 2460L565 2478L566 2480L573 2485L610 2511L668 2526L674 2528L682 2530L707 2536L710 2537L731 2543L746 2548L786 2560L790 2561L795 2563L804 2565L812 2567L827 2569L849 2574L854 2572L863 2568L877 2559L892 2561L909 2575L960 2592L1006 2620L1076 2680L1136 2759L1156 2815L1157 2831L1168 2870L1177 2928L1196 3016L1214 3076L1233 3157L1235 3171L1235 3197L1242 3247L1268 3337L1258 3338L1262 3362L1229 3367Z"/><path class="m-river" d="M-3224 6846L-3239 6843L-3246 6831L-3243 6817L-3228 6805L-3226 6800L-3224 6795L-3230 6782L-3240 6770L-3243 6751L-3233 6734L-3227 6727L-3218 6705L-3209 6671L-3198 6655L-3186 6643L-3177 6634L-3177 6625L-3183 6621L-3192 6614L-3197 6611L-3199 6604L-3195 6595L-3189 6588L-3187 6582L-3192 6571L-3197 6559L-3200 6549L-3199 6541L-3192 6535L-3174 6529L-3163 6523L-3159 6517L-3162 6506L-3172 6488L-3176 6478L-3173 6466L-3169 6445L-3160 6427L-3156 6421L-3155 6417L-3158 6413L-3172 6414L-3179 6417L-3185 6415L-3189 6411L-3188 6407L-3183 6403L-3171 6400L-3154 6390L-3131 6375L-3110 6374L-3097 6373L-3087 6363L-3084 6355L-3089 6347L-3097 6342L-3106 6332L-3112 6318L-3116 6305L-3113 6292L-3104 6273L-3105 6263L-3123 6191L-3134 6135L-3137 6119L-3154 6080L-3154 6068L-3149 6062L-3132 6054L-3130 6052L-3121 6044L-3116 6032L-3117 6021L-3121 6014L-3127 6005L-3122 5991L-3105 5973L-3095 5964L-3085 5962L-3077 5963L-3069 5968L-3059 5973L-3045 5974L-3032 5968L-3024 5964L-3016 5966L-3007 5978L-2993 5990L-2982 5993L-2967 5970L-2954 5953L-2947 5938L-2946 5925L-2954 5914L-2953 5901L-2944 5888L-2925 5877L-2903 5869L-2881 5852L-2866 5828L-2866 5777L-2856 5760L-2840 5752L-2800 5723L-2781 5719L-2781 5648L-2775 5631L-2758 5616L-2737 5595L-2711 5584L-2684 5557L-2673 5545L-2665 5514L-2684 5485L-2685 5462L-2679 5435L-2645 5415L-2625 5357L-2623 5325L-2638 5285L-2652 5272L-2666 5273L-2683 5278L-2700 5270L-2704 5257L-2692 5172L-2704 5110L-2697 5084L-2666 5032L-2683 4999L-2727 4923L-2735 4864L-2731 4833L-2719 4782L-2726 4742L-2727 4694L-2742 4666L-2758 4642L-2779 4632L-2801 4636L-2832 4639L-2852 4635L-2864 4629L-2874 4617L-2887 4583L-2891 4550L-2889 4505L-2878 4481L-2879 4467L-2887 4448L-2900 4426L-2905 4413L-2905 4364L-2914 4298L-2928 4269L-2938 4251L-2942 4219L-2949 4142L-2962 4073L-2954 4040L-2922 3962L-2890 3912L-2866 3908L-2836 3917L-2824 3914L-2818 3906L-2818 3893L-2830 3852L-2831 3831L-2824 3808L-2820 3779L-2827 3744L-2853 3693L-2853 3676L-2846 3675L-2834 3640L-2833 3594L-2859 3557L-2867 3513L-2879 3492L-2908 3457L-2913 3437L-2906 3415L-2887 3394L-2866 3344L-2847 3323L-2827 3314L-2789 3307L-2786 3292L-2801 3254L-2802 3237L-2797 3224L-2787 3208L-2781 3194L-2783 3182L-2796 3150L-2803 3116L-2813 3098L-2809 3075L-2796 3054L-2795 3031L-2809 3007L-2842 2965L-2850 2944L-2849 2928L-2839 2917L-2812 2912L-2775 2892L-2753 2871L-2736 2862L-2696 2863L-2697 2844L-2708 2815L-2718 2748L-2710 2695L-2717 2664L-2767 2580L-2774 2540L-2764 2517L-2731 2489L-2723 2471L-2717 2403L-2737 2367L-2743 2352L-2743 2331L-2752 2304L-2747 2289L-2670 2264L-2658 2241L-2651 2213L-2665 2170L-2696 2119L-2698 2089L-2684 2052L-2695 2011L-2686 1976L-2669 1958L-2640 1957L-2618 1970L-2612 1990L-2619 2008L-2624 2034L-2607 2062L-2562 2067L-2506 2055L-2467 2027L-2428 1969L-2423 1933L-2433 1801L-2421 1770L-2393 1752L-2383 1735L-2382 1713L-2389 1702L-2416 1661L-2423 1626L-2421 1573L-2470 1509L-2471 1501L-2468 1488L-2460 1479L-2447 1474L-2430 1468L-2358 1471L-2328 1483L-2308 1500L-2302 1501L-2297 1498L-2299 1436L-2316 1418L-2337 1393L-2343 1374L-2338 1352L-2311 1304L-2304 1275L-2313 1242L-2310 1226L-2301 1208L-2303 1196L-2327 1155L-2346 1138L-2352 1130L-2358 1105L-2358 1072L-2366 1050L-2380 1031L-2395 1019L-2413 1008L-2429 997L-2435 985L-2434 965L-2427 943L-2410 927L-2391 916L-2354 906L-2331 909L-2305 928L-2297 964L-2292 981L-2269 1000L-2242 1006L-2208 993L-2134 866L-2126 822L-2116 784L-2092 762L-2072 722L-2028 687L-1972 668L-1952 668L-1932 684L-1904 733L-1898 754L-1909 766L-1949 766L-1978 793L-1992 827L-1972 860L-1950 869L-1916 847L-1896 846L-1836 863L-1782 865L-1743 850L-1705 820L-1670 795L-1621 780L-1586 709L-1565 707L-1555 715L-1542 737L-1530 744L-1515 744L-1504 748L-1487 780L-1450 818L-1414 828L-1393 830L-1369 821L-1353 814L-1338 803L-1322 791L-1316 786L-1312 781L-1309 776L-1305 770L-1302 762L-1299 756L-1296 753L-1291 748L-1279 740L-1268 734L-1258 728L-1250 722L-1244 715L-1241 709L-1236 699L-1233 691L-1229 685L-1224 678L-1218 672L-1213 668L-1208 666L-1202 664L-1197 664L-1191 665L-1186 667L-1180 671L-1175 676L-1169 685L-1163 694L-1160 700L-1158 706L-1157 710L-1156 715L-1155 734L-1154 750L-1153 767L-1152 815L-1152 823L-1152 828L-1149 832L-1145 834L-1140 834L-1135 833L-1130 831L-1123 829L-1113 826L-1103 825L-1081 824L-1072 824L-1063 825L-1055 828L-1034 836L-1019 840L-1002 844L-988 846L-976 846L-968 846L-960 845L-952 844L-940 841L-931 839L-923 835L-915 832L-907 828L-901 823L-896 818L-891 813L-887 808L-883 802L-878 793L-875 787L-871 782L-867 778L-861 775L-834 760L-827 756L-821 751L-817 745L-816 739L-813 735L-809 730L-805 726L-801 724L-799 723L-794 723L-791 724L-787 727L-784 729L-781 730L-777 730L-773 730L-751 720L-740 716L-732 714L-727 713L-721 713L-713 713L-709 715L-705 717L-703 720L-701 725L-700 729L-699 735L-699 740L-700 749L-700 758L-700 772L-700 779L-701 785L-703 789L-705 794L-710 802L-714 810L-719 815L-722 817L-725 820L-727 824L-728 827L-728 831L-727 833L-724 835L-721 836L-718 838L-714 842L-712 846L-708 849L-704 851L-698 852L-669 851L-659 849L-647 846L-638 844L-629 840L-622 836L-616 830L-610 823L-607 817L-606 811L-606 806L-607 801L-609 796L-634 759L-635 756L-636 752L-637 748L-637 740L-638 731L-640 721L-642 712L-645 702L-648 690L-653 676L-656 667L-657 659L-658 651L-658 641L-657 629L-656 616L-654 606L-652 599L-649 594L-645 589L-640 586L-635 585L-629 586L-621 590L-613 595L-599 605L-594 609L-592 612L-592 614L-592 616L-595 629L-595 631L-595 636L-594 640L-591 645L-587 648L-582 651L-578 652L-573 653L-568 653L-563 652L-559 649L-552 644L-548 641L-543 639L-537 639L-532 639L-527 641L-522 644L-518 648L-515 652L-513 658L-511 670L-510 681L-510 693L-509 700L-507 704L-505 708L-502 711L-497 713L-492 715L-486 717L-481 717L-478 717L-476 716L-471 715L-464 713L-457 713L-450 713L-445 714L-441 715L-438 718L-435 721L-432 725L-431 729L-431 734L-431 739L-432 744L-436 757L-437 762L-437 768L-437 773L-436 779L-436 785L-436 792L-437 804L-436 810L-435 815L-432 819L-428 824L-425 826L-422 827L-418 827L-415 826L-412 826L-407 826L-400 827L-394 829L-388 830L-383 829L-379 828L-375 826L-373 822L-371 817L-369 812L-366 803L-361 795L-355 786L-348 778L-343 773L-337 769L-331 765L-325 762L-319 761L-312 759L-304 759L-295 760L-287 760L-281 760L-277 759L-273 757L-271 755L-268 752L-263 745L-260 737L-255 731L-250 724L-243 716L-239 708L-236 701L-233 692L-230 683L-230 675L-230 669L-231 663L-233 659L-236 654L-262 632L-264 628L-266 623L-268 616L-268 610L-266 601L-263 593L-260 585L-255 577L-250 573L-246 570L-242 568L-236 567L-229 567L-222 568L-207 574L-196 577L-186 579L-176 581L-166 581L-156 580L-149 579L-142 576L-136 571L-128 563L-117 552L-106 542L-95 533L-88 524L-82 515L-79 507L-76 497L-75 486L-74 473L-73 464L-70 456L-66 446L-61 437L-55 429L-49 421L-39 411L-33 404L-29 398L-26 393L-23 383L-21 379L-18 376L-16 374L-13 373L-10 373L22 375L28 374L32 373L36 370L38 367L40 363L43 360L47 358L52 356L62 354L67 353L72 352L75 350L78 349L82 348L85 348L87 346L89 344L90 341L91 339L93 334L95 330L103 317L113 300L116 295L118 289L123 277L127 268L129 264L132 261L134 257L136 253L139 249L141 246L143 244L144 241L146 236L146 232L146 228L144 225L143 222L138 214L135 208L134 204L133 200L133 196L132 192L132 189L130 185L129 182L128 178L127 172L127 166L128 161L129 156L130 152L132 147L133 143L134 140L134 136L134 128L135 119L135 114L137 109L139 105L142 101L155 85L158 81L160 77L162 73L163 65L165 59L168 54L170 50L173 45L175 39L177 33L179 29L182 25L188 18L190 15L191 12L191 10L194 -4L195 -7L197 -11L197 -14L197 -18L197 -21L196 -26L195 -32L193 -37L191 -42L187 -50L183 -57L182 -60L182 -63L181 -68L179 -72L177 -75L175 -78L173 -81L171 -85L168 -95L167 -99L166 -104L166 -111L167 -115L168 -119L170 -121L171 -123L173 -128L177 -140L180 -149L185 -161L188 -169L191 -177L192 -184L194 -191L196 -199L197 -207L197 -212L196 -218L195 -222L194 -225L192 -229L191 -232L191 -236L192 -241L195 -257L203 -296L205 -303L207 -308L211 -314L215 -319L219 -324L223 -329L228 -334L233 -337L236 -338L239 -339L243 -340L246 -340L249 -341L255 -344L260 -346L265 -348L270 -349L275 -349L295 -351M2924 8359L2935 8351L2998 8309L3079 8260L3128 8221L3165 8161L3187 8116L3192 8110L3227 8066L3288 8014L3331 7960L3353 7918L3367 7871L3370 7831L3369 7790L3359 7723L3345 7661L3302 7540L3234 7432L3212 7400L3199 7381L3197 7377L3150 7306L3145 7298L3137 7288L3113 7224L3084 7134L3043 7056L3027 7016L3005 6977L2962 6859L2928 6612L2883 6476L2864 6433L2831 6359L2774 6281L2701 6198L2682 6178L2651 6137L2601 6091L2499 5986L2376 5821L2339 5743L2321 5705L2263 5585L2184 5450L2109 5301L2032 5166L2021 5142L2016 5099L2008 5060L2005 5028L2001 4947L2000 4934L1986 4850L1954 4703L1942 4600L1912 4520L1858 4396L1799 4252L1697 3968L1663 3888L1646 3826L1631 3785L1588 3752L1519 3750L1422 3770L1383 3761L1349 3743L1319 3721L1303 3692L1299 3675L1305 3654L1311 3627L1314 3602L1312 3580L1289 3529L1263 3407L1260 3396L1255 3363L1247 3310L1243 3277L1229 3172L1197 3059L1174 2947L1166 2908L1150 2836L1141 2795L1091 2718L1018 2645L950 2603L936 2595L889 2572L860 2582L840 2582L717 2550L647 2529L644 2528L605 2514L572 2494L555 2471L544 2444L531 2421L525 2402L526 2388L499 2290L484 2233L429 2107L415 2033L411 1979L402 1915L386 1867L331 1756L308 1707L278 1660L278 1624L275 1592L276 1561L282 1520L290 1486L295 1454L306 1392L314 1325L321 1281L322 1263L325 1220L322 1189L319 1164L297 1107L288 1062L283 1015L290 921L304 784L305 768L307 752L316 702L324 678L335 644L334 610L339 580L336 472L337 450L334 432L334 420L333 378L332 357L332 346L337 329L339 305L337 292L335 277L335 266L324 208L322 171L311 98L309 29L301 6L300 -14L305 -79L297 -173L284 -225L283 -245L283 -304L286 -327L295 -351L317 -381L327 -395L331 -399L370 -436L394 -450L466 -464L495 -475L522 -494L558 -539L583 -644L594 -666L603 -687L616 -710L617 -715L617 -721L617 -724L617 -727L624 -761L664 -877L688 -929L729 -1034L821 -1221L883 -1344L945 -1510L959 -1565L977 -1682L1006 -1793L1012 -1825L1048 -1926L1096 -2058L1124 -2129L1136 -2217L1136 -2303L1122 -2351L1110 -2396L1081 -2456L1067 -2481L1050 -2515L1032 -2564L1018 -2653L1022 -2674L1041 -2734L1050 -2782L1064 -2798L1082 -2844L1095 -2868L1117 -2888L1140 -2906L1169 -2938L1188 -2970L1186 -3010L1179 -3052L1161 -3097L1159 -3158L1164 -3211L1174 -3247L1197 -3292L1276 -3394L1370 -3539L1410 -3613L1491 -3730L1545 -3814L1587 -3858L1624 -3915L1645 -3950L1654 -3981L1655 -4013L1650 -4053L1636 -4098L1620 -4118L1598 -4134L1568 -4148L1507 -4168L1463 -4169L1417 -4166L1366 -4152L1310 -4128L1241 -4087L1144 -4021L1090 -4035L1015 -4103L866 -4202L807 -4268L776 -4328L771 -4402L779 -4540L821 -4672L908 -4789L993 -4852L1060 -4890L1139 -4920L1164 -4938L1177 -4965L1179 -5038L1163 -5096L1131 -5173L1113 -5199L1038 -5252L974 -5307L922 -5382L890 -5415L808 -5502L733 -5586L660 -5651L576 -5670L539 -5682L502 -5697L479 -5710L465 -5720L461 -5725L455 -5734L450 -5748L451 -5766L455 -5781L462 -5796L471 -5809L482 -5823L502 -5844L518 -5864L538 -5892L552 -5916L567 -5945L585 -5993L601 -6030L619 -6057L639 -6078L658 -6091L677 -6100L691 -6105L705 -6107L724 -6113L757 -6131L782 -6155L797 -6172L807 -6188L812 -6206L812 -6227L803 -6267L792 -6313L787 -6344L784 -6375L784 -6408L790 -6434L805 -6475L822 -6517L848 -6577L861 -6619L867 -6660L870 -6830L865 -7089L862 -7192L857 -7258L845 -7325L824 -7391L796 -7455L755 -7528L725 -7585L716 -7611L711 -7638L711 -7663L714 -7689L719 -7715L769 -7849L824 -7975L835 -8010L839 -8033L836 -8054L829 -8068L811 -8083L787 -8098L738 -8129L692 -8159L681 -8170L676 -8182L673 -8203L673 -8224L677 -8285L681 -8309L686 -8330L692 -8346L703 -8365L720 -8386L744 -8407L777 -8432L802 -8457L824 -8480L846 -8511L853 -8529L860 -8544L871 -8562L890 -8594L932 -8657L970 -8712L1009 -8758L1067 -8826L1088 -8856L1118 -8917L1152 -9002L1152 -9020L1145 -9036L1130 -9050L1081 -9079L998 -9137L979 -9158L963 -9186L954 -9219L946 -9308L942 -9393L937 -9443L935 -9535L939 -9561"/><path class="m-canal" d="M337 450L344 441L349 423L334 420M353 299L353 295L349 292L345 293L337 292M354 336L353 299M345 366L350 362L353 359L354 336"/><path class="m-path" d="M227 525L287 522M409 364L412 401L412 436L409 451M94 362L95 354L95 350L99 346L156 236L157 232L157 228L143 203L140 195L137 159L142 127L143 114L153 104L163 88L166 77L169 67L174 57L183 46L188 27L197 9L205 -14L204 -32L201 -46M221 157L218 161L207 172L177 184L142 195L140 195M125 196L112 198L107 199M74 177L74 174M140 195L125 196M157 228L159 227L186 224M522 410L520 410L519 410L518 409L517 408L516 407L516 405L517 401L517 398L515 383L514 381L512 379L507 376L506 374M450 438L450 445L447 449M101 236L78 233L84 187M84 187L85 179L81 178L76 178L74 177M441 382L448 422L448 427L450 438M441 382L436 357M95 366L127 363L141 361L204 356L279 350L291 354M389 -16L387 -38M387 -38L387 -45L401 -54L408 -61L414 -72L419 -85L418 -97M440 -29L421 -42L401 -54M370 70L368 64L363 54L361 51L381 24L383 19L383 15L382 10L379 7L376 4L370 1L366 0L335 1L333 -1M333 -1L325 1M325 1L325 -6L324 -20L338 -40M308 403L311 404M311 404L313 404M313 404L314 413M506 374L441 382M506 374L503 344M308 428L313 428M694 289L689 271L676 231L672 227L669 226L664 226L660 229L657 232L656 236L657 242L661 257M607 525L599 525L592 526L471 540M308 421L313 421M314 421L313 421M314 428L313 428M314 421L316 424L316 427L314 428M314 431L317 431L318 432L319 433M307 431L314 431M329 89L335 88M317 274L313 258L311 242M316 592L319 594L320 597M320 597L322 597L322 593M303 186L303 173L309 170M302 203L302 199L301 186L303 186L304 186L306 186L311 186L314 185M350 337L349 350M349 350L349 351M349 351L349 353L349 356M349 356L355 357M349 353L355 354M369 428L361 428L357 425M350 422L352 414M347 410L347 413L352 414L357 416M357 416L354 428M354 428L351 442M351 457L351 461M351 461L351 466L351 478L354 483L357 485L361 485L364 483L365 478L367 466M372 467L368 466L367 466L361 466M351 442L351 457M357 425L352 423L350 422L345 421M522 410L511 413L508 414L505 417L502 421L499 423L495 425L489 425L484 426L480 425L474 424L469 424L461 425L454 426L448 427M893 507L795 565M522 410L534 408M-24 308L-22 319M468 315L473 315L478 315M449 315L454 315M454 315L461 315M461 315L468 315M503 323L503 314L486 314M486 314L478 315M504 334L504 329L503 323M503 344L504 334M81 178L80 182M84 187L106 191M93 374L94 368L95 366M83 340L82 335L81 330L82 323L104 242L106 237L109 228L111 221L112 214L112 208L112 202L112 198L112 195L110 187L109 180L109 170L110 155L114 124L115 119L116 114L119 105L122 98L123 90L125 82L131 21L138 -12L140 -29L143 -43L153 -92M95 366L94 362L92 357L90 355M90 355L84 345L83 340"/><path class="m-r3" d="M231 -46L238 -50L240 -52L241 -54L242 -60M534 408L541 408L551 408M-60 554L-79 576L-80 580L-80 583L-78 589L-75 594L-73 595L-72 596L-66 596L-64 596L-63 594L-57 567L-57 565L-57 563L-60 554M280 568L250 566L211 566M695 581L736 559L738 559L740 560L761 595M-118 201L-30 187M515 452L499 454L483 455L455 454L447 449M542 338L552 376L552 381L553 394L551 408L554 427M242 -60L246 -84L246 -95L241 -122L240 -134L240 -149L241 -169L242 -204M81 365L86 363L90 362L94 362L104 360L108 357L111 354L114 347L118 334M258 225L216 232L212 220L186 224M374 265L393 264L395 264L396 265L397 267L400 279L404 315M171 413L172 456L170 482L160 488L147 489L97 488L92 484L89 476L86 462L80 445L78 433L78 423L106 420L119 417L171 413M106 420L109 449L102 456L86 462M171 413L177 427L180 440L183 465L184 480L186 485L202 484L208 482L225 478M265 653L295 659M-40 531L-32 530L26 528L56 528L62 529L66 532L68 537L69 546L68 569M-42 632L-32 633L39 636M172 -43L156 -82M699 603L686 605L675 606L673 606M546 -13L546 -9L545 7L545 19M501 -14L501 7L500 10L499 13L497 18M552 381L542 384L537 386L535 388L534 392L534 397L534 408M-2 304L2 318L4 326L4 332L3 336L2 338L1 341L-1 342L-3 343M-55 478L-56 481L-58 492L-64 533L-64 536L-60 554M-110 238L-84 232L-75 231L-65 230L-53 229L-32 227L-19 226L-6 224L19 221L24 222L26 224L28 227L21 272M-6 224L-6 229L-5 237L-5 247L-5 260M262 240L213 253L213 274L202 274M179 274L154 273L164 253M202 274L179 274M549 274L541 274M513 258L476 260M400 -17L415 -8L419 -7L424 -6L433 -7"/><path class="m-r2" d="M-459 320L-425 295L-358 237L-328 213L-259 164L-231 142L-178 104L-127 52L-98 21L-80 6L-63 -7L10 -54L47 -83L57 -89L67 -92L72 -93L98 -92M291 354L291 346L290 339L288 331L285 323L283 315L272 272L262 240L258 225L251 201L245 179L240 155L239 140L239 126L239 117L244 52L245 36L244 21L242 -10M833 263L802 268L711 285M354 370L317 364M279 -11L262 -11L242 -10M279 -11L329 -13M714 -41L796 -53L868 -63M702 -79L706 -78L709 -75L710 -72L714 -41L720 -11L754 228L757 244M749 -185L772 -177L777 -175L778 -174L778 -172L794 -77L796 -53L818 89L836 195M711 285L710 277L712 271L717 266L757 244L836 195L891 155L899 149M802 268L820 332L867 461M377 369L376 340L374 305L374 265L373 222L373 217L374 213L377 202L379 198L382 193L390 184L391 181L393 176L402 84M402 84L439 86M545 92L549 274M439 86L448 276M579 636L584 692L589 736M-85 324L-26 309L-24 308L-14 306L-2 304M-62 664L-53 651L-44 637L-42 632L-39 626L-36 616L-33 607L-32 594L-31 576M-47 503L22 502L71 500M-129 148L29 123L26 60L26 50L26 41L28 33L30 23L41 -29L45 -59L47 -83M373 455L409 451L447 449M682 508L611 523L610 523L608 524L607 525L606 528L608 536L616 579M329 -13L389 -16L400 -17L407 -17L417 -17L436 -16L501 -14L546 -13L661 -11M637 310L624 255L618 196L616 153L616 127L620 95L624 80L638 37L661 -11M652 364L663 366L675 369L704 380L716 386L763 417L782 427L804 437L848 459L867 461M637 310L652 364M377 647L579 636L704 634M197 -45L188 -44L181 -43M172 -43L160 -43L146 -43L143 -43L138 -42M240 155L223 157L221 157L220 154L219 117L219 116L220 116L239 117M848 459L773 467M661 -11L711 -11L720 -11M661 -11L702 -79L725 -131L749 -185L759 -207L760 -214L760 -217L761 -222L766 -243M242 -10L241 -20L239 -29L235 -39L233 -43L231 -46L229 -47L226 -49L223 -50L219 -50L214 -49L201 -46M402 84L412 53L433 -7L434 -11L436 -16L438 -23L440 -29L444 -40L456 -79L460 -94L461 -99M620 95L545 92M545 92L439 86M820 332L757 349M652 364L653 369L664 406L665 412L678 482L682 508L688 541L695 581L696 586L699 603L701 613L704 634L705 640L708 656L708 661L708 679L708 685L703 699L699 710L695 730L694 760L705 801L714 827L719 848L723 873L726 896L728 935M307 361L317 364M637 310L597 326L567 333L551 337L542 338M291 354L294 355L297 356L300 358L307 361M377 369L367 370M358 371L354 370M308 428L308 421L308 403L307 387L306 368L307 361M373 455L371 441L369 428L360 382L358 371M503 344L476 348L451 353L436 357L409 364L377 369M201 -46L197 -45M260 673L190 663L189 662L188 660L189 650M711 285L694 289L688 290L680 293L637 310M83 373L88 373L93 374L101 375L108 376L115 375L166 370L253 362L262 361L270 360L276 358L282 356L286 355L288 354L291 354M166 370L168 389L171 413M244 976L237 946L234 931L232 918L231 906L231 895L231 872L232 825L233 810L236 766L238 758L240 750L254 694L257 682L260 673L265 653L267 644L274 605L278 582L280 568L281 557L283 546L285 534L287 522L290 509L306 440L307 431L308 428M497 948L486 895L472 849L466 829L461 814L456 803L451 793L431 746L410 708L377 647L374 641L372 635L371 617L370 596L369 554L369 534L369 496L371 472M-31 576L-34 554L-40 531L-47 503L-55 478L-51 460L-45 454L-17 443L2 435L13 427L40 400L42 397L43 391M912 251L897 253L869 257L833 263M181 -43L172 -43M367 370L358 371M542 338L519 341L503 344M448 276L449 315L451 353M371 472L372 467L373 455M550 281L514 282L513 258L512 206M549 274L550 281L551 337"/><path class="m-r1" d="M83 373L83 371L82 368L81 365L79 361M79 361L77 354L76 346L75 341M107 204L107 199L106 191L105 183L104 176L104 170M-687 438L-668 431L-612 409L-583 399L-560 394L-541 390L-521 386L-504 384L-486 383L-468 382L-449 382L-433 382L-417 383L-399 384L-379 386L-358 388L-314 394L-289 396L-267 398L-243 399L-227 399L-209 398L-190 396L-172 394L-137 391L-108 389L-62 388L-32 388M-32 388L-15 389M43 391L47 391L51 390L56 388L61 385L65 383L70 382L75 381L78 379L81 377L83 375L83 373M145 -84L138 -42M-15 389L18 391L31 392L37 392L43 391M116 100L118 93L119 85L127 20L128 11L131 0L133 -10L138 -42M75 341L75 336L76 330L76 325L92 266M92 266L95 257L98 245L101 236L103 230L105 225L107 219L107 214L108 209L107 204M104 170L104 161L105 152L106 143L110 121L111 114L113 107L116 100"/><path class="m-bld" d="M88 200L88 204L85 223L84 227L94 228L99 229L100 220L101 220L103 211L102 211L103 203L98 202L88 200ZM448 387L449 396L445 396L446 402L449 402L450 410L460 411L505 405L504 398L514 397L513 386L503 387L502 380L461 385L459 386L448 387ZM244 200L247 211L249 224L220 230L217 218L215 206L229 203L244 200ZM92 130L102 132L98 157L88 155L92 130ZM3 226L0 246L17 249L20 228L3 226ZM46 185L48 190L52 188L50 183L46 185ZM376 471L403 469L405 493L398 493L397 482L389 482L389 486L382 486L382 483L377 483L376 471ZM455 338L455 342L458 344L481 339L478 317L470 319L465 320L467 329L467 329L468 336L467 337L462 338L455 338ZM522 353L525 352L524 348L537 345L539 353L541 352L547 376L532 379L531 372L525 373L527 383L517 385L514 373L510 374L505 354L505 351L521 349L522 353ZM528 439L526 439L528 448L517 450L516 447L497 451L493 434L493 433L503 430L501 426L523 419L534 416L538 426L544 425L546 434L542 436L543 441L529 444L528 439ZM198 346L198 328L221 328L221 329L237 329L237 327L249 327L249 334L259 334L259 328L283 328L285 344L284 344L284 346L276 346L276 344L221 344L221 346L212 346L212 349L207 349L207 346L198 346ZM226 252L257 243L262 263L231 271L226 252ZM331 -8L392 -10L392 -4L331 -3L331 -8ZM318 396L310 396L309 372L317 371L318 396ZM232 245L230 234L251 229L254 240L232 245ZM435 76L434 83L419 81L420 69L424 69L425 61L438 65L437 76L435 76ZM453 439L458 438L459 443L453 444L453 439ZM427 418L427 445L413 445L413 418L427 418ZM452 277L476 276L475 272L492 272L492 292L495 292L496 310L485 310L477 310L477 307L477 292L464 293L464 305L453 305L452 277ZM445 -11L462 -7L457 15L440 11L445 -11ZM452 262L468 262L469 274L453 275L452 262ZM366 396L379 396L383 421L381 421L381 424L371 426L366 396ZM360 516L350 515L352 492L361 492L360 516ZM449 230L466 229L467 247L450 248L449 230ZM392 201L405 201L406 217L393 217L392 201ZM397 188L397 181L405 180L405 188L397 188ZM587 334L606 329L611 346L591 351L587 334ZM180 240L202 240L202 274L202 278L179 278L179 274L180 240ZM589 364L595 386L583 389L580 378L564 378L562 370L578 367L589 364ZM430 426L447 425L448 438L448 440L432 441L430 426ZM412 374L420 374L424 393L424 394L413 394L412 374ZM432 368L437 390L424 393L420 374L420 371L432 368ZM368 374L385 373L385 397L381 397L381 396L379 396L366 396L368 374ZM413 394L424 394L425 393L426 412L414 413L413 394ZM435 188L434 188L434 192L437 192L437 208L438 224L415 225L414 215L413 215L412 209L412 201L421 200L420 188L410 189L408 134L411 134L409 95L431 94L435 188ZM489 433L491 449L481 450L481 447L469 449L467 438L467 436L489 433ZM382 48L389 27L385 25L394 2L423 13L407 56L403 55L398 69L398 83L383 84L382 48ZM383 447L381 424L381 421L383 421L388 420L389 430L399 430L400 434L401 445L383 447ZM366 430L366 454L369 454L369 463L352 464L352 445L355 445L355 430L366 430ZM439 63L425 59L429 44L431 45L434 35L445 38L439 63ZM460 308L477 307L477 310L478 315L478 317L470 319L468 315L468 314L461 314L460 308ZM512 465L472 470L470 458L481 456L482 460L511 455L512 463L512 465ZM163 333L166 333L167 348L122 351L121 336L134 335L133 313L162 311L163 333ZM454 308L460 308L461 314L461 315L461 331L467 329L467 329L468 336L467 337L462 338L455 338L454 315L454 308ZM481 339L504 334L511 333L510 323L506 323L503 323L501 323L500 314L486 315L486 314L485 310L477 310L478 315L478 317L481 339ZM247 -57L248 -41L268 -41L267 -57L247 -57ZM112 247L122 251L111 280L101 276L112 247ZM168 -37L167 -35L168 -32L172 -33L172 -34L173 -35L172 -38L170 -37L168 -37ZM106 350L105 348L102 347L100 348L98 350L98 353L100 355L102 356L105 355L106 353L106 350ZM68 371L69 373L72 372L71 370L68 371ZM401 261L413 260L414 276L402 277L401 261ZM382 166L382 151L358 150L358 165L382 166ZM448 187L459 186L459 199L457 199L457 202L451 202L451 199L449 199L448 187ZM388 144L389 131L380 131L380 129L364 129L363 141L377 142L377 144L388 144ZM447 168L459 167L458 158L465 158L465 156L470 156L470 158L474 158L474 150L464 150L464 152L447 152L447 168ZM389 92L377 91L377 101L367 100L367 106L378 106L377 109L384 110L384 107L388 107L388 103L390 103L391 96L388 96L389 92ZM446 122L472 121L473 136L458 137L458 139L446 140L446 122ZM372 264L371 246L366 246L365 240L368 240L368 232L372 232L372 223L366 223L366 227L354 227L354 233L349 233L349 240L354 240L354 245L364 245L364 246L359 246L360 264L372 264ZM441 262L441 254L438 254L438 253L436 251L436 249L422 250L422 257L424 257L425 263L441 262ZM355 195L355 204L373 204L373 183L354 183L354 191L358 191L358 195L355 195ZM347 408L351 408L356 407L356 413L353 429L343 426L347 408ZM464 651L393 654L393 663L407 686L466 683L464 651ZM711 252L702 257L699 253L694 256L692 252L686 255L689 260L688 261L694 272L715 260L715 259L711 252ZM859 340L856 323L860 322L859 317L846 320L847 325L829 329L832 343L844 341L844 343L859 340ZM751 311L738 314L736 305L730 306L732 314L728 315L729 318L721 320L717 299L710 300L709 294L716 292L715 291L745 285L751 311ZM866 339L847 343L853 375L872 372L866 339ZM799 308L806 307L807 315L800 317L799 308ZM863 217L874 208L869 203L869 204L863 196L853 204L863 217ZM708 317L704 305L699 307L696 295L667 302L671 316L683 313L685 323L708 317ZM800 278L788 280L792 300L790 301L791 308L798 307L797 304L805 303L800 278ZM836 240L839 255L815 260L812 245L816 244L815 238L822 237L823 243L836 240ZM-24 534L-25 591L-20 591L-20 605L76 607L76 581L62 581L62 590L34 590L34 591L24 591L24 593L19 593L19 570L7 570L7 534L-24 534ZM179 421L177 401L194 399L193 392L177 394L176 386L191 384L190 377L202 375L203 382L204 389L205 396L207 396L209 403L208 405L195 407L196 412L194 413L195 418L192 419L179 421ZM228 393L223 394L220 372L202 375L203 382L204 389L214 387L217 401L209 403L208 405L209 411L225 407L224 399L230 398L229 395L229 393L228 393ZM103 492L103 502L141 501L141 491L103 492ZM89 454L102 451L95 426L83 429L89 454ZM153 463L159 463L161 483L154 484L153 463ZM166 491L166 500L204 497L204 488L166 491ZM22 547L22 565L59 566L59 549L22 547ZM82 549L91 549L90 576L81 576L82 549ZM-11 508L-10 524L47 522L47 506L-11 508ZM212 422L199 424L207 478L220 476L212 422ZM787 364L784 352L774 355L773 351L759 354L764 372L770 370L771 376L777 374L776 367L787 364ZM803 362L816 358L815 356L822 354L818 343L817 343L816 341L813 342L812 340L797 345L803 362ZM844 91L843 80L841 80L841 76L838 77L837 73L826 74L826 78L828 78L830 93L844 91ZM815 385L829 380L825 368L815 371L816 373L812 374L810 369L792 376L795 384L803 381L805 385L814 382L815 385ZM683 407L693 404L686 381L680 383L680 382L678 376L674 377L675 383L673 383L674 386L672 387L666 370L657 373L668 406L679 402L677 396L681 395L682 399L681 399L683 407ZM827 436L824 438L826 441L829 439L827 436ZM780 386L783 403L771 405L768 389L780 386ZM781 383L781 386L790 385L789 381L781 383ZM742 474L711 479L713 489L744 483L742 474ZM712 534L715 547L724 546L722 532L712 534ZM845 108L835 110L838 125L848 123L845 108ZM692 412L682 413L683 425L693 424L692 412ZM852 23L851 15L843 16L843 24L852 23ZM820 358L814 360L816 366L822 364L820 358ZM833 -48L812 -46L814 -28L835 -30L833 -48ZM856 37L856 32L851 32L852 37L856 37ZM842 418L850 440L839 444L833 427L834 427L832 421L842 418ZM706 431L681 435L683 454L695 452L693 440L707 438L706 431ZM714 594L715 599L708 599L710 616L729 614L726 592L714 594ZM731 635L720 637L722 644L714 646L716 662L734 659L731 635ZM811 471L827 470L830 469L831 476L832 488L820 489L819 484L812 485L811 471ZM697 544L700 556L708 555L708 556L715 555L712 541L697 544ZM859 135L836 138L837 146L845 145L847 157L862 155L859 135ZM721 500L714 501L715 505L692 509L694 521L723 516L721 500ZM738 535L726 537L724 525L746 521L748 530L737 532L738 535ZM763 625L755 630L746 615L763 604L764 606L768 604L773 613L760 621L763 625ZM715 454L713 439L726 436L730 461L715 464L713 454L715 454ZM739 601L753 593L741 572L728 580L733 587L732 588L739 601ZM758 474L772 472L775 495L759 498L757 484L759 484L758 474ZM844 36L843 32L826 34L826 40L822 40L824 51L838 49L836 38L844 36ZM734 445L746 444L744 427L739 427L738 426L735 426L736 428L731 428L734 445ZM682 641L683 661L695 660L695 651L697 651L697 645L696 645L696 641L682 641ZM836 397L840 407L824 413L820 402L826 400L825 398L832 396L833 398L836 397ZM706 481L701 482L701 481L688 483L689 492L698 491L699 495L697 496L697 500L709 499L706 481ZM834 11L832 -3L825 -1L825 -4L818 -3L819 -1L815 0L817 14L834 11ZM741 358L730 361L733 370L729 371L731 377L732 377L734 384L746 380L741 358ZM770 124L764 125L764 128L749 130L750 135L749 136L751 151L764 149L762 137L772 136L770 124ZM797 134L807 132L806 127L816 125L815 116L794 119L793 113L786 114L787 123L795 122L797 134ZM826 162L825 154L822 154L820 143L801 146L803 161L812 160L811 156L817 155L818 163L826 162ZM759 98L758 90L746 92L747 99L744 100L746 114L747 114L748 120L759 119L758 113L759 112L757 98L759 98ZM825 178L825 173L815 174L815 177L809 178L811 188L816 188L817 190L828 188L827 183L829 183L828 178L825 178ZM727 253L751 240L750 232L746 199L731 202L728 181L717 183L722 222L721 222L722 226L726 249L727 253ZM761 212L782 207L790 205L788 193L780 194L779 185L774 185L774 183L795 180L794 169L755 175L758 195L766 194L767 196L759 197L761 212ZM802 34L788 37L790 46L803 44L802 34ZM786 121L776 122L777 132L787 130L786 121ZM811 89L813 102L799 105L797 92L811 89ZM785 136L778 137L779 146L786 145L785 136ZM628 342L625 335L618 337L621 345L628 342ZM794 88L796 101L785 103L783 90L794 88ZM755 -61L749 -60L750 -53L757 -54L755 -61ZM750 -9L741 -8L742 -2L751 -3L750 -9ZM786 -76L778 -75L779 -68L777 -68L778 -59L788 -60L786 -76ZM632 349L642 346L639 339L641 338L633 317L622 321L632 349ZM743 32L746 32L743 13L731 15L733 28L735 28L735 32L743 31L743 32ZM806 61L802 62L802 60L798 61L798 63L795 63L797 74L808 72L806 61ZM629 342L618 346L618 348L617 349L626 378L648 371L640 348L632 350L629 342ZM789 -44L775 -42L776 -34L772 -33L774 -21L788 -23L786 -31L791 -32L789 -44ZM710 93L724 91L723 85L725 84L723 73L710 75L709 71L712 70L711 59L701 60L704 79L707 78L708 87L710 87L710 93ZM701 16L696 17L700 45L701 55L704 55L704 56L716 54L718 53L721 52L719 42L714 43L714 41L706 42L707 44L704 44L701 16ZM694 17L683 18L685 31L696 29L694 17ZM710 35L718 33L716 17L707 19L710 35ZM732 146L731 133L718 134L717 132L709 133L712 151L720 150L719 148L732 146ZM727 126L732 125L731 117L727 118L726 105L710 107L712 120L726 118L727 126ZM556 -71L546 -71L546 -64L526 -64L526 -51L539 -51L539 -42L552 -42L551 -61L556 -61L556 -71ZM475 107L475 94L444 93L445 119L460 119L460 117L466 118L466 113L455 113L455 111L459 111L459 106L475 107ZM576 -45L571 -45L571 -39L557 -39L557 -31L543 -31L543 -18L570 -19L570 -29L580 -29L580 -39L576 -39L576 -45ZM627 98L626 101L625 101L624 111L623 111L621 126L620 147L624 147L624 152L631 152L632 127L633 127L634 111L635 111L635 100L627 98ZM650 24L640 43L643 44L642 45L645 46L642 52L640 52L639 56L636 55L633 65L638 67L637 72L633 71L626 98L627 98L635 100L642 74L644 75L648 62L645 61L646 59L648 60L651 48L661 28L650 24ZM615 -7L638 -6L637 10L614 10L614 9L615 -3L615 -7ZM507 -70L498 -70L498 -57L508 -57L507 -70ZM590 -39L590 -34L595 -34L595 -39L590 -39ZM625 -39L612 -39L612 -32L625 -32L625 -39ZM553 71L553 74L560 74L560 71L553 71ZM599 8L606 8L606 20L598 20L599 8ZM527 48L516 48L517 57L527 57L527 48ZM631 161L620 162L621 168L631 168L631 161ZM548 22L538 21L537 36L547 37L548 22ZM501 20L489 20L489 32L501 32L501 20ZM590 30L595 30L595 37L590 37L590 30ZM496 -7L475 -7L475 7L496 7L496 -7ZM617 -30L593 -30L593 -18L617 -18L617 -30ZM639 -58L619 -58L620 -43L640 -43L639 -58ZM665 25L652 20L650 24L661 28L664 30L665 25ZM560 29L559 29L552 28L551 35L559 36L560 29ZM682 -62L682 -73L661 -73L661 -52L676 -52L676 -62L682 -62ZM448 65L441 64L439 82L460 84L460 75L447 74L448 65ZM532 6L512 5L511 20L526 21L527 14L532 14L532 6ZM598 1L586 0L586 15L595 15L595 13L598 13L598 1ZM530 87L530 80L541 81L541 70L514 70L513 86L530 87ZM560 4L559 18L560 18L568 18L568 24L582 24L582 5L560 4ZM670 14L675 4L661 -2L652 18L664 23L667 17L663 15L665 11L670 14ZM513 -30L508 -31L508 -27L495 -27L495 -19L516 -19L517 -27L513 -27L513 -30ZM496 -61L485 -61L485 -64L472 -63L473 -51L484 -51L484 -46L496 -46L496 -61ZM594 -76L567 -76L567 -65L576 -66L576 -60L594 -60L594 -76ZM656 -28L650 -28L650 -30L644 -30L644 -28L644 -28L644 -18L656 -18L656 -28ZM639 235L638 231L640 231L637 202L634 203L634 208L627 209L630 236L639 235ZM538 176L522 176L522 191L525 191L525 194L528 194L528 197L534 197L534 193L538 193L538 176ZM612 119L612 105L609 100L595 100L594 108L600 108L600 111L602 113L605 113L605 119L612 119ZM536 131L524 131L524 134L521 134L521 143L524 143L524 148L536 148L536 144L539 144L539 139L536 139L536 131ZM543 316L543 333L516 334L516 333L511 333L510 323L506 323L505 312L524 311L524 315L527 315L527 317L543 316ZM569 168L559 169L560 172L553 172L553 181L554 181L555 187L563 186L563 188L570 188L570 185L574 184L574 178L570 178L569 168ZM572 242L564 242L564 243L557 243L557 250L555 250L555 257L562 257L563 258L568 258L569 257L572 257L572 253L576 253L576 245L572 245L572 242ZM541 238L529 238L529 234L522 234L522 242L528 241L528 245L524 245L524 255L529 255L529 261L533 261L533 263L538 263L537 260L541 260L541 238ZM608 130L602 129L593 129L592 144L608 145L608 130ZM579 238L579 247L590 247L590 238L579 238ZM578 140L573 141L573 149L578 149L578 140ZM563 295L559 295L559 299L563 299L563 295ZM474 182L470 182L470 188L474 188L474 182ZM566 276L554 276L554 285L566 285L566 276ZM571 141L571 136L552 137L553 152L567 152L567 141L571 141ZM569 111L568 99L551 100L552 112L558 112L558 115L564 115L564 112L569 111ZM566 207L554 207L554 222L567 222L567 221L570 221L570 211L567 212L566 207ZM613 188L615 198L608 199L610 209L601 211L598 194L608 192L607 189L613 188ZM661 293L683 286L680 277L688 274L681 254L674 256L675 260L659 265L663 277L659 278L659 278L649 279L648 269L644 270L644 266L632 267L634 283L636 283L638 299L662 296L661 293ZM645 240L655 240L657 267L647 267L645 240ZM638 238L626 240L628 259L641 257L638 238ZM644 240L639 241L640 248L645 247L644 240ZM442 320L433 321L432 321L433 329L422 330L422 336L413 337L413 339L407 340L407 337L411 337L410 332L413 331L413 326L408 327L407 318L404 319L405 323L394 324L395 334L392 334L392 341L379 342L381 361L412 358L412 354L441 351L440 347L445 346L442 320ZM365 308L366 324L373 324L373 308L365 308ZM391 269L375 269L375 302L389 302L389 292L384 292L384 280L391 280L391 269ZM442 483L455 481L453 456L438 458L438 459L430 460L432 472L439 472L439 478L441 478L442 483ZM492 496L477 497L478 504L480 504L480 507L493 506L492 496ZM390 307L381 308L382 314L376 315L377 328L390 327L390 320L391 320L390 307ZM730 263L740 261L740 259L764 255L766 269L732 275L730 263ZM726 249L721 249L719 238L715 239L714 228L722 226L726 249ZM-23 -43L-13 -49L-18 -57L-22 -63L-26 -61L-32 -57L-23 -43ZM-54 -22L-40 -31L-43 -37L-35 -42L-42 -51L-49 -46L-50 -47L-64 -38L-58 -29L-54 -22ZM355 617L368 617L368 637L363 637L364 651L354 652L353 636L355 636L355 617ZM372 496L374 510L375 510L391 509L390 505L397 504L396 502L406 500L405 493L398 493L372 496ZM375 514L375 520L389 519L401 517L400 511L388 513L375 514ZM375 520L376 544L394 543L394 532L400 532L399 522L389 522L389 519L375 520ZM373 554L386 555L384 580L373 579L373 554ZM394 554L393 579L402 579L402 574L416 575L416 562L413 562L413 555L394 554ZM374 596L375 609L379 609L380 615L382 614L382 620L389 620L386 594L374 596ZM192 419L179 421L188 481L202 478L192 419ZM217 442L227 440L232 474L222 476L217 442ZM228 476L234 475L236 492L217 494L217 488L229 486L228 476ZM288 596L300 597L299 614L303 614L302 625L284 623L285 612L287 612L288 596ZM286 649L298 651L298 655L286 653L286 649ZM226 645L233 645L233 648L240 649L239 663L226 662L227 654L225 653L226 645ZM172 641L171 655L158 653L157 657L152 657L152 659L143 658L145 638L172 641ZM170 607L169 622L217 625L218 610L170 607ZM175 626L174 638L216 641L217 629L175 626ZM248 621L265 624L261 642L253 640L254 635L246 633L248 621ZM188 574L189 594L198 593L198 590L204 589L203 577L196 577L196 574L188 574ZM207 574L221 572L222 584L208 585L207 574ZM208 542L208 555L229 555L228 541L208 542ZM243 535L252 534L252 541L256 541L256 538L262 538L262 541L267 540L267 554L243 554L243 541L244 541L243 535ZM306 459L313 459L313 456L322 456L324 481L323 506L316 505L317 500L297 499L299 490L316 491L316 481L302 481L306 459ZM-25 470L-25 464L-25 462L-19 462L-20 470L-25 470ZM-35 463L-35 462L-30 463L-30 463L-25 464L-25 470L-25 472L-43 471L-43 463L-35 463ZM-36 488L-39 488L-39 482L-36 482L-36 479L-25 480L-25 494L-36 494L-36 488ZM-21 474L-9 474L-9 494L-20 494L-21 474ZM44 473L63 473L63 485L54 485L54 490L52 490L52 494L45 494L45 490L41 490L41 480L44 480L44 473ZM8 486L8 493L0 493L0 476L35 476L35 492L22 492L22 486L8 486ZM-5 443L32 433L36 448L24 451L23 449L10 452L11 454L-2 457L-5 443ZM-12 626L-17 626L-17 614L-12 614L-12 626ZM34 608L40 608L40 617L34 617L34 608ZM41 613L59 613L59 628L54 628L54 630L40 629L41 613ZM-12 614L4 614L4 626L-12 626L-12 626L-12 614L-12 614ZM388 636L377 636L377 623L388 622L388 623L388 636ZM394 623L413 622L413 634L414 639L395 640L389 641L388 636L388 623L394 622L394 623ZM435 621L436 632L413 634L413 622L435 621ZM436 639L436 632L435 621L478 619L479 637L436 639ZM491 617L505 616L506 633L492 634L492 632L485 632L484 619L491 618L491 617ZM827 465L837 464L839 475L831 476L830 469L827 470L827 465ZM669 360L663 362L662 358L664 358L664 356L667 355L669 360ZM670 559L681 557L683 566L671 568L670 559ZM663 610L656 611L654 602L661 601L662 602L663 610ZM662 602L669 601L670 608L663 610L662 602ZM675 604L673 593L689 590L691 602L675 604ZM651 571L656 570L658 583L655 584L654 580L653 580L651 571ZM615 582L620 581L622 592L617 593L615 582ZM636 580L635 575L644 573L645 581L648 580L649 588L647 589L648 593L645 593L645 595L637 597L637 595L629 596L627 586L629 586L628 584L633 583L633 580L636 580ZM582 544L582 547L578 548L576 538L588 536L589 541L589 543L582 544ZM582 544L589 543L589 541L600 539L603 556L594 557L594 559L584 560L582 547L582 544ZM639 520L646 519L650 537L647 538L644 525L640 525L639 520ZM627 528L626 526L634 525L634 527L640 525L644 525L647 538L647 539L638 540L637 539L621 542L619 530L627 528ZM660 544L667 542L667 540L672 539L672 542L677 541L679 552L662 555L660 544ZM659 514L670 512L673 525L665 526L666 530L653 534L650 519L660 517L659 514ZM567 618L600 616L600 625L592 625L593 630L575 631L575 629L568 630L567 618ZM607 639L616 639L617 655L613 655L613 647L607 647L607 639ZM601 661L595 661L595 647L607 647L613 647L613 655L613 661L608 661L608 664L601 664L601 661ZM628 643L628 641L642 641L643 659L629 660L628 653L620 653L620 643L628 643ZM646 614L660 613L662 626L647 627L646 614ZM280 389L303 388L304 400L281 401L280 389ZM395 373L396 381L394 381L394 398L385 397L385 373L395 373ZM409 371L410 406L410 433L400 434L399 430L397 411L396 371L409 371ZM291 454L289 476L289 476L284 476L283 484L275 483L275 477L269 476L270 472L272 472L273 462L274 463L275 453L291 454ZM-51 398L-51 408L-63 408L-63 398L-59 398L-59 397L-57 397L-57 398L-51 398ZM-18 419L-25 432L-35 427L-28 414L-18 419ZM-5 395L-7 410L-10 410L-10 407L-16 407L-19 418L-25 415L-20 394L-5 395ZM13 397L12 409L-3 408L-3 410L-7 410L-5 395L13 397ZM103 405L88 406L87 391L99 390L99 393L102 393L103 405ZM131 400L113 401L112 385L130 384L131 400ZM117 129L126 130L123 159L114 158L117 129ZM162 113L162 120L154 119L151 142L143 140L146 119L151 112L162 113ZM277 -7L278 0L277 0L277 14L276 14L251 18L250 -5L261 -6L261 2L260 2L260 9L264 9L264 1L270 0L270 -6L277 -7ZM278 27L251 31L251 18L276 14L278 27ZM265 37L265 45L265 58L253 57L253 36L265 37ZM294 70L297 70L298 84L284 83L284 67L272 66L270 66L270 62L263 61L263 60L253 59L253 57L265 58L265 45L281 46L281 53L294 54L294 70ZM249 59L253 59L263 60L263 61L270 62L270 66L272 66L271 86L298 90L297 100L273 97L268 96L268 96L248 94L249 59ZM273 97L272 108L269 108L268 121L245 119L248 94L268 96L268 96L273 97ZM252 123L252 129L253 129L254 128L261 128L261 129L265 129L266 143L270 143L270 147L266 147L266 156L245 157L244 130L245 130L246 123L252 123ZM284 171L288 195L282 196L282 192L276 192L274 177L256 179L255 171L250 172L248 162L267 160L269 170L272 170L272 171L284 171ZM270 189L253 191L251 180L269 178L270 189ZM265 226L264 217L262 217L257 198L267 196L266 193L276 192L282 192L282 196L284 205L274 207L274 213L293 213L293 220L274 220L274 224L265 226ZM306 243L300 245L299 240L296 227L295 220L304 219L305 226L303 227L306 243ZM274 224L282 223L284 229L296 227L299 240L279 244L280 249L271 250L265 226L274 224ZM309 263L295 267L293 260L282 263L282 264L275 266L271 250L280 249L300 245L306 243L315 242L316 247L306 249L309 263ZM296 276L289 277L290 284L289 285L280 286L277 273L295 269L296 276ZM306 302L306 304L303 306L286 311L280 286L289 285L291 292L293 292L294 298L304 296L303 294L309 293L311 300L306 302ZM318 299L321 303L322 310L316 311L315 303L312 304L306 307L311 322L294 326L291 314L287 315L286 311L303 306L306 304L306 302L311 300L314 299L318 299ZM302 343L316 345L323 327L300 329L302 343ZM318 350L317 354L303 353L302 343L316 345L318 350ZM269 367L270 377L276 376L277 389L280 389L303 388L297 363L269 367ZM249 318L222 319L222 310L243 310L243 315L249 315L249 318ZM278 320L270 323L265 322L249 322L249 310L275 307L277 307L278 320ZM274 301L249 307L248 305L233 305L233 303L219 302L219 297L247 297L272 291L274 301ZM269 286L245 293L243 284L219 289L219 287L201 286L201 278L221 278L265 268L269 286ZM242 190L244 200L229 203L227 193L242 190ZM169 204L241 186L235 163L229 164L229 162L225 163L225 165L216 167L219 179L180 189L180 192L167 196L169 204ZM193 177L168 182L167 176L191 170L193 177ZM213 159L206 159L206 162L187 162L187 161L180 161L179 157L187 157L187 150L188 150L188 144L213 144L213 159ZM185 99L203 101L202 112L202 118L196 118L196 112L184 112L185 99ZM213 119L214 137L180 139L180 130L186 129L186 130L193 130L192 121L201 119L213 119ZM220 93L231 95L231 103L220 102L220 93ZM230 113L202 112L203 101L220 102L231 103L230 113ZM233 93L232 95L201 88L202 82L208 82L209 84L233 88L233 93ZM238 82L234 82L234 85L209 82L209 80L205 79L207 66L239 68L238 82ZM239 62L220 62L220 66L219 66L218 56L214 55L214 51L204 50L205 47L208 47L208 46L238 45L239 62ZM237 22L238 45L208 46L209 32L210 32L210 23L237 22ZM203 20L199 31L195 32L193 36L189 35L195 18L196 17L203 20ZM207 1L213 1L213 4L210 4L206 14L207 15L205 18L203 17L202 19L196 17L202 1L207 1ZM234 2L236 17L220 17L220 21L214 21L214 8L216 5L220 2L234 2ZM233 -9L232 -9L233 -3L231 -2L230 0L222 1L221 -7L215 -7L213 1L207 1L208 -5L205 -6L209 -23L229 -25L233 -9ZM225 -58L208 -54L206 -64L215 -66L221 -68L224 -68L225 -58ZM225 -58L224 -68L221 -68L218 -79L221 -80L220 -87L215 -86L213 -93L220 -96L221 -95L224 -88L234 -89L239 -62L238 -59L235 -59L229 -58L225 -58ZM193 -82L194 -77L202 -79L203 -78L211 -80L215 -66L206 -64L208 -54L195 -48L186 -75L187 -75L185 -83L192 -85L207 -90L208 -86L193 -82ZM224 -31L215 -28L212 -37L208 -36L207 -39L206 -42L220 -45L224 -31ZM155 -12L149 -12L148 -25L154 -25L155 -12ZM179 -3L178 -5L180 -5L180 -11L177 -11L175 -19L175 -19L172 -34L173 -35L186 -37L187 -27L188 -26L188 -24L188 -23L188 -19L190 -18L193 -12L189 -13L189 -6L185 -5L184 -3L179 -3ZM46 164L46 162L40 162L40 155L35 155L35 149L54 149L54 162L49 162L49 164L46 164ZM-33 145L-30 161L-38 162L-40 148L-36 147L-36 146L-33 145ZM-38 162L-45 163L-48 147L-44 147L-44 148L-40 148L-38 162ZM-48 147L-46 162L-53 163L-55 148L-48 147ZM-55 148L-53 163L-60 164L-62 150L-55 148ZM-62 150L-60 164L-60 166L-68 167L-71 153L-66 152L-66 150L-62 150ZM-57 226L-46 224L-47 219L-42 218L-41 222L-38 222L-37 224L8 217L6 205L-59 214L-57 226ZM-70 242L-69 249L-65 249L-64 255L-47 252L-49 239L-70 242ZM-20 253L-17 275L-5 274L-9 251L-20 253ZM0 288L11 290L15 255L4 254L0 288ZM-7 346L-16 348L-18 341L-15 340L-15 342L-8 340L-7 346ZM-10 333L-17 335L-22 319L-20 319L-20 321L-14 319L-10 333ZM-25 337L-29 323L-23 322L-23 320L-22 319L-17 335L-25 337ZM-55 334L-59 335L-58 337L-65 339L-65 337L-69 338L-72 329L-57 326L-55 334ZM-47 371L-42 370L-41 373L-39 373L-38 374L-34 373L-34 372L-30 371L-33 358L-44 360L-43 363L-49 364L-47 371ZM-68 116L-56 116L-56 98L-54 98L-54 91L-61 91L-61 97L-68 97L-68 116ZM-15 71L-24 72L-24 68L-30 69L-31 61L-41 62L-41 51L-29 50L-29 56L-16 56L-15 71ZM-62 10L-32 9L-32 1L-45 1L-45 -2L-51 -2L-51 2L-63 2L-62 10ZM-49 51L-49 61L-59 61L-59 65L-70 65L-70 52L-49 51ZM-4 25L-3 30L1 30L1 40L15 40L15 36L16 36L16 30L14 30L14 24L-4 25ZM42 24L55 26L53 38L40 36L42 24ZM65 12L59 11L59 12L54 12L55 5L50 4L51 -2L51 -2L67 0L65 12ZM62 -29L61 -26L66 -25L64 -13L50 -15L49 -6L40 -7L42 -17L49 -16L52 -31L62 -29ZM52 -54L59 -54L60 -61L72 -59L73 -72L69 -72L69 -75L63 -76L63 -73L57 -73L56 -63L53 -63L52 -54ZM798 170L805 169L806 174L799 176L798 170ZM800 58L799 51L808 49L809 57L800 58ZM599 -60L604 -60L604 -56L599 -56L599 -60ZM599 8L599 -3L615 -3L614 9L606 8L599 8ZM612 119L612 130L602 129L602 119L605 119L612 119ZM491 474L475 475L476 492L485 491L485 494L492 494L491 474ZM-28 -64L-17 -71L-12 -63L-18 -57L-22 -63L-26 -61L-28 -64ZM765 -26L769 -26L770 -20L766 -19L765 -23L765 -26ZM740 -23L735 -23L734 -27L732 -26L731 -31L738 -33L740 -23ZM754 -33L754 -36L752 -36L751 -41L762 -43L765 -26L765 -23L761 -22L760 -26L756 -25L754 -33ZM755 -17L756 -12L749 -11L747 -24L740 -23L738 -33L750 -34L750 -32L753 -33L754 -33L756 -25L760 -26L761 -22L762 -18L755 -17ZM25 -50L23 -41L3 -26L2 -39L23 -53L25 -50ZM20 -20L32 -18L36 -52L27 -53L27 -51L25 -50L20 -20ZM89 169L96 170L97 158L90 157L89 169ZM553 327L556 327L557 331L555 332L554 331L553 327ZM555 321L561 321L561 326L556 326L555 321ZM576 309L570 311L571 313L569 313L570 318L578 316L576 309ZM295 187L301 187L301 193L295 193L295 187ZM356 466L356 469L354 469L354 474L360 474L360 466L356 466ZM761 212L763 220L762 220L766 230L778 225L773 213L783 211L782 207L761 212ZM116 239L122 225L138 232L132 246L116 239ZM784 567L790 564L793 571L787 574L784 567ZM766 73L773 71L774 75L766 76L766 73ZM610 460L614 479L601 481L601 479L598 480L600 488L591 490L591 486L572 490L568 470L598 464L597 462L610 460ZM229 393L229 395L232 395L233 400L250 397L248 384L249 382L247 378L245 370L225 374L228 393L229 393ZM280 154L280 160L298 159L297 153L280 154ZM813 510L818 519L824 516L818 507L813 510ZM349 206L350 214L359 214L359 207L349 206ZM86 -41L85 -37L90 -36L91 -40L86 -41ZM5 314L8 325L17 323L14 312L5 314ZM-66 364L-65 370L-64 370L-63 372L-57 371L-59 363L-66 364ZM-68 182L-67 190L-60 189L-61 181L-68 182ZM-54 179L-52 187L-45 186L-47 178L-54 179ZM-39 177L-38 185L-31 184L-32 176L-39 177ZM-55 195L-53 204L-47 203L-49 193L-55 195ZM-29 183L-28 191L-21 189L-22 182L-29 183ZM-20 230L-18 243L-10 241L-12 229L-20 230ZM83 205L87 205L85 221L81 220L83 205ZM351 340L353 340L356 341L356 350L350 350L351 340ZM488 363L501 362L501 367L488 369L488 363ZM507 224L508 249L507 249L484 250L484 245L482 245L482 233L480 233L479 225L507 224ZM542 286L543 307L507 308L506 287L542 286ZM93 410L108 409L109 415L93 416L93 410ZM73 280L75 281L74 285L72 284L73 280ZM99 195L98 202L88 200L88 204L84 203L85 193L99 195ZM80 230L81 223L85 223L84 227L94 228L93 232L80 230Z"/><text class="m-lbl m-lbl--water" transform="translate(322 150) rotate(86)">ERLAUF</text><text class="m-lbl m-lbl--water" transform="translate(133 205) rotate(70)">FEICHSEN</text><text class="m-lbl" transform="translate(462 120) rotate(88)">SCHULGASSE</text><text class="m-lbl" transform="translate(545 326) rotate(-14)">KIRCHENSTRASSE</text><text class="m-lbl" x="452" y="420">KIRCHENPLATZ</text><circle class="map__pulse" cx="428" cy="296" r="70"/><path class="m-me" d="M426 273L415 274L421 322L432 321L433 321L432 316L442 315L441 286L426 286L426 273Z"/><g class="m-tag" transform="translate(404 262)"><text text-anchor="end">bunker.kollektiv</text></g></svg>
        <span class="visit__open">In Google Maps öffnen ↗</span>
        <small class="visit__osm">Karte © OpenStreetMap-Mitwirkende</small>
      </a>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand">
      <svg class="foot__logo" viewBox="-30 -30 1060 1060" aria-hidden="true"><use href="#logo"/><g class="spark"><path d="M164 0L164 90C164 40 125 5 70 0C125 5 164 40 164 90L164 420L164 595C150 540 90 506 0 506C90 506 150 475 164 420L164 595L164 905C164 960 110 1000 40 1000C110 1000 164 960 164 905L164 908A85 85 0 0 0 334 908L334 0L500 0L500 500L664 1000L664 500L830 500L1000 1000L830 1000L830 500L830 0L900 0C960 0 1000 30 1000 85L1000 380C1000 460 950 500 880 500L830 500L664 500L664 0L500 500L500 1000L334 0L500 0L664 0L830 0L900 0L1000 0L1000 85L1000 380L1000 1000L830 1000L664 1000L500 1000L40 1000L0 1000L0 506L0 0L70 0L164 0"/></g></svg>
      <p>bunker.kollektiv<br><span>Verein zur Förderung kollektiver Kunst<br>ZVR 1001996773</span></p>
    </div>
    <nav class="foot__nav" aria-label="Fußzeile">
      <a href="https://www.instagram.com/bunker.kollektiv" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.facebook.com/bunker.kollektiv.purgstall" target="_blank" rel="noopener">Facebook</a>
      <a href="#impressum" data-open="impressum">Impressum</a>
      <a href="#datenschutz" data-open="datenschutz">Datenschutz</a>
      <a href="verwaltung/">Vereins-Login</a>
    </nav>
    <p class="foot__credit">Webdesign: <a href="https://tim-kofler.at/?utm_source=bunkerkollektiv" target="_blank" rel="noopener">Tim Kofler</a></p>
  </div>
</footer>

<a class="draft" href="https://tim-kofler.at" target="_blank" rel="noopener"><span class="tk"><img src="assets/img/tk-logo.svg" alt="" width="28" height="14"></span><span class="draft__txt">Entwurf von Tim Kofler</span></a>

<div class="vsw" role="group" aria-label="Version der Seite wählen" data-vsw>
  <span class="vsw__k" aria-hidden="true"></span>
  <button type="button" data-ver="1" aria-pressed="true">V1</button>
  <button type="button" data-ver="2" aria-pressed="false">V2</button>
</div>
<div class="ptoast" role="status" aria-live="polite" data-ptoast hidden></div>

<!-- Anfrage-Formulare (Beispiel, wird nicht verschickt) -->
<dialog class="modal" id="form-impressum" aria-labelledby="fi-t">
  <form class="modal__form modal__text" method="dialog">
    <button class="modal__x" type="button" data-close aria-label="Schließen">×</button>
    <p class="kicker">Impressum</p>
    <h2 id="fi-t">Wer hinter dem Bunker steht</h2>
    <p><b>bunker.kollektiv</b><br>Verein zur Förderung kollektiver Kunst<br>Schulgasse 3, 3251 Purgstall an der Erlauf</p>
    <p>ZVR-Zahl: 1001996773<br>E-Mail: <a href="mailto:office@bunkerkollektiv.at">office@bunkerkollektiv.at</a></p>
    <p>Fotos Gasslfestival: musil-arts. Karte: © OpenStreetMap-Mitwirkende.<br>Webdesign und Umsetzung: <a href="https://tim-kofler.at/?utm_source=bunkerkollektiv" target="_blank" rel="noopener">Tim Kofler</a></p>
    <p class="modal__demo">Entwurf: Vertretungsbefugte Personen ergänzt der Verein vor dem Start.</p>
  </form>
</dialog>

<dialog class="modal" id="form-datenschutz" aria-labelledby="fd-t">
  <form class="modal__form modal__text" method="dialog">
    <button class="modal__x" type="button" data-close aria-label="Schließen">×</button>
    <p class="kicker">Datenschutz</p>
    <h2 id="fd-t">Kein Tracking im Bunker</h2>
    <p>Diese Webseite verwendet keine Werbe- oder Statistik-Cookies und kein Tracking. Schriften und Karte liegen auf unserem eigenen Server, beim Besuch wird nichts an Google oder andere Dienste geschickt.</p>
    <p><b>Videos:</b> Die Videos kommen von YouTube und werden erst geladen, wenn du auf Abspielen tippst. Ab dann gelten die Datenschutzbestimmungen von Google.</p>
    <p><b>Karte und Route:</b> Erst ein Klick auf die Karte oder auf „Route planen“ öffnet Google Maps.</p>
    <p><b>Anfragen:</b> Was du in ein Formular schreibst, verwenden wir nur, um deine Anfrage zu beantworten, und geben es nicht weiter.</p>
    <p>Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Schreib uns an <a href="mailto:office@bunkerkollektiv.at">office@bunkerkollektiv.at</a>. Beschweren kannst du dich bei der österreichischen <a href="https://www.dsb.gv.at" target="_blank" rel="noopener">Datenschutzbehörde</a>.</p>
    <p class="modal__demo">Entwurf: Den Text stimmt der Verein vor dem Start noch ab.</p>
  </form>
</dialog>

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
  <symbol id="logo" viewBox="-30 -30 1060 1060" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <g stroke-width="36"><path d="M164 0H0V1000H1000V0H334"/><path d="M164 0V908A85 85 0 0 0 334 908V0"/><path d="M70 0C125 5 164 40 164 90"/><path d="M164 420C150 475 90 506 0 506C90 506 150 540 164 595"/><path d="M164 905C164 960 110 1000 40 1000"/><path d="M334 0L500 1000"/><path d="M500 0V1000"/><path d="M664 0L500 500L664 1000"/><path d="M664 0V1000"/><path d="M664 500H880"/><path d="M880 500C950 500 1000 460 1000 380"/><path d="M900 0C960 0 1000 30 1000 85"/><path d="M830 0V1000"/><path d="M830 500L1000 1000"/></g>
  </symbol>
  <symbol id="pi-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 4l8.5 6.5V20h-5.5v-5.5h-6V20H3.5z"/></symbol>
  <symbol id="pi-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
  <symbol id="pi-hand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5V6.2a1.6 1.6 0 0 1 3.2 0V11m0-6.2a1.6 1.6 0 0 1 3.2 0V11m0-4.6a1.6 1.6 0 0 1 3.2 0V14c0 4-2.6 7-6.4 7-2.6 0-4.2-1.3-5.6-3.4L3.9 14a1.6 1.6 0 0 1 2.6-1.8L8 14"/></symbol>
  <symbol id="pi-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6"/><path d="M15.5 5.2a3.4 3.4 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/></symbol>
  <symbol id="pi-cash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12.5" rx="3"/><circle cx="12" cy="12.2" r="2.8"/><path d="M6 9.5v5.5M18 9.5v5.5"/></symbol>
  <symbol id="pi-inbox" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5h5l1 2.5h5l1-2.5h5"/></symbol>
  <symbol id="pi-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="pi-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/></symbol>
  <symbol id="pi-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></symbol>
  <symbol id="pi-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.3-4.6"/></symbol>
  <symbol id="pi-cam" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5h3l2-3h6l2 3h3V19H4z"/><circle cx="12" cy="13" r="3.6"/></symbol>
  <symbol id="pi-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></symbol>
  <symbol id="pi-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14"/></symbol>
  <symbol id="pi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5.5 12.5 4.2 4.2L18.5 7.8"/></symbol>
  <symbol id="pi-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></symbol>
</svg>

<script src="assets/app.js?v=8" defer></script>
<script src="assets/portal.js?v=2" defer></script>
<script type="module" src="assets/bunker3d.js?v=10"></script>
</body>
</html>
