// Birnkammer – Beispiel-Onlineshop eines Hofladens (erfundener Betrieb).
// Produkte, Kategorien, Warenkorb, Gutscheincodes, Kasse in vier Schritten mit Versand- und Zahlungsarten,
// Geschenkgutschein, Most-Abo, Kundenkonto mit Bestellverlauf und Downloads, Deutsch/Englisch und Shop-Verwaltung.
// Alles läuft nur im Browser: keine Zahlung, kein Versand, keine E-Mail. Produktbilder sind selbst gezeichnete SVGs.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("tk-shop-" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("tk-shop-" + k, JSON.stringify(v)); } catch (e) {} }
  };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  /* ---------- Sprache ---------- */
  var lang = store.get("lang", "de") === "en" ? "en" : "de";
  var EN = {
    logo_sub: "Farm shop · Mostviertel", nav_shop: "Shop", nav_abo: "Cider box", nav_gift: "Gift cards", nav_ship: "Shipping", nav_admin: "For the farm",
    search_l: "Search the shop", search_p: "Search …", acct_l: "Customer account",
    hero_kick: "Farm shop since 1987 · now online", hero_h1: "From the orchard", hero_h2: "straight to you.",
    hero_lead: "Perry, juices, fruit brandies and honey from our own farm in Lower Austria’s Mostviertel. Order online and pick it up on Friday, or we ship it anywhere in Austria.",
    hero_cta: "Go to the shop", hero_cta2: "Perry box subscription", usp1: "Free pick-up at the farm", usp2: "Free shipping from € 59", usp3: "Secure payment",
    hero_tag_b: "Autumn harvest", hero_tag_s: "Freshly pressed pears",
    promo_a: "Autumn deal: use the code", promo_b: "for 10 % off everything in your basket, until 30 November.",
    shop_kick: "Our farm shop", shop_h: "Everything from the farm, one click away", sort_l: "Sort", sort_top: "Popular", sort_up: "Price: low to high", sort_down: "Price: high to low", sort_az: "Name A–Z",
    abo_kick: "Subscriptions & memberships", abo_h: "The perry box arrives by itself", abo_p: "Six bottles of your choice, every month or less often. Pause, skip a delivery or cancel with one click in your account.",
    abo_t1: "Every delivery more than 10 % cheaper than single bottles", abo_t2: "Pause or cancel any time, no commitment", abo_t3: "New varieties go into the box first",
    abo_mix: "What goes in the box?", mix_most: "Perry", mix_most_s: "6 × perry 1 l", mix_misch: "Mixed", mix_misch_s: "4 perry, 2 juice", mix_saft: "Juice", mix_saft_s: "6 × juice 1 l, alcohol-free",
    abo_int: "How often?", int1: "Monthly", int2: "Every 2 months", int3: "Every 3 months", per_delivery: "per delivery", abo_btn: "Add subscription",
    g_amount: "Amount", g_own: "Custom", g_motif: "Design", m_birne: "Pear tree", m_geb: "Birthday", m_adv: "Advent", g_for: "For", g_from: "From",
    g_how: "Delivery", g_pdf: "PDF by e-mail", g_pdf_s: "instantly, print at home", g_post: "Printed by post", g_post_s: "card in an envelope, + € 2.00", g_btn: "Add gift card",
    g_kick: "Gift cards", g_h: "Give a piece of the Mostviertel", g_card: "Gift card", g_valid: "valid for 3 years", g_note: "Valid in the farm shop and online. Any remaining balance stays on the code.",
    v_kick: "Shipping & payment", v_h: "How it gets to you", s_hof: "Pick-up at the farm shop", free: "free", s_hof_p: "Fri 2–6 pm and Sat 8 am–12 pm. We pack everything, you just pick it up.",
    s_reg: "Delivery in the Mostviertel", s_reg_p: "Every Thursday with our van, up to 25 km around the farm.", s_post: "Parcel anywhere in Austria", s_post_f: "free from € 59",
    s_post_p: "In 2–3 working days, packed shatter-proof, with tracking.", s_de: "Germany", s_de_p: "In 4–6 working days. Fruit brandies only ship within Austria.",
    pay_h: "Pay with", pay_inv: "Invoice", pay_cash: "Cash on pick-up",
    a_kick: "For the business", a_h: "How the farm runs its shop", a_sub: "Change prices and stock here: the shop above updates instantly. Orders from the checkout appear in the list straight away.",
    a_orders: "Orders", a_csv: "CSV for accounting", a_stock: "Products & stock", a_edit: "tap to edit", a_ifc: "Connected:",
    i1: "Post shipping labels", i2: "Till in the farm shop", i3: "Accounting (CSV, BMD)", i4: "Newsletter", i5: "Google Shopping", i6: "Stock synced with the till",
    f_addr: "Eder family · Hofweg 7 · 3251 Musterdorf · Mostviertel", f_demo: "Fictional farm shop, all data are examples. No orders are accepted and no payments are made.",
    f_ship: "Shipping & payment", f_agb: "Terms", f_wr: "Withdrawal", f_imp: "Imprint", f_tk: "Shop by Tim Kofler – Webdesign",
    cart_h: "Your basket", vc_l: "Gift card or discount code", vc_p: "Discount code", vc_btn: "Apply", vc_try: "Try:", to_co: "Checkout",
    add: "Add to basket", fits: "Goes well with", co_h: "Checkout", st1: "Address", st2: "Shipping", st3: "Payment", st4: "Review",
    st1_h: "Where should we send it?", fill: "Fill in sample data", f_first: "First name", f_last: "Last name", f_mail: "E-mail", f_street: "Street and number", f_zip: "Postcode", f_city: "Town", f_land: "Country",
    f_acc: "Create an account so I can manage orders, downloads and subscriptions", st2_h: "How should it get to you?", slot_h: "When will you pick it up?",
    st3_h: "How would you like to pay?", cc_n: "Card number", cc_e: "Expiry", cc_demo: "Test card. In a real shop the payment provider’s secure field opens here, the farm never sees card details.",
    st4_h: "All correct?", agb_a: "I have read the", agb_b: "and the", wr_l: "cancellation policy", agb_c: ".",
    age: "I am at least 18 years old. Age is checked on delivery of fruit brandies.", dl_ok: "I want the downloads right away and know that my right of withdrawal ends with the download.",
    back: "Back", next: "Next", your_order: "Your order", ok_h: "Thank you for your order!", ok_nr: "Order number",
    ok_demo: "This is a sample shop: nothing was paid, nothing shipped and no e-mail sent.", ok_acct: "View in my account", ok_more: "Keep shopping",
    login_h: "Sign in", login_p: "Track orders, get invoices and downloads, manage your subscription.", pw: "Password", login_btn: "Sign in", login_demo: "Sample login is already filled in.",
    acc_kick: "Customer account", hello: "Hello", logout: "Sign out", tab_b: "Orders", tab_d: "Downloads", tab_a: "Subscription", tab_r: "Address", edit: "Edit", news: "Newsletter: once a month, what’s fresh at the farm"
  };
  var DE = {};
  function T(k) { return lang === "en" && EN[k] != null ? EN[k] : (DE[k] != null ? DE[k] : (S.de[k] != null ? S.de[k] : k)); }
  function L(o) { return o == null ? "" : (typeof o === "string" ? o : (o[lang] || o.de)); }
  // Texte, die das Skript selbst baut
  var S = {
    de: { all: "Alle", items: function (n) { return n === 1 ? "1 Produkt" : n + " Produkte"; }, add: "In den Korb", added: "liegt im Korb", out: "Ausverkauft", notify: "Benachrichtigen",
      notified: "Wir melden uns, sobald es wieder da ist.", only: function (n) { return "Nur noch " + n; }, instock: "Auf Lager, in 2–3 Tagen bei dir", low: function (n) { return "Nur noch " + n + " Stück auf Lager"; },
      dl: "Download sofort nach dem Kauf", age18: "ab 18", neu: "Neu", top: "Hof-Klassiker", digital: "Download", gift: "Gutschein", abo: "Abo",
      perL: function (p) { return "€ " + p + " / Liter"; }, perKg: function (p) { return "€ " + p + " / kg"; }, inkl: "inkl. MwSt.",
      emptyCart: "Dein Korb ist noch leer.", emptyCart2: "Stöbere im Hofladen oder hol dir ein Most-Kistl im Abo.", remove: "Entfernen",
      freeTo: function (a) { return "Noch <b>" + a + "</b> bis zum Gratisversand in Österreich"; }, freeOk: "<b>Gratisversand</b> in Österreich ist dabei", freeNone: "Nur Downloads oder Gutschein per E-Mail: <b>kein Versand nötig</b>",
      sub: "Zwischensumme", ship: "Versand", shipEst: "Versand (Post, Abholung gratis)", disc: "Rabatt", total: "Gesamt", tax: function (r, v) { return "davon " + r + " % MwSt. " + v; }, taxFree: "Gutscheine ohne MwSt.",
      vcOk: { HERBST10: "10 % Herbst-Rabatt eingelöst (gilt nicht für Gutscheine und Abo).", VERSANDFREI: "Gratisversand eingelöst.", WILLKOMMEN5: "€ 5 Willkommens-Rabatt eingelöst." },
      vcMin: "WILLKOMMEN5 gilt ab € 30 Warenwert.", vcBad: "Diesen Code kennen wir nicht. Probier HERBST10.", vcGift: "Geschenkgutschein-Guthaben: € 25 werden abgezogen.",
      shipM: { hof: ["Abholung im Hofladen", "Fr 14–18 · Sa 8–12 Uhr"], reg: ["Zustellung im Mostviertel", "Donnerstag mit unserem Bus, bis 25 km"], post: ["Post Österreich", "2–3 Werktage, mit Sendungsverfolgung"], de: ["Paket nach Deutschland", "4–6 Werktage"] },
      regNo: "Deine PLZ liegt außerhalb unseres Zustellgebiets.", deSpirit: "Edelbrände verschicken wir nur innerhalb Österreichs.", deOnly: "Nur für Lieferadressen in Deutschland.", atOnly: "Nur für Lieferadressen in Österreich.",
      noShip: "Kein Versand nötig: Downloads und Gutscheine per E-Mail kommen sofort.", slotTxt: ["Fr 14–16", "Fr 16–18", "Sa 8–10", "Sa 10–12"],
      payM: { card: ["Kredit- oder Debitkarte", "Visa, Mastercard"], wallet: ["Apple Pay oder Google Pay", "mit dem Handy bestätigen"], paypal: ["PayPal", "Weiterleitung zu PayPal"], eps: ["eps-Überweisung", "direkt aus dem Online-Banking"], inv: ["Kauf auf Rechnung", "zahlbar in 14 Tagen"], cash: ["Bar oder mit Karte bei Abholung", "nur bei Abholung im Hofladen"] },
      cashNo: "nur bei Abholung im Hofladen", order: "Zahlungspflichtig bestellen", needAgb: "Bitte bestätige die AGB und die Widerrufsbelehrung.", needAge: "Bitte bestätige, dass du mindestens 18 bist.", needDl: "Bitte bestätige den Hinweis zu den Downloads.",
      needAddr: "Bitte fülle die markierten Felder aus.", needMail: "Diese E-Mail-Adresse sieht nicht vollständig aus.", needSlot: "Bitte wähle einen Abholtermin.",
      rv: { addr: "Lieferung an", ship: "Versand", pay: "Zahlung", change: "Ändern" },
      okTxt: function (m, s) { return "Eine Bestätigung geht an " + m + ". " + s; }, okHof: function (d) { return "Abholtermin im Hofladen: " + d + "."; },
      okShip: "Wir packen heute noch und schicken dir die Sendungsnummer.", okDig: "Deine Downloads sind sofort bereit:", okNone: "",
      dlBtn: "Herunterladen", play: "Ansehen", dlNone: "Noch keine Downloads. Das Rezeptheft gibt es im Shop unter „Rezepte & Kurse“.",
      track: ["Bestellt", "Verpackt", "Unterwegs", "Zugestellt"], trackHof: ["Bestellt", "Gepackt", "Bereit", "Abgeholt"], again: "Erneut bestellen", invoice: "Rechnung (PDF)", againOk: "Liegt wieder im Korb.",
      subNone: "Noch kein Abo. Stell dir oben dein Most-Kistl zusammen.", subNext: function (d) { return "Nächste Lieferung " + d; }, subPaused: "Pausiert", subActive: "Aktiv",
      subPause: "Pausieren", subResume: "Fortsetzen", subSkip: "Nächste überspringen", subCancel: "Kündigen", subSkipped: "Die nächste Lieferung wird übersprungen.", subCancelled: "Abo gekündigt. Schade, du kannst jederzeit wieder starten.",
      every: { 1: "jeden Monat", 2: "alle 2 Monate", 3: "alle 3 Monate" }, aboName: "Most-Kistl im Abo", aboSave: function (o) { return "statt € " + o + " einzeln"; }, aboFirst: function (d) { return "Erste Lieferung " + d; },
      mix: { most: "6 × Most", misch: "4 × Most, 2 × Saft", saft: "6 × Saft" }, giftName: "Geschenkgutschein", giftPdf: "PDF per E-Mail", giftPost: "Gedruckt per Post", forTo: "Für",
      kpi: ["Bestellungen heute", "Umsatz diese Woche", "Zu verpacken", "Lager knapp"], kpiS: ["+2 seit gestern", "inkl. Hofladen-Kassa", "bis Donnerstag", "nachbestellen"],
      stock: "Stück", stockOut: "ausverkauft", stockLow: "knapp", stockDig: "digital, unbegrenzt", price: "Preis", st: { neu: "Neu", pack: "Verpacken", go: "Unterwegs", done: "Erledigt" }, stTip: "Status weiterschalten",
      csvOk: "CSV-Datei mit allen Bestellungen geladen.", saved: "Gespeichert, der Shop zeigt den neuen Wert.", loggedIn: "Angemeldet als Anna Muster.", loggedOut: "Abgemeldet.",
      t_addr: "Im echten Shop änderst du hier deine Adresse.", vidToast: "Im echten Shop startet hier der Video-Kurs.", pdfOk: "PDF wurde erstellt.",
      legal: {
        agb: ["AGB (Muster)", "<p><b>Beispieltext.</b> Im echten Shop stehen hier die Allgemeinen Geschäftsbedingungen des Hofs: Vertragspartner, Preise inkl. MwSt., Lieferung, Zahlung, Eigentumsvorbehalt, Gewährleistung und Streitbeilegung.</p><p>Den Text stimmt der Betrieb mit seiner Rechtsberatung oder der Wirtschaftskammer ab. Wir bauen ihn sauber ein und verlinken ihn an allen Stellen, an denen das Gesetz es verlangt.</p>"],
        wr: ["Widerrufsbelehrung (Muster)", "<p><b>Beispieltext.</b> Verbraucher können Bestellungen innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen. Ausgenommen sind schnell verderbliche Waren und versiegelte Getränke nach dem Öffnen.</p><p>Bei Downloads erlischt das Widerrufsrecht, wenn der Kunde zustimmt, dass der Download sofort beginnt. Deshalb fragt die Kasse das extra ab.</p>"],
        imp: ["Impressum (Muster)", "<p><b>Birnkammer</b> · Familie Eder · Hofweg 7 · 3251 Musterdorf · Österreich</p><p>Erfundener Betrieb für ein Beispiel von tim-kofler.at. Im echten Shop stehen hier Firmenwortlaut, UID-Nummer, Kammer, Aufsichtsbehörde und Kontakt.</p>"] }
    },
    en: { all: "All", items: function (n) { return n === 1 ? "1 product" : n + " products"; }, add: "Add to basket", added: "is in your basket", out: "Sold out", notify: "Notify me",
      notified: "We’ll let you know as soon as it’s back.", only: function (n) { return "Only " + n + " left"; }, instock: "In stock, with you in 2–3 days", low: function (n) { return "Only " + n + " left in stock"; },
      dl: "Download right after purchase", age18: "18+", neu: "New", top: "Farm classic", digital: "Download", gift: "Gift card", abo: "Subscription",
      perL: function (p) { return "€ " + p + " / litre"; }, perKg: function (p) { return "€ " + p + " / kg"; }, inkl: "incl. VAT",
      emptyCart: "Your basket is empty.", emptyCart2: "Browse the farm shop or get a perry box subscription.", remove: "Remove",
      freeTo: function (a) { return "<b>" + a + "</b> more for free shipping in Austria"; }, freeOk: "<b>Free shipping</b> in Austria included", freeNone: "Only downloads or e-mail gift cards: <b>no shipping needed</b>",
      sub: "Subtotal", ship: "Shipping", shipEst: "Shipping (post, pick-up free)", disc: "Discount", total: "Total", tax: function (r, v) { return "incl. " + r + " % VAT " + v; }, taxFree: "Gift cards without VAT",
      vcOk: { HERBST10: "10 % autumn discount applied (not on gift cards and subscriptions).", VERSANDFREI: "Free shipping applied.", WILLKOMMEN5: "€ 5 welcome discount applied." },
      vcMin: "WILLKOMMEN5 applies from € 30 of goods.", vcBad: "We don’t know this code. Try HERBST10.", vcGift: "",
      shipM: { hof: ["Pick-up at the farm shop", "Fri 2–6 pm · Sat 8 am–12 pm"], reg: ["Delivery in the Mostviertel", "Thursday with our van, up to 25 km"], post: ["Austrian Post", "2–3 working days, with tracking"], de: ["Parcel to Germany", "4–6 working days"] },
      regNo: "Your postcode is outside our delivery area.", deSpirit: "Fruit brandies only ship within Austria.", deOnly: "Only for delivery addresses in Germany.", atOnly: "Only for delivery addresses in Austria.",
      noShip: "No shipping needed: downloads and e-mail gift cards arrive instantly.", slotTxt: ["Fri 2–4 pm", "Fri 4–6 pm", "Sat 8–10 am", "Sat 10–12 am"],
      payM: { card: ["Credit or debit card", "Visa, Mastercard"], wallet: ["Apple Pay or Google Pay", "confirm on your phone"], paypal: ["PayPal", "redirect to PayPal"], eps: ["eps bank transfer", "straight from online banking"], inv: ["Pay by invoice", "due in 14 days"], cash: ["Cash or card on pick-up", "only for pick-up at the farm shop"] },
      cashNo: "only for pick-up at the farm shop", order: "Place order and pay", needAgb: "Please accept the terms and the cancellation policy.", needAge: "Please confirm that you are at least 18.", needDl: "Please confirm the note about downloads.",
      needAddr: "Please fill in the marked fields.", needMail: "This e-mail address looks incomplete.", needSlot: "Please choose a pick-up time.",
      rv: { addr: "Deliver to", ship: "Shipping", pay: "Payment", change: "Change" },
      okTxt: function (m, s) { return "A confirmation goes to " + m + ". " + s; }, okHof: function (d) { return "Pick-up at the farm shop: " + d + "."; },
      okShip: "We’ll pack it today and send you the tracking number.", okDig: "Your downloads are ready right away:", okNone: "",
      dlBtn: "Download", play: "Watch", dlNone: "No downloads yet. The recipe booklet is in the shop under “Recipes & courses”.",
      track: ["Ordered", "Packed", "On the way", "Delivered"], trackHof: ["Ordered", "Packed", "Ready", "Picked up"], again: "Order again", invoice: "Invoice (PDF)", againOk: "Back in your basket.",
      subNone: "No subscription yet. Put together your perry box above.", subNext: function (d) { return "Next delivery " + d; }, subPaused: "Paused", subActive: "Active",
      subPause: "Pause", subResume: "Resume", subSkip: "Skip next", subCancel: "Cancel", subSkipped: "The next delivery will be skipped.", subCancelled: "Subscription cancelled. You can restart any time.",
      every: { 1: "every month", 2: "every 2 months", 3: "every 3 months" }, aboName: "Perry box subscription", aboSave: function (o) { return "instead of € " + o + " single"; }, aboFirst: function (d) { return "First delivery " + d; },
      mix: { most: "6 × perry", misch: "4 × perry, 2 × juice", saft: "6 × juice" }, giftName: "Gift card", giftPdf: "PDF by e-mail", giftPost: "Printed by post", forTo: "For",
      kpi: ["Orders today", "Revenue this week", "To pack", "Low stock"], kpiS: ["+2 since yesterday", "incl. farm shop till", "by Thursday", "reorder"],
      stock: "pcs", stockOut: "sold out", stockLow: "low", stockDig: "digital, unlimited", price: "Price", st: { neu: "New", pack: "Pack", go: "On the way", done: "Done" }, stTip: "Next status",
      csvOk: "CSV file with all orders downloaded.", saved: "Saved, the shop shows the new value.", loggedIn: "Signed in as Anna Muster.", loggedOut: "Signed out.",
      t_addr: "In a real shop you change your address here.", vidToast: "In a real shop the video course starts here.", pdfOk: "PDF created.",
      legal: {
        agb: ["Terms (sample)", "<p><b>Sample text.</b> A real shop shows the farm’s terms and conditions here: contracting party, prices incl. VAT, delivery, payment, retention of title, warranty and dispute resolution.</p>"],
        wr: ["Cancellation policy (sample)", "<p><b>Sample text.</b> Consumers can cancel orders within 14 days without giving reasons. Perishable goods and opened sealed drinks are excluded.</p><p>For downloads the right of withdrawal ends once the customer agrees that the download starts immediately, which is why the checkout asks separately.</p>"],
        imp: ["Imprint (sample)", "<p><b>Birnkammer</b> · Eder family · Hofweg 7 · 3251 Musterdorf · Austria</p><p>Fictional business for a sample by tim-kofler.at.</p>"] }
    }
  };
  function X(k) { var v = S[lang][k]; return v != null ? v : S.de[k]; }
  var fmtN = function (n) { return n.toLocaleString(lang === "en" ? "en-GB" : "de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var fmt = function (n) { return "€\u00a0" + fmtN(n); };
  var dateL = function (d, o) { return d.toLocaleDateString(lang === "en" ? "en-GB" : "de-AT", o || { weekday: "short", day: "numeric", month: "long" }); };

  /* ---------- Selbst gezeichnete Produktbilder ---------- */
  var uid = 0;
  var SERIF = "Fraunces, Georgia, serif", SANS = "Outfit, system-ui, sans-serif";
  function bottlePath(o) {
    var c = 100, bw = o.bw, nw = o.nw, ys = o.ys, yn = o.yn, yt = o.yt, yb = 224, h = ys - yn;
    return "M" + (c - nw) + " " + yt + "L" + (c - nw) + " " + yn + "C" + (c - nw) + " " + (yn + h * .55) + " " + (c - bw) + " " + (ys - h * .35) + " " + (c - bw) + " " + ys +
      "L" + (c - bw) + " " + (yb - 12) + "Q" + (c - bw) + " " + yb + " " + (c - bw + 12) + " " + yb + "L" + (c + bw - 12) + " " + yb + "Q" + (c + bw) + " " + yb + " " + (c + bw) + " " + (yb - 12) +
      "L" + (c + bw) + " " + ys + "C" + (c + bw) + " " + (ys - h * .35) + " " + (c + nw) + " " + (yn + h * .55) + " " + (c + nw) + " " + yn + "L" + (c + nw) + " " + yt + "Z";
  }
  function label(o, x, y, w, h) {
    var l = o.label, k = 5, c = x + w / 2;
    var d = "M" + x + " " + (y + k) + "Q" + c + " " + (y + k * 2.4) + " " + (x + w) + " " + (y + k) + "L" + (x + w) + " " + (y + h) + "Q" + c + " " + (y + h + k * 1.4) + " " + x + " " + (y + h) + "Z";
    if (l.shape === "oval") d = "M" + x + " " + (y + h / 2) + "A" + (w / 2) + " " + (h / 2) + " 0 1 0 " + (x + w) + " " + (y + h / 2) + "A" + (w / 2) + " " + (h / 2) + " 0 1 0 " + x + " " + (y + h / 2) + "Z";
    var s = '<path d="' + d + '" fill="' + l.c + '"/>';
    if (l.band) s += '<path d="M' + x + " " + (y + h - 9) + "Q" + c + " " + (y + h - 9 + k * 1.4) + " " + (x + w) + " " + (y + h - 9) + "L" + (x + w) + " " + (y + h) + "Q" + c + " " + (y + h + k * 1.4) + " " + x + " " + (y + h) + 'Z" fill="' + l.band + '"/>';
    s += '<path d="M0 0c2.6 0 3 3.4 3.5 5 3.3 2.4 3.7 8.6-3.5 8.6s-6.8-6.2-3.5-8.6c.5-1.6.9-5 3.5-5z" fill="' + l.ink + '" opacity=".9" transform="translate(' + c + " " + (y + (l.shape === "oval" ? 9 : 6)) + ') scale(.72)"/>';
    var fs = l.fs || Math.min(15, w * .92 / (Math.max(5, l.t.length) * .56));
    s += '<text x="' + c + '" y="' + (y + h * (l.sub ? .64 : .7)) + '" text-anchor="middle" font-family="' + SERIF + '" font-weight="600" font-size="' + fs.toFixed(1) + '" fill="' + l.ink + '" letter-spacing=".4">' + esc(l.t) + "</text>";
    if (l.sub) s += '<text x="' + c + '" y="' + (y + h * .84) + '" text-anchor="middle" font-family="' + SANS + '" font-weight="500" font-size="' + (l.sfs || Math.min(7.5, (w * (l.shape === "oval" ? .68 : .9) / l.sub.length - 1.2) / .62)).toFixed(1) + '" fill="' + l.ink + '" opacity=".75" letter-spacing="1.2">' + esc(l.sub) + "</text>";
    return s;
  }
  function bottle(o) {
    var id = "b" + (++uid), p = bottlePath(o), bw = o.bw, yb = 224;
    var s = '<ellipse cx="100" cy="226" rx="' + (bw + 12) + '" ry="7" fill="url(#shShadow)"/>';
    s += '<clipPath id="' + id + '"><path d="' + p + '"/></clipPath>';
    s += '<path d="' + p + '" fill="' + o.glass + '"/>';
    s += '<path class="glt" d="' + p + '"/>';
    s += '<g clip-path="url(#' + id + ')">';
    if (o.liquid) s += '<rect x="0" y="' + o.level + '" width="200" height="240" fill="' + o.liquid + '"/><rect x="0" y="' + o.level + '" width="200" height="3" fill="#fff" opacity=".28"/>';
    if (o.bubbles) for (var i = 0; i < 9; i++) s += '<circle cx="' + (100 - bw * .6 + (i * 37 % (bw * 1.2))) + '" cy="' + (o.level + 18 + (i * 53 % (yb - o.level - 30))) + '" r="' + (1 + i % 3 * .6) + '" fill="#fff" opacity=".45"/>';
    s += '<rect x="0" y="0" width="200" height="240" fill="url(#shSide)" opacity=".9" transform="translate(' + (100 - bw) + ' 0) scale(' + (bw * 2 / 200) + ' 1)"/>';
    s += '<rect x="' + (100 - bw * .66) + '" y="' + (o.ys + 6) + '" width="' + (bw * .26) + '" height="' + (yb - o.ys - 22) + '" rx="' + (bw * .13) + '" fill="url(#shHl)" opacity=".55"/>';
    s += '<rect x="' + (100 + bw * .5) + '" y="' + (o.ys + 14) + '" width="' + (bw * .09) + '" height="' + (yb - o.ys - 40) + '" rx="2" fill="#fff" opacity=".18"/>';
    s += '<rect x="' + (100 - o.nw * .55) + '" y="' + (o.yt + 6) + '" width="' + (o.nw * .32) + '" height="' + (o.yn - o.yt + 8) + '" rx="2" fill="#fff" opacity=".35"/>';
    s += "</g>";
    s += '<path class="ol" d="' + p + '" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.3"/>';
    if (o.label) s += label(o, 100 - bw + 4, o.ly, bw * 2 - 8, o.lh);
    // Verschlüsse
    var nw = o.nw, yt = o.yt;
    if (o.cap === "buegel") {
      s += '<path d="M' + (100 - nw - 1) + " " + (yt + 26) + "L" + (100 - nw - 6) + " " + (yt + 4) + "M" + (100 + nw + 1) + " " + (yt + 26) + "L" + (100 + nw + 6) + " " + (yt + 4) + '" stroke="#cfd3d6" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<rect x="' + (100 - nw - 2) + '" y="' + (yt + 24) + '" width="' + (nw * 2 + 4) + '" height="5" rx="2.5" fill="#b9bfc3"/>';
      s += '<rect x="' + (100 - nw + 1) + '" y="' + (yt - 4) + '" width="' + (nw * 2 - 2) + '" height="4" rx="1" fill="#c7354f"/>';
      s += '<path d="M' + (100 - nw) + " " + (yt - 4) + "Q" + (100 - nw) + " " + (yt - 16) + " 100 " + (yt - 17) + "Q" + (100 + nw) + " " + (yt - 16) + " " + (100 + nw) + " " + (yt - 4) + 'Z" fill="#f4f1ec"/>';
      s += '<path d="M' + (100 - nw + 3) + " " + (yt - 8) + "Q100 " + (yt - 15) + " " + (100 + nw - 6) + " " + (yt - 10) + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".9"/>';
      s += '<path d="M' + (100 - nw - 6) + " " + (yt + 4) + "Q100 " + (yt - 22) + " " + (100 + nw + 6) + " " + (yt + 4) + '" stroke="#cfd3d6" stroke-width="2" fill="none"/>';
    } else if (o.cap === "schraub") {
      s += '<rect x="' + (100 - nw - 1.5) + '" y="' + (yt - 10) + '" width="' + (nw * 2 + 3) + '" height="16" rx="2.5" fill="' + (o.capC || "#c9a24a") + '"/>';
      for (var j = 1; j < 8; j++) s += '<rect x="' + (100 - nw - 1.5 + j * (nw * 2 + 3) / 8) + '" y="' + (yt - 8) + '" width=".9" height="12" fill="#000" opacity=".2"/>';
      s += '<rect x="' + (100 - nw) + '" y="' + (yt - 9) + '" width="' + (nw * .6) + '" height="14" rx="1.5" fill="#fff" opacity=".35"/>';
    } else if (o.cap === "kork") {
      s += '<rect x="' + (100 - nw + 1) + '" y="' + (yt - 14) + '" width="' + (nw * 2 - 2) + '" height="16" rx="2" fill="#c8a06c"/>';
      s += '<rect x="' + (100 - nw - 4) + '" y="' + (yt - 20) + '" width="' + (nw * 2 + 8) + '" height="9" rx="3" fill="' + (o.capC || "#5a2a1a") + '"/>';
      s += '<rect x="' + (100 - nw - 4) + '" y="' + (yt - 20) + '" width="' + (nw * 2 + 8) + '" height="3" rx="1.5" fill="#fff" opacity=".25"/>';
      s += '<path d="M' + (100 - nw) + " " + (yt + 2) + "L" + (100 + nw) + " " + (yt + 2) + "L" + (100 + nw) + " " + (yt + 18) + "L" + (100 - nw) + " " + (yt + 18) + 'Z" fill="' + (o.capC || "#5a2a1a") + '" opacity=".92"/>';
    } else if (o.cap === "sekt") {
      s += '<path d="M' + (100 - nw - 1.5) + " " + (yt - 8) + "Q100 " + (yt - 14) + " " + (100 + nw + 1.5) + " " + (yt - 8) + "L" + (100 + nw + 2.5) + " " + (o.yn + 10) + "Q100 " + (o.yn + 15) + " " + (100 - nw - 2.5) + " " + (o.yn + 10) + 'Z" fill="' + (o.capC || "#d9a640") + '"/>';
      s += '<path d="M' + (100 - nw + 2) + " " + (yt - 5) + "L" + (100 - nw + 3) + " " + (o.yn + 8) + '" stroke="#fff" stroke-width="2.4" opacity=".45"/>';
      s += '<rect x="' + (100 - nw - 2.5) + '" y="' + (o.yn - 4) + '" width="' + (nw * 2 + 5) + '" height="6" fill="#000" opacity=".15"/>';
    }
    return s;
  }
  function jar(o) {
    var id = "j" + (++uid), x = 52, w = 96, yt = o.yt || 98, yb = 224;
    var p = "M" + (x + 8) + " " + yt + "Q" + x + " " + yt + " " + x + " " + (yt + 12) + "L" + x + " " + (yb - 16) + "Q" + x + " " + yb + " " + (x + 16) + " " + yb + "L" + (x + w - 16) + " " + yb + "Q" + (x + w) + " " + yb + " " + (x + w) + " " + (yb - 16) + "L" + (x + w) + " " + (yt + 12) + "Q" + (x + w) + " " + yt + " " + (x + w - 8) + " " + yt + "Z";
    var s = '<ellipse cx="100" cy="226" rx="62" ry="7" fill="url(#shShadow)"/><clipPath id="' + id + '"><path d="' + p + '"/></clipPath>';
    s += '<path d="' + p + '" fill="' + o.fill + '"/><g clip-path="url(#' + id + ')">';
    if (o.honey) s += '<ellipse cx="84" cy="176" rx="30" ry="40" fill="#fff3b0" opacity=".14"/>';
    if (o.seeds) for (var i = 0; i < 26; i++) s += '<circle cx="' + (x + 6 + (i * 41 % 86)) + '" cy="' + (yt + 10 + (i * 67 % 116)) + '" r="1.4" fill="' + o.seeds + '" opacity=".55"/>';
    s += '<rect x="' + x + '" y="0" width="' + w + '" height="240" fill="url(#shSide)"/>';
    s += '<rect x="' + (x + 12) + '" y="' + (yt + 10) + '" width="12" height="' + (yb - yt - 28) + '" rx="6" fill="url(#shHl)" opacity=".6"/></g>';
    s += '<path class="ol" d="' + p + '" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.3"/>';
    s += '<rect x="58" y="' + (yt - 22) + '" width="84" height="26" rx="5" fill="' + o.lid + '"/>';
    for (var j = 1; j < 12; j++) s += '<rect x="' + (58 + j * 7) + '" y="' + (yt - 20) + '" width="1" height="22" fill="#000" opacity=".14"/>';
    s += '<rect x="60" y="' + (yt - 21) + '" width="80" height="5" rx="2.5" fill="#fff" opacity=".28"/>';
    if (o.cloth) {
      s += '<path d="M48 ' + (yt - 4) + "Q50 " + (yt - 30) + " 100 " + (yt - 32) + "Q150 " + (yt - 30) + " 152 " + (yt - 4) + "L156 " + (yt + 6) + "Q142 " + (yt + 14) + " 130 " + (yt + 5) + "Q116 " + (yt + 15) + " 100 " + (yt + 7) + "Q84 " + (yt + 15) + " 70 " + (yt + 5) + "Q58 " + (yt + 14) + " 44 " + (yt + 6) + 'Z" fill="url(#shKaro)"/>';
      s += '<path d="M48 ' + (yt - 4) + "Q50 " + (yt - 30) + " 100 " + (yt - 32) + "Q150 " + (yt - 30) + " 152 " + (yt - 4) + 'Z" fill="url(#shTop)"/>';
      s += '<path d="M53 ' + (yt - 2) + "Q100 " + (yt + 4) + " 147 " + (yt - 2) + '" stroke="#b98a4e" stroke-width="2.4" fill="none"/><path d="M100 ' + (yt + 1) + "q-8 6-14 2M100 " + (yt + 1) + 'q6 8 12 4" stroke="#b98a4e" stroke-width="2" fill="none"/>';
    }
    if (o.label) s += label(o, 62, o.ly || 140, 76, o.lh || 54);
    if (o.dipper) s += '<g transform="rotate(24 150 120)"><rect x="146" y="38" width="7" height="96" rx="3.5" fill="#c89257"/><g fill="#d9a466"><rect x="140" y="118" width="19" height="7" rx="3.5"/><rect x="141" y="128" width="17" height="7" rx="3.5"/><rect x="142" y="138" width="15" height="7" rx="3.5"/></g><path d="M143 146q6 14 4 26" stroke="#f2b23a" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/></g>';
    return s;
  }
  function bag(o) {
    var s = '<ellipse cx="100" cy="226" rx="58" ry="7" fill="url(#shShadow)"/>';
    s += '<path d="M56 62L144 62L152 220Q100 230 48 220Z" fill="url(#shKraft)"/>';
    s += '<path d="M56 62L144 62L145 76L55 76Z" fill="#000" opacity=".1"/><path d="M56 62' + "l4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5" + '" fill="none" stroke="#9c7442" stroke-width="1.2"/>';
    s += '<rect x="68" y="104" width="64" height="66" rx="14" fill="#fff8ec" opacity=".85"/>';
    var it = o.chips ? [[84, 122, 13], [108, 120, 12], [96, 142, 14], [118, 146, 11], [80, 152, 10]] : [[86, 124, 11], [110, 122, 10], [97, 144, 12], [120, 148, 9], [80, 154, 9]];
    s += '<clipPath id="w' + (++uid) + '"><rect x="68" y="104" width="64" height="66" rx="14"/></clipPath><g clip-path="url(#w' + uid + ')">';
    it.forEach(function (c) {
      if (o.chips) s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#f8e3a8" stroke="#d14a45" stroke-width="2"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (c[2] * .25) + '" fill="#e9c680"/>';
      else s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + (c[2] * .8) + '" ry="' + c[2] + '" fill="#6e3d1e" transform="rotate(' + (c[0] % 40 - 20) + " " + c[0] + " " + c[1] + ')"/><path d="M' + (c[0] - 3) + " " + (c[1] - 4) + "q3 3 0 8" + '" stroke="#4a2410" stroke-width="1.2" fill="none"/>';
    });
    s += '</g><rect x="68" y="104" width="64" height="66" rx="14" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>';
    s += '<rect x="64" y="180" width="72" height="26" rx="6" fill="' + o.lc + '"/><text x="100" y="197.5" text-anchor="middle" font-family="' + SERIF + '" font-weight="600" font-size="12" fill="#fff8ec">' + esc(o.t) + "</text>";
    s += '<rect x="58" y="80" width="10" height="132" rx="5" fill="#fff" opacity=".16"/>';
    return s;
  }
  function mini(o, tx, sc) { return '<g transform="translate(' + tx + ') scale(' + sc + ')">' + bottle(o) + "</g>"; }
  var B = {
    most: function (lc, t, liq) { return { bw: 34, nw: 11, ys: 104, yn: 62, yt: 40, glass: "rgba(250,236,200,.22)", liquid: liq || "rgba(222,156,46,.88)", level: 96, cap: "buegel", ly: 136, lh: 54, label: { c: lc, ink: "#2a1606", t: t, sub: "MOST · 1 L", band: "rgba(0,0,0,.1)" } }; },
    saft: function (lc, t, liq, sub) { return { bw: 33, nw: 12, ys: 98, yn: 66, yt: 50, glass: "rgba(250,240,220,.2)", liquid: liq, level: 84, cap: "schraub", capC: "#d7b45a", ly: 132, lh: 58, label: { c: lc, ink: "#2a1606", t: t, sub: sub || "SAFT · 1 L" } }; },
    brand: function (t, cap, liq, sub) { return { bw: 26, nw: 7, ys: 132, yn: 66, yt: 44, glass: "rgba(240,246,250,.2)", liquid: liq || "rgba(255,248,226,.32)", level: 92, cap: "kork", capC: cap, ly: 158, lh: 46, label: { c: "#f6efe2", ink: "#2a1606", t: t, sub: sub || "EDELBRAND", band: cap } }; }
  };
  var ART = {
    "most-speck": function () { return bottle(B.most("#f2c56a", "Speckbirne")); },
    "most-apfel": function () { return bottle(B.most("#e9a1a8", "Apfel-Birne", "rgba(214,138,40,.86)")); },
    frizzante: function () { return bottle({ bw: 32, nw: 11, ys: 118, yn: 66, yt: 34, glass: "rgba(240,236,200,.24)", liquid: "rgba(238,206,110,.78)", level: 104, bubbles: true, cap: "sekt", capC: "#2b2b3a", ly: 146, lh: 50, label: { c: "#2b2b3a", ink: "#f2c56a", t: "Frizzante", sub: "BIRNE · 0,75 L" } }); },
    "saft-apfel": function () { return bottle(B.saft("#f6e7c4", "Apfel", "rgba(236,186,92,.95)", "NATURTRÜB · 1 L")); },
    "saft-holler": function () { return bottle(B.saft("#d9c6e8", "Holler", "rgba(124,48,86,.9)", "APFEL-HOLLER · 1 L")); },
    "saft-birne": function () { return bottle(B.saft("#f3df9e", "Birne", "rgba(226,206,128,.92)")); },
    sirup: function () { return bottle({ bw: 24, nw: 9, ys: 120, yn: 76, yt: 56, glass: "rgba(250,244,226,.22)", liquid: "rgba(246,226,160,.82)", level: 96, cap: "schraub", capC: "#d7b45a", ly: 150, lh: 52, label: { c: "#fff8ec", ink: "#6a3b08", t: "Sirup", sub: "HOLLERBLÜTE · 0,5 L" } }); },
    "brand-williams": function () { return bottle(B.brand("Williams", "#c7354f")); },
    "brand-fass": function () { return bottle(B.brand("Holzfass", "#3a2216", "rgba(196,120,44,.85)", "MOSTBIRNE")); },
    "honig-bluete": function () { return jar({ fill: "rgba(240,168,36,.92)", lid: "#c89a3c", honey: 1, dipper: 1, ly: 138, label: { c: "#fff6e3", ink: "#7a4a08", t: "Blüte", sub: "HONIG · 500 G", shape: "oval" } }); },
    "honig-wald": function () { return jar({ fill: "rgba(150,82,22,.94)", lid: "#8c5a26", honey: 1, ly: 138, label: { c: "#f8ecd6", ink: "#4a2a08", t: "Wald", sub: "HONIG · 500 G", shape: "oval" } }); },
    "aufstrich-ingwer": function () { return jar({ yt: 112, fill: "rgba(232,170,64,.95)", lid: "#c7354f", cloth: 1, seeds: "#9a5b10", ly: 150, lh: 50, label: { c: "#fff8ec", ink: "#6a3b08", t: "Birne-Ingwer", fs: 10.5, sub: "AUFSTRICH" } }); },
    "aufstrich-roester": function () { return jar({ yt: 112, fill: "rgba(92,28,58,.96)", lid: "#3a2b5a", cloth: 1, seeds: "#d58cae", ly: 150, lh: 50, label: { c: "#fff8ec", ink: "#4a1230", t: "Röster", sub: "ZWETSCHKE" } }); },
    essig: function () { return bottle({ bw: 22, nw: 8, ys: 116, yn: 70, yt: 46, glass: "rgba(240,236,200,.22)", liquid: "rgba(214,160,70,.75)", level: 90, cap: "kork", capC: "#2b2b3a", ly: 146, lh: 54, label: { c: "#2b2b3a", ink: "#f2c56a", t: "Essig", sub: "MOST · 0,5 L" } }); },
    kletzen: function () { return bag({ lc: "#6e3d1e", t: "Kletzen" }); },
    chips: function () { return bag({ chips: 1, lc: "#c7354f", t: "Apfelchips" }); },
    kistl: function () {
      var s = '<ellipse cx="100" cy="226" rx="76" ry="8" fill="url(#shShadow)"/>';
      s += mini(B.most("#f2c56a", "Speckbirne"), "18 -6", .62) + mini(B.brand("Williams", "#c7354f"), "68 -12", .62) + mini(B.saft("#d9c6e8", "Holler", "rgba(124,48,86,.9)"), "118 -4", .62);
      s += '<rect x="28" y="140" width="144" height="18" fill="url(#shWolle)"/><path d="M26 144h148l-6 80H32z" fill="url(#shWood)"/>';
      s += '<path d="M28 172h144M30 198h140" stroke="#8a5428" stroke-width="2" opacity=".55"/><rect x="26" y="140" width="148" height="10" rx="2" fill="#e8b878"/>';
      s += '<path d="M40 150v70M160 150v70" stroke="#8a5428" stroke-width="1.6" opacity=".4"/>';
      s += '<g transform="rotate(-6 100 186)"><rect x="70" y="170" width="60" height="30" rx="5" fill="#fff8ec"/><text x="100" y="190" text-anchor="middle" font-family="' + SERIF + '" font-weight="600" font-size="11" fill="#7a3a12">Birnkammer</text></g>';
      return s;
    },
    gutschein: function () {
      var s = '<ellipse cx="100" cy="222" rx="74" ry="7" fill="url(#shShadow)"/><g transform="rotate(-8 100 140)">';
      s += '<rect x="28" y="84" width="144" height="100" rx="14" fill="#f2b54a"/><rect x="28" y="84" width="144" height="100" rx="14" fill="url(#shTop)"/>';
      s += '<rect x="112" y="84" width="16" height="100" fill="#c7354f"/><rect x="28" y="124" width="144" height="14" fill="#c7354f"/>';
      s += '<path d="M120 130c-10-22-34-22-30-8 3 10 20 9 30 8zM120 130c10-22 34-22 30-8-3 10-20 9-30 8z" fill="#e05570"/><circle cx="120" cy="130" r="6" fill="#a8334f"/>';
      s += '<text x="40" y="112" font-family="' + SERIF + '" font-weight="600" font-size="18" fill="#2a1606">€ 50</text><text x="40" y="172" font-family="' + SANS + '" font-weight="600" font-size="8" fill="#2a1606" letter-spacing="1.4">GUTSCHEIN</text></g>';
      return s;
    },
    rezeptheft: function () {
      var s = '<ellipse cx="100" cy="224" rx="66" ry="7" fill="url(#shShadow)"/><g transform="rotate(-5 100 140)">';
      s += '<rect x="48" y="58" width="108" height="156" rx="6" fill="#e6dccb"/><rect x="44" y="54" width="108" height="156" rx="6" fill="#2b2b3a"/>';
      s += '<rect x="44" y="54" width="10" height="156" fill="#000" opacity=".25"/><circle cx="104" cy="114" r="30" fill="#f2b54a"/>';
      s += '<path d="M104 92c3 0 3.4 4.4 4 6.6 4 3 4.4 11-4 11s-8-8-4-11c.6-2.2 1-6.6 4-6.6z" transform="translate(0 6) scale(1 1.15)" transform-origin="104 110" fill="#2a1606"/>';
      s += '<text x="104" y="166" text-anchor="middle" font-family="' + SERIF + '" font-weight="600" font-size="15" fill="#f6efe2">Rezepte</text><text x="104" y="182" text-anchor="middle" font-family="' + SANS + '" font-size="7.5" fill="#f2c56a" letter-spacing="1.4">VOM MOSTHOF</text>';
      s += '<rect x="118" y="46" width="44" height="22" rx="11" fill="#c7354f"/><text x="140" y="61" text-anchor="middle" font-family="' + SANS + '" font-weight="700" font-size="10" fill="#fff">PDF</text></g>';
      return s;
    },
    kurs: function () {
      var s = '<ellipse cx="100" cy="222" rx="78" ry="7" fill="url(#shShadow)"/>';
      s += '<rect x="20" y="70" width="160" height="128" rx="14" fill="#1b1b24"/><rect x="28" y="78" width="144" height="112" rx="8" fill="#3a2a22"/>';
      s += '<clipPath id="k' + (++uid) + '"><rect x="28" y="78" width="144" height="112" rx="8"/></clipPath><g clip-path="url(#k' + uid + ')"><circle cx="66" cy="128" r="46" fill="#f2b54a" opacity=".28"/><g transform="translate(24 88) scale(.42)">' + bottle(B.most("#f2c56a", "Speckbirne")) + '</g><rect x="28" y="160" width="144" height="30" fill="#000" opacity=".25"/></g>';
      s += '<path d="M120 116c0-6 0-8 4-8 6 0 18 9 18 14s-12 14-18 14c-4 0-4-2-4-8z" fill="#fff" opacity=".95"/>';
      s += '<rect x="38" y="176" width="124" height="4" rx="2" fill="#fff" opacity=".25"/><rect x="38" y="176" width="52" height="4" rx="2" fill="#f2b54a"/><circle cx="90" cy="178" r="5" fill="#ffd98a"/>';
      return s;
    },
    abo: function () {
      var s = '<ellipse cx="100" cy="226" rx="74" ry="8" fill="url(#shShadow)"/>';
      s += mini(B.most("#f2c56a", "Speckbirne"), "22 -16", .6) + mini(B.most("#e9a1a8", "Apfel-Birne", "rgba(214,138,40,.86)"), "62 -22", .6) + mini(B.saft("#f6e7c4", "Apfel", "rgba(236,186,92,.95)"), "102 -14", .6);
      s += '<path d="M30 146l-14-22 46 8zM170 146l14-22-46 8z" fill="#c39762"/><path d="M28 146h144v74a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4z" fill="#d6aa72"/><path d="M28 146h144v12H28z" fill="#000" opacity=".08"/>';
      s += '<circle cx="100" cy="188" r="22" fill="#fff8ec"/><path d="M111 184a11 11 0 1 1-3.4-7.6M109 172v5.4h-5.4" fill="none" stroke="#c7354f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
      return s;
    }
  };
  function art(k, cls) { var f = ART[k]; return '<svg class="art' + (cls ? " " + cls : "") + '" viewBox="0 0 200 240" aria-hidden="true" focusable="false">' + (f ? f() : "") + "</svg>"; }

  /* ---------- Sortiment ---------- */
  var CATS = [
    { id: "all" }, { id: "most", n: { de: "Most & Frizzante", en: "Perry & sparkling" } }, { id: "saft", n: { de: "Säfte", en: "Juices" } },
    { id: "brand", n: { de: "Edelbrände", en: "Fruit brandies" } }, { id: "suess", n: { de: "Honig & Aufstriche", en: "Honey & spreads" } },
    { id: "fein", n: { de: "Feinkost", en: "Pantry" } }, { id: "geschenk", n: { de: "Geschenke", en: "Gifts" } }, { id: "digital", n: { de: "Rezepte & Kurse", en: "Recipes & courses" } }
  ];
  var P = [
    { id: "speck", cat: "most", art: "most-speck", c: "#f2b54a", vat: 20, stock: 46, pop: 10, badge: "top", unitL: [1, 6],
      n: { de: "Speckbirnen-Most", en: "Speckbirne perry" }, s: { de: "Sortenrein, halbtrocken, 6 % vol", en: "Single variety, off-dry, 6 % vol" },
      d: { de: "Aus der alten Mostviertler Speckbirne von unseren eigenen Streuobstwiesen. Langsam kalt vergoren, mild-fruchtig mit feiner Säure. Passt zur Jause und zum Schweinsbraten.", en: "From the old Mostviertel Speckbirne pear in our own orchards. Slowly cold-fermented, mild and fruity with a fine acidity. Great with a cold platter or roast pork." },
      v: [{ id: "1", n: { de: "1 l", en: "1 l" }, p: 4.9 }, { id: "6", n: { de: "6er-Kistl", en: "Box of 6" }, p: 26.9 }],
      f: { de: [["Alkohol", "6 % vol"], ["Herkunft", "eigene Streuobstwiese"], ["Allergene", "enthält Sulfite"]], en: [["Alcohol", "6 % vol"], ["Origin", "our own orchard"], ["Allergens", "contains sulphites"]] }, x: ["kletzen", "brand-williams", "chips"] },
    { id: "apfelbirn", cat: "most", art: "most-apfel", c: "#e2738a", vat: 20, stock: 31, pop: 8,
      n: { de: "Apfel-Birnen-Most", en: "Apple-pear cider" }, s: { de: "Der Jausen-Most, 5,5 % vol", en: "The everyday cider, 5.5 % vol" },
      d: { de: "Halb Apfel, halb Birne, so wie ihn der Großvater gemacht hat. Rund, frisch und nicht zu süß.", en: "Half apple, half pear, the way grandfather made it. Round, fresh and not too sweet." },
      v: [{ id: "1", n: { de: "1 l", en: "1 l" }, p: 4.5 }, { id: "6", n: { de: "6er-Kistl", en: "Box of 6" }, p: 24.9 }],
      f: { de: [["Alkohol", "5,5 % vol"], ["Allergene", "enthält Sulfite"]], en: [["Alcohol", "5.5 % vol"], ["Allergens", "contains sulphites"]] }, x: ["speck", "kletzen", "essig"] },
    { id: "frizzante", cat: "most", art: "frizzante", c: "#f2c56a", vat: 20, stock: 18, pop: 7, badge: "neu",
      n: { de: "Birnen-Frizzante", en: "Sparkling perry" }, s: { de: "Prickelnd, zum Anstoßen, 0,75 l", en: "Sparkling, for toasting, 0.75 l" },
      d: { de: "Unser Speckbirnen-Most mit feiner Perlage, in der Sektflasche. Für Geburtstage, Hochzeiten und Sonntage.", en: "Our Speckbirne perry with fine bubbles, in a sparkling-wine bottle. For birthdays, weddings and Sundays." },
      v: [{ id: "075", n: { de: "0,75 l", en: "0.75 l" }, p: 9.9 }], f: { de: [["Alkohol", "7 % vol"], ["Servieren", "6–8 °C"]], en: [["Alcohol", "7 % vol"], ["Serve at", "6–8 °C"]] }, x: ["speck", "honig-bluete", "gutschein"] },
    { id: "apfelsaft", cat: "saft", art: "saft-apfel", c: "#f2c56a", vat: 10, stock: 64, pop: 9, unitL: [1, 6],
      n: { de: "Apfelsaft naturtrüb", en: "Cloudy apple juice" }, s: { de: "100 % Apfel, ohne Zucker", en: "100 % apple, no added sugar" },
      d: { de: "Frisch gepresst aus Äpfeln der Streuobstwiese, kurz erhitzt und sofort abgefüllt. Nichts dazu, nichts weg.", en: "Freshly pressed from orchard apples, briefly heated and bottled straight away. Nothing added, nothing taken away." },
      v: [{ id: "1", n: { de: "1 l", en: "1 l" }, p: 2.9 }, { id: "6", n: { de: "6er-Kistl", en: "Box of 6" }, p: 15.9 }], f: { de: [["Zutaten", "100 % Apfel"], ["Haltbar", "ungeöffnet 18 Monate"]], en: [["Ingredients", "100 % apple"], ["Shelf life", "18 months unopened"]] }, x: ["holler", "chips", "honig-bluete"] },
    { id: "holler", cat: "saft", art: "saft-holler", c: "#b45a8a", vat: 10, stock: 22, pop: 6,
      n: { de: "Apfel-Hollersaft", en: "Apple-elderberry juice" }, s: { de: "Mit Holunderbeeren vom Hof", en: "With elderberries from the farm" },
      d: { de: "Apfelsaft mit dunklen Holunderbeeren, kräftig in der Farbe und mild im Geschmack.", en: "Apple juice with dark elderberries, rich in colour and mild in taste." },
      v: [{ id: "1", n: { de: "1 l", en: "1 l" }, p: 3.4 }], f: { de: [["Zutaten", "Apfel 85 %, Holunder 15 %"]], en: [["Ingredients", "apple 85 %, elderberry 15 %"]] }, x: ["apfelsaft", "roester", "chips"] },
    { id: "birnsaft", cat: "saft", art: "saft-birne", c: "#e8cf80", vat: 10, stock: 0, pop: 4,
      n: { de: "Birnensaft", en: "Pear juice" }, s: { de: "Süß und samtig, nur im Herbst", en: "Sweet and velvety, autumn only" },
      d: { de: "Aus reifen Mostbirnen. Gibt es nur, solange die Ernte reicht. Die neue Pressung kommt Mitte November.", en: "From ripe perry pears. Only while the harvest lasts. The new pressing arrives mid-November." },
      v: [{ id: "1", n: { de: "1 l", en: "1 l" }, p: 3.2 }], f: { de: [["Zutaten", "100 % Birne"]], en: [["Ingredients", "100 % pear"]] }, x: ["apfelsaft", "holler", "kletzen"] },
    { id: "sirup", cat: "saft", art: "sirup", c: "#f2d98a", vat: 10, stock: 17, pop: 6,
      n: { de: "Hollerblütensirup", en: "Elderflower syrup" }, s: { de: "Zum Aufspritzen, 0,5 l ergibt 5 l", en: "Mix with water, 0.5 l makes 5 l" },
      d: { de: "Im Juni gepflückt, mit Zitrone angesetzt und eingekocht. Mit Wasser oder Frizzante aufgespritzt der Sommer im Glas.", en: "Picked in June, steeped with lemon and boiled down. Topped up with water or sparkling perry, it’s summer in a glass." },
      v: [{ id: "05", n: { de: "0,5 l", en: "0.5 l" }, p: 5.9 }], f: { de: [["Mischung", "1 : 9 mit Wasser"], ["Zutaten", "Hollerblüten, Zucker, Zitrone"]], en: [["Mix", "1 : 9 with water"], ["Ingredients", "elderflowers, sugar, lemon"]] }, x: ["frizzante", "apfelsaft", "bluete"] },
    { id: "williams", cat: "brand", art: "brand-williams", c: "#e2738a", vat: 20, stock: 12, pop: 7, age: 1,
      n: { de: "Williamsbrand", en: "Williams pear brandy" }, s: { de: "Edelbrand, 40 % vol, 0,35 l", en: "Fruit brandy, 40 % vol, 0.35 l" },
      d: { de: "Doppelt gebrannt aus vollreifen Williamsbirnen, zwei Jahre in Glasballons gereift. Duftet nach frisch aufgeschnittener Birne.", en: "Double-distilled from fully ripe Williams pears, aged for two years in glass. Smells like a freshly cut pear." },
      v: [{ id: "035", n: { de: "0,35 l", en: "0.35 l" }, p: 24.9 }], f: { de: [["Alkohol", "40 % vol"], ["Abgabe", "nur ab 18 Jahren"]], en: [["Alcohol", "40 % vol"], ["Sale", "18+ only"]] }, x: ["fass", "kistl", "gutschein"] },
    { id: "fass", cat: "brand", art: "brand-fass", c: "#c47a2c", vat: 20, stock: 3, pop: 5, age: 1,
      n: { de: "Mostbirnbrand im Holzfass", en: "Oak-aged perry pear brandy" }, s: { de: "Drei Jahre im Eichenfass, 42 % vol", en: "Three years in oak, 42 % vol" },
      d: { de: "Unser Brand aus Mostbirnen, drei Jahre im Eichenfass gelagert. Weich, mit Noten von Vanille und Dörrbirne.", en: "Our brandy from perry pears, aged three years in oak. Soft, with notes of vanilla and dried pear." },
      v: [{ id: "035", n: { de: "0,35 l", en: "0.35 l" }, p: 29.9 }], f: { de: [["Alkohol", "42 % vol"], ["Abgabe", "nur ab 18 Jahren"]], en: [["Alcohol", "42 % vol"], ["Sale", "18+ only"]] }, x: ["williams", "kistl", "kletzen"] },
    { id: "bluete", cat: "suess", art: "honig-bluete", c: "#f2b54a", vat: 10, stock: 27, pop: 8, unitKg: [.5, 1],
      n: { de: "Blütenhonig", en: "Blossom honey" }, s: { de: "Von den Bienen unter den Obstbäumen", en: "From the bees under our fruit trees" },
      d: { de: "Unsere Bienen stehen mitten in der Streuobstwiese. Der Frühjahrshonig ist hell, cremig gerührt und mild.", en: "Our bees live right in the orchard. The spring honey is light, creamed and mild." },
      v: [{ id: "500", n: { de: "500 g", en: "500 g" }, p: 8.9 }, { id: "1000", n: { de: "1 kg", en: "1 kg" }, p: 15.9 }], f: { de: [["Sorte", "Obstblüte, cremig"], ["Imkerei", "eigene, 14 Völker"]], en: [["Type", "fruit blossom, creamed"], ["Beekeeping", "our own, 14 colonies"]] }, x: ["wald", "ingwer", "apfelsaft"] },
    { id: "wald", cat: "suess", art: "honig-wald", c: "#b8702a", vat: 10, stock: 9, pop: 5,
      n: { de: "Waldhonig", en: "Forest honey" }, s: { de: "Dunkel, kräftig, flüssig", en: "Dark, strong, runny" },
      d: { de: "Aus dem Wald hinter dem Hof. Dunkel und würzig, gut für Tee und zum Backen.", en: "From the forest behind the farm. Dark and spicy, great for tea and baking." },
      v: [{ id: "500", n: { de: "500 g", en: "500 g" }, p: 9.9 }], f: { de: [["Sorte", "Waldhonig, flüssig"]], en: [["Type", "forest honey, runny"]] }, x: ["bluete", "roester", "kletzen"] },
    { id: "ingwer", cat: "suess", art: "aufstrich-ingwer", c: "#f2b54a", vat: 10, stock: 19, pop: 6, badge: "neu",
      n: { de: "Birnen-Ingwer-Aufstrich", en: "Pear and ginger spread" }, s: { de: "Fruchtig mit leichter Schärfe, 220 g", en: "Fruity with a little heat, 220 g" },
      d: { de: "Gekocht aus Birnen und frischem Ingwer, mit wenig Zucker. Aufs Butterbrot oder zum Käse.", en: "Cooked from pears and fresh ginger, low in sugar. On buttered bread or with cheese." },
      v: [{ id: "220", n: { de: "220 g", en: "220 g" }, p: 4.9 }], f: { de: [["Frucht", "65 %"], ["Zucker", "wenig, aus Rohrzucker"]], en: [["Fruit", "65 %"], ["Sugar", "low, cane sugar"]] }, x: ["roester", "bluete", "chips"] },
    { id: "roester", cat: "suess", art: "aufstrich-roester", c: "#8a2f5c", vat: 10, stock: 24, pop: 5,
      n: { de: "Zwetschkenröster", en: "Plum compote" }, s: { de: "Nach Omas Rezept, 220 g", en: "Grandma’s recipe, 220 g" },
      d: { de: "Zwetschken, Zimt und ein Schuss Most, langsam eingekocht. Zum Kaiserschmarrn oder Germknödel.", en: "Plums, cinnamon and a dash of perry, slowly cooked down. With Kaiserschmarrn or yeast dumplings." },
      v: [{ id: "220", n: { de: "220 g", en: "220 g" }, p: 4.5 }], f: { de: [["Frucht", "80 %"]], en: [["Fruit", "80 %"]] }, x: ["ingwer", "wald", "rezeptheft"] },
    { id: "essig", cat: "fein", art: "essig", c: "#d9a046", vat: 10, stock: 15, pop: 4,
      n: { de: "Mostessig", en: "Perry vinegar" }, s: { de: "Mild, aus eigenem Most, 0,5 l", en: "Mild, from our own perry, 0.5 l" },
      d: { de: "Langsam vergoren aus unserem Speckbirnen-Most. Für Salate, Erdäpfelsalat und zum Einlegen.", en: "Slowly fermented from our Speckbirne perry. For salads, potato salad and pickling." },
      v: [{ id: "05", n: { de: "0,5 l", en: "0.5 l" }, p: 6.9 }], f: { de: [["Säure", "5 %"]], en: [["Acidity", "5 %"]] }, x: ["kletzen", "speck", "chips"] },
    { id: "kletzen", cat: "fein", art: "kletzen", c: "#8a5428", vat: 10, stock: 33, pop: 6,
      n: { de: "Kletzen", en: "Dried pears" }, s: { de: "Gedörrte Mostbirnen, 200 g", en: "Dried perry pears, 200 g" },
      d: { de: "Ganze Mostbirnen, im Dörrofen am Hof getrocknet. Für Kletzenbrot oder einfach zum Knabbern.", en: "Whole perry pears, dried in the farm’s drying oven. For pear bread or just for snacking." },
      v: [{ id: "200", n: { de: "200 g", en: "200 g" }, p: 5.5 }], f: { de: [["Zutaten", "100 % Birne"]], en: [["Ingredients", "100 % pear"]] }, x: ["chips", "rezeptheft", "fass"] },
    { id: "chips", cat: "fein", art: "chips", c: "#e2738a", vat: 10, stock: 41, pop: 7,
      n: { de: "Apfelchips", en: "Apple crisps" }, s: { de: "Knusprig, ungezuckert, 80 g", en: "Crunchy, unsweetened, 80 g" },
      d: { de: "Dünn geschnittene Apfelringe, schonend getrocknet. Die Kinder am Hof essen sie wie Kekse.", en: "Thinly sliced apple rings, gently dried. The kids on the farm eat them like biscuits." },
      v: [{ id: "80", n: { de: "80 g", en: "80 g" }, p: 3.9 }], f: { de: [["Zutaten", "100 % Apfel"]], en: [["Ingredients", "100 % apple"]] }, x: ["kletzen", "apfelsaft", "ingwer"] },
    { id: "kistl", cat: "geschenk", art: "kistl", c: "#d9a466", vat: 20, stock: 8, pop: 9, age: 1,
      n: { de: "Geschenkkistl Mostviertel", en: "Mostviertel gift crate" }, s: { de: "Most, Williams, Hollersaft im Holzkistl", en: "Perry, Williams, elderberry in a wooden crate" },
      d: { de: "Unser Lieblingsgeschenk: Speckbirnen-Most, Williamsbrand 0,35 l und Apfel-Hollersaft, in Holzwolle im Holzkistl. Mit Karte für deinen Gruß.", en: "Our favourite gift: Speckbirne perry, Williams brandy 0.35 l and apple-elderberry juice, in wood wool in a wooden crate. With a card for your message." },
      v: [{ id: "1", n: { de: "Kistl", en: "Crate" }, p: 39 }], f: { de: [["Inhalt", "3 Flaschen, Grußkarte"], ["Abgabe", "enthält Edelbrand, ab 18"]], en: [["Contents", "3 bottles, greeting card"], ["Sale", "contains brandy, 18+"]] }, x: ["gutschein", "williams", "bluete"] },
    { id: "gutschein", cat: "geschenk", art: "gutschein", c: "#f2b54a", vat: 0, stock: -1, pop: 8, gift: 1, link: "#gutschein",
      n: { de: "Geschenkgutschein", en: "Gift card" }, s: { de: "Ab € 25, als PDF oder per Post", en: "From € 25, as PDF or by post" },
      d: { de: "Betrag und Motiv wählst du selbst, mit Namen und Gruß. Gilt im Hofladen und online, drei Jahre lang.", en: "Choose the amount and design yourself, with names and a message. Valid in the farm shop and online for three years." },
      v: [{ id: "x", n: { de: "selbst gestalten", en: "design your own" }, p: 25 }], x: ["kistl", "frizzante", "rezeptheft"] },
    { id: "rezeptheft", cat: "digital", art: "rezeptheft", c: "#c7354f", vat: 10, stock: -1, pop: 6, digital: "pdf", badge: "digital",
      n: { de: "Rezeptheft „Vom Mosthof“", en: "Recipe booklet “From the farm”" }, s: { de: "24 Rezepte als PDF, sofort laden", en: "24 recipes as PDF, instant download" },
      d: { de: "Mostbratl, Kletzenbrot, Birnen-Tarte und 21 weitere Rezepte aus der Hofküche. Als PDF zum Herunterladen, gleich nach dem Kauf.", en: "Perry roast, pear bread, pear tart and 21 more recipes from the farm kitchen. As a PDF download right after purchase." },
      v: [{ id: "pdf", n: { de: "PDF", en: "PDF" }, p: 7.9 }], f: { de: [["Format", "PDF, 32 Seiten"], ["Lieferung", "Download sofort"]], en: [["Format", "PDF, 32 pages"], ["Delivery", "instant download"]] }, x: ["kurs", "kletzen", "roester"] },
    { id: "kurs", cat: "digital", art: "kurs", c: "#f2b54a", vat: 20, stock: -1, pop: 5, digital: "video", badge: "digital",
      n: { de: "Video-Kurs „Most verkosten“", en: "Video course “Tasting perry”" }, s: { de: "45 Minuten mit dem Mostbauern", en: "45 minutes with the perry maker" },
      d: { de: "Wie man Most richtig verkostet, welche Birne wofür taugt und was zur Jause passt. Fünf kurze Videos, unbegrenzt ansehen.", en: "How to taste perry, which pear suits what, and what goes with a cold platter. Five short videos, watch as often as you like." },
      v: [{ id: "v", n: { de: "Online", en: "Online" }, p: 19 }], f: { de: [["Länge", "5 Videos, 45 min"], ["Zugang", "im Kundenkonto"]], en: [["Length", "5 videos, 45 min"], ["Access", "in your account"]] }, x: ["rezeptheft", "speck", "frizzante"] }
  ];
  var byId = {}; P.forEach(function (p) { byId[p.id] = p; });
  // Zahl und Einheit nie trennen ("200 g", "6 % vol")
  var nb = function (t) { return t.replace(/(\d) (g|kg|l|%)(?![\wäöü])/g, "$1\u00a0$2").replace(/% vol/g, "%\u00a0vol").replace(/€ (\d)/g, "€\u00a0$1"); };
  P.forEach(function (p) { ["s", "d"].forEach(function (k) { p[k].de = nb(p[k].de); p[k].en = nb(p[k].en); }); });

  /* ---------- Zustand ---------- */
  var cart = store.get("cart", []).filter(function (l) { return l.kind === "abo" || l.kind === "gift" || byId[l.id]; });
  var code = store.get("code", "");
  var orders = store.get("orders", null);
  var subs = store.get("subs", null);
  var downloads = store.get("dls", null);
  var logged = store.get("login", false);
  var seq = store.get("seq", 1047);
  var today = new Date();
  var addD = function (n) { var d = new Date(today); d.setDate(d.getDate() + n); return d; };
  if (!orders) orders = [
    { nr: "BK-2026-1046", name: "Lena Huber", t: addD(0).toISOString(), items: [["speck", "6", 1], ["bluete", "500", 2]], total: 44.7, st: "neu", ship: "post", mine: false },
    { nr: "BK-2026-1045", name: "Gasthaus Lindenhof", t: addD(0).toISOString(), items: [["apfelbirn", "6", 4], ["essig", "05", 3]], total: 120.3, st: "pack", ship: "reg", mine: false },
    { nr: "BK-2026-1044", name: "Anna Muster", t: addD(-9).toISOString(), items: [["frizzante", "075", 2], ["ingwer", "220", 1], ["rezeptheft", "pdf", 1]], total: 32.6, st: "done", ship: "hof", mine: true },
    { nr: "BK-2026-1043", name: "Markus Berger", t: addD(-1).toISOString(), items: [["kistl", "1", 2]], total: 78, st: "go", ship: "post", mine: false },
    { nr: "BK-2026-1041", name: "Anna Muster", t: addD(-34).toISOString(), items: [["speck", "6", 1], ["chips", "80", 2]], total: 41.6, st: "done", ship: "post", mine: true }
  ];
  if (!subs) subs = [];
  if (!downloads) downloads = [{ id: "rezeptheft", nr: "BK-2026-1044" }];
  var ui = { cat: "all", sort: "top", q: "", sel: {}, ship: "post", pay: "card", slot: "", step: 1, addr: {} };
  function save() { store.set("cart", cart); store.set("code", code); store.set("orders", orders); store.set("subs", subs); store.set("dls", downloads); store.set("login", logged); store.set("seq", seq); }

  /* ---------- Hilfen ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.innerHTML = '<svg aria-hidden="true"><use href="#i-haken"/></svg><span>' + esc(msg) + "</span>";
    toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }
  function variant(p, vid) { for (var i = 0; i < p.v.length; i++) if (p.v[i].id === vid) return p.v[i]; return p.v[0]; }
  function lineInfo(l) {
    if (l.kind === "abo") return { name: X("aboName"), meta: X("mix")[l.mix] + " · " + X("every")[l.int], art: "abo", c: "#f2b54a", vat: 20, price: l.price, sub: 1, phys: 1 };
    if (l.kind === "gift") return { name: X("giftName") + " € " + (+l.amt || 0), meta: (l.how === "post" ? X("giftPost") : X("giftPdf")) + (l.to ? " · " + X("forTo") + " " + l.to : ""), art: "gutschein", c: "#f2b54a", vat: 0, price: l.amt + (l.how === "post" ? 2 : 0), gift: 1, phys: l.how === "post" };
    var p = byId[l.id], v = variant(p, l.v);
    return { name: L(p.n), meta: L(v.n), art: p.art, c: p.c, vat: p.vat, price: v.p, age: p.age, dig: p.digital, phys: !p.digital, p: p };
  }
  function cartCount() { return cart.reduce(function (a, l) { return a + l.q; }, 0); }

  // Summen: Rabatte nur auf Waren (nicht auf Gutscheine und Abo), MwSt. je Satz aus dem Bruttopreis herausgerechnet.
  var FREE = 59;
  function shipCost(method, goods, phys) {
    if (!phys) return 0;
    if (code === "VERSANDFREI" && method !== "de") return 0;
    return { hof: 0, reg: 3.9, post: goods >= FREE ? 0 : 6.9, de: 12.9 }[method] || 0;
  }
  function totals(method) {
    var sub = 0, elig = 0, phys = false, age = false, dig = false, goods = 0, byVat = {};
    cart.forEach(function (l) {
      var i = lineInfo(l), a = i.price * l.q; sub += a;
      if (!i.gift && !i.sub) elig += a;
      if (!i.gift) goods += a;
      if (i.phys) phys = true; if (i.age) age = true; if (i.dig) dig = true;
    });
    var disc = 0, msg = "";
    if (code === "HERBST10") disc = r2(elig * .1);
    if (code === "WILLKOMMEN5") disc = elig >= 30 ? 5 : 0;
    var ship = shipCost(method || ui.ship, goods - disc, phys);
    cart.forEach(function (l) {
      var i = lineInfo(l), a = i.price * l.q;
      if (!i.vat) return;
      var share = (!i.gift && !i.sub && elig) ? disc * a / elig : 0;
      byVat[i.vat] = (byVat[i.vat] || 0) + (a - share);
    });
    if (ship) byVat[20] = (byVat[20] || 0) + ship;
    var tax = Object.keys(byVat).sort().map(function (r) { return [r, r2(byVat[r] * r / (100 + +r))]; });
    return { sub: r2(sub), disc: disc, ship: ship, total: r2(sub - disc + ship), phys: phys, age: age, dig: dig, goods: goods, tax: tax, hasGift: cart.some(function (l) { return l.kind === "gift"; }), onlySpecial: cart.length && cart.every(function (l) { return lineInfo(l).gift || lineInfo(l).dig; }) };
  }

  /* ---------- Sprache anwenden ---------- */
  $$("[data-t]").forEach(function (el) { DE[el.getAttribute("data-t")] = el.textContent; });
  $$("[data-tp]").forEach(function (el) { DE[el.getAttribute("data-tp")] = el.getAttribute("placeholder"); });
  $$("[data-tl]").forEach(function (el) { DE[el.getAttribute("data-tl")] = el.getAttribute("aria-label"); });
  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-t]").forEach(function (el) { el.textContent = T(el.getAttribute("data-t")); });
    $$("[data-tp]").forEach(function (el) { el.setAttribute("placeholder", T(el.getAttribute("data-tp"))); });
    $$("[data-tl]").forEach(function (el) { el.setAttribute("aria-label", T(el.getAttribute("data-tl"))); });
    $("#langT").textContent = lang === "en" ? "DE" : "EN";
    $("#lang").setAttribute("aria-label", lang === "en" ? "Sprache: Deutsch" : "Language: English");
    $("#cartBtn").setAttribute("aria-label", lang === "en" ? "Open basket" : "Warenkorb öffnen");
    renderAll();
  }

  /* ---------- Shop ---------- */
  var grid = $("#grid");
  function renderCats() {
    $("#cats").innerHTML = CATS.map(function (c) {
      var n = c.id === "all" ? P.length : P.filter(function (p) { return p.cat === c.id; }).length;
      return '<button type="button" class="pill" data-cat="' + c.id + '" aria-pressed="' + (ui.cat === c.id) + '">' + esc(c.id === "all" ? X("all") : L(c.n)) + " <i>" + n + "</i></button>";
    }).join("");
  }
  function list() {
    var q = ui.q.trim().toLowerCase();
    var a = P.filter(function (p) {
      if (ui.cat !== "all" && p.cat !== ui.cat) return false;
      if (!q) return true;
      return (L(p.n) + " " + L(p.s) + " " + p.n.de + " " + p.n.en).toLowerCase().indexOf(q) > -1;
    });
    var pr = function (p) { return variant(p, ui.sel[p.id]).p; };
    if (ui.sort === "up") a.sort(function (x, y) { return pr(x) - pr(y); });
    else if (ui.sort === "down") a.sort(function (x, y) { return pr(y) - pr(x); });
    else if (ui.sort === "az") a.sort(function (x, y) { return L(x.n).localeCompare(L(y.n), lang); });
    else a.sort(function (x, y) { return (y.stock === 0 ? -1 : y.pop) - (x.stock === 0 ? -1 : x.pop); });
    return a;
  }
  function unitTxt(p, v) {
    if (p.unitL) { var l = v.id === "6" ? 6 : 1; return X("perL")(fmtN(v.p / l)); }
    if (p.unitKg) { var k = v.id === "1000" ? 1 : .5; return X("perKg")(fmtN(v.p / k)); }
    if (p.gift) return lang === "en" ? "no VAT" : "ohne MwSt.";
    return X("inkl");
  }
  function badges(p) {
    var b = [];
    if (p.stock === 0) b.push('<span class="bdg">' + X("out") + "</span>");
    else if (p.stock > 0 && p.stock <= 5) b.push('<span class="bdg bdg--rose">' + X("only")(p.stock) + "</span>");
    if (p.badge === "neu") b.push('<span class="bdg bdg--gold">' + X("neu") + "</span>");
    if (p.badge === "top") b.push('<span class="bdg bdg--gold">' + X("top") + "</span>");
    if (p.digital) b.push('<span class="bdg">' + X("digital") + "</span>");
    if (p.age) b.push('<span class="bdg">' + X("age18") + "</span>");
    return b.join("");
  }
  function renderGrid() {
    var a = list();
    $("#count").textContent = X("items")(a.length);
    if (!a.length) { grid.innerHTML = '<p class="empty">' + (lang === "en" ? "Nothing found. Try “honey” or “perry”." : "Nichts gefunden. Probier „Honig“ oder „Most“.") + "</p>"; return; }
    grid.innerHTML = a.map(function (p, i) {
      var v = variant(p, ui.sel[p.id]), out = p.stock === 0;
      var vs = p.v.length > 1 ? '<div class="card__v">' + p.v.map(function (x) { return '<button type="button" data-var="' + x.id + '" aria-pressed="' + (x.id === v.id) + '">' + esc(L(x.n)) + "</button>"; }).join("") + "</div>" : "";
      var add = p.gift ? '<a class="ib card__add" href="#gutschein" aria-label="' + esc(L(p.n)) + '"><svg aria-hidden="true"><use href="#i-pfeil"/></svg></a>'
        : out ? '<button type="button" class="ib card__add" data-notify disabled aria-label="' + X("notify") + '" title="' + X("notify") + '"><svg aria-hidden="true"><use href="#i-glocke"/></svg></button>'
          : '<button type="button" class="ib card__add" data-add aria-label="' + esc(L(p.n)) + ": " + X("add") + '"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>';
      return '<article class="card glass' + (out ? " card--out" : "") + '" data-id="' + p.id + '" style="--c:' + p.c + ";animation-delay:" + Math.min(i, 8) * 40 + 'ms">' +
        '<button type="button" class="card__img" data-open aria-label="' + esc(L(p.n)) + '">' + '<span class="badges">' + badges(p) + "</span>" + art(p.art) + "</button>" +
        '<div class="card__b"><p class="card__k">' + esc(L(CATS.filter(function (c) { return c.id === p.cat; })[0].n)) + '</p><h3><button type="button" class="card__n" data-open>' + esc(L(p.n)) + '</button></h3><p class="card__s">' + esc(L(p.s)) + "</p>" + vs +
        '<div class="card__f"><p class="card__p"><b>' + (p.gift ? (lang === "en" ? "from " : "ab ") : "") + fmt(v.p) + "</b><small>" + unitTxt(p, v) + "</small></p>" + add + "</div></div></article>";
    }).join("");
  }
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card"); if (!card) return;
    var p = byId[card.dataset.id];
    var vb = e.target.closest("[data-var]");
    if (vb) { ui.sel[p.id] = vb.dataset.var; renderGrid(); return; }
    if (e.target.closest("[data-open]")) { if (p.gift) { location.hash = "#gutschein"; return; } openProd(p); return; }
    var ab = e.target.closest("[data-add]");
    if (ab) { addItem(p, ui.sel[p.id] || p.v[0].id, 1, card.querySelector(".card__img .art")); ab.classList.remove("is-ok"); void ab.offsetWidth; ab.classList.add("is-ok"); }
  });
  $("#cats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]"); if (!b) return;
    ui.cat = b.dataset.cat; renderCats(); renderGrid();
  });
  $("#sort").addEventListener("change", function () { ui.sort = this.value; renderGrid(); });
  var qT; $("#q").addEventListener("input", function () {
    var v = this.value; clearTimeout(qT);
    qT = setTimeout(function () { ui.q = v; if (v && ui.cat !== "all") { ui.cat = "all"; renderCats(); } renderGrid(); if (v) $("#shop").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 220);
  });

  // Produkt fliegt in den Korb
  function fly(from) {
    if (reduce || !from) return;
    var r = from.getBoundingClientRect(), to = $("#cartBtn").getBoundingClientRect();
    var f = document.createElement("div"); f.className = "fly"; f.innerHTML = from.outerHTML;
    var s = Math.min(r.width, 120);
    f.style.cssText = "left:" + (r.left + r.width / 2 - s / 2) + "px;top:" + (r.top + r.height / 2 - s / 2) + "px;width:" + s + "px;height:" + s + "px";
    (document.fullscreenElement || document.body).appendChild(f);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      f.style.transform = "translate(" + (to.left + to.width / 2 - (r.left + r.width / 2)) + "px," + (to.top + to.height / 2 - (r.top + r.height / 2)) + "px) scale(.2) rotate(-20deg)";
      f.style.opacity = ".2";
    }); });
    setTimeout(function () { f.remove(); }, 800);
  }
  function bump() { var b = $("#cartBtn"); b.classList.remove("is-bump"); void b.offsetWidth; b.classList.add("is-bump"); }
  function addItem(p, vid, q, from) {
    var l = cart.filter(function (x) { return x.id === p.id && x.v === vid && !x.kind; })[0];
    if (l) l.q += q; else cart.push({ id: p.id, v: vid, q: q });
    save(); fly(from); setTimeout(function () { renderCart(); bump(); }, reduce ? 0 : 650);
    toast(L(p.n) + " " + X("added"));
  }

  /* ---------- Produktdetail ---------- */
  var dProd = $("#prod"), cur = null, curQ = 1;
  function openProd(p) {
    cur = p; curQ = 1;
    var v = variant(p, ui.sel[p.id]);
    dProd.style.setProperty("--c", p.c);
    $("#pArt").innerHTML = art(p.art);
    $("#pCat").textContent = L(CATS.filter(function (c) { return c.id === p.cat; })[0].n);
    $("#pName").textContent = L(p.n);
    $("#pDesc").textContent = L(p.d);
    $("#pVar").innerHTML = p.v.length > 1 ? p.v.map(function (x) { return '<button type="button" class="pill" data-v="' + x.id + '" aria-pressed="' + (x.id === v.id) + '">' + esc(L(x.n)) + "</button>"; }).join("") : "";
    $("#pFacts").innerHTML = (p.f ? L(p.f) : []).map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    $("#pX").innerHTML = (p.x || []).map(function (id) { var o = byId[id]; return o ? '<button type="button" data-x="' + id + '">' + art(o.art) + "<span>" + esc(L(o.n)) + "</span><small>" + fmt(o.v[0].p) + "</small></button>" : ""; }).join("");
    updProd();
    if (!dProd.open) dProd.showModal();
    dProd.scrollTop = 0;
  }
  function updProd() {
    var p = cur, v = variant(p, ui.sel[p.id]), st = $("#pStock"), out = p.stock === 0;
    $("#pPrice").textContent = fmt(v.p); $("#pUnit").textContent = unitTxt(p, v);
    $("#pQty").textContent = curQ;
    st.className = "pd__stock " + (p.digital ? "is-dl" : out ? "is-bad" : p.stock <= 5 ? "is-warn" : "is-ok");
    st.textContent = p.digital ? X("dl") : out ? X("out") : p.stock <= 5 ? X("low")(p.stock) : X("instock");
    var b = $("#pAdd"); b.disabled = false;
    b.querySelector("span").textContent = out ? X("notify") : X("add");
    b.querySelector("use").setAttribute("href", out ? "#i-glocke" : "#i-korb");
    $("#pMinus").disabled = out; $("#pPlus").disabled = out;
  }
  $("#pVar").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (!b) return; ui.sel[cur.id] = b.dataset.v; $$("#pVar .pill").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); updProd(); renderGrid(); });
  $("#pMinus").addEventListener("click", function () { curQ = Math.max(1, curQ - 1); updProd(); });
  $("#pPlus").addEventListener("click", function () { var max = cur.stock > 0 ? cur.stock : 99; curQ = Math.min(max, curQ + 1); updProd(); });
  $("#pAdd").addEventListener("click", function () {
    if (cur.stock === 0) { toast(X("notified")); return; }
    addItem(cur, ui.sel[cur.id] || cur.v[0].id, curQ, $("#pArt .art")); setTimeout(function () { dProd.close(); }, reduce ? 0 : 250);
  });
  $("#pX").addEventListener("click", function (e) { var b = e.target.closest("[data-x]"); if (!b) return; var o = byId[b.dataset.x]; if (o.gift) { dProd.close(); location.hash = "#gutschein"; } else openProd(o); });

  /* ---------- Warenkorb ---------- */
  var drawer = $("#cart"), scrim = $("#scrim"), lastFocus;
  function openCart() { lastFocus = document.activeElement; renderCart(); drawer.hidden = false; scrim.hidden = false; document.body.style.overflow = "hidden"; setTimeout(function () { drawer.querySelector("[data-close]").focus(); }, 30); }
  function closeCart() { drawer.hidden = true; scrim.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  $("#cartBtn").addEventListener("click", openCart);
  scrim.addEventListener("click", closeCart);
  drawer.querySelector("[data-close]").addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) closeCart(); });
  function sumRows(t, method, label) {
    var h = "<dt>" + X("sub") + "</dt><dd>" + fmt(t.sub) + "</dd>";
    if (t.disc) h += '<dt class="is-disc">' + X("disc") + " " + code + ' <button type="button" class="rm" data-rmcode aria-label="Code entfernen">✕</button></dt><dd class="is-disc">− ' + fmt(t.disc) + "</dd>";
    else if (code && code !== "VERSANDFREI") h += '<dt class="is-disc">' + code + ' <button type="button" class="rm" data-rmcode aria-label="Code entfernen">✕</button></dt><dd class="is-disc">–</dd>';
    if (t.phys) h += "<dt>" + (label || X("shipEst")) + (code === "VERSANDFREI" && t.ship === 0 ? ' <button type="button" class="rm" data-rmcode aria-label="Code entfernen">✕</button>' : "") + "</dt><dd" + (t.ship === 0 ? ' class="is-disc"' : "") + ">" + (t.ship === 0 ? T("free") : fmt(t.ship)) + "</dd>";
    h += '<dt class="tot">' + X("total") + '</dt><dd class="tot">' + fmt(t.total) + "</dd>";
    h += '<dt class="tax">' + t.tax.map(function (x) { return X("tax")(x[0], fmt(x[1])); }).join(" · ") + (t.hasGift ? " · " + X("taxFree") : "") + "</dt><dd></dd>";
    return h;
  }
  function renderCart() {
    var n = cartCount(), t = totals("post");
    $("#cartN").textContent = n; $("#cartN").classList.toggle("is-0", !n);
    $("#cartSum").textContent = fmt(n ? t.total : 0);
    $("#cartList").innerHTML = cart.length ? cart.map(function (l, i) {
      var inf = lineInfo(l);
      return '<li class="ci" style="--c:' + inf.c + '"><div class="ci__i">' + art(inf.art) + '</div><div><p class="ci__n">' + esc(inf.name) + '</p><p class="ci__m">' + esc(inf.meta) + "</p>" +
        (l.kind ? "" : '<div class="ci__q"><button type="button" class="ib" data-q="-1" data-i="' + i + '" aria-label="Weniger"><svg aria-hidden="true"><use href="#i-minus"/></svg></button><output>' + l.q + '</output><button type="button" class="ib" data-q="1" data-i="' + i + '" aria-label="Mehr"><svg aria-hidden="true"><use href="#i-plus"/></svg></button></div>') +
        '</div><div class="ci__r"><b>' + fmt(inf.price * l.q) + '</b><button type="button" class="ci__x" data-rm="' + i + '">' + X("remove") + "</button></div></li>";
    }).join("") : '<li class="cl__e"><svg aria-hidden="true"><use href="#i-korb"/></svg><p>' + X("emptyCart") + "</p><p>" + X("emptyCart2") + "</p></li>";
    var fr = $("#free");
    fr.hidden = !cart.length;
    if (!t.phys) { $("#freeT").innerHTML = X("freeNone"); $("#freeBar").style.width = "100%"; }
    else if (t.goods - t.disc >= FREE || code === "VERSANDFREI") { $("#freeT").innerHTML = X("freeOk"); $("#freeBar").style.width = "100%"; }
    else { $("#freeT").innerHTML = X("freeTo")(fmt(FREE - (t.goods - t.disc))); $("#freeBar").style.width = Math.max(4, (t.goods - t.disc) / FREE * 100) + "%"; }
    $("#cartSumBox").innerHTML = cart.length ? sumRows(t) : "";
    $("#toCheckout").disabled = !cart.length;
    $$(".vc, .vc__try, .vc__msg").forEach(function (el) { el.hidden = !cart.length; });
  }
  $("#cartList").addEventListener("click", function (e) {
    var q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
    if (q) { var l = cart[+q.dataset.i]; l.q += +q.dataset.q; if (l.q < 1) cart.splice(+q.dataset.i, 1); else if (byId[l.id] && byId[l.id].stock > 0) l.q = Math.min(l.q, byId[l.id].stock); }
    if (rm) cart.splice(+rm.dataset.rm, 1);
    if (q || rm) { save(); renderCart(); }
  });
  function applyCode(c) {
    c = (c || "").trim().toUpperCase(); var m = $("#vcMsg");
    if (!c) return;
    if (!X("vcOk")[c]) { m.className = "vc__msg is-bad"; m.textContent = X("vcBad"); return; }
    code = c; save();
    var t = totals("post");
    m.className = "vc__msg " + (c === "WILLKOMMEN5" && !t.disc ? "is-bad" : "is-ok");
    m.textContent = c === "WILLKOMMEN5" && !t.disc ? X("vcMin") : X("vcOk")[c];
    $("#vcIn").value = ""; renderCart();
  }
  $("#vcForm").addEventListener("submit", function (e) { e.preventDefault(); applyCode($("#vcIn").value); });
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-code]");
    if (c) { if (drawer.hidden) { openCart(); } $("#vcIn").value = c.dataset.code; applyCode(c.dataset.code); return; }
    if (e.target.closest("[data-rmcode]")) { code = ""; save(); $("#vcMsg").textContent = ""; renderCart(); if (dCo.open) renderCoSide(); }
  });

  /* ---------- Kasse ---------- */
  var dCo = $("#co"), form = $("#coForm");
  var DEMO = { vn: "Anna", nn: "Muster", mail: "anna.muster@example.com", str: "Obstgartenweg 3", plz: "3250", ort: "Musterstadt", land: "AT" };
  $("#toCheckout").addEventListener("click", function () {
    if (!cart.length) return;
    closeCart(); ui.step = 1;
    if (logged) fillAddr(DEMO);
    showStep(); dCo.showModal();
  });
  function fillAddr(o) { Object.keys(o).forEach(function (k) { var f = form.elements[k]; if (f) { f.value = o[k]; f.removeAttribute("aria-invalid"); } }); }
  $("#fillDemo").addEventListener("click", function () { fillAddr(DEMO); });
  function digitalOnly() { var t = totals(); return !t.phys; }
  function shipAvail(m) {
    var t = totals(), land = form.elements.land.value, plz = form.elements.plz.value;
    if (m === "de") return land !== "DE" ? X("deOnly") : t.age ? X("deSpirit") : "";
    if (land === "DE" && m !== "hof") return X("atOnly");
    if (m === "reg") return /^3[236]\d\d$/.test(plz) ? "" : X("regNo");
    return "";
  }
  function renderShip() {
    var t = totals();
    if (!t.phys) { $("#shipOpts").innerHTML = ""; $("#slots").hidden = true; $("#shipNote").textContent = X("noShip"); return; }
    if (shipAvail(ui.ship)) ui.ship = ["post", "de", "hof"].filter(function (m) { return !shipAvail(m); })[0] || "hof";
    var ic = { hof: "i-hof", reg: "i-lkw", post: "i-paket", de: "i-welt" };
    $("#shipOpts").innerHTML = ["hof", "reg", "post", "de"].map(function (m) {
      var off = shipAvail(m), c = shipCost(m, t.goods - t.disc, true), s = X("shipM")[m];
      return '<label class="opt' + (off ? " is-off" : "") + '"><input type="radio" name="ship" value="' + m + '"' + (ui.ship === m ? " checked" : "") + (off ? " disabled" : "") + '><svg aria-hidden="true"><use href="#' + ic[m] + '"/></svg><b>' + s[0] + "</b><small>" + (off || s[1]) + '</small><em class="' + (c === 0 ? "is-free" : "") + '">' + (c === 0 ? T("free") : fmt(c)) + "</em></label>";
    }).join("");
    var sl = $("#slots"); sl.hidden = ui.ship !== "hof";
    if (ui.ship === "hof") {
      var fri = addD((5 - today.getDay() + 7) % 7 || 7);
      var days = [fri, fri, addD(((5 - today.getDay() + 7) % 7 || 7) + 1), addD(((5 - today.getDay() + 7) % 7 || 7) + 1)];
      $("#slotPills").innerHTML = X("slotTxt").map(function (s, i) {
        var lab = dateL(days[i], { day: "numeric", month: "numeric" }) + " · " + s;
        return '<button type="button" class="pill" data-slot="' + esc(lab) + '" aria-pressed="' + (ui.slot === lab) + '">' + esc(lab) + "</button>";
      }).join("");
    }
    $("#shipNote").textContent = t.age && ui.ship !== "hof" ? (lang === "en" ? "Contains fruit brandy: the carrier checks ID on delivery (18+)." : "Enthält Edelbrand: Bei der Zustellung wird ein Ausweis verlangt (ab 18).") : "";
  }
  $("#shipOpts").addEventListener("change", function (e) { ui.ship = e.target.value; renderShip(); renderCoSide(); });
  $("#slotPills").addEventListener("click", function (e) { var b = e.target.closest("[data-slot]"); if (!b) return; ui.slot = b.dataset.slot; $$("#slotPills .pill").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); $("#coErr").textContent = ""; });
  function renderPay() {
    var ic = { card: "i-karte", wallet: "i-handy", paypal: "i-euro", eps: "i-bank", inv: "i-rechnung", cash: "i-hof" };
    var t = totals(), cashOk = t.phys && ui.ship === "hof";
    if (ui.pay === "cash" && !cashOk) ui.pay = "card";
    $("#payOpts").innerHTML = ["card", "wallet", "paypal", "eps", "inv", "cash"].map(function (m) {
      var off = m === "cash" && !cashOk, s = X("payM")[m];
      return '<label class="opt' + (off ? " is-off" : "") + '"><input type="radio" name="pay" value="' + m + '"' + (ui.pay === m ? " checked" : "") + (off ? " disabled" : "") + '><svg aria-hidden="true"><use href="#' + ic[m] + '"/></svg><b>' + s[0] + "</b><small>" + s[1] + "</small><em></em></label>";
    }).join("");
    $("#cc").hidden = ui.pay !== "card";
  }
  $("#payOpts").addEventListener("change", function (e) { ui.pay = e.target.value; $("#cc").hidden = ui.pay !== "card"; });
  function shipLabel() { var t = totals(); if (!t.phys) return ""; return X("shipM")[ui.ship][0]; }
  function renderCoSide() {
    $("#coMini").innerHTML = cart.map(function (l) { var i = lineInfo(l); return '<li><span class="ci__i" style="--c:' + i.c + '">' + art(i.art) + "</span><span>" + (l.q > 1 ? l.q + " × " : "") + esc(i.name) + "<small>" + esc(i.meta) + "</small></span><b>" + fmt(i.price * l.q) + "</b></li>"; }).join("");
    var t = totals(ui.step >= 2 ? ui.ship : "post");
    $("#coSum").innerHTML = sumRows(t, ui.ship, ui.step >= 2 && t.phys ? X("ship") + " · " + shipLabel() : null);
  }
  function renderRev() {
    var a = form.elements, rv = X("rv"), t = totals(ui.ship);
    $("#rev").innerHTML = '<div><span>' + rv.addr + "</span><b>" + esc(a.vn.value + " " + a.nn.value) + "<br>" + esc(a.str.value) + ", " + esc(a.plz.value + " " + a.ort.value) + '</b><button type="button" class="lnk" data-go="1">' + rv.change + "</button></div>" +
      (t.phys ? "<div><span>" + rv.ship + "</span><b>" + esc(shipLabel()) + (ui.ship === "hof" && ui.slot ? "<br>" + esc(ui.slot) : "") + '</b><button type="button" class="lnk" data-go="2">' + rv.change + "</button></div>" : "") +
      "<div><span>" + rv.pay + "</span><b>" + esc(X("payM")[ui.pay][0]) + '</b><button type="button" class="lnk" data-go="3">' + rv.change + "</button></div>";
    $("#ageRow").hidden = !t.age; $("#dlRow").hidden = !t.dig;
  }
  $("#rev").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) { ui.step = +b.dataset.go; showStep(); } });
  function showStep() {
    $$(".co__step").forEach(function (s) { s.hidden = +s.dataset.step !== ui.step; });
    $$("#steps li").forEach(function (li) { var n = +li.dataset.s; li.classList.toggle("is-on", n === ui.step); li.classList.toggle("is-done", n < ui.step); });
    $("#coBack").style.visibility = ui.step === 1 ? "hidden" : "visible";
    $("#coNextT").textContent = ui.step === 4 ? X("order") : T("next");
    $("#coNext").querySelector("use").setAttribute("href", ui.step === 4 ? "#i-schloss" : "#i-pfeil");
    $("#coErr").textContent = "";
    if (ui.step === 2) renderShip();
    if (ui.step === 3) renderPay();
    if (ui.step === 4) renderRev();
    renderCoSide();
    dCo.scrollTop = 0;
  }
  $("#coBack").addEventListener("click", function () { ui.step = Math.max(1, ui.step - 1); if (ui.step === 2 && digitalOnly()) ui.step = 1; showStep(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#coErr");
    if (ui.step === 1) {
      var bad = null;
      ["vn", "nn", "mail", "str", "plz", "ort"].forEach(function (k) { var f = form.elements[k], ok = f.value.trim().length > 1 || (k === "plz" && /^\d{4,5}$/.test(f.value)); if (k === "mail") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim()); f.setAttribute("aria-invalid", !ok); if (!ok && !bad) bad = f; });
      if (bad) { bad.focus(); showMsg(bad.name === "mail" && bad.value ? X("needMail") : X("needAddr")); return; }
      ui.step = digitalOnly() ? 3 : 2;
    } else if (ui.step === 2) {
      if (ui.ship === "hof" && !ui.slot) { err.textContent = X("needSlot"); return; }
      ui.step = 3;
    } else if (ui.step === 3) ui.step = 4;
    else {
      var t = totals(ui.ship);
      if (!$("#agb").checked) { err.textContent = X("needAgb"); return; }
      if (t.age && !$("#age").checked) { err.textContent = X("needAge"); return; }
      if (t.dig && !$("#dlOk").checked) { err.textContent = X("needDl"); return; }
      placeOrder(t); return;
    }
    showStep();
  });
  function showMsg(m) { var s = $(".co__step[data-step='1']"), p = s.querySelector(".co__err"); if (!p) { p = document.createElement("p"); p.className = "co__err"; p.setAttribute("aria-live", "assertive"); s.appendChild(p); } p.textContent = m; setTimeout(function () { p.textContent = ""; }, 4000); }
  form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid"); });

  function placeOrder(t) {
    var a = form.elements, nr = "BK-2026-" + (++seq);
    var o = { nr: nr, name: a.vn.value.trim() + " " + a.nn.value.trim(), t: new Date().toISOString(), items: [], total: t.total, st: "neu", ship: t.phys ? ui.ship : "dl", mine: true, fresh: true, isNew: true };
    var dl = [];
    cart.forEach(function (l) {
      if (l.kind === "abo") { subs.unshift({ mix: l.mix, int: l.int, price: l.price, start: addD(7).toISOString(), paused: false }); o.items.push(["abo", l.mix, 1]); }
      else if (l.kind === "gift") { o.items.push(["gutschein", String(l.amt), l.q]); if (l.how === "pdf") dl.push({ id: "gutschein", nr: nr, amt: l.amt, to: l.to, from: l.from, m: l.m, gc: l.gc }); }
      else { var p = byId[l.id]; o.items.push([l.id, l.v, l.q]); if (p.stock > 0) p.stock = Math.max(0, p.stock - l.q); if (p.digital) dl.push({ id: p.id, nr: nr }); }
    });
    orders.unshift(o); downloads = dl.concat(downloads);
    if (a.konto.checked) logged = true;
    var mail = a.mail.value.trim();
    cart = []; code = ""; save();
    dCo.close(); renderAll();
    $("#okNr").textContent = nr;
    var s = t.phys ? (ui.ship === "hof" ? X("okHof")(ui.slot) : X("okShip")) : "";
    $("#okTxt").textContent = X("okTxt")(mail, s);
    var od = $("#okDl"); od.hidden = !dl.length;
    od.innerHTML = dl.length ? "<p>" + X("okDig") + "</p>" + dl.map(dlRow).join("") : "";
    $("#ok").showModal();
  }
  $("#okAcct").addEventListener("click", function () { $("#ok").close(); logged = true; save(); openAcct("b"); });

  /* ---------- PDF ohne Bibliothek: Rezeptheft und Gutschein ---------- */
  function pdfStr(s) { return "(" + s.replace(/[\\()]/g, "\\$&").replace(/€/g, "\x80").replace(/–/g, "\x96").replace(/„/g, "\x84").replace(/“/g, "\x93").replace(/”/g, "\x94").replace(/[^\x00-\xff]/g, "?") + ")"; }
  function makePdf(ops, name) {
    var W = 420, H = 595, c = [];
    ops.forEach(function (o) {
      if (o.rect) c.push(o.rect[4] + " rg " + o.rect.slice(0, 4).join(" ") + " re f");
      if (o.circ) { var x = o.circ[0], y = o.circ[1], r = o.circ[2], k = r * .5523; c.push(o.circ[3] + " rg " + (x + r) + " " + y + " m " + (x + r) + " " + (y + k) + " " + (x + k) + " " + (y + r) + " " + x + " " + (y + r) + " c " + (x - k) + " " + (y + r) + " " + (x - r) + " " + (y + k) + " " + (x - r) + " " + y + " c " + (x - r) + " " + (y - k) + " " + (x - k) + " " + (y - r) + " " + x + " " + (y - r) + " c " + (x + k) + " " + (y - r) + " " + (x + r) + " " + (y - k) + " " + (x + r) + " " + y + " c f"); }
      if (o.t) c.push("BT /" + (o.f || "F1") + " " + o.s + " Tf " + (o.col || "0.16 0.11 0.07") + " rg " + o.x + " " + o.y + " Td " + pdfStr(o.t) + " Tj ET");
    });
    var stream = c.join("\n");
    var objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>", "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream"];
    var out = "%PDF-1.4\n", off = [];
    objs.forEach(function (o, i) { off.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
    var x = out.length;
    out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n" + off.map(function (n) { return ("000000000" + n).slice(-10) + " 00000 n \n"; }).join("") + "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + x + "\n%%EOF";
    var bytes = new Uint8Array(out.length); for (var i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    var url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast(X("pdfOk"));
  }
  function wrap(t, n) { var out = [], ln = ""; t.split(" ").forEach(function (w) { if ((ln + " " + w).trim().length > n) { out.push(ln); ln = w; } else ln = (ln + " " + w).trim(); }); if (ln) out.push(ln); return out; }
  var GOLD = "0.95 0.71 0.29", DARK = "0.08 0.06 0.04", CREAM = "0.97 0.94 0.89";
  function pdfRezept() {
    var en = lang === "en", R = en ? [["Perry roast", "Pork shoulder, 1 l Speckbirne perry, onions, caraway. 2 h at 160 °C, baste with perry."], ["Pear bread", "Dried pears, figs, nuts, rye dough. Rest overnight, bake 70 min."], ["Pear and ginger tart", "Shortcrust, pears, a spoon of our pear-ginger spread, 35 min at 180 °C."]]
      : [["Mostbratl", "Schweinsschulter, 1 l Speckbirnen-Most, Zwiebel, Kümmel. 2 Stunden bei 160 °C, mit Most übergießen."], ["Kletzenbrot", "Kletzen, Feigen, Nüsse, Roggenteig. Über Nacht rasten lassen, 70 Minuten backen."], ["Birnen-Ingwer-Tarte", "Mürbteig, Birnen, ein Löffel Birnen-Ingwer-Aufstrich, 35 Minuten bei 180 °C."]];
    var ops = [{ rect: [0, 0, 420, 595, CREAM] }, { rect: [0, 470, 420, 125, DARK] }, { circ: [355, 532, 34, GOLD] },
      { t: "Birnkammer", f: "F2", s: 13, x: 36, y: 552, col: GOLD }, { t: en ? "Recipes from the farm" : "Rezepte vom Mosthof", f: "F3", s: 30, x: 36, y: 512, col: CREAM },
      { t: en ? "Sample booklet · 3 of 24 recipes" : "Beispielheft · 3 von 24 Rezepten", f: "F1", s: 10, x: 36, y: 490, col: "0.8 0.72 0.6" }];
    var y = 430;
    R.forEach(function (r, i) { ops.push({ circ: [46, y + 4, 11, GOLD] }, { t: String(i + 1), f: "F2", s: 11, x: 43, y: y, col: DARK }, { t: r[0], f: "F2", s: 16, x: 68, y: y }); wrap(r[1], 58).forEach(function (ln, j) { ops.push({ t: ln, f: "F1", s: 10, x: 68, y: y - 20 - j * 14, col: "0.4 0.33 0.26" }); }); y -= 90; });
    ops.push({ rect: [36, 60, 348, 1, "0.8 0.72 0.6"] }, { t: en ? "Fictional farm shop · sample by tim-kofler.at" : "Erfundener Hofladen · Beispiel von tim-kofler.at", f: "F1", s: 9, x: 36, y: 42, col: "0.5 0.43 0.36" });
    makePdf(ops, en ? "birnkammer-recipes.pdf" : "birnkammer-rezepte.pdf");
  }
  function pdfGutschein(d) {
    var en = lang === "en", bg = d.m === "advent" ? "0.18 0.12 0.28" : d.m === "geburtstag" ? "0.91 0.47 0.56" : GOLD, ink = d.m === "advent" ? CREAM : DARK;
    makePdf([{ rect: [0, 0, 420, 595, CREAM] }, { rect: [30, 300, 360, 240, bg] }, { circ: [330, 360, 60, d.m === "advent" ? "0.3 0.22 0.42" : "1 0.85 0.55"] },
      { t: "BIRNKAMMER · " + (en ? "GIFT CARD" : "GESCHENKGUTSCHEIN"), f: "F2", s: 10, x: 54, y: 506, col: ink }, { t: "€ " + d.amt, f: "F3", s: 64, x: 52, y: 400, col: ink },
      { t: (d.to ? (en ? "For " : "Für ") + d.to : "") + (d.from ? (d.to ? " · " : "") + (en ? "From " : "Von ") + d.from : ""), f: "F1", s: 14, x: 54, y: 364, col: ink },
      { t: "Code " + d.gc + " · " + (en ? "valid for 3 years" : "3 Jahre gültig"), f: "F1", s: 10, x: 54, y: 326, col: ink },
      { t: en ? "Redeem in the farm shop or online at checkout." : "Einlösbar im Hofladen oder online in der Kasse.", f: "F1", s: 11, x: 30, y: 260 },
      { t: en ? "Fictional farm shop · sample by tim-kofler.at" : "Erfundener Hofladen · Beispiel von tim-kofler.at", f: "F1", s: 9, x: 30, y: 42, col: "0.5 0.43 0.36" }], "gutschein-" + d.gc + ".pdf");
  }
  function dlRow(d, i) {
    var p = byId[d.id], g = d.id === "gutschein";
    var nm = g ? X("giftName") + " € " + d.amt : L(p.n), sm = g ? (d.to ? X("forTo") + " " + d.to + " · " : "") + d.gc : (p.digital === "pdf" ? "PDF · " : "Video · ") + d.nr;
    var vid = p && p.digital === "video";
    return '<div class="dl"><span>' + art(p.art) + "</span><span><b>" + esc(nm) + "</b><small>" + esc(sm) + '</small></span><button type="button" class="btn btn--line" data-dl="' + (typeof i === "number" ? i : downloads.indexOf(d)) + '"><svg aria-hidden="true"><use href="#' + (vid ? "i-play" : "i-ab") + '"/></svg>' + (vid ? X("play") : X("dlBtn")) + "</button></div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-dl]"); if (!b) return;
    var d = downloads[+b.dataset.dl]; if (!d) return;
    if (d.id === "gutschein") pdfGutschein(d); else if (byId[d.id].digital === "video") toast(X("vidToast")); else pdfRezept();
  });

  /* ---------- Kundenkonto ---------- */
  var dAcc = $("#acc");
  $("#acct").addEventListener("click", function () { openAcct("b"); });
  function openAcct(tab) {
    $("#login").hidden = logged; $("#konto").hidden = !logged;
    if (logged) { renderAcct(); selTab(tab || "b"); }
    if (!dAcc.open) dAcc.showModal();
  }
  $("#loginForm").addEventListener("submit", function (e) { e.preventDefault(); logged = true; save(); toast(X("loggedIn")); openAcct("b"); renderAll(); });
  $("#logout").addEventListener("click", function () { logged = false; save(); dAcc.close(); toast(X("loggedOut")); renderAll(); });
  function selTab(k) {
    $$(".tabs [role=tab]").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === k); });
    $$(".tabp").forEach(function (p) { p.hidden = p.dataset.panel !== k; });
  }
  $(".tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) selTab(b.dataset.tab); });
  $(".tabs").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var bs = $$(".tabs [role=tab]"), i = bs.indexOf(document.activeElement); if (i < 0) return;
    var n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); selTab(n.dataset.tab);
  });
  var STN = { neu: 0, pack: 1, go: 2, done: 3 };
  function itemArt(it) { return it[0] === "abo" ? "abo" : byId[it[0]] ? byId[it[0]].art : "gutschein"; }
  function renderAcct() {
    var mine = orders.filter(function (o) { return o.mine; });
    $("#hist").innerHTML = mine.map(function (o) {
      var s = STN[o.st], tr = o.ship === "hof" ? X("trackHof") : X("track"), dlOnly = o.ship === "dl";
      return '<li class="hi"><div class="hi__t"><span><b>' + esc(o.nr) + '</b> <span class="muted">· ' + dateL(new Date(o.t), { day: "numeric", month: "long", year: "numeric" }) + "</span></span><b>" + fmt(o.total) + "</b></div>" +
        '<div class="hi__items">' + o.items.map(function (it) { return art(itemArt(it)); }).join("") + "</div>" +
        (dlOnly ? "" : '<ol class="track">' + tr.map(function (x, i) { return "<li" + (i <= s ? ' class="is-on"' : "") + ">" + x + "</li>"; }).join("") + "</ol>") +
        '<div class="hi__b"><button type="button" class="lnk" data-again="' + esc(o.nr) + '"><svg aria-hidden="true"><use href="#i-kreis"/></svg>' + X("again") + '</button><button type="button" class="lnk" data-inv="' + esc(o.nr) + '"><svg aria-hidden="true"><use href="#i-rechnung"/></svg>' + X("invoice") + "</button></div></li>";
    }).join("");
    $("#dls").innerHTML = downloads.length ? downloads.map(dlRow).join("") : '<li class="dl__e">' + X("dlNone") + "</li>";
    $("#subs").innerHTML = subs.length ? subs.map(function (s, i) {
      var next = new Date(s.start); if (s.skip) next.setMonth(next.getMonth() + s.int);
      return '<div class="sub">' + art("abo") + "<div><h3>" + X("aboName") + "</h3><p>" + X("mix")[s.mix] + " · " + X("every")[s.int] + " · " + fmt(s.price) + '</p><p class="sub__st' + (s.paused ? " is-p" : "") + '">' + (s.paused ? X("subPaused") : X("subActive") + " · " + X("subNext")(dateL(next))) + "</p></div>" +
        '<div class="sub__b"><button type="button" class="btn btn--line" data-sub="pause" data-i="' + i + '"><svg aria-hidden="true"><use href="#' + (s.paused ? "i-play" : "i-pause") + '"/></svg>' + (s.paused ? X("subResume") : X("subPause")) + '</button>' +
        (s.paused ? "" : '<button type="button" class="btn btn--line" data-sub="skip" data-i="' + i + '"><svg aria-hidden="true"><use href="#i-ueber"/></svg>' + X("subSkip") + "</button>") +
        '<button type="button" class="btn btn--line" data-sub="cancel" data-i="' + i + '"><svg aria-hidden="true"><use href="#i-x"/></svg>' + X("subCancel") + "</button></div></div>";
    }).join("") : '<p class="dl__e">' + X("subNone") + "</p>";
  }
  dAcc.addEventListener("click", function (e) {
    var a = e.target.closest("[data-again]"), iv = e.target.closest("[data-inv]"), sb = e.target.closest("[data-sub]");
    if (a) {
      var o = orders.filter(function (x) { return x.nr === a.dataset.again; })[0];
      o.items.forEach(function (it) { var p = byId[it[0]]; if (p && !p.gift && p.stock !== 0) { var l = cart.filter(function (x) { return x.id === p.id && x.v === it[1]; })[0]; if (l) l.q += it[2]; else cart.push({ id: p.id, v: it[1], q: it[2] }); } });
      save(); renderCart(); bump(); toast(X("againOk"));
    }
    if (iv) toast(lang === "en" ? "In a real shop the invoice PDF for " + iv.dataset.inv + " opens here." : "Im echten Shop öffnet hier die Rechnung zu " + iv.dataset.inv + " als PDF.");
    if (sb) {
      var s = subs[+sb.dataset.i], k = sb.dataset.sub;
      if (k === "pause") s.paused = !s.paused;
      if (k === "skip") { s.skip = !s.skip; toast(X("subSkipped")); }
      if (k === "cancel") { subs.splice(+sb.dataset.i, 1); toast(X("subCancelled")); }
      save(); renderAcct();
    }
    var tg = e.target.closest("[data-toast]"); if (tg) toast(X(tg.dataset.toast));
  });

  /* ---------- Abo ---------- */
  var ABO = { most: 4.9 * 6, misch: 4.9 * 4 + 2.9 * 2, saft: 2.9 * 6 };
  function aboPrice() { var f = $("#aboForm"), mix = f.elements.mix.value; return { mix: mix, int: +f.elements.int.value, price: r2(Math.floor(ABO[mix] * .9) - .1), old: ABO[mix] }; }
  function renderAbo() {
    var a = aboPrice();
    $("#aboPrice").textContent = fmt(a.price);
    $("#aboOld").textContent = X("aboSave")(fmtN(a.old));
    $("#aboNext").textContent = X("aboFirst")(dateL(addD(7)));
  }
  $("#aboForm").addEventListener("change", renderAbo);
  $("#aboForm").addEventListener("submit", function (e) {
    e.preventDefault(); var a = aboPrice();
    cart = cart.filter(function (l) { return l.kind !== "abo"; });
    cart.push({ kind: "abo", mix: a.mix, int: a.int, price: a.price, q: 1 }); save();
    fly($(".abo__kistl .art")); setTimeout(function () { renderCart(); bump(); }, reduce ? 0 : 650); toast(X("aboName") + " " + X("added"));
  });

  /* ---------- Geschenkgutschein ---------- */
  var gift = { amt: 50, m: "birne" };
  function giftCode() { var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return "BK-" + s + "-2026"; }
  var gcNow = giftCode();
  var VART = {
    birne: '<svg viewBox="0 0 200 220"><path d="M100 30c14 0 16 20 19 30 19 14 22 52-19 52S62 74 81 60c3-10 5-30 19-30z" transform="translate(0 40) scale(1 1.2)" transform-origin="100 80" fill="#fff" opacity=".35"/><path d="M100 58c0-12 3-20 8-26" stroke="#2a1606" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/><ellipse cx="124" cy="34" rx="16" ry="7" transform="rotate(-25 124 34)" fill="#2a1606" opacity=".35"/></svg>',
    geburtstag: '<svg viewBox="0 0 200 220"><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M60 200V120M100 200V100M140 200V130"/></g><g fill="#fff" opacity=".7"><path d="M60 120c-8-10-8-20 0-28 8 8 8 18 0 28zM100 100c-8-10-8-20 0-28 8 8 8 18 0 28zM140 130c-8-10-8-20 0-28 8 8 8 18 0 28z"/></g><g fill="#fff" opacity=".45"><circle cx="40" cy="50" r="5"/><circle cx="170" cy="70" r="4"/><circle cx="120" cy="30" r="3"/></g></svg>',
    advent: '<svg viewBox="0 0 200 220"><path d="M100 30l52 90h-28l38 64H38l38-64H48z" fill="#f2b54a" opacity=".55"/><g fill="#ffe9b0"><circle cx="100" cy="24" r="8"/><circle cx="76" cy="116" r="4"/><circle cx="122" cy="148" r="4"/><circle cx="92" cy="170" r="4"/></g><g fill="#fff" opacity=".6"><circle cx="30" cy="60" r="3"/><circle cx="170" cy="40" r="2.5"/><circle cx="160" cy="110" r="2"/></g></svg>'
  };
  function renderGift() {
    var own = +$("#gOwn").value;
    var amt = own >= 10 ? Math.min(500, own) : gift.amt;
    var to = $("#gFor").value.trim(), fr = $("#gFrom").value.trim(), vc = $("#vcard"), sto = to || $("#gFor").placeholder, sfr = fr || $("#gFrom").placeholder;
    vc.dataset.m = gift.m; $(".vcard__art", vc).innerHTML = VART[gift.m];
    $("#vVal").textContent = "€ " + amt;
    $("#vTo").innerHTML = "<span>" + esc(T("g_for")) + "</span> " + esc(sto) + " · <span>" + esc(T("g_from")) + "</span> " + esc(sfr);
    $("#vCode").textContent = gcNow;
    return { amt: amt, to: to, from: fr };
  }
  function pressIn(box, b) { $$(".pill[data-v]", box).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); }
  $("#gAmt").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (!b) return; gift.amt = +b.dataset.v; $("#gOwn").value = ""; pressIn($("#gAmt"), b); flipCard(); renderGift(); });
  $("#gOwn").addEventListener("input", function () { if (+this.value >= 10) pressIn($("#gAmt"), null); renderGift(); });
  $("#gMotif").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (!b) return; gift.m = b.dataset.v; pressIn($("#gMotif"), b); flipCard(); renderGift(); });
  ["#gFor", "#gFrom"].forEach(function (s) { $(s).addEventListener("input", renderGift); });
  function flipCard() { var v = $("#vcard"); v.classList.remove("is-flip"); void v.offsetWidth; v.classList.add("is-flip"); }
  $("#giftForm").addEventListener("submit", function (e) {
    e.preventDefault(); var g = renderGift(), how = this.elements.gHow.value;
    cart.push({ kind: "gift", amt: g.amt, to: g.to, from: g.from, m: gift.m, how: how, gc: gcNow, q: 1 }); save();
    gcNow = giftCode(); renderGift();
    fly($(".vcard")); setTimeout(function () { renderCart(); bump(); }, reduce ? 0 : 650); toast(X("giftName") + " " + X("added"));
  });

  /* ---------- Verwaltung ---------- */
  function renderAdmin() {
    var td = new Date().toDateString(), nToday = orders.filter(function (o) { return new Date(o.t).toDateString() === td; }).length;
    var week = 1284.6 + orders.filter(function (o) { return o.fresh; }).reduce(function (a, o) { return a + o.total; }, 0);
    var pack = orders.filter(function (o) { return o.st === "neu" || o.st === "pack"; }).length;
    var low = P.filter(function (p) { return p.stock >= 0 && p.stock <= 5; }).length;
    var k = X("kpi"), ks = X("kpiS");
    $("#kpi").innerHTML = [[k[0], nToday + 9, ks[0]], [k[1], fmt(week), ks[1]], [k[2], pack, ks[2]], [k[3], low, ks[3], 1]].map(function (x) { return '<div class="kp"><p>' + x[0] + "</p><b>" + x[1] + '</b><small class="' + (x[3] ? "is-warn" : "") + '">' + x[2] + "</small></div>"; }).join("");
    var stl = X("st");
    $("#ordList").innerHTML = orders.slice(0, 12).map(function (o) {
      var items = o.items.map(function (it) { var p = byId[it[0]]; return it[2] + " × " + (it[0] === "abo" ? X("aboName") : p ? L(p.n) : X("giftName")); }).join(", ");
      return '<li class="' + (o.isNew ? "is-new" : "") + '"><span class="ord__nr">' + esc(o.nr.slice(-4)) + '</span><span class="ord__n">' + esc(o.name) + '</span><span class="ord__w">' + esc(items) + '</span><span class="ord__r"><b>' + fmt(o.total) + '</b><button type="button" class="st st--' + esc(o.st) + '" data-st="' + esc(o.nr) + '" title="' + X("stTip") + '">' + esc(stl[o.st] || o.st) + "</button></span></li>";
    }).join("");
    orders.forEach(function (o) { o.isNew = false; });
    $("#stkList").innerHTML = P.filter(function (p) { return !p.gift; }).map(function (p) {
      var v = p.v[0], dig = p.stock < 0, cls = dig ? "" : p.stock === 0 ? "is-bad" : p.stock <= 5 ? "is-warn" : "";
      return '<div class="sk"><span class="sk__i">' + art(p.art) + '</span><span class="sk__n">' + esc(L(p.n)) + '<small class="' + cls + '">' + esc(L(v.n)) + " · " + (dig ? X("stockDig") : p.stock === 0 ? X("stockOut") : p.stock <= 5 ? X("stockLow") : p.stock + " " + X("stock")) + "</small></span>" +
        '<label><span>€</span><input type="number" min="0.5" step="0.1" value="' + v.p.toFixed(2) + '" data-price="' + p.id + '" aria-label="' + X("price") + " " + esc(L(p.n)) + '"></label>' +
        (dig ? '<span class="muted" style="font-size:12px;text-align:center">∞</span>' : '<label class="is-stk"><span>Stk</span><input type="number" min="0" max="999" step="1" value="' + p.stock + '" data-stock="' + p.id + '" aria-label="' + X("stock") + " " + esc(L(p.n)) + '"></label>') + "</div>";
    }).join("");
  }
  $("#ordList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-st]"); if (!b) return;
    var o = orders.filter(function (x) { return x.nr === b.dataset.st; })[0], seqS = ["neu", "pack", "go", "done"];
    o.st = seqS[(seqS.indexOf(o.st) + 1) % 4]; save(); renderAdmin();
  });
  $("#stkList").addEventListener("change", function (e) {
    var t = e.target, p = byId[t.dataset.price || t.dataset.stock]; if (!p) return;
    if (t.dataset.price) { var nv = Math.max(.5, r2(+t.value || p.v[0].p)), f = nv / p.v[0].p; p.v.forEach(function (v, i) { v.p = i ? r2(v.p * f) : nv; }); }
    else p.stock = Math.max(0, Math.round(+t.value || 0));
    renderGrid(); renderAdmin(); renderCart(); toast(X("saved"));
  });
  $("#csv").addEventListener("click", function () {
    var rows = [["Nummer", "Datum", "Kunde", "Positionen", "Betrag", "Status"]].concat(orders.map(function (o) {
      return [o.nr, new Date(o.t).toLocaleDateString("de-AT"), o.name, o.items.map(function (it) { return it[2] + "x " + (byId[it[0]] ? byId[it[0]].n.de : it[0]); }).join(" / "), fmtN(o.total), S.de.st[o.st]];
    }));
    var csv = "\ufeff" + rows.map(function (r) { return r.map(function (c) { c = String(c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(";"); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a"); a.href = url; a.download = "birnkammer-bestellungen.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000); toast(X("csvOk"));
  });

  /* ---------- Rechtliches, Dialoge, Thema ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-legal]"); if (!b) return;
    var l = X("legal")[b.dataset.legal]; $("#legH").textContent = l[0]; $("#legT").innerHTML = l[1]; $("#legal").showModal();
  });
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  });
  var root = document.documentElement;
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches); }
  function themeIcon() { $("#theme use").setAttribute("href", isDark() ? "#i-sonne" : "#i-mond"); $('meta[name="theme-color"]').setAttribute("content", isDark() ? "#140f0b" : "#f6efe4"); }
  $("#theme").addEventListener("click", function () { var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n); try { localStorage.setItem("tk-shop-theme", n); } catch (e) {} themeIcon(); });
  $("#lang").addEventListener("click", function () { lang = lang === "en" ? "de" : "en"; store.set("lang", lang); applyLang(); renderAbo(); renderGift(); });

  // Hero: Produkte neigen sich leicht zum Zeiger
  var stage = $("#stage");
  $$("[data-art]").forEach(function (el) { el.innerHTML = art(el.dataset.art); });
  if (!reduce && window.matchMedia && matchMedia("(pointer:fine)").matches) {
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      $$(".hero__p", stage).forEach(function (p, i) { var k = [1, .6, 1.2, .5][i]; p.style.transform = "translate(" + (x * 18 * k) + "px," + (y * 10 * k) + "px) rotate(" + (x * 4 * k) + "deg)"; });
    });
    stage.addEventListener("pointerleave", function () { $$(".hero__p", stage).forEach(function (p) { p.style.transform = ""; }); });
  }

  function renderAll() { renderCats(); renderGrid(); renderCart(); renderAdmin(); $("#acctDot").hidden = !logged; if (dAcc.open && logged) renderAcct(); }
  themeIcon(); applyLang(); renderAbo(); renderGift();
})();
