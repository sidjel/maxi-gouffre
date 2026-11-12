/**
 * Illustrations provisoires : objets (GD §7.3 : pile, console, papier, mixeur, scotch, cassette).
 */
import { C, INK, line, svg, rays, dots, shadow, eyes, mouth, mold, stink, sparkle, impact, arrow, minus, bolt, drop, smoke } from './lib.mjs';

const battery = (body, cap, extra = '') => `${shadow(128, 226, 54)}<rect x="112" y="34" width="32" height="20" rx="4" fill="${C.grey}" ${line(5)}/>`
  + `<rect x="84" y="50" width="88" height="172" rx="14" fill="${body}" ${line()}/><path d="M84 80 H172 V64 Q172 50 158 50 H98 Q84 50 84 64 Z" fill="${cap}" ${line()}/>`
  + `<path d="M100 96 V200" stroke="${C.white}" stroke-width="7" stroke-linecap="round" opacity="0.45"/>${extra}`;

const handheld = (screen, extra = '') => `${shadow(128, 226, 90)}<rect x="40" y="56" width="176" height="160" rx="26" fill="${C.tomato}" ${line()}/>`
  + `<rect x="68" y="76" width="120" height="76" rx="8" fill="${screen}" ${line()}/>`
  + `<path d="M74 172 h12 v-12 h12 v12 h12 v12 h-12 v12 h-12 v-12 h-12 z" fill="${INK}"/>`
  + `<circle cx="164" cy="186" r="10" fill="${C.yellow}" ${line(4)}/><circle cx="188" cy="168" r="10" fill="${C.mint}" ${line(4)}/>${extra}`;

const roll = (paper, extra = '') => `${shadow(128, 224, 72)}<path d="M64 84 V196 Q64 216 128 216 Q192 216 192 196 V84 Z" fill="${paper}" ${line()}/>`
  + `<ellipse cx="128" cy="84" rx="64" ry="22" fill="${paper}" ${line()}/><ellipse cx="128" cy="84" rx="20" ry="8" fill="${C.beige}" ${line(5)}/>`
  + `<path d="M80 110 V190" stroke="${C.white}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>${extra}`;

const blender = (base, jar, extra = '') => `${shadow(128, 228, 70)}<path d="M84 52 H172 L160 160 H96 Z" fill="${jar}" fill-opacity="0.85" ${line()}/>`
  + `<rect x="78" y="40" width="100" height="18" rx="6" fill="${C.darkGrey}" ${line(5)}/><path d="M172 70 q26 4 22 40 q-2 24 -26 30" fill="none" ${line()}/>`
  + `<path d="M108 128 l20 -10 l20 10 M128 118 v18" ${line(5)}/><path d="M80 160 H176 L186 222 H70 Z" fill="${base}" ${line()}/>`
  + `<circle cx="108" cy="192" r="8" fill="${C.white}" ${line(4)}/><circle cx="148" cy="192" r="8" fill="${C.white}" ${line(4)}/>${extra}`;

const tape = (body, extra = '') => `${shadow(128, 222, 84)}<path d="M128 200 L232 200 L232 176 L170 176 Z" fill="${body}" ${line()}/>`
  + `<circle cx="120" cy="130" r="80" fill="${body}" ${line()}/><circle cx="120" cy="130" r="36" fill="${C.beige}" ${line()}/>`
  + `<circle cx="120" cy="130" r="58" fill="none" stroke="${C.white}" stroke-width="4" opacity="0.4"/>${extra}`;

const vhs = (body, extra = '') => `${shadow(128, 216, 96)}<rect x="28" y="86" width="200" height="120" rx="10" fill="${body}" ${line()}/>`
  + `<rect x="60" y="106" width="136" height="50" rx="6" fill="${C.darkGrey}" ${line(5)}/><circle cx="90" cy="131" r="16" fill="${C.white}" ${line(4)}/>`
  + `<circle cx="166" cy="131" r="16" fill="${C.white}" ${line(4)}/><rect x="70" y="170" width="116" height="22" rx="4" fill="${C.paper}" ${line(4)}/>${extra}`;

export const objects = {
  pile: [
    () => svg(battery(C.gold, INK, eyes(110, 124, 146, 124, 'open', 10) + mouth(128, 152, 'grin', 28) + bolt(200, 80, 1.3) + bolt(56, 170, 1)), rays(C.yellow, '#ffe680')),
    () => svg(`<g transform="rotate(16 128 140)">${battery('#c9b98a', C.darkGrey, eyes(110, 128, 146, 128, 'sleepy', 10) + mouth(128, 160, 'frown', 22))}</g>`
      + bolt(204, 80, 0.8, C.grey) + drop(70, 90, 1.2), rays('#e0e0e0', '#f5f5f5')),
    () => svg(`${shadow(128, 218, 110)}<path d="M18 206 Q30 176 80 184 Q128 168 180 186 Q236 176 240 206 Z" fill="${C.slime}" ${line()}/>`
      + `<g transform="rotate(-70 128 150)">${battery('#8d8a5a', C.darkGrey, mold([[110, 110, 10], [150, 160, 12], [120, 190, 8]], C.white))}</g>`
      + drop(52, 140, 1.3, C.slime) + drop(206, 132, 1.1, C.slime) + minus(40, 72, 14) + minus(216, 72, 14) + stink(104, 70, C.slime), dots('#33691e')),
  ],
  console: [
    () => svg(handheld(C.mint, `<path d="M70 140 h116 v10 h-116 z M90 128 h12 v12 h-12 z M150 104 l14 -14 l14 14 l-14 14 z" fill="${INK}"/><rect x="118" y="112" width="12" height="28" fill="${C.tomato}"/>`
      + sparkle(220, 50, 14) + sparkle(36, 60, 10)), rays(C.blue, '#2f72d6')),
    () => svg(handheld('#8fa8a0', `<path d="M76 84 L124 140 M120 80 L184 132 M150 80 L100 148" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M40 120 L60 128 M196 70 L216 90" ${line(5)}/>`), rays('#90a4ae', '#b0bec5')),
    () => svg(`${shadow(128, 222, 96)}<rect x="36" y="80" width="184" height="132" rx="8" fill="#b5533c" ${line()}/>`
      + `<path d="M36 124 H220 M36 168 H220 M96 80 V124 M160 80 V124 M66 124 V168 M128 124 V168 M190 124 V168 M96 168 V212 M160 168 V212" ${line(4)}/>`
      + `<rect x="80" y="92" width="96" height="56" rx="6" fill="${INK}" ${line(4)}/>` + smoke(70, 58, 1, C.darkGrey) + smoke(186, 48, 0.8, C.darkGrey), dots('#5d4037')),
  ],
  papier: [
    () => svg(roll(C.white, `<path d="M192 150 Q214 160 212 214 L176 220" fill="${C.white}" ${line()}/>` + sparkle(46, 62, 12) + sparkle(214, 70, 10)), rays(C.sky, C.white)),
    () => svg(`<circle cx="128" cy="140" r="104" fill="${C.yellow}" opacity="0.6"/>${roll(C.white, sparkle(40, 70, 16) + sparkle(216, 70, 16) + sparkle(128, 30, 12))}`
      + [[30, 180], [226, 180]].map(([x, y]) => `<path d="M${x} ${y - 30} L${x + 24} ${y + 12} H${x - 24} Z" fill="${C.yellow}" ${line(5)}/><path d="M${x} ${y - 14} V${y}" ${line(5)}/><circle cx="${x}" cy="${y + 4}" r="2" fill="${INK}"/>`).join(''),
    rays(C.tomato, '#ef5350')),
    () => svg(`${shadow(128, 222, 64)}<path d="M92 92 V200 Q92 214 128 214 Q164 214 164 200 V92 Z" fill="${C.beige}" ${line()}/>`
      + `<ellipse cx="128" cy="92" rx="36" ry="12" fill="${C.darkBrown}" ${line()}/><path d="M92 120 L164 150 M92 160 L164 190" ${line(3)}/>`
      + eyes(114, 156, 142, 156, 'sad', 8) + mouth(128, 186, 'frown', 18) + smoke(200, 196, 0.7, '#e8dcc8'), dots('#a1887f')),
  ],
  mixeur: [
    () => svg(blender(C.white, C.sky, sparkle(214, 60, 12)), rays(C.mint, '#a8e6cf')),
    () => svg(blender(C.tomato, '#ffccbc', smoke(70, 50, 1.2, C.darkGrey) + smoke(196, 34, 0.9, C.darkGrey) + drop(206, 172, 1.2) + bolt(48, 150, 0.8)), rays(C.orange, '#ffa726')),
    () => svg(`${impact(128, 128, 96, C.yellow)}${impact(128, 128, 56, C.white)}`
      + `<path d="M92 132 H164 L174 184 H82 Z" fill="${C.tomato}" ${line()}/><circle cx="110" cy="160" r="7" fill="${C.white}" ${line(4)}/><circle cx="146" cy="160" r="7" fill="${C.white}" ${line(4)}/>`
      + `<path d="M98 96 L84 60 L116 74 Z M150 94 L176 58 L172 96 Z M120 84 L128 46 L138 82 Z" fill="${C.sky}" ${line(4)}/>`
      + arrow(30, 128, -90, C.tomato, 0.9) + arrow(226, 128, 90, C.tomato, 0.9) + bolt(70, 54, 1) + bolt(186, 200, 1) + bolt(74, 200, 0.8) + bolt(190, 56, 0.8), rays('#212121', '#424242')),
  ],
  scotch: [
    () => svg(tape('#9ea3a8'), rays(C.yellow, '#ffe680')),
    () => svg(tape('#a89f8c', smoke(186, 72, 1, '#e8dcc8') + smoke(64, 196, 0.8, '#e8dcc8') + `<path d="M40 40 L90 90 M40 40 L40 100 M40 40 L100 40 M40 70 Q60 60 70 40 M40 90 Q80 80 90 40" fill="none" stroke="${C.white}" stroke-width="3"/>`), rays('#bcaaa4', '#d7ccc8')),
    () => svg(`${shadow(128, 218, 90)}<path d="M44 210 Q40 150 84 136 Q100 92 136 104 Q184 96 196 146 Q226 164 212 210 Z" fill="#d8cfa0" ${line()}/>`
      + `<path d="M90 160 l20 16 l-6 20 M150 128 l-8 24 l18 14 M176 180 l-20 10" fill="none" ${line(4)}/>` + mold([[120, 190, 6], [170, 160, 5]], '#b0a070'), dots('#9e9a7a')),
  ],
  cassette: [
    () => svg(`<ellipse cx="128" cy="146" rx="118" ry="86" fill="${C.purple}" opacity="0.55"/>${vhs(INK, eyes(90, 131, 166, 131, 'angry', 12))}`
      + `<path d="M40 70 q10 -20 0 -40 M216 70 q-10 -20 0 -40 M128 66 q10 -16 0 -34" fill="none" stroke="${C.purple}" stroke-width="7" stroke-linecap="round"/>`, rays('#311b92', '#4527a0')),
    () => svg(`${vhs('#424242')}<path d="M90 150 C60 200 20 160 40 120 C60 80 120 230 150 200 C180 170 140 120 200 140 C250 160 210 230 180 214" fill="none" stroke="${C.brown}" stroke-width="7" stroke-linecap="round"/>`
      + `<path d="M196 50 l12 12 M216 44 l-4 18 M180 62 l20 -2" ${line(5)}/>`, rays('#78909c', '#90a4ae')),
    () => svg(`${vhs(INK)}<path d="M80 120 C40 40 100 10 128 30 C156 10 216 40 176 120 C200 90 230 110 214 140 M80 120 C56 90 26 110 42 140" fill="${C.purple}" ${line()}/>`
      + `<path d="M84 120 Q128 70 172 120 Z" fill="${C.purple}"/>` + eyes(108, 70, 148, 70, 'wide', 13)
      + `<path d="M104 96 q24 16 48 0" fill="none" ${line(5)}/>` + sparkle(36, 40, 12, C.mint) + sparkle(220, 36, 12, C.mint) + sparkle(128, 230, 10, C.mint), rays('#1a0033', '#4a148c')),
  ],
};
