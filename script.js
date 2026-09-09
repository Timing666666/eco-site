const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#primary-menu');

if (navToggle && navMenu) {
  const setMenuOpen = (isOpen) => {
    navMenu.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.querySelector('.sr-only').textContent = isOpen ? '關閉導覽選單' : '開啟導覽選單';
    document.body.classList.toggle('nav-open', isOpen);
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) setMenuOpen(false);
  });

  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

const header = document.querySelector('.site-header');
const sectionLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
const linkedSections = sectionLinks.map((link) => document.querySelector(link.hash));
let scrollFrame = 0;

const updateScrollState = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
    header.style.setProperty('--scroll-progress', progress);
  }

  let currentSection = -1;
  const marker = (header?.offsetHeight || 72) + 48;
  linkedSections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= marker) currentSection = index;
  });
  if (scrollableHeight > 0 && window.scrollY >= scrollableHeight - 2) {
    currentSection = linkedSections.length - 1;
  }
  sectionLinks.forEach((link, index) => {
    if (index === currentSection) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollFrame = 0;
};

const scheduleScrollUpdate = () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
};

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('load', scheduleScrollUpdate);
updateScrollState();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningReveals = new Set();

// Animate only on entry; content remains visible if scripts or observation fail.
if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (reducedMotion.matches) return;
      const isCard = entry.target.matches('.action-card, .stat-item');
      const index = isCard ? Array.from(entry.target.parentElement.children).indexOf(entry.target) : 0;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 600,
        delay: Math.min(index, 3) * 75,
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        fill: 'backwards'
      });
      runningReveals.add(animation);
      const release = () => runningReveals.delete(animation);
      animation.addEventListener('finish', release, { once: true });
      animation.addEventListener('cancel', release, { once: true });
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.section-heading, .action-card, .impact-inner > div:first-child, .stat-item, .cta-content, .contact-card, .contact-form').forEach((element) => {
    revealObserver.observe(element);
  });
}

reducedMotion.addEventListener('change', (event) => {
  if (event.matches) runningReveals.forEach((animation) => animation.cancel());
});

document.addEventListener('focusin', (event) => {
  runningReveals.forEach((animation) => {
    if (animation.effect.target.contains(event.target)) animation.cancel();
  });
});

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.reset();
    alert('感謝你的來信，我們會盡快與你聯繫。');
  });
}
