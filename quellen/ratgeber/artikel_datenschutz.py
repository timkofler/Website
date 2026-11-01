"""Ratgeber: Datenschutzerklärung Webseite"""
SLUG = "datenschutzerklaerung-webseite"
KURZ = "Datenschutzerklärung"
LABEL = "Rechtliches"
TITLE = "Datenschutzerklärung Webseite: Was muss rein? | Tim Kofler"
DESC = ("Wann deine Webseite eine Datenschutzerklärung braucht, was nach der DSGVO hinein muss und welche Dienste "
        "du erwähnen musst. Mit Checkliste für Betriebe in Österreich.")
KARTE = "Wann du eine brauchst, was nach der DSGVO hinein muss und typische Fehler."
H1_TEXT = "Datenschutzerklärung für die Webseite: Was muss rein?"
H1 = 'Datenschutzerklärung: <span class="lime">Was muss rein?</span>'
LEAD = ("Kaum eine Webseite kommt ohne Datenschutzerklärung aus. Klingt kompliziert, ist aber mit einer "
        "klaren Checkliste gut zu schaffen.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 5
END_H2 = 'Impressum und Datenschutz <span class="lime">sind bei mir dabei.</span>'

KURZ_ANTWORT = """<ul>
        <li>Eine Datenschutzerklärung brauchst du, sobald deine Seite <strong>personenbezogene Daten</strong> verarbeitet. Das ist fast immer der Fall, schon wegen der IP-Adresse.</li>
        <li>Hinein gehören: <strong>wer verantwortlich ist, welche Daten, wofür, auf welcher Grundlage, wie lange</strong> und welche Rechte Besucher haben.</li>
        <li>Jeder eingebundene Dienst wie <strong>Google Maps oder YouTube</strong> muss erwähnt werden.</li>
      </ul>
      <p class="rg-hinweis">Allgemeine Information, Stand November 2026. Ersetzt keine Rechtsberatung.</p>"""

ABSCHNITTE = [
    ("wann", "Wann du eine Datenschutzerklärung brauchst", """    <p>Die DSGVO verlangt, dass du Besucher informierst, wenn du ihre Daten verarbeitest (Art. 13 DSGVO). Schon beim Aufruf einer Seite speichert der Server meist die IP-Adresse in einem Protokoll. Spätestens mit einem Kontaktformular, einer eingebundenen Karte oder einem Newsletter kommst du um eine Datenschutzerklärung nicht herum.</p>"""),
    ("inhalt", "Das gehört hinein", """    <ul class="rg-check">
      <li>Name und Kontakt des Verantwortlichen, also dein Betrieb</li>
      <li>Welche Daten verarbeitet werden, etwa Server-Protokolle oder Formulareingaben</li>
      <li>Wofür und auf welcher Rechtsgrundlage</li>
      <li>An wen Daten gehen, zum Beispiel Webspace-Anbieter oder Mail-Dienst</li>
      <li>Wie lange die Daten gespeichert bleiben</li>
      <li>Die Rechte der Besucher: Auskunft, Berichtigung, Löschung, Widerspruch</li>
      <li>Das Beschwerderecht bei der österreichischen Datenschutzbehörde</li>
    </ul>"""),
    ("dienste", "Diese Dienste musst du erwähnen", """    <ul>
      <li><strong>Kontaktformular:</strong> welche Felder, wohin die Nachricht geht, wie lange sie gespeichert wird.</li>
      <li><strong>Google Maps, YouTube, Instagram-Feeds:</strong> Daten gehen an Dritte, oft auch in die USA.</li>
      <li><strong>Statistik und Werbung:</strong> Google Analytics, Facebook-Pixel und Ähnliches brauchen zusätzlich eine Einwilligung.</li>
      <li><strong>Schriften:</strong> Google Fonts besser vom eigenen Webspace laden.</li>
    </ul>
    <p>Je weniger fremde Dienste deine Seite lädt, desto kürzer und einfacher wird die Erklärung. Mehr dazu im Ratgeber <a href="/ratgeber/cookie-banner-pflicht/">Brauche ich einen Cookie-Banner?</a></p>"""),
    ("generator", "Muster und Generatoren: ja oder nein?", """    <p>Generatoren und Muster sind ein guter Start. Sie passen aber nur, wenn du ehrlich angibst, was deine Seite wirklich nutzt. Eine kopierte Erklärung, die Google Analytics nennt, obwohl du es gar nicht verwendest, oder umgekehrt einen Dienst verschweigt, ist schlimmer als eine kurze, richtige.</p>"""),
    ("fehler", "Häufige Fehler", """    <ul>
      <li>Die Datenschutzerklärung ist nur schwer zu finden. Sie gehört in den Footer jeder Seite.</li>
      <li>Neue Dienste werden eingebaut, die Erklärung aber nicht angepasst.</li>
      <li>Daten werden länger gespeichert als angegeben.</li>
    </ul>
    <div class="rg-tipp"><p><strong>Tipp:</strong> Schau deine Datenschutzerklärung jedes Mal an, wenn sich auf der Seite etwas ändert, etwa ein neues Formular oder eine eingebundene Karte.</p></div>"""),
]

FAQ = [
    ("Braucht jede Webseite eine Datenschutzerklärung?",
     "Fast jede. Sobald personenbezogene Daten verarbeitet werden, etwa die IP-Adresse in Server-Protokollen oder Eingaben im Kontaktformular, muss die Seite darüber informieren."),
    ("Was muss in eine Datenschutzerklärung?",
     "Wer verantwortlich ist, welche Daten wofür und auf welcher Grundlage verarbeitet werden, an wen sie gehen, wie lange sie gespeichert bleiben und welche Rechte Besucher haben, inklusive Beschwerderecht bei der Datenschutzbehörde."),
    ("Kann ich eine Datenschutzerklärung aus dem Internet kopieren?",
     "Als Vorlage ja, aber sie muss zu deiner Seite passen. Nenne genau die Dienste und Daten, die deine Seite wirklich nutzt."),
]
