# MAXI-GOUFFRE — consignes pour Claude

Jeu de cartes tactique web (DOM + CSS, JavaScript ES2022 en modules natifs, sans framework ni bundler), jouable sur PC, mobile et Android.

## À lire avant chaque jalon
1. `docs/ARCHITECTURE.md` — technique, organisation du travail (§0), feuille de route (§18). Fait foi pour la technique.
2. `docs/GAME_DESIGN.md` — règles et contenu du jeu. Fait foi pour les règles.

Ces deux documents sont la référence. Ne pas recopier leurs règles ici : les lire.

## Façon de travailler
- **Un jalon complet par échange**, selon `ARCHITECTURE.md` §0.3 : branche `jN-nom` depuis `main`, code, tests, vérifications (§14), commits sur la branche, push, pull request, rapport de jalon.
- Ne jamais pousser sur `main` directement, ni force-push, sans accord explicite de l'auteur. L'auteur fusionne la pull request après avoir testé sur GitHub Pages.
- Règle manquante ou ambiguë : appliquer `GAME_DESIGN.md` §0.2 (décider seul si c'est mineur et le noter dans `docs/DECISIONS.md`, sinon demander).
- L'auteur teste **sans copie locale** : il fusionne la pull request puis joue sur https://sidjel.github.io/maxi-gouffre/ (PC et téléphone). Le rapport doit donc dire précisément quoi tester en ligne.
- `docs/GAME_DESIGN.md` et `docs/ARCHITECTURE.md` ne changent qu'à la demande de l'auteur.

## Rapports et échanges
- En français, phrases simples, à la première personne. Pas de formules creuses (« En outre », « Par ailleurs », « De surcroît », « En conclusion », « crucial », « plonger dans »).
- Rapport de jalon : nouveautés jouables, étapes de test (PC avec chaque entrée concernée, téléphone), captures, décisions prises seul, limites connues.

## État du projet
- Documents v2.0 en place dans `docs/`. Aucun code encore.
- Prochain jalon : **J0 — Socle et mise en ligne** (`ARCHITECTURE.md` §18).
- GitHub Pages est configuré avec la source « GitHub Actions » ; le fichier `.github/workflows/pages.yml` est à créer au J0.

Mettre à jour la section « État du projet » à la fin de chaque jalon.
