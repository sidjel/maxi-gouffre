/**
 * Personnage en papier façon Paper Mario.
 * - 2 vues (trois quarts face, trois quarts dos), dessinées tournées vers la droite, retournées en miroir à gauche.
 * - Pivot de la feuille quand il change de sens (la feuille passe par la tranche, on change de dessin, elle revient).
 * - Rendu vivant par le code : rebond en marchant, respiration à l'arrêt, écrasement/étirement au sursaut.
 * - Animations image par image lues dans character.json (idle, walk, scan, surprise…), sans changer le code.
 */
import { el, img } from './assets.js';

const SPRING_K = 260;
const SPRING_DAMP = 13;

export function createPaperChar(parent, def) {
  const root = el('div', 'actor char');
  const shadow = el('div', 'char-shadow');
  const sheet = el('div', 'char-sheet');
  root.append(shadow, sheet);
  parent.append(root);

  const views = {};
  for (const [name, v] of Object.entries(def.views)) {
    const box = el('div', 'char-view');
    box.dataset.view = name;
    const anims = {};
    for (const [animName, a] of Object.entries(v.animations)) {
      anims[animName] = { fps: a.fps || 8, frames: a.frames.map((f) => { const i = img(f, 'char-frame'); box.append(i); return i; }) };
    }
    let prop = null;
    if (v.prop) {
      prop = img(v.prop.image, 'char-prop', v.prop.size[0], v.prop.size[1]);
      prop.style.left = `${v.prop.hand[0] - v.prop.grip[0]}px`;
      prop.style.top = `${v.prop.hand[1] - v.prop.grip[1]}px`;
      prop.style.transformOrigin = `${v.prop.grip[0]}px ${v.prop.grip[1]}px`;
      box.append(prop);
    }
    sheet.append(box);
    views[name] = { def: v, box, anims, prop };
  }

  const s = {
    view: 'front', side: 1, anim: 'idle', animTime: 0, frameEl: null,
    flip: null, // { t, to: { view, side }, swapped }
    want: { view: 'front', side: 1 },
    phase: 0, moveBlend: 0, time: 0,
    squash: 0, squashV: 0,
    scanning: false, propAngle: null,
    x: 0, y: 0, k: 1,
  };

  function showView(name) {
    for (const [n, v] of Object.entries(views)) v.box.classList.toggle('is-on', n === name);
    const v = views[name].def;
    sheet.style.width = `${v.size[0]}px`;
    sheet.style.height = `${v.size[1]}px`;
    sheet.style.left = `${-v.feet[0]}px`;
    sheet.style.top = `${-v.feet[1]}px`;
    sheet.style.transformOrigin = `${v.feet[0]}px ${v.feet[1]}px`;
    s.frameEl = null;
  }
  showView(s.view);

  function pickFrame(dt) {
    const v = views[s.view];
    const a = v.anims[s.anim] ?? v.anims.idle;
    s.animTime += dt;
    const frame = a.frames[Math.floor(s.animTime * a.fps) % a.frames.length];
    if (frame !== s.frameEl) {
      s.frameEl?.classList.remove('is-on');
      frame.classList.add('is-on');
      s.frameEl = frame;
    }
  }

  return {
    root,
    get view() { return s.want.view; },
    get side() { return s.want.side; },
    get isFlipping() { return !!s.flip; },
    hasAnim: (name) => Object.values(views).some((v) => v.anims[name]),

    /** Demande une orientation ; le pivot de la feuille se fait tout seul. */
    face(view, side, instant = false) {
      if (s.want.view === view && s.want.side === side) return;
      s.want = { view, side };
      if (instant) { s.flip = null; s.view = view; s.side = side; showView(view); return; }
      if (s.flip && !s.flip.swapped) s.flip.to = { view, side };
      else s.flip = { t: 0, to: { view, side }, swapped: false };
    },
    setAnim(name) { if (s.anim !== name) { s.anim = name; s.animTime = 0; } },
    /** Sursaut : écrasement puis étirement (ressort amorti). */
    startle(strength = 1) { s.squash = -strength; s.squashV = 0; },
    setScanning(on) { s.scanning = on; },

    /**
     * @param {number} dt secondes
     * @param {{ x:number, y:number, scale:number, moved:number, moving:boolean }} m position au sol et déplacement
     * @param {object} cfg config
     */
    update(dt, m, cfg) {
      const reduce = cfg.reduceMotion;
      s.time += dt;
      s.x = m.x; s.y = m.y; s.k = m.scale;
      s.moveBlend += ((m.moving ? 1 : 0) - s.moveBlend) * (1 - Math.exp(-10 * dt));
      s.phase += (m.moved / cfg.stepLength) * Math.PI;

      // Pivot de la feuille : 0° → 90° (tranche) → changement de dessin → −90° → 0°.
      let angle = 0;
      if (s.flip) {
        s.flip.t += reduce ? 1 : (dt * 1000) / Math.max(1, cfg.flipMs);
        if (s.flip.t >= 0.5 && !s.flip.swapped) {
          s.flip.swapped = true;
          if (s.flip.to.view !== s.view) { s.view = s.flip.to.view; showView(s.view); }
          s.side = s.flip.to.side;
        }
        angle = s.flip.t < 0.5 ? 180 * s.flip.t : -90 + 180 * (s.flip.t - 0.5);
        if (s.flip.t >= 1) { s.flip = null; angle = 0; }
      }

      // Ressort d'écrasement / étirement.
      const a = -SPRING_K * s.squash - SPRING_DAMP * s.squashV;
      s.squashV += a * dt;
      s.squash += s.squashV * dt;
      const sq = reduce ? 0 : s.squash * cfg.squash;

      const bob = reduce ? 0 : Math.abs(Math.sin(s.phase)) * cfg.bobHeight * s.moveBlend;
      const tilt = reduce ? 0 : Math.sin(s.phase) * cfg.tiltDeg * s.moveBlend;
      const breathe = reduce ? 0 : Math.sin(s.time * 2 * Math.PI / 3.2) * cfg.breath * (1 - s.moveBlend);
      const hop = Math.max(0, sq) * 380;
      const sy = 1 + breathe + sq;
      const sx = 1 - breathe * 0.5 - sq * 0.5;

      root.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) scale(${m.scale})`;
      root.style.zIndex = String(Math.round(m.y));
      sheet.style.transform = `perspective(1400px) rotateY(${angle}deg) translateY(${-(bob + hop)}px) rotate(${tilt}deg) scale(${sx * s.side}, ${sy})`;
      const lift = 1 - Math.min(0.4, (bob + hop) / 200);
      shadow.style.transform = `scale(${lift * (s.flip ? 0.9 : 1)}, ${lift})`;

      // Douchette : au repos le long du corps, levée pendant le scan.
      const v = views[s.view];
      if (v.prop) {
        const target = s.scanning ? v.def.prop.scanAngle : v.def.prop.restAngle + Math.sin(s.phase) * 4 * s.moveBlend;
        s.propAngle = s.propAngle == null ? target : s.propAngle + (target - s.propAngle) * (1 - Math.exp(-(reduce ? 60 : 14) * dt));
        v.prop.style.transform = `rotate(${s.propAngle}deg)`;
      }
      pickFrame(dt);
    },

    /** Position de la pointe de la douchette dans le monde (origine du laser). */
    tipWorld() {
      const v = views[s.view].def;
      const p = v.prop;
      let lx; let ly;
      if (p) {
        const r = ((s.propAngle ?? p.restAngle) * Math.PI) / 180;
        const dx = p.tip[0] - p.grip[0]; const dy = p.tip[1] - p.grip[1];
        lx = p.hand[0] + dx * Math.cos(r) - dy * Math.sin(r);
        ly = p.hand[1] + dx * Math.sin(r) + dy * Math.cos(r);
      } else { lx = v.size[0] * 0.75; ly = v.size[1] * 0.55; }
      const ox = (lx - v.feet[0]) * s.side;
      return { x: s.x + ox * s.k, y: s.y + (ly - v.feet[1]) * s.k };
    },
  };
}
