/**
 * Recherche de chemin sur une grille posée sur la zone de marche (A*),
 * puis lissage en ligne droite quand rien ne bloque. Sert au « clic / toucher pour aller ».
 */
import { isWalkable, bounds } from './geometry.js';

/** Construit la grille des cases praticables. */
export function buildGrid(mask, cell) {
  const b = bounds(mask.polygon);
  const cols = Math.ceil((b.maxX - b.minX) / cell);
  const rows = Math.ceil((b.maxY - b.minY) / cell);
  const open = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = b.minX + (c + 0.5) * cell;
      const y = b.minY + (r + 0.5) * cell;
      open[r * cols + c] = isWalkable(mask, x, y) ? 1 : 0;
    }
  }
  return { mask, cell, cols, rows, ox: b.minX, oy: b.minY, open };
}

const toCell = (g, x, y) => [Math.floor((x - g.ox) / g.cell), Math.floor((y - g.oy) / g.cell)];
const center = (g, c, r) => [g.ox + (c + 0.5) * g.cell, g.oy + (r + 0.5) * g.cell];
const isOpen = (g, c, r) => c >= 0 && r >= 0 && c < g.cols && r < g.rows && g.open[r * g.cols + c] === 1;

/** Point praticable le plus proche de (x,y) (recherche en anneaux sur la grille). */
export function nearestWalkable(g, x, y) {
  if (isWalkable(g.mask, x, y)) return [x, y];
  const [c0, r0] = toCell(g, x, y);
  const maxRing = Math.max(g.cols, g.rows);
  for (let ring = 1; ring < maxRing; ring += 1) {
    let best = null; let bestD = Infinity;
    for (let dc = -ring; dc <= ring; dc += 1) {
      for (let dr = -ring; dr <= ring; dr += 1) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== ring || !isOpen(g, c0 + dc, r0 + dr)) continue;
        const [cx, cy] = center(g, c0 + dc, r0 + dr);
        const d = (cx - x) ** 2 + (cy - y) ** 2;
        if (d < bestD) { bestD = d; best = [cx, cy]; }
      }
    }
    if (best) return best;
  }
  return null;
}

/** Ligne droite praticable entre deux points (échantillonnage tous les demi-pas de grille). */
export function lineClear(mask, ax, ay, bx, by, step) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
  for (let i = 1; i <= n; i += 1) {
    const t = i / n;
    if (!isWalkable(mask, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

/**
 * Chemin de (ax,ay) vers (bx,by). Renvoie une liste de points [x,y] (sans le départ),
 * ou [] si la cible est injoignable. La cible bloquée est ramenée au point praticable le plus proche.
 */
export function findPath(g, ax, ay, bx, by) {
  const goal = nearestWalkable(g, bx, by);
  if (!goal) return [];
  if (lineClear(g.mask, ax, ay, goal[0], goal[1], g.cell / 2)) return [goal];
  const [sc, sr] = toCell(g, ax, ay);
  const [gc, gr] = toCell(g, goal[0], goal[1]);
  const key = (c, r) => r * g.cols + c;
  const cost = new Map([[key(sc, sr), 0]]);
  const from = new Map();
  const open = [[0, sc, sr]];
  const h = (c, r) => Math.hypot(c - gc, r - gr);
  let found = false;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i += 1) if (open[i][0] < open[bi][0]) bi = i;
    const [, c, r] = open.splice(bi, 1)[0];
    if (c === gc && r === gr) { found = true; break; }
    for (let dc = -1; dc <= 1; dc += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        if ((!dc && !dr) || !isOpen(g, c + dc, r + dr)) continue;
        if (dc && dr && (!isOpen(g, c + dc, r) || !isOpen(g, c, r + dr))) continue;
        const k = key(c + dc, r + dr);
        const nc = cost.get(key(c, r)) + (dc && dr ? Math.SQRT2 : 1);
        if (nc < (cost.get(k) ?? Infinity)) {
          cost.set(k, nc); from.set(k, key(c, r));
          open.push([nc + h(c + dc, r + dr), c + dc, r + dr]);
        }
      }
    }
  }
  if (!found) return [];
  const cells = [];
  for (let k = key(gc, gr); k !== key(sc, sr); k = from.get(k)) cells.unshift(center(g, k % g.cols, Math.floor(k / g.cols)));
  cells[cells.length - 1] = goal;
  return smooth(g, [ax, ay], cells);
}

/** Supprime les points intermédiaires quand une ligne droite suffit. */
function smooth(g, start, pts) {
  const out = [];
  let cur = start;
  let i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !lineClear(g.mask, cur[0], cur[1], pts[j][0], pts[j][1], g.cell / 2)) j -= 1;
    out.push(pts[j]);
    cur = pts[j];
    i = j + 1;
  }
  return out;
}
