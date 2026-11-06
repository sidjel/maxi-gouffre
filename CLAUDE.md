# MAXI-GOUFFRE — consignes pour Claude

Jeu de cartes tactique web (DOM + CSS, JavaScript ES2022 en modules natifs, sans framework ni bundler), jouable sur PC, mobile et Android.

## À lire avant chaque jalon
1. `docs/ARCHITECTURE.md` — technique, organisation du travail (§0), feuille de route (§18). Fait foi pour la technique.
2. `docs/GAME_DESIGN.md` — règles et contenu du jeu. Fait foi pour les règles.
3. `docs/DIRECTION_ARTISTIQUE.md` — apparence, décors, finitions, ambiance. Fait foi pour l'habillage.

Ces documents sont la référence. Ne pas recopier leurs règles ici : les lire.

## Façon de travailler
- **Un jalon complet par échange**, selon `ARCHITECTURE.md` §0.3 : branche `jN-nom` depuis `main`, code, tests, vérifications (§14), commits sur la branche, push, pull request, rapport de jalon.
- Ne jamais pousser sur `main` directement, ni force-push, sans accord explicite de l'auteur. L'auteur fusionne la pull request après avoir testé sur GitHub Pages.
- Règle manquante ou ambiguë : appliquer `GAME_DESIGN.md` §0.2 (décider seul si c'est mineur et le noter dans `docs/DECISIONS.md`, sinon demander).
- L'auteur teste **sans copie locale** : il fusionne la pull request puis joue sur https://sidjel.github.io/maxi-gouffre/ (PC et téléphone). Le rapport doit donc dire précisément quoi tester en ligne.
- `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` et `docs/DIRECTION_ARTISTIQUE.md` ne changent qu'à la demande de l'auteur.

## Rapports et échanges
- En français, phrases simples, à la première personne. Pas de formules creuses (« En outre », « Par ailleurs », « De surcroît », « En conclusion », « crucial », « plonger dans »).
- Rapport de jalon : nouveautés jouables, étapes de test (PC avec chaque entrée concernée, téléphone), captures, décisions prises seul, limites connues.

## État du projet
- Documents v2.0 en place dans `docs/`.
- **J0 — Socle et mise en ligne** : fusionné dans `main` (pull request sidjel/maxi-gouffre#1), tag `v0.0-socle` posé. Testé en ligne par l'auteur sur PC et téléphone : aucun bug. **Polices validées** : Lilita One, Atkinson Hyperlegible, IBM Plex Mono.
- **J1 — Premier match jouable** livré sur la branche `j1-premier-match` (pull request vers `main`) : « Combat rapide » depuis le titre, contre l'IA Noob (Chad Prot') ; 20 cartes et 6 plats en données (effets présents mais pas résolus) ; plateau 2.5D ou à plat ; main ; pose au pointeur ; Malus ; passer avec confirmation ; scores en direct ; 3 manches, manche nulle, départage, qui commence ; chifoumi ; fins de manche et de match ; `Store`, `Session`. Tag à poser après fusion : `v1.0-premier-match`.
- Vérifications : `npm run check` (données, registre, tailles, recherches interdites, tests unitaires) ; `npm run e2e` (smoke + `play-match.mjs`) et `npm run shots` utilisent Playwright (déjà présent dans les sessions cloud, sinon `npm install`). Les matchs e2e tournent avec le vrai délai de l'IA (~1 min 30 au total).
- Dans les sessions cloud, pousser un tag échoue et sidjel.github.io n'est pas joignable : l'auteur pose les tags et teste en ligne.
- Prochain jalon : **J1.5 — Habillage du combat et de l'accueil** (`ARCHITECTURE.md` §18, `DIRECTION_ARTISTIQUE.md` §12), puis **J2 — Effets, vieillissement, IA Gamer**. Points ouverts : départage aux points même avec 1 manche gagnée contre 2 nulles (DECISIONS J1) ; l'IA Noob vide souvent sa main dès la manche 1, à mesurer par la simulation.

Mettre à jour la section « État du projet » à la fin de chaque jalon.
