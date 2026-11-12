/**
 * Cerveau du narrateur : choisit la réplique d'un événement, sans répéter la précédente,
 * et retient les événements « une seule fois ». Pur : le texte est affiché ailleurs (ui/narratorBand).
 *
 * lines.json : { "événement": { "priority": n, "once": bool, "lines": ["…"] } }
 * Un événement « scan:banane » retombe sur « scan » s'il n'a pas de répliques à lui.
 */
export function createNarratorBrain(data, rng) {
  const last = new Map();
  const done = new Set();

  function resolve(event) {
    if (data[event]?.lines?.length) return event;
    const base = event.split(':')[0];
    return data[base]?.lines?.length ? base : null;
  }

  return {
    /** Renvoie { event, text, priority } ou null (rien à dire). */
    say(event) {
      const key = resolve(event);
      if (!key) return null;
      const entry = data[key];
      if (entry.once && done.has(key)) return null;
      done.add(key);
      const pool = entry.lines.length > 1 ? entry.lines.filter((l) => l !== last.get(key)) : entry.lines;
      const text = rng.pick(pool);
      last.set(key, text);
      return { event: key, text, priority: entry.priority ?? 1 };
    },
    hasSaid(event) { return done.has(event); },
  };
}

/** Retire le préfixe [TEMP] pour l'affichage. */
export const displayText = (text) => text.replace(/^\[TEMP\]\s*/, '');
