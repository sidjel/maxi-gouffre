import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import aisle from '../../src/data/aisle.json';
import products from '../../src/data/products.json';
import lines from '../../src/data/lines.json';
import character from '../../src/data/character.json';
import { maskFromData, isWalkable } from '../../src/core/geometry.js';
import { SETTINGS } from '../../src/config.js';

const pub = (p) => new URL(`../../public/${p}`, import.meta.url);

describe('données du jeu', () => {
  it('chaque image référencée existe dans public/', () => {
    const images = [
      ...products.map((p) => p.image),
      ...aisle.decor.map((d) => d.image),
      ...aisle.props.map((p) => p.image),
      ...Object.values(character.views).flatMap((v) => [
        ...Object.values(v.animations).flatMap((a) => a.frames),
        ...(v.prop ? [v.prop.image] : []),
      ]),
    ];
    for (const img of images) expect(existsSync(pub(img)), img).toBe(true);
  });

  it('chaque produit du rayon existe, et on peut s’en approcher', () => {
    const mask = maskFromData(aisle.walk);
    const ids = new Set(products.map((p) => p.id));
    for (const spot of aisle.products) {
      expect(ids.has(spot.product), spot.product).toBe(true);
      const x = Math.min(Math.max(spot.x, 360), 3840);
      expect(isWalkable(mask, x, aisle.floor.yBack + 30), spot.product).toBe(true);
    }
  });

  it('le point de départ est dans la zone de marche', () => {
    expect(isWalkable(maskFromData(aisle.walk), aisle.spawn.x, aisle.spawn.y)).toBe(true);
  });

  it('chaque produit a des propriétés, une puissance et des couleurs de particules', () => {
    for (const p of products) {
      expect(p.props.length, p.id).toBeGreaterThan(0);
      expect(p.power, p.id).toBeGreaterThan(0);
      expect(p.colors.length, p.id).toBeGreaterThan(0);
      expect(p.age).toBeGreaterThanOrEqual(0);
      expect(p.age).toBeLessThanOrEqual(1);
    }
  });

  it('les répliques provisoires sont marquées [TEMP]', () => {
    for (const [event, entry] of Object.entries(lines)) {
      expect(entry.lines.length, event).toBeGreaterThan(0);
      for (const l of entry.lines) expect(l.startsWith('[TEMP] '), `${event} : ${l}`).toBe(true);
    }
  });

  it('chaque vue du personnage a au moins l’animation idle', () => {
    for (const [name, v] of Object.entries(character.views)) expect(v.animations.idle?.frames.length, name).toBeGreaterThan(0);
  });

  it('chaque réglage a une valeur dans ses bornes', () => {
    for (const s of SETTINGS) {
      if (s.type === 'bool') { expect(typeof s.value).toBe('boolean'); continue; }
      expect(s.value, s.key).toBeGreaterThanOrEqual(s.min);
      expect(s.value, s.key).toBeLessThanOrEqual(s.max);
    }
  });
});
