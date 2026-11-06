import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setChifoumi, setStarter, playCard, pass, endRound, matchOutcome, matchWinner, THROWS } from '../../app/src/core/match.js';
import { evaluate } from '../../app/src/core/effects.js';
import { makeCtx, makeMatch, startPlay } from '../helpers/match.js';

const base = await makeCtx();
const types = (events) => events.map((e) => e.type);

function duel(spec) {
  return makeMatch(base, {
    player: spec.player ?? [{ card: 'banane' }, { card: 'baguette' }, { card: 'pile' }],
    opponent: spec.opponent ?? [{ card: 'pizza' }, { card: 'console' }, { card: 'biere' }],
    rules: spec.rules,
  });
}

test('createMatch : main de 10 cartes au plus, cartes de la Collection, état initial', () => {
  const { state } = duel({});
  const m = state.match;
  assert.equal(m.phase, 'chifoumi');
  assert.deepEqual(m.hands.player, ['c001', 'c002', 'c003']);
  assert.deepEqual(m.hands.opponent, ['o001', 'o002', 'o003']);
  assert.equal(m.board.player.length, 10);
  assert.deepEqual(m.wins, { player: 0, opponent: 0 });
  const eleven = Array.from({ length: 11 }, () => ({ card: 'banane' }));
  assert.throws(() => makeMatch(base, { player: eleven, opponent: [{ card: 'pizza' }] }), /main de 11 cartes/);
});

test('chifoumi : rejoué en cas d\'égalité, puis le vainqueur choisit qui commence', () => {
  let { state, ctx } = duel({});
  let r;
  const seen = new Set();
  for (let i = 0; i < 50 && state.match.phase === 'chifoumi'; i += 1) {
    r = setChifoumi(state, THROWS[i % 3], ctx);
    assert.equal(types(r.events)[0], 'CHIFOUMI_PLAYED');
    seen.add(r.state.match.chifoumi.winner);
    if (r.state.match.chifoumi.winner === null) assert.equal(r.state.match.phase, 'chifoumi', 'égalité : on rejoue');
    assert.notEqual(r.state.game.rng, state.game.rng, 'le coup de l\'IA consomme la graine');
    state = r.state;
  }
  assert.equal(state.match.phase, 'starter');
  const winner = state.match.chifoumiWinner;
  assert.throws(() => setStarter(state, winner === 'player' ? 'opponent' : 'player', 'player', ctx), /n'a pas gagné le chifoumi/);
  const started = setStarter(state, winner, 'opponent', ctx);
  assert.equal(started.state.match.turn, 'opponent');
  assert.equal(started.state.match.phase, 'play');
  assert.deepEqual(types(started.events), ['STARTER_CHOSEN', 'ROUND_STARTED']);
});

test('chifoumi : même graine, mêmes tirages', () => {
  const a = duel({});
  const b = duel({});
  assert.deepEqual(setChifoumi(a.state, 'rock', a.ctx).state.match.chifoumi, setChifoumi(b.state, 'rock', b.ctx).state.match.chifoumi);
});

test('les actions sont pures : l\'état d\'origine n\'est jamais modifié', () => {
  const { state, ctx } = duel({});
  const s = startPlay(state, ctx).state;
  const before = structuredClone(s);
  playCard(s, 'player', 'c001', 0, null, ctx);
  pass(s, 'player', ctx);
  assert.deepEqual(s, before);
});

test('pose : la carte quitte la main, son stade est verrouillé, le tour passe, le score suit', () => {
  const { state, ctx } = duel({});
  const r = playCard(startPlay(state, ctx).state, 'player', 'c002', 3, null, ctx);
  const m = r.state.match;
  assert.deepEqual(m.hands.player, ['c001', 'c003']);
  assert.deepEqual(m.board.player[3], { uid: 'c002', owner: 'player', lockedStage: 1, transferBonus: 0 });
  assert.equal(m.turn, 'opponent');
  assert.deepEqual(evaluate(r.state, ctx).score, { player: 4, opponent: 0 });
  assert.equal(r.events[0].type, 'CARD_PLAYED');
  assert.throws(() => playCard(r.state, 'player', 'c001', 0, null, ctx), /pas le tour de player/);
  assert.throws(() => playCard(r.state, 'opponent', 'o001', 99, null, ctx), /illégale/);
  assert.throws(() => playCard(r.state, 'opponent', 'c001', 0, null, ctx), /pas dans la main/);
});

test('Malus : posé chez l\'adversaire, il compte pour ce camp ; score plancher à 0', () => {
  const { state, ctx } = duel({ player: [{ card: 'biere', age: 30 }, { card: 'banane' }], opponent: [{ card: 'pizza' }, { card: 'console' }] });
  let s = startPlay(state, ctx).state;
  s = playCard(s, 'player', 'c001', 2, null, ctx).state;
  assert.equal(s.match.board.opponent[2].owner, 'player');
  assert.deepEqual(evaluate(s, ctx).score, { player: 0, opponent: 0 }, 'Vomi −4 : plancher à 0');
  s = playCard(s, 'opponent', 'o001', 0, null, ctx).state;
  assert.deepEqual(evaluate(s, ctx).score, { player: 0, opponent: 0 }, 'Pizza 4 − 4 = 0');
  s = playCard(s, 'player', 'c002', 0, null, ctx).state;
  s = playCard(s, 'opponent', 'o002', 1, null, ctx).state;
  assert.deepEqual(evaluate(s, ctx).score, { player: 2, opponent: 4 });
});

test('passer est définitif ; l\'autre continue seul jusqu\'à passer ; puis fin de manche', () => {
  const { state, ctx } = duel({});
  let s = pass(startPlay(state, ctx).state, 'player', ctx).state;
  assert.equal(s.match.passed.player, true);
  assert.equal(s.match.turn, 'opponent');
  s = playCard(s, 'opponent', 'o001', 0, null, ctx).state;
  assert.equal(s.match.turn, 'opponent', 'le joueur a passé : l\'IA rejoue');
  const r = pass(s, 'opponent', ctx);
  assert.deepEqual(types(r.events), ['PLAYER_PASSED', 'ROUND_ENDED']);
  assert.equal(r.state.match.phase, 'roundOver');
  assert.deepEqual(r.state.match.roundScores, [{ player: 0, opponent: 4, winner: 'opponent' }]);
  assert.equal(r.state.match.wins.opponent, 1);
  assert.equal(r.state.match.board.opponent[0].uid, 'o001', 'le plateau reste visible jusqu\'à endRound');
});

test('passe automatique : main vide ou camp cible plein', () => {
  const { state, ctx } = duel({ player: [{ card: 'banane' }], opponent: [{ card: 'pizza' }, { card: 'console' }] });
  let r = playCard(startPlay(state, ctx).state, 'player', 'c001', 0, null, ctx);
  assert.equal(r.state.match.turn, 'opponent');
  r = playCard(r.state, 'opponent', 'o001', 0, null, ctx);
  assert.ok(r.events.some((e) => e.type === 'PLAYER_PASSED' && e.side === 'player' && e.auto), 'main vide : passe automatique');
  assert.equal(r.state.match.turn, 'opponent', 'l\'IA rejoue seule');
  const outil = duel({ player: [{ card: 'scotch', age: 0 }], opponent: [{ card: 'pizza' }] });
  const o = startPlay(outil.state, outil.ctx);
  assert.equal(o.state.match.passed.player, true, 'seul un Outil non posable en main : passe automatique');
  assert.equal(o.state.match.turn, 'opponent');
});

test('fin de manche : défausse, aucune repioche, le perdant commence la suivante', () => {
  const { state, ctx } = duel({});
  let s = playCard(startPlay(state, ctx, 'player').state, 'player', 'c003', 0, null, ctx).state; // Pile 6
  s = pass(s, 'opponent', ctx).state;
  s = pass(s, 'player', ctx).state;
  assert.equal(s.match.roundScores[0].winner, 'player');
  const r = endRound(s, ctx);
  const m = r.state.match;
  assert.equal(m.round, 2);
  assert.deepEqual(m.discard.player, ['c003']);
  assert.ok(m.board.player.every((c) => c === null));
  assert.deepEqual(m.hands.player, ['c001', 'c002']);
  assert.equal(m.starter, 'opponent', 'le perdant de la manche commence');
  assert.equal(m.turn, 'opponent');
  assert.deepEqual(m.passed, { player: false, opponent: false });
  assert.throws(() => endRound(r.state, ctx), /fin de manche impossible/);
});

test('manche nulle : personne ne marque, celui qui n\'avait pas commencé commence', () => {
  const { state, ctx } = duel({});
  let s = pass(startPlay(state, ctx, 'player').state, 'player', ctx).state;
  s = pass(s, 'opponent', ctx).state;
  assert.deepEqual(s.match.roundScores[0], { player: 0, opponent: 0, winner: null });
  assert.deepEqual(s.match.wins, { player: 0, opponent: 0 });
  assert.equal(endRound(s, ctx).state.match.starter, 'opponent');
});

test('fin de match : le premier à 2 manches gagne tout de suite', () => {
  const { state, ctx } = duel({});
  let s = playCard(startPlay(state, ctx).state, 'player', 'c001', 0, null, ctx).state;
  s = pass(pass(s, 'opponent', ctx).state, 'player', ctx).state;
  s = endRound(s, ctx).state; // l'IA commence la manche 2
  s = pass(s, 'opponent', ctx).state;
  s = playCard(s, 'player', 'c002', 0, null, ctx).state;
  const r = pass(s, 'player', ctx);
  assert.equal(r.state.match.phase, 'matchOver');
  assert.deepEqual(r.state.match.result, { winner: 'player', by: 'rounds' });
  assert.equal(r.events.at(-1).type, 'MATCH_ENDED');
});

test('départage en cascade : points cumulés, puis cartes en main, puis chifoumi', () => {
  const rules = base.rules;
  const m = (over) => ({ flags: { singleRound: false }, wins: { player: 1, opponent: 1 }, chifoumiWinner: 'opponent',
    hands: { player: [], opponent: [] }, roundScores: [{ player: 5, opponent: 3 }, { player: 2, opponent: 4 }, { player: 4, opponent: 4 }], ...over });
  assert.equal(matchOutcome(m({ roundScores: [{ player: 5, opponent: 3 }, { player: 2, opponent: 4 }] }), rules), null, 'match en cours');
  assert.deepEqual(matchOutcome(m({ roundScores: [{ player: 9, opponent: 3 }, { player: 2, opponent: 4 }, { player: 1, opponent: 1 }] }), rules), { winner: 'player', by: 'points' });
  assert.deepEqual(matchOutcome(m({ hands: { player: ['a'], opponent: [] } }), rules), { winner: 'player', by: 'cards' });
  assert.deepEqual(matchOutcome(m({}), rules), { winner: 'opponent', by: 'chifoumi' });
  const draws = m({ wins: { player: 0, opponent: 0 }, roundScores: [{ player: 1, opponent: 1 }, { player: 0, opponent: 0 }, { player: 2, opponent: 2 }] });
  assert.equal(matchWinner(draws, rules), 'opponent', '3 manches nulles : départage');
});

test('singleRound : une seule manche, la gagner suffit', () => {
  const { state, ctx } = duel({ rules: ['singleRound', 'guided', 'noLoot'] });
  assert.deepEqual(state.match.flags, { singleRound: true, guided: true, noLoot: true, overtime: false });
  let s = playCard(startPlay(state, ctx).state, 'player', 'c001', 0, null, ctx).state;
  s = pass(pass(s, 'opponent', ctx).state, 'player', ctx).state;
  assert.equal(s.match.phase, 'matchOver');
  assert.deepEqual(s.match.result, { winner: 'player', by: 'rounds' });
});

test('garde-fou : plus de MAX_ACTIONS_PER_ROUND actions dans une manche lève une erreur', () => {
  const { state, ctx } = duel({});
  const s = startPlay(state, ctx).state;
  s.match.actionsThisRound = ctx.rules.MAX_ACTIONS_PER_ROUND;
  assert.throws(() => playCard(s, 'player', 'c001', 0, null, ctx), /garde-fou/);
});
