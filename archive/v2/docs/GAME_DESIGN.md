# MAXI-GOUFFRE — GAME_DESIGN.md

> Règles du jeu, contenu et expérience — **Version 2.0** (réécriture complète, novembre 2026)
> Ce document dit **ce qu'est le jeu**. La façon de le construire est dans `ARCHITECTURE.md`.
> Les deux documents ne se répètent pas : chaque règle n'est écrite qu'à un seul endroit.

| Fiche | Valeur |
|---|---|
| Titre | MAXI-GOUFFRE (titre de travail : vérifier la disponibilité auprès de l'INPI et de l'EUIPO avant commercialisation) |
| Genre | Jeu de cartes tactique au tour par tour + exploration narrative |
| Durée | ~30 minutes pour une partie complète (3 actes) |
| Plateformes V1 | Navigateur PC, navigateur mobile, application Android. Jouable hors ligne. |
| Hors V1 | Version `.exe` (Electron ou Tauri), iOS |
| Langue | Français pour tout texte affiché ; code et identifiants en anglais |
| Contrôles | Clavier, souris, manette, tactile : **chacun suffit** pour jouer du début à la fin |
| Orientation | Paysage (sur téléphone, le portrait affiche un message demandant de tourner l'écran) |
| Public | Adulte (humour noir, absurde, graveleux). Classification à définir selon la boutique. |
| Légende | ✅ validé par l'auteur · 🔶 valeur de départ, à calibrer par la simulation (§20.7) |

---

## 0. Règles de lecture pour Claude

1. Ce document fait foi pour les règles. Si le code s'en écarte, c'est le code qu'on corrige.
2. **Règle manquante ou ambiguë** :
   - question mineure (détail d'interface, cas limite rare, valeur technique) : Claude retient l'option **la plus simple et la plus cohérente** avec ce document, l'applique, et la signale dans le rapport de jalon et dans `docs/DECISIONS.md` ;
   - question qui change l'expérience de jeu (nouvel effet, nouvelle règle de combat, contenu narratif, équilibrage) : Claude pose la question à l'auteur.
3. **Aucune valeur numérique en dur** : les valeurs de jeu sont listées au §19 et vivent dans `config.js`.
4. **Aucun contenu en dur** : cartes, recettes, salles, combats, PNJ, événements et répliques vivent dans des fichiers JSON.
5. **Textes** : Claude écrit des textes provisoires dans le ton du jeu, préfixés `[TEMP]`, pour que le jeu soit jouable. L'auteur les remplace. Les noms marqués « provisoire » ne sont jamais codés en dur.
6. Claude ne modifie ce document qu'à la demande de l'auteur, en ajoutant une ligne au §23.

---

## 1. Vision

**Pitch.** Tu es coincé dans un hypermarché infini, d'abord joyeux et trop propre, puis de plus en plus faux et dangereux. Un narrateur odieux, qui sait qu'il parle à un joueur, t'insulte, te commente et t'oblige à jouer à un jeu de cartes de denrées qui pourrissent pour trouver la sortie.

**Piliers**

1. **Stratégie lisible** : règles courtes, scores toujours visibles, aucune surprise cachée.
2. **Le temps qui pourrit** : chaque action fait vieillir tes cartes. Gérer la fraîcheur est le dilemme central.
3. **Étrangeté et 4ᵉ mur** : univers façon Backrooms, narrateur qui s'adresse au joueur, suspense et curiosité.
4. **Humour noir, absurde, potache, graveleux** : anticonformiste et assumé.
5. **Court mais fini** : menu, options, 3 actes, boss, fin, crédits. Fluide, cohérent, sans bug.

**Contre le « jeu générique d'IA »** : textes de l'auteur, style visuel unique (§17), pas de coffres, pas de néons sur fond noir, aucune capacité « bateau ».

**Références d'inspiration** : *Baten Kaitos* (cartes périssables, 4ᵉ mur), *Gwent* (manches, passer, plateau), *The Backrooms* (étrangeté, pièces aléatoires), *Hades* (ambiance poisseuse de la zone 2).

---

## 2. Glossaire (vocabulaire obligatoire)

| Terme | Définition |
|---|---|
| **Carte** | Exemplaire d'une denrée, d'un objet ou d'un personnage. A un identifiant unique (`uid`), un âge, et appartient à une famille. |
| **Famille** | Identité d'une carte à travers ses 3 stades (ex. `banane`). Sert aux recettes. |
| **Stade** | 1 Frais, 2 Mûr, 3 Pourri. Détermine le nom, la puissance, les effets et l'image. |
| **Stade actif** | Stade utilisé à un instant donné : stade verrouillé si la carte est sur le plateau, sinon stade calculé d'après l'âge. |
| **Cran** | Unité de temps du jeu. |
| **Âge** | Nombre de crans accumulés par une carte (plafonné, §6.1). |
| **Puissance (P)** | Points qu'une carte apporte au score du camp où elle est posée. Peut être négative. |
| **Collection** | Toutes les cartes possédées par le joueur. |
| **Main** | Les cartes choisies dans la Collection pour un combat (10 au plus). |
| **Camp** | Moitié du plateau d'un joueur : 5 colonnes × 2 lignes. |
| **Ligne Avant / Arrière** | Les 2 lignes d'un camp. L'Avant touche le centre du plateau. |
| **Case** | Emplacement d'une carte : colonne (1 à 5, de gauche à droite vue par le joueur) × ligne. |
| **Voisin** | Case adjacente en haut, en bas, à gauche ou à droite, **dans le même camp**. Pas de diagonale. |
| **En face** | Même colonne et même ligne dans le camp adverse (Avant↔Avant, Arrière↔Arrière). |
| **Pose** | Placer une carte de sa main sur une case vide. |
| **Passer** | Renoncer à jouer pour le reste de la manche (définitif). |
| **Tour** | Une action d'un joueur : poser une carte ou passer. |
| **Manche** | Phase de jeu qui dure jusqu'à ce que les deux joueurs aient passé. |
| **Match** | Un combat complet : 3 manches au plus. |
| **Défausse** | Cartes retirées du plateau pendant un match. Inutilisables jusqu'à la fin du match ; leur âge continue de courir. |
| **Effet à la pose** | Se résout une fois, quand la carte est posée. |
| **Effet continu** | Actif tant que la carte est sur le plateau. |
| **Malus** | Étiquette : la carte se pose dans le camp **adverse**. |
| **Outil** | Étiquette : carte non posable aux stades 1 et 2 (Mixeur, Scotch). |
| **Plat** | Carte obtenue par fusion. |
| **Acte / Zone / Salle** | Acte = chapitre. Zone = décor (1 Illusion, 2 Réalité). Salle = un écran d'exploration. |
| **Narrateur** | Voix du magasin qui commente tout (§4.2, §13). |
| **PNJ** | Personnage non joueur rencontré en exploration. |
| **Horloge du magasin** | Total de tous les crans écoulés depuis le début de la partie. |

---

## 3. Flux du jeu

```
BOOT → WARNING → PRESS_KEY → TITLE
TITLE → Nouvelle partie → INTRO → FORM → ACTE I
TITLE → Continuer → début de la dernière salle sauvegardée
ACTE I (Zone 1) → REVELATION → ACTE II (Zone 2) → ACTE III (Boss) → ENDING → CREDITS → TITLE
```

- **États principaux** : `BOOT`, `WARNING`, `PRESS_KEY`, `TITLE`, `INTRO`, `FORM`, `PLAYING`, `REVELATION`, `ENDING`, `CREDITS`.
- **États superposables** : `OPTIONS`, `PAUSED`, `ROTATE_DEVICE` (portrait sur téléphone).
- **Sous-états de `PLAYING`** : `EXPLORATION`, `DIALOGUE`, `PREP_HAND`, `COMBAT`, `KITCHEN`, `FRIDGE_ROOM`, `MERCHANT`, `EVENT`, `COLLECTION`.
- **Sous-états de `COMBAT`** : `CHIFOUMI`, `ROUND_PLAY` (`PLAYER_TURN` / `OPPONENT_TURN`), `ROUND_END`, `MATCH_END`, `LOOT`.
- Un seul état actif à la fois, hors états superposables. Chaque transition est journalisée dans le panneau debug.

---

## 4. Univers, ambiance, personnages

### 4.1 Le Maxi-Gouffre
Un hypermarché sans fin.
- **Zone 1 « L'Illusion »** : supermarché classique, joyeux, bizarrement idyllique. Couleurs saturées, musique d'ascenseur. Quelque chose cloche.
- **Zone 2 « La Réalité »** : réserves, parkings, bureaux délabrés. Poisseux, piégeux. Néons qui bourdonnent, lumière blafarde, salles tirées au sort.
- **La Révélation** : à la fin de l'Acte I, les lumières s'éteignent, le décor se dégrade, le narrateur change de ton.
- **Horreur légère** : malaise, lumière, sons. **Aucun jump scare.**

### 4.2 Le Narrateur
- **Identité (proposition, à réécrire par l'auteur)** : la voix du haut-parleur du magasin, ce qui explique qu'il voie le joueur et lui parle en direct.
- **Ton** : insolent, blasé, odieux mais attachant. Il tutoie, insulte avec inventivité, commente les mauvais coups et l'inactivité, se vexe quand on change les options.
- **Cibles de l'humour** : le joueur, le magasin, la consommation, la mort, l'absurde. Pas d'attaque contre des groupes réels (prudence commerciale).
- **Présentation** : texte machine à écrire avec petits bruitages (« blips »). Pas de voix en V1.

### 4.3 Personnages (noms provisoires)

| Personnage | Rôle | Apparition | Notes |
|---|---|---|---|
| Le Narrateur | Voix off | Partout | §4.2 |
| Kévin, caissier | PNJ allié | Acte I, salle 1 | Donne la carte Kévin (Caissier) et un Mixeur Bon Marché |
| Le Vieux Monsieur | PNJ allié | Acte I, salle 4 | Gentil, bavard. Donne Grand-Mère Perdue, puis **meurt abruptement** en glissant sur une flaque d'huile : bruitage réaliste, aucun artifice héroïque. Choc narratif voulu. |
| La Cliente pressée | Adversaire tutoriel | Acte I, salle 2 | Combat guidé en une manche |
| Chad Prot' (l'Influenceur) | Adversaire | Acte I, salle 5 | Main à base d'Influenceurs |
| Le Livreur Perdu | Adversaire | Acte II | Main à base d'Objets et d'Outils |
| La Cheffe de Rayon Surgelés | Adversaire | Acte II | Main à base de Surgelés |
| Le Vigile Syndiqué | Adversaire | Acte II | Main à base d'Humains |
| Le Soldeur | Marchand | Acte II | Troc (§11.4) |
| Le Gérant | Boss | Acte III | Garde la Sortie (§9.11) |

---

## 5. Avant-jeu et profil

### 5.1 Écrans d'avant-jeu
1. **WARNING** : avertissement de contenu (langage vulgaire, mort, humour noir, lumières clignotantes), mention « tes données restent sur ton appareil », choix « Réduire les clignotements » (oui/non).
2. **PRESS_KEY** : écran noir « Appuie sur une touche ou touche l'écran ». Débloque le son et détecte l'entrée utilisée.
3. **TITLE** : Nouvelle partie · Continuer (grisé sans sauvegarde) · Options · Crédits.

### 5.2 Intro (écran noir, style terminal)
- Texte vert à chasse fixe. Le narrateur insulte le joueur. *Texte provisoire, à réécrire* : « Tu es bien assis sur ton siège gaming d'ado prépubère ? Tu crois jouer à quel jeu, là ? Éteins-moi ce PC et va jouer à ton jeu de cubes préféré. » (aucune marque réelle ; sur téléphone, « PC » devient « téléphone »).
- **Bouton « Je veux jouer » qui fuit** (`DOOR_FLEE_COUNT` fois, puis il se laisse valider ; le narrateur soupire à chaque fuite) :
  - *souris* : il s'écarte quand le curseur approche à moins de `DOOR_FLEE_DISTANCE` px ;
  - *clavier / manette* : quand le focus arrive dessus, il saute ailleurs à l'écran ;
  - *tactile* : quand on le touche, il saute ailleurs avant de s'activer.
  - Le comportement suit la dernière entrée utilisée.

### 5.3 Formulaire « décharge de responsabilité »
Le narrateur présente une décharge absurde (« si tu meurs, je garde tes organes »).

| Champ | Type | Règle |
|---|---|---|
| Prénom | Texte | 0 à 20 caractères. Vide : le narrateur dit « toi ». |
| Âge | Nombre | 1 à 120, facultatif |
| Sexe | Liste | Mâle / Femelle / Licorne |
| Métier | Liste | Chômeur / Influenceur raté / Développeur web dépressif / Modérateur de forum |

Ces données restent sur l'appareil et ne servent qu'aux piques du narrateur (variables `{prenom}`, `{age}`, `{sexe}`, `{metier}`). Sur mobile, le clavier virtuel s'ouvre pour le prénom et l'âge.

---

## 6. Vieillissement des cartes

### 6.1 Âge et stade ✅
Chaque carte a **son propre âge**, en crans. Son stade en découle.

| Stade | Nom | Âge (`STAGE_LENGTH` = 15) |
|---|---|---|
| 1 | Frais | 0 à 14 |
| 2 | Mûr | 15 à 29 |
| 3 | Pourri | 30 à 44 (âge plafonné à `AGE_MAX` = 3 × `STAGE_LENGTH` − 1) |

- **Règle Surgelé** (cartes portant l'étiquette `surgele`) : Frais pendant `SURGELE_FRESH_MULT` × `STAGE_LENGTH` crans (30), Mûr pendant `SURGELE_RIPE_LENGTH` cran (1), puis Pourri. Aucun effet ne fait rajeunir une carte. La règle dépend **uniquement de l'étiquette** : aucune durée n'est écrite carte par carte.
- **Plats** : vieillissent comme une carte normale.

### 6.2 Ce qui fait avancer le temps ✅

| Événement | Crans |
|---|---|
| Le joueur pose une carte en combat | `CRAN_CARD_PLAYED` (1) |
| Première entrée dans une salle | `CRAN_NEW_ROOM` (3) |
| Premier dialogue avec un PNJ (le relire ne coûte rien) | `CRAN_NEW_DIALOGUE` (1) |
| Défaite en combat | `CRAN_DEFEAT` (5) |
| Menus, pause, inactivité, fusion, marchand, chifoumi, narrateur, poses de l'IA, fin de tour | 0 |

- Le cran d'une pose s'applique **après** la pose, à toutes les cartes de la Collection sauf celles de la Glacière, y compris la carte qui vient d'être posée (son stade reste verrouillé).
- **Les cartes de l'IA ne vieillissent jamais** : leur stade est fixé par le combat. Seules les actions du joueur font avancer le temps, ce qui rend chacune de ses poses coûteuse.

### 6.3 Qui vieillit ✅
- **Toutes** les cartes de la Collection vieillissent, qu'elles soient en main, hors main, posées ou défaussées. **Seule exception : la Glacière** (§11.2).
- **Stade verrouillé sur le plateau** : à la pose, le stade actif de la carte est mémorisé. Tant qu'elle reste sur le plateau, son nom, sa P, ses effets et son image sont ceux de ce stade, même si son âge franchit un seuil. Quand elle quitte le plateau (destruction, fin de manche), le stade est recalculé d'après l'âge réel. L'inspection affiche « stade verrouillé » et l'âge réel.
- **Carte en main qui change de stade** : elle change de face immédiatement (nom, P, effet, image), avec une animation. Passage au stade 3 : déclencheur narrateur `CARD_ROTTEN`. Une carte qui devient Malus ou posable (Outil au stade 3) change aussi de règles de pose.

### 6.4 Rafraîchir une carte
Fusion (le plat sort à l'âge 0), Soldeur (carte reçue à l'âge 0), Glacière (âge figé). Voir §11.

### 6.5 Horloge du magasin
Compteur visible de tous les crans écoulés. Purement narratif : il déclenche des répliques et des changements d'ambiance (néons) aux paliers `CLOCK_MILESTONES`.

### 6.6 Calibrage 🔶
Budget visé : Acte I ≈ 33 crans, Acte II ≈ 55 crans. Une carte reçue en début d'acte doit être **Mûre vers le milieu** et **Pourrie vers la fin**. L'option « Vitesse de pourrissement » change `STAGE_LENGTH` : Lent 20, Normal 15, Rapide 10. À vérifier par la simulation (§20.7).

---

## 7. Les cartes

### 7.1 Modèle
Une carte (définition) a 3 stades. Chaque stade a un nom, une puissance, des effets, des étiquettes, une image et un texte d'ambiance. Chaque exemplaire possédé par le joueur a un `uid`, un identifiant de carte et un âge.

### 7.2 Étiquettes

| Étiquette | Signification |
|---|---|
| Aliment, Boisson, Humain, Animal, Végétal, Objet, Plat | Étiquettes de lecture, utilisables par les effets et les filtres |
| **Outil** | Non posable aux stades 1 et 2. Sert aux fusions. |
| **Surgelé** | Règle de durée du §6.1 |
| **Malus** | Se pose dans le camp adverse |
| **Monstre, Horreur** | Ambiance uniquement, sans effet en V1 |
| **Fermentation** | Icône d'information : le stade 3 est volontairement puissant |

### 7.3 Les 20 cartes 🔶 (P = puissance ; — = non posable)

| # | Famille | Stade 1 (Frais) | Stade 2 (Mûr) | Stade 3 (Pourri) | Étiquettes et notes |
|---|---|---|---|---|---|
| 01 | banane | Banane Verte **2** | Banane Parfaite **6** | Bouillie Brune **−1**, ZONE_MALUS | Aliment. S3 Malus. Recette : + Lait |
| 02 | steak | Steak Haché Premier Prix **3** | Steak Douteux **5** | Bactérie Mortelle **0**, DESTROY_FACING | Aliment. Recette : + Baguette |
| 03 | lait | Lait Entier **2** | Lait Tourné **4** | Fromage Vivant **8** | Aliment. S3 Monstre + Fermentation. Recettes : + Banane, + Céréales |
| 04 | baguette | Pain Baguette **4** | Baguette Dure **7**, DESTROY_FACING (cible au stade 1 uniquement) | Poussière de Pain **1** | Aliment. Recettes : + Steak, + Scotch |
| 05 | glace | Glace Vanille **5** | Soupe Sucrée **2** | Flotte Collante **−2** | Aliment, Surgelé. S3 Malus |
| 06 | pizza | Pizza Ananas **4** | Pizza Tiède **3** | Scandale Culinaire **0**, CANCEL | Aliment. S3 Malus. **Ne fusionne avec rien** |
| 07 | pile | Pile LR6 Neuve **6** | Pile Faible **3** | Acide de Pile **−2** | Objet. S3 Malus. Alimente le Mixeur Surchauffé. Recette : Plante + Acide (stade 3) |
| 08 | cereales | Céréales Fluo **3** | Céréales Molles **2** | Sucre Toxique **5** | Aliment. Recette : + Lait |
| 09 | influenceur | Influenceur Fitness **5**, BOOST +1 voisins au stade 1 | Influenceur Fatigué **3**, BOOST +1 voisins au stade 1 | Influenceur Annulé **−5**, ZONE_MALUS | Humain. S3 Malus |
| 10 | enfant | Enfant Hurlant **2** | Enfant Épuisé **5** | Enfant Endormi **1** | Humain. Recette : + Console |
| 11 | console | Console Portable **4** | Console Rayée **2** | Console Brickée **0** | Objet. Recette : + Enfant |
| 12 | papier | Papier Toilette **1** | Dernier Rouleau **10**, PANIC | Carton Vide **0** | Objet. Monnaie de troc (§11.4) |
| 13 | biere | Bière Fraîche **3** | Bière Chaude **1** | Vomi de Soirée **−4** | Boisson. S3 Malus |
| 14 | kevin | Kévin (Caissier) **4** | Kévin (Démissionnaire) **2** | Kévin (Syndiqué) **8**, BOOST +1 à vos **autres** cartes de la ligne Arrière | Humain. S3 Fermentation |
| 15 | mixeur | Mixeur Bon Marché — | Mixeur Surchauffé — | Explosion Électrique **0**, DESTROY_ADJACENT | Outil. S3 Malus. Voir §11.1 |
| 16 | scotch | Scotch Gris — | Scotch Poussiéreux — | Colle Sèche **0** | Outil (joker de fusion, §11.1). S3 sans effet |
| 17 | plante | Plante Verte **2** | Plante Florissante **6**, SCORE_BONUS +2 | Tige Morte **1** | Végétal. Recette : + Acide de Pile |
| 18 | chat | Chat Errant **4**, EAT | Gros Matou **7**, EAT | Boule de Poils **2**, EAT | Animal |
| 19 | cassette | Cassette Maudite **5** | Bande Démagnétisée **3** | Entité Libérée **9** | Objet rare. S3 Horreur + Fermentation |
| 20 | grandmere | Grand-Mère Perdue **3** | Grand-Mère Paniquée **5** | Héritage **10**, TRANSFER | Humain, PNJ allié. S3 Fermentation |

Les P sont des valeurs de départ, calibrées par la simulation.

### 7.4 Plats (6 cartes) 🔶
Un plat a 3 stades **automatiques** : la P de base aux stades 1 et 2, puis la **moitié de cette P, arrondie à l'inférieur**, au stade 3. L'effet est conservé aux stades 1 et 2 et perdu au stade 3. Une illustration par plat, teintée selon le stade. Étiquette `plat`. Un plat n'est jamais un ingrédient.

| Plat | P | Effet | Recette |
|---|---|---|---|
| Milkshake Protéiné | 10 | — | banane + lait |
| Burger Gras | 12 | — | steak + baguette |
| Petit-Dèj Épique | 9 | — | lait + céréales |
| Ado Muet | 8 | CANCEL_FACING | enfant + console |
| Plante Mutante | 9 | SCORE_BONUS +4 | plante + pile au stade 3 |
| Lance de Fortune | 9 | DESTROY_FACING | baguette + scotch |

### 7.5 Collection de départ 🔶
10 cartes à l'âge 0 : Banane Verte, Lait Entier, Pain Baguette, Steak Haché Premier Prix, Céréales Fluo, Plante Verte, Pile LR6 Neuve, Enfant Hurlant, Console Portable, Chat Errant. Les Outils arrivent par les rencontres (§12).

---

## 8. Les effets (liste fermée)

Aucun effet hors de cette liste n'est implémenté. Les cartes référencent leurs effets par identifiant.

### 8.1 Règles générales
- **Activation selon la ligne** :
  - effets **offensifs** (DESTROY_FACING, DESTROY_ADJACENT, ZONE_MALUS, CANCEL, CANCEL_FACING, PANIC, EAT) : actifs seulement depuis la **ligne Avant** du camp où se trouve la carte ;
  - effets **passifs** (BOOST, SCORE_BONUS, TRANSFER) : actifs seulement depuis la **ligne Arrière**.
- Une carte dans la mauvaise ligne garde ses points, mais son effet est **inactif**. Pour chaque carte, le jeu calcule si l'effet est actif et, sinon, la raison : `wrongRow` (mauvaise ligne), `cancelled` (neutralisé), `noTarget` (aucune cible). L'interface grise l'effet (inactif) ou le barre (neutralisé), et l'inspection affiche la raison.
- **Cartes Malus** : posées dans le camp adverse, elles comptent pour ce camp et agissent sur leurs voisins **dans ce camp**, donc sur des cartes adverses.
- **« En face » est un miroir strict** : même colonne, même ligne. Jamais « la première carte de la colonne », jamais à distance.
- **Cible absente** : l'effet ne fait rien.
- **Carte détruite** : va à la défausse de son propriétaire ; ses effets continus cessent. Un bonus déjà attaché par TRANSFER reste.
- **Une carte ne se cible jamais elle-même** (BOOST, ZONE_MALUS, CANCEL, etc. visent les autres cartes).
- **Priorité de résolution** : EAT, puis CANCEL / CANCEL_FACING, puis DESTROY_*, puis le reste. Un effet prioritaire qui détruit ou neutralise la source d'un effet moins prioritaire l'annule. Exemple : une Bactérie Mortelle posée en face d'un Chat est détruite par EAT avant que son DESTROY_FACING se déclenche ; le Chat survit. Même résultat si le Chat est posé après la Bactérie.

### 8.2 Table des effets

| ID | Nom | Moment | Ligne | Résolution |
|---|---|---|---|---|
| DESTROY_FACING | Détruire en face | À la pose | Avant | Détruit la carte en face si elle existe et respecte la condition éventuelle (ex. stade 1) |
| DESTROY_ADJACENT | Détruire les voisins | À la pose | Avant | Détruit toutes les cartes voisines |
| ZONE_MALUS | Malus de zone | Continu | Avant | −`ZONE_MALUS_VALUE` à chaque voisin |
| CANCEL | Annuler (voisins) | Continu | Avant | Neutralise les effets passifs continus (BOOST, SCORE_BONUS) des voisins |
| CANCEL_FACING | Annuler (en face) | Continu | Avant | Neutralise tous les effets de la carte en face, y compris ses effets à la pose si elle est posée après |
| BOOST | Boost | Continu | Arrière | +`BOOST_VALUE` à une portée : `neighbors` (voisins, condition optionnelle comme « stade 1 ») ou `backRow` (vos autres cartes de la ligne Arrière) |
| SCORE_BONUS | Score +N | Continu | Arrière | Ajoute N au score du camp |
| PANIC | Panique | À la pose | Avant | L'adversaire ne peut pas passer à son **prochain tour uniquement**. S'il n'a aucune carte posable, il passe quand même. S'il a déjà passé, PANIC est sans effet. |
| TRANSFER | Transfert | À la pose | Arrière | Le joueur choisit un voisin, qui gagne `TRANSFER_RATIO` × P de la carte (arrondi à l'inférieur) tant qu'il reste sur le plateau. Un seul voisin : choix automatique. Aucun voisin : sans effet. L'IA choisit le voisin de plus forte P. |
| EAT | Mange | Continu | Avant | Détruit une Bactérie Mortelle (steak au stade 3) placée en face, dès que les deux cartes se font face |
| TRANSFORM | Transformer | — | — | **Réservé, non implémenté en V1** |

### 8.3 Ordre de résolution d'une pose
1. Placer la carte et verrouiller son stade.
2. Résoudre les effets continus prioritaires (EAT) qui concernent la nouvelle situation.
3. Résoudre les effets à la pose de la carte, par priorité (s'ils ne sont pas neutralisés).
4. Recalculer tous les effets continus et les scores.
5. Faire avancer le temps (+1 cran si c'est le joueur qui a posé).
6. Émettre les événements (narrateur, sons, animations).

---

## 9. Le combat

### 9.1 Préparer sa main (`PREP_HAND`) 🔶
Avant chaque combat, le joueur choisit jusqu'à `HAND_SIZE` cartes dans sa Collection (âges et stades visibles).
- Ne sont pas sélectionnables : les Outils aux stades 1 et 2, les cartes de la Glacière.
- S'il y a `HAND_SIZE` cartes éligibles ou moins, elles sont toutes prises et l'écran le dit.
- Bouton « Main automatique » : prend les cartes de plus forte P.
- La main adverse est cachée ; seul son nombre de cartes est visible.

### 9.2 Chifoumi
Pierre-Feuille-Ciseaux, un seul coup, rejoué en cas d'égalité. Le vainqueur choisit qui joue en premier à la manche 1. L'IA « Gamer » choisit de jouer en second ; l'IA « Noob » choisit au hasard. Le narrateur commente.

### 9.3 Le plateau
- Vue 2.5D (vue du dessus légèrement inclinée), option « plateau à plat ».
- **Joueur en bas, adversaire en haut.** Chaque camp : 5 colonnes × 2 lignes. Ligne Avant côté centre.
- **Pose** : une carte non Malus va dans **son** camp, une carte Malus dans le camp **adverse**. La case doit être vide. Si le camp cible est plein, la carte n'est pas posable.

### 9.4 Tour de jeu
À son tour, un joueur **pose une carte** ou **passe**. Sans coup possible (main vide, camps cibles pleins), il passe automatiquement. Pas de limite de temps par tour. Pas de limite de poses par manche : le coût d'une pose est la carte utilisée.

### 9.5 Passer
- Passer est **définitif pour la manche**. On peut passer dès son premier tour (sacrifier la manche pour garder ses cartes).
- L'adversaire continue de jouer jusqu'à ce qu'il passe ou n'ait plus de coup possible.
- Passer demande une **confirmation** (deuxième appui ou bouton « Oui, je passe »), pour éviter les erreurs au doigt.

### 9.6 Fin de manche
- La manche se termine quand **les deux joueurs ont passé**.
- Le score le plus haut gagne la manche (+1 manche). **Égalité : manche nulle, personne ne marque.**
- Toutes les cartes posées vont à la défausse de leur propriétaire (âge qui continue de courir). **Aucune repioche.**
- **Qui commence la manche suivante** : le perdant de la manche ; en cas de manche nulle, celui qui n'avait pas commencé.

### 9.7 Fin de match et départage ✅
- Au meilleur des 3 manches (`MAX_ROUNDS`). Le premier à `ROUNDS_TO_WIN` manches gagnées l'emporte immédiatement.
- Si personne n'a atteint `ROUNDS_TO_WIN` après la dernière manche, départage **en cascade** :
  1. plus grand total de points cumulés (somme des scores finaux de chaque manche) ;
  2. plus de cartes restantes en main ;
  3. vainqueur du chifoumi initial.

### 9.8 Après le match 🔶
- **Toutes les cartes du joueur** (jouées, détruites, défaussées, restées en main) **retournent dans la Collection** avec leur âge réel. Rien n'est perdu en combat.
- **Butin (victoire)** : le joueur choisit 1 carte parmi `LOOT_AMONG` tirées au hasard dans la main de l'adversaire. Elle entre dans la Collection à l'âge 0 ; l'écran montre la carte au stade 1.

### 9.9 Défaite 🔶
Pas de game over. Le narrateur se moque, la Collection revient **exactement à son état d'avant le combat** (âges compris), puis le joueur subit `CRAN_DEFEAT` crans et rejoue le même combat (retour à `PREP_HAND`). Après `DEFEAT_DISCOVERY_PROPOSAL` défaites d'affilée sur un même combat, le narrateur propose de passer en mode Découverte.

### 9.10 Combat interrompu
Quitter vers le titre ou fermer le jeu pendant un combat : au prochain « Continuer », le combat reprend **au début du match**, avec la Collection d'avant le combat. Aucune pénalité.

### 9.11 Règles spéciales de combat (liste fermée)

| Règle | Effet |
|---|---|
| `singleRound` | Une seule manche ; la gagner suffit. Égalité : départage en cascade. |
| `guided` | Bulles d'aide pas à pas ; une défaite ne coûte aucun cran. |
| `noLoot` | Pas de butin. |
| `overtime` (« Heures sup' ») | Au début de **chaque** manche, les cartes de départ prévues par le combat sont posées pour l'adversaire. Elles ne viennent pas de sa main. |

- **Tutoriel (Cliente pressée)** : `singleRound`, `guided`, `noLoot`.
- **Boss (Le Gérant)** : `overtime`, `noLoot`. La victoire mène à la fin du jeu.

### 9.12 Cas limites

| Situation | Règle |
|---|---|
| Main vide | Passe automatique |
| Camp cible plein | Carte non posable ; sans aucun coup possible, passe automatique |
| Score négatif | Plancher à `SCORE_FLOOR` (0) |
| Chat et Bactérie face à face | Le Chat gagne (EAT prioritaire), quel que soit l'ordre de pose |
| Effet dans la mauvaise ligne | Inactif ; les points comptent |
| 3 manches nulles | Départage en cascade |
| Carte en main qui change de stade | Mise à jour immédiate |
| Carte posée dont l'âge franchit un seuil | Stade verrouillé jusqu'à sa sortie du plateau |
| PANIC alors que l'adversaire a déjà passé | Sans effet |
| Boucle sans fin | Impossible par construction ; garde-fou `MAX_ACTIONS_PER_ROUND` qui lève une erreur explicite |

### 9.13 Rythme et animations
- Pose : la carte glisse de la main vers la case, avec un son lourd et « charnu ».
- Destruction : dissolution courte. Retournement : rotation 3D.
- Délai de « réflexion » de l'IA entre `AI_DELAY_MIN` et `AI_DELAY_MAX` ms.
- Effets d'impact (tremblement, particules, arrêt sur image) réservés au jalon de finition.

### 9.14 Garde-fou de dimensionnement 🔶
- Une main de 10 cartes sans repioche sur 3 manches crée la tension voulue : on ne peut pas tout jouer, il faut passer pour économiser.
- **Seuils mesurés par la simulation** : au moins 3 cartes posées par camp et par manche en moyenne ; au plus 25 % de matchs où un joueur n'a plus de carte avant la manche 3 ; au plus 10 % de matchs décidés au départage.
- **Si un seuil n'est pas tenu**, ajuster dans cet ordre, par configuration : 1) `HAND_SIZE` de 10 à 12 ; 2) `GRID_COLS` de 5 à 4 ; 3) proposer à l'auteur une repioche d'une carte au début de la manche 3.

---

## 10. L'IA adverse

Deux niveaux, choisis dans les options ✅. L'IA **ne voit jamais la main du joueur** et ne triche pas.

### 10.1 Découverte (« Je suis un Noob »)
- Pose une carte posable au hasard, sur une case légale au hasard.
- Passe si sa main est vide ou si elle mène de `AI_NOOB_PASS_LEAD` points ou plus.

### 10.2 Le vrai jeu (« Je suis un Gamer »)
- Note chaque coup possible (carte × case) avec la formule du §20.6 : points apportés, destructions, annulations, bonus, effets gâchés.
- Garde ses cartes les plus fortes pour les manches suivantes.
- **Passe** : si l'adversaire a passé et qu'elle mène ; ou en manche 1 si son retard dépasse ce que sa main peut raisonnablement rattraper. Elle ne passe jamais en retard de peu s'il lui reste de quoi gagner la manche.
- Utilise PANIC quand l'adversaire est en retard de peu.

### 10.3 Budget des mains adverses 🔶
Somme des P des cartes de la main, au stade fixé par le combat.

| Combat | Adversaire | Budget P |
|---|---|---|
| C1 (tutoriel) | La Cliente pressée | ~30 |
| C2 | Chad Prot' | ~38 |
| C3 | Le Livreur Perdu | ~42 |
| C4 | La Cheffe de Rayon Surgelés | ~46 |
| C5 | Le Vigile Syndiqué | ~50 |
| Boss | Le Gérant | ~55 |

---

## 11. Cuisine, fusion, Glacière, Soldeur

### 11.1 Cuisine et fusion ✅
- Fusion possible **seulement en salle Cuisine**, `FUSIONS_PER_KITCHEN` fusion par visite. Une Cuisine guidée dans l'Acte I (fusion obligatoire), une Cuisine libre dans l'Acte II (fusion facultative).
- Une fusion **consomme 2 ingrédients et un Mixeur**. Le plat sort à l'**âge 0**.
- Les recettes portent sur la **famille**, quel que soit le stade, sauf exigence explicite (Plante Mutante exige une Pile au stade 3).
- **Mixeur** :
  - Bon Marché (stade 1) : fonctionne seul ;
  - Surchauffé (stade 2) : exige en plus une Pile au stade 1 ou 2, consommée (distincte d'une Pile utilisée comme ingrédient) ;
  - Explosion Électrique (stade 3) : ne fusionne plus. C'est une bombe jouable en combat (Malus, ligne Avant adverse). Le joueur arbitre entre fusionner tôt et garder la bombe.
- **Scotch** (stades 1 et 2) : **joker** qui remplace **un** ingrédient manquant (au moins un vrai ingrédient reste nécessaire). Le plat perd `FUSION_SCOTCH_PENALTY` P sur sa P de base, et c'est cette P réduite qui est divisée par 2 au stade 3. Pour la Lance de Fortune, le Scotch est un ingrédient normal : aucune pénalité. Au stade 3 (Colle Sèche), il ne sert plus à rien.
- La Pizza ne fusionne avec rien (le Scandale Culinaire en est la blague).

### 11.2 Glacière 🔶
Dans l'Acte II, la salle « Frigo » donne une **Glacière portable** (objet clé, pas une carte), accessible depuis l'écran Collection : `FRIDGE_SLOTS` emplacements. Les cartes qu'elle contient **ne vieillissent plus** et ne peuvent pas entrer dans une main. Échange libre hors combat.

### 11.3 Écran Collection
Accessible depuis le menu pause et l'exploration : cartes avec stade, âge, jauge de fraîcheur, aperçu des 3 stades, filtres par famille et par étiquette, Glacière.

### 11.4 Le Soldeur 🔶
Troc 1 contre 1, `SOLDEUR_TRADES` échanges au plus par visite. Le joueur donne une carte et reçoit une carte à l'âge 0 parmi `SOLDEUR_OFFERS` propositions :
- donner une carte quelconque : la carte reçue est tirée au hasard parmi les propositions ;
- donner un **Papier Toilette** (n'importe quel stade de la famille `papier`) : le joueur choisit la carte reçue.

### 11.5 Sources de cartes (pas de coffres ✅)
Rencontres de PNJ, butin, fusions, Soldeur, événements absurdes. Mixeurs : Kévin (Acte I), Soldeur et un événement de l'Acte II.

---

## 12. Exploration et chronologie

### 12.1 Principe
Une **salle** = une image fixe + un texte du narrateur + 2 ou 3 choix (portes, actions). Les salles de l'Acte II sont tirées au sort avec la graine de la partie.

### 12.2 Types de salles
Combat, Rencontre (PNJ), Cuisine, Frigo, Soldeur, Événement absurde, Révélation, Boss.

### 12.3 Structure (~30 min)

| Segment | Durée | Contenu |
|---|---|---|
| Avant-jeu | ~3 min | Avertissement, terminal, bouton qui fuit, formulaire |
| **Acte I — « L'Illusion »** | ~8 min | 5 salles fixes |
| Révélation | ~2 min | Lumières qui s'éteignent, décor qui se dégrade, changement de ton |
| **Acte II — « La Réalité »** | ~14 min | 7 salles dans un ordre tiré au sort |
| **Acte III — Le Gérant** | ~3 min | Combat de boss à la Sortie |
| Fin | ~1 min | Monologue du narrateur, crédits |

### 12.4 Acte I (ordre fixe)
1. **Rencontre : Kévin** — donne Kévin (Caissier) et un Mixeur Bon Marché.
2. **Combat tutoriel** contre la Cliente pressée.
3. **Cuisine guidée** — première fusion obligatoire ; un tiroir contient un Scotch Gris.
4. **Rencontre : le Vieux Monsieur** — donne Grand-Mère Perdue, puis meurt. Déclencheur `NPC_DEATH`.
5. **Combat contre Chad Prot'** (3 manches, butin).

Puis la **Révélation**.

### 12.5 Acte II (tirage sans remise)
Pool de 7 salles : 3 combats (C3, C4, C5), 1 Cuisine, 1 Frigo, 1 Soldeur, 1 Événement absurde. À chaque étape, **2 portes** sont tirées parmi les salles restantes (1 seule quand il n'en reste qu'une). La salle non choisie retourne dans le pool. Les 7 salles sont toutes visitées, seul l'ordre change. Le décor de chaque salle est choisi parmi 3 variantes.

### 12.6 Événements absurdes (à réécrire par l'auteur)
Annonce au haut-parleur qui dérape ; rayon animalerie où personne ne répond ; caddie qui réclame un pourboire ; porte « Réservé au personnel » qui fait faire demi-tour. Résultat possible : une carte, un Mixeur ou une pénalité de crans.

### 12.7 Sauvegarde automatique
À l'entrée de chaque salle et à la fin de chaque combat. « Continuer » reprend au début de la dernière salle sauvegardée.

---

## 13. Narrateur et dialogues

### 13.1 Répliques
Chaque réplique a un identifiant, un déclencheur, des conditions, un texte, un poids et un délai de réutilisation. Variables : `{prenom}`, `{age}`, `{sexe}`, `{metier}`. Si une variable est vide, la réplique est ignorée au profit d'une variante sans variable.

### 13.2 Déclencheurs

| Déclencheur | Moment |
|---|---|
| `PRESS_KEY`, `INTRO_*`, `FORM_*` | Avant-jeu |
| `ROOM_ENTER` | Entrée dans une salle |
| `COMBAT_START`, `COMBAT_WIN`, `COMBAT_LOSE` | Début et fin de combat |
| `ROUND_WIN`, `ROUND_LOSE`, `ROUND_DRAW` | Fin de manche |
| `BAD_MOVE` | Mauvais coup (ci-dessous) |
| `CARD_ROTTEN` | Une carte passe au stade 3 |
| `FUSION_DONE` | Fusion réussie |
| `INACTIVITY_1`, `INACTIVITY_2` | `INACTIVITY_1` / `INACTIVITY_2` secondes sans entrée |
| `CLOCK_MILESTONE` | Palier de l'horloge (avec le palier en contexte) |
| `NPC_DEATH` | Mort du Vieux Monsieur |
| `OPTION_CHANGED` | Changement d'option (ex. grincement désactivé : « mauviette ») |
| `ROTATE_DEVICE` | Téléphone tenu en portrait |
| `MENU_RETURN`, `DATA_ERASED` | Retour au menu, effacement des données |

**Mauvais coup** : détruire sa propre carte par un effet ; passer en retard de 8 points ou plus avec au moins 3 cartes en main ; poser une carte non Malus de P ≤ 1 au stade 3 sans effet actif.

### 13.3 Diffusion
- Une même réplique ne revient pas avant `NARRATOR_LINE_COOLDOWN` secondes.
- Au plus une réplique spontanée toutes les `NARRATOR_GLOBAL_COOLDOWN` secondes. Les réactions à une action directe (fin de manche, mort d'un PNJ) passent avant les réactions spontanées.
- Option « Bavardage » : Discret (délais ×2, pas de réaction spontanée), Normal, Bavard (délais ×0,5).
- Machine à écrire ; toucher ou appuyer affiche le texte entier, un second appui le ferme ; vitesse réglable.

### 13.4 Dialogues de PNJ
3 à 5 répliques par PNJ, 1 choix au plus. Un PNJ peut donner des cartes à la fin de son dialogue.

### 13.5 Budget de contenu (textes de l'auteur)
≈ 120 répliques : avant-jeu 15, exploration 40, combat 40, réactions 25.

---

## 14. Contrôles

### 14.1 Principes ✅
- Clavier, souris, manette et tactile sont **tous complets**.
- Le jeu traduit chaque entrée en **actions abstraites** ; la logique de jeu ne lit jamais une touche.
- **Un appui = un déplacement de case.** Pas de répétition en maintenant.
- Les glyphes affichés (touches, boutons, gestes) suivent la **dernière entrée utilisée**.
- Les boutons d'action à l'écran (Passer, Inspecter, Pause, Retour) restent toujours visibles : ils servent à la souris et au doigt.

### 14.2 Correspondances par défaut

| Action | Clavier | Manette | Souris | Tactile |
|---|---|---|---|---|
| Déplacer le focus | Flèches ou Z Q S D | Croix ou stick gauche | Survol | — (on touche directement) |
| CONFIRM | Entrée, Espace | A (bouton bas) | Clic gauche | Toucher |
| CANCEL | Retour arrière | B | Bouton « Retour » | Bouton « Retour », toucher hors cible, bouton retour Android |
| PASS | P | X | Bouton « Passer » | Bouton « Passer » |
| INSPECT | I | Y | Clic droit | Appui long |
| PAUSE | Échap | Start | Icône pause | Icône pause, bouton retour Android quand il n'y a rien à annuler |
| Changer de zone | Tab / Maj+Tab | RB / LB | — | — |
| Debug | F3 (mode debug) | — | — | Bouton « DBG » (mode debug) |

Clavier et manette sont **remappables** dans les options.

### 14.3 Poser une carte
- **Focus (clavier, manette)** : CONFIRM sur une carte de la main, le focus passe sur les **cases légales** mises en évidence, CONFIRM pose, CANCEL revient à la main.
- **Pointeur (souris, tactile)** : toucher ou cliquer une carte de la main la sélectionne (elle se soulève et le bandeau d'information s'affiche), puis toucher une case légale la pose. Toucher la carte sélectionnée ou un endroit vide annule. Le glisser-déposer est ajouté au jalon de finition, en plus.
- **TRANSFER** : après la pose, les voisins valides sont mis en évidence et le joueur en choisit un de la même façon.
- Le focus s'arrête aux bords. Le dernier focus de chaque zone est mémorisé. Le focus est toujours visible (contour épais, fort contraste).

### 14.4 Manette
Détectée au premier appui. Branchement et débranchement à chaud : message à l'écran, et pause automatique en combat si la manette utilisée est débranchée.

### 14.5 Mobile
- Paysage obligatoire. En portrait, un écran « Tourne ton téléphone » (avec une réplique du narrateur) recouvre le jeu et met en pause.
- Quand l'application passe en arrière-plan : pause, sauvegarde et coupure du son.
- Pas de zoom par double toucher ni de rafraîchissement par glissement.

---

## 15. Menus et options

### 15.1 Écrans
Avertissement, Titre, Options, Crédits, Pause, Préparer sa main, Collection, Cuisine, Soldeur, Butin, Défaite, Fin, fenêtres de confirmation, « Tourne ton téléphone ».

### 15.2 Titre
Nouvelle partie (confirmation si une sauvegarde existe) · Continuer (grisé sans sauvegarde) · Options · Crédits.

### 15.3 Pause
Reprendre · Collection (hors combat) · Options · Retour au titre (confirmation, sauvegarde automatique avant ; un combat en cours reprendra au début du match).

### 15.4 Options (stockées à part de la partie)

| Catégorie | Option | Valeurs | Défaut |
|---|---|---|---|
| Audio | Volume général | 0–100 | 80 |
| Audio | Musique | 0–100 | 70 |
| Audio | Effets | 0–100 | 80 |
| Audio | Narrateur (bruitages du texte) | 0–100 | 90 |
| Audio | Grincement de porte | Activé / Désactivé | Activé |
| Affichage | Plateau | Incliné (2.5D) / À plat | Incliné |
| Affichage | Réduire les clignotements | Oui / Non | Non (proposé à l'avertissement) |
| Affichage | Plein écran | Oui / Non | Oui (demandé au premier geste du joueur ; masquée sur Android, toujours plein écran) |
| Affichage | Taille du texte | Petit / Normal / Grand / Très grand | Normal |
| Texte | Vitesse du texte | Lent / Normal / Rapide / Instantané | Normal |
| Jeu | Difficulté | Découverte (Je suis un Noob) / Le vrai jeu (Je suis un Gamer) | Découverte |
| Jeu | Vitesse de pourrissement | Lent (20) / Normal (15) / Rapide (10) | Normal |
| Jeu | Bavardage du narrateur | Discret / Normal / Bavard | Normal |
| Contrôles | Remapper clavier / manette, Réinitialiser | — | — |
| Données | Effacer mes données | Double confirmation | — |
| Données | Exporter / Importer la partie | Fichier JSON local, vérifié à l'import | — |

- La difficulté s'applique au **prochain combat**.
- La vitesse de pourrissement ne change qu'au Titre ou en Pause hors combat ; les âges sont conservés (plafonnés au nouveau maximum) et les stades recalculés.
- Le narrateur réagit à certains changements (§13.2).

### 15.5 Fin et crédits
Monologue du narrateur (texte de l'auteur), puis crédits générés depuis le registre des assets (auteur, outils, assets, licences).

---

## 16. Audio

| Contexte | Piste | Ambiance |
|---|---|---|
| Titre | Boucle courte | Neutre, légèrement décalée |
| Intro | Presque silence, faible bourdonnement | Terminal |
| Zone 1 | Boucle | Musique d'ascenseur joyeuse |
| Zone 2 | Boucle | Drones, bourdonnement de néons |
| Combat | Piste dynamique | Épique, entraînante |
| Boss | Piste dédiée | Épique, plus lourde |
| Révélation | Motif court | Rupture |
| Fin | Piste dédiée | Ironique ou grandiose (choix de l'auteur) |

**Effets sonores** : pose (lourd, charnu), destruction, passer, manche gagnée ou perdue, chifoumi, fusion, **grincement de porte (2 secondes exactement)**, glissade et mort du Vieux Monsieur (réaliste), déplacement du focus et clic, blips du narrateur, passage au stade pourri.

**Mixage** : 4 canaux (général, musique, effets, narrateur), fondu enchaîné de 1 s entre pistes, musique baissée de 30 % pendant une réplique, boucles sans coupure audible. Aucun son avant l'écran « Appuie sur une touche ».

---

## 17. Direction artistique et interface

### 17.1 Style ✅
**« Prospectus de supermarché »** : aplats, contours épais, pastilles « PROMO », typographies d'affiche. En Zone 2, le **même style** se dégrade (désaturé, taches, moisissures).

### 17.2 Palettes
- **Zone 1** : jaune promo, rouge tomate, bleu frais, vert menthe.
- **Zone 2** : verdâtre, jaune malade, gris néon, noirs poisseux.
- **Intro** : noir et vert terminal.

### 17.3 Typographies
2 polices libres (licence OFL), **stockées dans le jeu** : une d'affichage, une très lisible pour le texte, plus une à chasse fixe pour le terminal. Claude en propose au premier jalon ; l'auteur valide.

### 17.4 Anatomie d'une carte
Ratio **5:7**. De haut en bas : nom, **pastille de puissance** (grande, coin haut gauche), illustration carrée, zone d'effet (texte court + icône), étiquettes, **jauge de fraîcheur en 3 segments** avec une icône de stade (forme différente par stade, pas seulement la couleur), icône Fermentation, pastille Malus.
- **Face compacte** (petits écrans, cartes sur le plateau) : P, icône de stade, icône d'effet, illustration. Le reste s'affiche dans le bandeau d'information ou l'inspection.
- **Stades** : teinte différente par stade, surcouches (taches, mouches) au stade 3.
- Illustrations carrées. Tant qu'une illustration manque, la carte affiche une **illustration provisoire** générée dans le style prospectus.

### 17.5 Écran de combat
- Plateau 2.5D au centre, adversaire en haut, joueur en bas.
- **Main** en éventail en bas ; **panneau gauche** : scores, manches gagnées (2 pastilles par joueur), numéro de manche ; **panneau droit** : narrateur et horloge du magasin ; boutons Passer, Inspecter, Pause ; **bandeau d'information** de la carte visée ou sélectionnée (nom, 3 stades, âge, état de l'effet).
- Sur petit écran, la même organisation, plus serrée : faces compactes, main qui se chevauche davantage, inspection en plein écran.

### 17.6 Écran d'exploration
Image plein écran, texte du narrateur en bas, 2 ou 3 portes en étiquettes-boutons, horloge, accès à la Collection.

### 17.7 Accessibilité visuelle
Contraste ≥ 4,5:1 ; focus visible ; stades différenciés par icône **et** couleur ; néons clignotants limités à 3 flashs par seconde et désactivables ; plateau à plat ; taille de texte réglable ; zones à toucher d'au moins 44 px réels.

---

## 18. Données personnelles et progression

- **Données conservées sur l'appareil, et nulle part ailleurs** : options, profil (formulaire), partie en cours (Collection, Glacière, horloge, acte, salle, salles visitées, graine, défaites, dialogues vus).
- **Aucune collecte**, aucun traceur, aucune statistique, aucune ressource externe.
- **Effacer mes données** : supprime options, profil et partie après double confirmation. Le narrateur fait ses adieux.
- **Reproductibilité** : la graine du hasard est conservée avec la partie ; la même graine donne les mêmes tirages.
- Une partie corrompue est ignorée avec un message clair, jamais un plantage.

---

## 19. Valeurs de jeu

Toutes ces valeurs vivent dans `config.js`. Les valeurs 🔶 sont calibrées par la simulation.

| Constante | Valeur | Constante | Valeur |
|---|---|---|---|
| `HAND_SIZE` 🔶 | 10 | `FRIDGE_SLOTS` 🔶 | 3 |
| `GRID_COLS` / `GRID_ROWS` | 5 / 2 | `FUSIONS_PER_KITCHEN` | 1 |
| `ROUNDS_TO_WIN` / `MAX_ROUNDS` | 2 / 3 | `FUSION_SCOTCH_PENALTY` | 3 |
| `STAGE_LENGTH` 🔶 | 15 (Lent 20, Rapide 10) | `FUSED_STAGE3_RATIO` | 0,5 |
| `AGE_MAX` | 3 × `STAGE_LENGTH` − 1 | `TRANSFER_RATIO` 🔶 | 0,5 |
| `SURGELE_FRESH_MULT` / `SURGELE_RIPE_LENGTH` | 2 / 1 | `BOOST_VALUE` / `ZONE_MALUS_VALUE` | 1 / 1 |
| `CRAN_CARD_PLAYED` | 1 | `SCORE_FLOOR` | 0 |
| `CRAN_NEW_ROOM` | 3 | `AI_NOOB_PASS_LEAD` | 8 |
| `CRAN_NEW_DIALOGUE` | 1 | `AI_DELAY_MIN` / `AI_DELAY_MAX` (ms) | 800 / 1500 |
| `CRAN_DEFEAT` 🔶 | 5 | `NARRATOR_GLOBAL_COOLDOWN` (s) | 20 |
| `LOOT_AMONG` / `LOOT_PICK` | 3 / 1 | `NARRATOR_LINE_COOLDOWN` (s) | 600 |
| `SOLDEUR_TRADES` / `SOLDEUR_OFFERS` 🔶 | 2 / 3 | `INACTIVITY_1` / `INACTIVITY_2` (s) | 30 / 90 |
| `DOOR_FLEE_COUNT` / `DOOR_FLEE_DISTANCE` (px) | 3 / 80 | `CLOCK_MILESTONES` | [20, 40, 60, 80] |
| `DEFEAT_DISCOVERY_PROPOSAL` | 3 | `MAX_ACTIONS_PER_ROUND` | 4 × `HAND_SIZE` |
| `BAD_MOVE_PASS_GAP` / `BAD_MOVE_MIN_HAND` | 8 / 3 | `PANIC_TURNS` | 1 |

---

## 20. Formules

Les fonctions ci-dessous sont **pures** : elles ne modifient pas leurs arguments et renvoient une nouvelle valeur.

### 20.1 Stade d'une carte
```js
function stageOf(def, age, L) {
  if (def.tags.includes('surgele')) {
    const fresh = SURGELE_FRESH_MULT * L;
    if (age < fresh) return 1;
    if (age < fresh + SURGELE_RIPE_LENGTH) return 2;
    return 3;
  }
  return 1 + Math.min(2, Math.floor(age / L));
}
```

### 20.2 Avancer le temps
```js
function advanceTime(collection, fridgeUids, crans, ageMax) {
  return collection.map(c =>
    fridgeUids.includes(c.uid) ? c : { ...c, age: Math.min(c.age + crans, ageMax) });
}
// Stade utilisé : celui verrouillé dans la case si la carte est posée, sinon celui de l'âge
const activeStage = (cell, def, age, L) => cell?.lockedStage ?? stageOf(def, age, L);
```

### 20.3 Puissance effective
`P_eff = P(stade actif) + Σ boosts actifs reçus − Σ malus de zone actifs reçus + Σ transferts reçus`.
Un effet inactif ou neutralisé ne compte pas. `P_eff` peut être négative.

### 20.4 Score d'un camp
`score = max(SCORE_FLOOR, Σ P_eff des cartes du camp + Σ SCORE_BONUS actifs du camp)`.
Les cartes Malus posées dans ce camp par l'adversaire comptent avec leur P.

### 20.5 Résultat d'un match
```js
function matchWinner(m, rules) {
  const toWin = rules.singleRound ? 1 : ROUNDS_TO_WIN;
  const maxRounds = rules.singleRound ? 1 : MAX_ROUNDS;
  if (m.wins.player >= toWin) return 'player';
  if (m.wins.opponent >= toWin) return 'opponent';
  if (m.roundsPlayed < maxRounds) return null;                 // match en cours
  if (m.totalPoints.player !== m.totalPoints.opponent)         // 1. points cumulés
    return m.totalPoints.player > m.totalPoints.opponent ? 'player' : 'opponent';
  if (m.cardsLeft.player !== m.cardsLeft.opponent)             // 2. cartes en main
    return m.cardsLeft.player > m.cardsLeft.opponent ? 'player' : 'opponent';
  return m.chifoumiWinner;                                     // 3. chifoumi
}
```

### 20.6 Valeur d'un coup pour l'IA « Gamer »
`valeur = gainDeScore + valeurDesEffets − coûtDeRéserve`
- `gainDeScore` : variation de (score IA − score adverse) après le coup ;
- `valeurDesEffets` : Σ P des cartes adverses détruites + bonus adverses annulés + bonus créés ;
- `coûtDeRéserve` : en manches 1 et 2, poids × P de la carte jouée (garder les fortes pour plus tard).

### 20.7 Simulation et équilibrage
Simuler 1 000 matchs IA contre IA (les deux niveaux) et mesurer :
- cartes posées par camp et par manche, matchs à court de cartes, matchs au départage (seuils du §9.14) ;
- crans écoulés par acte comparés aux budgets du §6.6 ;
- part des cartes jouées à chaque stade, valeur moyenne par stade, part des cartes qui reviennent Pourries ;
- **efficacité des Malus** : l'impact net moyen d'une pose Malus (points retirés à l'adversaire, effets compris) doit être **≥ 4**. Sinon, proposer à l'auteur de durcir les Malus faibles (ex. Flotte Collante et Acide de Pile de −2 à −3) ;
- aucune partie bloquée.

Claude **propose** les changements de valeurs ; l'auteur les valide avant qu'ils entrent dans ce document.

---

## 21. Droits d'auteur et conformité

*Ceci n'est pas un avis juridique : faire valider avant publication commerciale.*
- **Aucune marque, aucun personnage, aucune personne réelle** dans le jeu. Le jeu de cubes de l'intro n'est pas nommé. Les personnages sont des archétypes originaux.
- **Nom du jeu** : vérifier « Maxi-Gouffre » (INPI, EUIPO) avant commercialisation.
- **Registre des assets obligatoire** : pour chaque image, son, musique ou police : fichier, auteur, source, licence, usage commercial (oui/non), date. Un asset non enregistré est refusé.
- **Images générées par IA** : vérifier les conditions d'usage commercial du générateur ; le droit d'auteur sur ces images est incertain en France et en Europe. Conserver les consignes de génération, retoucher. Plusieurs boutiques demandent de déclarer l'usage d'IA.
- **Musique** : originale, ou sous licence commerciale vérifiée (CC0, CC-BY avec crédit).
- **Polices** : OFL ou équivalent.
- **Classification d'âge** à renseigner sur la boutique choisie.

---

## 22. Hors périmètre V1 et contenu de l'auteur

### 22.1 Hors périmètre V1
Multijoueur, version `.exe`, iOS, voix enregistrées, plus de 2 difficultés, éditeur de deck libre, succès, achats, effet TRANSFORM, effets des étiquettes Monstre et Horreur.

### 22.2 Contenu à écrire ou fournir par l'auteur
Répliques du narrateur (~120), textes d'ambiance des cartes, dialogues des PNJ, événements absurdes, noms définitifs, monologue de fin, illustrations (20 cartes × 3 stades, 6 plats, salles), musiques, choix final des polices. En attendant, Claude fournit des versions provisoires marquées `[TEMP]`.

---

## 23. Révisions

- **v1.0** : document initial.
- **v1.1** : vieillissement continu, stade verrouillé, IA sans vieillissement, miroir strict, raisons d'inactivité, PANIC après passe, garde-fou de dimensionnement.
- **v2.0** (novembre 2026) : réécriture complète pour un développement avec Claude. Ajout du **tactile** et du **mobile** (§14, §17) ; règles clarifiées : PANIC sur un seul tour, TRANSFER au choix, une carte ne se cible jamais elle-même, pénalité du Scotch avant la division au stade 3, défaite qui restaure la Collection d'avant combat, combat interrompu, règles spéciales de combat en liste fermée (§9.11), Surgelé défini par l'étiquette seule, confirmation pour Passer ; retrait des marques réelles (« Eco+ » → « Premier Prix », « Discord » → « forum ») ; les éléments techniques passent dans `ARCHITECTURE.md`.
- **v2.0.1** (novembre 2026, demande de l'auteur) : option « Plein écran » à « Oui » par défaut (§15.4).
