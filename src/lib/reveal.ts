/* Dezente Scroll-Reveals via IntersectionObserver.
   Respektiert prefers-reduced-motion und blendet bei fehlendem Support sofort ein.
   Re-initialisiert nach Astro View Transitions. */

function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  els.forEach((el) => {
    // Stagger: Kinder mit data-reveal-item wellenartig verzögern (max. 8 Stufen)
    el.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 70}ms`);
    });
    io.observe(el);
  });
}

initReveal();
document.addEventListener('astro:page-load', initReveal);
