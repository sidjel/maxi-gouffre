/**
 * Illustrations provisoires : les 6 plats (GD §7.4). Une seule illustration par plat ;
 * le jeu la teinte selon le stade (cards.css).
 */
import { C, INK, line, svg, rays, shadow, sparkle, impact, arrow, coin, forbid, eyes, mold } from './lib.mjs';

const plate = (extra = '') => `${shadow(128, 228, 100)}<ellipse cx="128" cy="204" rx="104" ry="26" fill="${C.white}" ${line()}/><ellipse cx="128" cy="200" rx="72" ry="14" fill="none" stroke="${C.sky}" stroke-width="4"/>${extra}`;

export const dishes = {
  milkshake: () => svg(`${shadow(128, 230, 54)}<path d="M150 70 L182 16" ${line(14)}/><path d="M150 70 L182 16" stroke="${C.tomato}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M76 78 L180 78 L164 222 H92 Z" fill="${C.pink}" ${line()}/><path d="M70 82 Q70 46 104 54 Q118 32 140 44 Q170 36 184 60 Q194 76 186 82 Z" fill="${C.cream}" ${line()}/>`
    + `<path d="M94 116 Q128 132 164 116 L160 150 Q128 164 96 150 Z" fill="${C.yellow}" ${line(5)}/><path d="M100 104 V200" stroke="${C.white}" stroke-width="7" stroke-linecap="round" opacity="0.5"/>`
    + `<path d="M196 150 q20 -10 30 6 M200 168 q22 -2 26 16" fill="none" ${line(10)}/>${sparkle(40, 60, 14)}${sparkle(214, 100, 10)}`, rays(C.pink, '#f8bbd0')),
  burger: () => svg(plate(`<path d="M52 176 H204 Q204 196 128 196 Q52 196 52 176 Z" fill="${C.gold}" ${line()}/>`
    + `<path d="M48 160 H208 V176 H48 Z" fill="${C.darkBrown}" ${line()}/><path d="M44 152 L66 164 L84 150 L104 166 L126 150 L148 166 L170 150 L190 164 L212 152 L208 160 H48 Z" fill="${C.green}" ${line(5)}/>`
    + `<path d="M56 146 H200 L190 158 L176 148 L160 162 L146 148 Z" fill="${C.yellow}" ${line(5)}/>`
    + `<path d="M52 146 Q52 70 128 70 Q204 70 204 146 Z" fill="${C.gold}" ${line()}/>`
    + [[96, 100], [130, 90], [160, 108], [116, 120]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="${C.cream}" ${line(2)}/>`).join('')
    + `<path d="M86 196 q2 14 0 22 M170 196 q2 12 0 20" stroke="${C.yellow}" stroke-width="7" stroke-linecap="round"/>${sparkle(218, 70, 12)}`), rays(C.orange, '#ffa726')),
  petit_dej: () => svg(plate(`<ellipse cx="96" cy="182" rx="40" ry="18" fill="${C.white}" ${line()}/><circle cx="96" cy="178" r="14" fill="${C.yellow}" ${line(4)}/>`
    + `<path d="M140 160 Q144 120 180 122 Q214 126 210 166 Q206 196 172 196 Q140 194 140 160 Z" fill="${C.blue}" ${line()}/><ellipse cx="175" cy="140" rx="32" ry="12" fill="${C.cream}" ${line(5)}/>`
    + [[160, 138, C.pink], [178, 134, C.slime], [192, 142, C.orange]].map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="7" fill="${f}" ${line(3)}/>`).join('')
    + `<path d="M48 110 L84 96 L100 140 L62 154 Z" fill="${C.gold}" ${line()}/><path d="M60 118 L86 108" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>`
    + sparkle(128, 60, 18, C.yellow) + sparkle(60, 50, 10) + sparkle(210, 70, 10)), rays(C.yellow, '#ffe680')),
  ado_muet: () => svg(`${forbid(128, 32, 22)}<path d="M64 240 Q64 160 128 158 Q192 160 192 240 Z" fill="${C.darkGrey}" ${line()}/>`
    + `<path d="M64 240 Q64 184 96 168 L104 240 Z M192 240 Q192 184 160 168 L152 240 Z" fill="${INK}"/>`
    + `<circle cx="128" cy="108" r="42" fill="${C.skin}" ${line()}/><path d="M80 116 Q76 56 128 56 Q180 56 176 116 Q170 92 128 90 Q86 92 80 116 Z" fill="${INK}" ${line()}/>`
    + `<rect x="70" y="100" width="20" height="34" rx="8" fill="${C.tomato}" ${line(4)}/><rect x="166" y="100" width="20" height="34" rx="8" fill="${C.tomato}" ${line(4)}/>`
    + eyes(112, 112, 144, 112, 'sleepy', 8) + `<path d="M110 132 h36 M116 128 v8 M124 128 v8 M132 128 v8 M140 128 v8" ${line(3)}/>`
    + `<rect x="98" y="184" width="60" height="40" rx="8" fill="${C.tomato}" ${line(5)}/><rect x="110" y="192" width="36" height="20" fill="${C.mint}" ${line(3)}/>`, rays('#455a64', '#607d8b')),
  plante_mutante: () => svg(`${shadow(128, 230, 60)}<path d="M80 176 H176 L164 228 H92 Z" fill="${C.purple}" ${line()}/><rect x="72" y="164" width="112" height="20" rx="6" fill="${C.purple}" ${line()}/>`
    + `<path d="M128 168 C110 130 150 110 128 70" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M128 168 C110 130 150 110 128 70" fill="none" stroke="${C.slime}" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="M128 142 Q80 150 56 112 Q96 104 128 142 Z M130 120 Q178 128 204 92 Q164 84 130 120 Z" fill="${C.slime}" ${line(5)}/>`
    + `<path d="M94 62 Q96 26 128 28 Q160 26 162 62 Q170 84 150 92 Q128 100 106 92 Q86 84 94 62 Z" fill="${C.purple}" ${line()}/><circle cx="128" cy="30" r="9" fill="${C.white}" ${line(4)}/><circle cx="129" cy="31" r="4" fill="${INK}"/><path d="M108 70 Q128 90 148 70 Z" fill="${C.darkBrown}" ${line(5)}/>`
    + eyes(112, 54, 144, 54, 'wide', 8) + mold([[100, 190, 4], [150, 206, 4]], C.slime)
    + coin(36, 160) + coin(220, 160) + coin(44, 208, 11) + coin(212, 208, 11) + sparkle(36, 60, 12, C.slime) + sparkle(220, 50, 12, C.slime), rays('#1b5e20', '#2e7d32')),
  lance: () => svg(`${impact(128, 36, 30, C.white)}<g transform="rotate(8 128 140)"><rect x="112" y="70" width="32" height="170" rx="14" fill="${C.gold}" ${line()}/>`
    + `<path d="M108 74 L128 20 L148 74 Z" fill="${C.grey}" ${line()}/><path d="M104 74 H152 V96 H104 Z M104 150 H152 V172 H104 Z" fill="#9ea3a8" ${line(5)}/>`
    + `<path d="M120 110 q8 8 16 0 M120 200 q8 8 16 0" fill="none" ${line(4)}/></g>` + arrow(60, 100, 0, C.tomato, 0.8) + arrow(196, 100, 0, C.tomato, 0.8)
    + `<path d="M44 160 l-20 -6 M46 184 l-22 4 M212 160 l20 -6 M210 184 l22 4" ${line(5)}/>`, rays(C.blue, '#2f72d6')),
};
