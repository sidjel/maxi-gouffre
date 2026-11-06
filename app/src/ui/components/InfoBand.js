/**
 * Bandeau d'information (GD §17.5) : carte visée ou sélectionnée, avec ses 3 stades, son âge
 * et l'état de son effet. Au J1 les effets sont affichés mais pas encore résolus.
 */
import { el } from '../dom.js';
import { effectText, powerText, stageLabel, visibleTags } from '../cardText.js';

/** @param {{ t: Function, rules: object }} opts */
export function createInfoBand(opts) {
  const { t, rules } = opts;
  const title = el('h2', { className: 'info-name' });
  const meta = el('p', { className: 'info-meta' });
  const stages = el('ol', { className: 'info-stages' });
  const effect = el('p', { className: 'info-effect' });
  const flavor = el('p', { className: 'info-flavor' });
  const hint = el('p', { className: 'info-hint' });
  const root = el('section', { className: 'info-band', attrs: { 'aria-live': 'polite', 'aria-label': t('info.label') } }, [
    title, meta, stages, effect, flavor, hint,
  ]);

  return {
    el: root,

    /** @param {ReturnType<import('../../core/cards.js').cardView>|null} view */
    update(view) {
      root.classList.toggle('is-empty', !view);
      if (!view) {
        title.textContent = t('info.emptyTitle');
        meta.textContent = '';
        stages.replaceChildren();
        effect.textContent = '';
        flavor.textContent = t('info.empty');
        hint.textContent = '';
        return;
      }
      title.textContent = view.name;
      const facts = [stageLabel(t, view.stage), ...visibleTags(t, view.tags)];
      if (view.tags.includes('malus')) facts.push(t('info.malus'));
      if (view.tags.includes('fermentation')) facts.push(t('tag.fermentation'));
      meta.textContent = facts.join(' · ');
      stages.replaceChildren(...view.def.stages.map((s, i) => el('li', {
        className: i + 1 === view.stage ? 'is-current' : '',
        text: t('info.stageLine', { stage: stageLabel(t, i + 1), name: s.name, power: powerText(s.power) }),
      })));
      const e = view.effects[0];
      effect.textContent = e ? `${effectText(t, e, rules)} — ${t('info.effectPending')}` : t('info.noEffect');
      flavor.textContent = view.flavor ?? '';
      const age = view.owner === 'player' ? t('info.age', { age: view.age }) : t('info.ageFixed');
      hint.textContent = view.stageLocked ? `${age} · ${t('info.stageLocked')}` : age;
    },
  };
}
