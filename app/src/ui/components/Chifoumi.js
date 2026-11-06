/**
 * Fenêtre du chifoumi (GD §9.2) : un seul coup, rejoué en cas d'égalité ; le vainqueur choisit
 * qui commence la manche 1. Quand l'IA gagne, elle choisit et le joueur lance la manche.
 */
import { el } from '../dom.js';

const THROW_KEYS = Object.freeze({ rock: 'chifoumi.rock', paper: 'chifoumi.paper', scissors: 'chifoumi.scissors' });

/** @param {{ t: Function, opponentName: string, throws: readonly string[] }} opts */
export function createChifoumi(opts) {
  const { t } = opts;
  const opponent = opts.opponentName;
  const result = el('p', { className: 'dialog-result' });
  const prompt = el('p', { className: 'dialog-text' });
  const actions = el('div', { className: 'dialog-actions' });
  const root = el('div', { className: 'overlay', attrs: { hidden: true, 'data-dialog': 'chifoumi' } }, [
    el('section', { className: 'dialog dialog-chifoumi', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'chifoumi-title' } }, [
      el('h2', { className: 'dialog-title', text: t('chifoumi.title'), attrs: { id: 'chifoumi-title' } }),
      result,
      prompt,
      actions,
    ]),
  ]);

  const btn = (text, attrs, extra = '') => el('button', { className: `btn btn-dialog ${extra}`.trim(), text, attrs: { type: 'button', ...attrs } });

  return {
    el: root,

    /**
     * @param {{ visible: boolean, match: object, awaitingGo: boolean }} vm
     */
    update(vm) {
      root.hidden = !vm.visible;
      if (!vm.visible) return;
      const m = vm.match;
      const last = m.chifoumi;
      result.textContent = last
        ? t('chifoumi.result', { player: t(THROW_KEYS[last.player]), opponent, theirs: t(THROW_KEYS[last.opponent]) })
        : '';
      if (m.phase === 'chifoumi') {
        prompt.textContent = last ? t('chifoumi.tie') : t('chifoumi.prompt');
        actions.replaceChildren(...opts.throws.map((th) => btn(t(THROW_KEYS[th]), { 'data-action': 'throw', 'data-throw': th }, 'btn-throw')));
      } else if (m.phase === 'starter' && m.chifoumiWinner === 'player') {
        prompt.textContent = t('chifoumi.youWin');
        actions.replaceChildren(
          btn(t('chifoumi.meFirst'), { 'data-action': 'starter', 'data-starter': 'player' }),
          btn(t('chifoumi.themFirst', { opponent }), { 'data-action': 'starter', 'data-starter': 'opponent' }),
        );
      } else if (m.phase === 'starter') {
        prompt.textContent = t('chifoumi.theyWin', { opponent });
        actions.replaceChildren();
      } else {
        const key = m.starter === 'player' ? 'chifoumi.theyChoseYou' : 'chifoumi.theyChoseThem';
        prompt.textContent = `${t('chifoumi.theyWin', { opponent })} ${t(key, { opponent })}`;
        actions.replaceChildren(btn(t('chifoumi.go'), { 'data-action': 'go' }));
      }
    },
  };
}
