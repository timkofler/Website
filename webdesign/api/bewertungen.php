<?php
// Tim Kofler – freigegebene Kundenbewertungen als JSON für die Startseite (assets/js/tk-stimmen.js).
// Nur Bewertungen mit Einwilligung und Tims Freigabe, ohne Benutzername und E-Mail.

declare(strict_types=1);

require __DIR__ . '/bewertung-lib.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
echo json_encode(['bewertungen' => bw_public()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
