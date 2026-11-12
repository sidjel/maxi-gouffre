/**
 * Le lointain : un plafond de tubes qui ne finit pas et des rangées de rayons
 * qui se perdent dans une brume beige. On le voit au-dessus des gondoles et par les allées transversales.
 */
import { createRng } from '../../src/core/rng.js';
import { svg, mix, SHELF_COLORS, r1 } from './paper.mjs';

const W = 3300;
const H = 1080;
const HORIZON = 470;
const VX = W / 2;
const HAZE = '#d3cdb6';

function ceiling(rng) {
  const parts = [`<rect width="${W}" height="${HORIZON}" fill="#e0dbc8"/>`];
  // Lignes du faux plafond : de plus en plus serrées vers l'horizon.
  const rows = [];
  for (let i = 0; i < 16; i += 1) rows.push(HORIZON - 440 / (1 + i * 0.55));
  for (const y of rows) parts.push(`<rect x="0" y="${r1(y)}" width="${W}" height="${r1(Math.max(1, 3 * (HORIZON - y) / 440))}" fill="#cbc5b0"/>`);
  for (let x = -2400; x < W + 2400; x += 240) {
    parts.push(`<path d="M${x} 0 L${r1(VX + (x - VX) * 0.08)} ${HORIZON - 6}" stroke="#cbc5b0" stroke-width="3"/>`);
  }
  // Tubes fluorescents (pâles, pas de néon) ; quelques-uns sont morts.
  for (let i = 0; i < rows.length - 1; i += 1) {
    const y = (rows[i] + rows[i + 1]) / 2;
    const s = (HORIZON - y) / 440;
    for (let x = -2280; x < W + 2400; x += 480) {
      const xx = VX + (x - VX) * (0.08 + 0.92 * s);
      if (xx < -200 || xx > W + 200) continue;
      const dead = rng.next() < 0.1;
      const fill = dead ? '#bdb7a2' : mix('#fbf8ec', HAZE, 1 - s);
      if (!dead) parts.push(`<ellipse cx="${r1(xx)}" cy="${r1(y)}" rx="${r1(130 * s)}" ry="${r1(26 * s)}" fill="#f4f0e0" opacity=".45"/>`);
      parts.push(`<rect x="${r1(xx - 80 * s)}" y="${r1(y - 7 * s)}" width="${r1(160 * s)}" height="${r1(Math.max(1.5, 14 * s))}" rx="${r1(4 * s)}" fill="${fill}"/>`);
    }
  }
  return parts.join('\n');
}

function shelfRow(rng, depth) {
  // depth : 0 (au loin) … 1 (proche)
  const s = 0.05 + depth * 0.55;
  const fog = 1 - depth;
  const base = HORIZON + 330 * s;
  const h = 520 * s;
  const parts = [];
  const color = mix('#b7af9a', HAZE, fog * 0.85);
  const gapEvery = 1400 * s + 200;
  let x = -rng.range(0, gapEvery);
  while (x < W) {
    const len = gapEvery * rng.range(0.6, 1);
    parts.push(`<rect x="${r1(x)}" y="${r1(base - h)}" width="${r1(len)}" height="${r1(h)}" fill="${color}"/>`);
    // Taches de produits, de plus en plus fondues dans la brume.
    const step = Math.max(16, 60 * s);
    for (let lv = 1; lv <= 4; lv += 1) {
      const yy = base - h + (h * lv) / 4.4;
      parts.push(`<rect x="${r1(x)}" y="${r1(yy)}" width="${r1(len)}" height="${r1(Math.max(1, 8 * s))}" fill="${mix('#8f989b', HAZE, fog * 0.85)}"/>`);
      for (let px = x + step * 0.3; px < x + len - step; px += step * rng.range(0.9, 1.5)) {
        const ph = (h / 4.4) * rng.range(0.4, 0.85);
        parts.push(`<rect x="${r1(px)}" y="${r1(yy - ph)}" width="${r1(step * 0.8)}" height="${r1(ph)}" fill="${mix(rng.pick(SHELF_COLORS), HAZE, fog * 0.88)}"/>`);
      }
    }
    x += len + gapEvery * rng.range(0.18, 0.3);
  }
  return parts.join('');
}

export function buildFar() {
  const rng = createRng(99);
  const parts = [`<rect width="${W}" height="${H}" fill="${HAZE}"/>`, ceiling(rng)];
  parts.push(`<rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="${mix('#c9c1a5', HAZE, 0.35)}"/>`);
  for (let i = 0; i <= 9; i += 1) parts.push(shelfRow(rng, i / 9));
  // Brume près de l'horizon.
  parts.push(`<defs><linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HAZE}" stop-opacity="0"/><stop offset=".5" stop-color="${HAZE}" stop-opacity=".85"/><stop offset="1" stop-color="${HAZE}" stop-opacity="0"/></linearGradient></defs>`);
  parts.push(`<rect x="0" y="${HORIZON - 90}" width="${W}" height="180" fill="url(#haze)"/>`);
  return [['aisle/far.svg', svg(W, H, parts.join('\n'))]];
}
