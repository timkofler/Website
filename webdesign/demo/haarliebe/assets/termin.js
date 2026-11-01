// Startet die Online-Terminbuchung (buchung.js) und füllt die nächsten freien Termine auf der Seite.
import { fillLive } from "./buchung.js?v=1";
fillLive();
setInterval(fillLive, 60000);
