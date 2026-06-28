# 🎮 PHASE 2 — VERTICAL SLICE (MODE CHECKLIST)

## 🧭 OBJECTIF GLOBAL

Construire un mini-jeu jouable complet :

spawn → platforming → danger → goal → restart

Sans toucher au core movement.

---

# 🚀 0. RÈGLE DE SESSION (IMPORTANT)

Avant chaque session :

- Le jeu doit déjà être jouable  
- Tu ne touches PAS au mouvement core  
- Tu ne fais QUE du “level + situation + feedback”

---

# 🧠 1. CHECKLIST DÉMARRAGE (2 MIN)

Avant de coder :

- Le mouvement fonctionne déjà ?
- Jump + dash sont stables ?
- Restart rapide fonctionne ?
- Aucun refactor prévu aujourd’hui ?

Si NON → corriger uniquement le bloquant  
Si OUI → continuer

---

# 🟢 2. SPAWN ZONE (SAFE START)

- spawn sans friction
- 3–5 secondes sans danger
- saut testé facilement
- dash testé sans stress

Critère :
- compréhension mouvement < 10 sec

---

# 🟡 3. PLATFORMING ZONE (SKILL LÉGER)

- sauts courts + longs
- dash utile au moins 1 fois
- lecture claire

Level :
- plateformes espacées
- hauteurs variées
- max 1 plateforme mobile

---

# 🔴 4. DANGER ZONE (PRESSION)

- au moins 1 menace
- mort lisible
- danger immédiatement compréhensible

Options :
- ennemi simple
- zone mortelle
- timing plateforme

Critère :
- changement de rythme joueur

---

# 👾 5. ENNEMI (SIMPLE MAIS UTILE)

- déplacement simple
- réaction joueur basique
- pas de système complexe

Doit forcer :
- ralentir OU changer trajectoire OU utiliser dash

---

# 🏁 6. GOAL ZONE (FIN CLAIRE)

- objectif visible
- trigger simple
- fin compréhensible sans texte

Feedback :
- flash léger
- pause 1–2 sec
- restart auto

---

# 💀 7. DEATH LOOP

- mort lisible instantanément
- feedback visuel clair
- respawn < 2 sec

Feedback :
- flash rouge
- freeze court

---

# 🔁 8. BOUCLE GLOBALE

- spawn → progression → mort → restart OK
- spawn → goal → restart OK
- pas de perte de contrôle

---

# ⚙️ 9. DEBUG MODE

- hitbox visible
- vitesse / état joueur
- debug lisible en 3 sec

---

# 🧪 10. TEST JOUEUR RÉEL

- est-ce fluide sans réfléchir ?
- est-ce que je contrôle le perso ?
- est-ce que la mort est claire ?
- est-ce rejouable immédiatement ?

---

# 🚫 11. INTERDITS

- refactor architecture
- FSM redesign
- nouveaux systèmes majeurs
- optimisation prématurée
- abstraction inutile

---

# ✅ 12. AUTORISÉ

- level design
- placement objets
- tuning distances
- feedback FX/UI simple
- debug tools simples

---

# 🧠 13. RÈGLE D’OR

Si ça n’améliore pas le feel immédiatement → ne pas faire

---

# 🎯 14. FIN DE PHASE

OK si :
- jeu jouable start → finish
- compréhension immédiate
- mort non frustrante
- restart instantané
- progression ressentie
