# Journal des versions

Une entrée par jalon (ARCHITECTURE.md §18). Tag `vN.0-nom` posé après la fusion dans `main`.

## v0.0-socle — J0 : socle et mise en ligne (2026-11-06)

### Ajouté
- Arborescence du dépôt, `package.json` (scripts seulement, aucune dépendance d'exécution), `README.md`, `LICENSE` (tous droits réservés), `.editorconfig`, `.gitignore`.
- Publication GitHub Pages : `.github/workflows/pages.yml` lance `npm run check` sur chaque pull request et, après fusion sur `main`, publie `app/`.
- `app/index.html` et scène logique mise à l'échelle par CSS, profils `wide` (1920×1080) et `compact` (1280×720), recalculés au redimensionnement, bandes de décor sur les côtés.
- Écran « Tourne ton téléphone » sur téléphone tenu en portrait, avec pause des délais du jeu.
- Écran titre provisoire (style prospectus) : Nouvelle partie, Continuer (grisé), Options, Crédits ; chaque entrée affiche un message provisoire.
- Écran « Le magasin a planté » pour toute erreur fatale, avec le message et un bouton de retour au titre.
- Tokens CSS (palettes zone 1, zone 2, terminal ; tailles par profil ; durées ; `prefers-reduced-motion`).
- Polices OFL provisoires dans le jeu : Lilita One (affichage), Atkinson Hyperlegible (texte), IBM Plex Mono (terminal), avec leurs licences, enregistrées dans `app/data/credits.json`.
- Chargement des données (`content/loader.js`, même code navigateur et Node) et validation avec messages qui nomment fichier, élément et champ (`content/validate.js`).
- `config.js` (valeurs du GD §19 et de l'ARCHITECTURE §13, gelées), `core/rng.js` (générateur à graine pur), `EventBus`, `Scheduler` (délais annulables et mis en pause), `StateMachine` (états du GD §3, sous-états, superpositions, journal).
- `InputHandler` minimal : actions abstraites au clavier (dont F3) et au pointeur, menu contextuel désactivé.
- Panneau debug (`?debug=1`, F3, bouton « DBG ») : état courant en JSON, FPS, graine (lecture et saisie, 5 premiers tirages), journal des transitions.
- Outils : `serve`, `check` (données, registre des assets, tailles, recherches interdites, tests), `credits`, `screenshots`.
- Tests : 47 tests unitaires ; 11 tests navigateur (3 tailles, téléphone paysage et portrait, redimensionnement, debug, sous-dossier GitHub Pages, données illisibles).
