/* ═══════════════════════════════════════════
   ERAMAA ÄRIPARK — main.js
   ═══════════════════════════════════════════ */

// ── FLOATING NAV: active section highlight ──
const sections = ['intro','spaces','why','energy','stats','location','contact'];
const navLinks = document.querySelectorAll('.fnav-link');

const navMap = {
  intro:    0,
  spaces:   1,
  why:      1,
  energy:   2,
  stats:    2,
  location: 3,
  contact:  4
};

function updateNav() {
  let active = 'intro';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.4) active = id;
  });
  navLinks.forEach((l, i) => l.classList.toggle('active', i === (navMap[active] ?? 0)));
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── SMOOTH SCROLL for all anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Also handle fnav-link click (they use href attr)
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── SCROLL NEXT button ──
window.scrollNext = function () {
  const sections = document.querySelectorAll('section, footer');
  for (const sec of sections) {
    const rect = sec.getBoundingClientRect();
    if (rect.top > 80) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
  }
};

// ── REVEAL on scroll ──
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('up');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObs.observe(el));

// ── PARALLAX IMAGES ──
// scale: CSS over-zoom so the image never shows edges when shifted
// speed: fraction of center-offset to shift (0.1 = subtle, 0.2 = strong)
const parallaxMap = [
  { sel: '.intro-img-1 img',    scale: 1.18, speed: 0.18 },
  { sel: '.intro-img-2 img',    scale: 1.12, speed: 0.12 },
  { sel: '.space-img img',      scale: 1.12, speed: 0.10 },
  { sel: '.why-img-wrap img',   scale: 1.10, speed: 0.10 },
  { sel: '.energy-img img',     scale: 1.10, speed: 0.10 },
  { sel: '.location-img > img', scale: 1.10, speed: 0.10 },
];

const parallaxItems = [];
parallaxMap.forEach(({ sel, scale, speed }) => {
  document.querySelectorAll(sel).forEach(el => {
    parallaxItems.push({ el, scale, speed });
  });
});

(function tickParallax() {
  const vh = window.innerHeight;
  parallaxItems.forEach(({ el, scale, speed }) => {
    const rect = el.parentElement.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh * 2) return;
    const centerOffset = rect.top + rect.height / 2 - vh / 2;
    const shift = centerOffset * speed;
    el.style.transform = `scale(${scale}) translateY(${shift}px)`;
  });
  requestAnimationFrame(tickParallax);
})();

// ── SCROLL-DRIVEN MOTION ANIMATIONS ──

// Ease: cubic out
function easeOut3(t) { return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3); }

// ① Split hero headline lines — fly apart as you scroll out of hero
(function initHeroSplit() {
  const h1 = document.querySelector('.intro-headline');
  if (!h1) return;
  // Each <br>-separated line gets its own span with alternating direction
  const dirs = [-1, 1, -1]; // left, right, left
  const parts = h1.innerHTML.split(/<br\s*\/?>/i);
  h1.innerHTML = parts.map((p, i) =>
    `<span class="hl-line" data-dir="${dirs[i] ?? 1}" style="display:inline-block;will-change:transform,opacity">${p}</span>`
  ).join('<br>');
})();

// ② Manifesto words are pre-split in HTML as .mw spans

// ③ Space items — tag each half for slide-in direction
document.querySelectorAll('.space-item').forEach(item => {
  const isRev = item.classList.contains('reverse');
  const img  = item.querySelector('.space-img');
  const body = item.querySelector('.space-body');
  if (img)  img.dataset.slideDir  = isRev ? '1' : '-1';
  if (body) body.dataset.slideDir = isRev ? '-1' : '1';
  // start hidden (will be driven by JS, bypassing the CSS reveal for these)
  if (img)  { img.style.opacity = '0'; img.style.willChange = 'transform,opacity'; }
  if (body) { body.style.opacity = '0'; body.style.willChange = 'transform,opacity'; }
});

// ④ Why items — stagger slide from right
document.querySelectorAll('.why-item').forEach(item => {
  item.style.opacity = '0';
  item.style.willChange = 'transform,opacity';
});

// Master animation tick
(function tickMotion() {
  const vh = window.innerHeight;
  const sy = window.scrollY;

  // ① Hero headline fly-apart
  document.querySelectorAll('.hl-line').forEach(line => {
    const progress = Math.min(sy / (vh * 0.65), 1);
    const e = easeOut3(progress);
    const dir = parseFloat(line.dataset.dir);
    line.style.transform = `translateX(${e * dir * 12}vw)`;
    line.style.opacity    = String(1 - e * 0.55);
  });

  // ② Manifesto word-by-word reveal
  const mp = document.querySelector('.manifesto-text');
  if (mp) {
    const words = mp.querySelectorAll('.mw');
    const rect  = mp.getBoundingClientRect();
    const secProgress = Math.min(Math.max(1 - rect.top / (vh * 0.75), 0), 1);
    words.forEach((w, i) => {
      const stagger  = i / Math.max(words.length - 1, 1);
      const wp = easeOut3(Math.min(Math.max((secProgress - stagger * 0.45) / 0.55, 0), 1));
      w.style.opacity   = String(wp);
      w.style.transform = `translateY(${(1 - wp) * 18}px)`;
      w.style.display   = 'inline-block';
      w.style.willChange = 'transform,opacity';
    });
  }

  // ③ Space item halves slide in from opposite sides
  document.querySelectorAll('.space-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    const p = easeOut3(Math.min(Math.max((vh - rect.top) / (vh * 0.65), 0), 1));
    ['.space-img', '.space-body'].forEach(sel => {
      const el = item.querySelector(sel);
      if (!el || !el.dataset.slideDir) return;
      const dir = parseFloat(el.dataset.slideDir);
      el.style.transform = `translateX(${(1 - p) * dir * 7}vw)`;
      el.style.opacity   = String(0.2 + p * 0.8);
    });
  });

  // ④ Why items stagger from right
  const whyItems = document.querySelectorAll('.why-item');
  whyItems.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    const raw  = Math.min(Math.max((vh * 0.92 - rect.top) / (vh * 0.35), 0), 1);
    const stag = Math.max(raw - i * 0.12, 0);
    const p    = easeOut3(stag);
    item.style.opacity   = String(p);
    item.style.transform = `translateX(${(1 - p) * 5}vw)`;
  });

  // ⑤ Stats cells pop in with scale
  document.querySelectorAll('.stat-cell').forEach((cell, i) => {
    const rect = cell.getBoundingClientRect();
    const raw  = Math.min(Math.max((vh * 0.9 - rect.top) / (vh * 0.3), 0), 1);
    const stag = Math.max(raw - i * 0.15, 0);
    const p    = easeOut3(stag);
    cell.style.opacity   = String(p);
    cell.style.transform = `translateY(${(1 - p) * 24}px) scale(${0.92 + p * 0.08})`;
    cell.style.willChange = 'transform,opacity';
  });

  requestAnimationFrame(tickMotion);
})();

// ── MOBILE BURGER MENU ──
(function() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  function openMenu() {
    burger.classList.add('open');
    menu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('open');
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('.mmenu-link, .mmenu-cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

// ── CUSTOM CURSOR ──
(function() {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  // Grow ring on clickable elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [onclick], .space-cta, .proj-item, .panel')) {
      ring.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [onclick], .space-cta, .proj-item, .panel')) {
      ring.classList.remove('hovered');
    }
  });

  (function animateCursor() {
    dot.style.transform  = `translate(${mx}px, ${my}px)`;
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(animateCursor);
  })();
})();

// ── PHOTO LIGHTBOX ON HOVER ──
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'photo-overlay';
  overlay.innerHTML = `
    <div id="photo-overlay-bg"></div>
    <img id="photo-overlay-img" alt="">
    <button id="photo-overlay-close" aria-label="Sulge">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="2" y1="2" x2="16" y2="16" stroke="#053732" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="2" x2="2" y2="16" stroke="#053732" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>`;
  document.body.appendChild(overlay);

  const oImg = document.getElementById('photo-overlay-img');

  document.querySelectorAll('.space-img').forEach(el => {
    el.style.cursor = 'none';
    el.addEventListener('click', () => {
      const src = el.querySelector('img:not(.photo-badge)').src;
      oImg.src = src;
      overlay.classList.add('visible');
    });
  });

  document.getElementById('photo-overlay-bg').addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  document.getElementById('photo-overlay-close').addEventListener('click', e => {
    e.stopPropagation();
    overlay.classList.remove('visible');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.remove('visible');
  });
})();

// ── CONTACT FORM ──
function handleSubmit(e) {
  e.preventDefault();
  const success = document.getElementById('form-success');
  success.classList.add('visible');
  e.target.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
}
