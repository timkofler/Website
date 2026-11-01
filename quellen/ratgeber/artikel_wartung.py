"""Ratgeber: Webseite Wartung und Betreuung"""
SLUG = "webseite-wartung-kosten"
KURZ = "Wartung und Betreuung"
LABEL = "Nach dem Livegang"
TITLE = "Webseite betreuen lassen: Was kostet Wartung wirklich? | Tim Kofler"
DESC = ("Was gehört zur Wartung einer Webseite, was kostet sie in Österreich, und brauche ich überhaupt ein Abo? "
        "Updates, Sicherungen und Änderungen ehrlich erklärt.")
KARTE = "Updates, Sicherungen, Änderungen: was Wartung ist, was sie kostet und ob du ein Abo brauchst."
H1_TEXT = "Webseite betreuen lassen: Was kostet Wartung wirklich?"
H1 = 'Webseite betreuen lassen: <span class="lime">Was kostet Wartung?</span>'
LEAD = ("Die Seite ist online, und dann? Manche Anbieter verkaufen teure Wartungsverträge, andere sagen gar nichts dazu. "
        "Hier steht, was wirklich nötig ist und was du dafür zahlen solltest.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 4
END_H2 = 'Betreuung ab 19 € im Monat. <span class="lime">Freiwillig und monatlich kündbar.</span>'
CTA_HREF = "/betreuung/"
CTA_TEXT = "Betreuungs-Pakete ansehen"
CTA_ALT = 'Noch keine Seite? Hol dir zuerst einen <a href="/entwurf/">Gratis-Entwurf in 48 Stunden</a>'
END_CHIPS = ["Ab 19 € / Monat", "Monatlich kündbar", "Freiwillig"]

KURZ_ANTWORT = """<ul>
        <li><strong>Wartung</strong> heißt: Sicherheits-Updates, regelmäßige Sicherungen und ein Auge darauf, dass die Seite läuft.</li>
        <li>Wie viel nötig ist, hängt von der <strong>Technik</strong> ab. Seiten mit vielen Plugins brauchen mehr als schlanke Seiten.</li>
        <li>Am Markt kosten Wartungsverträge oft <strong>30 bis 150 € im Monat</strong>.</li>
        <li>Ein Abo sollte <strong>freiwillig und monatlich kündbar</strong> sein, und die Seite muss dir gehören.</li>
      </ul>"""

ABSCHNITTE = [
    ("was", "Was zur Wartung gehört", """    <ul class="rg-check">
      <li>Sicherheits-Updates für System, Plugins und Server-Technik</li>
      <li>Regelmäßige Sicherungen, damit nach einem Fehler nichts verloren ist</li>
      <li>Kontrolle, ob die Seite erreichbar ist und das Formular ankommt</li>
      <li>SSL-Zertifikat und Domain rechtzeitig verlängert</li>
      <li>Kleine Änderungen: Öffnungszeiten, Preise, neue Fotos</li>
    </ul>"""),
    ("technik", "Warum manche Seiten mehr Wartung brauchen", """    <p>Viele Webseiten laufen mit WordPress und einer Handvoll Plugins. Das ist praktisch, aber jedes Plugin bekommt laufend Updates, und wer sie auslässt, öffnet Angreifern die Tür. Solche Seiten brauchen wirklich regelmäßige Pflege.</p>
    <p>Schlanke, selbst programmierte Seiten ohne viele Erweiterungen haben deutlich weniger bewegliche Teile. Dort reicht oft ein Blick im Monat und eine automatische Sicherung beim Webspace-Anbieter.</p>"""),
    ("kosten", "Was Wartung kostet", """    <ul class="rg-wege">
      <li><b>Selbst machen</b><span>0 € plus Zeit</span><span>Passt, wenn die Seite schlank ist und du dich traust.</span></li>
      <li class="is-hi"><b>Kleines Betreuungspaket</b><span>ca. 20–50 € / Monat</span><span>Updates, Sicherung, ein paar Änderungen im Monat.</span></li>
      <li><b>Wartungsvertrag Agentur</b><span>oft 50–150 € / Monat</span><span>Meist mit Mindestlaufzeit, Änderungen oft extra.</span></li>
    </ul>
    <p>Dazu kommen immer Domain und Webspace, etwa 5 bis 10 € im Monat. Mehr dazu im Ratgeber <a href="/ratgeber/domain-und-webspace/">Domain und Webspace</a>.</p>"""),
    ("abo", "Brauche ich überhaupt ein Abo?", """    <p>Nicht unbedingt. Wenn sich auf deiner Seite selten etwas ändert und sie technisch schlank ist, kannst du Änderungen auch einzeln nach Aufwand beauftragen. Ein Abo lohnt sich, wenn du regelmäßig Neues zeigen willst oder dich um gar nichts kümmern möchtest.</p>
    <div class="rg-tipp"><p><strong>Achte darauf:</strong> keine lange Mindestlaufzeit, klare Leistungen statt „Pauschale“, und Domain und Webspace laufen auf deinen Namen. Dann kannst du jederzeit wechseln.</p></div>"""),
    ("selbst", "Was du selbst tun kannst", """    <ul>
      <li><strong>Einmal im Monat</strong> die eigene Seite am Handy öffnen und das Formular testen.</li>
      <li><strong>Zugangsdaten</strong> für Domain, Webspace und Seite sicher aufbewahren.</li>
      <li><strong>Öffnungszeiten und Preise</strong> aktuell halten, auch im Google-Profil.</li>
    </ul>
    <p>Meine eigenen Pakete mit fixen Preisen stehen auf der Seite <a href="/betreuung/">Betreuung</a>.</p>"""),
]

FAQ = [
    ("Was kostet die Wartung einer Webseite?",
     "Kleine Betreuungspakete kosten etwa 20 bis 50 € im Monat, Wartungsverträge von Agenturen oft 50 bis 150 €. Dazu kommen Domain und Webspace mit etwa 5 bis 10 € im Monat."),
    ("Muss ich meine Webseite warten lassen?",
     "Sicherheits-Updates und Sicherungen sind wichtig. Ob du dafür ein Abo brauchst, hängt von der Technik ab. Schlanke Seiten ohne viele Plugins brauchen wenig Pflege."),
    ("Kann ich einen Wartungsvertrag jederzeit kündigen?",
     "Das hängt vom Vertrag ab. Achte vor dem Abschluss auf eine kurze Kündigungsfrist, ideal ist monatlich kündbar."),
]
