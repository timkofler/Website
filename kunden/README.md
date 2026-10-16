# Kunden

Pro Kunde ein eigener Ordner, benannt nach dem **Benutzernamen im Kundenportal** (z. B. `baeckerei-muster`). Jeder Kunde hat außerdem einen eigenen Thread im Claude-Projekt.

## Neuen Kunden anlegen

1. Ordner `_vorlage/` kopieren und umbenennen: `kunden/<benutzername>/`
2. `README.md` (Steckbrief) ausfüllen.
3. Im Kundenportal unter https://tim-kofler.at/kunden/admin/ den Kunden mit **demselben Benutzernamen** anlegen. Die Zugangsdaten werden einmal angezeigt; persönlich, per Brief oder Telefon weitergeben.
4. Sobald der Kunde Dateien hochlädt, kommt eine E-Mail an office@tim-kofler.at.

## Wichtig: das Repo ist öffentlich

- **Keine** Fotos, Unterlagen, Verträge, Telefonnummern, E-Mail-Adressen oder Preise der Kunden hier ablegen. Die Rohdaten bleiben im Kundenportal auf dem Server.
- Hier stehen nur der Steckbrief, die Checkliste, öffentliche Inhalte und der Code der Webseite (`seite/`). Bilder kommen erst nach `seite/`, wenn sie ohnehin veröffentlicht werden und der Kunde zugestimmt hat.
- Dieser Ordner wird **nicht** auf crypto-x.at oder tim-kofler.at veröffentlicht (ausgeschlossen in `.github/workflows/deploy.yml`).
