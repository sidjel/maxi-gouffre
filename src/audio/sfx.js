/**
 * Sons provisoires synthétiques (Web Audio) : aucun fichier, aucun réseau.
 * Le son ne démarre qu'après un premier geste du joueur (règle des navigateurs).
 */
import { config } from '../config.js';

let ctx = null;
let master = null;

export function unlockAudio() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { ctx = null; }
}

function tone(freq, dur, { type = 'sine', gain = 0.2, at = 0, to = null, attack = 0.005 } = {}) {
  if (!ctx || config.volume <= 0) return;
  master.gain.value = config.volume;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** Bip de caisse. */
  beep() { tone(1860, 0.11, { type: 'square', gain: 0.07 }); },
  /** Aspiration du produit. */
  suck(duration = 0.6) { tone(220, duration, { type: 'triangle', gain: 0.08, to: 1400, attack: 0.08 }); },
  /** Apparition de la carte : petit arpège. */
  card() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', gain: 0.09, at: i * 0.06 })); },
  /** La carte rejoint le Panier. */
  drop() { tone(660, 0.08, { type: 'sine', gain: 0.1, to: 330 }); },
  /** Carillon avant une annonce du narrateur. */
  chime() { tone(784, 0.45, { gain: 0.08 }); tone(622, 0.7, { gain: 0.08, at: 0.24 }); },
  /** Petit choc (produit déjà scanné, obstacle). */
  thud() { tone(140, 0.12, { type: 'sine', gain: 0.14, to: 70 }); },
  /** Clic d'interface. */
  click() { tone(900, 0.04, { type: 'square', gain: 0.03 }); },
};
