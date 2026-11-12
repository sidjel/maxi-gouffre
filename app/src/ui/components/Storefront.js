/**
 * Entrée du magasin (DIRECTION_ARTISTIQUE.md §7.1-7.3) : façade de nuit, enseigne néon « MAXI-GOUFFRE »,
 * portes coulissantes vitrées (buée, autocollant d'horaires, affiche promo), paillasson, et derrière
 * les portes l'intérieur éclairé : rayons, caddie, panneaux de rayon suspendus qui servent de menu.
 * Ce composant ne fait que construire le décor ; title.js le pilote (ouverture, inactivité, caddie).
 */
import { el } from '../dom.js';

const APP_URL = new URL('../../../', import.meta.url);
const hidden = { 'aria-hidden': 'true' };

/** Enseigne : une lettre par élément, pour qu'une seule clignote ou s'éteigne. */
function neonSign(text, flickerIndex, deadIndex) {
  const letters = [...text].map((ch, i) => el('span', {
    className: `neon-letter${i === flickerIndex ? ' is-flicker' : ''}${i === deadIndex ? ' is-dead-1' : ''}`,
    text: ch,
  }));
  return el('h1', { className: 'title-logo neon', attrs: { id: 'title-logo' } }, letters);
}

/** Un rayon du magasin : étagères garnies de produits en aplats. */
const shelf = (side) => el('span', { className: `store-shelf store-shelf-${side}`, attrs: hidden }, [
  el('span', { className: 'store-shelf-row' }), el('span', { className: 'store-shelf-row' }), el('span', { className: 'store-shelf-row' }),
]);

/** Porte vitrée : cadre, buée, poignée ; `extra` = autocollants. */
const door = (side, extra = []) => el('span', { className: `door door-${side}`, attrs: hidden }, [
  el('span', { className: 'door-glass' }), el('span', { className: 'door-fog' }), el('span', { className: 'door-handle' }), ...extra,
]);

/**
 * @param {{ t: Function, menu: HTMLElement, flickerIndex: number, deadIndex: number }} opts
 * @returns {{ el: HTMLElement, refs: Record<string, HTMLElement> }}
 */
export function createStorefront({ t, menu, flickerIndex, deadIndex }) {
  const tr = t;
  const title = tr('game.title');
  const refs = {
    logo: neonSign(title, flickerIndex, deadIndex),
    egg: el('span', { className: 'neon neon-egg', text: tr('title.egg'), attrs: hidden }),
    prompt: el('p', { className: 'title-prompt', text: tr('title.pressKey') }),
    announce: el('p', { className: 'title-announce', attrs: { role: 'status', 'aria-live': 'polite' } }),
    cart: el('img', { className: 'store-cart', attrs: { src: new URL('assets/img/ui/caddie.svg', APP_URL).href, alt: '', draggable: 'false', ...hidden } }),
  };
  const sticker = el('span', { className: 'door-sticker', text: tr('title.sticker') });
  const poster = el('span', { className: 'door-poster' }, [
    el('span', { className: 'title-promo-big', text: tr('title.promo') }),
    el('span', { className: 'title-promo-small', text: tr('title.promoDetail') }),
  ]);
  const interior = el('div', { className: 'store-interior' }, [
    el('span', { className: 'store-ceiling', attrs: hidden }),
    el('span', { className: 'store-floor', attrs: hidden }),
    shelf('left'), shelf('right'),
    refs.cart,
    menu,
  ]);
  const root = el('div', { className: 'storefront' }, [
    el('span', { className: 'store-sky', attrs: hidden }),
    el('div', { className: 'store-sign' }, [
      el('span', { className: 'store-sign-box', attrs: hidden }),
      refs.logo,
      refs.egg,
      el('p', { className: 'title-tagline', text: tr('title.tagline') }),
    ]),
    el('div', { className: 'store-entrance' }, [
      interior,
      door('left', [poster]),
      door('right', [sticker]),
      el('span', { className: 'door-frame', attrs: hidden }),
      refs.prompt,
    ]),
    el('span', { className: 'store-mat', text: tr('title.mat'), attrs: hidden }),
    refs.announce,
  ]);
  return { el: root, refs };
}
