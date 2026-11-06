import { el, clear } from '../dom.js';

/**
 * Plein écran (demande de l'auteur, voir docs/DECISIONS.md).
 * Un navigateur n'accepte le plein écran que pendant un geste du joueur : on le demande donc au premier
 * toucher, clic ou appui de touche. S'il refuse, une fenêtre propose de réessayer d'un toucher.
 * Un petit bouton reste disponible tant qu'on n'est pas en plein écran (après Échap, par exemple).
 * Tout vit hors de la scène, en px réels. Sans plein écran possible (iPhone), rien ne s'affiche.
 */
export function createFullscreen() {
  let root = null;
  let toggle = null;
  let dialog = null;
  let offs = [];

  return {
    /**
     * @param {HTMLElement} layer élément #fullscreen de index.html
     * @param {{ t: Function, bus: object, platform: object }} ctx
     */
    mount(layer, ctx) {
      const { t, bus, platform } = ctx;
      root = layer;
      clear(root);
      if (!platform.fullscreenSupported()) return;

      // Un refus du navigateur n'est pas une erreur du jeu : on propose simplement le bouton.
      const enter = () => platform.requestFullscreen().then(() => true, () => false);
      const refresh = () => {
        const full = platform.isFullscreen();
        toggle.hidden = full;
        if (full) dialog.hidden = true;
      };

      toggle = el('button', {
        className: 'fullscreen-toggle',
        attrs: { type: 'button', 'data-fullscreen': 'toggle', hidden: true, 'aria-label': t('fullscreen.button'), title: t('fullscreen.button') },
        on: { click: () => enter() },
      });
      dialog = el('div', { className: 'fullscreen-dialog', attrs: { role: 'dialog', 'aria-labelledby': 'fullscreen-title', hidden: true, 'data-fullscreen': 'dialog' } }, [
        el('h2', { className: 'fullscreen-title', text: t('fullscreen.title'), attrs: { id: 'fullscreen-title' } }),
        el('p', { className: 'fullscreen-text', text: t('fullscreen.text') }),
        el('div', { className: 'fullscreen-actions' }, [
          el('button', {
            className: 'btn fullscreen-accept', text: t('fullscreen.accept'),
            attrs: { type: 'button', 'data-fullscreen': 'accept' },
            on: { click: () => { dialog.hidden = true; enter(); } },
          }),
          el('button', {
            className: 'btn fullscreen-later', text: t('fullscreen.later'),
            attrs: { type: 'button', 'data-fullscreen': 'later' },
            on: { click: () => { dialog.hidden = true; } },
          }),
        ]),
      ]);
      root.append(toggle, dialog);
      platform.onFullscreenChange(refresh);
      refresh();

      // Premier geste du joueur : tentative automatique, une seule fois par chargement.
      const off = bus.on('INPUT_ACTION', ({ action }) => {
        off();
        if (action === 'DEBUG' || platform.isFullscreen()) return;
        enter().then((ok) => {
          if (!ok && !platform.isFullscreen()) dialog.hidden = false;
        });
      });
      offs = [off];
    },

    update() {},

    unmount() {
      for (const off of offs) off();
      offs = [];
      if (root) clear(root);
      root = null;
    },
  };
}
