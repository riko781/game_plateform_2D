# 🎮 Next Steps — Gameplay Stabilisation Plan

## 🧭 Objectif actuel du projet

Le projet est actuellement à un stade :

* prototype avancé
* gameplay déjà prometteur
* bonnes bases de FEEL

Mais il commence à accumuler :

* de la dette gameplay
* des comportements incohérents
* des systèmes isolés

👉 L’objectif n’est PAS de refactor massivement.
👉 L’objectif est de stabiliser le FEEL sans perdre la vitesse d’itération.

---

# ✅ Priorité absolue actuelle

Le focus principal doit être :

# 🎯 Stabiliser le mouvement du joueur

Avant :

* nouveaux systèmes
* ennemis complexes
* architecture avancée
* contenu massif

Le contrôle joueur doit devenir :

* cohérent
* prévisible
* satisfaisant
* facile à tuner

---

# 🥇 ÉTAPE 1 — Stabiliser le saut

## ❌ Problème actuel

Le jump est basé sur :

* une gravity arbitraire
* une jump force arbitraire

Donc :

* difficile à équilibrer
* sensation fragile
* tuning imprécis

---

## ✅ Objectif

Définir le saut avec :

* hauteur de saut
* temps jusqu’à l’apex

Puis calculer automatiquement :

* gravity
* jump force

---

## ✅ À faire

Remplacer :

```js
const GRAVITY = 800;
const JUMP_FORCE = -500;
```

Par :

```js
const JUMP_HEIGHT = 120;
const TIME_TO_APEX = 0.3;

const GRAVITY = (2 * JUMP_HEIGHT) / (TIME_TO_APEX ** 2);
const JUMP_FORCE = -GRAVITY * TIME_TO_APEX;
```

---

## 🎯 Résultat attendu

Le jump devient :

* stable
* cohérent
* facilement ajustable
* contrôlable précisément

---

# 🥈 ÉTAPE 2 — Corriger le dash

## ❌ Problème actuel

Le dash :

* désactive la gravité
* reset totalement la vitesse verticale
* casse la continuité physique

Résultat :

* sensation artificielle
* rupture du flow
* dash déconnecté du mouvement global

---

## ✅ Objectif

Le dash doit :

* conserver l’inertie
* rester fluide
* prolonger le mouvement
* améliorer le flow

---

## ✅ À faire

Éviter :

```js
setAllowGravity(false)
velocity.y = 0
```

Préférer :

```js
velocity.x = dashDirection * DASH_SPEED;
velocity.y *= 0.2;
```

---

## 🎯 Résultat attendu

Dash plus :

* naturel
* fluide
* moderne
* intégré au movement system

---

# 🥉 ÉTAPE 3 — Ajouter du debug gameplay

## ❌ Problème actuel

Le projet est difficile à observer en temps réel.

Impossible de voir facilement :

* state actuel
* velocity
* timers
* transitions

---

## ✅ Objectif

Créer des outils simples pour debug le FEEL.

---

## ✅ À afficher en jeu

* état actuel
* velocity X/Y
* coyote timer
* jump buffer
* grounded

---

## ✅ Exemple

```js
state: IdleState
vx: 120
vy: -300
coyote: 84
buffer: 0
```

---

## 🎯 Résultat attendu

* debug plus rapide
* tuning plus précis
* meilleure compréhension du gameplay
* itération accélérée

---

# 🧱 ÉTAPE 4 — Réduire la dette gameplay

## ❌ Problème actuel

Certaines mécaniques commencent à fonctionner indépendamment :

* jump
* dash
* landing
* air control

👉 elles doivent maintenant fonctionner ensemble.

---

## ✅ À surveiller

Si le jeu commence à donner :

* une sensation incohérente
* des timings bizarres
* des réactions imprévisibles

Alors :

👉 simplifier avant d’ajouter.

---

# 🧠 ÉTAPE 5 — Simplifier les states sans over-engineering

## ❌ Problème actuel

Certaines intentions joueur sont dupliquées :

```js
if(player.dashJustDown)
```

Dans plusieurs states.

---

## ✅ Objectif

Centraliser les intentions joueur.

---

## ✅ Exemple

```js
player.wantsToJump
player.wantsToDash
```

Puis :

* les states consomment ces intentions
* moins de duplication
* transitions plus simples

---

# ⚠️ IMPORTANT — Ce qu’il ne faut PAS faire maintenant

## ❌ PAS de :

* ECS
* architecture complexe
* event bus
* système générique énorme
* refactor massif
* séparation excessive des fichiers
* optimisation prématurée

---

# ✅ Ce qu’il faut faire

## ✔ Continuer à :

* tester rapidement
* tweak constamment
* privilégier le FEEL
* simplifier les comportements
* observer les sensations

---

# 🎮 Vision actuelle du projet

Le projet doit évoluer vers :

## Phase actuelle

👉 “movement system solide et satisfaisant”

Pas encore :

* contenu massif
* architecture finale
* polish total

---

# 🎯 Critère de réussite actuel

Le mouvement doit devenir :

* satisfaisant même sans contenu
* fun juste en se déplaçant
* agréable à répéter
* précis et stable

Si courir et sauter sont déjà fun :
👉 le projet est sur la bonne voie.

---

# 🚀 Philosophie à conserver

Gameplay > architecture

Toujours.

Le code sert le FEEL.
Pas l’inverse.
