/**
 * Une carte : nom, puissance, stade (Frais, Mûr, Pourri), fraîcheur et propriétés.
 * Dessinée en em : on change sa taille avec font-size (grande à l'apparition, petite dans le Panier).
 */
import { el } from '../scene/assets.js';
import { asset } from '../scene/assets.js';
import { STAGE_LABELS } from '../core/cards.js';

export function createCardView(card) {
  const root = el('div', `card card--${card.stage}`, { 'data-uid': card.uid, tabindex: '-1' });
  root.innerHTML = `
<div class="card-inner">
  <div class="card-face card-front">
    <div class="card-band"><span class="card-stage"></span><span class="card-power" title="Puissance"></span></div>
    <div class="card-art"><img alt="" draggable="false"></div>
    <div class="card-name"></div>
    <div class="card-age" aria-hidden="true"><i></i></div>
    <ul class="card-props"></ul>
  </div>
  <div class="card-face card-back" aria-hidden="true"><span>MAXI<br>GOUFFRE</span></div>
</div>`;
  root.querySelector('img').src = asset(card.image);
  fill(root, card);
  return root;
}

/** Met à jour une carte existante (après vieillissement). Renvoie vrai si le stade a changé. */
export function fill(root, card) {
  const changed = root.dataset.stage && root.dataset.stage !== card.stage;
  root.dataset.stage = card.stage;
  root.className = root.className.replace(/card--\w+/, `card--${card.stage}`);
  root.querySelector('.card-stage').textContent = STAGE_LABELS[card.stage];
  root.querySelector('.card-power').textContent = String(card.power);
  root.querySelector('.card-name').textContent = card.name;
  root.querySelector('.card-age i').style.transform = `scaleX(${Math.max(0.02, card.age)})`;
  const props = root.querySelector('.card-props');
  props.replaceChildren(...card.props.map((p) => { const li = el('li'); li.textContent = p; return li; }));
  root.setAttribute('aria-label', `${card.name}, puissance ${card.power}, ${STAGE_LABELS[card.stage]}, ${card.props.join(', ')}`);
  return changed;
}
