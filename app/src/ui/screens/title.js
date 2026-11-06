import { el } from '../dom.js';

/**
 * Écran titre provisoire (J0). Menu du GD §15.2 ; les entrées ne mènent encore nulle part :
 * elles affichent un message provisoire. « Continuer » est grisé (aucune sauvegarde au J0).
 */
export function createTitleScreen() {
  let root = null;
  let toast = null;
  let toastTimer = null;
  let ctx = null;

  function say(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    if (toastTimer !== null) ctx.scheduler.cancel(toastTimer);
    toastTimer = ctx.scheduler.schedule(ctx.tech.TOAST_MS, () => {
      toastTimer = null;
      toast.classList.remove('is-visible');
    });
  }

  function menuButton(key, { disabled = false } = {}) {
    const label = ctx.t(key);
    return el('button', {
      className: 'btn btn-menu',
      text: label,
      attrs: { type: 'button', disabled, 'aria-disabled': disabled ? 'true' : false, 'data-menu': key },
      on: { click: () => say(ctx.t('title.notYet', { label })) },
    });
  }

  return {
    /**
     * @param {HTMLElement} parent
     * @param {{ t: Function, scheduler: import('../../app/Scheduler.js').Scheduler, tech: object }} context
     */
    mount(parent, context) {
      ctx = context;
      toast = el('p', { className: 'title-toast', attrs: { role: 'status', 'aria-live': 'polite' } });
      root = el('section', { className: 'screen screen-title', attrs: { 'aria-labelledby': 'title-logo' } }, [
        el('div', { className: 'title-promo', attrs: { 'aria-hidden': 'true' } }, [
          el('span', { className: 'title-promo-big', text: ctx.t('title.promo') }),
          el('span', { className: 'title-promo-small', text: ctx.t('title.promoDetail') }),
        ]),
        el('h1', { className: 'title-logo', text: ctx.t('game.title'), attrs: { id: 'title-logo' } }),
        el('p', { className: 'title-tagline', text: ctx.t('title.tagline') }),
        el('nav', { className: 'title-menu', attrs: { 'aria-label': ctx.t('title.menuLabel') } }, [
          menuButton('title.newGame'),
          menuButton('title.continue', { disabled: true }),
          menuButton('title.options'),
          menuButton('title.credits'),
        ]),
        toast,
        el('p', { className: 'title-footer', text: ctx.t('title.version', { version: ctx.tech.APP_VERSION }) }),
      ]);
      parent.append(root);
    },

    update() {},

    unmount() {
      if (toastTimer !== null) ctx.scheduler.cancel(toastTimer);
      toastTimer = null;
      root?.remove();
      root = null;
    },
  };
}
