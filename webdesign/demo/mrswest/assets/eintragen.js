/* Backen mit Mrs. West: Rezept eintragen (Entwurf, speichert nur auf diesem Gerät). */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function lies(k, d) { try { var v = localStorage.getItem('mw_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function schreib(k, v) { try { localStorage.setItem('mw_' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var toastT;
  function toast(t) { var el = $('[data-toast]'); el.textContent = t; el.classList.add('da'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('da'); }, 2800); }

  var form = $('[data-form]'), foto = null;
  var KAT_NAME = { kuchen: 'Kuchen', torten: 'Torten', kekse: 'Kekse & Kleines', fruehstueck: 'Frühstück', brot: 'Brot & Gebäck' };
  var KAT_FARBE = { kuchen: 'k-rosa', torten: 'k-butter', kekse: 'k-mint', fruehstueck: 'k-pfirsich', brot: 'k-himmel' };
  var STUFE = ['', 'Einfach', 'Mittel', 'Für Geübte'];
  var FORMEN = {
    rund: { lbl: 'Durchmesser', opt: [[16, '16 cm'], [18, '18 cm'], [20, '20 cm'], [22, '22 cm'], [24, '24 cm'], [26, '26 cm'], [28, '28 cm']], std: 26 },
    kasten: { lbl: 'Länge', opt: [[20, '20 cm'], [25, '25 cm'], [30, '30 cm']], std: 30 },
    eckig: { lbl: 'Größe', opt: [['20x20', '20 × 20 cm'], ['20x30', '20 × 30 cm'], ['30x40', 'Blech 30 × 40 cm']], std: '30x40' },
    stueck: { lbl: 'Anzahl', opt: [6, 8, 10, 12, 16, 20, 24, 30].map(function (n) { return [n, n + ' Stück']; }), std: 12 },
    portion: { lbl: 'Personen', opt: [1, 2, 3, 4, 6, 8].map(function (n) { return [n, n + (n === 1 ? ' Person' : ' Personen')]; }), std: 4 }
  };
  function formWerte(typ, wahl) {
    var f = FORMEN[typ];
    $('[data-formwert-lbl]').textContent = f.lbl;
    $('#formwert').innerHTML = f.opt.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(wahl === undefined ? f.std : wahl) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('');
  }
  $('#formtyp').addEventListener('change', function () { formWerte(this.value); vorschau(); });
  formWerte('rund');

  /* ---------- Zutaten verstehen ---------- */
  var BRUCH = { '½': 0.5, '¼': 0.25, '¾': 0.75 };
  var EINHEIT = /^(kg|g|gr|ml|l|el|tl|pkg|pk|packung|packungen|päckchen|pck|prise|prisen|stk|stück|becher|tropfen|zweig|zweige|dose|dosen|bund|msp)\.?$/i;
  function zahl(s) {
    if (!s) return 0;
    if (BRUCH[s]) return BRUCH[s];
    var m = /^(\d+)\s*([½¼¾])$/.exec(s); if (m) return Number(m[1]) + BRUCH[m[2]];
    m = /^(\d+)\/(\d+)$/.exec(s); if (m) return m[1] / m[2];
    return parseFloat(s.replace(',', '.')) || 0;
  }
  function zutatLesen(zeile) {
    var t = zeile.replace(/^[\s\-–•*·✔️✅▪️]+/, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    if (!t) return null;
    var m = /^(ca\.?\s*)?(\d+\s*[½¼¾]|\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾])\s*(.*)$/.exec(t);
    if (!m) return [0, '', t];
    var x = zahl(m[2].replace(/\s+/g, '')), rest = m[3].trim(), e = '';
    var w = /^(\S+)\s+(.+)$/.exec(rest);
    var erstes = w ? w[1] : rest;
    if (EINHEIT.test(erstes)) {
      e = erstes.replace(/\.$/, '').toLowerCase(); rest = w ? w[2] : '';
      if (e === 'kg') { x *= 1000; e = 'g'; } else if (e === 'l') { x *= 1000; e = 'ml'; } else if (e === 'gr') e = 'g';
      else if (/^(pkg|pk|pck|packung|packungen|päckchen)$/.test(e)) e = 'Pkg';
      else if (e === 'el') e = 'EL'; else if (e === 'tl') e = 'TL';
      else if (/^prise/.test(e)) e = 'Prise';
      else if (e === 'stk' || e === 'stück') e = '';
      else if (e === 'msp') e = 'Msp';
      else if (e === 'g' || e === 'ml') { /* passt */ }
      else e = e.charAt(0).toUpperCase() + e.slice(1);
    }
    return [Math.round(x * 100) / 100, e, rest.replace(/^(von|vom)\s+/i, '').trim() || t];
  }
  function zutatenLesen() {
    return $('#zutaten').value.split('\n').map(zutatLesen).filter(Boolean);
  }
  function mengeTxt(z) { return z[0] ? String(z[0]).replace('.', ',') + (z[1] ? ' ' + z[1] : '') : ''; }
  function erkannt() {
    var z = zutatenLesen();
    $('[data-erkannt]').innerHTML = z.map(function (x) {
      return '<li' + (x[0] ? '' : ' class="ohne"') + '><b>' + esc(mengeTxt(x) || 'nach Gefühl') + '</b>' + esc(x[2]) + '</li>';
    }).join('');
  }

  /* ---------- Schritte ---------- */
  function schritteLesen() {
    return $('#schritte').value.split('\n').map(function (s) {
      var t = s.replace(/^\s*(?:\d+[.)]|[-–•*·]|schritt\s*\d+:?)\s*/i, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
      if (!t) return null;
      var m = /(\d+)\s*(?:-|bis|–)?\s*(\d+)?\s*(min|minuten|std|stunden|h)\b/i.exec(t), o = { t: t };
      if (m) { var v = Number(m[2] || m[1]); o.min = /^(std|stunden|h)$/i.test(m[3]) ? v * 60 : v; }
      return o;
    }).filter(Boolean);
  }

  /* ---------- Instagram-Text aufteilen ---------- */
  var BEISPIEL = '🍎 Apfel-Zimt-Blechkuchen 🍎\nSaftig, schnell gemacht und perfekt für den Herbst!\n\nZutaten (Blech 30x40):\n250 g Butter\n200 g Zucker\n4 Eier\n400 g Mehl\n1 Pkg Backpulver\n150 ml Milch\n1 TL Zimt\n5 Äpfel\n\nZubereitung:\n1. Backrohr auf 180 °C vorheizen.\n2. Butter und Zucker cremig rühren, Eier einzeln dazugeben.\n3. Mehl mit Backpulver und Zimt mischen und abwechselnd mit der Milch unterrühren.\n4. Teig aufs Blech streichen, Äpfel in Spalten schneiden und darauf verteilen.\n5. Ca. 35 Minuten goldbraun backen.\n\nTipp: Mit Schlagobers servieren!\n\n#backen #apfelkuchen #herbst';
  $('[data-beispiel]').addEventListener('click', function () { $('#insta').value = BEISPIEL; $('#insta').focus(); });
  function ohneEmoji(s) { return s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim(); }
  $('[data-aufteilen]').addEventListener('click', function () {
    var text = $('#insta').value;
    if (!text.trim()) { toast('Füge zuerst deinen Instagram-Text ein.'); $('#insta').focus(); return; }
    var zeilen = text.split('\n').map(function (z) { return z.trim(); }).filter(function (z) { return z && !/^#/.test(z) && !/^(#\w+\s*)+$/.test(z); });
    var titel = '', kurz = [], zut = [], sch = [], tipp = '', modus = 'kopf';
    zeilen.forEach(function (z) {
      var n = ohneEmoji(z).replace(/#\w+/g, '').trim(); if (!n) return;
      if (/^(zutaten|du brauchst|ihr braucht|für den teig|für die creme|für die füllung)/i.test(n)) {
        modus = 'zut';
        var f = /(\d{2})\s*[x×]\s*(\d{2})/.exec(n), r = /(?:ø|durchmesser|springform)\s*(\d{2})/i.exec(n);
        if (f) { $('#formtyp').value = 'eckig'; formWerte('eckig', f[1] + 'x' + f[2]); } else if (r) { $('#formtyp').value = 'rund'; formWerte('rund', r[1]); }
        var nach = /:\s*(.+)$/.exec(n); if (nach && /\d/.test(nach[1]) && !f && !r) zut.push(nach[1]);
        return;
      }
      if (/^(zubereitung|so geht'?s|anleitung|und so geht'?s|so wird'?s gemacht)/i.test(n)) { modus = 'sch'; return; }
      if (/^tipp/i.test(n)) { tipp = n.replace(/^tipp\s*[:!-]?\s*/i, ''); return; }
      if (modus === 'kopf') {
        if (!titel) titel = n.replace(/[:!]+$/, '');
        else if (/^\d/.test(n) || /^[-•]/.test(z)) { zut.push(n); modus = 'zut'; }
        else kurz.push(n);
      } else if (modus === 'zut') {
        if (/^\d+[.)]\s/.test(n) && n.length > 30) { modus = 'sch'; sch.push(n); } else zut.push(n);
      } else sch.push(n);
    });
    if (titel) $('#titel').value = titel;
    if (kurz.length) $('#kurz').value = kurz.join(' ');
    if (zut.length) $('#zutaten').value = zut.join('\n');
    if (sch.length) $('#schritte').value = sch.join('\n');
    if (tipp) $('#tipp').value = tipp;
    /* Kategorie und Zeit schätzen */
    var alles = (titel + ' ' + kurz.join(' ')).toLowerCase();
    var tipps = { kuchen: /kuchen|brownie|gugelhupf|schnitte|bananenbrot/, torten: /torte|cheesecake|pavlova/, kekse: /keks|cookie|muffin|cupcake|kipferl/, fruehstueck: /frühstück|waffel|pancake|schmarrn|porridge/, brot: /brot|semmel|weckerl|focaccia|germ|zopf/ };
    $$('[data-kats] input').forEach(function (i) { if (tipps[i.value]) i.checked = tipps[i.value].test(alles); });
    var minuten = schritteLesen().reduce(function (s, x) { return s + (x.min || 0); }, 0);
    if (minuten) { $('#zeit').value = Math.ceil((minuten + 20) / 5) * 5; $('[data-schnell]').checked = minuten + 20 <= 40; }
    if (/kuchen|torte|brot/.test(alles) && $('#formtyp').value === 'rund' && /blech/i.test(text)) { $('#formtyp').value = 'eckig'; formWerte('eckig', '30x40'); }
    erkannt(); vorschau();
    toast('Erkannt: ' + zut.length + ' Zutaten und ' + sch.length + ' Schritte. Bitte kurz drüberschauen.');
    $('#titel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- Foto: wird im Browser verkleinert ---------- */
  function kb(b) { return b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.round(b / 1024) + ' KB'; }
  $('[data-foto-in]').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var img = new Image(), leser = new FileReader();
    img.onload = function () {
      var max = 1200, s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      var d = c.toDataURL('image/webp', 0.72); if (d.indexOf('image/webp') === -1) d = c.toDataURL('image/jpeg', 0.75);
      foto = d;
      var neu = Math.round((d.length - d.indexOf(',') - 1) * 0.75);
      $('[data-foto-bild]').src = d; $('[data-foto-bild]').hidden = false; $('[data-foto]').classList.add('hat');
      var info = $('[data-foto-info]'); info.hidden = false;
      info.innerHTML = '⚡ Foto verkleinert: <b>' + kb(f.size) + ' → ' + kb(neu) + '</b>. So bleibt die Seite schnell.';
      vorschau();
    };
    img.onerror = function () { toast('Dieses Foto kann der Browser nicht öffnen.'); };
    /* als data:-Adresse lesen, blob: erlaubt die Sicherheitsregel der Seite nicht */
    leser.onload = function () { img.src = leser.result; };
    leser.onerror = img.onerror;
    leser.readAsDataURL(f);
  });

  /* ---------- Vorschau ---------- */
  function daten() {
    var kats = $$('[data-kats] input:checked').map(function (i) { return i.value; });
    var typ = $('#formtyp').value, w = $('#formwert').value;
    return {
      titel: $('#titel').value.trim(), kurz: $('#kurz').value.trim(),
      kat: kats.filter(function (k) { return k !== 'schnell'; }), schnell: kats.indexOf('schnell') !== -1,
      zeit: Math.max(5, Number($('#zeit').value) || 30), stufe: Number(($('[name=stufe]:checked') || {}).value || 1),
      form: { typ: typ, wert: typ === 'eckig' ? w : Number(w) },
      zutaten: zutatenLesen(), schritte: schritteLesen(), tipp: $('#tipp').value.trim()
    };
  }
  function zeitTxt(m) { return m < 60 ? m + ' Min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' Min' : ''); }
  function vorschau() {
    var d = daten();
    $('[data-v-titel]').textContent = d.titel || 'Dein neues Rezept';
    $('[data-v-kurz]').textContent = d.kurz || 'Hier erscheint deine Beschreibung.';
    $('[data-v-zeit]').textContent = zeitTxt(d.zeit) + ' · ' + STUFE[d.stufe];
    $('[data-v-tags]').innerHTML = (d.schnell ? '<span class="tag k-himmel">Schnell</span>' : '') + d.kat.map(function (k) { return '<span class="tag ' + KAT_FARBE[k] + '">' + esc(KAT_NAME[k]) + '</span>'; }).join('');
    var b = $('[data-v-bild]'); if (foto) { b.src = foto; b.hidden = false; }
    $('[data-v-zahl]').textContent = d.zutaten.length + ' Zutaten · ' + d.schritte.length + ' Schritte' + (d.schritte.some(function (s) { return s.min; }) ? ' · mit Timer' : '');
  }
  form.addEventListener('input', function (e) { if (e.target.id === 'zutaten') erkannt(); if (e.target.id !== 'insta') vorschau(); });
  form.addEventListener('change', vorschau);

  /* ---------- Meine Rezepte ---------- */
  function meine() {
    var l = lies('eigene', []), box = $('[data-meine]');
    box.hidden = !l.length;
    $('[data-meine-liste]').innerHTML = l.map(function (r, i) {
      return '<li><a href="./#rezept-' + esc(r.id) + '">' + esc(r.titel) + '</a><button type="button" class="linkbtn" data-weg="' + i + '">Löschen</button></li>';
    }).join('');
  }
  $('[data-meine-liste]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-weg]'); if (!b) return;
    var l = lies('eigene', []); l.splice(Number(b.getAttribute('data-weg')), 1); schreib('eigene', l); meine(); toast('Rezept gelöscht.');
  });

  /* ---------- Veröffentlichen ---------- */
  function slug(s) { return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'rezept'; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = daten(), fehlt = '';
    if (!d.titel) fehlt = '#titel'; else if (!d.zutaten.length) fehlt = '#zutaten'; else if (!d.schritte.length) fehlt = '#schritte';
    $$('.fehlt', form).forEach(function (x) { x.classList.remove('fehlt'); });
    if (fehlt) { var f = $(fehlt); f.classList.add('fehlt'); f.focus(); toast(fehlt === '#titel' ? 'Bitte gib dem Rezept einen Namen.' : fehlt === '#zutaten' ? 'Bitte noch die Zutaten eintragen.' : 'Bitte noch die Schritte eintragen.'); return; }
    if (!d.kat.length) d.kat = ['kuchen'];
    d.id = 'eigen-' + slug(d.titel) + '-' + Date.now().toString(36);
    d.kurz = d.kurz || d.titel;
    d.tipp = d.tipp || 'Gutes Gelingen!';
    d.foto = foto || '';
    d.bild = '';
    d.eigen = true;
    var l = lies('eigene', []); l.unshift(d);
    if (!schreib('eigene', l)) { toast('Der Speicher am Gerät ist voll. Bitte ein kleineres Foto wählen.'); return; }
    location.href = './?neu=1#rezept-' + d.id;
  });

  erkannt(); vorschau(); meine();
})();
