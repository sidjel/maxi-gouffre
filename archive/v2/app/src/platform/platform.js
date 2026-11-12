/**
 * Accès à la plateforme : web pour l'instant, Android (Capacitor) au jalon J10.
 * Orientation, type d'appareil, passage en arrière-plan.
 */

/** Vrai dans l'application Android (J10). */
export const isNative = false;

const PORTRAIT = '(orientation: portrait)';
const COARSE = '(pointer: coarse)';

/** Vrai si la fenêtre est plus haute que large. */
export function isPortrait(win = window) {
  return win.matchMedia(PORTRAIT).matches;
}

/** Vrai si le pointeur principal est un doigt (téléphone, tablette). */
export function isHandheld(win = window) {
  return win.matchMedia(COARSE).matches;
}

/** Vrai s'il faut demander de tourner l'appareil (GD §14.5). */
export function needsRotation(win = window) {
  return isHandheld(win) && isPortrait(win);
}

/**
 * Prévient quand l'orientation ou le type de pointeur change.
 * @returns {() => void} désabonnement
 */
export function onOrientationChange(cb, win = window) {
  const queries = [win.matchMedia(PORTRAIT), win.matchMedia(COARSE)];
  for (const q of queries) q.addEventListener('change', cb);
  win.addEventListener('resize', cb);
  return () => {
    for (const q of queries) q.removeEventListener('change', cb);
    win.removeEventListener('resize', cb);
  };
}

/** Le jeu passe en arrière-plan (onglet caché, application réduite). */
export function onPause(cb, doc = document) {
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) cb();
  });
}

/** Le jeu revient au premier plan. */
export function onResume(cb, doc = document) {
  doc.addEventListener('visibilitychange', () => {
    if (!doc.hidden) cb();
  });
}

/** Vrai si le navigateur permet de mettre la page en plein écran (pas l'iPhone, par exemple). */
export function fullscreenSupported(doc = document) {
  return typeof doc.documentElement.requestFullscreen === 'function' && doc.fullscreenEnabled !== false;
}

/** Vrai si la page est en plein écran. */
export function isFullscreen(doc = document) {
  return Boolean(doc.fullscreenElement);
}

/**
 * Passe en plein écran. Le navigateur l'exige pendant un geste du joueur (toucher, clic, touche).
 * Sur téléphone, on tente aussi de bloquer l'écran en paysage (Android ; refus ignoré).
 * @returns {Promise<void>} rejetée si le navigateur refuse
 */
export async function requestFullscreen(doc = document, win = window) {
  await doc.documentElement.requestFullscreen({ navigationUI: 'hide' });
  if (isHandheld(win)) win.screen.orientation?.lock?.('landscape')?.catch(() => {});
}

/** Prévient quand la page entre dans le plein écran ou en sort (touche Échap, bouton retour…). */
export function onFullscreenChange(cb, doc = document) {
  doc.addEventListener('fullscreenchange', cb);
}
