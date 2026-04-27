// revealObserver — IntersectionObserver that adds 'visible' class to .reveal elements when they enter the viewport
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// setupReveal — re-observes all reveal elements (called on page navigation)
function setupReveal() {
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => {
    el.classList.remove('visible');
    revealObserver.observe(el);
  });
}

// animateCountUp — animates a number element counting up from 0 to its data-target value
function animateCountUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now-start)/duration, 1);
    const ease = 1 - Math.pow(1-p, 3);
    el.textContent = Math.floor(ease*target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// countUpObserver — observes .count-up elements and triggers animateCountUp when they enter view
const countUpObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = '1';
      animateCountUp(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count-up').forEach(el => countUpObserver.observe(el));

// handleParallax — applies vertical translate to .parallax elements based on scroll position (desktop only)
function handleParallax() {
  if (window.innerWidth <= 1024) {
    document.querySelectorAll('.parallax').forEach(el => { el.style.transform = ''; });
    return;
  }
  document.querySelectorAll('.parallax').forEach(el => {
    const speed  = parseFloat(el.dataset.speed || .05);
    const rect   = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    el.style.transform = `translateY(${Math.round(center * speed)}px)`;
  });
}
window.addEventListener('scroll', handleParallax, { passive: true });
window.addEventListener('resize', handleParallax, { passive: true });

// animateHeroHeadline — marks the hero headline as split and sets opacity after loader
function animateHeroHeadline() {
  const headline = document.querySelector('#page-home .hero-headline');
  if (!headline || headline.dataset.split) return;
  headline.dataset.split = '1';
  headline.style.opacity = '1';
}

// wiggle keyframe injection — dynamically adds the wiggle @keyframes rule to the document head
const wiggleStyle = document.createElement('style');
wiggleStyle.textContent = `@keyframes wiggle{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
document.head.appendChild(wiggleStyle);
