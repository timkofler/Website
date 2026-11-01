/* Backen mit Mrs. West: Rezept-Dose, Backform-Rechner, Einkaufsliste, Backmodus. Ohne Bibliotheken. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var REZEPTE = JSON.parse($('#rezeptDaten').textContent);
  /* Selbst eingetragene Rezepte (Entwurf: nur auf diesem Gerät) kommen nach vorne */
  try { var eig = JSON.parse(localStorage.getItem('mw_eigene') || '[]'); if (Array.isArray(eig)) REZEPTE = eig.filter(function (r) { return r && r.id && r.titel && Array.isArray(r.zutaten) && Array.isArray(r.schritte) && r.form; }).concat(REZEPTE); } catch (e) { /* egal */ }
  var BY_ID = {};
  REZEPTE.forEach(function (r) { BY_ID[r.id] = r; });

  /* ---------- Speicher (nur auf diesem Gerät) ---------- */
  function lies(k, d) { try { var v = localStorage.getItem('mw_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function schreib(k, v) { try { localStorage.setItem('mw_' + k, JSON.stringify(v)); } catch (e) { /* privat-Modus */ } }

  var state = { kat: 'alle', q: '', zutaten: [], merk: lies('merk', []), liste: lies('liste', []) };

  /* ---------- Hilfen ---------- */
  function norm(s) {
    return String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function stamm(w) { w = norm(w); return w.length > 4 ? w.replace(/(en|n|e|s)$/, '') : w; }
  var SYN = { quark: 'topfen', sahne: 'schlagobers', obers: 'schlagobers', tomate: 'paradeiser', tomaten: 'paradeiser', johannisbeere: 'ribisel', johannisbeeren: 'ribiseln', hefe: 'germ', puderzucker: 'staubzucker', ei: 'eier', eiweiss: 'eiklar', schoko: 'schokolade', kakaopulver: 'kakao' };
  function syn(w) { var n = norm(w); return SYN[n] ? SYN[n] : n; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function grundname(n) { return n.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\b(für|zum|zum Bestreuen|zum Servieren).*$/i, '').replace(/^(sehr reife|lauwarme|lauwarmes|gemischte|frische)\s+/i, '').trim(); }
  var STUFE = ['', 'Einfach', 'Mittel', 'Für Geübte'];
  var KAT_NAME = { kuchen: 'Kuchen', torten: 'Torten', kekse: 'Kekse & Kleines', fruehstueck: 'Frühstück', brot: 'Brot & Gebäck' };
  var KAT_FARBE = { kuchen: 'k-rosa', torten: 'k-butter', kekse: 'k-mint', fruehstueck: 'k-pfirsich', brot: 'k-himmel' };
  function zeitTxt(m) { return m < 60 ? m + ' Min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' Min' : ''); }

  var toastT;
  function toast(t) {
    var el = $('[data-toast]'), wirt = document.querySelector('dialog[open]') || document.body;
    if (el.parentNode !== wirt) wirt.appendChild(el);
    el.textContent = t; el.classList.add('da');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('da'); }, 2600);
  }

  /* ---------- Zahlen schön machen ---------- */
  function bruch(x) {
    var g = Math.floor(x), r = x - g, s = '';
    if (Math.abs(r - 0.5) < 0.01) s = '½'; else if (Math.abs(r - 0.25) < 0.01) s = '¼'; else if (Math.abs(r - 0.75) < 0.01) s = '¾';
    return (g ? String(g) : '') + s || '0';
  }
  function menge(x, einheit, name) {
    if (!x) return '';
    if (einheit === 'Prise') return '1 Prise';
    if (einheit === 'g' || einheit === 'ml') {
      var v = x >= 100 ? Math.round(x / 5) * 5 : x >= 10 ? Math.round(x) : Math.round(x * 2) / 2;
      return String(v).replace('.', ',') + ' ' + einheit;
    }
    if (einheit === '' && /^(eier|ei|eiklar)$/i.test(name)) return String(Math.max(1, Math.round(x)));
    var h = Math.max(0.25, Math.round(x * (x < 2 ? 4 : 2)) / (x < 2 ? 4 : 2));
    return bruch(h) + (einheit ? ' ' + einheit : '');
  }
  function zutatName(name, x, einheit) {
    if (einheit === '' && x) {
      var n = Math.max(1, Math.round(x));
      if (name === 'Eier' && n === 1) return 'Ei';
      if (name === 'Ei' && n > 1) return 'Eier';
    }
    return name;
  }

  /* ---------- Rezept-Dose ---------- */
  var grid = $('[data-grid]');
  function passtZutaten(r) {
    if (!state.zutaten.length) return [];
    var namen = r.zutaten.map(function (z) { return norm(z[2]); }).join(' | ');
    var treffer = [];
    for (var i = 0; i < state.zutaten.length; i++) {
      var s = stamm(syn(state.zutaten[i]));
      if (namen.indexOf(s) === -1) return null;
      treffer.push(state.zutaten[i]);
    }
    return treffer;
  }
  function passtSuche(r) {
    if (!state.q) return true;
    var heu = norm(r.titel + ' ' + r.kurz + ' ' + r.kat.map(function (k) { return KAT_NAME[k]; }).join(' ') + ' ' + r.zutaten.map(function (z) { return z[2]; }).join(' ') + (r.schnell ? ' schnell einfach' : ''));
    return norm(state.q).split(' ').every(function (w) { return heu.indexOf(stamm(syn(w))) !== -1; });
  }
  function passtKat(r) {
    if (state.kat === 'alle') return true;
    if (state.kat === 'schnell') return r.schnell;
    if (state.kat === 'merk') return state.merk.indexOf(r.id) !== -1;
    return r.kat.indexOf(state.kat) !== -1;
  }
  function bildTag(r) {
    if (r.eigen) return r.foto && /^data:image\/(webp|jpeg|png);base64,/.test(r.foto) ? '<img src="' + r.foto + '" alt="" width="640" height="480">' : '<span class="karte__platz" aria-hidden="true"></span>';
    return '<img src="assets/img/' + r.bild + '-640.webp" srcset="assets/img/' + r.bild + '-360.webp 360w, assets/img/' + r.bild + '-640.webp 640w, assets/img/' + r.bild + '-1200.webp 1200w" sizes="(max-width:559px) 118px, (max-width:959px) 50vw, 370px" alt="" width="640" height="480" loading="lazy" decoding="async">';
  }
  function karte(r, treffer, i) {
    var gemerkt = state.merk.indexOf(r.id) !== -1;
    var tags = r.kat.map(function (k) { return '<span class="tag ' + KAT_FARBE[k] + '">' + esc(KAT_NAME[k]) + '</span>'; }).join('');
    if (r.schnell) tags = '<span class="tag k-himmel">Schnell</span>' + tags;
    if (r.eigen) tags = '<span class="tag tag--neu">Neu</span>' + tags;
    if (treffer && treffer.length) tags = treffer.map(function (t) { return '<span class="tag tag--passt">✓ ' + esc(t) + '</span>'; }).join('') + tags;
    return '<article class="karte" style="animation-delay:' + Math.min(i, 8) * 40 + 'ms">' +
      '<button class="herzbtn" type="button" data-herz="' + r.id + '" aria-pressed="' + gemerkt + '" aria-label="' + esc(r.titel) + (gemerkt ? ' nicht mehr merken' : ' merken') + '"><svg><use href="#' + (gemerkt ? 'i-herz' : 'i-herz-o') + '"/></svg></button>' +
      '<button class="karte__knopf" type="button" data-rezept="' + r.id + '">' +
      '<div class="karte__bild">' + bildTag(r) +
      '<span class="karte__zeit"><svg><use href="#i-uhr"/></svg>' + zeitTxt(r.zeit) + ' · ' + STUFE[r.stufe] + '</span></div>' +
      '<div class="karte__txt"><h3>' + esc(r.titel) + '</h3><span class="karte__meta"><svg><use href="#i-uhr"/></svg>' + zeitTxt(r.zeit) + ' · ' + STUFE[r.stufe] + '</span><p>' + esc(r.kurz) + '</p><div class="karte__tags">' + tags + '</div></div>' +
      '</button></article>';
  }
  function render() {
    var liste = [];
    REZEPTE.forEach(function (r) {
      if (!passtKat(r) || !passtSuche(r)) return;
      var t = passtZutaten(r);
      if (t === null) return;
      liste.push([r, t]);
    });
    if (state.q) {
      var q = norm(state.q);
      liste.sort(function (a, b) { return (norm(b[0].titel).indexOf(stamm(q)) !== -1) - (norm(a[0].titel).indexOf(stamm(q)) !== -1); });
    }
    grid.innerHTML = liste.map(function (x, i) { return karte(x[0], x[1], i); }).join('');
    $('[data-leer]').hidden = liste.length > 0;
    var t = liste.length + (liste.length === 1 ? ' Rezept' : ' Rezepte');
    if (state.kat === 'merk' && !liste.length && !state.q && !state.zutaten.length) {
      t = 'Noch nichts gemerkt. Tippe bei einem Rezept auf das Herz.';
      $('[data-leer]').hidden = true;
    } else if (state.zutaten.length) t += ' mit ' + state.zutaten.join(', ');
    $('[data-treffer]').textContent = t;
    $$('.kat').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-kat') === state.kat)); });
  }

  /* Kategorien */
  $$('.kat').forEach(function (b) {
    b.addEventListener('click', function () { state.kat = b.getAttribute('data-kat'); render(); });
  });

  /* Suche */
  var suche = $('#suche'), heroSuche = $('#heroSuche');
  var suchT;
  suche.addEventListener('input', function () {
    clearTimeout(suchT);
    suchT = setTimeout(function () { state.q = suche.value.trim(); render(); }, 120);
  });
  function zuDose() { $('#rezepte').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  $('[data-hero-suche]').addEventListener('submit', function (e) {
    e.preventDefault();
    suche.value = heroSuche.value.trim(); state.q = suche.value; state.kat = 'alle'; render(); zuDose();
    heroSuche.blur();
  });

  /* Zutaten-Chips */
  var chips = $('[data-chips]'), zutatIn = $('#zutat');
  var alleZutaten = {};
  REZEPTE.forEach(function (r) { r.zutaten.forEach(function (z) { var g = grundname(z[2]); if (g.length > 2) alleZutaten[g] = 1; }); });
  $('#zutatenListe').innerHTML = Object.keys(alleZutaten).sort(function (a, b) { return a.localeCompare(b, 'de'); }).map(function (z) { return '<option value="' + esc(z) + '">'; }).join('');
  function chipsZeichnen() {
    $$('.chip', chips).forEach(function (c) { c.remove(); });
    state.zutaten.forEach(function (z, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-label', z + ' entfernen');
      b.innerHTML = esc(z) + '<span><svg><use href="#i-x"/></svg></span>';
      b.addEventListener('click', function () { state.zutaten.splice(i, 1); chipsZeichnen(); render(); zutatIn.focus(); });
      chips.insertBefore(b, zutatIn);
    });
    zutatIn.placeholder = state.zutaten.length ? 'noch eine Zutat?' : 'Zutat eingeben, z. B. Topfen';
  }
  function zutatDazu(w) {
    w = w.trim().replace(/,$/, '');
    if (!w) return;
    var n = norm(w);
    if (!state.zutaten.some(function (z) { return norm(z) === n; })) state.zutaten.push(w.charAt(0).toUpperCase() + w.slice(1));
    zutatIn.value = ''; chipsZeichnen(); render();
  }
  zutatIn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); zutatDazu(zutatIn.value); }
    else if (e.key === 'Backspace' && !zutatIn.value && state.zutaten.length) { state.zutaten.pop(); chipsZeichnen(); render(); }
  });
  zutatIn.addEventListener('change', function () { if (alleZutaten[zutatIn.value]) zutatDazu(zutatIn.value); });
  zutatIn.addEventListener('blur', function () { if (zutatIn.value.trim()) zutatDazu(zutatIn.value); });

  function reset() { state.kat = 'alle'; state.q = ''; state.zutaten = []; suche.value = ''; heroSuche.value = ''; chipsZeichnen(); render(); }
  $('[data-reset]').addEventListener('click', reset);

  /* Schnell-Knöpfe im Startbild */
  $$('[data-kat-jump]').forEach(function (b) { b.addEventListener('click', function () { reset(); state.kat = b.getAttribute('data-kat-jump'); render(); zuDose(); }); });
  $$('[data-such-jump]').forEach(function (b) { b.addEventListener('click', function () { reset(); suche.value = heroSuche.value = state.q = b.getAttribute('data-such-jump'); render(); zuDose(); }); });
  $$('[data-zutat-jump]').forEach(function (b) { b.addEventListener('click', function () { reset(); zutatDazu(b.getAttribute('data-zutat-jump')); zuDose(); }); });

  /* Merken */
  function zaehler() {
    var m = $('[data-count-merk]'), l = $('[data-count-liste]');
    m.hidden = !state.merk.length; m.textContent = state.merk.length;
    var offen = state.liste.filter(function (x) { return !x.erledigt; }).length;
    l.hidden = !offen; l.textContent = offen;
  }
  function merken(id) {
    var i = state.merk.indexOf(id);
    if (i === -1) { state.merk.push(id); toast('Gemerkt. Du findest es unter „Gemerkt“.'); } else { state.merk.splice(i, 1); toast('Nicht mehr gemerkt.'); }
    schreib('merk', state.merk); zaehler();
    var b = $('[data-count-merk]'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    return i === -1;
  }
  grid.addEventListener('click', function (e) {
    var h = e.target.closest('[data-herz]');
    if (h) { merken(h.getAttribute('data-herz')); render(); return; }
    var k = e.target.closest('[data-rezept]');
    if (k) oeffne(k.getAttribute('data-rezept'), true);
  });
  $('[data-merkliste]').addEventListener('click', function () { reset(); state.kat = 'merk'; render(); zuDose(); });

  /* ---------- Rezept-Blatt ---------- */
  var blatt = $('[data-blatt]'), aktuell = null, faktor = 1, wahl = null, gepusht = false;
  var FORMEN = {
    rund: [16, 18, 20, 22, 24, 26, 28],
    kasten: [20, 25, 30],
    eckig: [['20x20', 'Form 20 × 20'], ['20x30', 'Form 20 × 30'], ['30x40', 'Blech 30 × 40']]
  };
  function flaeche(s) { var p = String(s).split('x'); return p[0] * p[1]; }
  function berechne() {
    var f = aktuell.form;
    if (f.typ === 'rund') faktor = Math.pow(wahl / f.wert, 2);
    else if (f.typ === 'kasten') faktor = wahl / f.wert;
    else if (f.typ === 'eckig') faktor = flaeche(wahl) / flaeche(f.wert);
    else faktor = wahl / f.wert;
  }
  function rechnerZeichnen() {
    var f = aktuell.form, box = $('[data-b-rechner]'), h = '';
    if (f.typ === 'portion' || f.typ === 'stueck') {
      var wort = f.typ === 'portion' ? (wahl === 1 ? 'Person' : 'Personen') : (f.name || 'Stück');
      h = '<p class="rechner__titel">Mengen-Rechner</p><div class="rechner__zeile"><span>Für</span><span class="stepper"><button type="button" data-step="-1" aria-label="weniger">−</button><output aria-live="polite">' + wahl + '</output><button type="button" data-step="1" aria-label="mehr">+</button></span><span>' + esc(wort) + '</span></div>';
    } else {
      var titel = f.typ === 'rund' ? (f.name || 'Springform') + ' Ø' : f.typ === 'kasten' ? 'Kastenform Länge' : 'Form';
      h = '<p class="rechner__titel">Backform-Rechner · ' + titel + '</p><div class="rechner__zeile">' +
        FORMEN[f.typ].map(function (o) {
          var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o + ' cm';
          return '<button type="button" class="rechner__opt" data-form="' + v + '" aria-pressed="' + (String(v) === String(wahl)) + '">' + t + '</button>';
        }).join('') + '</div>';
    }
    var orig = f.typ === 'rund' ? 'Ø ' + f.wert + ' cm' : f.typ === 'kasten' ? f.wert + ' cm' : f.typ === 'eckig' ? String(f.wert).replace('x', ' × ') + ' cm' : f.wert + ' ' + (f.typ === 'portion' ? 'Personen' : (f.name || 'Stück'));
    var pct = Math.round(faktor * 100);
    h += '<p class="rechner__info">Original: ' + orig + (pct !== 100 ? ' · Mengen jetzt <b>' + pct + ' %</b>' + (f.typ === 'rund' || f.typ === 'eckig' || f.typ === 'kasten' ? ', Backzeit etwas kürzer bzw. länger prüfen.' : '') : ' · Mengen wie im Original.') + '</p>';
    box.innerHTML = h;
  }
  function zutatenZeichnen(blinken) {
    var ul = $('[data-b-zutaten]');
    var alt = $$('input', ul).map(function (i) { return i.checked; });
    ul.innerHTML = aktuell.zutaten.map(function (z, i) {
      var x = z[0] * faktor, m = menge(x, z[1], z[2]);
      return '<li><label class="' + (blinken ? 'neu' : '') + '"><input type="checkbox"' + (alt[i] ? ' checked' : '') + '><span>' + (m ? '<b>' + m + '</b> ' : '') + esc(zutatName(z[2], x, z[1])) + '</span></label></li>';
    }).join('');
  }
  $('[data-b-rechner]').addEventListener('click', function (e) {
    var s = e.target.closest('[data-step]'), o = e.target.closest('[data-form]');
    if (s) { wahl = Math.max(1, Math.min(60, wahl + Number(s.getAttribute('data-step')))); }
    else if (o) { wahl = aktuell.form.typ === 'eckig' ? o.getAttribute('data-form') : Number(o.getAttribute('data-form')); }
    else return;
    berechne(); rechnerZeichnen(); zutatenZeichnen(true);
  });
  function merkKnopf() {
    var b = $('[data-b-merk]'), an = state.merk.indexOf(aktuell.id) !== -1;
    b.setAttribute('aria-pressed', String(an));
    $('use', b).setAttribute('href', an ? '#i-herz' : '#i-herz-o');
    $('span', b).textContent = an ? 'Gemerkt' : 'Merken';
  }
  function sperren(an) { document.documentElement.style.overflow = an ? 'hidden' : ''; }
  function oeffne(id, push) {
    var r = BY_ID[id]; if (!r) return;
    aktuell = r; wahl = r.form.wert; faktor = 1;
    var img = $('[data-b-bild]');
    if (r.eigen) { img.hidden = !r.foto; if (r.foto && /^data:image\/(webp|jpeg|png);base64,/.test(r.foto)) img.src = r.foto; }
    else { img.hidden = false; img.src = 'assets/img/' + r.bild + '-1200.webp'; }
    img.alt = r.titel;
    $('[data-b-titel]').textContent = r.titel;
    $('[data-b-kurz]').textContent = r.kurz;
    $('[data-b-meta]').innerHTML = '<span class="k-himmel"><svg><use href="#i-uhr"/></svg>' + zeitTxt(r.zeit) + '</span><span class="k-mint">' + STUFE[r.stufe] + '</span>' + r.kat.map(function (k) { return '<span class="' + KAT_FARBE[k] + '">' + esc(KAT_NAME[k]) + '</span>'; }).join('');
    $('[data-b-schritte]').innerHTML = r.schritte.map(function (s) { return '<li>' + esc(s.t) + (s.min ? '<span class="zeitchip"><svg><use href="#i-uhr"/></svg>' + s.min + ' Min</span>' : '') + '</li>'; }).join('');
    $('[data-b-tipp]').innerHTML = '<b>Connys Tipp:</b> ' + esc(r.tipp);
    $('[data-b-zutaten]').innerHTML = '';
    rechnerZeichnen(); zutatenZeichnen(false); merkKnopf();
    if (!blatt.open) { blatt.showModal(); sperren(true); }
    blatt.scrollTop = 0;
    if (push) { history.pushState({ rezept: id }, '', '#rezept-' + id); gepusht = true; }
  }
  function schliesse() {
    if (gepusht && history.state && history.state.rezept) { history.back(); return; }
    blatt.close();
  }
  blatt.addEventListener('close', function () { sperren(false); if (gepusht && history.state && history.state.rezept) { gepusht = false; history.back(); } });
  blatt.addEventListener('cancel', function (e) { e.preventDefault(); schliesse(); });
  blatt.addEventListener('click', function (e) { if (e.target === blatt) schliesse(); });
  $('[data-zu]').addEventListener('click', schliesse);
  window.addEventListener('popstate', function () {
    var m = /^#rezept-(.+)$/.exec(location.hash);
    if (m && BY_ID[m[1]]) { oeffne(m[1], false); gepusht = true; }
    else if (blatt.open) { gepusht = false; blatt.close(); }
  });
  $('[data-b-merk]').addEventListener('click', function () { merken(aktuell.id); merkKnopf(); render(); });
  $('[data-b-teilen]').addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#rezept-' + aktuell.id;
    if (navigator.share) { navigator.share({ title: aktuell.titel + ' · Backen mit Mrs. West', url: url }).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { toast('Link kopiert.'); }, function () { toast(url); }); }
  });

  /* ---------- Einkaufsliste ---------- */
  var listeDlg = $('[data-liste]');
  $('[data-b-liste]').addEventListener('click', function () {
    aktuell.zutaten.forEach(function (z) {
      var x = z[0] * faktor, name = grundname(z[2]) || z[2];
      if (/^(Eier|Ei|Eiklar)$/.test(name)) name = 'Eier';
      var key = norm(name) + '|' + z[1];
      var vorh = state.liste.filter(function (i) { return i.key === key; })[0];
      if (vorh) { vorh.x += z[1] === 'Prise' ? 0 : x; vorh.erledigt = false; if (vorh.von.indexOf(aktuell.titel) === -1) vorh.von.push(aktuell.titel); }
      else state.liste.push({ key: key, name: name, einheit: z[1], x: x, von: [aktuell.titel], erledigt: false });
    });
    schreib('liste', state.liste); zaehler();
    var b = $('[data-count-liste]'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    toast('Zutaten für ' + aktuell.titel + ' sind auf der Einkaufsliste.');
  });
  /* Beim Einkaufen zählen ganze Packungen und Stück */
  function listeMenge(i) {
    if (i.einheit === 'Pkg' || (i.einheit === '' && i.x)) return Math.max(1, Math.ceil(i.x - 0.05)) + (i.einheit ? ' Pkg' : '');
    return menge(i.x, i.einheit, i.name);
  }
  function listeText() {
    return 'Einkaufsliste (Backen mit Mrs. West)\n' + state.liste.filter(function (i) { return !i.erledigt; }).map(function (i) {
      var m = listeMenge(i); return '• ' + (m ? m + ' ' : '') + i.name;
    }).join('\n');
  }
  function listeZeichnen() {
    var ul = $('[data-liste-items]');
    ul.innerHTML = state.liste.map(function (i, n) {
      var m = listeMenge(i);
      return '<li><label><input type="checkbox" data-n="' + n + '"' + (i.erledigt ? ' checked' : '') + '><span>' + esc(i.name) + '</span><b>' + m + '</b></label></li>';
    }).join('');
    var rez = {};
    state.liste.forEach(function (i) { i.von.forEach(function (v) { rez[v] = 1; }); });
    var r = Object.keys(rez);
    $('[data-liste-fuer]').textContent = r.length ? 'Für: ' + r.join(', ') : '';
    $('[data-liste-leer]').hidden = state.liste.length > 0;
    $('.liste__fuss').hidden = !state.liste.length;
    $('[data-liste-wa]').href = 'https://wa.me/?text=' + encodeURIComponent(listeText());
  }
  $('[data-liste-items]').addEventListener('change', function (e) {
    var n = e.target.getAttribute('data-n'); if (n === null) return;
    state.liste[n].erledigt = e.target.checked; schreib('liste', state.liste); zaehler();
    $('[data-liste-wa]').href = 'https://wa.me/?text=' + encodeURIComponent(listeText());
  });
  function listeAuf() { listeZeichnen(); listeDlg.showModal(); sperren(true); }
  $$('[data-open-liste]').forEach(function (b) { b.addEventListener('click', listeAuf); });
  $('[data-liste-zu]').addEventListener('click', function () { listeDlg.close(); });
  listeDlg.addEventListener('close', function () { if (!blatt.open) sperren(false); });
  listeDlg.addEventListener('click', function (e) { if (e.target === listeDlg) listeDlg.close(); });
  $('[data-liste-leeren]').addEventListener('click', function () { state.liste = []; schreib('liste', state.liste); zaehler(); listeZeichnen(); toast('Liste geleert.'); });
  $('[data-liste-kopie]').addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(listeText()).then(function () { toast('Liste kopiert.'); }, function () { toast('Kopieren ging nicht.'); });
  });

  /* ---------- Backmodus ---------- */
  var modus = $('[data-modus]');
  blatt.appendChild(modus); /* liegt im Rezept-Blatt, damit es über dem Dialog erscheint */
  var schritt = 0, lock = null, timer = null;
  var lauf = document.createElement('span');
  lauf.className = 'tag k-himmel'; lauf.hidden = true;
  $('.modus__kopf').insertBefore(lauf, $('[data-m-zu]'));
  function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function piep() {
    try {
      var C = window.AudioContext || window.webkitAudioContext, ctx = new C();
      [0, 0.35, 0.7].forEach(function (t) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.25);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
      });
    } catch (e) { /* kein Ton */ }
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }
  function timerKnopf() {
    var s = aktuell.schritte[schritt], b = $('[data-m-timer]');
    b.hidden = !s.min; b.className = 'timer';
    if (!s.min) return;
    if (timer && timer.schritt === schritt) {
      b.classList.add(timer.rest > 0 ? 'laeuft' : 'fertig');
      b.innerHTML = '<svg><use href="#i-uhr"/></svg>' + (timer.rest > 0 ? mmss(timer.rest) + ' · Stopp' : 'Zeit ist um!');
    } else b.innerHTML = '<svg><use href="#i-uhr"/></svg>Timer ' + s.min + ' Min starten';
    lauf.hidden = !(timer && timer.schritt !== schritt && timer.rest > 0);
    if (!lauf.hidden) lauf.textContent = '⏱ ' + mmss(timer.rest);
  }
  function zeigeSchritt() {
    var n = aktuell.schritte.length, t = $('[data-m-text]');
    $('[data-m-nr]').textContent = 'Schritt ' + (schritt + 1) + ' von ' + n;
    t.textContent = aktuell.schritte[schritt].t;
    t.classList.remove('rein'); void t.offsetWidth; t.classList.add('rein');
    $('[data-m-fort]').style.width = ((schritt + 1) / n * 100) + '%';
    $('[data-m-zurueck]').disabled = schritt === 0;
    $('[data-m-weiter]').textContent = schritt === n - 1 ? 'Fertig!' : 'Weiter';
    timerKnopf();
  }
  function wach() { if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {}); }
  $('[data-b-backmodus]').addEventListener('click', function () {
    schritt = 0; $('[data-m-titel]').textContent = aktuell.titel;
    modus.hidden = false; zeigeSchritt(); wach();
    $('[data-m-weiter]').focus();
  });
  function modusZu() {
    modus.hidden = true; if (lock) { lock.release().catch(function () {}); lock = null; }
    if (timer) { clearInterval(timer.id); timer = null; }
    $('[data-b-backmodus]').focus();
  }
  $('[data-m-zu]').addEventListener('click', modusZu);
  $('[data-m-zurueck]').addEventListener('click', function () { if (schritt > 0) { schritt--; zeigeSchritt(); } });
  $('[data-m-weiter]').addEventListener('click', function () {
    if (schritt < aktuell.schritte.length - 1) { schritt++; zeigeSchritt(); }
    else { modusZu(); toast('Gut gemacht! Lass es dir schmecken.'); }
  });
  $('[data-m-timer]').addEventListener('click', function () {
    if (timer && timer.schritt === schritt) { clearInterval(timer.id); timer = null; timerKnopf(); return; }
    if (timer) clearInterval(timer.id);
    timer = { schritt: schritt, rest: aktuell.schritte[schritt].min * 60 };
    timer.id = setInterval(function () {
      timer.rest--;
      if (timer.rest <= 0) { clearInterval(timer.id); piep(); toast('Zeit ist um!'); }
      timerKnopf();
    }, 1000);
    timerKnopf();
  });
  document.addEventListener('keydown', function (e) {
    if (modus.hidden) return;
    if (e.key === 'ArrowRight') $('[data-m-weiter]').click();
    else if (e.key === 'ArrowLeft') $('[data-m-zurueck]').click();
    else if (e.key === 'Escape') { e.preventDefault(); modusZu(); }
  });
  var x0 = null;
  modus.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  modus.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 60 && !e.target.closest('button')) { if (dx < 0) $('[data-m-weiter]').click(); else $('[data-m-zurueck]').click(); }
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!modus.hidden && document.visibilityState === 'visible') wach(); });

  /* ---------- Menü & Kopfzeile ---------- */
  var burger = $('.burger'), menu = $('#menu');
  burger.addEventListener('click', function () {
    var auf = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(auf)); burger.setAttribute('aria-label', auf ? 'Menü schließen' : 'Menü öffnen');
    menu.classList.toggle('offen', auf);
  });
  function menuZu() { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menü öffnen'); menu.classList.remove('offen'); }
  $$('a', menu).forEach(function (a) { a.addEventListener('click', menuZu); });
  document.addEventListener('click', function (e) { if (menu.classList.contains('offen') && !e.target.closest('.nav')) menuZu(); });
  var nav = $('.nav');
  window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });

  /* Platzhalter-Links im Entwurf */
  $$('[data-demo]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); toast(a.getAttribute('data-demo')); }); });
  $$('[data-anfrage]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = $('.pills input[value="' + a.getAttribute('data-anfrage') + '"]'); if (r) r.checked = true;
    });
  });

  /* Formular (im Entwurf ohne Versand) */
  var form = $('[data-formular]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fehlt = $$('[required]', form).filter(function (f) { return !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)); });
    $$('[required]', form).forEach(function (f) { f.classList.toggle('fehlt', fehlt.indexOf(f) !== -1); });
    if (fehlt.length) { fehlt[0].focus(); toast('Bitte noch ' + (fehlt[0].type === 'email' ? 'eine gültige E-Mail' : 'alle Felder') + ' ausfüllen.'); return; }
    $('[data-formular-ok]').hidden = false; form.reset();
  });

  /* ---------- Bewegung ---------- */
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var aufs = $$('.kopf, .vorteile li, .buch__szene, .buch__txt, .ueber__bild, .ueber__txt, .insta__in, .kontakt__txt, .formular');
  if ('IntersectionObserver' in window && !ruhig) {
    aufs.forEach(function (el) { el.classList.add('auf'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('sicht'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    aufs.forEach(function (el) { io.observe(el); });
  }
  /* Buch dreht sich mit Maus bzw. beim Scrollen */
  var buch = $('.buch__3d'), szene = $('[data-tilt]');
  if (!ruhig) {
    $('#backbuch').addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = szene.getBoundingClientRect(), dx = (e.clientX - r.left - r.width / 2) / window.innerWidth, dy = (e.clientY - r.top - r.height / 2) / window.innerHeight;
      buch.style.transform = 'rotateY(' + (-24 + dx * 40) + 'deg) rotateX(' + (6 - dy * 20) + 'deg)';
    });
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick || matchMedia('(hover: hover)').matches) return; tick = true;
      requestAnimationFrame(function () {
        var r = szene.getBoundingClientRect(), p = (r.top + r.height / 2) / window.innerHeight - 0.5;
        if (Math.abs(p) < 1) buch.style.transform = 'rotateY(' + (-24 + p * 30) + 'deg) rotateX(6deg)';
        tick = false;
      });
    }, { passive: true });
  }
  /* Zähler 0 → 40,2 */
  var z = $('[data-zaehler]');
  if ('IntersectionObserver' in window && !ruhig) {
    var zo = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; zo.disconnect();
      var ziel = parseFloat(z.getAttribute('data-zaehler')), t0 = performance.now();
      (function f(t) {
        var p = Math.min(1, (t - t0) / 1400), v = ziel * (1 - Math.pow(1 - p, 3));
        z.textContent = v.toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    });
    zo.observe(z);
  }

  /* Start */
  zaehler(); chipsZeichnen(); render();
  var m0 = /^#rezept-(.+)$/.exec(location.hash), istNeu = /[?&]neu=1/.test(location.search);
  if (m0 && BY_ID[m0[1]]) { history.replaceState(null, '', location.pathname); oeffne(m0[1], true); }
  if (istNeu && m0) setTimeout(function () { toast('Dein Rezept ist online und steht ganz vorne in der Rezept-Dose.'); }, 400);
})();
