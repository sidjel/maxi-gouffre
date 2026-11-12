/**
 * Scène logique de taille fixe (1920×1080), mise à l'échelle pour tenir dans l'écran sans déformer.
 * Le décor peut déborder sur les côtés (écrans plus larges) ; l'interface reste dans le cadre.
 */
import { FIXED } from '../config.js';

export function createStage() {
  const node = document.getElementById('stage');
  const rotate = document.getElementById('rotate');
  const W = FIXED.stageWidth;
  const H = FIXED.stageHeight;
  let scale = 1;
  const listeners = new Set();

  function fit() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    scale = Math.min(w / W, h / H);
    node.style.transform = `translate(-50%, -50%) scale(${scale})`;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    rotate.hidden = !(coarse && h > w);
    listeners.forEach((fn) => fn(scale));
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  return {
    node,
    get scale() { return scale; },
    /** Largeur visible en plus du cadre, de chaque côté (en px de scène). */
    get sideExtra() { return Math.max(0, (window.innerWidth / scale - W) / 2); },
    /** Convertit une position à l'écran en position dans la scène 1920×1080. */
    toStage(clientX, clientY) {
      const r = node.getBoundingClientRect();
      return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
    },
    onResize(fn) { listeners.add(fn); },
  };
}
