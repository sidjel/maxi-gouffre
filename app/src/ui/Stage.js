/**
 * Scène logique de taille fixe, mise à l'échelle par une transformation CSS (ARCHITECTURE.md §8.1).
 * Deux profils : `wide` (1920×1080) et `compact` (1280×720), recalculés au redimensionnement.
 */

/**
 * Choisit le profil d'après la taille de la fenêtre en px CSS.
 * Compact dès que la largeur OU la hauteur passe sous le seuil (voir docs/DECISIONS.md).
 * @param {number} width
 * @param {number} height
 * @param {{ COMPACT_MAX_WIDTH: number, COMPACT_MAX_HEIGHT: number }} tech
 * @returns {'wide'|'compact'}
 */
export function pickProfile(width, height, tech) {
  return width < tech.COMPACT_MAX_WIDTH || height < tech.COMPACT_MAX_HEIGHT ? 'compact' : 'wide';
}

/**
 * Calcule l'échelle et le décalage pour faire tenir la scène sans la déformer (bandes sur les côtés).
 * @param {number} width fenêtre
 * @param {number} height fenêtre
 * @param {{ width: number, height: number }} stage taille logique
 * @returns {{ scale: number, x: number, y: number }}
 */
export function fitStage(width, height, stage) {
  const scale = Math.min(width / stage.width, height / stage.height);
  return {
    scale,
    x: (width - stage.width * scale) / 2,
    y: (height - stage.height * scale) / 2,
  };
}

/**
 * Calcule la disposition complète pour une fenêtre donnée.
 * @param {number} width
 * @param {number} height
 * @param {object} tech constantes techniques (config.js)
 */
export function computeLayout(width, height, tech) {
  const profile = pickProfile(width, height, tech);
  const stage = profile === 'compact' ? tech.COMPACT_STAGE : tech.WIDE_STAGE;
  return { profile, viewport: { width, height }, stage, ...fitStage(width, height, stage) };
}

/** Applique la disposition au DOM et la recalcule quand la fenêtre change. */
export class Stage {
  #el;
  #tech;
  #win;
  #layout = null;
  #listeners = new Set();
  #onResize = () => this.update();

  /**
   * @param {HTMLElement} el élément de la scène
   * @param {object} tech constantes techniques
   * @param {Window} [win]
   */
  constructor(el, tech, win = window) {
    this.#el = el;
    this.#tech = tech;
    this.#win = win;
  }

  /** Disposition courante. */
  get layout() {
    return this.#layout;
  }

  /** Démarre l'écoute du redimensionnement. */
  start() {
    this.#win.addEventListener('resize', this.#onResize);
    this.#win.visualViewport?.addEventListener('resize', this.#onResize);
    this.update();
  }

  /** Arrête l'écoute. */
  stop() {
    this.#win.removeEventListener('resize', this.#onResize);
    this.#win.visualViewport?.removeEventListener('resize', this.#onResize);
  }

  /** Prévient quand le profil ou l'échelle change. */
  onChange(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  /** Recalcule et applique la disposition (variables CSS uniquement, pas de style inline). */
  update() {
    const layout = computeLayout(this.#win.innerWidth, this.#win.innerHeight, this.#tech);
    const style = this.#el.style;
    style.setProperty('--stage-w', `${layout.stage.width}px`);
    style.setProperty('--stage-h', `${layout.stage.height}px`);
    style.setProperty('--stage-scale', String(layout.scale));
    style.setProperty('--stage-x', `${layout.x}px`);
    style.setProperty('--stage-y', `${layout.y}px`);
    this.#win.document.documentElement.dataset.profile = layout.profile;
    this.#layout = layout;
    for (const fn of this.#listeners) fn(layout);
  }
}
