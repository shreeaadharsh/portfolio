/* ═══════════════════════════════════════════════════════════════════════════
   SHREE AADHARSH K — PORTFOLIO JS
   Premium Vanilla JS — No external libraries
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. UTILITY ────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ─── 2. LOADER ─────────────────────────────────────────────────────────── */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  const texts = ['Initializing...', 'Loading assets...', 'Almost ready...'];
  const textEl = loader.querySelector('.loader-text');
  let i = 0;
  const interval = setInterval(() => {
    i = (i + 1) % texts.length;
    if (textEl) textEl.textContent = texts[i];
  }, 600);

  const done = () => {
    clearInterval(interval);
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger hero animations
    triggerHeroAnimations();
  };

  // Hide after 1.9s (CSS animation duration), or on load
  if (document.readyState === 'complete') {
    setTimeout(done, 1900);
  } else {
    window.addEventListener('load', () => setTimeout(done, 1200));
  }

  document.body.style.overflow = 'hidden';
})();

function triggerHeroAnimations() {
  const heroEls = $$('[data-animate]', document.getElementById('hero') || document);
  heroEls.forEach(el => {
    const delay = parseInt(el.dataset.delay || '0');
    setTimeout(() => el.classList.add('animated'), delay);
  });
}

/* ─── 3. CANVAS BACKGROUND ──────────────────────────────────────────────── */
(function initBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const PARTICLE_COUNT = 55;
  const COLORS = [
    'rgba(56,189,248,0.5)',
    'rgba(129,140,248,0.45)',
    'rgba(52,211,153,0.35)',
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 20;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(0.15 + Math.random() * 0.35);
      this.r  = 1 + Math.random() * 1.5;
      this.alpha = 0.2 + Math.random() * 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life  = 0;
      this.maxLife = 300 + Math.random() * 400;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -20) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < 0.15
        ? progress / 0.15
        : progress > 0.8
          ? 1 - (progress - 0.8) / 0.2
          : 1;
      ctx.save();
      ctx.globalAlpha = this.alpha * fade;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.12;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = 'rgba(56,189,248,0.8)';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(render);
  }

  init();
  render();

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
})();

/* ─── 4. CUSTOM CURSOR ──────────────────────────────────────────────────── */
(function initCursor() {
  const follower = document.getElementById('cursorFollower');
  const dot      = document.getElementById('cursorDot');
  if (!follower || !dot) return;

  // Only on non-touch devices
  if ('ontouchstart' in window) {
    follower.style.display = 'none';
    dot.style.display      = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let animId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateCursor() {
    followerX = lerp(followerX, mouseX, 0.10);
    followerY = lerp(followerY, mouseY, 0.10);
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    animId = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects
  const interactives = $$('a, button, .project-card, .skill-tag, .social-chip');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width  = '52px';
      follower.style.height = '52px';
      follower.style.borderColor = 'rgba(56,189,248,0.7)';
      follower.style.background  = 'rgba(56,189,248,0.06)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width  = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(56,189,248,0.5)';
      follower.style.background  = 'transparent';
    });
  });

  window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
})();

/* ─── 5. NAVBAR ─────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');
  if (!navbar) return;

  // Scroll opacity
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileNav.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    $$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section highlighting
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: `-${72}px 0px -60% 0px`, threshold: 0 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ─── 6. HERO TYPEWRITER TITLES ─────────────────────────────────────────── */
(function initTypewriter() {
  const titles = ['Software Developer', 'AI / ML Engineer', 'Full Stack Developer', 'Backend Engineer'];
  const container = document.querySelector('.hero-titles');
  if (!container) return;

  const titleEl = container.querySelector('.title-item');
  if (!titleEl) return;

  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId;

  function type() {
    const current = titles[currentIndex];

    if (!isDeleting) {
      titleEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        timeoutId = setTimeout(type, 1800); // pause at end
        return;
      }
      timeoutId = setTimeout(type, 60);
    } else {
      titleEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % titles.length;
        timeoutId = setTimeout(type, 300);
        return;
      }
      timeoutId = setTimeout(type, 35);
    }
  }

  // Wait for hero animations, then start
  setTimeout(type, 1500);

  // Add cursor blink
  const cursor = document.createElement('span');
  cursor.style.cssText = `
    display: inline-block; width: 2px; height: 1.1em;
    background: #38bdf8; margin-left: 2px;
    vertical-align: middle;
    animation: blink 1s step-end infinite;
  `;
  const style = document.createElement('style');
  style.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
  document.head.appendChild(style);
  container.appendChild(cursor);
})();

/* ─── 7. SCROLL-REVEAL ───────────────────────────────────────────────────── */
(function initScrollReveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0');
        setTimeout(() => el.classList.add('revealed'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ─── 8. COUNTER ANIMATION ───────────────────────────────────────────────── */
(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target || '0');
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + '+';
    }
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─── 9. IDENTITY CARD MOUSE PARALLAX ───────────────────────────────────── */
(function initIdentityParallax() {
  const wrapper = document.getElementById('identityWrapper');
  const card    = wrapper?.querySelector('.identity-card');
  if (!wrapper || !card) return;

  let animId;
  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let isHovered = false;

  function animate() {
    if (isHovered) {
      currentRX = lerp(currentRX, targetRX, 0.08);
      currentRY = lerp(currentRY, targetRY, 0.08);
    } else {
      currentRX = lerp(currentRX, 0, 0.05);
      currentRY = lerp(currentRY, 0, 0.05);
    }
    card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(20px)`;
    animId = requestAnimationFrame(animate);
  }

  wrapper.addEventListener('mousemove', e => {
    isHovered = true;
    const rect  = wrapper.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    targetRY    = clamp(dx * 14, -14, 14);
    targetRX    = clamp(-dy * 10, -10, 10);
  });

  wrapper.addEventListener('mouseleave', () => { isHovered = false; });

  card.style.transformStyle = 'preserve-3d';
  card.style.transition = 'box-shadow 0.3s ease';
  animate();

  window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
})();

/* ─── 10. MAGNETIC BUTTON EFFECT ─────────────────────────────────────────── */
(function initMagneticButtons() {
  const magneticEls = $$('.magnetic');

  magneticEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform  = 'translate(0, 0)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });

    el.addEventListener('mouseenter', () => { el.style.transition = ''; });
  });
})();

/* ─── 11. PROJECT CARD GLOW ──────────────────────────────────────────────── */
(function initProjectGlow() {
  const cards = $$('.project-card:not(.project-placeholder)');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = ((e.clientX - rect.left) / rect.width)  * 100;
      const y     = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });
  });
})();

/* ─── 12. SKILL TAGS STAGGER ─────────────────────────────────────────────── */
(function initSkillsStagger() {
  const categories = $$('.skill-category');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = $$('.skill-tag', entry.target);
        tags.forEach((tag, i) => {
          tag.style.opacity    = '0';
          tag.style.transform  = 'translateY(10px)';
          tag.style.transition = `opacity 0.4s ease ${i * 40}ms, transform 0.4s ease ${i * 40}ms`;
          setTimeout(() => {
            tag.style.opacity   = '1';
            tag.style.transform = 'translateY(0)';
          }, 50);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  categories.forEach(cat => observer.observe(cat));
})();

/* ─── 13. CONTACT FORM ───────────────────────────────────────────────────── */
(function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn    = document.getElementById('contactSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.contactName.value.trim();
    const email   = form.contactEmail.value.trim();
    const subject = form.contactSubject.value.trim();
    const message = form.contactMessage.value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all fields.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Build mailto link
    const mailtoLink = `mailto:shreeaadharsh4@gmail.com?subject=${encodeURIComponent(subject + ' — from ' + name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Opening...';

    setTimeout(() => {
      window.location.href = mailtoLink;
      showStatus('✓ Your email client has been opened. Thank you!', 'success');
      form.reset();
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Send Message';
    }, 600);
  });

  function showStatus(msg, type) {
    status.textContent  = msg;
    status.className    = 'form-status ' + type;
    setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 5000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Input focus effects
  $$('.form-input, .form-textarea').forEach(input => {
    const group = input.closest('.form-group');
    const label = group?.querySelector('.form-label');
    if (!label) return;

    input.addEventListener('focus',  () => label.style.color = 'var(--clr-accent)');
    input.addEventListener('blur',   () => label.style.color = '');
  });
})();

/* ─── 14. HERO SECTION PARALLAX (subtle) ─────────────────────────────────── */
(function initHeroParallax() {
  const hero  = document.getElementById('hero');
  const orbs  = $$('.bg-gradient-orb');
  if (!hero) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 0.04;
          orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── 15. SECTION ENTRY ANIMATIONS (stagger children) ────────────────────── */
(function initSectionAnimations() {
  // Stagger project cards
  const projectCards = $$('.project-card');
  const projectObs   = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = $$('.project-card');
        cards.forEach((card, i) => {
          card.style.opacity    = '0';
          card.style.transform  = 'translateY(24px)';
          card.style.transition = `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`;
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        });
        projectObs.disconnect();
      }
    });
  }, { threshold: 0.1 });

  const projSection = document.getElementById('projects');
  if (projSection) projectObs.observe(projSection);

  // Stagger timeline items
  const timelineItems = $$('.timeline-item');
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        timelineItems.forEach((item, i) => {
          item.style.opacity    = '0';
          item.style.transform  = 'translateX(-20px)';
          item.style.transition = `opacity 0.5s ease ${i * 120}ms, transform 0.5s ease ${i * 120}ms`;
          setTimeout(() => {
            item.style.opacity   = '1';
            item.style.transform = 'translateX(0)';
          }, 50);
        });
        tlObs.disconnect();
      }
    });
  }, { threshold: 0.1 });

  const expSection = document.getElementById('experience');
  if (expSection) tlObs.observe(expSection);
})();

/* ─── 16. ACTIVE NAV HIGHLIGHT ON SCROLL ─────────────────────────────────── */
// Already handled in navbar section via IntersectionObserver

/* ─── 17. KEYBOARD ACCESSIBILITY ─────────────────────────────────────────── */
(function initKeyboard() {
  // Close mobile nav with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const mobileNav = document.getElementById('mobileNav');
      const hamburger = document.getElementById('hamburger');
      if (mobileNav?.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        hamburger?.focus();
      }
    }
  });
})();

/* ─── 18. SMOOTH HOVER ON SOCIAL CHIPS (ripple effect) ───────────────────── */
(function initRipple() {
  const rippleEls = $$('.social-chip, .btn-hire');

  rippleEls.forEach(el => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    el.addEventListener('click', function(e) {
      const rect   = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: rgba(56,189,248,0.2);
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
        transform: scale(0);
        animation: rippleAnim 0.5s ease-out forwards;
        pointer-events: none;
      `;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inject ripple animation
  const s = document.createElement('style');
  s.textContent = '@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }';
  document.head.appendChild(s);
})();

/* ─── 19. PERFORMANCE: pause animations when tab not visible ─────────────── */
document.addEventListener('visibilitychange', () => {
  const canvas = document.getElementById('bgCanvas');
  if (canvas) canvas.style.animationPlayState =
    document.hidden ? 'paused' : 'running';
});

/* ─── 20. PROJECT CASE STUDY MODAL SYSTEM ──────────────────────────────── */
(function initProjectModal() {
  const modal = $('#projectModal');
  const modalContainer = $('#modalContainer');
  const modalContent = $('#modalContent');
  const modalClose = $('#modalClose');
  if (!modal || !modalContent) return;

  const PROJECTS_DATA = {
    'syncspace': {
      domain: 'Real-Time Collaboration · Full Stack Systems',
      title: 'SyncSpace — Collaborative Real-Time Workspace',
      subtitle: 'A high-performance workspace enabling real-time multi-user document editing, interactive canvas drawing, and persistent state synchronization powered by CRDT algorithms.',
      problem: 'Building collaborative platforms requires resolving conflicting updates from multiple users concurrently without server bottlenecks or race conditions, while keeping UI latency under 50ms.',
      metrics: [
        { val: '< 50ms', label: 'Sync Latency' },
        { val: 'CRDT (Yjs)', label: 'Conflict Handling' },
        { val: '100% Client Sync', label: 'State Consistency' }
      ],
      nodes: [
        { title: 'React UI Client', desc: 'Monaco / Canvas Engine' },
        { title: 'CRDT Engine', desc: 'Yjs Document State' },
        { title: 'WebSocket Gateway', desc: 'Node.js / Express' },
        { title: 'Database & Redis', desc: 'MongoDB Document Store' }
      ],
      features: [
        'Conflict-free real-time collaborative text editing with cursor presence indicators',
        'Interactive shared canvas for architecture drafting and visual brainstorming',
        'Room-based state isolation with secure JWT session authentication',
        'Automatic offline change queueing with seamless background reconnection sync'
      ],
      tech: ['React', 'Node.js', 'WebSocket', 'Yjs CRDT', 'Express', 'MongoDB', 'Redis']
    },
    'slm-chatbot': {
      domain: 'Generative AI · Backend Systems · Security',
      title: 'SLM-Based Business Analytics Chatbot',
      subtitle: 'An intelligent natural language query interface powered by Gemma 2B that translates business questions into safe, optimized SQL queries with multi-layer injection defense.',
      problem: 'Non-technical business stakeholders struggle to extract insights from SQL databases, while existing LLM-to-SQL solutions pose major security risks through raw query execution.',
      metrics: [
        { val: 'Gemma 2B', label: 'Local SLM Engine' },
        { val: '99.4%', label: 'Query Safety Rate' },
        { val: '< 1.2s', label: 'Inference + Query Time' }
      ],
      nodes: [
        { title: 'React Query UI', desc: 'Natural Language Input' },
        { title: 'FastAPI Backend', desc: 'Prompt Guard & Router' },
        { title: 'Ollama SLM', desc: 'Gemma 2B Quantized' },
        { title: 'SQL Validator', desc: 'AST Parser & MySQL' }
      ],
      features: [
        'Natural language interface translating English prompts into structured SQL queries',
        'AST-based SQL parser checking queries for destructive statements (DROP, DELETE, ALTER)',
        'Local quantized SLM execution via Ollama — zero enterprise data leaks to external APIs',
        'Interactive visual chart rendering for returned analytical result sets'
      ],
      tech: ['Python', 'Gemma 2B', 'Ollama', 'FastAPI', 'MySQL', 'React', 'LangChain']
    },
    'retinopathy': {
      domain: 'AI · Deep Learning · Computer Vision',
      title: 'Non-Invasive Diabetic Retinopathy Detection',
      subtitle: 'A multi-architecture deep learning framework combining ResNet50, DenseNet121, and EfficientNetB3 for automated detection and 5-stage grading of diabetic retinopathy from retinal images.',
      problem: 'Diabetic retinopathy is a leading cause of blindness. Early diagnosis requires skilled ophthalmologists, creating severe healthcare access bottlenecks in underserved regions.',
      metrics: [
        { val: '94.2%', label: 'Ensemble Accuracy' },
        { val: '5 Stages', label: 'Grading Granularity' },
        { val: 'ResNet + DenseNet', label: 'Ensemble Models' }
      ],
      nodes: [
        { title: 'Fundus Image Input', desc: 'Preprocessed Retinal Scans' },
        { title: 'OpenCV Preprocessor', desc: 'CLAHE & Normalization' },
        { title: 'Deep Learning Ensemble', desc: 'ResNet50 + DenseNet121' },
        { title: 'Diagnostic Output', desc: 'Grade 0-4 + Heatmap' }
      ],
      features: [
        'Multi-model weighted voting ensemble delivering clinical-grade diagnostic classification',
        'Advanced image preprocessing incorporating CLAHE contrast enhancement and green-channel extraction',
        'Grad-CAM activation heatmap generation displaying visual justification for predicted severity',
        'Fast inference pipeline optimized for edge deployments in clinical screening tools'
      ],
      tech: ['Python', 'TensorFlow', 'Keras', 'ResNet50', 'DenseNet121', 'EfficientNetB3', 'OpenCV']
    },
    'drowsiness': {
      domain: 'Computer Vision · Real-Time Safety AI',
      title: 'Driver Drowsiness Detection System',
      subtitle: 'A computer vision application monitoring facial landmarks in real-time to track Eye Aspect Ratio (EAR) and facial fatigue indicators, issuing immediate audible alerts.',
      problem: 'Driver fatigue accounts for over 20% of severe traffic accidents worldwide. Automated real-time alerts require ultra-low latency vision algorithms running on modest hardware.',
      metrics: [
        { val: '30 FPS', label: 'Real-Time Speed' },
        { val: '< 0.25s', label: 'Alert Response Time' },
        { val: '68 Points', label: 'Landmark Mesh' }
      ],
      nodes: [
        { title: 'Video Stream Input', desc: 'Live Webcam / Feed' },
        { title: 'Mediapipe / dlib', desc: '68 Facial Landmarks' },
        { title: 'EAR Vector Calc', desc: 'Threshold Evaluator' },
        { title: 'Alert Engine', desc: 'Audible / Visual Warning' }
      ],
      features: [
        'Continuous Eye Aspect Ratio (EAR) computation to detect prolonged eye closure micro-sleeps',
        'Yawn frequency and head tilt detection for comprehensive drowsiness risk scoring',
        'Adaptive lighting compensation using CLAHE for robust night driving performance',
        'Zero cloud dependency — runs completely locally on lightweight CPU hardware'
      ],
      tech: ['Python', 'OpenCV', 'Mediapipe', 'dlib', 'NumPy', 'Pygame (Sound Alert)']
    }
  };

  function openModal(projectId) {
    const data = PROJECTS_DATA[projectId];
    if (!data) return;

    modalContent.innerHTML = `
      <span class="modal-header-badge">${data.domain}</span>
      <h2 class="modal-title">${data.title}</h2>
      <p class="modal-subtitle">${data.subtitle}</p>

      <div class="modal-metrics">
        ${data.metrics.map(m => `
          <div class="metric-card">
            <div class="metric-value">${m.val}</div>
            <div class="metric-label">${m.label}</div>
          </div>
        `).join('')}
      </div>

      <div class="modal-section-title">01. Problem & Challenge</div>
      <p class="project-desc">${data.problem}</p>

      <div class="modal-section-title">02. System Architecture</div>
      <div class="arch-diagram">
        <div class="arch-flow-row">
          ${data.nodes.map((node, i) => `
            <div class="arch-node">
              <div class="arch-node-title">${node.title}</div>
              <div class="arch-node-desc">${node.desc}</div>
            </div>
            ${i < data.nodes.length - 1 ? '<span class="arch-arrow">→</span>' : ''}
          `).join('')}
        </div>
      </div>

      <div class="modal-section-title">03. Key Capabilities & Features</div>
      <ul class="timeline-bullets" style="margin-bottom: 1.5rem;">
        ${data.features.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <div class="modal-section-title">04. Tech Stack</div>
      <div class="project-tech-row" style="margin-top: 0.5rem;">
        ${data.tech.map(t => `<span class="tech-chip">${t}</span>`).join('')}
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach event listeners
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-case-study');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const pId = btn.dataset.project;
      if (pId) openModal(pId);
      return;
    }

    const card = e.target.closest('.project-card:not(.project-placeholder)');
    if (card && !e.target.closest('.project-link-btn')) {
      const pId = card.dataset.project;
      if (pId) openModal(pId);
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
})();

/* ─── 21. INIT LOG ───────────────────────────────────────────────────────── */
console.log(
  '%c SHREE AADHARSH K %c Portfolio v2.0 ',
  'background: linear-gradient(135deg,#38bdf8,#818cf8); color:#fff; padding:4px 12px; border-radius:4px 0 0 4px; font-weight:700;',
  'background: #0d1321; color: #94a3b8; padding:4px 12px; border-radius:0 4px 4px 0;'
);
