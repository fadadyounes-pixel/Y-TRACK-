# CareerMap — Tableau de Bord Conseiller

> Accès : code `@nomADV` (généré par l'administrateur) · Rôle : Conseiller

---

## Connexion

1. Ouvrir l'application CareerMap
2. Sélectionner le rôle **Conseiller**
3. Entrer le code d'accès conseiller (format `@nomADV`)
4. Le tableau de bord filtré sur votre zone s'affiche

---

## Zone affectée

Chaque conseiller est associé à une zone géographique définie par l'administrateur :

| Champ | Description |
|---|---|
| **Région** | L'une des 12 régions du Maroc |
| **Préfecture** | Pour Casablanca-Settat : l'une des 10 préfectures (optionnel) |

La zone est affichée sous le nom du conseiller dans l'en-tête : `Zone : <Préfecture> · <Région>`

**Portée du filtre :**
- Si une **région** est assignée : seuls les candidats de cette région sont visibles
- Si une **préfecture** est assignée : seuls les candidats de cette préfecture sont visibles
- Sans zone assignée : tous les candidats sont visibles

---

## Structure générale

Le tableau de bord dispose de **2 onglets** :

| Onglet | Contenu |
|---|---|
| **Vue d'ensemble** | KPIs, liste des candidats de la zone |
| **Recherche** | Recherche d'un candidat par son code |

---

## En-tête

L'en-tête affiche :
- Le titre **Espace Conseiller**
- Le **nom du conseiller** connecté
- La **zone affectée** (`Préfecture · Région` ou `Toutes régions`)

---

## Onglet 1 — Vue d'ensemble

### Barre de KPIs

4 indicateurs affichés en grille 2×2 :

| Indicateur | Description |
|---|---|
| **Bénéficiaires** | Nombre total de candidats dans la zone |
| **Bilans complets** | Candidats ayant terminé les 3 tests avec score emploi ≥ 45 % |
| **Participation F.** | Pourcentage de candidatures féminines |
| **Moy. Emploi** | Moyenne du score d'employabilité (%) |

### Liste des candidats

- Affiche uniquement les candidats de la zone du conseiller
- **Champ de recherche** : filtrage par nom ou identifiant (ID)
- Tri automatique par date d'inscription (du plus récent au plus ancien)

**Pour chaque candidat :**

| Élément | Description |
|---|---|
| Initiales colorées | Couleur basée sur le type Holland dominant |
| Nom | Nom complet du candidat |
| ID | Identifiant alphanumérique (format monospace) |
| Types Holland | Deux types dominants (ex. : `RI`, `SC`) |
| Score emploi | Pourcentage d'employabilité (vert ≥ 65 %, orange ≥ 45 %, rouge < 45 %) |
| Bouton **Rpt** | Ouvre le rapport candidat |
| Bouton **INDH** | Ouvre le rapport orientation INDH |

Si aucun candidat n'est présent dans la zone : message *« Aucun candidat dans votre zone. »*

---

## Onglet 2 — Recherche

Permet de retrouver un candidat en dehors de la liste filtrée par zone, via son code d'accès.

### Utilisation

1. Entrer le code du candidat (format `RPT-AB12` ou ID direct)
2. Appuyer sur **Entrée** ou cliquer **Chercher**
3. La fiche du candidat s'affiche si le code est trouvé

### Fiche candidat (résultat de recherche)

- Nom et identifiant du candidat
- 3 boutons d'action :

| Bouton | Action |
|---|---|
| 🎓 **Rapport Candidat** | Rapport version bénéficiaire |
| 🔒 **Rapport Conseiller** | Rapport version conseiller (confidentiel) |
| 🏛 **Rapport Orientation INDH** | Rapport spécifique INDH |

En cas de code introuvable : message d'erreur *« Code introuvable. »*

---

## Rapports disponibles

Le conseiller peut générer 3 types de rapports pour chaque candidat :

### Rapport Candidat
- Version destinée au bénéficiaire
- Couverture : logo CareerMap, nom, chips (code, région, préfecture si Casablanca-Settat, niveau, âge, date)
- Contenu : profil Holland, personnalité Big Five, scores d'employabilité, recommandations

### Rapport Conseiller
- Version confidentielle avec données détaillées supplémentaires
- Même couverture, contenu étendu pour usage professionnel

### Rapport Orientation INDH
- Spécifique au programme INDH
- Contenu : programme recommandé (01/02/03), scores par critère INDH, orientations professionnelles

> **Téléchargement** : les rapports s'affichent en prévisualisation puis peuvent être téléchargés en PDF.

---

## Informations techniques

| Paramètre | Valeur |
|---|---|
| Stockage | Firestore (collection `candidates` et `advisors`) |
| Filtrage | `useMemo` — région + préfecture du conseiller |
| Mode hors-ligne | Données conservées dans `localStorage` |

---

## Accès et rôles (rappel)

| Rôle | Code de connexion | Accès |
|---|---|---|
| Administrateur | `@adminyfadad` | Tableau de bord complet (tous candidats) |
| Conseiller | `@nomADV` (généré auto) | Dashboard filtré sur sa zone uniquement |
| Candidat | Code alphanumérique | Formulaire + résultats personnels |

---

*CareerMap — Plateforme d'orientation professionnelle · INDH*
