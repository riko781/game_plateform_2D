# 🎮 Phase 2.5 — Gameplay Metrics

## 🧭 Objectif

Mesurer la qualité des niveaux sans modifier le movement core.

Les métriques servent à améliorer :

* la difficulté
* le rythme
* la durée
* la boucle de jeu

Elles ne servent pas à faire de l'analytics complexe.

---

# 🎯 Métriques retenues

## Temps de complétion

Mesure :

* durée totale du niveau
* rythme du parcours
* longueur réelle du contenu

Affichage :

```text
Time: 24.8s
```

---

## Nombre de morts

Mesure :

* difficulté réelle
* zones problématiques
* frustration potentielle

Affichage :

```text
Deaths: 3
```

---

## Nombre de tentatives

Mesure :

* persistance du joueur
* difficulté globale du niveau

Affichage :

```text
Attempts: 4
```

---

# 🧱 Structure recommandée

Créer un objet global indépendant du Player.

```js
const RunMetrics = {
    deaths: 0,
    attempts: 1,
    levelStartTime: 0,
};
```

---

# 💀 Mort

Dans :

```js
Player.kill()
```

Ajouter :

```js
RunMetrics.deaths++;
```

---

# 🔁 Respawn

Dans :

```js
RespawnState.enter()
```

Ajouter :

```js
RunMetrics.attempts++;
```

avant :

```js
scene.restart();
```

---

# ⏱ Début du niveau

Dans :

```js
create()
```

Ajouter :

```js
if(RunMetrics.levelStartTime === 0){
    RunMetrics.levelStartTime = performance.now();
}
```

---

# 🏁 Victoire

Calcul :

```js
const completionTime =
    (performance.now() - RunMetrics.levelStartTime) / 1000;
```

Affichage :

```js
console.log("LEVEL COMPLETE");

console.log(
    "Time:",
    completionTime.toFixed(2),
    "s"
);

console.log(
    "Deaths:",
    RunMetrics.deaths
);

console.log(
    "Attempts:",
    RunMetrics.attempts
);
```

---

# 🔄 Reset après victoire

Après le restart :

```js
RunMetrics.deaths = 0;
RunMetrics.attempts = 1;
RunMetrics.levelStartTime = 0;
```

---

# 🎯 Utilisation

Comparer les niveaux.

Exemple :

```text
Level 1
Time: 18s
Deaths: 0

Level 2
Time: 42s
Deaths: 5

Level 3
Time: 28s
Deaths: 1
```

Questions à se poser :

* trop long ?
* trop facile ?
* trop punitif ?
* progression cohérente ?

---

# 🚫 Ne pas mesurer

Pour l'instant :

* score
* dégâts
* précision
* analytics avancés
* heatmaps
* télémétrie

Ces données ne servent pas encore à améliorer le gameplay.

---

# 🧠 Philosophie

Les métriques sont là pour améliorer le ressenti du joueur.

Elles doivent aider à répondre à :

* est-ce fun ?
* est-ce trop difficile ?
* est-ce trop long ?

Si une métrique n'aide pas à répondre à ces questions :

👉 ne pas l'ajouter.
