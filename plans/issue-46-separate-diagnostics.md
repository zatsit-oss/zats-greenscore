# Plan : Issue #46 — Séparer diagnostic rapide et diagnostic avancé

## Contexte

L'audit EROOM a 2 niveaux : catégorie 0 (Quick Diagnosis, 1-5) et catégories 1-6 (Advanced Diagnosis, qualitatif). Actuellement, seul le score avancé est stocké et affiché. `calculateQuickDiagnosisScore()` existe déjà mais n'est jamais appelé dans le flux de sauvegarde.

**Objectif** : afficher les deux scores séparément sur la page projet, avec un message de recommandation pour le diagnostic rapide. L'approche doit être **générique** pour supporter d'autres types d'évaluation avec étape préliminaire à l'avenir.

## Architecture : étape préliminaire générique

### Configuration dans `EVALUATION_TYPES` (`src/types/evaluation.ts`)

Chaque type d'évaluation peut déclarer une étape préliminaire via sa config :

```typescript
preliminary?: {
    label: string;                // "Quick Diagnosis" pour EROOM
    blocking: boolean;            // true = score minimal requis pour continuer
    minScore?: number;            // seuil minimal (utilisé si blocking: true)
    thresholds: { low: number; high: number };
    recommendations: {
        low: string;              // score ≤ low
        medium: string;           // low < score ≤ high
        high: string;             // score > high
    };
}
```

`blocking: false` → l'utilisateur peut toujours passer aux étapes avancées. Si un futur type d'évaluation a `blocking: true` avec `minScore: 40`, l'UI empêchera de continuer si le score préliminaire est en dessous.

## Ce qui a été fait

### 1. `src/types/evaluation.ts` — Types et config ✅

- Interface `PreliminaryConfig` avec `label`, `blocking`, `minScore?`, `thresholds`, `recommendations`
- `preliminary?: PreliminaryConfig` dans `EvaluationTypeInfo`
- `preliminaryScore?: number | null` dans `Evaluation`
- Config EROOM : `blocking: false`, seuils 25/50

### 2. `src/services/evaluation-service.ts` — Score préliminaire ✅

- `computePreliminaryScore()` : trouve la catégorie 0 et calcule le score
- `saveEroomPreliminaryScore()` : sauvegarde explicite du score préliminaire (appelée uniquement depuis "Quick Evaluate", pas depuis l'auto-save)
- `finalizeEroomEvaluation()` : sauvegarde aussi le `preliminaryScore`

### 3. `src/services/project-view-service.ts` — Données d'affichage ✅

- Interface `PreliminaryDisplayData` avec score, details, label, recommendation, blocking, blocked
- `buildPreliminaryDisplayData()` : lit la config du type d'évaluation (générique)
- `getPreliminaryRecommendation()` : génère la recommandation selon les seuils
- `getEvaluationDisplayData()` retourne `preliminary: PreliminaryDisplayData | null`
- `scoreTitle` adapté : "Advanced Diagnosis Score" quand une étape préliminaire existe

### 4. `src/pages/projects/view.astro` — Affichage dual ✅

- Carte Quick Diagnosis au-dessus de la carte Advanced (cercle w-24, `role="region"`, `aria-labelledby`)
- Carte masquée par défaut, visible si `preliminaryScore !== null`
- Titre du radar chart adapté dynamiquement

### 5. `src/pages/audit-eroom.astro` — UX du flux d'audit ✅

- **Modale d'intro** au chargement : explique l'échelle 1-5, bouton "Start Quick Diagnosis"
- **Bouton "Quick Evaluate"** au lieu de "Next" au step 0
- **Modale de résultat** : score en cercle coloré, recommandation, choix "Back to Project" / "Continue Advanced Diagnosis"
- Modale ne réapparaît plus si `preliminaryScore` déjà sauvegardé (démarre au step 1)

### 6. `src/utils/eroom-scoring.ts` — Formule corrigée ✅

- Formule alignée avec l'Excel EROOM officiel : `sum(5 - answer) / (totalQuestions × 4) × 100`
- Correspond à `(1 - (answer-1)/4) × weight` de l'Excel (tous poids à 1.0)
- Unanswered = 0 potentiel (comme l'Excel)

### 7. Tests mis à jour ✅

- Tests de `calculateQuickDiagnosisScore` adaptés à la nouvelle formule
- 2 tests ajoutés : score max (tout à 1 → 100%) et score min (tout à 5 → 0%)
- 167 tests passent

## Ce qui ne change PAS

- `src/components/RadarChart.astro` — Reçoit ses données, pas concerné
- Dashboard (`index.astro`) — Le score préliminaire n'est pas affiché sur les cartes
- API Green Score — Pas de `preliminary` dans sa config, rien ne change

## Ce qui reste à faire

- [ ] Tests manuels approfondis (différents scénarios de scoring)
- [ ] Vérifier le rendu responsive des modales et de la carte Quick Diagnosis
- [ ] Vérifier le comportement avec des évaluations existantes en localStorage (rétrocompatibilité)
