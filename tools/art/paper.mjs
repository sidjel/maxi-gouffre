/**
 * Aides pour dessiner les visuels PROVISOIRES en « papier découpé » (SVG).
 * Ils seront remplacés par les dessins de l'auteur : seules les données pointent vers ces fichiers.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const PAPER = '#f7f1e1';
export const INK = '#3b332a';
export const FONT = 'Arial, Helvetica, sans-serif';

/** Document SVG complet. */
export const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${body}\n</svg>\n`;

/**
 * Silhouette découpée : ombre portée, bord de papier blanc, puis le dessin avec un trait d'encre.
 * Les formes du dessin ne donnent que leur remplissage (fill) ; le trait vient du groupe.
 */
export function paperCut(id, body, { border = 9, ink = 2.5, shadow = [4, 5] } = {}) {
  return `<defs><g id="${id}">${body}</g></defs>
<use href="#${id}" transform="translate(${shadow[0]} ${shadow[1]})" stroke="#2a2218" stroke-opacity=".22" stroke-width="${border * 2}" stroke-linejoin="round" opacity=".9"/>
<use href="#${id}" stroke="${PAPER}" stroke-width="${border * 2}" stroke-linejoin="round"/>
<use href="#${id}" stroke="${INK}" stroke-width="${ink}" stroke-linejoin="round"/>`;
}

/** Texte centré (polices système : un SVG affiché en image ne charge pas les polices du jeu). */
export const text = (x, y, size, content, fill = INK, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-weight="700" font-size="${size}" text-anchor="middle" fill="${fill}" stroke="none" ${extra}>${content}</text>`;

/** Mélange deux couleurs #rrggbb (t = 0 → a, t = 1 → b). */
export function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** Couleurs ternes de magasin pour les produits de remplissage. */
export const SHELF_COLORS = ['#b9553f', '#8a9a6b', '#c9a84a', '#6f8796', '#a77d5a', '#d8cfb6', '#7d6a8a', '#9c8f6a', '#c7826a', '#5f7a6e'];

export function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

export const r1 = (n) => Math.round(n * 10) / 10;
