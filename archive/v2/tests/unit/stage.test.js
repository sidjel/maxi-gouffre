import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickProfile, fitStage, computeLayout } from '../../app/src/ui/Stage.js';
import { TECH } from '../../app/src/config.js';

test('profil wide pour les grandes fenêtres, compact dès qu\'une dimension passe sous le seuil', () => {
  assert.equal(pickProfile(1920, 1080, TECH), 'wide');
  assert.equal(pickProfile(1280, 720, TECH), 'wide');
  assert.equal(pickProfile(1100, 620, TECH), 'wide');
  assert.equal(pickProfile(1099, 900, TECH), 'compact');
  assert.equal(pickProfile(1600, 619, TECH), 'compact');
  assert.equal(pickProfile(844, 390, TECH), 'compact');
});

test('la scène tient dans la fenêtre sans déformation, centrée', () => {
  const fit = fitStage(1920, 1080, TECH.WIDE_STAGE);
  assert.deepEqual(fit, { scale: 1, x: 0, y: 0 });

  // Fenêtre plus large que 16:9 : bandes à gauche et à droite.
  const wide = fitStage(2560, 1080, TECH.WIDE_STAGE);
  assert.equal(wide.scale, 1);
  assert.equal(wide.x, 320);
  assert.equal(wide.y, 0);

  // Fenêtre plus haute : bandes en haut et en bas.
  const tall = fitStage(1280, 1024, TECH.WIDE_STAGE);
  assert.equal(tall.scale, 1280 / 1920);
  assert.equal(tall.x, 0);
  assert.ok(tall.y > 0);
});

test('téléphone en paysage (844×390) : scène compacte, échelle ≈ 0,54', () => {
  const layout = computeLayout(844, 390, TECH);
  assert.equal(layout.profile, 'compact');
  assert.deepEqual(layout.stage, TECH.COMPACT_STAGE);
  assert.ok(Math.abs(layout.scale - 390 / 720) < 1e-9);
  assert.ok(layout.x > 0, 'bandes de décor sur les côtés');
});
