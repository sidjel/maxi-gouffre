/**
 * Particules (Canvas 2D) : le produit se dissout en confettis de papier aspirés par la douchette.
 * Le canevas ne dessine que lorsqu'il y a des particules ; sinon il reste vide et ne coûte rien.
 */
import { el } from './assets.js';
import { FIXED } from '../config.js';

export function createParticles(stageNode, stage, rng) {
  const canvas = el('canvas', 'particles');
  stageNode.append(canvas);
  const ctx = canvas.getContext('2d');
  let q = 1;
  function resize() {
    q = Math.min(1, Math.max(0.4, stage.scale * (window.devicePixelRatio || 1)));
    canvas.width = Math.round(FIXED.stageWidth * q);
    canvas.height = Math.round(FIXED.stageHeight * q);
  }
  resize();
  stage.onResize(resize);

  let parts = [];
  let target = () => ({ x: 0, y: 0 });
  let dirty = false;

  return {
    get active() { return parts.length > 0; },
    /**
     * @param {{x:number,y:number,w:number,h:number}} box zone de départ (monde)
     * @param {string[]} colors couleurs du produit
     * @param {number} count nombre de particules
     * @param {() => {x:number,y:number}} getTarget pointe de la douchette (monde), relue à chaque image
     * @param {number} duration secondes
     */
    burst(box, colors, count, getTarget, duration) {
      target = getTarget;
      for (let i = 0; i < count; i += 1) {
        parts.push({
          x0: box.x + rng.next() * box.w, y0: box.y + rng.next() * box.h,
          swirl: rng.range(-1, 1) * 160, lift: rng.range(40, 160),
          size: rng.range(5, 13), color: rng.pick(colors), rot: rng.range(0, Math.PI),
          delay: rng.next() * duration * 0.35, life: duration * rng.range(0.5, 0.65), t: 0,
        });
      }
    },
    /** @param {number} dt secondes @param {number} camX caméra */
    update(dt, camX) {
      if (!parts.length) {
        if (dirty) { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; }
        return;
      }
      const tip = target();
      ctx.setTransform(q, 0, 0, q, 0, 0);
      ctx.clearRect(0, 0, FIXED.stageWidth, FIXED.stageHeight);
      dirty = true;
      parts = parts.filter((p) => {
        p.t += dt;
        const u = (p.t - p.delay) / p.life;
        if (u >= 1) return false;
        const e = u <= 0 ? 0 : u * u * (3 - 2 * u);
        // Courbe : départ du produit, détour (tourbillon), arrivée à la pointe.
        const cx = (p.x0 + tip.x) / 2 + p.swirl;
        const cy = Math.min(p.y0, tip.y) - p.lift;
        const a = 1 - e;
        const x = a * a * p.x0 + 2 * a * e * cx + e * e * tip.x - camX;
        const y = a * a * p.y0 + 2 * a * e * cy + e * e * tip.y;
        const s = p.size * (u <= 0 ? 1 : 1 - e * 0.8);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot + e * 6);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
        return true;
      });
    },
  };
}
