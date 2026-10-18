<?php
// Tim Kofler – „Vorschau in 60 Sekunden“: Formular und Anzeige einer erzeugten Vorschau (/vorschau/<id>/).

declare(strict_types=1);

require __DIR__ . '/../api/vorschau-lib.php';

$id = (string) ($_GET['id'] ?? '');

// ---------------- Fertige Vorschau ----------------
if ($id !== '') {
    $v = vs_load($id);
    if ($v === null) {
        http_response_code(404);
        vs_page('Vorschau nicht gefunden', 'Diese Vorschau gibt es nicht mehr.', <<<HTML
<section class="section"><div class="container prose" style="max-width:640px">
  <h1>Diese Vorschau gibt es nicht mehr</h1>
  <p>Vorschauen werden nach einigen Wochen automatisch gelöscht. In einer Minute hast du eine neue.</p>
  <p><a class="btn" href="/vorschau/">Neue Vorschau erzeugen</a></p>
</div></section>
HTML);
    }
    $i = $v['inhalt'];
    $firma = cx_h($v['firma']);
    $site = vs_render($v);
    $anfrage = cx_h(vs_anfrage_url($v));
    $link = cx_h(vs_url($v['id']));
    $farbe = cx_h($i['akzent']);
    $farbName = cx_h($i['akzent_name'] !== '' ? $i['akzent_name'] : $i['akzent']);
    $farbWarum = cx_h($i['farb_begruendung']);
    $datum = cx_h(date('d.m.Y', strtotime((string) $v['zeit']) ?: time()));
    $ort = cx_h($v['ort']);

    vs_page('Vorschau für ' . $v['firma'], 'So könnte die Webseite von ' . $v['firma'] . ' in ' . $v['ort'] . ' aussehen.', <<<HTML
<section class="page-head">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="container" style="position:relative">
    <div class="crumbs"><a href="/">Start</a> / <a href="/vorschau/">Vorschau</a> / {$firma}</div>
    <span class="label"><b>●</b> Vorschau vom {$datum}</span>
    <h1>So könnte die Seite von <span class="lime">{$firma}</span> aussehen.</h1>
    <p class="lead">Ein erster Entwurf mit Texten und einem Farbvorschlag, automatisch erzeugt aus Name, Branche und Ort. Die fertige Seite bekommt deine Fotos, deine Worte und ein Design, das es nur einmal gibt.</p>
  </div>
</section>

<section class="section" style="padding-top:40px">
  <div class="container">
    {$site}
    <div class="vs-meta">
      <div class="vs-farbe"><i style="background:{$farbe}"></i><div><b>Farbvorschlag: {$farbName}</b><span>{$farbWarum}</span></div></div>
      <p class="muted">Die grauen Flächen sind Platzhalter für deine Fotos. Texte sind ein Vorschlag und werden mit dir gemeinsam angepasst.</p>
    </div>
  </div>
</section>

<section class="section section--line" id="weiter">
  <div class="container vs-cta">
    <div>
      <span class="label"><b>●</b> Nächster Schritt</span>
      <h2>Gefällt dir die Richtung?</h2>
      <p class="muted">Dann sag mir kurz Bescheid. Ich melde mich innerhalb von zwei Werktagen persönlich, und du bekommst ein unverbindliches Angebot. Eine einfache Seite gibt es für die ersten Referenzkunden ab 290 €.</p>
      <div class="btn-row">
        <a class="btn" href="{$anfrage}">So eine Seite will ich <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a class="btn btn--line" href="/vorschau/">Andere Vorschau erzeugen</a>
      </div>
    </div>
    <aside class="vs-share">
      <h3>Vorschau teilen</h3>
      <p class="muted">Dieser Link bleibt einige Wochen gültig, zum Weiterleiten an Partner oder Familie.</p>
      <div class="vs-link"><input type="text" readonly value="{$link}" aria-label="Link zur Vorschau" data-vs-link><button class="btn btn--sm btn--line" type="button" data-vs-copy>Kopieren</button></div>
      <p class="note-legal" style="margin-top:18px">Keine Cookies, kein Tracking. Für diese Vorschau wurden nur Name, Branche und Ort an die Text-KI übertragen. <a href="/datenschutz/#vorschau">Mehr dazu</a></p>
    </aside>
  </div>
</section>
HTML, vs_url($v['id']));
}

// ---------------- Formular ----------------
$bereit = vs_ready();
$frei = $bereit && vs_tag_ok(false);
$options = '';
foreach (VS_BRANCHEN as $b) {
    $options .= '<option>' . cx_h($b) . '</option>';
}
$hinweis = '';
if (!$bereit) {
    $hinweis = '<p class="form__status is-error" role="status">Die Vorschau wird gerade eingerichtet und ist in Kürze verfügbar. Bis dahin: Schreib mir an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a>, dann baue ich dir eine.</p>';
} elseif (!$frei) {
    $hinweis = '<p class="form__status is-error" role="status">Für heute sind alle kostenlosen Vorschauen vergeben. Morgen geht es weiter, oder schreib mir an <a href="mailto:office@tim-kofler.at">office@tim-kofler.at</a>.</p>';
}
$disabled = $frei ? '' : ' disabled';

vs_page('Vorschau in 60 Sekunden', 'Firmenname, Branche und Ort eingeben und in einer Minute sehen, wie deine neue Webseite aussehen könnte. Kostenlos, ohne Anmeldung, ohne Tracking.', <<<HTML
<section class="page-head">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="container" style="position:relative">
    <div class="crumbs"><a href="/">Start</a> / Vorschau</div>
    <span class="label"><b>●</b> Kostenlos · ohne Anmeldung</span>
    <h1>Deine Webseite. <span class="lime">Vorschau in 60 Sekunden.</span></h1>
    <p class="lead">Gib den Namen deines Betriebs, die Branche und den Ort ein. Eine Minute später siehst du einen ersten Entwurf: passende Texte, ein Farbvorschlag und der Aufbau der Startseite. Kein Baukasten, keine E-Mail-Adresse nötig.</p>
  </div>
</section>

<section class="section" style="padding-top:48px">
  <div class="container form-wrap">
    <div>
      <form class="form" action="/api/vorschau.php" method="post" data-vs-form>
        <div class="form__hp" aria-hidden="true"><label>Webseite<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <input type="hidden" name="ts" value="">
        {$hinweis}
        <label class="form__field"><span>Name deines Betriebs</span><input type="text" name="firma" required minlength="2" maxlength="80" placeholder="z. B. Tischlerei Huber" autocomplete="organization"{$disabled}></label>
        <div class="form__row">
          <label class="form__field"><span>Branche</span>
            <select name="branche" required data-vs-branche{$disabled}><option value="">Bitte wählen</option>{$options}</select></label>
          <label class="form__field"><span>Ort</span><input type="text" name="ort" required minlength="2" maxlength="80" placeholder="z. B. Oberndorf an der Melk" autocomplete="address-level2"{$disabled}></label>
        </div>
        <label class="form__field" data-vs-frei hidden><span>Branche genauer <em>(frei eintippen)</em></span><input type="text" name="branche_frei" maxlength="80" placeholder="z. B. Hufschmied, Imkerei, Tanzschule"{$disabled}></label>
        <button class="btn" type="submit"{$disabled}>Vorschau erzeugen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        <p class="form__status" role="status" aria-live="polite" hidden></p>
        <p class="form__alt">Die Texte schreibt eine Text-KI (Claude von Anthropic) aus genau diesen drei Angaben. Es werden keine persönlichen Daten abgefragt oder gespeichert. <a href="/datenschutz/#vorschau">Details zum Datenschutz</a></p>
      </form>
    </div>
    <aside class="form-aside">
      <h2>Was du bekommst</h2>
      <ol class="form-steps">
        <li><b>Texte für deine Startseite</b><span>Slogan, Leistungen, Über-uns-Text und Kontaktbereich, in deiner Sprache und für deine Branche.</span></li>
        <li><b>Einen Farbvorschlag</b><span>Eine Akzentfarbe, die zu deinem Betrieb passt, mit kurzer Begründung.</span></li>
        <li><b>Einen teilbaren Link</b><span>Zum Weiterschicken an Partner oder Familie. Die Vorschau bleibt einige Wochen online.</span></li>
      </ol>
      <p class="note-legal">Die Vorschau ist ein automatischer erster Entwurf, keine fertige Webseite. Die echte Seite baue ich individuell mit deinen Fotos und Texten. <a href="/beispiele/">Fertige Beispielseiten ansehen</a></p>
    </aside>
  </div>
</section>
HTML, 'https://tim-kofler.at/vorschau/', true);
