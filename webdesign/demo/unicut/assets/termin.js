// Startet die Online-Terminbuchung (buchung.js) und füllt die nächsten freien Zeiten in der Termin-Karte.
import { fillLive } from "./buchung.js?v=1";
fillLive();
setInterval(fillLive, 60000);
