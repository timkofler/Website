"""Ratgeber: Webseite für Vereine"""
SLUG = "webseite-fuer-vereine"
KURZ = "Webseite für Vereine"
LABEL = "Für Vereine"
TITLE = "Webseite für Vereine: Was muss drauf? Checkliste | Tim Kofler"
DESC = ("Was gehört auf die Webseite eines Vereins? Inhalte, Impressum mit ZVR-Zahl, Fotos und Datenschutz, "
        "dazu Tipps, wie die Seite ohne viel Aufwand aktuell bleibt.")
KARTE = "Inhalte, Impressum mit ZVR-Zahl, Fotos und Datenschutz: die Checkliste für Vereine."
H1_TEXT = "Webseite für Vereine: Was muss drauf?"
H1 = 'Webseite für Vereine: <span class="lime">Was muss drauf?</span>'
LEAD = ("Ob Sportverein, Musikkapelle oder Kulturverein: Neue Mitglieder, Sponsoren und Besucher "
        "suchen zuerst im Internet. Diese Checkliste zeigt, was auf eine gute Vereinsseite gehört.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 5
END_H2 = 'Für Vereine baue ich die Seite <span class="lime">gratis.</span>'
CTA_HREF = "/verein/"
CTA_TEXT = "Gratis-Webseite für Vereine"
CTA_ALT = 'Mehr zum Ablauf auf der Seite <a href="/verein/">Webseite für Vereine</a>'
END_CHIPS = ["Gratis", "Ganz Österreich", "Kein Abo"]

KURZ_ANTWORT = """<ul>
        <li><strong>Pflicht:</strong> Impressum mit Vereinsname, ZVR-Zahl, Sitz und Vertretung, dazu eine Datenschutzerklärung.</li>
        <li><strong>Wichtig:</strong> Wer ihr seid, Termine, wie man Mitglied wird, Kontakt.</li>
        <li><strong>Fotos</strong> nur mit Erlaubnis, bei Kindern besonders vorsichtig.</li>
        <li><strong>Einfach halten</strong>, damit die Seite auch nach dem nächsten Vorstandswechsel aktuell bleibt.</li>
      </ul>
      <p class="rg-hinweis">Allgemeine Information, Stand November 2026. Ersetzt keine Rechtsberatung.</p>"""

ABSCHNITTE = [
    ("inhalte", "Diese Inhalte gehören auf jede Vereinsseite", """    <ul class="rg-check">
      <li>Über uns: wer ihr seid, seit wann, was ihr macht</li>
      <li>Termine: Training, Proben, Veranstaltungen</li>
      <li>Mitglied werden: was es kostet und wie es geht</li>
      <li>Vorstand und Ansprechpersonen</li>
      <li>Kontakt mit Adresse, E-Mail und Anfahrt</li>
      <li>Fotos von Festen, Spielen, Auftritten</li>
      <li>Sponsoren und Partner mit Logo und Link</li>
    </ul>"""),
    ("pflicht", "Pflichtangaben: Impressum und Datenschutz", """    <p>Auch ein Verein braucht ein Impressum. Hinein gehören der Vereinsname, die ZVR-Zahl aus dem Vereinsregister, der Sitz, die Kontaktdaten und wer den Verein nach außen vertritt, meist Obfrau oder Obmann. Dazu kommt die Offenlegung nach dem Mediengesetz mit dem Vereinszweck.</p>
    <p>Sobald die Seite ein Kontaktformular oder eine Anmeldung hat, braucht sie außerdem eine Datenschutzerklärung. Mehr dazu im Ratgeber <a href="/ratgeber/impressum-webseite-oesterreich/">Impressum in Österreich</a>.</p>"""),
    ("fotos", "Fotos: Was ist erlaubt?", """    <ul>
      <li><strong>Gruppenfotos von öffentlichen Veranstaltungen</strong> sind meist unproblematisch, solange niemand bloßgestellt wird.</li>
      <li><strong>Porträts und Fotos von Einzelnen</strong> nur mit Einverständnis.</li>
      <li><strong>Kinder und Jugendliche:</strong> Einverständnis der Eltern einholen, am besten gleich bei der Anmeldung.</li>
      <li><strong>Fremde Bilder</strong> aus dem Internet nie einfach verwenden. Nur eigene Fotos oder Bilder mit freier Lizenz.</li>
    </ul>"""),
    ("aktuell", "So bleibt die Seite aktuell", """    <p>Die größte Gefahr für eine Vereinsseite ist, dass sie einschläft. Der Termin vom letzten Sommer steht noch ganz oben, und niemand weiß mehr das Passwort. Ein paar einfache Regeln helfen:</p>
    <ul>
      <li>Eine Person ist zuständig, eine zweite hat die Zugangsdaten.</li>
      <li>Domain und Webspace laufen auf den Verein, nicht auf ein Mitglied.</li>
      <li>Lieber wenige Seiten, die stimmen, als viele, die veraltet sind.</li>
    </ul>"""),
    ("kosten", "Was kostet eine Vereinsseite?", """    <p>Laufend zahlt der Verein nur Domain und Webspace, etwa 5 bis 10 € im Monat. Für Vereine in ganz Österreich baue ich die Seite gratis, maximal zwei pro Monat. Dafür steht unten auf eurer Seite ein kleiner Hinweis auf mich. Alles Weitere steht auf der Seite <a href="/verein/">Gratis-Webseite für Vereine</a>.</p>"""),
]

FAQ = [
    ("Braucht ein Verein ein Impressum?",
     "Ja. Ins Impressum gehören Vereinsname, ZVR-Zahl, Sitz, Kontaktdaten und die vertretungsbefugte Person, dazu die Offenlegung nach dem Mediengesetz."),
    ("Darf der Verein Fotos von Mitgliedern online stellen?",
     "Gruppenfotos von öffentlichen Veranstaltungen meist ja. Für Porträts und vor allem für Fotos von Kindern sollte vorher das Einverständnis eingeholt werden."),
    ("Was kostet eine Webseite für einen Verein?",
     "Laufend nur Domain und Webspace, etwa 5 bis 10 € im Monat. Die Seite selbst baue ich für Vereine gratis, gegen einen kleinen Hinweis auf mich im Footer."),
]
