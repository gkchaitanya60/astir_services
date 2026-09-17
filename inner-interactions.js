(() => {
  'use strict';
  // Keep the AI capability selector compact while preserving native keyboard access.
  const panels = [...document.querySelectorAll('.intelligence-panels details')];
  panels.forEach(panel => panel.addEventListener('toggle', () => {
    if (panel.open) panels.forEach(other => { if (other !== panel) other.open = false; });
  }));
})();
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.content-card,.job-row,.company-profile').forEach(card => {
      card.classList.add('interactive-surface');
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--shine-x', (event.clientX - bounds.left) + 'px');
        card.style.setProperty('--shine-y', (event.clientY - bounds.top) + 'px');
      }, {passive:true});
    });
  }
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('soft-arrival'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    document.querySelectorAll('.company-profile,.story-statement,.process,.brand-grid').forEach(item => observer.observe(item));
  }
  const progress = document.querySelector('.reading-progress');
  const article = document.querySelector('.article-copy');
  if (progress && article) {
    const headings = [...article.querySelectorAll('h2[id]')];
    const links = [...document.querySelectorAll('.reading-rail nav a')];
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const rect = article.getBoundingClientRect();
      const range = Math.max(1, article.offsetHeight - innerHeight * .6);
      const amount = Math.round(Math.max(0, Math.min(1, (innerHeight * .25 - rect.top) / range)) * 100);
      progress.setAttribute('aria-valuenow', String(amount));
      progress.querySelector('span').style.width = amount + '%';
      let current = headings[0]; headings.forEach(h => { if (h.getBoundingClientRect().top < innerHeight * .35) current = h; });
      links.forEach(link => link.classList.toggle('is-reading', !!current && link.hash === '#' + current.id));
    };
    addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive:true});
    addEventListener('resize', update); update();
  }
})();
