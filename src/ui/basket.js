/**
 * Le Panier : la liste des cartes obtenues. P, Y (manette) ou le bouton « Panier » ; Échap / B pour fermer.
 */
import { el } from '../scene/assets.js';
import { createCardView, fill } from './cardView.js';

export function createBasket(parent, { onClose }) {
  const root = el('section', 'basket', { 'data-ui': '', 'aria-label': 'Panier', hidden: '' });
  root.innerHTML = `
<header class="basket-head"><h2>Panier <span class="basket-count"></span></h2>
<button class="btn basket-close" type="button">Fermer <kbd>Échap</kbd></button></header>
<p class="basket-empty">[TEMP] Votre Panier est vide. Comme ce magasin, mais en plus petit.</p>
<div class="basket-grid" role="list"></div>`;
  parent.append(root);
  const grid = root.querySelector('.basket-grid');
  const views = new Map();
  let focusIndex = 0;
  root.querySelector('.basket-close').addEventListener('click', () => onClose());

  function render(cards) {
    root.querySelector('.basket-count').textContent = `(${cards.length})`;
    root.querySelector('.basket-empty').hidden = cards.length > 0;
    for (const c of cards) {
      let v = views.get(c.uid);
      if (!v) { v = createCardView(c); v.setAttribute('role', 'listitem'); views.set(c.uid, v); grid.append(v); }
      else if (fill(v, c)) { v.classList.remove('is-turning'); void v.offsetWidth; v.classList.add('is-turning'); }
    }
  }

  function focusCard(i) {
    const list = [...grid.children];
    if (!list.length) { root.querySelector('.basket-close').focus(); return; }
    focusIndex = Math.max(0, Math.min(list.length - 1, i));
    list[focusIndex].focus();
  }

  return {
    get open() { return !root.hidden; },
    show(cards) { render(cards); root.hidden = false; focusCard(focusIndex); },
    hide() { root.hidden = true; },
    refresh(cards) { render(cards); },
    nav({ dx, dy }) {
      const cols = Math.max(1, Math.round(grid.clientWidth / (grid.firstElementChild?.offsetWidth || 1)));
      focusCard(focusIndex + dx + dy * cols);
    },
  };
}
