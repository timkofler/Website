<?php
// Mails an die eigene Domain (Anfragen-Meldungen, Wochenbericht an Tim) direkt über das ALL-INKL-Postfach schicken statt über Brevo.
// Grund: Brevos geteilte Server stehen manchmal auf der SpamCop-Liste, dann sortiert der ALL-INKL-Spamfilter alles aus
// („X-KasSpamfilter: match on scbl“). Eingeschaltet nur, wenn 'eigen_smtp' in der config.php steht; sonst bleibt alles bei Brevo.

declare(strict_types=1);

// Kopfzeilen-Wort: ASCII bleibt, sonst UTF-8 nach RFC 2047.
function cx_smtp_word(string $v): string
{
    $v = cx_oneline($v);
    return preg_match('/^[\x20-\x7e]*$/', $v) ? $v : mb_encode_mimeheader($v, 'UTF-8', 'B', "\r\n");
}

function cx_smtp_addr(string $email, string $name = ''): string
{
    $name = cx_oneline($name);
    if ($name === '') {
        return '<' . $email . '>';
    }
    $q = preg_match('/^[\x20-\x7e]*$/', $name) ? '"' . addcslashes($name, '"\\') . '"' : cx_smtp_word($name);
    return $q . ' <' . $email . '>';
}

// Komplette Mail (Text + HTML als multipart/alternative) über SMTP. Wirft bei jedem Fehler eine Ausnahme.
function cx_smtp_send(array $s, string $from, string $fromName, string $to, string $toName, string $subject, string $html, string $text, string $replyTo = ''): void
{
    $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
    $b64 = static fn(string $t): string => rtrim(chunk_split(base64_encode(str_replace(["\r\n", "\r", "\n"], ["\n", "\n", "\r\n"], $t)), 76, "\r\n"));
    $grenze = 'tk' . bin2hex(random_bytes(8));
    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . cx_smtp_addr($from, $fromName),
        'To: ' . cx_smtp_addr($to, $toName),
        'Subject: ' . cx_smtp_word($subject),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $grenze . '"',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . cx_smtp_addr($replyTo);
    }
    $body = "--$grenze\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . $b64($text)
        . "\r\n--$grenze\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . $b64($html)
        . "\r\n--$grenze--";
    cx_smtp_talk($s, $from, $to, implode("\r\n", $headers) . "\r\n\r\n" . $body);
}

// Schlanker SMTP-Client: SSL (465) oder STARTTLS (587), Anmeldung mit AUTH PLAIN bzw. LOGIN.
function cx_smtp_talk(array $c, string $from, string $to, string $message): void
{
    $host = (string) ($c['server'] ?? '');
    $port = (int) ($c['port'] ?? 465);
    $mode = (string) ($c['sicherheit'] ?? 'ssl');
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'peer_name' => $host]]);
    $remote = ($mode === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $sock = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$sock) {
        throw new RuntimeException("Keine Verbindung zu $remote: $errstr");
    }
    stream_set_timeout($sock, 20);
    $read = function () use ($sock): array {
        $lines = '';
        while (($l = fgets($sock, 1024)) !== false) {
            $lines .= $l;
            if (strlen($l) < 4 || $l[3] === ' ') {
                break;
            }
        }
        return [(int) substr($lines, 0, 3), $lines];
    };
    // $label steht in der Fehlermeldung im Server-Log, nie Zugangsdaten oder Mailinhalt
    $cmd = function (string $line, array $ok, string $label = '') use ($sock, $read): string {
        fwrite($sock, $line . "\r\n");
        [$code, $text] = $read();
        if (!in_array($code, $ok, true)) {
            throw new RuntimeException('SMTP ' . ($label !== '' ? $label : $line) . ': ' . trim($text));
        }
        return $text;
    };
    try {
        [$code, $text] = $read();
        if ($code !== 220) {
            throw new RuntimeException('SMTP Begrüßung: ' . trim($text));
        }
        $ehlo = preg_replace('/[^a-z0-9.-]/i', '', (string) ($_SERVER['SERVER_NAME'] ?? 'tim-kofler.at')) ?: 'tim-kofler.at';
        $caps = $cmd('EHLO ' . $ehlo, [250]);
        if ($mode === 'tls') {
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                throw new RuntimeException('STARTTLS fehlgeschlagen');
            }
            $caps = $cmd('EHLO ' . $ehlo, [250]);
        }
        $user = (string) ($c['benutzer'] ?? '');
        $pass = (string) ($c['passwort'] ?? '');
        if (preg_match('/AUTH[ =][^\r\n]*\bPLAIN\b/i', $caps)) {
            $cmd('AUTH PLAIN ' . base64_encode("\0" . $user . "\0" . $pass), [235], 'Anmeldung');
        } else {
            $cmd('AUTH LOGIN', [334]);
            $cmd(base64_encode($user), [334], 'Anmeldung (Benutzer)');
            $cmd(base64_encode($pass), [235], 'Anmeldung (Passwort)');
        }
        $cmd('MAIL FROM:<' . $from . '>', [250]);
        $cmd('RCPT TO:<' . $to . '>', [250, 251]);
        $cmd('DATA', [354]);
        // Zeilen, die mit einem Punkt beginnen, verdoppeln (sonst endet die Mail zu früh)
        $data = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], ["\n", "\n"], $message));
        $cmd(str_replace("\n", "\r\n", (string) $data) . "\r\n.", [250], 'Mailinhalt');
        fwrite($sock, "QUIT\r\n");
    } finally {
        fclose($sock);
    }
}
