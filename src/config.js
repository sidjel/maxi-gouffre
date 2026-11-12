/**
 * TOUTES les valeurs réglables du jeu, à un seul endroit.
 * Chaque entrée de SETTINGS apparaît dans le panneau de réglages (F2 ou bouton ⚙).
 * Les valeurs changées en jeu sont gardées dans le navigateur (localStorage).
 */

const prefersReducedMotion = !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Valeurs fixes (non réglables en jeu). */
export const FIXED = {
  stageWidth: 1920,
  stageHeight: 1080,
  gridCell: 24, // taille des cases de la grille de déplacement (px du monde)
  storageKey: 'maxi-gouffre.v3.reglages',
  seed: 20261112, // graine du hasard (reproductible)
};

/** type : 'range' (curseur) ou 'bool' (case à cocher). */
export const SETTINGS = [
  // Personnage
  { group: 'Personnage', key: 'charScale', label: 'Taille du personnage', value: 1, min: 0.5, max: 1.6, step: 0.05 },
  { group: 'Personnage', key: 'walkSpeed', label: 'Vitesse de marche (px/s)', value: 460, min: 150, max: 1000, step: 10 },
  { group: 'Personnage', key: 'walkAccel', label: 'Démarrage et freinage (vif ←→ glissant)', value: 10, min: 2, max: 30, step: 1 },
  { group: 'Personnage', key: 'depthSpeed', label: 'Vitesse vers le fond', value: 0.65, min: 0.3, max: 1.2, step: 0.05 },
  { group: 'Personnage', key: 'depthScaleFar', label: 'Taille au fond du rayon', value: 0.74, min: 0.4, max: 1, step: 0.02 },
  { group: 'Personnage', key: 'depthScaleNear', label: 'Taille au premier plan', value: 1, min: 0.8, max: 1.4, step: 0.02 },
  // Animation du papier
  { group: 'Animation', key: 'bobHeight', label: 'Rebond de marche (px)', value: 12, min: 0, max: 40, step: 1 },
  { group: 'Animation', key: 'stepLength', label: 'Longueur d’un pas (px)', value: 90, min: 40, max: 200, step: 5 },
  { group: 'Animation', key: 'tiltDeg', label: 'Balancement (degrés)', value: 3, min: 0, max: 12, step: 0.5 },
  { group: 'Animation', key: 'breath', label: 'Respiration à l’arrêt', value: 0.018, min: 0, max: 0.06, step: 0.002 },
  { group: 'Animation', key: 'flipMs', label: 'Durée du pivot de la feuille (ms)', value: 220, min: 60, max: 700, step: 10 },
  { group: 'Animation', key: 'squash', label: 'Écrasement au sursaut', value: 0.2, min: 0, max: 0.5, step: 0.01 },
  // Caméra
  { group: 'Caméra', key: 'cameraLerp', label: 'Caméra : rapidité à suivre', value: 3.5, min: 0.5, max: 15, step: 0.5 },
  { group: 'Caméra', key: 'cameraLead', label: 'Caméra : avance dans le sens de marche (px)', value: 160, min: 0, max: 500, step: 10 },
  // Scan
  { group: 'Scan', key: 'interactRadius', label: 'Distance pour scanner (px)', value: 200, min: 80, max: 400, step: 10 },
  { group: 'Scan', key: 'scanMs', label: 'Durée du scan (ms)', value: 1100, min: 400, max: 3000, step: 50 },
  { group: 'Scan', key: 'particles', label: 'Nombre de particules', value: 80, min: 0, max: 220, step: 5 },
  { group: 'Scan', key: 'cardHoldMs', label: 'Temps d’affichage de la carte (ms)', value: 1400, min: 300, max: 5000, step: 100 },
  { group: 'Scan', key: 'restockSec', label: 'Réassort des produits (s, 0 = jamais)', value: 0, min: 0, max: 120, step: 5 },
  // Cartes
  { group: 'Cartes', key: 'ripeAt', label: 'Âge où la carte devient Mûre', value: 0.34, min: 0.05, max: 0.9, step: 0.01 },
  { group: 'Cartes', key: 'rottenAt', label: 'Âge où la carte devient Pourrie', value: 0.67, min: 0.1, max: 1, step: 0.01 },
  { group: 'Cartes', key: 'ageJitter', label: 'Variation de fraîcheur au scan', value: 0.08, min: 0, max: 0.4, step: 0.01 },
  { group: 'Cartes', key: 'basketAgingPerMin', label: 'Pourrissement dans le Panier (par minute)', value: 0, min: 0, max: 1, step: 0.05 },
  // Narrateur
  { group: 'Narrateur', key: 'typeCps', label: 'Vitesse de frappe (lettres/s)', value: 40, min: 10, max: 150, step: 5 },
  { group: 'Narrateur', key: 'narratorHoldMs', label: 'Temps d’affichage après la frappe (ms)', value: 2800, min: 800, max: 8000, step: 100 },
  { group: 'Narrateur', key: 'idleSec', label: 'Inactivité avant remarque (s)', value: 20, min: 5, max: 120, step: 5 },
  // Son et affichage
  { group: 'Son et affichage', key: 'volume', label: 'Volume', value: 0.6, min: 0, max: 1, step: 0.05 },
  { group: 'Son et affichage', key: 'reduceMotion', label: 'Réduire les animations', value: prefersReducedMotion, type: 'bool' },
  { group: 'Son et affichage', key: 'joystick', label: 'Joystick virtuel (tactile)', value: false, type: 'bool' },
  { group: 'Son et affichage', key: 'debugMask', label: 'Montrer la zone de marche (F3)', value: false, type: 'bool' },
  { group: 'Son et affichage', key: 'showFps', label: 'Afficher les images par seconde', value: false, type: 'bool' },
];

const DEFAULTS = Object.fromEntries(SETTINGS.map((s) => [s.key, s.value]));

/** Valeurs courantes, à lire partout : config.walkSpeed, config.reduceMotion… */
export const config = { ...DEFAULTS };

const listeners = new Set();

/** Prévient quand une valeur change : fn(key, value). Renvoie la fonction de désabonnement. */
export function onConfigChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setConfig(key, value) {
  if (!(key in DEFAULTS)) throw new Error(`[MG] Réglage inconnu : ${key}`);
  config[key] = value;
  save();
  listeners.forEach((fn) => fn(key, value));
}

/** Seulement les valeurs différentes des valeurs d'origine (pour « Copier mes réglages »). */
export function changedSettings() {
  return Object.fromEntries(Object.entries(config).filter(([k, v]) => v !== DEFAULTS[k]));
}

export function resetConfig() {
  for (const key of Object.keys(DEFAULTS)) setConfig(key, DEFAULTS[key]);
}

function save() {
  try { globalThis.localStorage?.setItem(FIXED.storageKey, JSON.stringify(changedSettings())); } catch { /* stockage refusé */ }
}

/** Recharge les réglages gardés, puis applique ceux de l'adresse (?debugMask=1). */
export function loadConfig(search = '') {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(FIXED.storageKey) ?? '{}');
    for (const [k, v] of Object.entries(saved)) if (k in DEFAULTS && typeof v === typeof DEFAULTS[k]) config[k] = v;
  } catch { /* réglages illisibles : on garde les valeurs d'origine */ }
  for (const [k, raw] of new URLSearchParams(search)) {
    if (!(k in DEFAULTS)) continue;
    config[k] = typeof DEFAULTS[k] === 'boolean' ? raw !== '0' && raw !== 'false' : Number(raw);
  }
}
