# 🧠 Progression Game Dev — State Machine Player (Phaser)

## 📅 Étape actuelle

Nous sommes en train de refactoriser un contrôleur de joueur Phaser basé sur une FSM procédurale (états en strings) vers un système hybride de State Machine utilisant :

* `playerState` (FSM en string — ancien système)
* `currentState` (FSM en objets — nouveau système en cours)

---

# 🎯 Ce qui a été fait

## 1. Contrôleur de base du joueur

Nous avions déjà un système complet avec :

* Mouvement (marche / contrôle en l’air)
* Saut (buffer + coyote time)
* Dash
* Hit
* Landing
* Gestion des animations
* Physique Arcade Phaser

---

## 2. Refactor en classe Player

Nous avons déplacé la logique dans :

```js
class Player {
    update(delta) { ... }
}
```

Le joueur gère maintenant :

* Input
* Logique de state
* Physique
* Animations

---

## 3. Introduction des states objets

Nous avons commencé à introduire des states sous forme d’objets :

### Exemple :

```js
class LandingState {
    timer = 0;

    update(player, delta) {
        this.timer -= delta;
        if (this.timer <= 0) return "FINISHED";
    }
}
```

---

## 4. Système hybride de state

Nous avons maintenant deux systèmes en parallèle :

### A. FSM legacy

```js
playerState = "idle | walk | jump | dash | landing"
```

### B. FSM objet

```js
currentState = new LandingState(player)
```

---

# 🔁 Boucle update (architecture actuelle)

```js
update(delta) {
    // 1. physique + timers
    // 2. input
    // 3. calcul du wanted state
    // 4. détection des events
    // 5. processState (transition)

    if (previousState !== playerState) {
        if (playerState === LANDING) {
            currentState = new LandingState(this);
        }
    }

    const result = currentState?.update(this, delta);

    if (result === "FINISHED") {
        currentState = null;
    }

    // 6. application physique
    // 7. animation
}
```

---

# ⚠️ Décisions importantes

## 1. Règle de reset du currentState

Nous avons choisi :

```js
currentState = null
```

plutôt que undefined car :

* sens explicite : "aucun state actif"
* plus sûr avec optional chaining
* intention plus claire

---

## 2. Séparation des responsabilités

| Système      | Rôle                                            |
| ------------ | ----------------------------------------------- |
| playerState  | décide QUEL état est actif                      |
| currentState | gère COMMENT cet état se comporte dans le temps |

---

# 🧠 Insight important

Nous avons découvert un principe clé :

> La transition de state (décision) ≠ l’exécution du state (comportement)

---

# 🚧 Problème actuel / prochaine étape

Nous avons maintenant DEUX sources de vérité :

* playerState (FSM string)
* currentState (FSM objet)

⚠️ Risque : désynchronisation entre les deux systèmes

---

# 🎯 Prochaines étapes

Nous devons décider :

1. Est-ce que `playerState` reste la source principale ?
2. Est-ce que `currentState` devient le système principal ?
3. Ou est-ce qu’on fusionne complètement vers une FSM objet ?

---

# 🧭 Objectif final

Aller vers :

* isolation propre des states
* suppression des logiques dupliquées
* FSM entièrement basée sur objets
* transitions prévisibles et propres

---

# 📌 Statut

✔ LandingState implémenté (version simple)
✔ cycle de vie currentState ajouté
✔ intégration dans update fonctionnelle
⚠ système hybride encore actif

---

# 🧠 Résumé

Nous passons progressivement de :

> FSM procédurale → FSM hybride → FSM objet complète (prochaine étape)
