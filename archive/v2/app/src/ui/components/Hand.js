/**
 * Main du joueur en éventail (GD §17.5). Toucher ou cliquer une carte la sélectionne
 * (elle se soulève) ; le combat décide ensuite où elle peut aller.
 */
import { el } from '../dom.js';
import { createCard, renderCard } from './Card.js';
import { cardView } from '../../core/cards.js';

/** @param {{ t: Function }} opts */
export function createHand(opts) {
  const { t } = opts;
  const cards = new Map();
  const row = el('div', { className: 'hand-cards' });
  const empty = el('p', { className: 'hand-empty', text: t('combat.handEmpty'), attrs: { hidden: true } });
  const root = el('div', { className: 'hand', attrs: { role: 'group', 'aria-label': t('combat.handLabel') } }, [row, empty]);

  return {
    el: root,

    /** Rectangle à l'écran d'une carte de la main (départ du vol vers le plateau), ou null. */
    rectOf(uid) {
      return cards.get(uid)?.getBoundingClientRect() ?? null;
    },

    /**
     * @param {{ state: object, coreCtx: object, selected: string|null, active: boolean }} vm
     */
    update(vm) {
      const uids = vm.state.match.hands.player;
      for (const [uid, node] of cards) {
        if (!uids.includes(uid)) {
          node.remove();
          cards.delete(uid);
        }
      }
      root.classList.toggle('is-waiting', !vm.active);
      root.style.setProperty('--fan-max', String(Math.max(0, (uids.length - 1) / 2)));
      uids.forEach((uid, i) => {
        let node = cards.get(uid);
        if (!node) {
          node = createCard('button');
          cards.set(uid, node);
        }
        if (row.children[i] !== node) row.insertBefore(node, row.children[i] ?? null);
        // Éventail : écart signé au centre de la main et sa valeur absolue (variables CSS seulement).
        const d = i - (uids.length - 1) / 2;
        node.style.setProperty('--fan-d', String(d));
        node.style.setProperty('--fan-abs', String(Math.abs(d)));
        renderCard(node, cardView(vm.state, uid, vm.coreCtx), { t, effectActive: false });
        const selected = vm.selected === uid;
        node.classList.toggle('is-selected', selected);
        node.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      empty.hidden = uids.length > 0;
    },
  };
}
