/**
 * Construit le lieu à partir de aisle.json : calques de décor (fond, plan du personnage, premier plan),
 * obstacles posés au sol, et met à jour le défilement (parallaxe) selon la caméra.
 */
import { el, img } from './assets.js';

export function createAisle(stageNode, aisle) {
  const back = el('div', 'layer layer-back');
  const planeLayer = el('div', 'layer layer-plane');
  const front = el('div', 'layer layer-front');
  const plane = el('div', 'plane');
  const products = el('div', 'products');
  const actors = el('div', 'actors');
  const fx = el('div', 'fx');
  plane.append(products, actors, fx);
  planeLayer.append(plane);
  stageNode.append(back, planeLayer, front);

  const decor = aisle.decor.map((d) => {
    const node = img(d.image, 'decor', d.w, d.h);
    node.dataset.id = d.id;
    (d.plane === 'front' ? front : back).append(node);
    return { d, node };
  });

  // Obstacles posés au sol : ancrés en bas au centre, triés avec le personnage par leur base (y).
  for (const p of aisle.props) {
    const node = img(p.image, 'actor prop-img', p.w, p.h);
    node.dataset.id = p.id;
    node.style.transform = `translate3d(${p.x - p.w / 2}px, ${p.y - p.h}px, 0)`;
    node.style.zIndex = String(Math.round(p.y));
    actors.append(node);
  }

  let lastCam = NaN;
  return {
    plane, products, actors, fx,
    /** Place chaque calque selon la caméra (x du bord gauche de l'écran dans le monde). */
    update(camX) {
      if (camX === lastCam) return;
      lastCam = camX;
      plane.style.transform = `translate3d(${-camX}px, 0, 0)`;
      for (const { d, node } of decor) node.style.transform = `translate3d(${d.x - camX * d.parallax}px, ${d.y}px, 0)`;
    },
  };
}

/** Caméra horizontale qui glisse doucement derrière le personnage, avec un peu d'avance. */
export function createCamera(aisle, stageWidth) {
  let x = aisle.camera.minX;
  let lead = 0;
  return {
    get x() { return x; },
    snap(targetX) { x = clampCam(aisle, targetX - stageWidth / 2); },
    update(dt, player, cfg) {
      const want = cfg.walkSpeed > 0 ? player.vx / cfg.walkSpeed : 0;
      lead += (want * cfg.cameraLead - lead) * (1 - Math.exp(-1.5 * dt));
      const target = clampCam(aisle, player.x - stageWidth / 2 + lead);
      x += (target - x) * (1 - Math.exp(-cfg.cameraLerp * dt));
      if (Math.abs(target - x) < 0.05) x = target;
      return x;
    },
  };
}

const clampCam = (aisle, v) => Math.min(aisle.camera.maxX, Math.max(aisle.camera.minX, v));
