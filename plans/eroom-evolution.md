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

## Ce qui reste à faire

### 1. Page projet avec multi-évaluation

La page `src/pages/projects/view.astro` doit :
- [x] Permettre de switcher entre types d'évaluation (déjà fait)
- [ ] Afficher le radar chart adapté à EROOM (6 axes au lieu de 4)
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
