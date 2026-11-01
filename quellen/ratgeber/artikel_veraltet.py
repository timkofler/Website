"""Ratgeber: Ist meine Webseite veraltet?"""
SLUG = "webseite-veraltet"
KURZ = "Webseite veraltet?"
LABEL = "Selbsttest"
TITLE = "Ist meine Webseite veraltet? 7 Anzeichen zum Selbsttest | Tim Kofler"
DESC = ("Woran du erkennst, dass deine Webseite veraltet ist und Anfragen kostet: 7 Anzeichen zum Selbsttest, "
        "vom Handy-Test bis zum Impressum. Mit Tipps, was als Nächstes zu tun ist.")
KARTE = "Handy, Ladezeit, Schloss, Google: 7 Anzeichen, die du in fünf Minuten selbst prüfen kannst."
H1_TEXT = "Ist meine Webseite veraltet? 7 Anzeichen"
H1 = 'Ist meine Webseite veraltet? <span class="lime">7 Anzeichen.</span>'
LEAD = ("Eine Webseite kann online sein und trotzdem jeden Tag Kunden kosten. Mit diesen sieben Punkten "
        "prüfst du deine Seite in fünf Minuten selbst, ganz ohne Technikwissen.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 4
END_H2 = 'Lieber prüfen lassen? <span class="lime">Gratis-Check in 24 Stunden.</span>'
CTA_HREF = "/check/"
CTA_TEXT = "Gratis-Webseiten-Check"
CTA_ALT = 'Oder gleich mehr zum <a href="/webseite-erneuern/">Erneuern deiner Webseite</a>'
END_CHIPS = ["Kostenlos", "Persönlich geprüft", "Kein Anruf"]

KURZ_ANTWORT = """<ul>
        <li>Die wichtigsten Warnzeichen: <strong>schlecht lesbar am Handy, langsam, kein Schloss im Browser</strong>.</li>
        <li>Dazu: <strong>alte Infos</strong>, fehlendes Impressum, bei Google nicht auffindbar.</li>
        <li>Treffen <strong>drei oder mehr</strong> Punkte zu, lohnt sich meist eine neue Seite statt Flickwerk.</li>
      </ul>"""

ABSCHNITTE = [
    ("handy", "1. Am Handy schlecht lesbar", """    <p>Öffne deine Seite am Handy. Musst du zoomen, um den Text zu lesen? Sind Knöpfe so klein, dass man daneben tippt? Die meisten Besucher kommen heute mit dem Handy, und wer sich dort plagt, ist in Sekunden wieder weg.</p>"""),
    ("ladezeit", "2. Die Seite lädt lange", """    <p>Zähl mit, bis die Seite am Handy da ist. Mehr als drei Sekunden sind zu viel. Häufige Bremsen sind riesige Fotos, alte Plugins und billiger Webspace.</p>"""),
    ("schloss", "3. Kein Schloss im Browser", """    <p>Steht vor deiner Adresse „Nicht sicher“ statt eines Schlosses, fehlt die Verschlüsselung (HTTPS). Das schreckt Besucher ab und schadet bei Google. Ein SSL-Zertifikat ist bei guten Anbietern kostenlos.</p>"""),
    ("infos", "4. Alte Infos auf der Seite", """    <p>Öffnungszeiten von früher, ein Aktionsangebot vom letzten Jahr, Mitarbeiter, die längst weg sind: Das wirkt, als gäbe es den Betrieb nicht mehr. Wenn du die Seite selbst nicht ändern kannst, ist das schon ein Anzeichen.</p>"""),
    ("pflicht", "5. Impressum oder Datenschutz fehlt", """    <p>Fehlt das Impressum oder ist es unvollständig, kann das teuer werden. Was hinein muss, steht im Ratgeber <a href="/ratgeber/impressum-webseite-oesterreich/">Impressum in Österreich</a>.</p>"""),
    ("google", "6. Bei Google nicht zu finden", """    <p>Such nach deiner Leistung und deinem Ort, zum Beispiel „Tischler Melk“. Taucht deine Seite auf den ersten Seiten nicht auf, verlierst du Kunden an die Konkurrenz. Tipps dazu im Ratgeber <a href="/ratgeber/bei-google-gefunden-werden/">Bei Google gefunden werden</a>.</p>"""),
    ("design", "7. Das Design wirkt alt", """    <p>Schwer zu messen, aber jeder spürt es: Kleine Schrift, graue Kästen, Bilder von vor zehn Jahren. Besucher schließen vom Auftritt auf den Betrieb.</p>
    <div class="rg-tipp"><p><strong>Auswertung:</strong> Treffen ein oder zwei Punkte zu, reichen oft kleine Korrekturen. Ab drei Punkten ist eine neue Seite meist günstiger als Flickwerk an der alten.</p></div>"""),
]

FAQ = [
    ("Woran erkenne ich, dass meine Webseite veraltet ist?",
     "Typische Zeichen sind: am Handy schlecht lesbar, lange Ladezeit, kein Schloss im Browser, alte Infos, fehlendes Impressum und kaum Treffer bei Google."),
    ("Wie oft sollte man eine Webseite erneuern?",
     "Eine feste Regel gibt es nicht. Viele Seiten sind nach fünf bis acht Jahren technisch und optisch überholt, vor allem wenn sie am Handy nicht gut funktionieren."),
    ("Kann man eine alte Webseite überarbeiten statt neu bauen?",
     "Bei kleinen Mängeln ja. Wenn mehrere Punkte zusammenkommen, ist ein Neubau oft günstiger und schneller als viele einzelne Reparaturen."),
]
