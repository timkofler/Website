"""Ratgeber: Baukasten oder Webdesigner"""
SLUG = "baukasten-oder-webdesigner"
KURZ = "Baukasten oder Webdesigner?"
LABEL = "Entscheidungshilfe"
TITLE = "Baukasten oder Webdesigner? Wix, Jimdo oder eigene Seite | Tim Kofler"
DESC = ("Wix, Jimdo, WordPress oder ein Webdesigner? Ehrlicher Vergleich von Kosten, Zeit, Design und "
        "Google-Sichtbarkeit, damit du die richtige Wahl für deinen Betrieb triffst.")
KARTE = "Wix, Jimdo oder eigene Seite: ehrlicher Vergleich von Kosten, Zeit und Ergebnis."
H1_TEXT = "Baukasten oder Webdesigner?"
H1 = 'Baukasten <span class="lime">oder Webdesigner?</span>'
LEAD = ("Wix, Jimdo und Co. versprechen eine Webseite in einer Stunde. Ein Webdesigner kostet mehr, "
        "nimmt dir aber die Arbeit ab. Was wann besser passt, und wo die Haken liegen.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 5
END_H2 = 'Lieber nicht selbst basteln? <span class="lime">Ich zeig dir erst den Entwurf.</span>'

KURZ_ANTWORT = """<ul>
        <li><strong>Baukasten</strong> passt, wenn du Zeit hast, gern selbst gestaltest und das Budget sehr klein ist.</li>
        <li><strong>Webdesigner</strong> passt, wenn die Seite Kunden bringen soll und du dich lieber um deinen Betrieb kümmerst.</li>
        <li>Der Baukasten wirkt billiger, kostet aber jeden Monat. Nach ein paar Jahren ist der Unterschied oft klein.</li>
      </ul>"""

ABSCHNITTE = [
    ("vergleich", "Der direkte Vergleich", """    <div class="rg-tabelle" role="region" aria-label="Vergleich Baukasten und Webdesigner" tabindex="0">
    <table>
      <thead><tr><th></th><th>Baukasten</th><th>Webdesigner</th></tr></thead>
      <tbody>
        <tr><th>Kosten am Anfang</th><td>0–50 €</td><td>einmalig, je nach Umfang</td></tr>
        <tr><th>Kosten laufend</th><td>10–40 € / Monat</td><td>5–15 € / Monat Webspace</td></tr>
        <tr><th>Deine Zeit</th><td>viele Abende</td><td>Texte und Fotos liefern</td></tr>
        <tr><th>Design</th><td>Vorlage, die viele haben</td><td>eigenes Design</td></tr>
        <tr><th>Ladezeit</th><td>oft schwer</td><td>so schlank wie nötig</td></tr>
        <tr><th>Umzug möglich?</th><td>kaum</td><td>ja, gehört dir</td></tr>
      </tbody>
    </table>
    </div>
    <ul class="rg-wege">
      <li><b>Baukasten</b><span>0–50 € Start, 10–40 € / Monat</span><span>Du baust selbst mit einer Vorlage. Umzug zu einem anderen Anbieter kaum möglich.</span></li>
      <li class="is-hi"><b>Webdesigner</b><span>Einmalig, dazu 5–15 € / Monat Webspace</span><span>Eigenes Design, schnell geladen, die Seite gehört dir. Du lieferst Texte und Fotos.</span></li>
    </ul>"""),
    ("baukasten", "Wann ein Baukasten reicht", """    <p>Für ein Hobbyprojekt, eine Idee, die du erst testen willst, oder wenn du wirklich gern selbst gestaltest, ist ein Baukasten eine gute Wahl. Du bist schnell online und kannst jederzeit selbst etwas ändern.</p>
    <p>Rechne aber ehrlich mit deiner Zeit: Texte schreiben, Fotos zuschneiden, Handy-Ansicht prüfen, Impressum, Datenschutz und Cookie-Hinweis. Das sind schnell mehrere Abende.</p>"""),
    ("haken", "Die Haken beim Baukasten", """    <ul>
      <li><strong>Die Seite gehört dem Anbieter.</strong> Hörst du auf zu zahlen, ist sie weg. Mitnehmen kannst du sie meist nicht.</li>
      <li><strong>Gleiche Vorlagen.</strong> Viele Betriebe in deiner Branche sehen dann genauso aus.</li>
      <li><strong>Ladezeit.</strong> Baukästen laden viel Code, den deine Seite gar nicht braucht. Das merkt man am Handy.</li>
      <li><strong>Cookies und Datenschutz.</strong> Viele Baukästen binden Dienste ein, für die du einen Cookie-Banner brauchst.</li>
    </ul>"""),
    ("webdesigner", "Wann sich ein Webdesigner lohnt", """    <p>Wenn die Seite Anfragen bringen soll, zählt der erste Eindruck. Ein Webdesigner sorgt dafür, dass sie am Handy gut aussieht, schnell lädt, bei Google richtig eingerichtet ist und Besucher mit einem Klick anrufen oder schreiben können. Du lieferst Texte und Fotos, den Rest erledigt jemand, der das jeden Tag macht.</p>
    <p>Wichtig: Achte darauf, dass Domain und Webspace auf deinen Namen laufen und kein Pflicht-Abo dabei ist. Dann bist du nie abhängig.</p>"""),
    ("wordpress", "Und WordPress?", """    <p>WordPress liegt dazwischen: Die Seite gehört dir, aber Themes und Plugins brauchen regelmäßige Updates, sonst wird es unsicher. Für Blogs und große Seiten ist das praktisch, für die Seite eines kleinen Betriebs oft mehr Wartung als nötig.</p>"""),
    ("bei-mir", "So mache ich das", """    <p>Ich programmiere jede Seite selbst, ohne Baukasten und ohne WordPress. Einmal zahlen, kein Abo, die Seite gehört dir. Vorher siehst du einen <a href="/entwurf/">kostenlosen Entwurf</a>. Was das kostet, steht im Ratgeber <a href="/ratgeber/was-kostet-eine-webseite/">Was kostet eine Webseite?</a></p>"""),
]

FAQ = [
    ("Ist ein Baukasten wie Wix oder Jimdo schlecht für Google?",
     "Nicht grundsätzlich. Baukasten-Seiten laden aber oft langsamer und sehen ähnlich aus wie viele andere. Gute Texte, schnelle Ladezeit und ein Google-Unternehmensprofil machen mehr aus als das Werkzeug."),
    ("Kann ich später vom Baukasten zu einem Webdesigner wechseln?",
     "Ja, aber meistens wird die Seite neu gebaut, weil sich Baukasten-Seiten kaum exportieren lassen. Texte und Fotos kannst du mitnehmen, die Domain auch."),
    ("Kann ich bei einer Seite vom Webdesigner selbst etwas ändern?",
     "Das hängt vom Webdesigner ab. Kleine Änderungen wie Öffnungszeiten oder News lassen sich oft selbst pflegen, oder du schickst sie kurz per Nachricht."),
]
