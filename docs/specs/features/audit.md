# Feature: Audit Questionnaire

## Description

The audit questionnaire is the heart of the application. It evaluates the eco-design of an API by answering a series of questions organized by section.

## Data Source

The questionnaire comes from the official API Green Score Excel file (`48_CAT_Sustainable_API_GreenScore_V1-2.xlsx`) and is stored in `src/data/surveyQuestions.json`.

## Questionnaire Structure

### Sections

| Section | No. of questions | Focus |
|---------|--------------|-------|
| Architecture | 4 | Structural choices (event-driven, deployment, scalability) |
| Design | 11 | API design (format, cache, tokens, filters) |
| Usage | 7 | Operation (versioning, pagination, monitoring) |
| Logs | 1 | Log management |

**Total: 23 questions**

### Structure of a Question

```typescript
interface SurveyQuestion {
  id: string           // E.g.: "AR01", "DE05"
  section: string      // Architecture, Design, Usage, Logs
  question: string     // Short title
  description: string  // Detailed description
  tooltip: string      // Explanation and best practices
  points: number       // Weighting (48 to 600 points)
  formula?: string     // Optional formula for numeric questions
}
```

### Answer Types

1. **Boolean questions** (the majority)
   - Yes = points awarded
   - No = 0 points

2. **Questions with a formula** (US06, US07)
   - Numeric value entered
   - Points computed via the formula
   - Ex: US06 (Number of Consumers): `(x * 50) - 50`
   - Ex: US07 (Error rate): `(1 - (x / 100)) * 100`

## User Journey

1. The user selects an existing project or creates a new one
2. The questionnaire is displayed section by section
3. For each question:
   - The question and description are shown
   - A tooltip is available for more context
   - A Yes/No answer or a numeric input
4. The score updates in real time
5. At the end, the final score and ranking are displayed

## Business Rules

### Score Calculation

```
Score = (Points obtained / Maximum points) * 100
```

- Maximum points = sum of all the `points` of the questions
- Points obtained = sum of the points of positive answers + points computed via formulas

### Ranking Determination

| Score | Ranking |
|-------|---------|
| 80-100 | A |
| 60-79 | B |
| 40-59 | C |
| 20-39 | D |
| 0-19 | E |

## Key Questions by Impact

### Highest impact (600 points)
- **DE01**: Lightweight exchange format (JSON vs XML)
- **LO01**: Log retention aligned with business need

### High impact (375 points)
- **AR01**: Event Driven architecture
- **AR02**: API deployed close to the consumer
- **AR03**: Avoid duplicated APIs
- **AR04**: Scalable infrastructure
- **US06**: Number of consumers (reuse)

## Future Improvements

- [ ] Automatic saving of in-progress answers
- [ ] "Quick audit" mode with essential questions only
- [ ] Comparison between versions of the same project
- [ ] Personalized recommendations based on the answers
