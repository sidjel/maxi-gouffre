/**
 * Les 10 produits scannables, en papier découpé. Taille = champs w et h de products.json.
 * Une marge de 12 px autour laisse la place au bord de papier.
 */
import { readFileSync } from 'node:fs';
import { svg, paperCut, text } from './paper.mjs';

const products = JSON.parse(readFileSync(new URL('../../src/data/products.json', import.meta.url)));

const BODIES = {
  banane: () => [0, 1, 2].map((i) => `
<g transform="rotate(${-8 + i * 9} 120 30) translate(0 ${-i * 6})">
<path d="M22 44 Q76 112 136 34 Q134 52 124 62 Q76 98 30 56 Z" fill="${i === 1 ? '#e8cb52' : '#e1c044'}"/>
<path d="M22 44 L14 40 L26 52 Z" fill="#6e5a26"/>
</g>`).join('') + '<path d="M128 30 L140 14 L148 20 L136 36 Z" fill="#7a6a30"/><circle cx="70" cy="72" r="3" fill="#8a6f2e"/><circle cx="92" cy="66" r="2.5" fill="#8a6f2e"/>',
  lait: () => `
<path d="M14 34 L44 12 L76 34 Z" fill="#e3ddd0"/><rect x="38" y="4" width="14" height="10" fill="#d8d2c4"/>
<rect x="14" y="34" width="62" height="106" fill="#f1ede2"/><rect x="60" y="34" width="16" height="106" fill="#d9d3c5"/>
<rect x="14" y="70" width="62" height="34" fill="#6f8fa8"/>
${text(38, 93, 15, 'LAIT', '#f7f1e1')}
<path d="M38 116 q-8 10 0 14 q8 -4 0 -14 Z" fill="#9db6c4"/>`,
  steak: () => `
<rect x="10" y="26" width="130" height="54" rx="10" fill="#efe8dc"/>
<ellipse cx="72" cy="52" rx="50" ry="19" fill="#a8463e"/>
<ellipse cx="60" cy="47" rx="7" ry="3" fill="#d98a7c"/><ellipse cx="84" cy="56" rx="6" ry="3" fill="#d98a7c"/><ellipse cx="74" cy="42" rx="4" ry="2" fill="#d98a7c"/>
<path d="M22 32 L128 32" stroke="#ffffff" stroke-opacity=".7" stroke-width="4" fill="none"/>
<rect x="96" y="58" width="40" height="18" rx="2" fill="#e3c547"/>
${text(116, 72, 11, '−30 %')}`,
  baguette: () => `
<g transform="rotate(-12 95 42)">
<rect x="10" y="28" width="172" height="30" rx="15" fill="#d4a253"/>
<path d="M46 36 l16 10 M78 34 l16 12 M112 34 l16 12 M144 36 l14 10" stroke="#efe2c2" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M10 22 L74 22 L82 64 L10 64 Z" fill="#efe8dc"/>
${text(42, 48, 11, 'BAGUETTE', '#8a6f4e')}
</g>`,
  glace: () => `
<path d="M16 34 L104 34 L94 100 L26 100 Z" fill="#f4ecd2"/>
<path d="M84 34 L104 34 L94 100 L80 100 Z" fill="#e2d8ba"/>
<ellipse cx="60" cy="32" rx="46" ry="11" fill="#9db6c4"/>
<rect x="22" y="56" width="74" height="22" fill="#c7b37c"/>
${text(58, 72, 13, 'VANILLE', '#f7f1e1')}
<circle cx="40" cy="90" r="3" fill="#c7b37c"/><circle cx="56" cy="92" r="2" fill="#c7b37c"/>`,
  pile: () => `
<rect x="6" y="6" width="68" height="108" rx="6" fill="#d8d2c0"/><circle cx="40" cy="16" r="5" fill="#a39b85"/>
<rect x="34" y="26" width="12" height="8" fill="#9a9a90"/>
<rect x="22" y="32" width="36" height="70" rx="6" fill="#3c3f44"/>
<rect x="22" y="32" width="36" height="18" rx="4" fill="#c08a3c"/>
${text(40, 47, 14, '+', '#3c3f44')}
${text(40, 82, 12, '1,5 V', '#e8e2d0')}`,
  cereales: () => `
<path d="M84 16 L100 8 L100 142 L84 150 Z" fill="#8f5f2a"/>
<rect x="10" y="16" width="74" height="134" fill="#cf9a3e"/>
<rect x="10" y="26" width="74" height="28" fill="#e8d7a6"/>
${text(47, 45, 11, 'CÉRÉALES', '#8f5f2a')}
<path d="M20 108 Q47 140 74 108 Z" fill="#efe6cc"/>
<circle cx="34" cy="104" r="5" fill="#a8742e"/><circle cx="48" cy="100" r="6" fill="#b98436"/><circle cx="60" cy="105" r="5" fill="#a8742e"/>
<circle cx="47" cy="76" r="12" fill="#e3c547"/>`,
  biere: () => `
<rect x="24" y="16" width="12" height="38" fill="#7a5124"/><rect x="22" y="8" width="16" height="10" rx="2" fill="#c98f36"/>
<path d="M24 54 Q12 62 12 78 L12 158 Q12 164 18 164 L42 164 Q48 164 48 158 L48 78 Q48 62 36 54 Z" fill="#7a5124"/>
<rect x="14" y="96" width="32" height="42" fill="#efe3c4"/>
${text(30, 121, 7, 'BLONDE', '#7a5124')}
<rect x="17" y="66" width="5" height="88" rx="2" fill="#ffffff" opacity=".25"/>`,
  plante: () => `
<ellipse cx="44" cy="70" rx="14" ry="40" transform="rotate(-30 44 70)" fill="#6f8f4e"/>
<ellipse cx="78" cy="66" rx="14" ry="42" transform="rotate(28 78 66)" fill="#4c6a38"/>
<ellipse cx="60" cy="52" rx="13" ry="46" fill="#6f8f4e"/>
<ellipse cx="34" cy="98" rx="10" ry="26" transform="rotate(-60 34 98)" fill="#4c6a38"/>
<ellipse cx="88" cy="98" rx="10" ry="26" transform="rotate(60 88 98)" fill="#6f8f4e"/>
<path d="M30 116 L90 116 L82 162 L38 162 Z" fill="#b5683f"/><rect x="26" y="108" width="68" height="14" rx="3" fill="#a05a35"/>`,
  fromage: () => `
<path d="M14 78 L118 78 L130 44 L32 32 Z" fill="#f3e3a8"/>
<path d="M14 78 L118 78 L118 92 L14 92 Z" fill="#e7c15a"/>
<path d="M118 78 L130 44 L130 60 L118 92 Z" fill="#c99c34"/>
<circle cx="60" cy="56" r="7" fill="#e7c15a"/><circle cx="92" cy="60" r="5" fill="#e7c15a"/><circle cx="44" cy="68" r="4" fill="#e7c15a"/>
<path d="M30 92 q4 10 8 0 M70 92 q5 14 10 0" fill="#e7c15a"/>`,
};

export function buildProducts() {
  return products.map((p) => {
    const draw = BODIES[p.id];
    if (!draw) throw new Error(`Pas de dessin provisoire pour ${p.id}`);
    return [`products/${p.id}.svg`, svg(p.w, p.h, paperCut(p.id, draw(), { border: 6 }))];
  });
}
