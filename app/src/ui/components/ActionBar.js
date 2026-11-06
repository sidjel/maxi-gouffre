/**
 * Boutons d'action du combat, toujours visibles (GD §14.1) : Passer (avec confirmation, GD §9.5),
 * plateau à plat, Quitter (avec confirmation). Chaque bouton porte un data-action lu par l'écran.
 */
import { el } from '../dom.js';

const button = (t, key, action, extra = '') => el('button', {
  className: `btn btn-action ${extra}`.trim(),
  text: t(key),
  attrs: { type: 'button', 'data-action': action },
});

/** @param {{ t: Function }} opts */
export function createActionBar(opts) {
  const { t } = opts;
  const passBtn = button(t, 'combat.pass', 'pass', 'btn-pass');
  const flatBtn = button(t, 'combat.flat', 'flat', 'btn-small');
  flatBtn.setAttribute('aria-label', t('combat.flatLabel'));
  const quitBtn = button(t, 'combat.quit', 'quit', 'btn-small');
  const idle = el('div', { className: 'actions-idle' }, [passBtn, el('div', { className: 'actions-row' }, [flatBtn, quitBtn])]);

  const confirm = (questionKey, yesKey, yesAction, noAction) => el('div', { className: 'actions-confirm', attrs: { role: 'group', hidden: true } }, [
    el('p', { className: 'actions-question', text: t(questionKey) }),
    button(t, yesKey, yesAction, 'btn-yes'),
    button(t, 'combat.no', noAction, 'btn-small'),
  ]);
  const passConfirm = confirm('combat.passQuestion', 'combat.passConfirm', 'passYes', 'passNo');
  const quitConfirm = confirm('combat.quitQuestion', 'combat.quitConfirm', 'quitYes', 'quitNo');
  const root = el('div', { className: 'actions' }, [idle, passConfirm, quitConfirm]);

  return {
    el: root,

    /** @param {{ mode: 'idle'|'confirmPass'|'confirmQuit', canPass: boolean, flat: boolean }} vm */
    update(vm) {
      idle.hidden = vm.mode !== 'idle';
      passConfirm.hidden = vm.mode !== 'confirmPass';
      quitConfirm.hidden = vm.mode !== 'confirmQuit';
      passBtn.disabled = !vm.canPass;
      flatBtn.textContent = t(vm.flat ? 'combat.tilted' : 'combat.flat');
      flatBtn.setAttribute('aria-pressed', vm.flat ? 'true' : 'false');
    },
  };
}
