# 🎮 Game Dev Philosophy — Mode Studio Indie (Coaching LLM)

## 🧭 Objectif de ce document

Ce document sert à guider la prise de décision dans un projet de game dev.  
Il privilégie le gameplay, la vitesse d’itération et le ressenti joueur.

⚠️ Ce n’est PAS une architecture logicielle.  
⚠️ Ce n’est PAS une règle de code.  
✔ C’est une philosophie de création de jeu.

---

# 🧠 1. Règle suprême

Le but n’est pas de bien coder.  
Le but est de créer un jeu fun, réactif et lisible.

Tout le reste est secondaire.

---

# 🎯 2. Priorités absolues

## 🥇 Gameplay Feel
- contrôle du joueur
- saut, dash, mouvement
- sensation de fluidité
- réactivité des inputs

## 🥈 Itération rapide
- pouvoir tester en quelques secondes
- modifier sans peur
- casser et corriger vite

## 🥉 Lisibilité du système
- comprendre rapidement ce que fait le code
- debug facile

## 🧱 Architecture
- uniquement si nécessaire
- jamais avant d’avoir un problème réel

---

# ⚖️ 3. Principe fondamental

On n’ajoute pas de structure par anticipation.  
On ajoute de la structure uniquement quand la complexité devient un problème réel.

---

# 🎮 4. Définition d’un bon code de jeu

Un bon code de jeu est :
- facile à modifier
- facile à tester
- orienté gameplay
- tolérant aux changements

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
- rapide
- jetable
- parfois sale
- sert uniquement à tester une idée

## Production
- stable
- lisible
- debugable
- mais toujours orienté gameplay

Même en production :
👉 on reste dans une mentalité de prototype amélioré.

---

# 🧍 7. Le joueur est la vérité

Toute décision doit répondre à :
- est-ce que c’est fun ?
- est-ce que c’est réactif ?
- est-ce que c’est clair ?

Si non → on change, peu importe le code.

---

# ⚙️ 8. Architecture = outil, pas objectif

FSM, ECS, state systems :

✔ utiles si :
- ça simplifie le gameplay
- ça clarifie les comportements
- ça facilite le debug

❌ inutiles si :
- ça ralentit les changements
- ça complexifie le code sans bénéfice gameplay

---

# 🧠 9. Règle des 10 minutes

Si une modification gameplay prend plus de 10 minutes à implémenter,  
le système doit être simplifié.

---

# 🔥 10. Erreur classique à éviter

❌ penser :
- “je dois faire une architecture propre”
- “je dois tout prévoir”
- “je dois organiser avant de jouer”

✔ penser :
- “comment rendre le saut plus satisfaisant ?”
- “comment rendre le dash plus puissant ?”
- “comment rendre le contrôle plus direct ?”

---

# 🎮 11. Le vrai travail du game dev

Créer des sensations jouables, pas des structures logiques.

---

# 🧪 12. Utilisation des State Machines (important)

FSM / states sont acceptées uniquement si :
- elles améliorent la lisibilité du comportement
- elles facilitent le debug
- elles rendent les transitions claires

❌ refusées si :
- elles deviennent un exercice d’ingénierie logicielle
- elles ralentissent le gameplay tuning

---

# 🚀 13. Philosophie finale

Le bon game dev est celui qui peut changer le feeling du jeu rapidement  
sans avoir peur de casser le code.

---

# 🧭 14. Directive pour LLM (IMPORTANT)

Quand tu utilises ce projet comme base :

- privilégier gameplay avant architecture
- éviter refactor inutile
- proposer des améliorations de FEEL
- guider vers des choix simples
- ne pas transformer en exercice d’ingénierie logicielle

---

# 🎯 Résumé ultime

Un jeu réussi = une bonne sensation de contrôle.  
Le code est juste un moyen d’y arriver.