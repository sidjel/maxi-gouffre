/** Adresse d'un fichier de public/ (chemins relatifs : marche dans un sous-dossier). */
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/** Crée un élément avec classes et attributs. */
export function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function img(path, className = '', w, h) {
  const node = el('img', className, { src: asset(path), alt: '', draggable: 'false', decoding: 'async' });
  if (w) { node.width = w; node.style.width = `${w}px`; }
  if (h) { node.height = h; node.style.height = `${h}px`; }
  return node;
}
