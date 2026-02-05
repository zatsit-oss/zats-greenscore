# Plan : Intégration EROOM Optimization Framework

## Contexte

Ajout d'un second type d'évaluation (EROOM / EOF v1.1 de Boavizta) en plus de l'API Green Score existant.

## Ce qui a été fait

### 1. Renommage du scoring existant
- [x] `src/utils/scoring.ts` → `src/utils/apigreenscore-scoring.ts`
- [x] Mise à jour des imports dans `src/pages/audit.astro`
- [x] Mise à jour des imports dans `src/pages/projects/view.astro`

### 2. Création du scoring EROOM
- [x] Nouveau fichier `src/utils/eroom-scoring.ts` créé avec :
  - Types pour les réponses (StandardAnswer, EaseOfChangeAnswer, QuickDiagnosisAnswer)
  - Poids des impacts (Decisive=3, Significant=2, Moderate=1)
  - `calculateCategoryScore()` - Score par catégorie
  - `calculateQuickDiagnosisScore()` - Score catégorie 0 (non inclus dans global)
  - `calculateEroomGlobalScore()` - Moyenne des catégories 1-6
  - `getScoreInterpretation()` - Interprétation du score (0-25%, 25-50%, etc.)
  - `getEroomRanking()` - Ranking A-E basé sur le score

### 3. Modèle de données EROOM
- [x] Fichier `src/data/eroom-data-model.json` complet avec :
  - 7 catégories (0-6)
  - Poids par impact level
  - Règles de calcul détaillées
  - 3 types d'échelles d'évaluation

## Ce qui a été fait (session 2)

### 4. Types TypeScript EROOM
- [x] Créé `src/types/eroom.ts` avec :
  - Types `ImpactLevel`, `EvaluationScaleType`
  - Types de réponses (`StandardAnswer`, `EaseOfChangeAnswer`, `QuickDiagnosisAnswer`)
  - Constantes `STANDARD_ANSWER_OPTIONS`, `EASE_OF_CHANGE_OPTIONS` pour l'UI
  - Interfaces `EroomQuestion`, `EroomCategory`, `CategoryScore`
  - Helpers `getAnswerOptions()`, `getImpactLevelColor()`, `isQuickDiagnosis()`

### 5. Mise à jour evaluation.ts
- [x] Ajouté `EROOM = 'eroom'` à l'enum `EvaluationType`
- [x] Ajouté les métadonnées EROOM dans `EVALUATION_TYPES`

### 6. Composants d'audit EROOM
- [x] Créé `src/components/audit/eroom/EroomImpactBadge.astro` - Badge coloré selon l'impact
- [x] Créé `src/components/audit/eroom/EroomQuestion.astro` - Question avec sélecteur qualitative ou 1-5
- [x] Créé `src/components/audit/eroom/EroomSection.astro` - Section avec style différent pour Quick Diagnosis
- [x] Créé `src/components/audit/eroom/EroomStepper.astro` - Stepper compact avec icônes (7 catégories)

### 7. Page d'audit EROOM
- [x] Créé `src/pages/audit-eroom.astro` - Page dédiée pour l'audit EROOM
  - Utilise les composants EROOM
  - Scoring via `calculateEroomGlobalScore()`
  - Auto-save des réponses
  - Message de résultat adapté (score élevé = potentiel d'optimisation)

### 8. Navigation conditionnelle
- [x] Modifié `src/pages/projects/new.astro` - Redirige vers `/audit-eroom` si EROOM
- [x] Modifié `src/pages/projects/view.astro` - Bouton Edit redirige vers la bonne page

### 9. Radar chart adapté pour EROOM
- [x] Modifié `src/pages/projects/view.astro` pour supporter les deux types :
  - Import des données et fonctions EROOM
  - `getScoreDetails()` adapté pour EROOM (score élevé = potentiel d'optimisation)
  - Radar chart avec 6 catégories EROOM ou 4 sections API Green Score

## Tâches terminées (session 3)

### Bug 1: Score label incorrect pour EROOM ✅
**Fichiers modifiés** :
- `src/types/evaluation.ts` - Ajout de `shortName` dans `EvaluationTypeInfo`
- `src/pages/projects/view.astro` - Ajout de `id="scoreTitle"` et mise à jour dynamique

**Résultat** :
- API Green Score → "Current GreenScore"
- EROOM → "Current EROOM Score"

### Bug 2: Filtre dashboard - "All evaluations" ✅
**Fichiers modifiés** :
- `src/pages/index.astro` - Option "All evaluations" ajoutée, script adapté pour `null`
- `src/utils/ui.ts` - `loadProjects()` accepte `EvaluationType | null`
- `src/services/dashboard.ts` - Nouvelle fonction `getAllProjectsWithAnyEvaluation()`, ajout de `evaluationType` dans `ProjectWithEvaluation`

**Résultat** :
- Option "All evaluations" en première position
- Affiche tous les projets quel que soit leur type d'évaluation
- Score moyen calculé sur tous les projets complétés

### Feature 3: Suppression de projet ✅
**Fichiers modifiés** :
- `src/services/project-service.ts` - **Nouveau** : Service mutualisé (architecture hexagonale)
- `src/pages/projects/view.astro` - Bouton Delete + modal, utilise le service
- `src/pages/index.astro` - Modal de confirmation pour le dashboard
- `src/components/ProjectCard.astro` - Bouton corbeille sur chaque carte
- `src/utils/ui.ts` - Callback `onDelete` pour les cartes
- `src/styles/global.css` - Style `btn-danger`

**Résultat** :
- Bouton corbeille sur chaque carte du dashboard
- Bouton corbeille dans la vue détaillée du projet
- Modal de confirmation avec nom du projet
- Architecture hexagonale : UI -> Service -> Storage (prêt pour migration API)

---

## Ce qui reste à faire (plus tard)

### 1. Page projet avec multi-évaluation

La page `src/pages/projects/view.astro` doit :
- [x] Permettre de switcher entre types d'évaluation (déjà fait)
- [x] Afficher le radar chart adapté à EROOM (6 axes au lieu de 4)
- [ ] Adapter l'interprétation du score (EROOM = score élevé = potentiel d'amélioration)

### 6. Radar Chart adapté

Le radar chart EROOM utilise 6 axes :
- Product
- Architecture
- Infrastructure
- Storage & Data
- Algo & Code
- Ease of change

## Différences clés API Green Score vs EROOM

| Aspect | API Green Score | EROOM |
|--------|-----------------|-------|
| Type de réponse | Binaire (oui/non) + formules | Qualitatif (5 options) ou numérique (1-5) |
| Nombre de sections | 4 | 7 (dont 1 exclue du score) |
| Calcul du score | Somme de points | % d'amélioration identifiée |
| Interprétation | Score haut = bon | Score haut = potentiel d'amélioration |
| Radar axes | Architecture, Design, Usage, Logs | Product, Architecture, Infrastructure, Storage & Data, Algo & Code, Ease of change |

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/utils/apigreenscore-scoring.ts` | Renommé (fait) |
| `src/utils/eroom-scoring.ts` | Créé (fait) |
| `src/data/eroom-data-model.json` | Créé par user |
| `src/types/evaluation.ts` | Modifier - ajouter EROOM |
| `src/types/eroom.ts` | Créer |
| `src/pages/audit.astro` | Modifier - conditionnel |
| `src/pages/projects/view.astro` | Modifier - radar EROOM |
| `src/components/audit/eroom/*.astro` | Créer |
| `src/components/RadarChart.astro` | Adapter pour 6 axes |

## Décisions prises

1. **Catégorie 0 (Quick Diagnosis)** :
   - **Décision** : Afficher en première section "préparatoire" avec un style différencié
   - Bandeau explicatif indiquant que cette section n'entre pas dans le score final
   - Style visuel distinct (couleur différente, icône spéciale)
   - **À valider** : on essaie comme ça et on ajuste si besoin

2. **Stockage des réponses** : Le format `answers` actuel (`Record<string, boolean | string | number>`) fonctionne pour les valeurs qualitatives comme `'improvement_potential'` (ce sont des strings).

## Questions en suspens

1. **Export des résultats** : Faut-il un format d'export spécifique pour EROOM ?

## Estimation de travail

1. Types TypeScript : ~30 min
2. Composants audit EROOM : ~2h
3. Page audit conditionnelle : ~1h
4. Adaptation radar chart : ~30 min
5. Tests et ajustements : ~1h

**Total estimé : ~5h**

---

## Session 4 - Corrections et Qualité

### Bug 4: Dashboard mélange les scores de différents types ✅
**Problème** : Quand "All evaluations" est sélectionné, le dashboard calculait une moyenne de scores de différents types d'évaluation (échelles incompatibles).

**Fichiers modifiés** :
- `src/services/dashboard.ts` - `DashboardStats.avgScore` peut être `null`, ajout de `isAverageScoreMeaningful`
- `src/utils/ui.ts` - Affiche "-" quand le score moyen n'est pas significatif, `aria-label` explicatif

**Résultat** :
| Filtre | Score moyen | Graphique |
|--------|-------------|-----------|
| All evaluations | "-" | Masqué |
| API Green Score | Calculé | Affiché |
| EROOM | Calculé | Affiché |

### Bug 5: Bouton "Edit Evaluation" ne respecte pas le type sélectionné ✅
**Problème** : Dans la vue projet, changer le type d'évaluation puis cliquer sur "Edit" redirigeait vers l'ancien type.

**Fichiers modifiés** :
- `src/pages/projects/view.astro` - Récupération du bouton via `getElementById` à chaque changement au lieu d'une référence statique

### Feature 4: Validation EROOM - questions obligatoires ✅
**Problème** : Le statut passait à "Completed" même si des questions n'étaient pas répondues.

**Fichiers modifiés** :
- `src/utils/eroom-scoring.ts` - Nouvelle fonction `validateEroomCompletion()` avec `EroomValidationResult`
- `src/pages/audit-eroom.astro` - Validation avant soumission, statut "In Progress" si incomplet

**Résultat** :
- Questions répondues partiellement → status "In Progress", message "X questions remaining"
- Toutes les questions répondues → status "Completed", score affiché

### Audit Accessibilité & Responsive Design ✅
**Objectif** : Améliorer l'accessibilité (a11y) et le responsive design de toute l'application.

**Fichiers modifiés** :
- `src/layouts/Layout.astro` - Suppression Google Fonts (éco-design)
- `src/styles/global.css` - Passage aux polices système
- `src/components/audit/AuditNavigation.astro` - `<nav>` sémantique, `aria-label`, focus visible
- `src/components/audit/AuditStepper.astro` - Version mobile ajoutée (barre de progression)
- `src/pages/audit.astro` - Script adapté pour stepper mobile
- `src/components/audit/AuditQuestion.astro` - Labels anglais, `aria-describedby` sur inputs
- `src/components/audit/eroom/EroomQuestion.astro` - `aria-expanded` sur accordéons
- `src/components/ProjectCard.astro` - `aria-label` sur bouton delete, focus visible
- `src/pages/index.astro` - Modal avec `role="dialog"`, focus trap, gestion Escape

**Améliorations** :
- Plus de fonts externes (éco-design respecté)
- Navigation clavier complète sur les modals
- Stepper API Green Score responsive sur mobile
- Screen readers : meilleure expérience avec aria-labels

---

### Bug 6: Carte projet redirigeait vers audit au lieu de vue projet ✅
**Problème** : Cliquer sur un projet non terminé redirigeait vers l'audit, empêchant de démarrer une autre évaluation.

**Fichiers modifiés** :
- `src/utils/ui.ts` - Toujours rediriger vers `/projects/view`

**Résultat** : Depuis la page projet, on peut voir la synthèse partielle et démarrer une autre évaluation.

---

## Session 5 - Multi-scores sur carte projet

### Feature 5: Afficher les deux scores sur la carte projet ✅
**Objectif** : Sur la carte du dashboard, afficher le score GreenScore ET le score EROOM quand les deux sont complétés.

**Fichiers modifiés** :
- `src/services/dashboard.ts` - Nouveau type `EvaluationSummary`, ajout de `allEvaluations` dans `ProjectWithEvaluation`
- `src/components/ProjectCard.astro` - Nouveau design compact avec badges pour chaque type d'évaluation
- `src/utils/ui.ts` - Nouvelle fonction `getScoreColor()`, `populateCard()` affiche tous les scores complétés
- `src/pages/index.astro` - Simplifié à un seul template de carte

**Résultat** :
- Chaque carte affiche un badge par évaluation complétée (GS et/ou EROOM)
- Les couleurs sont adaptées au type d'évaluation (EROOM inversé)
- Badge "pending" affiché seulement si aucune évaluation n'est complétée

---

## État actuel (session 5 - terminée)

### ✅ Tâches terminées

1. **Bug 1** : Score label adapté ("GreenScore" / "EROOM Score") ✅
2. **Bug 2** : Filtre "All evaluations" sur le dashboard ✅
3. **Feature 3** : Suppression de projet complète ✅
4. **Bug 4** : Dashboard ne mélange plus les scores incompatibles ✅
5. **Bug 5** : Bouton "Edit Evaluation" respecte le type sélectionné ✅
6. **Feature 4** : Validation EROOM - questions obligatoires ✅
7. **Audit A11y & Responsive** : Application complète ✅
8. **Bug 6** : Carte projet redirige vers vue projet ✅
9. **Feature 5** : Afficher les deux scores sur la carte projet ✅
