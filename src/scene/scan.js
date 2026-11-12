/**
 * Le scan d'un produit, en étapes :
 * 1. le personnage se tourne vers le rayon (pivot de la feuille) ;
 * 2. il lève sa douchette, laser, bip ;
 * 3. le produit se dissout en particules aspirées par la douchette ;
 * 4. la carte apparaît, puis rejoint le Panier.
 */
import { el } from './assets.js';
import { sfx } from '../audio/sfx.js';

export function createScanner(fxLayer) {
  const laser = el('div', 'laser');
  fxLayer.append(laser);
  let beam = null; // { from: () => point, to: point }

  function drawLaser() {
    if (!beam) return;
    const a = beam.from();
    const b = beam.to;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    laser.style.width = `${len}px`;
    laser.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) rotate(${ang}rad)`;
  }

  return {
    /** À appeler à chaque image pendant le scan (la douchette bouge avec le personnage). */
    update() { drawLaser(); },
    /**
     * @param {object} ctx { item, char, player, products, particles, reveal, hud, camera, stage, cfg, makeCard }
     * @returns {Promise<object>} la carte créée
     */
    async run(ctx) {
      const { item, char, player, products, particles, reveal, hud, camera, cfg } = ctx;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const reduce = cfg.reduceMotion;
      const T = cfg.scanMs * (reduce ? 0.6 : 1);

      const side = Math.sign(item.x - player.x) || char.side;
      char.face('back', side);
      await wait(reduce ? 30 : cfg.flipMs + 40);
      char.setScanning(true);
      char.startle(0.5);
      await wait(160);

      const box = { x: item.x - item.product.w / 2, y: item.y - item.product.h, w: item.product.w, h: item.product.h };
      beam = { from: () => char.tipWorld(), to: { x: item.x, y: item.y - item.product.h / 2 } };
      drawLaser();
      laser.classList.add('is-on');
      products.setScanning(item, true);
      sfx.beep();
      await wait(T * 0.35);

      sfx.beep();
      sfx.suck(T * 0.0006);
      laser.classList.remove('is-on');
      beam = null;
      products.setScanning(item, false);
      products.markScanned(item, performance.now(), cfg.restockSec);
      const count = reduce ? Math.round(cfg.particles / 3) : cfg.particles;
      particles.burst(box, item.product.colors, count, () => char.tipWorld(), (T * 0.65) / 1000);
      await wait(T * 0.65);

      const card = ctx.makeCard(item.product);
      const tip = char.tipWorld();
      char.startle(0.8);
      char.setScanning(false);
      await reveal.show(card, { x: tip.x - camera.x, y: tip.y }, hud.basketCenter(), cfg);
      return card;
    },
  };
}
