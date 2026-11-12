import { el } from '../dom.js';

/**
 * Crédits (GD §15.5, DIRECTION_ARTISTIQUE.md §7.3) : un très long ticket de caisse qui défile,
 * généré depuis le registre des assets (credits.json). Les fichiers de même auteur, source et licence
 * sont regroupés sur une ligne (« × 66 »). Le défilement s'arrête dès que le joueur fait défiler lui-même ;
 * avec « Réduire les animations », il ne démarre pas.
 */

/** Regroupe les entrées du registre : une ligne par (auteur, source, licence). */
export function creditLines(entries) {
  const groups = new Map();
  for (const e of entries) {
    const key = `${e.author}|${e.source}|${e.license}`;
    const g = groups.get(key) ?? { author: e.author, source: e.source, license: e.license, usage: e.usage, count: 0, cards: 0 };
    g.count += 1;
    if (e.file.startsWith('assets/img/cards/')) g.cards += 1;
    groups.set(key, g);
  }
  return [...groups.values()];
}

export function createCreditsScreen() {
  let root = null;
  let ctx = null;
  let frame = 0;
  let off = null;
  let scroller = null;
  let pos = 0;

  const stopScroll = () => {
    if (frame) ctx.win.cancelAnimationFrame(frame);
    frame = 0;
  };

  function step(last) {
    frame = ctx.win.requestAnimationFrame((now) => {
      const dt = last === null ? 0 : now - last;
      pos += (dt / 1000) * ctx.tech.CREDITS_SPEED_PX;
      scroller.scrollTop = pos;
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
        frame = 0;
        return;
      }
      step(now);
    });
  }

  const back = () => ctx.navigate('TITLE');

  return {
    /**
     * @param {HTMLElement} parent
     * @param {{ t: Function, tech: object, bus: object, win: Window, navigate: Function, defs: { credits: object[] } }} context
     */
    mount(parent, context) {
      ctx = context;
      const { t } = ctx;
      const lines = creditLines(ctx.defs.credits).map((g) => el('li', { className: 'receipt-item' }, [
        el('span', { className: 'receipt-row' }, [
          el('span', { className: 'receipt-what', text: g.cards === g.count && g.count > 1 ? t('receipt.cardArt') : g.usage }),
          el('span', { className: 'receipt-qty', text: t('receipt.files', { count: g.count }) }),
        ]),
        el('span', { className: 'receipt-detail', text: g.author }),
        el('span', { className: 'receipt-detail', text: g.source }),
        el('span', { className: 'receipt-detail', text: t('receipt.license', { license: g.license }) }),
      ]));
      scroller = el('div', { className: 'receipt-scroll', attrs: { tabindex: '0' } }, [
        el('div', { className: 'receipt' }, [
          el('h2', { className: 'receipt-store', text: t('receipt.store') }),
          el('p', { className: 'receipt-line', text: t('receipt.header') }),
          el('p', { className: 'receipt-line', text: t('receipt.ticket', { version: ctx.tech.APP_VERSION }) }),
          el('ul', { className: 'receipt-list' }, lines),
          el('p', { className: 'receipt-total', text: t('receipt.total') }),
          el('p', { className: 'receipt-line receipt-thanks', text: t('receipt.thanks') }),
          el('span', { className: 'receipt-barcode', attrs: { 'aria-hidden': 'true' } }),
        ]),
      ]);
      root = el('section', { className: 'screen screen-credits', attrs: { 'aria-label': t('receipt.label') } }, [
        scroller,
        el('button', { className: 'btn credits-back', text: t('receipt.back'), attrs: { type: 'button', 'data-action': 'back' }, on: { click: back } }),
      ]);
      parent.append(root);
      // Le joueur prend la main : le ticket ne défile plus tout seul.
      for (const type of ['wheel', 'pointerdown', 'touchstart']) scroller.addEventListener(type, stopScroll, { passive: true });
      off = ctx.bus.on('INPUT_ACTION', ({ action }) => {
        if (action === 'CANCEL' || action === 'PAUSE') back();
      });
      pos = 0;
      if (!ctx.win.matchMedia('(prefers-reduced-motion: reduce)').matches) step(null);
    },

    update() {},

    unmount() {
      stopScroll();
      off?.();
      off = null;
      root?.remove();
      root = null;
    },
  };
}
