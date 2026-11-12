/**
 * Le rayon (plan du personnage) : sol en linoléum, gondoles avec étagères garnies,
 * et deux allées transversales vides par où l'on voit le magasin infini (calque lointain).
 */
import { readFileSync } from 'node:fs';
import { createRng } from '../../src/core/rng.js';
import { svg, text, SHELF_COLORS, mix, r1 } from './paper.mjs';

const aisle = JSON.parse(readFileSync(new URL('../../src/data/aisle.json', import.meta.url)));
const products = JSON.parse(readFileSync(new URL('../../src/data/products.json', import.meta.url)));
const W = aisle.world.width;
const H = aisle.world.height;
const { units, top, levels } = aisle.shelves;
const FLOOR_Y = 690;

function floor() {
  const parts = [`<rect x="0" y="${FLOOR_Y}" width="${W}" height="${H - FLOOR_Y}" fill="#c9c1a5"/>`];
  // Carreaux : lignes horizontales de plus en plus espacées vers l'avant, obliques parallèles.
  let y = 716; let gap = 24;
  while (y < H) { parts.push(`<rect x="0" y="${y}" width="${W}" height="2" fill="#b5ad92"/>`); gap *= 1.22; y += gap; }
  for (let x = -300; x < W + 300; x += 150) parts.push(`<path d="M${x} ${FLOOR_Y} L${x + 90} ${H}" stroke="#b9b196" stroke-width="2"/>`);
  // Reflets des tubes du plafond et traces de chariot.
  for (let x = 260; x < W; x += 540) parts.push(`<ellipse cx="${x}" cy="790" rx="150" ry="16" fill="#e2dcc4" opacity=".55"/>`);
  const rng = createRng(7);
  for (let i = 0; i < 26; i += 1) {
    const x = rng.range(0, W); const yy = rng.range(760, 1060);
    parts.push(`<path d="M${r1(x)} ${r1(yy)} q${r1(rng.range(60, 160))} ${r1(rng.range(-8, 8))} ${r1(rng.range(160, 320))} ${r1(rng.range(-4, 4))}" stroke="#b2aa8f" stroke-width="3" fill="none" opacity=".5"/>`);
  }
  // Ombre au pied des gondoles.
  parts.push(`<defs><linearGradient id="foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3020" stop-opacity=".32"/><stop offset="1" stop-color="#3a3020" stop-opacity="0"/></linearGradient></defs>`);
  for (const [x0, x1] of units) parts.push(`<rect x="${x0}" y="${FLOOR_Y + 10}" width="${x1 - x0}" height="40" fill="url(#foot)"/>`);
  return parts.join('\n');
}

/** Zones réservées aux produits scannables (pas de remplissage dessus). */
function reserved(level) {
  return aisle.products.filter((p) => p.y === level).map((p) => {
    const w = products.find((q) => q.id === p.product).w;
    return [p.x - w / 2 - 26, p.x + w / 2 + 26];
  });
}

function filler(rng, x0, x1, level, maxH) {
  const parts = [];
  const free = reserved(level);
  let x = x0 + 34;
  while (x < x1 - 60) {
    const kind = rng.int(4);
    const w = kind === 1 ? rng.range(22, 32) : rng.range(36, 70);
    const h = Math.min(maxH, kind === 1 ? rng.range(70, 110) : kind === 2 ? rng.range(36, 54) : rng.range(50, 110));
    if (free.some(([a, b]) => x + w > a && x < b)) { x += 12; continue; }
    const c = rng.pick(SHELF_COLORS);
    const run = 1 + rng.int(4); // plusieurs fois le même produit côte à côte, comme en vrai
    for (let k = 0; k < run && x < x1 - 60 && !free.some(([a, b]) => x + w > a && x < b); k += 1) {
      const y = level - h;
      if (kind === 1) {
        parts.push(`<rect x="${r1(x + w * 0.3)}" y="${r1(y - 16)}" width="${r1(w * 0.4)}" height="20" rx="3" fill="${mix(c, '#000000', 0.25)}"/>`);
        parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="8" fill="${c}"/>`);
      } else {
        parts.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${kind === 3 ? 10 : 2}" fill="${c}"/>`);
        parts.push(`<rect x="${r1(x + w * 0.72)}" y="${r1(y)}" width="${r1(w * 0.28)}" height="${r1(h)}" fill="${mix(c, '#000000', 0.2)}"/>`);
      }
      parts.push(`<rect x="${r1(x + w * 0.12)}" y="${r1(y + h * 0.3)}" width="${r1(w * 0.5)}" height="${r1(h * 0.22)}" fill="${mix(c, '#f7f1e1', 0.6)}"/>`);
      x += w + 3;
    }
    x += rng.range(4, 14);
  }
  return `<g stroke="#2a2218" stroke-opacity=".35" stroke-width="1.5">${parts.join('')}</g>`;
}

function unit(rng, [x0, x1], index) {
  const parts = [];
  parts.push(`<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${FLOOR_Y - top + 12}" fill="url(#peg)"/>`);
  // Fronton avec panneau de rayon.
  parts.push(`<rect x="${x0}" y="${top - 52}" width="${x1 - x0}" height="56" fill="#87949a"/>`);
  const cx = (x0 + x1) / 2;
  const labels = ['PETIT-DÉJEUNER', 'FRAIS ET MOINS FRAIS', 'ÉPICERIE SANS FIN'];
  parts.push(`<rect x="${cx - 200}" y="${top - 46}" width="400" height="44" rx="4" fill="#efe6cc"/>`);
  parts.push(text(cx, top - 15, 26, labels[index % labels.length], '#4a4136'));
  // Montants.
  const posts = [x0, x1 - 22];
  for (let x = x0 + 450; x < x1 - 200; x += 450) posts.push(x);
  for (const x of posts) parts.push(`<rect x="${x}" y="${top}" width="22" height="${FLOOR_Y - top + 12}" fill="#7f898d"/>`);
  // Étagères garnies, du haut vers le bas.
  let prev = top;
  for (const level of levels) {
    parts.push(filler(rng, x0, x1, level, level - prev - 22));
    parts.push(`<rect x="${x0}" y="${level}" width="${x1 - x0}" height="24" fill="#97a1a5"/>`);
    parts.push(`<rect x="${x0}" y="${level + 4}" width="${x1 - x0}" height="15" fill="#ece3c6"/>`);
    for (let x = x0 + 40; x < x1 - 40; x += 110 + rng.int(40)) {
      parts.push(`<rect x="${x}" y="${level + 5}" width="38" height="13" fill="#e3c547"/><rect x="${x + 4}" y="${level + 8}" width="16" height="2" fill="#3b332a"/>`);
    }
    prev = level + 24;
  }
  // Bords des allées transversales : une tranche plus sombre donne l'épaisseur.
  parts.push(`<rect x="${x0}" y="${top - 52}" width="8" height="${FLOOR_Y - top + 64}" fill="#5f686c"/>`);
  parts.push(`<rect x="${x1 - 8}" y="${top - 52}" width="8" height="${FLOOR_Y - top + 64}" fill="#5f686c"/>`);
  return parts.join('\n');
}

export function buildWall() {
  const rng = createRng(42);
  const defs = `<defs><pattern id="peg" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#bab29d"/><circle cx="11" cy="11" r="2.2" fill="#a39b85"/></pattern></defs>`;
  const body = [defs, floor(), ...units.map((u, i) => unit(rng, u, i))].join('\n');
  return [['aisle/wall.svg', svg(W, H, body)]];
}
