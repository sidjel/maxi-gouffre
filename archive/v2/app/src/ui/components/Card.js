/**
 * Carte (ARCHITECTURE.md §8.2, GD §17.4, DIRECTION_ARTISTIQUE.md §2) : un conteneur (survol, focus,
 * sélection) qui contient l'élément qui pivote (face avant, face arrière). Face complète en main sur
 * grand écran, face compacte sur le plateau et sur petit écran (le CSS choisit ce qui s'affiche).
 * Couches de la face : illustration, reflet de la finition, pastilles et textes, tampons, laser du scanner.
 */
import { el } from '../dom.js';
import { effectIcon, effectName, powerText, stageLabel, visibleTags } from '../cardText.js';

const HUE_TURNS = 360;
const FINISH_CLASSES = ['finish-matte', 'finish-promo', 'finish-limited', 'finish-greasy'];
/** Chemin des images : les données donnent un chemin relatif à app/. */
const APP_URL = new URL('../../../', import.meta.url);

/** Teinte stable par famille, pour l'illustration de secours (image absente). */
function familyHue(family) {
  let h = 0;
  for (const ch of family) h = (h * 31 + ch.codePointAt(0)) % HUE_TURNS;
  return h;
}

/**
 * Crée l'élément d'une carte.
 * @param {'button'|'div'} tag bouton en main, simple bloc sur le plateau (la case est le bouton)
 */
export function createCard(tag) {
  const hidden = { 'aria-hidden': 'true' };
  const part = (className) => el('span', { className, attrs: hidden });
  const refs = {
    power: el('span', { className: 'card-power-value' }),
    name: part('card-name'),
    img: el('img', { className: 'card-art-img', attrs: { alt: '', draggable: 'false', decoding: 'async' } }),
    initial: el('span', { className: 'card-art-initial' }),
    effectIcon: el('span', { className: 'card-effect-icon' }),
    effectName: el('span', { className: 'card-effect-name' }),
    tags: part('card-tags'),
    malus: part('card-malus'),
    stamp: part('card-stamp'),
    limited: part('card-limited'),
  };
  const art = el('span', { className: 'card-art', attrs: hidden }, [refs.img, refs.initial]);
  const effect = el('span', { className: 'card-effect', attrs: hidden }, [refs.effectIcon, refs.effectName]);
  const gauge = el('span', { className: 'card-gauge', attrs: hidden }, [
    el('span', { className: 'card-stage-icon' }),
    el('span', { className: 'card-seg' }),
    el('span', { className: 'card-seg' }),
    el('span', { className: 'card-seg' }),
  ]);
  const front = el('span', { className: 'card-front' }, [
    art,
    part('card-shine'),
    part('card-fold'),
    el('span', { className: 'card-power', attrs: hidden }, [refs.power]),
    refs.name, effect, refs.tags, gauge, part('card-ferment'), refs.malus, refs.stamp, refs.limited,
    part('card-scan'),
  ]);
  const sparkles = el('span', { className: 'card-sparkles', attrs: hidden }, [part('card-sparkle'), part('card-sparkle'), part('card-sparkle')]);
  const node = el(tag, { className: 'card', attrs: tag === 'button' ? { type: 'button' } : {} }, [
    el('span', { className: 'card-inner' }, [front, el('span', { className: 'card-back', attrs: hidden })]),
    sparkles,
  ]);
  node.cardRefs = refs;
  node.cardEffect = effect;
  return node;
}

/**
 * Met à jour une carte.
 * @param {HTMLElement} node élément créé par createCard
 * @param {ReturnType<import('../../core/cards.js').cardView>} view
 * @param {{ t: Function, power?: number, effectActive?: boolean }} opts power = P effective sur le plateau
 */
export function renderCard(node, view, opts) {
  const { t } = opts;
  const refs = node.cardRefs;
  const power = opts.power ?? view.power;
  const effect = view.effects[0] ?? null;
  const malus = view.tags.includes('malus');
  node.dataset.uid = view.uid;
  node.classList.remove('stage-1', 'stage-2', 'stage-3', ...FINISH_CLASSES);
  node.classList.add(`stage-${view.stage}`, `finish-${view.finish ?? 'matte'}`);
  node.classList.toggle('is-dish', Boolean(view.def.dish));
  node.classList.toggle('is-malus', malus);
  node.classList.toggle('is-fermented', view.tags.includes('fermentation'));
  node.classList.toggle('has-effect', Boolean(effect));
  node.classList.toggle('is-effect-inactive', Boolean(effect) && !opts.effectActive);
  node.classList.toggle('is-unplaceable', !view.placeable);
  node.classList.toggle('is-stage-locked', view.stageLocked);
  node.classList.toggle('has-image', Boolean(view.image));
  node.style.setProperty('--card-hue', String(familyHue(view.def.family)));
  if (view.image) {
    const src = new URL(view.image, APP_URL).href;
    if (refs.img.src !== src) refs.img.src = src;
  } else if (refs.img.hasAttribute('src')) {
    refs.img.removeAttribute('src');
  }
  refs.power.textContent = powerText(power);
  refs.name.textContent = view.name;
  refs.initial.textContent = view.name.charAt(0);
  refs.effectIcon.textContent = effect ? effectIcon(t, effect) : '';
  refs.effectName.textContent = effect ? effectName(t, effect) : '';
  refs.tags.textContent = visibleTags(t, view.tags).join(' · ');
  refs.malus.textContent = malus ? t('card.malus') : '';
  refs.stamp.textContent = view.stage === 3 ? t('card.stampExpired') : '';
  refs.limited.textContent = view.finish === 'limited' ? t('card.stampLimited') : '';
  const label = [
    view.name,
    t('card.ariaPower', { power: powerText(power) }),
    stageLabel(t, view.stage),
    malus ? t('card.malus') : null,
    effect ? effectName(t, effect) : null,
    view.finish === 'limited' ? t('card.stampLimited') : null,
  ].filter(Boolean).join(', ');
  node.setAttribute('aria-label', label);
}
