/* Navigationsverhalten – per Event-Delegation auf document, daher
   kompatibel mit Astro View Transitions (DOM-Swaps). Einmalig gebunden. */

const D = document;
const desktop = () => window.matchMedia('(min-width: 1080px)').matches;

const $header = () => D.querySelector<HTMLElement>('[data-header]');
const $drawer = () => D.querySelector<HTMLElement>('[data-drawer]');
const $overlay = () => D.querySelector<HTMLElement>('[data-overlay]');
const $burger = () => D.querySelector<HTMLElement>('[data-burger]');

/* ---------- Desktop-Panels ---------- */
function setPanel(toggle: HTMLElement, open: boolean) {
  const id = toggle.getAttribute('aria-controls');
  const panel = id ? D.getElementById(id) : null;
  toggle.setAttribute('aria-expanded', String(open));
  if (panel) panel.hidden = !open;
}
function closeAllPanels() {
  D.querySelectorAll<HTMLElement>('[data-toggle][aria-expanded="true"]').forEach((t) =>
    setPanel(t, false)
  );
}

/* ---------- Mobile-Drawer ---------- */
const drawerOpen = () => {
  const d = $drawer();
  return !!d && !d.hidden;
};
function openDrawer() {
  const d = $drawer();
  if (!d) return;
  d.hidden = false;
  $overlay()!.hidden = false;
  $burger()?.setAttribute('aria-expanded', 'true');
  D.documentElement.classList.add('nav-locked');
  d.querySelector<HTMLElement>('a[href], button')?.focus();
}
function closeDrawer() {
  const d = $drawer();
  if (!d || d.hidden) return;
  d.hidden = true;
  const o = $overlay();
  if (o) o.hidden = true;
  D.documentElement.classList.remove('nav-locked');
  const b = $burger();
  b?.setAttribute('aria-expanded', 'false');
  b?.focus();
}

/* ---------- Klick-Delegation ---------- */
D.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;

  const toggle = t.closest<HTMLElement>('[data-toggle]');
  if (toggle) {
    e.preventDefault();
    const open = toggle.getAttribute('aria-expanded') === 'true';
    closeAllPanels();
    if (!open) setPanel(toggle, true);
    return;
  }
  if (t.closest('[data-burger]')) {
    openDrawer();
    return;
  }
  if (t.closest('[data-close]') || t.closest('[data-overlay]')) {
    closeDrawer();
    return;
  }
  const mtoggle = t.closest<HTMLElement>('[data-mtoggle]');
  if (mtoggle) {
    const id = mtoggle.getAttribute('aria-controls');
    const sub = id ? D.getElementById(id) : null;
    const open = mtoggle.getAttribute('aria-expanded') === 'true';
    mtoggle.setAttribute('aria-expanded', String(!open));
    if (sub) sub.hidden = open;
    return;
  }
  // Klick außerhalb -> offene Desktop-Panels schließen
  if (!t.closest('.nav-item')) closeAllPanels();
});

/* ---------- Hover-Intent (nur Desktop) ---------- */
let hoverTimer = 0;
D.addEventListener('mouseover', (e) => {
  if (!desktop()) return;
  const item = (e.target as HTMLElement).closest<HTMLElement>('.nav-item.has-panel');
  if (!item) return;
  clearTimeout(hoverTimer);
  const toggle = item.querySelector<HTMLElement>('[data-toggle]');
  if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
    closeAllPanels();
    setPanel(toggle, true);
  }
});
D.addEventListener('mouseout', (e) => {
  if (!desktop()) return;
  const item = (e.target as HTMLElement).closest<HTMLElement>('.nav-item.has-panel');
  const related = e.relatedTarget as HTMLElement | null;
  if (item && (!related || !item.contains(related))) {
    clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(closeAllPanels, 200);
  }
});

/* ---------- Tastatur ---------- */
D.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (drawerOpen()) {
      closeDrawer();
      return;
    }
    const open = D.querySelector<HTMLElement>('[data-toggle][aria-expanded="true"]');
    if (open) {
      setPanel(open, false);
      open.focus();
    }
    return;
  }
  // Focus-Trap im Drawer
  if (e.key === 'Tab' && drawerOpen()) {
    const d = $drawer()!;
    const focusable = Array.from(
      d.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && D.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && D.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/* ---------- Scroll-Schatten ---------- */
function onScroll() {
  $header()?.classList.toggle('is-scrolled', window.scrollY > 4);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- View-Transition-Reset ---------- */
D.addEventListener('astro:after-swap', () => {
  closeAllPanels();
  closeDrawer();
  D.documentElement.classList.remove('nav-locked');
  onScroll();
});
