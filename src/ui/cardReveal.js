/**
 * Apparition satisfaisante d'une carte : elle jaillit de la douchette en se retournant,
 * rebondit au centre, brille, puis file dans le Panier. On peut passer l'attente (agir ou toucher).
 */
import { el } from '../scene/assets.js';
import { createCardView } from './cardView.js';
import { sfx } from '../audio/sfx.js';

const CENTER = { x: 960, y: 500 };

export function createCardReveal(parent) {
  const layer = el('div', 'reveal');
  parent.append(layer);
  let skip = null;

  const wait = (ms) => new Promise((res) => { const t = setTimeout(res, ms); skip = () => { clearTimeout(t); res(); }; });

  layer.addEventListener('pointerdown', () => skip?.());

  return {
    skip() { skip?.(); },
    /**
     * @param {object} card
     * @param {{x:number,y:number}} from point de départ (scène)
     * @param {{x:number,y:number}} to centre du bouton Panier (scène)
     * @param {object} cfg config
     */
    async show(card, from, to, cfg) {
      const wrap = el('div', 'reveal-card');
      const view = createCardView(card);
      wrap.append(view, el('div', 'reveal-shine'));
      layer.append(wrap);
      layer.classList.add('is-on');
      const inner = view.querySelector('.card-inner');
      const reduce = cfg.reduceMotion;
      const dx = from.x - CENTER.x; const dy = from.y - CENTER.y;

      sfx.card();
      if (reduce) {
        await wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }).finished;
      } else {
        const pop = wrap.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(-25deg)`, opacity: 0.2 },
          { transform: 'translate(0, -30px) scale(1.12) rotate(3deg)', opacity: 1, offset: 0.7 },
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        ], { duration: 620, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
        inner.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' }], { duration: 520, delay: 120, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
        await pop.finished;
        wrap.classList.add('is-shining');
      }
      await wait(cfg.cardHoldMs);
      skip = null;
      const tx = to.x - CENTER.x; const ty = to.y - CENTER.y;
      const fly = wrap.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx * 0.4}px, ${ty * 0.4 - 60}px) scale(.55) rotate(-6deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${tx}px, ${ty}px) scale(.1) rotate(12deg)`, opacity: 0.3 },
      ], { duration: reduce ? 200 : 480, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' });
      await fly.finished;
      sfx.drop();
      wrap.remove();
      if (!layer.childElementCount) layer.classList.remove('is-on');
    },
  };
}
