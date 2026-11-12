/**
 * Éléments de décor isolés : premier plan (pilier, tête de gondole, panonceau suspendu)
 * et obstacles posés au sol (palette d'eau, bac promo, panneau « sol glissant »).
 */
import { createRng } from '../../src/core/rng.js';
import { svg, paperCut, text, mix, r1 } from './paper.mjs';

function pillar() {
  const body = `
<rect x="0" y="0" width="150" height="1080" fill="#d8d0bb"/>
<rect x="150" y="0" width="60" height="1080" fill="#b9b19c"/>
<rect x="0" y="980" width="150" height="100" fill="#8d8676"/><rect x="150" y="980" width="60" height="100" fill="#756f61"/>
<rect x="0" y="560" width="150" height="16" fill="#9a927e"/>
<rect x="18" y="380" width="114" height="120" rx="6" fill="#6f8f6b"/>
${text(75, 440, 26, 'SORTIE', '#f7f1e1')}
${text(75, 478, 30, '↑', '#f7f1e1')}
<rect x="28" y="640" width="94" height="130" fill="#efe6cc"/>
${text(75, 672, 13, 'AVIS', '#4a4136')}
${text(75, 694, 11, 'LE MAGASIN', '#4a4136')}
${text(75, 710, 11, 'DÉCLINE TOUTE', '#4a4136')}
${text(75, 726, 11, 'RESPONSABILITÉ', '#4a4136')}
${text(75, 742, 11, 'EN CAS DE', '#4a4136')}
${text(75, 758, 11, 'TOUT.', '#4a4136')}`;
  return svg(210, 1080, `<g stroke="#2a2218" stroke-opacity=".5" stroke-width="2">${body}</g>`);
}

function endcap() {
  const rng = createRng(5);
  const cans = [];
  for (let row = 0; row < 4; row += 1) {
    const n = 9 - row * 2;
    for (let i = 0; i < n; i += 1) {
      const x = 330 - (n * 58) / 2 + i * 58;
      const y = 250 - row * 54;
      const c = rng.pick(['#b9553f', '#c9a84a']);
      cans.push(`<rect x="${x}" y="${y}" width="52" height="52" rx="6" fill="${c}"/><rect x="${x + 6}" y="${y + 18}" width="40" height="14" fill="${mix(c, '#f7f1e1', 0.6)}"/>`);
    }
  }
  const body = `
<rect x="20" y="300" width="620" height="40" fill="#7f898d"/>
<rect x="10" y="92" width="640" height="18" fill="#97a1a5"/>
${cans.join('')}
<rect x="160" y="8" width="340" height="78" rx="6" fill="#e3c547"/>
${text(330, 42, 26, '3 POUR LE PRIX DE 4')}
${text(330, 72, 16, 'OFFRE PERMANENTE')}`;
  return svg(660, 320, paperCut('e', body, { border: 7 }));
}

function sign() {
  const body = `
<rect x="20" y="62" width="480" height="116" rx="8" fill="#efe6cc"/>
<rect x="20" y="62" width="480" height="20" rx="4" fill="#87949a"/>
${text(260, 132, 46, 'RAYON 7')}
${text(260, 164, 19, 'PETIT-DÉJEUNER ET AUTRES REGRETS', '#6b604f')}`;
  const wires = '<path d="M90 0 L90 64 M430 0 L430 64" stroke="#5f686c" stroke-width="4"/>';
  return svg(520, 190, wires + paperCut('s', body, { border: 6 }));
}

function pallet() {
  const packs = [];
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 4; i += 1) {
      const x = 22 + i * 80 + (row % 2) * 8;
      const y = 196 - row * 72;
      packs.push(`<rect x="${x}" y="${y}" width="76" height="70" rx="8" fill="#9db6c4"/>`);
      for (let b = 0; b < 3; b += 1) packs.push(`<rect x="${x + 8 + b * 22}" y="${y + 8}" width="16" height="54" rx="6" fill="#bcd0da"/>`);
    }
  }
  const body = `
<rect x="16" y="266" width="328" height="14" fill="#a8834f"/><rect x="16" y="284" width="40" height="14" fill="#8e6c3d"/>
<rect x="160" y="284" width="40" height="14" fill="#8e6c3d"/><rect x="304" y="284" width="40" height="14" fill="#8e6c3d"/>
${packs.join('')}
<rect x="104" y="128" width="150" height="60" rx="4" fill="#efe6cc"/>
${text(179, 154, 18, 'EAU PLATE')}
${text(179, 176, 13, 'LOT DE 48 · SANS FIN')}`;
  return svg(360, 300, paperCut('p', body, { border: 7 }));
}

function bin() {
  const rng = createRng(11);
  const stuff = [];
  for (let i = 0; i < 14; i += 1) {
    stuff.push(`<ellipse cx="${r1(40 + i * 17 + rng.range(-6, 6))}" cy="${r1(62 + rng.range(-14, 8))}" rx="${r1(rng.range(14, 24))}" ry="${r1(rng.range(10, 18))}" fill="${rng.pick(['#8a9a6b', '#6f8796', '#c9a84a', '#d8cfb6', '#7d6a8a'])}"/>`);
  }
  const body = `
${stuff.join('')}
<path d="M20 70 L280 70 L262 192 L38 192 Z" fill="#a9503c"/>
<path d="M20 70 L280 70 L276 92 L24 92 Z" fill="#8a3f30"/>
<rect x="56" y="110" width="188" height="60" rx="6" fill="#efe6cc"/>
${text(150, 138, 18, 'TOUT À 0,99 €')}
${text(150, 158, 9.5, 'MÊME CE QUI N’EST PAS À VENDRE')}`;
  return svg(300, 200, paperCut('b', body, { border: 7 }));
}

function wetFloor() {
  const body = `
<path d="M65 8 L118 180 L12 180 Z" fill="#e3c547"/>
<path d="M65 8 L118 180 L106 180 L65 30 Z" fill="#c9ab33"/>
<circle cx="62" cy="70" r="8" fill="#3b332a"/>
<path d="M58 80 L48 110 L70 112 M52 96 L74 88 M48 110 L36 128" stroke="#3b332a" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M30 136 Q65 128 96 138" stroke="#3b332a" stroke-width="3" fill="none"/>
${text(65, 156, 11, 'SOL GLISSANT')}
${text(65, 170, 8, 'ET LA VIE AUSSI')}`;
  return svg(130, 190, paperCut('w', body, { border: 5 }));
}

export function buildBits() {
  return [
    ['aisle/pillar.svg', pillar()],
    ['aisle/endcap.svg', endcap()],
    ['aisle/sign.svg', sign()],
    ['aisle/pallet.svg', pallet()],
    ['aisle/bin.svg', bin()],
    ['aisle/wetfloor.svg', wetFloor()],
  ];
}
