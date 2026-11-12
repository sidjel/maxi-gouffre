# MAXI-GOUFFRE

RPG de cartes en papier dans un supermarché sans fin : on scanne les produits pour en extraire des cartes qui pourrissent.
Vision du jeu : [`docs/VISION.md`](docs/VISION.md) · Journal des séances : [`docs/JOURNAL.md`](docs/JOURNAL.md) · Règles de travail : [`CLAUDE.md`](CLAUDE.md)

- **Jouer en ligne** : https://sidjel.github.io/maxi-gouffre/ (mis à jour à chaque fusion sur `main`)
- **Ancienne version (v2, jeu de plateau)** : https://sidjel.github.io/maxi-gouffre/v2/ — code et documents dans [`archive/v2/`](archive/)

État : **prototype A — Le rayon** (marcher, scanner un produit, obtenir une carte).

## Lancer le jeu sur son ordinateur

Il faut **Node.js 20 ou plus**.

```bash
git clone https://github.com/sidjel/maxi-gouffre.git
cd maxi-gouffre
npm install
npm run dev
```

Le terminal affiche deux adresses :

- `Local: http://localhost:5173/` → à ouvrir sur le PC ;
- `Network: http://192.168.x.x:5173/` → à ouvrir sur le **téléphone**, connecté au **même Wi-Fi**.

Chaque fichier modifié est rechargé instantanément.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement, joignable depuis le téléphone |
| `npm run build` | Construit le jeu dans `dist/` (chemins relatifs) |
| `npm run preview` | Sert la version construite |
| `npm test` | Tests de la logique (`tests/unit`, Vitest) |
| `npm run check` | Fichiers < 300 lignes, aucune ressource externe, tests, construction |
| `npm run e2e` | Tests navigateur (Playwright) : PC 1920×1080, PC 1366×768, téléphone en paysage |
| `npm run shots` | Captures PC et téléphone dans `docs/captures/s1/` |
| `npm run art` | Régénère les visuels provisoires (SVG) dans `public/art/` |

## Organisation

```
src/core/     logique pure (hasard à graine, zone de marche, chemin, cartes, narrateur), testée avec Vitest
src/scene/    décor en calques, produits, personnage en papier, déplacement, scan, particules, debug
src/ui/       interface : narrateur, cartes, Panier, boutons, panneau de réglages
src/input/    clavier, souris, manette, tactile → actions
src/audio/    sons provisoires synthétiques
src/data/     contenu en JSON : lieu (aisle.json), produits, personnage, répliques
src/config.js toutes les valeurs réglables (panneau F2)
public/art/   visuels provisoires, référencés par les données (à remplacer par les dessins)
tools/        vérifications, captures, générateur de visuels provisoires
```

## Remplacer un visuel provisoire par un dessin

Déposer l'image dans `public/art/…` puis changer son chemin dans le fichier de données concerné
(`src/data/character.json`, `products.json` ou `aisle.json`). Aucun code à toucher.
Le personnage accepte des animations image par image : ajouter des images dans `frames` (voir le champ `notes`).

## Publication

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) lance `npm run check` sur chaque pull request.
À chaque fusion sur `main`, il publie `dist/` (et l'ancienne v2 dans `/v2/`) sur GitHub Pages.
Réglage du dépôt (déjà fait) : *Settings → Pages → Source : GitHub Actions*.

## Licence

Tous droits réservés (voir [`LICENSE`](LICENSE)). Les polices sont sous SIL Open Font License 1.1 (`public/fonts/`).
