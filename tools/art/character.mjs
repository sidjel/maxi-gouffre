/**
 * Le personnage provisoire : un dessin entier par vue (trois quarts face, trois quarts dos),
 * tourné vers la droite ; le jeu le retourne en miroir pour la gauche. Pieds à (150, 506).
 * La douchette est un dessin à part, tenue à la main (voir character.json, champ « prop »).
 */
import { svg, paperCut } from './paper.mjs';

const SKIN = '#e8c6a0';
const SKIN_DARK = '#d9b28b';
const HAIR = '#5a4030';

const legs = (dy = 0) => `
<rect x="116" y="${384 + dy}" width="30" height="104" rx="13" fill="#45464d"/>
<rect x="152" y="${388 + dy}" width="32" height="106" rx="13" fill="#52545c"/>`;

function front() {
  return `${legs()}
<ellipse cx="136" cy="490" rx="26" ry="13" fill="#5b3f2c"/><ellipse cx="180" cy="497" rx="30" ry="14" fill="#6a4a33"/>
<rect x="80" y="276" width="30" height="112" rx="15" transform="rotate(8 95 282)" fill="#b48a24"/>
<circle cx="88" cy="390" r="15" fill="${SKIN_DARK}"/>
<rect x="138" y="232" width="30" height="34" fill="${SKIN_DARK}"/>
<path d="M98 262 Q150 238 206 262 L216 402 Q150 420 90 402 Z" fill="#c99f2e"/>
<path d="M132 258 L156 304 L180 258 Z" fill="#a9c1cf"/>
<circle cx="158" cy="326" r="4.5" fill="#6e5420"/><circle cx="159" cy="354" r="4.5" fill="#6e5420"/><circle cx="160" cy="382" r="4.5" fill="#6e5420"/>
<rect x="178" y="298" width="28" height="18" rx="2" fill="#f2ead6"/><rect x="182" y="304" width="18" height="3" fill="#b9553f" stroke="none"/>
<path d="M194 268 Q232 296 226 364 L204 368 Q206 312 184 286 Z" fill="#d1a837"/>
<circle cx="152" cy="158" r="96" fill="${SKIN}"/>
<ellipse cx="66" cy="172" rx="15" ry="21" fill="${SKIN_DARK}"/>
<path d="M58 150 Q58 62 150 60 Q236 58 248 134 Q212 100 168 104 Q120 108 98 140 Q88 166 82 192 Q60 182 58 150 Z" fill="${HAIR}"/>
<path d="M150 64 Q156 26 186 36 Q168 46 172 64 Z" fill="${HAIR}"/>
<ellipse cx="178" cy="168" rx="8" ry="11" fill="#2b2520" stroke="none"/><ellipse cx="222" cy="164" rx="6.5" ry="10" fill="#2b2520" stroke="none"/>
<circle cx="181" cy="164" r="2.6" fill="#ffffff" stroke="none"/><circle cx="224" cy="160" r="2.2" fill="#ffffff" stroke="none"/>
<path d="M164 142 Q178 135 192 141 M212 138 Q222 134 232 139" fill="none" stroke="#3b2a1e" stroke-width="5" stroke-linecap="round"/>
<path d="M236 184 Q246 196 233 203" fill="none" stroke="#b98f6a" stroke-width="4" stroke-linecap="round"/>
<path d="M192 224 Q207 233 222 222" fill="none" stroke="#7a4a3a" stroke-width="4" stroke-linecap="round"/>
<circle cx="152" cy="202" r="14" fill="#e7a08c" opacity=".45" stroke="none"/><circle cx="238" cy="200" r="8" fill="#e7a08c" opacity=".45" stroke="none"/>
<circle cx="214" cy="372" r="16" fill="${SKIN}"/>`;
}

function back() {
  return `${legs(-4)}
<ellipse cx="134" cy="484" rx="24" ry="12" fill="#5b3f2c"/><ellipse cx="174" cy="490" rx="26" ry="12" fill="#6a4a33"/>
<rect x="138" y="230" width="30" height="34" fill="${SKIN_DARK}"/>
<rect x="76" y="276" width="30" height="110" rx="15" transform="rotate(10 91 282)" fill="#b48a24"/>
<circle cx="82" cy="386" r="15" fill="${SKIN_DARK}"/>
<path d="M96 260 Q150 238 206 260 L216 398 Q150 416 88 398 Z" fill="#c49a2a"/>
<path d="M150 252 L152 404" fill="none" stroke="#a57f20" stroke-width="3"/>
<rect x="108" y="298" width="88" height="48" rx="4" fill="#efe6cc"/>
${[0, 7, 11, 18, 22, 25, 32, 38, 42, 49, 53, 60, 64, 69].map((x, i) => `<rect x="${116 + x}" y="305" width="${i % 3 ? 3 : 5}" height="34" fill="#3b332a" stroke="none"/>`).join('')}
<path d="M196 266 Q240 290 232 356 L210 360 Q210 308 186 284 Z" fill="#d1a837"/>
<circle cx="150" cy="156" r="96" fill="${HAIR}"/>
<path d="M202 222 Q240 214 246 176 Q252 222 214 244 Z" fill="${SKIN_DARK}"/>
<ellipse cx="238" cy="168" rx="13" ry="20" fill="${SKIN_DARK}"/>
<path d="M150 64 Q156 26 186 36 Q168 46 172 64 Z" fill="${HAIR}"/>
<path d="M138 128 q18 -14 30 4 q8 18 -12 22 q-14 0 -10 -12" fill="none" stroke="#6f5242" stroke-width="4" stroke-linecap="round"/>
<circle cx="222" cy="362" r="16" fill="${SKIN}"/>`;
}

function scanner() {
  return `
<path d="M22 40 L50 40 L46 76 L18 76 Z" fill="#4a5056"/>
<rect x="8" y="8" width="104" height="36" rx="13" fill="#3d4247"/>
<rect x="98" y="12" width="16" height="28" rx="4" fill="#d9483b"/>
<path d="M46 44 Q58 52 52 60 L44 58 Z" fill="#e0b13a"/>
<rect x="20" y="15" width="60" height="5" rx="2" fill="#6b737a" stroke="none"/>`;
}

export function buildCharacter() {
  return [
    ['char/front.svg', svg(300, 520, paperCut('f', front(), { border: 9, ink: 3 }))],
    ['char/back.svg', svg(300, 520, paperCut('b', back(), { border: 9, ink: 3 }))],
    ['char/scanner.svg', svg(120, 80, paperCut('s', scanner(), { border: 5, ink: 2.5 }))],
  ];
}
