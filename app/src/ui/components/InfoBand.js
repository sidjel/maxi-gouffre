/**
 * Bandeau d'information (GD §17.5) : la carte visée ou sélectionnée. En premier ce qui sert à jouer
 * (puissance, fraîcheur, effet, Malus), puis le texte d'ambiance, et en bas l'évolution sur 3 stades.
 * Sans carte visée, il rappelle les règles en quelques lignes pour un nouveau joueur.
 * Le bandeau défile si son contenu dépasse (souris, doigt).
 */
import { el } from '../dom.js';
import { effectIcon, effectName, effectText, powerText, stageLabel, visibleTags } from '../cardText.js';

const HELP_KEYS = ['help.turn', 'help.round', 'help.pass', 'help.malus', 'help.effects', 'help.read'];

/** @param {{ t: Function, rules: object }} opts */
export function createInfoBand(opts) {
  const { t, rules } = opts;
  const text = (className) => el('p', { className });
  const refs = {
    name: el('h2', { className: 'info-name' }),
    power: el('span', { className: 'info-power' }),
    stageIcon: el('span', { className: 'stage-icon', attrs: { 'aria-hidden': 'true' } }),
    fresh: el('span', { className: 'info-fresh-text' }),
    gauge: el('span', { className: 'info-gauge', attrs: { 'aria-hidden': 'true' } }, [0, 1, 2].map(() => el('span', { className: 'info-seg' }))),
    effectIcon: el('span', { className: 'info-effect-icon', attrs: { 'aria-hidden': 'true' } }),
    effectName: el('span', { className: 'info-effect-name' }),
    effectText: el('span'),
    effectLine: text('info-effect-text'),
    pending: el('span', { className: 'info-pending' }),
    malus: text('info-malus'),
    flavor: text('info-flavor'),
    tags: el('span', { className: 'info-tags' }),
    stages: el('ol', { className: 'info-stages' }),
  };
  const effectBox = el('div', { className: 'info-effect' }, [
    el('p', { className: 'info-effect-head' }, [refs.effectIcon, refs.effectName]),
    refs.effectLine,
  ]);
  refs.effectLine.append(refs.effectText, ' ', refs.pending);
  const card = el('div', { className: 'info-card' }, [
    el('div', { className: 'info-head' }, [refs.power, refs.name]),
    el('p', { className: 'info-fresh' }, [refs.stageIcon, refs.gauge, refs.fresh, refs.tags]),
    effectBox,
    refs.malus,
    refs.flavor,
    el('div', { className: 'info-evolution' }, [el('p', { className: 'info-evolution-title', text: t('info.evolution') }), refs.stages]),
  ]);
  const help = el('div', { className: 'info-help' }, [
    el('h2', { className: 'info-name', text: t('help.title') }),
    el('ol', { className: 'info-help-list' }, HELP_KEYS.map((key) => el('li', { text: t(key) }))),
  ]);
  const root = el('section', { className: 'info-band', attrs: { 'aria-live': 'polite', 'aria-label': t('info.label'), tabindex: '0' } }, [card, help]);
  // Indique qu'il reste du texte plus bas, jusqu'à ce qu'on ait défilé jusqu'au bout.
  const markMore = () => root.classList.toggle('has-more', root.scrollTop + root.clientHeight < root.scrollHeight - 2);
  root.addEventListener('scroll', markMore, { passive: true });
  let shown;

  return {
    el: root,

    /** @param {ReturnType<import('../../core/cards.js').cardView>|null} view */
    update(view) {
      root.classList.toggle('is-empty', !view);
      card.hidden = !view;
      help.hidden = Boolean(view);
      // On ne remonte en haut que si la fiche change de carte (ou de stade) : un simple rafraîchissement
      // (coup de l'IA, doigt levé) ne doit pas perdre l'endroit où le joueur a fait défiler.
      const key = view ? `${view.uid}:${view.stage}:${view.stageLocked}` : null;
      if (key !== shown) root.scrollTop = 0;
      shown = key;
      if (view) fill(view);
      markMore();
    },
  };

  /** Remplit la fiche d'une carte. */
  function fill(view) {
    const malus = view.tags.includes('malus');
    refs.name.textContent = view.name;
    refs.power.textContent = powerText(view.power);
    refs.power.classList.toggle('is-negative', view.power !== null && view.power < 0);
    refs.stageIcon.dataset.stage = String(view.stage);
  refs.gauge.dataset.stage = String(view.stage);
    const stage = stageLabel(t, view.stage);
    const fresh = view.owner === 'player' ? t('info.freshness', { stage, age: view.age }) : t('info.freshnessFixed', { stage });
    refs.fresh.textContent = view.stageLocked ? `${fresh} · ${t('info.stageLocked')}` : fresh;
    refs.fresh.dataset.stage = String(view.stage);

    const e = view.effects[0];
    effectBox.classList.toggle('is-none', !e);
    refs.effectIcon.textContent = e ? effectIcon(t, e) : '';
    refs.effectName.textContent = e ? effectName(t, e) : t('info.noEffectTitle');
    refs.effectText.textContent = e ? effectText(t, e, rules) : '';
    refs.pending.textContent = e ? t('info.effectPending') : '';
    refs.effectLine.hidden = !e;
    if (!view.placeable) {
      refs.malus.textContent = t('info.notPlaceable');
    } else {
      refs.malus.textContent = malus ? t('info.malusText', { power: powerText(view.power) }) : '';
    }
    refs.malus.hidden = refs.malus.textContent === '';
    refs.flavor.textContent = view.flavor ?? '';
    refs.flavor.hidden = !view.flavor;
    refs.tags.textContent = visibleTags(t, view.tags).join(' · ');
    refs.stages.replaceChildren(...view.def.stages.map((s, i) => el('li', {
      className: i + 1 === view.stage ? 'is-current' : '',
      text: t('info.stageLine', { stage: stageLabel(t, i + 1), name: s.name, power: powerText(s.power) }),
    })));
  }
}
