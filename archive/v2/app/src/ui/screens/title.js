import { el } from '../dom.js';
import { createStorefront } from '../components/Storefront.js';

/**
 * Accueil (GD §15.2, DIRECTION_ARTISTIQUE.md §7) : l'entrée du Maxi-Gouffre.
 * - PRESS_KEY : portes fermées, « Appuie sur une touche ». Au premier appui, elles coulissent ;
 * - TITLE : le menu, en panneaux de rayon suspendus. « Continuer » sans sauvegarde : RUPTURE DE STOCK ;
 * - après TITLE_IDLE_MS sans action, les portes se referment à moitié et le haut-parleur fait une remarque ;
 * - de temps en temps, un caddie traverse le fond ; très rarement, l'enseigne affiche un autre mot.
 * Les sons (« ding », portes) arrivent avec l'audio (J9b).
 */
export function createTitleScreen() {
  let root = null;
  let front = null;
  let toast = null;
  let ctx = null;
  let off = null;
  const timers = { toast: null, idle: null, cart: null, egg: null, eggEnd: null, entered: null };

  const cancel = (name) => {
    if (timers[name] !== null) ctx.scheduler.cancel(timers[name]);
    timers[name] = null;
  };
  const later = (name, ms, fn) => {
    cancel(name);
    timers[name] = ctx.scheduler.schedule(ms, () => {
      timers[name] = null;
      fn();
    });
  };
  const calm = () => ctx.flashesReduced() || ctx.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Tirage purement décoratif (rythme du caddie, easter egg) : hors du cœur, Math.random suffit. */
  const between = (min, max) => min + Math.round(Math.random() * (max - min));

  function say(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    later('toast', ctx.tech.TOAST_MS, () => toast.classList.remove('is-visible'));
  }

  function sign(key, { disabled = false, onClick = null, extra = '', i = 0 } = {}) {
    const label = ctx.t(key);
    const children = [el('span', { className: 'aisle-sign-text', text: label })];
    if (disabled) children.push(el('span', { className: 'aisle-sign-band', text: ctx.t('title.outOfStock'), attrs: { 'aria-hidden': 'true' } }));
    const node = el('button', {
      className: `btn btn-menu aisle-sign ${extra}`.trim(),
      attrs: { type: 'button', disabled, 'aria-disabled': disabled ? 'true' : false, 'data-menu': key, 'aria-label': disabled ? ctx.t('title.continueOut') : false },
      on: { click: onClick ?? (() => say(ctx.t('title.notYet', { label }))) },
    }, [el('span', { className: 'aisle-sign-face' }, [el('span', { className: 'aisle-sign-strings', attrs: { 'aria-hidden': 'true' } }), ...children])]);
    node.style.setProperty('--i', String(i));
    return node;
  }

  /** Les portes s'ouvrent : on entre dans le magasin. */
  function open() {
    if (front.classList.contains('is-open')) return;
    front.classList.add('is-open');
    // Le menu ne répond qu'une fois les portes passées : le toucher qui ouvre ne déclenche pas un panneau.
    later('entered', calm() ? 0 : ctx.tech.TITLE_DOORS_MS, () => {
      front.classList.add('is-entered');
      root.querySelector('.title-menu').inert = false;
      if (ctx.sm.main === 'PRESS_KEY') ctx.sm.go('TITLE');
      armIdle();
      scheduleCart();
    });
  }

  function armIdle() {
    later('idle', ctx.tech.TITLE_IDLE_MS, () => {
      front.classList.add('is-closing');
      front.querySelector('.title-announce').textContent = ctx.t('title.idle');
    });
  }

  /** Toute action du joueur : ouvre les portes, ou les rouvre si elles se refermaient. */
  function onInput() {
    if (!front.classList.contains('is-open')) {
      open();
      return;
    }
    if (!front.classList.contains('is-entered')) return;
    if (front.classList.contains('is-closing')) {
      front.classList.remove('is-closing');
      front.querySelector('.title-announce').textContent = '';
    }
    armIdle();
  }

  function scheduleCart() {
    const { TITLE_CART_MIN_MS: min, TITLE_CART_MAX_MS: max } = ctx.tech;
    later('cart', between(min, max), () => {
      const cart = front.querySelector('.store-cart');
      if (!calm()) {
        cart.classList.remove('is-rolling');
        void cart.offsetWidth;
        cart.classList.add('is-rolling');
      }
      scheduleCart();
    });
  }

  function scheduleEgg() {
    later('egg', ctx.tech.TITLE_EGG_CHECK_MS, () => {
      if (!calm() && Math.random() < ctx.tech.TITLE_EGG_CHANCE) {
        front.classList.add('is-egg');
        later('eggEnd', ctx.tech.TITLE_EGG_MS, () => front.classList.remove('is-egg'));
      }
      scheduleEgg();
    });
  }

  return {
    /**
     * @param {HTMLElement} parent
     * @param {{ t: Function, scheduler: object, tech: object, sm: object, bus: object, win: Window,
     *           navigate: Function, flashesReduced: () => boolean, titleWear: number }} context
     */
    mount(parent, context) {
      ctx = context;
      const { tech } = ctx;
      toast = el('p', { className: 'title-toast', attrs: { role: 'status', 'aria-live': 'polite' } });
      const menu = el('nav', { className: 'title-menu', attrs: { 'aria-label': ctx.t('title.menuLabel') } }, [
        sign('title.quickMatch', { onClick: () => ctx.navigate('COMBAT'), extra: 'btn-primary aisle-sign-main', i: 0 }),
        el('div', { className: 'title-menu-row' }, [
          sign('title.newGame', { i: 1 }),
          sign('title.continue', { disabled: true, i: 2 }),
          sign('title.options', { i: 3 }),
          sign('title.credits', { onClick: () => ctx.navigate('CREDITS'), i: 4 }),
        ]),
      ]);
      const store = createStorefront({ t: ctx.t, menu, flickerIndex: tech.TITLE_FLICKER_LETTER, deadIndex: tech.TITLE_DEAD_LETTER });
      front = store.el;
      front.classList.add(`wear-${ctx.titleWear}`);
      const closed = ctx.sm.main === 'PRESS_KEY';
      // Retour au titre (après un combat, les crédits) : les portes sont déjà ouvertes.
      if (!closed) front.classList.add('is-open', 'is-entered', 'no-anim');
      menu.inert = closed;
      root = el('section', { className: 'screen screen-title', attrs: { 'aria-labelledby': 'title-logo' } }, [
        front,
        toast,
        el('p', { className: 'title-footer', text: ctx.t('title.version', { version: tech.APP_VERSION }) }),
      ]);
      parent.append(root);
      if (!closed) {
        void front.offsetWidth;
        front.classList.remove('no-anim');
        armIdle();
        scheduleCart();
      }
      scheduleEgg();
      off = ctx.bus.on('INPUT_ACTION', onInput);
    },

    update() {},

    unmount() {
      for (const name of Object.keys(timers)) cancel(name);
      off?.();
      off = null;
      root?.remove();
      root = null;
      front = null;
    },
  };
}
