/**
 * Briques communes des illustrations provisoires (DIRECTION_ARTISTIQUE.md §1, §2.1) :
 * style prospectus de supermarché, aplats, contours épais, fond rayonnant. Cadrage carré 256×256,
 * sujet centré, aucun texte, aucune marque. Le cadre et les finitions sont ajoutés par le jeu.
 * Convention : le haut de l'image est « l'avant » de la carte (vers l'adversaire), pour les effets
 * qui visent la carte d'en face ; les côtés sont les voisins.
 */

export const INK = '#1b1b1f';
export const C = Object.freeze({
  yellow: '#ffd23f', tomato: '#e53935', blue: '#1d5fbf', mint: '#7ad9b5', paper: '#fff8e7', white: '#ffffff',
  green: '#43a047', leaf: '#2e7d32', brown: '#6d4c2f', darkBrown: '#3e2a17', beige: '#f1d9a6', pink: '#f48fb1',
  skin: '#f2c29b', grey: '#9e9e9e', darkGrey: '#5f6368', orange: '#fb8c00', purple: '#7b3fa0', rot: '#6b7d2f',
  slime: '#9ccc3d', cream: '#fff3c4', gold: '#f9a825', sky: '#bfe3ff', red: '#c62828',
});

/** Attributs de contour : trait épais, bouts arrondis. */
export const line = (w = 6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const r1 = (n) => Math.round(n * 10) / 10;

/** Document SVG complet. */
export function svg(body, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${bg}${body}</svg>\n`;
}

/** Fond rayonnant façon « PRIX CHOC » : 16 rayons alternés autour du centre. */
export function rays(a, b, cx = 128, cy = 128) {
  const n = 16;
  let out = `<rect width="256" height="256" fill="${a}"/>`;
  for (let i = 0; i < n; i += 2) {
    const t1 = (i / n) * Math.PI * 2;
    const t2 = ((i + 1) / n) * Math.PI * 2;
    const p = (t) => `${r1(cx + Math.cos(t) * 260)},${r1(cy + Math.sin(t) * 260)}`;
    out += `<polygon points="${cx},${cy} ${p(t1)} ${p(t2)}" fill="${b}"/>`;
  }
  return out;
}

/** Fond uni avec trame de points (papier d'imprimerie). */
export function dots(color, dot = 'rgba(255,255,255,0.35)') {
  return `<defs><pattern id="d" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="${dot}"/></pattern></defs>`
    + `<rect width="256" height="256" fill="${color}"/><rect width="256" height="256" fill="url(#d)"/>`;
}

/** Ombre portée au sol, sous le sujet. */
export const shadow = (cx = 128, cy = 222, rx = 78) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="12" fill="${INK}" opacity="0.22"/>`;

/**
 * Paire d'yeux.
 * @param {'open'|'angry'|'sleepy'|'dead'|'wide'|'sad'|'happy'} mood
 */
export function eyes(x1, y1, x2, y2, mood = 'open', r = 11) {
  const one = (x, y, flip) => {
    if (mood === 'sleepy') return `<path d="M${x - r} ${y} q${r} ${r * 0.8} ${r * 2} 0" fill="none" ${line(5)}/>`;
    if (mood === 'happy') return `<path d="M${x - r} ${y + 3} q${r} ${-r * 1.2} ${r * 2} 0" fill="none" ${line(5)}/>`;
    if (mood === 'dead') return `<path d="M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16" ${line(5)}/>`;
    const pupil = mood === 'wide' ? r * 0.35 : r * 0.5;
    let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}" ${line(4)}/><circle cx="${x + (mood === 'wide' ? 0 : 2)}" cy="${y + 1}" r="${pupil}" fill="${INK}"/>`;
    if (mood === 'angry') s += `<path d="M${x - r - 3} ${y - r - (flip ? 8 : 0)} L${x + r + 3} ${y - r - (flip ? 0 : 8)}" ${line(5)}/>`;
    if (mood === 'sad') s += `<path d="M${x - r} ${y - r - (flip ? 0 : 6)} L${x + r} ${y - r - (flip ? 6 : 0)}" ${line(4)}/>`;
    return s;
  };
  return one(x1, y1, false) + one(x2, y2, true);
}

/** Bouche : sourire, grimace, cri, ligne. */
export function mouth(x, y, kind = 'smile', w = 26) {
  const h = w / 2;
  switch (kind) {
    case 'smile': return `<path d="M${x - h} ${y} q${h} ${h} ${w} 0" fill="none" ${line(5)}/>`;
    case 'grin': return `<path d="M${x - h} ${y} q${h} ${h * 1.4} ${w} 0 z" fill="${C.white}" ${line(5)}/>`;
    case 'frown': return `<path d="M${x - h} ${y + 6} q${h} ${-h} ${w} 0" fill="none" ${line(5)}/>`;
    case 'scream': return `<ellipse cx="${x}" cy="${y + 4}" rx="${h * 0.7}" ry="${h}" fill="${C.darkBrown}" ${line(5)}/>`;
    case 'wavy': return `<path d="M${x - h} ${y} q${h / 2} -6 ${h} 0 t${h} 0" fill="none" ${line(5)}/>`;
    default: return `<path d="M${x - h} ${y} h${w}" ${line(5)}/>`;
  }
}

/** Taches de moisissure. */
export function mold(spots, color = C.rot) {
  return spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.85"/>`).join('');
}

/** Lignes d'odeur ondulées (stade pourri). */
export function stink(x, y, color = C.slime) {
  return [0, 18, 36].map((dx) => `<path d="M${x + dx} ${y} q-8 -10 0 -20 t0 -20" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`).join('');
}

/** Étoile à 4 branches (éclat, brillance). */
export function sparkle(x, y, s = 14, fill = C.white) {
  return `<path d="M${x} ${y - s} Q${x + s * 0.2} ${y - s * 0.2} ${x + s} ${y} Q${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s} Q${x - s * 0.2} ${y + s * 0.2} ${x - s} ${y} Q${x - s * 0.2} ${y - s * 0.2} ${x} ${y - s} z" fill="${fill}" ${line(3)}/>`;
}

/** Étoile d'impact (choc, destruction vers l'avant). */
export function impact(x, y, r = 26, fill = C.yellow) {
  const pts = [];
  for (let i = 0; i < 16; i += 1) {
    const t = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.5;
    pts.push(`${r1(x + Math.cos(t) * rr)},${r1(y + Math.sin(t) * rr)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${line(4)}/>`;
}

/** Flèche épaisse (direction d'un effet). angle 0 = vers le haut. */
export function arrow(x, y, angle = 0, fill = C.tomato, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${s})"><path d="M0 -26 L20 -4 H8 V22 H-8 V-4 H-20 Z" fill="${fill}" ${line(4)}/></g>`;
}

/** Signe plus (boost). */
export function plus(x, y, s = 14, fill = C.mint) {
  const a = s * 0.38;
  return `<path d="M${x - a} ${y - s} h${a * 2} v${s - a} h${s - a} v${a * 2} h${a - s} v${s - a} h${-a * 2} v${a - s} h${a - s} v${-a * 2} h${s - a} z" fill="${fill}" ${line(4)}/>`;
}

/** Signe moins (malus de zone). */
export const minus = (x, y, s = 14, fill = C.tomato) => `<rect x="${x - s}" y="${y - s * 0.38}" width="${s * 2}" height="${s * 0.76}" rx="3" fill="${fill}" ${line(4)}/>`;

/** Panneau « interdit » (annulation). */
export function forbid(x, y, r = 18) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}" stroke="${C.red}" stroke-width="${r * 0.32}"/>`
    + `<path d="M${x - r * 0.62} ${y + r * 0.62} L${x + r * 0.62} ${y - r * 0.62}" stroke="${C.red}" stroke-width="${r * 0.3}"/>`;
}

/** Pièce d'or (bonus de score). */
export function coin(x, y, r = 14) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.gold}" ${line(4)}/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="${C.yellow}" stroke-width="3"/>`;
}

/** Éclair (électricité). */
export const bolt = (x, y, s = 1, fill = C.yellow) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M4 -24 L-12 4 H0 L-6 24 L14 -6 H2 Z" fill="${fill}" ${line(4)}/></g>`;

/** Gouttes de sueur ou d'eau. */
export const drop = (x, y, s = 1, fill = C.sky) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -12 Q10 2 0 10 Q-10 2 0 -12 Z" fill="${fill}" ${line(3)}/></g>`;

/** Fumée (nuage gris). */
export const smoke = (x, y, s = 1, fill = C.grey) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 6 a12 12 0 0 1 4 -22 a14 14 0 0 1 26 -2 a11 11 0 0 1 14 16 a10 10 0 0 1 -8 14 h-30 a10 10 0 0 1 -6 -6 z" fill="${fill}" ${line(4)}/></g>`;

/** Petits « Z » de sommeil, dessinés en traits (pas en texte). */
export const zzz = (x, y) => [0, 1, 2].map((i) => {
  const s = 8 + i * 3;
  const ox = x + i * 16;
  const oy = y - i * 18;
  return `<path d="M${ox} ${oy} h${s} l${-s} ${s} h${s}" fill="none" ${line(4)}/>`;
}).join('');
