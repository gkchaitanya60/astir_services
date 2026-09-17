(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  const servicesButton = document.querySelector('.dropdown-toggle');
  const services = document.querySelector('#services-menu');
  const setServices = open => { services.hidden = !open; servicesButton.setAttribute('aria-expanded', String(open)); };
  const setMenu = open => { nav.classList.toggle('is-open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation'; if (!open) setServices(false); };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  servicesButton.addEventListener('click', () => setServices(services.hidden));
  document.addEventListener('click', e => { if (!e.target.closest('.nav-dropdown')) setServices(false); if (!e.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (!services.hidden) { setServices(false); servicesButton.focus(); } else if (nav.classList.contains('is-open')) { setMenu(false); menuButton.focus(); } });
  document.querySelector('.nav-dropdown').addEventListener('focusout', e => { if (!e.currentTarget.contains(e.relatedTarget)) setServices(false); });
  window.matchMedia('(min-width:1201px)').addEventListener('change', () => setMenu(false));

  const root = document.querySelector('.carousel');
  if (!root) return;
  const stage = root.querySelector('.carousel-stage');
  const cards = [...root.querySelectorAll('.priority-card')];
  const dots = [...root.querySelectorAll('[data-slide]')];
  const status = root.querySelector('.carousel-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 2, phase = 2, radius = 580, cardWidth = 350, drag = null, suppressClick = false;
  const wrap = value => ((value % cards.length) + cards.length) % cards.length;
  const distance = (i, value) => wrap(i - value + cards.length / 2) - cards.length / 2;
  const previous = new Map();
  function render(value, direct = false) {
    phase = value;
    cards.forEach((card, i) => {
      const d = distance(i, value), angle = d * 33, radians = angle * Math.PI / 180;
      const x = Math.sin(radians) * radius, z = (Math.cos(radians) - 1) * radius;
      const wrapped = previous.has(i) && Math.abs(previous.get(i) - d) > cards.length / 2;
      card.style.transition = direct || wrapped || reduced.matches ? 'none' : '';
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(3)}px), ${Math.abs(d)*3}px, ${z.toFixed(3)}px) rotateY(${angle.toFixed(3)}deg)`;
      card.style.setProperty('--depth-light', String(1 - Math.min(Math.abs(d), 2.5) * .14));
      card.dataset.position = String(Math.round(d));
      card.classList.toggle('is-front', Math.abs(d) < .5);
      card.tabIndex = Math.abs(d) < .5 ? 0 : -1;
      previous.set(i, d);
    });
  }
  function announce() {
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    status.textContent = `${current + 1} of ${cards.length}: ${cards[current].getAttribute('aria-label')}`;
  }
  function show(value) { current = wrap(Math.round(value)); render(Math.round(value)); announce(); }
  function layout() {
    const width = root.clientWidth;
    cardWidth = width < 560 ? Math.min(260, width * .63) : Math.min(370, width * .3);
    radius = Math.max(width * .46, cardWidth * 1.8);
    stage.style.setProperty('--card-width', cardWidth + 'px');
    stage.style.setProperty('--camera-distance', Math.max(720, width * .95) + 'px');
    render(current, true);
  }
  new ResizeObserver(layout).observe(root);
  root.querySelector('.carousel-prev').addEventListener('click', () => show(current - 1));
  root.querySelector('.carousel-next').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(phase + distance(i, phase))));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1)); }
  });
  root.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button')) return;
    drag = {x:e.clientX, y:e.clientY, id:e.pointerId, phase:current, moved:false};
    suppressClick = false;
  });
  root.addEventListener('dragstart', e => e.preventDefault());
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.25) { drag.moved = true; root.classList.add('is-dragging'); }
    if (drag.moved) render(drag.phase - dx / (cardWidth * .8), true);
  });
  function finish(e, cancelled = false) {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null; root.classList.remove('is-dragging');
    if (moved) {
      suppressClick = true; show(cancelled ? current : phase);
      setTimeout(() => { suppressClick = false; }, 350);
    }
  }
  window.addEventListener('pointerup', e => finish(e));
  window.addEventListener('pointercancel', e => finish(e, true));
  root.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    const card = e.target.closest('.priority-card');
    if (card && !card.classList.contains('is-front')) { e.preventDefault(); show(phase + distance(Number(card.dataset.index), phase)); }
  }, true);
  reduced.addEventListener('change', () => render(current, true));
  layout(); announce();
  // Rotation is deliberately user-controlled, with real shared-perspective depth.
})();
