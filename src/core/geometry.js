/**
 * Géométrie pure du sol : zone de marche, profondeur, petites aides numériques.
 * Une zone de marche (masque) = { polygon: [[x,y]…], holes: [[[x,y]…]…] } en coordonnées du monde.
 */

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Point dans un polygone (règle du nombre de croisements). */
export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Le point est-il dans la zone de marche (dans le contour, hors des trous) ? */
export function isWalkable(mask, x, y) {
  if (!pointInPolygon(x, y, mask.polygon)) return false;
  for (const hole of mask.holes ?? []) if (pointInPolygon(x, y, hole)) return false;
  return true;
}

/**
 * Essaie d'aller de (x,y) à (nx,ny). Si c'est bloqué, glisse le long de l'obstacle
 * (d'abord sur un seul axe, puis l'autre). Renvoie la position atteinte et si on a buté.
 */
export function slideMove(mask, x, y, nx, ny) {
  if (isWalkable(mask, nx, ny)) return { x: nx, y: ny, blocked: false };
  if (isWalkable(mask, nx, y)) return { x: nx, y, blocked: true };
  if (isWalkable(mask, x, ny)) return { x, y: ny, blocked: true };
  return { x, y, blocked: true };
}

/**
 * Échelle d'un objet posé au sol selon sa profondeur : petit au fond, grand devant.
 * @param {number} y position au sol
 * @param {{ yBack:number, yFront:number }} floor bande de sol
 * @param {number} far échelle au fond
 * @param {number} near échelle devant
 */
export function depthScale(y, floor, far, near) {
  const t = clamp((y - floor.yBack) / (floor.yFront - floor.yBack), 0, 1);
  return lerp(far, near, t);
}

/** Boîte englobante d'un polygone. */
export function bounds(poly) {
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/** Polygone approchant une ellipse (pour les obstacles posés au sol). */
export function ellipse(cx, cy, rx, ry, steps = 12) {
  const out = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    out.push([Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry)]);
  }
  return out;
}

/** Transforme la zone de marche de aisle.json (trous en polygones ou en ellipses) en masque utilisable. */
export function maskFromData(walk) {
  const holes = (walk.holes ?? []).map((h) => (h.shape === 'ellipse' ? ellipse(h.cx, h.cy, h.rx, h.ry, 16) : h.points));
  return { polygon: walk.polygon, holes };
}
