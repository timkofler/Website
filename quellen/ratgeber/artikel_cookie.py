"""Ratgeber: Cookie-Banner Pflicht"""
SLUG = "cookie-banner-pflicht"
KURZ = "Cookie-Banner"
LABEL = "Datenschutz"
TITLE = "Brauche ich einen Cookie-Banner auf meiner Webseite? | Tim Kofler"
DESC = ("Wann eine Webseite in Österreich einen Cookie-Banner braucht und wann nicht. Welche Dienste "
        "eine Einwilligung auslösen und wie eine Seite ganz ohne Banner auskommt.")
KARTE = "Wann du einen brauchst, welche Dienste ihn auslösen und wie es ohne geht."
H1_TEXT = "Brauche ich einen Cookie-Banner?"
H1 = 'Brauche ich einen <span class="lime">Cookie-Banner?</span>'
LEAD = ("Cookie-Banner nerven Besucher und kosten Vertrauen. Nicht jede Seite braucht einen. "
        "Ob deine einen braucht, hängt davon ab, was sie im Hintergrund lädt.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 4
END_H2 = 'Eine Webseite <span class="lime">ganz ohne Cookie-Banner.</span>'

KURZ_ANTWORT = """<ul>
        <li>Ein Banner ist nötig, wenn deine Seite Cookies oder ähnliche Techniken nutzt, die <strong>nicht unbedingt nötig</strong> sind, etwa für Statistik oder Werbung.</li>
        <li>Typische Auslöser: <strong>Google Analytics, Facebook-Pixel, eingebettete YouTube-Videos und Google Maps</strong>.</li>
        <li>Verzichtet die Seite darauf, braucht sie <strong>keinen Banner</strong>.</li>
      </ul>
      <p class="rg-hinweis">Allgemeine Information, Stand November 2026. Ersetzt keine Rechtsberatung.</p>"""

ABSCHNITTE = [
    ("regel", "Die Regel in Österreich", """    <p>In Österreich regelt das Telekommunikationsgesetz (§ 165 TKG 2021), dass Informationen auf dem Gerät eines Besuchers nur mit dessen Einwilligung gespeichert oder ausgelesen werden dürfen. Ausgenommen ist, was technisch unbedingt nötig ist, etwa ein Warenkorb oder ein Login. Dazu kommt die DSGVO, sobald personenbezogene Daten wie die IP-Adresse an Dritte gehen.</p>"""),
    ("ausloeser", "Was einen Banner auslöst", """    <div class="rg-tabelle" role="region" aria-label="Was einen Cookie-Banner auslöst" tabindex="0">
    <table>
      <thead><tr><th>Auf der Seite</th><th>Banner nötig?</th></tr></thead>
      <tbody>
        <tr><th>Google Analytics, Facebook-Pixel</th><td>Ja</td></tr>
        <tr><th>YouTube-Video direkt eingebettet</th><td>Ja, oder Zwei-Klick-Lösung</td></tr>
        <tr><th>Google Maps direkt eingebettet</th><td>Ja, oder Bild mit Link</td></tr>
        <tr><th>Google Fonts vom Google-Server</th><td>Problematisch, besser lokal</td></tr>
        <tr><th>Warenkorb, Login</th><td>Nein, technisch nötig</td></tr>
        <tr><th>Reine Seite ohne Fremddienste</th><td>Nein</td></tr>
      </tbody>
    </table>
    </div>
    <ul class="rg-wege">
      <li class="is-hi"><b>Analytics, Facebook-Pixel</b><span>Banner nötig</span></li>
      <li class="is-hi"><b>YouTube oder Google Maps eingebettet</b><span>Banner nötig, oder Zwei-Klick-Lösung</span></li>
      <li><b>Google Fonts vom Google-Server</b><span>Problematisch, besser lokal laden</span></li>
      <li><b>Warenkorb, Login</b><span>Kein Banner, technisch nötig</span></li>
      <li><b>Seite ohne Fremddienste</b><span>Kein Banner</span></li>
    </ul>"""),
    ("ohne", "So geht es ohne Banner", """    <ul class="rg-check">
      <li>Schriften und Bilder vom eigenen Webspace laden</li>
      <li>Statt Google Maps ein Kartenbild mit Link zur Route</li>
      <li>Videos selbst hosten oder erst nach Klick laden</li>
      <li>Keine Werbe- und Analyse-Dienste, oder eine Statistik ohne Cookies</li>
    </ul>
    <p>Meine eigene Seite kommt genau so ganz ohne Cookie-Banner aus. Wie das im Detail aussieht, steht in <a href="/datenschutz/">meiner Datenschutzerklärung</a>.</p>"""),
    ("richtig", "Wenn du einen brauchst: richtig machen", """    <ul>
      <li><strong>„Ablehnen“ genauso einfach wie „Akzeptieren“.</strong> Ein versteckter Ablehnen-Knopf ist unzulässig.</li>
      <li><strong>Vorher nichts laden.</strong> Dienste dürfen erst nach der Zustimmung starten.</li>
      <li><strong>Widerruf ermöglichen</strong>, etwa über einen Link im Footer.</li>
    </ul>"""),
]

FAQ = [
    ("Braucht jede Webseite einen Cookie-Banner?",
     "Nein. Nur wenn die Seite Cookies oder ähnliche Techniken nutzt, die nicht unbedingt nötig sind, etwa für Statistik, Werbung oder eingebettete Fremddienste."),
    ("Brauche ich für Google Maps einen Cookie-Banner?",
     "Wenn die Karte direkt eingebettet ist, ja, weil dabei Daten an Google gehen. Ein Kartenbild mit Link zu Google Maps braucht keinen Banner."),
    ("Kann ich ohne Google Analytics sehen, wie viele Besucher kommen?",
     "Ja. Viele Webspace-Anbieter liefern eine einfache Statistik aus anonymen Server-Logfiles, ganz ohne Cookies."),
]
END_CHIPS = ["Kein Banner", "Kein Tracking", "Schnell geladen"]
