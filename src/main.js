/**
 * MAXI-GOUFFRE — prototype A « Le rayon ».
 * Assemble le lieu, le personnage, les entrées et l'interface, puis fait tourner la boucle de jeu.
 */
import './styles/base.css';
import './styles/scene.css';
import './styles/ui.css';
import './styles/card.css';
import './styles/settings.css';

import { config, FIXED, loadConfig, onConfigChange } from './config.js';
import { createRng } from './core/rng.js';
import { maskFromData, depthScale } from './core/geometry.js';
import { buildGrid } from './core/path.js';
import { createCard, ageCard } from './core/cards.js';
import { createNarratorBrain } from './core/narrator.js';
import aisle from './data/aisle.json';
import catalog from './data/products.json';
import lines from './data/lines.json';
import character from './data/character.json';
import { createStage } from './scene/stage.js';
import { createAisle, createCamera } from './scene/aisle.js';
import { createProducts } from './scene/products.js';
import { createPaperChar } from './scene/paperChar.js';
import { createPlayer } from './scene/player.js';
import { createParticles } from './scene/particles.js';
import { createScanner } from './scene/scan.js';
import { createDebugOverlay } from './scene/debugOverlay.js';
import { el } from './scene/assets.js';
import { createInput } from './input/input.js';
import { createHud } from './ui/hud.js';
import { createNarratorBand } from './ui/narratorBand.js';
import { createCardReveal } from './ui/cardReveal.js';
import { createBasket } from './ui/basket.js';
import { createSettings } from './ui/settings.js';
import { unlockAudio, sfx } from './audio/sfx.js';

loadConfig(window.location.search);
const rng = createRng(FIXED.seed);
const thresholds = () => ({ ripeAt: config.ripeAt, rottenAt: config.rottenAt });

// --- Scène ---
const stage = createStage();
const world = createAisle(stage.node, aisle);
const mask = maskFromData(aisle.walk);
const grid = buildGrid(mask, FIXED.gridCell);
const camera = createCamera(aisle, FIXED.stageWidth);
const products = createProducts(world.products, aisle, catalog);
const char = createPaperChar(world.actors, character);
const player = createPlayer({ aisle, mask, grid });
const particles = createParticles(stage.node, stage, rng);
const scanner = createScanner(world.fx);
const debug = createDebugOverlay(world.plane, aisle, mask);
char.face(aisle.spawn.view, aisle.spawn.side, true);

// --- Interface ---
const ui = el('div', 'ui');
stage.node.append(ui);
const input = createInput(stage);
const narrator = createNarratorBand(ui);
const brain = createNarratorBrain(lines, rng);
const say = (event) => narrator.say(brain.say(event));
const reveal = createCardReveal(ui);
const basketCards = [];
const state = { mode: 'walk', lastIdleSay: 0, lastEndSay: -1e9, cardCount: 0 };

const basket = createBasket(ui, { onClose: () => closeMenu() });
const settings = createSettings(document.getElementById('overlays'), { onClose: () => closeMenu() });
const hud = createHud(ui, input, {
  onBasket: () => toggleBasket(),
  onSettings: () => toggleSettings(),
  onAction: () => act(),
});

function applyDisplayOptions() {
  document.documentElement.classList.toggle('reduce-motion', config.reduceMotion);
  hud.setJoystickVisible(config.joystick);
}
applyDisplayOptions();
onConfigChange(applyDisplayOptions);

// --- Menus ---
function toggleBasket() {
  if (state.mode === 'basket') { closeMenu(); return; }
  if (state.mode !== 'walk') return;
  state.mode = 'basket';
  player.stop();
  basket.show(basketCards);
  say('basket');
}
function toggleSettings() {
  if (state.mode === 'settings') { closeMenu(); return; }
  if (state.mode === 'scan') return;
  if (state.mode === 'basket') basket.hide();
  state.mode = 'settings';
  player.stop();
  settings.show();
  say('settings');
}
function closeMenu() {
  basket.hide();
  settings.hide();
  if (state.mode === 'basket' || state.mode === 'settings') state.mode = 'walk';
  document.activeElement?.blur?.();
}

// --- Scanner ---
function makeCard(product) {
  state.cardCount += 1;
  return createCard(product, { uid: `c${state.cardCount}`, rng, jitter: config.ageJitter, thresholds: thresholds() });
}

async function scan(item) {
  if (item.scanned) {
    say('already');
    sfx.thud();
    char.startle(0.35);
    return;
  }
  state.mode = 'scan';
  player.stop();
  char.setAnim('scan');
  const card = await scanner.run({ item, char, player, products, particles, reveal, hud, camera, cfg: config, makeCard });
  basketCards.push(card);
  basket.refresh(basketCards);
  hud.setCount(basketCards.length);
  char.setAnim('idle');
  state.mode = 'walk';
  if (!brain.hasSaid('firstScan')) say('firstScan');
  else if (products.allScanned()) say('allScanned');
  else say(`scan:${item.product.id}`);
}

function act() {
  unlockAudio();
  if (state.mode === 'scan') { reveal.skip(); return; }
  if (state.mode === 'settings') { settings.press(); return; }
  if (state.mode !== 'walk') return;
  const item = products.near;
  if (item) scan(item);
}

/** Aller au pied d'un produit, se tourner vers lui. */
function goToProduct(item) {
  const y = aisle.floor.yBack + 30;
  player.goTo(item.x, y, () => char.face('back', Math.sign(item.x - player.x) || char.side));
}

// --- Entrées ---
input.on('action', act);
input.on('basket', () => { unlockAudio(); toggleBasket(); });
input.on('settings', () => { unlockAudio(); toggleSettings(); });
input.on('debug', () => { config.debugMask = !config.debugMask; });
input.on('cancel', () => {
  if (state.mode === 'scan') reveal.skip();
  else if (state.mode !== 'walk') closeMenu();
  else player.stop();
});
input.on('nav', (d) => {
  if (state.mode === 'basket') basket.nav(d);
  else if (state.mode === 'settings') settings.nav(d, input.device === 'gamepad');
});
input.on('point', ({ x, y, target, first }) => {
  unlockAudio();
  if (state.mode === 'scan') { if (first) reveal.skip(); return; }
  if (state.mode !== 'walk') return;
  const item = first ? products.fromNode(target) : null;
  if (item) {
    if (products.near === item) scan(item);
    else goToProduct(item);
    return;
  }
  player.goTo(x + camera.x, y);
});
window.addEventListener('pointerdown', unlockAudio, { once: true });

// --- Boucle ---
let last = performance.now();
let started = false;
camera.snap(player.x);

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  input.poll(now);

  const walking = state.mode === 'walk';
  const dir = walking ? input.moveVector() : { x: 0, y: 0 };
  const { moved, bumped } = player.update(dt, dir, config);

  // Orientation : gauche/droite selon la marche, dos quand on s'éloigne, face quand on revient.
  if (walking && player.moving) {
    const side = Math.abs(player.vx) > 30 ? Math.sign(player.vx) : char.side;
    let view = char.view;
    if (player.vy < -40 && Math.abs(player.vy) > Math.abs(player.vx) * 0.35) view = 'back';
    else if (player.vy > 40 && Math.abs(player.vy) > Math.abs(player.vx) * 0.35) view = 'front';
    char.face(view, side);
  }
  if (walking) char.setAnim(player.moving ? 'walk' : 'idle');
  if (bumped && walking) say('bump');

  const k = (character.height / character.views[char.view].size[1]) * config.charScale
    * depthScale(player.y, aisle.floor, config.depthScaleFar, config.depthScaleNear);
  char.update(dt, { x: player.x, y: player.y, scale: k, moved, moving: player.moving }, config);

  world.update(camera.update(dt, player, config));
  scanner.update();
  particles.update(dt, camera.x);
  products.update(now);

  // Produit le plus proche.
  if (walking) {
    const near = products.findNearest(player.x, player.y, config.interactRadius, aisle.floor.yBack);
    products.setNear(near, input.device === 'touch' ? 'Touche pour scanner' : 'Scanner');
    hud.setAction(near ? (near.scanned ? 'Rupture' : 'Scanner') : 'Scanner', !!near);
    if (near && !brain.hasSaid('firstNear') && brain.hasSaid('arrive')) say('firstNear');
  } else if (state.mode !== 'scan') products.setNear(null);
  hud.setDevice(input.device);

  // Le narrateur : arrivée, inactivité, bout du rayon.
  if (!started && now > 900) { started = true; say('arrive'); }
  if (walking && now - input.lastActivity > config.idleSec * 1000 && input.lastActivity > state.lastIdleSay) {
    state.lastIdleSay = now;
    say('idle');
  }
  if ((player.x < aisle.endZones.left || player.x > aisle.endZones.right) && now - state.lastEndSay > 25000) {
    state.lastEndSay = now;
    say('aisleEnd');
  }
  narrator.update(dt, config);

  // Pourrissement dans le Panier (désactivé par défaut : réglage « Pourrissement dans le Panier »).
  if (config.basketAgingPerMin > 0 && basketCards.length) {
    const amount = (config.basketAgingPerMin * dt) / 60;
    let changed = false;
    for (let i = 0; i < basketCards.length; i += 1) {
      const next = ageCard(basketCards[i], amount, thresholds());
      changed ||= next.stage !== basketCards[i].stage;
      basketCards[i] = next;
    }
    state.ageTick = (state.ageTick ?? 0) + dt;
    if (changed || (basket.open && state.ageTick > 0.5)) { state.ageTick = 0; basket.refresh(basketCards); }
  }

  debug.update(config.debugMask, player);
  hud.tickFps(dt, config.showFps || config.debugMask);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Accès pour les tests navigateur et le débogage dans la console.
window.__MG__ = { state, player, products, basketCards, config, camera, narrator, char };
