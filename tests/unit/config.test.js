import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GAME, TECH } from '../../app/src/config.js';

test('les constantes sont gelées, y compris en profondeur', () => {
  assert.ok(Object.isFrozen(GAME));
  assert.ok(Object.isFrozen(TECH));
  assert.ok(Object.isFrozen(GAME.CLOCK_MILESTONES));
  assert.ok(Object.isFrozen(TECH.WIDE_STAGE));
  assert.throws(() => { 'use strict'; GAME.HAND_SIZE = 12; }, TypeError);
});

test('valeurs dérivées du GD §19', () => {
  assert.equal(GAME.AGE_MAX, 3 * GAME.STAGE_LENGTH - 1);
  assert.equal(GAME.AGE_MAX, 44);
  assert.equal(GAME.MAX_ACTIONS_PER_ROUND, 4 * GAME.HAND_SIZE);
  assert.deepEqual(GAME.STAGE_LENGTH_OPTIONS, { slow: 20, normal: 15, fast: 10 });
});

test('valeurs de référence du GD §19 et de l\'ARCHITECTURE §13', () => {
  const expected = {
    HAND_SIZE: 10, GRID_COLS: 5, GRID_ROWS: 2, ROUNDS_TO_WIN: 2, MAX_ROUNDS: 3,
    SURGELE_FRESH_MULT: 2, SURGELE_RIPE_LENGTH: 1, CRAN_CARD_PLAYED: 1, CRAN_NEW_ROOM: 3,
    CRAN_NEW_DIALOGUE: 1, CRAN_DEFEAT: 5, LOOT_AMONG: 3, LOOT_PICK: 1, SOLDEUR_TRADES: 2,
    SOLDEUR_OFFERS: 3, DOOR_FLEE_COUNT: 3, DOOR_FLEE_DISTANCE: 80, DEFEAT_DISCOVERY_PROPOSAL: 3,
    BAD_MOVE_PASS_GAP: 8, BAD_MOVE_MIN_HAND: 3, FRIDGE_SLOTS: 3, FUSIONS_PER_KITCHEN: 1,
    FUSION_SCOTCH_PENALTY: 3, FUSED_STAGE3_RATIO: 0.5, TRANSFER_RATIO: 0.5, BOOST_VALUE: 1,
    ZONE_MALUS_VALUE: 1, SCORE_FLOOR: 0, AI_NOOB_PASS_LEAD: 8, AI_DELAY_MIN: 800, AI_DELAY_MAX: 1500,
    NARRATOR_GLOBAL_COOLDOWN: 20, NARRATOR_LINE_COOLDOWN: 600, INACTIVITY_1: 30, INACTIVITY_2: 90,
    PANIC_TURNS: 1,
  };
  for (const [key, value] of Object.entries(expected)) assert.equal(GAME[key], value, key);
  assert.deepEqual(GAME.CLOCK_MILESTONES, [20, 40, 60, 80]);
  assert.deepEqual(TECH.WIDE_STAGE, { width: 1920, height: 1080 });
  assert.deepEqual(TECH.COMPACT_STAGE, { width: 1280, height: 720 });
  assert.equal(TECH.COMPACT_MAX_WIDTH, 1100);
  assert.equal(TECH.COMPACT_MAX_HEIGHT, 620);
  assert.equal(TECH.TOUCH_MIN_PX, 44);
  assert.equal(TECH.LONG_PRESS_MS, 500);
  assert.equal(TECH.TAP_SLOP_PX, 10);
  assert.equal(TECH.STORAGE_PREFIX, 'maxi-gouffre.');
});
