# Fonctionnalité : Système de scoring

## Description

Le système de scoring calcule en temps réel le score d'éco-conception basé sur les réponses au questionnaire.

## Algorithme de calcul

### Étape 1 : Calcul des points par question

Pour chaque question répondue :

```typescript
function calculateQuestionPoints(question: SurveyQuestion, answer: Answer): number {
  if (typeof answer === 'boolean') {
    // Question booléenne : points si true, 0 sinon
    return answer ? question.points : 0
  }

  if (typeof answer === 'number' && question.formula) {
    // Question avec formule : évaluation de la formule
    // Ex: "(x * 50) - 50" avec x = valeur saisie
    return evaluateFormula(question.formula, answer)
  }

  return 0
}
```

### Étape 2 : Calcul du score global

```typescript
function calculateScore(answers: Record<string, Answer>): number {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const earnedPoints = questions.reduce((sum, q) => {
    const answer = answers[q.id]
    return sum + calculateQuestionPoints(q, answer)
  }, 0)

  return (earnedPoints / totalPoints) * 100
}
```

### Étape 3 : Attribution du ranking

```typescript
function getRanking(score: number): Ranking {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  if (score >= 20) return 'D'
  return 'E'
}
```

## Distribution des points

### Par section

| Section | Points totaux | % du score |
|---------|---------------|------------|
| Architecture | 1 500 | ~28% |
| Design | 2 400 | ~45% |
| Usage | 1 500 | ~28% |
| Logs | 600 | ~11% |

*Note : Les pourcentages sont approximatifs car certaines questions ont des formules.*

### Par niveau d'impact

| Niveau | Points | Questions |
|--------|--------|-----------|
| Très élevé | 600 | DE01, LO01 |
| Élevé | 375-480 | AR01-AR04, DE03, US06 |
| Moyen | 150-360 | DE02, DE07, DE09, US02-US05, US07 |
| Faible | 48-120 | DE04-DE06, DE08, DE10-DE11, US01 |

## Formules spéciales

### US06 - Nombre de consommateurs
```
Points = (x * 50) - 50
```
- x = nombre de consommateurs différents
- 1 consommateur → 0 points
- 2 consommateurs → 50 points
- 5 consommateurs → 200 points
- Max théorique : 375 points (plafonné)

### US07 - Taux d'erreur
```
Points = (1 - (x / 100)) * 100
```
- x = taux d'erreur en pourcentage
- 0% d'erreurs → 100 points
- 10% d'erreurs → 90 points
- 50% d'erreurs → 50 points
- 100% d'erreurs → 0 points

## Affichage du score

### Score numérique
- Affiché en temps réel pendant le questionnaire
- Format : `XX.X / 100` ou `XX%`

### Ranking visuel
- Affichage de la lettre (A-E)
- Code couleur associé :
  - A : Vert foncé
  - B : Vert clair
  - C : Jaune/Orange
  - D : Orange foncé
  - E : Rouge

### Score par section
- Breakdown optionnel montrant le score par section
- Permet d'identifier les axes d'amélioration

## Implémentation

Le code de scoring se trouve dans `src/utils/scoring.ts`.

## Évolutions futures

- [ ] Historique des scores pour un projet
- [ ] Graphiques de progression
- [ ] Comparaison avec la moyenne des projets
- [ ] Export du détail du scoring
