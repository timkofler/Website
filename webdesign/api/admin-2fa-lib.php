<?php
// Tim Kofler – Zwei-Faktor-Anmeldung für den Admin-Bereich des Kundenportals und, freiwillig, für Kunden.
// Zeitbasierte Codes nach RFC 6238 (TOTP, SHA-1, 6 Ziffern, 30 Sekunden), wie sie Google Authenticator,
// Microsoft Authenticator, 1Password und ähnliche Apps anzeigen. Dazu zehn Notfall-Codes zum einmaligen Gebrauch.
// Das Geheimnis liegt nur auf dem Webspace in api/_data/kunden/admin-2fa.json (per .htaccess gesperrt, nicht im Repo).
// Wer sich aussperrt: diese Datei im KAS-Dateimanager löschen, dann gilt wieder nur das Passwort.
// Kunden: je Kunde api/_data/kunden/<benutzer>/2fa.json. Tim kann sie im Admin unter „Zugang“ ausschalten.

declare(strict_types=1);

require_once __DIR__ . '/kunden-lib.php';

const TF_FILE = KP_DIR . '/admin-2fa.json';
const TF_PERIOD = 30;
const TF_DIGITS = 6;
const TF_DRIFT = 1;            // ± ein Zeitfenster, falls die Uhr am Handy etwas abweicht
const TF_STEP_TTL = 300;       // so lange gilt das richtige Passwort, bis der Code eingegeben sein muss
const TF_BACKUP_COUNT = 10;
const TF_ISSUER = 'tim-kofler.at';
const TF_ACCOUNT = 'Admin Kundenportal';
// Notfall-Codes ohne leicht verwechselbare Zeichen (0/o, 1/l/i)
const TF_BACKUP_CHARS = '23456789abcdefghjkmnpqrstuvwxyz';

// ---------------- Base32 (RFC 4648) ----------------

function tf_base32_encode(string $bin): string
{
    $alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    foreach (str_split($bin) as $c) {
        $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 5) as $chunk) {
        $out .= $alpha[bindec(str_pad($chunk, 5, '0'))];
    }
    return $out;
}

function tf_base32_decode(string $b32): string
{
    $alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $b32 = strtoupper(preg_replace('/[\s=-]/', '', $b32) ?? '');
    $bits = '';
    foreach (str_split($b32) as $c) {
        $v = strpos($alpha, $c);
        if ($v === false) {
            return '';
        }
        $bits .= str_pad(decbin($v), 5, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) === 8) {
            $out .= chr(bindec($byte));
        }
    }
    return $out;
}

// ---------------- Codes ----------------

function tf_new_secret(): string
{
    return tf_base32_encode(random_bytes(20)); // 160 Bit, 32 Zeichen
}

function tf_code(string $secret, int $step): string
{
    $key = tf_base32_decode($secret);
    $hmac = hash_hmac('sha1', pack('J', $step), $key, true);
    $o = ord($hmac[19]) & 0x0f;
    $n = ((ord($hmac[$o]) & 0x7f) << 24) | (ord($hmac[$o + 1]) << 16) | (ord($hmac[$o + 2]) << 8) | ord($hmac[$o + 3]);
    return str_pad((string) ($n % 10 ** TF_DIGITS), TF_DIGITS, '0', STR_PAD_LEFT);
}

// Gibt das passende Zeitfenster zurück oder null. Ein Fenster, das schon einmal benutzt wurde ($last), zählt nicht
// noch einmal, damit ein mitgelesener Code nicht ein zweites Mal funktioniert.
function tf_match(string $secret, string $code, int $last = 0): ?int
{
    $code = preg_replace('/\D/', '', $code) ?? '';
    if (strlen($code) !== TF_DIGITS || $secret === '') {
        return null;
    }
    $now = intdiv(time(), TF_PERIOD);
    for ($i = -TF_DRIFT; $i <= TF_DRIFT; $i++) {
        $step = $now + $i;
        if ($step > $last && hash_equals(tf_code($secret, $step), $code)) {
            return $step;
        }
    }
    return null;
}

function tf_uri(string $secret, string $account = TF_ACCOUNT): string
{
    return 'otpauth://totp/' . rawurlencode(TF_ISSUER) . ':' . rawurlencode($account)
        . '?secret=' . $secret . '&issuer=' . rawurlencode(TF_ISSUER) . '&algorithm=SHA1&digits=' . TF_DIGITS . '&period=' . TF_PERIOD;
}

// Schlüssel zum Abtippen in Vierergruppen
function tf_pretty(string $secret): string
{
    return implode(' ', str_split($secret, 4));
}

// ---------------- Notfall-Codes ----------------

function tf_new_backups(): array
{
    $codes = [];
    while (count($codes) < TF_BACKUP_COUNT) {
        $c = '';
        for ($i = 0; $i < 8; $i++) {
            $c .= TF_BACKUP_CHARS[random_int(0, strlen(TF_BACKUP_CHARS) - 1)];
        }
        $codes[substr($c, 0, 4) . '-' . substr($c, 4)] = true;
    }
    return array_keys($codes);
}

function tf_norm_backup(string $c): string
{
    return strtolower(preg_replace('/[^0-9a-z]/i', '', $c) ?? '');
}

function tf_hash_backups(array $codes): array
{
    return array_map(static fn($c) => password_hash(tf_norm_backup($c), PASSWORD_DEFAULT), $codes);
}

// ---------------- Speicher ----------------

// Alle Speicherfunktionen nehmen optional die Datei: ohne Angabe die des Admins, für Kunden tf_kunde_file().
function tf_kunde_file(string $u): string
{
    return kp_user_dir($u) . '/2fa.json';
}

function tf_state(string $file = TF_FILE): array
{
    $d = kp_read_json($file);
    return (($d['secret'] ?? '') !== '' && is_string($d['secret'])) ? $d : [];
}

function tf_active(string $file = TF_FILE): bool
{
    return tf_state($file) !== [];
}

function tf_save(array $d, string $file = TF_FILE): bool
{
    return kp_write_json($file, $d);
}

function tf_enable(string $secret, int $step, array $backups, string $file = TF_FILE): bool
{
    return tf_save(['secret' => $secret, 'seit' => date('c'), 'zuletzt' => $step, 'notfall' => tf_hash_backups($backups)], $file);
}

function tf_disable(string $file = TF_FILE): void
{
    @unlink($file);
}

// Prüft einen Code aus der App oder einen Notfall-Code und merkt sich den Verbrauch.
// Rückgabe: 'app', 'notfall' oder '' (falsch). Ohne $backup zählt nur der Code aus der App.
function tf_check(string $input, bool $backup = true, string $file = TF_FILE): string
{
    // Unter Sperre, damit ein Code bei gleichzeitigen Anfragen nicht mehrfach gilt.
    $lock = $file === TF_FILE ? KP_DIR . '/admin-2fa.lock' : dirname($file) . '/2fa.lock';
    return (string) cx_locked($lock, static fn() => tf_check_unlocked($input, $backup, $file));
}

function tf_check_unlocked(string $input, bool $backup, string $file = TF_FILE): string
{
    $d = tf_state($file);
    if (!$d) {
        return '';
    }
    $step = tf_match((string) $d['secret'], $input, (int) ($d['zuletzt'] ?? 0));
    if ($step !== null) {
        $d['zuletzt'] = $step;
        tf_save($d, $file);
        return 'app';
    }
    $n = tf_norm_backup($input);
    if ($backup && strlen($n) === 8) {
        foreach ((array) ($d['notfall'] ?? []) as $i => $h) {
            if (is_string($h) && password_verify($n, $h)) {
                unset($d['notfall'][$i]);
                $d['notfall'] = array_values($d['notfall']);
                tf_save($d, $file);
                return 'notfall';
            }
        }
    }
    return '';
}

function tf_backups_left(string $file = TF_FILE): int
{
    return count((array) (tf_state($file)['notfall'] ?? []));
}
