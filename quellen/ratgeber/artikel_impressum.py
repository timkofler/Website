"""Ratgeber: Impressum auf der Webseite in Österreich"""
SLUG = "impressum-webseite-oesterreich"
KURZ = "Impressum in Österreich"
LABEL = "Pflichtangaben"
TITLE = "Impressum auf der Webseite: Was muss in Österreich rein? | Tim Kofler"
DESC = ("Welche Angaben ins Impressum einer österreichischen Webseite gehören: ECG, Mediengesetz und UGB "
        "verständlich erklärt, mit Checkliste für Einzelunternehmer, GmbH und Vereine.")
KARTE = "ECG, Mediengesetz, UGB: welche Angaben auf deine Seite müssen, mit Checkliste."
H1_TEXT = "Impressum auf der Webseite: Was muss in Österreich rein?"
H1 = 'Impressum: Was muss <span class="lime">in Österreich rein?</span>'
LEAD = ("Fast jede Firmenwebseite braucht ein Impressum. Welche Angaben genau hineingehören, "
        "regeln in Österreich gleich drei Gesetze. Hier ist die Übersicht, ohne Juristendeutsch.")
DATUM = "2026-11-01"
DATUM_TEXT = "1. November 2026"
LESEZEIT = 5
END_H2 = 'Impressum und Datenschutz <span class="lime">sind bei mir immer dabei.</span>'

KURZ_ANTWORT = """<ul>
        <li><strong>E-Commerce-Gesetz (§ 5 ECG):</strong> wer du bist, wo du sitzt, wie man dich erreicht, Gewerbe und Kammer.</li>
        <li><strong>Mediengesetz (§ 25 MedienG):</strong> Offenlegung von Name, Unternehmensgegenstand und Sitz.</li>
        <li><strong>Unternehmensgesetzbuch (§ 14 UGB):</strong> zusätzlich für Firmen im Firmenbuch, etwa eine GmbH.</li>
        <li>Das Impressum muss von jeder Seite aus <strong>mit einem Klick</strong> erreichbar sein, meist über den Footer.</li>
      </ul>
      <p class="rg-hinweis">Allgemeine Information, Stand November 2026. Ersetzt keine Rechtsberatung. Verbindliche Auskunft gibt deine Wirtschaftskammer.</p>"""

ABSCHNITTE = [
    ("wer", "Wer braucht ein Impressum?", """    <p>Kurz gesagt: jeder, der mit seiner Webseite etwas Geschäftliches macht. Das gilt für den Einzelunternehmer mit einer einzigen Seite genauso wie für die GmbH mit Onlineshop. Auch Vereine brauchen eines. Nur eine rein private Seite, etwa ein Familienblog ohne Werbung, ist großteils ausgenommen.</p>
    <p>Ein fehlendes oder falsches Impressum kann eine Verwaltungsstrafe oder eine Abmahnung durch Mitbewerber nach sich ziehen. Der Aufwand, es richtig zu machen, ist dagegen klein.</p>"""),
    ("ecg", "Angaben nach dem E-Commerce-Gesetz", """    <p>Das ECG verlangt Informationen, mit denen Besucher dich eindeutig erkennen und erreichen können:</p>
    <ul class="rg-check">
      <li>Name oder Firmenwortlaut</li>
      <li>Geografische Anschrift (kein Postfach)</li>
      <li>Telefonnummer und E-Mail-Adresse</li>
      <li>Firmenbuchnummer und Firmenbuchgericht, falls eingetragen</li>
      <li>UID-Nummer, falls vorhanden</li>
      <li>Gewerbe bzw. Beruf und die zuständige Gewerbebehörde</li>
      <li>Kammer oder Berufsverband, etwa die Wirtschaftskammer</li>
      <li>Anwendbare Vorschriften, zum Beispiel die Gewerbeordnung mit Link auf ris.bka.gv.at</li>
    </ul>"""),
    ("medieng", "Offenlegung nach dem Mediengesetz", """    <p>Jede Webseite ist für das Mediengesetz ein Medium. Für eine typische Firmenseite, die nur das eigene Unternehmen vorstellt, reicht die sogenannte kleine Offenlegung:</p>
    <ul>
      <li>Name oder Firma des Medieninhabers</li>
      <li>Unternehmensgegenstand, also womit du dein Geld verdienst</li>
      <li>Wohnort oder Sitz</li>
    </ul>
    <p>Wer zusätzlich Meinungen verbreitet, etwa in einem Blog über Politik, braucht eine ausführlichere Offenlegung mit der grundlegenden Richtung.</p>"""),
    ("ugb", "Zusatzangaben für Firmen im Firmenbuch", """    <p>Eingetragene Unternehmen wie GmbH, OG, KG oder eingetragene Einzelunternehmer (e.U.) nennen außerdem Rechtsform, Sitz, Firmenbuchnummer und Firmenbuchgericht. Bei Kapitalgesellschaften gehört das auch in E-Mails und Briefe.</p>
    <div class="rg-tipp"><p><strong>Für Vereine:</strong> Statt Firmenbuchnummer steht die ZVR-Zahl aus dem Vereinsregister im Impressum, dazu Sitz und wer den Verein vertritt, meist Obfrau oder Obmann.</p></div>"""),
    ("fehler", "Die häufigsten Fehler", """    <ul>
      <li><strong>Impressum versteckt.</strong> Es muss leicht zu finden sein. Ein Link „Impressum“ im Footer jeder Seite ist der Standard.</li>
      <li><strong>Veraltete Angaben.</strong> Umgezogen, neue Telefonnummer, neue Rechtsform? Das Impressum gleich mitändern.</li>
      <li><strong>Deutsche Vorlage kopiert.</strong> Angaben nach dem deutschen Telemediengesetz passen nicht zur österreichischen Rechtslage.</li>
      <li><strong>Alter Link zur EU-Streitschlichtung.</strong> Die EU-Plattform für Online-Streitbeilegung wurde im Juli 2025 eingestellt. Der Link darauf kann raus.</li>
    </ul>"""),
    ("bei-mir", "So mache ich das bei meinen Kunden", """    <p>Bei jeder Webseite, die ich baue, ist ein Grundgerüst für Impressum und Datenschutzerklärung dabei, abgestimmt auf deine Seite. Du prüfst deine Firmendaten, ich baue sie ein. Wie das fertig aussieht, siehst du in <a href="/impressum/">meinem eigenen Impressum</a>.</p>
    <p>Hast du schon eine Seite und bist dir nicht sicher? Der <a href="/check/">Gratis-Webseiten-Check</a> schaut auch aufs Impressum.</p>"""),
]

FAQ = [
    ("Brauche ich als Einzelunternehmer ein Impressum?",
     "Ja. Sobald die Webseite geschäftlich ist, brauchst du ein Impressum mit Namen, Anschrift, Kontakt, Gewerbe, Gewerbebehörde und Kammer, dazu die Offenlegung nach dem Mediengesetz."),
    ("Muss meine Privatadresse ins Impressum?",
     "Es muss eine Anschrift sein, unter der du erreichbar bist. Wenn du von zu Hause aus arbeitest und kein Büro hast, ist das meist deine Wohnadresse. Ein Postfach reicht nicht."),
    ("Brauche ich das Impressum auch auf Instagram oder Facebook?",
     "Für geschäftliche Profile gilt die Impressumspflicht auch dort. Ein Link auf das Impressum deiner Webseite in der Profilbeschreibung ist eine einfache Lösung."),
    ("Wo muss das Impressum stehen?",
     "Es muss leicht und ständig erreichbar sein. Üblich ist ein Link „Impressum“ im Footer jeder Seite, von dem aus man mit einem Klick dort ist."),
]
