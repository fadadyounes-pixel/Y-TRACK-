# CareerMap Admin — Tableau de bord

**URL** : `https://careermaponline.org/admin.html`  
**Rôle** : Superviseur / INDH National

---

## Accès et interface

Le tableau de bord est autonome — aucune connexion serveur requise. Les données sont générées côté client avec un générateur pseudo-aléatoire à graine fixe (reproductible).

### Contrôles globaux (bandeau supérieur)

| Contrôle | Fonction |
|---|---|
| **Échantillon** | Curseur 12–120 : ajuste la taille du jeu de données simulé |
| **Période** | Filtre temporel : 7 jours / 30 jours / 90 jours / Tout |

### KPIs (barre principale)

| Indicateur | Couleur | Description |
|---|---|---|
| INSCRITS | Cyan | Candidats sur la période sélectionnée |
| BILANS COMPLETS | Vert | Candidats ayant terminé tous les tests + taux de complétion |
| RAPPORTS PDF | Violet | Rapports téléchargés |
| CONSEILLERS ACTIFS | Or | Conseillers actifs / total |
| ALERTES ROUGES | Rouge | Candidats à risque triple — intervention urgente |
| RÉGIONS | Orange | Nombre de régions couvertes sur 12 |

---

## Onglets

### Vue d'ensemble
- **Inscriptions par semaine** — sparkline sur 13 semaines
- **Entonnoir de complétion** — Inscrits → Tests commencés → Bilans complets → Rapports téléchargés
- **Genre** — donut Masculin / Féminin
- **Répartition INDH** — donut 01 Insertion / 02 Auto-Emploi / 03 Coopérative

### Démographie
- Répartition par **âge** (tranches : <18, 18–22, 23–27, 28–35, 35+)
- **Langue d'interface** — FR / AR / EN
- **Niveau d'éducation** (10 niveaux : Sans instruction → Doctorat)
- **Top régions** (8 premières)
- **Casablanca-Settat** — détail par préfecture (8 préfectures)

### Tests & Scores
- **Complétion par test** — Holland RIASEC, Big Five OCEAN, Skill Up, EQ-Map, EntreMap, ResiMap
- **Type dominant RIASEC** — distribution R / I / A / S / E / C
- **Profil RIASEC moyen** — radar hexagonal + scores moyens
- **EQ-Map** — moyennes Auto-conscience, Empathie, Usage des émotions, Régulation
- **ResiMap** — distribution Faible (<30) / Modéré (30–42) / Haute (43+)
- **EntreMap** — intention entrepreneuriale Faible / Modérée / Forte

### INDH
- **Répartition programmes** — 01 Insertion professionnelle / 02 Auto-Emploi / 03 Coopérative
- **Alertes cliniques** :
  - 🔴 **Triple risque** — ResiMap <30 ET EQ total <35 — intervention urgente
  - 🟠 **Risque d'abandon** — ResiMap <30 — suivi renforcé
  - 🟢 **Profils positifs** — ROBUST\_ENTREPRENEUR ou IDEAL\_INSERTION — à prioriser
- **Tableau régional** — répartition INDH par région (top 6)

### Conseillers
- KPIs : total / actifs / inactifs / candidats par conseiller (moyenne)
- **Alerte** si un conseiller actif n'a aucun candidat assigné
- **Tableau détail** : conseiller, région, candidats inscrits, rapports ouverts, statut (Actif / Inactif)

Conseillers actifs (6) : `@BenaliADV`, `@ElAmraniADV`, `@ZahraoiADV`, `@CherkaoiADV`, `@MansouriADV`, `@ElIdrissiADV`  
Conseillers inactifs (2) : `@BouazzaADV`, `@HaddouADV`

### Données
- **Recherche** par code candidat ou nom
- **Filtres** : région, genre, programme INDH, niveau d'alerte
- **Tri** par âge, date, EQ, ResiMap (clic sur en-tête de colonne)
- Affichage limité à **100 enregistrements** visibles
- **Exporter CSV** — exporte l'intégralité des candidats (tous filtres appliqués) avec les colonnes : Code, Nom, Âge, Genre, Région, Préfecture, Niveau, Date, RIASEC, EQ, Resi, INDH, Alerte, Conseiller

---

## Structure des données candidat

| Champ | Type | Valeurs |
|---|---|---|
| `code` | string | CM0001 – CM0120 |
| `name` | string | Prénom Nom |
| `age` | number | 16–45 |
| `gender` | string | M / F |
| `region` | string | 12 régions du Maroc |
| `prefecture` | string | Casablanca uniquement (8 préfectures) |
| `edu` | number | 0–9 (Sans instruction → Doctorat) |
| `lang` | string | fr / ar / en |
| `date` | string | ISO YYYY-MM-DD |
| `started` | boolean | Tests commencés |
| `completed` | boolean | Bilan complet |
| `scores.riasec` | object | R,I,A,S,E,C → 5–100 |
| `scores.eq` | object | 4 sous-scores + total |
| `scores.entremap` | number | 0–100 |
| `scores.skillup` | number | 0–100 |
| `scores.ocean` | object | O,C,E,A,N → 5–100 |
| `scores.resimap` | number | 0–60 (complets uniquement) |
| `indhRoute` | string | 01 / 02 / 03 (complets uniquement) |
| `flags` | array | TRIPLE\_RISK, DROPOUT\_RISK, ROBUST\_ENTREPRENEUR, IDEAL\_INSERTION |
| `advisorCode` | string | @CodeADV |
| `reportDownloaded` | boolean | Rapport PDF téléchargé |
| `domRiasec` | string | Type Holland dominant |

---

## Logique des alertes

```
TRIPLE_RISK        → resimap < 30 ET eqTotal < 35
DROPOUT_RISK       → resimap < 30 (sans triple risque)
ROBUST_ENTREPRENEUR → resimap ≥ 43 ET entremap ≥ 60
IDEAL_INSERTION    → probabilité insertion ≥ 55 %
```

## Logique de routage INDH

```
01 Insertion     → probabilité emploi salarié la plus élevée
02 Auto-Emploi   → probabilité projet entrepreneurial la plus élevée
03 Coopérative   → probabilité coopérative la plus élevée
```
