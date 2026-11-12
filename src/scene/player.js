/**
 * Déplacement du personnage : direction (clavier, stick, joystick) ou chemin vers un point (clic, toucher).
 * Accélération douce, glissement le long des obstacles, perspective (plus lent et plus petit au fond).
 */
import { slideMove, depthScale } from '../core/geometry.js';
import { findPath } from '../core/path.js';

export function createPlayer({ aisle, mask, grid }) {
  const p = {
    x: aisle.spawn.x, y: aisle.spawn.y, vx: 0, vy: 0,
    path: [], onArrive: null, blockedFor: 0, bumped: false,
  };

  function depth(cfg) { return depthScale(p.y, aisle.floor, cfg.depthScaleFar, cfg.depthScaleNear); }

  return {
    state: p,
    get x() { return p.x; },
    get y() { return p.y; },
    get vx() { return p.vx; },
    get vy() { return p.vy; },
    get moving() { return Math.hypot(p.vx, p.vy) > 25; },
    hasPath: () => p.path.length > 0,
    depth,
    /** Aller à un point du monde (le plus proche praticable). onArrive est appelé à l'arrivée. */
    goTo(x, y, onArrive = null) {
      p.path = findPath(grid, p.x, p.y, x, y);
      p.onArrive = p.path.length ? onArrive : null;
      if (!p.path.length && onArrive) onArrive();
    },
    stop() { p.path = []; p.onArrive = null; p.vx = 0; p.vy = 0; },

    /**
     * @param {number} dt secondes
     * @param {{x:number,y:number}} dir direction voulue (longueur ≤ 1), ou nulle
     * @param {object} cfg config
     * @returns {{ moved:number, bumped:boolean }}
     */
    update(dt, dir, cfg) {
      let dx = 0; let dy = 0;
      if (Math.hypot(dir.x, dir.y) > 0.08) {
        p.path = []; p.onArrive = null;
        dx = dir.x; dy = dir.y;
      } else if (p.path.length) {
        const [tx, ty] = p.path[0];
        const d = Math.hypot(tx - p.x, ty - p.y);
        const slowR = 60;
        if (d < 6) {
          p.path.shift();
          if (!p.path.length) { const cb = p.onArrive; p.onArrive = null; cb?.(); }
        } else {
          const last = p.path.length === 1;
          const f = last ? Math.min(1, d / slowR + 0.25) : 1;
          dx = ((tx - p.x) / d) * f; dy = ((ty - p.y) / d) * f;
          dy /= Math.max(0.2, cfg.depthSpeed); // le chemin reste droit malgré la perspective
          const n = Math.hypot(dx, dy); if (n > f) { dx = (dx / n) * f; dy = (dy / n) * f; }
        }
      }
      const speed = cfg.walkSpeed * (depth(cfg) / cfg.depthScaleNear);
      const tvx = dx * speed;
      const tvy = dy * speed * cfg.depthSpeed;
      const k = 1 - Math.exp(-cfg.walkAccel * dt);
      p.vx += (tvx - p.vx) * k;
      p.vy += (tvy - p.vy) * k;
      if (Math.abs(p.vx) < 1 && !dx) p.vx = 0;
      if (Math.abs(p.vy) < 1 && !dy) p.vy = 0;

      const ox = p.x; const oy = p.y;
      const r = slideMove(mask, p.x, p.y, p.x + p.vx * dt, p.y + p.vy * dt);
      p.x = r.x; p.y = r.y;
      const moved = Math.hypot(p.x - ox, p.y - oy);
      if (r.blocked) {
        if (Math.abs(p.x - ox) < 0.01) p.vx *= 0.5;
        if (Math.abs(p.y - oy) < 0.01) p.vy *= 0.5;
      }
      const pushing = r.blocked && (dx || dy) && moved < speed * dt * 0.3;
      p.blockedFor = pushing ? p.blockedFor + dt : 0;
      if (p.blockedFor > 0.4 && p.path.length) { p.path = []; p.onArrive = null; }
      return { moved, bumped: p.blockedFor > 0.25 };
    },
  };
}
