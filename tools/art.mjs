/**
 * Génère les visuels provisoires (SVG) dans public/art/ : `npm run art`.
 * Ces fichiers sont versionnés ; on ne relance ce script que pour changer un visuel provisoire.
 */
import { buildWall } from './art/wall.mjs';
import { buildFar } from './art/far.mjs';
import { buildBits } from './art/bits.mjs';
import { buildProducts } from './art/products.mjs';
import { buildCharacter } from './art/character.mjs';

const out = new URL('../public/art/', import.meta.url).pathname;
const files = [...buildWall(), ...buildFar(), ...buildBits(), ...buildProducts(), ...buildCharacter()];
const { write } = await import('./art/paper.mjs');
for (const [name, content] of files) write(out + name, content);
console.log(`${files.length} visuels écrits dans public/art/`);
