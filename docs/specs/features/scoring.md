# Feature: Scoring System

## Description

The scoring system calculates the eco-design score in real time based on the survey answers.

## Calculation algorithm

### Step 1: Calculating points per question

For each answered question:

```typescript
function calculateQuestionPoints(question: SurveyQuestion, answer: Answer): number {
  if (typeof answer === 'boolean') {
    // Boolean question: points if true, 0 otherwise
    return answer ? question.points : 0
  }

  if (typeof answer === 'number' && question.formula) {
    // Question with a formula: evaluate the formula
    // E.g.: "(x * 50) - 50" with x = entered value
    return evaluateFormula(question.formula, answer)
  }

  return 0
}
```

### Step 2: Calculating the overall score

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

### Step 3: Assigning the ranking

The A–E ranking follows the official API Green Score grid, based on **raw points** (maximum achievable: 6000 points):

| Grade | Label | Raw points | Normalized score |
|-------|-------|------------|------------------|
| A | Excellent | ≥ 6000 | 100% |
| B | Acceptable | ≥ 3000 | 50–99% |
| C | Average | ≥ 2000 | 33–49% |
| D | Poor | ≥ 1000 | 17–32% |
| E | Very Poor | < 1000 | 0–16% |

```typescript
function getRankingScore(points: number): Ranking {
  if (points >= 6000) return 'A'
  if (points >= 3000) return 'B'
  if (points >= 2000) return 'C'
  if (points >= 1000) return 'D'
  return 'E'
}
```

> **Note**: the displayed score is normalized as a percentage of the maximum (`points / 6000 × 100`) for simplicity. The **letter**, however, is calculated on the **raw points**: an A therefore requires the maximum score (100%).

## Point distribution

### By section

| Section | Total points | % of score |
|---------|--------------|------------|
| Architecture | 1,500 | ~28% |
| Design | 2,400 | ~45% |
| Usage | 1,500 | ~28% |
| Logs | 600 | ~11% |

*Note: The percentages are approximate because some questions use formulas.*

### By impact level

| Level | Points | Questions |
|-------|--------|-----------|
| Very high | 600 | DE01, LO01 |
| High | 375-480 | AR01-AR04, DE03, US06 |
| Medium | 150-360 | DE02, DE07, DE09, US02-US05, US07 |
| Low | 48-120 | DE04-DE06, DE08, DE10-DE11, US01 |

## Special formulas

### US06 - Number of consumers
```
Points = (x * 50) - 50
```
- x = number of distinct consumers
- 1 consumer → 0 points
- 2 consumers → 50 points
- 5 consumers → 200 points
- Theoretical max: 375 points (capped)

### US07 - Error rate
```
Points = (1 - (x / 100)) * 100
```
- x = error rate as a percentage
- 0% errors → 100 points
- 10% errors → 90 points
- 50% errors → 50 points
- 100% errors → 0 points

## Score display

### Numeric score
- Displayed in real time during the questionnaire
- Format: `XX.X / 100` or `XX%`

### Visual ranking
- Displays the letter (A-E)
- Associated color code:
  - A: Dark green
  - B: Light green
  - C: Yellow/Orange
  - D: Dark orange
  - E: Red

### Score per section
- Optional breakdown showing the score per section
- Helps identify areas for improvement

## Implementation

The scoring code is located in `src/utils/apigreenscore-scoring.ts` (and `src/utils/eroom-scoring.ts` for EROOM).

## Future improvements

- [ ] Score history for a project
- [ ] Progress charts
- [ ] Comparison with the average of all projects
- [ ] Export of the scoring details
