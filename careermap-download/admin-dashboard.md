# CareerMap — Tableau de Bord Administrateur

> Accès : code `@adminyfadad` · Rôle : Administrateur

---

## Connexion

1. Ouvrir l'application CareerMap
2. Sélectionner le rôle **Administrateur**
3. Entrer le code d'accès admin
4. Le tableau de bord s'affiche

---

## Structure générale

Le tableau de bord est divisé en **6 onglets** :

| Onglet | Icône | Contenu |
|---|---|---|
| Vue d'ensemble | ◉ | KPIs globaux, sparkline, entonnoir, genre, INDH, inscriptions récentes |
| Démographie | ◈ | Répartition par région, niveau d'études, âge, situation |
| Tests & Scores | ◎ | Holland, Big Five, scores d'employabilité |
| INDH | ⬡ | Programmes 01/02/03, scores par critère, top candidats |
| Conseillers | ◈ | Gestion de l'équipe conseillers |
| Données | ▦ | Table complète, filtres, tri, export CSV, fiches candidats |

---

## Barre de KPIs

Affichée en permanence en haut de chaque onglet :

| Indicateur | Description |
|---|---|
| **INSCRITS** | Nombre total de candidats sur la période sélectionnée |
| **BILANS COMPLETS** | Candidats ayant terminé les 3 tests + score emploi ≥ 45 % |
| **PARTICIPATION F.** | Pourcentage de femmes |
| **CONSEILLERS** | Nombre de conseillers actifs |
| **MOY. EMPLOI** | Moyenne du score d'employabilité (%) |
| **RÉGIONS** | Nombre de régions représentées (sur 12) |

**Filtre période** (en haut à droite) : Tout · 7 jours · 30 jours · 90 jours

---

## Onglet 1 — Vue d'ensemble

### Inscriptions par semaine
- Graphique sparkline sur 13 semaines glissantes
- Affiche le total général

### Entonnoir de complétion
- Inscrits → Tests commencés → Bilans complets → Profils disponibles
- Chaque étape affiche le nombre et le pourcentage par rapport aux inscrits

### Genre
- Donut chart Masculin / Féminin
- Légende avec effectifs et pourcentages

### Répartition INDH (estimée)
- **Programme 01** — Insertion Professionnelle Salariée (profils R, S, C)
- **Programme 02** — Auto-Emploi / Entrepreneuriat (profil E)
- **Programme 03** — Coopérative / Économie Sociale (profils I, A)

### Dernières inscriptions
- 6 candidats les plus récents
- Clic sur un candidat → fiche détail complète

---

## Onglet 2 — Démographie

- **Répartition par région** : bar chart horizontal, toutes les régions du Maroc
- **Niveau d'études** : bar chart par diplôme (Sans diplôme → Doctorat)
- **Tranches d'âge** : bar chart (18–20, 21–24, 25–29, 30–39, 40+)
- **Situation professionnelle** : Lycéen, Étudiant, Chercheur d'emploi, Salarié, Auto-entrepreneur, Autre

---

## Onglet 3 — Tests & Scores

### Holland (RIASEC)
- Donut des 6 types : R (Réaliste), I (Investigateur), A (Artistique), S (Social), E (Entrepreneur), C (Conventionnel)
- Bar chart horizontal par type dominant
- Radar moyen de tous les candidats

### Big Five (Personnalité)
- Barres pour les 5 dimensions : O (Ouverture), C (Conscience), E (Extraversion), A (Agréabilité), N (Névrosisme)
- Score moyen par dimension

### Scores d'employabilité
- **Autonomie** (A), **Économique** (E), **Collaboration** (C), **Readiness** (R)
- Moyenne de chaque dimension + score global d'emploi

---

## Onglet 4 — INDH

### KPIs INDH
- Nombre de candidats par programme (01, 02, 03)
- Score moyen INDH global

### Scores par critère INDH
- Autonomie · Économique · Collaboration · Readiness
- Barres de progression pour chaque critère

### Top candidats INDH
- Liste des meilleurs profils INDH avec score et programme recommandé
- Bouton d'accès direct au Rapport Orientation INDH de chaque candidat

---

## Onglet 5 — Conseillers

### KPIs conseillers
- Total conseillers · Bénéficiaires (tous candidats) · Moyenne bénéficiaires / conseiller

### Ajouter un conseiller
1. Saisir le **nom complet**
2. Choisir la **région** (12 régions du Maroc)
3. Si **Casablanca-Settat** : choisir l'**préfecture** assigné
4. Cliquer **Créer** → le code est généré automatiquement (`@nomADV`)

### Modifier un conseiller (✏️)
- Clic sur le bouton ✏️ sur la carte du conseiller
- Modifier l'préfecture assigné depuis la liste déroulante
- Enregistrer → mis à jour en temps réel (Firestore)

### Carte conseiller
- Initiales · Nom · Code · Zone (préfecture · région) · Date de création
- **Copier** : copie le code dans le presse-papiers
- **✏️** : modifier l'préfecture
- **🗑** : supprimer (confirmation requise)

---

## Onglet 6 — Données

### Filtres
| Filtre | Options |
|---|---|
| Recherche texte | Nom, ID, email |
| Région | Toutes les régions présentes dans les données |
| Genre | Masculin / Féminin |
| Holland | R, I, A, S, E, C |

### Tri
- Colonnes triables : Nom, Date, Score emploi (clic sur l'en-tête de colonne)
- Ordre ascendant / descendant

### Colonnes du tableau
| Colonne | Description |
|---|---|
| Candidat | Initiales colorées + nom + ID |
| Holland | Deux types dominants |
| Score emploi | % employabilité (vert ≥ 65, orange ≥ 45, rouge < 45) |
| Région | Région du candidat |
| Date | Date d'inscription |
| Actions | Voir fiche · Rapport candidat · Rapport conseiller · Supprimer |

### Export CSV
- Bouton **Export CSV** en haut à droite
- Fichier : `CareerMap-Candidates.csv`
- Colonnes exportées : Prénom, Nom, ID, Email, Téléphone, Âge, Genre, Éducation, Situation, Région, Préfecture, Code, Holland, Emploi %, R, I, A, S, E, C, O, C2, E2, A2, N, Autonomie, Économique, Collaboration, Readiness

---

## Fiche candidat (modal)

Accessible depuis Vue d'ensemble ou Données — clic sur un candidat.

### En-tête
- Nom · Code · Région · Profil (âge + diplôme) · Date
- Programme INDH recommandé (01 / 02 / 03)

### Scores Holland
- Radar hexagonal RIASEC
- Barres de progression pour chaque type (R, I, A, S, E, C)

### Big Five
- Barres de progression (O, C, E, A, N)

### Employabilité
- Barres pour Autonomie, Économique, Collaboration, Readiness
- Score global en pourcentage

### Actions depuis la fiche
| Bouton | Action |
|---|---|
| 🎓 Candidat | Génère et affiche le rapport version candidat (PDF) |
| 🔒 Conseiller | Génère et affiche le rapport version conseiller (confidentiel) |
| 🏛 Rapport Orientation INDH | Rapport d'orientation spécifique INDH |
| 🗑 Supprimer | Supprime le candidat (confirmation requise) |

---

## Rapports PDF

Deux formats disponibles pour chaque candidat :

### Rapport Candidat
- Version destinée au bénéficiaire
- Couverture : fond dégradé sombre, logo CareerMap, nom, chips (code, région, préfecture si Casablanca-Settat, niveau, âge, date)
- Contenu : profil Holland, personnalité Big Five, scores d'employabilité, recommandations

### Rapport Conseiller
- Version confidentielle avec données détaillées supplémentaires
- Même couverture, contenu étendu pour usage professionnel

### Rapport Orientation INDH
- Spécifique au programme INDH
- Couverture identique aux autres rapports
- Contenu : programme recommandé (01/02/03), scores par critère INDH, orientations professionnelles

> **Téléchargement** : les rapports s'affichent en prévisualisation puis peuvent être téléchargés en PDF via le bouton dédié.

---

## Gestion des données (Firestore)

- Les candidats sont stockés dans la collection Firestore `candidates`
- Les conseillers sont stockés dans la collection Firestore `advisors`
- Toute modification (ajout, suppression, mise à jour d'un conseiller) est synchronisée en temps réel
- En mode hors-ligne, les données sont conservées dans `localStorage`

---

## Accès conseiller (rappel)

| Rôle | Code de connexion | Accès |
|---|---|---|
| Administrateur | `@adminyfadad` | Tableau de bord complet |
| Conseiller | `@nomADV` (généré auto) | Dashboard filtré sur sa zone |
| Candidat | Code alphanumérique | Formulaire + résultats personnels |

---

*CareerMap — Plateforme d'orientation professionnelle · INDH*
