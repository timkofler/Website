"""Ratgeber: Webseite für Gastronomie"""
SLUG = "webseite-fuer-gastronomie"
KURZ = "Webseite für Gastronomie"
LABEL = "Für Gastronomie"
TITLE = "Webseite für Gasthaus, Café und Restaurant: Was muss drauf? | Tim Kofler"
DESC = ("Was gehört auf die Webseite eines Gasthauses, Cafés oder Restaurants? Speisekarte, Öffnungszeiten, "
        "Reservierung und Fotos, mit Tipps, die am Handy wirklich funktionieren.")
KARTE = "Speisekarte, Öffnungszeiten, Reservierung und Fotos: die Checkliste für Wirte."
H1_TEXT = "Webseite für Gastronomie: Was muss drauf?"
H1 = 'Webseite für Gastronomie: <span class="lime">Was muss drauf?</span>'
LEAD = ("Wer essen gehen will, entscheidet oft in zwei Minuten am Handy. Hat das Gasthaus heute offen? "
        "Was gibt es? Kann ich reservieren? Eine gute Seite beantwortet genau das, auf einen Blick.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 4
END_H2 = 'Wie sähe deine Seite aus? <span class="lime">Gratis-Entwurf in 48 Stunden.</span>'

KURZ_ANTWORT = """<ul>
        <li><strong>Öffnungszeiten, Adresse und Telefon</strong> gehören ganz nach oben, am Handy mit einem Tipp erreichbar.</li>
        <li>Die <strong>Speisekarte als Text</strong> auf der Seite, nicht als PDF oder Foto.</li>
        <li><strong>Gute Fotos</strong> von Speisen und Gaststube verkaufen mehr als jeder Text.</li>
        <li><strong>Reservierung</strong> einfach machen: Anruf per Klick oder ein kurzes Formular.</li>
      </ul>"""

ABSCHNITTE = [
    ("oben", "Das Wichtigste ganz oben", """    <ul class="rg-check">
      <li>Heute geöffnet? Öffnungszeiten und Ruhetage gut sichtbar</li>
      <li>Telefonnummer, am Handy mit einem Tipp anrufbar</li>
      <li>Adresse mit Link zur Route</li>
      <li>Ein Knopf zum Reservieren</li>
    </ul>
    <p>Betriebsurlaub, Feiertage und geänderte Zeiten sofort eintragen, auf der Webseite und im Google-Profil. Nichts ärgert Gäste mehr als eine verschlossene Tür.</p>"""),
    ("karte", "Die Speisekarte: Text statt PDF", """    <p>Viele Wirte laden die Speisekarte als PDF oder Foto hoch. Am Handy muss man dann zoomen und warten, und Google kann den Inhalt kaum lesen. Besser ist die Karte direkt als Text auf der Seite, mit Preisen und klaren Kategorien. Dann findet Google auch „Schnitzel“ oder „Mittagsmenü“ in deinem Ort.</p>
    <div class="rg-tipp"><p><strong>Tipp:</strong> Ein Wochen- oder Mittagsmenü, das du selbst in einer Minute ändern kannst, bringt Stammgäste regelmäßig auf deine Seite.</p></div>"""),
    ("fotos", "Fotos, die Appetit machen", """    <p>Zeig deine Gaststube, den Gastgarten und deine besten Gerichte, am besten bei Tageslicht und ohne Filter. Ein Foto vom Team macht das Haus persönlich. Verwende nur eigene Fotos oder Bilder mit sauberer Lizenz, mehr dazu im Ratgeber <a href="/ratgeber/bilder-fuer-webseite-rechte/">Bilder für die Webseite</a>.</p>"""),
    ("reservierung", "Reservierung: einfach halten", """    <ul>
      <li><strong>Anruf per Klick</strong> reicht für viele kleine Betriebe völlig.</li>
      <li><strong>Ein kurzes Formular</strong> mit Datum, Uhrzeit, Personen und Telefon, für Gäste, die lieber schreiben.</li>
      <li><strong>Reservierungsplattformen</strong> verlangen oft Gebühren pro Gast oder ein Monatsabo. Rechne nach, ob sich das lohnt.</li>
    </ul>"""),
    ("mehr", "Was sonst noch hilft", """    <ul class="rg-check">
      <li>Feiern und Gruppen: Räume, Plätze, Kontakt für Anfragen</li>
      <li>Gutscheine zum Verschenken</li>
      <li>Veranstaltungen wie Ganslessen, Heuriger oder Live-Musik</li>
      <li>Hinweis auf Allergene und vegetarische Gerichte</li>
    </ul>
    <p>Wie so eine Seite aussehen kann, zeigen meine Beispiele für ein <a href="/beispiele/gasthaus/">Gasthaus</a>, ein <a href="/beispiele/cafe/">Café</a> und eine <a href="/beispiele/pizzeria/">Pizzeria</a>.</p>"""),
]

FAQ = [
    ("Soll die Speisekarte als PDF auf die Webseite?",
     "Besser nicht. Als Text auf der Seite ist sie am Handy leichter lesbar, lädt schneller und wird von Google gefunden."),
    ("Brauche ich ein Online-Reservierungssystem?",
     "Für viele kleine Betriebe reichen Anruf per Klick und ein kurzes Formular. Plattformen kosten oft Gebühren pro Gast oder ein Abo."),
    ("Was muss auf die Webseite eines Restaurants?",
     "Öffnungszeiten, Adresse, Telefon, Speisekarte als Text, Fotos, eine einfache Reservierung sowie Impressum und Datenschutzerklärung."),
]
