# 🎮 Game Dev Philosophy — Mode Studio Indie (v2 améliorée)

## 🧭 Objectif

Guider les décisions de game dev en privilégiant :

* le gameplay
* la vitesse d’itération
* le ressenti joueur

⚠️ Ce n’est PAS une architecture logicielle
⚠️ Ce n’est PAS une règle de code
✔ C’est une philosophie de création de jeu

---

# 🧠 1. Règle suprême

Le but n’est pas de bien coder.
Le but est de créer un jeu fun, réactif et lisible.

Tout le reste est secondaire.

---

# 🎯 2. Priorités absolues

## 🥇 Gameplay Feel

* contrôle du joueur
* saut, dash, mouvement
* sensation de fluidité
* réactivité des inputs

## 🥈 Itération rapide

* tester en quelques secondes
* modifier sans friction
* casser et corriger vite

## 🥉 Lisibilité du système

* comprendre rapidement
* debug facile
* comportement prévisible

## 🧱 Architecture

* uniquement si nécessaire
* jamais avant un problème réel

---

# ⚖️ 3. Principe fondamental

On n’ajoute pas de structure par anticipation.
On ajoute de la structure uniquement quand la complexité devient un problème réel.

---

# 🎮 4. Définition d’un bon code de jeu

Un bon code de jeu est :

* facile à modifier
* facile à tester
* orienté gameplay
* tolérant aux changements

❌ pas forcément propre
❌ pas forcément académique
✔ mais efficace pour créer du fun

---

# 🔁 5. Boucle de travail réelle

idée → test → ressenti → ajustement → répétition

Le game dev est une boucle de feedback, pas une conception figée.

---

# 🧪 6. Prototype vs Production

## Prototype

* rapide
* jetable
* parfois sale
* sert à tester une idée

## Production

* stable
* lisible
* debugable
* toujours orienté gameplay

👉 même en production : mentalité de prototype amélioré

---

# 🧍 7. Le joueur est la vérité

Chaque décision doit répondre à :

* est-ce fun ?
* est-ce réactif ?
* est-ce clair ?

Si non → on change, peu importe le code.

---

# ⚙️ 8. Architecture = outil, pas objectif

FSM, ECS, state systems :

✔ utiles si :

* simplifient le gameplay
* clarifient les comportements
* facilitent le debug

❌ inutiles si :

* ralentissent les changements
* complexifient sans gain gameplay

---

# 🧠 9. Règle des 10 minutes

Si une modification gameplay prend plus de 10 minutes à implémenter →
le système doit être simplifié.

---

# 🔥 10. Erreurs classiques à éviter

❌ “je dois faire une architecture propre”
❌ “je dois tout prévoir”
❌ “je dois organiser avant de jouer”

✔ “comment améliorer le saut ?”
✔ “comment rendre le dash satisfaisant ?”
✔ “comment améliorer le contrôle ?”

---

# 🎮 11. Le vrai travail du game dev

Créer des sensations jouables, pas des structures logiques.

---

# 🧪 12. State Machines (usage contrôlé)

Acceptées si :

* améliorent la lisibilité
* rendent les transitions claires
* facilitent le debug

Refusées si :

* deviennent un exercice d’ingénierie
* ralentissent le tuning gameplay

---

# 🧠 13. Dette de gameplay (NOUVEAU)

Attention à la cohérence du feel :

Signes de dette :

* timings incohérents (jump / dash / attaque)
* sensations contradictoires
* tuning chaotique

👉 Si le feel devient confus :

* simplifier
* harmoniser
* supprimer avant d’ajouter

---

# 🧪 14. Vérités stables (NOUVEAU)

Tout n’est pas flexible.

Certains éléments doivent être stabilisés tôt :

* gravité
* vitesse de base
* échelle du monde
* timings globaux

👉 Ces constantes définissent l’identité du jeu

Sans elles :

* chaque changement casse tout
* le ressenti devient instable

---

# 🛠️ 15. Debug orienté gameplay (NOUVEAU)

Le debug doit servir le gameplay, pas juste le code.

Inclure :

* visualisation (hitbox, vitesse, états)
* logs simples et ciblés
* outils de tweak en live

👉 meilleur debug = itération plus rapide

---

# 🧱 16. Stabilisation progressive (NOUVEAU)

Processus recommandé :

1. prototyper librement
2. identifier ce qui fonctionne
3. figer les éléments clés
4. simplifier
5. étendre

👉 un bon jeu devient progressivement stable
👉 pas juste flexible

---

# 🚀 17. Philosophie finale

Code rapide pour explorer
Structure minimale pour stabiliser
Gameplay toujours prioritaire

---

# 🧭 18. Directive pour LLM

* privilégier gameplay > architecture
* éviter refactor inutile
* proposer des améliorations de FEEL
* guider vers des solutions simples
* refuser le sur-engineering

---

# 🎯 Résumé ultime

Un jeu réussi = une bonne sensation de contrôle

Le code est juste un moyen d’y arriver.
