# MAXI-GOUFFRE — règles de travail

## Qui fait quoi
- L'auteur décide du jeu, teste sur PC et téléphone, valide. Amateur : explique simplement.
- Claude code, teste, propose. Il ne décide jamais seul d'une règle qui change l'expérience de jeu.

## Une séance
1. Relire docs/VISION.md, ce fichier et le dernier rapport dans docs/JOURNAL.md.
2. Annoncer en 3 à 5 lignes : la question que la séance vérifie, ce qui va être construit. Puis enchaîner sans attendre, sauf question bloquante.
3. Travailler sur une branche `sN-nom`. Commits courts et clairs.
4. Finir avec une version JOUABLE, vérifiée (tests verts, aucune erreur console, captures PC et téléphone).
5. Ouvrir une pull request et écrire le rapport (voir plus bas), copié en tête de docs/JOURNAL.md.

## Rapport de fin de séance (court)
- Ce qui est jouable maintenant.
- Comment tester : sur PC (touches) et sur téléphone (adresse, gestes), en 5 étapes au plus.
- **Quoi essayer et à quoi faire attention** : 2 ou 3 questions de ressenti pour l'auteur.
- Réglages disponibles dans le panneau (touche F2 ou bouton « ⚙ »).
- Décisions prises seul (détails mineurs uniquement) et pourquoi.
- Ce que l'auteur doit préparer pour la suite (dessins, sons, textes), seulement si c'est utile maintenant, avec le format exact.
- Proposition pour la séance suivante (une seule).

## Règles
- Décisions de jeu (nouvelle règle, effet, équilibrage, contenu narratif) : proposer 2 ou 3 options courtes, l'auteur choisit.
- Détails mineurs (interface, technique) : choisir l'option la plus simple et le noter dans le rapport.
- Toutes les valeurs réglables dans src/config.js et exposées dans le panneau de réglages en jeu.
- Contenu (cartes, combos, répliques, lieux) en JSON. Textes provisoires préfixés [TEMP].
- Visuels provisoires : formes simples et sobres en papier découpé, couleurs ternes de magasin, étiquettes lisibles. Ils seront remplacés par les dessins de l'auteur sans changer le code (chaque image référencée dans les données).
- Bug qui résiste à 2 tentatives : s'arrêter, expliquer, proposer des pistes.
- Ne jamais modifier du code qui fonctionne hors du périmètre de la séance sans le dire.
- Git : jamais de push sur main, de force-push, de reset --hard ou de suppression sans accord.
- Aucune dépendance nouvelle ni ressource externe sans accord.
- Accessibilité : contrôles complets au clavier/souris, à la manette et au doigt ; option « réduire les animations » ; textes lisibles sur téléphone.
- docs/VISION.md ne change qu'à la demande de l'auteur.
