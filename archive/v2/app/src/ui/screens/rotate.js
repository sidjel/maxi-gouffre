import { el, clear } from '../dom.js';

/**
 * Écran « Tourne ton téléphone » (GD §14.5). Il vit hors de la scène mise à l'échelle,
 * en px réels, pour rester lisible quand le téléphone est en portrait.
 */
export function createRotateScreen() {
  let root = null;

  return {
    /**
     * @param {HTMLElement} layer élément #rotate de index.html
     * @param {{ t: Function }} ctx
     */
    mount(layer, ctx) {
      root = layer;
      clear(root);
      root.setAttribute('role', 'alertdialog');
      root.setAttribute('aria-labelledby', 'rotate-title');
      root.append(
        el('div', { className: 'rotate-phone', attrs: { 'aria-hidden': 'true' } }, [el('div', { className: 'rotate-phone-screen' })]),
        el('h2', { className: 'rotate-title', text: ctx.t('rotate.title'), attrs: { id: 'rotate-title' } }),
        el('p', { className: 'rotate-line', text: ctx.t('rotate.narrator') }),
      );
    },

    /** @param {boolean} visible */
    update(visible) {
      if (root) root.hidden = !visible;
    },

    unmount() {
      if (root) {
        clear(root);
        root.hidden = true;
      }
      root = null;
    },
  };
}
