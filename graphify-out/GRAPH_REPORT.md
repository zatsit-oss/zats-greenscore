# Graph Report - zats-greenscore  (2026-10-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 671 nodes · 1182 edges · 40 communities (33 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `31153c83`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- project.ts
- index.astro
- evaluation-service.ts
- eroom-scoring.ts
- view.astro
- properties
- audit-eroom.astro
- audit-apigreenscore.astro
- Layout.astro
- ui.ts
- eroom-data-model-1-1.json
- properties
- project-service.ts
- package.json
- tauri.conf.json
- scripts
- rules
- devDependencies
- rules
- impactLevels
- quickDiagnosis
- scale
- @playwright/test
- calculation
- easeOfChange
- scoring
- default.json
- dependencies
- tsconfig.json
- verify_scoring.js
- hard_to_change
- improvement_potential
- not_applicable
- strength_confirmed
- deploy-cellar.sh
- ScoreBadge.astro
- app

## God Nodes (most connected - your core abstractions)
1. `EvaluationType` - 26 edges
2. `Project` - 22 edges
3. `getProject()` - 19 edges
4. `Evaluation` - 18 edges
5. `ProjectRanking` - 16 edges
6. `vitest` - 16 edges
7. `EvaluationStatus` - 15 edges
8. `scripts` - 15 edges
9. `saveProject()` - 13 edges
10. `getAllProjects()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `EvaluationSummary` --references--> `EvaluationType`  [EXTRACTED]
  src/services/dashboard.ts → src/types/evaluation.ts
- `ProjectsExport` --references--> `Project`  [EXTRACTED]
  src/services/project-transfer-service.ts → src/types/project.ts
- `loadAnswers()` --calls--> `getProject()`  [EXTRACTED]
  src/pages/audit-apigreenscore.astro → src/services/project-service.ts
- `hasPreliminaryScore` --calls--> `getProject()`  [EXTRACTED]
  src/pages/audit-eroom.astro → src/services/project-service.ts
- `loadAnswers()` --calls--> `getProject()`  [EXTRACTED]
  src/pages/audit-eroom.astro → src/services/project-service.ts

## Import Cycles
- None detected.

## Communities (40 total, 7 thin omitted)

### Community 0 - "project.ts"
Cohesion: 0.05
Nodes (48): vitest, evaluationTypes, descriptions, evalDescription, evalSelect, evaluationTypes, form, AuditData (+40 more)

### Community 1 - "index.astro"
Cohesion: 0.06
Nodes (53): Props, BarDataPoint, Props, cancelConflictBtn, cancelDeleteBtn, cancelImportBtn, closeDeleteModal(), closeModal() (+45 more)

### Community 2 - "evaluation-service.ts"
Cohesion: 0.08
Nodes (44): updateEvaluationDisplay(), ChartDataPoint, computePreliminaryScore(), EroomFinalizeResult, finalizeApiGreenScoreEvaluation(), finalizeEroomEvaluation(), FinalizeResult, getApiGreenScoreDetails() (+36 more)

### Community 3 - "eroom-scoring.ts"
Cohesion: 0.07
Nodes (34): colors, Props, answerOptions, Props, Props, AnswerOption, CategoryScore, EASE_OF_CHANGE_OPTIONS (+26 more)

### Community 4 - "view.astro"
Cohesion: 0.06
Nodes (29): Props, RadarDataPoint, cancelDeleteBtn, chartCard, chartTitleEl, confirmDeleteBtn, deleteBtn, deleteModal (+21 more)

### Community 5 - "properties"
Cohesion: 0.06
Nodes (32): type, format, type, format, type, properties, type, maximum (+24 more)

### Community 6 - "audit-eroom.astro"
Cohesion: 0.07
Nodes (29): auditForm, auditSteps, categories, collectAnswers(), hasPreliminaryScore, introModal, introModalClose, isAnswered() (+21 more)

### Community 7 - "audit-apigreenscore.astro"
Cohesion: 0.07
Nodes (24): ApiGreenScoreQuestionData, Props, AuditStep, Props, auditForm, auditSteps, collectAnswers(), evaluationType (+16 more)

### Community 8 - "Layout.astro"
Cohesion: 0.10
Nodes (16): themeToggle, menuBtn, mobileMenu, Props, theme, evaluationTypes, colorClasses, TextPart (+8 more)

### Community 9 - "ui.ts"
Cohesion: 0.16
Nodes (19): date, Props, buildEvaluationsSummary(), ChartDataPoint, DashboardStats, EvaluationSummary, getAllProjectsWithAnyEvaluation(), getChartData() (+11 more)

### Community 10 - "eroom-data-model-1-1.json"
Cohesion: 0.08
Nodes (23): categories, description, evaluationResponse, description, type, license, licenseUrl, modifications (+15 more)

### Community 11 - "properties"
Cohesion: 0.09
Nodes (23): maximum, minimum, type, maximum, minimum, type, properties, type (+15 more)

### Community 12 - "project-service.ts"
Cohesion: 0.23
Nodes (18): deleteProject(), ensureStorageMigrated(), updateProjectEvaluation(), CURRENT_STORAGE_VERSION, StorageKeys, LEGACY_COMPLETED, LEGACY_IN_PROGRESS, PROJECTS (+10 more)

### Community 13 - "package.json"
Cohesion: 0.13
Nodes (15): description, name, private, version, astro, eslint, @eslint/js, eslint-plugin-astro (+7 more)

### Community 14 - "tauri.conf.json"
Cohesion: 0.11
Nodes (17): app, security, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist, bundle (+9 more)

### Community 15 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, astro, build, build:desktop, deploy:cellar, dev, dev:desktop, lint (+7 more)

### Community 16 - "rules"
Cohesion: 0.17
Nodes (12): standard, contributesToScore, description, excludeFromMax, evaluation_in_progress, to_evaluate, description, maxScorePerQuestion (+4 more)

### Community 17 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, @eslint/js, eslint-plugin-astro, @playwright/test, @tauri-apps/cli, @types/node, typescript-eslint (+3 more)

### Community 18 - "rules"
Cohesion: 0.18
Nodes (11): easeOfChange, description, rules, contributesToScore, description, scoreValue, contributesToScore, description (+3 more)

### Community 19 - "impactLevels"
Cohesion: 0.20
Nodes (10): description, weight, Decisive, Moderate, Significant, impactLevels, description, weight (+2 more)

### Community 20 - "quickDiagnosis"
Cohesion: 0.22
Nodes (9): quickDiagnosis, standard, metadata, evaluationScales, max, min, type, options (+1 more)

### Community 21 - "scale"
Cohesion: 0.25
Nodes (8): highPercentage, lowPercentage, scale, interpretation, 0-25%, 25-50%, 50-75%, 75-100%

### Community 23 - "calculation"
Cohesion: 0.33
Nodes (6): quickDiagnosis, description, rules, interpretation, scoreRange, calculation

### Community 24 - "easeOfChange"
Cohesion: 0.33
Nodes (6): maximum, minimum, options, type, easeOfChange, easeOfChange

### Community 25 - "scoring"
Cohesion: 0.33
Nodes (6): scoring, categoryScore, description, formula, globalScore, referenceImplementation

### Community 26 - "default.json"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 27 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, astro, tailwindcss, @tailwindcss/vite, @tauri-apps/api

### Community 28 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): astro/tsconfigs/strict, exclude, extends, include

### Community 29 - "verify_scoring.js"
Cohesion: 0.40
Nodes (3): xlsx, fs, xlsx

### Community 30 - "hard_to_change"
Cohesion: 0.50
Nodes (4): contributesToScore, description, scoreValue, hard_to_change

### Community 31 - "improvement_potential"
Cohesion: 0.50
Nodes (4): contributesToScore, description, scoreValue, improvement_potential

### Community 32 - "not_applicable"
Cohesion: 0.50
Nodes (4): contributesToScore, description, excludeFromMax, not_applicable

### Community 33 - "strength_confirmed"
Cohesion: 0.50
Nodes (4): strength_confirmed, contributesToScore, description, scoreValue

## Knowledge Gaps
- **327 isolated node(s):** `EvaluationTypeInfo`, `AuditAnswers`, `LegacyProjectInProgress`, `Props`, `BarDataPoint` (+322 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 380 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `metadata` connect `quickDiagnosis` to `scoring`, `eroom-data-model-1-1.json`, `impactLevels`, `scale`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **What connects `EvaluationTypeInfo`, `AuditAnswers`, `LegacyProjectInProgress` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `project.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0517503805175038 - nodes in this community are weakly interconnected._
- **Why does `evaluationResponse` connect `eroom-data-model-1-1.json` to `properties`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.055299539170506916 - nodes in this community are weakly interconnected._
- **Why does `properties` connect `properties` to `eroom-data-model-1-1.json`, `properties`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Should `evaluation-service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08270676691729323 - nodes in this community are weakly interconnected._