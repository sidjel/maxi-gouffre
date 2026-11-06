# MAXI-GOUFFRE

Jeu de cartes tactique au tour par tour dans un hypermarché infini, avec un narrateur odieux.
Web (DOM + CSS, JavaScript ES2022 en modules natifs, sans framework ni bundler), jouable sur PC, mobile et Android.

- **Jouer en ligne** : https://sidjel.github.io/maxi-gouffre/
- **Mode debug** : https://sidjel.github.io/maxi-gouffre/?debug=1 (touche F3 ou bouton « DBG »)
- Règles du jeu : [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) · Technique : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Journal : [`CHANGELOG.md`](CHANGELOG.md) · Décisions : [`docs/DECISIONS.md`](docs/DECISIONS.md) · Crédits : [`docs/CREDITS.md`](docs/CREDITS.md)

État : **jalon J0 — socle et mise en ligne**. L'écran titre est provisoire ; le premier match arrive au J1.

## Installation

Il faut **Node.js 20 ou plus** pour les outils (serveur local, vérifications, tests). Il n'est pas nécessaire pour jouer.
Le jeu n'a **aucune dépendance d'exécution**.

```bash
git clone https://github.com/sidjel/maxi-gouffre.git
cd maxi-gouffre
```

Seuls les tests navigateur et les captures demandent Playwright (une fois) :

```bash
npm install
npx playwright install chromium
```

## Lancer le jeu en local

Les modules JavaScript ne fonctionnent pas en `file://` : il faut un serveur HTTP.

```bash
npm run serve
```

Puis ouvrir http://localhost:8080 sur le PC. Sur un téléphone connecté au **même Wi-Fi**, ouvrir l'adresse
`http://IP-du-PC:8080` affichée par le serveur. Sans Node : `python -m http.server 8080 -d app`.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run serve` | Serveur local sur `app/` (port 8080, accessible depuis le téléphone) |
| `npm test` | Tests unitaires (`node --test` sur `tests/unit/*.test.js`) |
| `npm run check` | Données et registre des assets, taille des fichiers (< 300 lignes), recherches interdites, tests unitaires |
| `npm run e2e` | Tests navigateur Playwright aux 3 tailles de référence, console sans erreur ni avertissement |
| `npm run shots` | Captures d'écran dans `docs/captures/j0/` (option `-- --out dossier`) |
| `npm run credits` | Régénère `docs/CREDITS.md` depuis `app/data/credits.json` |

`npm run sim` (simulation d'équilibrage) arrive au jalon J2.

## Organisation

```
app/            le jeu, seul dossier publié (index.html, css/, assets/, data/, src/)
docs/           cahier des charges, décisions, crédits, captures
tests/          unit/ (node --test), e2e/ (Playwright), helpers/
tools/          serveur, vérifications, crédits, captures
```

## Publication

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) lance `npm run check` sur chaque pull request.
À chaque fusion sur `main`, il relance `npm run check` puis publie le dossier `app/` sur GitHub Pages.
Réglage du dépôt (déjà fait) : *Settings → Pages → Source : GitHub Actions*.

## Licence

Tous droits réservés (voir [`LICENSE`](LICENSE)). Les polices sont sous SIL Open Font License 1.1.
