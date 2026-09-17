(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const toggle = hero.querySelector('.hero-motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const update = () => {
    hero.classList.toggle('motion-paused', paused);
    hero.classList.toggle('motion-enabled', !paused);
    const trails = hero.querySelector('.hero-light-trails');
    if (trails) { if (paused) trails.pauseAnimations(); else trails.unpauseAnimations(); }
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; update(); });
  update();
  // Crisp SVG light trails with independently animated highlights.
  // Automatic city zoom follows the combined layout; SVG motion pauses with it.
  // There is deliberately no pointer/mouse handler for the hero.
})();
