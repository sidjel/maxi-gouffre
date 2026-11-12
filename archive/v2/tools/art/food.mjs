/**
 * Illustrations provisoires : aliments et boissons (GD §7.3 : banane, steak, lait, baguette, glace,
 * pizza, céréales, bière). Chaque famille donne ses 3 stades, du frais au pourri.
 */
import { C, INK, line, svg, rays, dots, shadow, eyes, mouth, mold, stink, sparkle, impact, arrow, minus, forbid, drop, smoke } from './lib.mjs';

const BANANA = 'M52 132 Q60 214 146 208 Q210 200 216 112 L200 106 Q194 168 142 176 Q84 182 72 126 Z';
const banana = (fill, extra = '') => `${shadow(132, 222, 80)}<path d="${BANANA}" fill="${fill}" ${line()}/>`
  + `<path d="M76 146 Q96 190 146 190" fill="none" stroke="${C.white}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>`
  + `<path d="M200 106 l10 -20 l10 4 l-4 22" fill="${C.brown}" ${line(5)}/><path d="M52 132 l-8 -6" ${line(8)}/>${extra}`;

const carton = (side, face, top, extra = '') => `${shadow(128, 226, 64)}<path d="M80 92 L128 92 L128 220 L80 220 Z" fill="${face}" ${line()}/>`
  + `<path d="M128 92 L176 80 L176 206 L128 220 Z" fill="${side}" ${line()}/><path d="M80 92 L104 52 L152 44 L176 80 L128 92 Z" fill="${top}" ${line()}/>`
  + `<path d="M104 52 L128 92" ${line(4)}/><path d="M98 40 L152 32 L152 44 L104 52 Z" fill="${top}" ${line(5)}/>${extra}`;

const bowl = (inside, extra = '') => `${shadow(128, 224, 86)}<path d="M40 128 Q48 214 128 214 Q208 214 216 128 Z" fill="${C.blue}" ${line()}/>`
  + `<ellipse cx="128" cy="128" rx="88" ry="22" fill="${C.white}" ${line()}/>${inside}<path d="M62 160 Q80 196 120 200" fill="none" stroke="${C.white}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>${extra}`;

const mug = (beer, foam, extra = '') => `${shadow(120, 224, 70)}<path d="M168 104 q40 0 40 40 t-40 40" fill="none" ${line(14)}/><path d="M168 104 q40 0 40 40 t-40 40" fill="none" stroke="${C.sky}" stroke-width="6"/>`
  + `<path d="M66 72 L174 72 L166 214 L74 214 Z" fill="${beer}" ${line()}/><path d="M92 92 L96 196 M120 92 L120 196 M148 92 L144 196" stroke="${C.white}" stroke-width="5" opacity="0.4" stroke-linecap="round"/>${foam}${extra}`;

const slice = (cheese, extra = '') => `${shadow(128, 224, 70)}<path d="M128 214 L52 58 Q128 30 204 58 Z" fill="${cheese}" ${line()}/>`
  + `<path d="M46 50 Q128 18 210 50 L204 66 Q128 40 52 66 Z" fill="${C.orange}" ${line()}/>${extra}`;

const pineapple = (pts) => pts.map(([x, y]) => `<path d="M${x - 10} ${y} l10 -10 l10 10 l-10 10 z" fill="${C.yellow}" ${line(4)}/>`).join('');

export const food = {
  banane: [
    () => svg(banana('#8bc34a', `<path d="M110 150 l4 -6 M140 160 l4 -6" ${line(4)}/>`), rays(C.mint, '#a8e6cf')),
    () => svg(banana(C.yellow, mold([[100, 170, 4], [150, 182, 4], [180, 150, 3]], C.brown) + sparkle(202, 168, 14) + sparkle(64, 92, 10)), rays(C.yellow, '#ffe680')),
    () => svg(`${shadow(128, 214, 104)}<path d="M28 196 Q30 168 70 166 Q92 132 132 148 Q176 128 196 164 Q234 166 230 198 Z" fill="${C.brown}" ${line()}/>`
      + `<path d="M28 196 Q16 200 10 214 M230 198 Q242 202 248 216" ${line(8)}/><path d="M28 196 Q16 200 10 214 M230 198 Q242 202 248 216" stroke="${C.brown}" stroke-width="4" stroke-linecap="round"/>`
      + mold([[90, 178, 8], [150, 168, 6], [180, 184, 5]], C.darkBrown) + eyes(108, 172, 146, 170, 'sleepy') + minus(36, 112, 16) + minus(220, 112, 16) + stink(108, 120), dots('#c9a227')),
  ],
  steak: [
    () => svg(`${shadow(128, 216, 96)}<rect x="30" y="96" width="196" height="112" rx="22" fill="${C.white}" ${line()}/>`
      + `<ellipse cx="128" cy="148" rx="74" ry="40" fill="#c0645a" ${line()}/>`
      + mold([[100, 140, 5], [130, 160, 5], [156, 138, 5], [116, 124, 4], [146, 168, 4]], '#8e3b33')
      + `<path d="M40 104 L76 104 M180 196 L214 196" stroke="${C.sky}" stroke-width="6" stroke-linecap="round"/>`, rays('#ffcdd2', C.white)),
    () => svg(`${shadow(128, 216, 96)}<rect x="30" y="96" width="196" height="112" rx="22" fill="#e6e0c8" ${line()}/>`
      + `<ellipse cx="128" cy="150" rx="74" ry="40" fill="#8d8a5a" ${line()}/>`
      + mold([[100, 140, 7], [134, 164, 6], [160, 138, 5]], C.purple) + eyes(110, 146, 146, 146, 'sad', 9) + mouth(128, 166, 'wavy', 22)
      + stink(96, 86, C.rot), rays('#d7ccc8', '#efebe9')),
    () => svg(`${impact(128, 36, 30, C.tomato)}${shadow(128, 226, 70)}<path d="M128 70 C186 70 206 120 198 164 C190 210 154 222 128 220 C96 222 60 206 56 162 C52 118 72 70 128 70 Z" fill="${C.slime}" ${line()}/>`
      + `<path d="M58 160 q-26 6 -34 30 M200 160 q26 6 34 30 M90 214 q-8 18 -26 22 M166 214 q8 18 26 22" fill="none" ${line(6)}/>`
      + `<path d="M84 106 Q128 60 172 106 Q128 140 84 106 Z" fill="${C.darkBrown}" ${line()}/>`
      + `<path d="M90 104 l8 -12 l8 10 l8 -14 l8 12 l8 -14 l8 12 l8 -12 l8 10 l8 -10 M92 110 l10 10 l8 -8 l8 10 l8 -8 l8 10 l8 -8 l8 10 l8 -10" fill="${C.white}" ${line(3)}/>`
      + eyes(104, 156, 152, 156, 'angry', 13) + mold([[86, 190, 6], [176, 186, 5], [130, 200, 4]], C.leaf), rays('#2e3b1f', '#3f5229')),
  ],
  lait: [
    () => svg(carton('#d6e6fb', C.white, C.blue, `<path d="M92 140 h28 v40 h-28 z" fill="${C.sky}" ${line(4)}/>${drop(106, 160, 1.4, C.white)}${sparkle(196, 70, 12)}`), rays(C.sky, C.white)),
    () => svg(`<g transform="rotate(-8 128 140)">${carton('#c8d6c0', '#f3f0dc', '#6c8fb8', `<path d="M86 120 q20 30 0 60" fill="none" ${line(4)}/>`
      + `<path d="M150 112 a14 14 0 1 1 -4 18 a8 8 0 1 0 6 -8" fill="none" ${line(5)}/>`)}</g>`
      + `<path d="M66 214 q-6 -20 10 -20 q4 -12 16 -4 q8 -8 16 4 q14 -2 10 20 z" fill="${C.cream}" ${line(5)}/>${stink(170, 40, C.rot)}`, rays('#e0e7c8', '#f4f6e8')),
    () => svg(`${shadow(128, 222, 96)}<path d="M28 196 L52 92 L228 140 L222 200 Z" fill="${C.yellow}" ${line()}/><path d="M52 92 L228 140 L196 92 Z" fill="${C.cream}" ${line()}/>`
      + `<circle cx="80" cy="176" r="12" fill="${C.gold}" ${line(4)}/><circle cx="196" cy="182" r="9" fill="${C.gold}" ${line(4)}/><circle cx="64" cy="130" r="8" fill="${C.gold}" ${line(4)}/>`
      + eyes(116, 150, 156, 154, 'wide', 14) + `<path d="M112 184 q24 18 48 2 q-4 18 -22 18 q-20 0 -26 -20 z" fill="${C.darkBrown}" ${line(5)}/><path d="M128 194 q6 14 16 4" fill="${C.pink}" ${line(4)}/>`
      + `<path d="M60 200 v20 M100 204 v18 M160 204 v18 M200 202 v18" ${line(8)}/>` + mold([[178, 112, 8], [96, 108, 5]], C.purple), rays(C.purple, '#9a5cc0')),
  ],
  baguette: [
    () => svg(`${shadow(128, 220, 96)}<g transform="rotate(-30 128 128)"><rect x="12" y="98" width="232" height="60" rx="30" fill="${C.gold}" ${line()}/>`
      + `<path d="M50 112 q14 16 28 0 M104 112 q14 16 28 0 M158 112 q14 16 28 0" fill="none" ${line(5)}/><path d="M30 142 H220" stroke="${C.cream}" stroke-width="6" stroke-linecap="round" opacity="0.6"/></g>${sparkle(206, 196, 12)}`, rays(C.yellow, '#ffe680')),
    () => svg(`${impact(132, 40, 32, C.white)}${arrow(132, 40, 0, C.tomato, 0.7)}<g transform="rotate(10 128 150)"><rect x="104" y="60" width="52" height="176" rx="24" fill="#c8a165" ${line()}/>`
      + `<path d="M116 92 q14 12 28 0 M116 136 q14 12 28 0 M116 180 q14 12 28 0" fill="none" ${line(5)}/><path d="M156 110 l-16 14 l12 8 l-14 16" fill="none" ${line(4)}/></g>`
      + `<path d="M60 110 l-20 -8 M58 132 l-24 4 M196 110 l20 -8 M198 132 l24 4" ${line(5)}/>`, rays('#bcaaa4', '#d7ccc8')),
    () => svg(`${shadow(128, 216, 96)}<path d="M40 210 Q60 160 128 150 Q196 160 216 210 Z" fill="#d7b98a" ${line()}/>`
      + mold([[80, 196, 5], [110, 180, 4], [150, 186, 5], [180, 200, 4], [128, 202, 3], [96, 206, 3]], '#a0784a')
      + smoke(90, 110, 1.3, '#e8dcc8') + smoke(170, 92, 1.1, '#e8dcc8') + smoke(132, 60, 0.8, '#e8dcc8'), dots('#bfae8e')),
  ],
  glace: [
    () => svg(`${shadow(128, 228, 40)}<path d="M92 120 L128 228 L164 120 Z" fill="${C.gold}" ${line()}/><path d="M100 140 L150 200 M156 140 L110 196 M112 124 L160 172 M144 124 L104 166" ${line(3)}/>`
      + `<path d="M80 124 Q60 96 88 76 Q96 40 128 40 Q160 40 168 76 Q196 96 176 124 Z" fill="${C.cream}" ${line()}/>`
      + mold([[110, 80, 3], [140, 96, 3], [124, 66, 3]], C.darkBrown) + sparkle(204, 64, 14) + sparkle(52, 84, 10) + sparkle(200, 150, 8), rays(C.sky, C.white)),
    () => svg(`${bowl(`<path d="M48 130 Q128 160 208 130 Q200 150 128 156 Q56 150 48 130 Z" fill="${C.cream}" ${line(4)}/>`
      + `<path d="M150 136 L176 76 L196 92 Z" fill="${C.gold}" ${line(5)}/>`, drop(70, 98, 1.2, C.cream) + drop(194, 112, 1, C.cream))}`, rays('#fff1c1', C.white)),
    () => svg(`${shadow(128, 214, 104)}<path d="M24 200 Q24 168 72 168 Q100 150 140 160 Q196 150 230 186 Q236 206 200 208 Z" fill="#cfc79a" ${line()}/>`
      + `<path d="M108 168 q-4 -40 10 -56 h44 q10 10 0 22 l-12 14 q-4 14 -2 24" fill="${C.tomato}" ${line()}/><path d="M118 112 h44" ${line(8)}/>`
      + `<path d="M90 176 q0 18 6 26 M176 178 q2 16 -4 24 M60 178 q-2 14 4 20" fill="none" stroke="#a89f6a" stroke-width="5" stroke-linecap="round"/>`
      + minus(36, 120, 14) + minus(220, 120, 14), dots('#9e9a7a')),
  ],
  pizza: [
    () => svg(slice(C.yellow, mold([[104, 84, 9], [150, 96, 8], [126, 140, 8]], C.tomato) + pineapple([[86, 106], [160, 72], [134, 110], [118, 176]])), rays(C.tomato, '#ef5350')),
    () => svg(`<g transform="rotate(14 128 120)">${slice('#f0e2a8', mold([[110, 90, 7], [146, 100, 6]], '#c97a6a') + pineapple([[96, 112], [140, 140]]))}</g>`
      + `<path d="M44 62 q-10 -14 0 -26 M64 52 q-8 -12 0 -22" fill="none" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>`, rays('#ffccbc', '#fbe9e7')),
    () => svg(slice('#c9b26a', mold([[106, 90, 8], [150, 100, 7]], C.rot) + pineapple([[96, 110], [126, 96], [154, 120], [124, 150], [110, 176], [140, 70]]))
      + forbid(34, 136, 24) + forbid(222, 136, 24), rays('#4e342e', '#6d4c41')),
  ],
  cereales: [
    () => svg(bowl([[84, 124, C.pink], [112, 118, C.slime], [140, 126, C.orange], [168, 120, C.pink], [100, 134, C.orange], [154, 134, C.slime], [128, 110, C.mint]]
      .map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="11" fill="${f}" ${line(4)}/><circle cx="${x}" cy="${y}" r="3" fill="${INK}"/>`).join(''),
    sparkle(44, 60, 14, C.yellow) + sparkle(212, 70, 12, C.pink) + sparkle(128, 52, 10, C.slime)), rays(C.purple, '#9a5cc0')),
    () => svg(bowl(`<ellipse cx="128" cy="130" rx="80" ry="16" fill="${C.cream}"/>` + [[92, 132], [124, 136], [158, 130]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="7" fill="#d9a8b8" ${line(4)}/>`).join(''), eyes(108, 176, 148, 176, 'sad', 9)), rays('#d1c4e9', '#ede7f6')),
    () => svg(`${shadow(128, 222, 96)}<path d="M36 214 L128 72 L220 214 Z" fill="${C.white}" ${line()}/>`
      + [[100, 180], [140, 176], [120, 140], [160, 200], [84, 204], [128, 108]].map(([x, y]) => `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" fill="${C.slime}" ${line(3)}/>`).join('')
      + eyes(104, 160, 152, 160, 'wide', 13) + mouth(128, 190, 'grin', 34) + sparkle(56, 80, 14, C.slime) + sparkle(204, 92, 12, C.slime), rays('#1b5e20', '#33691e')),
  ],
  biere: [
    () => svg(mug(C.gold, `<path d="M58 78 Q56 44 86 50 Q100 30 124 42 Q148 28 164 48 Q190 46 182 78 Z" fill="${C.white}" ${line()}/>`,
      drop(90, 140, 0.9, C.white) + drop(148, 168, 0.8, C.white) + sparkle(210, 60, 12)), rays(C.blue, '#2f72d6')),
    () => svg(mug('#d4a23c', `<path d="M70 110 H170" ${line(5)}/>`, `<path d="M90 50 q-10 -14 0 -26 M120 50 q-10 -14 0 -26 M150 50 q-10 -14 0 -26" fill="none" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>`
      + drop(52, 120, 1.1) + drop(200, 196, 1)), rays(C.orange, '#ffa726')),
    () => svg(`${shadow(128, 214, 104)}<path d="M20 192 Q30 150 72 160 Q84 122 124 138 Q162 112 186 146 Q236 140 236 186 Q232 214 128 212 Q24 214 20 192 Z" fill="#b5b84a" ${line()}/>`
      + mold([[80, 180, 8], [130, 170, 10], [176, 184, 7], [104, 196, 5], [154, 198, 5]], '#e0a100')
      + minus(40, 100, 14) + minus(216, 100, 14) + stink(112, 110, C.slime), dots('#6b6e2a')),
  ],
};
