<?php
// Tim Kofler – Anstoß für die geplanten Telegram-Nachrichten (Morgen-Nachricht, Tagesbericht), siehe zeitplan-lib.php.
// Wird alle 5 Minuten vom Seiten-Wächter bei GitHub aufgerufen, damit die Nachrichten auch ohne Besucher pünktlich kommen.
// Kein Schlüssel nötig: Es wird nur geschickt, was ohnehin fällig ist, und nur an Tims verbundenen Chat. Antwort immer leer.

declare(strict_types=1);

require __DIR__ . '/zeitplan-lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
http_response_code(204);
if (cx_rate_hit('zeitplan', 60, 3600)) {
    tp_maybe();
}
