/**
 * Illustrations provisoires : humains, animaux, végétaux (GD §7.3 : influenceur, enfant, Kévin,
 * plante, chat, grand-mère). Personnages génériques, aucun personnage existant.
 */
import { C, INK, line, svg, rays, dots, shadow, eyes, mouth, mold, sparkle, plus, minus, coin, drop, zzz, arrow } from './lib.mjs';

/** Buste générique : bras (derrière), torse, cou, tête, cheveux, visage, ajouts. */
function person({ skin = C.skin, shirt, hair = '', face = '', arms = '', extra = '', cy = 100 }) {
  return `${arms}<path d="M64 240 Q64 160 128 158 Q192 160 192 240 Z" fill="${shirt}" ${line()}/>`
    + `<rect x="114" y="${cy + 30}" width="28" height="30" fill="${skin}" ${line(5)}/>`
    + `<circle cx="128" cy="${cy}" r="42" fill="${skin}" ${line()}/>${hair}${face}${extra}`;
}

/** Bras tendu vers un côté (dir = -1 gauche, 1 droite), main ronde au bout. */
const armOut = (dir, skin, sleeve, y = 176, lift = 0) => {
  const x = 128 + dir * 50;
  const hx = 128 + dir * 104;
  return `<path d="M${x} ${y} L${hx} ${y - lift}" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>`
    + `<path d="M${x} ${y} L${hx} ${y - lift}" stroke="${sleeve}" stroke-width="18" stroke-linecap="round"/>`
    + `<circle cx="${hx}" cy="${y - lift}" r="13" fill="${skin}" ${line(5)}/>`;
};

const pot = (extra = '') => `${shadow(128, 228, 60)}<path d="M80 168 H176 L164 226 H92 Z" fill="${C.orange}" ${line()}/><rect x="72" y="156" width="112" height="22" rx="6" fill="${C.orange}" ${line()}/>${extra}`;
const leaf = (x, y, a, s = 1, fill = C.green) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0 Q20 -30 0 -60 Q-20 -30 0 0 Z" fill="${fill}" ${line(5)}/><path d="M0 -6 V-50" stroke="${C.leaf}" stroke-width="3"/></g>`;
const flower = (x, y, f = C.pink) => [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - 12}" rx="8" ry="12" fill="${f}" ${line(3)} transform="rotate(${a} ${x} ${y})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="7" fill="${C.yellow}" ${line(3)}/>`;

/** Petite bactérie (proie du chat), en haut de l'image : l'avant. */
const germ = (x = 128, y = 40, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="20" fill="${C.slime}" ${line(5)}/>`
  + `<path d="M-20 0 h-10 M20 0 h10 M0 -20 v-10" ${line(4)}/>${eyes(-7, -2, 7, -2, 'wide', 5)}</g>`;
const cat = (fur, { mood = 'angry', mouthKind = 'grin', belly = 0, extra = '' } = {}) => `${shadow(128, 228, 72 + belly)}`
  + `<path d="M190 200 Q240 170 222 120" fill="none" ${line(14)}/><path d="M190 200 Q240 170 222 120" fill="none" stroke="${fur}" stroke-width="7" stroke-linecap="round"/>`
  + `<ellipse cx="128" cy="186" rx="${62 + belly}" ry="${44 + belly / 2}" fill="${fur}" ${line()}/>`
  + `<path d="M78 120 L84 70 L110 96 Z M178 120 L172 70 L146 96 Z" fill="${fur}" ${line()}/>`
  + `<ellipse cx="128" cy="124" rx="56" ry="44" fill="${fur}" ${line()}/>${eyes(106, 116, 150, 116, mood, 11)}`
  + `<path d="M122 132 h12 l-6 6 z" fill="${C.pink}" ${line(3)}/>${mouth(128, 146, mouthKind, 30)}`
  + `<path d="M70 134 h-28 M70 142 l-26 8 M186 134 h28 M186 142 l26 8" ${line(3)}/>${extra}`;

const glasses = (y = 98) => `<circle cx="110" cy="${y}" r="15" fill="none" ${line(4)}/><circle cx="146" cy="${y}" r="15" fill="none" ${line(4)}/><path d="M125 ${y} h6" ${line(4)}/>`;
const bun = '<circle cx="128" cy="52" r="22" fill="#e0e0e0" stroke="#1b1b1f" stroke-width="6"/><path d="M88 92 Q90 54 128 56 Q166 54 168 92 Q150 72 128 74 Q106 72 88 92 Z" fill="#e0e0e0" stroke="#1b1b1f" stroke-width="6" stroke-linejoin="round"/>';
const cap = (fill) => `<path d="M86 86 Q88 50 128 50 Q168 50 170 86 Z" fill="${fill}" ${line()}/><path d="M162 84 H200" ${line(10)}/>`;

export const living = {
  influenceur: [
    () => svg(person({ shirt: C.tomato, arms: armOut(-1, C.skin, C.tomato, 180, 30) + armOut(1, C.skin, C.tomato, 180, 30),
      hair: `<path d="M86 92 Q84 52 128 54 Q172 52 170 92 Q160 66 128 66 Q96 66 86 92 Z" fill="${C.darkBrown}" ${line()}/><rect x="86" y="74" width="84" height="12" fill="${C.mint}" ${line(4)}/>`,
      face: eyes(112, 102, 144, 102, 'happy', 9) + mouth(128, 118, 'grin', 32), extra: plus(24, 120, 16) + plus(232, 120, 16) + sparkle(56, 50, 10) + sparkle(200, 50, 10) }), rays(C.mint, '#a8e6cf')),
    () => svg(person({ shirt: '#c97a6a', arms: armOut(-1, C.skin, '#c97a6a', 190, 8) + armOut(1, C.skin, '#c97a6a', 190, 8),
      hair: `<path d="M86 92 Q84 52 128 54 Q172 52 170 92 Q160 66 128 66 Q96 66 86 92 Z" fill="${C.darkBrown}" ${line()}/><rect x="86" y="74" width="84" height="12" fill="#a0b8a8" ${line(4)}/>`,
      face: eyes(112, 104, 144, 104, 'sleepy', 9) + `<path d="M102 114 q10 6 20 0 M134 114 q10 6 20 0" fill="none" stroke="${C.purple}" stroke-width="3"/>` + mouth(128, 126, 'flat', 20),
      extra: plus(26, 150, 11) + plus(230, 150, 11) + drop(170, 76, 1) }), rays('#cfd8dc', '#eceff1')),
    () => svg(person({ skin: '#c9b8a0', shirt: '#616161', arms: armOut(-1, '#c9b8a0', '#616161', 200, -20) + armOut(1, '#c9b8a0', '#616161', 200, -20),
      hair: `<path d="M86 92 Q84 52 128 54 Q172 52 170 92 Q160 66 128 66 Q96 66 86 92 Z" fill="${C.darkBrown}" ${line()}/>`,
      face: eyes(112, 102, 144, 102, 'sad', 9) + mouth(128, 118, 'frown', 24),
      extra: `<rect x="150" y="186" width="34" height="50" rx="5" fill="${INK}" transform="rotate(20 167 211)"/><path d="M156 196 l20 12 l-12 10 l18 10" fill="none" stroke="${C.white}" stroke-width="3" transform="rotate(20 167 211)"/>`
        + minus(30, 140, 15) + minus(226, 140, 15) }), rays('#212121', '#424242')),
  ],
  enfant: [
    () => svg(person({ shirt: C.blue, cy: 108, hair: `<path d="M90 96 Q92 62 128 64 Q164 62 166 96 Q148 80 128 82 Q108 80 90 96 Z" fill="${C.orange}" ${line()}/>`,
      face: `<path d="M102 102 l14 6 M154 102 l-14 6" ${line(5)}/>` + `<ellipse cx="128" cy="130" rx="22" ry="18" fill="${C.darkBrown}" ${line(5)}/><path d="M114 126 q14 -8 28 0" fill="${C.pink}"/>` + drop(96, 120, 1) + drop(160, 120, 1),
      extra: `<path d="M40 70 l-20 -10 M36 100 h-24 M44 130 l-20 10 M216 70 l20 -10 M220 100 h24 M212 130 l20 10" ${line(6)}/>` }), rays(C.tomato, '#ef5350')),
    () => svg(person({ shirt: '#6c8fb8', cy: 112, hair: `<path d="M90 100 Q92 66 128 68 Q164 66 166 100 Q148 84 128 86 Q108 84 90 100 Z" fill="${C.orange}" ${line()}/>`,
      face: eyes(112, 110, 144, 110, 'sleepy', 9) + `<path d="M118 130 q10 6 20 0 q-2 14 -10 14 q-8 0 -10 -14 z" fill="${C.pink}" ${line(4)}/>` + drop(172, 84, 1.2) + drop(84, 96, 0.9) }), rays('#90a4ae', '#b0bec5')),
    () => svg(person({ shirt: '#b39ddb', cy: 112, hair: `<path d="M90 100 Q92 66 128 68 Q164 66 166 100 Q148 84 128 86 Q108 84 90 100 Z" fill="${C.orange}" ${line()}/>`,
      face: eyes(112, 112, 144, 112, 'sleepy', 9) + `<circle cx="128" cy="134" r="10" fill="${C.pink}" ${line(4)}/>`, extra: zzz(176, 70) }), rays('#283593', '#3949ab')),
  ],
  kevin: [
    () => svg(person({ shirt: C.blue, hair: cap(C.tomato), face: eyes(112, 102, 144, 102, 'open', 9) + mouth(128, 120, 'smile', 26),
      extra: `<rect x="140" y="182" width="34" height="22" rx="4" fill="${C.white}" ${line(4)}/><path d="M92 190 v30 M100 190 v30 M106 190 v30 M114 190 v30" stroke="${C.white}" stroke-width="3"/>` }), rays(C.yellow, '#ffe680')),
    () => svg(person({ shirt: '#e0e0e0', hair: `<path d="M86 88 Q86 56 128 56 Q170 56 170 88 Q150 70 128 72 Q106 70 86 88 Z" fill="${C.darkBrown}" ${line()}/>`,
      face: eyes(112, 102, 144, 102, 'angry', 9) + mouth(128, 122, 'flat', 22),
      extra: `${shadow(128, 240, 90)}<rect x="40" y="186" width="176" height="56" fill="${C.beige}" ${line()}/><path d="M40 186 L20 166 M216 186 L236 166" ${line(6)}/><path d="M60 186 l10 -26 h24 l6 26 M150 186 l20 -30 l16 30" fill="${C.tomato}" ${line(4)}/>` }), rays('#bcaaa4', '#d7ccc8')),
    () => svg(person({ shirt: C.tomato, hair: cap(C.red), arms: `<path d="M86 176 L50 96" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M86 176 L50 96" stroke="${C.tomato}" stroke-width="18" stroke-linecap="round"/><circle cx="50" cy="90" r="16" fill="${C.skin}" ${line(5)}/>`
      + `<path d="M50 74 V20 M50 20 h50 v34 h-50" fill="${C.tomato}" ${line(5)}/>`,
    face: eyes(112, 102, 144, 102, 'angry', 9) + mouth(128, 120, 'scream', 24),
    extra: `<path d="M176 116 L214 96 V146 L176 128 Z" fill="${C.white}" ${line(5)}/><path d="M222 104 l14 -8 M224 122 h16 M222 138 l14 8" ${line(4)}/>` + plus(52, 214, 13) + plus(128, 232, 13) + plus(204, 214, 13) }), rays(C.tomato, '#ef5350')),
  ],
  plante: [
    () => svg(pot(`<path d="M128 160 V110" ${line(7)}/>${leaf(128, 124, -40)}${leaf(128, 120, 40)}${leaf(128, 112, 0, 0.8)}`), rays(C.mint, '#a8e6cf')),
    () => svg(pot(`<path d="M128 160 V70" ${line(7)}/>${leaf(128, 150, -60, 1.1)}${leaf(128, 150, 60, 1.1)}${leaf(128, 120, -30)}${leaf(128, 120, 30)}`
      + flower(96, 76) + flower(160, 70, C.yellow) + flower(128, 44, C.tomato) + coin(40, 120) + coin(216, 120) + coin(48, 180, 11) + sparkle(210, 40, 10)), rays(C.green, '#66bb6a')),
    () => svg(pot(`<path d="M128 160 Q126 100 150 84 Q170 72 172 104" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M128 160 Q126 100 150 84 Q170 72 172 104" fill="none" stroke="${C.brown}" stroke-width="4" stroke-linecap="round"/>`
      + leaf(172, 104, 160, 0.6, '#8d6e3f') + leaf(96, 226, 100, 0.5, '#8d6e3f') + mold([[110, 168, 4], [146, 170, 4]], C.darkBrown)), dots('#a1887f')),
  ],
  chat: [
    () => svg(germ(128, 36, 0.9) + cat('#9e9e9e', { mood: 'angry', mouthKind: 'grin', extra: `<path d="M120 152 q8 10 16 0" fill="${C.pink}" ${line(3)}/>` }), rays(C.orange, '#ffa726')),
    () => svg(germ(128, 34, 0.8) + cat(C.orange, { mood: 'open', mouthKind: 'scream', belly: 22, extra: `<path d="M96 196 q32 16 64 0" fill="none" ${line(4)}/>` }), rays(C.yellow, '#ffe680')),
    () => svg(germ(128, 40, 0.8) + `${shadow(128, 226, 70)}<circle cx="128" cy="160" r="64" fill="#8d8a7a" ${line()}/>`
      + [[80, 120], [176, 130], [100, 210], [168, 200], [128, 100], [70, 170], [190, 170]].map(([x, y]) => `<path d="M${x} ${y} q8 -12 18 -4" fill="none" ${line(4)}/>`).join('')
      + eyes(108, 152, 148, 152, 'open', 11) + mouth(128, 180, 'grin', 30), dots('#6d6a5a')),
  ],
  grandmere: [
    () => svg(person({ shirt: C.purple, hair: bun, face: glasses(98) + eyes(110, 98, 146, 98, 'open', 7) + mouth(128, 122, 'wavy', 20),
      extra: `<path d="M206 240 V150 q0 -14 -14 -14" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M206 240 V150 q0 -14 -14 -14" fill="none" stroke="${C.brown}" stroke-width="5" stroke-linecap="round"/>` + drop(78, 76, 1.1) }), rays(C.sky, C.white)),
    () => svg(person({ shirt: C.purple, hair: bun, arms: armOut(-1, C.skin, C.purple, 170, 70) + armOut(1, C.skin, C.purple, 170, 70),
      face: `<g transform="rotate(-10 128 98)">${glasses(98)}</g>` + eyes(110, 98, 146, 98, 'wide', 7) + mouth(128, 122, 'scream', 22) + drop(84, 70, 1) + drop(176, 66, 1) }), rays(C.tomato, '#ef5350')),
    () => svg(`${shadow(128, 228, 96)}<path d="M40 130 H216 V220 H40 Z" fill="${C.brown}" ${line()}/><path d="M40 130 Q40 70 128 70 Q216 70 216 130 Z" fill="#8d6e3f" ${line()}/>`
      + `<path d="M40 130 Q128 100 216 130" fill="${C.gold}" ${line(5)}/>` + coin(90, 118) + coin(124, 108) + coin(160, 116) + coin(110, 92, 11)
      + `<rect x="116" y="140" width="24" height="30" rx="4" fill="${C.yellow}" ${line(5)}/>` + arrow(226, 180, 90, C.mint, 0.9) + sparkle(40, 50, 14) + sparkle(210, 46, 12), rays(C.gold, C.yellow)),
  ],
};
