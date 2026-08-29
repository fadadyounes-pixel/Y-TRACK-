# CareerMap — Parcours Candidat (après connexion)

> Rôle : Candidat · Accès : code alphanumérique fourni par le conseiller

---

## Connexion

1. Ouvrir CareerMap
2. Sélectionner le rôle **Candidat**
3. Entrer le code d'accès (ex. : `RPT-AB12`)
4. Appuyer sur **Entrée**

---

## Flux complet après connexion

```
Connexion → Profil → Bienvenue → Évaluation (3 tests) → Code Résultats → Rapport PDF
                                                                    ↓
                                                          Tests optionnels (langue)
```

---

## Étape 1 — Formulaire de Profil

> Écran : fond sombre, barre de progression en haut

### Champs obligatoires

| Champ | Type | Détail |
|---|---|---|
| Prénom | Texte libre | — |
| Nom | Texte libre | — |
| Email | Email | Validation format `nom@email.com` |
| Téléphone | Texte | 8–15 chiffres |
| Tranche d'âge | Liste | 18–20, 21–24, 25–29, 30–39, 40+ |
| Genre | Liste | Masculin / Féminin |
| Niveau d'études | Liste | Sans diplôme → Doctorat |
| Situation professionnelle | Liste | Lycéen, Étudiant, Chercheur d'emploi, Salarié, Auto-entrepreneur, Autre |
| Région | Liste | 12 régions du Maroc |
| Préfecture | Liste (conditionnel) | Apparaît uniquement si **Casablanca-Settat** est sélectionnée (10 préfectures) |

### Photo (optionnel)
- Bouton d'upload photo de profil

### Barre de progression
- Affiche le % de champs remplis (ex. : `70%`)
- Le bouton **Suivant** n'est actif qu'une fois tous les champs requis remplis
- En cas d'erreur : liste des champs manquants affichée en rouge

---

## Étape 2 — Bienvenue (Welcome)

> Écran de présentation des 3 tests avant de commencer

### Contenu

- Message de bienvenue personnalisé (`Bonjour, <Prénom>`)
- Titre : **"Trois tests. Votre carte de carrière complète."**
- Instruction : *"Complétez les 3 tests pour obtenir votre code de résultats."*

### Les 3 tests listés

| # | Test | Durée estimée | Questions | Icône |
|---|---|---|---|---|
| ① | Holland Career Test | ~20 min | 30 Q | 🎯 |
| ② | Big Five Personnalité | ~15 min | 25 Q | 🧠 |
| ③ | Skill Up (Employabilité) | ~12 min | 20 Q | ⚡ |

- Bouton **"Commencer les 3 tests →"** (couleur or)

---

## Étape 3 — Évaluation (Assessment)

> 116 questions au total, séquentielles, avec minuteur par question (10 secondes)

### Phases

| Phase | Test | Questions | Couleur |
|---|---|---|---|
| 1 | Holland RIASEC | 30 | Teal (turquoise) |
| 2 | Big Five | 25 | Or |
| 3 | Skill Up | 20 | Violet |
| 4 | EQ-Map | 16 | Bleu |
| 5 | EntreMap | 15 | Vert |
| 6 | ResiMap | 10 | Rouge |

### Interface par question

- **En-tête** : nom de la phase + numéro de question (ex. : `Holland 12 / 30`)
- **Barre de progression** globale (116 questions)
- **Minuteur** : 10 secondes par question (décompte visuel)
- **Texte de la question** (centré, grande police)
- **5 options de réponse** :
  - Tout à fait d'accord / D'accord / Neutre / Pas d'accord / Pas du tout d'accord
  - *(ou variante : Toujours / Souvent / Parfois / Rarement / Jamais)*
- Navigation : bouton **Suivant** (ou auto-avancement si minuteur écoulé)

---

## Étape 4 — Code de Résultats

> Écran affiché une fois les 3 tests terminés

### Contenu

- Icône ✅ verte
- Titre : **"Félicitations ! Tests complétés."**
- Message : *"Partagez ce code avec votre conseiller pour accéder à votre rapport complet."*

### Bloc code

```
┌────────────────────────────────────┐
│  CODE DE RÉSULTATS                 │
│  RPT-AB12                          │  ← grand texte, monospace, couleur or
│  Prénom Nom · 29/08/2026           │
└────────────────────────────────────┘
```

### Actions

| Bouton | Action |
|---|---|
| **Copier le code** | Copie dans le presse-papiers (feedback vert ✓) |
| Note bleue | Rappel : *"Conservez ce code et partagez-le avec votre conseiller."* |
| **Tests de placement linguistique** | Accès aux tests optionnels de langue (anglais/français) |

---

## Étape 5 — Rapport (accessible via conseiller/admin)

> Candidat de retour : affiché si le code est déjà enregistré

### En-tête rapport

- Nom · ID · Date
- 2 onglets :
  - 🎓 **Rapport Candidat** — version destinée au bénéficiaire
  - 🔒 **Rapport Conseiller** — version confidentielle (données étendues)

### Bouton téléchargement PDF

- `⬡ Télécharger PDF Report` (en haut du rapport)

### Sections du Rapport Candidat

#### 1. Profil de Carrière — Holland RIASEC

| Élément | Description |
|---|---|
| Grille 3×2 | 6 types RIASEC avec score % et couleur distinctive |
| Barres animées | Score de chaque type (R, I, A, S, E, C) |
| Types dominants | 2 premiers types mis en avant |
| Métiers suggérés | Liste de carrières alignées sur le type dominant |

**Types Holland :**
- **R** — Réaliste (bleu)
- **I** — Investigateur (violet)
- **A** — Artistique (rose)
- **S** — Social (vert)
- **E** — Entrepreneur (or)
- **C** — Conventionnel (teal)

#### 2. Personnalité — Big Five

| Dimension | Libellé |
|---|---|
| O | Ouverture à l'expérience |
| C | Conscience / Rigueur |
| E | Extraversion |
| A | Agréabilité |
| N | Névrosisme |

- Barre de progression animée pour chaque dimension
- Description comportementale courte selon le score (haut / bas)

#### 3. Employabilité — Skill Up

| Dimension | Description |
|---|---|
| **A** — Autonomie | Initiative, organisation personnelle |
| **E** — Économique | Compréhension du milieu professionnel |
| **C** — Collaboration | Travail en équipe, communication |
| **R** — Readiness | Préparation générale à l'emploi |

- Grille 2×2, barre par dimension
- Score global d'employabilité en %

#### 4. Feuille de route carrière (Roadmap)

- Plan d'action personnalisé par phases (0–3 mois, 3–12 mois, 1–3 ans)
- Adapté au profil Holland et à la situation du candidat

#### 5. Parcours académique

- Liste d'établissements et formations recommandés
- Adaptée au niveau d'études et au profil Holland
- Ressources e-learning suggérées

---

## Tests optionnels (après le code résultats)

Accessibles via le bouton 🌐 **Tests de placement linguistique**

| Test | Description |
|---|---|
| Anglais | Test de niveau linguistique (placement) |
| Français | Test de niveau linguistique (placement) |

---

## Candidat de retour

Si le candidat entre un code déjà enregistré :
- Affichage direct du rapport avec les résultats sauvegardés
- Option : voir le rapport ou refaire l'OrientaMap

---

## Langues disponibles

L'interface est entièrement trilingue :

| Code | Langue | Direction |
|---|---|---|
| `fr` | Français | LTR |
| `en` | Anglais | LTR |
| `ar` | Arabe | RTL |

Sélecteur de langue disponible sur toutes les pages (boutons `FR / EN / AR` en haut).

---

## Couleurs de l'interface (thème sombre)

| Élément | Couleur |
|---|---|
| Fond principal | `#060d18` (bleu très sombre) |
| Carte / surface | `#0d1e38` |
| Accent principal | `#1aabaa` (teal) |
| Accent secondaire | `#d4a328` (or) |
| Texte principal | `#e8f4ff` |
| Texte secondaire | `rgba(255,255,255,.45)` |

---

*CareerMap — Plateforme d'orientation professionnelle · INDH*
