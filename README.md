# Jeu Tron — Travail Pratique Développement Web

## Aperçu du projet

Ce projet est réalisé dans le cadre du cours de Développement Web au Collège Ahuntsic. Il consiste à compléter et enrichir un jeu Tron multijoueur en **JavaScript** en utilisant la programmation orientée objet et les API natives du navigateur (DOM, Canvas, Événements).

En partant d'un fichier HTML unique fonctionnel, le projet est restructuré et enrichi en 10 étapes successives cumulatives :

| Étape | Fonctionnalité | Concepts appliqués |
|---|---|---|
| **Étape 1** | **Séparation HTML / CSS / JS** : Découpage du fichier unique en trois fichiers distincts. | Structure de projet |
| **Étape 2** | **Page de connexion** : Formulaire avec validation (courriel, champs vides, credentials simulés) et redirection. | Événements, DOM, Regex |
| **Étape 3** | **Deuxième joueur** : Ajout d'un joueur contrôlé par WASD, en position opposée, avec détection de collisions croisées. | POO, instances multiples |
| **Étape 4** | **Match nul** : Détection des collisions simultanées (frontale, double crash) pour éviter un résultat injuste. | Logique conditionnelle |
| **Étape 5** | **Plusieurs tours** : Sauvegarde du pointage en mémoire et mécanisme de relance sans rechargement de page. | DOM, état d'objet |
| **Étape 6** | **Changement de couleur** : Sélecteurs de couleur en temps réel pour la trace de chaque joueur. | Événement `input`, `<input type="color">` |
| **Étape 7** | **Boutons de contrôle** : Pause, Start et Restart avec gestion d'état de la boucle de jeu. | Événements, état booléen |
| **Étape 8** | **Contrôle à la souris** : Direction du joueur 1 via un geste de glissement (drag) sur le canvas. | `mousedown`, `mouseup`, delta |
| **Étape 9** | **Gestion du fil d'exécution** : Remplacement de `setInterval` par `setTimeout` récursif pour une pause réelle. | Timers JavaScript |
| **Étape 10** | **Accélération** : Augmentation progressive de la vitesse à chaque tick avec un délai minimum configurable. | `setTimeout` à délai variable |

L'objectif principal est de mettre en pratique les concepts de programmation orientée objet, de manipulation du DOM, de gestion des événements et du rendu sur canvas dans un contexte de jeu interactif.

## Prérequis

Le projet ne requiert aucune dépendance externe. Il tourne entièrement dans le navigateur avec les technologies web standard :

* HTML5
* CSS3
* JavaScript (ES6+)

## Lancer le projet

Aucune installation n'est requise. Ouvrez simplement le fichier `login.html` dans un navigateur web moderne (Chrome, Firefox, Edge).

```
login.html  →  (connexion)  →  index.html  →  (jeu)
```

Les identifiants de test sont les suivants :

```
Courriel  : joueur@tron.com
Mot de passe : tron1234
```

## Contrôles en jeu

| Action | Joueur 1 | Joueur 2 |
|---|---|---|
| Haut | Fleche haut | W |
| Bas | Fleche bas | S |
| Gauche | Fleche gauche | A |
| Droite | Fleche droite | D |
| Direction (souris) | Glisser sur le canvas | — |
| Rejouer | Entree | — |
