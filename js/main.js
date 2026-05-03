/* ── State ── */
const state = {
  currentPage: 'home',
  selectedSize: null,
  cart: [],
  mobileNavOpen: false,
};

/* ── Products data ── */
const products = [
  { id:1, name:'Stay On Your Path Tee',           price:37, cat:'tshirts', drop:true,  sold:false, img:'assets/images/drop-hero.png',      imgPos:'center top', page:'pdp' },
  { id:2, name:'What If Hoodie — Midnight Black', price:74, cat:'hoodies', core:true,  sold:false, img:'assets/images/hoodie-black.jpg',    imgPos:'center top', page:'hoodie-black' },
  { id:3, name:'What If Hoodie — Ocean Blue',     price:74, cat:'hoodies', core:true,  sold:false, img:'assets/images/hoodie-blue.jpg',     imgPos:'center top', page:'hoodie-blue' },
];

/* ── Custom cursor ── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing= document.getElementById('cursor-ring');
let cx=0,cy=0, rx=0,ry=0;
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursorDot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
});
(function animCursor(){
  rx += (cx-rx)*.12; ry += (cy-ry)*.12;
  cursorRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(animCursor);
})();
document.querySelectorAll('button,a,[data-link]').forEach(el => {
  el.addEventListener('mouseenter', ()=> document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', ()=> document.body.classList.remove('cursor-hover'));
});

// scroll listener — handles nav scrolled state, progress bar, and sticky CTA visibility
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('scrolled', window.scrollY > 40);

  const prog = document.getElementById('progressBar');
  const pct  = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  prog.style.width = pct + '%';

  const stickyCta = document.getElementById('stickyCta');
  if ((state.currentPage==='drop'||state.currentPage==='pdp') && window.scrollY > 300) {
    stickyCta.classList.add('visible');
  } else {
    stickyCta.classList.remove('visible');
  }
});

// showPage — swaps the visible page without a history push (used internally)
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  state.currentPage = page;
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.link === page);
  });
  document.querySelectorAll('.mobile-nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.link === page);
  });
  setupReveal();
  if (page==='collection') renderCollection('all');
  document.getElementById('stickyCta').classList.remove('visible');
}

// navigate — performs a wipe transition and pushes a history entry so back/forward work
function navigate(page) {
  if (page === state.currentPage) { window.scrollTo({top:0,behavior:'smooth'}); return; }
  const wipe = document.getElementById('pageWipe');
  wipe.className = 'page-wipe wipe-in';
  setTimeout(() => {
    showPage(page);
    history.pushState({ page }, '', '#' + page);
    wipe.className = 'page-wipe wipe-out';
  }, 440);
}

// handle browser back/forward buttons
window.addEventListener('popstate', e => {
  const page = (e.state && e.state.page) || 'home';
  const wipe = document.getElementById('pageWipe');
  wipe.className = 'page-wipe wipe-in';
  setTimeout(() => {
    showPage(page);
    wipe.className = 'page-wipe wipe-out';
  }, 440);
});

// set initial history entry so the first back press returns to home
history.replaceState({ page: 'home' }, '', '#home');

// data-link click delegation — intercepts all [data-link] clicks and calls navigate
document.addEventListener('click', e => {
  const el = e.target.closest('[data-link]');
  if (el) { e.preventDefault(); navigate(el.dataset.link); }
});

// selectSize — marks the clicked size button as selected and stores size in state
function selectSize(btn, size) {
  btn.closest('.size-grid').querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedSize = size;
}

// addToCart — validates size selection, finds the matching product, and adds it to the cart
function addToCart() {
  if (!state.selectedSize) {
    const grids = document.querySelectorAll('#page-'+state.currentPage+' .size-grid');
    grids.forEach(g => {
      g.style.animation = 'none';
      g.offsetHeight;
      g.style.animation = 'wiggle .4s ease-in-out';
    });
    showToast(window._t ? window._t('selectSize') : 'Please select a size');
    return;
  }
  const product = products.find(p => p.page === state.currentPage) || products[0];
  state.cart.push({ name: product.name, size: state.selectedSize, price: product.price, img: product.img, page: product.page });
  updateCart();
  showToast(window._t ? window._t('addedToCart') : 'Added to cart ✓');
  openCart();
}

// updateCart — re-renders the cart drawer contents and count badge
function updateCart() {
  const count = state.cart.length;
  const countEl = document.getElementById('cartCount');
  countEl.textContent = count;
  countEl.style.display = count > 0 ? 'flex' : 'none';

  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const totalEl  = document.getElementById('cartTotal');

  if (count === 0) {
    var _emptyHtml = window._t ? window._t('cartEmptyHtml') : 'Your cart is empty.<br>Add something worth wearing.';
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;opacity:.3"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div><div class="cart-empty-text">${_emptyHtml}</div></div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'block';
  let total = 0;
  itemsEl.innerHTML = state.cart.map((item,i) => {
    total += item.price;
    var _size   = window._t ? window._t('size')   : 'Size:';
    var _remove = window._t ? window._t('remove') : 'Remove';
    return `<div class="cart-item">
      <div class="cart-item-img"><img src="${item.img || 'assets/images/drop-hero.png'}" alt="${item.name}" /></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">${_size} ${item.size}</div>
        <div class="cart-item-price">CHF ${item.price}.–</div>
        <div class="cart-item-remove" onclick="removeFromCart(${i})">${_remove}</div>
      </div>
    </div>`;
  }).join('');
  totalEl.textContent = 'CHF ' + total + '.–';
}

// removeFromCart — removes the item at the given index and re-renders the cart
function removeFromCart(i) {
  state.cart.splice(i, 1);
  updateCart();
}

// openCart / closeCart — show or hide the cart overlay
function openCart()  { document.getElementById('cartOverlay').classList.add('visible'); }
function closeCart() { document.getElementById('cartOverlay').classList.remove('visible'); }
document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCart();
});

// showToast — displays a brief notification message then hides it after 2.8 seconds
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2800);
}

// updateCountdowns — calculates time remaining to DROP_DATE and updates all countdown elements
const DROP_DATE = new Date('2026-05-03T20:00:00');
function updateCountdowns() {
  const now  = new Date();
  const diff = Math.max(0, DROP_DATE - now);
  const d = Math.floor(diff/86400000);
  const h = Math.floor((diff%86400000)/3600000);
  const m = Math.floor((diff%3600000)/60000);
  const s = Math.floor((diff%60000)/1000);
  const pad = n => String(n).padStart(2,'0');
  ['home','drop','pdp'].forEach(prefix => {
    const dEl = document.getElementById(prefix+'-d');
    const hEl = document.getElementById(prefix+'-h');
    const mEl = document.getElementById(prefix+'-m');
    const sEl = document.getElementById(prefix+'-s');
    if (dEl) dEl.textContent = pad(d);
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  });
}
setInterval(updateCountdowns, 1000);
updateCountdowns();

// handleEmailSubmit — submits the email signup form to formsubmit.co and shows a toast
function handleEmailSubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  fetch('https://formsubmit.co/ajax/hello@driven-co.ch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email, _subject: 'New Email Sign-Up — Driven Co.' })
  });
  showToast(window._t ? window._t('onList') : "You're on the list ✓");
  e.target.reset();
}

// openMobileNav — opens the mobile navigation drawer and animates the hamburger icon
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
function openMobileNav() {
  state.mobileNavOpen = true;
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
  spans[1].style.opacity   = '0';
  spans[1].style.transform = 'scaleX(0)';
  spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
}

// closeMobileNav — closes the mobile navigation drawer and resets the hamburger icon
function closeMobileNav() {
  state.mobileNavOpen = false;
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
  const spans = hamburger.querySelectorAll('span');
  spans.forEach(s => { s.style.transform=''; s.style.opacity=''; });
}
hamburger.addEventListener('click', () => {
  state.mobileNavOpen ? closeMobileNav() : openMobileNav();
});

// swipe-to-close — listens for rightward swipe gesture on mobile nav to close it
let _touchStartX = 0;
mobileNav.addEventListener('touchstart', e => { _touchStartX = e.touches[0].clientX; }, { passive: true });
mobileNav.addEventListener('touchend', e => {
  if (e.changedTouches[0].clientX - _touchStartX > 60) closeMobileNav();
}, { passive: true });

// setFilter — updates the active filter button and re-renders the collection grid
function setFilter(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCollection(filter);
}

// hoodieSwitch — switches the active PDP thumbnail and fades in the new image
function hoodieSwitch(imgId, thumb, src) {
  thumb.closest('.pdp-thumbs').querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
  const img = document.getElementById(imgId);
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(() => { img.src = src; img.style.opacity = '1'; }, 200);
}

// dropGalleryGo — navigates the drop page hero gallery to a specific image index
let _dropGalleryIdx = 0;
function dropGalleryGo(idx) {
  const imgs = document.querySelectorAll('#dropGallery .drop-gallery-img');
  const dots = document.querySelectorAll('#dropGalleryDots .drop-gallery-dot');
  imgs.forEach(i => i.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  _dropGalleryIdx = (idx + imgs.length) % imgs.length;
  imgs[_dropGalleryIdx].classList.add('active');
  dots[_dropGalleryIdx].classList.add('active');
}
// dropGalleryNav — navigates the drop gallery by a relative direction offset
function dropGalleryNav(dir) { dropGalleryGo(_dropGalleryIdx + dir); }

// pdpGalleryGo — navigates the PDP gallery to a specific image index
let _pdpGalleryIdx = 0;
function pdpGalleryGo(idx) {
  const imgs = document.querySelectorAll('#pdpGallery .drop-gallery-img');
  const dots = document.querySelectorAll('#pdpGalleryDots .drop-gallery-dot');
  imgs.forEach(i => i.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  _pdpGalleryIdx = (idx + imgs.length) % imgs.length;
  imgs[_pdpGalleryIdx].classList.add('active');
  dots[_pdpGalleryIdx].classList.add('active');
}
// pdpGalleryNav — navigates the PDP gallery by a relative direction offset
function pdpGalleryNav(dir) { pdpGalleryGo(_pdpGalleryIdx + dir); }

// hbGalleryGo — navigates the Hoodie Black PDP gallery to a specific image index
let _hbIdx = 0;
function hbGalleryGo(idx) {
  const imgs = document.querySelectorAll('#hbGallery .drop-gallery-img');
  const dots = document.querySelectorAll('#hbGalleryDots .drop-gallery-dot');
  imgs.forEach(i => i.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  _hbIdx = (idx + imgs.length) % imgs.length;
  imgs[_hbIdx].classList.add('active');
  dots[_hbIdx].classList.add('active');
}
// hbGalleryNav — navigates the Hoodie Black gallery by a relative direction offset
function hbGalleryNav(dir) { hbGalleryGo(_hbIdx + dir); }

// hbluGalleryGo — navigates the Hoodie Blue PDP gallery to a specific image index
let _hbluIdx = 0;
function hbluGalleryGo(idx) {
  const imgs = document.querySelectorAll('#hbluGallery .drop-gallery-img');
  const dots = document.querySelectorAll('#hbluGalleryDots .drop-gallery-dot');
  imgs.forEach(i => i.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  _hbluIdx = (idx + imgs.length) % imgs.length;
  imgs[_hbluIdx].classList.add('active');
  dots[_hbluIdx].classList.add('active');
}
// hbluGalleryNav — navigates the Hoodie Blue gallery by a relative direction offset
function hbluGalleryNav(dir) { hbluGalleryGo(_hbluIdx + dir); }

// openSizeGuide — shows the size guide modal overlay; type = 'tee' | 'hoodie'
function openSizeGuide(type) {
  var t = type || 'tee';
  document.getElementById('sizeGuide-tee').style.display    = t === 'tee'    ? '' : 'none';
  document.getElementById('sizeGuide-hoodie').style.display = t === 'hoodie' ? '' : 'none';
  document.getElementById('sizeGuideOverlay').classList.add('visible');
}
// closeSizeGuide — hides the size guide modal overlay
function closeSizeGuide() {
  document.getElementById('sizeGuideOverlay').classList.remove('visible');
}
document.getElementById('sizeGuideOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeSizeGuide();
});

// openNotify — shows the notify-me modal overlay
function openNotify() {
  document.getElementById('notifyOverlay').classList.add('visible');
}
// closeNotify — hides the notify-me modal overlay
function closeNotify() {
  document.getElementById('notifyOverlay').classList.remove('visible');
}

// handleContactSubmit — submits the contact form to formsubmit.co and shows a toast
function handleContactSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data._subject = 'New Message — Driven Co. Contact Form';
  fetch('https://formsubmit.co/ajax/hello@driven-co.ch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  showToast(window._t ? window._t('msgSent') : "Message sent — we'll get back to you shortly");
  e.target.reset();
}

// handleNotifySubmit — submits the notify-me form to formsubmit.co and closes the modal
function handleNotifySubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  fetch('https://formsubmit.co/ajax/hello@driven-co.ch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email, _subject: 'Drop Notification Sign-Up — Driven Co.' })
  });
  showToast(window._t ? window._t('notifyFirst') : "We'll notify you first ✓");
  closeNotify();
}
document.getElementById('notifyOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeNotify();
});

// closeCheckout — hides the checkout overlay and resets the step counter
let coStep = 1;
var coLabels = ['Continue to Shipping →', 'Continue to Payment →', 'Place Order →'];

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('visible');
  setTimeout(() => { coStep = 1; renderCoSteps(); }, 400);
}

// renderCoSteps — updates checkout step indicators and shows the correct form page
function renderCoSteps() {
  document.querySelectorAll('.checkout-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active','done');
    if (n === coStep) s.classList.add('active');
    else if (n < coStep) s.classList.add('done');
  });
  document.querySelectorAll('.co-page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('co-step-'+coStep);
  if (pg) pg.classList.add('active');
  const nextBtn = document.getElementById('coNextBtn');
  const backBtn = document.getElementById('coBackBtn');
  nextBtn.textContent = coLabels[coStep - 1];
  backBtn.style.visibility = coStep > 1 ? 'visible' : 'hidden';
}

// coNext — advances the checkout to the next step or places the order on step 3
function coNext() {
  if (coStep < 3) {
    coStep++;
    renderCoSteps();
  } else {
    document.getElementById('coFormWrap').style.display = 'none';
    document.getElementById('coSuccess').style.display = 'block';
    state.cart = [];
    updateCart();
    document.getElementById('coOrderNum').textContent =
      'Order #DRV-001-' + String(Math.floor(Math.random()*900)+100);
  }
}

// coBack — goes back to the previous checkout step
function coBack() {
  if (coStep > 1) { coStep--; renderCoSteps(); }
}

document.getElementById('checkoutOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCheckout();
});

// renderCollection — renders the product grid filtered by the given category string
const bgClasses = ['cv-1','cv-2','cv-3'];
function renderCollection(filter) {
  const grid = document.getElementById('productGrid');
  const filtered = filter==='all'    ? products
    : filter==='drop'                 ? products.filter(p=>p.drop)
    : filter==='core'                 ? products.filter(p=>p.core)
    : products.filter(p=>p.cat===filter);

  if (filtered.length === 0) {
    const _nothing = window._t ? window._t('nothingHere') : 'Nothing here yet. Check back soon.';
    grid.innerHTML = `<div style="grid-column:1/-1;padding:80px;text-align:center;color:var(--grey-400);font-size:14px">${_nothing}</div>`;
    return;
  }

  const _quickAdd  = window._t ? window._t('quickAdd')  : 'Quick Add';
  const _notifyMe  = window._t ? window._t('notifyMe')  : 'Notify Me';
  grid.innerHTML = filtered.map((p,i) => `
    <div class="full-product-card" onclick="${p.sold ? 'openNotify()' : `navigate('${p.page||'pdp'}')`}">
      <div class="full-product-card-bg ${p.img ? '' : bgClasses[i%3]}" style="${p.img ? 'background:none' : ''}">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${p.imgPos||'center'};transition:transform .7s var(--ease-out)" />` : ''}
        <div class="full-product-overlay"></div>
        ${p.drop ? '<span class="product-badge badge-drop">Drop 002</span>' : ''}
        ${p.core ? '<span class="product-badge badge-core">Core Edition</span>' : ''}
        ${p.sold ? '<span class="product-badge badge-sold" style="top:auto;bottom:70px">Sold Out</span>' : ''}
        <div class="quick-add">${p.sold ? _notifyMe : _quickAdd}</div>
      </div>
      <div class="full-product-info">
        <div class="full-product-name">${p.name}</div>
        <div class="full-product-price">CHF ${p.price}.–</div>
      </div>
    </div>
  `).join('');
}

// keyboard shortcuts — closes any open overlay when Escape is pressed
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSizeGuide();
    closeNotify();
    closeCheckout();
    closeCart();
  }
});

// card number formatter — auto-formats card number and expiry inputs in the checkout
document.addEventListener('input', e => {
  if (e.target.placeholder === '1234 5678 9012 3456') {
    let v = e.target.value.replace(/\D/g,'').substring(0,16);
    e.target.value = v.replace(/(.{4})/g,'$1 ').trim();
  }
  if (e.target.placeholder === 'MM / YY') {
    let v = e.target.value.replace(/\D/g,'').substring(0,4);
    if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2);
    e.target.value = v;
  }
});

// intro loader — hides the loader after 1.6 seconds and triggers the hero animation
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    animateHeroHeadline();
  }, 1600);
});

/* ── Shopify Checkout ── */
// Shopify product variant map — maps page keys to Shopify product IDs
let _shopifyClient = null;
const _shopifyProductVariants = {
  'pdp':           { id: '15865888866685', variants: [] },
  'hoodie-blue':   { id: '15633560633725', variants: [] },
  'hoodie-black':  { id: '15633555849597', variants: [] },
};

// Shopify SDK loader — dynamically loads the Storefront SDK and fetches product variants
(function() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  script.onload = function() {
    _shopifyClient = ShopifyBuy.buildClient({
      domain: 'fwb21g-6r.myshopify.com',
      storefrontAccessToken: 'bad846b7ce03656330b4a44a23cd0630',
    });
    Object.keys(_shopifyProductVariants).forEach(function(key) {
      const entry = _shopifyProductVariants[key];
      _shopifyClient.product.fetch('gid://shopify/Product/' + entry.id).then(function(product) {
        if (!product) return;
        entry.variants = product.variants;
        updateSizeAvailability(key, product.variants);
      });
    });
  };
  document.head.appendChild(script);
})();

// updateSizeAvailability — marks size buttons as sold-out based on Shopify variant availability
function updateSizeAvailability(pageKey, variants) {
  const pageMap = { 'pdp': 'page-pdp', 'hoodie-blue': 'page-hoodie-blue', 'hoodie-black': 'page-hoodie-black' };
  const pageId = pageMap[pageKey];
  if (!pageId) return;
  const page = document.getElementById(pageId);
  if (!page) return;
  page.querySelectorAll('.size-btn').forEach(function(btn) {
    const size = btn.textContent.trim().toUpperCase();
    const variant = variants.find(function(v) {
      return v.selectedOptions && v.selectedOptions.some(function(o) {
        return o.name.toLowerCase() === 'size' && o.value.toUpperCase() === size;
      });
    });
    if (variant && !variant.available) {
      btn.classList.add('sold-out');
      btn.title = 'Sold out';
    } else {
      btn.classList.remove('sold-out');
      btn.title = '';
    }
  });
}

// openCheckout — creates a Shopify checkout with current cart items and redirects to it
function openCheckout() {
  if (state.cart.length === 0) { showToast(window._t ? window._t('cartEmpty') : 'Your cart is empty'); return; }
  closeCart();
  if (!_shopifyClient) { showToast('Connecting to store…'); return; }

  const lineItems = state.cart.map(function(item) {
    const productEntry = _shopifyProductVariants[item.page] || _shopifyProductVariants['pdp'];
    const variants = productEntry.variants;
    const variant = variants.find(function(v) {
      return v.selectedOptions && v.selectedOptions.some(function(o) {
        return o.name.toLowerCase() === 'size' && o.value.toUpperCase() === (item.size || '').toUpperCase();
      });
    }) || variants[0];
    return { variantId: variant ? variant.id : null, quantity: 1 };
  }).filter(function(li) { return li.variantId; });

  if (lineItems.length === 0) { showToast('Could not match size — try again'); return; }

  _shopifyClient.checkout.create({ lineItems: lineItems }).then(function(checkout) {
    window.location.href = checkout.webUrl;
  }).catch(function() { showToast('Checkout error — please try again'); });
}

/* ── Inventory ── */
// UPDATE THIS NUMBER after each order
const UNITS_REMAINING = 91;
const INVENTORY_TOTAL = 100;

function initInventory() {
  var r = UNITS_REMAINING;
  var lang = localStorage.getItem('driven_lang') || 'en';
  var pct = (r / INVENTORY_TOTAL * 100).toFixed(1) + '%';

  document.querySelectorAll('.stock-fill').forEach(function(el) { el.style.width = pct; });

  var stockLabel = document.getElementById('stockLabelCount');
  if (stockLabel) stockLabel.textContent = r + ' / ' + INVENTORY_TOTAL;

  var proofRem = document.getElementById('proofRemaining');
  if (proofRem) proofRem.textContent = r;

  var stickySub = document.getElementById('stickyCTASub');
  if (stickySub) {
    stickySub.setAttribute('data-en', 'Only ' + r + ' units remaining');
    stickySub.setAttribute('data-de', 'Nur noch ' + r + ' Stück verfügbar');
    stickySub.textContent = lang === 'de' ? 'Nur noch ' + r + ' Stück verfügbar' : 'Only ' + r + ' units remaining';
  }

  var coNote = document.getElementById('checkoutUnitsLeft');
  if (coNote) {
    coNote.setAttribute('data-en', r + ' units left. Your order holds your unit for 10 minutes.');
    coNote.setAttribute('data-de', 'Noch ' + r + ' Einheiten verfügbar. Deine Bestellung reserviert deine Einheit für 10 Minuten.');
    coNote.textContent = lang === 'de' ? 'Noch ' + r + ' Einheiten verfügbar. Deine Bestellung reserviert deine Einheit für 10 Minuten.' : r + ' units left. Your order holds your unit for 10 minutes.';
  }

  document.querySelectorAll('.units-left-count').forEach(function(el) {
    el.setAttribute('data-en', r + ' units left');
    el.setAttribute('data-de', r + ' Stück verbleibend');
    el.textContent = lang === 'de' ? r + ' Stück verbleibend' : r + ' units left';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initInventory, 120); });
} else {
  setTimeout(initInventory, 120);
}

// cookie banner IIFE — shows the cookie consent banner if consent has not been given
(function() {
  const consent = localStorage.getItem('driven_cookie_consent');
  if (!consent) {
    const banner = document.getElementById('cookieBanner');
    banner.style.display = 'block';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { banner.classList.add('visible'); });
    });
  }
})();

// acceptCookies — records acceptance and hides the cookie banner
function acceptCookies() {
  localStorage.setItem('driven_cookie_consent', 'accepted');
  closeCookieBanner();
}

// declineCookies — records decline and hides the cookie banner
function declineCookies() {
  localStorage.setItem('driven_cookie_consent', 'declined');
  closeCookieBanner();
}

// closeCookieBanner — animates the cookie banner out and hides it
function closeCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  banner.classList.remove('visible');
  setTimeout(function() { banner.style.display = 'none'; }, 500);
}

/* ── Init ── */
setupReveal();
handleParallax();
