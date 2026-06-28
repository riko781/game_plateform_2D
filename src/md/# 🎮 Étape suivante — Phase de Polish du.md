# 🎮 Étape suivante — Phase de Polish du Mouvement

## 🧭 Objectif actuel

On arrête de construire de l’architecture.

On passe en mode :

# 👉 améliorer les sensations de jeu

Le code est déjà suffisant.

Maintenant, le vrai travail est :

* feeling du mouvement
* réactivité du joueur
* lisibilité
* plaisir immédiat
* identité du gameplay

---

# 🎯 Phase actuelle

## PHASE = Polish gameplay / game feel

On travaille uniquement sur :

* mouvement
* saut
* dash
* caméra
* impact
* juice

❌ pas de nouveaux systèmes
❌ pas d’architecture
❌ pas de refacto lourde

---

# ❌ Ce qu’on NE fait PAS maintenant

Évite absolument :

* ECS
* refacto “propre”
* systèmes génériques
* inventaire / combat complexe
* skill tree
* gros refactor state machine

👉 Le jeu n’est pas bloqué par le code
👉 Il est bloqué par le FEEL

---

# ✅ Priorité 1 — Mouvement horizontal

## Problème actuel

Le mouvement fonctionne, mais manque de :

* inertie agréable
* accélération naturelle
* freinage propre
* changements de direction satisfaisants

---

## Objectif

Créer un mouvement :

* fluide
* contrôlé
* lisible
* agréable à corriger en plein air

---

## Ajout de paramètres de tuning

```js id="m1p0ve"
const MOVE = {
    maxSpeed: 140,

    groundAccel: 0.18,
    groundDecel: 0.25,

    airAccel: 0.08,
    airDecel: 0.03,

    turnMultiplier: 1.8
}
```

---

## Ce qu’on veut ressentir

* départ progressif mais réactif
* arrêt net mais pas brutal
* air control plus léger mais utile
* changement de direction “vivant”

---

# ✅ Priorité 2 — Gravité de chute améliorée

## Problème actuel

Montée et descente du saut sont trop similaires.

Résultat :
👉 sensation un peu “flottante”

---

## Objectif

Créer une chute plus :

* rapide
* lisible
* satisfaisante
* “pesante”

---

## Ajout d’un multiplicateur de chute

```js id="k8r2aa"
if (player.sprite.body.velocity.y > 0) {
    player.sprite.body.velocity.y += GRAVITY * 0.4 * deltaSeconds;
}
```

---

## Résultat attendu

* saut plus dynamique
* descente plus rapide
* meilleur contrôle global
* feeling plus “jeu de plateforme solide”

---

# ✅ Priorité 3 — Améliorer le dash

## État actuel

Le dash fonctionne mécaniquement, mais manque d’impact.

---

## Objectif

Le dash doit être :

👉 instantané
👉 puissant
👉 lisible
👉 satisfaisant

---

## Ajouts recommandés

* petit freeze (20–40 ms)
* trail visuel
* flash rapide
* léger screen shake
* squash & stretch du sprite

---

## Résultat attendu

Le dash doit “claquer” immédiatement.

---

# ✅ Priorité 4 — Feeling de caméra

## État actuel

La caméra suit bien, mais reste passive.

---

## Objectif

La caméra doit accompagner le gameplay :

* anticipation du mouvement
* sensation de vitesse
* impact des actions

---

## Ajouts

### Look ahead (regarder devant)

```js id="c7d9ll"
cameraTargetOffsetX = direction * 60;
```

---

### Petit rebond à l’atterrissage

* légère descente caméra
* puis retour smooth

---

### Décalage pendant dash

* léger push vers l’avant

---

# ✅ Priorité 5 — Identité aérienne

## Problème actuel

Tous les états aériens se ressemblent.

---

## Objectif

Donner une identité différente à chaque phase :

| État     | Sensation          |
| -------- | ------------------ |
| Jump     | précis et contrôlé |
| Apex     | léger / suspendu   |
| Fall     | rapide / lourd     |
| Dash air | agressif / nerveux |

---

# ✅ Priorité 6 — Juice (très important)

C’est ici que le jeu devient “vivant”.

---

## Ajouts prioritaires

### Particules

* saut
* landing

---

### Screen shake léger

* dash
* impact

---

### Freeze frames

* moments clés
* dash
* kill enemy

---

### Dash trail

Indispensable pour la lisibilité + sensation de vitesse

---

# 🧪 Checklist de polish du mouvement

À vérifier en continu :

* [ ] Le saut est satisfaisant
* [ ] La chute est agréable
* [ ] Le contrôle en l’air est juste
* [ ] Le dash est impactant
* [ ] L’atterrissage a du poids
* [ ] Les changements de direction sont fluides
* [ ] La caméra est agréable
* [ ] La vitesse globale est cohérente
* [ ] Les inputs sont réactifs
* [ ] Le mouvement est lisible

---

# ⚠️ Danger principal

Ne pas ajouter de features trop tôt.

Éviter :

* wall jump
* double jump
* combos d’attaque
* systèmes de progression
* ennemis complexes

---

# 🧭 Ordre recommandé

## PHASE 1 — Polish mouvement (priorité absolue)

1. accélération / décélération
2. gravité de chute
3. dash feel
4. caméra
5. landing feel
6. juice (particules, shake, freeze)

---

## PHASE 2 — Vertical slice

Quand le mouvement est bon :

* 1 niveau simple
* 1 boucle de gameplay
* 1 ennemi intéressant
* 1 challenge plateforme

---

## PHASE 3 — Stabilisation

Seulement après :

* simplifier si nécessaire
* harmoniser les timings
* supprimer le superflu
* stabiliser le feel global

---

# 🎯 Conclusion

Mission actuelle :

# 👉 rendre le mouvement du jeu incroyablement satisfaisant

Tout le reste vient après.
