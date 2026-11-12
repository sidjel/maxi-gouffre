import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Scheduler } from '../../app/src/app/Scheduler.js';

/** Horloge factice : le temps n'avance que par advance(ms). */
function fakeClock() {
  let now = 0;
  let nextHandle = 1;
  const timers = new Map();
  return {
    now: () => now,
    setTimer: (fn, ms) => {
      const h = nextHandle++;
      timers.set(h, { fn, at: now + ms });
      return h;
    },
    clearTimer: (h) => timers.delete(h),
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const due = [...timers.entries()].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]);
        now = due[1].at;
        due[1].fn();
      }
      now = target;
    },
    get pending() {
      return timers.size;
    },
  };
}

test('un délai se déclenche après le temps demandé, pas avant', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  let fired = false;
  s.schedule(1000, () => { fired = true; });
  clock.advance(999);
  assert.equal(fired, false);
  clock.advance(1);
  assert.equal(fired, true);
  assert.equal(s.size, 0);
});

test('cancel annule un délai', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  let fired = false;
  const id = s.schedule(100, () => { fired = true; });
  assert.equal(s.cancel(id), true);
  clock.advance(500);
  assert.equal(fired, false);
  assert.equal(s.cancel(id), false);
});

test('la pause gèle le temps restant, la reprise le prolonge', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  let firedAt = null;
  s.schedule(1000, () => { firedAt = clock.now(); });
  clock.advance(400);
  s.pause();
  assert.equal(s.paused, true);
  clock.advance(5000);
  assert.equal(firedAt, null, 'rien ne se déclenche pendant la pause');
  s.resume();
  clock.advance(599);
  assert.equal(firedAt, null);
  clock.advance(1);
  assert.equal(firedAt, 6000);
});

test('un délai programmé pendant la pause attend la reprise', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  s.pause();
  let fired = false;
  s.schedule(10, () => { fired = true; });
  clock.advance(100);
  assert.equal(fired, false);
  s.resume();
  clock.advance(10);
  assert.equal(fired, true);
});

test('pause et resume répétés sont sans danger', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  let n = 0;
  s.schedule(100, () => { n += 1; });
  s.pause();
  s.pause();
  s.resume();
  s.resume();
  clock.advance(100);
  assert.equal(n, 1);
  assert.equal(clock.pending, 0);
});

test('clear annule tout', () => {
  const clock = fakeClock();
  const s = new Scheduler(clock);
  let n = 0;
  s.schedule(10, () => { n += 1; });
  s.schedule(20, () => { n += 1; });
  s.clear();
  clock.advance(100);
  assert.equal(n, 0);
  assert.equal(s.size, 0);
});

test('les délais invalides sont refusés', () => {
  const s = new Scheduler(fakeClock());
  assert.throws(() => s.schedule(-1, () => {}), RangeError);
  assert.throws(() => s.schedule(Number.NaN, () => {}), RangeError);
  assert.throws(() => s.schedule(10, 'pas une fonction'), TypeError);
});
