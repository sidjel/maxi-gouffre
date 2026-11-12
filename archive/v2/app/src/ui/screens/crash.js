import { logError } from '../../app/log.js';

/**
 * Écran « Le magasin a planté » (ARCHITECTURE.md §4). Son texte est écrit dans index.html :
 * il doit s'afficher même si les données (strings.json) n'ont pas pu être chargées.
 */
let shown = false;

/**
 * Affiche l'erreur fatale. Le bouton recharge le jeu, qui repart sur l'écran titre.
 * @param {unknown} err
 * @param {Document} [doc]
 */
export function showCrash(err, doc = document) {
  logError('erreur fatale :', err);
  const layer = doc.getElementById('crash');
  if (!layer) return;
  const message = doc.getElementById('crash-message');
  const detail = err instanceof Error ? err.message : String(err);
  // Plusieurs erreurs à la suite : on les garde toutes, dans l'ordre.
  message.textContent = shown ? `${message.textContent}\n\n${detail}` : detail;
  if (!shown) {
    doc.getElementById('crash-back')?.addEventListener('click', () => doc.location.reload());
  }
  shown = true;
  layer.hidden = false;
  doc.documentElement.dataset.crashed = '1';
}

/** Branche l'écran de plantage sur les erreurs non rattrapées. */
export function installCrashHandlers(win = window) {
  win.addEventListener('error', (e) => showCrash(e.error ?? e.message, win.document));
  win.addEventListener('unhandledrejection', (e) => showCrash(e.reason, win.document));
}
