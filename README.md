EXERCICE 1 — La boucle existe vraiment
🎯 Objectif

Comprendre que update() est appelée en continu.

À faire

Crée une variable counter

À chaque passage dans update(), incrémente-la

Affiche sa valeur à l’écran ou en console

À observer

La valeur monte très vite

Elle ne correspond PAS au temps réel

Ce que tu dois comprendre

✔ update() ≠ “1 seconde”
✔ update() = 1 frame

EXERCICE 2 — Frame ≠ seconde
🎯 Objectif

Comprendre la notion de FPS.

À faire

Compte combien de fois update() est appelé en 1 seconde

Compare avec un autre onglet ouvert / PC lent

À observer

Le nombre change selon la machine

Ce que tu dois comprendre

✔ Le jeu ne tourne PAS à la même vitesse partout

EXERCICE 3 — Mouvement sans input
🎯 OBJECTIF UNIQUE

Comprendre que :

Un mouvement dans un jeu = une modification répétée à chaque frame

Pas de clavier.
Pas de souris.
Pas de joueur.

👉 Juste la game loop.

EXERCICE 4 — Le temps (delta time)
🎯 OBJECTIF UNIQUE

Corriger le problème que tu viens d’observer :

❌ Mouvement dépendant du nombre de frames
✅ Mouvement dépendant du temps réel