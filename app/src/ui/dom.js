/**
 * Petit utilitaire de création d'éléments. Les textes passent toujours par textContent :
 * aucun texte du joueur ni des données n'est inséré comme du HTML brut (ARCHITECTURE.md §4).
 */

/**
 * Crée un élément.
 * @param {string} tag
 * @param {{ className?: string, text?: string, attrs?: Record<string, string|boolean>, on?: Record<string, EventListener> }} [opts]
 * @param {(Node|string|null|undefined)[]} [children]
 * @returns {HTMLElement}
 */
export function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  for (const [name, value] of Object.entries(opts.attrs ?? {})) {
    if (value === false || value === null || value === undefined) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const [type, fn] of Object.entries(opts.on ?? {})) node.addEventListener(type, fn);
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Vide un élément. */
export function clear(node) {
  node.replaceChildren();
}
