import { describe, it, expect } from 'vitest';
import { createRng } from '../../src/core/rng.js';
import { pointInPolygon, isWalkable, slideMove, depthScale, maskFromData } from '../../src/core/geometry.js';
import { buildGrid, findPath, nearestWalkable } from '../../src/core/path.js';
import { stageOf, createCard, ageCard } from '../../src/core/cards.js';
import { createNarratorBrain, displayText } from '../../src/core/narrator.js';

const square = [[0, 0], [100, 0], [100, 100], [0, 100]];
const mask = { polygon: [[0, 0], [400, 0], [400, 200], [0, 200]], holes: [[[150, -10], [250, -10], [250, 150], [150, 150]]] };

describe('hasard à graine', () => {
  it('donne la même suite avec la même graine', () => {
    const a = createRng(42); const b = createRng(42);
    expect([a.next(), a.next(), a.int(10)]).toEqual([b.next(), b.next(), b.int(10)]);
  });
  it('donne des suites différentes avec des graines différentes', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });
});

describe('zone de marche', () => {
  it('reconnaît un point dans un polygone', () => {
    expect(pointInPolygon(50, 50, square)).toBe(true);
    expect(pointInPolygon(150, 50, square)).toBe(false);
  });
  it('exclut les trous', () => {
    expect(isWalkable(mask, 50, 50)).toBe(true);
    expect(isWalkable(mask, 200, 50)).toBe(false);
  });
  it('glisse le long d’un obstacle au lieu de s’arrêter net', () => {
    const r = slideMove(mask, 140, 100, 160, 110);
    expect(r.blocked).toBe(true);
    expect(r.y).toBe(110);
    expect(r.x).toBe(140);
  });
  it('rapetisse au fond et grandit devant', () => {
    const floor = { yBack: 700, yFront: 1000 };
    expect(depthScale(700, floor, 0.7, 1)).toBeCloseTo(0.7);
    expect(depthScale(1000, floor, 0.7, 1)).toBeCloseTo(1);
    expect(depthScale(2000, floor, 0.7, 1)).toBeCloseTo(1);
  });
  it('transforme les ellipses des données en polygones', () => {
    const m = maskFromData({ polygon: square, holes: [{ shape: 'ellipse', cx: 50, cy: 50, rx: 10, ry: 5 }] });
    expect(m.holes[0].length).toBe(16);
    expect(isWalkable(m, 50, 50)).toBe(false);
  });
});

describe('chemin (clic pour aller)', () => {
  const grid = buildGrid(mask, 10);
  it('contourne un obstacle', () => {
    const path = findPath(grid, 50, 50, 350, 50);
    expect(path.length).toBeGreaterThan(1);
    const end = path[path.length - 1];
    expect(end[0]).toBeCloseTo(350, 0);
    for (const [x, y] of path) expect(isWalkable(mask, x, y)).toBe(true);
    expect(path.some(([, y]) => y > 150)).toBe(true);
  });
  it('va en ligne droite quand rien ne gêne', () => {
    expect(findPath(grid, 20, 180, 380, 180)).toEqual([[380, 180]]);
  });
  it('ramène une cible hors zone au point praticable le plus proche', () => {
    const p = nearestWalkable(grid, 200, 60);
    expect(isWalkable(mask, p[0], p[1])).toBe(true);
  });
});

describe('cartes', () => {
  const t = { ripeAt: 0.34, rottenAt: 0.67 };
  const banane = { id: 'banane', name: 'Banane', image: 'x.svg', power: 3, age: 0.3, ageRate: 2, props: ['mou'] };
  it('donne le stade selon l’âge', () => {
    expect(stageOf(0, t)).toBe('frais');
    expect(stageOf(0.34, t)).toBe('mur');
    expect(stageOf(0.9, t)).toBe('pourri');
  });
  it('crée une carte depuis un produit', () => {
    const c = createCard(banane, { uid: 'c1', rng: createRng(1), jitter: 0, thresholds: t });
    expect(c).toMatchObject({ uid: 'c1', name: 'Banane', power: 3, stage: 'frais', props: ['mou'] });
  });
  it('vieillit à la vitesse du produit et change de stade', () => {
    const c = createCard(banane, { uid: 'c1', rng: createRng(1), jitter: 0, thresholds: t });
    const older = ageCard(c, 0.1, t);
    expect(older.age).toBeCloseTo(0.5);
    expect(older.stage).toBe('mur');
    expect(c.stage).toBe('frais');
    expect(ageCard(c, 5, t).age).toBe(1);
  });
});

describe('narrateur', () => {
  const data = {
    scan: { lines: ['a', 'b'] },
    'scan:pile': { lines: ['pile'] },
    arrive: { once: true, priority: 3, lines: ['[TEMP] bonjour'] },
  };
  it('ne répète pas deux fois de suite la même réplique', () => {
    const brain = createNarratorBrain(data, createRng(3));
    let prev = null;
    for (let i = 0; i < 10; i += 1) { const r = brain.say('scan'); expect(r.text).not.toBe(prev); prev = r.text; }
  });
  it('utilise la réplique propre au produit, sinon la générale', () => {
    const brain = createNarratorBrain(data, createRng(3));
    expect(brain.say('scan:pile').text).toBe('pile');
    expect(['a', 'b']).toContain(brain.say('scan:banane').text);
  });
  it('ne dit qu’une fois les événements « once »', () => {
    const brain = createNarratorBrain(data, createRng(3));
    expect(brain.say('arrive').priority).toBe(3);
    expect(brain.say('arrive')).toBeNull();
    expect(brain.say('inconnu')).toBeNull();
  });
  it('retire [TEMP] à l’affichage', () => {
    expect(displayText('[TEMP] bonjour')).toBe('bonjour');
  });
});
