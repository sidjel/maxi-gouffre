# MAXI-GOUFFRE — PROMPTS_IMAGES.md

> Consignes de génération d'images pour l'auteur (DIRECTION_ARTISTIQUE.md §1). Créé au jalon J1.5.
> Chaque image générée remplace l'illustration SVG provisoire correspondante, sans changer le code.

---

## 0. Mode d'emploi

### 0.1 Bloc de style à coller avant chaque consigne

**Cartes et plats** :
> Illustration carrée 1:1, style prospectus de supermarché des années 90 : aplats de couleurs vives, contours noirs épais, ombres simples, légère trame d'imprimerie. Un seul sujet, centré, en entier, sur un fond simple (rayons de soleil ou aplat uni). Humour absurde, un peu dégoûtant mais jamais gore. Aucun texte, aucune lettre, aucun chiffre, aucun logo, aucune marque, aucun personnage existant. Pas de cadre ni de bordure.

**Décors** :
> Décor 16:9, vue réaliste et matérielle d'un hypermarché (matières, usure, poussière, lumière de néons), légèrement stylisé, couleurs riches. Aucun personnage, aucun texte lisible, aucun logo, aucune marque. La zone centrale doit rester calme et peu contrastée : le jeu y pose ses éléments.

**Avatars** :
> Portrait en buste, cadrage serré, face caméra, fond uni gris clair, style dessin expressif à contours épais, couleurs franches. Personnage original (aucune célébrité, aucun personnage existant). Aucun texte, aucun logo.

### 0.2 Règles (DIRECTION_ARTISTIQUE.md §1.3)
- L'image **montre le nom de la carte et suggère son effet** (indices donnés dans chaque consigne). Le haut de l'image est l'avant de la carte (vers l'adversaire) ; les côtés sont les cartes voisines.
- Le jeu ajoute le cadre, la pastille de puissance, la jauge, les tampons et les reflets : **ne pas les dessiner**.
- Formats livrés par l'auteur : ce qu'il veut (PNG, JPG, WebP). Je convertis en **WebP 768×768** pour les cartes et avatars, **WebP 1920×1080** pour les décors.
- Nom de fichier : celui indiqué entre crochets (ex. `[banane_1]`). Je range le fichier dans `app/assets/img/`, je change le champ `image` de `app/data/cards.json` et j'ajoute l'entrée dans `app/data/credits.json` (outil utilisé, date, droits commerciaux).
- Les générateurs comprennent le français. Si un résultat est faible, je peux fournir une traduction anglaise de la consigne.

---

## 1. Les cartes (20 familles × 3 stades)

Stade 1 = frais, appétissant. Stade 2 = mûr ou fatigué. Stade 3 = pourri, abîmé, monstrueux.

### 01 Banane
- `[banane_1]` **Banane Verte** : une banane encore toute verte, dure et raide, posée en arc, l'air pas mûre du tout.
- `[banane_2]` **Banane Parfaite** : une banane jaune parfaite, quelques points bruns, qui brille comme dans une publicité.
- `[banane_3]` **Bouillie Brune** (Malus de zone) : une flaque de banane brune et molle qui coule et s'étale vers la gauche et la droite ; deux petits yeux mi-clos ; des filets d'odeur verte.

### 02 Steak
- `[steak_1]` **Steak Haché Premier Prix** : un steak haché rose pâle dans une barquette en polystyrène sous film plastique.
- `[steak_2]` **Steak Douteux** : le même steak, gris-vert, avec des reflets violets, une moue inquiète et des filets d'odeur.
- `[steak_3]` **Bactérie Mortelle** (Détruit la carte en face) : une bactérie verte et ronde avec des cils, des yeux méchants et une énorme mâchoire ouverte qui mord **vers le haut**.

### 03 Lait
- `[lait_1]` **Lait Entier** : une brique de lait blanc et bleu, neuve, une goutte blanche dessinée dessus.
- `[lait_2]` **Lait Tourné** : la même brique gonflée et penchée, une spirale dessinée dessus, du lait caillé qui déborde au pied.
- `[lait_3]` **Fromage Vivant** (ÉDITION LIMITÉE) : un quartier de fromage jaune à trous, avec des yeux écarquillés, une bouche, une langue et des petites pattes, sur fond violet ; une aura de bulles de fermentation.

### 04 Baguette
- `[baguette_1]` **Pain Baguette** : une baguette dorée en diagonale, croûte bien grignée, toute fraîche.
- `[baguette_2]` **Baguette Dure** (Détruit la carte fraîche en face) : une baguette rassie dure comme un gourdin, dressée vers le haut, qui frappe : étoile de choc en haut, traits de vitesse, une fissure.
- `[baguette_3]` **Poussière de Pain** : un petit tas de miettes et de poussière de pain avec des nuages de poussière qui s'envolent.

### 05 Glace
- `[glace_1]` **Glace Vanille** : un cornet avec une boule de glace vanille, du givre et des éclats de fraîcheur.
- `[glace_2]` **Soupe Sucrée** : un bol de glace fondue, le cornet qui coule dedans, des gouttes de crème.
- `[glace_3]` **Flotte Collante** (Malus) : une flaque collante jaunâtre dans laquelle une chaussure est restée coincée.

### 06 Pizza
- `[pizza_1]` **Pizza Ananas** : une part de pizza fumante avec des morceaux d'ananas bien visibles.
- `[pizza_2]` **Pizza Tiède** : la même part, molle, qui s'affaisse, à peine fumante, couleurs ternes.
- `[pizza_3]` **Scandale Culinaire** (Annule les effets des voisins) : une part de pizza surchargée d'ananas empilés n'importe comment, entourée de deux panneaux « interdit » rouges à gauche et à droite.

### 07 Pile
- `[pile_1]` **Pile LR6 Neuve** : une pile bâton dorée et noire, souriante, entourée de petits éclairs.
- `[pile_2]` **Pile Faible** : la même pile, penchée, terne, les yeux qui tombent, un éclair gris tout mou.
- `[pile_3]` **Acide de Pile** (Malus) : une pile rouillée couchée qui fuit dans une flaque d'acide vert fluo, croûtes blanches, gouttes vertes.

### 08 Céréales
- `[cereales_1]` **Céréales Fluo** : un bol de céréales en anneaux rose, vert et orange fluo, qui brillent.
- `[cereales_2]` **Céréales Molles** : le même bol, céréales ramollies et décolorées dans le lait, un bol à la mine triste.
- `[cereales_3]` **Sucre Toxique** : un tas de sucre en forme de pyramide, cubes verts fluo, un visage au sourire fou, lueur toxique.

### 09 Influenceur
- `[influenceur_1]` **Influenceur Fitness** (Boost des voisins frais) : un influenceur sportif au bandeau, sourire éclatant, qui tend les deux bras vers la gauche et la droite comme pour présenter ses voisins ; des « + » de chaque côté.
- `[influenceur_2]` **Influenceur Fatigué** (Boost des voisins frais) : le même, cernes, bras qui tombent à moitié, des « + » plus petits.
- `[influenceur_3]` **Influenceur Annulé** (Malus de zone) : le même en gris, téléphone fissuré, pouces vers le bas, des « − » de chaque côté.

### 10 Enfant
- `[enfant_1]` **Enfant Hurlant** : un enfant roux qui hurle bouche grande ouverte, larmes, traits de bruit autour.
- `[enfant_2]` **Enfant Épuisé** : le même, en sueur, langue tirée, yeux mi-clos.
- `[enfant_3]` **Enfant Endormi** : le même, endormi, tétine, petits « z » dessinés en traits.

### 11 Console
- `[console_1]` **Console Portable** : une console de jeu portable rouge générique (aucune marque), écran vert avec un petit jeu en pixels.
- `[console_2]` **Console Rayée** : la même, écran rayé et fêlé, coins abîmés.
- `[console_3]` **Console Brickée** : la console transformée en vraie brique rouge, écran noir, petite fumée.

### 12 Papier
- `[papier_1]` **Papier Toilette** : un rouleau de papier toilette blanc, une feuille qui pend, propre et doux.
- `[papier_2]` **Dernier Rouleau** (ÉDITION LIMITÉE, Panique) : le dernier rouleau du magasin, auréolé de lumière comme un trésor, sur fond rouge d'alarme, deux panneaux triangulaires d'alerte de chaque côté.
- `[papier_3]` **Carton Vide** : le tube en carton vide, triste, un peu de poussière.

### 13 Bière
- `[biere_1]` **Bière Fraîche** : une chope de bière dorée avec une belle mousse et des gouttes de condensation.
- `[biere_2]` **Bière Chaude** : la même chope, plate, sans mousse, qui fume, verre en sueur.
- `[biere_3]` **Vomi de Soirée** (Malus) : une flaque verdâtre façon dessin animé, avec des morceaux jaunes, des filets d'odeur (cartoon, pas réaliste).

### 14 Kévin
- `[kevin_1]` **Kévin (Caissier)** : un jeune caissier en gilet bleu et casquette rouge, badge vierge, sourire poli, une douchette de caisse à la main.
- `[kevin_2]` **Kévin (Démissionnaire)** : le même, sans casquette, l'air fermé, derrière un carton de déménagement plein de ses affaires.
- `[kevin_3]` **Kévin (Syndiqué)** (Boost de vos autres cartes de la ligne Arrière) : le même, poing levé avec un petit drapeau rouge uni, mégaphone à la bouche ; une rangée de « + » alignés en bas de l'image.

### 15 Mixeur (Outil)
- `[mixeur_1]` **Mixeur Bon Marché** : un blender blanc bon marché, bol transparent, deux boutons.
- `[mixeur_2]` **Mixeur Surchauffé** : le même, socle rouge brûlant, fumée noire, petites étincelles.
- `[mixeur_3]` **Explosion Électrique** (Détruit les voisins) : le mixeur qui explose en étincelles et en éclairs, morceaux de bol projetés, flèches de choc vers la gauche et la droite.

### 16 Scotch (Outil)
- `[scotch_1]` **Scotch Gris** : un rouleau de scotch gris argenté, une bande déroulée.
- `[scotch_2]` **Scotch Poussiéreux** : le même rouleau couvert de poussière et de toiles d'araignée.
- `[scotch_3]` **Colle Sèche** : un bloc de colle séchée, craquelée, grisâtre.

### 17 Plante
- `[plante_1]` **Plante Verte** : une petite plante verte en pot orange, trois feuilles.
- `[plante_2]` **Plante Florissante** (Score +2) : la même, pleine de fleurs, entourée de pièces d'or qui brillent.
- `[plante_3]` **Tige Morte** : une tige sèche et pliée dans le pot, une feuille morte tombée.

### 18 Chat (Mange la Bactérie en face)
- `[chat_1]` **Chat Errant** : un chat gris de gouttière, l'air coriace, qui se lèche les babines en fixant une petite bactérie verte **au-dessus de lui**.
- `[chat_2]` **Gros Matou** : un gros chat orange, ventre énorme, gueule grande ouverte vers une petite bactérie verte en haut.
- `[chat_3]` **Boule de Poils** : une boule de poils grise avec des yeux et un sourire, une petite bactérie verte en haut.

### 19 Cassette
- `[cassette_1]` **Cassette Maudite** : une cassette vidéo noire avec des yeux méchants à la place des bobines, aura violette, volutes.
- `[cassette_2]` **Bande Démagnétisée** : la cassette grise, bande magnétique sortie et emmêlée partout.
- `[cassette_3]` **Entité Libérée** (ÉDITION LIMITÉE) : une créature violette aux grands yeux, qui sort de la cassette ouverte, tentacules, étincelles menthe, fond violet nuit.

### 20 Grand-Mère
- `[grandmere_1]` **Grand-Mère Perdue** : une grand-mère à chignon et lunettes, canne à la main, qui regarde autour d'elle, une goutte de sueur.
- `[grandmere_2]` **Grand-Mère Paniquée** : la même, bras en l'air, bouche ouverte, lunettes de travers.
- `[grandmere_3]` **Héritage** (ÉDITION LIMITÉE, Transfert vers un voisin) : un vieux coffre ouvert débordant de pièces d'or, une flèche qui part vers le côté comme pour donner à un voisin.

---

## 2. Les plats (une image par plat)

Le jeu teinte l'image selon le stade (GD §7.4) : une seule image suffit. Les 6 plats sont en ÉDITION LIMITÉE.
- `[milkshake]` **Milkshake Protéiné** : un grand gobelet de milkshake rose à la banane, chantilly, paille rouge, un petit biceps dessiné en traits à côté.
- `[burger]` **Burger Gras** : un énorme burger dégoulinant de fromage et de graisse sur une assiette.
- `[petit_dej]` **Petit-Dèj Épique** : un plateau avec un œuf au plat, un bol de céréales fluo et une tartine, des éclats de lumière.
- `[ado_muet]` **Ado Muet** (Annule la carte en face) : un adolescent en sweat à capuche sombre, casque audio sur les oreilles, bouche cousue de traits, console dans les mains, un panneau « interdit » en haut.
- `[plante_mutante]` **Plante Mutante** (Score +4) : une plante mutante violette à trois yeux qui pousse dans un pot violet, feuilles vert acide, entourée de pièces d'or.
- `[lance]` **Lance de Fortune** (Détruit la carte en face) : une baguette transformée en lance avec une pointe en métal et du scotch gris, pointée **vers le haut**, étoile de choc au bout.

---

## 3. Décors (16:9)

### 3.1 Accueil
- `[decor_entree]` **Entrée du magasin, de nuit** : façade d'hypermarché vue de face, de nuit, grandes portes coulissantes vitrées fermées au centre (buée sur le verre), paillasson usé devant, mur en béton, un grand caisson d'enseigne vide au-dessus des portes (le jeu y écrit le néon). Ambiance un peu inquiétante mais accueillante.
- `[decor_interieur]` **Intérieur vu par les portes** : allée centrale d'un supermarché très éclairé, néons au plafond, rayons colorés de chaque côté, carrelage brillant ; l'espace du haut et du centre libre (le jeu y suspend les panneaux du menu).
- `[decor_comptoir]` **Comptoir de caisse** (fond des crédits) : vue du dessus d'un comptoir de caisse en bois foncé, éraflures, quelques pièces et un stylo attaché.

### 3.2 Supports du plateau (DIRECTION_ARTISTIQUE.md §3.2)
Vue du dessus inclinée, le support occupe le centre ; 2 × 5 emplacements de cartes doivent pouvoir s'y poser.
- `[support_tapis]` **Tapis roulant d'une caisse** (combat rapide, Cliente pressée) : tapis noir en caoutchouc, séparateur de courses, scanner à droite, bac à gauche.
- `[support_demo]` **Table de démonstration** (Chad Prot') : table pliante avec nappe, pots de protéine sans marque, ring light allumé en arrière-plan.
- `[support_palette]` **Palette de cartons** (Le Livreur Perdu) : palette en bois chargée de cartons scotchés, dans une réserve sombre.
- `[support_congelateur]` **Couvercle vitré d'un vieux congélateur coffre** (La Cheffe Surgelés) : vitre givrée sur les bords, sachets surgelés flous dessous.
- `[support_portiques]` **Carrelage devant les portiques antivol** (Le Vigile Syndiqué) : carrelage blanc fissuré, deux portiques antivol gris de chaque côté.
- `[support_bureau]` **Bureau poussiéreux du gérant** (Boss) : bureau en bois encombré de papiers, lampe de bureau, poussière dans la lumière.

Variantes Zone 2 (J8) : les mêmes décors abîmés, désaturés, verdâtres, néons qui vacillent (DIRECTION_ARTISTIQUE.md §9).

---

## 4. Avatars (portraits pour les caméras de surveillance)

Le jeu affiche les avatars sur un écran de vidéosurveillance (noir et blanc, grain) : livrer des portraits en couleur. Pour chaque avatar, **7 expressions** (DIRECTION_ARTISTIQUE.md §5) : neutre, content, euphorique, dégoûté, paniqué, honteux, endormi. Fichiers : `[avatar_nom_expression]`, par exemple `[avatar_chad_panique]`.

### 4.1 Le joueur
- `[avatar_neutre]` **Client anonyme** (combat rapide, avant le formulaire) : silhouette de client ordinaire, sweat gris, visage simple sans traits marqués, panier à la main.
- `[avatar_male]` **Mâle** : jeune homme ordinaire, cheveux en bataille, t-shirt uni, l'air un peu perdu.
- `[avatar_femelle]` **Femelle** : jeune femme ordinaire, queue de cheval, veste en jean, l'air un peu perdu.
- `[avatar_licorne]` **Licorne** : licorne anthropomorphe en buste, crinière arc-en-ciel décoiffée, sweat à capuche, l'air un peu perdu.

### 4.2 Les adversaires
- `[avatar_cliente]` **La Cliente pressée** : femme pressée, téléphone à l'oreille, liste de courses froissée, chignon qui se défait.
- `[avatar_chad]` **Chad Prot'** : influenceur musclé au bandeau, débardeur moulant, dents trop blanches, téléphone en mode selfie.
- `[avatar_livreur]` **Le Livreur Perdu** : livreur en uniforme sans logo, casquette, colis sous le bras, plan déplié à l'envers.
- `[avatar_cheffe]` **La Cheffe de Rayon Surgelés** : cheffe de rayon en doudoune sur la blouse, bonnet, sourcils givrés.
- `[avatar_vigile]` **Le Vigile Syndiqué** : vigile costaud en uniforme noir, oreillette, badge vierge, brassard rouge uni.
- `[avatar_gerant]` **Le Gérant** : gérant d'hypermarché en costume trop serré, cravate de travers, cernes énormes, sourire commercial figé.

### 4.3 Les personnages non joueurs (pour J4)
- `[avatar_kevin]` **Kévin, caissier** : comme la carte Kévin (Caissier), en portrait.
- `[avatar_vieux_monsieur]` **Le Vieux Monsieur** : vieil homme gentil et bavard, béret, gilet en laine, sourire chaleureux.
- `[avatar_soldeur]` **Le Soldeur** : marchand louche en manteau long couvert d'étiquettes de soldes, sourire en coin.
