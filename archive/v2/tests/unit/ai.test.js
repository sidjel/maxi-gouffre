import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseMove, chooseStarter, playTurn, decideStarter } from '../../app/src/core/ai.js';
import { playCard, setChifoumi, endRound, pass, legalMoves } from '../../app/src/core/match.js';
import { setStarter } from '../../app/src/core/match.js';
import { createQuickMatch } from '../../app/src/core/quickMatch.js';
import { makeCtx, makeMatch, startPlay } from '../helpers/match.js';

const base = await makeCtx();

test('Noob : pose une carte posable sur une case légale, reproductible avec la même graine', () => {
  const { state, ctx } = makeMatch(base, { player: [{ card: 'banane' }], opponent: [{ card: 'scotch', stage: 1 }, { card: 'pizza' }, { card: 'biere', stage: 3 }] });
  const s = startPlay(state, ctx, 'opponent').state;
  for (let seed = 1; seed < 30; seed += 1) {
    const { value: move } = chooseMove(s, 'noob', ctx, seed);
    assert.equal(move.type, 'play');
    assert.notEqual(move.uid, 'o001', 'jamais un Outil non posable');
    assert.ok(legalMoves(s, 'opponent', ctx).some((m) => m.uid === move.uid && m.cell === move.cell));
    assert.deepEqual(chooseMove(s, 'noob', ctx, seed), chooseMove(s, 'noob', ctx, seed));
  }
});

test('Noob : passe s\'il mène de AI_NOOB_PASS_LEAD points ou plus, joue sinon', () => {
  const { state, ctx } = makeMatch(base, { player: [{ card: 'banane' }, { card: 'pile' }], opponent: [{ card: 'papier', stage: 2 }, { card: 'pizza' }] });
  let s = pass(startPlay(state, ctx, 'player').state, 'player', ctx).state;
  s = playCard(s, 'opponent', 'o001', 0, null, ctx).state; // Dernier Rouleau 10
  assert.deepEqual(chooseMove(s, 'noob', ctx, 7).value, { type: 'pass' });
  const close = makeMatch(base, { player: [{ card: 'banane' }], opponent: [{ card: 'pizza' }, { card: 'console' }] });
  let c = playCard(startPlay(close.state, close.ctx).state, 'player', 'c001', 0, null, close.ctx).state;
  c = playCard(c, 'opponent', 'o001', 0, null, close.ctx).state; // 4 contre 2 : mène de 2
  assert.equal(chooseMove(c, 'noob', close.ctx, 7).value.type, 'play');
});

test('Noob : choisit au hasard qui commence ; niveau Gamer pas encore disponible', () => {
  const { state, ctx } = makeMatch(base, { player: [{ card: 'banane' }], opponent: [{ card: 'pizza' }] });
  const seen = new Set();
  for (let seed = 1; seed < 40; seed += 1) seen.add(chooseStarter(state, 'noob', ctx, seed).value);
  assert.deepEqual([...seen].sort(), ['opponent', 'player']);
  assert.throws(() => chooseMove(state, 'gamer', ctx, 1), /niveau inconnu ou pas encore disponible/);
});

test('playTurn et decideStarter consomment la graine de la partie', () => {
  const { state, ctx } = makeMatch(base, { player: [{ card: 'banane' }], opponent: [{ card: 'pizza' }, { card: 'console' }] });
  const s = structuredClone(state);
  s.match.phase = 'starter';
  s.match.chifoumiWinner = 'opponent';
  const d = decideStarter(s, ctx);
  assert.notEqual(d.state.game.rng, s.game.rng);
  assert.equal(d.state.match.phase, 'play');
  const t = playTurn(startPlay(state, ctx, 'opponent').state, ctx);
  assert.equal(t.events[0].type, 'CARD_PLAYED');
  assert.equal(t.events[0].side, 'opponent');
});

test('combat rapide : 300 matchs IA Noob contre un joueur au hasard se terminent tous', () => {
  const winners = { player: 0, opponent: 0 };
  for (let seed = 0; seed < 300; seed += 1) {
    let { state } = createQuickMatch(seed, base);
    for (let step = 0; state.match.phase !== 'matchOver'; step += 1) {
      assert.ok(step < 200, `match bloqué (graine ${seed})`);
      const m = state.match;
      if (m.phase === 'chifoumi') state = setChifoumi(state, ['rock', 'paper', 'scissors'][step % 3], base).state;
      else if (m.phase === 'starter') state = m.chifoumiWinner === 'player' ? setStarter(state, 'player', 'player', base).state : decideStarter(state, base).state;
      else if (m.phase === 'roundOver') state = endRound(state, base).state;
      else if (m.turn === 'opponent') state = playTurn(state, base).state;
      else {
        const moves = legalMoves(state, 'player', base);
        const mv = moves[(seed + step) % moves.length];
        state = (seed + step) % 4 === 0 ? pass(state, 'player', base).state : playCard(state, 'player', mv.uid, mv.cell, null, base).state;
      }
    }
    winners[state.match.result.winner] += 1;
  }
  assert.equal(winners.player + winners.opponent, 300);
});
