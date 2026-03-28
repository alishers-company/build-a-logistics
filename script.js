/* FreightLink — Main JavaScript */
'use strict';

/* ── Mobile nav toggle ── */
const menuButton = document.querySelector('[data-testid="mobile-nav-toggle"]');
const nav = document.querySelector('[data-testid="primary-nav"]');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav?.classList.toggle('is-open');
});

/* Close mobile nav when a link is clicked */
nav?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

/* Close mobile nav on outside click */
document.addEventListener('click', (e) => {
  if (nav?.classList.contains('is-open')) {
    if (!nav.contains(e.target) && !menuButton?.contains(e.target)) {
      nav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  }
});

/* ── Smooth scrolling ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = 80; /* header height */
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Scroll-triggered fade-in ── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.feature-card, .article-card, .who-card, .three-col-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.42s ease ${i * 0.05}s, transform 0.42s ease ${i * 0.05}s`;
  fadeObserver.observe(el);
});

/* ── Category tab filtering (Library) ── */
document.querySelectorAll('[data-tab-group="library"] .cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-tab-group="library"] .cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.getAttribute('data-filter');
    filterArticles(filter);
  });
});

/* ── Load board: express interest ── */
document.querySelectorAll('[data-action="express-interest"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Interest Sent ✓';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  });
});

/* ── Driver Profile Modal ── */
const modal    = document.getElementById('profile-modal');
const modalNext = document.getElementById('modal-next');
const modalBack = document.getElementById('modal-back');
let currentStep = 1;
const totalSteps = 3;

function openModal() {
  modal?.classList.add('is-open');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  currentStep = 1;
  showStep(1);
}

function closeModal() {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  /* Reset form after close */
  setTimeout(() => {
    const success = modal?.querySelector('.success-message');
    if (success) success.remove();
    const stepContent = modal?.querySelectorAll('.modal-step-content');
    stepContent?.forEach((el, i) => el.classList.toggle('hidden', i !== 0));
    const stepsEl = modal?.querySelectorAll('.step');
    stepsEl?.forEach((s, i) => {
      s.classList.toggle('active', i === 0);
      s.classList.remove('completed');
    });
    currentStep = 1;
    if (modalNext) { modalNext.textContent = 'Next Step →'; modalNext.style.display = ''; }
    if (modalBack) modalBack.style.display = 'none';
  }, 250);
}

function showStep(step) {
  for (let i = 1; i <= totalSteps; i++) {
    const content = document.getElementById(`step-${i}-content`);
    const stepEl  = modal?.querySelector(`.step[data-step="${i}"]`);
    if (content) content.classList.toggle('hidden', i !== step);
    if (stepEl) {
      stepEl.classList.toggle('active', i === step);
      if (i < step) stepEl.classList.add('completed');
    }
  }
  if (modalBack) modalBack.style.display = step > 1 ? 'inline-flex' : 'none';
  if (modalNext) {
    modalNext.textContent = step < totalSteps ? 'Next Step →' : 'Create Profile';
  }
}

modalNext?.addEventListener('click', () => {
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    /* Final step: show success */
    showSuccess();
  }
});

modalBack?.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});

function showSuccess() {
  const body = modal?.querySelector('.modal-body');
  if (!body) return;
  body.innerHTML = `
    <div class="success-message">
      <div class="success-icon">🎉</div>
      <h3>Profile Created!</h3>
      <p>Your driver profile is live. Start browsing loads on your preferred routes.</p>
      <br>
      <a href="#load-posting-and-browsing" class="btn-primary" style="display:inline-flex;margin-top:8px;" onclick="closeModal()">Browse Available Loads</a>
    </div>`;
}

/* Open modal from any [data-action="create-profile"] button */
document.querySelectorAll('[data-action="create-profile"]').forEach(btn => {
  btn.addEventListener('click', openModal);
});

/* Close modal */
document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
  btn.addEventListener('click', closeModal);
});

/* Close modal on overlay click */
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

/* Close modal on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
});

/* ── Radio card selection in modal ── */
document.querySelectorAll('.radio-grid .radio-card').forEach(card => {
  card.addEventListener('click', () => {
    card.closest('.radio-grid')?.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

/* ── Sign in stub ── */
document.querySelectorAll('[data-action="sign-in"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Coming soon';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }, 2000);
  });
});

/* ── Chat send stub ── */
document.querySelectorAll('[data-action="send-message"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.chat-input-row')?.querySelector('.chat-input');
    if (!input || !input.value.trim()) return;
    const messages = btn.closest('.chat-mock')?.querySelector('.chat-messages');
    if (messages) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg me';
      msg.textContent = input.value.trim();
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }
    input.value = '';
  });
});

/* ── Load and render articles from JSON ── */
async function loadArticles() {
  try {
    const res = await fetch('./assets/articles.json');
    const articles = await res.json();
    window._articles = articles;
    renderArticles(articles);
  } catch (e) {
    const grid = document.getElementById('article-grid');
    if (grid) grid.innerHTML = '<p style="color:var(--muted);font-size:13px;">Unable to load articles.</p>';
  }
}

function renderArticles(articles) {
  const grid = document.getElementById('article-grid');
  if (!grid) return;
  grid.innerHTML = articles.map((a, i) => `
    <article class="article-card" data-category="${a.category}" style="animation-delay:${i * 0.06}s">
      <div class="article-thumb" style="background:${a.thumb || '#e8d5c4'}">
        <span class="article-cat">${capitalize(a.category)}</span>
      </div>
      <div class="article-body">
        <h3 class="article-title">${a.title}</h3>
        <p class="article-meta">${a.readTime} &middot; ${a.audience}</p>
      </div>
    </article>
  `).join('');

  /* Re-attach fade observer for newly created cards */
  grid.querySelectorAll('.article-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.38s ease ${i * 0.06}s, transform 0.38s ease ${i * 0.06}s`;
    fadeObserver.observe(el);
  });
}

function filterArticles(filter) {
  const all = window._articles || [];
  const filtered = filter === 'all' ? all : all.filter(a => a.category === filter);
  renderArticles(filtered);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

loadArticles();
