"""Ratgeber: Barrierefreiheitsgesetz und die eigene Webseite"""
SLUG = "barrierefreiheitsgesetz-webseite"
KURZ = "Barrierefreiheitsgesetz"
LABEL = "Seit Juni 2025"
TITLE = "Barrierefreiheitsgesetz: Betrifft es meine Webseite? | Tim Kofler"
DESC = ("Seit 28. Juni 2025 gilt in Österreich das Barrierefreiheitsgesetz (BaFG). Wer betroffen ist, "
        "wer ausgenommen ist und was eine barrierearme Webseite ausmacht, einfach erklärt.")
KARTE = "Seit Juni 2025 in Kraft: wer betroffen ist, wer nicht und was trotzdem sinnvoll ist."
H1_TEXT = "Barrierefreiheitsgesetz: Betrifft es meine Webseite?"
H1 = 'Barrierefreiheitsgesetz: <span class="lime">Betrifft es meine Webseite?</span>'
LEAD = ("Seit Sommer 2025 gilt das Barrierefreiheitsgesetz. Viele kleine Betriebe sind unsicher, ob sie "
        "jetzt ihre Webseite umbauen müssen. Meistens nicht, aber es lohnt sich trotzdem.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 5
END_H2 = 'Eine Webseite, die <span class="lime">alle gut bedienen können.</span>'

KURZ_ANTWORT = """<ul>
        <li>Das <strong>Barrierefreiheitsgesetz (BaFG)</strong> gilt seit <strong>28. Juni 2025</strong>.</li>
        <li>Betroffen sind vor allem Seiten, über die man <strong>online etwas kauft oder bucht</strong>, also Shops und Buchungen mit Vertragsabschluss.</li>
        <li><strong>Kleinstunternehmen</strong> mit weniger als 10 Beschäftigten und höchstens 2 Mio. € Jahresumsatz sind bei Dienstleistungen ausgenommen.</li>
        <li>Eine reine Info-Seite (Leistungen, Fotos, Kontakt) fällt in der Regel nicht darunter.</li>
      </ul>
      <p class="rg-hinweis">Allgemeine Information, Stand November 2026. Ersetzt keine Rechtsberatung. Im Einzelfall hilft deine Wirtschaftskammer.</p>"""

ABSCHNITTE = [
    ("was", "Worum geht es im Gesetz?", """    <p>Das BaFG setzt eine EU-Richtlinie um, den European Accessibility Act. Ziel ist, dass Menschen mit Behinderungen bestimmte Produkte und Dienstleistungen genauso nutzen können wie alle anderen. Dazu gehören zum Beispiel Onlineshops, Bankdienste, E-Books, Fahrkarten und Buchungen im Personenverkehr.</p>
    <p>Für Webseiten heißt das: Wer über seine Seite Verträge mit Verbrauchern abschließt, muss sie so bauen, dass sie auch mit Screenreader, nur mit Tastatur oder mit vergrößerter Schrift funktioniert. Als Maßstab gelten die WCAG-Richtlinien, Stufe AA.</p>"""),
    ("wer", "Wer ist betroffen, wer nicht?", """    <div class="rg-tabelle" role="region" aria-label="Wer ist betroffen" tabindex="0">
    <table>
      <thead><tr><th>Art der Seite</th><th>BaFG?</th></tr></thead>
      <tbody>
        <tr><th>Info-Seite: Leistungen, Fotos, Kontakt</th><td>In der Regel nein</td></tr>
        <tr><th>Onlineshop eines Kleinstunternehmens</th><td>Ausgenommen</td></tr>
        <tr><th>Onlineshop ab 10 Beschäftigten oder über 2 Mio. € Umsatz</th><td>Ja</td></tr>
        <tr><th>Online-Buchung mit Bezahlung, größerer Betrieb</th><td>Ja</td></tr>
      </tbody>
    </table>
    </div>
    <ul class="rg-wege">
      <li><b>Info-Seite</b><span>In der Regel nein</span><span>Leistungen, Fotos, Öffnungszeiten, Kontakt.</span></li>
      <li><b>Shop eines Kleinstunternehmens</b><span>Ausgenommen</span><span>Unter 10 Beschäftigte und höchstens 2 Mio. € Umsatz.</span></li>
      <li class="is-hi"><b>Shop oder Buchung, größerer Betrieb</b><span>Ja, betroffen</span><span>Ab 10 Beschäftigten oder über 2 Mio. € Umsatz.</span></li>
    </ul>
    <p>Die Grenze für Kleinstunternehmen ist entscheidend: weniger als 10 Beschäftigte <strong>und</strong> Jahresumsatz oder Bilanzsumme von höchstens 2 Mio. €. Der Großteil der Handwerksbetriebe, Friseure, Gasthäuser und Selbstständigen liegt darunter.</p>"""),
    ("trotzdem", "Warum Barrierefreiheit sich trotzdem lohnt", """    <p>Auch wenn das Gesetz für dich nicht gilt: Eine gut bedienbare Seite hilft allen. Ältere Kunden mit schwächeren Augen, jemand mit dem Handy in der prallen Sonne, ein Besucher mit gebrochenem Arm. Und vieles davon mag auch Google, etwa klare Überschriften und beschriftete Bilder.</p>"""),
    ("checkliste", "Die wichtigsten Punkte für eine barrierearme Seite", """    <ul class="rg-check">
      <li>Genug Kontrast zwischen Schrift und Hintergrund</li>
      <li>Schrift lässt sich vergrößern, ohne dass etwas abgeschnitten wird</li>
      <li>Alles funktioniert auch nur mit der Tastatur</li>
      <li>Bilder haben einen Alternativtext</li>
      <li>Überschriften sind sauber gegliedert</li>
      <li>Formularfelder haben eine Beschriftung</li>
      <li>Animationen lassen sich reduzieren</li>
    </ul>"""),
    ("bei-mir", "So mache ich das", """    <p>Ich programmiere jede Seite selbst und achte von Anfang an auf diese Punkte. Wie ich das auf meiner eigenen Seite umsetze, steht in der <a href="/barrierefreiheit/">Erklärung zur Barrierefreiheit</a>. Planst du einen Shop oder eine Buchung? Dann sprechen wir das im Angebot direkt an.</p>"""),
]

FAQ = [
    ("Muss meine kleine Firmenwebseite barrierefrei sein?",
     "Eine reine Info-Seite ohne Onlineverkauf fällt in der Regel nicht unter das Barrierefreiheitsgesetz. Kleinstunternehmen mit weniger als 10 Beschäftigten und höchstens 2 Mio. € Umsatz sind bei Dienstleistungen zudem ausgenommen."),
    ("Seit wann gilt das Barrierefreiheitsgesetz?",
     "Seit 28. Juni 2025. Für manche bestehende Produkte und Verträge gibt es Übergangsfristen."),
    ("Was passiert, wenn ich betroffen bin und nichts mache?",
     "Die Marktüberwachung kann zur Behebung auffordern und Verwaltungsstrafen verhängen. Wer betroffen ist, sollte die Seite nach den WCAG-Richtlinien Stufe AA prüfen lassen."),
    ("Brauche ich eine Erklärung zur Barrierefreiheit?",
     "Betroffene Anbieter müssen Informationen zur Barrierefreiheit ihrer Dienstleistung bereitstellen. Für nicht betroffene Seiten ist sie freiwillig, zeigt aber, dass man sich Gedanken gemacht hat."),
]
