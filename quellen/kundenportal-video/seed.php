<?php
// Legt den erfundenen Beispielkunden für das Kundenportal-Video an. Aufruf: php seed.php <Ordner mit der webdesign-Kopie>
require $argv[1] . '/api/kunden-lib.php';
@mkdir(KP_DIR, 0700, true);
$u = 'baeckerei-muster';
exec('rm -rf ' . escapeshellarg(KP_DIR));
@mkdir(KP_DIR, 0700, true);
kp_save_accounts([$u => ['name' => 'Anna Muster', 'firma' => 'Bäckerei Muster', 'email' => '', 'webseite' => 'baeckerei-muster.at',
  'hash' => password_hash('kornspitz-2026', PASSWORD_DEFAULT), 'aktiv' => true, 'erstellt' => date('c', strtotime('-9 days')),
  'phase' => 'feinschliff', 'vorschau' => 'https://tim-kofler.at/beispiele/baeckerei/',
  'pw_eigen' => true, 'naechstes' => "Schau dir die Vorschau am Handy an und schick mir noch ein Foto vom Verkaufsraum."]]);
$t = fn($s) => date('c', strtotime($s));
$l = [
 ['id'=>'a1','zeit'=>$t('-2 days 09:12'),'von'=>'tim','art'=>'nachricht','text'=>"Hallo Anna, die erste Vorschau ist online! Schau sie dir in Ruhe an und schreib mir, was du anders haben möchtest."],
 ['id'=>'a2','zeit'=>$t('-2 days 18:40'),'von'=>'kunde','art'=>'nachricht','text'=>"Die Farben und das große Brot-Foto oben gefallen mir sehr!"],
 ['id'=>'a3','zeit'=>$t('-2 days 18:42'),'von'=>'kunde','art'=>'frage','text'=>"Kann man am Handy die Öffnungszeiten gleich oben sehen?"],
 ['id'=>'a4','zeit'=>$t('-1 days 08:05'),'von'=>'tim','art'=>'nachricht','text'=>"Ja, die stehen jetzt direkt unter dem Foto. Schau gern nochmal rein."],
];
kp_msg_update($u, fn($d) => ['liste'=>$l,'gelesen'=>['kunde'=>3,'tim'=>4]]);
echo "ok\n";
