/* ── Language System ── */
(function () {

  /* Dynamic strings referenced by main.js and JS-rendered content */
  var STRINGS = {
    cartEmptyHtml:   { en: 'Your cart is empty.<br>Add something worth wearing.',
                       de: 'Dein Warenkorb ist leer.<br>Füge etwas Wertvolles hinzu.' },
    selectSize:      { en: 'Please select a size',           de: 'Bitte wähle eine Größe' },
    addedToCart:     { en: 'Added to cart ✓',               de: 'In den Warenkorb gelegt ✓' },
    cartEmpty:       { en: 'Your cart is empty',             de: 'Dein Warenkorb ist leer' },
    connecting:      { en: 'Connecting to store…',           de: 'Verbinde mit dem Shop…' },
    sizeNotFound:    { en: 'Could not match size — try again', de: 'Größe nicht gefunden – erneut versuchen' },
    checkoutError:   { en: 'Checkout error — please try again', de: 'Kassenfehler – bitte erneut versuchen' },
    onList:          { en: "You're on the list ✓",           de: 'Du bist auf der Liste ✓' },
    notifyFirst:     { en: "We'll notify you first ✓",       de: 'Wir benachrichtigen dich zuerst ✓' },
    msgSent:         { en: "Message sent — we'll get back to you shortly",
                       de: 'Nachricht gesendet – wir melden uns bald' },
    nothingHere:     { en: 'Nothing here yet. Check back soon.',
                       de: 'Noch nichts hier. Schau bald nochmal vorbei.' },
    quickAdd:        { en: 'Quick Add',   de: 'Schnell kaufen' },
    notifyMe:        { en: 'Notify Me',   de: 'Benachrichtige mich' },
    remove:          { en: 'Remove',      de: 'Entfernen' },
    size:            { en: 'Size:',       de: 'Größe:' },
    coLabels:        { en: ['Continue to Shipping →', 'Continue to Payment →', 'Place Order →'],
                       de: ['Weiter zum Versand →',   'Weiter zur Zahlung →',  'Bestellung aufgeben →'] },
  };

  /* Global helper used by main.js */
  window._t = function (key) {
    var lang = localStorage.getItem('driven_lang') || 'en';
    return STRINGS[key] ? (STRINGS[key][lang] || STRINGS[key].en) : key;
  };

  window._tArr = function (key) {
    var lang = localStorage.getItem('driven_lang') || 'en';
    return STRINGS[key] ? (STRINGS[key][lang] || STRINGS[key].en) : [];
  };

  /* ── Public toggle ── */
  window.toggleLanguage = function (lang) {
    localStorage.setItem('driven_lang', lang);
    applyLanguage(lang);
  };

  /* ── Core apply function ── */
  function applyLanguage(lang) {
    /* 1. Static elements with data-en / data-de */
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text !== null) el.innerHTML = text;
    });

    /* 2. Placeholder attributes */
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      var ph = el.getAttribute('data-' + lang + '-placeholder');
      if (ph !== null) el.placeholder = ph;
    });

    /* 3. Lang toggle button states */
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.style.opacity    = active ? '1'   : '0.35';
      btn.style.fontWeight = active ? '700' : '400';
      btn.style.color      = active ? 'var(--white)' : 'var(--grey-400)';
    });

    /* 4. Cart empty text (updated live whenever visible) */
    var cartEmptyText = document.querySelector('.cart-empty-text');
    if (cartEmptyText) {
      cartEmptyText.innerHTML = STRINGS.cartEmptyHtml[lang] || STRINGS.cartEmptyHtml.en;
    }

    /* 5. Checkout next-button label (matches current visible step) */
    var coNextBtn = document.getElementById('coNextBtn');
    if (coNextBtn) {
      var activePage = document.querySelector('.co-page.active');
      if (activePage) {
        var stepNum = parseInt(activePage.id.replace('co-step-', ''), 10);
        var labels  = STRINGS.coLabels[lang] || STRINGS.coLabels.en;
        if (labels[stepNum - 1]) coNextBtn.textContent = labels[stepNum - 1];
      }
    }

    /* 6. Re-sync global coLabels array used by renderCoSteps */
    if (typeof window.coLabels !== 'undefined') {
      var arr = STRINGS.coLabels[lang] || STRINGS.coLabels.en;
      arr.forEach(function (v, i) { window.coLabels[i] = v; });
    }

    /* 7. Re-render collection if currently shown (Quick Add / Notify Me text) */
    if (typeof window.renderCollection === 'function') {
      var activeFilter = document.querySelector('.filter-btn.active');
      if (activeFilter) {
        var filter = activeFilter.getAttribute('onclick').replace(/.*'(.*)'.*/, '$1');
        // Only call if collection page is active
        var colPage = document.getElementById('page-collection');
        if (colPage && colPage.classList.contains('active')) {
          window.renderCollection(filter);
        }
      }
    }
  }

  /* ── Init on DOM ready ── */
  var saved = localStorage.getItem('driven_lang') || 'en';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyLanguage(saved); });
  } else {
    applyLanguage(saved);
  }

})();
