"""Ratgeber: Domain und Webspace"""
SLUG = "domain-und-webspace"
KURZ = "Domain und Webspace"
LABEL = "Technik einfach erklärt"
TITLE = "Domain und Webspace: Was brauche ich, was kostet es? | Tim Kofler"
DESC = ("Was ist eine Domain, was ist Webspace, und was kostet beides in Österreich? Einfach erklärt, "
        "mit Tipps zur .at-Domain, eigenen E-Mail-Adressen und worauf du beim Anbieter achten solltest.")
KARTE = ".at-Domain, Webspace und E-Mail-Adressen: was du brauchst und was es kostet."
H1_TEXT = "Domain und Webspace: Was brauche ich, was kostet es?"
H1 = 'Domain und Webspace: <span class="lime">Was brauche ich?</span>'
LEAD = ("Domain, Webspace, Hosting, SSL: Für viele klingt das nach Technik, die man nicht versteht. "
        "Dabei ist es einfach, und günstiger als gedacht.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 4
END_H2 = 'Noch keine Domain? <span class="lime">Ich helfe beim Einrichten.</span>'

KURZ_ANTWORT = """<ul>
        <li>Die <strong>Domain</strong> ist deine Adresse im Internet, zum Beispiel deinbetrieb.at.</li>
        <li>Der <strong>Webspace</strong> ist der Speicherplatz, auf dem deine Seite liegt. Meist sind E-Mail-Postfächer dabei.</li>
        <li>Zusammen kostet das etwa <strong>5 bis 15 € im Monat</strong>, oft ist die Domain im Tarif schon enthalten.</li>
        <li>Beides sollte <strong>auf deinen Namen</strong> laufen.</li>
      </ul>"""

ABSCHNITTE = [
    ("bild", "Einfach erklärt: Adresse und Grundstück", """    <p>Stell dir die Domain als Hausnummer vor und den Webspace als Grundstück, auf dem das Haus steht. Die Webseite selbst ist das Haus. Ohne Adresse findet dich niemand, ohne Grundstück gibt es keinen Platz für das Haus.</p>"""),
    ("domain", "Die passende Domain finden", """    <ul class="rg-check">
      <li>Kurz und leicht zu merken, am besten der Name deines Betriebs</li>
      <li>Endung .at für Kunden in Österreich, sie wirkt vertraut und regional</li>
      <li>Keine Umlaute: statt „bäckerei“ lieber „baeckerei“</li>
      <li>Bindestriche nur, wenn es nicht anders geht</li>
    </ul>
    <p>Ob eine .at-Domain noch frei ist, siehst du bei jedem Anbieter oder direkt bei nic.at. Registriert wird sie über einen Webhosting-Anbieter, oft gleich mit dem Webspace.</p>"""),
    ("webspace", "Worauf du beim Webspace achten solltest", """    <ul>
      <li><strong>Server in der EU.</strong> Das macht es mit dem Datenschutz einfacher.</li>
      <li><strong>SSL-Zertifikat</strong> für das Schloss im Browser, heute Pflicht. Bei guten Anbietern kostenlos dabei.</li>
      <li><strong>E-Mail-Postfächer</strong> wie office@deinbetrieb.at, das wirkt professioneller als eine Gmail-Adresse.</li>
      <li><strong>Erreichbarer Support</strong>, falls einmal etwas klemmt.</li>
      <li><strong>Keine lange Bindung.</strong> Monatlich kündbar ist ideal.</li>
    </ul>"""),
    ("kosten", "Was es kostet", """    <div class="rg-tabelle" role="region" aria-label="Kosten Domain und Webspace" tabindex="0">
    <table>
      <thead><tr><th>Posten</th><th>Richtwert</th></tr></thead>
      <tbody>
        <tr><th>.at-Domain</th><td>oft im Tarif enthalten, sonst ca. 10–30 € / Jahr</td></tr>
        <tr><th>Webspace mit E-Mail</th><td>ca. 5–15 € / Monat</td></tr>
        <tr><th>SSL-Zertifikat</th><td>bei vielen Anbietern gratis</td></tr>
      </tbody>
    </table>
    </div>
    <ul class="rg-wege">
      <li><b>.at-Domain</b><span>oft im Tarif, sonst ca. 10–30 € / Jahr</span></li>
      <li><b>Webspace mit E-Mail</b><span>ca. 5–15 € / Monat</span></li>
      <li><b>SSL-Zertifikat</b><span>bei vielen Anbietern gratis</span></li>
    </ul>"""),
    ("eigentum", "Wichtig: Auf deinen Namen", """    <div class="rg-tipp"><p><strong>Tipp:</strong> Domain und Webspace sollten immer auf dich oder deinen Betrieb registriert sein, nicht auf den Webdesigner. Dann kannst du jederzeit wechseln, und deine E-Mail-Adresse bleibt deine.</p></div>
    <p>Bei meinen Kunden läuft alles auf ihren eigenen Namen. Wenn du noch keinen Anbieter hast, helfe ich bei der Auswahl und richte alles ein. Welchen Anbieter ich selbst nutze, steht in den <a href="/#fragen">häufigen Fragen auf der Startseite</a>.</p>"""),
]

FAQ = [
    ("Was ist der Unterschied zwischen Domain und Webspace?",
     "Die Domain ist die Adresse, unter der man deine Seite findet, etwa deinbetrieb.at. Der Webspace ist der Speicherplatz auf einem Server, auf dem die Seite liegt."),
    ("Was kostet eine .at-Domain?",
     "Bei vielen Webspace-Tarifen ist eine .at-Domain enthalten. Einzeln kostet sie je nach Anbieter etwa 10 bis 30 € im Jahr."),
    ("Kann ich meine Domain zu einem anderen Anbieter mitnehmen?",
     "Ja, wenn sie auf deinen Namen registriert ist. Der Umzug läuft über einen Code, den du beim alten Anbieter bekommst."),
]
