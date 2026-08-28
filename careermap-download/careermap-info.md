# CareerMap — Plateforme d'Orientation Professionnelle

> Plateforme numérique d'évaluation et d'orientation professionnelle · Programme INDH Phase 3 · Maroc

---

## Qu'est-ce que CareerMap ?

CareerMap est une application web progressive (PWA) qui accompagne les bénéficiaires du programme INDH dans leur orientation professionnelle. Elle combine trois outils psychométriques reconnus pour produire un profil complet et des recommandations personnalisées.

L'application fonctionne entièrement sur mobile, tablette et ordinateur, et peut être installée comme une application native (sans passer par un store).

---

## Les trois rôles

| Rôle | Code d'accès | Description |
|---|---|---|
| **Candidat** | Code alphanumérique (ex : `AB123456`) | Passe les tests, reçoit ses résultats |
| **Conseiller** | `@nomADV` (attribué par l'admin) | Consulte les candidats de sa zone |
| **Administrateur** | Code admin | Gère tout : candidats, conseillers, statistiques |

---

## Les trois tests

### 1. Test Holland RIASEC
Identifie les intérêts professionnels selon 6 types de personnalité :

| Lettre | Type | Traits |
|---|---|---|
| **R** | Réaliste | Manuel, technique, concret |
| **I** | Investigateur | Analyse, recherche, curiosité intellectuelle |
| **A** | Artistique | Créativité, expression, originalité |
| **S** | Social | Relation d'aide, communication, empathie |
| **E** | Entrepreneur | Leadership, persuasion, ambition |
| **C** | Conventionnel | Organisation, précision, méthode |

Le test identifie les **deux types dominants** (ex : SE, RI, AC…) qui orientent vers des familles de métiers.

---

### 2. Test Big Five (Personnalité)
Évalue la personnalité sur 5 dimensions :

| Dimension | Description |
|---|---|
| **O** — Ouverture | Curiosité, créativité, goût pour la nouveauté |
| **C** — Conscience | Organisation, discipline, fiabilité |
| **E** — Extraversion | Sociabilité, énergie, assertivité |
| **A** — Agréabilité | Coopération, altruisme, confiance |
| **N** — Névrosisme | Sensibilité émotionnelle, stabilité |

Score de 0 à 100 pour chaque dimension.

---

### 3. Test d'Employabilité
Mesure le potentiel d'insertion professionnelle sur 4 axes :

| Axe | Description |
|---|---|
| **Autonomie** | Capacité à agir seul, initiative, auto-organisation |
| **Économique** | Compréhension du marché du travail, valeur ajoutée |
| **Collaboration** | Travail en équipe, communication, adaptabilité |
| **Readiness** | Préparation concrète à l'emploi (CV, projet, réseau) |

**Score global d'employabilité** calculé sur 100 % :
- ≥ 65 % → Profil fort ✅
- 45–64 % → Profil en développement 🟡
- < 45 % → Profil à renforcer 🔴

---

## Orientation INDH — 3 Programmes

Sur la base des résultats Holland, chaque candidat est orienté vers l'un des trois programmes INDH :

### Programme 01 — Insertion Professionnelle Salariée
> Profils dominants : R, S, C

Pour les candidats orientés vers le salariat structuré — entreprises, administrations, organisations. Compétences techniques ou relationnelles valorisables dans un poste existant.

**Exemples de métiers :** Agent administratif, Technicien, Commercial, Auxiliaire social, Assistant comptable

---

### Programme 02 — Auto-Emploi / Entrepreneuriat
> Profil dominant : E

Pour les candidats avec une appétence pour la prise de risque, la création, la gestion d'une activité indépendante.

**Exemples de métiers :** Artisan, Commerçant, Prestataire de services, Auto-entrepreneur numérique

---

### Programme 03 — Coopérative / Économie Sociale
> Profils dominants : I, A

Pour les candidats créatifs ou analytiques, à l'aise dans des structures collectives — coopératives, associations, projets culturels ou sociaux.

**Exemples de métiers :** Animateur culturel, Designer, Formateur associatif, Membre de coopérative artisanale

---

## Les rapports générés

Trois rapports PDF sont disponibles pour chaque candidat :

### Rapport Candidat 🎓
- Destiné au bénéficiaire
- Résultats complets des 3 tests
- Profil Holland illustré (radar RIASEC)
- Personnalité Big Five
- Score d'employabilité par axe
- Programme INDH recommandé

### Rapport Conseiller 🔒
- Version confidentielle pour usage professionnel
- Données détaillées et analyse approfondie
- Recommandations d'accompagnement

### Rapport Orientation INDH 🏛
- Centré sur l'orientation programmatique
- Programme recommandé (01, 02 ou 03)
- Critères INDH détaillés
- Profil du candidat adapté au contexte INDH

---

## Parcours candidat (étape par étape)

1. **Accueil** — Saisie du code d'accès
2. **Profil** — Renseignement des informations personnelles (nom, âge, région, niveau d'études, situation…)
3. **Test Holland RIASEC** — Questions à choix multiples sur les intérêts professionnels
4. **Test Big Five** — Questions sur les traits de personnalité
5. **Test d'Employabilité** — Questions sur la préparation à l'emploi
6. **Résultats** — Affichage du profil complet et téléchargement du rapport

---

## Couverture géographique

L'application couvre les **12 régions du Maroc** :

1. Tanger-Tétouan-Al Hoceïma
2. Oriental
3. Fès-Meknès
4. Rabat-Salé-Kénitra
5. Béni Mellal-Khénifra
6. **Casablanca-Settat** *(avec gestion par préfecture)*
7. Marrakech-Safi
8. Drâa-Tafilalet
9. Souss-Massa
10. Guelmim-Oued Noun
11. Laâyoune-Sakia El Hamra
12. Dakhla-Oued Ed-Dahab

Pour **Casablanca-Settat**, un découpage par **préfecture** est disponible pour affecter un conseiller à une zone spécifique.

---

## Espace Conseiller

Le conseiller accède à un tableau de bord filtré sur sa zone (région et/ou préfecture) :

- **Vue d'ensemble** : KPIs (candidats, bilans complets, taux féminin, score moyen)
- **Liste des candidats** : nom, profil Holland, score emploi, accès aux rapports
- **Recherche** : accès à tout candidat par code pour générer ses rapports

---

## Espace Administrateur

Accès complet à toutes les données et fonctionnalités :

- Statistiques globales en temps réel
- Gestion des conseillers (création, modification de préfecture, suppression)
- Export CSV de toutes les données
- Accès aux 3 rapports pour chaque candidat
- Filtres avancés : région, genre, profil Holland, période

---

## Fonctionnement technique

| Aspect | Détail |
|---|---|
| Type d'application | PWA (Progressive Web App) — installable sur mobile |
| Langues | Français · Arabe · Anglais |
| Base de données | Google Firestore (temps réel) |
| Hors-ligne | Données sauvegardées en localStorage |
| Rapports | Générés côté client (PDF via impression navigateur) |
| Accès | Navigateur web — aucune installation requise |

---

## Installation sur mobile

### Android
1. Ouvrir le site dans Chrome
2. Menu (⋮) → **Ajouter à l'écran d'accueil**
3. Confirmer → l'icône apparaît comme une application

### iPhone / iPad
1. Ouvrir le site dans Safari
2. Bouton partage (□↑) → **Sur l'écran d'accueil**
3. Confirmer → l'icône apparaît comme une application

---

## Niveaux d'études pris en charge

Sans diplôme · Primaire · Collège · Lycée · Baccalauréat · Technicien / Diplôme · Licence (Bac+3) · Master (Bac+5) · Doctorat

## Situations professionnelles

Lycéen(ne) · Étudiant(e) · Chercheur(se) d'emploi · Salarié(e) · Auto-entrepreneur(se) · Autre

---

*CareerMap · Programme INDH Phase 3 · Maroc · 2025–2026*
