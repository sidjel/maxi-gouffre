/**
 * Générateur pseudo-aléatoire à graine (mulberry32), pur et sans état caché.
 * L'état est un entier non signé sur 32 bits, stocké dans la partie.
 * Chaque fonction renvoie la valeur tirée et le nouvel état : { value, rngState }.
 */

const UINT32 = 0x100000000;
const GOLDEN = 0x6d2b79f5;

/**
 * Transforme un nombre quelconque (heure, graine saisie) en état de départ valide.
 * @param {number} n
 * @returns {number} état du générateur (entier 0 … 2^32 − 1)
 */
export function seedFrom(n) {
  if (!Number.isFinite(n)) throw new TypeError(`[MG] rng.seedFrom : graine invalide (${n})`);
  // Mélange simple (murmur3 fmix32) pour que des graines proches donnent des suites éloignées.
  let h = Math.trunc(n) % UINT32;
  if (h < 0) h += UINT32;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function assertState(rngState) {
  if (!Number.isInteger(rngState) || rngState < 0 || rngState >= UINT32) {
    throw new TypeError(`[MG] rng : état invalide (${rngState})`);
  }
}

/**
 * Tire un réel dans [0, 1).
 * @param {number} rngState
 * @returns {{ value: number, rngState: number }}
 */
export function next(rngState) {
  assertState(rngState);
  const state = (rngState + GOLDEN) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / UINT32;
  return { value, rngState: state };
}

/**
 * Tire un entier dans [0, max).
 * @param {number} rngState
 * @param {number} max entier ≥ 1
 * @returns {{ value: number, rngState: number }}
 */
export function int(rngState, max) {
  if (!Number.isInteger(max) || max < 1) throw new RangeError(`[MG] rng.int : max invalide (${max})`);
  const r = next(rngState);
  return { value: Math.floor(r.value * max), rngState: r.rngState };
}

/**
 * Choisit un élément d'une liste non vide.
 * @template T
 * @param {number} rngState
 * @param {T[]} list
 * @returns {{ value: T, rngState: number }}
 */
export function pick(rngState, list) {
  if (!Array.isArray(list) || list.length === 0) throw new RangeError('[MG] rng.pick : liste vide');
  const r = int(rngState, list.length);
  return { value: list[r.value], rngState: r.rngState };
}

/**
 * Mélange une copie de la liste (Fisher-Yates). La liste d'origine n'est pas modifiée.
 * @template T
 * @param {number} rngState
 * @param {T[]} list
 * @returns {{ value: T[], rngState: number }}
 */
export function shuffle(rngState, list) {
  if (!Array.isArray(list)) throw new TypeError('[MG] rng.shuffle : liste attendue');
  const out = list.slice();
  let state = rngState;
  for (let i = out.length - 1; i > 0; i -= 1) {
    const r = int(state, i + 1);
    state = r.rngState;
    [out[i], out[r.value]] = [out[r.value], out[i]];
  }
  return { value: out, rngState: state };
}

/**
 * Petit objet pratique autour des fonctions pures : garde l'état pour l'appelant.
 * @param {number} seed graine quelconque
 */
export function createRng(seed) {
  let state = seedFrom(seed);
  return {
    next() { const r = next(state); state = r.rngState; return r.value; },
    int(max) { const r = int(state, max); state = r.rngState; return r.value; },
    pick(list) { const r = pick(state, list); state = r.rngState; return r.value; },
    range(min, max) { return min + (max - min) * this.next(); },
    get state() { return state; },
  };
}
